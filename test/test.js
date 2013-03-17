var assert = require('assert')
  , jpickle = require('../lib/jpickle');

// pickle version 0

// INT
assert.equal(jpickle.loads('I1\n.'), 1);
assert.equal(jpickle.loads('I12\n.'), 12);

// FLOAT
assert.equal(jpickle.loads('F3.14159\n.'), 3.14159);

// STRING
assert.equal(jpickle.loads("S'foo'\np0\n."), 'foo');
assert.equal(jpickle.loads("S\"foo\"\np0\n."), 'foo');

// LIST
assert.deepEqual(jpickle.loads('(lp0\n.'), []);
assert.deepEqual(jpickle.loads('(lp1\nI1\naI2\naI3\na.'), [1, 2, 3]);

// DICT
assert.deepEqual(jpickle.loads('(dp0\n.'), {});
assert.deepEqual(jpickle.loads("(dp0\nS'foo'\np1\nS'bar'\np2\ns."), {foo: 'bar'});

// pickle version 1

// BININT1
assert.equal(jpickle.loads('K\x01.'), 1);

// BININT2
assert.equal(jpickle.loads('M\x00\x01.'), 256);

// BININT4
assert.equal(jpickle.loads('J\x00\x00\x01\x00.'), 65536);

// BINFLOAT
assert.equal(jpickle.loads('G@\t!\xf9\xf0\x1b\x86n.'), 3.14159);

// BINSTRING
assert.equal(jpickle.loads('T\x00\x01\x00\x00xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxq\x00.'), 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

// SHORT_BINSTRING
assert.equal(jpickle.loads('U\x03fooq\x00.'), 'foo');

// EMPTY_DICT
assert.deepEqual(jpickle.loads('}q\x00.'), {});

// SETITEMS
assert.deepEqual(jpickle.loads('}q\x00U\x03fooq\x01U\x03barq\x02s.'), {foo: 'bar'});
