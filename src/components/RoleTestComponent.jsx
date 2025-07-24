import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../utils/api';
import { testRoleChange, testAccessErrorHandling } from '../utils/roleChangeTest';
import { testLoopPrevention } from '../utils/loopTest';
import { testAllPotentialLoops, testSpecificLoopScenarios } from '../utils/comprehensiveLoopTest';

const RoleTestComponent = () => {
  const { user, getUserRole, refreshUserData, setUserRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const handleRefreshUserData = async () => {
    try {
      await refreshUserData();
      showSuccess('User data refreshed successfully!');
    } catch (error) {
      showError('Failed to refresh user data');
    }
  };

  const handleSetRole = (newRole) => {
    setUserRole(newRole);
    showSuccess(`Role changed to ${newRole}`);
  };

  const handleTestServerRefresh = async () => {
    try {
      const userData = await apiService.refreshUserData();
      showSuccess(`Server data: ${JSON.stringify(userData)}`);
    } catch (error) {
      showError(`Server error: ${error.message}`);
    }
  };

  const handleTestRoleChange = async () => {
    try {
      await testRoleChange(apiService, { getUserRole });
      showSuccess('Role change test completed! Check console for details.');
    } catch (error) {
      showError(`Test error: ${error.message}`);
    }
  };

  const handleTestAccessError = async () => {
    try {
      await testAccessErrorHandling(apiService);
      showSuccess('Access error test completed! Check console for details.');
    } catch (error) {
      showError(`Test error: ${error.message}`);
    }
  };

  const handleTestLoopPrevention = async () => {
    try {
      await testLoopPrevention(apiService);
      showSuccess('Loop prevention test completed! Check console for details.');
    } catch (error) {
      showError(`Test error: ${error.message}`);
    }
  };

  const handleTestComprehensiveLoops = async () => {
    try {
      await testAllPotentialLoops(apiService, { getUserRole, refreshUserData });
      showSuccess('Comprehensive loop test completed! Check console for details.');
    } catch (error) {
      showError(`Test error: ${error.message}`);
    }
  };

  const handleTestSpecificScenarios = async () => {
    try {
      await testSpecificLoopScenarios(apiService);
      showSuccess('Specific scenario test completed! Check console for details.');
    } catch (error) {
      showError(`Test error: ${error.message}`);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
      <h3 className="text-sm font-semibold mb-2">Role Test Panel</h3>
      <div className="space-y-2 text-xs">
        <p><strong>Current Role:</strong> {getUserRole()}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <div className="flex gap-1">
          <button
            onClick={() => handleSetRole('employee')}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Employee
          </button>
          <button
            onClick={() => handleSetRole('supervisor')}
            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
          >
            Supervisor
          </button>
          <button
            onClick={() => handleSetRole('admin')}
            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
          >
            Admin
          </button>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleRefreshUserData}
            className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
          >
            Refresh Data
          </button>
          <button
            onClick={handleTestServerRefresh}
            className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
          >
            Server Data
          </button>
          <button
            onClick={handleTestRoleChange}
            className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
          >
            Test Role Change
          </button>
          <button
            onClick={handleTestAccessError}
            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
          >
            Test Access Error
          </button>
          <button
            onClick={handleTestLoopPrevention}
            className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
          >
            Test Loop Prevention
          </button>
          <button
            onClick={handleTestComprehensiveLoops}
            className="px-2 py-1 bg-teal-600 text-white rounded text-xs hover:bg-teal-700"
          >
            Comprehensive Loop Test
          </button>
          <button
            onClick={handleTestSpecificScenarios}
            className="px-2 py-1 bg-pink-600 text-white rounded text-xs hover:bg-pink-700"
          >
            Specific Scenarios
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleTestComponent; 