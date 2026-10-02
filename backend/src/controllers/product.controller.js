const productService = require('../services/product.service');
const { searchAutocomplete, addProductToTrie } = require('../utils/productTrie');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

exports.createProduct = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.user.id, req.body);
    addProductToTrie(product);
    return sendSuccess(res, { statusCode: 201, message: "Product created successfully", data: product });
});

exports.getProducts = asyncHandler(async (req, res) => {
    const result = await productService.getProducts(req.query);
    const totalPages = Math.ceil(result.total / result.limit) || 1;
    return sendSuccess(res, {
        statusCode: 200,
        data: result.products,
        pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages,
            hasNextPage: result.page < totalPages,
            hasPrevPage: result.page > 1
        }
    });
});

exports.getProductById = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(req.params.id, req.user.id, req.body);
    return sendSuccess(res, { statusCode: 200, message: "Product updated successfully", data: product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
    await productService.deleteProduct(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, { statusCode: 200, message: "Product deleted successfully" });
});

exports.getMyProducts = asyncHandler(async (req, res) => {
    const products = await productService.getSellerProducts(req.user.id);
    return sendSuccess(res, { statusCode: 200, data: products });
});

exports.autocomplete = asyncHandler(async (req, res) => {
    const { q, limit } = req.query;
    if (!q) {
        return sendSuccess(res, { statusCode: 200, data: [] });
    }
    const suggestions = await searchAutocomplete(q, limit ? Number(limit) : 5);
    return sendSuccess(res, { statusCode: 200, data: suggestions });
});
