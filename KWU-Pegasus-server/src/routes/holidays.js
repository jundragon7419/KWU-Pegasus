const express = require('express')
const router = express.Router()
const { getHolidays } = require('../controllers/holidaysController')

router.get('/', getHolidays)

module.exports = router
