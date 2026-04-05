import React from 'react';
import { Stethoscope, MapPin, DollarSign, Clock, User } from 'lucide-react';

const DoctorCard = ({ doctor, onBookAppointment }) => {
  // Handle both API response structure (doctorProfile) and legacy structure (direct fields)
  const profile = doctor.doctorProfile || {};
  const name = doctor.name || doctor.user?.name;
  const specialization = profile.specialization || doctor.specialization;
  const experience = profile.experience || doctor.experience;
  const consultationFee = profile.consultationFee || doctor.consultationFee;
  const availabilityStatus = profile.availabilityStatus ?? doctor.availabilityStatus;
  const clinicAddress = profile.clinicAddress || doctor.clinicAddress;
  const availableTimeSlots = profile.availableTimeSlots || doctor.availableTimeSlots;

  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Doctor Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="bg-primary-100 p-3 rounded-full">
          <Stethoscope className="h-8 w-8 text-primary-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            Dr. {name}
          </h3>
          <p className="text-sm text-gray-600">{specialization || 'General Practitioner'}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{experience || 0} years</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>${consultationFee || 0}</span>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          availabilityStatus
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {availabilityStatus ? 'Available' : 'Unavailable'}
        </div>
      </div>

      {/* Clinic Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-start space-x-2">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
          <p className="text-sm text-gray-600">{clinicAddress || 'Address not available'}</p>
        </div>
      </div>

      {/* Available Time Slots */}
      {availableTimeSlots && availableTimeSlots.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Available Time Slots:</p>
          <div className="flex flex-wrap gap-2">
            {availableTimeSlots.slice(0, 6).map((slot, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                {slot}
              </span>
            ))}
            {availableTimeSlots.length > 6 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                +{availableTimeSlots.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      {onBookAppointment && (
        <button
          onClick={() => onBookAppointment(doctor)}
          disabled={!availabilityStatus}
          className={`w-full btn ${
            availabilityStatus
              ? 'btn-primary'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {availabilityStatus ? 'Book Appointment' : 'Currently Unavailable'}
        </button>
      )}
    </div>
  );
};

export default DoctorCard;
