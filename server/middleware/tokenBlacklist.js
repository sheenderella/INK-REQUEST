const tokenBlacklist = new Set(); // Using a Set to store blacklisted tokens

export const addTokenToBlacklist = (token) => {
  try {
    if (!token) throw new Error('Invalid token');
    
    console.log('Adding token to blacklist:', token);
    tokenBlacklist.add(token);
  } catch (error) {
    console.error('Error in addTokenToBlacklist:', error);
  }
};

export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};
