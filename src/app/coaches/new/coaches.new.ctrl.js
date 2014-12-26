'use strict';

define(['angular','./coachesService'], function (angular) {

    return angular
        .module('coaches.new.ctrl',['coachesService'])
        .controller('coaches.new.ctrl',['$scope','coachesService', function ($scope,coachesService) {
            $scope.title = 'Zingy is now JustKhelo';
            $scope.personalDetails = coachesService.getPersonalDetails();
            $scope.submitDetails = function(personalDetails){
                coachesService.insertPersonalDetails(personalDetails);
            };
            $scope.updateDetails = function(personalDetails){
                coachesService.editPersonalDetails(personalDetails);
            };
        }]);
});