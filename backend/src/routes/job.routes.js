const express = require('express');
const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getMyJobs
} = require('../controllers/job.controller');
const { applyForJob, getJobApplications } = require('../controllers/application.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');

const router = express.Router();

router.get('/retailer/my', protect, authorize('retailer'), getMyJobs);
router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', protect, authorize('retailer'), createJob);
router.put('/:id', protect, authorize('retailer'), updateJob);
router.delete('/:id', protect, authorize('retailer', 'admin'), deleteJob);

// Applications tied to job
router.post('/:id/apply', protect, authorize('user'), applyForJob);
router.get('/:id/applications', protect, authorize('retailer'), getJobApplications);

module.exports = router;
