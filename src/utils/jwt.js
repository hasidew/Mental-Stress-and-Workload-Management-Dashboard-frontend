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
  
  const userInfo = {
    username: decoded.sub || decoded.username,
    role: decoded.role || decoded.user_role,
    email: decoded.email,
    // Add other fields as needed
  };
  
  console.log('Extracted user info:', userInfo);
  return userInfo;
};

export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}; 