import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AppointmentCard = ({ appointment, onUpdateStatus, onCancel, showActions = false }) => {
  const {
    patient,
    doctor,
    date,
    time,
    queuePosition,
    status,
    cancellationReason
  } = appointment;

  // Capitalize first letter of status
  const displayStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  const displayTime = time || 'Not specified';

  const getStatusIcon = () => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-primary-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-doctor border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Header with gradient accent */}
      <div className="bg-gradient-to-r from-primary-500 to-medical-500 h-1"></div>
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
              {displayStatus}
            </span>
          </div>
          {queuePosition && (
            <div className="bg-gradient-to-r from-primary-500 to-medical-500 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-white">
                Queue #{queuePosition}
              </span>
            </div>
          )}
        </div>

      {/* Appointment Details */}
        <div className="space-y-3">
          {/* Date and Time */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4 text-primary-500" />
              <span>{format(new Date(date), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-primary-500" />
              <span>{displayTime}</span>
            </div>
          </div>

          {/* Person Info (Patient or Doctor based on context) */}
          {patient && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Patient Details:</p>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4 text-primary-500" />
                  <span>{patient.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-primary-500" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-primary-500" />
                  <span>{patient.email}</span>
                </div>
              </div>
            </div>
          )}

          {doctor && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Doctor Details:</p>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4 text-primary-500" />
                  <span>Dr. {doctor.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-primary-500" />
                  <span>{doctor.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Reason */}
          {cancellationReason && (
            <div className="border-t border-red-100 pt-3">
              <p className="text-sm font-medium text-red-700 mb-1">Cancellation Reason:</p>
              <p className="text-sm text-red-600">{cancellationReason}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && status !== 'completed' && status !== 'cancelled' && (
          <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
            {status === 'pending' && onUpdateStatus && (
              <button
                onClick={() => onUpdateStatus(appointment._id, 'confirmed')}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2 px-4 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 text-sm font-medium"
              >
                Confirm
              </button>
            )}
            {status === 'confirmed' && onUpdateStatus && (
              <button
                onClick={() => onUpdateStatus(appointment._id, 'completed')}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium"
              >
                Mark Complete
              </button>
            )}
            {(status === 'pending' || status === 'confirmed') && onCancel && (
              <button
                onClick={() => onCancel(appointment._id)}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AppointmentCard;
