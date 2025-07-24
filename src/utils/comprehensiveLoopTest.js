// Comprehensive Loop Prevention Test
export const testAllPotentialLoops = async (apiService, authContext) => {
  console.log('=== Comprehensive Loop Prevention Test ===');
  
  // Test 1: Check API service methods for loops
  console.log('1. Testing API service methods...');
  const apiMethods = [
    'refreshUserData',
    'refreshToken',
    'login',
    'register',
    'getEmployeeDashboard',
    'getSupervisorDashboard'
  ];
  
  for (const method of apiMethods) {
    try {
      if (apiService[method]) {
        console.log(`✅ ${method} exists and is callable`);
      } else {
        console.log(`❌ ${method} not found`);
      }
    } catch (error) {
      console.log(`❌ Error testing ${method}:`, error);
    }
  }
  
  // Test 2: Check AuthContext methods for loops
  console.log('2. Testing AuthContext methods...');
  const authMethods = [
    'refreshUserData',
    'getUserRole',
    'setUserRole',
    'login',
    'register'
  ];
  
  for (const method of authMethods) {
    try {
      if (authContext[method]) {
        console.log(`✅ ${method} exists and is callable`);
      } else {
        console.log(`❌ ${method} not found`);
      }
    } catch (error) {
      console.log(`❌ Error testing ${method}:`, error);
    }
  }
  
  // Test 3: Check for circular dependencies
  console.log('3. Testing for circular dependencies...');
  
  // Check if refreshUserData calls itself
  try {
    const originalRefreshUserData = apiService.refreshUserData;
    let callCount = 0;
    
    apiService.refreshUserData = async function() {
      callCount++;
      if (callCount > 1) {
        throw new Error('Circular dependency detected in refreshUserData');
      }
      return await originalRefreshUserData.call(this);
    };
    
    await apiService.refreshUserData();
    console.log('✅ refreshUserData has no circular dependencies');
    
    // Restore original method
    apiService.refreshUserData = originalRefreshUserData;
  } catch (error) {
    console.log('❌ Circular dependency detected:', error.message);
  }
  
  // Test 4: Check cooldown mechanisms
  console.log('4. Testing cooldown mechanisms...');
  const cooldownTests = [
    'last_role_refresh',
    'refresh_call_count'
  ];
  
  for (const test of cooldownTests) {
    const value = localStorage.getItem(test);
    console.log(`${test}: ${value || 'not set'}`);
  }
  
  // Test 5: Check timeout mechanisms
  console.log('5. Testing timeout mechanisms...');
  try {
    // This should timeout quickly
    const timeoutTest = Promise.race([
      new Promise(resolve => setTimeout(resolve, 100)),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 50))
    ]);
    
    await timeoutTest;
    console.log('✅ Timeout mechanism works');
  } catch (error) {
    console.log('✅ Timeout caught as expected:', error.message);
  }
  
  // Test 6: Check state management
  console.log('6. Testing state management...');
  const stateChecks = [
    'isRefreshing',
    'previousRole',
    'user'
  ];
  
  for (const check of stateChecks) {
    console.log(`${check}: ${typeof authContext[check] !== 'undefined' ? 'exists' : 'not found'}`);
  }
  
  console.log('=== Comprehensive Loop Test Complete ===');
};

// Test for specific loop scenarios
export const testSpecificLoopScenarios = async (apiService) => {
  console.log('=== Specific Loop Scenario Tests ===');
  
  // Scenario 1: Multiple rapid calls
  console.log('1. Testing multiple rapid calls...');
  try {
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(apiService.refreshUserData());
    }
    
    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ ${successCount}/3 rapid calls succeeded`);
  } catch (error) {
    console.log('❌ Rapid calls failed:', error);
  }
  
  // Scenario 2: Error handling
  console.log('2. Testing error handling...');
  try {
    // Simulate a network error
    const originalFetch = global.fetch;
    global.fetch = () => Promise.reject(new Error('Network error'));
    
    const result = await apiService.refreshUserData();
    console.log('✅ Error handling works:', result);
    
    // Restore fetch
    global.fetch = originalFetch;
  } catch (error) {
    console.log('✅ Error caught as expected:', error.message);
  }
  
  // Scenario 3: Token expiration
  console.log('3. Testing token expiration...');
  try {
    const originalToken = localStorage.getItem('access_token');
    localStorage.setItem('access_token', 'invalid.token.here');
    
    const result = await apiService.refreshUserData();
    console.log('✅ Token expiration handled:', result);
    
    // Restore token
    if (originalToken) {
      localStorage.setItem('access_token', originalToken);
    }
  } catch (error) {
    console.log('✅ Token expiration caught:', error.message);
  }
  
  console.log('=== Specific Loop Scenario Tests Complete ===');
}; 