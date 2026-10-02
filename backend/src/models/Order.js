const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        price: Number,
        quantity: Number,
        purchaseType: String
    }],
    orderType: { type: String, enum: ['retail', 'wholesale'], required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    orderStatus: { type: String, enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'], default: 'PENDING' },
    pickupInfo: {
        isPickup: { type: Boolean, default: false },
        pickupCode: String
    },
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String
    }
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
