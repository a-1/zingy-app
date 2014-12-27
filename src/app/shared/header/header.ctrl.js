'use strict';

define(['angular'], function (angular) {

    return angular
        .module('header.ctrl', [])
        .controller('header.ctrl', [
            '$scope',
            '$auth',
            'accountService', function ($scope, $auth, accountService) {

                var getProfile = function () {
                    accountService.getProfile()
                        .success(function (data) {
                            $scope.user = data;
                        });
                };

                $scope.isAuthenticated = function () {
                    return $auth.isAuthenticated();
                };

                $scope.logout = function () {
                    return $auth.logout();
                };

                getProfile();

                $scope.isCollapsed = true;
            }]);

});