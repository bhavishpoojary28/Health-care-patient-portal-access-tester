const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res) => {
  try {
    const { eventType, severity, status, search, page = 1, limit = 50 } = req.query;
    let query = {};
    if (eventType && eventType !== 'ALL') query.eventType = eventType;
    if (severity && severity !== 'ALL') query.severity = severity;
    if (status && status !== 'ALL') query.status = status;
    if (search) {
      query.$or = [
        { details: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ total, page: parseInt(page), limit: parseInt(limit), logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
};

const getAuditLogStats = async (req, res) => {
  try {
    const total = await AuditLog.countDocuments();
    const unauthorizedAttempts = await AuditLog.countDocuments({
      $or: [{ eventType: 'UNAUTHORIZED_ACCESS' }, { status: 'DENIED' }],
    });
    const failedLogins = await AuditLog.countDocuments({ eventType: 'LOGIN_FAILED' });
    const successfulAccesses = await AuditLog.countDocuments({ eventType: 'RESOURCE_ACCESS', status: 'SUCCESS' });
    const testExecutions = await AuditLog.countDocuments({ eventType: 'TEST_EXECUTION' });
    res.json({ total, unauthorizedAttempts, failedLogins, successfulAccesses, testExecutions });
  } catch (err) {
    res.status(500).json({ error: 'Failed stats' });
  }
};

module.exports = { getAuditLogs, getAuditLogStats };
