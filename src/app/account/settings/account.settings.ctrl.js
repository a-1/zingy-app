'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.settings.ctrl', [])
        .controller('account.settings.ctrl', ['$scope', '$location', '$window', '$sce', '$timeout', 'googleMapsService', 'fileUploadService','accountService', 'settings',
            function ($scope, $location, $window, $sce, $timeout, googleMapsService, fileUploadService, accountService, settings) {
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

                $scope.submit = function (form, image2) {
                    console.log(image2.file);
                    if (form.$valid) {
                        var uploadSuccess;
                        if(image2) {
                            uploadSuccess = function(data)  {
                                var fileData = fileUploadService.uploadImage(image2.file,form.$name+'/'+data._id);
                                success(fileData);
                            };
                        }else{
                            success();
                        }
                        if (settings.operation === 'save') {
                            $scope.entity.$save().then(uploadSuccess, error);
                        } else {
                            $scope.entity.$update({id: $scope.entity._id}).then(uploadSuccess, error);
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
                '<p>After approval, your listing will appear under "' + $scope.entityType + '" category on justKhelo for free and will ' +
                'also appear on any relevant searches on justKhelo.</p>');


                //tabs
                if ($scope.entityType === 'Player' || $scope.entityType === 'Coach' || $scope.entityType === 'Sport Enthusiast') {
                    $scope.entity.sports = $scope.entity.sports && $scope.entity.sports.length ? $scope.entity.sports : [{}];
                    $scope.entity.sports[0].active = true;
                }


                $scope.addTab = function (form, catagory) {
                    if (!form.$valid) {
                        $window.alert('Please validate all fields in other tabs first');
                    } else {
                        $scope.entity[catagory].push({active: true});
                    }
                };

                $scope.removeTab = function (index, catagory) {
                    if (index > -1) {
                        $scope.entity[catagory].splice(index, 1);
                    }
                    $scope.entity[catagory] = $scope.entity[catagory] && $scope.entity[catagory].length ? $scope.entity[catagory] : [{active: true}];
                };

                $scope.tabChanged = function (idx) {
                    $timeout(function () {
                        var documentId = 'addr-map-canvas';
                        if ($scope.entityType === 'Player' || $scope.entityType === 'Coach') {
                            documentId = documentId + idx;
                            createMap(documentId, idx, true);
                        }
                    }, 2000);
                };

                var createMap = function (documentId, idx, isSports) {
                    var googleMaps = googleMapsService.googleMaps();
                    var canvas = $window.document.getElementById(documentId);
                    if (canvas) {
                        googleMaps.create(canvas, $scope, idx, isSports);
                    }
                };

                //google maps
                if ($scope.entityType !== 'Sport Enthusiast' && $scope.entityType !== 'Settings') {
                    $timeout(function () {
                        var documentId = 'addr-map-canvas';
                        createMap(documentId);
                    }, 2000);
                }

                //image picker
                $scope.handleImageSelect = function (element, type) {
                    var file = element.files[0];
                    var reader = new FileReader();
                    $scope[type + 'CroppedImage'] = '';
                    reader.onload = function (evt) {
                        $scope.$apply(function ($scope) {
                            $scope[type + 'Image'] = evt.target.result;
                            $scope[type + 'ImageName'] = file.name;
                        });
                    };
                    reader.readAsDataURL(file);
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
