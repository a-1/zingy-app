'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.settings.offers', [])
        .config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/account/offers', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['Offer', function (Offer) {
                        return {
                            entity: new Offer(),
                            entityType: 'Offer',
                            operation: 'save',
                            formTemplate: 'app/account/settings/offers/account.settings.offers.tpl.html'
                        };
                    }],
                    account: ['accountService', function (accountService) {
                        return accountService.fetch();
                    }]
                }
            }).when('/account/offers/:id', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['$q', '$route', 'Offer', function ($q, $route, Offer) {
                        var dfd = $q.defer();

                        Offer.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: 'Offer',
                                operation: 'update',
                                formTemplate: 'app/account/settings/offers/account.settings.offers.tpl.html'
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