const Doctor = require('../models/DoctorProfile');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('-password');
    
    // Get doctor profiles separately
    const DoctorProfile = require('../models/DoctorProfile');
    const doctorProfiles = await DoctorProfile.find({}).populate('user', 'name email role');
    
    // Merge user data with profile data
    const doctorsWithProfiles = doctors.map(doctor => {
      const profile = doctorProfiles.find(p => p.user && p.user._id.toString() === doctor._id.toString());
      return {
        ...doctor.toObject(),
        specialization: profile?.specialization || 'General Practitioner',
        qualification: profile?.qualification || 'MBBS',
        experience: profile?.experience || 0,
        consultationFee: profile?.consultationFee || 300,
        availabilityStatus: profile?.availabilityStatus || true,
        availableTimeSlots: profile?.availableTimeSlots || [],
        clinicAddress: profile?.clinicAddress || 'To be updated'
      };
    });
    
    res.status(200).json({
      success: true,
      data: doctorsWithProfiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
      .select('-password')
      .populate('userProfile');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private/Doctor
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { specialization, qualification, experience, consultationFee, clinicAddress, availableTimeSlots } = req.body;

    let doctorProfile = await Doctor.findOne({ user: req.user.id });
    
    if (doctorProfile) {
      // Update existing profile
      doctorProfile = await Doctor.findOneAndUpdate(
        { user: req.user.id },
        { 
          specialization, 
          qualification, 
          experience, 
          consultationFee, 
          clinicAddress, 
          availableTimeSlots 
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      doctorProfile = await Doctor.create({
        user: req.user.id,
        specialization,
        qualification,
        experience,
        consultationFee,
        clinicAddress,
        availableTimeSlots
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: doctorProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update availability
// @route   PUT /api/doctors/availability
// @access  Private/Doctor
const updateAvailability = async (req, res) => {
  try {
    const { availabilityStatus, availableTimeSlots } = req.body;
    
    const doctorProfile = await Doctor.findOneAndUpdate(
      { user: req.user.id },
      { 
        availabilityStatus, 
        availableTimeSlots 
      },
      { new: true, runValidators: true }
    );

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: doctorProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get today's appointments
// @route   GET /api/doctors/appointments/today
// @access  Private/Doctor
const getTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find({
      doctor: req.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      },
      status: { $ne: 'cancelled' }
    }).populate('patient', 'name email phone');

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all appointments
// @route   GET /api/doctors/appointments
// @access  Private/Doctor
const getAllAppointments = async (req, res) => {
  try {
    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find({
      doctor: req.user.id
    }).populate('patient', 'name email phone')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get patient history
// @route   GET /api/doctors/patients/:id
// @access  Private/Doctor
const getPatientHistory = async (req, res) => {
  try {
    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find({
      doctor: req.user.id,
      patient: req.params.id
    }).populate('patient', 'name email phone')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateProfile,
  updateAvailability,
  getTodayAppointments,
  getAllAppointments,
  getPatientHistory
};
