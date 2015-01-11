'use strict';

define(['angular'], function (angular) {

    return angular
        .module('profile', [])
        .factory('Profile', ['$resource', 'appConfig', function ($resource, appConfig) {
            return $resource(appConfig.apiBaseURL + '/profiles/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {method: 'GET', isArray: false}
                });
        }]);


});


