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
const port = process.env.PORT || 3000

// chatroom
const server = require('http').Server(app);
const io = require('socket.io')(server);
const SocketHander = require('./socket/index');
let onlineCount = 0;

io.on('connection', (socket) => {

  // 有連線發生時增加人數
  onlineCount++;
  // 發送人數給網頁
  io.emit("online", onlineCount);

  // 資料庫用
  socketHander = new SocketHander();
  socketHander.connect();
  // 訊息傳入資料庫
  socket.on("message", (obj) => {
    socketHander.storeChat(obj);
    io.emit("message", obj);
  });

  // Greet
  socket.on("greet", () => {
    socket.emit("greet", onlineCount);
  });

  socket.on("send", (msg) => {
    // 如果 msg 內容鍵值小於 2 等於是訊息傳送不完全
    // 因此我們直接 return ，終止函式執行。
    if (Object.keys(msg).length < 2) return;
    // 廣播訊息到聊天室
    io.emit("msg", msg);
  });

  socket.on('disconnect', () => {
    // 有人離線了，扣人
    onlineCount = (onlineCount < 0) ? 0 : onlineCount -= 1;
    io.emit("online", onlineCount);
  });
});

// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()

app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: require('./_helpers')
}))
app.set('view engine', 'hbs')
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

server.listen(port, () => console.log(`Server listening on port ${port}!`))

require('./routes')(app, passport)

module.exports = app