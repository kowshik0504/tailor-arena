require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const TailorProfile = require('./models/TailorProfile');

async function run() {
  try {
    await connectDB();
    console.log("Connected to MongoDB.");

    // Find the most recently created TailorProfile
    const lastProfile = await TailorProfile.findOne().sort({ createdAt: -1 });
    
    if (lastProfile) {
      console.log("Found recent TailorProfile. ID:", lastProfile._id);
      
      const user = await User.findById(lastProfile.user);
      if (user) {
        console.log("Associated User found:", user.email);
        await User.findByIdAndDelete(user._id);
        console.log("User deleted.");
      } else {
        console.log("Associated User not found.");
      }

      await TailorProfile.findByIdAndDelete(lastProfile._id);
      console.log("TailorProfile deleted.");
    } else {
      console.log("No TailorProfiles found in DB.");
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
