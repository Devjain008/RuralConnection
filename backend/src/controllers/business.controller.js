const businessService = require('../services/business.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

exports.createBusiness = asyncHandler(async (req, res) => {
    const business = await businessService.createBusiness(req.user._id, req.body);
    sendSuccess(res, 201, business);
});

exports.getAllBusinesses = asyncHandler(async (req, res) => {
    const businesses = await businessService.getAllBusinesses(req.query);
    sendSuccess(res, 200, businesses);
});

exports.getMyBusiness = asyncHandler(async (req, res, next) => {
    const business = await businessService.getMyBusiness(req.user._id);
    if (!business) return next(new AppError('Business not found', 404));
    sendSuccess(res, 200, business);
});

exports.getBusinessById = asyncHandler(async (req, res, next) => {
    const business = await businessService.getBusinessById(req.params.id);
    if (!business) return next(new AppError('Business not found', 404));
    sendSuccess(res, 200, business);
});

exports.updateBusiness = asyncHandler(async (req, res) => {
    const business = await businessService.updateBusiness(req.user._id, req.body);
    sendSuccess(res, 200, business);
});

exports.verifyBusiness = asyncHandler(async (req, res) => {
    const business = await businessService.verifyBusiness(req.params.id, req.body.status);
    sendSuccess(res, 200, business);
});
