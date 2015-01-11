'use strict';

define(['angular',
    './accountService',
    './authentication/account.authentication',
    './settings/account.settings'
], function (angular) {

    return angular
        .module('account', [
            'accountService',
            'account.authentication',
            'account.settings'
        ]);

});