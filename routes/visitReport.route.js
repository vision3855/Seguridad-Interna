 const express = require('express');
const { getAllVisits, createVisits, updateVisits } = require('../controllers/visitReport.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.route('/').post(authMiddleware.protect, createVisits).get(authMiddleware.protect, getAllVisits)
router.route('/:id').patch(updateVisits)


//router.get('/', getAllVisits)

 module.exports = router;