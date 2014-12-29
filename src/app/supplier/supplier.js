'use strict';

define(['angular'], function (angular) {

    return angular
        .module('Supplier', [])
        .factory('Supplier', ['$resource', function ($resource) {
            return $resource('http://localhost:3000/api/suppliers/:id', {id: '@_id'},
                {
                    'update': {method: 'PUT'},
                    'get': {isArray: true}
                });
        }]);


});


