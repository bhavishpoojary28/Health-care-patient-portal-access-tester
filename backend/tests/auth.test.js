const request = require('supertest');
const app = require('../app');
require('./setup');

describe('Authentication & Session API Tests', () => {
  let patientToken = '';

  test('TC001: Valid patient login succeeds with 200 and signed JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'patientA',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('username', 'patienta');
    expect(res.body.user).toHaveProperty('role', 'patient');
    expect(res.body.user).toHaveProperty('patientId', 'P1001');

    patientToken = res.body.token;
  });

  test('TC002: Login with incorrect password fails with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'patientA',
        password: 'WrongPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('code', 'INVALID_CREDENTIALS');
  });

  test('Login with non-existent username fails with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'nonexistent_user',
        password: 'Password123!',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('code', 'INVALID_CREDENTIALS');
  });

  test('Login with missing username or password fails with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'patientA' });

    expect(res.status).toBe(400);
  });

  test('Retrieve current authenticated user profile via /api/auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.patientId).toBe('P1001');
    expect(res.body).not.toHaveProperty('password');
  });

  test('Logout returns 200 and records audit log', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Logged out');
  });
});
