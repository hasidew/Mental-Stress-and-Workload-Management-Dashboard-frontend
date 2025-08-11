import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

const Psychiatrists = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [psychiatrists, setPsychiatrists] = useState([]);
  const [selectedPsychiatrist, setSelectedPsychiatrist] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    notes: '',
    selectedSlot: null
  });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [bookingForEmployee, setBookingForEmployee] = useState(false);

  useEffect(() => {
    fetchPsychiatrists();
    fetchMyBookings();
    // Fetch employees if user is HR manager
    if (user?.role === 'hr_manager') {
      fetchEmployees();
    }
  }, [user]);

  const fetchPsychiatrists = async () => {
    try {
      setLoading(true);
      const response = await api.getAvailablePsychiatrists();
      setPsychiatrists(response);
    } catch (error) {
      console.error('Error fetching psychiatrists:', error);
      showError('Failed to load psychiatrists');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.getHrDashboard();
      const allEmployees = [...(response.employees || []), ...(response.supervisors || [])];
      setEmployees(allEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const response = await api.getMyPsychiatristBookings();
      setMyBookings(response);
    } catch (error) {
      console.error('Error fetching my bookings:', error);
    }
  };

  const fetchTimetable = async (psychiatristId, date) => {
    try {
      setLoading(true);
      const response = await api.getPsychiatristTimetable(psychiatristId, date);
      console.log('Timetable response:', response);
      console.log('Number of slots:', response?.slots?.length || 0);
      console.log('Available slots:', response?.slots?.filter(slot => slot.available).length || 0);
      console.log('Booked slots:', response?.slots?.filter(slot => !slot.available).length || 0);
      setTimetable(response);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      showError('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handlePsychiatristSelect = (psychiatrist) => {
    setSelectedPsychiatrist(psychiatrist);
    setSelectedDate(new Date().toISOString().slice(0, 10));
    fetchTimetable(psychiatrist.id, new Date().toISOString().slice(0, 10));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (selectedPsychiatrist) {
      fetchTimetable(selectedPsychiatrist.id, date);
    }
  };

  const handleSlotSelect = (slot) => {
    if (!slot.available) {
      showError('This slot is already booked');
      return;
    }
    setBookingData({
      notes: '',
      selectedSlot: slot
    });
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async () => {
    try {
      setLoading(true);
      // Create the local datetime string and send it directly
      const localDateTime = `${selectedDate}T${bookingData.selectedSlot.start_time}:00`;
      
      const bookingPayload = {
        psychiatrist_id: selectedPsychiatrist.id,
        booking_date: localDateTime,
        notes: bookingData.notes
      };

      if (selectedEmployee && bookingForEmployee) {
        await api.bookPsychiatristForEmployee(bookingPayload, selectedEmployee.id);
        showSuccess(`Psychiatrist session booked for ${selectedEmployee.name} successfully`);
      } else {
        await api.bookPsychiatrist(bookingPayload);
        showSuccess('Psychiatrist session booked for yourself successfully');
      }

      setShowBookingModal(false);
      setBookingData({ notes: '', selectedSlot: null });
      setSelectedEmployee(null);
      setBookingForEmployee(false);
      
      // Refresh data
      fetchMyBookings();
      fetchTimetable(selectedPsychiatrist.id, selectedDate);
    } catch (error) {
      console.error('Booking error:', error);
      showError(typeof error.message === 'string' ? error.message : 'Failed to book session');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await api.cancelPsychiatristBooking(bookingId);
      showSuccess('Booking cancelled successfully');
      fetchMyBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showError('Failed to cancel booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5); // Remove seconds
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Psychiatrist Session</h1>
          <p className="text-gray-600">
            {user?.role === 'hr_manager' 
              ? 'Select a psychiatrist and book a 30-minute session for yourself or an employee'
              : 'Select a psychiatrist and book a 30-minute session'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Psychiatrist List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Available Psychiatrists</h2>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {psychiatrists.map((psychiatrist) => (
                    <div
                      key={psychiatrist.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedPsychiatrist?.id === psychiatrist.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handlePsychiatristSelect(psychiatrist)}
                    >
                      <h3 className="font-semibold text-gray-900">{psychiatrist.name}</h3>
                      <p className="text-sm text-gray-600">{psychiatrist.specialization}</p>
                      <p className="text-xs text-gray-500">{psychiatrist.hospital}</p>
                      <div className="mt-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {psychiatrist.bookings?.length || 0} upcoming sessions
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Timetable */}
          <div className="lg:col-span-2">
            {selectedPsychiatrist ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedPsychiatrist.name}</h2>
                    <p className="text-gray-600">{selectedPsychiatrist.specialization}</p>
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </div>

                {loading ? (
                  <div className="text-center py-8">Loading timetable...</div>
                ) : timetable ? (
                  <div>
                    {timetable.available ? (
                      <div className="grid grid-cols-4 gap-2">
                        {timetable.slots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleSlotSelect(slot)}
                            disabled={!slot.available}
                            className={`p-3 rounded-lg text-center transition-all ${
                              slot.available
                                ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100 cursor-pointer'
                                : 'bg-gray-100 border border-gray-200 cursor-not-allowed'
                            }`}
                          >
                            <div className="font-medium">
                              {slot.start_time} - {slot.end_time}
                            </div>
                            {!slot.available && (
                              <div className="text-xs text-gray-500 mt-1">
                                {slot.status === 'pending' ? 'Pending' : 'Booked'}
                                {slot.employee_name && ` by ${slot.employee_name}`}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No availability for this date
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Select a date to view availability
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8 text-gray-500">
                  Select a psychiatrist to view their schedule
                </div>
              </div>
            )}
          </div>
        </div>

        {/* My Bookings */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
            {myBookings.length === 0 ? (
              <p className="text-gray-500">No bookings found</p>
            ) : (
              <div className="space-y-4">
                {myBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{booking.psychiatrist_name}</h3>
                        <p className="text-sm text-gray-600">{formatDate(booking.booking_date)}</p>
                        <p className="text-sm text-gray-500">{booking.duration_minutes} minutes</p>
                        {booking.notes && (
                          <p className="text-sm text-gray-600 mt-1">Notes: {booking.notes}</p>
                        )}
                        {booking.rejection_reason && (
                          <p className="text-sm text-red-600 mt-1">
                            Rejection reason: {booking.rejection_reason}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {selectedEmployee ? `Book Session for ${selectedEmployee.name}` : 'Book Session'}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Psychiatrist:</strong> {selectedPsychiatrist?.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Time:</strong> {bookingData.selectedSlot?.start_time} - {bookingData.selectedSlot?.end_time}
              </p>
            </div>

            {/* Employee Selection for HR Managers */}
            {user?.role === 'hr_manager' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book for Employee (Optional)
                </label>
                <select
                  value={selectedEmployee?.id || ''}
                  onChange={(e) => {
                    const employeeId = e.target.value;
                    if (employeeId) {
                      const employee = employees.find(emp => emp.id === parseInt(employeeId));
                      setSelectedEmployee(employee);
                      setBookingForEmployee(true);
                    } else {
                      setSelectedEmployee(null);
                      setBookingForEmployee(false);
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Book for myself</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.department || 'No Department'})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedEmployee 
                    ? `Booking session for ${selectedEmployee.name} (${selectedEmployee.department || 'No Department'})`
                    : 'Select who to book the session for (leave empty to book for yourself). Psychiatrists are excluded from this list.'
                  }
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={bookingData.notes}
                onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Any specific concerns or topics to discuss..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedEmployee(null);
                  setBookingForEmployee(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBookingSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Booking...' : 'Book Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Psychiatrists; 