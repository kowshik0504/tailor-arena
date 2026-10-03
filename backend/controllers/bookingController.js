const Booking = require('../models/Booking');
const TailorProfile = require('../models/TailorProfile');
const { sendStartWorkEmail, sendSlotUpdateEmail, sendHandoverEmail, sendDelayEmail, sendPaymentFailedEmail } = require('./authController');
const notificationService = require('../services/notificationService');

const generateOrderId = async (shopId) => {
  const prefix = shopId || 'TA-XX01';
  
  const existingBookings = await Booking.find({ orderId: { $regex: `^${prefix}\\d+$` } });
  
  let maxNum = 0;
  for (const b of existingBookings) {
    if (b.orderId) {
      const numStr = b.orderId.replace(prefix, '');
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  const nextNumStr = nextNum.toString().padStart(2, '0');
  
  return `${prefix}${nextNumStr}`;
};

const DEFAULT_SLOTS = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
  '5:00 PM - 6:00 PM'
];

exports.getAvailableSlots = async (req, res) => {
  try {
    const { tailorId, date } = req.query;
    if (!tailorId || !date) {
      return res.status(400).json({ message: 'tailorId and date are required' });
    }

    const existingBookings = await Booking.find({
      tailor: tailorId,
      date: new Date(date),
      status: { $nin: ['cancelled', 'completed', 'handed_over'] }
    });

    const bookedTimes = new Set(existingBookings.map(b => b.timeSlot));

    res.json({ bookedTimes: Array.from(bookedTimes) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { tailorId, dressType, workType, date, timeSlot, amount, paymentMethod, notes, designImg, priority, measurements } = req.body;

    if (!tailorId || !dressType || !date || !timeSlot) {
      return res.status(400).json({ message: 'Service, date, and time are required' });
    }

    const tailor = await TailorProfile.findById(tailorId);
    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found' });
    }

    const existingBooking = await Booking.findOne({
      tailor: tailorId,
      date: new Date(date),
      timeSlot,
      status: { $nin: ['cancelled', 'completed', 'handed_over'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Slot already booked' });
    }

    const orderId = await generateOrderId(tailor.shopId);

    const booking = new Booking({
      customer: req.user._id,
      orderId,
      tailor: tailorId,
      dressType,
      workType: workType || 'stitching',
      date: new Date(date),
      timeSlot,
      amount,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'pending',
      status: paymentMethod === 'cash' ? 'confirmed' : 'pending',
      notes,
      designImg,
      priority: priority || 'Normal',
      measurements: measurements || [],
      chat: []
    });

    if (paymentMethod === 'online') {
      booking.paymentStatus = 'paid';
      const advanceAmount = booking.baseAmountPaid || Math.min(500, booking.amount);
      tailor.walletBalance = (tailor.walletBalance || 0) + advanceAmount;
      tailor.earnings = (tailor.earnings || 0) + advanceAmount;
      await tailor.save();
    }

    await booking.save();

    // Handle Freemium Activation Fee on FIRST booking
    if (!tailor.paid && !tailor.activationFeeTriggered) {
      const pastBookings = await Booking.countDocuments({ tailor: tailorId });
      if (pastBookings === 1) { // 1 because this booking just got created
        await TailorProfile.updateOne({ _id: tailor._id }, { $set: { activationFeeTriggered: true } });
        console.log(`\n========================================`);
        console.log(`ðŸ”” FREEMIUM ACTIVATION TRIGGERED!`);
        console.log(`Tailor ID: ${tailorId}`);
        console.log(`The â‚¹199 activation fee has been applied since the first booking has arrived.`);
        console.log(`========================================\n`);
      }
    }

    const populated = await Booking.findById(booking._id)
      .populate('customer', 'name email')
      .populate({
        path: 'tailor',
        populate: { path: 'user', select: 'name email' }
      });

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate({
        path: 'tailor',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTailorBookings = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Tailor profile not found' });
    }

    const bookings = await Booking.find({ tailor: profile._id })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptBooking = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Tailor profile not found' });
    }

    const booking = await Booking.findById(req.params.id).populate('customer', 'name email');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!booking.customer) {
      return res.status(400).json({ message: 'Customer account no longer exists' });
    }

    if (booking.tailor.toString() !== profile._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to accept this booking' });
    }

    booking.status = 'confirmed';
    const updated = await booking.save();

    // Send Acceptance Notification (Only for real bookings with a price)
    if (booking.amount > 0) {
      try {
        await notificationService.notifyBookingAccepted(
          req.user._id, // tailor's user ID for preference check
          booking.customer.email,
          booking.customer.name,
          booking.customer.phone, // might be undefined, that's fine
          profile.shopName || req.user.name,
          booking.date,
          booking.timeSlot,
          booking._id
        );
      } catch (err) {
        console.error('Email failed during acceptance:', err.message);
        // We don't return error here because the booking was already saved as confirmed
      }
    }

    res.json(updated);
  } catch (error) {
    console.error('Accept Booking Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Tailor profile not found' });
    }

    const booking = await Booking.findById(req.params.id).populate('customer', 'name email');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.tailor.toString() !== profile._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    const updated = await booking.save();

    // Send Rejection Notification
    try {
      await notificationService.notifyBookingRejected(
        req.user._id,
        booking.customer.email,
        booking.customer.name,
        booking.customer.phone,
        profile.shopName || req.user.name,
        reason || 'The tailor is unavailable for the selected slot.'
      );
    } catch (err) {
      console.log('Email failed:', err.message);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.holdBooking = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Tailor profile not found' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.tailor.toString() !== profile._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'hold';
    const updated = await booking.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    const updated = await booking.save();

    const populated = await Booking.findById(updated._id)
      .populate('customer', 'name email')
      .populate({
        path: 'tailor',
        populate: { path: 'user', select: 'name email' }
      });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acknowledgeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'acknowledged';
    const updated = await booking.save();

    const populated = await Booking.findById(updated._id)
      .populate('customer', 'name email')
      .populate({
        path: 'tailor',
        populate: { path: 'user', select: 'name email' }
      });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.completeBooking = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id });
    const booking = await Booking.findById(req.params.id).populate('customer', 'name email');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'completed';
    const updated = await booking.save();

    // Send Completion Notification
    try {
      await notificationService.notifyBookingCompleted(
        req.user._id,
        booking.customer.email,
        booking.customer.name,
        booking.customer.phone,
        profile.shopName || req.user.name,
        booking.dressType,
        booking.amount,
        booking.baseAmountPaid,
        booking._id
      );
    } catch (err) {
      console.error('Completion email failed:', err.message);
    }

    if (booking.paymentStatus === 'paid') {
      const profile = await TailorProfile.findById(booking.tailor);
      if (profile) {
        profile.earnings = (profile.earnings || 0) + (booking.amount || 0);
        await profile.save();
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rescheduleBooking = async (req, res) => {
  try {
    const { newDate } = req.body;
    if (!newDate) return res.status(400).json({ message: 'New date is required' });

    const profile = await TailorProfile.findOne({ user: req.user._id });
    const booking = await Booking.findById(req.params.id).populate('customer', 'name email');
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.date = new Date(newDate);
    const updated = await booking.save();

    // Send Delay Notification
    try {
      await notificationService.notifyBookingDelayed(
        req.user._id,
        booking.customer.email,
        booking.customer.name,
        booking.customer.phone,
        profile.shopName || req.user.name,
        newDate
      );
    } catch (err) {
      console.error('Delay email failed:', err.message);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email')
      .populate({
        path: 'tailor',
        populate: { path: 'user', select: 'name email' }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.startWork = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id });
    const booking = await Booking.findById(req.params.id).populate('customer', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'in-progress';
    const updated = await booking.save();

    // Send Start Work Email
    try {
      await sendStartWorkEmail(
        booking.customer.email,
        booking.customer.name,
        profile.shopName || req.user.name,
        booking.dressType,
        profile._id,
        booking._id
      );
    } catch (err) {
      console.error('Start work email failed:', err.message);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingSlot = async (req, res) => {
  try {
    const { date, timeSlot } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email')
      .populate({
        path: 'tailor',
        populate: { path: 'user', select: 'name' }
      });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Check if new slot is available
    const existingBooking = await Booking.findOne({
      tailor: booking.tailor._id,
      date: new Date(date),
      timeSlot,
      _id: { $ne: booking._id },
      status: { $nin: ['cancelled', 'completed', 'handed_over'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already taken' });
    }

    booking.date = new Date(date);
    booking.timeSlot = timeSlot;
    const updated = await booking.save();

    // Send Slot Update Email
    try {
      await sendSlotUpdateEmail(
        booking.customer.email,
        booking.customer.name,
        booking.tailor.shopName || booking.tailor.user.name,
        date,
        timeSlot
      );
    } catch (err) {
      console.error('Slot update email failed:', err.message);
    }

    res.json(updated);
  } catch (error) {
    console.error('Update Slot Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.requestCashPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.customer.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    booking.cashRequestStatus = 'pending';
      booking.paymentMethod = 'cash';
    const updated = await booking.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.confirmCashPayment = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Tailor profile not found' });

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.tailor.toString() !== profile._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    booking.cashRequestStatus = 'approved';
    booking.paymentStatus = 'paid';
    const updated = await booking.save();

    const remainingAmount = booking.amount - (booking.baseAmountPaid || Math.min(500, booking.amount));
    profile.earnings = (profile.earnings || 0) + remainingAmount;
    await profile.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectCashPayment = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Tailor profile not found' });

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.tailor.toString() !== profile._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    booking.cashRequestStatus = 'rejected';
    const updated = await booking.save();
    
    // Notify customer
    await booking.populate('customer');
    try {
      const remainingAmount = booking.amount - (booking.baseAmountPaid || Math.min(500, booking.amount));
      await sendPaymentFailedEmail(
        booking.customer.email, 
        booking.customer.name, 
        booking._id, 
        'cash', 
        'The tailor reported that they did not receive the cash payment.',
        remainingAmount
      );
    } catch (err) {
      console.error('Failed to send cash payment rejection email:', err);
    }
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markHandover = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Tailor profile not found' });

    const booking = await Booking.findById(req.params.id).populate('customer').populate('tailor');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.tailor._id.toString() !== profile._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'handed_over';
    await booking.save();

    if (booking.customer.email) {
      await require('./authController').sendHandoverEmail(booking);
    }

    res.json({ message: 'Handover marked successfully', booking });
  } catch (error) {
    console.error('Error in markHandover:', error);
    res.status(500).json({ message: 'Error marking handover' });
  }
};

exports.delayHandover = async (req, res) => {
  try {
    const { reason, expectedDate } = req.body;
    
    if (!reason || !expectedDate) {
      return res.status(400).json({ message: 'Reason and expected date are required' });
    }

    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Tailor profile not found' });

    const booking = await Booking.findById(req.params.id).populate('customer').populate('tailor');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.tailor._id.toString() !== profile._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.delayCount >= 3) {
      return res.status(400).json({ message: 'Maximum allowed delays (3) reached for this order.' });
    }

    booking.status = 'delayed';
    booking.delayCount += 1;
    booking.delayReason = reason;
    booking.expectedHandoverDate = expectedDate;

    await booking.save();

    if (booking.customer.email) {
      await sendDelayEmail(booking.customer.email, booking.customer.name, booking.dressType, booking.tailor.businessName, reason, expectedDate, booking.delayCount);
    }

    res.json({ message: 'Handover delay recorded', booking });
  } catch (error) {
    console.error('Error in delayHandover:', error);
    res.status(500).json({ message: 'Error recording delay' });
  }
};

exports.payOnline = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('tailor');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    const TailorProfileModel = require('../models/TailorProfile');
    const profileId = booking.tailor._id || booking.tailor;
    const profile = await TailorProfileModel.findById(profileId);
    
    const advanceAmount = booking.baseAmountPaid || Math.min(500, booking.amount);
    const remainingAmount = booking.amount - advanceAmount;
    
    const reqAmount = req.body.amount ? parseFloat(req.body.amount) : null;
    const isAdvanceRequest = booking.paymentStatus === 'pending';
    
    if (isAdvanceRequest) {
      if (booking.paymentStatus === 'paid') return res.json({ message: 'Advance payment already processed', booking });
      
      booking.paymentMethod = req.body.method || 'online';
      booking.paymentStatus = 'paid';
      if (profile) {
        profile.walletBalance = (profile.walletBalance || 0) + advanceAmount;
        profile.earnings = (profile.earnings || 0) + advanceAmount;
        await profile.save();
      }
    } else {
      if (booking.onlinePaymentStatus === 'pending' || booking.onlinePaymentStatus === 'approved') {
        return res.json({ message: 'Final payment already processed', booking });
      }
      
      booking.onlinePaymentStatus = 'pending';
      booking.paymentMethod = req.body.method || 'online';
    }
    
    await booking.save();
    res.json({ message: 'Online payment processed successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.confirmOnlinePayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('tailor');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.onlinePaymentStatus === 'approved') return res.json({ message: 'Already confirmed' });
    
    booking.onlinePaymentStatus = 'approved';
    booking.paymentStatus = 'paid';
    await booking.save();
    
    const TailorProfileModel = require('../models/TailorProfile');
    const profileId = booking.tailor._id || booking.tailor;
    const profile = await TailorProfileModel.findById(profileId);
    
    if (profile) {
      const remainingAmount = booking.amount - (booking.baseAmountPaid || Math.min(500, booking.amount));
      profile.earnings = (profile.earnings || 0) + remainingAmount;
      profile.walletBalance = (profile.walletBalance || 0) + remainingAmount;
      await profile.save();
    }
    res.json({ message: 'Online payment confirmed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectOnlinePayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('customer');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.onlinePaymentStatus = 'rejected';
    await booking.save();
    
    try {
      const remainingAmount = booking.amount - (booking.baseAmountPaid || Math.min(500, booking.amount));
      await sendPaymentFailedEmail(
        booking.customer.email, 
        booking.customer.name, 
        booking._id, 
        booking.paymentMethod || 'online', 
        'The tailor declined the online payment verification.',
        remainingAmount
      );
    } catch (err) {
      console.error('Failed to send online payment rejection email:', err);
    }

    res.json({ message: 'Online payment rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reportPaymentFailed = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('customer');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.customer._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    const { method, reason } = req.body;

    try {
      const remainingAmount = booking.amount - (booking.baseAmountPaid || Math.min(500, booking.amount));
      await sendPaymentFailedEmail(
        booking.customer.email, 
        booking.customer.name, 
        booking._id, 
        method || 'online', 
        reason || 'Technical Error',
        remainingAmount
      );
    } catch (err) {
      console.error('Failed to send payment failed email:', err);
    }

    res.json({ message: 'Failure reported and email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const { buildInvoicePDF } = require("../utils/pdfGenerator");
const PDFDocument = require("pdfkit");

exports.downloadInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("customer").populate("tailor");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Invoice-${booking.orderId || booking._id}.pdf"`);
    
    doc.pipe(res);
    buildInvoicePDF(booking, doc);
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ message: "Error generating invoice" });
  }
};


