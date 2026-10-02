const profileRepository = require('../repositories/profile.repository');
const AppError = require('../utils/AppError');

class ProfileService {
    async getProfile(userId) {
        let profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            profile = await profileRepository.createProfile({ userId });
        }
        return profile;
    }

    async updateProfile(userId, updateData) {
        const allowedFields = [
            'bio', 'skills', 'education', 'experience',
            'location', 'phone', 'availabilityStatus',
            'languages', 'jobPreferences', 'profileImage'
        ];
        const sanitized = {};
        for (const key of allowedFields) {
            if (updateData[key] !== undefined) sanitized[key] = updateData[key];
        }

        return await profileRepository.updateByUserId(userId, sanitized);
    }

    async createOrUpdateProfile(userId, updateData) {
        return await this.updateProfile(userId, updateData);
    }
}

module.exports = new ProfileService();
