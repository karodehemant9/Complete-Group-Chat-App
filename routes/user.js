const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();

router.post('/signup', userController.addUser);

router.post('/signin', userController.validateUser);




module.exports = router;


