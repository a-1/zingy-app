'use strict';

define(['angular'], function (angular) {

    return angular
        .module('account.settings.manage', [])
        .config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/account/manage', {
                controller: 'account.settings.ctrl',
                templateUrl: 'app/account/settings/account.settings.tpl.html',
                resolve: {
                    settings: ['Enthusiast', function (Enthusiast) {
                        return {
                            entity: new Enthusiast(),
                            entityType: 'Settings',
                            formTemplate: 'app/account/settings/manage/account.settings.manage.tpl.html'
                        };
                    }],
                    account: ['accountService', function (accountService) {
                        return accountService.fetch();
                    }]
                }
            });

        }]);

});