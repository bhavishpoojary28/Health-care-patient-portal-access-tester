const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true, index: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, required: true, index: true },
  doctorName: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['Laboratory', 'Radiology', 'Cardiology', 'Pathology', 'General Health'], default: 'Laboratory' },
  date: { type: String, required: true },
  summary: { type: String, required: true },
  findings: { type: String, default: 'Normal findings across all standard clinical parameters.' },
  recommendations: { type: String, default: 'Maintain regular follow-up and balanced diet.' },
  isConfidential: { type: Boolean, default: true },
  fileUrl: { type: String, default: '/reports/sample-report.pdf' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
