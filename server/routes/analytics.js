const express = require('express');
const router = express.Router();
const { 
    getRevenueOverTime, 
    getBookingsPerEvent, 
    getCancellationRate, 
    getPeakBookingHours, 
    getBookingsByCategory 
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/auth');

router.get('/revenue', protect, admin, getRevenueOverTime);
router.get('/events', protect, admin, getBookingsPerEvent);
router.get('/cancellations', protect, admin, getCancellationRate);
router.get('/peak-hours', protect, admin, getPeakBookingHours);
router.get('/categories', protect, admin, getBookingsByCategory);

module.exports = router;
