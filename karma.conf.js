module.exports = function (config) {

    config.set({
        hostname: 'localhost',
        basePath: '../..',
        port: 9876,
        reporters: ['progress'],
        frameworks: ['requirejs', 'mocha', 'chai'],
        files: [
            {
                pattern: 'src/app/**/*.js', included: false
            },
        ],
        excluded: [
            'src/app/main.js'
        ],
        plugins: [
            'karma-junit-reporter',
            'karma-requirejs',

        ]
    });

};