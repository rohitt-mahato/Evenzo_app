const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profilePicture: {
        type: String,
        default: ''
    },
    isVerified: { type: Boolean, default: false },
    phone: { type: String },
    city: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
