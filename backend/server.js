const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const tailorRoutes = require('./routes/tailorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = 'tailors12345678@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: 'kowshik@123',
        role: 'admin',
        isProfileComplete: true
      });
      console.log('✅ Default Admin seeded successfully');
    } else {
      // Force update role and password just in case they were registered as tailor
      adminExists.role = 'admin';
      adminExists.password = 'kowshik@123';
      await adminExists.save();
      console.log('✅ Default Admin updated successfully');
    }
  } catch (err) {
    console.error('Failed to seed admin:', err);
  }
};

connectDB().then(() => {
  seedAdmin();
});

// Server started successfully
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/tailors', tailorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'TAILOR ARENA API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


