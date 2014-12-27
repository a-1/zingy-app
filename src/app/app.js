'use strict';


define(function (require) {

    var angular = require('angular');

    var dependencies = [

        //angular
        'ngRoute',
        'ui.bootstrap',

        //project modules
        require('home/home').name,
        require('events/events').name,
        require('offers/offers').name,
        require('account/account').name,
        require('results/results').name,
        require('coaches/coaches').name,
        require('shared/header/header').name

    ];

    return angular
        .module('app', dependencies)
        .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

            //html5 PushState
            $locationProvider.html5Mode(false);

            //default route
            $routeProvider.otherwise('/');

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