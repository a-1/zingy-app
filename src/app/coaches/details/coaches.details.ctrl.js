'use strict';

define(['angular'], function (angular) {

    return angular
        .module('coaches.details.ctrl', [])
        .controller('coaches.details.ctrl', ['$scope','fileUploadService', 'coach',  function ($scope, fileUploadService, coach ) {
            $scope.profileDetails = coach.profile;
            $scope.sports = coach.sports;


            $scope.getImageFromS3 = function(){
                fileUploadService.getData('profileForm'+'/'+coach.profile._id).then(function(data){
                   $scope.profileImage = data.data;
                });
               // createMap('coachAdressMap', data.loc.coordinates);
            };

           /* var createMap = function (documentId, coordinates) {
                var googleMaps = googleMapsService.googleMaps();
                var canvas = $window.document.getElementById(documentId);
                if (canvas) {
                    googleMaps.display(canvas,coordinates);
                }
            };*/

        }]
    );
});