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

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

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
    return await this.request('/admin/departments');
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

  async assignSupervisor(teamId, userId) {
    return await this.request(`/admin/teams/${teamId}/supervisor/${userId}`, {
      method: 'PUT',
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

  // Stress endpoints
  async submitStressScore(stressData) {
    return await this.request('/stress/submit', {
      method: 'POST',
      body: JSON.stringify(stressData),
    });
  }

  async getMyStress() {
    return await this.request('/stress/my');
  }

  async getStressByRole(role) {
    console.log(`API: Getting stress data for role: ${role}`);
    switch (role) {
      case 'employee':
        return await this.request('/stress/my');
      case 'supervisor':
        return await this.request('/dashboard/supervisor/stress');
      case 'psychiatrist':
        return await this.request('/dashboard/psychiatrist/stress');
      case 'hr_manager':
        return await this.request('/dashboard/hr/stress');
      default:
        console.log(`API: Unknown role ${role}, defaulting to employee`);
        return await this.request('/stress/my');
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