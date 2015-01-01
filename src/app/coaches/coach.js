'use strict';

define(['angular'], function (angular) {

    return angular
        .module('coach', [])
        .factory('Coach', ['$resource', 'config', function ($resource, config) {
            return $resource(config.apiBaseURL + '/coaches/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {method: 'GET', isArray: false}
                });
        }]);


});


