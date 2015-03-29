var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var cache = require('./modules/cache.js');

app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/index');
var users = require('./routes/users.js');
var rooms = require('./routes/rooms.js');

app.use('/', routes);

io.on('connection', function(socket){
    console.log('a user connected'); 
    socket.on('disconnect', function(data){
        socket.emit('user.left',data);  
    });
    socket.emit('rooms.available',cache.get('rooms'));
    socket.on('user.change', function(data){
        console.log('user changed: '+data);
        socket.emit('user.joined',data); 
    });
    socket.on('user.join', function(data){
         
    });
    socket.on('room.change', function(data){
        console.log('room changed: '+data);
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
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
