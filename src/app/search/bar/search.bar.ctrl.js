'use strict';

define(['angular'], function (angular) {

    return angular
        .module('search.bar.ctrl', [])
        .controller('search.bar.ctrl', ['$scope', '$location', 'accountService', function ($scope, $location, accountService) {

            var searchPlaceHolder = 'Search Players, Coach, Facilities, Suppliers...';

            $scope.searchCatagory = 'all';
            $scope.searchPlaceHolder = searchPlaceHolder;

            $scope.setSearchType = function (type) {
                $scope.searchQuery = '';
                $scope.searchCatagory = type;
                $scope.searchPlaceHolder = type === 'all' ? searchPlaceHolder : 'Search for ' + type;
            };

            $scope.submit = function () {
                var location = angular.lowercase(accountService.account.location);
                var path = $scope.searchCatagory === 'all' ? '/search/' + location : '/' + $scope.searchCatagory + '/' + location;
                $location.path(path);
            };

        }]);

});