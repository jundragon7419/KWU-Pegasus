const express = require('express')
const router = express.Router()
const { getNotices, getNotice, createNotice, updateNotice, deleteNotice } = require('../controllers/noticesController')

router.get('/',     getNotices)
router.get('/:id',  getNotice)
router.post('/',    createNotice)
router.put('/:id',  updateNotice)
router.delete('/:id', deleteNotice)

module.exports = router
