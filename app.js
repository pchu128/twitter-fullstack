const express = require('express')
const helpers = require('./_helpers')
const exphbs = require('express-handlebars')
const db = require('./models')
const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require('./config/passport')
const flash = require('connect-flash')
const methodOverride = require('method-override')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server);
const SocketHander = require('./config/socketHander')
const port = process.env.PORT || 3000

app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: require('./_helpers')
}))
app.set('view engine', 'hbs')
app.use(express.static(__dirname + '/public/stylesheets/'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = helpers.getUser(req)
  next()
})
app.use(methodOverride('_method'))

server.listen(port, () => {
  console.log(`The app is listening on port ${port}`)
})

io.on('connection', async (socket) => {
  console.log('a user connected');

  const history = await SocketHander.getMessages();
  //io.emit('history', history);
  //將歷史訊息的廣播對象鎖定為當前用戶
  const socketid = socket.id;
  io.to(socketid).emit('history', history);

  socket.on("message", (obj) => {
    SocketHander.storeMessages(obj);
    io.emit("message", obj);
  });

  socket.on("disconnect", () => {
    console.log("a user go out");
  });

});

require('./routes')(app, passport)

module.exports = app