'use strict';


define(function (require) {

    var angular = require('angular');

    var dependencies = [

        //angular
        'ngRoute',
        'ui.bootstrap',
        'satellizer',

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
        .config([
            '$routeProvider',
            '$locationProvider',
            '$authProvider',
            function ($routeProvider, $locationProvider, $authProvider) {

                //html5 PushState
                $locationProvider.html5Mode(false);

                //default route
                $routeProvider.otherwise('/');

                //authentication
                $authProvider.loginOnSignup = true;
                $authProvider.loginRedirect = '/';
                $authProvider.logoutRedirect = '/';
                $authProvider.signupRedirect = '/login';
                $authProvider.loginUrl = '/auth/login';
                $authProvider.signupUrl = '/auth/signup';
                $authProvider.loginRoute = '/account/login';
                $authProvider.signupRoute = '/account/signup';
                $authProvider.tokenName = 'token';
                $authProvider.tokenPrefix = 'zingy'; // Local Storage name prefix
                $authProvider.unlinkUrl = '/auth/unlink/';
                $authProvider.authHeader = 'Authorization';

                // Facebook
                $authProvider.facebook({
                    clientId: '542735292530166',
                    url: 'http://localhost:3000/auth/facebook',
                    authorizationEndpoint: 'https://www.facebook.com/dialog/oauth',
                    redirectUri: window.location.origin + '/' || window.location.protocol + '//' + window.location.host + '/',
                    scope: 'email',
                    scopeDelimiter: ',',
                    requiredUrlParams: ['display', 'scope'],
                    display: 'popup',
                    type: '2.0',
                    popupOptions: {width: 481, height: 269}
                });


                // Google
                $authProvider.google({
                    clientId: '127859079827-frmqmjp13dj5c3u93rkri0mebg4tdj3g.apps.googleusercontent.com',
                    url: 'http://localhost:3000/auth/google',
                    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
                    redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
                    scope: ['profile', 'email'],
                    scopePrefix: 'openid',
                    scopeDelimiter: ' ',
                    requiredUrlParams: ['scope'],
                    optionalUrlParams: ['display'],
                    display: 'popup',
                    type: '2.0',
                    popupOptions: {width: 580, height: 400}
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