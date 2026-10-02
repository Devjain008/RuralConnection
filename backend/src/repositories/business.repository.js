const Business = require('../models/Business');

class BusinessRepository {
    async createBusiness(data) {
        return await Business.create(data);
    }

    async create(data) {
        return await this.createBusiness(data);
    }

    async findByOwnerId(ownerId) {
        return await Business.findOne({ owner: ownerId }).exec();
    }

    async findByOwner(ownerId) {
        return await this.findByOwnerId(ownerId);
    }

    async findById(id) {
        return await Business.findById(id).populate('owner', 'name email').exec();
    }

    async updateById(id, data) {
        return await Business.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true }).exec();
    }

    async updateByOwnerId(ownerId, data) {
        return await Business.findOneAndUpdate({ owner: ownerId }, data, { returnDocument: 'after', runValidators: true }).exec();
    }

    async findAll(filters = {}) {
        let q = Business.find(filters).populate('owner', 'name email');
        if (!filters.location?.$nearSphere && !filters.location?.$near) {
            q = q.sort({ createdAt: -1 });
        }
        return await q.exec();
    }
}

module.exports = new BusinessRepository();
