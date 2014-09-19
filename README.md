node-jpickle
============

[![Build Status](https://travis-ci.org/jlaine/node-jpickle.png)](https://travis-ci.org/jlaine/node-jpickle)

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

```javascript
var jpickle = require('jpickle');
jpickle.loads('U\x0bhello worldq\x01.');
```

To handle more complex objects from jpickle the
Javascript objects first need to be registered
with the the module. For most basic cases these
can just be empty objects that are mapped to a
a python class name. If the type is not registered
with the emulated member then the unpickle will
fail with an exception.

### Python
```python
class MyClass:
    def __init__(self):
        self.data = "test"
```

### Node
```javascript
function MyClass() {}

var jpickle = require('jpickle');
jpickle.emulated['__main__.MyClass'] = MyClass;
var unpickled = jpickle.loads(pickled);
// unpickled.data is now "test"
```

If the class being unpickled uses inheritance the
base classes need to be registered also.

### Python
```python
class MyClass:
    def __init__(self):
        self.data = "test"

class MyOtherClass:
    def __init__(self):
        self.myclass = MyClass()
        self.myclasses = [ MyClass(), MyClass() ]
        self.myclasses[0].data = "new test value"

class MySubClass(MyOtherClass):
    def __init__(self):
        MyOtherClass.__init__(self)
        self.subvalue = 12
 ```

### Node
```javascript
function MyClass() {}
function MyOtherClass() {}
function MySubClass() {}

var jpickle = require('jpickle');
jpickle.emulated['__main__.MyClass'] = MyClass;
jpickle.emulated['__main__.MyOtherClass'] = MyOtherClass;
jpickle.emulated['__main__.MySubClass'] = MySubClass;

var unpickled = jpickle.loads(pickled);
// unpickled.myclasses[0].data is now "new test value"
// unpickled.subvalue is now "12"
```

In cases that more emulation is desired such as member
functions those can be added to the object prototype.


Running Tests
-------------

To run the tests, install Mocha then run:

    mocha
