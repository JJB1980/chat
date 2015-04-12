/**
 * Created by John on 12/04/2015.
 */
/* global module: true */

var users = require('../modules/users.js');
var rooms = require('../modules/rooms.js');

var obj = {};

obj.init = function (io) {

    obj.io = io;

    io.on('connection', function (socket) {
//    console.log('a user connected');
        socket.on('disconnect', function (data) {
            userLeave(socket);
        });

        socket.on('room.join', function (data) {
            var currentRoom = socket.room;
            users.setRoom(socket.user, data);
            rooms.addUser(data, socket.user);
            socket.room = data;
            if (currentRoom) {
                rooms.removeUser(currentRoom, socket.user);
                socket.broadcast.to(currentRoom).emit('user.list', rooms.userList(currentRoom));
                socket.leave(currentRoom);
            }
            socket.join(data);
            io.sockets.in(socket.room).emit('user.list', rooms.userList(data));
            socket.emit('chat.history', rooms.getChat(data));
            console.log(socket.user + ' joined ' + data);
        });

        socket.on('chat.message', function (data) {
            if (!socket.user) {
                return;
            }
            console.log(socket.user + '@' + socket.room + ':' + data);
            var msg = rooms.addMessage(socket.room, socket.user, data);
            io.sockets.in(socket.room).emit('chat.update', msg);
        });

        socket.on('chat.pm', function (data) {
            if (!socket.user) {
                return;
            }
            var msg = users.newPM(socket.user, data);
            io.sockets.in(data.user + '.messages').emit('pm.new', msg);
        });

        socket.on('chat.pm.delete', function (id) {
            if (!socket.user) {
                return;
            }
            users.deletePM(socket.user, id);
        });

        socket.on('chat.pm.read', function (id) {
            if (!socket.user) {
                return;
            }
            users.readPM(socket.user, id);
        });

        socket.on('user.register', function (data) {
            userLeave(socket);
            if (!data) {
                return;
            }
            if (!users.authorised(data.user, data.token)) {
                socket.emit('user.not.authorised', data.user);
                return;
            }
            socket.user = data.user;
            socket.emit('user.registered', users.getRoom(data.user));
            console.log('user ' + data.user + ' registered');
            socket.broadcast.emit('user.joined', data.user);
            // channel for messaging user
            socket.join(data.user + '.messages');
            socket.emit('pm.list', users.PMList(data.user));
        });

    });

};

function userLeave(socket) {
    if (socket.user && socket.room) {
        rooms.removeUser(socket.room,socket.user);
        socket.broadcast.to(socket.room).emit('user.list',rooms.userList(socket.room));
        socket.leave(socket.room);
        socket.room = null;
    }
    if (socket.user) {
        console.log(socket.user+' disconnected');
        obj.io.sockets.emit('user.left',socket.user);
        socket.leave(socket.user+'.messages');
        socket.user = null;
    }
}

module.exports = obj;
