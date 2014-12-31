'use strict';

define(['angular'], function (angular) {

    return angular
        .module('header.ctrl', [])
        .controller('header.ctrl', ['$scope', '$auth', function ($scope, $auth) {
            $scope.isCollapsed = true;

            $scope.isAuthenticated = function () {
                return $auth.isAuthenticated();
            };

            $scope.logout = function () {
                $auth.logout();
            };

        }]);

});