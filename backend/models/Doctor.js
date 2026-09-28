const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  doctorId: { type: String, required: true, unique: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  specialization: { type: String, required: true, default: 'General Physician' },
  department: { type: String, default: 'Internal Medicine' },
  email: { type: String, required: true, trim: true },
  phone: { type: String, default: '+1-555-0210' },
  licenseNumber: { type: String, default: 'MD-98421-CA' },
  assignedPatientIds: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Doctor', doctorSchema);
