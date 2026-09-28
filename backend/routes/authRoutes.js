const express = require('express');
const router = express.Router();
const { login, register, getCurrentUser, generateTestToken, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticateToken, getCurrentUser);
router.post('/test-token', generateTestToken);
router.post('/logout', authenticateToken, logout);

module.exports = router;
