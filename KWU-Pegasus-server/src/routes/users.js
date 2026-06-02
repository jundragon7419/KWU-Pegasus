const express = require('express')
const router = express.Router()
const { getUser, getUserLogs, getUserPosts, getUserComments } = require('../controllers/usersController')

router.get('/:username',          getUser)
router.get('/:username/logs',     getUserLogs)
router.get('/:username/posts',    getUserPosts)
router.get('/:username/comments', getUserComments)

module.exports = router
