const express = require('express');
const {
    checkout,
    getMyOrders,
    getOrderById,
    getSellerOrders,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');

const router = express.Router();

router.use(protect);

router.post('/checkout', checkout);
router.get('/my', getMyOrders);
router.get('/seller', authorize('retailer'), getSellerOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', authorize('retailer'), updateOrderStatus);
router.patch('/:id/cancel', cancelOrder);

module.exports = router;
