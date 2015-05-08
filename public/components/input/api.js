/**
 * Created by John on 3/05/2015.
 */

(function () {

    'use strict';

    var app = window.app;

    app.controller('myInputCtrl', function ($scope, $attrs) {
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
    });

    app.directive('myInput', function () {
        return {
            restrict: 'E',
            templateUrl: 'components/input/template.html',
            scope: {
                myvalue: '=myvalue',
                mychange: '=mychange',
                myerror: '=myerror',
                myenter: '=myenter',
                mymessage: '=mymessage',
                myescape: '=myescape'
            },
            controller: 'myInputCtrl',
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
                        //console.log('key.enter');
                        scope.$apply(function () {
                            scope.myvalue = element.find('.my-input').val();
                            scope.myenter();
                        });
                        event.preventDefault();
                    } else {
                        setTimeout(function () {
                            scope.$apply(function () {
                                //console.log('val:' + element.find('.my-input').val());
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
                        //console.log('key.esc');
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

})();