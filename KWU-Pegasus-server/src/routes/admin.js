const express = require('express')
const router = express.Router()
const {
  getPendingMembers, approveMember, rejectMember,
  addRetired, getRetired, deleteRetired,
  getRosterAdmin, addRosterEntry, deleteRosterEntry, updateRosterEntry,
  getUsers, setRole,
  setRosterYear,
} = require('../controllers/adminController')
const { authenticate, requireRole } = require('../middlewares/auth')

router.use(authenticate)

// 멤버 신청 관리
router.get('/pending-members',           requireRole('manager','root'), getPendingMembers)
router.post('/approve-member/:id',       requireRole('manager','root'), approveMember)
router.post('/reject-member/:id',        requireRole('manager','root'), rejectMember)

// 영구결번
router.get('/retired',                   requireRole('manager','root'), getRetired)
router.post('/retired',                  requireRole('manager','root'), addRetired)
router.delete('/retired/:number',        requireRole('manager','root'), deleteRetired)

// 로스터 관리 (admin CRUD)
router.get('/roster',                    requireRole('manager','root'), getRosterAdmin)
router.post('/roster',                   requireRole('manager','root'), addRosterEntry)
router.delete('/roster/:year/:number',   requireRole('manager','root'), deleteRosterEntry)
router.put('/roster/:year/:number',      requireRole('manager','root'), updateRosterEntry)

// 회원 관리 (root 전용)
router.get('/users',                     requireRole('root'), getUsers)
router.put('/users/:id/role',            requireRole('root'), setRole)

// 로스터 연도
router.put('/roster-year',               requireRole('manager','root'), setRosterYear)

module.exports = router
