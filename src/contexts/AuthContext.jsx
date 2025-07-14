import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../utils/api';
import { extractUserInfo, isTokenExpired } from '../utils/jwt';

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
      if (token && !isTokenExpired(token)) {
        const userInfo = extractUserInfo(token);
        console.log('Initial auth check - userInfo:', userInfo);
        
        // Try to get role from localStorage as fallback
        const storedRole = localStorage.getItem('user_role');
        console.log('Initial auth check - stored role:', storedRole);
        
        if (userInfo) {
          setUser({ 
            token, 
            ...userInfo,
            role: userInfo.role || storedRole || 'employee'
          });
        } else {
          // Token is invalid, remove it
          localStorage.removeItem('access_token');
        }
      } else if (token && isTokenExpired(token)) {
        // Token is expired, remove it
        localStorage.removeItem('access_token');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiService.login(credentials);
      
      // Extract user info from JWT token
      const userInfo = extractUserInfo(response.access_token);
      console.log('Login - Extracted userInfo from JWT:', userInfo);
      
      // Try to get role from localStorage as fallback
      const storedRole = localStorage.getItem('user_role');
      console.log('Stored role from localStorage:', storedRole);
      
      if (userInfo && userInfo.role) {
        setUser({
          token: response.access_token,
          ...userInfo
        });
      } else {
        setUser({
          token: response.access_token,
          role: storedRole || 'employee', // Use stored role or fallback
          username: userInfo?.username || credentials.username
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
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const getUserRole = () => {
    return user?.role || 'employee';
  };

  const hasRole = (role) => {
    const userRole = getUserRole();
    return userRole === role;
  };

  const setUserRole = (role) => {
    if (user) {
      setUser({ ...user, role });
      localStorage.setItem('user_role', role);
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 