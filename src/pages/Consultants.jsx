import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../utils/api';

const Consultants = () => {
  const { user, getUserRole } = useAuth();
  const { showSuccess, showError } = useToast();
  const [consultants, setConsultants] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingData, setBookingData] = useState({
    consultant_id: '',
    booking_date: '',
    booking_time: '',
    duration_minutes: 60,
    notes: ''
  });

  useEffect(() => {
    fetchConsultants();
    fetchMyBookings();
  }, []);

  const fetchConsultants = async () => {
    try {
      const data = await apiService.getAvailableConsultants();
      setConsultants(data);
    } catch (error) {
      showError('Failed to load consultants');
      console.error('Error fetching consultants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const data = await apiService.getMyBookings();
      setMyBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBookConsultation = async (e) => {
    e.preventDefault();
    try {
      const bookingDateTime = new Date(`${bookingData.booking_date}T${bookingData.booking_time}`);
      
      const bookingPayload = {
        consultant_id: parseInt(bookingData.consultant_id),
        booking_date: bookingDateTime.toISOString(),
        duration_minutes: parseInt(bookingData.duration_minutes),
        notes: bookingData.notes || null
      };

      await apiService.bookConsultation(bookingPayload);
      showSuccess('Consultation booked successfully!');
      setShowBookingModal(false);
      setBookingData({
        consultant_id: '',
        booking_date: '',
        booking_time: '',
        duration_minutes: 60,
        notes: ''
      });
      fetchMyBookings();
    } catch (error) {
      showError(error.message || 'Failed to book consultation');
    }
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    try {
      const bookingDateTime = new Date(`${bookingData.booking_date}T${bookingData.booking_time}`);
      
      const updatePayload = {
        consultant_id: parseInt(bookingData.consultant_id),
        booking_date: bookingDateTime.toISOString(),
        duration_minutes: parseInt(bookingData.duration_minutes),
        notes: bookingData.notes || null
      };

      await apiService.updateBooking(editingBooking.id, updatePayload);
      showSuccess('Booking updated successfully!');
      setShowEditModal(false);
      setEditingBooking(null);
      setBookingData({
        consultant_id: '',
        booking_date: '',
        booking_time: '',
        duration_minutes: 60,
        notes: ''
      });
      fetchMyBookings();
    } catch (error) {
      showError(error.message || 'Failed to update booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await apiService.cancelBooking(bookingId);
        showSuccess('Booking cancelled successfully!');
        fetchMyBookings();
      } catch (error) {
        showError('Failed to cancel booking');
      }
    }
  };

  const openBookingModal = (consultant) => {
    setSelectedConsultant(consultant);
    setBookingData({
      consultant_id: consultant.id.toString(),
      booking_date: '',
      booking_time: '',
      duration_minutes: 60,
      notes: ''
    });
    setShowBookingModal(true);
  };

  const openEditModal = (booking) => {
    setEditingBooking(booking);
    const bookingDate = new Date(booking.booking_date);
    setBookingData({
      consultant_id: booking.consultant_id.toString(),
      booking_date: bookingDate.toISOString().split('T')[0],
      booking_time: bookingDate.toTimeString().split(' ')[0].substring(0, 5),
      duration_minutes: booking.duration_minutes,
      notes: booking.notes || ''
    });
    setShowEditModal(true);
  };

  const getAvailabilityText = (availabilities) => {
    if (!availabilities || availabilities.length === 0) {
      return 'No availability set';
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const availabilityText = availabilities.map(avail => {
      const day = days[avail.day_of_week];
      const start = avail.start_time;
      const end = avail.end_time;
      return `${day} ${start}-${end}`;
    }).join(', ');

    return availabilityText;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-[#212121]">Consultants</h1>
            <Link to="/dashboard" className="text-[#212121] hover:text-blue-600">
              ← Back to Dashboard
            </Link>
          </div>
          <p className="text-[#4F4F4F]">Book sessions with mental health professionals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Consultants */}
          <div className="bg-white rounded-2xl shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#212121]">Available Consultants</h2>
            </div>
            <div className="p-6">
              {consultants.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">👨‍⚕️</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No consultants available</h3>
                  <p className="text-gray-500">Check back later for available consultants</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultants.map((consultant) => (
                    <div key={consultant.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-[#212121]">{consultant.name}</h3>
                          <p className="text-sm text-gray-600">{consultant.specialization}</p>
                          <p className="text-sm text-gray-500">{consultant.hospital}</p>
                        </div>
                        <button
                          onClick={() => openBookingModal(consultant)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Book Session
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Qualifications:</strong> {consultant.qualifications}</p>
                        <p><strong>Registration:</strong> {consultant.registration_number}</p>
                        <p><strong>Availability:</strong> {getAvailabilityText(consultant.availabilities)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Bookings */}
          <div className="bg-white rounded-2xl shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#212121]">My Bookings</h2>
            </div>
            <div className="p-6">
              {myBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings yet</h3>
                  <p className="text-gray-500">Book a session with a consultant to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-[#212121]">{booking.consultant_name}</h3>
                          <p className="text-sm text-gray-600">{formatDateTime(booking.booking_date)}</p>
                          <p className="text-sm text-gray-500">Duration: {booking.duration_minutes} minutes</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          {booking.status === 'scheduled' && (
                            <button
                              onClick={() => openEditModal(booking)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                      {booking.notes && (
                        <p className="text-sm text-gray-600 mb-3">Notes: {booking.notes}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Booked by: {booking.booked_by_name}
                        </span>
                        {booking.status === 'scheduled' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedConsultant && (
          <BookingModal
            consultant={selectedConsultant}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedConsultant(null);
              setBookingData({
                consultant_id: '',
                booking_date: '',
                booking_time: '',
                duration_minutes: 60,
                notes: ''
              });
            }}
            onSubmit={handleBookConsultation}
            bookingData={bookingData}
            setBookingData={setBookingData}
          />
        )}

        {/* Edit Booking Modal */}
        {showEditModal && editingBooking && (
          <EditBookingModal
            booking={editingBooking}
            onClose={() => {
              setShowEditModal(false);
              setEditingBooking(null);
              setBookingData({
                consultant_id: '',
                booking_date: '',
                booking_time: '',
                duration_minutes: 60,
                notes: ''
              });
            }}
            onSubmit={handleUpdateBooking}
            bookingData={bookingData}
            setBookingData={setBookingData}
          />
        )}
      </div>
    </div>
  );
};

// Booking Modal Component
const BookingModal = ({ consultant, onClose, onSubmit, bookingData, setBookingData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#212121]">Book Consultation</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">×</button>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#212121] mb-2">{consultant.name}</h3>
          <p className="text-sm text-gray-600">{consultant.specialization}</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[#212121] font-medium mb-2">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="booking_date"
              value={bookingData.booking_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Time <span className="text-red-500">*</span></label>
            <input
              type="time"
              name="booking_time"
              value={bookingData.booking_time}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Duration (minutes)</label>
            <select
              name="duration_minutes"
              value={bookingData.duration_minutes}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Notes</label>
            <textarea
              name="notes"
              value={bookingData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any specific concerns or topics you'd like to discuss..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
            >
              Book Session
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Booking Modal Component
const EditBookingModal = ({ booking, onClose, onSubmit, bookingData, setBookingData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#212121]">Edit Booking</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">×</button>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#212121] mb-2">{booking.consultant_name}</h3>
          <p className="text-sm text-gray-600">Current: {formatDateTime(booking.booking_date)}</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[#212121] font-medium mb-2">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="booking_date"
              value={bookingData.booking_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Time <span className="text-red-500">*</span></label>
            <input
              type="time"
              name="booking_time"
              value={bookingData.booking_time}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Duration (minutes)</label>
            <select
              name="duration_minutes"
              value={bookingData.duration_minutes}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Notes</label>
            <textarea
              name="notes"
              value={bookingData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any specific concerns or topics you'd like to discuss..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
            >
              Update Booking
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Consultants; 