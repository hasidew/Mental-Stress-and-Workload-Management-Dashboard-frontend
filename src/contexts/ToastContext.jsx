import { createContext, useContext, useState } from 'react';

// Add CSS animations for toast
const toastStyles = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = toastStyles;
  document.head.appendChild(style);
}

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'error', duration = 5000) => {
    // Ensure message is always a string
    const safeMessage = typeof message === 'string' ? message : String(message);
    
    const id = Date.now() + Math.random();
    const newToast = { id, message: safeMessage, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    const toastElement = document.querySelector(`[data-toast-id="${id}"]`);
    if (toastElement) {
      toastElement.style.animation = 'slideOut 0.3s ease-in-out';
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 300);
    } else {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }
  };

  const showError = (message) => addToast(message, 'error');
  const showSuccess = (message) => addToast(message, 'success');
  const showWarning = (message) => addToast(message, 'warning');
  const showInfo = (message) => addToast(message, 'info');

  const value = {
    toasts,
    addToast,
    removeToast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  const getToastStyles = (type) => {
    const baseStyles = "fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-2xl pointer-events-auto overflow-hidden border-2";
    
    switch (type) {
      case 'error':
        return `${baseStyles} border-red-500 bg-red-50`;
      case 'success':
        return `${baseStyles} border-green-500 bg-green-50`;
      case 'warning':
        return `${baseStyles} border-yellow-500 bg-yellow-50`;
      case 'info':
        return `${baseStyles} border-blue-500 bg-blue-50`;
      default:
        return `${baseStyles} border-gray-200`;
    }
  };

  const getIconStyles = (type) => {
    switch (type) {
      case 'error':
        return "text-red-600";
      case 'success':
        return "text-green-600";
      case 'warning':
        return "text-yellow-600";
      case 'info':
        return "text-blue-600";
      default:
        return "text-[#4F4F4F]";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          data-toast-id={toast.id}
          className={`${getToastStyles(toast.type)} transform transition-all duration-300 ease-in-out hover:shadow-xl`}
          style={{
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div className="p-6">
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${getIconStyles(toast.type)}`}>
                {getIcon(toast.type)}
              </div>
              <div className="ml-4 w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-[#212121]">
                  {toast.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="bg-white rounded-xl inline-flex text-[#4F4F4F] hover:text-[#212121] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  onClick={() => removeToast(toast.id)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 