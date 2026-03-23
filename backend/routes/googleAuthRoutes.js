const express  = require('express');
const router   = express.Router();
const { passport } = require('../config/passport');
const jwt      = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// GET /api/auth/google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// GET /api/auth/google/callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login?error=google' }),
  (req, res) => {
    const user  = req.user;
    const token = generateToken(user._id);

    const userData = encodeURIComponent(JSON.stringify({
      _id:     user._id,
      name:    user.name,
      email:   user.email,
      avatar:  user.avatar,
      isAdmin: user.isAdmin,
      token,
    }));

    // Redirect to frontend with user data
    res.redirect(`http://localhost:3000/auth/google/success?user=${userData}`);
  }
);

module.exports = router;