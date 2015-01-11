'use strict';


define(function (require) {

    var angular = require('angular');

    var dependencies = [
        //angular
        'ngRoute',
        'ngTouch',
        //'ngAnimate', // - its not working with carousel
        'ngMessages',
        'ngResource',
        'ngSanitize',
        'ui.bootstrap',
        'satellizer',

        //load components
        require('../components/components').name,

        //load directives
        require('shared/directives/directives').name,

        // /load services
        require('shared/services/services').name,

        //services
        require('profiles/profiles').name,
        require('enthusiasts/enthusiasts').name,
        require('players/players').name,
        require('coaches/coaches').name,
        require('facilities/facilities').name,
        require('suppliers/suppliers').name,
        require('events/events').name,
        require('offers/offers').name,
        require('account/account').name,

        //shared modules
        require('shared/header/header').name,
        require('shared/footer/footer').name,

        //search
        require('search/search').name,

        // home
        require('home/home').name

    ];

    return angular
        .module('app', dependencies)
        .constant('config', {
            apiBaseURL: 'http://localhost:3000/api'
        })
        .config(['$resourceProvider', '$routeProvider', '$locationProvider', function ($resourceProvider, $routeProvider, $locationProvider) {

            // strip trailing slashes from calculated URLs
            $resourceProvider.defaults.stripTrailingSlashes = true;

            //default route
            $routeProvider.otherwise('/');

            //html5 PushState
            $locationProvider.html5Mode(true);

        }])
        .run(['$rootScope', '$window', function ($rootScope, $window) {
            var onResize = function () {
                $rootScope.$apply(function () {
                    var clientWidth = $window.document.body.clientWidth;
                    $rootScope.isMobileVerticle = clientWidth < 480;
                    $rootScope.isMobileHorizontal = clientWidth >= 480 && clientWidth < 768;
                    $rootScope.isTablet = clientWidth >= 768 && clientWidth < 992;
                    $rootScope.isSmallDesktop = clientWidth >= 992 && clientWidth < 1200;
                    $rootScope.isLargeDesktop = clientWidth >= 1200;
                    $rootScope.isMobile = clientWidth < 768;
                });
            };

            onResize();
            $window.addEventListener('resize', onResize, false);

        }]);

});