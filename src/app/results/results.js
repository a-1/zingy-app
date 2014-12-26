'use strict';

define(['angular', './results.ctrl'], function (angular) {

    return angular
        .module('results', ['results.ctrl'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/results', {
                controller: 'results.ctrl',
                templateUrl: 'app/results/results.tpl.html'
            });
        }]);

});