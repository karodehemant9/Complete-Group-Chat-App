const jwt = require('jsonwebtoken');
const User = require('../models/user');
const secretKey = process.env.TOKEN_SECRET;

const authenticate = async (req, res, next) => {
    try {

        //fetching the token from request header
        const token = req.header('authorization');
        console.log(token);
        //decrypting the token to get userID to know which user has sent this request
        //jwt.verify(token, 'secretKey using which you did encryption')
        const userJwtObj = jwt.verify(token, secretKey);
        console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
        const user = await User.findByPk(userJwtObj.user.id)
        console.log(user);
        console.log(JSON.stringify(user));
        //adding this user in incoming request as a parameter so that whenever we want we can access user properties from request object
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        return res.status(404).json({ message: 'User not found', success: false });
    }
}

module.exports = authenticate;