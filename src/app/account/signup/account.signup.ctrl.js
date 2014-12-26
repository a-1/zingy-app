'use strict';

define(['angular', 'ramda'], function (angular, R) {

    return angular
        .module('account.signup.ctrl', [])
        .controller('account.signup.ctrl', ['$scope', function ($scope) {
            $scope.multiply = R.multiply(2);
            $scope.title = 'Signup';
        }]);

});