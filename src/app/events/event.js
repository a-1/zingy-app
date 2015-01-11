'use strict';

define(['angular'], function (angular) {

    return angular
        .module('event', [])
        .factory('Event', ['$resource', 'appConfig', function ($resource, appConfig) {
            return $resource(appConfig.apiBaseURL + '/events/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {method: 'GET', isArray: false}
                });
        }]);


});


