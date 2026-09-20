const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const BookingSchema = new mongoose.Schema({}, { strict: false });
const Booking = mongoose.model('Booking', BookingSchema);

async function clearOrders() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB...');
    const result = await Booking.deleteMany({});
    console.log('Deleted bookings:', result.deletedCount);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clearOrders();
