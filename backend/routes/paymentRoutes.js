const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  createRegistrationOrder,
  verifyRegistrationPayment,
  getPaymentStatus,
  processPayment,
  initiatePhonePePayment,
  phonepeCallback
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/process', protect, processPayment);
router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/create-registration-order', protect, createRegistrationOrder);
router.post('/verify-registration-payment', protect, verifyRegistrationPayment);
router.get('/status/:bookingId', protect, getPaymentStatus);

// PhonePe Routes
router.post('/phonepe-initiate', protect, initiatePhonePePayment);
router.post('/phonepe-callback', phonepeCallback); // Callback is usually POST from PhonePe

module.exports = router;
