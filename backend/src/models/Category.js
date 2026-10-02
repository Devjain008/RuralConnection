const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    slug: { type: String, unique: true, required: true },
    description: String,
    icon: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
