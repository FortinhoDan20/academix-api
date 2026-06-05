const express = require('express')
const { auth } = require('../middleware/authMiddleware')
const { addClassroom, getAllClassrooms } = require('../controllers/classroom')
const router = new express.Router()



router.post('/add', auth, addClassroom)

router.get('/all', auth, getAllClassrooms )

module.exports = router