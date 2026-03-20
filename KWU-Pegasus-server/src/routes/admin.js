const express = require('express')
const router = express.Router()
const { getPendingUsers, approveUser, rejectUser, getUsers, setRole } = require('../controllers/adminController')
const { authenticate, requireRole } = require('../middlewares/auth')

router.use(authenticate)

router.get('/pending',          requireRole('staff','root'), getPendingUsers)
router.post('/approve/:id',     requireRole('staff','root'), approveUser)
router.post('/reject/:id',      requireRole('staff','root'), rejectUser)
router.get('/users',            requireRole('staff','root'), getUsers)
router.put('/users/:id/role',   requireRole('staff','root'), setRole)

module.exports = router
