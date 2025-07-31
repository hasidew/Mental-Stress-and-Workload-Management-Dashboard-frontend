import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const Psychiatrists = () => {
  const { getUserRole } = useAuth();
  const { showError, showSuccess } = useToast();
  const [psychiatrists, setPsychiatrists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPsychiatrist, setSelectedPsychiatrist] = useState(null);
  const [bookingData, setBookingData] = useState({
    psychiatrist_id: '',
    booking_date: '',
    booking_time: '',
    duration_minutes: 60,
    notes: ''
  });
  const [myBookings, setMyBookings] = useState([]);
  const [showMyBookings, setShowMyBookings] = useState(false);

  useEffect(() => {
    fetchPsychiatrists();
  }, []);

  const fetchPsychiatrists = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAvailablePsychiatrists();
      setPsychiatrists(data);
    } catch (error) {
      showError('Failed to load psychiatrists');
      console.error('Error fetching psychiatrists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create the local datetime string and send it directly
      const localDateTime = `${bookingData.booking_date}T${bookingData.booking_time}:00`;
      
      const bookingPayload = {
        psychiatrist_id: parseInt(bookingData.psychiatrist_id),
        booking_date: localDateTime,
        duration_minutes: bookingData.duration_minutes,
        notes: bookingData.notes
      };

      await apiService.bookPsychiatrist(bookingPayload);
      showSuccess('Booking created successfully!');
      setShowBookingModal(false);
      setBookingData({
        psychiatrist_id: '',
        booking_date: '',
        booking_time: '',
        duration_minutes: 60,
        notes: ''
      });
      fetchMyBookings();
    } catch (error) {
      showError(error.message || 'Failed to create booking');
    }
  };

  const fetchMyBookings = async () => {
    try {
      const data = await apiService.getMyPsychiatristBookings();
      setMyBookings(data);
    } catch (error) {
      showError('Failed to load bookings');
      console.error('Error fetching bookings:', error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await apiService.cancelPsychiatristBooking(bookingId);
      showSuccess('Booking cancelled successfully!');
      fetchMyBookings();
    } catch (error) {
      showError(error.message || 'Failed to cancel booking');
    }
  };

  const openBookingModal = (psychiatrist) => {
    setSelectedPsychiatrist(psychiatrist);
    setShowBookingModal(true);
    setBookingData({
      ...bookingData,
      psychiatrist_id: psychiatrist.id.toString(),
    });
  };

  const getAvailabilityText = (availabilities) => {
    if (!availabilities || availabilities.length === 0) {
      return 'No availability set';
    }
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return availabilities.map(avail => {
      const day = days[avail.day_of_week] || `Day ${avail.day_of_week}`;
      return `${day}: ${avail.start_time} - ${avail.end_time}`;
    }).join(', ');
  };

  const formatBookingDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-[#EDF4FA] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#EDF4FA] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#212121]">Psychiatrists</h1>
          <p className="text-[#4F4F4F] mt-2">Connect with mental health professionals for expert support</p>
        </div>

        {/* Available Psychiatrists */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#212121]">Available Psychiatrists</h2>
            <button
              onClick={() => setShowMyBookings(!showMyBookings)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showMyBookings ? 'Hide My Bookings' : 'View My Bookings'}
            </button>
          </div>

          {psychiatrists.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No psychiatrists available</h3>
              <p className="text-gray-500">Check back later for available psychiatrists</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {psychiatrists.map((psychiatrist) => (
                <div key={psychiatrist.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#212121]">{psychiatrist.name}</h3>
                      <p className="text-sm text-gray-600">{psychiatrist.specialization}</p>
                      <p className="text-sm text-gray-500">{psychiatrist.hospital}</p>
                    </div>
                    <button
                      onClick={() => openBookingModal(psychiatrist)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Book Session
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Qualifications:</strong> {psychiatrist.qualifications}</p>
                    <p><strong>Registration:</strong> {psychiatrist.registration_number}</p>
                    <p><strong>Availability:</strong> {getAvailabilityText(psychiatrist.availabilities)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Bookings */}
        {showMyBookings && (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-xl font-semibold text-[#212121] mb-6">My Bookings</h2>
            
            {myBookings.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings found</h3>
                <p className="text-gray-500">Book a session with a psychiatrist to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-[#212121]">{booking.psychiatrist_name}</h3>
                        <p className="text-sm text-gray-600">{formatBookingDate(booking.booking_date)}</p>
                        <p className="text-sm text-gray-500">Duration: {booking.duration_minutes} minutes</p>
                        {booking.notes && (
                          <p className="text-sm text-gray-500 mt-2"><strong>Notes:</strong> {booking.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedPsychiatrist && (
          <BookingModal
            psychiatrist={selectedPsychiatrist}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedPsychiatrist(null);
              setBookingData({
                psychiatrist_id: '',
                booking_date: '',
                booking_time: '',
                duration_minutes: 60,
                notes: ''
              });
            }}
            onSubmit={handleBookingSubmit}
            bookingData={bookingData}
            setBookingData={setBookingData}
          />
        )}
      </div>
    </div>
  );
};

// Booking Modal Component
const BookingModal = ({ psychiatrist, onClose, onSubmit, bookingData, setBookingData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData({
      ...bookingData,
      [name]: value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#212121] mb-2">{psychiatrist.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-600">{psychiatrist.specialization}</p>
        
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="booking_date"
              value={bookingData.booking_date}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              name="booking_time"
              value={bookingData.booking_time}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <select
              name="duration_minutes"
              value={bookingData.duration_minutes}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              name="notes"
              value={bookingData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any specific concerns or topics you'd like to discuss..."
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book Session
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Psychiatrists; 