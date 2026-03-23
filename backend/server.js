const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session  = require('express-session');
const { passport, initPassport } = require('./config/passport');
const router = require('./routes/contactRoutes');
const helpRoutes = require('./routes/Helproutes');
initPassport(); // ← call after dotenv loaded
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://luxeshop-lac.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
  secret:            process.env.SESSION_SECRET || 'luxeshop_secret',
  resave:            false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/auth', require('./routes/googleAuthRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.use('/api/contact', router);

app.use('/api/help',     helpRoutes);
// MongoDB Connection
console.log('MONGO_URI:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
