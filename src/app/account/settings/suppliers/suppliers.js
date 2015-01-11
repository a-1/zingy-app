'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.settings.suppliers', [])
        .config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/account/suppliers', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['Supplier', function (Supplier) {
                        return {
                            entity: new Supplier(),
                            entityType: 'Supplier',
                            operation: 'save',
                            formTemplate: 'app/account/settings/suppliers/account.settings.suppliers.tpl.html'
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
            }).when('/account/suppliers/:id', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['$q', '$route', 'Supplier', function ($q, $route, Supplier) {
                        var dfd = $q.defer();

                        Supplier.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: 'Supplier',
                                operation: 'update',
                                formTemplate: 'app/account/settings/suppliers/account.settings.suppliers.tpl.html'
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