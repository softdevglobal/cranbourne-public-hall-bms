"use client";

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useScrollLock } from '../hooks/useScrollLock';

interface ProfileModalProps {
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileModal({ onClose, onLogout }: ProfileModalProps) {
  const { user, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Prevent background scrolling when modal is open
  useScrollLock(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!editData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      const success = await updateProfile({
        name: editData.name,
        phone: editData.phone
      });

      if (success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update profile');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#181411]">My Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Avatar and Basic Info */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-[#e63946] flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              )}
            </div>
            <h3 className="text-xl font-semibold text-[#181411]">{user.name}</h3>
            <p className="text-[#897561]">{user.email}</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Profile Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#181411] mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e63946] focus:border-transparent text-[#181411]"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-lg text-[#181411]">{user.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#181411] mb-2">
                Email Address
              </label>
              <p className="px-4 py-3 bg-gray-50 rounded-lg text-[#181411]">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#181411] mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={editData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e63946] focus:border-transparent text-[#181411]"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-lg text-[#181411]">
                  {user.phone || 'Not provided'}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 pt-4">
            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#e63946] hover:bg-[#d62839]'
                  }`}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 px-6 rounded-lg font-semibold text-[#181411] border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-3 px-6 rounded-lg font-semibold text-[#181411] border border-[#e63946] text-[#e63946] hover:bg-[#e63946] hover:text-white transition-colors"
              >
                Edit Profile
              </button>
            )}

            <button
              onClick={onLogout}
              className="w-full py-3 px-6 rounded-lg font-semibold text-red-600 border border-red-300 hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
