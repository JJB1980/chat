/**
 * Created by John on 3/05/2015.
 */

(function () {

    'use strict';

    var app = window.app;

    app.controller('myUserCtrl', function ($scope, $rootScope, store, utils, comms, io, user) {
        $scope.errors = {};
        $scope.username = user.name();
        $scope.token = user.token();
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
            //console.log($scope.pword);
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
                        //console.log('user.pwd');
                        //console.log($scope.username);
                        //console.log(response);
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
                //console.log('user.authenticate');
                //console.log($scope.username);
                //console.log(response);
                $scope.auth = false;
                if (response.exists && response.setpwd) {
                    $scope.setpwd = true;
                    utils.warn('Set your password');
                    return;
                } else if (response.exists && !response.login) {
                    utils.warn('Invalid password');
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
            user.validated(response,$scope.username);
        };
        //if ($scope.username !== '') {
        //    $scope.authenticate();
        //}
    });

    app.directive('myUser', function () {
        return {
            restrict: 'E',
            templateUrl: 'components/user/template.html',
            controller: 'myUserCtrl'
        };
    });

})();