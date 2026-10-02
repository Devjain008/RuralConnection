const orderService = require('../services/order.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

exports.checkout = asyncHandler(async (req, res) => {
    const orders = await orderService.checkout(req.user.id, req.body);
    return sendSuccess(res, { statusCode: 201, message: "Order placed successfully", data: orders });
});

exports.getMyOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getMyOrders(req.user.id);
    return sendSuccess(res, { statusCode: 200, data: orders });
});

exports.getOrderById = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, { statusCode: 200, data: order });
});

exports.getSellerOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getSellerOrders(req.user.id);
    return sendSuccess(res, { statusCode: 200, data: orders });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, req.user.id, status);
    return sendSuccess(res, { statusCode: 200, message: "Order status updated", data: order });
});

exports.cancelOrder = asyncHandler(async (req, res) => {
    const order = await orderService.cancelOrder(req.params.id, req.user.id);
    return sendSuccess(res, { statusCode: 200, message: "Order cancelled successfully", data: order });
});
