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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAdminDashboard();
        setDashboardData(data);
        
        // Fetch all data
        const [usersData, departmentsData, teamsData] = await Promise.all([
          apiService.getAllUsers(),
          apiService.getAllDepartments(),
          apiService.getAllTeams()
        ]);
        
        setUsers(usersData);
        setDepartments(departmentsData);
        setTeams(teamsData);
        
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
      // Refresh data
      const [usersData, departmentsData, teamsData] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllDepartments(),
        apiService.getAllTeams()
      ]);
      setUsers(usersData);
      setDepartments(departmentsData);
      setTeams(teamsData);
    } catch (error) {
      showError(error.message || 'Failed to create user');
    }
  };

  const handleCreateConsultant = async (consultantData) => {
    try {
      await apiService.createConsultant(consultantData);
      showSuccess('Consultant created successfully!');
      setShowCreateConsultantModal(false);
      // Refresh users
      const usersData = await apiService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      showError(error.message || 'Failed to create consultant');
    }
  };

  const handleCreateDepartment = async (departmentData) => {
    try {
      await apiService.createDepartment(departmentData);
      showSuccess('Department created successfully!');
      setShowCreateDepartmentModal(false);
      // Refresh departments
      const departmentsData = await apiService.getAllDepartments();
      setDepartments(departmentsData);
    } catch (error) {
      showError(error.message || 'Failed to create department');
    }
  };

  const handleCreateTeam = async (teamData) => {
    try {
      await apiService.createTeam(teamData);
      showSuccess('Team created successfully!');
      setShowCreateTeamModal(false);
      // Refresh teams
      const teamsData = await apiService.getAllTeams();
      setTeams(teamsData);
    } catch (error) {
      showError(error.message || 'Failed to create team');
    }
  };

  const handleAssignSupervisor = async (teamId, userId) => {
    try {
      await apiService.assignSupervisor(teamId, userId);
      showSuccess('Supervisor assigned successfully!');
      // Refresh teams
      const teamsData = await apiService.getAllTeams();
      setTeams(teamsData);
    } catch (error) {
      showError(error.message || 'Failed to assign supervisor');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiService.deleteUser(userId);
        showSuccess('User deleted successfully!');
        // Refresh users
        const usersData = await apiService.getAllUsers();
        setUsers(usersData);
      } catch (error) {
        showError(error.message || 'Failed to delete user');
      }
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                      {users.map((user) => (
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
                            {!team.supervisor_id && (
                              <button
                                onClick={() => {
                                  const userId = prompt('Enter user ID to assign as supervisor:');
                                  if (userId) {
                                    handleAssignSupervisor(team.id, parseInt(userId));
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-2"
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
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.filter(user => user.role === 'psychiatrist').map((user) => (
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
          <CreateConsultantModal
            onClose={() => setShowCreateConsultantModal(false)}
            onSubmit={handleCreateConsultant}
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
              placeholder="Enter full name"
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Username/Email *</label>
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
              placeholder="Enter email address"
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Password *</label>
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
            <label className="block text-[#212121] font-medium mb-2">Age *</label>
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
            <label className="block text-[#212121] font-medium mb-2">Sex *</label>
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
              placeholder="Enter email address"
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-[#212121] font-medium mb-2">Password *</label>
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

  // Get available employees (not already supervisors)
  const availableEmployees = users.filter(user => 
    user.role === 'employee' && !user.team_id
  );

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
              {availableEmployees.map(user => (
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

export default AdminDashboard; 