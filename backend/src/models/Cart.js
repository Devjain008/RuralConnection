const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        quantity: { type: Number, required: true, min: 1 },
        purchaseType: { type: String, enum: ['RETAIL', 'WHOLESALE'], required: true },
        priceSnapshot: { type: Number, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
