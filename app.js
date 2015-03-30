var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var cache = require('./modules/cache.js');

app.use(express.static(path.join(__dirname, 'public')));

var index = require('./routes/index');
var users = require('./routes/users.js');
var rooms = require('./routes/rooms.js');
var api = require('./routes/api.js');
var chat = require('./routes/chat.js');

app.use('/', index);
app.use('/api/', api);

io.on('connection', function(socket){
//    console.log('a user connected'); 
    cache.set('socket',socket);
    socket.on('disconnect', function(data){
        if (socket.user && socket.room) {
            users.setRoom(socket.user,null);
            socket.broadcast.to(socket.room).emit('user.list',rooms.userList(socket.room));    
            socket.leave(socket.room);
        }
        console.log(socket.user+' disconnected');
        if ( socket.user ) {
            io.sockets.emit('user.left',socket.user);  
        }
    });
    
    socket.on('room.join', function(data){
        var currentRoom = users.getRoom(socket.user);
        users.setRoom(socket.user,data);
        socket.room = data;
        if (currentRoom) {
            socket.broadcast.to(currentRoom).emit('user.list',rooms.userList(currentRoom));
            socket.leave(currentRoom);
        }
        socket.join(data);
        io.sockets.in(socket.room).emit('user.list',rooms.userList(data));  
        io.sockets.in(socket.room).emit('chat.history',cache.get(data+'.chat'));          
        console.log(socket.user+' joined ' + data);
    });

    socket.on('chat.message',function (data) {
        console.log(socket.user+'@'+socket.room+':'+data);
        var chat = cache.get(socket.room+'.chat') || [];
        // only keep the last 50 messages;
        if (chat.length >= 50) {
            chat.shift();
        }
        var d = new Date();
        var msg = {
            time: d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+' '+(d.getHours())+':'+d.getMinutes()+':'+d.getSeconds(),
            msg: data,
            user: socket.user
        };
        chat.push(msg);
        cache.set(socket.room+'.chat',chat)
        io.sockets.in(socket.room).emit('chat.update',msg); 
    });
    
    socket.on('user.register', function(data){
        socket.user = data;
        var currentRoom = users.getRoom(socket.user);
        socket.emit('user.registered',currentRoom);  
        console.log('user '+data+' registered');
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
