const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  otp: {
  type: String
},
otpExpires: {
  type: Date
},
  location: {
  street: String,
  area: String,
  city: String,
  pincode: String,
  latitude: Number,
  longitude: Number
},

isProfileComplete: {
  type: Boolean,
  default: false
},
preferences: {
  emailNotifications: { type: Boolean, default: true },
  whatsappUpdates: { type: Boolean, default: true },
  smsReminders: { type: Boolean, default: true },
  twoFactorAuth: { type: Boolean, default: true }
},
trustedDevices: [{
  deviceId: String,
  addedAt: { type: Date, default: Date.now },
  expiresAt: Date
}],
  role: {
    type: String,
    enum: ['customer', 'tailor', 'admin'],
    required: true
  },
  profilePic: {
    type: String,
    default: ''
  },
  resetToken: String,
  resetTokenExpiry: Date
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
