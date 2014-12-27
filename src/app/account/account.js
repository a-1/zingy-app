'use strict';

define(['angular',
    './accountService',
    './login/account.login.ctrl',
    './signup/account.signup.ctrl',
    './settings/account.settings.ctrl'], function (angular) {

    return angular
        .module('account', [
            'accountService',
            'account.login.ctrl',
            'account.signup.ctrl',
            'account.settings.ctrl'])
        .config(['$routeProvider', '$authProvider', function ($routeProvider, $authProvider) {

            //routes
            $routeProvider.when('/account/login', {
                controller: 'account.login.ctrl',
                templateUrl: 'app/account/login/account.login.tpl.html'
            }).when('/account/signup', {
                controller: 'account.signup.ctrl',
                templateUrl: 'app/account/signup/account.signup.tpl.html'
            }).when('/account/settings', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html'
            });

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
                url: 'http://localhost:3000/api/auth/facebook',
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
                url: 'http://localhost:3000/api/auth/google',
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

        }]);

});