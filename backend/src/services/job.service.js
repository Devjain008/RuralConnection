const jobRepository = require('../repositories/job.repository');
const businessRepository = require('../repositories/business.repository');
const AppError = require('../utils/AppError');

class JobService {
    async createJob(retailerId, data) {
        const business = await businessRepository.findByOwner(retailerId);
        if (!business) {
            throw new AppError('You must register your business before posting jobs', 400);
        }

        const jobData = {
            title: data.title,
            description: data.description,
            qualification: data.qualification || '',
            experience: data.experience || { min: 0, max: 5 },
            salary: data.salary || { min: 0, max: 0 },
            location: {
                city: data.location?.city || business.address?.city || '',
                state: data.location?.state || business.address?.state || '',
                pincode: data.location?.pincode || business.address?.pincode || '',
                geo: business.location || { type: 'Point', coordinates: [0, 0] }
            },
            jobType: data.jobType || 'FULL_TIME',
            skills: Array.isArray(data.skills) ? data.skills : (data.skills ? data.skills.split(',').map(s => s.trim()) : []),
            retailer: retailerId,
            business: business._id,
            status: 'OPEN'
        };

        return await jobRepository.create(jobData);
    }

    async getJobs(filters) {
        return await jobRepository.findWithFilters(filters);
    }

    async getJobById(id) {
        const job = await jobRepository.findById(id);
        if (!job) throw new AppError('Job not found', 404);
        return job;
    }

    async updateJob(id, retailerId, data) {
        const job = await jobRepository.findById(id);
        if (!job) throw new AppError('Job not found', 404);
        if (job.retailer._id.toString() !== retailerId.toString()) {
            throw new AppError('You can only update your own job postings', 403);
        }

        const allowed = ['title', 'description', 'qualification', 'experience', 'salary', 'jobType', 'skills', 'status'];
        const updateData = {};
        for (const k of allowed) {
            if (data[k] !== undefined) updateData[k] = data[k];
        }

        return await jobRepository.updateById(id, updateData);
    }

    async deleteJob(id, userId, role) {
        const job = await jobRepository.findById(id);
        if (!job) throw new AppError('Job not found', 404);
        if (role !== 'admin' && job.retailer._id.toString() !== userId.toString()) {
            throw new AppError('You can only delete your own job postings', 403);
        }
        return await jobRepository.deleteById(id);
    }

    async getRetailerJobs(retailerId) {
        return await jobRepository.findByRetailer(retailerId);
    }
}

module.exports = new JobService();
