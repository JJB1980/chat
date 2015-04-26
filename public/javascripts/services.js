/**
 * Created by John on 19/04/2015.
 */

(function () {

    var app = window.app;

    // utility service
    app.service('utils', function ($rootScope) {
        return {
            ok: function (value) {
                return (value !== "" && value !== null && value !== undefined) ? true : false;
            },
            info: function (message) {
                //            LxNotificationService.info(message);
                //            $rootScope.toastMessage = "<span class='mdi mdi-alert-circle'></span> " + message;
                $rootScope.toastMessage = message;
                document.querySelector('#mainToast').show();
            },
            warn: function (message) {
                //            LxNotificationService.warning(message);
                $rootScope.toastMessage = message;
                document.querySelector('#mainToast').show();
            },
            error: function (message) {
                //            LxNotificationService.error(message);
                $rootScope.toastMessage = message;
                document.querySelector('#mainToast').show();
            },
            scrollChat: function () {
                try {
                    document.getElementById('chat-messages').scrollTop = 0;
                    Ps.update(container);
                } catch (err) {}
            },
            closeDrawer: function () {
                document.getElementsByTagName('core-drawer-panel')[0].closeDrawer();
            }
        };
    });

    // interface to localStorage
    app.service('store', function () {
        return {
            set: function (key,value) {
                localStorage.setItem(key,value);
            },
            get: function (key) {
                return localStorage.getItem(key);
            }
        };
    });

    // interface to server api
    app.factory('comms', function ($rootScope, $http) {

        var host = window.location.origin + '/api/';

        return {
            connect: function (user,pwd,token) {
                var url = host+'user?user='+user+'&pwd='+pwd+'&token='+token;
                console.log(url);
                return $http.get(url);
            },
            pwd: function (user,pwd) {
                var url = host+'user';
                console.log(url);
                return $http.post(url,{
                    user: user,
                    pwd: pwd
                });
            },
            rooms: function () {
                var url = host+'rooms';
                console.log(url);
                return $http.get(url);
            }
        };

    });

    // interface to socket.io
    app.factory('io', function ($rootScope, utils) {

        var obj = {};

        obj.socket = io();

        obj.emit = function (event, data) {
            if (typeof data === Object) {
                this.socket.emit(event,JSON.stringify(data));
            } else {
                this.socket.emit(event,data);
            }
        };

        obj.socket.on('user.joined',function (data) {
            utils.info(data+' has joined.');
        });

        obj.socket.on('user.left',function (data) {
            console.log('user.left');
            utils.info(data+' has left.');
        });

        return obj;

    });

})();