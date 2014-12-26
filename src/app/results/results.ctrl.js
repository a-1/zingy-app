'use strict';

define(['angular','./resultsService'], function (angular) {

    return angular
        .module('results.ctrl', ['resultsService'])
        .controller('results.ctrl', ['$scope','resultsService', function ($scope,resultsService) {
            $scope.title = 'Zingy is now JustKhelo';
            $scope.storeNames = resultsService.getResults();
        }]);

});