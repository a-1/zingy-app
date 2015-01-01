'use strict';

define(['angular', './offer', './offersService'], function (angular) {

    return angular
        .module('offers', ['offer', 'offersService']);

});