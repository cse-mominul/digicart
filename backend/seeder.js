const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

    category: 'Laptops',
    countInStock: 8,
    brand: 'Click&Pick',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=801',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=802',
    ],
    additionalInfo: [
      { label: 'Processor', value: 'Ryzen 7' },
      { label: 'RAM', value: '16GB' },
      { label: 'Storage', value: '1TB SSD' },
      { label: 'Graphics', value: 'RTX Series' },
      { label: 'Warranty', value: '1 Year' },
    ],
  },
  {
    name: 'Wireless Ergonomic Mouse',
    price: 39.99,
    description: 'Comfort-focused wireless mouse with adjustable DPI and long battery life for daily productivity.',
    category: 'Accessories',
    countInStock: 35,
    brand: 'Click&Pick',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800',
    images: [
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800',
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=801',
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=802',
    ],
    additionalInfo: [
      { label: 'Connectivity', value: '2.4G + Bluetooth' },
      { label: 'DPI', value: 'Adjustable' },
      { label: 'Battery', value: 'AA' },
      { label: 'Warranty', value: '6 Months' },
    ],
  },
  {
    name: 'Mechanical RGB Keyboard',
    price: 79.99,
    description: 'Tactile mechanical keyboard with customizable RGB backlight and durable key switches.',
    category: 'Accessories',
    countInStock: 20,
    brand: 'Click&Pick',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=801',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=802',
    ],
    additionalInfo: [
      { label: 'Switch Type', value: 'Mechanical' },
      { label: 'Layout', value: '87 Keys' },
      { label: 'Lighting', value: 'RGB' },
      { label: 'Connection', value: 'Wired' },
    ],
  },
  {
    name: '27-inch 4K IPS Monitor',
    price: 329.99,
    description: 'Crisp 4K monitor with accurate colors and thin bezels, ideal for coding, design, and media.',
    category: 'Monitors',
    countInStock: 12,
    brand: 'Click&Pick',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1527443224154-c4b4e0ad64df?w=800',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4b4e0ad64df?w=800',
      'https://images.unsplash.com/photo-1527443224154-c4b4e0ad64df?w=801',
      'https://images.unsplash.com/photo-1527443224154-c4b4e0ad64df?w=802',
    ],
    additionalInfo: [
      { label: 'Resolution', value: '4K UHD' },
      { label: 'Panel', value: 'IPS' },
      { label: 'Refresh Rate', value: '60Hz' },
      { label: 'Warranty', value: '1 Year' },
    ],
  },
  {
    name: 'USB-C Docking Station',
    price: 119.99,
    description: 'Multi-port dock with HDMI, Ethernet, and USB expansion to turn your laptop into a full workstation.',
    category: 'Accessories',
    countInStock: 18,
    brand: 'Click&Pick',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800',
    images: [
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800',
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=801',
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=802',
    ],
    additionalInfo: [
      { label: 'Ports', value: 'HDMI, Ethernet, USB' },
      { label: 'Input', value: 'USB-C' },
      { label: 'Use Case', value: 'Workstation expansion' },
      { label: 'Warranty', value: '1 Year' },
    ],
  },
  {
    name: 'Noise-Cancelling Headphones',
    price: 149.99,
    description: 'Over-ear Bluetooth headphones with active noise cancellation and immersive audio quality.',
    category: 'Audio',
    countInStock: 22,
    brand: 'Click&Pick',
    stock: 22,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=801',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=802',
    ],
    additionalInfo: [
      { label: 'Connectivity', value: 'Bluetooth' },
      { label: 'Noise Cancellation', value: 'Active ANC' },
      { label: 'Battery', value: 'Rechargeable' },
      { label: 'Warranty', value: '1 Year' },
    ],
  },
  {
    name: 'Portable SSD 1TB',
    price: 99.99,
    description: 'Fast and durable portable SSD with 1TB storage capacity for backup and file transfers.',
    category: 'Storage',
    countInStock: 30,
    brand: 'Click&Pick',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800',
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=801',
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=802',
    ],
    additionalInfo: [
      { label: 'Capacity', value: '1TB' },
      { label: 'Speed', value: '550MB/s' },
      { label: 'Interface', value: 'USB-C' },
      { label: 'Warranty', value: '3 Years' },
    ],
  },
  {
    name: '4K USB Webcam',
    brand: 'Click&Pick',
    price: 89.99,
    description: 'Crystal-clear 4K webcam with built-in microphone for online meetings and streaming.',
    category: 'Accessories',
    countInStock: 25,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=801',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=802',
    ],
    additionalInfo: [
      { label: 'Resolution', value: '4K' },
      { label: 'Microphone', value: 'Built-in' },
      { label: 'Focus', value: 'Auto' },
      { label: 'Connection', value: 'USB' },
    ],
  },
  {
    name: 'Ultra-Wide Monitor 34"',
    brand: 'Click&Pick',
    price: 499.99,
    description: 'Immersive 34-inch ultra-wide curved monitor with HDR support for gaming and productivity.',
    category: 'Monitors',
    countInStock: 8,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=801',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=802',
    ],
    additionalInfo: [
      { label: 'Screen Size', value: '34 inch' },
      { label: 'Resolution', value: '3440x1440' },
      { label: 'Refresh Rate', value: '165Hz' },
      { label: 'Warranty', value: '2 Years' },
    ],
  },
  {
    name: 'USB Hub 7-Port',
    brand: 'Click&Pick',
    price: 29.99,
    description: 'Expand your laptop connectivity with 7 USB 3.0 ports supporting high-speed data transfer.',
    category: 'Accessories',
    countInStock: 40,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800',
    images: [
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800',
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=801',
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=802',
    ],
    additionalInfo: [
      { label: 'Ports', value: '7x USB 3.0' },
      { label: 'Speed', value: '5Gbps' },
      { label: 'Power', value: 'Adapter Included' },
      { label: 'Warranty', value: '1 Year' },
    ],
  },
  {
    name: 'Laptop Stand Adjustable',
    brand: 'Click&Pick',
    price: 34.99,
    description: 'Ergonomic aluminum laptop stand with adjustable height for better posture and ventilation.',
    category: 'Accessories',
    countInStock: 50,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=801',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=802',
    ],
    additionalInfo: [
      { label: 'Material', value: 'Aluminum' },
      { label: 'Max Load', value: '25 lbs' },
      { label: 'Height Range', value: 'Adjustable' },
      { label: 'Warranty', value: '6 Months' },
    ],
  },

  {
    name: 'Budget Laptop 15.6 HD',
    brand: 'Click&Pick',
    price: 349.99,
    description: 'Affordable laptop with 15.6" HD display, 8GB RAM, and 256GB SSD for everyday computing.',
    category: 'Laptops',
    countInStock: 12,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=801',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=802',
    ],
    additionalInfo: [
      { label: 'Screen', value: '15.6" HD' },
      { label: 'Processor', value: 'Intel N5100' },
      { label: 'RAM', value: '8GB' },
      { label: 'Warranty', value: '1 Year' },
    ],
  },
  {
    name: 'Ultrabook 13 inch FHD',
    brand: 'Click&Pick',
    price: 699.99,
    description: 'Lightweight and sleek ultrabook with FHD display, 256GB SSD, and 10-hour battery life.',
    category: 'Laptops',
    countInStock: 10,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=801',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=802',
    ],
    additionalInfo: [
      { label: 'Screen', value: '13 inch FHD' },
      { label: 'Weight', value: '1.2 kg' },
      { label: 'Battery', value: '10 Hours' },
      { label: 'Warranty', value: '1 Year' },
    ],
  },
  {
    name: 'Graphics Card RTX 3070 Ti',
    brand: 'Click&Pick',
    price: 799.99,
    description: 'High-end graphics card for 4K gaming and professional 3D rendering with 8GB GDDR6X memory.',
    category: 'Components',
    countInStock: 5,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=801',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=802',
    ],
    additionalInfo: [
      { label: 'Memory', value: '8GB GDDR6X' },
      { label: 'Interface', value: 'PCI Express 4.0' },
      { label: 'Power', value: '290W' },
      { label: 'Warranty', value: '2 Years' },
    ],
  },
  {
    name: 'SSD 2TB NVMe M.2',
    brand: 'Click&Pick',
    price: 179.99,
    description: 'Ultra-fast NVMe M.2 SSD with 2TB capacity for rapid system boot and file transfers.',
    category: 'Storage',
    countInStock: 20,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800',
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=801',
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=802',
    ],
    additionalInfo: [
      { label: 'Capacity', value: '2TB' },
      { label: 'Speed', value: '7000MB/s' },
      { label: 'Interface', value: 'NVMe PCIe 4.0' },
      { label: 'Warranty', value: '5 Years' },
    ],
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
    const usersWithHashedPasswords = await Promise.all(
      demoUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );
    await User.insertMany(usersWithHashedPasswords);
    console.log('✅ Demo users imported successfully');
    process.exit();
  } catch (error) {
    console.error(`❌ Seeder failed: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

importData();
    description: 'Default welcome coupon for new customers',
