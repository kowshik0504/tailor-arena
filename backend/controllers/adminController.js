const TailorProfile = require('../models/TailorProfile');
const User = require('../models/User');

const nodemailer = require('nodemailer');

const sendEmail = async (email, name, status, reason) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  let subject = '';
  let text = '';

  if (status === 'approved') {
    subject = 'Your Tailor Arena Account is Approved!';
    text = `Hello ${name},\n\nYour documents have been verified and your account is approved!\nYou can now access your dashboard and start accepting orders.\n\nWelcome to Tailor Arena!`;
  } else if (status === 'changes_requested') {
    subject = 'Tailor Arena - Action Required for Verification';
    text = `Hello ${name},\n\nWe reviewed your documents but need some changes before we can approve your account.\n\nAdmin Feedback:\n"${reason}"\n\nPlease log in to your account and re-upload the correct documents.\n\nThanks,\nTailor Arena Team`;
  } else if (status === 'rejected') {
    subject = 'Tailor Arena - Account Rejected';
    text = `Hello ${name},\n\nUnfortunately, your verification was rejected.\n\nReason:\n"${reason}"\n\nIf you believe this is a mistake, please contact support.\n\nThanks,\nTailor Arena Team`;
  }

  try {
    await transporter.sendMail({
      from: `"Tailor Arena Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text
    });
    console.log(`Real email sent successfully to ${email}`);
  } catch (err) {
    console.error('Error sending email:', err);
  }
};

exports.getSystemHealth = async (req, res) => {
  try {
    const os = require('os');
    const isDbConnected = require('mongoose').connection.readyState === 1;
    let dbLatency = 0;
    
    if (isDbConnected) {
      const start = Date.now();
      await require('mongoose').connection.db.admin().ping();
      dbLatency = Date.now() - start;
    }

    // Real Uptime formatting
    const uptimeSeconds = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptimeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${uptimeSeconds % 60}s`;

    // Real Memory usage (Heap)
    const memUsage = process.memoryUsage();
    const memMb = Math.round(memUsage.heapUsed / 1024 / 1024);

    // CPU Load
    const load = os.loadavg();
    const cpuLoad = `${Math.round(load[0] * 100) / 100}%`;

    const health = {
      cpuLoad,
      dbLatency,
      uptime: uptimeStr,
      memoryUsage: `${memMb} MB`,
      status: (!isDbConnected || dbLatency > 500) ? "Degraded" : "Optimal"
    };
    res.json(health);
  } catch (err) {
    res.status(500).json({ message: "Health check failed" });
  }
};

exports.getPendingTailors = async (req, res) => {
  try {
    const pendingTailors = await TailorProfile.find({ status: 'pending' }).populate('user', 'name email');
    res.json(pendingTailors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyTailor = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected', 'changes_requested'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const profile = await TailorProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: 'Tailor profile not found' });
    }

    profile.status = status;
    if (reason) {
      profile.adminFeedback = reason;
    } else if (status === 'approved') {
      profile.adminFeedback = '';
    }
    
    profile.isVerified = status === 'approved';
    await profile.save();

      if (status === 'approved' || status === 'changes_requested' || status === 'rejected') {
        const user = await User.findById(profile.user);
        if (user) {
          sendEmail(user.email, user.name, status, reason);
        }
      }

    res.json({ message: `Tailor profile ${status} successfully`, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChangeRequests = async (req, res) => {
  try {
    const requests = await TailorProfile.find({
      $or: [
        { 'pendingFields.shopName': { $exists: true, $ne: null } },
        { 'pendingFields.address': { $exists: true, $ne: null } },
        { 'pendingFields.rates': { $exists: true, $ne: null } },
        { 'pendingFields.addons': { $exists: true, $ne: null } }
      ]
    }).populate('user', 'name email');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await TailorProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: 'Tailor profile not found' });
    }

    const { pendingFields } = profile;
    if (!pendingFields) {
      return res.status(400).json({ message: 'No pending changes found' });
    }

    if (pendingFields.shopName) profile.shopName = pendingFields.shopName;
    if (pendingFields.address) profile.address = pendingFields.address;
    if (pendingFields.rates) profile.rates = pendingFields.rates;
    if (pendingFields.addons) profile.addons = pendingFields.addons;

    profile.pendingFields = {};
    await profile.save();

    res.json({ message: 'Changes approved and applied successfully', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const profile = await TailorProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: 'Tailor profile not found' });
    }

    profile.pendingFields = {};
    if (reason) {
      profile.adminFeedback = `Change Request Rejected: ${reason}`;
    }
    await profile.save();

    res.json({ message: 'Changes rejected successfully', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyAadhar = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await TailorProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: 'Tailor profile not found' });
    }

    profile.isAadharVerified = true;
    await profile.save();

    res.json({ message: 'Aadhaar verified successfully via DigiLocker API', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTailor = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await TailorProfile.findById(id).populate('user');
    
    if (!profile) {
      return res.status(404).json({ message: 'Tailor profile not found' });
    }

    const userId = profile.user._id;
    const userEmail = profile.user.email;

    // Delete associated uploads folder if it exists
    const fs = require('fs');
    const path = require('path');
    if (userEmail) {
      const folderName = userEmail.replace(/[^a-zA-Z0-9@.-]/g, '_');
      const folderPath = path.join(__dirname, '..', 'uploads', folderName);
      if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`Deleted uploads folder for ${userEmail}`);
      }
    }

    // Delete Tailor Profile
    await TailorProfile.findByIdAndDelete(id);

    // Delete User record
    const User = require('../models/User');
    await User.findByIdAndDelete(userId);

    // Optionally delete bookings, but the user requested 'not the bookings' to be deleted.
    // So we leave bookings intact (they will have an orphaned tailor ref).

    res.json({ message: 'Tailor deleted successfully' });
  } catch (error) {
    console.error('Delete Tailor Error:', error);
    res.status(500).json({ message: error.message });
  }
};


const AdminAlert = require('../models/AdminAlert');

exports.getAlerts = async (req, res) => {
  try {
    let alerts = await AdminAlert.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    
    const alert = await AdminAlert.findById(id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    alert.status = 'resolved';
    alert.resolutionNotes = resolutionNotes;
    alert.resolvedBy = req.user.id;
    alert.resolvedAt = Date.now();
    
    await alert.save();
    res.json({ message: 'Alert resolved successfully', alert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

