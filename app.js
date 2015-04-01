var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

var index = require('./routes/index');
var api = require('./routes/api.js');
var users = require('./modules/users.js');
var rooms = require('./modules/rooms.js');
var chat = require('./modules/chat.js');
var cache = require('./modules/cache.js');
var utils = require('./modules/utils.js');

// route to index page.
app.use('/', index);
// route to some api calls for user login etc.
app.use('/api/', api);

function userLeave(socket) {
    if (socket.user && socket.room) {
        rooms.removeUser(socket.room,socket.user);
        socket.broadcast.to(socket.room).emit('user.list',rooms.userList(socket.room));    
        socket.leave(socket.room);
        socket.room = null;
    }   
    if (socket.user) {
        console.log(socket.user+' disconnected');
        io.sockets.emit('user.left',socket.user);  
        socket.leave(socket.user+'.messages');
        socket.user = null;
    }    
}

// socket connection and events.
io.on('connection', function(socket){
//    console.log('a user connected'); 
    cache.set('socket',socket);
    socket.on('disconnect', function(data){
        userLeave(socket);
    });
    
    socket.on('room.join', function(data){
        var currentRoom = socket.room;
        users.setRoom(socket.user,data);
        rooms.addUser(data,socket.user);
        socket.room = data;
        if (currentRoom) {
            rooms.removeUser(currentRoom,socket.user);
            socket.broadcast.to(currentRoom).emit('user.list',rooms.userList(currentRoom));
            socket.leave(currentRoom);
        }
        socket.join(data);
        io.sockets.in(socket.room).emit('user.list',rooms.userList(data));  
//        io.sockets.in(socket.room).emit('chat.history',cache.get(data+'.chat'));   
        socket.emit('chat.history',cache.get(data+'.chat'));   
        console.log(socket.user+' joined ' + data);
    });

    socket.on('chat.message',function (data) {
        if (!socket.user) {
            return;
        }
        console.log(socket.user+'@'+socket.room+':'+data);
        var chat = cache.get(socket.room+'.chat') || [];
        // only keep the last 50 messages;
        if (chat.length >= 50) {
            chat.shift();
        }
        var msg = {
            time: utils.dateTime(),
            msg: data,
            user: socket.user
        };
        chat.push(msg);
        cache.set(socket.room+'.chat',chat)
        io.sockets.in(socket.room).emit('chat.update',msg); 
    });
    
    socket.on('chat.pm',function (data) {
        if (!socket.user) {
            return;
        }
        var toUser = data.user;
        var msg = {
            msg: data.msg,
            time: utils.dateTime(),
            from: socket.user,
            read: false
        }
        chat.newPM(toUser,msg);
        io.sockets.in(toUser+'.messages').emit('pm.new',msg);
    });

    socket.on('chat.pm.delete',function (id) {
        if (!socket.user) {
            return;
        }
        chat.deletePM(socket.user,id);
    });
    
    socket.on('chat.pm.read',function (id) {
        if (!socket.user) {
            return;
        }
        chat.readPM(socket.user,id);
    });

    socket.on('user.register', function(user){
        userLeave(socket);
        if (!user) {
            return;
        }
        socket.user = user;
        socket.emit('user.registered',users.getRoom(user));  
        console.log('user '+user+' registered');
        socket.broadcast.emit('user.joined',user);
        // channel for messaging user
        socket.join(user+'.messages');
        socket.emit('pm.list',chat.PMList(user));
    });
    
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log(err);
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});
