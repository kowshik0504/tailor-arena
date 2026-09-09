const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  tailor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TailorProfile',
    required: true
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  isBooked: { type: Boolean, default: false }
}, { timestamps: true });

timeSlotSchema.index({ tailor: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
