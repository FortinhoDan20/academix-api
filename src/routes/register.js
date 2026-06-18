const express = require('express')
const { getAllRegister, detailsRegister, allRegisterNoFeePaid } = require('../controllers/register')
const { auth } = require('../middleware/authMiddleware')
const router = new express.Router()



router.get('/all', auth, getAllRegister)

router.get('/all-no-feepaid', auth, allRegisterNoFeePaid)

router.get('/id', auth, detailsRegister)


module.exports = router