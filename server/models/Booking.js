const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    status: { type: String, enum: ['confirmed', 'cancelled', 'pending', 'waitlisted'], default: 'pending' },
    paymentStatus: { type: String, enum: ['paid', 'not_paid'], default: 'not_paid' },
    amount: { type: Number, required: true },
    bookedAt: { type: Date, default: Date.now },
    seatLockedAt: { type: Date, default: null },
    ticketToken: { type: String, unique: true, sparse: true },
    ticketUsed: { type: Boolean, default: false },
    ticketUsedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
