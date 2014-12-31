'use strict';

define(['angular'], function (angular) {

    return angular
        .module('accountService', [])
        .service('accountService', ['$rootScope', '$http', '$auth', function ($rootScope, $http, $auth) {
            return {
                fetch: function () {
                    if ($auth.isAuthenticated()) {
                        return $http.get('http://localhost:3000/api/account').then(function (data) {
                            $rootScope.account = data.data;
                            return data;
                        });
                    }
                    return null;
                }
            };
        }]);

});


