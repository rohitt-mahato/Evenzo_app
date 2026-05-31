const Booking = require('../models/Booking');
const Event = require('../models/Event');

exports.getRevenueOverTime = async (req, res) => {
    try {
        const revenue = await Booking.aggregate([
            { $match: { status: 'confirmed', paymentStatus: 'paid' } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$bookedAt" } },
                    totalRevenue: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json(revenue);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching revenue over time', error: error.message });
    }
};

exports.getBookingsPerEvent = async (req, res) => {
    try {
        const bookingsPerEvent = await Booking.aggregate([
            {
                $group: {
                    _id: "$eventId",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "_id",
                    as: "event"
                }
            },
            { $unwind: "$event" },
            {
                $project: {
                    title: "$event.title",
                    count: 1
                }
            },
            { $sort: { count: -1 } }
        ]);
        res.json(bookingsPerEvent);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings per event', error: error.message });
    }
};

exports.getCancellationRate = async (req, res) => {
    try {
        const stats = await Booking.aggregate([
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    cancelledBookings: {
                        $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalBookings: 1,
                    cancelledBookings: 1,
                    cancellationRate: {
                        $cond: [
                            { $eq: ["$totalBookings", 0] },
                            0,
                            { $multiply: [{ $divide: ["$cancelledBookings", "$totalBookings"] }, 100] }
                        ]
                    }
                }
            }
        ]);
        res.json(stats[0] || { totalBookings: 0, cancelledBookings: 0, cancellationRate: 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cancellation rate', error: error.message });
    }
};

exports.getPeakBookingHours = async (req, res) => {
    try {
        const peakHours = await Booking.aggregate([
            {
                $group: {
                    _id: { $hour: "$bookedAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        // Format to 24h readable strings
        const formatted = peakHours.map(item => ({
            hour: `${item._id}:00`,
            count: item.count
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching peak booking hours', error: error.message });
    }
};

exports.getBookingsByCategory = async (req, res) => {
    try {
        const categories = await Booking.aggregate([
            {
                $lookup: {
                    from: "events",
                    localField: "eventId",
                    foreignField: "_id",
                    as: "event"
                }
            },
            { $unwind: "$event" },
            {
                $group: {
                    _id: "$event.category",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    category: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings by category', error: error.message });
    }
};
