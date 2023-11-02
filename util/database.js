const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.SQL_DB_NAME, process.env.SQL_USERNAME , process.env.SQL_PASSWORD , {
    dialect: 'mysql', 
    host: process.env.DB_HOST 
});

module.exports = sequelize;




