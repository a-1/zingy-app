//grunt tasks

module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        isHybridApp: grunt.option('isHybridApp'),
        isProduction: grunt.option('isProduction'),

        jshint: {
            files: ['app/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        clean: {
            options: {
                force: true
            },
            build: ['build'],
            dist: ['dist'],
            hybrid: ['hybrid']
        },

        copy: {
            updateLibs: {
                files: [
                    //angular
                    {src: 'bower_components/angular/angular.js', dest: 'src/vendor/angular/angular.js'},
                    {src: 'bower_components/angular/angular.min.js', dest: 'src/vendor/angular/angular.min.js'},
                    //bootstrap
                    {expand: true, cwd: 'bower_components/bootstrap/', src: 'js/**', dest: 'src/vendor/bootstrap/'},
                    {expand: true, cwd: 'bower_components/bootstrap/', src: 'less/**', dest: 'src/vendor/bootstrap/'},
                    {expand: true, cwd: 'bower_components/bootstrap/', src: 'fonts/**', dest: 'src/vendor/bootstrap/'},
                    //ramda
                    {src: 'bower_components/ramda/ramda.js', dest: 'src/vendor/ramda/ramda.js'},
                    {src: 'bower_components/ramda/ramda.min.js', dest: 'src/vendor/ramda/ramda.min.js'},
                    //require & almond
                    {src: 'bower_components/almond/almond.js', dest: 'src/vendor/almond/almond.js'},
                    {src: 'bower_components/requirejs/require.js', dest: 'src/vendor/require/require.js'}
                ]
            },
            buildFromSrc: {
                files: [
                    {expand: true, src: ['src/**'], dest: 'build/'}
                ]
            },
            distFromSrc: {
                files: [
                    {expand: true, src: ['src/**'], dest: 'build/'}
                ]
            }
        },

        less: {
            options: {
                sourceMap: true,
                sourceMapFilename: 'build/app.css.map',
                sourceMapURL: 'app.css.map',
                outputSourceFiles: true,
                report: 'min'
            },
            dev: {
                files: {
                    "build/app.css": "build/assets/less/source.less"
                }
            },
            prod: {
                options: {
                    compress: true
                },
                files: {
                    "build/app.css": "build/assets/less/source.less"
                }
            }
        },

        watch: {
            files: ['app/**/*.js'],
            tasks: ['jshint']
        },

        templatize: {
            index: {
                src: 'build/index.tpl.html',
                dest: 'build/index.html'
            },
            lessModules: {
                src: 'src/assets/less/modules.less.tpl',
                dest: 'build/assets/less/modules.less'
            }
        },

        html2js: {
            options: {
                base: 'src',
                module: 'templates-main'
            },
            main: {
                src: 'src/app/**/*.html',
                dest: 'build/app/templateCacheLoaded.js'
            }
        },

        usemin: {},

        filerev: {
            prod: {
                files: [{
                    src: [
                        'build/app/app.js',
                        'build/assets/app.css',
                        'build/assets/**/*.{jpg,jpeg,gif,png,eot,svg,ttf,woff}'
                    ]
                }]
            }
        },

        requirejs: {
            options: {
                baseUrl: "./build/app",
                mainConfigFile: "src/app/main.js",
                name: "../vendor/almond/almond",
                out: "build/optimized.js",
                include: ['main'],
                insertRequire: ['main'],
                wrap: true,
                almond: true,
                optimize: "uglify2",
                skipDirOptimize: true,
                keepBuildDir: true,
                generateSourceMaps: true,
                uglify2: {
                    mangle: false
                }
            },
            paths: {
                "angular": '../vendor/angular/angular.min'
            }
        },

        karma: {
            options: {
                configFile: 'karma.conf.js',
                browsers: ['PhantomJS']
            },
            unit: {
                singleRun: true
            },
            continuous: {
                autoWatch: true
            },
            coverage: {
                singleRun: true,
                preprocessors: {
                    'src/app/**/!(*spec).js': 'coverage',
                    'src/components/**/!(*spec).js': 'coverage'
                },
                reporters: ['coverage'],
                coverageReporter: {
                    type: 'html',
                    dir: 'reports/coverage'
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerMultiTask('templatize', function () {
        grunt.file.copy(this.data.src, this.data.dest, {process: grunt.template.process});
    });

    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['build']);
    grunt.registerTask('test', ['karma:unit']);

};