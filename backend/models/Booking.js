const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tailor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TailorProfile',
    required: true
  },
  dressType: { type: String, required: true },
  workType: {
    type: String,
    enum: ['stitching', 'alteration'],
    default: 'stitching'
  },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'confirmed', 'completed', 'cancelled', 'hold', 'in-progress'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'pay_later'],
    default: 'pending'
  },
  amount: { type: Number, required: true },
  razorpayOrderId: { type: String },
  phonepeTransactionId: { type: String },
  paymentMethod: {
    type: String,
    enum: ['gpay', 'phonepe', 'credit_card', 'debit_card', 'cash', 'online']
  },
  notes: { type: String },
  designImg: { type: String },
  priority: { 
    type: String, 
    enum: ['Normal', 'High', 'VIP'],
    default: 'Normal' 
  },
  measurements: [{
    label: String,
    v: String
  }],
  chat: [{
    from: { type: String, enum: ['tailor', 'customer'] },
    text: String,
    image: String,
    time: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
