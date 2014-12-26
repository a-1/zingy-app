'use strict';

define(['angular'], function (angular) {

    return angular
        .module('header.ctrl', [])
        .controller('header.ctrl', ['$scope', function ($scope) {
            $scope.isCollapsed = true;
        }]);

});