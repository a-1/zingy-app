'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.settings.ctrl', [])
        .controller('account.settings.ctrl', ['$scope', '$location', '$sce', 'settings', function ($scope, $location, $sce, settings) {
            $scope.entity = settings.entity;
            $scope.entityType = settings.entityType;
            $scope.formTemplate = settings.formTemplate;

            var success = function () {
                $location.path('/account/settings');
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


            var prepareUrl = function (account, url) {
                return account && account.length ? url + '/' + account : url;
            };

            $scope.quickSettings = {
                enthusiast: {
                    url: prepareUrl($scope.account && $scope.account.enthusiast, '/account/enthusiasts'),
                    title: $scope.account && $scope.account.enthusiast && $scope.account.enthusiast.length ? 'Personal & Contact Details' : 'Enlist as Enthusiast'
                },
                coach: {
                    url: prepareUrl($scope.account && $scope.account.coach, '/account/coaches'),
                    title: $scope.account && $scope.account.coach && $scope.account.coach.length ? 'Coaching Details' : 'Enlist as Coach'
                },
                player: {
                    url: prepareUrl($scope.account && $scope.account.player, '/account/players'),
                    title: $scope.account && $scope.account.player && $scope.account.player.length ? 'Player Details' : 'Enlist as Player'
                }
            };

            $scope.listingMessage = $sce.trustAsHtml('<p>You have indicated your interest in listing your services as a' + $scope.entityType + 'with us. ' +
            'Please fill in the form create your listing. Your listing information will be verified after submmision.</p>' +
            '<p>After approval, your listing will appear under ' + $scope.entityType + ' category on Zingy for free and will ' +
            'also appear on any relevant searches on Zingy.</p>');


        }]);

});
