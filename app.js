const express = require('express');
const { Op } = require('sequelize');
const app = express();
const cron = require('cron');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const multer = require('multer');
const cors = require('cors');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:4000','*'],
  }
});

const PORT = 4000;


app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());


const User = require('./models/user');
const Message = require('./models/message');
const ArchivedChat = require('./models/archived-message');
const Group = require('./models/group');
const GroupUser = require('./models/usergroup');

User.hasMany(Message);
Message.belongsTo(User);

Group.belongsToMany(User, { through: GroupUser });
User.belongsToMany(Group, { through: GroupUser });

Group.hasMany(Message);
Message.belongsTo(Group);


async function createDefault() {
  const user = await User.findOne({ where: { name: 'super admin' } });
  let userId;
  if (!user) {
    const password = process.env.ADMIN_PASSWORD;
    bcrypt.hash(password, 10, async (err, hash) => {
      try {
        const user = await User.create({
          name: 'super admin',
          email: 'admin@admin.com',
          password: hash,
          phoneNo: '989898989'
        })
        console.log('User created');
        userId = user.id;
      }
      catch (error) {
        return res.status(500).json({ message: error, success: false });
      };
    })
  }
  else{
    userId = user.id;
  }

  Group.findOne({ where: { groupName: 'Default' } })
    .then((defaultGroup) => {
      if (!defaultGroup) {
        return Group.create({ groupName: 'Default', adminId: userId });
      }
      return null;
    })
    .then((createdGroup) => {
      if (createdGroup) {
        console.log('Created the "Default Group".');
      } else {
        console.log('The "Default Group" already exists.');
      }
    })
    .catch((error) => {
      console.error('Error creating or checking the "Default":', error);
    });
}

createDefault();



// Import routes
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');
const groupRoutes = require('./routes/group');

// Route directs
app.use('/user', userRoutes);
app.use('/messages', messageRoutes);
app.use('/groups', groupRoutes);
app.use((req, res, next) => {
  if (req.originalUrl !== '/login/login.html') {
    return res.redirect('http://localhost:4000/login/login.html');
  }
  next();
});



const CronJob = cron.CronJob;

const moveData = async () => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const messagesToMove = await Message.findAll({
      where: {
        createdAt: {
          [Op.lte]: oneDayAgo,
        },
      },
    });

    
    for (const message of messagesToMove) {
      await ArchivedChat.create({
        text: message.text,
        groupId: message.groupId,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        userId: message.userId,
      });

      await message.destroy();
    }

    console.log('Data migration job executed on', new Date());
  } catch (error) {
    console.error('Error moving data:', error);
  }
};



const job = new CronJob('0 0 * * *', moveData);

job.start();



sequelize
  //.sync({ force: true })
  .sync()
  .then(result => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });



// Initialize the socket (connection event) and give socket.id key to user
const users = {};
io.on('connection', (socket) => {

  socket.on('new-user-joined', (usertoken) => {
    const user = jwt.decode(usertoken);
    users[socket.id] = user.user;
    socket.broadcast.emit('user-joined-broadcast', user.user);
  });


  socket.on('join-room', room => {
    socket.join(room);
  })


  // send-message event and receive-message broadcast
  socket.on('send-message', async (message, room) => {
    const user = jwt.decode(message.token);
    const data = { user: user.user.name, message: message.message };

    if (room === 'Default') {
      console.log('sending data to all');
      socket.broadcast.emit('receive-message-all', data);
    }
    else {
      console.log('sending data to specific room');
      socket.to(room).emit('receive-message-room', data);
      console.log('data sent to specific room');
    }

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


















































































































































// async function createDefault() {
//   const user = await User.findOne({ where: { name: 'super admin' } });
//   let userId;
//   if (!user) {
//     const password = process.env.ADMIN_PASSWORD;
//     bcrypt.hash(password, 10, async (err, hash) => {
//       try {
//         const user = await User.create({
//           name: 'super admin',
//           email: 'admin@admin.com',
//           password: hash,
//           phoneNo: '989898989'
//         })
//         console.log('User created');
//         userId = user.id;
//       }
//       catch (error) {
//         return res.status(500).json({ message: error, success: false });
//       };
//     })
//   }
//   else {
//     userId = user.id;
//   }

//   const defaultGroup = await Group.findOne({ where: { groupName: 'Default' } })
//   if (!defaultGroup) {
//     const createdGroup = await Group.create({ groupName: 'Default', adminId: userId });
//     if (createdGroup) {
//       console.log('Created the "Default Group".');
//     } else {
//       console.error('Error creating or checking the "Default":', error);
//     }
//   }
//   else {
//     console.log('The "Default Group" already exists.');
//   }
// }





// // Add CORS middleware
// app.use(
//   cors({
//     //origin: "http://127.0.0.1:5500",
//     origin: "*",  //Allowing all origins
//     methods: ['GET', 'PUT', 'POST', 'DELETE']
//   })
// );