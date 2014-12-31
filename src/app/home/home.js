'use strict';

define(['angular', './home.ctrl'], function (angular) {

    return angular
        .module('home', ['home.ctrl'])
        .config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/', {
                controller: 'home.ctrl',
                templateUrl: 'app/home/home.tpl.html',
                resolve: {
                    offers: ['offersService', function (offersService) {
                        return offersService.fetch();
                    }],
                    events: ['eventsService', function (eventsService) {
                        return eventsService.fetch();
                    }],
                    account: ['accountService', function (accountService) {
                        return accountService.fetch();
                    }]
                }
            });

        }]);

});