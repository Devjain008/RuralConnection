const Category = require('../models/Category');

class CategoryRepository {
    async findAll(filter = {}) {
        return await Category.find({ isActive: true, ...filter }).sort({ name: 1 }).exec();
    }

    async findById(id) {
        return await Category.findById(id).exec();
    }

    async findBySlug(slug) {
        return await Category.findOne({ slug }).exec();
    }

    async create(data) {
        return await Category.create(data);
    }

    async updateById(id, data) {
        return await Category.findByIdAndUpdate(id, data, { returnDocument: 'after' }).exec();
    }

    async deleteById(id) {
        return await Category.findByIdAndDelete(id).exec();
    }
}

module.exports = new CategoryRepository();
