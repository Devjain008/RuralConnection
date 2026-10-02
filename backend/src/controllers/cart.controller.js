const cartService = require('../services/cart.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

exports.getCart = asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user.id);
    return sendSuccess(res, { statusCode: 200, data: cart });
});

exports.addToCart = asyncHandler(async (req, res) => {
    const cart = await cartService.addToCart(req.user.id, req.body);
    return sendSuccess(res, { statusCode: 200, message: "Item added to cart", data: cart });
});

exports.removeFromCart = asyncHandler(async (req, res) => {
    const cart = await cartService.removeFromCart(req.user.id, req.params.productId);
    return sendSuccess(res, { statusCode: 200, message: "Item removed from cart", data: cart });
});
