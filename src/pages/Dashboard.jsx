import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { getDashboardUrl, shouldRedirectToAdmin } from '../utils/roleUtils';

const Dashboard = () => {
  const { getUserRole, setUserRole, user, refreshUserData } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [stressData, setStressData] = useState(null);
  const [workloadData, setWorkloadData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
      const fetchDashboardData = async () => {
        // Refresh user data to ensure we have the latest role information
        try {
          await refreshUserData();
        } catch (error) {
          console.log('Could not refresh user data:', error);
        }
        
        try {
          setLoading(true);
          const userRole = getUserRole();
          console.log('Current user role:', userRole);
          
          // Redirect admin users to admin dashboard
          if (shouldRedirectToAdmin(userRole)) {
            navigate('/admin-dashboard');
            return;
          }

          // Redirect HR users to HR dashboard
          if (userRole === 'hr_manager') {
            navigate('/hr-dashboard');
            return;
          }
          
          // Fetch main dashboard data
          let data;
          switch (userRole) {
            case 'employee':
              data = await apiService.getEmployeeDashboard();
              break;
            case 'supervisor':
              data = await apiService.getSupervisorDashboard();
              break;
            case 'psychiatrist':
              data = await apiService.getPsychiatristDashboard();
              break;
            default:
              console.log('Unknown role, defaulting to employee dashboard');
              data = await apiService.getEmployeeDashboard();
          }
          
          setDashboardData(data);
          
          // Fetch stress data
          try {
            console.log(`Fetching stress data for role: ${userRole}`);
            const stressResponse = await apiService.getMyStressScore();
            setStressData(stressResponse);
            console.log('Stress data fetched successfully:', stressResponse);
          } catch (stressError) {
            console.log('Could not fetch stress data:', stressError.message);
          }
          
          // Fetch workload data
          try {
            console.log(`Fetching workload data for role: ${userRole}`);
            const workloadResponse = await apiService.getWorkloadsByRole(userRole);
            setWorkloadData(workloadResponse);
            console.log('Workload data fetched successfully:', workloadResponse);
          } catch (workloadError) {
            console.log('Could not fetch workload data:', workloadError.message);
          }
          
          // Generate recent activities based on available data
          const activities = [];
          
          // Add role-specific activities
          if (userRole === 'supervisor') {
            activities.push({
              id: 3,
              activity: 'Reviewed team workloads',
              time: 'Today',
              type: 'task'
            });
          }
          
          if (userRole === 'psychiatrist') {
            activities.push({
              id: 4,
              activity: 'Consultation session',
              time: 'Today',
              type: 'consultant'
            });
          }
          
          setRecentActivities(activities);
          setError(null);
        } catch (error) {
          console.error('Dashboard error:', error);
          setError(error.message);
          showError(`Failed to load dashboard data: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    }, [getUserRole, showError]);

  // Update recent activities when stress and workload data change
  useEffect(() => {
    const activities = [];
    
    if (stressData && !stressData.message) {
      activities.push({
        id: 1,
        activity: 'Completed stress assessment',
        time: 'Recently',
        type: 'stress',
        score: stressData.score
      });
    }
    
    if (workloadData && workloadData.length > 0) {
      activities.push({
        id: 2,
        activity: 'Logged daily workload',
        time: 'Recently',
        type: 'task'
      });
    }
    
    // Add role-specific activities
    const userRole = getUserRole();
    if (userRole === 'supervisor') {
      activities.push({
        id: 3,
        activity: 'Reviewed team workloads',
        time: 'Today',
        type: 'task'
      });
    }
    
    if (userRole === 'psychiatrist') {
      activities.push({
        id: 4,
        activity: 'Consultation session',
        time: 'Today',
        type: 'consultant'
      });
    }
    
    setRecentActivities(activities);
  }, [stressData, workloadData, getUserRole]);

  const getStressColor = (score) => {
    if (score <= 13) return 'text-green-600 bg-green-100';
    if (score <= 26) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getWorkloadColor = (level) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-[#EDF4FA] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#EDF4FA] min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500 mb-4">Current role: {getUserRole()}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EDF4FA] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#212121] mb-2">
            Welcome back, {user?.username || getUserRole()}!
          </h1>
          <p className="text-[#4F4F4F]">Here's your mental wellness overview for today</p>
          
          {/* Debug Role Info */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Debug Info:</strong> Current Role: {getUserRole()} | Username: {user?.username || 'N/A'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setUserRole('employee')}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Set Employee
              </button>
              <button
                onClick={() => setUserRole('supervisor')}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                Set Supervisor
              </button>
              <button
                onClick={() => setUserRole('psychiatrist')}
                className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Set Psychiatrist
              </button>
                          <button
              onClick={() => setUserRole('hr_manager')}
              className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Set HR Manager
            </button>
            <button
              onClick={() => setUserRole('admin')}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              Set Admin
            </button>
            <button
              onClick={async () => {
                try {
                  await refreshUserData();
                  showSuccess('User data refreshed!');
                } catch (error) {
                  showError('Failed to refresh user data');
                }
              }}
              className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Refresh Data
            </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4F4F4F] text-sm">Current Stress Score</p>
                {stressData && !stressData.message ? (
                  <p className={`text-2xl font-bold ${getStressColor(stressData.score)}`}>
                    {stressData.score}/40
                  </p>
                ) : (
                  <p className="text-2xl font-bold text-gray-400">No assessment</p>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4F4F4F] text-sm">Workload Level</p>
                {workloadData && workloadData.length > 0 ? (
                  <p className={`text-2xl font-bold ${getWorkloadColor(workloadData[workloadData.length - 1].level || 'Medium')}`}>
                    {workloadData[workloadData.length - 1].level || 'Medium'}
                  </p>
                ) : (
                  <p className="text-2xl font-bold text-gray-400">No data</p>
                )}
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl">⚡</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4F4F4F] text-sm">Days Tracked</p>
                <p className="text-2xl font-bold text-[#212121]">
                  {stressData ? stressData.length : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">📅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific Stats */}
        {getUserRole() === 'supervisor' && (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-xl font-semibold text-[#212121] mb-4">Team Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData?.team_members || 0}
                </p>
                <p className="text-sm text-gray-600">Team Members</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData?.active_workloads || 0}
                </p>
                <p className="text-sm text-gray-600">Active Workloads</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardData?.pending_reviews || 0}
                </p>
                <p className="text-sm text-gray-600">Pending Reviews</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData?.team_tasks || 0}
                </p>
                <p className="text-sm text-gray-600">Team Tasks</p>
              </div>
            </div>
            
            {/* Supervisor Quick Actions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/supervisor/task-management"
                className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="mr-2">📋</span>
                Manage Team Tasks
              </Link>
              <Link
                to="/supervisor/stress-monitoring"
                className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <span className="mr-2">📊</span>
                Monitor Team Stress
              </Link>
            </div>
          </div>
        )}

        {getUserRole() === 'psychiatrist' && (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-xl font-semibold text-[#212121] mb-4">Consultation Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData?.pending_consultations || 0}
                </p>
                <p className="text-sm text-gray-600">Pending Consultations</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData?.completed_sessions || 0}
                </p>
                <p className="text-sm text-gray-600">Completed Sessions</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData?.total_patients || 0}
                </p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
            </div>
          </div>
        )}

        {getUserRole() === 'hr_manager' && (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-xl font-semibold text-[#212121] mb-4">HR Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData?.total_employees || 0}
                </p>
                <p className="text-sm text-gray-600">Total Employees</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboardData?.high_stress_cases || 0}
                </p>
                <p className="text-sm text-gray-600">High Stress Cases</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData?.wellness_programs || 0}
                </p>
                <p className="text-sm text-gray-600">Active Programs</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/task-management" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-[#212121] mb-2">Task Management</h3>
              <p className="text-[#4F4F4F] text-sm">Manage daily tasks</p>
            </div>
          </Link>

          <Link to="/stress-score" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-[#212121] mb-2">Stress Assessment</h3>
              <p className="text-[#4F4F4F] text-sm">Calculate your stress score</p>
            </div>
          </Link>

          <Link to="/stress-score" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-2xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold text-[#212121] mb-2">Stress Assessment</h3>
              <p className="text-[#4F4F4F] text-sm">Complete stress assessment</p>
            </div>
          </Link>

          <Link to="/ai-chat" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-[#212121] mb-2">AI Assistant</h3>
              <p className="text-[#4F4F4F] text-sm">Get tips & support</p>
            </div>
          </Link>

          <Link to="/consultants" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-2xl">👨‍⚕️</span>
              </div>
              <h3 className="text-lg font-semibold text-[#212121] mb-2">Consultants</h3>
              <p className="text-[#4F4F4F] text-sm">Expert support</p>
            </div>
          </Link>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold text-[#212121] mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">
                        {activity.type === 'task' && '📝'}
                        {activity.type === 'chat' && '🤖'}
                        {activity.type === 'consultant' && '👨‍⚕️'}
                        {activity.type === 'stress' && '🧠'}
                      </span>
                    </div>
                    <div>
                      <p className="text-[#212121] font-medium">
                        {activity.activity}
                        {activity.score && ` (Score: ${activity.score})`}
                      </p>
                      <p className="text-[#4F4F4F] text-sm">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activities</p>
                <p className="text-sm mt-2">Start by logging your daily tasks or stress score</p>
              </div>
            )}
          </div>
        </div>

        {/* Data Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-md mt-8">
          <h2 className="text-xl font-semibold text-[#212121] mb-4">Data Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-[#212121] mb-2">Stress Data</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Total entries: {stressData ? stressData.length : 0}</p>
                <p>Latest score: {stressData && stressData.length > 0 ? stressData[stressData.length - 1].score : 'N/A'}</p>
                <p>Average score: {stressData && stressData.length > 0 
                  ? Math.round(stressData.reduce((sum, entry) => sum + entry.score, 0) / stressData.length) 
                  : 'N/A'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-[#212121] mb-2">Workload Data</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Total entries: {workloadData ? workloadData.length : 0}</p>
                <p>Latest level: {workloadData && workloadData.length > 0 ? workloadData[workloadData.length - 1].level : 'N/A'}</p>
                <p>Most common level: {workloadData && workloadData.length > 0 
                  ? getMostCommonLevel(workloadData) 
                  : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get most common workload level
const getMostCommonLevel = (workloadData) => {
  const levels = workloadData.map(entry => entry.level);
  const levelCounts = {};
  levels.forEach(level => {
    levelCounts[level] = (levelCounts[level] || 0) + 1;
  });
  
  const mostCommon = Object.keys(levelCounts).reduce((a, b) => 
    levelCounts[a] > levelCounts[b] ? a : b
  );
  
  return mostCommon;
};

export default Dashboard; 