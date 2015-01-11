'use strict';

define(['angular'], function (angular) {

    return angular
        .module('appConfig', [])
        .service('appConfig', function () {
            return {
            <% if(isProduction) { %>
                apiBaseURL: 'http://api.justkhelo.com/api',
            <% } else if(isStaging) { %>
                apiBaseURL: 'http://justkhelo-api.herokuapp.com/api',
            <% } else { %>
                apiBaseURL: 'http://localhost:3000/api',
            <% } %>
                fbClientId: '542735292530166',
                googleClientId: '127859079827-frmqmjp13dj5c3u93rkri0mebg4tdj3g.apps.googleusercontent.com'
            };
        })
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

            <% if(isProduction) { %>
            var apiBaseURL = 'http://api.justkhelo.com/api';
            <% } else if(isStaging) { %>
            var apiBaseURL = 'http://justkhelo-api.herokuapp.com/api';
            <% } else { %>
            var apiBaseURL = 'http://localhost:3000/api';
            <% } %>

            // Facebook
            $authProvider.facebook({
                clientId: '542735292530166',
                url: apiBaseURL + '/auth/facebook'
            });

            // Google
            $authProvider.google({
                clientId: '127859079827-frmqmjp13dj5c3u93rkri0mebg4tdj3g.apps.googleusercontent.com',
                url: apiBaseURL + '/auth/google'
            });

        }]);

});