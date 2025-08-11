import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../utils/api';

const SupervisorStressMonitoring = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [stressData, setStressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [psychiatrists, setPsychiatrists] = useState([]);
  const [selectedPsychiatrist, setSelectedPsychiatrist] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [timetable, setTimetable] = useState(null);
  const [bookingData, setBookingData] = useState({
    notes: '',
    selectedSlot: null
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchStressData();
    fetchPsychiatrists();
  }, []);

  const fetchStressData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTeamStressScores();
      setStressData(data);
    } catch (error) {
      showError('Failed to load team stress data');
      console.error('Error fetching stress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPsychiatrists = async () => {
    try {
      const response = await apiService.getAvailablePsychiatrists();
      setPsychiatrists(response);
    } catch (error) {
      console.error('Error fetching psychiatrists:', error);
    }
  };

  const fetchTimetable = async (psychiatristId, date) => {
    try {
      setBookingLoading(true);
      const response = await apiService.getPsychiatristTimetable(psychiatristId, date);
      setTimetable(response);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      showError('Failed to load timetable');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBookSession = (member) => {
    setSelectedMember(member);
    setSelectedDate(new Date().toISOString().slice(0, 10));
    setShowBookingModal(true);
  };

  const handlePsychiatristSelect = (psychiatrist) => {
    setSelectedPsychiatrist(psychiatrist);
    fetchTimetable(psychiatrist.id, selectedDate);
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
  };

  const handleBookingSubmit = async () => {
    try {
      setBookingLoading(true);
      const localDateTime = `${selectedDate}T${bookingData.selectedSlot.start_time}:00`;
      
      const bookingPayload = {
        psychiatrist_id: selectedPsychiatrist.id,
        booking_date: localDateTime,
        notes: bookingData.notes
      };

      await apiService.bookPsychiatristForEmployee(bookingPayload, selectedMember.employee_id);
      showSuccess(`Psychiatrist session booked for ${selectedMember.employee_name} successfully`);

      setShowBookingModal(false);
      setSelectedMember(null);
      setSelectedPsychiatrist(null);
      setTimetable(null);
      setBookingData({ notes: '', selectedSlot: null });
    } catch (error) {
      console.error('Booking error:', error);
      showError(typeof error.message === 'string' ? error.message : 'Failed to book session');
    } finally {
      setBookingLoading(false);
    }
  };

  const getStressLevelColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStressLevelDescription = (level) => {
    switch (level) {
      case 'low':
        return 'Good stress management. Keep up the healthy habits!';
      case 'medium':
        return 'Moderate stress levels. Consider stress management techniques.';
      case 'high':
        return 'High stress levels detected. Consider seeking support or consultation.';
      default:
        return 'Stress level not available.';
    }
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
          <h1 className="text-3xl font-bold text-[#212121] mb-2">Team Stress Monitoring</h1>
          <p className="text-[#4F4F4F]">Monitor your team members' stress levels and well-being</p>
        </div>

        {/* Overview Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <h2 className="text-xl font-semibold text-[#212121] mb-4">Team Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stressData?.total_members || 0}</p>
              <p className="text-sm text-gray-600">Total Team Members</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {stressData?.team_scores?.filter(s => s.level === 'low').length || 0}
              </p>
              <p className="text-sm text-gray-600">Low Stress</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {stressData?.team_scores?.filter(s => s.level === 'medium').length || 0}
              </p>
              <p className="text-sm text-gray-600">Medium Stress</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {stressData?.team_scores?.filter(s => s.level === 'high').length || 0}
              </p>
              <p className="text-sm text-gray-600">High Stress</p>
            </div>
          </div>
        </div>

        {/* Team Members Stress Scores */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold text-[#212121] mb-4">Team Stress Scores</h2>
          
          {!stressData || stressData.team_scores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No stress scores shared by team members yet.</p>
              <p className="text-sm text-gray-400">
                Team members need to complete stress assessments and choose to share with supervisors.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {stressData.team_scores.map((member, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#212121] mb-1">
                        {member.employee_name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Last updated: {new Date(member.updated_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {getStressLevelDescription(member.level)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {member.score}/40
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStressLevelColor(member.level)}`}>
                        {member.level.toUpperCase()} STRESS
                      </span>
                    </div>
                  </div>
                  
                  {/* Stress Level Indicator */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">Stress Level:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            member.level === 'low' ? 'bg-green-500' :
                            member.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${(member.score / 40) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Book Session Button */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleBookSession(member)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      📅 Book Psychiatrist Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">About Stress Monitoring</h3>
          <div className="text-blue-700 space-y-2">
            <p className="text-sm">
              • Only team members who have completed stress assessments and chosen to share with supervisors are shown here.
            </p>
            <p className="text-sm">
              • <strong>Employees:</strong> Must check "Share with supervisor" to appear in this view.
            </p>
            <p className="text-sm">
              • <strong>Supervisors:</strong> Can only share their stress scores with HR, not with other supervisors.
            </p>
            <p className="text-sm">
              • Stress scores are based on the Perceived Stress Scale (PSS) with scores ranging from 0-40.
            </p>
            <p className="text-sm">
              • Low stress: 0-13, Medium stress: 14-26, High stress: 27-40.
            </p>
            <p className="text-sm">
              • Consider reaching out to team members with high stress levels to offer support.
            </p>
            <p className="text-sm">
              • <strong>New:</strong> You can now book psychiatrist sessions for team members who may need support.
            </p>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                Book Psychiatrist Session for {selectedMember?.employee_name}
              </h3>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedMember(null);
                  setSelectedPsychiatrist(null);
                  setTimetable(null);
                  setBookingData({ notes: '', selectedSlot: null });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Psychiatrist Selection */}
              <div>
                <h4 className="text-md font-semibold mb-4">Select Psychiatrist</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {psychiatrists.map((psychiatrist) => (
                    <div
                      key={psychiatrist.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedPsychiatrist?.id === psychiatrist.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handlePsychiatristSelect(psychiatrist)}
                    >
                      <h5 className="font-semibold text-gray-900">{psychiatrist.name}</h5>
                      <p className="text-sm text-gray-600">{psychiatrist.specialization}</p>
                      <p className="text-xs text-gray-500">{psychiatrist.hospital}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timetable */}
              <div>
                <h4 className="text-md font-semibold mb-4">Select Date & Time</h4>
                <div className="mb-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </div>

                {selectedPsychiatrist && timetable ? (
                  <div>
                    {timetable.available ? (
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {timetable.slots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleSlotSelect(slot)}
                            disabled={!slot.available}
                            className={`p-3 rounded-lg text-center transition-all text-sm ${
                              slot.available
                                ? bookingData.selectedSlot === slot
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-50 border border-blue-200 hover:bg-blue-100 cursor-pointer'
                                : 'bg-gray-100 border border-gray-200 cursor-not-allowed'
                            }`}
                          >
                            <div className="font-medium">
                              {slot.start_time} - {slot.end_time}
                            </div>
                            {!slot.available && (
                              <div className="text-xs text-gray-500 mt-1">
                                {slot.status === 'pending' ? 'Pending' : 'Booked'}
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
                    {selectedPsychiatrist ? 'Select a date to view availability' : 'Select a psychiatrist first'}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
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

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedMember(null);
                  setSelectedPsychiatrist(null);
                  setTimetable(null);
                  setBookingData({ notes: '', selectedSlot: null });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBookingSubmit}
                disabled={bookingLoading || !bookingData.selectedSlot}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? 'Booking...' : 'Book Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorStressMonitoring; 