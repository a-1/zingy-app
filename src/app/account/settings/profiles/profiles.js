'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.settings.profiles', [])
        .config(['$routeProvider', function ($routeProvider) {

            //profile will always be created when register - only need to update
            $routeProvider.when('/account/profiles/:id', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['$q', '$route', 'Profile', function ($q, $route, Profile) {
                        var dfd = $q.defer();

                        Profile.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: 'Profile',
                                operation: 'update',
                                formTemplate: 'app/account/settings/profiles/account.settings.profiles.tpl.html'
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