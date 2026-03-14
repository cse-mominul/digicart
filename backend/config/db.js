const mongoose = require('mongoose');
const colors = require('colors');

/**
 * Connects to local MongoDB using the MONGO_URI environment variable.
 * Logs a success message on connection, or exits the process on failure.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected locally for DigiCart');
  } catch (error) {
    console.error(
      `✖ MongoDB Connection Error: `.red.bold + `${error.message}`.red
    );
    process.exit(1); // Exit with failure code
  }
};

module.exports = connectDB;
