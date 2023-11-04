const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
 const cors = require('cors');
// Define the CORS options
// const cors = {
//   origin: 'http://127.0.0.1:5501', // Replace with your front-end URL
//   methods: ['GET', 'PUT', 'POST', 'DELETE'],
// };


app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add CORS middleware
app.use(cors());

const User = require('./models/user');
const Message = require('./models/message');
const Group = require('./models/group');
const Usergroup = require('./models/usergroup');

// Model Relation
//Model Relation
// User.hasMany(Resetpassword);


User.hasMany(Message);
Message.belongsTo(User);


Group.belongsToMany(User, {through: Usergroup});
User.belongsToMany(Group, {through: Usergroup});

Group.hasMany(Message);
Message.belongsTo(Group);





// Import routes
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const groupRoutes = require('./routes/groupRoutes');

// Route directs
app.use('/user', userRoutes);
app.use('/', messageRoutes);
app.use('/group', groupRoutes);

sequelize
  //.sync({force: true})
  .sync()
  .then(result => {
    server.listen(3000, () => {
      console.log(`Server is running on port ${3000}`);
    });
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });


// Initialize the socket (connection event) and give socket.id key to user
const users = {};
io.on('connection', (socket) => {
  socket.on('user-joined', (usertoken) => {
    const user = jwt.decode(usertoken);
    users[socket.id] = user;
    socket.broadcast.emit('user-joined-broadcast', user);
  });

  // send-message event and receive-message broadcast
  socket.on('send-message', (message) => {
    const user = jwt.decode(message.token);
    const data = { user: user.name, message: message.message };
    socket.broadcast.emit('receive-message', data);
  });

  // user-left event & broadcast it automatically when a user logs out or closes the tab
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      socket.broadcast.emit('user-left', user.name);
      delete users[socket.id];
    }
  });
});




