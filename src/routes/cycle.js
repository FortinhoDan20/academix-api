const express = require('express')
const { auth, authorize } = require('../middleware/authMiddleware')
const { getAllCycle, getCycle, addCycle, deleteCycle } = require('../controllers/cycle')
const router = new express.Router()


router.post('/add', auth, addCycle)

router.get('/all', auth, getAllCycle)

router.get('/:id', auth, getCycle)

router.delete('/:id', auth, deleteCycle)

module.exports = router