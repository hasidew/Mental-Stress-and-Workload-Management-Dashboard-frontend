import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { validateForm, validationRules } from '../utils/validation';

const AdminDashboard = () => {
  const { getUserRole, setUserRole, user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateConsultantModal, setShowCreateConsultantModal] = useState(false);
  const [showCreateDepartmentModal, setShowCreateDepartmentModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showAssignSupervisorModal, setShowAssignSupervisorModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [supervisorToAssign, setSupervisorToAssign] = useState({ teamId: null, userId: null });
  const [userToDelete, setUserToDelete] = useState(null);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [consultants, setConsultants] = useState([]);
  const [showEditConsultantModal, setShowEditConsultantModal] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState(null);
  const [consultantToDelete, setConsultantToDelete] = useState(null);
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [showReviewRequestModal, setShowReviewRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAdminDashboard();
        setDashboardData(data);
        
        // Fetch all data
        const [usersData, departmentsData, teamsData, consultantsData, requestsData] = await Promise.all([
          apiService.getAllUsers(),
          apiService.getAllDepartments(),
          apiService.getAllTeams(),
          apiService.getAllConsultants(),
          apiService.getAllRegistrationRequests()
        ]);
        
        console.log('Loaded data:', { usersData, departmentsData, teamsData, consultantsData, requestsData });
        
        setUsers(usersData);
        setDepartments(departmentsData);
        setTeams(teamsData);
        setConsultants(consultantsData);
        setRegistrationRequests(requestsData);
        
        setError(null);
      } catch (error) {
        console.error('Admin dashboard error:', error);
        // Check for HTTP status if available
        let message = error.message;
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          message = 'You are not authorized to view this page. Please sign in as an admin.';
        }
        setError(message);
        showError(`Failed to load admin dashboard: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  const handleCreateUser = async (userData) => {
    try {
      await apiService.createUser(userData);
      showSuccess('User created successfully!');
      setShowCreateUserModal(false);
      // Refresh data including dashboard stats
      const [usersData, departmentsData, teamsData, dashboardData] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllDepartments(),
        apiService.getAllTeams(),
        apiService.getAdminDashboard()
      ]);
      setUsers(usersData);
      setDepartments(departmentsData);
      setTeams(teamsData);
      setDashboardData(dashboardData);
    } catch (error) {
      showError(error.message || 'Failed to create user');
    }
  };

  const handleCreateConsultant = async (consultantData) => {
    try {
      await apiService.createConsultantWithAvailability(consultantData);
      showSuccess('Consultant created successfully!');
      setShowCreateConsultantModal(false);
      // Refresh consultants and dashboard stats
      const [consultantsData, dashboardData] = await Promise.all([
        apiService.getAllConsultants(),
        apiService.getAdminDashboard()
      ]);
      setConsultants(consultantsData);
      setDashboardData(dashboardData);
    } catch (error) {
      showError(error.message || 'Failed to create consultant');
    }
  };

  const handleCreateDepartment = async (departmentData) => {
    try {
      await apiService.createDepartment(departmentData);
      showSuccess('Department created successfully!');
      setShowCreateDepartmentModal(false);
      // Refresh departments and dashboard stats
      const [departmentsData, dashboardData] = await Promise.all([
        apiService.getAllDepartments(),
        apiService.getAdminDashboard()
      ]);
      setDepartments(departmentsData);
      setDashboardData(dashboardData);
    } catch (error) {
      showError(error.message || 'Failed to create department');
    }
  };

  const handleCreateTeam = async (teamData) => {
    try {
      await apiService.createTeam(teamData);
      showSuccess('Team created successfully!');
      setShowCreateTeamModal(false);
      // Refresh teams and dashboard stats
      const [teamsData, dashboardData] = await Promise.all([
        apiService.getAllTeams(),
        apiService.getAdminDashboard()
      ]);
      setTeams(teamsData);
      setDashboardData(dashboardData);
    } catch (error) {
      showError(error.message || 'Failed to create team');
    }
  };

  const handleAssignSupervisor = async (teamId, userId) => {
    try {
      await apiService.assignSupervisor(teamId, userId);
      showSuccess('Supervisor assigned successfully!');
      // Refresh teams and dashboard stats
      const [teamsData, dashboardData] = await Promise.all([
        apiService.getAllTeams(),
        apiService.getAdminDashboard()
      ]);
      setTeams(teamsData);
      setDashboardData(dashboardData);
    } catch (error) {
      showError(error.message || 'Failed to assign supervisor');
    }
  };

  const handleDeleteUser = async (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await apiService.deleteUser(userToDelete);
      showSuccess('User deleted successfully!');
      // Refresh users and dashboard stats
      const [usersData, dashboardData] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAdminDashboard()
      ]);
      setUsers(usersData);
      setDashboardData(dashboardData);
    } catch (error) {
      showError(error.message || 'Failed to delete user');
    } finally {
      setShowDeleteConfirmModal(false);
      setUserToDelete(null);
    }
  };

  const handleUpdateDepartment = async (departmentData) => {
    try {
      await apiService.updateDepartment(editingDepartment.id, departmentData);
      showSuccess('Department updated successfully!');
      setShowEditDepartmentModal(false);
      setEditingDepartment(null);
      // Refresh departments and dashboard stats
      const [departmentsData, dashboardData] = await Promise.all([
        apiService.getAllDepartments(),
        apiService.getAdminDashboard()
      ]);
      setDepartments(departmentsData);
      setDashboardData(dashboardData);
    } catch (error) {
      showError(error.message || 'Failed to update department');
    }
  };

  const handleUpdateTeam = async (teamData) => {
    try {
      await apiService.updateTeam(editingTeam.id, teamData);
      showSuccess('Team updated successfully!');
      setShowEditTeamModal(false);
      setEditingTeam(null);
      // Refresh teams and dashboard stats
      const [teamsData, dashboardData] = await Promise.all([
        apiService.getAllTeams(),
        apiService.getAdminDashboard()
      ]);
      setTeams(teamsData);
      setDashboardData(dashboardData);
    } catch (error) {
      showError(error.message || 'Failed to update team');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    setTeamToDelete(teamId);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteTeam = async () => {
    try {
      await apiService.deleteTeam(teamToDelete);
      showSuccess('Team deleted successfully!');
      // Refresh teams and dashboard stats
      const [teamsData, dashboardData] = await Promise.all([
        apiService.getAllTeams(),
        apiService.getAdminDashboard()
      ]);
      setTeams(teamsData);
      setDashboardData(dashboardData);
    } catch (error) {
      showError(error.message || 'Failed to delete team');
    } finally {
      setShowDeleteConfirmModal(false);
      setTeamToDelete(null);
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await apiService.updateUser(editingUser.id, userData);
      showSuccess('User updated successfully!');
      setShowEditUserModal(false);
      setEditingUser(null);
      // Refresh all data including dashboard stats
      const [usersData, departmentsData, teamsData, dashboardData] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllDepartments(),
        apiService.getAllTeams(),
        apiService.getAdminDashboard()
      ]);
      setUsers(usersData);
      setDepartments(departmentsData);
      setTeams(teamsData);
      setDashboardData(dashboardData);
    } catch (error) {
      showError(error.message || 'Failed to update user');
    }
  };

  const handleUpdateConsultant = async (consultantData) => {
    try {
      await apiService.updateConsultant(editingConsultant.id, consultantData);
      showSuccess('Consultant updated successfully!');
      setShowEditConsultantModal(false);
      setEditingConsultant(null);
      // Refresh consultants and dashboard stats
      const [consultantsData, dashboardData] = await Promise.all([
        apiService.getAllConsultants(),
        apiService.getAdminDashboard()
      ]);
      setConsultants(consultantsData);
      setDashboardData(dashboardData);
    } catch (error) {
      showError(error.message || 'Failed to update consultant');
    }
  };

  const handleDeleteConsultant = async (consultantId) => {
    setConsultantToDelete(consultantId);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteConsultant = async () => {
    try {
      await apiService.deleteConsultant(consultantToDelete);
      showSuccess('Consultant deleted successfully!');
      // Refresh consultants and dashboard stats
      const [consultantsData, dashboardData] = await Promise.all([
        apiService.getAllConsultants(),
        apiService.getAdminDashboard()
      ]);
      setConsultants(consultantsData);
      setDashboardData(dashboardData);
    } catch (error) {
      showError(error.message || 'Failed to delete consultant');
    } finally {
      setShowDeleteConfirmModal(false);
      setConsultantToDelete(null);
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
            <h2 className="text-2xl font-bold text-red-600 mb-4">Admin Dashboard Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            {error.includes('not authorized') ? (
              <a href="/signin" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Go to Sign In</a>
            ) : (
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            )}
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-[#212121]">Admin Dashboard</h1>
            <Link to="/dashboard" className="text-[#212121] hover:text-blue-600">
              ← Back to Dashboard
            </Link>
          </div>
          <p className="text-[#4F4F4F]">Manage users, departments, and teams in the system</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4F4F4F] text-sm">Total Users</p>
                <p className="text-2xl font-bold text-[#212121]">
                  {dashboardData?.stats?.total_users || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4F4F4F] text-sm">Departments</p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData?.stats?.departments || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4F4F4F] text-sm">Teams</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData?.stats?.teams || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4F4F4F] text-sm">Consultants</p>
                <p className="text-2xl font-bold text-red-600">
                  {dashboardData?.stats?.consultants || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">👨‍⚕️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4F4F4F] text-sm">Pending Requests</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardData?.stats?.pending_requests || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Users
              </button>
              <button
                onClick={() => setActiveTab('departments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'departments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Departments
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'teams'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Teams
              </button>
              <button
                onClick={() => setActiveTab('consultants')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'consultants'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Consultants
              </button>
              <button
                onClick={() => setActiveTab('registration-requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'registration-requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Registration Requests
                {registrationRequests.filter(req => req.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {registrationRequests.filter(req => req.status === 'pending').length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold text-[#212121] mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {dashboardData?.recent_users?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-[#212121]">{user.name || user.username}</p>
                        <p className="text-sm text-[#4F4F4F] capitalize">{user.role}</p>
                      </div>
                      <span className="text-xs text-gray-500">ID: {user.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#212121]">All Users</h3>
                  <button
                    onClick={() => setShowCreateUserModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add User
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
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.filter(user => user.role !== 'admin').map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.name || user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {user.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.department_name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.team_name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setShowEditUserModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
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

            {activeTab === 'departments' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#212121]">All Departments</h3>
                  <button
                    onClick={() => setShowCreateDepartmentModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Department
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
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teams
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employees
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {departments.map((dept) => (
                        <tr key={dept.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {dept.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {dept.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {dept.team_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {dept.employee_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setEditingDepartment(dept);
                                setShowEditDepartmentModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'teams' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#212121]">All Teams</h3>
                  <button
                    onClick={() => setShowCreateTeamModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Team
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
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supervisor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employees
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teams.map((team) => (
                        <tr key={team.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {team.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {team.department_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {team.supervisor_name || 'No supervisor'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {team.employee_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setEditingTeam(team);
                                setShowEditTeamModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTeam(team.id)}
                              className="text-red-600 hover:text-red-900 mr-2"
                            >
                              Delete
                            </button>
                            {!team.supervisor_id && (
                              <button
                                onClick={() => {
                                  setSupervisorToAssign({ teamId: team.id, userId: null });
                                  setShowAssignSupervisorModal(true);
                                }}
                                className="text-green-600 hover:text-green-900"
                              >
                                Assign Supervisor
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'consultants' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#212121]">All Consultants</h3>
                  <button
                    onClick={() => setShowCreateConsultantModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Consultant
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
                          Availability
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {consultants.map((consultant) => (
                        <tr key={consultant.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {consultant.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {consultant.qualifications}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {consultant.registration_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {consultant.hospital}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {consultant.specialization}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="max-w-xs">
                              {consultant.availabilities && consultant.availabilities.length > 0 ? (
                                <div className="space-y-1">
                                  {consultant.availabilities.map((avail, index) => {
                                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                    const dayName = days[avail.day_of_week];
                                    return (
                                      <div key={index} className="text-xs bg-blue-50 px-2 py-1 rounded">
                                        <span className="font-medium">{dayName}:</span> {avail.start_time} - {avail.end_time}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-gray-400">No availability set</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setEditingConsultant(consultant);
                                setShowEditConsultantModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteConsultant(consultant.id)}
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

            {activeTab === 'registration-requests' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#212121]">Registration Requests</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registrationRequests.map((request) => (
                        <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {request.first_name} {request.last_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {request.job_role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.contact || request.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              request.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : request.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.submitted_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowReviewRequestModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 mr-2"
                                >
                                  Review
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowReviewRequestModal(true);
                              }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              View Details
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

        {/* Create User Modal */}
        {showCreateUserModal && (
          <CreateUserModal
            onClose={() => setShowCreateUserModal(false)}
            onSubmit={handleCreateUser}
            departments={departments}
            teams={teams}
          />
        )}

        {/* Create Consultant Modal */}
        {showCreateConsultantModal && (
          <CreateConsultantWithAvailabilityModal
            onClose={() => setShowCreateConsultantModal(false)}
            onSubmit={handleCreateConsultant}
          />
        )}

        {/* Edit Consultant Modal */}
        {showEditConsultantModal && editingConsultant && (
          <EditConsultantModal
            onClose={() => {
              setShowEditConsultantModal(false);
              setEditingConsultant(null);
            }}
            onSubmit={handleUpdateConsultant}
            consultant={editingConsultant}
          />
        )}

        {/* Create Department Modal */}
        {showCreateDepartmentModal && (
          <CreateDepartmentModal
            onClose={() => setShowCreateDepartmentModal(false)}
            onSubmit={handleCreateDepartment}
          />
        )}

        {/* Create Team Modal */}
        {showCreateTeamModal && (
          <CreateTeamModal
            onClose={() => setShowCreateTeamModal(false)}
            onSubmit={handleCreateTeam}
            departments={departments}
            users={users}
          />
        )}

        {/* Edit Department Modal */}
        {showEditDepartmentModal && editingDepartment && (
          <EditDepartmentModal
            onClose={() => {
              setShowEditDepartmentModal(false);
              setEditingDepartment(null);
            }}
            onSubmit={handleUpdateDepartment}
            department={editingDepartment}
          />
        )}

        {/* Edit Team Modal */}
        {showEditTeamModal && editingTeam && (
          <EditTeamModal
            onClose={() => {
              setShowEditTeamModal(false);
              setEditingTeam(null);
            }}
            onSubmit={handleUpdateTeam}
            team={editingTeam}
            departments={departments}
            users={users}
          />
        )}

        {/* Edit User Modal */}
        {showEditUserModal && editingUser && (
          <EditUserModal
            onClose={() => {
              setShowEditUserModal(false);
              setEditingUser(null);
            }}
            onSubmit={handleUpdateUser}
            user={editingUser}
            departments={departments}
            teams={teams}
            users={users}
          />
        )}

        {/* Edit User Modal */}
        {showEditUserModal && editingUser && (
          <EditUserModal
            onClose={() => {
              setShowEditUserModal(false);
              setEditingUser(null);
            }}
            onSubmit={handleUpdateUser}
            user={editingUser}
            departments={departments}
            teams={teams}
            users={users}
          />
        )}

        {/* Assign Supervisor Modal */}
        {showAssignSupervisorModal && (
          <AssignSupervisorModal
            onClose={() => {
              setShowAssignSupervisorModal(false);
              setSupervisorToAssign({ teamId: null, userId: null });
            }}
            onSubmit={(userId) => handleAssignSupervisor(supervisorToAssign.teamId, userId)}
            users={users}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmModal && (
          <DeleteConfirmModal
            onClose={() => {
              setShowDeleteConfirmModal(false);
              setUserToDelete(null);
              setTeamToDelete(null);
              setConsultantToDelete(null);
            }}
            onConfirm={() => {
              if (userToDelete) {
                confirmDeleteUser();
              } else if (teamToDelete) {
                confirmDeleteTeam();
              } else if (consultantToDelete) {
                confirmDeleteConsultant();
              }
            }}
            type={userToDelete ? 'user' : teamToDelete ? 'team' : 'consultant'}
          />
        )}

        {/* Review Registration Request Modal */}
        {showReviewRequestModal && selectedRequest && (
          <ReviewRequestModal
            onClose={() => {
              setShowReviewRequestModal(false);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
          />
        )}
      </div>
    </div>
  );
};

// Create User Modal Component
const CreateUserModal = ({ onClose, onSubmit, departments, teams }) => {
  const { showError } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee', // Only allow creating employees initially
    name: '',
    age: '',
    sex: '',
    department_id: '',
    team_id: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation schema for user creation
  const validationSchema = {
    username: [validationRules.required, validationRules.email],
    email: [validationRules.required, validationRules.email],
    password: [validationRules.required, validationRules.password],
    name: [validationRules.required, validationRules.name],
    age: [validationRules.required, (value) => validationRules.number(value, 'Age', 18, 100)],
    sex: [validationRules.select]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    if (validationSchema[name]) {
      const fieldErrors = validateForm({ [name]: value }, { [name]: validationSchema[name] });
      if (fieldErrors[name]) {
        setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ username: true, email: true, password: true, name: true, age: true, sex: true });
    
    // Validate entire form
    const formErrors = validateForm(formData, validationSchema);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      showError("Please fix the errors in the form");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        role: 'employee', // Always create as employee
        age: parseInt(formData.age),
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        team_id: formData.team_id ? parseInt(formData.team_id) : null
      });
    } catch (error) {
      showError(error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#212121]">Create New Employee</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#212121] font-medium mb-2">Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.name && errors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter full name"
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Username/Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
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
            <label className="block text-[#212121] font-medium mb-2">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.email && errors.email 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter email address"
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
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
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.password && errors.password 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter password"
            />
            {touched.password && errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Age <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              onBlur={handleBlur}
              min="18"
              max="100"
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.age && errors.age 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter age"
            />
            {touched.age && errors.age && (
              <p className="text-red-500 text-sm mt-1">{errors.age}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Sex <span className="text-red-500">*</span></label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.sex && errors.sex 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
            >
              <option value="">Select sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {touched.sex && errors.sex && (
              <p className="text-red-500 text-sm mt-1">{errors.sex}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Department</label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Team</label>
            <select
              name="team_id"
              value={formData.team_id}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select team</option>
              {teams.filter(team => !formData.department_id || team.department_id == formData.department_id).map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Employee'}
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

// Create Consultant Modal Component
const CreateConsultantModal = ({ onClose, onSubmit }) => {
  const { showError } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    registration_number: '',
    hospital: '',
    specialization: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation schema for consultant creation
  const validationSchema = {
    username: [validationRules.required, validationRules.email],
    email: [validationRules.required, validationRules.email],
    password: [validationRules.required, validationRules.password],
    registration_number: [validationRules.required, (value) => validationRules.textLength(value, 'Registration Number', 5, 20)],
    hospital: [validationRules.required, (value) => validationRules.textLength(value, 'Hospital', 2, 100)],
    specialization: [validationRules.required, (value) => validationRules.textLength(value, 'Specialization', 2, 100)]
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({ username: true, email: true, password: true, registration_number: true, hospital: true, specialization: true });
    
    const formErrors = validateForm(formData, validationSchema);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      showError("Please fix the errors in the form");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      showError(error.message || 'Failed to create consultant');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#212121]">Create New Consultant</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#212121] font-medium mb-2">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.email && errors.email 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter email address"
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
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
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.password && errors.password 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter password"
            />
            {touched.password && errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Registration Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
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
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
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
          <div>
            <label className="block text-[#212121] font-medium mb-2">Specialization <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.specialization && errors.specialization 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter specialization"
            />
            {touched.specialization && errors.specialization && (
              <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>
            )}
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Consultant'}
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

// Create Department Modal Component
const CreateDepartmentModal = ({ onClose, onSubmit }) => {
  const { showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation schema for department creation
  const validationSchema = {
    name: [validationRules.required, (value) => validationRules.textLength(value, 'Department Name', 2, 100)],
    description: [(value) => validationRules.textLength(value, 'Description', 0, 500)]
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({ name: true, description: true });
    
    const formErrors = validateForm(formData, validationSchema);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      showError("Please fix the errors in the form");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      showError(error.message || 'Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#212121]">Create New Department</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#212121] font-medium mb-2">Department Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.name && errors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter department name"
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.description && errors.description 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              rows="3"
              placeholder="Enter department description (optional)"
            />
            {touched.description && errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Department'}
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

// Create Team Modal Component
const CreateTeamModal = ({ onClose, onSubmit, departments, users }) => {
  const { showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department_id: '',
    employees: [],
    supervisor_id: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation schema for team creation
  const validationSchema = {
    name: [validationRules.required, (value) => validationRules.textLength(value, 'Team Name', 2, 100)],
    description: [(value) => validationRules.textLength(value, 'Description', 0, 500)],
    department_id: [validationRules.select]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleEmployeeChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, employees: selectedOptions });
    if (errors.employees) {
      setErrors(prev => ({ ...prev, employees: null }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, description: true, department_id: true, employees: true });
    const formErrors = validateForm(formData, validationSchema);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) {
      showError("Please fix the errors in the form");
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        department_id: parseInt(formData.department_id),
        employees: formData.employees.map(emp => parseInt(emp)),
        supervisor_id: formData.supervisor_id ? parseInt(formData.supervisor_id) : null
      });
    } catch (error) {
      showError(error.message || 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available employees (not already in a team)
  const availableEmployees = users.filter(user => 
    user.role === 'employee' && !user.team_id
  );

  // Get available supervisors (employees who are not already supervisors elsewhere)
  const otherSupervisors = users.filter(u => 
    u.role === 'supervisor' && u.team_id
  );
  const otherSupervisorIds = new Set(otherSupervisors.map(u => u.id));
  
  const availableSupervisors = users.filter(user =>
    user.role === 'employee' && !otherSupervisorIds.has(user.id)
  );

  console.log('CreateTeamModal debug:', {
    users: users.length,
    otherSupervisors: otherSupervisors.length,
    availableSupervisors: availableSupervisors.length,
    availableSupervisors,
    allEmployees: users.filter(u => u.role === 'employee').length
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#212121]">Create New Team</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#212121] font-medium mb-2">Team Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.name && errors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter team name"
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Department *</label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.department_id && errors.department_id 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            {touched.department_id && errors.department_id && (
              <p className="text-red-500 text-sm mt-1">{errors.department_id}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Employees</label>
            <select
              multiple
              value={formData.employees}
              onChange={handleEmployeeChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              size="4"
            >
              {availableEmployees.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || user.username} ({user.email})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple employees</p>
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Supervisor (Optional)</label>
            <select
              name="supervisor_id"
              value={formData.supervisor_id}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select supervisor</option>
              {availableSupervisors.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || user.username} ({user.email})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Employee will be promoted to supervisor</p>
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.description && errors.description 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              rows="3"
              placeholder="Enter team description (optional)"
            />
            {touched.description && errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Team'}
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

// Edit Department Modal Component
const EditDepartmentModal = ({ onClose, onSubmit, department }) => {
  const { showError } = useToast();
  const [formData, setFormData] = useState({
    name: department.name,
    description: department.description || ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation schema for department editing
  const validationSchema = {
    name: [validationRules.required, (value) => validationRules.textLength(value, 'Department Name', 2, 100)],
    description: [(value) => validationRules.textLength(value, 'Description', 0, 500)]
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({ name: true, description: true });
    
    const formErrors = validateForm(formData, validationSchema);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      showError("Please fix the errors in the form");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      showError(error.message || 'Failed to update department');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#212121]">Edit Department</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#212121] font-medium mb-2">Department Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.name && errors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter department name"
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.description && errors.description 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              rows="3"
              placeholder="Enter department description (optional)"
            />
            {touched.description && errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Department'}
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

// Edit Team Modal Component
const EditTeamModal = ({ onClose, onSubmit, team, departments, users }) => {
  const { showError } = useToast();
  
  console.log('EditTeamModal props:', { 
    team, 
    teamKeys: Object.keys(team),
    teamSupervisorId: team.supervisor_id,
    teamDepartmentId: team.department_id,
    departments: departments.length, 
    users: users.length 
  });
  
  // Get current team members from users array
  const currentTeamMembers = users.filter(user => user.team_id === team.id);
  
  const [formData, setFormData] = useState({
    name: team.name,
    description: team.description || '',
    department_id: team.department_id ? team.department_id.toString() : '',
    employees: currentTeamMembers.map(emp => emp.id.toString()),
    supervisor_id: team.supervisor_id ? team.supervisor_id.toString() : ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation schema for team editing
  const validationSchema = {
    name: [validationRules.required, (value) => validationRules.textLength(value, 'Team Name', 2, 100)],
    description: [(value) => validationRules.textLength(value, 'Description', 0, 500)],
    department_id: [validationRules.select]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleEmployeeChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, employees: selectedOptions });
    if (errors.employees) {
      setErrors(prev => ({ ...prev, employees: null }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, description: true, department_id: true, employees: true });
    const formErrors = validateForm(formData, validationSchema);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) {
      showError("Please fix the errors in the form");
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        department_id: parseInt(formData.department_id),
        employees: formData.employees.map(emp => parseInt(emp)),
        supervisor_id: formData.supervisor_id ? parseInt(formData.supervisor_id) : null
      });
    } catch (error) {
      showError(error.message || 'Failed to update team');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available employees (current team members + unassigned employees)
  const availableEmployees = users.filter(user => 
    user.role === 'employee' && (user.team_id === team.id || !user.team_id)
  );

  // Get available supervisors (all employees who are not already supervisors elsewhere)
  const otherSupervisors = users.filter(u => 
    u.role === 'supervisor' && u.team_id && u.team_id !== team.id
  );
  const otherSupervisorIds = new Set(otherSupervisors.map(u => u.id));
  
  // Include current supervisor and all employees who are not supervisors elsewhere
  const availableSupervisors = users.filter(user =>
    user.role === 'employee' && 
    (user.id === team.supervisor_id || !otherSupervisorIds.has(user.id))
  );

  // Temporary: show all users for debugging
  const allUsers = users.filter(user => user.role === 'employee');

  console.log('EditTeamModal debug:', {
    users: users.length,
    team,
    otherSupervisors: otherSupervisors.length,
    availableSupervisors: availableSupervisors.length,
    availableSupervisors,
    allEmployees: users.filter(u => u.role === 'employee').length,
    teamSupervisorId: team.supervisor_id
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#212121]">Edit Team</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#212121] font-medium mb-2">Team Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.name && errors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter team name"
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Department *</label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.department_id && errors.department_id 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            {touched.department_id && errors.department_id && (
              <p className="text-red-500 text-sm mt-1">{errors.department_id}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Employees</label>
            <select
              multiple
              value={formData.employees}
              onChange={handleEmployeeChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              size="4"
            >
              {availableEmployees.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || user.username} ({user.email})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple employees</p>
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Supervisor (Optional)</label>
            <select
              name="supervisor_id"
              value={formData.supervisor_id}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select supervisor</option>
              {availableSupervisors.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || user.username} ({user.email})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Employee will be promoted to supervisor</p>
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.description && errors.description 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              rows="3"
              placeholder="Enter team description (optional)"
            />
            {touched.description && errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Team'}
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

// Edit User Modal Component
const EditUserModal = ({ onClose, onSubmit, user, departments, teams, users }) => {
  const { showError } = useToast();
  const [formData, setFormData] = React.useState({
    name: user.name || '',
    email: user.email || '',
    department_id: user.department_id ? user.department_id.toString() : '',
    team_id: user.team_id ? user.team_id.toString() : '',
    role: user.role,
  });
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Validation schema for user editing
  const validationSchema = {
    name: [validationRules.required, (value) => validationRules.textLength(value, 'Name', 2, 100)],
    email: [validationRules.required, validationRules.email],
    department_id: [validationRules.select],
    // team_id is optional
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, department_id: true });
    const formErrors = validateForm(formData, validationSchema);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) {
      showError('Please fix the errors in the form');
      return;
    }
    try {
      setIsSubmitting(true);
      // If department changed, remove from all teams and demote from supervisor
      let updateData = {
        name: formData.name,
        email: formData.email,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        team_id: formData.team_id ? parseInt(formData.team_id) : null,
        role: formData.role,
      };
      if (user.department_id && formData.department_id && user.department_id.toString() !== formData.department_id) {
        // Department changed: remove from all teams and demote from supervisor
        updateData.team_id = null;
        updateData.role = 'employee';
      }
      // If role is demoted from supervisor, also remove as supervisor from any teams
      if (user.role === 'supervisor' && formData.role !== 'supervisor') {
        updateData.role = formData.role;
        updateData.team_id = null;
      }
      await onSubmit(updateData);
    } catch (error) {
      showError(error.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show teams in the selected department
  const filteredTeams = teams.filter(team => formData.department_id && team.department_id.toString() === formData.department_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#212121]">Edit User</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#212121] font-medium mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.name && errors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter name"
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.email && errors.email 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter email"
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Department *</label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.department_id && errors.department_id 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            {touched.department_id && errors.department_id && (
              <p className="text-red-500 text-sm mt-1">{errors.department_id}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Team</label>
            <select
              name="team_id"
              value={formData.team_id}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No team</option>
              {filteredTeams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="employee">Employee</option>
              <option value="supervisor">Supervisor</option>
              <option value="hr_manager">HR Manager</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update User'}
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

// Assign Supervisor Modal Component
const AssignSupervisorModal = ({ onClose, onSubmit, users }) => {
  const { showError } = useToast();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableEmployees = users.filter(user => user.role === 'employee');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      showError('Please select a supervisor');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit(parseInt(selectedUserId));
      onClose();
    } catch (error) {
      showError(error.message || 'Failed to assign supervisor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#212121]">Assign Supervisor</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#212121] font-medium mb-2">Select Employee</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an employee</option>
              {availableEmployees.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !selectedUserId}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Assigning...' : 'Assign Supervisor'}
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

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ onClose, onConfirm, type }) => {
  const getTitle = () => {
    if (type === 'user') return 'Delete User';
    if (type === 'team') return 'Delete Team';
    if (type === 'consultant') return 'Delete Consultant';
    return 'Delete Item';
  };

  const getMessage = () => {
    if (type === 'user') {
      return 'Are you sure you want to delete this user? This action cannot be undone.';
    } else if (type === 'team') {
      return 'Are you sure you want to delete this team? This will remove all team assignments and demote the supervisor.';
    } else if (type === 'consultant') {
      return 'Are you sure you want to delete this consultant? This action cannot be undone.';
    }
    return 'Are you sure you want to delete this item? This action cannot be undone.';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-[#212121] mb-4">{getTitle()}</h3>
          <p className="text-gray-600 mb-6">{getMessage()}</p>
          <div className="flex space-x-3">
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to check for overlapping time slots
function hasOverlappingTimeSlots(availabilities) {
  // Group by day
  const byDay = {};
  for (const slot of availabilities) {
    if (!byDay[slot.day_of_week]) byDay[slot.day_of_week] = [];
    byDay[slot.day_of_week].push(slot);
  }
  // For each day, check for overlaps
  for (const slots of Object.values(byDay)) {
    // Sort by start_time
    const sorted = slots.slice().sort((a, b) => a.start_time.localeCompare(b.start_time));
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        // If startA < endB && startB < endA => overlap
        if (
          sorted[i].start_time < sorted[j].end_time &&
          sorted[j].start_time < sorted[i].end_time
        ) {
          return true;
        }
        // If exact duplicate
        if (
          sorted[i].start_time === sorted[j].start_time &&
          sorted[i].end_time === sorted[j].end_time
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

// Create Consultant with Availability Modal Component
const CreateConsultantWithAvailabilityModal = ({ onClose, onSubmit }) => {
  const { showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    qualifications: '',
    registration_number: '',
    hospital: '',
    specialization: '',
    availabilities: []
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overlapError, setOverlapError] = useState('');

  const daysOfWeek = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const validationErrors = validateForm({ [name]: formData[name] }, validationRules[name]);
    setErrors(prev => ({ ...prev, [name]: validationErrors[name] }));
  };

  const addAvailability = () => {
    setFormData(prev => ({
      ...prev,
      availabilities: [...prev.availabilities, {
        day_of_week: 0,
        start_time: '09:00',
        end_time: '17:00'
      }]
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
      availabilities: prev.availabilities.map((avail, i) => 
        i === index ? { ...avail, [field]: value } : avail
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['name', 'qualifications', 'registration_number', 'hospital', 'specialization'];
    const newErrors = {};
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} is required`;
      }
    });

    if (formData.availabilities.length === 0) {
      newErrors.availabilities = 'At least one availability period is required';
    }

    // Overlap/duplicate check
    if (hasOverlappingTimeSlots(formData.availabilities)) {
      setOverlapError('There are overlapping or duplicate time slots.');
      return;
    } else {
      setOverlapError('');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      showError(error.message || 'Failed to create consultant');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#212121]">Add New Consultant</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#212121] font-medium mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  touched.name && errors.name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
                placeholder="Enter consultant name"
              />
              {touched.name && errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-[#212121] font-medium mb-2">Registration Number *</label>
              <input
                type="text"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#212121] font-medium mb-2">Hospital *</label>
              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
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
            <div>
              <label className="block text-[#212121] font-medium mb-2">Specialization *</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  touched.specialization && errors.specialization 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
                placeholder="Enter specialization"
              />
              {touched.specialization && errors.specialization && (
                <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Qualifications *</label>
            <textarea
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="3"
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.qualifications && errors.qualifications 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter qualifications"
            />
            {touched.qualifications && errors.qualifications && (
              <p className="text-red-500 text-sm mt-1">{errors.qualifications}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-[#212121] font-medium">Availability Schedule *</label>
              <button
                type="button"
                onClick={addAvailability}
                className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm"
              >
                Add Time Slot
              </button>
            </div>
            {errors.availabilities && (
              <p className="text-red-500 text-sm mb-2">{errors.availabilities}</p>
            )}
            <div className="space-y-3">
              {formData.availabilities.map((availability, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-[#212121]">Time Slot {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeAvailability(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                      <select
                        value={availability.day_of_week}
                        onChange={(e) => updateAvailability(index, 'day_of_week', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {daysOfWeek.map(day => (
                          <option key={day.value} value={day.value}>{day.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={availability.start_time}
                        onChange={(e) => updateAvailability(index, 'start_time', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={availability.end_time}
                        onChange={(e) => updateAvailability(index, 'end_time', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <span className="text-sm text-gray-500">Time slot</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {overlapError && (
              <p className="text-red-500 text-sm mb-2">{overlapError}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Consultant'}
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

// Edit Consultant Modal Component
const EditConsultantModal = ({ onClose, onSubmit, consultant }) => {
  const { showError } = useToast();
  const [formData, setFormData] = useState({
    name: consultant.name,
    qualifications: consultant.qualifications,
    registration_number: consultant.registration_number,
    hospital: consultant.hospital,
    specialization: consultant.specialization,
    availabilities: consultant.availabilities || []
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overlapError, setOverlapError] = useState('');

  const daysOfWeek = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const validationErrors = validateForm({ [name]: formData[name] }, validationRules[name]);
    setErrors(prev => ({ ...prev, [name]: validationErrors[name] }));
  };

  const addAvailability = () => {
    setFormData(prev => ({
      ...prev,
      availabilities: [...prev.availabilities, {
        day_of_week: 0,
        start_time: '09:00',
        end_time: '17:00'
      }]
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
      availabilities: prev.availabilities.map((avail, i) => 
        i === index ? { ...avail, [field]: value } : avail
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['name', 'qualifications', 'registration_number', 'hospital', 'specialization'];
    const newErrors = {};
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} is required`;
      }
    });

    if (formData.availabilities.length === 0) {
      newErrors.availabilities = 'At least one availability period is required';
    }

    // Overlap/duplicate check
    if (hasOverlappingTimeSlots(formData.availabilities)) {
      setOverlapError('There are overlapping or duplicate time slots.');
      return;
    } else {
      setOverlapError('');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      showError(error.message || 'Failed to update consultant');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#212121]">Edit Consultant</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#212121] font-medium mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  touched.name && errors.name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
                placeholder="Enter consultant name"
              />
              {touched.name && errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-[#212121] font-medium mb-2">Registration Number *</label>
              <input
                type="text"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#212121] font-medium mb-2">Hospital *</label>
              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
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
            <div>
              <label className="block text-[#212121] font-medium mb-2">Specialization *</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  touched.specialization && errors.specialization 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
                placeholder="Enter specialization"
              />
              {touched.specialization && errors.specialization && (
                <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Qualifications *</label>
            <textarea
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="3"
              className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.qualifications && errors.qualifications 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter qualifications"
            />
            {touched.qualifications && errors.qualifications && (
              <p className="text-red-500 text-sm mt-1">{errors.qualifications}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-[#212121] font-medium">Availability Schedule *</label>
              <button
                type="button"
                onClick={addAvailability}
                className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm"
              >
                Add Time Slot
              </button>
            </div>
            {errors.availabilities && (
              <p className="text-red-500 text-sm mb-2">{errors.availabilities}</p>
            )}
            <div className="space-y-3">
              {formData.availabilities.map((availability, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-[#212121]">Time Slot {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeAvailability(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                      <select
                        value={availability.day_of_week}
                        onChange={(e) => updateAvailability(index, 'day_of_week', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {daysOfWeek.map(day => (
                          <option key={day.value} value={day.value}>{day.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={availability.start_time}
                        onChange={(e) => updateAvailability(index, 'start_time', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={availability.end_time}
                        onChange={(e) => updateAvailability(index, 'end_time', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <span className="text-sm text-gray-500">Time slot</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {overlapError && (
              <p className="text-red-500 text-sm mb-2">{overlapError}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Consultant'}
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

// Review Registration Request Modal Component
const ReviewRequestModal = ({ onClose, request }) => {
  const { showSuccess, showError } = useToast();
  const [action, setAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!action) {
      showError('Please select an action (approve or reject)');
      return;
    }
    
    if (action === 'reject' && !rejectionReason.trim()) {
      showError('Please provide a reason for rejection');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const apiService = (await import('../utils/api')).default;
      await apiService.reviewRegistrationRequest(request.id, {
        action,
        rejection_reason: action === 'reject' ? rejectionReason : null
      });
      
      showSuccess(`Registration request ${action}d successfully`);
      onClose();
      
      // Refresh the page to update the data
      window.location.reload();
    } catch (error) {
      showError(error.message || `Failed to ${action} registration request`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#212121]">Review Registration Request</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Personal Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#212121] mb-3">Personal Information</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {request.first_name} {request.last_name}</div>
              <div><strong>Gender:</strong> {request.gender}</div>
              <div><strong>NIC:</strong> {request.nic}</div>
              <div><strong>Birthday:</strong> {new Date(request.birthday).toLocaleDateString()}</div>
              <div><strong>Contact:</strong> {request.contact || 'Not provided'}</div>
            </div>
          </div>
          
          {/* Job Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#212121] mb-3">Job Information</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Job Role:</strong> {request.job_role}</div>
              <div><strong>Employee ID:</strong> {request.employee_id || 'Not provided'}</div>
              <div><strong>Department:</strong> {request.department || 'Not provided'}</div>
              <div><strong>Team:</strong> {request.team || 'Not provided'}</div>
              <div><strong>Address:</strong> {request.address || 'Not provided'}</div>
              <div><strong>Supervisor:</strong> {request.supervisor_name || 'Not provided'}</div>
            </div>
          </div>
          
          {/* Consultant Information (if applicable) */}
          {(request.job_role === 'Consultant' || request.job_role === 'Psychiatrist') && (
            <div className="bg-purple-50 rounded-lg p-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-[#212121] mb-3">Consultant Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Registration Number:</strong> {request.registration_number || 'Not provided'}</div>
                <div><strong>Hospital:</strong> {request.hospital || 'Not provided'}</div>
              </div>
            </div>
          )}
          
          {/* Account Information */}
          <div className="bg-yellow-50 rounded-lg p-4 md:col-span-2">
            <h3 className="text-lg font-semibold text-[#212121] mb-3">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Username:</strong> {request.username}</div>
              <div><strong>Email:</strong> {request.email}</div>
              <div><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  request.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : request.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {request.status}
                </span>
              </div>
              <div><strong>Submitted:</strong> {new Date(request.submitted_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        {request.status === 'pending' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#212121] font-medium mb-2">Action *</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="action"
                    value="approve"
                    checked={action === 'approve'}
                    onChange={(e) => setAction(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-green-600 font-medium">Approve</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="action"
                    value="reject"
                    checked={action === 'reject'}
                    onChange={(e) => setAction(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-red-600 font-medium">Reject</span>
                </label>
              </div>
            </div>
            
            {action === 'reject' && (
              <div>
                <label className="block text-[#212121] font-medium mb-2">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows="3"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
            )}
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : `Confirm ${action}`}
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
        )}
        
        {request.status !== 'pending' && (
          <div className="pt-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#212121] mb-2">Review Details</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Status:</strong> {request.status}</div>
                {request.reviewed_at && (
                  <div><strong>Reviewed:</strong> {new Date(request.reviewed_at).toLocaleString()}</div>
                )}
                {request.rejection_reason && (
                  <div><strong>Rejection Reason:</strong> {request.rejection_reason}</div>
                )}
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={onClose}
                className="bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 