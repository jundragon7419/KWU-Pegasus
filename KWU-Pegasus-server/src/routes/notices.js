const express = require('express')
const router = express.Router()
const { getNotices, getNotice, createNotice, updateNotice, deleteNotice } = require('../controllers/noticesController')
const { authenticate, requireRole } = require('../middlewares/auth')

router.get('/',       getNotices)
router.get('/:id',    getNotice)
router.post('/',      authenticate, requireRole('manager', 'staff', 'root'), createNotice)
router.put('/:id',    authenticate, requireRole('manager', 'staff', 'root'), updateNotice)
router.delete('/:id', authenticate, requireRole('manager', 'staff', 'root'), deleteNotice)

module.exports = router
