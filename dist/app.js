!function () {
    var requirejs, require, define;
    !function (undef) {
        function hasProp(obj, prop) {
            return hasOwn.call(obj, prop)
        }

        function normalize(name, baseName) {
            var nameParts, nameSegment, mapValue, foundMap, lastIndex, foundI, foundStarMap, starI, i, j, part, baseParts = baseName && baseName.split("/"), map = config.map, starMap = map && map["*"] || {};
            if (name && "." === name.charAt(0))if (baseName) {
                for (baseParts = baseParts.slice(0, baseParts.length - 1), name = name.split("/"), lastIndex = name.length - 1, config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex]) && (name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, "")), name = baseParts.concat(name), i = 0; i < name.length; i += 1)if (part = name[i], "." === part)name.splice(i, 1), i -= 1; else if (".." === part) {
                    if (1 === i && (".." === name[2] || ".." === name[0]))break;
                    i > 0 && (name.splice(i - 1, 2), i -= 2)
                }
                name = name.join("/")
            } else 0 === name.indexOf("./") && (name = name.substring(2));
            if ((baseParts || starMap) && map) {
                for (nameParts = name.split("/"), i = nameParts.length; i > 0; i -= 1) {
                    if (nameSegment = nameParts.slice(0, i).join("/"), baseParts)for (j = baseParts.length; j > 0; j -= 1)if (mapValue = map[baseParts.slice(0, j).join("/")], mapValue && (mapValue = mapValue[nameSegment])) {
                        foundMap = mapValue, foundI = i;
                        break
                    }
                    if (foundMap)break;
                    !foundStarMap && starMap && starMap[nameSegment] && (foundStarMap = starMap[nameSegment], starI = i)
                }
                !foundMap && foundStarMap && (foundMap = foundStarMap, foundI = starI), foundMap && (nameParts.splice(0, foundI, foundMap), name = nameParts.join("/"))
            }
            return name
        }

        function makeRequire(relName, forceSync) {
            return function () {
                var args = aps.call(arguments, 0);
                return "string" != typeof args[0] && 1 === args.length && args.push(null), req.apply(undef, args.concat([relName, forceSync]))
            }
        }

        function makeNormalize(relName) {
            return function (name) {
                return normalize(name, relName)
            }
        }

        function makeLoad(depName) {
            return function (value) {
                defined[depName] = value
            }
        }

        function callDep(name) {
            if (hasProp(waiting, name)) {
                var args = waiting[name];
                delete waiting[name], defining[name] = !0, main.apply(undef, args)
            }
            if (!hasProp(defined, name) && !hasProp(defining, name))throw new Error("No " + name);
            return defined[name]
        }

        function splitPrefix(name) {
            var prefix, index = name ? name.indexOf("!") : -1;
            return index > -1 && (prefix = name.substring(0, index), name = name.substring(index + 1, name.length)), [prefix, name]
        }

        function makeConfig(name) {
            return function () {
                return config && config.config && config.config[name] || {}
            }
        }

        var main, req, makeMap, handlers, defined = {}, waiting = {}, config = {}, defining = {}, hasOwn = Object.prototype.hasOwnProperty, aps = [].slice, jsSuffixRegExp = /\.js$/;
        makeMap = function (name, relName) {
            var plugin, parts = splitPrefix(name), prefix = parts[0];
            return name = parts[1], prefix && (prefix = normalize(prefix, relName), plugin = callDep(prefix)), prefix ? name = plugin && plugin.normalize ? plugin.normalize(name, makeNormalize(relName)) : normalize(name, relName) : (name = normalize(name, relName), parts = splitPrefix(name), prefix = parts[0], name = parts[1], prefix && (plugin = callDep(prefix))), {
                f: prefix ? prefix + "!" + name : name,
                n: name,
                pr: prefix,
                p: plugin
            }
        }, handlers = {
            require: function (name) {
                return makeRequire(name)
            }, exports: function (name) {
                var e = defined[name];
                return "undefined" != typeof e ? e : defined[name] = {}
            }, module: function (name) {
                return {id: name, uri: "", exports: defined[name], config: makeConfig(name)}
            }
        }, main = function (name, deps, callback, relName) {
            var cjsModule, depName, ret, map, i, usingExports, args = [], callbackType = typeof callback;
            if (relName = relName || name, "undefined" === callbackType || "function" === callbackType) {
                for (deps = !deps.length && callback.length ? ["require", "exports", "module"] : deps, i = 0; i < deps.length; i += 1)if (map = makeMap(deps[i], relName), depName = map.f, "require" === depName)args[i] = handlers.require(name); else if ("exports" === depName)args[i] = handlers.exports(name), usingExports = !0; else if ("module" === depName)cjsModule = args[i] = handlers.module(name); else if (hasProp(defined, depName) || hasProp(waiting, depName) || hasProp(defining, depName))args[i] = callDep(depName); else {
                    if (!map.p)throw new Error(name + " missing " + depName);
                    map.p.load(map.n, makeRequire(relName, !0), makeLoad(depName), {}), args[i] = defined[depName]
                }
                ret = callback ? callback.apply(defined[name], args) : void 0, name && (cjsModule && cjsModule.exports !== undef && cjsModule.exports !== defined[name] ? defined[name] = cjsModule.exports : ret === undef && usingExports || (defined[name] = ret))
            } else name && (defined[name] = callback)
        }, requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
            if ("string" == typeof deps)return handlers[deps] ? handlers[deps](callback) : callDep(makeMap(deps, callback).f);
            if (!deps.splice) {
                if (config = deps, config.deps && req(config.deps, config.callback), !callback)return;
                callback.splice ? (deps = callback, callback = relName, relName = null) : deps = undef
            }
            return callback = callback || function () {
            }, "function" == typeof relName && (relName = forceSync, forceSync = alt), forceSync ? main(undef, deps, callback, relName) : setTimeout(function () {
                main(undef, deps, callback, relName)
            }, 4), req
        }, req.config = function (cfg) {
            return req(cfg)
        }, requirejs._defined = defined, define = function (name, deps, callback) {
            deps.splice || (callback = deps, deps = []), hasProp(defined, name) || hasProp(waiting, name) || (waiting[name] = [name, deps, callback])
        }, define.amd = {jQuery: !0}
    }(), define("../vendor/almond/almond", function () {
    }), function (window, document, undefined) {
        function minErr(module, ErrorConstructor) {
            return ErrorConstructor = ErrorConstructor || Error, function () {
                var message, i, code = arguments[0], prefix = "[" + (module ? module + ":" : "") + code + "] ", template = arguments[1], templateArgs = arguments;
                for (message = prefix + template.replace(/\{\d+\}/g, function (match) {
                    var index = +match.slice(1, -1);
                    return index + 2 < templateArgs.length ? toDebugString(templateArgs[index + 2]) : match
                }), message = message + "\nhttp://errors.angularjs.org/1.3.8/" + (module ? module + "/" : "") + code, i = 2; i < arguments.length; i++)message = message + (2 == i ? "?" : "&") + "p" + (i - 2) + "=" + encodeURIComponent(toDebugString(arguments[i]));
                return new ErrorConstructor(message)
            }
        }

        function isArrayLike(obj) {
            if (null == obj || isWindow(obj))return !1;
            var length = obj.length;
            return obj.nodeType === NODE_TYPE_ELEMENT && length ? !0 : isString(obj) || isArray(obj) || 0 === length || "number" == typeof length && length > 0 && length - 1 in obj
        }

        function forEach(obj, iterator, context) {
            var key, length;
            if (obj)if (isFunction(obj))for (key in obj)"prototype" == key || "length" == key || "name" == key || obj.hasOwnProperty && !obj.hasOwnProperty(key) || iterator.call(context, obj[key], key, obj); else if (isArray(obj) || isArrayLike(obj)) {
                var isPrimitive = "object" != typeof obj;
                for (key = 0, length = obj.length; length > key; key++)(isPrimitive || key in obj) && iterator.call(context, obj[key], key, obj)
            } else if (obj.forEach && obj.forEach !== forEach)obj.forEach(iterator, context, obj); else for (key in obj)obj.hasOwnProperty(key) && iterator.call(context, obj[key], key, obj);
            return obj
        }

        function sortedKeys(obj) {
            return Object.keys(obj).sort()
        }

        function forEachSorted(obj, iterator, context) {
            for (var keys = sortedKeys(obj), i = 0; i < keys.length; i++)iterator.call(context, obj[keys[i]], keys[i]);
            return keys
        }

        function reverseParams(iteratorFn) {
            return function (value, key) {
                iteratorFn(key, value)
            }
        }

        function nextUid() {
            return ++uid
        }

        function setHashKey(obj, h) {
            h ? obj.$$hashKey = h : delete obj.$$hashKey
        }

        function extend(dst) {
            for (var h = dst.$$hashKey, i = 1, ii = arguments.length; ii > i; i++) {
                var obj = arguments[i];
                if (obj)for (var keys = Object.keys(obj), j = 0, jj = keys.length; jj > j; j++) {
                    var key = keys[j];
                    dst[key] = obj[key]
                }
            }
            return setHashKey(dst, h), dst
        }

        function int(str) {
            return parseInt(str, 10)
        }

        function inherit(parent, extra) {
            return extend(Object.create(parent), extra)
        }

        function noop() {
        }

        function identity($) {
            return $
        }

        function valueFn(value) {
            return function () {
                return value
            }
        }

        function isUndefined(value) {
            return "undefined" == typeof value
        }

        function isDefined(value) {
            return "undefined" != typeof value
        }

        function isObject(value) {
            return null !== value && "object" == typeof value
        }

        function isString(value) {
            return "string" == typeof value
        }

        function isNumber(value) {
            return "number" == typeof value
        }

        function isDate(value) {
            return "[object Date]" === toString.call(value)
        }

        function isFunction(value) {
            return "function" == typeof value
        }

        function isRegExp(value) {
            return "[object RegExp]" === toString.call(value)
        }

        function isWindow(obj) {
            return obj && obj.window === obj
        }

        function isScope(obj) {
            return obj && obj.$evalAsync && obj.$watch
        }

        function isFile(obj) {
            return "[object File]" === toString.call(obj)
        }

        function isFormData(obj) {
            return "[object FormData]" === toString.call(obj)
        }

        function isBlob(obj) {
            return "[object Blob]" === toString.call(obj)
        }

        function isBoolean(value) {
            return "boolean" == typeof value
        }

        function isPromiseLike(obj) {
            return obj && isFunction(obj.then)
        }

        function isElement(node) {
            return !(!node || !(node.nodeName || node.prop && node.attr && node.find))
        }

        function makeMap(str) {
            var i, obj = {}, items = str.split(",");
            for (i = 0; i < items.length; i++)obj[items[i]] = !0;
            return obj
        }

        function nodeName_(element) {
            return lowercase(element.nodeName || element[0] && element[0].nodeName)
        }

        function arrayRemove(array, value) {
            var index = array.indexOf(value);
            return index >= 0 && array.splice(index, 1), value
        }

        function copy(source, destination, stackSource, stackDest) {
            if (isWindow(source) || isScope(source))throw ngMinErr("cpws", "Can't copy! Making copies of Window or Scope instances is not supported.");
            if (destination) {
                if (source === destination)throw ngMinErr("cpi", "Can't copy! Source and destination are identical.");
                if (stackSource = stackSource || [], stackDest = stackDest || [], isObject(source)) {
                    var index = stackSource.indexOf(source);
                    if (-1 !== index)return stackDest[index];
                    stackSource.push(source), stackDest.push(destination)
                }
                var result;
                if (isArray(source)) {
                    destination.length = 0;
                    for (var i = 0; i < source.length; i++)result = copy(source[i], null, stackSource, stackDest), isObject(source[i]) && (stackSource.push(source[i]), stackDest.push(result)), destination.push(result)
                } else {
                    var h = destination.$$hashKey;
                    isArray(destination) ? destination.length = 0 : forEach(destination, function (value, key) {
                        delete destination[key]
                    });
                    for (var key in source)source.hasOwnProperty(key) && (result = copy(source[key], null, stackSource, stackDest), isObject(source[key]) && (stackSource.push(source[key]), stackDest.push(result)), destination[key] = result);
                    setHashKey(destination, h)
                }
            } else if (destination = source, source)if (isArray(source))destination = copy(source, [], stackSource, stackDest); else if (isDate(source))destination = new Date(source.getTime()); else if (isRegExp(source))destination = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]), destination.lastIndex = source.lastIndex; else if (isObject(source)) {
                var emptyObject = Object.create(Object.getPrototypeOf(source));
                destination = copy(source, emptyObject, stackSource, stackDest)
            }
            return destination
        }

        function shallowCopy(src, dst) {
            if (isArray(src)) {
                dst = dst || [];
                for (var i = 0, ii = src.length; ii > i; i++)dst[i] = src[i]
            } else if (isObject(src)) {
                dst = dst || {};
                for (var key in src)("$" !== key.charAt(0) || "$" !== key.charAt(1)) && (dst[key] = src[key])
            }
            return dst || src
        }

        function equals(o1, o2) {
            if (o1 === o2)return !0;
            if (null === o1 || null === o2)return !1;
            if (o1 !== o1 && o2 !== o2)return !0;
            var length, key, keySet, t1 = typeof o1, t2 = typeof o2;
            if (t1 == t2 && "object" == t1) {
                if (!isArray(o1)) {
                    if (isDate(o1))return isDate(o2) ? equals(o1.getTime(), o2.getTime()) : !1;
                    if (isRegExp(o1) && isRegExp(o2))return o1.toString() == o2.toString();
                    if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || isArray(o2))return !1;
                    keySet = {};
                    for (key in o1)if ("$" !== key.charAt(0) && !isFunction(o1[key])) {
                        if (!equals(o1[key], o2[key]))return !1;
                        keySet[key] = !0
                    }
                    for (key in o2)if (!keySet.hasOwnProperty(key) && "$" !== key.charAt(0) && o2[key] !== undefined && !isFunction(o2[key]))return !1;
                    return !0
                }
                if (!isArray(o2))return !1;
                if ((length = o1.length) == o2.length) {
                    for (key = 0; length > key; key++)if (!equals(o1[key], o2[key]))return !1;
                    return !0
                }
            }
            return !1
        }

        function concat(array1, array2, index) {
            return array1.concat(slice.call(array2, index))
        }

        function sliceArgs(args, startIndex) {
            return slice.call(args, startIndex || 0)
        }

        function bind(self, fn) {
            var curryArgs = arguments.length > 2 ? sliceArgs(arguments, 2) : [];
            return !isFunction(fn) || fn instanceof RegExp ? fn : curryArgs.length ? function () {
                return arguments.length ? fn.apply(self, concat(curryArgs, arguments, 0)) : fn.apply(self, curryArgs)
            } : function () {
                return arguments.length ? fn.apply(self, arguments) : fn.call(self)
            }
        }

        function toJsonReplacer(key, value) {
            var val = value;
            return "string" == typeof key && "$" === key.charAt(0) && "$" === key.charAt(1) ? val = undefined : isWindow(value) ? val = "$WINDOW" : value && document === value ? val = "$DOCUMENT" : isScope(value) && (val = "$SCOPE"), val
        }

        function toJson(obj, pretty) {
            return "undefined" == typeof obj ? undefined : (isNumber(pretty) || (pretty = pretty ? 2 : null), JSON.stringify(obj, toJsonReplacer, pretty))
        }

        function fromJson(json) {
            return isString(json) ? JSON.parse(json) : json
        }

        function startingTag(element) {
            element = jqLite(element).clone();
            try {
                element.empty()
            } catch (e) {
            }
            var elemHtml = jqLite("<div>").append(element).html();
            try {
                return element[0].nodeType === NODE_TYPE_TEXT ? lowercase(elemHtml) : elemHtml.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/, function (match, nodeName) {
                    return "<" + lowercase(nodeName)
                })
            } catch (e) {
                return lowercase(elemHtml)
            }
        }

        function tryDecodeURIComponent(value) {
            try {
                return decodeURIComponent(value)
            } catch (e) {
            }
        }

        function parseKeyValue(keyValue) {
            var key_value, key, obj = {};
            return forEach((keyValue || "").split("&"), function (keyValue) {
                if (keyValue && (key_value = keyValue.replace(/\+/g, "%20").split("="), key = tryDecodeURIComponent(key_value[0]), isDefined(key))) {
                    var val = isDefined(key_value[1]) ? tryDecodeURIComponent(key_value[1]) : !0;
                    hasOwnProperty.call(obj, key) ? isArray(obj[key]) ? obj[key].push(val) : obj[key] = [obj[key], val] : obj[key] = val
                }
            }), obj
        }

        function toKeyValue(obj) {
            var parts = [];
            return forEach(obj, function (value, key) {
                isArray(value) ? forEach(value, function (arrayValue) {
                    parts.push(encodeUriQuery(key, !0) + (arrayValue === !0 ? "" : "=" + encodeUriQuery(arrayValue, !0)))
                }) : parts.push(encodeUriQuery(key, !0) + (value === !0 ? "" : "=" + encodeUriQuery(value, !0)))
            }), parts.length ? parts.join("&") : ""
        }

        function encodeUriSegment(val) {
            return encodeUriQuery(val, !0).replace(/%26/gi, "&").replace(/%3D/gi, "=").replace(/%2B/gi, "+")
        }

        function encodeUriQuery(val, pctEncodeSpaces) {
            return encodeURIComponent(val).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%3B/gi, ";").replace(/%20/g, pctEncodeSpaces ? "%20" : "+")
        }

        function getNgAttribute(element, ngAttr) {
            var attr, i, ii = ngAttrPrefixes.length;
            for (element = jqLite(element), i = 0; ii > i; ++i)if (attr = ngAttrPrefixes[i] + ngAttr, isString(attr = element.attr(attr)))return attr;
            return null
        }

        function angularInit(element, bootstrap) {
            var appElement, module, config = {};
            forEach(ngAttrPrefixes, function (prefix) {
                var name = prefix + "app";
                !appElement && element.hasAttribute && element.hasAttribute(name) && (appElement = element, module = element.getAttribute(name))
            }), forEach(ngAttrPrefixes, function (prefix) {
                var candidate, name = prefix + "app";
                !appElement && (candidate = element.querySelector("[" + name.replace(":", "\\:") + "]")) && (appElement = candidate, module = candidate.getAttribute(name))
            }), appElement && (config.strictDi = null !== getNgAttribute(appElement, "strict-di"), bootstrap(appElement, module ? [module] : [], config))
        }

        function bootstrap(element, modules, config) {
            isObject(config) || (config = {});
            var defaultConfig = {strictDi: !1};
            config = extend(defaultConfig, config);
            var doBootstrap = function () {
                if (element = jqLite(element), element.injector()) {
                    var tag = element[0] === document ? "document" : startingTag(element);
                    throw ngMinErr("btstrpd", "App Already Bootstrapped with this Element '{0}'", tag.replace(/</, "&lt;").replace(/>/, "&gt;"))
                }
                modules = modules || [], modules.unshift(["$provide", function ($provide) {
                    $provide.value("$rootElement", element)
                }]), config.debugInfoEnabled && modules.push(["$compileProvider", function ($compileProvider) {
                    $compileProvider.debugInfoEnabled(!0)
                }]), modules.unshift("ng");
                var injector = createInjector(modules, config.strictDi);
                return injector.invoke(["$rootScope", "$rootElement", "$compile", "$injector", function (scope, element, compile, injector) {
                    scope.$apply(function () {
                        element.data("$injector", injector), compile(element)(scope)
                    })
                }]), injector
            }, NG_ENABLE_DEBUG_INFO = /^NG_ENABLE_DEBUG_INFO!/, NG_DEFER_BOOTSTRAP = /^NG_DEFER_BOOTSTRAP!/;
            return window && NG_ENABLE_DEBUG_INFO.test(window.name) && (config.debugInfoEnabled = !0, window.name = window.name.replace(NG_ENABLE_DEBUG_INFO, "")), window && !NG_DEFER_BOOTSTRAP.test(window.name) ? doBootstrap() : (window.name = window.name.replace(NG_DEFER_BOOTSTRAP, ""), void(angular.resumeBootstrap = function (extraModules) {
                forEach(extraModules, function (module) {
                    modules.push(module)
                }), doBootstrap()
            }))
        }

        function reloadWithDebugInfo() {
            window.name = "NG_ENABLE_DEBUG_INFO!" + window.name, window.location.reload()
        }

        function getTestability(rootElement) {
            var injector = angular.element(rootElement).injector();
            if (!injector)throw ngMinErr("test", "no injector found for element argument to getTestability");
            return injector.get("$$testability")
        }

        function snake_case(name, separator) {
            return separator = separator || "_", name.replace(SNAKE_CASE_REGEXP, function (letter, pos) {
                return (pos ? separator : "") + letter.toLowerCase()
            })
        }

        function bindJQuery() {
            var originalCleanData;
            bindJQueryFired || (jQuery = window.jQuery, jQuery && jQuery.fn.on ? (jqLite = jQuery, extend(jQuery.fn, {
                scope: JQLitePrototype.scope,
                isolateScope: JQLitePrototype.isolateScope,
                controller: JQLitePrototype.controller,
                injector: JQLitePrototype.injector,
                inheritedData: JQLitePrototype.inheritedData
            }), originalCleanData = jQuery.cleanData, jQuery.cleanData = function (elems) {
                var events;
                if (skipDestroyOnNextJQueryCleanData)skipDestroyOnNextJQueryCleanData = !1; else for (var elem, i = 0; null != (elem = elems[i]); i++)events = jQuery._data(elem, "events"), events && events.$destroy && jQuery(elem).triggerHandler("$destroy");
                originalCleanData(elems)
            }) : jqLite = JQLite, angular.element = jqLite, bindJQueryFired = !0)
        }

        function assertArg(arg, name, reason) {
            if (!arg)throw ngMinErr("areq", "Argument '{0}' is {1}", name || "?", reason || "required");
            return arg
        }

        function assertArgFn(arg, name, acceptArrayAnnotation) {
            return acceptArrayAnnotation && isArray(arg) && (arg = arg[arg.length - 1]), assertArg(isFunction(arg), name, "not a function, got " + (arg && "object" == typeof arg ? arg.constructor.name || "Object" : typeof arg)), arg
        }

        function assertNotHasOwnProperty(name, context) {
            if ("hasOwnProperty" === name)throw ngMinErr("badname", "hasOwnProperty is not a valid {0} name", context)
        }

        function getter(obj, path, bindFnToScope) {
            if (!path)return obj;
            for (var key, keys = path.split("."), lastInstance = obj, len = keys.length, i = 0; len > i; i++)key = keys[i], obj && (obj = (lastInstance = obj)[key]);
            return !bindFnToScope && isFunction(obj) ? bind(lastInstance, obj) : obj
        }

        function getBlockNodes(nodes) {
            var node = nodes[0], endNode = nodes[nodes.length - 1], blockNodes = [node];
            do {
                if (node = node.nextSibling, !node)break;
                blockNodes.push(node)
            } while (node !== endNode);
            return jqLite(blockNodes)
        }

        function createMap() {
            return Object.create(null)
        }

        function setupModuleLoader(window) {
            function ensure(obj, name, factory) {
                return obj[name] || (obj[name] = factory())
            }

            var $injectorMinErr = minErr("$injector"), ngMinErr = minErr("ng"), angular = ensure(window, "angular", Object);
            return angular.$$minErr = angular.$$minErr || minErr, ensure(angular, "module", function () {
                var modules = {};
                return function (name, requires, configFn) {
                    var assertNotHasOwnProperty = function (name, context) {
                        if ("hasOwnProperty" === name)throw ngMinErr("badname", "hasOwnProperty is not a valid {0} name", context)
                    };
                    return assertNotHasOwnProperty(name, "module"), requires && modules.hasOwnProperty(name) && (modules[name] = null), ensure(modules, name, function () {
                        function invokeLater(provider, method, insertMethod, queue) {
                            return queue || (queue = invokeQueue), function () {
                                return queue[insertMethod || "push"]([provider, method, arguments]), moduleInstance
                            }
                        }

                        if (!requires)throw $injectorMinErr("nomod", "Module '{0}' is not available! You either misspelled the module name or forgot to load it. If registering a module ensure that you specify the dependencies as the second argument.", name);
                        var invokeQueue = [], configBlocks = [], runBlocks = [], config = invokeLater("$injector", "invoke", "push", configBlocks), moduleInstance = {
                            _invokeQueue: invokeQueue,
                            _configBlocks: configBlocks,
                            _runBlocks: runBlocks,
                            requires: requires,
                            name: name,
                            provider: invokeLater("$provide", "provider"),
                            factory: invokeLater("$provide", "factory"),
                            service: invokeLater("$provide", "service"),
                            value: invokeLater("$provide", "value"),
                            constant: invokeLater("$provide", "constant", "unshift"),
                            animation: invokeLater("$animateProvider", "register"),
                            filter: invokeLater("$filterProvider", "register"),
                            controller: invokeLater("$controllerProvider", "register"),
                            directive: invokeLater("$compileProvider", "directive"),
                            config: config,
                            run: function (block) {
                                return runBlocks.push(block), this
                            }
                        };
                        return configFn && config(configFn), moduleInstance
                    })
                }
            })
        }

        function serializeObject(obj) {
            var seen = [];
            return JSON.stringify(obj, function (key, val) {
                if (val = toJsonReplacer(key, val), isObject(val)) {
                    if (seen.indexOf(val) >= 0)return "<<already seen>>";
                    seen.push(val)
                }
                return val
            })
        }

        function toDebugString(obj) {
            return "function" == typeof obj ? obj.toString().replace(/ \{[\s\S]*$/, "") : "undefined" == typeof obj ? "undefined" : "string" != typeof obj ? serializeObject(obj) : obj
        }

        function publishExternalAPI(angular) {
            extend(angular, {
                bootstrap: bootstrap,
                copy: copy,
                extend: extend,
                equals: equals,
                element: jqLite,
                forEach: forEach,
                injector: createInjector,
                noop: noop,
                bind: bind,
                toJson: toJson,
                fromJson: fromJson,
                identity: identity,
                isUndefined: isUndefined,
                isDefined: isDefined,
                isString: isString,
                isFunction: isFunction,
                isObject: isObject,
                isNumber: isNumber,
                isElement: isElement,
                isArray: isArray,
                version: version,
                isDate: isDate,
                lowercase: lowercase,
                uppercase: uppercase,
                callbacks: {counter: 0},
                getTestability: getTestability,
                $$minErr: minErr,
                $$csp: csp,
                reloadWithDebugInfo: reloadWithDebugInfo
            }), angularModule = setupModuleLoader(window);
            try {
                angularModule("ngLocale")
            } catch (e) {
                angularModule("ngLocale", []).provider("$locale", $LocaleProvider)
            }
            angularModule("ng", ["ngLocale"], ["$provide", function ($provide) {
                $provide.provider({$$sanitizeUri: $$SanitizeUriProvider}), $provide.provider("$compile", $CompileProvider).directive({
                    a: htmlAnchorDirective,
                    input: inputDirective,
                    textarea: inputDirective,
                    form: formDirective,
                    script: scriptDirective,
                    select: selectDirective,
                    style: styleDirective,
                    option: optionDirective,
                    ngBind: ngBindDirective,
                    ngBindHtml: ngBindHtmlDirective,
                    ngBindTemplate: ngBindTemplateDirective,
                    ngClass: ngClassDirective,
                    ngClassEven: ngClassEvenDirective,
                    ngClassOdd: ngClassOddDirective,
                    ngCloak: ngCloakDirective,
                    ngController: ngControllerDirective,
                    ngForm: ngFormDirective,
                    ngHide: ngHideDirective,
                    ngIf: ngIfDirective,
                    ngInclude: ngIncludeDirective,
                    ngInit: ngInitDirective,
                    ngNonBindable: ngNonBindableDirective,
                    ngPluralize: ngPluralizeDirective,
                    ngRepeat: ngRepeatDirective,
                    ngShow: ngShowDirective,
                    ngStyle: ngStyleDirective,
                    ngSwitch: ngSwitchDirective,
                    ngSwitchWhen: ngSwitchWhenDirective,
                    ngSwitchDefault: ngSwitchDefaultDirective,
                    ngOptions: ngOptionsDirective,
                    ngTransclude: ngTranscludeDirective,
                    ngModel: ngModelDirective,
                    ngList: ngListDirective,
                    ngChange: ngChangeDirective,
                    pattern: patternDirective,
                    ngPattern: patternDirective,
                    required: requiredDirective,
                    ngRequired: requiredDirective,
                    minlength: minlengthDirective,
                    ngMinlength: minlengthDirective,
                    maxlength: maxlengthDirective,
                    ngMaxlength: maxlengthDirective,
                    ngValue: ngValueDirective,
                    ngModelOptions: ngModelOptionsDirective
                }).directive({ngInclude: ngIncludeFillContentDirective}).directive(ngAttributeAliasDirectives).directive(ngEventDirectives), $provide.provider({
                    $anchorScroll: $AnchorScrollProvider,
                    $animate: $AnimateProvider,
                    $browser: $BrowserProvider,
                    $cacheFactory: $CacheFactoryProvider,
                    $controller: $ControllerProvider,
                    $document: $DocumentProvider,
                    $exceptionHandler: $ExceptionHandlerProvider,
                    $filter: $FilterProvider,
                    $interpolate: $InterpolateProvider,
                    $interval: $IntervalProvider,
                    $http: $HttpProvider,
                    $httpBackend: $HttpBackendProvider,
                    $location: $LocationProvider,
                    $log: $LogProvider,
                    $parse: $ParseProvider,
                    $rootScope: $RootScopeProvider,
                    $q: $QProvider,
                    $$q: $$QProvider,
                    $sce: $SceProvider,
                    $sceDelegate: $SceDelegateProvider,
                    $sniffer: $SnifferProvider,
                    $templateCache: $TemplateCacheProvider,
                    $templateRequest: $TemplateRequestProvider,
                    $$testability: $$TestabilityProvider,
                    $timeout: $TimeoutProvider,
                    $window: $WindowProvider,
                    $$rAF: $$RAFProvider,
                    $$asyncCallback: $$AsyncCallbackProvider,
                    $$jqLite: $$jqLiteProvider
                })
            }])
        }

        function jqNextId() {
            return ++jqId
        }

        function camelCase(name) {
            return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
                return offset ? letter.toUpperCase() : letter
            }).replace(MOZ_HACK_REGEXP, "Moz$1")
        }

        function jqLiteIsTextNode(html) {
            return !HTML_REGEXP.test(html)
        }

        function jqLiteAcceptsData(node) {
            var nodeType = node.nodeType;
            return nodeType === NODE_TYPE_ELEMENT || !nodeType || nodeType === NODE_TYPE_DOCUMENT
        }

        function jqLiteBuildFragment(html, context) {
            var tmp, tag, wrap, i, fragment = context.createDocumentFragment(), nodes = [];
            if (jqLiteIsTextNode(html))nodes.push(context.createTextNode(html)); else {
                for (tmp = tmp || fragment.appendChild(context.createElement("div")), tag = (TAG_NAME_REGEXP.exec(html) || ["", ""])[1].toLowerCase(), wrap = wrapMap[tag] || wrapMap._default, tmp.innerHTML = wrap[1] + html.replace(XHTML_TAG_REGEXP, "<$1></$2>") + wrap[2], i = wrap[0]; i--;)tmp = tmp.lastChild;
                nodes = concat(nodes, tmp.childNodes), tmp = fragment.firstChild, tmp.textContent = ""
            }
            return fragment.textContent = "", fragment.innerHTML = "", forEach(nodes, function (node) {
                fragment.appendChild(node)
            }), fragment
        }

        function jqLiteParseHTML(html, context) {
            context = context || document;
            var parsed;
            return (parsed = SINGLE_TAG_REGEXP.exec(html)) ? [context.createElement(parsed[1])] : (parsed = jqLiteBuildFragment(html, context)) ? parsed.childNodes : []
        }

        function JQLite(element) {
            if (element instanceof JQLite)return element;
            var argIsString;
            if (isString(element) && (element = trim(element), argIsString = !0), !(this instanceof JQLite)) {
                if (argIsString && "<" != element.charAt(0))throw jqLiteMinErr("nosel", "Looking up elements via selectors is not supported by jqLite! See: http://docs.angularjs.org/api/angular.element");
                return new JQLite(element)
            }
            argIsString ? jqLiteAddNodes(this, jqLiteParseHTML(element)) : jqLiteAddNodes(this, element)
        }

        function jqLiteClone(element) {
            return element.cloneNode(!0)
        }

        function jqLiteDealoc(element, onlyDescendants) {
            if (onlyDescendants || jqLiteRemoveData(element), element.querySelectorAll)for (var descendants = element.querySelectorAll("*"), i = 0, l = descendants.length; l > i; i++)jqLiteRemoveData(descendants[i])
        }

        function jqLiteOff(element, type, fn, unsupported) {
            if (isDefined(unsupported))throw jqLiteMinErr("offargs", "jqLite#off() does not support the `selector` argument");
            var expandoStore = jqLiteExpandoStore(element), events = expandoStore && expandoStore.events, handle = expandoStore && expandoStore.handle;
            if (handle)if (type)forEach(type.split(" "), function (type) {
                if (isDefined(fn)) {
                    var listenerFns = events[type];
                    if (arrayRemove(listenerFns || [], fn), listenerFns && listenerFns.length > 0)return
                }
                removeEventListenerFn(element, type, handle), delete events[type]
            }); else for (type in events)"$destroy" !== type && removeEventListenerFn(element, type, handle), delete events[type]
        }

        function jqLiteRemoveData(element, name) {
            var expandoId = element.ng339, expandoStore = expandoId && jqCache[expandoId];
            if (expandoStore) {
                if (name)return void delete expandoStore.data[name];
                expandoStore.handle && (expandoStore.events.$destroy && expandoStore.handle({}, "$destroy"), jqLiteOff(element)), delete jqCache[expandoId], element.ng339 = undefined
            }
        }

        function jqLiteExpandoStore(element, createIfNecessary) {
            var expandoId = element.ng339, expandoStore = expandoId && jqCache[expandoId];
            return createIfNecessary && !expandoStore && (element.ng339 = expandoId = jqNextId(), expandoStore = jqCache[expandoId] = {
                events: {},
                data: {},
                handle: undefined
            }), expandoStore
        }

        function jqLiteData(element, key, value) {
            if (jqLiteAcceptsData(element)) {
                var isSimpleSetter = isDefined(value), isSimpleGetter = !isSimpleSetter && key && !isObject(key), massGetter = !key, expandoStore = jqLiteExpandoStore(element, !isSimpleGetter), data = expandoStore && expandoStore.data;
                if (isSimpleSetter)data[key] = value; else {
                    if (massGetter)return data;
                    if (isSimpleGetter)return data && data[key];
                    extend(data, key)
                }
            }
        }

        function jqLiteHasClass(element, selector) {
            return element.getAttribute ? (" " + (element.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ").indexOf(" " + selector + " ") > -1 : !1
        }

        function jqLiteRemoveClass(element, cssClasses) {
            cssClasses && element.setAttribute && forEach(cssClasses.split(" "), function (cssClass) {
                element.setAttribute("class", trim((" " + (element.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ").replace(" " + trim(cssClass) + " ", " ")))
            })
        }

        function jqLiteAddClass(element, cssClasses) {
            if (cssClasses && element.setAttribute) {
                var existingClasses = (" " + (element.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ");
                forEach(cssClasses.split(" "), function (cssClass) {
                    cssClass = trim(cssClass), -1 === existingClasses.indexOf(" " + cssClass + " ") && (existingClasses += cssClass + " ")
                }), element.setAttribute("class", trim(existingClasses))
            }
        }

        function jqLiteAddNodes(root, elements) {
            if (elements)if (elements.nodeType)root[root.length++] = elements; else {
                var length = elements.length;
                if ("number" == typeof length && elements.window !== elements) {
                    if (length)for (var i = 0; length > i; i++)root[root.length++] = elements[i]
                } else root[root.length++] = elements
            }
        }

        function jqLiteController(element, name) {
            return jqLiteInheritedData(element, "$" + (name || "ngController") + "Controller")
        }

        function jqLiteInheritedData(element, name, value) {
            element.nodeType == NODE_TYPE_DOCUMENT && (element = element.documentElement);
            for (var names = isArray(name) ? name : [name]; element;) {
                for (var i = 0, ii = names.length; ii > i; i++)if ((value = jqLite.data(element, names[i])) !== undefined)return value;
                element = element.parentNode || element.nodeType === NODE_TYPE_DOCUMENT_FRAGMENT && element.host
            }
        }

        function jqLiteEmpty(element) {
            for (jqLiteDealoc(element, !0); element.firstChild;)element.removeChild(element.firstChild)
        }

        function jqLiteRemove(element, keepData) {
            keepData || jqLiteDealoc(element);
            var parent = element.parentNode;
            parent && parent.removeChild(element)
        }

        function jqLiteDocumentLoaded(action, win) {
            win = win || window, "complete" === win.document.readyState ? win.setTimeout(action) : jqLite(win).on("load", action)
        }

        function getBooleanAttrName(element, name) {
            var booleanAttr = BOOLEAN_ATTR[name.toLowerCase()];
            return booleanAttr && BOOLEAN_ELEMENTS[nodeName_(element)] && booleanAttr
        }

        function getAliasedAttrName(element, name) {
            var nodeName = element.nodeName;
            return ("INPUT" === nodeName || "TEXTAREA" === nodeName) && ALIASED_ATTR[name]
        }

        function createEventHandler(element, events) {
            var eventHandler = function (event, type) {
                event.isDefaultPrevented = function () {
                    return event.defaultPrevented
                };
                var eventFns = events[type || event.type], eventFnsLength = eventFns ? eventFns.length : 0;
                if (eventFnsLength) {
                    if (isUndefined(event.immediatePropagationStopped)) {
                        var originalStopImmediatePropagation = event.stopImmediatePropagation;
                        event.stopImmediatePropagation = function () {
                            event.immediatePropagationStopped = !0, event.stopPropagation && event.stopPropagation(), originalStopImmediatePropagation && originalStopImmediatePropagation.call(event)
                        }
                    }
                    event.isImmediatePropagationStopped = function () {
                        return event.immediatePropagationStopped === !0
                    }, eventFnsLength > 1 && (eventFns = shallowCopy(eventFns));
                    for (var i = 0; eventFnsLength > i; i++)event.isImmediatePropagationStopped() || eventFns[i].call(element, event)
                }
            };
            return eventHandler.elem = element, eventHandler
        }

        function $$jqLiteProvider() {
            this.$get = function () {
                return extend(JQLite, {
                    hasClass: function (node, classes) {
                        return node.attr && (node = node[0]), jqLiteHasClass(node, classes)
                    }, addClass: function (node, classes) {
                        return node.attr && (node = node[0]), jqLiteAddClass(node, classes)
                    }, removeClass: function (node, classes) {
                        return node.attr && (node = node[0]), jqLiteRemoveClass(node, classes)
                    }
                })
            }
        }

        function hashKey(obj, nextUidFn) {
            var key = obj && obj.$$hashKey;
            if (key)return "function" == typeof key && (key = obj.$$hashKey()), key;
            var objType = typeof obj;
            return key = "function" == objType || "object" == objType && null !== obj ? obj.$$hashKey = objType + ":" + (nextUidFn || nextUid)() : objType + ":" + obj
        }

        function HashMap(array, isolatedUid) {
            if (isolatedUid) {
                var uid = 0;
                this.nextUid = function () {
                    return ++uid
                }
            }
            forEach(array, this.put, this)
        }

        function anonFn(fn) {
            var fnText = fn.toString().replace(STRIP_COMMENTS, ""), args = fnText.match(FN_ARGS);
            return args ? "function(" + (args[1] || "").replace(/[\s\r\n]+/, " ") + ")" : "fn"
        }

        function annotate(fn, strictDi, name) {
            var $inject, fnText, argDecl, last;
            if ("function" == typeof fn) {
                if (!($inject = fn.$inject)) {
                    if ($inject = [], fn.length) {
                        if (strictDi)throw isString(name) && name || (name = fn.name || anonFn(fn)), $injectorMinErr("strictdi", "{0} is not using explicit annotation and cannot be invoked in strict mode", name);
                        fnText = fn.toString().replace(STRIP_COMMENTS, ""), argDecl = fnText.match(FN_ARGS), forEach(argDecl[1].split(FN_ARG_SPLIT), function (arg) {
                            arg.replace(FN_ARG, function (all, underscore, name) {
                                $inject.push(name)
                            })
                        })
                    }
                    fn.$inject = $inject
                }
            } else isArray(fn) ? (last = fn.length - 1, assertArgFn(fn[last], "fn"), $inject = fn.slice(0, last)) : assertArgFn(fn, "fn", !0);
            return $inject
        }

        function createInjector(modulesToLoad, strictDi) {
            function supportObject(delegate) {
                return function (key, value) {
                    return isObject(key) ? void forEach(key, reverseParams(delegate)) : delegate(key, value)
                }
            }

            function provider(name, provider_) {
                if (assertNotHasOwnProperty(name, "service"), (isFunction(provider_) || isArray(provider_)) && (provider_ = providerInjector.instantiate(provider_)), !provider_.$get)throw $injectorMinErr("pget", "Provider '{0}' must define $get factory method.", name);
                return providerCache[name + providerSuffix] = provider_
            }

            function enforceReturnValue(name, factory) {
                return function () {
                    var result = instanceInjector.invoke(factory, this);
                    if (isUndefined(result))throw $injectorMinErr("undef", "Provider '{0}' must return a value from $get factory method.", name);
                    return result
                }
            }

            function factory(name, factoryFn, enforce) {
                return provider(name, {$get: enforce !== !1 ? enforceReturnValue(name, factoryFn) : factoryFn})
            }

            function service(name, constructor) {
                return factory(name, ["$injector", function ($injector) {
                    return $injector.instantiate(constructor)
                }])
            }

            function value(name, val) {
                return factory(name, valueFn(val), !1)
            }

            function constant(name, value) {
                assertNotHasOwnProperty(name, "constant"), providerCache[name] = value, instanceCache[name] = value
            }

            function decorator(serviceName, decorFn) {
                var origProvider = providerInjector.get(serviceName + providerSuffix), orig$get = origProvider.$get;
                origProvider.$get = function () {
                    var origInstance = instanceInjector.invoke(orig$get, origProvider);
                    return instanceInjector.invoke(decorFn, null, {$delegate: origInstance})
                }
            }

            function loadModules(modulesToLoad) {
                var moduleFn, runBlocks = [];
                return forEach(modulesToLoad, function (module) {
                    function runInvokeQueue(queue) {
                        var i, ii;
                        for (i = 0, ii = queue.length; ii > i; i++) {
                            var invokeArgs = queue[i], provider = providerInjector.get(invokeArgs[0]);
                            provider[invokeArgs[1]].apply(provider, invokeArgs[2])
                        }
                    }

                    if (!loadedModules.get(module)) {
                        loadedModules.put(module, !0);
                        try {
                            isString(module) ? (moduleFn = angularModule(module), runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks), runInvokeQueue(moduleFn._invokeQueue), runInvokeQueue(moduleFn._configBlocks)) : isFunction(module) ? runBlocks.push(providerInjector.invoke(module)) : isArray(module) ? runBlocks.push(providerInjector.invoke(module)) : assertArgFn(module, "module")
                        } catch (e) {
                            throw isArray(module) && (module = module[module.length - 1]), e.message && e.stack && -1 == e.stack.indexOf(e.message) && (e = e.message + "\n" + e.stack), $injectorMinErr("modulerr", "Failed to instantiate module {0} due to:\n{1}", module, e.stack || e.message || e)
                        }
                    }
                }), runBlocks
            }

            function createInternalInjector(cache, factory) {
                function getService(serviceName, caller) {
                    if (cache.hasOwnProperty(serviceName)) {
                        if (cache[serviceName] === INSTANTIATING)throw $injectorMinErr("cdep", "Circular dependency found: {0}", serviceName + " <- " + path.join(" <- "));
                        return cache[serviceName]
                    }
                    try {
                        return path.unshift(serviceName), cache[serviceName] = INSTANTIATING, cache[serviceName] = factory(serviceName, caller)
                    } catch (err) {
                        throw cache[serviceName] === INSTANTIATING && delete cache[serviceName], err
                    } finally {
                        path.shift()
                    }
                }

                function invoke(fn, self, locals, serviceName) {
                    "string" == typeof locals && (serviceName = locals, locals = null);
                    var length, i, key, args = [], $inject = annotate(fn, strictDi, serviceName);
                    for (i = 0, length = $inject.length; length > i; i++) {
                        if (key = $inject[i], "string" != typeof key)throw $injectorMinErr("itkn", "Incorrect injection token! Expected service name as string, got {0}", key);
                        args.push(locals && locals.hasOwnProperty(key) ? locals[key] : getService(key, serviceName))
                    }
                    return isArray(fn) && (fn = fn[length]), fn.apply(self, args)
                }

                function instantiate(Type, locals, serviceName) {
                    var instance = Object.create((isArray(Type) ? Type[Type.length - 1] : Type).prototype), returnedValue = invoke(Type, instance, locals, serviceName);
                    return isObject(returnedValue) || isFunction(returnedValue) ? returnedValue : instance
                }

                return {
                    invoke: invoke,
                    instantiate: instantiate,
                    get: getService,
                    annotate: annotate,
                    has: function (name) {
                        return providerCache.hasOwnProperty(name + providerSuffix) || cache.hasOwnProperty(name)
                    }
                }
            }

            strictDi = strictDi === !0;
            var INSTANTIATING = {}, providerSuffix = "Provider", path = [], loadedModules = new HashMap([], !0), providerCache = {
                $provide: {
                    provider: supportObject(provider),
                    factory: supportObject(factory),
                    service: supportObject(service),
                    value: supportObject(value),
                    constant: supportObject(constant),
                    decorator: decorator
                }
            }, providerInjector = providerCache.$injector = createInternalInjector(providerCache, function (serviceName, caller) {
                throw angular.isString(caller) && path.push(caller), $injectorMinErr("unpr", "Unknown provider: {0}", path.join(" <- "))
            }), instanceCache = {}, instanceInjector = instanceCache.$injector = createInternalInjector(instanceCache, function (serviceName, caller) {
                var provider = providerInjector.get(serviceName + providerSuffix, caller);
                return instanceInjector.invoke(provider.$get, provider, undefined, serviceName)
            });
            return forEach(loadModules(modulesToLoad), function (fn) {
                instanceInjector.invoke(fn || noop)
            }), instanceInjector
        }

        function $AnchorScrollProvider() {
            var autoScrollingEnabled = !0;
            this.disableAutoScrolling = function () {
                autoScrollingEnabled = !1
            }, this.$get = ["$window", "$location", "$rootScope", function ($window, $location, $rootScope) {
                function getFirstAnchor(list) {
                    var result = null;
                    return Array.prototype.some.call(list, function (element) {
                        return "a" === nodeName_(element) ? (result = element, !0) : void 0
                    }), result
                }

                function getYOffset() {
                    var offset = scroll.yOffset;
                    if (isFunction(offset))offset = offset(); else if (isElement(offset)) {
                        var elem = offset[0], style = $window.getComputedStyle(elem);
                        offset = "fixed" !== style.position ? 0 : elem.getBoundingClientRect().bottom
                    } else isNumber(offset) || (offset = 0);
                    return offset
                }

                function scrollTo(elem) {
                    if (elem) {
                        elem.scrollIntoView();
                        var offset = getYOffset();
                        if (offset) {
                            var elemTop = elem.getBoundingClientRect().top;
                            $window.scrollBy(0, elemTop - offset)
                        }
                    } else $window.scrollTo(0, 0)
                }

                function scroll() {
                    var elm, hash = $location.hash();
                    hash ? (elm = document.getElementById(hash)) ? scrollTo(elm) : (elm = getFirstAnchor(document.getElementsByName(hash))) ? scrollTo(elm) : "top" === hash && scrollTo(null) : scrollTo(null)
                }

                var document = $window.document;
                return autoScrollingEnabled && $rootScope.$watch(function () {
                    return $location.hash()
                }, function (newVal, oldVal) {
                    (newVal !== oldVal || "" !== newVal) && jqLiteDocumentLoaded(function () {
                        $rootScope.$evalAsync(scroll)
                    })
                }), scroll
            }]
        }

        function $$AsyncCallbackProvider() {
            this.$get = ["$$rAF", "$timeout", function ($$rAF, $timeout) {
                return $$rAF.supported ? function (fn) {
                    return $$rAF(fn)
                } : function (fn) {
                    return $timeout(fn, 0, !1)
                }
            }]
        }

        function Browser(window, document, $log, $sniffer) {
            function completeOutstandingRequest(fn) {
                try {
                    fn.apply(null, sliceArgs(arguments, 1))
                } finally {
                    if (outstandingRequestCount--, 0 === outstandingRequestCount)for (; outstandingRequestCallbacks.length;)try {
                        outstandingRequestCallbacks.pop()()
                    } catch (e) {
                        $log.error(e)
                    }
                }
            }

            function getHash(url) {
                var index = url.indexOf("#");
                return -1 === index ? "" : url.substr(index + 1)
            }

            function startPoller(interval, setTimeout) {
                !function check() {
                    forEach(pollFns, function (pollFn) {
                        pollFn()
                    }), pollTimeout = setTimeout(check, interval)
                }()
            }

            function cacheStateAndFireUrlChange() {
                cacheState(), fireUrlChange()
            }

            function cacheState() {
                cachedState = window.history.state, cachedState = isUndefined(cachedState) ? null : cachedState, equals(cachedState, lastCachedState) && (cachedState = lastCachedState), lastCachedState = cachedState
            }

            function fireUrlChange() {
                (lastBrowserUrl !== self.url() || lastHistoryState !== cachedState) && (lastBrowserUrl = self.url(), lastHistoryState = cachedState, forEach(urlChangeListeners, function (listener) {
                    listener(self.url(), cachedState)
                }))
            }

            function safeDecodeURIComponent(str) {
                try {
                    return decodeURIComponent(str)
                } catch (e) {
                    return str
                }
            }

            var self = this, rawDocument = document[0], location = window.location, history = window.history, setTimeout = window.setTimeout, clearTimeout = window.clearTimeout, pendingDeferIds = {};
            self.isMock = !1;
            var outstandingRequestCount = 0, outstandingRequestCallbacks = [];
            self.$$completeOutstandingRequest = completeOutstandingRequest, self.$$incOutstandingRequestCount = function () {
                outstandingRequestCount++
            }, self.notifyWhenNoOutstandingRequests = function (callback) {
                forEach(pollFns, function (pollFn) {
                    pollFn()
                }), 0 === outstandingRequestCount ? callback() : outstandingRequestCallbacks.push(callback)
            };
            var pollTimeout, pollFns = [];
            self.addPollFn = function (fn) {
                return isUndefined(pollTimeout) && startPoller(100, setTimeout), pollFns.push(fn), fn
            };
            var cachedState, lastHistoryState, lastBrowserUrl = location.href, baseElement = document.find("base"), reloadLocation = null;
            cacheState(), lastHistoryState = cachedState, self.url = function (url, replace, state) {
                if (isUndefined(state) && (state = null), location !== window.location && (location = window.location), history !== window.history && (history = window.history), url) {
                    var sameState = lastHistoryState === state;
                    if (lastBrowserUrl === url && (!$sniffer.history || sameState))return self;
                    var sameBase = lastBrowserUrl && stripHash(lastBrowserUrl) === stripHash(url);
                    return lastBrowserUrl = url, lastHistoryState = state, !$sniffer.history || sameBase && sameState ? (sameBase || (reloadLocation = url), replace ? location.replace(url) : sameBase ? location.hash = getHash(url) : location.href = url) : (history[replace ? "replaceState" : "pushState"](state, "", url), cacheState(), lastHistoryState = cachedState), self
                }
                return reloadLocation || location.href.replace(/%27/g, "'")
            }, self.state = function () {
                return cachedState
            };
            var urlChangeListeners = [], urlChangeInit = !1, lastCachedState = null;
            self.onUrlChange = function (callback) {
                return urlChangeInit || ($sniffer.history && jqLite(window).on("popstate", cacheStateAndFireUrlChange), jqLite(window).on("hashchange", cacheStateAndFireUrlChange), urlChangeInit = !0), urlChangeListeners.push(callback), callback
            }, self.$$checkUrlChange = fireUrlChange, self.baseHref = function () {
                var href = baseElement.attr("href");
                return href ? href.replace(/^(https?\:)?\/\/[^\/]*/, "") : ""
            };
            var lastCookies = {}, lastCookieString = "", cookiePath = self.baseHref();
            self.cookies = function (name, value) {
                var cookieLength, cookieArray, cookie, i, index;
                if (!name) {
                    if (rawDocument.cookie !== lastCookieString)for (lastCookieString = rawDocument.cookie, cookieArray = lastCookieString.split("; "), lastCookies = {}, i = 0; i < cookieArray.length; i++)cookie = cookieArray[i], index = cookie.indexOf("="), index > 0 && (name = safeDecodeURIComponent(cookie.substring(0, index)), lastCookies[name] === undefined && (lastCookies[name] = safeDecodeURIComponent(cookie.substring(index + 1))));
                    return lastCookies
                }
                value === undefined ? rawDocument.cookie = encodeURIComponent(name) + "=;path=" + cookiePath + ";expires=Thu, 01 Jan 1970 00:00:00 GMT" : isString(value) && (cookieLength = (rawDocument.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + ";path=" + cookiePath).length + 1, cookieLength > 4096 && $log.warn("Cookie '" + name + "' possibly not set or overflowed because it was too large (" + cookieLength + " > 4096 bytes)!"))
            }, self.defer = function (fn, delay) {
                var timeoutId;
                return outstandingRequestCount++, timeoutId = setTimeout(function () {
                    delete pendingDeferIds[timeoutId], completeOutstandingRequest(fn)
                }, delay || 0), pendingDeferIds[timeoutId] = !0, timeoutId
            }, self.defer.cancel = function (deferId) {
                return pendingDeferIds[deferId] ? (delete pendingDeferIds[deferId], clearTimeout(deferId), completeOutstandingRequest(noop), !0) : !1
            }
        }

        function $BrowserProvider() {
            this.$get = ["$window", "$log", "$sniffer", "$document", function ($window, $log, $sniffer, $document) {
                return new Browser($window, $document, $log, $sniffer)
            }]
        }

        function $CacheFactoryProvider() {
            this.$get = function () {
                function cacheFactory(cacheId, options) {
                    function refresh(entry) {
                        entry != freshEnd && (staleEnd ? staleEnd == entry && (staleEnd = entry.n) : staleEnd = entry, link(entry.n, entry.p), link(entry, freshEnd), freshEnd = entry, freshEnd.n = null)
                    }

                    function link(nextEntry, prevEntry) {
                        nextEntry != prevEntry && (nextEntry && (nextEntry.p = prevEntry), prevEntry && (prevEntry.n = nextEntry))
                    }

                    if (cacheId in caches)throw minErr("$cacheFactory")("iid", "CacheId '{0}' is already taken!", cacheId);
                    var size = 0, stats = extend({}, options, {id: cacheId}), data = {}, capacity = options && options.capacity || Number.MAX_VALUE, lruHash = {}, freshEnd = null, staleEnd = null;
                    return caches[cacheId] = {
                        put: function (key, value) {
                            if (capacity < Number.MAX_VALUE) {
                                var lruEntry = lruHash[key] || (lruHash[key] = {key: key});
                                refresh(lruEntry)
                            }
                            if (!isUndefined(value))return key in data || size++, data[key] = value, size > capacity && this.remove(staleEnd.key), value
                        }, get: function (key) {
                            if (capacity < Number.MAX_VALUE) {
                                var lruEntry = lruHash[key];
                                if (!lruEntry)return;
                                refresh(lruEntry)
                            }
                            return data[key]
                        }, remove: function (key) {
                            if (capacity < Number.MAX_VALUE) {
                                var lruEntry = lruHash[key];
                                if (!lruEntry)return;
                                lruEntry == freshEnd && (freshEnd = lruEntry.p), lruEntry == staleEnd && (staleEnd = lruEntry.n), link(lruEntry.n, lruEntry.p), delete lruHash[key]
                            }
                            delete data[key], size--
                        }, removeAll: function () {
                            data = {}, size = 0, lruHash = {}, freshEnd = staleEnd = null
                        }, destroy: function () {
                            data = null, stats = null, lruHash = null, delete caches[cacheId]
                        }, info: function () {
                            return extend({}, stats, {size: size})
                        }
                    }
                }

                var caches = {};
                return cacheFactory.info = function () {
                    var info = {};
                    return forEach(caches, function (cache, cacheId) {
                        info[cacheId] = cache.info()
                    }), info
                }, cacheFactory.get = function (cacheId) {
                    return caches[cacheId]
                }, cacheFactory
            }
        }

        function $TemplateCacheProvider() {
            this.$get = ["$cacheFactory", function ($cacheFactory) {
                return $cacheFactory("templates")
            }]
        }

        function $CompileProvider($provide, $$sanitizeUriProvider) {
            function parseIsolateBindings(scope, directiveName) {
                var LOCAL_REGEXP = /^\s*([@&]|=(\*?))(\??)\s*(\w*)\s*$/, bindings = {};
                return forEach(scope, function (definition, scopeName) {
                    var match = definition.match(LOCAL_REGEXP);
                    if (!match)throw $compileMinErr("iscp", "Invalid isolate scope definition for directive '{0}'. Definition: {... {1}: '{2}' ...}", directiveName, scopeName, definition);
                    bindings[scopeName] = {
                        mode: match[1][0],
                        collection: "*" === match[2],
                        optional: "?" === match[3],
                        attrName: match[4] || scopeName
                    }
                }), bindings
            }

            var hasDirectives = {}, Suffix = "Directive", COMMENT_DIRECTIVE_REGEXP = /^\s*directive\:\s*([\w\-]+)\s+(.*)$/, CLASS_DIRECTIVE_REGEXP = /(([\w\-]+)(?:\:([^;]+))?;?)/, ALL_OR_NOTHING_ATTRS = makeMap("ngSrc,ngSrcset,src,srcset"), REQUIRE_PREFIX_REGEXP = /^(?:(\^\^?)?(\?)?(\^\^?)?)?/, EVENT_HANDLER_ATTR_REGEXP = /^(on[a-z]+|formaction)$/;
            this.directive = function registerDirective(name, directiveFactory) {
                return assertNotHasOwnProperty(name, "directive"), isString(name) ? (assertArg(directiveFactory, "directiveFactory"), hasDirectives.hasOwnProperty(name) || (hasDirectives[name] = [], $provide.factory(name + Suffix, ["$injector", "$exceptionHandler", function ($injector, $exceptionHandler) {
                    var directives = [];
                    return forEach(hasDirectives[name], function (directiveFactory, index) {
                        try {
                            var directive = $injector.invoke(directiveFactory);
                            isFunction(directive) ? directive = {compile: valueFn(directive)} : !directive.compile && directive.link && (directive.compile = valueFn(directive.link)), directive.priority = directive.priority || 0, directive.index = index, directive.name = directive.name || name, directive.require = directive.require || directive.controller && directive.name, directive.restrict = directive.restrict || "EA", isObject(directive.scope) && (directive.$$isolateBindings = parseIsolateBindings(directive.scope, directive.name)), directives.push(directive)
                        } catch (e) {
                            $exceptionHandler(e)
                        }
                    }), directives
                }])), hasDirectives[name].push(directiveFactory)) : forEach(name, reverseParams(registerDirective)), this
            }, this.aHrefSanitizationWhitelist = function (regexp) {
                return isDefined(regexp) ? ($$sanitizeUriProvider.aHrefSanitizationWhitelist(regexp), this) : $$sanitizeUriProvider.aHrefSanitizationWhitelist()
            }, this.imgSrcSanitizationWhitelist = function (regexp) {
                return isDefined(regexp) ? ($$sanitizeUriProvider.imgSrcSanitizationWhitelist(regexp), this) : $$sanitizeUriProvider.imgSrcSanitizationWhitelist()
            };
            var debugInfoEnabled = !0;
            this.debugInfoEnabled = function (enabled) {
                return isDefined(enabled) ? (debugInfoEnabled = enabled, this) : debugInfoEnabled
            }, this.$get = ["$injector", "$interpolate", "$exceptionHandler", "$templateRequest", "$parse", "$controller", "$rootScope", "$document", "$sce", "$animate", "$$sanitizeUri", function ($injector, $interpolate, $exceptionHandler, $templateRequest, $parse, $controller, $rootScope, $document, $sce, $animate, $$sanitizeUri) {
                function safeAddClass($element, className) {
                    try {
                        $element.addClass(className)
                    } catch (e) {
                    }
                }

                function compile($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext) {
                    $compileNodes instanceof jqLite || ($compileNodes = jqLite($compileNodes)), forEach($compileNodes, function (node, index) {
                        node.nodeType == NODE_TYPE_TEXT && node.nodeValue.match(/\S+/) && ($compileNodes[index] = jqLite(node).wrap("<span></span>").parent()[0])
                    });
                    var compositeLinkFn = compileNodes($compileNodes, transcludeFn, $compileNodes, maxPriority, ignoreDirective, previousCompileContext);
                    compile.$$addScopeClass($compileNodes);
                    var namespace = null;
                    return function (scope, cloneConnectFn, options) {
                        assertArg(scope, "scope"), options = options || {};
                        var parentBoundTranscludeFn = options.parentBoundTranscludeFn, transcludeControllers = options.transcludeControllers, futureParentElement = options.futureParentElement;
                        parentBoundTranscludeFn && parentBoundTranscludeFn.$$boundTransclude && (parentBoundTranscludeFn = parentBoundTranscludeFn.$$boundTransclude), namespace || (namespace = detectNamespaceForChildElements(futureParentElement));
                        var $linkNode;
                        if ($linkNode = "html" !== namespace ? jqLite(wrapTemplate(namespace, jqLite("<div>").append($compileNodes).html())) : cloneConnectFn ? JQLitePrototype.clone.call($compileNodes) : $compileNodes, transcludeControllers)for (var controllerName in transcludeControllers)$linkNode.data("$" + controllerName + "Controller", transcludeControllers[controllerName].instance);
                        return compile.$$addScopeInfo($linkNode, scope), cloneConnectFn && cloneConnectFn($linkNode, scope), compositeLinkFn && compositeLinkFn(scope, $linkNode, $linkNode, parentBoundTranscludeFn), $linkNode
                    }
                }

                function detectNamespaceForChildElements(parentElement) {
                    var node = parentElement && parentElement[0];
                    return node && "foreignobject" !== nodeName_(node) && node.toString().match(/SVG/) ? "svg" : "html"
                }

                function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext) {
                    function compositeLinkFn(scope, nodeList, $rootElement, parentBoundTranscludeFn) {
                        var nodeLinkFn, childLinkFn, node, childScope, i, ii, idx, childBoundTranscludeFn, stableNodeList;
                        if (nodeLinkFnFound) {
                            var nodeListLength = nodeList.length;
                            for (stableNodeList = new Array(nodeListLength), i = 0; i < linkFns.length; i += 3)idx = linkFns[i], stableNodeList[idx] = nodeList[idx]
                        } else stableNodeList = nodeList;
                        for (i = 0, ii = linkFns.length; ii > i;)node = stableNodeList[linkFns[i++]], nodeLinkFn = linkFns[i++], childLinkFn = linkFns[i++], nodeLinkFn ? (nodeLinkFn.scope ? (childScope = scope.$new(), compile.$$addScopeInfo(jqLite(node), childScope)) : childScope = scope, childBoundTranscludeFn = nodeLinkFn.transcludeOnThisElement ? createBoundTranscludeFn(scope, nodeLinkFn.transclude, parentBoundTranscludeFn, nodeLinkFn.elementTranscludeOnThisElement) : !nodeLinkFn.templateOnThisElement && parentBoundTranscludeFn ? parentBoundTranscludeFn : !parentBoundTranscludeFn && transcludeFn ? createBoundTranscludeFn(scope, transcludeFn) : null, nodeLinkFn(childLinkFn, childScope, node, $rootElement, childBoundTranscludeFn)) : childLinkFn && childLinkFn(scope, node.childNodes, undefined, parentBoundTranscludeFn)
                    }

                    for (var attrs, directives, nodeLinkFn, childNodes, childLinkFn, linkFnFound, nodeLinkFnFound, linkFns = [], i = 0; i < nodeList.length; i++)attrs = new Attributes, directives = collectDirectives(nodeList[i], [], attrs, 0 === i ? maxPriority : undefined, ignoreDirective), nodeLinkFn = directives.length ? applyDirectivesToNode(directives, nodeList[i], attrs, transcludeFn, $rootElement, null, [], [], previousCompileContext) : null, nodeLinkFn && nodeLinkFn.scope && compile.$$addScopeClass(attrs.$$element), childLinkFn = nodeLinkFn && nodeLinkFn.terminal || !(childNodes = nodeList[i].childNodes) || !childNodes.length ? null : compileNodes(childNodes, nodeLinkFn ? (nodeLinkFn.transcludeOnThisElement || !nodeLinkFn.templateOnThisElement) && nodeLinkFn.transclude : transcludeFn), (nodeLinkFn || childLinkFn) && (linkFns.push(i, nodeLinkFn, childLinkFn), linkFnFound = !0, nodeLinkFnFound = nodeLinkFnFound || nodeLinkFn), previousCompileContext = null;
                    return linkFnFound ? compositeLinkFn : null
                }

                function createBoundTranscludeFn(scope, transcludeFn, previousBoundTranscludeFn) {
                    var boundTranscludeFn = function (transcludedScope, cloneFn, controllers, futureParentElement, containingScope) {
                        return transcludedScope || (transcludedScope = scope.$new(!1, containingScope), transcludedScope.$$transcluded = !0), transcludeFn(transcludedScope, cloneFn, {
                            parentBoundTranscludeFn: previousBoundTranscludeFn,
                            transcludeControllers: controllers,
                            futureParentElement: futureParentElement
                        })
                    };
                    return boundTranscludeFn
                }

                function collectDirectives(node, directives, attrs, maxPriority, ignoreDirective) {
                    var match, className, nodeType = node.nodeType, attrsMap = attrs.$attr;
                    switch (nodeType) {
                        case NODE_TYPE_ELEMENT:
                            addDirective(directives, directiveNormalize(nodeName_(node)), "E", maxPriority, ignoreDirective);
                            for (var attr, name, nName, ngAttrName, value, isNgAttr, nAttrs = node.attributes, j = 0, jj = nAttrs && nAttrs.length; jj > j; j++) {
                                var attrStartName = !1, attrEndName = !1;
                                attr = nAttrs[j], name = attr.name, value = trim(attr.value), ngAttrName = directiveNormalize(name), (isNgAttr = NG_ATTR_BINDING.test(ngAttrName)) && (name = name.replace(PREFIX_REGEXP, "").substr(8).replace(/_(.)/g, function (match, letter) {
                                    return letter.toUpperCase()
                                }));
                                var directiveNName = ngAttrName.replace(/(Start|End)$/, "");
                                directiveIsMultiElement(directiveNName) && ngAttrName === directiveNName + "Start" && (attrStartName = name, attrEndName = name.substr(0, name.length - 5) + "end", name = name.substr(0, name.length - 6)), nName = directiveNormalize(name.toLowerCase()), attrsMap[nName] = name, (isNgAttr || !attrs.hasOwnProperty(nName)) && (attrs[nName] = value, getBooleanAttrName(node, nName) && (attrs[nName] = !0)), addAttrInterpolateDirective(node, directives, value, nName, isNgAttr), addDirective(directives, nName, "A", maxPriority, ignoreDirective, attrStartName, attrEndName)
                            }
                            if (className = node.className, isString(className) && "" !== className)for (; match = CLASS_DIRECTIVE_REGEXP.exec(className);)nName = directiveNormalize(match[2]), addDirective(directives, nName, "C", maxPriority, ignoreDirective) && (attrs[nName] = trim(match[3])), className = className.substr(match.index + match[0].length);
                            break;
                        case NODE_TYPE_TEXT:
                            addTextInterpolateDirective(directives, node.nodeValue);
                            break;
                        case NODE_TYPE_COMMENT:
                            try {
                                match = COMMENT_DIRECTIVE_REGEXP.exec(node.nodeValue), match && (nName = directiveNormalize(match[1]), addDirective(directives, nName, "M", maxPriority, ignoreDirective) && (attrs[nName] = trim(match[2])))
                            } catch (e) {
                            }
                    }
                    return directives.sort(byPriority), directives
                }

                function groupScan(node, attrStart, attrEnd) {
                    var nodes = [], depth = 0;
                    if (attrStart && node.hasAttribute && node.hasAttribute(attrStart)) {
                        do {
                            if (!node)throw $compileMinErr("uterdir", "Unterminated attribute, found '{0}' but no matching '{1}' found.", attrStart, attrEnd);
                            node.nodeType == NODE_TYPE_ELEMENT && (node.hasAttribute(attrStart) && depth++, node.hasAttribute(attrEnd) && depth--), nodes.push(node), node = node.nextSibling
                        } while (depth > 0)
                    } else nodes.push(node);
                    return jqLite(nodes)
                }

                function groupElementsLinkFnWrapper(linkFn, attrStart, attrEnd) {
                    return function (scope, element, attrs, controllers, transcludeFn) {
                        return element = groupScan(element[0], attrStart, attrEnd), linkFn(scope, element, attrs, controllers, transcludeFn)
                    }
                }

                function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns, previousCompileContext) {
                    function addLinkFns(pre, post, attrStart, attrEnd) {
                        pre && (attrStart && (pre = groupElementsLinkFnWrapper(pre, attrStart, attrEnd)), pre.require = directive.require, pre.directiveName = directiveName, (newIsolateScopeDirective === directive || directive.$$isolateScope) && (pre = cloneAndAnnotateFn(pre, {isolateScope: !0})), preLinkFns.push(pre)), post && (attrStart && (post = groupElementsLinkFnWrapper(post, attrStart, attrEnd)), post.require = directive.require, post.directiveName = directiveName, (newIsolateScopeDirective === directive || directive.$$isolateScope) && (post = cloneAndAnnotateFn(post, {isolateScope: !0})), postLinkFns.push(post))
                    }

                    function getControllers(directiveName, require, $element, elementControllers) {
                        var value, match, retrievalMethod = "data", optional = !1, $searchElement = $element;
                        if (isString(require)) {
                            if (match = require.match(REQUIRE_PREFIX_REGEXP), require = require.substring(match[0].length), match[3] && (match[1] ? match[3] = null : match[1] = match[3]), "^" === match[1] ? retrievalMethod = "inheritedData" : "^^" === match[1] && (retrievalMethod = "inheritedData", $searchElement = $element.parent()), "?" === match[2] && (optional = !0), value = null, elementControllers && "data" === retrievalMethod && (value = elementControllers[require]) && (value = value.instance), value = value || $searchElement[retrievalMethod]("$" + require + "Controller"), !value && !optional)throw $compileMinErr("ctreq", "Controller '{0}', required by directive '{1}', can't be found!", require, directiveName);
                            return value || null
                        }
                        return isArray(require) && (value = [], forEach(require, function (require) {
                            value.push(getControllers(directiveName, require, $element, elementControllers))
                        })), value
                    }

                    function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn) {
                        function controllersBoundTransclude(scope, cloneAttachFn, futureParentElement) {
                            var transcludeControllers;
                            return isScope(scope) || (futureParentElement = cloneAttachFn, cloneAttachFn = scope, scope = undefined), hasElementTranscludeDirective && (transcludeControllers = elementControllers), futureParentElement || (futureParentElement = hasElementTranscludeDirective ? $element.parent() : $element), boundTranscludeFn(scope, cloneAttachFn, transcludeControllers, futureParentElement, scopeToChild)
                        }

                        var i, ii, linkFn, controller, isolateScope, elementControllers, transcludeFn, $element, attrs;
                        if (compileNode === linkNode ? (attrs = templateAttrs, $element = templateAttrs.$$element) : ($element = jqLite(linkNode), attrs = new Attributes($element, templateAttrs)), newIsolateScopeDirective && (isolateScope = scope.$new(!0)), boundTranscludeFn && (transcludeFn = controllersBoundTransclude, transcludeFn.$$boundTransclude = boundTranscludeFn), controllerDirectives && (controllers = {}, elementControllers = {}, forEach(controllerDirectives, function (directive) {
                                var controllerInstance, locals = {
                                    $scope: directive === newIsolateScopeDirective || directive.$$isolateScope ? isolateScope : scope,
                                    $element: $element,
                                    $attrs: attrs,
                                    $transclude: transcludeFn
                                };
                                controller = directive.controller, "@" == controller && (controller = attrs[directive.name]), controllerInstance = $controller(controller, locals, !0, directive.controllerAs), elementControllers[directive.name] = controllerInstance, hasElementTranscludeDirective || $element.data("$" + directive.name + "Controller", controllerInstance.instance), controllers[directive.name] = controllerInstance
                            })), newIsolateScopeDirective) {
                            compile.$$addScopeInfo($element, isolateScope, !0, !(templateDirective && (templateDirective === newIsolateScopeDirective || templateDirective === newIsolateScopeDirective.$$originalDirective))), compile.$$addScopeClass($element, !0);
                            var isolateScopeController = controllers && controllers[newIsolateScopeDirective.name], isolateBindingContext = isolateScope;
                            isolateScopeController && isolateScopeController.identifier && newIsolateScopeDirective.bindToController === !0 && (isolateBindingContext = isolateScopeController.instance), forEach(isolateScope.$$isolateBindings = newIsolateScopeDirective.$$isolateBindings, function (definition, scopeName) {
                                var lastValue, parentGet, parentSet, compare, attrName = definition.attrName, optional = definition.optional, mode = definition.mode;
                                switch (mode) {
                                    case"@":
                                        attrs.$observe(attrName, function (value) {
                                            isolateBindingContext[scopeName] = value
                                        }), attrs.$$observers[attrName].$$scope = scope, attrs[attrName] && (isolateBindingContext[scopeName] = $interpolate(attrs[attrName])(scope));
                                        break;
                                    case"=":
                                        if (optional && !attrs[attrName])return;
                                        parentGet = $parse(attrs[attrName]), compare = parentGet.literal ? equals : function (a, b) {
                                            return a === b || a !== a && b !== b
                                        }, parentSet = parentGet.assign || function () {
                                            throw lastValue = isolateBindingContext[scopeName] = parentGet(scope), $compileMinErr("nonassign", "Expression '{0}' used with directive '{1}' is non-assignable!", attrs[attrName], newIsolateScopeDirective.name)
                                        }, lastValue = isolateBindingContext[scopeName] = parentGet(scope);
                                        var parentValueWatch = function (parentValue) {
                                            return compare(parentValue, isolateBindingContext[scopeName]) || (compare(parentValue, lastValue) ? parentSet(scope, parentValue = isolateBindingContext[scopeName]) : isolateBindingContext[scopeName] = parentValue), lastValue = parentValue
                                        };
                                        parentValueWatch.$stateful = !0;
                                        var unwatch;
                                        unwatch = definition.collection ? scope.$watchCollection(attrs[attrName], parentValueWatch) : scope.$watch($parse(attrs[attrName], parentValueWatch), null, parentGet.literal), isolateScope.$on("$destroy", unwatch);
                                        break;
                                    case"&":
                                        parentGet = $parse(attrs[attrName]), isolateBindingContext[scopeName] = function (locals) {
                                            return parentGet(scope, locals)
                                        }
                                }
                            })
                        }
                        for (controllers && (forEach(controllers, function (controller) {
                            controller()
                        }), controllers = null), i = 0, ii = preLinkFns.length; ii > i; i++)linkFn = preLinkFns[i], invokeLinkFn(linkFn, linkFn.isolateScope ? isolateScope : scope, $element, attrs, linkFn.require && getControllers(linkFn.directiveName, linkFn.require, $element, elementControllers), transcludeFn);
                        var scopeToChild = scope;
                        for (newIsolateScopeDirective && (newIsolateScopeDirective.template || null === newIsolateScopeDirective.templateUrl) && (scopeToChild = isolateScope), childLinkFn && childLinkFn(scopeToChild, linkNode.childNodes, undefined, boundTranscludeFn), i = postLinkFns.length - 1; i >= 0; i--)linkFn = postLinkFns[i], invokeLinkFn(linkFn, linkFn.isolateScope ? isolateScope : scope, $element, attrs, linkFn.require && getControllers(linkFn.directiveName, linkFn.require, $element, elementControllers), transcludeFn)
                    }

                    previousCompileContext = previousCompileContext || {};
                    for (var newScopeDirective, controllers, directive, directiveName, $template, linkFn, directiveValue, terminalPriority = -Number.MAX_VALUE, controllerDirectives = previousCompileContext.controllerDirectives, newIsolateScopeDirective = previousCompileContext.newIsolateScopeDirective, templateDirective = previousCompileContext.templateDirective, nonTlbTranscludeDirective = previousCompileContext.nonTlbTranscludeDirective, hasTranscludeDirective = !1, hasTemplate = !1, hasElementTranscludeDirective = previousCompileContext.hasElementTranscludeDirective, $compileNode = templateAttrs.$$element = jqLite(compileNode), replaceDirective = originalReplaceDirective, childTranscludeFn = transcludeFn, i = 0, ii = directives.length; ii > i; i++) {
                        directive = directives[i];
                        var attrStart = directive.$$start, attrEnd = directive.$$end;
                        if (attrStart && ($compileNode = groupScan(compileNode, attrStart, attrEnd)), $template = undefined, terminalPriority > directive.priority)break;
                        if ((directiveValue = directive.scope) && (directive.templateUrl || (isObject(directiveValue) ? (assertNoDuplicate("new/isolated scope", newIsolateScopeDirective || newScopeDirective, directive, $compileNode), newIsolateScopeDirective = directive) : assertNoDuplicate("new/isolated scope", newIsolateScopeDirective, directive, $compileNode)), newScopeDirective = newScopeDirective || directive), directiveName = directive.name, !directive.templateUrl && directive.controller && (directiveValue = directive.controller, controllerDirectives = controllerDirectives || {}, assertNoDuplicate("'" + directiveName + "' controller", controllerDirectives[directiveName], directive, $compileNode), controllerDirectives[directiveName] = directive), (directiveValue = directive.transclude) && (hasTranscludeDirective = !0, directive.$$tlb || (assertNoDuplicate("transclusion", nonTlbTranscludeDirective, directive, $compileNode), nonTlbTranscludeDirective = directive), "element" == directiveValue ? (hasElementTranscludeDirective = !0, terminalPriority = directive.priority, $template = $compileNode, $compileNode = templateAttrs.$$element = jqLite(document.createComment(" " + directiveName + ": " + templateAttrs[directiveName] + " ")), compileNode = $compileNode[0], replaceWith(jqCollection, sliceArgs($template), compileNode), childTranscludeFn = compile($template, transcludeFn, terminalPriority, replaceDirective && replaceDirective.name, {nonTlbTranscludeDirective: nonTlbTranscludeDirective})) : ($template = jqLite(jqLiteClone(compileNode)).contents(), $compileNode.empty(), childTranscludeFn = compile($template, transcludeFn))), directive.template)if (hasTemplate = !0, assertNoDuplicate("template", templateDirective, directive, $compileNode), templateDirective = directive, directiveValue = isFunction(directive.template) ? directive.template($compileNode, templateAttrs) : directive.template, directiveValue = denormalizeTemplate(directiveValue), directive.replace) {
                            if (replaceDirective = directive, $template = jqLiteIsTextNode(directiveValue) ? [] : removeComments(wrapTemplate(directive.templateNamespace, trim(directiveValue))), compileNode = $template[0], 1 != $template.length || compileNode.nodeType !== NODE_TYPE_ELEMENT)throw $compileMinErr("tplrt", "Template for directive '{0}' must have exactly one root element. {1}", directiveName, "");
                            replaceWith(jqCollection, $compileNode, compileNode);
                            var newTemplateAttrs = {$attr: {}}, templateDirectives = collectDirectives(compileNode, [], newTemplateAttrs), unprocessedDirectives = directives.splice(i + 1, directives.length - (i + 1));
                            newIsolateScopeDirective && markDirectivesAsIsolate(templateDirectives), directives = directives.concat(templateDirectives).concat(unprocessedDirectives), mergeTemplateAttributes(templateAttrs, newTemplateAttrs), ii = directives.length
                        } else $compileNode.html(directiveValue);
                        if (directive.templateUrl)hasTemplate = !0, assertNoDuplicate("template", templateDirective, directive, $compileNode), templateDirective = directive, directive.replace && (replaceDirective = directive), nodeLinkFn = compileTemplateUrl(directives.splice(i, directives.length - i), $compileNode, templateAttrs, jqCollection, hasTranscludeDirective && childTranscludeFn, preLinkFns, postLinkFns, {
                            controllerDirectives: controllerDirectives,
                            newIsolateScopeDirective: newIsolateScopeDirective,
                            templateDirective: templateDirective,
                            nonTlbTranscludeDirective: nonTlbTranscludeDirective
                        }), ii = directives.length; else if (directive.compile)try {
                            linkFn = directive.compile($compileNode, templateAttrs, childTranscludeFn), isFunction(linkFn) ? addLinkFns(null, linkFn, attrStart, attrEnd) : linkFn && addLinkFns(linkFn.pre, linkFn.post, attrStart, attrEnd)
                        } catch (e) {
                            $exceptionHandler(e, startingTag($compileNode))
                        }
                        directive.terminal && (nodeLinkFn.terminal = !0, terminalPriority = Math.max(terminalPriority, directive.priority))
                    }
                    return nodeLinkFn.scope = newScopeDirective && newScopeDirective.scope === !0, nodeLinkFn.transcludeOnThisElement = hasTranscludeDirective, nodeLinkFn.elementTranscludeOnThisElement = hasElementTranscludeDirective, nodeLinkFn.templateOnThisElement = hasTemplate, nodeLinkFn.transclude = childTranscludeFn, previousCompileContext.hasElementTranscludeDirective = hasElementTranscludeDirective, nodeLinkFn
                }

                function markDirectivesAsIsolate(directives) {
                    for (var j = 0, jj = directives.length; jj > j; j++)directives[j] = inherit(directives[j], {$$isolateScope: !0})
                }

                function addDirective(tDirectives, name, location, maxPriority, ignoreDirective, startAttrName, endAttrName) {
                    if (name === ignoreDirective)return null;
                    var match = null;
                    if (hasDirectives.hasOwnProperty(name))for (var directive, directives = $injector.get(name + Suffix), i = 0, ii = directives.length; ii > i; i++)try {
                        directive = directives[i], (maxPriority === undefined || maxPriority > directive.priority) && -1 != directive.restrict.indexOf(location) && (startAttrName && (directive = inherit(directive, {
                            $$start: startAttrName,
                            $$end: endAttrName
                        })), tDirectives.push(directive), match = directive)
                    } catch (e) {
                        $exceptionHandler(e)
                    }
                    return match
                }

                function directiveIsMultiElement(name) {
                    if (hasDirectives.hasOwnProperty(name))for (var directive, directives = $injector.get(name + Suffix), i = 0, ii = directives.length; ii > i; i++)if (directive = directives[i], directive.multiElement)return !0;
                    return !1
                }

                function mergeTemplateAttributes(dst, src) {
                    var srcAttr = src.$attr, dstAttr = dst.$attr, $element = dst.$$element;
                    forEach(dst, function (value, key) {
                        "$" != key.charAt(0) && (src[key] && src[key] !== value && (value += ("style" === key ? ";" : " ") + src[key]), dst.$set(key, value, !0, srcAttr[key]))
                    }), forEach(src, function (value, key) {
                        "class" == key ? (safeAddClass($element, value), dst["class"] = (dst["class"] ? dst["class"] + " " : "") + value) : "style" == key ? ($element.attr("style", $element.attr("style") + ";" + value), dst.style = (dst.style ? dst.style + ";" : "") + value) : "$" == key.charAt(0) || dst.hasOwnProperty(key) || (dst[key] = value, dstAttr[key] = srcAttr[key])
                    })
                }

                function compileTemplateUrl(directives, $compileNode, tAttrs, $rootElement, childTranscludeFn, preLinkFns, postLinkFns, previousCompileContext) {
                    var afterTemplateNodeLinkFn, afterTemplateChildLinkFn, linkQueue = [], beforeTemplateCompileNode = $compileNode[0], origAsyncDirective = directives.shift(), derivedSyncDirective = extend({}, origAsyncDirective, {
                        templateUrl: null,
                        transclude: null,
                        replace: null,
                        $$originalDirective: origAsyncDirective
                    }), templateUrl = isFunction(origAsyncDirective.templateUrl) ? origAsyncDirective.templateUrl($compileNode, tAttrs) : origAsyncDirective.templateUrl, templateNamespace = origAsyncDirective.templateNamespace;
                    return $compileNode.empty(), $templateRequest($sce.getTrustedResourceUrl(templateUrl)).then(function (content) {
                        var compileNode, tempTemplateAttrs, $template, childBoundTranscludeFn;
                        if (content = denormalizeTemplate(content), origAsyncDirective.replace) {
                            if ($template = jqLiteIsTextNode(content) ? [] : removeComments(wrapTemplate(templateNamespace, trim(content))), compileNode = $template[0], 1 != $template.length || compileNode.nodeType !== NODE_TYPE_ELEMENT)throw $compileMinErr("tplrt", "Template for directive '{0}' must have exactly one root element. {1}", origAsyncDirective.name, templateUrl);
                            tempTemplateAttrs = {$attr: {}}, replaceWith($rootElement, $compileNode, compileNode);
                            var templateDirectives = collectDirectives(compileNode, [], tempTemplateAttrs);
                            isObject(origAsyncDirective.scope) && markDirectivesAsIsolate(templateDirectives), directives = templateDirectives.concat(directives), mergeTemplateAttributes(tAttrs, tempTemplateAttrs)
                        } else compileNode = beforeTemplateCompileNode, $compileNode.html(content);
                        for (directives.unshift(derivedSyncDirective), afterTemplateNodeLinkFn = applyDirectivesToNode(directives, compileNode, tAttrs, childTranscludeFn, $compileNode, origAsyncDirective, preLinkFns, postLinkFns, previousCompileContext), forEach($rootElement, function (node, i) {
                            node == compileNode && ($rootElement[i] = $compileNode[0])
                        }), afterTemplateChildLinkFn = compileNodes($compileNode[0].childNodes, childTranscludeFn); linkQueue.length;) {
                            var scope = linkQueue.shift(), beforeTemplateLinkNode = linkQueue.shift(), linkRootElement = linkQueue.shift(), boundTranscludeFn = linkQueue.shift(), linkNode = $compileNode[0];
                            if (!scope.$$destroyed) {
                                if (beforeTemplateLinkNode !== beforeTemplateCompileNode) {
                                    var oldClasses = beforeTemplateLinkNode.className;
                                    previousCompileContext.hasElementTranscludeDirective && origAsyncDirective.replace || (linkNode = jqLiteClone(compileNode)), replaceWith(linkRootElement, jqLite(beforeTemplateLinkNode), linkNode), safeAddClass(jqLite(linkNode), oldClasses)
                                }
                                childBoundTranscludeFn = afterTemplateNodeLinkFn.transcludeOnThisElement ? createBoundTranscludeFn(scope, afterTemplateNodeLinkFn.transclude, boundTranscludeFn) : boundTranscludeFn, afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, linkNode, $rootElement, childBoundTranscludeFn)
                            }
                        }
                        linkQueue = null
                    }), function (ignoreChildLinkFn, scope, node, rootElement, boundTranscludeFn) {
                        var childBoundTranscludeFn = boundTranscludeFn;
                        scope.$$destroyed || (linkQueue ? linkQueue.push(scope, node, rootElement, childBoundTranscludeFn) : (afterTemplateNodeLinkFn.transcludeOnThisElement && (childBoundTranscludeFn = createBoundTranscludeFn(scope, afterTemplateNodeLinkFn.transclude, boundTranscludeFn)), afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, node, rootElement, childBoundTranscludeFn)))
                    }
                }

                function byPriority(a, b) {
                    var diff = b.priority - a.priority;
                    return 0 !== diff ? diff : a.name !== b.name ? a.name < b.name ? -1 : 1 : a.index - b.index
                }

                function assertNoDuplicate(what, previousDirective, directive, element) {
                    if (previousDirective)throw $compileMinErr("multidir", "Multiple directives [{0}, {1}] asking for {2} on: {3}", previousDirective.name, directive.name, what, startingTag(element))
                }

                function addTextInterpolateDirective(directives, text) {
                    var interpolateFn = $interpolate(text, !0);
                    interpolateFn && directives.push({
                        priority: 0, compile: function (templateNode) {
                            var templateNodeParent = templateNode.parent(), hasCompileParent = !!templateNodeParent.length;
                            return hasCompileParent && compile.$$addBindingClass(templateNodeParent), function (scope, node) {
                                var parent = node.parent();
                                hasCompileParent || compile.$$addBindingClass(parent), compile.$$addBindingInfo(parent, interpolateFn.expressions), scope.$watch(interpolateFn, function (value) {
                                    node[0].nodeValue = value
                                })
                            }
                        }
                    })
                }

                function wrapTemplate(type, template) {
                    switch (type = lowercase(type || "html")) {
                        case"svg":
                        case"math":
                            var wrapper = document.createElement("div");
                            return wrapper.innerHTML = "<" + type + ">" + template + "</" + type + ">", wrapper.childNodes[0].childNodes;
                        default:
                            return template
                    }
                }

                function getTrustedContext(node, attrNormalizedName) {
                    if ("srcdoc" == attrNormalizedName)return $sce.HTML;
                    var tag = nodeName_(node);
                    return "xlinkHref" == attrNormalizedName || "form" == tag && "action" == attrNormalizedName || "img" != tag && ("src" == attrNormalizedName || "ngSrc" == attrNormalizedName) ? $sce.RESOURCE_URL : void 0
                }

                function addAttrInterpolateDirective(node, directives, value, name, allOrNothing) {
                    var trustedContext = getTrustedContext(node, name);
                    allOrNothing = ALL_OR_NOTHING_ATTRS[name] || allOrNothing;
                    var interpolateFn = $interpolate(value, !0, trustedContext, allOrNothing);
                    if (interpolateFn) {
                        if ("multiple" === name && "select" === nodeName_(node))throw $compileMinErr("selmulti", "Binding to the 'multiple' attribute is not supported. Element: {0}", startingTag(node));
                        directives.push({
                            priority: 100, compile: function () {
                                return {
                                    pre: function (scope, element, attr) {
                                        var $$observers = attr.$$observers || (attr.$$observers = {});
                                        if (EVENT_HANDLER_ATTR_REGEXP.test(name))throw $compileMinErr("nodomevents", "Interpolations for HTML DOM event attributes are disallowed.  Please use the ng- versions (such as ng-click instead of onclick) instead.");
                                        var newValue = attr[name];
                                        newValue !== value && (interpolateFn = newValue && $interpolate(newValue, !0, trustedContext, allOrNothing), value = newValue), interpolateFn && (attr[name] = interpolateFn(scope), ($$observers[name] || ($$observers[name] = [])).$$inter = !0, (attr.$$observers && attr.$$observers[name].$$scope || scope).$watch(interpolateFn, function (newValue, oldValue) {
                                            "class" === name && newValue != oldValue ? attr.$updateClass(newValue, oldValue) : attr.$set(name, newValue)
                                        }))
                                    }
                                }
                            }
                        })
                    }
                }

                function replaceWith($rootElement, elementsToRemove, newNode) {
                    var i, ii, firstElementToRemove = elementsToRemove[0], removeCount = elementsToRemove.length, parent = firstElementToRemove.parentNode;
                    if ($rootElement)for (i = 0, ii = $rootElement.length; ii > i; i++)if ($rootElement[i] == firstElementToRemove) {
                        $rootElement[i++] = newNode;
                        for (var j = i, j2 = j + removeCount - 1, jj = $rootElement.length; jj > j; j++, j2++)jj > j2 ? $rootElement[j] = $rootElement[j2] : delete $rootElement[j];
                        $rootElement.length -= removeCount - 1, $rootElement.context === firstElementToRemove && ($rootElement.context = newNode);
                        break
                    }
                    parent && parent.replaceChild(newNode, firstElementToRemove);
                    var fragment = document.createDocumentFragment();
                    fragment.appendChild(firstElementToRemove), jqLite(newNode).data(jqLite(firstElementToRemove).data()), jQuery ? (skipDestroyOnNextJQueryCleanData = !0, jQuery.cleanData([firstElementToRemove])) : delete jqLite.cache[firstElementToRemove[jqLite.expando]];
                    for (var k = 1, kk = elementsToRemove.length; kk > k; k++) {
                        var element = elementsToRemove[k];
                        jqLite(element).remove(), fragment.appendChild(element), delete elementsToRemove[k]
                    }
                    elementsToRemove[0] = newNode, elementsToRemove.length = 1
                }

                function cloneAndAnnotateFn(fn, annotation) {
                    return extend(function () {
                        return fn.apply(null, arguments)
                    }, fn, annotation)
                }

                function invokeLinkFn(linkFn, scope, $element, attrs, controllers, transcludeFn) {
                    try {
                        linkFn(scope, $element, attrs, controllers, transcludeFn)
                    } catch (e) {
                        $exceptionHandler(e, startingTag($element))
                    }
                }

                var Attributes = function (element, attributesToCopy) {
                    if (attributesToCopy) {
                        var i, l, key, keys = Object.keys(attributesToCopy);
                        for (i = 0, l = keys.length; l > i; i++)key = keys[i], this[key] = attributesToCopy[key]
                    } else this.$attr = {};
                    this.$$element = element
                };
                Attributes.prototype = {
                    $normalize: directiveNormalize, $addClass: function (classVal) {
                        classVal && classVal.length > 0 && $animate.addClass(this.$$element, classVal)
                    }, $removeClass: function (classVal) {
                        classVal && classVal.length > 0 && $animate.removeClass(this.$$element, classVal)
                    }, $updateClass: function (newClasses, oldClasses) {
                        var toAdd = tokenDifference(newClasses, oldClasses);
                        toAdd && toAdd.length && $animate.addClass(this.$$element, toAdd);
                        var toRemove = tokenDifference(oldClasses, newClasses);
                        toRemove && toRemove.length && $animate.removeClass(this.$$element, toRemove)
                    }, $set: function (key, value, writeAttr, attrName) {
                        var nodeName, node = this.$$element[0], booleanKey = getBooleanAttrName(node, key), aliasedKey = getAliasedAttrName(node, key), observer = key;
                        if (booleanKey ? (this.$$element.prop(key, value), attrName = booleanKey) : aliasedKey && (this[aliasedKey] = value, observer = aliasedKey), this[key] = value, attrName ? this.$attr[key] = attrName : (attrName = this.$attr[key], attrName || (this.$attr[key] = attrName = snake_case(key, "-"))), nodeName = nodeName_(this.$$element), "a" === nodeName && "href" === key || "img" === nodeName && "src" === key)this[key] = value = $$sanitizeUri(value, "src" === key); else if ("img" === nodeName && "srcset" === key) {
                            for (var result = "", trimmedSrcset = trim(value), srcPattern = /(\s+\d+x\s*,|\s+\d+w\s*,|\s+,|,\s+)/, pattern = /\s/.test(trimmedSrcset) ? srcPattern : /(,)/, rawUris = trimmedSrcset.split(pattern), nbrUrisWith2parts = Math.floor(rawUris.length / 2), i = 0; nbrUrisWith2parts > i; i++) {
                                var innerIdx = 2 * i;
                                result += $$sanitizeUri(trim(rawUris[innerIdx]), !0), result += " " + trim(rawUris[innerIdx + 1])
                            }
                            var lastTuple = trim(rawUris[2 * i]).split(/\s/);
                            result += $$sanitizeUri(trim(lastTuple[0]), !0), 2 === lastTuple.length && (result += " " + trim(lastTuple[1])), this[key] = value = result
                        }
                        writeAttr !== !1 && (null === value || value === undefined ? this.$$element.removeAttr(attrName) : this.$$element.attr(attrName, value));
                        var $$observers = this.$$observers;
                        $$observers && forEach($$observers[observer], function (fn) {
                            try {
                                fn(value)
                            } catch (e) {
                                $exceptionHandler(e)
                            }
                        })
                    }, $observe: function (key, fn) {
                        var attrs = this, $$observers = attrs.$$observers || (attrs.$$observers = createMap()), listeners = $$observers[key] || ($$observers[key] = []);
                        return listeners.push(fn), $rootScope.$evalAsync(function () {
                            !listeners.$$inter && attrs.hasOwnProperty(key) && fn(attrs[key])
                        }), function () {
                            arrayRemove(listeners, fn)
                        }
                    }
                };
                var startSymbol = $interpolate.startSymbol(), endSymbol = $interpolate.endSymbol(), denormalizeTemplate = "{{" == startSymbol || "}}" == endSymbol ? identity : function (template) {
                    return template.replace(/\{\{/g, startSymbol).replace(/}}/g, endSymbol)
                }, NG_ATTR_BINDING = /^ngAttr[A-Z]/;
                return compile.$$addBindingInfo = debugInfoEnabled ? function ($element, binding) {
                    var bindings = $element.data("$binding") || [];
                    isArray(binding) ? bindings = bindings.concat(binding) : bindings.push(binding), $element.data("$binding", bindings)
                } : noop, compile.$$addBindingClass = debugInfoEnabled ? function ($element) {
                    safeAddClass($element, "ng-binding")
                } : noop, compile.$$addScopeInfo = debugInfoEnabled ? function ($element, scope, isolated, noTemplate) {
                    var dataName = isolated ? noTemplate ? "$isolateScopeNoTemplate" : "$isolateScope" : "$scope";
                    $element.data(dataName, scope)
                } : noop, compile.$$addScopeClass = debugInfoEnabled ? function ($element, isolated) {
                    safeAddClass($element, isolated ? "ng-isolate-scope" : "ng-scope")
                } : noop, compile
            }]
        }

        function directiveNormalize(name) {
            return camelCase(name.replace(PREFIX_REGEXP, ""))
        }

        function tokenDifference(str1, str2) {
            var values = "", tokens1 = str1.split(/\s+/), tokens2 = str2.split(/\s+/);
            outer:for (var i = 0; i < tokens1.length; i++) {
                for (var token = tokens1[i], j = 0; j < tokens2.length; j++)if (token == tokens2[j])continue outer;
                values += (values.length > 0 ? " " : "") + token
            }
            return values
        }

        function removeComments(jqNodes) {
            jqNodes = jqLite(jqNodes);
            var i = jqNodes.length;
            if (1 >= i)return jqNodes;
            for (; i--;) {
                var node = jqNodes[i];
                node.nodeType === NODE_TYPE_COMMENT && splice.call(jqNodes, i, 1)
            }
            return jqNodes
        }

        function $ControllerProvider() {
            var controllers = {}, globals = !1, CNTRL_REG = /^(\S+)(\s+as\s+(\w+))?$/;
            this.register = function (name, constructor) {
                assertNotHasOwnProperty(name, "controller"), isObject(name) ? extend(controllers, name) : controllers[name] = constructor
            }, this.allowGlobals = function () {
                globals = !0
            }, this.$get = ["$injector", "$window", function ($injector, $window) {
                function addIdentifier(locals, identifier, instance, name) {
                    if (!locals || !isObject(locals.$scope))throw minErr("$controller")("noscp", "Cannot export controller '{0}' as '{1}'! No $scope object provided via `locals`.", name, identifier);
                    locals.$scope[identifier] = instance
                }

                return function (expression, locals, later, ident) {
                    var instance, match, constructor, identifier;
                    if (later = later === !0, ident && isString(ident) && (identifier = ident), isString(expression) && (match = expression.match(CNTRL_REG), constructor = match[1], identifier = identifier || match[3], expression = controllers.hasOwnProperty(constructor) ? controllers[constructor] : getter(locals.$scope, constructor, !0) || (globals ? getter($window, constructor, !0) : undefined), assertArgFn(expression, constructor, !0)), later) {
                        var controllerPrototype = (isArray(expression) ? expression[expression.length - 1] : expression).prototype;
                        return instance = Object.create(controllerPrototype), identifier && addIdentifier(locals, identifier, instance, constructor || expression.name), extend(function () {
                            return $injector.invoke(expression, instance, locals, constructor), instance
                        }, {instance: instance, identifier: identifier})
                    }
                    return instance = $injector.instantiate(expression, locals, constructor), identifier && addIdentifier(locals, identifier, instance, constructor || expression.name), instance
                }
            }]
        }

        function $DocumentProvider() {
            this.$get = ["$window", function (window) {
                return jqLite(window.document)
            }]
        }

        function $ExceptionHandlerProvider() {
            this.$get = ["$log", function ($log) {
                return function () {
                    $log.error.apply($log, arguments)
                }
            }]
        }

        function defaultHttpResponseTransform(data, headers) {
            if (isString(data)) {
                var tempData = data.replace(JSON_PROTECTION_PREFIX, "").trim();
                if (tempData) {
                    var contentType = headers("Content-Type");
                    (contentType && 0 === contentType.indexOf(APPLICATION_JSON) || isJsonLike(tempData)) && (data = fromJson(tempData))
                }
            }
            return data
        }

        function isJsonLike(str) {
            var jsonStart = str.match(JSON_START);
            return jsonStart && JSON_ENDS[jsonStart[0]].test(str)
        }

        function parseHeaders(headers) {
            var key, val, i, parsed = createMap();
            return headers ? (forEach(headers.split("\n"), function (line) {
                i = line.indexOf(":"), key = lowercase(trim(line.substr(0, i))), val = trim(line.substr(i + 1)), key && (parsed[key] = parsed[key] ? parsed[key] + ", " + val : val)
            }), parsed) : parsed
        }

        function headersGetter(headers) {
            var headersObj = isObject(headers) ? headers : undefined;
            return function (name) {
                if (headersObj || (headersObj = parseHeaders(headers)), name) {
                    var value = headersObj[lowercase(name)];
                    return void 0 === value && (value = null), value
                }
                return headersObj
            }
        }

        function transformData(data, headers, status, fns) {
            return isFunction(fns) ? fns(data, headers, status) : (forEach(fns, function (fn) {
                data = fn(data, headers, status)
            }), data)
        }

        function isSuccess(status) {
            return status >= 200 && 300 > status
        }

        function $HttpProvider() {
            var defaults = this.defaults = {
                transformResponse: [defaultHttpResponseTransform],
                transformRequest: [function (d) {
                    return !isObject(d) || isFile(d) || isBlob(d) || isFormData(d) ? d : toJson(d)
                }],
                headers: {
                    common: {Accept: "application/json, text/plain, */*"},
                    post: shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
                    put: shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
                    patch: shallowCopy(CONTENT_TYPE_APPLICATION_JSON)
                },
                xsrfCookieName: "XSRF-TOKEN",
                xsrfHeaderName: "X-XSRF-TOKEN"
            }, useApplyAsync = !1;
            this.useApplyAsync = function (value) {
                return isDefined(value) ? (useApplyAsync = !!value, this) : useApplyAsync
            };
            var interceptorFactories = this.interceptors = [];
            this.$get = ["$httpBackend", "$browser", "$cacheFactory", "$rootScope", "$q", "$injector", function ($httpBackend, $browser, $cacheFactory, $rootScope, $q, $injector) {
                function $http(requestConfig) {
                    function transformResponse(response) {
                        var resp = extend({}, response);
                        return resp.data = response.data ? transformData(response.data, response.headers, response.status, config.transformResponse) : response.data, isSuccess(response.status) ? resp : $q.reject(resp)
                    }

                    function executeHeaderFns(headers) {
                        var headerContent, processedHeaders = {};
                        return forEach(headers, function (headerFn, header) {
                            isFunction(headerFn) ? (headerContent = headerFn(), null != headerContent && (processedHeaders[header] = headerContent)) : processedHeaders[header] = headerFn
                        }), processedHeaders
                    }

                    function mergeHeaders(config) {
                        var defHeaderName, lowercaseDefHeaderName, reqHeaderName, defHeaders = defaults.headers, reqHeaders = extend({}, config.headers);
                        defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);
                        defaultHeadersIteration:for (defHeaderName in defHeaders) {
                            lowercaseDefHeaderName = lowercase(defHeaderName);
                            for (reqHeaderName in reqHeaders)if (lowercase(reqHeaderName) === lowercaseDefHeaderName)continue defaultHeadersIteration;
                            reqHeaders[defHeaderName] = defHeaders[defHeaderName]
                        }
                        return executeHeaderFns(reqHeaders)
                    }

                    if (!angular.isObject(requestConfig))throw minErr("$http")("badreq", "Http request configuration must be an object.  Received: {0}", requestConfig);
                    var config = extend({
                        method: "get",
                        transformRequest: defaults.transformRequest,
                        transformResponse: defaults.transformResponse
                    }, requestConfig);
                    config.headers = mergeHeaders(requestConfig), config.method = uppercase(config.method);
                    var serverRequest = function (config) {
                        var headers = config.headers, reqData = transformData(config.data, headersGetter(headers), undefined, config.transformRequest);
                        return isUndefined(reqData) && forEach(headers, function (value, header) {
                            "content-type" === lowercase(header) && delete headers[header]
                        }), isUndefined(config.withCredentials) && !isUndefined(defaults.withCredentials) && (config.withCredentials = defaults.withCredentials), sendReq(config, reqData).then(transformResponse, transformResponse)
                    }, chain = [serverRequest, undefined], promise = $q.when(config);
                    for (forEach(reversedInterceptors, function (interceptor) {
                        (interceptor.request || interceptor.requestError) && chain.unshift(interceptor.request, interceptor.requestError), (interceptor.response || interceptor.responseError) && chain.push(interceptor.response, interceptor.responseError)
                    }); chain.length;) {
                        var thenFn = chain.shift(), rejectFn = chain.shift();
                        promise = promise.then(thenFn, rejectFn)
                    }
                    return promise.success = function (fn) {
                        return promise.then(function (response) {
                            fn(response.data, response.status, response.headers, config)
                        }), promise
                    }, promise.error = function (fn) {
                        return promise.then(null, function (response) {
                            fn(response.data, response.status, response.headers, config)
                        }), promise
                    }, promise
                }

                function createShortMethods() {
                    forEach(arguments, function (name) {
                        $http[name] = function (url, config) {
                            return $http(extend(config || {}, {method: name, url: url}))
                        }
                    })
                }

                function createShortMethodsWithData() {
                    forEach(arguments, function (name) {
                        $http[name] = function (url, data, config) {
                            return $http(extend(config || {}, {method: name, url: url, data: data}))
                        }
                    })
                }

                function sendReq(config, reqData) {
                    function done(status, response, headersString, statusText) {
                        function resolveHttpPromise() {
                            resolvePromise(response, status, headersString, statusText)
                        }

                        cache && (isSuccess(status) ? cache.put(url, [status, response, parseHeaders(headersString), statusText]) : cache.remove(url)), useApplyAsync ? $rootScope.$applyAsync(resolveHttpPromise) : (resolveHttpPromise(), $rootScope.$$phase || $rootScope.$apply())
                    }

                    function resolvePromise(response, status, headers, statusText) {
                        status = Math.max(status, 0), (isSuccess(status) ? deferred.resolve : deferred.reject)({
                            data: response,
                            status: status,
                            headers: headersGetter(headers),
                            config: config,
                            statusText: statusText
                        })
                    }

                    function resolvePromiseWithResult(result) {
                        resolvePromise(result.data, result.status, shallowCopy(result.headers()), result.statusText)
                    }

                    function removePendingReq() {
                        var idx = $http.pendingRequests.indexOf(config);
                        -1 !== idx && $http.pendingRequests.splice(idx, 1)
                    }

                    var cache, cachedResp, deferred = $q.defer(), promise = deferred.promise, reqHeaders = config.headers, url = buildUrl(config.url, config.params);
                    if ($http.pendingRequests.push(config), promise.then(removePendingReq, removePendingReq), !config.cache && !defaults.cache || config.cache === !1 || "GET" !== config.method && "JSONP" !== config.method || (cache = isObject(config.cache) ? config.cache : isObject(defaults.cache) ? defaults.cache : defaultCache), cache && (cachedResp = cache.get(url), isDefined(cachedResp) ? isPromiseLike(cachedResp) ? cachedResp.then(resolvePromiseWithResult, resolvePromiseWithResult) : isArray(cachedResp) ? resolvePromise(cachedResp[1], cachedResp[0], shallowCopy(cachedResp[2]), cachedResp[3]) : resolvePromise(cachedResp, 200, {}, "OK") : cache.put(url, promise)), isUndefined(cachedResp)) {
                        var xsrfValue = urlIsSameOrigin(config.url) ? $browser.cookies()[config.xsrfCookieName || defaults.xsrfCookieName] : undefined;
                        xsrfValue && (reqHeaders[config.xsrfHeaderName || defaults.xsrfHeaderName] = xsrfValue), $httpBackend(config.method, url, reqData, done, reqHeaders, config.timeout, config.withCredentials, config.responseType)
                    }
                    return promise
                }

                function buildUrl(url, params) {
                    if (!params)return url;
                    var parts = [];
                    return forEachSorted(params, function (value, key) {
                        null === value || isUndefined(value) || (isArray(value) || (value = [value]), forEach(value, function (v) {
                            isObject(v) && (v = isDate(v) ? v.toISOString() : toJson(v)), parts.push(encodeUriQuery(key) + "=" + encodeUriQuery(v))
                        }))
                    }), parts.length > 0 && (url += (-1 == url.indexOf("?") ? "?" : "&") + parts.join("&")), url
                }

                var defaultCache = $cacheFactory("$http"), reversedInterceptors = [];
                return forEach(interceptorFactories, function (interceptorFactory) {
                    reversedInterceptors.unshift(isString(interceptorFactory) ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory))
                }), $http.pendingRequests = [], createShortMethods("get", "delete", "head", "jsonp"), createShortMethodsWithData("post", "put", "patch"), $http.defaults = defaults, $http
            }]
        }

        function createXhr() {
            return new window.XMLHttpRequest
        }

        function $HttpBackendProvider() {
            this.$get = ["$browser", "$window", "$document", function ($browser, $window, $document) {
                return createHttpBackend($browser, createXhr, $browser.defer, $window.angular.callbacks, $document[0])
            }]
        }

        function createHttpBackend($browser, createXhr, $browserDefer, callbacks, rawDocument) {
            function jsonpReq(url, callbackId, done) {
                var script = rawDocument.createElement("script"), callback = null;
                return script.type = "text/javascript", script.src = url, script.async = !0, callback = function (event) {
                    removeEventListenerFn(script, "load", callback), removeEventListenerFn(script, "error", callback), rawDocument.body.removeChild(script), script = null;
                    var status = -1, text = "unknown";
                    event && ("load" !== event.type || callbacks[callbackId].called || (event = {type: "error"}), text = event.type, status = "error" === event.type ? 404 : 200), done && done(status, text)
                }, addEventListenerFn(script, "load", callback), addEventListenerFn(script, "error", callback), rawDocument.body.appendChild(script), callback
            }

            return function (method, url, post, callback, headers, timeout, withCredentials, responseType) {
                function timeoutRequest() {
                    jsonpDone && jsonpDone(), xhr && xhr.abort()
                }

                function completeRequest(callback, status, response, headersString, statusText) {
                    timeoutId !== undefined && $browserDefer.cancel(timeoutId), jsonpDone = xhr = null, callback(status, response, headersString, statusText), $browser.$$completeOutstandingRequest(noop)
                }

                if ($browser.$$incOutstandingRequestCount(), url = url || $browser.url(), "jsonp" == lowercase(method)) {
                    var callbackId = "_" + (callbacks.counter++).toString(36);
                    callbacks[callbackId] = function (data) {
                        callbacks[callbackId].data = data, callbacks[callbackId].called = !0
                    };
                    var jsonpDone = jsonpReq(url.replace("JSON_CALLBACK", "angular.callbacks." + callbackId), callbackId, function (status, text) {
                        completeRequest(callback, status, callbacks[callbackId].data, "", text), callbacks[callbackId] = noop
                    })
                } else {
                    var xhr = createXhr();
                    xhr.open(method, url, !0), forEach(headers, function (value, key) {
                        isDefined(value) && xhr.setRequestHeader(key, value)
                    }), xhr.onload = function () {
                        var statusText = xhr.statusText || "", response = "response"in xhr ? xhr.response : xhr.responseText, status = 1223 === xhr.status ? 204 : xhr.status;
                        0 === status && (status = response ? 200 : "file" == urlResolve(url).protocol ? 404 : 0), completeRequest(callback, status, response, xhr.getAllResponseHeaders(), statusText)
                    };
                    var requestError = function () {
                        completeRequest(callback, -1, null, null, "")
                    };
                    if (xhr.onerror = requestError, xhr.onabort = requestError, withCredentials && (xhr.withCredentials = !0), responseType)try {
                        xhr.responseType = responseType
                    } catch (e) {
                        if ("json" !== responseType)throw e
                    }
                    xhr.send(post || null)
                }
                if (timeout > 0)var timeoutId = $browserDefer(timeoutRequest, timeout); else isPromiseLike(timeout) && timeout.then(timeoutRequest)
            }
        }

        function $InterpolateProvider() {
            var startSymbol = "{{", endSymbol = "}}";
            this.startSymbol = function (value) {
                return value ? (startSymbol = value, this) : startSymbol
            }, this.endSymbol = function (value) {
                return value ? (endSymbol = value, this) : endSymbol
            }, this.$get = ["$parse", "$exceptionHandler", "$sce", function ($parse, $exceptionHandler, $sce) {
                function escape(ch) {
                    return "\\\\\\" + ch
                }

                function $interpolate(text, mustHaveExpression, trustedContext, allOrNothing) {
                    function unescapeText(text) {
                        return text.replace(escapedStartRegexp, startSymbol).replace(escapedEndRegexp, endSymbol)
                    }

                    function parseStringifyInterceptor(value) {
                        try {
                            return value = getValue(value), allOrNothing && !isDefined(value) ? value : stringify(value)
                        } catch (err) {
                            var newErr = $interpolateMinErr("interr", "Can't interpolate: {0}\n{1}", text, err.toString());
                            $exceptionHandler(newErr)
                        }
                    }

                    allOrNothing = !!allOrNothing;
                    for (var startIndex, endIndex, exp, index = 0, expressions = [], parseFns = [], textLength = text.length, concat = [], expressionPositions = []; textLength > index;) {
                        if (-1 == (startIndex = text.indexOf(startSymbol, index)) || -1 == (endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength))) {
                            index !== textLength && concat.push(unescapeText(text.substring(index)));
                            break
                        }
                        index !== startIndex && concat.push(unescapeText(text.substring(index, startIndex))), exp = text.substring(startIndex + startSymbolLength, endIndex), expressions.push(exp), parseFns.push($parse(exp, parseStringifyInterceptor)), index = endIndex + endSymbolLength, expressionPositions.push(concat.length), concat.push("")
                    }
                    if (trustedContext && concat.length > 1)throw $interpolateMinErr("noconcat", "Error while interpolating: {0}\nStrict Contextual Escaping disallows interpolations that concatenate multiple expressions when a trusted value is required.  See http://docs.angularjs.org/api/ng.$sce", text);
                    if (!mustHaveExpression || expressions.length) {
                        var compute = function (values) {
                            for (var i = 0, ii = expressions.length; ii > i; i++) {
                                if (allOrNothing && isUndefined(values[i]))return;
                                concat[expressionPositions[i]] = values[i]
                            }
                            return concat.join("")
                        }, getValue = function (value) {
                            return trustedContext ? $sce.getTrusted(trustedContext, value) : $sce.valueOf(value)
                        }, stringify = function (value) {
                            if (null == value)return "";
                            switch (typeof value) {
                                case"string":
                                    break;
                                case"number":
                                    value = "" + value;
                                    break;
                                default:
                                    value = toJson(value)
                            }
                            return value
                        };
                        return extend(function (context) {
                            var i = 0, ii = expressions.length, values = new Array(ii);
                            try {
                                for (; ii > i; i++)values[i] = parseFns[i](context);
                                return compute(values)
                            } catch (err) {
                                var newErr = $interpolateMinErr("interr", "Can't interpolate: {0}\n{1}", text, err.toString());
                                $exceptionHandler(newErr)
                            }
                        }, {
                            exp: text,
                            expressions: expressions,
                            $$watchDelegate: function (scope, listener, objectEquality) {
                                var lastValue;
                                return scope.$watchGroup(parseFns, function (values, oldValues) {
                                    var currValue = compute(values);
                                    isFunction(listener) && listener.call(this, currValue, values !== oldValues ? lastValue : currValue, scope), lastValue = currValue
                                }, objectEquality)
                            }
                        })
                    }
                }

                var startSymbolLength = startSymbol.length, endSymbolLength = endSymbol.length, escapedStartRegexp = new RegExp(startSymbol.replace(/./g, escape), "g"), escapedEndRegexp = new RegExp(endSymbol.replace(/./g, escape), "g");
                return $interpolate.startSymbol = function () {
                    return startSymbol
                }, $interpolate.endSymbol = function () {
                    return endSymbol
                }, $interpolate
            }]
        }

        function $IntervalProvider() {
            this.$get = ["$rootScope", "$window", "$q", "$$q", function ($rootScope, $window, $q, $$q) {
                function interval(fn, delay, count, invokeApply) {
                    var setInterval = $window.setInterval, clearInterval = $window.clearInterval, iteration = 0, skipApply = isDefined(invokeApply) && !invokeApply, deferred = (skipApply ? $$q : $q).defer(), promise = deferred.promise;
                    return count = isDefined(count) ? count : 0, promise.then(null, null, fn), promise.$$intervalId = setInterval(function () {
                        deferred.notify(iteration++), count > 0 && iteration >= count && (deferred.resolve(iteration), clearInterval(promise.$$intervalId), delete intervals[promise.$$intervalId]), skipApply || $rootScope.$apply()
                    }, delay), intervals[promise.$$intervalId] = deferred, promise
                }

                var intervals = {};
                return interval.cancel = function (promise) {
                    return promise && promise.$$intervalId in intervals ? (intervals[promise.$$intervalId].reject("canceled"), $window.clearInterval(promise.$$intervalId), delete intervals[promise.$$intervalId], !0) : !1
                }, interval
            }]
        }

        function $LocaleProvider() {
            this.$get = function () {
                return {
                    id: "en-us",
                    NUMBER_FORMATS: {
                        DECIMAL_SEP: ".",
                        GROUP_SEP: ",",
                        PATTERNS: [{
                            minInt: 1,
                            minFrac: 0,
                            maxFrac: 3,
                            posPre: "",
                            posSuf: "",
                            negPre: "-",
                            negSuf: "",
                            gSize: 3,
                            lgSize: 3
                        }, {
                            minInt: 1,
                            minFrac: 2,
                            maxFrac: 2,
                            posPre: "¤",
                            posSuf: "",
                            negPre: "(¤",
                            negSuf: ")",
                            gSize: 3,
                            lgSize: 3
                        }],
                        CURRENCY_SYM: "$"
                    },
                    DATETIME_FORMATS: {
                        MONTH: "January,February,March,April,May,June,July,August,September,October,November,December".split(","),
                        SHORTMONTH: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),
                        DAY: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(","),
                        SHORTDAY: "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(","),
                        AMPMS: ["AM", "PM"],
                        medium: "MMM d, y h:mm:ss a",
                        "short": "M/d/yy h:mm a",
                        fullDate: "EEEE, MMMM d, y",
                        longDate: "MMMM d, y",
                        mediumDate: "MMM d, y",
                        shortDate: "M/d/yy",
                        mediumTime: "h:mm:ss a",
                        shortTime: "h:mm a"
                    },
                    pluralCat: function (num) {
                        return 1 === num ? "one" : "other"
                    }
                }
            }
        }

        function encodePath(path) {
            for (var segments = path.split("/"), i = segments.length; i--;)segments[i] = encodeUriSegment(segments[i]);
            return segments.join("/")
        }

        function parseAbsoluteUrl(absoluteUrl, locationObj) {
            var parsedUrl = urlResolve(absoluteUrl);
            locationObj.$$protocol = parsedUrl.protocol, locationObj.$$host = parsedUrl.hostname, locationObj.$$port = int(parsedUrl.port) || DEFAULT_PORTS[parsedUrl.protocol] || null
        }

        function parseAppUrl(relativeUrl, locationObj) {
            var prefixed = "/" !== relativeUrl.charAt(0);
            prefixed && (relativeUrl = "/" + relativeUrl);
            var match = urlResolve(relativeUrl);
            locationObj.$$path = decodeURIComponent(prefixed && "/" === match.pathname.charAt(0) ? match.pathname.substring(1) : match.pathname), locationObj.$$search = parseKeyValue(match.search), locationObj.$$hash = decodeURIComponent(match.hash), locationObj.$$path && "/" != locationObj.$$path.charAt(0) && (locationObj.$$path = "/" + locationObj.$$path)
        }

        function beginsWith(begin, whole) {
            return 0 === whole.indexOf(begin) ? whole.substr(begin.length) : void 0
        }

        function stripHash(url) {
            var index = url.indexOf("#");
            return -1 == index ? url : url.substr(0, index)
        }

        function trimEmptyHash(url) {
            return url.replace(/(#.+)|#$/, "$1")
        }

        function stripFile(url) {
            return url.substr(0, stripHash(url).lastIndexOf("/") + 1)
        }

        function serverBase(url) {
            return url.substring(0, url.indexOf("/", url.indexOf("//") + 2))
        }

        function LocationHtml5Url(appBase, basePrefix) {
            this.$$html5 = !0, basePrefix = basePrefix || "";
            var appBaseNoFile = stripFile(appBase);
            parseAbsoluteUrl(appBase, this), this.$$parse = function (url) {
                var pathUrl = beginsWith(appBaseNoFile, url);
                if (!isString(pathUrl))throw $locationMinErr("ipthprfx", 'Invalid url "{0}", missing path prefix "{1}".', url, appBaseNoFile);
                parseAppUrl(pathUrl, this), this.$$path || (this.$$path = "/"), this.$$compose()
            }, this.$$compose = function () {
                var search = toKeyValue(this.$$search), hash = this.$$hash ? "#" + encodeUriSegment(this.$$hash) : "";
                this.$$url = encodePath(this.$$path) + (search ? "?" + search : "") + hash, this.$$absUrl = appBaseNoFile + this.$$url.substr(1)
            }, this.$$parseLinkUrl = function (url, relHref) {
                if (relHref && "#" === relHref[0])return this.hash(relHref.slice(1)), !0;
                var appUrl, prevAppUrl, rewrittenUrl;
                return (appUrl = beginsWith(appBase, url)) !== undefined ? (prevAppUrl = appUrl, rewrittenUrl = (appUrl = beginsWith(basePrefix, appUrl)) !== undefined ? appBaseNoFile + (beginsWith("/", appUrl) || appUrl) : appBase + prevAppUrl) : (appUrl = beginsWith(appBaseNoFile, url)) !== undefined ? rewrittenUrl = appBaseNoFile + appUrl : appBaseNoFile == url + "/" && (rewrittenUrl = appBaseNoFile), rewrittenUrl && this.$$parse(rewrittenUrl), !!rewrittenUrl
            }
        }

        function LocationHashbangUrl(appBase, hashPrefix) {
            var appBaseNoFile = stripFile(appBase);
            parseAbsoluteUrl(appBase, this), this.$$parse = function (url) {
                function removeWindowsDriveName(path, url, base) {
                    var firstPathSegmentMatch, windowsFilePathExp = /^\/[A-Z]:(\/.*)/;
                    return 0 === url.indexOf(base) && (url = url.replace(base, "")), windowsFilePathExp.exec(url) ? path : (firstPathSegmentMatch = windowsFilePathExp.exec(path), firstPathSegmentMatch ? firstPathSegmentMatch[1] : path)
                }

                var withoutHashUrl, withoutBaseUrl = beginsWith(appBase, url) || beginsWith(appBaseNoFile, url);
                "#" === withoutBaseUrl.charAt(0) ? (withoutHashUrl = beginsWith(hashPrefix, withoutBaseUrl), isUndefined(withoutHashUrl) && (withoutHashUrl = withoutBaseUrl)) : withoutHashUrl = this.$$html5 ? withoutBaseUrl : "", parseAppUrl(withoutHashUrl, this), this.$$path = removeWindowsDriveName(this.$$path, withoutHashUrl, appBase), this.$$compose()
            }, this.$$compose = function () {
                var search = toKeyValue(this.$$search), hash = this.$$hash ? "#" + encodeUriSegment(this.$$hash) : "";
                this.$$url = encodePath(this.$$path) + (search ? "?" + search : "") + hash, this.$$absUrl = appBase + (this.$$url ? hashPrefix + this.$$url : "")
            }, this.$$parseLinkUrl = function (url) {
                return stripHash(appBase) == stripHash(url) ? (this.$$parse(url), !0) : !1
            }
        }

        function LocationHashbangInHtml5Url(appBase, hashPrefix) {
            this.$$html5 = !0, LocationHashbangUrl.apply(this, arguments);
            var appBaseNoFile = stripFile(appBase);
            this.$$parseLinkUrl = function (url, relHref) {
                if (relHref && "#" === relHref[0])return this.hash(relHref.slice(1)), !0;
                var rewrittenUrl, appUrl;
                return appBase == stripHash(url) ? rewrittenUrl = url : (appUrl = beginsWith(appBaseNoFile, url)) ? rewrittenUrl = appBase + hashPrefix + appUrl : appBaseNoFile === url + "/" && (rewrittenUrl = appBaseNoFile), rewrittenUrl && this.$$parse(rewrittenUrl), !!rewrittenUrl
            }, this.$$compose = function () {
                var search = toKeyValue(this.$$search), hash = this.$$hash ? "#" + encodeUriSegment(this.$$hash) : "";
                this.$$url = encodePath(this.$$path) + (search ? "?" + search : "") + hash, this.$$absUrl = appBase + hashPrefix + this.$$url
            }
        }

        function locationGetter(property) {
            return function () {
                return this[property]
            }
        }

        function locationGetterSetter(property, preprocess) {
            return function (value) {
                return isUndefined(value) ? this[property] : (this[property] = preprocess(value), this.$$compose(), this)
            }
        }

        function $LocationProvider() {
            var hashPrefix = "", html5Mode = {enabled: !1, requireBase: !0, rewriteLinks: !0};
            this.hashPrefix = function (prefix) {
                return isDefined(prefix) ? (hashPrefix = prefix, this) : hashPrefix
            }, this.html5Mode = function (mode) {
                return isBoolean(mode) ? (html5Mode.enabled = mode, this) : isObject(mode) ? (isBoolean(mode.enabled) && (html5Mode.enabled = mode.enabled), isBoolean(mode.requireBase) && (html5Mode.requireBase = mode.requireBase), isBoolean(mode.rewriteLinks) && (html5Mode.rewriteLinks = mode.rewriteLinks), this) : html5Mode
            }, this.$get = ["$rootScope", "$browser", "$sniffer", "$rootElement", "$window", function ($rootScope, $browser, $sniffer, $rootElement, $window) {
                function setBrowserUrlWithFallback(url, replace, state) {
                    var oldUrl = $location.url(), oldState = $location.$$state;
                    try {
                        $browser.url(url, replace, state), $location.$$state = $browser.state()
                    } catch (e) {
                        throw $location.url(oldUrl), $location.$$state = oldState, e
                    }
                }

                function afterLocationChange(oldUrl, oldState) {
                    $rootScope.$broadcast("$locationChangeSuccess", $location.absUrl(), oldUrl, $location.$$state, oldState)
                }

                var $location, LocationMode, appBase, baseHref = $browser.baseHref(), initialUrl = $browser.url();
                if (html5Mode.enabled) {
                    if (!baseHref && html5Mode.requireBase)throw $locationMinErr("nobase", "$location in HTML5 mode requires a <base> tag to be present!");
                    appBase = serverBase(initialUrl) + (baseHref || "/"), LocationMode = $sniffer.history ? LocationHtml5Url : LocationHashbangInHtml5Url
                } else appBase = stripHash(initialUrl), LocationMode = LocationHashbangUrl;
                $location = new LocationMode(appBase, "#" + hashPrefix), $location.$$parseLinkUrl(initialUrl, initialUrl), $location.$$state = $browser.state();
                var IGNORE_URI_REGEXP = /^\s*(javascript|mailto):/i;
                $rootElement.on("click", function (event) {
                    if (html5Mode.rewriteLinks && !event.ctrlKey && !event.metaKey && 2 != event.which) {
                        for (var elm = jqLite(event.target); "a" !== nodeName_(elm[0]);)if (elm[0] === $rootElement[0] || !(elm = elm.parent())[0])return;
                        var absHref = elm.prop("href"), relHref = elm.attr("href") || elm.attr("xlink:href");
                        isObject(absHref) && "[object SVGAnimatedString]" === absHref.toString() && (absHref = urlResolve(absHref.animVal).href), IGNORE_URI_REGEXP.test(absHref) || !absHref || elm.attr("target") || event.isDefaultPrevented() || $location.$$parseLinkUrl(absHref, relHref) && (event.preventDefault(), $location.absUrl() != $browser.url() && ($rootScope.$apply(), $window.angular["ff-684208-preventDefault"] = !0))
                    }
                }), $location.absUrl() != initialUrl && $browser.url($location.absUrl(), !0);
                var initializing = !0;
                return $browser.onUrlChange(function (newUrl, newState) {
                    $rootScope.$evalAsync(function () {
                        var defaultPrevented, oldUrl = $location.absUrl(), oldState = $location.$$state;
                        $location.$$parse(newUrl), $location.$$state = newState, defaultPrevented = $rootScope.$broadcast("$locationChangeStart", newUrl, oldUrl, newState, oldState).defaultPrevented, $location.absUrl() === newUrl && (defaultPrevented ? ($location.$$parse(oldUrl), $location.$$state = oldState, setBrowserUrlWithFallback(oldUrl, !1, oldState)) : (initializing = !1, afterLocationChange(oldUrl, oldState)))
                    }), $rootScope.$$phase || $rootScope.$digest()
                }), $rootScope.$watch(function () {
                    var oldUrl = trimEmptyHash($browser.url()), newUrl = trimEmptyHash($location.absUrl()), oldState = $browser.state(), currentReplace = $location.$$replace, urlOrStateChanged = oldUrl !== newUrl || $location.$$html5 && $sniffer.history && oldState !== $location.$$state;
                    (initializing || urlOrStateChanged) && (initializing = !1, $rootScope.$evalAsync(function () {
                        var newUrl = $location.absUrl(), defaultPrevented = $rootScope.$broadcast("$locationChangeStart", newUrl, oldUrl, $location.$$state, oldState).defaultPrevented;
                        $location.absUrl() === newUrl && (defaultPrevented ? ($location.$$parse(oldUrl), $location.$$state = oldState) : (urlOrStateChanged && setBrowserUrlWithFallback(newUrl, currentReplace, oldState === $location.$$state ? null : $location.$$state), afterLocationChange(oldUrl, oldState)))
                    })), $location.$$replace = !1
                }), $location
            }]
        }

        function $LogProvider() {
            var debug = !0, self = this;
            this.debugEnabled = function (flag) {
                return isDefined(flag) ? (debug = flag, this) : debug
            }, this.$get = ["$window", function ($window) {
                function formatError(arg) {
                    return arg instanceof Error && (arg.stack ? arg = arg.message && -1 === arg.stack.indexOf(arg.message) ? "Error: " + arg.message + "\n" + arg.stack : arg.stack : arg.sourceURL && (arg = arg.message + "\n" + arg.sourceURL + ":" + arg.line)), arg
                }

                function consoleLog(type) {
                    var console = $window.console || {}, logFn = console[type] || console.log || noop, hasApply = !1;
                    try {
                        hasApply = !!logFn.apply
                    } catch (e) {
                    }
                    return hasApply ? function () {
                        var args = [];
                        return forEach(arguments, function (arg) {
                            args.push(formatError(arg))
                        }), logFn.apply(console, args)
                    } : function (arg1, arg2) {
                        logFn(arg1, null == arg2 ? "" : arg2)
                    }
                }

                return {
                    log: consoleLog("log"),
                    info: consoleLog("info"),
                    warn: consoleLog("warn"),
                    error: consoleLog("error"),
                    debug: function () {
                        var fn = consoleLog("debug");
                        return function () {
                            debug && fn.apply(self, arguments)
                        }
                    }()
                }
            }]
        }

        function ensureSafeMemberName(name, fullExpression) {
            if ("__defineGetter__" === name || "__defineSetter__" === name || "__lookupGetter__" === name || "__lookupSetter__" === name || "__proto__" === name)throw $parseMinErr("isecfld", "Attempting to access a disallowed field in Angular expressions! Expression: {0}", fullExpression);
            return name
        }

        function ensureSafeObject(obj, fullExpression) {
            if (obj) {
                if (obj.constructor === obj)throw $parseMinErr("isecfn", "Referencing Function in Angular expressions is disallowed! Expression: {0}", fullExpression);
                if (obj.window === obj)throw $parseMinErr("isecwindow", "Referencing the Window in Angular expressions is disallowed! Expression: {0}", fullExpression);
                if (obj.children && (obj.nodeName || obj.prop && obj.attr && obj.find))throw $parseMinErr("isecdom", "Referencing DOM nodes in Angular expressions is disallowed! Expression: {0}", fullExpression);
                if (obj === Object)throw $parseMinErr("isecobj", "Referencing Object in Angular expressions is disallowed! Expression: {0}", fullExpression)
            }
            return obj
        }

        function ensureSafeFunction(obj, fullExpression) {
            if (obj) {
                if (obj.constructor === obj)throw $parseMinErr("isecfn", "Referencing Function in Angular expressions is disallowed! Expression: {0}", fullExpression);
                if (obj === CALL || obj === APPLY || obj === BIND)throw $parseMinErr("isecff", "Referencing call, apply or bind in Angular expressions is disallowed! Expression: {0}", fullExpression)
            }
        }

        function isConstant(exp) {
            return exp.constant
        }

        function setter(obj, path, setValue, fullExp) {
            ensureSafeObject(obj, fullExp);
            for (var key, element = path.split("."), i = 0; element.length > 1; i++) {
                key = ensureSafeMemberName(element.shift(), fullExp);
                var propertyObj = ensureSafeObject(obj[key], fullExp);
                propertyObj || (propertyObj = {}, obj[key] = propertyObj), obj = propertyObj
            }
            return key = ensureSafeMemberName(element.shift(), fullExp), ensureSafeObject(obj[key], fullExp), obj[key] = setValue, setValue
        }

        function isPossiblyDangerousMemberName(name) {
            return "constructor" == name
        }

        function cspSafeGetterFn(key0, key1, key2, key3, key4, fullExp, expensiveChecks) {
            ensureSafeMemberName(key0, fullExp), ensureSafeMemberName(key1, fullExp), ensureSafeMemberName(key2, fullExp), ensureSafeMemberName(key3, fullExp), ensureSafeMemberName(key4, fullExp);
            var eso = function (o) {
                return ensureSafeObject(o, fullExp)
            }, eso0 = expensiveChecks || isPossiblyDangerousMemberName(key0) ? eso : identity, eso1 = expensiveChecks || isPossiblyDangerousMemberName(key1) ? eso : identity, eso2 = expensiveChecks || isPossiblyDangerousMemberName(key2) ? eso : identity, eso3 = expensiveChecks || isPossiblyDangerousMemberName(key3) ? eso : identity, eso4 = expensiveChecks || isPossiblyDangerousMemberName(key4) ? eso : identity;
            return function (scope, locals) {
                var pathVal = locals && locals.hasOwnProperty(key0) ? locals : scope;
                return null == pathVal ? pathVal : (pathVal = eso0(pathVal[key0]), key1 ? null == pathVal ? undefined : (pathVal = eso1(pathVal[key1]), key2 ? null == pathVal ? undefined : (pathVal = eso2(pathVal[key2]), key3 ? null == pathVal ? undefined : (pathVal = eso3(pathVal[key3]), key4 ? null == pathVal ? undefined : pathVal = eso4(pathVal[key4]) : pathVal) : pathVal) : pathVal) : pathVal)
            }
        }

        function getterFnWithEnsureSafeObject(fn, fullExpression) {
            return function (s, l) {
                return fn(s, l, ensureSafeObject, fullExpression)
            }
        }

        function getterFn(path, options, fullExp) {
            var expensiveChecks = options.expensiveChecks, getterFnCache = expensiveChecks ? getterFnCacheExpensive : getterFnCacheDefault, fn = getterFnCache[path];
            if (fn)return fn;
            var pathKeys = path.split("."), pathKeysLength = pathKeys.length;
            if (options.csp)fn = 6 > pathKeysLength ? cspSafeGetterFn(pathKeys[0], pathKeys[1], pathKeys[2], pathKeys[3], pathKeys[4], fullExp, expensiveChecks) : function (scope, locals) {
                var val, i = 0;
                do val = cspSafeGetterFn(pathKeys[i++], pathKeys[i++], pathKeys[i++], pathKeys[i++], pathKeys[i++], fullExp, expensiveChecks)(scope, locals), locals = undefined, scope = val; while (pathKeysLength > i);
                return val
            }; else {
                var code = "";
                expensiveChecks && (code += "s = eso(s, fe);\nl = eso(l, fe);\n");
                var needsEnsureSafeObject = expensiveChecks;
                forEach(pathKeys, function (key, index) {
                    ensureSafeMemberName(key, fullExp);
                    var lookupJs = (index ? "s" : '((l&&l.hasOwnProperty("' + key + '"))?l:s)') + "." + key;
                    (expensiveChecks || isPossiblyDangerousMemberName(key)) && (lookupJs = "eso(" + lookupJs + ", fe)", needsEnsureSafeObject = !0), code += "if(s == null) return undefined;\ns=" + lookupJs + ";\n"
                }), code += "return s;";
                var evaledFnGetter = new Function("s", "l", "eso", "fe", code);
                evaledFnGetter.toString = valueFn(code), needsEnsureSafeObject && (evaledFnGetter = getterFnWithEnsureSafeObject(evaledFnGetter, fullExp)), fn = evaledFnGetter
            }
            return fn.sharedGetter = !0, fn.assign = function (self, value) {
                return setter(self, path, value, path)
            }, getterFnCache[path] = fn, fn
        }

        function getValueOf(value) {
            return isFunction(value.valueOf) ? value.valueOf() : objectValueOf.call(value)
        }

        function $ParseProvider() {
            var cacheDefault = createMap(), cacheExpensive = createMap();
            this.$get = ["$filter", "$sniffer", function ($filter, $sniffer) {
                function wrapSharedExpression(exp) {
                    var wrapped = exp;
                    return exp.sharedGetter && (wrapped = function (self, locals) {
                        return exp(self, locals)
                    }, wrapped.literal = exp.literal, wrapped.constant = exp.constant, wrapped.assign = exp.assign), wrapped
                }

                function collectExpressionInputs(inputs, list) {
                    for (var i = 0, ii = inputs.length; ii > i; i++) {
                        var input = inputs[i];
                        input.constant || (input.inputs ? collectExpressionInputs(input.inputs, list) : -1 === list.indexOf(input) && list.push(input))
                    }
                    return list
                }

                function expressionInputDirtyCheck(newValue, oldValueOfValue) {
                    return null == newValue || null == oldValueOfValue ? newValue === oldValueOfValue : "object" == typeof newValue && (newValue = getValueOf(newValue), "object" == typeof newValue) ? !1 : newValue === oldValueOfValue || newValue !== newValue && oldValueOfValue !== oldValueOfValue
                }

                function inputsWatchDelegate(scope, listener, objectEquality, parsedExpression) {
                    var lastResult, inputExpressions = parsedExpression.$$inputs || (parsedExpression.$$inputs = collectExpressionInputs(parsedExpression.inputs, []));
                    if (1 === inputExpressions.length) {
                        var oldInputValue = expressionInputDirtyCheck;
                        return inputExpressions = inputExpressions[0], scope.$watch(function (scope) {
                            var newInputValue = inputExpressions(scope);
                            return expressionInputDirtyCheck(newInputValue, oldInputValue) || (lastResult = parsedExpression(scope), oldInputValue = newInputValue && getValueOf(newInputValue)), lastResult
                        }, listener, objectEquality)
                    }
                    for (var oldInputValueOfValues = [], i = 0, ii = inputExpressions.length; ii > i; i++)oldInputValueOfValues[i] = expressionInputDirtyCheck;
                    return scope.$watch(function (scope) {
                        for (var changed = !1, i = 0, ii = inputExpressions.length; ii > i; i++) {
                            var newInputValue = inputExpressions[i](scope);
                            (changed || (changed = !expressionInputDirtyCheck(newInputValue, oldInputValueOfValues[i]))) && (oldInputValueOfValues[i] = newInputValue && getValueOf(newInputValue))
                        }
                        return changed && (lastResult = parsedExpression(scope)), lastResult
                    }, listener, objectEquality)
                }

                function oneTimeWatchDelegate(scope, listener, objectEquality, parsedExpression) {
                    var unwatch, lastValue;
                    return unwatch = scope.$watch(function (scope) {
                        return parsedExpression(scope)
                    }, function (value, old, scope) {
                        lastValue = value, isFunction(listener) && listener.apply(this, arguments), isDefined(value) && scope.$$postDigest(function () {
                            isDefined(lastValue) && unwatch()
                        })
                    }, objectEquality)
                }

                function oneTimeLiteralWatchDelegate(scope, listener, objectEquality, parsedExpression) {
                    function isAllDefined(value) {
                        var allDefined = !0;
                        return forEach(value, function (val) {
                            isDefined(val) || (allDefined = !1)
                        }), allDefined
                    }

                    var unwatch, lastValue;
                    return unwatch = scope.$watch(function (scope) {
                        return parsedExpression(scope)
                    }, function (value, old, scope) {
                        lastValue = value, isFunction(listener) && listener.call(this, value, old, scope), isAllDefined(value) && scope.$$postDigest(function () {
                            isAllDefined(lastValue) && unwatch()
                        })
                    }, objectEquality)
                }

                function constantWatchDelegate(scope, listener, objectEquality, parsedExpression) {
                    var unwatch;
                    return unwatch = scope.$watch(function (scope) {
                        return parsedExpression(scope)
                    }, function () {
                        isFunction(listener) && listener.apply(this, arguments), unwatch()
                    }, objectEquality)
                }

                function addInterceptor(parsedExpression, interceptorFn) {
                    if (!interceptorFn)return parsedExpression;
                    var watchDelegate = parsedExpression.$$watchDelegate, regularWatch = watchDelegate !== oneTimeLiteralWatchDelegate && watchDelegate !== oneTimeWatchDelegate, fn = regularWatch ? function (scope, locals) {
                        var value = parsedExpression(scope, locals);
                        return interceptorFn(value, scope, locals)
                    } : function (scope, locals) {
                        var value = parsedExpression(scope, locals), result = interceptorFn(value, scope, locals);
                        return isDefined(value) ? result : value
                    };
                    return parsedExpression.$$watchDelegate && parsedExpression.$$watchDelegate !== inputsWatchDelegate ? fn.$$watchDelegate = parsedExpression.$$watchDelegate : interceptorFn.$stateful || (fn.$$watchDelegate = inputsWatchDelegate, fn.inputs = [parsedExpression]), fn
                }

                var $parseOptions = {
                    csp: $sniffer.csp,
                    expensiveChecks: !1
                }, $parseOptionsExpensive = {csp: $sniffer.csp, expensiveChecks: !0};
                return function (exp, interceptorFn, expensiveChecks) {
                    var parsedExpression, oneTime, cacheKey;
                    switch (typeof exp) {
                        case"string":
                            cacheKey = exp = exp.trim();
                            var cache = expensiveChecks ? cacheExpensive : cacheDefault;
                            if (parsedExpression = cache[cacheKey], !parsedExpression) {
                                ":" === exp.charAt(0) && ":" === exp.charAt(1) && (oneTime = !0, exp = exp.substring(2));
                                var parseOptions = expensiveChecks ? $parseOptionsExpensive : $parseOptions, lexer = new Lexer(parseOptions), parser = new Parser(lexer, $filter, parseOptions);
                                parsedExpression = parser.parse(exp), parsedExpression.constant ? parsedExpression.$$watchDelegate = constantWatchDelegate : oneTime ? (parsedExpression = wrapSharedExpression(parsedExpression), parsedExpression.$$watchDelegate = parsedExpression.literal ? oneTimeLiteralWatchDelegate : oneTimeWatchDelegate) : parsedExpression.inputs && (parsedExpression.$$watchDelegate = inputsWatchDelegate), cache[cacheKey] = parsedExpression
                            }
                            return addInterceptor(parsedExpression, interceptorFn);
                        case"function":
                            return addInterceptor(exp, interceptorFn);
                        default:
                            return addInterceptor(noop, interceptorFn)
                    }
                }
            }]
        }

        function $QProvider() {
            this.$get = ["$rootScope", "$exceptionHandler", function ($rootScope, $exceptionHandler) {
                return qFactory(function (callback) {
                    $rootScope.$evalAsync(callback)
                }, $exceptionHandler)
            }]
        }

        function $$QProvider() {
            this.$get = ["$browser", "$exceptionHandler", function ($browser, $exceptionHandler) {
                return qFactory(function (callback) {
                    $browser.defer(callback)
                }, $exceptionHandler)
            }]
        }

        function qFactory(nextTick, exceptionHandler) {
            function callOnce(self, resolveFn, rejectFn) {
                function wrap(fn) {
                    return function (value) {
                        called || (called = !0, fn.call(self, value))
                    }
                }

                var called = !1;
                return [wrap(resolveFn), wrap(rejectFn)]
            }

            function Promise() {
                this.$$state = {status: 0}
            }

            function simpleBind(context, fn) {
                return function (value) {
                    fn.call(context, value)
                }
            }

            function processQueue(state) {
                var fn, promise, pending;
                pending = state.pending, state.processScheduled = !1, state.pending = undefined;
                for (var i = 0, ii = pending.length; ii > i; ++i) {
                    promise = pending[i][0], fn = pending[i][state.status];
                    try {
                        isFunction(fn) ? promise.resolve(fn(state.value)) : 1 === state.status ? promise.resolve(state.value) : promise.reject(state.value)
                    } catch (e) {
                        promise.reject(e), exceptionHandler(e)
                    }
                }
            }

            function scheduleProcessQueue(state) {
                !state.processScheduled && state.pending && (state.processScheduled = !0, nextTick(function () {
                    processQueue(state)
                }))
            }

            function Deferred() {
                this.promise = new Promise, this.resolve = simpleBind(this, this.resolve), this.reject = simpleBind(this, this.reject), this.notify = simpleBind(this, this.notify)
            }

            function all(promises) {
                var deferred = new Deferred, counter = 0, results = isArray(promises) ? [] : {};
                return forEach(promises, function (promise, key) {
                    counter++, when(promise).then(function (value) {
                        results.hasOwnProperty(key) || (results[key] = value, --counter || deferred.resolve(results))
                    }, function (reason) {
                        results.hasOwnProperty(key) || deferred.reject(reason)
                    })
                }), 0 === counter && deferred.resolve(results), deferred.promise
            }

            var $qMinErr = minErr("$q", TypeError), defer = function () {
                return new Deferred
            };
            Promise.prototype = {
                then: function (onFulfilled, onRejected, progressBack) {
                    var result = new Deferred;
                    return this.$$state.pending = this.$$state.pending || [], this.$$state.pending.push([result, onFulfilled, onRejected, progressBack]), this.$$state.status > 0 && scheduleProcessQueue(this.$$state), result.promise
                }, "catch": function (callback) {
                    return this.then(null, callback)
                }, "finally": function (callback, progressBack) {
                    return this.then(function (value) {
                        return handleCallback(value, !0, callback)
                    }, function (error) {
                        return handleCallback(error, !1, callback)
                    }, progressBack)
                }
            }, Deferred.prototype = {
                resolve: function (val) {
                    this.promise.$$state.status || (val === this.promise ? this.$$reject($qMinErr("qcycle", "Expected promise to be resolved with value other than itself '{0}'", val)) : this.$$resolve(val))
                }, $$resolve: function (val) {
                    var then, fns;
                    fns = callOnce(this, this.$$resolve, this.$$reject);
                    try {
                        (isObject(val) || isFunction(val)) && (then = val && val.then), isFunction(then) ? (this.promise.$$state.status = -1, then.call(val, fns[0], fns[1], this.notify)) : (this.promise.$$state.value = val, this.promise.$$state.status = 1, scheduleProcessQueue(this.promise.$$state))
                    } catch (e) {
                        fns[1](e), exceptionHandler(e)
                    }
                }, reject: function (reason) {
                    this.promise.$$state.status || this.$$reject(reason)
                }, $$reject: function (reason) {
                    this.promise.$$state.value = reason, this.promise.$$state.status = 2, scheduleProcessQueue(this.promise.$$state)
                }, notify: function (progress) {
                    var callbacks = this.promise.$$state.pending;
                    this.promise.$$state.status <= 0 && callbacks && callbacks.length && nextTick(function () {
                        for (var callback, result, i = 0, ii = callbacks.length; ii > i; i++) {
                            result = callbacks[i][0], callback = callbacks[i][3];
                            try {
                                result.notify(isFunction(callback) ? callback(progress) : progress)
                            } catch (e) {
                                exceptionHandler(e)
                            }
                        }
                    })
                }
            };
            var reject = function (reason) {
                var result = new Deferred;
                return result.reject(reason), result.promise
            }, makePromise = function (value, resolved) {
                var result = new Deferred;
                return resolved ? result.resolve(value) : result.reject(value), result.promise
            }, handleCallback = function (value, isResolved, callback) {
                var callbackOutput = null;
                try {
                    isFunction(callback) && (callbackOutput = callback())
                } catch (e) {
                    return makePromise(e, !1)
                }
                return isPromiseLike(callbackOutput) ? callbackOutput.then(function () {
                    return makePromise(value, isResolved)
                }, function (error) {
                    return makePromise(error, !1)
                }) : makePromise(value, isResolved)
            }, when = function (value, callback, errback, progressBack) {
                var result = new Deferred;
                return result.resolve(value), result.promise.then(callback, errback, progressBack)
            }, $Q = function Q(resolver) {
                function resolveFn(value) {
                    deferred.resolve(value)
                }

                function rejectFn(reason) {
                    deferred.reject(reason)
                }

                if (!isFunction(resolver))throw $qMinErr("norslvr", "Expected resolverFn, got '{0}'", resolver);
                if (!(this instanceof Q))return new Q(resolver);
                var deferred = new Deferred;
                return resolver(resolveFn, rejectFn), deferred.promise
            };
            return $Q.defer = defer, $Q.reject = reject, $Q.when = when, $Q.all = all, $Q
        }

        function $$RAFProvider() {
            this.$get = ["$window", "$timeout", function ($window, $timeout) {
                var requestAnimationFrame = $window.requestAnimationFrame || $window.webkitRequestAnimationFrame, cancelAnimationFrame = $window.cancelAnimationFrame || $window.webkitCancelAnimationFrame || $window.webkitCancelRequestAnimationFrame, rafSupported = !!requestAnimationFrame, raf = rafSupported ? function (fn) {
                    var id = requestAnimationFrame(fn);
                    return function () {
                        cancelAnimationFrame(id)
                    }
                } : function (fn) {
                    var timer = $timeout(fn, 16.66, !1);
                    return function () {
                        $timeout.cancel(timer)
                    }
                };
                return raf.supported = rafSupported, raf
            }]
        }

        function $RootScopeProvider() {
            var TTL = 10, $rootScopeMinErr = minErr("$rootScope"), lastDirtyWatch = null, applyAsyncId = null;
            this.digestTtl = function (value) {
                return arguments.length && (TTL = value), TTL
            }, this.$get = ["$injector", "$exceptionHandler", "$parse", "$browser", function ($injector, $exceptionHandler, $parse, $browser) {
                function Scope() {
                    this.$id = nextUid(), this.$$phase = this.$parent = this.$$watchers = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = null, this.$root = this, this.$$destroyed = !1, this.$$listeners = {}, this.$$listenerCount = {}, this.$$isolateBindings = null
                }

                function beginPhase(phase) {
                    if ($rootScope.$$phase)throw $rootScopeMinErr("inprog", "{0} already in progress", $rootScope.$$phase);
                    $rootScope.$$phase = phase
                }

                function clearPhase() {
                    $rootScope.$$phase = null
                }

                function decrementListenerCount(current, count, name) {
                    do current.$$listenerCount[name] -= count, 0 === current.$$listenerCount[name] && delete current.$$listenerCount[name]; while (current = current.$parent)
                }

                function initWatchVal() {
                }

                function flushApplyAsync() {
                    for (; applyAsyncQueue.length;)try {
                        applyAsyncQueue.shift()()
                    } catch (e) {
                        $exceptionHandler(e)
                    }
                    applyAsyncId = null
                }

                function scheduleApplyAsync() {
                    null === applyAsyncId && (applyAsyncId = $browser.defer(function () {
                        $rootScope.$apply(flushApplyAsync)
                    }))
                }

                Scope.prototype = {
                    constructor: Scope, $new: function (isolate, parent) {
                        function destroyChild() {
                            child.$$destroyed = !0
                        }

                        var child;
                        return parent = parent || this, isolate ? (child = new Scope, child.$root = this.$root) : (this.$$ChildScope || (this.$$ChildScope = function () {
                            this.$$watchers = this.$$nextSibling = this.$$childHead = this.$$childTail = null, this.$$listeners = {}, this.$$listenerCount = {}, this.$id = nextUid(), this.$$ChildScope = null
                        }, this.$$ChildScope.prototype = this), child = new this.$$ChildScope), child.$parent = parent, child.$$prevSibling = parent.$$childTail, parent.$$childHead ? (parent.$$childTail.$$nextSibling = child, parent.$$childTail = child) : parent.$$childHead = parent.$$childTail = child, (isolate || parent != this) && child.$on("$destroy", destroyChild), child
                    }, $watch: function (watchExp, listener, objectEquality) {
                        var get = $parse(watchExp);
                        if (get.$$watchDelegate)return get.$$watchDelegate(this, listener, objectEquality, get);
                        var scope = this, array = scope.$$watchers, watcher = {
                            fn: listener,
                            last: initWatchVal,
                            get: get,
                            exp: watchExp,
                            eq: !!objectEquality
                        };
                        return lastDirtyWatch = null, isFunction(listener) || (watcher.fn = noop), array || (array = scope.$$watchers = []), array.unshift(watcher), function () {
                            arrayRemove(array, watcher), lastDirtyWatch = null
                        }
                    }, $watchGroup: function (watchExpressions, listener) {
                        function watchGroupAction() {
                            changeReactionScheduled = !1, firstRun ? (firstRun = !1, listener(newValues, newValues, self)) : listener(newValues, oldValues, self)
                        }

                        var oldValues = new Array(watchExpressions.length), newValues = new Array(watchExpressions.length), deregisterFns = [], self = this, changeReactionScheduled = !1, firstRun = !0;
                        if (!watchExpressions.length) {
                            var shouldCall = !0;
                            return self.$evalAsync(function () {
                                shouldCall && listener(newValues, newValues, self)
                            }), function () {
                                shouldCall = !1
                            }
                        }
                        return 1 === watchExpressions.length ? this.$watch(watchExpressions[0], function (value, oldValue, scope) {
                            newValues[0] = value, oldValues[0] = oldValue, listener(newValues, value === oldValue ? newValues : oldValues, scope)
                        }) : (forEach(watchExpressions, function (expr, i) {
                            var unwatchFn = self.$watch(expr, function (value, oldValue) {
                                newValues[i] = value, oldValues[i] = oldValue, changeReactionScheduled || (changeReactionScheduled = !0, self.$evalAsync(watchGroupAction))
                            });
                            deregisterFns.push(unwatchFn)
                        }), function () {
                            for (; deregisterFns.length;)deregisterFns.shift()()
                        })
                    }, $watchCollection: function (obj, listener) {
                        function $watchCollectionInterceptor(_value) {
                            newValue = _value;
                            var newLength, key, bothNaN, newItem, oldItem;
                            if (!isUndefined(newValue)) {
                                if (isObject(newValue))if (isArrayLike(newValue)) {
                                    oldValue !== internalArray && (oldValue = internalArray, oldLength = oldValue.length = 0, changeDetected++), newLength = newValue.length, oldLength !== newLength && (changeDetected++, oldValue.length = oldLength = newLength);
                                    for (var i = 0; newLength > i; i++)oldItem = oldValue[i], newItem = newValue[i], bothNaN = oldItem !== oldItem && newItem !== newItem, bothNaN || oldItem === newItem || (changeDetected++, oldValue[i] = newItem)
                                } else {
                                    oldValue !== internalObject && (oldValue = internalObject = {}, oldLength = 0, changeDetected++), newLength = 0;
                                    for (key in newValue)newValue.hasOwnProperty(key) && (newLength++, newItem = newValue[key], oldItem = oldValue[key], key in oldValue ? (bothNaN = oldItem !== oldItem && newItem !== newItem, bothNaN || oldItem === newItem || (changeDetected++, oldValue[key] = newItem)) : (oldLength++, oldValue[key] = newItem, changeDetected++));
                                    if (oldLength > newLength) {
                                        changeDetected++;
                                        for (key in oldValue)newValue.hasOwnProperty(key) || (oldLength--, delete oldValue[key])
                                    }
                                } else oldValue !== newValue && (oldValue = newValue, changeDetected++);
                                return changeDetected
                            }
                        }

                        function $watchCollectionAction() {
                            if (initRun ? (initRun = !1, listener(newValue, newValue, self)) : listener(newValue, veryOldValue, self), trackVeryOldValue)if (isObject(newValue))if (isArrayLike(newValue)) {
                                veryOldValue = new Array(newValue.length);
                                for (var i = 0; i < newValue.length; i++)veryOldValue[i] = newValue[i]
                            } else {
                                veryOldValue = {};
                                for (var key in newValue)hasOwnProperty.call(newValue, key) && (veryOldValue[key] = newValue[key])
                            } else veryOldValue = newValue
                        }

                        $watchCollectionInterceptor.$stateful = !0;
                        var newValue, oldValue, veryOldValue, self = this, trackVeryOldValue = listener.length > 1, changeDetected = 0, changeDetector = $parse(obj, $watchCollectionInterceptor), internalArray = [], internalObject = {}, initRun = !0, oldLength = 0;
                        return this.$watch(changeDetector, $watchCollectionAction)
                    }, $digest: function () {
                        var watch, value, last, watchers, length, dirty, next, current, logIdx, asyncTask, ttl = TTL, target = this, watchLog = [];
                        beginPhase("$digest"), $browser.$$checkUrlChange(), this === $rootScope && null !== applyAsyncId && ($browser.defer.cancel(applyAsyncId), flushApplyAsync()), lastDirtyWatch = null;
                        do {
                            for (dirty = !1, current = target; asyncQueue.length;) {
                                try {
                                    asyncTask = asyncQueue.shift(), asyncTask.scope.$eval(asyncTask.expression, asyncTask.locals)
                                } catch (e) {
                                    $exceptionHandler(e)
                                }
                                lastDirtyWatch = null
                            }
                            traverseScopesLoop:do {
                                if (watchers = current.$$watchers)for (length = watchers.length; length--;)try {
                                    if (watch = watchers[length])if ((value = watch.get(current)) === (last = watch.last) || (watch.eq ? equals(value, last) : "number" == typeof value && "number" == typeof last && isNaN(value) && isNaN(last))) {
                                        if (watch === lastDirtyWatch) {
                                            dirty = !1;
                                            break traverseScopesLoop
                                        }
                                    } else dirty = !0, lastDirtyWatch = watch, watch.last = watch.eq ? copy(value, null) : value, watch.fn(value, last === initWatchVal ? value : last, current), 5 > ttl && (logIdx = 4 - ttl, watchLog[logIdx] || (watchLog[logIdx] = []), watchLog[logIdx].push({
                                        msg: isFunction(watch.exp) ? "fn: " + (watch.exp.name || watch.exp.toString()) : watch.exp,
                                        newVal: value,
                                        oldVal: last
                                    }))
                                } catch (e) {
                                    $exceptionHandler(e)
                                }
                                if (!(next = current.$$childHead || current !== target && current.$$nextSibling))for (; current !== target && !(next = current.$$nextSibling);)current = current.$parent
                            } while (current = next);
                            if ((dirty || asyncQueue.length) && !ttl--)throw clearPhase(), $rootScopeMinErr("infdig", "{0} $digest() iterations reached. Aborting!\nWatchers fired in the last 5 iterations: {1}", TTL, watchLog)
                        } while (dirty || asyncQueue.length);
                        for (clearPhase(); postDigestQueue.length;)try {
                            postDigestQueue.shift()()
                        } catch (e) {
                            $exceptionHandler(e)
                        }
                    }, $destroy: function () {
                        if (!this.$$destroyed) {
                            var parent = this.$parent;
                            if (this.$broadcast("$destroy"), this.$$destroyed = !0, this !== $rootScope) {
                                for (var eventName in this.$$listenerCount)decrementListenerCount(this, this.$$listenerCount[eventName], eventName);
                                parent.$$childHead == this && (parent.$$childHead = this.$$nextSibling), parent.$$childTail == this && (parent.$$childTail = this.$$prevSibling), this.$$prevSibling && (this.$$prevSibling.$$nextSibling = this.$$nextSibling), this.$$nextSibling && (this.$$nextSibling.$$prevSibling = this.$$prevSibling), this.$destroy = this.$digest = this.$apply = this.$evalAsync = this.$applyAsync = noop, this.$on = this.$watch = this.$watchGroup = function () {
                                    return noop
                                }, this.$$listeners = {}, this.$parent = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = this.$root = this.$$watchers = null
                            }
                        }
                    }, $eval: function (expr, locals) {
                        return $parse(expr)(this, locals)
                    }, $evalAsync: function (expr, locals) {
                        $rootScope.$$phase || asyncQueue.length || $browser.defer(function () {
                            asyncQueue.length && $rootScope.$digest()
                        }), asyncQueue.push({scope: this, expression: expr, locals: locals})
                    }, $$postDigest: function (fn) {
                        postDigestQueue.push(fn)
                    }, $apply: function (expr) {
                        try {
                            return beginPhase("$apply"), this.$eval(expr)
                        } catch (e) {
                            $exceptionHandler(e)
                        } finally {
                            clearPhase();
                            try {
                                $rootScope.$digest()
                            } catch (e) {
                                throw $exceptionHandler(e), e
                            }
                        }
                    }, $applyAsync: function (expr) {
                        function $applyAsyncExpression() {
                            scope.$eval(expr)
                        }

                        var scope = this;
                        expr && applyAsyncQueue.push($applyAsyncExpression), scheduleApplyAsync()
                    }, $on: function (name, listener) {
                        var namedListeners = this.$$listeners[name];
                        namedListeners || (this.$$listeners[name] = namedListeners = []), namedListeners.push(listener);
                        var current = this;
                        do current.$$listenerCount[name] || (current.$$listenerCount[name] = 0), current.$$listenerCount[name]++; while (current = current.$parent);
                        var self = this;
                        return function () {
                            var indexOfListener = namedListeners.indexOf(listener);
                            -1 !== indexOfListener && (namedListeners[indexOfListener] = null, decrementListenerCount(self, 1, name))
                        }
                    }, $emit: function (name) {
                        var namedListeners, i, length, empty = [], scope = this, stopPropagation = !1, event = {
                            name: name,
                            targetScope: scope,
                            stopPropagation: function () {
                                stopPropagation = !0
                            },
                            preventDefault: function () {
                                event.defaultPrevented = !0
                            },
                            defaultPrevented: !1
                        }, listenerArgs = concat([event], arguments, 1);
                        do {
                            for (namedListeners = scope.$$listeners[name] || empty, event.currentScope = scope, i = 0, length = namedListeners.length; length > i; i++)if (namedListeners[i])try {
                                namedListeners[i].apply(null, listenerArgs)
                            } catch (e) {
                                $exceptionHandler(e)
                            } else namedListeners.splice(i, 1), i--, length--;
                            if (stopPropagation)return event.currentScope = null, event;
                            scope = scope.$parent
                        } while (scope);
                        return event.currentScope = null, event
                    }, $broadcast: function (name) {
                        var target = this, current = target, next = target, event = {
                            name: name,
                            targetScope: target,
                            preventDefault: function () {
                                event.defaultPrevented = !0
                            },
                            defaultPrevented: !1
                        };
                        if (!target.$$listenerCount[name])return event;
                        for (var listeners, i, length, listenerArgs = concat([event], arguments, 1); current = next;) {
                            for (event.currentScope = current, listeners = current.$$listeners[name] || [], i = 0, length = listeners.length; length > i; i++)if (listeners[i])try {
                                listeners[i].apply(null, listenerArgs)
                            } catch (e) {
                                $exceptionHandler(e)
                            } else listeners.splice(i, 1), i--, length--;
                            if (!(next = current.$$listenerCount[name] && current.$$childHead || current !== target && current.$$nextSibling))for (; current !== target && !(next = current.$$nextSibling);)current = current.$parent
                        }
                        return event.currentScope = null, event
                    }
                };
                var $rootScope = new Scope, asyncQueue = $rootScope.$$asyncQueue = [], postDigestQueue = $rootScope.$$postDigestQueue = [], applyAsyncQueue = $rootScope.$$applyAsyncQueue = [];
                return $rootScope
            }]
        }

        function $$SanitizeUriProvider() {
            var aHrefSanitizationWhitelist = /^\s*(https?|ftp|mailto|tel|file):/, imgSrcSanitizationWhitelist = /^\s*((https?|ftp|file|blob):|data:image\/)/;
            this.aHrefSanitizationWhitelist = function (regexp) {
                return isDefined(regexp) ? (aHrefSanitizationWhitelist = regexp, this) : aHrefSanitizationWhitelist
            }, this.imgSrcSanitizationWhitelist = function (regexp) {
                return isDefined(regexp) ? (imgSrcSanitizationWhitelist = regexp, this) : imgSrcSanitizationWhitelist
            }, this.$get = function () {
                return function (uri, isImage) {
                    var normalizedVal, regex = isImage ? imgSrcSanitizationWhitelist : aHrefSanitizationWhitelist;
                    return normalizedVal = urlResolve(uri).href, "" === normalizedVal || normalizedVal.match(regex) ? uri : "unsafe:" + normalizedVal
                }
            }
        }

        function adjustMatcher(matcher) {
            if ("self" === matcher)return matcher;
            if (isString(matcher)) {
                if (matcher.indexOf("***") > -1)throw $sceMinErr("iwcard", "Illegal sequence *** in string matcher.  String: {0}", matcher);
                return matcher = escapeForRegexp(matcher).replace("\\*\\*", ".*").replace("\\*", "[^:/.?&;]*"), new RegExp("^" + matcher + "$")
            }
            if (isRegExp(matcher))return new RegExp("^" + matcher.source + "$");
            throw $sceMinErr("imatcher", 'Matchers may only be "self", string patterns or RegExp objects')
        }

        function adjustMatchers(matchers) {
            var adjustedMatchers = [];
            return isDefined(matchers) && forEach(matchers, function (matcher) {
                adjustedMatchers.push(adjustMatcher(matcher))
            }), adjustedMatchers
        }

        function $SceDelegateProvider() {
            this.SCE_CONTEXTS = SCE_CONTEXTS;
            var resourceUrlWhitelist = ["self"], resourceUrlBlacklist = [];
            this.resourceUrlWhitelist = function (value) {
                return arguments.length && (resourceUrlWhitelist = adjustMatchers(value)), resourceUrlWhitelist
            }, this.resourceUrlBlacklist = function (value) {
                return arguments.length && (resourceUrlBlacklist = adjustMatchers(value)), resourceUrlBlacklist
            }, this.$get = ["$injector", function ($injector) {
                function matchUrl(matcher, parsedUrl) {
                    return "self" === matcher ? urlIsSameOrigin(parsedUrl) : !!matcher.exec(parsedUrl.href)
                }

                function isResourceUrlAllowedByPolicy(url) {
                    var i, n, parsedUrl = urlResolve(url.toString()), allowed = !1;
                    for (i = 0, n = resourceUrlWhitelist.length; n > i; i++)if (matchUrl(resourceUrlWhitelist[i], parsedUrl)) {
                        allowed = !0;
                        break
                    }
                    if (allowed)for (i = 0, n = resourceUrlBlacklist.length; n > i; i++)if (matchUrl(resourceUrlBlacklist[i], parsedUrl)) {
                        allowed = !1;
                        break
                    }
                    return allowed
                }

                function generateHolderType(Base) {
                    var holderType = function (trustedValue) {
                        this.$$unwrapTrustedValue = function () {
                            return trustedValue
                        }
                    };
                    return Base && (holderType.prototype = new Base), holderType.prototype.valueOf = function () {
                        return this.$$unwrapTrustedValue()
                    }, holderType.prototype.toString = function () {
                        return this.$$unwrapTrustedValue().toString()
                    }, holderType
                }

                function trustAs(type, trustedValue) {
                    var Constructor = byType.hasOwnProperty(type) ? byType[type] : null;
                    if (!Constructor)throw $sceMinErr("icontext", "Attempted to trust a value in invalid context. Context: {0}; Value: {1}", type, trustedValue);
                    if (null === trustedValue || trustedValue === undefined || "" === trustedValue)return trustedValue;
                    if ("string" != typeof trustedValue)throw $sceMinErr("itype", "Attempted to trust a non-string value in a content requiring a string: Context: {0}", type);
                    return new Constructor(trustedValue)
                }

                function valueOf(maybeTrusted) {
                    return maybeTrusted instanceof trustedValueHolderBase ? maybeTrusted.$$unwrapTrustedValue() : maybeTrusted
                }

                function getTrusted(type, maybeTrusted) {
                    if (null === maybeTrusted || maybeTrusted === undefined || "" === maybeTrusted)return maybeTrusted;
                    var constructor = byType.hasOwnProperty(type) ? byType[type] : null;
                    if (constructor && maybeTrusted instanceof constructor)return maybeTrusted.$$unwrapTrustedValue();
                    if (type === SCE_CONTEXTS.RESOURCE_URL) {
                        if (isResourceUrlAllowedByPolicy(maybeTrusted))return maybeTrusted;
                        throw $sceMinErr("insecurl", "Blocked loading resource from url not allowed by $sceDelegate policy.  URL: {0}", maybeTrusted.toString())
                    }
                    if (type === SCE_CONTEXTS.HTML)return htmlSanitizer(maybeTrusted);
                    throw $sceMinErr("unsafe", "Attempting to use an unsafe value in a safe context.")
                }

                var htmlSanitizer = function () {
                    throw $sceMinErr("unsafe", "Attempting to use an unsafe value in a safe context.")
                };
                $injector.has("$sanitize") && (htmlSanitizer = $injector.get("$sanitize"));
                var trustedValueHolderBase = generateHolderType(), byType = {};
                return byType[SCE_CONTEXTS.HTML] = generateHolderType(trustedValueHolderBase), byType[SCE_CONTEXTS.CSS] = generateHolderType(trustedValueHolderBase), byType[SCE_CONTEXTS.URL] = generateHolderType(trustedValueHolderBase), byType[SCE_CONTEXTS.JS] = generateHolderType(trustedValueHolderBase), byType[SCE_CONTEXTS.RESOURCE_URL] = generateHolderType(byType[SCE_CONTEXTS.URL]), {
                    trustAs: trustAs,
                    getTrusted: getTrusted,
                    valueOf: valueOf
                }
            }]
        }

        function $SceProvider() {
            var enabled = !0;
            this.enabled = function (value) {
                return arguments.length && (enabled = !!value), enabled
            }, this.$get = ["$parse", "$sceDelegate", function ($parse, $sceDelegate) {
                if (enabled && 8 > msie)throw $sceMinErr("iequirks", "Strict Contextual Escaping does not support Internet Explorer version < 11 in quirks mode.  You can fix this by adding the text <!doctype html> to the top of your HTML document.  See http://docs.angularjs.org/api/ng.$sce for more information.");
                var sce = shallowCopy(SCE_CONTEXTS);
                sce.isEnabled = function () {
                    return enabled
                }, sce.trustAs = $sceDelegate.trustAs, sce.getTrusted = $sceDelegate.getTrusted, sce.valueOf = $sceDelegate.valueOf, enabled || (sce.trustAs = sce.getTrusted = function (type, value) {
                    return value
                }, sce.valueOf = identity), sce.parseAs = function (type, expr) {
                    var parsed = $parse(expr);
                    return parsed.literal && parsed.constant ? parsed : $parse(expr, function (value) {
                        return sce.getTrusted(type, value)
                    })
                };
                var parse = sce.parseAs, getTrusted = sce.getTrusted, trustAs = sce.trustAs;
                return forEach(SCE_CONTEXTS, function (enumValue, name) {
                    var lName = lowercase(name);
                    sce[camelCase("parse_as_" + lName)] = function (expr) {
                        return parse(enumValue, expr)
                    }, sce[camelCase("get_trusted_" + lName)] = function (value) {
                        return getTrusted(enumValue, value)
                    }, sce[camelCase("trust_as_" + lName)] = function (value) {
                        return trustAs(enumValue, value)
                    }
                }), sce
            }]
        }

        function $SnifferProvider() {
            this.$get = ["$window", "$document", function ($window, $document) {
                var vendorPrefix, match, eventSupport = {}, android = int((/android (\d+)/.exec(lowercase(($window.navigator || {}).userAgent)) || [])[1]), boxee = /Boxee/i.test(($window.navigator || {}).userAgent), document = $document[0] || {}, vendorRegex = /^(Moz|webkit|ms)(?=[A-Z])/, bodyStyle = document.body && document.body.style, transitions = !1, animations = !1;
                if (bodyStyle) {
                    for (var prop in bodyStyle)if (match = vendorRegex.exec(prop)) {
                        vendorPrefix = match[0], vendorPrefix = vendorPrefix.substr(0, 1).toUpperCase() + vendorPrefix.substr(1);
                        break
                    }
                    vendorPrefix || (vendorPrefix = "WebkitOpacity"in bodyStyle && "webkit"), transitions = !!("transition"in bodyStyle || vendorPrefix + "Transition"in bodyStyle), animations = !!("animation"in bodyStyle || vendorPrefix + "Animation"in bodyStyle), !android || transitions && animations || (transitions = isString(document.body.style.webkitTransition), animations = isString(document.body.style.webkitAnimation))
                }
                return {
                    history: !(!$window.history || !$window.history.pushState || 4 > android || boxee),
                    hasEvent: function (event) {
                        if ("input" === event && 11 >= msie)return !1;
                        if (isUndefined(eventSupport[event])) {
                            var divElm = document.createElement("div");
                            eventSupport[event] = "on" + event in divElm
                        }
                        return eventSupport[event]
                    },
                    csp: csp(),
                    vendorPrefix: vendorPrefix,
                    transitions: transitions,
                    animations: animations,
                    android: android
                }
            }]
        }

        function $TemplateRequestProvider() {
            this.$get = ["$templateCache", "$http", "$q", function ($templateCache, $http, $q) {
                function handleRequestFn(tpl, ignoreRequestError) {
                    function handleError(resp) {
                        if (self.totalPendingRequests--, !ignoreRequestError)throw $compileMinErr("tpload", "Failed to load template: {0}", tpl);
                        return $q.reject(resp)
                    }

                    var self = handleRequestFn;
                    self.totalPendingRequests++;
                    var transformResponse = $http.defaults && $http.defaults.transformResponse;
                    isArray(transformResponse) ? transformResponse = transformResponse.filter(function (transformer) {
                        return transformer !== defaultHttpResponseTransform
                    }) : transformResponse === defaultHttpResponseTransform && (transformResponse = null);
                    var httpOptions = {cache: $templateCache, transformResponse: transformResponse};
                    return $http.get(tpl, httpOptions).then(function (response) {
                        return self.totalPendingRequests--, response.data
                    }, handleError)
                }

                return handleRequestFn.totalPendingRequests = 0, handleRequestFn
            }]
        }

        function $$TestabilityProvider() {
            this.$get = ["$rootScope", "$browser", "$location", function ($rootScope, $browser, $location) {
                var testability = {};
                return testability.findBindings = function (element, expression, opt_exactMatch) {
                    var bindings = element.getElementsByClassName("ng-binding"), matches = [];
                    return forEach(bindings, function (binding) {
                        var dataBinding = angular.element(binding).data("$binding");
                        dataBinding && forEach(dataBinding, function (bindingName) {
                            if (opt_exactMatch) {
                                var matcher = new RegExp("(^|\\s)" + escapeForRegexp(expression) + "(\\s|\\||$)");
                                matcher.test(bindingName) && matches.push(binding)
                            } else-1 != bindingName.indexOf(expression) && matches.push(binding)
                        })
                    }), matches
                }, testability.findModels = function (element, expression, opt_exactMatch) {
                    for (var prefixes = ["ng-", "data-ng-", "ng\\:"], p = 0; p < prefixes.length; ++p) {
                        var attributeEquals = opt_exactMatch ? "=" : "*=", selector = "[" + prefixes[p] + "model" + attributeEquals + '"' + expression + '"]', elements = element.querySelectorAll(selector);
                        if (elements.length)return elements
                    }
                }, testability.getLocation = function () {
                    return $location.url()
                }, testability.setLocation = function (url) {
                    url !== $location.url() && ($location.url(url), $rootScope.$digest())
                }, testability.whenStable = function (callback) {
                    $browser.notifyWhenNoOutstandingRequests(callback)
                }, testability
            }]
        }

        function $TimeoutProvider() {
            this.$get = ["$rootScope", "$browser", "$q", "$$q", "$exceptionHandler", function ($rootScope, $browser, $q, $$q, $exceptionHandler) {
                function timeout(fn, delay, invokeApply) {
                    var timeoutId, skipApply = isDefined(invokeApply) && !invokeApply, deferred = (skipApply ? $$q : $q).defer(), promise = deferred.promise;
                    return timeoutId = $browser.defer(function () {
                        try {
                            deferred.resolve(fn())
                        } catch (e) {
                            deferred.reject(e), $exceptionHandler(e)
                        } finally {
                            delete deferreds[promise.$$timeoutId]
                        }
                        skipApply || $rootScope.$apply()
                    }, delay), promise.$$timeoutId = timeoutId, deferreds[timeoutId] = deferred, promise
                }

                var deferreds = {};
                return timeout.cancel = function (promise) {
                    return promise && promise.$$timeoutId in deferreds ? (deferreds[promise.$$timeoutId].reject("canceled"), delete deferreds[promise.$$timeoutId], $browser.defer.cancel(promise.$$timeoutId)) : !1
                }, timeout
            }]
        }

        function urlResolve(url) {
            var href = url;
            return msie && (urlParsingNode.setAttribute("href", href), href = urlParsingNode.href), urlParsingNode.setAttribute("href", href), {
                href: urlParsingNode.href,
                protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
                host: urlParsingNode.host,
                search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
                hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
                hostname: urlParsingNode.hostname,
                port: urlParsingNode.port,
                pathname: "/" === urlParsingNode.pathname.charAt(0) ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
            }
        }

        function urlIsSameOrigin(requestUrl) {
            var parsed = isString(requestUrl) ? urlResolve(requestUrl) : requestUrl;
            return parsed.protocol === originUrl.protocol && parsed.host === originUrl.host
        }

        function $WindowProvider() {
            this.$get = valueFn(window)
        }

        function $FilterProvider($provide) {
            function register(name, factory) {
                if (isObject(name)) {
                    var filters = {};
                    return forEach(name, function (filter, key) {
                        filters[key] = register(key, filter)
                    }), filters
                }
                return $provide.factory(name + suffix, factory)
            }

            var suffix = "Filter";
            this.register = register, this.$get = ["$injector", function ($injector) {
                return function (name) {
                    return $injector.get(name + suffix)
                }
            }], register("currency", currencyFilter), register("date", dateFilter), register("filter", filterFilter), register("json", jsonFilter), register("limitTo", limitToFilter), register("lowercase", lowercaseFilter), register("number", numberFilter), register("orderBy", orderByFilter), register("uppercase", uppercaseFilter)
        }

        function filterFilter() {
            return function (array, expression, comparator) {
                if (!isArray(array))return array;
                var predicateFn, matchAgainstAnyProp;
                switch (typeof expression) {
                    case"function":
                        predicateFn = expression;
                        break;
                    case"boolean":
                    case"number":
                    case"string":
                        matchAgainstAnyProp = !0;
                    case"object":
                        predicateFn = createPredicateFn(expression, comparator, matchAgainstAnyProp);
                        break;
                    default:
                        return array
                }
                return array.filter(predicateFn)
            }
        }

        function createPredicateFn(expression, comparator, matchAgainstAnyProp) {
            var predicateFn, shouldMatchPrimitives = isObject(expression) && "$"in expression;
            return comparator === !0 ? comparator = equals : isFunction(comparator) || (comparator = function (actual, expected) {
                return isObject(actual) || isObject(expected) ? !1 : (actual = lowercase("" + actual), expected = lowercase("" + expected), -1 !== actual.indexOf(expected))
            }), predicateFn = function (item) {
                return shouldMatchPrimitives && !isObject(item) ? deepCompare(item, expression.$, comparator, !1) : deepCompare(item, expression, comparator, matchAgainstAnyProp)
            }
        }

        function deepCompare(actual, expected, comparator, matchAgainstAnyProp, dontMatchWholeObject) {
            var actualType = typeof actual, expectedType = typeof expected;
            if ("string" === expectedType && "!" === expected.charAt(0))return !deepCompare(actual, expected.substring(1), comparator, matchAgainstAnyProp);
            if ("array" === actualType)return actual.some(function (item) {
                return deepCompare(item, expected, comparator, matchAgainstAnyProp)
            });
            switch (actualType) {
                case"object":
                    var key;
                    if (matchAgainstAnyProp) {
                        for (key in actual)if ("$" !== key.charAt(0) && deepCompare(actual[key], expected, comparator, !0))return !0;
                        return dontMatchWholeObject ? !1 : deepCompare(actual, expected, comparator, !1)
                    }
                    if ("object" === expectedType) {
                        for (key in expected) {
                            var expectedVal = expected[key];
                            if (!isFunction(expectedVal)) {
                                var matchAnyProperty = "$" === key, actualVal = matchAnyProperty ? actual : actual[key];
                                if (!deepCompare(actualVal, expectedVal, comparator, matchAnyProperty, matchAnyProperty))return !1
                            }
                        }
                        return !0
                    }
                    return comparator(actual, expected);
                case"function":
                    return !1;
                default:
                    return comparator(actual, expected)
            }
        }

        function currencyFilter($locale) {
            var formats = $locale.NUMBER_FORMATS;
            return function (amount, currencySymbol, fractionSize) {
                return isUndefined(currencySymbol) && (currencySymbol = formats.CURRENCY_SYM), isUndefined(fractionSize) && (fractionSize = formats.PATTERNS[1].maxFrac), null == amount ? amount : formatNumber(amount, formats.PATTERNS[1], formats.GROUP_SEP, formats.DECIMAL_SEP, fractionSize).replace(/\u00A4/g, currencySymbol)
            }
        }

        function numberFilter($locale) {
            var formats = $locale.NUMBER_FORMATS;
            return function (number, fractionSize) {
                return null == number ? number : formatNumber(number, formats.PATTERNS[0], formats.GROUP_SEP, formats.DECIMAL_SEP, fractionSize)
            }
        }

        function formatNumber(number, pattern, groupSep, decimalSep, fractionSize) {
            if (!isFinite(number) || isObject(number))return "";
            var isNegative = 0 > number;
            number = Math.abs(number);
            var numStr = number + "", formatedText = "", parts = [], hasExponent = !1;
            if (-1 !== numStr.indexOf("e")) {
                var match = numStr.match(/([\d\.]+)e(-?)(\d+)/);
                match && "-" == match[2] && match[3] > fractionSize + 1 ? number = 0 : (formatedText = numStr, hasExponent = !0)
            }
            if (hasExponent)fractionSize > 0 && 1 > number && (formatedText = number.toFixed(fractionSize), number = parseFloat(formatedText)); else {
                var fractionLen = (numStr.split(DECIMAL_SEP)[1] || "").length;
                isUndefined(fractionSize) && (fractionSize = Math.min(Math.max(pattern.minFrac, fractionLen), pattern.maxFrac)), number = +(Math.round(+(number.toString() + "e" + fractionSize)).toString() + "e" + -fractionSize);
                var fraction = ("" + number).split(DECIMAL_SEP), whole = fraction[0];
                fraction = fraction[1] || "";
                var i, pos = 0, lgroup = pattern.lgSize, group = pattern.gSize;
                if (whole.length >= lgroup + group)for (pos = whole.length - lgroup, i = 0; pos > i; i++)(pos - i) % group === 0 && 0 !== i && (formatedText += groupSep), formatedText += whole.charAt(i);
                for (i = pos; i < whole.length; i++)(whole.length - i) % lgroup === 0 && 0 !== i && (formatedText += groupSep), formatedText += whole.charAt(i);
                for (; fraction.length < fractionSize;)fraction += "0";
                fractionSize && "0" !== fractionSize && (formatedText += decimalSep + fraction.substr(0, fractionSize))
            }
            return 0 === number && (isNegative = !1), parts.push(isNegative ? pattern.negPre : pattern.posPre, formatedText, isNegative ? pattern.negSuf : pattern.posSuf), parts.join("")
        }

        function padNumber(num, digits, trim) {
            var neg = "";
            for (0 > num && (neg = "-", num = -num), num = "" + num; num.length < digits;)num = "0" + num;
            return trim && (num = num.substr(num.length - digits)), neg + num
        }

        function dateGetter(name, size, offset, trim) {
            return offset = offset || 0, function (date) {
                var value = date["get" + name]();
                return (offset > 0 || value > -offset) && (value += offset), 0 === value && -12 == offset && (value = 12), padNumber(value, size, trim)
            }
        }

        function dateStrGetter(name, shortForm) {
            return function (date, formats) {
                var value = date["get" + name](), get = uppercase(shortForm ? "SHORT" + name : name);
                return formats[get][value]
            }
        }

        function timeZoneGetter(date) {
            var zone = -1 * date.getTimezoneOffset(), paddedZone = zone >= 0 ? "+" : "";
            return paddedZone += padNumber(Math[zone > 0 ? "floor" : "ceil"](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2)
        }

        function getFirstThursdayOfYear(year) {
            var dayOfWeekOnFirst = new Date(year, 0, 1).getDay();
            return new Date(year, 0, (4 >= dayOfWeekOnFirst ? 5 : 12) - dayOfWeekOnFirst)
        }

        function getThursdayThisWeek(datetime) {
            return new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + (4 - datetime.getDay()))
        }

        function weekGetter(size) {
            return function (date) {
                var firstThurs = getFirstThursdayOfYear(date.getFullYear()), thisThurs = getThursdayThisWeek(date), diff = +thisThurs - +firstThurs, result = 1 + Math.round(diff / 6048e5);
                return padNumber(result, size)
            }
        }

        function ampmGetter(date, formats) {
            return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1]
        }

        function dateFilter($locale) {
            function jsonStringToDate(string) {
                var match;
                if (match = string.match(R_ISO8601_STR)) {
                    var date = new Date(0), tzHour = 0, tzMin = 0, dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear, timeSetter = match[8] ? date.setUTCHours : date.setHours;
                    match[9] && (tzHour = int(match[9] + match[10]), tzMin = int(match[9] + match[11])), dateSetter.call(date, int(match[1]), int(match[2]) - 1, int(match[3]));
                    var h = int(match[4] || 0) - tzHour, m = int(match[5] || 0) - tzMin, s = int(match[6] || 0), ms = Math.round(1e3 * parseFloat("0." + (match[7] || 0)));
                    return timeSetter.call(date, h, m, s, ms), date
                }
                return string
            }

            var R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
            return function (date, format, timezone) {
                var fn, match, text = "", parts = [];
                if (format = format || "mediumDate", format = $locale.DATETIME_FORMATS[format] || format, isString(date) && (date = NUMBER_STRING.test(date) ? int(date) : jsonStringToDate(date)), isNumber(date) && (date = new Date(date)), !isDate(date))return date;
                for (; format;)match = DATE_FORMATS_SPLIT.exec(format), match ? (parts = concat(parts, match, 1), format = parts.pop()) : (parts.push(format), format = null);
                return timezone && "UTC" === timezone && (date = new Date(date.getTime()), date.setMinutes(date.getMinutes() + date.getTimezoneOffset())), forEach(parts, function (value) {
                    fn = DATE_FORMATS[value], text += fn ? fn(date, $locale.DATETIME_FORMATS) : value.replace(/(^'|'$)/g, "").replace(/''/g, "'")
                }), text
            }
        }

        function jsonFilter() {
            return function (object, spacing) {
                return isUndefined(spacing) && (spacing = 2), toJson(object, spacing)
            }
        }

        function limitToFilter() {
            return function (input, limit) {
                if (isNumber(input) && (input = input.toString()), !isArray(input) && !isString(input))return input;
                if (limit = 1 / 0 === Math.abs(Number(limit)) ? Number(limit) : int(limit), isString(input))return limit ? limit >= 0 ? input.slice(0, limit) : input.slice(limit, input.length) : "";
                var i, n;
                if (limit > input.length ? limit = input.length : limit < -input.length && (limit = -input.length), limit > 0)i = 0, n = limit; else {
                    if (!limit)return [];
                    i = input.length + limit, n = input.length
                }
                return input.slice(i, n)
            }
        }

        function orderByFilter($parse) {
            return function (array, sortPredicate, reverseOrder) {
                function comparator(o1, o2) {
                    for (var i = 0; i < sortPredicate.length; i++) {
                        var comp = sortPredicate[i](o1, o2);
                        if (0 !== comp)return comp
                    }
                    return 0
                }

                function reverseComparator(comp, descending) {
                    return descending ? function (a, b) {
                        return comp(b, a)
                    } : comp
                }

                function isPrimitive(value) {
                    switch (typeof value) {
                        case"number":
                        case"boolean":
                        case"string":
                            return !0;
                        default:
                            return !1
                    }
                }

                function objectToString(value) {
                    return null === value ? "null" : "function" == typeof value.valueOf && (value = value.valueOf(), isPrimitive(value)) ? value : "function" == typeof value.toString && (value = value.toString(), isPrimitive(value)) ? value : ""
                }

                function compare(v1, v2) {
                    var t1 = typeof v1, t2 = typeof v2;
                    return t1 === t2 && "object" === t1 && (v1 = objectToString(v1), v2 = objectToString(v2)), t1 === t2 ? ("string" === t1 && (v1 = v1.toLowerCase(), v2 = v2.toLowerCase()), v1 === v2 ? 0 : v2 > v1 ? -1 : 1) : t2 > t1 ? -1 : 1
                }

                return isArrayLike(array) ? (sortPredicate = isArray(sortPredicate) ? sortPredicate : [sortPredicate], 0 === sortPredicate.length && (sortPredicate = ["+"]), sortPredicate = sortPredicate.map(function (predicate) {
                    var descending = !1, get = predicate || identity;
                    if (isString(predicate)) {
                        if (("+" == predicate.charAt(0) || "-" == predicate.charAt(0)) && (descending = "-" == predicate.charAt(0), predicate = predicate.substring(1)), "" === predicate)return reverseComparator(compare, descending);
                        if (get = $parse(predicate), get.constant) {
                            var key = get();
                            return reverseComparator(function (a, b) {
                                return compare(a[key], b[key])
                            }, descending)
                        }
                    }
                    return reverseComparator(function (a, b) {
                        return compare(get(a), get(b))
                    }, descending)
                }), slice.call(array).sort(reverseComparator(comparator, reverseOrder))) : array
            }
        }

        function ngDirective(directive) {
            return isFunction(directive) && (directive = {link: directive}), directive.restrict = directive.restrict || "AC", valueFn(directive)
        }

        function nullFormRenameControl(control, name) {
            control.$name = name
        }

        function FormController(element, attrs, $scope, $animate, $interpolate) {
            var form = this, controls = [], parentForm = form.$$parentForm = element.parent().controller("form") || nullFormCtrl;
            form.$error = {}, form.$$success = {}, form.$pending = undefined, form.$name = $interpolate(attrs.name || attrs.ngForm || "")($scope), form.$dirty = !1, form.$pristine = !0, form.$valid = !0, form.$invalid = !1, form.$submitted = !1, parentForm.$addControl(form), form.$rollbackViewValue = function () {
                forEach(controls, function (control) {
                    control.$rollbackViewValue()
                })
            }, form.$commitViewValue = function () {
                forEach(controls, function (control) {
                    control.$commitViewValue()
                })
            }, form.$addControl = function (control) {
                assertNotHasOwnProperty(control.$name, "input"), controls.push(control), control.$name && (form[control.$name] = control)
            }, form.$$renameControl = function (control, newName) {
                var oldName = control.$name;
                form[oldName] === control && delete form[oldName], form[newName] = control, control.$name = newName
            }, form.$removeControl = function (control) {
                control.$name && form[control.$name] === control && delete form[control.$name], forEach(form.$pending, function (value, name) {
                    form.$setValidity(name, null, control)
                }), forEach(form.$error, function (value, name) {
                    form.$setValidity(name, null, control)
                }), arrayRemove(controls, control)
            }, addSetValidityMethod({
                ctrl: this, $element: element, set: function (object, property, control) {
                    var list = object[property];
                    if (list) {
                        var index = list.indexOf(control);
                        -1 === index && list.push(control)
                    } else object[property] = [control]
                }, unset: function (object, property, control) {
                    var list = object[property];
                    list && (arrayRemove(list, control), 0 === list.length && delete object[property])
                }, parentForm: parentForm, $animate: $animate
            }), form.$setDirty = function () {
                $animate.removeClass(element, PRISTINE_CLASS), $animate.addClass(element, DIRTY_CLASS), form.$dirty = !0, form.$pristine = !1, parentForm.$setDirty()
            }, form.$setPristine = function () {
                $animate.setClass(element, PRISTINE_CLASS, DIRTY_CLASS + " " + SUBMITTED_CLASS), form.$dirty = !1, form.$pristine = !0, form.$submitted = !1, forEach(controls, function (control) {
                    control.$setPristine()
                })
            }, form.$setUntouched = function () {
                forEach(controls, function (control) {
                    control.$setUntouched()
                })
            }, form.$setSubmitted = function () {
                $animate.addClass(element, SUBMITTED_CLASS), form.$submitted = !0, parentForm.$setSubmitted()
            }
        }

        function stringBasedInputType(ctrl) {
            ctrl.$formatters.push(function (value) {
                return ctrl.$isEmpty(value) ? value : value.toString()
            })
        }

        function textInputType(scope, element, attr, ctrl, $sniffer, $browser) {
            baseInputType(scope, element, attr, ctrl, $sniffer, $browser), stringBasedInputType(ctrl)
        }

        function baseInputType(scope, element, attr, ctrl, $sniffer, $browser) {
            var type = lowercase(element[0].type);
            if (!$sniffer.android) {
                var composing = !1;
                element.on("compositionstart", function () {
                    composing = !0
                }), element.on("compositionend", function () {
                    composing = !1, listener()
                })
            }
            var listener = function (ev) {
                if (timeout && ($browser.defer.cancel(timeout), timeout = null), !composing) {
                    var value = element.val(), event = ev && ev.type;
                    "password" === type || attr.ngTrim && "false" === attr.ngTrim || (value = trim(value)), (ctrl.$viewValue !== value || "" === value && ctrl.$$hasNativeValidators) && ctrl.$setViewValue(value, event)
                }
            };
            if ($sniffer.hasEvent("input"))element.on("input", listener); else {
                var timeout, deferListener = function (ev, input, origValue) {
                    timeout || (timeout = $browser.defer(function () {
                        timeout = null, input && input.value === origValue || listener(ev)
                    }))
                };
                element.on("keydown", function (event) {
                    var key = event.keyCode;
                    91 === key || key > 15 && 19 > key || key >= 37 && 40 >= key || deferListener(event, this, this.value)
                }), $sniffer.hasEvent("paste") && element.on("paste cut", deferListener)
            }
            element.on("change", listener), ctrl.$render = function () {
                element.val(ctrl.$isEmpty(ctrl.$viewValue) ? "" : ctrl.$viewValue)
            }
        }

        function weekParser(isoWeek, existingDate) {
            if (isDate(isoWeek))return isoWeek;
            if (isString(isoWeek)) {
                WEEK_REGEXP.lastIndex = 0;
                var parts = WEEK_REGEXP.exec(isoWeek);
                if (parts) {
                    var year = +parts[1], week = +parts[2], hours = 0, minutes = 0, seconds = 0, milliseconds = 0, firstThurs = getFirstThursdayOfYear(year), addDays = 7 * (week - 1);
                    return existingDate && (hours = existingDate.getHours(), minutes = existingDate.getMinutes(), seconds = existingDate.getSeconds(), milliseconds = existingDate.getMilliseconds()), new Date(year, 0, firstThurs.getDate() + addDays, hours, minutes, seconds, milliseconds)
                }
            }
            return 0 / 0
        }

        function createDateParser(regexp, mapping) {
            return function (iso, date) {
                var parts, map;
                if (isDate(iso))return iso;
                if (isString(iso)) {
                    if ('"' == iso.charAt(0) && '"' == iso.charAt(iso.length - 1) && (iso = iso.substring(1, iso.length - 1)), ISO_DATE_REGEXP.test(iso))return new Date(iso);
                    if (regexp.lastIndex = 0, parts = regexp.exec(iso))return parts.shift(), map = date ? {
                        yyyy: date.getFullYear(),
                        MM: date.getMonth() + 1,
                        dd: date.getDate(),
                        HH: date.getHours(),
                        mm: date.getMinutes(),
                        ss: date.getSeconds(),
                        sss: date.getMilliseconds() / 1e3
                    } : {yyyy: 1970, MM: 1, dd: 1, HH: 0, mm: 0, ss: 0, sss: 0}, forEach(parts, function (part, index) {
                        index < mapping.length && (map[mapping[index]] = +part)
                    }), new Date(map.yyyy, map.MM - 1, map.dd, map.HH, map.mm, map.ss || 0, 1e3 * map.sss || 0)
                }
                return 0 / 0
            }
        }

        function createDateInputType(type, regexp, parseDate, format) {
            return function (scope, element, attr, ctrl, $sniffer, $browser, $filter) {
                function isValidDate(value) {
                    return value && !(value.getTime && value.getTime() !== value.getTime())
                }

                function parseObservedDateValue(val) {
                    return isDefined(val) ? isDate(val) ? val : parseDate(val) : undefined
                }

                badInputChecker(scope, element, attr, ctrl), baseInputType(scope, element, attr, ctrl, $sniffer, $browser);
                var previousDate, timezone = ctrl && ctrl.$options && ctrl.$options.timezone;
                if (ctrl.$$parserName = type, ctrl.$parsers.push(function (value) {
                        if (ctrl.$isEmpty(value))return null;
                        if (regexp.test(value)) {
                            var parsedDate = parseDate(value, previousDate);
                            return "UTC" === timezone && parsedDate.setMinutes(parsedDate.getMinutes() - parsedDate.getTimezoneOffset()), parsedDate
                        }
                        return undefined
                    }), ctrl.$formatters.push(function (value) {
                        if (value && !isDate(value))throw $ngModelMinErr("datefmt", "Expected `{0}` to be a date", value);
                        if (isValidDate(value)) {
                            if (previousDate = value, previousDate && "UTC" === timezone) {
                                var timezoneOffset = 6e4 * previousDate.getTimezoneOffset();
                                previousDate = new Date(previousDate.getTime() + timezoneOffset)
                            }
                            return $filter("date")(value, format, timezone)
                        }
                        return previousDate = null, ""
                    }), isDefined(attr.min) || attr.ngMin) {
                    var minVal;
                    ctrl.$validators.min = function (value) {
                        return !isValidDate(value) || isUndefined(minVal) || parseDate(value) >= minVal
                    }, attr.$observe("min", function (val) {
                        minVal = parseObservedDateValue(val), ctrl.$validate()
                    })
                }
                if (isDefined(attr.max) || attr.ngMax) {
                    var maxVal;
                    ctrl.$validators.max = function (value) {
                        return !isValidDate(value) || isUndefined(maxVal) || parseDate(value) <= maxVal
                    }, attr.$observe("max", function (val) {
                        maxVal = parseObservedDateValue(val), ctrl.$validate()
                    })
                }
            }
        }

        function badInputChecker(scope, element, attr, ctrl) {
            var node = element[0], nativeValidation = ctrl.$$hasNativeValidators = isObject(node.validity);
            nativeValidation && ctrl.$parsers.push(function (value) {
                var validity = element.prop(VALIDITY_STATE_PROPERTY) || {};
                return validity.badInput && !validity.typeMismatch ? undefined : value
            })
        }

        function numberInputType(scope, element, attr, ctrl, $sniffer, $browser) {
            if (badInputChecker(scope, element, attr, ctrl), baseInputType(scope, element, attr, ctrl, $sniffer, $browser), ctrl.$$parserName = "number", ctrl.$parsers.push(function (value) {
                    return ctrl.$isEmpty(value) ? null : NUMBER_REGEXP.test(value) ? parseFloat(value) : undefined
                }), ctrl.$formatters.push(function (value) {
                    if (!ctrl.$isEmpty(value)) {
                        if (!isNumber(value))throw $ngModelMinErr("numfmt", "Expected `{0}` to be a number", value);
                        value = value.toString()
                    }
                    return value
                }), attr.min || attr.ngMin) {
                var minVal;
                ctrl.$validators.min = function (value) {
                    return ctrl.$isEmpty(value) || isUndefined(minVal) || value >= minVal
                }, attr.$observe("min", function (val) {
                    isDefined(val) && !isNumber(val) && (val = parseFloat(val, 10)), minVal = isNumber(val) && !isNaN(val) ? val : undefined, ctrl.$validate()
                })
            }
            if (attr.max || attr.ngMax) {
                var maxVal;
                ctrl.$validators.max = function (value) {
                    return ctrl.$isEmpty(value) || isUndefined(maxVal) || maxVal >= value
                }, attr.$observe("max", function (val) {
                    isDefined(val) && !isNumber(val) && (val = parseFloat(val, 10)), maxVal = isNumber(val) && !isNaN(val) ? val : undefined, ctrl.$validate()
                })
            }
        }

        function urlInputType(scope, element, attr, ctrl, $sniffer, $browser) {
            baseInputType(scope, element, attr, ctrl, $sniffer, $browser), stringBasedInputType(ctrl), ctrl.$$parserName = "url", ctrl.$validators.url = function (modelValue, viewValue) {
                var value = modelValue || viewValue;
                return ctrl.$isEmpty(value) || URL_REGEXP.test(value)
            }
        }

        function emailInputType(scope, element, attr, ctrl, $sniffer, $browser) {
            baseInputType(scope, element, attr, ctrl, $sniffer, $browser), stringBasedInputType(ctrl), ctrl.$$parserName = "email", ctrl.$validators.email = function (modelValue, viewValue) {
                var value = modelValue || viewValue;
                return ctrl.$isEmpty(value) || EMAIL_REGEXP.test(value)
            }
        }

        function radioInputType(scope, element, attr, ctrl) {
            isUndefined(attr.name) && element.attr("name", nextUid());
            var listener = function (ev) {
                element[0].checked && ctrl.$setViewValue(attr.value, ev && ev.type)
            };
            element.on("click", listener), ctrl.$render = function () {
                var value = attr.value;
                element[0].checked = value == ctrl.$viewValue
            }, attr.$observe("value", ctrl.$render)
        }

        function parseConstantExpr($parse, context, name, expression, fallback) {
            var parseFn;
            if (isDefined(expression)) {
                if (parseFn = $parse(expression), !parseFn.constant)throw minErr("ngModel")("constexpr", "Expected constant expression for `{0}`, but saw `{1}`.", name, expression);
                return parseFn(context)
            }
            return fallback
        }

        function checkboxInputType(scope, element, attr, ctrl, $sniffer, $browser, $filter, $parse) {
            var trueValue = parseConstantExpr($parse, scope, "ngTrueValue", attr.ngTrueValue, !0), falseValue = parseConstantExpr($parse, scope, "ngFalseValue", attr.ngFalseValue, !1), listener = function (ev) {
                ctrl.$setViewValue(element[0].checked, ev && ev.type)
            };
            element.on("click", listener), ctrl.$render = function () {
                element[0].checked = ctrl.$viewValue
            }, ctrl.$isEmpty = function (value) {
                return value === !1
            }, ctrl.$formatters.push(function (value) {
                return equals(value, trueValue)
            }), ctrl.$parsers.push(function (value) {
                return value ? trueValue : falseValue
            })
        }

        function addSetValidityMethod(context) {
            function setValidity(validationErrorKey, state, options) {
                state === undefined ? createAndSet("$pending", validationErrorKey, options) : unsetAndCleanup("$pending", validationErrorKey, options), isBoolean(state) ? state ? (unset(ctrl.$error, validationErrorKey, options), set(ctrl.$$success, validationErrorKey, options)) : (set(ctrl.$error, validationErrorKey, options), unset(ctrl.$$success, validationErrorKey, options)) : (unset(ctrl.$error, validationErrorKey, options), unset(ctrl.$$success, validationErrorKey, options)), ctrl.$pending ? (cachedToggleClass(PENDING_CLASS, !0), ctrl.$valid = ctrl.$invalid = undefined, toggleValidationCss("", null)) : (cachedToggleClass(PENDING_CLASS, !1), ctrl.$valid = isObjectEmpty(ctrl.$error), ctrl.$invalid = !ctrl.$valid, toggleValidationCss("", ctrl.$valid));
                var combinedState;
                combinedState = ctrl.$pending && ctrl.$pending[validationErrorKey] ? undefined : ctrl.$error[validationErrorKey] ? !1 : ctrl.$$success[validationErrorKey] ? !0 : null, toggleValidationCss(validationErrorKey, combinedState), parentForm.$setValidity(validationErrorKey, combinedState, ctrl)
            }

            function createAndSet(name, value, options) {
                ctrl[name] || (ctrl[name] = {}), set(ctrl[name], value, options)
            }

            function unsetAndCleanup(name, value, options) {
                ctrl[name] && unset(ctrl[name], value, options), isObjectEmpty(ctrl[name]) && (ctrl[name] = undefined)
            }

            function cachedToggleClass(className, switchValue) {
                switchValue && !classCache[className] ? ($animate.addClass($element, className), classCache[className] = !0) : !switchValue && classCache[className] && ($animate.removeClass($element, className), classCache[className] = !1)
            }

            function toggleValidationCss(validationErrorKey, isValid) {
                validationErrorKey = validationErrorKey ? "-" + snake_case(validationErrorKey, "-") : "", cachedToggleClass(VALID_CLASS + validationErrorKey, isValid === !0), cachedToggleClass(INVALID_CLASS + validationErrorKey, isValid === !1)
            }

            var ctrl = context.ctrl, $element = context.$element, classCache = {}, set = context.set, unset = context.unset, parentForm = context.parentForm, $animate = context.$animate;
            classCache[INVALID_CLASS] = !(classCache[VALID_CLASS] = $element.hasClass(VALID_CLASS)), ctrl.$setValidity = setValidity
        }

        function isObjectEmpty(obj) {
            if (obj)for (var prop in obj)return !1;
            return !0
        }

        function classDirective(name, selector) {
            return name = "ngClass" + name, ["$animate", function ($animate) {
                function arrayDifference(tokens1, tokens2) {
                    var values = [];
                    outer:for (var i = 0; i < tokens1.length; i++) {
                        for (var token = tokens1[i], j = 0; j < tokens2.length; j++)if (token == tokens2[j])continue outer;
                        values.push(token)
                    }
                    return values
                }

                function arrayClasses(classVal) {
                    if (isArray(classVal))return classVal;
                    if (isString(classVal))return classVal.split(" ");
                    if (isObject(classVal)) {
                        var classes = [];
                        return forEach(classVal, function (v, k) {
                            v && (classes = classes.concat(k.split(" ")))
                        }), classes
                    }
                    return classVal
                }

                return {
                    restrict: "AC", link: function (scope, element, attr) {
                        function addClasses(classes) {
                            var newClasses = digestClassCounts(classes, 1);
                            attr.$addClass(newClasses)
                        }

                        function removeClasses(classes) {
                            var newClasses = digestClassCounts(classes, -1);
                            attr.$removeClass(newClasses)
                        }

                        function digestClassCounts(classes, count) {
                            var classCounts = element.data("$classCounts") || {}, classesToUpdate = [];
                            return forEach(classes, function (className) {
                                (count > 0 || classCounts[className]) && (classCounts[className] = (classCounts[className] || 0) + count, classCounts[className] === +(count > 0) && classesToUpdate.push(className))
                            }), element.data("$classCounts", classCounts), classesToUpdate.join(" ")
                        }

                        function updateClasses(oldClasses, newClasses) {
                            var toAdd = arrayDifference(newClasses, oldClasses), toRemove = arrayDifference(oldClasses, newClasses);
                            toAdd = digestClassCounts(toAdd, 1), toRemove = digestClassCounts(toRemove, -1), toAdd && toAdd.length && $animate.addClass(element, toAdd), toRemove && toRemove.length && $animate.removeClass(element, toRemove)
                        }

                        function ngClassWatchAction(newVal) {
                            if (selector === !0 || scope.$index % 2 === selector) {
                                var newClasses = arrayClasses(newVal || []);
                                if (oldVal) {
                                    if (!equals(newVal, oldVal)) {
                                        var oldClasses = arrayClasses(oldVal);
                                        updateClasses(oldClasses, newClasses)
                                    }
                                } else addClasses(newClasses)
                            }
                            oldVal = shallowCopy(newVal)
                        }

                        var oldVal;
                        scope.$watch(attr[name], ngClassWatchAction, !0), attr.$observe("class", function () {
                            ngClassWatchAction(scope.$eval(attr[name]))
                        }), "ngClass" !== name && scope.$watch("$index", function ($index, old$index) {
                            var mod = 1 & $index;
                            if (mod !== (1 & old$index)) {
                                var classes = arrayClasses(scope.$eval(attr[name]));
                                mod === selector ? addClasses(classes) : removeClasses(classes)
                            }
                        })
                    }
                }
            }]
        }

        var REGEX_STRING_REGEXP = /^\/(.+)\/([a-z]*)$/, VALIDITY_STATE_PROPERTY = "validity", lowercase = function (string) {
            return isString(string) ? string.toLowerCase() : string
        }, hasOwnProperty = Object.prototype.hasOwnProperty, uppercase = function (string) {
            return isString(string) ? string.toUpperCase() : string
        }, manualLowercase = function (s) {
            return isString(s) ? s.replace(/[A-Z]/g, function (ch) {
                return String.fromCharCode(32 | ch.charCodeAt(0))
            }) : s
        }, manualUppercase = function (s) {
            return isString(s) ? s.replace(/[a-z]/g, function (ch) {
                return String.fromCharCode(-33 & ch.charCodeAt(0))
            }) : s
        };
        "i" !== "I".toLowerCase() && (lowercase = manualLowercase, uppercase = manualUppercase);
        var msie, jqLite, jQuery, angularModule, slice = [].slice, splice = [].splice, push = [].push, toString = Object.prototype.toString, ngMinErr = minErr("ng"), angular = window.angular || (window.angular = {}), uid = 0;
        msie = document.documentMode, noop.$inject = [], identity.$inject = [];
        var skipDestroyOnNextJQueryCleanData, isArray = Array.isArray, trim = function (value) {
            return isString(value) ? value.trim() : value
        }, escapeForRegexp = function (s) {
            return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
        }, csp = function () {
            if (isDefined(csp.isActive_))return csp.isActive_;
            var active = !(!document.querySelector("[ng-csp]") && !document.querySelector("[data-ng-csp]"));
            if (!active)try {
                new Function("")
            } catch (e) {
                active = !0
            }
            return csp.isActive_ = active
        }, ngAttrPrefixes = ["ng-", "data-ng-", "ng:", "x-ng-"], SNAKE_CASE_REGEXP = /[A-Z]/g, bindJQueryFired = !1, NODE_TYPE_ELEMENT = 1, NODE_TYPE_TEXT = 3, NODE_TYPE_COMMENT = 8, NODE_TYPE_DOCUMENT = 9, NODE_TYPE_DOCUMENT_FRAGMENT = 11, version = {
            full: "1.3.8",
            major: 1,
            minor: 3,
            dot: 8,
            codeName: "prophetic-narwhal"
        };
        JQLite.expando = "ng339";
        var jqCache = JQLite.cache = {}, jqId = 1, addEventListenerFn = function (element, type, fn) {
            element.addEventListener(type, fn, !1)
        }, removeEventListenerFn = function (element, type, fn) {
            element.removeEventListener(type, fn, !1)
        };
        JQLite._data = function (node) {
            return this.cache[node[this.expando]] || {}
        };
        var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g, MOZ_HACK_REGEXP = /^moz([A-Z])/, MOUSE_EVENT_MAP = {
            mouseleave: "mouseout",
            mouseenter: "mouseover"
        }, jqLiteMinErr = minErr("jqLite"), SINGLE_TAG_REGEXP = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, HTML_REGEXP = /<|&#?\w+;/, TAG_NAME_REGEXP = /<([\w:]+)/, XHTML_TAG_REGEXP = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, wrapMap = {
            option: [1, '<select multiple="multiple">', "</select>"],
            thead: [1, "<table>", "</table>"],
            col: [2, "<table><colgroup>", "</colgroup></table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            _default: [0, "", ""]
        };
        wrapMap.optgroup = wrapMap.option, wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead, wrapMap.th = wrapMap.td;
        var JQLitePrototype = JQLite.prototype = {
            ready: function (fn) {
                function trigger() {
                    fired || (fired = !0, fn())
                }

                var fired = !1;
                "complete" === document.readyState ? setTimeout(trigger) : (this.on("DOMContentLoaded", trigger), JQLite(window).on("load", trigger))
            }, toString: function () {
                var value = [];
                return forEach(this, function (e) {
                    value.push("" + e)
                }), "[" + value.join(", ") + "]"
            }, eq: function (index) {
                return jqLite(index >= 0 ? this[index] : this[this.length + index])
            }, length: 0, push: push, sort: [].sort, splice: [].splice
        }, BOOLEAN_ATTR = {};
        forEach("multiple,selected,checked,disabled,readOnly,required,open".split(","), function (value) {
            BOOLEAN_ATTR[lowercase(value)] = value
        });
        var BOOLEAN_ELEMENTS = {};
        forEach("input,select,option,textarea,button,form,details".split(","), function (value) {
            BOOLEAN_ELEMENTS[value] = !0
        });
        var ALIASED_ATTR = {
            ngMinlength: "minlength",
            ngMaxlength: "maxlength",
            ngMin: "min",
            ngMax: "max",
            ngPattern: "pattern"
        };
        forEach({data: jqLiteData, removeData: jqLiteRemoveData}, function (fn, name) {
            JQLite[name] = fn
        }), forEach({
            data: jqLiteData, inheritedData: jqLiteInheritedData, scope: function (element) {
                return jqLite.data(element, "$scope") || jqLiteInheritedData(element.parentNode || element, ["$isolateScope", "$scope"])
            }, isolateScope: function (element) {
                return jqLite.data(element, "$isolateScope") || jqLite.data(element, "$isolateScopeNoTemplate")
            }, controller: jqLiteController, injector: function (element) {
                return jqLiteInheritedData(element, "$injector")
            }, removeAttr: function (element, name) {
                element.removeAttribute(name)
            }, hasClass: jqLiteHasClass, css: function (element, name, value) {
                return name = camelCase(name), isDefined(value) ? void(element.style[name] = value) : element.style[name]
            }, attr: function (element, name, value) {
                var lowercasedName = lowercase(name);
                if (BOOLEAN_ATTR[lowercasedName]) {
                    if (!isDefined(value))return element[name] || (element.attributes.getNamedItem(name) || noop).specified ? lowercasedName : undefined;
                    value ? (element[name] = !0, element.setAttribute(name, lowercasedName)) : (element[name] = !1, element.removeAttribute(lowercasedName))
                } else if (isDefined(value))element.setAttribute(name, value); else if (element.getAttribute) {
                    var ret = element.getAttribute(name, 2);
                    return null === ret ? undefined : ret
                }
            }, prop: function (element, name, value) {
                return isDefined(value) ? void(element[name] = value) : element[name]
            }, text: function () {
                function getText(element, value) {
                    if (isUndefined(value)) {
                        var nodeType = element.nodeType;
                        return nodeType === NODE_TYPE_ELEMENT || nodeType === NODE_TYPE_TEXT ? element.textContent : ""
                    }
                    element.textContent = value
                }

                return getText.$dv = "", getText
            }(), val: function (element, value) {
                if (isUndefined(value)) {
                    if (element.multiple && "select" === nodeName_(element)) {
                        var result = [];
                        return forEach(element.options, function (option) {
                            option.selected && result.push(option.value || option.text)
                        }), 0 === result.length ? null : result
                    }
                    return element.value
                }
                element.value = value
            }, html: function (element, value) {
                return isUndefined(value) ? element.innerHTML : (jqLiteDealoc(element, !0), void(element.innerHTML = value))
            }, empty: jqLiteEmpty
        }, function (fn, name) {
            JQLite.prototype[name] = function (arg1, arg2) {
                var i, key, nodeCount = this.length;
                if (fn !== jqLiteEmpty && (2 == fn.length && fn !== jqLiteHasClass && fn !== jqLiteController ? arg1 : arg2) === undefined) {
                    if (isObject(arg1)) {
                        for (i = 0; nodeCount > i; i++)if (fn === jqLiteData)fn(this[i], arg1); else for (key in arg1)fn(this[i], key, arg1[key]);
                        return this
                    }
                    for (var value = fn.$dv, jj = value === undefined ? Math.min(nodeCount, 1) : nodeCount, j = 0; jj > j; j++) {
                        var nodeValue = fn(this[j], arg1, arg2);
                        value = value ? value + nodeValue : nodeValue
                    }
                    return value
                }
                for (i = 0; nodeCount > i; i++)fn(this[i], arg1, arg2);
                return this
            }
        }), forEach({
            removeData: jqLiteRemoveData,
            on: function jqLiteOn(element, type, fn, unsupported) {
                if (isDefined(unsupported))throw jqLiteMinErr("onargs", "jqLite#on() does not support the `selector` or `eventData` parameters");
                if (jqLiteAcceptsData(element)) {
                    var expandoStore = jqLiteExpandoStore(element, !0), events = expandoStore.events, handle = expandoStore.handle;
                    handle || (handle = expandoStore.handle = createEventHandler(element, events));
                    for (var types = type.indexOf(" ") >= 0 ? type.split(" ") : [type], i = types.length; i--;) {
                        type = types[i];
                        var eventFns = events[type];
                        eventFns || (events[type] = [], "mouseenter" === type || "mouseleave" === type ? jqLiteOn(element, MOUSE_EVENT_MAP[type], function (event) {
                            var target = this, related = event.relatedTarget;
                            (!related || related !== target && !target.contains(related)) && handle(event, type)
                        }) : "$destroy" !== type && addEventListenerFn(element, type, handle), eventFns = events[type]), eventFns.push(fn)
                    }
                }
            },
            off: jqLiteOff,
            one: function (element, type, fn) {
                element = jqLite(element), element.on(type, function onFn() {
                    element.off(type, fn), element.off(type, onFn)
                }), element.on(type, fn)
            },
            replaceWith: function (element, replaceNode) {
                var index, parent = element.parentNode;
                jqLiteDealoc(element), forEach(new JQLite(replaceNode), function (node) {
                    index ? parent.insertBefore(node, index.nextSibling) : parent.replaceChild(node, element), index = node
                })
            },
            children: function (element) {
                var children = [];
                return forEach(element.childNodes, function (element) {
                    element.nodeType === NODE_TYPE_ELEMENT && children.push(element)
                }), children
            },
            contents: function (element) {
                return element.contentDocument || element.childNodes || []
            },
            append: function (element, node) {
                var nodeType = element.nodeType;
                if (nodeType === NODE_TYPE_ELEMENT || nodeType === NODE_TYPE_DOCUMENT_FRAGMENT) {
                    node = new JQLite(node);
                    for (var i = 0, ii = node.length; ii > i; i++) {
                        var child = node[i];
                        element.appendChild(child)
                    }
                }
            },
            prepend: function (element, node) {
                if (element.nodeType === NODE_TYPE_ELEMENT) {
                    var index = element.firstChild;
                    forEach(new JQLite(node), function (child) {
                        element.insertBefore(child, index)
                    })
                }
            },
            wrap: function (element, wrapNode) {
                wrapNode = jqLite(wrapNode).eq(0).clone()[0];
                var parent = element.parentNode;
                parent && parent.replaceChild(wrapNode, element), wrapNode.appendChild(element)
            },
            remove: jqLiteRemove,
            detach: function (element) {
                jqLiteRemove(element, !0)
            },
            after: function (element, newElement) {
                var index = element, parent = element.parentNode;
                newElement = new JQLite(newElement);
                for (var i = 0, ii = newElement.length; ii > i; i++) {
                    var node = newElement[i];
                    parent.insertBefore(node, index.nextSibling), index = node
                }
            },
            addClass: jqLiteAddClass,
            removeClass: jqLiteRemoveClass,
            toggleClass: function (element, selector, condition) {
                selector && forEach(selector.split(" "), function (className) {
                    var classCondition = condition;
                    isUndefined(classCondition) && (classCondition = !jqLiteHasClass(element, className)), (classCondition ? jqLiteAddClass : jqLiteRemoveClass)(element, className)
                })
            },
            parent: function (element) {
                var parent = element.parentNode;
                return parent && parent.nodeType !== NODE_TYPE_DOCUMENT_FRAGMENT ? parent : null
            },
            next: function (element) {
                return element.nextElementSibling
            },
            find: function (element, selector) {
                return element.getElementsByTagName ? element.getElementsByTagName(selector) : []
            },
            clone: jqLiteClone,
            triggerHandler: function (element, event, extraParameters) {
                var dummyEvent, eventFnsCopy, handlerArgs, eventName = event.type || event, expandoStore = jqLiteExpandoStore(element), events = expandoStore && expandoStore.events, eventFns = events && events[eventName];
                eventFns && (dummyEvent = {
                    preventDefault: function () {
                        this.defaultPrevented = !0
                    }, isDefaultPrevented: function () {
                        return this.defaultPrevented === !0
                    }, stopImmediatePropagation: function () {
                        this.immediatePropagationStopped = !0
                    }, isImmediatePropagationStopped: function () {
                        return this.immediatePropagationStopped === !0
                    }, stopPropagation: noop, type: eventName, target: element
                }, event.type && (dummyEvent = extend(dummyEvent, event)), eventFnsCopy = shallowCopy(eventFns), handlerArgs = extraParameters ? [dummyEvent].concat(extraParameters) : [dummyEvent], forEach(eventFnsCopy, function (fn) {
                    dummyEvent.isImmediatePropagationStopped() || fn.apply(element, handlerArgs)
                }))
            }
        }, function (fn, name) {
            JQLite.prototype[name] = function (arg1, arg2, arg3) {
                for (var value, i = 0, ii = this.length; ii > i; i++)isUndefined(value) ? (value = fn(this[i], arg1, arg2, arg3), isDefined(value) && (value = jqLite(value))) : jqLiteAddNodes(value, fn(this[i], arg1, arg2, arg3));
                return isDefined(value) ? value : this
            }, JQLite.prototype.bind = JQLite.prototype.on, JQLite.prototype.unbind = JQLite.prototype.off
        }), HashMap.prototype = {
            put: function (key, value) {
                this[hashKey(key, this.nextUid)] = value
            }, get: function (key) {
                return this[hashKey(key, this.nextUid)]
            }, remove: function (key) {
                var value = this[key = hashKey(key, this.nextUid)];
                return delete this[key], value
            }
        };
        var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m, FN_ARG_SPLIT = /,/, FN_ARG = /^\s*(_?)(\S+?)\1\s*$/, STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm, $injectorMinErr = minErr("$injector");
        createInjector.$$annotate = annotate;
        var $animateMinErr = minErr("$animate"), $AnimateProvider = ["$provide", function ($provide) {
            this.$$selectors = {}, this.register = function (name, factory) {
                var key = name + "-animation";
                if (name && "." != name.charAt(0))throw $animateMinErr("notcsel", "Expecting class selector starting with '.' got '{0}'.", name);
                this.$$selectors[name.substr(1)] = key, $provide.factory(key, factory)
            }, this.classNameFilter = function (expression) {
                return 1 === arguments.length && (this.$$classNameFilter = expression instanceof RegExp ? expression : null), this.$$classNameFilter
            }, this.$get = ["$$q", "$$asyncCallback", "$rootScope", function ($$q, $$asyncCallback, $rootScope) {
                function runAnimationPostDigest(fn) {
                    var cancelFn, defer = $$q.defer();
                    return defer.promise.$$cancelFn = function () {
                        cancelFn && cancelFn()
                    }, $rootScope.$$postDigest(function () {
                        cancelFn = fn(function () {
                            defer.resolve()
                        })
                    }), defer.promise
                }

                function resolveElementClasses(element, classes) {
                    var toAdd = [], toRemove = [], hasClasses = createMap();
                    return forEach((element.attr("class") || "").split(/\s+/), function (className) {
                        hasClasses[className] = !0
                    }), forEach(classes, function (status, className) {
                        var hasClass = hasClasses[className];
                        status === !1 && hasClass ? toRemove.push(className) : status !== !0 || hasClass || toAdd.push(className)
                    }), toAdd.length + toRemove.length > 0 && [toAdd.length ? toAdd : null, toRemove.length ? toRemove : null]
                }

                function cachedClassManipulation(cache, classes, op) {
                    for (var i = 0, ii = classes.length; ii > i; ++i) {
                        var className = classes[i];
                        cache[className] = op
                    }
                }

                function asyncPromise() {
                    return currentDefer || (currentDefer = $$q.defer(), $$asyncCallback(function () {
                        currentDefer.resolve(), currentDefer = null
                    })), currentDefer.promise
                }

                function applyStyles(element, options) {
                    if (angular.isObject(options)) {
                        var styles = extend(options.from || {}, options.to || {});
                        element.css(styles)
                    }
                }

                var currentDefer;
                return {
                    animate: function (element, from, to) {
                        return applyStyles(element, {from: from, to: to}), asyncPromise()
                    }, enter: function (element, parent, after, options) {
                        return applyStyles(element, options), after ? after.after(element) : parent.prepend(element), asyncPromise()
                    }, leave: function (element) {
                        return element.remove(), asyncPromise()
                    }, move: function (element, parent, after, options) {
                        return this.enter(element, parent, after, options)
                    }, addClass: function (element, className, options) {
                        return this.setClass(element, className, [], options)
                    }, $$addClassImmediately: function (element, className, options) {
                        return element = jqLite(element), className = isString(className) ? className : isArray(className) ? className.join(" ") : "", forEach(element, function (element) {
                            jqLiteAddClass(element, className)
                        }), applyStyles(element, options), asyncPromise()
                    }, removeClass: function (element, className, options) {
                        return this.setClass(element, [], className, options)
                    }, $$removeClassImmediately: function (element, className, options) {
                        return element = jqLite(element), className = isString(className) ? className : isArray(className) ? className.join(" ") : "", forEach(element, function (element) {
                            jqLiteRemoveClass(element, className)
                        }), applyStyles(element, options), asyncPromise()
                    }, setClass: function (element, add, remove, options) {
                        var self = this, STORAGE_KEY = "$$animateClasses", createdCache = !1;
                        element = jqLite(element);
                        var cache = element.data(STORAGE_KEY);
                        cache ? options && cache.options && (cache.options = angular.extend(cache.options || {}, options)) : (cache = {
                            classes: {},
                            options: options
                        }, createdCache = !0);
                        var classes = cache.classes;
                        return add = isArray(add) ? add : add.split(" "), remove = isArray(remove) ? remove : remove.split(" "), cachedClassManipulation(classes, add, !0), cachedClassManipulation(classes, remove, !1), createdCache && (cache.promise = runAnimationPostDigest(function (done) {
                            var cache = element.data(STORAGE_KEY);
                            if (element.removeData(STORAGE_KEY), cache) {
                                var classes = resolveElementClasses(element, cache.classes);
                                classes && self.$$setClassImmediately(element, classes[0], classes[1], cache.options)
                            }
                            done()
                        }), element.data(STORAGE_KEY, cache)), cache.promise
                    }, $$setClassImmediately: function (element, add, remove, options) {
                        return add && this.$$addClassImmediately(element, add), remove && this.$$removeClassImmediately(element, remove), applyStyles(element, options), asyncPromise()
                    }, enabled: noop, cancel: noop
                }
            }]
        }], $compileMinErr = minErr("$compile");
        $CompileProvider.$inject = ["$provide", "$$sanitizeUriProvider"];
        var PREFIX_REGEXP = /^((?:x|data)[\:\-_])/i, APPLICATION_JSON = "application/json", CONTENT_TYPE_APPLICATION_JSON = {"Content-Type": APPLICATION_JSON + ";charset=utf-8"}, JSON_START = /^\[|^\{(?!\{)/, JSON_ENDS = {
            "[": /]$/,
            "{": /}$/
        }, JSON_PROTECTION_PREFIX = /^\)\]\}',?\n/, $interpolateMinErr = minErr("$interpolate"), PATH_MATCH = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/, DEFAULT_PORTS = {
            http: 80,
            https: 443,
            ftp: 21
        }, $locationMinErr = minErr("$location"), locationPrototype = {
            $$html5: !1,
            $$replace: !1,
            absUrl: locationGetter("$$absUrl"),
            url: function (url) {
                if (isUndefined(url))return this.$$url;
                var match = PATH_MATCH.exec(url);
                return (match[1] || "" === url) && this.path(decodeURIComponent(match[1])), (match[2] || match[1] || "" === url) && this.search(match[3] || ""), this.hash(match[5] || ""), this
            },
            protocol: locationGetter("$$protocol"),
            host: locationGetter("$$host"),
            port: locationGetter("$$port"),
            path: locationGetterSetter("$$path", function (path) {
                return path = null !== path ? path.toString() : "", "/" == path.charAt(0) ? path : "/" + path
            }),
            search: function (search, paramValue) {
                switch (arguments.length) {
                    case 0:
                        return this.$$search;
                    case 1:
                        if (isString(search) || isNumber(search))search = search.toString(), this.$$search = parseKeyValue(search); else {
                            if (!isObject(search))throw $locationMinErr("isrcharg", "The first argument of the `$location#search()` call must be a string or an object.");
                            search = copy(search, {}), forEach(search, function (value, key) {
                                null == value && delete search[key]
                            }), this.$$search = search
                        }
                        break;
                    default:
                        isUndefined(paramValue) || null === paramValue ? delete this.$$search[search] : this.$$search[search] = paramValue
                }
                return this.$$compose(), this
            },
            hash: locationGetterSetter("$$hash", function (hash) {
                return null !== hash ? hash.toString() : ""
            }),
            replace: function () {
                return this.$$replace = !0, this
            }
        };
        forEach([LocationHashbangInHtml5Url, LocationHashbangUrl, LocationHtml5Url], function (Location) {
            Location.prototype = Object.create(locationPrototype), Location.prototype.state = function (state) {
                if (!arguments.length)return this.$$state;
                if (Location !== LocationHtml5Url || !this.$$html5)throw $locationMinErr("nostate", "History API state support is available only in HTML5 mode and only in browsers supporting HTML5 History API");
                return this.$$state = isUndefined(state) ? null : state, this
            }
        });
        var $parseMinErr = minErr("$parse"), CALL = Function.prototype.call, APPLY = Function.prototype.apply, BIND = Function.prototype.bind, CONSTANTS = createMap();
        forEach({
            "null": function () {
                return null
            }, "true": function () {
                return !0
            }, "false": function () {
                return !1
            }, undefined: function () {
            }
        }, function (constantGetter, name) {
            constantGetter.constant = constantGetter.literal = constantGetter.sharedGetter = !0, CONSTANTS[name] = constantGetter
        }), CONSTANTS["this"] = function (self) {
            return self
        }, CONSTANTS["this"].sharedGetter = !0;
        var OPERATORS = extend(createMap(), {
            "+": function (self, locals, a, b) {
                return a = a(self, locals), b = b(self, locals), isDefined(a) ? isDefined(b) ? a + b : a : isDefined(b) ? b : undefined
            }, "-": function (self, locals, a, b) {
                return a = a(self, locals), b = b(self, locals), (isDefined(a) ? a : 0) - (isDefined(b) ? b : 0)
            }, "*": function (self, locals, a, b) {
                return a(self, locals) * b(self, locals)
            }, "/": function (self, locals, a, b) {
                return a(self, locals) / b(self, locals)
            }, "%": function (self, locals, a, b) {
                return a(self, locals) % b(self, locals)
            }, "===": function (self, locals, a, b) {
                return a(self, locals) === b(self, locals)
            }, "!==": function (self, locals, a, b) {
                return a(self, locals) !== b(self, locals)
            }, "==": function (self, locals, a, b) {
                return a(self, locals) == b(self, locals)
            }, "!=": function (self, locals, a, b) {
                return a(self, locals) != b(self, locals)
            }, "<": function (self, locals, a, b) {
                return a(self, locals) < b(self, locals)
            }, ">": function (self, locals, a, b) {
                return a(self, locals) > b(self, locals)
            }, "<=": function (self, locals, a, b) {
                return a(self, locals) <= b(self, locals)
            }, ">=": function (self, locals, a, b) {
                return a(self, locals) >= b(self, locals)
            }, "&&": function (self, locals, a, b) {
                return a(self, locals) && b(self, locals)
            }, "||": function (self, locals, a, b) {
                return a(self, locals) || b(self, locals)
            }, "!": function (self, locals, a) {
                return !a(self, locals)
            }, "=": !0, "|": !0
        }), ESCAPE = {n: "\n", f: "\f", r: "\r", t: "	", v: "", "'": "'", '"': '"'}, Lexer = function (options) {
            this.options = options
        };
        Lexer.prototype = {
            constructor: Lexer, lex: function (text) {
                for (this.text = text, this.index = 0, this.tokens = []; this.index < this.text.length;) {
                    var ch = this.text.charAt(this.index);
                    if ('"' === ch || "'" === ch)this.readString(ch); else if (this.isNumber(ch) || "." === ch && this.isNumber(this.peek()))this.readNumber(); else if (this.isIdent(ch))this.readIdent(); else if (this.is(ch, "(){}[].,;:?"))this.tokens.push({
                        index: this.index,
                        text: ch
                    }), this.index++; else if (this.isWhitespace(ch))this.index++; else {
                        var ch2 = ch + this.peek(), ch3 = ch2 + this.peek(2), op1 = OPERATORS[ch], op2 = OPERATORS[ch2], op3 = OPERATORS[ch3];
                        if (op1 || op2 || op3) {
                            var token = op3 ? ch3 : op2 ? ch2 : ch;
                            this.tokens.push({index: this.index, text: token, operator: !0}), this.index += token.length
                        } else this.throwError("Unexpected next character ", this.index, this.index + 1)
                    }
                }
                return this.tokens
            }, is: function (ch, chars) {
                return -1 !== chars.indexOf(ch)
            }, peek: function (i) {
                var num = i || 1;
                return this.index + num < this.text.length ? this.text.charAt(this.index + num) : !1
            }, isNumber: function (ch) {
                return ch >= "0" && "9" >= ch && "string" == typeof ch
            }, isWhitespace: function (ch) {
                return " " === ch || "\r" === ch || "	" === ch || "\n" === ch || "" === ch || " " === ch
            }, isIdent: function (ch) {
                return ch >= "a" && "z" >= ch || ch >= "A" && "Z" >= ch || "_" === ch || "$" === ch
            }, isExpOperator: function (ch) {
                return "-" === ch || "+" === ch || this.isNumber(ch)
            }, throwError: function (error, start, end) {
                end = end || this.index;
                var colStr = isDefined(start) ? "s " + start + "-" + this.index + " [" + this.text.substring(start, end) + "]" : " " + end;
                throw $parseMinErr("lexerr", "Lexer Error: {0} at column{1} in expression [{2}].", error, colStr, this.text)
            }, readNumber: function () {
                for (var number = "", start = this.index; this.index < this.text.length;) {
                    var ch = lowercase(this.text.charAt(this.index));
                    if ("." == ch || this.isNumber(ch))number += ch; else {
                        var peekCh = this.peek();
                        if ("e" == ch && this.isExpOperator(peekCh))number += ch; else if (this.isExpOperator(ch) && peekCh && this.isNumber(peekCh) && "e" == number.charAt(number.length - 1))number += ch; else {
                            if (!this.isExpOperator(ch) || peekCh && this.isNumber(peekCh) || "e" != number.charAt(number.length - 1))break;
                            this.throwError("Invalid exponent")
                        }
                    }
                    this.index++
                }
                this.tokens.push({index: start, text: number, constant: !0, value: Number(number)})
            }, readIdent: function () {
                for (var start = this.index; this.index < this.text.length;) {
                    var ch = this.text.charAt(this.index);
                    if (!this.isIdent(ch) && !this.isNumber(ch))break;
                    this.index++
                }
                this.tokens.push({index: start, text: this.text.slice(start, this.index), identifier: !0})
            }, readString: function (quote) {
                var start = this.index;
                this.index++;
                for (var string = "", rawString = quote, escape = !1; this.index < this.text.length;) {
                    var ch = this.text.charAt(this.index);
                    if (rawString += ch, escape) {
                        if ("u" === ch) {
                            var hex = this.text.substring(this.index + 1, this.index + 5);
                            hex.match(/[\da-f]{4}/i) || this.throwError("Invalid unicode escape [\\u" + hex + "]"), this.index += 4, string += String.fromCharCode(parseInt(hex, 16))
                        } else {
                            var rep = ESCAPE[ch];
                            string += rep || ch
                        }
                        escape = !1
                    } else if ("\\" === ch)escape = !0; else {
                        if (ch === quote)return this.index++, void this.tokens.push({
                            index: start,
                            text: rawString,
                            constant: !0,
                            value: string
                        });
                        string += ch
                    }
                    this.index++
                }
                this.throwError("Unterminated quote", start)
            }
        };
        var Parser = function (lexer, $filter, options) {
            this.lexer = lexer, this.$filter = $filter, this.options = options
        };
        Parser.ZERO = extend(function () {
            return 0
        }, {sharedGetter: !0, constant: !0}), Parser.prototype = {
            constructor: Parser, parse: function (text) {
                this.text = text, this.tokens = this.lexer.lex(text);
                var value = this.statements();
                return 0 !== this.tokens.length && this.throwError("is an unexpected token", this.tokens[0]), value.literal = !!value.literal, value.constant = !!value.constant, value
            }, primary: function () {
                var primary;
                this.expect("(") ? (primary = this.filterChain(), this.consume(")")) : this.expect("[") ? primary = this.arrayDeclaration() : this.expect("{") ? primary = this.object() : this.peek().identifier && this.peek().text in CONSTANTS ? primary = CONSTANTS[this.consume().text] : this.peek().identifier ? primary = this.identifier() : this.peek().constant ? primary = this.constant() : this.throwError("not a primary expression", this.peek());
                for (var next, context; next = this.expect("(", "[", ".");)"(" === next.text ? (primary = this.functionCall(primary, context), context = null) : "[" === next.text ? (context = primary, primary = this.objectIndex(primary)) : "." === next.text ? (context = primary, primary = this.fieldAccess(primary)) : this.throwError("IMPOSSIBLE");
                return primary
            }, throwError: function (msg, token) {
                throw $parseMinErr("syntax", "Syntax Error: Token '{0}' {1} at column {2} of the expression [{3}] starting at [{4}].", token.text, msg, token.index + 1, this.text, this.text.substring(token.index))
            }, peekToken: function () {
                if (0 === this.tokens.length)throw $parseMinErr("ueoe", "Unexpected end of expression: {0}", this.text);
                return this.tokens[0]
            }, peek: function (e1, e2, e3, e4) {
                return this.peekAhead(0, e1, e2, e3, e4)
            }, peekAhead: function (i, e1, e2, e3, e4) {
                if (this.tokens.length > i) {
                    var token = this.tokens[i], t = token.text;
                    if (t === e1 || t === e2 || t === e3 || t === e4 || !e1 && !e2 && !e3 && !e4)return token
                }
                return !1
            }, expect: function (e1, e2, e3, e4) {
                var token = this.peek(e1, e2, e3, e4);
                return token ? (this.tokens.shift(), token) : !1
            }, consume: function (e1) {
                if (0 === this.tokens.length)throw $parseMinErr("ueoe", "Unexpected end of expression: {0}", this.text);
                var token = this.expect(e1);
                return token || this.throwError("is unexpected, expecting [" + e1 + "]", this.peek()), token
            }, unaryFn: function (op, right) {
                var fn = OPERATORS[op];
                return extend(function (self, locals) {
                    return fn(self, locals, right)
                }, {constant: right.constant, inputs: [right]})
            }, binaryFn: function (left, op, right, isBranching) {
                var fn = OPERATORS[op];
                return extend(function (self, locals) {
                    return fn(self, locals, left, right)
                }, {constant: left.constant && right.constant, inputs: !isBranching && [left, right]})
            }, identifier: function () {
                for (var id = this.consume().text; this.peek(".") && this.peekAhead(1).identifier && !this.peekAhead(2, "(");)id += this.consume().text + this.consume().text;
                return getterFn(id, this.options, this.text)
            }, constant: function () {
                var value = this.consume().value;
                return extend(function () {
                    return value
                }, {constant: !0, literal: !0})
            }, statements: function () {
                for (var statements = []; ;)if (this.tokens.length > 0 && !this.peek("}", ")", ";", "]") && statements.push(this.filterChain()), !this.expect(";"))return 1 === statements.length ? statements[0] : function (self, locals) {
                    for (var value, i = 0, ii = statements.length; ii > i; i++)value = statements[i](self, locals);
                    return value
                }
            }, filterChain: function () {
                for (var token, left = this.expression(); token = this.expect("|");)left = this.filter(left);
                return left
            }, filter: function (inputFn) {
                var argsFn, args, fn = this.$filter(this.consume().text);
                if (this.peek(":"))for (argsFn = [], args = []; this.expect(":");)argsFn.push(this.expression());
                var inputs = [inputFn].concat(argsFn || []);
                return extend(function (self, locals) {
                    var input = inputFn(self, locals);
                    if (args) {
                        args[0] = input;
                        for (var i = argsFn.length; i--;)args[i + 1] = argsFn[i](self, locals);
                        return fn.apply(undefined, args)
                    }
                    return fn(input)
                }, {constant: !fn.$stateful && inputs.every(isConstant), inputs: !fn.$stateful && inputs})
            }, expression: function () {
                return this.assignment()
            }, assignment: function () {
                var right, token, left = this.ternary();
                return (token = this.expect("=")) ? (left.assign || this.throwError("implies assignment but [" + this.text.substring(0, token.index) + "] can not be assigned to", token), right = this.ternary(), extend(function (scope, locals) {
                    return left.assign(scope, right(scope, locals), locals)
                }, {inputs: [left, right]})) : left
            }, ternary: function () {
                var middle, token, left = this.logicalOR();
                if ((token = this.expect("?")) && (middle = this.assignment(), this.consume(":"))) {
                    var right = this.assignment();
                    return extend(function (self, locals) {
                        return left(self, locals) ? middle(self, locals) : right(self, locals)
                    }, {constant: left.constant && middle.constant && right.constant})
                }
                return left
            }, logicalOR: function () {
                for (var token, left = this.logicalAND(); token = this.expect("||");)left = this.binaryFn(left, token.text, this.logicalAND(), !0);
                return left
            }, logicalAND: function () {
                for (var token, left = this.equality(); token = this.expect("&&");)left = this.binaryFn(left, token.text, this.equality(), !0);
                return left
            }, equality: function () {
                for (var token, left = this.relational(); token = this.expect("==", "!=", "===", "!==");)left = this.binaryFn(left, token.text, this.relational());
                return left
            }, relational: function () {
                for (var token, left = this.additive(); token = this.expect("<", ">", "<=", ">=");)left = this.binaryFn(left, token.text, this.additive());
                return left
            }, additive: function () {
                for (var token, left = this.multiplicative(); token = this.expect("+", "-");)left = this.binaryFn(left, token.text, this.multiplicative());
                return left
            }, multiplicative: function () {
                for (var token, left = this.unary(); token = this.expect("*", "/", "%");)left = this.binaryFn(left, token.text, this.unary());
                return left
            }, unary: function () {
                var token;
                return this.expect("+") ? this.primary() : (token = this.expect("-")) ? this.binaryFn(Parser.ZERO, token.text, this.unary()) : (token = this.expect("!")) ? this.unaryFn(token.text, this.unary()) : this.primary()
            }, fieldAccess: function (object) {
                var getter = this.identifier();
                return extend(function (scope, locals, self) {
                    var o = self || object(scope, locals);
                    return null == o ? undefined : getter(o)
                }, {
                    assign: function (scope, value, locals) {
                        var o = object(scope, locals);
                        return o || object.assign(scope, o = {}), getter.assign(o, value)
                    }
                })
            }, objectIndex: function (obj) {
                var expression = this.text, indexFn = this.expression();
                return this.consume("]"), extend(function (self, locals) {
                    var v, o = obj(self, locals), i = indexFn(self, locals);
                    return ensureSafeMemberName(i, expression), o ? v = ensureSafeObject(o[i], expression) : undefined
                }, {
                    assign: function (self, value, locals) {
                        var key = ensureSafeMemberName(indexFn(self, locals), expression), o = ensureSafeObject(obj(self, locals), expression);
                        return o || obj.assign(self, o = {}), o[key] = value
                    }
                })
            }, functionCall: function (fnGetter, contextGetter) {
                var argsFn = [];
                if (")" !== this.peekToken().text)do argsFn.push(this.expression()); while (this.expect(","));
                this.consume(")");
                var expressionText = this.text, args = argsFn.length ? [] : null;
                return function (scope, locals) {
                    var context = contextGetter ? contextGetter(scope, locals) : isDefined(contextGetter) ? undefined : scope, fn = fnGetter(scope, locals, context) || noop;
                    if (args)for (var i = argsFn.length; i--;)args[i] = ensureSafeObject(argsFn[i](scope, locals), expressionText);
                    ensureSafeObject(context, expressionText), ensureSafeFunction(fn, expressionText);
                    var v = fn.apply ? fn.apply(context, args) : fn(args[0], args[1], args[2], args[3], args[4]);
                    return ensureSafeObject(v, expressionText)
                }
            }, arrayDeclaration: function () {
                var elementFns = [];
                if ("]" !== this.peekToken().text)do {
                    if (this.peek("]"))break;
                    elementFns.push(this.expression())
                } while (this.expect(","));
                return this.consume("]"), extend(function (self, locals) {
                    for (var array = [], i = 0, ii = elementFns.length; ii > i; i++)array.push(elementFns[i](self, locals));
                    return array
                }, {literal: !0, constant: elementFns.every(isConstant), inputs: elementFns})
            }, object: function () {
                var keys = [], valueFns = [];
                if ("}" !== this.peekToken().text)do {
                    if (this.peek("}"))break;
                    var token = this.consume();
                    token.constant ? keys.push(token.value) : token.identifier ? keys.push(token.text) : this.throwError("invalid key", token), this.consume(":"), valueFns.push(this.expression())
                } while (this.expect(","));
                return this.consume("}"), extend(function (self, locals) {
                    for (var object = {}, i = 0, ii = valueFns.length; ii > i; i++)object[keys[i]] = valueFns[i](self, locals);
                    return object
                }, {literal: !0, constant: valueFns.every(isConstant), inputs: valueFns})
            }
        };
        var getterFnCacheDefault = createMap(), getterFnCacheExpensive = createMap(), objectValueOf = Object.prototype.valueOf, $sceMinErr = minErr("$sce"), SCE_CONTEXTS = {
            HTML: "html",
            CSS: "css",
            URL: "url",
            RESOURCE_URL: "resourceUrl",
            JS: "js"
        }, $compileMinErr = minErr("$compile"), urlParsingNode = document.createElement("a"), originUrl = urlResolve(window.location.href);
        $FilterProvider.$inject = ["$provide"], currencyFilter.$inject = ["$locale"], numberFilter.$inject = ["$locale"];
        var DECIMAL_SEP = ".", DATE_FORMATS = {
            yyyy: dateGetter("FullYear", 4),
            yy: dateGetter("FullYear", 2, 0, !0),
            y: dateGetter("FullYear", 1),
            MMMM: dateStrGetter("Month"),
            MMM: dateStrGetter("Month", !0),
            MM: dateGetter("Month", 2, 1),
            M: dateGetter("Month", 1, 1),
            dd: dateGetter("Date", 2),
            d: dateGetter("Date", 1),
            HH: dateGetter("Hours", 2),
            H: dateGetter("Hours", 1),
            hh: dateGetter("Hours", 2, -12),
            h: dateGetter("Hours", 1, -12),
            mm: dateGetter("Minutes", 2),
            m: dateGetter("Minutes", 1),
            ss: dateGetter("Seconds", 2),
            s: dateGetter("Seconds", 1),
            sss: dateGetter("Milliseconds", 3),
            EEEE: dateStrGetter("Day"),
            EEE: dateStrGetter("Day", !0),
            a: ampmGetter,
            Z: timeZoneGetter,
            ww: weekGetter(2),
            w: weekGetter(1)
        }, DATE_FORMATS_SPLIT = /((?:[^yMdHhmsaZEw']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z|w+))(.*)/, NUMBER_STRING = /^\-?\d+$/;
        dateFilter.$inject = ["$locale"];
        var lowercaseFilter = valueFn(lowercase), uppercaseFilter = valueFn(uppercase);
        orderByFilter.$inject = ["$parse"];
        var htmlAnchorDirective = valueFn({
            restrict: "E", compile: function (element, attr) {
                return attr.href || attr.xlinkHref || attr.name ? void 0 : function (scope, element) {
                    var href = "[object SVGAnimatedString]" === toString.call(element.prop("href")) ? "xlink:href" : "href";
                    element.on("click", function (event) {
                        element.attr(href) || event.preventDefault()
                    })
                }
            }
        }), ngAttributeAliasDirectives = {};
        forEach(BOOLEAN_ATTR, function (propName, attrName) {
            if ("multiple" != propName) {
                var normalized = directiveNormalize("ng-" + attrName);
                ngAttributeAliasDirectives[normalized] = function () {
                    return {
                        restrict: "A", priority: 100, link: function (scope, element, attr) {
                            scope.$watch(attr[normalized], function (value) {
                                attr.$set(attrName, !!value)
                            })
                        }
                    }
                }
            }
        }), forEach(ALIASED_ATTR, function (htmlAttr, ngAttr) {
            ngAttributeAliasDirectives[ngAttr] = function () {
                return {
                    priority: 100, link: function (scope, element, attr) {
                        if ("ngPattern" === ngAttr && "/" == attr.ngPattern.charAt(0)) {
                            var match = attr.ngPattern.match(REGEX_STRING_REGEXP);
                            if (match)return void attr.$set("ngPattern", new RegExp(match[1], match[2]))
                        }
                        scope.$watch(attr[ngAttr], function (value) {
                            attr.$set(ngAttr, value)
                        })
                    }
                }
            }
        }), forEach(["src", "srcset", "href"], function (attrName) {
            var normalized = directiveNormalize("ng-" + attrName);
            ngAttributeAliasDirectives[normalized] = function () {
                return {
                    priority: 99, link: function (scope, element, attr) {
                        var propName = attrName, name = attrName;
                        "href" === attrName && "[object SVGAnimatedString]" === toString.call(element.prop("href")) && (name = "xlinkHref", attr.$attr[name] = "xlink:href", propName = null), attr.$observe(normalized, function (value) {
                            return value ? (attr.$set(name, value), void(msie && propName && element.prop(propName, attr[name]))) : void("href" === attrName && attr.$set(name, null))
                        })
                    }
                }
            }
        });
        var nullFormCtrl = {
            $addControl: noop,
            $$renameControl: nullFormRenameControl,
            $removeControl: noop,
            $setValidity: noop,
            $setDirty: noop,
            $setPristine: noop,
            $setSubmitted: noop
        }, SUBMITTED_CLASS = "ng-submitted";
        FormController.$inject = ["$element", "$attrs", "$scope", "$animate", "$interpolate"];
        var formDirectiveFactory = function (isNgForm) {
            return ["$timeout", function ($timeout) {
                var formDirective = {
                    name: "form",
                    restrict: isNgForm ? "EAC" : "E",
                    controller: FormController,
                    compile: function (formElement) {
                        return formElement.addClass(PRISTINE_CLASS).addClass(VALID_CLASS), {
                            pre: function (scope, formElement, attr, controller) {
                                if (!("action"in attr)) {
                                    var handleFormSubmission = function (event) {
                                        scope.$apply(function () {
                                            controller.$commitViewValue(), controller.$setSubmitted()
                                        }), event.preventDefault()
                                    };
                                    addEventListenerFn(formElement[0], "submit", handleFormSubmission), formElement.on("$destroy", function () {
                                        $timeout(function () {
                                            removeEventListenerFn(formElement[0], "submit", handleFormSubmission)
                                        }, 0, !1)
                                    })
                                }
                                var parentFormCtrl = controller.$$parentForm, alias = controller.$name;
                                alias && (setter(scope, alias, controller, alias), attr.$observe(attr.name ? "name" : "ngForm", function (newValue) {
                                    alias !== newValue && (setter(scope, alias, undefined, alias), alias = newValue, setter(scope, alias, controller, alias), parentFormCtrl.$$renameControl(controller, alias))
                                })), formElement.on("$destroy", function () {
                                    parentFormCtrl.$removeControl(controller), alias && setter(scope, alias, undefined, alias), extend(controller, nullFormCtrl)
                                })
                            }
                        }
                    }
                };
                return formDirective
            }]
        }, formDirective = formDirectiveFactory(), ngFormDirective = formDirectiveFactory(!0), ISO_DATE_REGEXP = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/, URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/, EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i, NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/, DATE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})$/, DATETIMELOCAL_REGEXP = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/, WEEK_REGEXP = /^(\d{4})-W(\d\d)$/, MONTH_REGEXP = /^(\d{4})-(\d\d)$/, TIME_REGEXP = /^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/, DEFAULT_REGEXP = /(\s+|^)default(\s+|$)/, $ngModelMinErr = new minErr("ngModel"), inputType = {
            text: textInputType,
            date: createDateInputType("date", DATE_REGEXP, createDateParser(DATE_REGEXP, ["yyyy", "MM", "dd"]), "yyyy-MM-dd"),
            "datetime-local": createDateInputType("datetimelocal", DATETIMELOCAL_REGEXP, createDateParser(DATETIMELOCAL_REGEXP, ["yyyy", "MM", "dd", "HH", "mm", "ss", "sss"]), "yyyy-MM-ddTHH:mm:ss.sss"),
            time: createDateInputType("time", TIME_REGEXP, createDateParser(TIME_REGEXP, ["HH", "mm", "ss", "sss"]), "HH:mm:ss.sss"),
            week: createDateInputType("week", WEEK_REGEXP, weekParser, "yyyy-Www"),
            month: createDateInputType("month", MONTH_REGEXP, createDateParser(MONTH_REGEXP, ["yyyy", "MM"]), "yyyy-MM"),
            number: numberInputType,
            url: urlInputType,
            email: emailInputType,
            radio: radioInputType,
            checkbox: checkboxInputType,
            hidden: noop,
            button: noop,
            submit: noop,
            reset: noop,
            file: noop
        }, inputDirective = ["$browser", "$sniffer", "$filter", "$parse", function ($browser, $sniffer, $filter, $parse) {
            return {
                restrict: "E", require: ["?ngModel"], link: {
                    pre: function (scope, element, attr, ctrls) {
                        ctrls[0] && (inputType[lowercase(attr.type)] || inputType.text)(scope, element, attr, ctrls[0], $sniffer, $browser, $filter, $parse)
                    }
                }
            }
        }], VALID_CLASS = "ng-valid", INVALID_CLASS = "ng-invalid", PRISTINE_CLASS = "ng-pristine", DIRTY_CLASS = "ng-dirty", UNTOUCHED_CLASS = "ng-untouched", TOUCHED_CLASS = "ng-touched", PENDING_CLASS = "ng-pending", NgModelController = ["$scope", "$exceptionHandler", "$attrs", "$element", "$parse", "$animate", "$timeout", "$rootScope", "$q", "$interpolate", function ($scope, $exceptionHandler, $attr, $element, $parse, $animate, $timeout, $rootScope, $q, $interpolate) {
            this.$viewValue = Number.NaN, this.$modelValue = Number.NaN, this.$$rawModelValue = undefined, this.$validators = {}, this.$asyncValidators = {}, this.$parsers = [], this.$formatters = [], this.$viewChangeListeners = [], this.$untouched = !0, this.$touched = !1, this.$pristine = !0, this.$dirty = !1, this.$valid = !0, this.$invalid = !1, this.$error = {}, this.$$success = {}, this.$pending = undefined, this.$name = $interpolate($attr.name || "", !1)($scope);
            var parsedNgModel = $parse($attr.ngModel), parsedNgModelAssign = parsedNgModel.assign, ngModelGet = parsedNgModel, ngModelSet = parsedNgModelAssign, pendingDebounce = null, ctrl = this;
            this.$$setOptions = function (options) {
                if (ctrl.$options = options, options && options.getterSetter) {
                    var invokeModelGetter = $parse($attr.ngModel + "()"), invokeModelSetter = $parse($attr.ngModel + "($$$p)");
                    ngModelGet = function ($scope) {
                        var modelValue = parsedNgModel($scope);
                        return isFunction(modelValue) && (modelValue = invokeModelGetter($scope)), modelValue
                    }, ngModelSet = function ($scope) {
                        isFunction(parsedNgModel($scope)) ? invokeModelSetter($scope, {$$$p: ctrl.$modelValue}) : parsedNgModelAssign($scope, ctrl.$modelValue)
                    }
                } else if (!parsedNgModel.assign)throw $ngModelMinErr("nonassign", "Expression '{0}' is non-assignable. Element: {1}", $attr.ngModel, startingTag($element))
            }, this.$render = noop, this.$isEmpty = function (value) {
                return isUndefined(value) || "" === value || null === value || value !== value
            };
            var parentForm = $element.inheritedData("$formController") || nullFormCtrl, currentValidationRunId = 0;
            addSetValidityMethod({
                ctrl: this, $element: $element, set: function (object, property) {
                    object[property] = !0
                }, unset: function (object, property) {
                    delete object[property]
                }, parentForm: parentForm, $animate: $animate
            }), this.$setPristine = function () {
                ctrl.$dirty = !1, ctrl.$pristine = !0, $animate.removeClass($element, DIRTY_CLASS), $animate.addClass($element, PRISTINE_CLASS)
            }, this.$setDirty = function () {
                ctrl.$dirty = !0, ctrl.$pristine = !1, $animate.removeClass($element, PRISTINE_CLASS), $animate.addClass($element, DIRTY_CLASS), parentForm.$setDirty()
            }, this.$setUntouched = function () {
                ctrl.$touched = !1, ctrl.$untouched = !0, $animate.setClass($element, UNTOUCHED_CLASS, TOUCHED_CLASS)
            }, this.$setTouched = function () {
                ctrl.$touched = !0, ctrl.$untouched = !1, $animate.setClass($element, TOUCHED_CLASS, UNTOUCHED_CLASS)
            }, this.$rollbackViewValue = function () {
                $timeout.cancel(pendingDebounce), ctrl.$viewValue = ctrl.$$lastCommittedViewValue, ctrl.$render()
            }, this.$validate = function () {
                if (!isNumber(ctrl.$modelValue) || !isNaN(ctrl.$modelValue)) {
                    var viewValue = ctrl.$$lastCommittedViewValue, modelValue = ctrl.$$rawModelValue, parserName = ctrl.$$parserName || "parse", parserValid = ctrl.$error[parserName] ? !1 : undefined, prevValid = ctrl.$valid, prevModelValue = ctrl.$modelValue, allowInvalid = ctrl.$options && ctrl.$options.allowInvalid;
                    ctrl.$$runValidators(parserValid, modelValue, viewValue, function (allValid) {
                        allowInvalid || prevValid === allValid || (ctrl.$modelValue = allValid ? modelValue : undefined, ctrl.$modelValue !== prevModelValue && ctrl.$$writeModelToScope())
                    })
                }
            }, this.$$runValidators = function (parseValid, modelValue, viewValue, doneCallback) {
                function processParseErrors(parseValid) {
                    var errorKey = ctrl.$$parserName || "parse";
                    if (parseValid === undefined)setValidity(errorKey, null); else if (setValidity(errorKey, parseValid), !parseValid)return forEach(ctrl.$validators, function (v, name) {
                        setValidity(name, null)
                    }), forEach(ctrl.$asyncValidators, function (v, name) {
                        setValidity(name, null)
                    }), !1;
                    return !0
                }

                function processSyncValidators() {
                    var syncValidatorsValid = !0;
                    return forEach(ctrl.$validators, function (validator, name) {
                        var result = validator(modelValue, viewValue);
                        syncValidatorsValid = syncValidatorsValid && result, setValidity(name, result)
                    }), syncValidatorsValid ? !0 : (forEach(ctrl.$asyncValidators, function (v, name) {
                        setValidity(name, null)
                    }), !1)
                }

                function processAsyncValidators() {
                    var validatorPromises = [], allValid = !0;
                    forEach(ctrl.$asyncValidators, function (validator, name) {
                        var promise = validator(modelValue, viewValue);
                        if (!isPromiseLike(promise))throw $ngModelMinErr("$asyncValidators", "Expected asynchronous validator to return a promise but got '{0}' instead.", promise);
                        setValidity(name, undefined), validatorPromises.push(promise.then(function () {
                            setValidity(name, !0)
                        }, function () {
                            allValid = !1, setValidity(name, !1)
                        }))
                    }), validatorPromises.length ? $q.all(validatorPromises).then(function () {
                        validationDone(allValid)
                    }, noop) : validationDone(!0)
                }

                function setValidity(name, isValid) {
                    localValidationRunId === currentValidationRunId && ctrl.$setValidity(name, isValid)
                }

                function validationDone(allValid) {
                    localValidationRunId === currentValidationRunId && doneCallback(allValid)
                }

                currentValidationRunId++;
                var localValidationRunId = currentValidationRunId;
                return processParseErrors(parseValid) && processSyncValidators() ? void processAsyncValidators() : void validationDone(!1)
            }, this.$commitViewValue = function () {
                var viewValue = ctrl.$viewValue;
                $timeout.cancel(pendingDebounce), (ctrl.$$lastCommittedViewValue !== viewValue || "" === viewValue && ctrl.$$hasNativeValidators) && (ctrl.$$lastCommittedViewValue = viewValue, ctrl.$pristine && this.$setDirty(), this.$$parseAndValidate())
            }, this.$$parseAndValidate = function () {
                function writeToModelIfNeeded() {
                    ctrl.$modelValue !== prevModelValue && ctrl.$$writeModelToScope()
                }

                var viewValue = ctrl.$$lastCommittedViewValue, modelValue = viewValue, parserValid = isUndefined(modelValue) ? undefined : !0;
                if (parserValid)for (var i = 0; i < ctrl.$parsers.length; i++)if (modelValue = ctrl.$parsers[i](modelValue), isUndefined(modelValue)) {
                    parserValid = !1;
                    break
                }
                isNumber(ctrl.$modelValue) && isNaN(ctrl.$modelValue) && (ctrl.$modelValue = ngModelGet($scope));
                var prevModelValue = ctrl.$modelValue, allowInvalid = ctrl.$options && ctrl.$options.allowInvalid;
                ctrl.$$rawModelValue = modelValue, allowInvalid && (ctrl.$modelValue = modelValue, writeToModelIfNeeded()), ctrl.$$runValidators(parserValid, modelValue, ctrl.$$lastCommittedViewValue, function (allValid) {
                    allowInvalid || (ctrl.$modelValue = allValid ? modelValue : undefined, writeToModelIfNeeded())
                })
            }, this.$$writeModelToScope = function () {
                ngModelSet($scope, ctrl.$modelValue), forEach(ctrl.$viewChangeListeners, function (listener) {
                    try {
                        listener()
                    } catch (e) {
                        $exceptionHandler(e)
                    }
                })
            }, this.$setViewValue = function (value, trigger) {
                ctrl.$viewValue = value, (!ctrl.$options || ctrl.$options.updateOnDefault) && ctrl.$$debounceViewValueCommit(trigger)
            }, this.$$debounceViewValueCommit = function (trigger) {
                var debounce, debounceDelay = 0, options = ctrl.$options;
                options && isDefined(options.debounce) && (debounce = options.debounce, isNumber(debounce) ? debounceDelay = debounce : isNumber(debounce[trigger]) ? debounceDelay = debounce[trigger] : isNumber(debounce["default"]) && (debounceDelay = debounce["default"])), $timeout.cancel(pendingDebounce), debounceDelay ? pendingDebounce = $timeout(function () {
                    ctrl.$commitViewValue()
                }, debounceDelay) : $rootScope.$$phase ? ctrl.$commitViewValue() : $scope.$apply(function () {
                    ctrl.$commitViewValue()
                })
            }, $scope.$watch(function () {
                var modelValue = ngModelGet($scope);
                if (modelValue !== ctrl.$modelValue) {
                    ctrl.$modelValue = ctrl.$$rawModelValue = modelValue;
                    for (var formatters = ctrl.$formatters, idx = formatters.length, viewValue = modelValue; idx--;)viewValue = formatters[idx](viewValue);
                    ctrl.$viewValue !== viewValue && (ctrl.$viewValue = ctrl.$$lastCommittedViewValue = viewValue, ctrl.$render(), ctrl.$$runValidators(undefined, modelValue, viewValue, noop))
                }
                return modelValue
            })
        }], ngModelDirective = ["$rootScope", function ($rootScope) {
            return {
                restrict: "A",
                require: ["ngModel", "^?form", "^?ngModelOptions"],
                controller: NgModelController,
                priority: 1,
                compile: function (element) {
                    return element.addClass(PRISTINE_CLASS).addClass(UNTOUCHED_CLASS).addClass(VALID_CLASS), {
                        pre: function (scope, element, attr, ctrls) {
                            var modelCtrl = ctrls[0], formCtrl = ctrls[1] || nullFormCtrl;
                            modelCtrl.$$setOptions(ctrls[2] && ctrls[2].$options), formCtrl.$addControl(modelCtrl), attr.$observe("name", function (newValue) {
                                modelCtrl.$name !== newValue && formCtrl.$$renameControl(modelCtrl, newValue)
                            }), scope.$on("$destroy", function () {
                                formCtrl.$removeControl(modelCtrl)
                            })
                        }, post: function (scope, element, attr, ctrls) {
                            var modelCtrl = ctrls[0];
                            modelCtrl.$options && modelCtrl.$options.updateOn && element.on(modelCtrl.$options.updateOn, function (ev) {
                                modelCtrl.$$debounceViewValueCommit(ev && ev.type)
                            }), element.on("blur", function () {
                                modelCtrl.$touched || ($rootScope.$$phase ? scope.$evalAsync(modelCtrl.$setTouched) : scope.$apply(modelCtrl.$setTouched))
                            })
                        }
                    }
                }
            }
        }], ngChangeDirective = valueFn({
            restrict: "A",
            require: "ngModel",
            link: function (scope, element, attr, ctrl) {
                ctrl.$viewChangeListeners.push(function () {
                    scope.$eval(attr.ngChange)
                })
            }
        }), requiredDirective = function () {
            return {
                restrict: "A", require: "?ngModel", link: function (scope, elm, attr, ctrl) {
                    ctrl && (attr.required = !0, ctrl.$validators.required = function (modelValue, viewValue) {
                        return !attr.required || !ctrl.$isEmpty(viewValue)
                    }, attr.$observe("required", function () {
                        ctrl.$validate()
                    }))
                }
            }
        }, patternDirective = function () {
            return {
                restrict: "A", require: "?ngModel", link: function (scope, elm, attr, ctrl) {
                    if (ctrl) {
                        var regexp, patternExp = attr.ngPattern || attr.pattern;
                        attr.$observe("pattern", function (regex) {
                            if (isString(regex) && regex.length > 0 && (regex = new RegExp("^" + regex + "$")), regex && !regex.test)throw minErr("ngPattern")("noregexp", "Expected {0} to be a RegExp but was {1}. Element: {2}", patternExp, regex, startingTag(elm));
                            regexp = regex || undefined, ctrl.$validate()
                        }), ctrl.$validators.pattern = function (value) {
                            return ctrl.$isEmpty(value) || isUndefined(regexp) || regexp.test(value)
                        }
                    }
                }
            }
        }, maxlengthDirective = function () {
            return {
                restrict: "A", require: "?ngModel", link: function (scope, elm, attr, ctrl) {
                    if (ctrl) {
                        var maxlength = -1;
                        attr.$observe("maxlength", function (value) {
                            var intVal = int(value);
                            maxlength = isNaN(intVal) ? -1 : intVal, ctrl.$validate()
                        }), ctrl.$validators.maxlength = function (modelValue, viewValue) {
                            return 0 > maxlength || ctrl.$isEmpty(modelValue) || viewValue.length <= maxlength
                        }
                    }
                }
            }
        }, minlengthDirective = function () {
            return {
                restrict: "A", require: "?ngModel", link: function (scope, elm, attr, ctrl) {
                    if (ctrl) {
                        var minlength = 0;
                        attr.$observe("minlength", function (value) {
                            minlength = int(value) || 0, ctrl.$validate()
                        }), ctrl.$validators.minlength = function (modelValue, viewValue) {
                            return ctrl.$isEmpty(viewValue) || viewValue.length >= minlength
                        }
                    }
                }
            }
        }, ngListDirective = function () {
            return {
                restrict: "A", priority: 100, require: "ngModel", link: function (scope, element, attr, ctrl) {
                    var ngList = element.attr(attr.$attr.ngList) || ", ", trimValues = "false" !== attr.ngTrim, separator = trimValues ? trim(ngList) : ngList, parse = function (viewValue) {
                        if (!isUndefined(viewValue)) {
                            var list = [];
                            return viewValue && forEach(viewValue.split(separator), function (value) {
                                value && list.push(trimValues ? trim(value) : value)
                            }), list
                        }
                    };
                    ctrl.$parsers.push(parse), ctrl.$formatters.push(function (value) {
                        return isArray(value) ? value.join(ngList) : undefined
                    }), ctrl.$isEmpty = function (value) {
                        return !value || !value.length
                    }
                }
            }
        }, CONSTANT_VALUE_REGEXP = /^(true|false|\d+)$/, ngValueDirective = function () {
            return {
                restrict: "A", priority: 100, compile: function (tpl, tplAttr) {
                    return CONSTANT_VALUE_REGEXP.test(tplAttr.ngValue) ? function (scope, elm, attr) {
                        attr.$set("value", scope.$eval(attr.ngValue))
                    } : function (scope, elm, attr) {
                        scope.$watch(attr.ngValue, function (value) {
                            attr.$set("value", value)
                        })
                    }
                }
            }
        }, ngModelOptionsDirective = function () {
            return {
                restrict: "A", controller: ["$scope", "$attrs", function ($scope, $attrs) {
                    var that = this;
                    this.$options = $scope.$eval($attrs.ngModelOptions), this.$options.updateOn !== undefined ? (this.$options.updateOnDefault = !1, this.$options.updateOn = trim(this.$options.updateOn.replace(DEFAULT_REGEXP, function () {
                        return that.$options.updateOnDefault = !0, " "
                    }))) : this.$options.updateOnDefault = !0
                }]
            }
        }, ngBindDirective = ["$compile", function ($compile) {
            return {
                restrict: "AC", compile: function (templateElement) {
                    return $compile.$$addBindingClass(templateElement), function (scope, element, attr) {
                        $compile.$$addBindingInfo(element, attr.ngBind), element = element[0], scope.$watch(attr.ngBind, function (value) {
                            element.textContent = value === undefined ? "" : value
                        })
                    }
                }
            }
        }], ngBindTemplateDirective = ["$interpolate", "$compile", function ($interpolate, $compile) {
            return {
                compile: function (templateElement) {
                    return $compile.$$addBindingClass(templateElement), function (scope, element, attr) {
                        var interpolateFn = $interpolate(element.attr(attr.$attr.ngBindTemplate));
                        $compile.$$addBindingInfo(element, interpolateFn.expressions), element = element[0], attr.$observe("ngBindTemplate", function (value) {
                            element.textContent = value === undefined ? "" : value
                        })
                    }
                }
            }
        }], ngBindHtmlDirective = ["$sce", "$parse", "$compile", function ($sce, $parse, $compile) {
            return {
                restrict: "A", compile: function (tElement, tAttrs) {
                    var ngBindHtmlGetter = $parse(tAttrs.ngBindHtml), ngBindHtmlWatch = $parse(tAttrs.ngBindHtml, function (value) {
                        return (value || "").toString()
                    });
                    return $compile.$$addBindingClass(tElement), function (scope, element, attr) {
                        $compile.$$addBindingInfo(element, attr.ngBindHtml), scope.$watch(ngBindHtmlWatch, function () {
                            element.html($sce.getTrustedHtml(ngBindHtmlGetter(scope)) || "")
                        })
                    }
                }
            }
        }], ngClassDirective = classDirective("", !0), ngClassOddDirective = classDirective("Odd", 0), ngClassEvenDirective = classDirective("Even", 1), ngCloakDirective = ngDirective({
            compile: function (element, attr) {
                attr.$set("ngCloak", undefined), element.removeClass("ng-cloak")
            }
        }), ngControllerDirective = [function () {
            return {restrict: "A", scope: !0, controller: "@", priority: 500}
        }], ngEventDirectives = {}, forceAsyncEvents = {blur: !0, focus: !0};
        forEach("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "), function (eventName) {
            var directiveName = directiveNormalize("ng-" + eventName);
            ngEventDirectives[directiveName] = ["$parse", "$rootScope", function ($parse, $rootScope) {
                return {
                    restrict: "A", compile: function ($element, attr) {
                        var fn = $parse(attr[directiveName], null, !0);
                        return function (scope, element) {
                            element.on(eventName, function (event) {
                                var callback = function () {
                                    fn(scope, {$event: event})
                                };
                                forceAsyncEvents[eventName] && $rootScope.$$phase ? scope.$evalAsync(callback) : scope.$apply(callback)
                            })
                        }
                    }
                }
            }]
        });
        var ngIfDirective = ["$animate", function ($animate) {
            return {
                multiElement: !0,
                transclude: "element",
                priority: 600,
                terminal: !0,
                restrict: "A",
                $$tlb: !0,
                link: function ($scope, $element, $attr, ctrl, $transclude) {
                    var block, childScope, previousElements;
                    $scope.$watch($attr.ngIf, function (value) {
                        value ? childScope || $transclude(function (clone, newScope) {
                            childScope = newScope, clone[clone.length++] = document.createComment(" end ngIf: " + $attr.ngIf + " "), block = {clone: clone}, $animate.enter(clone, $element.parent(), $element)
                        }) : (previousElements && (previousElements.remove(), previousElements = null), childScope && (childScope.$destroy(), childScope = null), block && (previousElements = getBlockNodes(block.clone), $animate.leave(previousElements).then(function () {
                            previousElements = null
                        }), block = null))
                    })
                }
            }
        }], ngIncludeDirective = ["$templateRequest", "$anchorScroll", "$animate", "$sce", function ($templateRequest, $anchorScroll, $animate, $sce) {
            return {
                restrict: "ECA",
                priority: 400,
                terminal: !0,
                transclude: "element",
                controller: angular.noop,
                compile: function (element, attr) {
                    var srcExp = attr.ngInclude || attr.src, onloadExp = attr.onload || "", autoScrollExp = attr.autoscroll;
                    return function (scope, $element, $attr, ctrl, $transclude) {
                        var currentScope, previousElement, currentElement, changeCounter = 0, cleanupLastIncludeContent = function () {
                            previousElement && (previousElement.remove(), previousElement = null), currentScope && (currentScope.$destroy(), currentScope = null), currentElement && ($animate.leave(currentElement).then(function () {
                                previousElement = null
                            }), previousElement = currentElement, currentElement = null)
                        };
                        scope.$watch($sce.parseAsResourceUrl(srcExp), function (src) {
                            var afterAnimation = function () {
                                !isDefined(autoScrollExp) || autoScrollExp && !scope.$eval(autoScrollExp) || $anchorScroll()
                            }, thisChangeId = ++changeCounter;
                            src ? ($templateRequest(src, !0).then(function (response) {
                                if (thisChangeId === changeCounter) {
                                    var newScope = scope.$new();
                                    ctrl.template = response;
                                    var clone = $transclude(newScope, function (clone) {
                                        cleanupLastIncludeContent(), $animate.enter(clone, null, $element).then(afterAnimation)
                                    });
                                    currentScope = newScope, currentElement = clone, currentScope.$emit("$includeContentLoaded", src), scope.$eval(onloadExp)
                                }
                            }, function () {
                                thisChangeId === changeCounter && (cleanupLastIncludeContent(), scope.$emit("$includeContentError", src))
                            }), scope.$emit("$includeContentRequested", src)) : (cleanupLastIncludeContent(), ctrl.template = null)
                        })
                    }
                }
            }
        }], ngIncludeFillContentDirective = ["$compile", function ($compile) {
            return {
                restrict: "ECA",
                priority: -400,
                require: "ngInclude",
                link: function (scope, $element, $attr, ctrl) {
                    return /SVG/.test($element[0].toString()) ? ($element.empty(), void $compile(jqLiteBuildFragment(ctrl.template, document).childNodes)(scope, function (clone) {
                        $element.append(clone)
                    }, {futureParentElement: $element})) : ($element.html(ctrl.template), void $compile($element.contents())(scope))
                }
            }
        }], ngInitDirective = ngDirective({
            priority: 450, compile: function () {
                return {
                    pre: function (scope, element, attrs) {
                        scope.$eval(attrs.ngInit)
                    }
                }
            }
        }), ngNonBindableDirective = ngDirective({
            terminal: !0,
            priority: 1e3
        }), ngPluralizeDirective = ["$locale", "$interpolate", function ($locale, $interpolate) {
            var BRACE = /{}/g, IS_WHEN = /^when(Minus)?(.+)$/;
            return {
                restrict: "EA", link: function (scope, element, attr) {
                    function updateElementText(newText) {
                        element.text(newText || "")
                    }

                    var lastCount, numberExp = attr.count, whenExp = attr.$attr.when && element.attr(attr.$attr.when), offset = attr.offset || 0, whens = scope.$eval(whenExp) || {}, whensExpFns = {}, startSymbol = $interpolate.startSymbol(), endSymbol = $interpolate.endSymbol(), braceReplacement = startSymbol + numberExp + "-" + offset + endSymbol, watchRemover = angular.noop;
                    forEach(attr, function (expression, attributeName) {
                        var tmpMatch = IS_WHEN.exec(attributeName);
                        if (tmpMatch) {
                            var whenKey = (tmpMatch[1] ? "-" : "") + lowercase(tmpMatch[2]);
                            whens[whenKey] = element.attr(attr.$attr[attributeName])
                        }
                    }), forEach(whens, function (expression, key) {
                        whensExpFns[key] = $interpolate(expression.replace(BRACE, braceReplacement))
                    }), scope.$watch(numberExp, function (newVal) {
                        var count = parseFloat(newVal), countIsNaN = isNaN(count);
                        countIsNaN || count in whens || (count = $locale.pluralCat(count - offset)), count === lastCount || countIsNaN && isNaN(lastCount) || (watchRemover(), watchRemover = scope.$watch(whensExpFns[count], updateElementText), lastCount = count)
                    })
                }
            }
        }], ngRepeatDirective = ["$parse", "$animate", function ($parse, $animate) {
            var NG_REMOVED = "$$NG_REMOVED", ngRepeatMinErr = minErr("ngRepeat"), updateScope = function (scope, index, valueIdentifier, value, keyIdentifier, key, arrayLength) {
                scope[valueIdentifier] = value, keyIdentifier && (scope[keyIdentifier] = key), scope.$index = index, scope.$first = 0 === index, scope.$last = index === arrayLength - 1, scope.$middle = !(scope.$first || scope.$last), scope.$odd = !(scope.$even = 0 === (1 & index))
            }, getBlockStart = function (block) {
                return block.clone[0]
            }, getBlockEnd = function (block) {
                return block.clone[block.clone.length - 1]
            };
            return {
                restrict: "A",
                multiElement: !0,
                transclude: "element",
                priority: 1e3,
                terminal: !0,
                $$tlb: !0,
                compile: function ($element, $attr) {
                    var expression = $attr.ngRepeat, ngRepeatEndComment = document.createComment(" end ngRepeat: " + expression + " "), match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);
                    if (!match)throw ngRepeatMinErr("iexp", "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.", expression);
                    var lhs = match[1], rhs = match[2], aliasAs = match[3], trackByExp = match[4];
                    if (match = lhs.match(/^(?:(\s*[\$\w]+)|\(\s*([\$\w]+)\s*,\s*([\$\w]+)\s*\))$/), !match)throw ngRepeatMinErr("iidexp", "'_item_' in '_item_ in _collection_' should be an identifier or '(_key_, _value_)' expression, but got '{0}'.", lhs);
                    var valueIdentifier = match[3] || match[1], keyIdentifier = match[2];
                    if (aliasAs && (!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(aliasAs) || /^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent)$/.test(aliasAs)))throw ngRepeatMinErr("badident", "alias '{0}' is invalid --- must be a valid JS identifier which is not a reserved name.", aliasAs);
                    var trackByExpGetter, trackByIdExpFn, trackByIdArrayFn, trackByIdObjFn, hashFnLocals = {$id: hashKey};
                    return trackByExp ? trackByExpGetter = $parse(trackByExp) : (trackByIdArrayFn = function (key, value) {
                        return hashKey(value)
                    }, trackByIdObjFn = function (key) {
                        return key
                    }), function ($scope, $element, $attr, ctrl, $transclude) {
                        trackByExpGetter && (trackByIdExpFn = function (key, value, index) {
                            return keyIdentifier && (hashFnLocals[keyIdentifier] = key), hashFnLocals[valueIdentifier] = value, hashFnLocals.$index = index, trackByExpGetter($scope, hashFnLocals)
                        });
                        var lastBlockMap = createMap();
                        $scope.$watchCollection(rhs, function (collection) {
                            var index, length, nextNode, collectionLength, key, value, trackById, trackByIdFn, collectionKeys, block, nextBlockOrder, elementsToRemove, previousNode = $element[0], nextBlockMap = createMap();
                            if (aliasAs && ($scope[aliasAs] = collection), isArrayLike(collection))collectionKeys = collection, trackByIdFn = trackByIdExpFn || trackByIdArrayFn; else {
                                trackByIdFn = trackByIdExpFn || trackByIdObjFn, collectionKeys = [];
                                for (var itemKey in collection)collection.hasOwnProperty(itemKey) && "$" != itemKey.charAt(0) && collectionKeys.push(itemKey);
                                collectionKeys.sort()
                            }
                            for (collectionLength = collectionKeys.length, nextBlockOrder = new Array(collectionLength), index = 0; collectionLength > index; index++)if (key = collection === collectionKeys ? index : collectionKeys[index], value = collection[key], trackById = trackByIdFn(key, value, index), lastBlockMap[trackById])block = lastBlockMap[trackById], delete lastBlockMap[trackById], nextBlockMap[trackById] = block, nextBlockOrder[index] = block;
                            else {
                                if (nextBlockMap[trackById])throw forEach(nextBlockOrder, function (block) {
                                    block && block.scope && (lastBlockMap[block.id] = block)
                                }), ngRepeatMinErr("dupes", "Duplicates in a repeater are not allowed. Use 'track by' expression to specify unique keys. Repeater: {0}, Duplicate key: {1}, Duplicate value: {2}", expression, trackById, value);
                                nextBlockOrder[index] = {
                                    id: trackById,
                                    scope: undefined,
                                    clone: undefined
                                }, nextBlockMap[trackById] = !0
                            }
                            for (var blockKey in lastBlockMap) {
                                if (block = lastBlockMap[blockKey], elementsToRemove = getBlockNodes(block.clone), $animate.leave(elementsToRemove), elementsToRemove[0].parentNode)for (index = 0, length = elementsToRemove.length; length > index; index++)elementsToRemove[index][NG_REMOVED] = !0;
                                block.scope.$destroy()
                            }
                            for (index = 0; collectionLength > index; index++)if (key = collection === collectionKeys ? index : collectionKeys[index], value = collection[key], block = nextBlockOrder[index], block.scope) {
                                nextNode = previousNode;
                                do nextNode = nextNode.nextSibling; while (nextNode && nextNode[NG_REMOVED]);
                                getBlockStart(block) != nextNode && $animate.move(getBlockNodes(block.clone), null, jqLite(previousNode)), previousNode = getBlockEnd(block), updateScope(block.scope, index, valueIdentifier, value, keyIdentifier, key, collectionLength)
                            } else $transclude(function (clone, scope) {
                                block.scope = scope;
                                var endNode = ngRepeatEndComment.cloneNode(!1);
                                clone[clone.length++] = endNode, $animate.enter(clone, null, jqLite(previousNode)), previousNode = endNode, block.clone = clone, nextBlockMap[block.id] = block, updateScope(block.scope, index, valueIdentifier, value, keyIdentifier, key, collectionLength)
                            });
                            lastBlockMap = nextBlockMap
                        })
                    }
                }
            }
        }], NG_HIDE_CLASS = "ng-hide", NG_HIDE_IN_PROGRESS_CLASS = "ng-hide-animate", ngShowDirective = ["$animate", function ($animate) {
            return {
                restrict: "A", multiElement: !0, link: function (scope, element, attr) {
                    scope.$watch(attr.ngShow, function (value) {
                        $animate[value ? "removeClass" : "addClass"](element, NG_HIDE_CLASS, {tempClasses: NG_HIDE_IN_PROGRESS_CLASS})
                    })
                }
            }
        }], ngHideDirective = ["$animate", function ($animate) {
            return {
                restrict: "A", multiElement: !0, link: function (scope, element, attr) {
                    scope.$watch(attr.ngHide, function (value) {
                        $animate[value ? "addClass" : "removeClass"](element, NG_HIDE_CLASS, {tempClasses: NG_HIDE_IN_PROGRESS_CLASS})
                    })
                }
            }
        }], ngStyleDirective = ngDirective(function (scope, element, attr) {
            scope.$watch(attr.ngStyle, function (newStyles, oldStyles) {
                oldStyles && newStyles !== oldStyles && forEach(oldStyles, function (val, style) {
                    element.css(style, "")
                }), newStyles && element.css(newStyles)
            }, !0)
        }), ngSwitchDirective = ["$animate", function ($animate) {
            return {
                restrict: "EA", require: "ngSwitch", controller: ["$scope", function () {
                    this.cases = {}
                }], link: function (scope, element, attr, ngSwitchController) {
                    var watchExpr = attr.ngSwitch || attr.on, selectedTranscludes = [], selectedElements = [], previousLeaveAnimations = [], selectedScopes = [], spliceFactory = function (array, index) {
                        return function () {
                            array.splice(index, 1)
                        }
                    };
                    scope.$watch(watchExpr, function (value) {
                        var i, ii;
                        for (i = 0, ii = previousLeaveAnimations.length; ii > i; ++i)$animate.cancel(previousLeaveAnimations[i]);
                        for (previousLeaveAnimations.length = 0, i = 0, ii = selectedScopes.length; ii > i; ++i) {
                            var selected = getBlockNodes(selectedElements[i].clone);
                            selectedScopes[i].$destroy();
                            var promise = previousLeaveAnimations[i] = $animate.leave(selected);
                            promise.then(spliceFactory(previousLeaveAnimations, i))
                        }
                        selectedElements.length = 0, selectedScopes.length = 0, (selectedTranscludes = ngSwitchController.cases["!" + value] || ngSwitchController.cases["?"]) && forEach(selectedTranscludes, function (selectedTransclude) {
                            selectedTransclude.transclude(function (caseElement, selectedScope) {
                                selectedScopes.push(selectedScope);
                                var anchor = selectedTransclude.element;
                                caseElement[caseElement.length++] = document.createComment(" end ngSwitchWhen: ");
                                var block = {clone: caseElement};
                                selectedElements.push(block), $animate.enter(caseElement, anchor.parent(), anchor)
                            })
                        })
                    })
                }
            }
        }], ngSwitchWhenDirective = ngDirective({
            transclude: "element",
            priority: 1200,
            require: "^ngSwitch",
            multiElement: !0,
            link: function (scope, element, attrs, ctrl, $transclude) {
                ctrl.cases["!" + attrs.ngSwitchWhen] = ctrl.cases["!" + attrs.ngSwitchWhen] || [], ctrl.cases["!" + attrs.ngSwitchWhen].push({
                    transclude: $transclude,
                    element: element
                })
            }
        }), ngSwitchDefaultDirective = ngDirective({
            transclude: "element",
            priority: 1200,
            require: "^ngSwitch",
            multiElement: !0,
            link: function (scope, element, attr, ctrl, $transclude) {
                ctrl.cases["?"] = ctrl.cases["?"] || [], ctrl.cases["?"].push({
                    transclude: $transclude,
                    element: element
                })
            }
        }), ngTranscludeDirective = ngDirective({
            restrict: "EAC",
            link: function ($scope, $element, $attrs, controller, $transclude) {
                if (!$transclude)throw minErr("ngTransclude")("orphan", "Illegal use of ngTransclude directive in the template! No parent directive that requires a transclusion found. Element: {0}", startingTag($element));
                $transclude(function (clone) {
                    $element.empty(), $element.append(clone)
                })
            }
        }), scriptDirective = ["$templateCache", function ($templateCache) {
            return {
                restrict: "E", terminal: !0, compile: function (element, attr) {
                    if ("text/ng-template" == attr.type) {
                        var templateUrl = attr.id, text = element[0].text;
                        $templateCache.put(templateUrl, text)
                    }
                }
            }
        }], ngOptionsMinErr = minErr("ngOptions"), ngOptionsDirective = valueFn({
            restrict: "A",
            terminal: !0
        }), selectDirective = ["$compile", "$parse", function ($compile, $parse) {
            var NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/, nullModelCtrl = {$setViewValue: noop};
            return {
                restrict: "E",
                require: ["select", "?ngModel"],
                controller: ["$element", "$scope", "$attrs", function ($element, $scope, $attrs) {
                    var nullOption, unknownOption, self = this, optionsMap = {}, ngModelCtrl = nullModelCtrl;
                    self.databound = $attrs.ngModel, self.init = function (ngModelCtrl_, nullOption_, unknownOption_) {
                        ngModelCtrl = ngModelCtrl_, nullOption = nullOption_, unknownOption = unknownOption_
                    }, self.addOption = function (value, element) {
                        assertNotHasOwnProperty(value, '"option value"'), optionsMap[value] = !0, ngModelCtrl.$viewValue == value && ($element.val(value), unknownOption.parent() && unknownOption.remove()), element && element[0].hasAttribute("selected") && (element[0].selected = !0)
                    }, self.removeOption = function (value) {
                        this.hasOption(value) && (delete optionsMap[value], ngModelCtrl.$viewValue === value && this.renderUnknownOption(value))
                    }, self.renderUnknownOption = function (val) {
                        var unknownVal = "? " + hashKey(val) + " ?";
                        unknownOption.val(unknownVal), $element.prepend(unknownOption), $element.val(unknownVal), unknownOption.prop("selected", !0)
                    }, self.hasOption = function (value) {
                        return optionsMap.hasOwnProperty(value)
                    }, $scope.$on("$destroy", function () {
                        self.renderUnknownOption = noop
                    })
                }],
                link: function (scope, element, attr, ctrls) {
                    function setupAsSingle(scope, selectElement, ngModelCtrl, selectCtrl) {
                        ngModelCtrl.$render = function () {
                            var viewValue = ngModelCtrl.$viewValue;
                            selectCtrl.hasOption(viewValue) ? (unknownOption.parent() && unknownOption.remove(), selectElement.val(viewValue), "" === viewValue && emptyOption.prop("selected", !0)) : isUndefined(viewValue) && emptyOption ? selectElement.val("") : selectCtrl.renderUnknownOption(viewValue)
                        }, selectElement.on("change", function () {
                            scope.$apply(function () {
                                unknownOption.parent() && unknownOption.remove(), ngModelCtrl.$setViewValue(selectElement.val())
                            })
                        })
                    }

                    function setupAsMultiple(scope, selectElement, ctrl) {
                        var lastView;
                        ctrl.$render = function () {
                            var items = new HashMap(ctrl.$viewValue);
                            forEach(selectElement.find("option"), function (option) {
                                option.selected = isDefined(items.get(option.value))
                            })
                        }, scope.$watch(function () {
                            equals(lastView, ctrl.$viewValue) || (lastView = shallowCopy(ctrl.$viewValue), ctrl.$render())
                        }), selectElement.on("change", function () {
                            scope.$apply(function () {
                                var array = [];
                                forEach(selectElement.find("option"), function (option) {
                                    option.selected && array.push(option.value)
                                }), ctrl.$setViewValue(array)
                            })
                        })
                    }

                    function setupAsOptions(scope, selectElement, ctrl) {
                        function callExpression(exprFn, key, value) {
                            return locals[valueName] = value, keyName && (locals[keyName] = key), exprFn(scope, locals)
                        }

                        function selectionChanged() {
                            scope.$apply(function () {
                                var viewValue, collection = valuesFn(scope) || [];
                                if (multiple)viewValue = [], forEach(selectElement.val(), function (selectedKey) {
                                    selectedKey = trackFn ? trackKeysCache[selectedKey] : selectedKey, viewValue.push(getViewValue(selectedKey, collection[selectedKey]))
                                }); else {
                                    var selectedKey = trackFn ? trackKeysCache[selectElement.val()] : selectElement.val();
                                    viewValue = getViewValue(selectedKey, collection[selectedKey])
                                }
                                ctrl.$setViewValue(viewValue), render()
                            })
                        }

                        function getViewValue(key, value) {
                            if ("?" === key)return undefined;
                            if ("" === key)return null;
                            var viewValueFn = selectAsFn ? selectAsFn : valueFn;
                            return callExpression(viewValueFn, key, value)
                        }

                        function getLabels() {
                            var toDisplay, values = valuesFn(scope);
                            if (values && isArray(values)) {
                                toDisplay = new Array(values.length);
                                for (var i = 0, ii = values.length; ii > i; i++)toDisplay[i] = callExpression(displayFn, i, values[i]);
                                return toDisplay
                            }
                            if (values) {
                                toDisplay = {};
                                for (var prop in values)values.hasOwnProperty(prop) && (toDisplay[prop] = callExpression(displayFn, prop, values[prop]))
                            }
                            return toDisplay
                        }

                        function createIsSelectedFn(viewValue) {
                            var selectedSet;
                            if (multiple)if (trackFn && isArray(viewValue)) {
                                selectedSet = new HashMap([]);
                                for (var trackIndex = 0; trackIndex < viewValue.length; trackIndex++)selectedSet.put(callExpression(trackFn, null, viewValue[trackIndex]), !0)
                            } else selectedSet = new HashMap(viewValue); else trackFn && (viewValue = callExpression(trackFn, null, viewValue));
                            return function (key, value) {
                                var compareValueFn;
                                return compareValueFn = trackFn ? trackFn : selectAsFn ? selectAsFn : valueFn, multiple ? isDefined(selectedSet.remove(callExpression(compareValueFn, key, value))) : viewValue === callExpression(compareValueFn, key, value)
                            }
                        }

                        function scheduleRendering() {
                            renderScheduled || (scope.$$postDigest(render), renderScheduled = !0)
                        }

                        function updateLabelMap(labelMap, label, added) {
                            labelMap[label] = labelMap[label] || 0, labelMap[label] += added ? 1 : -1
                        }

                        function render() {
                            renderScheduled = !1;
                            var optionGroupName, optionGroup, option, existingParent, existingOptions, existingOption, key, value, groupLength, length, groupIndex, index, selected, lastElement, element, label, optionId, optionGroups = {"": []}, optionGroupNames = [""], viewValue = ctrl.$viewValue, values = valuesFn(scope) || [], keys = keyName ? sortedKeys(values) : values, labelMap = {}, isSelected = createIsSelectedFn(viewValue), anySelected = !1;
                            for (trackKeysCache = {}, index = 0; length = keys.length, length > index; index++)key = index, keyName && (key = keys[index], "$" === key.charAt(0)) || (value = values[key], optionGroupName = callExpression(groupByFn, key, value) || "", (optionGroup = optionGroups[optionGroupName]) || (optionGroup = optionGroups[optionGroupName] = [], optionGroupNames.push(optionGroupName)), selected = isSelected(key, value), anySelected = anySelected || selected, label = callExpression(displayFn, key, value), label = isDefined(label) ? label : "", optionId = trackFn ? trackFn(scope, locals) : keyName ? keys[index] : index, trackFn && (trackKeysCache[optionId] = key), optionGroup.push({
                                id: optionId,
                                label: label,
                                selected: selected
                            }));
                            for (multiple || (nullOption || null === viewValue ? optionGroups[""].unshift({
                                id: "",
                                label: "",
                                selected: !anySelected
                            }) : anySelected || optionGroups[""].unshift({
                                id: "?",
                                label: "",
                                selected: !0
                            })), groupIndex = 0, groupLength = optionGroupNames.length; groupLength > groupIndex; groupIndex++) {
                                for (optionGroupName = optionGroupNames[groupIndex], optionGroup = optionGroups[optionGroupName], optionGroupsCache.length <= groupIndex ? (existingParent = {
                                    element: optGroupTemplate.clone().attr("label", optionGroupName),
                                    label: optionGroup.label
                                }, existingOptions = [existingParent], optionGroupsCache.push(existingOptions), selectElement.append(existingParent.element)) : (existingOptions = optionGroupsCache[groupIndex], existingParent = existingOptions[0], existingParent.label != optionGroupName && existingParent.element.attr("label", existingParent.label = optionGroupName)), lastElement = null, index = 0, length = optionGroup.length; length > index; index++)option = optionGroup[index], (existingOption = existingOptions[index + 1]) ? (lastElement = existingOption.element, existingOption.label !== option.label && (updateLabelMap(labelMap, existingOption.label, !1), updateLabelMap(labelMap, option.label, !0), lastElement.text(existingOption.label = option.label), lastElement.prop("label", existingOption.label)), existingOption.id !== option.id && lastElement.val(existingOption.id = option.id), lastElement[0].selected !== option.selected && (lastElement.prop("selected", existingOption.selected = option.selected), msie && lastElement.prop("selected", existingOption.selected))) : ("" === option.id && nullOption ? element = nullOption : (element = optionTemplate.clone()).val(option.id).prop("selected", option.selected).attr("selected", option.selected).prop("label", option.label).text(option.label), existingOptions.push(existingOption = {
                                    element: element,
                                    label: option.label,
                                    id: option.id,
                                    selected: option.selected
                                }), updateLabelMap(labelMap, option.label, !0), lastElement ? lastElement.after(element) : existingParent.element.append(element), lastElement = element);
                                for (index++; existingOptions.length > index;)option = existingOptions.pop(), updateLabelMap(labelMap, option.label, !1), option.element.remove()
                            }
                            for (; optionGroupsCache.length > groupIndex;) {
                                for (optionGroup = optionGroupsCache.pop(), index = 1; index < optionGroup.length; ++index)updateLabelMap(labelMap, optionGroup[index].label, !1);
                                optionGroup[0].element.remove()
                            }
                            forEach(labelMap, function (count, label) {
                                count > 0 ? selectCtrl.addOption(label) : 0 > count && selectCtrl.removeOption(label)
                            })
                        }

                        var match;
                        if (!(match = optionsExp.match(NG_OPTIONS_REGEXP)))throw ngOptionsMinErr("iexp", "Expected expression in form of '_select_ (as _label_)? for (_key_,)?_value_ in _collection_' but got '{0}'. Element: {1}", optionsExp, startingTag(selectElement));
                        var displayFn = $parse(match[2] || match[1]), valueName = match[4] || match[6], selectAs = / as /.test(match[0]) && match[1], selectAsFn = selectAs ? $parse(selectAs) : null, keyName = match[5], groupByFn = $parse(match[3] || ""), valueFn = $parse(match[2] ? match[1] : valueName), valuesFn = $parse(match[7]), track = match[8], trackFn = track ? $parse(match[8]) : null, trackKeysCache = {}, optionGroupsCache = [[{
                            element: selectElement,
                            label: ""
                        }]], locals = {};
                        nullOption && ($compile(nullOption)(scope), nullOption.removeClass("ng-scope"), nullOption.remove()), selectElement.empty(), selectElement.on("change", selectionChanged), ctrl.$render = render, scope.$watchCollection(valuesFn, scheduleRendering), scope.$watchCollection(getLabels, scheduleRendering), multiple && scope.$watchCollection(function () {
                            return ctrl.$modelValue
                        }, scheduleRendering)
                    }

                    if (ctrls[1]) {
                        for (var emptyOption, selectCtrl = ctrls[0], ngModelCtrl = ctrls[1], multiple = attr.multiple, optionsExp = attr.ngOptions, nullOption = !1, renderScheduled = !1, optionTemplate = jqLite(document.createElement("option")), optGroupTemplate = jqLite(document.createElement("optgroup")), unknownOption = optionTemplate.clone(), i = 0, children = element.children(), ii = children.length; ii > i; i++)if ("" === children[i].value) {
                            emptyOption = nullOption = children.eq(i);
                            break
                        }
                        selectCtrl.init(ngModelCtrl, nullOption, unknownOption), multiple && (ngModelCtrl.$isEmpty = function (value) {
                            return !value || 0 === value.length
                        }), optionsExp ? setupAsOptions(scope, element, ngModelCtrl) : multiple ? setupAsMultiple(scope, element, ngModelCtrl) : setupAsSingle(scope, element, ngModelCtrl, selectCtrl)
                    }
                }
            }
        }], optionDirective = ["$interpolate", function ($interpolate) {
            var nullSelectCtrl = {addOption: noop, removeOption: noop};
            return {
                restrict: "E", priority: 100, compile: function (element, attr) {
                    if (isUndefined(attr.value)) {
                        var interpolateFn = $interpolate(element.text(), !0);
                        interpolateFn || attr.$set("value", element.text())
                    }
                    return function (scope, element, attr) {
                        var selectCtrlName = "$selectController", parent = element.parent(), selectCtrl = parent.data(selectCtrlName) || parent.parent().data(selectCtrlName);
                        selectCtrl && selectCtrl.databound || (selectCtrl = nullSelectCtrl), interpolateFn ? scope.$watch(interpolateFn, function (newVal, oldVal) {
                            attr.$set("value", newVal), oldVal !== newVal && selectCtrl.removeOption(oldVal), selectCtrl.addOption(newVal, element)
                        }) : selectCtrl.addOption(attr.value, element), element.on("$destroy", function () {
                            selectCtrl.removeOption(attr.value)
                        })
                    }
                }
            }
        }], styleDirective = valueFn({restrict: "E", terminal: !1});
        return window.angular.bootstrap ? void console.log("WARNING: Tried to load angular more than once.") : (bindJQuery(), publishExternalAPI(angular), void jqLite(document).ready(function () {
            angularInit(document, bootstrap)
        }))
    }(window, document), !window.angular.$$csp() && window.angular.element(document).find("head").prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide:not(.ng-hide-animate){display:none !important;}ng\\:form{display:block;}</style>'), define("angular", function (global) {
        return function () {
            var ret;
            return ret || global.angular
        }
    }(this)), function (window, angular) {
        function $RouteProvider() {
            function inherit(parent, extra) {
                return angular.extend(Object.create(parent), extra)
            }

            function pathRegExp(path, opts) {
                var insensitive = opts.caseInsensitiveMatch, ret = {
                    originalPath: path,
                    regexp: path
                }, keys = ret.keys = [];
                return path = path.replace(/([().])/g, "\\$1").replace(/(\/)?:(\w+)([\?\*])?/g, function (_, slash, key, option) {
                    var optional = "?" === option ? option : null, star = "*" === option ? option : null;
                    return keys.push({
                        name: key,
                        optional: !!optional
                    }), slash = slash || "", "" + (optional ? "" : slash) + "(?:" + (optional ? slash : "") + (star && "(.+?)" || "([^/]+)") + (optional || "") + ")" + (optional || "")
                }).replace(/([\/$\*])/g, "\\$1"), ret.regexp = new RegExp("^" + path + "$", insensitive ? "i" : ""), ret
            }

            var routes = {};
            this.when = function (path, route) {
                var routeCopy = angular.copy(route);
                if (angular.isUndefined(routeCopy.reloadOnSearch) && (routeCopy.reloadOnSearch = !0), angular.isUndefined(routeCopy.caseInsensitiveMatch) && (routeCopy.caseInsensitiveMatch = this.caseInsensitiveMatch), routes[path] = angular.extend(routeCopy, path && pathRegExp(path, routeCopy)), path) {
                    var redirectPath = "/" == path[path.length - 1] ? path.substr(0, path.length - 1) : path + "/";
                    routes[redirectPath] = angular.extend({redirectTo: path}, pathRegExp(redirectPath, routeCopy))
                }
                return this
            }, this.caseInsensitiveMatch = !1, this.otherwise = function (params) {
                return "string" == typeof params && (params = {redirectTo: params}), this.when(null, params), this
            }, this.$get = ["$rootScope", "$location", "$routeParams", "$q", "$injector", "$templateRequest", "$sce", function ($rootScope, $location, $routeParams, $q, $injector, $templateRequest, $sce) {
                function switchRouteMatcher(on, route) {
                    var keys = route.keys, params = {};
                    if (!route.regexp)return null;
                    var m = route.regexp.exec(on);
                    if (!m)return null;
                    for (var i = 1, len = m.length; len > i; ++i) {
                        var key = keys[i - 1], val = m[i];
                        key && val && (params[key.name] = val)
                    }
                    return params
                }

                function prepareRoute($locationEvent) {
                    var lastRoute = $route.current;
                    preparedRoute = parseRoute(), preparedRouteIsUpdateOnly = preparedRoute && lastRoute && preparedRoute.$$route === lastRoute.$$route && angular.equals(preparedRoute.pathParams, lastRoute.pathParams) && !preparedRoute.reloadOnSearch && !forceReload, preparedRouteIsUpdateOnly || !lastRoute && !preparedRoute || $rootScope.$broadcast("$routeChangeStart", preparedRoute, lastRoute).defaultPrevented && $locationEvent && $locationEvent.preventDefault()
                }

                function commitRoute() {
                    var lastRoute = $route.current, nextRoute = preparedRoute;
                    preparedRouteIsUpdateOnly ? (lastRoute.params = nextRoute.params, angular.copy(lastRoute.params, $routeParams), $rootScope.$broadcast("$routeUpdate", lastRoute)) : (nextRoute || lastRoute) && (forceReload = !1, $route.current = nextRoute, nextRoute && nextRoute.redirectTo && (angular.isString(nextRoute.redirectTo) ? $location.path(interpolate(nextRoute.redirectTo, nextRoute.params)).search(nextRoute.params).replace() : $location.url(nextRoute.redirectTo(nextRoute.pathParams, $location.path(), $location.search())).replace()), $q.when(nextRoute).then(function () {
                        if (nextRoute) {
                            var template, templateUrl, locals = angular.extend({}, nextRoute.resolve);
                            return angular.forEach(locals, function (value, key) {
                                locals[key] = angular.isString(value) ? $injector.get(value) : $injector.invoke(value, null, null, key)
                            }), angular.isDefined(template = nextRoute.template) ? angular.isFunction(template) && (template = template(nextRoute.params)) : angular.isDefined(templateUrl = nextRoute.templateUrl) && (angular.isFunction(templateUrl) && (templateUrl = templateUrl(nextRoute.params)), templateUrl = $sce.getTrustedResourceUrl(templateUrl), angular.isDefined(templateUrl) && (nextRoute.loadedTemplateUrl = templateUrl, template = $templateRequest(templateUrl))), angular.isDefined(template) && (locals.$template = template), $q.all(locals)
                        }
                    }).then(function (locals) {
                        nextRoute == $route.current && (nextRoute && (nextRoute.locals = locals, angular.copy(nextRoute.params, $routeParams)), $rootScope.$broadcast("$routeChangeSuccess", nextRoute, lastRoute))
                    }, function (error) {
                        nextRoute == $route.current && $rootScope.$broadcast("$routeChangeError", nextRoute, lastRoute, error)
                    }))
                }

                function parseRoute() {
                    var params, match;
                    return angular.forEach(routes, function (route) {
                        !match && (params = switchRouteMatcher($location.path(), route)) && (match = inherit(route, {
                            params: angular.extend({}, $location.search(), params),
                            pathParams: params
                        }), match.$$route = route)
                    }), match || routes[null] && inherit(routes[null], {params: {}, pathParams: {}})
                }

                function interpolate(string, params) {
                    var result = [];
                    return angular.forEach((string || "").split(":"), function (segment, i) {
                        if (0 === i)result.push(segment); else {
                            var segmentMatch = segment.match(/(\w+)(?:[?*])?(.*)/), key = segmentMatch[1];
                            result.push(params[key]), result.push(segmentMatch[2] || ""), delete params[key]
                        }
                    }), result.join("")
                }

                var preparedRoute, preparedRouteIsUpdateOnly, forceReload = !1, $route = {
                    routes: routes,
                    reload: function () {
                        forceReload = !0, $rootScope.$evalAsync(function () {
                            prepareRoute(), commitRoute()
                        })
                    },
                    updateParams: function (newParams) {
                        if (!this.current || !this.current.$$route)throw $routeMinErr("norout", "Tried updating route when with no current route");
                        var searchParams = {}, self = this;
                        angular.forEach(Object.keys(newParams), function (key) {
                            self.current.pathParams[key] || (searchParams[key] = newParams[key])
                        }), newParams = angular.extend({}, this.current.params, newParams), $location.path(interpolate(this.current.$$route.originalPath, newParams)), $location.search(angular.extend({}, $location.search(), searchParams))
                    }
                };
                return $rootScope.$on("$locationChangeStart", prepareRoute), $rootScope.$on("$locationChangeSuccess", commitRoute), $route
            }]
        }

        function $RouteParamsProvider() {
            this.$get = function () {
                return {}
            }
        }

        function ngViewFactory($route, $anchorScroll, $animate) {
            return {
                restrict: "ECA",
                terminal: !0,
                priority: 400,
                transclude: "element",
                link: function (scope, $element, attr, ctrl, $transclude) {
                    function cleanupLastView() {
                        previousLeaveAnimation && ($animate.cancel(previousLeaveAnimation), previousLeaveAnimation = null), currentScope && (currentScope.$destroy(), currentScope = null), currentElement && (previousLeaveAnimation = $animate.leave(currentElement), previousLeaveAnimation.then(function () {
                            previousLeaveAnimation = null
                        }), currentElement = null)
                    }

                    function update() {
                        var locals = $route.current && $route.current.locals, template = locals && locals.$template;
                        if (angular.isDefined(template)) {
                            var newScope = scope.$new(), current = $route.current, clone = $transclude(newScope, function (clone) {
                                $animate.enter(clone, null, currentElement || $element).then(function () {
                                    !angular.isDefined(autoScrollExp) || autoScrollExp && !scope.$eval(autoScrollExp) || $anchorScroll()
                                }), cleanupLastView()
                            });
                            currentElement = clone, currentScope = current.scope = newScope, currentScope.$emit("$viewContentLoaded"), currentScope.$eval(onloadExp)
                        } else cleanupLastView()
                    }

                    var currentScope, currentElement, previousLeaveAnimation, autoScrollExp = attr.autoscroll, onloadExp = attr.onload || "";
                    scope.$on("$routeChangeSuccess", update), update()
                }
            }
        }

        function ngViewFillContentFactory($compile, $controller, $route) {
            return {
                restrict: "ECA", priority: -400, link: function (scope, $element) {
                    var current = $route.current, locals = current.locals;
                    $element.html(locals.$template);
                    var link = $compile($element.contents());
                    if (current.controller) {
                        locals.$scope = scope;
                        var controller = $controller(current.controller, locals);
                        current.controllerAs && (scope[current.controllerAs] = controller), $element.data("$ngControllerController", controller), $element.children().data("$ngControllerController", controller)
                    }
                    link(scope)
                }
            }
        }

        var ngRouteModule = angular.module("ngRoute", ["ng"]).provider("$route", $RouteProvider), $routeMinErr = angular.$$minErr("ngRoute");
        ngRouteModule.provider("$routeParams", $RouteParamsProvider), ngRouteModule.directive("ngView", ngViewFactory), ngRouteModule.directive("ngView", ngViewFillContentFactory), ngViewFactory.$inject = ["$route", "$anchorScroll", "$animate"], ngViewFillContentFactory.$inject = ["$compile", "$controller", "$route"]
    }(window, window.angular), define("angular-route", ["angular"], function () {
    }), function (window, angular) {
        function makeSwipeDirective(directiveName, direction, eventName) {
            ngTouch.directive(directiveName, ["$parse", "$swipe", function ($parse, $swipe) {
                var MAX_VERTICAL_DISTANCE = 75, MAX_VERTICAL_RATIO = .3, MIN_HORIZONTAL_DISTANCE = 30;
                return function (scope, element, attr) {
                    function validSwipe(coords) {
                        if (!startCoords)return !1;
                        var deltaY = Math.abs(coords.y - startCoords.y), deltaX = (coords.x - startCoords.x) * direction;
                        return valid && MAX_VERTICAL_DISTANCE > deltaY && deltaX > 0 && deltaX > MIN_HORIZONTAL_DISTANCE && MAX_VERTICAL_RATIO > deltaY / deltaX
                    }

                    var startCoords, valid, swipeHandler = $parse(attr[directiveName]), pointerTypes = ["touch"];
                    angular.isDefined(attr.ngSwipeDisableMouse) || pointerTypes.push("mouse"), $swipe.bind(element, {
                        start: function (coords) {
                            startCoords = coords, valid = !0
                        }, cancel: function () {
                            valid = !1
                        }, end: function (coords, event) {
                            validSwipe(coords) && scope.$apply(function () {
                                element.triggerHandler(eventName), swipeHandler(scope, {$event: event})
                            })
                        }
                    }, pointerTypes)
                }
            }])
        }

        var ngTouch = angular.module("ngTouch", []);
        ngTouch.factory("$swipe", [function () {
            function getCoordinates(event) {
                var touches = event.touches && event.touches.length ? event.touches : [event], e = event.changedTouches && event.changedTouches[0] || event.originalEvent && event.originalEvent.changedTouches && event.originalEvent.changedTouches[0] || touches[0].originalEvent || touches[0];
                return {x: e.clientX, y: e.clientY}
            }

            function getEvents(pointerTypes, eventType) {
                var res = [];
                return angular.forEach(pointerTypes, function (pointerType) {
                    var eventName = POINTER_EVENTS[pointerType][eventType];
                    eventName && res.push(eventName)
                }), res.join(" ")
            }

            var MOVE_BUFFER_RADIUS = 10, POINTER_EVENTS = {
                mouse: {
                    start: "mousedown",
                    move: "mousemove",
                    end: "mouseup"
                }, touch: {start: "touchstart", move: "touchmove", end: "touchend", cancel: "touchcancel"}
            };
            return {
                bind: function (element, eventHandlers, pointerTypes) {
                    var totalX, totalY, startCoords, lastPos, active = !1;
                    pointerTypes = pointerTypes || ["mouse", "touch"], element.on(getEvents(pointerTypes, "start"), function (event) {
                        startCoords = getCoordinates(event), active = !0, totalX = 0, totalY = 0, lastPos = startCoords, eventHandlers.start && eventHandlers.start(startCoords, event)
                    });
                    var events = getEvents(pointerTypes, "cancel");
                    events && element.on(events, function (event) {
                        active = !1, eventHandlers.cancel && eventHandlers.cancel(event)
                    }), element.on(getEvents(pointerTypes, "move"), function (event) {
                        if (active && startCoords) {
                            var coords = getCoordinates(event);
                            if (totalX += Math.abs(coords.x - lastPos.x), totalY += Math.abs(coords.y - lastPos.y), lastPos = coords, !(MOVE_BUFFER_RADIUS > totalX && MOVE_BUFFER_RADIUS > totalY))return totalY > totalX ? (active = !1, void(eventHandlers.cancel && eventHandlers.cancel(event))) : (event.preventDefault(), void(eventHandlers.move && eventHandlers.move(coords, event)))
                        }
                    }), element.on(getEvents(pointerTypes, "end"), function (event) {
                        active && (active = !1, eventHandlers.end && eventHandlers.end(getCoordinates(event), event))
                    })
                }
            }
        }]), ngTouch.config(["$provide", function ($provide) {
            $provide.decorator("ngClickDirective", ["$delegate", function ($delegate) {
                return $delegate.shift(), $delegate
            }])
        }]), ngTouch.directive("ngClick", ["$parse", "$timeout", "$rootElement", function ($parse, $timeout, $rootElement) {
            function hit(x1, y1, x2, y2) {
                return Math.abs(x1 - x2) < CLICKBUSTER_THRESHOLD && Math.abs(y1 - y2) < CLICKBUSTER_THRESHOLD
            }

            function checkAllowableRegions(touchCoordinates, x, y) {
                for (var i = 0; i < touchCoordinates.length; i += 2)if (hit(touchCoordinates[i], touchCoordinates[i + 1], x, y))return touchCoordinates.splice(i, i + 2), !0;
                return !1
            }

            function onClick(event) {
                if (!(Date.now() - lastPreventedTime > PREVENT_DURATION)) {
                    var touches = event.touches && event.touches.length ? event.touches : [event], x = touches[0].clientX, y = touches[0].clientY;
                    1 > x && 1 > y || lastLabelClickCoordinates && lastLabelClickCoordinates[0] === x && lastLabelClickCoordinates[1] === y || (lastLabelClickCoordinates && (lastLabelClickCoordinates = null), "label" === event.target.tagName.toLowerCase() && (lastLabelClickCoordinates = [x, y]), checkAllowableRegions(touchCoordinates, x, y) || (event.stopPropagation(), event.preventDefault(), event.target && event.target.blur()))
                }
            }

            function onTouchStart(event) {
                var touches = event.touches && event.touches.length ? event.touches : [event], x = touches[0].clientX, y = touches[0].clientY;
                touchCoordinates.push(x, y), $timeout(function () {
                    for (var i = 0; i < touchCoordinates.length; i += 2)if (touchCoordinates[i] == x && touchCoordinates[i + 1] == y)return void touchCoordinates.splice(i, i + 2)
                }, PREVENT_DURATION, !1)
            }

            function preventGhostClick(x, y) {
                touchCoordinates || ($rootElement[0].addEventListener("click", onClick, !0), $rootElement[0].addEventListener("touchstart", onTouchStart, !0), touchCoordinates = []), lastPreventedTime = Date.now(), checkAllowableRegions(touchCoordinates, x, y)
            }

            var lastPreventedTime, touchCoordinates, lastLabelClickCoordinates, TAP_DURATION = 750, MOVE_TOLERANCE = 12, PREVENT_DURATION = 2500, CLICKBUSTER_THRESHOLD = 25, ACTIVE_CLASS_NAME = "ng-click-active";
            return function (scope, element, attr) {
                function resetState() {
                    tapping = !1, element.removeClass(ACTIVE_CLASS_NAME)
                }

                var tapElement, startTime, touchStartX, touchStartY, clickHandler = $parse(attr.ngClick), tapping = !1;
                element.on("touchstart", function (event) {
                    tapping = !0, tapElement = event.target ? event.target : event.srcElement, 3 == tapElement.nodeType && (tapElement = tapElement.parentNode), element.addClass(ACTIVE_CLASS_NAME), startTime = Date.now();
                    var touches = event.touches && event.touches.length ? event.touches : [event], e = touches[0].originalEvent || touches[0];
                    touchStartX = e.clientX, touchStartY = e.clientY
                }), element.on("touchmove", function () {
                    resetState()
                }), element.on("touchcancel", function () {
                    resetState()
                }), element.on("touchend", function (event) {
                    var diff = Date.now() - startTime, touches = event.changedTouches && event.changedTouches.length ? event.changedTouches : event.touches && event.touches.length ? event.touches : [event], e = touches[0].originalEvent || touches[0], x = e.clientX, y = e.clientY, dist = Math.sqrt(Math.pow(x - touchStartX, 2) + Math.pow(y - touchStartY, 2));
                    tapping && TAP_DURATION > diff && MOVE_TOLERANCE > dist && (preventGhostClick(x, y), tapElement && tapElement.blur(), angular.isDefined(attr.disabled) && attr.disabled !== !1 || element.triggerHandler("click", [event])), resetState()
                }), element.onclick = function () {
                }, element.on("click", function (event, touchend) {
                    scope.$apply(function () {
                        clickHandler(scope, {$event: touchend || event})
                    })
                }), element.on("mousedown", function () {
                    element.addClass(ACTIVE_CLASS_NAME)
                }), element.on("mousemove mouseup", function () {
                    element.removeClass(ACTIVE_CLASS_NAME)
                })
            }
        }]), makeSwipeDirective("ngSwipeLeft", -1, "swipeleft"), makeSwipeDirective("ngSwipeRight", 1, "swiperight")
    }(window, window.angular), define("angular-touch", ["angular"], function () {
    }), function (window, angular, undefined) {
        angular.module("ngAnimate", ["ng"]).directive("ngAnimateChildren", function () {
            var NG_ANIMATE_CHILDREN = "$$ngAnimateChildren";
            return function (scope, element, attrs) {
                var val = attrs.ngAnimateChildren;
                angular.isString(val) && 0 === val.length ? element.data(NG_ANIMATE_CHILDREN, !0) : scope.$watch(val, function (value) {
                    element.data(NG_ANIMATE_CHILDREN, !!value)
                })
            }
        }).factory("$$animateReflow", ["$$rAF", "$document", function ($$rAF, $document) {
            var bod = $document[0].body;
            return function (fn) {
                return $$rAF(function () {
                    bod.offsetWidth + 1;
                    fn()
                })
            }
        }]).config(["$provide", "$animateProvider", function ($provide, $animateProvider) {
            function extractElementNode(element) {
                for (var i = 0; i < element.length; i++) {
                    var elm = element[i];
                    if (elm.nodeType == ELEMENT_NODE)return elm
                }
            }

            function prepareElement(element) {
                return element && angular.element(element)
            }

            function stripCommentsFromElement(element) {
                return angular.element(extractElementNode(element))
            }

            function isMatchingElement(elm1, elm2) {
                return extractElementNode(elm1) == extractElementNode(elm2)
            }

            var $$jqLite, noop = angular.noop, forEach = angular.forEach, selectors = $animateProvider.$$selectors, isArray = angular.isArray, isString = angular.isString, isObject = angular.isObject, ELEMENT_NODE = 1, NG_ANIMATE_STATE = "$$ngAnimateState", NG_ANIMATE_CHILDREN = "$$ngAnimateChildren", NG_ANIMATE_CLASS_NAME = "ng-animate", rootAnimateState = {running: !0};
            $provide.decorator("$animate", ["$delegate", "$$q", "$injector", "$sniffer", "$rootElement", "$$asyncCallback", "$rootScope", "$document", "$templateRequest", "$$jqLite", function ($delegate, $$q, $injector, $sniffer, $rootElement, $$asyncCallback, $rootScope, $document, $templateRequest, $$$jqLite) {
                function classBasedAnimationsBlocked(element, setter) {
                    var data = element.data(NG_ANIMATE_STATE) || {};
                    return setter && (data.running = !0, data.structural = !0, element.data(NG_ANIMATE_STATE, data)), data.disabled || data.running && data.structural
                }

                function runAnimationPostDigest(fn) {
                    var cancelFn, defer = $$q.defer();
                    return defer.promise.$$cancelFn = function () {
                        cancelFn && cancelFn()
                    }, $rootScope.$$postDigest(function () {
                        cancelFn = fn(function () {
                            defer.resolve()
                        })
                    }), defer.promise
                }

                function parseAnimateOptions(options) {
                    return isObject(options) ? (options.tempClasses && isString(options.tempClasses) && (options.tempClasses = options.tempClasses.split(/\s+/)), options) : void 0
                }

                function resolveElementClasses(element, cache, runningAnimations) {
                    runningAnimations = runningAnimations || {};
                    var lookup = {};
                    forEach(runningAnimations, function (data, selector) {
                        forEach(selector.split(" "), function (s) {
                            lookup[s] = data
                        })
                    });
                    var hasClasses = Object.create(null);
                    forEach((element.attr("class") || "").split(/\s+/), function (className) {
                        hasClasses[className] = !0
                    });
                    var toAdd = [], toRemove = [];
                    return forEach(cache && cache.classes || [], function (status, className) {
                        var hasClass = hasClasses[className], matchingAnimation = lookup[className] || {};
                        status === !1 ? (hasClass || "addClass" == matchingAnimation.event) && toRemove.push(className) : status === !0 && (hasClass && "removeClass" != matchingAnimation.event || toAdd.push(className))
                    }), toAdd.length + toRemove.length > 0 && [toAdd.join(" "), toRemove.join(" ")]
                }

                function lookup(name) {
                    if (name) {
                        var matches = [], flagMap = {}, classes = name.substr(1).split(".");
                        ($sniffer.transitions || $sniffer.animations) && matches.push($injector.get(selectors[""]));
                        for (var i = 0; i < classes.length; i++) {
                            var klass = classes[i], selectorFactoryName = selectors[klass];
                            selectorFactoryName && !flagMap[klass] && (matches.push($injector.get(selectorFactoryName)), flagMap[klass] = !0)
                        }
                        return matches
                    }
                }

                function animationRunner(element, animationEvent, className, options) {
                    function registerAnimation(animationFactory, event) {
                        var afterFn = animationFactory[event], beforeFn = animationFactory["before" + event.charAt(0).toUpperCase() + event.substr(1)];
                        return afterFn || beforeFn ? ("leave" == event && (beforeFn = afterFn, afterFn = null), after.push({
                            event: event,
                            fn: afterFn
                        }), before.push({event: event, fn: beforeFn}), !0) : void 0
                    }

                    function run(fns, cancellations, allCompleteFn) {
                        function afterAnimationComplete(index) {
                            if (cancellations) {
                                if ((cancellations[index] || noop)(), ++count < animations.length)return;
                                cancellations = null
                            }
                            allCompleteFn()
                        }

                        var animations = [];
                        forEach(fns, function (animation) {
                            animation.fn && animations.push(animation)
                        });
                        var count = 0;
                        forEach(animations, function (animation, index) {
                            var progress = function () {
                                afterAnimationComplete(index)
                            };
                            switch (animation.event) {
                                case"setClass":
                                    cancellations.push(animation.fn(element, classNameAdd, classNameRemove, progress, options));
                                    break;
                                case"animate":
                                    cancellations.push(animation.fn(element, className, options.from, options.to, progress));
                                    break;
                                case"addClass":
                                    cancellations.push(animation.fn(element, classNameAdd || className, progress, options));
                                    break;
                                case"removeClass":
                                    cancellations.push(animation.fn(element, classNameRemove || className, progress, options));
                                    break;
                                default:
                                    cancellations.push(animation.fn(element, progress, options))
                            }
                        }), cancellations && 0 === cancellations.length && allCompleteFn()
                    }

                    var node = element[0];
                    if (node) {
                        options && (options.to = options.to || {}, options.from = options.from || {});
                        var classNameAdd, classNameRemove;
                        isArray(className) && (classNameAdd = className[0], classNameRemove = className[1], classNameAdd ? classNameRemove ? className = classNameAdd + " " + classNameRemove : (className = classNameAdd, animationEvent = "addClass") : (className = classNameRemove, animationEvent = "removeClass"));
                        var isSetClassOperation = "setClass" == animationEvent, isClassBased = isSetClassOperation || "addClass" == animationEvent || "removeClass" == animationEvent || "animate" == animationEvent, currentClassName = element.attr("class"), classes = currentClassName + " " + className;
                        if (isAnimatableClassName(classes)) {
                            var beforeComplete = noop, beforeCancel = [], before = [], afterComplete = noop, afterCancel = [], after = [], animationLookup = (" " + classes).replace(/\s+/g, ".");
                            return forEach(lookup(animationLookup), function (animationFactory) {
                                var created = registerAnimation(animationFactory, animationEvent);
                                !created && isSetClassOperation && (registerAnimation(animationFactory, "addClass"), registerAnimation(animationFactory, "removeClass"))
                            }), {
                                node: node,
                                event: animationEvent,
                                className: className,
                                isClassBased: isClassBased,
                                isSetClassOperation: isSetClassOperation,
                                applyStyles: function () {
                                    options && element.css(angular.extend(options.from || {}, options.to || {}))
                                },
                                before: function (allCompleteFn) {
                                    beforeComplete = allCompleteFn, run(before, beforeCancel, function () {
                                        beforeComplete = noop, allCompleteFn()
                                    })
                                },
                                after: function (allCompleteFn) {
                                    afterComplete = allCompleteFn, run(after, afterCancel, function () {
                                        afterComplete = noop, allCompleteFn()
                                    })
                                },
                                cancel: function () {
                                    beforeCancel && (forEach(beforeCancel, function (cancelFn) {
                                        (cancelFn || noop)(!0)
                                    }), beforeComplete(!0)), afterCancel && (forEach(afterCancel, function (cancelFn) {
                                        (cancelFn || noop)(!0)
                                    }), afterComplete(!0))
                                }
                            }
                        }
                    }
                }

                function performAnimation(animationEvent, className, element, parentElement, afterElement, domOperation, options, doneCallback) {
                    function fireDOMCallback(animationPhase) {
                        var eventName = "$animate:" + animationPhase;
                        elementEvents && elementEvents[eventName] && elementEvents[eventName].length > 0 && $$asyncCallback(function () {
                            element.triggerHandler(eventName, {event: animationEvent, className: className})
                        })
                    }

                    function fireBeforeCallbackAsync() {
                        fireDOMCallback("before")
                    }

                    function fireAfterCallbackAsync() {
                        fireDOMCallback("after")
                    }

                    function fireDoneCallbackAsync() {
                        fireDOMCallback("close"), doneCallback()
                    }

                    function fireDOMOperation() {
                        fireDOMOperation.hasBeenRun || (fireDOMOperation.hasBeenRun = !0, domOperation())
                    }

                    function closeAnimation() {
                        if (!closeAnimation.hasBeenRun) {
                            runner && runner.applyStyles(), closeAnimation.hasBeenRun = !0, options && options.tempClasses && forEach(options.tempClasses, function (className) {
                                $$jqLite.removeClass(element, className)
                            });
                            var data = element.data(NG_ANIMATE_STATE);
                            data && (runner && runner.isClassBased ? cleanup(element, className) : ($$asyncCallback(function () {
                                var data = element.data(NG_ANIMATE_STATE) || {};
                                localAnimationCount == data.index && cleanup(element, className, animationEvent)
                            }), element.data(NG_ANIMATE_STATE, data))), fireDoneCallbackAsync()
                        }
                    }

                    var noopCancel = noop, runner = animationRunner(element, animationEvent, className, options);
                    if (!runner)return fireDOMOperation(), fireBeforeCallbackAsync(), fireAfterCallbackAsync(), closeAnimation(), noopCancel;
                    animationEvent = runner.event, className = runner.className;
                    var elementEvents = angular.element._data(runner.node);
                    if (elementEvents = elementEvents && elementEvents.events, parentElement || (parentElement = afterElement ? afterElement.parent() : element.parent()), animationsDisabled(element, parentElement))return fireDOMOperation(), fireBeforeCallbackAsync(), fireAfterCallbackAsync(), closeAnimation(), noopCancel;
                    var ngAnimateState = element.data(NG_ANIMATE_STATE) || {}, runningAnimations = ngAnimateState.active || {}, totalActiveAnimations = ngAnimateState.totalActive || 0, lastAnimation = ngAnimateState.last, skipAnimation = !1;
                    if (totalActiveAnimations > 0) {
                        var animationsToCancel = [];
                        if (runner.isClassBased) {
                            if ("setClass" == lastAnimation.event)animationsToCancel.push(lastAnimation), cleanup(element, className); else if (runningAnimations[className]) {
                                var current = runningAnimations[className];
                                current.event == animationEvent ? skipAnimation = !0 : (animationsToCancel.push(current), cleanup(element, className))
                            }
                        } else if ("leave" == animationEvent && runningAnimations["ng-leave"])skipAnimation = !0; else {
                            for (var klass in runningAnimations)animationsToCancel.push(runningAnimations[klass]);
                            ngAnimateState = {}, cleanup(element, !0)
                        }
                        animationsToCancel.length > 0 && forEach(animationsToCancel, function (operation) {
                            operation.cancel()
                        })
                    }
                    if (!runner.isClassBased || runner.isSetClassOperation || "animate" == animationEvent || skipAnimation || (skipAnimation = "addClass" == animationEvent == element.hasClass(className)), skipAnimation)return fireDOMOperation(), fireBeforeCallbackAsync(), fireAfterCallbackAsync(), fireDoneCallbackAsync(), noopCancel;
                    runningAnimations = ngAnimateState.active || {}, totalActiveAnimations = ngAnimateState.totalActive || 0, "leave" == animationEvent && element.one("$destroy", function () {
                        var element = angular.element(this), state = element.data(NG_ANIMATE_STATE);
                        if (state) {
                            var activeLeaveAnimation = state.active["ng-leave"];
                            activeLeaveAnimation && (activeLeaveAnimation.cancel(), cleanup(element, "ng-leave"))
                        }
                    }), $$jqLite.addClass(element, NG_ANIMATE_CLASS_NAME), options && options.tempClasses && forEach(options.tempClasses, function (className) {
                        $$jqLite.addClass(element, className)
                    });
                    var localAnimationCount = globalAnimationCounter++;
                    return totalActiveAnimations++, runningAnimations[className] = runner, element.data(NG_ANIMATE_STATE, {
                        last: runner,
                        active: runningAnimations,
                        index: localAnimationCount,
                        totalActive: totalActiveAnimations
                    }), fireBeforeCallbackAsync(), runner.before(function (cancelled) {
                        var data = element.data(NG_ANIMATE_STATE);
                        cancelled = cancelled || !data || !data.active[className] || runner.isClassBased && data.active[className].event != animationEvent, fireDOMOperation(), cancelled === !0 ? closeAnimation() : (fireAfterCallbackAsync(), runner.after(closeAnimation))
                    }), runner.cancel
                }

                function cancelChildAnimations(element) {
                    var node = extractElementNode(element);
                    if (node) {
                        var nodes = angular.isFunction(node.getElementsByClassName) ? node.getElementsByClassName(NG_ANIMATE_CLASS_NAME) : node.querySelectorAll("." + NG_ANIMATE_CLASS_NAME);
                        forEach(nodes, function (element) {
                            element = angular.element(element);
                            var data = element.data(NG_ANIMATE_STATE);
                            data && data.active && forEach(data.active, function (runner) {
                                runner.cancel()
                            })
                        })
                    }
                }

                function cleanup(element, className) {
                    if (isMatchingElement(element, $rootElement))rootAnimateState.disabled || (rootAnimateState.running = !1, rootAnimateState.structural = !1); else if (className) {
                        var data = element.data(NG_ANIMATE_STATE) || {}, removeAnimations = className === !0;
                        !removeAnimations && data.active && data.active[className] && (data.totalActive--, delete data.active[className]), (removeAnimations || !data.totalActive) && ($$jqLite.removeClass(element, NG_ANIMATE_CLASS_NAME), element.removeData(NG_ANIMATE_STATE))
                    }
                }

                function animationsDisabled(element, parentElement) {
                    if (rootAnimateState.disabled)return !0;
                    if (isMatchingElement(element, $rootElement))return rootAnimateState.running;
                    var allowChildAnimations, parentRunningAnimation, hasParent;
                    do {
                        if (0 === parentElement.length)break;
                        var isRoot = isMatchingElement(parentElement, $rootElement), state = isRoot ? rootAnimateState : parentElement.data(NG_ANIMATE_STATE) || {};
                        if (state.disabled)return !0;
                        if (isRoot && (hasParent = !0), allowChildAnimations !== !1) {
                            var animateChildrenFlag = parentElement.data(NG_ANIMATE_CHILDREN);
                            angular.isDefined(animateChildrenFlag) && (allowChildAnimations = animateChildrenFlag)
                        }
                        parentRunningAnimation = parentRunningAnimation || state.running || state.last && !state.last.isClassBased
                    } while (parentElement = parentElement.parent());
                    return !hasParent || !allowChildAnimations && parentRunningAnimation
                }

                $$jqLite = $$$jqLite, $rootElement.data(NG_ANIMATE_STATE, rootAnimateState);
                var deregisterWatch = $rootScope.$watch(function () {
                    return $templateRequest.totalPendingRequests
                }, function (val) {
                    0 === val && (deregisterWatch(), $rootScope.$$postDigest(function () {
                        $rootScope.$$postDigest(function () {
                            rootAnimateState.running = !1
                        })
                    }))
                }), globalAnimationCounter = 0, classNameFilter = $animateProvider.classNameFilter(), isAnimatableClassName = classNameFilter ? function (className) {
                    return classNameFilter.test(className)
                } : function () {
                    return !0
                };
                return {
                    animate: function (element, from, to, className, options) {
                        return className = className || "ng-inline-animate", options = parseAnimateOptions(options) || {}, options.from = to ? from : null, options.to = to ? to : from, runAnimationPostDigest(function (done) {
                            return performAnimation("animate", className, stripCommentsFromElement(element), null, null, noop, options, done)
                        })
                    }, enter: function (element, parentElement, afterElement, options) {
                        return options = parseAnimateOptions(options), element = angular.element(element), parentElement = prepareElement(parentElement), afterElement = prepareElement(afterElement), classBasedAnimationsBlocked(element, !0), $delegate.enter(element, parentElement, afterElement), runAnimationPostDigest(function (done) {
                            return performAnimation("enter", "ng-enter", stripCommentsFromElement(element), parentElement, afterElement, noop, options, done)
                        })
                    }, leave: function (element, options) {
                        return options = parseAnimateOptions(options), element = angular.element(element), cancelChildAnimations(element), classBasedAnimationsBlocked(element, !0), runAnimationPostDigest(function (done) {
                            return performAnimation("leave", "ng-leave", stripCommentsFromElement(element), null, null, function () {
                                $delegate.leave(element)
                            }, options, done)
                        })
                    }, move: function (element, parentElement, afterElement, options) {
                        return options = parseAnimateOptions(options), element = angular.element(element), parentElement = prepareElement(parentElement), afterElement = prepareElement(afterElement), cancelChildAnimations(element), classBasedAnimationsBlocked(element, !0), $delegate.move(element, parentElement, afterElement), runAnimationPostDigest(function (done) {
                            return performAnimation("move", "ng-move", stripCommentsFromElement(element), parentElement, afterElement, noop, options, done)
                        })
                    }, addClass: function (element, className, options) {
                        return this.setClass(element, className, [], options)
                    }, removeClass: function (element, className, options) {
                        return this.setClass(element, [], className, options)
                    }, setClass: function (element, add, remove, options) {
                        options = parseAnimateOptions(options);
                        var STORAGE_KEY = "$$animateClasses";
                        if (element = angular.element(element), element = stripCommentsFromElement(element), classBasedAnimationsBlocked(element))return $delegate.$$setClassImmediately(element, add, remove, options);
                        var classes, cache = element.data(STORAGE_KEY), hasCache = !!cache;
                        return cache || (cache = {}, cache.classes = {}), classes = cache.classes, add = isArray(add) ? add : add.split(" "), forEach(add, function (c) {
                            c && c.length && (classes[c] = !0)
                        }), remove = isArray(remove) ? remove : remove.split(" "), forEach(remove, function (c) {
                            c && c.length && (classes[c] = !1)
                        }), hasCache ? (options && cache.options && (cache.options = angular.extend(cache.options || {}, options)), cache.promise) : (element.data(STORAGE_KEY, cache = {
                            classes: classes,
                            options: options
                        }), cache.promise = runAnimationPostDigest(function (done) {
                            var parentElement = element.parent(), elementNode = extractElementNode(element), parentNode = elementNode.parentNode;
                            if (!parentNode || parentNode.$$NG_REMOVED || elementNode.$$NG_REMOVED)return void done();
                            var cache = element.data(STORAGE_KEY);
                            element.removeData(STORAGE_KEY);
                            var state = element.data(NG_ANIMATE_STATE) || {}, classes = resolveElementClasses(element, cache, state.active);
                            return classes ? performAnimation("setClass", classes, element, parentElement, null, function () {
                                classes[0] && $delegate.$$addClassImmediately(element, classes[0]), classes[1] && $delegate.$$removeClassImmediately(element, classes[1])
                            }, cache.options, done) : done()
                        }))
                    }, cancel: function (promise) {
                        promise.$$cancelFn()
                    }, enabled: function (value, element) {
                        switch (arguments.length) {
                            case 2:
                                if (value)cleanup(element); else {
                                    var data = element.data(NG_ANIMATE_STATE) || {};
                                    data.disabled = !0, element.data(NG_ANIMATE_STATE, data)
                                }
                                break;
                            case 1:
                                rootAnimateState.disabled = !value;
                                break;
                            default:
                                value = !rootAnimateState.disabled
                        }
                        return !!value
                    }
                }
            }]), $animateProvider.register("", ["$window", "$sniffer", "$timeout", "$$animateReflow", function ($window, $sniffer, $timeout, $$animateReflow) {
                function clearCacheAfterReflow() {
                    cancelAnimationReflow || (cancelAnimationReflow = $$animateReflow(function () {
                        animationReflowQueue = [], cancelAnimationReflow = null, lookupCache = {}
                    }))
                }

                function afterReflow(element, callback) {
                    cancelAnimationReflow && cancelAnimationReflow(), animationReflowQueue.push(callback), cancelAnimationReflow = $$animateReflow(function () {
                        forEach(animationReflowQueue, function (fn) {
                            fn()
                        }), animationReflowQueue = [], cancelAnimationReflow = null, lookupCache = {}
                    })
                }

                function animationCloseHandler(element, totalTime) {
                    var node = extractElementNode(element);
                    element = angular.element(node), animationElementQueue.push(element);
                    var futureTimestamp = Date.now() + totalTime;
                    closingTimestamp >= futureTimestamp || ($timeout.cancel(closingTimer), closingTimestamp = futureTimestamp, closingTimer = $timeout(function () {
                        closeAllAnimations(animationElementQueue), animationElementQueue = []
                    }, totalTime, !1))
                }

                function closeAllAnimations(elements) {
                    forEach(elements, function (element) {
                        var elementData = element.data(NG_ANIMATE_CSS_DATA_KEY);
                        elementData && forEach(elementData.closeAnimationFns, function (fn) {
                            fn()
                        })
                    })
                }

                function getElementAnimationDetails(element, cacheKey) {
                    var data = cacheKey ? lookupCache[cacheKey] : null;
                    if (!data) {
                        var transitionDuration = 0, transitionDelay = 0, animationDuration = 0, animationDelay = 0;
                        forEach(element, function (element) {
                            if (element.nodeType == ELEMENT_NODE) {
                                var elementStyles = $window.getComputedStyle(element) || {}, transitionDurationStyle = elementStyles[TRANSITION_PROP + DURATION_KEY];
                                transitionDuration = Math.max(parseMaxTime(transitionDurationStyle), transitionDuration);
                                var transitionDelayStyle = elementStyles[TRANSITION_PROP + DELAY_KEY];
                                transitionDelay = Math.max(parseMaxTime(transitionDelayStyle), transitionDelay);
                                {
                                    elementStyles[ANIMATION_PROP + DELAY_KEY]
                                }
                                animationDelay = Math.max(parseMaxTime(elementStyles[ANIMATION_PROP + DELAY_KEY]), animationDelay);
                                var aDuration = parseMaxTime(elementStyles[ANIMATION_PROP + DURATION_KEY]);
                                aDuration > 0 && (aDuration *= parseInt(elementStyles[ANIMATION_PROP + ANIMATION_ITERATION_COUNT_KEY], 10) || 1), animationDuration = Math.max(aDuration, animationDuration)
                            }
                        }), data = {
                            total: 0,
                            transitionDelay: transitionDelay,
                            transitionDuration: transitionDuration,
                            animationDelay: animationDelay,
                            animationDuration: animationDuration
                        }, cacheKey && (lookupCache[cacheKey] = data)
                    }
                    return data
                }

                function parseMaxTime(str) {
                    var maxValue = 0, values = isString(str) ? str.split(/\s*,\s*/) : [];
                    return forEach(values, function (value) {
                        maxValue = Math.max(parseFloat(value) || 0, maxValue)
                    }), maxValue
                }

                function getCacheKey(element) {
                    var parentElement = element.parent(), parentID = parentElement.data(NG_ANIMATE_PARENT_KEY);
                    return parentID || (parentElement.data(NG_ANIMATE_PARENT_KEY, ++parentCounter), parentID = parentCounter), parentID + "-" + extractElementNode(element).getAttribute("class")
                }

                function animateSetup(animationEvent, element, className, styles) {
                    var structural = ["ng-enter", "ng-leave", "ng-move"].indexOf(className) >= 0, cacheKey = getCacheKey(element), eventCacheKey = cacheKey + " " + className, itemIndex = lookupCache[eventCacheKey] ? ++lookupCache[eventCacheKey].total : 0, stagger = {};
                    if (itemIndex > 0) {
                        var staggerClassName = className + "-stagger", staggerCacheKey = cacheKey + " " + staggerClassName, applyClasses = !lookupCache[staggerCacheKey];
                        applyClasses && $$jqLite.addClass(element, staggerClassName), stagger = getElementAnimationDetails(element, staggerCacheKey), applyClasses && $$jqLite.removeClass(element, staggerClassName)
                    }
                    $$jqLite.addClass(element, className);
                    var formerData = element.data(NG_ANIMATE_CSS_DATA_KEY) || {}, timings = getElementAnimationDetails(element, eventCacheKey), transitionDuration = timings.transitionDuration, animationDuration = timings.animationDuration;
                    if (structural && 0 === transitionDuration && 0 === animationDuration)return $$jqLite.removeClass(element, className), !1;
                    var blockTransition = styles || structural && transitionDuration > 0, blockAnimation = animationDuration > 0 && stagger.animationDelay > 0 && 0 === stagger.animationDuration, closeAnimationFns = formerData.closeAnimationFns || [];
                    element.data(NG_ANIMATE_CSS_DATA_KEY, {
                        stagger: stagger,
                        cacheKey: eventCacheKey,
                        running: formerData.running || 0,
                        itemIndex: itemIndex,
                        blockTransition: blockTransition,
                        closeAnimationFns: closeAnimationFns
                    });
                    var node = extractElementNode(element);
                    return blockTransition && (blockTransitions(node, !0), styles && element.css(styles)), blockAnimation && blockAnimations(node, !0), !0
                }

                function animateRun(animationEvent, element, className, activeAnimationComplete, styles) {
                    function onEnd() {
                        element.off(css3AnimationEvents, onAnimationProgress), $$jqLite.removeClass(element, activeClassName), $$jqLite.removeClass(element, pendingClassName), staggerTimeout && $timeout.cancel(staggerTimeout), animateClose(element, className);
                        var node = extractElementNode(element);
                        for (var i in appliedStyles)node.style.removeProperty(appliedStyles[i])
                    }

                    function onAnimationProgress(event) {
                        event.stopPropagation();
                        var ev = event.originalEvent || event, timeStamp = ev.$manualTimeStamp || ev.timeStamp || Date.now(), elapsedTime = parseFloat(ev.elapsedTime.toFixed(ELAPSED_TIME_MAX_DECIMAL_PLACES));
                        Math.max(timeStamp - startTime, 0) >= maxDelayTime && elapsedTime >= maxDuration && activeAnimationComplete()
                    }

                    var node = extractElementNode(element), elementData = element.data(NG_ANIMATE_CSS_DATA_KEY);
                    if (-1 == node.getAttribute("class").indexOf(className) || !elementData)return void activeAnimationComplete();
                    var activeClassName = "", pendingClassName = "";
                    forEach(className.split(" "), function (klass, i) {
                        var prefix = (i > 0 ? " " : "") + klass;
                        activeClassName += prefix + "-active", pendingClassName += prefix + "-pending"
                    });
                    var style = "", appliedStyles = [], itemIndex = elementData.itemIndex, stagger = elementData.stagger, staggerTime = 0;
                    if (itemIndex > 0) {
                        var transitionStaggerDelay = 0;
                        stagger.transitionDelay > 0 && 0 === stagger.transitionDuration && (transitionStaggerDelay = stagger.transitionDelay * itemIndex);
                        var animationStaggerDelay = 0;
                        stagger.animationDelay > 0 && 0 === stagger.animationDuration && (animationStaggerDelay = stagger.animationDelay * itemIndex, appliedStyles.push(CSS_PREFIX + "animation-play-state")), staggerTime = Math.round(100 * Math.max(transitionStaggerDelay, animationStaggerDelay)) / 100
                    }
                    staggerTime || ($$jqLite.addClass(element, activeClassName), elementData.blockTransition && blockTransitions(node, !1));
                    var eventCacheKey = elementData.cacheKey + " " + activeClassName, timings = getElementAnimationDetails(element, eventCacheKey), maxDuration = Math.max(timings.transitionDuration, timings.animationDuration);
                    if (0 === maxDuration)return $$jqLite.removeClass(element, activeClassName), animateClose(element, className), void activeAnimationComplete();
                    !staggerTime && styles && (timings.transitionDuration || (element.css("transition", timings.animationDuration + "s linear all"), appliedStyles.push("transition")), element.css(styles));
                    var maxDelay = Math.max(timings.transitionDelay, timings.animationDelay), maxDelayTime = maxDelay * ONE_SECOND;
                    if (appliedStyles.length > 0) {
                        var oldStyle = node.getAttribute("style") || "";
                        ";" !== oldStyle.charAt(oldStyle.length - 1) && (oldStyle += ";"), node.setAttribute("style", oldStyle + " " + style)
                    }
                    var staggerTimeout, startTime = Date.now(), css3AnimationEvents = ANIMATIONEND_EVENT + " " + TRANSITIONEND_EVENT, animationTime = (maxDelay + maxDuration) * CLOSING_TIME_BUFFER, totalTime = (staggerTime + animationTime) * ONE_SECOND;
                    return staggerTime > 0 && ($$jqLite.addClass(element, pendingClassName), staggerTimeout = $timeout(function () {
                        staggerTimeout = null, timings.transitionDuration > 0 && blockTransitions(node, !1), timings.animationDuration > 0 && blockAnimations(node, !1), $$jqLite.addClass(element, activeClassName), $$jqLite.removeClass(element, pendingClassName), styles && (0 === timings.transitionDuration && element.css("transition", timings.animationDuration + "s linear all"), element.css(styles), appliedStyles.push("transition"))
                    }, staggerTime * ONE_SECOND, !1)), element.on(css3AnimationEvents, onAnimationProgress), elementData.closeAnimationFns.push(function () {
                        onEnd(), activeAnimationComplete()
                    }), elementData.running++, animationCloseHandler(element, totalTime), onEnd
                }

                function blockTransitions(node, bool) {
                    node.style[TRANSITION_PROP + PROPERTY_KEY] = bool ? "none" : ""
                }

                function blockAnimations(node, bool) {
                    node.style[ANIMATION_PROP + ANIMATION_PLAYSTATE_KEY] = bool ? "paused" : ""
                }

                function animateBefore(animationEvent, element, className, styles) {
                    return animateSetup(animationEvent, element, className, styles) ? function (cancelled) {
                        cancelled && animateClose(element, className)
                    } : void 0
                }

                function animateAfter(animationEvent, element, className, afterAnimationComplete, styles) {
                    return element.data(NG_ANIMATE_CSS_DATA_KEY) ? animateRun(animationEvent, element, className, afterAnimationComplete, styles) : (animateClose(element, className), void afterAnimationComplete())
                }

                function animate(animationEvent, element, className, animationComplete, options) {
                    var preReflowCancellation = animateBefore(animationEvent, element, className, options.from);
                    if (!preReflowCancellation)return clearCacheAfterReflow(), void animationComplete();
                    var cancel = preReflowCancellation;
                    return afterReflow(element, function () {
                        cancel = animateAfter(animationEvent, element, className, animationComplete, options.to)
                    }), function (cancelled) {
                        (cancel || noop)(cancelled)
                    }
                }

                function animateClose(element, className) {
                    $$jqLite.removeClass(element, className);
                    var data = element.data(NG_ANIMATE_CSS_DATA_KEY);
                    data && (data.running && data.running--, data.running && 0 !== data.running || element.removeData(NG_ANIMATE_CSS_DATA_KEY))
                }

                function suffixClasses(classes, suffix) {
                    var className = "";
                    return classes = isArray(classes) ? classes : classes.split(/\s+/), forEach(classes, function (klass, i) {
                        klass && klass.length > 0 && (className += (i > 0 ? " " : "") + klass + suffix)
                    }), className
                }

                var TRANSITION_PROP, TRANSITIONEND_EVENT, ANIMATION_PROP, ANIMATIONEND_EVENT, CSS_PREFIX = "";
                window.ontransitionend === undefined && window.onwebkittransitionend !== undefined ? (CSS_PREFIX = "-webkit-", TRANSITION_PROP = "WebkitTransition", TRANSITIONEND_EVENT = "webkitTransitionEnd transitionend") : (TRANSITION_PROP = "transition", TRANSITIONEND_EVENT = "transitionend"), window.onanimationend === undefined && window.onwebkitanimationend !== undefined ? (CSS_PREFIX = "-webkit-", ANIMATION_PROP = "WebkitAnimation", ANIMATIONEND_EVENT = "webkitAnimationEnd animationend") : (ANIMATION_PROP = "animation", ANIMATIONEND_EVENT = "animationend");
                var cancelAnimationReflow, DURATION_KEY = "Duration", PROPERTY_KEY = "Property", DELAY_KEY = "Delay", ANIMATION_ITERATION_COUNT_KEY = "IterationCount", ANIMATION_PLAYSTATE_KEY = "PlayState", NG_ANIMATE_PARENT_KEY = "$$ngAnimateKey", NG_ANIMATE_CSS_DATA_KEY = "$$ngAnimateCSS3Data", ELAPSED_TIME_MAX_DECIMAL_PLACES = 3, CLOSING_TIME_BUFFER = 1.5, ONE_SECOND = 1e3, lookupCache = {}, parentCounter = 0, animationReflowQueue = [], closingTimer = null, closingTimestamp = 0, animationElementQueue = [];
                return {
                    animate: function (element, className, from, to, animationCompleted, options) {
                        return options = options || {}, options.from = from, options.to = to, animate("animate", element, className, animationCompleted, options)
                    }, enter: function (element, animationCompleted, options) {
                        return options = options || {}, animate("enter", element, "ng-enter", animationCompleted, options)
                    }, leave: function (element, animationCompleted, options) {
                        return options = options || {}, animate("leave", element, "ng-leave", animationCompleted, options)
                    }, move: function (element, animationCompleted, options) {
                        return options = options || {}, animate("move", element, "ng-move", animationCompleted, options)
                    }, beforeSetClass: function (element, add, remove, animationCompleted, options) {
                        options = options || {};
                        var className = suffixClasses(remove, "-remove") + " " + suffixClasses(add, "-add"), cancellationMethod = animateBefore("setClass", element, className, options.from);
                        return cancellationMethod ? (afterReflow(element, animationCompleted), cancellationMethod) : (clearCacheAfterReflow(), void animationCompleted())
                    }, beforeAddClass: function (element, className, animationCompleted, options) {
                        options = options || {};
                        var cancellationMethod = animateBefore("addClass", element, suffixClasses(className, "-add"), options.from);
                        return cancellationMethod ? (afterReflow(element, animationCompleted), cancellationMethod) : (clearCacheAfterReflow(), void animationCompleted())
                    }, beforeRemoveClass: function (element, className, animationCompleted, options) {
                        options = options || {};
                        var cancellationMethod = animateBefore("removeClass", element, suffixClasses(className, "-remove"), options.from);
                        return cancellationMethod ? (afterReflow(element, animationCompleted), cancellationMethod) : (clearCacheAfterReflow(), void animationCompleted())
                    }, setClass: function (element, add, remove, animationCompleted, options) {
                        options = options || {}, remove = suffixClasses(remove, "-remove"), add = suffixClasses(add, "-add");
                        var className = remove + " " + add;
                        return animateAfter("setClass", element, className, animationCompleted, options.to)
                    }, addClass: function (element, className, animationCompleted, options) {
                        return options = options || {}, animateAfter("addClass", element, suffixClasses(className, "-add"), animationCompleted, options.to)
                    }, removeClass: function (element, className, animationCompleted, options) {
                        return options = options || {}, animateAfter("removeClass", element, suffixClasses(className, "-remove"), animationCompleted, options.to)
                    }
                }
            }])
        }])
    }(window, window.angular), define("angular-animate", ["angular"], function () {
    }), function (window, angular) {
        angular.module("ngMessages", []).directive("ngMessages", ["$compile", "$animate", "$templateRequest", function ($compile, $animate, $templateRequest) {
            var ACTIVE_CLASS = "ng-active", INACTIVE_CLASS = "ng-inactive";
            return {
                restrict: "AE", controller: function () {
                    this.$renderNgMessageClasses = angular.noop;
                    var messages = [];
                    this.registerMessage = function (index, message) {
                        for (var i = 0; i < messages.length; i++)if (messages[i].type == message.type) {
                            if (index != i) {
                                var temp = messages[index];
                                messages[index] = messages[i], index < messages.length ? messages[i] = temp : messages.splice(0, i)
                            }
                            return
                        }
                        messages.splice(index, 0, message)
                    }, this.renderMessages = function (values, multiple) {
                        function truthyVal(value) {
                            return null !== value && value !== !1 && value
                        }

                        values = values || {};
                        var found;
                        angular.forEach(messages, function (message) {
                            found && !multiple || !truthyVal(values[message.type]) ? message.detach() : (message.attach(), found = !0)
                        }), this.renderElementClasses(found)
                    }
                }, require: "ngMessages", link: function ($scope, element, $attrs, ctrl) {
                    ctrl.renderElementClasses = function (bool) {
                        bool ? $animate.setClass(element, ACTIVE_CLASS, INACTIVE_CLASS) : $animate.setClass(element, INACTIVE_CLASS, ACTIVE_CLASS)
                    };
                    var cachedValues, multiple = angular.isString($attrs.ngMessagesMultiple) || angular.isString($attrs.multiple), watchAttr = $attrs.ngMessages || $attrs["for"];
                    $scope.$watchCollection(watchAttr, function (values) {
                        cachedValues = values, ctrl.renderMessages(values, multiple)
                    });
                    var tpl = $attrs.ngMessagesInclude || $attrs.include;
                    tpl && $templateRequest(tpl).then(function (html) {
                        var after, container = angular.element("<div/>").html(html);
                        angular.forEach(container.children(), function (elm) {
                            elm = angular.element(elm), after ? after.after(elm) : element.prepend(elm), after = elm, $compile(elm)($scope)
                        }), ctrl.renderMessages(cachedValues, multiple)
                    })
                }
            }
        }]).directive("ngMessage", ["$animate", function ($animate) {
            var COMMENT_NODE = 8;
            return {
                require: "^ngMessages",
                transclude: "element",
                terminal: !0,
                restrict: "AE",
                link: function ($scope, $element, $attrs, ngMessages, $transclude) {
                    for (var index, element, commentNode = $element[0], parentNode = commentNode.parentNode, i = 0, j = 0; i < parentNode.childNodes.length; i++) {
                        var node = parentNode.childNodes[i];
                        if (node.nodeType == COMMENT_NODE && node.nodeValue.indexOf("ngMessage") >= 0) {
                            if (node === commentNode) {
                                index = j;
                                break
                            }
                            j++
                        }
                    }
                    ngMessages.registerMessage(index, {
                        type: $attrs.ngMessage || $attrs.when, attach: function () {
                            element || $transclude($scope, function (clone) {
                                $animate.enter(clone, null, $element), element = clone
                            })
                        }, detach: function () {
                            element && ($animate.leave(element), element = null)
                        }
                    })
                }
            }
        }])
    }(window, window.angular), define("angular-messages", ["angular"], function () {
    }), function (window, angular, undefined) {
        function isValidDottedPath(path) {
            return null != path && "" !== path && "hasOwnProperty" !== path && MEMBER_NAME_REGEX.test("." + path)
        }

        function lookupDottedPath(obj, path) {
            if (!isValidDottedPath(path))throw $resourceMinErr("badmember", 'Dotted member path "@{0}" is invalid.', path);
            for (var keys = path.split("."), i = 0, ii = keys.length; ii > i && obj !== undefined; i++) {
                var key = keys[i];
                obj = null !== obj ? obj[key] : undefined
            }
            return obj
        }

        function shallowClearAndCopy(src, dst) {
            dst = dst || {}, angular.forEach(dst, function (value, key) {
                delete dst[key]
            });
            for (var key in src)!src.hasOwnProperty(key) || "$" === key.charAt(0) && "$" === key.charAt(1) || (dst[key] = src[key]);
            return dst
        }

        var $resourceMinErr = angular.$$minErr("$resource"), MEMBER_NAME_REGEX = /^(\.[a-zA-Z_$][0-9a-zA-Z_$]*)+$/;
        angular.module("ngResource", ["ng"]).provider("$resource", function () {
            var provider = this;
            this.defaults = {
                stripTrailingSlashes: !0,
                actions: {
                    get: {method: "GET"},
                    save: {method: "POST"},
                    query: {method: "GET", isArray: !0},
                    remove: {method: "DELETE"},
                    "delete": {method: "DELETE"}
                }
            }, this.$get = ["$http", "$q", function ($http, $q) {
                function encodeUriSegment(val) {
                    return encodeUriQuery(val, !0).replace(/%26/gi, "&").replace(/%3D/gi, "=").replace(/%2B/gi, "+")
                }

                function encodeUriQuery(val, pctEncodeSpaces) {
                    return encodeURIComponent(val).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, pctEncodeSpaces ? "%20" : "+")
                }

                function Route(template, defaults) {
                    this.template = template, this.defaults = extend({}, provider.defaults, defaults), this.urlParams = {}
                }

                function resourceFactory(url, paramDefaults, actions, options) {
                    function extractParams(data, actionParams) {
                        var ids = {};
                        return actionParams = extend({}, paramDefaults, actionParams), forEach(actionParams, function (value, key) {
                            isFunction(value) && (value = value()), ids[key] = value && value.charAt && "@" == value.charAt(0) ? lookupDottedPath(data, value.substr(1)) : value
                        }), ids
                    }

                    function defaultResponseInterceptor(response) {
                        return response.resource
                    }

                    function Resource(value) {
                        shallowClearAndCopy(value || {}, this)
                    }

                    var route = new Route(url, options);
                    return actions = extend({}, provider.defaults.actions, actions), Resource.prototype.toJSON = function () {
                        var data = extend({}, this);
                        return delete data.$promise, delete data.$resolved, data
                    }, forEach(actions, function (action, name) {
                        var hasBody = /^(POST|PUT|PATCH)$/i.test(action.method);
                        Resource[name] = function (a1, a2, a3, a4) {
                            var data, success, error, params = {};
                            switch (arguments.length) {
                                case 4:
                                    error = a4, success = a3;
                                case 3:
                                case 2:
                                    if (!isFunction(a2)) {
                                        params = a1, data = a2, success = a3;
                                        break
                                    }
                                    if (isFunction(a1)) {
                                        success = a1, error = a2;
                                        break
                                    }
                                    success = a2, error = a3;
                                case 1:
                                    isFunction(a1) ? success = a1 : hasBody ? data = a1 : params = a1;
                                    break;
                                case 0:
                                    break;
                                default:
                                    throw $resourceMinErr("badargs", "Expected up to 4 arguments [params, data, success, error], got {0} arguments", arguments.length)
                            }
                            var isInstanceCall = this instanceof Resource, value = isInstanceCall ? data : action.isArray ? [] : new Resource(data), httpConfig = {}, responseInterceptor = action.interceptor && action.interceptor.response || defaultResponseInterceptor, responseErrorInterceptor = action.interceptor && action.interceptor.responseError || undefined;
                            forEach(action, function (value, key) {
                                "params" != key && "isArray" != key && "interceptor" != key && (httpConfig[key] = copy(value))
                            }), hasBody && (httpConfig.data = data), route.setUrlParams(httpConfig, extend({}, extractParams(data, action.params || {}), params), action.url);
                            var promise = $http(httpConfig).then(function (response) {
                                var data = response.data, promise = value.$promise;
                                if (data) {
                                    if (angular.isArray(data) !== !!action.isArray)throw $resourceMinErr("badcfg", "Error in resource configuration for action `{0}`. Expected response to contain an {1} but got an {2}", name, action.isArray ? "array" : "object", angular.isArray(data) ? "array" : "object");
                                    action.isArray ? (value.length = 0, forEach(data, function (item) {
                                        value.push("object" == typeof item ? new Resource(item) : item)
                                    })) : (shallowClearAndCopy(data, value), value.$promise = promise)
                                }
                                return value.$resolved = !0, response.resource = value, response
                            }, function (response) {
                                return value.$resolved = !0, (error || noop)(response), $q.reject(response)
                            });
                            return promise = promise.then(function (response) {
                                var value = responseInterceptor(response);
                                return (success || noop)(value, response.headers), value
                            }, responseErrorInterceptor), isInstanceCall ? promise : (value.$promise = promise, value.$resolved = !1, value)
                        }, Resource.prototype["$" + name] = function (params, success, error) {
                            isFunction(params) && (error = success, success = params, params = {});
                            var result = Resource[name].call(this, params, this, success, error);
                            return result.$promise || result
                        }
                    }), Resource.bind = function (additionalParamDefaults) {
                        return resourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions)
                    }, Resource
                }

                var noop = angular.noop, forEach = angular.forEach, extend = angular.extend, copy = angular.copy, isFunction = angular.isFunction;
                return Route.prototype = {
                    setUrlParams: function (config, params, actionUrl) {
                        var val, encodedVal, self = this, url = actionUrl || self.template, urlParams = self.urlParams = {};
                        forEach(url.split(/\W/), function (param) {
                            if ("hasOwnProperty" === param)throw $resourceMinErr("badname", "hasOwnProperty is not a valid parameter name.");
                            !new RegExp("^\\d+$").test(param) && param && new RegExp("(^|[^\\\\]):" + param + "(\\W|$)").test(url) && (urlParams[param] = !0)
                        }), url = url.replace(/\\:/g, ":"), params = params || {}, forEach(self.urlParams, function (_, urlParam) {
                            val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam], angular.isDefined(val) && null !== val ? (encodedVal = encodeUriSegment(val), url = url.replace(new RegExp(":" + urlParam + "(\\W|$)", "g"), function (match, p1) {
                                return encodedVal + p1
                            })) : url = url.replace(new RegExp("(/?):" + urlParam + "(\\W|$)", "g"), function (match, leadingSlashes, tail) {
                                return "/" == tail.charAt(0) ? tail : leadingSlashes + tail
                            })
                        }), self.defaults.stripTrailingSlashes && (url = url.replace(/\/+$/, "") || "/"), url = url.replace(/\/\.(?=\w+($|\?))/, "."), config.url = url.replace(/\/\\\./, "/."), forEach(params, function (value, key) {
                            self.urlParams[key] || (config.params = config.params || {}, config.params[key] = value)
                        })
                    }
                }, resourceFactory
            }]
        })
    }(window, window.angular), define("angular-resource", ["angular"], function () {
    }), function (window, angular) {
        function $SanitizeProvider() {
            this.$get = ["$$sanitizeUri", function ($$sanitizeUri) {
                return function (html) {
                    var buf = [];
                    return htmlParser(html, htmlSanitizeWriter(buf, function (uri, isImage) {
                        return !/^unsafe/.test($$sanitizeUri(uri, isImage))
                    })), buf.join("")
                }
            }]
        }

        function sanitizeText(chars) {
            var buf = [], writer = htmlSanitizeWriter(buf, angular.noop);
            return writer.chars(chars), buf.join("")
        }

        function makeMap(str) {
            var i, obj = {}, items = str.split(",");
            for (i = 0; i < items.length; i++)obj[items[i]] = !0;
            return obj
        }

        function htmlParser(html, handler) {
            function parseStartTag(tag, tagName, rest, unary) {
                if (tagName = angular.lowercase(tagName), blockElements[tagName])for (; stack.last() && inlineElements[stack.last()];)parseEndTag("", stack.last());
                optionalEndTagElements[tagName] && stack.last() == tagName && parseEndTag("", tagName), unary = voidElements[tagName] || !!unary, unary || stack.push(tagName);
                var attrs = {};
                rest.replace(ATTR_REGEXP, function (match, name, doubleQuotedValue, singleQuotedValue, unquotedValue) {
                    var value = doubleQuotedValue || singleQuotedValue || unquotedValue || "";
                    attrs[name] = decodeEntities(value)
                }), handler.start && handler.start(tagName, attrs, unary)
            }

            function parseEndTag(tag, tagName) {
                var i, pos = 0;
                if (tagName = angular.lowercase(tagName))for (pos = stack.length - 1; pos >= 0 && stack[pos] != tagName; pos--);
                if (pos >= 0) {
                    for (i = stack.length - 1; i >= pos; i--)handler.end && handler.end(stack[i]);
                    stack.length = pos
                }
            }

            "string" != typeof html && (html = null === html || "undefined" == typeof html ? "" : "" + html);
            var index, chars, match, text, stack = [], last = html;
            for (stack.last = function () {
                return stack[stack.length - 1]
            }; html;) {
                if (text = "", chars = !0, stack.last() && specialElements[stack.last()] ? (html = html.replace(new RegExp("(.*)<\\s*\\/\\s*" + stack.last() + "[^>]*>", "i"), function (all, text) {
                        return text = text.replace(COMMENT_REGEXP, "$1").replace(CDATA_REGEXP, "$1"), handler.chars && handler.chars(decodeEntities(text)), ""
                    }), parseEndTag("", stack.last())) : (0 === html.indexOf("<!--") ? (index = html.indexOf("--", 4), index >= 0 && html.lastIndexOf("-->", index) === index && (handler.comment && handler.comment(html.substring(4, index)), html = html.substring(index + 3), chars = !1)) : DOCTYPE_REGEXP.test(html) ? (match = html.match(DOCTYPE_REGEXP), match && (html = html.replace(match[0], ""), chars = !1)) : BEGING_END_TAGE_REGEXP.test(html) ? (match = html.match(END_TAG_REGEXP), match && (html = html.substring(match[0].length), match[0].replace(END_TAG_REGEXP, parseEndTag), chars = !1)) : BEGIN_TAG_REGEXP.test(html) && (match = html.match(START_TAG_REGEXP), match ? (match[4] && (html = html.substring(match[0].length), match[0].replace(START_TAG_REGEXP, parseStartTag)), chars = !1) : (text += "<", html = html.substring(1))), chars && (index = html.indexOf("<"), text += 0 > index ? html : html.substring(0, index), html = 0 > index ? "" : html.substring(index), handler.chars && handler.chars(decodeEntities(text)))), html == last)throw $sanitizeMinErr("badparse", "The sanitizer was unable to parse the following block of html: {0}", html);
                last = html
            }
            parseEndTag()
        }

        function decodeEntities(value) {
            if (!value)return "";
            var parts = spaceRe.exec(value), spaceBefore = parts[1], spaceAfter = parts[3], content = parts[2];
            return content && (hiddenPre.innerHTML = content.replace(/</g, "&lt;"), content = "textContent"in hiddenPre ? hiddenPre.textContent : hiddenPre.innerText), spaceBefore + content + spaceAfter
        }

        function encodeEntities(value) {
            return value.replace(/&/g, "&amp;").replace(SURROGATE_PAIR_REGEXP, function (value) {
                var hi = value.charCodeAt(0), low = value.charCodeAt(1);
                return "&#" + (1024 * (hi - 55296) + (low - 56320) + 65536) + ";"
            }).replace(NON_ALPHANUMERIC_REGEXP, function (value) {
                return "&#" + value.charCodeAt(0) + ";"
            }).replace(/</g, "&lt;").replace(/>/g, "&gt;")
        }

        function htmlSanitizeWriter(buf, uriValidator) {
            var ignore = !1, out = angular.bind(buf, buf.push);
            return {
                start: function (tag, attrs, unary) {
                    tag = angular.lowercase(tag), !ignore && specialElements[tag] && (ignore = tag), ignore || validElements[tag] !== !0 || (out("<"), out(tag), angular.forEach(attrs, function (value, key) {
                        var lkey = angular.lowercase(key), isImage = "img" === tag && "src" === lkey || "background" === lkey;
                        validAttrs[lkey] !== !0 || uriAttrs[lkey] === !0 && !uriValidator(value, isImage) || (out(" "), out(key), out('="'), out(encodeEntities(value)), out('"'))
                    }), out(unary ? "/>" : ">"))
                }, end: function (tag) {
                    tag = angular.lowercase(tag), ignore || validElements[tag] !== !0 || (out("</"), out(tag), out(">")), tag == ignore && (ignore = !1)
                }, chars: function (chars) {
                    ignore || out(encodeEntities(chars))
                }
            }
        }

        var $sanitizeMinErr = angular.$$minErr("$sanitize"), START_TAG_REGEXP = /^<((?:[a-zA-Z])[\w:-]*)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*(>?)/, END_TAG_REGEXP = /^<\/\s*([\w:-]+)[^>]*>/, ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g, BEGIN_TAG_REGEXP = /^</, BEGING_END_TAGE_REGEXP = /^<\//, COMMENT_REGEXP = /<!--(.*?)-->/g, DOCTYPE_REGEXP = /<!DOCTYPE([^>]*?)>/i, CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g, SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g, NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g, voidElements = makeMap("area,br,col,hr,img,wbr"), optionalEndTagBlockElements = makeMap("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"), optionalEndTagInlineElements = makeMap("rp,rt"), optionalEndTagElements = angular.extend({}, optionalEndTagInlineElements, optionalEndTagBlockElements), blockElements = angular.extend({}, optionalEndTagBlockElements, makeMap("address,article,aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul")), inlineElements = angular.extend({}, optionalEndTagInlineElements, makeMap("a,abbr,acronym,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,span,strike,strong,sub,sup,time,tt,u,var")), svgElements = makeMap("animate,animateColor,animateMotion,animateTransform,circle,defs,desc,ellipse,font-face,font-face-name,font-face-src,g,glyph,hkern,image,linearGradient,line,marker,metadata,missing-glyph,mpath,path,polygon,polyline,radialGradient,rect,set,stop,svg,switch,text,title,tspan,use"), specialElements = makeMap("script,style"), validElements = angular.extend({}, voidElements, blockElements, inlineElements, optionalEndTagElements, svgElements), uriAttrs = makeMap("background,cite,href,longdesc,src,usemap,xlink:href"), htmlAttrs = makeMap("abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,size,span,start,summary,target,title,type,valign,value,vspace,width"), svgAttrs = makeMap("accent-height,accumulate,additive,alphabetic,arabic-form,ascent,attributeName,attributeType,baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan"), validAttrs = angular.extend({}, uriAttrs, svgAttrs, htmlAttrs), hiddenPre = document.createElement("pre"), spaceRe = /^(\s*)([\s\S]*?)(\s*)$/;
        angular.module("ngSanitize", []).provider("$sanitize", $SanitizeProvider), angular.module("ngSanitize").filter("linky", ["$sanitize", function ($sanitize) {
            var LINKY_URL_REGEXP = /((ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"”’]/, MAILTO_REGEXP = /^mailto:/;
            return function (text, target) {
                function addText(text) {
                    text && html.push(sanitizeText(text))
                }

                function addLink(url, text) {
                    html.push("<a "), angular.isDefined(target) && html.push('target="', target, '" '), html.push('href="', url.replace(/"/g, "&quot;"), '">'), addText(text), html.push("</a>")
                }

                if (!text)return text;
                for (var match, url, i, raw = text, html = []; match = raw.match(LINKY_URL_REGEXP);)url = match[0], match[2] || match[4] || (url = (match[3] ? "http://" : "mailto:") + url), i = match.index, addText(raw.substr(0, i)), addLink(url, match[0].replace(MAILTO_REGEXP, "")), raw = raw.substring(i + match[0].length);
                return addText(raw), $sanitize(html.join(""))
            }
        }])
    }(window, window.angular), define("angular-sanitize", ["angular"], function () {
    }), angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.transition", "ui.bootstrap.collapse", "ui.bootstrap.accordion", "ui.bootstrap.alert", "ui.bootstrap.bindHtml", "ui.bootstrap.buttons", "ui.bootstrap.carousel", "ui.bootstrap.dateparser", "ui.bootstrap.position", "ui.bootstrap.datepicker", "ui.bootstrap.dropdown", "ui.bootstrap.modal", "ui.bootstrap.pagination", "ui.bootstrap.tooltip", "ui.bootstrap.popover", "ui.bootstrap.progressbar", "ui.bootstrap.rating", "ui.bootstrap.tabs", "ui.bootstrap.timepicker", "ui.bootstrap.typeahead"]), angular.module("ui.bootstrap.tpls", ["template/accordion/accordion-group.html", "template/accordion/accordion.html", "template/alert/alert.html", "template/carousel/carousel.html", "template/carousel/slide.html", "template/datepicker/datepicker.html", "template/datepicker/day.html", "template/datepicker/month.html", "template/datepicker/popup.html", "template/datepicker/year.html", "template/modal/backdrop.html", "template/modal/window.html", "template/pagination/pager.html", "template/pagination/pagination.html", "template/tooltip/tooltip-html-unsafe-popup.html", "template/tooltip/tooltip-popup.html", "template/popover/popover.html", "template/progressbar/bar.html", "template/progressbar/progress.html", "template/progressbar/progressbar.html", "template/rating/rating.html", "template/tabs/tab.html", "template/tabs/tabset.html", "template/timepicker/timepicker.html", "template/typeahead/typeahead-match.html", "template/typeahead/typeahead-popup.html"]), angular.module("ui.bootstrap.transition", []).factory("$transition", ["$q", "$timeout", "$rootScope", function ($q, $timeout, $rootScope) {
        function findEndEventName(endEventNames) {
            for (var name in endEventNames)if (void 0 !== transElement.style[name])return endEventNames[name]
        }

        var $transition = function (element, trigger, options) {
            options = options || {};
            var deferred = $q.defer(), endEventName = $transition[options.animation ? "animationEndEventName" : "transitionEndEventName"], transitionEndHandler = function () {
                $rootScope.$apply(function () {
                    element.unbind(endEventName, transitionEndHandler), deferred.resolve(element)
                })
            };
            return endEventName && element.bind(endEventName, transitionEndHandler), $timeout(function () {
                angular.isString(trigger) ? element.addClass(trigger) : angular.isFunction(trigger) ? trigger(element) : angular.isObject(trigger) && element.css(trigger), endEventName || deferred.resolve(element)
            }), deferred.promise.cancel = function () {
                endEventName && element.unbind(endEventName, transitionEndHandler), deferred.reject("Transition cancelled")
            }, deferred.promise
        }, transElement = document.createElement("trans"), transitionEndEventNames = {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd",
            transition: "transitionend"
        }, animationEndEventNames = {
            WebkitTransition: "webkitAnimationEnd",
            MozTransition: "animationend",
            OTransition: "oAnimationEnd",
            transition: "animationend"
        };
        return $transition.transitionEndEventName = findEndEventName(transitionEndEventNames), $transition.animationEndEventName = findEndEventName(animationEndEventNames), $transition
    }]), angular.module("ui.bootstrap.collapse", ["ui.bootstrap.transition"]).directive("collapse", ["$transition", function ($transition) {
        return {
            link: function (scope, element, attrs) {
                function doTransition(change) {
                    function newTransitionDone() {
                        currentTransition === newTransition && (currentTransition = void 0)
                    }

                    var newTransition = $transition(element, change);
                    return currentTransition && currentTransition.cancel(), currentTransition = newTransition, newTransition.then(newTransitionDone, newTransitionDone), newTransition
                }

                function expand() {
                    initialAnimSkip ? (initialAnimSkip = !1, expandDone()) : (element.removeClass("collapse").addClass("collapsing"), doTransition({height: element[0].scrollHeight + "px"}).then(expandDone))
                }

                function expandDone() {
                    element.removeClass("collapsing"), element.addClass("collapse in"), element.css({height: "auto"})
                }

                function collapse() {
                    if (initialAnimSkip)initialAnimSkip = !1, collapseDone(), element.css({height: 0}); else {
                        element.css({height: element[0].scrollHeight + "px"});
                        {
                            element[0].offsetWidth
                        }
                        element.removeClass("collapse in").addClass("collapsing"), doTransition({height: 0}).then(collapseDone)
                    }
                }

                function collapseDone() {
                    element.removeClass("collapsing"), element.addClass("collapse")
                }

                var currentTransition, initialAnimSkip = !0;
                scope.$watch(attrs.collapse, function (shouldCollapse) {
                    shouldCollapse ? collapse() : expand()
                })
            }
        }
    }]), angular.module("ui.bootstrap.accordion", ["ui.bootstrap.collapse"]).constant("accordionConfig", {closeOthers: !0}).controller("AccordionController", ["$scope", "$attrs", "accordionConfig", function ($scope, $attrs, accordionConfig) {
        this.groups = [], this.closeOthers = function (openGroup) {
            var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
            closeOthers && angular.forEach(this.groups, function (group) {
                group !== openGroup && (group.isOpen = !1)
            })
        }, this.addGroup = function (groupScope) {
            var that = this;
            this.groups.push(groupScope), groupScope.$on("$destroy", function () {
                that.removeGroup(groupScope)
            })
        }, this.removeGroup = function (group) {
            var index = this.groups.indexOf(group);
            -1 !== index && this.groups.splice(index, 1)
        }
    }]).directive("accordion", function () {
        return {
            restrict: "EA",
            controller: "AccordionController",
            transclude: !0,
            replace: !1,
            templateUrl: "template/accordion/accordion.html"
        }
    }).directive("accordionGroup", function () {
        return {
            require: "^accordion",
            restrict: "EA",
            transclude: !0,
            replace: !0,
            templateUrl: "template/accordion/accordion-group.html",
            scope: {heading: "@", isOpen: "=?", isDisabled: "=?"},
            controller: function () {
                this.setHeading = function (element) {
                    this.heading = element
                }
            },
            link: function (scope, element, attrs, accordionCtrl) {
                accordionCtrl.addGroup(scope), scope.$watch("isOpen", function (value) {
                    value && accordionCtrl.closeOthers(scope)
                }), scope.toggleOpen = function () {
                    scope.isDisabled || (scope.isOpen = !scope.isOpen)
                }
            }
        }
    }).directive("accordionHeading", function () {
        return {
            restrict: "EA",
            transclude: !0,
            template: "",
            replace: !0,
            require: "^accordionGroup",
            link: function (scope, element, attr, accordionGroupCtrl, transclude) {
                accordionGroupCtrl.setHeading(transclude(scope, function () {
                }))
            }
        }
    }).directive("accordionTransclude", function () {
        return {
            require: "^accordionGroup", link: function (scope, element, attr, controller) {
                scope.$watch(function () {
                    return controller[attr.accordionTransclude]
                }, function (heading) {
                    heading && (element.html(""), element.append(heading))
                })
            }
        }
    }), angular.module("ui.bootstrap.alert", []).controller("AlertController", ["$scope", "$attrs", function ($scope, $attrs) {
        $scope.closeable = "close"in $attrs, this.close = $scope.close
    }]).directive("alert", function () {
        return {
            restrict: "EA",
            controller: "AlertController",
            templateUrl: "template/alert/alert.html",
            transclude: !0,
            replace: !0,
            scope: {type: "@", close: "&"}
        }
    }).directive("dismissOnTimeout", ["$timeout", function ($timeout) {
        return {
            require: "alert", link: function (scope, element, attrs, alertCtrl) {
                $timeout(function () {
                    alertCtrl.close()
                }, parseInt(attrs.dismissOnTimeout, 10))
            }
        }
    }]), angular.module("ui.bootstrap.bindHtml", []).directive("bindHtmlUnsafe", function () {
        return function (scope, element, attr) {
            element.addClass("ng-binding").data("$binding", attr.bindHtmlUnsafe), scope.$watch(attr.bindHtmlUnsafe, function (value) {
                element.html(value || "")
            })
        }
    }), angular.module("ui.bootstrap.buttons", []).constant("buttonConfig", {
        activeClass: "active",
        toggleEvent: "click"
    }).controller("ButtonsController", ["buttonConfig", function (buttonConfig) {
        this.activeClass = buttonConfig.activeClass || "active", this.toggleEvent = buttonConfig.toggleEvent || "click"
    }]).directive("btnRadio", function () {
        return {
            require: ["btnRadio", "ngModel"],
            controller: "ButtonsController",
            link: function (scope, element, attrs, ctrls) {
                var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];
                ngModelCtrl.$render = function () {
                    element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.btnRadio)))
                }, element.bind(buttonsCtrl.toggleEvent, function () {
                    var isActive = element.hasClass(buttonsCtrl.activeClass);
                    (!isActive || angular.isDefined(attrs.uncheckable)) && scope.$apply(function () {
                        ngModelCtrl.$setViewValue(isActive ? null : scope.$eval(attrs.btnRadio)), ngModelCtrl.$render()
                    })
                })
            }
        }
    }).directive("btnCheckbox", function () {
        return {
            require: ["btnCheckbox", "ngModel"],
            controller: "ButtonsController",
            link: function (scope, element, attrs, ctrls) {
                function getTrueValue() {
                    return getCheckboxValue(attrs.btnCheckboxTrue, !0)
                }

                function getFalseValue() {
                    return getCheckboxValue(attrs.btnCheckboxFalse, !1)
                }

                function getCheckboxValue(attributeValue, defaultValue) {
                    var val = scope.$eval(attributeValue);
                    return angular.isDefined(val) ? val : defaultValue
                }

                var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];
                ngModelCtrl.$render = function () {
                    element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()))
                }, element.bind(buttonsCtrl.toggleEvent, function () {
                    scope.$apply(function () {
                        ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue()), ngModelCtrl.$render()
                    })
                })
            }
        }
    }), angular.module("ui.bootstrap.carousel", ["ui.bootstrap.transition"]).controller("CarouselController", ["$scope", "$timeout", "$interval", "$transition", function ($scope, $timeout, $interval, $transition) {
        function restartTimer() {
            resetTimer();
            var interval = +$scope.interval;
            !isNaN(interval) && interval > 0 && (currentInterval = $interval(timerFn, interval))
        }

        function resetTimer() {
            currentInterval && ($interval.cancel(currentInterval), currentInterval = null)
        }

        function timerFn() {
            var interval = +$scope.interval;
            isPlaying && !isNaN(interval) && interval > 0 ? $scope.next() : $scope.pause()
        }

        var currentInterval, isPlaying, self = this, slides = self.slides = $scope.slides = [], currentIndex = -1;
        self.currentSlide = null;
        var destroyed = !1;
        self.select = $scope.select = function (nextSlide, direction) {
            function goNext() {
                if (!destroyed) {
                    if (self.currentSlide && angular.isString(direction) && !$scope.noTransition && nextSlide.$element) {
                        nextSlide.$element.addClass(direction);
                        {
                            nextSlide.$element[0].offsetWidth
                        }
                        angular.forEach(slides, function (slide) {
                            angular.extend(slide, {direction: "", entering: !1, leaving: !1, active: !1})
                        }), angular.extend(nextSlide, {
                            direction: direction,
                            active: !0,
                            entering: !0
                        }), angular.extend(self.currentSlide || {}, {
                            direction: direction,
                            leaving: !0
                        }), $scope.$currentTransition = $transition(nextSlide.$element, {}), function (next, current) {
                            $scope.$currentTransition.then(function () {
                                transitionDone(next, current)
                            }, function () {
                                transitionDone(next, current)
                            })
                        }(nextSlide, self.currentSlide)
                    } else transitionDone(nextSlide, self.currentSlide);
                    self.currentSlide = nextSlide, currentIndex = nextIndex, restartTimer()
                }
            }

            function transitionDone(next, current) {
                angular.extend(next, {
                    direction: "",
                    active: !0,
                    leaving: !1,
                    entering: !1
                }), angular.extend(current || {}, {
                    direction: "",
                    active: !1,
                    leaving: !1,
                    entering: !1
                }), $scope.$currentTransition = null
            }

            var nextIndex = slides.indexOf(nextSlide);
            void 0 === direction && (direction = nextIndex > currentIndex ? "next" : "prev"), nextSlide && nextSlide !== self.currentSlide && ($scope.$currentTransition ? ($scope.$currentTransition.cancel(), $timeout(goNext)) : goNext())
        }, $scope.$on("$destroy", function () {
            destroyed = !0
        }), self.indexOfSlide = function (slide) {
            return slides.indexOf(slide)
        }, $scope.next = function () {
            var newIndex = (currentIndex + 1) % slides.length;
            return $scope.$currentTransition ? void 0 : self.select(slides[newIndex], "next")
        }, $scope.prev = function () {
            var newIndex = 0 > currentIndex - 1 ? slides.length - 1 : currentIndex - 1;
            return $scope.$currentTransition ? void 0 : self.select(slides[newIndex], "prev")
        }, $scope.isActive = function (slide) {
            return self.currentSlide === slide
        }, $scope.$watch("interval", restartTimer), $scope.$on("$destroy", resetTimer), $scope.play = function () {
            isPlaying || (isPlaying = !0, restartTimer())
        }, $scope.pause = function () {
            $scope.noPause || (isPlaying = !1, resetTimer())
        }, self.addSlide = function (slide, element) {
            slide.$element = element, slides.push(slide), 1 === slides.length || slide.active ? (self.select(slides[slides.length - 1]), 1 == slides.length && $scope.play()) : slide.active = !1
        }, self.removeSlide = function (slide) {
            var index = slides.indexOf(slide);
            slides.splice(index, 1), slides.length > 0 && slide.active ? self.select(index >= slides.length ? slides[index - 1] : slides[index]) : currentIndex > index && currentIndex--
        }
    }]).directive("carousel", [function () {
        return {
            restrict: "EA",
            transclude: !0,
            replace: !0,
            controller: "CarouselController",
            require: "carousel",
            templateUrl: "template/carousel/carousel.html",
            scope: {interval: "=", noTransition: "=", noPause: "="}
        }
    }]).directive("slide", function () {
        return {
            require: "^carousel",
            restrict: "EA",
            transclude: !0,
            replace: !0,
            templateUrl: "template/carousel/slide.html",
            scope: {active: "=?"},
            link: function (scope, element, attrs, carouselCtrl) {
                carouselCtrl.addSlide(scope, element), scope.$on("$destroy", function () {
                    carouselCtrl.removeSlide(scope)
                }), scope.$watch("active", function (active) {
                    active && carouselCtrl.select(scope)
                })
            }
        }
    }), angular.module("ui.bootstrap.dateparser", []).service("dateParser", ["$locale", "orderByFilter", function ($locale, orderByFilter) {
        function createParser(format) {
            var map = [], regex = format.split("");
            return angular.forEach(formatCodeToRegex, function (data, code) {
                var index = format.indexOf(code);
                if (index > -1) {
                    format = format.split(""), regex[index] = "(" + data.regex + ")", format[index] = "$";
                    for (var i = index + 1, n = index + code.length; n > i; i++)regex[i] = "", format[i] = "$";
                    format = format.join(""), map.push({index: index, apply: data.apply})
                }
            }), {regex: new RegExp("^" + regex.join("") + "$"), map: orderByFilter(map, "index")}
        }

        function isValid(year, month, date) {
            return 1 === month && date > 28 ? 29 === date && (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) : 3 === month || 5 === month || 8 === month || 10 === month ? 31 > date : !0
        }

        this.parsers = {};
        var formatCodeToRegex = {
            yyyy: {
                regex: "\\d{4}", apply: function (value) {
                    this.year = +value
                }
            },
            yy: {
                regex: "\\d{2}", apply: function (value) {
                    this.year = +value + 2e3
                }
            },
            y: {
                regex: "\\d{1,4}", apply: function (value) {
                    this.year = +value
                }
            },
            MMMM: {
                regex: $locale.DATETIME_FORMATS.MONTH.join("|"), apply: function (value) {
                    this.month = $locale.DATETIME_FORMATS.MONTH.indexOf(value)
                }
            },
            MMM: {
                regex: $locale.DATETIME_FORMATS.SHORTMONTH.join("|"), apply: function (value) {
                    this.month = $locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value)
                }
            },
            MM: {
                regex: "0[1-9]|1[0-2]", apply: function (value) {
                    this.month = value - 1
                }
            },
            M: {
                regex: "[1-9]|1[0-2]", apply: function (value) {
                    this.month = value - 1
                }
            },
            dd: {
                regex: "[0-2][0-9]{1}|3[0-1]{1}", apply: function (value) {
                    this.date = +value
                }
            },
            d: {
                regex: "[1-2]?[0-9]{1}|3[0-1]{1}", apply: function (value) {
                    this.date = +value
                }
            },
            EEEE: {regex: $locale.DATETIME_FORMATS.DAY.join("|")},
            EEE: {regex: $locale.DATETIME_FORMATS.SHORTDAY.join("|")}
        };
        this.parse = function (input, format) {
            if (!angular.isString(input) || !format)return input;
            format = $locale.DATETIME_FORMATS[format] || format, this.parsers[format] || (this.parsers[format] = createParser(format));
            var parser = this.parsers[format], regex = parser.regex, map = parser.map, results = input.match(regex);
            if (results && results.length) {
                for (var dt, fields = {
                    year: 1900,
                    month: 0,
                    date: 1,
                    hours: 0
                }, i = 1, n = results.length; n > i; i++) {
                    var mapper = map[i - 1];
                    mapper.apply && mapper.apply.call(fields, results[i])
                }
                return isValid(fields.year, fields.month, fields.date) && (dt = new Date(fields.year, fields.month, fields.date, fields.hours)), dt
            }
        }
    }]), angular.module("ui.bootstrap.position", []).factory("$position", ["$document", "$window", function ($document, $window) {
        function getStyle(el, cssprop) {
            return el.currentStyle ? el.currentStyle[cssprop] : $window.getComputedStyle ? $window.getComputedStyle(el)[cssprop] : el.style[cssprop]
        }

        function isStaticPositioned(element) {
            return "static" === (getStyle(element, "position") || "static")
        }

        var parentOffsetEl = function (element) {
            for (var docDomEl = $document[0], offsetParent = element.offsetParent || docDomEl; offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent);)offsetParent = offsetParent.offsetParent;
            return offsetParent || docDomEl
        };
        return {
            position: function (element) {
                var elBCR = this.offset(element), offsetParentBCR = {
                    top: 0,
                    left: 0
                }, offsetParentEl = parentOffsetEl(element[0]);
                offsetParentEl != $document[0] && (offsetParentBCR = this.offset(angular.element(offsetParentEl)), offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop, offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft);
                var boundingClientRect = element[0].getBoundingClientRect();
                return {
                    width: boundingClientRect.width || element.prop("offsetWidth"),
                    height: boundingClientRect.height || element.prop("offsetHeight"),
                    top: elBCR.top - offsetParentBCR.top,
                    left: elBCR.left - offsetParentBCR.left
                }
            }, offset: function (element) {
                var boundingClientRect = element[0].getBoundingClientRect();
                return {
                    width: boundingClientRect.width || element.prop("offsetWidth"),
                    height: boundingClientRect.height || element.prop("offsetHeight"),
                    top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
                    left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
                }
            }, positionElements: function (hostEl, targetEl, positionStr, appendToBody) {
                var hostElPos, targetElWidth, targetElHeight, targetElPos, positionStrParts = positionStr.split("-"), pos0 = positionStrParts[0], pos1 = positionStrParts[1] || "center";
                hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl), targetElWidth = targetEl.prop("offsetWidth"), targetElHeight = targetEl.prop("offsetHeight");
                var shiftWidth = {
                    center: function () {
                        return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2
                    }, left: function () {
                        return hostElPos.left
                    }, right: function () {
                        return hostElPos.left + hostElPos.width
                    }
                }, shiftHeight = {
                    center: function () {
                        return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2
                    }, top: function () {
                        return hostElPos.top
                    }, bottom: function () {
                        return hostElPos.top + hostElPos.height
                    }
                };
                switch (pos0) {
                    case"right":
                        targetElPos = {top: shiftHeight[pos1](), left: shiftWidth[pos0]()};
                        break;
                    case"left":
                        targetElPos = {top: shiftHeight[pos1](), left: hostElPos.left - targetElWidth};
                        break;
                    case"bottom":
                        targetElPos = {top: shiftHeight[pos0](), left: shiftWidth[pos1]()};
                        break;
                    default:
                        targetElPos = {top: hostElPos.top - targetElHeight, left: shiftWidth[pos1]()}
                }
                return targetElPos
            }
        }
    }]), angular.module("ui.bootstrap.datepicker", ["ui.bootstrap.dateparser", "ui.bootstrap.position"]).constant("datepickerConfig", {
        formatDay: "dd",
        formatMonth: "MMMM",
        formatYear: "yyyy",
        formatDayHeader: "EEE",
        formatDayTitle: "MMMM yyyy",
        formatMonthTitle: "yyyy",
        datepickerMode: "day",
        minMode: "day",
        maxMode: "year",
        showWeeks: !0,
        startingDay: 0,
        yearRange: 20,
        minDate: null,
        maxDate: null
    }).controller("DatepickerController", ["$scope", "$attrs", "$parse", "$interpolate", "$timeout", "$log", "dateFilter", "datepickerConfig", function ($scope, $attrs, $parse, $interpolate, $timeout, $log, dateFilter, datepickerConfig) {
        var self = this, ngModelCtrl = {$setViewValue: angular.noop};
        this.modes = ["day", "month", "year"], angular.forEach(["formatDay", "formatMonth", "formatYear", "formatDayHeader", "formatDayTitle", "formatMonthTitle", "minMode", "maxMode", "showWeeks", "startingDay", "yearRange"], function (key, index) {
            self[key] = angular.isDefined($attrs[key]) ? 8 > index ? $interpolate($attrs[key])($scope.$parent) : $scope.$parent.$eval($attrs[key]) : datepickerConfig[key]
        }), angular.forEach(["minDate", "maxDate"], function (key) {
            $attrs[key] ? $scope.$parent.$watch($parse($attrs[key]), function (value) {
                self[key] = value ? new Date(value) : null, self.refreshView()
            }) : self[key] = datepickerConfig[key] ? new Date(datepickerConfig[key]) : null
        }), $scope.datepickerMode = $scope.datepickerMode || datepickerConfig.datepickerMode, $scope.uniqueId = "datepicker-" + $scope.$id + "-" + Math.floor(1e4 * Math.random()), this.activeDate = angular.isDefined($attrs.initDate) ? $scope.$parent.$eval($attrs.initDate) : new Date, $scope.isActive = function (dateObject) {
            return 0 === self.compare(dateObject.date, self.activeDate) ? ($scope.activeDateId = dateObject.uid, !0) : !1
        }, this.init = function (ngModelCtrl_) {
            ngModelCtrl = ngModelCtrl_, ngModelCtrl.$render = function () {
                self.render()
            }
        }, this.render = function () {
            if (ngModelCtrl.$modelValue) {
                var date = new Date(ngModelCtrl.$modelValue), isValid = !isNaN(date);
                isValid ? this.activeDate = date : $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.'), ngModelCtrl.$setValidity("date", isValid)
            }
            this.refreshView()
        }, this.refreshView = function () {
            if (this.element) {
                this._refreshView();
                var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
                ngModelCtrl.$setValidity("date-disabled", !date || this.element && !this.isDisabled(date))
            }
        }, this.createDateObject = function (date, format) {
            var model = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
            return {
                date: date,
                label: dateFilter(date, format),
                selected: model && 0 === this.compare(date, model),
                disabled: this.isDisabled(date),
                current: 0 === this.compare(date, new Date)
            }
        }, this.isDisabled = function (date) {
            return this.minDate && this.compare(date, this.minDate) < 0 || this.maxDate && this.compare(date, this.maxDate) > 0 || $attrs.dateDisabled && $scope.dateDisabled({
                    date: date,
                    mode: $scope.datepickerMode
                })
        }, this.split = function (arr, size) {
            for (var arrays = []; arr.length > 0;)arrays.push(arr.splice(0, size));
            return arrays
        }, $scope.select = function (date) {
            if ($scope.datepickerMode === self.minMode) {
                var dt = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0);
                dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate()), ngModelCtrl.$setViewValue(dt), ngModelCtrl.$render()
            } else self.activeDate = date, $scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) - 1]
        }, $scope.move = function (direction) {
            var year = self.activeDate.getFullYear() + direction * (self.step.years || 0), month = self.activeDate.getMonth() + direction * (self.step.months || 0);
            self.activeDate.setFullYear(year, month, 1), self.refreshView()
        }, $scope.toggleMode = function (direction) {
            direction = direction || 1, $scope.datepickerMode === self.maxMode && 1 === direction || $scope.datepickerMode === self.minMode && -1 === direction || ($scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) + direction])
        }, $scope.keys = {
            13: "enter",
            32: "space",
            33: "pageup",
            34: "pagedown",
            35: "end",
            36: "home",
            37: "left",
            38: "up",
            39: "right",
            40: "down"
        };
        var focusElement = function () {
            $timeout(function () {
                self.element[0].focus()
            }, 0, !1)
        };
        $scope.$on("datepicker.focus", focusElement), $scope.keydown = function (evt) {
            var key = $scope.keys[evt.which];
            if (key && !evt.shiftKey && !evt.altKey)if (evt.preventDefault(), evt.stopPropagation(), "enter" === key || "space" === key) {
                if (self.isDisabled(self.activeDate))return;
                $scope.select(self.activeDate), focusElement()
            } else!evt.ctrlKey || "up" !== key && "down" !== key ? (self.handleKeyDown(key, evt), self.refreshView()) : ($scope.toggleMode("up" === key ? 1 : -1), focusElement())
        }
    }]).directive("datepicker", function () {
        return {
            restrict: "EA",
            replace: !0,
            templateUrl: "template/datepicker/datepicker.html",
            scope: {datepickerMode: "=?", dateDisabled: "&"},
            require: ["datepicker", "?^ngModel"],
            controller: "DatepickerController",
            link: function (scope, element, attrs, ctrls) {
                var datepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];
                ngModelCtrl && datepickerCtrl.init(ngModelCtrl)
            }
        }
    }).directive("daypicker", ["dateFilter", function (dateFilter) {
        return {
            restrict: "EA",
            replace: !0,
            templateUrl: "template/datepicker/day.html",
            require: "^datepicker",
            link: function (scope, element, attrs, ctrl) {
                function getDaysInMonth(year, month) {
                    return 1 !== month || year % 4 !== 0 || year % 100 === 0 && year % 400 !== 0 ? DAYS_IN_MONTH[month] : 29
                }

                function getDates(startDate, n) {
                    var dates = new Array(n), current = new Date(startDate), i = 0;
                    for (current.setHours(12); n > i;)dates[i++] = new Date(current), current.setDate(current.getDate() + 1);
                    return dates
                }

                function getISO8601WeekNumber(date) {
                    var checkDate = new Date(date);
                    checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
                    var time = checkDate.getTime();
                    return checkDate.setMonth(0), checkDate.setDate(1), Math.floor(Math.round((time - checkDate) / 864e5) / 7) + 1
                }

                scope.showWeeks = ctrl.showWeeks, ctrl.step = {months: 1}, ctrl.element = element;
                var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                ctrl._refreshView = function () {
                    var year = ctrl.activeDate.getFullYear(), month = ctrl.activeDate.getMonth(), firstDayOfMonth = new Date(year, month, 1), difference = ctrl.startingDay - firstDayOfMonth.getDay(), numDisplayedFromPreviousMonth = difference > 0 ? 7 - difference : -difference, firstDate = new Date(firstDayOfMonth);
                    numDisplayedFromPreviousMonth > 0 && firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
                    for (var days = getDates(firstDate, 42), i = 0; 42 > i; i++)days[i] = angular.extend(ctrl.createDateObject(days[i], ctrl.formatDay), {
                        secondary: days[i].getMonth() !== month,
                        uid: scope.uniqueId + "-" + i
                    });
                    scope.labels = new Array(7);
                    for (var j = 0; 7 > j; j++)scope.labels[j] = {
                        abbr: dateFilter(days[j].date, ctrl.formatDayHeader),
                        full: dateFilter(days[j].date, "EEEE")
                    };
                    if (scope.title = dateFilter(ctrl.activeDate, ctrl.formatDayTitle), scope.rows = ctrl.split(days, 7), scope.showWeeks) {
                        scope.weekNumbers = [];
                        for (var weekNumber = getISO8601WeekNumber(scope.rows[0][0].date), numWeeks = scope.rows.length; scope.weekNumbers.push(weekNumber++) < numWeeks;);
                    }
                }, ctrl.compare = function (date1, date2) {
                    return new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate())
                }, ctrl.handleKeyDown = function (key) {
                    var date = ctrl.activeDate.getDate();
                    if ("left" === key)date -= 1; else if ("up" === key)date -= 7; else if ("right" === key)date += 1; else if ("down" === key)date += 7; else if ("pageup" === key || "pagedown" === key) {
                        var month = ctrl.activeDate.getMonth() + ("pageup" === key ? -1 : 1);
                        ctrl.activeDate.setMonth(month, 1), date = Math.min(getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth()), date)
                    } else"home" === key ? date = 1 : "end" === key && (date = getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth()));
                    ctrl.activeDate.setDate(date)
                }, ctrl.refreshView()
            }
        }
    }]).directive("monthpicker", ["dateFilter", function (dateFilter) {
        return {
            restrict: "EA",
            replace: !0,
            templateUrl: "template/datepicker/month.html",
            require: "^datepicker",
            link: function (scope, element, attrs, ctrl) {
                ctrl.step = {years: 1}, ctrl.element = element, ctrl._refreshView = function () {
                    for (var months = new Array(12), year = ctrl.activeDate.getFullYear(), i = 0; 12 > i; i++)months[i] = angular.extend(ctrl.createDateObject(new Date(year, i, 1), ctrl.formatMonth), {uid: scope.uniqueId + "-" + i});
                    scope.title = dateFilter(ctrl.activeDate, ctrl.formatMonthTitle), scope.rows = ctrl.split(months, 3)
                }, ctrl.compare = function (date1, date2) {
                    return new Date(date1.getFullYear(), date1.getMonth()) - new Date(date2.getFullYear(), date2.getMonth())
                }, ctrl.handleKeyDown = function (key) {
                    var date = ctrl.activeDate.getMonth();
                    if ("left" === key)date -= 1; else if ("up" === key)date -= 3; else if ("right" === key)date += 1; else if ("down" === key)date += 3; else if ("pageup" === key || "pagedown" === key) {
                        var year = ctrl.activeDate.getFullYear() + ("pageup" === key ? -1 : 1);
                        ctrl.activeDate.setFullYear(year)
                    } else"home" === key ? date = 0 : "end" === key && (date = 11);
                    ctrl.activeDate.setMonth(date)
                }, ctrl.refreshView()
            }
        }
    }]).directive("yearpicker", ["dateFilter", function () {
        return {
            restrict: "EA",
            replace: !0,
            templateUrl: "template/datepicker/year.html",
            require: "^datepicker",
            link: function (scope, element, attrs, ctrl) {
                function getStartingYear(year) {
                    return parseInt((year - 1) / range, 10) * range + 1
                }

                var range = ctrl.yearRange;
                ctrl.step = {years: range}, ctrl.element = element, ctrl._refreshView = function () {
                    for (var years = new Array(range), i = 0, start = getStartingYear(ctrl.activeDate.getFullYear()); range > i; i++)years[i] = angular.extend(ctrl.createDateObject(new Date(start + i, 0, 1), ctrl.formatYear), {uid: scope.uniqueId + "-" + i});
                    scope.title = [years[0].label, years[range - 1].label].join(" - "), scope.rows = ctrl.split(years, 5)
                }, ctrl.compare = function (date1, date2) {
                    return date1.getFullYear() - date2.getFullYear()
                }, ctrl.handleKeyDown = function (key) {
                    var date = ctrl.activeDate.getFullYear();
                    "left" === key ? date -= 1 : "up" === key ? date -= 5 : "right" === key ? date += 1 : "down" === key ? date += 5 : "pageup" === key || "pagedown" === key ? date += ("pageup" === key ? -1 : 1) * ctrl.step.years : "home" === key ? date = getStartingYear(ctrl.activeDate.getFullYear()) : "end" === key && (date = getStartingYear(ctrl.activeDate.getFullYear()) + range - 1), ctrl.activeDate.setFullYear(date)
                }, ctrl.refreshView()
            }
        }
    }]).constant("datepickerPopupConfig", {
        datepickerPopup: "yyyy-MM-dd",
        currentText: "Today",
        clearText: "Clear",
        closeText: "Done",
        closeOnDateSelection: !0,
        appendToBody: !1,
        showButtonBar: !0
    }).directive("datepickerPopup", ["$compile", "$parse", "$document", "$position", "dateFilter", "dateParser", "datepickerPopupConfig", function ($compile, $parse, $document, $position, dateFilter, dateParser, datepickerPopupConfig) {
        return {
            restrict: "EA",
            require: "ngModel",
            scope: {isOpen: "=?", currentText: "@", clearText: "@", closeText: "@", dateDisabled: "&"},
            link: function (scope, element, attrs, ngModel) {
                function cameltoDash(string) {
                    return string.replace(/([A-Z])/g, function ($1) {
                        return "-" + $1.toLowerCase()
                    })
                }

                function parseDate(viewValue) {
                    if (viewValue) {
                        if (angular.isDate(viewValue) && !isNaN(viewValue))return ngModel.$setValidity("date", !0), viewValue;
                        if (angular.isString(viewValue)) {
                            var date = dateParser.parse(viewValue, dateFormat) || new Date(viewValue);
                            return isNaN(date) ? void ngModel.$setValidity("date", !1) : (ngModel.$setValidity("date", !0), date)
                        }
                        return void ngModel.$setValidity("date", !1)
                    }
                    return ngModel.$setValidity("date", !0), null
                }

                var dateFormat, closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? scope.$parent.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection, appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? scope.$parent.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;
                scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? scope.$parent.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar, scope.getText = function (key) {
                    return scope[key + "Text"] || datepickerPopupConfig[key + "Text"]
                }, attrs.$observe("datepickerPopup", function (value) {
                    dateFormat = value || datepickerPopupConfig.datepickerPopup, ngModel.$render()
                });
                var popupEl = angular.element("<div datepicker-popup-wrap><div datepicker></div></div>");
                popupEl.attr({"ng-model": "date", "ng-change": "dateSelection()"});
                var datepickerEl = angular.element(popupEl.children()[0]);
                attrs.datepickerOptions && angular.forEach(scope.$parent.$eval(attrs.datepickerOptions), function (value, option) {
                    datepickerEl.attr(cameltoDash(option), value)
                }), scope.watchData = {}, angular.forEach(["minDate", "maxDate", "datepickerMode"], function (key) {
                    if (attrs[key]) {
                        var getAttribute = $parse(attrs[key]);
                        if (scope.$parent.$watch(getAttribute, function (value) {
                                scope.watchData[key] = value
                            }), datepickerEl.attr(cameltoDash(key), "watchData." + key), "datepickerMode" === key) {
                            var setAttribute = getAttribute.assign;
                            scope.$watch("watchData." + key, function (value, oldvalue) {
                                value !== oldvalue && setAttribute(scope.$parent, value)
                            })
                        }
                    }
                }), attrs.dateDisabled && datepickerEl.attr("date-disabled", "dateDisabled({ date: date, mode: mode })"), ngModel.$parsers.unshift(parseDate), scope.dateSelection = function (dt) {
                    angular.isDefined(dt) && (scope.date = dt), ngModel.$setViewValue(scope.date), ngModel.$render(), closeOnDateSelection && (scope.isOpen = !1, element[0].focus())
                }, element.bind("input change keyup", function () {
                    scope.$apply(function () {
                        scope.date = ngModel.$modelValue
                    })
                }), ngModel.$render = function () {
                    var date = ngModel.$viewValue ? dateFilter(ngModel.$viewValue, dateFormat) : "";
                    element.val(date), scope.date = parseDate(ngModel.$modelValue)
                };
                var documentClickBind = function (event) {
                    scope.isOpen && event.target !== element[0] && scope.$apply(function () {
                        scope.isOpen = !1
                    })
                }, keydown = function (evt) {
                    scope.keydown(evt)
                };
                element.bind("keydown", keydown), scope.keydown = function (evt) {
                    27 === evt.which ? (evt.preventDefault(), evt.stopPropagation(), scope.close()) : 40 !== evt.which || scope.isOpen || (scope.isOpen = !0)
                }, scope.$watch("isOpen", function (value) {
                    value ? (scope.$broadcast("datepicker.focus"), scope.position = appendToBody ? $position.offset(element) : $position.position(element), scope.position.top = scope.position.top + element.prop("offsetHeight"), $document.bind("click", documentClickBind)) : $document.unbind("click", documentClickBind)
                }), scope.select = function (date) {
                    if ("today" === date) {
                        var today = new Date;
                        angular.isDate(ngModel.$modelValue) ? (date = new Date(ngModel.$modelValue), date.setFullYear(today.getFullYear(), today.getMonth(), today.getDate())) : date = new Date(today.setHours(0, 0, 0, 0))
                    }
                    scope.dateSelection(date)
                }, scope.close = function () {
                    scope.isOpen = !1, element[0].focus()
                };
                var $popup = $compile(popupEl)(scope);
                popupEl.remove(), appendToBody ? $document.find("body").append($popup) : element.after($popup), scope.$on("$destroy", function () {
                    $popup.remove(), element.unbind("keydown", keydown), $document.unbind("click", documentClickBind)
                })
            }
        }
    }]).directive("datepickerPopupWrap", function () {
        return {
            restrict: "EA",
            replace: !0,
            transclude: !0,
            templateUrl: "template/datepicker/popup.html",
            link: function (scope, element) {
                element.bind("click", function (event) {
                    event.preventDefault(), event.stopPropagation()
                })
            }
        }
    }), angular.module("ui.bootstrap.dropdown", []).constant("dropdownConfig", {openClass: "open"}).service("dropdownService", ["$document", function ($document) {
        var openScope = null;
        this.open = function (dropdownScope) {
            openScope || ($document.bind("click", closeDropdown), $document.bind("keydown", escapeKeyBind)), openScope && openScope !== dropdownScope && (openScope.isOpen = !1), openScope = dropdownScope
        }, this.close = function (dropdownScope) {
            openScope === dropdownScope && (openScope = null, $document.unbind("click", closeDropdown), $document.unbind("keydown", escapeKeyBind))
        };
        var closeDropdown = function (evt) {
            if (openScope) {
                var toggleElement = openScope.getToggleElement();
                evt && toggleElement && toggleElement[0].contains(evt.target) || openScope.$apply(function () {
                    openScope.isOpen = !1
                })
            }
        }, escapeKeyBind = function (evt) {
            27 === evt.which && (openScope.focusToggleElement(), closeDropdown())
        }
    }]).controller("DropdownController", ["$scope", "$attrs", "$parse", "dropdownConfig", "dropdownService", "$animate", function ($scope, $attrs, $parse, dropdownConfig, dropdownService, $animate) {
        var getIsOpen, self = this, scope = $scope.$new(), openClass = dropdownConfig.openClass, setIsOpen = angular.noop, toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop;
        this.init = function (element) {
            self.$element = element, $attrs.isOpen && (getIsOpen = $parse($attrs.isOpen), setIsOpen = getIsOpen.assign, $scope.$watch(getIsOpen, function (value) {
                scope.isOpen = !!value
            }))
        }, this.toggle = function (open) {
            return scope.isOpen = arguments.length ? !!open : !scope.isOpen
        }, this.isOpen = function () {
            return scope.isOpen
        }, scope.getToggleElement = function () {
            return self.toggleElement
        }, scope.focusToggleElement = function () {
            self.toggleElement && self.toggleElement[0].focus()
        }, scope.$watch("isOpen", function (isOpen, wasOpen) {
            $animate[isOpen ? "addClass" : "removeClass"](self.$element, openClass), isOpen ? (scope.focusToggleElement(), dropdownService.open(scope)) : dropdownService.close(scope), setIsOpen($scope, isOpen), angular.isDefined(isOpen) && isOpen !== wasOpen && toggleInvoker($scope, {open: !!isOpen})
        }), $scope.$on("$locationChangeSuccess", function () {
            scope.isOpen = !1
        }), $scope.$on("$destroy", function () {
            scope.$destroy()
        })
    }]).directive("dropdown", function () {
        return {
            controller: "DropdownController", link: function (scope, element, attrs, dropdownCtrl) {
                dropdownCtrl.init(element)
            }
        }
    }).directive("dropdownToggle", function () {
        return {
            require: "?^dropdown", link: function (scope, element, attrs, dropdownCtrl) {
                if (dropdownCtrl) {
                    dropdownCtrl.toggleElement = element;
                    var toggleDropdown = function (event) {
                        event.preventDefault(), element.hasClass("disabled") || attrs.disabled || scope.$apply(function () {
                            dropdownCtrl.toggle()
                        })
                    };
                    element.bind("click", toggleDropdown), element.attr({
                        "aria-haspopup": !0,
                        "aria-expanded": !1
                    }), scope.$watch(dropdownCtrl.isOpen, function (isOpen) {
                        element.attr("aria-expanded", !!isOpen)
                    }), scope.$on("$destroy", function () {
                        element.unbind("click", toggleDropdown)
                    })
                }
            }
        }
    }), angular.module("ui.bootstrap.modal", ["ui.bootstrap.transition"]).factory("$$stackedMap", function () {
        return {
            createNew: function () {
                var stack = [];
                return {
                    add: function (key, value) {
                        stack.push({key: key, value: value})
                    }, get: function (key) {
                        for (var i = 0; i < stack.length; i++)if (key == stack[i].key)return stack[i]
                    }, keys: function () {
                        for (var keys = [], i = 0; i < stack.length; i++)keys.push(stack[i].key);
                        return keys
                    }, top: function () {
                        return stack[stack.length - 1]
                    }, remove: function (key) {
                        for (var idx = -1, i = 0; i < stack.length; i++)if (key == stack[i].key) {
                            idx = i;
                            break
                        }
                        return stack.splice(idx, 1)[0]
                    }, removeTop: function () {
                        return stack.splice(stack.length - 1, 1)[0]
                    }, length: function () {
                        return stack.length
                    }
                }
            }
        }
    }).directive("modalBackdrop", ["$timeout", function ($timeout) {
        return {
            restrict: "EA",
            replace: !0,
            templateUrl: "template/modal/backdrop.html",
            link: function (scope, element, attrs) {
                scope.backdropClass = attrs.backdropClass || "", scope.animate = !1, $timeout(function () {
                    scope.animate = !0
                })
            }
        }
    }]).directive("modalWindow", ["$modalStack", "$timeout", function ($modalStack, $timeout) {
        return {
            restrict: "EA",
            scope: {index: "@", animate: "="},
            replace: !0,
            transclude: !0,
            templateUrl: function (tElement, tAttrs) {
                return tAttrs.templateUrl || "template/modal/window.html"
            },
            link: function (scope, element, attrs) {
                element.addClass(attrs.windowClass || ""), scope.size = attrs.size, $timeout(function () {
                    scope.animate = !0, element[0].querySelectorAll("[autofocus]").length || element[0].focus()
                }), scope.close = function (evt) {
                    var modal = $modalStack.getTop();
                    modal && modal.value.backdrop && "static" != modal.value.backdrop && evt.target === evt.currentTarget && (evt.preventDefault(), evt.stopPropagation(), $modalStack.dismiss(modal.key, "backdrop click"))
                }
            }
        }
    }]).directive("modalTransclude", function () {
        return {
            link: function ($scope, $element, $attrs, controller, $transclude) {
                $transclude($scope.$parent, function (clone) {
                    $element.empty(), $element.append(clone)
                })
            }
        }
    }).factory("$modalStack", ["$transition", "$timeout", "$document", "$compile", "$rootScope", "$$stackedMap", function ($transition, $timeout, $document, $compile, $rootScope, $$stackedMap) {
        function backdropIndex() {
            for (var topBackdropIndex = -1, opened = openedWindows.keys(), i = 0; i < opened.length; i++)openedWindows.get(opened[i]).value.backdrop && (topBackdropIndex = i);
            return topBackdropIndex
        }

        function removeModalWindow(modalInstance) {
            var body = $document.find("body").eq(0), modalWindow = openedWindows.get(modalInstance).value;
            openedWindows.remove(modalInstance), removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, 300, function () {
                modalWindow.modalScope.$destroy(), body.toggleClass(OPENED_MODAL_CLASS, openedWindows.length() > 0), checkRemoveBackdrop()
            })
        }

        function checkRemoveBackdrop() {
            if (backdropDomEl && -1 == backdropIndex()) {
                var backdropScopeRef = backdropScope;
                removeAfterAnimate(backdropDomEl, backdropScope, 150, function () {
                    backdropScopeRef.$destroy(), backdropScopeRef = null
                }), backdropDomEl = void 0, backdropScope = void 0
            }
        }

        function removeAfterAnimate(domEl, scope, emulateTime, done) {
            function afterAnimating() {
                afterAnimating.done || (afterAnimating.done = !0, domEl.remove(), done && done())
            }

            scope.animate = !1;
            var transitionEndEventName = $transition.transitionEndEventName;
            if (transitionEndEventName) {
                var timeout = $timeout(afterAnimating, emulateTime);
                domEl.bind(transitionEndEventName, function () {
                    $timeout.cancel(timeout), afterAnimating(), scope.$apply()
                })
            } else $timeout(afterAnimating)
        }

        var backdropDomEl, backdropScope, OPENED_MODAL_CLASS = "modal-open", openedWindows = $$stackedMap.createNew(), $modalStack = {};
        return $rootScope.$watch(backdropIndex, function (newBackdropIndex) {
            backdropScope && (backdropScope.index = newBackdropIndex)
        }), $document.bind("keydown", function (evt) {
            var modal;
            27 === evt.which && (modal = openedWindows.top(), modal && modal.value.keyboard && (evt.preventDefault(), $rootScope.$apply(function () {
                $modalStack.dismiss(modal.key, "escape key press")
            })))
        }), $modalStack.open = function (modalInstance, modal) {
            openedWindows.add(modalInstance, {
                deferred: modal.deferred,
                modalScope: modal.scope,
                backdrop: modal.backdrop,
                keyboard: modal.keyboard
            });
            var body = $document.find("body").eq(0), currBackdropIndex = backdropIndex();
            if (currBackdropIndex >= 0 && !backdropDomEl) {
                backdropScope = $rootScope.$new(!0), backdropScope.index = currBackdropIndex;
                var angularBackgroundDomEl = angular.element("<div modal-backdrop></div>");
                angularBackgroundDomEl.attr("backdrop-class", modal.backdropClass), backdropDomEl = $compile(angularBackgroundDomEl)(backdropScope), body.append(backdropDomEl)
            }
            var angularDomEl = angular.element("<div modal-window></div>");
            angularDomEl.attr({
                "template-url": modal.windowTemplateUrl,
                "window-class": modal.windowClass,
                size: modal.size,
                index: openedWindows.length() - 1,
                animate: "animate"
            }).html(modal.content);
            var modalDomEl = $compile(angularDomEl)(modal.scope);
            openedWindows.top().value.modalDomEl = modalDomEl, body.append(modalDomEl), body.addClass(OPENED_MODAL_CLASS)
        }, $modalStack.close = function (modalInstance, result) {
            var modalWindow = openedWindows.get(modalInstance);
            modalWindow && (modalWindow.value.deferred.resolve(result), removeModalWindow(modalInstance))
        }, $modalStack.dismiss = function (modalInstance, reason) {
            var modalWindow = openedWindows.get(modalInstance);
            modalWindow && (modalWindow.value.deferred.reject(reason), removeModalWindow(modalInstance))
        }, $modalStack.dismissAll = function (reason) {
            for (var topModal = this.getTop(); topModal;)this.dismiss(topModal.key, reason), topModal = this.getTop()
        }, $modalStack.getTop = function () {
            return openedWindows.top()
        }, $modalStack
    }]).provider("$modal", function () {
        var $modalProvider = {
            options: {backdrop: !0, keyboard: !0},
            $get: ["$injector", "$rootScope", "$q", "$http", "$templateCache", "$controller", "$modalStack", function ($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {
                function getTemplatePromise(options) {
                    return options.template ? $q.when(options.template) : $http.get(angular.isFunction(options.templateUrl) ? options.templateUrl() : options.templateUrl, {cache: $templateCache}).then(function (result) {
                        return result.data
                    })
                }

                function getResolvePromises(resolves) {
                    var promisesArr = [];
                    return angular.forEach(resolves, function (value) {
                        (angular.isFunction(value) || angular.isArray(value)) && promisesArr.push($q.when($injector.invoke(value)))
                    }), promisesArr
                }

                var $modal = {};
                return $modal.open = function (modalOptions) {
                    var modalResultDeferred = $q.defer(), modalOpenedDeferred = $q.defer(), modalInstance = {
                        result: modalResultDeferred.promise,
                        opened: modalOpenedDeferred.promise,
                        close: function (result) {
                            $modalStack.close(modalInstance, result)
                        },
                        dismiss: function (reason) {
                            $modalStack.dismiss(modalInstance, reason)
                        }
                    };
                    if (modalOptions = angular.extend({}, $modalProvider.options, modalOptions), modalOptions.resolve = modalOptions.resolve || {}, !modalOptions.template && !modalOptions.templateUrl)throw new Error("One of template or templateUrl options is required.");
                    var templateAndResolvePromise = $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));
                    return templateAndResolvePromise.then(function (tplAndVars) {
                        var modalScope = (modalOptions.scope || $rootScope).$new();
                        modalScope.$close = modalInstance.close, modalScope.$dismiss = modalInstance.dismiss;
                        var ctrlInstance, ctrlLocals = {}, resolveIter = 1;
                        modalOptions.controller && (ctrlLocals.$scope = modalScope, ctrlLocals.$modalInstance = modalInstance, angular.forEach(modalOptions.resolve, function (value, key) {
                            ctrlLocals[key] = tplAndVars[resolveIter++]
                        }), ctrlInstance = $controller(modalOptions.controller, ctrlLocals), modalOptions.controllerAs && (modalScope[modalOptions.controllerAs] = ctrlInstance)), $modalStack.open(modalInstance, {
                            scope: modalScope,
                            deferred: modalResultDeferred,
                            content: tplAndVars[0],
                            backdrop: modalOptions.backdrop,
                            keyboard: modalOptions.keyboard,
                            backdropClass: modalOptions.backdropClass,
                            windowClass: modalOptions.windowClass,
                            windowTemplateUrl: modalOptions.windowTemplateUrl,
                            size: modalOptions.size
                        })
                    }, function (reason) {
                        modalResultDeferred.reject(reason)
                    }), templateAndResolvePromise.then(function () {
                        modalOpenedDeferred.resolve(!0)
                    }, function () {
                        modalOpenedDeferred.reject(!1)
                    }), modalInstance
                }, $modal
            }]
        };
        return $modalProvider
    }), angular.module("ui.bootstrap.pagination", []).controller("PaginationController", ["$scope", "$attrs", "$parse", function ($scope, $attrs, $parse) {
        var self = this, ngModelCtrl = {$setViewValue: angular.noop}, setNumPages = $attrs.numPages ? $parse($attrs.numPages).assign : angular.noop;
        this.init = function (ngModelCtrl_, config) {
            ngModelCtrl = ngModelCtrl_, this.config = config, ngModelCtrl.$render = function () {
                self.render()
            }, $attrs.itemsPerPage ? $scope.$parent.$watch($parse($attrs.itemsPerPage), function (value) {
                self.itemsPerPage = parseInt(value, 10), $scope.totalPages = self.calculateTotalPages()
            }) : this.itemsPerPage = config.itemsPerPage
        }, this.calculateTotalPages = function () {
            var totalPages = this.itemsPerPage < 1 ? 1 : Math.ceil($scope.totalItems / this.itemsPerPage);
            return Math.max(totalPages || 0, 1)
        }, this.render = function () {
            $scope.page = parseInt(ngModelCtrl.$viewValue, 10) || 1
        }, $scope.selectPage = function (page) {
            $scope.page !== page && page > 0 && page <= $scope.totalPages && (ngModelCtrl.$setViewValue(page), ngModelCtrl.$render())
        }, $scope.getText = function (key) {
            return $scope[key + "Text"] || self.config[key + "Text"]
        }, $scope.noPrevious = function () {
            return 1 === $scope.page
        }, $scope.noNext = function () {
            return $scope.page === $scope.totalPages
        }, $scope.$watch("totalItems", function () {
            $scope.totalPages = self.calculateTotalPages()
        }), $scope.$watch("totalPages", function (value) {
            setNumPages($scope.$parent, value), $scope.page > value ? $scope.selectPage(value) : ngModelCtrl.$render()
        })
    }]).constant("paginationConfig", {
        itemsPerPage: 10,
        boundaryLinks: !1,
        directionLinks: !0,
        firstText: "First",
        previousText: "Previous",
        nextText: "Next",
        lastText: "Last",
        rotate: !0
    }).directive("pagination", ["$parse", "paginationConfig", function ($parse, paginationConfig) {
        return {
            restrict: "EA",
            scope: {totalItems: "=", firstText: "@", previousText: "@", nextText: "@", lastText: "@"},
            require: ["pagination", "?ngModel"],
            controller: "PaginationController",
            templateUrl: "template/pagination/pagination.html",
            replace: !0,
            link: function (scope, element, attrs, ctrls) {
                function makePage(number, text, isActive) {
                    return {number: number, text: text, active: isActive}
                }

                function getPages(currentPage, totalPages) {
                    var pages = [], startPage = 1, endPage = totalPages, isMaxSized = angular.isDefined(maxSize) && totalPages > maxSize;
                    isMaxSized && (rotate ? (startPage = Math.max(currentPage - Math.floor(maxSize / 2), 1), endPage = startPage + maxSize - 1, endPage > totalPages && (endPage = totalPages, startPage = endPage - maxSize + 1)) : (startPage = (Math.ceil(currentPage / maxSize) - 1) * maxSize + 1, endPage = Math.min(startPage + maxSize - 1, totalPages)));
                    for (var number = startPage; endPage >= number; number++) {
                        var page = makePage(number, number, number === currentPage);
                        pages.push(page)
                    }
                    if (isMaxSized && !rotate) {
                        if (startPage > 1) {
                            var previousPageSet = makePage(startPage - 1, "...", !1);
                            pages.unshift(previousPageSet)
                        }
                        if (totalPages > endPage) {
                            var nextPageSet = makePage(endPage + 1, "...", !1);
                            pages.push(nextPageSet)
                        }
                    }
                    return pages
                }

                var paginationCtrl = ctrls[0], ngModelCtrl = ctrls[1];
                if (ngModelCtrl) {
                    var maxSize = angular.isDefined(attrs.maxSize) ? scope.$parent.$eval(attrs.maxSize) : paginationConfig.maxSize, rotate = angular.isDefined(attrs.rotate) ? scope.$parent.$eval(attrs.rotate) : paginationConfig.rotate;
                    scope.boundaryLinks = angular.isDefined(attrs.boundaryLinks) ? scope.$parent.$eval(attrs.boundaryLinks) : paginationConfig.boundaryLinks, scope.directionLinks = angular.isDefined(attrs.directionLinks) ? scope.$parent.$eval(attrs.directionLinks) : paginationConfig.directionLinks, paginationCtrl.init(ngModelCtrl, paginationConfig), attrs.maxSize && scope.$parent.$watch($parse(attrs.maxSize), function (value) {
                        maxSize = parseInt(value, 10), paginationCtrl.render()
                    });
                    var originalRender = paginationCtrl.render;
                    paginationCtrl.render = function () {
                        originalRender(), scope.page > 0 && scope.page <= scope.totalPages && (scope.pages = getPages(scope.page, scope.totalPages))
                    }
                }
            }
        }
    }]).constant("pagerConfig", {
        itemsPerPage: 10,
        previousText: "« Previous",
        nextText: "Next »",
        align: !0
    }).directive("pager", ["pagerConfig", function (pagerConfig) {
        return {
            restrict: "EA",
            scope: {totalItems: "=", previousText: "@", nextText: "@"},
            require: ["pager", "?ngModel"],
            controller: "PaginationController",
            templateUrl: "template/pagination/pager.html",
            replace: !0,
            link: function (scope, element, attrs, ctrls) {
                var paginationCtrl = ctrls[0], ngModelCtrl = ctrls[1];
                ngModelCtrl && (scope.align = angular.isDefined(attrs.align) ? scope.$parent.$eval(attrs.align) : pagerConfig.align, paginationCtrl.init(ngModelCtrl, pagerConfig))
            }
        }
    }]), angular.module("ui.bootstrap.tooltip", ["ui.bootstrap.position", "ui.bootstrap.bindHtml"]).provider("$tooltip", function () {
        function snake_case(name) {
            var regexp = /[A-Z]/g, separator = "-";
            return name.replace(regexp, function (letter, pos) {
                return (pos ? separator : "") + letter.toLowerCase()
            })
        }

        var defaultOptions = {placement: "top", animation: !0, popupDelay: 0}, triggerMap = {
            mouseenter: "mouseleave",
            click: "click",
            focus: "blur"
        }, globalOptions = {};
        this.options = function (value) {
            angular.extend(globalOptions, value)
        }, this.setTriggers = function (triggers) {
            angular.extend(triggerMap, triggers)
        }, this.$get = ["$window", "$compile", "$timeout", "$document", "$position", "$interpolate", function ($window, $compile, $timeout, $document, $position, $interpolate) {
            return function (type, prefix, defaultTriggerShow) {
                function getTriggers(trigger) {
                    var show = trigger || options.trigger || defaultTriggerShow, hide = triggerMap[show] || show;
                    return {show: show, hide: hide}
                }

                var options = angular.extend({}, defaultOptions, globalOptions), directiveName = snake_case(type), startSym = $interpolate.startSymbol(), endSym = $interpolate.endSymbol(), template = "<div " + directiveName + '-popup title="' + startSym + "title" + endSym + '" content="' + startSym + "content" + endSym + '" placement="' + startSym + "placement" + endSym + '" animation="animation" is-open="isOpen"></div>';
                return {
                    restrict: "EA", compile: function () {
                        var tooltipLinker = $compile(template);
                        return function (scope, element, attrs) {
                            function toggleTooltipBind() {
                                ttScope.isOpen ? hideTooltipBind() : showTooltipBind()
                            }

                            function showTooltipBind() {
                                (!hasEnableExp || scope.$eval(attrs[prefix + "Enable"])) && (prepareTooltip(), ttScope.popupDelay ? popupTimeout || (popupTimeout = $timeout(show, ttScope.popupDelay, !1), popupTimeout.then(function (reposition) {
                                    reposition()
                                })) : show()())
                            }

                            function hideTooltipBind() {
                                scope.$apply(function () {
                                    hide()
                                })
                            }

                            function show() {
                                return popupTimeout = null, transitionTimeout && ($timeout.cancel(transitionTimeout), transitionTimeout = null), ttScope.content ? (createTooltip(), tooltip.css({
                                    top: 0,
                                    left: 0,
                                    display: "block"
                                }), appendToBody ? $document.find("body").append(tooltip) : element.after(tooltip), positionTooltip(), ttScope.isOpen = !0, ttScope.$digest(), positionTooltip) : angular.noop
                            }

                            function hide() {
                                ttScope.isOpen = !1, $timeout.cancel(popupTimeout), popupTimeout = null, ttScope.animation ? transitionTimeout || (transitionTimeout = $timeout(removeTooltip, 500)) : removeTooltip()
                            }

                            function createTooltip() {
                                tooltip && removeTooltip(), tooltipLinkedScope = ttScope.$new(), tooltip = tooltipLinker(tooltipLinkedScope, angular.noop)
                            }

                            function removeTooltip() {
                                transitionTimeout = null, tooltip && (tooltip.remove(), tooltip = null), tooltipLinkedScope && (tooltipLinkedScope.$destroy(), tooltipLinkedScope = null)
                            }

                            function prepareTooltip() {
                                prepPlacement(), prepPopupDelay()
                            }

                            function prepPlacement() {
                                var val = attrs[prefix + "Placement"];
                                ttScope.placement = angular.isDefined(val) ? val : options.placement
                            }

                            function prepPopupDelay() {
                                var val = attrs[prefix + "PopupDelay"], delay = parseInt(val, 10);
                                ttScope.popupDelay = isNaN(delay) ? options.popupDelay : delay
                            }

                            function prepTriggers() {
                                var val = attrs[prefix + "Trigger"];
                                unregisterTriggers(), triggers = getTriggers(val), triggers.show === triggers.hide ? element.bind(triggers.show, toggleTooltipBind) : (element.bind(triggers.show, showTooltipBind), element.bind(triggers.hide, hideTooltipBind))
                            }

                            var tooltip, tooltipLinkedScope, transitionTimeout, popupTimeout, appendToBody = angular.isDefined(options.appendToBody) ? options.appendToBody : !1, triggers = getTriggers(void 0), hasEnableExp = angular.isDefined(attrs[prefix + "Enable"]), ttScope = scope.$new(!0), positionTooltip = function () {
                                var ttPosition = $position.positionElements(element, tooltip, ttScope.placement, appendToBody);
                                ttPosition.top += "px", ttPosition.left += "px", tooltip.css(ttPosition)
                            };
                            ttScope.isOpen = !1, attrs.$observe(type, function (val) {
                                ttScope.content = val, !val && ttScope.isOpen && hide()
                            }), attrs.$observe(prefix + "Title", function (val) {
                                ttScope.title = val
                            });
                            var unregisterTriggers = function () {
                                element.unbind(triggers.show, showTooltipBind), element.unbind(triggers.hide, hideTooltipBind)
                            };
                            prepTriggers();
                            var animation = scope.$eval(attrs[prefix + "Animation"]);
                            ttScope.animation = angular.isDefined(animation) ? !!animation : options.animation;
                            var appendToBodyVal = scope.$eval(attrs[prefix + "AppendToBody"]);
                            appendToBody = angular.isDefined(appendToBodyVal) ? appendToBodyVal : appendToBody, appendToBody && scope.$on("$locationChangeSuccess", function () {
                                ttScope.isOpen && hide()
                            }), scope.$on("$destroy", function () {
                                $timeout.cancel(transitionTimeout), $timeout.cancel(popupTimeout), unregisterTriggers(), removeTooltip(), ttScope = null
                            })
                        }
                    }
                }
            }
        }]
    }).directive("tooltipPopup", function () {
        return {
            restrict: "EA",
            replace: !0,
            scope: {content: "@", placement: "@", animation: "&", isOpen: "&"},
            templateUrl: "template/tooltip/tooltip-popup.html"
        }
    }).directive("tooltip", ["$tooltip", function ($tooltip) {
        return $tooltip("tooltip", "tooltip", "mouseenter")
    }]).directive("tooltipHtmlUnsafePopup", function () {
        return {
            restrict: "EA",
            replace: !0,
            scope: {content: "@", placement: "@", animation: "&", isOpen: "&"},
            templateUrl: "template/tooltip/tooltip-html-unsafe-popup.html"
        }
    }).directive("tooltipHtmlUnsafe", ["$tooltip", function ($tooltip) {
        return $tooltip("tooltipHtmlUnsafe", "tooltip", "mouseenter")
    }]), angular.module("ui.bootstrap.popover", ["ui.bootstrap.tooltip"]).directive("popoverPopup", function () {
        return {
            restrict: "EA",
            replace: !0,
            scope: {title: "@", content: "@", placement: "@", animation: "&", isOpen: "&"},
            templateUrl: "template/popover/popover.html"
        }
    }).directive("popover", ["$tooltip", function ($tooltip) {
        return $tooltip("popover", "popover", "click")
    }]), angular.module("ui.bootstrap.progressbar", []).constant("progressConfig", {
        animate: !0,
        max: 100
    }).controller("ProgressController", ["$scope", "$attrs", "progressConfig", function ($scope, $attrs, progressConfig) {
        var self = this, animate = angular.isDefined($attrs.animate) ? $scope.$parent.$eval($attrs.animate) : progressConfig.animate;
        this.bars = [], $scope.max = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : progressConfig.max, this.addBar = function (bar, element) {
            animate || element.css({transition: "none"}), this.bars.push(bar), bar.$watch("value", function (value) {
                bar.percent = +(100 * value / $scope.max).toFixed(2)
            }), bar.$on("$destroy", function () {
                element = null, self.removeBar(bar)
            })
        }, this.removeBar = function (bar) {
            this.bars.splice(this.bars.indexOf(bar), 1)
        }
    }]).directive("progress", function () {
        return {
            restrict: "EA",
            replace: !0,
            transclude: !0,
            controller: "ProgressController",
            require: "progress",
            scope: {},
            templateUrl: "template/progressbar/progress.html"
        }
    }).directive("bar", function () {
        return {
            restrict: "EA",
            replace: !0,
            transclude: !0,
            require: "^progress",
            scope: {value: "=", type: "@"},
            templateUrl: "template/progressbar/bar.html",
            link: function (scope, element, attrs, progressCtrl) {
                progressCtrl.addBar(scope, element)
            }
        }
    }).directive("progressbar", function () {
        return {
            restrict: "EA",
            replace: !0,
            transclude: !0,
            controller: "ProgressController",
            scope: {value: "=", type: "@"},
            templateUrl: "template/progressbar/progressbar.html",
            link: function (scope, element, attrs, progressCtrl) {
                progressCtrl.addBar(scope, angular.element(element.children()[0]))
            }
        }
    }), angular.module("ui.bootstrap.rating", []).constant("ratingConfig", {
        max: 5,
        stateOn: null,
        stateOff: null
    }).controller("RatingController", ["$scope", "$attrs", "ratingConfig", function ($scope, $attrs, ratingConfig) {
        var ngModelCtrl = {$setViewValue: angular.noop};
        this.init = function (ngModelCtrl_) {
            ngModelCtrl = ngModelCtrl_, ngModelCtrl.$render = this.render, this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn, this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;
            var ratingStates = angular.isDefined($attrs.ratingStates) ? $scope.$parent.$eval($attrs.ratingStates) : new Array(angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max);
            $scope.range = this.buildTemplateObjects(ratingStates)
        }, this.buildTemplateObjects = function (states) {
            for (var i = 0, n = states.length; n > i; i++)states[i] = angular.extend({index: i}, {
                stateOn: this.stateOn,
                stateOff: this.stateOff
            }, states[i]);
            return states
        }, $scope.rate = function (value) {
            !$scope.readonly && value >= 0 && value <= $scope.range.length && (ngModelCtrl.$setViewValue(value), ngModelCtrl.$render())
        }, $scope.enter = function (value) {
            $scope.readonly || ($scope.value = value), $scope.onHover({value: value})
        }, $scope.reset = function () {
            $scope.value = ngModelCtrl.$viewValue, $scope.onLeave()
        }, $scope.onKeydown = function (evt) {
            /(37|38|39|40)/.test(evt.which) && (evt.preventDefault(), evt.stopPropagation(), $scope.rate($scope.value + (38 === evt.which || 39 === evt.which ? 1 : -1)))
        }, this.render = function () {
            $scope.value = ngModelCtrl.$viewValue
        }
    }]).directive("rating", function () {
        return {
            restrict: "EA",
            require: ["rating", "ngModel"],
            scope: {readonly: "=?", onHover: "&", onLeave: "&"},
            controller: "RatingController",
            templateUrl: "template/rating/rating.html",
            replace: !0,
            link: function (scope, element, attrs, ctrls) {
                var ratingCtrl = ctrls[0], ngModelCtrl = ctrls[1];
                ngModelCtrl && ratingCtrl.init(ngModelCtrl)
            }
        }
    }), angular.module("ui.bootstrap.tabs", []).controller("TabsetController", ["$scope", function ($scope) {
        var ctrl = this, tabs = ctrl.tabs = $scope.tabs = [];
        ctrl.select = function (selectedTab) {
            angular.forEach(tabs, function (tab) {
                tab.active && tab !== selectedTab && (tab.active = !1, tab.onDeselect())
            }), selectedTab.active = !0, selectedTab.onSelect()
        }, ctrl.addTab = function (tab) {
            tabs.push(tab), 1 === tabs.length ? tab.active = !0 : tab.active && ctrl.select(tab)
        }, ctrl.removeTab = function (tab) {
            var index = tabs.indexOf(tab);
            if (tab.active && tabs.length > 1 && !destroyed) {
                var newActiveIndex = index == tabs.length - 1 ? index - 1 : index + 1;
                ctrl.select(tabs[newActiveIndex])
            }
            tabs.splice(index, 1)
        };
        var destroyed;
        $scope.$on("$destroy", function () {
            destroyed = !0
        })
    }]).directive("tabset", function () {
        return {
            restrict: "EA",
            transclude: !0,
            replace: !0,
            scope: {type: "@"},
            controller: "TabsetController",
            templateUrl: "template/tabs/tabset.html",
            link: function (scope, element, attrs) {
                scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : !1, scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : !1
            }
        }
    }).directive("tab", ["$parse", function ($parse) {
        return {
            require: "^tabset",
            restrict: "EA",
            replace: !0,
            templateUrl: "template/tabs/tab.html",
            transclude: !0,
            scope: {active: "=?", heading: "@", onSelect: "&select", onDeselect: "&deselect"},
            controller: function () {
            },
            compile: function (elm, attrs, transclude) {
                return function (scope, elm, attrs, tabsetCtrl) {
                    scope.$watch("active", function (active) {
                        active && tabsetCtrl.select(scope)
                    }), scope.disabled = !1, attrs.disabled && scope.$parent.$watch($parse(attrs.disabled), function (value) {
                        scope.disabled = !!value
                    }), scope.select = function () {
                        scope.disabled || (scope.active = !0)
                    }, tabsetCtrl.addTab(scope), scope.$on("$destroy", function () {
                        tabsetCtrl.removeTab(scope)
                    }), scope.$transcludeFn = transclude
                }
            }
        }
    }]).directive("tabHeadingTransclude", [function () {
        return {
            restrict: "A", require: "^tab", link: function (scope, elm) {
                scope.$watch("headingElement", function (heading) {
                    heading && (elm.html(""), elm.append(heading))
                })
            }
        }
    }]).directive("tabContentTransclude", function () {
        function isTabHeading(node) {
            return node.tagName && (node.hasAttribute("tab-heading") || node.hasAttribute("data-tab-heading") || "tab-heading" === node.tagName.toLowerCase() || "data-tab-heading" === node.tagName.toLowerCase())
        }

        return {
            restrict: "A", require: "^tabset", link: function (scope, elm, attrs) {
                var tab = scope.$eval(attrs.tabContentTransclude);
                tab.$transcludeFn(tab.$parent, function (contents) {
                    angular.forEach(contents, function (node) {
                        isTabHeading(node) ? tab.headingElement = node : elm.append(node)
                    })
                })
            }
        }
    }), angular.module("ui.bootstrap.timepicker", []).constant("timepickerConfig", {
        hourStep: 1,
        minuteStep: 1,
        showMeridian: !0,
        meridians: null,
        readonlyInput: !1,
        mousewheel: !0
    }).controller("TimepickerController", ["$scope", "$attrs", "$parse", "$log", "$locale", "timepickerConfig", function ($scope, $attrs, $parse, $log, $locale, timepickerConfig) {
        function getHoursFromTemplate() {
            var hours = parseInt($scope.hours, 10), valid = $scope.showMeridian ? hours > 0 && 13 > hours : hours >= 0 && 24 > hours;
            return valid ? ($scope.showMeridian && (12 === hours && (hours = 0), $scope.meridian === meridians[1] && (hours += 12)), hours) : void 0
        }

        function getMinutesFromTemplate() {
            var minutes = parseInt($scope.minutes, 10);
            return minutes >= 0 && 60 > minutes ? minutes : void 0
        }

        function pad(value) {
            return angular.isDefined(value) && value.toString().length < 2 ? "0" + value : value
        }

        function refresh(keyboardChange) {
            makeValid(), ngModelCtrl.$setViewValue(new Date(selected)), updateTemplate(keyboardChange)
        }

        function makeValid() {
            ngModelCtrl.$setValidity("time", !0), $scope.invalidHours = !1, $scope.invalidMinutes = !1
        }

        function updateTemplate(keyboardChange) {
            var hours = selected.getHours(), minutes = selected.getMinutes();
            $scope.showMeridian && (hours = 0 === hours || 12 === hours ? 12 : hours % 12), $scope.hours = "h" === keyboardChange ? hours : pad(hours), $scope.minutes = "m" === keyboardChange ? minutes : pad(minutes), $scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1]
        }

        function addMinutes(minutes) {
            var dt = new Date(selected.getTime() + 6e4 * minutes);
            selected.setHours(dt.getHours(), dt.getMinutes()), refresh()
        }

        var selected = new Date, ngModelCtrl = {$setViewValue: angular.noop}, meridians = angular.isDefined($attrs.meridians) ? $scope.$parent.$eval($attrs.meridians) : timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS;
        this.init = function (ngModelCtrl_, inputs) {
            ngModelCtrl = ngModelCtrl_, ngModelCtrl.$render = this.render;
            var hoursInputEl = inputs.eq(0), minutesInputEl = inputs.eq(1), mousewheel = angular.isDefined($attrs.mousewheel) ? $scope.$parent.$eval($attrs.mousewheel) : timepickerConfig.mousewheel;
            mousewheel && this.setupMousewheelEvents(hoursInputEl, minutesInputEl), $scope.readonlyInput = angular.isDefined($attrs.readonlyInput) ? $scope.$parent.$eval($attrs.readonlyInput) : timepickerConfig.readonlyInput, this.setupInputEvents(hoursInputEl, minutesInputEl)
        };
        var hourStep = timepickerConfig.hourStep;
        $attrs.hourStep && $scope.$parent.$watch($parse($attrs.hourStep), function (value) {
            hourStep = parseInt(value, 10)
        });
        var minuteStep = timepickerConfig.minuteStep;
        $attrs.minuteStep && $scope.$parent.$watch($parse($attrs.minuteStep), function (value) {
            minuteStep = parseInt(value, 10)
        }), $scope.showMeridian = timepickerConfig.showMeridian, $attrs.showMeridian && $scope.$parent.$watch($parse($attrs.showMeridian), function (value) {
            if ($scope.showMeridian = !!value, ngModelCtrl.$error.time) {
                var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
                angular.isDefined(hours) && angular.isDefined(minutes) && (selected.setHours(hours), refresh())
            } else updateTemplate()
        }), this.setupMousewheelEvents = function (hoursInputEl, minutesInputEl) {
            var isScrollingUp = function (e) {
                e.originalEvent && (e = e.originalEvent);
                var delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
                return e.detail || delta > 0
            };
            hoursInputEl.bind("mousewheel wheel", function (e) {
                $scope.$apply(isScrollingUp(e) ? $scope.incrementHours() : $scope.decrementHours()), e.preventDefault()
            }), minutesInputEl.bind("mousewheel wheel", function (e) {
                $scope.$apply(isScrollingUp(e) ? $scope.incrementMinutes() : $scope.decrementMinutes()), e.preventDefault()
            })
        }, this.setupInputEvents = function (hoursInputEl, minutesInputEl) {
            if ($scope.readonlyInput)return $scope.updateHours = angular.noop, void($scope.updateMinutes = angular.noop);
            var invalidate = function (invalidHours, invalidMinutes) {
                ngModelCtrl.$setViewValue(null), ngModelCtrl.$setValidity("time", !1), angular.isDefined(invalidHours) && ($scope.invalidHours = invalidHours), angular.isDefined(invalidMinutes) && ($scope.invalidMinutes = invalidMinutes)
            };
            $scope.updateHours = function () {
                var hours = getHoursFromTemplate();
                angular.isDefined(hours) ? (selected.setHours(hours), refresh("h")) : invalidate(!0)
            }, hoursInputEl.bind("blur", function () {
                !$scope.invalidHours && $scope.hours < 10 && $scope.$apply(function () {
                    $scope.hours = pad($scope.hours)
                })
            }), $scope.updateMinutes = function () {
                var minutes = getMinutesFromTemplate();
                angular.isDefined(minutes) ? (selected.setMinutes(minutes), refresh("m")) : invalidate(void 0, !0)
            }, minutesInputEl.bind("blur", function () {
                !$scope.invalidMinutes && $scope.minutes < 10 && $scope.$apply(function () {
                    $scope.minutes = pad($scope.minutes)
                })
            })
        }, this.render = function () {
            var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
            isNaN(date) ? (ngModelCtrl.$setValidity("time", !1), $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.')) : (date && (selected = date), makeValid(), updateTemplate())
        }, $scope.incrementHours = function () {
            addMinutes(60 * hourStep)
        }, $scope.decrementHours = function () {
            addMinutes(60 * -hourStep)
        }, $scope.incrementMinutes = function () {
            addMinutes(minuteStep)
        }, $scope.decrementMinutes = function () {
            addMinutes(-minuteStep)
        }, $scope.toggleMeridian = function () {
            addMinutes(720 * (selected.getHours() < 12 ? 1 : -1))
        }
    }]).directive("timepicker", function () {
        return {
            restrict: "EA",
            require: ["timepicker", "?^ngModel"],
            controller: "TimepickerController",
            replace: !0,
            scope: {},
            templateUrl: "template/timepicker/timepicker.html",
            link: function (scope, element, attrs, ctrls) {
                var timepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];
                ngModelCtrl && timepickerCtrl.init(ngModelCtrl, element.find("input"))
            }
        }
    }), angular.module("ui.bootstrap.typeahead", ["ui.bootstrap.position", "ui.bootstrap.bindHtml"]).factory("typeaheadParser", ["$parse", function ($parse) {
        var TYPEAHEAD_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;
        return {
            parse: function (input) {
                var match = input.match(TYPEAHEAD_REGEXP);
                if (!match)throw new Error('Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_" but got "' + input + '".');
                return {
                    itemName: match[3],
                    source: $parse(match[4]),
                    viewMapper: $parse(match[2] || match[1]),
                    modelMapper: $parse(match[1])
                }
            }
        }
    }]).directive("typeahead", ["$compile", "$parse", "$q", "$timeout", "$document", "$position", "typeaheadParser", function ($compile, $parse, $q, $timeout, $document, $position, typeaheadParser) {
        var HOT_KEYS = [9, 13, 27, 38, 40];
        return {
            require: "ngModel", link: function (originalScope, element, attrs, modelCtrl) {
                var hasFocus, minSearch = originalScope.$eval(attrs.typeaheadMinLength) || 1, waitTime = originalScope.$eval(attrs.typeaheadWaitMs) || 0, isEditable = originalScope.$eval(attrs.typeaheadEditable) !== !1, isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop, onSelectCallback = $parse(attrs.typeaheadOnSelect), inputFormatter = attrs.typeaheadInputFormatter ? $parse(attrs.typeaheadInputFormatter) : void 0, appendToBody = attrs.typeaheadAppendToBody ? originalScope.$eval(attrs.typeaheadAppendToBody) : !1, focusFirst = originalScope.$eval(attrs.typeaheadFocusFirst) !== !1, $setModelValue = $parse(attrs.ngModel).assign, parserResult = typeaheadParser.parse(attrs.typeahead), scope = originalScope.$new();
                originalScope.$on("$destroy", function () {
                    scope.$destroy()
                });
                var popupId = "typeahead-" + scope.$id + "-" + Math.floor(1e4 * Math.random());
                element.attr({"aria-autocomplete": "list", "aria-expanded": !1, "aria-owns": popupId});
                var popUpEl = angular.element("<div typeahead-popup></div>");
                popUpEl.attr({
                    id: popupId,
                    matches: "matches",
                    active: "activeIdx",
                    select: "select(activeIdx)",
                    query: "query",
                    position: "position"
                }), angular.isDefined(attrs.typeaheadTemplateUrl) && popUpEl.attr("template-url", attrs.typeaheadTemplateUrl);
                var resetMatches = function () {
                    scope.matches = [], scope.activeIdx = -1, element.attr("aria-expanded", !1)
                }, getMatchId = function (index) {
                    return popupId + "-option-" + index
                };
                scope.$watch("activeIdx", function (index) {
                    0 > index ? element.removeAttr("aria-activedescendant") : element.attr("aria-activedescendant", getMatchId(index))
                });
                var getMatchesAsync = function (inputValue) {
                    var locals = {$viewValue: inputValue};
                    isLoadingSetter(originalScope, !0), $q.when(parserResult.source(originalScope, locals)).then(function (matches) {
                        var onCurrentRequest = inputValue === modelCtrl.$viewValue;
                        if (onCurrentRequest && hasFocus)if (matches.length > 0) {
                            scope.activeIdx = focusFirst ? 0 : -1, scope.matches.length = 0;
                            for (var i = 0; i < matches.length; i++)locals[parserResult.itemName] = matches[i], scope.matches.push({
                                id: getMatchId(i),
                                label: parserResult.viewMapper(scope, locals),
                                model: matches[i]
                            });
                            scope.query = inputValue, scope.position = appendToBody ? $position.offset(element) : $position.position(element), scope.position.top = scope.position.top + element.prop("offsetHeight"), element.attr("aria-expanded", !0)
                        } else resetMatches();
                        onCurrentRequest && isLoadingSetter(originalScope, !1)
                    }, function () {
                        resetMatches(), isLoadingSetter(originalScope, !1)
                    })
                };
                resetMatches(), scope.query = void 0;
                var timeoutPromise, scheduleSearchWithTimeout = function (inputValue) {
                    timeoutPromise = $timeout(function () {
                        getMatchesAsync(inputValue)
                    }, waitTime)
                }, cancelPreviousTimeout = function () {
                    timeoutPromise && $timeout.cancel(timeoutPromise)
                };
                modelCtrl.$parsers.unshift(function (inputValue) {
                    return hasFocus = !0, inputValue && inputValue.length >= minSearch ? waitTime > 0 ? (cancelPreviousTimeout(), scheduleSearchWithTimeout(inputValue)) : getMatchesAsync(inputValue) : (isLoadingSetter(originalScope, !1), cancelPreviousTimeout(), resetMatches()), isEditable ? inputValue : inputValue ? void modelCtrl.$setValidity("editable", !1) : (modelCtrl.$setValidity("editable", !0), inputValue)
                }), modelCtrl.$formatters.push(function (modelValue) {
                    var candidateViewValue, emptyViewValue, locals = {};
                    return inputFormatter ? (locals.$model = modelValue, inputFormatter(originalScope, locals)) : (locals[parserResult.itemName] = modelValue, candidateViewValue = parserResult.viewMapper(originalScope, locals), locals[parserResult.itemName] = void 0, emptyViewValue = parserResult.viewMapper(originalScope, locals), candidateViewValue !== emptyViewValue ? candidateViewValue : modelValue)
                }), scope.select = function (activeIdx) {
                    var model, item, locals = {};
                    locals[parserResult.itemName] = item = scope.matches[activeIdx].model, model = parserResult.modelMapper(originalScope, locals), $setModelValue(originalScope, model), modelCtrl.$setValidity("editable", !0), onSelectCallback(originalScope, {
                        $item: item,
                        $model: model,
                        $label: parserResult.viewMapper(originalScope, locals)
                    }), resetMatches(), $timeout(function () {
                        element[0].focus()
                    }, 0, !1)
                }, element.bind("keydown", function (evt) {
                    0 !== scope.matches.length && -1 !== HOT_KEYS.indexOf(evt.which) && (-1 != scope.activeIdx || 13 !== evt.which && 9 !== evt.which) && (evt.preventDefault(), 40 === evt.which ? (scope.activeIdx = (scope.activeIdx + 1) % scope.matches.length, scope.$digest()) : 38 === evt.which ? (scope.activeIdx = (scope.activeIdx > 0 ? scope.activeIdx : scope.matches.length) - 1, scope.$digest()) : 13 === evt.which || 9 === evt.which ? scope.$apply(function () {
                        scope.select(scope.activeIdx)
                    }) : 27 === evt.which && (evt.stopPropagation(), resetMatches(), scope.$digest()))
                }), element.bind("blur", function () {
                    hasFocus = !1
                });
                var dismissClickHandler = function (evt) {
                    element[0] !== evt.target && (resetMatches(), scope.$digest())
                };
                $document.bind("click", dismissClickHandler), originalScope.$on("$destroy", function () {
                    $document.unbind("click", dismissClickHandler), appendToBody && $popup.remove()
                });
                var $popup = $compile(popUpEl)(scope);
                appendToBody ? $document.find("body").append($popup) : element.after($popup)
            }
        }
    }]).directive("typeaheadPopup", function () {
        return {
            restrict: "EA",
            scope: {matches: "=", query: "=", active: "=", position: "=", select: "&"},
            replace: !0,
            templateUrl: "template/typeahead/typeahead-popup.html",
            link: function (scope, element, attrs) {
                scope.templateUrl = attrs.templateUrl, scope.isOpen = function () {
                    return scope.matches.length > 0
                }, scope.isActive = function (matchIdx) {
                    return scope.active == matchIdx
                }, scope.selectActive = function (matchIdx) {
                    scope.active = matchIdx
                }, scope.selectMatch = function (activeIdx) {
                    scope.select({activeIdx: activeIdx})
                }
            }
        }
    }).directive("typeaheadMatch", ["$http", "$templateCache", "$compile", "$parse", function ($http, $templateCache, $compile, $parse) {
        return {
            restrict: "EA", scope: {index: "=", match: "=", query: "="}, link: function (scope, element, attrs) {
                var tplUrl = $parse(attrs.templateUrl)(scope.$parent) || "template/typeahead/typeahead-match.html";
                $http.get(tplUrl, {cache: $templateCache}).success(function (tplContent) {
                    element.replaceWith($compile(tplContent.trim())(scope))
                })
            }
        }
    }]).filter("typeaheadHighlight", function () {
        function escapeRegexp(queryToEscape) {
            return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")
        }

        return function (matchItem, query) {
            return query ? ("" + matchItem).replace(new RegExp(escapeRegexp(query), "gi"), "<strong>$&</strong>") : matchItem
        }
    }), angular.module("template/accordion/accordion-group.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/accordion/accordion-group.html", '<div class="panel panel-default">\n  <div class="panel-heading">\n    <h4 class="panel-title">\n      <a href class="accordion-toggle" ng-click="toggleOpen()" accordion-transclude="heading"><span ng-class="{\'text-muted\': isDisabled}">{{heading}}</span></a>\n    </h4>\n  </div>\n  <div class="panel-collapse" collapse="!isOpen">\n	  <div class="panel-body" ng-transclude></div>\n  </div>\n</div>\n')
    }]), angular.module("template/accordion/accordion.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/accordion/accordion.html", '<div class="panel-group" ng-transclude></div>')
    }]), angular.module("template/alert/alert.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/alert/alert.html", '<div class="alert" ng-class="[\'alert-\' + (type || \'warning\'), closeable ? \'alert-dismissable\' : null]" role="alert">\n    <button ng-show="closeable" type="button" class="close" ng-click="close()">\n        <span aria-hidden="true">&times;</span>\n        <span class="sr-only">Close</span>\n    </button>\n    <div ng-transclude></div>\n</div>\n')
    }]), angular.module("template/carousel/carousel.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/carousel/carousel.html", '<div ng-mouseenter="pause()" ng-mouseleave="play()" class="carousel" ng-swipe-right="prev()" ng-swipe-left="next()">\n    <ol class="carousel-indicators" ng-show="slides.length > 1">\n        <li ng-repeat="slide in slides track by $index" ng-class="{active: isActive(slide)}" ng-click="select(slide)"></li>\n    </ol>\n    <div class="carousel-inner" ng-transclude></div>\n    <a class="left carousel-control" ng-click="prev()" ng-show="slides.length > 1"><span class="glyphicon glyphicon-chevron-left"></span></a>\n    <a class="right carousel-control" ng-click="next()" ng-show="slides.length > 1"><span class="glyphicon glyphicon-chevron-right"></span></a>\n</div>\n')
    }]), angular.module("template/carousel/slide.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/carousel/slide.html", "<div ng-class=\"{\n    'active': leaving || (active && !entering),\n    'prev': (next || active) && direction=='prev',\n    'next': (next || active) && direction=='next',\n    'right': direction=='prev',\n    'left': direction=='next'\n  }\" class=\"item text-center\" ng-transclude></div>\n")
    }]), angular.module("template/datepicker/datepicker.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/datepicker/datepicker.html", '<div ng-switch="datepickerMode" role="application" ng-keydown="keydown($event)">\n  <daypicker ng-switch-when="day" tabindex="0"></daypicker>\n  <monthpicker ng-switch-when="month" tabindex="0"></monthpicker>\n  <yearpicker ng-switch-when="year" tabindex="0"></yearpicker>\n</div>')
    }]), angular.module("template/datepicker/day.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/datepicker/day.html", '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th colspan="{{5 + showWeeks}}"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n    <tr>\n      <th ng-show="showWeeks" class="text-center"></th>\n      <th ng-repeat="label in labels track by $index" class="text-center"><small aria-label="{{label.full}}">{{label.abbr}}</small></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-show="showWeeks" class="text-center h6"><em>{{ weekNumbers[$index] }}</em></td>\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default btn-sm" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-muted\': dt.secondary, \'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n')
    }]), angular.module("template/datepicker/month.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/datepicker/month.html", '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n')
    }]), angular.module("template/datepicker/popup.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/datepicker/popup.html", '<ul class="dropdown-menu" ng-style="{display: (isOpen && \'block\') || \'none\', top: position.top+\'px\', left: position.left+\'px\'}" ng-keydown="keydown($event)">\n	<li ng-transclude></li>\n	<li ng-if="showButtonBar" style="padding:10px 9px 2px">\n		<span class="btn-group pull-left">\n			<button type="button" class="btn btn-sm btn-info" ng-click="select(\'today\')">{{ getText(\'current\') }}</button>\n			<button type="button" class="btn btn-sm btn-danger" ng-click="select(null)">{{ getText(\'clear\') }}</button>\n		</span>\n		<button type="button" class="btn btn-sm btn-success pull-right" ng-click="close()">{{ getText(\'close\') }}</button>\n	</li>\n</ul>\n')
    }]), angular.module("template/datepicker/year.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/datepicker/year.html", '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th colspan="3"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n')
    }]), angular.module("template/modal/backdrop.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/modal/backdrop.html", '<div class="modal-backdrop fade {{ backdropClass }}"\n     ng-class="{in: animate}"\n     ng-style="{\'z-index\': 1040 + (index && 1 || 0) + index*10}"\n></div>\n')
    }]), angular.module("template/modal/window.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/modal/window.html", '<div tabindex="-1" role="dialog" class="modal fade" ng-class="{in: animate}" ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}" ng-click="close($event)">\n    <div class="modal-dialog" ng-class="{\'modal-sm\': size == \'sm\', \'modal-lg\': size == \'lg\'}"><div class="modal-content" modal-transclude></div></div>\n</div>')
    }]), angular.module("template/pagination/pager.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/pagination/pager.html", '<ul class="pager">\n  <li ng-class="{disabled: noPrevious(), previous: align}"><a href ng-click="selectPage(page - 1)">{{getText(\'previous\')}}</a></li>\n  <li ng-class="{disabled: noNext(), next: align}"><a href ng-click="selectPage(page + 1)">{{getText(\'next\')}}</a></li>\n</ul>')
    }]), angular.module("template/pagination/pagination.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/pagination/pagination.html", '<ul class="pagination">\n  <li ng-if="boundaryLinks" ng-class="{disabled: noPrevious()}"><a href ng-click="selectPage(1)">{{getText(\'first\')}}</a></li>\n  <li ng-if="directionLinks" ng-class="{disabled: noPrevious()}"><a href ng-click="selectPage(page - 1)">{{getText(\'previous\')}}</a></li>\n  <li ng-repeat="page in pages track by $index" ng-class="{active: page.active}"><a href ng-click="selectPage(page.number)">{{page.text}}</a></li>\n  <li ng-if="directionLinks" ng-class="{disabled: noNext()}"><a href ng-click="selectPage(page + 1)">{{getText(\'next\')}}</a></li>\n  <li ng-if="boundaryLinks" ng-class="{disabled: noNext()}"><a href ng-click="selectPage(totalPages)">{{getText(\'last\')}}</a></li>\n</ul>')
    }]), angular.module("template/tooltip/tooltip-html-unsafe-popup.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/tooltip/tooltip-html-unsafe-popup.html", '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" bind-html-unsafe="content"></div>\n</div>\n')
    }]), angular.module("template/tooltip/tooltip-popup.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/tooltip/tooltip-popup.html", '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" ng-bind="content"></div>\n</div>\n')
    }]), angular.module("template/popover/popover.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/popover/popover.html", '<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="arrow"></div>\n\n  <div class="popover-inner">\n      <h3 class="popover-title" ng-bind="title" ng-show="title"></h3>\n      <div class="popover-content" ng-bind="content"></div>\n  </div>\n</div>\n')
    }]), angular.module("template/progressbar/bar.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/progressbar/bar.html", '<div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: percent + \'%\'}" aria-valuetext="{{percent | number:0}}%" ng-transclude></div>')
    }]), angular.module("template/progressbar/progress.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/progressbar/progress.html", '<div class="progress" ng-transclude></div>')
    }]), angular.module("template/progressbar/progressbar.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/progressbar/progressbar.html", '<div class="progress">\n  <div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: percent + \'%\'}" aria-valuetext="{{percent | number:0}}%" ng-transclude></div>\n</div>')
    }]), angular.module("template/rating/rating.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/rating/rating.html", '<span ng-mouseleave="reset()" ng-keydown="onKeydown($event)" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="{{range.length}}" aria-valuenow="{{value}}">\n    <i ng-repeat="r in range track by $index" ng-mouseenter="enter($index + 1)" ng-click="rate($index + 1)" class="glyphicon" ng-class="$index < value && (r.stateOn || \'glyphicon-star\') || (r.stateOff || \'glyphicon-star-empty\')">\n        <span class="sr-only">({{ $index < value ? \'*\' : \' \' }})</span>\n    </i>\n</span>')
    }]), angular.module("template/tabs/tab.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/tabs/tab.html", '<li ng-class="{active: active, disabled: disabled}">\n  <a href ng-click="select()" tab-heading-transclude>{{heading}}</a>\n</li>\n')
    }]), angular.module("template/tabs/tabset.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/tabs/tabset.html", '<div>\n  <ul class="nav nav-{{type || \'tabs\'}}" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}" ng-transclude></ul>\n  <div class="tab-content">\n    <div class="tab-pane" \n         ng-repeat="tab in tabs" \n         ng-class="{active: tab.active}"\n         tab-content-transclude="tab">\n    </div>\n  </div>\n</div>\n')
    }]), angular.module("template/timepicker/timepicker.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/timepicker/timepicker.html", '<table>\n	<tbody>\n		<tr class="text-center">\n			<td><a ng-click="incrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n			<td>&nbsp;</td>\n			<td><a ng-click="incrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n			<td ng-show="showMeridian"></td>\n		</tr>\n		<tr>\n			<td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidHours}">\n				<input type="text" ng-model="hours" ng-change="updateHours()" class="form-control text-center" ng-mousewheel="incrementHours()" ng-readonly="readonlyInput" maxlength="2">\n			</td>\n			<td>:</td>\n			<td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidMinutes}">\n				<input type="text" ng-model="minutes" ng-change="updateMinutes()" class="form-control text-center" ng-readonly="readonlyInput" maxlength="2">\n			</td>\n			<td ng-show="showMeridian"><button type="button" class="btn btn-default text-center" ng-click="toggleMeridian()">{{meridian}}</button></td>\n		</tr>\n		<tr class="text-center">\n			<td><a ng-click="decrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n			<td>&nbsp;</td>\n			<td><a ng-click="decrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n			<td ng-show="showMeridian"></td>\n		</tr>\n	</tbody>\n</table>\n')
    }]), angular.module("template/typeahead/typeahead-match.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/typeahead/typeahead-match.html", '<a tabindex="-1" bind-html-unsafe="match.label | typeaheadHighlight:query"></a>')
    }]), angular.module("template/typeahead/typeahead-popup.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/typeahead/typeahead-popup.html", '<ul class="dropdown-menu" ng-show="isOpen()" ng-style="{top: position.top+\'px\', left: position.left+\'px\'}" style="display: block;" role="listbox" aria-hidden="{{!isOpen()}}">\n    <li ng-repeat="match in matches track by $index" ng-class="{active: isActive($index) }" ng-mouseenter="selectActive($index)" ng-click="selectMatch($index)" role="option" id="{{match.id}}">\n        <div typeahead-match index="$index" match="match" query="query" template-url="templateUrl"></div>\n    </li>\n</ul>\n')
    }]), define("ui-bootstrap", ["angular"], function () {
    }), function (window, angular) {
        angular.module("satellizer", []).constant("satellizer.config", {
            httpInterceptor: !0,
            loginOnSignup: !0,
            loginRedirect: "/",
            logoutRedirect: "/",
            signupRedirect: "/login",
            loginUrl: "/auth/login",
            signupUrl: "/auth/signup",
            loginRoute: "/login",
            signupRoute: "/signup",
            tokenName: "token",
            tokenPrefix: "satellizer",
            unlinkUrl: "/auth/unlink/",
            authHeader: "Authorization",
            providers: {
                google: {
                    url: "/auth/google",
                    authorizationEndpoint: "https://accounts.google.com/o/oauth2/auth",
                    redirectUri: window.location.origin || window.location.protocol + "//" + window.location.host,
                    scope: ["profile", "email"],
                    scopePrefix: "openid",
                    scopeDelimiter: " ",
                    requiredUrlParams: ["scope"],
                    optionalUrlParams: ["display"],
                    display: "popup",
                    type: "2.0",
                    popupOptions: {width: 452, height: 633}
                },
                facebook: {
                    url: "/auth/facebook",
                    authorizationEndpoint: "https://www.facebook.com/dialog/oauth",
                    redirectUri: window.location.origin + "/" || window.location.protocol + "//" + window.location.host + "/",
                    scope: ["email"],
                    scopeDelimiter: ",",
                    requiredUrlParams: ["display", "scope"],
                    display: "popup",
                    type: "2.0",
                    popupOptions: {width: 580, height: 400}
                },
                linkedin: {
                    url: "/auth/linkedin",
                    authorizationEndpoint: "https://www.linkedin.com/uas/oauth2/authorization",
                    redirectUri: window.location.origin || window.location.protocol + "//" + window.location.host,
                    requiredUrlParams: ["state"],
                    scope: ["r_emailaddress"],
                    scopeDelimiter: " ",
                    state: "STATE",
                    type: "2.0",
                    popupOptions: {width: 527, height: 582}
                },
                github: {
                    url: "/auth/github",
                    authorizationEndpoint: "https://github.com/login/oauth/authorize",
                    redirectUri: window.location.origin || window.location.protocol + "//" + window.location.host,
                    scope: [],
                    scopeDelimiter: " ",
                    type: "2.0",
                    popupOptions: {width: 1020, height: 618}
                },
                yahoo: {
                    url: "/auth/yahoo",
                    authorizationEndpoint: "https://api.login.yahoo.com/oauth2/request_auth",
                    redirectUri: window.location.origin || window.location.protocol + "//" + window.location.host,
                    scope: [],
                    scopeDelimiter: ",",
                    type: "2.0",
                    popupOptions: {width: 559, height: 519}
                },
                twitter: {url: "/auth/twitter", type: "1.0", popupOptions: {width: 495, height: 645}},
                live: {
                    url: "/auth/live",
                    authorizationEndpoint: "https://login.live.com/oauth20_authorize.srf",
                    redirectUri: window.location.origin || window.location.protocol + "//" + window.location.host,
                    scope: ["wl.basic"],
                    scopeDelimiter: " ",
                    requiredUrlParams: ["display", "scope"],
                    display: "popup",
                    type: "2.0",
                    popupOptions: {width: 500, height: 560}
                }
            }
        }).provider("$auth", ["satellizer.config", function (config) {
            Object.defineProperties(this, {
                logoutRedirect: {
                    get: function () {
                        return config.logoutRedirect
                    }, set: function (value) {
                        config.logoutRedirect = value
                    }
                }, loginRedirect: {
                    set: function (value) {
                        config.loginRedirect = value
                    }, get: function () {
                        return config.loginRedirect
                    }
                }, signupRedirect: {
                    get: function () {
                        return config.signupRedirect
                    }, set: function (value) {
                        config.signupRedirect = value
                    }
                }, loginOnSignup: {
                    get: function () {
                        return config.loginOnSignup
                    }, set: function (value) {
                        config.loginOnSignup = value
                    }
                }, loginUrl: {
                    get: function () {
                        return config.loginUrl
                    }, set: function (value) {
                        config.loginUrl = value
                    }
                }, signupUrl: {
                    get: function () {
                        return config.signupUrl
                    }, set: function (value) {
                        config.signupUrl = value
                    }
                }, loginRoute: {
                    get: function () {
                        return config.loginRoute
                    }, set: function (value) {
                        config.loginRoute = value
                    }
                }, signupRoute: {
                    get: function () {
                        return config.signupRoute
                    }, set: function (value) {
                        config.signupRoute = value
                    }
                }, tokenName: {
                    get: function () {
                        return config.tokenName
                    }, set: function (value) {
                        config.tokenName = value
                    }
                }, tokenPrefix: {
                    get: function () {
                        return config.tokenPrefix
                    }, set: function (value) {
                        config.tokenPrefix = value
                    }
                }, unlinkUrl: {
                    get: function () {
                        return config.unlinkUrl
                    }, set: function (value) {
                        config.unlinkUrl = value
                    }
                }, authHeader: {
                    get: function () {
                        return config.authHeader
                    }, set: function (value) {
                        config.authHeader = value
                    }
                }
            }), angular.forEach(Object.keys(config.providers), function (provider) {
                this[provider] = function (params) {
                    return angular.extend(config.providers[provider], params)
                }
            }, this);
            var oauth = function (params) {
                config.providers[params.name] = config.providers[params.name] || {}, angular.extend(config.providers[params.name], params)
            };
            this.oauth1 = function (params) {
                oauth(params), config.providers[params.name].type = "1.0"
            }, this.oauth2 = function (params) {
                oauth(params), config.providers[params.name].type = "2.0"
            }, this.$get = ["$q", "satellizer.shared", "satellizer.local", "satellizer.oauth", function ($q, shared, local, oauth) {
                var $auth = {};
                return $auth.authenticate = function (name, userData) {
                    return oauth.authenticate(name, !1, userData)
                }, $auth.login = function (user) {
                    return local.login(user)
                }, $auth.signup = function (user) {
                    return local.signup(user)
                }, $auth.logout = function () {
                    return shared.logout()
                }, $auth.isAuthenticated = function () {
                    return shared.isAuthenticated()
                }, $auth.link = function (name, userData) {
                    return oauth.authenticate(name, !0, userData)
                }, $auth.unlink = function (provider) {
                    return oauth.unlink(provider)
                }, $auth.getToken = function () {
                    return shared.getToken()
                }, $auth.setToken = function (token, isLinking) {
                    shared.setToken({access_token: token}, isLinking)
                }, $auth.removeToken = function () {
                    return shared.removeToken()
                }, $auth.getPayload = function () {
                    return shared.getPayload()
                }, $auth
            }]
        }]).factory("satellizer.shared", ["$q", "$window", "$location", "satellizer.config", function ($q, $window, $location, config) {
            var shared = {};
            return shared.getToken = function () {
                var tokenName = config.tokenPrefix ? config.tokenPrefix + "_" + config.tokenName : config.tokenName;
                return $window.localStorage[tokenName]
            }, shared.getPayload = function () {
                var tokenName = config.tokenPrefix ? config.tokenPrefix + "_" + config.tokenName : config.tokenName, token = $window.localStorage[tokenName];
                if (token && 3 === token.split(".").length) {
                    var base64Url = token.split(".")[1], base64 = base64Url.replace("-", "+").replace("_", "/");
                    return JSON.parse($window.atob(base64))
                }
            }, shared.setToken = function (response, isLinking) {
                var token = response.access_token || response.data[config.tokenName], tokenName = config.tokenPrefix ? config.tokenPrefix + "_" + config.tokenName : config.tokenName;
                if (!token)throw new Error('Expecting a token named "' + config.tokenName + '" but instead got: ' + JSON.stringify(response.data));
                $window.localStorage[tokenName] = token, config.loginRedirect && !isLinking && $location.path(config.loginRedirect)
            }, shared.removeToken = function () {
                var tokenName = config.tokenPrefix ? config.tokenPrefix + "_" + config.tokenName : config.tokenName;
                delete $window.localStorage[tokenName]
            }, shared.isAuthenticated = function () {
                var tokenName = config.tokenPrefix ? config.tokenPrefix + "_" + config.tokenName : config.tokenName, token = $window.localStorage[tokenName];
                if (token) {
                    if (3 === token.split(".").length) {
                        var base64Url = token.split(".")[1], base64 = base64Url.replace("-", "+").replace("_", "/"), exp = JSON.parse($window.atob(base64)).exp;
                        return Math.round((new Date).getTime() / 1e3) <= exp
                    }
                    return !0
                }
                return !1
            }, shared.logout = function () {
                var tokenName = config.tokenPrefix ? config.tokenPrefix + "_" + config.tokenName : config.tokenName;
                return delete $window.localStorage[tokenName], config.logoutRedirect && $location.path(config.logoutRedirect), $q.when()
            }, shared
        }]).factory("satellizer.oauth", ["$q", "$http", "satellizer.config", "satellizer.shared", "satellizer.Oauth1", "satellizer.Oauth2", function ($q, $http, config, shared, Oauth1, Oauth2) {
            var oauth = {};
            return oauth.authenticate = function (name, isLinking, userData) {
                var provider = "1.0" === config.providers[name].type ? new Oauth1 : new Oauth2;
                return provider.open(config.providers[name], userData || {}).then(function (response) {
                    return shared.setToken(response, isLinking), response
                })
            }, oauth.unlink = function (provider) {
                return $http.get(config.unlinkUrl + provider)
            }, oauth
        }]).factory("satellizer.local", ["$q", "$http", "$location", "satellizer.utils", "satellizer.shared", "satellizer.config", function ($q, $http, $location, utils, shared, config) {
            var local = {};
            return local.login = function (user) {
                return $http.post(config.loginUrl, user).then(function (response) {
                    return shared.setToken(response), response
                })
            }, local.signup = function (user) {
                return $http.post(config.signupUrl, user).then(function (response) {
                    return config.loginOnSignup ? shared.setToken(response) : config.signupRedirect && $location.path(config.signupRedirect), response
                })
            }, local
        }]).factory("satellizer.Oauth2", ["$q", "$http", "satellizer.popup", "satellizer.utils", "satellizer.config", function ($q, $http, popup, utils) {
            return function () {
                var defaults = {
                    url: null,
                    name: null,
                    scope: null,
                    scopeDelimiter: null,
                    clientId: null,
                    redirectUri: null,
                    popupOptions: null,
                    authorizationEndpoint: null,
                    requiredUrlParams: null,
                    optionalUrlParams: null,
                    defaultUrlParams: ["response_type", "client_id", "redirect_uri"],
                    responseType: "code"
                }, oauth2 = {};
                return oauth2.open = function (options, userData) {
                    angular.extend(defaults, options);
                    var url = oauth2.buildUrl();
                    return popup.open(url, defaults.popupOptions).then(function (oauthData) {
                        return "token" === defaults.responseType ? oauthData : oauth2.exchangeForToken(oauthData, userData)
                    })
                }, oauth2.exchangeForToken = function (oauthData, userData) {
                    var data = angular.extend({}, userData, {
                        code: oauthData.code,
                        clientId: defaults.clientId,
                        redirectUri: defaults.redirectUri
                    });
                    return $http.post(defaults.url, data, {withCredentials: !0})
                }, oauth2.buildUrl = function () {
                    var baseUrl = defaults.authorizationEndpoint, qs = oauth2.buildQueryString();
                    return [baseUrl, qs].join("?")
                }, oauth2.buildQueryString = function () {
                    var keyValuePairs = [], urlParams = ["defaultUrlParams", "requiredUrlParams", "optionalUrlParams"];
                    return angular.forEach(urlParams, function (params) {
                        angular.forEach(defaults[params], function (paramName) {
                            var camelizedName = utils.camelCase(paramName), paramValue = defaults[camelizedName];
                            "scope" === paramName && Array.isArray(paramValue) && (paramValue = paramValue.join(defaults.scopeDelimiter), defaults.scopePrefix && (paramValue = [defaults.scopePrefix, paramValue].join(defaults.scopeDelimiter))), keyValuePairs.push([paramName, paramValue])
                        })
                    }), keyValuePairs.map(function (pair) {
                        return pair.join("=")
                    }).join("&")
                }, oauth2
            }
        }]).factory("satellizer.Oauth1", ["$q", "$http", "satellizer.popup", function ($q, $http, popup) {
            return function () {
                var defaults = {url: null, name: null, popupOptions: null}, oauth1 = {};
                return oauth1.open = function (options, userData) {
                    return angular.extend(defaults, options), popup.open(defaults.url, defaults.popupOptions).then(function (response) {
                        return oauth1.exchangeForToken(response, userData)
                    })
                }, oauth1.exchangeForToken = function (oauthData, userData) {
                    var data = angular.extend({}, userData, oauthData), qs = oauth1.buildQueryString(data);
                    return $http.get(defaults.url + "?" + qs)
                }, oauth1.buildQueryString = function (obj) {
                    var str = [];
                    return angular.forEach(obj, function (value, key) {
                        str.push(encodeURIComponent(key) + "=" + encodeURIComponent(value))
                    }), str.join("&")
                }, oauth1
            }
        }]).factory("satellizer.popup", ["$q", "$interval", "$window", "$location", "satellizer.utils", function ($q, $interval, $window, $location, utils) {
            var popupWindow = null, polling = null, popup = {};
            return popup.popupWindow = popupWindow, popup.open = function (url, options) {
                var optionsString = popup.stringifyOptions(popup.prepareOptions(options || {}));
                return popupWindow = window.open(url, "_blank", optionsString), popupWindow && popupWindow.focus && popupWindow.focus(), popup.pollPopup()
            }, popup.pollPopup = function () {
                var deferred = $q.defer();
                return polling = $interval(function () {
                    try {
                        if (popupWindow.document.domain === document.domain && (popupWindow.location.search || popupWindow.location.hash)) {
                            var queryParams = popupWindow.location.search.substring(1).replace(/\/$/, ""), hashParams = popupWindow.location.hash.substring(1).replace(/\/$/, ""), hash = utils.parseQueryString(hashParams), qs = utils.parseQueryString(queryParams);
                            angular.extend(qs, hash), qs.error ? deferred.reject({error: qs.error}) : deferred.resolve(qs), popupWindow.close(), $interval.cancel(polling)
                        }
                    } catch (error) {
                    }
                    popupWindow.closed && ($interval.cancel(polling), deferred.reject({data: "Authorization Failed"}))
                }, 35), deferred.promise
            }, popup.prepareOptions = function (options) {
                var width = options.width || 500, height = options.height || 500;
                return angular.extend({
                    width: width,
                    height: height,
                    left: $window.screenX + ($window.outerWidth - width) / 2,
                    top: $window.screenY + ($window.outerHeight - height) / 2.5
                }, options)
            }, popup.stringifyOptions = function (options) {
                var parts = [];
                return angular.forEach(options, function (value, key) {
                    parts.push(key + "=" + value)
                }), parts.join(",")
            }, popup
        }]).service("satellizer.utils", function () {
            this.camelCase = function (name) {
                return name.replace(/([\:\-\_]+(.))/g, function (_, separator, letter, offset) {
                    return offset ? letter.toUpperCase() : letter
                })
            }, this.parseQueryString = function (keyValue) {
                var key, value, obj = {};
                return angular.forEach((keyValue || "").split("&"), function (keyValue) {
                    keyValue && (value = keyValue.split("="), key = decodeURIComponent(value[0]), obj[key] = angular.isDefined(value[1]) ? decodeURIComponent(value[1]) : !0)
                }), obj
            }
        }).config(["$httpProvider", "satellizer.config", function ($httpProvider, config) {
            config.httpInterceptor && $httpProvider.interceptors.push(["$q", function ($q) {
                var tokenName = config.tokenPrefix ? config.tokenPrefix + "_" + config.tokenName : config.tokenName;
                return {
                    request: function (httpConfig) {
                        var token = localStorage.getItem(tokenName);
                        return token && (token = "Authorization" === config.authHeader ? "Bearer " + token : token, httpConfig.headers[config.authHeader] = token), httpConfig
                    }, responseError: function (response) {
                        return $q.reject(response)
                    }
                }
            }])
        }])
    }(window, window.angular), function () {
        function InvalidCharacterError(message) {
            this.message = message
        }

        var object = "undefined" != typeof exports ? exports : this, chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        InvalidCharacterError.prototype = new Error, InvalidCharacterError.prototype.name = "InvalidCharacterError", object.btoa || (object.btoa = function (input) {
            for (var block, charCode, str = String(input), idx = 0, map = chars, output = ""; str.charAt(0 | idx) || (map = "=", idx % 1); output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
                if (charCode = str.charCodeAt(idx += .75), charCode > 255)throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
                block = block << 8 | charCode
            }
            return output
        }), object.atob || (object.atob = function (input) {
            var str = String(input).replace(/=+$/, "");
            if (str.length % 4 == 1)throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
            for (var bs, buffer, bc = 0, idx = 0, output = ""; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? 64 * bs + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0)buffer = chars.indexOf(buffer);
            return output
        })
    }(), define("satellizer", ["angular"], function () {
    }), angular.module("templates-main", ["app/account/authentication/login/account.authentication.login.tpl.html", "app/account/authentication/signup/account.authentication.signup.tpl.html", "app/account/settings/account.settings.tpl.html", "app/account/settings/coaches/account.settings.coaches.tpl.html", "app/account/settings/enthusiasts/account.settings.enthusiasts.tpl.html", "app/account/settings/events/account.settings.events.tpl.html", "app/account/settings/facilities/account.settings.facilities.tpl.html", "app/account/settings/manage/account.settings.manage.tpl.html", "app/account/settings/offers/account.settings.offers.tpl.html", "app/account/settings/players/account.settings.players.tpl.html", "app/account/settings/profiles/account.settings.profiles.tpl.html", "app/account/settings/suppliers/account.settings.suppliers.tpl.html", "app/coaches/details/coaches.details.tpl.html", "app/enthusiasts/details/enthusiasts.details.tpl.html", "app/home/banner/home.banner.tpl.html", "app/home/events/home.events.tpl.html", "app/home/featured/home.featured.tpl.html", "app/home/home.tpl.html", "app/home/offers/home.offers.tpl.html", "app/search/bar/search.bar.tpl.html", "app/search/results/results.category.tpl.html", "app/search/results/results.coaches.tpl.html", "app/search/results/results.content.tpl.html", "app/search/results/results.enthusiasts.tpl.html", "app/search/results/results.events.tpl.html", "app/search/results/results.facilities.tpl.html", "app/search/results/results.location.tpl.html", "app/search/results/results.offers.tpl.html", "app/search/results/results.players.tpl.html", "app/search/results/results.sort.tpl.html", "app/search/results/results.suppliers.tpl.html", "app/search/results/results.tpl.html", "app/shared/directives/timepickerPopup/popup.tpl.html", "app/shared/errors/errors.messages.tpl.html", "app/shared/footer/footer.tpl.html", "app/shared/header/header.tpl.html"]), angular.module("app/account/authentication/login/account.authentication.login.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/account/authentication/login/account.authentication.login.tpl.html", '<div class="account-box">\n    <div class="jumbotron">\n        <h2 class="form-group">Sign In</h2>\n\n        <form role="form">\n            <div class="row">\n                <div class="form-group col-sm-12">\n                    <button class="btn btn-block btn-google-plus" ng-click="authenticate(\'google\')">\n                        <span><i class="google"></i>Sign in with Google</span>\n                    </button>\n                </div>\n            </div>\n            <div class="row">\n                <div class="form-group col-sm-12">\n                    <button class="btn btn-block btn-facebook" ng-click="authenticate(\'facebook\')">\n                        <span><i class="fb"></i> Sign in with Facebook</span>\n                    </button>\n                </div>\n            </div>\n            <p class="form-group">OR</p>\n\n            <div class="row">\n                <div class="form-group col-sm-12">\n                    <input type="email" class="form-control" placeholder="Email">\n                </div>\n            </div>\n            <div class="row">\n                <div class="form-group col-sm-12">\n                    <input type="password" class="form-control" placeholder="Passowrd">\n                </div>\n            </div>\n            <div class="row">\n                <div class="form-group col-sm-12">\n                    <button type="button" class="btn btn-block btn-primary">Login</button>\n                </div>\n            </div>\n            <p class="form-group">\n                <a href="#">Forgot your password?</a>\n            </p>\n\n            <p class="text-center text-muted">\n                <small>Don\'t have an account yet? <a href="/account/signup">Sign up</a></small>\n            </p>\n        </form>\n    </div>\n</div>\n')
    }]), angular.module("app/account/authentication/signup/account.authentication.signup.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/account/authentication/signup/account.authentication.signup.tpl.html", '<div class="account-box">\n    <div class="jumbotron">\n        <h2 class="form-group">Sign Up</h2>\n\n        <form role="form">\n            <div class="row">\n                <div class="form-group col-sm-12">\n                    <button class="btn btn-block btn-google-plus" ng-click="authenticate(\'google\')">\n                        <span><i class="google"></i>Sign up with Google</span>\n                    </button>\n                </div>\n            </div>\n            <div class="row">\n                <div class="form-group col-sm-12">\n                    <button class="btn btn-block btn-facebook" ng-click="authenticate(\'facebook\')">\n                        <span><i class="fb"></i> Sign up with Facebook</span>\n                    </button>\n                </div>\n            </div>\n            <p class="form-group">OR</p>\n\n            <div class="row">\n                <div class="form-group col-sm-12">\n                    <input type="text" class="form-control" placeholder="Name">\n                </div>\n            </div>\n            <div class="row">\n                <div class="form-group col-sm-12">\n                    <input type="email" class="form-control" placeholder="Email">\n                </div>\n            </div>\n            <div class="row">\n                <div class="form-group col-sm-12">\n                    <input type="password" class="form-control" placeholder="Passowrd">\n                </div>\n            </div>\n            <div class="row">\n                <div class="form-group col-sm-12">\n                    <button type="button" class="btn btn-block btn-primary">Sign Up</button>\n                </div>\n            </div>\n        </form>\n    </div>\n</div>\n')
    }]), angular.module("app/account/settings/account.settings.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/account/settings/account.settings.tpl.html", '<div class="account-settings">\n    <div class="container form-group banner border-btm">\n        <div class="col-md-3 col-lg-3 form-group">&nbsp;</div>\n        <div class="col-md-9 col-lg-9">\n            <p class="pagging">Hello {{user.displayName}}, Manage your Account details, prefrences & your listings on\n                this page</p>\n        </div>\n    </div>\n    <div class="container">\n        <div class="row">\n            <div class="col-md-3 col-lg-3 account-settings-options">\n                <div class="welcome-block">\n                    <a href="/account/manage">\n                        <h4 class="panel-title">Account Settings</h4>\n                    </a>\n                </div>\n                <div class="panel-heading profile">\n                    <a href="{{quickSettings.profiles.url}}">\n                        <h4 class="panel-title">{{quickSettings.profiles.title}}</h4>\n                    </a>\n                </div>\n                <div class="panel-heading enthusiast">\n                    <a href="{{quickSettings.enthusiasts.url}}">\n                        <h4 class="panel-title">{{quickSettings.enthusiasts.title}}</h4>\n                    </a>\n                </div>\n                <div class="panel-content" ng-if="entityType === \'Sport Enthusiast\'" ng-bind-html="listingMessage"></div>\n                <div class="panel-heading playing">\n                    <a href="{{quickSettings.players.url}}">\n                        <h4 class="panel-title">{{quickSettings.players.title}}</h4>\n                    </a>\n                </div>\n                <div class="panel-content" ng-if="entityType === \'Player\'" ng-bind-html="listingMessage"></div>\n\n                <div class="panel-heading coaching">\n                    <a href="{{quickSettings.coaches.url}}">\n                        <h4 class="panel-title">{{quickSettings.coaches.title}}</h4>\n                    </a>\n                </div>\n                <div class="panel-content" ng-if="entityType === \'Coach\'" ng-bind-html="listingMessage"></div>\n\n                <div class="panel-heading facilities">\n                    <a href="/{{quickSettings.facilities.url}}">\n                        <h4 class="panel-title">{{quickSettings.facilities.title}}</h4>\n                    </a>\n                </div>\n                <div class="panel-content" ng-if="entityType === \'Facility\'" ng-bind-html="listingMessage"></div>\n\n                <div class="panel-heading suppliers">\n                    <a href="{{quickSettings.suppliers.url}}">\n                        <h4 class="panel-title">{{quickSettings.suppliers.title}}</h4>\n                    </a>\n                </div>\n                <div class="panel-content" ng-if="entityType === \'Supplier\'" ng-bind-html="listingMessage"></div>\n\n                <div class="panel-heading events">\n                    <a href="{{quickSettings.events.url}}">\n                        <h4 class="panel-title">{{quickSettings.events.title}}</h4>\n                    </a>\n                </div>\n                <div class="panel-content" ng-if="entityType === \'Event\'" ng-bind-html="listingMessage"></div>\n\n                <div class="panel-heading offers">\n                    <a href="{{quickSettings.offers.url}}">\n                        <h4 class="panel-title">{{quickSettings.offers.title}}</h4>\n                    </a>\n                </div>\n                <div class="panel-content" ng-if="entityType === \'Offer\'" ng-bind-html="listingMessage"></div>\n            </div>\n            <div class="col-md-7 col-lg-7">\n                <ng-include src="formTemplate"></ng-include>\n            </div>\n            <div class="col-md-3 col-lg-3 form-group right-ad">\n                <!--Advertise here-->\n            </div>\n        </div>\n    </div>\n</div>\n\n')
    }]), angular.module("app/account/settings/coaches/account.settings.coaches.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/account/settings/coaches/account.settings.coaches.tpl.html", '<div class="panel-heading coaching">\n    <h4 class="panel-title">About your Coaching</h4>\n</div>\n<div class="panel-collapse" id="aboutCoaching">\n    <div class="panel-body">\n        <form name="coachForm" role="form" ng-submit="submit(coachForm)">\n\n            <div class="row">\n                <div class="col-sm-12 form-group">\n                    To update your personal & contact details in profile section please <a href="/account/profiles/{{user.profile._id}}">Click Here</a>.\n                </div>\n                <input type="hidden" name="profile" ng-init="entity.profile=user.profile._id" ng-model="entity.profile"/>\n            </div>\n\n            <div class="row">\n                <div class="col-sm-12 form-group">\n                <textarea name="aboutCoaching"\n                          class="form-control"\n                          placeholder="About your coaching...."\n                          ng-model="entity.aboutCoaching"\n                          minlength="5"\n                          maxlength="400"\n                          required> </textarea>\n\n                    <div ng-if="coachForm.aboutCoaching.$dirty" ng-messages="coachForm.aboutCoaching.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{coachForm.aboutCoaching.$error.serverMessage}}</div>\n                    </div>\n                </div>\n            </div>\n\n            <div class="row border-bottom form-group">\n                <div class="col-sm-12 form-group">\n                    <tabset>\n                        <tab ng-if="entity.sports.length" ng-repeat="sport in entity.sports"\n                             heading="{{sport.name || \'Sport \'+($index+1)}}" active="sport.active" select="tabChanged($index)">\n                            <div class="panel-body">\n\n                                <div class="row">\n                                    <div class="col-sm-1 form-group pull-right">\n                                        <a href ng-click="removeTab($index, \'sports\')"><span\n                                                class="glyphicon glyphicon-remove"></span></a>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-7 form-group">\n                                        <select name="{{\'name\'+$index}}"\n                                                class="form-control"\n                                                ng-model="sport.name"\n                                                ng-options="sport as sport for sport in sports"\n                                                required>\n                                            <option value="">Which Sport do you coach for ?</option>\n                                        </select>\n\n                                        <div ng-if="coachForm[\'name\'+$index].$dirty"\n                                             ng-messages="coachForm[\'name\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'name\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-5 form-group">\n                                        <select name="{{\'experienceYears\'+$index}}"\n                                                class="form-control"\n                                                ng-model="sport.experienceYears"\n                                                ng-options="experienceYear as experienceYear for experienceYear in experienceYears"\n                                                required>\n                                            <option value="">Years of experience</option>\n                                        </select>\n\n                                        <div ng-if="coachForm[\'experienceYears\'+$index].$dirty"\n                                             ng-messages="coachForm[\'experienceYears\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'experienceYears\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-5">\n                                        Whom do you coach:\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-3 form-group">\n                                        <input id="men"\n                                               name="men"\n                                               type="checkbox"\n                                               ng-model="sport.coachingMen"/> <label for="men">Men</label>\n                                    </div>\n                                    <div class="col-sm-3 form-group">\n                                        <select name="{{\'menFromAge\'+$index}}"\n                                                class="form-control"\n                                                ng-model="sport.menFromAge"\n                                                ng-options="adultAge as adultAge for adultAge in adultAges"\n                                                ng-required="sport.coachingMen"\n                                                ng-disabled="!sport.coachingMen">\n                                            <option value="">Age from</option>\n                                        </select>\n\n                                        <div ng-if="coachForm[\'menFromAge\'+$index].$dirty"\n                                             ng-messages="coachForm[\'menFromAge\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'menFromAge\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-3 form-group">\n                                        <select name="{{\'menToAge\'+$index}}"\n                                                class="form-control"\n                                                ng-model="sport.menToAge"\n                                                ng-options="adultAge as adultAge for adultAge in adultAges"\n                                                ng-required="sport.coachingMen"\n                                                ng-disabled="!sport.coachingMen">\n                                            <option value="">Age To</option>\n                                        </select>\n\n                                        <div ng-if="coachForm[\'menToAge\'+$index].$dirty"\n                                             ng-messages="coachForm[\'menToAge\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'menToAge\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-3 form-group">\n                                        <input type="number"\n                                               name="{{\'menCharges\'+$index}}"\n                                               class="form-control"\n                                               placeholder="&#8377; / class"\n                                               ng-model="sport.menCharges"\n                                               min="0"\n                                               max="50000"\n                                               ng-required="sport.coachingMen"\n                                               ng-disabled="!sport.coachingMen"/>\n\n                                        <div ng-if="coachForm[\'menCharges\'+$index].$dirty"\n                                             ng-messages="coachForm[\'menCharges\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'menCharges\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-3 form-group">\n                                        <input id="women"\n                                               name="women"\n                                               type="checkbox"\n                                               ng-model="sport.coachingWomen"/> <label for="women">Women</label>\n                                    </div>\n                                    <div class="col-sm-3 form-group">\n                                        <select name="{{\'womenFromAge\'+$index}}"\n                                                class="form-control"\n                                                ng-model="sport.womenFromAge"\n                                                ng-options="adultAge as adultAge for adultAge in adultAges"\n                                                ng-required="sport.coachingWomen"\n                                                ng-disabled="!sport.coachingWomen">\n                                            <option value="">Age from</option>\n                                        </select>\n\n                                        <div ng-if="coachForm[\'womenFromAge\'+$index].$dirty"\n                                             ng-messages="coachForm[\'womenFromAge\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'womenFromAge\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-3 form-group">\n                                        <select name="{{\'womenToAge\'+$index}}"\n                                                class="form-control"\n                                                ng-model="sport.womenToAge"\n                                                ng-options="adultAge as adultAge for adultAge in adultAges"\n                                                ng-required="sport.coachingWomen"\n                                                ng-disabled="!sport.coachingWomen">\n                                            <option value="">Age To</option>\n                                        </select>\n\n                                        <div ng-if="coachForm[\'womenToAge\'+$index].$dirty"\n                                             ng-messages="coachForm[\'womenToAge\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'womenToAge\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-3 form-group">\n                                        <input type="number"\n                                               name="{{\'womenCharges\'+$index}}"\n                                               class="form-control"\n                                               placeholder="&#8377; / class"\n                                               ng-model="sport.womenCharges"\n                                               min="0"\n                                               max="50000"\n                                               ng-required="sport.coachingWomen"\n                                               ng-disabled="!sport.coachingWomen"/>\n\n                                        <div ng-if="coachForm[\'womenCharges\'+$index].$dirty"\n                                             ng-messages="coachForm[\'womenCharges\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'womenCharges\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-3 form-group">\n                                        <input id="kids"\n                                               name="kids"\n                                               type="checkbox"\n                                               ng-model="sport.coachingKids"/> <label for="kids">Kids</label>\n                                    </div>\n                                    <div class="col-sm-3 form-group">\n                                        <select name="{{\'kidsFromAge\'+$index}}"\n                                                class="form-control"\n                                                ng-model="sport.kidsFromAge"\n                                                ng-options="kidsAge as kidsAge for kidsAge in kidsAges"\n                                                ng-required="sport.coachingKids"\n                                                ng-disabled="!sport.coachingKids">\n                                            <option value="">Age from</option>\n                                        </select>\n\n                                        <div ng-if="coachForm[\'kidsFromAge\'+$index].$dirty"\n                                             ng-messages="coachForm[\'kidsFromAge\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'kidsFromAge\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-3 form-group">\n                                        <select name="{{\'kidsToAge\'+$index}}"\n                                                class="form-control"\n                                                ng-model="sport.kidsToAge"\n                                                ng-options="kidsAge as kidsAge for kidsAge in kidsAges"\n                                                ng-required="sport.coachingKids"\n                                                ng-disabled="!sport.coachingKids">\n                                            <option value="">Age To</option>\n                                        </select>\n\n                                        <div ng-if="coachForm[\'kidsToAge\'+$index].$dirty"\n                                             ng-messages="coachForm[\'kidsToAge\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'kidsToAge\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-3 form-group">\n                                        <input type="number"\n                                               name="{{\'kidsCharges\'+$index}}"\n                                               class="form-control"\n                                               placeholder="&#8377; / class"\n                                               ng-model="sport.kidsCharges"\n                                               min="0"\n                                               max="50000"\n                                               ng-required="sport.coachingKids"\n                                               ng-disabled="!sport.coachingKids"/>\n\n                                        <div ng-if="coachForm[\'kidsCharges\'+$index].$dirty"\n                                             ng-messages="coachForm[\'kidsCharges\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'kidsCharges\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-6 form-group">\n                                        <label for="privateCoaching">Do you provide private coaching ? </label>\n                                        <input id="privateCoaching"\n                                               name="privateCoaching"\n                                               type="checkbox"\n                                               ng-model="sport.privateCoaching"/>\n                                    </div>\n                                    <div class="col-sm-6 form-group">\n                                        <label for="freeTrialClasses">Do you provide free trial classes ? </label>\n                                        <input id="freeTrialClasses"\n                                               name="freeTrialClasses"\n                                               type="checkbox"\n                                               ng-model="sport.freeTrialClasses"/>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-6 form-group">\n                                        <p>When do you provide your coaching:</p>\n                                        <select name="{{\'coachingFrequency\'+$index}}"\n                                                class="form-control"\n                                                ng-model="sport.coachingFrequency"\n                                                ng-options="coachingFrequency as coachingFrequency for coachingFrequency in playingFrequencies"\n                                                required>\n                                            <option value="">When do you provide coaching ?</option>\n                                        </select>\n\n                                        <div ng-if="coachForm[\'coachingFrequency\'+$index].$dirty"\n                                             ng-messages="coachForm[\'coachingFrequency\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'coachingFrequency\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-5 form-group">\n                                        <div class="input-group">\n                                            <input type="text"\n                                                   name="{{coachForm[\'startTime\'+$index]}}"\n                                                   class="form-control"\n                                                   timepicker-popup="h:mm a"\n                                                   ng-model="sport.startTime"\n                                                   is-open="startTimePickerOpened"\n                                                   placeholder="Coaching Start Time"\n                                                   ng-change="dateTimePickerChanged(\'startTimePickerOpened\')"\n                                                   ng-required="true"/>\n                                            <span class="input-group-addon"\n                                                  ng-click="openDateTimePicker($event, \'startTimePickerOpened\')"><i\n                                                    class="glyphicon glyphicon-dashboard"></i></span>\n                                        </div>\n                                        <div ng-if="coachForm[\'startTime\'+$index].$dirty"\n                                             ng-messages="coachForm[\'startTime\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'startTime\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-5 form-group">\n                                        <div class="input-group">\n                                            <input type="text"\n                                                   name="{{coachForm[\'endTime\'+$index]}}"\n                                                   class="form-control"\n                                                   timepicker-popup="h:mm a"\n                                                   ng-model="sport.endTime"\n                                                   is-open="endTimePickerOpened"\n                                                   placeholder="Coaching End Time"\n                                                   ng-change="dateTimePickerChanged(\'endTimePickerOpened\')"\n                                                   ng-required="true"/>\n                                            <span class="input-group-addon"\n                                                  ng-click="openDateTimePicker($event, \'endTimePickerOpened\')"><i\n                                                    class="glyphicon glyphicon-dashboard"></i></span>\n                                        </div>\n                                        <div ng-if="coachForm[\'endTime\'+$index].$dirty"\n                                             ng-messages="coachForm[\'endTime\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'endTime\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-6 form-group">\n                                        <p>Where do you coach:</p>\n                                        <input type="text"\n                                               name="{{coachForm[\'streetOne\'+$index]}}"\n                                               class="form-control"\n                                               placeholder="Address Line 1"\n                                               ng-model="sport.streetOne"\n                                               minlength="5"\n                                               maxlength="70"\n                                               required/>\n\n                                        <div ng-if="coachForm[\'streetOne\'+$index].$dirty"\n                                             ng-messages="coachForm[\'streetOne\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'streetOne\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-6 form-group">\n                                        <input type="text"\n                                               name="{{coachForm[\'streetTwo\'+$index]}}"\n                                               class="form-control"\n                                               placeholder="Address Line 2"\n                                               ng-model="sport.streetTwo"/>\n\n                                        <div ng-if="coachForm[\'streetTwo\'+$index].$dirty"\n                                             ng-messages="coachForm[\'streetTwo\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'streetTwo\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-4 form-group">\n                                        <select name="{{coachForm[\'city\'+$index]}}"\n                                                class="form-control"\n                                                ng-model="sport.city"\n                                                ng-options="city as city for city in cities"\n                                                required>\n                                            <option value="">Select City</option>\n                                        </select>\n\n                                        <div ng-if="coachForm[\'city\'+$index].$dirty"\n                                             ng-messages="coachForm[\'city\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'city\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-4 form-group">\n                                        <select name="{{coachForm[\'state\'+$index]}}"\n                                                class="form-control"\n                                                ng-model="sport.state"\n                                                ng-options="state as state for state in states"\n                                                required>\n                                            <option value="">Select State</option>\n                                        </select>\n\n                                        <div ng-if="coachForm[\'state\'+$index].$dirty"\n                                             ng-messages="coachForm[\'state\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'state\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-4 form-group">\n                                        <input type="text"\n                                               name="{{coachForm[\'pin\'+$index]}}"\n                                               class="form-control"\n                                               placeholder="PIN"\n                                               ng-model="sport.pin"\n                                               maxlength="6"\n                                               minlength="6"\n                                               required/>\n\n                                        <div ng-if="coachForm[\'pin\'+$index].$dirty"\n                                             ng-messages="coachForm[\'pin\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">{{coachForm[\'pin\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col.sm-12 form-group">\n                                        <div class="map-canvas" id="{{\'addr-map-canvas\'+$index}}"></div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-6 form-group">\n                                        <p>Certifications & Accolades:</p>\n                                        <input type="text"\n                                               name="{{coachForm[\'certificationName\'+$index]}}"\n                                               class="form-control"\n                                               placeholder="Certification Name"\n                                               ng-model="sport.certificationName"\n                                               minlength="1"\n                                               maxlength="20"/>\n\n                                        <div ng-if="coachForm[\'certificationName\'+$index].$dirty"\n                                             ng-messages="coachForm[\'certificationName\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'certificationName\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-6 form-group">\n                                        <input type="text"\n                                               name="{{coachForm[\'certificationBody\'+$index]}}"\n                                               class="form-control"\n                                               placeholder="Certification Body"\n                                               ng-model="sport.certificationBody"/>\n\n                                        <div ng-if="coachForm[\'certificationBody\'+$index].$dirty"\n                                             ng-messages="coachForm[\'certificationBody\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{coachForm[\'certificationBody\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-2 form-group">\n                                        <p>Validity:</p>\n                                    </div>\n                                    <div class="col-sm-5 form-group">\n                                        <div class="input-group">\n                                            <input type="text"\n                                                   name="{{coachForm[\'certificationValidFrom\'+$index]}}"\n                                                   class="form-control"\n                                                   datepicker-popup="dd-MMMM-yyyy"\n                                                   show-button-bar="false"\n                                                   ng-model="sport.certificationValidFrom"\n                                                   is-open="validFromPickerOpened"\n                                                   placeholder="Certificate Valid From"\n                                                   datepicker-options="datePickerOptions"\n                                                   ng-change="dateTimePickerChanged(\'validFromPickerOpened\')"\n                                                   ng-required="true"/>\n\n                                            <div ng-if="coachForm[\'certificationValidFrom\'+$index].$dirty"\n                                                 ng-messages="coachForm[\'certificationValidFrom\'+$index].$error"\n                                                 class="errorMessages"\n                                                 ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                                <div ng-message="server">\n                                                    {{coachForm[\'certificationValidFrom\'+$index].$error.serverMessage}}\n                                                </div>\n                                            </div>\n                                            <span class="input-group-addon"\n                                                  ng-click="openDateTimePicker($event, \'validFromPickerOpened\')"><i\n                                                    class="glyphicon glyphicon-calendar"></i></span>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-5 form-group pull-right">\n                                        <div class="input-group">\n                                            <input type="text"\n                                                   name="{{coachForm[\'certificationValidTo\'+$index]}}"\n                                                   class="form-control"\n                                                   datepicker-popup="dd-MMMM-yyyy"\n                                                   show-button-bar="false"\n                                                   ng-model="sport.certificationValidTo"\n                                                   is-open="validToPickerOpened"\n                                                   placeholder="Certificate Valid To"\n                                                   datepicker-options="datePickerOptions"\n                                                   ng-change="dateTimePickerChanged(\'validToPickerOpened\')"\n                                                   ng-required="true"/>\n\n                                            <div ng-if="coachForm[\'certificationValidTo\'+$index].$dirty"\n                                                 ng-messages="coachForm[\'certificationValidTo\'+$index].$error"\n                                                 class="errorMessages"\n                                                 ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                                <div ng-message="server">\n                                                    {{coachForm[\'certificationValidTo\'+$index].$error.serverMessage}}\n                                                </div>\n                                            </div>\n                                            <span class="input-group-addon"\n                                                  ng-click="openDateTimePicker($event, \'validToPickerOpened\')"><i\n                                                    class="glyphicon glyphicon-calendar"></i></span>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row  form-group">\n                                    <div class="col-sm-5 form-group">\n                                        <div class="input-group">\n                                            <input type="text" placeholder="Certificate Pic" value="{{entityImage.name}}" class="form-control">\n                                            <span class="input-group-addon btn btn-default btn-file">\n                                                Browse\n                                                <input type="file"\n                                                       accept="image/*"\n                                                       resize-type="image/jpg"\n                                                       image="entityImage"\n                                                       resize-max-width="200"\n                                                       resize-max-height="100"/>\n                                            </span>\n                                        </div>\n                                        <div class="infoMessages">Size: 200pxx100px</div>\n                                    </div>\n                                    <div class="col-sm-6" ng-if="entityImage">\n                                        <img ng-src="{{entityImage.resized.dataURL}}" class="img-responsive"/>\n                                    </div>\n                                </div>\n\n                            </div>\n                        </tab>\n                        <tab-heading>\n                            <a ng-click="addTab(coachForm, \'sports\')" class="add-sport"><i\n                                    class="glyphicon glyphicon-plus-sign"></i> Add Sport</a>\n                        </tab-heading>\n                    </tabset>\n                </div>\n\n            </div>\n\n            <div class="row">\n                <div class="col-sm-12 form-group">\n                    <button type="submit"\n                            class="btn btn-primary">{{entity._id ? \'Update listing\' : \'Enlist as Coach\'}}\n                    </button>\n                    <button type="submit"\n                            ng-if="entity._id"\n                            ng-click="remove(entity._id)" class="btn btn-danger pull-right">Remove Listing\n                    </button>\n                </div>\n            </div>\n        </form>\n\n    </div>\n</div>')
    }]), angular.module("app/account/settings/enthusiasts/account.settings.enthusiasts.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/account/settings/enthusiasts/account.settings.enthusiasts.tpl.html", '<div class="panel-heading enthusiast">\n    <h4 class="panel-title">Personal & Contact Details</h4>\n</div>\n<div class="panel-collapse" id="personalDetails">\n    <div class="panel-body">\n        <form name="enthusiastForm" role="form" ng-submit="submit(enthusiastForm)">\n\n            <div class="row">\n                <div class="col-sm-12 form-group">\n                    To update your personal & contact details in profile section please <a href="/account/profiles/{{user.profile._id}}">Click Here</a>.\n                </div>\n                <input type="hidden" name="profile" ng-init="entity.profile=user.profile._id" ng-model="entity.profile"/>\n            </div>\n\n            <div class="row">\n                <div class="col-sm-12 form-group">\n                <textarea name="aboutYourself"\n                          class="form-control"\n                          placeholder="About Yourself...."\n                          ng-model="entity.aboutYourself"\n                          minlength="5"\n                          maxlength="400"\n                          required> </textarea>\n\n                    <div ng-if="enthusiastForm.aboutYourself.$dirty" ng-messages="enthusiastForm.aboutYourself.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{enthusiastForm.aboutYourself.$error.serverMessage}}</div>\n                    </div>\n                </div>\n            </div>\n\n            <div class="row border-bottom form-group">\n\n                <div class="col-sm-12 form-group">\n                    <tabset>\n                        <tab ng-if="entity.sports.length" ng-repeat="sport in entity.sports"\n                             heading="{{sport.name || \'Sport \'+($index+1)}}" active="sport.active">\n                            <div class="panel-body">\n\n                                <div class="row">\n                                    <div class="col-sm-1 form-group pull-right">\n                                        <a href ng-click="removeTab($index, \'sports\')"><span\n                                                class="glyphicon glyphicon-remove"></span></a>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-7 form-group">\n                                        <select name="{{\'name\'+$index}}"\n                                                class="form-control"\n                                                ng-model="sport.name"\n                                                ng-options="sport as sport for sport in sports"\n                                                required>\n                                            <option value="">Which Sport Activity you like ?</option>\n                                        </select>\n\n                                        <div ng-if="enthusiastForm[\'name\'+$index].$dirty"\n                                             ng-messages="enthusiastForm[\'name\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{enthusiastForm[\'name\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-5 form-group">\n                                        <select name="{{\'followingYears\'+$index}}"\n                                                class="form-control"\n                                                ng-model="sport.followingYears"\n                                                ng-options="experienceYear as experienceYear for experienceYear in experienceYears"\n                                                required>\n                                            <option value="">Years of following</option>\n                                        </select>\n\n                                        <div ng-if="enthusiastForm[\'followingYears\'+$index].$dirty"\n                                             ng-messages="enthusiastForm[\'followingYears\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{enthusiastForm[\'followingYears\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-12 form-group">\n                                        <label for="subscribeEvents">Do you want to subscribe events for this sports ? </label>\n                                        <input id="subscribeEvents"\n                                               name="subscribeEvents"\n                                               type="checkbox"\n                                               ng-model="sport.subscribeEvents"/>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-12 form-group">\n                                        <label for="subscribeOffers">Do you to get offers for this sport ? </label>\n                                        <input id="subscribeOffers"\n                                               name="subscribeOffers"\n                                               type="checkbox"\n                                               ng-model="sport.subscribeOffers"/>\n                                    </div>\n                                </div>\n\n                            </div>\n                        </tab>\n                        <tab-heading>\n                            <a ng-click="addTab(enthusiastForm, \'sports\')" class="add-sport"><i\n                                    class="glyphicon glyphicon-plus-sign"></i> Add Sport</a>\n                        </tab-heading>\n                    </tabset>\n                </div>\n\n            </div>\n\n            <div class="row">\n                <div class="col-sm-12 form-group">\n                    <button type="submit"\n                            class="btn btn-primary">{{entity._id ? \'Update listing\' : \'Enlist as Enthusiast\'}}\n                    </button>\n                    <button type="submit"\n                            ng-if="entity._id"\n                            ng-click="remove(entity._id)"\n                            class="btn btn-danger pull-right">Remove Listing\n                    </button>\n                </div>\n            </div>\n\n        </form>\n    </div>\n</div>')
    }]), angular.module("app/account/settings/events/account.settings.events.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/account/settings/events/account.settings.events.tpl.html", '<div class="panel-heading events">\n    <h4 class="panel-title">Are you hosting any sports event ?</h4>\n</div>\n\n<div class="panel-body">\n    <form name="eventForm" role="form" ng-submit="submit(eventForm)">\n        <div class="row">\n            <div class="col-sm-5 form-group">\n                <input type="text"\n                       name="organiser"\n                       class="form-control"\n                       placeholder="Event Organiser"\n                       ng-model="entity.organiser"\n                       minlength="3"\n                       maxlength="40"\n                       required/>\n                <div ng-if="eventForm.organiser.$dirty" ng-messages="eventForm.organiser.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{eventForm.organiser.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-7 form-group">\n                <input type="text"\n                       name="heading"\n                       class="form-control"\n                       placeholder="Event Heading"\n                       ng-model="entity.heading"\n                       minlength="5"\n                       maxlength="70"\n                       required/>\n                <div ng-if="eventForm.heading.$dirty" ng-messages="eventForm.heading.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{eventForm.heading.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-8 form-group">\n                <textarea name="description"\n                          class="form-control"\n                          placeholder="Event Description"\n                          ng-model="entity.description"\n                          minlength="5"\n                          maxlength="200"\n                          required> </textarea>\n                <div ng-if="eventForm.description.$dirty" ng-messages="eventForm.description.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{eventForm.description.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-6 form-group">\n                <div class="input-group">\n                    <input type="text"\n                           name="date"\n                           class="form-control"\n                           datepicker-popup="dd-MMMM-yyyy"\n                           show-button-bar="false"\n                           ng-model="entity.date"\n                           is-open="datePickerOpened"\n                           placeholder="Event Date"\n                           datepicker-options="datePickerOptions"\n                           ng-change="dateTimePickerChanged(\'datePickerOpened\')"\n                           ng-required="true"/>\n                    <span class="input-group-addon" ng-click="openDateTimePicker($event, \'datePickerOpened\')"><i\n                            class="glyphicon glyphicon-calendar"></i></span>\n                </div>\n                <div ng-if="eventForm.date.$dirty" ng-messages="eventForm.date.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{eventForm.date.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-5 form-group">\n                <div class="input-group">\n                    <input type="text"\n                           name="startTime"\n                           class="form-control"\n                           timepicker-popup="h:mm a"\n                           ng-model="entity.startTime"\n                           is-open="startTimePickerOpened"\n                           placeholder="Event Start Time"\n                           ng-change="dateTimePickerChanged(\'startTimePickerOpened\')"\n                           ng-required="true"/>\n                    <span class="input-group-addon" ng-click="openDateTimePicker($event, \'startTimePickerOpened\')"><i\n                            class="glyphicon glyphicon-dashboard"></i></span>\n                </div>\n                <div ng-if="eventForm.startTime.$dirty" ng-messages="eventForm.startTime.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{eventForm.startTime.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-5 form-group">\n                <div class="input-group">\n                    <input type="text"\n                           name="endTime"\n                           class="form-control"\n                           timepicker-popup="h:mm a"\n                           ng-model="entity.endTime"\n                           is-open="endTimePickerOpened"\n                           placeholder="Event End Time"\n                           ng-change="dateTimePickerChanged(\'endTimePickerOpened\')"\n                           ng-required="true"/>\n                    <span class="input-group-addon" ng-click="openDateTimePicker($event, \'endTimePickerOpened\')"><i\n                            class="glyphicon glyphicon-dashboard"></i></span>\n                </div>\n                <div ng-if="eventForm.endTime.$dirty" ng-messages="eventForm.endTime.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{eventForm.endTime.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-6 form-group">\n                <input type="text"\n                       name="streetOne"\n                       class="form-control"\n                       placeholder="Address Line 1"\n                       ng-model="entity.streetOne"\n                       minlength="5"\n                       maxlength="70"\n                       required/>\n\n                <div ng-if="eventForm.streetOne.$dirty" ng-messages="eventForm.streetOne.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{eventForm.streetOne.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-6 form-group">\n                <input type="text"\n                       name="streetTwo"\n                       class="form-control"\n                       placeholder="Address Line 2"\n                       ng-model="entity.streetTwo"/>\n\n                <div ng-if="eventForm.streetTwo.$dirty" ng-messages="eventForm.streetTwo.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{eventForm.streetTwo.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-4 form-group">\n                <select name="city"\n                        class="form-control"\n                        ng-model="entity.city"\n                        ng-options="city as city for city in cities"\n                        required>\n                    <option value="">Select City</option>\n                </select>\n\n                <div ng-if="eventForm.city.$dirty" ng-messages="eventForm.city.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{eventForm.city.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <select name="state"\n                        class="form-control"\n                        ng-model="entity.state"\n                        ng-options="state as state for state in states"\n                        required>\n                    <option value="">Select State</option>\n                </select>\n\n                <div ng-if="eventForm.state.$dirty" ng-messages="eventForm.state.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{eventForm.state.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <input type="text"\n                       name="pin"\n                       class="form-control"\n                       placeholder="PIN"\n                       ng-model="entity.pin"\n                       maxlength="6"\n                       minlength="6"\n                       required/>\n\n                <div ng-if="eventForm.pin.$dirty" ng-messages="eventForm.pin.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{eventForm.pin.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col.sm-12 form-group">\n                <div id="addr-map-canvas"></div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-4 form-group">\n                <input type="email"\n                       name="email"\n                       class="form-control"\n                       placeholder="Contact Email"\n                       ng-model="entity.email"\n                       required/>\n\n                <div ng-if="eventForm.email.$dirty" ng-messages="eventForm.email.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{eventForm.email.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <input type="tel"\n                       name="phoneOne"\n                       class="form-control"\n                       placeholder="Contact Phone 1"\n                       ng-model="entity.phoneOne"\n                       minlength="10"\n                       maxlength="10"\n                       length="10"\n                       required/>\n\n                <div ng-if="eventForm.phoneOne.$dirty" ng-messages="eventForm.phoneOne.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{eventForm.phoneOne.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <input type="tel"\n                       name="phoneTwo"\n                       class="form-control"\n                       placeholder="Contact Phone 2"\n                       ng-model="entity.phoneTwo"\n                       minlength="10"\n                       maxlength="10"\n                       length="10"/>\n\n                <div ng-if="eventForm.phoneTwo.$dirty" ng-messages="eventForm.phoneTwo.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{eventForm.phoneTwo.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-8 form-group">\n                <input type="url"\n                       name="url"\n                       class="form-control"\n                       placeholder="Event url"\n                       ng-model="entity.url"\n                       required/>\n\n                <div ng-if="eventForm.url.$dirty" ng-messages="eventForm.url.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{eventForm.url.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row border-bottom form-group">\n            <div class="col-sm-5 form-group">\n                <div class="input-group">\n                    <input type="text" placeholder="Event Pic (200x50)" value="{{entityImage.name}}" class="form-control">\n                    <span class="input-group-addon btn btn-default btn-file">\n                        Browse\n                        <input type="file"\n                               accept="image/*"\n                               resize-type="image/jpg"\n                               image="entityImage"\n                               resize-max-width="200"\n                               resize-max-height="50"/>\n                    </span>\n                </div>\n                <div class="infoMessages">Size: 200x50px</div>\n            </div>\n            <div class="col-sm-6" ng-if="entityImage">\n                <img ng-src="{{entityImage.resized.dataURL}}"/>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-12 form-group">\n                <button type="submit"\n                        class="btn btn-primary">{{entity._id ? \'Update\' : \'Add Event\'}}\n                </button>\n                <button type="submit" ng-if="entity._id" ng-click="remove(entity._id)"\n                        class="btn btn-danger pull-right">Remove Event\n                </button>\n            </div>\n        </div>\n\n    </form>\n</div>\n\n<div ng-if="user.events && user.events.length">\n    <div class="panel-heading manage-listing">\n        <h4 class="panel-title">Manage Events\n            <ng-pluralize class="pull-right" count="user.events.length"\n                          when="{\'one\': \'1 event listed\',\'other\': \'{} events listed\'}"></ng-pluralize>\n        </h4>\n    </div>\n    <div class="panel-body">\n        <div ng-repeat="event in user.events">\n            <div class="row form-group result manage-list">\n                <div class="col-sm-9 border-right-dotted">\n                    <h3>{{event.organiser}}</h3>\n                    <h6>{{event.heading}}</h6>\n\n                    <p>Scheduled on {{event.date | date}} from {{event.startTime | date:\'h:mm a\'}} to {{event.endTime |\n                        date:\'h:mm a\'}}</p>\n                    <h6>Address :-</h6>\n\n                    <p>{{event.streetOne}}</p>\n\n                    <p ng-if="event.streetTwo">{{event.streetTwo}}</p>\n\n                    <p>{{event.city}} {{event.state}} {{event.pin}}</p>\n\n                    <p>Phone: {{event.phoneOne}}<span ng-if="event.phoneTwo"> / {{event.phoneTwo}}</span></p>\n\n                    <p>Website: {{event.url}}</p>\n                </div>\n                <div class="col-sm-3">\n                    <ul class="nav">\n                        <li>\n                            <a href="/account/events/{{event._id}}"><span class="glyphicon glyphicon-edit"></span> Edit</a>\n                        </li>\n                        <li>\n                            <a href ng-click="remove(event._id)"><span class="glyphicon glyphicon-remove"></span> Remove</a>\n                        </li>\n                    </ul>\n                </div>\n            </div>\n        </div>\n        <div class="form-group">\n            <a href="/account/events/" class="btn btn-sm btn-info pull-right">Add</a>\n        </div>\n    </div>\n</div>')
    }]), angular.module("app/account/settings/facilities/account.settings.facilities.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/account/settings/facilities/account.settings.facilities.tpl.html", '<div class="panel-heading facilities">\n    <h4 class="panel-title">Do you provide Sport Facility ?</h4>\n</div>\n<div class="panel-body">\n    <form name="facilityForm" role="form" ng-submit="submit(facilityForm)">\n        <div class="row">\n            <div class="col-sm-5 form-group">\n                <input type="text"\n                       name="name"\n                       class="form-control"\n                       placeholder="Facility Name"\n                       ng-model="entity.name"\n                       minlength="3"\n                       maxlength="40"\n                       required/>\n\n                <div ng-if="facilityForm.name.$dirty" ng-messages="facilityForm.name.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{facilityForm.name.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-7 form-group">\n                <input type="text"\n                       name="speciality"\n                       class="form-control"\n                       placeholder="Facility Speciality"\n                       ng-model="entity.speciality"\n                       minlength="5"\n                       maxlength="70"\n                       required/>\n\n                <div ng-if="facilityForm.speciality.$dirty" ng-messages="facilityForm.speciality.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{facilityForm.speciality.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-8 form-group">\n                <textarea name="description"\n                          class="form-control"\n                          placeholder="Facility Description"\n                          ng-model="entity.description"\n                          minlength="5"\n                          maxlength="200"\n                          required> </textarea>\n\n                <div ng-if="facilityForm.description.$dirty" ng-messages="facilityForm.description.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{facilityForm.description.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-6 form-group">\n                <input type="text"\n                       name="streetOne"\n                       class="form-control"\n                       placeholder="Address Line 1"\n                       ng-model="entity.streetOne"\n                       minlength="5"\n                       maxlength="70"\n                       required/>\n\n                <div ng-if="facilityForm.streetOne.$dirty" ng-messages="facilityForm.streetOne.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{facilityForm.streetOne.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-6 form-group">\n                <input type="text"\n                       name="streetTwo"\n                       class="form-control"\n                       placeholder="Address Line 2"\n                       ng-model="entity.streetTwo"/>\n\n                <div ng-if="facilityForm.streetTwo.$dirty" ng-messages="facilityForm.streetTwo.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{facilityForm.streetTwo.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-4 form-group">\n                <select name="city"\n                        class="form-control"\n                        ng-model="entity.city"\n                        ng-options="city as city for city in cities"\n                        required>\n                    <option value="">Select City</option>\n                </select>\n\n                <div ng-if="facilityForm.city.$dirty" ng-messages="facilityForm.city.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{facilityForm.city.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <select name="state"\n                        class="form-control"\n                        ng-model="entity.state"\n                        ng-options="state as state for state in states"\n                        required>\n                    <option value="">Select State</option>\n                </select>\n\n                <div ng-if="facilityForm.state.$dirty" ng-messages="facilityForm.state.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{facilityForm.state.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <input type="text"\n                       name="pin"\n                       class="form-control"\n                       placeholder="PIN"\n                       ng-model="entity.pin"\n                       maxlength="6"\n                       minlength="6"\n                       length="6"\n                       required/>\n\n                <div ng-if="facilityForm.pin.$dirty" ng-messages="facilityForm.pin.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{facilityForm.pin.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col.sm-12 form-group">\n                <div id="addr-map-canvas"></div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-4 form-group">\n                <input type="email"\n                       name="email"\n                       class="form-control"\n                       placeholder="Contact Email"\n                       ng-model="entity.email"\n                       required/>\n\n                <div ng-if="facilityForm.email.$dirty" ng-messages="facilityForm.email.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{facilityForm.email.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <input type="tel"\n                       name="phoneOne"\n                       class="form-control"\n                       placeholder="Contact Phone 1"\n                       ng-model="entity.phoneOne"\n                       minlength="10"\n                       maxlength="10"\n                       length="10"\n                       required/>\n\n                <div ng-if="facilityForm.phoneOne.$dirty" ng-messages="facilityForm.phoneOne.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{facilityForm.phoneOne.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <input type="tel"\n                       name="phoneTwo"\n                       class="form-control"\n                       placeholder="Contact Phone 2"\n                       ng-model="entity.phoneTwo"\n                       minlength="10"\n                       maxlength="10"\n                       length="10"/>\n\n                <div ng-if="facilityForm.phoneTwo.$dirty" ng-messages="facilityForm.phoneTwo.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{facilityForm.phoneTwo.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-8 form-group">\n                <input type="url"\n                       name="url"\n                       class="form-control"\n                       placeholder="Supplier website"\n                       ng-model="entity.url"\n                       required/>\n\n                <div ng-if="facilityForm.url.$dirty" ng-messages="facilityForm.url.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{facilityForm.url.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row border-bottom form-group">\n            <div class="col-sm-5 form-group">\n                <div class="input-group">\n                    <input type="text" placeholder="Facility Pic" value="{{entityImage.name}}" class="form-control">\n                    <span class="input-group-addon btn btn-default btn-file">\n                        Browse\n                        <input type="file"\n                               accept="image/*"\n                               resize-type="image/jpg"\n                               image="entityImage"\n                               resize-max-width="800"\n                               resize-max-height="400"/>\n                    </span>\n                </div>\n                <div class="infoMessages">Size: 800pxx400px</div>\n            </div>\n            <div class="col-sm-6" ng-if="entityImage">\n                <img ng-src="{{entityImage.resized.dataURL}}" class="img-responsive"/>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-12 form-group">\n                <button type="submit"\n                        class="btn btn-primary">{{entity._id ? \'Update\' : \'Add Facility\'}}\n                </button>\n                <button type="submit" ng-if="entity._id" ng-click="remove(entity._id)"\n                        class="btn btn-danger pull-right">Remove Facility\n                </button>\n            </div>\n        </div>\n    </form>\n</div>\n\n<div ng-if="user.facilities && user.facilities.length">\n    <div class="panel-heading manage-listing">\n        <h4 class="panel-title">Manage Suppliers\n            <ng-pluralize class="pull-right" count="user.facilities.length"\n                          when="{\'one\': \'1 facility listed\',\'other\': \'{} facilities listed\'}"></ng-pluralize>\n        </h4>\n    </div>\n    <div class="panel-body">\n        <div ng-repeat="facility in user.facilities">\n            <div class="row form-group result manage-list">\n                <div class="col-sm-9 border-right-dotted">\n                    <h3>{{facility.name}}</h3>\n                    <h6>{{facility.speciality}}</h6>\n                    <h6>Address :-</h6>\n\n                    <p>{{facility.streetOne}}</p>\n\n                    <p ng-if="facility.streetTwo">{{facility.streetTwo}}</p>\n\n                    <p>{{facility.city}}, {{facility.state}}, {{facility.pin}}</p>\n\n                    <p>Phone: {{facility.phoneOne}}<span ng-if="facility.phoneTwo"> / {{facility.phoneTwo}}</span></p>\n\n                    <p>Website: {{facility.url}}</p>\n                </div>\n                <div class="col-sm-3">\n                    <ul class="nav">\n                        <li>\n                            <a href="/account/facilities/{{facility._id}}"><span\n                                    class="glyphicon glyphicon-edit"></span>\n                                Edit</a>\n                        </li>\n                        <li>\n                            <a href ng-click="remove(facility._id)"><span class="glyphicon glyphicon-remove"></span>\n                                Remove</a>\n                        </li>\n                    </ul>\n                </div>\n            </div>\n        </div>\n        <div class="form-group">\n            <a href="/account/facilities/" class="btn btn-sm btn-info pull-right">Add</a>\n        </div>\n    </div>\n</div>')
    }]), angular.module("app/account/settings/manage/account.settings.manage.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/account/settings/manage/account.settings.manage.tpl.html", '<div class="account-settings-manage">\n    <div class="row">\n        <div class="col-sm-6 form-group">\n            <div class="panel-heading profile">\n                <a href="{{quickSettings.profiles.url}}">\n                    <h4 class="panel-title">{{quickSettings.profiles.title}}</h4>\n                </a>\n            </div>\n            <div class="panel-collapse">\n                <div class="panel-body">\n                    <div>\n                        <p>Update your Personal and Contact Details, Registered Address, Phone numbers, Profile Picture etc.</p>\n                        <p><a href="{{quickSettings.profiles.url}}">Click Here</a> to update your profile information.</p>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class="col-sm-6 form-group">\n            <div class="panel-heading enthusiast">\n                <a href="{{quickSettings.enthusiasts.url}}">\n                    <h4 class="panel-title">{{quickSettings.enthusiasts.title}}</h4>\n                </a>\n            </div>\n            <div class="panel-collapse">\n                <div class="panel-body">\n                    <div ng-if="user.enthusiast._id">\n                        <p>Thanks for listing yourself as the "Sport Enthusiasts".</p>\n                        <p><a href="{{quickSettings.enthusiasts.url}}">Click Here</a> to manage your Personal and\n                            Contact details.</p>\n                    </div>\n                    <div ng-if="!user.enthusiast._id">\n                        <p>Enlist yourself as "Sport Enthusiasts" and keep up-to date current sports events /\n                            offers.</p>\n                        <p><a href="{{quickSettings.enthusiasts.url}}">Click Here</a> to list yourself as "Sport\n                            Enthusiast".</p>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n\n    <div class="row">\n        <div class="col-sm-6 form-group">\n            <div class="panel-heading playing">\n                <a href="{{quickSettings.players.url}}">\n                    <h4 class="panel-title">{{quickSettings.players.title}}</h4>\n                </a>\n            </div>\n            <div class="panel-collapse">\n                <div class="panel-body">\n                    <div ng-if="user.player._id">\n                        <p>Thanks for listing yourself as the "Player".</p>\n\n                        <p><a href="{{quickSettings.players.url}}">Click Here</a> to manage your sports details.</p>\n                    </div>\n                    <div ng-if="!user.player._id">\n                        <p>Enlist yourself as "Player" and get to know about players in your area with common\n                            interests.</p>\n\n                        <p><a href="{{quickSettings.players.url}}">Click Here</a> to list yourself as "Player".</p>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class="col-sm-6 form-group">\n            <div class="panel-heading coaching">\n                <a href="{{quickSettings.coaches.url}}">\n                    <h4 class="panel-title">{{quickSettings.coaches.title}}</h4>\n                </a>\n            </div>\n            <div class="panel-collapse">\n                <div class="panel-body">\n                    <div ng-if="user.coach._id">\n                        <p>Thanks for listing yourself as the "Coach".</p>\n\n                        <p><a href="{{quickSettings.coaches.url}}">Click Here</a> to manage your coaching details.</p>\n                    </div>\n                    <div ng-if="!user.coach._id">\n                        <p>Enlist yourself as "Coach" and expand your coaching with the huge justKhelo community.</p>\n\n                        <p><a href="{{quickSettings.coaches.url}}">Click Here</a> to list yourself as "Coach".</p>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n\n\n    <div class="row">\n        <div class="col-sm-6 form-group">\n            <div class="panel-heading facilities">\n                <a href="/{{quickSettings.facilities.url}}">\n                    <h4 class="panel-title">{{quickSettings.facilities.title}}</h4>\n                </a>\n            </div>\n            <div class="panel-collapse">\n                <div class="panel-body">\n                    <div ng-if="user.facilities.length">\n                        <p>Thanks for listing your "Facilities".</p>\n                        <p>You have\n                            <ng-pluralize count="user.facilities.length"\n                                          when="{\'one\': \'1 facility listed.\',\'other\': \'{} facilities listed.\'}">\n\n                            </ng-pluralize>\n                            <a href="{{quickSettings.facilities.url}}">Click Here</a> to manage your facilities.\n                        </p>\n                    </div>\n                    <div ng-if="!user.facilities.length">\n                        <p>Add your "Facilities" to justKhelo and expand your business with huge community.</p>\n\n                        <p><a href="{{quickSettings.coaches.url}}">Click Here</a> to list your "Facility" for free.</p>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class="col-sm-6 form-group">\n            <div class="panel-heading suppliers">\n                <a href="{{quickSettings.suppliers.url}}">\n                    <h4 class="panel-title">{{quickSettings.suppliers.title}}</h4>\n                </a>\n            </div>\n            <div class="panel-collapse">\n                <div class="panel-body">\n                    <div ng-if="user.suppliers.length">\n                        <p>Thanks for listing you as "Supplier".</p>\n\n                        <p>You have\n                            <ng-pluralize count="user.suppliers.length"\n                                          when="{\'one\': \'1 supplier listed.\',\'other\': \'{} suppliers listed.\'}">\n\n                            </ng-pluralize>\n                            <a href="{{quickSettings.suppliers.url}}">Click Here</a> to manage your suppliers.\n                        </p>\n                    </div>\n                    <div ng-if="!user.suppliers.length">\n                        <p>Add you as "Supplier" to justKhelo and expand your business with huge community.</p>\n\n                        <p><a href="{{quickSettings.suppliers.url}}">Click Here</a> to list you as "Supplier" for free.\n                        </p>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n\n\n    <div class="row">\n        <div class="col-sm-6 form-group">\n            <div class="panel-heading events">\n                <a href="{{quickSettings.events.url}}">\n                    <h4 class="panel-title">{{quickSettings.events.title}}</h4>\n                </a>\n            </div>\n            <div class="panel-collapse">\n                <div class="panel-body">\n                    <div ng-if="user.events.length">\n                        <p>Thanks for listing your "Events".</p>\n                        <p>You have\n                            <ng-pluralize count="user.events.length"\n                                          when="{\'one\': \'1 event listed.\',\'other\': \'{} events listed.\'}">\n\n                            </ng-pluralize>\n                            <a href="{{quickSettings.events.url}}">Click Here</a> to manage your events.\n                        </p>\n                    </div>\n                    <div ng-if="!user.events.length">\n                        <p>Add your "Events" to justKhelo and reach with huge community.</p>\n\n                        <p><a href="{{quickSettings.events.url}}">Click Here</a> to list your "Events" for free.</p>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class="col-sm-6 form-group">\n            <div class="panel-heading offers">\n                <a href="{{quickSettings.offers.url}}">\n                    <h4 class="panel-title">{{quickSettings.offers.title}}</h4>\n                </a>\n            </div>\n            <div class="panel-collapse">\n                <div class="panel-body">\n                    <div ng-if="user.offers.length">\n                        <p>Thanks for listing your "Offers".</p>\n                        <p>You have\n                            <ng-pluralize count="user.offers.length"\n                                          when="{\'one\': \'1 offer listed.\',\'other\': \'{} offers listed.\'}">\n\n                            </ng-pluralize>\n                            <a href="{{quickSettings.offers.url}}">Click Here</a> to manage your offers.\n                        </p>\n                    </div>\n                    <div ng-if="!user.offers.length">\n                        <p>Add your "Offers" to justKhelo and reach with huge community.</p>\n\n                        <p><a href="{{quickSettings.offers.url}}">Click Here</a> to list your "Offers" for free.</p>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n\n</div>')
    }]), angular.module("app/account/settings/offers/account.settings.offers.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/account/settings/offers/account.settings.offers.tpl.html", '<div class="panel-heading offers">\n    <h4 class="panel-title">Do you have exciting Offer for sport enthusiasts ?</h4>\n</div>\n\n<div class="panel-body">\n    <form name="offerForm" role="form" ng-submit="submit(offerForm)">\n        <div class="row">\n            <div class="col-sm-5 form-group">\n                <input type="text"\n                       name="provider"\n                       class="form-control"\n                       placeholder="Offer Provider"\n                       ng-model="entity.provider"\n                       minlength="3"\n                       maxlength="40"\n                       required/>\n\n                <div ng-if="offerForm.provider.$dirty" ng-messages="offerForm.provider.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{offerForm.provider.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-7 form-group">\n                <input type="text"\n                       name="heading"\n                       class="form-control"\n                       placeholder="Offer Heading"\n                       ng-model="entity.heading"\n                       minlength="5"\n                       maxlength="70"\n                       required/>\n\n                <div ng-if="offerForm.heading.$dirty" ng-messages="offerForm.heading.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{offerForm.heading.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-8 form-group">\n                <textarea name="description"\n                          class="form-control"\n                          placeholder="Offer Description"\n                          ng-model="entity.description"\n                          minlength="5"\n                          maxlength="200"\n                          required> </textarea>\n\n                <div ng-if="offerForm.description.$dirty" ng-messages="offerForm.description.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{offerForm.description.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-5 form-group">\n                <div class="input-group">\n                    <input type="text"\n                           name="startDate"\n                           class="form-control"\n                           datepicker-popup="dd-MMMM-yyyy"\n                           show-button-bar="false"\n                           ng-model="entity.startDate"\n                           is-open="startDatePickerOpened"\n                           placeholder="Offer Start Date"\n                           datepicker-options="datePickerOptions"\n                           ng-change="dateTimePickerChanged(\'startDatePickerOpened\')"\n                           ng-required="true"/>\n                    <span class="input-group-addon" ng-click="openDateTimePicker($event, \'startDatePickerOpened\')"><i\n                            class="glyphicon glyphicon-calendar"></i></span>\n                </div>\n                <div ng-if="offerForm.startDate.$dirty" ng-messages="offerForm.startDate.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{offerForm.startDate.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-5 form-group pull-right">\n                <div class="input-group">\n                    <input type="text"\n                           name="endDate"\n                           class="form-control"\n                           datepicker-popup="dd-MMMM-yyyy"\n                           show-button-bar="false"\n                           ng-model="entity.endDate"\n                           is-open="endDatePickerOpened"\n                           placeholder="Offer End Date"\n                           datepicker-options="datePickerOptions"\n                           ng-change="dateTimePickerChanged(\'endDatePickerOpened\')"\n                           ng-required="true"/>\n                    <span class="input-group-addon" ng-click="openDateTimePicker($event, \'endDatePickerOpened\')"><i\n                            class="glyphicon glyphicon-calendar"></i></span>\n                </div>\n                <div ng-if="offerForm.endDate.$dirty" ng-messages="offerForm.endDate.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{offerForm.endDate.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-6 form-group">\n                <input type="text"\n                       name="streetOne"\n                       class="form-control"\n                       placeholder="Address Line 1"\n                       ng-model="entity.streetOne"\n                       minlength="5"\n                       maxlength="70"\n                       required/>\n\n                <div ng-if="offerForm.streetOne.$dirty" ng-messages="offerForm.streetOne.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{offerForm.streetOne.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-6 form-group">\n                <input type="text"\n                       name="streetTwo"\n                       class="form-control"\n                       placeholder="Address Line 2"\n                       ng-model="entity.streetTwo"/>\n\n                <div ng-if="offerForm.streetTwo.$dirty" ng-messages="offerForm.streetTwo.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{offerForm.streetTwo.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-4 form-group">\n                <select name="city"\n                        class="form-control"\n                        ng-model="entity.city"\n                        ng-options="city as city for city in cities"\n                        required>\n                    <option value="">Select City</option>\n                </select>\n\n                <div ng-if="offerForm.city.$dirty" ng-messages="offerForm.city.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{offerForm.city.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <select name="state"\n                        class="form-control"\n                        ng-model="entity.state"\n                        ng-options="state as state for state in states"\n                        required>\n                    <option value="">Select State</option>\n                </select>\n\n                <div ng-if="offerForm.state.$dirty" ng-messages="offerForm.state.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{offerForm.state.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <input type="text"\n                       name="pin"\n                       class="form-control"\n                       placeholder="PIN"\n                       ng-model="entity.pin"\n                       maxlength="6"\n                       minlength="6"\n                       required/>\n\n                <div ng-if="offerForm.pin.$dirty" ng-messages="offerForm.pin.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{offerForm.pin.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col.sm-12 form-group">\n                <div id="addr-map-canvas"></div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-4 form-group">\n                <input type="email"\n                       name="email"\n                       class="form-control"\n                       placeholder="Contact Email"\n                       ng-model="entity.email"\n                       required/>\n\n                <div ng-if="offerForm.email.$dirty" ng-messages="offerForm.email.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{offerForm.email.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <input type="tel"\n                       name="phoneOne"\n                       class="form-control"\n                       placeholder="Contact Phone 1"\n                       ng-model="entity.phoneOne"\n                       minlength="10"\n                       maxlength="10"\n                       length="10"\n                       required/>\n\n                <div ng-if="offerForm.phoneOne.$dirty" ng-messages="offerForm.phoneOne.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{offerForm.phoneOne.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <input type="tel"\n                       name="phoneTwo"\n                       class="form-control"\n                       placeholder="Contact Phone 2"\n                       ng-model="entity.phoneTwo"\n                       minlength="10"\n                       maxlength="10"\n                       length="10"/>\n\n                <div ng-if="offerForm.phoneTwo.$dirty" ng-messages="offerForm.phoneTwo.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{offerForm.phoneTwo.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-8 form-group">\n                <input type="url"\n                       name="url"\n                       class="form-control"\n                       placeholder="Offer url"\n                       ng-model="entity.url"\n                       required/>\n\n                <div ng-if="offerForm.url.$dirty" ng-messages="offerForm.url.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{offerForm.url.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row border-bottom form-group">\n            <div class="col-sm-5 form-group">\n                <div class="input-group">\n                    <input type="text" placeholder="Offer Pic (200x100)" value="{{entityImage.name}}" class="form-control">\n                    <span class="input-group-addon btn btn-default btn-file">\n                        Browse\n                        <input type="file"\n                               accept="image/*"\n                               resize-type="image/jpg"\n                               image="entityImage"\n                               resize-max-width="200"\n                               resize-max-height="100"/>\n                    </span>\n                </div>\n                <div class="infoMessages">Size: 200x100px</div>\n            </div>\n            <div class="col-sm-6" ng-if="entityImage">\n                <img ng-src="{{entityImage.resized.dataURL}}"/>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-12 form-group">\n                <button type="submit"\n                        class="btn btn-primary">{{entity._id ? \'Update\' : \'Add Offer\'}}\n                </button>\n                <button type="submit" ng-if="entity._id" ng-click="remove(entity._id)"\n                        class="btn btn-danger pull-right">Remove Offer\n                </button>\n            </div>\n        </div>\n    </form>\n</div>\n\n\n<div ng-if="user.offers && user.offers.length">\n    <div class="panel-heading manage-listing">\n        <h4 class="panel-title">Manage Offers\n            <ng-pluralize class="pull-right" count="user.offers.length"\n                          when="{\'one\': \'1 offer listed\',\'other\': \'{} offers listed\'}"></ng-pluralize>\n        </h4>\n    </div>\n    <div class="panel-body">\n        <div ng-repeat="offer in user.offers">\n            <div class="row form-group result manage-list">\n                <div class="col-sm-9 border-right-dotted">\n                    <h3>{{offer.provider}}</h3>\n                    <h6>{{offer.heading}}</h6>\n\n                    <p>Validity: {{offer.startDate | date}} - {{offer.endDate | date}}</p>\n                    <h6>Address :-</h6>\n\n                    <p>{{offer.streetOne}}</p>\n\n                    <p ng-if="offer.streetTwo">{{offer.streetTwo}}</p>\n\n                    <p>{{offer.city}} {{offer.state}} {{offer.pin}}</p>\n\n                    <p>Phone: {{offer.phoneOne}}<span ng-if="offer.phoneTwo"> / {{offer.phoneTwo}}</span></p>\n\n                    <p>Website: {{offer.url}}</p>\n                </div>\n                <div class="col-sm-3">\n                    <ul class="nav">\n                        <li>\n                            <a href="/account/offers/{{offer._id}}"><span class="glyphicon glyphicon-edit"></span> Edit</a>\n                        </li>\n                        <li>\n                            <a href ng-click="remove(offer._id)"><span class="glyphicon glyphicon-remove"></span> Remove</a>\n                        </li>\n                    </ul>\n                </div>\n            </div>\n        </div>\n        <div class="form-group">\n            <a href="/account/offers/" class="btn btn-sm btn-info pull-right">Add</a>\n        </div>\n    </div>\n</div>\n\n\n')
    }]), angular.module("app/account/settings/players/account.settings.players.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/account/settings/players/account.settings.players.tpl.html", '<div class="panel-heading playing">\n    <h4 class="panel-title">About your sports</h4>\n</div>\n<div>\n    <div class="panel-body">\n        <form name="playerForm" role="form" ng-submit="submit(playerForm)">\n\n            <div class="row">\n                <div class="col-sm-12 form-group">\n                    To update your personal & contact details in profile section please <a href="/account/profiles/{{user.profile._id}}">Click Here</a>.\n                </div>\n                <input type="hidden" name="profile" ng-init="entity.profile=user.profile._id" ng-model="entity.profile"/>\n            </div>\n\n            <div class="row">\n                <div class="col-sm-12 form-group">\n                <textarea name="aboutPlaying"\n                          class="form-control"\n                          placeholder="About your playing...."\n                          ng-model="entity.aboutPlaying"\n                          minlength="5"\n                          maxlength="400"\n                          required> </textarea>\n\n                    <div ng-if="playerForm.aboutPlaying.$dirty" ng-messages="playerForm.aboutPlaying.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{playerForm.aboutPlaying.$error.serverMessage}}</div>\n                    </div>\n                </div>\n            </div>\n\n            <div class="row border-bottom form-group">\n\n                <div class="col-sm-12 form-group">\n                    <tabset>\n                        <tab ng-if="entity.sports.length" ng-repeat="sport in entity.sports"\n                             heading="{{sport.name || \'Sport \'+($index+1)}}" active="sport.active" select="tabChanged($index)">\n                            <div class="panel-body">\n\n                                <div class="row">\n                                    <div class="col-sm-1 form-group pull-right">\n                                        <a href ng-click="removeTab($index, \'sports\')"><span\n                                                class="glyphicon glyphicon-remove"></span></a>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-7 form-group">\n                                        <select name="{{\'name\'+$index}}"\n                                                class="form-control"\n                                                ng-model="sport.name"\n                                                ng-options="sport as sport for sport in sports"\n                                                required>\n                                            <option value="">Which Sport Activity you like ?</option>\n                                        </select>\n\n                                        <div ng-if="playerForm[\'name\'+$index].$dirty"\n                                             ng-messages="playerForm[\'name\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{playerForm[\'name\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-5 form-group">\n                                        <select name="{{\'experienceYears\'+$index}}"\n                                                class="form-control"\n                                                ng-model="sport.experienceYears"\n                                                ng-options="experienceYear as experienceYear for experienceYear in experienceYears"\n                                                required>\n                                            <option value="">Years of experience</option>\n                                        </select>\n\n                                        <div ng-if="playerForm[\'experienceYears\'+$index].$dirty"\n                                             ng-messages="playerForm[\'experienceYears\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{playerForm[\'experienceYears\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-6 form-group">\n                                        <p>How frequently you play:</p>\n                                        <select name="{{\'playingFrequency\'+$index}}"\n                                                class="form-control"\n                                                ng-model="sport.playingFrequency"\n                                                ng-options="playingFrequency as playingFrequency for playingFrequency in playingFrequencies"\n                                                required>\n                                            <option value="">When do you play ?</option>\n                                        </select>\n\n                                        <div ng-if="playerForm[\'playingFrequency\'+$index].$dirty"\n                                             ng-messages="playerForm[\'playingFrequency\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{playerForm[\'playingFrequency\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-5 form-group">\n                                        <div class="input-group">\n                                            <input type="text"\n                                                   name="startTime"\n                                                   class="form-control"\n                                                   timepicker-popup="h:mm a"\n                                                   ng-model="sport.startTime"\n                                                   is-open="startTimePickerOpened"\n                                                   placeholder="Playing Start Time"\n                                                   ng-change="dateTimePickerChanged(\'startTimePickerOpened\')"\n                                                   ng-required="true"/>\n\n                                            <div ng-if="playerForm[\'startTime\'+$index].$dirty"\n                                                 ng-messages="playerForm[\'startTime\'+$index].$error"\n                                                 class="errorMessages"\n                                                 ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                                <div ng-message="server">\n                                                    {{playerForm[\'startTime\'+$index].$error.serverMessage}}\n                                                </div>\n                                            </div>\n                                            <span class="input-group-addon"\n                                                  ng-click="openDateTimePicker($event, \'startTimePickerOpened\')"><i\n                                                    class="glyphicon glyphicon-dashboard"></i></span>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-5 form-group">\n                                        <div class="input-group">\n                                            <input type="text"\n                                                   name="endTime"\n                                                   class="form-control"\n                                                   timepicker-popup="h:mm a"\n                                                   ng-model="sport.endTime"\n                                                   is-open="endTimePickerOpened"\n                                                   placeholder="Playing End Time"\n                                                   ng-change="dateTimePickerChanged(\'endTimePickerOpened\')"\n                                                   ng-required="true"/>\n\n                                            <div ng-if="playerForm[\'endTime\'+$index].$dirty"\n                                                 ng-messages="playerForm[\'endTime\'+$index].$error"\n                                                 class="errorMessages"\n                                                 ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                                <div ng-message="server">\n                                                    {{playerForm[\'endTime\'+$index].$error.serverMessage}}\n                                                </div>\n                                            </div>\n                                            <span class="input-group-addon"\n                                                  ng-click="openDateTimePicker($event, \'endTimePickerOpened\')"><i\n                                                    class="glyphicon glyphicon-dashboard"></i></span>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-6 form-group">\n                                        <p>Where do you play:</p>\n                                        <input type="text"\n                                               name="streetOne"\n                                               class="form-control"\n                                               placeholder="Address Line 1"\n                                               ng-model="sport.streetOne"\n                                               minlength="5"\n                                               maxlength="70"\n                                               required/>\n\n                                        <div ng-if="playerForm[\'streetOne\'+$index].$dirty"\n                                             ng-messages="playerForm[\'streetOne\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{playerForm[\'streetOne\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-6 form-group">\n                                        <input type="text"\n                                               name="streetTwo"\n                                               class="form-control"\n                                               placeholder="Address Line 2"\n                                               ng-model="sport.streetTwo"/>\n\n                                        <div ng-if="playerForm[\'streetTwo\'+$index].$dirty"\n                                             ng-messages="playerForm[\'streetTwo\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{playerForm[\'streetTwo\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col-sm-4 form-group">\n                                        <select name="city"\n                                                class="form-control"\n                                                ng-model="sport.city"\n                                                ng-options="city as city for city in cities"\n                                                required>\n                                            <option value="">Select City</option>\n                                        </select>\n\n                                        <div ng-if="playerForm[\'city\'+$index].$dirty"\n                                             ng-messages="playerForm[\'city\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{playerForm[\'city\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-4 form-group">\n                                        <select name="state"\n                                                class="form-control"\n                                                ng-model="sport.state"\n                                                ng-options="state as state for state in states"\n                                                required>\n                                            <option value="">Select State</option>\n                                        </select>\n\n                                        <div ng-if="playerForm[\'state\'+$index].$dirty"\n                                             ng-messages="playerForm[\'state\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">\n                                                {{playerForm[\'state\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class="col-sm-4 form-group">\n                                        <input type="text"\n                                               name="pin"\n                                               class="form-control"\n                                               placeholder="PIN"\n                                               ng-model="sport.pin"\n                                               maxlength="6"\n                                               minlength="6"\n                                               required/>\n\n                                        <div ng-if="playerForm[\'pin\'+$index].$dirty"\n                                             ng-messages="playerForm[\'pin\'+$index].$error"\n                                             class="errorMessages"\n                                             ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                                            <div ng-message="server">{{playerForm[\'pin\'+$index].$error.serverMessage}}\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="row">\n                                    <div class="col.sm-12 form-group">\n                                        <div class="map-canvas" id="{{\'addr-map-canvas\'+$index}}"></div>\n                                    </div>\n                                </div>\n\n                            </div>\n                        </tab>\n                        <tab-heading>\n                            <a ng-click="addTab(playerForm, \'sports\')" class="add-sport"><i\n                                    class="glyphicon glyphicon-plus-sign"></i> Add Sport</a>\n                        </tab-heading>\n                    </tabset>\n                </div>\n\n            </div>\n\n            <div class="row">\n                <div class="col-sm-12 form-group">\n                    <button type="submit"\n                            class="btn btn-primary">{{entity._id ? \'Update listing\' : \'Enlist as Player\'}}\n                    </button>\n                    <button type="submit"\n                            ng-if="entity._id"\n                            ng-click="remove(entity._id)"\n                            class="btn btn-danger pull-right">Remove Listing\n                    </button>\n                </div>\n            </div>\n\n        </form>\n    </div>\n</div>')
    }]), angular.module("app/account/settings/profiles/account.settings.profiles.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/account/settings/profiles/account.settings.profiles.tpl.html", '<div class="panel-heading profile">\n    <h4 class="panel-title">Personal & Contact Details</h4>\n</div>\n<div class="panel-collapse" id="personalDetails">\n    <div class="panel-body">\n        <form name="profileForm" role="form" ng-submit="submit(profileForm)">\n\n            <div class="row">\n                <div class="col-sm-4 form-group">\n                    <input\n                            type="text"\n                            name="firstName"\n                            class="form-control"\n                            placeholder="First Name"\n                            ng-model="entity.firstName"\n                            minlength="1"\n                            required/>\n\n                    <div ng-if="profileForm.firstName.$dirty" ng-messages="profileForm.firstName.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.firstName.$error.serverMessage}}</div>\n                    </div>\n                </div>\n                <div class="col-sm-4 form-group">\n                    <input\n                            type="text"\n                            name="lastName"\n                            class="form-control"\n                            placeholder="Last Name"\n                            ng-model="entity.lastName"\n                            minlength="1"\n                            required/>\n\n                    <div ng-if="profileForm.lastName.$dirty" ng-messages="profileForm.lastName.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.lastName.$error.serverMessage}}</div>\n                    </div>\n                </div>\n            </div>\n\n            <div class="row">\n                <div class="col-sm-4 form-group">\n                    <select name="gender"\n                            class="form-control"\n                            ng-model="entity.gender"\n                            ng-options="gender as gender for gender in genders"\n                            required>\n                        <option value="">Select Gender</option>\n                    </select>\n\n                    <div ng-if="profileForm.gender.$dirty" ng-messages="profileForm.gender.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.gender.$error.serverMessage}}</div>\n                    </div>\n                </div>\n                <div class="col-sm-4 form-group">\n                    <div class="input-group">\n                        <input type="text"\n                               name="birthDate"\n                               class="form-control"\n                               datepicker-popup="MMM d, y"\n                               show-button-bar="false"\n                               ng-model="entity.birthDate"\n                               is-open="birthDatePickerOpened"\n                               placeholder="Date of Birth"\n                               datepicker-options="datePickerOptions"\n                               ng-change="dateTimePickerChanged(\'birthDatePickerOpened\')"\n                               ng-required="true"/>\n\n                        <div ng-if="profileForm.birthDate.$dirty" ng-messages="profileForm.birthDate.$error"\n                             class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                            <div ng-message="server">{{profileForm.birthDate.$error.serverMessage}}</div>\n                        </div>\n                    <span class="input-group-addon" ng-click="openDateTimePicker($event, \'birthDatePickerOpened\')"><i\n                            class="glyphicon glyphicon-calendar"></i></span>\n                    </div>\n                </div>\n                <div class="col-sm-4 form-group">\n                    <input\n                            type="text"\n                            name="nationality"\n                            class="form-control"\n                            placeholder="Nationality"\n                            ng-model="entity.nationality"\n                            minlength="1"\n                            required/>\n\n                    <div ng-if="profileForm.nationality.$dirty" ng-messages="profileForm.nationality.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.nationality.$error.serverMessage}}</div>\n                    </div>\n                </div>\n            </div>\n\n            <div class="row">\n                <div class="col-sm-4 form-group">\n                    <input type="email"\n                           name="email"\n                           class="form-control"\n                           placeholder="Contact Email"\n                           ng-model="entity.email"\n                           required/>\n\n                    <div ng-if="profileForm.email.$dirty" ng-messages="profileForm.email.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.email.$error.serverMessage}}</div>\n                    </div>\n                </div>\n                <div class="col-sm-4 form-group">\n                    <input type="tel"\n                           name="cellPhone"\n                           class="form-control"\n                           placeholder="Cell Phone"\n                           ng-model="entity.cellPhone"\n                           minlength="10"\n                           maxlength="10"\n                           length="10"\n                           required/>\n\n                    <div ng-if="profileForm.cellPhone.$dirty" ng-messages="profileForm.cellPhone.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.cellPhone.$error.serverMessage}}</div>\n                    </div>\n                </div>\n                <div class="col-sm-4 form-group">\n                    <input type="tel"\n                           name="workPhone"\n                           class="form-control"\n                           placeholder="Work Phone"\n                           ng-model="entity.workPhone"\n                           minlength="10"\n                           maxlength="10"\n                           length="10"/>\n\n                    <div ng-if="profileForm.workPhone.$dirty" ng-messages="profileForm.workPhone.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.workPhone.$error.serverMessage}}</div>\n                    </div>\n                </div>\n            </div>\n\n            <div class="row">\n                <div class="col-sm-6 form-group">\n                    <input type="text"\n                           name="streetOne"\n                           class="form-control"\n                           placeholder="Address Line 1"\n                           ng-model="entity.streetOne"\n                           minlength="5"\n                           maxlength="70"\n                           required/>\n\n                    <div ng-if="profileForm.streetOne.$dirty" ng-messages="profileForm.streetOne.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.streetOne.$error.serverMessage}}</div>\n                    </div>\n                </div>\n            </div>\n\n            <div class="row">\n                <div class="col-sm-6 form-group">\n                    <input type="text"\n                           name="streetTwo"\n                           class="form-control"\n                           placeholder="Address Line 2"\n                           ng-model="entity.streetTwo"/>\n\n                    <div ng-if="profileForm.streetTwo.$dirty" ng-messages="profileForm.streetTwo.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.streetTwo.$error.serverMessage}}</div>\n                    </div>\n                </div>\n            </div>\n\n            <div class="row">\n                <div class="col-sm-4 form-group">\n                    <select name="city"\n                            class="form-control"\n                            ng-model="entity.city"\n                            ng-options="city as city for city in cities"\n                            required>\n                        <option value="">Select City</option>\n                    </select>\n\n                    <div ng-if="profileForm.city.$dirty" ng-messages="profileForm.city.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.city.$error.serverMessage}}</div>\n                    </div>\n                </div>\n                <div class="col-sm-4 form-group">\n                    <select name="state"\n                            class="form-control"\n                            ng-model="entity.state"\n                            ng-options="state as state for state in states"\n                            required>\n                        <option value="">Select State</option>\n                    </select>\n\n                    <div ng-if="profileForm.state.$dirty" ng-messages="profileForm.state.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.state.$error.serverMessage}}</div>\n                    </div>\n                </div>\n                <div class="col-sm-4 form-group">\n                    <input type="text"\n                           name="pin"\n                           class="form-control"\n                           placeholder="PIN"\n                           ng-model="entity.pin"\n                           maxlength="6"\n                           minlength="6"\n                           length="6"\n                           required/>\n\n                    <div ng-if="profileForm.pin.$dirty" ng-messages="profileForm.pin.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.pin.$error.serverMessage}}</div>\n                    </div>\n                </div>\n            </div>\n\n            <div class="row">\n                <div class="col.sm-12 form-group">\n                    <div id="addr-map-canvas"></div>\n                </div>\n            </div>\n\n            <div class="row">\n                <div class="col-sm-6 form-group">\n                    <input type="url"\n                           name="facebookUrl"\n                           class="form-control"\n                           placeholder="Facebook URL"\n                           ng-model="entity.facebookUrl"\n                            />\n\n                    <div ng-if="profileForm.facebookUrl.$dirty" ng-messages="profileForm.facebookUrl.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.facebookUrl.$error.serverMessage}}</div>\n                    </div>\n                </div>\n\n                <div class="col-sm-6 form-group">\n                    <input type="url"\n                           name="youtubeUrl"\n                           class="form-control"\n                           placeholder="Youtube URL"\n                           ng-model="entity.youtubeUrl"\n                            />\n\n                    <div ng-if="profileForm.youtubeUrl.$dirty" ng-messages="profileForm.youtubeUrl.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.youtubeUrl.$error.serverMessage}}</div>\n                    </div>\n                </div>\n            </div>\n\n            <div class="row">\n                <div class="col-sm-6 form-group">\n                    <input type="url"\n                           name="websiteUrl"\n                           class="form-control"\n                           placeholder="Website URL"\n                           ng-model="entity.websiteUrl"\n                            />\n\n                    <div ng-if="profileForm.websiteUrl.$dirty" ng-messages="profileForm.websiteUrl.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.websiteUrl.$error.serverMessage}}</div>\n                    </div>\n                </div>\n                <div class="col-sm-6 form-group">\n                    <input type="url"\n                           name="otherUrl"\n                           class="form-control"\n                           placeholder="Any other URL"\n                           ng-model="entity.otherUrl"\n                            />\n\n                    <div ng-if="profileForm.otherUrl.$dirty" ng-messages="profileForm.otherUrl.$error"\n                         class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                        <div ng-message="server">{{profileForm.otherUrl.$error.serverMessage}}</div>\n                    </div>\n                </div>\n            </div>\n\n            <div class="row border-bottom form-group">\n                <div class="col-sm-5 form-group">\n                    <div class="input-group">\n                        <input type="text" placeholder="Profile Pic" value="{{entityImage.name}}" class="form-control">\n                    <span class="input-group-addon btn btn-default btn-file">\n                        Browse\n                        <input type="file"\n                               accept="image/*"\n                               resize-type="image/jpg"\n                               image="entityImage"\n                               resize-max-width="200"\n                               resize-max-height="200"/>\n                    </span>\n                    </div>\n                    <div class="infoMessages">Size: 200x200px</div>\n                </div>\n                <div class="col-sm-6" ng-if="entityImage">\n                    <img ng-src="{{entityImage.resized.dataURL}}"/>\n                </div>\n            </div>\n\n            <div class="row">\n                <div class="col-sm-12 form-group">\n                    <button type="submit"\n                            class="btn btn-primary">Update Profile\n                    </button>\n                </div>\n            </div>\n        </form>\n    </div>\n</div>')
    }]), angular.module("app/account/settings/suppliers/account.settings.suppliers.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/account/settings/suppliers/account.settings.suppliers.tpl.html", '<div class="panel-heading suppliers">\n    <h4 class="panel-title">Are you a Sport accessories supplier ?</h4>\n</div>\n\n<div class="panel-body">\n    <form name="supplierForm" role="form" ng-submit="submit(supplierForm)">\n        <div class="row">\n            <div class="col-sm-5 form-group">\n                <input type="text"\n                       name="name"\n                       class="form-control"\n                       placeholder="Supplier Name"\n                       ng-model="entity.name"\n                       minlength="3"\n                       maxlength="40"\n                       required/>\n\n                <div ng-if="supplierForm.name.$dirty" ng-messages="supplierForm.name.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{supplierForm.name.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-7 form-group">\n                <input type="text"\n                       name="speciality"\n                       class="form-control"\n                       placeholder="Supplier Speciality"\n                       ng-model="entity.speciality"\n                       minlength="5"\n                       maxlength="70"\n                       required/>\n\n                <div ng-if="supplierForm.speciality.$dirty" ng-messages="supplierForm.speciality.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{supplierForm.speciality.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-8 form-group">\n                <textarea name="description"\n                          class="form-control"\n                          placeholder="Supplier Description"\n                          ng-model="entity.description"\n                          minlength="5"\n                          maxlength="200"\n                          required> </textarea>\n\n                <div ng-if="supplierForm.description.$dirty" ng-messages="supplierForm.description.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{supplierForm.description.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-6 form-group">\n                <input type="text"\n                       name="streetOne"\n                       class="form-control"\n                       placeholder="Address Line 1"\n                       ng-model="entity.streetOne"\n                       minlength="5"\n                       maxlength="70"\n                       required/>\n\n                <div ng-if="supplierForm.streetOne.$dirty" ng-messages="supplierForm.streetOne.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{supplierForm.streetOne.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-6 form-group">\n                <input type="text"\n                       name="streetTwo"\n                       class="form-control"\n                       placeholder="Address Line 2"\n                       ng-model="entity.streetTwo"/>\n\n                <div ng-if="supplierForm.streetTwo.$dirty" ng-messages="supplierForm.streetTwo.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{supplierForm.streetTwo.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-4 form-group">\n                <select name="city"\n                        class="form-control"\n                        ng-model="entity.city"\n                        ng-options="city as city for city in cities"\n                        required>\n                    <option value="">Select City</option>\n                </select>\n\n                <div ng-if="supplierForm.city.$dirty" ng-messages="supplierForm.city.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{supplierForm.city.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <select name="state"\n                        class="form-control"\n                        ng-model="entity.state"\n                        ng-options="state as state for state in states"\n                        required>\n                    <option value="">Select State</option>\n                </select>\n\n                <div ng-if="supplierForm.state.$dirty" ng-messages="supplierForm.state.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{supplierForm.state.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <input type="text"\n                       name="pin"\n                       class="form-control"\n                       placeholder="PIN"\n                       ng-model="entity.pin"\n                       maxlength="6"\n                       minlength="6"\n                       length="6"\n                       required/>\n\n                <div ng-if="supplierForm.pin.$dirty" ng-messages="supplierForm.pin.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{supplierForm.pin.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col.sm-12 form-group">\n                <div id="addr-map-canvas"></div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-4 form-group">\n                <input type="email"\n                       name="email"\n                       class="form-control"\n                       placeholder="Contact Email"\n                       ng-model="entity.email"\n                       required/>\n\n                <div ng-if="supplierForm.email.$dirty" ng-messages="supplierForm.email.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{supplierForm.email.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <input type="tel"\n                       name="phoneOne"\n                       class="form-control"\n                       placeholder="Contact Phone 1"\n                       ng-model="entity.phoneOne"\n                       minlength="10"\n                       maxlength="10"\n                       length="10"\n                       required/>\n\n                <div ng-if="supplierForm.phoneOne.$dirty" ng-messages="supplierForm.phoneOne.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{supplierForm.phoneOne.$error.serverMessage}}</div>\n                </div>\n            </div>\n            <div class="col-sm-4 form-group">\n                <input type="tel"\n                       name="phoneTwo"\n                       class="form-control"\n                       placeholder="Contact Phone 2"\n                       ng-model="entity.phoneTwo"\n                       minlength="10"\n                       maxlength="10"\n                       length="10"/>\n\n                <div ng-if="supplierForm.phoneTwo.$dirty" ng-messages="supplierForm.phoneTwo.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{supplierForm.phoneTwo.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-8 form-group">\n                <input type="url"\n                       name="url"\n                       class="form-control"\n                       placeholder="Supplier website"\n                       ng-model="entity.url"\n                       required/>\n\n                <div ng-if="supplierForm.url.$dirty" ng-messages="supplierForm.url.$error"\n                     class="errorMessages" ng-messages-include="app/shared/errors/errors.messages.tpl.html">\n                    <div ng-message="server">{{supplierForm.url.$error.serverMessage}}</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="row border-bottom form-group">\n            <div class="col-sm-5 form-group">\n                <div class="input-group">\n                    <input type="text" placeholder="Supplier Pic" value="{{entityImage.name}}" class="form-control">\n                    <span class="input-group-addon btn btn-default btn-file">\n                        Browse\n                        <input type="file"\n                               accept="image/*"\n                               resize-type="image/jpg"\n                               image="entityImage"\n                               resize-max-width="200"\n                               resize-max-height="200"/>\n                    </span>\n                </div>\n                <div class="infoMessages">Size: 200x200px</div>\n            </div>\n            <div class="col-sm-6" ng-if="entityImage">\n                <img ng-src="{{entityImage.resized.dataURL}}"/>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-sm-12 form-group">\n                <button type="submit"\n                        class="btn btn-primary">{{entity._id ? \'Update\' : \'Add Supplier\'}}\n                </button>\n                <button type="submit" ng-if="entity._id" ng-click="remove(entity._id)"\n                        class="btn btn-danger pull-right">Remove Supplier\n                </button>\n            </div>\n        </div>\n    </form>\n</div>\n\n\n<div ng-if="user.suppliers && user.suppliers.length">\n    <div class="panel-heading manage-listing">\n        <h4 class="panel-title">Manage Suppliers\n            <ng-pluralize class="pull-right" count="user.suppliers.length"\n                          when="{\'one\': \'1 supplier listed\',\'other\': \'{} suppliers listed\'}"></ng-pluralize>\n        </h4>\n    </div>\n    <div class="panel-body">\n        <div ng-repeat="supplier in user.suppliers">\n            <div class="row form-group result manage-list">\n                <div class="col-sm-9 border-right-dotted">\n                    <h3>{{supplier.name}}</h3>\n                    <h6>{{supplier.speciality}}</h6>\n                    <h6>Address :-</h6>\n\n                    <p>{{supplier.streetOne}}</p>\n\n                    <p ng-if="supplier.streetTwo">{{supplier.streetTwo}}</p>\n\n                    <p>{{supplier.city}}, {{supplier.state}}, {{supplier.pin}}</p>\n\n                    <p>Phone: {{supplier.phoneOne}}<span ng-if="supplier.phoneTwo"> / {{supplier.phoneTwo}}</span></p>\n\n                    <p>Website: {{supplier.url}}</p>\n                </div>\n                <div class="col-sm-3">\n                    <ul class="nav">\n                        <li>\n                            <a href="/account/suppliers/{{supplier._id}}"><span class="glyphicon glyphicon-edit"></span>\n                                Edit</a>\n                        </li>\n                        <li>\n                            <a href ng-click="remove(supplier._id)"><span class="glyphicon glyphicon-remove"></span>\n                                Remove</a>\n                        </li>\n                    </ul>\n                </div>\n            </div>\n        </div>\n        <div class="form-group">\n            <a href="/account/suppliers/" class="btn btn-sm btn-info pull-right">Add</a>\n        </div>\n    </div>\n</div>')
    }]), angular.module("app/coaches/details/coaches.details.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/coaches/details/coaches.details.tpl.html", '<section>\n    <!--Banner Carousel-->\n    <div class="container form-group banner border-btm">\n        <div class="col-sm-3 col-lg-3 form-group">&nbsp;</div>\n        <div class="col-sm-7 col-lg-7">\n            <div class="form-group">\n                <p class="pull-right pagging"><a href="#"><i class="glyphicon glyphicon-chevron-left"></i> Back to\n                    Results</a>&nbsp;&nbsp;<a href="#"><i class="glyphicon glyphicon-chevron-left"></i> Previous</a>&nbsp;&nbsp;<a\n                        href="#">Next <i class="glyphicon glyphicon-chevron-right"></i> </a></p>\n            </div>\n        </div>\n\n    </div>\n    <!--Banner Carousel-->\n    <div class="container">\n        <!--Search Option for Mobile-->\n        <div class="search-mob">\n            <div class=\'input-group search-group pull-left\'>\n                <span class=\'input-group-addon searchFilter\'><i class=\'glyphicon glyphicon-align-justify\'></i> <i\n                        class=\'glyphicon glyphicon-chevron-down\'></i></span>\n                <input type=\'text\' class=\'form-control typeahead\' id=\'search\'\n                       placeholder="Search for Coach / Facilities / Players / Facilities">\n            </div>\n            <div>\n                <button class="btn btn-primary pull-left">GO</button>\n            </div>\n            <div class="search-filters collapse">\n                <ul>\n                    <li><a href="#" class="all search-img"><span>All</span></a></li>\n                    <li><a href="#" class="coaches search-img"><span>Coaches</span></a></li>\n                    <li><a href="#" class="players search-img"><span>Players</span></a></li>\n                    <li><a href="#" class="facilities search-img"><span>Facilities</span></a></li>\n                    <li><a href="#" class="suppliers search-img"><span>Suppliers</span></a></li>\n                    <li><a href="#" class="events search-img"><span>Events</span></a></li>\n                </ul>\n            </div>\n        </div>\n        <!--Search Option for Mobile-->\n        <div class="row">\n            <div class="col-sm-3 col-lg-3 ">\n                <div class="welcome-block">MILIND N JOSHI</div>\n                <div class="coach-img"><img src="assets/images/coach.jpg" class="img-responsive "/></div>\n                <div class="settings form-group">\n                    <p>\n                        <span class="pull-left"><span class="star-green"></span><span class="star-green"></span><span\n                                class="star-green"></span><span class="star-grey-green"></span><span\n                                class="star-grey"></span></span>\n                        <span class="pull-right"><img src="assets/images/review.png"/> Reviews <a\n                                href="#">(223)</a></span>\n                    </p>\n\n                    <div class="clear-both"><img src="assets/images/likes.gif" class="pull-left"/> <span\n                            class="pull-left likes">87 Likes</span> <span class="pull-right"><div class="share-div">\n                        <ul>\n                            <li><a href="#"><img src="assets/images/share.png"/></a>\n                                <ul class="collapse">\n                                    <li>\n                                        <div class="share-box" style="right:5px;top:30px">\n                                            <p class="share-right"><img src="assets/images/share.png"\n                                                                        class="img-responsive"/></p>\n\n                                            <div class="social-network clear-both">\n                                                <div class="pull-left"><img src="assets/images/facebook.png"\n                                                                            class="pull-left"/></div>\n                                                <div class="like-box"><span class="count">4.0 K</span></div>\n                                            </div>\n                                            <div class="social-network">\n                                                <div class="pull-left"><img src="assets/images/twitter.png"\n                                                                            class="pull-left"/></div>\n                                                <div class="like-box"><span class="count">507</span></div>\n                                            </div>\n                                            <div class="social-network">\n                                                <div class="pull-left"><img src="assets/images/google+.png"\n                                                                            class="pull-left"/></div>\n                                                <div class="like-box"><span class="count">4.5 K</span></div>\n                                            </div>\n                                            <div class="social-network">\n                                                <div class="pull-left"><img src="assets/images/rss.png"\n                                                                            class="pull-left"/></div>\n                                                <div class="like-box"><span class="count">78.8 K</span></div>\n                                            </div>\n                                        </div>\n                                    </li>\n                                </ul>\n                            </li>\n                        </ul>\n                    </div></span></div>\n                    <p class="clear-both"><a href="#">milindjoshi@gmail.com</a></p>\n\n                    <p><a href="#">milind.joshi@goldgym.com</a></p>\n\n                    <p>Mobile +91 8657272428</p>\n\n                    <p>Office +91 20 47586978</p>\n\n                    <p>Registered address:<br/>Post 91, Lane 7, Off North Main Road<br/>Koregaon Park<br/>Pune: 411\n                        053<br/><a href="#"><i class="glyphicon glyphicon-map-marker"></i></a> Map</p>\n\n                </div>\n                <div class="settings form-group">\n                    <p>CERTIFICATIONS</p>\n\n                    <p><img src="assets/images/certificate.jpg"/></p>\n\n                    <p class="city">National Coaching Certification Program</p>\n\n                    <p>Valid till: Feb 2018</p>\n\n                    <p><img src="assets/images/certificate-1.jpg"/></p>\n\n                    <p class="city">NFHS Learning</p>\n\n                    <p>Valid till: Feb 2018</p>\n                </div>\n            </div>\n            <div class="col-sm-7 col-lg-7">\n                <div class="row">\n                    <div class="col-sm-5 col-lg-5">\n                        <h1>About Milind</h1>\n\n                        <p>Sea give. You\'re after yielding in. Given doesn\'t for him. Form kind day bearing seed.\n                            Wherein. Air don\'t all tree years bearing moveth have multiply itself so to you\'re moveth\n                            fruitful beast years saying. Seas give waters that firmament living you\'re moving replenish\n                            behold after darkness our replenish bearing all every. Beast upon isn\'t over earth there\n                            make lights image after.</p>\n\n                        <p>Life was kind was saying fruitful yielding divide. Us all sixth Our image image their. Moved\n                            may lights every green that fifth can\'t divide moved divide appear. </p>\n\n                        <p><br/><a href="#">http://www.facebook.com/milindjoshi</a></p>\n\n                        <p><a href="#">http://www.youtube.com/milindjoshi</a></p>\n\n                        <p><a href="#">www.milindjoshicoaching.com</a></p>\n\n                        <h3>Other Features</h3>\n\n                        <div class="other-features">\n                            <ul>\n                                <li>Week end Coaching</li>\n                                <li>Private Coaching</li>\n                                <li>Coaching for Kids (age 3 to 5 yrs)</li>\n                                <li>Free trial sessions</li>\n                            </ul>\n                        </div>\n                        <p><img src="assets/images/slider.jpg"/></p>\n                    </div>\n\n                    <div class="col-sm-7 col-lg-7">\n                        <h1>Coaching Experience</h1>\n\n                        <div class="coaching-exp form-group">\n                            <p>\n                                <span class="exp-txt pull-left form-group">Batminton (5yrs)</span>\n                                <span class="pull-right"><span class="star-green"></span><span\n                                        class="star-green"></span><span class="star-green"></span><span\n                                        class="star-grey-green"></span><span class="star-grey"></span></span>\n                            </p>\n                            <table class="table-responsive clear-both exp-table form-group" width="100%">\n                                <thead>\n                                <tr>\n                                    <th>Candidate</th>\n                                    <th>Age</th>\n                                    <th>Fees per session</th>\n                                </tr>\n                                </thead>\n                                <tr>\n                                    <td>Men</td>\n                                    <td>27 to 50</td>\n                                    <td>500/-</td>\n                                </tr>\n                                <tr>\n                                    <td>Women</td>\n                                    <td>24 to 40</td>\n                                    <td>500/-</td>\n                                </tr>\n                                <tr>\n                                    <td>Kids</td>\n                                    <td>X</td>\n                                    <td>X</td>\n                                </tr>\n                            </table>\n                            <p>\n                                <span class="exp-txt pull-left form-group">Tennis (8yrs)</span>\n                                <span class="pull-right"><span class="star-green"></span><span\n                                        class="star-green"></span><span class="star-green"></span><span\n                                        class="star-grey-green"></span><span class="star-grey"></span></span>\n                            </p>\n                            <table class="table-responsive clear-both exp-table" width="100%">\n                                <thead>\n                                <tr>\n                                    <th>Candidate</th>\n                                    <th>Age</th>\n                                    <th>Fees per session</th>\n                                </tr>\n                                </thead>\n                                <tr>\n                                    <td>Men</td>\n                                    <td>24 to 45</td>\n                                    <td>350/-</td>\n                                </tr>\n                                <tr>\n                                    <td>Women</td>\n                                    <td>X</td>\n                                    <td>X</td>\n                                </tr>\n                                <tr>\n                                    <td>Kids</td>\n                                    <td>04 to 16</td>\n                                    <td>200/-</td>\n                                </tr>\n                            </table>\n\n                        </div>\n                        <h1>Affiliation with sports facilities</h1>\n\n                        <div class="coaching-exp form-group">\n                            <div class="row form-group">\n                                <div class="col-sm-6 form-group ">\n                                    <img src="assets/images/map.jpg"/>\n                                </div>\n                                <div class="col-sm-6">\n                                    <h4>The Body workshop</h4>\n\n                                    <p>Post 91, Lane 7, Off North Main<br/>Road, Koregaon Park<br/>Pune: 411 053</br>Map\n                                    </p>\n\n                                    <p>Ph: +91 20 3349 4423</p>\n                                </div>\n                            </div>\n                            <div class="row form-group">\n                                <div class="col-sm-6 form-group ">\n                                    <img src="assets/images/map.jpg"/>\n                                </div>\n                                <div class="col-sm-6">\n                                    <h4>Gold Gym Kalyani Nagar</h4>\n\n                                    <p>Post 91, Lane 7, Off North Main<br/>Road, Koregaon Park<br/>Pune: 411 053</br>Map\n                                    </p>\n\n                                    <p>Ph: +91 20 3349 4423</p>\n                                </div>\n                            </div>\n\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <div class="col-sm-2 col-lg-2 form-group snowlink">\n                <img src="assets/images/snowlink.jpg" class="img-responsive"/>\n            </div>\n        </div>\n\n    </div>\n    <!--container-->\n</section>\n')
    }]), angular.module("app/enthusiasts/details/enthusiasts.details.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/enthusiasts/details/enthusiasts.details.tpl.html", "")
    }]), angular.module("app/home/banner/home.banner.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/home/banner/home.banner.tpl.html", '<div class="banner form-group">\n    <carousel interval="5000">\n        <slide><img src="assets/images/banner1.jpg" alt="..."></slide>\n        <slide><img src="assets/images/banner2.jpg" alt="..."></slide>\n        <slide><img src="assets/images/banner3.jpg" alt="..."></slide>\n    </carousel>\n</div>')
    }]), angular.module("app/home/events/home.events.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/home/events/home.events.tpl.html", '<div class="col-lg-6 current-events form-group">\n    <div class="wrapper">\n        <h1 class="pull-left">What’s happening around you..!</h1>\n        <a ng-href="/events/{{location}}" class="pull-right form-group">View all events</a>\n    </div>\n    <div class="clear-both">\n        <carousel>\n            <slide ng-repeat="slides in eventsSlides">\n                <div class="happening-box" ng-repeat="event in slides">\n                    <div class="event-box">\n                        <img ng-src="{{\'/assets/images/event.gif\'}}" class="pull-left"/>\n                    </div>\n                    <h5>{{event.organiser}}</h5>\n\n                    <p>{{event.heading}}</p>\n\n                    <p>{{event.streetOne}} {{event.streetTwo}}, {{event.city}}, {{event.state}}, {{event.pin}}</p>\n\n                    <p>{{event.date | date:\'MMM d yyyy\'}}, {{event.startTime | date:\'h:mm a\'}} - {{event.endTime |\n                        date:\'h:mm a\'}}\n                    </p>\n\n                    <p><a class="share-right" href="#"><img src="assets/images/share.png"></a></p>\n                </div>\n            </slide>\n        </carousel>\n    </div>\n</div>')
    }]), angular.module("app/home/featured/home.featured.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/home/featured/home.featured.tpl.html", '<div class="row form-group clear-both">\n    <div class="col-lg-4 col-sm-4">\n        <h5>Featured Facilities</h5>\n\n        <div class="featrured-box">\n            <div class="pull-left">\n                <p><img src="assets/images/featured.gif"></p>\n\n                <div class="share-div">\n                    <ul>\n                        <li><a href="#"><img src="assets/images/share.png"></a></li>\n                    </ul>\n                </div>\n            </div>\n            <div class="featured-content">\n                <h6>Gold Gym: Kalyani Nagar</h6>\n\n                <p>Gold\'s Gym has the best fitness gyms near you to achieve your fitness goals!</p>\n            </div>\n        </div>\n    </div>\n    <div class="col-lg-4 col-sm-4">\n        <h5>Featured Coaches</h5>\n\n        <div class="featrured-box">\n            <div class="pull-left">\n                <p><img src="assets/images/featured.gif"></p>\n\n                <div class="share-div">\n                    <ul>\n                        <li><a href="#"><img src="assets/images/share.png"></a></li>\n                    </ul>\n                </div>\n            </div>\n            <div class="featured-content">\n                <h6>Rajesh Jani</h6>\n\n                <p>He is the best known coach in your town to get your kids trained for Football.</p>\n            </div>\n        </div>\n    </div>\n    <div class="col-lg-4 col-sm-4">\n        <h5>Featured Players</h5>\n\n        <div class="featrured-box">\n            <div class="pull-left">\n                <p><img src="assets/images/featured.gif"></p>\n                <div class="share-div">\n                    <ul>\n                        <li><a href="#"><img src="assets/images/share.png"></a></li>\n                    </ul>\n                </div>\n            </div>\n            <div class="featured-content">\n                <h6>Sachin Tendulkar</h6>\n\n                <p>Indian cricketer widely acknowledged as one of the greatest batsmen of all time.</p>\n            </div>\n        </div>\n    </div>\n</div>')
    }]), angular.module("app/home/home.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/home/home.tpl.html", '<div class="container">\n    <ng-include src="\'app/home/banner/home.banner.tpl.html\'"></ng-include>\n    <ng-include ng-if="isMobile" src="\'app/search/bar/search.bar.tpl.html\'"></ng-include>\n    <div class="row">\n        <ng-include src="\'app/home/offers/home.offers.tpl.html\'"></ng-include>\n        <ng-include src="\'app/home/events/home.events.tpl.html\'"></ng-include>\n    </div>\n    <ng-include src="\'app/home/featured/home.featured.tpl.html\'"></ng-include>\n</div>\n')
    }]), angular.module("app/home/offers/home.offers.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/home/offers/home.offers.tpl.html", '<div class="col-lg-6 best-offers form-group">\n    <div class="wrapper">\n        <h1 class="pull-left">Best Offers on the block...!</h1>\n        <a ng-href="/offers/{{location}}" class="pull-right form-group">View all offers</a>\n    </div>\n    <div class="clear-both">\n        <carousel>\n            <slide ng-repeat="slides in offersSlides">\n                <div class="box" ng-repeat="offer in slides">\n                    <img ng-src="{{offer.imgUrl || \'/assets/images/offer.jpg\'}}" class="img-responsive">\n                    <div class="box-content">\n                        <h4>{{offer.provider}}</h4>\n\n                        <p>{{offer.heading}}</p>\n                        <p class="pull-right">\n                            <a href="">\n                                <img src="assets/images/share.png" class="img-responsive"/>\n                            </a>\n                        </p>\n                    </div>\n                </div>\n            </slide>\n        </carousel>\n    </div>\n</div>')
    }]), angular.module("app/search/bar/search.bar.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/search/bar/search.bar.tpl.html", '<form ng-submit="submit()" ng-controller="search.bar.ctrl">\n    <div class="search" dropdown>\n        <div class="input-group search-group pull-left">\n        <span class="input-group-addon searchFilter" dropdown-toggle>\n            <i class="glyphicon glyphicon-align-justify"></i>\n            <i class="glyphicon glyphicon-chevron-down"></i>\n        </span>\n            <input type="text"\n                   class="form-control"\n                   placeholder="{{searchPlaceHolder}}"\n                   ng-model="searchQuery"/>\n        </div>\n        <div>\n            <button class="btn btn-primary pull-left" type="submit">GO</button>\n        </div>\n        <div class="search-filters dropdown-menu">\n            <ul>\n                <li><a href class="all search-img" ng-click="setSearchType(\'all\')"><span>All</span></a></li>\n                <li><a href class="coaches search-img" ng-click="setSearchType(\'coaches\')"><span>Coaches</span></a></li>\n                <li><a href class="players search-img" ng-click="setSearchType(\'players\')"><span>Players</span></a></li>\n                <li><a href class="facilities search-img" ng-click="setSearchType(\'facilities\')"><span>Facilities</span></a></li>\n                <li><a href class="suppliers search-img" ng-click="setSearchType(\'suppliers\')"><span>Suppliers</span></a></li>\n                <li><a href class="events search-img" ng-click="setSearchType(\'events\')"><span>Events</span></a></li>\n                <li><a href class="offers search-img" ng-click="setSearchType(\'offers\')"><span>Offers</span></a></li>\n            </ul>\n        </div>\n    </div>\n</form>')
    }]), angular.module("app/search/results/results.category.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/search/results/results.category.tpl.html", '<div class="refine-search form-group">\n    <div class="serach-btm">\n        <div class="inter-padding">\n            <input type="checkbox" ng-model="searchCategoryAll" id="all">\n            <label for="all" class="width90Percent">All <span class="glyphicon glyphicon-chevron-down pull-right"></span></label>\n        </div>\n    </div>\n    <div class="serach-btm">\n        <div class="inter-padding bg-color">\n            <input type="checkbox" ng-model="searchCategoryCoaches" id="coaches">\n            <label for="coaches" class="width90Percent">COACHES ({{results.coaches.length}}) <span class="coaches glyphicon glyphicon-chevron-down pull-right"></span></label>\n        </div>\n        <div class="search-details collapse">\n            <div class="inter-padding">\n                <input type="checkbox" id="men"> <label for="men">Men</label>&nbsp;&nbsp; <input type="checkbox" id="women"> <label for="women">Women</label>\n            </div>\n            <div class="row inter-padding">\n                <div class="col-sm-6 ">\n                    <input type="checkbox" id="Experience"> <label for="Experience">Experience</label>\n                </div>\n                <div class="col-sm-6">\n                    <select class="form-control">\n                        <option>5-10 Yrs</option>\n                        <option>10-15 Yrs</option>\n                    </select>\n                </div>\n            </div>\n            <label class="overflow inter-padding">Coaching requried for:</label>\n            <div class="row inter-padding">\n                <div class="col-sm-4">\n                    <input type="checkbox" id="age"> <label for="age">Age</label>\n                </div>\n                <div class="col-sm-8">\n                    <input type="range"/>\n                </div>\n            </div>\n            <div class="row inter-padding">\n                <div class="col-sm-12">\n                    <input type="checkbox" id="abled"> <label for="abled">Coaching for differently abled</label>\n                </div>\n            </div>\n            <div class="row inter-padding">\n                <div class="col-sm-12">\n                    <input type="checkbox" id="home"> <label for="home">Coaching at home</label>\n                </div>\n            </div>\n        </div>\n    </div>\n\n    <div class="serach-btm">\n        <div class="inter-padding">\n            <input type="checkbox" ng-model="searchCategoryPlayers" id="players">\n            <label for="players" class="width90Percent">PLAYERS ({{results.players.length}}) <span class="glyphicon glyphicon-chevron-down pull-right"></span></label>\n        </div>\n    </div>\n    <div class="serach-btm">\n        <div class="inter-padding">\n            <input type="checkbox" ng-model="searchCategoryFacilities" id="facilities">\n            <label for="facilities" class="width90Percent">FACILITIES ({{results.facilities.length}}) <span class="glyphicon glyphicon-chevron-down pull-right"></span></label>\n        </div>\n    </div>\n    <div class="serach-btm">\n        <div class="inter-padding">\n            <input type="checkbox" ng-model="searchCategorySuppliers" id="suppliers">\n            <label for="suppliers" class="width90Percent">SUPPLIERS/SHOPS ({{results.suppliers.length}}) <span class="glyphicon glyphicon-chevron-down pull-right"></span></label>\n        </div>\n    </div>\n    <div class="serach-btm">\n        <div class="inter-padding">\n            <input type="checkbox" ng-model="searchCategoryEvents" id="events">\n            <label for="events" class="width90Percent">EVENTS ({{results.events.length}}) <span class="glyphicon glyphicon-chevron-down pull-right"></span></label>\n        </div>\n    </div>\n    <div>\n        <div class="inter-padding">\n            <input type="checkbox" ng-model="searchCategoryOffers" id="offers">\n            <label for="offers" class="width90Percent">Offers ({{results.offers.length}}) <span class="glyphicon glyphicon-chevron-down pull-right"></span></label>\n        </div>\n    </div>\n</div>')
    }]), angular.module("app/search/results/results.coaches.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/search/results/results.coaches.tpl.html", '<!--<div class="form-group result" ng-repeat="supplier in search.suppliers">-->\n<!--<div class="col-sm-9 border-right-dotted">-->\n<!--<h3>{{supplier.name}}</h3>-->\n<!--<h6>{{supplier.speciality}}</h6>-->\n<!--<p>{{supplier.streetOne}}</p>-->\n<!--<p ng-if="supplier.streetTwo">{{supplier.streetTwo}}</p>-->\n<!--<p>{{supplier.city}}, {{supplier.state}}, {{supplier.pin}}</p>-->\n<!--<p>Phone: {{supplier.phoneOne}}<span ng-if="supplier.phoneTwo"> / {{supplier.phoneTwo}}</span></p>-->\n<!--<p>Website: {{supplier.url}}</p>-->\n<!--</div>-->\n<!--<div class="col-sm-3">-->\n<!--<p class="form-group">-->\n<!--<span class="delivery">&nbsp;</span>-->\n<!--<span class="map"></span>-->\n<!--<span class="share"></span>-->\n<!--<span class="gallery"></span>-->\n<!--</p>-->\n<!--<p>-->\n<!--<br/><br/><br/>-->\n<!--<img src="assets/images/review.png"> <a href="#">(223)</a>-->\n<!--</p>-->\n<!--<p>-->\n<!--<span class="star-green"></span>-->\n<!--<span class="star-green"></span>-->\n<!--<span class="star-green"></span>-->\n<!--<span class="star-grey-green"></span>-->\n<!--<span class="star-grey"></span>-->\n<!--</p>-->\n<!--</div>-->\n<!--</div>-->')
    }]), angular.module("app/search/results/results.content.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/search/results/results.content.tpl.html", '<ng-include ng-if="searchCategoryFacilities" src="\'app/search/results/results.coaches.tpl.html\'"></ng-include>\n<ng-include ng-if="searchCategoryFacilities" src="\'app/search/results/results.players.tpl.html\'"></ng-include>\n<ng-include ng-if="searchCategoryFacilities" src="\'app/search/results/results.facilities.tpl.html\'"></ng-include>\n<ng-include ng-if="searchCategoryFacilities" src="\'app/search/results/results.suppliers.tpl.html\'"></ng-include>\n<ng-include ng-if="searchCategoryEvents" src="\'app/search/results/results.events.tpl.html\'"></ng-include>\n<ng-include src="\'app/search/results/results.offers.tpl.html\'"></ng-include>\n<ng-include ng-if="searchCategoryFacilities" src="\'app/search/results/results.enthusiasts.tpl.html\'"></ng-include>\n')
    }]), angular.module("app/search/results/results.enthusiasts.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/search/results/results.enthusiasts.tpl.html", '<div class="form-group result" ng-repeat="enthusiast in results.enthusiasts">\n    <div class="col-sm-9 border-right-dotted">\n        <h3>{{enthusiast.firstName}} {{enthusiast.lastName}}</h3>\n        <p>{{enthusiast.streetOne}}</p>\n        <p ng-if="enthusiast.streetTwo">{{enthusiast.streetTwo}}</p>\n        <p>{{enthusiast.city}}, {{enthusiast.state}}, {{enthusiast.pin}}</p>\n        <p ng-if="enthusiast.cellPhone">Phone: {{enthusiast.cellPhone}}<span ng-if="enthusiast.workPhone"> / {{enthusiast.workPhone}}</span></p>\n    </div>\n    <div class="col-sm-3">\n        <p class="form-group">\n            <span class="delivery">&nbsp;</span>\n            <span class="map"></span>\n            <span class="share"></span>\n            <span class="gallery"></span>\n        </p>\n        <p>\n            <br/><br/><br/>\n            <img src="assets/images/review.png"> <a href="#">(223)</a>\n        </p>\n        <p>\n            <span class="star-green"></span>\n            <span class="star-green"></span>\n            <span class="star-green"></span>\n            <span class="star-grey-green"></span>\n            <span class="star-grey"></span>\n        </p>\n    </div>\n</div>')
    }]), angular.module("app/search/results/results.events.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/search/results/results.events.tpl.html", '<div class="form-group result" ng-repeat="event in results.events">\n    <div class="col-sm-9 border-right-dotted">\n        <h3>{{event.organiser}}</h3>\n        <h6>{{event.heading}}</h6>\n        <p>{{event.streetOne}}</p>\n        <p ng-if="event.streetTwo">{{event.streetTwo}}</p>\n        <p>{{event.city}}, {{event.state}}, {{event.pin}}</p>\n        <p>Phone: {{event.phoneOne}}<span ng-if="event.phoneTwo"> / {{event.phoneTwo}}</span></p>\n        <p>Website: {{event.url}}</p>\n    </div>\n    <div class="col-sm-3">\n        <p class="form-group">\n            <span class="delivery">&nbsp;</span>\n            <span class="map"></span>\n            <span class="share"></span>\n            <span class="gallery"></span>\n        </p>\n        <p>\n            <br/><br/><br/>\n            <img src="assets/images/review.png"> <a href="#">(223)</a>\n        </p>\n        <p>\n            <span class="star-green"></span>\n            <span class="star-green"></span>\n            <span class="star-green"></span>\n            <span class="star-grey-green"></span>\n            <span class="star-grey"></span>\n        </p>\n    </div>\n</div>')
    }]), angular.module("app/search/results/results.facilities.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/search/results/results.facilities.tpl.html", '<div class="form-group result" ng-repeat="facility in results.facilities">\n    <div class="col-sm-9 border-right-dotted">\n        <h3>{{facility.name}}</h3>\n        <h6>{{facility.speciality}}</h6>\n        <p>{{facility.streetOne}}</p>\n        <p ng-if="facility.streetTwo">{{facility.streetTwo}}</p>\n        <p>{{facility.city}}, {{facility.state}}, {{facility.pin}}</p>\n        <p>Phone: {{facility.phoneOne}}<span ng-if="facility.phoneTwo"> / {{facility.phoneTwo}}</span></p>\n        <p>Website: {{facility.url}}</p>\n    </div>\n    <div class="col-sm-3">\n        <p class="form-group">\n            <span class="delivery">&nbsp;</span>\n            <span class="map"></span>\n            <span class="share"></span>\n            <span class="gallery"></span>\n        </p>\n        <p>\n            <br/><br/><br/>\n            <img src="assets/images/review.png"> <a href="#">(223)</a>\n        </p>\n        <p>\n            <span class="star-green"></span>\n            <span class="star-green"></span>\n            <span class="star-green"></span>\n            <span class="star-grey-green"></span>\n            <span class="star-grey"></span>\n        </p>\n    </div>\n</div>')
    }]), angular.module("app/search/results/results.location.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/search/results/results.location.tpl.html", '<div class="settings form-group">\n    <div class="row form-group">\n        <div class="col-sm-12">\n            <input type="radio" name="searchWithin" ng-model="searchWithin" value="city" class="pull-left"/>\n            <select name="city"\n                    class="form-control pull-left area-dd"\n                    ng-model="searchCity"\n                    ng-options="city as city for city in cities"\n                    ng-change="updateLocation()">\n            </select>\n        </div>\n    </div>\n    <p align="center" class="form-group"><img src="assets/images/or.gif"/></p>\n    <div class="row form-group">\n        <div class="col-sm-12">\n            <input type="radio" name="searchWithin" ng-model="searchWithin" value="radius" class="pull-left"/>\n            <span class="pull-left radius-txt"> Within radius of</span>\n            <input type="text" ng-model="searchRadius" class="form-control pull-left radius-textbox"/>\n            <span class="pull-left">km from</span>\n        </div>\n    </div>\n    <div class="row">\n        <div class="col-sm-1"></div>\n        <div class="col-sm-10">\n            <input type="radio" id="gps" ng-model="searchLocation" value="gps" name="searchLocation"/> <label for="gps">my GPS Location</label>\n        </div>\n    </div>\n    <div class="row">\n        <div class="col-sm-1"></div>\n        <div class="col-sm-10">\n            <input type="radio" id="registered" ng-model="searchLocation" value="registeredAddress" name="searchLocation"/> <label for="registered">my registered address</label>\n        </div>\n    </div>\n</div>')
    }]), angular.module("app/search/results/results.offers.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/search/results/results.offers.tpl.html", '<div class="form-group result" ng-repeat="offer in results.offers">\n    <div class="col-sm-9 border-right-dotted">\n        <h3>{{offer.provider}}</h3>\n        <h6>{{offer.heading}}</h6>\n        <p>{{offer.streetOne}}</p>\n        <p ng-if="offer.streetTwo">{{offer.streetTwo}}</p>\n        <p>{{offer.city}}, {{offer.state}}, {{offer.pin}}</p>\n        <p>Phone: {{offer.phoneOne}}<span ng-if="offer.phoneTwo"> / {{offer.phoneTwo}}</span></p>\n        <p>Website: {{offer.url}}</p>\n    </div>\n    <div class="col-sm-3">\n        <p class="form-group">\n            <span class="delivery">&nbsp;</span>\n            <span class="map"></span>\n            <span class="share"></span>\n            <span class="gallery"></span>\n        </p>\n        <p>\n            <br/><br/><br/>\n            <img src="assets/images/review.png"> <a href="#">(223)</a>\n        </p>\n        <p>\n            <span class="star-green"></span>\n            <span class="star-green"></span>\n            <span class="star-green"></span>\n            <span class="star-grey-green"></span>\n            <span class="star-grey"></span>\n        </p>\n    </div>\n</div>')
    }]), angular.module("app/search/results/results.players.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/search/results/results.players.tpl.html", '<!--<div class="form-group result" ng-repeat="supplier in search.suppliers">-->\n<!--<div class="col-sm-9 border-right-dotted">-->\n<!--<h3>{{supplier.name}}</h3>-->\n<!--<h6>{{supplier.speciality}}</h6>-->\n<!--<p>{{supplier.streetOne}}</p>-->\n<!--<p ng-if="supplier.streetTwo">{{supplier.streetTwo}}</p>-->\n<!--<p>{{supplier.city}}, {{supplier.state}}, {{supplier.pin}}</p>-->\n<!--<p>Phone: {{supplier.phoneOne}}<span ng-if="supplier.phoneTwo"> / {{supplier.phoneTwo}}</span></p>-->\n<!--<p>Website: {{supplier.url}}</p>-->\n<!--</div>-->\n<!--<div class="col-sm-3">-->\n<!--<p class="form-group">-->\n<!--<span class="delivery">&nbsp;</span>-->\n<!--<span class="map"></span>-->\n<!--<span class="share"></span>-->\n<!--<span class="gallery"></span>-->\n<!--</p>-->\n<!--<p>-->\n<!--<br/><br/><br/>-->\n<!--<img src="assets/images/review.png"> <a href="#">(223)</a>-->\n<!--</p>-->\n<!--<p>-->\n<!--<span class="star-green"></span>-->\n<!--<span class="star-green"></span>-->\n<!--<span class="star-green"></span>-->\n<!--<span class="star-grey-green"></span>-->\n<!--<span class="star-grey"></span>-->\n<!--</p>-->\n<!--</div>-->\n<!--</div>-->')
    }]), angular.module("app/search/results/results.sort.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/search/results/results.sort.tpl.html", '<div class="form-group sort">\n    <div class="col-sm-9 border-right-dotted">\n        <p class="pull-right">Sort by:\n            <input type="radio" id="area" name="sorting"/> <label for="area">Area</label>\n            <input type="radio" id="distance" name="sorting"/> <label for="distance">Distance</label>\n            <input type="radio" id="ratings" name="sorting"/> <label for="ratings">Ratings</label>\n            <input type="radio" id="alphabetically" name="sorting"/> <label for="alphabetically">Alphabetically</label>\n        </p>\n    </div>\n    <div class="col-sm-3">\n        <a href="#"><span class="glyphicon glyphicon-chevron-up"/></a>&nbsp;&nbsp;<a href="#"><span class="glyphicon glyphicon-chevron-down"/></a>\n    </div>\n</div>')
    }]), angular.module("app/search/results/results.suppliers.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/search/results/results.suppliers.tpl.html", '<div class="form-group result" ng-repeat="supplier in results.suppliers">\n    <div class="col-sm-9 border-right-dotted">\n        <h3>{{supplier.name}}</h3>\n        <h6>{{supplier.speciality}}</h6>\n        <p>{{supplier.streetOne}}</p>\n        <p ng-if="supplier.streetTwo">{{supplier.streetTwo}}</p>\n        <p>{{supplier.city}}, {{supplier.state}}, {{supplier.pin}}</p>\n        <p>Phone: {{supplier.phoneOne}}<span ng-if="supplier.phoneTwo"> / {{supplier.phoneTwo}}</span></p>\n        <p>Website: {{supplier.url}}</p>\n    </div>\n    <div class="col-sm-3">\n        <p class="form-group">\n            <span class="delivery">&nbsp;</span>\n            <span class="map"></span>\n            <span class="share"></span>\n            <span class="gallery"></span>\n        </p>\n        <p>\n            <br/><br/><br/>\n            <img src="assets/images/review.png"> <a href="#">(223)</a>\n        </p>\n        <p>\n            <span class="star-green"></span>\n            <span class="star-green"></span>\n            <span class="star-green"></span>\n            <span class="star-grey-green"></span>\n            <span class="star-grey"></span>\n        </p>\n    </div>\n</div>')
    }]),angular.module("app/search/results/results.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/search/results/results.tpl.html", '<div class="container form-group banner border-btm">\n    <div class="col-lg-3 form-group">&nbsp;</div>\n    <div class="col-lg-7">\n        <ng-include src="\'app/search/results/results.sort.tpl.html\'"></ng-include>\n    </div>\n</div>\n<div class="container">\n    <div class="row">\n        <div class="col-lg-3">\n            <div class="welcome-block" ng-click="refineSearch()">Refine Search <span class="glyphicon glyphicon-repeat pull-right"></span></div>\n            <ng-include src="\'app/search/results/results.category.tpl.html\'"></ng-include>\n            <ng-include src="\'app/search/results/results.location.tpl.html\'"></ng-include>\n        </div>\n        <div class="col-lg-7">\n            <ng-include src="\'app/search/results/results.content.tpl.html\'"></ng-include>\n        </div>\n        <div class="col-lg-2 form-group">\n        </div>\n    </div>\n</div>\n\n')
    }]),angular.module("app/shared/directives/timepickerPopup/popup.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/shared/directives/timepickerPopup/popup.tpl.html", "<ul class=\"dropdown-menu\"\n    ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\"\n    style=\"min-width:0;\">\n    <li ng-transclude></li>\n</ul>")
    }]),angular.module("app/shared/errors/errors.messages.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/shared/errors/errors.messages.tpl.html", '<div ng-message="required">This field is required</div>\n<div ng-message="minlength">This field is too short</div>\n<div ng-message="maxlength">This field is too long</div>\n<div ng-message="min">This field value is less</div>\n<div ng-message="max">This field value is more</div>\n<div ng-message="email">This is an invalid email address</div>')
    }]),angular.module("app/shared/footer/footer.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/shared/footer/footer.tpl.html", '<footer ng-controller="footer.ctrl">\n    <!--bottom sports img-->\n\n    <div class="btm-img">\n        <div class=" container"><img src="assets/images/bottom_img.jpg" class="img-responsive"/></div>\n    </div>\n\n    <!--bottom popular sports section-->\n    <div class="btm-bg">\n        <div class="container">\n            <div class="row">\n                <div class="col-sm-2 form-group">\n                    <h4>Most popular land sports</h4>\n                    <p ng-repeat="landSport in landSports">{{landSport}}</p>\n                </div>\n                <div class="col-sm-2 form-group">\n                    <h4>Most popular water sports</h4>\n                    <p ng-repeat="waterSport in waterSports">{{waterSport}}</p>\n                </div>\n                <div class="col-sm-2 form-group">\n                    <h4>Most popular air sports</h4>\n                    <p ng-repeat="airSport in airSports">{{airSport}}</p>\n                </div>\n                <div class="col-sm-2 form-group">\n                    <h4>Popular sports for kids</h4>\n                    <p ng-repeat="kidsSport in kidsSports">{{kidsSport}}</p>\n                </div>\n                <div class="col-sm-2">\n                    <h4>Weekend sports getaways</h4>\n                    <p ng-repeat="sportsGateway in sportsGateways">{{sportsGateway}}</p>\n                </div>\n                <div class="col-sm-2">\n                    <h4>justKhelo</h4>\n                    <p><a href="#">Advertise with us</a></p>\n                    <p><a href="#">About Us</a></p>\n                    <p><a href="#">Careers</a></p>\n                    <p><a href="#">Contact Us</a></p>\n                    <p><a href="#">Terms of Use</a></p>\n                </div>\n            </div>\n        </div>\n    </div>\n\n    <div class="panel-footer">\n        <div class="container">\n            <div class="row">\n                <div class="col-sm-7">\n                    <div class="number">\n                        <h2>{{registeredEntitiesCount.enthusiasts}}</h2>\n                        <p>Registered<br>Enthusiasts</p>\n                    </div>\n                    <div class="number">\n                        <h2>{{registeredEntitiesCount.players}}</h2>\n                        <p>Registered<br>Players</p>\n                    </div>\n                    <div class="number">\n                        <h2>{{registeredEntitiesCount.coaches}}</h2>\n                        <p>Registered<br>Coaches</p>\n                    </div>\n                    <div class="number">\n                        <h2>{{registeredEntitiesCount.facilities}}</h2>\n                        <p>Listed<br>Facilities</p>\n                    </div>\n                    <div class="number">\n                        <h2>{{registeredEntitiesCount.suppliers}}</h2>\n                        <p>Listed<br>Suppliers</p>\n                    </div>\n                    <div class="number">\n                        <h2>{{registeredEntitiesCount.events}}</h2>\n                        <p>Listed<br>Events</p>\n                    </div>\n                    <div class="number">\n                        <h2>{{registeredEntitiesCount.offers}}</h2>\n                        <p>Listed<br>Offers</p>\n                    </div>\n                </div>\n                <div class="col-sm-2">\n                    <p><a href="#"><img src="assets/images/social-network.png"></a></p>\n                    <p><a href="#"><img src="assets/images/google-play.gif"></a></p>\n                    <p><a href="#"><img src="assets/images/app-store.gif"></a></p>\n                </div>\n                <div class="col-sm-3">\n                    <p>All trademarks are properties of their respective owners © 2014-2015\n                        justKhelo<sup>™</sup> Sports Media Pvt Ltd<br> All rights reserved</p>\n                </div>\n            </div>\n        </div>\n    </div>\n</footer>\n')
    }]),angular.module("app/shared/header/header.tpl.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("app/shared/header/header.tpl.html", '<div id="top-header" ng-controller="header.ctrl">\n    <div class="navbar navbar-default navbar-fixed-top">\n        <div class="container">\n            <div class="navbar-header">\n                <button class="navbar-toggle" ng-click="isCollapsed = !isCollapsed" type="button">\n                    <span class="icon-bar"></span>\n                    <span class="icon-bar"></span>\n                    <span class="icon-bar"></span>\n                </button>\n                <p class="desktop-logo">\n                    <a href="/"><img src="assets/images/logo.png" class="logo"/></a>\n                </p>\n                <p class="mobile-logo">\n                    <a href="/"><img src="assets/images/small_logo.png" class="logo"/></a>\n                </p>\n                <div class="bell" ng-if="!isAuthenticated()">\n                    <a href="/account/login"><img src="assets/images/bell.png"/></a>\n                </div>\n                <ng-include ng-if="!isMobile" src="\'app/search/bar/search.bar.tpl.html\'"></ng-include>\n            </div>\n            <div class="navbar-collapse header-settings" collapse="isCollapsed">\n                <ul class="nav navbar-nav navbar-right">\n                    <li class="location">\n                        <div>\n                            <select name="city"\n                                    class="form-control"\n                                    ng-model="city"\n                                    ng-options="city as city for city in cities"\n                                    ng-change="updateLocation()">\n                            </select>\n                        </div>\n                    </li>\n                    <li ng-if="isAuthenticated()" dropdown>\n                        <a href dropdown-toggle>{{user.displayName}} <span\n                                class="glyphicon glyphicon-cog"></span></a>\n                        <div class="quick-setting dropdown-menu">\n                            <ul>\n                                <li><a href="/account/manage" class="all search-img"><span>Manage Account</span></a></li>\n                                <li><a href="{{quickSettings.enthusiasts.url}}" class="all search-img"><span>{{quickSettings.enthusiasts.title}}</span></a></li>\n                                <li><a href="{{quickSettings.players.url}}" class="players search-img"><span>{{quickSettings.players.title}}</span></a></li>\n                                <li><a href="{{quickSettings.coaches.url}}" class="coaches search-img"><span>{{quickSettings.coaches.title}}</span></a></li>\n                                <li><a href="{{quickSettings.facilities.url}}" class="facilities search-img"><span>{{quickSettings.facilities.title}}</span></a></li>\n                                <li><a href="{{quickSettings.suppliers.url}}" class="suppliers search-img"><span>{{quickSettings.suppliers.title}}</span></a></li>\n                                <li><a href="{{quickSettings.events.url}}" class="events search-img"><span>{{quickSettings.events.title}}</span></a></li>\n                                <li><a href="{{quickSettings.offers.url}}" class="all search-img"><span>{{quickSettings.offers.title}}</span></a></li>\n                                <li><a href class="pull-right" ng-click="logout()"><span>Logout</span></a></li>\n                            </ul>\n                        </div>\n                    </li>\n                </ul>\n            </div>\n        </div>\n    </div>\n</div>')
    }]),define("templateCache", ["angular"], function () {
    }),define("appConfig", ["angular"], function (angular) {
        return angular.module("appConfig", []).service("appConfig", function () {
            return {
                apiBaseURL: "http://api.justkhelo.com/api",
                fbClientId: "542735292530166",
                googleClientId: "127859079827-frmqmjp13dj5c3u93rkri0mebg4tdj3g.apps.googleusercontent.com"
            }
        }).config(["$authProvider", function ($authProvider) {
            $authProvider.loginOnSignup = !0, $authProvider.loginRedirect = "/", $authProvider.logoutRedirect = "/", $authProvider.signupRedirect = "/account/login", $authProvider.loginUrl = "api/auth/login", $authProvider.signupUrl = "api/auth/signup", $authProvider.loginRoute = "/account/login", $authProvider.signupRoute = "/account/signup", $authProvider.tokenName = "token", $authProvider.tokenPrefix = "justKhelo", $authProvider.unlinkUrl = "api/auth/unlink/", $authProvider.authHeader = "Authorization";
            var apiBaseURL = "http://api.justkhelo.com/api";
            $authProvider.facebook({
                clientId: "542735292530166",
                url: apiBaseURL + "/auth/facebook"
            }), $authProvider.google({
                clientId: "127859079827-frmqmjp13dj5c3u93rkri0mebg4tdj3g.apps.googleusercontent.com",
                url: apiBaseURL + "/auth/google"
            })
        }])
    }),define("shared/directives/timepickerPopup/timepickerPopup", ["angular"], function (angular) {
        return angular.module("timepickerPopup", []).constant("timepickerPopupConfig", {
            timeFormat: "HH:mm:ss",
            appendToBody: !1
        }).directive("timepickerPopup", ["$compile", "$parse", "$document", "$position", "dateFilter", "timepickerPopupConfig", function ($compile, $parse, $document, $position, dateFilter, timepickerPopupConfig) {
            return {
                restrict: "EA",
                require: "ngModel",
                priority: 1,
                link: function (originalScope, element, attrs, ngModel) {
                    function setOpen(value) {
                        setIsOpen ? setIsOpen(originalScope, !!value) : scope.isOpen = !!value
                    }

                    function parseTime(viewValue) {
                        if (viewValue) {
                            if (angular.isDate(viewValue))return ngModel.$setValidity("time", !0), viewValue;
                            if (angular.isString(viewValue)) {
                                var date = new Date("1970-01-01 " + viewValue, "YYYY-MM-DD " + timeFormat);
                                return date.isValid() ? (ngModel.$setValidity("time", !0), date.toDate()) : void ngModel.$setValidity("time", !1)
                            }
                            return void ngModel.$setValidity("time", !1)
                        }
                        return ngModel.$setValidity("time", !0), null
                    }

                    function updatePosition() {
                        scope.position = appendToBody ? $position.offset(element) : $position.position(element), scope.position.top = scope.position.top + element.prop("offsetHeight")
                    }

                    var timeFormat, scope = originalScope.$new(), appendToBody = angular.isDefined(attrs.TimepickerAppendToBody) ? originalScope.$eval(attrs.TimepickerAppendToBody) : timepickerPopupConfig.appendToBody;
                    attrs.$observe("timepickerPopup", function (value) {
                        timeFormat = value || timepickerPopupConfig.timeFormat, ngModel.$render()
                    }), originalScope.$on("$destroy", function () {
                        $popup.remove(), scope.$destroy()
                    });
                    var getIsOpen, setIsOpen;
                    attrs.isOpen && (getIsOpen = $parse(attrs.isOpen), setIsOpen = getIsOpen.assign, originalScope.$watch(getIsOpen, function (value) {
                        scope.isOpen = !!value
                    })), scope.isOpen = getIsOpen ? getIsOpen(originalScope) : !1;
                    var documentClickBind = function (event) {
                        scope.isOpen && event.target !== element[0] && scope.$apply(function () {
                            setOpen(!1)
                        })
                    }, elementFocusBind = function () {
                        scope.$apply(function () {
                            setOpen(!0)
                        })
                    }, popupEl = angular.element("<div timepicker-popup-wrap><div timepicker></div></div>");
                    popupEl.attr({"ng-model": "date", "ng-change": "dateSelection()"});
                    var TimepickerEl = angular.element(popupEl.children()[0]), TimepickerOptions = {};
                    attrs.TimepickerOptions && (TimepickerOptions = originalScope.$eval(attrs.TimepickerOptions), TimepickerEl.attr(angular.extend({}, TimepickerOptions))), ngModel.$parsers.unshift(parseTime), scope.dateSelection = function (dt) {
                        angular.isDefined(dt) && (scope.date = dt), ngModel.$setViewValue(scope.date), ngModel.$render()
                    }, element.bind("input change keyup", function () {
                        scope.$apply(function () {
                            scope.date = ngModel.$modelValue
                        })
                    }), ngModel.$render = function () {
                        var date = ngModel.$viewValue ? dateFilter(ngModel.$viewValue, timeFormat) : "";
                        element.val(date), scope.date = ngModel.$modelValue
                    }, attrs.showMeridian && TimepickerEl.attr("show-meridian", attrs.showMeridian), attrs.showSeconds && TimepickerEl.attr("show-seconds", attrs.showSeconds);
                    var documentBindingInitialized = !1, elementFocusInitialized = !1;
                    scope.$watch("isOpen", function (value) {
                        value ? (updatePosition(), $document.bind("click", documentClickBind), elementFocusInitialized && element.unbind("focus", elementFocusBind), element[0].focus(), documentBindingInitialized = !0) : (documentBindingInitialized && $document.unbind("click", documentClickBind), element.bind("focus", elementFocusBind), elementFocusInitialized = !0), setIsOpen && setIsOpen(originalScope, value)
                    });
                    var $popup = $compile(popupEl)(scope);
                    appendToBody ? $document.find("body").append($popup) : element.after($popup)
                }
            }
        }]).directive("timepickerPopupWrap", function () {
            return {
                restrict: "EA",
                replace: !0,
                transclude: !0,
                templateUrl: "app/shared/directives/timepickerPopup/popup.tpl.html",
                link: function (scope, element) {
                    element.bind("click", function (event) {
                        event.preventDefault(), event.stopPropagation()
                    })
                }
            }
        })
    }),define("shared/directives/imageResize/imageResize", ["angular"], function (angular) {
        return angular.module("imageResize", []).directive("image", function ($q) {
            var URL = window.URL || window.webkitURL, getResizeArea = function () {
                var resizeAreaId = "fileupload-resize-area", resizeArea = document.getElementById(resizeAreaId);
                return resizeArea || (resizeArea = document.createElement("canvas"), resizeArea.id = resizeAreaId, resizeArea.style.visibility = "hidden", document.body.appendChild(resizeArea)), resizeArea
            }, resizeImage = function (origImage, options) {
                var maxHeight = options.resizeMaxHeight || 200, maxWidth = options.resizeMaxWidth || 50, quality = options.resizeQuality || .7, type = options.resizeType || "image/jpg", canvas = getResizeArea(), height = origImage.height, width = origImage.width;
                width > height ? width > maxWidth && (height = Math.round(height *= maxWidth / width), width = maxWidth) : height > maxHeight && (width = Math.round(width *= maxHeight / height), height = maxHeight), canvas.width = width, canvas.height = height;
                var ctx = canvas.getContext("2d");
                return ctx.drawImage(origImage, 0, 0, width, height), canvas.toDataURL(type, quality)
            }, createImage = function (url, callback) {
                var image = new Image;
                image.onload = function () {
                    callback(image)
                }, image.src = url
            }, fileToDataURL = function (file) {
                var deferred = $q.defer(), reader = new FileReader;
                return reader.onload = function (e) {
                    deferred.resolve(e.target.result)
                }, reader.readAsDataURL(file), deferred.promise
            };
            return {
                restrict: "A",
                scope: {image: "=", resizeMaxHeight: "@?", resizeMaxWidth: "@?", resizeQuality: "@?", resizeType: "@?"},
                link: function (scope, element, attrs) {
                    var doResizing = function (imageResult, callback) {
                        createImage(imageResult.url, function (image) {
                            var dataURL = resizeImage(image, scope);
                            imageResult.resized = {
                                dataURL: dataURL,
                                type: dataURL.match(/:(.+\/.+);/)[1]
                            }, callback(imageResult)
                        })
                    }, applyScope = function (imageResult) {
                        scope.$apply(function () {
                            attrs.multiple ? scope.image.push(imageResult) : scope.image = imageResult
                        })
                    };
                    element.bind("change", function (evt) {
                        attrs.multiple && (scope.image = []);
                        var files = evt.target.files;
                        angular.forEach(files, function (file) {
                            var imageResult = {file: file, name: file.name, url: URL.createObjectURL(file)};
                            fileToDataURL(file).then(function (dataURL) {
                                imageResult.dataURL = dataURL
                            }), scope.resizeMaxHeight || scope.resizeMaxWidth ? doResizing(imageResult, function (imageResult) {
                                applyScope(imageResult)
                            }) : applyScope(imageResult)
                        })
                    })
                }
            }
        })
    }),define("shared/directives/directives", ["require", "angular", "./timepickerPopup/timepickerPopup", "./imageResize/imageResize"], function (require) {
        var angular = require("angular"), dependencies = [require("./timepickerPopup/timepickerPopup").name, require("./imageResize/imageResize").name];
        return angular.module("directives", dependencies)
    }),function (factory) {
        "object" == typeof exports ? module.exports = factory(this) : "function" == typeof define && define.amd ? define("ramda", factory) : this.R = factory(this)
    }(function () {
        function _noArgsException() {
            return new TypeError("Function called with no arguments")
        }

        function _slice(args, from, to) {
            switch (arguments.length) {
                case 0:
                    throw _noArgsException();
                case 1:
                    return _slice(args, 0, args.length);
                case 2:
                    return _slice(args, from, args.length);
                default:
                    for (var length = Math.max(0, to - from), list = new Array(length), idx = -1; ++idx < length;)list[idx] = args[from + idx];
                    return list
            }
        }

        function _concat(set1, set2) {
            set1 = set1 || [], set2 = set2 || [];
            var idx, len1 = set1.length, len2 = set2.length, result = new Array(len1 + len2);
            for (idx = -1; ++idx < len1;)result[idx] = set1[idx];
            for (idx = -1; ++idx < len2;)result[len1 + idx] = set2[idx];
            return result
        }

        function _curry2(fn) {
            return function (a, b) {
                switch (arguments.length) {
                    case 0:
                        throw _noArgsException();
                    case 1:
                        return function (b) {
                            return fn(a, b)
                        };
                    default:
                        return fn(a, b)
                }
            }
        }

        function _curry3(fn) {
            return function (a, b, c) {
                switch (arguments.length) {
                    case 0:
                        throw _noArgsException();
                    case 1:
                        return _curry2(function (b, c) {
                            return fn(a, b, c)
                        });
                    case 2:
                        return function (c) {
                            return fn(a, b, c)
                        };
                    default:
                        return fn(a, b, c)
                }
            }
        }

        function _hasMethod(methodName, obj) {
            return null != obj && !_isArray(obj) && "function" == typeof obj[methodName]
        }

        function _checkForMethod(methodname, fn) {
            return function (a, b, c) {
                var length = arguments.length, obj = arguments[length - 1], callBound = obj && !_isArray(obj) && "function" == typeof obj[methodname];
                switch (arguments.length) {
                    case 0:
                        return fn();
                    case 1:
                        return callBound ? obj[methodname]() : fn(a);
                    case 2:
                        return callBound ? obj[methodname](a) : fn(a, b);
                    case 3:
                        return callBound ? obj[methodname](a, b) : fn(a, b, c)
                }
            }
        }

        function forEach(fn, list) {
            for (var idx = -1, len = list.length; ++idx < len;)fn(list[idx]);
            return list
        }

        function _baseCopy(value, refFrom, refTo) {
            switch (value && toString.call(value)) {
                case"[object Object]":
                    return _copyObj(value, {}, refFrom, refTo);
                case"[object Array]":
                    return _copyObj(value, [], refFrom, refTo);
                case"[object Function]":
                    return value;
                case"[object Date]":
                    return new Date(value);
                default:
                    return value
            }
        }

        function _copyObj(value, copiedValue, refFrom, refTo) {
            for (var len = refFrom.length, idx = -1; ++idx < len;)if (value === refFrom[idx])return refTo[idx];
            refFrom.push(value), refTo.push(copiedValue);
            for (var key in value)copiedValue[key] = _baseCopy(value[key], refFrom, refTo);
            return copiedValue
        }

        function _prepend(el, list) {
            return _concat([el], list)
        }

        function _append(el, list) {
            return _concat(list, [el])
        }

        function _compose(f, g) {
            return function () {
                return f.call(this, g.apply(this, arguments))
            }
        }

        function _pCompose(f, g) {
            return function () {
                var context = this, value = g.apply(this, arguments);
                return _isThennable(value) ? value.then(function (result) {
                    return f.call(context, result)
                }) : f.call(this, value)
            }
        }

        function _isThennable(value) {
            return null != value && value === Object(value) && value.then && "function" == typeof value.then
        }

        function _createComposer(composeFunction) {
            return function () {
                switch (arguments.length) {
                    case 0:
                        throw _noArgsException();
                    case 1:
                        return arguments[0];
                    default:
                        for (var idx = arguments.length - 1, fn = arguments[idx], length = fn.length; idx--;)fn = composeFunction(arguments[idx], fn);
                        return arity(length, fn)
                }
            }
        }

        function _createPartialApplicator(concat) {
            return function (fn) {
                var args = _slice(arguments, 1);
                return arity(Math.max(0, fn.length - args.length), function () {
                    return fn.apply(this, concat(args, arguments))
                })
            }
        }

        function _map(fn, list) {
            for (var idx = -1, len = list.length, result = new Array(len); ++idx < len;)result[idx] = fn(list[idx]);
            return result
        }

        function _filter(fn, list) {
            for (var idx = -1, len = list.length, result = []; ++idx < len;)fn(list[idx]) && result.push(list[idx]);
            return result
        }

        function filterIdx(fn, list) {
            for (var idx = -1, len = list.length, result = []; ++idx < len;)fn(list[idx], idx, list) && result.push(list[idx]);
            return result
        }

        function every(fn, list) {
            for (var idx = -1; ++idx < list.length;)if (!fn(list[idx]))return !1;
            return !0
        }

        function some(fn, list) {
            for (var idx = -1; ++idx < list.length;)if (fn(list[idx]))return !0;
            return !1
        }

        function _indexOf(list, item, from) {
            var idx = 0, len = list.length;
            for ("number" == typeof from && (idx = 0 > from ? Math.max(0, len + from) : from); len > idx;) {
                if (list[idx] === item)return idx;
                ++idx
            }
            return -1
        }

        function _lastIndexOf(list, item, from) {
            var idx = list.length;
            for ("number" == typeof from && (idx = 0 > from ? idx + from + 1 : Math.min(idx, from + 1)); --idx >= 0;)if (list[idx] === item)return idx;
            return -1
        }

        function _contains(a, list) {
            return _indexOf(list, a) >= 0
        }

        function _containsWith(pred, x, list) {
            for (var idx = -1, len = list.length; ++idx < len;)if (pred(x, list[idx]))return !0;
            return !1
        }

        function _makeFlat(recursive) {
            return function flatt(list) {
                for (var value, j, jlen, result = [], idx = -1, ilen = list.length; ++idx < ilen;)if (isArrayLike(list[idx]))for (value = recursive ? flatt(list[idx]) : list[idx], j = -1, jlen = value.length; ++j < jlen;)result.push(value[j]); else result.push(list[idx]);
                return result
            }
        }

        function _pairWith(fn) {
            return function (obj) {
                return _map(function (key) {
                    return [key, obj[key]]
                }, fn(obj))
            }
        }

        function _pickBy(test, obj) {
            for (var prop, copy = {}, props = keysIn(obj), len = props.length, idx = -1; ++idx < len;)prop = props[idx], test(obj[prop], prop, obj) && (copy[prop] = obj[prop]);
            return copy
        }

        function _pickAll(names, obj) {
            var copy = {};
            return forEach(function (name) {
                copy[name] = obj[name]
            }, names), copy
        }

        function _extend(destination, other) {
            for (var props = keys(other), idx = -1, length = props.length; ++idx < length;)destination[props[idx]] = other[props[idx]];
            return destination
        }

        function _satisfiesSpec(spec, parsedSpec, testObj) {
            if (spec === testObj)return !0;
            if (null == testObj)return !1;
            parsedSpec.fn = parsedSpec.fn || [], parsedSpec.obj = parsedSpec.obj || [];
            for (var key, val, idx = -1, fnLen = parsedSpec.fn.length, j = -1, objLen = parsedSpec.obj.length; ++idx < fnLen;) {
                if (key = parsedSpec.fn[idx], val = spec[key], !(key in testObj))return !1;
                if (!val(testObj[key], testObj))return !1
            }
            for (; ++j < objLen;)if (key = parsedSpec.obj[j], spec[key] !== testObj[key])return !1;
            return !0
        }

        function _predicateWrap(predPicker) {
            return function (preds) {
                var predIterator = function () {
                    var args = arguments;
                    return predPicker(function (predicate) {
                        return predicate.apply(null, args)
                    }, preds)
                };
                return arguments.length > 1 ? predIterator.apply(null, _slice(arguments, 1)) : arity(max(pluck("length", preds)), predIterator)
            }
        }

        function _add(a, b) {
            return a + b
        }

        function _multiply(a, b) {
            return a * b
        }

        function lt(a, b) {
            return b > a
        }

        function gt(a, b) {
            return a > b
        }

        function _createMaxMin(comparator, initialVal) {
            return function (list) {
                if (0 === arguments.length)throw _noArgsException();
                for (var computed, idx = -1, winner = initialVal; ++idx < list.length;)computed = +list[idx], comparator(computed, winner) && (winner = computed);
                return winner
            }
        }

        function _createMaxMinBy(comparator) {
            return function (valueComputer, list) {
                if (list && list.length > 0) {
                    for (var computedCurrent, idx = 0, winner = list[idx], computedWinner = valueComputer(winner); ++idx < list.length;)computedCurrent = valueComputer(list[idx]), comparator(computedCurrent, computedWinner) && (computedWinner = computedCurrent, winner = list[idx]);
                    return winner
                }
            }
        }

        function _path(paths, obj) {
            var val, idx = -1, length = paths.length;
            if (null != obj) {
                for (val = obj; null != val && ++idx < length;)val = val[paths[idx]];
                return val
            }
        }

        function _keyValue(fn, list) {
            return _map(function (item) {
                return {key: fn(item), val: item}
            }, list)
        }

        function _functionsWith(fn) {
            return function (obj) {
                return _filter(function (key) {
                    return "function" == typeof obj[key]
                }, fn(obj))
            }
        }

        var __, R = {version: "0.8.0"}, toString = Object.prototype.toString, _isArray = Array.isArray || function (val) {
                return null != val && val.length >= 0 && "[object Array]" === toString.call(val)
            }, isArrayLike = R.isArrayLike = function (x) {
            return _isArray(x) ? !0 : x ? "object" != typeof x ? !1 : x instanceof String ? !1 : 1 === x.nodeType ? !!x.length : 0 === x.length ? !0 : x.length > 0 ? x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1) : !1 : !1
        };
        try {
            Object.defineProperty(R, "__", {writable: !1, value: __})
        } catch (e) {
            R.__ = __
        }
        var op = R.op = function (fn) {
            var length = fn.length;
            if (2 !== length)throw new Error("Expected binary function.");
            return function _op(a, b) {
                switch (arguments.length) {
                    case 0:
                        throw _noArgsException();
                    case 1:
                        return a === __ ? binary(flip(_op)) : unary(lPartial(fn, a));
                    default:
                        return a === __ ? unary(rPartial(fn, b)) : fn(a, b)
                }
            }
        }, curryN = R.curryN = function (length, fn) {
            return function recurry(args) {
                return arity(Math.max(length - (args && args.length || 0), 0), function () {
                    if (0 === arguments.length)throw _noArgsException();
                    var newArgs = _concat(args, arguments);
                    return newArgs.length >= length ? fn.apply(this, newArgs) : recurry(newArgs)
                })
            }([])
        }, curry = R.curry = function (fn) {
            return curryN(fn.length, fn)
        }, flip = R.flip = function (fn) {
            return function (a, b) {
                switch (arguments.length) {
                    case 0:
                        throw _noArgsException();
                    case 1:
                        return function (b) {
                            return fn.apply(this, [b, a].concat(_slice(arguments, 1)))
                        };
                    default:
                        return fn.apply(this, _concat([b, a], _slice(arguments, 2)))
                }
            }
        }, nAry = R.nAry = function (n, fn) {
            switch (n) {
                case 0:
                    return function () {
                        return fn.call(this)
                    };
                case 1:
                    return function (a0) {
                        return fn.call(this, a0)
                    };
                case 2:
                    return function (a0, a1) {
                        return fn.call(this, a0, a1)
                    };
                case 3:
                    return function (a0, a1, a2) {
                        return fn.call(this, a0, a1, a2)
                    };
                case 4:
                    return function (a0, a1, a2, a3) {
                        return fn.call(this, a0, a1, a2, a3)
                    };
                case 5:
                    return function (a0, a1, a2, a3, a4) {
                        return fn.call(this, a0, a1, a2, a3, a4)
                    };
                case 6:
                    return function (a0, a1, a2, a3, a4, a5) {
                        return fn.call(this, a0, a1, a2, a3, a4, a5)
                    };
                case 7:
                    return function (a0, a1, a2, a3, a4, a5, a6) {
                        return fn.call(this, a0, a1, a2, a3, a4, a5, a6)
                    };
                case 8:
                    return function (a0, a1, a2, a3, a4, a5, a6, a7) {
                        return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7)
                    };
                case 9:
                    return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
                        return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8)
                    };
                case 10:
                    return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                        return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9)
                    };
                default:
                    return fn
            }
        }, unary = R.unary = function (fn) {
            return nAry(1, fn)
        }, binary = R.binary = function (fn) {
            return nAry(2, fn)
        }, arity = R.arity = function (n, fn) {
            switch (n) {
                case 0:
                    return function () {
                        return fn.apply(this, arguments)
                    };
                case 1:
                    return function (a0) {
                        return fn.apply(this, arguments)
                    };
                case 2:
                    return function (a0, a1) {
                        return fn.apply(this, arguments)
                    };
                case 3:
                    return function (a0, a1, a2) {
                        return fn.apply(this, arguments)
                    };
                case 4:
                    return function (a0, a1, a2, a3) {
                        return fn.apply(this, arguments)
                    };
                case 5:
                    return function (a0, a1, a2, a3, a4) {
                        return fn.apply(this, arguments)
                    };
                case 6:
                    return function (a0, a1, a2, a3, a4, a5) {
                        return fn.apply(this, arguments)
                    };
                case 7:
                    return function (a0, a1, a2, a3, a4, a5, a6) {
                        return fn.apply(this, arguments)
                    };
                case 8:
                    return function (a0, a1, a2, a3, a4, a5, a6, a7) {
                        return fn.apply(this, arguments)
                    };
                case 9:
                    return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
                        return fn.apply(this, arguments)
                    };
                case 10:
                    return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                        return fn.apply(this, arguments)
                    };
                default:
                    return fn
            }
        }, invokerN = R.invokerN = function (arity, method) {
            var initialArgs = _slice(arguments, 2), len = arity - initialArgs.length;
            return curryN(len + 1, function () {
                var target = arguments[len], args = initialArgs.concat(_slice(arguments, 0, len));
                return target[method].apply(target, args)
            })
        }, useWith = R.useWith = function (fn) {
            var transformers = _slice(arguments, 1), tlen = transformers.length;
            return curry(arity(tlen, function () {
                for (var args = [], idx = -1; ++idx < tlen;)args.push(transformers[idx](arguments[idx]));
                return fn.apply(this, args.concat(_slice(arguments, tlen)))
            }))
        };
        R.forEach = _curry2(forEach), R.forEach.idx = _curry2(function (fn, list) {
            for (var idx = -1, len = list.length; ++idx < len;)fn(list[idx], idx, list);
            return list
        });
        var clone = R.clone = function (list) {
            return _slice(list)
        };
        R.cloneDeep = function (value) {
            return _baseCopy(value, [], [])
        };
        var isEmpty = R.isEmpty = function (val) {
            return null == val || 0 === val.length
        }, prepend = R.prepend = _curry2(_prepend);
        R.cons = prepend, R.prependTo = flip(_prepend);
        var nth = R.nth = _curry2(function (n, list) {
            return 0 > n ? list[list.length + n] : list[n]
        }), head = R.head = nth(0);
        R.car = head, R.last = nth(-1);
        var tail = R.tail = _checkForMethod("tail", function (list) {
            return _slice(list, 1)
        });
        R.cdr = tail;
        var append = R.append = _curry2(_append);
        R.push = append, R.appendTo = flip(_append), R.concat = _curry2(function (set1, set2) {
            if (_isArray(set2))return _concat(set1, set2);
            if (_hasMethod("concat", set1))return set1.concat(set2);
            throw new TypeError("can't concat " + typeof set1)
        });
        var identity = R.identity = function (x) {
            return x
        };
        R.I = identity, R.argN = function (n) {
            return function () {
                return arguments[n]
            }
        };
        var times = R.times = _curry2(function (fn, n) {
            for (var list = new Array(n), idx = -1; ++idx < n;)list[idx] = fn(idx);
            return list
        });
        R.repeatN = _curry2(function (value, n) {
            return times(always(value), n)
        }), R.apply = _curry2(function (fn, args) {
            return fn.apply(this, args)
        }), R.unapply = function (fn) {
            if (0 === arguments.length)throw _noArgsException();
            return function () {
                return fn(_slice(arguments))
            }
        };
        var compose = R.compose = _createComposer(_compose), pCompose = R.pCompose = _createComposer(_pCompose);
        R.pipe = function () {
            return compose.apply(this, reverse(arguments))
        }, R.pPipe = function () {
            return pCompose.apply(this, reverse(arguments))
        };
        var lPartial = R.lPartial = _createPartialApplicator(_concat), rPartial = R.rPartial = _createPartialApplicator(flip(_concat));
        R.memoize = function (fn) {
            if (!fn.length)return once(fn);
            var cache = {};
            return function () {
                if (arguments.length) {
                    var position = reduce(function (cache, arg) {
                        return cache[arg] || (cache[arg] = {})
                    }, cache, _slice(arguments, 0, arguments.length - 1)), arg = arguments[arguments.length - 1];
                    return position[arg] || (position[arg] = fn.apply(this, arguments))
                }
            }
        };
        var once = R.once = function (fn) {
            var result, called = !1;
            return function () {
                return called ? result : (called = !0, result = fn.apply(this, arguments))
            }
        };
        R.wrap = function (fn, wrapper) {
            return arity(fn.length, function () {
                return wrapper.apply(this, _concat([fn], arguments))
            })
        };
        var constructN = R.constructN = _curry2(function (n, Fn) {
            var f = function () {
                var inst, ret, Temp = function () {
                };
                return Temp.prototype = Fn.prototype, inst = new Temp, ret = Fn.apply(inst, arguments), Object(ret) === ret ? ret : inst
            };
            return n > 1 ? curry(nAry(n, f)) : f
        });
        R.construct = function (Fn) {
            return constructN(Fn.length, Fn)
        }, R.converge = function (after) {
            var fns = _slice(arguments, 1);
            return function () {
                var args = arguments;
                return after.apply(this, _map(function (fn) {
                    return fn.apply(this, args)
                }, fns))
            }
        };
        var reduce = R.reduce = _curry3(function (fn, acc, list) {
            for (var idx = -1, len = list.length; ++idx < len;)acc = fn(acc, list[idx]);
            return acc
        });
        R.foldl = reduce, R.reduce.idx = _curry3(function (fn, acc, list) {
            for (var idx = -1, len = list.length; ++idx < len;)acc = fn(acc, list[idx], idx, list);
            return acc
        }), R.foldl.idx = reduce.idx;
        var reduceRight = R.reduceRight = _curry3(_checkForMethod("reduceRight", function (fn, acc, list) {
            for (var idx = list.length; idx--;)acc = fn(acc, list[idx]);
            return acc
        }));
        R.foldr = reduceRight, R.reduceRight.idx = _curry3(function (fn, acc, list) {
            for (var idx = list.length; idx--;)acc = fn(acc, list[idx], idx, list);
            return acc
        }), R.foldr.idx = reduceRight.idx, R.unfoldr = _curry2(function (fn, seed) {
            for (var pair = fn(seed), result = []; pair && pair.length;)result.push(pair[0]), pair = fn(pair[1]);
            return result
        });
        var map = R.map = _curry2(_checkForMethod("map", _map));
        R.map.idx = _curry2(function (fn, list) {
            for (var idx = -1, len = list.length, result = new Array(len); ++idx < len;)result[idx] = fn(list[idx], idx, list);
            return result
        }), R.mapObj = _curry2(function (fn, obj) {
            return reduce(function (acc, key) {
                return acc[key] = fn(obj[key]), acc
            }, {}, keys(obj))
        }), R.mapObj.idx = _curry2(function (fn, obj) {
            return reduce(function (acc, key) {
                return acc[key] = fn(obj[key], key, obj), acc
            }, {}, keys(obj))
        }), R.scanl = _curry3(function (fn, acc, list) {
            var idx = 0, len = list.length + 1, result = new Array(len);
            for (result[idx] = acc; ++idx < len;)acc = fn(acc, list[idx - 1]), result[idx] = acc;
            return result
        });
        var liftN = R.liftN = _curry2(function (arity, fn) {
            var lifted = curryN(arity, fn);
            if (0 === arguments.length)throw _noArgsException();
            return curryN(arity, function () {
                return reduce(ap, _map(lifted, arguments[0]), _slice(arguments, 1))
            })
        });
        R.lift = function (fn) {
            if (0 === arguments.length)throw _noArgsException();
            return liftN(fn.length, fn)
        };
        var ap = R.ap = _curry2(function (fns, vs) {
            return _hasMethod("ap", fns) ? fns.ap(vs) : reduce(function (acc, fn) {
                return _concat(acc, _map(fn, vs))
            }, [], fns)
        });
        R.of = function (x, container) {
            return _hasMethod("of", container) ? container.of(x) : [x]
        }, R.empty = function (x) {
            return _hasMethod("empty", x) ? x.empty() : []
        }, R.chain = _curry2(_checkForMethod("chain", function (f, list) {
            return unnest(_map(f, list))
        }));
        var commuteMap = R.commuteMap = _curry3(function (fn, of, list) {
            function consF(acc, ftor) {
                return ap(map(append, fn(ftor)), acc)
            }

            return reduce(consF, of([]), list)
        });
        R.commute = commuteMap(map(identity));
        var size = R.size = function (list) {
            return list.length
        };
        R.length = size, R.filter = _curry2(_checkForMethod("filter", _filter)), R.filter.idx = _curry2(filterIdx);
        var reject = function (fn, list) {
            return _filter(not(fn), list)
        };
        R.reject = _curry2(reject), R.reject.idx = _curry2(function (fn, list) {
            return filterIdx(not(fn), list)
        }), R.takeWhile = _curry2(_checkForMethod("takeWhile", function (fn, list) {
            for (var idx = -1, len = list.length; ++idx < len && fn(list[idx]););
            return _slice(list, 0, idx)
        })), R.take = _curry2(_checkForMethod("take", function (n, list) {
            return _slice(list, 0, Math.min(n, list.length))
        })), R.skipUntil = _curry2(function (fn, list) {
            for (var idx = -1, len = list.length; ++idx < len && !fn(list[idx]););
            return _slice(list, idx)
        }), R.skip = _curry2(_checkForMethod("skip", function (n, list) {
            return n < list.length ? _slice(list, n) : []
        })), R.find = _curry2(function (fn, list) {
            for (var idx = -1, len = list.length; ++idx < len;)if (fn(list[idx]))return list[idx]
        }), R.findIndex = _curry2(function (fn, list) {
            for (var idx = -1, len = list.length; ++idx < len;)if (fn(list[idx]))return idx;
            return -1
        }), R.findLast = _curry2(function (fn, list) {
            for (var idx = list.length; idx--;)if (fn(list[idx]))return list[idx]
        }), R.findLastIndex = _curry2(function (fn, list) {
            for (var idx = list.length; idx--;)if (fn(list[idx]))return idx;
            return -1
        }), R.every = _curry2(every), R.some = _curry2(some), R.indexOf = _curry2(function (target, list) {
            return _indexOf(list, target)
        }), R.indexOf.from = _curry3(function (target, fromIdx, list) {
            return _indexOf(list, target, fromIdx)
        }), R.lastIndexOf = _curry2(function (target, list) {
            return _lastIndexOf(list, target)
        }), R.lastIndexOf.from = _curry3(function (target, fromIdx, list) {
            return _lastIndexOf(list, target, fromIdx)
        }), R.contains = _curry2(_contains);
        var containsWith = R.containsWith = _curry3(_containsWith), uniq = R.uniq = function (list) {
            for (var item, idx = -1, len = list.length, result = []; ++idx < len;)item = list[idx], _contains(item, result) || result.push(item);
            return result
        };
        R.isSet = function (list) {
            for (var len = list.length, idx = -1; ++idx < len;)if (_indexOf(list, list[idx], idx + 1) >= 0)return !1;
            return !0
        };
        var uniqWith = R.uniqWith = _curry2(function (pred, list) {
            for (var item, idx = -1, len = list.length, result = []; ++idx < len;)item = list[idx], _containsWith(pred, item, result) || result.push(item);
            return result
        }), pluck = R.pluck = _curry2(function (p, list) {
            return _map(prop(p), list)
        });
        R.flatten = _makeFlat(!0);
        var unnest = R.unnest = _makeFlat(!1);
        R.zipWith = _curry3(function (fn, a, b) {
            for (var rv = [], idx = -1, len = Math.min(a.length, b.length); ++idx < len;)rv[idx] = fn(a[idx], b[idx]);
            return rv
        }), R.zip = _curry2(function (a, b) {
            for (var rv = [], idx = -1, len = Math.min(a.length, b.length); ++idx < len;)rv[idx] = [a[idx], b[idx]];
            return rv
        }), R.zipObj = _curry2(function (keys, values) {
            for (var idx = -1, len = keys.length, out = {}; ++idx < len;)out[keys[idx]] = values[idx];
            return out
        });
        var fromPairs = R.fromPairs = function (pairs) {
            for (var idx = -1, len = pairs.length, out = {}; ++idx < len;)_isArray(pairs[idx]) && pairs[idx].length && (out[pairs[idx][0]] = pairs[idx][1]);
            return out
        }, createMapEntry = R.createMapEntry = _curry2(function (key, val) {
            var obj = {};
            return obj[key] = val, obj
        });
        R.lens = _curry2(function (get, set) {
            var lns = function (a) {
                return get(a)
            };
            return lns.set = set, lns.map = function (fn, a) {
                return set(fn(get(a)), a)
            }, lns
        }), R.xprod = _curry2(function (a, b) {
            if (isEmpty(a) || isEmpty(b))return [];
            for (var j, idx = -1, ilen = a.length, jlen = b.length, result = []; ++idx < ilen;)for (j = -1; ++j < jlen;)result.push([a[idx], b[j]]);
            return result
        });
        var reverse = R.reverse = function (list) {
            for (var idx = -1, length = list.length, pointer = length, result = new Array(length); ++idx < length;)result[--pointer] = list[idx];
            return result
        };
        R.range = _curry2(function (from, to) {
            if (from >= to)return [];
            for (var idx = 0, result = new Array(Math.floor(to) - Math.ceil(from)); to > from;)result[idx++] = from++;
            return result
        }), R.join = invokerN(1, "join"), R.slice = invokerN(2, "slice"), R.slice.from = _curry2(function (a, xs) {
            return xs.slice(a, xs.length)
        }), R.remove = _curry3(function (start, count, list) {
            return _concat(_slice(list, 0, Math.min(start, list.length)), _slice(list, Math.min(list.length, start + count)))
        }), R.insert = _curry3(function (idx, elt, list) {
            return idx = idx < list.length && idx >= 0 ? idx : list.length, _concat(_append(elt, _slice(list, 0, idx)), _slice(list, idx))
        }), R.insert.all = _curry3(function (idx, elts, list) {
            return idx = idx < list.length && idx >= 0 ? idx : list.length, _concat(_concat(_slice(list, 0, idx), elts), _slice(list, idx))
        });
        var comparator = R.comparator = function (pred) {
            return function (a, b) {
                return pred(a, b) ? -1 : pred(b, a) ? 1 : 0
            }
        };
        R.sort = _curry2(function (comparator, list) {
            return clone(list).sort(comparator)
        });
        var groupBy = R.groupBy = _curry2(function (fn, list) {
            return reduce(function (acc, elt) {
                var key = fn(elt);
                return acc[key] = _append(elt, acc[key] || (acc[key] = [])), acc
            }, {}, list)
        });
        R.partition = _curry2(function (pred, list) {
            return reduce(function (acc, elt) {
                return acc[pred(elt) ? 0 : 1].push(elt), acc
            }, [[], []], list)
        }), R.tap = _curry2(function (fn, x) {
            return fn(x), x
        }), R.eq = _curry2(function (a, b) {
            return a === b
        });
        var prop = R.prop = function (p, obj) {
            switch (arguments.length) {
                case 0:
                    throw _noArgsException();
                case 1:
                    return function (obj) {
                        return obj[p]
                    }
            }
            return obj[p]
        };
        R.get = prop, R.propOf = flip(prop), R.props = _curry2(function (ps, obj) {
            for (var len = ps.length, out = new Array(len), idx = -1; ++idx < len;)out[idx] = obj[ps[idx]];
            return out
        });
        var _hasOwnProperty = Object.prototype.hasOwnProperty;
        R.propOr = _curry3(function (p, val, obj) {
            return _hasOwnProperty.call(obj, p) ? obj[p] : val
        }), R.has = _curry2(function (prop, obj) {
            return _hasOwnProperty.call(obj, prop)
        }), R.hasIn = _curry2(function (prop, obj) {
            return prop in obj
        }), R.func = function (funcName, obj) {
            switch (arguments.length) {
                case 0:
                    throw _noArgsException();
                case 1:
                    return function (obj) {
                        return obj[funcName].apply(obj, _slice(arguments, 1))
                    };
                default:
                    return obj[funcName].apply(obj, _slice(arguments, 2))
            }
        };
        var always = R.always = function (val) {
            return function () {
                return val
            }
        };
        R.bind = _curry2(function (fn, thisObj) {
            return function () {
                return fn.apply(thisObj, arguments)
            }
        });
        var keys = R.keys = function () {
            var hasEnumBug = !{toString: null}.propertyIsEnumerable("toString"), nonEnumerableProps = ["constructor", "valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];
            return function (obj) {
                if (Object(obj) !== obj)return [];
                if (Object.keys)return Object.keys(obj);
                var prop, nIdx, ks = [];
                for (prop in obj)_hasOwnProperty.call(obj, prop) && ks.push(prop);
                if (hasEnumBug)for (nIdx = nonEnumerableProps.length; nIdx--;)prop = nonEnumerableProps[nIdx], _hasOwnProperty.call(obj, prop) && !_contains(prop, ks) && ks.push(prop);
                return ks
            }
        }(), keysIn = R.keysIn = function (obj) {
            var prop, ks = [];
            for (prop in obj)ks.push(prop);
            return ks
        };
        R.toPairs = _pairWith(keys), R.toPairsIn = _pairWith(keysIn), R.values = function (obj) {
            for (var props = keys(obj), len = props.length, vals = new Array(len), idx = -1; ++idx < len;)vals[idx] = obj[props[idx]];
            return vals
        }, R.valuesIn = function (obj) {
            var prop, vs = [];
            for (prop in obj)vs.push(obj[prop]);
            return vs
        }, R.pick = _curry2(function (names, obj) {
            return _pickBy(function (val, key) {
                return _contains(key, names)
            }, obj)
        }), R.omit = _curry2(function (names, obj) {
            return _pickBy(function (val, key) {
                return !_contains(key, names)
            }, obj)
        }), R.pickBy = _curry2(_pickBy);
        var pickAll = R.pickAll = _curry2(_pickAll);
        R.mixin = _curry2(function (a, b) {
            return _extend(_extend({}, a), b)
        }), R.cloneObj = function (obj) {
            return _extend({}, obj)
        }, R.eqProps = _curry3(function (prop, obj1, obj2) {
            return obj1[prop] === obj2[prop]
        }), R.where = function (spec, testObj) {
            var parsedSpec = groupBy(function (key) {
                return "function" == typeof spec[key] ? "fn" : "obj"
            }, keys(spec));
            switch (arguments.length) {
                case 0:
                    throw _noArgsException();
                case 1:
                    return function (testObj) {
                        return _satisfiesSpec(spec, parsedSpec, testObj)
                    }
            }
            return _satisfiesSpec(spec, parsedSpec, testObj)
        };
        var assoc = R.assoc = _curry3(function (prop, val, obj) {
            return _extend(fromPairs(_map(function (key) {
                return [key, obj[key]]
            }, keysIn(obj))), createMapEntry(prop, val))
        });
        R.assocPath = function () {
            var setParts = function (parts, val, obj) {
                if (1 === parts.length)return assoc(parts[0], val, obj);
                var current = obj[parts[0]];
                return assoc(parts[0], setParts(_slice(parts, 1), val, is(Object, current) ? current : {}), obj)
            };
            return function (path, val, obj) {
                var length = arguments.length;
                if (0 === length)throw _noArgsException();
                var parts = split(".", path), fn = _curry2(function (val, obj) {
                    return setParts(parts, val, obj)
                });
                switch (length) {
                    case 1:
                        return fn;
                    case 2:
                        return fn(val);
                    default:
                        return fn(val, obj)
                }
            }
        }(), R.installTo = function (obj) {
            return _extend(obj, R)
        };
        var is = R.is = _curry2(function (Ctor, val) {
            return null != val && val.constructor === Ctor || val instanceof Ctor
        });
        R.type = function (val) {
            return null === val ? "Null" : void 0 === val ? "Undefined" : toString.call(val).slice(8, -1)
        }, R.alwaysZero = always(0), R.alwaysFalse = always(!1), R.alwaysTrue = always(!0), R.and = _curry2(function (f, g) {
            return function () {
                return f.apply(this, arguments) && g.apply(this, arguments)
            }
        }), R.or = _curry2(function (f, g) {
            return function () {
                return f.apply(this, arguments) || g.apply(this, arguments)
            }
        });
        var not = R.not = function (f) {
            return function () {
                return !f.apply(this, arguments)
            }
        };
        R.allPredicates = _predicateWrap(every), R.anyPredicates = _predicateWrap(some);
        var ifElse = R.ifElse = _curry3(function (condition, onTrue, onFalse) {
            return function () {
                return condition.apply(this, arguments) ? onTrue.apply(this, arguments) : onFalse.apply(this, arguments)
            }
        });
        R["if"] = ifElse, R.cond = function () {
            var pairs = arguments;
            return function () {
                for (var idx = -1; ++idx < pairs.length;)if (pairs[idx][0].apply(this, arguments))return pairs[idx][1].apply(this, arguments)
            }
        }, R.add = _curry2(_add), R.multiply = _curry2(_multiply), R.subtract = op(function (a, b) {
            return a - b
        }), R.divide = op(function (a, b) {
            return a / b
        }), R.modulo = op(function (a, b) {
            return a % b
        });
        var _isInteger = Number.isInteger || function (n) {
                return n << 0 === n
            };
        R.mathMod = op(function (m, p) {
            return _isInteger(m) ? !_isInteger(p) || 1 > p ? 0 / 0 : (m % p + p) % p : 0 / 0
        }), R.sum = reduce(_add, 0), R.product = reduce(_multiply, 1), R.lt = op(lt), R.lte = op(function (a, b) {
            return b >= a
        }), R.gt = op(gt), R.gte = op(function (a, b) {
            return a >= b
        });
        var max = R.max = _createMaxMin(gt, -1 / 0);
        R.maxBy = _curry2(_createMaxMinBy(gt)), R.min = _createMaxMin(lt, 1 / 0), R.minBy = _curry2(_createMaxMinBy(lt));
        var substring = R.substring = invokerN(2, "substring");
        R.substringFrom = flip(substring)(void 0), R.substringTo = substring(0), R.charAt = invokerN(1, "charAt"), R.charCodeAt = invokerN(1, "charCodeAt"), R.match = invokerN(1, "match"), R.replace = _curry3(function (regex, replacement, str) {
            return str.replace(regex, replacement)
        }), R.strIndexOf = _curry2(function (c, str) {
            return str.indexOf(c)
        }), R.strLastIndexOf = _curry2(function (c, str) {
            return str.lastIndexOf(c)
        }), R.toUpperCase = invokerN(0, "toUpperCase"), R.toLowerCase = invokerN(0, "toLowerCase"), R.trim = function () {
            var ws = "	\n\f\r   ᠎             　\u2028\u2029﻿", zeroWidth = "​", hasProtoTrim = "function" == typeof String.prototype.trim;
            return hasProtoTrim && !ws.trim() && zeroWidth.trim() ? function (str) {
                return str.trim()
            } : function (str) {
                var beginRx = new RegExp("^[" + ws + "][" + ws + "]*"), endRx = new RegExp("[" + ws + "][" + ws + "]*$");
                return str.replace(beginRx, "").replace(endRx, "")
            }
        }();
        var split = R.split = invokerN(1, "split"), pathOn = R.pathOn = _curry3(function (sep, str, obj) {
            return _path(str.split(sep), obj)
        });
        R.path = pathOn("."), R.pathEq = _curry3(function (path, val, obj) {
            return _path(path.split("."), obj) === val
        }), R.project = useWith(_map, pickAll, identity), R.propEq = _curry3(function (name, val, obj) {
            return obj[name] === val
        }), R.union = compose(uniq, _concat), R.unionWith = _curry3(function (pred, list1, list2) {
            return uniqWith(pred, _concat(list1, list2))
        }), R.difference = _curry2(function (first, second) {
            for (var out = [], idx = -1, firstLen = first.length; ++idx < firstLen;)_contains(first[idx], second) || _contains(first[idx], out) || out.push(first[idx]);
            return out
        }), R.differenceWith = _curry3(function (pred, first, second) {
            for (var out = [], idx = -1, firstLen = first.length, containsPred = containsWith(pred); ++idx < firstLen;)containsPred(first[idx], second) || containsPred(first[idx], out) || out.push(first[idx]);
            return out
        }), R.intersection = _curry2(function (list1, list2) {
            return uniq(_filter(flip(_contains)(list1), list2))
        }), R.intersectionWith = _curry3(function (pred, list1, list2) {
            for (var results = [], idx = -1; ++idx < list1.length;)_containsWith(pred, list1[idx], list2) && (results[results.length] = list1[idx]);
            return uniqWith(pred, results)
        });
        var _compareKeys = comparator(function (a, b) {
            return a.key < b.key
        });
        return R.sortBy = _curry2(function (fn, list) {
            return pluck("val", _keyValue(fn, list).sort(_compareKeys))
        }), R.countBy = _curry2(function (fn, list) {
            return reduce(function (counts, obj) {
                return counts[obj.key] = (counts[obj.key] || 0) + 1, counts
            }, {}, _keyValue(fn, list))
        }), R.functions = _functionsWith(keys), R.functionsIn = _functionsWith(keysIn), R
    }),define("shared/services/googleMapsService", ["angular", "ramda"], function (angular, R) {
        return angular.module("googleMaps", []).service("googleMapsService", ["$window", "$q", function ($window, $q) {
            return {
                init: function () {
                    var dfd = $q.defer(), doc = $window.document, scriptId = "gmapScript", scriptTag = doc.getElementById(scriptId);
                    return scriptTag && $window.google && $window.google.maps ? (dfd.resolve($window.google.maps), dfd.promise) : ($window.mapReady = function (dfd) {
                        return function () {
                            dfd.resolve($window.google && $window.google.maps), delete $window.mapReady
                        }
                    }(dfd), scriptTag = doc.createElement("script"), scriptTag.id = scriptId, scriptTag.setAttribute("src", "https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=mapReady"), doc.head.appendChild(scriptTag), dfd.promise)
                }, googleMaps: function () {
                    var map, marker, maps = $window.google && $window.google.maps, geocoder = new maps.Geocoder, mapOptions = {
                        zoom: 15,
                        center: new maps.LatLng(18.52034, 73.85674)
                    }, updateAddress = function ($scope, addr, position, idx, isSports) {
                        var addrComp, addressComponents = "address_components", find = function (type) {
                            return function (comp) {
                                return comp.types[0] === type
                            }
                        };
                        $scope.$apply(function ($scope) {
                            var entity = isSports ? $scope.entity.sports[idx] : $scope.entity;
                            addr && (addrComp = addr[addressComponents], entity.city = R.pipe(R.find(find("locality")), R.prop("long_name"))(addrComp), entity.state = R.pipe(R.find(find("administrative_area_level_1")), R.prop("long_name"))(addrComp), entity.pin = R.pipe(R.find(find("postal_code")), R.prop("long_name"))(addrComp)), position && (entity.loc = {
                                type: "Point",
                                coordinates: [position.lat(), position.lng()]
                            })
                        })
                    };
                    return {
                        create: function (canvas, $scope, idx, isSports) {
                            var entity = isSports ? $scope.entity.sports[idx] : $scope.entity, watchGroup = isSports ? ["entity.sports[" + idx + "].city", "entity.sports[" + idx + "].state", "entity.sports[" + idx + "].pin"] : ["entity.city", "entity.state", "entity.pin"], initialLocation = {latLng: mapOptions.center};
                            map = new maps.Map(canvas, mapOptions), marker = new maps.Marker({
                                position: map.getCenter(),
                                map: map,
                                draggable: !0
                            }), entity.loc && entity.loc.coordinates && entity.loc.coordinates.length && (initialLocation = {latLng: new maps.LatLng(entity.loc.coordinates[0], entity.loc.coordinates[1])}), geocoder.geocode(initialLocation, function (results, status) {
                                var position;
                                status === maps.GeocoderStatus.OK && (position = results[0].geometry.location, map.panTo(position), marker.setPosition(position), updateAddress($scope, results[0], position, idx, isSports))
                            }), maps.event.addListener(marker, "dragend", function () {
                                var position = marker.getPosition();
                                map.panTo(position), geocoder.geocode({latLng: position}, function (results, status) {
                                    status === maps.GeocoderStatus.OK && updateAddress($scope, results[0], position, idx, isSports)
                                })
                            }), maps.event.addListener(map, "dragend", function () {
                                var position = map.getCenter();
                                marker.setPosition(position), geocoder.geocode({latLng: position}, function (results, status) {
                                    status === maps.GeocoderStatus.OK && updateAddress($scope, results[0], position, idx, isSports)
                                })
                            }), $scope.$watchGroup(watchGroup, function (newValues, oldValues) {
                                var address;
                                !angular.equals(newValues, oldValues) && newValues[0] && newValues[1] && newValues[2] && (address = {address: newValues[0] + " " + newValues[1] + " " + newValues[2]}, geocoder.geocode(address, function (results, status) {
                                    var position;
                                    status === maps.GeocoderStatus.OK && (position = results[0].geometry.location, map.panTo(position), marker.setPosition(position), updateAddress($scope, null, position, idx, isSports))
                                }))
                            })
                        }
                    }
                }
            }
        }])
    }),define("shared/services/services", ["require", "angular", "./googleMapsService"], function (require) {
        var angular = require("angular"), dependencies = [require("./googleMapsService").name];
        return angular.module("services", dependencies)
    }),define("profiles/profile", ["angular"], function (angular) {
        return angular.module("profile", []).factory("Profile", ["$resource", "appConfig", function ($resource, appConfig) {
            return $resource(appConfig.apiBaseURL + "/profiles/:id", {id: "@_id"}, {
                update: {method: "PUT"},
                get: {method: "GET", isArray: !1}
            })
        }])
    }),define("profiles/profiles", ["angular", "./profile"], function (angular) {
        return angular.module("profiles", ["profile"])
    }),define("enthusiasts/enthusiast", ["angular"], function (angular) {
        return angular.module("enthusiast", []).factory("Enthusiast", ["$resource", "appConfig", function ($resource, appConfig) {
            return $resource(appConfig.apiBaseURL + "/enthusiasts/:id", {id: "@_id"}, {
                update: {method: "PUT"},
                get: {method: "GET", isArray: !1}
            })
        }])
    }),define("enthusiasts/enthusiasts", ["angular", "./enthusiast"], function (angular) {
        return angular.module("enthusiasts", ["enthusiast"])
    }),define("players/player", ["angular"], function (angular) {
        return angular.module("player", []).factory("Player", ["$resource", "appConfig", function ($resource, appConfig) {
            return $resource(appConfig.apiBaseURL + "/players/:id", {id: "@_id"}, {
                update: {method: "PUT"},
                get: {method: "GET", isArray: !1}
            })
        }])
    }),define("players/players", ["angular", "./player"], function (angular) {
        return angular.module("players", ["player"])
    }),define("coaches/coach", ["angular"], function (angular) {
        return angular.module("coach", []).factory("Coach", ["$resource", "appConfig", function ($resource, appConfig) {
            return $resource(appConfig.apiBaseURL + "/coaches/:id", {id: "@_id"}, {
                update: {method: "PUT"},
                get: {method: "GET", isArray: !1}
            })
        }])
    }),define("coaches/coaches", ["angular", "./coach"], function (angular) {
        return angular.module("coaches", ["coach"])
    }),define("facilities/facility", ["angular"], function (angular) {
        return angular.module("facility", []).factory("Facility", ["$resource", "appConfig", function ($resource, appConfig) {
            return $resource(appConfig.apiBaseURL + "/facilities/:id", {id: "@_id"}, {
                update: {method: "PUT"},
                get: {method: "GET", isArray: !1}
            })
        }])
    }),define("facilities/facilities", ["angular", "./facility"], function (angular) {
        return angular.module("facilities", ["facility"])
    }),define("suppliers/supplier", ["angular"], function (angular) {
        return angular.module("supplier", []).factory("Supplier", ["$resource", "appConfig", function ($resource, appConfig) {
            return $resource(appConfig.apiBaseURL + "/suppliers/:id", {id: "@_id"}, {
                update: {method: "PUT"},
                get: {method: "GET", isArray: !1}
            })
        }])
    }),define("suppliers/suppliers", ["angular", "./supplier"], function (angular) {
        return angular.module("suppliers", ["supplier"])
    }),define("events/event", ["angular"], function (angular) {
        return angular.module("event", []).factory("Event", ["$resource", "appConfig", function ($resource, appConfig) {
            return $resource(appConfig.apiBaseURL + "/events/:id", {id: "@_id"}, {
                update: {method: "PUT"},
                get: {method: "GET", isArray: !1}
            })
        }])
    }),define("events/events", ["angular", "./event"], function (angular) {
        return angular.module("events", ["event"])
    }),define("offers/offer", ["angular"], function (angular) {
        return angular.module("offer", []).factory("Offer", ["$resource", "appConfig", function ($resource, appConfig) {
            return $resource(appConfig.apiBaseURL + "/offers/:id", {id: "@_id"}, {
                update: {method: "PUT"},
                get: {method: "GET", isArray: !1}
            })
        }])
    }),define("offers/offers", ["angular", "./offer"], function (angular) {
        return angular.module("offers", ["offer"])
    }),define("account/accountService", ["angular", "ramda"], function (angular, R) {
        return angular.module("accountService", []).service("accountService", ["$rootScope", "$http", "$q", "$auth", "appConfig", function ($rootScope, $http, $q, $auth, appConfig) {
            var account = {user: {}, quickSettings: {}, location: "Pune"}, prepareUrl = function (entity, url) {
                return account.user[entity] && account.user[entity]._id ? url + "/" + account.user[entity]._id : url
            }, updateAccountSettings = function () {
                angular.extend(account.quickSettings, {
                    profiles: {
                        url: prepareUrl("profile", "/account/profiles"),
                        title: "Update Profile"
                    },
                    enthusiasts: {
                        url: prepareUrl("enthusiast", "/account/enthusiasts"),
                        title: account.user.enthusiast && account.user.enthusiast._id ? "Subscription Details" : "Enlist as Enthusiast"
                    },
                    coaches: {
                        url: prepareUrl("coach", "/account/coaches"),
                        title: account.user.coach && account.user.coach._id ? "Coaching Details" : "Enlist as Coach"
                    },
                    players: {
                        url: prepareUrl("player", "/account/players"),
                        title: account.user.player && account.user.player._id ? "Player Details" : "Enlist as Player"
                    },
                    facilities: {url: "account/facilities", title: "Add Facility"},
                    suppliers: {url: "account/suppliers", title: "Add Supplier"},
                    events: {url: "account/events", title: "Add an Event"},
                    offers: {url: "account/offers", title: "Float an Offer"}
                })
            };
            return {
                account: account,
                fetch: function () {
                    return !$auth.isAuthenticated() || this.account.user._id ? null : void $http.get(appConfig.apiBaseURL + "/account").then(function (data) {
                        return angular.extend(account.user, data.data), updateAccountSettings(), data.data
                    }, function () {
                        return null
                    })
                },
                getRegisteredEntitiesCount: function () {
                    return $http.get(appConfig.apiBaseURL + "/registeredEntitiesCount")
                },
                isAuthenticated: function () {
                    return $auth.isAuthenticated()
                },
                logout: function () {
                    $auth.logout()
                },
                authenticate: function (provider) {
                    $auth.authenticate(provider)
                },
                reset: function () {
                    this.account.user = {}, this.account.quickSettings = {}
                },
                changeLocation: function (city) {
                    account.location = city
                },
                genders: ["Male", "Female"],
                states: ["Maharashtra", "Karnatak"],
                cities: ["Pune", "Mumbai", "Banglore"],
                playingFrequencies: ["Everyday", "Weekends", "Weekday"],
                experienceYears: R.range(1, 51),
                adultAges: R.range(11, 101),
                kidsAges: R.range(1, 11),
                sports: ["​Aerobics​​", "​Australian football​​", "​Backcountry skiing​​", "​Badminton​​", "​Baseball​​", "​Basketball​​", "​Beach volleyball​​", "​Biathlon​​", "​Biking​​", "​Boxing​​", "​Calisthenics​​", "​Circuit training​​", "​Cricket​​", "​Cross skating​​", "​Cross-country skiing​​", "​Curling​​", "​Dancing​​", "​Diving​​", "​Downhill skiing​​", "​Elliptical​​", "​Ergometer​​", "​Fencing​​", "​Fitness walking​​", "​Football​​", "​Frisbee​​", "​Gardening​​", "​Golf​​", "​Gymnastics​​", "​Handball​​", "​Handcycling​​", "​Hiking​​", "​Hockey​​", "​Horseback riding​​", "​Ice skating​​", "​Indoor skating​​", "​Indoor volleyball​​", "​Inline skating​​", "​Jogging​​", "​Jumping rope​​", "​Kayaking​​", "​Kettlebell​​", "​Kickboxing​​", "​Kite skiing​​", "​Kitesurfing​​", "​Martial arts​​", "​Mixed martial arts​​", "​Mountain biking​​", "​Nordic walking​​", "​Open water swimming​​", "​Other​​", "​P90x​​", "​Paddle boarding​​", "​Paragliding​​", "​Pilates​​", "​Polo​​", "​Pool Swimming​​", "​Racquetball​​", "​Road biking​​", "​Rock climbing​​", "​Roller skiing​​", "​Rowing​​", "​Rowing machine​​", "​Rugby​​", "​Running​​", "​Sand running​​", "​Scuba diving​​", "​Skateboarding​​", "​Skating​​", "​Skiing​​", "​Sledding​​", "​Snowboarding​​", "​Snowshoeing​​", "​Soccer​​", "​Spinning​​", "​Squash​​", "​Stair climbing​​", "​Stair climbing machine​​", "​Stationary biking​​", "​Strength training​​", "​Surfing​​", "​Swimming​​", "​Table tennis​​", "​Tennis​​", "​Treadmill running​​", "​Treadmill walking​​", "​Utility biking​​", "​Volleyball​​", "​Walking​​", "​Wakeboarding​​", "​Water polo​​", "​Weight lifting​​", "​Wheelchair​​", "​Windsurfing​​", "​Yoga​​", "​Zumba"],
                landSports: ["Rock climbing", "Golf", "Football", "Cricket"],
                waterSports: ["Kayaking", "Swimming", "Scuba diving"],
                airSports: ["Aerobatics", "Paragliding", "Kitesurfing"],
                kidsSports: ["Soccer", "Baseball", "Skating", "Tennis"],
                sportsGateways: ["Mountain biking", "Dancing", "Surfing"]
            }
        }])
    }),define("account/authentication/account.authentication.ctrl", ["angular"], function (angular) {
        return angular.module("account.authentication.ctrl", []).controller("account.authentication.ctrl", ["$scope", "accountService", function ($scope, accountService) {
            $scope.authenticate = accountService.authenticate
        }])
    }),define("account/authentication/account.authentication", ["angular", "./account.authentication.ctrl"], function (angular) {
        return angular.module("account.authentication", ["account.authentication.ctrl"]).config(["$routeProvider", function ($routeProvider) {
            $routeProvider.when("/account/login", {
                controller: "account.authentication.ctrl",
                templateUrl: "app/account/authentication/login/account.authentication.login.tpl.html"
            }), $routeProvider.when("/account/signup", {
                controller: "account.authentication.ctrl",
                templateUrl: "app/account/authentication/signup/account.authentication.signup.tpl.html"
            })
        }])
    }),define("account/settings/account.settings.ctrl", ["angular"], function (angular) {
        return angular.module("account.settings.ctrl", []).controller("account.settings.ctrl", ["$scope", "$location", "$window", "$sce", "$timeout", "googleMapsService", "accountService", "settings", function ($scope, $location, $window, $sce, $timeout, googleMapsService, accountService, settings) {
            $scope.entity = settings.entity, $scope.entityType = settings.entityType, $scope.formTemplate = settings.formTemplate, $scope.user = accountService.account.user, $scope.quickSettings = accountService.account.quickSettings;
            var success = function () {
                accountService.reset(), $window.alert("Your listing for " + $scope.entityType + " saved successfully"), $location.path("/account/manage")
            }, error = function (data) {
                angular.forEach(data && data.data.errors, function (error) {
                    var field = $scope.form[error.path];
                    field && (field.$setValidity("server", !1), field.$error.serverMessage = error.message)
                })
            };
            $scope.submit = function (form) {
                form.$valid && ("save" === settings.operation ? $scope.entity.$save().then(success, error) : $scope.entity.$update({id: $scope.entity._id}).then(success, error))
            }, $scope.remove = function (id) {
                $window.confirm("Are you sure you want to remove " + $scope.entityType + " listing ?") && $scope.entity.$delete({id: id}).then(function () {
                    accountService.reset(), $window.alert("Your listing for " + $scope.entityType + " got successfully removed"), $location.path("/account/manage")
                })
            }, $scope.listingMessage = $sce.trustAsHtml('<p>You have indicated your interest in listing your services as a "' + $scope.entityType + '" with us. Please fill in the form create your listing. Your listing information will be verified after submmision.</p><p>After approval, your listing will appear under "' + $scope.entityType + '" category on justKhelo for free and will also appear on any relevant searches on justKhelo.</p>'), ("Player" === $scope.entityType || "Coach" === $scope.entityType || "Sport Enthusiast" === $scope.entityType) && ($scope.entity.sports = $scope.entity.sports && $scope.entity.sports.length ? $scope.entity.sports : [{}], $scope.entity.sports[0].active = !0), $scope.addTab = function (form, catagory) {
                form.$valid ? $scope.entity[catagory].push({active: !0}) : $window.alert("Please validate all fields in other tabs first")
            }, $scope.removeTab = function (index, catagory) {
                index > -1 && $scope.entity[catagory].splice(index, 1), $scope.entity[catagory] = $scope.entity[catagory] && $scope.entity[catagory].length ? $scope.entity[catagory] : [{active: !0}]
            }, $scope.tabChanged = function (idx) {
                $timeout(function () {
                    var documentId = "addr-map-canvas";
                    ("Player" === $scope.entityType || "Coach" === $scope.entityType) && (documentId += idx, createMap(documentId, idx, !0))
                }, 2e3)
            };
            var createMap = function (documentId, idx, isSports) {
                var googleMaps = googleMapsService.googleMaps(), canvas = $window.document.getElementById(documentId);
                canvas && googleMaps.create(canvas, $scope, idx, isSports)
            };
            "Sport Enthusiast" !== $scope.entityType && "Settings" !== $scope.entityType && $timeout(function () {
                var documentId = "addr-map-canvas";
                createMap(documentId)
            }, 2e3), $scope.handleImageSelect = function (element, type) {
                var file = element.files[0], reader = new FileReader;
                $scope[type + "CroppedImage"] = "", reader.onload = function (evt) {
                    $scope.$apply(function ($scope) {
                        $scope[type + "Image"] = evt.target.result, $scope[type + "ImageName"] = file.name
                    })
                }, reader.readAsDataURL(file)
            }, $scope.datePickerOptions = {
                showWeeks: !1,
                formatYear: "yy",
                startingDay: 1,
                showButtonBar: !1
            }, $scope.openDateTimePicker = function ($event, dateType) {
                $event.preventDefault(), $event.stopPropagation(), $scope[dateType] = !0
            }, $scope.dateTimePickerChanged = function (dateType) {
                $scope[dateType] = !1
            }, $scope.genders = accountService.genders, $scope.states = accountService.states, $scope.cities = accountService.cities, $scope.playingFrequencies = accountService.playingFrequencies, $scope.experienceYears = accountService.experienceYears, $scope.adultAges = accountService.adultAges, $scope.kidsAges = accountService.kidsAges, $scope.sports = accountService.sports
        }])
    }),define("account/settings/manage/manage", ["angular"], function (angular) {
        return angular.module("account.settings.manage", []).config(["$routeProvider", function ($routeProvider) {
            $routeProvider.when("/account/manage", {
                controller: "account.settings.ctrl",
                templateUrl: "app/account/settings/account.settings.tpl.html",
                resolve: {
                    settings: ["Enthusiast", function (Enthusiast) {
                        return {
                            entity: new Enthusiast,
                            entityType: "Settings",
                            formTemplate: "app/account/settings/manage/account.settings.manage.tpl.html"
                        }
                    }], account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }]
                }
            })
        }])
    }),define("account/settings/profiles/profiles", ["angular"], function (angular) {
        return angular.module("account.settings.profiles", []).config(["$routeProvider", function ($routeProvider) {
            $routeProvider.when("/account/profiles/:id", {
                controller: "account.settings.ctrl",
                templateUrl: "app/account/settings/account.settings.tpl.html",
                resolve: {
                    settings: ["$q", "$route", "Profile", function ($q, $route, Profile) {
                        var dfd = $q.defer();
                        return Profile.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: "Profile",
                                operation: "update",
                                formTemplate: "app/account/settings/profiles/account.settings.profiles.tpl.html"
                            })
                        }, function () {
                            dfd.reject(null)
                        }), dfd.promise
                    }], account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }], googleMaps: ["googleMapsService", function (googleMapsService) {
                        googleMapsService.init().then(function (googleMaps) {
                            return googleMaps
                        })
                    }]
                }
            })
        }])
    }),define("account/settings/enthusiasts/enthusiasts", ["angular"], function (angular) {
        return angular.module("account.settings.enthusiasts", []).config(["$routeProvider", function ($routeProvider) {
            $routeProvider.when("/account/enthusiasts", {
                controller: "account.settings.ctrl",
                templateUrl: "app/account/settings/account.settings.tpl.html",
                resolve: {
                    settings: ["Enthusiast", function (Enthusiast) {
                        return {
                            entity: new Enthusiast,
                            entityType: "Sport Enthusiast",
                            operation: "save",
                            formTemplate: "app/account/settings/enthusiasts/account.settings.enthusiasts.tpl.html"
                        }
                    }], account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }]
                }
            }).when("/account/enthusiasts/:id", {
                controller: "account.settings.ctrl",
                templateUrl: "app/account/settings/account.settings.tpl.html",
                resolve: {
                    settings: ["$q", "$route", "Enthusiast", function ($q, $route, Enthusiast) {
                        var dfd = $q.defer();
                        return Enthusiast.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: "Sport Enthusiast",
                                operation: "update",
                                formTemplate: "app/account/settings/enthusiasts/account.settings.enthusiasts.tpl.html"
                            })
                        }, function () {
                            dfd.reject(null)
                        }), dfd.promise
                    }], account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }]
                }
            })
        }])
    }),define("account/settings/players/players", ["angular"], function (angular) {
        return angular.module("account.settings.players", []).config(["$routeProvider", function ($routeProvider) {
            $routeProvider.when("/account/players", {
                controller: "account.settings.ctrl",
                templateUrl: "app/account/settings/account.settings.tpl.html",
                resolve: {
                    settings: ["Player", function (Player) {
                        return {
                            entity: new Player,
                            entityType: "Player",
                            operation: "save",
                            formTemplate: "app/account/settings/players/account.settings.players.tpl.html"
                        }
                    }], account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }], googleMaps: ["googleMapsService", function (googleMapsService) {
                        googleMapsService.init().then(function (googleMaps) {
                            return googleMaps
                        })
                    }]
                }
            }).when("/account/players/:id", {
                controller: "account.settings.ctrl",
                templateUrl: "app/account/settings/account.settings.tpl.html",
                resolve: {
                    settings: ["$q", "$route", "Player", function ($q, $route, Player) {
                        var dfd = $q.defer();
                        return Player.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: "Player",
                                operation: "update",
                                formTemplate: "app/account/settings/players/account.settings.players.tpl.html"
                            })
                        }, function () {
                            dfd.reject(null)
                        }), dfd.promise
                    }], account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }], googleMaps: ["googleMapsService", function (googleMapsService) {
                        googleMapsService.init().then(function (googleMaps) {
                            return googleMaps
                        })
                    }]
                }
            })
        }])
    }),define("account/settings/coaches/coaches", ["angular"], function (angular) {
        return angular.module("account.settings.coaches", []).config(["$routeProvider", function ($routeProvider) {
            $routeProvider.when("/account/coaches", {
                controller: "account.settings.ctrl",
                templateUrl: "app/account/settings/account.settings.tpl.html",
                resolve: {
                    settings: ["Coach", function (Coach) {
                        return {
                            entity: new Coach,
                            entityType: "Coach",
                            operation: "save",
                            formTemplate: "app/account/settings/coaches/account.settings.coaches.tpl.html"
                        }
                    }], account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }], googleMaps: ["googleMapsService", function (googleMapsService) {
                        googleMapsService.init().then(function (googleMaps) {
                            return googleMaps
                        })
                    }]
                }
            }).when("/account/coaches/:id", {
                controller: "account.settings.ctrl",
                templateUrl: "app/account/settings/account.settings.tpl.html",
                resolve: {
                    settings: ["$q", "$route", "Coach", function ($q, $route, Coach) {
                        var dfd = $q.defer();
                        return Coach.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: "Coach",
                                operation: "update",
                                formTemplate: "app/account/settings/coaches/account.settings.coaches.tpl.html"
                            })
                        }, function () {
                            dfd.reject(null)
                        }), dfd.promise
                    }], account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }], googleMaps: ["googleMapsService", function (googleMapsService) {
                        googleMapsService.init().then(function (googleMaps) {
                            return googleMaps
                        })
                    }]
                }
            })
        }])
    }),define("account/settings/facilities/facilities", ["angular"], function (angular) {
        return angular.module("account.settings.facilities", []).config(["$routeProvider", function ($routeProvider) {
            $routeProvider.when("/account/facilities", {
                controller: "account.settings.ctrl",
                templateUrl: "app/account/settings/account.settings.tpl.html",
                resolve: {
                    settings: ["Facility", function (Facility) {
                        return {
                            entity: new Facility,
                            entityType: "Facility",
                            operation: "save",
                            formTemplate: "app/account/settings/facilities/account.settings.facilities.tpl.html"
                        }
                    }], account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }], googleMaps: ["googleMapsService", function (googleMapsService) {
                        googleMapsService.init().then(function (googleMaps) {
                            return googleMaps
                        })
                    }]
                }
            }).when("/account/facilities/:id", {
                controller: "account.settings.ctrl",
                templateUrl: "app/account/settings/account.settings.tpl.html",
                resolve: {
                    settings: ["$q", "$route", "Facility", function ($q, $route, Facility) {
                        var dfd = $q.defer();
                        return Facility.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: "Facility",
                                operation: "update",
                                formTemplate: "app/account/settings/facilities/account.settings.facilities.tpl.html"
                            })
                        }, function () {
                            dfd.reject(null)
                        }), dfd.promise
                    }], account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }], googleMaps: ["googleMapsService", function (googleMapsService) {
                        googleMapsService.init().then(function (googleMaps) {
                            return googleMaps
                        })
                    }]
                }
            })
        }])
    }),define("account/settings/suppliers/suppliers", ["angular"], function (angular) {
        return angular.module("account.settings.suppliers", []).config(["$routeProvider", function ($routeProvider) {
            $routeProvider.when("/account/suppliers", {
                controller: "account.settings.ctrl",
                templateUrl: "app/account/settings/account.settings.tpl.html",
                resolve: {
                    settings: ["Supplier", function (Supplier) {
                        return {
                            entity: new Supplier,
                            entityType: "Supplier",
                            operation: "save",
                            formTemplate: "app/account/settings/suppliers/account.settings.suppliers.tpl.html"
                        }
                    }], account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }], googleMaps: ["googleMapsService", function (googleMapsService) {
                        googleMapsService.init().then(function (googleMaps) {
                            return googleMaps
                        })
                    }]
                }
            }).when("/account/suppliers/:id", {
                controller: "account.settings.ctrl",
                templateUrl: "app/account/settings/account.settings.tpl.html",
                resolve: {
                    settings: ["$q", "$route", "Supplier", function ($q, $route, Supplier) {
                        var dfd = $q.defer();
                        return Supplier.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: "Supplier",
                                operation: "update",
                                formTemplate: "app/account/settings/suppliers/account.settings.suppliers.tpl.html"
                            })
                        }, function () {
                            dfd.reject(null)
                        }), dfd.promise
                    }], account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }], googleMaps: ["googleMapsService", function (googleMapsService) {
                        googleMapsService.init().then(function (googleMaps) {
                            return googleMaps
                        })
                    }]
                }
            })
        }])
    }),define("account/settings/events/events", ["angular"], function (angular) {
        return angular.module("account.settings.events", []).config(["$routeProvider", function ($routeProvider) {
            var getRouteConfig = function (settings) {
                var routeConfig = {
                    controller: "account.settings.ctrl",
                    templateUrl: "app/account/settings/account.settings.tpl.html",
                    resolve: {
                        account: ["accountService", function (accountService) {
                            return accountService.fetch()
                        }], googleMaps: ["googleMapsService", function (googleMapsService) {
                            googleMapsService.init().then(function (googleMaps) {
                                return googleMaps
                            })
                        }]
                    }
                };
                return routeConfig.resolve.settings = settings, routeConfig
            };
            $routeProvider.when("/account/events", getRouteConfig(["Event", function (Event) {
                return {
                    entity: new Event,
                    entityType: "Event",
                    operation: "save",
                    formTemplate: "app/account/settings/events/account.settings.events.tpl.html"
                }
            }])).when("/account/events/:id", getRouteConfig(["$q", "$route", "Event", function ($q, $route, Event) {
                var dfd = $q.defer();
                return Event.get({id: $route.current.params.id}).$promise.then(function (entity) {
                    dfd.resolve({
                        entity: entity,
                        entityType: "Event",
                        operation: "update",
                        formTemplate: "app/account/settings/events/account.settings.events.tpl.html"
                    })
                }, function () {
                    dfd.reject(null)
                }), dfd.promise
            }]))
        }])
    }),define("account/settings/offers/offers", ["angular"], function (angular) {
        return angular.module("account.settings.offers", []).config(["$routeProvider", function ($routeProvider) {
            $routeProvider.when("/account/offers", {
                controller: "account.settings.ctrl",
                templateUrl: "app/account/settings/account.settings.tpl.html",
                resolve: {
                    settings: ["Offer", function (Offer) {
                        return {
                            entity: new Offer,
                            entityType: "Offer",
                            operation: "save",
                            formTemplate: "app/account/settings/offers/account.settings.offers.tpl.html"
                        }
                    }], account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }], googleMaps: ["googleMapsService", function (googleMapsService) {
                        googleMapsService.init().then(function (googleMaps) {
                            return googleMaps
                        })
                    }]
                }
            }).when("/account/offers/:id", {
                controller: "account.settings.ctrl",
                templateUrl: "app/account/settings/account.settings.tpl.html",
                resolve: {
                    settings: ["$q", "$route", "Offer", function ($q, $route, Offer) {
                        var dfd = $q.defer();
                        return Offer.get({id: $route.current.params.id}).$promise.then(function (entity) {
                            dfd.resolve({
                                entity: entity,
                                entityType: "Offer",
                                operation: "update",
                                formTemplate: "app/account/settings/offers/account.settings.offers.tpl.html"
                            })
                        }, function () {
                            dfd.reject(null)
                        }), dfd.promise
                    }], account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }], googleMaps: ["googleMapsService", function (googleMapsService) {
                        googleMapsService.init().then(function (googleMaps) {
                            return googleMaps
                        })
                    }]
                }
            })
        }])
    }),define("account/settings/account.settings", ["angular", "./account.settings.ctrl", "./manage/manage", "./profiles/profiles", "./enthusiasts/enthusiasts", "./players/players", "./coaches/coaches", "./facilities/facilities", "./suppliers/suppliers", "./events/events", "./offers/offers"], function (angular) {
        return angular.module("account.settings", ["account.settings.ctrl", "account.settings.manage", "account.settings.profiles", "account.settings.enthusiasts", "account.settings.players", "account.settings.coaches", "account.settings.facilities", "account.settings.suppliers", "account.settings.events", "account.settings.offers"])
    }),define("account/account", ["angular", "./accountService", "./authentication/account.authentication", "./settings/account.settings"], function (angular) {
        return angular.module("account", ["accountService", "account.authentication", "account.settings"])
    }),define("shared/header/header.ctrl", ["angular"], function (angular) {
        return angular.module("header.ctrl", []).controller("header.ctrl", ["$scope", "accountService", function ($scope, accountService) {
            $scope.isCollapsed = !0, $scope.changeLocation = !1, $scope.user = accountService.account.user, $scope.quickSettings = accountService.account.quickSettings, $scope.city = accountService.account.location, $scope.cities = accountService.cities, $scope.isAuthenticated = accountService.isAuthenticated, $scope.logout = accountService.logout, $scope.updateLocation = function () {
                accountService.changeLocation($scope.city)
            }
        }])
    }),define("shared/header/header", ["angular", "./header.ctrl"], function (angular) {
        return angular.module("header", ["header.ctrl"])
    }),define("shared/footer/footer.ctrl", ["angular"], function (angular) {
        return angular.module("footer.ctrl", []).controller("footer.ctrl", ["$scope", "accountService", function ($scope, accountService) {
            $scope.landSports = accountService.landSports, $scope.waterSports = accountService.waterSports, $scope.airSports = accountService.airSports, $scope.kidsSports = accountService.kidsSports, $scope.sportsGateways = accountService.sportsGateways, accountService.getRegisteredEntitiesCount().then(function (data) {
                $scope.registeredEntitiesCount = data.data
            })
        }])
    }),define("shared/footer/footer", ["angular", "./footer.ctrl"], function (angular) {
        return angular.module("footer", ["footer.ctrl"])
    }),define("search/search.ctrl", ["angular"], function (angular) {
        return angular.module("search.ctrl", []).controller("search.ctrl", ["$scope", "accountService", "$http", "appConfig", function ($scope, accountService, $http, appConfig) {
            $scope.cities = accountService.cities, $scope.searchCity = accountService.account.location, $scope.searchWithin = "city", $scope.searchRadius = 10, $scope.searchLocation = "gps", $scope.updateLocation = function () {
                accountService.changeLocation($scope.searchCity), $scope.refineSearch()
            }, $scope.searchCategoryAll = !0, $scope.searchCategoryPlayers = !0, $scope.searchCategoryCoaches = !0, $scope.searchCategoryFacilities = !0, $scope.searchCategorySuppliers = !0, $scope.searchCategoryEvents = !0, $scope.searchCategoryOffers = !0, $scope.search = {}, $scope.refineSearch = function () {
                $http.get(appConfig.apiBaseURL + "/search", {params: {city: $scope.searchCity}}).then(function (data) {
                    $scope.results = data.data
                })
            }, $scope.user = accountService.account.user, $scope.refineSearch()
        }])
    }),define("search/bar/search.bar.ctrl", ["angular"], function (angular) {
        return angular.module("search.bar.ctrl", []).controller("search.bar.ctrl", ["$scope", "$location", "accountService", function ($scope, $location, accountService) {
            var searchPlaceHolder = "Search Players, Coach, Facilities, Suppliers...";
            $scope.searchCatagory = "all", $scope.searchPlaceHolder = searchPlaceHolder, $scope.setSearchType = function (type) {
                $scope.searchQuery = "", $scope.searchCatagory = type, $scope.searchPlaceHolder = "all" === type ? searchPlaceHolder : "Search for " + type
            }, $scope.submit = function () {
                var location = angular.lowercase(accountService.account.location), path = "all" === $scope.searchCatagory ? "/search/" + location : "/" + $scope.searchCatagory + "/" + location;
                $location.path(path)
            }
        }])
    }),define("search/search", ["angular", "./search.ctrl", "./bar/search.bar.ctrl"], function (angular) {
        return angular.module("search", ["search.ctrl", "search.bar.ctrl"]).config(["$routeProvider", function ($routeProvider) {
            var searchConfig = {
                controller: "search.ctrl",
                templateUrl: "app/search/results/results.tpl.html",
                resolve: {
                    account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }]
                }
            };
            $routeProvider.when("/search", searchConfig).when("/search/:location", searchConfig).when("/coaches/:location", searchConfig).when("/offers/:location", searchConfig).when("/events/:location", searchConfig)
        }])
    }),define("home/home.ctrl", ["angular", "ramda"], function (angular, R) {
        return angular.module("home.ctrl", []).controller("home.ctrl", ["$scope", "$window", "Offer", "Event", "accountService", function ($scope, $window, Offer, Event, accountService) {
            var detectGroupSize = function () {
                var groupSize = 1, group = R.map.idx(function (item, idx, list) {
                    return idx % groupSize === 0 ? list.slice(idx, idx + groupSize) : null
                }), filter = R.filter(function (item) {
                    return item ? item : void 0
                }), groupBy = R.pipe(group, filter);
                $scope.isMobileVerticle && (groupSize = 1), $scope.isMobileHorizontal && (groupSize = 1), $scope.isTablet && (groupSize = 3), $scope.isSmallDesktop && (groupSize = 4), $scope.isLargeDesktop && (groupSize = 2), $scope.eventsSlides = groupBy($scope.events), $scope.offersSlides = groupBy($scope.offers)
            };
            $scope.offers = [], $scope.events = [], $scope.location = angular.lowercase(accountService.account.location), Offer.query(function (data) {
                $scope.offers = data, detectGroupSize()
            }), Event.query(function (data) {
                $scope.events = data, detectGroupSize()
            }), $window.addEventListener("resize", detectGroupSize, !1)
        }])
    }),define("home/home", ["angular", "./home.ctrl"], function (angular) {
        return angular.module("home", ["home.ctrl"]).config(["$routeProvider", function ($routeProvider) {
            $routeProvider.when("/", {
                controller: "home.ctrl",
                templateUrl: "app/home/home.tpl.html",
                resolve: {
                    account: ["accountService", function (accountService) {
                        return accountService.fetch()
                    }]
                }
            })
        }])
    }),define("app", ["require", "angular", "shared/directives/directives", "shared/services/services", "profiles/profiles", "enthusiasts/enthusiasts", "players/players", "coaches/coaches", "facilities/facilities", "suppliers/suppliers", "events/events", "offers/offers", "account/account", "shared/header/header", "shared/footer/footer", "search/search", "home/home"], function (require) {
        var angular = require("angular"), dependencies = ["ngRoute", "ngTouch", "ngMessages", "ngResource", "ngSanitize", "ui.bootstrap", "satellizer", require("shared/directives/directives").name, require("shared/services/services").name, require("profiles/profiles").name, require("enthusiasts/enthusiasts").name, require("players/players").name, require("coaches/coaches").name, require("facilities/facilities").name, require("suppliers/suppliers").name, require("events/events").name, require("offers/offers").name, require("account/account").name, require("shared/header/header").name, require("shared/footer/footer").name, require("search/search").name, require("home/home").name];
        return angular.module("app", dependencies).config(["$resourceProvider", "$routeProvider", "$locationProvider", function ($resourceProvider, $routeProvider, $locationProvider) {
            $resourceProvider.defaults.stripTrailingSlashes = !0, $routeProvider.otherwise("/"), $locationProvider.html5Mode(!0)
        }]).run(["$rootScope", "$window", function ($rootScope, $window) {
            var onResize = function () {
                $rootScope.$apply(function () {
                    var clientWidth = $window.document.body.clientWidth;
                    $rootScope.isMobileVerticle = 480 > clientWidth, $rootScope.isMobileHorizontal = clientWidth >= 480 && 768 > clientWidth, $rootScope.isTablet = clientWidth >= 768 && 992 > clientWidth, $rootScope.isSmallDesktop = clientWidth >= 992 && 1200 > clientWidth, $rootScope.isLargeDesktop = clientWidth >= 1200, $rootScope.isMobile = 768 > clientWidth
                })
            };
            onResize(), $window.addEventListener("resize", onResize, !1)
        }])
    }),require.config({
        shim: {
            angular: {exports: "angular"},
            "angular-route": {deps: ["angular"]},
            "angular-touch": {deps: ["angular"]},
            "angular-animate": {deps: ["angular"]},
            "angular-messages": {deps: ["angular"]},
            "angular-resource": {deps: ["angular"]},
            "angular-sanitize": {deps: ["angular"]},
            "ui-bootstrap": {deps: ["angular"]},
            satellizer: {deps: ["angular"]},
            templateCache: {deps: ["angular"]}
        },
        paths: {
            angular: "../vendor/angular/angular",
            "angular-route": "../vendor/angular/angular-route",
            "angular-touch": "../vendor/angular/angular-touch",
            "angular-animate": "../vendor/angular/angular-animate",
            "angular-messages": "../vendor/angular/angular-messages",
            "angular-resource": "../vendor/angular/angular-resource",
            "angular-sanitize": "../vendor/angular/angular-sanitize",
            "ui-bootstrap": "../vendor/angular/ui-bootstrap-tpls",
            ramda: "../vendor/ramda/ramda",
            satellizer: "../vendor/satellizer/satellizer",
            templateCache: "templateCache"
        }
    }),require(["angular", "angular-route", "angular-touch", "angular-animate", "angular-messages", "angular-resource", "angular-sanitize", "ui-bootstrap", "satellizer", "templateCache", "appConfig", "app"], function (angular) {
        angular.element(document).ready(function () {
            angular.bootstrap(document, ["app", "appConfig"])
        })
    }),define("main", function () {
    }),require(["main"])
}();
//# sourceMappingURL=app.js.map