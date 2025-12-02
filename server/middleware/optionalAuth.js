const jwt = require('jsonwebtoken');

// Optional auth middleware - doesn't fail if no token
const optionalAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
  }
  
  next();
};

module.exports = optionalAuth;
