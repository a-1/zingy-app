'use strict';

define(['angular'], function (angular) {

    return angular
        .module('accountService', [])
        .service('accountService', ['$rootScope', '$http', '$q', '$auth', 'config', function ($rootScope, $http, $q, $auth, config) {
            var account = {
                user: {},
                quickSettings: {}
            };

            var prepareUrl = function (entity, url) {
                return account.user[entity] && account.user[entity]._id ? url + '/' + account.user[entity]._id : url;
            };

            var updateAccountSettings = function () {
                angular.extend(account.quickSettings, {
                    enthusiasts: {
                        url: prepareUrl('enthusiast', '/account/enthusiasts'),
                        title: account.user.enthusiast && account.user.enthusiast._id ? 'Personal Details' : 'Enlist as Enthusiast'
                    },
                    coaches: {
                        url: prepareUrl('coach', '/account/coaches'),
                        title: account.user.coach && account.user.coach._id ? 'Coaching Details' : 'Enlist as Coach'
                    },
                    players: {
                        url: prepareUrl('player', '/account/players'),
                        title: account.user.player && account.user.player._id ? 'Player Details' : 'Enlist as Player'
                    },
                    facilities: {
                        url: 'account/facilities',
                        title: 'Add Facility'
                    },
                    suppliers: {
                        url: 'account/suppliers',
                        title: 'Add Supplier'
                    },
                    events: {
                        url: 'account/events',
                        title: 'Add an Event'
                    },
                    offers: {
                        url: 'account/offers',
                        title: 'Float an Offer'
                    }
                });
            };

            return {
                account: account,

                fetch: function () {
                    if ($auth.isAuthenticated() && !this.account.user._id) {
                        $http.get(config.apiBaseURL + '/account').then(function (data) {
                            angular.extend(account.user, data.data);
                            updateAccountSettings();
                            return data.data;
                        }, function () {
                            return null;
                        });
                    } else {
                        return null;
                    }
                },

                isAuthenticated: function () {
                    return $auth.isAuthenticated();
                },

                logout: function () {
                    $auth.logout();
                },

                authenticate: function (provider) {
                    $auth.authenticate(provider);
                },

                reset: function () {
                    this.account.user = {};
                    this.account.quickSettings = {};
                }

            };

        }]);

});



