const express = require('express')
const { auth } = require('../middleware/authMiddleware')
const { loginUser } = require('../controllers/auth')
const router = new express.Router()


//router.post('/add-super-admin', auth, AddSuperAdmin)

router.post('/login', loginUser)




module.exports = router