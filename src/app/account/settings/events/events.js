'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.settings.events', [])
        .config(['$routeProvider', function ($routeProvider) {

            var getRouteConfig = function (settings) {
                var routeConfig = {
                    controller: 'account.settings.ctrl',
                    templateUrl: 'app/account/settings/account.settings.tpl.html',
                    resolve: {
                        account: ['accountService', function (accountService) {
                            return accountService.fetch();
                        }],
                        googleMaps: ['googleMapsService', function (googleMapsService) {
                            googleMapsService.init().then(function (googleMaps) {
                                return googleMaps;
                            });
                        }]
                    }
                };
                routeConfig.resolve.settings = settings;
                return routeConfig;
            };


            $routeProvider.when('/account/events', getRouteConfig(['Event', function (Event) {
                return {
                    entity: new Event(),
                    entityType: 'Event',
                    operation: 'save',
                    formTemplate: 'app/account/settings/events/account.settings.events.tpl.html'
                };
            }])).when('/account/events/:id', getRouteConfig(['$q', '$route', 'Event', function ($q, $route, Event) {
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
            }]));


        }]);

});