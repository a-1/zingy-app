'use strict';

define(['angular'], function (angular) {

    return angular
        .module('suppliers.ctrl', [])
        .controller('suppliers.ctrl', ['$scope', 'suppliers', function ($scope, suppliers) {
            $scope.suppliers = suppliers;
            $scope.resultsTemplate='app/supplier/suppliers.content.tpl.html';
        }]);

});