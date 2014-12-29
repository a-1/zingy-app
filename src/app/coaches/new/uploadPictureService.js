'use strict';

define(['angular'], function (angular) {

    return angular
        .module('uploadPictureService',[])
        .service('uploadPictureService', ['$http', function ($http) {
            return {
                getFileFromAws: function () {
                    return $http.get('http://localhost:3000/api/download');
                },
                addFileToAws: function (profileData) {
                    return $http.post('http://localhost:3000/api/upload', profileData);
                }
            };
        }]);


});


