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
                if ($window.confirm('Are you sure you want to remove ' + $scope.entityType + ' listing ?')) {
                    $scope.entity.$delete({id: id}).then(function () {
                        accountService.reset();
                        $window.alert('Your listing for ' + $scope.entityType + ' got successfully removed');
                        $location.path('/account/manage');
                    });
                }
            };

            $scope.listingMessage = $sce.trustAsHtml('<p>You have indicated your interest in listing your services as a "' + $scope.entityType + '" with us. ' +
            'Please fill in the form create your listing. Your listing information will be verified after submmision.</p>' +
            '<p>After approval, your listing will appear under "' + $scope.entityType + '" category on Zingy for free and will ' +
            'also appear on any relevant searches on Zingy.</p>');


            //tabs
            if ($scope.entityType === 'Player' || $scope.entityType === 'Coach') {
                $scope.entity.sports = $scope.entity.sports && $scope.entity.sports.length ? $scope.entity.sports : [{}];
                $scope.entity.sports[0].active = true;
            }


            $scope.addTab = function (form, catagory) {
                if (!form.$valid) {
                    $scope.entity[catagory][0].active = true;
                    $window.alert('Please validate all fields in other tabs first');
                } else {
                    $scope.entity[catagory][0].active = true;
                    $scope.entity[catagory].push({active: true});
                }
            };

            $scope.removeTab = function (index, catagory) {
                if (index > -1) {
                    $scope.entity[catagory].splice(index, 1);
                }
                $scope.entity[catagory] = $scope.entity[catagory] && $scope.entity[catagory].length ? $scope.entity[catagory] : [{active: true}];
            };

            //datepicker options
            $scope.datePickerOptions = {
                showWeeks: false,
                formatYear: 'yy',
                startingDay: 1,
                showButtonBar: false
            };
            $scope.openDateTimePicker = function ($event, dateType) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope[dateType] = true;
            };
            $scope.dateTimePickerChanged = function (dateType) {
                $scope[dateType] = false;
            };

            $scope.genders = accountService.genders;

            $scope.states = accountService.states;

            $scope.cities = accountService.cities;

            $scope.playingFrequencies = accountService.playingFrequencies;

            $scope.experienceYears = accountService.experienceYears;

            $scope.adultAges = accountService.adultAges;

            $scope.kidsAges = accountService.kidsAges;

            $scope.sports = accountService.sports;

        }]);

});
