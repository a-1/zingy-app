'use strict';

define(['angular'], function (angular) {

    return angular
        .module('player', [])
        .factory('Player', ['$resource', 'config', function ($resource, config) {
            return $resource(config.apiBaseURL + '/players/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {method: 'GET', isArray: false}
                });
        }]);


});


