'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.login.ctrl', [])
        .controller('account.login.ctrl', ['$scope', 'accountService', function ($scope, accountService) {

            $scope.authenticate = accountService.authenticate;

        }]);

});