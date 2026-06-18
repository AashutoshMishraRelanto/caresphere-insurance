const express = require('express');
const router = express.Router();
const { verifyInsurance, getPolicyDetails, getClaimBalance } = require('../controllers/insuranceController');
const { protect } = require('../middleware/auth');

router.post('/verify', protect, verifyInsurance);
router.get('/policy/:policyNumber', protect, getPolicyDetails);
router.get('/balance/:policyNumber', protect, getClaimBalance);

module.exports = router;
