const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'user', // Hardcoded to prevent frontend passing role
            isVerified: false
        });

        const otp = generateOTP();
        await OTP.create({ email, otp, action: 'account_verification' });
        await sendOTPEmail(email, otp, 'account_verification');

        res.status(201).json({
            message: 'OTP sent to email. Please verify.',
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.isVerified && user.role !== 'admin') {
            const otp = generateOTP();
            await OTP.findOneAndDelete({ email: user.email, action: 'account_verification' });
            await OTP.create({ email: user.email, otp, action: 'account_verification' });
            await sendOTPEmail(user.email, otp, 'account_verification');
            return res.status(403).json({ message: 'Account not verified', needsVerification: true, email: user.email });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const validOTP = await OTP.findOne({ email, otp, action: 'account_verification' });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
        await OTP.deleteOne({ _id: validOTP._id }); // Delete OTP after usage

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            // Return success even if user not found to prevent email enumeration
            return res.json({ message: 'If that email is registered, we have sent a reset link.' });
        }

        // Generate token
        const resetToken = require('crypto').randomBytes(20).toString('hex');
        
        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = require('crypto').createHash('sha256').update(resetToken).digest('hex');
        
        // Set expire
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        
        await user.save();

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        const { sendPasswordResetEmail } = require('../utils/email');
        await sendPasswordResetEmail(user.email, resetUrl);

        res.json({ message: 'If that email is registered, we have sent a reset link.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to process password reset request.' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = require('crypto')
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reset password.' });
    }
};
