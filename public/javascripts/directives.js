/**
 * Created by John on 19/04/2015.
 */

(function () {

    var app = window.app;

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
                    //console.log(scope.dropdown);
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