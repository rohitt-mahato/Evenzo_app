const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Booking Confirmed: ${eventTitle}`,
            html: `
        <h2>Hi ${userName}!</h2>
        <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
        <p>Thank you for choosing Evenzo.</p>
      `
        };
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to', userEmail);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendOTPEmail = async (userEmail, otp, type) => {
    try {
        const title = type === 'account_verification' ? 'Verify your Evenzo Account' : 'Evenzo Booking Verification';
        const msg = type === 'account_verification'
            ? 'Please use the following OTP to verify your new Evenzo account.'
            : 'Please use the following OTP to verify and confirm your event booking.';

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: title,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #111;">${title}</h2>
                    <p style="color: #555; font-size: 16px;">${msg}</p>
                    <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${userEmail} for ${type}`);
    } catch (error) {
        console.error('Error sending OTP email:', error);
    }
};

const sendTicketEmail = async (userEmail, userName, eventTitle, pdfBuffer) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Your Ticket: ${eventTitle} — Evenzo`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                    <h2 style="color: #6C3CE1;">Your Ticket is Ready! 🎉</h2>
                    <p>Hi <strong>${userName}</strong>,</p>
                    <p>Your booking for <strong>${eventTitle}</strong> has been confirmed.</p>
                    <p>Please find your e-ticket attached as a PDF. Present the QR code at the venue entrance for check-in.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="color: #999; font-size: 12px;">This is an automated email from Evenzo. Please do not reply.</p>
                </div>
            `,
            attachments: [
                {
                    filename: `evenzo-ticket-${eventTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };
        await transporter.sendMail(mailOptions);
        console.log(`Ticket email sent to ${userEmail} for ${eventTitle}`);
    } catch (error) {
        console.error('Error sending ticket email:', error);
    }
};

const sendWaitlistPromotionEmail = async (userEmail, userName, eventTitle) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `You're off the waitlist! 🎉 - ${eventTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                    <h2 style="color: #6C3CE1;">Great news!</h2>
                    <p>Hi <strong>${userName}</strong>,</p>
                    <p>A spot just opened up for <strong>${eventTitle}</strong> and you're next in line!</p>
                    <p>Your booking has been automatically promoted. The seat is reserved for you for the next <strong>10 minutes</strong>.</p>
                    <p>Please log in or contact the administrator to finalize your payment and confirm your booking before the timer expires.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="color: #999; font-size: 12px;">This is an automated email from Evenzo. Please do not reply.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Waitlist promotion email sent to ${userEmail} for ${eventTitle}`);
    } catch (error) {
        console.error('Error sending waitlist promotion email:', error);
    }
};

const sendPasswordResetEmail = async (userEmail, resetUrl) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Password Reset Request — Evenzo`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                    <h2 style="color: #6C3CE1;">Password Reset</h2>
                    <p>You requested a password reset. Please click the link below to set a new password.</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #6C3CE1; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 15px;">Reset Password</a>
                    <p style="margin-top: 20px; color: #555;">If you did not request this, please ignore this email.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
    }
};

module.exports = { sendBookingEmail, sendOTPEmail, sendTicketEmail, sendWaitlistPromotionEmail, sendPasswordResetEmail };
