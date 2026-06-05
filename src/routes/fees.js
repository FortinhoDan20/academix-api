const express = require('express')
const { createFees, getAllFees } = require('../controllers/fees')
const { auth } = require('../middleware/authMiddleware')
const router = new express.Router()





router.post('/add', auth, createFees)

router.get('/all', auth,  getAllFees)






module.exports = router