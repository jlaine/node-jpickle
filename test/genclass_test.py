#!/usr/bin/python
from __future__ import print_function
import pickle
import binascii

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
      
      
myclass = MyClass()

myclassescontainer = { "myclass1" : MyClass(), "myclass2" : MyClass() }
myclassescontainer["myclass1"].data = "new test value 1"
myclassescontainer["myclass2"].data = "new test value 2"

myotherclass = MyOtherClass()

mysubclass = MySubClass()

testfile = open("./class_tests.js", "w")

print("var assert = require('assert'),\n" \
      "    util = require('util'),\n" \
      "    jpickle = require('../lib/jpickle');\n\n", file = testfile )

print("function MyClass() {\n" \
      "}\n\n", file = testfile )

print("function MyOtherClass() {\n" \
      "    this.mymethod = function() { return this.myclass.data + ' foo!';}; \n" \
      "}\n\n", file = testfile )

print("function MySubClass() {\n" \
      "}\n" \
      "util.inherits(MySubClass, MyOtherClass);\n\n", file = testfile )

print("jpickle.emulated['__main__.MyClass'] = MyClass;\n" \
      "jpickle.emulated['__main__.MyOtherClass'] = MyOtherClass;\n" \
      "jpickle.emulated['__main__.MySubClass'] = MySubClass;\n\n", file = testfile )

print("\ndescribe('pickle version 2 classes', function() {\n", file = testfile )

print("    it('should decode simple classes', function() {\n" \
      "        var decoded = jpickle.loads('%s');\n" \
      "        assert.strictEqual(decoded instanceof MyClass, true);\n" \
      "        assert.strictEqual(decoded.data, 'test');\n" \
      "    });\n\n" % pickle.dumps( myclass, protocol=2 ).encode('string-escape'), file = testfile )

print("    it('should decode simple classes in a container', function() {\n" \
      "        var decoded = jpickle.loads('%s');\n" \
      "        assert.strictEqual(decoded['myclass1'] instanceof MyClass, true);\n" \
      "        assert.strictEqual(decoded['myclass2'] instanceof MyClass, true);\n" \
      "        assert.strictEqual(decoded['myclass1'].data, 'new test value 1');\n" \
      "        assert.strictEqual(decoded['myclass2'].data, 'new test value 2');\n" \
      "    });\n\n" % pickle.dumps( myclassescontainer, protocol=2 ).encode('string-escape'), file = testfile )

print("    it('should decode classes containing classes', function() {\n" \
      "        var decoded = jpickle.loads('%s');\n" \
      "        assert.strictEqual(decoded instanceof MyOtherClass, true);\n" \
      "        assert.strictEqual(decoded.myclasses[0] instanceof MyClass, true);\n" \
      "        assert.strictEqual(decoded.myclasses[0].data, 'new test value');\n" \
      "        assert.strictEqual(decoded.myclass.data, 'test');\n" \
      "    });\n\n" % pickle.dumps( myotherclass, protocol=2 ).encode('string-escape'), file = testfile )
    
print("    it('should decode a subclass and a superclass', function() {\n" \
      "        var decoded = jpickle.loads('%s');\n" \
      "        assert.strictEqual(decoded instanceof MyOtherClass, true);\n" \
      "        assert.strictEqual(decoded instanceof MySubClass, true);\n" \
      "        assert.strictEqual(decoded.myclasses[0] instanceof MyClass, true);\n" \
      "        assert.strictEqual(decoded.myclasses[0].data, 'new test value');\n" \
      "        assert.strictEqual(decoded.myclass.data, 'test');\n" \
      "        assert.strictEqual(decoded.subvalue, 12);\n" \
      "    });\n\n" % pickle.dumps( mysubclass, protocol=2 ).encode('string-escape'), file = testfile )

print("    it('should decode classes containing method', function() {\n" \
      "        var decoded = jpickle.loads('%s');\n" \
      "        assert.strictEqual(decoded.mymethod(), 'test foo!');\n" \
      "    });\n\n" % pickle.dumps( myotherclass, protocol=2 ).encode('string-escape'), file = testfile )

print("});\n\n", file = testfile )