const TailorProfile = require('../models/TailorProfile');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendFreemiumEmail } = require('./authController');

exports.registerTailor = async (req, res) => {
  try {
    const {
      phone, shopNumber, houseDetails, aadharNumber,
      setupType, paymentMethod, payLater, shopName, address,
      latitude, longitude
    } = req.body;

    const existingProfile = await TailorProfile.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Tailor profile already exists' });
    }

    const registrationFee = 199; // Flat fee for everyone

    const aadharDocUrl = req.files?.aadharDoc?.[0]?.path || '';
    const machinePhotoUrl = req.files?.machinePhoto?.[0]?.path || '';

    const profile = await TailorProfile.create({
      user: req.user._id,
      phone,
      shopNumber,
      houseDetails,
      aadharNumber,
      aadharDocUrl,
      machinePhotoUrl,
      workType: setupType,
      setupType,
      registrationFee,
      paid: false, // Always start unpaid in Freemium model
      paymentStatus: 'pending',
      paymentMethod,
      payLater: true,
      shopName: shopName || '',
      address: address || {},
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0]
      }
    });

    // Mark user profile as complete
    const updatedUser = await User.findByIdAndUpdate(req.user._id, { isProfileComplete: true }, { new: true });

    // Send Freemium Welcome Email
    try {
      await sendFreemiumEmail(updatedUser.email, updatedUser.name);
    } catch (emailErr) {
      console.log("Freemium email failed:", emailErr.message);
    }

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerOnboarding = async (req, res) => {
  try {
    const {
      workType, shopName, established, address, gstin, email, phone, aadharNumber
    } = req.body;

    const existingProfile = await TailorProfile.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Tailor profile already exists' });
    }

    const registrationFee = 199; // Flat fee for everyone

    const govtIdUrl = req.files?.govtId?.[0]?.path || '';
    const passportPhotoUrl = req.files?.passportPhoto?.[0]?.path || '';
    const tailorPhotoUrl = req.files?.tailorPhoto?.[0]?.path || '';
    const machinePhotoUrl = req.files?.machinePhoto?.[0]?.path || '';
    const shopPhotoUrl = req.files?.shopPhoto?.[0]?.path || '';

    let parsedAddress = {};
    try {
      if (address) parsedAddress = JSON.parse(address);
    } catch (e) {
      console.error("Failed to parse address:", e);
    }
    
    // Parse the pin for coordinates if it exists (e.g., "19.0620° N, 72.8273° E")
    let coordinates = [0, 0];
    if (parsedAddress.pin) {
      const match = parsedAddress.pin.match(/([0-9.]+)[°\s]*[NS][,\s]*([0-9.]+)[°\s]*[EW]/i);
      if (match) {
        coordinates = [parseFloat(match[2]), parseFloat(match[1])]; // [longitude, latitude]
      }
    }

    const profile = await TailorProfile.create({
      user: req.user._id,
      phone: phone || req.user.phone,
      gstin: gstin || '',
      established: established || '',
      aadharNumber: aadharNumber || '',
      aadharDocUrl: govtIdUrl,
      machinePhotoUrl: machinePhotoUrl,
      workType: workType === 'shop' || workType === 'home' ? workType : 'shop',
      setupType: workType === 'shop' || workType === 'home' ? workType : 'shop',
      registrationFee,
      paid: false, 
      paymentStatus: 'pending',
      payLater: true,
      shopName: shopName || '',
      address: parsedAddress,
      documents: {
        govtId: govtIdUrl,
        passportPhoto: passportPhotoUrl,
        tailorPhoto: tailorPhotoUrl,
        machinePhoto: machinePhotoUrl,
        shopPhoto: shopPhotoUrl
      },
      location: {
        type: 'Point',
        coordinates
      }
    });

    // Mark user profile as complete
    const updatedUser = await User.findByIdAndUpdate(req.user._id, { isProfileComplete: true }, { new: true });

    // Send Freemium Welcome Email Mock
    console.log(`\n========================================`);
    console.log(`📧 WELCOME EMAIL SENT TO: ${email || updatedUser.email}`);
    console.log(`Subject: Welcome to Tailor Arena - Freemium details`);
    console.log(`Body: Hello ${updatedUser.name}, welcome to Tailor Arena!`);
    console.log(`Your profile has been created. A ₹199 activation fee will be charged upon your first customer booking.`);
    console.log(`========================================\n`);

    // Save details separately to a local file
    try {
      const fs = require('fs');
      const path = require('path');
      const logFile = path.join(__dirname, '..', 'registered_tailors.json');
      
      const newTailorData = {
        name: updatedUser.name,
        email: email || updatedUser.email,
        phone: profile.phone,
        shopName: profile.shopName,
        workType: profile.workType,
        registeredAt: new Date().toISOString()
      };
      
      let existingData = [];
      if (fs.existsSync(logFile)) {
        existingData = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      }
      existingData.push(newTailorData);
      fs.writeFileSync(logFile, JSON.stringify(existingData, null, 2));
      console.log(`Saved new tailor details to registered_tailors.json`);
    } catch (fsError) {
      console.error("Failed to write to registered_tailors.json:", fsError);
    }

    res.status(201).json(profile);
  } catch (error) {
    console.error("registerOnboarding Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.registerStep = async (req, res) => {
  try {
    const { step } = req.body;
    const existingProfile = await TailorProfile.findOne({ user: req.user._id });

    if (step === 'workType') {
      const { workType } = req.body;
      if (!workType || !['shop', 'home'].includes(workType)) {
        return res.status(400).json({ message: 'Please select shop or home' });
      }
      const registrationFee = 199; // Flat fee

      if (existingProfile) {
        existingProfile.workType = workType;
        existingProfile.setupType = workType;
        existingProfile.registrationFee = registrationFee;
        await existingProfile.save();
        return res.json(existingProfile);
      }

      const profile = await TailorProfile.create({
        user: req.user._id,
        phone: '',
        workType,
        setupType: workType,
        registrationFee,
        paid: false
      });
      return res.status(201).json(profile);
    }

    if (!existingProfile) {
      return res.status(404).json({ message: 'Please complete step 1 first' });
    }

    if (step === 'address') {
      const { house, street, area, city } = req.body;
      if (!house || !street || !area || !city) {
        return res.status(400).json({ message: 'Please fill all address fields' });
      }

      // Sync location from User model
      const user = await User.findById(req.user._id);
      if (user && user.location && user.location.latitude) {
        existingProfile.location = {
          type: 'Point',
          coordinates: [user.location.longitude, user.location.latitude]
        };
      }

      existingProfile.address = { house, street, area, city };
      existingProfile.houseDetails = `${house}, ${street}, ${area}, ${city}`;
      await existingProfile.save();
      return res.json(existingProfile);
    }

    if (step === 'documents') {
      const govtId = req.files?.govtId?.[0]?.path || existingProfile.documents?.govtId || '';
      const tailorPhoto = req.files?.tailorPhoto?.[0]?.path || existingProfile.documents?.tailorPhoto || '';
      const machinePhoto = req.files?.machinePhoto?.[0]?.path || existingProfile.documents?.machinePhoto || '';
      const shopPhoto = req.files?.shopPhoto?.[0]?.path || existingProfile.documents?.shopPhoto || '';

      if (!govtId || !tailorPhoto || !machinePhoto) {
        return res.status(400).json({ message: 'Please upload Government ID, Tailor Photo, and Machine Photo' });
      }

      existingProfile.documents = { govtId, tailorPhoto, machinePhoto, shopPhoto };
      if (machinePhoto) existingProfile.machinePhotoUrl = machinePhoto;
      if (govtId) existingProfile.aadharDocUrl = govtId;
      await existingProfile.save();
      return res.json(existingProfile);
    }

    if (step === 'payment') {
      const { paymentMethod, phone } = req.body;
      if (phone) existingProfile.phone = phone;
      existingProfile.paymentMethod = paymentMethod || 'pay_later';
      existingProfile.payLater = true;
      existingProfile.paid = false;
      existingProfile.paymentStatus = 'pending';
      await existingProfile.save();

      // Mark user profile as complete
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user._id, { isProfileComplete: true });

      return res.json(existingProfile);
    }

    res.status(400).json({ message: 'Invalid step' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!profile) {
      return res.status(404).json({ message: 'Tailor profile not found' });
    }

    const isPaid = profile.paid === true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayBookings, pendingBookingsCount, paidBookings, allBookingsCount] = await Promise.all([
      Booking.find({ tailor: profile._id, date: { $gte: today, $lt: tomorrow } }).countDocuments(),
      Booking.find({ tailor: profile._id, status: 'pending' }).countDocuments(),
      Booking.find({ tailor: profile._id, paymentStatus: 'paid' }),
      Booking.find({ tailor: profile._id }).countDocuments()
    ]);

    const totalEarnings = paidBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const monthlyEarnings = paidBookings
      .filter(b => {
        const d = new Date(b.date);
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      })
      .reduce((sum, b) => sum + (b.amount || 0), 0);

    // Fetch and Secure Pending & Held Requests (Top 10)
    let pendingRequests = await Booking.find({ 
      tailor: profile._id, 
      status: { $in: ['pending', 'hold'] } 
    })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    if (!isPaid) {
      pendingRequests = pendingRequests.map(b => ({
        ...b._doc,
        customer: { name: 'Locked (Pay to View)', email: 'locked@tailorarena.com' },
        isLocked: true
      }));
    }

    // Fetch and Secure Confirmed Bookings
    let confirmedBookings = await Booking.find({
      tailor: profile._id,
      status: { $in: ['acknowledged', 'confirmed', 'in-progress'] }
    })
      .populate('customer', 'name email')
      .sort({ date: 1 })
      .limit(20);

    if (!isPaid) {
      confirmedBookings = confirmedBookings.map(b => ({
        ...b._doc,
        customer: { name: 'Locked (Pay to View)', email: 'locked@tailorarena.com' },
        isLocked: true
      }));
    }

    const recentCompleted = await Booking.find({
      tailor: profile._id,
      status: 'completed'
    })
      .populate('customer', 'name email')
      .sort({ updatedAt: -1 })
      .limit(20);

    const transactions = paidBookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);

    // Create Unified Sorted Activities
    let allBookings = await Booking.find({ tailor: profile._id })
        .populate('customer', 'name email')
        .sort({ updatedAt: -1 })
        .limit(20);

    const activities = allBookings.map(b => {
        let icon = '📋';
        let text = `New request from ${b.customer?.name || 'Customer'}`;
        
        if (b.status === 'completed') {
            icon = '✅';
            text = `Order for ${b.customer?.name} completed`;
        } else if (b.status === 'in-progress') {
            icon = '🪡';
            text = `Started work on ${b.customer?.name}'s order`;
        } else if (b.status === 'confirmed') {
            icon = '📅';
            text = `Accepted booking for ${b.customer?.name}`;
        } else if (b.status === 'hold') {
            icon = '⏳';
            text = `Put ${b.customer?.name}'s order on hold`;
        } else if (b.paymentStatus === 'paid' && b.status === 'pending') {
            icon = '💰';
            text = `Payment received from ${b.customer?.name}`;
        }

        if (b.isLocked && !isPaid) {
            text = text.replace(b.customer?.name, 'Locked Customer');
        }

        return {
            id: b._id,
            icon,
            text,
            time: b.updatedAt
        };
    }).slice(0, 10);

    res.json({
      profile,
      stats: {
        todayBookings,
        totalEarnings,
        monthlyEarnings,
        pendingRequests: pendingBookingsCount,
        totalBookings: allBookingsCount,
        rating: profile.rating || 0
      },
      pendingRequests,
      confirmedBookings,
      recentCompleted,
      transactions,
      activities,
      leadLockActive: !isPaid
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTailorById = async (req, res) => {
  try {
    const profile = await TailorProfile.findById(req.params.id).populate('user', 'name email');
    if (!profile) {
      return res.status(404).json({ message: 'Tailor not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const endDate = futureDate.toISOString().split('T')[0];

    const existingBookings = await Booking.find({
      tailor: profile._id,
      date: { $gte: new Date(today), $lte: new Date(endDate) },
      status: { $nin: ['cancelled'] }
    });

    const bookedSlots = {};
    existingBookings.forEach(b => {
      const dateStr = new Date(b.date).toISOString().split('T')[0];
      if (!bookedSlots[dateStr]) bookedSlots[dateStr] = [];
      bookedSlots[dateStr].push(b.timeSlot);
    });

    const DEFAULT_SLOTS = [
      '9:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM',
      '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM', '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM'
    ];

    const availableDates = [];
    for (let d = new Date(today); d <= futureDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const booked = bookedSlots[dateStr] || [];
      const availableSlots = DEFAULT_SLOTS.filter(s => !booked.includes(s));
      if (availableSlots.length > 0) {
        availableDates.push({ date: dateStr, slots: availableSlots });
      }
    }

    res.json({ profile, availableDates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const { shopName, address, phone, shopNumber, houseDetails, isPaused, services, designs, maxWeeklyOrders, workingDays } = req.body;
    
    if (typeof isPaused === 'boolean') {
      profile.isPaused = isPaused;
    }
    if (maxWeeklyOrders !== undefined) {
      profile.maxWeeklyOrders = maxWeeklyOrders;
    }
    if (workingDays !== undefined) {
      profile.workingDays = workingDays;
    }
    if (services !== undefined) {
      profile.services = services;
    }
    if (designs !== undefined) {
      profile.designs = designs;
    }

    // Instead of updating directly, store in pendingFields
    profile.pendingFields = {
      ...profile.pendingFields,
      shopName: shopName || profile.pendingFields.shopName,
      address: address || profile.pendingFields.address,
      phone: phone || profile.pendingFields.phone,
      shopNumber: shopNumber || profile.pendingFields.shopNumber,
      houseDetails: houseDetails || profile.pendingFields.houseDetails
    };

    const updated = await profile.save();
    res.json({ message: 'Change request submitted for admin approval', profile: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRates = async (req, res) => {
  try {
    const { rates, addons } = req.body;
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Store in pendingFields for admin approval
    profile.pendingFields = {
      ...profile.pendingFields,
      rates: rates || profile.pendingFields.rates,
      addons: addons || profile.pendingFields.addons
    };
    
    const updated = await profile.save();
    res.json({ message: 'Pricing change request submitted for admin approval', profile: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, address, shopName } = req.body;
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    profile.location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };
    if (address) profile.address = address;
    if (shopName) profile.shopName = shopName;

    const updated = await profile.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNearby = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const tailors = await TailorProfile.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000
        }
      },
      paid: true,
      isVerified: true
    }).populate('user', 'name email');

    res.json(tailors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTailors = async (req, res) => {
  try {
    const { distance, price_min, price_max, rating, service_type, lat, lng, sort } = req.query;

    const filter = {};

    if (service_type && ['shop', 'home'].includes(service_type)) {
      filter.workType = service_type;
    }

    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    let query;

    if (lat && lng) {
      const maxDist = distance ? parseFloat(distance) * 1000 : 10000;
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: maxDist
        }
      };
    }

    query = TailorProfile.find(filter).populate('user', 'name email');

    if (sort === 'rating') {
      query = query.sort({ rating: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    let tailors = await query;

    if (price_min || price_max) {
      tailors = tailors.filter(t => {
        if (!t.rates || t.rates.length === 0) return true;
        const minRate = Math.min(...t.rates.map(r => r.stitchingCost));
        if (price_min && minRate < parseFloat(price_min)) return false;
        if (price_max && minRate > parseFloat(price_max)) return false;
        return true;
      });
    }

    res.json(tailors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.depositToWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const profile = await TailorProfile.findOne({ user: req.user._id });
    
    if (!profile) return res.status(404).json({ message: 'Tailor profile not found' });

    let finalAmount = amount;
    // Auto-deduct activation fee if payLater and not paid
    if (profile.payLater && !profile.paid && !profile.activationFeeTriggered) {
      if (amount >= 199) {
        finalAmount = amount - 199;
        profile.paid = true;
        profile.activationFeeTriggered = true;
        console.log(`[Wallet] Deducted ₹199 activation fee from incoming deposit for Tailor ${profile._id}`);
      }
    }

    profile.walletBalance = (profile.walletBalance || 0) + finalAmount;
    await profile.save();

    res.json({ message: 'Deposit successful', balance: profile.walletBalance, paid: profile.paid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.payNow = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Tailor profile not found' });
    
    profile.paid = true;
    profile.payLater = false;
    await profile.save();

    res.json({ message: 'Payment simulated successfully. You are now a paid member.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.withdrawFromWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const profile = await TailorProfile.findOne({ user: req.user._id });
    
    if (!profile) return res.status(404).json({ message: 'Tailor profile not found' });
    if (profile.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Check withdrawal limits: Max 1 per day, 5 per week
    const now = new Date();
    const todayStart = new Date(now.setHours(0,0,0,0));
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const todayWithdrawals = profile.withdrawals.filter(w => new Date(w.date) >= todayStart).length;
    const weekWithdrawals = profile.withdrawals.filter(w => new Date(w.date) >= weekStart).length;

    if (todayWithdrawals >= 1) {
      return res.status(400).json({ message: 'Daily withdrawal limit reached (Max 1/day)' });
    }
    if (weekWithdrawals >= 5) {
      return res.status(400).json({ message: 'Weekly withdrawal limit reached (Max 5/week)' });
    }

    profile.walletBalance -= amount;
    profile.withdrawals.push({ amount, date: new Date(), status: 'completed' });
    await profile.save();

    res.json({ message: 'Withdrawal successful', balance: profile.walletBalance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resubmitVerification = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    if (profile.status !== 'changes_requested') {
      return res.status(400).json({ message: 'No changes requested by admin' });
    }
    
    // In a real app we'd update documents here based on req.files
    // For now, just flip status back to pending
    profile.status = 'pending';
    profile.adminFeedback = '';
    await profile.save();
    
    res.json({ message: 'Verification resubmitted successfully', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


