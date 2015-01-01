'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.settings.players', [])
        .config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/account/players', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['Player', function (Player) {
                        return {
                            entity: new Player(),
                            entityType: 'Player',
                            operation: 'save',
                            formTemplate: 'app/account/settings/players/account.settings.players.tpl.html'
                        };
                    }],
                    account: ['accountService', function (accountService) {
                        return accountService.fetch();
                    }]
                }
            }).when('/account/players/:id', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['$q', '$route', 'Player', function ($q, $route, Player) {
                        var dfd = $q.defer();

                        Player.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: 'Player',
                                operation: 'update',
                                formTemplate: 'app/account/settings/players/account.settings.players.tpl.html'
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