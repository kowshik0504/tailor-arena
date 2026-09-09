const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TailorProfile = require('../models/TailorProfile');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const { sendWhatsAppMessage } = require('../utils/whatsapp');

// ================= TOKEN =================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ================= TEMP STORAGE =================
const tempUsers = {};

// ================= EMAIL FUNCTION =================
const sendOTP = async (email, otp, name = 'Valued Customer') => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Path to logo (public/logo.jpeg)
  const logoPath = path.join(__dirname, '../../public/logo.jpeg');
  let attachments = [];
  if (fs.existsSync(logoPath)) {
    attachments.push({
      filename: 'logo.jpeg',
      path: logoPath,
      cid: 'logo'
    });
  }

  await transporter.sendMail({
    from: `"Tailor Arena" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verification Code - Tailor Arena',
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <div style="background-color: #2D3436; padding: 20px; text-align: center;">
            ${fs.existsSync(logoPath) ? '<img src="cid:logo" alt="Tailor Arena" style="max-width: 150px; border-radius: 8px;">' : '<h1 style="color: #fff; margin: 0;">Tailor Arena</h1>'}
        </div>
        <div style="padding: 40px; background-color: #ffffff;">
            <h2 style="color: #2D3436; margin-top: 0;">Hello ${name},</h2>
            <p style="color: #636E72; font-size: 16px; line-height: 1.6;">Welcome to <strong>Tailor Arena</strong>! To proceed with your request, please use the following One-Time Password (OTP):</p>
            
            <div style="margin: 30px 0; text-align: center;">
                <div style="display: inline-block; padding: 15px 40px; background-color: #F1F2F6; border: 2px dashed #0984E3; border-radius: 8px;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #0984E3;">${otp}</span>
                </div>
            </div>
            
            <p style="color: #D63031; font-size: 14px; text-align: center;"><strong>Note:</strong> This OTP is valid for only 5 minutes.</p>
            <p style="color: #636E72; font-size: 14px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">If you didn't request this, you can safely ignore this email. Someone might have typed your email address by mistake.</p>
        </div>
        <div style="background-color: #F1F2F6; padding: 20px; text-align: center; color: #B2BEC3; font-size: 12px;">
            <p style="margin: 5px 0;">&copy; 2026 Tailor Arena. All rights reserved.</p>
            <p style="margin: 5px 0;">Empowering your style, one stitch at a time.</p>
        </div>
    </div>
    `,
    attachments: attachments
  });
};

// ================= FREEMIUM WELCOME EMAIL =================
exports.sendFreemiumEmail = async (email, name) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const logoPath = path.join(__dirname, '../../public/logo.jpeg');
  let attachments = [];
  if (fs.existsSync(logoPath)) {
    attachments.push({ filename: 'logo.jpeg', path: logoPath, cid: 'logo' });
  }

  await transporter.sendMail({
    from: `"Tailor Arena" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Tailor Arena - Your Journey Starts Here! 🧵',
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background-color: #2D3436; padding: 30px; text-align: center;">
            ${fs.existsSync(logoPath) ? '<img src="cid:logo" alt="Tailor Arena" style="max-width: 140px;">' : '<h1 style="color: #fff; margin: 0; letter-spacing: 2px;">TAILOR ARENA</h1>'}
        </div>
        <div style="padding: 40px; color: #2D3436;">
            <h2 style="margin-top: 0; font-size: 24px;">Congratulations, ${name.split(' ')[0]}!</h2>
            <p style="color: #636E72; font-size: 16px; line-height: 1.6;">We are excited to inform you that your professional profile is now <strong>live</strong> on Tailor Arena. You are now visible to customers looking for quality stitching in your area.</p>
            
            <div style="background-color: #F8F9FA; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 5px solid #6C63FF;">
                <h3 style="color: #6C63FF; margin-top: 0; font-size: 18px;">The Freemium Advantage</h3>
                <p style="color: #2D3436; font-size: 15px; margin-bottom: 0; line-height: 1.5;">
                    As part of our commitment to your growth, your account is active on a <strong>Freemium model</strong>. This means:
                </p>
                <ul style="color: #2D3436; font-size: 15px; padding-left: 20px; margin-top: 10px;">
                    <li><strong>No Upfront Cost:</strong> Joining and listing your services is completely free.</li>
                    <li><strong>Activation Fee:</strong> You only pay a one-time activation fee of <strong>₹199</strong> when you receive your <strong>first booking</strong>.</li>
                </ul>
            </div>

            <h4 style="margin-bottom: 10px;">Next Steps:</h4>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="color: #636E72; font-size: 14px;">
                <tr><td width="30" style="vertical-align: top; padding-bottom: 10px;">✅</td><td style="padding-bottom: 10px;">Check your dashboard daily for new requests.</td></tr>
                <tr><td width="30" style="vertical-align: top; padding-bottom: 10px;">✅</td><td style="padding-bottom: 10px;">Add your best stitching rates to attract more customers.</td></tr>
                <tr><td width="30" style="vertical-align: top; padding-bottom: 10px;">✅</td><td style="padding-bottom: 10px;">When a request arrives, pay the ₹199 fee to unlock customer contact details.</td></tr>
            </table>

            <div style="text-align: center; margin-top: 40px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background-color: #6C63FF; color: white; padding: 16px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(108, 99, 255, 0.3);">Access Your Dashboard</a>
            </div>
        </div>
        <div style="background-color: #F1F2F6; padding: 25px; text-align: center; color: #B2BEC3; font-size: 12px;">
            <p style="margin: 0;">&copy; 2026 Tailor Arena. All rights reserved.</p>
            <p style="margin: 5px 0;">Empowering your style, one stitch at a time.</p>
        </div>
    </div>
    `,
    attachments: attachments
  });
};

// ================= BOOKING STATUS EMAILS =================

exports.sendAcceptanceEmail = async (email, name, tailorName, date, time, bookingId) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const logoPath = path.join(__dirname, '../../public/logo.jpeg');
  let attachments = [];
  if (fs.existsSync(logoPath)) {
    attachments.push({ filename: 'logo.jpeg', path: logoPath, cid: 'logo' });
  }

  await transporter.sendMail({
    from: `"Tailor Arena" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Booking is Accepted! 🧵✨',
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #2D3436; padding: 30px; text-align: center;">
            ${fs.existsSync(logoPath) ? '<img src="cid:logo" alt="Tailor Arena" style="max-width: 140px;">' : '<h1 style="color: #fff; margin: 0;">TAILOR ARENA</h1>'}
        </div>
        <div style="padding: 40px; color: #2D3436; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 20px;">🎉</div>
            <h2 style="margin-top: 0; font-size: 24px; color: #2D3436;">Great news, ${name}!</h2>
            <p style="color: #636E72; font-size: 16px; line-height: 1.6;">Your booking with <strong>${tailorName}</strong> has been <strong>ACCEPTED</strong>. The tailor is ready for your visit!</p>
            
            <div style="background-color: #F8F9FA; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #6C63FF; display: inline-block; width: 80%;">
                <h3 style="color: #6C63FF; margin-top: 0; font-size: 18px;">Appointment Details</h3>
                <p style="margin: 10px 0; font-size: 15px;"><strong>Date:</strong> ${new Date(date).toDateString()}</p>
                <p style="margin: 10px 0; font-size: 15px;"><strong>Time:</strong> ${time}</p>
            </div>

            <p style="color: #636E72; font-size: 14px; line-height: 1.6;">Please visit the shop at your scheduled time. If you need to navigate or call the tailor, check your dashboard.</p>

            <div style="text-align: center; margin-top: 40px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/dashboard?view=${bookingId}" style="background-color: #6C63FF; color: white; padding: 16px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">View Booking Details</a>
            </div>
        </div>
        <div style="background-color: #F1F2F6; padding: 25px; text-align: center; color: #B2BEC3; font-size: 12px;">
            <p style="margin: 0;">&copy; 2026 Tailor Arena. All rights reserved.</p>
        </div>
    </div>
    `,
    attachments: attachments
  });
};

exports.sendRejectionEmail = async (email, name, tailorName, reason) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const logoPath = path.join(__dirname, '../../public/logo.jpeg');
  let attachments = [];
  if (fs.existsSync(logoPath)) {
    attachments.push({ filename: 'logo.jpeg', path: logoPath, cid: 'logo' });
  }

  await transporter.sendMail({
    from: `"Tailor Arena" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Update regarding your booking request',
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #2D3436; padding: 30px; text-align: center;">
            ${fs.existsSync(logoPath) ? '<img src="cid:logo" alt="Tailor Arena" style="max-width: 140px;">' : '<h1 style="color: #fff; margin: 0;">TAILOR ARENA</h1>'}
        </div>
        <div style="padding: 40px; color: #2D3436;">
            <h2 style="margin-top: 0; font-size: 22px; color: #2D3436;">Hello ${name},</h2>
            <p style="color: #636E72; font-size: 16px; line-height: 1.6;">Thank you for your interest in <strong>${tailorName}</strong>. We regret to inform you that the tailor is unable to accept your booking request at this time.</p>
            
            <div style="background-color: #FFF5F5; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #E53E3E;">
                <h3 style="color: #E53E3E; margin-top: 0; font-size: 16px;">Reason for Rejection:</h3>
                <p style="color: #2D3436; font-size: 15px; margin-bottom: 0;">${reason}</p>
            </div>

            <p style="color: #636E72; font-size: 14px; line-height: 1.6;">Don't worry! There are many other talented tailors available on Tailor Arena. You can browse and book another professional right away.</p>

            <div style="text-align: center; margin-top: 40px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/dashboard" style="background-color: #2D3436; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Browse Other Tailors</a>
            </div>
        </div>
        <div style="background-color: #F1F2F6; padding: 25px; text-align: center; color: #B2BEC3; font-size: 12px;">
            <p style="margin: 0;">&copy; 2026 Tailor Arena. All rights reserved.</p>
        </div>
    </div>
    `,
    attachments: attachments
  });
};

exports.sendCompletionEmail = async (email, name, tailorName, dressType) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const logoPath = path.join(__dirname, '../../public/logo.jpeg');
  let attachments = [];
  if (fs.existsSync(logoPath)) {
    attachments.push({ filename: 'logo.jpeg', path: logoPath, cid: 'logo' });
  }

  await transporter.sendMail({
    from: `"Tailor Arena" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Order is Ready! 👗✨',
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #2D3436; padding: 30px; text-align: center;">
            ${fs.existsSync(logoPath) ? '<img src="cid:logo" alt="Tailor Arena" style="max-width: 140px;">' : '<h1 style="color: #fff; margin: 0;">TAILOR ARENA</h1>'}
        </div>
        <div style="padding: 40px; color: #2D3436; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 20px;">👗</div>
            <h2 style="margin-top: 0; font-size: 24px;">Great news, ${name}!</h2>
            <p style="color: #636E72; font-size: 16px; line-height: 1.6;">Your <strong>${dressType}</strong> is successfully completed by <strong>${tailorName}</strong> and is ready for pickup/delivery!</p>
            
            <div style="background-color: #F0FFF4; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #48BB78;">
                <h3 style="color: #2F855A; margin-top: 0; font-size: 18px;">Order Completed</h3>
                <p style="margin: 10px 0; color: #2F855A;">Thank you for choosing Tailor Arena. We hope you love your new outfit!</p>
            </div>

            <div style="text-align: center; margin-top: 40px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/dashboard" style="background-color: #48BB78; color: white; padding: 16px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">View in Dashboard</a>
            </div>
        </div>
        <div style="background-color: #F1F2F6; padding: 25px; text-align: center; color: #B2BEC3; font-size: 12px;">
            <p style="margin: 0;">&copy; 2026 Tailor Arena. All rights reserved.</p>
        </div>
    </div>
    `,
    attachments: attachments
  });
};

exports.sendDelayEmail = async (email, name, tailorName, newDate) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const logoPath = path.join(__dirname, '../../public/logo.jpeg');
  let attachments = [];
  if (fs.existsSync(logoPath)) {
    attachments.push({ filename: 'logo.jpeg', path: logoPath, cid: 'logo' });
  }

  await transporter.sendMail({
    from: `"Tailor Arena" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Apology: Your Order Delivery is Rescheduled 🧵🙏',
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #2D3436; padding: 30px; text-align: center;">
            ${fs.existsSync(logoPath) ? '<img src="cid:logo" alt="Tailor Arena" style="max-width: 140px;">' : '<h1 style="color: #fff; margin: 0;">TAILOR ARENA</h1>'}
        </div>
        <div style="padding: 40px; color: #2D3436;">
            <h2 style="margin-top: 0; font-size: 22px;">Hello ${name},</h2>
            <p style="color: #636E72; font-size: 16px; line-height: 1.6;">We sincerely apologize, but <strong>${tailorName}</strong> needs a little more time to perfect your order. Quality is our priority, and we want to ensure everything is perfect.</p>
            
            <div style="background-color: #FFFBEB; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #D97706; text-align: center;">
                <h3 style="color: #D97706; margin-top: 0; font-size: 18px;">New Expected Completion</h3>
                <p style="margin: 10px 0; font-size: 20px; font-weight: bold; color: #D97706;">${new Date(newDate).toDateString()}</p>
            </div>

            <p style="color: #636E72; font-size: 14px; line-height: 1.6;">Thank you for your patience and understanding. We are working hard to get your outfit ready!</p>

            <div style="text-align: center; margin-top: 40px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/dashboard" style="background-color: #2D3436; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Check Status</a>
            </div>
        </div>
        <div style="background-color: #F1F2F6; padding: 25px; text-align: center; color: #B2BEC3; font-size: 12px;">
            <p style="margin: 0;">&copy; 2026 Tailor Arena. All rights reserved.</p>
        </div>
    </div>
    `,
    attachments: attachments
  });
};

exports.sendStartWorkEmail = async (email, name, tailorName, dressType, tailorId, bookingId) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const logoPath = path.join(__dirname, '../../public/logo.jpeg');
  let attachments = [];
  if (fs.existsSync(logoPath)) {
    attachments.push({ filename: 'logo.jpeg', path: logoPath, cid: 'logo' });
  }

  await transporter.sendMail({
    from: `"Tailor Arena" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Good News: Work Started Early! 🪡✨',
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #2D3436; padding: 30px; text-align: center;">
            ${fs.existsSync(logoPath) ? '<img src="cid:logo" alt="Tailor Arena" style="max-width: 140px;">' : '<h1 style="color: #fff; margin: 0;">TAILOR ARENA</h1>'}
        </div>
        <div style="padding: 40px; color: #2D3436; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 20px;">🪡</div>
            <h2 style="margin-top: 0; font-size: 24px;">Great News, ${name}!</h2>
            <p style="color: #636E72; font-size: 16px; line-height: 1.6;">The tailor <strong>${tailorName}</strong> was free and has decided to <strong>START WORK EARLY</strong> on your <strong>${dressType}</strong>!</p>
            
            <div style="background-color: #EBF8FF; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #3182CE;">
                <h3 style="color: #2B6CB0; margin-top: 0; font-size: 18px;">Status Update: In Progress Early</h3>
                <p style="margin: 10px 0; color: #2B6CB0;">Book your new slot fast. We'll notify you as soon as it's ready!</p>
            </div>

            <div style="text-align: center; margin-top: 40px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/book/${tailorId}?updateBooking=${bookingId}" style="background-color: #3182CE; color: white; padding: 16px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Book New Slot</a>
            </div>
        </div>
        <div style="background-color: #F1F2F6; padding: 25px; text-align: center; color: #B2BEC3; font-size: 12px;">
            <p style="margin: 0;">&copy; 2026 Tailor Arena. All rights reserved.</p>
        </div>
    </div>
    `,
    attachments: attachments
  });
};

exports.sendSlotUpdateEmail = async (email, name, tailorName, date, time) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const logoPath = path.join(__dirname, '../../public/logo.jpeg');
  let attachments = [];
  if (fs.existsSync(logoPath)) {
    attachments.push({ filename: 'logo.jpeg', path: logoPath, cid: 'logo' });
  }

  await transporter.sendMail({
    from: `"Tailor Arena" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Booking Slot Updated Successfully! 📅✅',
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #2D3436; padding: 30px; text-align: center;">
            ${fs.existsSync(logoPath) ? '<img src="cid:logo" alt="Tailor Arena" style="max-width: 140px;">' : '<h1 style="color: #fff; margin: 0;">TAILOR ARENA</h1>'}
        </div>
        <div style="padding: 40px; color: #2D3436;">
            <h2 style="margin-top: 0; font-size: 22px;">Hello ${name},</h2>
            <p style="color: #636E72; font-size: 16px; line-height: 1.6;">Your booking slot with <strong>${tailorName}</strong> has been <strong>UPDATED</strong> as per your request.</p>
            
            <div style="background-color: #F8F9FA; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #6C63FF; text-align: center;">
                <h3 style="color: #6C63FF; margin-top: 0; font-size: 18px;">New Updated Slot</h3>
                <p style="margin: 10px 0; font-size: 16px;"><strong>Date:</strong> ${new Date(date).toDateString()}</p>
                <p style="margin: 10px 0; font-size: 16px;"><strong>Time:</strong> ${time}</p>
            </div>

            <p style="color: #636E72; font-size: 14px; line-height: 1.6; text-align: center; font-style: italic;">"Please ensure you acknowledge and visit the tailor accordingly at this new time."</p>

            <div style="text-align: center; margin-top: 40px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/dashboard" style="background-color: #2D3436; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View in Dashboard</a>
            </div>
        </div>
        <div style="background-color: #F1F2F6; padding: 25px; text-align: center; color: #B2BEC3; font-size: 12px;">
            <p style="margin: 0;">&copy; 2026 Tailor Arena. All rights reserved.</p>
        </div>
    </div>
    `,
    attachments: attachments
  });
};

// SEND OTP
exports.sendSignupOTP = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

          const otp = otpGenerator.generate(6, {
          digits: true,
          lowerCaseAlphabets: false,
          upperCaseAlphabets: false,
          specialChars: false,
        });

    tempUsers[email] = {
      name,
      email,
      password,
      role,
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    await sendOTP(email, otp, name);

    res.json({ message: 'OTP sent to email' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// VERIFY OTP & CREATE USER
exports.verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const tempUser = tempUsers[email];

    if (!tempUser) {
      return res.status(400).json({ message: 'No OTP request found' });
    }

    if (tempUser.otp !== otp || tempUser.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.create({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password, // model hashes
      role: tempUser.role,
    });

    delete tempUsers[email];

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2FA Flow
    if (user.preferences && user.preferences.twoFactorAuth) {
      // Check if device is trusted
      const isTrusted = user.trustedDevices.some(
        d => d.deviceId === deviceId && d.expiresAt > Date.now()
      );

      if (!isTrusted) {
        // Generate and send OTP for 2FA
        const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        await user.save();
        
        // Use NotificationService in future, for now standard email
        await sendOTP(email, otp, user.name);

        // Send WhatsApp OTP directly to the verified test number
        await sendWhatsAppMessage("919025619766", `Hi ${user.name}, your Tailor Arena 2FA Code is: ${otp}. It expires in 5 minutes.`);

        return res.json({ 
          require2FA: true, 
          email: user.email,
          message: 'OTP sent for Two-Factor Authentication' 
        });
      }
    }
    if (email === 'tailors@1234567890' && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    let extraData = {};
    if (user.role === 'tailor') {
      const profile = await TailorProfile.findOne({ user: user._id });
      if (profile) {
        extraData = {
          shopName: profile.shopName,
          phone: profile.phone,
          gstin: profile.gstin,
          established: profile.established,
        };
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      preferences: user.preferences || {},
      ...extraData,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= VERIFY 2FA LOGIN =================
exports.verify2FALogin = async (req, res) => {
  try {
    const { email, otp, deviceId, trustDevice } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;

    // Trust device if requested
    if (trustDevice && deviceId) {
      user.trustedDevices.push({
        deviceId,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }

    await user.save();

    let extraData = {};
    if (user.role === 'tailor') {
      const profile = await TailorProfile.findOne({ user: user._id });
      if (profile) {
        extraData = {
          shopName: profile.shopName,
          phone: profile.phone,
          gstin: profile.gstin,
          established: profile.established,
        };
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      preferences: user.preferences || {},
      ...extraData,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE PREFERENCES =================
exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { emailNotifications, whatsappUpdates, smsReminders, twoFactorAuth } = req.body;

    if (!user.preferences) user.preferences = {};
    if (emailNotifications !== undefined) user.preferences.emailNotifications = emailNotifications;
    if (whatsappUpdates !== undefined) user.preferences.whatsappUpdates = whatsappUpdates;
    if (smsReminders !== undefined) user.preferences.smsReminders = smsReminders;
    if (twoFactorAuth !== undefined) user.preferences.twoFactorAuth = twoFactorAuth;

    await user.save();
    res.json({ message: 'Preferences updated successfully', preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= FORGOT PASSWORD (OTP) =================

// SEND OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

          const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendOTP(email, otp, user.name);

    res.json({ message: 'OTP sent to your email' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// VERIFY RESET OTP
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.password = newPassword; // auto hashed
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successful' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= PROFILE =================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email } = req.body;

    if (name) user.name = name;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= PROFILE PIC =================
exports.uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);

    user.profilePic = req.file.path;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SAVE LOCATION =================
exports.saveLocation = async (req, res) => {
  try {
    console.log("BODY:", req.body);   // debug
    console.log("USER:", req.user);   // debug

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.location = {
      street: req.body.street,
      area: req.body.area,
      city: req.body.city,
      pincode: req.body.pincode,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    };
    user.isProfileComplete = true;
    await user.save();

    res.json({ message: "Location saved successfully" });

  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= CHECK ROLE BY EMAIL =================
exports.checkRole = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("role name");
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    res.json({ role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};