const express = require('express');
const router = express.Router();
const { getAppointments, getAppointmentById, createAppointment } = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getAppointments);
router.get('/:id', authenticateToken, getAppointmentById);
router.post('/', authenticateToken, createAppointment);

module.exports = router;
