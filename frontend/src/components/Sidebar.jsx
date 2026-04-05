import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  History,
  Stethoscope,
  User,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const doctorMenuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: "Today's Appointments",
      path: '/dashboard',
      icon: Calendar,
    },
    {
      name: 'Patient History',
      path: '/dashboard',
      icon: History,
    },
    {
      name: 'Queue Status',
      path: '/queue',
      icon: Clock,
    },
  ];

  const patientMenuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Book Appointment',
      path: '/book-appointment',
      icon: Calendar,
    },
    {
      name: 'Find Doctors',
      path: '/book-appointment',
      icon: Stethoscope,
    },
    {
      name: 'My Appointments',
      path: '/dashboard',
      icon: Clock,
    },
    {
      name: 'Queue Status',
      path: '/queue',
      icon: Users,
    },
  ];

  const menuItems = user?.role === 'doctor' ? doctorMenuItems : patientMenuItems;

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-16 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white p-2.5 rounded-xl shadow-doctor border border-gray-100"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-primary-600" />
          ) : (
            <Menu className="h-5 w-5 text-primary-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-white to-primary-50 border-r border-primary-100 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register' ? 'top-16' : 'top-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* User info */}
          <div className="p-6 border-b border-primary-100 bg-gradient-to-r from-primary-500 to-medical-500">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                {user?.role === 'doctor' ? (
                  <Stethoscope className="h-6 w-6 text-white" />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <p className="font-medium text-white capitalize">
                  {user?.role}
                </p>
                <p className="text-sm text-primary-100">
                  {user?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-gradient-to-r from-primary-500 to-medical-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-primary-100 bg-primary-50">
            <div className="text-xs text-center">
              <p className="font-medium text-primary-700">Smart Clinic System</p>
              <p className="text-primary-500">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
