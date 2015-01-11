'use strict';

define(['angular'], function (angular) {

    return angular
        .module('facility', [])
        .factory('Facility', ['$resource', 'appConfig', function ($resource, appConfig) {
            return $resource(appConfig.apiBaseURL + '/facilities/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {method: 'GET', isArray: false}
                });
        }]);


});


