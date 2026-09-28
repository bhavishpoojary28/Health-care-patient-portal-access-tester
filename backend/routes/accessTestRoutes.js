const express = require('express');
const router = express.Router();
const { runAccessTest } = require('../controllers/accessTestController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/simulate', authenticateToken, runAccessTest);

module.exports = router;
