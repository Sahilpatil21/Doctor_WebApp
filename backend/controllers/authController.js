const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, role, phone } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    const normalizedRole = role.trim().toLowerCase();
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : phone;

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      role: normalizedRole,
      phone: normalizedPhone
    });

    // If doctor, create doctor profile
    if (normalizedRole === 'doctor') {
      const doctorProfile = await DoctorProfile.create({
        user: user._id,
        specialization: 'General Practitioner',
        experience: 0,
        qualification: 'To be updated',
        about: 'New doctor',
        clinicAddress: 'To be updated',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: [
          { start: '09:00', end: '17:00' }
        ],
        availabilityStatus: true,
        availableTimeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']
      });

      await User.findByIdAndUpdate(user._id, {
        doctorProfile: doctorProfile._id
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    let profile = {
      _id: req.user._id,
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone
    };

    // If doctor, include doctor profile
    if (req.user.role === 'doctor') {
      const doctorProfile = await DoctorProfile.findOne({ user: req.user._id }).populate('user', '-password');
      if (doctorProfile) {
        profile.doctorProfile = {
          specialization: doctorProfile.specialization,
          experience: doctorProfile.experience,
          qualification: doctorProfile.qualification,
          about: doctorProfile.about,
          consultationFee: doctorProfile.consultationFee,
          availabilityStatus: doctorProfile.availabilityStatus,
          availableTimeSlots: doctorProfile.availableTimeSlots,
          clinicAddress: doctorProfile.clinicAddress
        };
      }
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
