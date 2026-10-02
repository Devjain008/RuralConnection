const Cart = require('../models/Cart');

class CartRepository {
    async findByUserId(userId) {
        return await Cart.findOne({ user: userId })
            .populate('items.product', 'name price wholesalePrice minimumWholesaleQuantity stock isActive images purchaseType packagingDetails wholesaleTerms wholesaleUnit')
            .populate('items.seller', 'name')
            .exec();
    }

    async upsert(userId, items) {
        return await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items } },
            { upsert: true, returnDocument: 'after' }
        ).exec();
    }

    async clearCart(userId, session) {
        return await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [] } },
            { session }
        ).exec();
    }
}

module.exports = new CartRepository();
