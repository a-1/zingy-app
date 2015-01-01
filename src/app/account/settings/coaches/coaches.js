'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.settings.coaches', [])
        .config(['$routeProvider', function ($routeProvider) {

            //coach
            $routeProvider.when('/account/coaches', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['Coach', function (Coach) {
                        return {
                            entity: new Coach(),
                            entityType: 'Coach',
                            operation: 'save',
                            formTemplate: 'app/account/settings/coaches/account.settings.coaches.tpl.html'
                        };
                    }],
                    account: ['accountService', function (accountService) {
                        return accountService.fetch();
                    }]
                }
            }).when('/account/coaches/:id', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['$q', '$route', 'Coach', function ($q, $route, Coach) {
                        var dfd = $q.defer();

                        Coach.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: 'Coach',
                                operation: 'update',
                                formTemplate: 'app/account/settings/coaches/account.settings.coaches.tpl.html'
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