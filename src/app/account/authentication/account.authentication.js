'use strict';

define(['angular',
    './account.authentication.ctrl'], function (angular) {

    return angular
        .module('account.authentication', ['account.authentication.ctrl'])
        .config(['$routeProvider', function ($routeProvider) {

            //routes
            $routeProvider.when('/account/login', {
                controller: 'account.authentication.ctrl',
                templateUrl: 'app/account/authentication/login/account.authentication.login.tpl.html'
            });

            //routes
            $routeProvider.when('/account/signup', {
                controller: 'account.authentication.ctrl',
                templateUrl: 'app/account/authentication/signup/account.authentication.signup.tpl.html'
            });

        }]);

});