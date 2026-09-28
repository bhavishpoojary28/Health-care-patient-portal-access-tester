const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditLogStats } = require('../controllers/auditLogController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

router.get('/', authenticateToken, authorizeRoles('admin'), getAuditLogs);
router.get('/stats', authenticateToken, authorizeRoles('admin'), getAuditLogStats);

module.exports = router;
