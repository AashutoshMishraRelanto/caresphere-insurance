const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  policyHolderName: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  coverageStatus: {
    type: String,
    required: true,
    enum: ['Active', 'Expired', 'Suspended'],
  },
  approvedClaimLimit: {
    type: Number,
    required: true,
  },
  availableBalance: {
    type: Number,
    required: true,
  },
  planType: {
    type: String,
    required: true,
  },
  policyStartDate: {
    type: Date,
    required: true,
  },
  policyExpiryDate: {
    type: Date,
    required: true,
  },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('Policy', policySchema);
