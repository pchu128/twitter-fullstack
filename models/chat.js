'use strict';
module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define('Chat', {
    sender: DataTypes.STRING,
    message: DataTypes.STRING
  }, {});
  Chat.associate = function(models) {
    // associations can be defined here
  };
  return Chat;
};