const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const AuditLog = require('../models/AuditLog');
require('./setup');

describe('Security, Token Validation & RBAC Tests', () => {
  test('TC007: Request without Authorization header returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/patients/P1001');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('code', 'TOKEN_MISSING');
  });

  test('TC008: Request with forged or tampered JWT returns 401 Unauthorized', async () => {
    const fakeToken = jwt.sign(
      { id: 'hacker', role: 'admin' },
      'wrong_signing_key_99999',
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/patients/P1001')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('code', 'TOKEN_INVALID');
  });

  test('TC009: Request with expired JWT returns 401 Unauthorized with TOKEN_EXPIRED', async () => {
    const expiredToken = jwt.sign(
      { id: 'user-expired', username: 'old_user', role: 'patient', patientId: 'P1001' },
      JWT_SECRET,
      { expiresIn: '-1h' }
    );

    const res = await request(app)
      .get('/api/patients/P1001')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('code', 'TOKEN_EXPIRED');
  });

  test('TC010: Admin accesses testing dashboard test cases with 200 OK', async () => {
    const adminToken = jwt.sign(
      { id: 'admin-1', username: 'admin', role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/testing/cases')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('Patient is FORBIDDEN (403) from accessing admin testing dashboard', async () => {
    const patientToken = jwt.sign(
      { id: 'p1', username: 'patientA', role: 'patient', patientId: 'P1001' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/testing/cases')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('code', 'ACCESS_DENIED_ROLE_RESTRICTION');
  });

  test('Audit log verifies recording of security violations', async () => {
    const logs = await AuditLog.find({ eventType: 'UNAUTHORIZED_ACCESS' });
    expect(logs.length).toBeGreaterThan(0);

    const deniedLog = logs.find(l => l.status === 'DENIED');
    expect(deniedLog).toBeDefined();
    expect(deniedLog.severity).toBe('ALERT');
  });
});
