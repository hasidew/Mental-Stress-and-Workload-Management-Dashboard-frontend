import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import { validationRules, validateForm } from "../utils/validation";
import { useAuth } from "../contexts/AuthContext";

const SignUp = () => {
  const { showError, showSuccess, showWarning, showInfo } = useToast();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentsError, setDepartmentsError] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    nic: "",
    birthday: "",
    contact: "",
    jobRole: "",
    employeeId: "",
    department: "",
    team: "",
    registrationNumber: "",
    hospital: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        setDepartmentsError(false);
        const apiService = (await import('../utils/api')).default;
        console.log('Fetching departments...');
        const departmentsData = await apiService.getAllDepartments();
        console.log('Departments fetched:', departmentsData);
        
        if (departmentsData && departmentsData.length > 0) {
          setDepartments(departmentsData);
        } else {
          setDepartmentsError(true);
          showWarning('No departments are currently available in the system. User registration is temporarily disabled.');
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        setDepartmentsError(true);
        showError('Failed to load departments. User registration is temporarily disabled.');
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const fetchTeamsByDepartment = async (departmentName) => {
    try {
      const department = departments.find(dept => dept.name === departmentName);
      if (department) {
        const apiService = (await import('../utils/api')).default;
        const data = await apiService.getSupervisorLessTeamsByDepartment(department.id);
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    }
  };

  // Check if signup should be disabled
  const isSignupDisabled = () => {
    return departmentsLoading || departmentsError || departments.length === 0;
  };

  // Check if form submission should be disabled
  const isFormSubmissionDisabled = () => {
    if (isSignupDisabled()) return true;
    
    // Check if teams are available for Employee and Supervisor roles
    if ((role === "Employee" || role === "Supervisor") && form.department && teams.length === 0) {
      return true;
    }
    
    return false;
  };

  // Dynamic validation schema based on selected role
  const getValidationSchema = () => {
    const baseSchema = {
      firstName: [(value) => validationRules.name(value, 'First Name')],
      lastName: [(value) => validationRules.name(value, 'Last Name')],
      gender: [(value) => validationRules.select(value, 'gender')],
      nic: [validationRules.nic],
      birthday: [(value) => validationRules.date(value, 'Birthday')],
      contact: [(value) => {
      if (!value || value.trim() === '') return null; // Optional field
      return validationRules.phone(value);
    }],
      jobRole: [(value) => validationRules.select(value, 'job role')],
      username: [validationRules.email],
      password: [validationRules.password],
      confirmPassword: [validationRules.required, (value) => validationRules.passwordMatch(value, form.password)]
    };

    // Add role-specific validations
    if (role === "Employee" || role === "Supervisor" || role === "HR Manager") {
      baseSchema.employeeId = [(value) => validationRules.required(value, 'Employee ID')];
    }

    if (role === "Employee" || role === "Supervisor") {
      baseSchema.department = [(value) => validationRules.required(value, 'Department')];
    }

    // Team is required for Employee and Supervisor
    if (role === "Employee" || role === "Supervisor") {
      baseSchema.team = [(value) => validationRules.required(value, 'Team')];
    }

    return baseSchema;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "jobRole") {
      setRole(value);
    }

    // Fetch teams when department changes for employees or supervisors
    if (name === "department" && (role === "Supervisor" || role === "Employee")) {
      fetchTeamsByDepartment(value);
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const validationSchema = getValidationSchema();
    if (validationSchema[name]) {
      const fieldErrors = validateForm({ [name]: value }, { [name]: validationSchema[name] });
      if (fieldErrors[name]) {
        setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if signup is disabled
    if (isSignupDisabled()) {
      showError('User registration is currently disabled due to system configuration issues. Please contact the administrator.');
      return;
    }
    
    // Additional check for teams availability for Employee and Supervisor roles
    if ((role === "Employee" || role === "Supervisor") && form.department && teams.length === 0) {
      showError('No teams are available for the selected department. Please contact your administrator to set up teams before proceeding with registration.');
      return;
    }
    
    // Mark all fields as touched
    const allFields = Object.keys(form);
    setTouched(prev => {
      const newTouched = {};
      allFields.forEach(field => newTouched[field] = true);
      return newTouched;
    });
    
    // Debug: Log form data
    console.log('Form data:', form);
    console.log('Role state:', role);
    
    // Validate entire form
    const validationSchema = getValidationSchema();
    const formErrors = validateForm(form, validationSchema);
    setErrors(formErrors);
    
    // Additional check for role selection
    if (!role) {
      showError('Please select a job role first');
      return;
    }
    
    if (Object.keys(formErrors).length > 0) {
      console.log('Validation errors:', formErrors);
      const errorMessages = Object.entries(formErrors).map(([field, error]) => `${field}: ${error}`);
      showError(`Please fix the following errors:\n${errorMessages.join('\n')}`);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Map form data to registration request format
      const requestData = {
        first_name: form.firstName,
        last_name: form.lastName,
        gender: form.gender,
        nic: form.nic,
        birthday: new Date(form.birthday),
        contact: form.contact || undefined,
        job_role: role,
        employee_id: form.employeeId,
        department: form.department,
        team: (role === "Employee" || role === "Supervisor") ? (form.team || undefined) : undefined,
        registration_number: form.registrationNumber || undefined,
        hospital: form.hospital || undefined,
        username: form.username,
        email: form.username, // Using username as email for now
        password: form.password
      };
      
      console.log('Submitting registration request with role:', role);
      
      // Import apiService
      const apiService = (await import('../utils/api')).default;
      await apiService.submitRegistrationRequest(requestData);
      
      showSuccess("Registration request submitted successfully! Please wait for admin approval. You will be notified once your account is approved.");
      navigate('/signin');
    } catch (error) {
      console.error('Registration error:', error);
      showError(typeof error.message === 'string' ? error.message : "Registration request failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Employee': return '👨‍💼';
      case 'Supervisor': return '👨‍💻';
      case 'HR Manager': return '👩‍💼';
      case 'Psychiatrist': return '👨‍⚕️';
      default: return '👤';
    }
  };

  // Show loading state
  if (departmentsLoading) {
    return (
      <div className="bg-[#EDF4FA] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-[#4F4F4F]">Loading registration form...</p>
        </div>
      </div>
    );
  }

  // Show error state when departments are not available
  if (departmentsError || departments.length === 0) {
    return (
      <div className="bg-[#EDF4FA] min-h-screen py-10 px-4">
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white rounded-2xl p-8 shadow-md">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img src="/images/logo.png" alt="MindCare Logo" className="w-16 h-16 object-contain" />
            </div>
            
            {/* Error Message */}
            <div className="mb-8 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-3xl font-bold text-[#212121] mb-4">Registration Temporarily Unavailable</h2>
              <p className="text-[#4F4F4F] text-lg mb-6">
                User registration is currently disabled due to system configuration issues.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">What happened?</h3>
                <p className="text-red-700">
                  The system could not load the required department and team information needed for user registration.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">What you can do:</h3>
                <ul className="text-blue-700 text-left max-w-md mx-auto space-y-2">
                  <li>• Contact your system administrator</li>
                  <li>• Check back later when the system is configured</li>
                  <li>• Use the contact form to request assistance</li>
                </ul>
              </div>
            </div>

            {/* Data Collection Form */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-6">
              <h3 className="text-xl font-semibold text-[#212121] mb-4 flex items-center">
                <span className="mr-2">📝</span>
                Express Interest in Registration
              </h3>
              <p className="text-[#4F4F4F] mb-4">
                While registration is currently unavailable, you can provide your information below. 
                We'll notify you when the system is ready and you can complete your registration.
              </p>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#212121] font-medium mb-2">First Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500 transition-all duration-200"
                      placeholder="Enter your first name"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-[#212121] font-medium mb-2">Last Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500 transition-all duration-200"
                      placeholder="Enter your last name"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-[#212121] font-medium mb-2">Email Address <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500 transition-all duration-200"
                      placeholder="Enter your email address"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-[#212121] font-medium mb-2">Preferred Job Role</label>
                    <select 
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500 transition-all duration-200"
                      disabled
                    >
                      <option value="">Select your preferred job role</option>
                      <option value="Employee">Employee</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="HR Manager">HR Manager</option>
                    </select>
                  </div>
                </div>
                
                <div className="text-center">
                  <button 
                    type="button" 
                    className="bg-gray-400 text-gray-600 py-3 px-6 rounded-xl font-semibold cursor-not-allowed"
                    disabled
                  >
                    Form Disabled - Contact Administrator
                  </button>
                </div>
                
                <div className="text-center text-sm text-gray-500">
                  <p>This form is currently disabled. Please contact your system administrator to:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Set up departments and teams in the system</li>
                    <li>• Enable user registration</li>
                    <li>• Get assistance with the registration process</li>
                  </ul>
                </div>
              </form>
            </div>

            {/* Action Buttons */}
            <div className="text-center space-y-4">
              <Link 
                to="/" 
                className="inline-block bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Back to Home
              </Link>
              <br />
              <Link 
                to="/signin" 
                className="inline-block bg-gray-600 text-white py-3 px-6 rounded-xl hover:bg-gray-700 transition-colors font-semibold"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EDF4FA] min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-2xl p-8 shadow-md">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/images/logo.png" alt="MindCare Logo" className="w-16 h-16 object-contain" />
          </div>
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#212121] mb-2">Create Your Account</h2>
            <p className="text-[#4F4F4F]">Join our mental wellness platform today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* System Status Warning */}
            {departments.length > 0 && teams.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Limited System Functionality</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>While departments are available, some teams may not be configured yet. This may affect registration for certain roles.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-xl font-semibold text-[#212121] mb-4 flex items-center">
                <span className="mr-2">👤</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#212121] font-medium mb-2">First Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="firstName" 
                    required 
                    className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.firstName && errors.firstName 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="Enter your first name"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#212121] font-medium mb-2">Last Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="lastName" 
                    required 
                    className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.lastName && errors.lastName 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="Enter your last name"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#212121] font-medium mb-2">Gender <span className="text-red-500">*</span></label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="gender" 
                        value="Male" 
                        required 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-[#212121]">Male</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="gender" 
                        value="Female" 
                        required 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-[#212121]">Female</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="gender" 
                        value="Other" 
                        required 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-[#212121]">Other</span>
                    </label>
                  </div>
                  {touched.gender && errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#212121] font-medium mb-2">NIC Number <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="nic" 
                    required 
                    className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.nic && errors.nic 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="Enter your NIC number (e.g., 123456789V or 123456789012)"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 9 digits + V or 12 digits</p>
                  {touched.nic && errors.nic && (
                    <p className="text-red-500 text-sm mt-1">{errors.nic}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#212121] font-medium mb-2">Birthday <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    name="birthday" 
                    required 
                    className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.birthday && errors.birthday 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.birthday && errors.birthday && (
                    <p className="text-red-500 text-sm mt-1">{errors.birthday}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#212121] font-medium mb-2">Contact Number</label>
                  <input 
                    type="tel" 
                    name="contact" 
                    className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.contact && errors.contact 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="Enter your contact number (e.g., +94712345678 or 0712345678)"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: +94 or 0 followed by 9 digits</p>
                  {touched.contact && errors.contact && (
                    <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Job Role Selection */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
              <h3 className="text-xl font-semibold text-[#212121] mb-4 flex items-center">
                <span className="mr-2">💼</span>
                Professional Information
              </h3>
              <div className="mb-4">
                <label className="block text-[#212121] font-medium mb-2">Job Role <span className="text-red-500">*</span></label>
                <select 
                  name="jobRole" 
                  required 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.jobRole && errors.jobRole 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select your job role</option>
                  <option value="Employee">Employee</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="HR Manager">HR Manager</option>
                </select>
                {touched.jobRole && errors.jobRole && (
                  <p className="text-red-500 text-sm mt-1">{errors.jobRole}</p>
                )}
              </div>

              {/* Role-specific fields */}
              {(role === "Employee" || role === "Supervisor" || role === "HR Manager") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#212121] font-medium mb-2">Employee ID <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="employeeId" 
                      required 
                      className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                        touched.employeeId && errors.employeeId 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-200 focus:ring-blue-500'
                      }`}
                      placeholder="Enter your employee ID"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.employeeId && errors.employeeId && (
                      <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>
                    )}
                  </div>
                </div>
              )}

              {(role === "Employee" || role === "Supervisor") && (
                <div>
                  <label className="block text-[#212121] font-medium mb-2">Department <span className="text-red-500">*</span></label>
                  <select 
                    name="department" 
                    required 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.department && errors.department 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    value={form.department}
                  >
                    <option value="">Select your department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {touched.department && errors.department && (
                    <p className="text-red-500 text-sm mt-1">{errors.department}</p>
                  )}
                </div>
              )}

              {/* Team selection for Employee and Supervisor */}
              {(role === "Employee" || role === "Supervisor") && (
                <div>
                  <label className="block text-[#212121] font-medium mb-2">Team <span className="text-red-500">*</span></label>
                  <select 
                    name="team" 
                    required 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.team && errors.team 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    value={form.team || ''}
                    disabled={!form.department}
                  >
                    <option value="">{form.department ? "Select your team" : "Please select a department first"}</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  {touched.team && errors.team && (
                    <p className="text-red-500 text-sm mt-1">{errors.team}</p>
                  )}
                  {!form.department && (
                    <p className="text-yellow-600 text-sm mt-1">
                      Please select a department first to see available teams.
                    </p>
                  )}
                  {form.department && teams.length === 0 && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-red-800">No Teams Available</h4>
                          <div className="mt-1 text-sm text-red-700">
                            <p>No teams are currently set up for the <strong>{form.department}</strong> department.</p>
                            <p className="mt-1">Registration cannot proceed until teams are configured. Please contact your system administrator.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Login Information */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
              <h3 className="text-xl font-semibold text-[#212121] mb-4 flex items-center">
                <span className="mr-2">🔐</span>
                Login Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#212121] font-medium mb-2">Email Address <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    name="username" 
                    required 
                    className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.username && errors.username 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="Enter your email address"
                    onChange={handleChange}
                    onBlur={handleBlur}
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
                    required 
                    minLength="8"
                    className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.password && errors.password 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="Enter your password (min 8 characters)"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.password && errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#212121] font-medium mb-2">Confirm Password <span className="text-red-500">*</span></label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    required 
                    minLength="8"
                    className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.confirmPassword && errors.confirmPassword 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="Confirm your password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Role Preview */}
            {role && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-[#212121] mb-3 flex items-center">
                  <span className="mr-2">{getRoleIcon(role)}</span>
                  {role} Profile Preview
                </h3>
                <p className="text-[#4F4F4F] text-sm">
                  You're registering as a <strong>{role}</strong>. This role will determine your access level and available features on the platform.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center">
              <button 
                type="submit" 
                disabled={isFormSubmissionDisabled()}
                className={`py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  isFormSubmissionDisabled()
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#212121] to-gray-800 text-white hover:shadow-lg hover:scale-105'
                }`}
              >
                {isFormSubmissionDisabled() ? 'Registration Unavailable' : 'Create Account'}
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-[#4F4F4F]">
              Already have an account?{" "}
              <Link to="/signin" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-4">
            <Link to="/" className="text-[#4F4F4F] hover:text-[#212121] transition-colors flex items-center justify-center space-x-2">
              <span>←</span>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
