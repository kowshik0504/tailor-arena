const User = require('../models/User');
const authController = require('../controllers/authController'); // existing email logic

/**
 * Checks if the tailor has a specific notification preference enabled
 */
const isPreferenceEnabled = async (tailorId, preferenceKey) => {
  try {
    const tailor = await User.findById(tailorId);
    if (!tailor) return false;
    // Default to true if not explicitly set to false
    if (!tailor.preferences) return true;
    return tailor.preferences[preferenceKey] !== false;
  } catch (error) {
    console.error("Error checking preferences:", error);
    return false;
  }
};

/**
 * MOCK: Send WhatsApp Message (Logs to console)
 */
const mockSendWhatsApp = (phone, message) => {
  console.log(`\n======================================================`);
  console.log(`📱 [MOCK WHATSAPP MESSAGE SENT]`);
  console.log(`To: ${phone}`);
  console.log(`Message:`);
  console.log(message);
  console.log(`======================================================\n`);
};

/**
 * MOCK: Send SMS Message (Logs to console)
 */
const mockSendSMS = (phone, message) => {
  console.log(`\n======================================================`);
  console.log(`💬 [MOCK SMS SENT]`);
  console.log(`To: ${phone}`);
  console.log(`Message:`);
  console.log(message);
  console.log(`======================================================\n`);
};


// ================= BOOKING LIFECYCLE EVENTS =================

exports.notifyBookingAccepted = async (tailorId, customerEmail, customerName, customerPhone, tailorName, date, time, bookingId) => {
  const [emailEnabled, whatsappEnabled] = await Promise.all([
    isPreferenceEnabled(tailorId, 'emailNotifications'),
    isPreferenceEnabled(tailorId, 'whatsappUpdates')
  ]);

  if (emailEnabled) {
    await authController.sendAcceptanceEmail(customerEmail, customerName, tailorName, date, time, bookingId);
  }

  if (whatsappEnabled && customerPhone) {
    mockSendWhatsApp(customerPhone, `Hi ${customerName}, great news! Your booking with ${tailorName} for ${new Date(date).toDateString()} at ${time} has been accepted. View details on Tailor Arena.`);
  }
};

exports.notifyBookingRejected = async (tailorId, customerEmail, customerName, customerPhone, tailorName, reason) => {
  const [emailEnabled, whatsappEnabled] = await Promise.all([
    isPreferenceEnabled(tailorId, 'emailNotifications'),
    isPreferenceEnabled(tailorId, 'whatsappUpdates')
  ]);

  if (emailEnabled) {
    await authController.sendRejectionEmail(customerEmail, customerName, tailorName, reason);
  }

  if (whatsappEnabled && customerPhone) {
    mockSendWhatsApp(customerPhone, `Hi ${customerName}, unfortunately ${tailorName} could not accept your booking request due to: ${reason}.`);
  }
};

exports.notifyBookingDelayed = async (tailorId, customerEmail, customerName, customerPhone, tailorName, newDate) => {
  const [emailEnabled, whatsappEnabled] = await Promise.all([
    isPreferenceEnabled(tailorId, 'emailNotifications'),
    isPreferenceEnabled(tailorId, 'whatsappUpdates')
  ]);

  if (emailEnabled) {
    await authController.sendDelayEmail(customerEmail, customerName, tailorName, newDate);
  }

  if (whatsappEnabled && customerPhone) {
    mockSendWhatsApp(customerPhone, `Hi ${customerName}, please note that ${tailorName} has rescheduled your order completion to ${new Date(newDate).toDateString()}.`);
  }
};

exports.notifyBookingCompleted = async (tailorId, customerEmail, customerName, customerPhone, tailorName, dressType) => {
  const [emailEnabled, whatsappEnabled] = await Promise.all([
    isPreferenceEnabled(tailorId, 'emailNotifications'),
    isPreferenceEnabled(tailorId, 'whatsappUpdates')
  ]);

  if (emailEnabled) {
    await authController.sendCompletionEmail(customerEmail, customerName, tailorName, dressType);
  }

  if (whatsappEnabled && customerPhone) {
    mockSendWhatsApp(customerPhone, `Hi ${customerName}, great news! Your ${dressType} is ready for pickup/delivery from ${tailorName}.`);
  }
};

exports.notifyPaymentReminder = async (tailorId, customerName, customerPhone, amount) => {
  const smsEnabled = await isPreferenceEnabled(tailorId, 'smsReminders');

  if (smsEnabled && customerPhone) {
    mockSendSMS(customerPhone, `Hi ${customerName}, this is a gentle reminder regarding a pending payment of ₹${amount} for your recent order at Tailor Arena. Please clear the dues at your earliest convenience.`);
  }
};
