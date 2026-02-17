 const express = require('express');
const { getAllVisits, createVisits, updateVisits } = require('../controllers/visitReport.controller');

 const router = express.Router();

router.route('/').post(createVisits).get(getAllVisits)
router.route('/:id').patch(updateVisits)


//router.get('/', getAllVisits)

 module.exports = router;