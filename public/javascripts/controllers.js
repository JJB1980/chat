/**
 * Created by John on 19/04/2015.
 */

(function () {

    var app = window.app;


    app.controller('loginController', function ($scope, $rootScope, $timeout, store, $window, utils) {
        if (utils.ok($scope.username) && utils.ok(store.get('token'))) {
            $window.location.href = '#/home';
        }
        $scope.username = store.get('username') || '';
    });

    app.controller('applicationController', function ($scope, $rootScope, $timeout, store, $window, utils) {

        $scope.currentRoom = '';
        $scope.showChat = true;
        $scope.unread = 0;
        $scope.username = store.get('username') || '';
        $scope.loggedin = false;

        if (utils.ok($scope.username) && utils.ok(store.get('token'))) {
            $scope.loggedin = true;
        }

        console.log('LOGGEDIN: '+$scope.loggedin);

        console.log('TOKEN: '+$scope.token);
        if ($scope.username === '' || $scope.token === '') {
            $window.location.href = '/#';
        }

        // change room
        $rootScope.$on('room.change',function (event, data) {
            $scope.currentRoom = data;
        });

        $rootScope.$on('messages.unread',function (event, data) {
            $scope.unread = data;
        });

        $rootScope.$on('user.login',function (event, user) {
            $scope.username = user;
            $scope.loggedin = true;
        });

        $scope.showMessages = function () {
            $timeout(function () {
                $scope.showChat = !$scope.showChat;
                $rootScope.$broadcast('chat.show',$scope.showChat);
            },200);
        };

        $scope.signout = function () {
            store.set('token','');
            $window.location.href = '/#';
        };

    });

    // main controller for messaging.
    app.controller('homeController', function ($scope, $rootScope, $timeout, utils, io, $window, store) {

        $scope.chat = [];
        $scope.users = [];
        $scope.username = '';
        $scope.pm = [];
        $scope.showChat = true;

        $scope.username = store.get('username') || '';

        $rootScope.$on('chat.show',function (event, data) {
            $scope.showChat = data;
        });


        // send chat message or whisper
        $scope.submitComment = function () {
            if (utils.ok($scope.comment)) {
                if (utils.ok($scope.pmUser)) {
                    io.emit('chat.pm',{user:$scope.pmUser,msg:$scope.comment});
                    $scope.cancelWhisper();
                } else {
                    io.emit('chat.message',$scope.comment);
                }
                $scope.comment = '';
            } else {
                $scope.cancelWhisper();
            }
        };

        $scope.PMDelete = function (msg,index) {
            io.emit('chat.pm.delete',msg.id);
            $scope.pm.splice(index,1);
            $scope.unreadMessages();
        };

        $scope.PMRead = function (msg) {
            io.emit('chat.pm.read',msg.id);
            msg.read = true;
            $scope.unreadMessages();
        };

        $scope.unreadMessages = function () {
            $scope.unread = 0;
            $scope.pm.forEach(function (pm) {
                if (!pm.read) {
                    $scope.unread++;
                }
            });
            $rootScope.$broadcast('messages.unread',$scope.unread);
        };

        // change room
        $rootScope.$on('room.change',function (event, room) {
            console.log('join room '+room);
            io.emit('room.join',room);
            if (!$scope.showChat) {
                $scope.showMessages();
            }
        });

        // update scope user
        $rootScope.$on('user.login',function (event, user) {
            $scope.username = user;
        });

        // display list of users in current room
        io.socket.on('user.list',function (data) {
            console.log('user.list updated');
            console.log(data);
            $scope.users = data;
            $scope.$apply();
        });

        // list of users personal messages
        io.socket.on('pm.list',function (data) {
            console.log('pm.list updated');
            console.log(data);
            $scope.pm = data.reverse();
            $scope.unreadMessages();
            $scope.$apply();
        });

        // receive new pm
        io.socket.on('pm.new',function (data) {
            console.log('pm.new');
            console.log(data);
            $scope.pm.unshift(data);
            $scope.unreadMessages();
            $scope.$apply();
        });

        // display chat history when joining a room
        io.socket.on('chat.history',function (data) {
            console.log('chat.history updated');
            $scope.chat = data.reverse();
            $scope.$apply();
            utils.scrollChat();
        });

        // update displayed chat messages from server
        io.socket.on('chat.update',function (data) {
            console.log('chat.update updated');
            console.log(data);
            $scope.chat.unshift(data);
            $scope.$apply();
            utils.scrollChat();
        });

        // start whisper user process
        $scope.whisperUser = function (toUser) {
            if ($scope.username === toUser) {
                return;
            }
            $scope.pmUser = toUser;
            $scope.whisperTo = 'PM: '+toUser;
        };

        // cancel whisper user process
        $scope.cancelWhisper = function () {
            $scope.pmUser = '';
            $scope.whisperTo = '';
        };

    });

})();