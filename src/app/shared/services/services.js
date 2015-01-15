'use strict';

define(function (require) {

    var angular = require('angular');

    var dependencies = [

        require('./googleMapsService').name,
        require('./fileUploadService').name

    ];

    return angular.module('services', dependencies);

});