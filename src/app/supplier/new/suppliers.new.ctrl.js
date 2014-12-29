'use strict';

define(['angular'], function (angular) {

    return angular
        .module('suppliers.new.ctrl', [])
        .controller('suppliers.new.ctrl', ['$scope', '$location', 'Supplier', function ($scope, $location, Supplier) {

            $scope.supplier = new Supplier();


            $scope.saveSupplierDetails = function () {
                $scope.supplier.$save(function () {
                    $location.path('/suppliers');
                });
            };

        }]);

});