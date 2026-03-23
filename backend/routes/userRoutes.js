const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/users — all users (admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id — single user (admin)
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id — update user role (admin)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent changing own admin status
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
    user.name    = req.body.name    || user.name;
    user.email   = req.body.email   || user.email;

    const updated = await user.save();

    res.json({
      _id:     updated._id,
      name:    updated.name,
      email:   updated.email,
      isAdmin: updated.isAdmin,
    });
  } catch (err) {
    console.error('Update user error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/users/:id — delete user (admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot delete an admin user' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;