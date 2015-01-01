'use strict';

define(['angular', './event', './eventsService'], function (angular) {

    return angular
        .module('events', ['event', 'eventsService']);

});