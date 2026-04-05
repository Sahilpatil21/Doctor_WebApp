const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Get all doctors
router.get('/', doctorController.getAllDoctors);

// Update doctor profile
router.put('/profile', auth, authorize('doctor'), [
  body('specialization').optional().notEmpty().withMessage('Specialization cannot be empty'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('qualification').optional().notEmpty().withMessage('Qualification cannot be empty')
], doctorController.updateProfile);

// Update availability
router.put('/availability', auth, authorize('doctor'), [
  body('availableDays').isArray().withMessage('Available days must be an array'),
  body('timeSlots').isArray().withMessage('Time slots must be an array')
], doctorController.updateAvailability);

// Get today's appointments
router.get('/appointments/today', auth, authorize('doctor'), doctorController.getTodayAppointments);

// Get patient history
router.get('/patient-history', auth, authorize('doctor'), doctorController.getPatientHistory);

// Get doctor by ID
router.get('/:id', doctorController.getDoctorById);

module.exports = router;
