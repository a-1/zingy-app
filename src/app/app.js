'use strict';

define(['angular', './home/home','./results/results', 'angular-route'], function (angular) {

    return angular
        .module('app', ['ngRoute', 'home','results'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.otherwise('/');
        }]);

});