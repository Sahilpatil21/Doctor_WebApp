const mongoose = require('mongoose');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
require('dotenv').config();

// Sample data for seeding
const sampleDoctors = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@clinic.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '9876543210',
    profile: {
      specialization: 'Cardiologist',
      qualification: 'MD - Cardiology',
      experience: 10,
      consultationFee: 500,
      availabilityStatus: true,
      availableTimeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
      clinicAddress: '123 Medical Center, Main Street, City'
    }
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@clinic.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '9876543211',
    profile: {
      specialization: 'General Practitioner',
      qualification: 'MD - General Medicine',
      experience: 8,
      consultationFee: 300,
      availabilityStatus: true,
      availableTimeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
      clinicAddress: '456 Health Plaza, Park Avenue, City'
    }
  },
  {
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@clinic.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '9876543212',
    profile: {
      specialization: 'Pediatrician',
      qualification: 'MD - Pediatrics',
      experience: 12,
      consultationFee: 400,
      availabilityStatus: true,
      availableTimeSlots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'],
      clinicAddress: '789 Children Hospital, School Road, City'
    }
  }
];

const samplePatients = [
  {
    name: 'John Smith',
    email: 'john.smith@email.com',
    password: 'patient123',
    role: 'patient',
    phone: '9876543220'
  },
  {
    name: 'Mary Williams',
    email: 'mary.williams@email.com',
    password: 'patient123',
    role: 'patient',
    phone: '9876543221'
  },
  {
    name: 'David Brown',
    email: 'david.brown@email.com',
    password: 'patient123',
    role: 'patient',
    phone: '9876543222'
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await DoctorProfile.deleteMany({});
    
    console.log('Cleared existing data');

    // Create doctors
    const createdDoctors = [];
    for (const doctorData of sampleDoctors) {
      const { profile, ...userData } = doctorData;
      
      const user = await User.create(userData);
      const doctorProfile = await DoctorProfile.create({
        user: user._id,
        ...profile,
      availabilityStatus: true,
      availableTimeSlots: profile.availableTimeSlots,
      consultationFee: profile.consultationFee,
      clinicAddress: profile.clinicAddress
      });

      
      createdDoctors.push({ user, profile: doctorProfile });
      console.log(`Created doctor: ${user.name}`);
    }

    // Create patients
    const createdPatients = [];
    for (const patientData of samplePatients) {
      const user = await User.create(patientData);
      createdPatients.push(user);
      console.log(`Created patient: ${user.name}`);
    }

    console.log('\n=== Seed Data Summary ===');
    console.log(`Doctors created: ${createdDoctors.length}`);
    console.log(`Patients created: ${createdPatients.length}`);
    console.log('\n=== Doctor Login Credentials ===');
    sampleDoctors.forEach(doctor => {
      console.log(`${doctor.name}: ${doctor.email} / ${doctor.password}`);
    });
    console.log('\n=== Patient Login Credentials ===');
    samplePatients.forEach(patient => {
      console.log(`${patient.name}: ${patient.email} / ${patient.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Connect to MongoDB and seed data
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedDatabase();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
