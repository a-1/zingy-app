'use strict';

define(['angular',
    './accountService',
    './login/login',
    './signup/signup',
    './settings/account.settings.ctrl',
    './settings/manage/manage',
    './settings/enthusiasts/enthusiasts',
    './settings/players/players',
    './settings/coaches/coaches',
    './settings/facilities/facilities',
    './settings/suppliers/suppliers',
    './settings/events/events',
    './settings/offers/offers'
], function (angular) {

    return angular
        .module('account', [
            'accountService',
            'account.login',
            'account.settings.ctrl',
            'account.settings.manage',
            'account.settings.enthusiasts',
            'account.settings.players',
            'account.settings.coaches',
            'account.settings.facilities',
            'account.settings.suppliers',
            'account.settings.events',
            'account.settings.offers'
        ])
        .config(['$authProvider', function ($authProvider) {

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

        }]);

});