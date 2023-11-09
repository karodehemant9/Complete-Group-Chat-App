const express = require('express');
const groupController = require('../controllers/group');
const authenticateUser = require('../middleware/auth');

const router = express.Router();



router.get('/:userId', authenticateUser, groupController.fetchUserGroups);
router.get('/:groupId/users', authenticateUser, groupController.fetchGroupUsers);
router.post('/makeAdmin/:activeGroupId/:userId', authenticateUser, groupController.makeAdmin);
router.post('/', authenticateUser, groupController.createGroup);

router.post('/members', authenticateUser, groupController.addMember);
router.delete('/members/:activeGroupId/:userId', authenticateUser, groupController.deleteMember);

router.delete('/leave/:activeGroupId/:userId', authenticateUser, groupController.leaveGroup);
router.delete('/delete/:activeGroupId/:userId', authenticateUser, groupController.deleteGroup);


module.exports = router;