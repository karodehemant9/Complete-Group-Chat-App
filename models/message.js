const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Message = sequelize.define('message', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
  text: { type: Sequelize.STRING },
  groupId: {type: Sequelize.INTEGER}
});

module.exports = Message;
