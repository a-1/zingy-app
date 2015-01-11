'use strict';

define(['angular',
    './account.settings.ctrl',
    './manage/manage',
    './profiles/profiles',
    './enthusiasts/enthusiasts',
    './players/players',
    './coaches/coaches',
    './facilities/facilities',
    './suppliers/suppliers',
    './events/events',
    './offers/offers'], function (angular) {

    return angular.module('account.settings', [
        'account.settings.ctrl',
        'account.settings.manage',
        'account.settings.profiles',
        'account.settings.enthusiasts',
        'account.settings.players',
        'account.settings.coaches',
        'account.settings.facilities',
        'account.settings.suppliers',
        'account.settings.events',
        'account.settings.offers'
    ]);

});