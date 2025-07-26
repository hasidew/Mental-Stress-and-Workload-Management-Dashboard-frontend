import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { validateForm, validationRules } from '../utils/validation';

const HrDashboard = () => {
  const { getUserRole } = useAuth();
  const { showError, showSuccess } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    psychiatrist_id: '',
    booking_date: '',
    booking_time: '',
    duration_minutes: 30,
    notes: ''
  });
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  
  // Psychiatrist management state
  const [psychiatrists, setPsychiatrists] = useState([]);
  const [showCreatePsychiatristModal, setShowCreatePsychiatristModal] = useState(false);
  const [showEditPsychiatristModal, setShowEditPsychiatristModal] = useState(false);
  const [editingPsychiatrist, setEditingPsychiatrist] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [psychiatristToDelete, setPsychiatristToDelete] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [data, psychiatristsData] = await Promise.all([
        apiService.getHrDashboard(),
        apiService.getAllPsychiatrists()
      ]);
      setDashboardData(data);
      setPsychiatrists(psychiatristsData);
    } catch (error) {
      showError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleBookPsychiatrist = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        psychiatrist_id: parseInt(bookingForm.psychiatrist_id),
        booking_date: `${bookingForm.booking_date}T${bookingForm.booking_time}:00`,
        duration_minutes: bookingForm.duration_minutes,
        notes: bookingForm.notes
      };

      if (selectedEmployee) {
        await apiService.hrBookForEmployee(selectedEmployee.id, bookingData);
        showSuccess('Psychiatrist booked for employee successfully');
      } else {
        await apiService.hrBookPsychiatrist(bookingData);
        showSuccess('Psychiatrist booked successfully');
      }

      setShowBookingModal(false);
      setAvailableTimes([]);
      setBookingForm({
        psychiatrist_id: '',
        booking_date: '',
        booking_time: '',
        duration_minutes: 30,
        notes: ''
      });
      setSelectedEmployee(null);
      fetchDashboardData();
    } catch (error) {
      showError('Failed to book psychiatrist');
    }
  };

  const getStressLevel = (score) => {
    if (score <= 13) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (score <= 26) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const fetchAvailableTimes = async (psychiatristId, date) => {
    if (!psychiatristId || !date) {
      setAvailableTimes([]);
      return;
    }

    try {
      setLoadingTimes(true);
      const response = await apiService.getPsychiatristAvailableTimes(psychiatristId, date);
      setAvailableTimes(response.available_times || []);
    } catch (error) {
      console.error('Error fetching available times:', error);
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const handleBookingFormChange = (field, value) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
    
    // Fetch available times when psychiatrist or date changes
    if (field === 'psychiatrist_id' || field === 'booking_date') {
      const psychiatristId = field === 'psychiatrist_id' ? value : bookingForm.psychiatrist_id;
      const date = field === 'booking_date' ? value : bookingForm.booking_date;
      
      if (psychiatristId && date) {
        fetchAvailableTimes(psychiatristId, date);
      } else {
        setAvailableTimes([]);
      }
    }
  };

  // Psychiatrist management functions
  const handleCreatePsychiatrist = async (psychiatristData) => {
    try {
      await apiService.createPsychiatristWithAvailability(psychiatristData);
      showSuccess('Psychiatrist created successfully!');
      setShowCreatePsychiatristModal(false);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      showError(error.message || 'Failed to create psychiatrist');
    }
  };

  const handleUpdatePsychiatrist = async (psychiatristData) => {
    try {
      await apiService.updatePsychiatrist(editingPsychiatrist.id, psychiatristData);
      showSuccess('Psychiatrist updated successfully!');
      setShowEditPsychiatristModal(false);
      setEditingPsychiatrist(null);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      showError(error.message || 'Failed to update psychiatrist');
    }
  };

  const handleDeletePsychiatrist = async (psychiatristId) => {
    setPsychiatristToDelete(psychiatristId);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeletePsychiatrist = async () => {
    try {
      await apiService.deletePsychiatrist(psychiatristToDelete);
      showSuccess('Psychiatrist deleted successfully!');
      setShowDeleteConfirmModal(false);
      setPsychiatristToDelete(null);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      showError(error.message || 'Failed to delete psychiatrist');
    }
  };

  const handleEditPsychiatrist = (psychiatrist) => {
    setEditingPsychiatrist(psychiatrist);
    setShowEditPsychiatristModal(true);
  };

  // Function to check for overlapping time slots
  const hasOverlappingTimeSlots = (availabilities) => {
    const timeSlots = availabilities.map(av => ({
      day: av.day_of_week,
      start: av.start_time,
      end: av.end_time
    }));

    for (let i = 0; i < timeSlots.length; i++) {
      for (let j = i + 1; j < timeSlots.length; j++) {
        const slot1 = timeSlots[i];
        const slot2 = timeSlots[j];
        
        if (slot1.day === slot2.day) {
          const start1 = new Date(`2000-01-01T${slot1.start}`);
          const end1 = new Date(`2000-01-01T${slot1.end}`);
          const start2 = new Date(`2000-01-01T${slot2.start}`);
          const end2 = new Date(`2000-01-01T${slot2.end}`);
          
          if (start1 < end2 && start2 < end1) {
            return true;
          }
        }
      }
    }
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading HR Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HR Manager Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {dashboardData.user}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.total_employees}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Supervisors</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.total_supervisors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shared Stress Scores</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.total_shared_stress_scores}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.total_hr_bookings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'stress-scores', name: 'Shared Stress Scores', icon: '📈' },
                { id: 'psychiatrists', name: 'Psychiatrists', icon: '👨‍⚕️' },
                { id: 'psychiatrist-management', name: 'Manage Psychiatrists', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* HR's Own Stress Score */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">My Stress Assessment</h3>
                  {dashboardData.hr_stress_score.score !== null ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Current Stress Score</p>
                        <p className="text-3xl font-bold text-gray-900">{dashboardData.hr_stress_score.score}/40</p>
                        <p className={`text-sm font-medium ${getStressLevel(dashboardData.hr_stress_score.score).color}`}>
                          {getStressLevel(dashboardData.hr_stress_score.score).level} Stress Level
                        </p>
                      </div>
                      <Link
                        to="/stress-score"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Update Assessment
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">You haven't completed a stress assessment yet.</p>
                      <Link
                        to="/stress-score"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Take Assessment
                      </Link>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowBookingModal(true)}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Book Psychiatrist Session
                      </button>
                      <Link
                        to="/psychiatrists"
                        className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                      >
                        View Available Psychiatrists
                      </Link>

                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                    <div className="space-y-3">
                      {dashboardData.hr_bookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{booking.psychiatrist_name}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.booking_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stress Scores Tab */}
            {activeTab === 'stress-scores' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Shared Stress Scores</h3>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Book Psychiatrist for Employee
                  </button>
                </div>

                {dashboardData.stress_scores_shared_with_hr.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardData.stress_scores_shared_with_hr.map((score) => (
                      <div key={score.employee_id} className="bg-white border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">{score.employee_name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStressLevel(score.score).bg} ${getStressLevel(score.score).color}`}>
                            {getStressLevel(score.score).level}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-2xl font-bold text-gray-900">{score.score}/40</p>
                          <p className="text-sm text-gray-600">
                            Updated: {new Date(score.updated_at).toLocaleDateString()}
                          </p>
                          <div className="flex space-x-2">
                            {score.share_with_supervisor && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Shared with Supervisor
                              </span>
                            )}
                            {score.share_with_hr && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Shared with HR
                              </span>
                            )}
                          </div>
                        </div>
                        {score.score > 26 && (
                          <button
                            onClick={() => {
                              setSelectedEmployee({ id: score.employee_id, name: score.employee_name });
                              setShowBookingModal(true);
                            }}
                            className="mt-4 w-full bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Book Psychiatrist Session
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No stress scores have been shared with HR yet.</p>
                  </div>
                )}
              </div>
            )}



            {/* Psychiatrists Tab */}
            {activeTab === 'psychiatrists' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Available Psychiatrists</h3>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Book Session
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.available_psychiatrists.map((psychiatrist) => (
                    <div key={psychiatrist.id} className="bg-white border rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-2">{psychiatrist.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{psychiatrist.specialization}</p>
                      <p className="text-sm text-gray-600 mb-4">{psychiatrist.hospital}</p>
                      <button
                        onClick={() => {
                          setBookingForm({ ...bookingForm, psychiatrist_id: psychiatrist.id });
                          setShowBookingModal(true);
                        }}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Book Session
                      </button>
                    </div>
                  ))}
                </div>

                {/* My Bookings */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">My Bookings</h3>
                  {dashboardData.hr_bookings.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.hr_bookings.map((booking) => (
                        <div key={booking.id} className="bg-white border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{booking.psychiatrist_name}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(booking.booking_date).toLocaleDateString()} at{' '}
                                {new Date(booking.booking_date).toLocaleTimeString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                Duration: {booking.duration_minutes} minutes
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No bookings yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Psychiatrist Management Tab */}
            {activeTab === 'psychiatrist-management' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Psychiatrists</h3>
                  <button
                    onClick={() => setShowCreatePsychiatristModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Psychiatrist
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qualifications
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registration Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hospital
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Specialization
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {psychiatrists.map((psychiatrist) => (
                        <tr key={psychiatrist.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {psychiatrist.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {psychiatrist.qualifications}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {psychiatrist.registration_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {psychiatrist.hospital}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {psychiatrist.specialization}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditPsychiatrist(psychiatrist)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePsychiatrist(psychiatrist.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Book Psychiatrist Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedEmployee ? `Book Psychiatrist for ${selectedEmployee.name}` : 'Book Psychiatrist Session'}
              </h3>
              <form onSubmit={handleBookPsychiatrist} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Psychiatrist</label>
                  <select
                    value={bookingForm.psychiatrist_id}
                    onChange={(e) => handleBookingFormChange('psychiatrist_id', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a psychiatrist</option>
                    {dashboardData.available_psychiatrists.map((psychiatrist) => (
                      <option key={psychiatrist.id} value={psychiatrist.id}>
                        {psychiatrist.name} - {psychiatrist.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={bookingForm.booking_date}
                    onChange={(e) => handleBookingFormChange('booking_date', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <select
                    value={bookingForm.booking_time}
                    onChange={(e) => setBookingForm({ ...bookingForm, booking_time: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={loadingTimes}
                  >
                    <option value="">
                      {loadingTimes ? 'Loading available times...' : 'Select a time'}
                    </option>
                    {availableTimes.map((timeSlot) => (
                      <option key={timeSlot.display} value={timeSlot.start_time}>
                        {timeSlot.display}
                      </option>
                    ))}
                  </select>
                  {availableTimes.length === 0 && bookingForm.psychiatrist_id && bookingForm.booking_date && !loadingTimes && (
                    <p className="text-sm text-red-600 mt-1">No available times for this psychiatrist on the selected date</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value="30 minutes"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Session duration is fixed at 30 minutes</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Book Session
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingModal(false);
                      setSelectedEmployee(null);
                      setAvailableTimes([]);
                      setBookingForm({
                        psychiatrist_id: '',
                        booking_date: '',
                        booking_time: '',
                        duration_minutes: 30,
                        notes: ''
                      });
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Psychiatrist Modal */}
      {showCreatePsychiatristModal && (
        <CreatePsychiatristModal
          onClose={() => setShowCreatePsychiatristModal(false)}
          onSubmit={handleCreatePsychiatrist}
        />
      )}

      {/* Edit Psychiatrist Modal */}
      {showEditPsychiatristModal && editingPsychiatrist && (
        <EditPsychiatristModal
          onClose={() => {
            setShowEditPsychiatristModal(false);
            setEditingPsychiatrist(null);
          }}
          onSubmit={handleUpdatePsychiatrist}
          psychiatrist={editingPsychiatrist}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Psychiatrist</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this psychiatrist? This action cannot be undone.</p>
              <div className="flex space-x-3">
                <button
                  onClick={confirmDeletePsychiatrist}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setPsychiatristToDelete(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Create Psychiatrist Modal Component
const CreatePsychiatristModal = ({ onClose, onSubmit }) => {
  const { showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    qualifications: '',
    registration_number: '',
    hospital: '',
    specialization: '',
    username: '',
    password: '',
    availabilities: []
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysOfWeek = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' }
  ];

  // Validation schema for psychiatrist creation
  const validationSchema = {
    name: [validationRules.required, validationRules.name],
    qualifications: [validationRules.required, (value) => validationRules.textLength(value, 'Qualifications', 2, 200)],
    registration_number: [validationRules.required, (value) => validationRules.textLength(value, 'Registration Number', 3, 50)],
    hospital: [validationRules.required, (value) => validationRules.textLength(value, 'Hospital', 2, 100)],
    specialization: [validationRules.required, (value) => validationRules.textLength(value, 'Specialization', 2, 100)],
    username: [validationRules.required, validationRules.email],
    password: [validationRules.required, validationRules.password]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validationSchema[name]) {
      const fieldErrors = validateForm({ [name]: value }, { [name]: validationSchema[name] });
      if (fieldErrors[name]) {
        setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
      }
    }
  };

  const addAvailability = () => {
    setFormData(prev => ({
      ...prev,
      availabilities: [...prev.availabilities, { day_of_week: 0, start_time: '09:00', end_time: '17:00', is_available: true }]
    }));
  };

  const removeAvailability = (index) => {
    setFormData(prev => ({
      ...prev,
      availabilities: prev.availabilities.filter((_, i) => i !== index)
    }));
  };

  const updateAvailability = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      availabilities: prev.availabilities.map((availability, i) => 
        i === index ? { ...availability, [field]: value } : availability
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({ name: true, qualifications: true, registration_number: true, hospital: true, specialization: true });
    
    const formErrors = validateForm(formData, validationSchema);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      showError("Please fix the errors in the form");
      return;
    }

    // Check for overlapping time slots
    const timeSlots = formData.availabilities.map(av => ({
      day: av.day_of_week,
      start: av.start_time,
      end: av.end_time
    }));

    for (let i = 0; i < timeSlots.length; i++) {
      for (let j = i + 1; j < timeSlots.length; j++) {
        const slot1 = timeSlots[i];
        const slot2 = timeSlots[j];
        
        if (slot1.day === slot2.day) {
          const start1 = new Date(`2000-01-01T${slot1.start}`);
          const end1 = new Date(`2000-01-01T${slot1.end}`);
          const start2 = new Date(`2000-01-01T${slot2.start}`);
          const end2 = new Date(`2000-01-01T${slot2.end}`);
          
          if (start1 < end2 && start2 < end1) {
            showError('Overlapping time slots detected. Please fix the availability schedule.');
            return;
          }
        }
      }
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      showError(error.message || 'Failed to create psychiatrist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-[#212121] flex items-center">
            <span className="mr-2">👨‍⚕️</span>
            Add New Psychiatrist
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
            <h4 className="text-lg font-semibold text-[#212121] mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#212121] font-medium mb-2">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.name && errors.name 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="Enter psychiatrist's full name"
                />
                {touched.name && errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-[#212121] font-medium mb-2">Qualifications <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.qualifications && errors.qualifications 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="e.g., MBBS, MD Psychiatry"
                />
                {touched.qualifications && errors.qualifications && (
                  <p className="text-red-500 text-sm mt-1">{errors.qualifications}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-[#212121] font-medium mb-2">Registration Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.registration_number && errors.registration_number 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="Enter registration number"
                />
                {touched.registration_number && errors.registration_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.registration_number}</p>
                )}
              </div>
              <div>
                <label className="block text-[#212121] font-medium mb-2">Hospital <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.hospital && errors.hospital 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="Enter hospital name"
                />
                {touched.hospital && errors.hospital && (
                  <p className="text-red-500 text-sm mt-1">{errors.hospital}</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-[#212121] font-medium mb-2">Specialization <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  touched.specialization && errors.specialization 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
                placeholder="e.g., Clinical Psychology, Psychiatry"
              />
              {touched.specialization && errors.specialization && (
                <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>
              )}
            </div>
          </div>

          {/* Login Information */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
            <h4 className="text-lg font-semibold text-[#212121] mb-4 flex items-center">
              <span className="mr-2">🔐</span>
              Login Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#212121] font-medium mb-2">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.username && errors.username 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="Enter email address"
                />
                {touched.username && errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>
              <div>
                <label className="block text-[#212121] font-medium mb-2">Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  minLength="8"
                  className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.password && errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="Enter password (min 8 characters)"
                />
                {touched.password && errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-[#212121] flex items-center">
                <span className="mr-2">📅</span>
                Availability Schedule
              </h4>
              <button
                type="button"
                onClick={addAvailability}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Time Slot
              </button>
            </div>
            {formData.availabilities.length === 0 && (
              <p className="text-gray-600 text-center py-4">No availability slots added yet. Click "Add Time Slot" to begin.</p>
            )}
            {formData.availabilities.map((availability, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[#212121] font-medium mb-2">Day</label>
                    <select
                      value={availability.day_of_week}
                      onChange={(e) => updateAvailability(index, 'day_of_week', parseInt(e.target.value))}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      {daysOfWeek.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#212121] font-medium mb-2">Start Time</label>
                    <input
                      type="time"
                      value={availability.start_time}
                      onChange={(e) => updateAvailability(index, 'start_time', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[#212121] font-medium mb-2">End Time</label>
                    <input
                      type="time"
                      value={availability.end_time}
                      onChange={(e) => updateAvailability(index, 'end_time', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeAvailability(index)}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Psychiatrist'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Psychiatrist Modal Component
const EditPsychiatristModal = ({ onClose, onSubmit, psychiatrist }) => {
  const { showError } = useToast();
  const [formData, setFormData] = useState({
    name: psychiatrist.name || '',
    qualifications: psychiatrist.qualifications || '',
    registration_number: psychiatrist.registration_number || '',
    hospital: psychiatrist.hospital || '',
    specialization: psychiatrist.specialization || '',
    username: psychiatrist.username || '',
    password: '',
    availabilities: psychiatrist.availabilities || []
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysOfWeek = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' }
  ];

  // Validation schema for psychiatrist editing
  const validationSchema = {
    name: [validationRules.required, validationRules.name],
    qualifications: [validationRules.required, (value) => validationRules.textLength(value, 'Qualifications', 2, 200)],
    registration_number: [validationRules.required, (value) => validationRules.textLength(value, 'Registration Number', 3, 50)],
    hospital: [validationRules.required, (value) => validationRules.textLength(value, 'Hospital', 2, 100)],
    specialization: [validationRules.required, (value) => validationRules.textLength(value, 'Specialization', 2, 100)],
    username: [validationRules.required, validationRules.email],
    password: [validationRules.required, validationRules.password]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validationSchema[name]) {
      const fieldErrors = validateForm({ [name]: value }, { [name]: validationSchema[name] });
      if (fieldErrors[name]) {
        setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
      }
    }
  };

  const addAvailability = () => {
    setFormData(prev => ({
      ...prev,
      availabilities: [...prev.availabilities, { day_of_week: 0, start_time: '09:00', end_time: '17:00', is_available: true }]
    }));
  };

  const removeAvailability = (index) => {
    setFormData(prev => ({
      ...prev,
      availabilities: prev.availabilities.filter((_, i) => i !== index)
    }));
  };

  const updateAvailability = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      availabilities: prev.availabilities.map((availability, i) => 
        i === index ? { ...availability, [field]: value } : availability
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({ name: true, qualifications: true, registration_number: true, hospital: true, specialization: true });
    
    const formErrors = validateForm(formData, validationSchema);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      showError("Please fix the errors in the form");
      return;
    }

    // Check for overlapping time slots
    const timeSlots = formData.availabilities.map(av => ({
      day: av.day_of_week,
      start: av.start_time,
      end: av.end_time
    }));

    for (let i = 0; i < timeSlots.length; i++) {
      for (let j = i + 1; j < timeSlots.length; j++) {
        const slot1 = timeSlots[i];
        const slot2 = timeSlots[j];
        
        if (slot1.day === slot2.day) {
          const start1 = new Date(`2000-01-01T${slot1.start}`);
          const end1 = new Date(`2000-01-01T${slot1.end}`);
          const start2 = new Date(`2000-01-01T${slot2.start}`);
          const end2 = new Date(`2000-01-01T${slot2.end}`);
          
          if (start1 < end2 && start2 < end1) {
            showError('Overlapping time slots detected. Please fix the availability schedule.');
            return;
          }
        }
      }
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      showError(error.message || 'Failed to update psychiatrist');
    } finally {
      setIsSubmitting(false);
    }
  };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-[#212121] flex items-center">
            <span className="mr-2">✏️</span>
            Edit Psychiatrist
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
            <h4 className="text-lg font-semibold text-[#212121] mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#212121] font-medium mb-2">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.name && errors.name 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="Enter psychiatrist's full name"
                />
                {touched.name && errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-[#212121] font-medium mb-2">Qualifications <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.qualifications && errors.qualifications 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="e.g., MBBS, MD Psychiatry"
                />
                {touched.qualifications && errors.qualifications && (
                  <p className="text-red-500 text-sm mt-1">{errors.qualifications}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-[#212121] font-medium mb-2">Registration Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.registration_number && errors.registration_number 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="Enter registration number"
                />
                {touched.registration_number && errors.registration_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.registration_number}</p>
                )}
              </div>
              <div>
                <label className="block text-[#212121] font-medium mb-2">Hospital <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.hospital && errors.hospital 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="Enter hospital name"
                />
                {touched.hospital && errors.hospital && (
                  <p className="text-red-500 text-sm mt-1">{errors.hospital}</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-[#212121] font-medium mb-2">Specialization <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  touched.specialization && errors.specialization 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
                placeholder="e.g., Clinical Psychology, Psychiatry"
              />
              {touched.specialization && errors.specialization && (
                <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>
              )}
            </div>
          </div>

          {/* Login Information */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
            <h4 className="text-lg font-semibold text-[#212121] mb-4 flex items-center">
              <span className="mr-2">🔐</span>
              Login Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#212121] font-medium mb-2">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.username && errors.username 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="Enter email address"
                />
                {touched.username && errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>
              <div>
                <label className="block text-[#212121] font-medium mb-2">Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  minLength="8"
                  className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.password && errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="Enter new password (min 8 characters)"
                />
                {touched.password && errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-[#212121] flex items-center">
                <span className="mr-2">📅</span>
                Availability Schedule
              </h4>
              <button
                type="button"
                onClick={addAvailability}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Time Slot
              </button>
            </div>
            {formData.availabilities.length === 0 && (
              <p className="text-gray-600 text-center py-4">No availability slots added yet. Click "Add Time Slot" to begin.</p>
            )}
            {formData.availabilities.map((availability, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[#212121] font-medium mb-2">Day</label>
                    <select
                      value={availability.day_of_week}
                      onChange={(e) => updateAvailability(index, 'day_of_week', parseInt(e.target.value))}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      {daysOfWeek.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#212121] font-medium mb-2">Start Time</label>
                    <input
                      type="time"
                      value={availability.start_time}
                      onChange={(e) => updateAvailability(index, 'start_time', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[#212121] font-medium mb-2">End Time</label>
                    <input
                      type="time"
                      value={availability.end_time}
                      onChange={(e) => updateAvailability(index, 'end_time', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeAvailability(index)}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Psychiatrist'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HrDashboard; 