var assert = require('assert'),
    util = require('util'),
    jpickle = require('../lib/jpickle');


function MyClass() {
}


function MyOtherClass() {
    this.mymethod = function() { return this.myclass.data + ' foo!';}; 
}


function MySubClass() {
}
util.inherits(MySubClass, MyOtherClass);


jpickle.emulated['__main__.MyClass'] = MyClass;
jpickle.emulated['__main__.MyOtherClass'] = MyOtherClass;
jpickle.emulated['__main__.MySubClass'] = MySubClass;



describe('pickle version 2 classes', function() {

    it('should decode simple classes', function() {
        var decoded = jpickle.loads('\x80\x02(c__main__\nMyClass\nq\x00oq\x01}q\x02U\x04dataq\x03U\x04testq\x04sb.');
        assert.strictEqual(decoded instanceof MyClass, true);
        assert.strictEqual(decoded.data, 'test');
    });


    it('should decode simple classes in a container', function() {
        var decoded = jpickle.loads('\x80\x02}q\x00(U\x08myclass2q\x01(c__main__\nMyClass\nq\x02oq\x03}q\x04U\x04dataq\x05U\x10new test value 2q\x06sbU\x08myclass1q\x07(h\x02oq\x08}q\th\x05U\x10new test value 1q\nsbu.');
        assert.strictEqual(decoded['myclass1'] instanceof MyClass, true);
        assert.strictEqual(decoded['myclass2'] instanceof MyClass, true);
        assert.strictEqual(decoded['myclass1'].data, 'new test value 1');
        assert.strictEqual(decoded['myclass2'].data, 'new test value 2');
    });


    it('should decode classes containing classes', function() {
        var decoded = jpickle.loads('\x80\x02(c__main__\nMyOtherClass\nq\x00oq\x01}q\x02(U\x07myclassq\x03(c__main__\nMyClass\nq\x04oq\x05}q\x06U\x04dataq\x07U\x04testq\x08sbU\tmyclassesq\t]q\n((h\x04oq\x0b}q\x0ch\x07U\x0enew test valueq\rsb(h\x04oq\x0e}q\x0fh\x07h\x08sbeub.');
        assert.strictEqual(decoded instanceof MyOtherClass, true);
        assert.strictEqual(decoded.myclasses[0] instanceof MyClass, true);
        assert.strictEqual(decoded.myclasses[0].data, 'new test value');
        assert.strictEqual(decoded.myclass.data, 'test');
    });


    it('should decode a subclass and a superclass', function() {
        var decoded = jpickle.loads('\x80\x02(c__main__\nMySubClass\nq\x00oq\x01}q\x02(U\x07myclassq\x03(c__main__\nMyClass\nq\x04oq\x05}q\x06U\x04dataq\x07U\x04testq\x08sbU\x08subvalueq\tK\x0cU\tmyclassesq\n]q\x0b((h\x04oq\x0c}q\rh\x07U\x0enew test valueq\x0esb(h\x04oq\x0f}q\x10h\x07h\x08sbeub.');
        assert.strictEqual(decoded instanceof MyOtherClass, true);
        assert.strictEqual(decoded instanceof MySubClass, true);
        assert.strictEqual(decoded.myclasses[0] instanceof MyClass, true);
        assert.strictEqual(decoded.myclasses[0].data, 'new test value');
        assert.strictEqual(decoded.myclass.data, 'test');
        assert.strictEqual(decoded.subvalue, 12);
    });


    it('should decode classes containing method', function() {
        var decoded = jpickle.loads('\x80\x02(c__main__\nMyOtherClass\nq\x00oq\x01}q\x02(U\x07myclassq\x03(c__main__\nMyClass\nq\x04oq\x05}q\x06U\x04dataq\x07U\x04testq\x08sbU\tmyclassesq\t]q\n((h\x04oq\x0b}q\x0ch\x07U\x0enew test valueq\rsb(h\x04oq\x0e}q\x0fh\x07h\x08sbeub.');
        assert.strictEqual(decoded.mymethod(), 'test foo!');
    });


});


