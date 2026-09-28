const { logAuditEvent } = require('./auditMiddleware');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized: User authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logAuditEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        severity: 'ALERT',
        userId: req.user.id || req.user.patientId || req.user.doctorId,
        username: req.user.username,
        role: req.user.role,
        action: req.method,
        resource: req.originalUrl,
        statusCode: 403,
        status: 'DENIED',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Unknown',
        details: `Role violation: User '${req.user.username}' with role '${req.user.role}' attempted to access restricted endpoint ${req.originalUrl}. Required roles: [${allowedRoles.join(', ')}]`,
      });

      return res.status(403).json({
        error: 'Forbidden: Insufficient role permissions',
        code: 'ACCESS_DENIED_ROLE_RESTRICTION',
        requiredRoles: allowedRoles,
        currentRole: req.user.role,
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}. Your role is '${req.user.role}'.`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
