const express = require('express');
const messageController = require('../controllers/message');
const authenticateUser = require('../middleware/auth');
const multer = require('multer')
const upload = multer()

const router = express.Router();


router.post('/', authenticateUser, messageController.sendMessage);
router.post('/uploadFile', authenticateUser, upload.single('file'), messageController.uploadFile);
router.get('/:groupId', authenticateUser, messageController.getMessage);



module.exports = router;