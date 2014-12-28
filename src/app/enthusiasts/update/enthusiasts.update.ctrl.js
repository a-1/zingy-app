'use strict';

define(['angular'], function (angular) {

    return angular
        .module('enthusiasts.update.ctrl', [])
        .controller('enthusiasts.update.ctrl', function ($scope) {
            $scope.title = 'Zingy is now JustKhelo';
        });

});