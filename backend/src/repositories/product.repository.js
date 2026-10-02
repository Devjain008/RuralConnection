const Product = require('../models/Product');

class ProductRepository {
    async create(data) {
        return await Product.create(data);
    }

    async findById(id) {
        return await Product.findById(id)
            .populate('category', 'name slug')
            .populate('seller', 'name email')
            .populate('business', 'businessName address location deliveryRadiusKm phone')
            .exec();
    }

    async findWithFilters({ keyword, category, minPrice, maxPrice, purchaseType, lat, lng, distance, page = 1, limit = 10 }) {
        const query = { isActive: true };

        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }
        if (category) query.category = category;
        if (minPrice !== undefined) query.price = { ...query.price, $gte: Number(minPrice) };
        if (maxPrice !== undefined) query.price = { ...query.price, $lte: Number(maxPrice) };
        if (purchaseType) query.purchaseType = purchaseType;

        const skip = (Number(page) - 1) * Number(limit);
        const safeLimit = Math.min(Number(limit), 100);

        let queryBuilder;
        if (lat && lng) {
            queryBuilder = Product.find({
                ...query,
                'location.coordinates': { $exists: true },
                location: {
                    $nearSphere: {
                        $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
                        $maxDistance: (Number(distance) || 10) * 1000
                    }
                }
            });
        } else {
            queryBuilder = Product.find(query).sort({ createdAt: -1 });
        }

        const [products, total] = await Promise.all([
            queryBuilder.skip(skip).limit(safeLimit)
                .populate('category', 'name')
                .populate('seller', 'name')
                .populate('business', 'businessName address location deliveryRadiusKm phone')
                .exec(),
            Product.countDocuments(query)
        ]);

        return { products, total, page: Number(page), limit: safeLimit };
    }

    async findBySeller(sellerId) {
        return await Product.find({ seller: sellerId, isActive: true })
            .populate('category', 'name')
            .populate('business', 'businessName address location deliveryRadiusKm phone')
            .sort({ createdAt: -1 })
            .exec();
    }

    async updateById(id, data) {
        return await Product.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true }).exec();
    }

    async deleteById(id) {
        return await Product.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' }).exec();
    }

    async findNames(limit = 200) {
        return await Product.find({ isActive: true }, { name: 1 }).limit(limit).exec();
    }

    async decrementStock(productId, quantity, session) {
        return await Product.findByIdAndUpdate(
            productId,
            { $inc: { stock: -quantity } },
            { session, returnDocument: 'after' }
        ).exec();
    }
}

module.exports = new ProductRepository();
