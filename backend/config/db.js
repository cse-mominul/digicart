const mongoose = require('mongoose');
const colors = require('colors');

/**
 * Connects to local MongoDB using the MONGO_URI environment variable.
 * Logs a success message on connection, or exits the process on failure.
 */

const connectDB = async (retries = 10, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ MongoDB Connected locally for DigiCart');
      return;
    } catch (error) {
      console.error(
        `✖ MongoDB Connection Error (attempt ${i + 1}/${retries}): `.red.bold + `${error.message}`.red
      );
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      } else {
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
