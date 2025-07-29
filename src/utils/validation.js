// Validation utility for form validation
export const validationRules = {
  // Email validation
  email: (value) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  },

  // Password validation
  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
    return null;
  },

  // Required field validation
  required: (value, fieldName) => {
    if (!value || value.trim() === '') return `${fieldName} is required`;
    return null;
  },

  // Name validation
  name: (value, fieldName) => {
    const required = validationRules.required(value, fieldName);
    if (required) return required;
    if (value.length < 2) return `${fieldName} must be at least 2 characters long`;
    if (!/^[a-zA-Z\s]+$/.test(value)) return `${fieldName} can only contain letters and spaces`;
    return null;
  },

  // NIC validation (Sri Lankan format)
  nic: (value) => {
    if (!value) return 'NIC number is required';
    const nicRegex = /^(\d{9}[Vv]|\d{12})$/;
    if (!nicRegex.test(value)) return 'Please enter a valid Sri Lankan NIC number (9 digits + V or 12 digits)';
    return null;
  },

  // Phone number validation (Sri Lankan format)
  phone: (value) => {
    if (!value) return null; // Optional field
    const phoneRegex = /^(\+94|0)[1-9][0-9]{8}$/;
    if (!phoneRegex.test(value)) return 'Please enter a valid Sri Lankan phone number';
    return null;
  },

  // Date validation
  date: (value, fieldName) => {
    if (!value) return `${fieldName} is required`;
    const selectedDate = new Date(value);
    const today = new Date();
    if (selectedDate > today) return `${fieldName} cannot be in the future`;
    return null;
  },

  // Number validation
  number: (value, fieldName, min = 0, max = null) => {
    if (!value) return null; // Optional field
    const num = parseFloat(value);
    if (isNaN(num)) return `${fieldName} must be a valid number`;
    if (num < min) return `${fieldName} must be at least ${min}`;
    if (max && num > max) return `${fieldName} must be no more than ${max}`;
    return null;
  },

  // Text length validation
  textLength: (value, fieldName, min = 0, max = null) => {
    if (!value) return null; // Optional field
    if (value.length < min) return `${fieldName} must be at least ${min} characters long`;
    if (max && value.length > max) return `${fieldName} must be no more than ${max} characters long`;
    return null;
  },

  // Select validation
  select: (value, fieldName) => {
    if (!value || value === '') return `Please select a ${fieldName}`;
    return null;
  },

  // Password confirmation validation
  passwordMatch: (value, password) => {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return null;
  },

  // Array validation
  array: (value, fieldName, min = 0, max = null) => {
    if (!value || value.length === 0) return `${fieldName} is required`;
    if (value.length < min) return `${fieldName} must have at least ${min} item(s)`;
    if (max && value.length > max) return `${fieldName} must have no more than ${max} item(s)`;
    return null;
  }
};

// Form validation function
export function validateForm(values, rules) {
  const errors = {};
  if (!rules) return errors;
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const value = values[field];
    
    for (const rule of fieldRules) {
      const error = rule(value, field);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return errors;
};

// Real-time validation function
export const validateField = (value, fieldRules, fieldName) => {
  for (const rule of fieldRules) {
    const error = rule(value, fieldName);
    if (error) return error;
  }
  return null;
}; 