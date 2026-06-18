const Policy = require('../models/Policy');

const getProviders = async (req, res) => {
  try {
    const providers = await Policy.distinct('provider');
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProviderStats = async (req, res) => {
  try {
    const stats = await Policy.aggregate([
      {
        $group: {
          _id: null,
          totalPolicies: { $sum: 1 },
          activePolicies: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$coverageStatus', 'Active'] },
                  { $gt: ['$policyExpiryDate', new Date()] }
                ]},
                1, 0
              ]
            }
          },
          expiredPolicies: {
            $sum: {
              $cond: [
                { $or: [
                  { $eq: ['$coverageStatus', 'Expired'] },
                  { $lte: ['$policyExpiryDate', new Date()] }
                ]},
                1, 0
              ]
            }
          },
          totalApprovedClaimLimits: { $sum: '$approvedClaimLimit' },
          averageClaimLimit: { $avg: '$approvedClaimLimit' }
        }
      },
      {
        $project: {
          _id: 0,
          totalPolicies: 1,
          activePolicies: 1,
          expiredPolicies: 1,
          totalApprovedClaimLimits: 1,
          averageClaimLimit: { $round: ['$averageClaimLimit', 2] }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        totalPolicies: 0,
        activePolicies: 0,
        expiredPolicies: 0,
        totalApprovedClaimLimits: 0,
        averageClaimLimit: 0
      });
    }

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProviders, getProviderStats };
