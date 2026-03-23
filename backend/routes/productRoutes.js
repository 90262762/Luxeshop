const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const uploadDir = 'uploads/products';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Images only!'));
  },
});

// POST /api/products/upload-image
router.post('/upload-image', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`;
  res.json({ imageUrl, message: 'Image uploaded successfully' });
});

// POST /api/products/upload-images — upload multiple images
router.post('/upload-images', protect, admin, upload.array('images', 5), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: 'No files uploaded' });
  const imageUrls = req.files.map(f =>
    `${req.protocol}://${req.get('host')}/uploads/products/${f.filename}`
  );
  res.json({ imageUrls, message: `${req.files.length} images uploaded` });
});

// GET all products with filtering, sorting, pagination
router.get('/', async (req, res) => {
  const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
  const query = {};
  if (keyword) query.name = { $regex: keyword, $options: 'i' };
  if (category && category !== 'all') query.category = category;
  if (minPrice || maxPrice) query.price = { $gte: minPrice || 0, $lte: maxPrice || 999999 };

  const sortObj = sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 } : sort === 'rating' ? { rating: -1 } : { createdAt: -1 };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query).sort(sortObj).skip((page - 1) * limit).limit(Number(limit));
  res.json({ products, total, pages: Math.ceil(total / limit), page: Number(page) });
});

// GET /api/products/:id/related
router.get('/:id/related', async (req, res) => {
  try {
    const product  = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const related = await Product.find({
      category: product.category,
      _id:      { $ne: product._id }, // exclude current product
    })
    .limit(4)
    .select('name price originalPrice images rating numReviews category countInStock');

    res.json(related);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET featured products
router.get('/featured', async (req, res) => {
  const products = await Product.find({ featured: true }).limit(8);
  res.json(products);
});

// GET categories
router.get('/categories', async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories);
});

// GET single product
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// POST create product (admin)
router.post('/', protect, admin, async (req, res) => {
  const product = new Product(req.body);
  const created = await product.save();
  res.status(201).json(created);
});

// PUT update product (admin)
router.put('/:id', protect, admin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// DELETE product (admin)
router.delete('/:id', protect, admin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

// POST product review
router.post('/:id/reviews', protect, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const already = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (already) return res.status(400).json({ message: 'Already reviewed' });
  const review = { user: req.user._id, name: req.user.name, rating: Number(req.body.rating), comment: req.body.comment };
  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length;
  await product.save();
  res.status(201).json({ message: 'Review added' });
});


// PUT /api/products/:id/reviews/:reviewId — edit review
router.put('/:id/reviews/:reviewId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const review = product.reviews.find(
      r => r._id.toString() === req.params.reviewId
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    review.rating  = req.body.rating  || review.rating;
    review.comment = req.body.comment || review.comment;

    // Recalculate rating
    product.numReviews = product.reviews.length;
    product.rating     = product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length;

    await product.save();
    res.json({ message: 'Review updated', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/products/:id/reviews/:reviewId — delete review
router.delete('/:id/reviews/:reviewId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const review = product.reviews.find(
      r => r._id.toString() === req.params.reviewId
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    product.reviews    = product.reviews.filter(
      r => r._id.toString() !== req.params.reviewId
    );
    product.numReviews = product.reviews.length;
    product.rating     = product.reviews.length > 0
      ? product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length
      : 0;

    await product.save();
    res.json({ message: 'Review deleted', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// PUT /api/products/:id/reviews/:reviewId — edit review
router.put('/:id/reviews/:reviewId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const review = product.reviews.find(
      r => r._id.toString() === req.params.reviewId
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    review.rating  = req.body.rating  || review.rating;
    review.comment = req.body.comment || review.comment;

    // Recalculate rating
    product.numReviews = product.reviews.length;
    product.rating     = product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length;

    await product.save();
    res.json({ message: 'Review updated', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/products/:id/reviews/:reviewId — delete review
router.delete('/:id/reviews/:reviewId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const review = product.reviews.find(
      r => r._id.toString() === req.params.reviewId
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    product.reviews    = product.reviews.filter(
      r => r._id.toString() !== req.params.reviewId
    );
    product.numReviews = product.reviews.length;
    product.rating     = product.reviews.length > 0
      ? product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length
      : 0;

    await product.save();
    res.json({ message: 'Review deleted', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
