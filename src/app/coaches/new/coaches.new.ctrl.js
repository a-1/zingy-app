'use strict';

define(['angular', '../coachesService','./uploadPictureService'], function (angular) {

    return angular
        .module('coaches.new.ctrl', ['coachesService','uploadPictureService'])
        .controller('coaches.new.ctrl', ['$scope', 'coachesService' , 'uploadPictureService', function ($scope, coachesService,uploadPictureService) {
            $scope.title = 'Zingy is now JustKhelo';
            $scope.personalDetails = coachesService.getPersonalDetails();
            $scope.submitDetails = function (personalDetails) {
                coachesService.insertPersonalDetails(personalDetails);
            };
            $scope.updateDetails = function (personalDetails) {
                coachesService.editPersonalDetails(personalDetails);
            };
            $scope.downloadFileAws = function () {
                uploadPictureService.getFileFromAws();
            };
            $scope.uploadFileAws = function (fileName) {
                uploadPictureService.addFileToAws(fileName);
            };
        }]);
});