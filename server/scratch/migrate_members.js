const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Channel = require('../models/Channel');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'nexuspace' });

    console.log('Connected to MongoDB for migration...');

    const channels = await Channel.find({});
    console.log(`Found ${channels.length} channels to verify.`);

    for (const channel of channels) {
      let updated = false;

      // 1. Ensure creator/owner is in members array
      const ownerId = channel.owner || channel.creator;
      if (ownerId) {
        const isMember = channel.members.some(m => {
          const mId = m.user ? m.user.toString() : m.toString();
          return mId === ownerId.toString();
        });

        if (!isMember) {
          channel.members.push({ user: ownerId, role: 'owner' });
          updated = true;
          console.log(`Added owner ${ownerId} to channel #${channel.name}`);
        }
      }

      // 2. Convert legacy members (strings) to objects
      channel.members = channel.members.map(m => {
        if (typeof m === 'string' || m instanceof mongoose.Types.ObjectId) {
          updated = true;
          return { user: m, role: 'member' };
        }
        return m;
      });

      if (updated) {
        await channel.save();
      }

      // 3. Sync to User model
      for (const member of channel.members) {
        const uId = member.user;
        await User.findByIdAndUpdate(uId, { $addToSet: { channels: channel._id } });
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
