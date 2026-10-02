const productRepository = require('../repositories/product.repository');
const businessRepository = require('../repositories/business.repository');
const categoryRepository = require('../repositories/category.repository');
const AppError = require('../utils/AppError');

class ProductService {
    async createProduct(sellerId, data) {
        const business = await businessRepository.findByOwner(sellerId);
        if (!business) throw new AppError('You must have an approved business to add products', 400);
        if (business.verificationStatus !== 'APPROVED') {
            throw new AppError('Your business must be approved before listing products', 403);
        }

        const category = await categoryRepository.findById(data.category);
        if (!category) throw new AppError('Invalid category', 400);

        const productData = {
            name: data.name,
            description: data.description || '',
            category: data.category,
            images: data.images || [],
            price: data.price !== undefined && data.price !== '' ? Number(data.price) : (data.wholesalePrice ? Number(data.wholesalePrice) : 0),
            wholesalePrice: data.wholesalePrice ? Number(data.wholesalePrice) : undefined,
            minimumWholesaleQuantity: data.minimumWholesaleQuantity ? Number(data.minimumWholesaleQuantity) : 50,
            stock: Number(data.stock) || 0,
            purchaseType: data.purchaseType || 'RETAIL',
            wholesaleUnit: data.wholesaleUnit || 'units',
            packagingDetails: data.packagingDetails || '',
            wholesaleTerms: data.wholesaleTerms || '',
            seller: sellerId,
            business: business._id,
            location: business.location,
            isActive: true
        };

        return await productRepository.create(productData);
    }

    async getProducts(filters) {
        return await productRepository.findWithFilters(filters);
    }

    async getProductById(id) {
        const product = await productRepository.findById(id);
        if (!product || !product.isActive) throw new AppError('Product not found', 404);
        return product;
    }

    async updateProduct(id, sellerId, data) {
        const product = await productRepository.findById(id);
        if (!product) throw new AppError('Product not found', 404);
        if (product.seller._id.toString() !== sellerId.toString()) {
            throw new AppError('You can only update your own products', 403);
        }

        const allowedFields = ['name', 'description', 'images', 'price', 'wholesalePrice', 'minimumWholesaleQuantity', 'stock', 'purchaseType', 'wholesaleUnit', 'packagingDetails', 'wholesaleTerms', 'isActive'];
        const updateData = {};
        for (const key of allowedFields) {
            if (data[key] !== undefined) updateData[key] = data[key];
        }

        return await productRepository.updateById(id, updateData);
    }

    async deleteProduct(id, userId, role) {
        const product = await productRepository.findById(id);
        if (!product) throw new AppError('Product not found', 404);
        if (role !== 'admin' && product.seller._id.toString() !== userId.toString()) {
            throw new AppError('You can only delete your own products', 403);
        }
        return await productRepository.deleteById(id);
    }

    async getSellerProducts(sellerId) {
        return await productRepository.findBySeller(sellerId);
    }
}

module.exports = new ProductService();
