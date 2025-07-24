const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  // Get auth headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic request method with role change detection
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    // Add flag to prevent infinite loops
    const isRetry = options.isRetry || false;

    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers: config.headers,
      body: options.body
    });

    try {
      const response = await fetch(url, config);
      
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        
        // Check if it's an access/authorization error and not already a retry
        if ((response.status === 401 || response.status === 403) && !isRetry) {
          console.log('Access error detected, checking for role changes...');
          
          // Try to refresh token directly to avoid loop
          try {
            const refreshResponse = await this.refreshToken();
            if (refreshResponse && refreshResponse.access_token) {
              console.log('Token refreshed during access error, retrying request...');
              
              // Update headers with new token
              config.headers['Authorization'] = `Bearer ${refreshResponse.access_token}`;
              
              // Retry the original request with retry flag
              const retryResponse = await fetch(url, config);
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                console.log('Request succeeded after token refresh');
                return retryData;
              }
            }
          } catch (refreshError) {
            console.log('Token refresh failed during access error:', refreshError);
          }
        }
        
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Success Response:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async refreshToken() {
    // Use direct fetch to avoid loop through request method
    const url = `${this.baseURL}/auth/refresh`;
    const config = {
      method: 'POST',
      headers: this.getHeaders(),
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    
    return data;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  // Registration request endpoints
  async submitRegistrationRequest(requestData) {
    return await this.request('/registration-requests/submit', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getAllRegistrationRequests() {
    return await this.request('/registration-requests/all');
  }

  async getPendingRegistrationRequests() {
    return await this.request('/registration-requests/pending');
  }

  async reviewRegistrationRequest(requestId, reviewData) {
    return await this.request(`/registration-requests/${requestId}/review`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async getRegistrationRequest(requestId) {
    return await this.request(`/registration-requests/${requestId}`);
  }

  // Task management endpoints
  async createTask(taskData) {
    return await this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async getMyTasks() {
    return await this.request('/tasks/my');
  }

  async getTask(taskId) {
    return await this.request(`/tasks/${taskId}`);
  }

  async updateTask(taskId, taskData) {
    return await this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId) {
    return await this.request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async updateTaskStatus(taskId, status) {
    return await this.request(`/tasks/${taskId}/status?status=${status}`, {
      method: 'PATCH',
    });
  }

  // Supervisor task management endpoints
  async supervisorCreateTask(taskData, employeeId) {
    return await this.request(`/tasks/supervisor/assign?employee_id=${employeeId}`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async supervisorGetTeamTasks() {
    return await this.request('/tasks/supervisor/team');
  }

  async supervisorUpdateTask(taskId, taskData) {
    return await this.request(`/tasks/supervisor/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async supervisorDeleteTask(taskId) {
    return await this.request(`/tasks/supervisor/${taskId}`, {
      method: 'DELETE',
    });
  }

  async supervisorGetTeamMembers() {
    return await this.request('/tasks/supervisor/team-members');
  }

  // Dashboard endpoints
  async getEmployeeDashboard() {
    return await this.request('/dashboard/employee');
  }

  async getSupervisorDashboard() {
    return await this.request('/dashboard/supervisor');
  }

  async getPsychiatristDashboard() {
    return await this.request('/dashboard/psychiatrist');
  }

  async getHrDashboard() {
    return await this.request('/dashboard/hr');
  }

  // HR-specific endpoints
  async getHrWorkloads() {
    return await this.request('/dashboard/hr/workloads');
  }

  async addHrWorkload(workloadData) {
    return await this.request('/dashboard/hr/workload', {
      method: 'POST',
      body: JSON.stringify(workloadData),
    });
  }

  async getHrMyWorkloads() {
    return await this.request('/dashboard/hr/my-workloads');
  }

  async hrBookConsultant(bookingData) {
    return await this.request('/dashboard/hr/book-consultant', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getHrMyBookings() {
    return await this.request('/dashboard/hr/my-bookings');
  }

  async hrBookForEmployee(employeeId, bookingData) {
    return await this.request('/dashboard/hr/book-for-employee', {
      method: 'POST',
      body: JSON.stringify({ ...bookingData, employee_id: employeeId }),
    });
  }

  async getAdminDashboard() {
    return await this.request('/admin/dashboard');
  }

  // Admin endpoints
  async createUser(userData) {
    return await this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async createConsultant(consultantData) {
    return await this.request('/admin/consultants', {
      method: 'POST',
      body: JSON.stringify(consultantData),
    });
  }

  async getAllUsers() {
    return await this.request('/admin/users');
  }

  async getUsersByRole(role) {
    return await this.request(`/admin/users/${role}`);
  }

  async updateUser(userId, userData) {
    return await this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return await this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Department management
  async createDepartment(departmentData) {
    return await this.request('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(departmentData),
    });
  }

  async getAllDepartments() {
    return await this.request('/public/departments');
  }

  async updateDepartment(departmentId, departmentData) {
    return await this.request(`/admin/departments/${departmentId}`, {
      method: 'PUT',
      body: JSON.stringify(departmentData),
    });
  }

  // Team management
  async createTeam(teamData) {
    return await this.request('/admin/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async getAllTeams() {
    return await this.request('/admin/teams');
  }

  async getSupervisorLessTeamsByDepartment(departmentId) {
    return await this.request(`/admin/teams/department/${departmentId}/supervisor-less`);
  }

  async updateTeam(teamId, teamData) {
    return await this.request(`/admin/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(teamData),
    });
  }

  async deleteTeam(teamId) {
    return await this.request(`/admin/teams/${teamId}`, {
      method: 'DELETE',
    });
  }

  async assignSupervisor(teamId, userId) {
    return await this.request(`/admin/teams/${teamId}/supervisor/${userId}`, {
      method: 'PUT',
    });
  }

  // Consultant management
  async createConsultantWithAvailability(consultantData) {
    return await this.request('/admin/consultants/with-availability', {
      method: 'POST',
      body: JSON.stringify(consultantData),
    });
  }

  async getAllConsultants() {
    return await this.request('/admin/consultants');
  }

  async getConsultant(consultantId) {
    return await this.request(`/admin/consultants/${consultantId}`);
  }

  async updateConsultant(consultantId, consultantData) {
    return await this.request(`/admin/consultants/${consultantId}`, {
      method: 'PUT',
      body: JSON.stringify(consultantData),
    });
  }

  async deleteConsultant(consultantId) {
    return await this.request(`/admin/consultants/${consultantId}`, {
      method: 'DELETE',
    });
  }

  // Admin registration
  async registerAdmin(adminData) {
    return await this.request('/auth/admin/register', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  // Workload endpoints
  async addDailyWorkload(workloadData) {
    return await this.request('/dashboard/employee/workload', {
      method: 'POST',
      body: JSON.stringify(workloadData),
    });
  }

  async getMyWorkloads() {
    return await this.request('/dashboard/employee/workloads');
  }

  async getWorkloadsByRole(role) {
    console.log(`API: Getting workloads for role: ${role}`);
    switch (role) {
      case 'employee':
        return await this.request('/dashboard/employee/workloads');
      case 'supervisor':
        return await this.request('/dashboard/supervisor/workloads');
      case 'psychiatrist':
        return await this.request('/dashboard/psychiatrist/workloads');
      case 'hr_manager':
        return await this.request('/dashboard/hr/workloads');
      default:
        console.log(`API: Unknown role ${role}, defaulting to employee`);
        return await this.request('/dashboard/employee/workloads');
    }
  }

  async getAllWorkloads() {
    return await this.request('/dashboard/supervisor/workloads');
  }

  // Work endpoints
  async assignWork(workData) {
    return await this.request('/work/assign', {
      method: 'POST',
      body: JSON.stringify(workData),
    });
  }

  async getMyWork() {
    return await this.request('/work/my');
  }

  // Stress assessment endpoints
  async getStressQuestions() {
    return await this.request('/stress/questions');
  }

  async submitStressAssessment(assessmentData) {
    return await this.request('/stress/submit-assessment', {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
  }

  async getMyStressScore() {
    return await this.request('/stress/my-score');
  }

  async updateStressSharing(sharingData) {
    return await this.request('/stress/update-sharing', {
      method: 'PUT',
      body: JSON.stringify(sharingData),
    });
  }

  async getTeamStressScores() {
    return await this.request('/stress/team-scores');
  }

  async getStressHistory() {
    return await this.request('/stress/my-history');
  }

  // Consultant endpoints
  async getAvailableConsultants() {
    return await this.request('/consultant/available');
  }

  async bookConsultation(bookingData) {
    return await this.request('/consultant/book', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getMyBookings() {
    return await this.request('/consultant/my-bookings');
  }

  async updateBooking(bookingId, bookingData) {
    return await this.request(`/consultant/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  }

  async cancelBooking(bookingId) {
    return await this.request(`/consultant/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  }

  async bookForEmployee(employeeId, bookingData) {
    return await this.request(`/consultant/book-for-employee?employee_id=${employeeId}`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getTeamBookings() {
    return await this.request('/consultant/team-bookings');
  }

  // User data refresh with role change detection
  async refreshUserData() {
    try {
      // Use direct fetch to avoid loop through request method
      const url = `${this.baseURL}/users/me`;
      const config = {
        headers: this.getHeaders(),
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const userData = await response.json();
      
      // Check if role changed by comparing with current token
      const currentToken = localStorage.getItem('access_token');
      if (currentToken) {
        const currentUserInfo = this.extractUserInfo(currentToken);
        const currentRole = currentUserInfo?.role;
        const newRole = userData?.role;
        
        if (currentRole && newRole && currentRole !== newRole) {
          console.log(`Role change detected: ${currentRole} → ${newRole}`);
          return {
            roleChanged: true,
            oldRole: currentRole,
            newRole: newRole,
            userData: userData
          };
        }
      }
      
      return {
        roleChanged: false,
        userData: userData
      };
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return {
        roleChanged: false,
        error: error.message
      };
    }
  }

  // Helper method to extract user info from token
  extractUserInfo(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = parts[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      return {
        username: decodedPayload.sub || decodedPayload.username,
        role: decodedPayload.role || decodedPayload.user_role,
        email: decodedPayload.email,
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Psychiatrist endpoints
  async contactPsychiatrist() {
    return await this.request('/psychiatrist/contact', {
      method: 'POST',
    });
  }

  async initiateConsultation(consultationData) {
    return await this.request('/psychiatrist/consult', {
      method: 'POST',
      body: JSON.stringify(consultationData),
    });
  }

  // Logout
  logout() {
    this.setToken(null);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 