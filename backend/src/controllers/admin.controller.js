const User = require('../models/User');
const Business = require('../models/Business');
const Product = require('../models/Product');
const Job = require('../models/Job');
const Order = require('../models/Order');
const businessService = require('../services/business.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

exports.getUsers = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find({}, '-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments()
    ]);

    return sendSuccess(res, {
        statusCode: 200,
        data: users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }
    });
});

exports.updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!['user', 'retailer', 'admin'].includes(role)) {
        throw new AppError('Invalid role specified', 400);
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { returnDocument: 'after' }
    ).select('-password');

    if (!user) throw new AppError('User not found', 404);

    return sendSuccess(res, { statusCode: 200, message: "User role updated", data: user });
});

exports.getBusinesses = asyncHandler(async (req, res) => {
    const status = req.query.status;
    const filter = status ? { verificationStatus: status } : {};
    const businesses = await Business.find(filter).populate('owner', 'name email').sort({ createdAt: -1 });
    return sendSuccess(res, { statusCode: 200, data: businesses });
});

exports.verifyBusiness = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
        throw new AppError('Status must be APPROVED or REJECTED', 400);
    }
    const business = await businessService.verifyBusiness(req.params.id, status);
    return sendSuccess(res, { statusCode: 200, message: `Business ${status.toLowerCase()}`, data: business });
});

exports.getAnalytics = asyncHandler(async (req, res) => {
    const [totalUsers, totalBusinesses, totalProducts, totalJobs, totalOrders] = await Promise.all([
        User.countDocuments(),
        Business.countDocuments(),
        Product.countDocuments({ isActive: true }),
        Job.countDocuments({ status: 'OPEN' }),
        Order.countDocuments()
    ]);

    return sendSuccess(res, {
        statusCode: 200,
        data: {
            totalUsers,
            totalBusinesses,
            totalProducts,
            totalJobs,
            totalOrders
        }
    });
});

exports.getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate('user', 'name email')
        .populate('seller', 'name email')
        .sort({ createdAt: -1 })
        .limit(50);
    return sendSuccess(res, { statusCode: 200, data: orders });
});
