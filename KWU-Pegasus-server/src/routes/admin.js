const express = require('express')
const router = express.Router()
const { getPendingUsers, approveUser, rejectUser, getUsers, setRole, setRosterYear, getMembers, addMember, deleteMember } = require('../controllers/adminController')
const { authenticate, requireRole } = require('../middlewares/auth')

router.use(authenticate)

router.get('/pending',          requireRole('staff','root'), getPendingUsers)
router.post('/approve/:id',     requireRole('staff','root'), approveUser)
router.post('/reject/:id',      requireRole('staff','root'), rejectUser)
router.get('/users',            requireRole('staff','root'), getUsers)
router.put('/users/:id/role',   requireRole('staff','root'), setRole)
router.put('/roster-year',      requireRole('staff','root'), setRosterYear)
router.get('/members',          requireRole('staff','root'), getMembers)
router.post('/members',         requireRole('staff','root'), addMember)
router.delete('/members/:student_id', requireRole('staff','root'), deleteMember)

module.exports = router
