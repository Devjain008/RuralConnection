const categoryService = require('../services/category.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

exports.getAllCategories = asyncHandler(async (req, res) => {
    const categories = await categoryService.getAllCategories();
    return sendSuccess(res, { statusCode: 200, data: categories });
});

exports.createCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.createCategory(req.body);
    return sendSuccess(res, { statusCode: 201, message: "Category created successfully", data: category });
});

exports.updateCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return sendSuccess(res, { statusCode: 200, message: "Category updated successfully", data: category });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
    await categoryService.deleteCategory(req.params.id);
    return sendSuccess(res, { statusCode: 200, message: "Category deleted successfully" });
});
