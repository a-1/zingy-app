'use strict';

define([
    'angular',
    './enthusiast',
    './enthusiasts.ctrl',
    './new/enthusiasts.new.ctrl',
    './details/enthusiasts.details.ctrl',
    './update/enthusiasts.update.ctrl'
], function (angular) {

    return angular
        .module('enthusiasts', ['Enthusiast', 'enthusiasts.ctrl', 'enthusiasts.new.ctrl', 'enthusiasts.details.ctrl', 'enthusiasts.update.ctrl'])
        .config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/enthusiasts', {
                controller: 'enthusiasts.ctrl',
                templateUrl: 'app/enthusiasts/enthusiasts.tpl.html',
                resolve: {
                    enthusiasts: ['Enthusiast', function (Enthusiast) {
                        return Enthusiast.query();
                    }]
                }
            }).when('/enthusiasts/new', {
                controller: 'enthusiasts.new.ctrl',
                templateUrl: 'app/enthusiasts/new/enthusiasts.new.tpl.html'
            }).when('/enthusiasts/:id', {
                controller: 'enthusiasts.details.ctrl',
                templateUrl: 'app/enthusiasts/details/enthusiasts.details.tpl.html',
                resolve: {
                    enthusiast: ['Enthusiast', '$routeParams', function (Enthusiast, $routeParams) {
                        return Enthusiast.get({id: $routeParams.id});
                    }]
                }
            }).when('/enthusiasts/:id/update', {
                controller: 'enthusiasts.update.ctrl',
                templateUrl: 'app/enthusiasts/update/enthusiasts.update.tpl.html',
                resolve: {
                    enthusiast: ['Enthusiast', '$routeParams', function (Enthusiast, $routeParams) {
                        return Enthusiast.get({id: $routeParams.id});
                    }]
                }
            });
        }]);

});