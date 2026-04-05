const mongoose = require('mongoose');

const DoctorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: 0
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required'],
    trim: true
  },
  about: {
    type: String,
    trim: true
  },
  availableDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  timeSlots: [{
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  }],
  availabilityStatus: {
    type: Boolean,
    default: true
  },
  availableTimeSlots: [{
    type: String
  }],
  consultationFee: {
    type: Number,
    min: 0
  },
  clinicAddress: {
    type: String,
    trim: true
  },
  location: {
    address: {
      type: String,
      required: false
    },
    city: {
      type: String,
      required: false
    },
    state: {
      type: String,
      required: false
    },
    zipCode: {
      type: String,
      required: false
    },
    coordinates: {
      lat: {
        type: Number,
        required: false
      },
      lng: {
        type: Number,
        required: false
      }
    }
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('DoctorProfile', DoctorProfileSchema);
