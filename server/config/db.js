const mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'nexuspace',
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ Error connecting to MongoDB: ${error.message}`);
    console.error(`⚠️ Network/Firewall is permanently blocking the MongoDB Atlas cluster.`);
    console.error(`⚠️ The server will stay online so the frontend does not crash, but database queries will fail until the network is fixed.\n`);
    // process.exit(1); -> Removed so the backend server stays alive forever for socket.io!
  }
};

module.exports = connectDB;
