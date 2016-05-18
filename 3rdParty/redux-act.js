(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ReduxAct = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = assignAll;
function assignAll(actions, stores) {
  if (Array.isArray(actions)) {
    return actions.map(function (action) {
      return action.assignTo(stores);
    });
  } else {
    return Object.keys(actions).reduce(function (assigns, action) {
      assigns[action] = actions[action].assignTo(stores);
      return assigns;
    }, {});
  }
};
},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createAction = require('./createAction');

var _createAction2 = _interopRequireDefault(_createAction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createAction2.default)('Batch', function () {
  for (var _len = arguments.length, actions = Array(_len), _key = 0; _key < _len; _key++) {
    actions[_key] = arguments[_key];
  }

  if (actions.length === 1 && Array.isArray(actions[0])) {
    return actions[0];
  }
  return actions;
});
},{"./createAction":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = bindAll;
function bindAll(actions, stores) {
  if (Array.isArray(actions)) {
    return actions.map(function (action) {
      return action.bindTo(stores);
    });
  } else {
    return Object.keys(actions).reduce(function (binds, action) {
      binds[action] = actions[action].bindTo(stores);
      return binds;
    }, {});
  }
};
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = createAction;

var _types = require('./types');

var id = 0;

var identity = function identity(arg) {
  return arg;
};

var undef = function undef() {
  return undefined;
};

var normalize = function normalize(dispatchOrStore) {
  if (dispatchOrStore && typeof dispatchOrStore.dispatch === 'function') {
    return dispatchOrStore.dispatch;
  } else {
    return dispatchOrStore;
  }
};

var normalizeAll = function normalizeAll(dispatchOrStores) {
  if (Array.isArray(dispatchOrStores)) {
    return dispatchOrStores.map(normalize);
  } else {
    return normalize(dispatchOrStores);
  }
};

function createAction(description, payloadReducer, metaReducer) {
  var _arguments2 = arguments;

  if (typeof description === 'function') {
    metaReducer = payloadReducer;
    payloadReducer = description;
    description = undefined;
  }

  if (typeof payloadReducer !== 'function') {
    payloadReducer = identity;
  }

  if (typeof metaReducer !== 'function') {
    metaReducer = undef;
  }

  var isSerializable = typeof description === 'string' && /^[A-Z_]+$/.test(description);

  if (isSerializable) {
    if ((0, _types.has)(description)) {
      throw new TypeError('Duplicate action type: ' + description);
    }

    (0, _types.add)(description);
  } else {
    ++id;
  }

  var type = isSerializable ? description : '[' + id + ']' + (description ? ' ' + description : '');

  var dispatchFunctions = undefined;

  function makeAction() {
    return {
      type: type,
      payload: payloadReducer.apply(undefined, arguments),
      meta: metaReducer.apply(undefined, arguments)
    };
  }

  var makeAndDispatch = function makeAndDispatch(dispatchs) {
    return function () {
      var _arguments = _arguments2;

      if (Array.isArray(dispatchs)) {
        var _ret = function () {
          var payloadedAction = makeAction.apply(undefined, _arguments);
          return {
            v: dispatchs.map(function (dispatch) {
              return dispatch(payloadedAction);
            })
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      } else if (dispatchs) {
        return dispatchs(makeAction.apply(undefined, arguments));
      } else {
        return makeAction.apply(undefined, arguments);
      }
    };
  };

  function actionCreator() {
    return makeAndDispatch(dispatchFunctions).apply(undefined, arguments);
  }

  actionCreator.getType = function () {
    return type;
  };
  actionCreator.toString = function () {
    return type;
  };

  actionCreator.raw = makeAction;

  actionCreator.assignTo = function (dispatchOrStores) {
    dispatchFunctions = normalizeAll(dispatchOrStores);
    return actionCreator;
  };

  actionCreator.assigned = function () {
    return !!dispatchFunctions;
  };
  actionCreator.bound = function () {
    return false;
  };
  actionCreator.binded = function () {
    if (console && console.warn) {
      console.warn('"binded" method is deprecated. It has been renamed to "bound" to fix a typo');
    }
    return false;
  };
  actionCreator.dispatched = actionCreator.assigned;

  actionCreator.bindTo = function (dispatchOrStores) {
    var boundActionCreator = makeAndDispatch(normalizeAll(dispatchOrStores));
    boundActionCreator.raw = makeAction;
    boundActionCreator.getType = actionCreator.getType;
    boundActionCreator.toString = actionCreator.toString;
    boundActionCreator.assignTo = function () {
      return boundActionCreator;
    };
    boundActionCreator.bindTo = function () {
      return boundActionCreator;
    };
    boundActionCreator.assigned = function () {
      return false;
    };
    boundActionCreator.bound = function () {
      return true;
    };
    boundActionCreator.binded = function () {
      if (console && console.warn) {
        console.warn('"binded" method is deprecated. It has been renamed to "bound" to fix a typo');
      }
      return true;
    };
    boundActionCreator.dispatched = boundActionCreator.bound;
    return boundActionCreator;
  };

  return actionCreator;
};
},{"./types":10}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createReducer;

var _batch = require('./batch');

var _batch2 = _interopRequireDefault(_batch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function normalizeType(typeOrActionCreator) {
  if (typeOrActionCreator && typeOrActionCreator.getType) {
    return typeOrActionCreator.toString();
  }
  return typeOrActionCreator;
}

function createReducer() {
  var handlers = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var defaultState = arguments[1];

  var opts = {
    payload: true
  };

  function has(typeOrActionCreator) {
    return !!handlers[normalizeType(typeOrActionCreator)];
  }

  function on(typeOrActionCreator, handler) {
    handlers[normalizeType(typeOrActionCreator)] = handler;
  }

  function off(typeOrActionCreator) {
    delete handlers[normalizeType(typeOrActionCreator)];
  }

  function options(newOpts) {
    Object.keys(newOpts).forEach(function (name) {
      return opts[name] = newOpts[name];
    });
  }

  if (typeof handlers === 'function') {
    var factory = handlers;
    handlers = {};
    factory(on, off);
  }

  if (!has(_batch2.default)) {
    on(_batch2.default, function (state, payload) {
      if (opts.payload) {
        return payload.reduce(reduce, state);
      } else {
        return payload.payload.reduce(reduce, state);
      }
    });
  }

  function reduce() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? defaultState : arguments[0];
    var action = arguments[1];

    if (action && handlers[action.type]) {
      if (opts.payload) {
        return handlers[action.type](state, action.payload, action.meta);
      } else {
        return handlers[action.type](state, action);
      }
    } else {
      return state;
    }
  };

  reduce.has = has;
  reduce.on = on;
  reduce.off = off;
  reduce.options = options;

  return reduce;
};
},{"./batch":2}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = disbatch;

var _batch = require('./batch');

var _batch2 = _interopRequireDefault(_batch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function disbatch(store) {
  for (var _len = arguments.length, actions = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    actions[_key - 1] = arguments[_key];
  }

  if (actions && actions.length > 0) {
    if (!store || typeof store !== 'function' && typeof store.dispatch !== 'function') {
      throw new TypeError('disbatch must take either a valid Redux store or a dispatch function as first parameter');
    }

    if (typeof store.dispatch === 'function') {
      store = store.dispatch;
    }

    // store is actually the dispatch function here
    return store(_batch2.default.apply(undefined, actions));
  } else {
    if (!store || typeof store.dispatch !== 'function') {
      throw new TypeError('disbatch must take a valid Redux store with a dispatch function as first parameter');
    }

    store.disbatch = disbatch.bind(undefined, store);
    return store;
  }
}
},{"./batch":2}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.types = exports.loggers = exports.disbatch = exports.batch = exports.bindAll = exports.assignAll = exports.createReducer = exports.createAction = undefined;

var _createAction = require('./createAction');

Object.defineProperty(exports, 'createAction', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_createAction).default;
  }
});

var _createReducer = require('./createReducer');

Object.defineProperty(exports, 'createReducer', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_createReducer).default;
  }
});

var _assignAll = require('./assignAll');

Object.defineProperty(exports, 'assignAll', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_assignAll).default;
  }
});

var _bindAll = require('./bindAll');

Object.defineProperty(exports, 'bindAll', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_bindAll).default;
  }
});

var _batch = require('./batch');

Object.defineProperty(exports, 'batch', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_batch).default;
  }
});

var _disbatch = require('./disbatch');

Object.defineProperty(exports, 'disbatch', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_disbatch).default;
  }
});

var _loggers = require('./loggers');

Object.defineProperty(exports, 'loggers', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_loggers).default;
  }
});

var _types2 = require('./types');

var _types = _interopRequireWildcard(_types2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var types = exports.types = _types;
},{"./assignAll":1,"./batch":2,"./bindAll":3,"./createAction":4,"./createReducer":5,"./disbatch":6,"./loggers":8,"./types":10}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reduxLogger = require('./reduxLogger');

var reduxLogger = _interopRequireWildcard(_reduxLogger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = {
  reduxLogger: reduxLogger
};
},{"./reduxLogger":9}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logger = undefined;
exports.actionTransformer = actionTransformer;

var _batch = require('../batch');

var _batch2 = _interopRequireDefault(_batch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var batchType = _batch2.default.getType();

function actionTransformer(action) {
  if (action && action.type === batchType) {
    action.payload.type = batchType;
    return action.payload;
  }
  return action;
}

var logger = exports.logger = {};

var _loop = function _loop(level) {
  if (typeof console[level] === 'function') {
    logger[level] = function levelFn() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var lastArg = args.pop();

      if (Array.isArray(lastArg) && lastArg.type === batchType) {
        lastArg.forEach(function (action) {
          console[level].apply(console, [].concat(args, [action]));
        });
      } else {
        args.push(lastArg);
        console[level].apply(console, args);
      }
    };
  }
};

for (var level in console) {
  _loop(level);
}
},{"../batch":2}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.add = add;
exports.remove = remove;
exports.has = has;
exports.all = all;
exports.clear = clear;
var types = {};

function add(name) {
  types[name] = true;
}

function remove(name) {
  types[name] = false;
}

function has(name) {
  return !!types[name];
}

function all() {
  return Object.keys(types).filter(has);
}

function clear() {
  all().forEach(remove);
}
},{}]},{},[7])(7)
});