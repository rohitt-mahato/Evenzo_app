const Booking = require('../models/Booking');

/**
 * Join the waitlist for an event
 * @param {string} eventId
 * @param {string} userId
 */
const joinWaitlist = async (eventId, userId) => {
    console.log(`[Waitlist] User ${userId} joined waitlist for event ${eventId}`);
};

/**
 * Peek at the first user in the waitlist without removing them
 * @param {string} eventId
 * @returns {Promise<string|null>} Returns the userId or null if empty
 */
const peekWaitlist = async (eventId) => {
    const booking = await Booking.findOne({ eventId, status: 'waitlisted' }).sort({ createdAt: 1 });
    return booking ? booking.userId.toString() : null;
};

/**
 * Pop the first user from the waitlist (the one who waited the longest)
 * @param {string} eventId
 * @returns {Promise<string|null>} Returns the userId or null if empty
 */
const popWaitlist = async (eventId) => {
    const booking = await Booking.findOne({ eventId, status: 'waitlisted' }).sort({ createdAt: 1 });
    if (booking) {
        console.log(`[Waitlist] Popped user ${booking.userId} from event ${eventId} waitlist`);
        return booking.userId.toString();
    }
    return null;
};

module.exports = { joinWaitlist, peekWaitlist, popWaitlist };
