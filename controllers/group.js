const Message = require('../models/message');
const User = require('../models/user');
const Group = require('../models/group');
const Usergroup = require('../models/usergroup');

const createGroup = async (req, res)=>{
    const groupname = req.body.groupname;
    const adminId = req.body.userId;
    try{
        console.log(groupname,adminId)
        const newGroup = await Group.create({groupname: groupname, adminId: adminId, userId: adminId})
        console.log("=>>>>>>>>>>>>>>>>",newGroup)
        const groupId = newGroup.id;
         const somedata = await Usergroup.create({groupId: groupId, userId: adminId, isGroupAdmin: true })  
        console.log("=>>>>>>>>>>>>>>>>",somedata)
        res.status(200).json({success: true, message: "Group created successfully",newGroup:{groupname: groupname, groupId: groupId}})  
    }catch(err){
        res.status(500).json({message: "Error creating group", error:err})

    }
}

const fetchGroups = async(req, res)=>{
    console.log(req)
    try{
        response = await Usergroup.findAll({where:{userId: req.params.id}})
        const groups = await Promise.all(response.map(async(res)=>{
            const group = await Group.findByPk(res.groupId);
            return group;
        }));
        res.status(200).json(groups);
    }catch(err){
        res.status(500).json(err)
    }
}

const fetchGroupUsers = async (req, res)=>{
    const groupId = req.params.id;
    try{
        const response = await Usergroup.findAll({where:{groupId: groupId}});
        const users = await Promise.all(response.map(async(res)=>{
            const user = await User.findByPk(res.userId);
            return {name: user.name, userId: user.id};
        }))
        console.log(users);
        res.status(200).json(users)
    }catch(err){
        console.log(err)
    }
    
}

const addMember = async (req, res)=>{
    const groupId = req.body.activeGroupId;
    const email = req.body.email;
    try{
        const memberToAdd = await User.findOne({where:{email:email}})  
        await Usergroup.create({groupId: groupId, userId: memberToAdd.id }) ;
        res.status(200).json({success: true, message: "Group created successfully",newGroupMember:{name: memberToAdd.name, id:memberToAdd.id,  message: "user added successfully"}})  
    }catch(err){
        res.status(500).json({message: "Error adding user to group", error:err})

    }
}


const deleteMember = async (req, res)=>{
    const activeGroupId = req.params.activeGroupId;
    const userId = req.params.userId;
    const adminId = req.user.id;
    console.log(activeGroupId, userId, adminId);

    try{
        const group = await Group.findOne({where:{id:activeGroupId}}) 
        if(!group) return res.status(200).json({success: false, message: "group not found"})  

        if(group.isAdmin && group.userId===adminId){
            await Usergroup.destroy({where:{groupId:activeGroupId, userId: userId}});
            return res.status(200).json({success: true, message: "Member removed from the group"})  
        }else{
           return  res.status(200).json({success: false, message: "user is not Admin"})  
        }
    }catch(err){
        return res.status(500).json({message: "Error deleting group-member", error:err})

    }
}

const makeAdmin = async (req, res)=>{
    const activeGroupId = req.params.activeGroupId;
    const userId = req.params.userId;
    const adminId = req.user.id;
    console.log(activeGroupId, userId, adminId);
    try{
        const group = await Group.findOne({where:{id:activeGroupId}}) 
        if(!group) return res.status(200).json({success: false, message: "group not found"})  

        if(group.isAdmin && group.userId===adminId){
            await Usergroup.update({isGroupAdmin: true},{where:{groupId:activeGroupId, userId: userId}});
            return res.status(200).json({success: true, message: "Member removed from the group"})  
        }else{
           return  res.status(200).json({success: false, message: "user is not Admin"})  
        }
    }catch(err){
        return res.status(500).json({message: "Error deleting group-member", error:err})

    }
}

const exitGroup = async (req, res)=>{
    const activeGroupId = req.params.activeGroupId;
    const userId = req.params.userId;
    try{
        const usergroup = await Usergroup.findOne({where:{userId:userId, groupId:activeGroupId}}) 
       if(usergroup){
        await usergroup.destroy();
        res.status(200).json({success: true, message: "user left group successfully"})  
        }
        
    }catch(err){
        res.status(500).json({message: "user not found in group", error:err})

    }
}

const deleteGroup = async (req, res)=>{
    const activeGroupId = req.params.activeGroupId;
    const userId = req.params.userId;
    try{
        const group = await Group.findOne({where:{id:activeGroupId}}) 
        if(!group) return res.status(200).json({success: false, message: "group not found"})  

        if(group.isAdmin){
            await group.destroy();
            await Usergroup.destroy({where:{groupId:activeGroupId}});
            return res.status(200).json({success: true, message: "Group deleted"})  
        }else{
           return  res.status(200).json({success: false, message: "user is not Admin"})  
        }
    }catch(err){
        return res.status(500).json({message: "Error deleting group", error:err})

    }
}





module.exports = {
    createGroup,
    fetchGroups,
    fetchGroupUsers,
    addMember,
    deleteMember,
    makeAdmin,
    exitGroup,
    deleteGroup
}