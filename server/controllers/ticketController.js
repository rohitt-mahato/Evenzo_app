const Booking = require('../models/Booking');

/**
 * Verify a ticket at the event gate
 * POST /api/tickets/verify
 * Body: { token: string }
 * 
 * Checks the ticket token against the database, validates booking status,
 * and prevents ticket reuse by marking it as used on first scan.
 */
exports.verifyTicket = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const booking = await Booking.findOne({ ticketToken: token })
            .populate('eventId', 'title date location')
            .populate('userId', 'name email');

        if (!booking) {
            return res.status(404).json({ 
                valid: false,
                message: 'Invalid ticket — no booking found for this token' 
            });
        }

        if (booking.status !== 'confirmed') {
            return res.status(400).json({ 
                valid: false,
                message: `Ticket cannot be used — booking status is "${booking.status}"` 
            });
        }

        if (booking.ticketUsed) {
            return res.status(400).json({ 
                valid: false,
                message: 'Ticket has already been used',
                usedAt: booking.ticketUsedAt
            });
        }

        // Mark ticket as used
        booking.ticketUsed = true;
        booking.ticketUsedAt = new Date();
        await booking.save();

        res.json({
            valid: true,
            message: 'Ticket verified successfully — entry granted',
            booking: {
                id: booking._id,
                event: {
                    title: booking.eventId.title,
                    date: booking.eventId.date,
                    location: booking.eventId.location
                },
                attendee: {
                    name: booking.userId.name,
                    email: booking.userId.email
                },
                verifiedAt: booking.ticketUsedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
