const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

const createOrUpdateAdminUser = async () => {
  try {
    await connectDB();

    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminData = {
      name: 'Admin User',
      email: 'admin@digicart.com',
      password: hashedPassword,
      role: 'admin',
    };

    const adminUser = await User.findOneAndUpdate(
      { email: adminData.email },
      adminData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).select('-password');

    console.log('✅ Admin user is ready for login');
    console.log(`Name: ${adminUser.name}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ Failed to create admin user: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

createOrUpdateAdminUser();
