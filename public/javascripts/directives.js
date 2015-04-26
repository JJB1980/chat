/**
 * Created by John on 19/04/2015.
 */

(function () {

    var app = window.app;

    app.directive('myRooms', function () {
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
                $scope.changeRoom = function (room, index) {
                    $scope.currentRoom = index;
                    //                console.log(room);
                    $rootScope.$broadcast('room.change', room.name);
                    utils.closeDrawer();
                };
                // set room if stored on server
                io.socket.on('user.registered', function (event, data) {
                    console.log('user.registered');
                    console.log(data);
                    var found = false;
                    if (data) {
                        for (var i = 0; i < $scope.rooms.length; i++) {
                            if ($scope.rooms[i].name === data) {
                                $scope.changeRoom($scope.rooms[i], i);
                                found = true;
                                break;
                            }
                        }
                    }
                    if (!found) {
                        $scope.changeRoom($scope.rooms[0], 0);
                    }
                });
            },
            link: function (scope, element) {
                // show rooms on click of down arrow.
                element.find('.rooms-show').click(function () {
                    window.setTimeout(function () {
                        element.find('.rooms-show').css('display', 'none');
                        element.find('.rooms-hide').toggleClass('hidden-sm hidden-xs');
                        element.find('.my-rooms-content').toggleClass('hidden-sm hidden-xs');
                    }, 200);
                });
                // hide rooms on click of up arrow
                element.find('.rooms-hide').click(function () {
                    window.setTimeout(function () {
                        element.find('.rooms-show').css('display', 'block');
                        element.find('.rooms-hide').toggleClass('hidden-sm hidden-xs');
                        element.find('.my-rooms-content').toggleClass('hidden-sm hidden-xs');
                    }, 200);
                });
                // hide rooms when room selected.
                scope.$watch('currentRoom', function () {
                    if (!element.find('.rooms-hide').hasClass('hidden-sm')) {
                        element.find('.rooms-hide').trigger('click');
                    }
                });
            }
        };
    });

    app.directive('myUser', function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/userDirective.html',
            controller: function ($scope, $rootScope, store, utils, comms, io) {
                $scope.errors = {};
                $scope.username = store.get('username') || '';
                $scope.token = store.get('token') || '';
                $scope.pword = '';
                $scope.setpwd = false;
                io.socket.on('user.not.authorised', function (event, data) {
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
                        $scope.pwd = window.btoa($scope.username + ':' + $scope.pword);
                        if ($scope.setpwd) {
                            comms.pwd($scope.username, ($scope.pwd !== undefined ? $scope.pwd : '')).success(function (response) {
                                console.log('user.pwd');
                                console.log($scope.username);
                                console.log(response);

                                if (response.exists && response.login) {
                                    $scope.validated(response);
                                } else {
                                    utils.warn('Please enter credentials.');
                                }
                            });
                        } else {
                            $scope.authenticate();
                        }
                    }
                };
                // authenticate user to server.  display messages on exceptions
                $scope.authenticate = function () {
                    comms.connect($scope.username, ($scope.pwd !== undefined ? $scope.pwd : ''), $scope.token).success(function (response) {
                        console.log('user.authenticate');
                        console.log($scope.username);
                        console.log(response);
                        $scope.auth = false;
                        if (response.exists && response.setpwd) {
                            $scope.setpwd = true;
                            utils.warn('Set your password');
                            return;
                        } else if (response.exists && !response.login) {
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
                    store.set('username', $scope.username);
                    store.set('access', response.access);
                    store.set('token', response.token);
                    io.emit('user.register', {
                        user: $scope.username,
                        token: response.token
                    });
                    $rootScope.$broadcast('user.login', $scope.username);
                };
                if ($scope.username !== '') {
                    $scope.authenticate();
                }
            }
        };
    });

    app.directive('myInput', function () {
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
                $scope.$watch('myerror', function () {
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
                        $(element.find('.input-bottom').find('.bottom-slider')).animate({width: '100%'}, 200, "linear");
                    }
                });
                // reset styles and animation on blur
                element.find('.my-input').blur(function () {
                    if (!scope.thiserror) {
                        element.find('.input-icon').removeClass('focus-icon');
                        $(element.find('.input-bottom').find('.bottom-slider')).animate({width: '0%'}, 200, "linear", function () {
                            element.find('.input-bottom').removeClass('focus-bottom');
                        });
                    }
                });
                // catch enter and escape on keypress and call callback function if present.
                element.find('.my-input').bind("keypress", function (event) {
                    //                console.log(event);
                    if (event.which === 13 && scope.myenter) {
                        console.log('key.enter');
                        scope.$apply(function () {
                            scope.myvalue = element.find('.my-input').val();
                            scope.myenter();
                        });
                        event.preventDefault();
                    } else {
                        setTimeout(function () {
                            scope.$apply(function () {
                                console.log('val:' + element.find('.my-input').val());
                                scope.myvalue = element.find('.my-input').val(); // + String.fromCharCode(event.which);
                                if (scope.mychange) {
                                    scope.mychange();
                                }
                            });
                        }, 50);
                    }
                });
                element.find('.my-input').bind("keyup", function (event) {
                    if (event.which === 27 && scope.myescape) {
                        console.log('key.esc');
                        scope.$apply(function () {
                            scope.myvalue = '';
                            scope.myescape();
                        });
                        event.preventDefault();
                    }
                });
            }
        };
    });

    app.directive('whisperUser', function () {
        return {
            restrict: 'E',
            scope: {
                username: '=username',
                msguser: '=msguser',
                clickfn: '=clickfn'
            },
            template: '<div data-ng-show="username!==msguser"  my-tooltip data-placement="bottom" ' +
            'title="Message User" class="hand pm-user pm-user-hov" ' +
            'data-ng-click="clickfn(msguser)">{{msguser}}</div>'
        };
    });

    app.directive('myTooltip', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).tooltip({container: 'body'});
            }
        };
    });


    app.directive('menuOpen', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).click(function () {
                    if (!scope.dropdown) {
                        scope.dropdown = document.getElementById('menu-dropdown');
                    }
                    console.log(scope.dropdown);
                    scope.dropdown && scope.dropdown.toggle();
                });
            }
        };
    });

    app.directive('showUsers', function () {
        return {
            restrict: 'A',
            scope: {},
            link: function (scope, element, attrs) {
                scope.state = {
                    opened: false
                };
                $(element).click(function () {
                    if (!scope.state.opened) {
                        scope.state.opened = true;
                        //$('#chat-users').css('display', 'block');
                        $('#chat-users').addClass('chat-users-open'); //.removeClass('chat-users-close');
                        $('#title-users').removeClass('mdi-account').addClass('mdi-account-remove');
                    } else {
                        scope.state.opened = false;
                        $('#chat-users').removeClass('chat-users-open'); //.addClass('chat-users-close');
                        $('#title-users').addClass('mdi-account').removeClass('mdi-account-remove');
                        //setTimeout(function () {
                        //    $('#chat-users').removeAttr('style');
                        //}, 700);
                    }
                });
            }
        };
    });

    app.directive('myScroll',function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).perfectScrollbar({suppressScrollX: true});
            }
        };
    });

})();