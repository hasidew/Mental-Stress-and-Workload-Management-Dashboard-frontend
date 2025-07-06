// Example usage of the toast system
// Import this in any component where you want to use toasts:
// import { useToast } from '../contexts/ToastContext';

export const toastExamples = {
  // Form validation errors
  formValidation: (showError) => {
    showError("Please fill in all required fields");
  },

  // API call errors
  apiError: (showError) => {
    showError("Failed to connect to server. Please try again.");
  },

  // Success messages
  success: (showSuccess) => {
    showSuccess("Operation completed successfully!");
  },

  // Warning messages
  warning: (showWarning) => {
    showWarning("Please review your information before proceeding.");
  },

  // Info messages
  info: (showInfo) => {
    showInfo("Your session will expire in 5 minutes.");
  },

  // Network errors
  networkError: (showError) => {
    showError("Network connection lost. Please check your internet connection.");
  },

  // Authentication errors
  authError: (showError) => {
    showError("Invalid credentials. Please try again.");
  },

  // File upload errors
  uploadError: (showError) => {
    showError("File upload failed. Please try again.");
  },

  // Save confirmation
  saveSuccess: (showSuccess) => {
    showSuccess("Your changes have been saved successfully.");
  },

  // Delete confirmation
  deleteSuccess: (showSuccess) => {
    showSuccess("Item deleted successfully.");
  },

  // Loading state
  loadingInfo: (showInfo) => {
    showInfo("Processing your request...");
  }
};

// Usage example in a component:
/*
import { useToast } from '../contexts/ToastContext';
import { toastExamples } from '../utils/toastExamples';

const MyComponent = () => {
  const { showError, showSuccess, showWarning, showInfo } = useToast();

  const handleSubmit = async () => {
    try {
      // Show loading toast
      toastExamples.loadingInfo(showInfo);
      
      // Simulate API call
      await someApiCall();
      
      // Show success toast
      toastExamples.success(showSuccess);
    } catch (error) {
      // Show error toast
      toastExamples.apiError(showError);
    }
  };

  return (
    <button onClick={handleSubmit}>
      Submit
    </button>
  );
};
*/ 