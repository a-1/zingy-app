'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.signup.ctrl', [])
        .controller('account.signup.ctrl', ['$scope', '$auth', function ($scope, $auth) {

            $scope.authenticate = function (provider) {
                $auth.authenticate(provider);
            };

        }]);


});