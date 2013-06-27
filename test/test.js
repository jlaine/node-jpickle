var assert = require('assert')
  , jpickle = require('../lib/jpickle');

describe('pickle version 0', function() {
    it('should decode integers', function() {
        assert.strictEqual(jpickle.loads('I1\n.'), 1);
        assert.strictEqual(jpickle.loads('I256\n.'), 256);
        assert.strictEqual(jpickle.loads('I65536\n.'), 65536);
        assert.strictEqual(jpickle.loads('I-1\n.'), -1);
    });

    it('should decode booleans', function() {
        assert.strictEqual(jpickle.loads('I00\n.'), false);
        assert.strictEqual(jpickle.loads('I01\n.'), true);
    });

    it('should decode floats', function() {
        assert.strictEqual(jpickle.loads('F3.14159\n.'), 3.14159);
        assert.strictEqual(jpickle.loads('F-3.14159\n.'), -3.14159);
    });

    it('should decode longstrings', function() {
        assert.strictEqual(jpickle.loads('L123123123123123123123123123123L\n.'), 123123123123123123123123123123);
    });

    it('should decode strings', function() {
        assert.strictEqual(jpickle.loads("S'foo'\np0\n."), 'foo');
        assert.strictEqual(jpickle.loads("S\"foo\"\np0\n."), 'foo');
    });

    it('should decode unicodes', function() {
        assert.strictEqual(jpickle.loads('VTest\xe9\np0\n.'), 'Testé');
    });

    it('should decode tuples', function() {
        assert.deepEqual(jpickle.loads("(t."), []);
        assert.deepEqual(jpickle.loads("(S'foo'\np0\ntp1\n."), ['foo']);
        assert.deepEqual(jpickle.loads("(S'foo'\np0\nS'bar'\np1\ntp2\n."), ['foo', 'bar']);
        assert.deepEqual(jpickle.loads("(S'foo'\np0\nS'bar'\np1\nS'wiz'\np2\ntp3\n."), ['foo', 'bar', 'wiz']);
    });

    it('should decode lists', function() {
        assert.deepEqual(jpickle.loads('(lp0\n.'), []);
        assert.deepEqual(jpickle.loads('(lp0\nI1\na.'), [1]);
        assert.deepEqual(jpickle.loads('(lp1\nI1\naI2\naI3\na.'), [1, 2, 3]);
    });

    it('should decode dicts', function() {
        assert.deepEqual(jpickle.loads('(dp0\n.'), {});
        assert.deepEqual(jpickle.loads("(dp0\nS'foo'\np1\nS'bar'\np2\ns."), {foo: 'bar'});
        assert.deepEqual(jpickle.loads("(dp0\nS'foo'\np1\nS'bar'\np2\nsS'wiz'\np3\nS'bang'\np4\ns."), {foo: 'bar', wiz: 'bang'});
    });
});

describe('pickle version 1', function() {
    it('should decode integers', function() {
        // BININT1
        assert.strictEqual(jpickle.loads('K\x01.'), 1);
        // BININT2
        assert.strictEqual(jpickle.loads('M\x00\x01.'), 256);
        // BININT
        assert.strictEqual(jpickle.loads('J\x00\x00\x01\x00.'), 65536);
        assert.strictEqual(jpickle.loads('J\xff\xff\xff\xff.'), -1);
    });

    it('should decode floats', function() {
        // BINFLOAT
        assert.strictEqual(jpickle.loads('G@\t!\xf9\xf0\x1b\x86n.'), 3.14159);
        assert.strictEqual(jpickle.loads('G\xc0\t!\xf9\xf0\x1b\x86n.'), -3.14159);
    });

    it('should decode strings', function() {
        // BINSTRING
        assert.strictEqual(jpickle.loads('T\x00\x01\x00\x00xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxq\x00.'), 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
        // SHORT_BINSTRING
        assert.strictEqual(jpickle.loads('U\x03fooq\x00.'), 'foo');
    });

    it('should decode unicodes', function() {
        // BINUNICODE
        assert.strictEqual(jpickle.loads('X\x06\x00\x00\x00Test\xc3\xa9q\x00.'), 'Testé');
    });

    it('should decode tuples', function() {
        assert.deepEqual(jpickle.loads(').'), []);
        assert.deepEqual(jpickle.loads('(U\x03fooq\x00tq\x01.'), ['foo']);
        assert.deepEqual(jpickle.loads('(U\x03fooq\x00U\x03barq\x01tq\x02.'), ['foo', 'bar']);
        assert.deepEqual(jpickle.loads('(U\x03fooq\x00U\x03barq\x01U\x03wizq\x02tq\x03.'), ['foo', 'bar', 'wiz']);
    });

    it('should decode lists', function() {
        assert.deepEqual(jpickle.loads(']q\x00.'), []);
        assert.deepEqual(jpickle.loads(']q\x00K\x01a.'), [1]);
        assert.deepEqual(jpickle.loads(']q\x00(K\x01K\x02K\x03e.'), [1, 2, 3]);
    });

    it('should decode dicts', function() {
        assert.deepEqual(jpickle.loads('}q\x00.'), {});
        assert.deepEqual(jpickle.loads('}q\x00U\x03fooq\x01U\x03barq\x02s.'), {foo: 'bar'});
        assert.deepEqual(jpickle.loads('}q\x00(U\x03fooq\x01U\x03barq\x02U\x03wizq\x03U\x04bangq\x04u.'), {foo: 'bar', wiz: 'bang'});
    });
});

describe('pickle version 2', function() {
    it('should decode booleans', function() {
        assert.strictEqual(jpickle.loads('\x80\x02\x89.'), false);
        assert.strictEqual(jpickle.loads('\x80\x02\x88.'), true);
    });

    it('should decode longs to zero', function() {
        // FIXME: actually decode longs
        assert.strictEqual(jpickle.loads('\x80\x02\x8a\t\x00\x00\x00\x00\x00\x00\x00\x00\x01.'), 0);
        assert.strictEqual(jpickle.loads('\x80\x02\x8b\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x80\x00.'), 0);
    });

    it('should decode tuples', function() {
        assert.deepEqual(jpickle.loads('\x80\x02).'), []);
        assert.deepEqual(jpickle.loads('\x80\x02U\x03fooq\x00\x85q\x01.'), ['foo']);
        assert.deepEqual(jpickle.loads('\x80\x02U\x03fooq\x00U\x03barq\x01\x86q\x02.'), ['foo', 'bar']);
        assert.deepEqual(jpickle.loads('\x80\x02U\x03fooq\x00U\x03barq\x01U\x03wizq\x02\x87q\x03.'), ['foo', 'bar', 'wiz']);
        assert.deepEqual(jpickle.loads('\x80\x02(U\x03fooq\x00U\x03barq\x01U\x03wizq\x02U\x04bangq\x03tq\x04.'), ['foo', 'bar', 'wiz', 'bang']);
    });

    it('should decode naive datetimes', function() {
        var date = jpickle.loads('\x80\x02cdatetime\ndatetime\nq\x00U\n\x07\xdd\x03\x12\x17\x014\x04\xc0\x0bq\x01\x85q\x02Rq\x03.');
        assert.strictEqual(date.getFullYear(), 2013);
        assert.strictEqual(date.getMonth(), 2);
        assert.strictEqual(date.getDate(), 18);
        assert.strictEqual(date.getHours(), 23);
        assert.strictEqual(date.getMinutes(), 1);
        assert.strictEqual(date.getSeconds(), 52);
        assert.strictEqual(date.getMilliseconds(), 311);
    });
    it('should decode aware datetimes', function() {
        var date = jpickle.loads('\x80\x02cdatetime\ndatetime\nq\x00U\n\x07\xdd\x03\x12\x16\x014\x04\xc0\x0bq\x01cdjango.utils.timezone\nUTC\nq\x02)Rq\x03\x86q\x04Rq\x05.');
        assert.strictEqual(date.getUTCFullYear(), 2013);
        assert.strictEqual(date.getUTCMonth(), 2);
        assert.strictEqual(date.getUTCDate(), 18);
        assert.strictEqual(date.getUTCHours(), 22);
        assert.strictEqual(date.getUTCMinutes(), 1);
        assert.strictEqual(date.getUTCSeconds(), 52);
        assert.strictEqual(date.getUTCMilliseconds(), 311);
    });
});
