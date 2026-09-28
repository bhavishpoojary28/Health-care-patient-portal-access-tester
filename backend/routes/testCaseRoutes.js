const express = require('express');
const router = express.Router();
const { getAllTestCases, getTestCaseStats, createTestCase, updateTestCase, deleteTestCase, runSingleTestCase, runAllTestCases } = require('../controllers/testCaseController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

router.get('/cases', authenticateToken, authorizeRoles('admin'), getAllTestCases);
router.get('/stats', authenticateToken, authorizeRoles('admin'), getTestCaseStats);
router.post('/cases', authenticateToken, authorizeRoles('admin'), createTestCase);
router.put('/cases/:id', authenticateToken, authorizeRoles('admin'), updateTestCase);
router.delete('/cases/:id', authenticateToken, authorizeRoles('admin'), deleteTestCase);
router.post('/cases/:id/run', authenticateToken, authorizeRoles('admin'), runSingleTestCase);
router.post('/run-all', authenticateToken, authorizeRoles('admin'), runAllTestCases);

module.exports = router;
