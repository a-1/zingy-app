'use strict';

define(['angular', 'ramda'], function (angular, R) {

    return angular
        .module('account.login.ctrl', [])
        .controller('account.login.ctrl', ['$scope', function ($scope) {
            $scope.multiply = R.multiply(2);
            $scope.title = 'Login';
        }]);

});