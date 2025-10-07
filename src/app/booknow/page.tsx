"use client";
import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import Calendar from "../components/Calendar";
import Navbar from "../components/navbar";
import { useAuth } from "../../contexts/AuthContext";
import LoginModal from "../../components/LoginModal";

interface Resource {
  id: string;
  name: string;
  type: string;
  capacity: number;
  code: string;
  description?: string;
}

interface Pricing {
  id: string;
  resourceId: string;
  resourceName: string;
  rateType: string;
  weekdayRate: number;
  weekendRate: number;
  description?: string;
}

interface Address {
  line1?: string;
  line2?: string;
  postcode?: string;
  state?: string;
}

interface HallOwner {
  name: string;
  address: string | Address;
  phone: string;
  email: string;
  businessName: string;
}

interface ResourcesResponse {
  resources: Resource[];
  hallOwner: HallOwner;
}

export default function BookNow() {
  const { user, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    date: "",
    startTime: "",
    endTime: "",
    guests: "",
    resources: [] as string[],
    message: ""
  });

  const [resources, setResources] = useState<Resource[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [hallOwner, setHallOwner] = useState<HallOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Helper function to format address
  const formatAddress = (address: string | Address): string => {
    if (typeof address === 'string') {
      return address;
    }
    
    if (typeof address === 'object' && address !== null) {
      const parts = [];
      if (address.line1) parts.push(address.line1);
      if (address.line2) parts.push(address.line2);
      if (address.state) parts.push(address.state);
      if (address.postcode) parts.push(address.postcode);
      return parts.join(', ');
    }
    
    return 'Address not provided';
  };

  // Populate form with user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone || ""
      }));
    }
  }, [isAuthenticated, user]);

  // Fetch resources and pricing from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const hallOwnerId = 'bLRLXrfr5pRBVcUntxUFlvXewaw1'; // Cranbourne hall owner ID
        
        // Fetch resources and pricing in parallel
        const [resourcesResponse, pricingResponse] = await Promise.all([
          fetch(`/api/resources/public/${hallOwnerId}`),
          fetch(`/api/pricing/public/${hallOwnerId}`)
        ]);
        
        if (!resourcesResponse.ok) {
          throw new Error('Failed to fetch resources');
        }
        
        const resourcesData: ResourcesResponse = await resourcesResponse.json();
        console.log('Fetched resources:', resourcesData);
        setResources(resourcesData.resources);
        setHallOwner(resourcesData.hallOwner);
        
        // Handle pricing data
        if (pricingResponse.ok) {
          const pricingData: Pricing[] = await pricingResponse.json();
          console.log('Fetched pricing:', pricingData);
          setPricing(pricingData);
        } else {
          console.log('No pricing data available');
          setPricing([]);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        // Fallback to hardcoded resources if API fails
        setResources([
          { id: 'main-hall', name: 'Main Hall', type: 'hall', capacity: 150, code: 'R001', description: 'Large main hall perfect for weddings, parties, and community events' },
          { id: 'meeting-room', name: 'Meeting Room', type: 'room', capacity: 20, code: 'R002', description: 'Smaller room ideal for meetings, workshops, and intimate gatherings' },
          { id: 'outdoor-area', name: 'Outdoor Area', type: 'outdoor', capacity: 100, code: 'R003', description: 'Covered outdoor area with BBQ facilities' }
        ]);
        setHallOwner({
          name: 'Cranbourne Public Hall',
          address: 'Cnr Clarendon High Streets, VIC, Australia, Victoria',
          phone: '(61) 400 908 740',
          email: 'cranbournepublichall@gmail.com',
          businessName: 'Cranbourne Public Hall'
        });
        setPricing([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // State for selected dates per resource
  const [selectedDates, setSelectedDates] = useState<Record<string, {day: number, month: number, year: number} | null>>({});

  // Helper function to get pricing for a resource
  const getResourcePricing = (resourceId: string): Pricing | null => {
    return pricing.find(p => p.resourceId === resourceId) || null;
  };

  // Helper function to calculate estimated cost
  const calculateEstimatedCost = (resourceId: string, startTime: string, endTime: string, bookingDate: string): number | null => {
    const resourcePricing = getResourcePricing(resourceId);
    if (!resourcePricing || !startTime || !endTime || !bookingDate) return null;

    // Calculate duration in hours
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // Check if it's weekend (Saturday = 6, Sunday = 0)
    const bookingDateObj = new Date(bookingDate);
    const isWeekend = bookingDateObj.getDay() === 0 || bookingDateObj.getDay() === 6;
    
    const rate = isWeekend ? resourcePricing.weekendRate : resourcePricing.weekdayRate;
    
    if (resourcePricing.rateType === 'hourly') {
      return rate * durationHours;
    } else {
      // For daily rates, assume minimum 4 hours for half day, 8+ hours for full day
      return durationHours >= 8 ? rate : rate * 0.5;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResourceChange = (resourceId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      resources: checked 
        ? [...prev.resources, resourceId]
        : prev.resources.filter(id => id !== resourceId)
    }));
  };

  const handleDateSelect = (dateData: { day: number; month: number; year: number; resourceId?: string }) => {
    if (dateData.resourceId) {
      const resourceId = dateData.resourceId;
      setSelectedDates(prev => ({
        ...prev,
        [resourceId]: { day: dateData.day, month: dateData.month, year: dateData.year }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    // Validate that at least one resource is selected
    if (formData.resources.length === 0) {
      alert("Please select at least one resource for your event.");
      return;
    }

    // Validate that all required fields are filled
    if (!formData.name || !formData.email || !formData.phone || !formData.eventType || !formData.date || !formData.startTime || !formData.endTime) {
      alert("Please fill in all required fields.");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const hallOwnerId = 'bLRLXrfr5pRBVcUntxUFlvXewaw1'; // Cranbourne hall owner ID
      
      // For now, we'll use the first selected resource as the main hall
      // In a more complex system, you might want to handle multiple resources differently
      const selectedHall = formData.resources[0];
      
      // Calculate estimated price on frontend for verification
      const estimatedPrice = calculateEstimatedCost(selectedHall, formData.startTime, formData.endTime, formData.date);
      
      const bookingData = {
        customerId: user?.id, // Firebase UID of the authenticated customer
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        eventType: formData.eventType,
        selectedHall: selectedHall,
        bookingDate: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        additionalDescription: formData.message,
        hallOwnerId: hallOwnerId,
        estimatedPrice: estimatedPrice, // Send frontend calculation for verification
        // Additional customer info for better tracking
        customerAvatar: user?.avatar,
        guestCount: formData.guests,
        bookingSource: 'cranbourne-website'
      };  
      
      console.log("Submitting booking:", bookingData);
      
        const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        const priceMessage = estimatedPrice ? ` Estimated cost: $${estimatedPrice.toFixed(2)}.` : '';
        
        // Note: Notification is automatically created by the backend
        // No need to create it here to avoid duplicates
        
        alert(`Thank you for your booking request!${priceMessage} We'll get back to you soon with confirmation.`);
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          eventType: "",
          date: "",
          startTime: "",
          endTime: "",
          guests: "",
          resources: [],
          message: ""
        });
        setSelectedDates({});
      } else {
        throw new Error(result.message || 'Failed to submit booking');
      }
      
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert(`Error submitting booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white font-sans min-h-screen flex flex-col">
      {/* Use existing navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 pt-24 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-black text-[#181411] mb-4">
              Book Your Event
            </h1>
            <p className="text-lg text-[#897561] max-w-2xl mx-auto mb-4">
              Reserve Cranbourne Public Hall for your special occasion. Fill out the form below and we&apos;ll get back to you within 24 hours.
            </p>
            {!isAuthenticated && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 text-amber-800">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <p className="font-medium">
                    Please login to make a booking. Click the profile icon in the bottom right corner to get started.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Calendar and Info - Show first on mobile */}
            <div className="space-y-6 order-1 lg:order-2">
              {/* Calendars for Selected Resources */}
              {formData.resources.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-[#181411] mb-4 text-center">Check Availability</h3>
                  <div className="space-y-6">
                    {formData.resources.map((resourceId) => {
                      const resource = resources.find(r => r.id === resourceId);
                      if (!resource) return null;
                      
                      return (
                        <div key={resourceId} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                          <div className="flex justify-center">
                            <Calendar 
                              resourceId={resourceId}
                              resourceName={resource.name}
                              hallOwnerId="bLRLXrfr5pRBVcUntxUFlvXewaw1"
                              onDateSelect={handleDateSelect}
                            />
                          </div>
                          {selectedDates[resourceId] && (
                            <div className="mt-3 text-center">
                              <p className="text-sm text-[#897561]">
                                Selected date for {resource.name}: {selectedDates[resourceId]?.day}/{selectedDates[resourceId]?.month + 1}/{selectedDates[resourceId]?.year}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-[#181411] mb-4 text-center">Check Availability</h3>
                    <div className="text-center py-8">
                      <p className="text-[#897561] mb-4">Select resources above to view their availability calendars</p>
                      <div className="flex justify-center">
                        <Calendar hallOwnerId="bLRLXrfr5pRBVcUntxUFlvXewaw1" />
                      </div>
                    </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-[#181411] mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#ec8013] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </div>
                    <span className="text-[#181411]">{hallOwner?.phone || '(61) 400 908 740'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#ec8013] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <span className="text-[#181411]">{hallOwner?.email || 'cranbournepublichall@gmail.com'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#ec8013] rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                    <span className="text-[#181411]">{hallOwner ? formatAddress(hallOwner.address) : 'Cnr Clarendon High Streets, VIC, Australia, Victoria'}</span>
                  </div>
                </div>
              </div>

              {/* Pricing Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-[#181411] mb-4">Pricing</h3>
                {pricing.length > 0 ? (
                  <div className="space-y-4">
                    {pricing.map((price) => {
                      const resource = resources.find(r => r.id === price.resourceId);
                      if (!resource) return null;
                      
                      return (
                        <div key={price.id} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                          <h4 className="font-semibold text-[#181411] mb-2">{resource.name}</h4>
                          <div className="text-sm text-[#181411] space-y-1">
                            <div className="flex justify-between">
                              <span>Weekday ({price.rateType}):</span>
                              <span className="font-medium">${price.weekdayRate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Weekend ({price.rateType}):</span>
                              <span className="font-medium">${price.weekendRate}</span>
                            </div>
                            {price.description && (
                              <p className="text-xs text-[#897561] mt-1">{price.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-sm text-[#897561] mt-3">
                      * Prices may vary based on event type and requirements. Contact us for custom quotes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 text-[#181411]">
                    <p><strong>Half Day (4 hours):</strong> $150</p>
                    <p><strong>Full Day (8 hours):</strong> $250</p>
                    <p><strong>Evening Events:</strong> $200</p>
                    <p className="text-sm text-[#897561] mt-3">
                      * Prices may vary based on event type and requirements. Contact us for custom quotes.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Form - Show second on mobile */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 order-2 lg:order-1">
              <h2 className="text-2xl font-bold text-[#181411] mb-6">Booking Request</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[#181411] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 text-[#181411] bg-white"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#181411] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 text-[#181411] bg-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#181411] mb-2">
                    Phone Number *
                  </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 text-[#181411] bg-white"
                      placeholder="Your phone number"
                    />
                </div>

                {/* Event Details */}
                <div>
                  <label htmlFor="eventType" className="block text-sm font-medium text-[#181411] mb-2">
                    Event Type *
                  </label>
                    <select
                      id="eventType"
                      name="eventType"
                      required
                      value={formData.eventType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 text-[#181411] bg-white"
                    >
                    <option value="">Select event type</option>
                    <option value="wedding">Wedding</option>
                    <option value="birthday">Birthday Party</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="community">Community Event</option>
                    <option value="meeting">Meeting</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Resource Selection */}
                <div>
                  <label className="block text-sm font-medium text-[#181411] mb-3">
                    Select Resources *
                  </label>
                  {loading ? (
                    <div className="text-center py-4">
                      <p className="text-[#897561]">Loading resources...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-4">
                      <p className="text-red-600">{error}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {resources.map((resource) => (
                        <div key={resource.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <input
                            type="checkbox"
                            id={`resource-${resource.id}`}
                            checked={formData.resources.includes(resource.id)}
                            onChange={(e) => handleResourceChange(resource.id, e.target.checked)}
                            className="mt-1 h-4 w-4 text-[#ec8013] focus:ring-[#ec8013] border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <label htmlFor={`resource-${resource.id}`} className="block text-sm font-medium text-[#181411] cursor-pointer">
                              {resource.name}
                            </label>
                            {resource.description && (
                              <p className="text-sm text-[#897561] mt-1">
                                {resource.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-[#897561]">
                              <span>Capacity: {resource.capacity} people</span>
                              <span>Type: {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</span>
                              <span>Code: {resource.code}</span>
                            </div>
                            {getResourcePricing(resource.id) && (
                              <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                <div className="text-sm font-medium text-green-800 mb-1">Pricing:</div>
                                <div className="text-xs text-green-700">
                                  <div>Weekday: ${getResourcePricing(resource.id)?.weekdayRate}/{getResourcePricing(resource.id)?.rateType}</div>
                                  <div>Weekend: ${getResourcePricing(resource.id)?.weekendRate}/{getResourcePricing(resource.id)?.rateType}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-[#181411] mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 text-[#181411] bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="guests" className="block text-sm font-medium text-[#181411] mb-2">
                      Number of Guests *
                    </label>
                    <input
                      type="number"
                      id="guests"
                      name="guests"
                      required
                      min="1"
                      value={formData.guests}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 text-[#181411] bg-white"
                      placeholder="Expected guests"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-[#181411] mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      required
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 text-[#181411] bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-[#181411] mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      required
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 text-[#181411] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#181411] mb-2">
                    Additional Information
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 text-[#181411] bg-white"
                    placeholder="Tell us more about your event, special requirements, or any questions you have..."
                  />
                </div>

                {/* Cost Estimation */}
                {formData.resources.length > 0 && formData.date && formData.startTime && formData.endTime && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-blue-900 mb-3">Estimated Cost</h4>
                    <div className="space-y-2">
                      {formData.resources.map((resourceId) => {
                        const resource = resources.find(r => r.id === resourceId);
                        const estimatedCost = calculateEstimatedCost(resourceId, formData.startTime, formData.endTime, formData.date);
                        const resourcePricing = getResourcePricing(resourceId);
                        
                        if (!resource || !estimatedCost || !resourcePricing) return null;
                        
                        return (
                          <div key={resourceId} className="flex justify-between items-center text-sm">
                            <span className="text-blue-800">{resource.name}:</span>
                            <span className="font-semibold text-blue-900">${estimatedCost.toFixed(2)}</span>
                          </div>
                        );
                      })}
                      {formData.resources.length > 1 && (
                        <div className="border-t border-blue-300 pt-2 mt-2">
                          <div className="flex justify-between items-center font-semibold text-blue-900">
                            <span>Total Estimated Cost:</span>
                            <span>
                              ${formData.resources.reduce((total, resourceId) => {
                                const cost = calculateEstimatedCost(resourceId, formData.startTime, formData.endTime, formData.date);
                                return total + (cost || 0);
                              }, 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      * This is an estimate. Final pricing may vary based on specific requirements and availability.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full font-bold py-4 px-6 rounded-lg transition-colors text-lg ${
                    submitting 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-[#e63946] text-white hover:bg-[#d62839]'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit Booking Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}
