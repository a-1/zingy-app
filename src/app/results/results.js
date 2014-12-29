'use strict';

define(['angular', './results.ctrl'], function (angular) {

    return angular
        .module('results', ['results.ctrl'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/results', {
                controller: 'results.ctrl',
                templateUrl: 'app/results/results.tpl.html'
            }).when('/enthusiasts', {
                    controller: 'enthusiasts.ctrl',
                    templateUrl: 'app/results/results.tpl.html',
                    resolve: {
                        enthusiasts: ['Enthusiast', function (Enthusiast) {
                            return Enthusiast.query();
                        }]
                    }
            }).when('/suppliers', {
                controller: 'suppliers.ctrl',
                templateUrl: 'app/results/results.tpl.html',
                resolve: {
                    suppliers: ['Supplier', function (Supplier) {
                        return Supplier.query();
                    }]
                }
            });
        }]);

});