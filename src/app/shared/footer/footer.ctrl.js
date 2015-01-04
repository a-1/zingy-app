'use strict';

define(['angular'], function (angular) {

    return angular
        .module('footer.ctrl', [])
        .controller('footer.ctrl', [
            '$scope',
            'accountService', function ($scope, accountService) {

                $scope.landSports = accountService.landSports;
                $scope.waterSports = accountService.waterSports;
                $scope.airSports = accountService.airSports;
                $scope.kidsSports = accountService.kidsSports;
                $scope.sportsGateways = accountService.sportsGateways;

                accountService.getRegisteredEntitiesCount().then(function (data) {
                    $scope.registeredEntitiesCount = data.data;
                });

            }]);

});