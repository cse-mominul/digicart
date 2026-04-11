const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const colors = require('colors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars before anything else
dotenv.config();

// Debug: Verify critical environment variables are loaded
if (process.env.NODE_ENV === 'production') {
  const requiredVars = ['JWT_SECRET', 'MONGO_URI', 'PORT'];
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error(`❌ Missing required env variables in Docker: ${missing.join(', ')}`);
  } else {
    console.log(`✅ All required env variables loaded successfully`);
  }
}

console.log(`📦 Environment: NODE_ENV=${process.env.NODE_ENV}`);
console.log(`📦 JWT_SECRET loaded: ${process.env.JWT_SECRET ? 'YES' : 'NO'}`);
console.log(`📦 MONGO_URI: ${process.env.MONGO_URI}`);

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
app.use('/api/engagement', require('./routes/engagementRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ message: 'DigiCart API is running' }));

if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, 'public');
  app.use(express.static(staticPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }

    return res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.json({ message: 'DigiCart API is running' }));
}

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  () => console.log(`🚀 Server running in `.yellow + `${process.env.NODE_ENV}`.yellow.bold + ` mode on port `.yellow + `${PORT}`.yellow.bold.underline)
);
