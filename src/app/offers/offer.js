'use strict';

define(['angular'], function (angular) {

    return angular
        .module('offer', [])
        .factory('Offer', ['$resource', 'config', function ($resource, config) {
            return $resource(config.apiBaseURL + '/offers/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {method: 'GET', isArray: false}
                });
        }]);


});


