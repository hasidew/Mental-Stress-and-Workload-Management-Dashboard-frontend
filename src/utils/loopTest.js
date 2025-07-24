// Loop Prevention Test Utility
export const testLoopPrevention = async (apiService) => {
  console.log('=== Loop Prevention Test ===');
  
  // Test 1: Check if refreshUserData causes loops
  console.log('Testing refreshUserData for loops...');
  try {
    const result1 = await apiService.refreshUserData();
    console.log('✅ refreshUserData completed without loop');
    console.log('Result:', result1);
  } catch (error) {
    console.log('❌ refreshUserData failed:', error);
  }
  
  // Test 2: Check if refreshToken causes loops
  console.log('Testing refreshToken for loops...');
  try {
    const result2 = await apiService.refreshToken();
    console.log('✅ refreshToken completed without loop');
    console.log('Result:', result2);
  } catch (error) {
    console.log('❌ refreshToken failed:', error);
  }
  
  // Test 3: Check if request method handles errors without loops
  console.log('Testing request method error handling...');
  try {
    // Try to access an endpoint that might fail
    await apiService.request('/admin/users');
  } catch (error) {
    console.log('✅ Request error handled without loop:', error.message);
  }
  
  // Test 4: Check cooldown system
  console.log('Testing cooldown system...');
  const lastRefresh = localStorage.getItem('last_role_refresh');
  const now = Date.now();
  if (lastRefresh) {
    const timeSinceLastRefresh = now - parseInt(lastRefresh);
    console.log(`Time since last refresh: ${timeSinceLastRefresh}ms`);
    console.log(`Cooldown active: ${timeSinceLastRefresh < 30000 ? 'Yes' : 'No'}`);
  } else {
    console.log('No previous refresh recorded');
  }
  
  console.log('=== Loop Prevention Test Complete ===');
}; 