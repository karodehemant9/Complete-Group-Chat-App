const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const GroupUser = sequelize.define('group_user', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
  isGroupAdmin: { type: Sequelize.BOOLEAN, defaultValue: false }
})

module.exports = GroupUser;