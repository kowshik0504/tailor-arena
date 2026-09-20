import os
import re

with open("backend/controllers/authController.js", "r", encoding="utf-8") as f:
    content = f.read()

# Make sure pdfkit is imported
if "const PDFDocument = require('pdfkit');" not in content:
    content = "const PDFDocument = require('pdfkit');\n" + content

# Change sendHandoverEmail signature and body
old_func = r"exports\.sendHandoverEmail = async \(email, name, dressType, tailorName\) => \{[\s\S]*?catch \(error\) \{[\s\S]*?console\.error\('Error sending handover email:', error\);\n\s*\}\n\s*\};"
new_func = """exports.sendHandoverEmail = async (booking) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const email = booking.customer.email;
    const name = booking.customer.name;
    const dressType = booking.dressType;
    const tailorName = booking.tailor.businessName || 'Tailor Arena';
    
    // Generate PDF Invoice in memory
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    
    // Write PDF content
    doc.fontSize(20).text('Tailor Arena - Official Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: #${booking._id.toString().slice(-8).toUpperCase()}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Customer Details', { underline: true });
    doc.fontSize(12).text(`Name: ${name}`);
    doc.text(`Email: ${email}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Order Details', { underline: true });
    doc.fontSize(12).text(`Tailor: ${tailorName}`);
    doc.text(`Dress Type: ${dressType}`);
    doc.text(`Appointment Slot: ${booking.timeSlot || 'N/A'}`);
    doc.text(`Handed Over: ${new Date().toLocaleString()}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Payment Breakdown', { underline: true });
    doc.fontSize(12).text(`Total Amount: INR ${booking.amount}`);
    doc.text(`Advance Paid: INR ${booking.baseAmountPaid || Math.min(500, booking.amount)} (Mode: Online)`);
    const remaining = booking.amount - (booking.baseAmountPaid || Math.min(500, booking.amount));
    doc.text(`Remaining Paid: INR ${remaining} (Mode: ${booking.paymentMethod ? booking.paymentMethod.toUpperCase() : 'ONLINE'})`);
    doc.moveDown();
    doc.fontSize(14).text('Thank you for choosing Tailor Arena!', { align: 'center' });
    
    doc.end();

    const pdfBuffer = await new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    await transporter.sendMail({
      from: `"Tailor Arena" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your clothes have been handed over & Invoice!',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2D3436; text-align: center;">Order Completed & Handed Over</h2>
        <p>Hi ${name},</p>
        <p>Your <strong>${dressType}</strong> has been successfully handed over by <strong>${tailorName}</strong>.</p>
        <p>We have attached the official invoice PDF to this email for your records.</p>
        <p>Thank you for choosing Tailor Arena! We hope you love your new outfit.</p>
        <p>Best Regards,<br>Tailor Arena Team</p>
      </div>`,
      attachments: [{
        filename: `Invoice_${booking._id.toString().slice(-8).toUpperCase()}.pdf`,
        content: pdfBuffer
      }]
    });
  } catch (error) {
    console.error('Error sending handover email:', error);
  }
};"""

content = re.sub(old_func, new_func, content)
with open("backend/controllers/authController.js", "w", encoding="utf-8") as f:
    f.write(content)

with open("backend/controllers/bookingController.js", "r", encoding="utf-8") as f:
    bookingController = f.read()

# Update the call to sendHandoverEmail in bookingController
bookingController = bookingController.replace(
    "await sendHandoverEmail(booking.customer.email, booking.customer.name, booking.dressType, booking.tailor.businessName);",
    "await require('./authController').sendHandoverEmail(booking);"
)
with open("backend/controllers/bookingController.js", "w", encoding="utf-8") as f:
    f.write(bookingController)
print("Done")
