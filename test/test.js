var assert = require('assert')
  , jpickle = require('../lib/jpickle');

// pickle version 0

// INT
assert.equal(jpickle.parse('I1\n.'), 1);
assert.equal(jpickle.parse('I12\n.'), 12);

// STRING
assert.equal(jpickle.parse("S'foo'\np0\n."), 'foo');
assert.equal(jpickle.parse("S\"foo\"\np0\n."), 'foo');

// DICT
assert.deepEqual(jpickle.parse('(dp0\n.'), {});
assert.deepEqual(jpickle.parse("(dp0\nS'foo'\np1\nS'bar'\np2\ns."), {foo: 'bar'});

// pickle version 1

// BININT1
assert.equal(jpickle.parse('K\x01.'), 1);

// BININT2
assert.equal(jpickle.parse('M\x00\x01.'), 256);

// BININT4
assert.equal(jpickle.parse('J\x00\x00\x01\x00.'), 65536);

// BINSTRING
assert.equal(jpickle.parse('T\x00\x01\x00\x00xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxq\x00.'), 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

// SHORT_BINSTRING
assert.equal(jpickle.parse('U\x03fooq\x00.'), 'foo');

// EMPTY_DICT
assert.deepEqual(jpickle.parse('}q\x00.'), {});

// SETITEMS
assert.deepEqual(jpickle.parse('}q\x00U\x03fooq\x01U\x03barq\x02s.'), {foo: 'bar'});
