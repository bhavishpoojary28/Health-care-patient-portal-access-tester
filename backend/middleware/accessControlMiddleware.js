const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { logAuditEvent } = require('./auditMiddleware');

const verifyPatientAccess = (options = {}) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized: User authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      if (req.user.role === 'admin') {
        return next();
      }

      let targetPatientId = req.params.patientId || req.query.patientId || req.body?.patientId;

      if (!targetPatientId && req.params.id && options.model) {
        const doc = await options.model.findOne({ [options.idField || '_id']: req.params.id });
        if (!doc) {
          return res.status(404).json({ error: 'Resource not found' });
        }
        targetPatientId = doc.patientId;
        req.targetResource = doc;
      }

      if (!targetPatientId) {
        if (req.user.role === 'patient') {
          targetPatientId = req.user.patientId;
          req.query.patientId = req.user.patientId;
        } else {
          return res.status(400).json({
            error: 'Bad Request: Target Patient ID must be specified',
            code: 'PATIENT_ID_REQUIRED',
          });
        }
      }

      if (req.user.role === 'patient') {
        if (req.user.patientId !== targetPatientId) {
          const details = `Access Denied: Patient ${req.user.patientId} (${req.user.username}) attempted unauthorized access to data belonging to Patient ${targetPatientId}`;

          await logAuditEvent({
            eventType: 'UNAUTHORIZED_ACCESS',
            severity: 'ALERT',
            userId: req.user.id || req.user.patientId,
            username: req.user.username,
            role: 'patient',
            action: req.method,
            resource: req.originalUrl,
            targetPatientId,
            statusCode: 403,
            status: 'DENIED',
            ipAddress: req.ip || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'Unknown',
            details,
          });

          return res.status(403).json({
            error: 'Forbidden: Unauthorized access to patient data',
            code: 'ACCESS_DENIED_OWNERSHIP_MISMATCH',
            message: `You are authenticated as patient ${req.user.patientId}. You do not have permission to view or manipulate data for patient ${targetPatientId}.`,
            targetPatientId,
            requesterPatientId: req.user.patientId,
          });
        }
        return next();
      }

      if (req.user.role === 'doctor') {
        const doctorId = req.user.doctorId;
        const doctor = await Doctor.findOne({ doctorId });
        const patient = await Patient.findOne({ patientId: targetPatientId });

        const isAssigned = (doctor && doctor.assignedPatientIds.includes(targetPatientId)) ||
                           (patient && patient.assignedDoctorId === doctorId);

        if (!isAssigned) {
          const details = `Access Denied: Doctor ${doctorId} (${req.user.name}) attempted to access unassigned Patient ${targetPatientId} records`;

          await logAuditEvent({
            eventType: 'UNAUTHORIZED_ACCESS',
            severity: 'ALERT',
            userId: req.user.id || doctorId,
            username: req.user.username,
            role: 'doctor',
            action: req.method,
            resource: req.originalUrl,
            targetPatientId,
            statusCode: 403,
            status: 'DENIED',
            ipAddress: req.ip || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'Unknown',
            details,
          });

          return res.status(403).json({
            error: 'Forbidden: Doctor is not assigned to this patient',
            code: 'ACCESS_DENIED_NOT_ASSIGNED_DOCTOR',
            message: `Doctor ${doctorId} is not assigned to patient ${targetPatientId}. Access to clinical records is restricted to assigned medical staff.`,
            doctorId,
            targetPatientId,
          });
        }
        return next();
      }

      return res.status(403).json({
        error: 'Forbidden: Insufficient privileges',
        code: 'ACCESS_DENIED_UNKNOWN_ROLE',
      });
    } catch (err) {
      console.error('[verifyPatientAccess Error]:', err);
      return res.status(500).json({ error: 'Internal access control verification error' });
    }
  };
};

module.exports = { verifyPatientAccess };
