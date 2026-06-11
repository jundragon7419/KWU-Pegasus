const express = require('express')
const router = express.Router()
const { getPoll, getPollByPostId, submitVote, deletePoll } = require('../controllers/pollController')
const { authenticate, optionalAuth } = require('../middlewares/auth')

router.get('/post/:postId', optionalAuth, getPollByPostId)
router.get('/:pollId', optionalAuth, getPoll)
router.post('/:pollId/vote', authenticate, submitVote)
router.delete('/:pollId', authenticate, deletePoll)

module.exports = router
