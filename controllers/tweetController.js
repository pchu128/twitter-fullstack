const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Reply = db.Reply
const Like = db.Like
const helpers = require('../_helpers')

const tweetController = {
  getTweets: (req, res) => {
    let loginUserId = helpers.getUser(req).id
    if (!helpers.getUser(req).role) {
      return Tweet.findAll({
        include: [
          User,
          Reply,
          { model: User, as: 'LikedUsers' }
        ],
        order: [['createdAt', 'DESC']]
      }).then(tweets => {
        const data = tweets.map(t => ({
          ...t.dataValues,
          isLiked: helpers.getUser(req).LikedTweets.map(d => d.id).includes(t.id)
        }))
        return data
      }).then(tweets => {
        return User.findAll({
          include: [
            { model: User, as: 'Followers' }
          ],
          where: { role: null }
        }).then(users => {
          users = users.map(user => ({
            ...user.dataValues,
            FollowerCount: user.Followers.length,
            isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(user.id)
          }))
          users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
          return res.render('tweets', { tweets: tweets, user: helpers.getUser(req), users: users, loginUserId: loginUserId })
        })
      })
    }
    return res.render('admin/tweets', { layout: 'blank', tweets: data, user: helpers.getUser(req) })
  },

  postTweet: (req, res) => {
    if (!req.body.description) {
      req.flash('error_messages', '請勿空白')
      return res.redirect('back')
    }
    if (req.body.description.length > 140) {
      req.flash('error_messages', '超過字數140')
      return res.redirect('back')
    } else {
      return Tweet.create({
        UserId: helpers.getUser(req).id,
        description: req.body.description
      })
        .then(tweet => {
          res.redirect('/tweets')
        })
    }
  },
  getTweet: (req, res) => {
    let loginUserId = helpers.getUser(req).id
    return Tweet.findByPk(req.params.id, {
      include: [
        User,
        { model: Reply, include: [User] },
        { model: User, as: 'LikedUsers' }
      ],
      order: [
        [Reply, 'createdAt', 'DESC']
      ]
    })
      .then(tweet => {
        const isLiked = tweet.LikedUsers.map(t => t.id).includes(helpers.getUser(req).id)
        return User.findAll({
          include: [
            { model: User, as: 'Followers' }
          ],
          where: { role: null }
        }).then(users => {
          users = users.map(user => ({
            ...user.dataValues,
            FollowerCount: user.Followers.length,
            isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(user.id)
          }))
          users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
          return res.render('tweet', { tweet: tweet, isLiked: isLiked, users: users, loginUserId: loginUserId })
        })
      })
  },
  postReply: (req, res) => {
    if (!req.body.comment) {
      req.flash('error_messages', '請勿空白')
      return res.redirect('back')
    }
    if (req.body.comment.length > 140) {
      req.flash('error_messages', '超過字數140')
      return res.redirect('back')
    } else {
      return Reply.create({
        comment: req.body.comment,
        TweetId: req.body.TweetId,
        UserId: helpers.getUser(req).id
      })
        .then(reply => {
          return res.redirect('back')
        })
    }
  },
  addLike: (req, res) => {
    Like.create({
      UserId: helpers.getUser(req).id,
      TweetId: req.params.id
    }).then((tweet) => {
      return res.redirect('back')
    })
  },
  removeLike: (req, res) => {
    Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        TweetId: req.params.id
      }
    }).then(like => {
      like.destroy()
        .then(tweet => {
          return res.redirect('back')
        })
    })
  }
}

module.exports = tweetController
