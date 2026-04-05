const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').trim().isIn(['doctor', 'patient']).withMessage('Role must be doctor or patient')
], authController.register);

// Login
router.post('/login', [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

// Get profile
router.get('/profile', auth, authController.getProfile);

module.exports = router;
