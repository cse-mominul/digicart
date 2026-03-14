const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

dotenv.config();

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@digicart.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'John Customer',
    email: 'john@digicart.com',
    password: 'user123',
    role: 'user',
  },
];

const demoProducts = [
  {
    name: 'Gaming Laptop Pro X15',
    price: 1299.99,
    description: 'High-performance laptop with Ryzen 7 CPU, 16GB RAM, and RTX graphics for gaming and development.',
    category: 'Laptops',
    countInStock: 8,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
  },
  {
    name: 'Wireless Ergonomic Mouse',
    price: 39.99,
    description: 'Comfort-focused wireless mouse with adjustable DPI and long battery life for daily productivity.',
    category: 'Accessories',
    countInStock: 35,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800',
  },
  {
    name: 'Mechanical RGB Keyboard',
    price: 79.99,
    description: 'Tactile mechanical keyboard with customizable RGB backlight and durable key switches.',
    category: 'Accessories',
    countInStock: 20,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
  },
  {
    name: '27-inch 4K IPS Monitor',
    price: 329.99,
    description: 'Crisp 4K monitor with accurate colors and thin bezels, ideal for coding, design, and media.',
    category: 'Monitors',
    countInStock: 12,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1527443224154-c4b4e0ad64df?w=800',
  },
  {
    name: 'USB-C Docking Station',
    price: 119.99,
    description: 'Multi-port dock with HDMI, Ethernet, and USB expansion to turn your laptop into a full workstation.',
    category: 'Accessories',
    countInStock: 18,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800',
  },
  {
    name: 'Noise-Cancelling Headphones',
    price: 149.99,
    description: 'Over-ear Bluetooth headphones with active noise cancellation and immersive audio quality.',
    category: 'Audio',
    countInStock: 22,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
  },
];

const importData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Product.deleteMany();

    const usersWithHashedPasswords = await Promise.all(
      demoUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    await User.insertMany(usersWithHashedPasswords);
    await Product.insertMany(demoProducts);

    console.log('✅ Demo users and products imported successfully');
    process.exit();
  } catch (error) {
    console.error(`❌ Seeder failed: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

importData();
