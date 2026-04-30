const express = require('express')
const router = express.Router()
const {
  getPendingMembers, approveMember, rejectMember,
  getRosterAdmin, addRosterEntry, deleteRosterEntry, updateRosterEntry,
  getOrgMembers, demoteMember,
  getBasicUsers, banUser, getBannedUsers, getBannableUsers, unbanUser,
  getMembers, getManagers, getStaffs, setManager, unsetManager, setStaff, unsetStaff,
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
router.delete('/roster/:id',             requireRole('manager','staff','root'), deleteRosterEntry)
router.put('/roster/:id',               requireRole('manager','staff','root'), updateRosterEntry)

// 멤버 관리 (staff/root)
router.get('/org-members',               requireRole('staff','root'), getOrgMembers)
router.put('/users/:id/demote-member',   requireRole('staff','root'), demoteMember)

// 일반유저 관리 (staff/root)
router.get('/basic-users',               requireRole('staff','root'), getBasicUsers)
router.put('/users/:id/ban',             requireRole('staff','root'), banUser)

// 차단 관리 (staff/root)
router.get('/banned-users',              requireRole('staff','root'), getBannedUsers)
router.get('/bannable-users',            requireRole('staff','root'), getBannableUsers)
router.put('/users/:id/unban',           requireRole('staff','root'), unbanUser)

// 매니저 관리 (staff/root)
router.get('/members',                   requireRole('staff','root'), getMembers)
router.get('/managers',                  requireRole('staff','root'), getManagers)
router.put('/users/:id/set-manager',     requireRole('staff','root'), setManager)
router.put('/users/:id/unset-manager',   requireRole('staff','root'), unsetManager)

// 스태프 관리 (root 전용)
router.get('/staffs',                    requireRole('root'), getStaffs)
router.put('/users/:id/set-staff',       requireRole('root'), setStaff)
router.put('/users/:id/unset-staff',     requireRole('root'), unsetStaff)

// 로스터 연도
router.put('/roster-year',               requireRole('manager','staff','root'), setRosterYear)

module.exports = router
