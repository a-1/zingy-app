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
        }])
        .run(['$rootScope', '$auth', 'accountService', function ($rootScope, $auth, accountService) {

            $rootScope.$on('$locationChangeStart', function () {
                if ($auth.isAuthenticated() && !$rootScope.user) {
                    accountService.getProfile().then(function (data) {
                        $rootScope.user = data.data;
                    });
                }
            });

            $rootScope.isAuthenticated = $auth.isAuthenticated;

            $rootScope.logout = function () {
                $rootScope.user = null;
                return $auth.logout();
            };

        }]);

});


