const express = require('express');
const { createIngreso, getAllIngreso, getByDate } = require('../controllers/ingresoPatana.controllers');

const router = express.Router();


// define the home page route
router.post('/', createIngreso)
router.get('/', getAllIngreso)
router.post('/date', getByDate)

// define the about route
router.get('/about', (req, res) => {
  res.send('About birds')
})

module.exports = router