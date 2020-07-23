const tweetController = require('../controllers/tweetController')

module.exports = app => {
  app.get('/', (req, res) => res.redirect('/tweets'))
  app.get('/tweets', tweetController.getTweets)
  app.post('/tweets', tweetController.postTweet)
}
