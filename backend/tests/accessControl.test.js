const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');
require('./setup');

describe('Patient Ownership & Doctor-Patient Access Control Tests', () => {
  // Helper to issue tokens for test scenarios
  const makeToken = (userObj) => jwt.sign(userObj, JWT_SECRET, { expiresIn: '1h' });

  const patientAToken = makeToken({
    id: 'user-p1001',
    username: 'patientA',
    role: 'patient',
    patientId: 'P1001',
    name: 'John Doe',
  });

  const patientBToken = makeToken({
    id: 'user-p1002',
    username: 'patientB',
    role: 'patient',
    patientId: 'P1002',
    name: 'Jane Smith',
  });

  const drAliceToken = makeToken({
    id: 'user-d201',
    username: 'dr_alice',
    role: 'doctor',
    doctorId: 'D201',
    name: 'Dr. Alice Carter',
  });

  const drBobToken = makeToken({
    id: 'user-d202',
    username: 'dr_bob',
    role: 'doctor',
    doctorId: 'D202',
    name: 'Dr. Bob Vance',
  });

  const adminToken = makeToken({
    id: 'user-admin',
    username: 'admin',
    role: 'admin',
    name: 'System Admin Sarah',
  });

  test('TC003: Patient A (P1001) successfully accesses own profile (/api/patients/P1001)', async () => {
    const res = await request(app)
      .get('/api/patients/P1001')
      .set('Authorization', `Bearer ${patientAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.patientId).toBe('P1001');
    expect(res.body.name).toBe('John Doe');
  });

  test('TC004: Patient A (P1001) is strictly FORBIDDEN (403) from accessing Patient B (P1002)', async () => {
    const res = await request(app)
      .get('/api/patients/P1002')
      .set('Authorization', `Bearer ${patientAToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('code', 'ACCESS_DENIED_OWNERSHIP_MISMATCH');
    expect(res.body.targetPatientId).toBe('P1002');
    expect(res.body.requesterPatientId).toBe('P1001');
  });

  test('Patient A is FORBIDDEN (403) from accessing Patient B medical reports', async () => {
    const res = await request(app)
      .get('/api/reports/REP-2001') // Report belonging to P1002
      .set('Authorization', `Bearer ${patientAToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('code', 'ACCESS_DENIED_OWNERSHIP_MISMATCH');
  });

  test('Patient A can successfully access their own medical report (REP-1001)', async () => {
    const res = await request(app)
      .get('/api/reports/REP-1001')
      .set('Authorization', `Bearer ${patientAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.reportId).toBe('REP-1001');
    expect(res.body.patientId).toBe('P1001');
  });

  test('TC005: Doctor Alice (D201) successfully accesses ASSIGNED Patient A (P1001)', async () => {
    const res = await request(app)
      .get('/api/patients/P1001')
      .set('Authorization', `Bearer ${drAliceToken}`);

    expect(res.status).toBe(200);
    expect(res.body.patientId).toBe('P1001');
  });

  test('TC006: Doctor Alice (D201) is BLOCKED (403) when attempting to access UNASSIGNED Patient B (P1002)', async () => {
    const res = await request(app)
      .get('/api/patients/P1002')
      .set('Authorization', `Bearer ${drAliceToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('code', 'ACCESS_DENIED_NOT_ASSIGNED_DOCTOR');
  });

  test('Doctor Bob (D202) successfully accesses ASSIGNED Patient B (P1002)', async () => {
    const res = await request(app)
      .get('/api/patients/P1002')
      .set('Authorization', `Bearer ${drBobToken}`);

    expect(res.status).toBe(200);
    expect(res.body.patientId).toBe('P1002');
  });

  test('Admin has oversight access to any patient profile', async () => {
    const resA = await request(app)
      .get('/api/patients/P1001')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resA.status).toBe(200);

    const resB = await request(app)
      .get('/api/patients/P1002')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resB.status).toBe(200);
  });
});
