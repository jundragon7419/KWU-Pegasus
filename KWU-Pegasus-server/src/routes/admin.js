const express = require('express')
const router = express.Router()
const {
  getPendingMembers, approveMember, rejectMember,
  getRosterAdmin, addRosterEntry, deleteRosterEntry, updateRosterEntry,
  getUsers, getMembers, setRole, setManager,
  setRosterYear,
} = require('../controllers/adminController')
const { authenticate, requireRole } = require('../middlewares/auth')

router.use(authenticate)

// 멤버 신청 관리
router.get('/pending-members',           requireRole('manager','staff','root'), getPendingMembers)
router.post('/approve-member/:id',       requireRole('manager','staff','root'), approveMember)
router.post('/reject-member/:id',        requireRole('manager','staff','root'), rejectMember)

// 로스터 관리 (admin CRUD)
router.get('/roster',                    requireRole('manager','staff','root'), getRosterAdmin)
router.post('/roster',                   requireRole('manager','staff','root'), addRosterEntry)
router.delete('/roster/:year/:number',   requireRole('manager','staff','root'), deleteRosterEntry)
router.put('/roster/:year/:number',      requireRole('manager','staff','root'), updateRosterEntry)

// 회원 관리 (root 전용)
router.get('/users',                     requireRole('root'), getUsers)
router.put('/users/:id/role',            requireRole('root'), setRole)

// 매니저 임명 (staff/root)
router.get('/members',                   requireRole('staff','root'), getMembers)
router.put('/users/:id/set-manager',     requireRole('staff','root'), setManager)

// 로스터 연도
router.put('/roster-year',               requireRole('manager','staff','root'), setRosterYear)

module.exports = router
