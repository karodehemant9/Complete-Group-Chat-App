const express = require('express');
const messageController = require('../controllers/messageController');
const authenticateUser = require('../middleware/auth');

const router = express.Router();


router.post('/sendMessage', authenticateUser, messageController.sendMessage);
router.get('/getMessage/:groupId', authenticateUser, messageController.getMessage);


module.exports = router;