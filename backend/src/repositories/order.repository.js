const Order = require('../models/Order');

class OrderRepository {
    async create(data, session) {
        const orders = await Order.create([data], { session });
        return orders[0];
    }

    async findById(id) {
        return await Order.findById(id)
            .populate('user', 'name email')
            .populate('seller', 'name email')
            .populate('items.product', 'name images')
            .exec();
    }

    async findByUser(userId) {
        return await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('seller', 'name')
            .exec();
    }

    async findBySeller(sellerId) {
        return await Order.find({ seller: sellerId })
            .sort({ createdAt: -1 })
            .populate('user', 'name email phone')
            .exec();
    }

    async updateStatus(id, orderStatus) {
        return await Order.findByIdAndUpdate(id, { orderStatus }, { returnDocument: 'after' }).exec();
    }

    async updatePaymentStatus(id, paymentStatus) {
        return await Order.findByIdAndUpdate(id, { paymentStatus }, { returnDocument: 'after' }).exec();
    }

    async countAll() {
        return await Order.countDocuments();
    }
}

module.exports = new OrderRepository();
