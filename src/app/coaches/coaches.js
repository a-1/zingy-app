'use strict';

define(['angular',
    './new/coaches.new.ctrl',
    './edit/coaches.edit.ctrl',
    './details/coaches.details.ctrl'], function (angular) {

    return angular
        .module('coaches', [
            'coaches.new.ctrl',
            'coaches.edit.ctrl',
            'coaches.details.ctrl'
        ])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/coaches/new', {
                controller: 'coaches.new.ctrl',
                templateUrl: 'app/coaches/new/coaches.new.tpl.html'
            }).when('/coaches/edit', {
                controller: 'coaches.edit.ctrl',
                templateUrl: 'app/coaches/edit/coaches.edit.tpl.html'
            }).when('/coaches/details', {
                controller: 'coaches.details.ctrl',
                templateUrl: 'app/coaches/details/coaches.details.tpl.html'
            });
        }]);

});