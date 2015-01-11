'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.authentication.ctrl', [])
        .controller('account.authentication.ctrl', ['$scope', 'accountService', function ($scope, accountService) {

            $scope.authenticate = accountService.authenticate;

        }]);

});