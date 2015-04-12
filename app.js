var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var favicon = require('serve-favicon');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));

var index = require('./routes/index');
var api = require('./routes/api.js');
var sockets = require('./modules/sockets.js');

// route to index page.
app.use('/', index);
// route to some api calls for user login etc.
app.use('/api/', api);


var cleanup = require('./modules/cleanup.js').Cleanup(myCleanup);
// defines app specific callback...
function myCleanup() {
  console.log('App specific cleanup code...');
};


// socket connection and events.
sockets.init(io);

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
