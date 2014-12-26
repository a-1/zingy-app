'use strict';


define(function (require) {

    var angular = require('angular');

    var dependencies = [

        //angular
        'ngRoute',
        'ui.bootstrap',

        //project modules
        require('home/home').name,
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
                    $rootScope.isMobile = $window.document.body.clientWidth < 768;
                });
            };
            $window.addEventListener('resize', onResize, false);
            onResize();
        }]);

});