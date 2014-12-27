'use strict';

define(['angular', 'ramda'], function (angular, R) {

    return angular
        .module('home.ctrl', [])

        .controller('home.ctrl', ['$scope', '$window', 'offers', 'events', function ($scope, $window, offers, events) {

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

                $scope.eventsSlides = groupBy(events);
                $scope.offersSlides = groupBy(offers);
            };

            $window.addEventListener('resize', detectGroupSize, false);

            detectGroupSize();

        }]);
});