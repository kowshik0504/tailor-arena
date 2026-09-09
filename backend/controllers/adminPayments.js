const Booking = require("../models/Booking");
const TailorProfile = require("../models/TailorProfile");
const User = require("../models/User");

exports.getPaymentsData = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // KPIs
    const recentBookings = await Booking.find({ createdAt: { $gte: sevenDaysAgo } });
    
    let customerPayments = 0;
    let pendingPayments = 0;
    let completedWeekCount = 0;

    recentBookings.forEach(b => {
      if (b.paymentStatus === "paid") {
        customerPayments += (b.amount || 0);
        completedWeekCount++;
      } else {
        pendingPayments += (b.amount || 0);
      }
    });

    const tailorPayouts = customerPayments * 0.8; // 80% to tailors

    const tailors = await TailorProfile.find({ paymentStatus: "paid" });
    const activationFees = tailors.reduce((acc, t) => acc + (t.registrationFee || 0), 0);

    // Chart Data (Last 7 days volume)
    const flow = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);

      const dayBookings = recentBookings.filter(b => b.createdAt >= d && b.createdAt < nextDay && b.paymentStatus === "paid");
      const dayTotal = dayBookings.reduce((acc, b) => acc + (b.amount || 0), 0);
      
      flow.push({ d: days[d.getDay()], v: dayTotal });
    }

    // Transactions list
    const allBookings = await Booking.find()
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(20);

    const txns = allBookings.map(b => ({
      id: "TX-" + b._id.toString().slice(-4).toUpperCase(),
      who: b.customer?.name || "Unknown Customer",
      type: "Customer Booking",
      amount: `₹${b.amount || 0}`,
      status: b.paymentStatus === "paid" ? "Completed" : "Pending",
      when: b.createdAt,
      paymentMethod: b.paymentMethod || "online"
    }));

    // Add tailor activations to txns too
    const allTailors = await TailorProfile.find({ paymentStatus: "paid" })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    allTailors.forEach(t => {
      txns.push({
        id: "TX-" + t._id.toString().slice(-4).toUpperCase(),
        who: t.shopName || t.user?.name || "Unknown Tailor",
        type: "Tailor Activation",
        amount: `₹${t.registrationFee || 0}`,
        status: "Completed",
        when: t.createdAt,
        paymentMethod: t.paymentMethod || "online"
      });
    });

    txns.sort((a, b) => new Date(b.when) - new Date(a.when));

    res.json({
      kpis: {
        customerPayments: `₹${(customerPayments / 100000).toFixed(1)} L`,
        tailorPayouts: `₹${(tailorPayouts / 100000).toFixed(1)} L`,
        activationFees: `₹${activationFees.toLocaleString()}`,
        subscriptionRevenue: "₹0", // Not implemented yet
        pendingPayments: `₹${pendingPayments.toLocaleString()}`,
        completedWeek: completedWeekCount
      },
      flow,
      txns: txns.slice(0, 20)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch payments data" });
  }
};

