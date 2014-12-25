'use strict';

define(['angular'], function (angular) {

    return angular
        .module('home.ctrl', [])
        .controller('home.ctrl', ['$scope', function ($scope) {
            $scope.title = 'Zingy is now JustKhelo';
        }]);

});