const jwt = require('jsonwebtoken');
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
        details: `Login failed: Username '${username}' not found`,
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
        details: `Login failed: Incorrect password for '${username}'`,
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
      details: `User '${user.username}' logged in successfully with role '${user.role}'`,
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
    const patientId = `P${1001 + count}`;

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
      details: `User '${req.user.username}' logged out`,
    });
  }
  res.json({ message: 'Logged out successfully' });
};

module.exports = { login, register, getCurrentUser, generateTestToken, logout };
