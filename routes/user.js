const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();


router.post('/signup', userController.addUser);
router.post('/login', userController.validateUser);


module.exports = router;
