const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  endpoint: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  requestBody: {
    type: mongoose.Schema.Types.Mixed,
  },
  responseStatus: {
    type: Number,
  },
  user: {
    type: String,
    default: 'anonymous',
  },
  ipAddress: {
    type: String,
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
