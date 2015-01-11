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
        'angular-messages': {
            deps: ['angular']
        },
        'angular-resource': {
            deps: ['angular']
        },
        'angular-sanitize': {
            deps: ['angular']
        },
        'ui-bootstrap': {
            deps: ['angular']
        },
        'satellizer': {
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
        'angular-messages': '../vendor/angular/angular-messages',
        'angular-resource': '../vendor/angular/angular-resource',
        'angular-sanitize': '../vendor/angular/angular-sanitize',
        'ui-bootstrap': '../vendor/angular/ui-bootstrap-tpls',
        'ramda': '../vendor/ramda/ramda',
        'satellizer': '../vendor/satellizer/satellizer',
        'templateCache': 'templateCache'
    }
});

require([
        'angular',
        'angular-route',
        'angular-touch',
        'angular-animate',
        'angular-messages',
        'angular-resource',
        'angular-sanitize',
        'ui-bootstrap',
        'satellizer',
        'templateCache',
        'appConfig',
        'app'],
    function (angular) {
        angular.element(document).ready(function () {
            angular.bootstrap(document, ['app', 'appConfig']);
        });
    });