const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const ArchivedChat = sequelize.define('archived_chat', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
  text: { type: Sequelize.STRING },
  groupId: {type: Sequelize.INTEGER }, 
  createdAt: {type: Sequelize.DATE },
  updatedAt: {type: Sequelize.DATE },
  userId: {type: Sequelize.INTEGER }
});

module.exports = ArchivedChat;
