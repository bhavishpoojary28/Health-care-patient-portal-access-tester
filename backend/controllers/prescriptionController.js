const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const getPrescriptions = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'patient') filter.patientId = req.user.patientId;
    else if (req.query.patientId) filter.patientId = req.query.patientId;
    else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ doctorId: req.user.doctorId });
      filter.patientId = { $in: doctor ? doctor.assignedPatientIds : [] };
    }
    const prescriptions = await Prescription.find(filter).sort({ date: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve prescriptions' });
  }
};

const getPrescriptionById = async (req, res) => {
  try {
    const rx = await Prescription.findOne({
      $or: [{ prescriptionId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    if (req.user.role === 'patient' && rx.patientId !== req.user.patientId) {
      return res.status(403).json({ error: 'Forbidden: Access denied to prescription', code: 'ACCESS_DENIED_OWNERSHIP_MISMATCH' });
    }
    res.json(rx);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve prescription' });
  }
};

const createPrescription = async (req, res) => {
  try {
    const { patientId, medications, notes } = req.body;
    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const prescription = new Prescription({
      prescriptionId: 'RX-' + Math.floor(1000 + Math.random() * 9000),
      patientId,
      patientName: patient.name,
      doctorId: req.user.doctorId || 'D201',
      doctorName: req.user.name || 'Dr. Alice Carter',
      date: new Date().toISOString().split('T')[0],
      medications,
      notes: notes || '',
      status: 'Active',
    });
    await prescription.save();
    res.status(201).json({ message: 'Prescription created', prescription });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create prescription' });
  }
};

module.exports = { getPrescriptions, getPrescriptionById, createPrescription };
