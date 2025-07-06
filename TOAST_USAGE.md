# Toast Notification System

This application includes a custom toast notification system for displaying error messages, success messages, warnings, and informational messages.

## Features

- **Four types of toasts**: Error, Success, Warning, and Info
- **Auto-dismiss**: Toasts automatically disappear after 5 seconds
- **Manual dismiss**: Users can close toasts manually
- **Smooth animations**: Slide-in and slide-out animations
- **Responsive design**: Works on all screen sizes
- **Accessible**: Proper ARIA labels and keyboard navigation

## Usage

### Basic Usage

```jsx
import { useToast } from '../contexts/ToastContext';

const MyComponent = () => {
  const { showError, showSuccess, showWarning, showInfo } = useToast();

  const handleAction = () => {
    // Show different types of toasts
    showError("Something went wrong!");
    showSuccess("Operation completed successfully!");
    showWarning("Please review your input.");
    showInfo("Your session will expire soon.");
  };

  return <button onClick={handleAction}>Show Toast</button>;
};
```

### Form Validation Example

```jsx
const handleSubmit = (e) => {
  e.preventDefault();
  
  if (!form.email || !form.password) {
    showError("Please fill in all required fields");
    return;
  }
  
  if (form.password.length < 8) {
    showWarning("Password must be at least 8 characters long");
    return;
  }
  
  // Process form
  showSuccess("Form submitted successfully!");
};
```

### API Call Example

```jsx
const handleApiCall = async () => {
  try {
    showInfo("Loading...");
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      throw new Error('API call failed');
    }
    
    showSuccess("Data loaded successfully!");
  } catch (error) {
    showError("Failed to load data. Please try again.");
  }
};
```

## Toast Types

### Error Toast
- **Color**: Red border and icon
- **Use case**: Display error messages, validation failures, API errors
- **Example**: `showError("Invalid credentials")`

### Success Toast
- **Color**: Green border and icon
- **Use case**: Confirm successful operations, form submissions
- **Example**: `showSuccess("Profile updated successfully")`

### Warning Toast
- **Color**: Yellow border and icon
- **Use case**: Show warnings, important notices
- **Example**: `showWarning("Please review your information")`

### Info Toast
- **Color**: Blue border and icon
- **Use case**: Display informational messages, status updates
- **Example**: `showInfo("Your session will expire in 5 minutes")`

## Customization

### Duration
Toasts automatically disappear after 5 seconds. You can customize this by using the `addToast` function directly:

```jsx
const { addToast } = useToast();

// Show toast for 10 seconds
addToast("Custom message", "success", 10000);
```

### Styling
The toast styles are defined in the `ToastContainer` component in `src/contexts/ToastContext.jsx`. You can modify the colors, spacing, and animations there.

## Best Practices

1. **Be concise**: Keep toast messages short and clear
2. **Use appropriate types**: Use error for actual errors, success for confirmations, etc.
3. **Don't spam**: Avoid showing too many toasts at once
4. **Provide context**: Make messages actionable when possible
5. **Test on mobile**: Ensure toasts are readable on small screens

## Implementation Details

The toast system is built using:
- React Context API for state management
- Tailwind CSS for styling
- CSS animations for smooth transitions
- SVG icons for visual indicators

The system is already integrated into the app via the `ToastProvider` wrapper in `App.jsx`. 