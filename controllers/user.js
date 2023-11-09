const User = require('../models/user');
const Group = require('../models/group');
const GroupUser = require('../models/usergroup');

const bcrypt = require('bcrypt');
const sequelize = require('../util/database');
const jwt = require('jsonwebtoken');


const encryptionKey = process.env.TOKEN_SECRET;
function generateAccessToken(user) {
  return jwt.sign({ user: user }, encryptionKey)
}


function isStringInvalid(string) {
  if (string === undefined || string.length === 0) {
    return true;
  }
  else {
    return false;
  }
}


exports.addUser = async (req, res, next) => {
  const data = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const name = req.body.name;
  console.log(name);
  const email = req.body.email;
  console.log(email);
  const password = req.body.password;
  console.log(password);
  const phoneNo = req.body.phoneNo;
  console.log(phoneNo);

  if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(password) || isNaN(parseInt(phoneNo))) {
    return res.status(400).json({ err: 'Bad Parameters. Something is missing' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    console.log(user);

    if (user) {
      return res.status(200).json({ message: 'User already exists', success: false });
    }

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        console.log('Error in bcrypt hash method:', err);
        return res.status(500).json({ message: 'Error hashing password', success: false });
      }

      const t = await sequelize.transaction();
      try {
        const user = await User.create({
          name: name,
          email: email,
          password: hash,
          phoneNo: phoneNo,
        }, { transaction: t });

        await t.commit();
        console.log('User created successfully in try block');
        // Continue with the rest of your code here

        const groupId = 1;
        const userId = 1;
        const group = await Group.findOne({ where: { id: groupId } });
        if (!group) {
          res.status(200).json({ success: false, message: "group not found" });
        }

        if (group.adminId === userId) {
          const memberToAdd = await User.findOne({ where: { email } });
          await GroupUser.create({ groupId, userId: memberToAdd.id });
          res.status(200).json({ success: true, message: "User added to group successfully", newGroupMember: { name: memberToAdd.name, id: memberToAdd.id, message: "user added successfully" } });
        } else {
          res.status(200).json({ success: false, message: "user is not Admin" });
        }

      } catch (error) {
        console.log('In user creation error block');
        await t.rollback();
        res.status(500).json({ message: error, success: false });
      }
    });
  } catch (error) {
    console.log('in final catch block');
    return res.status(500).json({ message: error, success: false });
  }
};






exports.validateUser = (async (req, res, next) => {
  const data = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const email = req.body.email;
  console.log(email);
  const password = req.body.password;
  console.log(password);

  if (isStringInvalid(email) || isStringInvalid(password)) {
    return res.status(200).json({ message: 'Email or password is missing', success: false });
  }

  try {
    const user = await User.findOne({ where: { email } })

    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Something went wrong', success: false });
        }
        if (result === true) {
          return res.status(200).json({ user, message: 'User logged in successfully', success: true, token: generateAccessToken(user) });
        }
        else {
          return res.status(401).json({ message: 'Password do not match. User not authorized', success: false });
        }
      })
    }
    else {
      return res.status(404).json({ message: 'User not found', success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
})



