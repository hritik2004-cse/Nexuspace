const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const User = require('../models/User');

const checkUser = async () => {
  try {
    // Try both paths for local vs root execution
    if (!process.env.MONGO_URI) {
      require('dotenv').config({ path: '../.env' });
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    const email = "hritiksharma08725@gmail.com";
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User ${email} not found`);
      const allUsers = await User.find({}, 'email');
      console.log(`Available users: ${allUsers.map(u => u.email).join(', ')}`);
    } else {
      console.log(`✨ User ${email} found!`);
      console.log(`- Provider: ${user.provider}`);
      console.log(`- Has Password: ${!!user.password}`);
      console.log(`- Theme: ${user.theme || 'midnight'}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error("🔥 Error:", err.message);
    process.exit(1);
  }
};

checkUser();
