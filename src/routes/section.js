const express = require('express')
const { createSection, getSection, getAllSectionCyle, getAllSection } = require('../controllers/section')
const { auth } = require('../middleware/authMiddleware')
const router = new express.Router()


router.post('/add/', auth, createSection)

router.get('/all/', auth, getAllSection)

router.get('/all/:id', auth, getAllSectionCyle)

router.get('/:id', auth, getSection)
 

module.exports = router