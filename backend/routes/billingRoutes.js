const express = require('express');
const router = express.Router();
const { getInvoices, getInvoiceById, payInvoice } = require('../controllers/billingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getInvoices);
router.get('/:id', authenticateToken, getInvoiceById);
router.put('/:id/pay', authenticateToken, payInvoice);

module.exports = router;
