'use strict';

define(['angular'], function (angular) {

    return angular
        .module('search.ctrl', [])
        .controller('search.ctrl', ['$scope', 'accountService', '$http', 'appConfig', function ($scope, accountService, $http, appConfig) {

            //search - location settings
            $scope.cities = accountService.cities;
            $scope.searchCity = accountService.account.location;
            $scope.searchWithin = 'city';
            $scope.searchRadius = 10;
            $scope.searchLocation = 'gps';
            $scope.updateLocation = function () {
                accountService.changeLocation($scope.searchCity);
                $scope.refineSearch();
            };

            //search - categories settings
            $scope.searchCategoryAll = true;
            $scope.searchCategoryPlayers = true;
            $scope.searchCategoryCoaches = true;
            $scope.searchCategoryFacilities = true;
            $scope.searchCategorySuppliers = true;
            $scope.searchCategoryEvents = true;
            $scope.searchCategoryOffers = true;


            //search - content
            $scope.search = {};
            $scope.refineSearch = function () {
                $http.get(appConfig.apiBaseURL + '/search', {params: {city: $scope.searchCity}}).then(function (data) {
                    $scope.results = data.data;
                });
            };

            //user
            $scope.user = accountService.account.user;

            //call refine search to fetch results
            $scope.refineSearch();

        }]);

});