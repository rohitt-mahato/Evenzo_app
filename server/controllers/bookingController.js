const Booking = require('../models/Booking');
const Event = require('../models/Event');
const OTP = require('../models/OTP');
const QRCode = require('qrcode');
const { sendBookingEmail, sendOTPEmail, sendTicketEmail } = require('../utils/email');
const { generateTicketToken, generateTicketPDF } = require('../utils/ticket');
const { getIO } = require('../utils/socket');
const { lockSeat, clearLock, handleSeatAvailable } = require('../utils/seatLock');
const { joinWaitlist } = require('../utils/waitlist');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendBookingOTP = async (req, res) => {
    try {
        const otp = generateOTP();
        await OTP.findOneAndDelete({ email: req.user.email, action: 'event_booking' });
        await OTP.create({ email: req.user.email, otp, action: 'event_booking' });
        await sendOTPEmail(req.user.email, otp, 'event_booking');
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

exports.bookEvent = async (req, res) => {
    try {
        const { eventId, otp } = req.body;

        // Verify OTP explicitly before proceeding
        const validOTP = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });
        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP for booking' });
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const existingBooking = await Booking.findOne({ userId: req.user.id, eventId });
        if (existingBooking && existingBooking.status !== 'cancelled') {
            return res.status(400).json({ message: 'Already booked, pending, or waitlisted' });
        }

        // Waitlist logic if no seats available
        if (event.availableSeats <= 0) {
            const booking = await Booking.create({
                userId: req.user.id,
                eventId,
                status: 'waitlisted',
                paymentStatus: 'not_paid',
                amount: event.ticketPrice
            });
            await OTP.deleteOne({ _id: validOTP._id });

            // Join Redis waitlist
            await joinWaitlist(eventId, req.user.id);

            return res.status(201).json({ message: 'Event is full — you have been added to the waitlist', booking });
        }

        // Immediately lock the seat (decrement availableSeats to prevent overselling)
        event.availableSeats -= 1;
        await event.save();

        const booking = await Booking.create({
            userId: req.user.id,
            eventId,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: event.ticketPrice,
            seatLockedAt: new Date()
        });

        await OTP.deleteOne({ _id: validOTP._id }); // cleanup

        // Start 10-minute auto-release timer
        lockSeat(booking._id, eventId);

        // Emit seat:locked to event room
        try {
            const io = getIO();
            io.to(`event:${eventId}`).emit('seat:locked', {
                eventId: eventId.toString(),
                bookingId: booking._id.toString(),
                availableSeats: event.availableSeats,
                lockedBy: req.user.id,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
                message: 'A seat has been locked for checkout'
            });
        } catch (socketErr) {
            console.error('[Booking] Socket emit error:', socketErr.message);
        }

        res.status(201).json({ message: 'Booking request submitted — seat locked for 10 minutes', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body; // 'paid' or 'not_paid'
        const booking = await Booking.findById(req.params.id).populate('userId').populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status === 'confirmed') return res.status(400).json({ message: 'Booking is already confirmed' });
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Cannot confirm a cancelled booking' });

        booking.status = 'confirmed';
        if (paymentStatus) {
            booking.paymentStatus = paymentStatus;
        }

        // Clear the seat lock timer (seat stays deducted permanently now)
        clearLock(booking._id);
        booking.seatLockedAt = null;

        // Generate QR ticket
        const token = generateTicketToken();
        booking.ticketToken = token;
        await booking.save();

        // Generate QR code and PDF ticket
        const qrDataURL = await QRCode.toDataURL(token, { width: 300, margin: 1 });
        const pdfBuffer = await generateTicketPDF({
            eventTitle: booking.eventId.title,
            eventDate: booking.eventId.date,
            eventLocation: booking.eventId.location,
            userName: booking.userId.name,
            userEmail: booking.userId.email,
            ticketToken: token,
            qrDataURL
        });

        // Email the ticket PDF
        await sendTicketEmail(
            booking.userId.email,
            booking.userId.name,
            booking.eventId.title,
            pdfBuffer
        );

        // Emit booking:confirmed to admin room and user room
        try {
            const io = getIO();
            const payload = {
                bookingId: booking._id.toString(),
                eventId: booking.eventId._id.toString(),
                eventTitle: booking.eventId.title,
                userName: booking.userId.name,
                userEmail: booking.userId.email,
                confirmedAt: new Date().toISOString(),
                message: `Booking confirmed for ${booking.userId.name}`
            };
            io.to('admin').emit('booking:confirmed', payload);
            io.to(`user:${booking.userId._id}`).emit('booking:confirmed', payload);
        } catch (socketErr) {
            console.error('[Booking] Socket emit error:', socketErr.message);
        }

        res.json({ message: 'Booking confirmed — ticket emailed', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = req.user.role === 'admin'
            ? await Booking.find().populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 })
            : await Booking.find({ userId: req.user.id }).populate('eventId').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

        const wasConfirmed = booking.status === 'confirmed';
        const wasPending = booking.status === 'pending';

        // Clear any active seat lock timer
        clearLock(booking._id);

        booking.status = 'cancelled';
        booking.seatLockedAt = null;
        await booking.save();

        // Restore seat and handle waitlist promotion if it was confirmed OR pending
        if (wasConfirmed || wasPending) {
            await handleSeatAvailable(
                booking.eventId.toString(), 
                booking._id.toString(), 
                wasPending ? 'user_cancelled_pending' : 'booking_cancelled',
                'A seat has been released'
            );
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
