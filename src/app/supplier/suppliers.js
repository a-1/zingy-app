'use strict';

define([
    'angular',
    './supplier',
    './suppliers.ctrl',
    './new/suppliers.new.ctrl',
    './update/suppliers.update.ctrl'
], function (angular) {

    return angular
        .module('suppliers', ['Supplier', 'suppliers.ctrl', 'suppliers.new.ctrl', 'suppliers.update.ctrl'])
        .config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/suppliers/new', {
                controller: 'suppliers.new.ctrl',
                templateUrl: 'app/supplier/new/suppliers.new.tpl.html'
            }).when('/suppliers/:id/update', {
                controller: 'suppliers.update.ctrl',
                templateUrl: 'app/supplier/update/suppliers.update.tpl.html',
                resolve: {
                    supplier: ['Supplier', '$routeParams', function (Supplier, $routeParams) {
                        return Supplier.get({id: $routeParams.id});
                    }]
                }
            });
        }]);

});