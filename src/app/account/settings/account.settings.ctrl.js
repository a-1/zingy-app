'use strict';

define(['angular', 'ramda'], function (angular, R) {

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

            $scope.submit = function (form) {
                $scope.form = form;
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
                    $scope.entity.$delete({id: id});
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
                    $window.alert('Please validate all fields in other tabs first');
                    $scope.entity[catagory][0].active = true;
                } else {
                    $scope.entity[catagory].push({active: true});
                }
            };

            $scope.removeTab = function (index, catagory) {
                if (index > 0) {
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

            //TODO move to service  - genders list
            $scope.genders = [
                'Male',
                'Female'
            ];

            //TODO move to service  - states list
            $scope.states = [
                'Maharashtra',
                'Karnatak'
            ];


            //TODO move to service  - cities list
            $scope.cities = [
                'Pune',
                'Mumbai',
                'Banglore'
            ];

            //TODO move to  service - frequencies list
            $scope.playingFrequencies = [
                'Everyday',
                'Weekends',
                'Weekday'
            ];

            //TODO move to  service - years of experience list
            $scope.experienceYears = R.range(1, 51);

            //TODO move to  service - years of menAges list
            $scope.adultAges = R.range(11, 101);

            //TODO move to  service - years of menAges list
            $scope.kidsAges = R.range(1, 11);

            //TODO move to service  - sports list
            $scope.sports = [
                '​Aerobics​​',
                '​Australian football​​',
                '​Backcountry skiing​​',
                '​Badminton​​',
                '​Baseball​​',
                '​Basketball​​',
                '​Beach volleyball​​',
                '​Biathlon​​',
                '​Biking​​',
                '​Boxing​​',
                '​Calisthenics​​',
                '​Circuit training​​',
                '​Cricket​​',
                '​Cross skating​​',
                '​Cross-country skiing​​',
                '​Curling​​',
                '​Dancing​​',
                '​Diving​​',
                '​Downhill skiing​​',
                '​Elliptical​​',
                '​Ergometer​​',
                '​Fencing​​',
                '​Fitness walking​​',
                '​Football​​',
                '​Frisbee​​',
                '​Gardening​​',
                '​Golf​​',
                '​Gymnastics​​',
                '​Handball​​',
                '​Handcycling​​',
                '​Hiking​​',
                '​Hockey​​',
                '​Horseback riding​​',
                '​Ice skating​​',
                '​Indoor skating​​',
                '​Indoor volleyball​​',
                '​Inline skating​​',
                '​Jogging​​',
                '​Jumping rope​​',
                '​Kayaking​​',
                '​Kettlebell​​',
                '​Kickboxing​​',
                '​Kite skiing​​',
                '​Kitesurfing​​',
                '​Martial arts​​',
                '​Mixed martial arts​​',
                '​Mountain biking​​',
                '​Nordic walking​​',
                '​Open water swimming​​',
                '​Other​​',
                '​P90x​​',
                '​Paddle boarding​​',
                '​Paragliding​​',
                '​Pilates​​',
                '​Polo​​',
                '​Pool Swimming​​',
                '​Racquetball​​',
                '​Road biking​​',
                '​Rock climbing​​',
                '​Roller skiing​​',
                '​Rowing​​',
                '​Rowing machine​​',
                '​Rugby​​',
                '​Running​​',
                '​Sand running​​',
                '​Scuba diving​​',
                '​Skateboarding​​',
                '​Skating​​',
                '​Skiing​​',
                '​Sledding​​',
                '​Snowboarding​​',
                '​Snowshoeing​​',
                '​Soccer​​',
                '​Spinning​​',
                '​Squash​​',
                '​Stair climbing​​',
                '​Stair climbing machine​​',
                '​Stationary biking​​',
                '​Strength training​​',
                '​Surfing​​',
                '​Swimming​​',
                '​Table tennis​​',
                '​Tennis​​',
                '​Treadmill running​​',
                '​Treadmill walking​​',
                '​Utility biking​​',
                '​Volleyball​​',
                '​Walking​​',
                '​Wakeboarding​​',
                '​Water polo​​',
                '​Weight lifting​​',
                '​Wheelchair​​',
                '​Windsurfing​​',
                '​Yoga​​',
                '​Zumba'
            ];

        }]);

});
