const express = require('express')
const { auth } = require('../middleware/authMiddleware')
const { getAllUsers, getUsers, getUserById, updateUser, toggleUserStatus, addUser } = require('../controllers/user')
const router = new express.Router()


router.post('/add-user', auth, addUser)

router.get('/all-users', auth, getAllUsers)

router.get('/school-users', auth, getUsers)

router.get('/:id', auth, getUserById)

router.patch('/user/update/:id', auth, updateUser)

router.patch('/toggle/:id', auth, toggleUserStatus)




module.exports = router