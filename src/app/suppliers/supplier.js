'use strict';

define(['angular'], function (angular) {

    return angular
        .module('supplier', [])
        .factory('Supplier', ['$resource', 'config', function ($resource, config) {
            return $resource(config.apiBaseURL + '/suppliers/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {method: 'GET', isArray: false}
                });
        }]);


});


