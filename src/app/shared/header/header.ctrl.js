'use strict';

define(['angular'], function (angular) {

    return angular
        .module('header.ctrl', [])
        .controller('header.ctrl', ['$scope', 'accountService', function ($scope, accountService) {
            //quick-settings collapse
            $scope.isCollapsed = true;
            $scope.changeLocation = false;

            $scope.user = accountService.account.user;
            $scope.quickSettings = accountService.account.quickSettings;
            $scope.city = accountService.account.location;
            $scope.cities = accountService.cities;

            $scope.isAuthenticated = accountService.isAuthenticated;
            $scope.logout = accountService.logout;

            $scope.updateLocation = function () {
                accountService.changeLocation($scope.city);
            };

        }]);

});