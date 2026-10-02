const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    businessName: { type: String, required: true },
    description: String,
    category: String,
    phone: String,
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [lng, lat]
    },
    deliveryRadiusKm: {
        type: Number,
        default: 10, // Default delivery radius in km
        min: 1,
        max: 200
    },
    verificationStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    images: [{ type: String }],
    openingHours: {
        open: String,
        close: String
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

businessSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Business', businessSchema);
