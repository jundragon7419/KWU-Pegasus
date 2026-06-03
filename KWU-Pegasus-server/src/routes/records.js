const express = require('express')
const router = express.Router()
const { getBatting, getPitching } = require('../controllers/recordsController')

router.get('/batting',  getBatting)
router.get('/pitching', getPitching)

module.exports = router
