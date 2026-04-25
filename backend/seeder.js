// Demo products array
const demoProducts = [
  {
    name: 'Sample Product 1',
    description: 'This is a sample product.',
    price: 199,
    category: 'Electronics',
    stock: 10,
    countInStock: 10,
    image: 'https://via.placeholder.com/300x300.png?text=Product+1',
    images: ['https://via.placeholder.com/300x300.png?text=Product+1'],
    brand: 'BrandA',
    compareAtPrice: 249,
    discountText: '20% OFF',
    showDiscount: true,
    displayRating: 4.5,
    displayReviewsText: '1.2k reviews',
    additionalInfo: [
      { label: 'Color', value: 'Black' },
      { label: 'Warranty', value: '1 year' },
    ],
    isActive: true,
  },
  {
    name: 'Sample Product 2',
    description: 'Another demo product.',
    price: 299,
    category: 'Books',
    stock: 5,
    countInStock: 5,
    image: 'https://via.placeholder.com/300x300.png?text=Product+2',
    images: ['https://via.placeholder.com/300x300.png?text=Product+2'],
    brand: 'BrandB',
    compareAtPrice: 349,
    discountText: '15% OFF',
    showDiscount: true,
    displayRating: 4.2,
    displayReviewsText: '800 reviews',
    additionalInfo: [
      { label: 'Author', value: 'John Doe' },
      { label: 'Pages', value: '320' },
    ],
    isActive: true,
  },
];
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

console.log('Seeder demoProducts:', JSON.stringify(demoProducts, null, 2));
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
    console.log('Inserting demoProducts:', JSON.stringify(demoProducts, null, 2));
    await Product.insertMany(demoProducts);
    await Coupon.insertMany(demoCoupons);

    console.log('✅ Demo users, categories, products, and coupons imported successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

importData();
