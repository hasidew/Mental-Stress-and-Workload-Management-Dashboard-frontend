import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import { validationRules, validateForm } from "../utils/validation";
import { useAuth } from "../contexts/AuthContext";

const SignIn = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { showError, showSuccess, showWarning, showInfo } = useToast();
  const { login, getUserRole, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Validation schema for SignIn form
  const validationSchema = {
    username: [validationRules.email],
    password: [validationRules.required]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const fieldErrors = validateForm({ [name]: value }, { [name]: validationSchema[name] });
    if (fieldErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ username: true, password: true });
    
    // Validate entire form
    const formErrors = validateForm(form, validationSchema);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      showError("Please fix the errors in the form");
      return;
    }
    
    try {
      setIsLoading(true);
      await login(form);
      showSuccess("Successfully signed in!");
      
      // Add a small delay to ensure role is properly set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get user role and redirect to appropriate dashboard
      const userRole = getUserRole();
      console.log('User role after login:', userRole);
      console.log('Current user object:', user);
      
      let redirectPath = '/dashboard'; // default
      
      switch (userRole) {
        case 'admin':
          redirectPath = '/admin-dashboard';
          console.log('Admin detected, redirecting to admin dashboard');
          break;
        case 'hr_manager':
          redirectPath = '/hr-dashboard';
          console.log('HR Manager detected, redirecting to HR dashboard');
          break;
        case 'supervisor':
          console.log('Supervisor detected, redirecting to main dashboard');
          redirectPath = '/dashboard';
          break;
        case 'psychiatrist':
          console.log('Psychiatrist detected, redirecting to main dashboard');
          redirectPath = '/dashboard';
          break;
        case 'employee':
          console.log('Employee detected, redirecting to main dashboard');
          redirectPath = '/dashboard';
          break;
        default:
          console.log('Unknown role detected:', userRole, 'redirecting to main dashboard');
          redirectPath = '/dashboard';
          break;
      }
      
      console.log('Redirecting to:', redirectPath);
      
      // Redirect to intended page or appropriate dashboard
      const from = location.state?.from?.pathname || redirectPath;
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      showError(typeof error.message === 'string' ? error.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#EDF4FA] min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full mt-8">
        <div className="bg-white rounded-2xl p-8 shadow-md">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/images/logo.png" alt="MindCare Logo" className="w-16 h-16 object-contain" />
          </div>
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#212121] mb-2">Welcome Back</h2>
            <p className="text-[#4F4F4F]">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#212121] font-medium mb-2">Email Address</label>
              <input
                type="email"
                name="username"
                required
                value={form.username}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  touched.username && errors.username 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
                placeholder="Enter your email address"
              />
              {touched.username && errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-[#212121] font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength="8"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  touched.password && errors.password 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
                placeholder="Enter your password"
              />
              {touched.password && errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-[#4F4F4F]">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#212121] to-gray-800 text-white py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-[#4F4F4F]">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                Sign up here
              </Link>
            </p>
            <p className="text-[#4F4F4F] mt-2">
              Are you an admin?{" "}
              <Link to="/admin-signup" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                Admin registration
              </Link>
            </p>
          </div>

          {/* Toast Demo Buttons */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">Toast Demo:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => showError("This is an error message")}
                className="px-3 py-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Error Toast
              </button>
              <button
                onClick={() => showSuccess("This is a success message")}
                className="px-3 py-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Success Toast
              </button>
              <button
                onClick={() => showWarning("This is a warning message")}
                className="px-3 py-2 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
              >
                Warning Toast
              </button>
              <button
                onClick={() => showInfo("This is an info message")}
                className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Info Toast
              </button>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-[#4F4F4F] hover:text-[#212121] transition-colors flex items-center justify-center space-x-2">
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
