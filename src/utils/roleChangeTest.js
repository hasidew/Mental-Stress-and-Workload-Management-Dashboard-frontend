// Role Change Test Utility
export const testRoleChange = async (apiService, authContext) => {
  console.log('=== Role Change Test ===');
  
  // Test 1: Check current role
  const currentRole = authContext.getUserRole();
  console.log('Current role:', currentRole);
  
  // Test 2: Try to refresh user data with new system
  try {
    console.log('Testing new refresh system...');
    const refreshResult = await apiService.refreshUserData();
    console.log('Refresh result:', refreshResult);
    
    if (refreshResult.roleChanged) {
      console.log('✅ Role change detected!');
      console.log(`Old role: ${refreshResult.oldRole}`);
      console.log(`New role: ${refreshResult.newRole}`);
    } else if (refreshResult.error) {
      console.log('❌ Refresh failed:', refreshResult.error);
    } else {
      console.log('ℹ️ No role change detected');
    }
  } catch (error) {
    console.log('❌ Refresh test failed:', error);
  }
  
  // Test 3: Test cooldown system
  console.log('Testing cooldown system...');
  const lastRefresh = localStorage.getItem('last_role_refresh');
  const now = Date.now();
  if (lastRefresh) {
    const timeSinceLastRefresh = now - parseInt(lastRefresh);
    console.log(`Time since last refresh: ${timeSinceLastRefresh}ms`);
    console.log(`Cooldown active: ${timeSinceLastRefresh < 10000 ? 'Yes' : 'No'}`);
  } else {
    console.log('No previous refresh recorded');
  }
  
  console.log('=== Test Complete ===');
};

// Test access error handling
export const testAccessErrorHandling = async (apiService) => {
  console.log('=== Access Error Handling Test ===');
  
  try {
    // Try to access an endpoint that might fail
    console.log('Testing access error handling...');
    await apiService.request('/admin/users'); // This might fail for non-admin users
  } catch (error) {
    console.log('Expected error caught:', error.message);
    
    // Check if role refresh was attempted
    const lastRefresh = localStorage.getItem('last_role_refresh');
    if (lastRefresh) {
      console.log('✅ Role refresh was attempted during access error');
    } else {
      console.log('ℹ️ No role refresh attempted');
    }
  }
  
  console.log('=== Access Error Test Complete ===');
}; 