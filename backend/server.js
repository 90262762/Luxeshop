const dotenv = require('dotenv');
dotenv.config();

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const path       = require('path');
const session    = require('express-session');
const { passport, initPassport } = require('./config/passport');
const contactRoutes = require('./routes/contactRoutes');
const helpRoutes    = require('./routes/Helproutes');

initPassport();

const app = express();

// ── CORS — must be FIRST ──
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://luxeshop-lac.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://luxeshop-lac.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.options('*', cors());

// ── Middleware ──
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
  secret:            process.env.SESSION_SECRET || 'luxeshop_secret',
  resave:            false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// ── Routes ──
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/products',      require('./routes/productRoutes'));
app.use('/api/orders',        require('./routes/orderRoutes'));
app.use('/api/users',         require('./routes/userRoutes'));
app.use('/api/payment',       require('./routes/paymentRoutes'));
app.use('/api/wishlist',      require('./routes/wishlistRoutes'));
app.use('/api/coupons',       require('./routes/couponRoutes'));
app.use('/api/auth',          require('./routes/googleAuthRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/contact',       contactRoutes);
app.use('/api/help',          helpRoutes);

// ── MongoDB ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ── Server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));