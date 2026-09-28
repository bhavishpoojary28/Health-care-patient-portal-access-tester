const mongoose = require('mongoose');

const testExecutionSchema = new mongoose.Schema({
  executionId: { type: String, required: true, unique: true },
  caseId: { type: String, required: true, index: true },
  title: { type: String, default: '' },
  category: { type: String, default: 'General' },
  runBy: { type: String, default: 'tester' },
  executedAt: { type: Date, default: Date.now },
  httpMethod: { type: String, default: 'GET' },
  targetEndpoint: { type: String, default: '' },
  httpStatus: { type: Number, required: true },
  expectedStatus: { type: Number, required: true },
  actualResult: { type: String, required: true },
  expectedResult: { type: String, required: true },
  status: { type: String, enum: ['PASS', 'FAIL', 'BLOCKED'], required: true },
  executionTimeMs: { type: Number, default: 0 },
  requestDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  responseDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  notes: { type: String, default: '' },
});

module.exports = mongoose.model('TestExecution', testExecutionSchema);
