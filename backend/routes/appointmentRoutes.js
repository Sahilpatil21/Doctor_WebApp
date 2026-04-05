const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/authMiddleware');

// Create appointment
router.post('/', auth, [
  body('doctorId').notEmpty().withMessage('Doctor ID is required'),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('time').notEmpty().withMessage('Time is required'),
  body('reason').notEmpty().withMessage('Reason is required')
], appointmentController.createAppointment);

// Get appointments
router.get('/', auth, appointmentController.getAppointments);

// Get my appointments (for patients)
router.get('/my', auth, appointmentController.getMyAppointments);

// Update appointment status
router.put('/:id/status', auth, [
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status')
], appointmentController.updateAppointmentStatus);

// Cancel appointment
router.delete('/:id', auth, appointmentController.cancelAppointment);

// Get queue
router.get('/queue/:doctorId/:date', appointmentController.getQueue);

module.exports = router;
