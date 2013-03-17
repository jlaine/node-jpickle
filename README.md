node-jpickle
============

Simple full-javascript parser for Python's pickle format.

Installation
------------

    npm install jpickle

Usage
-----

Here is a basic example for parsing a pickled string:

    var jpickle = require('jpickle');
    jpickle.loads('U\x0bhello worldq\x01.');
