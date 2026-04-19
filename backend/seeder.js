const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');

dotenv.config();

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@clickandpick.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'John Customer',
    email: 'user@clickandpick.com',
    password: 'user123',
    role: 'user',
  },
];



const demoCategories = [...new Set(demoProducts.map((product) => product.category))].map((name) => ({
  name,
  iconUrl: '',
  isActive: true,
}));

const demoCoupons = [
  {
    code: 'MOMIN',
    discountPercent: 12,
    isActive: true,
    description: 'Default welcome coupon for new customers',
  },
];

const importData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();

    const usersWithHashedPasswords = await Promise.all(
      demoUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    await User.insertMany(usersWithHashedPasswords);
    await Category.insertMany(demoCategories);
    await Product.insertMany(demoProducts);
    await Coupon.insertMany(demoCoupons);

    console.log('✅ Demo users, categories, products, and coupons imported successfully');
    process.exit();
  } catch (error) {
    console.error(`❌ Seeder failed: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

importData();
