import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const HrDashboard = () => {
  const { getUserRole } = useAuth();
  const { showError, showSuccess } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [workloadForm, setWorkloadForm] = useState({ description: '', date: '' });
  const [bookingForm, setBookingForm] = useState({
    consultant_id: '',
    booking_date: '',
    booking_time: '',
    duration_minutes: 60,
    notes: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getHrDashboard();
      setDashboardData(data);
    } catch (error) {
      showError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkload = async (e) => {
    e.preventDefault();
    try {
      const workloadData = {
        description: workloadForm.description,
        date: new Date(workloadForm.date).toISOString()
      };
      await apiService.addHrWorkload(workloadData);
      showSuccess('Workload added successfully');
      setShowWorkloadModal(false);
      setWorkloadForm({ description: '', date: '' });
      fetchDashboardData();
    } catch (error) {
      showError('Failed to add workload');
    }
  };

  const handleBookConsultant = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        consultant_id: parseInt(bookingForm.consultant_id),
        booking_date: `${bookingForm.booking_date}T${bookingForm.booking_time}:00`,
        duration_minutes: bookingForm.duration_minutes,
        notes: bookingForm.notes
      };

      if (selectedEmployee) {
        await apiService.hrBookForEmployee(selectedEmployee.id, bookingData);
        showSuccess('Consultant booked for employee successfully');
      } else {
        await apiService.hrBookConsultant(bookingData);
        showSuccess('Consultant booked successfully');
      }

      setShowBookingModal(false);
      setBookingForm({
        consultant_id: '',
        booking_date: '',
        booking_time: '',
        duration_minutes: 60,
        notes: ''
      });
      setSelectedEmployee(null);
      fetchDashboardData();
    } catch (error) {
      showError('Failed to book consultant');
    }
  };

  const getStressLevel = (score) => {
    if (score <= 13) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (score <= 26) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
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
                { id: 'stress-scores', name: 'Stress Scores', icon: '📈' },
                { id: 'workloads', name: 'Workloads', icon: '📋' },
                { id: 'consultants', name: 'Consultants', icon: '👨‍⚕️' }
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
                        onClick={() => setShowWorkloadModal(true)}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Add Daily Workload
                      </button>
                      <button
                        onClick={() => setShowBookingModal(true)}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Book Consultant Session
                      </button>
                      <Link
                        to="/consultants"
                        className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                      >
                        View Available Consultants
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                    <div className="space-y-3">
                      {dashboardData.hr_bookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{booking.consultant_name}</p>
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
                  <h3 className="text-lg font-semibold text-gray-900">Stress Scores Shared with HR</h3>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Book Consultant for Employee
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
                            Book Consultant Session
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

            {/* Workloads Tab */}
            {activeTab === 'workloads' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">My Workloads</h3>
                  <button
                    onClick={() => setShowWorkloadModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Workload
                  </button>
                </div>

                {dashboardData.hr_workloads.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.hr_workloads.map((workload) => (
                      <div key={workload.id} className="bg-white border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{workload.description}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(workload.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No workloads logged yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Consultants Tab */}
            {activeTab === 'consultants' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Available Consultants</h3>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Book Session
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.available_consultants.map((consultant) => (
                    <div key={consultant.id} className="bg-white border rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-2">{consultant.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{consultant.specialization}</p>
                      <p className="text-sm text-gray-600 mb-4">{consultant.hospital}</p>
                      <button
                        onClick={() => {
                          setBookingForm({ ...bookingForm, consultant_id: consultant.id });
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
                              <p className="font-medium text-gray-900">{booking.consultant_name}</p>
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
          </div>
        </div>
      </div>

      {/* Add Workload Modal */}
      {showWorkloadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Daily Workload</h3>
              <form onSubmit={handleAddWorkload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={workloadForm.description}
                    onChange={(e) => setWorkloadForm({ ...workloadForm, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={workloadForm.date}
                    onChange={(e) => setWorkloadForm({ ...workloadForm, date: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Workload
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWorkloadModal(false)}
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

      {/* Book Consultant Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedEmployee ? `Book Consultant for ${selectedEmployee.name}` : 'Book Consultant Session'}
              </h3>
              <form onSubmit={handleBookConsultant} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Consultant</label>
                  <select
                    value={bookingForm.consultant_id}
                    onChange={(e) => setBookingForm({ ...bookingForm, consultant_id: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a consultant</option>
                    {dashboardData.available_consultants.map((consultant) => (
                      <option key={consultant.id} value={consultant.id}>
                        {consultant.name} - {consultant.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={bookingForm.booking_date}
                    onChange={(e) => setBookingForm({ ...bookingForm, booking_date: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={bookingForm.booking_time}
                    onChange={(e) => setBookingForm({ ...bookingForm, booking_time: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={bookingForm.duration_minutes}
                    onChange={(e) => setBookingForm({ ...bookingForm, duration_minutes: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="30"
                    max="180"
                    required
                  />
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
    </div>
  );
};

export default HrDashboard; 