import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugInfo = () => {
  const { user, getUserRole, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs max-w-xs">
      <div className="font-bold mb-1">Debug Info:</div>
      <div>Role: {getUserRole()}</div>
      <div>Token: {user?.token ? 'Present' : 'Missing'}</div>
      <div>Username: {user?.username || 'N/A'}</div>
      <div>Email: {user?.email || 'N/A'}</div>
    </div>
  );
};

export default DebugInfo; 