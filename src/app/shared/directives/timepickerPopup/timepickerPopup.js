'use strict';

define(['angular'], function (angular) {

    return angular.module('timepickerPopup', [])
        .constant('timepickerPopupConfig', {
            timeFormat: 'HH:mm:ss',
            appendToBody: false
        })
        .directive('timepickerPopup', ['$compile', '$parse', '$document', '$position', 'dateFilter', 'timepickerPopupConfig',
            function ($compile, $parse, $document, $position, dateFilter, timepickerPopupConfig) {
                return {
                    restrict: 'EA',
                    require: 'ngModel',
                    priority: 1,
                    link: function (originalScope, element, attrs, ngModel) {
                        var scope = originalScope.$new(), // create a child scope so we are not polluting original one
                            timeFormat,
                            appendToBody = angular.isDefined(attrs.TimepickerAppendToBody) ? originalScope.$eval(attrs.TimepickerAppendToBody) : timepickerPopupConfig.appendToBody;

                        attrs.$observe('timepickerPopup', function (value) {
                            timeFormat = value || timepickerPopupConfig.timeFormat;
                            ngModel.$render();
                        });

                        originalScope.$on('$destroy', function () {
                            $popup.remove();
                            scope.$destroy();
                        });

                        var getIsOpen, setIsOpen;
                        if (attrs.isOpen) {
                            getIsOpen = $parse(attrs.isOpen);
                            setIsOpen = getIsOpen.assign;

                            originalScope.$watch(getIsOpen, function updateOpen(value) {
                                scope.isOpen = !!value;
                            });
                        }
                        scope.isOpen = getIsOpen ? getIsOpen(originalScope) : false; // Initial state

                        function setOpen(value) {
                            if (setIsOpen) {
                                setIsOpen(originalScope, !!value);
                            } else {
                                scope.isOpen = !!value;
                            }
                        }

                        var documentClickBind = function (event) {
                            if (scope.isOpen && event.target !== element[0]) {
                                scope.$apply(function () {
                                    setOpen(false);
                                });
                            }
                        };

                        var elementFocusBind = function () {
                            scope.$apply(function () {
                                setOpen(true);
                            });
                        };

                        // popup element used to display calendar
                        var popupEl = angular.element('<div timepicker-popup-wrap><div timepicker></div></div>');
                        popupEl.attr({
                            'ng-model': 'date',
                            'ng-change': 'dateSelection()'
                        });
                        var TimepickerEl = angular.element(popupEl.children()[0]),
                            TimepickerOptions = {};
                        if (attrs.TimepickerOptions) {
                            TimepickerOptions = originalScope.$eval(attrs.TimepickerOptions);
                            TimepickerEl.attr(angular.extend({}, TimepickerOptions));
                        }

                        function parseTime(viewValue) {
                            if (!viewValue) {
                                ngModel.$setValidity('time', true);
                                return null;
                            } else if (angular.isDate(viewValue)) {
                                ngModel.$setValidity('time', true);
                                return viewValue;
                            } else if (angular.isString(viewValue)) {
                                var date = new Date('1970-01-01 ' + viewValue, 'YYYY-MM-DD ' + timeFormat);

                                if (!date.isValid()) {
                                    ngModel.$setValidity('time', false);
                                    return undefined;
                                } else {
                                    ngModel.$setValidity('time', true);
                                    return date.toDate();
                                }
                            } else {
                                ngModel.$setValidity('time', false);
                                return undefined;
                            }
                        }

                        ngModel.$parsers.unshift(parseTime);

                        // Inner change
                        scope.dateSelection = function (dt) {
                            if (angular.isDefined(dt)) {
                                scope.date = dt;
                            }
                            ngModel.$setViewValue(scope.date);
                            ngModel.$render();
                        };

                        element.bind('input change keyup', function () {
                            scope.$apply(function () {
                                scope.date = ngModel.$modelValue;
                            });
                        });

                        // Outter change
                        ngModel.$render = function () {
                            var date = ngModel.$viewValue ? dateFilter(ngModel.$viewValue, timeFormat) : '';
                            element.val(date);
                            scope.date = ngModel.$modelValue;
                        };

                        //function addWatchableAttribute(attribute, scopeProperty, TimepickerAttribute) {
                        //    if (attribute) {
                        //        originalScope.$watch($parse(attribute), function(value){
                        //            scope[scopeProperty] = value;
                        //        });
                        //        TimepickerEl.attr(TimepickerAttribute || scopeProperty, scopeProperty);
                        //    }
                        //}

                        if (attrs.showMeridian) {
                            TimepickerEl.attr('show-meridian', attrs.showMeridian);
                        }

                        if (attrs.showSeconds) {
                            TimepickerEl.attr('show-seconds', attrs.showSeconds);
                        }

                        function updatePosition() {
                            scope.position = appendToBody ? $position.offset(element) : $position.position(element);
                            scope.position.top = scope.position.top + element.prop('offsetHeight');
                        }

                        var documentBindingInitialized = false, elementFocusInitialized = false;
                        scope.$watch('isOpen', function (value) {
                            if (value) {
                                updatePosition();
                                $document.bind('click', documentClickBind);
                                if (elementFocusInitialized) {
                                    element.unbind('focus', elementFocusBind);
                                }
                                element[0].focus();
                                documentBindingInitialized = true;
                            } else {
                                if (documentBindingInitialized) {
                                    $document.unbind('click', documentClickBind);
                                }
                                element.bind('focus', elementFocusBind);
                                elementFocusInitialized = true;
                            }

                            if (setIsOpen) {
                                setIsOpen(originalScope, value);
                            }
                        });

                        var $popup = $compile(popupEl)(scope);
                        if (appendToBody) {
                            $document.find('body').append($popup);
                        } else {
                            element.after($popup);
                        }
                    }
                };
            }])
        .directive('timepickerPopupWrap', function () {
            return {
                restrict: 'EA',
                replace: true,
                transclude: true,
                templateUrl: 'app/shared/directives/timepickerPopup/popup.tpl.html',
                link: function (scope, element) {
                    element.bind('click', function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                    });
                }
            };
        });


});


