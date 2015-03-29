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

app.controller('homeController', function ($scope, io) {
    
});


app.service('utils', function () {
    return {
        ok: function (value) {
            return (value === "" || !value) ? false: true;
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
    
});

app.factory('io', function ($rootScope, cache, LxNotificationService) {
    
    var obj = {};
    
    obj.socket = io();
    
    obj.emit = function (event, data) {
        if (typeof data === Object) {
            this.socket.emit(event,JSON.stringify(data));
        } else {
            this.socket.emit(event,data);
        }
    };
    
    obj.socket.on('rooms.available',function (data) {
        $rootScope.$broadcast('rooms.change',data);
        cache.set('rooms',data);
    });

    obj.socket.on('user.joined',function (data) {
        LxNotificationService.info(data+' joined the lobby');
    });

    
    return obj;
    
});

app.directive('myRooms',function () {
    return {
        restrict: 'E',
        templateUrl: 'partials/roomsDirective.html',
        controller: function ($scope, $rootScope, cache, io) {
            $scope.currentRoom = 0;
            $scope.rooms = cache.get('rooms') || [];
            $rootScope.$on('rooms.change',function (event, data) {
                $scope.rooms = data || cache.get('rooms');
                $scope.$apply();
             });
            $scope.changeRoom = function (room,index) {
                $scope.currentRoom = index;
                io.emit('room.change',room.name);
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
        controller: function ($scope, $rootScope, store, utils, io) {
            $scope.errors = {};
            $scope.username = store.get('username') || '';
            if ($scope.username !== '') {
                io.emit('user.change',$scope.username);
            }
            $scope.updateUsername = function () {
                $scope.errors = {};
                if (!utils.ok($scope.username)) {
                    $scope.errors.username = true;
                } else {
                    io.emit('user.change',$scope.username);
                }
                store.set('username',$scope.username);
            }
        },
        link: function (scope, element) {
            element.find('input').focus(function () {    
                element.find('.input-icon').addClass('focus-icon');
                element.find('.input-bottom').addClass('focus-bottom');            
            });
            element.find('input').blur(function () {          
                element.find('.input-icon').removeClass('focus-icon');
                element.find('.input-bottom').removeClass('focus-bottom');            
            }); 
        }
    };
});

