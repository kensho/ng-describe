// wrap any code prefix to ignore it from code
// coverage metrix
/* istanbul ignore next */
(function () {

/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */

// vim: ts=4 sts=4 sw=4 expandtab

// Add semicolon to prevent IIFE from being passed as argument to concatenated code.
;

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
    'use strict';

    /* global define, exports, module */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * Annotated ES5: http://es5.github.com/ (specific links below)
 * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
 * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
 */

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally.
var ArrayPrototype = Array.prototype;
var ObjectPrototype = Object.prototype;
var FunctionPrototype = Function.prototype;
var StringPrototype = String.prototype;
var NumberPrototype = Number.prototype;
var array_slice = ArrayPrototype.slice;
var array_splice = ArrayPrototype.splice;
var array_push = ArrayPrototype.push;
var array_unshift = ArrayPrototype.unshift;
var array_concat = ArrayPrototype.concat;
var call = FunctionPrototype.call;

// Having a toString local variable name breaks in Opera so use to_string.
var to_string = ObjectPrototype.toString;

var isArray = Array.isArray || function isArray(obj) {
    return to_string.call(obj) === '[object Array]';
};

var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
var isCallable; /* inlined from https://npmjs.com/is-callable */ var fnToStr = Function.prototype.toString, tryFunctionObject = function tryFunctionObject(value) { try { fnToStr.call(value); return true; } catch (e) { return false; } }, fnClass = '[object Function]', genClass = '[object GeneratorFunction]'; isCallable = function isCallable(value) { if (typeof value !== 'function') { return false; } if (hasToStringTag) { return tryFunctionObject(value); } var strClass = to_string.call(value); return strClass === fnClass || strClass === genClass; };
var isRegex; /* inlined from https://npmjs.com/is-regex */ var regexExec = RegExp.prototype.exec, tryRegexExec = function tryRegexExec(value) { try { regexExec.call(value); return true; } catch (e) { return false; } }, regexClass = '[object RegExp]'; isRegex = function isRegex(value) { if (typeof value !== 'object') { return false; } return hasToStringTag ? tryRegexExec(value) : to_string.call(value) === regexClass; };
var isString; /* inlined from https://npmjs.com/is-string */ var strValue = String.prototype.valueOf, tryStringObject = function tryStringObject(value) { try { strValue.call(value); return true; } catch (e) { return false; } }, stringClass = '[object String]'; isString = function isString(value) { if (typeof value === 'string') { return true; } if (typeof value !== 'object') { return false; } return hasToStringTag ? tryStringObject(value) : to_string.call(value) === stringClass; };

var isArguments = function isArguments(value) {
    var str = to_string.call(value);
    var isArgs = str === '[object Arguments]';
    if (!isArgs) {
        isArgs = !isArray(value) &&
          value !== null &&
          typeof value === 'object' &&
          typeof value.length === 'number' &&
          value.length >= 0 &&
          isCallable(value.callee);
    }
    return isArgs;
};

/* inlined from http://npmjs.com/define-properties */
var defineProperties = (function (has) {
  var supportsDescriptors = Object.defineProperty && (function () {
      try {
          var obj = {};
          Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
          for (var _ in obj) { return false; }
          return obj.x === obj;
      } catch (e) { /* this is ES3 */
          return false;
      }
  }());

  // Define configurable, writable and non-enumerable props
  // if they don't exist.
  var defineProperty;
  if (supportsDescriptors) {
      defineProperty = function (object, name, method, forceAssign) {
          if (!forceAssign && (name in object)) { return; }
          Object.defineProperty(object, name, {
              configurable: true,
              enumerable: false,
              writable: true,
              value: method
          });
      };
  } else {
      defineProperty = function (object, name, method, forceAssign) {
          if (!forceAssign && (name in object)) { return; }
          object[name] = method;
      };
  }
  return function defineProperties(object, map, forceAssign) {
      for (var name in map) {
          if (has.call(map, name)) {
            defineProperty(object, name, map[name], forceAssign);
          }
      }
  };
}(ObjectPrototype.hasOwnProperty));

//
// Util
// ======
//

/* replaceable with https://npmjs.com/package/es-abstract /helpers/isPrimitive */
var isPrimitive = function isPrimitive(input) {
    var type = typeof input;
    return input === null || (type !== 'object' && type !== 'function');
};

var ES = {
    // ES5 9.4
    // http://es5.github.com/#x9.4
    // http://jsperf.com/to-integer
    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToInteger */
    ToInteger: function ToInteger(num) {
        var n = +num;
        if (n !== n) { // isNaN
            n = 0;
        } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
            n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
        return n;
    },

    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToPrimitive */
    ToPrimitive: function ToPrimitive(input) {
        var val, valueOf, toStr;
        if (isPrimitive(input)) {
            return input;
        }
        valueOf = input.valueOf;
        if (isCallable(valueOf)) {
            val = valueOf.call(input);
            if (isPrimitive(val)) {
                return val;
            }
        }
        toStr = input.toString;
        if (isCallable(toStr)) {
            val = toStr.call(input);
            if (isPrimitive(val)) {
                return val;
            }
        }
        throw new TypeError();
    },

    // ES5 9.9
    // http://es5.github.com/#x9.9
    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToObject */
    ToObject: function (o) {
        /* jshint eqnull: true */
        if (o == null) { // this matches both null and undefined
            throw new TypeError("can't convert " + o + ' to object');
        }
        return Object(o);
    },

    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToUint32 */
    ToUint32: function ToUint32(x) {
        return x >>> 0;
    }
};

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5

var Empty = function Empty() {};

defineProperties(FunctionPrototype, {
    bind: function bind(that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if (!isCallable(target)) {
            throw new TypeError('Function.prototype.bind called on incompatible ' + target);
        }
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = array_slice.call(arguments, 1); // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 11. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 12. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 13. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 14. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        var bound;
        var binder = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs, the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Construct]] internal
                //   method of target providing args as the arguments.

                var result = target.apply(
                    this,
                    array_concat.call(args, array_slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return this;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs, the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Call]] internal method
                //   of target providing boundThis as the this value and
                //   providing args as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.apply(
                    that,
                    array_concat.call(args, array_slice.call(arguments))
                );

            }

        };

        // 15. If the [[Class]] internal property of Target is "Function", then
        //     a. Let L be the length property of Target minus the length of A.
        //     b. Set the length own property of F to either 0 or L, whichever is
        //       larger.
        // 16. Else set the length own property of F to 0.

        var boundLength = Math.max(0, target.length - args.length);

        // 17. Set the attributes of the length own property of F to the values
        //   specified in 15.3.5.1.
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
            boundArgs.push('$' + i);
        }

        // XXX Build a dynamic function with desired amount of arguments is the only
        // way to set the length property of a function.
        // In environments where Content Security Policies enabled (Chrome extensions,
        // for ex.) all use of eval or Function costructor throws an exception.
        // However in all of these environments Function.prototype.bind exists
        // and so this code will never be executed.
        bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this, arguments); }')(binder);

        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            // Clean up dangling references.
            Empty.prototype = null;
        }

        // TODO
        // 18. Set the [[Extensible]] internal property of F to true.

        // TODO
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
        // 20. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
        //   false.
        // 21. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
        //   and false.

        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property or the [[Code]], [[FormalParameters]], and
        // [[Scope]] internal properties.
        // XXX can't delete prototype in pure-js.

        // 22. Return F.
        return bound;
    }
});

// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
// us it in defining shortcuts.
var owns = call.bind(ObjectPrototype.hasOwnProperty);

//
// Array
// =====
//

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.12
var spliceNoopReturnsEmptyArray = (function () {
    var a = [1, 2];
    var result = a.splice();
    return a.length === 2 && isArray(result) && result.length === 0;
}());
defineProperties(ArrayPrototype, {
    // Safari 5.0 bug where .splice() returns undefined
    splice: function splice(start, deleteCount) {
        if (arguments.length === 0) {
            return [];
        } else {
            return array_splice.apply(this, arguments);
        }
    }
}, !spliceNoopReturnsEmptyArray);

var spliceWorksWithEmptyObject = (function () {
    var obj = {};
    ArrayPrototype.splice.call(obj, 0, 0, 1);
    return obj.length === 1;
}());
defineProperties(ArrayPrototype, {
    splice: function splice(start, deleteCount) {
        if (arguments.length === 0) { return []; }
        var args = arguments;
        this.length = Math.max(ES.ToInteger(this.length), 0);
        if (arguments.length > 0 && typeof deleteCount !== 'number') {
            args = array_slice.call(arguments);
            if (args.length < 2) {
                args.push(this.length - start);
            } else {
                args[1] = ES.ToInteger(deleteCount);
            }
        }
        return array_splice.apply(this, args);
    }
}, !spliceWorksWithEmptyObject);

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.13
// Return len+argCount.
// [bugfix, ielt8]
// IE < 8 bug: [].unshift(0) === undefined but should be "1"
var hasUnshiftReturnValueBug = [].unshift(0) !== 1;
defineProperties(ArrayPrototype, {
    unshift: function () {
        array_unshift.apply(this, arguments);
        return this.length;
    }
}, hasUnshiftReturnValueBug);

// ES5 15.4.3.2
// http://es5.github.com/#x15.4.3.2
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
defineProperties(Array, { isArray: isArray });

// The IsCallable() check in the Array functions
// has been replaced with a strict check on the
// internal class of the object to trap cases where
// the provided function was actually a regular
// expression literal, which in V8 and
// JavaScriptCore is a typeof "function".  Only in
// V8 are regular expression literals permitted as
// reduce parameters, so it is desirable in the
// general case for the shim to match the more
// strict and common behavior of rejecting regular
// expressions.

// ES5 15.4.4.18
// http://es5.github.com/#x15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach

// Check failure of by-index access of string characters (IE < 9)
// and failure of `0 in boxedString` (Rhino)
var boxedString = Object('a');
var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

var properlyBoxesContext = function properlyBoxed(method) {
    // Check node 0.6.21 bug where third parameter is not boxed
    var properlyBoxesNonStrict = true;
    var properlyBoxesStrict = true;
    if (method) {
        method.call('foo', function (_, __, context) {
            if (typeof context !== 'object') { properlyBoxesNonStrict = false; }
        });

        method.call([1], function () {
            'use strict';

            properlyBoxesStrict = typeof this === 'string';
        }, 'x');
    }
    return !!method && properlyBoxesNonStrict && properlyBoxesStrict;
};

defineProperties(ArrayPrototype, {
    forEach: function forEach(callbackfn /*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? this.split('') : object;
        var i = -1;
        var length = self.length >>> 0;
        var T;
        if (arguments.length > 1) {
          T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.forEach callback must be a function');
        }

        while (++i < length) {
            if (i in self) {
                // Invoke the callback function with call, passing arguments:
                // context, property value, property key, thisArg object
                if (typeof T !== 'undefined') {
                    callbackfn.call(T, self[i], i, object);
                } else {
                    callbackfn(self[i], i, object);
                }
            }
        }
    }
}, !properlyBoxesContext(ArrayPrototype.forEach));

// ES5 15.4.4.19
// http://es5.github.com/#x15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
defineProperties(ArrayPrototype, {
    map: function map(callbackfn/*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? this.split('') : object;
        var length = self.length >>> 0;
        var result = Array(length);
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.map callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                if (typeof T !== 'undefined') {
                    result[i] = callbackfn.call(T, self[i], i, object);
                } else {
                    result[i] = callbackfn(self[i], i, object);
                }
            }
        }
        return result;
    }
}, !properlyBoxesContext(ArrayPrototype.map));

// ES5 15.4.4.20
// http://es5.github.com/#x15.4.4.20
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
defineProperties(ArrayPrototype, {
    filter: function filter(callbackfn /*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? this.split('') : object;
        var length = self.length >>> 0;
        var result = [];
        var value;
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.filter callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                value = self[i];
                if (typeof T === 'undefined' ? callbackfn(value, i, object) : callbackfn.call(T, value, i, object)) {
                    result.push(value);
                }
            }
        }
        return result;
    }
}, !properlyBoxesContext(ArrayPrototype.filter));

// ES5 15.4.4.16
// http://es5.github.com/#x15.4.4.16
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
defineProperties(ArrayPrototype, {
    every: function every(callbackfn /*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? this.split('') : object;
        var length = self.length >>> 0;
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.every callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self && !(typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                return false;
            }
        }
        return true;
    }
}, !properlyBoxesContext(ArrayPrototype.every));

// ES5 15.4.4.17
// http://es5.github.com/#x15.4.4.17
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
defineProperties(ArrayPrototype, {
    some: function some(callbackfn/*, thisArg */) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? this.split('') : object;
        var length = self.length >>> 0;
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.some callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self && (typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                return true;
            }
        }
        return false;
    }
}, !properlyBoxesContext(ArrayPrototype.some));

// ES5 15.4.4.21
// http://es5.github.com/#x15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
var reduceCoercesToObject = false;
if (ArrayPrototype.reduce) {
    reduceCoercesToObject = typeof ArrayPrototype.reduce.call('es5', function (_, __, ___, list) { return list; }) === 'object';
}
defineProperties(ArrayPrototype, {
    reduce: function reduce(callbackfn /*, initialValue*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? this.split('') : object;
        var length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.reduce callback must be a function');
        }

        // no value to return if no initial value and an empty array
        if (length === 0 && arguments.length === 1) {
            throw new TypeError('reduce of empty array with no initial value');
        }

        var i = 0;
        var result;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= length) {
                    throw new TypeError('reduce of empty array with no initial value');
                }
            } while (true);
        }

        for (; i < length; i++) {
            if (i in self) {
                result = callbackfn(result, self[i], i, object);
            }
        }

        return result;
    }
}, !reduceCoercesToObject);

// ES5 15.4.4.22
// http://es5.github.com/#x15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
var reduceRightCoercesToObject = false;
if (ArrayPrototype.reduceRight) {
    reduceRightCoercesToObject = typeof ArrayPrototype.reduceRight.call('es5', function (_, __, ___, list) { return list; }) === 'object';
}
defineProperties(ArrayPrototype, {
    reduceRight: function reduceRight(callbackfn/*, initial*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? this.split('') : object;
        var length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.reduceRight callback must be a function');
        }

        // no value to return if no initial value, empty array
        if (length === 0 && arguments.length === 1) {
            throw new TypeError('reduceRight of empty array with no initial value');
        }

        var result;
        var i = length - 1;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0) {
                    throw new TypeError('reduceRight of empty array with no initial value');
                }
            } while (true);
        }

        if (i < 0) {
            return result;
        }

        do {
            if (i in self) {
                result = callbackfn(result, self[i], i, object);
            }
        } while (i--);

        return result;
    }
}, !reduceRightCoercesToObject);

// ES5 15.4.4.14
// http://es5.github.com/#x15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
var hasFirefox2IndexOfBug = Array.prototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
defineProperties(ArrayPrototype, {
    indexOf: function indexOf(searchElement /*, fromIndex */) {
        var self = splitString && isString(this) ? this.split('') : ES.ToObject(this);
        var length = self.length >>> 0;

        if (length === 0) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = ES.ToInteger(arguments[1]);
        }

        // handle negative indices
        i = i >= 0 ? i : Math.max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === searchElement) {
                return i;
            }
        }
        return -1;
    }
}, hasFirefox2IndexOfBug);

// ES5 15.4.4.15
// http://es5.github.com/#x15.4.4.15
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
var hasFirefox2LastIndexOfBug = Array.prototype.lastIndexOf && [0, 1].lastIndexOf(0, -3) !== -1;
defineProperties(ArrayPrototype, {
    lastIndexOf: function lastIndexOf(searchElement /*, fromIndex */) {
        var self = splitString && isString(this) ? this.split('') : ES.ToObject(this);
        var length = self.length >>> 0;

        if (length === 0) {
            return -1;
        }
        var i = length - 1;
        if (arguments.length > 1) {
            i = Math.min(i, ES.ToInteger(arguments[1]));
        }
        // handle negative indices
        i = i >= 0 ? i : length - Math.abs(i);
        for (; i >= 0; i--) {
            if (i in self && searchElement === self[i]) {
                return i;
            }
        }
        return -1;
    }
}, hasFirefox2LastIndexOfBug);

//
// Object
// ======
//

// ES5 15.2.3.14
// http://es5.github.com/#x15.2.3.14

// http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
var hasDontEnumBug = !({ 'toString': null }).propertyIsEnumerable('toString'),
    hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype'),
    hasStringEnumBug = !owns('x', '0'),
    dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
    ],
    dontEnumsLength = dontEnums.length;

defineProperties(Object, {
    keys: function keys(object) {
        var isFn = isCallable(object),
            isArgs = isArguments(object),
            isObject = object !== null && typeof object === 'object',
            isStr = isObject && isString(object);

        if (!isObject && !isFn && !isArgs) {
            throw new TypeError('Object.keys called on a non-object');
        }

        var theKeys = [];
        var skipProto = hasProtoEnumBug && isFn;
        if ((isStr && hasStringEnumBug) || isArgs) {
            for (var i = 0; i < object.length; ++i) {
                theKeys.push(String(i));
            }
        }

        if (!isArgs) {
            for (var name in object) {
                if (!(skipProto && name === 'prototype') && owns(object, name)) {
                    theKeys.push(String(name));
                }
            }
        }

        if (hasDontEnumBug) {
            var ctor = object.constructor,
                skipConstructor = ctor && ctor.prototype === object;
            for (var j = 0; j < dontEnumsLength; j++) {
                var dontEnum = dontEnums[j];
                if (!(skipConstructor && dontEnum === 'constructor') && owns(object, dontEnum)) {
                    theKeys.push(dontEnum);
                }
            }
        }
        return theKeys;
    }
});

var keysWorksWithArguments = Object.keys && (function () {
    // Safari 5.0 bug
    return Object.keys(arguments).length === 2;
}(1, 2));
var originalKeys = Object.keys;
defineProperties(Object, {
    keys: function keys(object) {
        if (isArguments(object)) {
            return originalKeys(ArrayPrototype.slice.call(object));
        } else {
            return originalKeys(object);
        }
    }
}, !keysWorksWithArguments);

//
// Date
// ====
//

// ES5 15.9.5.43
// http://es5.github.com/#x15.9.5.43
// This function returns a String value represent the instance in time
// represented by this Date object. The format of the String is the Date Time
// string format defined in 15.9.1.15. All fields are present in the String.
// The time zone is always UTC, denoted by the suffix Z. If the time value of
// this object is not a finite Number a RangeError exception is thrown.
var negativeDate = -62198755200000;
var negativeYearString = '-000001';
var hasNegativeDateBug = Date.prototype.toISOString && new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1;

defineProperties(Date.prototype, {
    toISOString: function toISOString() {
        var result, length, value, year, month;
        if (!isFinite(this)) {
            throw new RangeError('Date.prototype.toISOString called on non-finite value.');
        }

        year = this.getUTCFullYear();

        month = this.getUTCMonth();
        // see https://github.com/es-shims/es5-shim/issues/111
        year += Math.floor(month / 12);
        month = (month % 12 + 12) % 12;

        // the date time string format is specified in 15.9.1.15.
        result = [month + 1, this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()];
        year = (
            (year < 0 ? '-' : (year > 9999 ? '+' : '')) +
            ('00000' + Math.abs(year)).slice((0 <= year && year <= 9999) ? -4 : -6)
        );

        length = result.length;
        while (length--) {
            value = result[length];
            // pad months, days, hours, minutes, and seconds to have two
            // digits.
            if (value < 10) {
                result[length] = '0' + value;
            }
        }
        // pad milliseconds to have three digits.
        return (
            year + '-' + result.slice(0, 2).join('-') +
            'T' + result.slice(2).join(':') + '.' +
            ('000' + this.getUTCMilliseconds()).slice(-3) + 'Z'
        );
    }
}, hasNegativeDateBug);

// ES5 15.9.5.44
// http://es5.github.com/#x15.9.5.44
// This function provides a String representation of a Date object for use by
// JSON.stringify (15.12.3).
var dateToJSONIsSupported = (function () {
    try {
        return Date.prototype.toJSON &&
            new Date(NaN).toJSON() === null &&
            new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&
            Date.prototype.toJSON.call({ // generic
                toISOString: function () { return true; }
            });
    } catch (e) {
        return false;
    }
}());
if (!dateToJSONIsSupported) {
    Date.prototype.toJSON = function toJSON(key) {
        // When the toJSON method is called with argument key, the following
        // steps are taken:

        // 1.  Let O be the result of calling ToObject, giving it the this
        // value as its argument.
        // 2. Let tv be ES.ToPrimitive(O, hint Number).
        var O = Object(this);
        var tv = ES.ToPrimitive(O);
        // 3. If tv is a Number and is not finite, return null.
        if (typeof tv === 'number' && !isFinite(tv)) {
            return null;
        }
        // 4. Let toISO be the result of calling the [[Get]] internal method of
        // O with argument "toISOString".
        var toISO = O.toISOString;
        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
        if (!isCallable(toISO)) {
            throw new TypeError('toISOString property is not callable');
        }
        // 6. Return the result of calling the [[Call]] internal method of
        //  toISO with O as the this value and an empty argument list.
        return toISO.call(O);

        // NOTE 1 The argument is ignored.

        // NOTE 2 The toJSON function is intentionally generic; it does not
        // require that its this value be a Date object. Therefore, it can be
        // transferred to other kinds of objects for use as a method. However,
        // it does require that any such object have a toISOString method. An
        // object is free to use the argument key to filter its
        // stringification.
    };
}

// ES5 15.9.4.2
// http://es5.github.com/#x15.9.4.2
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
var supportsExtendedYears = Date.parse('+033658-09-27T01:46:40.000Z') === 1e15;
var acceptsInvalidDates = !isNaN(Date.parse('2012-04-04T24:00:00.500Z')) || !isNaN(Date.parse('2012-11-31T23:59:59.000Z')) || !isNaN(Date.parse('2012-12-31T23:59:60.000Z'));
var doesNotParseY2KNewYear = isNaN(Date.parse('2000-01-01T00:00:00.000Z'));
if (!Date.parse || doesNotParseY2KNewYear || acceptsInvalidDates || !supportsExtendedYears) {
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    /* global Date: true */
    /* eslint-disable no-undef */
    Date = (function (NativeDate) {
    /* eslint-enable no-undef */
        // Date.length === 7
        var DateShim = function Date(Y, M, D, h, m, s, ms) {
            var length = arguments.length;
            var date;
            if (this instanceof NativeDate) {
                date = length === 1 && String(Y) === Y ? // isString(Y)
                    // We explicitly pass it through parse:
                    new NativeDate(DateShim.parse(Y)) :
                    // We have to manually make calls depending on argument
                    // length here
                    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
                    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
                    length >= 4 ? new NativeDate(Y, M, D, h) :
                    length >= 3 ? new NativeDate(Y, M, D) :
                    length >= 2 ? new NativeDate(Y, M) :
                    length >= 1 ? new NativeDate(Y) :
                                  new NativeDate();
            } else {
                date = NativeDate.apply(this, arguments);
            }
            // Prevent mixups with unfixed Date object
            defineProperties(date, { constructor: DateShim }, true);
            return date;
        };

        // 15.9.1.15 Date Time String Format.
        var isoDateExpression = new RegExp('^' +
            '(\\d{4}|[+-]\\d{6})' + // four-digit year capture or sign +
                                      // 6-digit extended year
            '(?:-(\\d{2})' + // optional month capture
            '(?:-(\\d{2})' + // optional day capture
            '(?:' + // capture hours:minutes:seconds.milliseconds
                'T(\\d{2})' + // hours capture
                ':(\\d{2})' + // minutes capture
                '(?:' + // optional :seconds.milliseconds
                    ':(\\d{2})' + // seconds capture
                    '(?:(\\.\\d{1,}))?' + // milliseconds capture
                ')?' +
            '(' + // capture UTC offset component
                'Z|' + // UTC capture
                '(?:' + // offset specifier +/-hours:minutes
                    '([-+])' + // sign capture
                    '(\\d{2})' + // hours offset capture
                    ':(\\d{2})' + // minutes offset capture
                ')' +
            ')?)?)?)?' +
        '$');

        var months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];

        var dayFromMonth = function dayFromMonth(year, month) {
            var t = month > 1 ? 1 : 0;
            return (
                months[month] +
                Math.floor((year - 1969 + t) / 4) -
                Math.floor((year - 1901 + t) / 100) +
                Math.floor((year - 1601 + t) / 400) +
                365 * (year - 1970)
            );
        };

        var toUTC = function toUTC(t) {
            return Number(new NativeDate(1970, 0, 1, 0, 0, 0, t));
        };

        // Copy any custom methods a 3rd party library may have added
        for (var key in NativeDate) {
            if (owns(NativeDate, key)) {
                DateShim[key] = NativeDate[key];
            }
        }

        // Copy "native" methods explicitly; they may be non-enumerable
        defineProperties(DateShim, {
            now: NativeDate.now,
            UTC: NativeDate.UTC
        }, true);
        DateShim.prototype = NativeDate.prototype;
        defineProperties(DateShim.prototype, {
            constructor: DateShim
        }, true);

        // Upgrade Date.parse to handle simplified ISO 8601 strings
        var parseShim = function parse(string) {
            var match = isoDateExpression.exec(string);
            if (match) {
                // parse months, days, hours, minutes, seconds, and milliseconds
                // provide default values if necessary
                // parse the UTC offset component
                var year = Number(match[1]),
                    month = Number(match[2] || 1) - 1,
                    day = Number(match[3] || 1) - 1,
                    hour = Number(match[4] || 0),
                    minute = Number(match[5] || 0),
                    second = Number(match[6] || 0),
                    millisecond = Math.floor(Number(match[7] || 0) * 1000),
                    // When time zone is missed, local offset should be used
                    // (ES 5.1 bug)
                    // see https://bugs.ecmascript.org/show_bug.cgi?id=112
                    isLocalTime = Boolean(match[4] && !match[8]),
                    signOffset = match[9] === '-' ? 1 : -1,
                    hourOffset = Number(match[10] || 0),
                    minuteOffset = Number(match[11] || 0),
                    result;
                if (
                    hour < (
                        minute > 0 || second > 0 || millisecond > 0 ?
                        24 : 25
                    ) &&
                    minute < 60 && second < 60 && millisecond < 1000 &&
                    month > -1 && month < 12 && hourOffset < 24 &&
                    minuteOffset < 60 && // detect invalid offsets
                    day > -1 &&
                    day < (
                        dayFromMonth(year, month + 1) -
                        dayFromMonth(year, month)
                    )
                ) {
                    result = (
                        (dayFromMonth(year, month) + day) * 24 +
                        hour +
                        hourOffset * signOffset
                    ) * 60;
                    result = (
                        (result + minute + minuteOffset * signOffset) * 60 +
                        second
                    ) * 1000 + millisecond;
                    if (isLocalTime) {
                        result = toUTC(result);
                    }
                    if (-8.64e15 <= result && result <= 8.64e15) {
                        return result;
                    }
                }
                return NaN;
            }
            return NativeDate.parse.apply(this, arguments);
        };
        defineProperties(DateShim, { parse: parseShim });

        return DateShim;
    }(Date));
    /* global Date: false */
}

// ES5 15.9.4.4
// http://es5.github.com/#x15.9.4.4
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

//
// Number
// ======
//

// ES5.1 15.7.4.5
// http://es5.github.com/#x15.7.4.5
var hasToFixedBugs = NumberPrototype.toFixed && (
  (0.00008).toFixed(3) !== '0.000' ||
  (0.9).toFixed(0) !== '1' ||
  (1.255).toFixed(2) !== '1.25' ||
  (1000000000000000128).toFixed(0) !== '1000000000000000128'
);

var toFixedHelpers = {
  base: 1e7,
  size: 6,
  data: [0, 0, 0, 0, 0, 0],
  multiply: function multiply(n, c) {
      var i = -1;
      var c2 = c;
      while (++i < toFixedHelpers.size) {
          c2 += n * toFixedHelpers.data[i];
          toFixedHelpers.data[i] = c2 % toFixedHelpers.base;
          c2 = Math.floor(c2 / toFixedHelpers.base);
      }
  },
  divide: function divide(n) {
      var i = toFixedHelpers.size, c = 0;
      while (--i >= 0) {
          c += toFixedHelpers.data[i];
          toFixedHelpers.data[i] = Math.floor(c / n);
          c = (c % n) * toFixedHelpers.base;
      }
  },
  numToString: function numToString() {
      var i = toFixedHelpers.size;
      var s = '';
      while (--i >= 0) {
          if (s !== '' || i === 0 || toFixedHelpers.data[i] !== 0) {
              var t = String(toFixedHelpers.data[i]);
              if (s === '') {
                  s = t;
              } else {
                  s += '0000000'.slice(0, 7 - t.length) + t;
              }
          }
      }
      return s;
  },
  pow: function pow(x, n, acc) {
      return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc)));
  },
  log: function log(x) {
      var n = 0;
      var x2 = x;
      while (x2 >= 4096) {
          n += 12;
          x2 /= 4096;
      }
      while (x2 >= 2) {
          n += 1;
          x2 /= 2;
      }
      return n;
  }
};

defineProperties(NumberPrototype, {
    toFixed: function toFixed(fractionDigits) {
        var f, x, s, m, e, z, j, k;

        // Test for NaN and round fractionDigits down
        f = Number(fractionDigits);
        f = f !== f ? 0 : Math.floor(f);

        if (f < 0 || f > 20) {
            throw new RangeError('Number.toFixed called with invalid number of decimals');
        }

        x = Number(this);

        // Test for NaN
        if (x !== x) {
            return 'NaN';
        }

        // If it is too big or small, return the string value of the number
        if (x <= -1e21 || x >= 1e21) {
            return String(x);
        }

        s = '';

        if (x < 0) {
            s = '-';
            x = -x;
        }

        m = '0';

        if (x > 1e-21) {
            // 1e-21 < x < 1e21
            // -70 < log2(x) < 70
            e = toFixedHelpers.log(x * toFixedHelpers.pow(2, 69, 1)) - 69;
            z = (e < 0 ? x * toFixedHelpers.pow(2, -e, 1) : x / toFixedHelpers.pow(2, e, 1));
            z *= 0x10000000000000; // Math.pow(2, 52);
            e = 52 - e;

            // -18 < e < 122
            // x = z / 2 ^ e
            if (e > 0) {
                toFixedHelpers.multiply(0, z);
                j = f;

                while (j >= 7) {
                    toFixedHelpers.multiply(1e7, 0);
                    j -= 7;
                }

                toFixedHelpers.multiply(toFixedHelpers.pow(10, j, 1), 0);
                j = e - 1;

                while (j >= 23) {
                    toFixedHelpers.divide(1 << 23);
                    j -= 23;
                }

                toFixedHelpers.divide(1 << j);
                toFixedHelpers.multiply(1, 1);
                toFixedHelpers.divide(2);
                m = toFixedHelpers.numToString();
            } else {
                toFixedHelpers.multiply(0, z);
                toFixedHelpers.multiply(1 << (-e), 0);
                m = toFixedHelpers.numToString() + '0.00000000000000000000'.slice(2, 2 + f);
            }
        }

        if (f > 0) {
            k = m.length;

            if (k <= f) {
                m = s + '0.0000000000000000000'.slice(0, f - k + 2) + m;
            } else {
                m = s + m.slice(0, k - f) + '.' + m.slice(k - f);
            }
        } else {
            m = s + m;
        }

        return m;
    }
}, hasToFixedBugs);

//
// String
// ======
//

// ES5 15.5.4.14
// http://es5.github.com/#x15.5.4.14

// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
// Many browsers do not split properly with regular expressions or they
// do not perform the split correctly under obscure conditions.
// See http://blog.stevenlevithan.com/archives/cross-browser-split
// I've tested in many browsers and this seems to cover the deviant ones:
//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
//       [undefined, "t", undefined, "e", ...]
//    ''.split(/.?/) should be [], not [""]
//    '.'.split(/()()/) should be ["."], not ["", "", "."]

var string_split = StringPrototype.split;
if (
    'ab'.split(/(?:ab)*/).length !== 2 ||
    '.'.split(/(.?)(.?)/).length !== 4 ||
    'tesst'.split(/(s)*/)[1] === 't' ||
    'test'.split(/(?:)/, -1).length !== 4 ||
    ''.split(/.?/).length ||
    '.'.split(/()()/).length > 1
) {
    (function () {
        var compliantExecNpcg = typeof (/()??/).exec('')[1] === 'undefined'; // NPCG: nonparticipating capturing group

        StringPrototype.split = function (separator, limit) {
            var string = this;
            if (typeof separator === 'undefined' && limit === 0) {
                return [];
            }

            // If `separator` is not a regex, use native split
            if (!isRegex(separator)) {
                return string_split.call(this, separator, limit);
            }

            var output = [];
            var flags = (separator.ignoreCase ? 'i' : '') +
                        (separator.multiline ? 'm' : '') +
                        (separator.extended ? 'x' : '') + // Proposed for ES6
                        (separator.sticky ? 'y' : ''), // Firefox 3+
                lastLastIndex = 0,
                // Make `global` and avoid `lastIndex` issues by working with a copy
                separator2, match, lastIndex, lastLength;
            var separatorCopy = new RegExp(separator.source, flags + 'g');
            string += ''; // Type-convert
            if (!compliantExecNpcg) {
                // Doesn't need flags gy, but they don't hurt
                separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
            }
            /* Values for `limit`, per the spec:
             * If undefined: 4294967295 // Math.pow(2, 32) - 1
             * If 0, Infinity, or NaN: 0
             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
             * If other: Type-convert, then use the above rules
             */
            var splitLimit = typeof limit === 'undefined' ?
                -1 >>> 0 : // Math.pow(2, 32) - 1
                ES.ToUint32(limit);
            match = separatorCopy.exec(string);
            while (match) {
                // `separatorCopy.lastIndex` is not reliable cross-browser
                lastIndex = match.index + match[0].length;
                if (lastIndex > lastLastIndex) {
                    output.push(string.slice(lastLastIndex, match.index));
                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
                    // nonparticipating capturing groups
                    if (!compliantExecNpcg && match.length > 1) {
                        /* eslint-disable no-loop-func */
                        match[0].replace(separator2, function () {
                            for (var i = 1; i < arguments.length - 2; i++) {
                                if (typeof arguments[i] === 'undefined') {
                                    match[i] = void 0;
                                }
                            }
                        });
                        /* eslint-enable no-loop-func */
                    }
                    if (match.length > 1 && match.index < string.length) {
                        array_push.apply(output, match.slice(1));
                    }
                    lastLength = match[0].length;
                    lastLastIndex = lastIndex;
                    if (output.length >= splitLimit) {
                        break;
                    }
                }
                if (separatorCopy.lastIndex === match.index) {
                    separatorCopy.lastIndex++; // Avoid an infinite loop
                }
                match = separatorCopy.exec(string);
            }
            if (lastLastIndex === string.length) {
                if (lastLength || !separatorCopy.test('')) {
                    output.push('');
                }
            } else {
                output.push(string.slice(lastLastIndex));
            }
            return output.length > splitLimit ? output.slice(0, splitLimit) : output;
        };
    }());

// [bugfix, chrome]
// If separator is undefined, then the result array contains just one String,
// which is the this value (converted to a String). If limit is not undefined,
// then the output array is truncated so that it contains no more than limit
// elements.
// "0".split(undefined, 0) -> []
} else if ('0'.split(void 0, 0).length) {
    StringPrototype.split = function split(separator, limit) {
        if (typeof separator === 'undefined' && limit === 0) { return []; }
        return string_split.call(this, separator, limit);
    };
}

var str_replace = StringPrototype.replace;
var replaceReportsGroupsCorrectly = (function () {
    var groups = [];
    'x'.replace(/x(.)?/g, function (match, group) {
        groups.push(group);
    });
    return groups.length === 1 && typeof groups[0] === 'undefined';
}());

if (!replaceReportsGroupsCorrectly) {
    StringPrototype.replace = function replace(searchValue, replaceValue) {
        var isFn = isCallable(replaceValue);
        var hasCapturingGroups = isRegex(searchValue) && (/\)[*?]/).test(searchValue.source);
        if (!isFn || !hasCapturingGroups) {
            return str_replace.call(this, searchValue, replaceValue);
        } else {
            var wrappedReplaceValue = function (match) {
                var length = arguments.length;
                var originalLastIndex = searchValue.lastIndex;
                searchValue.lastIndex = 0;
                var args = searchValue.exec(match) || [];
                searchValue.lastIndex = originalLastIndex;
                args.push(arguments[length - 2], arguments[length - 1]);
                return replaceValue.apply(this, args);
            };
            return str_replace.call(this, searchValue, wrappedReplaceValue);
        }
    };
}

// ECMA-262, 3rd B.2.3
// Not an ECMAScript standard, although ECMAScript 3rd Edition has a
// non-normative section suggesting uniform semantics and it should be
// normalized across all browsers
// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
var string_substr = StringPrototype.substr;
var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
defineProperties(StringPrototype, {
    substr: function substr(start, length) {
        var normalizedStart = start;
        if (start < 0) {
            normalizedStart = Math.max(this.length + start, 0);
        }
        return string_substr.call(this, normalizedStart, length);
    }
}, hasNegativeSubstrBug);

// ES5 15.5.4.20
// whitespace from: http://es5.github.io/#x15.5.4.20
var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
    '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
    '\u2029\uFEFF';
var zeroWidth = '\u200b';
var wsRegexChars = '[' + ws + ']';
var trimBeginRegexp = new RegExp('^' + wsRegexChars + wsRegexChars + '*');
var trimEndRegexp = new RegExp(wsRegexChars + wsRegexChars + '*$');
var hasTrimWhitespaceBug = StringPrototype.trim && (ws.trim() || !zeroWidth.trim());
defineProperties(StringPrototype, {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    // http://perfectionkills.com/whitespace-deviations/
    trim: function trim() {
        if (typeof this === 'undefined' || this === null) {
            throw new TypeError("can't convert " + this + ' to object');
        }
        return String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
    }
}, hasTrimWhitespaceBug);

// ES-5 15.1.2.2
if (parseInt(ws + '08') !== 8 || parseInt(ws + '0x16') !== 22) {
    /* global parseInt: true */
    parseInt = (function (origParseInt) {
        var hexRegex = /^0[xX]/;
        return function parseInt(str, radix) {
            var string = String(str).trim();
            var defaultedRadix = Number(radix) || (hexRegex.test(string) ? 16 : 10);
            return origParseInt(string, defaultedRadix);
        };
    }(parseInt));
}

}));

(function checkMoreTypes() {
  'use strict';

  /**
    Custom assertions and predicates around https://github.com/philbooth/check-types.js
    Created by Kensho https://github.com/kensho
    Copyright @ 2014 Kensho https://www.kensho.com/
    License: MIT

    @module check
  */

  if (typeof Function.prototype.bind !== 'function') {
    throw new Error('Missing Function.prototype.bind, please load es5-shim first');
  }

  // most of the old methods from check-types.js
  function isFn(x) { return typeof x === 'function'; }
  function isString(x) { return typeof x === 'string'; }
  function unemptyString(x) {
    return isString(x) && x;
  }
  function isObject(x) {
    return typeof x === 'object' &&
      !Array.isArray(x) &&
      !isNull(x) &&
      !isDate(x);
  }
  function isEmptyObject(x) {
    return isObject(x) &&
      Object.keys(x).length === 0;
  }
  function isNumber(x) {
    return typeof x === 'number' && !isNaN(x);
  }
  function isNull(x) { return x === null; }
  function positiveNumber(x) {
    return isNumber(x) && x > 0;
  }
  function negativeNumber(x) {
    return isNumber(x) && x < 0;
  }
  function isDate(x) {
    return x instanceof Date;
  }
  function instance(x, type) {
    return x instanceof type;
  }

  function every(predicateResults) {
    var property, value;
    for (property in predicateResults) {
      if (predicateResults.hasOwnProperty(property)) {
        value = predicateResults[property];

        if (isObject(value) && every(value) === false) {
          return false;
        }

        if (value === false) {
          return false;
        }
      }
    }
    return true;
  }

  function map(things, predicates) {
      var property, result = {}, predicate;
      for (property in predicates) {
          if (predicates.hasOwnProperty(property)) {
              predicate = predicates[property];

              if (isFn(predicate)) {
                  result[property] = predicate(things[property]);
              } else if (isObject(predicate)) {
                  result[property] = map(things[property], predicate);
              }
          }
      }

      return result;
  }

  var check = {
    maybe: {},
    verify: {},
    not: {},
    every: every,
    map: map
  };

  /**
    Checks if argument is defined or not

    This method now is part of the check-types.js
    @method defined
  */
  function defined(value) {
    return typeof value !== 'undefined';
  }

  /**
    Checks if argument is a valid Date instance

    @method validDate
  */
  function validDate(value) {
    return check.date(value) &&
      check.number(Number(value));
  }

  /**
    Returns true if the argument is primitive JavaScript type

    @method primitive
  */
  function primitive(value) {
    var type = typeof value;
    return type === 'number' ||
      type === 'boolean' ||
      type === 'string';
  }

  /**
    Returns true if the value is a number 0

    @method zero
  */
  function zero(x) {
    return typeof x === 'number' && x === 0;
  }

  /**
    same as ===

    @method same
  */
  function same(a, b) {
    return a === b;
  }

  /**
    Returns true if the index is valid for give string / array

    @method index
  */
  function index(list, k) {
    return defined(list) &&
      has(list, 'length') &&
      k >= 0 &&
      k < list.length;
  }

  /**
    Returns true if both objects are the same type and have same length property

    @method sameLength
  */
  function sameLength(a, b) {
    return typeof a === typeof b &&
      a && b &&
      a.length === b.length;
  }

  /**
    Returns true if all items in an array are the same reference

    @method allSame
  */
  function allSame(arr) {
    if (!check.array(arr)) {
      return false;
    }
    if (!arr.length) {
      return true;
    }
    var first = arr[0];
    return arr.every(function (item) {
      return item === first;
    });
  }

  /**
    Returns true if given item is in the array

    @method oneOf
  */
  function oneOf(arr, x) {
    check.verify.array(arr, 'expected an array');
    return arr.indexOf(x) !== -1;
  }

  /**
    Returns true for urls of the format `git@....git`

    @method git
  */
  function git(url) {
    return check.unemptyString(url) &&
      /^git@/.test(url);
  }

  /**
    Checks if given value is 0 or 1

    @method bit
  */
  function bit(value) {
    return value === 0 || value === 1;
  }

  /**
    Checks if given value is true of false

    @method bool
  */
  function bool(value) {
    return typeof value === 'boolean';
  }

  /**
    Checks if given object has a property
    @method has
  */
  function has(o, property) {
    if (arguments.length !== 2) {
      throw new Error('Expected two arguments to check.has, got only ' + arguments.length);
    }
    return Boolean(o && property &&
      typeof property === 'string' &&
      typeof o[property] !== 'undefined');
  }

  /**
  Checks if given string is already in lower case
  @method lowerCase
  */
  function lowerCase(str) {
    return check.string(str) &&
      str.toLowerCase() === str;
  }

  /**
  Returns true if the argument is an array with at least one value
  @method unemptyArray
  */
  function unemptyArray(a) {
    return check.array(a) && a.length > 0;
  }

  /**
  Returns true if each item in the array passes the predicate
  @method arrayOf
  @param rule Predicate function
  @param a Array to check
  */
  function arrayOf(rule, a) {
    return check.array(a) && a.every(rule);
  }

  /**
  Returns items from array that do not passes the predicate
  @method badItems
  @param rule Predicate function
  @param a Array with items
  */
  function badItems(rule, a) {
    check.verify.array(a, 'expected array to find bad items');
    return a.filter(notModifier(rule));
  }

  /**
  Returns true if given array only has strings
  @method arrayOfStrings
  @param a Array to check
  @param checkLowerCase Checks if all strings are lowercase
  */
  function arrayOfStrings(a, checkLowerCase) {
    var v = check.array(a) && a.every(check.string);
    if (v && check.bool(checkLowerCase) && checkLowerCase) {
      return a.every(check.lowerCase);
    }
    return v;
  }

  /**
  Returns true if given argument is array of arrays of strings
  @method arrayOfArraysOfStrings
  @param a Array to check
  @param checkLowerCase Checks if all strings are lowercase
  */
  function arrayOfArraysOfStrings(a, checkLowerCase) {
    return check.array(a) && a.every(function (arr) {
      return check.arrayOfStrings(arr, checkLowerCase);
    });
  }

  /**
    Checks if object passes all rules in predicates.

    check.all({ foo: 'foo' }, { foo: check.string }, 'wrong object');

    This is a composition of check.every(check.map ...) calls
    https://github.com/philbooth/check-types.js#batch-operations

    @method all
    @param {object} object object to check
    @param {object} predicates rules to check. Usually one per property.
    @public
    @returns true or false
  */
  function all(obj, predicates) {
    check.verify.fn(check.every, 'missing check.every method');
    check.verify.fn(check.map, 'missing check.map method');

    check.verify.object(obj, 'missing object to check');
    check.verify.object(predicates, 'missing predicates object');
    Object.keys(predicates).forEach(function (property) {
      if (!check.fn(predicates[property])) {
        throw new Error('not a predicate function for ' + property + ' but ' + predicates[property]);
      }
    });
    return check.every(check.map(obj, predicates));
  }

  /**
    Checks given object against predicates object
    @method schema
  */
  function schema(predicates, obj) {
    return all(obj, predicates);
  }

  /** Checks if given function raises an error

    @method raises
  */
  function raises(fn, errorValidator) {
    check.verify.fn(fn, 'expected function that raises');
    try {
      fn();
    } catch (err) {
      if (typeof errorValidator === 'undefined') {
        return true;
      }
      if (typeof errorValidator === 'function') {
        return errorValidator(err);
      }
      return false;
    }
    // error has not been raised
    return false;
  }

  /**
    Returns true if given value is ''
    @method emptyString
  */
  function emptyString(a) {
    return a === '';
  }

  /**
    Returns true if given value is [], {} or ''
    @method empty
  */
  function empty(a) {
    var hasLength = typeof a === 'string' ||
      Array.isArray(a);
    if (hasLength) {
      return !a.length;
    }
    if (a instanceof Object) {
      return !Object.keys(a).length;
    }
    return false;
  }

  /**
    Returns true if given value has .length and it is not zero, or has properties
    @method unempty
  */
  function unempty(a) {
    var hasLength = typeof a === 'string' ||
      Array.isArray(a);
    if (hasLength) {
      return a.length;
    }
    if (a instanceof Object) {
      return Object.keys(a).length;
    }
    return true;
  }

  /**
    Returns true if 0 <= value <= 1
    @method unit
  */
  function unit(value) {
    return check.number(value) &&
      value >= 0.0 && value <= 1.0;
  }

  var rgb = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
  /**
    Returns true if value is hex RGB between '#000000' and '#FFFFFF'
    @method hexRgb
  */
  function hexRgb(value) {
    return check.string(value) &&
      rgb.test(value);
  }

  // typical git SHA commit id is 40 digit hex string, like
  // 3b819803cdf2225ca1338beb17e0c506fdeedefc
  var shaReg = /^[0-9a-f]{40}$/;

  /**
    Returns true if the given string is 40 digit SHA commit id
    @method commitId
  */
  function commitId(id) {
    return check.string(id) &&
      id.length === 40 &&
      shaReg.test(id);
  }

  // when using git log --oneline short ids are displayed, first 7 characters
  var shortShaReg = /^[0-9a-f]{7}$/;

  /**
    Returns true if the given string is short 7 character SHA id part
    @method shortCommitId
  */
  function shortCommitId(id) {
    return check.string(id) &&
      id.length === 7 &&
      shortShaReg.test(id);
  }

  //
  // helper methods
  //

  if (!check.defend) {
    var checkPredicates = function checksPredicates(fn, predicates, args) {
      check.verify.fn(fn, 'expected a function');
      check.verify.array(predicates, 'expected list of predicates');
      check.verify.defined(args, 'missing args');

      var k = 0, // iterates over predicates
        j = 0, // iterates over arguments
        n = predicates.length;

      for (k = 0; k < n; k += 1) {
        var predicate = predicates[k];
        if (!check.fn(predicate)) {
          continue;
        }

        if (!predicate.call(null, args[j])) {
          var msg = 'Argument ' + (j + 1) + ': ' + args[j] + ' does not pass predicate';
          if (check.unemptyString(predicates[k + 1])) {
            msg += ': ' + predicates[k + 1];
          }
          throw new Error(msg);
        }

        j += 1;
      }
      return fn.apply(null, args);
    };

    check.defend = function defend(fn) {
      var predicates = Array.prototype.slice.call(arguments, 1);
      return function () {
        return checkPredicates(fn, predicates, arguments);
      };
    };
  }

  /**
    Combines multiple predicate functions to produce new OR predicate
    @method or
  */
  function or() {
    var predicates = Array.prototype.slice.call(arguments, 0);
    if (!predicates.length) {
      throw new Error('empty list of arguments to or');
    }

    return function orCheck() {
      var values = Array.prototype.slice.call(arguments, 0);
      return predicates.some(function (predicate) {
        try {
          return check.fn(predicate) ?
            predicate.apply(null, values) : Boolean(predicate);
        } catch (err) {
          // treat exceptions as false
          return false;
        }
      });
    };
  }

  /**
    Combines multiple predicate functions to produce new AND predicate
    @method or
  */
  function and() {
    var predicates = Array.prototype.slice.call(arguments, 0);
    if (!predicates.length) {
      throw new Error('empty list of arguments to or');
    }

    return function orCheck() {
      var values = Array.prototype.slice.call(arguments, 0);
      return predicates.every(function (predicate) {
        return check.fn(predicate) ?
          predicate.apply(null, values) : Boolean(predicate);
      });
    };
  }

  /**
  * Public modifier `not`.
  *
  * Negates `predicate`.
  * copied from check-types.js
  */
  function notModifier(predicate) {
    return function () {
      return !predicate.apply(null, arguments);
    };
  }

  if (!check.mixin) {
    /** Adds new predicate to all objects
    @method mixin */
    check.mixin = function mixin(fn, name) {
      if (isString(fn) && isFn(name)) {
        var tmp = fn;
        fn = name;
        name = tmp;
      }

      if (!isFn(fn)) {
        throw new Error('expected predicate function');
      }
      if (!unemptyString(name)) {
        name = fn.name;
      }
      if (!unemptyString(name)) {
        throw new Error('predicate function missing name\n' + fn.toString());
      }

      function registerPredicate(obj, name, fn) {
        if (!isObject(obj)) {
          throw new Error('missing object ' + obj);
        }
        if (!unemptyString(name)) {
          throw new Error('missing name');
        }
        if (!isFn(fn)) {
          throw new Error('missing function');
        }

        if (!obj[name]) {
          obj[name] = fn;
        }
      }

      /**
       * Public modifier `maybe`.
       *
       * Returns `true` if `predicate` is  `null` or `undefined`,
       * otherwise propagates the return value from `predicate`.
       * copied from check-types.js
       */
      function maybeModifier(predicate) {
        return function () {
          if (!check.defined(arguments[0]) || check.nulled(arguments[0])) {
            return true;
          }
          return predicate.apply(null, arguments);
        };
      }

      /**
       * Public modifier `verify`.
       *
       * Throws if `predicate` returns `false`.
       * copied from check-types.js
       */
      function verifyModifier(predicate, defaultMessage) {
        return function () {
          var message;
          if (predicate.apply(null, arguments) === false) {
            message = arguments[arguments.length - 1];
            throw new Error(check.unemptyString(message) ? message : defaultMessage);
          }
        };
      }

      registerPredicate(check, name, fn);
      registerPredicate(check.maybe, name, maybeModifier(fn));
      registerPredicate(check.not, name, notModifier(fn));
      registerPredicate(check.verify, name, verifyModifier(fn, name + ' failed'));
    };
  }

  if (!check.then) {
    /**
      Executes given function only if condition is truthy.
      @method then
    */
    check.then = function then(condition, fn) {
      return function () {
        var ok = typeof condition === 'function' ?
          condition.apply(null, arguments) : condition;
        if (ok) {
          return fn.apply(null, arguments);
        }
      };
    };
  }

  var promiseSchema = {
    then: isFn
  };

  // work around reserved keywords checks
  promiseSchema['catch'] = isFn;
  promiseSchema['finally'] = isFn;

  var hasPromiseApi = schema.bind(null, promiseSchema);

  /**
    Returns true if argument implements promise api (.then, .catch, .finally)
    @method promise
  */
  function isPromise(p) {
    return check.object(p) && hasPromiseApi(p);
  }

  /**
    Shallow strict comparison
    @method equal
  */
  function equal(a, b) {
    if (arguments.length === 2) {
      return a === b;
    } else if (arguments.length === 1) {
      return function equalTo(b) {
        return a === b;
      };
    } else {
      throw new Error('Expected at least 1 or 2 arguments to check.equal');
    }
  }

  // new predicates to be added to check object. Use object to preserve names
  var predicates = {
    nulled: isNull,
    fn: isFn,
    string: isString,
    unemptyString: unemptyString,
    object: isObject,
    number: isNumber,
    array: Array.isArray,
    positiveNumber: positiveNumber,
    negativeNumber: negativeNumber,
    defined: defined,
    same: same,
    allSame: allSame,
    bit: bit,
    bool: bool,
    has: has,
    lowerCase: lowerCase,
    unemptyArray: unemptyArray,
    arrayOfStrings: arrayOfStrings,
    arrayOfArraysOfStrings: arrayOfArraysOfStrings,
    all: all,
    schema: schema,
    raises: raises,
    empty: empty,
    emptyString: emptyString,
    unempty: unempty,
    unit: unit,
    hexRgb: hexRgb,
    sameLength: sameLength,
    commitId: commitId,
    shortCommitId: shortCommitId,
    index: index,
    git: git,
    arrayOf: arrayOf,
    badItems: badItems,
    oneOf: oneOf,
    promise: isPromise,
    validDate: validDate,
    equal: equal,
    or: or,
    and: and,
    primitive: primitive,
    zero: zero,
    date: isDate,
    instance: instance,
    emptyObject: isEmptyObject
  };

  Object.keys(predicates).forEach(function (name) {
    check.mixin(predicates[name], name);
  });

  if (typeof module === 'object') {
    module.exports = check;
  }

  // if we are loaded under Node, but "window" object is available, put a reference
  // there too - maybe we are running inside a synthetic browser environment
  if (typeof window === 'object') {
    window.check = check;
  }
  if (typeof global === 'object') {
    global.check = check;
  }

}());

(function initLazyAss() {

  function isArrayLike(a) {
    return a && typeof a.length === 'number';
  }

  function toStringArray(arr) {
    return 'array with ' + arr.length + ' items.\n[' +
      arr.map(toString).join(',') + ']\n';
  }

  function isPrimitive(arg) {
    return typeof arg === 'string' ||
      typeof arg === 'number' ||
      typeof arg === 'boolean';
  }

  function toString(arg, k) {
    if (isPrimitive(arg)) {
      return JSON.stringify(arg);
    }
    if (arg instanceof Error) {
      return arg.name + ' ' + arg.message;
    }

    if (Array.isArray(arg)) {
      return toStringArray(arg);
    }
    if (isArrayLike(arg)) {
      return toStringArray(Array.prototype.slice.call(arg, 0));
    }
    var argString;
    try {
      argString = JSON.stringify(arg, null, 2);
    } catch (err) {
      argString = '{ cannot stringify arg ' + k + ', it has type "' + typeof arg + '"';
      if (typeof arg === 'object') {
        argString += ' with keys ' + Object.keys(arg).join(', ') + ' }';
      } else {
        argString += ' }';
      }
    }
    return argString;
  }

  function formMessage(args) {
    var msg = args.reduce(function (total, arg, k) {
      if (k) {
        total += ' ';
      }
      if (typeof arg === 'string') {
        return total + arg;
      }
      if (typeof arg === 'function') {
        var fnResult;
        try {
          fnResult = arg();
        } catch (err) {
          // ignore the error
          fnResult = '[function ' + arg.name + ' threw error!]';
        }
        return total + fnResult;
      }
      var argString = toString(arg, k);
      return total + argString;
    }, '');
    return msg;
  }

  function lazyAssLogic(condition) {
    var fn = typeof condition === 'function' ? condition : null;

    if (fn) {
      condition = fn();
    }
    if (!condition) {
      var args = [].slice.call(arguments, 1);
      if (fn) {
        args.unshift(fn.toString());
      }
      return new Error(formMessage(args));
    }
  }

  var lazyAss = function lazyAss() {
    var err = lazyAssLogic.apply(null, arguments);
    if (err) {
      throw err;
    }
  };

  var lazyAssync = function lazyAssync() {
    var err = lazyAssLogic.apply(null, arguments);
    if (err) {
      setTimeout(function () {
        throw err;
      }, 0);
    }
  };

  function register(value, name) {
    var registered;
    if (typeof window === 'object') {
      /* global window */
      window[name] = value;
      registered = true;
    }
    if (typeof global === 'object') {
      global[name] = value;
      registered = true;
    }

    if (!registered) {
      throw new Error('Do not know how to register ' + name);
    }
  }

  register(lazyAss, 'lazyAss');
  register(lazyAss, 'la');
  register(lazyAssync, 'lazyAssync');
  register(lazyAssync, 'lac');

}());

}());
// suffix after code to continue
// code coverage collection

(function setupNgDescribe(root) {
  if (typeof la === 'undefined') {
    // lazy assertions from bahmutov/lazy-ass
    require('lazy-ass');
  }
  if (typeof check === 'undefined') {
    // check predicates from kensho/check-more-types
    /* global require */
    check = require('check-more-types');
  }
  la(check.object(root), 'missing root');

  var _defaults = {
    // primary options
    name: 'default tests',
    modules: [],
    configs: {},
    inject: [],
    exposeApi: false,
    tests: function () {},
    mocks: {},
    helpful: false,
    controllers: [],
    element: '',
    http: {},
    // secondary options
    only: false,
    verbose: false,
    skip: false,
    parentScope: {}
  };

  function defaults(opts) {
    opts = opts || {};
    return angular.extend(angular.copy(_defaults), opts);
  }

  la(check.fn(check.or), 'cannot find check.or method', check);

  var ngDescribeSchema = {
    // primary options
    name: check.unemptyString,
    modules: check.arrayOfStrings,
    configs: check.object,
    inject: check.arrayOfStrings,
    exposeApi: check.bool,
    tests: check.fn,
    mocks: check.object,
    helpful: check.bool,
    controllers: check.arrayOfStrings,
    element: check.string,
    // TODO allow object OR function
    // http: check.object,
    // secondary options
    only: check.bool,
    verbose: check.bool,
    skip: check.or(check.bool, check.unemptyString),
    parentScope: check.object
  };

  function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
      return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
  }

  function clone(a) {
    return JSON.parse(JSON.stringify(a));
  }

  function methodNames(reference) {
    la(check.object(reference), 'expected object reference, not', reference);

    return Object.keys(reference).filter(function (key) {
      return check.fn(reference[key]);
    });
  }

  function copyAliases(options) {
    if (options.config && !options.configs) {
      options.configs = options.config;
    }
    if (options.mock && !options.mocks) {
      options.mocks = options.mock;
    }
    if (options.module && !options.modules) {
      options.modules = options.module;
    }
    if (options.test && !options.tests) {
      options.tests = options.test;
    }
    if (options.controller && !options.controllers) {
      options.controllers = options.controller;
    }
    return options;
  }

  function ensureArrays(options) {
    if (check.string(options.modules)) {
      options.modules = [options.modules];
    }
    if (check.string(options.inject)) {
      options.inject = [options.inject];
    }
    if (check.string(options.controllers)) {
      options.controllers = [options.controllers];
    }
    return options;
  }

  function collectInjects(options) {
    la(check.object(options) && check.array(options.controllers),
      'missing controllers', options);

    if (options.controllers.length || options.exposeApi) {
      options.inject.push('$controller');
      options.inject.push('$rootScope');
    }

    if (check.unemptyString(options.element) || options.exposeApi) {
      options.inject.push('$rootScope');
      options.inject.push('$compile');
    }

    if (check.not.empty(options.http) || check.fn(options.http)) {
      options.inject.push('$httpBackend');
    }

    // auto inject mocked modules
    options.modules = options.modules.concat(Object.keys(options.mocks));
    // auto inject configured modules
    options.modules = options.modules.concat(Object.keys(options.configs));

    return options;
  }

  function ensureUnique(options) {
    options.inject = uniq(options.inject);
    options.modules = uniq(options.modules);
    options.controllers = uniq(options.controllers);
    return options;
  }

  // returns original BDD callbacks provided by the testing framework
  // except for the main 'describe' function
  // describe can be replaced with skip / only version
  function bddCallbacks(options) {
    function decideSuiteFunction(options) {
      var suiteFn = root.describe;
      if (options.only) {
        // run only this describe block using Jasmine or Mocha
        // http://bahmutov.calepin.co/focus-on-specific-jasmine-suite-in-karma.html
        // Jasmine 2.x vs 1.x syntax - fdescribe vs ddescribe
        suiteFn = root.fdescribe || root.ddescribe || root.describe.only;
      }
      if (options.helpful) {
        suiteFn = root.helpDescribe;
      }
      if (options.skip) {
        la(!options.only, 'skip and only are exclusive options', options);
        suiteFn = root.xdescribe || root.describe.skip;
      }
      return suiteFn;
    }

    return {
      describe: decideSuiteFunction(options),
      beforeEach: root.beforeEach,
      afterEach: root.afterEach,
      it: root.it
    };
  }

  function decideLogFunction(options) {
    return options.verbose ? angular.bind(console, console.log) : angular.noop;
  }

  function ngDescribe(options) {
    la(check.object(options), 'expected options object, see docs', options);
    la(check.defined(angular), 'missing angular');

    options = copyAliases(options);
    options = defaults(options);
    options = ensureArrays(options);
    options = collectInjects(options);
    options = ensureUnique(options);

    var log = decideLogFunction(options);
    la(check.fn(log), 'could not decide on log function', options);

    var isValidNgDescribe = angular.bind(null, check.schema, ngDescribeSchema);
    la(isValidNgDescribe(options), 'invalid input options', options);

    var bdd = bddCallbacks(options);
    la(check.fn(bdd.describe), 'missing describe function in', bdd, 'options', options);

    // list of services to inject into mock functions
    var mockInjects = [];

    var aliasedDependencies = {
      '$httpBackend': 'http'
    };

    function ngSpecs() {

      var dependencies = {};
      // individual functions that should run after each unit test
      // to clean up everything setup.
      var cleanupCallbacks = [];

      function partiallInjectMethod(owner, mockName, fn, $injector) {
        la(check.unemptyString(mockName), 'expected mock name', mockName);
        la(check.fn(fn), 'expected function for', mockName, 'got', fn);

        var diNames = $injector.annotate(fn);
        log('dinames for', mockName, diNames);
        mockInjects.push.apply(mockInjects, diNames);

        var wrappedFunction = function injectedDependenciesIntoMockFunction() {
          var runtimeArguments = arguments;
          var k = 0;
          var args = diNames.map(function (name) {
            if (check.has(dependencies, name)) {
              // name is injected by dependency injection
              return dependencies[name];
            }
            // argument is runtime
            return runtimeArguments[k++];
          });
          return fn.apply(owner, args);
        };
        return wrappedFunction;
      }

      function partiallyInjectObject(reference, mockName, $injector) {
        la(check.object(reference), 'expected object reference, not', reference);

        methodNames(reference).forEach(function (key) {
          reference[key] = partiallInjectMethod(reference,
            mockName + '.' + key, reference[key], $injector);
        });

        return reference;
      }

      bdd.beforeEach(function checkEnvironment() {
        la(check.object(angular), 'angular is undefined');
        la(check.has(angular, 'mock'), 'angular.mock is undefined');
      });

      bdd.beforeEach(function mockModules() {
        log('ngDescribe', options.name);
        log('loading modules', options.modules);

        options.modules.forEach(function loadAngularModules(moduleName) {
          if (options.configs[moduleName]) {
            var m = angular.module(moduleName);
            m.config([moduleName + 'Provider', function (provider) {
              var cloned = clone(options.configs[moduleName]);
              log('setting config', moduleName + 'Provider to', cloned);
              provider.set(cloned);
            }]);
          } else {
            angular.mock.module(moduleName, function ($provide, $injector) {
              var mocks = options.mocks[moduleName];
              if (mocks) {
                log('mocking', Object.keys(mocks));
                Object.keys(mocks).forEach(function (mockName) {
                  var value = mocks[mockName];

                  if (check.fn(value) && !value.injected) {
                    value = partiallInjectMethod(mocks, mockName, value, $injector);
                    value.injected = true; // prevent multiple wrapping
                  } else if (check.object(value) && !value.injected) {
                    value = partiallyInjectObject(value, mockName, $injector);
                    value.injected = true; // prevent multiple wrapping
                  }
                  // should we inject a value or a constant?
                  $provide.constant(mockName, value);
                });
              }
            });
          }
        });
      });

      function injectDependencies($injector) {
        if(options.inject.indexOf('$rootScope') === -1) {
          options.inject.push('$rootScope');
        }

        log('injecting', options.inject);

        options.inject.forEach(function (dependencyName) {
          var injectedUnderName = aliasedDependencies[dependencyName] || dependencyName;
          la(check.unemptyString(injectedUnderName),
            'could not rename dependency', dependencyName);
          dependencies[injectedUnderName] =
            dependencies[dependencyName] = $injector.get(dependencyName);
        });

        mockInjects = uniq(mockInjects);
        log('injecting existing dependencies for mocks', mockInjects);
        mockInjects.forEach(function (dependencyName) {
          if ($injector.has(dependencyName)) {
            dependencies[dependencyName] = $injector.get(dependencyName);
          }
        });
      }

      function setupControllers(controllerNames) {
        if (check.unemptyString(controllerNames)) {
          controllerNames = [controllerNames];
        }
        log('setting up controllers', controllerNames);
        la(check.arrayOfStrings(controllerNames),
          'expected list of controller names', controllerNames);

        controllerNames.forEach(function (controllerName) {
          la(check.fn(dependencies.$controller), 'need $controller service', dependencies);
          la(check.object(dependencies.$rootScope), 'need $rootScope service', dependencies);
          var scope = dependencies.$rootScope.$new();
          dependencies.$controller(controllerName, {
            $scope: scope
          });
          dependencies[controllerName] = scope;

          // need to clean up anything created when setupControllers was called
          bdd.afterEach(function () {
            log('deleting controller name', controllerName, 'from dependencies',
              Object.keys(dependencies));
            delete dependencies[controllerName];
          });
        });
      }

      function isResponseCode(x) {
        return check.number(x) && x >= 200 && x < 550;
      }

      function isResponsePair(x) {
        return check.array(x) &&
          x.length === 2 &&
          isResponseCode(x[0]);
      }

      function setupMethodHttpResponses(methodName) {
        la(check.unemptyString(methodName), 'expected method name', methodName);
        var mockConfig = options.http[methodName];

        if (check.fn(mockConfig)) {
          mockConfig = mockConfig();
        }

        la(check.object(mockConfig),
          'expected mock config for http method', methodName, mockConfig);
        var method = methodName.toUpperCase();

        Object.keys(mockConfig).forEach(function (url) {
          log('mocking', method, 'response for url', url);

          var value = mockConfig[url];
          if (check.fn(value)) {
            return dependencies.http.when(method, url).respond(function () {
              var result = value.apply(null, arguments);
              if (isResponsePair(result)) {
                return result;
              }
              return [200, result];
            });
          }
          if (check.number(value) && isResponseCode(value)) {
            return dependencies.http.when(method, url).respond(value);
          }
          if (isResponsePair(value)) {
            return dependencies.http.when(method, url).respond(value[0], value[1]);
          }
          return dependencies.http.when(method, url).respond(200, value);
        });
      }

      function setupHttpResponses() {
        if (check.not.has(options, 'http')) {
          return;
        }
        if (check.empty(options.http)) {
          return;
        }

        la(check.object(options.http), 'expected mock http object', options.http);

        log('setting up mock http responses', options.http);
        la(check.has(dependencies, 'http'), 'expected to inject http', dependencies);

        function hasMockResponses(methodName) {
          return check.has(options.http, methodName);
        }

        var validMethods = ['get', 'head', 'post', 'put', 'delete', 'jsonp', 'patch'];
        validMethods
          .filter(hasMockResponses)
          .forEach(setupMethodHttpResponses);
      }

      function setupDigestCycleShortcut() {
        dependencies.step = function step() {
          if (dependencies.http && check.fn(dependencies.http.flush)) {
            dependencies.http.flush();
          }
          if (dependencies.$rootScope) {
            dependencies.$rootScope.$digest();
          }
        };
      }

      // treat http option a little differently
      function loadDynamicHttp() {
        if (check.fn(options.http)) {
          options.http = options.http();
        }
      }

      bdd.beforeEach(loadDynamicHttp);
      bdd.beforeEach(function injectDeps() {
        // defer using angular.mock
        angular.mock.inject(injectDependencies);
      });
      bdd.beforeEach(setupDigestCycleShortcut);
      bdd.beforeEach(setupHttpResponses);

      function setupElement(elementHtml) {
        la(check.fn(dependencies.$compile), 'missing $compile', dependencies);

        var scope = dependencies.$rootScope.$new();
        angular.extend(scope, angular.copy(options.parentScope));
        log('created element scope with values', options.parentScope);

        var element = angular.element(elementHtml);
        var compiled = dependencies.$compile(element);
        compiled(scope);
        dependencies.$rootScope.$digest();

        dependencies.element = element;
        dependencies.parentScope = scope;
      }

      function exposeApi() {
        return {
          setupElement: setupElement,
          setupControllers: setupControllers
        };
      }

      // collect afterEach callbacks from inside the unit test
      var afters = [];
      var _afterEach = window.afterEach;
      window.afterEach = function saveAfterEach(cb) {
        afters.push(cb);
      };

      var toExpose = options.exposeApi ? exposeApi() : undefined;
      // call the user-supplied test function to register the actual unit tests
      options.tests(dependencies, toExpose);

      // Element setup comes after tests setup by default so that any beforeEach clauses
      // within the tests occur before the element is compiled, i.e. $httpBackend setup.
      if (check.unemptyString(options.element)) {
        log('setting up element', options.element);
        bdd.beforeEach(function () {
          setupElement(options.element);
        });
        cleanupCallbacks.push(function cleanupElement() {
          log('deleting created element');
          delete dependencies.element;
        });
      }

      if (check.has(options, 'controllers') &&
        check.unempty(options.controllers)) {

        bdd.beforeEach(function () {
          setupControllers(options.controllers);
        });
      }

      function deleteDependencies() {
        la(check.object(dependencies), 'missing dependencies object', dependencies);

        log('deleting dependencies injected by ngDescribe from', Object.keys(dependencies));
        log('before cleaning up, these names were injected', options.inject);

        options.inject.forEach(function deleteInjectedDependency(dependencyName, k) {
          la(check.unemptyString(dependencyName), 'missing dependency name', dependencyName);
          var name = aliasedDependencies[dependencyName] || dependencyName;
          log('deleting injected name', dependencyName, 'alias', name, 'index', k);

          la(check.has(dependencies, name),
            'cannot find injected dependency', name, '(or alias)', dependencyName,
            'in', dependencies);
          la(check.has(dependencies, dependencyName),
            'cannot find injected dependency', dependencyName);

          log('deleting property', name, 'from dependencies', Object.keys(dependencies));
          delete dependencies[name];
          delete dependencies[dependencyName];
          log('remaining dependencies object', Object.keys(dependencies));
        });
      }
      cleanupCallbacks.push(deleteDependencies);

      // run all callbacks after each unit test as a single function
      function cleanUp(callbacks) {
        la(check.array(callbacks), 'expected list of callbacks', callbacks);
        log('inside cleanup afterEach', callbacks.length, 'callbacks');

        callbacks.forEach(function (fn) {
          la(check.fn(fn), 'expected function to cleanup, got', fn);
          window.afterEach(fn);
        });
      }

      log('cleanupCallbacks', cleanupCallbacks.length);
      cleanUp(cleanupCallbacks);

      // restore the original afterEach
      window.afterEach = _afterEach;

      function singleAfterEachInOrder(afterCallbacks) {
        la(check.array(afterCallbacks), 'expected array of callbacks', afterCallbacks);
        log('single "after" block with', afterCallbacks.length, 'callbacks');
        afterCallbacks.forEach(function (fn, k) {
          log('"after callback"', k, fn.name);
          fn();
        });
      }
      var singleCleanup = singleAfterEachInOrder.bind(null, afters);
      window.afterEach(singleCleanup);
    }

    bdd.describe(options.name, ngSpecs);

    return ngDescribe;
  }

  root.ngDescribe = ngDescribe;

}(typeof window === 'object' ? window : this));
