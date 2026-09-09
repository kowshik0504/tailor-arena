const TailorProfile = require("../models/TailorProfile");
const User = require("../models/User");
const Booking = require("../models/Booking");

exports.getReportsData = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalTailors = await TailorProfile.countDocuments({ status: "approved" });
    
    // Active users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({ updatedAt: { $gte: thirtyDaysAgo } });

    // Booking Growth
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);

    const thisMonthBookings = await Booking.countDocuments({ createdAt: { $gte: thisMonthStart } });
    const lastMonthBookings = await Booking.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } });
    
    let bookingGrowth = "+0%";
    if (lastMonthBookings > 0) {
      const growth = ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100;
      bookingGrowth = (growth >= 0 ? "+" : "") + growth.toFixed(1) + "%";
    }

    // Bookings Chart (last 6 months)
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    d.setDate(1);

    const bookingAgg = await Booking.aggregate([
      { $match: { createdAt: { $gte: d } } },
      { $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          total: { $sum: 1 }
      }}
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let bookings = [];
    let tempDate = new Date();
    tempDate.setMonth(tempDate.getMonth() - 5);
    for (let i = 0; i < 6; i++) {
      let m = tempDate.getMonth() + 1;
      let y = tempDate.getFullYear();
      let match = bookingAgg.find(b => b._id.month === m && b._id.year === y);
      bookings.push({ d: monthNames[m - 1], v: match ? match.total : 0 });
      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    // Services (dressType)
    let servicesAgg = await Booking.aggregate([
      { $group: { _id: "$dressType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    let services = servicesAgg.map(s => ({ name: s._id || "Other", v: s.count }));

    // Regions
    let tailorsRegion = await TailorProfile.aggregate([
      { $match: { "address.city": { $exists: true } } },
      { $group: { _id: "$address.city", tailors: { $sum: 1 } } }
    ]);
    let regionsMap = {};
    tailorsRegion.forEach(r => {
      regionsMap[r._id] = { r: r._id, customers: 0, tailors: r.tailors };
    });

    // We don't reliably have city for users right now, so we map tailors regions
    let regions = Object.values(regionsMap).sort((a,b) => b.tailors - a.tailors).slice(0, 5);
    if(regions.length === 0) regions = [{ r: "No Data", customers: 0, tailors: 0 }];

    // Top Tailors
    let topTailorsAgg = await Booking.aggregate([
      { $group: { _id: "$tailor", orders: { $sum: 1 } } },
      { $sort: { orders: -1 } },
      { $limit: 4 }
    ]);

    let topTailors = [];
    for (const t of topTailorsAgg) {
      const p = await TailorProfile.findById(t._id).populate("user", "name");
      if (p) {
        topTailors.push({
          name: p.shopName || p.user?.name || "Unknown",
          city: p.address?.city || "Unknown",
          orders: t.orders,
          rating: p.rating || 4.5
        });
      }
    }

    res.json({
      kpis: {
        totalCustomers,
        totalTailors,
        activeUsers,
        bookingGrowth
      },
      bookings,
      services,
      regions,
      topTailors
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reports data fetch failed" });
  }
};

