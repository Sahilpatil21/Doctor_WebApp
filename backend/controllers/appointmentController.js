const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const { validationResult } = require('express-validator');

const doctorProfileSelect =
  'specialization experience qualification consultationFee availabilityStatus availableTimeSlots clinicAddress';

const emitQueueUpdate = async (req, appointment) => {
  const queueAppointments = await Appointment.find({
    doctor: appointment.doctor,
    date: appointment.date,
    status: { $in: ['pending', 'confirmed'] }
  })
  .populate({
    path: 'patient',
    select: 'name email phone'
  })
  .sort({ queuePosition: 1 });

  req.app.get('io').emit('queueUpdated', {
    doctorId: appointment.doctor,
    date: appointment.date,
    queue: queueAppointments,
    message: 'Queue updated'
  });
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
const createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

const { doctorId: doctor, date, time, reason } = req.body;

    // Check if doctor exists and is available
    const doctorProfile = await DoctorProfile.findOne({ user: doctor });
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (!doctorProfile.availabilityStatus) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available for appointments'
      });
    }

    // Normalize time slots to 24hr format for comparison
    const normalizeTime = (t) => {
      const time12 = t.toLowerCase();
      if (time12.includes('am')) {
        return time12.replace(/am/, '').trim();
      } else if (time12.includes('pm')) {
        let [hours, minutes] = time12.replace(/pm/, '').trim().split(':');
        hours = parseInt(hours) + 12;
        if (hours === 24) hours = 12;
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
      }
      return t;
    };

    const normalizedTime = normalizeTime(time);
    const availableTimes = doctorProfile.availableTimeSlots.map(normalizeTime);
    
    if (!availableTimes.includes(normalizedTime)) {
      return res.status(400).json({
        success: false,
        message: 'Selected time slot is not available'
      });
    }

    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctor,
      date: new Date(date),
      time,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Time slot already booked'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      date: new Date(date),
      time,
      reason: reason || ''
    });

    // Populate appointment data
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: 'patient',
        select: 'name email phone'
      })
      .populate({
        path: 'doctor',
        select: 'name email'
      });

    // Emit real-time event
    req.app.get('io').emit('appointmentBooked', {
      appointment: populatedAppointment,
      message: 'New appointment booked'
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    let query = {};

    // Filter by user role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    // Optional date filter
    if (req.query.date) {
      const startDate = new Date(req.query.date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      query.date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Optional status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'patient',
        select: 'name email phone'
      })
      .populate({
        path: 'doctor',
        select: 'name email'
      })
      .sort({ date: 1, queuePosition: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor only)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isPatient = appointment.patient.toString() === req.user._id.toString();

    // Allow either participant to cancel, but only the doctor can confirm/complete.
    if (status === 'cancelled') {
      if (!isDoctor && !isPatient) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this appointment'
        });
      }
    } else if (!isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Update appointment
    appointment.status = status;
    if (status === 'cancelled' && cancellationReason) {
      appointment.cancellationReason = cancellationReason;
    }

    await appointment.save();

    // Populate updated appointment
    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: 'patient',
        select: 'name email phone'
      })
      .populate({
        path: 'doctor',
        select: 'name email'
      });

    // Emit real-time event
    req.app.get('io').emit('statusUpdated', {
      appointment: updatedAppointment,
      message: `Appointment status updated to ${status}`
    });

    // Emit queue update
    if (status === 'completed' || status === 'cancelled') {
      await emitQueueUpdate(req, appointment);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is authorized to cancel
    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    // Update appointment status
    appointment.status = 'cancelled';
    if (cancellationReason) {
      appointment.cancellationReason = cancellationReason;
    }

    await appointment.save();

    // Populate updated appointment
    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: 'patient',
        select: 'name email phone'
      })
      .populate({
        path: 'doctor',
        select: 'name email'
      });

    // Emit real-time event
    req.app.get('io').emit('statusUpdated', {
      appointment: updatedAppointment,
      message: 'Appointment cancelled'
    });

    // Emit queue update
    await emitQueueUpdate(req, appointment);

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get queue for doctor
// @route   GET /api/appointments/queue/:doctorId/:date
// @access  Private
const getQueue = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    const queueAppointments = await Appointment.find({
      doctor: doctorId,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate({
      path: 'patient',
      select: 'name phone'
    })
    .sort({ queuePosition: 1 });

    res.status(200).json({
      success: true,
      count: queueAppointments.length,
      data: queueAppointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my appointments (for patients)
// @route   GET /api/appointments/my
// @access  Private (Patient only)
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user._id
    })
    .populate({
      path: 'doctor',
      select: `name email role doctorProfile ${doctorProfileSelect}`,
      populate: {
        path: 'doctorProfile',
        select: doctorProfileSelect
      }
    })
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
  createAppointment,
  getAppointments,
  getMyAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getQueue
};
