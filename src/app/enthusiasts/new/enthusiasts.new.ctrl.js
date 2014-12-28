'use strict';

define(['angular'], function (angular) {

    return angular
        .module('enthusiasts.new.ctrl', [])
        .controller('enthusiasts.new.ctrl', ['$scope', '$location', 'Enthusiast', function ($scope, $location, Enthusiast) {

            $scope.enthusiast = new Enthusiast();


            $scope.saveEnthusiastDetails = function () {
                $scope.enthusiast.$save(function () {
                    $location.path('/enthusiasts');
                });
            };

        }]);

});