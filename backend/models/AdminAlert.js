const mongoose = require('mongoose');

const adminAlertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['freemium_expiring', 'payment_failure', 'verification_delay', 'customer_support', 'suspicious_activity'], required: true },
  severity: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  referenceModel: { type: String, enum: ['User', 'TailorProfile', 'Booking'] },
  referenceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'referenceModel' },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  resolutionNotes: { type: String, default: '' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('AdminAlert', adminAlertSchema);

