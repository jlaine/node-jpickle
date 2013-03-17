var assert = require('assert')
  , jpickle = require('../lib/jpickle');

describe('pickle version 0', function() {
    it('should decode integers', function() {
        assert.equal(jpickle.loads('I1\n.'), 1);
        assert.equal(jpickle.loads('I12\n.'), 12);
    });

    it('should decode floats', function() {
        assert.equal(jpickle.loads('F3.14159\n.'), 3.14159);
    });

    it('should decode strings', function() {
        assert.equal(jpickle.loads("S'foo'\np0\n."), 'foo');
        assert.equal(jpickle.loads("S\"foo\"\np0\n."), 'foo');
    });

    it('should decode lists', function() {
        assert.deepEqual(jpickle.loads('(lp0\n.'), []);
        assert.deepEqual(jpickle.loads('(lp0\nI1\na.'), [1]);
        assert.deepEqual(jpickle.loads('(lp1\nI1\naI2\naI3\na.'), [1, 2, 3]);
    });

    it('should decode dicts', function() {
        assert.deepEqual(jpickle.loads('(dp0\n.'), {});
        assert.deepEqual(jpickle.loads("(dp0\nS'foo'\np1\nS'bar'\np2\ns."), {foo: 'bar'});
    });
});

describe('pickle version 1', function() {
    it('should decode BININT', function() {
        assert.equal(jpickle.loads('I1\n.'), 1);
        assert.equal(jpickle.loads('I12\n.'), 12);
    });

    it('should decode BININT1', function() {
        assert.equal(jpickle.loads('K\x01.'), 1);
    });

    it('should decode BININT2', function() {
        assert.equal(jpickle.loads('M\x00\x01.'), 256);
    });

    it('should decode BININT4', function() {
        assert.equal(jpickle.loads('J\x00\x00\x01\x00.'), 65536);
    });

    it('should decode BINFLOAT', function() {
        assert.equal(jpickle.loads('G@\t!\xf9\xf0\x1b\x86n.'), 3.14159);
    });

    it('should decode BINSTRING', function() {
        assert.equal(jpickle.loads('T\x00\x01\x00\x00xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxq\x00.'), 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    });

    it('should decode SHORT_BINSTRING', function() {
        assert.equal(jpickle.loads('U\x03fooq\x00.'), 'foo');
    });

    it('should decode EMPTY_LIST', function() {
        assert.deepEqual(jpickle.loads(']q\x00.'), []);
    });

    it('should decode EMPTY_LIST, BINPUT .. APPEND', function() {
        assert.deepEqual(jpickle.loads(']q\x00K\x01a.'), [1]);
    });

    it('should decode EMPTY_LIST, BINPUT, MARK .. APPENDS', function() {
        assert.deepEqual(jpickle.loads(']q\x00(K\x01K\x02K\x03e.'), [1, 2, 3]);
    });

    it('should decode EMPTY_DICT', function() {
        assert.deepEqual(jpickle.loads('}q\x00.'), {});
    });

    it('should decode EMPTY_DICT, BINPUT, MARK .. SETITEM', function() {
        assert.deepEqual(jpickle.loads('}q\x00U\x03fooq\x01U\x03barq\x02s.'), {foo: 'bar'});
    });
});
