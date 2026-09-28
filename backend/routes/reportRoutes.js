const express = require('express');
const router = express.Router();
const { getReports, getReportById, createReport } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

router.get('/', authenticateToken, getReports);
router.get('/:id', authenticateToken, getReportById);
router.post('/', authenticateToken, authorizeRoles('doctor', 'admin'), createReport);

module.exports = router;
