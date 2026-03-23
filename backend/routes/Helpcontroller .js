const FAQ = require('../models/FAQ');

// ─────────────────────────────────────────
// @route   GET /api/help/faqs
// @desc    Get all active FAQs (grouped by category)
// @access  Public
// ─────────────────────────────────────────
const getFAQs = async (req, res) => {
  try {
    const { category, search } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer:   { $regex: search, $options: 'i' } },
      ];
    }

    const faqs = await FAQ.find(filter).sort({ category: 1, order: 1 });

    // Group by category
    const grouped = faqs.reduce((acc, faq) => {
      if (!acc[faq.category]) acc[faq.category] = [];
      acc[faq.category].push(faq);
      return acc;
    }, {});

    res.json({ faqs, grouped });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/help/faqs       (Admin)
// @desc    Create a FAQ
// @access  Private/Admin
// ─────────────────────────────────────────
const createFAQ = async (req, res) => {
  try {
    const { category, question, answer, order } = req.body;
    if (!category || !question || !answer) {
      return res.status(400).json({ message: 'Category, question and answer are required' });
    }
    const faq = await FAQ.create({ category, question, answer, order: order || 0 });
    res.status(201).json({ success: true, faq });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/help/faqs/:id    (Admin)
// @desc    Update a FAQ
// @access  Private/Admin
// ─────────────────────────────────────────
const updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json({ success: true, faq });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// @route   DELETE /api/help/faqs/:id (Admin)
// @desc    Delete a FAQ
// @access  Private/Admin
// ─────────────────────────────────────────
const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getFAQs, createFAQ, updateFAQ, deleteFAQ };