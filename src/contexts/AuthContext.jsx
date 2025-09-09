import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../utils/api';
import { extractUserInfo, isTokenExpired, testJwtDecoding } from '../utils/jwt';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      console.log('Initial auth check - token exists:', !!token);
      
      if (token && !isTokenExpired(token)) {
        const userInfo = extractUserInfo(token);
        console.log('Initial auth check - userInfo from token:', userInfo);
        
        // Don't use localStorage as fallback - it could be stale data
        console.log('Initial auth check - stored role (not used):', localStorage.getItem('user_role'));
        
        if (userInfo) {
          const userState = { 
            token, 
            ...userInfo,
            role: userInfo.role || 'employee'  // Only use JWT token, never localStorage
          };
          console.log('Initial auth check - setting user state:', userState);
          setUser(userState);
        } else {
          console.log('Initial auth check - invalid token, removing from localStorage');
          // Token is invalid, remove it
          localStorage.removeItem('access_token');
        }
      } else if (token && isTokenExpired(token)) {
        console.log('Initial auth check - token expired, removing from localStorage');
        // Token is expired, remove it
        localStorage.removeItem('access_token');
      } else {
        console.log('Initial auth check - no token found');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Login attempt for:', credentials.username);
      const response = await apiService.login(credentials);
      console.log('Login response received:', response);
      console.log('Response keys:', Object.keys(response));
      console.log('Response role:', response.role);
      console.log('Response username:', response.username);
      
      // Use role and username directly from login response - much simpler and more reliable!
      const finalRole = response.role || 'employee';
      const finalUsername = response.username || credentials.username;
      console.log('Using role directly from login response:', finalRole);
      console.log('Using username directly from login response:', finalUsername);
      
      // Set user state
      const userState = {
        token: response.access_token,
        role: finalRole,
        username: finalUsername
      };
      
      console.log('Setting user state:', userState);
      setUser(userState);
      
      // Verify the user state was set correctly
      console.log('User state after setUser:', userState);
      console.log('Current user object in state:', user);
      
      // Store role in localStorage for consistency
      localStorage.setItem('user_role', finalRole);
      console.log('Role stored in localStorage:', finalRole);
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Registering with userData:', userData);
      const response = await apiService.register(userData);
      console.log('Registration response:', response);
      
      // Extract user info from JWT token
      const userInfo = extractUserInfo(response.access_token);
      console.log('Extracted userInfo from JWT:', userInfo);
      
      // Store role in localStorage as fallback
      localStorage.setItem('user_role', userData.role);
      
      if (userInfo && userInfo.role) {
        setUser({
          token: response.access_token,
          ...userInfo
        });
      } else {
        setUser({
          token: response.access_token,
          role: userData.role || 'employee', // Use the role from registration
          username: userData.username
        });
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerAdmin = async (adminData) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Registering admin with adminData:', adminData);
      const response = await apiService.registerAdmin(adminData);
      console.log('Admin registration response:', response);
      
      // Extract user info from JWT token
      const userInfo = extractUserInfo(response.access_token);
      console.log('Extracted userInfo from JWT:', userInfo);
      
      // Store role in localStorage as fallback
      localStorage.setItem('user_role', 'admin');
      
      if (userInfo && userInfo.role) {
        setUser({
          token: response.access_token,
          ...userInfo
        });
      } else {
        setUser({
          token: response.access_token,
          role: 'admin',
          username: adminData.username
        });
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setError(null);
    
    // Clear all stored authentication data
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('last_role_refresh');
    localStorage.removeItem('refresh_call_count');
    
    // Force clear any cached data
    setLoading(false);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const getUserRole = () => {
    const role = user?.role || 'employee';
    console.log('getUserRole called - user state:', user);
    console.log('getUserRole returning:', role);
    return role;
  };

  const hasRole = (role) => {
    const userRole = getUserRole();
    return userRole === role;
  };

  const setUserRole = (role) => {
    if (user) {
      console.log('setUserRole called with:', role);
      console.log('Previous user state:', user);
      setUser({ ...user, role });
      localStorage.setItem('user_role', role);
      console.log('New user state set with role:', role);
    }
  };

  const refreshUserData = async (forceRefresh = false) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token || isTokenExpired(token)) {
        console.log('No valid token found, skipping refresh');
        return;
      }

      // Extract current role from token - ONLY from token, never from localStorage
      const currentUserInfo = extractUserInfo(token);
      const currentRole = currentUserInfo?.role || 'employee';
      
      console.log('Current role from token:', currentRole);
      console.log('localStorage user_role (should not be used):', localStorage.getItem('user_role'));

      // Only proceed if forced or if we haven't refreshed recently
      const lastRefresh = localStorage.getItem('last_role_refresh');
      const now = Date.now();
      const refreshCooldown = 10000; // 10 seconds cooldown

      if (!forceRefresh && lastRefresh && (now - parseInt(lastRefresh)) < refreshCooldown) {
        console.log('Skipping refresh due to cooldown');
        return;
      }

      // Check for potential infinite loops
      const callCount = parseInt(localStorage.getItem('refresh_call_count') || '0');
      if (callCount > 5) {
        console.log('Too many refresh calls detected, skipping to prevent loop');
        localStorage.setItem('refresh_call_count', '0');
        return { roleChanged: false, error: 'Too many refresh calls' };
      }
      
      localStorage.setItem('refresh_call_count', (callCount + 1).toString());

      // Try to get fresh data from server first (most reliable)
      try {
        console.log('Fetching fresh user data from server...');
        
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
        });
        
        const refreshResult = await Promise.race([
          apiService.refreshUserData(),
          timeoutPromise
        ]);
        
        if (refreshResult.error) {
          throw new Error(refreshResult.error);
        }
        
        const freshUserData = refreshResult.userData;
        
        if (refreshResult.roleChanged) {
          console.log(`Role changed from ${refreshResult.oldRole} to ${refreshResult.newRole}`);
          
          // Update user state with fresh data
          setUser({ 
            token, 
            ...freshUserData,
            role: refreshResult.newRole
          });
          localStorage.setItem('user_role', refreshResult.newRole);
          localStorage.setItem('last_role_refresh', now.toString());
          
          // Reset call counter on success
          localStorage.setItem('refresh_call_count', '0');
          return { roleChanged: true, newRole: refreshResult.newRole, oldRole: refreshResult.oldRole };
        } else {
          console.log('No role change detected');
          localStorage.setItem('last_role_refresh', now.toString());
          // Reset call counter on success
          localStorage.setItem('refresh_call_count', '0');
          return { roleChanged: false, currentRole };
        }
      } catch (serverError) {
        console.log('Server data fetch failed, trying token refresh:', serverError);
        
        // Fallback to token refresh
        try {
          const refreshResponse = await Promise.race([
            apiService.refreshToken(),
            timeoutPromise
          ]);
          const newToken = refreshResponse.access_token;
          const newUserInfo = extractUserInfo(newToken);
          
          if (newUserInfo && newUserInfo.role) {
            const newRole = newUserInfo.role;
            console.log('Token refresh returned role:', newRole);
            
            // Only update if role actually changed
            if (newRole !== currentRole) {
              console.log(`Role changed from ${currentRole} to ${newRole}`);
              
              setUser({ 
                token: newToken, 
                ...newUserInfo,
                role: newRole
              });
              localStorage.setItem('user_role', newRole);
              localStorage.setItem('last_role_refresh', now.toString());
              
              // Reset call counter on success
              localStorage.setItem('refresh_call_count', '0');
              return { roleChanged: true, newRole, oldRole: currentRole };
            } else {
              console.log('No role change detected in token refresh');
              localStorage.setItem('last_role_refresh', now.toString());
              // Reset call counter on success
              localStorage.setItem('refresh_call_count', '0');
              return { roleChanged: false, currentRole };
            }
          }
        } catch (refreshError) {
          console.log('Token refresh also failed:', refreshError);
          // Don't update anything, just log the error
          return { roleChanged: false, error: refreshError.message };
        }
      }
    } catch (error) {
      console.error('Error in refreshUserData:', error);
      return { roleChanged: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    registerAdmin,
    logout,
    isAuthenticated,
    getUserRole,
    hasRole,
    setUserRole,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 