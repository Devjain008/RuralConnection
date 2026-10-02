const categoryRepository = require('../repositories/category.repository');
const AppError = require('../utils/AppError');

class CategoryService {
    async getAllCategories() {
        return await categoryRepository.findAll();
    }

    async createCategory({ name, description, icon }) {
        if (!name) throw new AppError('Category name is required', 400);
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const existing = await categoryRepository.findBySlug(slug);
        if (existing) throw new AppError('Category with this name already exists', 409);
        return await categoryRepository.create({ name, slug, description, icon, isActive: true });
    }

    async updateCategory(id, data) {
        const category = await categoryRepository.findById(id);
        if (!category) throw new AppError('Category not found', 404);
        return await categoryRepository.updateById(id, data);
    }

    async deleteCategory(id) {
        const category = await categoryRepository.findById(id);
        if (!category) throw new AppError('Category not found', 404);
        return await categoryRepository.deleteById(id);
    }
}

module.exports = new CategoryService();
