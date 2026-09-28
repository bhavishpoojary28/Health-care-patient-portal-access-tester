const jwt = require('jsonwebtoken');
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
      endpoint = `/api/patients/${targetPatientId}`;
      break;
    case 'medical report':
    case 'reports':
      endpoint = targetPatientId === 'P1001' ? '/api/reports/REP-1001' :
                 targetPatientId === 'P1002' ? '/api/reports/REP-2001' :
                 targetPatientId === 'P1003' ? '/api/reports/REP-3001' :
                 `/api/reports?patientId=${targetPatientId}`;
      break;
    case 'prescriptions':
      endpoint = targetPatientId === 'P1001' ? '/api/prescriptions/RX-1001' :
                 targetPatientId === 'P1002' ? '/api/prescriptions/RX-2001' :
                 targetPatientId === 'P1003' ? '/api/prescriptions/RX-3001' :
                 `/api/prescriptions?patientId=${targetPatientId}`;
      break;
    case 'appointments':
      endpoint = targetPatientId === 'P1001' ? '/api/appointments/APT-1001' :
                 targetPatientId === 'P1002' ? '/api/appointments/APT-1003' :
                 targetPatientId === 'P1003' ? '/api/appointments/APT-1004' :
                 `/api/appointments?patientId=${targetPatientId}`;
      break;
    case 'billing':
      endpoint = targetPatientId === 'P1001' ? '/api/billing/INV-1001' :
                 targetPatientId === 'P1002' ? '/api/billing/INV-2001' :
                 targetPatientId === 'P1003' ? '/api/billing/INV-3001' :
                 `/api/billing?patientId=${targetPatientId}`;
      break;
    default:
      endpoint = `/api/patients/${targetPatientId}`;
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
    details: `Access Test: ${userId} (${userRole}) -> ${resourceType} of ${targetPatientId} | Expected: ${expectedResult} (${expectedStatus}), Actual: ${actualResult} (${actualStatus}) -> ${testStatus}`,
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
