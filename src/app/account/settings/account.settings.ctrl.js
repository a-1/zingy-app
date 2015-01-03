'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.settings.ctrl', [])
        .controller('account.settings.ctrl', ['$scope', '$location', '$window', '$sce', 'accountService', 'settings', function ($scope, $location, $window, $sce, accountService, settings) {
            $scope.entity = settings.entity;
            $scope.entityType = settings.entityType;
            $scope.formTemplate = settings.formTemplate;

            //account
            $scope.user = accountService.account.user;
            $scope.quickSettings = accountService.account.quickSettings;

            var success = function () {
                accountService.reset();
                $window.alert('Your listing for ' + $scope.entityType + ' saved successfully');
                $location.path('/account/manage');
            };

            var error = function (data) {
                angular.forEach(data && data.data.errors, function (error) {
                    var field = $scope.form[error.path];
                    if (field) {
                        field.$setValidity('server', false);
                        field.$error.serverMessage = error.message;
                    }
                });
            };
            $scope.uploadFileAws = function(data){
                $scope.entity.imgUrl = data.dataURL;
            };
            $scope.submit = function (form) {
                if (form.$valid) {
                    if (settings.operation === 'save') {
                        $scope.entity.$save().then(success, error);
                    } else {
                        $scope.entity.$update({id: $scope.entity._id}).then(success, error);
                    }
                }
            };

            $scope.remove = function (id) {
                if ($window.confirm('Are you sure you want to remove this ' + $scope.entityType + ' listing ?')) {
                    $scope.entity.$delete({id: id}).then(success, error);
                }
            };

            $scope.listingMessage = $sce.trustAsHtml('<p>You have indicated your interest in listing your services as a "' + $scope.entityType + '" with us. ' +
            'Please fill in the form create your listing. Your listing information will be verified after submmision.</p>' +
            '<p>After approval, your listing will appear under "' + $scope.entityType + '" category on Zingy for free and will ' +
            'also appear on any relevant searches on Zingy.</p>');


            //datepicker options
            $scope.datePickerOptions = {
                showWeeks: false,
                formatYear: 'yy',
                startingDay: 1,
                showButtonBar: false
            };
            $scope.openDatePicker = function ($event, dateType) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope[dateType] = true;
            };
            $scope.datePickerDateChanged = function (dateType) {
                $scope[dateType] = false;
            };


            //TODO move to service  - states list
            $scope.states = [
                {name: 'Maharashtra', value: 'maharashtra'},
                {name: 'Karnatak', value: 'karnatak'}
            ];


            //TODO move to service  - cities list
            $scope.cities = [
                {name: 'Pune', value: 'pune'},
                {name: 'Mumbai', value: 'mumbai'},
                {name: 'Banglore', value: 'banglore'}
            ];


        }]);

});
