// JWT token utility functions
export const decodeToken = (token) => {
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    return decodedPayload;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

export const extractUserInfo = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  console.log('Decoded JWT payload:', decoded);
  console.log('Available fields in JWT:', Object.keys(decoded));
  console.log('Role field in JWT:', decoded.role);
  console.log('Sub field in JWT:', decoded.sub);
  
  const userInfo = {
    username: decoded.sub || decoded.username,
    role: decoded.role || decoded.user_role,
    email: decoded.email,
    // Add other fields as needed
  };
  
  console.log('Extracted user info:', userInfo);
  console.log('Final role being used:', userInfo.role);
  return userInfo;
};

export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}; 

export const testJwtDecoding = (token) => {
  console.log('=== JWT Token Test ===');
  console.log('Token length:', token.length);
  console.log('Token starts with:', token.substring(0, 20) + '...');
  
  const decoded = decodeToken(token);
  console.log('Decoded payload:', decoded);
  
  if (decoded) {
    console.log('Role in token:', decoded.role);
    console.log('Username in token:', decoded.sub);
    console.log('All fields:', Object.keys(decoded));
  }
  
  const userInfo = extractUserInfo(token);
  console.log('Extracted user info:', userInfo);
  console.log('=== End JWT Test ===');
  
  return userInfo;
}; 