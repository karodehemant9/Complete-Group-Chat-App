const User = require('../models/user');
const bcrypt = require('bcrypt');
const sequelize = require('../util/database');
const jwt = require('jsonwebtoken');
 




const encryptionKey = process.env.TOKEN_SECRET;
function generateAccessToken(id) {
  return jwt.sign({ userID: id }, encryptionKey)
}





function isStringInvalid(string) {
  if (string === undefined || string.length === 0) {
    return true;
  }
  else {
    return false;
  }
}



exports.addUser = (async (req, res, next) => {
  const name = req.body.name;
  console.log(name);
  const email = req.body.email;
  console.log(email);
  const password = req.body.password;
  console.log(password);
  const phoneNo = req.body.phoneNo;
  console.log(phoneNo);

  if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(password) || isStringInvalid(phoneNo)) {
    return res.status(400).json({ err: 'Bad Parameters. Something is missing' });
  }


  try {
    const user = await User.findOne({ where: { email: email } })
    console.log(user);
    
    if (user) {
      return res.status(200).json({ message: 'User already exist', success: false });
    }
    else {
      bcrypt.hash(password, 10, async (err, hash) => {
        const t = await sequelize.transaction();
        try {
          const user = await User.create({
            name: name,
            email: email,
            password: hash,
            phoneNo: phoneNo
          }, {transaction: t})
          await t.commit();
          console.log('User created');
          return res.status(201).json({ message: 'User created successfully', success: true });
        }
        catch (error) {
          await t.rollback();
          return res.status(500).json({ message: error, success: false });
        };
      })
    }
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
})








exports.validateUser = (async (req, res, next) => {
  console.log('In the controller');
  
  const email = req.body.email;
  console.log(email);
  const password = req.body.password;
  console.log(password);
  
  if (isStringInvalid(email) || isStringInvalid(password)) {
    return res.status(200).json({ message: 'Email or password is missing', success: false });
  }


  try {
    const user = await User.findOne({ where: { email: email } })

    console.log(user);
    
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Something went wrong', success: false });
        }
        if (result === true) {
          return res.status(200).json({ user: user, message: 'User logged in successfully', success: true, token: generateAccessToken(user.id) });
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


