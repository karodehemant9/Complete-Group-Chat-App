const express = require('express');

require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./util/database');



const User = require('./models/user');



const userRoutes = require('./routes/user');


const app = express();


app.use(
  cors({
    origin: "http://http://127.0.0.1:5500",
    //origin: "*",  Allowing all origins
  })
  );
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public')); // Serve files from the 'public' directory


app.use('/user', userRoutes);


app.use((req, res, next) => {
  // Check if the request URL is not the desired URL.
  if (req.originalUrl !== '/index/index.html') {
    return res.redirect('http://localhost:9000/index/index.html');
  }
  // If the request URL is the desired URL, proceed to the next middleware.
  next();
});







sequelize
  .sync({force: true})
  //.sync()
  .then(result => {
    app.listen(9000);
  })
  .catch(err => {
    console.log(err);
  })


