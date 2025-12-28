const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const verifyToken = require('../middleware/authMiddleware'); // Corrected import
// const { protect } = require('../middleware/authMiddleware'); // Removed invalid destructuring

router.post('/buy', verifyToken, premiumController.buyPremium);
router.get('/status', verifyToken, premiumController.getPremiumStatus);

module.exports = router;
