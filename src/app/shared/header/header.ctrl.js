'use strict';

define(['angular'], function (angular) {

    return angular
        .module('header.ctrl', [])
        .controller('header.ctrl', ['$scope', 'accountService', function ($scope, accountService) {
            //quick-settings collapse
            $scope.isCollapsed = true;

            $scope.user = accountService.account.user;
            $scope.quickSettings = accountService.account.quickSettings;

            $scope.isAuthenticated = accountService.isAuthenticated;

            $scope.logout = accountService.logout;

        }]);

});