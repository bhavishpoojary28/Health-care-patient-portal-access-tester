const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now, index: true },
  eventType: {
    type: String,
    enum: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'RESOURCE_ACCESS', 'UNAUTHORIZED_ACCESS', 'TEST_EXECUTION', 'RECORD_MODIFIED'],
    required: true,
    index: true,
  },
  severity: { type: String, enum: ['INFO', 'WARNING', 'ALERT', 'CRITICAL'], default: 'INFO' },
  userId: { type: String, default: 'ANONYMOUS' },
  username: { type: String, default: 'anonymous' },
  role: { type: String, default: 'guest' },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  targetPatientId: { type: String, default: null },
  statusCode: { type: Number, required: true },
  status: { type: String, enum: ['SUCCESS', 'DENIED', 'FAILED', 'BLOCKED'], required: true },
  ipAddress: { type: String, default: '127.0.0.1' },
  userAgent: { type: String, default: 'Healthcare-Portal-Client/1.0' },
  details: { type: String, required: true },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
