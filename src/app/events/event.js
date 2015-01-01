'use strict';

define(['angular'], function (angular) {

    return angular
        .module('event', [])
        .factory('Event', ['$resource', 'config', function ($resource, config) {
            return $resource(config.apiBaseURL + '/events/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {method: 'GET', isArray: false}
                });
        }]);


});


