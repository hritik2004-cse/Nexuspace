const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    
    const users = await User.find({}, 'email name provider');
    console.log(`Found ${users.length} users:`);
    users.forEach(u => console.log(`- ${u.email} (${u.name}, ${u.provider})`));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUser();
