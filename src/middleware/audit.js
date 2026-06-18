const AuditLog = require('../models/AuditLog');

const auditLogger = async (req, res, next) => {
  const originalSend = res.send;
  let responseBody;

  res.send = function (body) {
    responseBody = body;
    originalSend.apply(res, arguments);
  };

  res.on('finish', async () => {
    try {
      let bodyToLog = req.body;
      if (req.body && req.body.password) {
        bodyToLog = { ...req.body, password: '[REDACTED]' };
      }

      await AuditLog.create({
        endpoint: req.originalUrl,
        method: req.method,
        requestBody: bodyToLog,
        responseStatus: res.statusCode,
        user: req.user ? req.user.username : 'anonymous',
        ipAddress: req.ip || req.connection.remoteAddress,
      });
    } catch (error) {
      console.error('Audit Log Error:', error);
    }
  });

  next();
};

module.exports = auditLogger;
