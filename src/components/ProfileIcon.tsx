"use client";

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import ProfileModal from './ProfileModal';
import NotificationPanel from './NotificationPanel';

export default function ProfileIcon() {
  const { user, logout, isLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleProfileClick = () => {
    // Only called when user is authenticated
    setShowProfileModal(true);
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  // Don't render anything while loading to avoid flash
  if (isLoading) {
    return null;
  }

  // Only show profile icon for logged-in users
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Profile Icon and Notification Button - Fixed bottom right - Only for logged-in users */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* Notification Button */}
        <button
          onClick={handleNotificationClick}
          className="w-12 h-12 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-gray-300 border border-gray-200"
          title="View Notifications"
        >
          <div className="relative">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#e63946] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </button>

        {/* Profile Icon */}
        <button
          onClick={handleProfileClick}
          className="w-14 h-14 bg-[#e63946] hover:bg-[#d62839] rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#e63946]/30"
          title="View Profile"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full border-2 border-white"
            />
          ) : (
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          onLogout={() => {
            logout();
            setShowProfileModal(false);
          }}
        />
      )}

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
