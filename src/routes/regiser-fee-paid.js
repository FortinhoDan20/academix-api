const express = require('express')
const { newRegisterPaid, getAllRegisterPaid, getRegisterRecu } = require('../controllers/mvtRegisterFeePaid')
const router = new express.Router()
const { auth,  } = require('../middleware/authMiddleware')



router.post('/add', auth,  newRegisterPaid)

router.get('/all', auth, getAllRegisterPaid)

router.get('/:id', auth, getRegisterRecu)


module.exports = router