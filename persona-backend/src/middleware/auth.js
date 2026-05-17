const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'lifeos_secret_2024'
    );
    
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
