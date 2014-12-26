'use strict';

define(['angular', 'ramda'], function (angular, R) {

    return angular
        .module('home.ctrl', [])
        .controller('home.ctrl', ['$scope', function ($scope) {
            $scope.multiply = R.multiply(2);
            $scope.title = 'Zingy is now JustKhelo';
        }]);

});