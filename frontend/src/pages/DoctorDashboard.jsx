import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { appointmentAPI, doctorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AppointmentCard from '../components/AppointmentCard';
import { Calendar, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const OPEN_STATUSES = ['pending', 'confirmed'];

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    fetchTodayAppointments();
    fetchAllAppointments();
  }, []);

  const fetchTodayAppointments = async () => {
    try {
      console.log('Fetching today appointments...');
      const response = await doctorAPI.getTodayAppointments();
      console.log('Today appointments response:', response);
      setTodayAppointments(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.error('Error fetching today appointments:', error);
      toast.error('Failed to fetch today\'s appointments');
    }
  };

  const fetchAllAppointments = async () => {
    try {
      console.log('Fetching all appointments...');
      const response = await appointmentAPI.getAll();
      console.log('All appointments response:', response);
      setAllAppointments(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.error('Error fetching all appointments:', error);
      toast.error('Failed to fetch all appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, { status: newStatus });
      toast.success(`Appointment marked as ${newStatus}`);
      fetchTodayAppointments();
      fetchAllAppointments();
    } catch (error) {
      toast.error(error.message || 'Failed to update appointment status');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await appointmentAPI.cancel(appointmentId, { cancellationReason: reason });
      toast.success('Appointment cancelled successfully');
      fetchTodayAppointments();
      fetchAllAppointments();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel appointment');
    }
  };

  const todayStats = {
    total: todayAppointments.length,
    pending: todayAppointments.filter(apt => apt.status === 'pending').length,
    confirmed: todayAppointments.filter(apt => apt.status === 'confirmed').length,
    completed: todayAppointments.filter(apt => apt.status === 'completed').length,
  };

  const upcomingAppointments = allAppointments.filter(apt => 
    OPEN_STATUSES.includes(apt.status) && 
    new Date(apt.date) >= new Date()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-medical-50 p-6">
      {/* Header */}
      <div className="mb-8 bg-white rounded-2xl shadow-doctor p-8 border-l-4 border-primary-600">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-700 to-medical-600 bg-clip-text text-transparent mb-2">
              Welcome back, Dr. {user?.name}!
            </h1>
            <p className="text-gray-600 text-lg">Manage your appointments and patient queue</p>
          </div>
          <div className="bg-primary-100 p-4 rounded-xl">
            <Calendar className="h-8 w-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 rounded-2xl shadow-doctor text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm font-medium">Today's Total</p>
              <p className="text-3xl font-bold mt-1">{todayStats.total}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6 rounded-2xl shadow-doctor text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold mt-1">{todayStats.pending}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-medical-500 to-primary-600 p-6 rounded-2xl shadow-doctor text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-medical-100 text-sm font-medium">Confirmed</p>
              <p className="text-3xl font-bold mt-1">{todayStats.confirmed}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-doctor text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold mt-1">{todayStats.completed}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-doctor mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-medical-600 p-1">
          <nav className="flex bg-white rounded-t-xl">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 py-4 px-6 font-medium text-sm transition-all duration-200 ${
                activeTab === 'today'
                  ? 'bg-gradient-to-r from-primary-600 to-medical-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              Today's Appointments ({todayStats.total})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-4 px-6 font-medium text-sm transition-all duration-200 ${
                activeTab === 'upcoming'
                  ? 'bg-gradient-to-r from-primary-600 to-medical-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              Upcoming ({upcomingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 px-6 font-medium text-sm transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-primary-600 to-medical-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              All Appointments ({allAppointments.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-2xl shadow-doctor p-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'today' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Today's Appointments
                  </h2>
                  <span className="text-sm text-gray-500 bg-primary-50 px-3 py-1 rounded-full">
                    {format(new Date(), 'MMMM dd, yyyy')}
                  </span>
                </div>
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-primary-50 to-medical-50 rounded-xl">
                    <Calendar className="h-16 w-16 text-primary-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-primary-900 mb-2">No appointments today</h3>
                    <p className="text-primary-600">You have no appointments scheduled for today.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {todayAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment._id}
                        appointment={appointment}
                        onUpdateStatus={handleUpdateStatus}
                        onCancel={handleCancelAppointment}
                        showActions={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'upcoming' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Appointments</h2>
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-primary-50 to-medical-50 rounded-xl">
                    <Calendar className="h-16 w-16 text-primary-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-primary-900 mb-2">No upcoming appointments</h3>
                    <p className="text-primary-600">You have no upcoming appointments.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {upcomingAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment._id}
                        appointment={appointment}
                        onUpdateStatus={handleUpdateStatus}
                        onCancel={handleCancelAppointment}
                        showActions={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'all' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">All Appointments</h2>
                {allAppointments.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-primary-50 to-medical-50 rounded-xl">
                    <Calendar className="h-16 w-16 text-primary-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-primary-900 mb-2">No appointments found</h3>
                    <p className="text-primary-600">You haven't had any appointments yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {allAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment._id}
                        appointment={appointment}
                        onUpdateStatus={handleUpdateStatus}
                        onCancel={handleCancelAppointment}
                        showActions={OPEN_STATUSES.includes(appointment.status)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
