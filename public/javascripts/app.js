(function () {

    'use strict';

    // define ChatApp app and dependencies.
    var app = angular.module('ChatApp', [
        'ui.router'
    ]);

    window.app = app;

    // application routing
    app.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");
        $stateProvider
            .state('home', {
                url: "/home",
                templateUrl: "partials/home.html",
                controller: "homeController"
            })
            .state('login', {
                url: "",
                templateUrl: "partials/login.html",
                controller: "loginController"
            });
    });

    window.resizeChatbar = function () {
        var width = $('#chat-messages-container').width();
        //console.log(width);
        $('#chat-bar').css('width',width+'px');
        $('#main-header').css('width',width+'px');
    }

    // register resize main container on document ready
    $( document ).ready(function() {
        $(window).on('resize', window.resizeChatbar);
        setTimeout(window.resizeChatbar,500);
        //resizeChatbar();

    });

})();