const express = require('express');
const { createBusiness, getAllBusinesses, getMyBusiness, getBusinessById, updateBusiness, verifyBusiness } = require('../controllers/business.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');

const router = express.Router();

router.post('/', protect, authorize('retailer'), createBusiness);
router.get('/', getAllBusinesses);
router.get('/my', protect, authorize('retailer'), getMyBusiness);
router.get('/:id', getBusinessById);
router.put('/my', protect, authorize('retailer'), updateBusiness);
router.patch('/:id/verify', protect, authorize('admin'), verifyBusiness);

module.exports = router;
