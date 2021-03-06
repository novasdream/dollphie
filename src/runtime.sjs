// # module: runtime
//
// Provides the base runtime.

// -- Dependencies -----------------------------------------------------
var c = require('core.check');
var show = require('core.inspect');
var equal = require('deep-equal');
var { curry } = require('core.lambda');
var { Base } = require('boo');
var { List, Value:{ Applicative, Symbol, Lambda, Tagged } } = require('./data');
var { eval } = require('./eval');


// -- Helpers ----------------------------------------------------------

// ### function: assert
// @private
// @type: Validation[Violation, α] → α :: throws
function assert(val) {
  val.cata({
    Failure: λ(a) -> { throw new Error('Expected ' + show(a)) },
    Success: λ[#]
  })
}

// ### function: raise
// @private
// @type: Error -> Void :: throws
function raise(e) {
  throw e;
}

// ### function: unbox
// @private
// @type: String -> Tagged -> Any
unbox = curry(2, unbox);
function unbox(tag, val) {
  assert(tag(val));
  return val
}

var str = unbox(c.String);
var num = unbox(c.Number);
var bool = unbox(c.Boolean);


// -- Core environment -------------------------------------------------
var Env = module.exports = Base.derive({

  // --- Boolean operations --------------------------------------------
  not:
  Applicative(['value'], function(data) {
    return match data.value {
      false => true,
      []    => true,
      *     => false
    }
  }),

  'boolean?':
  Applicative(['value'], function(data) {
    return data.value === true || data.value === false
  }),

  // --- Numeric operations --------------------------------------------
  '+':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) + num(data.right)
  }),

  '-':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) + num(data.right)
  }),

  '*':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) * num(data.right)
  }),

  '/':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) / num(data.right)
  }),

  paragraph:
  Applicative(['value'], function(data) {
    return data.value
  }),

  text:
  Applicative(['value'], function(data) {
    return data.value
  }),
  
  // --- Comparison operations -----------------------------------------
  '=':
  Applicative(['left', 'right'], function(data) {
    return equal(data.left, data.right)
  }),
  
  '<':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) < num(data.right)
  }),

  '<=':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) <= num(data.right)
  }),

  '>':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) > num(data.right)
  }),

  '>=':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) >= num(data.right)
  }),

  
  // --- Symbol operations ---------------------------------------------
  name:
  Applicative(['value'], function(data) {
    return match data.value {
      Symbol(a) => a,
      a         => raise(new TypeError('Not a symbol: ' + show(a)))
    }
  }),

  
  // -- Vector operations ----------------------------------------------
  first:
  Applicative(['value'], function(data) {
    assert(c.Array(data.value));
    return data.value.length > 0?  data.value[0]
    :      /* otherwise */         []
  }),

  last:
  Applicative(['value'], function(data) {
    assert(c.Array(data.value));
    return data.value.length > 0?  data.value[data.value.length - 1]
    :      /* otherwise */         []
  }),

  nth:
  Applicative(['value', 'index'], function(data) {
    assert(c.Array(data.value));
    var i = num(data.index);
    if (i > data.value.length - 1) {
      throw new RangeError('Index out of bounds: ' + i);
    } else {
      return data.value[i]
    }
  }),


});

