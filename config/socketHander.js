const db = require('../models')
const Message = db.Message
const User = db.User

class SocketHander {
  getMessages() {
    return new Promise((resolve, reject) => {
      Message.findAll({
        include: [User],
        order: [
          ['createdAt', 'ASC']
        ]
      })
        .then((messages) => {
          //messages = messages.toJSON()
          messages = messages.map(message => ({
            ...message.dataValues,
            User: message.User.dataValues
          }))
          //console.log('getMessages =>', messages)
          return resolve(messages)
        })
    })

  }

  storeMessages(data) {
    console.log(data);
    return Message.create({
      UserId: data.userId,
      message: data.msg,
    })
  }
}

module.exports = SocketHander