'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    UserId: DataTypes.INTEGER,
    message: DataTypes.TEXT
  }, {});
  Message.associate = function (models) {
    // associations can be defined here
    Message.belongsTo(models.User, { foreignKey: 'UserId' })
  };
  return Message;
};