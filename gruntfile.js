//grunt tasks

module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        isHybridApp: grunt.option('isHybridApp'),
        isProduction: grunt.option('isProduction'),

        jshint: {
            files: ['src/app/**/*.js'],
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
                    {
                        src: 'bower_components/angular/angular.js',
                        dest: 'src/vendor/angular/angular.js'
                    },
                    {
                        src: 'bower_components/angular/angular.min.js',
                        dest: 'src/vendor/angular/angular.min.js'
                    },
                    {
                        src: 'bower_components/angular-route/angular-route.js',
                        dest: 'src/vendor/angular/angular-route.js'
                    },
                    {
                        src: 'bower_components/angular-route/angular-route.min.js',
                        dest: 'src/vendor/angular/angular-route.min.js'
                    },
                    {
                        src: 'bower_components/angular-animate/angular-animate.js',
                        dest: 'src/vendor/angular/angular-animate.js'
                    },
                    {
                        src: 'bower_components/angular-animate/angular-animate.min.js',
                        dest: 'src/vendor/angular/angular-animate.min.js'
                    },
                    {
                        src: 'bower_components/angular-messages/angular-messages.js',
                        dest: 'src/vendor/angular/angular-messages.js'
                    },
                    {
                        src: 'bower_components/angular-messages/angular-messages.min.js',
                        dest: 'src/vendor/angular/angular-messages.min.js'
                    },
                    {
                        src: 'bower_components/angular-resource/angular-resource.js',
                        dest: 'src/vendor/angular/angular-resource.js'
                    },
                    {
                        src: 'bower_components/angular-resource/angular-resource.min.js',
                        dest: 'src/vendor/angular/angular-resource.min.js'
                    },
                    {
                        src: 'bower_components/angular-touch/angular-touch.js',
                        dest: 'src/vendor/angular/angular-touch.js'
                    },
                    {
                        src: 'bower_components/angular-touch/angular-touch.min.js',
                        dest: 'src/vendor/angular/angular-touch.min.js'
                    },
                    {
                        src: 'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
                        dest: 'src/vendor/angular/ui-bootstrap-tpls.js'
                    },
                    //bootstrap
                    {expand: true, cwd: 'bower_components/bootstrap/', src: 'js/**', dest: 'src/vendor/bootstrap/'},
                    {expand: true, cwd: 'bower_components/bootstrap/', src: 'less/**', dest: 'src/vendor/bootstrap/'},
                    {expand: true, cwd: 'bower_components/bootstrap/', src: 'fonts/**', dest: 'src/vendor/bootstrap/'},
                    {expand: true, cwd: 'bower_components/bootstrap/fonts', src: ['**'], dest: 'src/assets/fonts/'},
                    //ramda
                    {src: 'bower_components/ramda/ramda.js', dest: 'src/vendor/ramda/ramda.js'},
                    {src: 'bower_components/ramda/ramda.min.js', dest: 'src/vendor/ramda/ramda.min.js'},
                    //satellizer
                    {src: 'bower_components/satellizer/satellizer.js', dest: 'src/vendor/satellizer/satellizer.js'},
                    {
                        src: 'bower_components/satellizer/satellizer.min.js',
                        dest: 'src/vendor/satellizer/satellizer.min.js'
                    },
                    //require & almond
                    {src: 'bower_components/almond/almond.js', dest: 'src/vendor/almond/almond.js'},
                    {src: 'bower_components/requirejs/require.js', dest: 'src/vendor/require/require.js'}
                ]
            },
            buildFromSrc: {
                files: [
                    {expand: true, cwd: 'src', src: ['**'], dest: 'build/'}
                ]
            },
            distFromBuild: {
                files: [
                    {expand: true, src: ['src/**'], dest: 'build/'}
                ]
            }
        },

        less: {
            options: {
                sourceMap: true,
                sourceMapFilename: 'build/assets/css/app.css.map',
                sourceMapURL: 'app.css.map',
                outputSourceFiles: true,
                report: 'min'
            },
            dev: {
                files: {
                    "build/assets/css/app.css": "build/assets/less/main.less"
                }
            },
            prod: {
                options: {
                    compress: true
                },
                files: {
                    "build/assets/css/app.css": "build/assets/less/main.less"
                }
            }
        },

        watch: {
            jshint: {
                files: ['src/app/**/*.js', 'gruntfile.js'],
                tasks: ['jshint', 'copy:buildFromSrc']
            },
            less: {
                files: ['src/app/**/*.less', 'src/assets/**/*.less'],
                tasks: ['copy:buildFromSrc', 'less:dev']
            },
            tpl: {
                files: ['src/index.tpl.html', 'src/main.tpl.less', 'src/app/**/*.html'],
                tasks: ['copy:buildFromSrc', 'templatize']
            }
        },

        templatize: {
            index: {
                src: 'build/index.tpl.html',
                dest: 'build/index.html'
            },
            lessModules: {
                src: 'build/main.tpl.less',
                dest: 'build/assets/less/main.less'
            }
        },

        html2js: {
            options: {
                base: 'src',
                module: 'templates-main'
            },
            main: {
                src: 'src/app/**/*.html',
                dest: 'build/app/templateCache.js'
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
                out: "build/app.js",
                include: ['main'],
                insertRequire: ['main'],
                wrap: true,
                almond: true,
                optimize: "uglify2",
                preserveLicenseComments: false,
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
        },

        connect: {
            web: {
                options: {
                    port: 9000,
                    base: 'build',
                    keepalive: true
                }
            }
        }

    });


    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-karma');
    grunt.registerMultiTask('templatize', function () {
        grunt.file.copy(this.data.src, this.data.dest, {process: grunt.template.process});
    });

    grunt.registerTask('build', ['jshint', 'clean:build', 'copy:updateLibs', 'copy:buildFromSrc', 'templatize', 'less:dev']);
    grunt.registerTask('dist', ['build', 'clean:dist', 'less:prod', 'html2js', 'requirejs']);
    grunt.registerTask('test', ['karma:unit']);
    grunt.registerTask('web', ['connect:web']);
    grunt.registerTask('default', ['build']);

};