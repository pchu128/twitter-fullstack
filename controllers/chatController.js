const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Followship = db.Followship
const Tweet = db.Tweet
const Reply = db.Reply
const Like = db.Like
const helpers = require('../_helpers')

const chatController = {
  chatroom: (req, res) => {
    //let loginUserId = helpers.getUser(req).id
    console.log('help====', helpers.getUser(req).id)
    console.log('req====', req.user)
    return User.findByPk(helpers.getUser(req).id, {
      include: [
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' },
      ]
    }).then(user => {
      console.log('chatroom user====', user.toJSON())
      return res.render('chatroom', { user: user.toJSON() })
    })
  },
}

module.exports = chatController