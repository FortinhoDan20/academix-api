const express = require('express')
const { getAllOptions, addOption } = require('../controllers/option')
const { auth,  } = require('../middleware/authMiddleware')
const router = new express.Router()


router.post('/add', auth, addOption)

router.get('/all', auth, getAllOptions)


module.exports = router