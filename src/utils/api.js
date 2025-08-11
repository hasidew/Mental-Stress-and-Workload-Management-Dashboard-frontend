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
        
        // Create a more detailed error object
        const error = new Error();
        error.status = response.status;
        error.response = { data: errorData };
        
        console.error('API Error - Status:', response.status);
        console.error('API Error - Data:', errorData);
        
        // Handle different types of error responses
        if (errorData.detail) {
          error.message = String(errorData.detail);
        } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
          // Handle validation errors
          const errorMessages = [];
          for (const [field, messages] of Object.entries(errorData)) {
            console.error(`API Error - Field ${field}:`, messages);
            if (Array.isArray(messages)) {
              messages.forEach(message => {
                if (typeof message === 'string') {
                  errorMessages.push(message);
                } else if (message && typeof message === 'object' && message.msg) {
                  errorMessages.push(String(message.msg));
                } else {
                  console.error('API Error - Unexpected message format:', message);
                }
              });
            } else if (typeof messages === 'string') {
              errorMessages.push(messages);
            } else if (messages && typeof messages === 'object' && messages.msg) {
              errorMessages.push(String(messages.msg));
            } else {
              console.error('API Error - Unexpected messages format:', messages);
            }
          }
          error.message = errorMessages.join(', ');
        } else {
          error.message = `HTTP error! status: ${response.status}`;
        }
        
        console.error('API Error - Final message:', error.message);
        throw error;
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

  async getHrDashboardTest() {
    return await this.request('/dashboard/hr/test');
  }

  async getDatabaseCheck() {
    return await this.request('/dashboard/db-check');
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

  async hrBookPsychiatrist(bookingData) {
    return await this.request('/dashboard/hr/book-psychiatrist', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getHrMyBookings() {
    return await this.request('/dashboard/hr/my-bookings');
  }

  async hrBookForEmployee(employeeId, bookingData) {
    return await this.request('/dashboard/hr/book-psychiatrist-for-employee', {
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
    // Use HR endpoint for HR managers, admin endpoint for admins
    const userRole = this.getUserRole();
    const endpoint = userRole === 'hr_manager' ? '/hr/consultants/with-availability' : '/admin/consultants/with-availability';
    return await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(consultantData),
    });
  }

  async getAllConsultants() {
    // Use HR endpoint for HR managers, admin endpoint for admins
    const userRole = this.getUserRole();
    const endpoint = userRole === 'hr_manager' ? '/hr/consultants' : '/admin/consultants';
    return await this.request(endpoint);
  }

  async getConsultant(consultantId) {
    // Use HR endpoint for HR managers, admin endpoint for admins
    const userRole = this.getUserRole();
    const endpoint = userRole === 'hr_manager' ? `/hr/consultants/${consultantId}` : `/admin/consultants/${consultantId}`;
    return await this.request(endpoint);
  }

  async updateConsultant(consultantId, consultantData) {
    // Use HR endpoint for HR managers, admin endpoint for admins
    const userRole = this.getUserRole();
    const endpoint = userRole === 'hr_manager' ? `/hr/consultants/${consultantId}` : `/admin/consultants/${consultantId}`;
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(consultantData),
    });
  }

  async deleteConsultant(consultantId) {
    // Use HR endpoint for HR managers, admin endpoint for admins
    const userRole = this.getUserRole();
    const endpoint = userRole === 'hr_manager' ? `/hr/consultants/${consultantId}` : `/admin/consultants/${consultantId}`;
    return await this.request(endpoint, {
      method: 'DELETE',
    });
  }

  async getConsultantBookings(consultantId) {
    return await this.request(`/hr/consultants/${consultantId}/bookings`);
  }

  async getConsultantAvailableTimes(consultantId, date) {
    return await this.request(`/hr/consultants/${consultantId}/available-times?date=${date}`);
  }

  // Psychiatrist management
  async createPsychiatristWithAvailability(psychiatristData) {
    // Use HR endpoint for HR managers, admin endpoint for admins
    const userRole = this.getUserRole();
    const endpoint = userRole === 'hr_manager' ? '/hr/psychiatrists/with-availability' : '/admin/psychiatrists/with-availability';
    console.log('API: Creating psychiatrist with data:', psychiatristData);
    console.log('API: Using endpoint:', endpoint);
    console.log('API: Data being sent:', JSON.stringify(psychiatristData, null, 2));
    return await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(psychiatristData),
    });
  }

  async getAllPsychiatrists() {
    // Use HR endpoint for HR managers, admin endpoint for admins
    const userRole = this.getUserRole();
    const endpoint = userRole === 'hr_manager' ? '/hr/psychiatrists' : '/admin/psychiatrists';
    return await this.request(endpoint);
  }

  async getPsychiatrist(psychiatristId) {
    // Use HR endpoint for HR managers, admin endpoint for admins
    const userRole = this.getUserRole();
    const endpoint = userRole === 'hr_manager' ? `/hr/psychiatrists/${psychiatristId}` : `/admin/psychiatrists/${psychiatristId}`;
    return await this.request(endpoint);
  }

  async updatePsychiatrist(psychiatristId, psychiatristData) {
    // Use HR endpoint for HR managers, admin endpoint for admins
    const userRole = this.getUserRole();
    const endpoint = userRole === 'hr_manager' ? `/hr/psychiatrists/${psychiatristId}` : `/admin/psychiatrists/${psychiatristId}`;
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(psychiatristData),
    });
  }

  async deletePsychiatrist(psychiatristId) {
    // Use HR endpoint for HR managers, admin endpoint for admins
    const userRole = this.getUserRole();
    const endpoint = userRole === 'hr_manager' ? `/hr/psychiatrists/${psychiatristId}` : `/admin/psychiatrists/${psychiatristId}`;
    return await this.request(endpoint, {
      method: 'DELETE',
    });
  }

  async getPsychiatristBookings(psychiatristId) {
    return await this.request(`/hr/psychiatrists/${psychiatristId}/bookings`);
  }

  async getPsychiatristAvailableTimes(psychiatristId, date) {
    return await this.request(`/hr/psychiatrists/${psychiatristId}/available-times?date=${date}`);
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

  async getWorkloadDetails() {
    return await this.request('/stress/workload-details');
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

  // Psychiatrist endpoints
  async getAvailablePsychiatrists() {
    return await this.request('/psychiatrist/available');
  }

  async getPsychiatristTimetable(psychiatristId, date) {
    return await this.request(`/psychiatrist/${psychiatristId}/timetable?date=${date}`);
  }

  async bookPsychiatrist(bookingData) {
    return await this.request('/psychiatrist/book', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getMyPsychiatristBookings() {
    return await this.request('/psychiatrist/my-bookings');
  }

  async updatePsychiatristBooking(bookingId, bookingData) {
    return await this.request(`/psychiatrist/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  }

  async cancelPsychiatristBooking(bookingId) {
    return await this.request(`/psychiatrist/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  }

  async bookPsychiatristForEmployee(bookingData, employeeId) {
    return await this.request(`/psychiatrist/book-for-employee?employee_id=${employeeId}`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getTeamPsychiatristBookings() {
    return await this.request('/psychiatrist/team-bookings');
  }

  // Psychiatrist approval methods
  async getMyPendingBookings() {
    return await this.request('/psychiatrist/my-pending-bookings');
  }

  async approveBooking(bookingId, approvalData) {
    return await this.request(`/psychiatrist/bookings/${bookingId}/approve`, {
      method: 'PUT',
      body: JSON.stringify(approvalData),
    });
  }

  // New psychiatrist dashboard methods
  async getPsychiatristDashboard() {
    return await this.request('/psychiatrist/dashboard');
  }

  async getMySessions() {
    return await this.request('/psychiatrist/my-sessions');
  }

  async getPendingRequests() {
    return await this.request('/psychiatrist/pending-requests');
  }

  async completeSession(bookingId) {
    return await this.request(`/psychiatrist/bookings/${bookingId}/complete`, {
      method: 'PUT',
    });
  }

  // Notification methods
  async getMyNotifications() {
    return await this.request('/notifications/my-notifications');
  }

  async getUnreadNotificationCount() {
    return await this.request('/notifications/my-unread-count');
  }

  async markNotificationRead(notificationId) {
    return await this.request(`/notifications/${notificationId}/mark-read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return await this.request('/notifications/mark-all-read', {
      method: 'PUT',
    });
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

  getUserRole() {
    if (!this.token) return null;
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.role;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 