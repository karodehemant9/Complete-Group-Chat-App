const User = require('../models/user');
const Group = require('../models/group');
const GroupUser = require('../models/usergroup');
const sequelize = require('../util/database');




const createGroup = async (req, res) => {
    const data = req.body;
    if (!data || isNaN(parseInt(req.body.userId))) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    const groupName = req.body.groupName;
    const adminId = req.body.userId;


    try {
        console.log(groupName, adminId)
        const newGroup = await Group.create({ groupName, adminId });

        const groupId = newGroup.id;
        const somedata = await GroupUser.create({ groupId, userId: adminId, isGroupAdmin: true });

        res.status(200).json({ success: true, message: "Group created successfully", newGroup: { groupName, groupId } });
    } catch (err) {
        res.status(500).json({ message: "Error creating group", error: err });
    }
}





const fetchUserGroups = async (req, res) => {

    if (isNaN(parseInt(req.params.userId))) {
        return res.status(400).json({ error: 'Invalid user Id' });
    }
    try {
        let response = await GroupUser.findAll({ where: { userId: req.params.userId } });
        const groups = await Promise.all(response.map(async (res) => {
            const group = await Group.findByPk(res.groupId);
            return group;
        }));
        return res.status(200).json(groups);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching user groups", error: err });
    }
}



const fetchGroupUsers = async (req, res) => {
    if (isNaN(parseInt(req.params.groupId))) {
        return res.status(400).json({ error: 'Invalid group Id' });
    }
    const groupId = req.params.groupId;
    try {
        const response = await GroupUser.findAll({ where: { groupId } });
        const users = await Promise.all(response.map(async (res) => {
            const user = await User.findByPk(res.userId);
            return { name: user.name, userId: user.id };
        }))
        return res.status(200).json(users);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching group's users", error: err });
    }
}







const addMember = async (req, res) => {
    const groupId = req.body.activeGroupId;
    const email = req.body.email;
    const data = req.body;
    const userId = Number(req.user.id);
    if (!data || isNaN(parseInt(groupId)) || !email.includes("@")) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    try {
        const group = await Group.findOne({ where: { id: groupId } });
        if (!group) {
            return res.status(200).json({ success: false, message: "group not found" });
        }

        if (group.adminId === userId) {
            const memberToAdd = await User.findOne({ where: { email } });
            await GroupUser.create({ groupId, userId: memberToAdd.id });
            return res.status(200).json({ success: true, message: "User added to group successfully", newGroupMember: { name: memberToAdd.name, id: memberToAdd.id, message: "user added successfully" } });
        } else {
            return res.status(200).json({ success: false, message: "user is not Admin" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Error adding user to group", error: err });
    }
}




const deleteMember = async (req, res) => {
    if (isNaN(parseInt(req.user.id)) || isNaN(parseInt(req.params.activeGroupId)) || isNaN(parseInt(req.params.userId))) {
        return res.status(400).json({ error: 'Invalid request parameters' });
    }

    const activeGroupId = req.params.activeGroupId;
    const userId = Number(req.params.userId);
    const adminId = Number(req.user.id);

    try {
        const group = await Group.findOne({ where: { id: activeGroupId } });
        if (!group) {
            return res.status(200).json({ success: false, message: "group not found" });
        }
        console.log('group found');
        if (adminId !== userId) {
            if (group.adminId === adminId) {
                await GroupUser.destroy({ where: { groupId: activeGroupId, userId } });
                return res.status(200).json({ success: true, message: "Member removed from the group" });
            } else {
                return res.status(200).json({ success: false, message: "user is not Admin" });
            }
        }
        else {
            return res.status(200).json({ success: false, message: "user himself is Admin" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Error deleting group-member", error: err });
    }
}




const makeAdmin = async (req, res) => {
    if (isNaN(parseInt(req.user.id)) || isNaN(parseInt(req.params.activeGroupId)) || isNaN(parseInt(req.params.userId))) {
        return res.status(400).json({ error: 'Invalid request parameters' });
    }

    const activeGroupId = req.params.activeGroupId;
    const userId = Number(req.params.userId);
    const adminId = Number(req.user.id);

    try {
        const group = await Group.findOne({ where: { id: activeGroupId } });
        if (!group) {
            return res.status(200).json({ success: false, message: "group not found" });
        }
        if (group.adminId === adminId) {
            await GroupUser.update({ isGroupAdmin: true }, { where: { groupId: activeGroupId, userId } });
            return res.status(200).json({ success: true, message: "Member made group admin" });
        } else {
            return res.status(200).json({ success: false, message: "user is not Admin" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Error making user group-admin", error: err });

    }
}



const leaveGroup = async (req, res) => {
    if (isNaN(parseInt(req.params.activeGroupId)) || isNaN(parseInt(req.params.userId))) {
        return res.status(400).json({ error: 'Invalid request parameters' });
    }
    const activeGroupId = req.params.activeGroupId;
    const userId = req.params.userId;
    try {
        const usergroup = await GroupUser.findOne({ where: { userId, groupId: activeGroupId } });
        if (usergroup) {
            if (usergroup.isGroupAdmin !== true && usergroup.groupId !== 1) {
                console.log('usergroup.isGroupAdmin is equal to false/0');
                await usergroup.destroy();
                return res.status(200).json({ success: true, message: "user left group successfully" });
            }
            else {
                return res.status(200).json({ success: false, message: "user himself is Admin" });
            }
        }
    } catch (err) {
        return res.status(500).json({ message: "user not found in group", error: err });
    }
}





const deleteGroup = async (req, res) => {
    if (isNaN(parseInt(req.params.activeGroupId)) || isNaN(parseInt(req.params.userId))) {
        return res.status(400).json({ error: 'Invalid request parameters' });
    }
    const activeGroupId = req.params.activeGroupId;
    const userId = Number(req.params.userId);
    try {
        const group = await Group.findOne({ where: { id: activeGroupId } })
        if (!group) {
            return res.status(200).json({ success: false, message: "group not found" });
        }

        if (group.adminId === userId) {
            await GroupUser.destroy({ where: { groupId: activeGroupId } });
            await group.destroy();
            return res.status(200).json({ success: true, message: "Group deleted" });
        } else {
            return res.status(200).json({ success: false, message: "user is not Admin" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Error deleting group", error: err });
    }
}





module.exports = {
    createGroup,
    fetchUserGroups,
    fetchGroupUsers,
    addMember,
    deleteMember,
    makeAdmin,
    leaveGroup,
    deleteGroup
}