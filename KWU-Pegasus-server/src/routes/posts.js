const express = require('express')
const router = express.Router()
const { getPosts, getPost, createPost, updatePost, deletePost } = require('../controllers/postsController')
const { authenticate, requireRole } = require('../middlewares/auth')

router.get('/',       getPosts)
router.get('/:id',    getPost)
router.post('/',      authenticate, requireRole('player', 'manager', 'staff', 'root'), createPost)
router.put('/:id',    authenticate, requireRole('player', 'manager', 'staff', 'root'), updatePost)
router.delete('/:id', authenticate, requireRole('player', 'manager', 'staff', 'root'), deletePost)

module.exports = router
