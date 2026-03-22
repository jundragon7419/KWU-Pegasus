const express = require('express')
const router = express.Router()
const { getMe, updateProfile, requestMembership } = require('../controllers/mypageController')
const { authenticate } = require('../middlewares/auth')

router.use(authenticate)

router.get('/me',                 getMe)
router.put('/profile',            updateProfile)
router.post('/membership-request', requestMembership)

module.exports = router
