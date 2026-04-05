import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import BookAppointment from './pages/BookAppointment';
import QueuePage from './pages/QueuePage';
import DoctorProfile from './pages/DoctorProfile';


function App() {
  const { user, loading, isAuthenticated } = useAuth();

  // Fallback check for debugging
  const localUser = localStorage.getItem('user');
  const localToken = localStorage.getItem('token');

  console.log('App render - user:', user);
  console.log('App render - loading:', loading);
  console.log('App render - isAuthenticated:', isAuthenticated);
  console.log('localStorage token:', localToken);
  console.log('localStorage user:', localUser);

  // If no user from context but localStorage has data, try to use it
  if (!user && localToken && localUser) {
    console.log('Found user in localStorage but not in context, parsing...');
    try {
      const parsedUser = JSON.parse(localUser);
      console.log('Parsed user from localStorage:', parsedUser);
      // This should trigger a re-render with user data
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
  }

  if (loading) {
    console.log('Showing loading spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, showing login page');
    return (
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    );
  }

  console.log('User found, showing dashboard');
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route 
              path="/" 
              element={user.role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />} 
            />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/dashboard" element={user.role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
