const express = require('express')
const router = express.Router()
const { getEvents, createEvent, deleteEvent } = require('../controllers/eventsController')
const { authenticate, requireRole } = require('../middlewares/auth')

router.get('/',       getEvents)
router.post('/',      authenticate, requireRole('manager', 'staff', 'root'), createEvent)
router.delete('/:id', authenticate, requireRole('manager', 'staff', 'root'), deleteEvent)

module.exports = router
