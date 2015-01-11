'use strict';

define(['angular'], function (angular) {

    return angular
        .module('offer', [])
        .factory('Offer', ['$resource', 'appConfig', function ($resource, appConfig) {
            return $resource(appConfig.apiBaseURL + '/offers/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {method: 'GET', isArray: false}
                });
        }]);


});


