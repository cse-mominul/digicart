const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db');

// Load env vars before anything else
dotenv.config();

// Connect to local MongoDB
connectDB();

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/', (req, res) => res.json({ message: 'DigiCart API is running' }));

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  () => console.log(`🚀 Server running in `.yellow + `${process.env.NODE_ENV}`.yellow.bold + ` mode on port `.yellow + `${PORT}`.yellow.bold.underline)
);
