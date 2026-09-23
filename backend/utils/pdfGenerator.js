const PDFDocument = require("pdfkit");

exports.buildInvoicePDF = (booking, doc) => {
  const customerName = booking.customer?.name || "Customer";
  const customerEmail = booking.customer?.email || "Not provided";
  const orderId = booking.orderId || `TA-${booking._id.toString().slice(-8).toUpperCase()}`;

  // Header
  doc.font("Helvetica-Bold").fontSize(24).fillColor("#0f172a").text("INVOICE", { align: "center", tracking: 4 });
  doc.font("Helvetica").fontSize(10).fillColor("#64748b").text("TAILOR ARENA", { align: "center" });
  doc.text(`Order #${orderId}`, { align: "center" });
  doc.text(`Printed on ${new Date().toLocaleDateString()}`, { align: "center" });
  
  doc.moveDown(2);
  
  // Customer Box
  doc.rect(50, doc.y, 500, 60).fillAndStroke("#ffffff", "#e2e8f0");
  doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(18).text(customerName, 65, doc.y - 50);
  doc.font("Helvetica").fontSize(10).fillColor("#64748b").text(`Email: ${customerEmail}`, 65, doc.y + 5);
  doc.moveDown(3);

  // Dress Details
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#0f172a").text("Dress Details", 50, doc.y);
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(8).fillColor("#94a3b8").text("DRESS TYPE", 50, doc.y);
  doc.font("Helvetica").fontSize(12).fillColor("#0f172a").text(booking.dressType || "N/A", 50, doc.y + 2);
  
  doc.font("Helvetica-Bold").fontSize(8).fillColor("#94a3b8").text("WORK TYPE", 250, doc.y - 22);
  doc.font("Helvetica").fontSize(12).fillColor("#0f172a").text(booking.workType || "Stitching", 250, doc.y + 2);
  doc.moveDown(1.5);
  
  // Measurements
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#0f172a").text("Measurements", 50, doc.y);
  doc.moveDown(0.5);
  doc.font("Helvetica").fontSize(12).fillColor("#0f172a").text("Shop Visit", 50, doc.y);
  doc.moveDown(1.5);
  
  // Appointment
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#0f172a").text("Appointment", 50, doc.y);
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(8).fillColor("#94a3b8").text("DATE", 50, doc.y);
  doc.font("Helvetica").fontSize(12).fillColor("#0f172a").text(booking.date ? new Date(booking.date).toLocaleDateString() : "Pending", 50, doc.y + 2);
  doc.font("Helvetica-Bold").fontSize(8).fillColor("#94a3b8").text("TIME SLOT", 250, doc.y - 22);
  doc.font("Helvetica").fontSize(12).fillColor("#0f172a").text(booking.timeSlot || "10:00 AM", 250, doc.y + 2);
  doc.moveDown(1.5);

  // Payment Breakdown
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#0f172a").text("Payment Breakdown", 50, doc.y);
  doc.moveDown(0.5);
  
  const amount = booking.amount || 0;
  const advance = booking.baseAmountPaid || Math.min(500, amount);
  const remaining = amount - advance;
  
  doc.font("Helvetica-Bold").fontSize(8).fillColor("#94a3b8").text("TOTAL AMOUNT", 50, doc.y);
  doc.font("Helvetica").fontSize(16).fillColor("#0f172a").text(`INR ${amount}`, 50, doc.y + 2);
  
  doc.font("Helvetica-Bold").fontSize(8).fillColor("#94a3b8").text("ADVANCE PAID", 250, doc.y - 30);
  doc.font("Helvetica").fontSize(16).fillColor("#059669").text(`INR ${advance}`, 250, doc.y + 2);
  doc.font("Helvetica").fontSize(10).fillColor("#64748b").text("Online", 250, doc.y + 2);
  doc.moveDown();

  doc.font("Helvetica-Bold").fontSize(8).fillColor("#94a3b8").text("REMAINING BALANCE", 50, doc.y);
  doc.font("Helvetica").fontSize(16).fillColor("#e11d48").text(`INR ${remaining}`, 50, doc.y + 2);

  doc.font("Helvetica-Bold").fontSize(8).fillColor("#94a3b8").text("REMAINING STATUS", 250, doc.y - 30);
  doc.font("Helvetica").fontSize(12).fillColor("#059669").text(booking.paymentStatus === 'paid' ? "Paid" : "Pending", 250, doc.y + 2);
  
  doc.end();
};
