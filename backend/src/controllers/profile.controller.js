const profileService = require('../services/profile.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

exports.getMyProfile = asyncHandler(async (req, res, next) => {
    const profile = await profileService.getProfile(req.user._id);
    if (!profile) {
        return next(new AppError('Profile not found', 404));
    }
    sendSuccess(res, 200, profile);
});

exports.updateMyProfile = asyncHandler(async (req, res, next) => {
    const profile = await profileService.createOrUpdateProfile(req.user._id, req.body);
    sendSuccess(res, 200, profile);
});
