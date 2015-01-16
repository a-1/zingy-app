'use strict';
define(['angular'], function (angular) {

    return angular.module('fileUpload', []).service('fileUploadService', ['$rootScope', '$http', 'appConfig', function ($rootScope, $http, appConfig) {

        return {

            uploadImage: function (file, url) {
                this.getSignedUrl(url).then(function (data) {
                    $http({
                        method: 'PUT',
                        url: data.data,
                        ContentType: 'image/jpg',
                        transformRequest: function (data, headersGetter) {
                            var headers = headersGetter();
                            delete headers.Authorization;
                            headers['Content-Type'] = 'image/jpg';
                            return data;
                        },
                        data: file
                    });
                });
            },
            getSignedUrl: function (id) {
                return $http.get(appConfig.apiBaseURL + '/awsSignedUrl', {params: {id: id}});

            }

        };
    }]);
});
