const Profile = require('../models/Profile');

class ProfileRepository {
    async findByUserId(userId) {
        return await Profile.findOne({ userId }).exec();
    }

    async createProfile(data) {
        return await Profile.create(data);
    }

    async updateByUserId(userId, updateData) {
        return await Profile.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { returnDocument: 'after', upsert: true, runValidators: true }
        ).exec();
    }
}

module.exports = new ProfileRepository();
