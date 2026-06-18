const express = require('express');
const router = express.Router();
const { getProviders, getProviderStats } = require('../controllers/providerController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getProviders);
router.get('/stats', protect, getProviderStats);

module.exports = router;
