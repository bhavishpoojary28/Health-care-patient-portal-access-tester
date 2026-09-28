const AuditLog = require('../models/AuditLog');

const logAuditEvent = async ({
  eventType = 'RESOURCE_ACCESS',
  severity = 'INFO',
  userId = 'ANONYMOUS',
  username = 'anonymous',
  role = 'guest',
  action = 'READ',
  resource = '/',
  targetPatientId = null,
  statusCode = 200,
  status = 'SUCCESS',
  ipAddress = '127.0.0.1',
  userAgent = 'PatientPortalClient/1.0',
  details = '',
}) => {
  try {
    const logId = 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const entry = new AuditLog({
      logId,
      timestamp: new Date(),
      eventType,
      severity,
      userId,
      username,
      role,
      action,
      resource,
      targetPatientId,
      statusCode,
      status,
      ipAddress,
      userAgent,
      details,
    });
    await entry.save();
    return entry;
  } catch (err) {
    console.error('[AuditLog Error]:', err.message);
    return null;
  }
};

module.exports = { logAuditEvent };
