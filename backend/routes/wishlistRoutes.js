const express     = require('express');
const router      = express.Router();
const User        = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// GET /api/wishlist — get my wishlist
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/wishlist/:productId — add to wishlist
router.post('/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { productId } = req.params;

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();
    res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/wishlist/:productId — remove from wishlist
router.delete('/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(
      id => id.toString() !== req.params.productId
    );
    await user.save();
    res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/wishlist — clear entire wishlist
router.delete('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = [];
    await user.save();
    res.json({ message: 'Wishlist cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;