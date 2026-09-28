const MedicalReport = require('../models/MedicalReport');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { logAuditEvent } = require('../middleware/auditMiddleware');

const getReports = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'patient') filter.patientId = req.user.patientId;
    else if (req.query.patientId) filter.patientId = req.query.patientId;
    else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ doctorId: req.user.doctorId });
      filter.patientId = { $in: doctor ? doctor.assignedPatientIds : [] };
    }
    const reports = await MedicalReport.find(filter).sort({ date: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve medical reports' });
  }
};

const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await MedicalReport.findOne({
      $or: [{ reportId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });
    if (!report) return res.status(404).json({ error: `Report ${id} not found` });

    if (req.user.role === 'patient' && report.patientId !== req.user.patientId) {
      await logAuditEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        severity: 'ALERT',
        userId: req.user.patientId,
        username: req.user.username,
        role: 'patient',
        action: 'GET',
        resource: `/api/reports/${id}`,
        targetPatientId: report.patientId,
        statusCode: 403,
        status: 'DENIED',
        details: `Patient ${req.user.patientId} attempted to access Patient ${report.patientId} medical report (${report.reportId}) → DENIED (403)`,
      });

      return res.status(403).json({
        error: 'Forbidden: Access denied to medical report',
        code: 'ACCESS_DENIED_OWNERSHIP_MISMATCH',
        message: `You are authenticated as patient ${req.user.patientId}. You are not authorized to view medical records belonging to patient ${report.patientId}.`,
        targetPatientId: report.patientId,
        requesterPatientId: req.user.patientId,
      });
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ doctorId: req.user.doctorId });
      if (!doctor || !doctor.assignedPatientIds.includes(report.patientId)) {
        await logAuditEvent({
          eventType: 'UNAUTHORIZED_ACCESS',
          severity: 'ALERT',
          userId: req.user.doctorId,
          username: req.user.username,
          role: 'doctor',
          action: 'GET',
          resource: `/api/reports/${id}`,
          targetPatientId: report.patientId,
          statusCode: 403,
          status: 'DENIED',
          details: `Doctor ${req.user.doctorId} attempted to access unassigned Patient ${report.patientId} medical report (${report.reportId}) → DENIED (403)`,
        });
        return res.status(403).json({
          error: 'Forbidden: Doctor is not assigned to this patient',
          code: 'ACCESS_DENIED_NOT_ASSIGNED_DOCTOR',
        });
      }
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve report' });
  }
};

const createReport = async (req, res) => {
  try {
    const { patientId, title, category, date, summary, findings, recommendations } = req.body;
    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const count = await MedicalReport.countDocuments();
    const report = new MedicalReport({
      reportId: `REP-${2000 + count + 1}`,
      patientId,
      patientName: patient.name,
      doctorId: req.user.doctorId || 'D201',
      doctorName: req.user.name || 'Medical Specialist',
      title,
      category,
      date: date || new Date().toISOString().split('T')[0],
      summary,
      findings: findings || 'Normal parameters.',
      recommendations: recommendations || 'Routine follow-up.',
    });
    await report.save();
    res.status(201).json({ message: 'Report created', report });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create report' });
  }
};

module.exports = { getReports, getReportById, createReport };
