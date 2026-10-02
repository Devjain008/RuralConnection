const express = require('express');
const {
    getMyApplications,
    updateApplicationStatus
} = require('../controllers/application.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');

const router = express.Router();

router.get('/my', protect, getMyApplications);
router.patch('/:id/status', protect, authorize('retailer'), updateApplicationStatus);

module.exports = router;
