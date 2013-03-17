var Parser = function() {
    this.mark = 'THIS-NEEDS-TO-BE-UNIQUE-TO-SERVE-AS-A-BOUNDARY';
    this.memo = {};
    this.stack = [];
};

Parser.prototype.load = function(pickle) {
    var INT = 'I'               // push integer or bool; decimal string argument
      , BININT = 'J'            // push 4-byte unsigned int
      , BININT1 = 'K'           // push 1-byte unsigned int
      , BININT2 = 'M'           // push 2-byte unsigned int
      , BINPUT = 'q'            // store stack top in memo; index is string 1-byte arg
      , BINSTRING = 'T'
      , DICT = 'd'
      , EMPTY_DICT = '}'
      , FLOAT = 'F'
      , MARK = '('
      , PROTO = '\x80'
      , PUT = 'p'
      , SETITEM = 's'
      , SETITEMS = 'u'
      , SHORT_BINSTRING = 'U'
      , STOP = '.'
      , STRING = 'S';

    function readline(pickle, i) {
        var index = pickle.indexOf('\n', i);
        if (index == -1)
            throw "Could not find end of line";
        return pickle.substr(i, index - i);
    }

    for (var i = 0; i < pickle.length; ) {
        var opindex = i
          , opcode = pickle[i++];
        //console.log('opcode ' + opindex + ' ' + opcode);
        switch (opcode) {
        case PROTO:
            var proto = pickle.charCodeAt(i++);
            if (proto != 2)
                throw 'Unhandled pickle protocol version';
            break;
        case EMPTY_DICT:
            this.stack.push({});
            break;
        case BINPUT:
            var index = pickle.charCodeAt(i++);
            this.memo['' + index] = this.stack[this.stack.length-1];
            break;
        case PUT:
            var index = readline(pickle, i);
            i += index.length + 1;
            this.memo[index] = this.stack[this.stack.length-1];
            break;
        case INT:
            var value = readline(pickle, i);
            i += value.length + 1;
            this.stack.push(parseInt(value));
            break;
        case BININT:
            var value = pickle.charCodeAt(i++)
                      + (pickle.charCodeAt(i++) << 8)
                      + (pickle.charCodeAt(i++) << 16)
                      + (pickle.charCodeAt(i++) << 24);
            this.stack.push(value);
            break;
        case BININT1:
            var value = pickle.charCodeAt(i++);
            this.stack.push(value);
            break;
        case BININT2:
            var value = pickle.charCodeAt(i++)
                      + (pickle.charCodeAt(i++) << 8);
            this.stack.push(value);
            break;
        case MARK:
            this.stack.push(this.mark);
            break;
        case FLOAT:
            var value = readline(pickle, i);
            i += value.length + 1;
            this.stack.push(parseFloat(value));
            break;
        case STRING:
            var value = readline(pickle, i);
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
        case BINSTRING:
            var length = pickle.charCodeAt(i++)
                      + (pickle.charCodeAt(i++) << 8)
                      + (pickle.charCodeAt(i++) << 16)
                      + (pickle.charCodeAt(i++) << 24);
            var value = pickle.substr(i, length);
            i += length;
            this.stack.push(value);
            break;
        case SHORT_BINSTRING:
            var length = pickle.charCodeAt(i++);
            var value = pickle.substr(i, length);
            i += length;
            this.stack.push(value);
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
