const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Authentication', 'Authorization', 'API', 'Security'], required: true },
  description: { type: String, required: true },
  targetEndpoint: { type: String, required: true },
  httpMethod: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
  roleUnderUser: { type: String, enum: ['patient', 'doctor', 'admin', 'unauthenticated', 'attacker'], default: 'patient' },
  testUser: { type: String, required: true, default: 'patientA' },
  targetPatientId: { type: String, default: '' },
  expectedStatus: { type: Number, required: true, default: 200 },
  expectedResult: { type: String, enum: ['ACCESS GRANTED', 'ACCESS DENIED', 'SUCCESS', 'UNAUTHORIZED', 'FORBIDDEN'], default: 'ACCESS GRANTED' },
  lastExecutionStatus: { type: String, enum: ['PASS', 'FAIL', 'BLOCKED', 'NOT_RUN'], default: 'NOT_RUN' },
  lastExecutionMessage: { type: String, default: '' },
  lastRunDate: { type: Date, default: null },
  comments: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TestCase', testCaseSchema);
