'use strict';

define(['angular'], function (angular) {

    return angular
        .module('enthusiasts.details.ctrl', [])
        .controller('enthusiasts.details.ctrl', ['$scope', 'enthusiast', function ($scope, enthusiast) {
            $scope.enthusiast = enthusiast;
        }]);

});