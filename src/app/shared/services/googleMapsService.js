'use strict';

define(['angular', 'ramda'], function (angular, R) {

    return angular.module('googleMaps', [])
        .service('googleMapsService', ['$window', '$q', function ($window, $q) {
            return {
                init: function () {
                    var dfd = $q.defer();
                    var doc = $window.document;
                    var scriptId = 'gmapScript';
                    var scriptTag = doc.getElementById(scriptId);

                    if (scriptTag && $window.google && $window.google.maps) {
                        dfd.resolve($window.google.maps);
                        return dfd.promise;
                    }

                    $window.mapReady = (function (dfd) {
                        return function () {
                            // resolve the promise:
                            dfd.resolve($window.google && $window.google.maps);
                            // cleanup the global space now that we are done:
                            delete $window.mapReady;
                        };
                    }(dfd));

                    scriptTag = doc.createElement('script');
                    scriptTag.id = scriptId;
                    scriptTag.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=mapReady');
                    doc.head.appendChild(scriptTag);

                    return dfd.promise;
                },

                googleMaps: function () {
                    var map, marker;
                    var maps = $window.google && $window.google.maps;
                    var geocoder = new maps.Geocoder();
                    var mapOptions = {
                        zoom: 15,
                        center: new maps.LatLng(18.52034, 73.85674)
                    };

                    var updateAddress = function ($scope, addr, position, idx, isSports) {
                        var addressComponents = 'address_components';
                        var addrComp;
                        var find = function (type) {
                            return function (comp) {
                                return comp.types[0] === type;
                            };
                        };
                        $scope.$apply(function ($scope) {
                            var entity = isSports ? $scope.entity.sports[idx] : $scope.entity;
                            if (addr) {
                                addrComp = addr[addressComponents];
                                entity.city = R.pipe(R.find(find('locality')), R.prop('long_name'))(addrComp);
                                entity.state = R.pipe(R.find(find('administrative_area_level_1')), R.prop('long_name'))(addrComp);
                                entity.pin = R.pipe(R.find(find('postal_code')), R.prop('long_name'))(addrComp);
                            }
                            if (position) {
                                entity.loc = {
                                    type: 'Point',
                                    coordinates: [position.lat(), position.lng()]
                                };
                            }

                        });
                    };

                    return {
                        create: function (canvas, $scope, idx, isSports) {
                            var entity = isSports ? $scope.entity.sports[idx] : $scope.entity;
                            var watchGroup = isSports ? ['entity.sports[' + idx + '].city', 'entity.sports[' + idx + '].state', 'entity.sports[' + idx + '].pin'] : ['entity.city', 'entity.state', 'entity.pin'];

                            var initialLocation = {'latLng': mapOptions.center};

                            map = new maps.Map(canvas, mapOptions);
                            marker = new maps.Marker({
                                position: map.getCenter(),
                                map: map,
                                draggable: true
                            });

                            if (entity.loc && entity.loc.coordinates && entity.loc.coordinates.length) {
                                initialLocation = {'latLng': new maps.LatLng(entity.loc.coordinates[0], entity.loc.coordinates[1])};
                            }

                            //load the map with existing address
                            geocoder.geocode(initialLocation, function (results, status) {
                                var position;
                                if (status === maps.GeocoderStatus.OK) {
                                    position = results[0].geometry.location;
                                    map.panTo(position);
                                    marker.setPosition(position);
                                    updateAddress($scope, results[0], position, idx, isSports);
                                }
                            });

                            //add event listner to update location when marker drag
                            maps.event.addListener(marker, 'dragend', function () {
                                var position = marker.getPosition();
                                map.panTo(position);

                                //reverse geocoding to update address
                                geocoder.geocode({'latLng': position}, function (results, status) {
                                    if (status === maps.GeocoderStatus.OK) {
                                        updateAddress($scope, results[0], position, idx, isSports);
                                    }
                                });
                            });

                            //add event listner to update location when map drag
                            maps.event.addListener(map, 'dragend', function () {
                                var position = map.getCenter();
                                marker.setPosition(position);

                                //reverse geocoding to update address
                                geocoder.geocode({'latLng': position}, function (results, status) {
                                    if (status === maps.GeocoderStatus.OK) {
                                        updateAddress($scope, results[0], position, idx, isSports);
                                    }
                                });
                            });

                            $scope.$watchGroup(watchGroup, function (newValues, oldValues) {
                                var address;
                                if (!angular.equals(newValues, oldValues) && newValues[0] && newValues[1] && newValues[2]) {
                                    address = {address: newValues[0] + ' ' + newValues[1] + ' ' + newValues[2]};
                                    geocoder.geocode(address, function (results, status) {
                                        var position;
                                        if (status === maps.GeocoderStatus.OK) {
                                            position = results[0].geometry.location;
                                            map.panTo(position);
                                            marker.setPosition(position);
                                            updateAddress($scope, null, position, idx, isSports);
                                        }
                                    });
                                }

                            });

                        }

                    };
                }

            };

        }]);

});