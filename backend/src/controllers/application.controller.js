const applicationService = require('../services/application.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

exports.applyForJob = asyncHandler(async (req, res) => {
    const application = await applicationService.applyForJob(req.params.id, req.user.id, req.body);
    return sendSuccess(res, { statusCode: 201, message: "Application submitted successfully", data: application });
});

exports.getMyApplications = asyncHandler(async (req, res) => {
    const applications = await applicationService.getMyApplications(req.user.id);
    return sendSuccess(res, { statusCode: 200, data: applications });
});

exports.getJobApplications = asyncHandler(async (req, res) => {
    const applications = await applicationService.getJobApplications(req.params.id, req.user.id);
    return sendSuccess(res, { statusCode: 200, data: applications });
});

exports.updateApplicationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const application = await applicationService.updateStatus(req.params.id, req.user.id, status);
    return sendSuccess(res, { statusCode: 200, message: "Application status updated", data: application });
});
