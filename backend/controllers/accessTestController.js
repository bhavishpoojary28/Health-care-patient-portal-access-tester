const { executeAccessTest } = require('../services/testRunnerService');
const AuditLog = require('../models/AuditLog');

const runAccessTest = async (req, res) => {
  try {
    const { userRole, userId, targetPatientId, resourceType, action, customPayload } = req.body;
    if (!userRole || !userId || !targetPatientId || !resourceType) {
      return res.status(400).json({ error: 'Missing required test parameters' });
    }
    const testResult = await executeAccessTest(req.app, {
      userRole,
      userId,
      targetPatientId,
      resourceType,
      action: action || 'GET',
      customPayload,
    });
    const latestAuditLog = await AuditLog.findOne().sort({ timestamp: -1 });
    res.json({ success: true, ...testResult, auditLog: latestAuditLog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { runAccessTest };
