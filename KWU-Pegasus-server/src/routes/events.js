const express = require('express')
const router = express.Router()
const { getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventsController')
const { authenticate, requireRole } = require('../middlewares/auth')

router.get('/',       getEvents)
router.post('/',      authenticate, requireRole('manager', 'staff', 'root'), createEvent)
router.put('/:id',    authenticate, requireRole('manager', 'staff', 'root'), updateEvent)
router.delete('/:id', authenticate, requireRole('manager', 'staff', 'root'), deleteEvent)

module.exports = router
