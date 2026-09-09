const express = require('express');
const router = express.Router();

const {
  sendSignupOTP,
  verifySignupOTP,
  verifyResetOTP,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  uploadProfilePic,
  updateProfile,
  saveLocation,
  checkRole,
  verify2FALogin,
  updatePreferences
} = require('../controllers/authController');



const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');


// ✅ OTP REGISTER FLOW (NEW)
router.post('/send-otp', sendSignupOTP);
router.post('/verify-otp', verifySignupOTP);
router.post('/verify-reset-otp', verifyResetOTP);


// ✅ LOGIN
router.post('/login', login);
router.post('/verify-2fa', verify2FALogin);

// ✅ CHECK ROLE BY EMAIL (used by login page to auto-detect designation)
router.get('/check-role', checkRole);


// ✅ PASSWORD RESET
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


// ✅ PROFILE
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/upload-profile-pic', protect, upload.single('profilePic'), uploadProfilePic);
router.post('/location', protect, saveLocation);
router.put('/preferences', protect, updatePreferences);


module.exports = router;