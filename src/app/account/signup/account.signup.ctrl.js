'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.signup.ctrl', [])
        .controller('account.signup.ctrl', ['$scope', 'accountService', function ($scope, accountService) {

            $scope.authenticate = accountService.authenticate;

        }]);


});