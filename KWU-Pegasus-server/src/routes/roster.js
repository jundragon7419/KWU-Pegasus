const express = require('express')
const router = express.Router()
const { getRoster, getRosterYears, getActiveYear } = require('../controllers/rosterController')

router.get('/years',       getRosterYears)
router.get('/active-year', getActiveYear)
router.get('/',            getRoster)

module.exports = router
