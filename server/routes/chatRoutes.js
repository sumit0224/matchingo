const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getMatches } = require('../controllers/chatController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/matches', verifyToken, getMatches);
router.post('/message', verifyToken, sendMessage);
router.get('/message/:matchId', verifyToken, getMessages);

module.exports = router;
