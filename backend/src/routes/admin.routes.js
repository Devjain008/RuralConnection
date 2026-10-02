const express = require('express');
const {
    getUsers,
    updateUserRole,
    getBusinesses,
    verifyBusiness,
    getAnalytics,
    getAllOrders
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/businesses', getBusinesses);
router.patch('/businesses/:id/verify', verifyBusiness);
router.get('/analytics', getAnalytics);
router.get('/orders', getAllOrders);

module.exports = router;
