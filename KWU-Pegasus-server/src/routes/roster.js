const express = require('express')
const router = express.Router()
const { getRoster } = require('../controllers/rosterController')

router.get('/', getRoster)

module.exports = router
