'use strict';

define(['angular', 'ramda'], function (angular, R) {

    return angular
        .module('home.ctrl', [])

        .controller('home.ctrl', ['$scope','$window', 'Offer','fileUploadService', 'accountService', 'Event',
            function ($scope, $window, Offer,fileUploadService, accountService, Event) {

            var detectGroupSize = function () {
                var groupSize = 1;

                var group = R.map.idx(function (item, idx, list) {
                    return idx % groupSize === 0 ? list.slice(idx, idx + groupSize) : null;
                });
                var filter = R.filter(function (item) {
                    return item ? item : undefined;
                });
                var groupBy = R.pipe(group, filter);

                if ($scope.isMobileVerticle) {
                    groupSize = 1;
                }
                if ($scope.isMobileHorizontal) {
                    groupSize = 1;
                }
                if ($scope.isTablet) {
                    groupSize = 3;
                }
                if ($scope.isSmallDesktop) {
                    groupSize = 4;
                }
                if ($scope.isLargeDesktop) {
                    groupSize = 2;
                }

                $scope.eventsSlides = groupBy($scope.events);
                $scope.offersSlides = groupBy($scope.offers);
            };
            $scope.getImages = function(data1,formName){
                fileUploadService.getData(formName+'/'+data1._id).then(function(data){
                    data1.imgUrl = data.data;
                        return data1;
                });
            };
            $scope.offers = [];
            $scope.events = [];

            $scope.location = angular.lowercase(accountService.account.location);

            Offer.query(function (data) {
                    $scope.offers = data;
                    detectGroupSize();

            });
            Event.query(function (data) {
                $scope.events = data;
                detectGroupSize();
            });

            $window.addEventListener('resize', detectGroupSize, false);

        }]);
});