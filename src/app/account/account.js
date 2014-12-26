'use strict';

define(['angular',
    './accountService',
    './login/account.login.ctrl',
    './signup/account.signup.ctrl',
    './settings/account.settings.ctrl'], function (angular) {

    return angular
        .module('account', [
            'account.login.ctrl',
            'account.signup.ctrl',
            'account.settings.ctrl'])
        .config(['$routeProvider', function ($routeProvider) {

            //login
            $routeProvider.when('/account/login', {
                controller: 'account.login.ctrl',
                templateUrl: 'app/account/login/account.login.tpl.html'
            });

            //signup
            $routeProvider.when('/account/signup', {
                controller: 'account.signup.ctrl',
                templateUrl: 'app/account/signup/account.signup.tpl.html'
            });

            //settings
            $routeProvider.when('/account/settings', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html'
            });

        }]);

});