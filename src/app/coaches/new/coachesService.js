'use strict';

define(['angular'], function (angular) {

    return angular
        .module('coachesService', [])
        .service('coachesService', function () {
            var personalDetails = [{
                firstName:'First Name',
                lastName:'Last Name',
                cellPhone:'Cell Phone',
                workPhone:'Work Phone',
                email:'Email',
                gender:'',
                nationality:'Nationality',
                webUrl:'Web URL',
                country:'',
                facebookUrl:'Facebook URL',
                youTubeUrl:'Youtube URL',
                addrLnText1:'Address Line 1',
                addrLnText2:'Address Line 2',
                otherUrl:'Other URL',
                city:'City',
                state:'State',
                pinCode:'Pin code'
            }];
            return {
                insertPersonalDetails: function(personalDetails){
                    return personalDetails;
                },
                editPersonalDetails: function(personalDetails){
                    return personalDetails;
                },
                getPersonalDetails: function(){
                    return personalDetails;
                }
            };
        });

});


