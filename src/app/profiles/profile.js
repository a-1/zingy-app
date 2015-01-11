'use strict';

define(['angular'], function (angular) {

    return angular
        .module('profile', [])
        .factory('Profile', ['$resource', 'config', function ($resource, config) {
            return $resource(config.apiBaseURL + '/profiles/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {method: 'GET', isArray: false}
                });
        }]);


});


