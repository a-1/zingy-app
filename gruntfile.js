//copy files from the bower_components to vendor directory
//combine all templates
//combine the less
//create the build
//copy to the dist

//jshint
//karma
//watch

module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: ['app/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        watch: {
            files: ['app/**/*.js'],
            tasks: ['jshint']
        },

        karma: {
            unit: {
                configFile: 'karma.conf.js'
            },
            continuous: {
                configFile: 'karma.conf.js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('test', ['karma:unit']);

};