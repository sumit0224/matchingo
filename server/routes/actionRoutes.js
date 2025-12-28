const express = require('express');
const router = express.Router();
const { swipe, getMyLikes, getMatches, likeUser, dislikeUser, superLikeUser } = require('../controllers/swipeController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/swipe', verifyToken, swipe);
router.post('/like', verifyToken, likeUser);
router.post('/dislike', verifyToken, dislikeUser);
router.post('/super-like', verifyToken, superLikeUser);
router.get('/my-likes', verifyToken, getMyLikes);
router.get('/matches', verifyToken, getMatches);

module.exports = router;
