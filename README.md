node-jpickle
============

Full-javascript parser for Python's pickle format.

It currently supports most opcodes for:

 - protocol 0
 - protocol 1
 - protocol 2

Installation
------------

    npm install jpickle

Usage
-----

Here is a basic example for parsing a pickled string:

    var jpickle = require('jpickle');
    jpickle.loads('U\x0bhello worldq\x01.');

Running Tests
-------------

To run the tests, install Mocha then run:

    mocha
