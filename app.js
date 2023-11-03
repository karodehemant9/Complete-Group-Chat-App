const express = require('express');

require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./util/database');



const User = require('./models/user');
const Message = require('./models/message');


const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');


const app = express();


app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    //origin: "*",  Allowing all origins
  })
);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public')); // Serve files from the 'public' directory


app.use('/user', userRoutes);
app.use('/', messageRoutes);



app.use((req, res, next) => {
  // Check if the request URL is not the desired URL.
  if (req.originalUrl !== '/login/login.html') {
    return res.redirect('http://localhost:9000/login/login.html');
  }
  // If the request URL is the desired URL, proceed to the next middleware.
  next();
});



User.hasMany(Message);
Message.belongsTo(User);



sequelize
  .sync({force: true})
  //.sync()
  .then(result => {
    app.listen(9000);
  })
  .catch(err => {
    console.log(err);
  })


