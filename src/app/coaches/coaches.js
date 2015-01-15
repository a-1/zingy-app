'use strict';

define(['angular', './coach', './details/coaches.details.ctrl'], function (angular) {

    return angular
        .module('coaches', ['coach', 'coaches.details.ctrl'])
        .config(['$routeProvider', function($routeProvider){

            $routeProvider.when('/coaches/details/:id', {
                controller: 'coaches.details.ctrl',
                templateUrl: 'app/coaches/details/coaches.details.tpl.html',
                resolve: {
                    coach: ['$route', 'Coach', function ($route, Coach) {

                      return  Coach.get({id: $route.current.params.id}).$promise.then(function(data) {
                          return data;
                      });

                    }],
                    googleMaps: ['googleMapsService', function (googleMapsService) {
                        googleMapsService.init().then(function (googleMaps) {
                            return googleMaps;
                        });
                    }]
                }

            });

        }]);

});