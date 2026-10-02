const JobApplication = require('../models/JobApplication');

class ApplicationRepository {
    async create(data) {
        return await JobApplication.create(data);
    }

    async findById(id) {
        return await JobApplication.findById(id)
            .populate('job', 'title business')
            .populate('applicant', 'name email')
            .exec();
    }

    async findByJobAndApplicant(jobId, applicantId) {
        return await JobApplication.findOne({ job: jobId, applicant: applicantId }).exec();
    }

    async findByApplicant(applicantId) {
        return await JobApplication.find({ applicant: applicantId })
            .populate('job', 'title jobType location salary status')
            .sort({ appliedAt: -1 })
            .exec();
    }

    async findByJob(jobId) {
        return await JobApplication.find({ job: jobId })
            .populate('applicant', 'name email')
            .sort({ appliedAt: -1 })
            .exec();
    }

    async updateStatus(id, status) {
        return await JobApplication.findByIdAndUpdate(
            id,
            { status },
            { returnDocument: 'after' }
        ).exec();
    }
}

module.exports = new ApplicationRepository();
