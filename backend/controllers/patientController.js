const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { logAuditEvent } = require('../middleware/auditMiddleware');

const getAllPatients = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'patient') filter = { patientId: req.user.patientId };
    else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ doctorId: req.user.doctorId });
      filter = { patientId: { $in: doctor ? doctor.assignedPatientIds : [] } };
    }
    const patients = await Patient.find(filter).select('-__v');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve patients' });
  }
};

const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findOne({ patientId }).select('-__v');
    if (!patient) return res.status(404).json({ error: `Patient ${patientId} not found` });

    await logAuditEvent({
      eventType: 'RESOURCE_ACCESS',
      severity: 'INFO',
      userId: req.user.id || req.user.patientId,
      username: req.user.username,
      role: req.user.role,
      action: 'GET',
      resource: `/api/patients/${patientId}`,
      targetPatientId: patientId,
      statusCode: 200,
      status: 'SUCCESS',
      details: `${req.user.role.toUpperCase()} '${req.user.username}' accessed profile data for Patient ${patientId}`,
    });

    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve patient profile' });
  }
};

const updatePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const updates = req.body;
    delete updates.patientId;
    delete updates.userId;
    if (req.user.role === 'patient') {
      delete updates.assignedDoctorId;
      delete updates.assignedDoctorName;
    }
    const patient = await Patient.findOneAndUpdate({ patientId }, { $set: updates }, { new: true });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Patient profile updated', patient });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update patient profile' });
  }
};

module.exports = { getAllPatients, getPatientById, updatePatient };
