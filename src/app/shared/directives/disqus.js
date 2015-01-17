'use strict';
/* jshint ignore:start */

define(['angular'], function (angular) {

    return angular.module('disqus', [])
        .provider('$disqus', function () {
            var TYPE_EMBED = 'embed.js'; // general disqus embed script
            var TYPE_COUNT = 'count.js'; // used for count

            // Placeholder for the disqus shortname
            var shortname;

            function getScriptContainer() {
                return (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]);
            }

            function getShortname() {
                return shortname || 'justkhelo';
            }

            function getScriptSrc(shortname, file) {
                return '//' + shortname + '.disqus.com/' + file;
            }

            function buildScriptTag(src) {
                var script = document.createElement('script');

                // Configure the script tag
                script.type = 'text/javascript';
                script.async = true;
                script.src = src;

                return script;
            }

            function hasScriptTagInPlace(container, scriptSrc) {
                var scripts = container.getElementsByTagName('script'),
                    script, i;

                for (i = 0; i < scripts.length; i += 1) {
                    script = scripts[i];

                    // Check if the name contains the given values
                    // We need to check with indexOf because browsers replace // with their protocol
                    if (~script.src.indexOf(scriptSrc)) {
                        return true;
                    }
                }

                return false;
            }

            function setGlobals(id, url, shortname) {
                window.disqus_identifier = id;
                window.disqus_url = url;
                window.disqus_shortname = shortname;
            }

            function getCount() {
                var widgets = window.DISQUSWIDGETS;
                if (widgets && angular.isFunction(widgets.getCount)) {
                    widgets.getCount();
                }
            }

            function resetCommit($location, id) {
                window.DISQUS.reset({
                    reload: true,
                    config: function () {
                        this.page.identifier = id;
                        this.page.url = $location.absUrl();
                    }
                });
            }


            function addScriptTag(shortname, type) {
                var container = getScriptContainer(),
                    scriptSrc = getScriptSrc(shortname, type);

                // If it already has a script tag in place then lets not do anything
                // This might happen if the user changes the page faster than then disqus can load
                if (hasScriptTagInPlace(container, scriptSrc)) {
                    return;
                }

                // Build the script tag and append it to container
                container.appendChild(buildScriptTag(scriptSrc));
            }

            this.setShortname = function (sname) {
                shortname = sname;
            };

            // Provider constructor
            this.$get = ['$location', function ($location) {


                function commit(id) {
                    var shortname = getShortname();

                    if (!angular.isDefined(shortname)) {
                        throw new Error('No disqus shortname defined');
                    } else if (!angular.isDefined(id)) {
                        throw new Error('No disqus thread id defined');
                    } else if (angular.isDefined(window.DISQUS)) {
                        resetCommit($location, id);
                    } else {
                        setGlobals(id, $location.absUrl(), shortname);
                        addScriptTag(shortname, TYPE_EMBED);
                    }
                }

                function loadCount(id) {
                    setGlobals(id, $location.absUrl(), shortname);
                    addScriptTag(getShortname(), TYPE_EMBED);
                    addScriptTag(getShortname(), TYPE_COUNT);
                    getCount();
                }

                // Expose public api
                return {
                    commit: commit,
                    getShortname: getShortname,
                    loadCount: loadCount
                };
            }];
        })
        .directive('disqus', ['$disqus', function ($disqus) {

            return {
                restrict: 'AC',
                replace: true,
                scope: {
                    id: '=disqus',
                },
                template: '<div id="disqus_thread"></div>',
                link: function link(scope) {
                    scope.$watch('id', function (id) {
                        if (angular.isDefined(id)) {
                            $disqus.commit(id);
                        }
                    });
                }
            };
        }])
        .directive('disqusIdentifier', ['$disqus', function ($disqus) {
            return {
                restrict: 'A',
                link: function (scope, elem, attr) {
                    $disqus.loadCount(attr.disqusIdentifier);
                }
            };
        }]);

});
/* jshint ignore:end */
