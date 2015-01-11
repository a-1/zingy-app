'use strict';

define(['angular'], function (angular) {

    return angular
        .module('enthusiast', [])
        .factory('Enthusiast', ['$resource', 'appConfig', function ($resource, appConfig) {
            return $resource(appConfig.apiBaseURL + '/enthusiasts/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {method: 'GET', isArray: false}
                });
        }]);


});


