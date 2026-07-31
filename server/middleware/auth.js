const { getAuth } = require('@clerk/express');

// Clerk auth middleware — verifies the Bearer token issued by Clerk
// Replaces the old jsonwebtoken-based auth
module.exports = function (req, res, next) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'No authorization token, access denied' });
  }

  // Attach userId to req so routes can use req.auth.userId
  req.auth = { userId };
  next();
};
