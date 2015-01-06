'use strict';

define(function (require) {

    var angular = require('angular');

    var dependencies = [

        require('./timepickerPopup/timepickerPopup').name,
        require('./imageUpload/imageUpload').name

    ];

    return angular.module('directives', dependencies);

});