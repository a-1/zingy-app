'use strict';

define(['angular'], function (angular) {

    return angular
        .module('coaches.edit.ctrl', [])
        .controller('coaches.edit.ctrl', function ($scope) {
            $scope.title = 'Zingy is now JustKhelo';
        });

});