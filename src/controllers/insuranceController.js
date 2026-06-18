const Policy = require('../models/Policy');

const verifyInsurance = async (req, res) => {
  try {
    const { policyNumber } = req.body;

    if (!policyNumber) {
      return res.status(400).json({ message: 'Policy number is required' });
    }

    const policy = await Policy.findOne({ policyNumber });

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Determine actual status based on dates
    let currentStatus = policy.coverageStatus;
    const now = new Date();

    if (policy.coverageStatus === 'Active' && now > policy.policyExpiryDate) {
      currentStatus = 'Expired';
    }

    res.json({
      policyNumber: policy.policyNumber,
      policyHolderName: policy.policyHolderName,
      provider: policy.provider,
      coverageStatus: currentStatus,
      approvedClaimLimit: policy.approvedClaimLimit,
      availableBalance: policy.availableBalance,
      policyStartDate: policy.policyStartDate.toISOString().split('T')[0],
      policyExpiryDate: policy.policyExpiryDate.toISOString().split('T')[0],
      planType: policy.planType,
      lastVerificationDate: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPolicyDetails = async (req, res) => {
  try {
    const { policyNumber } = req.params;
    const policy = await Policy.findOne({ policyNumber });

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClaimBalance = async (req, res) => {
  try {
    const { policyNumber } = req.params;
    const policy = await Policy.findOne({ policyNumber });

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    res.json({
      policyNumber: policy.policyNumber,
      availableBalance: policy.availableBalance,
      approvedClaimLimit: policy.approvedClaimLimit,
      currency: 'USD'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { verifyInsurance, getPolicyDetails, getClaimBalance };
