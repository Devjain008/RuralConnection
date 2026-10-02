const cartRepository = require('../repositories/cart.repository');
const productRepository = require('../repositories/product.repository');
const AppError = require('../utils/AppError');

class CartService {
    async getCart(userId) {
        let cart = await cartRepository.findByUserId(userId);
        if (!cart) {
            cart = await cartRepository.upsert(userId, []);
        }
        return cart;
    }

    async addToCart(userId, { productId, quantity, purchaseType = 'RETAIL' }) {
        const product = await productRepository.findById(productId);
        if (!product || !product.isActive) {
            throw new AppError('Product not found or unavailable', 404);
        }

        const qty = Number(quantity);
        if (qty <= 0) {
            throw new AppError('Quantity must be greater than zero', 400);
        }

        if (product.stock < qty) {
            throw new AppError(`Insufficient stock. Only ${product.stock} available.`, 400);
        }

        if (purchaseType === 'WHOLESALE') {
            if (product.purchaseType === 'RETAIL') {
                throw new AppError('This product is not available for wholesale purchase', 400);
            }
            if (qty < product.minimumWholesaleQuantity) {
                throw new AppError(`Wholesale orders require minimum quantity of ${product.minimumWholesaleQuantity}`, 400);
            }
        } else {
            if (product.purchaseType === 'WHOLESALE') {
                throw new AppError('This product is only available for wholesale purchase', 400);
            }
        }

        let cart = await cartRepository.findByUserId(userId);
        let items = cart ? [...cart.items] : [];

        const existingIndex = items.findIndex(item => item.product && item.product._id.toString() === productId.toString());

        const priceSnapshot = purchaseType === 'WHOLESALE' ? (product.wholesalePrice || product.price) : product.price;

        if (existingIndex > -1) {
            items[existingIndex].quantity = qty;
            items[existingIndex].purchaseType = purchaseType;
            items[existingIndex].priceSnapshot = priceSnapshot;
        } else {
            items.push({
                product: productId,
                seller: product.seller._id,
                quantity: qty,
                purchaseType,
                priceSnapshot
            });
        }

        return await cartRepository.upsert(userId, items);
    }

    async removeFromCart(userId, productId) {
        const cart = await cartRepository.findByUserId(userId);
        if (!cart) return { items: [] };

        const updatedItems = cart.items.filter(item => item.product && item.product._id.toString() !== productId.toString());
        return await cartRepository.upsert(userId, updatedItems);
    }
}

module.exports = new CartService();
