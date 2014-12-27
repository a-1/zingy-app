'use strict';

define(['angular'], function (angular) {

    return angular
        .module('accountService', [])
        .service('accountService', ['$http', function ($http) {

            return {
                getProfile: function () {
                    return $http.get('http://localhost:3000/api/me');
                },
                updateProfile: function (profileData) {
                    return $http.put('http://localhost:3000/api/me', profileData);
                }
            };

        }]);

});


