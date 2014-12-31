'use strict';

define(['angular',
    './accountService',
    './login/account.login.ctrl',
    './signup/account.signup.ctrl',
    './settings/account.settings.ctrl',
    '../enthusiasts/enthusiast'
], function (angular) {

    return angular
        .module('account', [
            'accountService',
            'account.login.ctrl',
            'account.signup.ctrl',
            'account.settings.ctrl',
            'Enthusiast'
        ])
        .config(['$routeProvider', function ($routeProvider) {

            //routes
            $routeProvider.when('/account/login', {
                controller: 'account.login.ctrl',
                templateUrl: 'app/account/login/account.login.tpl.html'
            }).when('/account/signup', {
                controller: 'account.signup.ctrl',
                templateUrl: 'app/account/signup/account.signup.tpl.html'
            });

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
                            formTemplate: 'app/account/settings/form/account.settings.form.enthusiasts.tpl.html'
                        };
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
                                formTemplate: 'app/account/settings/form/account.settings.form.enthusiasts.tpl.html'
                            });
                        }, function () {
                            dfd.reject(null);
                        });

                        return dfd.promise;
                    }]
                }
            });


            //coach
            $routeProvider.when('/account/coaches', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['Enthusiast', function (Enthusiast) {
                        return {
                            entity: new Enthusiast(),
                            entityType: 'Coach',
                            operation: 'save',
                            formTemplate: 'app/account/settings/form/account.settings.form.enthusiasts.tpl.html'
                        };
                    }]
                }
            }).when('/account/coaches/:id', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['$q', '$route', 'Enthusiast', function ($q, $route, Enthusiast) {
                        var dfd = $q.defer();

                        Enthusiast.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: 'Coach',
                                operation: 'update',
                                formTemplate: 'app/account/settings/form/account.settings.form.enthusiasts.tpl.html'
                            });
                        }, function () {
                            dfd.reject(null);
                        });

                        return dfd.promise;
                    }]
                }
            });

            //player
            $routeProvider.when('/account/players', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['Enthusiast', function (Enthusiast) {
                        return {
                            entity: new Enthusiast(),
                            entityType: 'Player',
                            operation: 'save',
                            formTemplate: 'app/account/settings/form/account.settings.form.enthusiasts.tpl.html'
                        };
                    }]
                }
            }).when('/account/players/:id', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['$q', '$route', 'Enthusiast', function ($q, $route, Enthusiast) {
                        var dfd = $q.defer();

                        Enthusiast.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: 'Player',
                                operation: 'update',
                                formTemplate: 'app/account/settings/form/account.settings.form.enthusiasts.tpl.html'
                            });
                        }, function () {
                            dfd.reject(null);
                        });

                        return dfd.promise;
                    }]
                }
            });


        }]);

});