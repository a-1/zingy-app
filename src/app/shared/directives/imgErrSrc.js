'use strict';

define(['angular'], function (angular) {

    return angular.module('imgErrSrc', [])
        .directive('imgErrSrc', function () {
            return {
                link: function (scope, element, attrs) {
                    element.bind('error', function () {
                        if (attrs.src !== attrs.imgErrSrc) {
                            attrs.$set('src', attrs.imgErrSrc);
                        }
                    });
                }
            };
        });

});