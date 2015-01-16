'use strict';

define(function (require) {

    var angular = require('angular');

    var dependencies = [

        require('./timepickerPopup/timepickerPopup').name,
        require('./imageResize/imageResize').name,
        require('./imgErrSrc').name

    ];

    return angular.module('directives', dependencies);

});