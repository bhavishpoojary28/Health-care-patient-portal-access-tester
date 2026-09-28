const fs = require('fs');
const path = require('path');

const files = {};

// backend/package.json
files['backend/package.json'] = JSON.stringify({
  "name": "healthcare-portal-backend",
  "version": "1.0.0",
  "description": "Backend API for Healthcare Patient Portal & Access Tester",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js",
    "test": "jest --runInBand --detectOpenHandles --forceExit",
    "test:coverage": "jest --coverage --runInBand --forceExit",
    "seed": "node scripts/seed.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.3.1",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "mongodb-memory-server": "^9.2.0",
    "supertest": "^6.3.4"
  },
  "jest": {
    "testEnvironment": "node",
    "testTimeout": 30000
  }
}, null, 2);

// backend/.env
files['backend/.env'] = `PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/healthcare_portal
JWT_SECRET=healthcare_portal_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
`;

// backend/config/db.js
files['backend/config/db.js'] = `const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthcare_portal';
    mongoose.set('strictQuery', false);

    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log(\`[DB] Connected to MongoDB: \${mongoose.connection.host}/\${mongoose.connection.name}\`);
    } catch (localErr) {
      console.warn(\`[DB] Local MongoDB connection to \${mongoUri} failed: \${localErr.message}\`);
      console.log('[DB] Launching fallback In-Memory MongoDB Server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(\`[DB] Connected to Fallback In-Memory MongoDB at: \${inMemoryUri}\`);
    }
    return mongoose.connection;
  } catch (error) {
    console.error(\`[DB Error]: \${error.message}\`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) await mongod.stop();
  } catch (error) {
    console.error(\`[DB Disconnect Error]: \${error.message}\`);
  }
};

module.exports = { connectDB, disconnectDB };
`;

// backend/models/User.js
files['backend/models/User.js'] = `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  patientId: { type: String, default: null, trim: true },
  doctorId: { type: String, default: null, trim: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
`;

// backend/models/Patient.js
files['backend/models/Patient.js'] = `const mongoose = require('mongoose');

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
`;

// backend/models/Doctor.js
files['backend/models/Doctor.js'] = `const mongoose = require('mongoose');

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
`;

// backend/models/Appointment.js
files['backend/models/Appointment.js'] = `const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true, index: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, required: true, index: true },
  doctorName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  department: { type: String, default: 'General Clinic' },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  reason: { type: String, required: true },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
`;

// backend/models/MedicalReport.js
files['backend/models/MedicalReport.js'] = `const mongoose = require('mongoose');

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
`;

// backend/models/Prescription.js
files['backend/models/Prescription.js'] = `const mongoose = require('mongoose');

const medicationItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String, default: 'Take with water after meals' },
});

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true, index: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, required: true, index: true },
  doctorName: { type: String, required: true },
  date: { type: String, required: true },
  medications: [medicationItemSchema],
  status: { type: String, enum: ['Active', 'Completed', 'Discontinued'], default: 'Active' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
`;

// backend/models/Billing.js
files['backend/models/Billing.js'] = `const mongoose = require('mongoose');

const billingItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  cost: { type: Number, required: true },
});

const billingSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true, index: true },
  patientName: { type: String, required: true },
  date: { type: String, required: true },
  dueDate: { type: String, required: true },
  items: [billingItemSchema],
  totalAmount: { type: Number, required: true },
  insuranceCovered: { type: Number, default: 0 },
  patientOwes: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  paymentMethod: { type: String, default: 'Health Insurance & Copay' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Billing', billingSchema);
`;

// backend/models/TestCase.js
files['backend/models/TestCase.js'] = `const mongoose = require('mongoose');

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
`;

// backend/models/TestExecution.js
files['backend/models/TestExecution.js'] = `const mongoose = require('mongoose');

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
`;

// backend/models/AuditLog.js
files['backend/models/AuditLog.js'] = `const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now, index: true },
  eventType: {
    type: String,
    enum: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'RESOURCE_ACCESS', 'UNAUTHORIZED_ACCESS', 'TEST_EXECUTION', 'RECORD_MODIFIED'],
    required: true,
    index: true,
  },
  severity: { type: String, enum: ['INFO', 'WARNING', 'ALERT', 'CRITICAL'], default: 'INFO' },
  userId: { type: String, default: 'ANONYMOUS' },
  username: { type: String, default: 'anonymous' },
  role: { type: String, default: 'guest' },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  targetPatientId: { type: String, default: null },
  statusCode: { type: Number, required: true },
  status: { type: String, enum: ['SUCCESS', 'DENIED', 'FAILED', 'BLOCKED'], required: true },
  ipAddress: { type: String, default: '127.0.0.1' },
  userAgent: { type: String, default: 'Healthcare-Portal-Client/1.0' },
  details: { type: String, required: true },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
`;

// backend/middleware/auditMiddleware.js
files['backend/middleware/auditMiddleware.js'] = `const AuditLog = require('../models/AuditLog');

const logAuditEvent = async ({
  eventType = 'RESOURCE_ACCESS',
  severity = 'INFO',
  userId = 'ANONYMOUS',
  username = 'anonymous',
  role = 'guest',
  action = 'READ',
  resource = '/',
  targetPatientId = null,
  statusCode = 200,
  status = 'SUCCESS',
  ipAddress = '127.0.0.1',
  userAgent = 'PatientPortalClient/1.0',
  details = '',
}) => {
  try {
    const logId = 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const entry = new AuditLog({
      logId,
      timestamp: new Date(),
      eventType,
      severity,
      userId,
      username,
      role,
      action,
      resource,
      targetPatientId,
      statusCode,
      status,
      ipAddress,
      userAgent,
      details,
    });
    await entry.save();
    return entry;
  } catch (err) {
    console.error('[AuditLog Error]:', err.message);
    return null;
  }
};

module.exports = { logAuditEvent };
`;

// backend/middleware/authMiddleware.js
files['backend/middleware/authMiddleware.js'] = `const jwt = require('jsonwebtoken');
const { logAuditEvent } = require('./auditMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'healthcare_portal_super_secret_jwt_key_2026';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logAuditEvent({
      eventType: 'UNAUTHORIZED_ACCESS',
      severity: 'WARNING',
      userId: 'ANONYMOUS',
      username: 'anonymous',
      role: 'guest',
      action: req.method,
      resource: req.originalUrl,
      statusCode: 401,
      status: 'DENIED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown',
      details: \`Unauthenticated request to protected endpoint: \${req.method} \${req.originalUrl} - Missing JWT Token\`,
    });

    return res.status(401).json({
      error: 'Unauthorized: Authentication token is required',
      code: 'TOKEN_MISSING',
      message: 'Please provide a valid Bearer token in Authorization header.',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      const isExpired = err.name === 'TokenExpiredError';
      const errorCode = isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
      const errorMsg = isExpired ? 'JWT token has expired' : 'JWT token is invalid or corrupted';

      logAuditEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        severity: 'WARNING',
        userId: 'UNKNOWN',
        username: 'unknown',
        role: 'guest',
        action: req.method,
        resource: req.originalUrl,
        statusCode: 401,
        status: 'DENIED',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Unknown',
        details: \`Rejected request to \${req.originalUrl}: \${errorMsg}\`,
      });

      return res.status(401).json({
        error: \`Unauthorized: \${errorMsg}\`,
        code: errorCode,
        message: isExpired
          ? 'Your session has expired. Please log in again.'
          : 'The provided security token could not be verified.',
      });
    }

    req.user = decoded;
    next();
  });
};

module.exports = { authenticateToken, JWT_SECRET };
`;

// backend/middleware/rbacMiddleware.js
files['backend/middleware/rbacMiddleware.js'] = `const { logAuditEvent } = require('./auditMiddleware');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized: User authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logAuditEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        severity: 'ALERT',
        userId: req.user.id || req.user.patientId || req.user.doctorId,
        username: req.user.username,
        role: req.user.role,
        action: req.method,
        resource: req.originalUrl,
        statusCode: 403,
        status: 'DENIED',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Unknown',
        details: \`Role violation: User '\${req.user.username}' with role '\${req.user.role}' attempted to access restricted endpoint \${req.originalUrl}. Required roles: [\${allowedRoles.join(', ')}]\`,
      });

      return res.status(403).json({
        error: 'Forbidden: Insufficient role permissions',
        code: 'ACCESS_DENIED_ROLE_RESTRICTION',
        requiredRoles: allowedRoles,
        currentRole: req.user.role,
        message: \`This action requires one of the following roles: \${allowedRoles.join(', ')}. Your role is '\${req.user.role}'.\`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
`;

// backend/middleware/accessControlMiddleware.js
files['backend/middleware/accessControlMiddleware.js'] = `const Doctor = require('../models/Doctor');
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
          const details = \`Access Denied: Patient \${req.user.patientId} (\${req.user.username}) attempted unauthorized access to data belonging to Patient \${targetPatientId}\`;

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
            message: \`You are authenticated as patient \${req.user.patientId}. You do not have permission to view or manipulate data for patient \${targetPatientId}.\`,
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
          const details = \`Access Denied: Doctor \${doctorId} (\${req.user.name}) attempted to access unassigned Patient \${targetPatientId} records\`;

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
            message: \`Doctor \${doctorId} is not assigned to patient \${targetPatientId}. Access to clinical records is restricted to assigned medical staff.\`,
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
`;

// backend/middleware/errorMiddleware.js
files['backend/middleware/errorMiddleware.js'] = `const errorHandler = (err, req, res, next) => {
  console.error('[App Error]:', err.stack || err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR',
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    error: \`Not Found - \${req.originalUrl}\`,
    code: 'ROUTE_NOT_FOUND',
  });
};

module.exports = { errorHandler, notFound };
`;

// backend/services/testRunnerService.js
files['backend/services/testRunnerService.js'] = `const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const TestCase = require('../models/TestCase');
const TestExecution = require('../models/TestExecution');
const { logAuditEvent } = require('../middleware/auditMiddleware');

const getTestAuthHeader = (testUser, customRole) => {
  if (testUser === 'unauthenticated' || testUser === 'anonymous') return null;

  if (testUser === 'tampered_token' || testUser === 'attacker') {
    return 'Bearer ' + jwt.sign(
      { id: 'attacker-001', username: 'malicious_user', role: 'patient', patientId: 'P9999' },
      'forged_secret_key_12345',
      { expiresIn: '1h' }
    );
  }

  if (testUser === 'expired_token') {
    return 'Bearer ' + jwt.sign(
      { id: 'expired-001', username: 'expired_user', role: 'patient', patientId: 'P1001' },
      JWT_SECRET,
      { expiresIn: '-1h' }
    );
  }

  let payload = {};
  if (testUser === 'patientA' || testUser === 'P1001') {
    payload = { id: 'patient-A-id', username: 'patientA', role: 'patient', patientId: 'P1001', name: 'John Doe' };
  } else if (testUser === 'patientB' || testUser === 'P1002') {
    payload = { id: 'patient-B-id', username: 'patientB', role: 'patient', patientId: 'P1002', name: 'Jane Smith' };
  } else if (testUser === 'patientC' || testUser === 'P1003') {
    payload = { id: 'patient-C-id', username: 'patientC', role: 'patient', patientId: 'P1003', name: 'Robert Brown' };
  } else if (testUser === 'dr_alice' || testUser === 'D201') {
    payload = { id: 'doctor-alice-id', username: 'dr_alice', role: 'doctor', doctorId: 'D201', name: 'Dr. Alice Carter' };
  } else if (testUser === 'dr_bob' || testUser === 'D202') {
    payload = { id: 'doctor-bob-id', username: 'dr_bob', role: 'doctor', doctorId: 'D202', name: 'Dr. Bob Vance' };
  } else if (testUser === 'admin') {
    payload = { id: 'admin-id', username: 'admin', role: 'admin', name: 'System Admin Sarah' };
  } else {
    payload = {
      id: 'custom-' + testUser,
      username: testUser,
      role: customRole || 'patient',
      patientId: customRole === 'patient' ? 'P1001' : null,
      doctorId: customRole === 'doctor' ? 'D201' : null,
    };
  }

  return 'Bearer ' + jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
};

const executeAccessTest = async (app, {
  userRole,
  userId,
  targetPatientId,
  resourceType,
  action = 'GET',
  customPayload = null,
}) => {
  const supertest = require('supertest');
  const request = supertest(app);
  const startTime = Date.now();

  let endpoint = '';
  switch (resourceType.toLowerCase()) {
    case 'profile':
      endpoint = \`/api/patients/\${targetPatientId}\`;
      break;
    case 'medical report':
    case 'reports':
      endpoint = targetPatientId === 'P1001' ? '/api/reports/REP-1001' :
                 targetPatientId === 'P1002' ? '/api/reports/REP-2001' :
                 targetPatientId === 'P1003' ? '/api/reports/REP-3001' :
                 \`/api/reports?patientId=\${targetPatientId}\`;
      break;
    case 'prescriptions':
      endpoint = targetPatientId === 'P1001' ? '/api/prescriptions/RX-1001' :
                 targetPatientId === 'P1002' ? '/api/prescriptions/RX-2001' :
                 targetPatientId === 'P1003' ? '/api/prescriptions/RX-3001' :
                 \`/api/prescriptions?patientId=\${targetPatientId}\`;
      break;
    case 'appointments':
      endpoint = targetPatientId === 'P1001' ? '/api/appointments/APT-1001' :
                 targetPatientId === 'P1002' ? '/api/appointments/APT-1003' :
                 targetPatientId === 'P1003' ? '/api/appointments/APT-1004' :
                 \`/api/appointments?patientId=\${targetPatientId}\`;
      break;
    case 'billing':
      endpoint = targetPatientId === 'P1001' ? '/api/billing/INV-1001' :
                 targetPatientId === 'P1002' ? '/api/billing/INV-2001' :
                 targetPatientId === 'P1003' ? '/api/billing/INV-3001' :
                 \`/api/billing?patientId=\${targetPatientId}\`;
      break;
    default:
      endpoint = \`/api/patients/\${targetPatientId}\`;
  }

  const authHeader = getTestAuthHeader(userId || userRole, userRole);

  let expectedStatus = 200;
  let expectedResult = 'ACCESS GRANTED';

  if (userId === 'unauthenticated' || userId === 'anonymous') {
    expectedStatus = 401;
    expectedResult = 'ACCESS DENIED';
  } else if (userId === 'tampered_token' || userId === 'expired_token' || userId === 'attacker') {
    expectedStatus = 401;
    expectedResult = 'ACCESS DENIED';
  } else if (userRole === 'admin') {
    expectedStatus = 200;
    expectedResult = 'ACCESS GRANTED';
  } else if (userRole === 'patient') {
    const requesterPatientId = userId === 'patientA' ? 'P1001' :
                               userId === 'patientB' ? 'P1002' :
                               userId === 'patientC' ? 'P1003' : userId;
    if (requesterPatientId !== targetPatientId) {
      expectedStatus = 403;
      expectedResult = 'ACCESS DENIED';
    } else {
      expectedStatus = 200;
      expectedResult = 'ACCESS GRANTED';
    }
  } else if (userRole === 'doctor') {
    const doctorId = (userId === 'dr_alice' || userId === 'D201') ? 'D201' : 'D202';
    const isAssigned = (doctorId === 'D201' && (targetPatientId === 'P1001' || targetPatientId === 'P1003')) ||
                       (doctorId === 'D202' && targetPatientId === 'P1002');
    if (!isAssigned) {
      expectedStatus = 403;
      expectedResult = 'ACCESS DENIED';
    } else {
      expectedStatus = 200;
      expectedResult = 'ACCESS GRANTED';
    }
  }

  let reqBuilder;
  const method = action.toUpperCase();
  if (method === 'POST') reqBuilder = request.post(endpoint).send(customPayload || {});
  else if (method === 'PUT') reqBuilder = request.put(endpoint).send(customPayload || {});
  else if (method === 'DELETE') reqBuilder = request.delete(endpoint);
  else reqBuilder = request.get(endpoint);

  if (authHeader) reqBuilder.set('Authorization', authHeader);

  let res;
  let executionError = null;
  try {
    res = await reqBuilder;
  } catch (err) {
    executionError = err.message;
  }

  const duration = Date.now() - startTime;
  const actualStatus = res ? res.status : 500;
  const actualResult = (actualStatus === 200 || actualStatus === 201) ? 'ACCESS GRANTED' : 'ACCESS DENIED';

  let testStatus = 'FAIL';
  if (executionError) {
    testStatus = 'BLOCKED';
  } else if (actualStatus === expectedStatus || actualResult === expectedResult) {
    testStatus = 'PASS';
  }

  await logAuditEvent({
    eventType: 'TEST_EXECUTION',
    severity: testStatus === 'PASS' ? 'INFO' : 'ALERT',
    userId: userId || 'tester',
    username: userId || 'tester',
    role: userRole || 'tester',
    action: method,
    resource: endpoint,
    targetPatientId,
    statusCode: actualStatus,
    status: testStatus === 'PASS' ? 'SUCCESS' : 'FAILED',
    details: \`Access Test: \${userId} (\${userRole}) -> \${resourceType} of \${targetPatientId} | Expected: \${expectedResult} (\${expectedStatus}), Actual: \${actualResult} (\${actualStatus}) -> \${testStatus}\`,
  });

  return {
    testDetails: {
      userRole,
      userId,
      targetPatientId,
      resourceType,
      endpoint,
      method,
      hasAuthToken: !!authHeader,
    },
    expectedResult,
    expectedStatus,
    actualResult,
    actualStatus,
    status: testStatus,
    durationMs: duration,
    responseBody: res ? res.body : { error: executionError },
    timestamp: new Date().toISOString(),
  };
};

module.exports = { getTestAuthHeader, executeAccessTest };
`;

// backend/services/seedService.js
files['backend/services/seedService.js'] = `const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalReport = require('../models/MedicalReport');
const Prescription = require('../models/Prescription');
const Billing = require('../models/Billing');
const TestCase = require('../models/TestCase');
const AuditLog = require('../models/AuditLog');

const seedInitialData = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('[Seed] Database already seeded. Skipping initial seeding.');
      return;
    }

    console.log('[Seed] Seeding initial database records...');

    const usersData = [
      { username: 'patientA', email: 'patientA@healthportal.test', password: 'Password123!', name: 'John Doe', role: 'patient', patientId: 'P1001' },
      { username: 'patientB', email: 'patientB@healthportal.test', password: 'Password123!', name: 'Jane Smith', role: 'patient', patientId: 'P1002' },
      { username: 'patientC', email: 'patientC@healthportal.test', password: 'Password123!', name: 'Robert Brown', role: 'patient', patientId: 'P1003' },
      { username: 'dr_alice', email: 'alice@healthportal.test', password: 'DoctorPass123!', name: 'Dr. Alice Carter', role: 'doctor', doctorId: 'D201' },
      { username: 'dr_bob', email: 'bob@healthportal.test', password: 'DoctorPass123!', name: 'Dr. Bob Vance', role: 'doctor', doctorId: 'D202' },
      { username: 'admin', email: 'admin@healthportal.test', password: 'AdminPass123!', name: 'System Admin Sarah', role: 'admin' },
    ];

    const createdUsers = [];
    for (const u of usersData) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);
    }
    console.log(\`[Seed] Created \${createdUsers.length} users.\`);

    const findUser = (uname) => createdUsers.find(u => u.username.toLowerCase() === uname.toLowerCase());

    const doctorsData = [
      {
        doctorId: 'D201',
        userId: findUser('dr_alice')?._id,
        name: 'Dr. Alice Carter',
        specialization: 'Cardiology & General Medicine',
        department: 'Cardiovascular Care',
        email: 'alice@healthportal.test',
        phone: '+1-555-0201',
        licenseNumber: 'MD-74892-CA',
        assignedPatientIds: ['P1001', 'P1003'],
      },
      {
        doctorId: 'D202',
        userId: findUser('dr_bob')?._id,
        name: 'Dr. Bob Vance',
        specialization: 'Neurology & Family Practice',
        department: 'Neurological Sciences',
        email: 'bob@healthportal.test',
        phone: '+1-555-0202',
        licenseNumber: 'MD-83210-NY',
        assignedPatientIds: ['P1002'],
      },
    ];
    await Doctor.insertMany(doctorsData);

    const patientsData = [
      {
        patientId: 'P1001',
        userId: findUser('patientA')?._id,
        name: 'John Doe',
        dob: '1988-04-12',
        gender: 'Male',
        bloodType: 'A+',
        phone: '+1-555-0101',
        email: 'patientA@healthportal.test',
        address: '742 Evergreen Terrace, Springfield',
        emergencyContact: { name: 'Mary Doe', relation: 'Spouse', phone: '+1-555-0102' },
        assignedDoctorId: 'D201',
        assignedDoctorName: 'Dr. Alice Carter',
        allergies: ['Penicillin', 'Sulfa drugs'],
        chronicConditions: ['Mild Asthma'],
      },
      {
        patientId: 'P1002',
        userId: findUser('patientB')?._id,
        name: 'Jane Smith',
        dob: '1992-09-24',
        gender: 'Female',
        bloodType: 'O-',
        phone: '+1-555-0103',
        email: 'patientB@healthportal.test',
        address: '456 Elm St, Metropolia',
        emergencyContact: { name: 'Thomas Smith', relation: 'Brother', phone: '+1-555-0104' },
        assignedDoctorId: 'D202',
        assignedDoctorName: 'Dr. Bob Vance',
        allergies: ['Latex'],
        chronicConditions: ['Type 2 Diabetes'],
      },
      {
        patientId: 'P1003',
        userId: findUser('patientC')?._id,
        name: 'Robert Brown',
        dob: '1975-11-03',
        gender: 'Male',
        bloodType: 'B+',
        phone: '+1-555-0105',
        email: 'patientC@healthportal.test',
        address: '789 Oak Ave, Riverside',
        emergencyContact: { name: 'Sarah Brown', relation: 'Daughter', phone: '+1-555-0106' },
        assignedDoctorId: 'D201',
        assignedDoctorName: 'Dr. Alice Carter',
        allergies: ['Aspirin'],
        chronicConditions: ['Hypertension'],
      },
    ];
    await Patient.insertMany(patientsData);

    const appointmentsData = [
      {
        appointmentId: 'APT-1001',
        patientId: 'P1001',
        patientName: 'John Doe',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        date: '2026-10-05',
        time: '09:30 AM',
        department: 'Cardiovascular Care',
        status: 'Scheduled',
        reason: 'Routine quarterly cardiac evaluation and ECG review',
      },
      {
        appointmentId: 'APT-1002',
        patientId: 'P1001',
        patientName: 'John Doe',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        date: '2026-08-15',
        time: '11:00 AM',
        department: 'General Clinic',
        status: 'Completed',
        reason: 'Annual comprehensive physical wellness examination',
      },
      {
        appointmentId: 'APT-1003',
        patientId: 'P1002',
        patientName: 'Jane Smith',
        doctorId: 'D202',
        doctorName: 'Dr. Bob Vance',
        date: '2026-10-12',
        time: '02:15 PM',
        department: 'Endocrinology',
        status: 'Scheduled',
        reason: 'HbA1c test follow-up and dietary counseling',
      },
      {
        appointmentId: 'APT-1004',
        patientId: 'P1003',
        patientName: 'Robert Brown',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        date: '2026-10-18',
        time: '10:00 AM',
        department: 'Internal Medicine',
        status: 'Scheduled',
        reason: 'Blood pressure monitoring follow-up',
      },
    ];
    await Appointment.insertMany(appointmentsData);

    const reportsData = [
      {
        reportId: 'REP-1001',
        patientId: 'P1001',
        patientName: 'John Doe',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        title: 'Comprehensive Metabolic Panel & Lipid Profile',
        category: 'Laboratory',
        date: '2026-08-15',
        summary: 'Total cholesterol within normal limits. Glucose levels normal.',
        findings: 'Total Cholesterol: 185 mg/dL, HDL: 52 mg/dL, LDL: 105 mg/dL, Triglycerides: 140 mg/dL.',
        recommendations: 'Continue Mediterranean diet and moderate cardiovascular exercise.',
        isConfidential: true,
      },
      {
        reportId: 'REP-1002',
        patientId: 'P1001',
        patientName: 'John Doe',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        title: '12-Lead Electrocardiogram (ECG)',
        category: 'Cardiology',
        date: '2026-08-15',
        summary: 'Normal sinus rhythm, heart rate 68 bpm. No acute ST changes.',
        findings: 'PR interval 150ms, QRS duration 86ms, QTc 410ms. No signs of ischemia.',
        recommendations: 'Routine 1-year follow-up.',
        isConfidential: true,
      },
      {
        reportId: 'REP-2001',
        patientId: 'P1002',
        patientName: 'Jane Smith',
        doctorId: 'D202',
        doctorName: 'Dr. Bob Vance',
        title: 'Glycated Hemoglobin (HbA1c) Analysis',
        category: 'Laboratory',
        date: '2026-09-10',
        summary: 'Elevated HbA1c indicative of moderate glycemic control.',
        findings: 'HbA1c: 7.2% (Target < 7.0%). Estimated average glucose 160 mg/dL.',
        recommendations: 'Adjust Metformin dosage from 500mg to 850mg twice daily with meals.',
        isConfidential: true,
      },
      {
        reportId: 'REP-2002',
        patientId: 'P1002',
        patientName: 'Jane Smith',
        doctorId: 'D202',
        doctorName: 'Dr. Bob Vance',
        title: 'Bilateral Renal Ultrasound',
        category: 'Radiology',
        date: '2026-09-12',
        summary: 'Normal kidney size and parenchyma. No hydronephrosis or calculi detected.',
        findings: 'Right kidney 10.4 cm, Left kidney 10.7 cm. Cortical thickness preserved.',
        recommendations: 'Repeat in 12 months as part of diabetic surveillance.',
        isConfidential: true,
      },
      {
        reportId: 'REP-3001',
        patientId: 'P1003',
        patientName: 'Robert Brown',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        title: '24-Hour Ambulatory Blood Pressure Report',
        category: 'Cardiology',
        date: '2026-09-02',
        summary: 'Diurnal BP variation preserved with mild daytime systolic elevation.',
        findings: 'Average daytime BP 138/88 mmHg. Average nighttime BP 118/72 mmHg.',
        recommendations: 'Maintain low-sodium diet and Lisinopril 10mg daily.',
        isConfidential: true,
      },
    ];
    await MedicalReport.insertMany(reportsData);

    const prescriptionsData = [
      {
        prescriptionId: 'RX-1001',
        patientId: 'P1001',
        patientName: 'John Doe',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        date: '2026-08-15',
        status: 'Active',
        notes: 'Use inhaler 15 minutes before vigorous exercise.',
        medications: [
          { name: 'Albuterol Sulfate Inhaler', dosage: '90 mcg/actuation', frequency: '2 puffs every 4-6 hours as needed', duration: '90 days' },
          { name: 'Multivitamin Formula', dosage: '1 tablet', frequency: 'Once daily', duration: '180 days' },
        ],
      },
      {
        prescriptionId: 'RX-2001',
        patientId: 'P1002',
        patientName: 'Jane Smith',
        doctorId: 'D202',
        doctorName: 'Dr. Bob Vance',
        date: '2026-09-10',
        status: 'Active',
        notes: 'Monitor blood glucose daily before breakfast.',
        medications: [
          { name: 'Metformin HCl ER', dosage: '850 mg', frequency: 'Twice daily', duration: '90 days' },
        ],
      },
      {
        prescriptionId: 'RX-3001',
        patientId: 'P1003',
        patientName: 'Robert Brown',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        date: '2026-09-02',
        status: 'Active',
        notes: 'Check blood pressure weekly.',
        medications: [
          { name: 'Lisinopril', dosage: '10 mg', frequency: 'Once daily', duration: '90 days' },
        ],
      },
    ];
    await Prescription.insertMany(prescriptionsData);

    const billingsData = [
      {
        invoiceId: 'INV-1001',
        patientId: 'P1001',
        patientName: 'John Doe',
        date: '2026-08-15',
        dueDate: '2026-09-15',
        items: [
          { description: 'Annual Wellness Exam (CPT 99395)', cost: 250 },
          { description: 'Comprehensive Metabolic Panel (CPT 80053)', cost: 95 },
          { description: '12-Lead Electrocardiogram (CPT 93000)', cost: 120 },
        ],
        totalAmount: 465,
        insuranceCovered: 415,
        patientOwes: 50,
        status: 'Paid',
      },
      {
        invoiceId: 'INV-1002',
        patientId: 'P1001',
        patientName: 'John Doe',
        date: '2026-10-01',
        dueDate: '2026-11-01',
        items: [{ description: 'Prescription Refill Consultation', cost: 75 }],
        totalAmount: 75,
        insuranceCovered: 55,
        patientOwes: 20,
        status: 'Pending',
      },
      {
        invoiceId: 'INV-2001',
        patientId: 'P1002',
        patientName: 'Jane Smith',
        date: '2026-09-10',
        dueDate: '2026-10-10',
        items: [
          { description: 'Endocrinology Specialist Consult (CPT 99214)', cost: 320 },
          { description: 'HbA1c Blood Test (CPT 83036)', cost: 65 },
          { description: 'Renal Ultrasound (CPT 76770)', cost: 380 },
        ],
        totalAmount: 765,
        insuranceCovered: 650,
        patientOwes: 115,
        status: 'Pending',
      },
      {
        invoiceId: 'INV-3001',
        patientId: 'P1003',
        patientName: 'Robert Brown',
        date: '2026-09-02',
        dueDate: '2026-10-02',
        items: [{ description: 'Cardiology Ambulatory BP Monitor (CPT 93784)', cost: 210 }],
        totalAmount: 210,
        insuranceCovered: 180,
        patientOwes: 30,
        status: 'Paid',
      },
    ];
    await Billing.insertMany(billingsData);

    const testCasesData = [
      {
        caseId: 'TC001',
        title: 'Valid patient login',
        category: 'Authentication',
        description: 'Verify that a patient with valid credentials successfully authenticates and receives a valid JWT token.',
        targetEndpoint: '/api/auth/login',
        httpMethod: 'POST',
        roleUnderUser: 'patient',
        testUser: 'patientA',
        expectedStatus: 200,
        expectedResult: 'SUCCESS',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Returns signed JWT with patientId and role claims.',
      },
      {
        caseId: 'TC002',
        title: 'Invalid password',
        category: 'Authentication',
        description: 'Verify that login fails with 401 Unauthorized when an incorrect password is provided.',
        targetEndpoint: '/api/auth/login',
        httpMethod: 'POST',
        roleUnderUser: 'patient',
        testUser: 'patientA_wrongpw',
        expectedStatus: 401,
        expectedResult: 'UNAUTHORIZED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Returns 401 Unauthorized and logs LOGIN_FAILED audit event.',
      },
      {
        caseId: 'TC003',
        title: 'Patient accesses own profile',
        category: 'Authorization',
        description: 'Verify that Patient A (P1001) can access their own profile at /api/patients/P1001.',
        targetEndpoint: '/api/patients/P1001',
        httpMethod: 'GET',
        roleUnderUser: 'patient',
        testUser: 'patientA',
        targetPatientId: 'P1001',
        expectedStatus: 200,
        expectedResult: 'ACCESS GRANTED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Patient has full read rights to own profile.',
      },
      {
        caseId: 'TC004',
        title: 'Patient attempts to access another patient',
        category: 'Security',
        description: 'Verify that Patient A (P1001) is strictly forbidden (403) from accessing Patient B (P1002) records (IDOR/BOLA prevention).',
        targetEndpoint: '/api/patients/P1002',
        httpMethod: 'GET',
        roleUnderUser: 'patient',
        testUser: 'patientA',
        targetPatientId: 'P1002',
        expectedStatus: 403,
        expectedResult: 'ACCESS DENIED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Backend ownership check blocks access with 403 Forbidden and alerts in Audit Log.',
      },
      {
        caseId: 'TC005',
        title: 'Doctor accesses assigned patient',
        category: 'Authorization',
        description: 'Verify that Dr. Alice (D201) can view clinical records for assigned Patient A (P1001).',
        targetEndpoint: '/api/patients/P1001',
        httpMethod: 'GET',
        roleUnderUser: 'doctor',
        testUser: 'dr_alice',
        targetPatientId: 'P1001',
        expectedStatus: 200,
        expectedResult: 'ACCESS GRANTED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Doctor-patient assignment table authorizes clinical access.',
      },
      {
        caseId: 'TC006',
        title: 'Doctor accesses unassigned patient',
        category: 'Security',
        description: 'Verify that Dr. Alice (D201) is blocked with 403 Forbidden when attempting to access unassigned Patient B (P1002).',
        targetEndpoint: '/api/patients/P1002',
        httpMethod: 'GET',
        roleUnderUser: 'doctor',
        testUser: 'dr_alice',
        targetPatientId: 'P1002',
        expectedStatus: 403,
        expectedResult: 'ACCESS DENIED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Unassigned doctor cannot view patient chart.',
      },
      {
        caseId: 'TC007',
        title: 'Unauthenticated API request',
        category: 'API',
        description: 'Verify that requesting protected medical records without an Authorization header returns 401 Unauthorized.',
        targetEndpoint: '/api/reports?patientId=P1001',
        httpMethod: 'GET',
        roleUnderUser: 'unauthenticated',
        testUser: 'anonymous',
        expectedStatus: 401,
        expectedResult: 'UNAUTHORIZED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Rejected by authenticateToken middleware.',
      },
      {
        caseId: 'TC008',
        title: 'Invalid JWT',
        category: 'Security',
        description: 'Verify that a forged, malformed, or tampered JWT token is rejected with 401 Unauthorized.',
        targetEndpoint: '/api/patients/P1001',
        httpMethod: 'GET',
        roleUnderUser: 'attacker',
        testUser: 'tampered_token',
        expectedStatus: 401,
        expectedResult: 'UNAUTHORIZED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Signature verification failure triggers 401 TOKEN_INVALID.',
      },
      {
        caseId: 'TC009',
        title: 'Expired JWT',
        category: 'Authentication',
        description: 'Verify that an expired JWT token returns 401 Unauthorized with TOKEN_EXPIRED code.',
        targetEndpoint: '/api/patients/P1001',
        httpMethod: 'GET',
        roleUnderUser: 'attacker',
        testUser: 'expired_token',
        expectedStatus: 401,
        expectedResult: 'UNAUTHORIZED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: TokenExpiredError handled cleanly with 401.',
      },
      {
        caseId: 'TC010',
        title: 'Admin accesses testing dashboard',
        category: 'Authorization',
        description: 'Verify that an administrator can access test management and view complete audit records.',
        targetEndpoint: '/api/testing/cases',
        httpMethod: 'GET',
        roleUnderUser: 'admin',
        testUser: 'admin',
        expectedStatus: 200,
        expectedResult: 'ACCESS GRANTED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Admin role permission granted.',
      },
    ];
    await TestCase.insertMany(testCasesData);

    const initialLogs = [
      {
        logId: 'LOG-INIT-101',
        timestamp: new Date(Date.now() - 3600000 * 2),
        eventType: 'LOGIN',
        severity: 'INFO',
        userId: 'P1001',
        username: 'patientA',
        role: 'patient',
        action: 'POST',
        resource: '/api/auth/login',
        statusCode: 200,
        status: 'SUCCESS',
        ipAddress: '192.168.1.45',
        details: 'User patientA successfully authenticated',
      },
      {
        logId: 'LOG-INIT-102',
        timestamp: new Date(Date.now() - 3600000 * 1.8),
        eventType: 'RESOURCE_ACCESS',
        severity: 'INFO',
        userId: 'P1001',
        username: 'patientA',
        role: 'patient',
        action: 'GET',
        resource: '/api/patients/P1001',
        targetPatientId: 'P1001',
        statusCode: 200,
        status: 'SUCCESS',
        ipAddress: '192.168.1.45',
        details: 'Patient P1001 accessed own medical profile',
      },
      {
        logId: 'LOG-INIT-103',
        timestamp: new Date(Date.now() - 3600000 * 1.5),
        eventType: 'UNAUTHORIZED_ACCESS',
        severity: 'ALERT',
        userId: 'P1001',
        username: 'patientA',
        role: 'patient',
        action: 'GET',
        resource: '/api/patients/P1002/reports',
        targetPatientId: 'P1002',
        statusCode: 403,
        status: 'DENIED',
        ipAddress: '192.168.1.45',
        details: 'Patient P1001 attempted to access Patient P1002 medical report → DENIED (403)',
      },
    ];
    await AuditLog.insertMany(initialLogs);

    console.log('[Seed] Database initialization completed successfully!');
  } catch (err) {
    console.error('[Seed Error]:', err);
    throw err;
  }
};

module.exports = { seedInitialData };
`;

// backend/controllers/authController.js
files['backend/controllers/authController.js'] = `const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { logAuditEvent } = require('../middleware/auditMiddleware');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      await logAuditEvent({
        eventType: 'LOGIN_FAILED',
        severity: 'WARNING',
        username,
        role: 'guest',
        action: 'LOGIN',
        resource: '/api/auth/login',
        statusCode: 401,
        status: 'FAILED',
        details: \`Login failed: Username '\${username}' not found\`,
      });
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS', message: 'The username or password provided is incorrect.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await logAuditEvent({
        eventType: 'LOGIN_FAILED',
        severity: 'WARNING',
        userId: user._id,
        username: user.username,
        role: user.role,
        action: 'LOGIN',
        resource: '/api/auth/login',
        statusCode: 401,
        status: 'FAILED',
        details: \`Login failed: Incorrect password for '\${username}'\`,
      });
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS', message: 'The username or password provided is incorrect.' });
    }

    const payload = {
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      patientId: user.patientId,
      doctorId: user.doctorId,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    await logAuditEvent({
      eventType: 'LOGIN',
      severity: 'INFO',
      userId: user._id,
      username: user.username,
      role: user.role,
      action: 'LOGIN',
      resource: '/api/auth/login',
      statusCode: 200,
      status: 'SUCCESS',
      details: \`User '\${user.username}' logged in successfully with role '\${user.role}'\`,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        patientId: user.patientId,
        doctorId: user.doctorId,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password, name, dob, gender, phone, allergies, chronicConditions } = req.body;
    if (!username || !email || !password || !name) return res.status(400).json({ error: 'Missing required registration fields' });

    const existingUser = await User.findOne({
      $or: [{ username: username.toLowerCase().trim() }, { email: email.toLowerCase().trim() }],
    });
    if (existingUser) return res.status(409).json({ error: 'Username or email already exists' });

    const count = await Patient.countDocuments();
    const patientId = \`P\${1001 + count}\`;

    const newUser = new User({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password,
      name,
      role: 'patient',
      patientId,
    });
    await newUser.save();

    const newPatient = new Patient({
      patientId,
      userId: newUser._id,
      name,
      email: newUser.email,
      dob: dob || '1990-01-01',
      gender: gender || 'Other',
      phone: phone || '+1-555-0100',
      assignedDoctorId: 'D201',
      assignedDoctorName: 'Dr. Alice Carter',
      allergies: allergies ? (Array.isArray(allergies) ? allergies : allergies.split(',')) : [],
      chronicConditions: chronicConditions ? (Array.isArray(chronicConditions) ? chronicConditions : chronicConditions.split(',')) : [],
    });
    await newPatient.save();

    const payload = { id: newUser._id, username: newUser.username, name: newUser.name, role: newUser.role, patientId };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.status(201).json({ message: 'Registration successful', token, user: payload });
  } catch (err) {
    res.status(500).json({ error: 'Registration error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};

const generateTestToken = async (req, res) => {
  const { tokenType, targetRole, patientId, doctorId } = req.body;
  if (tokenType === 'expired') {
    const token = jwt.sign({ id: 'expired-1', username: 'expired', role: targetRole || 'patient', patientId: patientId || 'P1001' }, JWT_SECRET, { expiresIn: '-1h' });
    return res.json({ token, type: 'expired' });
  }
  if (tokenType === 'tampered') {
    const token = jwt.sign({ id: 'tampered-1', username: 'attacker', role: 'admin' }, 'different_secret', { expiresIn: '1h' });
    return res.json({ token, type: 'tampered' });
  }
  const token = jwt.sign({ id: 'custom-1', username: 'test_user', role: targetRole || 'patient', patientId, doctorId }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, type: 'custom' });
};

const logout = async (req, res) => {
  if (req.user) {
    await logAuditEvent({
      eventType: 'LOGOUT',
      severity: 'INFO',
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'LOGOUT',
      resource: '/api/auth/logout',
      statusCode: 200,
      status: 'SUCCESS',
      details: \`User '\${req.user.username}' logged out\`,
    });
  }
  res.json({ message: 'Logged out successfully' });
};

module.exports = { login, register, getCurrentUser, generateTestToken, logout };
`;

// backend/controllers/patientController.js
files['backend/controllers/patientController.js'] = `const Patient = require('../models/Patient');
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
    if (!patient) return res.status(404).json({ error: \`Patient \${patientId} not found\` });

    await logAuditEvent({
      eventType: 'RESOURCE_ACCESS',
      severity: 'INFO',
      userId: req.user.id || req.user.patientId,
      username: req.user.username,
      role: req.user.role,
      action: 'GET',
      resource: \`/api/patients/\${patientId}\`,
      targetPatientId: patientId,
      statusCode: 200,
      status: 'SUCCESS',
      details: \`\${req.user.role.toUpperCase()} '\${req.user.username}' accessed profile data for Patient \${patientId}\`,
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
`;

// backend/controllers/appointmentController.js
files['backend/controllers/appointmentController.js'] = `const Appointment = require('../models/Appointment');
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
`;

// backend/controllers/reportController.js
files['backend/controllers/reportController.js'] = `const MedicalReport = require('../models/MedicalReport');
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
    if (!report) return res.status(404).json({ error: \`Report \${id} not found\` });

    if (req.user.role === 'patient' && report.patientId !== req.user.patientId) {
      await logAuditEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        severity: 'ALERT',
        userId: req.user.patientId,
        username: req.user.username,
        role: 'patient',
        action: 'GET',
        resource: \`/api/reports/\${id}\`,
        targetPatientId: report.patientId,
        statusCode: 403,
        status: 'DENIED',
        details: \`Patient \${req.user.patientId} attempted to access Patient \${report.patientId} medical report (\${report.reportId}) → DENIED (403)\`,
      });

      return res.status(403).json({
        error: 'Forbidden: Access denied to medical report',
        code: 'ACCESS_DENIED_OWNERSHIP_MISMATCH',
        message: \`You are authenticated as patient \${req.user.patientId}. You are not authorized to view medical records belonging to patient \${report.patientId}.\`,
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
          resource: \`/api/reports/\${id}\`,
          targetPatientId: report.patientId,
          statusCode: 403,
          status: 'DENIED',
          details: \`Doctor \${req.user.doctorId} attempted to access unassigned Patient \${report.patientId} medical report (\${report.reportId}) → DENIED (403)\`,
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
      reportId: \`REP-\${2000 + count + 1}\`,
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
`;

// backend/controllers/prescriptionController.js
files['backend/controllers/prescriptionController.js'] = `const Prescription = require('../models/Prescription');
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
`;

// backend/controllers/billingController.js
files['backend/controllers/billingController.js'] = `const Billing = require('../models/Billing');

const getInvoices = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'patient') filter.patientId = req.user.patientId;
    else if (req.query.patientId) filter.patientId = req.query.patientId;
    const invoices = await Billing.find(filter).sort({ date: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve billing records' });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Billing.findOne({
      $or: [{ invoiceId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (req.user.role === 'patient' && invoice.patientId !== req.user.patientId) {
      return res.status(403).json({ error: 'Forbidden', code: 'ACCESS_DENIED_OWNERSHIP_MISMATCH' });
    }
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve invoice' });
  }
};

const payInvoice = async (req, res) => {
  try {
    const invoice = await Billing.findOne({ invoiceId: req.params.id });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (req.user.role === 'patient' && invoice.patientId !== req.user.patientId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    invoice.status = 'Paid';
    invoice.patientOwes = 0;
    await invoice.save();
    res.json({ message: 'Invoice paid successfully', invoice });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

module.exports = { getInvoices, getInvoiceById, payInvoice };
`;

// backend/controllers/testCaseController.js
files['backend/controllers/testCaseController.js'] = `const TestCase = require('../models/TestCase');
const TestExecution = require('../models/TestExecution');
const { executeAccessTest } = require('../services/testRunnerService');

const getAllTestCases = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};
    if (category && category !== 'ALL') query.category = category;
    if (status && status !== 'ALL') query.lastExecutionStatus = status;
    if (search) {
      query.$or = [
        { caseId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const cases = await TestCase.find(query).sort({ caseId: 1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve test cases' });
  }
};

const getTestCaseStats = async (req, res) => {
  try {
    const allCases = await TestCase.find();
    const totalTestCases = allCases.length;
    const passed = allCases.filter(c => c.lastExecutionStatus === 'PASS').length;
    const failed = allCases.filter(c => c.lastExecutionStatus === 'FAIL').length;
    const blocked = allCases.filter(c => c.lastExecutionStatus === 'BLOCKED').length;
    const notRun = allCases.filter(c => c.lastExecutionStatus === 'NOT_RUN').length;
    const passPercentage = totalTestCases > 0 ? Math.round((passed / totalTestCases) * 100) : 0;

    const categories = ['Authentication', 'Authorization', 'API', 'Security'];
    const categoryStats = categories.map(cat => {
      const catCases = allCases.filter(c => c.category === cat);
      const catPassed = catCases.filter(c => c.lastExecutionStatus === 'PASS').length;
      const catFailed = catCases.filter(c => c.lastExecutionStatus === 'FAIL').length;
      const catBlocked = catCases.filter(c => c.lastExecutionStatus === 'BLOCKED').length;
      return {
        category: cat,
        total: catCases.length,
        passed: catPassed,
        failed: catFailed,
        blocked: catBlocked,
        passPercentage: catCases.length > 0 ? Math.round((catPassed / catCases.length) * 100) : 0,
      };
    });

    res.json({ totalTestCases, passed, failed, blocked, notRun, passPercentage, categoryStats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute test statistics' });
  }
};

const createTestCase = async (req, res) => {
  try {
    const count = await TestCase.countDocuments();
    const caseId = req.body.caseId || \`TC\${String(count + 1).padStart(3, '0')}\`;
    const tc = new TestCase({ ...req.body, caseId });
    await tc.save();
    res.status(201).json({ message: 'Created test case', testCase: tc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    const tc = await TestCase.findOneAndUpdate(
      { $or: [{ caseId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: req.body },
      { new: true }
    );
    res.json({ message: 'Updated', testCase: tc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    await TestCase.findOneAndDelete({
      $or: [{ caseId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const runSingleTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    const tc = await TestCase.findOne({
      $or: [{ caseId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });
    if (!tc) return res.status(404).json({ error: 'Not found' });

    let resourceType = 'profile';
    if (tc.targetEndpoint.includes('report')) resourceType = 'medical report';
    else if (tc.targetEndpoint.includes('prescription')) resourceType = 'prescriptions';
    else if (tc.targetEndpoint.includes('appointment')) resourceType = 'appointments';
    else if (tc.targetEndpoint.includes('billing')) resourceType = 'billing';

    const targetPatient = tc.targetPatientId || (tc.targetEndpoint.match(/P\\d{4}/) ? tc.targetEndpoint.match(/P\\d{4}/)[0] : 'P1001');

    const result = await executeAccessTest(req.app, {
      userRole: tc.roleUnderUser,
      userId: tc.testUser,
      targetPatientId: targetPatient,
      resourceType,
      action: tc.httpMethod,
    });

    tc.lastExecutionStatus = result.status;
    tc.lastRunDate = new Date();
    tc.lastExecutionMessage = \`Status: \${result.actualStatus} | \${result.actualResult}\`;
    await tc.save();

    res.json({ message: 'Executed', result, testCase: tc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const runAllTestCases = async (req, res) => {
  try {
    const cases = await TestCase.find().sort({ caseId: 1 });
    const runResults = [];
    for (const tc of cases) {
      let resourceType = 'profile';
      if (tc.targetEndpoint.includes('report')) resourceType = 'medical report';
      else if (tc.targetEndpoint.includes('prescription')) resourceType = 'prescriptions';
      else if (tc.targetEndpoint.includes('appointment')) resourceType = 'appointments';
      else if (tc.targetEndpoint.includes('billing')) resourceType = 'billing';

      const targetPatient = tc.targetPatientId || (tc.targetEndpoint.match(/P\\d{4}/) ? tc.targetEndpoint.match(/P\\d{4}/)[0] : 'P1001');
      const result = await executeAccessTest(req.app, {
        userRole: tc.roleUnderUser,
        userId: tc.testUser,
        targetPatientId: targetPatient,
        resourceType,
        action: tc.httpMethod,
      });

      tc.lastExecutionStatus = result.status;
      tc.lastRunDate = new Date();
      tc.lastExecutionMessage = \`Status: \${result.actualStatus} | \${result.actualResult}\`;
      await tc.save();
      runResults.push({ caseId: tc.caseId, status: result.status, actualStatus: result.actualStatus });
    }
    res.json({ message: \`Executed \${runResults.length} tests\`, results: runResults });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllTestCases, getTestCaseStats, createTestCase, updateTestCase, deleteTestCase, runSingleTestCase, runAllTestCases };
`;

// backend/controllers/accessTestController.js
files['backend/controllers/accessTestController.js'] = `const { executeAccessTest } = require('../services/testRunnerService');
const AuditLog = require('../models/AuditLog');

const runAccessTest = async (req, res) => {
  try {
    const { userRole, userId, targetPatientId, resourceType, action, customPayload } = req.body;
    if (!userRole || !userId || !targetPatientId || !resourceType) {
      return res.status(400).json({ error: 'Missing required test parameters' });
    }
    const testResult = await executeAccessTest(req.app, {
      userRole,
      userId,
      targetPatientId,
      resourceType,
      action: action || 'GET',
      customPayload,
    });
    const latestAuditLog = await AuditLog.findOne().sort({ timestamp: -1 });
    res.json({ success: true, ...testResult, auditLog: latestAuditLog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { runAccessTest };
`;

// backend/controllers/auditLogController.js
files['backend/controllers/auditLogController.js'] = `const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res) => {
  try {
    const { eventType, severity, status, search, page = 1, limit = 50 } = req.query;
    let query = {};
    if (eventType && eventType !== 'ALL') query.eventType = eventType;
    if (severity && severity !== 'ALL') query.severity = severity;
    if (status && status !== 'ALL') query.status = status;
    if (search) {
      query.$or = [
        { details: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ total, page: parseInt(page), limit: parseInt(limit), logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
};

const getAuditLogStats = async (req, res) => {
  try {
    const total = await AuditLog.countDocuments();
    const unauthorizedAttempts = await AuditLog.countDocuments({
      $or: [{ eventType: 'UNAUTHORIZED_ACCESS' }, { status: 'DENIED' }],
    });
    const failedLogins = await AuditLog.countDocuments({ eventType: 'LOGIN_FAILED' });
    const successfulAccesses = await AuditLog.countDocuments({ eventType: 'RESOURCE_ACCESS', status: 'SUCCESS' });
    const testExecutions = await AuditLog.countDocuments({ eventType: 'TEST_EXECUTION' });
    res.json({ total, unauthorizedAttempts, failedLogins, successfulAccesses, testExecutions });
  } catch (err) {
    res.status(500).json({ error: 'Failed stats' });
  }
};

module.exports = { getAuditLogs, getAuditLogStats };
`;

// Routes
files['backend/routes/authRoutes.js'] = `const express = require('express');
const router = express.Router();
const { login, register, getCurrentUser, generateTestToken, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticateToken, getCurrentUser);
router.post('/test-token', generateTestToken);
router.post('/logout', authenticateToken, logout);

module.exports = router;
`;

files['backend/routes/patientRoutes.js'] = `const express = require('express');
const router = express.Router();
const { getAllPatients, getPatientById, updatePatient } = require('../controllers/patientController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { verifyPatientAccess } = require('../middleware/accessControlMiddleware');

router.get('/', authenticateToken, getAllPatients);
router.get('/:patientId', authenticateToken, verifyPatientAccess(), getPatientById);
router.put('/:patientId', authenticateToken, verifyPatientAccess(), updatePatient);

module.exports = router;
`;

files['backend/routes/appointmentRoutes.js'] = `const express = require('express');
const router = express.Router();
const { getAppointments, getAppointmentById, createAppointment } = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getAppointments);
router.get('/:id', authenticateToken, getAppointmentById);
router.post('/', authenticateToken, createAppointment);

module.exports = router;
`;

files['backend/routes/reportRoutes.js'] = `const express = require('express');
const router = express.Router();
const { getReports, getReportById, createReport } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

router.get('/', authenticateToken, getReports);
router.get('/:id', authenticateToken, getReportById);
router.post('/', authenticateToken, authorizeRoles('doctor', 'admin'), createReport);

module.exports = router;
`;

files['backend/routes/prescriptionRoutes.js'] = `const express = require('express');
const router = express.Router();
const { getPrescriptions, getPrescriptionById, createPrescription } = require('../controllers/prescriptionController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

router.get('/', authenticateToken, getPrescriptions);
router.get('/:id', authenticateToken, getPrescriptionById);
router.post('/', authenticateToken, authorizeRoles('doctor', 'admin'), createPrescription);

module.exports = router;
`;

files['backend/routes/billingRoutes.js'] = `const express = require('express');
const router = express.Router();
const { getInvoices, getInvoiceById, payInvoice } = require('../controllers/billingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getInvoices);
router.get('/:id', authenticateToken, getInvoiceById);
router.put('/:id/pay', authenticateToken, payInvoice);

module.exports = router;
`;

files['backend/routes/testCaseRoutes.js'] = `const express = require('express');
const router = express.Router();
const { getAllTestCases, getTestCaseStats, createTestCase, updateTestCase, deleteTestCase, runSingleTestCase, runAllTestCases } = require('../controllers/testCaseController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

router.get('/cases', authenticateToken, authorizeRoles('admin'), getAllTestCases);
router.get('/stats', authenticateToken, authorizeRoles('admin'), getTestCaseStats);
router.post('/cases', authenticateToken, authorizeRoles('admin'), createTestCase);
router.put('/cases/:id', authenticateToken, authorizeRoles('admin'), updateTestCase);
router.delete('/cases/:id', authenticateToken, authorizeRoles('admin'), deleteTestCase);
router.post('/cases/:id/run', authenticateToken, authorizeRoles('admin'), runSingleTestCase);
router.post('/run-all', authenticateToken, authorizeRoles('admin'), runAllTestCases);

module.exports = router;
`;

files['backend/routes/accessTestRoutes.js'] = `const express = require('express');
const router = express.Router();
const { runAccessTest } = require('../controllers/accessTestController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/simulate', authenticateToken, runAccessTest);

module.exports = router;
`;

files['backend/routes/auditLogRoutes.js'] = `const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditLogStats } = require('../controllers/auditLogController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

router.get('/', authenticateToken, authorizeRoles('admin'), getAuditLogs);
router.get('/stats', authenticateToken, authorizeRoles('admin'), getAuditLogStats);

module.exports = router;
`;

// backend/app.js
files['backend/app.js'] = `const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const billingRoutes = require('./routes/billingRoutes');
const testCaseRoutes = require('./routes/testCaseRoutes');
const accessTestRoutes = require('./routes/accessTestRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');

const app = express();

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    name: 'Healthcare Patient Portal & Security Access Tester API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/testing', testCaseRoutes);
app.use('/api/access-test', accessTestRoutes);
app.use('/api/audit-logs', auditLogRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
`;

// backend/server.js
files['backend/server.js'] = `require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { seedInitialData } = require('./services/seedService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedInitialData();
    app.listen(PORT, () => {
      console.log(\`=======================================================\`);
      console.log(\`  Healthcare Patient Portal API Server Started\`);
      console.log(\`  Port: http://localhost:\${PORT}\`);
      console.log(\`  Health Check: http://localhost:\${PORT}/api/health\`);
      console.log(\`  Environment: \${process.env.NODE_ENV || 'development'}\`);
      console.log(\`=======================================================\`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
`;

// backend/scripts/seed.js
files['backend/scripts/seed.js'] = `require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const { seedInitialData } = require('../services/seedService');

const run = async () => {
  try {
    await connectDB();
    await seedInitialData();
    console.log('Seeding completed.');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

run();
`;

// frontend/vite.config.js
files['frontend/vite.config.js'] = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
`;

// frontend/postcss.config.js
files['frontend/postcss.config.js'] = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

// frontend/src/index.css
files['frontend/src/index.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-50 text-slate-800 antialiased font-sans;
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
`;

// frontend/src/main.jsx
files['frontend/src/main.jsx'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;

// Write all files
for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.resolve(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Restored: ${relPath} (${content.length} bytes)`);
}
console.log('Restoration complete!');
