'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.settings.events', [])
        .config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/account/events', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['Event', function (Event) {
                        return {
                            entity: new Event(),
                            entityType: 'Event',
                            operation: 'save',
                            formTemplate: 'app/account/settings/events/account.settings.events.tpl.html'
                        };
                    }],
                    account: ['accountService', function (accountService) {
                        return accountService.fetch();
                    }]
                }
            }).when('/account/events/:id', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['$q', '$route', 'Event', function ($q, $route, Event) {
                        var dfd = $q.defer();

                        Event.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: 'Event',
                                operation: 'update',
                                formTemplate: 'app/account/settings/events/account.settings.events.tpl.html'
                            });
                        }, function () {
                            dfd.reject(null);
                        });

                        return dfd.promise;
                    }],
                    account: ['accountService', function (accountService) {
                        return accountService.fetch();
                    }]
                }
            });


        }]);

});