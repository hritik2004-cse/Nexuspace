const mongoose = require('mongoose');
require('dotenv').config({ path: '../server/.env' });
const User = require('../server/models/User');

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    
    const email = "hritiksharma08725@gmail.com";
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User ${email} not found`);
    } else {
      console.log(`User ${email} found!`);
      console.log(`Provider: ${user.provider}`);
      console.log(`Has Password: ${!!user.password}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUser();
