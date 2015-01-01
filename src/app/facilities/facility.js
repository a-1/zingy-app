'use strict';

define(['angular'], function (angular) {

    return angular
        .module('facility', [])
        .factory('Facility', ['$resource', 'config', function ($resource, config) {
            return $resource(config.apiBaseURL + '/facilities/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {method: 'GET', isArray: false}
                });
        }]);


});


