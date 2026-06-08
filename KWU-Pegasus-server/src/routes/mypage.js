const express = require('express')
const router = express.Router()
const { getMe, checkUsername, checkEmail, updateAccount, updateProfile, requestMembership, getRosterHistory, getMyPosts, getMyPostsAll, getMyComments, getMyCommentsAll, getMyVotesAll, withdrawUser } = require('../controllers/mypageController')
const { authenticate } = require('../middlewares/auth')

router.use(authenticate)

router.get('/me',                 getMe)
router.get('/check-username',     checkUsername)
router.get('/check-email',        checkEmail)
router.put('/account',            updateAccount)
router.put('/profile',            updateProfile)
router.post('/membership-request', requestMembership)
router.get('/roster-history',     getRosterHistory)
router.get('/posts',              getMyPosts)
router.get('/posts/all',          getMyPostsAll)
router.get('/comments',           getMyComments)
router.get('/comments/all',       getMyCommentsAll)
router.get('/votes/all',          getMyVotesAll)
router.delete('/withdraw',        withdrawUser)

module.exports = router
