const express = require('express');
const groupController = require('../controllers/groupController');
const authenticateUser = require('../middleware/auth');

const router = express.Router();


router.post('/createGroup', authenticateUser, groupController.createGroup);
router.get('/fetchGroup/:id', authenticateUser, groupController.fetchUserGroups);
router.get('/fetchGroupUsers/:id', authenticateUser, groupController.fetchGroupUsers);
router.post('/makeAdmin/:activeGroupId/:userId', authenticateUser, groupController.makeAdmin);

router.post('/addMember', authenticateUser, groupController.addMember);
router.delete('/deleteMember/:activeGroupId/:userId', authenticateUser, groupController.deleteMember);

router.delete('/exitGroup/:activeGroupId/:userId', authenticateUser, groupController.exitGroup);
router.delete('/deleteGroup/:activeGroupId', authenticateUser, groupController.deleteGroup);



module.exports = router;