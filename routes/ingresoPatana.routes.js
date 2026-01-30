const express = require('express');
const { createIngreso, getAllIngreso } = require('../controllers/ingresoPatana.controllers');

const router = express.Router();


// define the home page route
router.post('/', createIngreso)
router.get('/', getAllIngreso)

// define the about route
router.get('/about', (req, res) => {
  res.send('About birds')
})

module.exports = router