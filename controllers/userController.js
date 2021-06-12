const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Followship = db.Followship
const Tweet = db.Tweet
const Reply = db.Reply
const Like = db.Like
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helpers = require('../_helpers')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup', { layout: 'blank' })
  },

  signUp: (req, res) => {
    if (req.body.checkPassword !== req.body.password) {
      req.flash('error_messages', "Confirm password doesn't match.")
      return res.redirect('back')
    } else {
      User.findOne({ where: { account: req.body.account } }).then(user => {
        if (user) {
          req.flash('error_messages', 'Account has been used already.')
          return res.redirect('back')
        } else {
          User.create({
            account: req.body.account,
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', 'Congrat! You have signed up. Please sign in here.')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin', { layout: 'blank' })
  },

  signIn: (req, res) => {
    User.findByPk(helpers.getUser(req).id).then(user => {
      if (user.role === 'admin') {
        req.flash('error_messages', 'Admin please signs in with admin sign in page.')
        return res.redirect('back')
      } else {
        req.flash('success_messages', 'Signed in.')
        res.redirect('/tweets')
      }
    })
  },

  signOut: (req, res) => {
    req.flash('success_messages', 'Signed out.')
    req.logout()
    res.redirect('/signin')
  },

  settingPage: (req, res) => {
    User.findByPk(helpers.getUser(req).id).then(user => {
      return res.render('setting', {
        account: user.account,
        name: user.name,
        email: user.email
      })
    })
  },

  setting: (req, res) => {

    if (req.body.checkPassword !== req.body.password) {
      req.flash('error_messages', "Confirm password doesn't match.")
      return res.redirect('back')

    } else {
      User.findByPk(helpers.getUser(req).id).then(user => {
        let originalName = user.name
        let originalEmail = user.email

        User.findOne({ where: { email: req.body.email } }).then(user => {
          if (user && user.email !== originalEmail) {
            req.flash('error_messages', 'Email has been used already.')
            return res.redirect('back')
          }
        })
        User.findOne({ where: { name: req.body.name } }).then(user => {
          if (user && user.name !== originalName) {
            req.flash('error_messages', 'Name has been used already.')
            return res.redirect('back')
          }
        })
      })
    }

    return User.findByPk(helpers.getUser(req).id)
      .then(user => {
        user.update({
          email: req.body.email,
          name: req.body.name,
          password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
        })
          .then((user) => {
            req.flash('success_messages', 'User was successfully updated')
            res.redirect(`/tweets`)
          })
      })
  },

  getUser: (req, res) => {
    let loginUserId = helpers.getUser(req).id
    return User.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' },
        {
          model: Tweet,
          where: { UserId: req.params.id },
          include: [User, Reply,
            { model: User, as: 'LikedUsers' }]
        },
      ]
    })
      .then(user => {
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
          user = user.toJSON()
          let month = user.createdAt.toLocaleString('en-US', {month: 'short'})
          let year = user.createdAt.getFullYear()
          let tweets = user.Tweets
          tweets = tweets.sort((a, b) => b.createdAt - a.createdAt)
          function findIsFollowed(findUser) { return findUser.id === Number(req.params.id) }
          let loginUserisFollowed = users.find(findIsFollowed).isFollowed
          return res.render('profile', { user, month, year, users, loginUserId, loginUserisFollowed, tweets: tweets })
        })
      })
  },

  editUser: (req, res) => {
    if (helpers.getUser(req).id !== Number(req.params.id)) { return res.redirect('back') }
    return User.findByPk(req.params.id)
      .then(user => {
        return User.findAll({
          include: [
            { model: User, as: 'Followers' }
          ]
        }).then(users => {
          users = users.map(user => ({
            ...user.dataValues,
            FollowerCount: user.Followers.length,
            isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(user.id)
          }))
          users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
          return res.render('profileEdit', { user: user.toJSON(), users },)
        })
      })

  },

  postUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name can't be space")
      return res.redirect('back')
    }

    const { files } = req
    if (files.avatar !== undefined & files.cover === undefined) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(files.avatar[0].path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              introduction: req.body.introduction,
              avatar: files ? img.data.link : user.avatar,
            }).then((user) => {
              req.flash('success_messages', 'profile was successfully to update')
              res.redirect(`/users/${user.id}/tweets`)
            })
          })
      })
    }

    if (files.avatar === undefined & files.cover !== undefined) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(files.cover[0].path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              introduction: req.body.introduction,
              cover: files ? img.data.link : user.cover,
            }).then((user) => {
              req.flash('success_messages', 'profile was successfully to update')
              res.redirect(`/users/${user.id}/tweets`)
            })
          })
      })
    }

    if (files.avatar !== undefined & files.cover !== undefined) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(files.avatar[0].path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              introduction: req.body.introduction,
              avatar: files ? img.data.link : user.avatar,
            })
              .then(() => {
                imgur.setClientID(IMGUR_CLIENT_ID);
                imgur.upload(files.cover[0].path, (err, img) => {
                  return User.findByPk(req.params.id)
                    .then((user) => {
                      user.update({
                        name: req.body.name,
                        introduction: req.body.introduction,
                        cover: files ? img.data.link : user.cover,
                      }).then((user) => {
                        req.flash('success_messages', 'profile was successfully to update')
                        res.redirect(`/users/${user.id}/tweets`)
                      })
                    })
                })
              })
          })
      })
    }

    else {
      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            name: req.body.name,
            introduction: req.body.introduction,
            avatar: user.avatar,
            cover: user.cover,
          })
            .then((user) => {
              req.flash('success_messages', 'profile was successfully to update')
              res.redirect(`/users/${user.id}/tweets`)
            })
        })
    }
  },

  addFollowing: (req, res) => {
    //can not follow self
    if (helpers.getUser(req).id === Number(req.body.id)) {
      req.flash('error_messages', 'You cannot follow yourself.')
      return res.render('tweets')
    }
    return Followship.create({
      followerId: helpers.getUser(req).id,
      followingId: req.body.id
    })
      .then((followship) => {
        return res.redirect('back')
      })
  },

  removeFollowing: (req, res) => {
    //can not follow/unfollow self
    if (helpers.getUser(req).id === Number(req.params.userId)) { return res.redirect('back') }
    return Followship.findOne({
      where: {
        followerId: helpers.getUser(req).id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            return res.redirect('back')
          })
      })
  },

  getFollowers: (req, res) => {
    let loginUserId = helpers.getUser(req).id
    return User.findByPk(req.params.id, {
      include: [Tweet]
    })
      .then((user) => {
        return Followship.findAll({
          raw: true,
          nest: true,
          order: [['createdAt', 'DESC']],
          where: { followingId: req.params.id }
        })
          .then((users) => {
            let followerByOrderCreated = users.map(user => user.followerId)
            return User.findAll({
              raw: true,
              nest: true,
              include: [
                { model: User, as: 'Followings' },
                { model: User, as: 'Followers' },
              ],
              where: [
                { role: null }
              ]
            }).then((userFound) => {
              let users = userFound
              users = users.map(user => ({
                ...user,
                FollowerCount: user.Followers.length,
                isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(user.id)
              }))
              followerByOrderCreated = followerByOrderCreated.map(order => {
                return users.find(user => { return user.id === order })
              })
              console.log(users)
              users = users.sort((a, b) => a.isFollowed - b.isFollowed)
              return res.render('followers', { user: user, users: users, usersFollowed: followerByOrderCreated, loginUserId })
            })
          })
      })
  },

  getFollowings: (req, res) => {
    let loginUserId = helpers.getUser(req).id
    return User.findByPk(req.params.id, {
    })
      .then((user) => {
        return Followship.findAll({
          raw: true,
          nest: true,
          order: [['createdAt', 'DESC']],
          where: { followerId: req.params.id }
        })
          .then((users) => {
            let followingByOrderCreated = users.map(user => user.followingId)
            return User.findAll({
              raw: true,
              nest: true,
              include: [
                { model: User, as: 'Followings' },
                { model: User, as: 'Followers' }
              ],
              where: [
                { role: null }
              ]
            }).then((userFound) => {
              let users = userFound
              users = users.map(user => ({
                ...user,
                FollowerCount: user.Followers.length,
                isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(user.id)
              }))
              followingByOrderCreated = followingByOrderCreated.map(order => {
                return users.find(user => { return user.id === order })
              })
              users = users.sort((a, b) => a.isFollowed - b.isFollowed)
              return res.render('followings', { user: user, users: users, usersfollowing: followingByOrderCreated, loginUserId })
            })
          })
      })
  },

  getMedia: (req, res) => {
    let loginUserId = helpers.getUser(req).id
    return User.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' },
        { model: Tweet, as: 'LikedTweets', include: [User, Reply, { model: User, as: 'LikedUsers' }] },
        { model: Tweet, where: { UserId: req.params.id } }
      ]
    })
      .then(user => {
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
          user = user.toJSON()
          let likes = user.LikedTweets
          likes = likes.sort((a, b) => b.Like.createdAt - a.Like.createdAt)
          function findIsFollowed(findUser) { return findUser.id === Number(req.params.id) }
          let loginUserisFollowed = users.find(findIsFollowed).isFollowed
          let month = user.createdAt.toLocaleString('en-US', { month: 'short' })
          let year = user.createdAt.getFullYear()
          let tweets = user.Tweets
          return res.render('media', { user, users, month, tweets, year, loginUserId, loginUserisFollowed, likes })
        })
      })
  },

  getUserLikes: (req, res) => {
    let loginUserId = helpers.getUser(req).id
    return User.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' },
        { model: Tweet, as: 'LikedTweets', include: [User, Reply, { model: User, as: 'LikedUsers' }]},
        { model: Tweet, where: { UserId: req.params.id }}
      ]
    })
      .then(user => {
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
          user = user.toJSON()
          let likes = user.LikedTweets
          likes = likes.sort((a, b) => b.Like.createdAt - a.Like.createdAt)
          function findIsFollowed(findUser) { return findUser.id === Number(req.params.id) }
          let loginUserisFollowed = users.find(findIsFollowed).isFollowed
          let month = user.createdAt.toLocaleString('en-US', { month: 'short' })
          let year = user.createdAt.getFullYear()
          let tweets = user.Tweets
          return res.render('userLikes', { user, users, month, tweets, year, loginUserId, loginUserisFollowed, likes })
        })
      })
  },

  getUserReplies: (req, res) => {
    let loginUserId = helpers.getUser(req).id
    return User.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' },
        {
          model: Reply,
          where: { UserId: req.params.id },
          include: [{ model: Tweet, include: [User, Reply, { model: User, as: 'LikedUsers' }] }]
        },
        {
          model: Tweet,
          where: { UserId: req.params.id },
        },
      ],
      order: [
        [Reply, 'createdAt', 'DESC']
      ]
    })
      .then(user => {
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
          user = user.toJSON()
          let replies = user.Replies
          let tweets = user.Tweets
          let month = user.createdAt.toLocaleString('en-US', { month: 'short' })
          let year = user.createdAt.getFullYear()
          function findIsFollowed(findUser) { return findUser.id === Number(req.params.id) }
          let loginUserisFollowed = users.find(findIsFollowed).isFollowed
          return res.render('userReplies', { user, users, tweets, month, year, loginUserId, loginUserisFollowed, replies })

        })
      })
  },

}

module.exports = userController