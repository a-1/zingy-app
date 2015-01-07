'use strict';

define(['angular', './search.ctrl', './bar/search.bar.ctrl'], function (angular) {

    return angular
        .module('search', ['search.ctrl', 'search.bar.ctrl'])
        .config(['$routeProvider', function ($routeProvider) {

            var searchConfig = {
                controller: 'search.ctrl',
                templateUrl: 'app/search/results/results.tpl.html',
                resolve: {
                    account: ['accountService', function (accountService) {
                        return accountService.fetch();
                    }]
                }
            };

            $routeProvider.when('/search', searchConfig)
                .when('/search/:location', searchConfig)
                .when('/coaches/:location', searchConfig)
                .when('/offers/:location', searchConfig)
                .when('/events/:location', searchConfig);

        }]);

});