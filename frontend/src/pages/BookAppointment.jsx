import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DoctorCard from '../components/DoctorCard';
import api, { appointmentAPI } from '../services/api';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });
  const selectedDoctorProfile =
    selectedDoctor && typeof selectedDoctor.doctorProfile === 'object'
      ? selectedDoctor.doctorProfile
      : {};
  const selectedDoctorAvailability =
    selectedDoctorProfile.availabilityStatus ?? selectedDoctor?.availabilityStatus ?? false;
  const selectedDoctorTimeSlots =
    selectedDoctorProfile.availableTimeSlots || selectedDoctor?.availableTimeSlots || [];
  const selectedDoctorSpecialization =
    selectedDoctorProfile.specialization || selectedDoctor?.specialization || 'General Practitioner';

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      const doctorsList = Array.isArray(response) ? response : response?.data || [];
      console.log('Fetched doctors in BookAppointment:', doctorsList); // Debug log
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error fetching doctors in BookAppointment:', error);
      toast.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };


  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      ...formData,
      doctorId: doctor._id
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }
    
    console.log('Selected doctor:', selectedDoctor);
    console.log('Selected doctor ID:', selectedDoctor?._id);
    console.log('Form data before submission:', formData);
    console.log('Token in localStorage:', localStorage.getItem('token'));
    
    // Validate form data
    if (!formData.doctorId || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setBookingLoading(true);

    try {
      console.log('Sending booking request with data:', formData);
      const response = await appointmentAPI.create(formData);
      console.log('Appointment booking response:', response);
      console.log('Response success:', response?.success);
      console.log('Response data:', response?.data);
      
      if (response?.success) {
        toast.success(response.message || 'Appointment booked successfully!');
        navigate('/dashboard');
      } else {
        toast.error(response?.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error?.message || error?.errors?.[0]?.msg || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>
        <p className="mt-1 text-gray-600">
          Select a doctor and choose your preferred date and time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available Doctors
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  onClick={() => handleDoctorSelect(doctor)}
                  className={`cursor-pointer border rounded-lg p-4 transition-colors ${
                    selectedDoctor?._id === doctor._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <DoctorCard doctor={doctor} onBookAppointment={() => console.log('Book appointment clicked for:', doctor.name)} />
                </div>
              ))
            ) : (
              <p className="text-gray-500">No doctors available at the moment.</p>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Appointment Details
          </h2>
          
          {selectedDoctor && selectedDoctorAvailability ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selected Doctor
                </label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{selectedDoctor.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedDoctorSpecialization}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <select
                  id="time"
                  name="time"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.time}
                  onChange={handleChange}
                >
                  <option value="">Select time slot</option>
                  {selectedDoctorTimeSlots.map((slot, index) => (
                    <option key={index} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows="3"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your symptoms or reason for visit..."
                  value={formData.reason}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {bookingLoading ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} stroke="currentColor" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedDoctor ? 'Doctor Not Available' : 'No Doctor Selected'}
              </h3>
              <p className="text-gray-500 mb-4">
                {selectedDoctor 
                  ? 'This doctor is currently unavailable. Please select another doctor.' 
                  : 'Please select a doctor from the list to book an appointment.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
