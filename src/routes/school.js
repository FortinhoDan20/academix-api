const express = require('express')
const { auth } = require('../middleware/authMiddleware')
const { createSchool, getAllSchools, getSchool } = require('../controllers/school')
const router = new express.Router()



router.post('/add-school', auth, createSchool)

router.get('/all', auth, getAllSchools)

router.get('/:id', auth, getSchool)





module.exports = router