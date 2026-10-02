const mongoose = require('mongoose');
const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const cartRepository = require('../repositories/cart.repository');
const AppError = require('../utils/AppError');

const VALID_STATUS_TRANSITIONS = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'READY_FOR_PICKUP', 'CANCELLED'],
    PREPARING: ['READY', 'OUT_FOR_DELIVERY', 'CANCELLED'],
    READY: ['OUT_FOR_DELIVERY', 'READY_FOR_PICKUP'],
    READY_FOR_PICKUP: ['PICKED_UP', 'CANCELLED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    PICKED_UP: [],
    CANCELLED: []
};

class OrderService {
    async checkout(userId, { deliveryAddress, isPickup = false, pickupCode = null }) {
        const cart = await cartRepository.findByUserId(userId);
        if (!cart || !cart.items || cart.items.length === 0) {
            throw new AppError('Your cart is empty', 400);
        }

        // Group items by seller
        const itemsBySeller = {};
        for (const item of cart.items) {
            const product = await productRepository.findById(item.product._id);
            if (!product || !product.isActive) {
                throw new AppError(`Product "${item.product.name}" is no longer available`, 400);
            }
            if (product.stock < item.quantity) {
                throw new AppError(`Insufficient stock for "${product.name}". Only ${product.stock} available.`, 400);
            }

            const sellerId = product.seller._id.toString();
            if (!itemsBySeller[sellerId]) {
                itemsBySeller[sellerId] = [];
            }

            // Recalculate price server-side
            let unitPrice = product.price;
            let orderType = 'retail';
            if (item.purchaseType === 'WHOLESALE') {
                if (item.quantity < product.minimumWholesaleQuantity) {
                    throw new AppError(`Wholesale MOQ of ${product.minimumWholesaleQuantity} not met for ${product.name}`, 400);
                }
                unitPrice = product.wholesalePrice || product.price;
                orderType = 'wholesale';
            }

            itemsBySeller[sellerId].push({
                product: product._id,
                name: product.name,
                price: unitPrice,
                quantity: item.quantity,
                purchaseType: item.purchaseType,
                orderType
            });
        }

        const createdOrders = [];
        // Create an order for each seller
        for (const [sellerId, items] of Object.entries(itemsBySeller)) {
            const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const deliveryFee = isPickup ? 0 : 50; // standard nominal delivery
            const total = subtotal + deliveryFee;
            const primaryOrderType = items.some(i => i.orderType === 'wholesale') ? 'wholesale' : 'retail';

            // Deduct stock for all items
            for (const item of items) {
                await productRepository.decrementStock(item.product, item.quantity);
            }

            const order = await orderRepository.create({
                user: userId,
                seller: sellerId,
                items,
                orderType: primaryOrderType,
                subtotal,
                deliveryFee,
                total,
                paymentStatus: 'PENDING',
                orderStatus: 'PENDING',
                pickupInfo: {
                    isPickup,
                    pickupCode: isPickup ? (pickupCode || Math.floor(100000 + Math.random() * 900000).toString()) : ''
                },
                deliveryAddress: isPickup ? {} : deliveryAddress
            });

            createdOrders.push(order);
        }

        // Clear cart
        await cartRepository.clearCart(userId);

        return createdOrders;
    }

    async getMyOrders(userId) {
        return await orderRepository.findByUser(userId);
    }

    async getOrderById(orderId, userId, role) {
        const order = await orderRepository.findById(orderId);
        if (!order) throw new AppError('Order not found', 404);

        if (role !== 'admin' && order.user._id.toString() !== userId.toString() && order.seller._id.toString() !== userId.toString()) {
            throw new AppError('Access denied', 403);
        }

        return order;
    }

    async getSellerOrders(sellerId) {
        return await orderRepository.findBySeller(sellerId);
    }

    async updateOrderStatus(orderId, sellerId, newStatus) {
        const order = await orderRepository.findById(orderId);
        if (!order) throw new AppError('Order not found', 404);

        if (order.seller._id.toString() !== sellerId.toString()) {
            throw new AppError('You can only update orders placed with your business', 403);
        }

        const allowedNextStatuses = VALID_STATUS_TRANSITIONS[order.orderStatus] || [];
        if (!allowedNextStatuses.includes(newStatus)) {
            throw new AppError(`Cannot change order status from ${order.orderStatus} to ${newStatus}`, 400);
        }

        return await orderRepository.updateStatus(orderId, newStatus);
    }

    async cancelOrder(orderId, userId) {
        const order = await orderRepository.findById(orderId);
        if (!order) throw new AppError('Order not found', 404);

        if (order.user._id.toString() !== userId.toString()) {
            throw new AppError('You can only cancel your own orders', 403);
        }

        if (!['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
            throw new AppError('Order cannot be cancelled at this stage', 400);
        }

        return await orderRepository.updateStatus(orderId, 'CANCELLED');
    }
}

module.exports = new OrderService();
