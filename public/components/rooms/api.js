/**
 * Created by John on 3/05/2015.
 */

(function () {

    var app = window.app;

    app.controller('myRoomsCtrl', function ($scope, $rootScope, comms, io, utils) {
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
            $scope.currentRoomIndex = index;
            //                console.log(room);
            $rootScope.$broadcast('room.change', room.name);
            utils.closeDrawer();
        };
        // set room if stored on server
        io.socket.on('user.registered', function (event, data) {
            //console.log('user.registered');
            //console.log(data);
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
    });

    app.directive('myRooms', function () {
        return {
            restrict: 'E',
            templateUrl: 'components/rooms/template.html',
            scope: {},
            controller: 'myRoomsCtrl',
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
                scope.$watch('currentRoomIndex', function () {
                    if (!element.find('.rooms-hide').hasClass('hidden-sm')) {
                        element.find('.rooms-hide').trigger('click');
                    }
                });
            }
        };
    });

})();