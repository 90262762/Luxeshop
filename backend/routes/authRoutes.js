const express     = require('express');
const router      = express.Router();
const jwt         = require('jsonwebtoken');
const User        = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const cloudinary  = require('../config/cloudinary');
const upload      = require('../middleware/uploadMiddleware');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User already exists' });
  const user = await User.create({ name, email, password });
  res.status(201).json({
    _id: user._id, name: user.name,
    email: user.email, isAdmin: user.isAdmin,
    token: generateToken(user._id),
  });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await user.matchPassword(password)) {
    res.json({
      _id: user._id, name: user.name,
      email: user.email, isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    _id: user._id, name: user.name,
    email: user.email, isAdmin: user.isAdmin,
    address: user.address, avatar: user.avatar,
  });
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.name  = req.body.name  || user.name;
  user.email = req.body.email || user.email;
  if (req.body.password) user.password = req.body.password;
  if (req.body.address) {
    user.address = {
      street:  req.body.address.street  || '',
      city:    req.body.address.city    || '',
      state:   req.body.address.state   || '',
      zip:     req.body.address.zip     || '',
      country: req.body.address.country || 'India',
    };
  }
  const updated = await user.save();
  res.json({
    _id:     updated._id,
    name:    updated.name,
    email:   updated.email,
    address: updated.address,
    token:   generateToken(updated._id),
  });
});

// POST /api/auth/upload-avatar
// POST /api/auth/upload-avatar
router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file received' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    // Upload buffer to Cloudinary
    const uploadFromBuffer = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder:    'luxeshop/avatars',
            public_id: `avatar-${req.user._id}`, // ✅ NO extension, NO timestamp
            overwrite: true,                      // ✅ overwrites old avatar
            transformation: [{
              width: 300, height: 300,
              crop: 'fill', gravity: 'face',
            }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        require('streamifier').createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await uploadFromBuffer();

    user.avatar         = result.secure_url;
    user.avatarPublicId = result.public_id;
    await user.save();

    res.json({ avatar: user.avatar, message: 'Avatar updated!' });

  } catch (err) {
    console.error('UPLOAD ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});



const { sendOTPEmail } = require('../utils/sendEmail');
const crypto = require('crypto');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    let user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const otp    = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp       = otp;
    user.otpExpiry = expiry;
    await user.save();

    await sendOTPEmail(email, otp, user.name);

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Send OTP error:', err.message);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('=== OTP DEBUG ===');
    console.log('Email received:', email);
    console.log('OTP received:', otp);
    console.log('OTP type:', typeof otp);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('OTP in DB:', user.otp);
    console.log('OTP DB type:', typeof user.otp);
    console.log('OTP expiry:', user.otpExpiry);
    console.log('Is expired:', Date.now() > new Date(user.otpExpiry).getTime());
    console.log('Match:', user.otp === otp);
    console.log('Match (string):', String(user.otp) === String(otp));
    console.log('=================');

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: 'No OTP found. Request a new one.' });
    }

    if (Date.now() > new Date(user.otpExpiry).getTime()) {
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.otp        = null;
    user.otpExpiry  = null;
    user.isVerified = true;
    await user.save();

    res.json({
      _id:        user._id,
      name:       user.name,
      email:      user.email,
      isAdmin:    user.isAdmin,
      isVerified: true,
      token:      generateToken(user._id),
      message:    'OTP verified successfully!',
    });

  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/register-with-otp
// Step 1 — register and send OTP
router.post('/register-with-otp', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const otp    = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name, email, password,
      otp, otpExpiry: expiry,
      isVerified: false,
    });

    await sendOTPEmail(email, otp, name);

    res.status(201).json({
      message:    'OTP sent to your email. Please verify.',
      email:      user.email,
      requireOTP: true,
    });
  } catch (err) {
    console.error('Register OTP error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp    = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp       = otp;
    user.otpExpiry = expiry;
    await user.save();

    await sendOTPEmail(email, otp, user.name);

    res.json({ message: 'New OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account with this email' });

    const otp    = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp       = otp;
    user.otpExpiry = expiry;
    await user.save();

    await sendOTPEmail(email, otp, user.name);
    res.json({ message: 'OTP sent for password reset' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reset OTP' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    
   

    user.password  = newPassword; // will be hashed by pre-save hook
    user.otp       = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Reset failed' });
  }
});

module.exports = router;