'use strict';

define(['angular'], function (angular) {

    return angular
        .module('Enthusiast', [])
        .factory('Enthusiast', ['$resource', 'config', function ($resource, config) {
            return $resource(config.apiBaseURL + '/enthusiasts/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {method: 'GET', isArray: false}
                });
        }]);


});


