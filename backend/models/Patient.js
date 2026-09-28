const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  dob: { type: String, default: '1985-05-14' },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
  bloodType: { type: String, default: 'O+' },
  phone: { type: String, default: '+1-555-0199' },
  email: { type: String, required: true, trim: true },
  address: { type: String, default: '123 Health Ave, Medical City, MC 90210' },
  emergencyContact: {
    name: { type: String, default: 'Jane Doe' },
    relation: { type: String, default: 'Spouse' },
    phone: { type: String, default: '+1-555-0198' },
  },
  assignedDoctorId: { type: String, required: true, trim: true },
  assignedDoctorName: { type: String, default: 'Dr. Alice Carter' },
  allergies: { type: [String], default: ['Penicillin', 'Peanuts'] },
  chronicConditions: { type: [String], default: ['Hypertension', 'Asthma'] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Patient', patientSchema);
