'use strict';

define(['angular', './search.ctrl'], function (angular) {

    return angular
        .module('search', ['search.ctrl'])
        .config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/search', {
                controller: 'search.ctrl',
                templateUrl: 'app/search/results/results.tpl.html'
            });

        }]);

});