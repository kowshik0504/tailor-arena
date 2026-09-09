const TailorProfile = require("../models/TailorProfile");

exports.requestProfileChange = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const { shopName, address, reason, documentUrl } = req.body;
    
    // Check if there are already pending changes
    if (Object.keys(profile.pendingFields || {}).length > 0) {
      return res.status(400).json({ message: "You already have a pending change request under review." });
    }

    profile.pendingFields = {};
    if (shopName) profile.pendingFields.shopName = shopName;
    if (address) profile.pendingFields.address = address;
    if (documentUrl) profile.pendingFields.documentUrl = documentUrl;
    if (reason) profile.pendingFields.reason = reason;

    // Only save if there is actually something requested
    if (Object.keys(profile.pendingFields).length > 0) {
      profile.adminFeedback = ""; // clear previous rejection feedback when they submit a new one
      await profile.save();
      res.json({ message: "Change request submitted to admin successfully.", pendingFields: profile.pendingFields });
    } else {
      res.status(400).json({ message: "No valid fields provided to change." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit change request." });
  }
};

