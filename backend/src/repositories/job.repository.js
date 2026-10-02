const Job = require('../models/Job');

class JobRepository {
    async create(data) {
        return await Job.create(data);
    }

    async findById(id) {
        return await Job.findById(id)
            .populate('retailer', 'name email')
            .populate('business', 'businessName address phone location')
            .exec();
    }

    async findWithFilters({ search, jobType, skills, minSalary, maxSalary, lat, lng, distance, status = 'OPEN', page = 1, limit = 10 }) {
        const query = { status };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'location.city': { $regex: search, $options: 'i' } }
            ];
        }
        if (jobType) query.jobType = jobType;
        if (skills) query.skills = { $in: skills.split(',').map(s => s.trim()) };
        if (minSalary) query['salary.min'] = { $gte: Number(minSalary) };
        if (maxSalary) query['salary.max'] = { $lte: Number(maxSalary) };

        const skip = (Number(page) - 1) * Number(limit);
        const safeLimit = Math.min(Number(limit), 100);

        let queryBuilder;
        if (lat && lng) {
            queryBuilder = Job.find({
                ...query,
                'location.geo.coordinates': { $exists: true, $ne: [] }
            }).where('location.geo').nearSphere({
                center: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
                maxDistance: (Number(distance) || 20) * 1000,
                spherical: true
            });
        } else {
            queryBuilder = Job.find(query).sort({ createdAt: -1 });
        }

        const [jobs, total] = await Promise.all([
            queryBuilder.skip(skip).limit(safeLimit)
                .populate('retailer', 'name')
                .populate('business', 'businessName address phone location')
                .exec(),
            Job.countDocuments(query)
        ]);

        return { jobs, total, page: Number(page), limit: safeLimit };
    }

    async findByRetailer(retailerId) {
        return await Job.find({ retailer: retailerId }).sort({ createdAt: -1 }).exec();
    }

    async updateById(id, data) {
        return await Job.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true }).exec();
    }

    async deleteById(id) {
        return await Job.findByIdAndDelete(id).exec();
    }

    async incrementApplicationCount(jobId) {
        return await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } }).exec();
    }
}

module.exports = new JobRepository();
