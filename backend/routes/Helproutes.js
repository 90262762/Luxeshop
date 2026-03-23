const express = require('express');
const helpRoutes  = express.Router();


const { createFAQ, updateFAQ, deleteFAQ, getFAQs } = require('./Helpcontroller ');
const { protect, admin } = require('../middleware/authMiddleware');

// Public
helpRoutes.get('/faqs', getFAQs);

// Admin only
helpRoutes.post('/faqs',        protect, admin, createFAQ);
helpRoutes.put('/faqs/:id',     protect, admin, updateFAQ);
helpRoutes.delete('/faqs/:id',  protect, admin, deleteFAQ);

module.exports = helpRoutes;