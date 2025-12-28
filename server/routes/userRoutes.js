const express = require('express');
const router = express.Router();
const { updateProfile, addPhoto, getFeed, getExploreUsers } = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

router.patch('/update', verifyToken, updateProfile);
router.post('/photo', verifyToken, addPhoto);
router.get('/feed', verifyToken, getFeed);
router.get('/explore', verifyToken, getExploreUsers);

module.exports = router;
