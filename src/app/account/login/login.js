'use strict';

define(['angular', './account.login.ctrl'], function (angular) {

    return angular
        .module('account.login', ['account.login.ctrl'])
        .config(['$routeProvider', function ($routeProvider) {

            //routes
            $routeProvider.when('/account/login', {
                controller: 'account.login.ctrl',
                templateUrl: 'app/account/login/account.login.tpl.html'
            });

        }]);

});