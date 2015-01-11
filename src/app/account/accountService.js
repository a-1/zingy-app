'use strict';

define(['angular', 'ramda'], function (angular, R) {

    return angular
        .module('accountService', [])
        .service('accountService', ['$rootScope', '$http', '$q', '$auth', 'config', function ($rootScope, $http, $q, $auth, config) {
            var account = {
                user: {},
                quickSettings: {},
                location: 'Pune'
            };

            var prepareUrl = function (entity, url) {
                return account.user[entity] && account.user[entity]._id ? url + '/' + account.user[entity]._id : url;
            };

            var updateAccountSettings = function () {
                angular.extend(account.quickSettings, {
                    profiles: {
                        url: prepareUrl('profile', '/account/profiles'),
                        title: 'Update Profile'
                    },
                    enthusiasts: {
                        url: prepareUrl('enthusiast', '/account/enthusiasts'),
                        title: account.user.enthusiast && account.user.enthusiast._id ? 'Subscription Details' : 'Enlist as Enthusiast'
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

                getRegisteredEntitiesCount: function () {
                    return $http.get(config.apiBaseURL + '/registeredEntitiesCount');
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
                },

                changeLocation: function (city) {
                    account.location = city;
                },

                //genders list
                genders: [
                    'Male',
                    'Female'
                ],

                //tates list
                states: [
                    'Maharashtra',
                    'Karnatak'
                ],

                //cities list
                cities: [
                    'Pune',
                    'Mumbai',
                    'Banglore'
                ],

                //frequencies list
                playingFrequencies: [
                    'Everyday',
                    'Weekends',
                    'Weekday'
                ],

                //years of experience list
                experienceYears: R.range(1, 51),

                //years of adultAges list
                adultAges: R.range(11, 101),

                //years of kidsAges list
                kidsAges: R.range(1, 11),

                //sports list
                sports: [
                    '​Aerobics​​',
                    '​Australian football​​',
                    '​Backcountry skiing​​',
                    '​Badminton​​',
                    '​Baseball​​',
                    '​Basketball​​',
                    '​Beach volleyball​​',
                    '​Biathlon​​',
                    '​Biking​​',
                    '​Boxing​​',
                    '​Calisthenics​​',
                    '​Circuit training​​',
                    '​Cricket​​',
                    '​Cross skating​​',
                    '​Cross-country skiing​​',
                    '​Curling​​',
                    '​Dancing​​',
                    '​Diving​​',
                    '​Downhill skiing​​',
                    '​Elliptical​​',
                    '​Ergometer​​',
                    '​Fencing​​',
                    '​Fitness walking​​',
                    '​Football​​',
                    '​Frisbee​​',
                    '​Gardening​​',
                    '​Golf​​',
                    '​Gymnastics​​',
                    '​Handball​​',
                    '​Handcycling​​',
                    '​Hiking​​',
                    '​Hockey​​',
                    '​Horseback riding​​',
                    '​Ice skating​​',
                    '​Indoor skating​​',
                    '​Indoor volleyball​​',
                    '​Inline skating​​',
                    '​Jogging​​',
                    '​Jumping rope​​',
                    '​Kayaking​​',
                    '​Kettlebell​​',
                    '​Kickboxing​​',
                    '​Kite skiing​​',
                    '​Kitesurfing​​',
                    '​Martial arts​​',
                    '​Mixed martial arts​​',
                    '​Mountain biking​​',
                    '​Nordic walking​​',
                    '​Open water swimming​​',
                    '​Other​​',
                    '​P90x​​',
                    '​Paddle boarding​​',
                    '​Paragliding​​',
                    '​Pilates​​',
                    '​Polo​​',
                    '​Pool Swimming​​',
                    '​Racquetball​​',
                    '​Road biking​​',
                    '​Rock climbing​​',
                    '​Roller skiing​​',
                    '​Rowing​​',
                    '​Rowing machine​​',
                    '​Rugby​​',
                    '​Running​​',
                    '​Sand running​​',
                    '​Scuba diving​​',
                    '​Skateboarding​​',
                    '​Skating​​',
                    '​Skiing​​',
                    '​Sledding​​',
                    '​Snowboarding​​',
                    '​Snowshoeing​​',
                    '​Soccer​​',
                    '​Spinning​​',
                    '​Squash​​',
                    '​Stair climbing​​',
                    '​Stair climbing machine​​',
                    '​Stationary biking​​',
                    '​Strength training​​',
                    '​Surfing​​',
                    '​Swimming​​',
                    '​Table tennis​​',
                    '​Tennis​​',
                    '​Treadmill running​​',
                    '​Treadmill walking​​',
                    '​Utility biking​​',
                    '​Volleyball​​',
                    '​Walking​​',
                    '​Wakeboarding​​',
                    '​Water polo​​',
                    '​Weight lifting​​',
                    '​Wheelchair​​',
                    '​Windsurfing​​',
                    '​Yoga​​',
                    '​Zumba'
                ],

                landSports: ['Rock climbing', 'Golf', 'Football', 'Cricket'],

                waterSports: ['Kayaking', 'Swimming', 'Scuba diving'],

                airSports: ['Aerobatics', 'Paragliding', 'Kitesurfing'],

                kidsSports: ['Soccer', 'Baseball', 'Skating', 'Tennis'],

                sportsGateways: ['Mountain biking', 'Dancing', 'Surfing']

            };

        }]);

});



