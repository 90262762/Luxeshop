const express = require('express');
const router  = express.Router();

const { protect, admin } = require('../middleware/authMiddleware');
const { deleteContact, submitContact, getContacts, updateContactStatus } = require('./Contactcontroller ');

// Public
router.post('/', submitContact);

// Admin only
router.get('/',              protect, admin, getContacts);
router.put('/:id/status',   protect, admin, updateContactStatus);
router.delete('/:id',       protect, admin, deleteContact);

module.exports = router;