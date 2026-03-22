const express = require('express')
const router = express.Router()
const {
  getPendingMembers, approveMember, rejectMember,
  getPendingRosterRequests, approveRosterRequest, rejectRosterRequest,
  addRetired, getRetired, deleteRetired,
  getRosterAdmin, deleteRosterEntry, updateRosterEntry,
  getUsers, setRole,
  setRosterYear,
} = require('../controllers/adminController')
const { authenticate, requireRole } = require('../middlewares/auth')

router.use(authenticate)

// 멤버 신청 관리
router.get('/pending-members',           requireRole('manager','staff','root'), getPendingMembers)
router.post('/approve-member/:id',       requireRole('manager','staff','root'), approveMember)
router.post('/reject-member/:id',        requireRole('manager','staff','root'), rejectMember)

// 로스터 신청 관리
router.get('/roster-requests',           requireRole('manager','staff','root'), getPendingRosterRequests)
router.post('/roster-requests/:id/approve', requireRole('manager','staff','root'), approveRosterRequest)
router.post('/roster-requests/:id/reject',  requireRole('manager','staff','root'), rejectRosterRequest)

// 영구결번
router.get('/retired',                   requireRole('manager','staff','root'), getRetired)
router.post('/retired',                  requireRole('staff','root'), addRetired)
router.delete('/retired/:number',        requireRole('staff','root'), deleteRetired)

// 로스터 관리 (admin CRUD)
router.get('/roster',                    requireRole('manager','staff','root'), getRosterAdmin)
router.delete('/roster/:year/:number',   requireRole('manager','staff','root'), deleteRosterEntry)
router.put('/roster/:year/:number',      requireRole('manager','staff','root'), updateRosterEntry)

// 회원 관리
router.get('/users',                     requireRole('staff','root'), getUsers)
router.put('/users/:id/role',            requireRole('staff','root'), setRole)

// 로스터 연도
router.put('/roster-year',               requireRole('staff','root'), setRosterYear)

module.exports = router
