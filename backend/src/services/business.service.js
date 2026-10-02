const businessRepository = require('../repositories/business.repository');
const AppError = require('../utils/AppError');

class BusinessService {
    async createBusiness(ownerId, data) {
        const existing = await businessRepository.findByOwnerId(ownerId);
        if (existing) {
            return await businessRepository.updateByOwnerId(ownerId, data);
        }
        return await businessRepository.createBusiness({ ...data, owner: ownerId });
    }

    async getMyBusiness(ownerId) {
        return await businessRepository.findByOwnerId(ownerId);
    }

    async updateBusiness(ownerId, data) {
        return await businessRepository.updateByOwnerId(ownerId, data);
    }

    async getAllBusinesses(filters) {
        const query = {};
        if (filters.category) query.category = filters.category;
        if (filters.isActive !== undefined) query.isActive = filters.isActive;
        if (filters.search) {
            query.$or = [
                { businessName: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } },
                { 'address.city': { $regex: filters.search, $options: 'i' } }
            ];
        }

        if (filters.lat && filters.lng && filters.distance) {
            query.location = {
                $nearSphere: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(filters.lng), parseFloat(filters.lat)] },
                    $maxDistance: parseFloat(filters.distance) * 1000
                }
            };
        }
        return await businessRepository.findAll(query);
    }

    async getBusinessById(id) {
        return await businessRepository.findById(id);
    }

    async verifyBusiness(id, status) {
        return await businessRepository.updateById(id, { verificationStatus: status });
    }
}

module.exports = new BusinessService();
