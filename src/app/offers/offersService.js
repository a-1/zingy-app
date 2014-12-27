'use strict';

define(['angular'], function (angular) {

    return angular
        .module('offersService', [])
        .service('offersService', ['$q', function ($q) {

            var offers = [
                {
                    shop: 'Champion Sports',
                    imgUrl: 'assets/images/offer-img1.jpg',
                    offers: [
                        {
                            title: '40% off on Adidas Shoes'
                        },
                        {
                            title: '25% off on biking gear'
                        }
                    ]
                },
                {
                    shop: 'Shakti Sports',
                    imgUrl: 'assets/images/offer-img2.jpg',
                    offers: [
                        {
                            title: '500 off on Purchase of 2000 & above'
                        },
                        {
                            title: 'Free T-shirt of your favorite team'
                        }
                    ]
                },
                {
                    shop: 'Newage Sports',
                    imgUrl: 'assets/images/offer-img1.jpg',
                    offers: [
                        {
                            title: '40% off on Nike Shoes'
                        },
                        {
                            title: '10% off on swim wear'
                        }
                    ]
                },
                {
                    shop: 'Champion Sports',
                    imgUrl: 'assets/images/offer-img1.jpg',
                    offers: [
                        {
                            title: '40% off on Adidas Shoes'
                        },
                        {
                            title: '25% off on biking gear'
                        }
                    ]
                },
                {
                    shop: 'Shakti Sports',
                    imgUrl: 'assets/images/offer-img2.jpg',
                    offers: [
                        {
                            title: '500 off on Purchase of 2000 & above'
                        },
                        {
                            title: 'Free T-shirt of your favorite team'
                        }
                    ]
                },
                {
                    shop: 'Newage Sports',
                    imgUrl: 'assets/images/offer-img1.jpg',
                    offers: [
                        {
                            title: '40% off on Nike Shoes'
                        },
                        {
                            title: '10% off on swim wear'
                        }
                    ]
                }
            ];

            return {
                fetch: function () {

                    return $q(function (resolve) {
                        setTimeout(function () {
                            resolve(offers);
                        }, 1000);
                    });

                }
            };

        }]);

});


