'use strict';

define(['angular'], function (angular) {

    return angular
        .module('enthusiasts.ctrl', [])
        .controller('enthusiasts.ctrl', ['$scope', 'enthusiasts', function ($scope, enthusiasts) {
            $scope.enthusiasts = enthusiasts;
            $scope.resultsTemplate = 'app/enthusiasts/enthusiasts.content.tpl.html';
        }]);

});