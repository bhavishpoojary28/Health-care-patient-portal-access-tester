const express = require('express');
const router = express.Router();
const { getPrescriptions, getPrescriptionById, createPrescription } = require('../controllers/prescriptionController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

router.get('/', authenticateToken, getPrescriptions);
router.get('/:id', authenticateToken, getPrescriptionById);
router.post('/', authenticateToken, authorizeRoles('doctor', 'admin'), createPrescription);

module.exports = router;
