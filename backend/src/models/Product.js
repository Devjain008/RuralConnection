const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
    price: { type: Number, required: true },
    wholesalePrice: { type: Number },
    minimumWholesaleQuantity: { type: Number, default: 50 },
    stock: { type: Number, default: 0 },
    purchaseType: { type: String, enum: ['RETAIL', 'WHOLESALE', 'BOTH'], default: 'RETAIL' },
    wholesaleUnit: { type: String, default: 'units' },
    packagingDetails: { type: String, default: '' },
    wholesaleTerms: { type: String, default: '' },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] } // [lng, lat]
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Product', productSchema);
