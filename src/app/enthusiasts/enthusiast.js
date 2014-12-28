'use strict';

define(['angular'], function (angular) {

    return angular
        .module('Enthusiast', [])
        .factory('Enthusiast', ['$resource', function ($resource) {
            return $resource('http://localhost:3000/api/enthusiasts/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {isArray: true}
                });
        }]);


});


