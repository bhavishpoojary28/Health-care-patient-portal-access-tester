const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { logAuditEvent } = require('../middleware/auditMiddleware');

const getAppointments = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'patient') filter.patientId = req.user.patientId;
    else if (req.user.role === 'doctor') filter.doctorId = req.user.doctorId;
    else if (req.query.patientId) filter.patientId = req.query.patientId;
    const appointments = await Appointment.find(filter).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve appointments' });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ appointmentId: req.params.id });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (req.user.role === 'patient' && appointment.patientId !== req.user.patientId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve appointment' });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, department, reason, notes } = req.body;
    const effId = req.user.role === 'patient' ? req.user.patientId : patientId;
    const patient = await Patient.findOne({ patientId: effId });
    const appointment = new Appointment({
      appointmentId: 'APT-' + Math.floor(1000 + Math.random() * 9000),
      patientId: effId,
      patientName: patient ? patient.name : 'Unknown Patient',
      doctorId,
      doctorName: doctorId === 'D201' ? 'Dr. Alice Carter' : 'Dr. Bob Vance',
      date,
      time,
      department: department || 'General Clinic',
      status: 'Scheduled',
      reason,
      notes: notes || '',
    });
    await appointment.save();
    res.status(201).json({ message: 'Appointment booked', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to book appointment' });
  }
};

module.exports = { getAppointments, getAppointmentById, createAppointment };
