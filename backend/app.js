const express = require('express');
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

app.get('/', (req, res) => {
  res.json({
    message: 'Healthcare Patient Portal & Security Access Tester Backend API',
    status: 'ONLINE',
    frontendUrl: 'http://localhost:5173',
    instructions: 'Open http://localhost:5173 in your browser to access the Web Application UI',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      patients: '/api/patients',
      appointments: '/api/appointments',
      reports: '/api/reports',
      prescriptions: '/api/prescriptions',
      billing: '/api/billing',
      testing: '/api/testing',
      accessTest: '/api/access-test',
      auditLogs: '/api/audit-logs',
    },
  });
});

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
