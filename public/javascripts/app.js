(function () {

    'use strict';

    // define ChatApp app and dependencies.
    var app = angular.module('ChatApp', [
        'ui.router'
    ]);

    // application routing
    app.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");
        $stateProvider
            .state('index', {
                url: "",
                templateUrl: "partials/home.html",
                controller: "homeController"
            });

    });

    app.controller('ApplicationCtrl', function ($scope, $rootScope, $timeout) {

        $scope.currentRoom = '';
        $scope.showChat = true;
        $scope.unread = 0;

        // change room
        $rootScope.$on('room.change',function (event, data) {
            $scope.currentRoom = data;
        });

        $rootScope.$on('messages.unread',function (event, data) {
            $scope.unread = data;
        });

        $rootScope.$on('user.login',function (event, user) {
            $scope.username = user;
        });

        $scope.showMessages = function () {
            $timeout(function () {
                $scope.showChat = !$scope.showChat;
                $rootScope.$broadcast('chat.show',$scope.showChat);
            },200);
        };



    });

    // main controller for messaging.
    app.controller('homeController', function ($scope, $rootScope, $timeout, utils, io, store) {

        $scope.chat = [];
        $scope.users = [];
        $scope.username = '';
        $scope.pm = [];
        $scope.showChat = true;

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
            console.log(data)
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

    // utility service
    app.service('utils', function ($rootScope) {
        return {
            ok: function (value) {
                return (value === "" || !value) ? false: true;
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
                    //var el = $(".chat-messages-container");
                    //el.scrollTop(el[0].scrollHeight);
                    var el = document.getElementsByTagName('core-header-panel')[0];
                    $(el.scroller).animate({ scrollTop: 0 }, "fast");

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

        var obj = {
            connect: function (user,pwd,token) {
                var url = host+'user?user='+user+'&pwd='+pwd+'&token='+token;
                console.log(url);
                return $http.get(url);
            },
            pwd: function (user,pwd) {
                var url = host+'user?user='+user+'&pwd='+pwd;
                console.log(url);
                return $http.post(url);
            },
            rooms: function () {
                var url = host+'rooms';
                console.log(url);
                return $http.get(url);
            }
        }

        return obj;
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

    app.directive('myRooms',function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/roomsDirective.html',
            scope: {},
            controller: function ($scope, $rootScope, comms, io, utils) {
                $scope.rooms = [];
                // get rooms.
                comms.rooms().success(function (response) {
    //                console.log(response);
                    $scope.rooms = response.data;      
                }).error(function (response) {
                    console.log(response); 
                });
                // notify of room change
                $scope.changeRoom = function (room,index) {
                    $scope.currentRoom = index;
    //                console.log(room);
                    $rootScope.$broadcast('room.change',room.name);
                    utils.closeDrawer();
                };
                // set room if stored on server
                io.socket.on('user.registered',function (event,data) {
                    console.log('user.registered');
                    console.log(data);
                    var found = false;
                    if (data) {
                        for (var i = 0; i < $scope.rooms.length; i++) {
                            if ($scope.rooms[i].name === data) {
                                $scope.changeRoom($scope.rooms[i],i);
                                found = true;
                                break;
                            }
                        }
                    }
                    if (!found) {
                        $scope.changeRoom($scope.rooms[0],0);   
                    }
                });
            },
            link: function (scope, element) {
                // show rooms on click of down arrow.
                element.find('.rooms-show').click(function () {
                    window.setTimeout(function () {
                        element.find('.rooms-show').css('display','none');
                        element.find('.rooms-hide').toggleClass('hidden-sm hidden-xs');
                        element.find('.my-rooms-content').toggleClass('hidden-sm hidden-xs');                   
                    },200);
                });
                // hide rooms on click of up arrow
                element.find('.rooms-hide').click(function () {
                    window.setTimeout(function () {
                        element.find('.rooms-show').css('display','block');
                        element.find('.rooms-hide').toggleClass('hidden-sm hidden-xs');
                        element.find('.my-rooms-content').toggleClass('hidden-sm hidden-xs');
                     },200);               
                });
                // hide rooms when room selected.
                scope.$watch('currentRoom',function () {
                    if (!element.find('.rooms-hide').hasClass('hidden-sm')) {
                        element.find('.rooms-hide').trigger('click');
                    }
                });
            }
        };
    });

    app.directive('myUser',function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/userDirective.html',
            controller: function ($scope, $rootScope, store, utils, comms, io) {
                $scope.errors = {};
                $scope.username = store.get('username') || '';
                $scope.token = store.get('token') || '';
                $scope.pword = '';
                $scope.setpwd = false;
                io.socket.on('user.not.authorised',function (event,data) {
                    utils.error('Not authorised.');
                });
                 // call from user name input
                $scope.updateUsername = function () {
                    console.log($scope.username);
                    $scope.errors.username = false;
                    if (!utils.ok($scope.username)) {
                        $scope.errors.username = true;
                    } else {
    //                    $scope.authenticate();
                        $scope.pword = '';
                        $scope.auth = false;
                    }
               };
                // call from enter keypress on password input.
                $scope.changePassword = function () {
                    $scope.errors.username = false;
                    $scope.errors.password = false;
                    console.log($scope.pword);
                    if (!utils.ok($scope.username)) {
                        $scope.errors.username = true;
                    }
                    if (!utils.ok($scope.pword)) {
                        $scope.errors.password = true;
                    } 
                    if (!$scope.errors.password && !$scope.errors.username) {
                        $scope.pwd = window.btoa($scope.username+':'+$scope.pword);
                        if ($scope.setpwd) {
                            comms.pwd($scope.username,($scope.pwd !== undefined ? $scope.pwd : '')).success(function (response) {
                                console.log('user.pwd');
                                console.log($scope.username);
                                console.log(response);

                                if (response.exists && response.login) {
                                    $scope.validated(response);
                                } else {
                                    utils.warn('Please enter credentials.');
                                    return;
                                }
                            });
                        } else {
                            $scope.authenticate();
                        }
                    }               
                };
                // authenticate user to server.  display messages on exceptions
                $scope.authenticate = function () {
                    comms.connect($scope.username,($scope.pwd !== undefined ? $scope.pwd : ''),$scope.token).success(function (response) {
                        console.log('user.authenticate');
                        console.log($scope.username);
                        console.log(response);       
                        $scope.auth = false;
                        if (response.exists && response.setpwd) {
                            $scope.setpwd = true;
                            utils.warn('Set your password');
                            return;
                        } else if (response.exists && !response.login ) {
                            utils.warn('Enter your password');
                            return;
                        }
                        if (!response.exists) {
                            $scope.setpwd = true;
                            utils.warn('Set password');
                            return;
                        }
                        if (response.exists && response.login) {
                            $scope.validated(response);
                        }
                    }).error(function (response) {
                        console.log(response);
                    });
                };
                $scope.validated = function (response) {
                    $scope.auth = true;
                    $scope.setpwd = false;
                    store.set('username',$scope.username);
                    store.set('access',response.access);
                    store.set('token',response.token);
                    io.emit('user.register',{
                        user: $scope.username,
                        token: response.token
                    });
                    $rootScope.$broadcast('user.login',$scope.username);           
                };
                if ($scope.username !== '') {
                    $scope.authenticate();
                }
           }
        };
    });

    app.directive('myInput',function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/inputDirective.html',
            scope: {
                myvalue: '=myvalue',
                mychange: '=mychange',
                myerror: '=myerror',
                myenter: '=myenter',
                mymessage: '=mymessage',
                myescape: '=myescape'
            },
            controller: function ($scope, $attrs) {
    //            if ($attrs.bounce) {
    //                $scope.bounce = { debounce: {'default': 500, 'blur': 0} };
    //            }
                $scope.myicon = $attrs.myicon;
                $scope.myholder = $attrs.myholder;
                $scope.mytype = $attrs.mytype;
                $scope.isdark = $attrs.mydark;
                $scope.$watch('myerror',function () {
    //                console.log('myerror: '+$scope.myerror);
                    $scope.thiserror = $scope.myerror
                }); 
            },
            link: function (scope, element, attrs) {
                // apply some styling and animation on focus
                element.find('.my-input').focus(function () { 
    //                console.log(element);
                    if (!scope.thiserror) {
                        element.find('.input-icon').addClass('focus-icon');
                        element.find('.input-bottom').addClass('focus-bottom'); 
                        $(element.find('.input-bottom').find('.bottom-slider')).animate({width: '100%'},200,"linear");
                    }
                });
                // reset styles and animation on blur
                element.find('.my-input').blur(function () {          
                    if (!scope.thiserror) {          
                        element.find('.input-icon').removeClass('focus-icon');
                        $(element.find('.input-bottom').find('.bottom-slider')).animate({width: '0%'},200,"linear",function() {
                            element.find('.input-bottom').removeClass('focus-bottom'); 
                        });
                    }
                }); 
                // catch enter and escape on keypress and call callback function if present.
                element.find('.my-input').bind("keypress", function (event) {
    //                console.log(event);
                    if(event.which === 13 && scope.myenter) {
                        console.log('key.enter');
                        scope.$apply(function (){
                            scope.myvalue = element.find('.my-input').val();
                            scope.myenter();
                        });
                        event.preventDefault();
                    } else {
                        setTimeout(function () {
                            scope.$apply(function (){
                                console.log('val:'+element.find('.my-input').val());
                                scope.myvalue = element.find('.my-input').val(); // + String.fromCharCode(event.which);
                                if (scope.mychange) {
                                    scope.mychange();
                                }
                            });
                        },50);
                    }
                });
                element.find('.my-input').bind("keyup", function (event) {
                    if (event.which === 27 && scope.myescape) {
                        console.log('key.esc');
                        scope.$apply(function (){
                            scope.myvalue = '';
                            scope.myescape();
                        });
                        event.preventDefault();
                    }
                });
            }
        };
    });

//    app.directive('myButton', function () {
//        return {
//            restrict: 'E',
//            scope: {
//                clickfn: '=clickfn',
//    //            mytitle: '=mytitle',
//    //            myplacement: '=myplacement',
//    //            myicon: '=myicon'
//            },
//            template: '<span data-ng-click="clickfn()" class="mdi mdi-{{myicon}} hand my-button">'+
//                        '<paper-ripple fit></paper-ripple></span>',
//            controller: function ($scope, $attrs) {
//    //            $scope.mytitle = $attrs.mytitle;
//    //            $scope.myplacement = $attrs.myplacement;
//                $scope.myicon = $attrs.myicon;
//            },
//            link: function (scope, element, attrs) {
//                setTimeout(function () {
//                    scope.$apply(function () {
//                        console.log(attrs.myplacement+'|'+attrs.mytitle);
//                        $(element).attr('data-placement',attrs.myplacement);
//                        $(element).attr('title',attrs.mytitle);
//    //                    $(element).attr('my-tooltip','');   
//                    });
//                },50);
//            }
//        };
//    });

    app.directive('whisperUser', function () {
        return {
            restrict: 'E',
            scope: {
                username: '=username',
                msguser: '=msguser',
                clickfn: '=clickfn'
            },
            template: '<div data-ng-show="username!==msguser"  my-tooltip data-placement="bottom" ' +
                        'title="Message User" class="hand pm-user" ' +
                        'data-ng-click="clickfn(msguser)">{{msguser}}<paper-ripple fit></papper-ripple></div>'
        };
    });

    app.directive('myTooltip',function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).tooltip({container: 'body'});     
            }
        };
    });

    //app.directive('myScroll',function () {
    //    return {
    //        restrict: 'A',
    //        link: function (scope, element, attrs) {
    //            $(element).perfectScrollbar();
    //        }
    //    };
    //});


    // register resize main container on document ready
//    $( document ).ready(function() {
//        $(window).on('resize', resizeContainer);
//        resizeContainer();
//    });

    // resize content area to window height and width (if width less than 1000)
    function resizeContainer() {
        var height = $(window).height();
        var width = $(window).width();
    //    console.log(height+"|"+width);
        $('#content-container').css('height',height+'px');
        width = (parseInt(width) > 1000) ? 1000 : width;
        $('#content-container').css('width',width+'px');
        var inj = angular.element('body').injector();
        inj.get('utils').scrollChat();
    }

})();