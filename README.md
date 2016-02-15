# Transform

A substract of [hapijs/hoek](https://raw.githubusercontent.com/hapijs/hoek) to be small enough for browserify

* [Introduction](#introduction "Introduction")
* [Object](#object "Object")
  * [reach](#reachobj-chain-options "reach")
  * [transform](#transformobj-transform-options "transform")
  * [stringify](#stringifyobj "stringify")
* [Errors](#errors "Errors")
  * [assert](#assertcondition-message "assert")



### reach(obj, chain, [options])

Converts an object key chain string to reference

- `options` - optional settings
    - `separator` - string to split chain path on, defaults to '.'
    - `default` - value to return if the path or value is not present, default is `undefined`
    - `strict` - if `true`, will throw an error on missing member, default is `false`
    - `functions` - if `true` allow traversing functions for properties. `false` will throw an error if a function is part of the chain.

A chain including negative numbers will work like negative indices on an
array.

If chain is `null`, `undefined` or `false`, the object itself will be returned.

```javascript

var chain = 'a.b.c';
var obj = {a : {b : { c : 1}}};

Hoek.reach(obj, chain); // returns 1

var chain = 'a.b.-1';
var obj = {a : {b : [2,3,6]}};

Hoek.reach(obj, chain); // returns 6
```

### transform(obj, transform, [options])

Transforms an existing object into a new one based on the supplied `obj` and `transform` map. `options` are the same as the `reach` options. The first argument can also be an array of objects. In that case the method will return an array of transformed objects.

```javascript
var source = {
    address: {
        one: '123 main street',
        two: 'PO Box 1234'
    },
    title: 'Warehouse',
    state: 'CA'
};

var result = Hoek.transform(source, {
    'person.address.lineOne': 'address.one',
    'person.address.lineTwo': 'address.two',
    'title': 'title',
    'person.address.region': 'state'
});
// Results in
// {
//     person: {
//         address: {
//             lineOne: '123 main street',
//             lineTwo: 'PO Box 1234',
//             region: 'CA'
//         }
//     },
//     title: 'Warehouse'
// }
```

### stringify(obj)

Converts an object to string using the built-in `JSON.stringify()` method with the difference that any errors are caught
and reported back in the form of the returned string. Used as a shortcut for displaying information to the console (e.g. in
error message) without the need to worry about invalid conversion.

```javascript
var a = {};
a.b = a;
Hoek.stringify(a);    // Returns '[Cannot display object: Converting circular structure to JSON]'
```


# Errors

### assert(condition, message)

```javascript

var a = 1, b = 2;

Hoek.assert(a === b, 'a should equal b');  // Throws 'a should equal b'
```

Note that you may also pass an already created Error object as the second parameter, and `assert` will throw that object.

```javascript

var a = 1, b = 2;

Hoek.assert(a === b, new Error('a should equal b')); // Throws the given error object
```

