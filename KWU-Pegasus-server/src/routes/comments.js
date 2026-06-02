const express = require('express')
const router = express.Router()
const { getComments, createComment, updateComment, deleteComment } = require('../controllers/commentsController')
const { authenticate, requireRole } = require('../middlewares/auth')

router.get('/',     getComments)
router.post('/',    authenticate, requireRole('member', 'manager', 'staff', 'root'), createComment)
router.put('/:id',  authenticate, requireRole('member', 'manager', 'staff', 'root'), updateComment)
router.delete('/:id', authenticate, requireRole('member', 'manager', 'staff', 'root'), deleteComment)

module.exports = router
