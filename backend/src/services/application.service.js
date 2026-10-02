const applicationRepository = require('../repositories/application.repository');
const jobRepository = require('../repositories/job.repository');
const AppError = require('../utils/AppError');

const VALID_STATUSES = ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];

class ApplicationService {
    async applyForJob(jobId, applicantId, { coverLetter, resumeUrl }) {
        const job = await jobRepository.findById(jobId);
        if (!job || job.status !== 'OPEN') {
            throw new AppError('This job posting is not open for applications', 400);
        }

        const existing = await applicationRepository.findByJobAndApplicant(jobId, applicantId);
        if (existing) {
            throw new AppError('You have already applied for this job', 409);
        }

        const application = await applicationRepository.create({
            job: jobId,
            applicant: applicantId,
            coverLetter: coverLetter || '',
            resumeUrl: resumeUrl || '',
            status: 'APPLIED'
        });

        await jobRepository.incrementApplicationCount(jobId);
        return application;
    }

    async getMyApplications(applicantId) {
        return await applicationRepository.findByApplicant(applicantId);
    }

    async getJobApplications(jobId, retailerId) {
        const job = await jobRepository.findById(jobId);
        if (!job) throw new AppError('Job not found', 404);
        if (job.retailer._id.toString() !== retailerId.toString()) {
            throw new AppError('You can only view applications for your own jobs', 403);
        }
        return await applicationRepository.findByJob(jobId);
    }

    async updateStatus(applicationId, retailerId, status) {
        if (!VALID_STATUSES.includes(status)) {
            throw new AppError('Invalid application status', 400);
        }

        const application = await applicationRepository.findById(applicationId);
        if (!application) throw new AppError('Application not found', 404);

        const job = await jobRepository.findById(application.job._id);
        if (job.retailer._id.toString() !== retailerId.toString()) {
            throw new AppError('You can only update applications for your own jobs', 403);
        }

        return await applicationRepository.updateStatus(applicationId, status);
    }
}

module.exports = new ApplicationService();
