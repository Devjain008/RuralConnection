const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coverLetter: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    status: {
        type: String,
        enum: ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'],
        default: 'APPLIED'
    },
    appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

jobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
jobApplicationSchema.index({ applicant: 1 });
jobApplicationSchema.index({ job: 1 });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
