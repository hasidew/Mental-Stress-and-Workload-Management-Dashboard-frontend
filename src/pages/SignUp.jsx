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
    registrationNumber: "",
    hospital: "",
    username: "",
    password: "",
  });

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const apiService = (await import('../utils/api')).default;
        console.log('Fetching departments...');
        const departmentsData = await apiService.getAllDepartments();
        console.log('Departments fetched:', departmentsData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        // Don't show error to user, just log it and continue with empty departments
        // This allows the form to work even if departments can't be loaded
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
      password: [validationRules.password]
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
      showError(error.message || "Registration request failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Employee': return '👨‍💼';
      case 'Supervisor': return '👨‍💻';
      case 'HR Manager': return '👩‍💼';
      case 'Consultant': return '👨‍⚕️';
      default: return '👤';
    }
  };

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
                  {departments.length > 0 ? (
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
                  ) : (
                    <input 
                      type="text" 
                      name="department" 
                      required 
                      className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                        touched.department && errors.department 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-200 focus:ring-blue-500'
                      }`}
                      placeholder="Enter your department"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={form.department}
                    />
                  )}
                  {touched.department && errors.department && (
                    <p className="text-red-500 text-sm mt-1">{errors.department}</p>
                  )}
                  {departments.length === 0 && (
                    <p className="text-yellow-600 text-sm mt-1">
                      ⚠️ No departments loaded. You can enter your department name manually.
                    </p>
                  )}
                </div>
              )}

              {/* Team selection for Employee and Supervisor */}
              {(role === "Employee" || role === "Supervisor") && (
                <div>
                  <label className="block text-[#212121] font-medium mb-2">Team <span className="text-red-500">*</span></label>
                  {teams.length > 0 ? (
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
                  ) : (
                    <input 
                      type="text" 
                      name="team" 
                      required 
                      className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                        touched.team && errors.team 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-200 focus:ring-blue-500'
                      }`}
                      placeholder="Enter your team"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={form.team || ''}
                      disabled={!form.department}
                    />
                  )}
                  {touched.team && errors.team && (
                    <p className="text-red-500 text-sm mt-1">{errors.team}</p>
                  )}
                  {!form.department && (
                    <p className="text-yellow-600 text-sm mt-1">
                      Please select a department first to see available teams.
                    </p>
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
                className="bg-gradient-to-r from-[#212121] to-gray-800 text-white py-4 px-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold text-lg"
              >
                Create Account
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
