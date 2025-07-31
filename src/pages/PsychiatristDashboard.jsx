import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

const PsychiatristDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    status: 'approved',
    rejection_reason: ''
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboard, pending, sessions] = await Promise.all([
        api.getPsychiatristDashboard(),
        api.getPendingRequests(),
        api.getMySessions()
      ]);
      setDashboardData(dashboard);
      setPendingRequests(pending);
      setMySessions(sessions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = (booking) => {
    setSelectedBooking(booking);
    setApprovalData({
      status: 'approved',
      rejection_reason: ''
    });
    setShowApprovalModal(true);
  };

  const handleRejection = (booking) => {
    setSelectedBooking(booking);
    setApprovalData({
      status: 'rejected',
      rejection_reason: ''
    });
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async () => {
    try {
      setLoading(true);
      const response = await api.approveBooking(selectedBooking.id, approvalData);
      
      showSuccess(response.message);
      
      setShowApprovalModal(false);
      setSelectedBooking(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating booking:', error);
      showError('Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async (bookingId) => {
    try {
      setLoading(true);
      await api.completeSession(bookingId);
      showSuccess('Session marked as completed');
      fetchDashboardData();
    } catch (error) {
      console.error('Error completing session:', error);
      showError('Failed to complete session');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Colombo'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Colombo'
    });
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

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Psychiatrist Dashboard</h1>
          <p className="text-gray-600">Manage your sessions and booking requests</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Requests
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Sessions
            </button>
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboardData && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-blue-600">{dashboardData.stats.pending_requests}</div>
                <div className="text-sm text-blue-600">Pending Requests</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-green-600">{dashboardData.stats.upcoming_sessions}</div>
                <div className="text-sm text-green-600">Upcoming Sessions</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-purple-600">{dashboardData.stats.today_sessions}</div>
                <div className="text-sm text-purple-600">Today's Sessions</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-gray-600">{dashboardData.stats.total_bookings}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
            </div>

            {/* Today's Sessions */}
            {dashboardData.today_sessions.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Today's Sessions</h2>
                <div className="space-y-4">
                  {dashboardData.today_sessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{session.employee_name}</h3>
                          <p className="text-sm text-gray-600">{formatDate(session.booking_date)}</p>
                          <p className="text-sm text-gray-500">{session.duration_minutes} minutes</p>
                          {session.notes && (
                            <p className="text-sm text-gray-600 mt-1">Notes: {session.notes}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleCompleteSession(session.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Sessions */}
            {dashboardData.upcoming_sessions.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
                <div className="space-y-4">
                  {dashboardData.upcoming_sessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                      <div>
                        <h3 className="font-semibold">{session.employee_name}</h3>
                        <p className="text-sm text-gray-600">{formatDate(session.booking_date)}</p>
                        <p className="text-sm text-gray-500">{session.duration_minutes} minutes</p>
                        {session.notes && (
                          <p className="text-sm text-gray-600 mt-1">Notes: {session.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pending Requests Tab */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pending Requests ({pendingRequests.total_pending})</h2>
            {pendingRequests.time_slots?.length === 0 ? (
              <p className="text-gray-500">No pending requests</p>
            ) : (
              <div className="space-y-6">
                {pendingRequests.time_slots?.map((timeSlot) => (
                  <div key={timeSlot.time_slot} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">{formatDate(timeSlot.booking_date)}</h3>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        {timeSlot.conflict_count} request{timeSlot.conflict_count > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {timeSlot.requests.map((request) => (
                        <div key={request.id} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{request.employee_name}</h4>
                              <p className="text-sm text-gray-600">Booked by: {request.booked_by_name}</p>
                              <p className="text-sm text-gray-500">{formatTime(request.booking_date)}</p>
                              {request.notes && (
                                <p className="text-sm text-gray-600 mt-1">Notes: {request.notes}</p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproval(request)}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejection(request)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">All My Sessions</h2>
            {mySessions.length === 0 ? (
              <p className="text-gray-500">No sessions found</p>
            ) : (
              <div className="space-y-4">
                {mySessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{session.employee_name}</h3>
                        <p className="text-sm text-gray-600">{formatDate(session.booking_date)}</p>
                        <p className="text-sm text-gray-500">{session.duration_minutes} minutes</p>
                        <p className="text-sm text-gray-600">Booked by: {session.booked_by_name}</p>
                        {session.notes && (
                          <p className="text-sm text-gray-600 mt-1">Notes: {session.notes}</p>
                        )}
                        {session.rejection_reason && (
                          <p className="text-sm text-red-600 mt-1">Rejection: {session.rejection_reason}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                        {session.status === 'approved' && (
                          <button
                            onClick={() => handleCompleteSession(session.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {approvalData.status === 'approved' ? 'Approve' : 'Reject'} Request
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Employee:</strong> {selectedBooking.employee_name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Date:</strong> {formatDate(selectedBooking.booking_date)}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Duration:</strong> {selectedBooking.duration_minutes} minutes
              </p>
              {selectedBooking.notes && (
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Notes:</strong> {selectedBooking.notes}
                </p>
              )}
            </div>

            {approvalData.status === 'rejected' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (required)
                </label>
                <textarea
                  value={approvalData.rejection_reason}
                  onChange={(e) => setApprovalData({ ...approvalData, rejection_reason: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprovalSubmit}
                disabled={loading || (approvalData.status === 'rejected' && !approvalData.rejection_reason)}
                className={`flex-1 px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                  approvalData.status === 'approved' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? 'Processing...' : approvalData.status === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PsychiatristDashboard; 