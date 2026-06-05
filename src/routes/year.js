const express = require('express')
const { addYear, getAllYears } = require('../controllers/anneeScolaire')
const { auth } = require('../middleware/authMiddleware')
const router = new express.Router()


router.post('/add', auth, addYear)

router.get('/all', auth, getAllYears)


module.exports = router