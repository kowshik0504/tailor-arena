const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
  dressType: { type: String, required: true },
  stitchingCost: { type: Number, required: true },
  alterationRate: { type: Number, required: true }
});

const addressSchema = new mongoose.Schema({
  house: { type: String, default: '' },
  street: { type: String, default: '' },
  area: { type: String, default: '' },
  city: { type: String, default: '' }
});

const documentsSchema = new mongoose.Schema({
  govtId: { type: String, default: '' },
  passportPhoto: { type: String, default: '' },
  tailorPhoto: { type: String, default: '' },
  machinePhoto: { type: String, default: '' },
  shopPhoto: { type: String, default: '' }
});

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  image: { type: String, default: '' }
});

const designSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  category: { type: String, default: 'Custom Designs' },
  price: { type: Number, default: 0 },
  delivery: { type: Number, default: 7 },
  orders: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  fabric: { type: String, default: '' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Expert'], default: 'Medium' },
  notes: { type: String, default: '' },
  trending: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  gradient: { type: String, default: 'bg-gradient-cream' },
  height: { type: String, default: 'h-80' }
});

const completedWorkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tag: { type: String, default: '' },
  image: { type: String, default: '' },
  g: { type: String, default: 'bg-gradient-gold' },
  h: { type: String, default: 'h-80' }
}, { timestamps: true });

const tailorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopId: {
    type: String,
    unique: true,
    sparse: true
  },
  phone: { type: String, default: '' },
  shopNumber: { type: String },
  houseDetails: { type: String },
  aadharNumber: { type: String },
  isAadharVerified: { type: Boolean, default: false },
  aadharDocUrl: { type: String },
  machinePhotoUrl: { type: String },
  gstin: { type: String },
  established: { type: String },
  workType: {
    type: String,
    enum: ['shop', 'home'],
    required: true
  },
  setupType: {
    type: String,
    enum: ['shop', 'home']
  },
  address: { type: addressSchema, default: () => ({}) },
  documents: { type: documentsSchema, default: () => ({}) },
  isVerified: { type: Boolean, default: false },
  isPaused: { type: Boolean, default: false },
  maxWeeklyOrders: { type: Number, default: 14 },
  workingDays: {
    type: Object,
    default: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: false }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'changes_requested'],
    default: 'pending'
  },
  adminFeedback: { type: String, default: '' },
  pendingFields: { type: Object, default: {} },
  registrationFee: { type: Number, required: true },
  paid: { type: Boolean, default: false },
  activationFeeTriggered: { type: Boolean, default: false },
  razorpayOrderId: { type: String },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['gpay', 'phonepe', 'credit_card', 'debit_card', 'pay_later', 'online']
  },
  payLater: { type: Boolean, default: false },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  shopName: { type: String },
  rates: [rateSchema],
  addons: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String }
  }],
  services: [serviceSchema],
  designs: [designSchema],
  completedWorks: [completedWorkSchema],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  withdrawals: [{
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' }
  }]
}, { timestamps: true });

tailorProfileSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('TailorProfile', tailorProfileSchema);
