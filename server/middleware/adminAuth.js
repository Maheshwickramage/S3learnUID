const adminAuth = (req, res, next) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    
    if (!adminKey) {
      return res.status(401).json({ success: false, message: 'Admin key required' });
    }
    
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ success: false, message: 'Invalid admin key' });
    }
    
    req.isAdmin = true;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Auth error' });
  }
};

module.exports = adminAuth;
