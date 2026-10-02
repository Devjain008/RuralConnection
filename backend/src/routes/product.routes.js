const express = require('express');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getMyProducts,
    autocomplete
} = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');

const router = express.Router();

router.get('/autocomplete', autocomplete);
router.get('/seller/my', protect, authorize('retailer'), getMyProducts);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorize('retailer'), createProduct);
router.put('/:id', protect, authorize('retailer'), updateProduct);
router.delete('/:id', protect, authorize('retailer', 'admin'), deleteProduct);

module.exports = router;
