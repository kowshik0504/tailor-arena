const Booking = require('../models/Booking');
const TailorProfile = require('../models/TailorProfile');
const { sendStartWorkEmail, sendSlotUpdateEmail } = require('./authController');
const notificationService = require('../services/notificationService');

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
      status: { $nin: ['cancelled'] }
    });

    const bookedTimes = new Set(existingBookings.map(b => b.timeSlot));

    const slots = DEFAULT_SLOTS.map(time => ({
      time,
      isBooked: bookedTimes.has(time)
    }));

    res.json(slots);
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
      status: { $nin: ['cancelled'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const booking = await Booking.create({
      customer: req.user._id,
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

    // Handle Freemium Activation Fee on FIRST booking
    if (!tailor.paid && !tailor.activationFeeTriggered) {
      const pastBookings = await Booking.countDocuments({ tailor: tailorId });
      if (pastBookings === 1) { // 1 because this booking just got created
        tailor.activationFeeTriggered = true;
        await tailor.save();
        console.log(`\n========================================`);
        console.log(`🔔 FREEMIUM ACTIVATION TRIGGERED!`);
        console.log(`Tailor ID: ${tailorId}`);
        console.log(`The ₹199 activation fee has been applied since the first booking has arrived.`);
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

    // Send Acceptance Notification
    try {
      await notificationService.notifyBookingAccepted(
        profile.user._id, // tailor's user ID for preference check
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
        profile.user._id,
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
        profile.user._id,
        booking.customer.email,
        booking.customer.name,
        booking.customer.phone,
        profile.shopName || req.user.name,
        booking.dressType
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
        profile.user._id,
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
      status: { $nin: ['cancelled'] }
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