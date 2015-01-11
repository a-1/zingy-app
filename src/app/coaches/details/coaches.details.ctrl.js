'use strict';

define(['angular'], function (angular) {

    return angular
        .module('coaches.details.ctrl', [])
        .controller('coaches.details.ctrl', function ($scope) {
            $scope.title = '';
        });

});