'use strict';
define(['angular'], function (angular) {

    return angular.module('fileUpload', []).service('fileUploadService', ['$rootScope', '$http', 'appConfig', function ($rootScope, $http, appConfig) {
            var fileImage = {
                data: {},
                status: {}
            };
           return {
               fileImage: fileImage,

               upload: function ($files) {
                   var file = $files;
                   $http.get('/api/s3Policy?mimeType=' + file.type).success(function (response) {
                       var s3Params = response;
                       $http.put({
                           url: 'https://' + $rootScope.appConfig.awsConfig.bucket + '.s3.amazonaws.com/',
                           method: 'POST',
                           transformRequest: function (data, headersGetter) {
                               //Headers change here
                               var headers = headersGetter();
                               delete headers.Authorization;
                               return data;
                           },
                           data: {
                               'key': 's3UploadExample/' + Math.round(Math.random() * 10000) + '$$' + file.name,
                               'acl': 'public-read',
                               'Content-Type': file.type,
                               'AWSAccessKeyId': s3Params.AWSAccessKeyId,
                               'success_action_status': '201',
                               'Policy': s3Params.s3Policy,
                               'Signature': s3Params.s3Signature
                           },
                           file: file
                       });
                   });
               },
               uploadImage: function (imgData, url) {
                   this.getSignedUrl(url).then(function(data) {
                       $http({
                           method: 'PUT',
                           url: data.data,
                           ContentType : 'image/png',
                           transformRequest: function (data, headersGetter) {
                               var headers = headersGetter();
                               delete headers.Authorization;
                               headers['Content-Type'] = 'image/png';
                               return data;
                           },
                           data: imgData
                       });
                   });
               },
               getData: function(id){
                  return $http({
                       method: 'GET',
                       url: 'https://s3-us-west-2.amazonaws.com/demokheloapp/'+id+'.png',
                       ContentType : 'image/png',
                       transformRequest: function (data, headersGetter) {
                           var headers = headersGetter();
                           delete headers.Authorization;
                           headers['Content-Type'] = 'image/png';
                           return data;
                       }
                   });
               },
               getSignedUrl: function (id) {
                  return $http.get(appConfig.apiBaseURL + '/signedUrl', {params: {id: id}});

               }
           };
        }]);
});
