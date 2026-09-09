const TailorProfile = require("../models/TailorProfile");
const AdminAlert = require("../models/AdminAlert");

exports.getRecentActivity = async (req, res) => {
  try {
    const pendingTailors = await TailorProfile.find({ status: "pending" })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10);
      
    const alerts = await AdminAlert.find({})
      .sort({ createdAt: -1 })
      .limit(10);
      
    let activity = [];

    pendingTailors.forEach(t => {
      activity.push({
        _id: t._id,
        type: "tailor_registration",
        title: "New tailor registration",
        desc: `${t.shopName || t.user?.name} — awaiting initial review`,
        when: t.createdAt,
        tint: "bg-champagne text-navy"
      });
    });

    alerts.forEach(a => {
      activity.push({
        _id: a._id,
        type: "alert",
        title: a.title,
        desc: a.description,
        when: a.createdAt,
        tint: a.severity === "high" ? "bg-rose-100 text-rose-700" : "bg-gold/20 text-navy-deep"
      });
    });

    // Sort combined by date desc
    activity.sort((a, b) => new Date(b.when) - new Date(a.when));

    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
};

