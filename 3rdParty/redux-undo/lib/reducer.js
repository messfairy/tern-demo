'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = undoable;

var _debug = require('./debug');

var debug = _interopRequireWildcard(_debug);

var _actions = require('./actions');

var _helpers = require('./helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// length: get length of history
function length(history) {
  var past = history.past;
  var future = history.future;

  return past.length + 1 + future.length;
}

// insert: insert `state` into history, which means adding the current state
//         into `past`, setting the new `state` as `present` and erasing
//         the `future`.
function insert(history, state, limit) {
  debug.log('inserting', state);
  debug.log('new free: ', limit - length(history));

  var past = history.past;
  var present = history.present;

  var historyOverflow = limit && length(history) >= limit;

  var newPast = history.wasFiltered ? past // if the last `present` was filtered, don't store it in the history
  : [].concat(_toConsumableArray(past.slice(historyOverflow ? 1 : 0)), [present]);

  return {
    past: newPast,
    present: state,
    future: []
  };
}

// undo: go back to the previous point in history
function undo(history) {
  var past = history.past;
  var present = history.present;
  var future = history.future;


  if (past.length <= 0) return history;

  var newFuture = history.wasFiltered ? future // if the last `present` was filtered, don't store it in the future
  : [present].concat(_toConsumableArray(future));

  return {
    past: past.slice(0, past.length - 1), // remove last element from past
    present: past[past.length - 1], // set element as new present
    future: newFuture
  };
}

// redo: go to the next point in history
function redo(history) {
  var past = history.past;
  var present = history.present;
  var future = history.future;


  if (future.length <= 0) return history;

  return {
    future: future.slice(1, future.length), // remove element from future
    present: future[0], // set element as new present
    past: [].concat(_toConsumableArray(past), [present // old present state is in the past now
    ])
  };
}

// jumpToFuture: jump to requested index in future history
function jumpToFuture(history, index) {
  if (index === 0) return redo(history);
  if (index < 0 || index >= history.future.length) return history;

  var past = history.past;
  var present = history.present;
  var future = history.future;


  return {
    future: future.slice(index + 1),
    present: future[index],
    past: past.concat([present]).concat(future.slice(0, index))
  };
}

// jumpToPast: jump to requested index in past history
function jumpToPast(history, index) {
  if (index === history.past.length - 1) return undo(history);
  if (index < 0 || index >= history.past.length) return history;

  var past = history.past;
  var present = history.present;
  var future = history.future;


  return {
    future: past.slice(index + 1).concat([present]).concat(future),
    present: past[index],
    past: past.slice(0, index)
  };
}

// jump: jump n steps in the past or forward
function jump(history, n) {
  if (n > 0) return jumpToFuture(history, n - 1);
  if (n < 0) return jumpToPast(history, history.past.length + n);
  return history;
}

// createHistory
function createHistory(state) {
  return {
    past: [],
    present: state,
    future: []
  };
}

// redux-undo higher order reducer
function undoable(reducer) {
  var rawConfig = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  debug.set(rawConfig.debug);

  var config = {
    initTypes: (0, _helpers.parseActions)(rawConfig.initTypes, ['@@redux-undo/INIT']),
    limit: rawConfig.limit,
    filter: rawConfig.filter || function () {
      return true;
    },
    undoType: rawConfig.undoType || _actions.ActionTypes.UNDO,
    redoType: rawConfig.redoType || _actions.ActionTypes.REDO,
    jumpToPastType: rawConfig.jumpToPastType || _actions.ActionTypes.JUMP_TO_PAST,
    jumpToFutureType: rawConfig.jumpToFutureType || _actions.ActionTypes.JUMP_TO_FUTURE,
    jumpType: rawConfig.jumpType || _actions.ActionTypes.JUMP,
    clearHistoryType: rawConfig.clearHistoryType || _actions.ActionTypes.CLEAR_HISTORY
  };

  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? config.history : arguments[0];
    var action = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    debug.start(action, state);

    var history = state;
    if (!config.history) {
      debug.log('history is uninitialized');

      if (state === undefined) {
        history = createHistory(reducer(state, {}));
        debug.log('do not initialize on probe actions');
      } else if ((0, _helpers.isHistory)(state)) {
        history = config.history = state;
        debug.log('initialHistory initialized: initialState is a history', config.history);
      } else {
        history = config.history = createHistory(state);
        debug.log('initialHistory initialized: initialState is not a history', config.history);
      }
    }

    var res = void 0;
    switch (action.type) {
      case undefined:
        return history;

      case config.undoType:
        res = undo(history);
        debug.log('perform undo');
        debug.end(res);
        return res;

      case config.redoType:
        res = redo(history);
        debug.log('perform redo');
        debug.end(res);
        return res;

      case config.jumpToPastType:
        res = jumpToPast(history, action.index);
        debug.log('perform jumpToPast to ' + action.index);
        debug.end(res);
        return res;

      case config.jumpToFutureType:
        res = jumpToFuture(history, action.index);
        debug.log('perform jumpToFuture to ' + action.index);
        debug.end(res);
        return res;

      case config.jumpType:
        res = jump(history, action.index);
        debug.log('perform jump to ' + action.index);
        debug.end(res);
        return res;

      case config.clearHistoryType:
        res = createHistory(history.present);
        debug.log('perform clearHistory');
        debug.end(res);
        return res;

      default:
        res = reducer(history.present, action);

        if (config.initTypes.some(function (actionType) {
          return actionType === action.type;
        })) {
          debug.log('reset history due to init action');
          debug.end(config.history);
          return config.history;
        }

        if (history.present === res) {
          // Don't handle this action. Do not call debug.end here,
          // because this action should not produce side effects to the console
          return history;
        }

        // insert before filtering because the previous action might not have
        // been filtered and `insert` checks for `wasFiltered` anyway
        history = insert(history, res, config.limit);

        if (typeof config.filter === 'function' && !config.filter(action, res, history)) {
          var nextState = _extends({}, history, {
            wasFiltered: true,
            present: res
          });
          debug.log('filter prevented action, not storing it');
          debug.end(nextState);
          return nextState;
        }

        debug.log('inserted new state into history');
        debug.end(history);
        return history;
    }
  };
}