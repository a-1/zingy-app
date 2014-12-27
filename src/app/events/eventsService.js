'use strict';

define(['angular'], function (angular) {

    return angular
        .module('eventsService', [])
        .service('eventsService', ['$q', function ($q) {
            var events = [
                {
                    title: 'Karate Classes',
                    imgUrl: 'assets/images/karate.png',
                    description: 'Jog Highschool Pune From 7th May 14. Only 10 seats left. Hurry seats filling up fast'
                },
                {
                    title: 'Motocross Mania',
                    imgUrl: 'assets/images/motor.png',
                    description: 'Sarag Baugh Ground Today at 5:30 pm Brought to you by TOI Get a assured gift with every ticket Purchase before April 28th'
                },
                {
                    title: 'Inter IT Pool Tournaments',
                    imgUrl: 'assets/images/inter-it.png',
                    description: 'Witness the clashes if the TI TITANS on the Pool table at Bostro Cafe Paud road'
                },
                {
                    title: 'Karate Classes',
                    imgUrl: 'assets/images/karate.png',
                    description: 'Jog Highschool Pune From 7th May 14. Only 10 seats left. Hurry seats filling up fast'
                },
                {
                    title: 'Motocross Mania',
                    imgUrl: 'assets/images/motor.png',
                    description: 'Sarag Baugh Ground Today at 5:30 pm Brought to you by TOI Get a assured gift with every ticket Purchase before April 28th'
                },
                {
                    title: 'Inter IT Pool Tournaments',
                    imgUrl: 'assets/images/inter-it.png',
                    description: 'Witness the clashes if the TI TITANS on the Pool table at Bostro Cafe Paud road'
                },
                {
                    title: 'Karate Classes',
                    imgUrl: 'assets/images/karate.png',
                    description: 'Jog Highschool Pune From 7th May 14. Only 10 seats left. Hurry seats filling up fast'
                },
                {
                    title: 'Motocross Mania',
                    imgUrl: 'assets/images/motor.png',
                    description: 'Sarag Baugh Ground Today at 5:30 pm Brought to you by TOI Get a assured gift with every ticket Purchase before April 28th'
                },
                {
                    title: 'Inter IT Pool Tournaments',
                    imgUrl: 'assets/images/inter-it.png',
                    description: 'Witness the clashes if the TI TITANS on the Pool table at Bostro Cafe Paud road'
                },
            ];

            return {
                fetch: function () {

                    return $q(function (resolve) {
                        setTimeout(function () {
                            resolve(events);
                        }, 1000);
                    });

                }
            };

        }]);

});


