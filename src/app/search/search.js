'use strict';

define(['angular', './search.ctrl', './bar/search.bar.ctrl'], function (angular) {

    return angular
        .module('search', ['search.ctrl', 'search.bar.ctrl'])
        .config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/search', {
                controller: 'search.ctrl',
                templateUrl: 'app/search/results/results.tpl.html'
            }).when('/search/:location', {
                controller: 'search.ctrl',
                templateUrl: 'app/search/results/results.tpl.html'
            }).when('/coaches/:location', {
                controller: 'search.ctrl',
                templateUrl: 'app/search/results/results.tpl.html'
            }).when('/offers/:location', {
                controller: 'search.ctrl',
                templateUrl: 'app/search/results/results.tpl.html'
            }).when('/events/:location', {
                controller: 'search.ctrl',
                templateUrl: 'app/search/results/results.tpl.html'
            });

        }]);

});