const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { computeVectors, getUserProfile, cosineSimilarity } = require('../utils/tfidf');

/**
 * GET /api/recommendations
 * Returns top 5 recommended events based on the user's past bookings using TF-IDF.
 * If the user has no past bookings (cold start), returns the top 5 most booked events (trending).
 */
exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch all events to build the corpus
        // Only active events that have a future date or just all events (let's say all for now)
        const allEvents = await Event.find({});
        if (allEvents.length === 0) {
            return res.json([]);
        }

        // 2. Fetch the user's past bookings (pending, waitlisted, or confirmed)
        const userBookings = await Booking.find({ userId, status: { $ne: 'cancelled' } }).populate('eventId');
        
        // Filter out any bookings where the event was deleted from DB
        const bookedEventIds = new Set(userBookings.map(b => b.eventId?._id?.toString()).filter(Boolean));

        // 3. Handle COLD START (Trending fallback)
        if (bookedEventIds.size === 0) {
            console.log(`[Recommendations] Cold start for user ${userId}. Returning trending events.`);
            // Aggregate top most booked events overall
            const trending = await Booking.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $group: { _id: "$eventId", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);

            const trendingIds = trending.map(t => t._id);
            // If no bookings exist at all in system, just return latest 5 events
            const fallbackEvents = trendingIds.length > 0 
                ? await Event.find({ _id: { $in: trendingIds } }) 
                : await Event.find({}).sort({ createdAt: -1 }).limit(5);

            return res.json(fallbackEvents);
        }

        // 4. Build Corpus: Combine Title, Category, and Description
        const corpus = allEvents.map(e => ({
            id: e._id.toString(),
            text: `${e.title} ${e.category} ${e.description}`
        }));

        // 5. Compute TF-IDF Vectors for the entire corpus
        const { vectors } = computeVectors(corpus);

        // 6. Build the User's Interest Profile
        // Get the TF-IDF vectors of the events the user has booked
        const userEventVectors = Array.from(bookedEventIds).map(eventId => vectors[eventId]).filter(Boolean);
        const userProfile = getUserProfile(userEventVectors);

        // 7. Calculate Cosine Similarity for Unbooked Events
        const recommendations = [];
        
        allEvents.forEach(event => {
            const eventId = event._id.toString();
            // Don't recommend events they already booked
            if (!bookedEventIds.has(eventId)) {
                const eventVector = vectors[eventId];
                const similarityScore = cosineSimilarity(userProfile, eventVector);
                
                recommendations.push({
                    event,
                    score: similarityScore
                });
            }
        });

        // 8. Sort by highest similarity and return top 5
        recommendations.sort((a, b) => b.score - a.score);
        
        const top5 = recommendations.slice(0, 5).map(r => {
            // Optional: Attach score for debugging/UI purposes if wanted, but returning just event object is cleaner
            return { ...r.event.toObject(), _similarityScore: r.score };
        });

        console.log(`[Recommendations] Served TF-IDF recommendations for user ${userId}`);
        res.json(top5);

    } catch (error) {
        console.error('[Recommendations] Error:', error.message);
        res.status(500).json({ message: 'Failed to generate recommendations', error: error.message });
    }
};
