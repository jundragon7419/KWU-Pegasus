const express = require('express')
const router = express.Router()
const { getMe, checkUsername, checkEmail, updateAccount, updateProfile, requestMembership, getRosterHistory } = require('../controllers/mypageController')
const { authenticate } = require('../middlewares/auth')

router.use(authenticate)

router.get('/me',                 getMe)
router.get('/check-username',     checkUsername)
router.get('/check-email',        checkEmail)
router.put('/account',            updateAccount)
router.put('/profile',            updateProfile)
router.post('/membership-request', requestMembership)
router.get('/roster-history',     getRosterHistory)

module.exports = router
