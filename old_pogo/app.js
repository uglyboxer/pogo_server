var express = require('express');
var session = require('express-session');

var RedisStore = require('connect-redis')(session);
var redisUrl = require('redis-url');
var passport = require('passport');
var passportSocketIo = require('passport.socketio');
var LocalStrategy = require('passport-local').Strategy;
var redis = require("redis").createClient();

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var User = require('./lib/user');

var index = require('./routes/index');
var login = require('./routes/login');
var home = require('./routes/home');

var models = require('./models');

var Account = models.account;
var app = express();
// var sessionStore = RedisStore({ client: redisUrl.connect(process.env.REDIS_URL) });
var server = require('http').Server(app);

var sessionMiddleware = session({
  // key: "connect.sid",
  store: new RedisStore({ client: redis}),
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: process.env.ENVIRONMENT !== 'development' && process.env.ENVIRONMENT !== 'test',
    maxAge: 2419200000
  },
  secret: 'keyboarddog'
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(sessionMiddleware);

app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

// var ios = require('socket.io-express-session');

// Set up the Socket.IO server
var io = require('socket.io').listen(server);
// io.use(ios(sessionMiddleware));

io.use(passportSocketIo.authorize({
  key: 'express.sid',
  secret: 'keyboarddog',
  // secret: process.env.SECRET_KEY_BASE,
  store: new RedisStore({ client: redis }),
  passport: passport,
  cookieParser: cookieParser
}));

passport.use(new LocalStrategy({
    usernameField: 'uname',
    passwordField: 'psw'
    },
    function(username, password, done) {
        console.log(username, password);
        Account.findOne({where: { userName: username }}).then(function(user) {
            if (!user) {
                console.log('no user');
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (user.password !== password) {
                console.log('only bad');
                return done(null, false, { message: 'Incorrect password.' });
            }
            console.log('got it');
            return done(null, user);
        }).catch(function(err) {
            console.log(err);
                console.log('give it up');
                return done(err);
        })
    }));

passport.serializeUser(function(user, done) {
    console.log(user.id, "(-----");
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Account.findById(id).then(function(err, user) {
    done(err, user);
  });
});



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(function(req, res, next) {
    res.io = io;
    next();
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/login', login);
app.use('/home', home);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


// Socket Namespaces

var loungeNSP = io.of('/lounge');
var gamesNSP = io.of('/games');

// Gameplay

var tenuki = require("./lib/tenuki");
var Game = tenuki.Game;
var activeGames = {};

io.on('connection', function(socket) {
    // var user = new User('user one'); // TODO make this real
    console.log("socket is: ", socket.request);
    console.log('a user connected');
    socket.emit('roomList', activeGames);
    socket.on('new_game', function(data) {
        var room = getRoomNum(activeGames);
        console.log(data);
        activeGames[room] = new Game();
        activeGames[room].setup({ boardSize: Number(data['boardsize']) });
        models.game_record.sync({ force: true }).then(function() {
            // Table created
            return models.game_record.create({
                room: room,
                moves: activeGames[room]
            });
        });
        socket.join(room);
        socket.emit('joined', room);
        io.emit('roomList', activeGames); // io emits to all rooms TODO make this quiet for users that aren't view roomlist?
    });
    socket.on('ask_to_join', function(data) {
        console.log(activeGames);
        console.log(data)
        socket.join(data['room']);
        socket.emit('joined', data['room']);
        socket.emit('game_state', getGameState(data['room']));
    });
    socket.on('played_at', function(data) {
        var room = data['room'];
        var location = data['location'];
        var x = Number(location[0]);
        var y = Number(location[1]);
        var result = activeGames[room].playAt(y, x, 'black');
        socket.emit('result', result);
        if (result === true) {

            models.game_record.update({ moves: activeGames[room] }, {
                fields: ['moves'],
                where: { room: room }

            });
            var gameState = activeGames[room].currentState();

            io.to(room).emit('game_state', {
                moveNumber: gameState.moveNumber,
                y: gameState.playedPoint && gameState.playedPoint.y,
                x: gameState.playedPoint && gameState.playedPoint.x,
                pass: gameState.pass,
                phase: activeGames[room].isOver() ? "scoring" : "active",
                deadStones: activeGames[room].deadStones()
            });
        }
    });

    socket.on('refresh', function(data) {
        var room = data['room'];
        socket.emit('refresh_state', activeGames[room]._moves);
    });

});

// Game Utils

function getGameState(room) {
    var gameState = activeGames[room].currentState();
    return {
        moveNumber: gameState.moveNumber,
        y: gameState.playedPoint && gameState.playedPoint.y,
        x: gameState.playedPoint && gameState.playedPoint.x,
        pass: gameState.pass,
        phase: activeGames[room].isOver() ? "scoring" : "active",
        deadStones: activeGames[room].deadStones()
    }
}

// General Utils

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRoomNum(activeGames) {
    do {
        var room = Date.now().toString() + '-GAME-';
        room += getRandomInt(10000, 99999);
    }
    while (room in activeGames);
    return room;
}

module.exports = { app: app, server: server };
