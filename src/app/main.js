'use strict';

require.config({
    shim: {
        angular: {
            exports: 'angular'
        },
        'angular-route': {
            deps: ['angular']
        },
        'angular-touch': {
            deps: ['angular']
        },
        'angular-animate': {
            deps: ['angular']
        },
        'templateCache': {
            deps: ['angular']
        }
    },
    paths: {
        'angular': '../vendor/angular/angular',
        'angular-route': '../vendor/angular/angular-route',
        'angular-touch': '../vendor/angular/angular-touch',
        'angular-animate': '../vendor/angular/angular-animate',
        'ramda': '../vendor/ramda/ramda',
        'templateCache': 'templateCache'
    }
});

require(['angular', 'angular-route', 'angular-touch', 'angular-animate', 'templateCache', 'app'], function (angular) {
    angular.element(document).ready(function () {
        angular.bootstrap(document, ['app']);
    });
});