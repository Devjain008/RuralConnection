const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, maxlength: 500, default: '' },
    skills: [{ type: String, trim: true }],
    education: [{
        institution: String,
        degree: String,
        year: Number
    }],
    experience: [{
        company: String,
        role: String,
        from: Date,
        to: Date,
        current: { type: Boolean, default: false }
    }],
    location: {
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' }
    },
    phone: { type: String, default: '' },
    availabilityStatus: {
        type: String,
        enum: ['AVAILABLE', 'WORKING', 'NOT_AVAILABLE', 'OPEN_TO_OPPORTUNITIES'],
        default: 'AVAILABLE'
    },
    languages: [{ type: String }],
    jobPreferences: {
        jobTypes: [{ type: String }],
        preferredLocations: [{ type: String }],
        expectedSalary: { type: Number, default: 0 }
    },
    profileImage: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
