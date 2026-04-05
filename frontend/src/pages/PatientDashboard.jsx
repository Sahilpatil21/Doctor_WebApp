import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../services/api';
import DoctorCard from '../components/DoctorCard';
import AppointmentCard from '../components/AppointmentCard';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await doctorAPI.getAll();
      console.log('Doctors API response:', response);
      setDoctors(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getMyAppointments();
      console.log('Appointments API response:', response);
      setAppointments(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await appointmentAPI.cancel(appointmentId, { cancellationReason: reason });
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      toast.error(error?.message || 'Failed to cancel appointment');
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
    <div className="space-y-6">
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Manage your appointments and find the right doctor for your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available Doctors
          </h2>
          <div className="space-y-4">
            {doctors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No doctors available at the moment.</p>
              </div>
            ) : (
              doctors.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} />
              ))
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            My Appointments
          </h2>
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">You have no appointments scheduled.</p>
              </div>
            ) : (
              appointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment._id} 
                  appointment={appointment} 
                  onCancel={handleCancelAppointment}
                  showActions={['pending', 'confirmed'].includes(appointment.status)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
