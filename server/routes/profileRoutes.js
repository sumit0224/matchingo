const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/profileController');
const verifyToken = require('../middleware/authMiddleware');

router.patch('/update', verifyToken, updateProfile);

module.exports = router;
