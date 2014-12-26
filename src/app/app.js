'use strict';


define(function (require) {

    var angular = require('angular');

    var dependencies = [

        //angular
        'ngRoute',

        //project modules
        require('home/home').name,
        require('results/results').name,
        require('coaches/coaches').name
    ];

    return angular
        .module('app', dependencies)
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.otherwise('/');
        }]);

});