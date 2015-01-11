'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.settings.facilities', [])
        .config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/account/facilities', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['Facility', function (Facility) {
                        return {
                            entity: new Facility(),
                            entityType: 'Facility',
                            operation: 'save',
                            formTemplate: 'app/account/settings/facilities/account.settings.facilities.tpl.html'
                        };
                    }],
                    account: ['accountService', function (accountService) {
                        return accountService.fetch();
                    }],
                    googleMaps: ['googleMapsService', function (googleMapsService) {
                        googleMapsService.init().then(function (googleMaps) {
                            return googleMaps;
                        });
                    }]
                }
            }).when('/account/facilities/:id', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['$q', '$route', 'Facility', function ($q, $route, Facility) {
                        var dfd = $q.defer();

                        Facility.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: 'Facility',
                                operation: 'update',
                                formTemplate: 'app/account/settings/facilities/account.settings.facilities.tpl.html'
                            });
                        }, function () {
                            dfd.reject(null);
                        });

                        return dfd.promise;
                    }],
                    account: ['accountService', function (accountService) {
                        return accountService.fetch();
                    }],
                    googleMaps: ['googleMapsService', function (googleMapsService) {
                        googleMapsService.init().then(function (googleMaps) {
                            return googleMaps;
                        });
                    }]
                }
            });


        }]);

});