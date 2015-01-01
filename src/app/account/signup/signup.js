'use strict';

define(['angular', './account.signup.ctrl'], function (angular) {

    return angular
        .module('account.signup', ['account.signup.ctrl'])
        .config(['$routeProvider', function ($routeProvider) {

            //routes
            $routeProvider.when('/account/signup', {
                controller: 'account.signup.ctrl',
                templateUrl: 'app/account/signup/account.signup.tpl.html'
            });

        }]);

});