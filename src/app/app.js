'use strict';


define(function (require) {

    var angular = require('angular');

    var dependencies = [

        //angular
        'ngRoute',
        'ngTouch',
        'ngAnimate',
        'ngMessages',
        'ngResource',
        'ngSanitize',
        'ui.bootstrap',
        'satellizer',

        //load components
        require('../components/components').name,

        //project modules
        require('events/events').name,
        require('offers/offers').name,
        require('account/account').name,
        //require('enthusiasts/enthusiasts').name,
        //require('supplier/suppliers').name,
        //require('results/results').name,
        //require('coaches/coaches').name
        require('shared/header/header').name,
        require('home/home').name
    ];

    return angular
        .module('app', dependencies)
        .constant('config', {
            apiBaseURL: 'http://localhost:3000/api'
        })
        .config([
            '$resourceProvider',
            '$authProvider',
            '$routeProvider',
            '$locationProvider', function ($resourceProvider, $authProvider, $routeProvider, $locationProvider) {

                //html5 PushState
                $locationProvider.html5Mode(true);
                //default route
                $routeProvider.otherwise('/');

                // Don't strip trailing slashes from calculated URLs
                $resourceProvider.defaults.stripTrailingSlashes = true;

                //auth config
                $authProvider.loginOnSignup = true;
                $authProvider.loginRedirect = '/';
                $authProvider.logoutRedirect = '/';
                $authProvider.signupRedirect = '/account/login';
                $authProvider.loginUrl = 'api//auth/login';
                $authProvider.signupUrl = 'api/auth/signup';
                $authProvider.loginRoute = '/account/login';
                $authProvider.signupRoute = '/account/signup';
                $authProvider.tokenName = 'token';
                $authProvider.tokenPrefix = 'zingy'; // Local Storage name prefix
                $authProvider.unlinkUrl = 'api/auth/unlink/';
                $authProvider.authHeader = 'Authorization';

                // Facebook
                $authProvider.facebook({
                    clientId: '542735292530166',
                    url: 'http://localhost:3000/api/auth/facebook'
                });

                // Google
                $authProvider.google({
                    clientId: '127859079827-frmqmjp13dj5c3u93rkri0mebg4tdj3g.apps.googleusercontent.com',
                    url: 'http://localhost:3000/api/auth/google'
                });

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