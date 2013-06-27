var emulated = {
    'datetime.datetime': function(args) {
        var tmp = new Buffer(args[0], 'binary')
          , year = tmp.readUInt16BE(0)
          , month = tmp.readUInt8(2) - 1
          , day = tmp.readUInt8(3)
          , hour = tmp.readUInt8(4)
          , minute = tmp.readUInt8(5)
          , second = tmp.readUInt8(6)
          , microsecond = tmp.readUInt32BE(6) & 0xffffff;
        if (args[1] == 'UTC') {
            return new Date(Date.UTC(year, month, day, hour, minute, second, microsecond / 1000));
        } else {
            return new Date(year, month, day, hour, minute, second, microsecond / 1000);
        }
    },
    'django.utils.timezone.UTC': function(args) {
        return 'UTC';
    }
};

var Parser = function() {
    this.mark = 'THIS-NEEDS-TO-BE-UNIQUE-TO-SERVE-AS-A-BOUNDARY';
    this.memo = {};
    this.stack = [];
};

Parser.prototype.load = function(pickle) {
    var APPEND = 'a'            // append stack top to list below it
      , APPENDS = 'e'           // extend list on stack by topmost stack slice
      , INT = 'I'               // push integer or bool; decimal string argument
      , LONG = 'L'              // push long; decimal string argument
      , BININT = 'J'            // push 4-byte signed int
      , BININT1 = 'K'           // push 1-byte unsigned int
      , BININT2 = 'M'           // push 2-byte unsigned int
      , BINFLOAT = 'G'          // push float; arg is 8-byte float encoding
      , BINPUT = 'q'            // store stack top in memo; index is string 1-byte arg
      , BINSTRING = 'T'
      , BINUNICODE = 'X'
      , DICT = 'd'
      , EMPTY_DICT = '}'
      , EMPTY_LIST = ']'
      , EMPTY_TUPLE = ')'
      , FLOAT = 'F'
      , GLOBAL = 'c'
      , LIST = 'l'
      , MARK = '('
      , PUT = 'p'
      , REDUCE = 'R'
      , SETITEM = 's'
      , SETITEMS = 'u'
      , SHORT_BINSTRING = 'U'
      , STOP = '.'
      , STRING = 'S'
      , TUPLE = 't'
      , UNICODE = 'V'
      // protocol 2
      , PROTO = '\x80'          // identify pickle protocol
      , NEWOBJ = '\x81'         // build object by applying cls.__new__ to argtuple
      , TUPLE1 = '\x85'         // build 1-tuple from stack top
      , TUPLE2 = '\x86'         // build 2-tuple from two topmost stack items
      , TUPLE3 = '\x87'         // build 3-tuple from three topmost stack items
      , NEWTRUE = '\x88'        // push True
      , NEWFALSE = '\x89'       // push False
      , LONG1 = '\x8a'          // push long from < 256 bytes
      , LONG4 = '\x8b'          // push really big long
      ;

    var buffer = new Buffer(pickle, 'binary');
    buffer.readLine = function(i) {
        var index = pickle.indexOf('\n', i);
        if (index == -1)
            throw "Could not find end of line";
        return pickle.substr(i, index - i);
    }

    for (var i = 0; i < pickle.length; ) {
        var opindex = i
          , opcode = pickle[i++];
        //console.log('opcode ' + opindex + ' ' + opcode);
        switch (opcode) {
        // protocol 2
        case PROTO:
            var proto = buffer.readUInt8(i++);
            if (proto != 2)
                throw 'Unhandled pickle protocol version: ' + proto;
            break;
        case TUPLE1:
            var a = this.stack.pop();
            this.stack.push([a]);
            break;
        case TUPLE2:
            var b = this.stack.pop()
              , a = this.stack.pop();
            this.stack.push([a, b]);
            break;
        case TUPLE3:
            var c = this.stack.pop()
              , b = this.stack.pop()
              , a = this.stack.pop();
            this.stack.push([a, b, c]);
            break;
        case NEWTRUE:
            this.stack.push(true);
            break;
        case NEWFALSE:
            this.stack.push(false);
            break;
        case LONG1:
            var length = buffer.readUInt8(i++);
            // FIXME: actually decode LONG1
            i += length;
            this.stack.push(0);
            break;
        case LONG4:
            var length = buffer.readUInt32LE(i);
            i += 4;
            // FIXME: actually decode LONG4
            i += length;
            this.stack.push(0);
            break;
        // protocol 0 and protocol 1
        case EMPTY_DICT:
            this.stack.push({});
            break;
        case EMPTY_LIST:
        case EMPTY_TUPLE:
            this.stack.push([]);
            break;
        case BINPUT:
            var index = buffer.readUInt8(i++);
            this.memo['' + index] = this.stack[this.stack.length-1];
            break;
        case GLOBAL:
            var module = buffer.readLine(i);
            i += module.length + 1;
            var name = buffer.readLine(i);
            i += name.length + 1;
            var func = emulated[module + '.' + name];
            if (func === undefined) {
                throw "Cannot emulate global: " + module + " " + name;
            }
            this.stack.push(func);
            break;
        case REDUCE:
            var args = this.stack.pop();
            var func = this.stack[this.stack.length - 1];
            this.stack[this.stack.length - 1] = func(args);
            break;
        case PUT:
            var index = buffer.readLine(i);
            i += index.length + 1;
            this.memo[index] = this.stack[this.stack.length-1];
            break;
        case INT:
            var value = buffer.readLine(i);
            i += value.length + 1;
            if (value == '01')
                this.stack.push(true);
            else if (value == '00')
                this.stack.push(false);
            else
                this.stack.push(parseInt(value));
            break;
        case BININT:
            this.stack.push(buffer.readInt32LE(i));
            i += 4;
            break;
        case BININT1:
            this.stack.push(buffer.readUInt8(i));
            i += 1;
            break;
        case BININT2:
            this.stack.push(buffer.readUInt16LE(i));
            i += 2;
            break;
        case MARK:
            this.stack.push(this.mark);
            break;
        case FLOAT:
            var value = buffer.readLine(i);
            i += value.length + 1;
            this.stack.push(parseFloat(value));
            break;
        case LONG:
            var value = buffer.readLine(i);
            i += value.length + 1;
            this.stack.push(parseInt(value));
            break;
        case BINFLOAT:
            this.stack.push(buffer.readDoubleBE(i));
            i += 8;
            break;
        case STRING:
            var value = buffer.readLine(i);
            i += value.length + 1;
            var quotes = "\"'";
            if (value[0] == "'") {
                if (value[value.length-1] != "'")
                    throw "insecure string pickle";
            } else if (value[0] = '"') {
                if (value[value.length-1] != '"')
                    throw "insecure string pickle";
            } else {
                throw "insecure string pickle";
            }
            this.stack.push(value.substr(1, value.length-2));
            break;
        case UNICODE:
            var value = buffer.readLine(i);
            i += value.length + 1;
            this.stack.push(value);
            break;
        case BINSTRING:
            var length = buffer.readUInt32LE(i);
            i += 4;
            this.stack.push(buffer.toString('binary', i, i + length));
            i += length;
            break;
        case SHORT_BINSTRING:
            var length = buffer.readUInt8(i++);
            this.stack.push(buffer.toString('binary', i, i + length));
            i += length;
            break;
        case BINUNICODE:
            var length = buffer.readUInt32LE(i);
            i += 4;
            this.stack.push(buffer.toString('utf8', i, i + length));
            i += length;
            break;
        case APPEND:
            var value = this.stack.pop();
            this.stack[this.stack.length-1].push(value);
            break;
        case APPENDS:
            var mark = this.marker(),
                list = this.stack[mark - 1];
            list.push.apply(list, this.stack.slice(mark + 1));
            this.stack = this.stack.slice(0, mark);
            break;
        case SETITEM:
            var value = this.stack.pop()
              , key = this.stack.pop();
            this.stack[this.stack.length-1][key] = value;
            break;
        case SETITEMS:
            var mark = this.marker()
              , obj = this.stack[mark - 1];
            for (var pos = mark + 1; pos < this.stack.length; pos += 2) {
                obj[this.stack[pos]] = this.stack[pos + 1];
            }
            this.stack = this.stack.slice(0, mark);
            break;
        case LIST:
        case TUPLE:
            var mark = this.marker()
              , list = this.stack.slice(mark + 1);
            this.stack = this.stack.slice(0, mark);
            this.stack.push(list);
            break;
        case DICT:
            var mark = this.marker()
                obj = {};
            for (var pos = mark + 1; pos < this.stack.length; pos += 2) {
                obj[this.stack[pos]] = this.stack[pos + 1];
            }
            this.stack = this.stack.slice(0, mark);
            this.stack.push(obj);
            break;
        case STOP:
            return this.stack.pop();
        default:
            throw "Unhandled opcode '" + opcode + "'";
        }
    }
};

Parser.prototype.marker = function(parser) {
    var k = this.stack.length - 1
    while (k > 0 && this.stack[k] !== this.mark) {
        --k;
    }
    return k;
};

module.exports.loads = function(data) {
    var parser = new Parser();
    return parser.load(data);
};
