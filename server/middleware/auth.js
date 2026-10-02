const jwt = require('jsonwebtoken');

// JWT auth middleware — verifies standard Bearer token issued during login/signup
module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.header('x-auth-token')) {
    token = req.header('x-auth-token');
  }

  // Check if not token
  if (!token) {
    return res.status(401).json({ error: 'No token provided, authorization denied' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'campus_buddy_super_secret_jwt_key_2026_token_auth';
    const decoded = jwt.verify(token, secret);
    
    // Attach decoded user info (id, email)
    req.user = decoded;
    req.auth = { userId: decoded.id }; // Backwards compatibility for any routes checking req.auth.userId
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is invalid or expired. Please sign in again.' });
  }
};
