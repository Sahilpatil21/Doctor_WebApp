import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doctorAPI } from '../services/api';

import { User, Edit, Save, Calendar, Clock, DollarSign, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
  const { user, loadUser } = useAuth();
  const doctorId = user?._id || user?.id;
  const [profile, setProfile] = useState({
    specialization: '',
    experience: 0,
    qualification: '',
    about: '',
    consultationFee: 0,
    clinicAddress: '',
    availabilityStatus: true,
    availableTimeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM']
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (doctorId) {
      fetchProfile();
    }
  }, [doctorId]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for user:', doctorId, user);
      if (!doctorId) {
        console.error('No user ID available');
        setLoading(false);
        return;
      }
      const response = await doctorAPI.getById(doctorId);
      console.log('Raw profile response:', response);
      if (response) {
        setProfile({
          specialization: response.doctorProfile?.specialization || response.specialization || '',
          experience: response.doctorProfile?.experience || response.experience || 0,
          qualification: response.doctorProfile?.qualification || response.qualification || '',
          about: response.doctorProfile?.about || response.about || '',
          consultationFee: response.doctorProfile?.consultationFee || response.consultationFee || 0,
          clinicAddress: response.doctorProfile?.clinicAddress || response.clinicAddress || '',
          availabilityStatus: response.doctorProfile?.availabilityStatus !== undefined ? response.doctorProfile.availabilityStatus : response.availabilityStatus !== undefined ? response.availabilityStatus : true,
          availableTimeSlots: response.doctorProfile?.availableTimeSlots || response.availableTimeSlots || []
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'availableTimeSlots') {
      setProfile(prev => ({
        ...prev,
        [name]: value.split(',').map(slot => slot.trim())
      }));
    } else if (type === 'checkbox') {
      setProfile(prev => ({ ...prev, [name]: checked }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!profile.specialization.trim() || profile.experience < 0 || !profile.qualification.trim()) {
      toast.error('Please fill specialization, experience, and qualification');
      return;
    }

    setSaving(true);
    try {
      console.log('Saving profile:', profile);
      await doctorAPI.updateProfile(profile);
      await loadUser();
      toast.success('Profile updated successfully!');
      await fetchProfile();
      setEditing(false);
    } catch (error) {
      console.error('Save profile error:', error.response || error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'doctor') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-medium text-gray-900">Doctor access required</p>
          <p className="text-sm text-gray-500 mt-2">Please log in as a doctor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-primary-600">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 rounded-2xl text-white">
            <User className="h-12 w-12" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Update your professional information and availability</p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all font-medium flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-300 transition-all font-medium"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 transition-all font-medium flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Info */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <User className="h-6 w-6 text-primary-600" />
              <span>Professional Information</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization *
                </label>
                <input
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  placeholder="Cardiologist, General Practitioner, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={profile.experience}
                  onChange={handleInputChange}
                  disabled={!editing}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification *
                </label>
                <input
                  name="qualification"
                  value={profile.qualification}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  placeholder="MD, MBBS, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About (Optional)
                </label>
                <textarea
                  name="about"
                  value={profile.about}
                  onChange={handleInputChange}
                  disabled={!editing}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all resize-vertical"
                  placeholder="Tell patients about your expertise..."
                />
              </div>
            </div>
          </div>

          {/* Availability & Fees */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-primary-600" />
              <span>Availability & Fees</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-3 mb-2">
                  <input
                    type="checkbox"
                    name="availabilityStatus"
                    checked={profile.availabilityStatus}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Available for appointments</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="consultationFee"
                    value={profile.consultationFee}
                    onChange={handleInputChange}
                    disabled={!editing}
                    min="0"
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic Address
                </label>
                <input
                  name="clinicAddress"
                  value={profile.clinicAddress}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  placeholder="123 Medical Center, Main Street, City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots (comma separated)
                </label>
                <input
                  name="availableTimeSlots"
                  value={profile.availableTimeSlots.join(', ')}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  placeholder="09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM"
                />
                <p className="text-xs text-gray-500 mt-1">e.g., 09:00 AM, 10:00 AM, 11:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {!editing && (
        <div className="bg-gradient-to-r from-primary-50 to-medical-50 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span>Patient Preview</span>
          </h3>
          <div className="text-sm text-gray-600 space-y-2 max-w-md">
            <p><strong>Dr. {user?.name}</strong> - {profile.specialization || 'Specialization not set'}</p>
            <p>{profile.experience || 0} years experience • ${profile.consultationFee || 0}</p>
            <p>{profile.clinicAddress || 'Address not set'}</p>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              profile.availabilityStatus
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {profile.availabilityStatus ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;

