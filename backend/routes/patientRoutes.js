const express = require('express');
const router = express.Router();
const { getAllPatients, getPatientById, updatePatient } = require('../controllers/patientController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { verifyPatientAccess } = require('../middleware/accessControlMiddleware');

router.get('/', authenticateToken, getAllPatients);
router.get('/:patientId', authenticateToken, verifyPatientAccess(), getPatientById);
router.put('/:patientId', authenticateToken, verifyPatientAccess(), updatePatient);

module.exports = router;
