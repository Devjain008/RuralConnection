const express = require('express');
const { getMyProfile, updateMyProfile } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.get('/', protect, getMyProfile);
router.put('/', protect, updateMyProfile);

module.exports = router;