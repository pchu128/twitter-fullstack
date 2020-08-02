const db = require('../models')
const Chat = db.Chat
const moment = require('moment');
class SocketHander {

  constructor() {
    db;
  }

  connect() {
    Chat.Promise = global.Promise;
  }

  getChat() {
    return Chat.find();
  }

  storeChat(data) {

    console.log(data);
    const newChat = new Chat({
      sender: data.sender,
      message: data.message,
      time: moment().valueOf(),
    });

    const doc = newChat.save();
  }
}

module.exports = SocketHander;