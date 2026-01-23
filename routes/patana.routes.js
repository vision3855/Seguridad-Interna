const express = require('express');
const {newPatana, getAllPatana} = require('../controllers/patana.controllers');
const router = express.Router();


// define the home page route
router.post('/', newPatana)
router.get('/', getAllPatana)
// define the about route
router.get('/about', (req, res) => {
  res.send('About birds')
})

module.exports = router
