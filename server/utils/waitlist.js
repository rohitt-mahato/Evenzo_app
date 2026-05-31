const redisClient = require('./redis');

/**
 * Join the waitlist for an event
 * Uses ZADD with the current timestamp as the score (FIFO)
 * @param {string} eventId
 * @param {string} userId
 */
const joinWaitlist = async (eventId, userId) => {
    const key = `waitlist:${eventId}`;
    const score = Date.now();
    await redisClient.zAdd(key, [{ score, value: userId.toString() }]);
    console.log(`[Waitlist] User ${userId} joined waitlist for event ${eventId}`);
};

/**
 * Peek at the first user in the waitlist without removing them
 * @param {string} eventId
 * @returns {Promise<string|null>} Returns the userId or null if empty
 */
const peekWaitlist = async (eventId) => {
    const key = `waitlist:${eventId}`;
    const result = await redisClient.zRange(key, 0, 0);
    return result.length > 0 ? result[0] : null;
};

/**
 * Pop the first user from the waitlist (the one who waited the longest)
 * Uses ZPOPMIN
 * @param {string} eventId
 * @returns {Promise<string|null>} Returns the userId or null if empty
 */
const popWaitlist = async (eventId) => {
    const key = `waitlist:${eventId}`;
    const result = await redisClient.zPopMin(key, 1);
    // result format: { value: 'userId', score: timestamp }
    if (result && result.length > 0) {
        const userId = result[0].value;
        console.log(`[Waitlist] Popped user ${userId} from event ${eventId} waitlist`);
        return userId;
    }
    return null;
};

module.exports = { joinWaitlist, peekWaitlist, popWaitlist };
