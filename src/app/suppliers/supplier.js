'use strict';

define(['angular'], function (angular) {

    return angular
        .module('supplier', [])
        .factory('Supplier', ['$resource', 'appConfig', function ($resource, appConfig) {
            return $resource(appConfig.apiBaseURL + '/suppliers/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {method: 'GET', isArray: false}
                });
        }]);


});


