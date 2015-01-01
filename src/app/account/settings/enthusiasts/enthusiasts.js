'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.settings.enthusiasts', [])
        .config(['$routeProvider', function ($routeProvider) {

            //enthusiasts
            $routeProvider.when('/account/enthusiasts', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['Enthusiast', function (Enthusiast) {
                        return {
                            entity: new Enthusiast(),
                            entityType: 'Sport Enthusiast',
                            operation: 'save',
                            formTemplate: 'app/account/settings/enthusiasts/account.settings.enthusiasts.tpl.html'
                        };
                    }],
                    account: ['accountService', function (accountService) {
                        return accountService.fetch();
                    }]
                }
            }).when('/account/enthusiasts/:id', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['$q', '$route', 'Enthusiast', function ($q, $route, Enthusiast) {
                        var dfd = $q.defer();

                        Enthusiast.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: 'Sport Enthusiast',
                                operation: 'update',
                                formTemplate: 'app/account/settings/enthusiasts/account.settings.enthusiasts.tpl.html'
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