const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    qualification: String,
    experience: {
        min: Number,
        max: Number
    },
    salary: {
        min: Number,
        max: Number
    },
    location: {
        city: String,
        state: String,
        pincode: String,
        geo: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: [Number]
        }
    },
    jobType: { type: String, enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERNSHIP'], required: true },
    skills: [{ type: String }],
    retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    status: { type: String, enum: ['OPEN', 'CLOSED', 'PAUSED'], default: 'OPEN' },
    applicationCount: { type: Number, default: 0 }
}, { timestamps: true });

jobSchema.index({ 'location.geo': '2dsphere' });
jobSchema.index({ retailer: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
