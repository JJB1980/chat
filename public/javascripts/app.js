'use strict';


$( document ).ready(function() {
    $(window).on('resize', resizeContainer);
    resizeContainer();
});

// resize content area to window height and width (if width less than 1000)
function resizeContainer() {
    var height = $(window).height();
    var width = $(window).width();
//    console.log(height+"|"+width);
    $('#content-container').css('height',height+'px');
    width = (parseInt(width) > 1000) ? 1000 : width;
    $('#content-container').css('width',width+'px');
}

var app = angular.module('App', [
    'ui.router',
    'lumx'
]);


// define an individual route.
app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    $stateProvider
        .state('index', {
            url: "",
            templateUrl: "partials/home.html",
            controller: "homeController"
        });
});

app.controller('homeController', function ($scope, $rootScope, utils, io, store) {
    
    $scope.comments = [];
    
    $scope.submitComment = function () {
        if (utils.ok($scope.comment)) {
            console.log($scope.comment);    
            utils.info('Message sent.');
            $scope.comment = '';
        }
    };

    $scope.currentRoom = '';
    
    $rootScope.$on('room.change',function (event, room) {
        if ($scope.currentRoom !== '') {
            io.emit('room.leave',{
                room: $scope.currentRoom
                user: store.get('username')
            });
        }
        console.log('join room '+room);
        io.emit('room.join',{
            room: room
            user: store.get('username')
        });
        $scope.currentRoom = room;
    });

});


app.service('utils', function (LxNotificationService) {
    return {
        ok: function (value) {
            return (value === "" || !value) ? false: true;
        },
        info: function (message) {
            LxNotificationService.info(message);
        },
        warn: function (message) {
            LxNotificationService.warning(message);
        }
    };
});

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

app.service('cache', function () {
    return {
        values: [],
        set: function (key,value) {
            this.values[key] = value;
        },
        get: function (key) {
            return this.values[key];
        }
    };
});

app.factory('comms', function ($rootScope, $http, cache) {
    
//    var host = 'http://localhost:3000/api/';
    var host = window.location.origin + '/api/';
    
    var obj = {
        connect: function (user,pwd) {
            var url = host+'user?user='+user+'&pwd='+pwd;
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

app.factory('io', function ($rootScope, cache, utils) {
    
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
        utils.info(data+' joined the lobby');
    });

    return obj;
    
});

app.directive('myRooms',function () {
    return {
        restrict: 'E',
        templateUrl: 'partials/roomsDirective.html',
        scope: {},
        controller: function ($scope, $rootScope, comms) {
            $scope.rooms = [];
            comms.rooms().success(function (response) {
                console.log(response);
                $scope.rooms = response;
                $scope.changeRoom($scope.rooms[0],0);
            }).error(function (response) {
               console.log(response); 
            });
            $scope.changeRoom = function (room,index) {
                $scope.currentRoom = index;
                $rootScope.$broadcast('room.change',room.name);
            };
        },
        link: function (scope, element) {
            element.find('.rooms-show').click(function () {
                element.find('.rooms-show').css('display','none');
                element.find('.rooms-hide').toggleClass('hidden-sm hidden-xs');
                element.find('.my-rooms-content').toggleClass('hidden-sm hidden-xs');
            });
            element.find('.rooms-hide').click(function () {
                element.find('.rooms-show').css('display','block');
                element.find('.rooms-hide').toggleClass('hidden-sm hidden-xs');
                element.find('.my-rooms-content').toggleClass('hidden-sm hidden-xs');
            });
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
        controller: function ($scope, $rootScope, store, utils, comms) {
            $scope.errors = {};
            $scope.username = store.get('username') || '';
            $scope.pwd = store.get('pwd') || '';
            $scope.pword = '';
            $scope.updateUsername = function () {
                console.log($scope.username);
                $scope.errors.username = false;
                if (!utils.ok($scope.username)) {
                    $scope.errors.username = true;
                } else {
                    $scope.authenticate();
                }
                store.set('username',$scope.username);
            };
            $scope.changePassword = function () {
                $scope.errors.password = false;
                console.log($scope.pword);
                if (!utils.ok($scope.pword)) {
                    $scope.errors.password = true;
                } else {
                    $scope.pwd = window.btoa($scope.username+':'+$scope.pword);
                    store.set('pwd',$scope.pwd);
                    comms.pwd($scope.username,($scope.pwd !== undefined ? $scope.pwd : '')).success(function (response) {
                        $scope.auth = true;
                        store.set('access',response.access);
                    });
                }               
            };
            $scope.authenticate = function () {
                comms.connect($scope.username,($scope.pwd !== undefined ? $scope.pwd : '')).success(function (response) {
                    console.log(response);
                    $scope.auth = false;
                    if (!response.exists) {
                        utils.warn('No such user');
                        return;
                    }
                    if (response.exists && response.setpwd) {
                        utils.warn('Set your password');
                        return;
                    } else if (response.exists && !response.login ) {
                        utils.warn('Enter your password');
                        return;
                    }
                    if (response.exists && response.login) {
                        $scope.auth = true;
                        store.set('access',response.access);
                        $rootScope.$broadcast('user.login',response.access);
                    }
                }).error(function (response) {
                    console.log(response);
                });
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
            myenter: '=myenter'
        },
        controller: function ($scope, $attrs) {
            if ($attrs.bounce) {
                $scope.bounce = { debounce: {'default': 500, 'blur': 0} };
            }
            $scope.myicon = $attrs.myicon;
            $scope.myholder = $attrs.myholder;
            $scope.mytype = $attrs.mytype;
//            $scope.$watch('myerror',function () {
//                console.log('myerror: '+$scope.myerror);
//                $scope.thiserror = $scope.myerror
//            }); 
        },
        link: function (scope, element, attrs) {
            element.find('.my-input').focus(function () { 
//                console.log(element);
//                if (!element.find('.my-input-container').hasClass('validate-error')) {
                    element.find('.input-icon').addClass('focus-icon');
                    element.find('.input-bottom').addClass('focus-bottom');  
                    console.log($(element.find('.input-bottom').children()[0]));
                    $(element.find('.input-bottom').find('.bottom-slider')).animate({width: '100%'},400,"linear");
//                }
            });
            element.find('.my-input').blur(function () {          
//                if (!element.find('.my-input-container').hasClass('validate-error')) {          
                    element.find('.input-icon').removeClass('focus-icon');
                    $(element.find('.input-bottom').find('.bottom-slider')).animate({width: '0%'},400,"linear",function() {
                        element.find('.input-bottom').removeClass('focus-bottom'); 
                    });
//                }
            }); 
            element.find('.my-input').bind("keydown keypress", function (event) {
                if(event.which === 13 && scope.myenter) {
                    scope.$apply(function (){
//                        console.log(element.find('.my-input').val());
//                        console.log(scope.myvalue);
                        scope.myvalue = element.find('.my-input').val();
                        scope.myenter();
                    });
                    event.preventDefault();
                } else {
                    scope.$apply(function (){
                       scope.myvalue = element.find('.my-input').val();
                    });
                }
            });
        }
    };
});