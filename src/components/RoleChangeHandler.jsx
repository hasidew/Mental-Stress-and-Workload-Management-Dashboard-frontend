import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const RoleChangeHandler = () => {
  const { user, refreshUserData, getUserRole } = useAuth();
  const { showSuccess, showError } = useToast();
  const previousRole = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle role change detection
  useEffect(() => {
    if (user) {
      const currentRole = getUserRole();
      
      // Check if role has changed
      if (previousRole.current && previousRole.current !== currentRole) {
        console.log(`Role changed from ${previousRole.current} to ${currentRole}`);
        showSuccess(`Your role has been updated to ${currentRole}`);
      }
      
      // Update previous role reference
      previousRole.current = currentRole;
    }
  }, [user, getUserRole, showSuccess]);

  // Periodic refresh with error handling and loop prevention
  useEffect(() => {
    if (user && !isRefreshing) {
      const interval = setInterval(async () => {
        if (isRefreshing) {
          console.log('Skipping refresh - already in progress');
          return;
        }

        // Check if we've refreshed recently to prevent loops
        const lastRefresh = localStorage.getItem('last_role_refresh');
        const now = Date.now();
        const refreshCooldown = 30000; // 30 seconds cooldown

        if (lastRefresh && (now - parseInt(lastRefresh)) < refreshCooldown) {
          console.log('Skipping refresh due to cooldown');
          return;
        }

        try {
          setIsRefreshing(true);
          console.log('Starting periodic role check...');
          
          const result = await refreshUserData();
          
          if (result && result.roleChanged) {
            console.log(`Role change detected: ${result.oldRole} → ${result.newRole}`);
            showSuccess(`Your role has been updated to ${result.newRole}`);
          } else if (result && result.error) {
            console.log('Role check failed:', result.error);
            // Don't show error to user for periodic checks
          }
        } catch (error) {
          console.log('Periodic refresh failed:', error);
          // Don't show error to user for periodic checks
        } finally {
          setIsRefreshing(false);
        }
      }, 120000); // Refresh every 2 minutes (increased from 60)

      return () => clearInterval(interval);
    }
  }, [user, isRefreshing, showSuccess]);

  // This component doesn't render anything
  return null;
};

export default RoleChangeHandler; 