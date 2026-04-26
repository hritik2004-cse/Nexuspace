const mongoose = require("mongoose");
const { ServerApiVersion } = require("mongodb");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "nexuspace",
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ Error connecting to MongoDB: ${error.message}`);
    console.error(
      `⚠️ Check MONGO_URI first. A malformed URI, bad credentials, or blocked Atlas IP can all cause this.`,
    );
    console.error(
      `⚠️ The server will stay online so the frontend does not crash, but database queries will fail until the connection succeeds.\n`,
    );
  }
};

module.exports = connectDB;
