"use client";

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useScrollLock } from '../hooks/useScrollLock';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const { login, register, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');

  // Prevent background scrolling when modal is open
  useScrollLock(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isLogin && !formData.name) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      let success = false;
      if (isLogin) {
        success = await login(formData.email, formData.password);
      } else {
        success = await register(formData.name, formData.email, formData.password, formData.phone);
      }

      if (success) {
        onSuccess();
      } else {
        setError(isLogin ? 'Invalid email or password' : 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#181411]">
            {isLogin ? 'Login' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#181411] mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e63946] focus:border-transparent text-[#181411]"
                placeholder="Enter your full name"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#181411] mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec8013] focus:border-transparent text-[#181411]"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#181411] mb-2">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec8013] focus:border-transparent text-[#181411]"
              placeholder="Enter your password"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#181411] mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e63946] focus:border-transparent text-[#181411]"
                placeholder="Enter your phone number"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#e63946] hover:bg-[#d62839]'
            }`}
          >
            {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        {/* Toggle between login and register */}
        <div className="px-6 pb-6">
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  phone: ''
                });
              }}
              className="text-[#e63946] hover:text-[#d62839] font-medium transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Create one" 
                : "Already have an account? Login"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
