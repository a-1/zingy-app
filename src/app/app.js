'use strict';

define(['angular', './home/home', 'angular-route'], function (angular) {

    return angular
        .module('app', ['ngRoute', 'home'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.otherwise('/');
        }]);

});