'use strict';

exports.stringify = function () {

    try {
        return JSON.stringify.apply(null, arguments);
    } catch (err) {
        return '[Cannot display object: ' + err.message + ']';
    }
};

exports.assert = function (condition /*, msg1, msg2, msg3 */) {

    if (condition) {
        return;
    }

    if (arguments.length === 2 && arguments[1] instanceof Error) {
        throw arguments[1];
    }

    var msgs = [];
    for (var i = 1; i < arguments.length; ++i) {
        if (arguments[i] !== '') {
            msgs.push(arguments[i]); // Avoids Array.slice arguments leak, allowing for V8 optimizations
        }
    }

    msgs = msgs.map(function (msg) {

        return typeof msg === 'string' ? msg : msg instanceof Error ? msg.message : exports.stringify(msg);
    });

    throw new Error(msgs.join(' ') || 'Unknown error');
};

// Convert an object key chain string ('a.b.c') to reference (object[a][b][c])

exports.reach = function (obj, chain, options) {

    if (chain === false || chain === null || typeof chain === 'undefined') {

        return obj;
    }

    options = options || {};
    if (typeof options === 'string') {
        options = { separator: options };
    }

    var path = chain.split(options.separator || '.');
    var ref = obj;
    for (var i = 0; i < path.length; ++i) {
        var key = path[i];
        if (key[0] === '-' && Array.isArray(ref)) {
            key = key.slice(1, key.length);
            key = ref.length - key;
        }

        if (!ref || !((typeof ref === 'object' || typeof ref === 'function') && key in ref) || typeof ref !== 'object' && options.functions === false) {
            // Only object and function can have properties

            exports.assert(!options.strict || i + 1 === path.length, 'Missing segment', key, 'in reach path ', chain);
            exports.assert(typeof ref === 'object' || options.functions === true || typeof ref !== 'function', 'Invalid segment', key, 'in reach path ', chain);
            ref = options['default'];
            break;
        }

        ref = ref[key];
    }

    return ref;
};

exports.transform = function (source, transform, options) {

    exports.assert(source === null || source === undefined || typeof source === 'object' || Array.isArray(source), 'Invalid source object: must be null, undefined, an object, or an array');

    if (Array.isArray(source)) {
        var results = [];
        for (var i = 0; i < source.length; ++i) {
            results.push(exports.transform(source[i], transform, options));
        }
        return results;
    }

    var result = {};
    var keys = Object.keys(transform);

    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var path = key.split('.');
        var sourcePath = transform[key];

        exports.assert(typeof sourcePath === 'string', 'All mappings must be "." delineated strings');

        var segment = undefined;
        var res = result;

        while (path.length > 1) {
            segment = path.shift();
            if (!res[segment]) {
                res[segment] = {};
            }
            res = res[segment];
        }
        segment = path.shift();
        res[segment] = exports.reach(source, sourcePath, options);
    }

    return result;
};
