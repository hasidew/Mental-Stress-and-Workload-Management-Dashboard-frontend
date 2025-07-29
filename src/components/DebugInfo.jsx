import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugInfo = () => {
  const { user, getUserRole, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-xs max-w-xs z-50">
      <div className="font-bold text-yellow-800 mb-1">Debug Info</div>
      <div className="text-yellow-700">
        <div><strong>Role:</strong> {getUserRole()}</div>
        <div><strong>Username:</strong> {user?.username || 'N/A'}</div>
        <div><strong>User Object:</strong> {JSON.stringify(user, null, 2)}</div>
        <div><strong>Token:</strong> {user?.token ? 'Present' : 'Missing'}</div>
        <div><strong>LocalStorage Role:</strong> {localStorage.getItem('user_role') || 'Not set'}</div>
      </div>
    </div>
  );
};

export default DebugInfo; 