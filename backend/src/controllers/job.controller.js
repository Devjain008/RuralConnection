const jobService = require('../services/job.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

exports.createJob = asyncHandler(async (req, res) => {
    const job = await jobService.createJob(req.user.id, req.body);
    return sendSuccess(res, { statusCode: 201, message: "Job posted successfully", data: job });
});

exports.getJobs = asyncHandler(async (req, res) => {
    const result = await jobService.getJobs(req.query);
    const totalPages = Math.ceil(result.total / result.limit) || 1;
    return sendSuccess(res, {
        statusCode: 200,
        data: result.jobs,
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

exports.getJobById = asyncHandler(async (req, res) => {
    const job = await jobService.getJobById(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: job });
});

exports.updateJob = asyncHandler(async (req, res) => {
    const job = await jobService.updateJob(req.params.id, req.user.id, req.body);
    return sendSuccess(res, { statusCode: 200, message: "Job updated successfully", data: job });
});

exports.deleteJob = asyncHandler(async (req, res) => {
    await jobService.deleteJob(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, { statusCode: 200, message: "Job deleted successfully" });
});

exports.getMyJobs = asyncHandler(async (req, res) => {
    const jobs = await jobService.getRetailerJobs(req.user.id);
    return sendSuccess(res, { statusCode: 200, data: jobs });
});
