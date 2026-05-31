const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { getIO } = require('./socket');

const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * In-memory map of active seat lock timers
 * Key: bookingId (string), Value: timerId (from setTimeout)
 */
const activeLocks = new Map();

/**
 * Lock a seat for a booking — starts a 10-minute auto-release timer.
 * If the timer fires, the booking is cancelled, the seat is restored,
 * and `seat:released` is emitted to the event room.
 *
 * @param {string} bookingId - The booking's _id
 * @param {string} eventId - The event's _id (for room targeting)
 */
const lockSeat = (bookingId, eventId) => {
    // Clear any existing timer for this booking (safety)
    clearLock(bookingId);

    const timerId = setTimeout(async () => {
        try {
            activeLocks.delete(bookingId.toString());

            const booking = await Booking.findById(bookingId);
            if (!booking || booking.status !== 'pending') return;

            // Cancel the booking
            booking.status = 'cancelled';
            booking.seatLockedAt = null;
            await booking.save();

            // Handle seat release and waitlist promotion
            const { handleSeatAvailable } = require('./seatLock');
            await handleSeatAvailable(eventId, bookingId, 'lock_expired', 'Seat lock expired after 10 minutes');

            console.log(`[SeatLock] Lock expired — booking ${bookingId} cancelled`);
        } catch (error) {
            console.error(`[SeatLock] Error releasing lock for booking ${bookingId}:`, error.message);
        }
    }, LOCK_DURATION_MS);

    activeLocks.set(bookingId.toString(), timerId);
    console.log(`[SeatLock] Seat locked for booking ${bookingId} (10-min timer started)`);
};

/**
 * Clear an active seat lock timer (called on confirm or manual cancel)
 * @param {string} bookingId
 */
const clearLock = (bookingId) => {
    const key = bookingId.toString();
    if (activeLocks.has(key)) {
        clearTimeout(activeLocks.get(key));
        activeLocks.delete(key);
        console.log(`[SeatLock] Lock cleared for booking ${bookingId}`);
    }
};

/**
 * Recover stale seat locks on server startup.
 * Finds pending bookings with seatLockedAt older than 10 minutes
 * and releases their seats (handles server restart scenario).
 */
const recoverStaleLocks = async () => {
    try {
        const cutoff = new Date(Date.now() - LOCK_DURATION_MS);
        const staleBookings = await Booking.find({
            status: 'pending',
            seatLockedAt: { $ne: null, $lt: cutoff }
        });

        if (staleBookings.length === 0) {
            console.log('[SeatLock] No stale locks to recover');
            return;
        }

        console.log(`[SeatLock] Recovering ${staleBookings.length} stale lock(s)...`);

        for (const booking of staleBookings) {
            booking.status = 'cancelled';
            booking.seatLockedAt = null;
            await booking.save();

            const { handleSeatAvailable } = require('./seatLock');
            await handleSeatAvailable(booking.eventId, booking._id, 'stale_lock_recovered', 'Stale lock recovered');

            console.log(`[SeatLock] Recovered stale lock — booking ${booking._id} cancelled`);
        }

        console.log(`[SeatLock] Recovery complete`);
    } catch (error) {
        console.error('[SeatLock] Recovery error:', error.message);
    }
};

/**
 * Handles the logic when a seat becomes available (via cancel or lock expire).
 * Checks the Redis waitlist. If someone is waiting, auto-promotes them.
 * Otherwise, restores the seat count.
 */
const handleSeatAvailable = async (eventId, cancelledBookingId, reason, message) => {
    try {
        const event = await Event.findById(eventId);
        if (!event) return;

        const { popWaitlist } = require('./waitlist');
        const { sendWaitlistPromotionEmail } = require('./email');
        const io = getIO();

        const promotedUserId = await popWaitlist(eventId);

        if (promotedUserId) {
            // Find the waitlisted booking
            const waitlistBooking = await Booking.findOne({
                eventId,
                userId: promotedUserId,
                status: 'waitlisted'
            }).populate('userId', 'name email');

            if (waitlistBooking) {
                // Promote to pending and lock seat
                waitlistBooking.status = 'pending';
                waitlistBooking.seatLockedAt = new Date();
                await waitlistBooking.save();

                lockSeat(waitlistBooking._id, eventId);

                // Notify via Socket
                io.to(`user:${promotedUserId}`).emit('waitlist:promoted', {
                    bookingId: waitlistBooking._id.toString(),
                    eventId: eventId.toString(),
                    userName: waitlistBooking.userId.name,
                    message: `Good news! A spot opened up and your booking is next in line for confirmation.`
                });

                // Notify via Email
                await sendWaitlistPromotionEmail(waitlistBooking.userId.email, waitlistBooking.userId.name, event.title);

                console.log(`[Waitlist] Promoted user ${waitlistBooking.userId.name} from Redis waitlist for event ${eventId}`);
                return; // Seat transfers to promoted user, availableSeats remains unchanged
            }
        }

        // No waitlist, just restore the seat
        event.availableSeats += 1;
        await event.save();

        io.to(`event:${eventId}`).emit('seat:released', {
            eventId: eventId.toString(),
            bookingId: cancelledBookingId ? cancelledBookingId.toString() : null,
            availableSeats: event.availableSeats,
            reason,
            message
        });

    } catch (error) {
        console.error('[SeatLock] Error in handleSeatAvailable:', error.message);
    }
};

module.exports = { lockSeat, clearLock, recoverStaleLocks, handleSeatAvailable, LOCK_DURATION_MS };
