const express = require('express')
const { auth } = require('../middleware/authMiddleware')
const { addStudent, getAllStudents, getStudentById, updateStudent } = require('../controllers/student')
const router = express.Router()


router.post('/add', auth, addStudent)

router.get('/all', auth, getAllStudents)

router.get('/:id', auth, getStudentById)

router.patch('/:id', auth, updateStudent)

module.exports = router