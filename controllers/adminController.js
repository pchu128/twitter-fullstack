const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Reply = db.Reply

const adminController = {
  getTweets: (req, res) => {
    return Tweet.findAll({
      include: [Reply],
      order: [['createdAt', 'DESC']]
    }).then(tweets => {
      return res.render('./admin/tweets', { tweets: tweets })
    })
  },

  postTweet: (req, res) => {
    if (!req.body.description) {
      req.flash('error_messages', '請勿空白')
      return res.redirect('back')
    } else {
      return Tweet.create({
        // userId: req.user.id,
        description: req.body.description
      })
        .then(tweet => {
          res.redirect('/admin/tweets')
        })
    }
  }
}

module.exports = adminController
