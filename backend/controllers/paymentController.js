const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');
const Booking = require('../models/Booking');
const TailorProfile = require('../models/TailorProfile');

// PhonePe Config
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
const PHONEPE_API_URL = process.env.PHONEPE_API_URL;
const PHONEPE_STATUS_URL = process.env.PHONEPE_STATUS_URL;

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
  });
} catch (err) {
  console.error('Razorpay initialization failed:', err.message);
}

// PhonePe Payment Initiation
exports.initiatePhonePePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const transactionId = `MT${Date.now()}`;
    const amount = booking.amount * 100; // In paise

    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: booking.customer.toString(),
      amount: amount,
      redirectUrl: `http://localhost:5000/api/payments/phonepe-callback?bookingId=${bookingId}`,
      redirectMode: 'POST',
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const buffer = Buffer.from(JSON.stringify(payload));
    const base64Payload = buffer.toString('base64');
    const stringToHash = base64Payload + "/pg/v1/pay" + SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256 + "###" + SALT_INDEX;

    const options = {
      method: 'POST',
      url: PHONEPE_API_URL,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      },
      data: {
        request: base64Payload
      }
    };

    const response = await axios.request(options);
    
    // Save transaction ID to booking
    booking.phonepeTransactionId = transactionId;
    await booking.save();

    res.json({
      success: true,
      url: response.data.data.instrumentResponse.redirectInfo.url
    });

  } catch (error) {
    console.error('PhonePe error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error initiating PhonePe payment' });
  }
};

// PhonePe Callback
exports.phonepeCallback = async (req, res) => {
  try {
    const { bookingId } = req.query;
    const { merchantTransactionId, code } = req.body;

    if (code === 'PAYMENT_SUCCESS') {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        // Calculate Commission (7%)
        const commissionRate = 0.07;
        const platformFee = booking.amount * commissionRate;
        const tailorShare = booking.amount - platformFee;

        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        booking.paymentMethod = 'online';
        await booking.save();
// Update Tailor Earnings (optional logic)
const tailor = await TailorProfile.findById(booking.tailor);
if (tailor) {
  tailor.earnings = (tailor.earnings || 0) + tailorShare;
  await tailor.save();
}

// Redirect to frontend success page
return res.redirect(`http://localhost:3000/success/${bookingId}`);
}
}

// If failed or not found, redirect to payment page or dashboard
res.redirect(`http://localhost:3000/customer/dashboard`);


  } catch (error) {
    console.error('PhonePe callback error:', error);
    res.redirect('http://localhost:3000/payment-failure');
  }
};

// Create Order for Booking
exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const amount = booking.amount * 100; // Amount in paise
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
      notes: {
        bookingId: bookingId,
        type: 'booking_payment'
      }
    };

    try {
      const order = await razorpay.orders.create(options);
      
      booking.razorpayOrderId = order.id;
      await booking.save();

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      });
    } catch (rzpError) {
      console.error('Razorpay Order Error:', rzpError.message);
      // Fallback to Mock Order if Razorpay fails (e.g. invalid keys in dev)
      const mockOrder = {
        id: `mock_order_${Date.now()}`,
        amount: amount,
        currency: 'INR'
      };
      booking.razorpayOrderId = mockOrder.id;
      await booking.save();
      res.json({ orderId: mockOrder.id, amount: mockOrder.amount, currency: mockOrder.currency, isMock: true });
    }
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: 'Error creating payment order' });
  }
};

// Verify Payment for Booking
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    let isSuccess = false;

    if (razorpay_order_id.startsWith('mock_order_')) {
      isSuccess = true;
    } else {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
      isSuccess = (expectedSignature === razorpay_signature);
    }

    if (isSuccess) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Calculate Commission (7%)
      const commissionRate = 0.07;
      const platformFee = booking.amount * commissionRate;
      const tailorShare = booking.amount - platformFee;

      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.paymentMethod = 'online'; // Generic online payment
      await booking.save();

      // Update Tailor Earnings (optional logic)
      const tailor = await TailorProfile.findById(booking.tailor);
      if (tailor) {
        tailor.earnings = (tailor.earnings || 0) + tailorShare;
        await tailor.save();
      }

      res.json({ 
        message: 'Payment verified successfully', 
        success: true,
        commission: platformFee,
        tailorShare: tailorShare
      });
    } else {
      res.status(400).json({ message: 'Invalid signature', success: false });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create Order for Tailor Registration
exports.createRegistrationOrder = async (req, res) => {
  try {
    const { profileId } = req.body;
    const profile = await TailorProfile.findById(profileId);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const amount = profile.registrationFee * 100;
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `reg_${profileId}`,
      notes: {
        profileId: profileId,
        type: 'registration_fee'
      }
    };

    try {
      const order = await razorpay.orders.create(options);
      
      profile.razorpayOrderId = order.id;
      await profile.save();

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      });
    } catch (rzpError) {
      console.error('Razorpay Registration Error:', rzpError.message);
      const mockOrder = {
        id: `mock_reg_${Date.now()}`,
        amount: amount,
        currency: 'INR'
      };
      profile.razorpayOrderId = mockOrder.id;
      await profile.save();
      res.json({ orderId: mockOrder.id, amount: mockOrder.amount, currency: mockOrder.currency, isMock: true });
    }
  } catch (error) {
    console.error('Error creating registration order:', error);
    res.status(500).json({ message: 'Error creating registration order' });
  }
};

// Verify Registration Payment
exports.verifyRegistrationPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, profileId } = req.body;

    let isSuccess = false;

    if (razorpay_order_id.startsWith('mock_reg_')) {
      isSuccess = true;
    } else {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
      isSuccess = (expectedSignature === razorpay_signature);
    }

    if (isSuccess) {
      const profile = await TailorProfile.findById(profileId);
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      profile.paid = true;
      profile.paymentStatus = 'paid';
      profile.payLater = false;
      await profile.save();

      res.json({ message: 'Registration fee paid successfully', success: true });
    } else {
      res.status(400).json({ message: 'Invalid signature', success: false });
    }
  } catch (error) {
    console.error('Error verifying registration payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Generic process payment for mock/cash
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.paymentStatus = paymentMethod === 'cash' ? 'pending' : 'paid';
    booking.paymentMethod = paymentMethod;
    booking.status = 'confirmed';
    await booking.save();

    res.json({
      message: 'Payment processed successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      paymentStatus: booking.paymentStatus,
      amount: booking.amount,
      paymentMethod: booking.paymentMethod
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
