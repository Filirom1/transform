'use strict';

// Load modules

const Code = require('code');
const Hoek = require('..');
const Lab = require('lab');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const it = lab.test;
const expect = Code.expect;

describe('stringify()', (done) => {

    it('converts object to string', (done) => {

        const obj = { a: 1 };
        expect(Hoek.stringify(obj)).to.equal('{"a":1}');
        done();
    });

    it('returns error in result string', (done) => {

        const obj = { a: 1 };
        obj.b = obj;
        expect(Hoek.stringify(obj)).to.equal('[Cannot display object: Converting circular structure to JSON]');
        done();
    });
});


describe('assert()', () => {

    it('throws an Error when using assert in a test', (done) => {

        expect(() => {

            Hoek.assert(false, 'my error message');
        }).to.throw('my error message');
        done();
    });

    it('throws an Error when using assert in a test with no message', (done) => {

        expect(() => {

            Hoek.assert(false);
        }).to.throw('Unknown error');
        done();
    });

    it('throws an Error when using assert in a test with multipart message', (done) => {

        expect(() => {

            Hoek.assert(false, 'This', 'is', 'my message');
        }).to.throw('This is my message');
        done();
    });

    it('throws an Error when using assert in a test with multipart message (empty)', (done) => {

        expect(() => {

            Hoek.assert(false, 'This', 'is', '', 'my message');
        }).to.throw('This is my message');
        done();
    });

    it('throws an Error when using assert in a test with object message', (done) => {

        expect(() => {

            Hoek.assert(false, 'This', 'is', { spinal: 'tap' });
        }).to.throw('This is {"spinal":"tap"}');
        done();
    });

    it('throws an Error when using assert in a test with multipart string and error messages', (done) => {

        expect(() => {

            Hoek.assert(false, 'This', 'is', new Error('spinal'), new Error('tap'));
        }).to.throw('This is spinal tap');
        done();
    });

    it('throws an Error when using assert in a test with error object message', (done) => {

        expect(() => {

            Hoek.assert(false, new Error('This is spinal tap'));
        }).to.throw('This is spinal tap');
        done();
    });

    it('throws the same Error that is passed to it if there is only one error passed', (done) => {

        const error = new Error('ruh roh');
        const error2 = new Error('ruh roh');

        const fn = function () {

            Hoek.assert(false, error);
        };

        try {
            fn();
        }
        catch (err) {
            expect(error).to.equal(error);  // should be the same reference
            expect(error).to.not.equal(error2); // error with the same message should not match
        }

        done();
    });
});


describe('reach()', () => {

    const obj = {
        a: {
            b: {
                c: {
                    d: 1,
                    e: 2
                },
                f: 'hello'
            },
            g: {
                h: 3
            }
        },
        i: function () { },
        j: null,
        k: [4, 8, 9, 1]
    };

    obj.i.x = 5;

    it('returns object itself', (done) => {

        expect(Hoek.reach(obj, null)).to.equal(obj);
        expect(Hoek.reach(obj, false)).to.equal(obj);
        expect(Hoek.reach(obj)).to.equal(obj);
        done();
    });

    it('returns first value of array', (done) => {

        expect(Hoek.reach(obj, 'k.0')).to.equal(4);
        done();
    });

    it('returns last value of array using negative index', (done) => {

        expect(Hoek.reach(obj, 'k.-2')).to.equal(9);
        done();
    });

    it('returns a valid member', (done) => {

        expect(Hoek.reach(obj, 'a.b.c.d')).to.equal(1);
        done();
    });

    it('returns a valid member with separator override', (done) => {

        expect(Hoek.reach(obj, 'a/b/c/d', '/')).to.equal(1);
        done();
    });

    it('returns undefined on null object', (done) => {

        expect(Hoek.reach(null, 'a.b.c.d')).to.equal(undefined);
        done();
    });

    it('returns undefined on missing object member', (done) => {

        expect(Hoek.reach(obj, 'a.b.c.d.x')).to.equal(undefined);
        done();
    });

    it('returns undefined on missing function member', (done) => {

        expect(Hoek.reach(obj, 'i.y', { functions: true })).to.equal(undefined);
        done();
    });

    it('throws on missing member in strict mode', (done) => {

        expect(() => {

            Hoek.reach(obj, 'a.b.c.o.x', { strict: true });
        }).to.throw('Missing segment o in reach path  a.b.c.o.x');

        done();
    });

    it('returns undefined on invalid member', (done) => {

        expect(Hoek.reach(obj, 'a.b.c.d-.x')).to.equal(undefined);
        done();
    });

    it('returns function member', (done) => {

        expect(typeof Hoek.reach(obj, 'i')).to.equal('function');
        done();
    });

    it('returns function property', (done) => {

        expect(Hoek.reach(obj, 'i.x')).to.equal(5);
        done();
    });

    it('returns null', (done) => {

        expect(Hoek.reach(obj, 'j')).to.equal(null);
        done();
    });

    it('throws on function property when functions not allowed', (done) => {

        expect(() => {

            Hoek.reach(obj, 'i.x', { functions: false });
        }).to.throw('Invalid segment x in reach path  i.x');

        done();
    });

    it('will return a default value if property is not found', (done) => {

        expect(Hoek.reach(obj, 'a.b.q', { default: 'defaultValue' })).to.equal('defaultValue');
        done();
    });

    it('will return a default value if path is not found', (done) => {

        expect(Hoek.reach(obj, 'q', { default: 'defaultValue' })).to.equal('defaultValue');
        done();
    });

    it('allows a falsey value to be used as the default value', (done) => {

        expect(Hoek.reach(obj, 'q', { default: '' })).to.equal('');
        done();
    });
});

describe('transform()', () => {

    const source = {
        address: {
            one: '123 main street',
            two: 'PO Box 1234'
        },
        zip: {
            code: 3321232,
            province: null
        },
        title: 'Warehouse',
        state: 'CA'
    };

    const sourcesArray = [{
        address: {
            one: '123 main street',
            two: 'PO Box 1234'
        },
        zip: {
            code: 3321232,
            province: null
        },
        title: 'Warehouse',
        state: 'CA'
    }, {
        address: {
            one: '456 market street',
            two: 'PO Box 5678'
        },
        zip: {
            code: 9876,
            province: null
        },
        title: 'Garage',
        state: 'NY'
    }];

    it('transforms an object based on the input object', (done) => {

        const result = Hoek.transform(source, {
            'person.address.lineOne': 'address.one',
            'person.address.lineTwo': 'address.two',
            'title': 'title',
            'person.address.region': 'state',
            'person.address.zip': 'zip.code',
            'person.address.location': 'zip.province'
        });

        expect(result).to.deep.equal({
            person: {
                address: {
                    lineOne: '123 main street',
                    lineTwo: 'PO Box 1234',
                    region: 'CA',
                    zip: 3321232,
                    location: null
                }
            },
            title: 'Warehouse'
        });

        done();
    });

    it('transforms an array of objects based on the input object', (done) => {

        const result = Hoek.transform(sourcesArray, {
            'person.address.lineOne': 'address.one',
            'person.address.lineTwo': 'address.two',
            'title': 'title',
            'person.address.region': 'state',
            'person.address.zip': 'zip.code',
            'person.address.location': 'zip.province'
        });

        expect(result).to.deep.equal([
            {
                person: {
                    address: {
                        lineOne: '123 main street',
                        lineTwo: 'PO Box 1234',
                        region: 'CA',
                        zip: 3321232,
                        location: null
                    }
                },
                title: 'Warehouse'
            },
            {
                person: {
                    address: {
                        lineOne: '456 market street',
                        lineTwo: 'PO Box 5678',
                        region: 'NY',
                        zip: 9876,
                        location: null
                    }
                },
                title: 'Garage'
            }
        ]);

        done();
    });

    it('uses the reach options passed into it', (done) => {

        const schema = {
            'person.address.lineOne': 'address-one',
            'person.address.lineTwo': 'address-two',
            'title': 'title',
            'person.address.region': 'state',
            'person.prefix': 'person-title',
            'person.zip': 'zip-code'
        };
        const options = {
            separator: '-',
            default: 'unknown'
        };
        const result = Hoek.transform(source, schema, options);

        expect(result).to.deep.equal({
            person: {
                address: {
                    lineOne: '123 main street',
                    lineTwo: 'PO Box 1234',
                    region: 'CA'
                },
                prefix: 'unknown',
                zip: 3321232
            },
            title: 'Warehouse'
        });

        done();
    });

    it('works to create shallow objects', (done) => {

        const result = Hoek.transform(source, {
            lineOne: 'address.one',
            lineTwo: 'address.two',
            title: 'title',
            region: 'state',
            province: 'zip.province'
        });

        expect(result).to.deep.equal({
            lineOne: '123 main street',
            lineTwo: 'PO Box 1234',
            title: 'Warehouse',
            region: 'CA',
            province: null
        });

        done();
    });

    it('only allows strings in the map', (done) => {

        expect(() => {

            Hoek.transform(source, {
                lineOne: {}
            });
        }).to.throw('All mappings must be "." delineated strings');

        done();
    });

    it('throws an error on invalid arguments', (done) => {

        expect(() => {

            Hoek.transform(NaN, {});
        }).to.throw('Invalid source object: must be null, undefined, an object, or an array');

        done();
    });

    it('is safe to pass null', (done) => {

        const result = Hoek.transform(null, {});
        expect(result).to.deep.equal({});

        done();
    });

    it('is safe to pass undefined', (done) => {

        const result = Hoek.transform(undefined, {});
        expect(result).to.deep.equal({});

        done();
    });
});
