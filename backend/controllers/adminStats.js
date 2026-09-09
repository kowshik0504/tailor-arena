const TailorProfile = require("../models/TailorProfile");
const User = require("../models/User");
const Booking = require("../models/Booking");
const AdminAlert = require("../models/AdminAlert");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalTailors = await TailorProfile.countDocuments({ status: "approved" });
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const pendingReview = await TailorProfile.countDocuments({ status: "pending" });
    const activeBookings = await Booking.countDocuments({ status: { $nin: ["completed", "cancelled"] } });

    // Aggregate monthly revenue for the last 8 months
    const d = new Date();
    d.setMonth(d.getMonth() - 7);
    d.setDate(1);

    const bookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: d } } },
      { $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          total: { $sum: "$amount" }
      }}
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let revenueData = [];
    let currentTotalRev = 0;
    
    // Fill 8 months array
    let tempDate = new Date();
    tempDate.setMonth(tempDate.getMonth() - 7);
    for (let i = 0; i < 8; i++) {
      let m = tempDate.getMonth() + 1;
      let y = tempDate.getFullYear();
      let match = bookings.find(b => b._id.month === m && b._id.year === y);
      let v = match ? match.total : 0;
      currentTotalRev += v;
      revenueData.push({ d: monthNames[m - 1], v });
      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    // Calculate real revenue breakdown by workType
    const breakdownAgg = await Booking.aggregate([
      { $group: { _id: "$workType", total: { $sum: "$amount" } } }
    ]);
    
    let totalBreakdownRev = breakdownAgg.reduce((acc, curr) => acc + curr.total, 0) || 1; // avoid division by zero
    
    const colors = ["oklch(0.76 0.13 80)", "oklch(0.27 0.09 265)", "oklch(0.65 0.13 40)", "oklch(0.55 0.10 260)"];
    
    const breakdown = breakdownAgg.map((b, i) => ({
      name: b._id ? (b._id.charAt(0).toUpperCase() + b._id.slice(1)) : 'Other',
      v: Math.round((b.total / totalBreakdownRev) * 100),
      c: colors[i % colors.length]
    }));

    if (breakdown.length === 0) {
      breakdown.push({ name: "No data", v: 100, c: "oklch(0.76 0.13 80)" });
    }

    res.json({
      kpis: {
        totalTailors,
        totalCustomers,
        pendingReview,
        activeBookings,
        monthlyRev: `₹${currentTotalRev.toLocaleString()}`,
        expiredTrials: 0
      },
      revenue: revenueData,
      breakdown
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Stats fetch failed" });
  }
};

