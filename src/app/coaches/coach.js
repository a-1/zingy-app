'use strict';

define(['angular'], function (angular) {

    return angular
        .module('coach', [])
        .factory('Coach', ['$resource', 'appConfig', function ($resource, appConfig) {
            return $resource(appConfig.apiBaseURL + '/coaches/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {method: 'GET', isArray: false}
                });
        }]);


});


