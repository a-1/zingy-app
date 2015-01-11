'use strict';

define(['angular',
    './accountService',
    './authentication/account.authentication',
    './settings/account.settings',
], function (angular) {

    return angular
        .module('account', [
            'accountService',
            'account.authentication',
            'account.settings'
        ])
        .config(['$authProvider', function ($authProvider) {

            //auth config
            $authProvider.loginOnSignup = true;
            $authProvider.loginRedirect = '/';
            $authProvider.logoutRedirect = '/';
            $authProvider.signupRedirect = '/account/login';
            $authProvider.loginUrl = 'api/auth/login';
            $authProvider.signupUrl = 'api/auth/signup';
            $authProvider.loginRoute = '/account/login';
            $authProvider.signupRoute = '/account/signup';
            $authProvider.tokenName = 'token';
            $authProvider.tokenPrefix = 'justKhelo';
            $authProvider.unlinkUrl = 'api/auth/unlink/';
            $authProvider.authHeader = 'Authorization';

            // Facebook
            $authProvider.facebook({
                clientId: '542735292530166',
                url: 'http://api.justkhelo.com/api/auth/facebook'
            });

            // Google
            $authProvider.google({
                clientId: '127859079827-frmqmjp13dj5c3u93rkri0mebg4tdj3g.apps.googleusercontent.com',
                url: 'http://api.justkhelo.com/api/auth/google'
            });

        }]);

});