const jwt = require('jsonwebtoken');
const { logAuditEvent } = require('./auditMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'healthcare_portal_super_secret_jwt_key_2026';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logAuditEvent({
      eventType: 'UNAUTHORIZED_ACCESS',
      severity: 'WARNING',
      userId: 'ANONYMOUS',
      username: 'anonymous',
      role: 'guest',
      action: req.method,
      resource: req.originalUrl,
      statusCode: 401,
      status: 'DENIED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown',
      details: `Unauthenticated request to protected endpoint: ${req.method} ${req.originalUrl} - Missing JWT Token`,
    });

    return res.status(401).json({
      error: 'Unauthorized: Authentication token is required',
      code: 'TOKEN_MISSING',
      message: 'Please provide a valid Bearer token in Authorization header.',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      const isExpired = err.name === 'TokenExpiredError';
      const errorCode = isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
      const errorMsg = isExpired ? 'JWT token has expired' : 'JWT token is invalid or corrupted';

      logAuditEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        severity: 'WARNING',
        userId: 'UNKNOWN',
        username: 'unknown',
        role: 'guest',
        action: req.method,
        resource: req.originalUrl,
        statusCode: 401,
        status: 'DENIED',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Unknown',
        details: `Rejected request to ${req.originalUrl}: ${errorMsg}`,
      });

      return res.status(401).json({
        error: `Unauthorized: ${errorMsg}`,
        code: errorCode,
        message: isExpired
          ? 'Your session has expired. Please log in again.'
          : 'The provided security token could not be verified.',
      });
    }

    req.user = decoded;
    next();
  });
};

module.exports = { authenticateToken, JWT_SECRET };
