'use strict';

define(['angular'], function (angular) {

    return angular
        .module('resultsService', [])
        .service('resultsService', function () {
           return {
               getResults: function(){
                   var storeData = [{
                       storeName:'Shakti Sports',
                       storeLocation:'Koregaon Park',
                       storeAddress:'Lane 5, Oxford Properties, Off North Main Road...',
                       phoneNbr:'+91 8956938147',
                       speciality:'Scuba Diving gear, Helmets, Biking Jackets'
                   },
                   {
                       storeName:'Champion Sports:',
                       storeLocation:'Koregaon Park',
                       storeAddress:'Next To Orange County, Wakad Road, Vishal Nagar, Wakad...',
                       phoneNbr:'+91 8956938147',
                       speciality:'Scuba Diving gear, Helmets, Biking Jackets'
                   },
                   {
                       storeName:'Deccan Sports Wholesale:',
                       storeLocation:'Koregaon Park',
                       storeAddress:'2nd Floor, East Court of Phoenix Market City...',
                       phoneNbr:'+91 8956938147',
                       speciality:'Scuba Diving gear, Helmets, Biking Jackets'
                   },
                   {
                       storeName:'Total Sports And Fitness:',
                       storeLocation:'Koregaon Park',
                       storeAddress:'Lane 5, Oxford Properties, Off North Main Road...',
                       phoneNbr:'+91 8956938147',
                       speciality:'Scuba Diving gear, Helmets, Biking Jackets'
                   }];
                   return storeData;
               }
           };
        });

});