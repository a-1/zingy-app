'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.login.ctrl', [])
        .controller('account.login.ctrl', ['$scope', '$auth', function ($scope, $auth) {

            $scope.authenticate = function (provider) {
                $auth.authenticate(provider).then(function (successResponse) {
                    console.log('success');
                    console.log(successResponse);
                }, function (errorResponse) {
                    console.log('error');
                    console.log(errorResponse);
                });
            };

        }]);

});