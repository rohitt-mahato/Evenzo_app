const express = require('express');
const router = express.Router();
const { verifyTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

// POST /api/tickets/verify — scan QR at gate to verify and mark ticket as used
router.post('/verify', protect, verifyTicket);

module.exports = router;
