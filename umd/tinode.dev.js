(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Tinode = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classStaticPrivateMethodGet(receiver, classConstructor, method) { _classCheckPrivateStaticAccess(receiver, classConstructor); return method; }

function _classCheckPrivateStaticAccess(receiver, classConstructor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } }

class AccessMode {
  constructor(acs) {
    if (acs) {
      this.given = typeof acs.given == 'number' ? acs.given : AccessMode.decode(acs.given);
      this.want = typeof acs.want == 'number' ? acs.want : AccessMode.decode(acs.want);
      this.mode = acs.mode ? typeof acs.mode == 'number' ? acs.mode : AccessMode.decode(acs.mode) : this.given & this.want;
    }
  }

  static decode(str) {
    if (!str) {
      return null;
    } else if (typeof str == 'number') {
      return str & AccessMode._BITMASK;
    } else if (str === 'N' || str === 'n') {
      return AccessMode._NONE;
    }

    const bitmask = {
      'J': AccessMode._JOIN,
      'R': AccessMode._READ,
      'W': AccessMode._WRITE,
      'P': AccessMode._PRES,
      'A': AccessMode._APPROVE,
      'S': AccessMode._SHARE,
      'D': AccessMode._DELETE,
      'O': AccessMode._OWNER
    };
    let m0 = AccessMode._NONE;

    for (let i = 0; i < str.length; i++) {
      const bit = bitmask[str.charAt(i).toUpperCase()];

      if (!bit) {
        continue;
      }

      m0 |= bit;
    }

    return m0;
  }

  static encode(val) {
    if (val === null || val === AccessMode._INVALID) {
      return null;
    } else if (val === AccessMode._NONE) {
      return 'N';
    }

    const bitmask = ['J', 'R', 'W', 'P', 'A', 'S', 'D', 'O'];
    let res = '';

    for (let i = 0; i < bitmask.length; i++) {
      if ((val & 1 << i) != 0) {
        res = res + bitmask[i];
      }
    }

    return res;
  }

  static update(val, upd) {
    if (!upd || typeof upd != 'string') {
      return val;
    }

    let action = upd.charAt(0);

    if (action == '+' || action == '-') {
      let val0 = val;
      const parts = upd.split(/([-+])/);

      for (let i = 1; i < parts.length - 1; i += 2) {
        action = parts[i];
        const m0 = AccessMode.decode(parts[i + 1]);

        if (m0 == AccessMode._INVALID) {
          return val;
        }

        if (m0 == null) {
          continue;
        }

        if (action === '+') {
          val0 |= m0;
        } else if (action === '-') {
          val0 &= ~m0;
        }
      }

      val = val0;
    } else {
      const val0 = AccessMode.decode(upd);

      if (val0 != AccessMode._INVALID) {
        val = val0;
      }
    }

    return val;
  }

  static diff(a1, a2) {
    a1 = AccessMode.decode(a1);
    a2 = AccessMode.decode(a2);

    if (a1 == AccessMode._INVALID || a2 == AccessMode._INVALID) {
      return AccessMode._INVALID;
    }

    return a1 & ~a2;
  }

  toString() {
    return '{"mode": "' + AccessMode.encode(this.mode) + '", "given": "' + AccessMode.encode(this.given) + '", "want": "' + AccessMode.encode(this.want) + '"}';
  }

  jsonHelper() {
    return {
      mode: AccessMode.encode(this.mode),
      given: AccessMode.encode(this.given),
      want: AccessMode.encode(this.want)
    };
  }

  setMode(m) {
    this.mode = AccessMode.decode(m);
    return this;
  }

  updateMode(u) {
    this.mode = AccessMode.update(this.mode, u);
    return this;
  }

  getMode() {
    return AccessMode.encode(this.mode);
  }

  setGiven(g) {
    this.given = AccessMode.decode(g);
    return this;
  }

  updateGiven(u) {
    this.given = AccessMode.update(this.given, u);
    return this;
  }

  getGiven() {
    return AccessMode.encode(this.given);
  }

  setWant(w) {
    this.want = AccessMode.decode(w);
    return this;
  }

  updateWant(u) {
    this.want = AccessMode.update(this.want, u);
    return this;
  }

  getWant() {
    return AccessMode.encode(this.want);
  }

  getMissing() {
    return AccessMode.encode(this.want & ~this.given);
  }

  getExcessive() {
    return AccessMode.encode(this.given & ~this.want);
  }

  updateAll(val) {
    if (val) {
      this.updateGiven(val.given);
      this.updateWant(val.want);
      this.mode = this.given & this.want;
    }

    return this;
  }

  isOwner(side) {
    return _classStaticPrivateMethodGet(AccessMode, AccessMode, _checkFlag).call(AccessMode, this, side, AccessMode._OWNER);
  }

  isPresencer(side) {
    return _classStaticPrivateMethodGet(AccessMode, AccessMode, _checkFlag).call(AccessMode, this, side, AccessMode._PRES);
  }

  isMuted(side) {
    return !this.isPresencer(side);
  }

  isJoiner(side) {
    return _classStaticPrivateMethodGet(AccessMode, AccessMode, _checkFlag).call(AccessMode, this, side, AccessMode._JOIN);
  }

  isReader(side) {
    return _classStaticPrivateMethodGet(AccessMode, AccessMode, _checkFlag).call(AccessMode, this, side, AccessMode._READ);
  }

  isWriter(side) {
    return _classStaticPrivateMethodGet(AccessMode, AccessMode, _checkFlag).call(AccessMode, this, side, AccessMode._WRITE);
  }

  isApprover(side) {
    return _classStaticPrivateMethodGet(AccessMode, AccessMode, _checkFlag).call(AccessMode, this, side, AccessMode._APPROVE);
  }

  isAdmin(side) {
    return this.isOwner(side) || this.isApprover(side);
  }

  isSharer(side) {
    return this.isAdmin(side) || _classStaticPrivateMethodGet(AccessMode, AccessMode, _checkFlag).call(AccessMode, this, side, AccessMode._SHARE);
  }

  isDeleter(side) {
    return _classStaticPrivateMethodGet(AccessMode, AccessMode, _checkFlag).call(AccessMode, this, side, AccessMode._DELETE);
  }

}

exports.default = AccessMode;

function _checkFlag(val, side, flag) {
  side = side || 'mode';

  if (['given', 'want', 'mode'].includes(side)) {
    return (val[side] & flag) != 0;
  }

  throw new Error("Invalid AccessMode component '".concat(side, "'"));
}

AccessMode._NONE = 0x00;
AccessMode._JOIN = 0x01;
AccessMode._READ = 0x02;
AccessMode._WRITE = 0x04;
AccessMode._PRES = 0x08;
AccessMode._APPROVE = 0x10;
AccessMode._SHARE = 0x20;
AccessMode._DELETE = 0x40;
AccessMode._OWNER = 0x80;
AccessMode._BITMASK = AccessMode._JOIN | AccessMode._READ | AccessMode._WRITE | AccessMode._PRES | AccessMode._APPROVE | AccessMode._SHARE | AccessMode._DELETE | AccessMode._OWNER;
AccessMode._INVALID = 0x100000;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

var _comparator = new WeakMap();

var _unique = new WeakMap();

var _findNearest = new WeakSet();

var _insertSorted = new WeakSet();

class CBuffer {
  constructor(compare_, unique_) {
    _classPrivateMethodInitSpec(this, _insertSorted);

    _classPrivateMethodInitSpec(this, _findNearest);

    _classPrivateFieldInitSpec(this, _comparator, {
      writable: true,
      value: undefined
    });

    _classPrivateFieldInitSpec(this, _unique, {
      writable: true,
      value: false
    });

    _defineProperty(this, "buffer", []);

    _classPrivateFieldSet(this, _comparator, compare_ || ((a, b) => {
      return a === b ? 0 : a < b ? -1 : 1;
    }));

    _classPrivateFieldSet(this, _unique, unique_);
  }

  getAt(at) {
    return this.buffer[at];
  }

  getLast(at) {
    at |= 0;
    return this.buffer.length > at ? this.buffer[this.buffer.length - 1 - at] : undefined;
  }

  put() {
    let insert;

    if (arguments.length == 1 && Array.isArray(arguments[0])) {
      insert = arguments[0];
    } else {
      insert = arguments;
    }

    for (let idx in insert) {
      _classPrivateMethodGet(this, _insertSorted, _insertSorted2).call(this, insert[idx], this.buffer);
    }
  }

  delAt(at) {
    at |= 0;
    let r = this.buffer.splice(at, 1);

    if (r && r.length > 0) {
      return r[0];
    }

    return undefined;
  }

  delRange(since, before) {
    return this.buffer.splice(since, before - since);
  }

  length() {
    return this.buffer.length;
  }

  reset() {
    this.buffer = [];
  }

  forEach(callback, startIdx, beforeIdx, context) {
    startIdx = startIdx | 0;
    beforeIdx = beforeIdx || this.buffer.length;

    for (let i = startIdx; i < beforeIdx; i++) {
      callback.call(context, this.buffer[i], i > startIdx ? this.buffer[i - 1] : undefined, i < beforeIdx - 1 ? this.buffer[i + 1] : undefined, i);
    }
  }

  find(elem, nearest) {
    const {
      idx
    } = _classPrivateMethodGet(this, _findNearest, _findNearest2).call(this, elem, this.buffer, !nearest);

    return idx;
  }

  filter(callback, context) {
    let count = 0;

    for (let i = 0; i < this.buffer.length; i++) {
      if (callback.call(context, this.buffer[i], i)) {
        this.buffer[count] = this.buffer[i];
        count++;
      }
    }

    this.buffer.splice(count);
  }

}

exports.default = CBuffer;

function _findNearest2(elem, arr, exact) {
  let start = 0;
  let end = arr.length - 1;
  let pivot = 0;
  let diff = 0;
  let found = false;

  while (start <= end) {
    pivot = (start + end) / 2 | 0;
    diff = _classPrivateFieldGet(this, _comparator).call(this, arr[pivot], elem);

    if (diff < 0) {
      start = pivot + 1;
    } else if (diff > 0) {
      end = pivot - 1;
    } else {
      found = true;
      break;
    }
  }

  if (found) {
    return {
      idx: pivot,
      exact: true
    };
  }

  if (exact) {
    return {
      idx: -1
    };
  }

  return {
    idx: diff < 0 ? pivot + 1 : pivot
  };
}

function _insertSorted2(elem, arr) {
  const found = _classPrivateMethodGet(this, _findNearest, _findNearest2).call(this, elem, arr, false);

  const count = found.exact && _classPrivateFieldGet(this, _unique) ? 1 : 0;
  arr.splice(found.idx, count, elem);
  return arr;
}

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VERSION = exports.USER_NEW = exports.TOPIC_SYS = exports.TOPIC_P2P = exports.TOPIC_NEW_CHAN = exports.TOPIC_NEW = exports.TOPIC_ME = exports.TOPIC_GRP = exports.TOPIC_FND = exports.TOPIC_CHAN = exports.PROTOCOL_VERSION = exports.MESSAGE_STATUS_TO_ME = exports.MESSAGE_STATUS_SENT = exports.MESSAGE_STATUS_SENDING = exports.MESSAGE_STATUS_RECEIVED = exports.MESSAGE_STATUS_READ = exports.MESSAGE_STATUS_QUEUED = exports.MESSAGE_STATUS_NONE = exports.MESSAGE_STATUS_FAILED = exports.MESSAGE_STATUS_DEL_RANGE = exports.LOCAL_SEQID = exports.LIBRARY = exports.EXPIRE_PROMISES_TIMEOUT = exports.EXPIRE_PROMISES_PERIOD = exports.DEL_CHAR = exports.DEFAULT_MESSAGES_PAGE = void 0;

var _version = require("../version.json");

const PROTOCOL_VERSION = '0';
exports.PROTOCOL_VERSION = PROTOCOL_VERSION;
const VERSION = _version.version || '0.18';
exports.VERSION = VERSION;
const LIBRARY = 'tinodejs/' + VERSION;
exports.LIBRARY = LIBRARY;
const TOPIC_NEW = 'new';
exports.TOPIC_NEW = TOPIC_NEW;
const TOPIC_NEW_CHAN = 'nch';
exports.TOPIC_NEW_CHAN = TOPIC_NEW_CHAN;
const TOPIC_ME = 'me';
exports.TOPIC_ME = TOPIC_ME;
const TOPIC_FND = 'fnd';
exports.TOPIC_FND = TOPIC_FND;
const TOPIC_SYS = 'sys';
exports.TOPIC_SYS = TOPIC_SYS;
const TOPIC_CHAN = 'chn';
exports.TOPIC_CHAN = TOPIC_CHAN;
const TOPIC_GRP = 'grp;';
exports.TOPIC_GRP = TOPIC_GRP;
const TOPIC_P2P = 'p2p';
exports.TOPIC_P2P = TOPIC_P2P;
const USER_NEW = 'new';
exports.USER_NEW = USER_NEW;
const LOCAL_SEQID = 0xFFFFFFF;
exports.LOCAL_SEQID = LOCAL_SEQID;
const MESSAGE_STATUS_NONE = 0;
exports.MESSAGE_STATUS_NONE = MESSAGE_STATUS_NONE;
const MESSAGE_STATUS_QUEUED = 1;
exports.MESSAGE_STATUS_QUEUED = MESSAGE_STATUS_QUEUED;
const MESSAGE_STATUS_SENDING = 2;
exports.MESSAGE_STATUS_SENDING = MESSAGE_STATUS_SENDING;
const MESSAGE_STATUS_FAILED = 3;
exports.MESSAGE_STATUS_FAILED = MESSAGE_STATUS_FAILED;
const MESSAGE_STATUS_SENT = 4;
exports.MESSAGE_STATUS_SENT = MESSAGE_STATUS_SENT;
const MESSAGE_STATUS_RECEIVED = 5;
exports.MESSAGE_STATUS_RECEIVED = MESSAGE_STATUS_RECEIVED;
const MESSAGE_STATUS_READ = 6;
exports.MESSAGE_STATUS_READ = MESSAGE_STATUS_READ;
const MESSAGE_STATUS_TO_ME = 7;
exports.MESSAGE_STATUS_TO_ME = MESSAGE_STATUS_TO_ME;
const MESSAGE_STATUS_DEL_RANGE = 8;
exports.MESSAGE_STATUS_DEL_RANGE = MESSAGE_STATUS_DEL_RANGE;
const EXPIRE_PROMISES_TIMEOUT = 5000;
exports.EXPIRE_PROMISES_TIMEOUT = EXPIRE_PROMISES_TIMEOUT;
const EXPIRE_PROMISES_PERIOD = 1000;
exports.EXPIRE_PROMISES_PERIOD = EXPIRE_PROMISES_PERIOD;
const DEFAULT_MESSAGES_PAGE = 24;
exports.DEFAULT_MESSAGES_PAGE = DEFAULT_MESSAGES_PAGE;
const DEL_CHAR = '\u2421';
exports.DEL_CHAR = DEL_CHAR;

},{"../version.json":12}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = require("./utils.js");

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

let WebSocketProvider;
let XHRProvider;
const NETWORK_ERROR = 503;
const NETWORK_ERROR_TEXT = "Connection failed";
const NETWORK_USER = 418;
const NETWORK_USER_TEXT = "Disconnected by client";
const _BOFF_BASE = 2000;
const _BOFF_MAX_ITER = 10;
const _BOFF_JITTER = 0.3;

function makeBaseUrl(host, protocol, version, apiKey) {
  let url = null;

  if (['http', 'https', 'ws', 'wss'].includes(protocol)) {
    url = "".concat(protocol, "://").concat(host);

    if (url.charAt(url.length - 1) !== '/') {
      url += '/';
    }

    url += 'v' + version + '/channels';

    if (['http', 'https'].includes(protocol)) {
      url += '/lp';
    }

    url += '?apikey=' + apiKey;
  }

  return url;
}

var _boffTimer = new WeakMap();

var _boffIteration = new WeakMap();

var _boffClosed = new WeakMap();

var _socket = new WeakMap();

var _log = new WeakSet();

var _boffReconnect = new WeakSet();

var _boffStop = new WeakSet();

var _boffReset = new WeakSet();

var _init_lp = new WeakSet();

var _init_ws = new WeakSet();

class Connection {
  constructor(config, version_, autoreconnect_) {
    _classPrivateMethodInitSpec(this, _init_ws);

    _classPrivateMethodInitSpec(this, _init_lp);

    _classPrivateMethodInitSpec(this, _boffReset);

    _classPrivateMethodInitSpec(this, _boffStop);

    _classPrivateMethodInitSpec(this, _boffReconnect);

    _classPrivateMethodInitSpec(this, _log);

    _classPrivateFieldInitSpec(this, _boffTimer, {
      writable: true,
      value: null
    });

    _classPrivateFieldInitSpec(this, _boffIteration, {
      writable: true,
      value: 0
    });

    _classPrivateFieldInitSpec(this, _boffClosed, {
      writable: true,
      value: false
    });

    _classPrivateFieldInitSpec(this, _socket, {
      writable: true,
      value: null
    });

    _defineProperty(this, "host", void 0);

    _defineProperty(this, "secure", void 0);

    _defineProperty(this, "apiKey", void 0);

    _defineProperty(this, "version", void 0);

    _defineProperty(this, "autoreconnect", void 0);

    _defineProperty(this, "initialized", void 0);

    _defineProperty(this, "onMessage", undefined);

    _defineProperty(this, "onDisconnect", undefined);

    _defineProperty(this, "onOpen", undefined);

    _defineProperty(this, "onAutoreconnectIteration", undefined);

    _defineProperty(this, "logger", undefined);

    this.host = config.host;
    this.secure = config.secure;
    this.apiKey = config.apiKey;
    this.version = version_;
    this.autoreconnect = autoreconnect_;

    if (config.transport === 'lp') {
      _classPrivateMethodGet(this, _init_lp, _init_lp2).call(this);

      this.initialized = 'lp';
    } else if (config.transport === 'ws') {
      _classPrivateMethodGet(this, _init_ws, _init_ws2).call(this);

      this.initialized = 'ws';
    }

    if (!this.initialized) {
      _classPrivateMethodGet(this, _log, _log2).call(this, "Unknown or invalid network transport. Running under Node? Call 'Tinode.setNetworkProviders()'.");

      throw new Error("Unknown or invalid network transport. Running under Node? Call 'Tinode.setNetworkProviders()'.");
    }
  }

  static setNetworkProviders(wsProvider, xhrProvider) {
    WebSocketProvider = wsProvider;
    XHRProvider = xhrProvider;
  }

  connect(host_, force) {
    return Promise.reject(null);
  }

  reconnect(force) {}

  disconnect() {}

  sendText(msg) {}

  isConnected() {
    return false;
  }

  transport() {
    return this.initialized;
  }

  probe() {
    this.sendText('1');
  }

  backoffReset() {
    _classPrivateMethodGet(this, _boffReset, _boffReset2).call(this);
  }

}

exports.default = Connection;

function _log2(text) {
  if (Connection.logger) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    Connection.logger(text, ...args);
  }
}

function _boffReconnect2() {
  clearTimeout(_classPrivateFieldGet(this, _boffTimer));

  const timeout = _BOFF_BASE * (Math.pow(2, _classPrivateFieldGet(this, _boffIteration)) * (1.0 + _BOFF_JITTER * Math.random()));

  _classPrivateFieldSet(this, _boffIteration, _classPrivateFieldGet(this, _boffIteration) >= _BOFF_MAX_ITER ? _classPrivateFieldGet(this, _boffIteration) : _classPrivateFieldGet(this, _boffIteration) + 1);

  if (this.onAutoreconnectIteration) {
    this.onAutoreconnectIteration(timeout);
  }

  _classPrivateFieldSet(this, _boffTimer, setTimeout(() => {
    _classPrivateMethodGet(this, _log, _log2).call(this, "Reconnecting, iter=".concat(_classPrivateFieldGet(this, _boffIteration), ", timeout=").concat(timeout));

    if (!_classPrivateFieldGet(this, _boffClosed)) {
      const prom = this.connect();

      if (this.onAutoreconnectIteration) {
        this.onAutoreconnectIteration(0, prom);
      } else {
        prom.catch(() => {});
      }
    } else if (this.onAutoreconnectIteration) {
      this.onAutoreconnectIteration(-1);
    }
  }, timeout));
}

function _boffStop2() {
  clearTimeout(_classPrivateFieldGet(this, _boffTimer));

  _classPrivateFieldSet(this, _boffTimer, null);
}

function _boffReset2() {
  _classPrivateFieldSet(this, _boffIteration, 0);
}

function _init_lp2() {
  const XDR_UNSENT = 0;
  const XDR_OPENED = 1;
  const XDR_HEADERS_RECEIVED = 2;
  const XDR_LOADING = 3;
  const XDR_DONE = 4;
  let _lpURL = null;
  let _poller = null;
  let _sender = null;

  let lp_sender = url_ => {
    const sender = new XHRProvider();

    sender.onreadystatechange = evt => {
      if (sender.readyState == XDR_DONE && sender.status >= 400) {
        throw new Error("LP sender failed, ".concat(sender.status));
      }
    };

    sender.open('POST', url_, true);
    return sender;
  };

  let lp_poller = (url_, resolve, reject) => {
    let poller = new XHRProvider();
    let promiseCompleted = false;

    poller.onreadystatechange = evt => {
      if (poller.readyState == XDR_DONE) {
        if (poller.status == 201) {
          let pkt = JSON.parse(poller.responseText, _utils.jsonParseHelper);
          _lpURL = url_ + '&sid=' + pkt.ctrl.params.sid;
          poller = lp_poller(_lpURL);
          poller.send(null);

          if (this.onOpen) {
            this.onOpen();
          }

          if (resolve) {
            promiseCompleted = true;
            resolve();
          }

          if (this.autoreconnect) {
            _classPrivateMethodGet(this, _boffStop, _boffStop2).call(this);
          }
        } else if (poller.status < 400) {
          if (this.onMessage) {
            this.onMessage(poller.responseText);
          }

          poller = lp_poller(_lpURL);
          poller.send(null);
        } else {
          if (reject && !promiseCompleted) {
            promiseCompleted = true;
            reject(poller.responseText);
          }

          if (this.onMessage && poller.responseText) {
            this.onMessage(poller.responseText);
          }

          if (this.onDisconnect) {
            const code = poller.status || (_classPrivateFieldGet(this, _boffClosed) ? NETWORK_USER : NETWORK_ERROR);
            const text = poller.responseText || (_classPrivateFieldGet(this, _boffClosed) ? NETWORK_USER_TEXT : NETWORK_ERROR_TEXT);
            this.onDisconnect(new Error(text + ' (' + code + ')'), code);
          }

          poller = null;

          if (!_classPrivateFieldGet(this, _boffClosed) && this.autoreconnect) {
            _classPrivateMethodGet(this, _boffReconnect, _boffReconnect2).call(this);
          }
        }
      }
    };

    poller.open('POST', url_, true);
    return poller;
  };

  this.connect = (host_, force) => {
    _classPrivateFieldSet(this, _boffClosed, false);

    if (_poller) {
      if (!force) {
        return Promise.resolve();
      }

      _poller.onreadystatechange = undefined;

      _poller.abort();

      _poller = null;
    }

    if (host_) {
      this.host = host_;
    }

    return new Promise((resolve, reject) => {
      const url = makeBaseUrl(this.host, this.secure ? 'https' : 'http', this.version, this.apiKey);

      _classPrivateMethodGet(this, _log, _log2).call(this, "LP connecting to:", url);

      _poller = lp_poller(url, resolve, reject);

      _poller.send(null);
    }).catch(err => {
      _classPrivateMethodGet(this, _log, _log2).call(this, "LP connection failed:", err);
    });
  };

  this.reconnect = force => {
    _classPrivateMethodGet(this, _boffStop, _boffStop2).call(this);

    this.connect(null, force);
  };

  this.disconnect = () => {
    _classPrivateFieldSet(this, _boffClosed, true);

    _classPrivateMethodGet(this, _boffStop, _boffStop2).call(this);

    if (_sender) {
      _sender.onreadystatechange = undefined;

      _sender.abort();

      _sender = null;
    }

    if (_poller) {
      _poller.onreadystatechange = undefined;

      _poller.abort();

      _poller = null;
    }

    if (this.onDisconnect) {
      this.onDisconnect(new Error(NETWORK_USER_TEXT + ' (' + NETWORK_USER + ')'), NETWORK_USER);
    }

    _lpURL = null;
  };

  this.sendText = msg => {
    _sender = lp_sender(_lpURL);

    if (_sender && _sender.readyState == XDR_OPENED) {
      _sender.send(msg);
    } else {
      throw new Error("Long poller failed to connect");
    }
  };

  this.isConnected = () => {
    return _poller && true;
  };
}

function _init_ws2() {
  this.connect = (host_, force) => {
    _classPrivateFieldSet(this, _boffClosed, false);

    if (_classPrivateFieldGet(this, _socket)) {
      if (!force && _classPrivateFieldGet(this, _socket).readyState == _classPrivateFieldGet(this, _socket).OPEN) {
        return Promise.resolve();
      }

      _classPrivateFieldGet(this, _socket).close();

      _classPrivateFieldSet(this, _socket, null);
    }

    if (host_) {
      this.host = host_;
    }

    return new Promise((resolve, reject) => {
      const url = makeBaseUrl(this.host, this.secure ? 'wss' : 'ws', this.version, this.apiKey);

      _classPrivateMethodGet(this, _log, _log2).call(this, "WS connecting to: ", url);

      const conn = new WebSocketProvider(url);

      conn.onerror = err => {
        reject(err);
      };

      conn.onopen = evt => {
        if (this.autoreconnect) {
          _classPrivateMethodGet(this, _boffStop, _boffStop2).call(this);
        }

        if (this.onOpen) {
          this.onOpen();
        }

        resolve();
      };

      conn.onclose = evt => {
        _classPrivateFieldSet(this, _socket, null);

        if (this.onDisconnect) {
          const code = _classPrivateFieldGet(this, _boffClosed) ? NETWORK_USER : NETWORK_ERROR;
          this.onDisconnect(new Error(_classPrivateFieldGet(this, _boffClosed) ? NETWORK_USER_TEXT : NETWORK_ERROR_TEXT + ' (' + code + ')'), code);
        }

        if (!_classPrivateFieldGet(this, _boffClosed) && this.autoreconnect) {
          _classPrivateMethodGet(this, _boffReconnect, _boffReconnect2).call(this);
        }
      };

      conn.onmessage = evt => {
        if (this.onMessage) {
          this.onMessage(evt.data);
        }
      };

      _classPrivateFieldSet(this, _socket, conn);
    });
  };

  this.reconnect = force => {
    _classPrivateMethodGet(this, _boffStop, _boffStop2).call(this);

    this.connect(null, force);
  };

  this.disconnect = () => {
    _classPrivateFieldSet(this, _boffClosed, true);

    _classPrivateMethodGet(this, _boffStop, _boffStop2).call(this);

    if (!_classPrivateFieldGet(this, _socket)) {
      return;
    }

    _classPrivateFieldGet(this, _socket).close();

    _classPrivateFieldSet(this, _socket, null);
  };

  this.sendText = msg => {
    if (_classPrivateFieldGet(this, _socket) && _classPrivateFieldGet(this, _socket).readyState == _classPrivateFieldGet(this, _socket).OPEN) {
      _classPrivateFieldGet(this, _socket).send(msg);
    } else {
      throw new Error("Websocket is not connected");
    }
  };

  this.isConnected = () => {
    return _classPrivateFieldGet(this, _socket) && _classPrivateFieldGet(this, _socket).readyState == _classPrivateFieldGet(this, _socket).OPEN;
  };
}

Connection.NETWORK_ERROR = NETWORK_ERROR;
Connection.NETWORK_ERROR_TEXT = NETWORK_ERROR_TEXT;
Connection.NETWORK_USER = NETWORK_USER;
Connection.NETWORK_USER_TEXT = NETWORK_USER_TEXT;

},{"./utils.js":11}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) { _classCheckPrivateStaticAccess(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor(descriptor, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classCheckPrivateStaticFieldDescriptor(descriptor, action) { if (descriptor === undefined) { throw new TypeError("attempted to " + action + " private static field before its declaration"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

function _classStaticPrivateMethodGet(receiver, classConstructor, method) { _classCheckPrivateStaticAccess(receiver, classConstructor); return method; }

function _classCheckPrivateStaticAccess(receiver, classConstructor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

const DB_VERSION = 1;
const DB_NAME = 'tinode-web';
let IDBProvider;

var _onError = new WeakMap();

var _logger = new WeakMap();

var _mapObjects = new WeakSet();

class DB {
  constructor(onError, logger) {
    _classPrivateMethodInitSpec(this, _mapObjects);

    _classPrivateFieldInitSpec(this, _onError, {
      writable: true,
      value: function () {}
    });

    _classPrivateFieldInitSpec(this, _logger, {
      writable: true,
      value: function () {}
    });

    _defineProperty(this, "db", null);

    _defineProperty(this, "disabled", false);

    _classPrivateFieldSet(this, _onError, onError || _classPrivateFieldGet(this, _onError));

    _classPrivateFieldSet(this, _logger, logger || _classPrivateFieldGet(this, _logger));
  }

  initDatabase() {
    return new Promise((resolve, reject) => {
      const req = IDBProvider.open(DB_NAME, DB_VERSION);

      req.onsuccess = event => {
        this.db = event.target.result;
        this.disabled = false;
        resolve(this.db);
      };

      req.onerror = event => {
        _classPrivateFieldGet(this, _logger).call(this, 'PCache', "failed to initialize", event);

        reject(event.target.error);

        _classPrivateFieldGet(this, _onError).call(this, event.target.error);
      };

      req.onupgradeneeded = function (event) {
        this.db = event.target.result;

        this.db.onerror = function (event) {
          _classPrivateFieldGet(this, _logger).call(this, 'PCache', "failed to create storage", event);

          _classPrivateFieldGet(this, _onError).call(this, event.target.error);
        };

        this.db.createObjectStore('topic', {
          keyPath: 'name'
        });
        this.db.createObjectStore('user', {
          keyPath: 'uid'
        });
        this.db.createObjectStore('subscription', {
          keyPath: ['topic', 'uid']
        });
        this.db.createObjectStore('message', {
          keyPath: ['topic', 'seq']
        });
      };
    });
  }

  deleteDatabase() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }

    return new Promise((resolve, reject) => {
      const req = IDBProvider.deleteDatabase(DB_NAME);

      req.onblocked = function (event) {
        if (this.db) {
          this.db.close();
        }

        const err = new Error("blocked");

        _classPrivateFieldGet(this, _logger).call(this, 'PCache', 'deleteDatabase', err);

        reject(err);
      };

      req.onsuccess = event => {
        this.db = null;
        this.disabled = true;
        resolve(true);
      };

      req.onerror = event => {
        _classPrivateFieldGet(this, _logger).call(this, 'PCache', 'deleteDatabase', event.target.error);

        reject(event.target.error);
      };
    });
  }

  isReady() {
    return !!this.db;
  }

  updTopic(topic) {
    if (!this.isReady()) {
      return this.disabled ? Promise.resolve() : Promise.reject(new Error("not initialized"));
    }

    return new Promise((resolve, reject) => {
      const trx = this.db.transaction(['topic'], 'readwrite');

      trx.oncomplete = event => {
        resolve(event.target.result);
      };

      trx.onerror = event => {
        _classPrivateFieldGet(this, _logger).call(this, 'PCache', 'updTopic', event.target.error);

        reject(event.target.error);
      };

      const req = trx.objectStore('topic').get(topic.name);

      req.onsuccess = event => {
        trx.objectStore('topic').put(_classStaticPrivateMethodGet(DB, DB, _serializeTopic).call(DB, req.result, topic));
        trx.commit();
      };
    });
  }

  markTopicAsDeleted(name, deleted) {
    if (!this.isReady()) {
      return this.disabled ? Promise.resolve() : Promise.reject(new Error("not initialized"));
    }

    return new Promise((resolve, reject) => {
      const trx = this.db.transaction(['topic'], 'readwrite');

      trx.oncomplete = event => {
        resolve(event.target.result);
      };

      trx.onerror = event => {
        _classPrivateFieldGet(this, _logger).call(this, 'PCache', 'markTopicAsDeleted', event.target.error);

        reject(event.target.error);
      };

      const req = trx.objectStore('topic').get(name);

      req.onsuccess = event => {
        const topic = event.target.result;

        if (topic._deleted != deleted) {
          topic._deleted = true;
          trx.objectStore('topic').put(topic);
        }

        trx.commit();
      };
    });
  }

  remTopic(name) {
    if (!this.isReady()) {
      return this.disabled ? Promise.resolve() : Promise.reject(new Error("not initialized"));
    }

    return new Promise((resolve, reject) => {
      const trx = this.db.transaction(['topic', 'subscription', 'message'], 'readwrite');

      trx.oncomplete = event => {
        resolve(event.target.result);
      };

      trx.onerror = event => {
        _classPrivateFieldGet(this, _logger).call(this, 'PCache', 'remTopic', event.target.error);

        reject(event.target.error);
      };

      trx.objectStore('topic').delete(IDBKeyRange.only(name));
      trx.objectStore('subscription').delete(IDBKeyRange.bound([name, '-'], [name, '~']));
      trx.objectStore('message').delete(IDBKeyRange.bound([name, 0], [name, Number.MAX_SAFE_INTEGER]));
      trx.commit();
    });
  }

  mapTopics(callback, context) {
    return _classPrivateMethodGet(this, _mapObjects, _mapObjects2).call(this, 'topic', callback, context);
  }

  deserializeTopic(topic, src) {
    _classStaticPrivateMethodGet(DB, DB, _deserializeTopic).call(DB, topic, src);
  }

  updUser(uid, pub) {
    if (arguments.length < 2 || pub === undefined) {
      return;
    }

    if (!this.isReady()) {
      return this.disabled ? Promise.resolve() : Promise.reject(new Error("not initialized"));
    }

    return new Promise((resolve, reject) => {
      const trx = this.db.transaction(['user'], 'readwrite');

      trx.oncomplete = event => {
        resolve(event.target.result);
      };

      trx.onerror = event => {
        _classPrivateFieldGet(this, _logger).call(this, 'PCache', 'updUser', event.target.error);

        reject(event.target.error);
      };

      trx.objectStore('user').put({
        uid: uid,
        public: pub
      });
      trx.commit();
    });
  }

  remUser(uid) {
    if (!this.isReady()) {
      return this.disabled ? Promise.resolve() : Promise.reject(new Error("not initialized"));
    }

    return new Promise((resolve, reject) => {
      const trx = this.db.transaction(['user'], 'readwrite');

      trx.oncomplete = event => {
        resolve(event.target.result);
      };

      trx.onerror = event => {
        _classPrivateFieldGet(this, _logger).call(this, 'PCache', 'remUser', event.target.error);

        reject(event.target.error);
      };

      trx.objectStore('user').delete(IDBKeyRange.only(uid));
      trx.commit();
    });
  }

  mapUsers(callback, context) {
    return _classPrivateMethodGet(this, _mapObjects, _mapObjects2).call(this, 'user', callback, context);
  }

  getUser(uid) {
    if (!this.isReady()) {
      return this.disabled ? Promise.resolve() : Promise.reject(new Error("not initialized"));
    }

    return new Promise((resolve, reject) => {
      const trx = this.db.transaction(['user']);

      trx.oncomplete = event => {
        const user = event.target.result;
        resolve({
          user: user.uid,
          public: user.public
        });
      };

      trx.onerror = event => {
        _classPrivateFieldGet(this, _logger).call(this, 'PCache', 'getUser', event.target.error);

        reject(event.target.error);
      };

      trx.objectStore('user').get(uid);
    });
  }

  updSubscription(topicName, uid, sub) {
    if (!this.isReady()) {
      return this.disabled ? Promise.resolve() : Promise.reject(new Error("not initialized"));
    }

    return new Promise((resolve, reject) => {
      const trx = this.db.transaction(['subscription'], 'readwrite');

      trx.oncomplete = event => {
        resolve(event.target.result);
      };

      trx.onerror = event => {
        _classPrivateFieldGet(this, _logger).call(this, 'PCache', 'updSubscription', event.target.error);

        reject(event.target.error);
      };

      trx.objectStore('subscription').get([topicName, uid]).onsuccess = event => {
        trx.objectStore('subscription').put(_classStaticPrivateMethodGet(DB, DB, _serializeSubscription).call(DB, event.target.result, topicName, uid, sub));
        trx.commit();
      };
    });
  }

  mapSubscriptions(topicName, callback, context) {
    if (!this.isReady()) {
      return this.disabled ? Promise.resolve([]) : Promise.reject(new Error("not initialized"));
    }

    return new Promise((resolve, reject) => {
      const trx = this.db.transaction(['subscription']);

      trx.onerror = event => {
        _classPrivateFieldGet(this, _logger).call(this, 'PCache', 'mapSubscriptions', event.target.error);

        reject(event.target.error);
      };

      trx.objectStore('subscription').getAll(IDBKeyRange.bound([topicName, '-'], [topicName, '~'])).onsuccess = event => {
        if (callback) {
          event.target.result.forEach(topic => {
            callback.call(context, topic);
          });
        }

        resolve(event.target.result);
      };
    });
  }

  addMessage(msg) {
    if (!this.isReady()) {
      return this.disabled ? Promise.resolve() : Promise.reject(new Error("not initialized"));
    }

    return new Promise((resolve, reject) => {
      const trx = this.db.transaction(['message'], 'readwrite');

      trx.onsuccess = event => {
        resolve(event.target.result);
      };

      trx.onerror = event => {
        _classPrivateFieldGet(this, _logger).call(this, 'PCache', 'addMessage', event.target.error);

        reject(event.target.error);
      };

      trx.objectStore('message').add(_classStaticPrivateMethodGet(DB, DB, _serializeMessage).call(DB, null, msg));
      trx.commit();
    });
  }

  updMessageStatus(topicName, seq, status) {
    if (!this.isReady()) {
      return this.disabled ? Promise.resolve() : Promise.reject(new Error("not initialized"));
    }

    return new Promise((resolve, reject) => {
      const trx = this.db.transaction(['message'], 'readwrite');

      trx.onsuccess = event => {
        resolve(event.target.result);
      };

      trx.onerror = event => {
        _classPrivateFieldGet(this, _logger).call(this, 'PCache', 'updMessageStatus', event.target.error);

        reject(event.target.error);
      };

      const req = trx.objectStore('message').get(IDBKeyRange.only([topicName, seq]));

      req.onsuccess = event => {
        const src = req.result || event.target.result;

        if (!src || src._status == status) {
          trx.commit();
          return;
        }

        trx.objectStore('message').put(_classStaticPrivateMethodGet(DB, DB, _serializeMessage).call(DB, src, {
          topic: topicName,
          seq: seq,
          _status: status
        }));
        trx.commit();
      };
    });
  }

  remMessages(topicName, from, to) {
    if (!this.isReady()) {
      return this.disabled ? Promise.resolve() : Promise.reject(new Error("not initialized"));
    }

    return new Promise((resolve, reject) => {
      if (!from && !to) {
        from = 0;
        to = Number.MAX_SAFE_INTEGER;
      }

      const range = to > 0 ? IDBKeyRange.bound([topicName, from], [topicName, to], false, true) : IDBKeyRange.only([topicName, from]);
      const trx = this.db.transaction(['message'], 'readwrite');

      trx.onsuccess = event => {
        resolve(event.target.result);
      };

      trx.onerror = event => {
        _classPrivateFieldGet(this, _logger).call(this, 'PCache', 'remMessages', event.target.error);

        reject(event.target.error);
      };

      trx.objectStore('message').delete(range);
      trx.commit();
    });
  }

  readMessages(topicName, query, callback, context) {
    if (!this.isReady()) {
      return this.disabled ? Promise.resolve([]) : Promise.reject(new Error("not initialized"));
    }

    return new Promise((resolve, reject) => {
      query = query || {};
      const since = query.since > 0 ? query.since : 0;
      const before = query.before > 0 ? query.before : Number.MAX_SAFE_INTEGER;
      const limit = query.limit | 0;
      const result = [];
      const range = IDBKeyRange.bound([topicName, since], [topicName, before], false, true);
      const trx = this.db.transaction(['message']);

      trx.onerror = event => {
        _classPrivateFieldGet(this, _logger).call(this, 'PCache', 'readMessages', event.target.error);

        reject(event.target.error);
      };

      trx.objectStore('message').openCursor(range, 'prev').onsuccess = event => {
        const cursor = event.target.result;

        if (cursor) {
          if (callback) {
            callback.call(context, cursor.value);
          }

          result.push(cursor.value);

          if (limit <= 0 || result.length < limit) {
            cursor.continue();
          } else {
            resolve(result);
          }
        } else {
          resolve(result);
        }
      };
    });
  }

  static setDatabaseProvider(idbProvider) {
    IDBProvider = idbProvider;
  }

}

exports.default = DB;

function _mapObjects2(source, callback, context) {
  if (!this.db) {
    return disabled ? Promise.resolve([]) : Promise.reject(new Error("not initialized"));
  }

  return new Promise((resolve, reject) => {
    const trx = this.db.transaction([source]);

    trx.onerror = event => {
      _classPrivateFieldGet(this, _logger).call(this, 'PCache', 'mapObjects', source, event.target.error);

      reject(event.target.error);
    };

    trx.objectStore(source).getAll().onsuccess = event => {
      if (callback) {
        event.target.result.forEach(topic => {
          callback.call(context, topic);
        });
      }

      resolve(event.target.result);
    };
  });
}

function _deserializeTopic(topic, src) {
  _classStaticPrivateFieldSpecGet(DB, DB, _topic_fields).forEach(f => {
    if (src.hasOwnProperty(f)) {
      topic[f] = src[f];
    }
  });

  if (Array.isArray(src.tags)) {
    topic._tags = src.tags;
  }

  if (src.acs) {
    topic.setAccessMode(src.acs);
  }

  topic.seq |= 0;
  topic.read |= 0;
  topic.unread = Math.max(0, topic.seq - topic.read);
}

function _serializeTopic(dst, src) {
  const res = dst || {
    name: src.name
  };

  _classStaticPrivateFieldSpecGet(DB, DB, _topic_fields).forEach(f => {
    if (src.hasOwnProperty(f)) {
      res[f] = src[f];
    }
  });

  if (Array.isArray(src._tags)) {
    res.tags = src._tags;
  }

  if (src.acs) {
    res.acs = src.getAccessMode().jsonHelper();
  }

  return res;
}

function _serializeSubscription(dst, topicName, uid, sub) {
  const fields = ['updated', 'mode', 'read', 'recv', 'clear', 'lastSeen', 'userAgent'];
  const res = dst || {
    topic: topicName,
    uid: uid
  };
  fields.forEach(f => {
    if (sub.hasOwnProperty(f)) {
      res[f] = sub[f];
    }
  });
  return res;
}

function _serializeMessage(dst, msg) {
  const fields = ['topic', 'seq', 'ts', '_status', 'from', 'head', 'content'];
  const res = dst || {};
  fields.forEach(f => {
    if (msg.hasOwnProperty(f)) {
      res[f] = msg[f];
    }
  });
  return res;
}

var _topic_fields = {
  writable: true,
  value: ['created', 'updated', 'deleted', 'read', 'recv', 'seq', 'clear', 'defacs', 'creds', 'public', 'trusted', 'private', 'touched', '_deleted']
};

},{}],6:[function(require,module,exports){
/**
 * @copyright 2015-2022 Tinode LLC.
 * @summary Minimally rich text representation and formatting for Tinode.
 * @license Apache 2.0
 *
 * @file Basic parser and formatter for very simple text markup. Mostly targeted at
 * mobile use cases similar to Telegram, WhatsApp, and FB Messenger.
 *
 * <p>Supports conversion of user keyboard input to formatted text:</p>
 * <ul>
 *   <li>*abc* &rarr; <b>abc</b></li>
 *   <li>_abc_ &rarr; <i>abc</i></li>
 *   <li>~abc~ &rarr; <del>abc</del></li>
 *   <li>`abc` &rarr; <tt>abc</tt></li>
 * </ul>
 * Also supports forms and buttons.
 *
 * Nested formatting is supported, e.g. *abc _def_* -> <b>abc <i>def</i></b>
 * URLs, @mentions, and #hashtags are extracted and converted into links.
 * Forms and buttons can be added procedurally.
 * JSON data representation is inspired by Draft.js raw formatting.
 *
 *
 * @example
 * Text:
 * <pre>
 *     this is *bold*, `code` and _italic_, ~strike~
 *     combined *bold and _italic_*
 *     an url: https://www.example.com/abc#fragment and another _www.tinode.co_
 *     this is a @mention and a #hashtag in a string
 *     second #hashtag
 * </pre>
 *
 *  Sample JSON representation of the text above:
 *  {
 *     "txt": "this is bold, code and italic, strike combined bold and italic an url: https://www.example.com/abc#fragment " +
 *             "and another www.tinode.co this is a @mention and a #hashtag in a string second #hashtag",
 *     "fmt": [
 *         { "at":8, "len":4,"tp":"ST" },{ "at":14, "len":4, "tp":"CO" },{ "at":23, "len":6, "tp":"EM"},
 *         { "at":31, "len":6, "tp":"DL" },{ "tp":"BR", "len":1, "at":37 },{ "at":56, "len":6, "tp":"EM" },
 *         { "at":47, "len":15, "tp":"ST" },{ "tp":"BR", "len":1, "at":62 },{ "at":120, "len":13, "tp":"EM" },
 *         { "at":71, "len":36, "key":0 },{ "at":120, "len":13, "key":1 },{ "tp":"BR", "len":1, "at":133 },
 *         { "at":144, "len":8, "key":2 },{ "at":159, "len":8, "key":3 },{ "tp":"BR", "len":1, "at":179 },
 *         { "at":187, "len":8, "key":3 },{ "tp":"BR", "len":1, "at":195 }
 *     ],
 *     "ent": [
 *         { "tp":"LN", "data":{ "url":"https://www.example.com/abc#fragment" } },
 *         { "tp":"LN", "data":{ "url":"http://www.tinode.co" } },
 *         { "tp":"MN", "data":{ "val":"mention" } },
 *         { "tp":"HT", "data":{ "val":"hashtag" } }
 *     ]
 *  }
 */
'use strict';

const MAX_FORM_ELEMENTS = 8;
const MAX_PREVIEW_ATTACHMENTS = 3;
const MAX_PREVIEW_DATA_SIZE = 64;
const JSON_MIME_TYPE = 'application/json';
const DRAFTY_MIME_TYPE = 'text/x-drafty';
const ALLOWED_ENT_FIELDS = ['act', 'height', 'duration', 'mime', 'name', 'preview', 'ref', 'size', 'url', 'val', 'width'];
const INLINE_STYLES = [{
  name: 'ST',
  start: /(?:^|[\W_])(\*)[^\s*]/,
  end: /[^\s*](\*)(?=$|[\W_])/
}, {
  name: 'EM',
  start: /(?:^|\W)(_)[^\s_]/,
  end: /[^\s_](_)(?=$|\W)/
}, {
  name: 'DL',
  start: /(?:^|[\W_])(~)[^\s~]/,
  end: /[^\s~](~)(?=$|[\W_])/
}, {
  name: 'CO',
  start: /(?:^|\W)(`)[^`]/,
  end: /[^`](`)(?=$|\W)/
}];
const FMT_WEIGHT = ['QQ'];
const ENTITY_TYPES = [{
  name: 'LN',
  dataName: 'url',
  pack: function (val) {
    if (!/^[a-z]+:\/\//i.test(val)) {
      val = 'http://' + val;
    }

    return {
      url: val
    };
  },
  re: /(?:(?:https?|ftp):\/\/|www\.|ftp\.)[-A-Z0-9+&@#\/%=~_|$?!:,.]*[A-Z0-9+&@#\/%=~_|$]/ig
}, {
  name: 'MN',
  dataName: 'val',
  pack: function (val) {
    return {
      val: val.slice(1)
    };
  },
  re: /\B@([\p{L}\p{N}][._\p{L}\p{N}]*[\p{L}\p{N}])/ug
}, {
  name: 'HT',
  dataName: 'val',
  pack: function (val) {
    return {
      val: val.slice(1)
    };
  },
  re: /\B#([\p{L}\p{N}][._\p{L}\p{N}]*[\p{L}\p{N}])/ug
}];
const HTML_TAGS = {
  AU: {
    name: 'audio',
    isVoid: false
  },
  BN: {
    name: 'button',
    isVoid: false
  },
  BR: {
    name: 'br',
    isVoid: true
  },
  CO: {
    name: 'tt',
    isVoid: false
  },
  DL: {
    name: 'del',
    isVoid: false
  },
  EM: {
    name: 'i',
    isVoid: false
  },
  EX: {
    name: '',
    isVoid: true
  },
  FM: {
    name: 'div',
    isVoid: false
  },
  HD: {
    name: '',
    isVoid: false
  },
  HL: {
    name: 'span',
    isVoid: false
  },
  HT: {
    name: 'a',
    isVoid: false
  },
  IM: {
    name: 'img',
    isVoid: false
  },
  LN: {
    name: 'a',
    isVoid: false
  },
  MN: {
    name: 'a',
    isVoid: false
  },
  RW: {
    name: 'div',
    isVoid: false
  },
  QQ: {
    name: 'div',
    isVoid: false
  },
  ST: {
    name: 'b',
    isVoid: false
  }
};

function base64toObjectUrl(b64, contentType, logger) {
  if (!b64) {
    return null;
  }

  try {
    const bin = atob(b64);
    const length = bin.length;
    const buf = new ArrayBuffer(length);
    const arr = new Uint8Array(buf);

    for (let i = 0; i < length; i++) {
      arr[i] = bin.charCodeAt(i);
    }

    return URL.createObjectURL(new Blob([buf], {
      type: contentType
    }));
  } catch (err) {
    if (logger) {
      logger("Drafty: failed to convert object.", err.message);
    }
  }

  return null;
}

function base64toDataUrl(b64, contentType) {
  if (!b64) {
    return null;
  }

  contentType = contentType || 'image/jpeg';
  return 'data:' + contentType + ';base64,' + b64;
}

const DECORATORS = {
  ST: {
    open: _ => '<b>',
    close: _ => '</b>'
  },
  EM: {
    open: _ => '<i>',
    close: _ => '</i>'
  },
  DL: {
    open: _ => '<del>',
    close: _ => '</del>'
  },
  CO: {
    open: _ => '<tt>',
    close: _ => '</tt>'
  },
  BR: {
    open: _ => '<br/>',
    close: _ => ''
  },
  HD: {
    open: _ => '',
    close: _ => ''
  },
  HL: {
    open: _ => '<span style="color:teal">',
    close: _ => '</span>'
  },
  LN: {
    open: data => {
      return '<a href="' + data.url + '">';
    },
    close: _ => '</a>',
    props: data => {
      return data ? {
        href: data.url,
        target: '_blank'
      } : null;
    }
  },
  MN: {
    open: data => {
      return '<a href="#' + data.val + '">';
    },
    close: _ => '</a>',
    props: data => {
      return data ? {
        id: data.val
      } : null;
    }
  },
  HT: {
    open: data => {
      return '<a href="#' + data.val + '">';
    },
    close: _ => '</a>',
    props: data => {
      return data ? {
        id: data.val
      } : null;
    }
  },
  BN: {
    open: _ => '<button>',
    close: _ => '</button>',
    props: data => {
      return data ? {
        'data-act': data.act,
        'data-val': data.val,
        'data-name': data.name,
        'data-ref': data.ref
      } : null;
    }
  },
  AU: {
    open: data => {
      const url = data.ref || base64toObjectUrl(data.val, data.mime, Drafty.logger);
      return '<audio controls src="' + url + '">';
    },
    close: _ => '</audio>',
    props: data => {
      if (!data) return null;
      return {
        src: data.ref || base64toObjectUrl(data.val, data.mime, Drafty.logger),
        'data-preload': data.ref ? 'metadata' : 'auto',
        'data-duration': data.duration,
        'data-name': data.name,
        'data-size': data.val ? data.val.length * 0.75 | 0 : data.size | 0,
        'data-mime': data.mime
      };
    }
  },
  IM: {
    open: data => {
      const tmpPreviewUrl = base64toDataUrl(data._tempPreview, data.mime);
      const previewUrl = base64toObjectUrl(data.val, data.mime, Drafty.logger);
      const downloadUrl = data.ref || previewUrl;
      return (data.name ? '<a href="' + downloadUrl + '" download="' + data.name + '">' : '') + '<img src="' + (tmpPreviewUrl || previewUrl) + '"' + (data.width ? ' width="' + data.width + '"' : '') + (data.height ? ' height="' + data.height + '"' : '') + ' border="0" />';
    },
    close: data => {
      return data.name ? '</a>' : '';
    },
    props: data => {
      if (!data) return null;
      return {
        src: base64toDataUrl(data._tempPreview, data.mime) || data.ref || base64toObjectUrl(data.val, data.mime, Drafty.logger),
        title: data.name,
        alt: data.name,
        'data-width': data.width,
        'data-height': data.height,
        'data-name': data.name,
        'data-size': data.val ? data.val.length * 0.75 | 0 : data.size | 0,
        'data-mime': data.mime
      };
    }
  },
  FM: {
    open: _ => '<div>',
    close: _ => '</div>'
  },
  RW: {
    open: _ => '<div>',
    close: _ => '</div>'
  },
  QQ: {
    open: _ => '<div>',
    close: _ => '</div>',
    props: data => {
      return data ? {} : null;
    }
  }
};

const Drafty = function () {
  this.txt = '';
  this.fmt = [];
  this.ent = [];
};

Drafty.init = function (plainText) {
  if (typeof plainText == 'undefined') {
    plainText = '';
  } else if (typeof plainText != 'string') {
    return null;
  }

  return {
    txt: plainText
  };
};

Drafty.parse = function (content) {
  if (typeof content != 'string') {
    return null;
  }

  const lines = content.split(/\r?\n/);
  const entityMap = [];
  const entityIndex = {};
  const blx = [];
  lines.forEach(line => {
    let spans = [];
    let entities;
    INLINE_STYLES.forEach(tag => {
      spans = spans.concat(spannify(line, tag.start, tag.end, tag.name));
    });
    let block;

    if (spans.length == 0) {
      block = {
        txt: line
      };
    } else {
      spans.sort((a, b) => {
        const diff = a.at - b.at;
        return diff != 0 ? diff : b.end - a.end;
      });
      spans = toSpanTree(spans);
      const chunks = chunkify(line, 0, line.length, spans);
      const drafty = draftify(chunks, 0);
      block = {
        txt: drafty.txt,
        fmt: drafty.fmt
      };
    }

    entities = extractEntities(block.txt);

    if (entities.length > 0) {
      const ranges = [];

      for (let i in entities) {
        const entity = entities[i];
        let index = entityIndex[entity.unique];

        if (!index) {
          index = entityMap.length;
          entityIndex[entity.unique] = index;
          entityMap.push({
            tp: entity.type,
            data: entity.data
          });
        }

        ranges.push({
          at: entity.offset,
          len: entity.len,
          key: index
        });
      }

      block.ent = ranges;
    }

    blx.push(block);
  });
  const result = {
    txt: ''
  };

  if (blx.length > 0) {
    result.txt = blx[0].txt;
    result.fmt = (blx[0].fmt || []).concat(blx[0].ent || []);

    for (let i = 1; i < blx.length; i++) {
      const block = blx[i];
      const offset = result.txt.length + 1;
      result.fmt.push({
        tp: 'BR',
        len: 1,
        at: offset - 1
      });
      result.txt += ' ' + block.txt;

      if (block.fmt) {
        result.fmt = result.fmt.concat(block.fmt.map(s => {
          s.at += offset;
          return s;
        }));
      }

      if (block.ent) {
        result.fmt = result.fmt.concat(block.ent.map(s => {
          s.at += offset;
          return s;
        }));
      }
    }

    if (result.fmt.length == 0) {
      delete result.fmt;
    }

    if (entityMap.length > 0) {
      result.ent = entityMap;
    }
  }

  return result;
};

Drafty.append = function (first, second) {
  if (!first) {
    return second;
  }

  if (!second) {
    return first;
  }

  first.txt = first.txt || '';
  const len = first.txt.length;

  if (typeof second == 'string') {
    first.txt += second;
  } else if (second.txt) {
    first.txt += second.txt;
  }

  if (Array.isArray(second.fmt)) {
    first.fmt = first.fmt || [];

    if (Array.isArray(second.ent)) {
      first.ent = first.ent || [];
    }

    second.fmt.forEach(src => {
      const fmt = {
        at: (src.at | 0) + len,
        len: src.len | 0
      };

      if (src.at == -1) {
        fmt.at = -1;
        fmt.len = 0;
      }

      if (src.tp) {
        fmt.tp = src.tp;
      } else {
        fmt.key = first.ent.length;
        first.ent.push(second.ent[src.key || 0]);
      }

      first.fmt.push(fmt);
    });
  }

  return first;
};

Drafty.insertImage = function (content, at, imageDesc) {
  content = content || {
    txt: ' '
  };
  content.ent = content.ent || [];
  content.fmt = content.fmt || [];
  content.fmt.push({
    at: at | 0,
    len: 1,
    key: content.ent.length
  });
  const ex = {
    tp: 'IM',
    data: {
      mime: imageDesc.mime,
      val: imageDesc.preview,
      width: imageDesc.width,
      height: imageDesc.height,
      name: imageDesc.filename,
      size: imageDesc.size | 0,
      ref: imageDesc.refurl
    }
  };

  if (imageDesc.urlPromise) {
    ex.data._tempPreview = imageDesc._tempPreview;
    ex.data._processing = true;
    imageDesc.urlPromise.then(url => {
      ex.data.ref = url;
      ex.data._tempPreview = undefined;
      ex.data._processing = undefined;
    }, _ => {
      ex.data._processing = undefined;
    });
  }

  content.ent.push(ex);
  return content;
};

Drafty.insertAudio = function (content, at, audioDesc) {
  content = content || {
    txt: ' '
  };
  content.ent = content.ent || [];
  content.fmt = content.fmt || [];
  content.fmt.push({
    at: at | 0,
    len: 1,
    key: content.ent.length
  });
  const ex = {
    tp: 'AU',
    data: {
      mime: audioDesc.mime,
      val: audioDesc.data,
      duration: audioDesc.duration | 0,
      preview: audioDesc.preview,
      name: audioDesc.filename,
      size: audioDesc.size | 0,
      ref: audioDesc.refurl
    }
  };

  if (audioDesc.urlPromise) {
    ex.data._processing = true;
    audioDesc.urlPromise.then(url => {
      ex.data.ref = url;
      ex.data._processing = undefined;
    }, _ => {
      ex.data._processing = undefined;
    });
  }

  content.ent.push(ex);
  return content;
};

Drafty.quote = function (header, uid, body) {
  const quote = Drafty.append(Drafty.appendLineBreak(Drafty.mention(header, uid)), body);
  quote.fmt.push({
    at: 0,
    len: quote.txt.length,
    tp: 'QQ'
  });
  return quote;
};

Drafty.mention = function (name, uid) {
  return {
    txt: name || '',
    fmt: [{
      at: 0,
      len: (name || '').length,
      key: 0
    }],
    ent: [{
      tp: 'MN',
      data: {
        val: uid
      }
    }]
  };
};

Drafty.appendLink = function (content, linkData) {
  content = content || {
    txt: ''
  };
  content.ent = content.ent || [];
  content.fmt = content.fmt || [];
  content.fmt.push({
    at: content.txt.length,
    len: linkData.txt.length,
    key: content.ent.length
  });
  content.txt += linkData.txt;
  const ex = {
    tp: 'LN',
    data: {
      url: linkData.url
    }
  };
  content.ent.push(ex);
  return content;
};

Drafty.appendImage = function (content, imageDesc) {
  content = content || {
    txt: ''
  };
  content.txt += ' ';
  return Drafty.insertImage(content, content.txt.length - 1, imageDesc);
};

Drafty.appendAudio = function (content, audioDesc) {
  content = content || {
    txt: ''
  };
  content.txt += ' ';
  return Drafty.insertAudio(content, content.txt.length - 1, audioDesc);
};

Drafty.attachFile = function (content, attachmentDesc) {
  content = content || {
    txt: ''
  };
  content.ent = content.ent || [];
  content.fmt = content.fmt || [];
  content.fmt.push({
    at: -1,
    len: 0,
    key: content.ent.length
  });
  const ex = {
    tp: 'EX',
    data: {
      mime: attachmentDesc.mime,
      val: attachmentDesc.data,
      name: attachmentDesc.filename,
      ref: attachmentDesc.refurl,
      size: attachmentDesc.size | 0
    }
  };

  if (attachmentDesc.urlPromise) {
    ex.data._processing = true;
    attachmentDesc.urlPromise.then(url => {
      ex.data.ref = url;
      ex.data._processing = undefined;
    }, err => {
      ex.data._processing = undefined;
    });
  }

  content.ent.push(ex);
  return content;
};

Drafty.wrapInto = function (content, style, at, len) {
  if (typeof content == 'string') {
    content = {
      txt: content
    };
  }

  content.fmt = content.fmt || [];
  content.fmt.push({
    at: at || 0,
    len: len || content.txt.length,
    tp: style
  });
  return content;
};

Drafty.wrapAsForm = function (content, at, len) {
  return Drafty.wrapInto(content, 'FM', at, len);
};

Drafty.insertButton = function (content, at, len, name, actionType, actionValue, refUrl) {
  if (typeof content == 'string') {
    content = {
      txt: content
    };
  }

  if (!content || !content.txt || content.txt.length < at + len) {
    return null;
  }

  if (len <= 0 || ['url', 'pub'].indexOf(actionType) == -1) {
    return null;
  }

  if (actionType == 'url' && !refUrl) {
    return null;
  }

  refUrl = '' + refUrl;
  content.ent = content.ent || [];
  content.fmt = content.fmt || [];
  content.fmt.push({
    at: at | 0,
    len: len,
    key: content.ent.length
  });
  content.ent.push({
    tp: 'BN',
    data: {
      act: actionType,
      val: actionValue,
      ref: refUrl,
      name: name
    }
  });
  return content;
};

Drafty.appendButton = function (content, title, name, actionType, actionValue, refUrl) {
  content = content || {
    txt: ''
  };
  const at = content.txt.length;
  content.txt += title;
  return Drafty.insertButton(content, at, title.length, name, actionType, actionValue, refUrl);
};

Drafty.attachJSON = function (content, data) {
  content = content || {
    txt: ''
  };
  content.ent = content.ent || [];
  content.fmt = content.fmt || [];
  content.fmt.push({
    at: -1,
    len: 0,
    key: content.ent.length
  });
  content.ent.push({
    tp: 'EX',
    data: {
      mime: JSON_MIME_TYPE,
      val: data
    }
  });
  return content;
};

Drafty.appendLineBreak = function (content) {
  content = content || {
    txt: ''
  };
  content.fmt = content.fmt || [];
  content.fmt.push({
    at: content.txt.length,
    len: 1,
    tp: 'BR'
  });
  content.txt += ' ';
  return content;
};

Drafty.UNSAFE_toHTML = function (doc) {
  let tree = draftyToTree(doc);

  const htmlFormatter = function (type, data, values) {
    const tag = DECORATORS[type];
    let result = values ? values.join('') : '';

    if (tag) {
      result = tag.open(data) + result + tag.close(data);
    }

    return result;
  };

  return treeBottomUp(tree, htmlFormatter, 0);
};

Drafty.format = function (original, formatter, context) {
  return treeBottomUp(draftyToTree(original), formatter, 0, [], context);
};

Drafty.shorten = function (original, limit, light) {
  let tree = draftyToTree(original);
  tree = shortenTree(tree, limit, '…');

  if (tree && light) {
    tree = lightEntity(tree);
  }

  return treeToDrafty({}, tree, []);
};

Drafty.forwardedContent = function (original) {
  let tree = draftyToTree(original);

  const rmMention = function (node) {
    if (node.type == 'MN') {
      if (!node.parent || !node.parent.type) {
        return null;
      }
    }

    return node;
  };

  tree = treeTopDown(tree, rmMention);
  tree = lTrim(tree);
  return treeToDrafty({}, tree, []);
};

Drafty.replyContent = function (original, limit) {
  const convMNnQQnBR = function (node) {
    if (node.type == 'QQ') {
      return null;
    } else if (node.type == 'MN') {
      if ((!node.parent || !node.parent.type) && (node.text || '').startsWith('➦')) {
        node.text = '➦';
        delete node.children;
        delete node.data;
      }
    } else if (node.type == 'BR') {
      node.text = ' ';
      delete node.type;
      delete node.children;
    }

    return node;
  };

  let tree = draftyToTree(original);

  if (!tree) {
    return original;
  }

  tree = treeTopDown(tree, convMNnQQnBR);
  tree = attachmentsToEnd(tree, MAX_PREVIEW_ATTACHMENTS);
  tree = shortenTree(tree, limit, '…');
  tree = lightEntity(tree, node => node.type == 'IM' ? ['val'] : null);
  return treeToDrafty({}, tree, []);
};

Drafty.preview = function (original, limit, forwarding) {
  let tree = draftyToTree(original);
  tree = attachmentsToEnd(tree, MAX_PREVIEW_ATTACHMENTS);

  const convMNnQQnBR = function (node) {
    if (node.type == 'MN') {
      if ((!node.parent || !node.parent.type) && (node.text || '').startsWith('➦')) {
        node.text = '➦';
        delete node.children;
      }
    } else if (node.type == 'QQ') {
      node.text = ' ';
      delete node.children;
    } else if (node.type == 'BR') {
      node.text = ' ';
      delete node.children;
      delete node.type;
    }

    return node;
  };

  tree = treeTopDown(tree, convMNnQQnBR);
  tree = shortenTree(tree, limit, '…');

  if (forwarding) {
    tree = lightEntity(tree, node => node.type == 'IM' ? ['val'] : null);
  } else {
    tree = lightEntity(tree);
  }

  return treeToDrafty({}, tree, []);
};

Drafty.toPlainText = function (content) {
  return typeof content == 'string' ? content : content.txt;
};

Drafty.isPlainText = function (content) {
  return typeof content == 'string' || !(content.fmt || content.ent);
};

Drafty.isValid = function (content) {
  if (!content) {
    return false;
  }

  const {
    txt,
    fmt,
    ent
  } = content;

  if (!txt && txt !== '' && !fmt && !ent) {
    return false;
  }

  const txt_type = typeof txt;

  if (txt_type != 'string' && txt_type != 'undefined' && txt !== null) {
    return false;
  }

  if (typeof fmt != 'undefined' && !Array.isArray(fmt) && fmt !== null) {
    return false;
  }

  if (typeof ent != 'undefined' && !Array.isArray(ent) && ent !== null) {
    return false;
  }

  return true;
};

Drafty.hasAttachments = function (content) {
  if (!Array.isArray(content.fmt)) {
    return false;
  }

  for (let i in content.fmt) {
    const fmt = content.fmt[i];

    if (fmt && fmt.at < 0) {
      const ent = content.ent[fmt.key | 0];
      return ent && ent.tp == 'EX' && ent.data;
    }
  }

  return false;
};

Drafty.attachments = function (content, callback, context) {
  if (!Array.isArray(content.fmt)) {
    return;
  }

  let i = 0;
  content.fmt.forEach(fmt => {
    if (fmt && fmt.at < 0) {
      const ent = content.ent[fmt.key | 0];

      if (ent && ent.tp == 'EX' && ent.data) {
        callback.call(context, ent.data, i++, 'EX');
      }
    }
  });
};

Drafty.hasEntities = function (content) {
  return content.ent && content.ent.length > 0;
};

Drafty.entities = function (content, callback, context) {
  if (content.ent && content.ent.length > 0) {
    for (let i in content.ent) {
      if (content.ent[i]) {
        callback.call(context, content.ent[i].data, i, content.ent[i].tp);
      }
    }
  }
};

Drafty.sanitizeEntities = function (content) {
  if (content && content.ent && content.ent.length > 0) {
    for (let i in content.ent) {
      const ent = content.ent[i];

      if (ent && ent.data) {
        const data = copyEntData(ent.data);

        if (data) {
          content.ent[i].data = data;
        } else {
          delete content.ent[i].data;
        }
      }
    }
  }

  return content;
};

Drafty.getDownloadUrl = function (entData) {
  let url = null;

  if (entData.mime != JSON_MIME_TYPE && entData.val) {
    url = base64toObjectUrl(entData.val, entData.mime, Drafty.logger);
  } else if (typeof entData.ref == 'string') {
    url = entData.ref;
  }

  return url;
};

Drafty.isProcessing = function (entData) {
  return !!entData._processing;
};

Drafty.getPreviewUrl = function (entData) {
  return entData.val ? base64toObjectUrl(entData.val, entData.mime, Drafty.logger) : null;
};

Drafty.getEntitySize = function (entData) {
  return entData.size ? entData.size : entData.val ? entData.val.length * 0.75 | 0 : 0;
};

Drafty.getEntityMimeType = function (entData) {
  return entData.mime || 'text/plain';
};

Drafty.tagName = function (style) {
  return style ? HTML_TAGS[style] ? HTML_TAGS[style].name : '_UNKN' : undefined;
};

Drafty.attrValue = function (style, data) {
  if (data && DECORATORS[style]) {
    return DECORATORS[style].props(data);
  }

  return undefined;
};

Drafty.getContentType = function () {
  return DRAFTY_MIME_TYPE;
};

function chunkify(line, start, end, spans) {
  const chunks = [];

  if (spans.length == 0) {
    return [];
  }

  for (let i in spans) {
    const span = spans[i];

    if (span.at > start) {
      chunks.push({
        txt: line.slice(start, span.at)
      });
    }

    const chunk = {
      tp: span.tp
    };
    const chld = chunkify(line, span.at + 1, span.end, span.children);

    if (chld.length > 0) {
      chunk.children = chld;
    } else {
      chunk.txt = span.txt;
    }

    chunks.push(chunk);
    start = span.end + 1;
  }

  if (start < end) {
    chunks.push({
      txt: line.slice(start, end)
    });
  }

  return chunks;
}

function spannify(original, re_start, re_end, type) {
  const result = [];
  let index = 0;
  let line = original.slice(0);

  while (line.length > 0) {
    const start = re_start.exec(line);

    if (start == null) {
      break;
    }

    let start_offset = start['index'] + start[0].lastIndexOf(start[1]);
    line = line.slice(start_offset + 1);
    start_offset += index;
    index = start_offset + 1;
    const end = re_end ? re_end.exec(line) : null;

    if (end == null) {
      break;
    }

    let end_offset = end['index'] + end[0].indexOf(end[1]);
    line = line.slice(end_offset + 1);
    end_offset += index;
    index = end_offset + 1;
    result.push({
      txt: original.slice(start_offset + 1, end_offset),
      children: [],
      at: start_offset,
      end: end_offset,
      tp: type
    });
  }

  return result;
}

function toSpanTree(spans) {
  if (spans.length == 0) {
    return [];
  }

  const tree = [spans[0]];
  let last = spans[0];

  for (let i = 1; i < spans.length; i++) {
    if (spans[i].at > last.end) {
      tree.push(spans[i]);
      last = spans[i];
    } else if (spans[i].end <= last.end) {
      last.children.push(spans[i]);
    }
  }

  for (let i in tree) {
    tree[i].children = toSpanTree(tree[i].children);
  }

  return tree;
}

function draftyToTree(doc) {
  if (!doc) {
    return null;
  }

  doc = typeof doc == 'string' ? {
    txt: doc
  } : doc;
  let {
    txt,
    fmt,
    ent
  } = doc;
  txt = txt || '';

  if (!Array.isArray(ent)) {
    ent = [];
  }

  if (!Array.isArray(fmt) || fmt.length == 0) {
    if (ent.length == 0) {
      return {
        text: txt
      };
    }

    fmt = [{
      at: 0,
      len: 0,
      key: 0
    }];
  }

  const spans = [];
  const attachments = [];
  fmt.forEach(span => {
    if (!span || typeof span != 'object') {
      return;
    }

    if (!['undefined', 'number'].includes(typeof span.at)) {
      return;
    }

    if (!['undefined', 'number'].includes(typeof span.len)) {
      return;
    }

    let at = span.at | 0;
    let len = span.len | 0;

    if (len < 0) {
      return;
    }

    let key = span.key || 0;

    if (ent.length > 0 && (typeof key != 'number' || key < 0 || key >= ent.length)) {
      return;
    }

    if (at <= -1) {
      attachments.push({
        start: -1,
        end: 0,
        key: key
      });
      return;
    } else if (at + len > txt.length) {
      return;
    }

    if (!span.tp) {
      if (ent.length > 0 && typeof ent[key] == 'object') {
        spans.push({
          start: at,
          end: at + len,
          key: key
        });
      }
    } else {
      spans.push({
        type: span.tp,
        start: at,
        end: at + len
      });
    }
  });
  spans.sort((a, b) => {
    let diff = a.start - b.start;

    if (diff != 0) {
      return diff;
    }

    diff = b.end - a.end;

    if (diff != 0) {
      return diff;
    }

    return FMT_WEIGHT.indexOf(b.type) - FMT_WEIGHT.indexOf(a.type);
  });

  if (attachments.length > 0) {
    spans.push(...attachments);
  }

  spans.forEach(span => {
    if (ent.length > 0 && !span.type && ent[span.key] && typeof ent[span.key] == 'object') {
      span.type = ent[span.key].tp;
      span.data = ent[span.key].data;
    }

    if (!span.type) {
      span.type = 'HD';
    }
  });
  let tree = spansToTree({}, txt, 0, txt.length, spans);

  const flatten = function (node) {
    if (Array.isArray(node.children) && node.children.length == 1) {
      const child = node.children[0];

      if (!node.type) {
        const parent = node.parent;
        node = child;
        node.parent = parent;
      } else if (!child.type && !child.children) {
        node.text = child.text;
        delete node.children;
      }
    }

    return node;
  };

  tree = treeTopDown(tree, flatten);
  return tree;
}

function addNode(parent, n) {
  if (!n) {
    return parent;
  }

  if (!parent.children) {
    parent.children = [];
  }

  if (parent.text) {
    parent.children.push({
      text: parent.text,
      parent: parent
    });
    delete parent.text;
  }

  n.parent = parent;
  parent.children.push(n);
  return parent;
}

function spansToTree(parent, text, start, end, spans) {
  if (!spans || spans.length == 0) {
    if (start < end) {
      addNode(parent, {
        text: text.substring(start, end)
      });
    }

    return parent;
  }

  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];

    if (span.start < 0 && span.type == 'EX') {
      addNode(parent, {
        type: span.type,
        data: span.data,
        key: span.key,
        att: true
      });
      continue;
    }

    if (start < span.start) {
      addNode(parent, {
        text: text.substring(start, span.start)
      });
      start = span.start;
    }

    const subspans = [];

    while (i < spans.length - 1) {
      const inner = spans[i + 1];

      if (inner.start < 0) {
        break;
      } else if (inner.start < span.end) {
        if (inner.end <= span.end) {
          const tag = HTML_TAGS[inner.tp] || {};

          if (inner.start < inner.end || tag.isVoid) {
            subspans.push(inner);
          }
        }

        i++;
      } else {
        break;
      }
    }

    addNode(parent, spansToTree({
      type: span.type,
      data: span.data,
      key: span.key
    }, text, start, span.end, subspans));
    start = span.end;
  }

  if (start < end) {
    addNode(parent, {
      text: text.substring(start, end)
    });
  }

  return parent;
}

function treeToDrafty(doc, tree, keymap) {
  if (!tree) {
    return doc;
  }

  doc.txt = doc.txt || '';
  const start = doc.txt.length;

  if (tree.text) {
    doc.txt += tree.text;
  } else if (Array.isArray(tree.children)) {
    tree.children.forEach(c => {
      treeToDrafty(doc, c, keymap);
    });
  }

  if (tree.type) {
    const len = doc.txt.length - start;
    doc.fmt = doc.fmt || [];

    if (Object.keys(tree.data || {}).length > 0) {
      doc.ent = doc.ent || [];
      const newKey = typeof keymap[tree.key] == 'undefined' ? doc.ent.length : keymap[tree.key];
      keymap[tree.key] = newKey;
      doc.ent[newKey] = {
        tp: tree.type,
        data: tree.data
      };

      if (tree.att) {
        doc.fmt.push({
          at: -1,
          len: 0,
          key: newKey
        });
      } else {
        doc.fmt.push({
          at: start,
          len: len,
          key: newKey
        });
      }
    } else {
      doc.fmt.push({
        tp: tree.type,
        at: start,
        len: len
      });
    }
  }

  return doc;
}

function treeTopDown(src, transformer, context) {
  if (!src) {
    return null;
  }

  let dst = transformer.call(context, src);

  if (!dst || !dst.children) {
    return dst;
  }

  const children = [];

  for (let i in dst.children) {
    let n = dst.children[i];

    if (n) {
      n = treeTopDown(n, transformer, context);

      if (n) {
        children.push(n);
      }
    }
  }

  if (children.length == 0) {
    dst.children = null;
  } else {
    dst.children = children;
  }

  return dst;
}

function treeBottomUp(src, formatter, index, stack, context) {
  if (!src) {
    return null;
  }

  if (stack && src.type) {
    stack.push(src.type);
  }

  let values = [];

  for (let i in src.children) {
    const n = treeBottomUp(src.children[i], formatter, i, stack, context);

    if (n) {
      values.push(n);
    }
  }

  if (values.length == 0) {
    if (src.text) {
      values = [src.text];
    } else {
      values = null;
    }
  }

  if (stack && src.type) {
    stack.pop();
  }

  return formatter.call(context, src.type, src.data, values, index, stack);
}

function shortenTree(tree, limit, tail) {
  if (!tree) {
    return null;
  }

  if (tail) {
    limit -= tail.length;
  }

  const shortener = function (node) {
    if (limit <= -1) {
      return null;
    }

    if (node.att) {
      return node;
    }

    if (limit == 0) {
      node.text = tail;
      limit = -1;
    } else if (node.text) {
      const len = node.text.length;

      if (len > limit) {
        node.text = node.text.substring(0, limit) + tail;
        limit = -1;
      } else {
        limit -= len;
      }
    }

    return node;
  };

  return treeTopDown(tree, shortener);
}

function lightEntity(tree, allow) {
  const lightCopy = node => {
    const data = copyEntData(node.data, true, allow ? allow(node) : null);

    if (data) {
      node.data = data;
    } else {
      delete node.data;
    }

    return node;
  };

  return treeTopDown(tree, lightCopy);
}

function lTrim(tree) {
  if (tree.type == 'BR') {
    tree = null;
  } else if (tree.text) {
    if (!tree.type) {
      tree.text = tree.text.trimStart();

      if (!tree.text) {
        tree = null;
      }
    }
  } else if (!tree.type && tree.children && tree.children.length > 0) {
    const c = lTrim(tree.children[0]);

    if (c) {
      tree.children[0] = c;
    } else {
      tree.children.shift();

      if (!tree.type && tree.children.length == 0) {
        tree = null;
      }
    }
  }

  return tree;
}

function attachmentsToEnd(tree, limit) {
  if (!tree) {
    return null;
  }

  if (tree.att) {
    tree.text = ' ';
    delete tree.att;
    delete tree.children;
  } else if (tree.children) {
    const attachments = [];
    const children = [];

    for (let i in tree.children) {
      const c = tree.children[i];

      if (c.att) {
        if (attachments.length == limit) {
          continue;
        }

        if (c.data['mime'] == JSON_MIME_TYPE) {
          continue;
        }

        delete c.att;
        delete c.children;
        c.text = ' ';
        attachments.push(c);
      } else {
        children.push(c);
      }
    }

    tree.children = children.concat(attachments);
  }

  return tree;
}

function extractEntities(line) {
  let match;
  let extracted = [];
  ENTITY_TYPES.forEach(entity => {
    while ((match = entity.re.exec(line)) !== null) {
      extracted.push({
        offset: match['index'],
        len: match[0].length,
        unique: match[0],
        data: entity.pack(match[0]),
        type: entity.name
      });
    }
  });

  if (extracted.length == 0) {
    return extracted;
  }

  extracted.sort((a, b) => {
    return a.offset - b.offset;
  });
  let idx = -1;
  extracted = extracted.filter(el => {
    const result = el.offset > idx;
    idx = el.offset + el.len;
    return result;
  });
  return extracted;
}

function draftify(chunks, startAt) {
  let plain = '';
  let ranges = [];

  for (let i in chunks) {
    const chunk = chunks[i];

    if (!chunk.txt) {
      const drafty = draftify(chunk.children, plain.length + startAt);
      chunk.txt = drafty.txt;
      ranges = ranges.concat(drafty.fmt);
    }

    if (chunk.tp) {
      ranges.push({
        at: plain.length + startAt,
        len: chunk.txt.length,
        tp: chunk.tp
      });
    }

    plain += chunk.txt;
  }

  return {
    txt: plain,
    fmt: ranges
  };
}

function copyEntData(data, light, allow) {
  if (data && Object.entries(data).length > 0) {
    allow = allow || [];
    const dc = {};
    ALLOWED_ENT_FIELDS.forEach(key => {
      if (data[key]) {
        if (light && !allow.includes(key) && (typeof data[key] == 'string' || Array.isArray(data[key])) && data[key].length > MAX_PREVIEW_DATA_SIZE) {
          return;
        }

        if (typeof data[key] == 'object') {
          return;
        }

        dc[key] = data[key];
      }
    });

    if (Object.entries(dc).length != 0) {
      return dc;
    }
  }

  return null;
}

if (typeof module != 'undefined') {
  module.exports = Drafty;
}

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = require("./utils.js");

let XHRProvider;

class LargeFileHelper {
  constructor(tinode, version) {
    this._tinode = tinode;
    this._version = version;
    this._apiKey = tinode._apiKey;
    this._authToken = tinode.getAuthToken();
    this._reqId = tinode.getNextUniqueId();
    this.xhr = new XHRProvider();
    this.toResolve = null;
    this.toReject = null;
    this.onProgress = null;
    this.onSuccess = null;
    this.onFailure = null;
  }

  uploadWithBaseUrl(baseUrl, data, avatarFor, onProgress, onSuccess, onFailure) {
    if (!this._authToken) {
      throw new Error("Must authenticate first");
    }

    const instance = this;
    let url = "/v".concat(this._version, "/file/u/");

    if (baseUrl) {
      let base = baseUrl;

      if (base.endsWith('/')) {
        base = base.slice(0, -1);
      }

      if (base.startsWith('http://') || base.startsWith('https://')) {
        url = base + url;
      } else {
        throw new Error("Invalid base URL '".concat(baseUrl, "'"));
      }
    }

    this.xhr.open('POST', url, true);
    this.xhr.setRequestHeader('X-Tinode-APIKey', this._apiKey);
    this.xhr.setRequestHeader('X-Tinode-Auth', "Token ".concat(this._authToken.token));
    const result = new Promise((resolve, reject) => {
      this.toResolve = resolve;
      this.toReject = reject;
    });
    this.onProgress = onProgress;
    this.onSuccess = onSuccess;
    this.onFailure = onFailure;

    this.xhr.upload.onprogress = e => {
      if (e.lengthComputable && instance.onProgress) {
        instance.onProgress(e.loaded / e.total);
      }
    };

    this.xhr.onload = function () {
      let pkt;

      try {
        pkt = JSON.parse(this.response, _utils.jsonParseHelper);
      } catch (err) {
        instance._tinode.logger("ERROR: Invalid server response in LargeFileHelper", this.response);

        pkt = {
          ctrl: {
            code: this.status,
            text: this.statusText
          }
        };
      }

      if (this.status >= 200 && this.status < 300) {
        if (instance.toResolve) {
          instance.toResolve(pkt.ctrl.params.url);
        }

        if (instance.onSuccess) {
          instance.onSuccess(pkt.ctrl);
        }
      } else if (this.status >= 400) {
        if (instance.toReject) {
          instance.toReject(new Error("".concat(pkt.ctrl.text, " (").concat(pkt.ctrl.code, ")")));
        }

        if (instance.onFailure) {
          instance.onFailure(pkt.ctrl);
        }
      } else {
        instance._tinode.logger("ERROR: Unexpected server response status", this.status, this.response);
      }
    };

    this.xhr.onerror = function (e) {
      if (instance.toReject) {
        instance.toReject(new Error("failed"));
      }

      if (instance.onFailure) {
        instance.onFailure(null);
      }
    };

    this.xhr.onabort = function (e) {
      if (instance.toReject) {
        instance.toReject(new Error("upload cancelled by user"));
      }

      if (instance.onFailure) {
        instance.onFailure(null);
      }
    };

    try {
      const form = new FormData();
      form.append('file', data);
      form.set('id', this._reqId);

      if (avatarFor) {
        form.set('topic', avatarFor);
      }

      this.xhr.send(form);
    } catch (err) {
      if (this.toReject) {
        this.toReject(err);
      }

      if (this.onFailure) {
        this.onFailure(null);
      }
    }

    return result;
  }

  upload(data, avatarFor, onProgress, onSuccess, onFailure) {
    const baseUrl = (this._tinode._secure ? 'https://' : 'http://') + this._tinode._host;
    return this.uploadWithBaseUrl(baseUrl, data, avatarFor, onProgress, onSuccess, onFailure);
  }

  download(relativeUrl, filename, mimetype, onProgress, onError) {
    if (!Tinode.isRelativeURL(relativeUrl)) {
      if (onError) {
        onError("The URL '".concat(relativeUrl, "' must be relative, not absolute"));
      }

      return;
    }

    if (!this._authToken) {
      if (onError) {
        onError("Must authenticate first");
      }

      return;
    }

    const instance = this;
    this.xhr.open('GET', relativeUrl, true);
    this.xhr.setRequestHeader('X-Tinode-APIKey', this._apiKey);
    this.xhr.setRequestHeader('X-Tinode-Auth', 'Token ' + this._authToken.token);
    this.xhr.responseType = 'blob';
    this.onProgress = onProgress;

    this.xhr.onprogress = function (e) {
      if (instance.onProgress) {
        instance.onProgress(e.loaded);
      }
    };

    const result = new Promise((resolve, reject) => {
      this.toResolve = resolve;
      this.toReject = reject;
    });

    this.xhr.onload = function () {
      if (this.status == 200) {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(new Blob([this.response], {
          type: mimetype
        }));
        link.style.display = 'none';
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);

        if (instance.toResolve) {
          instance.toResolve();
        }
      } else if (this.status >= 400 && instance.toReject) {
        const reader = new FileReader();

        reader.onload = function () {
          try {
            const pkt = JSON.parse(this.result, _utils.jsonParseHelper);
            instance.toReject(new Error("".concat(pkt.ctrl.text, " (").concat(pkt.ctrl.code, ")")));
          } catch (err) {
            instance._tinode.logger("ERROR: Invalid server response in LargeFileHelper", this.result);

            instance.toReject(err);
          }
        };

        reader.readAsText(this.response);
      }
    };

    this.xhr.onerror = function (e) {
      if (instance.toReject) {
        instance.toReject(new Error("failed"));
      }
    };

    this.xhr.onabort = function () {
      if (instance.toReject) {
        instance.toReject(null);
      }
    };

    try {
      this.xhr.send();
    } catch (err) {
      if (this.toReject) {
        this.toReject(err);
      }
    }

    return result;
  }

  cancel() {
    if (this.xhr && this.xhr.readyState < 4) {
      this.xhr.abort();
    }
  }

  getId() {
    return this._reqId;
  }

  static setNetworkProvider(xhrProvider) {
    XHRProvider = xhrProvider;
  }

}

exports.default = LargeFileHelper;

},{"./utils.js":11}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

var _get_desc_ims = new WeakSet();

var _get_subs_ims = new WeakSet();

class MetaGetBuilder {
  constructor(parent) {
    _classPrivateMethodInitSpec(this, _get_subs_ims);

    _classPrivateMethodInitSpec(this, _get_desc_ims);

    this.topic = parent;
    this.what = {};
  }

  withData(since, before, limit) {
    this.what['data'] = {
      since: since,
      before: before,
      limit: limit
    };
    return this;
  }

  withLaterData(limit) {
    return this.withData(this.topic._maxSeq > 0 ? this.topic._maxSeq + 1 : undefined, undefined, limit);
  }

  withEarlierData(limit) {
    return this.withData(undefined, this.topic._minSeq > 0 ? this.topic._minSeq : undefined, limit);
  }

  withDesc(ims) {
    this.what['desc'] = {
      ims: ims
    };
    return this;
  }

  withLaterDesc() {
    return this.withDesc(_classPrivateMethodGet(this, _get_desc_ims, _get_desc_ims2).call(this));
  }

  withSub(ims, limit, userOrTopic) {
    const opts = {
      ims: ims,
      limit: limit
    };

    if (this.topic.getType() == 'me') {
      opts.topic = userOrTopic;
    } else {
      opts.user = userOrTopic;
    }

    this.what['sub'] = opts;
    return this;
  }

  withOneSub(ims, userOrTopic) {
    return this.withSub(ims, undefined, userOrTopic);
  }

  withLaterOneSub(userOrTopic) {
    return this.withOneSub(this.topic._lastSubsUpdate, userOrTopic);
  }

  withLaterSub(limit) {
    return this.withSub(_classPrivateMethodGet(this, _get_subs_ims, _get_subs_ims2).call(this), limit);
  }

  withTags() {
    this.what['tags'] = true;
    return this;
  }

  withCred() {
    if (this.topic.getType() == 'me') {
      this.what['cred'] = true;
    } else {
      this.topic._tinode.logger("ERROR: Invalid topic type for MetaGetBuilder:withCreds", this.topic.getType());
    }

    return this;
  }

  withDel(since, limit) {
    if (since || limit) {
      this.what['del'] = {
        since: since,
        limit: limit
      };
    }

    return this;
  }

  withLaterDel(limit) {
    return this.withDel(this.topic._maxSeq > 0 ? this.topic._maxDel + 1 : undefined, limit);
  }

  extract(what) {
    return this.what[what];
  }

  build() {
    const what = [];
    let params = {};
    ['data', 'sub', 'desc', 'tags', 'cred', 'del'].forEach(key => {
      if (this.what.hasOwnProperty(key)) {
        what.push(key);

        if (Object.getOwnPropertyNames(this.what[key]).length > 0) {
          params[key] = this.what[key];
        }
      }
    });

    if (what.length > 0) {
      params.what = what.join(' ');
    } else {
      params = undefined;
    }

    return params;
  }

}

exports.default = MetaGetBuilder;

function _get_desc_ims2() {
  return this.topic.updated;
}

function _get_subs_ims2() {
  if (this.topic.isP2PType()) {
    return _classPrivateMethodGet(this, _get_desc_ims, _get_desc_ims2).call(this);
  }

  return this.topic._lastSubsUpdate;
}

},{}],9:[function(require,module,exports){
(function (global){(function (){
/**
 * @file SDK to connect to Tinode chat server.
 * See <a href="https://github.com/tinode/webapp">https://github.com/tinode/webapp</a> for real-life usage.
 *
 * @copyright 2015-2022 Tinode LLC.
 * @summary Javascript bindings for Tinode.
 * @license Apache 2.0
 * @version 0.18
 *
 * @example
 * <head>
 * <script src=".../tinode.js"></script>
 * </head>
 *
 * <body>
 *  ...
 * <script>
 *  // Instantiate tinode.
 *  const tinode = new Tinode(config, () => {
 *    // Called on init completion.
 *  });
 *  tinode.enableLogging(true);
 *  tinode.onDisconnect = (err) => {
 *    // Handle disconnect.
 *  };
 *  // Connect to the server.
 *  tinode.connect('https://example.com/').then(() => {
 *    // Connected. Login now.
 *    return tinode.loginBasic(login, password);
 *  }).then((ctrl) => {
 *    // Logged in fine, attach callbacks, subscribe to 'me'.
 *    const me = tinode.getMeTopic();
 *    me.onMetaDesc = function(meta) { ... };
 *    // Subscribe, fetch topic description and the list of contacts.
 *    me.subscribe({get: {desc: {}, sub: {}}});
 *  }).catch((err) => {
 *    // Login or subscription failed, do something.
 *    ...
 *  });
 *  ...
 * </script>
 * </body>
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Drafty", {
  enumerable: true,
  get: function () {
    return _drafty.default;
  }
});
exports.Tinode = void 0;

var _accessMode = _interopRequireDefault(require("./access-mode.js"));

var Const = _interopRequireWildcard(require("./config.js"));

var _connection = _interopRequireDefault(require("./connection.js"));

var _db = _interopRequireDefault(require("./db.js"));

var _drafty = _interopRequireDefault(require("./drafty.js"));

var _largeFile = _interopRequireDefault(require("./large-file.js"));

var _topic = require("./topic.js");

var _utils = require("./utils.js");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

let WebSocketProvider;

if (typeof WebSocket != 'undefined') {
  WebSocketProvider = WebSocket;
}

let XHRProvider;

if (typeof XMLHttpRequest != 'undefined') {
  XHRProvider = XMLHttpRequest;
}

let IndexedDBProvider;

if (typeof indexedDB != 'undefined') {
  IndexedDBProvider = indexedDB;
}

initForNonBrowserApp();

function initForNonBrowserApp() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  if (typeof btoa == 'undefined') {
    global.btoa = function () {
      let input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      let str = input;
      let output = '';

      for (let block = 0, charCode, i = 0, map = chars; str.charAt(i | 0) || (map = '=', i % 1); output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
        charCode = str.charCodeAt(i += 3 / 4);

        if (charCode > 0xFF) {
          throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        }

        block = block << 8 | charCode;
      }

      return output;
    };
  }

  if (typeof atob == 'undefined') {
    global.atob = function () {
      let input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      let str = input.replace(/=+$/, '');
      let output = '';

      if (str.length % 4 == 1) {
        throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
      }

      for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
      }

      return output;
    };
  }

  if (typeof window == 'undefined') {
    global.window = {
      WebSocket: WebSocketProvider,
      XMLHttpRequest: XHRProvider,
      indexedDB: IndexedDBProvider,
      URL: {
        createObjectURL: function () {
          throw new Error("Unable to use URL.createObjectURL in a non-browser application");
        }
      }
    };
  }

  _connection.default.setNetworkProviders(WebSocketProvider, XHRProvider);

  _largeFile.default.setNetworkProvider(XHRProvider);

  _db.default.setDatabaseProvider(IndexedDBProvider);
}

function detectTransport() {
  if (typeof window == 'object') {
    if (window['WebSocket']) {
      return 'ws';
    } else if (window['XMLHttpRequest']) {
      return 'lp';
    }
  }

  return null;
}

function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
    return String.fromCharCode('0x' + p1);
  }));
}

function jsonBuildHelper(key, val) {
  if (val instanceof Date) {
    val = (0, _utils.rfc3339DateString)(val);
  } else if (val instanceof _accessMode.default) {
    val = val.jsonHelper();
  } else if (val === undefined || val === null || val === false || Array.isArray(val) && val.length == 0 || typeof val == 'object' && Object.keys(val).length == 0) {
    return undefined;
  }

  return val;
}

;

function jsonLoggerHelper(key, val) {
  if (typeof val == 'string' && val.length > 128) {
    return '<' + val.length + ', bytes: ' + val.substring(0, 12) + '...' + val.substring(val.length - 12) + '>';
  }

  return jsonBuildHelper(key, val);
}

;

function getBrowserInfo(ua, product) {
  ua = ua || '';
  let reactnative = '';

  if (/reactnative/i.test(product)) {
    reactnative = 'ReactNative; ';
  }

  let result;
  ua = ua.replace(' (KHTML, like Gecko)', '');
  let m = ua.match(/(AppleWebKit\/[.\d]+)/i);

  if (m) {
    const priority = ['edg', 'chrome', 'safari', 'mobile', 'version'];
    let tmp = ua.substr(m.index + m[0].length).split(' ');
    let tokens = [];
    let version;

    for (let i = 0; i < tmp.length; i++) {
      let m2 = /([\w.]+)[\/]([\.\d]+)/.exec(tmp[i]);

      if (m2) {
        tokens.push([m2[1], m2[2], priority.findIndex(e => {
          return m2[1].toLowerCase().startsWith(e);
        })]);

        if (m2[1] == 'Version') {
          version = m2[2];
        }
      }
    }

    tokens.sort((a, b) => {
      return a[2] - b[2];
    });

    if (tokens.length > 0) {
      if (tokens[0][0].toLowerCase().startsWith('edg')) {
        tokens[0][0] = 'Edge';
      } else if (tokens[0][0] == 'OPR') {
        tokens[0][0] = 'Opera';
      } else if (tokens[0][0] == 'Safari' && version) {
        tokens[0][1] = version;
      }

      result = tokens[0][0] + '/' + tokens[0][1];
    } else {
      result = m[1];
    }
  } else if (/firefox/i.test(ua)) {
    m = /Firefox\/([.\d]+)/g.exec(ua);

    if (m) {
      result = 'Firefox/' + m[1];
    } else {
      result = 'Firefox/?';
    }
  } else {
    m = /([\w.]+)\/([.\d]+)/.exec(ua);

    if (m) {
      result = m[1] + '/' + m[2];
    } else {
      m = ua.split(' ');
      result = m[0];
    }
  }

  m = result.split('/');

  if (m.length > 1) {
    const v = m[1].split('.');
    const minor = v[1] ? '.' + v[1].substr(0, 2) : '';
    result = "".concat(m[0], "/").concat(v[0]).concat(minor);
  }

  return reactnative + result;
}

var _logger = new WeakSet();

var _makePromise = new WeakSet();

var _execPromise = new WeakSet();

var _send = new WeakSet();

var _dispatchMessage = new WeakSet();

var _connectionOpen = new WeakSet();

var _disconnected = new WeakSet();

var _getUserAgent = new WeakSet();

var _initPacket = new WeakSet();

var _cachePut = new WeakSet();

var _cacheGet = new WeakSet();

var _cacheDel = new WeakSet();

var _cacheMap = new WeakSet();

var _attachCacheToTopic = new WeakSet();

var _loginSuccessful = new WeakSet();

class Tinode {
  constructor(config, onComplete) {
    var _this = this;

    _classPrivateMethodInitSpec(this, _loginSuccessful);

    _classPrivateMethodInitSpec(this, _attachCacheToTopic);

    _classPrivateMethodInitSpec(this, _cacheMap);

    _classPrivateMethodInitSpec(this, _cacheDel);

    _classPrivateMethodInitSpec(this, _cacheGet);

    _classPrivateMethodInitSpec(this, _cachePut);

    _classPrivateMethodInitSpec(this, _initPacket);

    _classPrivateMethodInitSpec(this, _getUserAgent);

    _classPrivateMethodInitSpec(this, _disconnected);

    _classPrivateMethodInitSpec(this, _connectionOpen);

    _classPrivateMethodInitSpec(this, _dispatchMessage);

    _classPrivateMethodInitSpec(this, _send);

    _classPrivateMethodInitSpec(this, _execPromise);

    _classPrivateMethodInitSpec(this, _makePromise);

    _classPrivateMethodInitSpec(this, _logger);

    _defineProperty(this, "_host", void 0);

    _defineProperty(this, "_secure", void 0);

    _defineProperty(this, "_appName", void 0);

    _defineProperty(this, "_apiKey", void 0);

    _defineProperty(this, "_browser", '');

    _defineProperty(this, "_platform", void 0);

    _defineProperty(this, "_hwos", 'undefined');

    _defineProperty(this, "_humanLanguage", 'xx');

    _defineProperty(this, "_loggingEnabled", false);

    _defineProperty(this, "_trimLongStrings", false);

    _defineProperty(this, "_myUID", null);

    _defineProperty(this, "_authenticated", false);

    _defineProperty(this, "_login", null);

    _defineProperty(this, "_authToken", null);

    _defineProperty(this, "_inPacketCount", 0);

    _defineProperty(this, "_messageId", Math.floor(Math.random() * 0xFFFF + 0xFFFF));

    _defineProperty(this, "_serverInfo", null);

    _defineProperty(this, "_deviceToken", null);

    _defineProperty(this, "_pendingPromises", {});

    _defineProperty(this, "_expirePromises", null);

    _defineProperty(this, "_connection", null);

    _defineProperty(this, "_persist", false);

    _defineProperty(this, "_db", null);

    _defineProperty(this, "_cache", {});

    _defineProperty(this, "onWebsocketOpen", undefined);

    _defineProperty(this, "onConnect", undefined);

    _defineProperty(this, "onDisconnect", undefined);

    _defineProperty(this, "onLogin", undefined);

    _defineProperty(this, "onCtrlMessage", undefined);

    _defineProperty(this, "onDataMessage", undefined);

    _defineProperty(this, "onPresMessage", undefined);

    _defineProperty(this, "onMessage", undefined);

    _defineProperty(this, "onRawMessage", undefined);

    _defineProperty(this, "onNetworkProbe", undefined);

    _defineProperty(this, "onAutoreconnectIteration", undefined);

    this._host = config.host;
    this._secure = config.secure;
    this._appName = config.appName || "Undefined";
    this._apiKey = config.apiKey;
    this._platform = config.platform || 'web';

    if (typeof navigator != 'undefined') {
      this._browser = getBrowserInfo(navigator.userAgent, navigator.product);
      this._hwos = navigator.platform;
      this._humanLanguage = navigator.language || 'en-US';
    }

    _connection.default.logger = function (str) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      _classPrivateMethodGet(_this, _logger, _logger2).call(_this, str, args);
    };

    _drafty.default.logger = function (str) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      _classPrivateMethodGet(_this, _logger, _logger2).call(_this, str, args);
    };

    if (config.transport != 'lp' && config.transport != 'ws') {
      config.transport = detectTransport();
    }

    this._connection = new _connection.default(config, Const.PROTOCOL_VERSION, true);

    this._connection.onMessage = data => {
      _classPrivateMethodGet(this, _dispatchMessage, _dispatchMessage2).call(this, data);
    };

    this._connection.onOpen = () => {
      _classPrivateMethodGet(this, _connectionOpen, _connectionOpen2).call(this);
    };

    this._connection.onDisconnect = (err, code) => {
      _classPrivateMethodGet(this, _disconnected, _disconnected2).call(this, err, code);
    };

    this._connection.onAutoreconnectIteration = (timeout, promise) => {
      if (this.onAutoreconnectIteration) {
        this.onAutoreconnectIteration(timeout, promise);
      }
    };

    this._persist = config.persist;
    this._db = new _db.default(err => {
      _classPrivateMethodGet(this, _logger, _logger2).call(this, 'DB', err);
    }, this.logger);

    if (this._persist) {
      const prom = [];

      this._db.initDatabase().then(() => {
        return this._db.mapTopics(data => {
          let topic = _classPrivateMethodGet(this, _cacheGet, _cacheGet2).call(this, 'topic', data.name);

          if (topic) {
            return;
          }

          if (data.name == Const.TOPIC_ME) {
            topic = new _topic.TopicMe();
          } else if (data.name == Const.TOPIC_FND) {
            topic = new _topic.TopicFnd();
          } else {
            topic = new _topic.Topic(data.name);
          }

          this._db.deserializeTopic(topic, data);

          _classPrivateMethodGet(this, _attachCacheToTopic, _attachCacheToTopic2).call(this, topic);

          topic._cachePutSelf();

          delete topic._new;
          prom.push(topic._loadMessages(this._db));
        });
      }).then(() => {
        return this._db.mapUsers(data => {
          _classPrivateMethodGet(this, _cachePut, _cachePut2).call(this, 'user', data.uid, (0, _utils.mergeObj)({}, data.public));
        });
      }).then(() => {
        return Promise.all(prom);
      }).then(() => {
        if (onComplete) {
          onComplete();
        }

        _classPrivateMethodGet(this, _logger, _logger2).call(this, "Persistent cache initialized.");
      }).catch(err => {
        if (onComplete) {
          onComplete(err);
        }

        _classPrivateMethodGet(this, _logger, _logger2).call(this, "Failed to initialize persistent cache:", err);
      });
    } else {
      this._db.deleteDatabase().then(() => {
        if (onComplete) {
          onComplete();
        }
      });
    }
  }

  static credential(meth, val, params, resp) {
    if (typeof meth == 'object') {
      ({
        val,
        params,
        resp,
        meth
      } = meth);
    }

    if (meth && (val || resp)) {
      return [{
        'meth': meth,
        'val': val,
        'resp': resp,
        'params': params
      }];
    }

    return null;
  }

  static topicType(name) {
    return _topic.Topic.topicType(name);
  }

  static isMeTopicName(name) {
    return _topic.Topic.isMeTopicName(name);
  }

  static isGroupTopicName(name) {
    return _topic.Topic.isGroupTopicName(name);
  }

  static isP2PTopicName(name) {
    return _topic.Topic.isP2PTopicName(name);
  }

  static isCommTopicName(name) {
    return _topic.Topic.isCommTopicName(name);
  }

  static isNewGroupTopicName(name) {
    return _topic.Topic.isNewGroupTopicName(name);
  }

  static isChannelTopicName(name) {
    return _topic.Topic.isChannelTopicName(name);
  }

  static getVersion() {
    return Const.VERSION;
  }

  static setNetworkProviders(wsProvider, xhrProvider) {
    WebSocketProvider = wsProvider;
    XHRProvider = xhrProvider;

    _connection.default.setNetworkProviders(WebSocketProvider, XHRProvider);

    _largeFile.default.setNetworkProvider(XHRProvider);
  }

  static setDatabaseProvider(idbProvider) {
    IndexedDBProvider = idbProvider;

    _db.default.setDatabaseProvider(IndexedDBProvider);
  }

  static getLibrary() {
    return Const.LIBRARY;
  }

  static isNullValue(str) {
    return str === Const.DEL_CHAR;
  }

  static isRelativeURL(url) {
    return !/^\s*([a-z][a-z0-9+.-]*:|\/\/)/im.test(url);
  }

  getNextUniqueId() {
    return this._messageId != 0 ? '' + this._messageId++ : undefined;
  }

  connect(host_) {
    return this._connection.connect(host_);
  }

  reconnect(force) {
    this._connection.reconnect(force);
  }

  disconnect() {
    this._connection.disconnect();
  }

  clearStorage() {
    if (this._db.isReady()) {
      return this._db.deleteDatabase();
    }

    return Promise.resolve();
  }

  initStorage() {
    if (!this._db.isReady()) {
      return this._db.initDatabase();
    }

    return Promise.resolve();
  }

  networkProbe() {
    this._connection.probe();
  }

  isConnected() {
    return this._connection.isConnected();
  }

  isAuthenticated() {
    return this._authenticated;
  }

  authorizeURL(url) {
    if (typeof url != 'string') {
      return url;
    }

    if (Tinode.isRelativeURL(url)) {
      const base = 'scheme://host/';
      const parsed = new URL(url, base);

      if (this._apiKey) {
        parsed.searchParams.append('apikey', this._apiKey);
      }

      if (this._authToken && this._authToken.token) {
        parsed.searchParams.append('auth', 'token');
        parsed.searchParams.append('secret', this._authToken.token);
      }

      url = parsed.toString().substring(base.length - 1);
    }

    return url;
  }

  account(uid, scheme, secret, login, params) {
    const pkt = _classPrivateMethodGet(this, _initPacket, _initPacket2).call(this, 'acc');

    pkt.acc.user = uid;
    pkt.acc.scheme = scheme;
    pkt.acc.secret = secret;
    pkt.acc.login = login;

    if (params) {
      pkt.acc.desc.defacs = params.defacs;
      pkt.acc.desc.public = params.public;
      pkt.acc.desc.private = params.private;
      pkt.acc.desc.trusted = params.trusted;
      pkt.acc.tags = params.tags;
      pkt.acc.cred = params.cred;
      pkt.acc.token = params.token;

      if (Array.isArray(params.attachments) && params.attachments.length > 0) {
        pkt.extra = {
          attachments: params.attachments.filter(ref => Tinode.isRelativeURL(ref))
        };
      }
    }

    return _classPrivateMethodGet(this, _send, _send2).call(this, pkt, pkt.acc.id);
  }

  createAccount(scheme, secret, login, params) {
    let promise = this.account(USER_NEW, scheme, secret, login, params);

    if (login) {
      promise = promise.then(ctrl => {
        return _classPrivateMethodGet(this, _loginSuccessful, _loginSuccessful2).call(this, ctrl);
      });
    }

    return promise;
  }

  createAccountBasic(username, password, params) {
    username = username || '';
    password = password || '';
    return this.createAccount('basic', b64EncodeUnicode(username + ':' + password), true, params);
  }

  updateAccountBasic(uid, username, password, params) {
    username = username || '';
    password = password || '';
    return this.account(uid, 'basic', b64EncodeUnicode(username + ':' + password), false, params);
  }

  hello() {
    const pkt = _classPrivateMethodGet(this, _initPacket, _initPacket2).call(this, 'hi');

    return _classPrivateMethodGet(this, _send, _send2).call(this, pkt, pkt.hi.id).then(ctrl => {
      this._connection.backoffReset();

      if (ctrl.params) {
        this._serverInfo = ctrl.params;
      }

      if (this.onConnect) {
        this.onConnect();
      }

      return ctrl;
    }).catch(err => {
      this._connection.reconnect(true);

      if (this.onDisconnect) {
        this.onDisconnect(err);
      }
    });
  }

  setDeviceToken(dt) {
    let sent = false;
    dt = dt || null;

    if (dt != this._deviceToken) {
      this._deviceToken = dt;

      if (this.isConnected() && this.isAuthenticated()) {
        _classPrivateMethodGet(this, _send, _send2).call(this, {
          'hi': {
            'dev': dt || Tinode.DEL_CHAR
          }
        });

        sent = true;
      }
    }

    return sent;
  }

  login(scheme, secret, cred) {
    const pkt = _classPrivateMethodGet(this, _initPacket, _initPacket2).call(this, 'login');

    pkt.login.scheme = scheme;
    pkt.login.secret = secret;
    pkt.login.cred = cred;
    return _classPrivateMethodGet(this, _send, _send2).call(this, pkt, pkt.login.id).then(ctrl => {
      return _classPrivateMethodGet(this, _loginSuccessful, _loginSuccessful2).call(this, ctrl);
    });
  }

  loginBasic(uname, password, cred) {
    return this.login('basic', b64EncodeUnicode(uname + ':' + password), cred).then(ctrl => {
      this._login = uname;
      return ctrl;
    });
  }

  loginToken(token, cred) {
    return this.login('token', token, cred);
  }

  requestResetAuthSecret(scheme, method, value) {
    return this.login('reset', b64EncodeUnicode(scheme + ':' + method + ':' + value));
  }

  getAuthToken() {
    if (this._authToken && this._authToken.expires.getTime() > Date.now()) {
      return this._authToken;
    } else {
      this._authToken = null;
    }

    return null;
  }

  setAuthToken(token) {
    this._authToken = token;
  }

  subscribe(topicName, getParams, setParams) {
    const pkt = _classPrivateMethodGet(this, _initPacket, _initPacket2).call(this, 'sub', topicName);

    if (!topicName) {
      topicName = Const.TOPIC_NEW;
    }

    pkt.sub.get = getParams;

    if (setParams) {
      if (setParams.sub) {
        pkt.sub.set.sub = setParams.sub;
      }

      if (setParams.desc) {
        const desc = setParams.desc;

        if (Tinode.isNewGroupTopicName(topicName)) {
          pkt.sub.set.desc = desc;
        } else if (Tinode.isP2PTopicName(topicName) && desc.defacs) {
          pkt.sub.set.desc = {
            defacs: desc.defacs
          };
        }
      }

      if (Array.isArray(setParams.attachments) && setParams.attachments.length > 0) {
        pkt.extra = {
          attachments: setParams.attachments.filter(ref => Tinode.isRelativeURL(ref))
        };
      }

      if (setParams.tags) {
        pkt.sub.set.tags = setParams.tags;
      }
    }

    return _classPrivateMethodGet(this, _send, _send2).call(this, pkt, pkt.sub.id);
  }

  leave(topic, unsub) {
    const pkt = _classPrivateMethodGet(this, _initPacket, _initPacket2).call(this, 'leave', topic);

    pkt.leave.unsub = unsub;
    return _classPrivateMethodGet(this, _send, _send2).call(this, pkt, pkt.leave.id);
  }

  createMessage(topic, content, noEcho) {
    const pkt = _classPrivateMethodGet(this, _initPacket, _initPacket2).call(this, 'pub', topic);

    let dft = typeof content == 'string' ? _drafty.default.parse(content) : content;

    if (dft && !_drafty.default.isPlainText(dft)) {
      pkt.pub.head = {
        mime: _drafty.default.getContentType()
      };
      content = dft;
    }

    pkt.pub.noecho = noEcho;
    pkt.pub.content = content;
    return pkt.pub;
  }

  publish(topic, content, noEcho) {
    return this.publishMessage(this.createMessage(topic, content, noEcho));
  }

  publishMessage(pub, attachments) {
    pub = Object.assign({}, pub);
    pub.seq = undefined;
    pub.from = undefined;
    pub.ts = undefined;
    const msg = {
      pub: pub
    };

    if (attachments) {
      msg.extra = {
        attachments: attachments.filter(ref => Tinode.isRelativeURL(ref))
      };
    }

    return _classPrivateMethodGet(this, _send, _send2).call(this, msg, pub.id);
  }

  oobNotification(what, topicName, seq, act) {
    const topic = _classPrivateMethodGet(this, _cacheGet, _cacheGet2).call(this, 'topic', topicName);

    if (topic) {
      topic._updateReceived(seq, act);

      this.getMeTopic()._refreshContact('msg', topic);
    }
  }

  getMeta(topic, params) {
    const pkt = _classPrivateMethodGet(this, _initPacket, _initPacket2).call(this, 'get', topic);

    pkt.get = (0, _utils.mergeObj)(pkt.get, params);
    return _classPrivateMethodGet(this, _send, _send2).call(this, pkt, pkt.get.id);
  }

  setMeta(topic, params) {
    const pkt = _classPrivateMethodGet(this, _initPacket, _initPacket2).call(this, 'set', topic);

    const what = [];

    if (params) {
      ['desc', 'sub', 'tags', 'cred'].forEach(function (key) {
        if (params.hasOwnProperty(key)) {
          what.push(key);
          pkt.set[key] = params[key];
        }
      });

      if (Array.isArray(params.attachments) && params.attachments.length > 0) {
        pkt.extra = {
          attachments: params.attachments.filter(ref => Tinode.isRelativeURL(ref))
        };
      }
    }

    if (what.length == 0) {
      return Promise.reject(new Error("Invalid {set} parameters"));
    }

    return _classPrivateMethodGet(this, _send, _send2).call(this, pkt, pkt.set.id);
  }

  delMessages(topic, ranges, hard) {
    const pkt = _classPrivateMethodGet(this, _initPacket, _initPacket2).call(this, 'del', topic);

    pkt.del.what = 'msg';
    pkt.del.delseq = ranges;
    pkt.del.hard = hard;
    return _classPrivateMethodGet(this, _send, _send2).call(this, pkt, pkt.del.id);
  }

  delTopic(topicName, hard) {
    const pkt = _classPrivateMethodGet(this, _initPacket, _initPacket2).call(this, 'del', topicName);

    pkt.del.what = 'topic';
    pkt.del.hard = hard;
    return _classPrivateMethodGet(this, _send, _send2).call(this, pkt, pkt.del.id);
  }

  delSubscription(topicName, user) {
    const pkt = _classPrivateMethodGet(this, _initPacket, _initPacket2).call(this, 'del', topicName);

    pkt.del.what = 'sub';
    pkt.del.user = user;
    return _classPrivateMethodGet(this, _send, _send2).call(this, pkt, pkt.del.id);
  }

  delCredential(method, value) {
    const pkt = _classPrivateMethodGet(this, _initPacket, _initPacket2).call(this, 'del', Const.TOPIC_ME);

    pkt.del.what = 'cred';
    pkt.del.cred = {
      meth: method,
      val: value
    };
    return _classPrivateMethodGet(this, _send, _send2).call(this, pkt, pkt.del.id);
  }

  delCurrentUser(hard) {
    const pkt = _classPrivateMethodGet(this, _initPacket, _initPacket2).call(this, 'del', null);

    pkt.del.what = 'user';
    pkt.del.hard = hard;
    return _classPrivateMethodGet(this, _send, _send2).call(this, pkt, pkt.del.id).then(ctrl => {
      this._myUID = null;
    });
  }

  note(topicName, what, seq) {
    if (seq <= 0 || seq >= Const.LOCAL_SEQID) {
      throw new Error("Invalid message id ".concat(seq));
    }

    const pkt = _classPrivateMethodGet(this, _initPacket, _initPacket2).call(this, 'note', topicName);

    pkt.note.what = what;
    pkt.note.seq = seq;

    _classPrivateMethodGet(this, _send, _send2).call(this, pkt);
  }

  noteKeyPress(topicName) {
    const pkt = _classPrivateMethodGet(this, _initPacket, _initPacket2).call(this, 'note', topicName);

    pkt.note.what = 'kp';

    _classPrivateMethodGet(this, _send, _send2).call(this, pkt);
  }

  getTopic(topicName) {
    let topic = _classPrivateMethodGet(this, _cacheGet, _cacheGet2).call(this, 'topic', topicName);

    if (!topic && topicName) {
      if (topicName == Const.TOPIC_ME) {
        topic = new _topic.TopicMe();
      } else if (topicName == Const.TOPIC_FND) {
        topic = new _topic.TopicFnd();
      } else {
        topic = new _topic.Topic(topicName);
      }

      _classPrivateMethodGet(this, _attachCacheToTopic, _attachCacheToTopic2).call(this, topic);

      topic._cachePutSelf();
    }

    return topic;
  }

  cacheGetTopic(topicName) {
    return _classPrivateMethodGet(this, _cacheGet, _cacheGet2).call(this, 'topic', topicName);
  }

  cacheRemTopic(topicName) {
    _classPrivateMethodGet(this, _cacheDel, _cacheDel2).call(this, 'topic', topicName);
  }

  mapTopics(func, context) {
    _classPrivateMethodGet(this, _cacheMap, _cacheMap2).call(this, 'topic', func, context);
  }

  isTopicCached(topicName) {
    return !!_classPrivateMethodGet(this, _cacheGet, _cacheGet2).call(this, 'topic', topicName);
  }

  newGroupTopicName(isChan) {
    return (isChan ? Const.TOPIC_NEW_CHAN : Const.TOPIC_NEW) + this.getNextUniqueId();
  }

  getMeTopic() {
    return this.getTopic(Const.TOPIC_ME);
  }

  getFndTopic() {
    return this.getTopic(Const.TOPIC_FND);
  }

  getLargeFileHelper() {
    return new _largeFile.default(this, Const.PROTOCOL_VERSION);
  }

  getCurrentUserID() {
    return this._myUID;
  }

  isMe(uid) {
    return this._myUID === uid;
  }

  getCurrentLogin() {
    return this._login;
  }

  getServerInfo() {
    return this._serverInfo;
  }

  report(action, target) {
    return this.publish(Const.TOPIC_SYS, _drafty.default.attachJSON(null, {
      'action': action,
      'target': target
    }));
  }

  getServerLimit(name, defaultValue) {
    return (this._serverInfo ? this._serverInfo[name] : null) || defaultValue;
  }

  enableLogging(enabled, trimLongStrings) {
    this._loggingEnabled = enabled;
    this._trimLongStrings = enabled && trimLongStrings;
  }

  setHumanLanguage(hl) {
    if (hl) {
      this._humanLanguage = hl;
    }
  }

  isTopicOnline(name) {
    const topic = _classPrivateMethodGet(this, _cacheGet, _cacheGet2).call(this, 'topic', name);

    return topic && topic.online;
  }

  getTopicAccessMode(name) {
    const topic = _classPrivateMethodGet(this, _cacheGet, _cacheGet2).call(this, 'topic', name);

    return topic ? topic.acs : null;
  }

  wantAkn(status) {
    if (status) {
      this._messageId = Math.floor(Math.random() * 0xFFFFFF + 0xFFFFFF);
    } else {
      this._messageId = 0;
    }
  }

}

exports.Tinode = Tinode;

function _logger2(str) {
  if (this._loggingEnabled) {
    const d = new Date();
    const dateString = ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2) + ':' + ('0' + d.getUTCSeconds()).slice(-2) + '.' + ('00' + d.getUTCMilliseconds()).slice(-3);

    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    console.log('[' + dateString + ']', str, args.join(' '));
  }
}

function _makePromise2(id) {
  let promise = null;

  if (id) {
    promise = new Promise((resolve, reject) => {
      this._pendingPromises[id] = {
        'resolve': resolve,
        'reject': reject,
        'ts': new Date()
      };
    });
  }

  return promise;
}

function _execPromise2(id, code, onOK, errorText) {
  const callbacks = this._pendingPromises[id];

  if (callbacks) {
    delete this._pendingPromises[id];

    if (code >= 200 && code < 400) {
      if (callbacks.resolve) {
        callbacks.resolve(onOK);
      }
    } else if (callbacks.reject) {
      callbacks.reject(new Error("".concat(errorText, " (").concat(code, ")")));
    }
  }
}

function _send2(pkt, id) {
  let promise;

  if (id) {
    promise = _classPrivateMethodGet(this, _makePromise, _makePromise2).call(this, id);
  }

  pkt = (0, _utils.simplify)(pkt);
  let msg = JSON.stringify(pkt);

  _classPrivateMethodGet(this, _logger, _logger2).call(this, "out: " + (this._trimLongStrings ? JSON.stringify(pkt, jsonLoggerHelper) : msg));

  try {
    this._connection.sendText(msg);
  } catch (err) {
    if (id) {
      _classPrivateMethodGet(this, _execPromise, _execPromise2).call(this, id, _connection.default.NETWORK_ERROR, null, err.message);
    } else {
      throw err;
    }
  }

  return promise;
}

function _dispatchMessage2(data) {
  if (!data) return;
  this._inPacketCount++;

  if (this.onRawMessage) {
    this.onRawMessage(data);
  }

  if (data === '0') {
    if (this.onNetworkProbe) {
      this.onNetworkProbe();
    }

    return;
  }

  let pkt = JSON.parse(data, _utils.jsonParseHelper);

  if (!pkt) {
    _classPrivateMethodGet(this, _logger, _logger2).call(this, "in: " + data);

    _classPrivateMethodGet(this, _logger, _logger2).call(this, "ERROR: failed to parse data");
  } else {
    _classPrivateMethodGet(this, _logger, _logger2).call(this, "in: " + (this._trimLongStrings ? JSON.stringify(pkt, jsonLoggerHelper) : data));

    if (this.onMessage) {
      this.onMessage(pkt);
    }

    if (pkt.ctrl) {
      if (this.onCtrlMessage) {
        this.onCtrlMessage(pkt.ctrl);
      }

      if (pkt.ctrl.id) {
        _classPrivateMethodGet(this, _execPromise, _execPromise2).call(this, pkt.ctrl.id, pkt.ctrl.code, pkt.ctrl, pkt.ctrl.text);
      }

      setTimeout(() => {
        if (pkt.ctrl.code == 205 && pkt.ctrl.text == 'evicted') {
          const topic = _classPrivateMethodGet(this, _cacheGet, _cacheGet2).call(this, 'topic', pkt.ctrl.topic);

          if (topic) {
            topic._resetSub();

            if (pkt.ctrl.params && pkt.ctrl.params.unsub) {
              topic._gone();
            }
          }
        } else if (pkt.ctrl.code < 300 && pkt.ctrl.params) {
          if (pkt.ctrl.params.what == 'data') {
            const topic = _classPrivateMethodGet(this, _cacheGet, _cacheGet2).call(this, 'topic', pkt.ctrl.topic);

            if (topic) {
              topic._allMessagesReceived(pkt.ctrl.params.count);
            }
          } else if (pkt.ctrl.params.what == 'sub') {
            const topic = _classPrivateMethodGet(this, _cacheGet, _cacheGet2).call(this, 'topic', pkt.ctrl.topic);

            if (topic) {
              topic._processMetaSub([]);
            }
          }
        }
      }, 0);
    } else {
      setTimeout(() => {
        if (pkt.meta) {
          const topic = _classPrivateMethodGet(this, _cacheGet, _cacheGet2).call(this, 'topic', pkt.meta.topic);

          if (topic) {
            topic._routeMeta(pkt.meta);
          }

          if (pkt.meta.id) {
            _classPrivateMethodGet(this, _execPromise, _execPromise2).call(this, pkt.meta.id, 200, pkt.meta, 'META');
          }

          if (this.onMetaMessage) {
            this.onMetaMessage(pkt.meta);
          }
        } else if (pkt.data) {
          const topic = _classPrivateMethodGet(this, _cacheGet, _cacheGet2).call(this, 'topic', pkt.data.topic);

          if (topic) {
            topic._routeData(pkt.data);
          }

          if (this.onDataMessage) {
            this.onDataMessage(pkt.data);
          }
        } else if (pkt.pres) {
          const topic = _classPrivateMethodGet(this, _cacheGet, _cacheGet2).call(this, 'topic', pkt.pres.topic);

          if (topic) {
            topic._routePres(pkt.pres);
          }

          if (this.onPresMessage) {
            this.onPresMessage(pkt.pres);
          }
        } else if (pkt.info) {
          const topic = _classPrivateMethodGet(this, _cacheGet, _cacheGet2).call(this, 'topic', pkt.info.topic);

          if (topic) {
            topic._routeInfo(pkt.info);
          }

          if (this.onInfoMessage) {
            this.onInfoMessage(pkt.info);
          }
        } else {
          _classPrivateMethodGet(this, _logger, _logger2).call(this, "ERROR: Unknown packet received.");
        }
      }, 0);
    }
  }
}

function _connectionOpen2() {
  if (!this._expirePromises) {
    this._expirePromises = setInterval(() => {
      const err = new Error("Timeout (504)");
      const expires = new Date(new Date().getTime() - Const.EXPIRE_PROMISES_TIMEOUT);

      for (let id in this._pendingPromises) {
        let callbacks = this._pendingPromises[id];

        if (callbacks && callbacks.ts < expires) {
          _classPrivateMethodGet(this, _logger, _logger2).call(this, "Promise expired", id);

          delete this._pendingPromises[id];

          if (callbacks.reject) {
            callbacks.reject(err);
          }
        }
      }
    }, Const.EXPIRE_PROMISES_PERIOD);
  }

  this.hello();
}

function _disconnected2(err, code) {
  this._inPacketCount = 0;
  this._serverInfo = null;
  this._authenticated = false;

  if (this._expirePromises) {
    clearInterval(this._expirePromises);
    this._expirePromises = null;
  }

  _classPrivateMethodGet(this, _cacheMap, _cacheMap2).call(this, 'topic', (topic, key) => {
    topic._resetSub();
  });

  for (let key in this._pendingPromises) {
    const callbacks = this._pendingPromises[key];

    if (callbacks && callbacks.reject) {
      callbacks.reject(err);
    }
  }

  this._pendingPromises = {};

  if (this.onDisconnect) {
    this.onDisconnect(err);
  }
}

function _getUserAgent2() {
  return this._appName + ' (' + (this._browser ? this._browser + '; ' : '') + this._hwos + '); ' + Const.LIBRARY;
}

function _initPacket2(type, topic) {
  switch (type) {
    case 'hi':
      return {
        'hi': {
          'id': this.getNextUniqueId(),
          'ver': Const.VERSION,
          'ua': _classPrivateMethodGet(this, _getUserAgent, _getUserAgent2).call(this),
          'dev': this._deviceToken,
          'lang': this._humanLanguage,
          'platf': this._platform
        }
      };

    case 'acc':
      return {
        'acc': {
          'id': this.getNextUniqueId(),
          'user': null,
          'scheme': null,
          'secret': null,
          'login': false,
          'tags': null,
          'desc': {},
          'cred': {}
        }
      };

    case 'login':
      return {
        'login': {
          'id': this.getNextUniqueId(),
          'scheme': null,
          'secret': null
        }
      };

    case 'sub':
      return {
        'sub': {
          'id': this.getNextUniqueId(),
          'topic': topic,
          'set': {},
          'get': {}
        }
      };

    case 'leave':
      return {
        'leave': {
          'id': this.getNextUniqueId(),
          'topic': topic,
          'unsub': false
        }
      };

    case 'pub':
      return {
        'pub': {
          'id': this.getNextUniqueId(),
          'topic': topic,
          'noecho': false,
          'head': null,
          'content': {}
        }
      };

    case 'get':
      return {
        'get': {
          'id': this.getNextUniqueId(),
          'topic': topic,
          'what': null,
          'desc': {},
          'sub': {},
          'data': {}
        }
      };

    case 'set':
      return {
        'set': {
          'id': this.getNextUniqueId(),
          'topic': topic,
          'desc': {},
          'sub': {},
          'tags': []
        }
      };

    case 'del':
      return {
        'del': {
          'id': this.getNextUniqueId(),
          'topic': topic,
          'what': null,
          'delseq': null,
          'user': null,
          'hard': false
        }
      };

    case 'note':
      return {
        'note': {
          'topic': topic,
          'what': null,
          'seq': undefined
        }
      };

    default:
      throw new Error("Unknown packet type requested: ".concat(type));
  }
}

function _cachePut2(type, name, obj) {
  this._cache[type + ':' + name] = obj;
}

function _cacheGet2(type, name) {
  return this._cache[type + ':' + name];
}

function _cacheDel2(type, name) {
  delete this._cache[type + ':' + name];
}

function _cacheMap2(type, func, context) {
  const key = type ? type + ':' : undefined;

  for (let idx in this._cache) {
    if (!key || idx.indexOf(key) == 0) {
      if (func.call(context, this._cache[idx], idx)) {
        break;
      }
    }
  }
}

function _attachCacheToTopic2(topic) {
  topic._tinode = this;

  topic._cacheGetUser = uid => {
    const pub = _classPrivateMethodGet(this, _cacheGet, _cacheGet2).call(this, 'user', uid);

    if (pub) {
      return {
        user: uid,
        public: (0, _utils.mergeObj)({}, pub)
      };
    }

    return undefined;
  };

  topic._cachePutUser = (uid, user) => {
    _classPrivateMethodGet(this, _cachePut, _cachePut2).call(this, 'user', uid, (0, _utils.mergeObj)({}, user.public));
  };

  topic._cacheDelUser = uid => {
    _classPrivateMethodGet(this, _cacheDel, _cacheDel2).call(this, 'user', uid);
  };

  topic._cachePutSelf = () => {
    _classPrivateMethodGet(this, _cachePut, _cachePut2).call(this, 'topic', topic.name, topic);
  };

  topic._cacheDelSelf = () => {
    _classPrivateMethodGet(this, _cacheDel, _cacheDel2).call(this, 'topic', topic.name);
  };
}

function _loginSuccessful2(ctrl) {
  if (!ctrl.params || !ctrl.params.user) {
    return ctrl;
  }

  this._myUID = ctrl.params.user;
  this._authenticated = ctrl && ctrl.code >= 200 && ctrl.code < 300;

  if (ctrl.params && ctrl.params.token && ctrl.params.expires) {
    this._authToken = {
      token: ctrl.params.token,
      expires: ctrl.params.expires
    };
  } else {
    this._authToken = null;
  }

  if (this.onLogin) {
    this.onLogin(ctrl.code, ctrl.text);
  }

  return ctrl;
}

;
Tinode.MESSAGE_STATUS_NONE = Const.MESSAGE_STATUS_NONE;
Tinode.MESSAGE_STATUS_QUEUED = Const.MESSAGE_STATUS_QUEUED;
Tinode.MESSAGE_STATUS_SENDING = Const.MESSAGE_STATUS_SENDING;
Tinode.MESSAGE_STATUS_FAILED = Const.MESSAGE_STATUS_FAILED;
Tinode.MESSAGE_STATUS_SENT = Const.MESSAGE_STATUS_SENT;
Tinode.MESSAGE_STATUS_RECEIVED = Const.MESSAGE_STATUS_RECEIVED;
Tinode.MESSAGE_STATUS_READ = Const.MESSAGE_STATUS_READ;
Tinode.MESSAGE_STATUS_TO_ME = Const.MESSAGE_STATUS_TO_ME;
Tinode.MESSAGE_STATUS_DEL_RANGE = Const.MESSAGE_STATUS_DEL_RANGE;
Tinode.DEL_CHAR = Const.DEL_CHAR;
Tinode.MAX_MESSAGE_SIZE = 'maxMessageSize';
Tinode.MAX_SUBSCRIBER_COUNT = 'maxSubscriberCount';
Tinode.MAX_TAG_COUNT = 'maxTagCount';
Tinode.MAX_FILE_UPLOAD_SIZE = 'maxFileUploadSize';

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./access-mode.js":1,"./config.js":3,"./connection.js":4,"./db.js":5,"./drafty.js":6,"./large-file.js":7,"./topic.js":10,"./utils.js":11}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TopicMe = exports.TopicFnd = exports.Topic = void 0;

var _accessMode = _interopRequireDefault(require("./access-mode.js"));

var _cbuffer = _interopRequireDefault(require("./cbuffer.js"));

var Const = _interopRequireWildcard(require("./config.js"));

var _drafty = _interopRequireDefault(require("./drafty.js"));

var _metaBuilder = _interopRequireDefault(require("./meta-builder.js"));

var _utils = require("./utils.js");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Topic {
  constructor(name, callbacks) {
    this._tinode = null;
    this.name = name;
    this.created = null;
    this.updated = null;
    this.touched = new Date(0);
    this.acs = new _accessMode.default(null);
    this.private = null;
    this.public = null;
    this.trusted = null;
    this._users = {};
    this._queuedSeqId = Const.LOCAL_SEQID;
    this._maxSeq = 0;
    this._minSeq = 0;
    this._noEarlierMsgs = false;
    this._maxDel = 0;
    this._tags = [];
    this._credentials = [];
    this._messages = new _cbuffer.default((a, b) => {
      return a.seq - b.seq;
    }, true);
    this._attached = false;
    this._lastSubsUpdate = new Date(0);
    this._new = true;
    this._deleted = false;

    if (callbacks) {
      this.onData = callbacks.onData;
      this.onMeta = callbacks.onMeta;
      this.onPres = callbacks.onPres;
      this.onInfo = callbacks.onInfo;
      this.onMetaDesc = callbacks.onMetaDesc;
      this.onMetaSub = callbacks.onMetaSub;
      this.onSubsUpdated = callbacks.onSubsUpdated;
      this.onTagsUpdated = callbacks.onTagsUpdated;
      this.onCredsUpdated = callbacks.onCredsUpdated;
      this.onDeleteTopic = callbacks.onDeleteTopic;
      this.onAllMessagesReceived = callbacks.onAllMessagesReceived;
    }
  }

  static topicType(name) {
    const types = {
      'me': Const.TOPIC_ME,
      'fnd': Const.TOPIC_FND,
      'grp': Const.TOPIC_GRP,
      'new': Const.TOPIC_GRP,
      'nch': Const.TOPIC_GRP,
      'chn': Const.TOPIC_GRP,
      'usr': Const.TOPIC_P2P,
      'sys': Const.TOPIC_SYS
    };
    return types[typeof name == 'string' ? name.substring(0, 3) : 'xxx'];
  }

  static isMeTopicName(name) {
    return Topic.topicType(name) == Const.TOPIC_ME;
  }

  static isGroupTopicName(name) {
    return Topic.topicType(name) == Const.TOPIC_GRP;
  }

  static isP2PTopicName(name) {
    return Topic.topicType(name) == Const.TOPIC_P2P;
  }

  static isCommTopicName(name) {
    return Topic.isP2PTopicName(name) || Topic.isGroupTopicName(name);
  }

  static isNewGroupTopicName(name) {
    return typeof name == 'string' && (name.substring(0, 3) == Const.TOPIC_NEW || name.substring(0, 3) == Const.TOPIC_NEW_CHAN);
  }

  static isChannelTopicName(name) {
    return typeof name == 'string' && (name.substring(0, 3) == Const.TOPIC_CHAN || name.substring(0, 3) == Const.TOPIC_NEW_CHAN);
  }

  isSubscribed() {
    return this._attached;
  }

  subscribe(getParams, setParams) {
    if (this._attached) {
      return Promise.resolve(this);
    }

    if (this._deleted) {
      return Promise.reject(new Error("Conversation deleted"));
    }

    return this._tinode.subscribe(this.name || Const.TOPIC_NEW, getParams, setParams).then(ctrl => {
      if (ctrl.code >= 300) {
        return ctrl;
      }

      this._attached = true;
      this._deleted = false;
      this.acs = ctrl.params && ctrl.params.acs ? ctrl.params.acs : this.acs;

      if (this._new) {
        delete this._new;

        if (this.name != ctrl.topic) {
          this._cacheDelSelf();

          this.name = ctrl.topic;
        }

        this._cachePutSelf();

        this.created = ctrl.ts;
        this.updated = ctrl.ts;

        if (this.name != Const.TOPIC_ME && this.name != Const.TOPIC_FND) {
          const me = this._tinode.getMeTopic();

          if (me.onMetaSub) {
            me.onMetaSub(this);
          }

          if (me.onSubsUpdated) {
            me.onSubsUpdated([this.name], 1);
          }
        }

        if (setParams && setParams.desc) {
          setParams.desc._noForwarding = true;

          this._processMetaDesc(setParams.desc);
        }
      }

      return ctrl;
    });
  }

  createMessage(data, noEcho) {
    return this._tinode.createMessage(this.name, data, noEcho);
  }

  publish(data, noEcho) {
    return this.publishMessage(this.createMessage(data, noEcho));
  }

  publishMessage(pub) {
    if (!this._attached) {
      return Promise.reject(new Error("Cannot publish on inactive topic"));
    }

    if (this._sending) {
      return Promise.reject(new Error("The message is already being sent"));
    }

    pub._sending = true;
    pub._failed = false;
    let attachments = null;

    if (_drafty.default.hasEntities(pub.content)) {
      attachments = [];

      _drafty.default.entities(pub.content, data => {
        if (data && data.ref) {
          attachments.push(data.ref);
        }
      });

      if (attachments.length == 0) {
        attachments = null;
      }
    }

    return this._tinode.publishMessage(pub, attachments).then(ctrl => {
      pub._sending = false;
      pub.ts = ctrl.ts;
      this.swapMessageId(pub, ctrl.params.seq);

      this._routeData(pub);

      return ctrl;
    }).catch(err => {
      this._tinode.logger("WARNING: Message rejected by the server", err);

      pub._sending = false;
      pub._failed = true;

      if (this.onData) {
        this.onData();
      }
    });
  }

  publishDraft(pub, prom) {
    const seq = pub.seq || this._getQueuedSeqId();

    if (!pub._noForwarding) {
      pub._noForwarding = true;
      pub.seq = seq;
      pub.ts = new Date();
      pub.from = this._tinode.getCurrentUserID();
      pub.noecho = true;

      this._messages.put(pub);

      this._tinode._db.addMessage(pub);

      if (this.onData) {
        this.onData(pub);
      }
    }

    return (prom || Promise.resolve()).then(_ => {
      if (pub._cancelled) {
        return {
          code: 300,
          text: "cancelled"
        };
      }

      return this.publishMessage(pub);
    }).catch(err => {
      this._tinode.logger("WARNING: Message draft rejected", err);

      pub._sending = false;
      pub._failed = true;

      if (this.onData) {
        this.onData();
      }

      throw err;
    });
  }

  leave(unsub) {
    if (!this._attached && !unsub) {
      return Promise.reject(new Error("Cannot leave inactive topic"));
    }

    return this._tinode.leave(this.name, unsub).then(ctrl => {
      this._resetSub();

      if (unsub) {
        this._gone();
      }

      return ctrl;
    });
  }

  getMeta(params) {
    return this._tinode.getMeta(this.name, params);
  }

  getMessagesPage(limit, forward) {
    let query = forward ? this.startMetaQuery().withLaterData(limit) : this.startMetaQuery().withEarlierData(limit);
    return this._loadMessages(this._tinode._db, query.extract('data')).then(count => {
      if (count == limit) {
        return Promise.resolve({
          topic: this.name,
          code: 200,
          params: {
            count: count
          }
        });
      }

      limit -= count;
      query = forward ? this.startMetaQuery().withLaterData(limit) : this.startMetaQuery().withEarlierData(limit);
      let promise = this.getMeta(query.build());

      if (!forward) {
        promise = promise.then(ctrl => {
          if (ctrl && ctrl.params && !ctrl.params.count) {
            this._noEarlierMsgs = true;
          }
        });
      }

      return promise;
    });
  }

  setMeta(params) {
    if (params.tags) {
      params.tags = (0, _utils.normalizeArray)(params.tags);
    }

    return this._tinode.setMeta(this.name, params).then(ctrl => {
      if (ctrl && ctrl.code >= 300) {
        return ctrl;
      }

      if (params.sub) {
        params.sub.topic = this.name;

        if (ctrl.params && ctrl.params.acs) {
          params.sub.acs = ctrl.params.acs;
          params.sub.updated = ctrl.ts;
        }

        if (!params.sub.user) {
          params.sub.user = this._tinode.getCurrentUserID();

          if (!params.desc) {
            params.desc = {};
          }
        }

        params.sub._noForwarding = true;

        this._processMetaSub([params.sub]);
      }

      if (params.desc) {
        if (ctrl.params && ctrl.params.acs) {
          params.desc.acs = ctrl.params.acs;
          params.desc.updated = ctrl.ts;
        }

        this._processMetaDesc(params.desc);
      }

      if (params.tags) {
        this._processMetaTags(params.tags);
      }

      if (params.cred) {
        this._processMetaCreds([params.cred], true);
      }

      return ctrl;
    });
  }

  updateMode(uid, update) {
    const user = uid ? this.subscriber(uid) : null;
    const am = user ? user.acs.updateGiven(update).getGiven() : this.getAccessMode().updateWant(update).getWant();
    return this.setMeta({
      sub: {
        user: uid,
        mode: am
      }
    });
  }

  invite(uid, mode) {
    return this.setMeta({
      sub: {
        user: uid,
        mode: mode
      }
    });
  }

  archive(arch) {
    if (this.private && !this.private.arch == !arch) {
      return Promise.resolve(arch);
    }

    return this.setMeta({
      desc: {
        private: {
          arch: arch ? true : Const.DEL_CHAR
        }
      }
    });
  }

  delMessages(ranges, hard) {
    if (!this._attached) {
      return Promise.reject(new Error("Cannot delete messages in inactive topic"));
    }

    ranges.sort((r1, r2) => {
      if (r1.low < r2.low) {
        return true;
      }

      if (r1.low == r2.low) {
        return !r2.hi || r1.hi >= r2.hi;
      }

      return false;
    });
    let tosend = ranges.reduce((out, r) => {
      if (r.low < Const.LOCAL_SEQID) {
        if (!r.hi || r.hi < Const.LOCAL_SEQID) {
          out.push(r);
        } else {
          out.push({
            low: r.low,
            hi: this._maxSeq + 1
          });
        }
      }

      return out;
    }, []);
    let result;

    if (tosend.length > 0) {
      result = this._tinode.delMessages(this.name, tosend, hard);
    } else {
      result = Promise.resolve({
        params: {
          del: 0
        }
      });
    }

    return result.then(ctrl => {
      if (ctrl.params.del > this._maxDel) {
        this._maxDel = ctrl.params.del;
      }

      ranges.forEach(r => {
        if (r.hi) {
          this.flushMessageRange(r.low, r.hi);
        } else {
          this.flushMessage(r.low);
        }
      });

      this._updateDeletedRanges();

      if (this.onData) {
        this.onData();
      }

      return ctrl;
    });
  }

  delMessagesAll(hardDel) {
    if (!this._maxSeq || this._maxSeq <= 0) {
      return Promise.resolve();
    }

    return this.delMessages([{
      low: 1,
      hi: this._maxSeq + 1,
      _all: true
    }], hardDel);
  }

  delMessagesList(list, hardDel) {
    list.sort((a, b) => a - b);
    let ranges = list.reduce((out, id) => {
      if (out.length == 0) {
        out.push({
          low: id
        });
      } else {
        let prev = out[out.length - 1];

        if (!prev.hi && id != prev.low + 1 || id > prev.hi) {
          out.push({
            low: id
          });
        } else {
          prev.hi = prev.hi ? Math.max(prev.hi, id + 1) : id + 1;
        }
      }

      return out;
    }, []);
    return this.delMessages(ranges, hardDel);
  }

  delTopic(hard) {
    if (this._deleted) {
      this._gone();

      return new Promise.resolve(null);
    }

    return this._tinode.delTopic(this.name, hard).then(ctrl => {
      this._resetSub();

      this._gone();

      return ctrl;
    });
  }

  delSubscription(user) {
    if (!this._attached) {
      return Promise.reject(new Error("Cannot delete subscription in inactive topic"));
    }

    return this._tinode.delSubscription(this.name, user).then(ctrl => {
      delete this._users[user];

      if (this.onSubsUpdated) {
        this.onSubsUpdated(Object.keys(this._users));
      }

      return ctrl;
    });
  }

  note(what, seq) {
    if (!this._attached) {
      return;
    }

    const user = this._users[this._tinode.getCurrentUserID()];

    let update = false;

    if (user) {
      if (!user[what] || user[what] < seq) {
        user[what] = seq;
        update = true;
      }
    } else {
      update = (this[what] | 0) < seq;
    }

    if (update) {
      this._tinode.note(this.name, what, seq);

      this._updateReadRecv(what, seq);

      if (this.acs != null && !this.acs.isMuted()) {
        const me = this._tinode.getMeTopic();

        me._refreshContact(what, this);
      }
    }
  }

  noteRecv(seq) {
    this.note('recv', seq);
  }

  noteRead(seq) {
    seq = seq || this._maxSeq;

    if (seq > 0) {
      this.note('read', seq);
    }
  }

  noteKeyPress() {
    if (this._attached) {
      this._tinode.noteKeyPress(this.name);
    } else {
      this._tinode.logger("INFO: Cannot send notification in inactive topic");
    }
  }

  _updateReadRecv(what, seq, ts) {
    let oldVal,
        doUpdate = false;
    seq = seq | 0;
    this.seq = this.seq | 0;
    this.read = this.read | 0;
    this.recv = this.recv | 0;

    switch (what) {
      case 'recv':
        oldVal = this.recv;
        this.recv = Math.max(this.recv, seq);
        doUpdate = oldVal != this.recv;
        break;

      case 'read':
        oldVal = this.read;
        this.read = Math.max(this.read, seq);
        doUpdate = oldVal != this.read;
        break;

      case 'msg':
        oldVal = this.seq;
        this.seq = Math.max(this.seq, seq);

        if (!this.touched || this.touched < ts) {
          this.touched = ts;
        }

        doUpdate = oldVal != this.seq;
        break;
    }

    if (this.recv < this.read) {
      this.recv = this.read;
      doUpdate = true;
    }

    if (this.seq < this.recv) {
      this.seq = this.recv;

      if (!this.touched || this.touched < ts) {
        this.touched = ts;
      }

      doUpdate = true;
    }

    this.unread = this.seq - this.read;
    return doUpdate;
  }

  userDesc(uid) {
    const user = this._cacheGetUser(uid);

    if (user) {
      return user;
    }
  }

  p2pPeerDesc() {
    if (!this.isP2PType()) {
      return undefined;
    }

    return this._users[this.name];
  }

  subscribers(callback, context) {
    const cb = callback || this.onMetaSub;

    if (cb) {
      for (let idx in this._users) {
        cb.call(context, this._users[idx], idx, this._users);
      }
    }
  }

  tags() {
    return this._tags.slice(0);
  }

  subscriber(uid) {
    return this._users[uid];
  }

  messages(callback, sinceId, beforeId, context) {
    const cb = callback || this.onData;

    if (cb) {
      const startIdx = typeof sinceId == 'number' ? this._messages.find({
        seq: sinceId
      }, true) : undefined;
      const beforeIdx = typeof beforeId == 'number' ? this._messages.find({
        seq: beforeId
      }, true) : undefined;

      if (startIdx != -1 && beforeIdx != -1) {
        this._messages.forEach(cb, startIdx, beforeIdx, context);
      }
    }
  }

  findMessage(seq) {
    const idx = this._messages.find({
      seq: seq
    });

    if (idx >= 0) {
      return this._messages.getAt(idx);
    }

    return undefined;
  }

  latestMessage(skipDeleted) {
    const msg = this._messages.getLast();

    if (!skipDeleted || !msg || msg._status != Const.MESSAGE_STATUS_DEL_RANGE) {
      return msg;
    }

    return this._messages.getLast(1);
  }

  maxMsgSeq() {
    return this._maxSeq;
  }

  maxClearId() {
    return this._maxDel;
  }

  messageCount() {
    return this._messages.length();
  }

  queuedMessages(callback, context) {
    if (!callback) {
      throw new Error("Callback must be provided");
    }

    this.messages(callback, Const.LOCAL_SEQID, undefined, context);
  }

  msgReceiptCount(what, seq) {
    let count = 0;

    if (seq > 0) {
      const me = this._tinode.getCurrentUserID();

      for (let idx in this._users) {
        const user = this._users[idx];

        if (user.user !== me && user[what] >= seq) {
          count++;
        }
      }
    }

    return count;
  }

  msgReadCount(seq) {
    return this.msgReceiptCount('read', seq);
  }

  msgRecvCount(seq) {
    return this.msgReceiptCount('recv', seq);
  }

  msgHasMoreMessages(newer) {
    return newer ? this.seq > this._maxSeq : this._minSeq > 1 && !this._noEarlierMsgs;
  }

  isNewMessage(seqId) {
    return this._maxSeq <= seqId;
  }

  flushMessage(seqId) {
    const idx = this._messages.find({
      seq: seqId
    });

    if (idx >= 0) {
      this._tinode._db.remMessages(this.name, seqId);

      return this._messages.delAt(idx);
    }

    return undefined;
  }

  swapMessageId(pub, newSeqId) {
    const idx = this._messages.find(pub);

    const numMessages = this._messages.length();

    if (0 <= idx && idx < numMessages) {
      this._messages.delAt(idx);

      this._tinode._db.remMessages(this.name, pub.seq);

      pub.seq = newSeqId;

      this._messages.put(pub);

      this._tinode._db.addMessage(pub);
    }
  }

  flushMessageRange(fromId, untilId) {
    this._tinode._db.remMessages(this.name, fromId, untilId);

    const since = this._messages.find({
      seq: fromId
    }, true);

    return since >= 0 ? this._messages.delRange(since, this._messages.find({
      seq: untilId
    }, true)) : [];
  }

  cancelSend(seqId) {
    const idx = this._messages.find({
      seq: seqId
    });

    if (idx >= 0) {
      const msg = this._messages.getAt(idx);

      const status = this.msgStatus(msg);

      if (status == Const.MESSAGE_STATUS_QUEUED || status == Const.MESSAGE_STATUS_FAILED) {
        this._tinode._db.remMessages(this.name, seqId);

        msg._cancelled = true;

        this._messages.delAt(idx);

        if (this.onData) {
          this.onData();
        }

        return true;
      }
    }

    return false;
  }

  getType() {
    return Topic.topicType(this.name);
  }

  getAccessMode() {
    return this.acs;
  }

  setAccessMode(acs) {
    return this.acs = new _accessMode.default(acs);
  }

  getDefaultAccess() {
    return this.defacs;
  }

  startMetaQuery() {
    return new _metaBuilder.default(this);
  }

  isArchived() {
    return this.private && !!this.private.arch;
  }

  isMeType() {
    return Topic.isMeTopicName(this.name);
  }

  isChannelType() {
    return Topic.isChannelTopicName(this.name);
  }

  isGroupType() {
    return Topic.isGroupTopicName(this.name);
  }

  isP2PType() {
    return Topic.isP2PTopicName(this.name);
  }

  isCommType() {
    return Topic.isCommTopicName(this.name);
  }

  msgStatus(msg, upd) {
    let status = Const.MESSAGE_STATUS_NONE;

    if (this._tinode.isMe(msg.from)) {
      if (msg._sending) {
        status = Const.MESSAGE_STATUS_SENDING;
      } else if (msg._failed || msg._cancelled) {
        status = Const.MESSAGE_STATUS_FAILED;
      } else if (msg.seq >= Const.LOCAL_SEQID) {
        status = Const.MESSAGE_STATUS_QUEUED;
      } else if (this.msgReadCount(msg.seq) > 0) {
        status = Const.MESSAGE_STATUS_READ;
      } else if (this.msgRecvCount(msg.seq) > 0) {
        status = Const.MESSAGE_STATUS_RECEIVED;
      } else if (msg.seq > 0) {
        status = Const.MESSAGE_STATUS_SENT;
      }
    } else if (msg._status == Const.MESSAGE_STATUS_DEL_RANGE) {
      status == Const.MESSAGE_STATUS_DEL_RANGE;
    } else {
      status = Const.MESSAGE_STATUS_TO_ME;
    }

    if (upd && msg._status != status) {
      msg._status = status;

      this._tinode._db.updMessageStatus(this.name, msg.seq, status);
    }

    return status;
  }

  _routeData(data) {
    if (data.content) {
      if (!this.touched || this.touched < data.ts) {
        this.touched = data.ts;

        this._tinode._db.updTopic(this);
      }
    }

    if (data.seq > this._maxSeq) {
      this._maxSeq = data.seq;
    }

    if (data.seq < this._minSeq || this._minSeq == 0) {
      this._minSeq = data.seq;
    }

    if (!data._noForwarding) {
      this._messages.put(data);

      this._tinode._db.addMessage(data);

      this._updateDeletedRanges();
    }

    if (this.onData) {
      this.onData(data);
    }

    const what = !this.isChannelType() && !data.from || this._tinode.isMe(data.from) ? 'read' : 'msg';

    this._updateReadRecv(what, data.seq, data.ts);

    this._tinode.getMeTopic()._refreshContact(what, this);
  }

  _routeMeta(meta) {
    if (meta.desc) {
      this._processMetaDesc(meta.desc);
    }

    if (meta.sub && meta.sub.length > 0) {
      this._processMetaSub(meta.sub);
    }

    if (meta.del) {
      this._processDelMessages(meta.del.clear, meta.del.delseq);
    }

    if (meta.tags) {
      this._processMetaTags(meta.tags);
    }

    if (meta.cred) {
      this._processMetaCreds(meta.cred);
    }

    if (this.onMeta) {
      this.onMeta(meta);
    }
  }

  _routePres(pres) {
    let user, uid;

    switch (pres.what) {
      case 'del':
        this._processDelMessages(pres.clear, pres.delseq);

        break;

      case 'on':
      case 'off':
        user = this._users[pres.src];

        if (user) {
          user.online = pres.what == 'on';
        } else {
          this._tinode.logger("WARNING: Presence update for an unknown user", this.name, pres.src);
        }

        break;

      case 'term':
        this._resetSub();

        break;

      case 'upd':
        if (pres.src && !this._tinode.isTopicCached(pres.src)) {
          this.getMeta(this.startMetaQuery().withLaterOneSub(pres.src).build());
        }

        break;

      case 'acs':
        uid = pres.src || this._tinode.getCurrentUserID();
        user = this._users[uid];

        if (!user) {
          const acs = new _accessMode.default().updateAll(pres.dacs);

          if (acs && acs.mode != _accessMode.default._NONE) {
            user = this._cacheGetUser(uid);

            if (!user) {
              user = {
                user: uid,
                acs: acs
              };
              this.getMeta(this.startMetaQuery().withOneSub(undefined, uid).build());
            } else {
              user.acs = acs;
            }

            user.updated = new Date();

            this._processMetaSub([user]);
          }
        } else {
          user.acs.updateAll(pres.dacs);

          this._processMetaSub([{
            user: uid,
            updated: new Date(),
            acs: user.acs
          }]);
        }

        break;

      default:
        this._tinode.logger("INFO: Ignored presence update", pres.what);

    }

    if (this.onPres) {
      this.onPres(pres);
    }
  }

  _routeInfo(info) {
    if (info.what !== 'kp') {
      const user = this._users[info.from];

      if (user) {
        user[info.what] = info.seq;

        if (user.recv < user.read) {
          user.recv = user.read;
        }
      }

      const msg = this.latestMessage();

      if (msg) {
        this.msgStatus(msg, true);
      }

      if (this._tinode.isMe(info.from)) {
        this._updateReadRecv(info.what, info.seq);
      }

      this._tinode.getMeTopic()._refreshContact(info.what, this);
    }

    if (this.onInfo) {
      this.onInfo(info);
    }
  }

  _processMetaDesc(desc) {
    if (this.isP2PType()) {
      delete desc.defacs;

      this._tinode._db.updUser(this.name, desc.public);
    }

    (0, _utils.mergeObj)(this, desc);

    this._tinode._db.updTopic(this);

    if (this.name !== Const.TOPIC_ME && !desc._noForwarding) {
      const me = this._tinode.getMeTopic();

      if (me.onMetaSub) {
        me.onMetaSub(this);
      }

      if (me.onSubsUpdated) {
        me.onSubsUpdated([this.name], 1);
      }
    }

    if (this.onMetaDesc) {
      this.onMetaDesc(this);
    }
  }

  _processMetaSub(subs) {
    for (let idx in subs) {
      const sub = subs[idx];
      sub.online = !!sub.online;
      this._lastSubsUpdate = new Date(Math.max(this._lastSubsUpdate, sub.updated));
      let user = null;

      if (!sub.deleted) {
        if (this._tinode.isMe(sub.user) && sub.acs) {
          this._processMetaDesc({
            updated: sub.updated,
            touched: sub.touched,
            acs: sub.acs
          });
        }

        user = this._updateCachedUser(sub.user, sub);
      } else {
        delete this._users[sub.user];
        user = sub;
      }

      if (this.onMetaSub) {
        this.onMetaSub(user);
      }
    }

    if (this.onSubsUpdated) {
      this.onSubsUpdated(Object.keys(this._users));
    }
  }

  _processMetaTags(tags) {
    if (tags.length == 1 && tags[0] == Const.DEL_CHAR) {
      tags = [];
    }

    this._tags = tags;

    if (this.onTagsUpdated) {
      this.onTagsUpdated(tags);
    }
  }

  _processMetaCreds(creds) {}

  _processDelMessages(clear, delseq) {
    this._maxDel = Math.max(clear, this._maxDel);
    this.clear = Math.max(clear, this.clear);
    const topic = this;
    let count = 0;

    if (Array.isArray(delseq)) {
      delseq.forEach(function (range) {
        if (!range.hi) {
          count++;
          topic.flushMessage(range.low);
        } else {
          for (let i = range.low; i < range.hi; i++) {
            count++;
            topic.flushMessage(i);
          }
        }
      });
    }

    if (count > 0) {
      this._updateDeletedRanges();

      if (this.onData) {
        this.onData();
      }
    }
  }

  _allMessagesReceived(count) {
    this._updateDeletedRanges();

    if (this.onAllMessagesReceived) {
      this.onAllMessagesReceived(count);
    }
  }

  _resetSub() {
    this._attached = false;
  }

  _gone() {
    this._messages.reset();

    this._tinode._db.remMessages(this.name);

    this._users = {};
    this.acs = new _accessMode.default(null);
    this.private = null;
    this.public = null;
    this.trusted = null;
    this._maxSeq = 0;
    this._minSeq = 0;
    this._attached = false;

    const me = this._tinode.getMeTopic();

    if (me) {
      me._routePres({
        _noForwarding: true,
        what: 'gone',
        topic: Const.TOPIC_ME,
        src: this.name
      });
    }

    if (this.onDeleteTopic) {
      this.onDeleteTopic();
    }
  }

  _updateCachedUser(uid, obj) {
    let cached = this._cacheGetUser(uid);

    cached = (0, _utils.mergeObj)(cached || {}, obj);

    this._cachePutUser(uid, cached);

    return (0, _utils.mergeToCache)(this._users, uid, cached);
  }

  _getQueuedSeqId() {
    return this._queuedSeqId++;
  }

  _updateDeletedRanges() {
    const ranges = [];
    let prev = null;

    const first = this._messages.getAt(0);

    if (first && this._minSeq > 1 && !this._noEarlierMsgs) {
      if (first.hi) {
        if (first.seq > 1) {
          first.seq = 1;
        }

        if (first.hi < this._minSeq - 1) {
          first.hi = this._minSeq - 1;
        }

        prev = first;
      } else {
        prev = {
          seq: 1,
          hi: this._minSeq - 1
        };
        ranges.push(prev);
      }
    } else {
      prev = {
        seq: 0,
        hi: 0
      };
    }

    this._messages.filter(data => {
      if (data.seq >= Const.LOCAL_SEQID) {
        return true;
      }

      if (data.seq == (prev.hi || prev.seq) + 1) {
        if (data.hi && prev.hi) {
          prev.hi = data.hi;
          return false;
        }

        prev = data;
        return true;
      }

      if (prev.hi) {
        prev.hi = data.hi || data.seq;
      } else {
        prev = {
          seq: prev.seq + 1,
          hi: data.hi || data.seq
        };
        ranges.push(prev);
      }

      if (!data.hi) {
        prev = data;
        return true;
      }

      return false;
    });

    const last = this._messages.getLast();

    const maxSeq = Math.max(this.seq, this._maxSeq) || 0;

    if (maxSeq > 0 && !last || last && (last.hi || last.seq) < maxSeq) {
      if (last && last.hi) {
        last.hi = maxSeq;
      } else {
        ranges.push({
          seq: last ? last.seq + 1 : 1,
          hi: maxSeq
        });
      }
    }

    ranges.forEach(gap => {
      gap._status = Const.MESSAGE_STATUS_DEL_RANGE;

      this._messages.put(gap);
    });
  }

  _loadMessages(db, params) {
    const {
      since,
      before,
      limit
    } = params || {};
    return db.readMessages(this.name, {
      since: since,
      before: before,
      limit: limit || Const.DEFAULT_MESSAGES_PAGE
    }).then(msgs => {
      msgs.forEach(data => {
        if (data.seq > this._maxSeq) {
          this._maxSeq = data.seq;
        }

        if (data.seq < this._minSeq || this._minSeq == 0) {
          this._minSeq = data.seq;
        }

        this._messages.put(data);
      });

      if (msgs.length > 0) {
        this._updateDeletedRanges();
      }

      return msgs.length;
    });
  }

  _updateReceived(seq, act) {
    this.touched = new Date();
    this.seq = seq | 0;

    if (!act || this._tinode.isMe(act)) {
      this.read = this.read ? Math.max(this.read, this.seq) : this.seq;
      this.recv = this.recv ? Math.max(this.read, this.recv) : this.read;
    }

    this.unread = this.seq - (this.read | 0);

    this._tinode._db.updTopic(this);
  }

}

exports.Topic = Topic;

class TopicMe extends Topic {
  constructor(callbacks) {
    super(Const.TOPIC_ME, callbacks);

    _defineProperty(this, "onContactUpdate", void 0);

    if (callbacks) {
      this.onContactUpdate = callbacks.onContactUpdate;
    }
  }

  _processMetaDesc(desc) {
    const turnOff = desc.acs && !desc.acs.isPresencer() && this.acs && this.acs.isPresencer();
    (0, _utils.mergeObj)(this, desc);

    this._tinode._db.updTopic(this);

    this._updateCachedUser(this._tinode._myUID, desc);

    if (turnOff) {
      this._tinode.mapTopics(cont => {
        if (cont.online) {
          cont.online = false;
          cont.seen = Object.assign(cont.seen || {}, {
            when: new Date()
          });

          this._refreshContact('off', cont);
        }
      });
    }

    if (this.onMetaDesc) {
      this.onMetaDesc(this);
    }
  }

  _processMetaSub(subs) {
    let updateCount = 0;
    subs.forEach(sub => {
      const topicName = sub.topic;

      if (topicName == Const.TOPIC_FND || topicName == Const.TOPIC_ME) {
        return;
      }

      sub.online = !!sub.online;
      let cont = null;

      if (sub.deleted) {
        cont = sub;

        this._tinode.cacheRemTopic(topicName);

        this._tinode._db.remTopic(topicName);
      } else {
        if (typeof sub.seq != 'undefined') {
          sub.seq = sub.seq | 0;
          sub.recv = sub.recv | 0;
          sub.read = sub.read | 0;
          sub.unread = sub.seq - sub.read;
        }

        const topic = this._tinode.getTopic(topicName);

        cont = (0, _utils.mergeObj)(topic, sub);

        this._tinode._db.updTopic(cont);

        if (Topic.isP2PTopicName(topicName)) {
          this._cachePutUser(topicName, cont);

          this._tinode._db.updUser(topicName, cont.public);
        }

        if (!sub._noForwarding && topic) {
          sub._noForwarding = true;

          topic._processMetaDesc(sub);
        }
      }

      updateCount++;

      if (this.onMetaSub) {
        this.onMetaSub(cont);
      }
    });

    if (this.onSubsUpdated && updateCount > 0) {
      const keys = [];
      subs.forEach(s => {
        keys.push(s.topic);
      });
      this.onSubsUpdated(keys, updateCount);
    }
  }

  _processMetaCreds(creds, upd) {
    if (creds.length == 1 && creds[0] == Const.DEL_CHAR) {
      creds = [];
    }

    if (upd) {
      creds.forEach(cr => {
        if (cr.val) {
          let idx = this._credentials.findIndex(el => {
            return el.meth == cr.meth && el.val == cr.val;
          });

          if (idx < 0) {
            if (!cr.done) {
              idx = this._credentials.findIndex(el => {
                return el.meth == cr.meth && !el.done;
              });

              if (idx >= 0) {
                this._credentials.splice(idx, 1);
              }
            }

            this._credentials.push(cr);
          } else {
            this._credentials[idx].done = cr.done;
          }
        } else if (cr.resp) {
          const idx = this._credentials.findIndex(el => {
            return el.meth == cr.meth && !el.done;
          });

          if (idx >= 0) {
            this._credentials[idx].done = true;
          }
        }
      });
    } else {
      this._credentials = creds;
    }

    if (this.onCredsUpdated) {
      this.onCredsUpdated(this._credentials);
    }
  }

  _routePres(pres) {
    if (pres.what == 'term') {
      this._resetSub();

      return;
    }

    if (pres.what == 'upd' && pres.src == Const.TOPIC_ME) {
      this.getMeta(this.startMetaQuery().withDesc().build());
      return;
    }

    const cont = this._tinode.cacheGetTopic(pres.src);

    if (cont) {
      switch (pres.what) {
        case 'on':
          cont.online = true;
          break;

        case 'off':
          if (cont.online) {
            cont.online = false;
            cont.seen = Object.assign(cont.seen || {}, {
              when: new Date()
            });
          }

          break;

        case 'msg':
          cont._updateReceived(pres.seq, pres.act);

          break;

        case 'upd':
          this.getMeta(this.startMetaQuery().withLaterOneSub(pres.src).build());
          break;

        case 'acs':
          if (cont.acs) {
            cont.acs.updateAll(pres.dacs);
          } else {
            cont.acs = new _accessMode.default().updateAll(pres.dacs);
          }

          cont.touched = new Date();
          break;

        case 'ua':
          cont.seen = {
            when: new Date(),
            ua: pres.ua
          };
          break;

        case 'recv':
          pres.seq = pres.seq | 0;
          cont.recv = cont.recv ? Math.max(cont.recv, pres.seq) : pres.seq;
          break;

        case 'read':
          pres.seq = pres.seq | 0;
          cont.read = cont.read ? Math.max(cont.read, pres.seq) : pres.seq;
          cont.recv = cont.recv ? Math.max(cont.read, cont.recv) : cont.recv;
          cont.unread = cont.seq - cont.read;
          break;

        case 'gone':
          if (!cont._deleted) {
            cont._deleted = true;
            cont._attached = false;

            this._tinode._db.markTopicAsDeleted(pres.src, true);
          }

          break;

        case 'del':
          break;

        default:
          this._tinode.logger("INFO: Unsupported presence update in 'me'", pres.what);

      }

      this._refreshContact(pres.what, cont);
    } else {
      if (pres.what == 'acs') {
        const acs = new _accessMode.default(pres.dacs);

        if (!acs || acs.mode == _accessMode.default._INVALID) {
          this._tinode.logger("ERROR: Invalid access mode update", pres.src, pres.dacs);

          return;
        } else if (acs.mode == _accessMode.default._NONE) {
          this._tinode.logger("WARNING: Removing non-existent subscription", pres.src, pres.dacs);

          return;
        } else {
          this.getMeta(this.startMetaQuery().withOneSub(undefined, pres.src).build());

          const dummy = this._tinode.getTopic(pres.src);

          dummy.topic = pres.src;
          dummy.online = false;
          dummy.acs = acs;

          this._tinode._db.updTopic(dummy);
        }
      } else if (pres.what == 'tags') {
        this.getMeta(this.startMetaQuery().withTags().build());
      }
    }

    if (this.onPres) {
      this.onPres(pres);
    }
  }

  _refreshContact(what, cont) {
    if (this.onContactUpdate) {
      this.onContactUpdate(what, cont);
    }
  }

  publish() {
    return Promise.reject(new Error("Publishing to 'me' is not supported"));
  }

  delCredential(method, value) {
    if (!this._attached) {
      return Promise.reject(new Error("Cannot delete credential in inactive 'me' topic"));
    }

    return this._tinode.delCredential(method, value).then(ctrl => {
      const index = this._credentials.findIndex(el => {
        return el.meth == method && el.val == value;
      });

      if (index > -1) {
        this._credentials.splice(index, 1);
      }

      if (this.onCredsUpdated) {
        this.onCredsUpdated(this._credentials);
      }

      return ctrl;
    });
  }

  contacts(callback, filter, context) {
    this._tinode.mapTopics((c, idx) => {
      if (c.isCommType() && (!filter || filter(c))) {
        callback.call(context, c, idx);
      }
    });
  }

  getContact(name) {
    return this._tinode.cacheGetTopic(name);
  }

  getAccessMode(name) {
    if (name) {
      const cont = this._tinode.cacheGetTopic(name);

      return cont ? cont.acs : null;
    }

    return this.acs;
  }

  isArchived(name) {
    const cont = this._tinode.cacheGetTopic(name);

    return cont && cont.private && !!cont.private.arch;
  }

  getCredentials() {
    return this._credentials;
  }

}

exports.TopicMe = TopicMe;

class TopicFnd extends Topic {
  constructor(callbacks) {
    super(Const.TOPIC_FND, callbacks);

    _defineProperty(this, "_contacts", {});
  }

  _processMetaSub(subs) {
    let updateCount = Object.getOwnPropertyNames(this._contacts).length;
    this._contacts = {};

    for (let idx in subs) {
      let sub = subs[idx];
      const indexBy = sub.topic ? sub.topic : sub.user;
      sub = (0, _utils.mergeToCache)(this._contacts, indexBy, sub);
      updateCount++;

      if (this.onMetaSub) {
        this.onMetaSub(sub);
      }
    }

    if (updateCount > 0 && this.onSubsUpdated) {
      this.onSubsUpdated(Object.keys(this._contacts));
    }
  }

  publish() {
    return Promise.reject(new Error("Publishing to 'fnd' is not supported"));
  }

  setMeta(params) {
    return Object.getPrototypeOf(TopicFnd.prototype).setMeta.call(this, params).then(() => {
      if (Object.keys(this._contacts).length > 0) {
        this._contacts = {};

        if (this.onSubsUpdated) {
          this.onSubsUpdated([]);
        }
      }
    });
  }

  contacts(callback, context) {
    const cb = callback || this.onMetaSub;

    if (cb) {
      for (let idx in this._contacts) {
        cb.call(context, this._contacts[idx], idx, this._contacts);
      }
    }
  }

}

exports.TopicFnd = TopicFnd;

},{"./access-mode.js":1,"./cbuffer.js":2,"./config.js":3,"./drafty.js":6,"./meta-builder.js":8,"./utils.js":11}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isUrlRelative = isUrlRelative;
exports.jsonParseHelper = jsonParseHelper;
exports.mergeObj = mergeObj;
exports.mergeToCache = mergeToCache;
exports.normalizeArray = normalizeArray;
exports.rfc3339DateString = rfc3339DateString;
exports.simplify = simplify;

var _accessMode = _interopRequireDefault(require("./access-mode.js"));

var _config = _interopRequireDefault(require("./config.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function jsonParseHelper(key, val) {
  if (typeof val == 'string' && val.length >= 20 && val.length <= 24 && ['ts', 'touched', 'updated', 'created', 'when', 'deleted', 'expires'].includes(key)) {
    const date = new Date(val);

    if (!isNaN(date)) {
      return date;
    }
  } else if (key === 'acs' && typeof val === 'object') {
    return new _accessMode.default(val);
  }

  return val;
}

function isUrlRelative(url) {
  return url && !/^\s*([a-z][a-z0-9+.-]*:|\/\/)/im.test(url);
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d) && d.getTime() != 0;
}

function rfc3339DateString(d) {
  if (!isValidDate(d)) {
    return undefined;
  }

  const pad = function (val, sp) {
    sp = sp || 2;
    return '0'.repeat(sp - ('' + val).length) + val;
  };

  const millis = d.getUTCMilliseconds();
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + (millis ? '.' + pad(millis, 3) : '') + 'Z';
}

function mergeObj(dst, src, ignore) {
  if (typeof src != 'object') {
    if (src === undefined) {
      return dst;
    }

    if (src === _config.default) {
      return undefined;
    }

    return src;
  }

  if (src === null) {
    return src;
  }

  if (src instanceof Date && !isNaN(src)) {
    return !dst || !(dst instanceof Date) || isNaN(dst) || dst < src ? src : dst;
  }

  if (src instanceof _accessMode.default) {
    return new _accessMode.default(src);
  }

  if (src instanceof Array) {
    return src;
  }

  if (!dst || dst === _config.default) {
    dst = src.constructor();
  }

  for (let prop in src) {
    if (src.hasOwnProperty(prop) && (!ignore || !ignore[prop]) && prop != '_noForwarding') {
      dst[prop] = mergeObj(dst[prop], src[prop]);
    }
  }

  return dst;
}

function mergeToCache(cache, key, newval, ignore) {
  cache[key] = mergeObj(cache[key], newval, ignore);
  return cache[key];
}

function simplify(obj) {
  Object.keys(obj).forEach(key => {
    if (key[0] == '_') {
      delete obj[key];
    } else if (!obj[key]) {
      delete obj[key];
    } else if (Array.isArray(obj[key]) && obj[key].length == 0) {
      delete obj[key];
    } else if (!obj[key]) {
      delete obj[key];
    } else if (obj[key] instanceof Date) {
      if (!isValidDate(obj[key])) {
        delete obj[key];
      }
    } else if (typeof obj[key] == 'object') {
      simplify(obj[key]);

      if (Object.getOwnPropertyNames(obj[key]).length == 0) {
        delete obj[key];
      }
    }
  });
  return obj;
}

;

function normalizeArray(arr) {
  let out = [];

  if (Array.isArray(arr)) {
    for (let i = 0, l = arr.length; i < l; i++) {
      let t = arr[i];

      if (t) {
        t = t.trim().toLowerCase();

        if (t.length > 1) {
          out.push(t);
        }
      }
    }

    out.sort().filter(function (item, pos, ary) {
      return !pos || item != ary[pos - 1];
    });
  }

  if (out.length == 0) {
    out.push(_config.default);
  }

  return out;
}

},{"./access-mode.js":1,"./config.js":3}],12:[function(require,module,exports){
module.exports={"version": "0.19.0-alpha1"}

},{}]},{},[9])(9)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWNjZXNzLW1vZGUuanMiLCJzcmMvY2J1ZmZlci5qcyIsInNyYy9jb25maWcuanMiLCJzcmMvY29ubmVjdGlvbi5qcyIsInNyYy9kYi5qcyIsInNyYy9kcmFmdHkuanMiLCJzcmMvbGFyZ2UtZmlsZS5qcyIsInNyYy9tZXRhLWJ1aWxkZXIuanMiLCJzcmMvdGlub2RlLmpzIiwic3JjL3RvcGljLmpzIiwic3JjL3V0aWxzLmpzIiwidmVyc2lvbi5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDS0E7Ozs7Ozs7Ozs7O0FBY2UsTUFBTSxVQUFOLENBQWlCO0FBQzlCLEVBQUEsV0FBVyxDQUFDLEdBQUQsRUFBTTtBQUNmLFFBQUksR0FBSixFQUFTO0FBQ1AsV0FBSyxLQUFMLEdBQWEsT0FBTyxHQUFHLENBQUMsS0FBWCxJQUFvQixRQUFwQixHQUErQixHQUFHLENBQUMsS0FBbkMsR0FBMkMsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsR0FBRyxDQUFDLEtBQXRCLENBQXhEO0FBQ0EsV0FBSyxJQUFMLEdBQVksT0FBTyxHQUFHLENBQUMsSUFBWCxJQUFtQixRQUFuQixHQUE4QixHQUFHLENBQUMsSUFBbEMsR0FBeUMsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsR0FBRyxDQUFDLElBQXRCLENBQXJEO0FBQ0EsV0FBSyxJQUFMLEdBQVksR0FBRyxDQUFDLElBQUosR0FBWSxPQUFPLEdBQUcsQ0FBQyxJQUFYLElBQW1CLFFBQW5CLEdBQThCLEdBQUcsQ0FBQyxJQUFsQyxHQUF5QyxVQUFVLENBQUMsTUFBWCxDQUFrQixHQUFHLENBQUMsSUFBdEIsQ0FBckQsR0FDVCxLQUFLLEtBQUwsR0FBYSxLQUFLLElBRHJCO0FBRUQ7QUFDRjs7QUFpQlksU0FBTixNQUFNLENBQUMsR0FBRCxFQUFNO0FBQ2pCLFFBQUksQ0FBQyxHQUFMLEVBQVU7QUFDUixhQUFPLElBQVA7QUFDRCxLQUZELE1B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LEdBQUcsRUFBVjs7QUFDQSxNQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxDQUFKLEVBQXdCO0FBRXRCLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBUixFQUFXLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBeEIsRUFBZ0MsQ0FBQyxHQUFHLENBQXBDLEVBQXVDLENBQUMsRUFBeEMsRUFBNEM7QUFDMUMsVUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUQsQ0FBWDs7QUFDQSxVQUFJLENBQUosRUFBTztBQUNMLFFBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFGLEdBQVMsV0FBVCxFQUFKOztBQUNBLFlBQUksQ0FBQyxDQUFDLE1BQUYsR0FBVyxDQUFmLEVBQWtCO0FBQ2hCLFVBQUEsR0FBRyxDQUFDLElBQUosQ0FBUyxDQUFUO0FBQ0Q7QUFDRjtBQUNGOztBQUNELElBQUEsR0FBRyxDQUFDLElBQUosR0FBVyxNQUFYLENBQWtCLFVBQVMsSUFBVCxFQUFlLEdBQWYsRUFBb0IsR0FBcEIsRUFBeUI7QUFDekMsYUFBTyxDQUFDLEdBQUQsSUFBUSxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFQLENBQTFCO0FBQ0QsS0FGRDtBQUdEOztBQUNELE1BQUksR0FBRyxDQUFDLE1BQUosSUFBYyxDQUFsQixFQUFxQjtBQUduQixJQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsZUFBVDtBQUNEOztBQUNELFNBQU8sR0FBUDtBQUNEOzs7QUN0S0Q7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogQGZpbGUgQWNjZXNzIGNvbnRyb2wgbW9kZWwuXG4gKlxuICogQGNvcHlyaWdodCAyMDE1LTIwMjIgVGlub2RlIExMQy5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyBOT1RFIFRPIERFVkVMT1BFUlM6XG4vLyBMb2NhbGl6YWJsZSBzdHJpbmdzIHNob3VsZCBiZSBkb3VibGUgcXVvdGVkIFwi0YHRgtGA0L7QutCwINC90LAg0LTRgNGD0LPQvtC8INGP0LfRi9C60LVcIixcbi8vIG5vbi1sb2NhbGl6YWJsZSBzdHJpbmdzIHNob3VsZCBiZSBzaW5nbGUgcXVvdGVkICdub24tbG9jYWxpemVkJy5cblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgZm9yIGhhbmRsaW5nIGFjY2VzcyBtb2RlLlxuICpcbiAqIEBjbGFzcyBBY2Nlc3NNb2RlXG4gKiBAbWVtYmVyb2YgVGlub2RlXG4gKlxuICogQHBhcmFtIHtBY2Nlc3NNb2RlfE9iamVjdD19IGFjcyAtIEFjY2Vzc01vZGUgdG8gY29weSBvciBhY2Nlc3MgbW9kZSBvYmplY3QgcmVjZWl2ZWQgZnJvbSB0aGUgc2VydmVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBY2Nlc3NNb2RlIHtcbiAgY29uc3RydWN0b3IoYWNzKSB7XG4gICAgaWYgKGFjcykge1xuICAgICAgdGhpcy5naXZlbiA9IHR5cGVvZiBhY3MuZ2l2ZW4gPT0gJ251bWJlcicgPyBhY3MuZ2l2ZW4gOiBBY2Nlc3NNb2RlLmRlY29kZShhY3MuZ2l2ZW4pO1xuICAgICAgdGhpcy53YW50ID0gdHlwZW9mIGFjcy53YW50ID09ICdudW1iZXInID8gYWNzLndhbnQgOiBBY2Nlc3NNb2RlLmRlY29kZShhY3Mud2FudCk7XG4gICAgICB0aGlzLm1vZGUgPSBhY3MubW9kZSA/ICh0eXBlb2YgYWNzLm1vZGUgPT0gJ251bWJlcicgPyBhY3MubW9kZSA6IEFjY2Vzc01vZGUuZGVjb2RlKGFjcy5tb2RlKSkgOlxuICAgICAgICAodGhpcy5naXZlbiAmIHRoaXMud2FudCk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljICNjaGVja0ZsYWcodmFsLCBzaWRlLCBmbGFnKSB7XG4gICAgc2lkZSA9IHNpZGUgfHwgJ21vZGUnO1xuICAgIGlmIChbJ2dpdmVuJywgJ3dhbnQnLCAnbW9kZSddLmluY2x1ZGVzKHNpZGUpKSB7XG4gICAgICByZXR1cm4gKCh2YWxbc2lkZV0gJiBmbGFnKSAhPSAwKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIEFjY2Vzc01vZGUgY29tcG9uZW50ICcke3NpZGV9J2ApO1xuICB9XG4gIC8qKlxuICAgKiBQYXJzZSBzdHJpbmcgaW50byBhbiBhY2Nlc3MgbW9kZSB2YWx1ZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBOdW1iZXJ9IG1vZGUgLSBlaXRoZXIgYSBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFjY2VzcyBtb2RlIHRvIHBhcnNlIG9yIGEgc2V0IG9mIGJpdHMgdG8gYXNzaWduLlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIEFjY2VzcyBtb2RlIGFzIGEgbnVtZXJpYyB2YWx1ZS5cbiAgICovXG4gIHN0YXRpYyBkZWNvZGUoc3RyKSB7XG4gICAgaWYgKCFzdHIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHN0ciA9PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIHN0ciAmIEFjY2Vzc01vZGUuX0JJVE1BU0s7XG4gICAgfSBlbHNlIGlmIChzdHIgPT09ICdOJyB8fCBzdHIgPT09ICduJykge1xuICAgICAgcmV0dXJuIEFjY2Vzc01vZGUuX05PTkU7XG4gICAgfVxuXG4gICAgY29uc3QgYml0bWFzayA9IHtcbiAgICAgICdKJzogQWNjZXNzTW9kZS5fSk9JTixcbiAgICAgICdSJzogQWNjZXNzTW9kZS5fUkVBRCxcbiAgICAgICdXJzogQWNjZXNzTW9kZS5fV1JJVEUsXG4gICAgICAnUCc6IEFjY2Vzc01vZGUuX1BSRVMsXG4gICAgICAnQSc6IEFjY2Vzc01vZGUuX0FQUFJPVkUsXG4gICAgICAnUyc6IEFjY2Vzc01vZGUuX1NIQVJFLFxuICAgICAgJ0QnOiBBY2Nlc3NNb2RlLl9ERUxFVEUsXG4gICAgICAnTyc6IEFjY2Vzc01vZGUuX09XTkVSXG4gICAgfTtcblxuICAgIGxldCBtMCA9IEFjY2Vzc01vZGUuX05PTkU7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgYml0ID0gYml0bWFza1tzdHIuY2hhckF0KGkpLnRvVXBwZXJDYXNlKCldO1xuICAgICAgaWYgKCFiaXQpIHtcbiAgICAgICAgLy8gVW5yZWNvZ25pemVkIGJpdCwgc2tpcC5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBtMCB8PSBiaXQ7XG4gICAgfVxuICAgIHJldHVybiBtMDtcbiAgfVxuICAvKipcbiAgICogQ29udmVydCBudW1lcmljIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhY2Nlc3MgbW9kZSBpbnRvIGEgc3RyaW5nLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsIC0gYWNjZXNzIG1vZGUgdmFsdWUgdG8gY29udmVydCB0byBhIHN0cmluZy5cbiAgICogQHJldHVybnMge3N0cmluZ30gLSBBY2Nlc3MgbW9kZSBhcyBhIHN0cmluZy5cbiAgICovXG4gIHN0YXRpYyBlbmNvZGUodmFsKSB7XG4gICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IEFjY2Vzc01vZGUuX0lOVkFMSUQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAodmFsID09PSBBY2Nlc3NNb2RlLl9OT05FKSB7XG4gICAgICByZXR1cm4gJ04nO1xuICAgIH1cblxuICAgIGNvbnN0IGJpdG1hc2sgPSBbJ0onLCAnUicsICdXJywgJ1AnLCAnQScsICdTJywgJ0QnLCAnTyddO1xuICAgIGxldCByZXMgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpdG1hc2subGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICgodmFsICYgKDEgPDwgaSkpICE9IDApIHtcbiAgICAgICAgcmVzID0gcmVzICsgYml0bWFza1tpXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICogVXBkYXRlIG51bWVyaWMgcmVwcmVzZW50YXRpb24gb2YgYWNjZXNzIG1vZGUgd2l0aCB0aGUgbmV3IHZhbHVlLiBUaGUgdmFsdWVcbiAgICogaXMgb25lIG9mIHRoZSBmb2xsb3dpbmc6XG4gICAqICAtIGEgc3RyaW5nIHN0YXJ0aW5nIHdpdGggPGNvZGU+JysnPC9jb2RlPiBvciA8Y29kZT4nLSc8L2NvZGU+IHRoZW4gdGhlIGJpdHMgdG8gYWRkIG9yIHJlbW92ZSwgZS5nLiA8Y29kZT4nK1ItVyc8L2NvZGU+IG9yIDxjb2RlPictUFMnPC9jb2RlPi5cbiAgICogIC0gYSBuZXcgdmFsdWUgb2YgYWNjZXNzIG1vZGVcbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbCAtIGFjY2VzcyBtb2RlIHZhbHVlIHRvIHVwZGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVwZCAtIHVwZGF0ZSB0byBhcHBseSB0byB2YWwuXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gdXBkYXRlZCBhY2Nlc3MgbW9kZS5cbiAgICovXG4gIHN0YXRpYyB1cGRhdGUodmFsLCB1cGQpIHtcbiAgICBpZiAoIXVwZCB8fCB0eXBlb2YgdXBkICE9ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cblxuICAgIGxldCBhY3Rpb24gPSB1cGQuY2hhckF0KDApO1xuICAgIGlmIChhY3Rpb24gPT0gJysnIHx8IGFjdGlvbiA9PSAnLScpIHtcbiAgICAgIGxldCB2YWwwID0gdmFsO1xuICAgICAgLy8gU3BsaXQgZGVsdGEtc3RyaW5nIGxpa2UgJytBQkMtREVGK1onIGludG8gYW4gYXJyYXkgb2YgcGFydHMgaW5jbHVkaW5nICsgYW5kIC0uXG4gICAgICBjb25zdCBwYXJ0cyA9IHVwZC5zcGxpdCgvKFstK10pLyk7XG4gICAgICAvLyBTdGFydGluZyBpdGVyYXRpb24gZnJvbSAxIGJlY2F1c2UgU3RyaW5nLnNwbGl0KCkgY3JlYXRlcyBhbiBhcnJheSB3aXRoIHRoZSBmaXJzdCBlbXB0eSBlbGVtZW50LlxuICAgICAgLy8gSXRlcmF0aW5nIGJ5IDIgYmVjYXVzZSB3ZSBwYXJzZSBwYWlycyArLy0gdGhlbiBkYXRhLlxuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpICs9IDIpIHtcbiAgICAgICAgYWN0aW9uID0gcGFydHNbaV07XG4gICAgICAgIGNvbnN0IG0wID0gQWNjZXNzTW9kZS5kZWNvZGUocGFydHNbaSArIDFdKTtcbiAgICAgICAgaWYgKG0wID09IEFjY2Vzc01vZGUuX0lOVkFMSUQpIHtcbiAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtMCA9PSBudWxsKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGlvbiA9PT0gJysnKSB7XG4gICAgICAgICAgdmFsMCB8PSBtMDtcbiAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICctJykge1xuICAgICAgICAgIHZhbDAgJj0gfm0wO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YWwgPSB2YWwwO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgc3RyaW5nIGlzIGFuIGV4cGxpY2l0IG5ldyB2YWx1ZSAnQUJDJyByYXRoZXIgdGhhbiBkZWx0YS5cbiAgICAgIGNvbnN0IHZhbDAgPSBBY2Nlc3NNb2RlLmRlY29kZSh1cGQpO1xuICAgICAgaWYgKHZhbDAgIT0gQWNjZXNzTW9kZS5fSU5WQUxJRCkge1xuICAgICAgICB2YWwgPSB2YWwwO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2YWw7XG4gIH1cbiAgLyoqXG4gICAqIEJpdHMgcHJlc2VudCBpbiBhMSBidXQgbWlzc2luZyBpbiBhMi5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyIHwgc3RyaW5nfSBhMSAtIGFjY2VzcyBtb2RlIHRvIHN1YnRyYWN0IGZyb20uXG4gICAqIEBwYXJhbSB7bnVtYmVyIHwgc3RyaW5nfSBhMiAtIGFjY2VzcyBtb2RlIHRvIHN1YnRyYWN0LlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBhY2Nlc3MgbW9kZSB3aXRoIGJpdHMgcHJlc2VudCBpbiA8Y29kZT5hMTwvY29kZT4gYnV0IG1pc3NpbmcgaW4gPGNvZGU+YTI8L2NvZGU+LlxuICAgKi9cbiAgc3RhdGljIGRpZmYoYTEsIGEyKSB7XG4gICAgYTEgPSBBY2Nlc3NNb2RlLmRlY29kZShhMSk7XG4gICAgYTIgPSBBY2Nlc3NNb2RlLmRlY29kZShhMik7XG5cbiAgICBpZiAoYTEgPT0gQWNjZXNzTW9kZS5fSU5WQUxJRCB8fCBhMiA9PSBBY2Nlc3NNb2RlLl9JTlZBTElEKSB7XG4gICAgICByZXR1cm4gQWNjZXNzTW9kZS5fSU5WQUxJRDtcbiAgICB9XG4gICAgcmV0dXJuIGExICYgfmEyO1xuICB9XG4gIC8qKlxuICAgKiBBY2Nlc3NNb2RlIGlzIGEgY2xhc3MgcmVwcmVzZW50aW5nIHRvcGljIGFjY2VzcyBtb2RlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBjbGFzcyBBY2Nlc3NNb2RlXG4gICAqL1xuICAvKipcbiAgICogQ3VzdG9tIGZvcm1hdHRlclxuICAgKi9cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICd7XCJtb2RlXCI6IFwiJyArIEFjY2Vzc01vZGUuZW5jb2RlKHRoaXMubW9kZSkgK1xuICAgICAgJ1wiLCBcImdpdmVuXCI6IFwiJyArIEFjY2Vzc01vZGUuZW5jb2RlKHRoaXMuZ2l2ZW4pICtcbiAgICAgICdcIiwgXCJ3YW50XCI6IFwiJyArIEFjY2Vzc01vZGUuZW5jb2RlKHRoaXMud2FudCkgKyAnXCJ9JztcbiAgfVxuICAvKipcbiAgICogQWNjZXNzTW9kZSBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyB0b3BpYyBhY2Nlc3MgbW9kZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAY2xhc3MgQWNjZXNzTW9kZVxuICAgKi9cbiAgLyoqXG4gICAqIENvbnZlcnRzIG51bWVyaWMgdmFsdWVzIHRvIHN0cmluZ3MuXG4gICAqL1xuICBqc29uSGVscGVyKCkge1xuICAgIHJldHVybiB7XG4gICAgICBtb2RlOiBBY2Nlc3NNb2RlLmVuY29kZSh0aGlzLm1vZGUpLFxuICAgICAgZ2l2ZW46IEFjY2Vzc01vZGUuZW5jb2RlKHRoaXMuZ2l2ZW4pLFxuICAgICAgd2FudDogQWNjZXNzTW9kZS5lbmNvZGUodGhpcy53YW50KVxuICAgIH07XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBBc3NpZ24gdmFsdWUgdG8gJ21vZGUnLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBOdW1iZXJ9IG0gLSBlaXRoZXIgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFjY2VzcyBtb2RlIG9yIGEgc2V0IG9mIGJpdHMuXG4gICAqIEByZXR1cm5zIHtBY2Nlc3NNb2RlfSAtIDxjb2RlPnRoaXM8L2NvZGU+IEFjY2Vzc01vZGUuXG4gICAqL1xuICBzZXRNb2RlKG0pIHtcbiAgICB0aGlzLm1vZGUgPSBBY2Nlc3NNb2RlLmRlY29kZShtKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogQWNjZXNzTW9kZSBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyB0b3BpYyBhY2Nlc3MgbW9kZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAY2xhc3MgQWNjZXNzTW9kZVxuICAgKi9cbiAgLyoqXG4gICAqIFVwZGF0ZSA8Y29kZT5tb2RlPC9jb2RlPiB2YWx1ZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1IC0gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjaGFuZ2VzIHRvIGFwcGx5IHRvIGFjY2VzcyBtb2RlLlxuICAgKiBAcmV0dXJucyB7QWNjZXNzTW9kZX0gLSA8Y29kZT50aGlzPC9jb2RlPiBBY2Nlc3NNb2RlLlxuICAgKi9cbiAgdXBkYXRlTW9kZSh1KSB7XG4gICAgdGhpcy5tb2RlID0gQWNjZXNzTW9kZS51cGRhdGUodGhpcy5tb2RlLCB1KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogQWNjZXNzTW9kZSBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyB0b3BpYyBhY2Nlc3MgbW9kZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAY2xhc3MgQWNjZXNzTW9kZVxuICAgKi9cbiAgLyoqXG4gICAqIEdldCA8Y29kZT5tb2RlPC9jb2RlPiB2YWx1ZSBhcyBhIHN0cmluZy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gPGNvZGU+bW9kZTwvY29kZT4gdmFsdWUuXG4gICAqL1xuICBnZXRNb2RlKCkge1xuICAgIHJldHVybiBBY2Nlc3NNb2RlLmVuY29kZSh0aGlzLm1vZGUpO1xuICB9XG4gIC8qKlxuICAgKiBBY2Nlc3NNb2RlIGlzIGEgY2xhc3MgcmVwcmVzZW50aW5nIHRvcGljIGFjY2VzcyBtb2RlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBjbGFzcyBBY2Nlc3NNb2RlXG4gICAqL1xuICAvKipcbiAgICogQXNzaWduIDxjb2RlPmdpdmVuPC9jb2RlPiAgdmFsdWUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQWNjZXNzTW9kZVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IE51bWJlcn0gZyAtIGVpdGhlciBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgYWNjZXNzIG1vZGUgb3IgYSBzZXQgb2YgYml0cy5cbiAgICogQHJldHVybnMge0FjY2Vzc01vZGV9IC0gPGNvZGU+dGhpczwvY29kZT4gQWNjZXNzTW9kZS5cbiAgICovXG4gIHNldEdpdmVuKGcpIHtcbiAgICB0aGlzLmdpdmVuID0gQWNjZXNzTW9kZS5kZWNvZGUoZyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBVcGRhdGUgJ2dpdmVuJyB2YWx1ZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1IC0gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjaGFuZ2VzIHRvIGFwcGx5IHRvIGFjY2VzcyBtb2RlLlxuICAgKiBAcmV0dXJucyB7QWNjZXNzTW9kZX0gLSA8Y29kZT50aGlzPC9jb2RlPiBBY2Nlc3NNb2RlLlxuICAgKi9cbiAgdXBkYXRlR2l2ZW4odSkge1xuICAgIHRoaXMuZ2l2ZW4gPSBBY2Nlc3NNb2RlLnVwZGF0ZSh0aGlzLmdpdmVuLCB1KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogQWNjZXNzTW9kZSBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyB0b3BpYyBhY2Nlc3MgbW9kZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAY2xhc3MgQWNjZXNzTW9kZVxuICAgKi9cbiAgLyoqXG4gICAqIEdldCAnZ2l2ZW4nIHZhbHVlIGFzIGEgc3RyaW5nLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gLSA8Yj5naXZlbjwvYj4gdmFsdWUuXG4gICAqL1xuICBnZXRHaXZlbigpIHtcbiAgICByZXR1cm4gQWNjZXNzTW9kZS5lbmNvZGUodGhpcy5naXZlbik7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBBc3NpZ24gJ3dhbnQnIHZhbHVlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBOdW1iZXJ9IHcgLSBlaXRoZXIgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFjY2VzcyBtb2RlIG9yIGEgc2V0IG9mIGJpdHMuXG4gICAqIEByZXR1cm5zIHtBY2Nlc3NNb2RlfSAtIDxjb2RlPnRoaXM8L2NvZGU+IEFjY2Vzc01vZGUuXG4gICAqL1xuICBzZXRXYW50KHcpIHtcbiAgICB0aGlzLndhbnQgPSBBY2Nlc3NNb2RlLmRlY29kZSh3KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogQWNjZXNzTW9kZSBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyB0b3BpYyBhY2Nlc3MgbW9kZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAY2xhc3MgQWNjZXNzTW9kZVxuICAgKi9cbiAgLyoqXG4gICAqIFVwZGF0ZSAnd2FudCcgdmFsdWUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQWNjZXNzTW9kZVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdSAtIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgY2hhbmdlcyB0byBhcHBseSB0byBhY2Nlc3MgbW9kZS5cbiAgICogQHJldHVybnMge0FjY2Vzc01vZGV9IC0gPGNvZGU+dGhpczwvY29kZT4gQWNjZXNzTW9kZS5cbiAgICovXG4gIHVwZGF0ZVdhbnQodSkge1xuICAgIHRoaXMud2FudCA9IEFjY2Vzc01vZGUudXBkYXRlKHRoaXMud2FudCwgdSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBHZXQgJ3dhbnQnIHZhbHVlIGFzIGEgc3RyaW5nLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gLSA8Yj53YW50PC9iPiB2YWx1ZS5cbiAgICovXG4gIGdldFdhbnQoKSB7XG4gICAgcmV0dXJuIEFjY2Vzc01vZGUuZW5jb2RlKHRoaXMud2FudCk7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBHZXQgcGVybWlzc2lvbnMgcHJlc2VudCBpbiAnd2FudCcgYnV0IG1pc3NpbmcgaW4gJ2dpdmVuJy5cbiAgICogSW52ZXJzZSBvZiB7QGxpbmsgVGlub2RlLkFjY2Vzc01vZGUjZ2V0RXhjZXNzaXZlfVxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gcGVybWlzc2lvbnMgcHJlc2VudCBpbiA8Yj53YW50PC9iPiBidXQgbWlzc2luZyBpbiA8Yj5naXZlbjwvYj4uXG4gICAqL1xuICBnZXRNaXNzaW5nKCkge1xuICAgIHJldHVybiBBY2Nlc3NNb2RlLmVuY29kZSh0aGlzLndhbnQgJiB+dGhpcy5naXZlbik7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBHZXQgcGVybWlzc2lvbnMgcHJlc2VudCBpbiAnZ2l2ZW4nIGJ1dCBtaXNzaW5nIGluICd3YW50Jy5cbiAgICogSW52ZXJzZSBvZiB7QGxpbmsgVGlub2RlLkFjY2Vzc01vZGUjZ2V0TWlzc2luZ31cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IHBlcm1pc3Npb25zIHByZXNlbnQgaW4gPGI+Z2l2ZW48L2I+IGJ1dCBtaXNzaW5nIGluIDxiPndhbnQ8L2I+LlxuICAgKi9cbiAgZ2V0RXhjZXNzaXZlKCkge1xuICAgIHJldHVybiBBY2Nlc3NNb2RlLmVuY29kZSh0aGlzLmdpdmVuICYgfnRoaXMud2FudCk7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBVcGRhdGUgJ3dhbnQnLCAnZ2l2ZScsIGFuZCAnbW9kZScgdmFsdWVzLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICpcbiAgICogQHBhcmFtIHtBY2Nlc3NNb2RlfSB2YWwgLSBuZXcgYWNjZXNzIG1vZGUgdmFsdWUuXG4gICAqIEByZXR1cm5zIHtBY2Nlc3NNb2RlfSAtIDxjb2RlPnRoaXM8L2NvZGU+IEFjY2Vzc01vZGUuXG4gICAqL1xuICB1cGRhdGVBbGwodmFsKSB7XG4gICAgaWYgKHZhbCkge1xuICAgICAgdGhpcy51cGRhdGVHaXZlbih2YWwuZ2l2ZW4pO1xuICAgICAgdGhpcy51cGRhdGVXYW50KHZhbC53YW50KTtcbiAgICAgIHRoaXMubW9kZSA9IHRoaXMuZ2l2ZW4gJiB0aGlzLndhbnQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8qKlxuICAgKiBBY2Nlc3NNb2RlIGlzIGEgY2xhc3MgcmVwcmVzZW50aW5nIHRvcGljIGFjY2VzcyBtb2RlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBjbGFzcyBBY2Nlc3NNb2RlXG4gICAqL1xuICAvKipcbiAgICogQ2hlY2sgaWYgT3duZXIgKE8pIGZsYWcgaXMgc2V0LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBzaWRlIC0gd2hpY2ggcGVybWlzc2lvbiB0byBjaGVjazogZ2l2ZW4sIHdhbnQsIG1vZGU7IGRlZmF1bHQ6IG1vZGUuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIDxjb2RlPnRydWU8L2NvZGU+IGlmIGZsYWcgaXMgc2V0LlxuICAgKi9cbiAgaXNPd25lcihzaWRlKSB7XG4gICAgcmV0dXJuIEFjY2Vzc01vZGUuI2NoZWNrRmxhZyh0aGlzLCBzaWRlLCBBY2Nlc3NNb2RlLl9PV05FUik7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBDaGVjayBpZiBQcmVzZW5jZSAoUCkgZmxhZyBpcyBzZXQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQWNjZXNzTW9kZVxuICAgKiBAcGFyYW0ge3N0cmluZz19IHNpZGUgLSB3aGljaCBwZXJtaXNzaW9uIHRvIGNoZWNrOiBnaXZlbiwgd2FudCwgbW9kZTsgZGVmYXVsdDogbW9kZS5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgZmxhZyBpcyBzZXQuXG4gICAqL1xuICBpc1ByZXNlbmNlcihzaWRlKSB7XG4gICAgcmV0dXJuIEFjY2Vzc01vZGUuI2NoZWNrRmxhZyh0aGlzLCBzaWRlLCBBY2Nlc3NNb2RlLl9QUkVTKTtcbiAgfVxuICAvKipcbiAgICogQWNjZXNzTW9kZSBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyB0b3BpYyBhY2Nlc3MgbW9kZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAY2xhc3MgQWNjZXNzTW9kZVxuICAgKi9cbiAgLyoqXG4gICAqIENoZWNrIGlmIFByZXNlbmNlIChQKSBmbGFnIGlzIE5PVCBzZXQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQWNjZXNzTW9kZVxuICAgKiBAcGFyYW0ge3N0cmluZz19IHNpZGUgLSB3aGljaCBwZXJtaXNzaW9uIHRvIGNoZWNrOiBnaXZlbiwgd2FudCwgbW9kZTsgZGVmYXVsdDogbW9kZS5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgZmxhZyBpcyBzZXQuXG4gICAqL1xuICBpc011dGVkKHNpZGUpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNQcmVzZW5jZXIoc2lkZSk7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBDaGVjayBpZiBKb2luIChKKSBmbGFnIGlzIHNldC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc2lkZSAtIHdoaWNoIHBlcm1pc3Npb24gdG8gY2hlY2s6IGdpdmVuLCB3YW50LCBtb2RlOyBkZWZhdWx0OiBtb2RlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSA8Y29kZT50cnVlPC9jb2RlPiBpZiBmbGFnIGlzIHNldC5cbiAgICovXG4gIGlzSm9pbmVyKHNpZGUpIHtcbiAgICByZXR1cm4gQWNjZXNzTW9kZS4jY2hlY2tGbGFnKHRoaXMsIHNpZGUsIEFjY2Vzc01vZGUuX0pPSU4pO1xuICB9XG4gIC8qKlxuICAgKiBBY2Nlc3NNb2RlIGlzIGEgY2xhc3MgcmVwcmVzZW50aW5nIHRvcGljIGFjY2VzcyBtb2RlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBjbGFzcyBBY2Nlc3NNb2RlXG4gICAqL1xuICAvKipcbiAgICogQ2hlY2sgaWYgUmVhZGVyIChSKSBmbGFnIGlzIHNldC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc2lkZSAtIHdoaWNoIHBlcm1pc3Npb24gdG8gY2hlY2s6IGdpdmVuLCB3YW50LCBtb2RlOyBkZWZhdWx0OiBtb2RlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSA8Y29kZT50cnVlPC9jb2RlPiBpZiBmbGFnIGlzIHNldC5cbiAgICovXG4gIGlzUmVhZGVyKHNpZGUpIHtcbiAgICByZXR1cm4gQWNjZXNzTW9kZS4jY2hlY2tGbGFnKHRoaXMsIHNpZGUsIEFjY2Vzc01vZGUuX1JFQUQpO1xuICB9XG4gIC8qKlxuICAgKiBBY2Nlc3NNb2RlIGlzIGEgY2xhc3MgcmVwcmVzZW50aW5nIHRvcGljIGFjY2VzcyBtb2RlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBjbGFzcyBBY2Nlc3NNb2RlXG4gICAqL1xuICAvKipcbiAgICogQ2hlY2sgaWYgV3JpdGVyIChXKSBmbGFnIGlzIHNldC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc2lkZSAtIHdoaWNoIHBlcm1pc3Npb24gdG8gY2hlY2s6IGdpdmVuLCB3YW50LCBtb2RlOyBkZWZhdWx0OiBtb2RlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSA8Y29kZT50cnVlPC9jb2RlPiBpZiBmbGFnIGlzIHNldC5cbiAgICovXG4gIGlzV3JpdGVyKHNpZGUpIHtcbiAgICByZXR1cm4gQWNjZXNzTW9kZS4jY2hlY2tGbGFnKHRoaXMsIHNpZGUsIEFjY2Vzc01vZGUuX1dSSVRFKTtcbiAgfVxuICAvKipcbiAgICogQWNjZXNzTW9kZSBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyB0b3BpYyBhY2Nlc3MgbW9kZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAY2xhc3MgQWNjZXNzTW9kZVxuICAgKi9cbiAgLyoqXG4gICAqIENoZWNrIGlmIEFwcHJvdmVyIChBKSBmbGFnIGlzIHNldC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc2lkZSAtIHdoaWNoIHBlcm1pc3Npb24gdG8gY2hlY2s6IGdpdmVuLCB3YW50LCBtb2RlOyBkZWZhdWx0OiBtb2RlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSA8Y29kZT50cnVlPC9jb2RlPiBpZiBmbGFnIGlzIHNldC5cbiAgICovXG4gIGlzQXBwcm92ZXIoc2lkZSkge1xuICAgIHJldHVybiBBY2Nlc3NNb2RlLiNjaGVja0ZsYWcodGhpcywgc2lkZSwgQWNjZXNzTW9kZS5fQVBQUk9WRSk7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBDaGVjayBpZiBlaXRoZXIgb25lIG9mIE93bmVyIChPKSBvciBBcHByb3ZlciAoQSkgZmxhZ3MgaXMgc2V0LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBzaWRlIC0gd2hpY2ggcGVybWlzc2lvbiB0byBjaGVjazogZ2l2ZW4sIHdhbnQsIG1vZGU7IGRlZmF1bHQ6IG1vZGUuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIDxjb2RlPnRydWU8L2NvZGU+IGlmIGZsYWcgaXMgc2V0LlxuICAgKi9cbiAgaXNBZG1pbihzaWRlKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNPd25lcihzaWRlKSB8fCB0aGlzLmlzQXBwcm92ZXIoc2lkZSk7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBDaGVjayBpZiBlaXRoZXIgb25lIG9mIE93bmVyIChPKSwgQXBwcm92ZXIgKEEpLCBvciBTaGFyZXIgKFMpIGZsYWdzIGlzIHNldC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc2lkZSAtIHdoaWNoIHBlcm1pc3Npb24gdG8gY2hlY2s6IGdpdmVuLCB3YW50LCBtb2RlOyBkZWZhdWx0OiBtb2RlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSA8Y29kZT50cnVlPC9jb2RlPiBpZiBmbGFnIGlzIHNldC5cbiAgICovXG4gIGlzU2hhcmVyKHNpZGUpIHtcbiAgICByZXR1cm4gdGhpcy5pc0FkbWluKHNpZGUpIHx8IEFjY2Vzc01vZGUuI2NoZWNrRmxhZyh0aGlzLCBzaWRlLCBBY2Nlc3NNb2RlLl9TSEFSRSk7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBDaGVjayBpZiBEZWxldGVyIChEKSBmbGFnIGlzIHNldC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc2lkZSAtIHdoaWNoIHBlcm1pc3Npb24gdG8gY2hlY2s6IGdpdmVuLCB3YW50LCBtb2RlOyBkZWZhdWx0OiBtb2RlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSA8Y29kZT50cnVlPC9jb2RlPiBpZiBmbGFnIGlzIHNldC5cbiAgICovXG4gIGlzRGVsZXRlcihzaWRlKSB7XG4gICAgcmV0dXJuIEFjY2Vzc01vZGUuI2NoZWNrRmxhZyh0aGlzLCBzaWRlLCBBY2Nlc3NNb2RlLl9ERUxFVEUpO1xuICB9XG59XG5cbkFjY2Vzc01vZGUuX05PTkUgPSAweDAwO1xuQWNjZXNzTW9kZS5fSk9JTiA9IDB4MDE7XG5BY2Nlc3NNb2RlLl9SRUFEID0gMHgwMjtcbkFjY2Vzc01vZGUuX1dSSVRFID0gMHgwNDtcbkFjY2Vzc01vZGUuX1BSRVMgPSAweDA4O1xuQWNjZXNzTW9kZS5fQVBQUk9WRSA9IDB4MTA7XG5BY2Nlc3NNb2RlLl9TSEFSRSA9IDB4MjA7XG5BY2Nlc3NNb2RlLl9ERUxFVEUgPSAweDQwO1xuQWNjZXNzTW9kZS5fT1dORVIgPSAweDgwO1xuXG5BY2Nlc3NNb2RlLl9CSVRNQVNLID0gQWNjZXNzTW9kZS5fSk9JTiB8IEFjY2Vzc01vZGUuX1JFQUQgfCBBY2Nlc3NNb2RlLl9XUklURSB8IEFjY2Vzc01vZGUuX1BSRVMgfFxuICBBY2Nlc3NNb2RlLl9BUFBST1ZFIHwgQWNjZXNzTW9kZS5fU0hBUkUgfCBBY2Nlc3NNb2RlLl9ERUxFVEUgfCBBY2Nlc3NNb2RlLl9PV05FUjtcbkFjY2Vzc01vZGUuX0lOVkFMSUQgPSAweDEwMDAwMDtcbiIsIi8qKlxuICogQGZpbGUgSW4tbWVtb3J5IHNvcnRlZCBjYWNoZSBvZiBvYmplY3RzLlxuICpcbiAqIEBjb3B5cmlnaHQgMjAxNS0yMDIyIFRpbm9kZSBMTEMuXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBJbi1tZW1vcnkgc29ydGVkIGNhY2hlIG9mIG9iamVjdHMuXG4gKlxuICogQGNsYXNzIENCdWZmZXJcbiAqIEBtZW1iZXJvZiBUaW5vZGVcbiAqIEBwcm90ZWN0ZWRcbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb21wYXJlIGN1c3RvbSBjb21wYXJhdG9yIG9mIG9iamVjdHMuIFRha2VzIHR3byBwYXJhbWV0ZXJzIDxjb2RlPmE8L2NvZGU+IGFuZCA8Y29kZT5iPC9jb2RlPjtcbiAqICAgIHJldHVybnMgPGNvZGU+LTE8L2NvZGU+IGlmIDxjb2RlPmEgPCBiPC9jb2RlPiwgPGNvZGU+MDwvY29kZT4gaWYgPGNvZGU+YSA9PSBiPC9jb2RlPiwgPGNvZGU+MTwvY29kZT4gb3RoZXJ3aXNlLlxuICogQHBhcmFtIHtib29sZWFufSB1bmlxdWUgZW5mb3JjZSBlbGVtZW50IHVuaXF1ZW5lc3M6IHdoZW4gPGNvZGU+dHJ1ZTwvY29kZT4gcmVwbGFjZSBleGlzdGluZyBlbGVtZW50IHdpdGggYSBuZXdcbiAqICAgIG9uZSBvbiBjb25mbGljdDsgd2hlbiA8Y29kZT5mYWxzZTwvY29kZT4ga2VlcCBib3RoIGVsZW1lbnRzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDQnVmZmVyIHtcbiAgI2NvbXBhcmF0b3IgPSB1bmRlZmluZWQ7XG4gICN1bmlxdWUgPSBmYWxzZTtcbiAgYnVmZmVyID0gW107XG5cbiAgY29uc3RydWN0b3IoY29tcGFyZV8sIHVuaXF1ZV8pIHtcbiAgICB0aGlzLiNjb21wYXJhdG9yID0gY29tcGFyZV8gfHwgKChhLCBiKSA9PiB7XG4gICAgICByZXR1cm4gYSA9PT0gYiA/IDAgOiBhIDwgYiA/IC0xIDogMTtcbiAgICB9KTtcbiAgICB0aGlzLiN1bmlxdWUgPSB1bmlxdWVfO1xuICB9XG5cbiAgI2ZpbmROZWFyZXN0KGVsZW0sIGFyciwgZXhhY3QpIHtcbiAgICBsZXQgc3RhcnQgPSAwO1xuICAgIGxldCBlbmQgPSBhcnIubGVuZ3RoIC0gMTtcbiAgICBsZXQgcGl2b3QgPSAwO1xuICAgIGxldCBkaWZmID0gMDtcbiAgICBsZXQgZm91bmQgPSBmYWxzZTtcblxuICAgIHdoaWxlIChzdGFydCA8PSBlbmQpIHtcbiAgICAgIHBpdm90ID0gKHN0YXJ0ICsgZW5kKSAvIDIgfCAwO1xuICAgICAgZGlmZiA9IHRoaXMuI2NvbXBhcmF0b3IoYXJyW3Bpdm90XSwgZWxlbSk7XG4gICAgICBpZiAoZGlmZiA8IDApIHtcbiAgICAgICAgc3RhcnQgPSBwaXZvdCArIDE7XG4gICAgICB9IGVsc2UgaWYgKGRpZmYgPiAwKSB7XG4gICAgICAgIGVuZCA9IHBpdm90IC0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChmb3VuZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWR4OiBwaXZvdCxcbiAgICAgICAgZXhhY3Q6IHRydWVcbiAgICAgIH07XG4gICAgfVxuICAgIGlmIChleGFjdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWR4OiAtMVxuICAgICAgfTtcbiAgICB9XG4gICAgLy8gTm90IGV4YWN0IC0gaW5zZXJ0aW9uIHBvaW50XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkeDogZGlmZiA8IDAgPyBwaXZvdCArIDEgOiBwaXZvdFxuICAgIH07XG4gIH1cblxuICAvLyBJbnNlcnQgZWxlbWVudCBpbnRvIGEgc29ydGVkIGFycmF5LlxuICAjaW5zZXJ0U29ydGVkKGVsZW0sIGFycikge1xuICAgIGNvbnN0IGZvdW5kID0gdGhpcy4jZmluZE5lYXJlc3QoZWxlbSwgYXJyLCBmYWxzZSk7XG4gICAgY29uc3QgY291bnQgPSAoZm91bmQuZXhhY3QgJiYgdGhpcy4jdW5pcXVlKSA/IDEgOiAwO1xuICAgIGFyci5zcGxpY2UoZm91bmQuaWR4LCBjb3VudCwgZWxlbSk7XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYW4gZWxlbWVudCBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ0J1ZmZlciNcbiAgICogQHBhcmFtIHtudW1iZXJ9IGF0IC0gUG9zaXRpb24gdG8gZmV0Y2ggZnJvbS5cbiAgICogQHJldHVybnMge09iamVjdH0gRWxlbWVudCBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24gb3IgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPi5cbiAgICovXG4gIGdldEF0KGF0KSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyW2F0XTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZW5pZW5jZSBtZXRob2QgZm9yIGdldHRpbmcgdGhlIGVsZW1lbnQgZnJvbSB0aGUgZW5kIG9mIHRoZSBidWZmZXIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ0J1ZmZlciNcbiAgICogQHBhcmFtIHtudW1iZXJ9IGF0IC0gcG9zaXRpb24gdG8gZmV0Y2ggZnJvbSwgY291bnRpbmcgZnJvbSB0aGUgZW5kO1xuICAgKiAgICA8Y29kZT51bmRlZmluZWQ8L2NvZGU+IG9yIDxjb2RlPm51bGw8L2NvZGU+ICBtZWFuIFwibGFzdFwiLlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgbGFzdCBlbGVtZW50IGluIHRoZSBidWZmZXIgb3IgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPiBpZiBidWZmZXIgaXMgZW1wdHkuXG4gICAqL1xuICBnZXRMYXN0KGF0KSB7XG4gICAgYXQgfD0gMDtcbiAgICByZXR1cm4gdGhpcy5idWZmZXIubGVuZ3RoID4gYXQgPyB0aGlzLmJ1ZmZlclt0aGlzLmJ1ZmZlci5sZW5ndGggLSAxIC0gYXRdIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBuZXcgZWxlbWVudChzKSB0byB0aGUgYnVmZmVyLiBWYXJpYWRpYzogdGFrZXMgb25lIG9yIG1vcmUgYXJndW1lbnRzLiBJZiBhbiBhcnJheSBpcyBwYXNzZWQgYXMgYSBzaW5nbGVcbiAgICogYXJndW1lbnQsIGl0cyBlbGVtZW50cyBhcmUgaW5zZXJ0ZWQgaW5kaXZpZHVhbGx5LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqXG4gICAqIEBwYXJhbSB7Li4uT2JqZWN0fEFycmF5fSAtIE9uZSBvciBtb3JlIG9iamVjdHMgdG8gaW5zZXJ0LlxuICAgKi9cbiAgcHV0KCkge1xuICAgIGxldCBpbnNlcnQ7XG4gICAgLy8gaW5zcGVjdCBhcmd1bWVudHM6IGlmIGFycmF5LCBpbnNlcnQgaXRzIGVsZW1lbnRzLCBpZiBvbmUgb3IgbW9yZSBub24tYXJyYXkgYXJndW1lbnRzLCBpbnNlcnQgdGhlbSBvbmUgYnkgb25lXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSAmJiBBcnJheS5pc0FycmF5KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgIGluc2VydCA9IGFyZ3VtZW50c1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5zZXJ0ID0gYXJndW1lbnRzO1xuICAgIH1cbiAgICBmb3IgKGxldCBpZHggaW4gaW5zZXJ0KSB7XG4gICAgICB0aGlzLiNpbnNlcnRTb3J0ZWQoaW5zZXJ0W2lkeF0sIHRoaXMuYnVmZmVyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGVsZW1lbnQgYXQgdGhlIGdpdmVuIHBvc2l0aW9uLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhdCAtIFBvc2l0aW9uIHRvIGRlbGV0ZSBhdC5cbiAgICogQHJldHVybnMge09iamVjdH0gRWxlbWVudCBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24gb3IgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPi5cbiAgICovXG4gIGRlbEF0KGF0KSB7XG4gICAgYXQgfD0gMDtcbiAgICBsZXQgciA9IHRoaXMuYnVmZmVyLnNwbGljZShhdCwgMSk7XG4gICAgaWYgKHIgJiYgci5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gclswXTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgZWxlbWVudHMgYmV0d2VlbiB0d28gcG9zaXRpb25zLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzaW5jZSAtIFBvc2l0aW9uIHRvIGRlbGV0ZSBmcm9tIChpbmNsdXNpdmUpLlxuICAgKiBAcGFyYW0ge251bWJlcn0gYmVmb3JlIC0gUG9zaXRpb24gdG8gZGVsZXRlIHRvIChleGNsdXNpdmUpLlxuICAgKlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IGFycmF5IG9mIHJlbW92ZWQgZWxlbWVudHMgKGNvdWxkIGJlIHplcm8gbGVuZ3RoKS5cbiAgICovXG4gIGRlbFJhbmdlKHNpbmNlLCBiZWZvcmUpIHtcbiAgICByZXR1cm4gdGhpcy5idWZmZXIuc3BsaWNlKHNpbmNlLCBiZWZvcmUgLSBzaW5jZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgdGhlIGJ1ZmZlciBob2xkcy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5DQnVmZmVyI1xuICAgKiBAcmV0dXJuIHtudW1iZXJ9IE51bWJlciBvZiBlbGVtZW50cyBpbiB0aGUgYnVmZmVyLlxuICAgKi9cbiAgbGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdGhlIGJ1ZmZlciBkaXNjYXJkaW5nIGFsbCBlbGVtZW50c1xuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqL1xuICByZXNldCgpIHtcbiAgICB0aGlzLmJ1ZmZlciA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZvciBpdGVyYXRpbmcgY29udGVudHMgb2YgYnVmZmVyLiBTZWUge0BsaW5rIFRpbm9kZS5DQnVmZmVyI2ZvckVhY2h9LlxuICAgKiBAY2FsbGJhY2sgRm9yRWFjaENhbGxiYWNrVHlwZVxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0gQ3VycmVudCBlbGVtZW50IG9mIHRoZSBidWZmZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcmV2IC0gUHJldmlvdXMgZWxlbWVudCBvZiB0aGUgYnVmZmVyLlxuICAgKiBAcGFyYW0ge09iamVjdH0gbmV4dCAtIE5leHQgZWxlbWVudCBvZiB0aGUgYnVmZmVyLlxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBJbmRleCBvZiB0aGUgY3VycmVudCBlbGVtZW50LlxuICAgKi9cblxuICAvKipcbiAgICogQXBwbHkgZ2l2ZW4gPGNvZGU+Y2FsbGJhY2s8L2NvZGU+IHRvIGFsbCBlbGVtZW50cyBvZiB0aGUgYnVmZmVyLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqXG4gICAqIEBwYXJhbSB7VGlub2RlLkZvckVhY2hDYWxsYmFja1R5cGV9IGNhbGxiYWNrIC0gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBlbGVtZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRJZHggLSBPcHRpb25hbCBpbmRleCB0byBzdGFydCBpdGVyYXRpbmcgZnJvbSAoaW5jbHVzaXZlKS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGJlZm9yZUlkeCAtIE9wdGlvbmFsIGluZGV4IHRvIHN0b3AgaXRlcmF0aW5nIGJlZm9yZSAoZXhjbHVzaXZlKS5cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSBjYWxsaW5nIGNvbnRleHQgKGkuZS4gdmFsdWUgb2YgPGNvZGU+dGhpczwvY29kZT4gaW4gY2FsbGJhY2spXG4gICAqL1xuICBmb3JFYWNoKGNhbGxiYWNrLCBzdGFydElkeCwgYmVmb3JlSWR4LCBjb250ZXh0KSB7XG4gICAgc3RhcnRJZHggPSBzdGFydElkeCB8IDA7XG4gICAgYmVmb3JlSWR4ID0gYmVmb3JlSWR4IHx8IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gc3RhcnRJZHg7IGkgPCBiZWZvcmVJZHg7IGkrKykge1xuICAgICAgY2FsbGJhY2suY2FsbChjb250ZXh0LCB0aGlzLmJ1ZmZlcltpXSxcbiAgICAgICAgKGkgPiBzdGFydElkeCA/IHRoaXMuYnVmZmVyW2kgLSAxXSA6IHVuZGVmaW5lZCksXG4gICAgICAgIChpIDwgYmVmb3JlSWR4IC0gMSA/IHRoaXMuYnVmZmVyW2kgKyAxXSA6IHVuZGVmaW5lZCksIGkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGVsZW1lbnQgaW4gYnVmZmVyIHVzaW5nIGJ1ZmZlcidzIGNvbXBhcmlzb24gZnVuY3Rpb24uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ0J1ZmZlciNcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gLSBlbGVtZW50IHRvIGZpbmQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG5lYXJlc3QgLSB3aGVuIHRydWUgYW5kIGV4YWN0IG1hdGNoIGlzIG5vdCBmb3VuZCwgcmV0dXJuIHRoZSBuZWFyZXN0IGVsZW1lbnQgKGluc2VydGlvbiBwb2ludCkuXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IGluZGV4IG9mIHRoZSBlbGVtZW50IGluIHRoZSBidWZmZXIgb3IgLTEuXG4gICAqL1xuICBmaW5kKGVsZW0sIG5lYXJlc3QpIHtcbiAgICBjb25zdCB7XG4gICAgICBpZHhcbiAgICB9ID0gdGhpcy4jZmluZE5lYXJlc3QoZWxlbSwgdGhpcy5idWZmZXIsICFuZWFyZXN0KTtcbiAgICByZXR1cm4gaWR4O1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZvciBmaWx0ZXJpbmcgdGhlIGJ1ZmZlci4gU2VlIHtAbGluayBUaW5vZGUuQ0J1ZmZlciNmaWx0ZXJ9LlxuICAgKiBAY2FsbGJhY2sgRm9yRWFjaENhbGxiYWNrVHlwZVxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0gQ3VycmVudCBlbGVtZW50IG9mIHRoZSBidWZmZXIuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIEluZGV4IG9mIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gICAqIEByZXR1cm5zIHtib29sZW59IDxjb2RlPnRydWU8L2NvZGU+IHRvIGtlZXAgdGhlIGVsZW1lbnQsIDxjb2RlPmZhbHNlPC9jb2RlPiB0byByZW1vdmUuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIGVsZW1lbnRzIHRoYXQgZG8gbm90IHBhc3MgdGhlIHRlc3QgaW1wbGVtZW50ZWQgYnkgdGhlIHByb3ZpZGVkIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqXG4gICAqIEBwYXJhbSB7VGlub2RlLkZpbHRlckNhbGxiYWNrVHlwZX0gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IC0gY2FsbGluZyBjb250ZXh0IChpLmUuIHZhbHVlIG9mIDxjb2RlPnRoaXM8L2NvZGU+IGluIHRoZSBjYWxsYmFjaylcbiAgICovXG4gIGZpbHRlcihjYWxsYmFjaywgY29udGV4dCkge1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmJ1ZmZlci5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoY29udGV4dCwgdGhpcy5idWZmZXJbaV0sIGkpKSB7XG4gICAgICAgIHRoaXMuYnVmZmVyW2NvdW50XSA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICBjb3VudCsrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyLnNwbGljZShjb3VudCk7XG4gIH1cbn1cbiIsIi8qKlxuICogQGZpbGUgR2xvYmFsIGNvbnN0YW50cyBhbmQgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzLlxuICpcbiAqIEBjb3B5cmlnaHQgMjAxNS0yMDIyIFRpbm9kZSBMTENcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge1xuICB2ZXJzaW9uIGFzIHBhY2thZ2VfdmVyc2lvblxufSBmcm9tICcuLi92ZXJzaW9uLmpzb24nO1xuXG4vLyBHbG9iYWwgY29uc3RhbnRzXG5leHBvcnQgY29uc3QgUFJPVE9DT0xfVkVSU0lPTiA9ICcwJzsgLy8gTWFqb3IgY29tcG9uZW50IG9mIHRoZSB2ZXJzaW9uLCBlLmcuICcwJyBpbiAnMC4xNy4xJy5cbmV4cG9ydCBjb25zdCBWRVJTSU9OID0gcGFja2FnZV92ZXJzaW9uIHx8ICcwLjE4JztcbmV4cG9ydCBjb25zdCBMSUJSQVJZID0gJ3Rpbm9kZWpzLycgKyBWRVJTSU9OO1xuXG4vLyBUb3BpYyBuYW1lIHByZWZpeGVzLlxuZXhwb3J0IGNvbnN0IFRPUElDX05FVyA9ICduZXcnO1xuZXhwb3J0IGNvbnN0IFRPUElDX05FV19DSEFOID0gJ25jaCc7XG5leHBvcnQgY29uc3QgVE9QSUNfTUUgPSAnbWUnO1xuZXhwb3J0IGNvbnN0IFRPUElDX0ZORCA9ICdmbmQnO1xuZXhwb3J0IGNvbnN0IFRPUElDX1NZUyA9ICdzeXMnO1xuZXhwb3J0IGNvbnN0IFRPUElDX0NIQU4gPSAnY2huJztcbmV4cG9ydCBjb25zdCBUT1BJQ19HUlAgPSAnZ3JwOydcbmV4cG9ydCBjb25zdCBUT1BJQ19QMlAgPSAncDJwJztcbmV4cG9ydCBjb25zdCBVU0VSX05FVyA9ICduZXcnO1xuXG4vLyBTdGFydGluZyB2YWx1ZSBvZiBhIGxvY2FsbHktZ2VuZXJhdGVkIHNlcUlkIHVzZWQgZm9yIHBlbmRpbmcgbWVzc2FnZXMuXG5leHBvcnQgY29uc3QgTE9DQUxfU0VRSUQgPSAweEZGRkZGRkY7XG5cbi8vIFN0YXR1cyBjb2Rlcy5cbmV4cG9ydCBjb25zdCBNRVNTQUdFX1NUQVRVU19OT05FID0gMDsgLy8gU3RhdHVzIG5vdCBhc3NpZ25lZC5cbmV4cG9ydCBjb25zdCBNRVNTQUdFX1NUQVRVU19RVUVVRUQgPSAxOyAvLyBMb2NhbCBJRCBhc3NpZ25lZCwgaW4gcHJvZ3Jlc3MgdG8gYmUgc2VudC5cbmV4cG9ydCBjb25zdCBNRVNTQUdFX1NUQVRVU19TRU5ESU5HID0gMjsgLy8gVHJhbnNtaXNzaW9uIHN0YXJ0ZWQuXG5leHBvcnQgY29uc3QgTUVTU0FHRV9TVEFUVVNfRkFJTEVEID0gMzsgLy8gQXQgbGVhc3Qgb25lIGF0dGVtcHQgd2FzIG1hZGUgdG8gc2VuZCB0aGUgbWVzc2FnZS5cbmV4cG9ydCBjb25zdCBNRVNTQUdFX1NUQVRVU19TRU5UID0gNDsgLy8gRGVsaXZlcmVkIHRvIHRoZSBzZXJ2ZXIuXG5leHBvcnQgY29uc3QgTUVTU0FHRV9TVEFUVVNfUkVDRUlWRUQgPSA1OyAvLyBSZWNlaXZlZCBieSB0aGUgY2xpZW50LlxuZXhwb3J0IGNvbnN0IE1FU1NBR0VfU1RBVFVTX1JFQUQgPSA2OyAvLyBSZWFkIGJ5IHRoZSB1c2VyLlxuZXhwb3J0IGNvbnN0IE1FU1NBR0VfU1RBVFVTX1RPX01FID0gNzsgLy8gVGhlIG1lc3NhZ2UgaXMgcmVjZWl2ZWQgZnJvbSBhbm90aGVyIHVzZXIuXG5leHBvcnQgY29uc3QgTUVTU0FHRV9TVEFUVVNfREVMX1JBTkdFID0gODsgLy8gVGhlIG1lc3NhZ2UgcmVwcmVzZW50cyBhIGRlbGV0ZWQgcmFuZ2UuXG5cbi8vIFJlamVjdCB1bnJlc29sdmVkIGZ1dHVyZXMgYWZ0ZXIgdGhpcyBtYW55IG1pbGxpc2Vjb25kcy5cbmV4cG9ydCBjb25zdCBFWFBJUkVfUFJPTUlTRVNfVElNRU9VVCA9IDUwMDA7XG4vLyBQZXJpb2RpY2l0eSBvZiBnYXJiYWdlIGNvbGxlY3Rpb24gb2YgdW5yZXNvbHZlZCBmdXR1cmVzLlxuZXhwb3J0IGNvbnN0IEVYUElSRV9QUk9NSVNFU19QRVJJT0QgPSAxMDAwO1xuXG4vLyBEZWZhdWx0IG51bWJlciBvZiBtZXNzYWdlcyB0byBwdWxsIGludG8gbWVtb3J5IGZyb20gcGVyc2lzdGVudCBjYWNoZS5cbmV4cG9ydCBjb25zdCBERUZBVUxUX01FU1NBR0VTX1BBR0UgPSAyNDtcblxuLy8gVW5pY29kZSBERUwgY2hhcmFjdGVyIGluZGljYXRpbmcgZGF0YSB3YXMgZGVsZXRlZC5cbmV4cG9ydCBjb25zdCBERUxfQ0hBUiA9ICdcXHUyNDIxJztcbiIsIi8qKlxuICogQGZpbGUgQWJzdHJhY3Rpb24gbGF5ZXIgZm9yIHdlYnNvY2tldCBhbmQgbG9uZyBwb2xsaW5nIGNvbm5lY3Rpb25zLlxuICpcbiAqIEBjb3B5cmlnaHQgMjAxNS0yMDIyIFRpbm9kZSBMTEMuXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtcbiAganNvblBhcnNlSGVscGVyXG59IGZyb20gJy4vdXRpbHMuanMnO1xuXG5sZXQgV2ViU29ja2V0UHJvdmlkZXI7XG5sZXQgWEhSUHJvdmlkZXI7XG5cbi8vIEVycm9yIGNvZGUgdG8gcmV0dXJuIGluIGNhc2Ugb2YgYSBuZXR3b3JrIHByb2JsZW0uXG5jb25zdCBORVRXT1JLX0VSUk9SID0gNTAzO1xuY29uc3QgTkVUV09SS19FUlJPUl9URVhUID0gXCJDb25uZWN0aW9uIGZhaWxlZFwiO1xuXG4vLyBFcnJvciBjb2RlIHRvIHJldHVybiB3aGVuIHVzZXIgZGlzY29ubmVjdGVkIGZyb20gc2VydmVyLlxuY29uc3QgTkVUV09SS19VU0VSID0gNDE4O1xuY29uc3QgTkVUV09SS19VU0VSX1RFWFQgPSBcIkRpc2Nvbm5lY3RlZCBieSBjbGllbnRcIjtcblxuLy8gU2V0dGluZ3MgZm9yIGV4cG9uZW50aWFsIGJhY2tvZmZcbmNvbnN0IF9CT0ZGX0JBU0UgPSAyMDAwOyAvLyAyMDAwIG1pbGxpc2Vjb25kcywgbWluaW11bSBkZWxheSBiZXR3ZWVuIHJlY29ubmVjdHNcbmNvbnN0IF9CT0ZGX01BWF9JVEVSID0gMTA7IC8vIE1heGltdW0gZGVsYXkgYmV0d2VlbiByZWNvbm5lY3RzIDJeMTAgKiAyMDAwIH4gMzQgbWludXRlc1xuY29uc3QgX0JPRkZfSklUVEVSID0gMC4zOyAvLyBBZGQgcmFuZG9tIGRlbGF5XG5cbi8vIEhlbHBlciBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYW4gZW5kcG9pbnQgVVJMLlxuZnVuY3Rpb24gbWFrZUJhc2VVcmwoaG9zdCwgcHJvdG9jb2wsIHZlcnNpb24sIGFwaUtleSkge1xuICBsZXQgdXJsID0gbnVsbDtcblxuICBpZiAoWydodHRwJywgJ2h0dHBzJywgJ3dzJywgJ3dzcyddLmluY2x1ZGVzKHByb3RvY29sKSkge1xuICAgIHVybCA9IGAke3Byb3RvY29sfTovLyR7aG9zdH1gO1xuICAgIGlmICh1cmwuY2hhckF0KHVybC5sZW5ndGggLSAxKSAhPT0gJy8nKSB7XG4gICAgICB1cmwgKz0gJy8nO1xuICAgIH1cbiAgICB1cmwgKz0gJ3YnICsgdmVyc2lvbiArICcvY2hhbm5lbHMnO1xuICAgIGlmIChbJ2h0dHAnLCAnaHR0cHMnXS5pbmNsdWRlcyhwcm90b2NvbCkpIHtcbiAgICAgIC8vIExvbmcgcG9sbGluZyBlbmRwb2ludCBlbmRzIHdpdGggXCJscFwiLCBpLmUuXG4gICAgICAvLyAnL3YwL2NoYW5uZWxzL2xwJyB2cyBqdXN0ICcvdjAvY2hhbm5lbHMnIGZvciB3c1xuICAgICAgdXJsICs9ICcvbHAnO1xuICAgIH1cbiAgICB1cmwgKz0gJz9hcGlrZXk9JyArIGFwaUtleTtcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59XG5cbi8qKlxuICogQW4gYWJzdHJhY3Rpb24gZm9yIGEgd2Vic29ja2V0IG9yIGEgbG9uZyBwb2xsaW5nIGNvbm5lY3Rpb24uXG4gKlxuICogQGNsYXNzIENvbm5lY3Rpb25cbiAqIEBtZW1iZXJvZiBUaW5vZGVcblxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVycy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb25maWcuaG9zdCAtIEhvc3QgbmFtZSBhbmQgb3B0aW9uYWwgcG9ydCBudW1iZXIgdG8gY29ubmVjdCB0by5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb25maWcuYXBpS2V5IC0gQVBJIGtleSBnZW5lcmF0ZWQgYnkgPGNvZGU+a2V5Z2VuPC9jb2RlPi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb25maWcudHJhbnNwb3J0IC0gTmV0d29yayB0cmFuc3BvcnQgdG8gdXNlLCBlaXRoZXIgPGNvZGU+XCJ3c1wiPGNvZGU+Lzxjb2RlPlwid3NzXCI8L2NvZGU+IGZvciB3ZWJzb2NrZXQgb3JcbiAqICAgICAgPGNvZGU+bHA8L2NvZGU+IGZvciBsb25nIHBvbGxpbmcuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGNvbmZpZy5zZWN1cmUgLSBVc2UgU2VjdXJlIFdlYlNvY2tldCBpZiA8Y29kZT50cnVlPC9jb2RlPi5cbiAqIEBwYXJhbSB7c3RyaW5nfSB2ZXJzaW9uXyAtIE1ham9yIHZhbHVlIG9mIHRoZSBwcm90b2NvbCB2ZXJzaW9uLCBlLmcuICcwJyBpbiAnMC4xNy4xJy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYXV0b3JlY29ubmVjdF8gLSBJZiBjb25uZWN0aW9uIGlzIGxvc3QsIHRyeSB0byByZWNvbm5lY3QgYXV0b21hdGljYWxseS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29ubmVjdGlvbiB7XG4gICNib2ZmVGltZXIgPSBudWxsO1xuICAjYm9mZkl0ZXJhdGlvbiA9IDA7XG4gICNib2ZmQ2xvc2VkID0gZmFsc2U7IC8vIEluZGljYXRvciBpZiB0aGUgc29ja2V0IHdhcyBtYW51YWxseSBjbG9zZWQgLSBkb24ndCBhdXRvcmVjb25uZWN0IGlmIHRydWUuXG5cbiAgLy8gV2Vic29ja2V0LlxuICAjc29ja2V0ID0gbnVsbDtcblxuICBob3N0O1xuICBzZWN1cmU7XG4gIGFwaUtleTtcblxuICB2ZXJzaW9uO1xuICBhdXRvcmVjb25uZWN0O1xuXG4gIGluaXRpYWxpemVkO1xuXG4gIC8vIChjb25maWcuaG9zdCwgY29uZmlnLmFwaUtleSwgY29uZmlnLnRyYW5zcG9ydCwgY29uZmlnLnNlY3VyZSksIFBST1RPQ09MX1ZFUlNJT04sIHRydWVcbiAgY29uc3RydWN0b3IoY29uZmlnLCB2ZXJzaW9uXywgYXV0b3JlY29ubmVjdF8pIHtcbiAgICB0aGlzLmhvc3QgPSBjb25maWcuaG9zdDtcbiAgICB0aGlzLnNlY3VyZSA9IGNvbmZpZy5zZWN1cmU7XG4gICAgdGhpcy5hcGlLZXkgPSBjb25maWcuYXBpS2V5O1xuXG4gICAgdGhpcy52ZXJzaW9uID0gdmVyc2lvbl87XG4gICAgdGhpcy5hdXRvcmVjb25uZWN0ID0gYXV0b3JlY29ubmVjdF87XG5cbiAgICBpZiAoY29uZmlnLnRyYW5zcG9ydCA9PT0gJ2xwJykge1xuICAgICAgLy8gZXhwbGljaXQgcmVxdWVzdCB0byB1c2UgbG9uZyBwb2xsaW5nXG4gICAgICB0aGlzLiNpbml0X2xwKCk7XG4gICAgICB0aGlzLmluaXRpYWxpemVkID0gJ2xwJztcbiAgICB9IGVsc2UgaWYgKGNvbmZpZy50cmFuc3BvcnQgPT09ICd3cycpIHtcbiAgICAgIC8vIGV4cGxpY2l0IHJlcXVlc3QgdG8gdXNlIHdlYiBzb2NrZXRcbiAgICAgIC8vIGlmIHdlYnNvY2tldHMgYXJlIG5vdCBhdmFpbGFibGUsIGhvcnJpYmxlIHRoaW5ncyB3aWxsIGhhcHBlblxuICAgICAgdGhpcy4jaW5pdF93cygpO1xuICAgICAgdGhpcy5pbml0aWFsaXplZCA9ICd3cyc7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAvLyBJbnZhbGlkIG9yIHVuZGVmaW5lZCBuZXR3b3JrIHRyYW5zcG9ydC5cbiAgICAgIHRoaXMuI2xvZyhcIlVua25vd24gb3IgaW52YWxpZCBuZXR3b3JrIHRyYW5zcG9ydC4gUnVubmluZyB1bmRlciBOb2RlPyBDYWxsICdUaW5vZGUuc2V0TmV0d29ya1Byb3ZpZGVycygpJy5cIik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIG9yIGludmFsaWQgbmV0d29yayB0cmFuc3BvcnQuIFJ1bm5pbmcgdW5kZXIgTm9kZT8gQ2FsbCAnVGlub2RlLnNldE5ldHdvcmtQcm92aWRlcnMoKScuXCIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUbyB1c2UgQ29ubmVjdGlvbiBpbiBhIG5vbiBicm93c2VyIGNvbnRleHQsIHN1cHBseSBXZWJTb2NrZXQgYW5kIFhNTEh0dHBSZXF1ZXN0IHByb3ZpZGVycy5cbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyb2YgQ29ubmVjdGlvblxuICAgKiBAcGFyYW0gd3NQcm92aWRlciBXZWJTb2NrZXQgcHJvdmlkZXIsIGUuZy4gZm9yIG5vZGVKUyAsIDxjb2RlPnJlcXVpcmUoJ3dzJyk8L2NvZGU+LlxuICAgKiBAcGFyYW0geGhyUHJvdmlkZXIgWE1MSHR0cFJlcXVlc3QgcHJvdmlkZXIsIGUuZy4gZm9yIG5vZGUgPGNvZGU+cmVxdWlyZSgneGhyJyk8L2NvZGU+LlxuICAgKi9cbiAgc3RhdGljIHNldE5ldHdvcmtQcm92aWRlcnMod3NQcm92aWRlciwgeGhyUHJvdmlkZXIpIHtcbiAgICBXZWJTb2NrZXRQcm92aWRlciA9IHdzUHJvdmlkZXI7XG4gICAgWEhSUHJvdmlkZXIgPSB4aHJQcm92aWRlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWF0ZSBhIG5ldyBjb25uZWN0aW9uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ29ubmVjdGlvbiNcbiAgICogQHBhcmFtIHtzdHJpbmd9IGhvc3RfIEhvc3QgbmFtZSB0byBjb25uZWN0IHRvOyBpZiA8Y29kZT5udWxsPC9jb2RlPiB0aGUgb2xkIGhvc3QgbmFtZSB3aWxsIGJlIHVzZWQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2UgRm9yY2UgbmV3IGNvbm5lY3Rpb24gZXZlbiBpZiBvbmUgYWxyZWFkeSBleGlzdHMuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IFByb21pc2UgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgY29ubmVjdGlvbiBjYWxsIGNvbXBsZXRlcywgcmVzb2x1dGlvbiBpcyBjYWxsZWQgd2l0aG91dFxuICAgKiAgcGFyYW1ldGVycywgcmVqZWN0aW9uIHBhc3NlcyB0aGUge0Vycm9yfSBhcyBwYXJhbWV0ZXIuXG4gICAqL1xuICBjb25uZWN0KGhvc3RfLCBmb3JjZSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcnkgdG8gcmVzdG9yZSBhIG5ldHdvcmsgY29ubmVjdGlvbiwgYWxzbyByZXNldCBiYWNrb2ZmLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNvbm5lY3Rpb24jXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2UgLSByZWNvbm5lY3QgZXZlbiBpZiB0aGVyZSBpcyBhIGxpdmUgY29ubmVjdGlvbiBhbHJlYWR5LlxuICAgKi9cbiAgcmVjb25uZWN0KGZvcmNlKSB7fVxuXG4gIC8qKlxuICAgKiBUZXJtaW5hdGUgdGhlIG5ldHdvcmsgY29ubmVjdGlvblxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNvbm5lY3Rpb24jXG4gICAqL1xuICBkaXNjb25uZWN0KCkge31cblxuICAvKipcbiAgICogU2VuZCBhIHN0cmluZyB0byB0aGUgc2VydmVyLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNvbm5lY3Rpb24jXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtc2cgLSBTdHJpbmcgdG8gc2VuZC5cbiAgICogQHRocm93cyBUaHJvd3MgYW4gZXhjZXB0aW9uIGlmIHRoZSB1bmRlcmx5aW5nIGNvbm5lY3Rpb24gaXMgbm90IGxpdmUuXG4gICAqL1xuICBzZW5kVGV4dChtc2cpIHt9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGNvbm5lY3Rpb24gaXMgYWxpdmUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ29ubmVjdGlvbiNcbiAgICogQHJldHVybnMge2Jvb2xlYW59IDxjb2RlPnRydWU8L2NvZGU+IGlmIGNvbm5lY3Rpb24gaXMgbGl2ZSwgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5hbWUgb2YgdGhlIGN1cnJlbnQgbmV0d29yayB0cmFuc3BvcnQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ29ubmVjdGlvbiNcbiAgICogQHJldHVybnMge3N0cmluZ30gbmFtZSBvZiB0aGUgdHJhbnNwb3J0IHN1Y2ggYXMgPGNvZGU+XCJ3c1wiPC9jb2RlPiBvciA8Y29kZT5cImxwXCI8L2NvZGU+LlxuICAgKi9cbiAgdHJhbnNwb3J0KCkge1xuICAgIHJldHVybiB0aGlzLmluaXRpYWxpemVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgbmV0d29yayBwcm9iZSB0byBjaGVjayBpZiBjb25uZWN0aW9uIGlzIGluZGVlZCBsaXZlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNvbm5lY3Rpb24jXG4gICAqL1xuICBwcm9iZSgpIHtcbiAgICB0aGlzLnNlbmRUZXh0KCcxJyk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgYXV0b3JlY29ubmVjdCBjb3VudGVyIHRvIHplcm8uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ29ubmVjdGlvbiNcbiAgICovXG4gIGJhY2tvZmZSZXNldCgpIHtcbiAgICB0aGlzLiNib2ZmUmVzZXQoKTtcbiAgfVxuXG4gICNsb2codGV4dCwgLi4uYXJncykge1xuICAgIGlmIChDb25uZWN0aW9uLmxvZ2dlcikge1xuICAgICAgQ29ubmVjdGlvbi5sb2dnZXIodGV4dCwgLi4uYXJncyk7XG4gICAgfVxuICB9XG5cbiAgLy8gQmFja29mZiBpbXBsZW1lbnRhdGlvbiAtIHJlY29ubmVjdCBhZnRlciBhIHRpbWVvdXQuXG4gICNib2ZmUmVjb25uZWN0KCkge1xuICAgIC8vIENsZWFyIHRpbWVyXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuI2JvZmZUaW1lcik7XG4gICAgLy8gQ2FsY3VsYXRlIHdoZW4gdG8gZmlyZSB0aGUgcmVjb25uZWN0IGF0dGVtcHRcbiAgICBjb25zdCB0aW1lb3V0ID0gX0JPRkZfQkFTRSAqIChNYXRoLnBvdygyLCB0aGlzLiNib2ZmSXRlcmF0aW9uKSAqICgxLjAgKyBfQk9GRl9KSVRURVIgKiBNYXRoLnJhbmRvbSgpKSk7XG4gICAgLy8gVXBkYXRlIGl0ZXJhdGlvbiBjb3VudGVyIGZvciBmdXR1cmUgdXNlXG4gICAgdGhpcy4jYm9mZkl0ZXJhdGlvbiA9ICh0aGlzLiNib2ZmSXRlcmF0aW9uID49IF9CT0ZGX01BWF9JVEVSID8gdGhpcy4jYm9mZkl0ZXJhdGlvbiA6IHRoaXMuI2JvZmZJdGVyYXRpb24gKyAxKTtcbiAgICBpZiAodGhpcy5vbkF1dG9yZWNvbm5lY3RJdGVyYXRpb24pIHtcbiAgICAgIHRoaXMub25BdXRvcmVjb25uZWN0SXRlcmF0aW9uKHRpbWVvdXQpO1xuICAgIH1cblxuICAgIHRoaXMuI2JvZmZUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy4jbG9nKGBSZWNvbm5lY3RpbmcsIGl0ZXI9JHt0aGlzLiNib2ZmSXRlcmF0aW9ufSwgdGltZW91dD0ke3RpbWVvdXR9YCk7XG4gICAgICAvLyBNYXliZSB0aGUgc29ja2V0IHdhcyBjbG9zZWQgd2hpbGUgd2Ugd2FpdGVkIGZvciB0aGUgdGltZXI/XG4gICAgICBpZiAoIXRoaXMuI2JvZmZDbG9zZWQpIHtcbiAgICAgICAgY29uc3QgcHJvbSA9IHRoaXMuY29ubmVjdCgpO1xuICAgICAgICBpZiAodGhpcy5vbkF1dG9yZWNvbm5lY3RJdGVyYXRpb24pIHtcbiAgICAgICAgICB0aGlzLm9uQXV0b3JlY29ubmVjdEl0ZXJhdGlvbigwLCBwcm9tKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBTdXBwcmVzcyBlcnJvciBpZiBpdCdzIG5vdCB1c2VkLlxuICAgICAgICAgIHByb20uY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgLyogZG8gbm90aGluZyAqL1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub25BdXRvcmVjb25uZWN0SXRlcmF0aW9uKSB7XG4gICAgICAgIHRoaXMub25BdXRvcmVjb25uZWN0SXRlcmF0aW9uKC0xKTtcbiAgICAgIH1cbiAgICB9LCB0aW1lb3V0KTtcbiAgfVxuXG4gIC8vIFRlcm1pbmF0ZSBhdXRvLXJlY29ubmVjdCBwcm9jZXNzLlxuICAjYm9mZlN0b3AoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuI2JvZmZUaW1lcik7XG4gICAgdGhpcy4jYm9mZlRpbWVyID0gbnVsbDtcbiAgfVxuXG4gIC8vIFJlc2V0IGF1dG8tcmVjb25uZWN0IGl0ZXJhdGlvbiBjb3VudGVyLlxuICAjYm9mZlJlc2V0KCkge1xuICAgIHRoaXMuI2JvZmZJdGVyYXRpb24gPSAwO1xuICB9XG5cbiAgLy8gSW5pdGlhbGl6YXRpb24gZm9yIGxvbmcgcG9sbGluZy5cbiAgI2luaXRfbHAoKSB7XG4gICAgY29uc3QgWERSX1VOU0VOVCA9IDA7IC8vIENsaWVudCBoYXMgYmVlbiBjcmVhdGVkLiBvcGVuKCkgbm90IGNhbGxlZCB5ZXQuXG4gICAgY29uc3QgWERSX09QRU5FRCA9IDE7IC8vIG9wZW4oKSBoYXMgYmVlbiBjYWxsZWQuXG4gICAgY29uc3QgWERSX0hFQURFUlNfUkVDRUlWRUQgPSAyOyAvLyBzZW5kKCkgaGFzIGJlZW4gY2FsbGVkLCBhbmQgaGVhZGVycyBhbmQgc3RhdHVzIGFyZSBhdmFpbGFibGUuXG4gICAgY29uc3QgWERSX0xPQURJTkcgPSAzOyAvLyBEb3dubG9hZGluZzsgcmVzcG9uc2VUZXh0IGhvbGRzIHBhcnRpYWwgZGF0YS5cbiAgICBjb25zdCBYRFJfRE9ORSA9IDQ7IC8vIFRoZSBvcGVyYXRpb24gaXMgY29tcGxldGUuXG5cbiAgICAvLyBGdWxseSBjb21wb3NlZCBlbmRwb2ludCBVUkwsIHdpdGggQVBJIGtleSAmIFNJRFxuICAgIGxldCBfbHBVUkwgPSBudWxsO1xuXG4gICAgbGV0IF9wb2xsZXIgPSBudWxsO1xuICAgIGxldCBfc2VuZGVyID0gbnVsbDtcblxuICAgIGxldCBscF9zZW5kZXIgPSAodXJsXykgPT4ge1xuICAgICAgY29uc3Qgc2VuZGVyID0gbmV3IFhIUlByb3ZpZGVyKCk7XG4gICAgICBzZW5kZXIub25yZWFkeXN0YXRlY2hhbmdlID0gKGV2dCkgPT4ge1xuICAgICAgICBpZiAoc2VuZGVyLnJlYWR5U3RhdGUgPT0gWERSX0RPTkUgJiYgc2VuZGVyLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICAvLyBTb21lIHNvcnQgb2YgZXJyb3IgcmVzcG9uc2VcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYExQIHNlbmRlciBmYWlsZWQsICR7c2VuZGVyLnN0YXR1c31gKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgc2VuZGVyLm9wZW4oJ1BPU1QnLCB1cmxfLCB0cnVlKTtcbiAgICAgIHJldHVybiBzZW5kZXI7XG4gICAgfVxuXG4gICAgbGV0IGxwX3BvbGxlciA9ICh1cmxfLCByZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBwb2xsZXIgPSBuZXcgWEhSUHJvdmlkZXIoKTtcbiAgICAgIGxldCBwcm9taXNlQ29tcGxldGVkID0gZmFsc2U7XG5cbiAgICAgIHBvbGxlci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoZXZ0KSA9PiB7XG4gICAgICAgIGlmIChwb2xsZXIucmVhZHlTdGF0ZSA9PSBYRFJfRE9ORSkge1xuICAgICAgICAgIGlmIChwb2xsZXIuc3RhdHVzID09IDIwMSkgeyAvLyAyMDEgPT0gSFRUUC5DcmVhdGVkLCBnZXQgU0lEXG4gICAgICAgICAgICBsZXQgcGt0ID0gSlNPTi5wYXJzZShwb2xsZXIucmVzcG9uc2VUZXh0LCBqc29uUGFyc2VIZWxwZXIpO1xuICAgICAgICAgICAgX2xwVVJMID0gdXJsXyArICcmc2lkPScgKyBwa3QuY3RybC5wYXJhbXMuc2lkO1xuICAgICAgICAgICAgcG9sbGVyID0gbHBfcG9sbGVyKF9scFVSTCk7XG4gICAgICAgICAgICBwb2xsZXIuc2VuZChudWxsKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9uT3Blbikge1xuICAgICAgICAgICAgICB0aGlzLm9uT3BlbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgICBwcm9taXNlQ29tcGxldGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5hdXRvcmVjb25uZWN0KSB7XG4gICAgICAgICAgICAgIHRoaXMuI2JvZmZTdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChwb2xsZXIuc3RhdHVzIDwgNDAwKSB7IC8vIDQwMCA9IEhUVFAuQmFkUmVxdWVzdFxuICAgICAgICAgICAgaWYgKHRoaXMub25NZXNzYWdlKSB7XG4gICAgICAgICAgICAgIHRoaXMub25NZXNzYWdlKHBvbGxlci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9sbGVyID0gbHBfcG9sbGVyKF9scFVSTCk7XG4gICAgICAgICAgICBwb2xsZXIuc2VuZChudWxsKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRG9uJ3QgdGhyb3cgYW4gZXJyb3IgaGVyZSwgZ3JhY2VmdWxseSBoYW5kbGUgc2VydmVyIGVycm9yc1xuICAgICAgICAgICAgaWYgKHJlamVjdCAmJiAhcHJvbWlzZUNvbXBsZXRlZCkge1xuICAgICAgICAgICAgICBwcm9taXNlQ29tcGxldGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmVqZWN0KHBvbGxlci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMub25NZXNzYWdlICYmIHBvbGxlci5yZXNwb25zZVRleHQpIHtcbiAgICAgICAgICAgICAgdGhpcy5vbk1lc3NhZ2UocG9sbGVyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5vbkRpc2Nvbm5lY3QpIHtcbiAgICAgICAgICAgICAgY29uc3QgY29kZSA9IHBvbGxlci5zdGF0dXMgfHwgKHRoaXMuI2JvZmZDbG9zZWQgPyBORVRXT1JLX1VTRVIgOiBORVRXT1JLX0VSUk9SKTtcbiAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IHBvbGxlci5yZXNwb25zZVRleHQgfHwgKHRoaXMuI2JvZmZDbG9zZWQgPyBORVRXT1JLX1VTRVJfVEVYVCA6IE5FVFdPUktfRVJST1JfVEVYVCk7XG4gICAgICAgICAgICAgIHRoaXMub25EaXNjb25uZWN0KG5ldyBFcnJvcih0ZXh0ICsgJyAoJyArIGNvZGUgKyAnKScpLCBjb2RlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUG9sbGluZyBoYXMgc3RvcHBlZC4gSW5kaWNhdGUgaXQgYnkgc2V0dGluZyBwb2xsZXIgdG8gbnVsbC5cbiAgICAgICAgICAgIHBvbGxlciA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIXRoaXMuI2JvZmZDbG9zZWQgJiYgdGhpcy5hdXRvcmVjb25uZWN0KSB7XG4gICAgICAgICAgICAgIHRoaXMuI2JvZmZSZWNvbm5lY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBwb2xsZXIub3BlbignUE9TVCcsIHVybF8sIHRydWUpO1xuICAgICAgcmV0dXJuIHBvbGxlcjtcbiAgICB9XG5cbiAgICB0aGlzLmNvbm5lY3QgPSAoaG9zdF8sIGZvcmNlKSA9PiB7XG4gICAgICB0aGlzLiNib2ZmQ2xvc2VkID0gZmFsc2U7XG5cbiAgICAgIGlmIChfcG9sbGVyKSB7XG4gICAgICAgIGlmICghZm9yY2UpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgX3BvbGxlci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIF9wb2xsZXIuYWJvcnQoKTtcbiAgICAgICAgX3BvbGxlciA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmIChob3N0Xykge1xuICAgICAgICB0aGlzLmhvc3QgPSBob3N0XztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gbWFrZUJhc2VVcmwodGhpcy5ob3N0LCB0aGlzLnNlY3VyZSA/ICdodHRwcycgOiAnaHR0cCcsIHRoaXMudmVyc2lvbiwgdGhpcy5hcGlLZXkpO1xuICAgICAgICB0aGlzLiNsb2coXCJMUCBjb25uZWN0aW5nIHRvOlwiLCB1cmwpO1xuICAgICAgICBfcG9sbGVyID0gbHBfcG9sbGVyKHVybCwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgX3BvbGxlci5zZW5kKG51bGwpO1xuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICB0aGlzLiNsb2coXCJMUCBjb25uZWN0aW9uIGZhaWxlZDpcIiwgZXJyKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLnJlY29ubmVjdCA9IChmb3JjZSkgPT4ge1xuICAgICAgdGhpcy4jYm9mZlN0b3AoKTtcbiAgICAgIHRoaXMuY29ubmVjdChudWxsLCBmb3JjZSk7XG4gICAgfTtcblxuICAgIHRoaXMuZGlzY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIHRoaXMuI2JvZmZDbG9zZWQgPSB0cnVlO1xuICAgICAgdGhpcy4jYm9mZlN0b3AoKTtcblxuICAgICAgaWYgKF9zZW5kZXIpIHtcbiAgICAgICAgX3NlbmRlci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIF9zZW5kZXIuYWJvcnQoKTtcbiAgICAgICAgX3NlbmRlciA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAoX3BvbGxlcikge1xuICAgICAgICBfcG9sbGVyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgX3BvbGxlci5hYm9ydCgpO1xuICAgICAgICBfcG9sbGVyID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMub25EaXNjb25uZWN0KSB7XG4gICAgICAgIHRoaXMub25EaXNjb25uZWN0KG5ldyBFcnJvcihORVRXT1JLX1VTRVJfVEVYVCArICcgKCcgKyBORVRXT1JLX1VTRVIgKyAnKScpLCBORVRXT1JLX1VTRVIpO1xuICAgICAgfVxuICAgICAgLy8gRW5zdXJlIGl0J3MgcmVjb25zdHJ1Y3RlZFxuICAgICAgX2xwVVJMID0gbnVsbDtcbiAgICB9O1xuXG4gICAgdGhpcy5zZW5kVGV4dCA9IChtc2cpID0+IHtcbiAgICAgIF9zZW5kZXIgPSBscF9zZW5kZXIoX2xwVVJMKTtcbiAgICAgIGlmIChfc2VuZGVyICYmIChfc2VuZGVyLnJlYWR5U3RhdGUgPT0gWERSX09QRU5FRCkpIHsgLy8gMSA9PSBPUEVORURcbiAgICAgICAgX3NlbmRlci5zZW5kKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb25nIHBvbGxlciBmYWlsZWQgdG8gY29ubmVjdFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5pc0Nvbm5lY3RlZCA9ICgpID0+IHtcbiAgICAgIHJldHVybiAoX3BvbGxlciAmJiB0cnVlKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gSW5pdGlhbGl6YXRpb24gZm9yIFdlYnNvY2tldFxuICAjaW5pdF93cygpIHtcbiAgICB0aGlzLmNvbm5lY3QgPSAoaG9zdF8sIGZvcmNlKSA9PiB7XG4gICAgICB0aGlzLiNib2ZmQ2xvc2VkID0gZmFsc2U7XG5cbiAgICAgIGlmICh0aGlzLiNzb2NrZXQpIHtcbiAgICAgICAgaWYgKCFmb3JjZSAmJiB0aGlzLiNzb2NrZXQucmVhZHlTdGF0ZSA9PSB0aGlzLiNzb2NrZXQuT1BFTikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiNzb2NrZXQuY2xvc2UoKTtcbiAgICAgICAgdGhpcy4jc29ja2V0ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKGhvc3RfKSB7XG4gICAgICAgIHRoaXMuaG9zdCA9IGhvc3RfO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBtYWtlQmFzZVVybCh0aGlzLmhvc3QsIHRoaXMuc2VjdXJlID8gJ3dzcycgOiAnd3MnLCB0aGlzLnZlcnNpb24sIHRoaXMuYXBpS2V5KTtcblxuICAgICAgICB0aGlzLiNsb2coXCJXUyBjb25uZWN0aW5nIHRvOiBcIiwgdXJsKTtcblxuICAgICAgICAvLyBJdCB0aHJvd3Mgd2hlbiB0aGUgc2VydmVyIGlzIG5vdCBhY2Nlc3NpYmxlIGJ1dCB0aGUgZXhjZXB0aW9uIGNhbm5vdCBiZSBjYXVnaHQ6XG4gICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMxMDAyNTkyL2phdmFzY3JpcHQtZG9lc250LWNhdGNoLWVycm9yLWluLXdlYnNvY2tldC1pbnN0YW50aWF0aW9uLzMxMDAzMDU3XG4gICAgICAgIGNvbnN0IGNvbm4gPSBuZXcgV2ViU29ja2V0UHJvdmlkZXIodXJsKTtcblxuICAgICAgICBjb25uLm9uZXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29ubi5vbm9wZW4gPSAoZXZ0KSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuYXV0b3JlY29ubmVjdCkge1xuICAgICAgICAgICAgdGhpcy4jYm9mZlN0b3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpcy5vbk9wZW4pIHtcbiAgICAgICAgICAgIHRoaXMub25PcGVuKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbm4ub25jbG9zZSA9IChldnQpID0+IHtcbiAgICAgICAgICB0aGlzLiNzb2NrZXQgPSBudWxsO1xuXG4gICAgICAgICAgaWYgKHRoaXMub25EaXNjb25uZWN0KSB7XG4gICAgICAgICAgICBjb25zdCBjb2RlID0gdGhpcy4jYm9mZkNsb3NlZCA/IE5FVFdPUktfVVNFUiA6IE5FVFdPUktfRVJST1I7XG4gICAgICAgICAgICB0aGlzLm9uRGlzY29ubmVjdChuZXcgRXJyb3IodGhpcy4jYm9mZkNsb3NlZCA/IE5FVFdPUktfVVNFUl9URVhUIDogTkVUV09SS19FUlJPUl9URVhUICtcbiAgICAgICAgICAgICAgJyAoJyArIGNvZGUgKyAnKScpLCBjb2RlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIXRoaXMuI2JvZmZDbG9zZWQgJiYgdGhpcy5hdXRvcmVjb25uZWN0KSB7XG4gICAgICAgICAgICB0aGlzLiNib2ZmUmVjb25uZWN0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbm4ub25tZXNzYWdlID0gKGV2dCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLm9uTWVzc2FnZSkge1xuICAgICAgICAgICAgdGhpcy5vbk1lc3NhZ2UoZXZ0LmRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLiNzb2NrZXQgPSBjb25uO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5yZWNvbm5lY3QgPSAoZm9yY2UpID0+IHtcbiAgICAgIHRoaXMuI2JvZmZTdG9wKCk7XG4gICAgICB0aGlzLmNvbm5lY3QobnVsbCwgZm9yY2UpO1xuICAgIH07XG5cbiAgICB0aGlzLmRpc2Nvbm5lY3QgPSAoKSA9PiB7XG4gICAgICB0aGlzLiNib2ZmQ2xvc2VkID0gdHJ1ZTtcbiAgICAgIHRoaXMuI2JvZmZTdG9wKCk7XG5cbiAgICAgIGlmICghdGhpcy4jc29ja2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuI3NvY2tldC5jbG9zZSgpO1xuICAgICAgdGhpcy4jc29ja2V0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgdGhpcy5zZW5kVGV4dCA9IChtc2cpID0+IHtcbiAgICAgIGlmICh0aGlzLiNzb2NrZXQgJiYgKHRoaXMuI3NvY2tldC5yZWFkeVN0YXRlID09IHRoaXMuI3NvY2tldC5PUEVOKSkge1xuICAgICAgICB0aGlzLiNzb2NrZXQuc2VuZChtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2Vic29ja2V0IGlzIG5vdCBjb25uZWN0ZWRcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuaXNDb25uZWN0ZWQgPSAoKSA9PiB7XG4gICAgICByZXR1cm4gKHRoaXMuI3NvY2tldCAmJiAodGhpcy4jc29ja2V0LnJlYWR5U3RhdGUgPT0gdGhpcy4jc29ja2V0Lk9QRU4pKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbGJhY2tzOlxuXG4gIC8qKlxuICAgKiBBIGNhbGxiYWNrIHRvIHBhc3MgaW5jb21pbmcgbWVzc2FnZXMgdG8uIFNlZSB7QGxpbmsgVGlub2RlLkNvbm5lY3Rpb24jb25NZXNzYWdlfS5cbiAgICogQGNhbGxiYWNrIFRpbm9kZS5Db25uZWN0aW9uLk9uTWVzc2FnZVxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNvbm5lY3Rpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBNZXNzYWdlIHRvIHByb2Nlc3MuXG4gICAqL1xuICBvbk1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEEgY2FsbGJhY2sgZm9yIHJlcG9ydGluZyBhIGRyb3BwZWQgY29ubmVjdGlvbi5cbiAgICogQHR5cGUge2Z1bmN0aW9ufVxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNvbm5lY3Rpb24jXG4gICAqL1xuICBvbkRpc2Nvbm5lY3QgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEEgY2FsbGJhY2sgY2FsbGVkIHdoZW4gdGhlIGNvbm5lY3Rpb24gaXMgcmVhZHkgdG8gYmUgdXNlZCBmb3Igc2VuZGluZy4gRm9yIHdlYnNvY2tldHMgaXQncyBzb2NrZXQgb3BlbixcbiAgICogZm9yIGxvbmcgcG9sbGluZyBpdCdzIDxjb2RlPnJlYWR5U3RhdGU9MTwvY29kZT4gKE9QRU5FRClcbiAgICogQHR5cGUge2Z1bmN0aW9ufVxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNvbm5lY3Rpb24jXG4gICAqL1xuICBvbk9wZW4gPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEEgY2FsbGJhY2sgdG8gbm90aWZ5IG9mIHJlY29ubmVjdGlvbiBhdHRlbXB0cy4gU2VlIHtAbGluayBUaW5vZGUuQ29ubmVjdGlvbiNvbkF1dG9yZWNvbm5lY3RJdGVyYXRpb259LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNvbm5lY3Rpb25cbiAgICogQGNhbGxiYWNrIEF1dG9yZWNvbm5lY3RJdGVyYXRpb25UeXBlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0aW1lb3V0IC0gdGltZSB0aWxsIHRoZSBuZXh0IHJlY29ubmVjdCBhdHRlbXB0IGluIG1pbGxpc2Vjb25kcy4gPGNvZGU+LTE8L2NvZGU+IG1lYW5zIHJlY29ubmVjdCB3YXMgc2tpcHBlZC5cbiAgICogQHBhcmFtIHtQcm9taXNlfSBwcm9taXNlIHJlc29sdmVkIG9yIHJlamVjdGVkIHdoZW4gdGhlIHJlY29ubmVjdCBhdHRlbXAgY29tcGxldGVzLlxuICAgKlxuICAgKi9cbiAgLyoqXG4gICAqIEEgY2FsbGJhY2sgdG8gaW5mb3JtIHdoZW4gdGhlIG5leHQgYXR0YW1wdCB0byByZWNvbm5lY3Qgd2lsbCBoYXBwZW4gYW5kIHRvIHJlY2VpdmUgY29ubmVjdGlvbiBwcm9taXNlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNvbm5lY3Rpb24jXG4gICAqIEB0eXBlIHtUaW5vZGUuQ29ubmVjdGlvbi5BdXRvcmVjb25uZWN0SXRlcmF0aW9uVHlwZX1cbiAgICovXG4gIG9uQXV0b3JlY29ubmVjdEl0ZXJhdGlvbiA9IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogQSBjYWxsYmFjayB0byBsb2cgZXZlbnRzIGZyb20gQ29ubmVjdGlvbi4gU2VlIHtAbGluayBUaW5vZGUuQ29ubmVjdGlvbiNsb2dnZXJ9LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNvbm5lY3Rpb25cbiAgICogQGNhbGxiYWNrIExvZ2dlckNhbGxiYWNrVHlwZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBFdmVudCB0byBsb2cuXG4gICAqL1xuICAvKipcbiAgICogQSBjYWxsYmFjayB0byByZXBvcnQgbG9nZ2luZyBldmVudHMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ29ubmVjdGlvbiNcbiAgICogQHR5cGUge1Rpbm9kZS5Db25uZWN0aW9uLkxvZ2dlckNhbGxiYWNrVHlwZX1cbiAgICovXG4gIGxvZ2dlciA9IHVuZGVmaW5lZDtcbn1cblxuQ29ubmVjdGlvbi5ORVRXT1JLX0VSUk9SID0gTkVUV09SS19FUlJPUjtcbkNvbm5lY3Rpb24uTkVUV09SS19FUlJPUl9URVhUID0gTkVUV09SS19FUlJPUl9URVhUO1xuQ29ubmVjdGlvbi5ORVRXT1JLX1VTRVIgPSBORVRXT1JLX1VTRVI7XG5Db25uZWN0aW9uLk5FVFdPUktfVVNFUl9URVhUID0gTkVUV09SS19VU0VSX1RFWFQ7XG4iLCIvKipcbiAqIEBmaWxlIEhlbHBlciBtZXRob2RzIGZvciBkZWFsaW5nIHdpdGggSW5kZXhlZERCIGNhY2hlIG9mIG1lc3NhZ2VzLCB1c2VycywgYW5kIHRvcGljcy5cbiAqXG4gKiBAY29weXJpZ2h0IDIwMTUtMjAyMiBUaW5vZGUgTExDLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbi8vIE5PVEUgVE8gREVWRUxPUEVSUzpcbi8vIExvY2FsaXphYmxlIHN0cmluZ3Mgc2hvdWxkIGJlIGRvdWJsZSBxdW90ZWQgXCLRgdGC0YDQvtC60LAg0L3QsCDQtNGA0YPQs9C+0Lwg0Y/Qt9GL0LrQtVwiLFxuLy8gbm9uLWxvY2FsaXphYmxlIHN0cmluZ3Mgc2hvdWxkIGJlIHNpbmdsZSBxdW90ZWQgJ25vbi1sb2NhbGl6ZWQnLlxuXG5jb25zdCBEQl9WRVJTSU9OID0gMTtcbmNvbnN0IERCX05BTUUgPSAndGlub2RlLXdlYic7XG5cbmxldCBJREJQcm92aWRlcjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgREIge1xuICAjb25FcnJvciA9IGZ1bmN0aW9uKCkge307XG4gICNsb2dnZXIgPSBmdW5jdGlvbigpIHt9O1xuXG4gIC8vIEluc3RhbmNlIG9mIEluZGV4REIuXG4gIGRiID0gbnVsbDtcbiAgLy8gSW5kaWNhdG9yIHRoYXQgdGhlIGNhY2hlIGlzIGRpc2FibGVkLlxuICBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKG9uRXJyb3IsIGxvZ2dlcikge1xuICAgIHRoaXMuI29uRXJyb3IgPSBvbkVycm9yIHx8IHRoaXMuI29uRXJyb3I7XG4gICAgdGhpcy4jbG9nZ2VyID0gbG9nZ2VyIHx8IHRoaXMuI2xvZ2dlcjtcbiAgfVxuXG4gICNtYXBPYmplY3RzKHNvdXJjZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICBpZiAoIXRoaXMuZGIpIHtcbiAgICAgIHJldHVybiBkaXNhYmxlZCA/XG4gICAgICAgIFByb21pc2UucmVzb2x2ZShbXSkgOlxuICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJub3QgaW5pdGlhbGl6ZWRcIikpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cnggPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFtzb3VyY2VdKTtcbiAgICAgIHRyeC5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuI2xvZ2dlcignUENhY2hlJywgJ21hcE9iamVjdHMnLCBzb3VyY2UsIGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICAgIHJlamVjdChldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIHRyeC5vYmplY3RTdG9yZShzb3VyY2UpLmdldEFsbCgpLm9uc3VjY2VzcyA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICBldmVudC50YXJnZXQucmVzdWx0LmZvckVhY2goKHRvcGljKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKGNvbnRleHQsIHRvcGljKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXNvbHZlKGV2ZW50LnRhcmdldC5yZXN1bHQpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHBlcnNpc3RlbnQgY2FjaGU6IG9wZW4gb3IgY3JlYXRlL3VwZ3JhZGUgaWYgbmVlZGVkLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSB0byBiZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHRoZSBEQiBpcyBpbml0aWFsaXplZC5cbiAgICovXG4gIGluaXREYXRhYmFzZSgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gT3BlbiB0aGUgZGF0YWJhc2UgYW5kIGluaXRpYWxpemUgY2FsbGJhY2tzLlxuICAgICAgY29uc3QgcmVxID0gSURCUHJvdmlkZXIub3BlbihEQl9OQU1FLCBEQl9WRVJTSU9OKTtcbiAgICAgIHJlcS5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5kYiA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgcmVzb2x2ZSh0aGlzLmRiKTtcbiAgICAgIH07XG4gICAgICByZXEub25lcnJvciA9IChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLiNsb2dnZXIoJ1BDYWNoZScsIFwiZmFpbGVkIHRvIGluaXRpYWxpemVcIiwgZXZlbnQpO1xuICAgICAgICByZWplY3QoZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgICAgdGhpcy4jb25FcnJvcihldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIHJlcS5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB0aGlzLmRiID0gZXZlbnQudGFyZ2V0LnJlc3VsdDtcblxuICAgICAgICB0aGlzLmRiLm9uZXJyb3IgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIHRoaXMuI2xvZ2dlcignUENhY2hlJywgXCJmYWlsZWQgdG8gY3JlYXRlIHN0b3JhZ2VcIiwgZXZlbnQpO1xuICAgICAgICAgIHRoaXMuI29uRXJyb3IoZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbmRpdmlkdWFsIG9iamVjdCBzdG9yZXMuXG4gICAgICAgIC8vIE9iamVjdCBzdG9yZSAodGFibGUpIGZvciB0b3BpY3MuIFRoZSBwcmltYXJ5IGtleSBpcyB0b3BpYyBuYW1lLlxuICAgICAgICB0aGlzLmRiLmNyZWF0ZU9iamVjdFN0b3JlKCd0b3BpYycsIHtcbiAgICAgICAgICBrZXlQYXRoOiAnbmFtZSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVXNlcnMgb2JqZWN0IHN0b3JlLiBVSUQgaXMgdGhlIHByaW1hcnkga2V5LlxuICAgICAgICB0aGlzLmRiLmNyZWF0ZU9iamVjdFN0b3JlKCd1c2VyJywge1xuICAgICAgICAgIGtleVBhdGg6ICd1aWQnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFN1YnNjcmlwdGlvbnMgb2JqZWN0IHN0b3JlIHRvcGljIDwtPiB1c2VyLiBUb3BpYyBuYW1lICsgVUlEIGlzIHRoZSBwcmltYXJ5IGtleS5cbiAgICAgICAgdGhpcy5kYi5jcmVhdGVPYmplY3RTdG9yZSgnc3Vic2NyaXB0aW9uJywge1xuICAgICAgICAgIGtleVBhdGg6IFsndG9waWMnLCAndWlkJ11cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTWVzc2FnZXMgb2JqZWN0IHN0b3JlLiBUaGUgcHJpbWFyeSBrZXkgaXMgdG9waWMgbmFtZSArIHNlcS5cbiAgICAgICAgdGhpcy5kYi5jcmVhdGVPYmplY3RTdG9yZSgnbWVzc2FnZScsIHtcbiAgICAgICAgICBrZXlQYXRoOiBbJ3RvcGljJywgJ3NlcSddXG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgcGVyc2lzdGVudCBjYWNoZS5cbiAgICovXG4gIGRlbGV0ZURhdGFiYXNlKCkge1xuICAgIC8vIENsb3NlIGNvbm5lY3Rpb24sIG90aGVyd2lzZSBvcGVyYXRpb25zIHdpbGwgZmFpbCB3aXRoICdvbmJsb2NrZWQnLlxuICAgIGlmICh0aGlzLmRiKSB7XG4gICAgICB0aGlzLmRiLmNsb3NlKCk7XG4gICAgICB0aGlzLmRiID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHJlcSA9IElEQlByb3ZpZGVyLmRlbGV0ZURhdGFiYXNlKERCX05BTUUpO1xuICAgICAgcmVxLm9uYmxvY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmRiKSB7XG4gICAgICAgICAgdGhpcy5kYi5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcihcImJsb2NrZWRcIik7XG4gICAgICAgIHRoaXMuI2xvZ2dlcignUENhY2hlJywgJ2RlbGV0ZURhdGFiYXNlJywgZXJyKTtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9O1xuICAgICAgcmVxLm9uc3VjY2VzcyA9IChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLmRiID0gbnVsbDtcbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgICAgcmVxLm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy4jbG9nZ2VyKCdQQ2FjaGUnLCAnZGVsZXRlRGF0YWJhc2UnLCBldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgICByZWplY3QoZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgcGVyc2lzdGVudCBjYWNoZSBpcyByZWFkeSBmb3IgdXNlLlxuICAgKiBAbWVtYmVyT2YgREJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IDxjb2RlPnRydWU8L2NvZGU+IGlmIGNhY2hlIGlzIHJlYWR5LCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICAgKi9cbiAgaXNSZWFkeSgpIHtcbiAgICByZXR1cm4gISF0aGlzLmRiO1xuICB9XG5cbiAgLy8gVG9waWNzLlxuXG4gIC8qKlxuICAgKiBTYXZlIHRvIGNhY2hlIG9yIHVwZGF0ZSB0b3BpYyBpbiBwZXJzaXN0ZW50IGNhY2hlLlxuICAgKiBAbWVtYmVyT2YgREJcbiAgICogQHBhcmFtIHtUb3BpY30gdG9waWMgLSB0b3BpYyB0byBiZSBhZGRlZCBvciB1cGRhdGVkLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSByZXNvbHZlZC9yZWplY3RlZCBvbiBvcGVyYXRpb24gY29tcGxldGlvbi5cbiAgICovXG4gIHVwZFRvcGljKHRvcGljKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVhZHkoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgP1xuICAgICAgICBQcm9taXNlLnJlc29sdmUoKSA6XG4gICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIm5vdCBpbml0aWFsaXplZFwiKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cnggPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFsndG9waWMnXSwgJ3JlYWR3cml0ZScpO1xuICAgICAgdHJ4Lm9uY29tcGxldGUgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgcmVzb2x2ZShldmVudC50YXJnZXQucmVzdWx0KTtcbiAgICAgIH07XG4gICAgICB0cngub25lcnJvciA9IChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLiNsb2dnZXIoJ1BDYWNoZScsICd1cGRUb3BpYycsIGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICAgIHJlamVjdChldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IHJlcSA9IHRyeC5vYmplY3RTdG9yZSgndG9waWMnKS5nZXQodG9waWMubmFtZSk7XG4gICAgICByZXEub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRyeC5vYmplY3RTdG9yZSgndG9waWMnKS5wdXQoREIuI3NlcmlhbGl6ZVRvcGljKHJlcS5yZXN1bHQsIHRvcGljKSk7XG4gICAgICAgIHRyeC5jb21taXQoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTWFyayBvciB1bm1hcmsgdG9waWMgYXMgZGVsZXRlZC5cbiAgICogQG1lbWJlck9mIERCXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gbmFtZSBvZiB0aGUgdG9waWMgdG8gbWFyayBvciB1bm1hcmsuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZGVsZXRlZCAtIGRlbGV0aW9uIG1hcmsuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHByb21pc2UgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gb3BlcmF0aW9uIGNvbXBsZXRpb24uXG4gICAqL1xuICBtYXJrVG9waWNBc0RlbGV0ZWQobmFtZSwgZGVsZXRlZCkge1xuICAgIGlmICghdGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc2FibGVkID9cbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkgOlxuICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJub3QgaW5pdGlhbGl6ZWRcIikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdHJ4ID0gdGhpcy5kYi50cmFuc2FjdGlvbihbJ3RvcGljJ10sICdyZWFkd3JpdGUnKTtcbiAgICAgIHRyeC5vbmNvbXBsZXRlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHJlc29sdmUoZXZlbnQudGFyZ2V0LnJlc3VsdCk7XG4gICAgICB9O1xuICAgICAgdHJ4Lm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy4jbG9nZ2VyKCdQQ2FjaGUnLCAnbWFya1RvcGljQXNEZWxldGVkJywgZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgICAgcmVqZWN0KGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICB9O1xuICAgICAgY29uc3QgcmVxID0gdHJ4Lm9iamVjdFN0b3JlKCd0b3BpYycpLmdldChuYW1lKTtcbiAgICAgIHJlcS5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgdG9waWMgPSBldmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICBpZiAodG9waWMuX2RlbGV0ZWQgIT0gZGVsZXRlZCkge1xuICAgICAgICAgIHRvcGljLl9kZWxldGVkID0gdHJ1ZTtcbiAgICAgICAgICB0cngub2JqZWN0U3RvcmUoJ3RvcGljJykucHV0KHRvcGljKTtcbiAgICAgICAgfVxuICAgICAgICB0cnguY29tbWl0KCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0b3BpYyBmcm9tIHBlcnNpc3RlbnQgY2FjaGUuXG4gICAqIEBtZW1iZXJPZiBEQlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIG5hbWUgb2YgdGhlIHRvcGljIHRvIHJlbW92ZSBmcm9tIGRhdGFiYXNlLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSBwcm9taXNlIHJlc29sdmVkL3JlamVjdGVkIG9uIG9wZXJhdGlvbiBjb21wbGV0aW9uLlxuICAgKi9cbiAgcmVtVG9waWMobmFtZSkge1xuICAgIGlmICghdGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc2FibGVkID9cbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkgOlxuICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJub3QgaW5pdGlhbGl6ZWRcIikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdHJ4ID0gdGhpcy5kYi50cmFuc2FjdGlvbihbJ3RvcGljJywgJ3N1YnNjcmlwdGlvbicsICdtZXNzYWdlJ10sICdyZWFkd3JpdGUnKTtcbiAgICAgIHRyeC5vbmNvbXBsZXRlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHJlc29sdmUoZXZlbnQudGFyZ2V0LnJlc3VsdCk7XG4gICAgICB9O1xuICAgICAgdHJ4Lm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy4jbG9nZ2VyKCdQQ2FjaGUnLCAncmVtVG9waWMnLCBldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgICByZWplY3QoZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgIH07XG4gICAgICB0cngub2JqZWN0U3RvcmUoJ3RvcGljJykuZGVsZXRlKElEQktleVJhbmdlLm9ubHkobmFtZSkpO1xuICAgICAgdHJ4Lm9iamVjdFN0b3JlKCdzdWJzY3JpcHRpb24nKS5kZWxldGUoSURCS2V5UmFuZ2UuYm91bmQoW25hbWUsICctJ10sIFtuYW1lLCAnfiddKSk7XG4gICAgICB0cngub2JqZWN0U3RvcmUoJ21lc3NhZ2UnKS5kZWxldGUoSURCS2V5UmFuZ2UuYm91bmQoW25hbWUsIDBdLCBbbmFtZSwgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJdKSk7XG4gICAgICB0cnguY29tbWl0KCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZSBhIGNhbGxiYWNrIGZvciBlYWNoIHN0b3JlZCB0b3BpYy5cbiAgICogQG1lbWJlck9mIERCXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB0b3BpYy5cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSB0aGUgdmFsdWUgb3IgPGNvZGU+dGhpczwvY29kZT4gaW5zaWRlIHRoZSBjYWxsYmFjay5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZSByZXNvbHZlZC9yZWplY3RlZCBvbiBvcGVyYXRpb24gY29tcGxldGlvbi5cbiAgICovXG4gIG1hcFRvcGljcyhjYWxsYmFjaywgY29udGV4dCkge1xuICAgIHJldHVybiB0aGlzLiNtYXBPYmplY3RzKCd0b3BpYycsIGNhbGxiYWNrLCBjb250ZXh0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb3B5IGRhdGEgZnJvbSBzZXJpYWxpemVkIG9iamVjdCB0byB0b3BpYy5cbiAgICogQG1lbWJlck9mIERCXG4gICAqIEBwYXJhbSB7VG9waWN9IHRvcGljIC0gdGFyZ2V0IHRvIGRlc2VyaWFsaXplIHRvLlxuICAgKiBAcGFyYW0ge09iamVjdH0gc3JjIC0gc2VyaWFsaXplZCBkYXRhIHRvIGNvcHkgZnJvbS5cbiAgICovXG4gIGRlc2VyaWFsaXplVG9waWModG9waWMsIHNyYykge1xuICAgIERCLiNkZXNlcmlhbGl6ZVRvcGljKHRvcGljLCBzcmMpO1xuICB9XG5cbiAgLy8gVXNlcnMuXG4gIC8qKlxuICAgKiBBZGQgb3IgdXBkYXRlIHVzZXIgb2JqZWN0IGluIHRoZSBwZXJzaXN0ZW50IGNhY2hlLlxuICAgKiBAbWVtYmVyT2YgREJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVpZCAtIElEIG9mIHRoZSB1c2VyIHRvIHNhdmUgb3IgdXBkYXRlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcHViIC0gdXNlcidzIDxjb2RlPnB1YmxpYzwvY29kZT4gaW5mb3JtYXRpb24uXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHJlc29sdmVkL3JlamVjdGVkIG9uIG9wZXJhdGlvbiBjb21wbGV0aW9uLlxuICAgKi9cbiAgdXBkVXNlcih1aWQsIHB1Yikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMiB8fCBwdWIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gTm8gcG9pbnQgaW51cGRhdGluZyB1c2VyIHdpdGggaW52YWxpZCBkYXRhLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNSZWFkeSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXNhYmxlZCA/XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpIDpcbiAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwibm90IGluaXRpYWxpemVkXCIpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHRyeCA9IHRoaXMuZGIudHJhbnNhY3Rpb24oWyd1c2VyJ10sICdyZWFkd3JpdGUnKTtcbiAgICAgIHRyeC5vbmNvbXBsZXRlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHJlc29sdmUoZXZlbnQudGFyZ2V0LnJlc3VsdCk7XG4gICAgICB9O1xuICAgICAgdHJ4Lm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy4jbG9nZ2VyKCdQQ2FjaGUnLCAndXBkVXNlcicsIGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICAgIHJlamVjdChldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIHRyeC5vYmplY3RTdG9yZSgndXNlcicpLnB1dCh7XG4gICAgICAgIHVpZDogdWlkLFxuICAgICAgICBwdWJsaWM6IHB1YlxuICAgICAgfSk7XG4gICAgICB0cnguY29tbWl0KCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHVzZXIgZnJvbSBwZXJzaXN0ZW50IGNhY2hlLlxuICAgKiBAbWVtYmVyT2YgREJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVpZCAtIElEIG9mIHRoZSB1c2VyIHRvIHJlbW92ZSBmcm9tIHRoZSBjYWNoZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZSByZXNvbHZlZC9yZWplY3RlZCBvbiBvcGVyYXRpb24gY29tcGxldGlvbi5cbiAgICovXG4gIHJlbVVzZXIodWlkKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVhZHkoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgP1xuICAgICAgICBQcm9taXNlLnJlc29sdmUoKSA6XG4gICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIm5vdCBpbml0aWFsaXplZFwiKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cnggPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFsndXNlciddLCAncmVhZHdyaXRlJyk7XG4gICAgICB0cngub25jb21wbGV0ZSA9IChldmVudCkgPT4ge1xuICAgICAgICByZXNvbHZlKGV2ZW50LnRhcmdldC5yZXN1bHQpO1xuICAgICAgfTtcbiAgICAgIHRyeC5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuI2xvZ2dlcignUENhY2hlJywgJ3JlbVVzZXInLCBldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgICByZWplY3QoZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgIH07XG4gICAgICB0cngub2JqZWN0U3RvcmUoJ3VzZXInKS5kZWxldGUoSURCS2V5UmFuZ2Uub25seSh1aWQpKTtcbiAgICAgIHRyeC5jb21taXQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIGEgY2FsbGJhY2sgZm9yIGVhY2ggc3RvcmVkIHVzZXIuXG4gICAqIEBtZW1iZXJPZiBEQlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdG9waWMuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IC0gdGhlIHZhbHVlIG9yIDxjb2RlPnRoaXM8L2NvZGU+IGluc2lkZSB0aGUgY2FsbGJhY2suXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHByb21pc2UgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gb3BlcmF0aW9uIGNvbXBsZXRpb24uXG4gICAqL1xuICBtYXBVc2VycyhjYWxsYmFjaywgY29udGV4dCkge1xuICAgIHJldHVybiB0aGlzLiNtYXBPYmplY3RzKCd1c2VyJywgY2FsbGJhY2ssIGNvbnRleHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWQgYSBzaW5nbGUgdXNlciBmcm9tIHBlcnNpc3RlbnQgY2FjaGUuXG4gICAqIEBtZW1iZXJPZiBEQlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdWlkIC0gSUQgb2YgdGhlIHVzZXIgdG8gZmV0Y2ggZnJvbSBjYWNoZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZSByZXNvbHZlZC9yZWplY3RlZCBvbiBvcGVyYXRpb24gY29tcGxldGlvbi5cbiAgICovXG4gIGdldFVzZXIodWlkKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVhZHkoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgP1xuICAgICAgICBQcm9taXNlLnJlc29sdmUoKSA6XG4gICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIm5vdCBpbml0aWFsaXplZFwiKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cnggPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFsndXNlciddKTtcbiAgICAgIHRyeC5vbmNvbXBsZXRlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHVzZXIgPSBldmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICB1c2VyOiB1c2VyLnVpZCxcbiAgICAgICAgICBwdWJsaWM6IHVzZXIucHVibGljXG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIHRyeC5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuI2xvZ2dlcignUENhY2hlJywgJ2dldFVzZXInLCBldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgICByZWplY3QoZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgIH07XG4gICAgICB0cngub2JqZWN0U3RvcmUoJ3VzZXInKS5nZXQodWlkKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFN1YnNjcmlwdGlvbnMuXG4gIC8qKlxuICAgKiBBZGQgb3IgdXBkYXRlIHN1YnNjcmlwdGlvbiBpbiBwZXJzaXN0ZW50IGNhY2hlLlxuICAgKiBAbWVtYmVyT2YgREJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRvcGljTmFtZSAtIG5hbWUgb2YgdGhlIHRvcGljIHdoaWNoIG93bnMgdGhlIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1aWQgLSBJRCBvZiB0aGUgc3Vic2NyaWJlZCB1c2VyLlxuICAgKiBAcGFyYW0ge09iamVjdH0gc3ViIC0gc3Vic2NyaXB0aW9uIHRvIHNhdmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHByb21pc2UgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gb3BlcmF0aW9uIGNvbXBsZXRpb24uXG4gICAqL1xuICB1cGRTdWJzY3JpcHRpb24odG9waWNOYW1lLCB1aWQsIHN1Yikge1xuICAgIGlmICghdGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc2FibGVkID9cbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkgOlxuICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJub3QgaW5pdGlhbGl6ZWRcIikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdHJ4ID0gdGhpcy5kYi50cmFuc2FjdGlvbihbJ3N1YnNjcmlwdGlvbiddLCAncmVhZHdyaXRlJyk7XG4gICAgICB0cngub25jb21wbGV0ZSA9IChldmVudCkgPT4ge1xuICAgICAgICByZXNvbHZlKGV2ZW50LnRhcmdldC5yZXN1bHQpO1xuICAgICAgfTtcbiAgICAgIHRyeC5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuI2xvZ2dlcignUENhY2hlJywgJ3VwZFN1YnNjcmlwdGlvbicsIGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICAgIHJlamVjdChldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIHRyeC5vYmplY3RTdG9yZSgnc3Vic2NyaXB0aW9uJykuZ2V0KFt0b3BpY05hbWUsIHVpZF0pLm9uc3VjY2VzcyA9IChldmVudCkgPT4ge1xuICAgICAgICB0cngub2JqZWN0U3RvcmUoJ3N1YnNjcmlwdGlvbicpLnB1dChEQi4jc2VyaWFsaXplU3Vic2NyaXB0aW9uKGV2ZW50LnRhcmdldC5yZXN1bHQsIHRvcGljTmFtZSwgdWlkLCBzdWIpKTtcbiAgICAgICAgdHJ4LmNvbW1pdCgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIGEgY2FsbGJhY2sgZm9yIGVhY2ggY2FjaGVkIHN1YnNjcmlwdGlvbiBpbiBhIGdpdmVuIHRvcGljLlxuICAgKiBAbWVtYmVyT2YgREJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRvcGljTmFtZSAtIG5hbWUgb2YgdGhlIHRvcGljIHdoaWNoIG93bnMgdGhlIHN1YnNjcmlwdGlvbnMuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBzdWJzY3JpcHRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IC0gdGhlIHZhbHVlIG9yIDxjb2RlPnRoaXM8L2NvZGU+IGluc2lkZSB0aGUgY2FsbGJhY2suXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHByb21pc2UgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gb3BlcmF0aW9uIGNvbXBsZXRpb24uXG4gICAqL1xuICBtYXBTdWJzY3JpcHRpb25zKHRvcGljTmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICBpZiAoIXRoaXMuaXNSZWFkeSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXNhYmxlZCA/XG4gICAgICAgIFByb21pc2UucmVzb2x2ZShbXSkgOlxuICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJub3QgaW5pdGlhbGl6ZWRcIikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdHJ4ID0gdGhpcy5kYi50cmFuc2FjdGlvbihbJ3N1YnNjcmlwdGlvbiddKTtcbiAgICAgIHRyeC5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuI2xvZ2dlcignUENhY2hlJywgJ21hcFN1YnNjcmlwdGlvbnMnLCBldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgICByZWplY3QoZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgIH07XG4gICAgICB0cngub2JqZWN0U3RvcmUoJ3N1YnNjcmlwdGlvbicpLmdldEFsbChJREJLZXlSYW5nZS5ib3VuZChbdG9waWNOYW1lLCAnLSddLCBbdG9waWNOYW1lLCAnfiddKSkub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgIGV2ZW50LnRhcmdldC5yZXN1bHQuZm9yRWFjaCgodG9waWMpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgdG9waWMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlc29sdmUoZXZlbnQudGFyZ2V0LnJlc3VsdCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLy8gTWVzc2FnZXMuXG5cbiAgLyoqXG4gICAqIFNhdmUgbWVzc2FnZSB0byBwZXJzaXN0ZW50IGNhY2hlLlxuICAgKiBAbWVtYmVyT2YgREJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRvcGljTmFtZSAtIG5hbWUgb2YgdGhlIHRvcGljIHdoaWNoIG93bnMgdGhlIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtc2cgLSBtZXNzYWdlIHRvIHNhdmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHByb21pc2UgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gb3BlcmF0aW9uIGNvbXBsZXRpb24uXG4gICAqL1xuICBhZGRNZXNzYWdlKG1zZykge1xuICAgIGlmICghdGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc2FibGVkID9cbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkgOlxuICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJub3QgaW5pdGlhbGl6ZWRcIikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdHJ4ID0gdGhpcy5kYi50cmFuc2FjdGlvbihbJ21lc3NhZ2UnXSwgJ3JlYWR3cml0ZScpO1xuICAgICAgdHJ4Lm9uc3VjY2VzcyA9IChldmVudCkgPT4ge1xuICAgICAgICByZXNvbHZlKGV2ZW50LnRhcmdldC5yZXN1bHQpO1xuICAgICAgfTtcbiAgICAgIHRyeC5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuI2xvZ2dlcignUENhY2hlJywgJ2FkZE1lc3NhZ2UnLCBldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgICByZWplY3QoZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgIH07XG4gICAgICB0cngub2JqZWN0U3RvcmUoJ21lc3NhZ2UnKS5hZGQoREIuI3NlcmlhbGl6ZU1lc3NhZ2UobnVsbCwgbXNnKSk7XG4gICAgICB0cnguY29tbWl0KCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIGRlbGl2ZXJ5IHN0YXR1cyBvZiBhIG1lc3NhZ2Ugc3RvcmVkIGluIHBlcnNpc3RlbnQgY2FjaGUuXG4gICAqIEBtZW1iZXJPZiBEQlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWNOYW1lIC0gbmFtZSBvZiB0aGUgdG9waWMgd2hpY2ggb3ducyB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcSAtIElEIG9mIHRoZSBtZXNzYWdlIHRvIHVwZGF0ZVxuICAgKiBAcGFyYW0ge251bWJlcn0gc3RhdHVzIC0gbmV3IGRlbGl2ZXJ5IHN0YXR1cyBvZiB0aGUgbWVzc2FnZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZSByZXNvbHZlZC9yZWplY3RlZCBvbiBvcGVyYXRpb24gY29tcGxldGlvbi5cbiAgICovXG4gIHVwZE1lc3NhZ2VTdGF0dXModG9waWNOYW1lLCBzZXEsIHN0YXR1cykge1xuICAgIGlmICghdGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc2FibGVkID9cbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkgOlxuICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJub3QgaW5pdGlhbGl6ZWRcIikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdHJ4ID0gdGhpcy5kYi50cmFuc2FjdGlvbihbJ21lc3NhZ2UnXSwgJ3JlYWR3cml0ZScpO1xuICAgICAgdHJ4Lm9uc3VjY2VzcyA9IChldmVudCkgPT4ge1xuICAgICAgICByZXNvbHZlKGV2ZW50LnRhcmdldC5yZXN1bHQpO1xuICAgICAgfTtcbiAgICAgIHRyeC5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuI2xvZ2dlcignUENhY2hlJywgJ3VwZE1lc3NhZ2VTdGF0dXMnLCBldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgICByZWplY3QoZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgIH07XG4gICAgICBjb25zdCByZXEgPSB0cngub2JqZWN0U3RvcmUoJ21lc3NhZ2UnKS5nZXQoSURCS2V5UmFuZ2Uub25seShbdG9waWNOYW1lLCBzZXFdKSk7XG4gICAgICByZXEub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHNyYyA9IHJlcS5yZXN1bHQgfHwgZXZlbnQudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgaWYgKCFzcmMgfHwgc3JjLl9zdGF0dXMgPT0gc3RhdHVzKSB7XG4gICAgICAgICAgdHJ4LmNvbW1pdCgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cngub2JqZWN0U3RvcmUoJ21lc3NhZ2UnKS5wdXQoREIuI3NlcmlhbGl6ZU1lc3NhZ2Uoc3JjLCB7XG4gICAgICAgICAgdG9waWM6IHRvcGljTmFtZSxcbiAgICAgICAgICBzZXE6IHNlcSxcbiAgICAgICAgICBfc3RhdHVzOiBzdGF0dXNcbiAgICAgICAgfSkpO1xuICAgICAgICB0cnguY29tbWl0KCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBvbmUgb3IgbW9yZSBtZXNzYWdlcyBmcm9tIHBlcnNpc3RlbnQgY2FjaGUuXG4gICAqIEBtZW1iZXJPZiBEQlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWNOYW1lIC0gbmFtZSBvZiB0aGUgdG9waWMgd2hpY2ggb3ducyB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGZyb20gLSBpZCBvZiB0aGUgbWVzc2FnZSB0byByZW1vdmUgb3IgbG93ZXIgYm91bmRhcnkgd2hlbiByZW1vdmluZyByYW5nZSAoaW5jbHVzaXZlKS5cbiAgICogQHBhcmFtIHtudW1iZXI9fSB0byAtIHVwcGVyIGJvdW5kYXJ5IChleGNsdXNpdmUpIHdoZW4gcmVtb3ZpbmcgYSByYW5nZSBvZiBtZXNzYWdlcy5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZSByZXNvbHZlZC9yZWplY3RlZCBvbiBvcGVyYXRpb24gY29tcGxldGlvbi5cbiAgICovXG4gIHJlbU1lc3NhZ2VzKHRvcGljTmFtZSwgZnJvbSwgdG8pIHtcbiAgICBpZiAoIXRoaXMuaXNSZWFkeSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXNhYmxlZCA/XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpIDpcbiAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwibm90IGluaXRpYWxpemVkXCIpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICghZnJvbSAmJiAhdG8pIHtcbiAgICAgICAgZnJvbSA9IDA7XG4gICAgICAgIHRvID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICB9XG4gICAgICBjb25zdCByYW5nZSA9IHRvID4gMCA/IElEQktleVJhbmdlLmJvdW5kKFt0b3BpY05hbWUsIGZyb21dLCBbdG9waWNOYW1lLCB0b10sIGZhbHNlLCB0cnVlKSA6XG4gICAgICAgIElEQktleVJhbmdlLm9ubHkoW3RvcGljTmFtZSwgZnJvbV0pO1xuICAgICAgY29uc3QgdHJ4ID0gdGhpcy5kYi50cmFuc2FjdGlvbihbJ21lc3NhZ2UnXSwgJ3JlYWR3cml0ZScpO1xuICAgICAgdHJ4Lm9uc3VjY2VzcyA9IChldmVudCkgPT4ge1xuICAgICAgICByZXNvbHZlKGV2ZW50LnRhcmdldC5yZXN1bHQpO1xuICAgICAgfTtcbiAgICAgIHRyeC5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuI2xvZ2dlcignUENhY2hlJywgJ3JlbU1lc3NhZ2VzJywgZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgICAgcmVqZWN0KGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICB9O1xuICAgICAgdHJ4Lm9iamVjdFN0b3JlKCdtZXNzYWdlJykuZGVsZXRlKHJhbmdlKTtcbiAgICAgIHRyeC5jb21taXQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBtZXNzYWdlcyBmcm9tIHBlcnNpc3RlbnQgc3RvcmUuXG4gICAqIEBtZW1iZXJPZiBEQlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWNOYW1lIC0gbmFtZSBvZiB0aGUgdG9waWMgdG8gcmV0cmlldmUgbWVzc2FnZXMgZnJvbS5cbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgdG8gY2FsbCBmb3IgZWFjaCByZXRyaWV2ZWQgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IHF1ZXJ5IC0gcGFyYW1ldGVycyBvZiB0aGUgbWVzc2FnZSByYW5nZSB0byByZXRyaWV2ZS5cbiAgICogQHBhcmFtIHtudW1iZXI9fSBxdWVyeS5zaW5jZSAtIHRoZSBsZWFzdCBtZXNzYWdlIElEIHRvIHJldHJpZXZlIChpbmNsdXNpdmUpLlxuICAgKiBAcGFyYW0ge251bWJlcj19IHF1ZXJ5LmJlZm9yZSAtIHRoZSBncmVhdGVzdCBtZXNzYWdlIElEIHRvIHJldHJpZXZlIChleGNsdXNpdmUpLlxuICAgKiBAcGFyYW0ge251bWJlcj19IHF1ZXJ5LmxpbWl0IC0gdGhlIG1heGltdW0gbnVtYmVyIG9mIG1lc3NhZ2VzIHRvIHJldHJpZXZlLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSBwcm9taXNlIHJlc29sdmVkL3JlamVjdGVkIG9uIG9wZXJhdGlvbiBjb21wbGV0aW9uLlxuICAgKi9cbiAgcmVhZE1lc3NhZ2VzKHRvcGljTmFtZSwgcXVlcnksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgaWYgKCF0aGlzLmlzUmVhZHkoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgP1xuICAgICAgICBQcm9taXNlLnJlc29sdmUoW10pIDpcbiAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwibm90IGluaXRpYWxpemVkXCIpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHF1ZXJ5ID0gcXVlcnkgfHwge307XG4gICAgICBjb25zdCBzaW5jZSA9IHF1ZXJ5LnNpbmNlID4gMCA/IHF1ZXJ5LnNpbmNlIDogMDtcbiAgICAgIGNvbnN0IGJlZm9yZSA9IHF1ZXJ5LmJlZm9yZSA+IDAgPyBxdWVyeS5iZWZvcmUgOiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgIGNvbnN0IGxpbWl0ID0gcXVlcnkubGltaXQgfCAwO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICAgIGNvbnN0IHJhbmdlID0gSURCS2V5UmFuZ2UuYm91bmQoW3RvcGljTmFtZSwgc2luY2VdLCBbdG9waWNOYW1lLCBiZWZvcmVdLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICBjb25zdCB0cnggPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFsnbWVzc2FnZSddKTtcbiAgICAgIHRyeC5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuI2xvZ2dlcignUENhY2hlJywgJ3JlYWRNZXNzYWdlcycsIGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICAgIHJlamVjdChldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIC8vIEl0ZXJhdGUgaW4gZGVzY2VuZGluZyBvcmRlci5cbiAgICAgIHRyeC5vYmplY3RTdG9yZSgnbWVzc2FnZScpLm9wZW5DdXJzb3IocmFuZ2UsICdwcmV2Jykub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnNvciA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgIGlmIChjdXJzb3IpIHtcbiAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgY3Vyc29yLnZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzdWx0LnB1c2goY3Vyc29yLnZhbHVlKTtcbiAgICAgICAgICBpZiAobGltaXQgPD0gMCB8fCByZXN1bHQubGVuZ3RoIDwgbGltaXQpIHtcbiAgICAgICAgICAgIGN1cnNvci5jb250aW51ZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFByaXZhdGUgbWV0aG9kcy5cblxuICAvLyBTZXJpYWxpemFibGUgdG9waWMgZmllbGRzLlxuICBzdGF0aWMgI3RvcGljX2ZpZWxkcyA9IFsnY3JlYXRlZCcsICd1cGRhdGVkJywgJ2RlbGV0ZWQnLCAncmVhZCcsICdyZWN2JywgJ3NlcScsICdjbGVhcicsICdkZWZhY3MnLFxuICAgICdjcmVkcycsICdwdWJsaWMnLCAndHJ1c3RlZCcsICdwcml2YXRlJywgJ3RvdWNoZWQnLCAnX2RlbGV0ZWQnXG4gIF07XG5cbiAgLy8gQ29weSBkYXRhIGZyb20gc3JjIHRvIFRvcGljIG9iamVjdC5cbiAgc3RhdGljICNkZXNlcmlhbGl6ZVRvcGljKHRvcGljLCBzcmMpIHtcbiAgICBEQi4jdG9waWNfZmllbGRzLmZvckVhY2goKGYpID0+IHtcbiAgICAgIGlmIChzcmMuaGFzT3duUHJvcGVydHkoZikpIHtcbiAgICAgICAgdG9waWNbZl0gPSBzcmNbZl07XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc3JjLnRhZ3MpKSB7XG4gICAgICB0b3BpYy5fdGFncyA9IHNyYy50YWdzO1xuICAgIH1cbiAgICBpZiAoc3JjLmFjcykge1xuICAgICAgdG9waWMuc2V0QWNjZXNzTW9kZShzcmMuYWNzKTtcbiAgICB9XG4gICAgdG9waWMuc2VxIHw9IDA7XG4gICAgdG9waWMucmVhZCB8PSAwO1xuICAgIHRvcGljLnVucmVhZCA9IE1hdGgubWF4KDAsIHRvcGljLnNlcSAtIHRvcGljLnJlYWQpO1xuICB9XG5cbiAgLy8gQ29weSB2YWx1ZXMgZnJvbSAnc3JjJyB0byAnZHN0Jy4gQWxsb2NhdGUgZHN0IGlmIGl0J3MgbnVsbCBvciB1bmRlZmluZWQuXG4gIHN0YXRpYyAjc2VyaWFsaXplVG9waWMoZHN0LCBzcmMpIHtcbiAgICBjb25zdCByZXMgPSBkc3QgfHwge1xuICAgICAgbmFtZTogc3JjLm5hbWVcbiAgICB9O1xuICAgIERCLiN0b3BpY19maWVsZHMuZm9yRWFjaCgoZikgPT4ge1xuICAgICAgaWYgKHNyYy5oYXNPd25Qcm9wZXJ0eShmKSkge1xuICAgICAgICByZXNbZl0gPSBzcmNbZl07XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc3JjLl90YWdzKSkge1xuICAgICAgcmVzLnRhZ3MgPSBzcmMuX3RhZ3M7XG4gICAgfVxuICAgIGlmIChzcmMuYWNzKSB7XG4gICAgICByZXMuYWNzID0gc3JjLmdldEFjY2Vzc01vZGUoKS5qc29uSGVscGVyKCk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBzdGF0aWMgI3NlcmlhbGl6ZVN1YnNjcmlwdGlvbihkc3QsIHRvcGljTmFtZSwgdWlkLCBzdWIpIHtcbiAgICBjb25zdCBmaWVsZHMgPSBbJ3VwZGF0ZWQnLCAnbW9kZScsICdyZWFkJywgJ3JlY3YnLCAnY2xlYXInLCAnbGFzdFNlZW4nLCAndXNlckFnZW50J107XG4gICAgY29uc3QgcmVzID0gZHN0IHx8IHtcbiAgICAgIHRvcGljOiB0b3BpY05hbWUsXG4gICAgICB1aWQ6IHVpZFxuICAgIH07XG5cbiAgICBmaWVsZHMuZm9yRWFjaCgoZikgPT4ge1xuICAgICAgaWYgKHN1Yi5oYXNPd25Qcm9wZXJ0eShmKSkge1xuICAgICAgICByZXNbZl0gPSBzdWJbZl07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgc3RhdGljICNzZXJpYWxpemVNZXNzYWdlKGRzdCwgbXNnKSB7XG4gICAgLy8gU2VyaWFsaXphYmxlIGZpZWxkcy5cbiAgICBjb25zdCBmaWVsZHMgPSBbJ3RvcGljJywgJ3NlcScsICd0cycsICdfc3RhdHVzJywgJ2Zyb20nLCAnaGVhZCcsICdjb250ZW50J107XG4gICAgY29uc3QgcmVzID0gZHN0IHx8IHt9O1xuICAgIGZpZWxkcy5mb3JFYWNoKChmKSA9PiB7XG4gICAgICBpZiAobXNnLmhhc093blByb3BlcnR5KGYpKSB7XG4gICAgICAgIHJlc1tmXSA9IG1zZ1tmXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvIHVzZSBEQiBpbiBhIG5vbiBicm93c2VyIGNvbnRleHQsIHN1cHBseSBpbmRleGVkREIgcHJvdmlkZXIuXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlcm9mIERCXG4gICAqIEBwYXJhbSBpZGJQcm92aWRlciBpbmRleGVkREIgcHJvdmlkZXIsIGUuZy4gZm9yIG5vZGUgPGNvZGU+cmVxdWlyZSgnZmFrZS1pbmRleGVkZGInKTwvY29kZT4uXG4gICAqL1xuICBzdGF0aWMgc2V0RGF0YWJhc2VQcm92aWRlcihpZGJQcm92aWRlcikge1xuICAgIElEQlByb3ZpZGVyID0gaWRiUHJvdmlkZXI7XG4gIH1cbn1cbiIsIi8qKlxuICogQGNvcHlyaWdodCAyMDE1LTIwMjIgVGlub2RlIExMQy5cbiAqIEBzdW1tYXJ5IE1pbmltYWxseSByaWNoIHRleHQgcmVwcmVzZW50YXRpb24gYW5kIGZvcm1hdHRpbmcgZm9yIFRpbm9kZS5cbiAqIEBsaWNlbnNlIEFwYWNoZSAyLjBcbiAqXG4gKiBAZmlsZSBCYXNpYyBwYXJzZXIgYW5kIGZvcm1hdHRlciBmb3IgdmVyeSBzaW1wbGUgdGV4dCBtYXJrdXAuIE1vc3RseSB0YXJnZXRlZCBhdFxuICogbW9iaWxlIHVzZSBjYXNlcyBzaW1pbGFyIHRvIFRlbGVncmFtLCBXaGF0c0FwcCwgYW5kIEZCIE1lc3Nlbmdlci5cbiAqXG4gKiA8cD5TdXBwb3J0cyBjb252ZXJzaW9uIG9mIHVzZXIga2V5Ym9hcmQgaW5wdXQgdG8gZm9ybWF0dGVkIHRleHQ6PC9wPlxuICogPHVsPlxuICogICA8bGk+KmFiYyogJnJhcnI7IDxiPmFiYzwvYj48L2xpPlxuICogICA8bGk+X2FiY18gJnJhcnI7IDxpPmFiYzwvaT48L2xpPlxuICogICA8bGk+fmFiY34gJnJhcnI7IDxkZWw+YWJjPC9kZWw+PC9saT5cbiAqICAgPGxpPmBhYmNgICZyYXJyOyA8dHQ+YWJjPC90dD48L2xpPlxuICogPC91bD5cbiAqIEFsc28gc3VwcG9ydHMgZm9ybXMgYW5kIGJ1dHRvbnMuXG4gKlxuICogTmVzdGVkIGZvcm1hdHRpbmcgaXMgc3VwcG9ydGVkLCBlLmcuICphYmMgX2RlZl8qIC0+IDxiPmFiYyA8aT5kZWY8L2k+PC9iPlxuICogVVJMcywgQG1lbnRpb25zLCBhbmQgI2hhc2h0YWdzIGFyZSBleHRyYWN0ZWQgYW5kIGNvbnZlcnRlZCBpbnRvIGxpbmtzLlxuICogRm9ybXMgYW5kIGJ1dHRvbnMgY2FuIGJlIGFkZGVkIHByb2NlZHVyYWxseS5cbiAqIEpTT04gZGF0YSByZXByZXNlbnRhdGlvbiBpcyBpbnNwaXJlZCBieSBEcmFmdC5qcyByYXcgZm9ybWF0dGluZy5cbiAqXG4gKlxuICogQGV4YW1wbGVcbiAqIFRleHQ6XG4gKiA8cHJlPlxuICogICAgIHRoaXMgaXMgKmJvbGQqLCBgY29kZWAgYW5kIF9pdGFsaWNfLCB+c3RyaWtlflxuICogICAgIGNvbWJpbmVkICpib2xkIGFuZCBfaXRhbGljXypcbiAqICAgICBhbiB1cmw6IGh0dHBzOi8vd3d3LmV4YW1wbGUuY29tL2FiYyNmcmFnbWVudCBhbmQgYW5vdGhlciBfd3d3LnRpbm9kZS5jb19cbiAqICAgICB0aGlzIGlzIGEgQG1lbnRpb24gYW5kIGEgI2hhc2h0YWcgaW4gYSBzdHJpbmdcbiAqICAgICBzZWNvbmQgI2hhc2h0YWdcbiAqIDwvcHJlPlxuICpcbiAqICBTYW1wbGUgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgdGV4dCBhYm92ZTpcbiAqICB7XG4gKiAgICAgXCJ0eHRcIjogXCJ0aGlzIGlzIGJvbGQsIGNvZGUgYW5kIGl0YWxpYywgc3RyaWtlIGNvbWJpbmVkIGJvbGQgYW5kIGl0YWxpYyBhbiB1cmw6IGh0dHBzOi8vd3d3LmV4YW1wbGUuY29tL2FiYyNmcmFnbWVudCBcIiArXG4gKiAgICAgICAgICAgICBcImFuZCBhbm90aGVyIHd3dy50aW5vZGUuY28gdGhpcyBpcyBhIEBtZW50aW9uIGFuZCBhICNoYXNodGFnIGluIGEgc3RyaW5nIHNlY29uZCAjaGFzaHRhZ1wiLFxuICogICAgIFwiZm10XCI6IFtcbiAqICAgICAgICAgeyBcImF0XCI6OCwgXCJsZW5cIjo0LFwidHBcIjpcIlNUXCIgfSx7IFwiYXRcIjoxNCwgXCJsZW5cIjo0LCBcInRwXCI6XCJDT1wiIH0seyBcImF0XCI6MjMsIFwibGVuXCI6NiwgXCJ0cFwiOlwiRU1cIn0sXG4gKiAgICAgICAgIHsgXCJhdFwiOjMxLCBcImxlblwiOjYsIFwidHBcIjpcIkRMXCIgfSx7IFwidHBcIjpcIkJSXCIsIFwibGVuXCI6MSwgXCJhdFwiOjM3IH0seyBcImF0XCI6NTYsIFwibGVuXCI6NiwgXCJ0cFwiOlwiRU1cIiB9LFxuICogICAgICAgICB7IFwiYXRcIjo0NywgXCJsZW5cIjoxNSwgXCJ0cFwiOlwiU1RcIiB9LHsgXCJ0cFwiOlwiQlJcIiwgXCJsZW5cIjoxLCBcImF0XCI6NjIgfSx7IFwiYXRcIjoxMjAsIFwibGVuXCI6MTMsIFwidHBcIjpcIkVNXCIgfSxcbiAqICAgICAgICAgeyBcImF0XCI6NzEsIFwibGVuXCI6MzYsIFwia2V5XCI6MCB9LHsgXCJhdFwiOjEyMCwgXCJsZW5cIjoxMywgXCJrZXlcIjoxIH0seyBcInRwXCI6XCJCUlwiLCBcImxlblwiOjEsIFwiYXRcIjoxMzMgfSxcbiAqICAgICAgICAgeyBcImF0XCI6MTQ0LCBcImxlblwiOjgsIFwia2V5XCI6MiB9LHsgXCJhdFwiOjE1OSwgXCJsZW5cIjo4LCBcImtleVwiOjMgfSx7IFwidHBcIjpcIkJSXCIsIFwibGVuXCI6MSwgXCJhdFwiOjE3OSB9LFxuICogICAgICAgICB7IFwiYXRcIjoxODcsIFwibGVuXCI6OCwgXCJrZXlcIjozIH0seyBcInRwXCI6XCJCUlwiLCBcImxlblwiOjEsIFwiYXRcIjoxOTUgfVxuICogICAgIF0sXG4gKiAgICAgXCJlbnRcIjogW1xuICogICAgICAgICB7IFwidHBcIjpcIkxOXCIsIFwiZGF0YVwiOnsgXCJ1cmxcIjpcImh0dHBzOi8vd3d3LmV4YW1wbGUuY29tL2FiYyNmcmFnbWVudFwiIH0gfSxcbiAqICAgICAgICAgeyBcInRwXCI6XCJMTlwiLCBcImRhdGFcIjp7IFwidXJsXCI6XCJodHRwOi8vd3d3LnRpbm9kZS5jb1wiIH0gfSxcbiAqICAgICAgICAgeyBcInRwXCI6XCJNTlwiLCBcImRhdGFcIjp7IFwidmFsXCI6XCJtZW50aW9uXCIgfSB9LFxuICogICAgICAgICB7IFwidHBcIjpcIkhUXCIsIFwiZGF0YVwiOnsgXCJ2YWxcIjpcImhhc2h0YWdcIiB9IH1cbiAqICAgICBdXG4gKiAgfVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTk9URSBUTyBERVZFTE9QRVJTOlxuLy8gTG9jYWxpemFibGUgc3RyaW5ncyBzaG91bGQgYmUgZG91YmxlIHF1b3RlZCBcItGB0YLRgNC+0LrQsCDQvdCwINC00YDRg9Cz0L7QvCDRj9C30YvQutC1XCIsXG4vLyBub24tbG9jYWxpemFibGUgc3RyaW5ncyBzaG91bGQgYmUgc2luZ2xlIHF1b3RlZCAnbm9uLWxvY2FsaXplZCcuXG5cbmNvbnN0IE1BWF9GT1JNX0VMRU1FTlRTID0gODtcbmNvbnN0IE1BWF9QUkVWSUVXX0FUVEFDSE1FTlRTID0gMztcbmNvbnN0IE1BWF9QUkVWSUVXX0RBVEFfU0laRSA9IDY0O1xuY29uc3QgSlNPTl9NSU1FX1RZUEUgPSAnYXBwbGljYXRpb24vanNvbic7XG5jb25zdCBEUkFGVFlfTUlNRV9UWVBFID0gJ3RleHQveC1kcmFmdHknO1xuY29uc3QgQUxMT1dFRF9FTlRfRklFTERTID0gWydhY3QnLCAnaGVpZ2h0JywgJ2R1cmF0aW9uJywgJ21pbWUnLCAnbmFtZScsICdwcmV2aWV3JywgJ3JlZicsICdzaXplJywgJ3VybCcsICd2YWwnLCAnd2lkdGgnXTtcblxuLy8gUmVndWxhciBleHByZXNzaW9ucyBmb3IgcGFyc2luZyBpbmxpbmUgZm9ybWF0cy4gSmF2YXNjcmlwdCBkb2VzIG5vdCBzdXBwb3J0IGxvb2tiZWhpbmQsXG4vLyBzbyBpdCdzIGEgYml0IG1lc3N5LlxuY29uc3QgSU5MSU5FX1NUWUxFUyA9IFtcbiAgLy8gU3Ryb25nID0gYm9sZCwgKmJvbGQgdGV4dCpcbiAge1xuICAgIG5hbWU6ICdTVCcsXG4gICAgc3RhcnQ6IC8oPzpefFtcXFdfXSkoXFwqKVteXFxzKl0vLFxuICAgIGVuZDogL1teXFxzKl0oXFwqKSg/PSR8W1xcV19dKS9cbiAgfSxcbiAgLy8gRW1waGVzaXplZCA9IGl0YWxpYywgX2l0YWxpYyB0ZXh0X1xuICB7XG4gICAgbmFtZTogJ0VNJyxcbiAgICBzdGFydDogLyg/Ol58XFxXKShfKVteXFxzX10vLFxuICAgIGVuZDogL1teXFxzX10oXykoPz0kfFxcVykvXG4gIH0sXG4gIC8vIERlbGV0ZWQsIH5zdHJpa2UgdGhpcyB0aG91Z2h+XG4gIHtcbiAgICBuYW1lOiAnREwnLFxuICAgIHN0YXJ0OiAvKD86XnxbXFxXX10pKH4pW15cXHN+XS8sXG4gICAgZW5kOiAvW15cXHN+XSh+KSg/PSR8W1xcV19dKS9cbiAgfSxcbiAgLy8gQ29kZSBibG9jayBgdGhpcyBpcyBtb25vc3BhY2VgXG4gIHtcbiAgICBuYW1lOiAnQ08nLFxuICAgIHN0YXJ0OiAvKD86XnxcXFcpKGApW15gXS8sXG4gICAgZW5kOiAvW15gXShgKSg/PSR8XFxXKS9cbiAgfVxuXTtcblxuLy8gUmVsYXRpdmUgd2VpZ2h0cyBvZiBmb3JtYXR0aW5nIHNwYW5zLiBHcmVhdGVyIGluZGV4IGluIGFycmF5IG1lYW5zIGdyZWF0ZXIgd2VpZ2h0LlxuY29uc3QgRk1UX1dFSUdIVCA9IFsnUVEnXTtcblxuLy8gUmVnRXhwcyBmb3IgZW50aXR5IGV4dHJhY3Rpb24gKFJGID0gcmVmZXJlbmNlKVxuY29uc3QgRU5USVRZX1RZUEVTID0gW1xuICAvLyBVUkxzXG4gIHtcbiAgICBuYW1lOiAnTE4nLFxuICAgIGRhdGFOYW1lOiAndXJsJyxcbiAgICBwYWNrOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIC8vIENoZWNrIGlmIHRoZSBwcm90b2NvbCBpcyBzcGVjaWZpZWQsIGlmIG5vdCB1c2UgaHR0cFxuICAgICAgaWYgKCEvXlthLXpdKzpcXC9cXC8vaS50ZXN0KHZhbCkpIHtcbiAgICAgICAgdmFsID0gJ2h0dHA6Ly8nICsgdmFsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdXJsOiB2YWxcbiAgICAgIH07XG4gICAgfSxcbiAgICByZTogLyg/Oig/Omh0dHBzP3xmdHApOlxcL1xcL3x3d3dcXC58ZnRwXFwuKVstQS1aMC05KyZAI1xcLyU9fl98JD8hOiwuXSpbQS1aMC05KyZAI1xcLyU9fl98JF0vaWdcbiAgfSxcbiAgLy8gTWVudGlvbnMgQHVzZXIgKG11c3QgYmUgMiBvciBtb3JlIGNoYXJhY3RlcnMpXG4gIHtcbiAgICBuYW1lOiAnTU4nLFxuICAgIGRhdGFOYW1lOiAndmFsJyxcbiAgICBwYWNrOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbDogdmFsLnNsaWNlKDEpXG4gICAgICB9O1xuICAgIH0sXG4gICAgcmU6IC9cXEJAKFtcXHB7TH1cXHB7Tn1dWy5fXFxwe0x9XFxwe059XSpbXFxwe0x9XFxwe059XSkvdWdcbiAgfSxcbiAgLy8gSGFzaHRhZ3MgI2hhc2h0YWcsIGxpa2UgbWV0aW9uIDIgb3IgbW9yZSBjaGFyYWN0ZXJzLlxuICB7XG4gICAgbmFtZTogJ0hUJyxcbiAgICBkYXRhTmFtZTogJ3ZhbCcsXG4gICAgcGFjazogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWw6IHZhbC5zbGljZSgxKVxuICAgICAgfTtcbiAgICB9LFxuICAgIHJlOiAvXFxCIyhbXFxwe0x9XFxwe059XVsuX1xccHtMfVxccHtOfV0qW1xccHtMfVxccHtOfV0pL3VnXG4gIH1cbl07XG5cbi8vIEhUTUwgdGFnIG5hbWUgc3VnZ2VzdGlvbnNcbmNvbnN0IEhUTUxfVEFHUyA9IHtcbiAgQVU6IHtcbiAgICBuYW1lOiAnYXVkaW8nLFxuICAgIGlzVm9pZDogZmFsc2VcbiAgfSxcbiAgQk46IHtcbiAgICBuYW1lOiAnYnV0dG9uJyxcbiAgICBpc1ZvaWQ6IGZhbHNlXG4gIH0sXG4gIEJSOiB7XG4gICAgbmFtZTogJ2JyJyxcbiAgICBpc1ZvaWQ6IHRydWVcbiAgfSxcbiAgQ086IHtcbiAgICBuYW1lOiAndHQnLFxuICAgIGlzVm9pZDogZmFsc2VcbiAgfSxcbiAgREw6IHtcbiAgICBuYW1lOiAnZGVsJyxcbiAgICBpc1ZvaWQ6IGZhbHNlXG4gIH0sXG4gIEVNOiB7XG4gICAgbmFtZTogJ2knLFxuICAgIGlzVm9pZDogZmFsc2VcbiAgfSxcbiAgRVg6IHtcbiAgICBuYW1lOiAnJyxcbiAgICBpc1ZvaWQ6IHRydWVcbiAgfSxcbiAgRk06IHtcbiAgICBuYW1lOiAnZGl2JyxcbiAgICBpc1ZvaWQ6IGZhbHNlXG4gIH0sXG4gIEhEOiB7XG4gICAgbmFtZTogJycsXG4gICAgaXNWb2lkOiBmYWxzZVxuICB9LFxuICBITDoge1xuICAgIG5hbWU6ICdzcGFuJyxcbiAgICBpc1ZvaWQ6IGZhbHNlXG4gIH0sXG4gIEhUOiB7XG4gICAgbmFtZTogJ2EnLFxuICAgIGlzVm9pZDogZmFsc2VcbiAgfSxcbiAgSU06IHtcbiAgICBuYW1lOiAnaW1nJyxcbiAgICBpc1ZvaWQ6IGZhbHNlXG4gIH0sXG4gIExOOiB7XG4gICAgbmFtZTogJ2EnLFxuICAgIGlzVm9pZDogZmFsc2VcbiAgfSxcbiAgTU46IHtcbiAgICBuYW1lOiAnYScsXG4gICAgaXNWb2lkOiBmYWxzZVxuICB9LFxuICBSVzoge1xuICAgIG5hbWU6ICdkaXYnLFxuICAgIGlzVm9pZDogZmFsc2UsXG4gIH0sXG4gIFFROiB7XG4gICAgbmFtZTogJ2RpdicsXG4gICAgaXNWb2lkOiBmYWxzZVxuICB9LFxuICBTVDoge1xuICAgIG5hbWU6ICdiJyxcbiAgICBpc1ZvaWQ6IGZhbHNlXG4gIH0sXG59O1xuXG4vLyBDb252ZXJ0IGJhc2U2NC1lbmNvZGVkIHN0cmluZyBpbnRvIEJsb2IuXG5mdW5jdGlvbiBiYXNlNjR0b09iamVjdFVybChiNjQsIGNvbnRlbnRUeXBlLCBsb2dnZXIpIHtcbiAgaWYgKCFiNjQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgYmluID0gYXRvYihiNjQpO1xuICAgIGNvbnN0IGxlbmd0aCA9IGJpbi5sZW5ndGg7XG4gICAgY29uc3QgYnVmID0gbmV3IEFycmF5QnVmZmVyKGxlbmd0aCk7XG4gICAgY29uc3QgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBhcnJbaV0gPSBiaW4uY2hhckNvZGVBdChpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbYnVmXSwge1xuICAgICAgdHlwZTogY29udGVudFR5cGVcbiAgICB9KSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmIChsb2dnZXIpIHtcbiAgICAgIGxvZ2dlcihcIkRyYWZ0eTogZmFpbGVkIHRvIGNvbnZlcnQgb2JqZWN0LlwiLCBlcnIubWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NHRvRGF0YVVybChiNjQsIGNvbnRlbnRUeXBlKSB7XG4gIGlmICghYjY0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29udGVudFR5cGUgPSBjb250ZW50VHlwZSB8fCAnaW1hZ2UvanBlZyc7XG4gIHJldHVybiAnZGF0YTonICsgY29udGVudFR5cGUgKyAnO2Jhc2U2NCwnICsgYjY0O1xufVxuXG4vLyBIZWxwZXJzIGZvciBjb252ZXJ0aW5nIERyYWZ0eSB0byBIVE1MLlxuY29uc3QgREVDT1JBVE9SUyA9IHtcbiAgLy8gVmlzaWFsIHN0eWxlc1xuICBTVDoge1xuICAgIG9wZW46IF8gPT4gJzxiPicsXG4gICAgY2xvc2U6IF8gPT4gJzwvYj4nXG4gIH0sXG4gIEVNOiB7XG4gICAgb3BlbjogXyA9PiAnPGk+JyxcbiAgICBjbG9zZTogXyA9PiAnPC9pPidcbiAgfSxcbiAgREw6IHtcbiAgICBvcGVuOiBfID0+ICc8ZGVsPicsXG4gICAgY2xvc2U6IF8gPT4gJzwvZGVsPidcbiAgfSxcbiAgQ086IHtcbiAgICBvcGVuOiBfID0+ICc8dHQ+JyxcbiAgICBjbG9zZTogXyA9PiAnPC90dD4nXG4gIH0sXG4gIC8vIExpbmUgYnJlYWtcbiAgQlI6IHtcbiAgICBvcGVuOiBfID0+ICc8YnIvPicsXG4gICAgY2xvc2U6IF8gPT4gJydcbiAgfSxcbiAgLy8gSGlkZGVuIGVsZW1lbnRcbiAgSEQ6IHtcbiAgICBvcGVuOiBfID0+ICcnLFxuICAgIGNsb3NlOiBfID0+ICcnXG4gIH0sXG4gIC8vIEhpZ2hsaWdodGVkIGVsZW1lbnQuXG4gIEhMOiB7XG4gICAgb3BlbjogXyA9PiAnPHNwYW4gc3R5bGU9XCJjb2xvcjp0ZWFsXCI+JyxcbiAgICBjbG9zZTogXyA9PiAnPC9zcGFuPidcbiAgfSxcbiAgLy8gTGluayAoVVJMKVxuICBMTjoge1xuICAgIG9wZW46IChkYXRhKSA9PiB7XG4gICAgICByZXR1cm4gJzxhIGhyZWY9XCInICsgZGF0YS51cmwgKyAnXCI+JztcbiAgICB9LFxuICAgIGNsb3NlOiBfID0+ICc8L2E+JyxcbiAgICBwcm9wczogKGRhdGEpID0+IHtcbiAgICAgIHJldHVybiBkYXRhID8ge1xuICAgICAgICBocmVmOiBkYXRhLnVybCxcbiAgICAgICAgdGFyZ2V0OiAnX2JsYW5rJ1xuICAgICAgfSA6IG51bGw7XG4gICAgfSxcbiAgfSxcbiAgLy8gTWVudGlvblxuICBNTjoge1xuICAgIG9wZW46IChkYXRhKSA9PiB7XG4gICAgICByZXR1cm4gJzxhIGhyZWY9XCIjJyArIGRhdGEudmFsICsgJ1wiPic7XG4gICAgfSxcbiAgICBjbG9zZTogXyA9PiAnPC9hPicsXG4gICAgcHJvcHM6IChkYXRhKSA9PiB7XG4gICAgICByZXR1cm4gZGF0YSA/IHtcbiAgICAgICAgaWQ6IGRhdGEudmFsXG4gICAgICB9IDogbnVsbDtcbiAgICB9LFxuICB9LFxuICAvLyBIYXNodGFnXG4gIEhUOiB7XG4gICAgb3BlbjogKGRhdGEpID0+IHtcbiAgICAgIHJldHVybiAnPGEgaHJlZj1cIiMnICsgZGF0YS52YWwgKyAnXCI+JztcbiAgICB9LFxuICAgIGNsb3NlOiBfID0+ICc8L2E+JyxcbiAgICBwcm9wczogKGRhdGEpID0+IHtcbiAgICAgIHJldHVybiBkYXRhID8ge1xuICAgICAgICBpZDogZGF0YS52YWxcbiAgICAgIH0gOiBudWxsO1xuICAgIH0sXG4gIH0sXG4gIC8vIEJ1dHRvblxuICBCTjoge1xuICAgIG9wZW46IF8gPT4gJzxidXR0b24+JyxcbiAgICBjbG9zZTogXyA9PiAnPC9idXR0b24+JyxcbiAgICBwcm9wczogKGRhdGEpID0+IHtcbiAgICAgIHJldHVybiBkYXRhID8ge1xuICAgICAgICAnZGF0YS1hY3QnOiBkYXRhLmFjdCxcbiAgICAgICAgJ2RhdGEtdmFsJzogZGF0YS52YWwsXG4gICAgICAgICdkYXRhLW5hbWUnOiBkYXRhLm5hbWUsXG4gICAgICAgICdkYXRhLXJlZic6IGRhdGEucmVmXG4gICAgICB9IDogbnVsbDtcbiAgICB9LFxuICB9LFxuICAvLyBBdWRpbyByZWNvcmRpbmdcbiAgQVU6IHtcbiAgICBvcGVuOiAoZGF0YSkgPT4ge1xuICAgICAgY29uc3QgdXJsID0gZGF0YS5yZWYgfHwgYmFzZTY0dG9PYmplY3RVcmwoZGF0YS52YWwsIGRhdGEubWltZSwgRHJhZnR5LmxvZ2dlcik7XG4gICAgICByZXR1cm4gJzxhdWRpbyBjb250cm9scyBzcmM9XCInICsgdXJsICsgJ1wiPic7XG4gICAgfSxcbiAgICBjbG9zZTogXyA9PiAnPC9hdWRpbz4nLFxuICAgIHByb3BzOiAoZGF0YSkgPT4ge1xuICAgICAgaWYgKCFkYXRhKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC8vIEVtYmVkZGVkIGRhdGEgb3IgZXh0ZXJuYWwgbGluay5cbiAgICAgICAgc3JjOiBkYXRhLnJlZiB8fCBiYXNlNjR0b09iamVjdFVybChkYXRhLnZhbCwgZGF0YS5taW1lLCBEcmFmdHkubG9nZ2VyKSxcbiAgICAgICAgJ2RhdGEtcHJlbG9hZCc6IGRhdGEucmVmID8gJ21ldGFkYXRhJyA6ICdhdXRvJyxcbiAgICAgICAgJ2RhdGEtZHVyYXRpb24nOiBkYXRhLmR1cmF0aW9uLFxuICAgICAgICAnZGF0YS1uYW1lJzogZGF0YS5uYW1lLFxuICAgICAgICAnZGF0YS1zaXplJzogZGF0YS52YWwgPyAoKGRhdGEudmFsLmxlbmd0aCAqIDAuNzUpIHwgMCkgOiAoZGF0YS5zaXplIHwgMCksXG4gICAgICAgICdkYXRhLW1pbWUnOiBkYXRhLm1pbWUsXG4gICAgICB9O1xuICAgIH1cbiAgfSxcbiAgLy8gSW1hZ2VcbiAgSU06IHtcbiAgICBvcGVuOiAoZGF0YSkgPT4ge1xuICAgICAgLy8gRG9uJ3QgdXNlIGRhdGEucmVmIGZvciBwcmV2aWV3OiBpdCdzIGEgc2VjdXJpdHkgcmlzay5cbiAgICAgIGNvbnN0IHRtcFByZXZpZXdVcmwgPSBiYXNlNjR0b0RhdGFVcmwoZGF0YS5fdGVtcFByZXZpZXcsIGRhdGEubWltZSk7XG4gICAgICBjb25zdCBwcmV2aWV3VXJsID0gYmFzZTY0dG9PYmplY3RVcmwoZGF0YS52YWwsIGRhdGEubWltZSwgRHJhZnR5LmxvZ2dlcik7XG4gICAgICBjb25zdCBkb3dubG9hZFVybCA9IGRhdGEucmVmIHx8IHByZXZpZXdVcmw7XG4gICAgICByZXR1cm4gKGRhdGEubmFtZSA/ICc8YSBocmVmPVwiJyArIGRvd25sb2FkVXJsICsgJ1wiIGRvd25sb2FkPVwiJyArIGRhdGEubmFtZSArICdcIj4nIDogJycpICtcbiAgICAgICAgJzxpbWcgc3JjPVwiJyArICh0bXBQcmV2aWV3VXJsIHx8IHByZXZpZXdVcmwpICsgJ1wiJyArXG4gICAgICAgIChkYXRhLndpZHRoID8gJyB3aWR0aD1cIicgKyBkYXRhLndpZHRoICsgJ1wiJyA6ICcnKSArXG4gICAgICAgIChkYXRhLmhlaWdodCA/ICcgaGVpZ2h0PVwiJyArIGRhdGEuaGVpZ2h0ICsgJ1wiJyA6ICcnKSArICcgYm9yZGVyPVwiMFwiIC8+JztcbiAgICB9LFxuICAgIGNsb3NlOiAoZGF0YSkgPT4ge1xuICAgICAgcmV0dXJuIChkYXRhLm5hbWUgPyAnPC9hPicgOiAnJyk7XG4gICAgfSxcbiAgICBwcm9wczogKGRhdGEpID0+IHtcbiAgICAgIGlmICghZGF0YSkgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAvLyBUZW1wb3JhcnkgcHJldmlldywgb3IgcGVybWFuZW50IHByZXZpZXcsIG9yIGV4dGVybmFsIGxpbmsuXG4gICAgICAgIHNyYzogYmFzZTY0dG9EYXRhVXJsKGRhdGEuX3RlbXBQcmV2aWV3LCBkYXRhLm1pbWUpIHx8XG4gICAgICAgICAgZGF0YS5yZWYgfHwgYmFzZTY0dG9PYmplY3RVcmwoZGF0YS52YWwsIGRhdGEubWltZSwgRHJhZnR5LmxvZ2dlciksXG4gICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXG4gICAgICAgIGFsdDogZGF0YS5uYW1lLFxuICAgICAgICAnZGF0YS13aWR0aCc6IGRhdGEud2lkdGgsXG4gICAgICAgICdkYXRhLWhlaWdodCc6IGRhdGEuaGVpZ2h0LFxuICAgICAgICAnZGF0YS1uYW1lJzogZGF0YS5uYW1lLFxuICAgICAgICAnZGF0YS1zaXplJzogZGF0YS52YWwgPyAoKGRhdGEudmFsLmxlbmd0aCAqIDAuNzUpIHwgMCkgOiAoZGF0YS5zaXplIHwgMCksXG4gICAgICAgICdkYXRhLW1pbWUnOiBkYXRhLm1pbWUsXG4gICAgICB9O1xuICAgIH0sXG4gIH0sXG4gIC8vIEZvcm0gLSBzdHJ1Y3R1cmVkIGxheW91dCBvZiBlbGVtZW50cy5cbiAgRk06IHtcbiAgICBvcGVuOiBfID0+ICc8ZGl2PicsXG4gICAgY2xvc2U6IF8gPT4gJzwvZGl2PidcbiAgfSxcbiAgLy8gUm93OiBsb2dpYyBncm91cGluZyBvZiBlbGVtZW50c1xuICBSVzoge1xuICAgIG9wZW46IF8gPT4gJzxkaXY+JyxcbiAgICBjbG9zZTogXyA9PiAnPC9kaXY+J1xuICB9LFxuICAvLyBRdW90ZWQgYmxvY2suXG4gIFFROiB7XG4gICAgb3BlbjogXyA9PiAnPGRpdj4nLFxuICAgIGNsb3NlOiBfID0+ICc8L2Rpdj4nLFxuICAgIHByb3BzOiAoZGF0YSkgPT4ge1xuICAgICAgcmV0dXJuIGRhdGEgPyB7fSA6IG51bGw7XG4gICAgfSxcbiAgfVxufTtcblxuLyoqXG4gKiBUaGUgbWFpbiBvYmplY3Qgd2hpY2ggcGVyZm9ybXMgYWxsIHRoZSBmb3JtYXR0aW5nIGFjdGlvbnMuXG4gKiBAY2xhc3MgRHJhZnR5XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuY29uc3QgRHJhZnR5ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMudHh0ID0gJyc7XG4gIHRoaXMuZm10ID0gW107XG4gIHRoaXMuZW50ID0gW107XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBEcmFmdHkgZG9jdW1lbnQgdG8gYSBwbGFpbiB0ZXh0IHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGxhaW5UZXh0IC0gc3RyaW5nIHRvIHVzZSBhcyBEcmFmdHkgY29udGVudC5cbiAqXG4gKiBAcmV0dXJucyBuZXcgRHJhZnR5IGRvY3VtZW50IG9yIG51bGwgaXMgcGxhaW5UZXh0IGlzIG5vdCBhIHN0cmluZyBvciB1bmRlZmluZWQuXG4gKi9cbkRyYWZ0eS5pbml0ID0gZnVuY3Rpb24ocGxhaW5UZXh0KSB7XG4gIGlmICh0eXBlb2YgcGxhaW5UZXh0ID09ICd1bmRlZmluZWQnKSB7XG4gICAgcGxhaW5UZXh0ID0gJyc7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHBsYWluVGV4dCAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB0eHQ6IHBsYWluVGV4dFxuICB9O1xufVxuXG4vKipcbiAqIFBhcnNlIHBsYWluIHRleHQgaW50byBEcmFmdHkgZG9jdW1lbnQuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlbnQgLSBwbGFpbi10ZXh0IGNvbnRlbnQgdG8gcGFyc2UuXG4gKiBAcmV0dXJuIHtEcmFmdHl9IHBhcnNlZCBkb2N1bWVudCBvciBudWxsIGlmIHRoZSBzb3VyY2UgaXMgbm90IHBsYWluIHRleHQuXG4gKi9cbkRyYWZ0eS5wYXJzZSA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgLy8gTWFrZSBzdXJlIHdlIGFyZSBwYXJzaW5nIHN0cmluZ3Mgb25seS5cbiAgaWYgKHR5cGVvZiBjb250ZW50ICE9ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBTcGxpdCB0ZXh0IGludG8gbGluZXMuIEl0IG1ha2VzIGZ1cnRoZXIgcHJvY2Vzc2luZyBlYXNpZXIuXG4gIGNvbnN0IGxpbmVzID0gY29udGVudC5zcGxpdCgvXFxyP1xcbi8pO1xuXG4gIC8vIEhvbGRzIGVudGl0aWVzIHJlZmVyZW5jZWQgZnJvbSB0ZXh0XG4gIGNvbnN0IGVudGl0eU1hcCA9IFtdO1xuICBjb25zdCBlbnRpdHlJbmRleCA9IHt9O1xuXG4gIC8vIFByb2Nlc3NpbmcgbGluZXMgb25lIGJ5IG9uZSwgaG9sZCBpbnRlcm1lZGlhdGUgcmVzdWx0IGluIGJseC5cbiAgY29uc3QgYmx4ID0gW107XG4gIGxpbmVzLmZvckVhY2goKGxpbmUpID0+IHtcbiAgICBsZXQgc3BhbnMgPSBbXTtcbiAgICBsZXQgZW50aXRpZXM7XG5cbiAgICAvLyBGaW5kIGZvcm1hdHRlZCBzcGFucyBpbiB0aGUgc3RyaW5nLlxuICAgIC8vIFRyeSB0byBtYXRjaCBlYWNoIHN0eWxlLlxuICAgIElOTElORV9TVFlMRVMuZm9yRWFjaCgodGFnKSA9PiB7XG4gICAgICAvLyBFYWNoIHN0eWxlIGNvdWxkIGJlIG1hdGNoZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICBzcGFucyA9IHNwYW5zLmNvbmNhdChzcGFubmlmeShsaW5lLCB0YWcuc3RhcnQsIHRhZy5lbmQsIHRhZy5uYW1lKSk7XG4gICAgfSk7XG5cbiAgICBsZXQgYmxvY2s7XG4gICAgaWYgKHNwYW5zLmxlbmd0aCA9PSAwKSB7XG4gICAgICBibG9jayA9IHtcbiAgICAgICAgdHh0OiBsaW5lXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTb3J0IHNwYW5zIGJ5IHN0eWxlIG9jY3VyZW5jZSBlYXJseSAtPiBsYXRlLCB0aGVuIGJ5IGxlbmd0aDogZmlyc3QgbG9uZyB0aGVuIHNob3J0LlxuICAgICAgc3BhbnMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICBjb25zdCBkaWZmID0gYS5hdCAtIGIuYXQ7XG4gICAgICAgIHJldHVybiBkaWZmICE9IDAgPyBkaWZmIDogYi5lbmQgLSBhLmVuZDtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBDb252ZXJ0IGFuIGFycmF5IG9mIHBvc3NpYmx5IG92ZXJsYXBwaW5nIHNwYW5zIGludG8gYSB0cmVlLlxuICAgICAgc3BhbnMgPSB0b1NwYW5UcmVlKHNwYW5zKTtcblxuICAgICAgLy8gQnVpbGQgYSB0cmVlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlbnRpcmUgc3RyaW5nLCBub3RcbiAgICAgIC8vIGp1c3QgdGhlIGZvcm1hdHRlZCBwYXJ0cy5cbiAgICAgIGNvbnN0IGNodW5rcyA9IGNodW5raWZ5KGxpbmUsIDAsIGxpbmUubGVuZ3RoLCBzcGFucyk7XG5cbiAgICAgIGNvbnN0IGRyYWZ0eSA9IGRyYWZ0aWZ5KGNodW5rcywgMCk7XG5cbiAgICAgIGJsb2NrID0ge1xuICAgICAgICB0eHQ6IGRyYWZ0eS50eHQsXG4gICAgICAgIGZtdDogZHJhZnR5LmZtdFxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBFeHRyYWN0IGVudGl0aWVzIGZyb20gdGhlIGNsZWFuZWQgdXAgc3RyaW5nLlxuICAgIGVudGl0aWVzID0gZXh0cmFjdEVudGl0aWVzKGJsb2NrLnR4dCk7XG4gICAgaWYgKGVudGl0aWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHJhbmdlcyA9IFtdO1xuICAgICAgZm9yIChsZXQgaSBpbiBlbnRpdGllcykge1xuICAgICAgICAvLyB7b2Zmc2V0OiBtYXRjaFsnaW5kZXgnXSwgdW5pcXVlOiBtYXRjaFswXSwgbGVuOiBtYXRjaFswXS5sZW5ndGgsIGRhdGE6IGVudC5wYWNrZXIoKSwgdHlwZTogZW50Lm5hbWV9XG4gICAgICAgIGNvbnN0IGVudGl0eSA9IGVudGl0aWVzW2ldO1xuICAgICAgICBsZXQgaW5kZXggPSBlbnRpdHlJbmRleFtlbnRpdHkudW5pcXVlXTtcbiAgICAgICAgaWYgKCFpbmRleCkge1xuICAgICAgICAgIGluZGV4ID0gZW50aXR5TWFwLmxlbmd0aDtcbiAgICAgICAgICBlbnRpdHlJbmRleFtlbnRpdHkudW5pcXVlXSA9IGluZGV4O1xuICAgICAgICAgIGVudGl0eU1hcC5wdXNoKHtcbiAgICAgICAgICAgIHRwOiBlbnRpdHkudHlwZSxcbiAgICAgICAgICAgIGRhdGE6IGVudGl0eS5kYXRhXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmFuZ2VzLnB1c2goe1xuICAgICAgICAgIGF0OiBlbnRpdHkub2Zmc2V0LFxuICAgICAgICAgIGxlbjogZW50aXR5LmxlbixcbiAgICAgICAgICBrZXk6IGluZGV4XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgYmxvY2suZW50ID0gcmFuZ2VzO1xuICAgIH1cblxuICAgIGJseC5wdXNoKGJsb2NrKTtcbiAgfSk7XG5cbiAgY29uc3QgcmVzdWx0ID0ge1xuICAgIHR4dDogJydcbiAgfTtcblxuICAvLyBNZXJnZSBsaW5lcyBhbmQgc2F2ZSBsaW5lIGJyZWFrcyBhcyBCUiBpbmxpbmUgZm9ybWF0dGluZy5cbiAgaWYgKGJseC5sZW5ndGggPiAwKSB7XG4gICAgcmVzdWx0LnR4dCA9IGJseFswXS50eHQ7XG4gICAgcmVzdWx0LmZtdCA9IChibHhbMF0uZm10IHx8IFtdKS5jb25jYXQoYmx4WzBdLmVudCB8fCBbXSk7XG5cbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IGJseC5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgYmxvY2sgPSBibHhbaV07XG4gICAgICBjb25zdCBvZmZzZXQgPSByZXN1bHQudHh0Lmxlbmd0aCArIDE7XG5cbiAgICAgIHJlc3VsdC5mbXQucHVzaCh7XG4gICAgICAgIHRwOiAnQlInLFxuICAgICAgICBsZW46IDEsXG4gICAgICAgIGF0OiBvZmZzZXQgLSAxXG4gICAgICB9KTtcblxuICAgICAgcmVzdWx0LnR4dCArPSAnICcgKyBibG9jay50eHQ7XG4gICAgICBpZiAoYmxvY2suZm10KSB7XG4gICAgICAgIHJlc3VsdC5mbXQgPSByZXN1bHQuZm10LmNvbmNhdChibG9jay5mbXQubWFwKChzKSA9PiB7XG4gICAgICAgICAgcy5hdCArPSBvZmZzZXQ7XG4gICAgICAgICAgcmV0dXJuIHM7XG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICAgIGlmIChibG9jay5lbnQpIHtcbiAgICAgICAgcmVzdWx0LmZtdCA9IHJlc3VsdC5mbXQuY29uY2F0KGJsb2NrLmVudC5tYXAoKHMpID0+IHtcbiAgICAgICAgICBzLmF0ICs9IG9mZnNldDtcbiAgICAgICAgICByZXR1cm4gcztcbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZXN1bHQuZm10Lmxlbmd0aCA9PSAwKSB7XG4gICAgICBkZWxldGUgcmVzdWx0LmZtdDtcbiAgICB9XG5cbiAgICBpZiAoZW50aXR5TWFwLmxlbmd0aCA+IDApIHtcbiAgICAgIHJlc3VsdC5lbnQgPSBlbnRpdHlNYXA7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQXBwZW5kIG9uZSBEcmFmdHkgZG9jdW1lbnQgdG8gYW5vdGhlci5cbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eX0gZmlyc3QgLSBEcmFmdHkgZG9jdW1lbnQgdG8gYXBwZW5kIHRvLlxuICogQHBhcmFtIHtEcmFmdHl8c3RyaW5nfSBzZWNvbmQgLSBEcmFmdHkgZG9jdW1lbnQgb3Igc3RyaW5nIGJlaW5nIGFwcGVuZGVkLlxuICpcbiAqIEByZXR1cm4ge0RyYWZ0eX0gZmlyc3QgZG9jdW1lbnQgd2l0aCB0aGUgc2Vjb25kIGFwcGVuZGVkIHRvIGl0LlxuICovXG5EcmFmdHkuYXBwZW5kID0gZnVuY3Rpb24oZmlyc3QsIHNlY29uZCkge1xuICBpZiAoIWZpcnN0KSB7XG4gICAgcmV0dXJuIHNlY29uZDtcbiAgfVxuICBpZiAoIXNlY29uZCkge1xuICAgIHJldHVybiBmaXJzdDtcbiAgfVxuXG4gIGZpcnN0LnR4dCA9IGZpcnN0LnR4dCB8fCAnJztcbiAgY29uc3QgbGVuID0gZmlyc3QudHh0Lmxlbmd0aDtcblxuICBpZiAodHlwZW9mIHNlY29uZCA9PSAnc3RyaW5nJykge1xuICAgIGZpcnN0LnR4dCArPSBzZWNvbmQ7XG4gIH0gZWxzZSBpZiAoc2Vjb25kLnR4dCkge1xuICAgIGZpcnN0LnR4dCArPSBzZWNvbmQudHh0O1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkoc2Vjb25kLmZtdCkpIHtcbiAgICBmaXJzdC5mbXQgPSBmaXJzdC5mbXQgfHwgW107XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc2Vjb25kLmVudCkpIHtcbiAgICAgIGZpcnN0LmVudCA9IGZpcnN0LmVudCB8fCBbXTtcbiAgICB9XG4gICAgc2Vjb25kLmZtdC5mb3JFYWNoKHNyYyA9PiB7XG4gICAgICBjb25zdCBmbXQgPSB7XG4gICAgICAgIGF0OiAoc3JjLmF0IHwgMCkgKyBsZW4sXG4gICAgICAgIGxlbjogc3JjLmxlbiB8IDBcbiAgICAgIH07XG4gICAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIHRoZSBvdXRzaWRlIG9mIHRoZSBub3JtYWwgcmVuZGVyaW5nIGZsb3cgc3R5bGVzLlxuICAgICAgaWYgKHNyYy5hdCA9PSAtMSkge1xuICAgICAgICBmbXQuYXQgPSAtMTtcbiAgICAgICAgZm10LmxlbiA9IDA7XG4gICAgICB9XG4gICAgICBpZiAoc3JjLnRwKSB7XG4gICAgICAgIGZtdC50cCA9IHNyYy50cDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZtdC5rZXkgPSBmaXJzdC5lbnQubGVuZ3RoO1xuICAgICAgICBmaXJzdC5lbnQucHVzaChzZWNvbmQuZW50W3NyYy5rZXkgfHwgMF0pO1xuICAgICAgfVxuICAgICAgZmlyc3QuZm10LnB1c2goZm10KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBmaXJzdDtcbn1cblxuLyoqXG4gKiBAdHlwZWRlZiBEcmFmdHkuSW1hZ2VEZXNjXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAdHlwZSBPYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBtaW1lIC0gbWltZS10eXBlIG9mIHRoZSBpbWFnZSwgZS5nLiBcImltYWdlL3BuZ1wiXG4gKiBAcGFyYW0ge3N0cmluZ30gcHJldmlldyAtIGJhc2U2NC1lbmNvZGVkIGltYWdlIGNvbnRlbnQgKG9yIHByZXZpZXcsIGlmIGxhcmdlIGltYWdlIGlzIGF0dGFjaGVkKS4gQ291bGQgYmUgbnVsbC91bmRlZmluZWQuXG4gKiBAcGFyYW0ge2ludGVnZXJ9IHdpZHRoIC0gd2lkdGggb2YgdGhlIGltYWdlXG4gKiBAcGFyYW0ge2ludGVnZXJ9IGhlaWdodCAtIGhlaWdodCBvZiB0aGUgaW1hZ2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZSAtIGZpbGUgbmFtZSBzdWdnZXN0aW9uIGZvciBkb3dubG9hZGluZyB0aGUgaW1hZ2UuXG4gKiBAcGFyYW0ge2ludGVnZXJ9IHNpemUgLSBzaXplIG9mIHRoZSBpbWFnZSBpbiBieXRlcy4gVHJlYXQgaXMgYXMgYW4gdW50cnVzdGVkIGhpbnQuXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVmdXJsIC0gcmVmZXJlbmNlIHRvIHRoZSBjb250ZW50LiBDb3VsZCBiZSBudWxsL3VuZGVmaW5lZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBfdGVtcFByZXZpZXcgLSBiYXNlNjQtZW5jb2RlZCBpbWFnZSBwcmV2aWV3IHVzZWQgZHVyaW5nIHVwbG9hZCBwcm9jZXNzOyBub3Qgc2VyaWFsaXphYmxlLlxuICogQHBhcmFtIHtQcm9taXNlfSB1cmxQcm9taXNlIC0gUHJvbWlzZSB3aGljaCByZXR1cm5zIGNvbnRlbnQgVVJMIHdoZW4gcmVzb2x2ZWQuXG4gKi9cblxuLyoqXG4gKiBJbnNlcnQgaW5saW5lIGltYWdlIGludG8gRHJhZnR5IGRvY3VtZW50LlxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7RHJhZnR5fSBjb250ZW50IC0gZG9jdW1lbnQgdG8gYWRkIGltYWdlIHRvLlxuICogQHBhcmFtIHtpbnRlZ2VyfSBhdCAtIGluZGV4IHdoZXJlIHRoZSBvYmplY3QgaXMgaW5zZXJ0ZWQuIFRoZSBsZW5ndGggb2YgdGhlIGltYWdlIGlzIGFsd2F5cyAxLlxuICogQHBhcmFtIHtJbWFnZURlc2N9IGltYWdlRGVzYyAtIG9iamVjdCB3aXRoIGltYWdlIHBhcmFtZW5ldHMgYW5kIGRhdGEuXG4gKlxuICogQHJldHVybiB7RHJhZnR5fSB1cGRhdGVkIGRvY3VtZW50LlxuICovXG5EcmFmdHkuaW5zZXJ0SW1hZ2UgPSBmdW5jdGlvbihjb250ZW50LCBhdCwgaW1hZ2VEZXNjKSB7XG4gIGNvbnRlbnQgPSBjb250ZW50IHx8IHtcbiAgICB0eHQ6ICcgJ1xuICB9O1xuICBjb250ZW50LmVudCA9IGNvbnRlbnQuZW50IHx8IFtdO1xuICBjb250ZW50LmZtdCA9IGNvbnRlbnQuZm10IHx8IFtdO1xuXG4gIGNvbnRlbnQuZm10LnB1c2goe1xuICAgIGF0OiBhdCB8IDAsXG4gICAgbGVuOiAxLFxuICAgIGtleTogY29udGVudC5lbnQubGVuZ3RoXG4gIH0pO1xuXG4gIGNvbnN0IGV4ID0ge1xuICAgIHRwOiAnSU0nLFxuICAgIGRhdGE6IHtcbiAgICAgIG1pbWU6IGltYWdlRGVzYy5taW1lLFxuICAgICAgdmFsOiBpbWFnZURlc2MucHJldmlldyxcbiAgICAgIHdpZHRoOiBpbWFnZURlc2Mud2lkdGgsXG4gICAgICBoZWlnaHQ6IGltYWdlRGVzYy5oZWlnaHQsXG4gICAgICBuYW1lOiBpbWFnZURlc2MuZmlsZW5hbWUsXG4gICAgICBzaXplOiBpbWFnZURlc2Muc2l6ZSB8IDAsXG4gICAgICByZWY6IGltYWdlRGVzYy5yZWZ1cmxcbiAgICB9XG4gIH07XG5cbiAgaWYgKGltYWdlRGVzYy51cmxQcm9taXNlKSB7XG4gICAgZXguZGF0YS5fdGVtcFByZXZpZXcgPSBpbWFnZURlc2MuX3RlbXBQcmV2aWV3O1xuICAgIGV4LmRhdGEuX3Byb2Nlc3NpbmcgPSB0cnVlO1xuICAgIGltYWdlRGVzYy51cmxQcm9taXNlLnRoZW4oXG4gICAgICB1cmwgPT4ge1xuICAgICAgICBleC5kYXRhLnJlZiA9IHVybDtcbiAgICAgICAgZXguZGF0YS5fdGVtcFByZXZpZXcgPSB1bmRlZmluZWQ7XG4gICAgICAgIGV4LmRhdGEuX3Byb2Nlc3NpbmcgPSB1bmRlZmluZWQ7XG4gICAgICB9LFxuICAgICAgXyA9PiB7XG4gICAgICAgIC8vIENhdGNoIHRoZSBlcnJvciwgb3RoZXJ3aXNlIGl0IHdpbGwgYXBwZWFyIGluIHRoZSBjb25zb2xlLlxuICAgICAgICBleC5kYXRhLl9wcm9jZXNzaW5nID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBjb250ZW50LmVudC5wdXNoKGV4KTtcblxuICByZXR1cm4gY29udGVudDtcbn1cblxuLyoqXG4gKiBAdHlwZWRlZiBEcmFmdHkuQXVkaW9EZXNjXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAdHlwZSBPYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBtaW1lIC0gbWltZS10eXBlIG9mIHRoZSBhdWRpbywgZS5nLiBcImF1ZGlvL29nZ1wiLlxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgLSBiYXNlNjQtZW5jb2RlZCBhdWRpbyBjb250ZW50LiBDb3VsZCBiZSBudWxsL3VuZGVmaW5lZC5cbiAqIEBwYXJhbSB7aW50ZWdlcn0gZHVyYXRpb24gLSBkdXJhdGlvbiBvZiB0aGUgcmVjb3JkIGluIG1pbGxpc2Vjb25kcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwcmV2aWV3IC0gYmFzZTY0IGVuY29kZWQgc2hvcnQgYXJyYXkgb2YgYW1wbGl0dWRlIHZhbHVlcyAwLi4xMDAuXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZW5hbWUgLSBmaWxlIG5hbWUgc3VnZ2VzdGlvbiBmb3IgZG93bmxvYWRpbmcgdGhlIGF1ZGlvLlxuICogQHBhcmFtIHtpbnRlZ2VyfSBzaXplIC0gc2l6ZSBvZiB0aGUgcmVjb3JkaW5nIGluIGJ5dGVzLiBUcmVhdCBpcyBhcyBhbiB1bnRydXN0ZWQgaGludC5cbiAqIEBwYXJhbSB7c3RyaW5nfSByZWZ1cmwgLSByZWZlcmVuY2UgdG8gdGhlIGNvbnRlbnQuIENvdWxkIGJlIG51bGwvdW5kZWZpbmVkLlxuICogQHBhcmFtIHtQcm9taXNlfSB1cmxQcm9taXNlIC0gUHJvbWlzZSB3aGljaCByZXR1cm5zIGNvbnRlbnQgVVJMIHdoZW4gcmVzb2x2ZWQuXG4gKi9cblxuLyoqXG4gKiBJbnNlcnQgYXVkaW8gcmVjb3JkaW5nIGludG8gRHJhZnR5IGRvY3VtZW50LlxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7RHJhZnR5fSBjb250ZW50IC0gZG9jdW1lbnQgdG8gYWRkIGF1ZGlvIHJlY29yZCB0by5cbiAqIEBwYXJhbSB7aW50ZWdlcn0gYXQgLSBpbmRleCB3aGVyZSB0aGUgb2JqZWN0IGlzIGluc2VydGVkLiBUaGUgbGVuZ3RoIG9mIHRoZSByZWNvcmQgaXMgYWx3YXlzIDEuXG4gKiBAcGFyYW0ge0F1ZGlvRGVzY30gYXVkaW9EZXNjIC0gb2JqZWN0IHdpdGggdGhlIGF1ZGlvIHBhcmFtZW5ldHMgYW5kIGRhdGEuXG4gKlxuICogQHJldHVybiB7RHJhZnR5fSB1cGRhdGVkIGRvY3VtZW50LlxuICovXG5EcmFmdHkuaW5zZXJ0QXVkaW8gPSBmdW5jdGlvbihjb250ZW50LCBhdCwgYXVkaW9EZXNjKSB7XG4gIGNvbnRlbnQgPSBjb250ZW50IHx8IHtcbiAgICB0eHQ6ICcgJ1xuICB9O1xuICBjb250ZW50LmVudCA9IGNvbnRlbnQuZW50IHx8IFtdO1xuICBjb250ZW50LmZtdCA9IGNvbnRlbnQuZm10IHx8IFtdO1xuXG4gIGNvbnRlbnQuZm10LnB1c2goe1xuICAgIGF0OiBhdCB8IDAsXG4gICAgbGVuOiAxLFxuICAgIGtleTogY29udGVudC5lbnQubGVuZ3RoXG4gIH0pO1xuXG4gIGNvbnN0IGV4ID0ge1xuICAgIHRwOiAnQVUnLFxuICAgIGRhdGE6IHtcbiAgICAgIG1pbWU6IGF1ZGlvRGVzYy5taW1lLFxuICAgICAgdmFsOiBhdWRpb0Rlc2MuZGF0YSxcbiAgICAgIGR1cmF0aW9uOiBhdWRpb0Rlc2MuZHVyYXRpb24gfCAwLFxuICAgICAgcHJldmlldzogYXVkaW9EZXNjLnByZXZpZXcsXG4gICAgICBuYW1lOiBhdWRpb0Rlc2MuZmlsZW5hbWUsXG4gICAgICBzaXplOiBhdWRpb0Rlc2Muc2l6ZSB8IDAsXG4gICAgICByZWY6IGF1ZGlvRGVzYy5yZWZ1cmxcbiAgICB9XG4gIH07XG5cbiAgaWYgKGF1ZGlvRGVzYy51cmxQcm9taXNlKSB7XG4gICAgZXguZGF0YS5fcHJvY2Vzc2luZyA9IHRydWU7XG4gICAgYXVkaW9EZXNjLnVybFByb21pc2UudGhlbihcbiAgICAgIHVybCA9PiB7XG4gICAgICAgIGV4LmRhdGEucmVmID0gdXJsO1xuICAgICAgICBleC5kYXRhLl9wcm9jZXNzaW5nID0gdW5kZWZpbmVkO1xuICAgICAgfSxcbiAgICAgIF8gPT4ge1xuICAgICAgICAvLyBDYXRjaCB0aGUgZXJyb3IsIG90aGVyd2lzZSBpdCB3aWxsIGFwcGVhciBpbiB0aGUgY29uc29sZS5cbiAgICAgICAgZXguZGF0YS5fcHJvY2Vzc2luZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgY29udGVudC5lbnQucHVzaChleCk7XG5cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgcXVvdGUgdG8gRHJhZnR5IGRvY3VtZW50LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXIgLSBRdW90ZSBoZWFkZXIgKHRpdGxlLCBldGMuKS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB1aWQgLSBVSUQgb2YgdGhlIGF1dGhvciB0byBtZW50aW9uLlxuICogQHBhcmFtIHtEcmFmdHl9IGJvZHkgLSBCb2R5IG9mIHRoZSBxdW90ZWQgbWVzc2FnZS5cbiAqXG4gKiBAcmV0dXJucyBSZXBseSBxdW90ZSBEcmFmdHkgZG9jIHdpdGggdGhlIHF1b3RlIGZvcm1hdHRpbmcuXG4gKi9cbkRyYWZ0eS5xdW90ZSA9IGZ1bmN0aW9uKGhlYWRlciwgdWlkLCBib2R5KSB7XG4gIGNvbnN0IHF1b3RlID0gRHJhZnR5LmFwcGVuZChEcmFmdHkuYXBwZW5kTGluZUJyZWFrKERyYWZ0eS5tZW50aW9uKGhlYWRlciwgdWlkKSksIGJvZHkpO1xuXG4gIC8vIFdyYXAgaW50byBhIHF1b3RlLlxuICBxdW90ZS5mbXQucHVzaCh7XG4gICAgYXQ6IDAsXG4gICAgbGVuOiBxdW90ZS50eHQubGVuZ3RoLFxuICAgIHRwOiAnUVEnXG4gIH0pO1xuXG4gIHJldHVybiBxdW90ZTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBEcmFmdHkgZG9jdW1lbnQgd2l0aCBhIG1lbnRpb24uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBtZW50aW9uZWQgbmFtZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB1aWQgLSBtZW50aW9uZWQgdXNlciBJRC5cbiAqXG4gKiBAcmV0dXJucyB7RHJhZnR5fSBkb2N1bWVudCB3aXRoIHRoZSBtZW50aW9uLlxuICovXG5EcmFmdHkubWVudGlvbiA9IGZ1bmN0aW9uKG5hbWUsIHVpZCkge1xuICByZXR1cm4ge1xuICAgIHR4dDogbmFtZSB8fCAnJyxcbiAgICBmbXQ6IFt7XG4gICAgICBhdDogMCxcbiAgICAgIGxlbjogKG5hbWUgfHwgJycpLmxlbmd0aCxcbiAgICAgIGtleTogMFxuICAgIH1dLFxuICAgIGVudDogW3tcbiAgICAgIHRwOiAnTU4nLFxuICAgICAgZGF0YToge1xuICAgICAgICB2YWw6IHVpZFxuICAgICAgfVxuICAgIH1dXG4gIH07XG59XG5cbi8qKlxuICogQXBwZW5kIGEgbGluayB0byBhIERyYWZ0eSBkb2N1bWVudC5cbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eX0gY29udGVudCAtIERyYWZ0eSBkb2N1bWVudCB0byBhcHBlbmQgbGluayB0by5cbiAqIEBwYXJhbSB7T2JqZWN0fSBsaW5rRGF0YSAtIExpbmsgaW5mbyBpbiBmb3JtYXQgPGNvZGU+e3R4dDogJ2Fua29yIHRleHQnLCB1cmw6ICdodHRwOi8vLi4uJ308L2NvZGU+LlxuICpcbiAqIEByZXR1cm5zIHtEcmFmdHl9IHRoZSBzYW1lIGRvY3VtZW50IGFzIDxjb2RlPmNvbnRlbnQ8L2NvZGU+LlxuICovXG5EcmFmdHkuYXBwZW5kTGluayA9IGZ1bmN0aW9uKGNvbnRlbnQsIGxpbmtEYXRhKSB7XG4gIGNvbnRlbnQgPSBjb250ZW50IHx8IHtcbiAgICB0eHQ6ICcnXG4gIH07XG5cbiAgY29udGVudC5lbnQgPSBjb250ZW50LmVudCB8fCBbXTtcbiAgY29udGVudC5mbXQgPSBjb250ZW50LmZtdCB8fCBbXTtcblxuICBjb250ZW50LmZtdC5wdXNoKHtcbiAgICBhdDogY29udGVudC50eHQubGVuZ3RoLFxuICAgIGxlbjogbGlua0RhdGEudHh0Lmxlbmd0aCxcbiAgICBrZXk6IGNvbnRlbnQuZW50Lmxlbmd0aFxuICB9KTtcbiAgY29udGVudC50eHQgKz0gbGlua0RhdGEudHh0O1xuXG4gIGNvbnN0IGV4ID0ge1xuICAgIHRwOiAnTE4nLFxuICAgIGRhdGE6IHtcbiAgICAgIHVybDogbGlua0RhdGEudXJsXG4gICAgfVxuICB9XG4gIGNvbnRlbnQuZW50LnB1c2goZXgpO1xuXG4gIHJldHVybiBjb250ZW50O1xufVxuXG4vKipcbiAqIEFwcGVuZCBpbWFnZSB0byBEcmFmdHkgZG9jdW1lbnQuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl9IGNvbnRlbnQgLSBkb2N1bWVudCB0byBhZGQgaW1hZ2UgdG8uXG4gKiBAcGFyYW0ge0ltYWdlRGVzY30gaW1hZ2VEZXNjIC0gb2JqZWN0IHdpdGggaW1hZ2UgcGFyYW1lbmV0cy5cbiAqXG4gKiBAcmV0dXJuIHtEcmFmdHl9IHVwZGF0ZWQgZG9jdW1lbnQuXG4gKi9cbkRyYWZ0eS5hcHBlbmRJbWFnZSA9IGZ1bmN0aW9uKGNvbnRlbnQsIGltYWdlRGVzYykge1xuICBjb250ZW50ID0gY29udGVudCB8fCB7XG4gICAgdHh0OiAnJ1xuICB9O1xuICBjb250ZW50LnR4dCArPSAnICc7XG4gIHJldHVybiBEcmFmdHkuaW5zZXJ0SW1hZ2UoY29udGVudCwgY29udGVudC50eHQubGVuZ3RoIC0gMSwgaW1hZ2VEZXNjKTtcbn1cblxuLyoqXG4gKiBBcHBlbmQgYXVkaW8gcmVjb2RyaW5nIHRvIERyYWZ0eSBkb2N1bWVudC5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eX0gY29udGVudCAtIGRvY3VtZW50IHRvIGFkZCByZWNvcmRpbmcgdG8uXG4gKiBAcGFyYW0ge0F1ZGlvRGVzY30gYXVkaW9EZXNjIC0gb2JqZWN0IHdpdGggYXVkaW8gZGF0YS5cbiAqXG4gKiBAcmV0dXJuIHtEcmFmdHl9IHVwZGF0ZWQgZG9jdW1lbnQuXG4gKi9cbkRyYWZ0eS5hcHBlbmRBdWRpbyA9IGZ1bmN0aW9uKGNvbnRlbnQsIGF1ZGlvRGVzYykge1xuICBjb250ZW50ID0gY29udGVudCB8fCB7XG4gICAgdHh0OiAnJ1xuICB9O1xuICBjb250ZW50LnR4dCArPSAnICc7XG4gIHJldHVybiBEcmFmdHkuaW5zZXJ0QXVkaW8oY29udGVudCwgY29udGVudC50eHQubGVuZ3RoIC0gMSwgYXVkaW9EZXNjKTtcbn1cblxuLyoqXG4gKiBAdHlwZWRlZiBEcmFmdHkuQXR0YWNobWVudERlc2NcbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEB0eXBlIE9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IG1pbWUgLSBtaW1lLXR5cGUgb2YgdGhlIGF0dGFjaG1lbnQsIGUuZy4gXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIlxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgLSBiYXNlNjQtZW5jb2RlZCBpbi1iYW5kIGNvbnRlbnQgb2Ygc21hbGwgYXR0YWNobWVudHMuIENvdWxkIGJlIG51bGwvdW5kZWZpbmVkLlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lIC0gZmlsZSBuYW1lIHN1Z2dlc3Rpb24gZm9yIGRvd25sb2FkaW5nIHRoZSBhdHRhY2htZW50LlxuICogQHBhcmFtIHtpbnRlZ2VyfSBzaXplIC0gc2l6ZSBvZiB0aGUgZmlsZSBpbiBieXRlcy4gVHJlYXQgaXMgYXMgYW4gdW50cnVzdGVkIGhpbnQuXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVmdXJsIC0gcmVmZXJlbmNlIHRvIHRoZSBvdXQtb2YtYmFuZCBjb250ZW50LiBDb3VsZCBiZSBudWxsL3VuZGVmaW5lZC5cbiAqIEBwYXJhbSB7UHJvbWlzZX0gdXJsUHJvbWlzZSAtIFByb21pc2Ugd2hpY2ggcmV0dXJucyBjb250ZW50IFVSTCB3aGVuIHJlc29sdmVkLlxuICovXG5cbi8qKlxuICogQXR0YWNoIGZpbGUgdG8gRHJhZnR5IGNvbnRlbnQuIEVpdGhlciBhcyBhIGJsb2Igb3IgYXMgYSByZWZlcmVuY2UuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl9IGNvbnRlbnQgLSBkb2N1bWVudCB0byBhdHRhY2ggZmlsZSB0by5cbiAqIEBwYXJhbSB7QXR0YWNobWVudERlc2N9IG9iamVjdCAtIGNvbnRhaW5pbmcgYXR0YWNobWVudCBkZXNjcmlwdGlvbiBhbmQgZGF0YS5cbiAqXG4gKiBAcmV0dXJuIHtEcmFmdHl9IHVwZGF0ZWQgZG9jdW1lbnQuXG4gKi9cbkRyYWZ0eS5hdHRhY2hGaWxlID0gZnVuY3Rpb24oY29udGVudCwgYXR0YWNobWVudERlc2MpIHtcbiAgY29udGVudCA9IGNvbnRlbnQgfHwge1xuICAgIHR4dDogJydcbiAgfTtcblxuICBjb250ZW50LmVudCA9IGNvbnRlbnQuZW50IHx8IFtdO1xuICBjb250ZW50LmZtdCA9IGNvbnRlbnQuZm10IHx8IFtdO1xuXG4gIGNvbnRlbnQuZm10LnB1c2goe1xuICAgIGF0OiAtMSxcbiAgICBsZW46IDAsXG4gICAga2V5OiBjb250ZW50LmVudC5sZW5ndGhcbiAgfSk7XG5cbiAgY29uc3QgZXggPSB7XG4gICAgdHA6ICdFWCcsXG4gICAgZGF0YToge1xuICAgICAgbWltZTogYXR0YWNobWVudERlc2MubWltZSxcbiAgICAgIHZhbDogYXR0YWNobWVudERlc2MuZGF0YSxcbiAgICAgIG5hbWU6IGF0dGFjaG1lbnREZXNjLmZpbGVuYW1lLFxuICAgICAgcmVmOiBhdHRhY2htZW50RGVzYy5yZWZ1cmwsXG4gICAgICBzaXplOiBhdHRhY2htZW50RGVzYy5zaXplIHwgMFxuICAgIH1cbiAgfVxuICBpZiAoYXR0YWNobWVudERlc2MudXJsUHJvbWlzZSkge1xuICAgIGV4LmRhdGEuX3Byb2Nlc3NpbmcgPSB0cnVlO1xuICAgIGF0dGFjaG1lbnREZXNjLnVybFByb21pc2UudGhlbihcbiAgICAgICh1cmwpID0+IHtcbiAgICAgICAgZXguZGF0YS5yZWYgPSB1cmw7XG4gICAgICAgIGV4LmRhdGEuX3Byb2Nlc3NpbmcgPSB1bmRlZmluZWQ7XG4gICAgICB9LFxuICAgICAgKGVycikgPT4ge1xuICAgICAgICAvKiBjYXRjaCB0aGUgZXJyb3IsIG90aGVyd2lzZSBpdCB3aWxsIGFwcGVhciBpbiB0aGUgY29uc29sZS4gKi9cbiAgICAgICAgZXguZGF0YS5fcHJvY2Vzc2luZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICApO1xuICB9XG4gIGNvbnRlbnQuZW50LnB1c2goZXgpO1xuXG4gIHJldHVybiBjb250ZW50O1xufVxuXG4vKipcbiAqIFdyYXBzIGRyYWZ0eSBkb2N1bWVudCBpbnRvIGEgc2ltcGxlIGZvcm1hdHRpbmcgc3R5bGUuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl8c3RyaW5nfSBjb250ZW50IC0gZG9jdW1lbnQgb3Igc3RyaW5nIHRvIHdyYXAgaW50byBhIHN0eWxlLlxuICogQHBhcmFtIHtzdHJpbmd9IHN0eWxlIC0gdHdvLWxldHRlciBzdHlsZSB0byB3cmFwIGludG8uXG4gKiBAcGFyYW0ge251bWJlcn0gYXQgLSBpbmRleCB3aGVyZSB0aGUgc3R5bGUgc3RhcnRzLCBkZWZhdWx0IDAuXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuIC0gbGVuZ3RoIG9mIHRoZSBmb3JtIGNvbnRlbnQsIGRlZmF1bHQgYWxsIG9mIGl0LlxuICpcbiAqIEByZXR1cm4ge0RyYWZ0eX0gdXBkYXRlZCBkb2N1bWVudC5cbiAqL1xuRHJhZnR5LndyYXBJbnRvID0gZnVuY3Rpb24oY29udGVudCwgc3R5bGUsIGF0LCBsZW4pIHtcbiAgaWYgKHR5cGVvZiBjb250ZW50ID09ICdzdHJpbmcnKSB7XG4gICAgY29udGVudCA9IHtcbiAgICAgIHR4dDogY29udGVudFxuICAgIH07XG4gIH1cbiAgY29udGVudC5mbXQgPSBjb250ZW50LmZtdCB8fCBbXTtcblxuICBjb250ZW50LmZtdC5wdXNoKHtcbiAgICBhdDogYXQgfHwgMCxcbiAgICBsZW46IGxlbiB8fCBjb250ZW50LnR4dC5sZW5ndGgsXG4gICAgdHA6IHN0eWxlLFxuICB9KTtcblxuICByZXR1cm4gY29udGVudDtcbn1cblxuLyoqXG4gKiBXcmFwcyBjb250ZW50IGludG8gYW4gaW50ZXJhY3RpdmUgZm9ybS5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eXxzdHJpbmd9IGNvbnRlbnQgLSB0byB3cmFwIGludG8gYSBmb3JtLlxuICogQHBhcmFtIHtudW1iZXJ9IGF0IC0gaW5kZXggd2hlcmUgdGhlIGZvcm1zIHN0YXJ0cy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsZW4gLSBsZW5ndGggb2YgdGhlIGZvcm0gY29udGVudC5cbiAqXG4gKiBAcmV0dXJuIHtEcmFmdHl9IHVwZGF0ZWQgZG9jdW1lbnQuXG4gKi9cbkRyYWZ0eS53cmFwQXNGb3JtID0gZnVuY3Rpb24oY29udGVudCwgYXQsIGxlbikge1xuICByZXR1cm4gRHJhZnR5LndyYXBJbnRvKGNvbnRlbnQsICdGTScsIGF0LCBsZW4pO1xufVxuXG4vKipcbiAqIEluc2VydCBjbGlja2FibGUgYnV0dG9uIGludG8gRHJhZnR5IGRvY3VtZW50LlxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7RHJhZnR5fHN0cmluZ30gY29udGVudCAtIERyYWZ0eSBkb2N1bWVudCB0byBpbnNlcnQgYnV0dG9uIHRvIG9yIGEgc3RyaW5nIHRvIGJlIHVzZWQgYXMgYnV0dG9uIHRleHQuXG4gKiBAcGFyYW0ge251bWJlcn0gYXQgLSBsb2NhdGlvbiB3aGVyZSB0aGUgYnV0dG9uIGlzIGluc2VydGVkLlxuICogQHBhcmFtIHtudW1iZXJ9IGxlbiAtIHRoZSBsZW5ndGggb2YgdGhlIHRleHQgdG8gYmUgdXNlZCBhcyBidXR0b24gdGl0bGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIHRoZSBidXR0b24uIENsaWVudCBzaG91bGQgcmV0dXJuIGl0IHRvIHRoZSBzZXJ2ZXIgd2hlbiB0aGUgYnV0dG9uIGlzIGNsaWNrZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uVHlwZSAtIHRoZSB0eXBlIG9mIHRoZSBidXR0b24sIG9uZSBvZiAndXJsJyBvciAncHViJy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25WYWx1ZSAtIHRoZSB2YWx1ZSB0byByZXR1cm4gb24gY2xpY2s6XG4gKiBAcGFyYW0ge3N0cmluZ30gcmVmVXJsIC0gdGhlIFVSTCB0byBnbyB0byB3aGVuIHRoZSAndXJsJyBidXR0b24gaXMgY2xpY2tlZC5cbiAqXG4gKiBAcmV0dXJuIHtEcmFmdHl9IHVwZGF0ZWQgZG9jdW1lbnQuXG4gKi9cbkRyYWZ0eS5pbnNlcnRCdXR0b24gPSBmdW5jdGlvbihjb250ZW50LCBhdCwgbGVuLCBuYW1lLCBhY3Rpb25UeXBlLCBhY3Rpb25WYWx1ZSwgcmVmVXJsKSB7XG4gIGlmICh0eXBlb2YgY29udGVudCA9PSAnc3RyaW5nJykge1xuICAgIGNvbnRlbnQgPSB7XG4gICAgICB0eHQ6IGNvbnRlbnRcbiAgICB9O1xuICB9XG5cbiAgaWYgKCFjb250ZW50IHx8ICFjb250ZW50LnR4dCB8fCBjb250ZW50LnR4dC5sZW5ndGggPCBhdCArIGxlbikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKGxlbiA8PSAwIHx8IFsndXJsJywgJ3B1YiddLmluZGV4T2YoYWN0aW9uVHlwZSkgPT0gLTEpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICAvLyBFbnN1cmUgcmVmVXJsIGlzIGEgc3RyaW5nLlxuICBpZiAoYWN0aW9uVHlwZSA9PSAndXJsJyAmJiAhcmVmVXJsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmVmVXJsID0gJycgKyByZWZVcmw7XG5cbiAgY29udGVudC5lbnQgPSBjb250ZW50LmVudCB8fCBbXTtcbiAgY29udGVudC5mbXQgPSBjb250ZW50LmZtdCB8fCBbXTtcblxuICBjb250ZW50LmZtdC5wdXNoKHtcbiAgICBhdDogYXQgfCAwLFxuICAgIGxlbjogbGVuLFxuICAgIGtleTogY29udGVudC5lbnQubGVuZ3RoXG4gIH0pO1xuICBjb250ZW50LmVudC5wdXNoKHtcbiAgICB0cDogJ0JOJyxcbiAgICBkYXRhOiB7XG4gICAgICBhY3Q6IGFjdGlvblR5cGUsXG4gICAgICB2YWw6IGFjdGlvblZhbHVlLFxuICAgICAgcmVmOiByZWZVcmwsXG4gICAgICBuYW1lOiBuYW1lXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gY29udGVudDtcbn1cblxuLyoqXG4gKiBBcHBlbmQgY2xpY2thYmxlIGJ1dHRvbiB0byBEcmFmdHkgZG9jdW1lbnQuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl8c3RyaW5nfSBjb250ZW50IC0gRHJhZnR5IGRvY3VtZW50IHRvIGluc2VydCBidXR0b24gdG8gb3IgYSBzdHJpbmcgdG8gYmUgdXNlZCBhcyBidXR0b24gdGV4dC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZSAtIHRoZSB0ZXh0IHRvIGJlIHVzZWQgYXMgYnV0dG9uIHRpdGxlLlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSB0aGUgYnV0dG9uLiBDbGllbnQgc2hvdWxkIHJldHVybiBpdCB0byB0aGUgc2VydmVyIHdoZW4gdGhlIGJ1dHRvbiBpcyBjbGlja2VkLlxuICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvblR5cGUgLSB0aGUgdHlwZSBvZiB0aGUgYnV0dG9uLCBvbmUgb2YgJ3VybCcgb3IgJ3B1YicuXG4gKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uVmFsdWUgLSB0aGUgdmFsdWUgdG8gcmV0dXJuIG9uIGNsaWNrOlxuICogQHBhcmFtIHtzdHJpbmd9IHJlZlVybCAtIHRoZSBVUkwgdG8gZ28gdG8gd2hlbiB0aGUgJ3VybCcgYnV0dG9uIGlzIGNsaWNrZWQuXG4gKlxuICogQHJldHVybiB7RHJhZnR5fSB1cGRhdGVkIGRvY3VtZW50LlxuICovXG5EcmFmdHkuYXBwZW5kQnV0dG9uID0gZnVuY3Rpb24oY29udGVudCwgdGl0bGUsIG5hbWUsIGFjdGlvblR5cGUsIGFjdGlvblZhbHVlLCByZWZVcmwpIHtcbiAgY29udGVudCA9IGNvbnRlbnQgfHwge1xuICAgIHR4dDogJydcbiAgfTtcbiAgY29uc3QgYXQgPSBjb250ZW50LnR4dC5sZW5ndGg7XG4gIGNvbnRlbnQudHh0ICs9IHRpdGxlO1xuICByZXR1cm4gRHJhZnR5Lmluc2VydEJ1dHRvbihjb250ZW50LCBhdCwgdGl0bGUubGVuZ3RoLCBuYW1lLCBhY3Rpb25UeXBlLCBhY3Rpb25WYWx1ZSwgcmVmVXJsKTtcbn1cblxuLyoqXG4gKiBBdHRhY2ggYSBnZW5lcmljIEpTIG9iamVjdC4gVGhlIG9iamVjdCBpcyBhdHRhY2hlZCBhcyBhIGpzb24gc3RyaW5nLlxuICogSW50ZW5kZWQgZm9yIHJlcHJlc2VudGluZyBhIGZvcm0gcmVzcG9uc2UuXG4gKlxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7RHJhZnR5fSBjb250ZW50IC0gRHJhZnR5IGRvY3VtZW50IHRvIGF0dGFjaCBmaWxlIHRvLlxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSBkYXRhIHRvIGNvbnZlcnQgdG8ganNvbiBzdHJpbmcgYW5kIGF0dGFjaC5cbiAqIEByZXR1cm5zIHtEcmFmdHl9IHRoZSBzYW1lIGRvY3VtZW50IGFzIDxjb2RlPmNvbnRlbnQ8L2NvZGU+LlxuICovXG5EcmFmdHkuYXR0YWNoSlNPTiA9IGZ1bmN0aW9uKGNvbnRlbnQsIGRhdGEpIHtcbiAgY29udGVudCA9IGNvbnRlbnQgfHwge1xuICAgIHR4dDogJydcbiAgfTtcbiAgY29udGVudC5lbnQgPSBjb250ZW50LmVudCB8fCBbXTtcbiAgY29udGVudC5mbXQgPSBjb250ZW50LmZtdCB8fCBbXTtcblxuICBjb250ZW50LmZtdC5wdXNoKHtcbiAgICBhdDogLTEsXG4gICAgbGVuOiAwLFxuICAgIGtleTogY29udGVudC5lbnQubGVuZ3RoXG4gIH0pO1xuXG4gIGNvbnRlbnQuZW50LnB1c2goe1xuICAgIHRwOiAnRVgnLFxuICAgIGRhdGE6IHtcbiAgICAgIG1pbWU6IEpTT05fTUlNRV9UWVBFLFxuICAgICAgdmFsOiBkYXRhXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gY29udGVudDtcbn1cbi8qKlxuICogQXBwZW5kIGxpbmUgYnJlYWsgdG8gYSBEcmFmdHkgZG9jdW1lbnQuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl9IGNvbnRlbnQgLSBEcmFmdHkgZG9jdW1lbnQgdG8gYXBwZW5kIGxpbmVicmVhayB0by5cbiAqIEByZXR1cm5zIHtEcmFmdHl9IHRoZSBzYW1lIGRvY3VtZW50IGFzIDxjb2RlPmNvbnRlbnQ8L2NvZGU+LlxuICovXG5EcmFmdHkuYXBwZW5kTGluZUJyZWFrID0gZnVuY3Rpb24oY29udGVudCkge1xuICBjb250ZW50ID0gY29udGVudCB8fCB7XG4gICAgdHh0OiAnJ1xuICB9O1xuICBjb250ZW50LmZtdCA9IGNvbnRlbnQuZm10IHx8IFtdO1xuICBjb250ZW50LmZtdC5wdXNoKHtcbiAgICBhdDogY29udGVudC50eHQubGVuZ3RoLFxuICAgIGxlbjogMSxcbiAgICB0cDogJ0JSJ1xuICB9KTtcbiAgY29udGVudC50eHQgKz0gJyAnO1xuXG4gIHJldHVybiBjb250ZW50O1xufVxuLyoqXG4gKiBHaXZlbiBEcmFmdHkgZG9jdW1lbnQsIGNvbnZlcnQgaXQgdG8gSFRNTC5cbiAqIE5vIGF0dGVtcHQgaXMgbWFkZSB0byBzdHJpcCBwcmUtZXhpc3RpbmcgaHRtbCBtYXJrdXAuXG4gKiBUaGlzIGlzIHBvdGVudGlhbGx5IHVuc2FmZSBiZWNhdXNlIDxjb2RlPmNvbnRlbnQudHh0PC9jb2RlPiBtYXkgY29udGFpbiBtYWxpY2lvdXMgSFRNTFxuICogbWFya3VwLlxuICogQG1lbWJlcm9mIFRpbm9kZS5EcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eX0gZG9jIC0gZG9jdW1lbnQgdG8gY29udmVydC5cbiAqXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBIVE1MLXJlcHJlc2VudGF0aW9uIG9mIGNvbnRlbnQuXG4gKi9cbkRyYWZ0eS5VTlNBRkVfdG9IVE1MID0gZnVuY3Rpb24oZG9jKSB7XG4gIGxldCB0cmVlID0gZHJhZnR5VG9UcmVlKGRvYyk7XG4gIGNvbnN0IGh0bWxGb3JtYXR0ZXIgPSBmdW5jdGlvbih0eXBlLCBkYXRhLCB2YWx1ZXMpIHtcbiAgICBjb25zdCB0YWcgPSBERUNPUkFUT1JTW3R5cGVdO1xuICAgIGxldCByZXN1bHQgPSB2YWx1ZXMgPyB2YWx1ZXMuam9pbignJykgOiAnJztcbiAgICBpZiAodGFnKSB7XG4gICAgICByZXN1bHQgPSB0YWcub3BlbihkYXRhKSArIHJlc3VsdCArIHRhZy5jbG9zZShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcmV0dXJuIHRyZWVCb3R0b21VcCh0cmVlLCBodG1sRm9ybWF0dGVyLCAwKTtcbn1cblxuLyoqXG4gKiBDYWxsYmFjayBmb3IgYXBwbHlpbmcgY3VzdG9tIGZvcm1hdHRpbmcgdG8gYSBEcmFmdHkgZG9jdW1lbnQuXG4gKiBDYWxsZWQgb25jZSBmb3IgZWFjaCBzdHlsZSBzcGFuLlxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBjYWxsYmFjayBGb3JtYXR0ZXJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHlsZSAtIHN0eWxlIGNvZGUgc3VjaCBhcyBcIlNUXCIgb3IgXCJJTVwiLlxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSBlbnRpdHkncyBkYXRhLlxuICogQHBhcmFtIHtPYmplY3R9IHZhbHVlcyAtIHBvc3NpYmx5IHN0eWxlZCBzdWJzcGFucyBjb250YWluZWQgaW4gdGhpcyBzdHlsZSBzcGFuLlxuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gaW5kZXggb2YgdGhlIGVsZW1lbnQgZ3VhcmFudGVlZCB0byBiZSB1bmlxdWUuXG4gKi9cblxuLyoqXG4gKiBDb252ZXJ0IERyYWZ0eSBkb2N1bWVudCB0byBhIHJlcHJlc2VudGF0aW9uIHN1aXRhYmxlIGZvciBkaXNwbGF5LlxuICogVGhlIDxjb2RlPmNvbnRleHQ8L2NvZGU+IG1heSBleHBvc2UgYSBmdW5jdGlvbiA8Y29kZT5nZXRGb3JtYXR0ZXIoc3R5bGUpPC9jb2RlPi4gSWYgaXQncyBhdmFpbGFibGVcbiAqIGl0IHdpbGwgY2FsbCBpdCB0byBvYnRhaW4gYSA8Y29kZT5mb3JtYXR0ZXI8L2NvZGU+IGZvciBhIHN1YnRyZWUgb2Ygc3R5bGVzIHVuZGVyIHRoZSA8Y29kZT5zdHlsZTwvY29kZT4uXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl8T2JqZWN0fSBjb250ZW50IC0gRHJhZnR5IGRvY3VtZW50IHRvIHRyYW5zZm9ybS5cbiAqIEBwYXJhbSB7Rm9ybWF0dGVyfSBmb3JtYXR0ZXIgLSBjYWxsYmFjayB3aGljaCBmb3JtYXRzIGluZGl2aWR1YWwgZWxlbWVudHMuXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIGNvbnRleHQgcHJvdmlkZWQgdG8gZm9ybWF0dGVyIGFzIDxjb2RlPnRoaXM8L2NvZGU+LlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gdHJhbnNmb3JtZWQgb2JqZWN0XG4gKi9cbkRyYWZ0eS5mb3JtYXQgPSBmdW5jdGlvbihvcmlnaW5hbCwgZm9ybWF0dGVyLCBjb250ZXh0KSB7XG4gIHJldHVybiB0cmVlQm90dG9tVXAoZHJhZnR5VG9UcmVlKG9yaWdpbmFsKSwgZm9ybWF0dGVyLCAwLCBbXSwgY29udGV4dCk7XG59XG5cbi8qKlxuICogU2hvcnRlbiBEcmFmdHkgZG9jdW1lbnQgbWFraW5nIHRoZSBkcmFmdHkgdGV4dCBubyBsb25nZXIgdGhhbiB0aGUgbGltaXQuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl8c3RyaW5nfSBvcmlnaW5hbCAtIERyYWZ0eSBvYmplY3QgdG8gc2hvcnRlbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdCAtIGxlbmd0aCBpbiBjaGFyYWNyZXRzIHRvIHNob3J0ZW4gdG8uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGxpZ2h0IC0gcmVtb3ZlIGhlYXZ5IGRhdGEgZnJvbSBlbnRpdGllcy5cbiAqIEByZXR1cm5zIG5ldyBzaG9ydGVuZWQgRHJhZnR5IG9iamVjdCBsZWF2aW5nIHRoZSBvcmlnaW5hbCBpbnRhY3QuXG4gKi9cbkRyYWZ0eS5zaG9ydGVuID0gZnVuY3Rpb24ob3JpZ2luYWwsIGxpbWl0LCBsaWdodCkge1xuICBsZXQgdHJlZSA9IGRyYWZ0eVRvVHJlZShvcmlnaW5hbCk7XG4gIHRyZWUgPSBzaG9ydGVuVHJlZSh0cmVlLCBsaW1pdCwgJ+KApicpO1xuICBpZiAodHJlZSAmJiBsaWdodCkge1xuICAgIHRyZWUgPSBsaWdodEVudGl0eSh0cmVlKTtcbiAgfVxuICByZXR1cm4gdHJlZVRvRHJhZnR5KHt9LCB0cmVlLCBbXSk7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtIERyYWZ0eSBkb2MgZm9yIGZvcndhcmRpbmc6IHN0cmlwIGxlYWRpbmcgQG1lbnRpb24gYW5kIGFueSBsZWFkaW5nIGxpbmUgYnJlYWtzIG9yIHdoaXRlc3BhY2UuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl8c3RyaW5nfSBvcmlnaW5hbCAtIERyYWZ0eSBvYmplY3QgdG8gc2hvcnRlbi5cbiAqIEByZXR1cm5zIGNvbnZlcnRlZCBEcmFmdHkgb2JqZWN0IGxlYXZpbmcgdGhlIG9yaWdpbmFsIGludGFjdC5cbiAqL1xuRHJhZnR5LmZvcndhcmRlZENvbnRlbnQgPSBmdW5jdGlvbihvcmlnaW5hbCkge1xuICBsZXQgdHJlZSA9IGRyYWZ0eVRvVHJlZShvcmlnaW5hbCk7XG4gIGNvbnN0IHJtTWVudGlvbiA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBpZiAobm9kZS50eXBlID09ICdNTicpIHtcbiAgICAgIGlmICghbm9kZS5wYXJlbnQgfHwgIW5vZGUucGFyZW50LnR5cGUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xuICB9XG4gIC8vIFN0cmlwIGxlYWRpbmcgbWVudGlvbi5cbiAgdHJlZSA9IHRyZWVUb3BEb3duKHRyZWUsIHJtTWVudGlvbik7XG4gIC8vIFJlbW92ZSBsZWFkaW5nIHdoaXRlc3BhY2UuXG4gIHRyZWUgPSBsVHJpbSh0cmVlKTtcbiAgLy8gQ29udmVydCBiYWNrIHRvIERyYWZ0eS5cbiAgcmV0dXJuIHRyZWVUb0RyYWZ0eSh7fSwgdHJlZSwgW10pO1xufVxuXG4vKipcbiAqIFByZXBhcmUgRHJhZnR5IGRvYyBmb3Igd3JhcHBpbmcgaW50byBRUSBhcyBhIHJlcGx5OlxuICogIC0gUmVwbGFjZSBmb3J3YXJkaW5nIG1lbnRpb24gd2l0aCBzeW1ib2wgJ+KepicgYW5kIHJlbW92ZSBkYXRhIChVSUQpLlxuICogIC0gUmVtb3ZlIHF1b3RlZCB0ZXh0IGNvbXBsZXRlbHkuXG4gKiAgLSBSZXBsYWNlIGxpbmUgYnJlYWtzIHdpdGggc3BhY2VzLlxuICogIC0gU3RyaXAgZW50aXRpZXMgb2YgaGVhdnkgY29udGVudC5cbiAqICAtIE1vdmUgYXR0YWNobWVudHMgdG8gdGhlIGVuZCBvZiB0aGUgZG9jdW1lbnQuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl8c3RyaW5nfSBvcmlnaW5hbCAtIERyYWZ0eSBvYmplY3QgdG8gc2hvcnRlbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdCAtIGxlbmd0aCBpbiBjaGFyYWN0ZXJzIHRvIHNob3J0ZW4gdG8uXG4gKiBAcmV0dXJucyBjb252ZXJ0ZWQgRHJhZnR5IG9iamVjdCBsZWF2aW5nIHRoZSBvcmlnaW5hbCBpbnRhY3QuXG4gKi9cbkRyYWZ0eS5yZXBseUNvbnRlbnQgPSBmdW5jdGlvbihvcmlnaW5hbCwgbGltaXQpIHtcbiAgY29uc3QgY29udk1OblFRbkJSID0gZnVuY3Rpb24obm9kZSkge1xuICAgIGlmIChub2RlLnR5cGUgPT0gJ1FRJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChub2RlLnR5cGUgPT0gJ01OJykge1xuICAgICAgaWYgKCghbm9kZS5wYXJlbnQgfHwgIW5vZGUucGFyZW50LnR5cGUpICYmIChub2RlLnRleHQgfHwgJycpLnN0YXJ0c1dpdGgoJ+KepicpKSB7XG4gICAgICAgIG5vZGUudGV4dCA9ICfinqYnO1xuICAgICAgICBkZWxldGUgbm9kZS5jaGlsZHJlbjtcbiAgICAgICAgZGVsZXRlIG5vZGUuZGF0YTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5vZGUudHlwZSA9PSAnQlInKSB7XG4gICAgICBub2RlLnRleHQgPSAnICc7XG4gICAgICBkZWxldGUgbm9kZS50eXBlO1xuICAgICAgZGVsZXRlIG5vZGUuY2hpbGRyZW47XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgbGV0IHRyZWUgPSBkcmFmdHlUb1RyZWUob3JpZ2luYWwpO1xuICBpZiAoIXRyZWUpIHtcbiAgICByZXR1cm4gb3JpZ2luYWw7XG4gIH1cblxuICAvLyBTdHJpcCBsZWFkaW5nIG1lbnRpb24uXG4gIHRyZWUgPSB0cmVlVG9wRG93bih0cmVlLCBjb252TU5uUVFuQlIpO1xuICAvLyBNb3ZlIGF0dGFjaG1lbnRzIHRvIHRoZSBlbmQgb2YgdGhlIGRvYy5cbiAgdHJlZSA9IGF0dGFjaG1lbnRzVG9FbmQodHJlZSwgTUFYX1BSRVZJRVdfQVRUQUNITUVOVFMpO1xuICAvLyBTaG9ydGVuIHRoZSBkb2MuXG4gIHRyZWUgPSBzaG9ydGVuVHJlZSh0cmVlLCBsaW1pdCwgJ+KApicpO1xuICAvLyBTdHJpcCBoZWF2eSBlbGVtZW50cyBleGNlcHQgSU0uZGF0YVsndmFsJ10gKGhhdmUgdG8ga2VlcCB0aGVtIHRvIGdlbmVyYXRlIHByZXZpZXdzIGxhdGVyKS5cbiAgdHJlZSA9IGxpZ2h0RW50aXR5KHRyZWUsIG5vZGUgPT4gKG5vZGUudHlwZSA9PSAnSU0nID8gWyd2YWwnXSA6IG51bGwpKTtcbiAgLy8gQ29udmVydCBiYWNrIHRvIERyYWZ0eS5cbiAgcmV0dXJuIHRyZWVUb0RyYWZ0eSh7fSwgdHJlZSwgW10pO1xufVxuXG5cbi8qKlxuICogR2VuZXJhdGUgZHJhZnR5IHByZXZpZXc6XG4gKiAgLSBTaG9ydGVuIHRoZSBkb2N1bWVudC5cbiAqICAtIFN0cmlwIGFsbCBoZWF2eSBlbnRpdHkgZGF0YSBsZWF2aW5nIGp1c3QgaW5saW5lIHN0eWxlcyBhbmQgZW50aXR5IHJlZmVyZW5jZXMuXG4gKiAgLSBSZXBsYWNlIGxpbmUgYnJlYWtzIHdpdGggc3BhY2VzLlxuICogIC0gUmVwbGFjZSBjb250ZW50IG9mIFFRIHdpdGggYSBzcGFjZS5cbiAqICAtIFJlcGxhY2UgZm9yd2FyZGluZyBtZW50aW9uIHdpdGggc3ltYm9sICfinqYnLlxuICogbW92ZSBhbGwgYXR0YWNobWVudHMgdG8gdGhlIGVuZCBvZiB0aGUgZG9jdW1lbnQgYW5kIG1ha2UgdGhlbSB2aXNpYmxlLlxuICogVGhlIDxjb2RlPmNvbnRleHQ8L2NvZGU+IG1heSBleHBvc2UgYSBmdW5jdGlvbiA8Y29kZT5nZXRGb3JtYXR0ZXIoc3R5bGUpPC9jb2RlPi4gSWYgaXQncyBhdmFpbGFibGVcbiAqIGl0IHdpbGwgY2FsbCBpdCB0byBvYnRhaW4gYSA8Y29kZT5mb3JtYXR0ZXI8L2NvZGU+IGZvciBhIHN1YnRyZWUgb2Ygc3R5bGVzIHVuZGVyIHRoZSA8Y29kZT5zdHlsZTwvY29kZT4uXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl8c3RyaW5nfSBvcmlnaW5hbCAtIERyYWZ0eSBvYmplY3QgdG8gc2hvcnRlbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdCAtIGxlbmd0aCBpbiBjaGFyYWN0ZXJzIHRvIHNob3J0ZW4gdG8uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGZvcndhcmRpbmcgLSB0aGlzIGEgZm9yd2FyZGluZyBtZXNzYWdlIHByZXZpZXcuXG4gKiBAcmV0dXJucyBuZXcgc2hvcnRlbmVkIERyYWZ0eSBvYmplY3QgbGVhdmluZyB0aGUgb3JpZ2luYWwgaW50YWN0LlxuICovXG5EcmFmdHkucHJldmlldyA9IGZ1bmN0aW9uKG9yaWdpbmFsLCBsaW1pdCwgZm9yd2FyZGluZykge1xuICBsZXQgdHJlZSA9IGRyYWZ0eVRvVHJlZShvcmlnaW5hbCk7XG5cbiAgLy8gTW92ZSBhdHRhY2htZW50cyB0byB0aGUgZW5kLlxuICB0cmVlID0gYXR0YWNobWVudHNUb0VuZCh0cmVlLCBNQVhfUFJFVklFV19BVFRBQ0hNRU5UUyk7XG5cbiAgLy8gQ29udmVydCBsZWFkaW5nIG1lbnRpb24gdG8gJ+KepicgYW5kIHJlcGxhY2UgUVEgYW5kIEJSIHdpdGggYSBzcGFjZSAnICcuXG4gIGNvbnN0IGNvbnZNTm5RUW5CUiA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBpZiAobm9kZS50eXBlID09ICdNTicpIHtcbiAgICAgIGlmICgoIW5vZGUucGFyZW50IHx8ICFub2RlLnBhcmVudC50eXBlKSAmJiAobm9kZS50ZXh0IHx8ICcnKS5zdGFydHNXaXRoKCfinqYnKSkge1xuICAgICAgICBub2RlLnRleHQgPSAn4p6mJztcbiAgICAgICAgZGVsZXRlIG5vZGUuY2hpbGRyZW47XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChub2RlLnR5cGUgPT0gJ1FRJykge1xuICAgICAgbm9kZS50ZXh0ID0gJyAnO1xuICAgICAgZGVsZXRlIG5vZGUuY2hpbGRyZW47XG4gICAgfSBlbHNlIGlmIChub2RlLnR5cGUgPT0gJ0JSJykge1xuICAgICAgbm9kZS50ZXh0ID0gJyAnO1xuICAgICAgZGVsZXRlIG5vZGUuY2hpbGRyZW47XG4gICAgICBkZWxldGUgbm9kZS50eXBlO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuICB0cmVlID0gdHJlZVRvcERvd24odHJlZSwgY29udk1OblFRbkJSKTtcblxuICB0cmVlID0gc2hvcnRlblRyZWUodHJlZSwgbGltaXQsICfigKYnKTtcbiAgaWYgKGZvcndhcmRpbmcpIHtcbiAgICAvLyBLZWVwIElNIGRhdGEgZm9yIHByZXZpZXcuXG4gICAgdHJlZSA9IGxpZ2h0RW50aXR5KHRyZWUsIG5vZGUgPT4gKG5vZGUudHlwZSA9PSAnSU0nID8gWyd2YWwnXSA6IG51bGwpKTtcbiAgfSBlbHNlIHtcbiAgICB0cmVlID0gbGlnaHRFbnRpdHkodHJlZSk7XG4gIH1cblxuICAvLyBDb252ZXJ0IGJhY2sgdG8gRHJhZnR5LlxuICByZXR1cm4gdHJlZVRvRHJhZnR5KHt9LCB0cmVlLCBbXSk7XG59XG5cbi8qKlxuICogR2l2ZW4gRHJhZnR5IGRvY3VtZW50LCBjb252ZXJ0IGl0IHRvIHBsYWluIHRleHQuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl9IGNvbnRlbnQgLSBkb2N1bWVudCB0byBjb252ZXJ0IHRvIHBsYWluIHRleHQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBwbGFpbi10ZXh0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkcmFmdHkgZG9jdW1lbnQuXG4gKi9cbkRyYWZ0eS50b1BsYWluVGV4dCA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgcmV0dXJuIHR5cGVvZiBjb250ZW50ID09ICdzdHJpbmcnID8gY29udGVudCA6IGNvbnRlbnQudHh0O1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBkb2N1bWVudCBoYXMgbm8gbWFya3VwIGFuZCBubyBlbnRpdGllcy5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eX0gY29udGVudCAtIGNvbnRlbnQgdG8gY2hlY2sgZm9yIHByZXNlbmNlIG9mIG1hcmt1cC5cbiAqIEByZXR1cm5zIDxjb2RlPnRydWU8L2NvZGU+IGlzIGNvbnRlbnQgaXMgcGxhaW4gdGV4dCwgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAqL1xuRHJhZnR5LmlzUGxhaW5UZXh0ID0gZnVuY3Rpb24oY29udGVudCkge1xuICByZXR1cm4gdHlwZW9mIGNvbnRlbnQgPT0gJ3N0cmluZycgfHwgIShjb250ZW50LmZtdCB8fCBjb250ZW50LmVudCk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBvYmplY3QgcmVwcmVzZXRzIGlzIGEgdmFsaWQgRHJhZnR5IGRvY3VtZW50LlxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7RHJhZnR5fSBjb250ZW50IC0gY29udGVudCB0byBjaGVjayBmb3IgdmFsaWRpdHkuXG4gKiBAcmV0dXJucyA8Y29kZT50cnVlPC9jb2RlPiBpcyBjb250ZW50IGlzIHZhbGlkLCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICovXG5EcmFmdHkuaXNWYWxpZCA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgaWYgKCFjb250ZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3Qge1xuICAgIHR4dCxcbiAgICBmbXQsXG4gICAgZW50XG4gIH0gPSBjb250ZW50O1xuXG4gIGlmICghdHh0ICYmIHR4dCAhPT0gJycgJiYgIWZtdCAmJiAhZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgdHh0X3R5cGUgPSB0eXBlb2YgdHh0O1xuICBpZiAodHh0X3R5cGUgIT0gJ3N0cmluZycgJiYgdHh0X3R5cGUgIT0gJ3VuZGVmaW5lZCcgJiYgdHh0ICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBmbXQgIT0gJ3VuZGVmaW5lZCcgJiYgIUFycmF5LmlzQXJyYXkoZm10KSAmJiBmbXQgIT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIGVudCAhPSAndW5kZWZpbmVkJyAmJiAhQXJyYXkuaXNBcnJheShlbnQpICYmIGVudCAhPT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgZHJhZnR5IGRvY3VtZW50IGhhcyBhdHRhY2htZW50czogc3R5bGUgRVggYW5kIG91dHNpZGUgb2Ygbm9ybWFsIHJlbmRlcmluZyBmbG93LFxuICogaS5lLiA8Y29kZT5hdCA9IC0xPC9jb2RlPi5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eX0gY29udGVudCAtIGRvY3VtZW50IHRvIGNoZWNrIGZvciBhdHRhY2htZW50cy5cbiAqIEByZXR1cm5zIDxjb2RlPnRydWU8L2NvZGU+IGlmIHRoZXJlIGFyZSBhdHRhY2htZW50cy5cbiAqL1xuRHJhZnR5Lmhhc0F0dGFjaG1lbnRzID0gZnVuY3Rpb24oY29udGVudCkge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoY29udGVudC5mbXQpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZvciAobGV0IGkgaW4gY29udGVudC5mbXQpIHtcbiAgICBjb25zdCBmbXQgPSBjb250ZW50LmZtdFtpXTtcbiAgICBpZiAoZm10ICYmIGZtdC5hdCA8IDApIHtcbiAgICAgIGNvbnN0IGVudCA9IGNvbnRlbnQuZW50W2ZtdC5rZXkgfCAwXTtcbiAgICAgIHJldHVybiBlbnQgJiYgZW50LnRwID09ICdFWCcgJiYgZW50LmRhdGE7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDYWxsYmFjayBmb3IgYXBwbHlpbmcgY3VzdG9tIGZvcm1hdHRpbmcvdHJhbnNmb3JtYXRpb24gdG8gYSBEcmFmdHkgZG9jdW1lbnQuXG4gKiBDYWxsZWQgb25jZSBmb3IgZWFjaCBlbnRpdHkuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQGNhbGxiYWNrIEVudGl0eUNhbGxiYWNrXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YSBlbnRpdHkgZGF0YS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBlbnRpdHkgdHlwZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBlbnRpdHkncyBpbmRleCBpbiBgY29udGVudC5lbnRgLlxuICovXG5cbi8qKlxuICogRW51bWVyYXRlIGF0dGFjaG1lbnRzOiBzdHlsZSBFWCBhbmQgb3V0c2lkZSBvZiBub3JtYWwgcmVuZGVyaW5nIGZsb3csIGkuZS4gPGNvZGU+YXQgPSAtMTwvY29kZT4uXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl9IGNvbnRlbnQgLSBkb2N1bWVudCB0byBwcm9jZXNzIGZvciBhdHRhY2htZW50cy5cbiAqIEBwYXJhbSB7RW50aXR5Q2FsbGJhY2t9IGNhbGxiYWNrIC0gY2FsbGJhY2sgdG8gY2FsbCBmb3IgZWFjaCBhdHRhY2htZW50LlxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSB2YWx1ZSBvZiBcInRoaXNcIiBmb3IgY2FsbGJhY2suXG4gKi9cbkRyYWZ0eS5hdHRhY2htZW50cyA9IGZ1bmN0aW9uKGNvbnRlbnQsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShjb250ZW50LmZtdCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IGkgPSAwO1xuICBjb250ZW50LmZtdC5mb3JFYWNoKGZtdCA9PiB7XG4gICAgaWYgKGZtdCAmJiBmbXQuYXQgPCAwKSB7XG4gICAgICBjb25zdCBlbnQgPSBjb250ZW50LmVudFtmbXQua2V5IHwgMF07XG4gICAgICBpZiAoZW50ICYmIGVudC50cCA9PSAnRVgnICYmIGVudC5kYXRhKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgZW50LmRhdGEsIGkrKywgJ0VYJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgZHJhZnR5IGRvY3VtZW50IGhhcyBlbnRpdGllcy5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eX0gY29udGVudCAtIGRvY3VtZW50IHRvIGNoZWNrIGZvciBlbnRpdGllcy5cbiAqIEByZXR1cm5zIDxjb2RlPnRydWU8L2NvZGU+IGlmIHRoZXJlIGFyZSBlbnRpdGllcy5cbiAqL1xuRHJhZnR5Lmhhc0VudGl0aWVzID0gZnVuY3Rpb24oY29udGVudCkge1xuICByZXR1cm4gY29udGVudC5lbnQgJiYgY29udGVudC5lbnQubGVuZ3RoID4gMDtcbn1cblxuLyoqXG4gKiBFbnVtZXJhdGUgZW50aXRpZXMuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl9IGNvbnRlbnQgLSBkb2N1bWVudCB3aXRoIGVudGl0aWVzIHRvIGVudW1lcmF0ZS5cbiAqIEBwYXJhbSB7RW50aXR5Q2FsbGJhY2t9IGNhbGxiYWNrIC0gY2FsbGJhY2sgdG8gY2FsbCBmb3IgZWFjaCBlbnRpdHkuXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIHZhbHVlIG9mIFwidGhpc1wiIGZvciBjYWxsYmFjay5cbiAqL1xuRHJhZnR5LmVudGl0aWVzID0gZnVuY3Rpb24oY29udGVudCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgaWYgKGNvbnRlbnQuZW50ICYmIGNvbnRlbnQuZW50Lmxlbmd0aCA+IDApIHtcbiAgICBmb3IgKGxldCBpIGluIGNvbnRlbnQuZW50KSB7XG4gICAgICBpZiAoY29udGVudC5lbnRbaV0pIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbChjb250ZXh0LCBjb250ZW50LmVudFtpXS5kYXRhLCBpLCBjb250ZW50LmVudFtpXS50cCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlIHVucmVjb2duaXplZCBmaWVsZHMgZnJvbSBlbnRpdHkgZGF0YVxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7RHJhZnR5fSBjb250ZW50IC0gZG9jdW1lbnQgd2l0aCBlbnRpdGllcyB0byBlbnVtZXJhdGUuXG4gKiBAcmV0dXJucyBjb250ZW50LlxuICovXG5EcmFmdHkuc2FuaXRpemVFbnRpdGllcyA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQgJiYgY29udGVudC5lbnQgJiYgY29udGVudC5lbnQubGVuZ3RoID4gMCkge1xuICAgIGZvciAobGV0IGkgaW4gY29udGVudC5lbnQpIHtcbiAgICAgIGNvbnN0IGVudCA9IGNvbnRlbnQuZW50W2ldO1xuICAgICAgaWYgKGVudCAmJiBlbnQuZGF0YSkge1xuICAgICAgICBjb25zdCBkYXRhID0gY29weUVudERhdGEoZW50LmRhdGEpO1xuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgIGNvbnRlbnQuZW50W2ldLmRhdGEgPSBkYXRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBjb250ZW50LmVudFtpXS5kYXRhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG4vKipcbiAqIEdpdmVuIHRoZSBlbnRpdHksIGdldCBVUkwgd2hpY2ggY2FuIGJlIHVzZWQgZm9yIGRvd25sb2FkaW5nXG4gKiBlbnRpdHkgZGF0YS5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZW50RGF0YSAtIGVudGl0eS5kYXRhIHRvIGdldCB0aGUgVVJsIGZyb20uXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBVUkwgdG8gZG93bmxvYWQgZW50aXR5IGRhdGEgb3IgPGNvZGU+bnVsbDwvY29kZT4uXG4gKi9cbkRyYWZ0eS5nZXREb3dubG9hZFVybCA9IGZ1bmN0aW9uKGVudERhdGEpIHtcbiAgbGV0IHVybCA9IG51bGw7XG4gIGlmIChlbnREYXRhLm1pbWUgIT0gSlNPTl9NSU1FX1RZUEUgJiYgZW50RGF0YS52YWwpIHtcbiAgICB1cmwgPSBiYXNlNjR0b09iamVjdFVybChlbnREYXRhLnZhbCwgZW50RGF0YS5taW1lLCBEcmFmdHkubG9nZ2VyKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZW50RGF0YS5yZWYgPT0gJ3N0cmluZycpIHtcbiAgICB1cmwgPSBlbnREYXRhLnJlZjtcbiAgfVxuICByZXR1cm4gdXJsO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBlbnRpdHkgZGF0YSBpcyBub3QgcmVhZHkgZm9yIHNlbmRpbmcsIHN1Y2ggYXMgYmVpbmcgdXBsb2FkZWQgdG8gdGhlIHNlcnZlci5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZW50aXR5LmRhdGEgdG8gZ2V0IHRoZSBVUmwgZnJvbS5cbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHVwbG9hZCBpcyBpbiBwcm9ncmVzcywgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5EcmFmdHkuaXNQcm9jZXNzaW5nID0gZnVuY3Rpb24oZW50RGF0YSkge1xuICByZXR1cm4gISFlbnREYXRhLl9wcm9jZXNzaW5nO1xufVxuXG4vKipcbiAqIEdpdmVuIHRoZSBlbnRpdHksIGdldCBVUkwgd2hpY2ggY2FuIGJlIHVzZWQgZm9yIHByZXZpZXdpbmdcbiAqIHRoZSBlbnRpdHkuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVudGl0eS5kYXRhIHRvIGdldCB0aGUgVVJsIGZyb20uXG4gKlxuICogQHJldHVybnMge3N0cmluZ30gdXJsIGZvciBwcmV2aWV3aW5nIG9yIG51bGwgaWYgbm8gc3VjaCB1cmwgaXMgYXZhaWxhYmxlLlxuICovXG5EcmFmdHkuZ2V0UHJldmlld1VybCA9IGZ1bmN0aW9uKGVudERhdGEpIHtcbiAgcmV0dXJuIGVudERhdGEudmFsID8gYmFzZTY0dG9PYmplY3RVcmwoZW50RGF0YS52YWwsIGVudERhdGEubWltZSwgRHJhZnR5LmxvZ2dlcikgOiBudWxsO1xufVxuXG4vKipcbiAqIEdldCBhcHByb3hpbWF0ZSBzaXplIG9mIHRoZSBlbnRpdHkuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVudERhdGEgLSBlbnRpdHkuZGF0YSB0byBnZXQgdGhlIHNpemUgZm9yLlxuICogQHJldHVybnMge251bWJlcn0gc2l6ZSBvZiBlbnRpdHkgZGF0YSBpbiBieXRlcy5cbiAqL1xuRHJhZnR5LmdldEVudGl0eVNpemUgPSBmdW5jdGlvbihlbnREYXRhKSB7XG4gIC8vIEVpdGhlciBzaXplIGhpbnQgb3IgbGVuZ3RoIG9mIHZhbHVlLiBUaGUgdmFsdWUgaXMgYmFzZTY0IGVuY29kZWQsXG4gIC8vIHRoZSBhY3R1YWwgb2JqZWN0IHNpemUgaXMgc21hbGxlciB0aGFuIHRoZSBlbmNvZGVkIGxlbmd0aC5cbiAgcmV0dXJuIGVudERhdGEuc2l6ZSA/IGVudERhdGEuc2l6ZSA6IGVudERhdGEudmFsID8gKGVudERhdGEudmFsLmxlbmd0aCAqIDAuNzUpIHwgMCA6IDA7XG59XG5cbi8qKlxuICogR2V0IGVudGl0eSBtaW1lIHR5cGUuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVudERhdGEgLSBlbnRpdHkuZGF0YSB0byBnZXQgdGhlIHR5cGUgZm9yLlxuICogQHJldHVybnMge3N0cmluZ30gbWltZSB0eXBlIG9mIGVudGl0eS5cbiAqL1xuRHJhZnR5LmdldEVudGl0eU1pbWVUeXBlID0gZnVuY3Rpb24oZW50RGF0YSkge1xuICByZXR1cm4gZW50RGF0YS5taW1lIHx8ICd0ZXh0L3BsYWluJztcbn1cblxuLyoqXG4gKiBHZXQgSFRNTCB0YWcgZm9yIGEgZ2l2ZW4gdHdvLWxldHRlciBzdHlsZSBuYW1lLlxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHlsZSAtIHR3by1sZXR0ZXIgc3R5bGUsIGxpa2UgU1Qgb3IgTE4uXG4gKlxuICogQHJldHVybnMge3N0cmluZ30gSFRNTCB0YWcgbmFtZSBpZiBzdHlsZSBpcyBmb3VuZCwgJ19VTktOJyBpZiBub3QgZm91bmQsIHtjb2RlOiB1bmRlZmluZWR9IGlmIHN0eWxlIGlzIGZhbHNpc2guXG4gKi9cbkRyYWZ0eS50YWdOYW1lID0gZnVuY3Rpb24oc3R5bGUpIHtcbiAgcmV0dXJuIHN0eWxlID8gKEhUTUxfVEFHU1tzdHlsZV0gPyBIVE1MX1RBR1Nbc3R5bGVdLm5hbWUgOiAnX1VOS04nKSA6IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBGb3IgYSBnaXZlbiBkYXRhIGJ1bmRsZSBnZW5lcmF0ZSBhbiBvYmplY3Qgd2l0aCBIVE1MIGF0dHJpYnV0ZXMsXG4gKiBmb3IgaW5zdGFuY2UsIGdpdmVuIHt1cmw6IFwiaHR0cDovL3d3dy5leGFtcGxlLmNvbS9cIn0gcmV0dXJuXG4gKiB7aHJlZjogXCJodHRwOi8vd3d3LmV4YW1wbGUuY29tL1wifVxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHlsZSAtIHR3by1sZXR0ZXIgc3R5bGUgdG8gZ2VuZXJhdGUgYXR0cmlidXRlcyBmb3IuXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIGRhdGEgYnVuZGxlIHRvIGNvbnZlcnQgdG8gYXR0cmlidXRlc1xuICpcbiAqIEByZXR1cm5zIHtPYmplY3R9IG9iamVjdCB3aXRoIEhUTUwgYXR0cmlidXRlcy5cbiAqL1xuRHJhZnR5LmF0dHJWYWx1ZSA9IGZ1bmN0aW9uKHN0eWxlLCBkYXRhKSB7XG4gIGlmIChkYXRhICYmIERFQ09SQVRPUlNbc3R5bGVdKSB7XG4gICAgcmV0dXJuIERFQ09SQVRPUlNbc3R5bGVdLnByb3BzKGRhdGEpO1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBEcmFmdHkgTUlNRSB0eXBlLlxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEByZXR1cm5zIHtzdHJpbmd9IGNvbnRlbnQtVHlwZSBcInRleHQveC1kcmFmdHlcIi5cbiAqL1xuRHJhZnR5LmdldENvbnRlbnRUeXBlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBEUkFGVFlfTUlNRV9UWVBFO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PVxuLy8gVXRpbGl0eSBtZXRob2RzLlxuLy8gPT09PT09PT09PT09PT09PT1cblxuLy8gVGFrZSBhIHN0cmluZyBhbmQgZGVmaW5lZCBlYXJsaWVyIHN0eWxlIHNwYW5zLCByZS1jb21wb3NlIHRoZW0gaW50byBhIHRyZWUgd2hlcmUgZWFjaCBsZWFmIGlzXG4vLyBhIHNhbWUtc3R5bGUgKGluY2x1ZGluZyB1bnN0eWxlZCkgc3RyaW5nLiBJLmUuICdoZWxsbyAqYm9sZCBfaXRhbGljXyogYW5kIH5tb3JlfiB3b3JsZCcgLT5cbi8vICgnaGVsbG8gJywgKGI6ICdib2xkICcsIChpOiAnaXRhbGljJykpLCAnIGFuZCAnLCAoczogJ21vcmUnKSwgJyB3b3JsZCcpO1xuLy9cbi8vIFRoaXMgaXMgbmVlZGVkIGluIG9yZGVyIHRvIGNsZWFyIG1hcmt1cCwgaS5lLiAnaGVsbG8gKndvcmxkKicgLT4gJ2hlbGxvIHdvcmxkJyBhbmQgY29udmVydFxuLy8gcmFuZ2VzIGZyb20gbWFya3VwLWVkIG9mZnNldHMgdG8gcGxhaW4gdGV4dCBvZmZzZXRzLlxuZnVuY3Rpb24gY2h1bmtpZnkobGluZSwgc3RhcnQsIGVuZCwgc3BhbnMpIHtcbiAgY29uc3QgY2h1bmtzID0gW107XG5cbiAgaWYgKHNwYW5zLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgZm9yIChsZXQgaSBpbiBzcGFucykge1xuICAgIC8vIEdldCB0aGUgbmV4dCBjaHVuayBmcm9tIHRoZSBxdWV1ZVxuICAgIGNvbnN0IHNwYW4gPSBzcGFuc1tpXTtcblxuICAgIC8vIEdyYWIgdGhlIGluaXRpYWwgdW5zdHlsZWQgY2h1bmtcbiAgICBpZiAoc3Bhbi5hdCA+IHN0YXJ0KSB7XG4gICAgICBjaHVua3MucHVzaCh7XG4gICAgICAgIHR4dDogbGluZS5zbGljZShzdGFydCwgc3Bhbi5hdClcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEdyYWIgdGhlIHN0eWxlZCBjaHVuay4gSXQgbWF5IGluY2x1ZGUgc3ViY2h1bmtzLlxuICAgIGNvbnN0IGNodW5rID0ge1xuICAgICAgdHA6IHNwYW4udHBcbiAgICB9O1xuICAgIGNvbnN0IGNobGQgPSBjaHVua2lmeShsaW5lLCBzcGFuLmF0ICsgMSwgc3Bhbi5lbmQsIHNwYW4uY2hpbGRyZW4pO1xuICAgIGlmIChjaGxkLmxlbmd0aCA+IDApIHtcbiAgICAgIGNodW5rLmNoaWxkcmVuID0gY2hsZDtcbiAgICB9IGVsc2Uge1xuICAgICAgY2h1bmsudHh0ID0gc3Bhbi50eHQ7XG4gICAgfVxuICAgIGNodW5rcy5wdXNoKGNodW5rKTtcbiAgICBzdGFydCA9IHNwYW4uZW5kICsgMTsgLy8gJysxJyBpcyB0byBza2lwIHRoZSBmb3JtYXR0aW5nIGNoYXJhY3RlclxuICB9XG5cbiAgLy8gR3JhYiB0aGUgcmVtYWluaW5nIHVuc3R5bGVkIGNodW5rLCBhZnRlciB0aGUgbGFzdCBzcGFuXG4gIGlmIChzdGFydCA8IGVuZCkge1xuICAgIGNodW5rcy5wdXNoKHtcbiAgICAgIHR4dDogbGluZS5zbGljZShzdGFydCwgZW5kKVxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGNodW5rcztcbn1cblxuLy8gRGV0ZWN0IHN0YXJ0cyBhbmQgZW5kcyBvZiBmb3JtYXR0aW5nIHNwYW5zLiBVbmZvcm1hdHRlZCBzcGFucyBhcmVcbi8vIGlnbm9yZWQgYXQgdGhpcyBzdGFnZS5cbmZ1bmN0aW9uIHNwYW5uaWZ5KG9yaWdpbmFsLCByZV9zdGFydCwgcmVfZW5kLCB0eXBlKSB7XG4gIGNvbnN0IHJlc3VsdCA9IFtdO1xuICBsZXQgaW5kZXggPSAwO1xuICBsZXQgbGluZSA9IG9yaWdpbmFsLnNsaWNlKDApOyAvLyBtYWtlIGEgY29weTtcblxuICB3aGlsZSAobGluZS5sZW5ndGggPiAwKSB7XG4gICAgLy8gbWF0Y2hbMF07IC8vIG1hdGNoLCBsaWtlICcqYWJjKidcbiAgICAvLyBtYXRjaFsxXTsgLy8gbWF0Y2ggY2FwdHVyZWQgaW4gcGFyZW50aGVzaXMsIGxpa2UgJ2FiYydcbiAgICAvLyBtYXRjaFsnaW5kZXgnXTsgLy8gb2Zmc2V0IHdoZXJlIHRoZSBtYXRjaCBzdGFydGVkLlxuXG4gICAgLy8gRmluZCB0aGUgb3BlbmluZyB0b2tlbi5cbiAgICBjb25zdCBzdGFydCA9IHJlX3N0YXJ0LmV4ZWMobGluZSk7XG4gICAgaWYgKHN0YXJ0ID09IG51bGwpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIEJlY2F1c2UgamF2YXNjcmlwdCBSZWdFeHAgZG9lcyBub3Qgc3VwcG9ydCBsb29rYmVoaW5kLCB0aGUgYWN0dWFsIG9mZnNldCBtYXkgbm90IHBvaW50XG4gICAgLy8gYXQgdGhlIG1hcmt1cCBjaGFyYWN0ZXIuIEZpbmQgaXQgaW4gdGhlIG1hdGNoZWQgc3RyaW5nLlxuICAgIGxldCBzdGFydF9vZmZzZXQgPSBzdGFydFsnaW5kZXgnXSArIHN0YXJ0WzBdLmxhc3RJbmRleE9mKHN0YXJ0WzFdKTtcbiAgICAvLyBDbGlwIHRoZSBwcm9jZXNzZWQgcGFydCBvZiB0aGUgc3RyaW5nLlxuICAgIGxpbmUgPSBsaW5lLnNsaWNlKHN0YXJ0X29mZnNldCArIDEpO1xuICAgIC8vIHN0YXJ0X29mZnNldCBpcyBhbiBvZmZzZXQgd2l0aGluIHRoZSBjbGlwcGVkIHN0cmluZy4gQ29udmVydCB0byBvcmlnaW5hbCBpbmRleC5cbiAgICBzdGFydF9vZmZzZXQgKz0gaW5kZXg7XG4gICAgLy8gSW5kZXggbm93IHBvaW50IHRvIHRoZSBiZWdpbm5pbmcgb2YgJ2xpbmUnIHdpdGhpbiB0aGUgJ29yaWdpbmFsJyBzdHJpbmcuXG4gICAgaW5kZXggPSBzdGFydF9vZmZzZXQgKyAxO1xuXG4gICAgLy8gRmluZCB0aGUgbWF0Y2hpbmcgY2xvc2luZyB0b2tlbi5cbiAgICBjb25zdCBlbmQgPSByZV9lbmQgPyByZV9lbmQuZXhlYyhsaW5lKSA6IG51bGw7XG4gICAgaWYgKGVuZCA9PSBudWxsKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgbGV0IGVuZF9vZmZzZXQgPSBlbmRbJ2luZGV4J10gKyBlbmRbMF0uaW5kZXhPZihlbmRbMV0pO1xuICAgIC8vIENsaXAgdGhlIHByb2Nlc3NlZCBwYXJ0IG9mIHRoZSBzdHJpbmcuXG4gICAgbGluZSA9IGxpbmUuc2xpY2UoZW5kX29mZnNldCArIDEpO1xuICAgIC8vIFVwZGF0ZSBvZmZzZXRzXG4gICAgZW5kX29mZnNldCArPSBpbmRleDtcbiAgICAvLyBJbmRleCBub3cgcG9pbnRzIHRvIHRoZSBiZWdpbm5pbmcgb2YgJ2xpbmUnIHdpdGhpbiB0aGUgJ29yaWdpbmFsJyBzdHJpbmcuXG4gICAgaW5kZXggPSBlbmRfb2Zmc2V0ICsgMTtcblxuICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgIHR4dDogb3JpZ2luYWwuc2xpY2Uoc3RhcnRfb2Zmc2V0ICsgMSwgZW5kX29mZnNldCksXG4gICAgICBjaGlsZHJlbjogW10sXG4gICAgICBhdDogc3RhcnRfb2Zmc2V0LFxuICAgICAgZW5kOiBlbmRfb2Zmc2V0LFxuICAgICAgdHA6IHR5cGVcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIENvbnZlcnQgbGluZWFyIGFycmF5IG9yIHNwYW5zIGludG8gYSB0cmVlIHJlcHJlc2VudGF0aW9uLlxuLy8gS2VlcCBzdGFuZGFsb25lIGFuZCBuZXN0ZWQgc3BhbnMsIHRocm93IGF3YXkgcGFydGlhbGx5IG92ZXJsYXBwaW5nIHNwYW5zLlxuZnVuY3Rpb24gdG9TcGFuVHJlZShzcGFucykge1xuICBpZiAoc3BhbnMubGVuZ3RoID09IDApIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCB0cmVlID0gW3NwYW5zWzBdXTtcbiAgbGV0IGxhc3QgPSBzcGFuc1swXTtcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBzcGFucy5sZW5ndGg7IGkrKykge1xuICAgIC8vIEtlZXAgc3BhbnMgd2hpY2ggc3RhcnQgYWZ0ZXIgdGhlIGVuZCBvZiB0aGUgcHJldmlvdXMgc3BhbiBvciB0aG9zZSB3aGljaFxuICAgIC8vIGFyZSBjb21wbGV0ZSB3aXRoaW4gdGhlIHByZXZpb3VzIHNwYW4uXG4gICAgaWYgKHNwYW5zW2ldLmF0ID4gbGFzdC5lbmQpIHtcbiAgICAgIC8vIFNwYW4gaXMgY29tcGxldGVseSBvdXRzaWRlIG9mIHRoZSBwcmV2aW91cyBzcGFuLlxuICAgICAgdHJlZS5wdXNoKHNwYW5zW2ldKTtcbiAgICAgIGxhc3QgPSBzcGFuc1tpXTtcbiAgICB9IGVsc2UgaWYgKHNwYW5zW2ldLmVuZCA8PSBsYXN0LmVuZCkge1xuICAgICAgLy8gU3BhbiBpcyBmdWxseSBpbnNpZGUgb2YgdGhlIHByZXZpb3VzIHNwYW4uIFB1c2ggdG8gc3Vibm9kZS5cbiAgICAgIGxhc3QuY2hpbGRyZW4ucHVzaChzcGFuc1tpXSk7XG4gICAgfVxuICAgIC8vIFNwYW4gY291bGQgcGFydGlhbGx5IG92ZXJsYXAsIGlnbm9yaW5nIGl0IGFzIGludmFsaWQuXG4gIH1cblxuICAvLyBSZWN1cnNpdmVseSByZWFycmFuZ2UgdGhlIHN1Ym5vZGVzLlxuICBmb3IgKGxldCBpIGluIHRyZWUpIHtcbiAgICB0cmVlW2ldLmNoaWxkcmVuID0gdG9TcGFuVHJlZSh0cmVlW2ldLmNoaWxkcmVuKTtcbiAgfVxuXG4gIHJldHVybiB0cmVlO1xufVxuXG4vLyBDb252ZXJ0IGRyYWZ0eSBkb2N1bWVudCB0byBhIHRyZWUuXG5mdW5jdGlvbiBkcmFmdHlUb1RyZWUoZG9jKSB7XG4gIGlmICghZG9jKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBkb2MgPSAodHlwZW9mIGRvYyA9PSAnc3RyaW5nJykgPyB7XG4gICAgdHh0OiBkb2NcbiAgfSA6IGRvYztcbiAgbGV0IHtcbiAgICB0eHQsXG4gICAgZm10LFxuICAgIGVudFxuICB9ID0gZG9jO1xuXG4gIHR4dCA9IHR4dCB8fCAnJztcbiAgaWYgKCFBcnJheS5pc0FycmF5KGVudCkpIHtcbiAgICBlbnQgPSBbXTtcbiAgfVxuXG4gIGlmICghQXJyYXkuaXNBcnJheShmbXQpIHx8IGZtdC5sZW5ndGggPT0gMCkge1xuICAgIGlmIChlbnQubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRleHQ6IHR4dFxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlIHdoZW4gYWxsIHZhbHVlcyBpbiBmbXQgYXJlIDAgYW5kIGZtdCB0aGVyZWZvcmUgaXMgc2tpcHBlZC5cbiAgICBmbXQgPSBbe1xuICAgICAgYXQ6IDAsXG4gICAgICBsZW46IDAsXG4gICAgICBrZXk6IDBcbiAgICB9XTtcbiAgfVxuXG4gIC8vIFNhbml0aXplIHNwYW5zLlxuICBjb25zdCBzcGFucyA9IFtdO1xuICBjb25zdCBhdHRhY2htZW50cyA9IFtdO1xuICBmbXQuZm9yRWFjaCgoc3BhbikgPT4ge1xuICAgIGlmICghc3BhbiB8fCB0eXBlb2Ygc3BhbiAhPSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghWyd1bmRlZmluZWQnLCAnbnVtYmVyJ10uaW5jbHVkZXModHlwZW9mIHNwYW4uYXQpKSB7XG4gICAgICAvLyBQcmVzZW50LCBidXQgbm9uLW51bWVyaWMgJ2F0Jy5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFbJ3VuZGVmaW5lZCcsICdudW1iZXInXS5pbmNsdWRlcyh0eXBlb2Ygc3Bhbi5sZW4pKSB7XG4gICAgICAvLyBQcmVzZW50LCBidXQgbm9uLW51bWVyaWMgJ2xlbicuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBhdCA9IHNwYW4uYXQgfCAwO1xuICAgIGxldCBsZW4gPSBzcGFuLmxlbiB8IDA7XG4gICAgaWYgKGxlbiA8IDApIHtcbiAgICAgIC8vIEludmFsaWQgc3BhbiBsZW5ndGguXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGtleSA9IHNwYW4ua2V5IHx8IDA7XG4gICAgaWYgKGVudC5sZW5ndGggPiAwICYmICh0eXBlb2Yga2V5ICE9ICdudW1iZXInIHx8IGtleSA8IDAgfHwga2V5ID49IGVudC5sZW5ndGgpKSB7XG4gICAgICAvLyBJbnZhbGlkIGtleSB2YWx1ZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoYXQgPD0gLTEpIHtcbiAgICAgIC8vIEF0dGFjaG1lbnQuIFN0b3JlIGF0dGFjaG1lbnRzIHNlcGFyYXRlbHkuXG4gICAgICBhdHRhY2htZW50cy5wdXNoKHtcbiAgICAgICAgc3RhcnQ6IC0xLFxuICAgICAgICBlbmQ6IDAsXG4gICAgICAgIGtleToga2V5XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGF0ICsgbGVuID4gdHh0Lmxlbmd0aCkge1xuICAgICAgLy8gU3BhbiBpcyBvdXQgb2YgYm91bmRzLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghc3Bhbi50cCkge1xuICAgICAgaWYgKGVudC5sZW5ndGggPiAwICYmICh0eXBlb2YgZW50W2tleV0gPT0gJ29iamVjdCcpKSB7XG4gICAgICAgIHNwYW5zLnB1c2goe1xuICAgICAgICAgIHN0YXJ0OiBhdCxcbiAgICAgICAgICBlbmQ6IGF0ICsgbGVuLFxuICAgICAgICAgIGtleToga2V5XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzcGFucy5wdXNoKHtcbiAgICAgICAgdHlwZTogc3Bhbi50cCxcbiAgICAgICAgc3RhcnQ6IGF0LFxuICAgICAgICBlbmQ6IGF0ICsgbGVuXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIFNvcnQgc3BhbnMgZmlyc3QgYnkgc3RhcnQgaW5kZXggKGFzYykgdGhlbiBieSBsZW5ndGggKGRlc2MpLCB0aGVuIGJ5IHdlaWdodC5cbiAgc3BhbnMuc29ydCgoYSwgYikgPT4ge1xuICAgIGxldCBkaWZmID0gYS5zdGFydCAtIGIuc3RhcnQ7XG4gICAgaWYgKGRpZmYgIT0gMCkge1xuICAgICAgcmV0dXJuIGRpZmY7XG4gICAgfVxuICAgIGRpZmYgPSBiLmVuZCAtIGEuZW5kO1xuICAgIGlmIChkaWZmICE9IDApIHtcbiAgICAgIHJldHVybiBkaWZmO1xuICAgIH1cbiAgICByZXR1cm4gRk1UX1dFSUdIVC5pbmRleE9mKGIudHlwZSkgLSBGTVRfV0VJR0hULmluZGV4T2YoYS50eXBlKTtcbiAgfSk7XG5cbiAgLy8gTW92ZSBhdHRhY2htZW50cyB0byB0aGUgZW5kIG9mIHRoZSBsaXN0LlxuICBpZiAoYXR0YWNobWVudHMubGVuZ3RoID4gMCkge1xuICAgIHNwYW5zLnB1c2goLi4uYXR0YWNobWVudHMpO1xuICB9XG5cbiAgc3BhbnMuZm9yRWFjaCgoc3BhbikgPT4ge1xuICAgIGlmIChlbnQubGVuZ3RoID4gMCAmJiAhc3Bhbi50eXBlICYmIGVudFtzcGFuLmtleV0gJiYgdHlwZW9mIGVudFtzcGFuLmtleV0gPT0gJ29iamVjdCcpIHtcbiAgICAgIHNwYW4udHlwZSA9IGVudFtzcGFuLmtleV0udHA7XG4gICAgICBzcGFuLmRhdGEgPSBlbnRbc3Bhbi5rZXldLmRhdGE7XG4gICAgfVxuXG4gICAgLy8gSXMgdHlwZSBzdGlsbCB1bmRlZmluZWQ/IEhpZGUgdGhlIGludmFsaWQgZWxlbWVudCFcbiAgICBpZiAoIXNwYW4udHlwZSkge1xuICAgICAgc3Bhbi50eXBlID0gJ0hEJztcbiAgICB9XG4gIH0pO1xuXG4gIGxldCB0cmVlID0gc3BhbnNUb1RyZWUoe30sIHR4dCwgMCwgdHh0Lmxlbmd0aCwgc3BhbnMpO1xuXG4gIC8vIEZsYXR0ZW4gdHJlZSBub2Rlcy5cbiAgY29uc3QgZmxhdHRlbiA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShub2RlLmNoaWxkcmVuKSAmJiBub2RlLmNoaWxkcmVuLmxlbmd0aCA9PSAxKSB7XG4gICAgICAvLyBVbndyYXAuXG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5bMF07XG4gICAgICBpZiAoIW5vZGUudHlwZSkge1xuICAgICAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudDtcbiAgICAgICAgbm9kZSA9IGNoaWxkO1xuICAgICAgICBub2RlLnBhcmVudCA9IHBhcmVudDtcbiAgICAgIH0gZWxzZSBpZiAoIWNoaWxkLnR5cGUgJiYgIWNoaWxkLmNoaWxkcmVuKSB7XG4gICAgICAgIG5vZGUudGV4dCA9IGNoaWxkLnRleHQ7XG4gICAgICAgIGRlbGV0ZSBub2RlLmNoaWxkcmVuO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuICB0cmVlID0gdHJlZVRvcERvd24odHJlZSwgZmxhdHRlbik7XG5cbiAgcmV0dXJuIHRyZWU7XG59XG5cbi8vIEFkZCB0cmVlIG5vZGUgdG8gYSBwYXJlbnQgdHJlZS5cbmZ1bmN0aW9uIGFkZE5vZGUocGFyZW50LCBuKSB7XG4gIGlmICghbikge1xuICAgIHJldHVybiBwYXJlbnQ7XG4gIH1cblxuICBpZiAoIXBhcmVudC5jaGlsZHJlbikge1xuICAgIHBhcmVudC5jaGlsZHJlbiA9IFtdO1xuICB9XG5cbiAgLy8gSWYgdGV4dCBpcyBwcmVzZW50LCBtb3ZlIGl0IHRvIGEgc3Vibm9kZS5cbiAgaWYgKHBhcmVudC50ZXh0KSB7XG4gICAgcGFyZW50LmNoaWxkcmVuLnB1c2goe1xuICAgICAgdGV4dDogcGFyZW50LnRleHQsXG4gICAgICBwYXJlbnQ6IHBhcmVudFxuICAgIH0pO1xuICAgIGRlbGV0ZSBwYXJlbnQudGV4dDtcbiAgfVxuXG4gIG4ucGFyZW50ID0gcGFyZW50O1xuICBwYXJlbnQuY2hpbGRyZW4ucHVzaChuKTtcblxuICByZXR1cm4gcGFyZW50O1xufVxuXG4vLyBSZXR1cm5zIGEgdHJlZSBvZiBub2Rlcy5cbmZ1bmN0aW9uIHNwYW5zVG9UcmVlKHBhcmVudCwgdGV4dCwgc3RhcnQsIGVuZCwgc3BhbnMpIHtcbiAgaWYgKCFzcGFucyB8fCBzcGFucy5sZW5ndGggPT0gMCkge1xuICAgIGlmIChzdGFydCA8IGVuZCkge1xuICAgICAgYWRkTm9kZShwYXJlbnQsIHtcbiAgICAgICAgdGV4dDogdGV4dC5zdWJzdHJpbmcoc3RhcnQsIGVuZClcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcGFyZW50O1xuICB9XG5cbiAgLy8gUHJvY2VzcyBzdWJzcGFucy5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzcGFucy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHNwYW4gPSBzcGFuc1tpXTtcbiAgICBpZiAoc3Bhbi5zdGFydCA8IDAgJiYgc3Bhbi50eXBlID09ICdFWCcpIHtcbiAgICAgIGFkZE5vZGUocGFyZW50LCB7XG4gICAgICAgIHR5cGU6IHNwYW4udHlwZSxcbiAgICAgICAgZGF0YTogc3Bhbi5kYXRhLFxuICAgICAgICBrZXk6IHNwYW4ua2V5LFxuICAgICAgICBhdHQ6IHRydWVcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gQWRkIHVuLXN0eWxlZCByYW5nZSBiZWZvcmUgdGhlIHN0eWxlZCBzcGFuIHN0YXJ0cy5cbiAgICBpZiAoc3RhcnQgPCBzcGFuLnN0YXJ0KSB7XG4gICAgICBhZGROb2RlKHBhcmVudCwge1xuICAgICAgICB0ZXh0OiB0ZXh0LnN1YnN0cmluZyhzdGFydCwgc3Bhbi5zdGFydClcbiAgICAgIH0pO1xuICAgICAgc3RhcnQgPSBzcGFuLnN0YXJ0O1xuICAgIH1cblxuICAgIC8vIEdldCBhbGwgc3BhbnMgd2hpY2ggYXJlIHdpdGhpbiB0aGUgY3VycmVudCBzcGFuLlxuICAgIGNvbnN0IHN1YnNwYW5zID0gW107XG4gICAgd2hpbGUgKGkgPCBzcGFucy5sZW5ndGggLSAxKSB7XG4gICAgICBjb25zdCBpbm5lciA9IHNwYW5zW2kgKyAxXTtcbiAgICAgIGlmIChpbm5lci5zdGFydCA8IDApIHtcbiAgICAgICAgLy8gQXR0YWNobWVudHMgYXJlIGluIHRoZSBlbmQuIFN0b3AuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBlbHNlIGlmIChpbm5lci5zdGFydCA8IHNwYW4uZW5kKSB7XG4gICAgICAgIGlmIChpbm5lci5lbmQgPD0gc3Bhbi5lbmQpIHtcbiAgICAgICAgICBjb25zdCB0YWcgPSBIVE1MX1RBR1NbaW5uZXIudHBdIHx8IHt9O1xuICAgICAgICAgIGlmIChpbm5lci5zdGFydCA8IGlubmVyLmVuZCB8fCB0YWcuaXNWb2lkKSB7XG4gICAgICAgICAgICAvLyBWYWxpZCBzdWJzcGFuOiBjb21wbGV0ZWx5IHdpdGhpbiB0aGUgY3VycmVudCBzcGFuIGFuZFxuICAgICAgICAgICAgLy8gZWl0aGVyIG5vbi16ZXJvIGxlbmd0aCBvciB6ZXJvIGxlbmd0aCBpcyBhY2NlcHRhYmxlLlxuICAgICAgICAgICAgc3Vic3BhbnMucHVzaChpbm5lcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGkrKztcbiAgICAgICAgLy8gT3ZlcmxhcHBpbmcgc3Vic3BhbnMgYXJlIGlnbm9yZWQuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBQYXN0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgc3Bhbi4gU3RvcC5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYWRkTm9kZShwYXJlbnQsIHNwYW5zVG9UcmVlKHtcbiAgICAgIHR5cGU6IHNwYW4udHlwZSxcbiAgICAgIGRhdGE6IHNwYW4uZGF0YSxcbiAgICAgIGtleTogc3Bhbi5rZXlcbiAgICB9LCB0ZXh0LCBzdGFydCwgc3Bhbi5lbmQsIHN1YnNwYW5zKSk7XG4gICAgc3RhcnQgPSBzcGFuLmVuZDtcbiAgfVxuXG4gIC8vIEFkZCB0aGUgbGFzdCB1bmZvcm1hdHRlZCByYW5nZS5cbiAgaWYgKHN0YXJ0IDwgZW5kKSB7XG4gICAgYWRkTm9kZShwYXJlbnQsIHtcbiAgICAgIHRleHQ6IHRleHQuc3Vic3RyaW5nKHN0YXJ0LCBlbmQpXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcGFyZW50O1xufVxuXG4vLyBBcHBlbmQgYSB0cmVlIHRvIGEgRHJhZnR5IGRvYy5cbmZ1bmN0aW9uIHRyZWVUb0RyYWZ0eShkb2MsIHRyZWUsIGtleW1hcCkge1xuICBpZiAoIXRyZWUpIHtcbiAgICByZXR1cm4gZG9jO1xuICB9XG5cbiAgZG9jLnR4dCA9IGRvYy50eHQgfHwgJyc7XG5cbiAgLy8gQ2hlY2twb2ludCB0byBtZWFzdXJlIGxlbmd0aCBvZiB0aGUgY3VycmVudCB0cmVlIG5vZGUuXG4gIGNvbnN0IHN0YXJ0ID0gZG9jLnR4dC5sZW5ndGg7XG5cbiAgaWYgKHRyZWUudGV4dCkge1xuICAgIGRvYy50eHQgKz0gdHJlZS50ZXh0O1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodHJlZS5jaGlsZHJlbikpIHtcbiAgICB0cmVlLmNoaWxkcmVuLmZvckVhY2goKGMpID0+IHtcbiAgICAgIHRyZWVUb0RyYWZ0eShkb2MsIGMsIGtleW1hcCk7XG4gICAgfSk7XG4gIH1cblxuICBpZiAodHJlZS50eXBlKSB7XG4gICAgY29uc3QgbGVuID0gZG9jLnR4dC5sZW5ndGggLSBzdGFydDtcbiAgICBkb2MuZm10ID0gZG9jLmZtdCB8fCBbXTtcbiAgICBpZiAoT2JqZWN0LmtleXModHJlZS5kYXRhIHx8IHt9KS5sZW5ndGggPiAwKSB7XG4gICAgICBkb2MuZW50ID0gZG9jLmVudCB8fCBbXTtcbiAgICAgIGNvbnN0IG5ld0tleSA9ICh0eXBlb2Yga2V5bWFwW3RyZWUua2V5XSA9PSAndW5kZWZpbmVkJykgPyBkb2MuZW50Lmxlbmd0aCA6IGtleW1hcFt0cmVlLmtleV07XG4gICAgICBrZXltYXBbdHJlZS5rZXldID0gbmV3S2V5O1xuICAgICAgZG9jLmVudFtuZXdLZXldID0ge1xuICAgICAgICB0cDogdHJlZS50eXBlLFxuICAgICAgICBkYXRhOiB0cmVlLmRhdGFcbiAgICAgIH07XG4gICAgICBpZiAodHJlZS5hdHQpIHtcbiAgICAgICAgLy8gQXR0YWNobWVudC5cbiAgICAgICAgZG9jLmZtdC5wdXNoKHtcbiAgICAgICAgICBhdDogLTEsXG4gICAgICAgICAgbGVuOiAwLFxuICAgICAgICAgIGtleTogbmV3S2V5XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9jLmZtdC5wdXNoKHtcbiAgICAgICAgICBhdDogc3RhcnQsXG4gICAgICAgICAgbGVuOiBsZW4sXG4gICAgICAgICAga2V5OiBuZXdLZXlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvYy5mbXQucHVzaCh7XG4gICAgICAgIHRwOiB0cmVlLnR5cGUsXG4gICAgICAgIGF0OiBzdGFydCxcbiAgICAgICAgbGVuOiBsZW5cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZG9jO1xufVxuXG4vLyBUcmF2ZXJzZSB0aGUgdHJlZSB0b3AgZG93biB0cmFuc2Zvcm1pbmcgdGhlIG5vZGVzOiBhcHBseSB0cmFuc2Zvcm1lciB0byBldmVyeSB0cmVlIG5vZGUuXG5mdW5jdGlvbiB0cmVlVG9wRG93bihzcmMsIHRyYW5zZm9ybWVyLCBjb250ZXh0KSB7XG4gIGlmICghc3JjKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBsZXQgZHN0ID0gdHJhbnNmb3JtZXIuY2FsbChjb250ZXh0LCBzcmMpO1xuICBpZiAoIWRzdCB8fCAhZHN0LmNoaWxkcmVuKSB7XG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIGNvbnN0IGNoaWxkcmVuID0gW107XG4gIGZvciAobGV0IGkgaW4gZHN0LmNoaWxkcmVuKSB7XG4gICAgbGV0IG4gPSBkc3QuY2hpbGRyZW5baV07XG4gICAgaWYgKG4pIHtcbiAgICAgIG4gPSB0cmVlVG9wRG93bihuLCB0cmFuc2Zvcm1lciwgY29udGV4dCk7XG4gICAgICBpZiAobikge1xuICAgICAgICBjaGlsZHJlbi5wdXNoKG4pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChjaGlsZHJlbi5sZW5ndGggPT0gMCkge1xuICAgIGRzdC5jaGlsZHJlbiA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgZHN0LmNoaWxkcmVuID0gY2hpbGRyZW47XG4gIH1cblxuICByZXR1cm4gZHN0O1xufVxuXG4vLyBUcmF2ZXJzZSB0aGUgdHJlZSBib3R0b20tdXA6IGFwcGx5IGZvcm1hdHRlciB0byBldmVyeSBub2RlLlxuLy8gVGhlIGZvcm1hdHRlciBtdXN0IG1haW50YWluIGl0cyBzdGF0ZSB0aHJvdWdoIGNvbnRleHQuXG5mdW5jdGlvbiB0cmVlQm90dG9tVXAoc3JjLCBmb3JtYXR0ZXIsIGluZGV4LCBzdGFjaywgY29udGV4dCkge1xuICBpZiAoIXNyYykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKHN0YWNrICYmIHNyYy50eXBlKSB7XG4gICAgc3RhY2sucHVzaChzcmMudHlwZSk7XG4gIH1cblxuICBsZXQgdmFsdWVzID0gW107XG4gIGZvciAobGV0IGkgaW4gc3JjLmNoaWxkcmVuKSB7XG4gICAgY29uc3QgbiA9IHRyZWVCb3R0b21VcChzcmMuY2hpbGRyZW5baV0sIGZvcm1hdHRlciwgaSwgc3RhY2ssIGNvbnRleHQpO1xuICAgIGlmIChuKSB7XG4gICAgICB2YWx1ZXMucHVzaChuKTtcbiAgICB9XG4gIH1cbiAgaWYgKHZhbHVlcy5sZW5ndGggPT0gMCkge1xuICAgIGlmIChzcmMudGV4dCkge1xuICAgICAgdmFsdWVzID0gW3NyYy50ZXh0XTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWVzID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBpZiAoc3RhY2sgJiYgc3JjLnR5cGUpIHtcbiAgICBzdGFjay5wb3AoKTtcbiAgfVxuXG4gIHJldHVybiBmb3JtYXR0ZXIuY2FsbChjb250ZXh0LCBzcmMudHlwZSwgc3JjLmRhdGEsIHZhbHVlcywgaW5kZXgsIHN0YWNrKTtcbn1cblxuLy8gQ2xpcCB0cmVlIHRvIHRoZSBwcm92aWRlZCBsaW1pdC5cbmZ1bmN0aW9uIHNob3J0ZW5UcmVlKHRyZWUsIGxpbWl0LCB0YWlsKSB7XG4gIGlmICghdHJlZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKHRhaWwpIHtcbiAgICBsaW1pdCAtPSB0YWlsLmxlbmd0aDtcbiAgfVxuXG4gIGNvbnN0IHNob3J0ZW5lciA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBpZiAobGltaXQgPD0gLTEpIHtcbiAgICAgIC8vIExpbWl0IC0xIG1lYW5zIHRoZSBkb2Mgd2FzIGFscmVhZHkgY2xpcHBlZC5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChub2RlLmF0dCkge1xuICAgICAgLy8gQXR0YWNobWVudHMgYXJlIHVuY2hhbmdlZC5cbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBpZiAobGltaXQgPT0gMCkge1xuICAgICAgbm9kZS50ZXh0ID0gdGFpbDtcbiAgICAgIGxpbWl0ID0gLTE7XG4gICAgfSBlbHNlIGlmIChub2RlLnRleHQpIHtcbiAgICAgIGNvbnN0IGxlbiA9IG5vZGUudGV4dC5sZW5ndGg7XG4gICAgICBpZiAobGVuID4gbGltaXQpIHtcbiAgICAgICAgbm9kZS50ZXh0ID0gbm9kZS50ZXh0LnN1YnN0cmluZygwLCBsaW1pdCkgKyB0YWlsO1xuICAgICAgICBsaW1pdCA9IC0xO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGltaXQgLT0gbGVuO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHJldHVybiB0cmVlVG9wRG93bih0cmVlLCBzaG9ydGVuZXIpO1xufVxuXG4vLyBTdHJpcCBoZWF2eSBlbnRpdGllcyBmcm9tIGEgdHJlZS5cbmZ1bmN0aW9uIGxpZ2h0RW50aXR5KHRyZWUsIGFsbG93KSB7XG4gIGNvbnN0IGxpZ2h0Q29weSA9IChub2RlKSA9PiB7XG4gICAgY29uc3QgZGF0YSA9IGNvcHlFbnREYXRhKG5vZGUuZGF0YSwgdHJ1ZSwgYWxsb3cgPyBhbGxvdyhub2RlKSA6IG51bGwpO1xuICAgIGlmIChkYXRhKSB7XG4gICAgICBub2RlLmRhdGEgPSBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgbm9kZS5kYXRhO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuICByZXR1cm4gdHJlZVRvcERvd24odHJlZSwgbGlnaHRDb3B5KTtcbn1cblxuLy8gUmVtb3ZlIHNwYWNlcyBhbmQgYnJlYWtzIG9uIHRoZSBsZWZ0LlxuZnVuY3Rpb24gbFRyaW0odHJlZSkge1xuICBpZiAodHJlZS50eXBlID09ICdCUicpIHtcbiAgICB0cmVlID0gbnVsbDtcbiAgfSBlbHNlIGlmICh0cmVlLnRleHQpIHtcbiAgICBpZiAoIXRyZWUudHlwZSkge1xuICAgICAgdHJlZS50ZXh0ID0gdHJlZS50ZXh0LnRyaW1TdGFydCgpO1xuICAgICAgaWYgKCF0cmVlLnRleHQpIHtcbiAgICAgICAgdHJlZSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKCF0cmVlLnR5cGUgJiYgdHJlZS5jaGlsZHJlbiAmJiB0cmVlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBjID0gbFRyaW0odHJlZS5jaGlsZHJlblswXSk7XG4gICAgaWYgKGMpIHtcbiAgICAgIHRyZWUuY2hpbGRyZW5bMF0gPSBjO1xuICAgIH0gZWxzZSB7XG4gICAgICB0cmVlLmNoaWxkcmVuLnNoaWZ0KCk7XG4gICAgICBpZiAoIXRyZWUudHlwZSAmJiB0cmVlLmNoaWxkcmVuLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHRyZWUgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJlZTtcbn1cblxuLy8gTW92ZSBhdHRhY2htZW50cyB0byB0aGUgZW5kLiBBdHRhY2htZW50cyBtdXN0IGJlIGF0IHRoZSB0b3AgbGV2ZWwsIG5vIG5lZWQgdG8gdHJhdmVyc2UgdGhlIHRyZWUuXG5mdW5jdGlvbiBhdHRhY2htZW50c1RvRW5kKHRyZWUsIGxpbWl0KSB7XG4gIGlmICghdHJlZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKHRyZWUuYXR0KSB7XG4gICAgdHJlZS50ZXh0ID0gJyAnO1xuICAgIGRlbGV0ZSB0cmVlLmF0dDtcbiAgICBkZWxldGUgdHJlZS5jaGlsZHJlbjtcbiAgfSBlbHNlIGlmICh0cmVlLmNoaWxkcmVuKSB7XG4gICAgY29uc3QgYXR0YWNobWVudHMgPSBbXTtcbiAgICBjb25zdCBjaGlsZHJlbiA9IFtdO1xuICAgIGZvciAobGV0IGkgaW4gdHJlZS5jaGlsZHJlbikge1xuICAgICAgY29uc3QgYyA9IHRyZWUuY2hpbGRyZW5baV07XG4gICAgICBpZiAoYy5hdHQpIHtcbiAgICAgICAgaWYgKGF0dGFjaG1lbnRzLmxlbmd0aCA9PSBsaW1pdCkge1xuICAgICAgICAgIC8vIFRvbyBtYW55IGF0dGFjaG1lbnRzIHRvIHByZXZpZXc7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGMuZGF0YVsnbWltZSddID09IEpTT05fTUlNRV9UWVBFKSB7XG4gICAgICAgICAgLy8gSlNPTiBhdHRhY2htZW50cyBhcmUgbm90IHNob3duIGluIHByZXZpZXcuXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBkZWxldGUgYy5hdHQ7XG4gICAgICAgIGRlbGV0ZSBjLmNoaWxkcmVuO1xuICAgICAgICBjLnRleHQgPSAnICc7XG4gICAgICAgIGF0dGFjaG1lbnRzLnB1c2goYyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGlsZHJlbi5wdXNoKGMpO1xuICAgICAgfVxuICAgIH1cbiAgICB0cmVlLmNoaWxkcmVuID0gY2hpbGRyZW4uY29uY2F0KGF0dGFjaG1lbnRzKTtcbiAgfVxuICByZXR1cm4gdHJlZTtcbn1cblxuLy8gR2V0IGEgbGlzdCBvZiBlbnRpdGllcyBmcm9tIGEgdGV4dC5cbmZ1bmN0aW9uIGV4dHJhY3RFbnRpdGllcyhsaW5lKSB7XG4gIGxldCBtYXRjaDtcbiAgbGV0IGV4dHJhY3RlZCA9IFtdO1xuICBFTlRJVFlfVFlQRVMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgd2hpbGUgKChtYXRjaCA9IGVudGl0eS5yZS5leGVjKGxpbmUpKSAhPT0gbnVsbCkge1xuICAgICAgZXh0cmFjdGVkLnB1c2goe1xuICAgICAgICBvZmZzZXQ6IG1hdGNoWydpbmRleCddLFxuICAgICAgICBsZW46IG1hdGNoWzBdLmxlbmd0aCxcbiAgICAgICAgdW5pcXVlOiBtYXRjaFswXSxcbiAgICAgICAgZGF0YTogZW50aXR5LnBhY2sobWF0Y2hbMF0pLFxuICAgICAgICB0eXBlOiBlbnRpdHkubmFtZVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAoZXh0cmFjdGVkLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuIGV4dHJhY3RlZDtcbiAgfVxuXG4gIC8vIFJlbW92ZSBlbnRpdGllcyBkZXRlY3RlZCBpbnNpZGUgb3RoZXIgZW50aXRpZXMsIGxpa2UgI2hhc2h0YWcgaW4gYSBVUkwuXG4gIGV4dHJhY3RlZC5zb3J0KChhLCBiKSA9PiB7XG4gICAgcmV0dXJuIGEub2Zmc2V0IC0gYi5vZmZzZXQ7XG4gIH0pO1xuXG4gIGxldCBpZHggPSAtMTtcbiAgZXh0cmFjdGVkID0gZXh0cmFjdGVkLmZpbHRlcigoZWwpID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSAoZWwub2Zmc2V0ID4gaWR4KTtcbiAgICBpZHggPSBlbC5vZmZzZXQgKyBlbC5sZW47XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSk7XG5cbiAgcmV0dXJuIGV4dHJhY3RlZDtcbn1cblxuLy8gQ29udmVydCB0aGUgY2h1bmtzIGludG8gZm9ybWF0IHN1aXRhYmxlIGZvciBzZXJpYWxpemF0aW9uLlxuZnVuY3Rpb24gZHJhZnRpZnkoY2h1bmtzLCBzdGFydEF0KSB7XG4gIGxldCBwbGFpbiA9ICcnO1xuICBsZXQgcmFuZ2VzID0gW107XG4gIGZvciAobGV0IGkgaW4gY2h1bmtzKSB7XG4gICAgY29uc3QgY2h1bmsgPSBjaHVua3NbaV07XG4gICAgaWYgKCFjaHVuay50eHQpIHtcbiAgICAgIGNvbnN0IGRyYWZ0eSA9IGRyYWZ0aWZ5KGNodW5rLmNoaWxkcmVuLCBwbGFpbi5sZW5ndGggKyBzdGFydEF0KTtcbiAgICAgIGNodW5rLnR4dCA9IGRyYWZ0eS50eHQ7XG4gICAgICByYW5nZXMgPSByYW5nZXMuY29uY2F0KGRyYWZ0eS5mbXQpO1xuICAgIH1cblxuICAgIGlmIChjaHVuay50cCkge1xuICAgICAgcmFuZ2VzLnB1c2goe1xuICAgICAgICBhdDogcGxhaW4ubGVuZ3RoICsgc3RhcnRBdCxcbiAgICAgICAgbGVuOiBjaHVuay50eHQubGVuZ3RoLFxuICAgICAgICB0cDogY2h1bmsudHBcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHBsYWluICs9IGNodW5rLnR4dDtcbiAgfVxuICByZXR1cm4ge1xuICAgIHR4dDogcGxhaW4sXG4gICAgZm10OiByYW5nZXNcbiAgfTtcbn1cblxuLy8gQ3JlYXRlIGEgY29weSBvZiBlbnRpdHkgZGF0YSB3aXRoIChsaWdodD1mYWxzZSkgb3Igd2l0aG91dCAobGlnaHQ9dHJ1ZSkgdGhlIGxhcmdlIHBheWxvYWQuXG4vLyBUaGUgYXJyYXkgJ2FsbG93JyBjb250YWlucyBhIGxpc3Qgb2YgZmllbGRzIGV4ZW1wdCBmcm9tIHN0cmlwcGluZy5cbmZ1bmN0aW9uIGNvcHlFbnREYXRhKGRhdGEsIGxpZ2h0LCBhbGxvdykge1xuICBpZiAoZGF0YSAmJiBPYmplY3QuZW50cmllcyhkYXRhKS5sZW5ndGggPiAwKSB7XG4gICAgYWxsb3cgPSBhbGxvdyB8fCBbXTtcbiAgICBjb25zdCBkYyA9IHt9O1xuICAgIEFMTE9XRURfRU5UX0ZJRUxEUy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGlmIChkYXRhW2tleV0pIHtcbiAgICAgICAgaWYgKGxpZ2h0ICYmICFhbGxvdy5pbmNsdWRlcyhrZXkpICYmXG4gICAgICAgICAgKHR5cGVvZiBkYXRhW2tleV0gPT0gJ3N0cmluZycgfHwgQXJyYXkuaXNBcnJheShkYXRhW2tleV0pKSAmJlxuICAgICAgICAgIGRhdGFba2V5XS5sZW5ndGggPiBNQVhfUFJFVklFV19EQVRBX1NJWkUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2tleV0gPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZGNba2V5XSA9IGRhdGFba2V5XTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChPYmplY3QuZW50cmllcyhkYykubGVuZ3RoICE9IDApIHtcbiAgICAgIHJldHVybiBkYztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gRHJhZnR5O1xufVxuIiwiLyoqXG4gKiBAZmlsZSBVdGlsaXRpZXMgZm9yIHVwbG9hZGluZyBhbmQgZG93bmxvYWRpbmcgZmlsZXMuXG4gKlxuICogQGNvcHlyaWdodCAyMDE1LTIwMjIgVGlub2RlIExMQy5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge1xuICBqc29uUGFyc2VIZWxwZXJcbn0gZnJvbSAnLi91dGlscy5qcyc7XG5cbmxldCBYSFJQcm92aWRlcjtcblxuLyoqXG4gKiBAY2xhc3MgTGFyZ2VGaWxlSGVscGVyIC0gdXRpbGl0aWVzIGZvciB1cGxvYWRpbmcgYW5kIGRvd25sb2FkaW5nIGZpbGVzIG91dCBvZiBiYW5kLlxuICogRG9uJ3QgaW5zdGFudGlhdGUgdGhpcyBjbGFzcyBkaXJlY3RseS4gVXNlIHtUaW5vZGUuZ2V0TGFyZ2VGaWxlSGVscGVyfSBpbnN0ZWFkLlxuICogQG1lbWJlcm9mIFRpbm9kZVxuICpcbiAqIEBwYXJhbSB7VGlub2RlfSB0aW5vZGUgLSB0aGUgbWFpbiBUaW5vZGUgb2JqZWN0LlxuICogQHBhcmFtIHtzdHJpbmd9IHZlcnNpb24gLSBwcm90b2NvbCB2ZXJzaW9uLCBpLmUuICcwJy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGFyZ2VGaWxlSGVscGVyIHtcbiAgY29uc3RydWN0b3IodGlub2RlLCB2ZXJzaW9uKSB7XG4gICAgdGhpcy5fdGlub2RlID0gdGlub2RlO1xuICAgIHRoaXMuX3ZlcnNpb24gPSB2ZXJzaW9uO1xuXG4gICAgdGhpcy5fYXBpS2V5ID0gdGlub2RlLl9hcGlLZXk7XG4gICAgdGhpcy5fYXV0aFRva2VuID0gdGlub2RlLmdldEF1dGhUb2tlbigpO1xuICAgIHRoaXMuX3JlcUlkID0gdGlub2RlLmdldE5leHRVbmlxdWVJZCgpO1xuICAgIHRoaXMueGhyID0gbmV3IFhIUlByb3ZpZGVyKCk7XG5cbiAgICAvLyBQcm9taXNlXG4gICAgdGhpcy50b1Jlc29sdmUgPSBudWxsO1xuICAgIHRoaXMudG9SZWplY3QgPSBudWxsO1xuXG4gICAgLy8gQ2FsbGJhY2tzXG4gICAgdGhpcy5vblByb2dyZXNzID0gbnVsbDtcbiAgICB0aGlzLm9uU3VjY2VzcyA9IG51bGw7XG4gICAgdGhpcy5vbkZhaWx1cmUgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHVwbG9hZGluZyB0aGUgZmlsZSB0byBhIG5vbi1kZWZhdWx0IGVuZHBvaW50LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkxhcmdlRmlsZUhlbHBlciNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVcmwgYWx0ZXJuYXRpdmUgYmFzZSBVUkwgb2YgdXBsb2FkIHNlcnZlci5cbiAgICogQHBhcmFtIHtGaWxlfEJsb2J9IGRhdGEgdG8gdXBsb2FkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXZhdGFyRm9yIHRvcGljIG5hbWUgaWYgdGhlIHVwbG9hZCByZXByZXNlbnRzIGFuIGF2YXRhci5cbiAgICogQHBhcmFtIHtDYWxsYmFja30gb25Qcm9ncmVzcyBjYWxsYmFjay4gVGFrZXMgb25lIHtmbG9hdH0gcGFyYW1ldGVyIDAuLjFcbiAgICogQHBhcmFtIHtDYWxsYmFja30gb25TdWNjZXNzIGNhbGxiYWNrLiBDYWxsZWQgd2hlbiB0aGUgZmlsZSBpcyBzdWNjZXNzZnVsbHkgdXBsb2FkZWQuXG4gICAqIEBwYXJhbSB7Q2FsbGJhY2t9IG9uRmFpbHVyZSBjYWxsYmFjay4gQ2FsbGVkIGluIGNhc2Ugb2YgYSBmYWlsdXJlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgdXBsb2FkIGlzIGNvbXBsZXRlZC9mYWlsZWQuXG4gICAqL1xuICB1cGxvYWRXaXRoQmFzZVVybChiYXNlVXJsLCBkYXRhLCBhdmF0YXJGb3IsIG9uUHJvZ3Jlc3MsIG9uU3VjY2Vzcywgb25GYWlsdXJlKSB7XG4gICAgaWYgKCF0aGlzLl9hdXRoVG9rZW4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk11c3QgYXV0aGVudGljYXRlIGZpcnN0XCIpO1xuICAgIH1cbiAgICBjb25zdCBpbnN0YW5jZSA9IHRoaXM7XG5cbiAgICBsZXQgdXJsID0gYC92JHt0aGlzLl92ZXJzaW9ufS9maWxlL3UvYDtcbiAgICBpZiAoYmFzZVVybCkge1xuICAgICAgbGV0IGJhc2UgPSBiYXNlVXJsO1xuICAgICAgaWYgKGJhc2UuZW5kc1dpdGgoJy8nKSkge1xuICAgICAgICAvLyBSZW1vdmluZyB0cmFpbGluZyBzbGFzaC5cbiAgICAgICAgYmFzZSA9IGJhc2Uuc2xpY2UoMCwgLTEpO1xuICAgICAgfVxuICAgICAgaWYgKGJhc2Uuc3RhcnRzV2l0aCgnaHR0cDovLycpIHx8IGJhc2Uuc3RhcnRzV2l0aCgnaHR0cHM6Ly8nKSkge1xuICAgICAgICB1cmwgPSBiYXNlICsgdXJsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGJhc2UgVVJMICcke2Jhc2VVcmx9J2ApO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnhoci5vcGVuKCdQT1NUJywgdXJsLCB0cnVlKTtcbiAgICB0aGlzLnhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLVRpbm9kZS1BUElLZXknLCB0aGlzLl9hcGlLZXkpO1xuICAgIHRoaXMueGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtVGlub2RlLUF1dGgnLCBgVG9rZW4gJHt0aGlzLl9hdXRoVG9rZW4udG9rZW59YCk7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy50b1Jlc29sdmUgPSByZXNvbHZlO1xuICAgICAgdGhpcy50b1JlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcblxuICAgIHRoaXMub25Qcm9ncmVzcyA9IG9uUHJvZ3Jlc3M7XG4gICAgdGhpcy5vblN1Y2Nlc3MgPSBvblN1Y2Nlc3M7XG4gICAgdGhpcy5vbkZhaWx1cmUgPSBvbkZhaWx1cmU7XG5cbiAgICB0aGlzLnhoci51cGxvYWQub25wcm9ncmVzcyA9IChlKSA9PiB7XG4gICAgICBpZiAoZS5sZW5ndGhDb21wdXRhYmxlICYmIGluc3RhbmNlLm9uUHJvZ3Jlc3MpIHtcbiAgICAgICAgaW5zdGFuY2Uub25Qcm9ncmVzcyhlLmxvYWRlZCAvIGUudG90YWwpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBwa3Q7XG4gICAgICB0cnkge1xuICAgICAgICBwa3QgPSBKU09OLnBhcnNlKHRoaXMucmVzcG9uc2UsIGpzb25QYXJzZUhlbHBlcik7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaW5zdGFuY2UuX3Rpbm9kZS5sb2dnZXIoXCJFUlJPUjogSW52YWxpZCBzZXJ2ZXIgcmVzcG9uc2UgaW4gTGFyZ2VGaWxlSGVscGVyXCIsIHRoaXMucmVzcG9uc2UpO1xuICAgICAgICBwa3QgPSB7XG4gICAgICAgICAgY3RybDoge1xuICAgICAgICAgICAgY29kZTogdGhpcy5zdGF0dXMsXG4gICAgICAgICAgICB0ZXh0OiB0aGlzLnN0YXR1c1RleHRcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDApIHtcbiAgICAgICAgaWYgKGluc3RhbmNlLnRvUmVzb2x2ZSkge1xuICAgICAgICAgIGluc3RhbmNlLnRvUmVzb2x2ZShwa3QuY3RybC5wYXJhbXMudXJsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5zdGFuY2Uub25TdWNjZXNzKSB7XG4gICAgICAgICAgaW5zdGFuY2Uub25TdWNjZXNzKHBrdC5jdHJsKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgaWYgKGluc3RhbmNlLnRvUmVqZWN0KSB7XG4gICAgICAgICAgaW5zdGFuY2UudG9SZWplY3QobmV3IEVycm9yKGAke3BrdC5jdHJsLnRleHR9ICgke3BrdC5jdHJsLmNvZGV9KWApKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5zdGFuY2Uub25GYWlsdXJlKSB7XG4gICAgICAgICAgaW5zdGFuY2Uub25GYWlsdXJlKHBrdC5jdHJsKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5zdGFuY2UuX3Rpbm9kZS5sb2dnZXIoXCJFUlJPUjogVW5leHBlY3RlZCBzZXJ2ZXIgcmVzcG9uc2Ugc3RhdHVzXCIsIHRoaXMuc3RhdHVzLCB0aGlzLnJlc3BvbnNlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy54aHIub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChpbnN0YW5jZS50b1JlamVjdCkge1xuICAgICAgICBpbnN0YW5jZS50b1JlamVjdChuZXcgRXJyb3IoXCJmYWlsZWRcIikpO1xuICAgICAgfVxuICAgICAgaWYgKGluc3RhbmNlLm9uRmFpbHVyZSkge1xuICAgICAgICBpbnN0YW5jZS5vbkZhaWx1cmUobnVsbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMueGhyLm9uYWJvcnQgPSBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoaW5zdGFuY2UudG9SZWplY3QpIHtcbiAgICAgICAgaW5zdGFuY2UudG9SZWplY3QobmV3IEVycm9yKFwidXBsb2FkIGNhbmNlbGxlZCBieSB1c2VyXCIpKTtcbiAgICAgIH1cbiAgICAgIGlmIChpbnN0YW5jZS5vbkZhaWx1cmUpIHtcbiAgICAgICAgaW5zdGFuY2Uub25GYWlsdXJlKG51bGwpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZm9ybSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgZm9ybS5hcHBlbmQoJ2ZpbGUnLCBkYXRhKTtcbiAgICAgIGZvcm0uc2V0KCdpZCcsIHRoaXMuX3JlcUlkKTtcbiAgICAgIGlmIChhdmF0YXJGb3IpIHtcbiAgICAgICAgZm9ybS5zZXQoJ3RvcGljJywgYXZhdGFyRm9yKTtcbiAgICAgIH1cbiAgICAgIHRoaXMueGhyLnNlbmQoZm9ybSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAodGhpcy50b1JlamVjdCkge1xuICAgICAgICB0aGlzLnRvUmVqZWN0KGVycik7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vbkZhaWx1cmUpIHtcbiAgICAgICAgdGhpcy5vbkZhaWx1cmUobnVsbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICAvKipcbiAgICogU3RhcnQgdXBsb2FkaW5nIHRoZSBmaWxlIHRvIGRlZmF1bHQgZW5kcG9pbnQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuTGFyZ2VGaWxlSGVscGVyI1xuICAgKlxuICAgKiBAcGFyYW0ge0ZpbGV8QmxvYn0gZGF0YSB0byB1cGxvYWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGF2YXRhckZvciB0b3BpYyBuYW1lIGlmIHRoZSB1cGxvYWQgcmVwcmVzZW50cyBhbiBhdmF0YXIuXG4gICAqIEBwYXJhbSB7Q2FsbGJhY2t9IG9uUHJvZ3Jlc3MgY2FsbGJhY2suIFRha2VzIG9uZSB7ZmxvYXR9IHBhcmFtZXRlciAwLi4xXG4gICAqIEBwYXJhbSB7Q2FsbGJhY2t9IG9uU3VjY2VzcyBjYWxsYmFjay4gQ2FsbGVkIHdoZW4gdGhlIGZpbGUgaXMgc3VjY2Vzc2Z1bGx5IHVwbG9hZGVkLlxuICAgKiBAcGFyYW0ge0NhbGxiYWNrfSBvbkZhaWx1cmUgY2FsbGJhY2suIENhbGxlZCBpbiBjYXNlIG9mIGEgZmFpbHVyZS5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIHVwbG9hZCBpcyBjb21wbGV0ZWQvZmFpbGVkLlxuICAgKi9cbiAgdXBsb2FkKGRhdGEsIGF2YXRhckZvciwgb25Qcm9ncmVzcywgb25TdWNjZXNzLCBvbkZhaWx1cmUpIHtcbiAgICBjb25zdCBiYXNlVXJsID0gKHRoaXMuX3Rpbm9kZS5fc2VjdXJlID8gJ2h0dHBzOi8vJyA6ICdodHRwOi8vJykgKyB0aGlzLl90aW5vZGUuX2hvc3Q7XG4gICAgcmV0dXJuIHRoaXMudXBsb2FkV2l0aEJhc2VVcmwoYmFzZVVybCwgZGF0YSwgYXZhdGFyRm9yLCBvblByb2dyZXNzLCBvblN1Y2Nlc3MsIG9uRmFpbHVyZSk7XG4gIH1cbiAgLyoqXG4gICAqIERvd25sb2FkIHRoZSBmaWxlIGZyb20gYSBnaXZlbiBVUkwgdXNpbmcgR0VUIHJlcXVlc3QuIFRoaXMgbWV0aG9kIHdvcmtzIHdpdGggdGhlIFRpbm9kZSBzZXJ2ZXIgb25seS5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZS5MYXJnZUZpbGVIZWxwZXIjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVybCAtIFVSTCB0byBkb3dubG9hZCB0aGUgZmlsZSBmcm9tLiBNdXN0IGJlIHJlbGF0aXZlIHVybCwgaS5lLiBtdXN0IG5vdCBjb250YWluIHRoZSBob3N0LlxuICAgKiBAcGFyYW0ge3N0cmluZz19IGZpbGVuYW1lIC0gZmlsZSBuYW1lIHRvIHVzZSBmb3IgdGhlIGRvd25sb2FkZWQgZmlsZS5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIGRvd25sb2FkIGlzIGNvbXBsZXRlZC9mYWlsZWQuXG4gICAqL1xuICBkb3dubG9hZChyZWxhdGl2ZVVybCwgZmlsZW5hbWUsIG1pbWV0eXBlLCBvblByb2dyZXNzLCBvbkVycm9yKSB7XG4gICAgaWYgKCFUaW5vZGUuaXNSZWxhdGl2ZVVSTChyZWxhdGl2ZVVybCkpIHtcbiAgICAgIC8vIEFzIGEgc2VjdXJpdHkgbWVhc3VyZSByZWZ1c2UgdG8gZG93bmxvYWQgZnJvbSBhbiBhYnNvbHV0ZSBVUkwuXG4gICAgICBpZiAob25FcnJvcikge1xuICAgICAgICBvbkVycm9yKGBUaGUgVVJMICcke3JlbGF0aXZlVXJsfScgbXVzdCBiZSByZWxhdGl2ZSwgbm90IGFic29sdXRlYCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghdGhpcy5fYXV0aFRva2VuKSB7XG4gICAgICBpZiAob25FcnJvcikge1xuICAgICAgICBvbkVycm9yKFwiTXVzdCBhdXRoZW50aWNhdGUgZmlyc3RcIik7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGluc3RhbmNlID0gdGhpcztcbiAgICAvLyBHZXQgZGF0YSBhcyBibG9iIChzdG9yZWQgYnkgdGhlIGJyb3dzZXIgYXMgYSB0ZW1wb3JhcnkgZmlsZSkuXG4gICAgdGhpcy54aHIub3BlbignR0VUJywgcmVsYXRpdmVVcmwsIHRydWUpO1xuICAgIHRoaXMueGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtVGlub2RlLUFQSUtleScsIHRoaXMuX2FwaUtleSk7XG4gICAgdGhpcy54aHIuc2V0UmVxdWVzdEhlYWRlcignWC1UaW5vZGUtQXV0aCcsICdUb2tlbiAnICsgdGhpcy5fYXV0aFRva2VuLnRva2VuKTtcbiAgICB0aGlzLnhoci5yZXNwb25zZVR5cGUgPSAnYmxvYic7XG5cbiAgICB0aGlzLm9uUHJvZ3Jlc3MgPSBvblByb2dyZXNzO1xuICAgIHRoaXMueGhyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoaW5zdGFuY2Uub25Qcm9ncmVzcykge1xuICAgICAgICAvLyBQYXNzaW5nIGUubG9hZGVkIGluc3RlYWQgb2YgZS5sb2FkZWQvZS50b3RhbCBiZWNhdXNlIGUudG90YWxcbiAgICAgICAgLy8gaXMgYWx3YXlzIDAgd2l0aCBnemlwIGNvbXByZXNzaW9uIGVuYWJsZWQgYnkgdGhlIHNlcnZlci5cbiAgICAgICAgaW5zdGFuY2Uub25Qcm9ncmVzcyhlLmxvYWRlZCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMudG9SZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHRoaXMudG9SZWplY3QgPSByZWplY3Q7XG4gICAgfSk7XG5cbiAgICAvLyBUaGUgYmxvYiBuZWVkcyB0byBiZSBzYXZlZCBhcyBmaWxlLiBUaGVyZSBpcyBubyBrbm93biB3YXkgdG9cbiAgICAvLyBzYXZlIHRoZSBibG9iIGFzIGZpbGUgb3RoZXIgdGhhbiB0byBmYWtlIGEgY2xpY2sgb24gYW4gPGEgaHJlZi4uLiBkb3dubG9hZD0uLi4+LlxuICAgIHRoaXMueGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdHVzID09IDIwMCkge1xuICAgICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAvLyBVUkwuY3JlYXRlT2JqZWN0VVJMIGlzIG5vdCBhdmFpbGFibGUgaW4gbm9uLWJyb3dzZXIgZW52aXJvbm1lbnQuIFRoaXMgY2FsbCB3aWxsIGZhaWwuXG4gICAgICAgIGxpbmsuaHJlZiA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFt0aGlzLnJlc3BvbnNlXSwge1xuICAgICAgICAgIHR5cGU6IG1pbWV0eXBlXG4gICAgICAgIH0pKTtcbiAgICAgICAgbGluay5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSgnZG93bmxvYWQnLCBmaWxlbmFtZSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgIGxpbmsuY2xpY2soKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKTtcbiAgICAgICAgd2luZG93LlVSTC5yZXZva2VPYmplY3RVUkwobGluay5ocmVmKTtcbiAgICAgICAgaWYgKGluc3RhbmNlLnRvUmVzb2x2ZSkge1xuICAgICAgICAgIGluc3RhbmNlLnRvUmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdHVzID49IDQwMCAmJiBpbnN0YW5jZS50b1JlamVjdCkge1xuICAgICAgICAvLyBUaGUgdGhpcy5yZXNwb25zZVRleHQgaXMgdW5kZWZpbmVkLCBtdXN0IHVzZSB0aGlzLnJlc3BvbnNlIHdoaWNoIGlzIGEgYmxvYi5cbiAgICAgICAgLy8gTmVlZCB0byBjb252ZXJ0IHRoaXMucmVzcG9uc2UgdG8gSlNPTi4gVGhlIGJsb2IgY2FuIG9ubHkgYmUgYWNjZXNzZWQgYnkgdGhlXG4gICAgICAgIC8vIEZpbGVSZWFkZXIuXG4gICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcGt0ID0gSlNPTi5wYXJzZSh0aGlzLnJlc3VsdCwganNvblBhcnNlSGVscGVyKTtcbiAgICAgICAgICAgIGluc3RhbmNlLnRvUmVqZWN0KG5ldyBFcnJvcihgJHtwa3QuY3RybC50ZXh0fSAoJHtwa3QuY3RybC5jb2RlfSlgKSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBpbnN0YW5jZS5fdGlub2RlLmxvZ2dlcihcIkVSUk9SOiBJbnZhbGlkIHNlcnZlciByZXNwb25zZSBpbiBMYXJnZUZpbGVIZWxwZXJcIiwgdGhpcy5yZXN1bHQpO1xuICAgICAgICAgICAgaW5zdGFuY2UudG9SZWplY3QoZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJlYWRlci5yZWFkQXNUZXh0KHRoaXMucmVzcG9uc2UpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnhoci5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKGluc3RhbmNlLnRvUmVqZWN0KSB7XG4gICAgICAgIGluc3RhbmNlLnRvUmVqZWN0KG5ldyBFcnJvcihcImZhaWxlZFwiKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMueGhyLm9uYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChpbnN0YW5jZS50b1JlamVjdCkge1xuICAgICAgICBpbnN0YW5jZS50b1JlamVjdChudWxsKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMueGhyLnNlbmQoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmICh0aGlzLnRvUmVqZWN0KSB7XG4gICAgICAgIHRoaXMudG9SZWplY3QoZXJyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIC8qKlxuICAgKiBUcnkgdG8gY2FuY2VsIGFuIG9uZ29pbmcgdXBsb2FkIG9yIGRvd25sb2FkLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkxhcmdlRmlsZUhlbHBlciNcbiAgICovXG4gIGNhbmNlbCgpIHtcbiAgICBpZiAodGhpcy54aHIgJiYgdGhpcy54aHIucmVhZHlTdGF0ZSA8IDQpIHtcbiAgICAgIHRoaXMueGhyLmFib3J0KCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBHZXQgdW5pcXVlIGlkIG9mIHRoaXMgcmVxdWVzdC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5MYXJnZUZpbGVIZWxwZXIjXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IHVuaXF1ZSBpZFxuICAgKi9cbiAgZ2V0SWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JlcUlkO1xuICB9XG4gIC8qKlxuICAgKiBUbyB1c2UgTGFyZ2VGaWxlSGVscGVyIGluIGEgbm9uIGJyb3dzZXIgY29udGV4dCwgc3VwcGx5IFhNTEh0dHBSZXF1ZXN0IHByb3ZpZGVyLlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJvZiBMYXJnZUZpbGVIZWxwZXJcbiAgICogQHBhcmFtIHhoclByb3ZpZGVyIFhNTEh0dHBSZXF1ZXN0IHByb3ZpZGVyLCBlLmcuIGZvciBub2RlIDxjb2RlPnJlcXVpcmUoJ3hocicpPC9jb2RlPi5cbiAgICovXG4gIHN0YXRpYyBzZXROZXR3b3JrUHJvdmlkZXIoeGhyUHJvdmlkZXIpIHtcbiAgICBYSFJQcm92aWRlciA9IHhoclByb3ZpZGVyO1xuICB9XG59XG4iLCIvKipcbiAqIEBmaWxlIEhlbHBlciBjbGFzcyBmb3IgY29uc3RydWN0aW5nIHtAbGluayBUaW5vZGUuR2V0UXVlcnl9LlxuICpcbiAqIEBjb3B5cmlnaHQgMjAxNS0yMDIyIFRpbm9kZSBMTEMuXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgZm9yIGNvbnN0cnVjdGluZyB7QGxpbmsgVGlub2RlLkdldFF1ZXJ5fS5cbiAqXG4gKiBAY2xhc3MgTWV0YUdldEJ1aWxkZXJcbiAqIEBtZW1iZXJvZiBUaW5vZGVcbiAqXG4gKiBAcGFyYW0ge1Rpbm9kZS5Ub3BpY30gcGFyZW50IHRvcGljIHdoaWNoIGluc3RhbnRpYXRlZCB0aGlzIGJ1aWxkZXIuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1ldGFHZXRCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IocGFyZW50KSB7XG4gICAgdGhpcy50b3BpYyA9IHBhcmVudDtcbiAgICB0aGlzLndoYXQgPSB7fTtcbiAgfVxuXG4gIC8vIEdldCB0aW1lc3RhbXAgb2YgdGhlIG1vc3QgcmVjZW50IGRlc2MgdXBkYXRlLlxuICAjX2dldF9kZXNjX2ltcygpIHtcbiAgICByZXR1cm4gdGhpcy50b3BpYy51cGRhdGVkO1xuICB9XG5cbiAgLy8gR2V0IHRpbWVzdGFtcCBvZiB0aGUgbW9zdCByZWNlbnQgc3VicyB1cGRhdGUuXG4gICNfZ2V0X3N1YnNfaW1zKCkge1xuICAgIGlmICh0aGlzLnRvcGljLmlzUDJQVHlwZSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy4jX2dldF9kZXNjX2ltcygpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b3BpYy5fbGFzdFN1YnNVcGRhdGU7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBxdWVyeSBwYXJhbWV0ZXJzIHRvIGZldGNoIG1lc3NhZ2VzIHdpdGhpbiBleHBsaWNpdCBsaW1pdHMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuTWV0YUdldEJ1aWxkZXIjXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gc2luY2UgLSBtZXNzYWdlcyBuZXdlciB0aGFuIHRoaXMgKGluY2x1c2l2ZSk7XG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gYmVmb3JlIC0gb2xkZXIgdGhhbiB0aGlzIChleGNsdXNpdmUpXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gbGltaXQgLSBudW1iZXIgb2YgbWVzc2FnZXMgdG8gZmV0Y2hcbiAgICogQHJldHVybnMge1Rpbm9kZS5NZXRhR2V0QnVpbGRlcn0gPGNvZGU+dGhpczwvY29kZT4gb2JqZWN0LlxuICAgKi9cbiAgd2l0aERhdGEoc2luY2UsIGJlZm9yZSwgbGltaXQpIHtcbiAgICB0aGlzLndoYXRbJ2RhdGEnXSA9IHtcbiAgICAgIHNpbmNlOiBzaW5jZSxcbiAgICAgIGJlZm9yZTogYmVmb3JlLFxuICAgICAgbGltaXQ6IGxpbWl0XG4gICAgfTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogQWRkIHF1ZXJ5IHBhcmFtZXRlcnMgdG8gZmV0Y2ggbWVzc2FnZXMgbmV3ZXIgdGhhbiB0aGUgbGF0ZXN0IHNhdmVkIG1lc3NhZ2UuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuTWV0YUdldEJ1aWxkZXIjXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gbGltaXQgLSBudW1iZXIgb2YgbWVzc2FnZXMgdG8gZmV0Y2hcbiAgICpcbiAgICogQHJldHVybnMge1Rpbm9kZS5NZXRhR2V0QnVpbGRlcn0gPGNvZGU+dGhpczwvY29kZT4gb2JqZWN0LlxuICAgKi9cbiAgd2l0aExhdGVyRGF0YShsaW1pdCkge1xuICAgIHJldHVybiB0aGlzLndpdGhEYXRhKHRoaXMudG9waWMuX21heFNlcSA+IDAgPyB0aGlzLnRvcGljLl9tYXhTZXEgKyAxIDogdW5kZWZpbmVkLCB1bmRlZmluZWQsIGxpbWl0KTtcbiAgfVxuICAvKipcbiAgICogQWRkIHF1ZXJ5IHBhcmFtZXRlcnMgdG8gZmV0Y2ggbWVzc2FnZXMgb2xkZXIgdGhhbiB0aGUgZWFybGllc3Qgc2F2ZWQgbWVzc2FnZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5NZXRhR2V0QnVpbGRlciNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXI9fSBsaW1pdCAtIG1heGltdW0gbnVtYmVyIG9mIG1lc3NhZ2VzIHRvIGZldGNoLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VGlub2RlLk1ldGFHZXRCdWlsZGVyfSA8Y29kZT50aGlzPC9jb2RlPiBvYmplY3QuXG4gICAqL1xuICB3aXRoRWFybGllckRhdGEobGltaXQpIHtcbiAgICByZXR1cm4gdGhpcy53aXRoRGF0YSh1bmRlZmluZWQsIHRoaXMudG9waWMuX21pblNlcSA+IDAgPyB0aGlzLnRvcGljLl9taW5TZXEgOiB1bmRlZmluZWQsIGxpbWl0KTtcbiAgfVxuICAvKipcbiAgICogQWRkIHF1ZXJ5IHBhcmFtZXRlcnMgdG8gZmV0Y2ggdG9waWMgZGVzY3JpcHRpb24gaWYgaXQncyBuZXdlciB0aGFuIHRoZSBnaXZlbiB0aW1lc3RhbXAuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuTWV0YUdldEJ1aWxkZXIjXG4gICAqXG4gICAqIEBwYXJhbSB7RGF0ZT19IGltcyAtIGZldGNoIG1lc3NhZ2VzIG5ld2VyIHRoYW4gdGhpcyB0aW1lc3RhbXAuXG4gICAqXG4gICAqIEByZXR1cm5zIHtUaW5vZGUuTWV0YUdldEJ1aWxkZXJ9IDxjb2RlPnRoaXM8L2NvZGU+IG9iamVjdC5cbiAgICovXG4gIHdpdGhEZXNjKGltcykge1xuICAgIHRoaXMud2hhdFsnZGVzYyddID0ge1xuICAgICAgaW1zOiBpbXNcbiAgICB9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgcXVlcnkgcGFyYW1ldGVycyB0byBmZXRjaCB0b3BpYyBkZXNjcmlwdGlvbiBpZiBpdCdzIG5ld2VyIHRoYW4gdGhlIGxhc3QgdXBkYXRlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLk1ldGFHZXRCdWlsZGVyI1xuICAgKlxuICAgKiBAcmV0dXJucyB7VGlub2RlLk1ldGFHZXRCdWlsZGVyfSA8Y29kZT50aGlzPC9jb2RlPiBvYmplY3QuXG4gICAqL1xuICB3aXRoTGF0ZXJEZXNjKCkge1xuICAgIHJldHVybiB0aGlzLndpdGhEZXNjKHRoaXMuI19nZXRfZGVzY19pbXMoKSk7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBxdWVyeSBwYXJhbWV0ZXJzIHRvIGZldGNoIHN1YnNjcmlwdGlvbnMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuTWV0YUdldEJ1aWxkZXIjXG4gICAqXG4gICAqIEBwYXJhbSB7RGF0ZT19IGltcyAtIGZldGNoIHN1YnNjcmlwdGlvbnMgbW9kaWZpZWQgbW9yZSByZWNlbnRseSB0aGFuIHRoaXMgdGltZXN0YW1wXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gbGltaXQgLSBtYXhpbXVtIG51bWJlciBvZiBzdWJzY3JpcHRpb25zIHRvIGZldGNoLlxuICAgKiBAcGFyYW0ge3N0cmluZz19IHVzZXJPclRvcGljIC0gdXNlciBJRCBvciB0b3BpYyBuYW1lIHRvIGZldGNoIGZvciBmZXRjaGluZyBvbmUgc3Vic2NyaXB0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VGlub2RlLk1ldGFHZXRCdWlsZGVyfSA8Y29kZT50aGlzPC9jb2RlPiBvYmplY3QuXG4gICAqL1xuICB3aXRoU3ViKGltcywgbGltaXQsIHVzZXJPclRvcGljKSB7XG4gICAgY29uc3Qgb3B0cyA9IHtcbiAgICAgIGltczogaW1zLFxuICAgICAgbGltaXQ6IGxpbWl0XG4gICAgfTtcbiAgICBpZiAodGhpcy50b3BpYy5nZXRUeXBlKCkgPT0gJ21lJykge1xuICAgICAgb3B0cy50b3BpYyA9IHVzZXJPclRvcGljO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRzLnVzZXIgPSB1c2VyT3JUb3BpYztcbiAgICB9XG4gICAgdGhpcy53aGF0WydzdWInXSA9IG9wdHM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBxdWVyeSBwYXJhbWV0ZXJzIHRvIGZldGNoIGEgc2luZ2xlIHN1YnNjcmlwdGlvbi5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5NZXRhR2V0QnVpbGRlciNcbiAgICpcbiAgICogQHBhcmFtIHtEYXRlPX0gaW1zIC0gZmV0Y2ggc3Vic2NyaXB0aW9ucyBtb2RpZmllZCBtb3JlIHJlY2VudGx5IHRoYW4gdGhpcyB0aW1lc3RhbXBcbiAgICogQHBhcmFtIHtzdHJpbmc9fSB1c2VyT3JUb3BpYyAtIHVzZXIgSUQgb3IgdG9waWMgbmFtZSB0byBmZXRjaCBmb3IgZmV0Y2hpbmcgb25lIHN1YnNjcmlwdGlvbi5cbiAgICpcbiAgICogQHJldHVybnMge1Rpbm9kZS5NZXRhR2V0QnVpbGRlcn0gPGNvZGU+dGhpczwvY29kZT4gb2JqZWN0LlxuICAgKi9cbiAgd2l0aE9uZVN1YihpbXMsIHVzZXJPclRvcGljKSB7XG4gICAgcmV0dXJuIHRoaXMud2l0aFN1YihpbXMsIHVuZGVmaW5lZCwgdXNlck9yVG9waWMpO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgcXVlcnkgcGFyYW1ldGVycyB0byBmZXRjaCBhIHNpbmdsZSBzdWJzY3JpcHRpb24gaWYgaXQncyBiZWVuIHVwZGF0ZWQgc2luY2UgdGhlIGxhc3QgdXBkYXRlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLk1ldGFHZXRCdWlsZGVyI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZz19IHVzZXJPclRvcGljIC0gdXNlciBJRCBvciB0b3BpYyBuYW1lIHRvIGZldGNoIGZvciBmZXRjaGluZyBvbmUgc3Vic2NyaXB0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VGlub2RlLk1ldGFHZXRCdWlsZGVyfSA8Y29kZT50aGlzPC9jb2RlPiBvYmplY3QuXG4gICAqL1xuICB3aXRoTGF0ZXJPbmVTdWIodXNlck9yVG9waWMpIHtcbiAgICByZXR1cm4gdGhpcy53aXRoT25lU3ViKHRoaXMudG9waWMuX2xhc3RTdWJzVXBkYXRlLCB1c2VyT3JUb3BpYyk7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBxdWVyeSBwYXJhbWV0ZXJzIHRvIGZldGNoIHN1YnNjcmlwdGlvbnMgdXBkYXRlZCBzaW5jZSB0aGUgbGFzdCB1cGRhdGUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuTWV0YUdldEJ1aWxkZXIjXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gbGltaXQgLSBtYXhpbXVtIG51bWJlciBvZiBzdWJzY3JpcHRpb25zIHRvIGZldGNoLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VGlub2RlLk1ldGFHZXRCdWlsZGVyfSA8Y29kZT50aGlzPC9jb2RlPiBvYmplY3QuXG4gICAqL1xuICB3aXRoTGF0ZXJTdWIobGltaXQpIHtcbiAgICByZXR1cm4gdGhpcy53aXRoU3ViKHRoaXMuI19nZXRfc3Vic19pbXMoKSwgbGltaXQpO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgcXVlcnkgcGFyYW1ldGVycyB0byBmZXRjaCB0b3BpYyB0YWdzLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLk1ldGFHZXRCdWlsZGVyI1xuICAgKlxuICAgKiBAcmV0dXJucyB7VGlub2RlLk1ldGFHZXRCdWlsZGVyfSA8Y29kZT50aGlzPC9jb2RlPiBvYmplY3QuXG4gICAqL1xuICB3aXRoVGFncygpIHtcbiAgICB0aGlzLndoYXRbJ3RhZ3MnXSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBxdWVyeSBwYXJhbWV0ZXJzIHRvIGZldGNoIHVzZXIncyBjcmVkZW50aWFscy4gPGNvZGU+J21lJzwvY29kZT4gdG9waWMgb25seS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5NZXRhR2V0QnVpbGRlciNcbiAgICpcbiAgICogQHJldHVybnMge1Rpbm9kZS5NZXRhR2V0QnVpbGRlcn0gPGNvZGU+dGhpczwvY29kZT4gb2JqZWN0LlxuICAgKi9cbiAgd2l0aENyZWQoKSB7XG4gICAgaWYgKHRoaXMudG9waWMuZ2V0VHlwZSgpID09ICdtZScpIHtcbiAgICAgIHRoaXMud2hhdFsnY3JlZCddID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50b3BpYy5fdGlub2RlLmxvZ2dlcihcIkVSUk9SOiBJbnZhbGlkIHRvcGljIHR5cGUgZm9yIE1ldGFHZXRCdWlsZGVyOndpdGhDcmVkc1wiLCB0aGlzLnRvcGljLmdldFR5cGUoKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgcXVlcnkgcGFyYW1ldGVycyB0byBmZXRjaCBkZWxldGVkIG1lc3NhZ2VzIHdpdGhpbiBleHBsaWNpdCBsaW1pdHMuIEFueS9hbGwgcGFyYW1ldGVycyBjYW4gYmUgbnVsbC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5NZXRhR2V0QnVpbGRlciNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXI9fSBzaW5jZSAtIGlkcyBvZiBtZXNzYWdlcyBkZWxldGVkIHNpbmNlIHRoaXMgJ2RlbCcgaWQgKGluY2x1c2l2ZSlcbiAgICogQHBhcmFtIHtudW1iZXI9fSBsaW1pdCAtIG51bWJlciBvZiBkZWxldGVkIG1lc3NhZ2UgaWRzIHRvIGZldGNoXG4gICAqXG4gICAqIEByZXR1cm5zIHtUaW5vZGUuTWV0YUdldEJ1aWxkZXJ9IDxjb2RlPnRoaXM8L2NvZGU+IG9iamVjdC5cbiAgICovXG4gIHdpdGhEZWwoc2luY2UsIGxpbWl0KSB7XG4gICAgaWYgKHNpbmNlIHx8IGxpbWl0KSB7XG4gICAgICB0aGlzLndoYXRbJ2RlbCddID0ge1xuICAgICAgICBzaW5jZTogc2luY2UsXG4gICAgICAgIGxpbWl0OiBsaW1pdFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBxdWVyeSBwYXJhbWV0ZXJzIHRvIGZldGNoIG1lc3NhZ2VzIGRlbGV0ZWQgYWZ0ZXIgdGhlIHNhdmVkIDxjb2RlPidkZWwnPC9jb2RlPiBpZC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5NZXRhR2V0QnVpbGRlciNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXI9fSBsaW1pdCAtIG51bWJlciBvZiBkZWxldGVkIG1lc3NhZ2UgaWRzIHRvIGZldGNoXG4gICAqXG4gICAqIEByZXR1cm5zIHtUaW5vZGUuTWV0YUdldEJ1aWxkZXJ9IDxjb2RlPnRoaXM8L2NvZGU+IG9iamVjdC5cbiAgICovXG4gIHdpdGhMYXRlckRlbChsaW1pdCkge1xuICAgIC8vIFNwZWNpZnkgJ3NpbmNlJyBvbmx5IGlmIHdlIGhhdmUgYWxyZWFkeSByZWNlaXZlZCBzb21lIG1lc3NhZ2VzLiBJZlxuICAgIC8vIHdlIGhhdmUgbm8gbG9jYWxseSBjYWNoZWQgbWVzc2FnZXMgdGhlbiB3ZSBkb24ndCBjYXJlIGlmIGFueSBtZXNzYWdlcyB3ZXJlIGRlbGV0ZWQuXG4gICAgcmV0dXJuIHRoaXMud2l0aERlbCh0aGlzLnRvcGljLl9tYXhTZXEgPiAwID8gdGhpcy50b3BpYy5fbWF4RGVsICsgMSA6IHVuZGVmaW5lZCwgbGltaXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4dHJhY3Qgc3VicXVlcnk6IGdldCBhbiBvYmplY3QgdGhhdCBjb250YWlucyBzcGVjaWZpZWQgc3VicXVlcnkuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuTWV0YUdldEJ1aWxkZXIjXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB3aGF0IC0gc3VicXVlcnkgdG8gcmV0dXJuOiBvbmUgb2YgJ2RhdGEnLCAnc3ViJywgJ2Rlc2MnLCAndGFncycsICdjcmVkJywgJ2RlbCcuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IHJlcXVlc3RlZCBzdWJxdWVyeSBvciA8Y29kZT51bmRlZmluZWQ8L2NvZGU+LlxuICAgKi9cbiAgZXh0cmFjdCh3aGF0KSB7XG4gICAgcmV0dXJuIHRoaXMud2hhdFt3aGF0XTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgcGFyYW1ldGVycy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5NZXRhR2V0QnVpbGRlciNcbiAgICpcbiAgICogQHJldHVybnMge1Rpbm9kZS5HZXRRdWVyeX0gR2V0IHF1ZXJ5XG4gICAqL1xuICBidWlsZCgpIHtcbiAgICBjb25zdCB3aGF0ID0gW107XG4gICAgbGV0IHBhcmFtcyA9IHt9O1xuICAgIFsnZGF0YScsICdzdWInLCAnZGVzYycsICd0YWdzJywgJ2NyZWQnLCAnZGVsJ10uZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBpZiAodGhpcy53aGF0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgd2hhdC5wdXNoKGtleSk7XG4gICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzLndoYXRba2V5XSkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHBhcmFtc1trZXldID0gdGhpcy53aGF0W2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAod2hhdC5sZW5ndGggPiAwKSB7XG4gICAgICBwYXJhbXMud2hhdCA9IHdoYXQuam9pbignICcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJhbXMgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBwYXJhbXM7XG4gIH1cbn1cbiIsIi8qKlxuICogQGZpbGUgU0RLIHRvIGNvbm5lY3QgdG8gVGlub2RlIGNoYXQgc2VydmVyLlxuICogU2VlIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vdGlub2RlL3dlYmFwcFwiPmh0dHBzOi8vZ2l0aHViLmNvbS90aW5vZGUvd2ViYXBwPC9hPiBmb3IgcmVhbC1saWZlIHVzYWdlLlxuICpcbiAqIEBjb3B5cmlnaHQgMjAxNS0yMDIyIFRpbm9kZSBMTEMuXG4gKiBAc3VtbWFyeSBKYXZhc2NyaXB0IGJpbmRpbmdzIGZvciBUaW5vZGUuXG4gKiBAbGljZW5zZSBBcGFjaGUgMi4wXG4gKiBAdmVyc2lvbiAwLjE4XG4gKlxuICogQGV4YW1wbGVcbiAqIDxoZWFkPlxuICogPHNjcmlwdCBzcmM9XCIuLi4vdGlub2RlLmpzXCI+PC9zY3JpcHQ+XG4gKiA8L2hlYWQ+XG4gKlxuICogPGJvZHk+XG4gKiAgLi4uXG4gKiA8c2NyaXB0PlxuICogIC8vIEluc3RhbnRpYXRlIHRpbm9kZS5cbiAqICBjb25zdCB0aW5vZGUgPSBuZXcgVGlub2RlKGNvbmZpZywgKCkgPT4ge1xuICogICAgLy8gQ2FsbGVkIG9uIGluaXQgY29tcGxldGlvbi5cbiAqICB9KTtcbiAqICB0aW5vZGUuZW5hYmxlTG9nZ2luZyh0cnVlKTtcbiAqICB0aW5vZGUub25EaXNjb25uZWN0ID0gKGVycikgPT4ge1xuICogICAgLy8gSGFuZGxlIGRpc2Nvbm5lY3QuXG4gKiAgfTtcbiAqICAvLyBDb25uZWN0IHRvIHRoZSBzZXJ2ZXIuXG4gKiAgdGlub2RlLmNvbm5lY3QoJ2h0dHBzOi8vZXhhbXBsZS5jb20vJykudGhlbigoKSA9PiB7XG4gKiAgICAvLyBDb25uZWN0ZWQuIExvZ2luIG5vdy5cbiAqICAgIHJldHVybiB0aW5vZGUubG9naW5CYXNpYyhsb2dpbiwgcGFzc3dvcmQpO1xuICogIH0pLnRoZW4oKGN0cmwpID0+IHtcbiAqICAgIC8vIExvZ2dlZCBpbiBmaW5lLCBhdHRhY2ggY2FsbGJhY2tzLCBzdWJzY3JpYmUgdG8gJ21lJy5cbiAqICAgIGNvbnN0IG1lID0gdGlub2RlLmdldE1lVG9waWMoKTtcbiAqICAgIG1lLm9uTWV0YURlc2MgPSBmdW5jdGlvbihtZXRhKSB7IC4uLiB9O1xuICogICAgLy8gU3Vic2NyaWJlLCBmZXRjaCB0b3BpYyBkZXNjcmlwdGlvbiBhbmQgdGhlIGxpc3Qgb2YgY29udGFjdHMuXG4gKiAgICBtZS5zdWJzY3JpYmUoe2dldDoge2Rlc2M6IHt9LCBzdWI6IHt9fX0pO1xuICogIH0pLmNhdGNoKChlcnIpID0+IHtcbiAqICAgIC8vIExvZ2luIG9yIHN1YnNjcmlwdGlvbiBmYWlsZWQsIGRvIHNvbWV0aGluZy5cbiAqICAgIC4uLlxuICogIH0pO1xuICogIC4uLlxuICogPC9zY3JpcHQ+XG4gKiA8L2JvZHk+XG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy8gTk9URSBUTyBERVZFTE9QRVJTOlxuLy8gTG9jYWxpemFibGUgc3RyaW5ncyBzaG91bGQgYmUgZG91YmxlIHF1b3RlZCBcItGB0YLRgNC+0LrQsCDQvdCwINC00YDRg9Cz0L7QvCDRj9C30YvQutC1XCIsXG4vLyBub24tbG9jYWxpemFibGUgc3RyaW5ncyBzaG91bGQgYmUgc2luZ2xlIHF1b3RlZCAnbm9uLWxvY2FsaXplZCcuXG5cbmltcG9ydCBBY2Nlc3NNb2RlIGZyb20gJy4vYWNjZXNzLW1vZGUuanMnO1xuaW1wb3J0ICogYXMgQ29uc3QgZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IENvbm5lY3Rpb24gZnJvbSAnLi9jb25uZWN0aW9uLmpzJztcbmltcG9ydCBEQkNhY2hlIGZyb20gJy4vZGIuanMnO1xuaW1wb3J0IERyYWZ0eSBmcm9tICcuL2RyYWZ0eS5qcyc7XG5pbXBvcnQgTGFyZ2VGaWxlSGVscGVyIGZyb20gJy4vbGFyZ2UtZmlsZS5qcyc7XG5pbXBvcnQge1xuICBUb3BpYyxcbiAgVG9waWNNZSxcbiAgVG9waWNGbmRcbn0gZnJvbSAnLi90b3BpYy5qcyc7XG5cbmltcG9ydCB7XG4gIGpzb25QYXJzZUhlbHBlcixcbiAgbWVyZ2VPYmosXG4gIHJmYzMzMzlEYXRlU3RyaW5nLFxuICBzaW1wbGlmeVxufSBmcm9tICcuL3V0aWxzLmpzJztcblxubGV0IFdlYlNvY2tldFByb3ZpZGVyO1xuaWYgKHR5cGVvZiBXZWJTb2NrZXQgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgV2ViU29ja2V0UHJvdmlkZXIgPSBXZWJTb2NrZXQ7XG59XG5cbmxldCBYSFJQcm92aWRlcjtcbmlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgWEhSUHJvdmlkZXIgPSBYTUxIdHRwUmVxdWVzdDtcbn1cblxubGV0IEluZGV4ZWREQlByb3ZpZGVyO1xuaWYgKHR5cGVvZiBpbmRleGVkREIgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgSW5kZXhlZERCUHJvdmlkZXIgPSBpbmRleGVkREI7XG59XG5cbi8vIFJlLWV4cG9ydCBEcmFmdHkuXG5leHBvcnQge1xuICBEcmFmdHlcbn1cblxuaW5pdEZvck5vbkJyb3dzZXJBcHAoKTtcblxuLy8gVXRpbGl0eSBmdW5jdGlvbnNcblxuLy8gUG9seWZpbGwgZm9yIG5vbi1icm93c2VyIGNvbnRleHQsIGUuZy4gTm9kZUpzLlxuZnVuY3Rpb24gaW5pdEZvck5vbkJyb3dzZXJBcHAoKSB7XG4gIC8vIFRpbm9kZSByZXF1aXJlbWVudCBpbiBuYXRpdmUgbW9kZSBiZWNhdXNlIHJlYWN0IG5hdGl2ZSBkb2Vzbid0IHByb3ZpZGUgQmFzZTY0IG1ldGhvZFxuICBjb25zdCBjaGFycyA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPSc7XG5cbiAgaWYgKHR5cGVvZiBidG9hID09ICd1bmRlZmluZWQnKSB7XG4gICAgZ2xvYmFsLmJ0b2EgPSBmdW5jdGlvbihpbnB1dCA9ICcnKSB7XG4gICAgICBsZXQgc3RyID0gaW5wdXQ7XG4gICAgICBsZXQgb3V0cHV0ID0gJyc7XG5cbiAgICAgIGZvciAobGV0IGJsb2NrID0gMCwgY2hhckNvZGUsIGkgPSAwLCBtYXAgPSBjaGFyczsgc3RyLmNoYXJBdChpIHwgMCkgfHwgKG1hcCA9ICc9JywgaSAlIDEpOyBvdXRwdXQgKz0gbWFwLmNoYXJBdCg2MyAmIGJsb2NrID4+IDggLSBpICUgMSAqIDgpKSB7XG5cbiAgICAgICAgY2hhckNvZGUgPSBzdHIuY2hhckNvZGVBdChpICs9IDMgLyA0KTtcblxuICAgICAgICBpZiAoY2hhckNvZGUgPiAweEZGKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ2J0b2EnIGZhaWxlZDogVGhlIHN0cmluZyB0byBiZSBlbmNvZGVkIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3V0c2lkZSBvZiB0aGUgTGF0aW4xIHJhbmdlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBibG9jayA9IGJsb2NrIDw8IDggfCBjaGFyQ29kZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBhdG9iID09ICd1bmRlZmluZWQnKSB7XG4gICAgZ2xvYmFsLmF0b2IgPSBmdW5jdGlvbihpbnB1dCA9ICcnKSB7XG4gICAgICBsZXQgc3RyID0gaW5wdXQucmVwbGFjZSgvPSskLywgJycpO1xuICAgICAgbGV0IG91dHB1dCA9ICcnO1xuXG4gICAgICBpZiAoc3RyLmxlbmd0aCAlIDQgPT0gMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCInYXRvYicgZmFpbGVkOiBUaGUgc3RyaW5nIHRvIGJlIGRlY29kZWQgaXMgbm90IGNvcnJlY3RseSBlbmNvZGVkLlwiKTtcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IGJjID0gMCwgYnMgPSAwLCBidWZmZXIsIGkgPSAwOyBidWZmZXIgPSBzdHIuY2hhckF0KGkrKyk7XG5cbiAgICAgICAgfmJ1ZmZlciAmJiAoYnMgPSBiYyAlIDQgPyBicyAqIDY0ICsgYnVmZmVyIDogYnVmZmVyLFxuICAgICAgICAgIGJjKysgJSA0KSA/IG91dHB1dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDI1NSAmIGJzID4+ICgtMiAqIGJjICYgNikpIDogMFxuICAgICAgKSB7XG4gICAgICAgIGJ1ZmZlciA9IGNoYXJzLmluZGV4T2YoYnVmZmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBnbG9iYWwud2luZG93ID0ge1xuICAgICAgV2ViU29ja2V0OiBXZWJTb2NrZXRQcm92aWRlcixcbiAgICAgIFhNTEh0dHBSZXF1ZXN0OiBYSFJQcm92aWRlcixcbiAgICAgIGluZGV4ZWREQjogSW5kZXhlZERCUHJvdmlkZXIsXG4gICAgICBVUkw6IHtcbiAgICAgICAgY3JlYXRlT2JqZWN0VVJMOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gdXNlIFVSTC5jcmVhdGVPYmplY3RVUkwgaW4gYSBub24tYnJvd3NlciBhcHBsaWNhdGlvblwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIENvbm5lY3Rpb24uc2V0TmV0d29ya1Byb3ZpZGVycyhXZWJTb2NrZXRQcm92aWRlciwgWEhSUHJvdmlkZXIpO1xuICBMYXJnZUZpbGVIZWxwZXIuc2V0TmV0d29ya1Byb3ZpZGVyKFhIUlByb3ZpZGVyKTtcbiAgREJDYWNoZS5zZXREYXRhYmFzZVByb3ZpZGVyKEluZGV4ZWREQlByb3ZpZGVyKTtcbn1cblxuLy8gRGV0ZWN0IGZpbmQgbW9zdCB1c2VmdWwgbmV0d29yayB0cmFuc3BvcnQuXG5mdW5jdGlvbiBkZXRlY3RUcmFuc3BvcnQoKSB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09ICdvYmplY3QnKSB7XG4gICAgaWYgKHdpbmRvd1snV2ViU29ja2V0J10pIHtcbiAgICAgIHJldHVybiAnd3MnO1xuICAgIH0gZWxzZSBpZiAod2luZG93WydYTUxIdHRwUmVxdWVzdCddKSB7XG4gICAgICAvLyBUaGUgYnJvd3NlciBvciBub2RlIGhhcyBubyB3ZWJzb2NrZXRzLCB1c2luZyBsb25nIHBvbGxpbmcuXG4gICAgICByZXR1cm4gJ2xwJztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIGJ0b2EgcmVwbGFjZW1lbnQuIFN0b2NrIGJ0b2EgZmFpbHMgb24gb24gbm9uLUxhdGluMSBzdHJpbmdzLlxuZnVuY3Rpb24gYjY0RW5jb2RlVW5pY29kZShzdHIpIHtcbiAgLy8gVGhlIGVuY29kZVVSSUNvbXBvbmVudCBwZXJjZW50LWVuY29kZXMgVVRGLTggc3RyaW5nLFxuICAvLyB0aGVuIHRoZSBwZXJjZW50IGVuY29kaW5nIGlzIGNvbnZlcnRlZCBpbnRvIHJhdyBieXRlcyB3aGljaFxuICAvLyBjYW4gYmUgZmVkIGludG8gYnRvYS5cbiAgcmV0dXJuIGJ0b2EoZW5jb2RlVVJJQ29tcG9uZW50KHN0cikucmVwbGFjZSgvJShbMC05QS1GXXsyfSkvZyxcbiAgICBmdW5jdGlvbiB0b1NvbGlkQnl0ZXMobWF0Y2gsIHAxKSB7XG4gICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgnICsgcDEpO1xuICAgIH0pKTtcbn1cblxuLy8gSlNPTiBzdHJpbmdpZnkgaGVscGVyIC0gcHJlLXByb2Nlc3NvciBmb3IgSlNPTi5zdHJpbmdpZnlcbmZ1bmN0aW9uIGpzb25CdWlsZEhlbHBlcihrZXksIHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIC8vIENvbnZlcnQgamF2YXNjcmlwdCBEYXRlIG9iamVjdHMgdG8gcmZjMzMzOSBzdHJpbmdzXG4gICAgdmFsID0gcmZjMzMzOURhdGVTdHJpbmcodmFsKTtcbiAgfSBlbHNlIGlmICh2YWwgaW5zdGFuY2VvZiBBY2Nlc3NNb2RlKSB7XG4gICAgdmFsID0gdmFsLmpzb25IZWxwZXIoKTtcbiAgfSBlbHNlIGlmICh2YWwgPT09IHVuZGVmaW5lZCB8fCB2YWwgPT09IG51bGwgfHwgdmFsID09PSBmYWxzZSB8fFxuICAgIChBcnJheS5pc0FycmF5KHZhbCkgJiYgdmFsLmxlbmd0aCA9PSAwKSB8fFxuICAgICgodHlwZW9mIHZhbCA9PSAnb2JqZWN0JykgJiYgKE9iamVjdC5rZXlzKHZhbCkubGVuZ3RoID09IDApKSkge1xuICAgIC8vIHN0cmlwIG91dCBlbXB0eSBlbGVtZW50cyB3aGlsZSBzZXJpYWxpemluZyBvYmplY3RzIHRvIEpTT05cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIHZhbDtcbn07XG5cbi8vIFRyaW1zIHZlcnkgbG9uZyBzdHJpbmdzIChlbmNvZGVkIGltYWdlcykgdG8gbWFrZSBsb2dnZWQgcGFja2V0cyBtb3JlIHJlYWRhYmxlLlxuZnVuY3Rpb24ganNvbkxvZ2dlckhlbHBlcihrZXksIHZhbCkge1xuICBpZiAodHlwZW9mIHZhbCA9PSAnc3RyaW5nJyAmJiB2YWwubGVuZ3RoID4gMTI4KSB7XG4gICAgcmV0dXJuICc8JyArIHZhbC5sZW5ndGggKyAnLCBieXRlczogJyArIHZhbC5zdWJzdHJpbmcoMCwgMTIpICsgJy4uLicgKyB2YWwuc3Vic3RyaW5nKHZhbC5sZW5ndGggLSAxMikgKyAnPic7XG4gIH1cbiAgcmV0dXJuIGpzb25CdWlsZEhlbHBlcihrZXksIHZhbCk7XG59O1xuXG4vLyBQYXJzZSBicm93c2VyIHVzZXIgYWdlbnQgdG8gZXh0cmFjdCBicm93c2VyIG5hbWUgYW5kIHZlcnNpb24uXG5mdW5jdGlvbiBnZXRCcm93c2VySW5mbyh1YSwgcHJvZHVjdCkge1xuICB1YSA9IHVhIHx8ICcnO1xuICBsZXQgcmVhY3RuYXRpdmUgPSAnJztcbiAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIFJlYWN0TmF0aXZlIGFwcC5cbiAgaWYgKC9yZWFjdG5hdGl2ZS9pLnRlc3QocHJvZHVjdCkpIHtcbiAgICByZWFjdG5hdGl2ZSA9ICdSZWFjdE5hdGl2ZTsgJztcbiAgfVxuICBsZXQgcmVzdWx0O1xuICAvLyBSZW1vdmUgdXNlbGVzcyBzdHJpbmcuXG4gIHVhID0gdWEucmVwbGFjZSgnIChLSFRNTCwgbGlrZSBHZWNrbyknLCAnJyk7XG4gIC8vIFRlc3QgZm9yIFdlYktpdC1iYXNlZCBicm93c2VyLlxuICBsZXQgbSA9IHVhLm1hdGNoKC8oQXBwbGVXZWJLaXRcXC9bLlxcZF0rKS9pKTtcbiAgaWYgKG0pIHtcbiAgICAvLyBMaXN0IG9mIGNvbW1vbiBzdHJpbmdzLCBmcm9tIG1vcmUgdXNlZnVsIHRvIGxlc3MgdXNlZnVsLlxuICAgIC8vIEFsbCB1bmtub3duIHN0cmluZ3MgZ2V0IHRoZSBoaWdoZXN0ICgtMSkgcHJpb3JpdHkuXG4gICAgY29uc3QgcHJpb3JpdHkgPSBbJ2VkZycsICdjaHJvbWUnLCAnc2FmYXJpJywgJ21vYmlsZScsICd2ZXJzaW9uJ107XG4gICAgbGV0IHRtcCA9IHVhLnN1YnN0cihtLmluZGV4ICsgbVswXS5sZW5ndGgpLnNwbGl0KCcgJyk7XG4gICAgbGV0IHRva2VucyA9IFtdO1xuICAgIGxldCB2ZXJzaW9uOyAvLyAxLjAgaW4gVmVyc2lvbi8xLjAgb3IgdW5kZWZpbmVkO1xuICAgIC8vIFNwbGl0IHN0cmluZyBsaWtlICdOYW1lLzAuMC4wJyBpbnRvIFsnTmFtZScsICcwLjAuMCcsIDNdIHdoZXJlIHRoZSBsYXN0IGVsZW1lbnQgaXMgdGhlIHByaW9yaXR5LlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG1wLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgbTIgPSAvKFtcXHcuXSspW1xcL10oW1xcLlxcZF0rKS8uZXhlYyh0bXBbaV0pO1xuICAgICAgaWYgKG0yKSB7XG4gICAgICAgIC8vIFVua25vd24gdmFsdWVzIGFyZSBoaWdoZXN0IHByaW9yaXR5ICgtMSkuXG4gICAgICAgIHRva2Vucy5wdXNoKFttMlsxXSwgbTJbMl0sIHByaW9yaXR5LmZpbmRJbmRleCgoZSkgPT4ge1xuICAgICAgICAgIHJldHVybiBtMlsxXS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgoZSk7XG4gICAgICAgIH0pXSk7XG4gICAgICAgIGlmIChtMlsxXSA9PSAnVmVyc2lvbicpIHtcbiAgICAgICAgICB2ZXJzaW9uID0gbTJbMl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gU29ydCBieSBwcmlvcml0eTogbW9yZSBpbnRlcmVzdGluZyBpcyBlYXJsaWVyIHRoYW4gbGVzcyBpbnRlcmVzdGluZy5cbiAgICB0b2tlbnMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuIGFbMl0gLSBiWzJdO1xuICAgIH0pO1xuICAgIGlmICh0b2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gUmV0dXJuIHRoZSBsZWFzdCBjb21tb24gYnJvd3NlciBzdHJpbmcgYW5kIHZlcnNpb24uXG4gICAgICBpZiAodG9rZW5zWzBdWzBdLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgnZWRnJykpIHtcbiAgICAgICAgdG9rZW5zWzBdWzBdID0gJ0VkZ2UnO1xuICAgICAgfSBlbHNlIGlmICh0b2tlbnNbMF1bMF0gPT0gJ09QUicpIHtcbiAgICAgICAgdG9rZW5zWzBdWzBdID0gJ09wZXJhJztcbiAgICAgIH0gZWxzZSBpZiAodG9rZW5zWzBdWzBdID09ICdTYWZhcmknICYmIHZlcnNpb24pIHtcbiAgICAgICAgdG9rZW5zWzBdWzFdID0gdmVyc2lvbjtcbiAgICAgIH1cbiAgICAgIHJlc3VsdCA9IHRva2Vuc1swXVswXSArICcvJyArIHRva2Vuc1swXVsxXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRmFpbGVkIHRvIElEIHRoZSBicm93c2VyLiBSZXR1cm4gdGhlIHdlYmtpdCB2ZXJzaW9uLlxuICAgICAgcmVzdWx0ID0gbVsxXTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoL2ZpcmVmb3gvaS50ZXN0KHVhKSkge1xuICAgIG0gPSAvRmlyZWZveFxcLyhbLlxcZF0rKS9nLmV4ZWModWEpO1xuICAgIGlmIChtKSB7XG4gICAgICByZXN1bHQgPSAnRmlyZWZveC8nICsgbVsxXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gJ0ZpcmVmb3gvPyc7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIE5laXRoZXIgQXBwbGVXZWJLaXQgbm9yIEZpcmVmb3guIFRyeSB0aGUgbGFzdCByZXNvcnQuXG4gICAgbSA9IC8oW1xcdy5dKylcXC8oWy5cXGRdKykvLmV4ZWModWEpO1xuICAgIGlmIChtKSB7XG4gICAgICByZXN1bHQgPSBtWzFdICsgJy8nICsgbVsyXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHVhLnNwbGl0KCcgJyk7XG4gICAgICByZXN1bHQgPSBtWzBdO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNob3J0ZW4gdGhlIHZlcnNpb24gdG8gb25lIGRvdCAnYS5iYi5jY2MuZCAtPiBhLmJiJyBhdCBtb3N0LlxuICBtID0gcmVzdWx0LnNwbGl0KCcvJyk7XG4gIGlmIChtLmxlbmd0aCA+IDEpIHtcbiAgICBjb25zdCB2ID0gbVsxXS5zcGxpdCgnLicpO1xuICAgIGNvbnN0IG1pbm9yID0gdlsxXSA/ICcuJyArIHZbMV0uc3Vic3RyKDAsIDIpIDogJyc7XG4gICAgcmVzdWx0ID0gYCR7bVswXX0vJHt2WzBdfSR7bWlub3J9YDtcbiAgfVxuICByZXR1cm4gcmVhY3RuYXRpdmUgKyByZXN1bHQ7XG59XG5cbi8qKlxuICogQGNsYXNzIFRpbm9kZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBjb25maWd1cmF0aW9uIHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0ge3N0cmluZ30gY29uZmlnLmFwcE5hbWUgLSBOYW1lIG9mIHRoZSBjYWxsaW5nIGFwcGxpY2F0aW9uIHRvIGJlIHJlcG9ydGVkIGluIHRoZSBVc2VyIEFnZW50LlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbmZpZy5ob3N0IC0gSG9zdCBuYW1lIGFuZCBvcHRpb25hbCBwb3J0IG51bWJlciB0byBjb25uZWN0IHRvLlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbmZpZy5hcGlLZXkgLSBBUEkga2V5IGdlbmVyYXRlZCBieSA8Y29kZT5rZXlnZW48L2NvZGU+LlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbmZpZy50cmFuc3BvcnQgLSBTZWUge0BsaW5rIFRpbm9kZS5Db25uZWN0aW9uI3RyYW5zcG9ydH0uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGNvbmZpZy5zZWN1cmUgLSBVc2UgU2VjdXJlIFdlYlNvY2tldCBpZiA8Y29kZT50cnVlPC9jb2RlPi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb25maWcucGxhdGZvcm0gLSBPcHRpb25hbCBwbGF0Zm9ybSBpZGVudGlmaWVyLCBvbmUgb2YgPGNvZGU+XCJpb3NcIjwvY29kZT4sIDxjb2RlPlwid2ViXCI8L2NvZGU+LCA8Y29kZT5cImFuZHJvaWRcIjwvY29kZT4uXG4gKiBAcGFyYW0ge2Jvb2xlbn0gY29uZmlnLnBlcnNpc3QgLSBVc2UgSW5kZXhlZERCIHBlcnNpc3RlbnQgc3RvcmFnZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG9uQ29tcGxldGUgLSBjYWxsYmFjayB0byBjYWxsIHdoZW4gaW5pdGlhbGl6YXRpb24gaXMgY29tcGxldGVkLlxuICovXG5leHBvcnQgY2xhc3MgVGlub2RlIHtcbiAgX2hvc3Q7XG4gIF9zZWN1cmU7XG5cbiAgX2FwcE5hbWU7XG5cbiAgLy8gQVBJIEtleS5cbiAgX2FwaUtleTtcblxuICAvLyBOYW1lIGFuZCB2ZXJzaW9uIG9mIHRoZSBicm93c2VyLlxuICBfYnJvd3NlciA9ICcnO1xuICBfcGxhdGZvcm07XG4gIC8vIEhhcmR3YXJlXG4gIF9od29zID0gJ3VuZGVmaW5lZCc7XG4gIF9odW1hbkxhbmd1YWdlID0gJ3h4JztcblxuICAvLyBMb2dnaW5nIHRvIGNvbnNvbGUgZW5hYmxlZFxuICBfbG9nZ2luZ0VuYWJsZWQgPSBmYWxzZTtcbiAgLy8gV2hlbiBsb2dnaW5nLCB0cmlwIGxvbmcgc3RyaW5ncyAoYmFzZTY0LWVuY29kZWQgaW1hZ2VzKSBmb3IgcmVhZGFiaWxpdHlcbiAgX3RyaW1Mb25nU3RyaW5ncyA9IGZhbHNlO1xuICAvLyBVSUQgb2YgdGhlIGN1cnJlbnRseSBhdXRoZW50aWNhdGVkIHVzZXIuXG4gIF9teVVJRCA9IG51bGw7XG4gIC8vIFN0YXR1cyBvZiBjb25uZWN0aW9uOiBhdXRoZW50aWNhdGVkIG9yIG5vdC5cbiAgX2F1dGhlbnRpY2F0ZWQgPSBmYWxzZTtcbiAgLy8gTG9naW4gdXNlZCBpbiB0aGUgbGFzdCBzdWNjZXNzZnVsIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gIF9sb2dpbiA9IG51bGw7XG4gIC8vIFRva2VuIHdoaWNoIGNhbiBiZSB1c2VkIGZvciBsb2dpbiBpbnN0ZWFkIG9mIGxvZ2luL3Bhc3N3b3JkLlxuICBfYXV0aFRva2VuID0gbnVsbDtcbiAgLy8gQ291bnRlciBvZiByZWNlaXZlZCBwYWNrZXRzXG4gIF9pblBhY2tldENvdW50ID0gMDtcbiAgLy8gQ291bnRlciBmb3IgZ2VuZXJhdGluZyB1bmlxdWUgbWVzc2FnZSBJRHNcbiAgX21lc3NhZ2VJZCA9IE1hdGguZmxvb3IoKE1hdGgucmFuZG9tKCkgKiAweEZGRkYpICsgMHhGRkZGKTtcbiAgLy8gSW5mb3JtYXRpb24gYWJvdXQgdGhlIHNlcnZlciwgaWYgY29ubmVjdGVkXG4gIF9zZXJ2ZXJJbmZvID0gbnVsbDtcbiAgLy8gUHVzaCBub3RpZmljYXRpb24gdG9rZW4uIENhbGxlZCBkZXZpY2VUb2tlbiBmb3IgY29uc2lzdGVuY3kgd2l0aCB0aGUgQW5kcm9pZCBTREsuXG4gIF9kZXZpY2VUb2tlbiA9IG51bGw7XG5cbiAgLy8gQ2FjaGUgb2YgcGVuZGluZyBwcm9taXNlcyBieSBtZXNzYWdlIGlkLlxuICBfcGVuZGluZ1Byb21pc2VzID0ge307XG4gIC8vIFRoZSBUaW1lb3V0IG9iamVjdCByZXR1cm5lZCBieSB0aGUgcmVqZWN0IGV4cGlyZWQgcHJvbWlzZXMgc2V0SW50ZXJ2YWwuXG4gIF9leHBpcmVQcm9taXNlcyA9IG51bGw7XG5cbiAgLy8gV2Vic29ja2V0IG9yIGxvbmcgcG9sbGluZyBjb25uZWN0aW9uLlxuICBfY29ubmVjdGlvbiA9IG51bGw7XG5cbiAgLy8gVXNlIGluZGV4REIgZm9yIGNhY2hpbmcgdG9waWNzIGFuZCBtZXNzYWdlcy5cbiAgX3BlcnNpc3QgPSBmYWxzZTtcbiAgLy8gSW5kZXhlZERCIHdyYXBwZXIgb2JqZWN0LlxuICBfZGIgPSBudWxsO1xuXG4gIC8vIFRpbm9kZSdzIGNhY2hlIG9mIG9iamVjdHNcbiAgX2NhY2hlID0ge307XG5cbiAgY29uc3RydWN0b3IoY29uZmlnLCBvbkNvbXBsZXRlKSB7XG4gICAgdGhpcy5faG9zdCA9IGNvbmZpZy5ob3N0O1xuICAgIHRoaXMuX3NlY3VyZSA9IGNvbmZpZy5zZWN1cmU7XG5cbiAgICAvLyBDbGllbnQtcHJvdmlkZWQgYXBwbGljYXRpb24gbmFtZSwgZm9ybWF0IDxOYW1lPi88dmVyc2lvbiBudW1iZXI+XG4gICAgdGhpcy5fYXBwTmFtZSA9IGNvbmZpZy5hcHBOYW1lIHx8IFwiVW5kZWZpbmVkXCI7XG5cbiAgICAvLyBBUEkgS2V5LlxuICAgIHRoaXMuX2FwaUtleSA9IGNvbmZpZy5hcGlLZXk7XG5cbiAgICAvLyBOYW1lIGFuZCB2ZXJzaW9uIG9mIHRoZSBicm93c2VyLlxuICAgIHRoaXMuX3BsYXRmb3JtID0gY29uZmlnLnBsYXRmb3JtIHx8ICd3ZWInO1xuICAgIC8vIFVuZGVybHlpbmcgT1MuXG4gICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuX2Jyb3dzZXIgPSBnZXRCcm93c2VySW5mbyhuYXZpZ2F0b3IudXNlckFnZW50LCBuYXZpZ2F0b3IucHJvZHVjdCk7XG4gICAgICB0aGlzLl9od29zID0gbmF2aWdhdG9yLnBsYXRmb3JtO1xuICAgICAgLy8gVGhpcyBpcyB0aGUgZGVmYXVsdCBsYW5ndWFnZS4gSXQgY291bGQgYmUgY2hhbmdlZCBieSBjbGllbnQuXG4gICAgICB0aGlzLl9odW1hbkxhbmd1YWdlID0gbmF2aWdhdG9yLmxhbmd1YWdlIHx8ICdlbi1VUyc7XG4gICAgfVxuXG4gICAgQ29ubmVjdGlvbi5sb2dnZXIgPSAoc3RyLCAuLi5hcmdzKSA9PiB7XG4gICAgICB0aGlzLiNsb2dnZXIoc3RyLCBhcmdzKTtcbiAgICB9O1xuICAgIERyYWZ0eS5sb2dnZXIgPSAoc3RyLCAuLi5hcmdzKSA9PiB7XG4gICAgICB0aGlzLiNsb2dnZXIoc3RyLCBhcmdzKTtcbiAgICB9O1xuXG4gICAgLy8gV2ViU29ja2V0IG9yIGxvbmcgcG9sbGluZyBuZXR3b3JrIGNvbm5lY3Rpb24uXG4gICAgaWYgKGNvbmZpZy50cmFuc3BvcnQgIT0gJ2xwJyAmJiBjb25maWcudHJhbnNwb3J0ICE9ICd3cycpIHtcbiAgICAgIGNvbmZpZy50cmFuc3BvcnQgPSBkZXRlY3RUcmFuc3BvcnQoKTtcbiAgICB9XG4gICAgdGhpcy5fY29ubmVjdGlvbiA9IG5ldyBDb25uZWN0aW9uKGNvbmZpZywgQ29uc3QuUFJPVE9DT0xfVkVSU0lPTiwgLyogYXV0b3JlY29ubmVjdCAqLyB0cnVlKTtcbiAgICB0aGlzLl9jb25uZWN0aW9uLm9uTWVzc2FnZSA9IChkYXRhKSA9PiB7XG4gICAgICAvLyBDYWxsIHRoZSBtYWluIG1lc3NhZ2UgZGlzcGF0Y2hlci5cbiAgICAgIHRoaXMuI2Rpc3BhdGNoTWVzc2FnZShkYXRhKTtcbiAgICB9XG4gICAgdGhpcy5fY29ubmVjdGlvbi5vbk9wZW4gPSAoKSA9PiB7XG4gICAgICAvLyBSZWFkeSB0byBzdGFydCBzZW5kaW5nLlxuICAgICAgdGhpcy4jY29ubmVjdGlvbk9wZW4oKTtcbiAgICB9XG4gICAgdGhpcy5fY29ubmVjdGlvbi5vbkRpc2Nvbm5lY3QgPSAoZXJyLCBjb2RlKSA9PiB7XG4gICAgICB0aGlzLiNkaXNjb25uZWN0ZWQoZXJyLCBjb2RlKTtcbiAgICB9XG4gICAgLy8gV3JhcHBlciBmb3IgdGhlIHJlY29ubmVjdCBpdGVyYXRvciBjYWxsYmFjay5cbiAgICB0aGlzLl9jb25uZWN0aW9uLm9uQXV0b3JlY29ubmVjdEl0ZXJhdGlvbiA9ICh0aW1lb3V0LCBwcm9taXNlKSA9PiB7XG4gICAgICBpZiAodGhpcy5vbkF1dG9yZWNvbm5lY3RJdGVyYXRpb24pIHtcbiAgICAgICAgdGhpcy5vbkF1dG9yZWNvbm5lY3RJdGVyYXRpb24odGltZW91dCwgcHJvbWlzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fcGVyc2lzdCA9IGNvbmZpZy5wZXJzaXN0O1xuICAgIC8vIEluaXRpYWxpemUgb2JqZWN0IHJlZ2FyZGxlc3MuIEl0IHNpbXBsaWZpZXMgdGhlIGNvZGUuXG4gICAgdGhpcy5fZGIgPSBuZXcgREJDYWNoZSgoZXJyKSA9PiB7XG4gICAgICB0aGlzLiNsb2dnZXIoJ0RCJywgZXJyKTtcbiAgICB9LCB0aGlzLmxvZ2dlcik7XG5cbiAgICBpZiAodGhpcy5fcGVyc2lzdCkge1xuICAgICAgLy8gQ3JlYXRlIHRoZSBwZXJzaXN0ZW50IGNhY2hlLlxuICAgICAgLy8gU3RvcmUgcHJvbWlzZXMgdG8gYmUgcmVzb2x2ZWQgd2hlbiBtZXNzYWdlcyBsb2FkIGludG8gbWVtb3J5LlxuICAgICAgY29uc3QgcHJvbSA9IFtdO1xuICAgICAgdGhpcy5fZGIuaW5pdERhdGFiYXNlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIC8vIEZpcnN0IGxvYWQgdG9waWNzIGludG8gbWVtb3J5LlxuICAgICAgICByZXR1cm4gdGhpcy5fZGIubWFwVG9waWNzKChkYXRhKSA9PiB7XG4gICAgICAgICAgbGV0IHRvcGljID0gdGhpcy4jY2FjaGVHZXQoJ3RvcGljJywgZGF0YS5uYW1lKTtcbiAgICAgICAgICBpZiAodG9waWMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGRhdGEubmFtZSA9PSBDb25zdC5UT1BJQ19NRSkge1xuICAgICAgICAgICAgdG9waWMgPSBuZXcgVG9waWNNZSgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS5uYW1lID09IENvbnN0LlRPUElDX0ZORCkge1xuICAgICAgICAgICAgdG9waWMgPSBuZXcgVG9waWNGbmQoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG9waWMgPSBuZXcgVG9waWMoZGF0YS5uYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fZGIuZGVzZXJpYWxpemVUb3BpYyh0b3BpYywgZGF0YSk7XG4gICAgICAgICAgdGhpcy4jYXR0YWNoQ2FjaGVUb1RvcGljKHRvcGljKTtcbiAgICAgICAgICB0b3BpYy5fY2FjaGVQdXRTZWxmKCk7XG4gICAgICAgICAgLy8gVG9waWMgbG9hZGVkIGZyb20gREIgaXMgbm90IG5ldy5cbiAgICAgICAgICBkZWxldGUgdG9waWMuX25ldztcbiAgICAgICAgICAvLyBSZXF1ZXN0IHRvIGxvYWQgbWVzc2FnZXMgYW5kIHNhdmUgdGhlIHByb21pc2UuXG4gICAgICAgICAgcHJvbS5wdXNoKHRvcGljLl9sb2FkTWVzc2FnZXModGhpcy5fZGIpKTtcbiAgICAgICAgfSk7XG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gVGhlbiBsb2FkIHVzZXJzLlxuICAgICAgICByZXR1cm4gdGhpcy5fZGIubWFwVXNlcnMoKGRhdGEpID0+IHtcbiAgICAgICAgICB0aGlzLiNjYWNoZVB1dCgndXNlcicsIGRhdGEudWlkLCBtZXJnZU9iaih7fSwgZGF0YS5wdWJsaWMpKTtcbiAgICAgICAgfSk7XG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gTm93IHdhaXQgZm9yIGFsbCBtZXNzYWdlcyB0byBmaW5pc2ggbG9hZGluZy5cbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb20pO1xuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIGlmIChvbkNvbXBsZXRlKSB7XG4gICAgICAgICAgb25Db21wbGV0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuI2xvZ2dlcihcIlBlcnNpc3RlbnQgY2FjaGUgaW5pdGlhbGl6ZWQuXCIpO1xuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBpZiAob25Db21wbGV0ZSkge1xuICAgICAgICAgIG9uQ29tcGxldGUoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiNsb2dnZXIoXCJGYWlsZWQgdG8gaW5pdGlhbGl6ZSBwZXJzaXN0ZW50IGNhY2hlOlwiLCBlcnIpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RiLmRlbGV0ZURhdGFiYXNlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIGlmIChvbkNvbXBsZXRlKSB7XG4gICAgICAgICAgb25Db21wbGV0ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBQcml2YXRlIG1ldGhvZHMuXG5cbiAgLy8gQ29uc29sZSBsb2dnZXIuIEJhYmVsIHNvbWVob3cgZmFpbHMgdG8gcGFyc2UgJy4uLnJlc3QnIHBhcmFtZXRlci5cbiAgI2xvZ2dlcihzdHIsIC4uLmFyZ3MpIHtcbiAgICBpZiAodGhpcy5fbG9nZ2luZ0VuYWJsZWQpIHtcbiAgICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSgpO1xuICAgICAgY29uc3QgZGF0ZVN0cmluZyA9ICgnMCcgKyBkLmdldFVUQ0hvdXJzKCkpLnNsaWNlKC0yKSArICc6JyArXG4gICAgICAgICgnMCcgKyBkLmdldFVUQ01pbnV0ZXMoKSkuc2xpY2UoLTIpICsgJzonICtcbiAgICAgICAgKCcwJyArIGQuZ2V0VVRDU2Vjb25kcygpKS5zbGljZSgtMikgKyAnLicgK1xuICAgICAgICAoJzAwJyArIGQuZ2V0VVRDTWlsbGlzZWNvbmRzKCkpLnNsaWNlKC0zKTtcblxuICAgICAgY29uc29sZS5sb2coJ1snICsgZGF0ZVN0cmluZyArICddJywgc3RyLCBhcmdzLmpvaW4oJyAnKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gR2VuZXJhdG9yIG9mIGRlZmF1bHQgcHJvbWlzZXMgZm9yIHNlbnQgcGFja2V0cy5cbiAgI21ha2VQcm9taXNlKGlkKSB7XG4gICAgbGV0IHByb21pc2UgPSBudWxsO1xuICAgIGlmIChpZCkge1xuICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgLy8gU3RvcmVkIGNhbGxiYWNrcyB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSByZXNwb25zZSBwYWNrZXQgd2l0aCB0aGlzIElkIGFycml2ZXNcbiAgICAgICAgdGhpcy5fcGVuZGluZ1Byb21pc2VzW2lkXSA9IHtcbiAgICAgICAgICAncmVzb2x2ZSc6IHJlc29sdmUsXG4gICAgICAgICAgJ3JlamVjdCc6IHJlamVjdCxcbiAgICAgICAgICAndHMnOiBuZXcgRGF0ZSgpXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH07XG5cbiAgLy8gUmVzb2x2ZSBvciByZWplY3QgYSBwZW5kaW5nIHByb21pc2UuXG4gIC8vIFVucmVzb2x2ZWQgcHJvbWlzZXMgYXJlIHN0b3JlZCBpbiBfcGVuZGluZ1Byb21pc2VzLlxuICAjZXhlY1Byb21pc2UoaWQsIGNvZGUsIG9uT0ssIGVycm9yVGV4dCkge1xuICAgIGNvbnN0IGNhbGxiYWNrcyA9IHRoaXMuX3BlbmRpbmdQcm9taXNlc1tpZF07XG4gICAgaWYgKGNhbGxiYWNrcykge1xuICAgICAgZGVsZXRlIHRoaXMuX3BlbmRpbmdQcm9taXNlc1tpZF07XG4gICAgICBpZiAoY29kZSA+PSAyMDAgJiYgY29kZSA8IDQwMCkge1xuICAgICAgICBpZiAoY2FsbGJhY2tzLnJlc29sdmUpIHtcbiAgICAgICAgICBjYWxsYmFja3MucmVzb2x2ZShvbk9LKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChjYWxsYmFja3MucmVqZWN0KSB7XG4gICAgICAgIGNhbGxiYWNrcy5yZWplY3QobmV3IEVycm9yKGAke2Vycm9yVGV4dH0gKCR7Y29kZX0pYCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFNlbmQgYSBwYWNrZXQuIElmIHBhY2tldCBpZCBpcyBwcm92aWRlZCByZXR1cm4gYSBwcm9taXNlLlxuICAjc2VuZChwa3QsIGlkKSB7XG4gICAgbGV0IHByb21pc2U7XG4gICAgaWYgKGlkKSB7XG4gICAgICBwcm9taXNlID0gdGhpcy4jbWFrZVByb21pc2UoaWQpO1xuICAgIH1cbiAgICBwa3QgPSBzaW1wbGlmeShwa3QpO1xuICAgIGxldCBtc2cgPSBKU09OLnN0cmluZ2lmeShwa3QpO1xuICAgIHRoaXMuI2xvZ2dlcihcIm91dDogXCIgKyAodGhpcy5fdHJpbUxvbmdTdHJpbmdzID8gSlNPTi5zdHJpbmdpZnkocGt0LCBqc29uTG9nZ2VySGVscGVyKSA6IG1zZykpO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9jb25uZWN0aW9uLnNlbmRUZXh0KG1zZyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBJZiBzZW5kVGV4dCB0aHJvd3MsIHdyYXAgdGhlIGVycm9yIGluIGEgcHJvbWlzZSBvciByZXRocm93LlxuICAgICAgaWYgKGlkKSB7XG4gICAgICAgIHRoaXMuI2V4ZWNQcm9taXNlKGlkLCBDb25uZWN0aW9uLk5FVFdPUktfRVJST1IsIG51bGwsIGVyci5tZXNzYWdlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICAvLyBUaGUgbWFpbiBtZXNzYWdlIGRpc3BhdGNoZXIuXG4gICNkaXNwYXRjaE1lc3NhZ2UoZGF0YSkge1xuICAgIC8vIFNraXAgZW1wdHkgcmVzcG9uc2UuIFRoaXMgaGFwcGVucyB3aGVuIExQIHRpbWVzIG91dC5cbiAgICBpZiAoIWRhdGEpXG4gICAgICByZXR1cm47XG5cbiAgICB0aGlzLl9pblBhY2tldENvdW50Kys7XG5cbiAgICAvLyBTZW5kIHJhdyBtZXNzYWdlIHRvIGxpc3RlbmVyXG4gICAgaWYgKHRoaXMub25SYXdNZXNzYWdlKSB7XG4gICAgICB0aGlzLm9uUmF3TWVzc2FnZShkYXRhKTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSA9PT0gJzAnKSB7XG4gICAgICAvLyBTZXJ2ZXIgcmVzcG9uc2UgdG8gYSBuZXR3b3JrIHByb2JlLlxuICAgICAgaWYgKHRoaXMub25OZXR3b3JrUHJvYmUpIHtcbiAgICAgICAgdGhpcy5vbk5ldHdvcmtQcm9iZSgpO1xuICAgICAgfVxuICAgICAgLy8gTm8gcHJvY2Vzc2luZyBpcyBuZWNlc3NhcnkuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHBrdCA9IEpTT04ucGFyc2UoZGF0YSwganNvblBhcnNlSGVscGVyKTtcbiAgICBpZiAoIXBrdCkge1xuICAgICAgdGhpcy4jbG9nZ2VyKFwiaW46IFwiICsgZGF0YSk7XG4gICAgICB0aGlzLiNsb2dnZXIoXCJFUlJPUjogZmFpbGVkIHRvIHBhcnNlIGRhdGFcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuI2xvZ2dlcihcImluOiBcIiArICh0aGlzLl90cmltTG9uZ1N0cmluZ3MgPyBKU09OLnN0cmluZ2lmeShwa3QsIGpzb25Mb2dnZXJIZWxwZXIpIDogZGF0YSkpO1xuXG4gICAgICAvLyBTZW5kIGNvbXBsZXRlIHBhY2tldCB0byBsaXN0ZW5lclxuICAgICAgaWYgKHRoaXMub25NZXNzYWdlKSB7XG4gICAgICAgIHRoaXMub25NZXNzYWdlKHBrdCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwa3QuY3RybCkge1xuICAgICAgICAvLyBIYW5kbGluZyB7Y3RybH0gbWVzc2FnZVxuICAgICAgICBpZiAodGhpcy5vbkN0cmxNZXNzYWdlKSB7XG4gICAgICAgICAgdGhpcy5vbkN0cmxNZXNzYWdlKHBrdC5jdHJsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc29sdmUgb3IgcmVqZWN0IGEgcGVuZGluZyBwcm9taXNlLCBpZiBhbnlcbiAgICAgICAgaWYgKHBrdC5jdHJsLmlkKSB7XG4gICAgICAgICAgdGhpcy4jZXhlY1Byb21pc2UocGt0LmN0cmwuaWQsIHBrdC5jdHJsLmNvZGUsIHBrdC5jdHJsLCBwa3QuY3RybC50ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBpZiAocGt0LmN0cmwuY29kZSA9PSAyMDUgJiYgcGt0LmN0cmwudGV4dCA9PSAnZXZpY3RlZCcpIHtcbiAgICAgICAgICAgIC8vIFVzZXIgZXZpY3RlZCBmcm9tIHRvcGljLlxuICAgICAgICAgICAgY29uc3QgdG9waWMgPSB0aGlzLiNjYWNoZUdldCgndG9waWMnLCBwa3QuY3RybC50b3BpYyk7XG4gICAgICAgICAgICBpZiAodG9waWMpIHtcbiAgICAgICAgICAgICAgdG9waWMuX3Jlc2V0U3ViKCk7XG4gICAgICAgICAgICAgIGlmIChwa3QuY3RybC5wYXJhbXMgJiYgcGt0LmN0cmwucGFyYW1zLnVuc3ViKSB7XG4gICAgICAgICAgICAgICAgdG9waWMuX2dvbmUoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAocGt0LmN0cmwuY29kZSA8IDMwMCAmJiBwa3QuY3RybC5wYXJhbXMpIHtcbiAgICAgICAgICAgIGlmIChwa3QuY3RybC5wYXJhbXMud2hhdCA9PSAnZGF0YScpIHtcbiAgICAgICAgICAgICAgLy8gY29kZT0yMDgsIGFsbCBtZXNzYWdlcyByZWNlaXZlZDogXCJwYXJhbXNcIjp7XCJjb3VudFwiOjExLFwid2hhdFwiOlwiZGF0YVwifSxcbiAgICAgICAgICAgICAgY29uc3QgdG9waWMgPSB0aGlzLiNjYWNoZUdldCgndG9waWMnLCBwa3QuY3RybC50b3BpYyk7XG4gICAgICAgICAgICAgIGlmICh0b3BpYykge1xuICAgICAgICAgICAgICAgIHRvcGljLl9hbGxNZXNzYWdlc1JlY2VpdmVkKHBrdC5jdHJsLnBhcmFtcy5jb3VudCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGt0LmN0cmwucGFyYW1zLndoYXQgPT0gJ3N1YicpIHtcbiAgICAgICAgICAgICAgLy8gY29kZT0yMDQsIHRoZSB0b3BpYyBoYXMgbm8gKHJlZnJlc2hlZCkgc3Vic2NyaXB0aW9ucy5cbiAgICAgICAgICAgICAgY29uc3QgdG9waWMgPSB0aGlzLiNjYWNoZUdldCgndG9waWMnLCBwa3QuY3RybC50b3BpYyk7XG4gICAgICAgICAgICAgIGlmICh0b3BpYykge1xuICAgICAgICAgICAgICAgIC8vIFRyaWdnZXIgdG9waWMub25TdWJzVXBkYXRlZC5cbiAgICAgICAgICAgICAgICB0b3BpYy5fcHJvY2Vzc01ldGFTdWIoW10pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LCAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGlmIChwa3QubWV0YSkge1xuICAgICAgICAgICAgLy8gSGFuZGxpbmcgYSB7bWV0YX0gbWVzc2FnZS5cbiAgICAgICAgICAgIC8vIFByZWZlcnJlZCBBUEk6IFJvdXRlIG1ldGEgdG8gdG9waWMsIGlmIG9uZSBpcyByZWdpc3RlcmVkXG4gICAgICAgICAgICBjb25zdCB0b3BpYyA9IHRoaXMuI2NhY2hlR2V0KCd0b3BpYycsIHBrdC5tZXRhLnRvcGljKTtcbiAgICAgICAgICAgIGlmICh0b3BpYykge1xuICAgICAgICAgICAgICB0b3BpYy5fcm91dGVNZXRhKHBrdC5tZXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHBrdC5tZXRhLmlkKSB7XG4gICAgICAgICAgICAgIHRoaXMuI2V4ZWNQcm9taXNlKHBrdC5tZXRhLmlkLCAyMDAsIHBrdC5tZXRhLCAnTUVUQScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZWNvbmRhcnkgQVBJOiBjYWxsYmFja1xuICAgICAgICAgICAgaWYgKHRoaXMub25NZXRhTWVzc2FnZSkge1xuICAgICAgICAgICAgICB0aGlzLm9uTWV0YU1lc3NhZ2UocGt0Lm1ldGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAocGt0LmRhdGEpIHtcbiAgICAgICAgICAgIC8vIEhhbmRsaW5nIHtkYXRhfSBtZXNzYWdlXG4gICAgICAgICAgICAvLyBQcmVmZXJyZWQgQVBJOiBSb3V0ZSBkYXRhIHRvIHRvcGljLCBpZiBvbmUgaXMgcmVnaXN0ZXJlZFxuICAgICAgICAgICAgY29uc3QgdG9waWMgPSB0aGlzLiNjYWNoZUdldCgndG9waWMnLCBwa3QuZGF0YS50b3BpYyk7XG4gICAgICAgICAgICBpZiAodG9waWMpIHtcbiAgICAgICAgICAgICAgdG9waWMuX3JvdXRlRGF0YShwa3QuZGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNlY29uZGFyeSBBUEk6IENhbGwgY2FsbGJhY2tcbiAgICAgICAgICAgIGlmICh0aGlzLm9uRGF0YU1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgdGhpcy5vbkRhdGFNZXNzYWdlKHBrdC5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHBrdC5wcmVzKSB7XG4gICAgICAgICAgICAvLyBIYW5kbGluZyB7cHJlc30gbWVzc2FnZVxuICAgICAgICAgICAgLy8gUHJlZmVycmVkIEFQSTogUm91dGUgcHJlc2VuY2UgdG8gdG9waWMsIGlmIG9uZSBpcyByZWdpc3RlcmVkXG4gICAgICAgICAgICBjb25zdCB0b3BpYyA9IHRoaXMuI2NhY2hlR2V0KCd0b3BpYycsIHBrdC5wcmVzLnRvcGljKTtcbiAgICAgICAgICAgIGlmICh0b3BpYykge1xuICAgICAgICAgICAgICB0b3BpYy5fcm91dGVQcmVzKHBrdC5wcmVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2Vjb25kYXJ5IEFQSSAtIGNhbGxiYWNrXG4gICAgICAgICAgICBpZiAodGhpcy5vblByZXNNZXNzYWdlKSB7XG4gICAgICAgICAgICAgIHRoaXMub25QcmVzTWVzc2FnZShwa3QucHJlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChwa3QuaW5mbykge1xuICAgICAgICAgICAgLy8ge2luZm99IG1lc3NhZ2UgLSByZWFkL3JlY2VpdmVkIG5vdGlmaWNhdGlvbnMgYW5kIGtleSBwcmVzc2VzXG4gICAgICAgICAgICAvLyBQcmVmZXJyZWQgQVBJOiBSb3V0ZSB7aW5mb319IHRvIHRvcGljLCBpZiBvbmUgaXMgcmVnaXN0ZXJlZFxuICAgICAgICAgICAgY29uc3QgdG9waWMgPSB0aGlzLiNjYWNoZUdldCgndG9waWMnLCBwa3QuaW5mby50b3BpYyk7XG4gICAgICAgICAgICBpZiAodG9waWMpIHtcbiAgICAgICAgICAgICAgdG9waWMuX3JvdXRlSW5mbyhwa3QuaW5mbyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNlY29uZGFyeSBBUEkgLSBjYWxsYmFja1xuICAgICAgICAgICAgaWYgKHRoaXMub25JbmZvTWVzc2FnZSkge1xuICAgICAgICAgICAgICB0aGlzLm9uSW5mb01lc3NhZ2UocGt0LmluZm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiNsb2dnZXIoXCJFUlJPUjogVW5rbm93biBwYWNrZXQgcmVjZWl2ZWQuXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgMCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQ29ubmVjdGlvbiBvcGVuLCByZWFkeSB0byBzdGFydCBzZW5kaW5nLlxuICAjY29ubmVjdGlvbk9wZW4oKSB7XG4gICAgaWYgKCF0aGlzLl9leHBpcmVQcm9taXNlcykge1xuICAgICAgLy8gUmVqZWN0IHByb21pc2VzIHdoaWNoIGhhdmUgbm90IGJlZW4gcmVzb2x2ZWQgZm9yIHRvbyBsb25nLlxuICAgICAgdGhpcy5fZXhwaXJlUHJvbWlzZXMgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcihcIlRpbWVvdXQgKDUwNClcIik7XG4gICAgICAgIGNvbnN0IGV4cGlyZXMgPSBuZXcgRGF0ZShuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIENvbnN0LkVYUElSRV9QUk9NSVNFU19USU1FT1VUKTtcbiAgICAgICAgZm9yIChsZXQgaWQgaW4gdGhpcy5fcGVuZGluZ1Byb21pc2VzKSB7XG4gICAgICAgICAgbGV0IGNhbGxiYWNrcyA9IHRoaXMuX3BlbmRpbmdQcm9taXNlc1tpZF07XG4gICAgICAgICAgaWYgKGNhbGxiYWNrcyAmJiBjYWxsYmFja3MudHMgPCBleHBpcmVzKSB7XG4gICAgICAgICAgICB0aGlzLiNsb2dnZXIoXCJQcm9taXNlIGV4cGlyZWRcIiwgaWQpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3BlbmRpbmdQcm9taXNlc1tpZF07XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2tzLnJlamVjdCkge1xuICAgICAgICAgICAgICBjYWxsYmFja3MucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCBDb25zdC5FWFBJUkVfUFJPTUlTRVNfUEVSSU9EKTtcbiAgICB9XG4gICAgdGhpcy5oZWxsbygpO1xuICB9XG5cbiAgI2Rpc2Nvbm5lY3RlZChlcnIsIGNvZGUpIHtcbiAgICB0aGlzLl9pblBhY2tldENvdW50ID0gMDtcbiAgICB0aGlzLl9zZXJ2ZXJJbmZvID0gbnVsbDtcbiAgICB0aGlzLl9hdXRoZW50aWNhdGVkID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5fZXhwaXJlUHJvbWlzZXMpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fZXhwaXJlUHJvbWlzZXMpO1xuICAgICAgdGhpcy5fZXhwaXJlUHJvbWlzZXMgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIE1hcmsgYWxsIHRvcGljcyBhcyB1bnN1YnNjcmliZWRcbiAgICB0aGlzLiNjYWNoZU1hcCgndG9waWMnLCAodG9waWMsIGtleSkgPT4ge1xuICAgICAgdG9waWMuX3Jlc2V0U3ViKCk7XG4gICAgfSk7XG5cbiAgICAvLyBSZWplY3QgYWxsIHBlbmRpbmcgcHJvbWlzZXNcbiAgICBmb3IgKGxldCBrZXkgaW4gdGhpcy5fcGVuZGluZ1Byb21pc2VzKSB7XG4gICAgICBjb25zdCBjYWxsYmFja3MgPSB0aGlzLl9wZW5kaW5nUHJvbWlzZXNba2V5XTtcbiAgICAgIGlmIChjYWxsYmFja3MgJiYgY2FsbGJhY2tzLnJlamVjdCkge1xuICAgICAgICBjYWxsYmFja3MucmVqZWN0KGVycik7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3BlbmRpbmdQcm9taXNlcyA9IHt9O1xuXG4gICAgaWYgKHRoaXMub25EaXNjb25uZWN0KSB7XG4gICAgICB0aGlzLm9uRGlzY29ubmVjdChlcnIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEdldCBVc2VyIEFnZW50IHN0cmluZ1xuICAjZ2V0VXNlckFnZW50KCkge1xuICAgIHJldHVybiB0aGlzLl9hcHBOYW1lICsgJyAoJyArICh0aGlzLl9icm93c2VyID8gdGhpcy5fYnJvd3NlciArICc7ICcgOiAnJykgKyB0aGlzLl9od29zICsgJyk7ICcgKyBDb25zdC5MSUJSQVJZO1xuICB9XG5cbiAgLy8gR2VuZXJhdG9yIG9mIHBhY2tldHMgc3R1YnNcbiAgI2luaXRQYWNrZXQodHlwZSwgdG9waWMpIHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ2hpJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAnaGknOiB7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLmdldE5leHRVbmlxdWVJZCgpLFxuICAgICAgICAgICAgJ3Zlcic6IENvbnN0LlZFUlNJT04sXG4gICAgICAgICAgICAndWEnOiB0aGlzLiNnZXRVc2VyQWdlbnQoKSxcbiAgICAgICAgICAgICdkZXYnOiB0aGlzLl9kZXZpY2VUb2tlbixcbiAgICAgICAgICAgICdsYW5nJzogdGhpcy5faHVtYW5MYW5ndWFnZSxcbiAgICAgICAgICAgICdwbGF0Zic6IHRoaXMuX3BsYXRmb3JtXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICBjYXNlICdhY2MnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICdhY2MnOiB7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLmdldE5leHRVbmlxdWVJZCgpLFxuICAgICAgICAgICAgJ3VzZXInOiBudWxsLFxuICAgICAgICAgICAgJ3NjaGVtZSc6IG51bGwsXG4gICAgICAgICAgICAnc2VjcmV0JzogbnVsbCxcbiAgICAgICAgICAgICdsb2dpbic6IGZhbHNlLFxuICAgICAgICAgICAgJ3RhZ3MnOiBudWxsLFxuICAgICAgICAgICAgJ2Rlc2MnOiB7fSxcbiAgICAgICAgICAgICdjcmVkJzoge31cbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgIGNhc2UgJ2xvZ2luJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAnbG9naW4nOiB7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLmdldE5leHRVbmlxdWVJZCgpLFxuICAgICAgICAgICAgJ3NjaGVtZSc6IG51bGwsXG4gICAgICAgICAgICAnc2VjcmV0JzogbnVsbFxuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgY2FzZSAnc3ViJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAnc3ViJzoge1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5nZXROZXh0VW5pcXVlSWQoKSxcbiAgICAgICAgICAgICd0b3BpYyc6IHRvcGljLFxuICAgICAgICAgICAgJ3NldCc6IHt9LFxuICAgICAgICAgICAgJ2dldCc6IHt9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICBjYXNlICdsZWF2ZSc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgJ2xlYXZlJzoge1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5nZXROZXh0VW5pcXVlSWQoKSxcbiAgICAgICAgICAgICd0b3BpYyc6IHRvcGljLFxuICAgICAgICAgICAgJ3Vuc3ViJzogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgIGNhc2UgJ3B1Yic6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgJ3B1Yic6IHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMuZ2V0TmV4dFVuaXF1ZUlkKCksXG4gICAgICAgICAgICAndG9waWMnOiB0b3BpYyxcbiAgICAgICAgICAgICdub2VjaG8nOiBmYWxzZSxcbiAgICAgICAgICAgICdoZWFkJzogbnVsbCxcbiAgICAgICAgICAgICdjb250ZW50Jzoge31cbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgIGNhc2UgJ2dldCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgJ2dldCc6IHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMuZ2V0TmV4dFVuaXF1ZUlkKCksXG4gICAgICAgICAgICAndG9waWMnOiB0b3BpYyxcbiAgICAgICAgICAgICd3aGF0JzogbnVsbCxcbiAgICAgICAgICAgICdkZXNjJzoge30sXG4gICAgICAgICAgICAnc3ViJzoge30sXG4gICAgICAgICAgICAnZGF0YSc6IHt9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICBjYXNlICdzZXQnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICdzZXQnOiB7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLmdldE5leHRVbmlxdWVJZCgpLFxuICAgICAgICAgICAgJ3RvcGljJzogdG9waWMsXG4gICAgICAgICAgICAnZGVzYyc6IHt9LFxuICAgICAgICAgICAgJ3N1Yic6IHt9LFxuICAgICAgICAgICAgJ3RhZ3MnOiBbXVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgY2FzZSAnZGVsJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAnZGVsJzoge1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5nZXROZXh0VW5pcXVlSWQoKSxcbiAgICAgICAgICAgICd0b3BpYyc6IHRvcGljLFxuICAgICAgICAgICAgJ3doYXQnOiBudWxsLFxuICAgICAgICAgICAgJ2RlbHNlcSc6IG51bGwsXG4gICAgICAgICAgICAndXNlcic6IG51bGwsXG4gICAgICAgICAgICAnaGFyZCc6IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICBjYXNlICdub3RlJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAnbm90ZSc6IHtcbiAgICAgICAgICAgIC8vIG5vIGlkIGJ5IGRlc2lnblxuICAgICAgICAgICAgJ3RvcGljJzogdG9waWMsXG4gICAgICAgICAgICAnd2hhdCc6IG51bGwsXG4gICAgICAgICAgICAnc2VxJzogdW5kZWZpbmVkIC8vIHRoZSBzZXJ2ZXItc2lkZSBtZXNzYWdlIGlkIGFrbm93bGVkZ2VkIGFzIHJlY2VpdmVkIG9yIHJlYWRcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwYWNrZXQgdHlwZSByZXF1ZXN0ZWQ6ICR7dHlwZX1gKTtcbiAgICB9XG4gIH1cblxuICAvLyBDYWNoZSBtYW5hZ2VtZW50XG4gICNjYWNoZVB1dCh0eXBlLCBuYW1lLCBvYmopIHtcbiAgICB0aGlzLl9jYWNoZVt0eXBlICsgJzonICsgbmFtZV0gPSBvYmo7XG4gIH1cbiAgI2NhY2hlR2V0KHR5cGUsIG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVbdHlwZSArICc6JyArIG5hbWVdO1xuICB9XG4gICNjYWNoZURlbCh0eXBlLCBuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NhY2hlW3R5cGUgKyAnOicgKyBuYW1lXTtcbiAgfVxuXG4gIC8vIEVudW1lcmF0ZSBhbGwgaXRlbXMgaW4gY2FjaGUsIGNhbGwgZnVuYyBmb3IgZWFjaCBpdGVtLlxuICAvLyBFbnVtZXJhdGlvbiBzdG9wcyBpZiBmdW5jIHJldHVybnMgdHJ1ZS5cbiAgI2NhY2hlTWFwKHR5cGUsIGZ1bmMsIGNvbnRleHQpIHtcbiAgICBjb25zdCBrZXkgPSB0eXBlID8gdHlwZSArICc6JyA6IHVuZGVmaW5lZDtcbiAgICBmb3IgKGxldCBpZHggaW4gdGhpcy5fY2FjaGUpIHtcbiAgICAgIGlmICgha2V5IHx8IGlkeC5pbmRleE9mKGtleSkgPT0gMCkge1xuICAgICAgICBpZiAoZnVuYy5jYWxsKGNvbnRleHQsIHRoaXMuX2NhY2hlW2lkeF0sIGlkeCkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIE1ha2UgbGltaXRlZCBjYWNoZSBtYW5hZ2VtZW50IGF2YWlsYWJsZSB0byB0b3BpYy5cbiAgLy8gQ2FjaGluZyB1c2VyLnB1YmxpYyBvbmx5LiBFdmVyeXRoaW5nIGVsc2UgaXMgcGVyLXRvcGljLlxuICAjYXR0YWNoQ2FjaGVUb1RvcGljKHRvcGljKSB7XG4gICAgdG9waWMuX3Rpbm9kZSA9IHRoaXM7XG5cbiAgICB0b3BpYy5fY2FjaGVHZXRVc2VyID0gKHVpZCkgPT4ge1xuICAgICAgY29uc3QgcHViID0gdGhpcy4jY2FjaGVHZXQoJ3VzZXInLCB1aWQpO1xuICAgICAgaWYgKHB1Yikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHVzZXI6IHVpZCxcbiAgICAgICAgICBwdWJsaWM6IG1lcmdlT2JqKHt9LCBwdWIpXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gICAgdG9waWMuX2NhY2hlUHV0VXNlciA9ICh1aWQsIHVzZXIpID0+IHtcbiAgICAgIHRoaXMuI2NhY2hlUHV0KCd1c2VyJywgdWlkLCBtZXJnZU9iaih7fSwgdXNlci5wdWJsaWMpKTtcbiAgICB9O1xuICAgIHRvcGljLl9jYWNoZURlbFVzZXIgPSAodWlkKSA9PiB7XG4gICAgICB0aGlzLiNjYWNoZURlbCgndXNlcicsIHVpZCk7XG4gICAgfTtcbiAgICB0b3BpYy5fY2FjaGVQdXRTZWxmID0gKCkgPT4ge1xuICAgICAgdGhpcy4jY2FjaGVQdXQoJ3RvcGljJywgdG9waWMubmFtZSwgdG9waWMpO1xuICAgIH07XG4gICAgdG9waWMuX2NhY2hlRGVsU2VsZiA9ICgpID0+IHtcbiAgICAgIHRoaXMuI2NhY2hlRGVsKCd0b3BpYycsIHRvcGljLm5hbWUpO1xuICAgIH07XG4gIH1cblxuICAvLyBPbiBzdWNjZXNzZnVsIGxvZ2luIHNhdmUgc2VydmVyLXByb3ZpZGVkIGRhdGEuXG4gICNsb2dpblN1Y2Nlc3NmdWwoY3RybCkge1xuICAgIGlmICghY3RybC5wYXJhbXMgfHwgIWN0cmwucGFyYW1zLnVzZXIpIHtcbiAgICAgIHJldHVybiBjdHJsO1xuICAgIH1cbiAgICAvLyBUaGlzIGlzIGEgcmVzcG9uc2UgdG8gYSBzdWNjZXNzZnVsIGxvZ2luLFxuICAgIC8vIGV4dHJhY3QgVUlEIGFuZCBzZWN1cml0eSB0b2tlbiwgc2F2ZSBpdCBpbiBUaW5vZGUgbW9kdWxlXG4gICAgdGhpcy5fbXlVSUQgPSBjdHJsLnBhcmFtcy51c2VyO1xuICAgIHRoaXMuX2F1dGhlbnRpY2F0ZWQgPSAoY3RybCAmJiBjdHJsLmNvZGUgPj0gMjAwICYmIGN0cmwuY29kZSA8IDMwMCk7XG4gICAgaWYgKGN0cmwucGFyYW1zICYmIGN0cmwucGFyYW1zLnRva2VuICYmIGN0cmwucGFyYW1zLmV4cGlyZXMpIHtcbiAgICAgIHRoaXMuX2F1dGhUb2tlbiA9IHtcbiAgICAgICAgdG9rZW46IGN0cmwucGFyYW1zLnRva2VuLFxuICAgICAgICBleHBpcmVzOiBjdHJsLnBhcmFtcy5leHBpcmVzXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hdXRoVG9rZW4gPSBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9uTG9naW4pIHtcbiAgICAgIHRoaXMub25Mb2dpbihjdHJsLmNvZGUsIGN0cmwudGV4dCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGN0cmw7XG4gIH1cblxuICAvLyBTdGF0aWMgbWV0aG9kcy5cbiAgLyoqXG4gICAqIEhlbHBlciBtZXRob2QgdG8gcGFja2FnZSBhY2NvdW50IGNyZWRlbnRpYWwuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IENyZWRlbnRpYWx9IG1ldGggLSB2YWxpZGF0aW9uIG1ldGhvZCBvciBvYmplY3Qgd2l0aCB2YWxpZGF0aW9uIGRhdGEuXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gdmFsIC0gdmFsaWRhdGlvbiB2YWx1ZSAoZS5nLiBlbWFpbCBvciBwaG9uZSBudW1iZXIpLlxuICAgKiBAcGFyYW0ge09iamVjdD19IHBhcmFtcyAtIHZhbGlkYXRpb24gcGFyYW1ldGVycy5cbiAgICogQHBhcmFtIHtzdHJpbmc9fSByZXNwIC0gdmFsaWRhdGlvbiByZXNwb25zZS5cbiAgICpcbiAgICogQHJldHVybnMge0FycmF5LjxDcmVkZW50aWFsPn0gYXJyYXkgd2l0aCBhIHNpbmdsZSBjcmVkZW50aWFsIG9yIDxjb2RlPm51bGw8L2NvZGU+IGlmIG5vIHZhbGlkIGNyZWRlbnRpYWxzIHdlcmUgZ2l2ZW4uXG4gICAqL1xuICBzdGF0aWMgY3JlZGVudGlhbChtZXRoLCB2YWwsIHBhcmFtcywgcmVzcCkge1xuICAgIGlmICh0eXBlb2YgbWV0aCA9PSAnb2JqZWN0Jykge1xuICAgICAgKHtcbiAgICAgICAgdmFsLFxuICAgICAgICBwYXJhbXMsXG4gICAgICAgIHJlc3AsXG4gICAgICAgIG1ldGhcbiAgICAgIH0gPSBtZXRoKTtcbiAgICB9XG4gICAgaWYgKG1ldGggJiYgKHZhbCB8fCByZXNwKSkge1xuICAgICAgcmV0dXJuIFt7XG4gICAgICAgICdtZXRoJzogbWV0aCxcbiAgICAgICAgJ3ZhbCc6IHZhbCxcbiAgICAgICAgJ3Jlc3AnOiByZXNwLFxuICAgICAgICAncGFyYW1zJzogcGFyYW1zXG4gICAgICB9XTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIHRvcGljIHR5cGUgZnJvbSB0b3BpYydzIG5hbWU6IGdycCwgcDJwLCBtZSwgZm5kLCBzeXMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIHRlc3QuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IE9uZSBvZiA8Y29kZT5cIm1lXCI8L2NvZGU+LCA8Y29kZT5cImZuZFwiPC9jb2RlPiwgPGNvZGU+XCJzeXNcIjwvY29kZT4sIDxjb2RlPlwiZ3JwXCI8L2NvZGU+LFxuICAgKiAgICA8Y29kZT5cInAycFwiPC9jb2RlPiBvciA8Y29kZT51bmRlZmluZWQ8L2NvZGU+LlxuICAgKi9cbiAgc3RhdGljIHRvcGljVHlwZShuYW1lKSB7XG4gICAgcmV0dXJuIFRvcGljLnRvcGljVHlwZShuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgZ2l2ZW4gdG9waWMgbmFtZSBpcyBhIG5hbWUgb2YgYSAnbWUnIHRvcGljLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSB0b3BpYyB0byB0ZXN0LlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlIG5hbWUgaXMgYSBuYW1lIG9mIGEgJ21lJyB0b3BpYywgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIHN0YXRpYyBpc01lVG9waWNOYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gVG9waWMuaXNNZVRvcGljTmFtZShuYW1lKTtcbiAgfVxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIGdpdmVuIHRvcGljIG5hbWUgaXMgYSBuYW1lIG9mIGEgZ3JvdXAgdG9waWMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIHRlc3QuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiB0aGUgbmFtZSBpcyBhIG5hbWUgb2YgYSBncm91cCB0b3BpYywgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIHN0YXRpYyBpc0dyb3VwVG9waWNOYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gVG9waWMuaXNHcm91cFRvcGljTmFtZShuYW1lKTtcbiAgfVxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIGdpdmVuIHRvcGljIG5hbWUgaXMgYSBuYW1lIG9mIGEgcDJwIHRvcGljLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSB0b3BpYyB0byB0ZXN0LlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlIG5hbWUgaXMgYSBuYW1lIG9mIGEgcDJwIHRvcGljLCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICAgKi9cbiAgc3RhdGljIGlzUDJQVG9waWNOYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gVG9waWMuaXNQMlBUb3BpY05hbWUobmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBnaXZlbiB0b3BpYyBuYW1lIGlzIGEgbmFtZSBvZiBhIGNvbW11bmljYXRpb24gdG9waWMsIGkuZS4gUDJQIG9yIGdyb3VwLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSB0b3BpYyB0byB0ZXN0LlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlIG5hbWUgaXMgYSBuYW1lIG9mIGEgcDJwIG9yIGdyb3VwIHRvcGljLCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICAgKi9cbiAgc3RhdGljIGlzQ29tbVRvcGljTmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIFRvcGljLmlzQ29tbVRvcGljTmFtZShuYW1lKTtcbiAgfVxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIHRvcGljIG5hbWUgaXMgYSBuYW1lIG9mIGEgbmV3IHRvcGljLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSB0b3BpYyBuYW1lIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlIG5hbWUgaXMgYSBuYW1lIG9mIGEgbmV3IHRvcGljLCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICAgKi9cbiAgc3RhdGljIGlzTmV3R3JvdXBUb3BpY05hbWUobmFtZSkge1xuICAgIHJldHVybiBUb3BpYy5pc05ld0dyb3VwVG9waWNOYW1lKG5hbWUpO1xuICB9XG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgdG9waWMgbmFtZSBpcyBhIG5hbWUgb2YgYSBjaGFubmVsLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSB0b3BpYyBuYW1lIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlIG5hbWUgaXMgYSBuYW1lIG9mIGEgY2hhbm5lbCwgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIHN0YXRpYyBpc0NoYW5uZWxUb3BpY05hbWUobmFtZSkge1xuICAgIHJldHVybiBUb3BpYy5pc0NoYW5uZWxUb3BpY05hbWUobmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybiBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCB2ZXJzaW9uIG9mIHRoaXMgVGlub2RlIGNsaWVudCBsaWJyYXJ5LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gc2VtYW50aWMgdmVyc2lvbiBvZiB0aGUgbGlicmFyeSwgZS5nLiA8Y29kZT5cIjAuMTUuNS1yYzFcIjwvY29kZT4uXG4gICAqL1xuICBzdGF0aWMgZ2V0VmVyc2lvbigpIHtcbiAgICByZXR1cm4gQ29uc3QuVkVSU0lPTjtcbiAgfVxuICAvKipcbiAgICogVG8gdXNlIFRpbm9kZSBpbiBhIG5vbiBicm93c2VyIGNvbnRleHQsIHN1cHBseSBXZWJTb2NrZXQgYW5kIFhNTEh0dHBSZXF1ZXN0IHByb3ZpZGVycy5cbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBwYXJhbSB3c1Byb3ZpZGVyIDxjb2RlPldlYlNvY2tldDwvY29kZT4gcHJvdmlkZXIsIGUuZy4gZm9yIG5vZGVKUyAsIDxjb2RlPnJlcXVpcmUoJ3dzJyk8L2NvZGU+LlxuICAgKiBAcGFyYW0geGhyUHJvdmlkZXIgPGNvZGU+WE1MSHR0cFJlcXVlc3Q8L2NvZGU+IHByb3ZpZGVyLCBlLmcuIGZvciBub2RlIDxjb2RlPnJlcXVpcmUoJ3hocicpPC9jb2RlPi5cbiAgICovXG4gIHN0YXRpYyBzZXROZXR3b3JrUHJvdmlkZXJzKHdzUHJvdmlkZXIsIHhoclByb3ZpZGVyKSB7XG4gICAgV2ViU29ja2V0UHJvdmlkZXIgPSB3c1Byb3ZpZGVyO1xuICAgIFhIUlByb3ZpZGVyID0geGhyUHJvdmlkZXI7XG5cbiAgICBDb25uZWN0aW9uLnNldE5ldHdvcmtQcm92aWRlcnMoV2ViU29ja2V0UHJvdmlkZXIsIFhIUlByb3ZpZGVyKTtcbiAgICBMYXJnZUZpbGVIZWxwZXIuc2V0TmV0d29ya1Byb3ZpZGVyKFhIUlByb3ZpZGVyKTtcbiAgfVxuICAvKipcbiAgICogVG8gdXNlIFRpbm9kZSBpbiBhIG5vbiBicm93c2VyIGNvbnRleHQsIHN1cHBseSA8Y29kZT5pbmRleGVkREI8L2NvZGU+IHByb3ZpZGVyLlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHBhcmFtIGlkYlByb3ZpZGVyIDxjb2RlPmluZGV4ZWREQjwvY29kZT4gcHJvdmlkZXIsIGUuZy4gZm9yIG5vZGVKUyAsIDxjb2RlPnJlcXVpcmUoJ2Zha2UtaW5kZXhlZGRiJyk8L2NvZGU+LlxuICAgKi9cbiAgc3RhdGljIHNldERhdGFiYXNlUHJvdmlkZXIoaWRiUHJvdmlkZXIpIHtcbiAgICBJbmRleGVkREJQcm92aWRlciA9IGlkYlByb3ZpZGVyO1xuXG4gICAgREJDYWNoZS5zZXREYXRhYmFzZVByb3ZpZGVyKEluZGV4ZWREQlByb3ZpZGVyKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJuIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IG5hbWUgYW5kIHZlcnNpb24gb2YgdGhpcyBUaW5vZGUgbGlicmFyeS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAc3RhdGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBuYW1lIG9mIHRoZSBsaWJyYXJ5IGFuZCBpdCdzIHZlcnNpb24uXG4gICAqL1xuICBzdGF0aWMgZ2V0TGlicmFyeSgpIHtcbiAgICByZXR1cm4gQ29uc3QuTElCUkFSWTtcbiAgfVxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIGdpdmVuIHN0cmluZyByZXByZXNlbnRzIDxjb2RlPk5VTEw8L2NvZGU+IHZhbHVlIGFzIGRlZmluZWQgYnkgVGlub2RlICg8Y29kZT4nXFx1MjQyMSc8L2NvZGU+KS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAc3RhdGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgLSBzdHJpbmcgdG8gY2hlY2sgZm9yIDxjb2RlPk5VTEw8L2NvZGU+IHZhbHVlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgc3RyaW5nIHJlcHJlc2VudHMgPGNvZGU+TlVMTDwvY29kZT4gdmFsdWUsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBzdGF0aWMgaXNOdWxsVmFsdWUoc3RyKSB7XG4gICAgcmV0dXJuIHN0ciA9PT0gQ29uc3QuREVMX0NIQVI7XG4gIH1cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBnaXZlbiBVUkwgc3RyaW5nIGlzIGEgcmVsYXRpdmUgVVJMLlxuICAgKiBDaGVjayBmb3IgY2FzZXMgbGlrZTpcbiAgICogIDxjb2RlPidodHRwOi8vZXhhbXBsZS5jb20nPC9jb2RlPlxuICAgKiAgPGNvZGU+JyBodHRwOi8vZXhhbXBsZS5jb20nPC9jb2RlPlxuICAgKiAgPGNvZGU+Jy8vZXhhbXBsZS5jb20vJzwvY29kZT5cbiAgICogIDxjb2RlPidodHRwOmV4YW1wbGUuY29tJzwvY29kZT5cbiAgICogIDxjb2RlPidodHRwOi9leGFtcGxlLmNvbSc8L2NvZGU+XG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gVVJMIHN0cmluZyB0byBjaGVjay5cbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IDxjb2RlPnRydWU8L2NvZGU+IGlmIHRoZSBVUkwgaXMgcmVsYXRpdmUsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBzdGF0aWMgaXNSZWxhdGl2ZVVSTCh1cmwpIHtcbiAgICByZXR1cm4gIS9eXFxzKihbYS16XVthLXowLTkrLi1dKjp8XFwvXFwvKS9pbS50ZXN0KHVybCk7XG4gIH1cblxuICAvLyBJbnN0YW5jZSBtZXRob2RzLlxuXG4gIC8vIEdlbmVyYXRlcyB1bmlxdWUgbWVzc2FnZSBJRHNcbiAgZ2V0TmV4dFVuaXF1ZUlkKCkge1xuICAgIHJldHVybiAodGhpcy5fbWVzc2FnZUlkICE9IDApID8gJycgKyB0aGlzLl9tZXNzYWdlSWQrKyA6IHVuZGVmaW5lZDtcbiAgfTtcblxuICAvKipcbiAgICogQ29ubmVjdCB0byB0aGUgc2VydmVyLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaG9zdF8gLSBuYW1lIG9mIHRoZSBob3N0IHRvIGNvbm5lY3QgdG8uXG4gICAqXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IFByb21pc2UgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgY29ubmVjdGlvbiBjYWxsIGNvbXBsZXRlczpcbiAgICogICAgPGNvZGU+cmVzb2x2ZSgpPC9jb2RlPiBpcyBjYWxsZWQgd2l0aG91dCBwYXJhbWV0ZXJzLCA8Y29kZT5yZWplY3QoKTwvY29kZT4gcmVjZWl2ZXMgdGhlXG4gICAqICAgIDxjb2RlPkVycm9yPC9jb2RlPiBhcyBhIHNpbmdsZSBwYXJhbWV0ZXIuXG4gICAqL1xuICBjb25uZWN0KGhvc3RfKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24uY29ubmVjdChob3N0Xyk7XG4gIH1cblxuICAvKipcbiAgICogQXR0ZW1wdCB0byByZWNvbm5lY3QgdG8gdGhlIHNlcnZlciBpbW1lZGlhdGVseS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZvcmNlIC0gcmVjb25uZWN0IGV2ZW4gaWYgdGhlcmUgaXMgYSBjb25uZWN0aW9uIGFscmVhZHkuXG4gICAqL1xuICByZWNvbm5lY3QoZm9yY2UpIHtcbiAgICB0aGlzLl9jb25uZWN0aW9uLnJlY29ubmVjdChmb3JjZSk7XG4gIH1cblxuICAvKipcbiAgICogRGlzY29ubmVjdCBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqL1xuICBkaXNjb25uZWN0KCkge1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24uZGlzY29ubmVjdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHBlcnNpc3RlbnQgY2FjaGU6IHJlbW92ZSBJbmRleGVkREIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IFByb21pc2UgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgb3BlcmF0aW9uIGlzIGNvbXBsZXRlZC5cbiAgICovXG4gIGNsZWFyU3RvcmFnZSgpIHtcbiAgICBpZiAodGhpcy5fZGIuaXNSZWFkeSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGIuZGVsZXRlRGF0YWJhc2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgcGVyc2lzdGVudCBjYWNoZTogY3JlYXRlIEluZGV4ZWREQiBjYWNoZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICogQHJldHVybiB7UHJvbWlzZX0gUHJvbWlzZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHRoZSBvcGVyYXRpb24gaXMgY29tcGxldGVkLlxuICAgKi9cbiAgaW5pdFN0b3JhZ2UoKSB7XG4gICAgaWYgKCF0aGlzLl9kYi5pc1JlYWR5KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kYi5pbml0RGF0YWJhc2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgYSBuZXR3b3JrIHByb2JlIG1lc3NhZ2UgdG8gbWFrZSBzdXJlIHRoZSBjb25uZWN0aW9uIGlzIGFsaXZlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKi9cbiAgbmV0d29ya1Byb2JlKCkge1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24ucHJvYmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgbGl2ZSBjb25uZWN0aW9uIHRvIHNlcnZlci5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IDxjb2RlPnRydWU8L2NvZGU+IGlmIHRoZXJlIGlzIGEgbGl2ZSBjb25uZWN0aW9uLCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICAgKi9cbiAgaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24uaXNDb25uZWN0ZWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBjb25uZWN0aW9uIGlzIGF1dGhlbnRpY2F0ZWQgKGxhc3QgbG9naW4gd2FzIHN1Y2Nlc3NmdWwpLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgYXV0aGVudGljYXRlZCwgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIGlzQXV0aGVudGljYXRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXV0aGVudGljYXRlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgQVBJIGtleSBhbmQgYXV0aCB0b2tlbiB0byB0aGUgcmVsYXRpdmUgVVJMIG1ha2luZyBpdCB1c2FibGUgZm9yIGdldHRpbmcgZGF0YVxuICAgKiBmcm9tIHRoZSBzZXJ2ZXIgaW4gYSBzaW1wbGUgPGNvZGU+SFRUUCBHRVQ8L2NvZGU+IHJlcXVlc3QuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBVUkwgLSBVUkwgdG8gd3JhcC5cbiAgICogQHJldHVybnMge3N0cmluZ30gVVJMIHdpdGggYXBwZW5kZWQgQVBJIGtleSBhbmQgdG9rZW4sIGlmIHZhbGlkIHRva2VuIGlzIHByZXNlbnQuXG4gICAqL1xuICBhdXRob3JpemVVUkwodXJsKSB7XG4gICAgaWYgKHR5cGVvZiB1cmwgIT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB1cmw7XG4gICAgfVxuXG4gICAgaWYgKFRpbm9kZS5pc1JlbGF0aXZlVVJMKHVybCkpIHtcbiAgICAgIC8vIEZha2UgYmFzZSB0byBtYWtlIHRoZSByZWxhdGl2ZSBVUkwgcGFyc2VhYmxlLlxuICAgICAgY29uc3QgYmFzZSA9ICdzY2hlbWU6Ly9ob3N0Lyc7XG4gICAgICBjb25zdCBwYXJzZWQgPSBuZXcgVVJMKHVybCwgYmFzZSk7XG4gICAgICBpZiAodGhpcy5fYXBpS2V5KSB7XG4gICAgICAgIHBhcnNlZC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdhcGlrZXknLCB0aGlzLl9hcGlLZXkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2F1dGhUb2tlbiAmJiB0aGlzLl9hdXRoVG9rZW4udG9rZW4pIHtcbiAgICAgICAgcGFyc2VkLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ2F1dGgnLCAndG9rZW4nKTtcbiAgICAgICAgcGFyc2VkLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ3NlY3JldCcsIHRoaXMuX2F1dGhUb2tlbi50b2tlbik7XG4gICAgICB9XG4gICAgICAvLyBDb252ZXJ0IGJhY2sgdG8gc3RyaW5nIGFuZCBzdHJpcCBmYWtlIGJhc2UgVVJMIGV4Y2VwdCBmb3IgdGhlIHJvb3Qgc2xhc2guXG4gICAgICB1cmwgPSBwYXJzZWQudG9TdHJpbmcoKS5zdWJzdHJpbmcoYmFzZS5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiBBY2NvdW50UGFyYW1zXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQHByb3BlcnR5IHtUaW5vZGUuRGVmQWNzPX0gZGVmYWNzIC0gRGVmYXVsdCBhY2Nlc3MgcGFyYW1ldGVycyBmb3IgdXNlcidzIDxjb2RlPm1lPC9jb2RlPiB0b3BpYy5cbiAgICogQHByb3BlcnR5IHtPYmplY3Q9fSBwdWJsaWMgLSBQdWJsaWMgYXBwbGljYXRpb24tZGVmaW5lZCBkYXRhIGV4cG9zZWQgb24gPGNvZGU+bWU8L2NvZGU+IHRvcGljLlxuICAgKiBAcHJvcGVydHkge09iamVjdD19IHByaXZhdGUgLSBQcml2YXRlIGFwcGxpY2F0aW9uLWRlZmluZWQgZGF0YSBhY2Nlc3NpYmxlIG9uIDxjb2RlPm1lPC9jb2RlPiB0b3BpYy5cbiAgICogQHByb3BlcnR5IHtPYmplY3Q9fSB0cnVzdGVkIC0gVHJ1c3RlZCB1c2VyIGRhdGEgd2hpY2ggY2FuIGJlIHNldCBieSBhIHJvb3QgdXNlciBvbmx5LlxuICAgKiBAcHJvcGVydHkge0FycmF5LjxzdHJpbmc+fSB0YWdzIC0gYXJyYXkgb2Ygc3RyaW5nIHRhZ3MgZm9yIHVzZXIgZGlzY292ZXJ5LlxuICAgKiBAcHJvcGVydHkge3N0cmluZz19IHRva2VuIC0gYXV0aGVudGljYXRpb24gdG9rZW4gdG8gdXNlLlxuICAgKiBAcHJvcGVydHkge0FycmF5LjxzdHJpbmc+PX0gYXR0YWNobWVudHMgLSBBcnJheSBvZiByZWZlcmVuY2VzIHRvIG91dCBvZiBiYW5kIGF0dGFjaG1lbnRzIHVzZWQgaW4gYWNjb3VudCBkZXNjcmlwdGlvbi5cbiAgICovXG4gIC8qKlxuICAgKiBAdHlwZWRlZiBEZWZBY3NcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAcHJvcGVydHkge3N0cmluZz19IGF1dGggLSBBY2Nlc3MgbW9kZSBmb3IgPGNvZGU+bWU8L2NvZGU+IGZvciBhdXRoZW50aWNhdGVkIHVzZXJzLlxuICAgKiBAcHJvcGVydHkge3N0cmluZz19IGFub24gLSBBY2Nlc3MgbW9kZSBmb3IgPGNvZGU+bWU8L2NvZGU+IGZvciBhbm9ueW1vdXMgdXNlcnMuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgb3IgdXBkYXRlIGFuIGFjY291bnQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1aWQgLSBVc2VyIGlkIHRvIHVwZGF0ZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2NoZW1lIC0gQXV0aGVudGljYXRpb24gc2NoZW1lOyA8Y29kZT5cImJhc2ljXCI8L2NvZGU+IGFuZCA8Y29kZT5cImFub255bW91c1wiPC9jb2RlPiBhcmUgdGhlIGN1cnJlbnRseSBzdXBwb3J0ZWQgc2NoZW1lcy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHNlY3JldCAtIEF1dGhlbnRpY2F0aW9uIHNlY3JldCwgYXNzdW1lZCB0byBiZSBhbHJlYWR5IGJhc2U2NCBlbmNvZGVkLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBsb2dpbiAtIFVzZSBuZXcgYWNjb3VudCB0byBhdXRoZW50aWNhdGUgY3VycmVudCBzZXNzaW9uXG4gICAqIEBwYXJhbSB7VGlub2RlLkFjY291bnRQYXJhbXM9fSBwYXJhbXMgLSBVc2VyIGRhdGEgdG8gcGFzcyB0byB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gc2VydmVyIHJlcGx5IGlzIHJlY2VpdmVkLlxuICAgKi9cbiAgYWNjb3VudCh1aWQsIHNjaGVtZSwgc2VjcmV0LCBsb2dpbiwgcGFyYW1zKSB7XG4gICAgY29uc3QgcGt0ID0gdGhpcy4jaW5pdFBhY2tldCgnYWNjJyk7XG4gICAgcGt0LmFjYy51c2VyID0gdWlkO1xuICAgIHBrdC5hY2Muc2NoZW1lID0gc2NoZW1lO1xuICAgIHBrdC5hY2Muc2VjcmV0ID0gc2VjcmV0O1xuICAgIC8vIExvZyBpbiB0byB0aGUgbmV3IGFjY291bnQgdXNpbmcgc2VsZWN0ZWQgc2NoZW1lXG4gICAgcGt0LmFjYy5sb2dpbiA9IGxvZ2luO1xuXG4gICAgaWYgKHBhcmFtcykge1xuICAgICAgcGt0LmFjYy5kZXNjLmRlZmFjcyA9IHBhcmFtcy5kZWZhY3M7XG4gICAgICBwa3QuYWNjLmRlc2MucHVibGljID0gcGFyYW1zLnB1YmxpYztcbiAgICAgIHBrdC5hY2MuZGVzYy5wcml2YXRlID0gcGFyYW1zLnByaXZhdGU7XG4gICAgICBwa3QuYWNjLmRlc2MudHJ1c3RlZCA9IHBhcmFtcy50cnVzdGVkO1xuXG4gICAgICBwa3QuYWNjLnRhZ3MgPSBwYXJhbXMudGFncztcbiAgICAgIHBrdC5hY2MuY3JlZCA9IHBhcmFtcy5jcmVkO1xuXG4gICAgICBwa3QuYWNjLnRva2VuID0gcGFyYW1zLnRva2VuO1xuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXJhbXMuYXR0YWNobWVudHMpICYmIHBhcmFtcy5hdHRhY2htZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHBrdC5leHRyYSA9IHtcbiAgICAgICAgICBhdHRhY2htZW50czogcGFyYW1zLmF0dGFjaG1lbnRzLmZpbHRlcihyZWYgPT4gVGlub2RlLmlzUmVsYXRpdmVVUkwocmVmKSlcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy4jc2VuZChwa3QsIHBrdC5hY2MuaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyB1c2VyLiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI2FjY291bnR9LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2NoZW1lIC0gQXV0aGVudGljYXRpb24gc2NoZW1lOyA8Y29kZT5cImJhc2ljXCI8L2NvZGU+IGlzIHRoZSBvbmx5IGN1cnJlbnRseSBzdXBwb3J0ZWQgc2NoZW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2VjcmV0IC0gQXV0aGVudGljYXRpb24uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGxvZ2luIC0gVXNlIG5ldyBhY2NvdW50IHRvIGF1dGhlbnRpY2F0ZSBjdXJyZW50IHNlc3Npb25cbiAgICogQHBhcmFtIHtUaW5vZGUuQWNjb3VudFBhcmFtcz19IHBhcmFtcyAtIFVzZXIgZGF0YSB0byBwYXNzIHRvIHRoZSBzZXJ2ZXIuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiBzZXJ2ZXIgcmVwbHkgaXMgcmVjZWl2ZWQuXG4gICAqL1xuICBjcmVhdGVBY2NvdW50KHNjaGVtZSwgc2VjcmV0LCBsb2dpbiwgcGFyYW1zKSB7XG4gICAgbGV0IHByb21pc2UgPSB0aGlzLmFjY291bnQoVVNFUl9ORVcsIHNjaGVtZSwgc2VjcmV0LCBsb2dpbiwgcGFyYW1zKTtcbiAgICBpZiAobG9naW4pIHtcbiAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oKGN0cmwpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuI2xvZ2luU3VjY2Vzc2Z1bChjdHJsKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgdXNlciB3aXRoIDxjb2RlPidiYXNpYyc8L2NvZGU+IGF1dGhlbnRpY2F0aW9uIHNjaGVtZSBhbmQgaW1tZWRpYXRlbHlcbiAgICogdXNlIGl0IGZvciBhdXRoZW50aWNhdGlvbi4gV3JhcHBlciBmb3Ige0BsaW5rIFRpbm9kZSNhY2NvdW50fS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXJuYW1lIC0gTG9naW4gdG8gdXNlIGZvciB0aGUgbmV3IGFjY291bnQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAtIFVzZXIncyBwYXNzd29yZC5cbiAgICogQHBhcmFtIHtUaW5vZGUuQWNjb3VudFBhcmFtcz19IHBhcmFtcyAtIFVzZXIgZGF0YSB0byBwYXNzIHRvIHRoZSBzZXJ2ZXIuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiBzZXJ2ZXIgcmVwbHkgaXMgcmVjZWl2ZWQuXG4gICAqL1xuICBjcmVhdGVBY2NvdW50QmFzaWModXNlcm5hbWUsIHBhc3N3b3JkLCBwYXJhbXMpIHtcbiAgICAvLyBNYWtlIHN1cmUgd2UgYXJlIG5vdCB1c2luZyAnbnVsbCcgb3IgJ3VuZGVmaW5lZCc7XG4gICAgdXNlcm5hbWUgPSB1c2VybmFtZSB8fCAnJztcbiAgICBwYXNzd29yZCA9IHBhc3N3b3JkIHx8ICcnO1xuICAgIHJldHVybiB0aGlzLmNyZWF0ZUFjY291bnQoJ2Jhc2ljJyxcbiAgICAgIGI2NEVuY29kZVVuaWNvZGUodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCksIHRydWUsIHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHVzZXIncyBjcmVkZW50aWFscyBmb3IgPGNvZGU+J2Jhc2ljJzwvY29kZT4gYXV0aGVudGljYXRpb24gc2NoZW1lLiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI2FjY291bnR9LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdWlkIC0gVXNlciBJRCB0byB1cGRhdGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1c2VybmFtZSAtIExvZ2luIHRvIHVzZSBmb3IgdGhlIG5ldyBhY2NvdW50LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBVc2VyJ3MgcGFzc3dvcmQuXG4gICAqIEBwYXJhbSB7VGlub2RlLkFjY291bnRQYXJhbXM9fSBwYXJhbXMgLSBkYXRhIHRvIHBhc3MgdG8gdGhlIHNlcnZlci5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHNlcnZlciByZXBseSBpcyByZWNlaXZlZC5cbiAgICovXG4gIHVwZGF0ZUFjY291bnRCYXNpYyh1aWQsIHVzZXJuYW1lLCBwYXNzd29yZCwgcGFyYW1zKSB7XG4gICAgLy8gTWFrZSBzdXJlIHdlIGFyZSBub3QgdXNpbmcgJ251bGwnIG9yICd1bmRlZmluZWQnO1xuICAgIHVzZXJuYW1lID0gdXNlcm5hbWUgfHwgJyc7XG4gICAgcGFzc3dvcmQgPSBwYXNzd29yZCB8fCAnJztcbiAgICByZXR1cm4gdGhpcy5hY2NvdW50KHVpZCwgJ2Jhc2ljJyxcbiAgICAgIGI2NEVuY29kZVVuaWNvZGUodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCksIGZhbHNlLCBwYXJhbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgaGFuZHNoYWtlIHRvIHRoZSBzZXJ2ZXIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiBzZXJ2ZXIgcmVwbHkgaXMgcmVjZWl2ZWQuXG4gICAqL1xuICBoZWxsbygpIHtcbiAgICBjb25zdCBwa3QgPSB0aGlzLiNpbml0UGFja2V0KCdoaScpO1xuXG4gICAgcmV0dXJuIHRoaXMuI3NlbmQocGt0LCBwa3QuaGkuaWQpXG4gICAgICAudGhlbigoY3RybCkgPT4ge1xuICAgICAgICAvLyBSZXNldCBiYWNrb2ZmIGNvdW50ZXIgb24gc3VjY2Vzc2Z1bCBjb25uZWN0aW9uLlxuICAgICAgICB0aGlzLl9jb25uZWN0aW9uLmJhY2tvZmZSZXNldCgpO1xuXG4gICAgICAgIC8vIFNlcnZlciByZXNwb25zZSBjb250YWlucyBzZXJ2ZXIgcHJvdG9jb2wgdmVyc2lvbiwgYnVpbGQsIGNvbnN0cmFpbnRzLFxuICAgICAgICAvLyBzZXNzaW9uIElEIGZvciBsb25nIHBvbGxpbmcuIFNhdmUgdGhlbS5cbiAgICAgICAgaWYgKGN0cmwucGFyYW1zKSB7XG4gICAgICAgICAgdGhpcy5fc2VydmVySW5mbyA9IGN0cmwucGFyYW1zO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub25Db25uZWN0KSB7XG4gICAgICAgICAgdGhpcy5vbkNvbm5lY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdHJsO1xuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICB0aGlzLl9jb25uZWN0aW9uLnJlY29ubmVjdCh0cnVlKTtcblxuICAgICAgICBpZiAodGhpcy5vbkRpc2Nvbm5lY3QpIHtcbiAgICAgICAgICB0aGlzLm9uRGlzY29ubmVjdChlcnIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgb3IgcmVmcmVzaCB0aGUgcHVzaCBub3RpZmljYXRpb25zL2RldmljZSB0b2tlbi4gSWYgdGhlIGNsaWVudCBpcyBjb25uZWN0ZWQsXG4gICAqIHRoZSBkZXZpY2VUb2tlbiBjYW4gYmUgc2VudCB0byB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKiBAcGFyYW0ge3N0cmluZ30gZHQgLSB0b2tlbiBvYnRhaW5lZCBmcm9tIHRoZSBwcm92aWRlciBvciA8Y29kZT5mYWxzZTwvY29kZT4sXG4gICAqICAgIDxjb2RlPm51bGw8L2NvZGU+IG9yIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gdG8gY2xlYXIgdGhlIHRva2VuLlxuICAgKlxuICAgKiBAcmV0dXJucyA8Y29kZT50cnVlPC9jb2RlPiBpZiBhdHRlbXB0IHdhcyBtYWRlIHRvIHNlbmQgdGhlIHVwZGF0ZSB0byB0aGUgc2VydmVyLlxuICAgKi9cbiAgc2V0RGV2aWNlVG9rZW4oZHQpIHtcbiAgICBsZXQgc2VudCA9IGZhbHNlO1xuICAgIC8vIENvbnZlcnQgYW55IGZhbHNpc2ggdmFsdWUgdG8gbnVsbC5cbiAgICBkdCA9IGR0IHx8IG51bGw7XG4gICAgaWYgKGR0ICE9IHRoaXMuX2RldmljZVRva2VuKSB7XG4gICAgICB0aGlzLl9kZXZpY2VUb2tlbiA9IGR0O1xuICAgICAgaWYgKHRoaXMuaXNDb25uZWN0ZWQoKSAmJiB0aGlzLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgIHRoaXMuI3NlbmQoe1xuICAgICAgICAgICdoaSc6IHtcbiAgICAgICAgICAgICdkZXYnOiBkdCB8fCBUaW5vZGUuREVMX0NIQVJcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBzZW50ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNlbnQ7XG4gIH1cblxuICAvKipcbiAgICogQHR5cGVkZWYgQ3JlZGVudGlhbFxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAcHJvcGVydHkge3N0cmluZ30gbWV0aCAtIHZhbGlkYXRpb24gbWV0aG9kLlxuICAgKiBAcHJvcGVydHkge3N0cmluZ30gdmFsIC0gdmFsdWUgdG8gdmFsaWRhdGUgKGUuZy4gZW1haWwgb3IgcGhvbmUgbnVtYmVyKS5cbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IHJlc3AgLSB2YWxpZGF0aW9uIHJlc3BvbnNlLlxuICAgKiBAcHJvcGVydHkge09iamVjdH0gcGFyYW1zIC0gdmFsaWRhdGlvbiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgLyoqXG4gICAqIEF1dGhlbnRpY2F0ZSBjdXJyZW50IHNlc3Npb24uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzY2hlbWUgLSBBdXRoZW50aWNhdGlvbiBzY2hlbWU7IDxjb2RlPlwiYmFzaWNcIjwvY29kZT4gaXMgdGhlIG9ubHkgY3VycmVudGx5IHN1cHBvcnRlZCBzY2hlbWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZWNyZXQgLSBBdXRoZW50aWNhdGlvbiBzZWNyZXQsIGFzc3VtZWQgdG8gYmUgYWxyZWFkeSBiYXNlNjQgZW5jb2RlZC5cbiAgICogQHBhcmFtIHtDcmVkZW50aWFsPX0gY3JlZCAtIGNyZWRlbnRpYWwgY29uZmlybWF0aW9uLCBpZiByZXF1aXJlZC5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHNlcnZlciByZXBseSBpcyByZWNlaXZlZC5cbiAgICovXG4gIGxvZ2luKHNjaGVtZSwgc2VjcmV0LCBjcmVkKSB7XG4gICAgY29uc3QgcGt0ID0gdGhpcy4jaW5pdFBhY2tldCgnbG9naW4nKTtcbiAgICBwa3QubG9naW4uc2NoZW1lID0gc2NoZW1lO1xuICAgIHBrdC5sb2dpbi5zZWNyZXQgPSBzZWNyZXQ7XG4gICAgcGt0LmxvZ2luLmNyZWQgPSBjcmVkO1xuXG4gICAgcmV0dXJuIHRoaXMuI3NlbmQocGt0LCBwa3QubG9naW4uaWQpXG4gICAgICAudGhlbigoY3RybCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy4jbG9naW5TdWNjZXNzZnVsKGN0cmwpO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogV3JhcHBlciBmb3Ige0BsaW5rIFRpbm9kZSNsb2dpbn0gd2l0aCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW5hbWUgLSBVc2VyIG5hbWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgLSBQYXNzd29yZC5cbiAgICogQHBhcmFtIHtDcmVkZW50aWFsPX0gY3JlZCAtIGNyZWRlbnRpYWwgY29uZmlybWF0aW9uLCBpZiByZXF1aXJlZC5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCBvbiByZWNlaXZpbmcgc2VydmVyIHJlcGx5LlxuICAgKi9cbiAgbG9naW5CYXNpYyh1bmFtZSwgcGFzc3dvcmQsIGNyZWQpIHtcbiAgICByZXR1cm4gdGhpcy5sb2dpbignYmFzaWMnLCBiNjRFbmNvZGVVbmljb2RlKHVuYW1lICsgJzonICsgcGFzc3dvcmQpLCBjcmVkKVxuICAgICAgLnRoZW4oKGN0cmwpID0+IHtcbiAgICAgICAgdGhpcy5fbG9naW4gPSB1bmFtZTtcbiAgICAgICAgcmV0dXJuIGN0cmw7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI2xvZ2lufSB3aXRoIHRva2VuIGF1dGhlbnRpY2F0aW9uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlbiAtIFRva2VuIHJlY2VpdmVkIGluIHJlc3BvbnNlIHRvIGVhcmxpZXIgbG9naW4uXG4gICAqIEBwYXJhbSB7Q3JlZGVudGlhbD19IGNyZWQgLSBjcmVkZW50aWFsIGNvbmZpcm1hdGlvbiwgaWYgcmVxdWlyZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gcmVjZWl2aW5nIHNlcnZlciByZXBseS5cbiAgICovXG4gIGxvZ2luVG9rZW4odG9rZW4sIGNyZWQpIHtcbiAgICByZXR1cm4gdGhpcy5sb2dpbigndG9rZW4nLCB0b2tlbiwgY3JlZCk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBhIHJlcXVlc3QgZm9yIHJlc2V0dGluZyBhbiBhdXRoZW50aWNhdGlvbiBzZWNyZXQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzY2hlbWUgLSBhdXRoZW50aWNhdGlvbiBzY2hlbWUgdG8gcmVzZXQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2QgLSBtZXRob2QgdG8gdXNlIGZvciByZXNldHRpbmcgdGhlIHNlY3JldCwgc3VjaCBhcyBcImVtYWlsXCIgb3IgXCJ0ZWxcIi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gdmFsdWUgb2YgdGhlIGNyZWRlbnRpYWwgdG8gdXNlLCBhIHNwZWNpZmljIGVtYWlsIGFkZHJlc3Mgb3IgYSBwaG9uZSBudW1iZXIuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gcmVjZWl2aW5nIHRoZSBzZXJ2ZXIgcmVwbHkuXG4gICAqL1xuICByZXF1ZXN0UmVzZXRBdXRoU2VjcmV0KHNjaGVtZSwgbWV0aG9kLCB2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmxvZ2luKCdyZXNldCcsIGI2NEVuY29kZVVuaWNvZGUoc2NoZW1lICsgJzonICsgbWV0aG9kICsgJzonICsgdmFsdWUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiBBdXRoVG9rZW5cbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAcHJvcGVydHkge3N0cmluZ30gdG9rZW4gLSBUb2tlbiB2YWx1ZS5cbiAgICogQHByb3BlcnR5IHtEYXRlfSBleHBpcmVzIC0gVG9rZW4gZXhwaXJhdGlvbiB0aW1lLlxuICAgKi9cbiAgLyoqXG4gICAqIEdldCBzdG9yZWQgYXV0aGVudGljYXRpb24gdG9rZW4uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEByZXR1cm5zIHtUaW5vZGUuQXV0aFRva2VufSBhdXRoZW50aWNhdGlvbiB0b2tlbi5cbiAgICovXG4gIGdldEF1dGhUb2tlbigpIHtcbiAgICBpZiAodGhpcy5fYXV0aFRva2VuICYmICh0aGlzLl9hdXRoVG9rZW4uZXhwaXJlcy5nZXRUaW1lKCkgPiBEYXRlLm5vdygpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2F1dGhUb2tlbjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYXV0aFRva2VuID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQXBwbGljYXRpb24gbWF5IHByb3ZpZGUgYSBzYXZlZCBhdXRoZW50aWNhdGlvbiB0b2tlbi5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtUaW5vZGUuQXV0aFRva2VufSB0b2tlbiAtIGF1dGhlbnRpY2F0aW9uIHRva2VuLlxuICAgKi9cbiAgc2V0QXV0aFRva2VuKHRva2VuKSB7XG4gICAgdGhpcy5fYXV0aFRva2VuID0gdG9rZW47XG4gIH1cblxuICAvKipcbiAgICogQHR5cGVkZWYgU2V0UGFyYW1zXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHByb3BlcnR5IHtUaW5vZGUuU2V0RGVzYz19IGRlc2MgLSBUb3BpYyBpbml0aWFsaXphdGlvbiBwYXJhbWV0ZXJzIHdoZW4gY3JlYXRpbmcgYSBuZXcgdG9waWMgb3IgYSBuZXcgc3Vic2NyaXB0aW9uLlxuICAgKiBAcHJvcGVydHkge1Rpbm9kZS5TZXRTdWI9fSBzdWIgLSBTdWJzY3JpcHRpb24gaW5pdGlhbGl6YXRpb24gcGFyYW1ldGVycy5cbiAgICogQHByb3BlcnR5IHtBcnJheS48c3RyaW5nPj19IGF0dGFjaG1lbnRzIC0gVVJMcyBvZiBvdXQgb2YgYmFuZCBhdHRhY2htZW50cyB1c2VkIGluIHBhcmFtZXRlcnMuXG4gICAqL1xuICAvKipcbiAgICogQHR5cGVkZWYgU2V0RGVzY1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBwcm9wZXJ0eSB7VGlub2RlLkRlZkFjcz19IGRlZmFjcyAtIERlZmF1bHQgYWNjZXNzIG1vZGUuXG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0PX0gcHVibGljIC0gRnJlZS1mb3JtIHRvcGljIGRlc2NyaXB0aW9uLCBwdWJsaWNhbGx5IGFjY2Vzc2libGUuXG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0PX0gcHJpdmF0ZSAtIEZyZWUtZm9ybSB0b3BpYyBkZXNjcmlwdGlvbiBhY2Nlc3NpYmxlIG9ubHkgdG8gdGhlIG93bmVyLlxuICAgKiBAcHJvcGVydHkge09iamVjdD19IHRydXN0ZWQgLSBUcnVzdGVkIHVzZXIgZGF0YSB3aGljaCBjYW4gYmUgc2V0IGJ5IGEgcm9vdCB1c2VyIG9ubHkuXG4gICAqL1xuICAvKipcbiAgICogQHR5cGVkZWYgU2V0U3ViXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHByb3BlcnR5IHtzdHJpbmc9fSB1c2VyIC0gVUlEIG9mIHRoZSB1c2VyIGFmZmVjdGVkIGJ5IHRoZSByZXF1ZXN0LiBEZWZhdWx0IChlbXB0eSkgLSBjdXJyZW50IHVzZXIuXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nPX0gbW9kZSAtIFVzZXIgYWNjZXNzIG1vZGUsIGVpdGhlciByZXF1ZXN0ZWQgb3IgYXNzaWduZWQgZGVwZW5kZW50IG9uIGNvbnRleHQuXG4gICAqL1xuICAvKipcbiAgICogUGFyYW1ldGVycyBwYXNzZWQgdG8ge0BsaW5rIFRpbm9kZSNzdWJzY3JpYmV9LlxuICAgKlxuICAgKiBAdHlwZWRlZiBTdWJzY3JpcHRpb25QYXJhbXNcbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAcHJvcGVydHkge1Rpbm9kZS5TZXRQYXJhbXM9fSBzZXQgLSBQYXJhbWV0ZXJzIHVzZWQgdG8gaW5pdGlhbGl6ZSB0b3BpY1xuICAgKiBAcHJvcGVydHkge1Rpbm9kZS5HZXRRdWVyeT19IGdldCAtIFF1ZXJ5IGZvciBmZXRjaGluZyBkYXRhIGZyb20gdG9waWMuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBTZW5kIGEgdG9waWMgc3Vic2NyaXB0aW9uIHJlcXVlc3QuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b3BpYyAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIHN1YnNjcmliZSB0by5cbiAgICogQHBhcmFtIHtUaW5vZGUuR2V0UXVlcnk9fSBnZXRQYXJhbXMgLSBPcHRpb25hbCBzdWJzY3JpcHRpb24gbWV0YWRhdGEgcXVlcnlcbiAgICogQHBhcmFtIHtUaW5vZGUuU2V0UGFyYW1zPX0gc2V0UGFyYW1zIC0gT3B0aW9uYWwgaW5pdGlhbGl6YXRpb24gcGFyYW1ldGVyc1xuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkL3JlamVjdGVkIG9uIHJlY2VpdmluZyBzZXJ2ZXIgcmVwbHkuXG4gICAqL1xuICBzdWJzY3JpYmUodG9waWNOYW1lLCBnZXRQYXJhbXMsIHNldFBhcmFtcykge1xuICAgIGNvbnN0IHBrdCA9IHRoaXMuI2luaXRQYWNrZXQoJ3N1YicsIHRvcGljTmFtZSlcbiAgICBpZiAoIXRvcGljTmFtZSkge1xuICAgICAgdG9waWNOYW1lID0gQ29uc3QuVE9QSUNfTkVXO1xuICAgIH1cblxuICAgIHBrdC5zdWIuZ2V0ID0gZ2V0UGFyYW1zO1xuXG4gICAgaWYgKHNldFBhcmFtcykge1xuICAgICAgaWYgKHNldFBhcmFtcy5zdWIpIHtcbiAgICAgICAgcGt0LnN1Yi5zZXQuc3ViID0gc2V0UGFyYW1zLnN1YjtcbiAgICAgIH1cblxuICAgICAgaWYgKHNldFBhcmFtcy5kZXNjKSB7XG4gICAgICAgIGNvbnN0IGRlc2MgPSBzZXRQYXJhbXMuZGVzYztcbiAgICAgICAgaWYgKFRpbm9kZS5pc05ld0dyb3VwVG9waWNOYW1lKHRvcGljTmFtZSkpIHtcbiAgICAgICAgICAvLyBGdWxsIHNldC5kZXNjIHBhcmFtcyBhcmUgdXNlZCBmb3IgbmV3IHRvcGljcyBvbmx5XG4gICAgICAgICAgcGt0LnN1Yi5zZXQuZGVzYyA9IGRlc2M7XG4gICAgICAgIH0gZWxzZSBpZiAoVGlub2RlLmlzUDJQVG9waWNOYW1lKHRvcGljTmFtZSkgJiYgZGVzYy5kZWZhY3MpIHtcbiAgICAgICAgICAvLyBVc2Ugb3B0aW9uYWwgZGVmYXVsdCBwZXJtaXNzaW9ucyBvbmx5LlxuICAgICAgICAgIHBrdC5zdWIuc2V0LmRlc2MgPSB7XG4gICAgICAgICAgICBkZWZhY3M6IGRlc2MuZGVmYWNzXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBTZWUgaWYgZXh0ZXJuYWwgb2JqZWN0cyB3ZXJlIHVzZWQgaW4gdG9waWMgZGVzY3JpcHRpb24uXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShzZXRQYXJhbXMuYXR0YWNobWVudHMpICYmIHNldFBhcmFtcy5hdHRhY2htZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHBrdC5leHRyYSA9IHtcbiAgICAgICAgICBhdHRhY2htZW50czogc2V0UGFyYW1zLmF0dGFjaG1lbnRzLmZpbHRlcihyZWYgPT4gVGlub2RlLmlzUmVsYXRpdmVVUkwocmVmKSlcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNldFBhcmFtcy50YWdzKSB7XG4gICAgICAgIHBrdC5zdWIuc2V0LnRhZ3MgPSBzZXRQYXJhbXMudGFncztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuI3NlbmQocGt0LCBwa3Quc3ViLmlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRhY2ggYW5kIG9wdGlvbmFsbHkgdW5zdWJzY3JpYmUgZnJvbSB0aGUgdG9waWNcbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRvcGljIC0gVG9waWMgdG8gZGV0YWNoIGZyb20uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdW5zdWIgLSBJZiA8Y29kZT50cnVlPC9jb2RlPiwgZGV0YWNoIGFuZCB1bnN1YnNjcmliZSwgb3RoZXJ3aXNlIGp1c3QgZGV0YWNoLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkL3JlamVjdGVkIG9uIHJlY2VpdmluZyBzZXJ2ZXIgcmVwbHkuXG4gICAqL1xuICBsZWF2ZSh0b3BpYywgdW5zdWIpIHtcbiAgICBjb25zdCBwa3QgPSB0aGlzLiNpbml0UGFja2V0KCdsZWF2ZScsIHRvcGljKTtcbiAgICBwa3QubGVhdmUudW5zdWIgPSB1bnN1YjtcblxuICAgIHJldHVybiB0aGlzLiNzZW5kKHBrdCwgcGt0LmxlYXZlLmlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgbWVzc2FnZSBkcmFmdCB3aXRob3V0IHNlbmRpbmcgaXQgdG8gdGhlIHNlcnZlci5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRvcGljIC0gTmFtZSBvZiB0aGUgdG9waWMgdG8gcHVibGlzaCB0by5cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRlbnQgLSBQYXlsb2FkIHRvIHB1Ymxpc2guXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG5vRWNobyAtIElmIDxjb2RlPnRydWU8L2NvZGU+LCB0ZWxsIHRoZSBzZXJ2ZXIgbm90IHRvIGVjaG8gdGhlIG1lc3NhZ2UgdG8gdGhlIG9yaWdpbmFsIHNlc3Npb24uXG4gICAqXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IG5ldyBtZXNzYWdlIHdoaWNoIGNhbiBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIgb3Igb3RoZXJ3aXNlIHVzZWQuXG4gICAqL1xuICBjcmVhdGVNZXNzYWdlKHRvcGljLCBjb250ZW50LCBub0VjaG8pIHtcbiAgICBjb25zdCBwa3QgPSB0aGlzLiNpbml0UGFja2V0KCdwdWInLCB0b3BpYyk7XG5cbiAgICBsZXQgZGZ0ID0gdHlwZW9mIGNvbnRlbnQgPT0gJ3N0cmluZycgPyBEcmFmdHkucGFyc2UoY29udGVudCkgOiBjb250ZW50O1xuICAgIGlmIChkZnQgJiYgIURyYWZ0eS5pc1BsYWluVGV4dChkZnQpKSB7XG4gICAgICBwa3QucHViLmhlYWQgPSB7XG4gICAgICAgIG1pbWU6IERyYWZ0eS5nZXRDb250ZW50VHlwZSgpXG4gICAgICB9O1xuICAgICAgY29udGVudCA9IGRmdDtcbiAgICB9XG4gICAgcGt0LnB1Yi5ub2VjaG8gPSBub0VjaG87XG4gICAgcGt0LnB1Yi5jb250ZW50ID0gY29udGVudDtcblxuICAgIHJldHVybiBwa3QucHViO1xuICB9XG5cbiAgLyoqXG4gICAqIFB1Ymxpc2gge2RhdGF9IG1lc3NhZ2UgdG8gdG9waWMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b3BpYyAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIHB1Ymxpc2ggdG8uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZW50IC0gUGF5bG9hZCB0byBwdWJsaXNoLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBub0VjaG8gLSBJZiA8Y29kZT50cnVlPC9jb2RlPiwgdGVsbCB0aGUgc2VydmVyIG5vdCB0byBlY2hvIHRoZSBtZXNzYWdlIHRvIHRoZSBvcmlnaW5hbCBzZXNzaW9uLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkL3JlamVjdGVkIG9uIHJlY2VpdmluZyBzZXJ2ZXIgcmVwbHkuXG4gICAqL1xuICBwdWJsaXNoKHRvcGljLCBjb250ZW50LCBub0VjaG8pIHtcbiAgICByZXR1cm4gdGhpcy5wdWJsaXNoTWVzc2FnZShcbiAgICAgIHRoaXMuY3JlYXRlTWVzc2FnZSh0b3BpYywgY29udGVudCwgbm9FY2hvKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUHVibGlzaCBtZXNzYWdlIHRvIHRvcGljLiBUaGUgbWVzc2FnZSBzaG91bGQgYmUgY3JlYXRlZCBieSB7QGxpbmsgVGlub2RlI2NyZWF0ZU1lc3NhZ2V9LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcHViIC0gTWVzc2FnZSB0byBwdWJsaXNoLlxuICAgKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+PX0gYXR0YWNobWVudHMgLSBhcnJheSBvZiBVUkxzIHdpdGggYXR0YWNobWVudHMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gcmVjZWl2aW5nIHNlcnZlciByZXBseS5cbiAgICovXG4gIHB1Ymxpc2hNZXNzYWdlKHB1YiwgYXR0YWNobWVudHMpIHtcbiAgICAvLyBNYWtlIGEgc2hhbGxvdyBjb3B5LiBOZWVkZWQgaW4gb3JkZXIgdG8gY2xlYXIgbG9jYWxseS1hc3NpZ25lZCB0ZW1wIHZhbHVlcztcbiAgICBwdWIgPSBPYmplY3QuYXNzaWduKHt9LCBwdWIpO1xuICAgIHB1Yi5zZXEgPSB1bmRlZmluZWQ7XG4gICAgcHViLmZyb20gPSB1bmRlZmluZWQ7XG4gICAgcHViLnRzID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IG1zZyA9IHtcbiAgICAgIHB1YjogcHViLFxuICAgIH07XG4gICAgaWYgKGF0dGFjaG1lbnRzKSB7XG4gICAgICBtc2cuZXh0cmEgPSB7XG4gICAgICAgIGF0dGFjaG1lbnRzOiBhdHRhY2htZW50cy5maWx0ZXIocmVmID0+IFRpbm9kZS5pc1JlbGF0aXZlVVJMKHJlZikpXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy4jc2VuZChtc2csIHB1Yi5pZCk7XG4gIH1cblxuICAvKipcbiAgICogT3V0IG9mIGJhbmQgbm90aWZpY2F0aW9uOiBub3RpZnkgdG9waWMgdGhhdCBhbiBleHRlcm5hbCAocHVzaCkgbm90aWZpY2F0aW9uIHdhcyByZWNpdmVkIGJ5IHRoZSBjbGllbnQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB3aGF0IC0gbm90aWZpY2F0aW9uIHR5cGUsICdtc2cnIG9yICdyZWFkJy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRvcGljTmFtZSAtIG5hbWUgb2YgdGhlIHVwZGF0ZWQgdG9waWMuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzZXEgLSBzZXEgSUQgb2YgdGhlIGFmZmVjdGVkIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gYWN0IC0gVUlEIG9mIHRoZSBzZW5kZXI7IGRlZmF1bHQgaXMgY3VycmVudC5cbiAgICovXG4gIG9vYk5vdGlmaWNhdGlvbih3aGF0LCB0b3BpY05hbWUsIHNlcSwgYWN0KSB7XG4gICAgY29uc3QgdG9waWMgPSB0aGlzLiNjYWNoZUdldCgndG9waWMnLCB0b3BpY05hbWUpO1xuICAgIGlmICh0b3BpYykge1xuICAgICAgdG9waWMuX3VwZGF0ZVJlY2VpdmVkKHNlcSwgYWN0KTtcbiAgICAgIHRoaXMuZ2V0TWVUb3BpYygpLl9yZWZyZXNoQ29udGFjdCgnbXNnJywgdG9waWMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiBHZXRRdWVyeVxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBwcm9wZXJ0eSB7VGlub2RlLkdldE9wdHNUeXBlPX0gZGVzYyAtIElmIHByb3ZpZGVkIChldmVuIGlmIGVtcHR5KSwgZmV0Y2ggdG9waWMgZGVzY3JpcHRpb24uXG4gICAqIEBwcm9wZXJ0eSB7VGlub2RlLkdldE9wdHNUeXBlPX0gc3ViIC0gSWYgcHJvdmlkZWQgKGV2ZW4gaWYgZW1wdHkpLCBmZXRjaCB0b3BpYyBzdWJzY3JpcHRpb25zLlxuICAgKiBAcHJvcGVydHkge1Rpbm9kZS5HZXREYXRhVHlwZT19IGRhdGEgLSBJZiBwcm92aWRlZCAoZXZlbiBpZiBlbXB0eSksIGdldCBtZXNzYWdlcy5cbiAgICovXG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIEdldE9wdHNUeXBlXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHByb3BlcnR5IHtEYXRlPX0gaW1zIC0gXCJJZiBtb2RpZmllZCBzaW5jZVwiLCBmZXRjaCBkYXRhIG9ubHkgaXQgd2FzIHdhcyBtb2RpZmllZCBzaW5jZSBzdGF0ZWQgZGF0ZS5cbiAgICogQHByb3BlcnR5IHtudW1iZXI9fSBsaW1pdCAtIE1heGltdW0gbnVtYmVyIG9mIHJlc3VsdHMgdG8gcmV0dXJuLiBJZ25vcmVkIHdoZW4gcXVlcnlpbmcgdG9waWMgZGVzY3JpcHRpb24uXG4gICAqL1xuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiBHZXREYXRhVHlwZVxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyPX0gc2luY2UgLSBMb2FkIG1lc3NhZ2VzIHdpdGggc2VxIGlkIGVxdWFsIG9yIGdyZWF0ZXIgdGhhbiB0aGlzIHZhbHVlLlxuICAgKiBAcHJvcGVydHkge251bWJlcj19IGJlZm9yZSAtIExvYWQgbWVzc2FnZXMgd2l0aCBzZXEgaWQgbG93ZXIgdGhhbiB0aGlzIG51bWJlci5cbiAgICogQHByb3BlcnR5IHtudW1iZXI9fSBsaW1pdCAtIE1heGltdW0gbnVtYmVyIG9mIHJlc3VsdHMgdG8gcmV0dXJuLlxuICAgKi9cblxuICAvKipcbiAgICogUmVxdWVzdCB0b3BpYyBtZXRhZGF0YVxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWMgLSBOYW1lIG9mIHRoZSB0b3BpYyB0byBxdWVyeS5cbiAgICogQHBhcmFtIHtUaW5vZGUuR2V0UXVlcnl9IHBhcmFtcyAtIFBhcmFtZXRlcnMgb2YgdGhlIHF1ZXJ5LiBVc2Uge0BsaW5rIFRpbm9kZS5NZXRhR2V0QnVpbGRlcn0gdG8gZ2VuZXJhdGUuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gcmVjZWl2aW5nIHNlcnZlciByZXBseS5cbiAgICovXG4gIGdldE1ldGEodG9waWMsIHBhcmFtcykge1xuICAgIGNvbnN0IHBrdCA9IHRoaXMuI2luaXRQYWNrZXQoJ2dldCcsIHRvcGljKTtcblxuICAgIHBrdC5nZXQgPSBtZXJnZU9iaihwa3QuZ2V0LCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIHRoaXMuI3NlbmQocGt0LCBwa3QuZ2V0LmlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdG9waWMncyBtZXRhZGF0YTogZGVzY3JpcHRpb24sIHN1YnNjcmlidGlvbnMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b3BpYyAtIFRvcGljIHRvIHVwZGF0ZS5cbiAgICogQHBhcmFtIHtUaW5vZGUuU2V0UGFyYW1zfSBwYXJhbXMgLSB0b3BpYyBtZXRhZGF0YSB0byB1cGRhdGUuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gcmVjZWl2aW5nIHNlcnZlciByZXBseS5cbiAgICovXG4gIHNldE1ldGEodG9waWMsIHBhcmFtcykge1xuICAgIGNvbnN0IHBrdCA9IHRoaXMuI2luaXRQYWNrZXQoJ3NldCcsIHRvcGljKTtcbiAgICBjb25zdCB3aGF0ID0gW107XG5cbiAgICBpZiAocGFyYW1zKSB7XG4gICAgICBbJ2Rlc2MnLCAnc3ViJywgJ3RhZ3MnLCAnY3JlZCddLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGlmIChwYXJhbXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIHdoYXQucHVzaChrZXkpO1xuICAgICAgICAgIHBrdC5zZXRba2V5XSA9IHBhcmFtc1trZXldO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGFyYW1zLmF0dGFjaG1lbnRzKSAmJiBwYXJhbXMuYXR0YWNobWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICBwa3QuZXh0cmEgPSB7XG4gICAgICAgICAgYXR0YWNobWVudHM6IHBhcmFtcy5hdHRhY2htZW50cy5maWx0ZXIocmVmID0+IFRpbm9kZS5pc1JlbGF0aXZlVVJMKHJlZikpXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHdoYXQubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJJbnZhbGlkIHtzZXR9IHBhcmFtZXRlcnNcIikpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLiNzZW5kKHBrdCwgcGt0LnNldC5pZCk7XG4gIH1cblxuICAvKipcbiAgICogUmFuZ2Ugb2YgbWVzc2FnZSBJRHMgdG8gZGVsZXRlLlxuICAgKlxuICAgKiBAdHlwZWRlZiBEZWxSYW5nZVxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBsb3cgLSBsb3cgZW5kIG9mIHRoZSByYW5nZSwgaW5jbHVzaXZlIChjbG9zZWQpLlxuICAgKiBAcHJvcGVydHkge251bWJlcj19IGhpIC0gaGlnaCBlbmQgb2YgdGhlIHJhbmdlLCBleGNsdXNpdmUgKG9wZW4pLlxuICAgKi9cbiAgLyoqXG4gICAqIERlbGV0ZSBzb21lIG9yIGFsbCBtZXNzYWdlcyBpbiBhIHRvcGljLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWMgLSBUb3BpYyBuYW1lIHRvIGRlbGV0ZSBtZXNzYWdlcyBmcm9tLlxuICAgKiBAcGFyYW0ge1Rpbm9kZS5EZWxSYW5nZVtdfSBsaXN0IC0gUmFuZ2VzIG9mIG1lc3NhZ2UgSURzIHRvIGRlbGV0ZS5cbiAgICogQHBhcmFtIHtib29sZWFuPX0gaGFyZCAtIEhhcmQgb3Igc29mdCBkZWxldGVcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCBvbiByZWNlaXZpbmcgc2VydmVyIHJlcGx5LlxuICAgKi9cbiAgZGVsTWVzc2FnZXModG9waWMsIHJhbmdlcywgaGFyZCkge1xuICAgIGNvbnN0IHBrdCA9IHRoaXMuI2luaXRQYWNrZXQoJ2RlbCcsIHRvcGljKTtcblxuICAgIHBrdC5kZWwud2hhdCA9ICdtc2cnO1xuICAgIHBrdC5kZWwuZGVsc2VxID0gcmFuZ2VzO1xuICAgIHBrdC5kZWwuaGFyZCA9IGhhcmQ7XG5cbiAgICByZXR1cm4gdGhpcy4jc2VuZChwa3QsIHBrdC5kZWwuaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSB0aGUgdG9waWMgYWxsdG9nZXRoZXIuIFJlcXVpcmVzIE93bmVyIHBlcm1pc3Npb24uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b3BpY05hbWUgLSBOYW1lIG9mIHRoZSB0b3BpYyB0byBkZWxldGVcbiAgICogQHBhcmFtIHtib29sZWFufSBoYXJkIC0gaGFyZC1kZWxldGUgdG9waWMuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gcmVjZWl2aW5nIHNlcnZlciByZXBseS5cbiAgICovXG4gIGRlbFRvcGljKHRvcGljTmFtZSwgaGFyZCkge1xuICAgIGNvbnN0IHBrdCA9IHRoaXMuI2luaXRQYWNrZXQoJ2RlbCcsIHRvcGljTmFtZSk7XG4gICAgcGt0LmRlbC53aGF0ID0gJ3RvcGljJztcbiAgICBwa3QuZGVsLmhhcmQgPSBoYXJkO1xuXG4gICAgcmV0dXJuIHRoaXMuI3NlbmQocGt0LCBwa3QuZGVsLmlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgc3Vic2NyaXB0aW9uLiBSZXF1aXJlcyBTaGFyZSBwZXJtaXNzaW9uLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWNOYW1lIC0gTmFtZSBvZiB0aGUgdG9waWMgdG8gZGVsZXRlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1c2VyIC0gVXNlciBJRCB0byByZW1vdmUuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gcmVjZWl2aW5nIHNlcnZlciByZXBseS5cbiAgICovXG4gIGRlbFN1YnNjcmlwdGlvbih0b3BpY05hbWUsIHVzZXIpIHtcbiAgICBjb25zdCBwa3QgPSB0aGlzLiNpbml0UGFja2V0KCdkZWwnLCB0b3BpY05hbWUpO1xuICAgIHBrdC5kZWwud2hhdCA9ICdzdWInO1xuICAgIHBrdC5kZWwudXNlciA9IHVzZXI7XG5cbiAgICByZXR1cm4gdGhpcy4jc2VuZChwa3QsIHBrdC5kZWwuaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSBjcmVkZW50aWFsLiBBbHdheXMgc2VudCBvbiA8Y29kZT4nbWUnPC9jb2RlPiB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZCAtIHZhbGlkYXRpb24gbWV0aG9kIHN1Y2ggYXMgPGNvZGU+J2VtYWlsJzwvY29kZT4gb3IgPGNvZGU+J3RlbCc8L2NvZGU+LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSB2YWxpZGF0aW9uIHZhbHVlLCBpLmUuIDxjb2RlPidhbGljZUBleGFtcGxlLmNvbSc8L2NvZGU+LlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkL3JlamVjdGVkIG9uIHJlY2VpdmluZyBzZXJ2ZXIgcmVwbHkuXG4gICAqL1xuICBkZWxDcmVkZW50aWFsKG1ldGhvZCwgdmFsdWUpIHtcbiAgICBjb25zdCBwa3QgPSB0aGlzLiNpbml0UGFja2V0KCdkZWwnLCBDb25zdC5UT1BJQ19NRSk7XG4gICAgcGt0LmRlbC53aGF0ID0gJ2NyZWQnO1xuICAgIHBrdC5kZWwuY3JlZCA9IHtcbiAgICAgIG1ldGg6IG1ldGhvZCxcbiAgICAgIHZhbDogdmFsdWVcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuI3NlbmQocGt0LCBwa3QuZGVsLmlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0IHRvIGRlbGV0ZSBhY2NvdW50IG9mIHRoZSBjdXJyZW50IHVzZXIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaGFyZCAtIGhhcmQtZGVsZXRlIHVzZXIuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gcmVjZWl2aW5nIHNlcnZlciByZXBseS5cbiAgICovXG4gIGRlbEN1cnJlbnRVc2VyKGhhcmQpIHtcbiAgICBjb25zdCBwa3QgPSB0aGlzLiNpbml0UGFja2V0KCdkZWwnLCBudWxsKTtcbiAgICBwa3QuZGVsLndoYXQgPSAndXNlcic7XG4gICAgcGt0LmRlbC5oYXJkID0gaGFyZDtcblxuICAgIHJldHVybiB0aGlzLiNzZW5kKHBrdCwgcGt0LmRlbC5pZCkudGhlbigoY3RybCkgPT4ge1xuICAgICAgdGhpcy5fbXlVSUQgPSBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdGlmeSBzZXJ2ZXIgdGhhdCBhIG1lc3NhZ2Ugb3IgbWVzc2FnZXMgd2VyZSByZWFkIG9yIHJlY2VpdmVkLiBEb2VzIE5PVCByZXR1cm4gcHJvbWlzZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRvcGljTmFtZSAtIE5hbWUgb2YgdGhlIHRvcGljIHdoZXJlIHRoZSBtZXNhZ2UgaXMgYmVpbmcgYWtub3dsZWRnZWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB3aGF0IC0gQWN0aW9uIGJlaW5nIGFrbm93bGVkZ2VkLCBlaXRoZXIgPGNvZGU+XCJyZWFkXCI8L2NvZGU+IG9yIDxjb2RlPlwicmVjdlwiPC9jb2RlPi5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcSAtIE1heGltdW0gaWQgb2YgdGhlIG1lc3NhZ2UgYmVpbmcgYWNrbm93bGVkZ2VkLlxuICAgKi9cbiAgbm90ZSh0b3BpY05hbWUsIHdoYXQsIHNlcSkge1xuICAgIGlmIChzZXEgPD0gMCB8fCBzZXEgPj0gQ29uc3QuTE9DQUxfU0VRSUQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBtZXNzYWdlIGlkICR7c2VxfWApO1xuICAgIH1cblxuICAgIGNvbnN0IHBrdCA9IHRoaXMuI2luaXRQYWNrZXQoJ25vdGUnLCB0b3BpY05hbWUpO1xuICAgIHBrdC5ub3RlLndoYXQgPSB3aGF0O1xuICAgIHBrdC5ub3RlLnNlcSA9IHNlcTtcbiAgICB0aGlzLiNzZW5kKHBrdCk7XG4gIH1cblxuICAvKipcbiAgICogQnJvYWRjYXN0IGEga2V5LXByZXNzIG5vdGlmaWNhdGlvbiB0byB0b3BpYyBzdWJzY3JpYmVycy4gVXNlZCB0byBzaG93XG4gICAqIHR5cGluZyBub3RpZmljYXRpb25zIFwidXNlciBYIGlzIHR5cGluZy4uLlwiLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWNOYW1lIC0gTmFtZSBvZiB0aGUgdG9waWMgdG8gYnJvYWRjYXN0IHRvLlxuICAgKi9cbiAgbm90ZUtleVByZXNzKHRvcGljTmFtZSkge1xuICAgIGNvbnN0IHBrdCA9IHRoaXMuI2luaXRQYWNrZXQoJ25vdGUnLCB0b3BpY05hbWUpO1xuICAgIHBrdC5ub3RlLndoYXQgPSAna3AnO1xuICAgIHRoaXMuI3NlbmQocGt0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBuYW1lZCB0b3BpYywgZWl0aGVyIHB1bGwgaXQgZnJvbSBjYWNoZSBvciBjcmVhdGUgYSBuZXcgaW5zdGFuY2UuXG4gICAqIFRoZXJlIGlzIGEgc2luZ2xlIGluc3RhbmNlIG9mIHRvcGljIGZvciBlYWNoIG5hbWUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b3BpY05hbWUgLSBOYW1lIG9mIHRoZSB0b3BpYyB0byBnZXQuXG4gICAqIEByZXR1cm5zIHtUaW5vZGUuVG9waWN9IFJlcXVlc3RlZCBvciBuZXdseSBjcmVhdGVkIHRvcGljIG9yIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gaWYgdG9waWMgbmFtZSBpcyBpbnZhbGlkLlxuICAgKi9cbiAgZ2V0VG9waWModG9waWNOYW1lKSB7XG4gICAgbGV0IHRvcGljID0gdGhpcy4jY2FjaGVHZXQoJ3RvcGljJywgdG9waWNOYW1lKTtcbiAgICBpZiAoIXRvcGljICYmIHRvcGljTmFtZSkge1xuICAgICAgaWYgKHRvcGljTmFtZSA9PSBDb25zdC5UT1BJQ19NRSkge1xuICAgICAgICB0b3BpYyA9IG5ldyBUb3BpY01lKCk7XG4gICAgICB9IGVsc2UgaWYgKHRvcGljTmFtZSA9PSBDb25zdC5UT1BJQ19GTkQpIHtcbiAgICAgICAgdG9waWMgPSBuZXcgVG9waWNGbmQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvcGljID0gbmV3IFRvcGljKHRvcGljTmFtZSk7XG4gICAgICB9XG4gICAgICAvLyBDYWNoZSBtYW5hZ2VtZW50LlxuICAgICAgdGhpcy4jYXR0YWNoQ2FjaGVUb1RvcGljKHRvcGljKTtcbiAgICAgIHRvcGljLl9jYWNoZVB1dFNlbGYoKTtcbiAgICAgIC8vIERvbid0IHNhdmUgdG8gREIgaGVyZTogYSByZWNvcmQgd2lsbCBiZSBhZGRlZCB3aGVuIHRoZSB0b3BpYyBpcyBzdWJzY3JpYmVkLlxuICAgIH1cbiAgICByZXR1cm4gdG9waWM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgbmFtZWQgdG9waWMgZnJvbSBjYWNoZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRvcGljTmFtZSAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIGdldC5cbiAgICogQHJldHVybnMge1Rpbm9kZS5Ub3BpY30gUmVxdWVzdGVkIHRvcGljIG9yIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gaWYgdG9waWMgaXMgbm90IGZvdW5kIGluIGNhY2hlLlxuICAgKi9cbiAgY2FjaGVHZXRUb3BpYyh0b3BpY05hbWUpIHtcbiAgICByZXR1cm4gdGhpcy4jY2FjaGVHZXQoJ3RvcGljJywgdG9waWNOYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgbmFtZWQgdG9waWMgZnJvbSBjYWNoZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRvcGljTmFtZSAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIHJlbW92ZSBmcm9tIGNhY2hlLlxuICAgKi9cbiAgY2FjaGVSZW1Ub3BpYyh0b3BpY05hbWUpIHtcbiAgICB0aGlzLiNjYWNoZURlbCgndG9waWMnLCB0b3BpY05hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb3ZlciBjYWNoZWQgdG9waWNzLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIC0gY2FsbGJhY2sgdG8gY2FsbCBmb3IgZWFjaCB0b3BpYy5cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSAndGhpcycgaW5zaWRlIHRoZSAnZnVuYycuXG4gICAqL1xuICBtYXBUb3BpY3MoZnVuYywgY29udGV4dCkge1xuICAgIHRoaXMuI2NhY2hlTWFwKCd0b3BpYycsIGZ1bmMsIGNvbnRleHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIG5hbWVkIHRvcGljIGlzIGFscmVhZHkgcHJlc2VudCBpbiBjYWNoZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRvcGljTmFtZSAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0b3BpYyBpcyBmb3VuZCBpbiBjYWNoZSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgaXNUb3BpY0NhY2hlZCh0b3BpY05hbWUpIHtcbiAgICByZXR1cm4gISF0aGlzLiNjYWNoZUdldCgndG9waWMnLCB0b3BpY05hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIHVuaXF1ZSBuYW1lIGxpa2UgPGNvZGU+J25ldzEyMzQ1Nic8L2NvZGU+IHN1aXRhYmxlIGZvciBjcmVhdGluZyBhIG5ldyBncm91cCB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0NoYW4gLSBpZiB0aGUgdG9waWMgaXMgY2hhbm5lbC1lbmFibGVkLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBuYW1lIHdoaWNoIGNhbiBiZSB1c2VkIGZvciBjcmVhdGluZyBhIG5ldyBncm91cCB0b3BpYy5cbiAgICovXG4gIG5ld0dyb3VwVG9waWNOYW1lKGlzQ2hhbikge1xuICAgIHJldHVybiAoaXNDaGFuID8gQ29uc3QuVE9QSUNfTkVXX0NIQU4gOiBDb25zdC5UT1BJQ19ORVcpICsgdGhpcy5nZXROZXh0VW5pcXVlSWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnN0YW50aWF0ZSA8Y29kZT4nbWUnPC9jb2RlPiB0b3BpYyBvciBnZXQgaXQgZnJvbSBjYWNoZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHJldHVybnMge1Rpbm9kZS5Ub3BpY01lfSBJbnN0YW5jZSBvZiA8Y29kZT4nbWUnPC9jb2RlPiB0b3BpYy5cbiAgICovXG4gIGdldE1lVG9waWMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VG9waWMoQ29uc3QuVE9QSUNfTUUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlIDxjb2RlPidmbmQnPC9jb2RlPiAoZmluZCkgdG9waWMgb3IgZ2V0IGl0IGZyb20gY2FjaGUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEByZXR1cm5zIHtUaW5vZGUuVG9waWN9IEluc3RhbmNlIG9mIDxjb2RlPidmbmQnPC9jb2RlPiB0b3BpYy5cbiAgICovXG4gIGdldEZuZFRvcGljKCkge1xuICAgIHJldHVybiB0aGlzLmdldFRvcGljKENvbnN0LlRPUElDX0ZORCk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IHtAbGluayBMYXJnZUZpbGVIZWxwZXJ9IGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEByZXR1cm5zIHtUaW5vZGUuTGFyZ2VGaWxlSGVscGVyfSBpbnN0YW5jZSBvZiBhIHtAbGluayBUaW5vZGUuTGFyZ2VGaWxlSGVscGVyfS5cbiAgICovXG4gIGdldExhcmdlRmlsZUhlbHBlcigpIHtcbiAgICByZXR1cm4gbmV3IExhcmdlRmlsZUhlbHBlcih0aGlzLCBDb25zdC5QUk9UT0NPTF9WRVJTSU9OKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIFVJRCBvZiB0aGUgdGhlIGN1cnJlbnQgYXV0aGVudGljYXRlZCB1c2VyLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBVSUQgb2YgdGhlIGN1cnJlbnQgdXNlciBvciA8Y29kZT51bmRlZmluZWQ8L2NvZGU+IGlmIHRoZSBzZXNzaW9uIGlzIG5vdCB5ZXQgYXV0aGVudGljYXRlZCBvciBpZiB0aGVyZSBpcyBubyBzZXNzaW9uLlxuICAgKi9cbiAgZ2V0Q3VycmVudFVzZXJJRCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbXlVSUQ7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIGdpdmVuIHVzZXIgSUQgaXMgZXF1YWwgdG8gdGhlIGN1cnJlbnQgdXNlcidzIFVJRC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVpZCAtIFVJRCB0byBjaGVjay5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGdpdmVuIFVJRCBiZWxvbmdzIHRvIHRoZSBjdXJyZW50IGxvZ2dlZCBpbiB1c2VyLlxuICAgKi9cbiAgaXNNZSh1aWQpIHtcbiAgICByZXR1cm4gdGhpcy5fbXlVSUQgPT09IHVpZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgbG9naW4gdXNlZCBmb3IgbGFzdCBzdWNjZXNzZnVsIGF1dGhlbnRpY2F0aW9uLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBsb2dpbiBsYXN0IHVzZWQgc3VjY2Vzc2Z1bGx5IG9yIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4uXG4gICAqL1xuICBnZXRDdXJyZW50TG9naW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xvZ2luO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBpbmZvcm1hdGlvbiBhYm91dCB0aGUgc2VydmVyOiBwcm90b2NvbCB2ZXJzaW9uIGFuZCBidWlsZCB0aW1lc3RhbXAuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IGJ1aWxkIGFuZCB2ZXJzaW9uIG9mIHRoZSBzZXJ2ZXIgb3IgPGNvZGU+bnVsbDwvY29kZT4gaWYgdGhlcmUgaXMgbm8gY29ubmVjdGlvbiBvciBpZiB0aGUgZmlyc3Qgc2VydmVyIHJlc3BvbnNlIGhhcyBub3QgYmVlbiByZWNlaXZlZCB5ZXQuXG4gICAqL1xuICBnZXRTZXJ2ZXJJbmZvKCkge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2ZXJJbmZvO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcG9ydCBhIHRvcGljIGZvciBhYnVzZS4gV3JhcHBlciBmb3Ige0BsaW5rIFRpbm9kZSNwdWJsaXNofS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbiAtIHRoZSBvbmx5IHN1cHBvcnRlZCBhY3Rpb24gaXMgJ3JlcG9ydCcuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXQgLSBuYW1lIG9mIHRoZSB0b3BpYyBiZWluZyByZXBvcnRlZC5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgdG8gYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgc2VydmVyIHJlc3BvbmRzIHRvIHJlcXVlc3QuXG4gICAqL1xuICByZXBvcnQoYWN0aW9uLCB0YXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5wdWJsaXNoKENvbnN0LlRPUElDX1NZUywgRHJhZnR5LmF0dGFjaEpTT04obnVsbCwge1xuICAgICAgJ2FjdGlvbic6IGFjdGlvbixcbiAgICAgICd0YXJnZXQnOiB0YXJnZXRcbiAgICB9KSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHNlcnZlci1wcm92aWRlZCBjb25maWd1cmF0aW9uIHZhbHVlIChsb25nIGludGVnZXIpLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBvZiB0aGUgdmFsdWUgdG8gcmV0dXJuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0VmFsdWUgdG8gcmV0dXJuIGluIGNhc2Ugc2VydmVyIGxpbWl0IGlzIG5vdCBzZXQgb3Igbm90IGZvdW5kLlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBuYW1lZCB2YWx1ZS5cbiAgICovXG4gIGdldFNlcnZlckxpbWl0KG5hbWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgIHJldHVybiAodGhpcy5fc2VydmVySW5mbyA/IHRoaXMuX3NlcnZlckluZm9bbmFtZV0gOiBudWxsKSB8fCBkZWZhdWx0VmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlIGNvbnNvbGUgbG9nZ2luZy4gTG9nZ2luZyBpcyBvZmYgYnkgZGVmYXVsdC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICogQHBhcmFtIHtib29sZWFufSBlbmFibGVkIC0gU2V0IHRvIDxjb2RlPnRydWU8L2NvZGU+IHRvIGVuYWJsZSBsb2dnaW5nIHRvIGNvbnNvbGUuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdHJpbUxvbmdTdHJpbmdzIC0gU2V0IHRvIDxjb2RlPnRydWU8L2NvZGU+IHRvIHRyaW0gbG9uZyBzdHJpbmdzLlxuICAgKi9cbiAgZW5hYmxlTG9nZ2luZyhlbmFibGVkLCB0cmltTG9uZ1N0cmluZ3MpIHtcbiAgICB0aGlzLl9sb2dnaW5nRW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgdGhpcy5fdHJpbUxvbmdTdHJpbmdzID0gZW5hYmxlZCAmJiB0cmltTG9uZ1N0cmluZ3M7XG4gIH1cblxuICAvKipcbiAgICogU2V0IFVJIGxhbmd1YWdlIHRvIHJlcG9ydCB0byB0aGUgc2VydmVyLiBNdXN0IGJlIGNhbGxlZCBiZWZvcmUgPGNvZGU+J2hpJzwvY29kZT4gaXMgc2VudCwgb3RoZXJ3aXNlIGl0IHdpbGwgbm90IGJlIHVzZWQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBobCAtIGh1bWFuIChVSSkgbGFuZ3VhZ2UsIGxpa2UgPGNvZGU+XCJlbl9VU1wiPC9jb2RlPiBvciA8Y29kZT5cInpoLUhhbnNcIjwvY29kZT4uXG4gICAqL1xuICBzZXRIdW1hbkxhbmd1YWdlKGhsKSB7XG4gICAgaWYgKGhsKSB7XG4gICAgICB0aGlzLl9odW1hbkxhbmd1YWdlID0gaGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGdpdmVuIHRvcGljIGlzIG9ubGluZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgb2YgdGhlIHRvcGljIHRvIHRlc3QuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRvcGljIGlzIG9ubGluZSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgaXNUb3BpY09ubGluZShuYW1lKSB7XG4gICAgY29uc3QgdG9waWMgPSB0aGlzLiNjYWNoZUdldCgndG9waWMnLCBuYW1lKTtcbiAgICByZXR1cm4gdG9waWMgJiYgdG9waWMub25saW5lO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhY2Nlc3MgbW9kZSBmb3IgdGhlIGdpdmVuIGNvbnRhY3QuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG9mIHRoZSB0b3BpYyB0byBxdWVyeS5cbiAgICogQHJldHVybnMge0FjY2Vzc01vZGV9IGFjY2VzcyBtb2RlIGlmIHRvcGljIGlzIGZvdW5kLCBudWxsIG90aGVyd2lzZS5cbiAgICovXG4gIGdldFRvcGljQWNjZXNzTW9kZShuYW1lKSB7XG4gICAgY29uc3QgdG9waWMgPSB0aGlzLiNjYWNoZUdldCgndG9waWMnLCBuYW1lKTtcbiAgICByZXR1cm4gdG9waWMgPyB0b3BpYy5hY3MgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEluY2x1ZGUgbWVzc2FnZSBJRCBpbnRvIGFsbCBzdWJzZXF1ZXN0IG1lc3NhZ2VzIHRvIHNlcnZlciBpbnN0cnVjdGluIGl0IHRvIHNlbmQgYWtub3dsZWRnZW1lbnMuXG4gICAqIFJlcXVpcmVkIGZvciBwcm9taXNlcyB0byBmdW5jdGlvbi4gRGVmYXVsdCBpcyA8Y29kZT5cIm9uXCI8L2NvZGU+LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN0YXR1cyAtIFR1cm4gYWtub3dsZWRnZW1lbnMgb24gb3Igb2ZmLlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgd2FudEFrbihzdGF0dXMpIHtcbiAgICBpZiAoc3RhdHVzKSB7XG4gICAgICB0aGlzLl9tZXNzYWdlSWQgPSBNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogMHhGRkZGRkYpICsgMHhGRkZGRkYpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tZXNzYWdlSWQgPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8vIENhbGxiYWNrczpcbiAgLyoqXG4gICAqIENhbGxiYWNrIHRvIHJlcG9ydCB3aGVuIHRoZSB3ZWJzb2NrZXQgaXMgb3BlbmVkLiBUaGUgY2FsbGJhY2sgaGFzIG5vIHBhcmFtZXRlcnMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEB0eXBlIHtUaW5vZGUub25XZWJzb2NrZXRPcGVufVxuICAgKi9cbiAgb25XZWJzb2NrZXRPcGVuID0gdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiBUaW5vZGUuU2VydmVyUGFyYW1zXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IHZlciAtIFNlcnZlciB2ZXJzaW9uXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBidWlsZCAtIFNlcnZlciBidWlsZFxuICAgKiBAcHJvcGVydHkge3N0cmluZz19IHNpZCAtIFNlc3Npb24gSUQsIGxvbmcgcG9sbGluZyBjb25uZWN0aW9ucyBvbmx5LlxuICAgKi9cblxuICAvKipcbiAgICogQGNhbGxiYWNrIFRpbm9kZS5vbkNvbm5lY3RcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvZGUgLSBSZXN1bHQgY29kZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRleHQgZXB4cGxhaW5pbmcgdGhlIGNvbXBsZXRpb24sIGkuZSBcIk9LXCIgb3IgYW4gZXJyb3IgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtUaW5vZGUuU2VydmVyUGFyYW1zfSBwYXJhbXMgLSBQYXJhbWV0ZXJzIHJldHVybmVkIGJ5IHRoZSBzZXJ2ZXIuXG4gICAqL1xuICAvKipcbiAgICogQ2FsbGJhY2sgdG8gcmVwb3J0IHdoZW4gY29ubmVjdGlvbiB3aXRoIFRpbm9kZSBzZXJ2ZXIgaXMgZXN0YWJsaXNoZWQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEB0eXBlIHtUaW5vZGUub25Db25uZWN0fVxuICAgKi9cbiAgb25Db25uZWN0ID0gdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBDYWxsYmFjayB0byByZXBvcnQgd2hlbiBjb25uZWN0aW9uIGlzIGxvc3QuIFRoZSBjYWxsYmFjayBoYXMgbm8gcGFyYW1ldGVycy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICogQHR5cGUge1Rpbm9kZS5vbkRpc2Nvbm5lY3R9XG4gICAqL1xuICBvbkRpc2Nvbm5lY3QgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEBjYWxsYmFjayBUaW5vZGUub25Mb2dpblxuICAgKiBAcGFyYW0ge251bWJlcn0gY29kZSAtIE5VbWVyaWMgY29tcGxldGlvbiBjb2RlLCBzYW1lIGFzIEhUVFAgc3RhdHVzIGNvZGVzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIEV4cGxhbmF0aW9uIG9mIHRoZSBjb21wbGV0aW9uIGNvZGUuXG4gICAqL1xuICAvKipcbiAgICogQ2FsbGJhY2sgdG8gcmVwb3J0IGxvZ2luIGNvbXBsZXRpb24uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEB0eXBlIHtUaW5vZGUub25Mb2dpbn1cbiAgICovXG4gIG9uTG9naW4gPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRvIHJlY2VpdmUgPGNvZGU+e2N0cmx9PC9jb2RlPiAoY29udHJvbCkgbWVzc2FnZXMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEB0eXBlIHtUaW5vZGUub25DdHJsTWVzc2FnZX1cbiAgICovXG4gIG9uQ3RybE1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRvIHJlY2lldmUgPGNvZGU+e2RhdGF9PC9jb2RlPiAoY29udGVudCkgbWVzc2FnZXMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEB0eXBlIHtUaW5vZGUub25EYXRhTWVzc2FnZX1cbiAgICovXG4gIG9uRGF0YU1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRvIHJlY2VpdmUgPGNvZGU+e3ByZXN9PC9jb2RlPiAocHJlc2VuY2UpIG1lc3NhZ2VzLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKiBAdHlwZSB7VGlub2RlLm9uUHJlc01lc3NhZ2V9XG4gICAqL1xuICBvblByZXNNZXNzYWdlID0gdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBDYWxsYmFjayB0byByZWNlaXZlIGFsbCBtZXNzYWdlcyBhcyBvYmplY3RzLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKiBAdHlwZSB7VGlub2RlLm9uTWVzc2FnZX1cbiAgICovXG4gIG9uTWVzc2FnZSA9IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogQ2FsbGJhY2sgdG8gcmVjZWl2ZSBhbGwgbWVzc2FnZXMgYXMgdW5wYXJzZWQgdGV4dC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICogQHR5cGUge1Rpbm9kZS5vblJhd01lc3NhZ2V9XG4gICAqL1xuICBvblJhd01lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRvIHJlY2VpdmUgc2VydmVyIHJlc3BvbnNlcyB0byBuZXR3b3JrIHByb2Jlcy4gU2VlIHtAbGluayBUaW5vZGUjbmV0d29ya1Byb2JlfVxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKiBAdHlwZSB7VGlub2RlLm9uTmV0d29ya1Byb2JlfVxuICAgKi9cbiAgb25OZXR3b3JrUHJvYmUgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRvIGJlIG5vdGlmaWVkIHdoZW4gZXhwb25lbnRpYWwgYmFja29mZiBpcyBpdGVyYXRpbmcuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEB0eXBlIHtUaW5vZGUub25BdXRvcmVjb25uZWN0SXRlcmF0aW9ufVxuICAgKi9cbiAgb25BdXRvcmVjb25uZWN0SXRlcmF0aW9uID0gdW5kZWZpbmVkO1xufTtcblxuLy8gRXhwb3J0ZWQgY29uc3RhbnRzXG5UaW5vZGUuTUVTU0FHRV9TVEFUVVNfTk9ORSA9IENvbnN0Lk1FU1NBR0VfU1RBVFVTX05PTkU7XG5UaW5vZGUuTUVTU0FHRV9TVEFUVVNfUVVFVUVEID0gQ29uc3QuTUVTU0FHRV9TVEFUVVNfUVVFVUVEO1xuVGlub2RlLk1FU1NBR0VfU1RBVFVTX1NFTkRJTkcgPSBDb25zdC5NRVNTQUdFX1NUQVRVU19TRU5ESU5HO1xuVGlub2RlLk1FU1NBR0VfU1RBVFVTX0ZBSUxFRCA9IENvbnN0Lk1FU1NBR0VfU1RBVFVTX0ZBSUxFRDtcblRpbm9kZS5NRVNTQUdFX1NUQVRVU19TRU5UID0gQ29uc3QuTUVTU0FHRV9TVEFUVVNfU0VOVDtcblRpbm9kZS5NRVNTQUdFX1NUQVRVU19SRUNFSVZFRCA9IENvbnN0Lk1FU1NBR0VfU1RBVFVTX1JFQ0VJVkVEO1xuVGlub2RlLk1FU1NBR0VfU1RBVFVTX1JFQUQgPSBDb25zdC5NRVNTQUdFX1NUQVRVU19SRUFEO1xuVGlub2RlLk1FU1NBR0VfU1RBVFVTX1RPX01FID0gQ29uc3QuTUVTU0FHRV9TVEFUVVNfVE9fTUU7XG5UaW5vZGUuTUVTU0FHRV9TVEFUVVNfREVMX1JBTkdFID0gQ29uc3QuTUVTU0FHRV9TVEFUVVNfREVMX1JBTkdFO1xuXG4vLyBVbmljb2RlIFtkZWxdIHN5bWJvbC5cblRpbm9kZS5ERUxfQ0hBUiA9IENvbnN0LkRFTF9DSEFSO1xuXG4vLyBOYW1lcyBvZiBrZXlzIHRvIHNlcnZlci1wcm92aWRlZCBjb25maWd1cmF0aW9uIGxpbWl0cy5cblRpbm9kZS5NQVhfTUVTU0FHRV9TSVpFID0gJ21heE1lc3NhZ2VTaXplJztcblRpbm9kZS5NQVhfU1VCU0NSSUJFUl9DT1VOVCA9ICdtYXhTdWJzY3JpYmVyQ291bnQnO1xuVGlub2RlLk1BWF9UQUdfQ09VTlQgPSAnbWF4VGFnQ291bnQnO1xuVGlub2RlLk1BWF9GSUxFX1VQTE9BRF9TSVpFID0gJ21heEZpbGVVcGxvYWRTaXplJztcbiIsIi8qKlxuICogQGZpbGUgVG9waWMgbWFuYWdlbWVudC5cbiAqXG4gKiBAY29weXJpZ2h0IDIwMTUtMjAyMiBUaW5vZGUgTExDLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBBY2Nlc3NNb2RlIGZyb20gJy4vYWNjZXNzLW1vZGUuanMnO1xuaW1wb3J0IENCdWZmZXIgZnJvbSAnLi9jYnVmZmVyLmpzJztcbmltcG9ydCAqIGFzIENvbnN0IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCBEcmFmdHkgZnJvbSAnLi9kcmFmdHkuanMnO1xuaW1wb3J0IE1ldGFHZXRCdWlsZGVyIGZyb20gJy4vbWV0YS1idWlsZGVyLmpzJztcbmltcG9ydCB7XG4gIG1lcmdlT2JqLFxuICBtZXJnZVRvQ2FjaGUsXG4gIG5vcm1hbGl6ZUFycmF5XG59IGZyb20gJy4vdXRpbHMuanMnO1xuXG5leHBvcnQgY2xhc3MgVG9waWMge1xuICAvKipcbiAgICogQGNhbGxiYWNrIFRpbm9kZS5Ub3BpYy5vbkRhdGFcbiAgICogQHBhcmFtIHtEYXRhfSBkYXRhIC0gRGF0YSBwYWNrZXRcbiAgICovXG4gIC8qKlxuICAgKiBUb3BpYyBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyBhIGxvZ2ljYWwgY29tbXVuaWNhdGlvbiBjaGFubmVsLlxuICAgKiBAY2xhc3MgVG9waWNcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIGNyZWF0ZS5cbiAgICogQHBhcmFtIHtPYmplY3Q9fSBjYWxsYmFja3MgLSBPYmplY3Qgd2l0aCB2YXJpb3VzIGV2ZW50IGNhbGxiYWNrcy5cbiAgICogQHBhcmFtIHtUaW5vZGUuVG9waWMub25EYXRhfSBjYWxsYmFja3Mub25EYXRhIC0gQ2FsbGJhY2sgd2hpY2ggcmVjZWl2ZXMgYSA8Y29kZT57ZGF0YX08L2NvZGU+IG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7Y2FsbGJhY2t9IGNhbGxiYWNrcy5vbk1ldGEgLSBDYWxsYmFjayB3aGljaCByZWNlaXZlcyBhIDxjb2RlPnttZXRhfTwvY29kZT4gbWVzc2FnZS5cbiAgICogQHBhcmFtIHtjYWxsYmFja30gY2FsbGJhY2tzLm9uUHJlcyAtIENhbGxiYWNrIHdoaWNoIHJlY2VpdmVzIGEgPGNvZGU+e3ByZXN9PC9jb2RlPiBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge2NhbGxiYWNrfSBjYWxsYmFja3Mub25JbmZvIC0gQ2FsbGJhY2sgd2hpY2ggcmVjZWl2ZXMgYW4gPGNvZGU+e2luZm99PC9jb2RlPiBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge2NhbGxiYWNrfSBjYWxsYmFja3Mub25NZXRhRGVzYyAtIENhbGxiYWNrIHdoaWNoIHJlY2VpdmVzIGNoYW5nZXMgdG8gdG9waWMgZGVzY3Rpb3B0aW9uIHtAbGluayBkZXNjfS5cbiAgICogQHBhcmFtIHtjYWxsYmFja30gY2FsbGJhY2tzLm9uTWV0YVN1YiAtIENhbGxlZCBmb3IgYSBzaW5nbGUgc3Vic2NyaXB0aW9uIHJlY29yZCBjaGFuZ2UuXG4gICAqIEBwYXJhbSB7Y2FsbGJhY2t9IGNhbGxiYWNrcy5vblN1YnNVcGRhdGVkIC0gQ2FsbGVkIGFmdGVyIGEgYmF0Y2ggb2Ygc3Vic2NyaXB0aW9uIGNoYW5nZXMgaGF2ZSBiZWVuIHJlY2lldmVkIGFuZCBjYWNoZWQuXG4gICAqIEBwYXJhbSB7Y2FsbGJhY2t9IGNhbGxiYWNrcy5vbkRlbGV0ZVRvcGljIC0gQ2FsbGVkIGFmdGVyIHRoZSB0b3BpYyBpcyBkZWxldGVkLlxuICAgKiBAcGFyYW0ge2NhbGxiYWNrfSBjYWxsYmFjbHMub25BbGxNZXNzYWdlc1JlY2VpdmVkIC0gQ2FsbGVkIHdoZW4gYWxsIHJlcXVlc3RlZCA8Y29kZT57ZGF0YX08L2NvZGU+IG1lc3NhZ2VzIGhhdmUgYmVlbiByZWNpdmVkLlxuICAgKi9cbiAgY29uc3RydWN0b3IobmFtZSwgY2FsbGJhY2tzKSB7XG4gICAgLy8gUGFyZW50IFRpbm9kZSBvYmplY3QuXG4gICAgdGhpcy5fdGlub2RlID0gbnVsbDtcblxuICAgIC8vIFNlcnZlci1wcm92aWRlZCBkYXRhLCBsb2NhbGx5IGltbXV0YWJsZS5cbiAgICAvLyB0b3BpYyBuYW1lXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAvLyBUaW1lc3RhbXAgd2hlbiB0aGUgdG9waWMgd2FzIGNyZWF0ZWQuXG4gICAgdGhpcy5jcmVhdGVkID0gbnVsbDtcbiAgICAvLyBUaW1lc3RhbXAgd2hlbiB0aGUgdG9waWMgd2FzIGxhc3QgdXBkYXRlZC5cbiAgICB0aGlzLnVwZGF0ZWQgPSBudWxsO1xuICAgIC8vIFRpbWVzdGFtcCBvZiB0aGUgbGFzdCBtZXNzYWdlc1xuICAgIHRoaXMudG91Y2hlZCA9IG5ldyBEYXRlKDApO1xuICAgIC8vIEFjY2VzcyBtb2RlLCBzZWUgQWNjZXNzTW9kZVxuICAgIHRoaXMuYWNzID0gbmV3IEFjY2Vzc01vZGUobnVsbCk7XG4gICAgLy8gUGVyLXRvcGljIHByaXZhdGUgZGF0YSAoYWNjZXNzaWJsZSBieSBjdXJyZW50IHVzZXIgb25seSkuXG4gICAgdGhpcy5wcml2YXRlID0gbnVsbDtcbiAgICAvLyBQZXItdG9waWMgcHVibGljIGRhdGEgKGFjY2Vzc2libGUgYnkgYWxsIHVzZXJzKS5cbiAgICB0aGlzLnB1YmxpYyA9IG51bGw7XG4gICAgLy8gUGVyLXRvcGljIHN5c3RlbS1wcm92aWRlZCBkYXRhIChhY2Nlc3NpYmxlIGJ5IGFsbCB1c2VycykuXG4gICAgdGhpcy50cnVzdGVkID0gbnVsbDtcblxuICAgIC8vIExvY2FsbHkgY2FjaGVkIGRhdGFcbiAgICAvLyBTdWJzY3JpYmVkIHVzZXJzLCBmb3IgdHJhY2tpbmcgcmVhZC9yZWN2L21zZyBub3RpZmljYXRpb25zLlxuICAgIHRoaXMuX3VzZXJzID0ge307XG5cbiAgICAvLyBDdXJyZW50IHZhbHVlIG9mIGxvY2FsbHkgaXNzdWVkIHNlcUlkLCB1c2VkIGZvciBwZW5kaW5nIG1lc3NhZ2VzLlxuICAgIHRoaXMuX3F1ZXVlZFNlcUlkID0gQ29uc3QuTE9DQUxfU0VRSUQ7XG5cbiAgICAvLyBUaGUgbWF4aW11bSBrbm93biB7ZGF0YS5zZXF9IHZhbHVlLlxuICAgIHRoaXMuX21heFNlcSA9IDA7XG4gICAgLy8gVGhlIG1pbmltdW0ga25vd24ge2RhdGEuc2VxfSB2YWx1ZS5cbiAgICB0aGlzLl9taW5TZXEgPSAwO1xuICAgIC8vIEluZGljYXRvciB0aGF0IHRoZSBsYXN0IHJlcXVlc3QgZm9yIGVhcmxpZXIgbWVzc2FnZXMgcmV0dXJuZWQgMC5cbiAgICB0aGlzLl9ub0VhcmxpZXJNc2dzID0gZmFsc2U7XG4gICAgLy8gVGhlIG1heGltdW0ga25vd24gZGVsZXRpb24gSUQuXG4gICAgdGhpcy5fbWF4RGVsID0gMDtcbiAgICAvLyBVc2VyIGRpc2NvdmVyeSB0YWdzXG4gICAgdGhpcy5fdGFncyA9IFtdO1xuICAgIC8vIENyZWRlbnRpYWxzIHN1Y2ggYXMgZW1haWwgb3IgcGhvbmUgbnVtYmVyLlxuICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gW107XG4gICAgLy8gTWVzc2FnZSBjYWNoZSwgc29ydGVkIGJ5IG1lc3NhZ2Ugc2VxIHZhbHVlcywgZnJvbSBvbGQgdG8gbmV3LlxuICAgIHRoaXMuX21lc3NhZ2VzID0gbmV3IENCdWZmZXIoKGEsIGIpID0+IHtcbiAgICAgIHJldHVybiBhLnNlcSAtIGIuc2VxO1xuICAgIH0sIHRydWUpO1xuICAgIC8vIEJvb2xlYW4sIHRydWUgaWYgdGhlIHRvcGljIGlzIGN1cnJlbnRseSBsaXZlXG4gICAgdGhpcy5fYXR0YWNoZWQgPSBmYWxzZTtcbiAgICAvLyBUaW1lc3RhcCBvZiB0aGUgbW9zdCByZWNlbnRseSB1cGRhdGVkIHN1YnNjcmlwdGlvbi5cbiAgICB0aGlzLl9sYXN0U3Vic1VwZGF0ZSA9IG5ldyBEYXRlKDApO1xuICAgIC8vIFRvcGljIGNyZWF0ZWQgYnV0IG5vdCB5ZXQgc3luY2VkIHdpdGggdGhlIHNlcnZlci4gVXNlZCBvbmx5IGR1cmluZyBpbml0aWFsaXphdGlvbi5cbiAgICB0aGlzLl9uZXcgPSB0cnVlO1xuICAgIC8vIFRoZSB0b3BpYyBpcyBkZWxldGVkIGF0IHRoZSBzZXJ2ZXIsIHRoaXMgaXMgYSBsb2NhbCBjb3B5LlxuICAgIHRoaXMuX2RlbGV0ZWQgPSBmYWxzZTtcblxuICAgIC8vIENhbGxiYWNrc1xuICAgIGlmIChjYWxsYmFja3MpIHtcbiAgICAgIHRoaXMub25EYXRhID0gY2FsbGJhY2tzLm9uRGF0YTtcbiAgICAgIHRoaXMub25NZXRhID0gY2FsbGJhY2tzLm9uTWV0YTtcbiAgICAgIHRoaXMub25QcmVzID0gY2FsbGJhY2tzLm9uUHJlcztcbiAgICAgIHRoaXMub25JbmZvID0gY2FsbGJhY2tzLm9uSW5mbztcbiAgICAgIC8vIEEgc2luZ2xlIGRlc2MgdXBkYXRlO1xuICAgICAgdGhpcy5vbk1ldGFEZXNjID0gY2FsbGJhY2tzLm9uTWV0YURlc2M7XG4gICAgICAvLyBBIHNpbmdsZSBzdWJzY3JpcHRpb24gcmVjb3JkO1xuICAgICAgdGhpcy5vbk1ldGFTdWIgPSBjYWxsYmFja3Mub25NZXRhU3ViO1xuICAgICAgLy8gQWxsIHN1YnNjcmlwdGlvbiByZWNvcmRzIHJlY2VpdmVkO1xuICAgICAgdGhpcy5vblN1YnNVcGRhdGVkID0gY2FsbGJhY2tzLm9uU3Vic1VwZGF0ZWQ7XG4gICAgICB0aGlzLm9uVGFnc1VwZGF0ZWQgPSBjYWxsYmFja3Mub25UYWdzVXBkYXRlZDtcbiAgICAgIHRoaXMub25DcmVkc1VwZGF0ZWQgPSBjYWxsYmFja3Mub25DcmVkc1VwZGF0ZWQ7XG4gICAgICB0aGlzLm9uRGVsZXRlVG9waWMgPSBjYWxsYmFja3Mub25EZWxldGVUb3BpYztcbiAgICAgIHRoaXMub25BbGxNZXNzYWdlc1JlY2VpdmVkID0gY2FsbGJhY2tzLm9uQWxsTWVzc2FnZXNSZWNlaXZlZDtcbiAgICB9XG4gIH1cblxuICAvLyBTdGF0aWMgbWV0aG9kcy5cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIHRvcGljIHR5cGUgZnJvbSB0b3BpYydzIG5hbWU6IGdycCwgcDJwLCBtZSwgZm5kLCBzeXMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSB0b3BpYyB0byB0ZXN0LlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBPbmUgb2YgPGNvZGU+XCJtZVwiPC9jb2RlPiwgPGNvZGU+XCJmbmRcIjwvY29kZT4sIDxjb2RlPlwic3lzXCI8L2NvZGU+LCA8Y29kZT5cImdycFwiPC9jb2RlPixcbiAgICogICAgPGNvZGU+XCJwMnBcIjwvY29kZT4gb3IgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPi5cbiAgICovXG4gIHN0YXRpYyB0b3BpY1R5cGUobmFtZSkge1xuICAgIGNvbnN0IHR5cGVzID0ge1xuICAgICAgJ21lJzogQ29uc3QuVE9QSUNfTUUsXG4gICAgICAnZm5kJzogQ29uc3QuVE9QSUNfRk5ELFxuICAgICAgJ2dycCc6IENvbnN0LlRPUElDX0dSUCxcbiAgICAgICduZXcnOiBDb25zdC5UT1BJQ19HUlAsXG4gICAgICAnbmNoJzogQ29uc3QuVE9QSUNfR1JQLFxuICAgICAgJ2Nobic6IENvbnN0LlRPUElDX0dSUCxcbiAgICAgICd1c3InOiBDb25zdC5UT1BJQ19QMlAsXG4gICAgICAnc3lzJzogQ29uc3QuVE9QSUNfU1lTXG4gICAgfTtcbiAgICByZXR1cm4gdHlwZXNbKHR5cGVvZiBuYW1lID09ICdzdHJpbmcnKSA/IG5hbWUuc3Vic3RyaW5nKDAsIDMpIDogJ3h4eCddO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBnaXZlbiB0b3BpYyBuYW1lIGlzIGEgbmFtZSBvZiBhICdtZScgdG9waWMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSB0b3BpYyB0byB0ZXN0LlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlIG5hbWUgaXMgYSBuYW1lIG9mIGEgJ21lJyB0b3BpYywgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIHN0YXRpYyBpc01lVG9waWNOYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gVG9waWMudG9waWNUeXBlKG5hbWUpID09IENvbnN0LlRPUElDX01FO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBnaXZlbiB0b3BpYyBuYW1lIGlzIGEgbmFtZSBvZiBhIGdyb3VwIHRvcGljLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKiBAc3RhdGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiB0aGUgdG9waWMgdG8gdGVzdC5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IDxjb2RlPnRydWU8L2NvZGU+IGlmIHRoZSBuYW1lIGlzIGEgbmFtZSBvZiBhIGdyb3VwIHRvcGljLCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICAgKi9cbiAgc3RhdGljIGlzR3JvdXBUb3BpY05hbWUobmFtZSkge1xuICAgIHJldHVybiBUb3BpYy50b3BpY1R5cGUobmFtZSkgPT0gQ29uc3QuVE9QSUNfR1JQO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBnaXZlbiB0b3BpYyBuYW1lIGlzIGEgbmFtZSBvZiBhIHAycCB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIHRlc3QuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiB0aGUgbmFtZSBpcyBhIG5hbWUgb2YgYSBwMnAgdG9waWMsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBzdGF0aWMgaXNQMlBUb3BpY05hbWUobmFtZSkge1xuICAgIHJldHVybiBUb3BpYy50b3BpY1R5cGUobmFtZSkgPT0gQ29uc3QuVE9QSUNfUDJQO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBnaXZlbiB0b3BpYyBuYW1lIGlzIGEgbmFtZSBvZiBhIGNvbW11bmljYXRpb24gdG9waWMsIGkuZS4gUDJQIG9yIGdyb3VwLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKiBAc3RhdGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiB0aGUgdG9waWMgdG8gdGVzdC5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IDxjb2RlPnRydWU8L2NvZGU+IGlmIHRoZSBuYW1lIGlzIGEgbmFtZSBvZiBhIHAycCBvciBncm91cCB0b3BpYywgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIHN0YXRpYyBpc0NvbW1Ub3BpY05hbWUobmFtZSkge1xuICAgIHJldHVybiBUb3BpYy5pc1AyUFRvcGljTmFtZShuYW1lKSB8fCBUb3BpYy5pc0dyb3VwVG9waWNOYW1lKG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSB0b3BpYyBuYW1lIGlzIGEgbmFtZSBvZiBhIG5ldyB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIHRvcGljIG5hbWUgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiB0aGUgbmFtZSBpcyBhIG5hbWUgb2YgYSBuZXcgdG9waWMsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBzdGF0aWMgaXNOZXdHcm91cFRvcGljTmFtZShuYW1lKSB7XG4gICAgcmV0dXJuICh0eXBlb2YgbmFtZSA9PSAnc3RyaW5nJykgJiZcbiAgICAgIChuYW1lLnN1YnN0cmluZygwLCAzKSA9PSBDb25zdC5UT1BJQ19ORVcgfHwgbmFtZS5zdWJzdHJpbmcoMCwgMykgPT0gQ29uc3QuVE9QSUNfTkVXX0NIQU4pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSB0b3BpYyBuYW1lIGlzIGEgbmFtZSBvZiBhIGNoYW5uZWwuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSB0b3BpYyBuYW1lIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlIG5hbWUgaXMgYSBuYW1lIG9mIGEgY2hhbm5lbCwgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIHN0YXRpYyBpc0NoYW5uZWxUb3BpY05hbWUobmFtZSkge1xuICAgIHJldHVybiAodHlwZW9mIG5hbWUgPT0gJ3N0cmluZycpICYmXG4gICAgICAobmFtZS5zdWJzdHJpbmcoMCwgMykgPT0gQ29uc3QuVE9QSUNfQ0hBTiB8fCBuYW1lLnN1YnN0cmluZygwLCAzKSA9PSBDb25zdC5UT1BJQ19ORVdfQ0hBTik7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIHRvcGljIGlzIHN1YnNjcmliZWQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlzIHRvcGljIGlzIGF0dGFjaGVkL3N1YnNjcmliZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIGlzU3Vic2NyaWJlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXR0YWNoZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCB0b3BpYyB0byBzdWJzY3JpYmUuIFdyYXBwZXIgZm9yIHtAbGluayBUaW5vZGUjc3Vic2NyaWJlfS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtUaW5vZGUuR2V0UXVlcnk9fSBnZXRQYXJhbXMgLSBnZXQgcXVlcnkgcGFyYW1ldGVycy5cbiAgICogQHBhcmFtIHtUaW5vZGUuU2V0UGFyYW1zPX0gc2V0UGFyYW1zIC0gc2V0IHBhcmFtZXRlcnMuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRvIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIHNlcnZlciByZXNwb25kcyB0byB0aGUgcmVxdWVzdC5cbiAgICovXG4gIHN1YnNjcmliZShnZXRQYXJhbXMsIHNldFBhcmFtcykge1xuICAgIC8vIElmIHRoZSB0b3BpYyBpcyBhbHJlYWR5IHN1YnNjcmliZWQsIHJldHVybiByZXNvbHZlZCBwcm9taXNlXG4gICAgaWYgKHRoaXMuX2F0dGFjaGVkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSB0b3BpYyBpcyBkZWxldGVkLCByZWplY3Qgc3Vic2NyaXB0aW9uIHJlcXVlc3RzLlxuICAgIGlmICh0aGlzLl9kZWxldGVkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwiQ29udmVyc2F0aW9uIGRlbGV0ZWRcIikpO1xuICAgIH1cblxuICAgIC8vIFNlbmQgc3Vic2NyaWJlIG1lc3NhZ2UsIGhhbmRsZSBhc3luYyByZXNwb25zZS5cbiAgICAvLyBJZiB0b3BpYyBuYW1lIGlzIGV4cGxpY2l0bHkgcHJvdmlkZWQsIHVzZSBpdC4gSWYgbm8gbmFtZSwgdGhlbiBpdCdzIGEgbmV3IGdyb3VwIHRvcGljLFxuICAgIC8vIHVzZSBcIm5ld1wiLlxuICAgIHJldHVybiB0aGlzLl90aW5vZGUuc3Vic2NyaWJlKHRoaXMubmFtZSB8fCBDb25zdC5UT1BJQ19ORVcsIGdldFBhcmFtcywgc2V0UGFyYW1zKS50aGVuKChjdHJsKSA9PiB7XG4gICAgICBpZiAoY3RybC5jb2RlID49IDMwMCkge1xuICAgICAgICAvLyBEbyBub3RoaW5nIGlmIHN1YnNjcmlwdGlvbiBzdGF0dXMgaGFzIG5vdCBjaGFuZ2VkLlxuICAgICAgICByZXR1cm4gY3RybDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fYXR0YWNoZWQgPSB0cnVlO1xuICAgICAgdGhpcy5fZGVsZXRlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5hY3MgPSAoY3RybC5wYXJhbXMgJiYgY3RybC5wYXJhbXMuYWNzKSA/IGN0cmwucGFyYW1zLmFjcyA6IHRoaXMuYWNzO1xuXG4gICAgICAvLyBTZXQgdG9waWMgbmFtZSBmb3IgbmV3IHRvcGljcyBhbmQgYWRkIGl0IHRvIGNhY2hlLlxuICAgICAgaWYgKHRoaXMuX25ldykge1xuICAgICAgICBkZWxldGUgdGhpcy5fbmV3O1xuXG4gICAgICAgIGlmICh0aGlzLm5hbWUgIT0gY3RybC50b3BpYykge1xuICAgICAgICAgIC8vIE5hbWUgbWF5IGNoYW5nZSBuZXcxMjM0NTYgLT4gZ3JwQWJDZEVmLiBSZW1vdmUgZnJvbSBjYWNoZSB1bmRlciB0aGUgb2xkIG5hbWUuXG4gICAgICAgICAgdGhpcy5fY2FjaGVEZWxTZWxmKCk7XG4gICAgICAgICAgdGhpcy5uYW1lID0gY3RybC50b3BpYztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jYWNoZVB1dFNlbGYoKTtcblxuICAgICAgICB0aGlzLmNyZWF0ZWQgPSBjdHJsLnRzO1xuICAgICAgICB0aGlzLnVwZGF0ZWQgPSBjdHJsLnRzO1xuXG4gICAgICAgIGlmICh0aGlzLm5hbWUgIT0gQ29uc3QuVE9QSUNfTUUgJiYgdGhpcy5uYW1lICE9IENvbnN0LlRPUElDX0ZORCkge1xuICAgICAgICAgIC8vIEFkZCB0aGUgbmV3IHRvcGljIHRvIHRoZSBsaXN0IG9mIGNvbnRhY3RzIG1haW50YWluZWQgYnkgdGhlICdtZScgdG9waWMuXG4gICAgICAgICAgY29uc3QgbWUgPSB0aGlzLl90aW5vZGUuZ2V0TWVUb3BpYygpO1xuICAgICAgICAgIGlmIChtZS5vbk1ldGFTdWIpIHtcbiAgICAgICAgICAgIG1lLm9uTWV0YVN1Yih0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG1lLm9uU3Vic1VwZGF0ZWQpIHtcbiAgICAgICAgICAgIG1lLm9uU3Vic1VwZGF0ZWQoW3RoaXMubmFtZV0sIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXRQYXJhbXMgJiYgc2V0UGFyYW1zLmRlc2MpIHtcbiAgICAgICAgICBzZXRQYXJhbXMuZGVzYy5fbm9Gb3J3YXJkaW5nID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLl9wcm9jZXNzTWV0YURlc2Moc2V0UGFyYW1zLmRlc2MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY3RybDtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBkcmFmdCBvZiBhIG1lc3NhZ2Ugd2l0aG91dCBzZW5kaW5nIGl0IHRvIHRoZSBzZXJ2ZXIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgT2JqZWN0fSBkYXRhIC0gQ29udGVudCB0byB3cmFwIGluIGEgZHJhZnQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG5vRWNobyAtIElmIDxjb2RlPnRydWU8L2NvZGU+IHNlcnZlciB3aWxsIG5vdCBlY2hvIG1lc3NhZ2UgYmFjayB0byBvcmlnaW5hdGluZ1xuICAgKiBzZXNzaW9uLiBPdGhlcndpc2UgdGhlIHNlcnZlciB3aWxsIHNlbmQgYSBjb3B5IG9mIHRoZSBtZXNzYWdlIHRvIHNlbmRlci5cbiAgICpcbiAgICogQHJldHVybnMge09iamVjdH0gbWVzc2FnZSBkcmFmdC5cbiAgICovXG4gIGNyZWF0ZU1lc3NhZ2UoZGF0YSwgbm9FY2hvKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Rpbm9kZS5jcmVhdGVNZXNzYWdlKHRoaXMubmFtZSwgZGF0YSwgbm9FY2hvKTtcbiAgfVxuICAvKipcbiAgICogSW1tZWRpYXRlbHkgcHVibGlzaCBkYXRhIHRvIHRvcGljLiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI3B1Ymxpc2h9LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IE9iamVjdH0gZGF0YSAtIERhdGEgdG8gcHVibGlzaCwgZWl0aGVyIHBsYWluIHN0cmluZyBvciBhIERyYWZ0eSBvYmplY3QuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG5vRWNobyAtIElmIDxjb2RlPnRydWU8L2NvZGU+IHNlcnZlciB3aWxsIG5vdCBlY2hvIG1lc3NhZ2UgYmFjayB0byBvcmlnaW5hdGluZ1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB0byBiZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHRoZSBzZXJ2ZXIgcmVzcG9uZHMgdG8gdGhlIHJlcXVlc3QuXG4gICAqL1xuICBwdWJsaXNoKGRhdGEsIG5vRWNobykge1xuICAgIHJldHVybiB0aGlzLnB1Ymxpc2hNZXNzYWdlKHRoaXMuY3JlYXRlTWVzc2FnZShkYXRhLCBub0VjaG8pKTtcbiAgfVxuICAvKipcbiAgICogUHVibGlzaCBtZXNzYWdlIGNyZWF0ZWQgYnkge0BsaW5rIFRpbm9kZS5Ub3BpYyNjcmVhdGVNZXNzYWdlfS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHB1YiAtIHtkYXRhfSBvYmplY3QgdG8gcHVibGlzaC4gTXVzdCBiZSBjcmVhdGVkIGJ5IHtAbGluayBUaW5vZGUuVG9waWMjY3JlYXRlTWVzc2FnZX1cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgdG8gYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgc2VydmVyIHJlc3BvbmRzIHRvIHRoZSByZXF1ZXN0LlxuICAgKi9cbiAgcHVibGlzaE1lc3NhZ2UocHViKSB7XG4gICAgaWYgKCF0aGlzLl9hdHRhY2hlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIkNhbm5vdCBwdWJsaXNoIG9uIGluYWN0aXZlIHRvcGljXCIpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3NlbmRpbmcpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJUaGUgbWVzc2FnZSBpcyBhbHJlYWR5IGJlaW5nIHNlbnRcIikpO1xuICAgIH1cblxuICAgIC8vIFNlbmQgZGF0YS5cbiAgICBwdWIuX3NlbmRpbmcgPSB0cnVlO1xuICAgIHB1Yi5fZmFpbGVkID0gZmFsc2U7XG5cbiAgICAvLyBFeHRyYWN0IHJlZmVyZWNlcyB0byBhdHRhY2htZW50cyBhbmQgb3V0IG9mIGJhbmQgaW1hZ2UgcmVjb3Jkcy5cbiAgICBsZXQgYXR0YWNobWVudHMgPSBudWxsO1xuICAgIGlmIChEcmFmdHkuaGFzRW50aXRpZXMocHViLmNvbnRlbnQpKSB7XG4gICAgICBhdHRhY2htZW50cyA9IFtdO1xuICAgICAgRHJhZnR5LmVudGl0aWVzKHB1Yi5jb250ZW50LCAoZGF0YSkgPT4ge1xuICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLnJlZikge1xuICAgICAgICAgIGF0dGFjaG1lbnRzLnB1c2goZGF0YS5yZWYpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChhdHRhY2htZW50cy5sZW5ndGggPT0gMCkge1xuICAgICAgICBhdHRhY2htZW50cyA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3Rpbm9kZS5wdWJsaXNoTWVzc2FnZShwdWIsIGF0dGFjaG1lbnRzKS50aGVuKChjdHJsKSA9PiB7XG4gICAgICBwdWIuX3NlbmRpbmcgPSBmYWxzZTtcbiAgICAgIHB1Yi50cyA9IGN0cmwudHM7XG4gICAgICB0aGlzLnN3YXBNZXNzYWdlSWQocHViLCBjdHJsLnBhcmFtcy5zZXEpO1xuICAgICAgdGhpcy5fcm91dGVEYXRhKHB1Yik7XG4gICAgICByZXR1cm4gY3RybDtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICB0aGlzLl90aW5vZGUubG9nZ2VyKFwiV0FSTklORzogTWVzc2FnZSByZWplY3RlZCBieSB0aGUgc2VydmVyXCIsIGVycik7XG4gICAgICBwdWIuX3NlbmRpbmcgPSBmYWxzZTtcbiAgICAgIHB1Yi5fZmFpbGVkID0gdHJ1ZTtcbiAgICAgIGlmICh0aGlzLm9uRGF0YSkge1xuICAgICAgICB0aGlzLm9uRGF0YSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgbWVzc2FnZSB0byBsb2NhbCBtZXNzYWdlIGNhY2hlLCBzZW5kIHRvIHRoZSBzZXJ2ZXIgd2hlbiB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZC5cbiAgICogSWYgcHJvbWlzZSBpcyBudWxsIG9yIHVuZGVmaW5lZCwgdGhlIG1lc3NhZ2Ugd2lsbCBiZSBzZW50IGltbWVkaWF0ZWx5LlxuICAgKiBUaGUgbWVzc2FnZSBpcyBzZW50IHdoZW4gdGhlXG4gICAqIFRoZSBtZXNzYWdlIHNob3VsZCBiZSBjcmVhdGVkIGJ5IHtAbGluayBUaW5vZGUuVG9waWMjY3JlYXRlTWVzc2FnZX0uXG4gICAqIFRoaXMgaXMgcHJvYmFibHkgbm90IHRoZSBmaW5hbCBBUEkuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwdWIgLSBNZXNzYWdlIHRvIHVzZSBhcyBhIGRyYWZ0LlxuICAgKiBAcGFyYW0ge1Byb21pc2V9IHByb20gLSBNZXNzYWdlIHdpbGwgYmUgc2VudCB3aGVuIHRoaXMgcHJvbWlzZSBpcyByZXNvbHZlZCwgZGlzY2FyZGVkIGlmIHJlamVjdGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gZGVyaXZlZCBwcm9taXNlLlxuICAgKi9cbiAgcHVibGlzaERyYWZ0KHB1YiwgcHJvbSkge1xuICAgIGNvbnN0IHNlcSA9IHB1Yi5zZXEgfHwgdGhpcy5fZ2V0UXVldWVkU2VxSWQoKTtcbiAgICBpZiAoIXB1Yi5fbm9Gb3J3YXJkaW5nKSB7XG4gICAgICAvLyBUaGUgJ3NlcScsICd0cycsIGFuZCAnZnJvbScgYXJlIGFkZGVkIHRvIG1pbWljIHtkYXRhfS4gVGhleSBhcmUgcmVtb3ZlZCBsYXRlclxuICAgICAgLy8gYmVmb3JlIHRoZSBtZXNzYWdlIGlzIHNlbnQuXG4gICAgICBwdWIuX25vRm9yd2FyZGluZyA9IHRydWU7XG4gICAgICBwdWIuc2VxID0gc2VxO1xuICAgICAgcHViLnRzID0gbmV3IERhdGUoKTtcbiAgICAgIHB1Yi5mcm9tID0gdGhpcy5fdGlub2RlLmdldEN1cnJlbnRVc2VySUQoKTtcblxuICAgICAgLy8gRG9uJ3QgbmVlZCBhbiBlY2hvIG1lc3NhZ2UgYmVjYXVzZSB0aGUgbWVzc2FnZSBpcyBhZGRlZCB0byBsb2NhbCBjYWNoZSByaWdodCBhd2F5LlxuICAgICAgcHViLm5vZWNobyA9IHRydWU7XG4gICAgICAvLyBBZGQgdG8gY2FjaGUuXG4gICAgICB0aGlzLl9tZXNzYWdlcy5wdXQocHViKTtcbiAgICAgIHRoaXMuX3Rpbm9kZS5fZGIuYWRkTWVzc2FnZShwdWIpO1xuXG4gICAgICBpZiAodGhpcy5vbkRhdGEpIHtcbiAgICAgICAgdGhpcy5vbkRhdGEocHViKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gSWYgcHJvbWlzZSBpcyBwcm92aWRlZCwgc2VuZCB0aGUgcXVldWVkIG1lc3NhZ2Ugd2hlbiBpdCdzIHJlc29sdmVkLlxuICAgIC8vIElmIG5vIHByb21pc2UgaXMgcHJvdmlkZWQsIGNyZWF0ZSBhIHJlc29sdmVkIG9uZSBhbmQgc2VuZCBpbW1lZGlhdGVseS5cbiAgICByZXR1cm4gKHByb20gfHwgUHJvbWlzZS5yZXNvbHZlKCkpXG4gICAgICAudGhlbihfID0+IHtcbiAgICAgICAgaWYgKHB1Yi5fY2FuY2VsbGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvZGU6IDMwMCxcbiAgICAgICAgICAgIHRleHQ6IFwiY2FuY2VsbGVkXCJcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hNZXNzYWdlKHB1Yik7XG4gICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICB0aGlzLl90aW5vZGUubG9nZ2VyKFwiV0FSTklORzogTWVzc2FnZSBkcmFmdCByZWplY3RlZFwiLCBlcnIpO1xuICAgICAgICBwdWIuX3NlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgcHViLl9mYWlsZWQgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5vbkRhdGEpIHtcbiAgICAgICAgICB0aGlzLm9uRGF0YSgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJldGhyb3cgdG8gbGV0IGNhbGxlciBrbm93IHRoYXQgdGhlIG9wZXJhdGlvbiBmYWlsZWQuXG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIExlYXZlIHRoZSB0b3BpYywgb3B0aW9uYWxseSB1bnNpYnNjcmliZS4gTGVhdmluZyB0aGUgdG9waWMgbWVhbnMgdGhlIHRvcGljIHdpbGwgc3RvcFxuICAgKiByZWNlaXZpbmcgdXBkYXRlcyBmcm9tIHRoZSBzZXJ2ZXIuIFVuc3Vic2NyaWJpbmcgd2lsbCB0ZXJtaW5hdGUgdXNlcidzIHJlbGF0aW9uc2hpcCB3aXRoIHRoZSB0b3BpYy5cbiAgICogV3JhcHBlciBmb3Ige0BsaW5rIFRpbm9kZSNsZWF2ZX0uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc3ViIC0gSWYgdHJ1ZSwgdW5zdWJzY3JpYmUsIG90aGVyd2lzZSBqdXN0IGxlYXZlLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB0byBiZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHRoZSBzZXJ2ZXIgcmVzcG9uZHMgdG8gdGhlIHJlcXVlc3QuXG4gICAqL1xuICBsZWF2ZSh1bnN1Yikge1xuICAgIC8vIEl0J3MgcG9zc2libGUgdG8gdW5zdWJzY3JpYmUgKHVuc3ViPT10cnVlKSBmcm9tIGluYWN0aXZlIHRvcGljLlxuICAgIGlmICghdGhpcy5fYXR0YWNoZWQgJiYgIXVuc3ViKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwiQ2Fubm90IGxlYXZlIGluYWN0aXZlIHRvcGljXCIpKTtcbiAgICB9XG5cbiAgICAvLyBTZW5kIGEgJ2xlYXZlJyBtZXNzYWdlLCBoYW5kbGUgYXN5bmMgcmVzcG9uc2VcbiAgICByZXR1cm4gdGhpcy5fdGlub2RlLmxlYXZlKHRoaXMubmFtZSwgdW5zdWIpLnRoZW4oKGN0cmwpID0+IHtcbiAgICAgIHRoaXMuX3Jlc2V0U3ViKCk7XG4gICAgICBpZiAodW5zdWIpIHtcbiAgICAgICAgdGhpcy5fZ29uZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN0cmw7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCB0b3BpYyBtZXRhZGF0YSBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7VGlub2RlLkdldFF1ZXJ5fSByZXF1ZXN0IHBhcmFtZXRlcnNcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgdG8gYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgc2VydmVyIHJlc3BvbmRzIHRvIHJlcXVlc3QuXG4gICAqL1xuICBnZXRNZXRhKHBhcmFtcykge1xuICAgIC8vIFNlbmQge2dldH0gbWVzc2FnZSwgcmV0dXJuIHByb21pc2UuXG4gICAgcmV0dXJuIHRoaXMuX3Rpbm9kZS5nZXRNZXRhKHRoaXMubmFtZSwgcGFyYW1zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0IG1vcmUgbWVzc2FnZXMgZnJvbSB0aGUgc2VydmVyXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdCBudW1iZXIgb2YgbWVzc2FnZXMgdG8gZ2V0LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZvcndhcmQgaWYgdHJ1ZSwgcmVxdWVzdCBuZXdlciBtZXNzYWdlcy5cbiAgICovXG4gIGdldE1lc3NhZ2VzUGFnZShsaW1pdCwgZm9yd2FyZCkge1xuICAgIGxldCBxdWVyeSA9IGZvcndhcmQgP1xuICAgICAgdGhpcy5zdGFydE1ldGFRdWVyeSgpLndpdGhMYXRlckRhdGEobGltaXQpIDpcbiAgICAgIHRoaXMuc3RhcnRNZXRhUXVlcnkoKS53aXRoRWFybGllckRhdGEobGltaXQpO1xuXG4gICAgLy8gRmlyc3QgdHJ5IGZldGNoaW5nIGZyb20gREIsIHRoZW4gZnJvbSB0aGUgc2VydmVyLlxuICAgIHJldHVybiB0aGlzLl9sb2FkTWVzc2FnZXModGhpcy5fdGlub2RlLl9kYiwgcXVlcnkuZXh0cmFjdCgnZGF0YScpKVxuICAgICAgLnRoZW4oKGNvdW50KSA9PiB7XG4gICAgICAgIGlmIChjb3VudCA9PSBsaW1pdCkge1xuICAgICAgICAgIC8vIEdvdCBlbm91Z2ggbWVzc2FnZXMgZnJvbSBsb2NhbCBjYWNoZS5cbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgICAgIHRvcGljOiB0aGlzLm5hbWUsXG4gICAgICAgICAgICBjb2RlOiAyMDAsXG4gICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgY291bnQ6IGNvdW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWR1Y2UgdGhlIGNvdW50IG9mIHJlcXVlc3RlZCBtZXNzYWdlcy5cbiAgICAgICAgbGltaXQgLT0gY291bnQ7XG4gICAgICAgIC8vIFVwZGF0ZSBxdWVyeSB3aXRoIG5ldyB2YWx1ZXMgbG9hZGVkIGZyb20gREIuXG4gICAgICAgIHF1ZXJ5ID0gZm9yd2FyZCA/IHRoaXMuc3RhcnRNZXRhUXVlcnkoKS53aXRoTGF0ZXJEYXRhKGxpbWl0KSA6XG4gICAgICAgICAgdGhpcy5zdGFydE1ldGFRdWVyeSgpLndpdGhFYXJsaWVyRGF0YShsaW1pdCk7XG4gICAgICAgIGxldCBwcm9taXNlID0gdGhpcy5nZXRNZXRhKHF1ZXJ5LmJ1aWxkKCkpO1xuICAgICAgICBpZiAoIWZvcndhcmQpIHtcbiAgICAgICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKChjdHJsKSA9PiB7XG4gICAgICAgICAgICBpZiAoY3RybCAmJiBjdHJsLnBhcmFtcyAmJiAhY3RybC5wYXJhbXMuY291bnQpIHtcbiAgICAgICAgICAgICAgdGhpcy5fbm9FYXJsaWVyTXNncyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICB9KTtcbiAgfVxuICAvKipcbiAgICogVXBkYXRlIHRvcGljIG1ldGFkYXRhLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge1Rpbm9kZS5TZXRQYXJhbXN9IHBhcmFtcyBwYXJhbWV0ZXJzIHRvIHVwZGF0ZS5cbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgdG8gYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgc2VydmVyIHJlc3BvbmRzIHRvIHJlcXVlc3QuXG4gICAqL1xuICBzZXRNZXRhKHBhcmFtcykge1xuICAgIGlmIChwYXJhbXMudGFncykge1xuICAgICAgcGFyYW1zLnRhZ3MgPSBub3JtYWxpemVBcnJheShwYXJhbXMudGFncyk7XG4gICAgfVxuICAgIC8vIFNlbmQgU2V0IG1lc3NhZ2UsIGhhbmRsZSBhc3luYyByZXNwb25zZS5cbiAgICByZXR1cm4gdGhpcy5fdGlub2RlLnNldE1ldGEodGhpcy5uYW1lLCBwYXJhbXMpXG4gICAgICAudGhlbigoY3RybCkgPT4ge1xuICAgICAgICBpZiAoY3RybCAmJiBjdHJsLmNvZGUgPj0gMzAwKSB7XG4gICAgICAgICAgLy8gTm90IG1vZGlmaWVkXG4gICAgICAgICAgcmV0dXJuIGN0cmw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLnN1Yikge1xuICAgICAgICAgIHBhcmFtcy5zdWIudG9waWMgPSB0aGlzLm5hbWU7XG4gICAgICAgICAgaWYgKGN0cmwucGFyYW1zICYmIGN0cmwucGFyYW1zLmFjcykge1xuICAgICAgICAgICAgcGFyYW1zLnN1Yi5hY3MgPSBjdHJsLnBhcmFtcy5hY3M7XG4gICAgICAgICAgICBwYXJhbXMuc3ViLnVwZGF0ZWQgPSBjdHJsLnRzO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXBhcmFtcy5zdWIudXNlcikge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBhIHN1YnNjcmlwdGlvbiB1cGRhdGUgb2YgdGhlIGN1cnJlbnQgdXNlci5cbiAgICAgICAgICAgIC8vIEFzc2lnbiB1c2VyIElEIG90aGVyd2lzZSB0aGUgdXBkYXRlIHdpbGwgYmUgaWdub3JlZCBieSBfcHJvY2Vzc01ldGFTdWIuXG4gICAgICAgICAgICBwYXJhbXMuc3ViLnVzZXIgPSB0aGlzLl90aW5vZGUuZ2V0Q3VycmVudFVzZXJJRCgpO1xuICAgICAgICAgICAgaWYgKCFwYXJhbXMuZGVzYykge1xuICAgICAgICAgICAgICAvLyBGb3JjZSB1cGRhdGUgdG8gdG9waWMncyBhc2MuXG4gICAgICAgICAgICAgIHBhcmFtcy5kZXNjID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhcmFtcy5zdWIuX25vRm9yd2FyZGluZyA9IHRydWU7XG4gICAgICAgICAgdGhpcy5fcHJvY2Vzc01ldGFTdWIoW3BhcmFtcy5zdWJdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMuZGVzYykge1xuICAgICAgICAgIGlmIChjdHJsLnBhcmFtcyAmJiBjdHJsLnBhcmFtcy5hY3MpIHtcbiAgICAgICAgICAgIHBhcmFtcy5kZXNjLmFjcyA9IGN0cmwucGFyYW1zLmFjcztcbiAgICAgICAgICAgIHBhcmFtcy5kZXNjLnVwZGF0ZWQgPSBjdHJsLnRzO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9wcm9jZXNzTWV0YURlc2MocGFyYW1zLmRlc2MpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy50YWdzKSB7XG4gICAgICAgICAgdGhpcy5fcHJvY2Vzc01ldGFUYWdzKHBhcmFtcy50YWdzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyYW1zLmNyZWQpIHtcbiAgICAgICAgICB0aGlzLl9wcm9jZXNzTWV0YUNyZWRzKFtwYXJhbXMuY3JlZF0sIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGN0cmw7XG4gICAgICB9KTtcbiAgfVxuICAvKipcbiAgICogVXBkYXRlIGFjY2VzcyBtb2RlIG9mIHRoZSBjdXJyZW50IHVzZXIgb3Igb2YgYW5vdGhlciB0b3BpYyBzdWJzcmliZXIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1aWQgLSBVSUQgb2YgdGhlIHVzZXIgdG8gdXBkYXRlIG9yIG51bGwgdG8gdXBkYXRlIGN1cnJlbnQgdXNlci5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVwZGF0ZSAtIHRoZSB1cGRhdGUgdmFsdWUsIGZ1bGwgb3IgZGVsdGEuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRvIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIHNlcnZlciByZXNwb25kcyB0byByZXF1ZXN0LlxuICAgKi9cbiAgdXBkYXRlTW9kZSh1aWQsIHVwZGF0ZSkge1xuICAgIGNvbnN0IHVzZXIgPSB1aWQgPyB0aGlzLnN1YnNjcmliZXIodWlkKSA6IG51bGw7XG4gICAgY29uc3QgYW0gPSB1c2VyID9cbiAgICAgIHVzZXIuYWNzLnVwZGF0ZUdpdmVuKHVwZGF0ZSkuZ2V0R2l2ZW4oKSA6XG4gICAgICB0aGlzLmdldEFjY2Vzc01vZGUoKS51cGRhdGVXYW50KHVwZGF0ZSkuZ2V0V2FudCgpO1xuXG4gICAgcmV0dXJuIHRoaXMuc2V0TWV0YSh7XG4gICAgICBzdWI6IHtcbiAgICAgICAgdXNlcjogdWlkLFxuICAgICAgICBtb2RlOiBhbVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBDcmVhdGUgbmV3IHRvcGljIHN1YnNjcmlwdGlvbi4gV3JhcHBlciBmb3Ige0BsaW5rIFRpbm9kZSNzZXRNZXRhfS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVpZCAtIElEIG9mIHRoZSB1c2VyIHRvIGludml0ZVxuICAgKiBAcGFyYW0ge3N0cmluZz19IG1vZGUgLSBBY2Nlc3MgbW9kZS4gPGNvZGU+bnVsbDwvY29kZT4gbWVhbnMgdG8gdXNlIGRlZmF1bHQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRvIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIHNlcnZlciByZXNwb25kcyB0byByZXF1ZXN0LlxuICAgKi9cbiAgaW52aXRlKHVpZCwgbW9kZSkge1xuICAgIHJldHVybiB0aGlzLnNldE1ldGEoe1xuICAgICAgc3ViOiB7XG4gICAgICAgIHVzZXI6IHVpZCxcbiAgICAgICAgbW9kZTogbW9kZVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBBcmNoaXZlIG9yIHVuLWFyY2hpdmUgdGhlIHRvcGljLiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI3NldE1ldGF9LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFyY2ggLSB0cnVlIHRvIGFyY2hpdmUgdGhlIHRvcGljLCBmYWxzZSBvdGhlcndpc2UuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRvIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIHNlcnZlciByZXNwb25kcyB0byByZXF1ZXN0LlxuICAgKi9cbiAgYXJjaGl2ZShhcmNoKSB7XG4gICAgaWYgKHRoaXMucHJpdmF0ZSAmJiAoIXRoaXMucHJpdmF0ZS5hcmNoID09ICFhcmNoKSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhcmNoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2V0TWV0YSh7XG4gICAgICBkZXNjOiB7XG4gICAgICAgIHByaXZhdGU6IHtcbiAgICAgICAgICBhcmNoOiBhcmNoID8gdHJ1ZSA6IENvbnN0LkRFTF9DSEFSXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICogRGVsZXRlIG1lc3NhZ2VzLiBIYXJkLWRlbGV0aW5nIG1lc3NhZ2VzIHJlcXVpcmVzIE93bmVyIHBlcm1pc3Npb24uXG4gICAqIFdyYXBwZXIgZm9yIHtAbGluayBUaW5vZGUjZGVsTWVzc2FnZXN9LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge1Rpbm9kZS5EZWxSYW5nZVtdfSByYW5nZXMgLSBSYW5nZXMgb2YgbWVzc2FnZSBJRHMgdG8gZGVsZXRlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBoYXJkIC0gSGFyZCBvciBzb2Z0IGRlbGV0ZVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB0byBiZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHRoZSBzZXJ2ZXIgcmVzcG9uZHMgdG8gcmVxdWVzdC5cbiAgICovXG4gIGRlbE1lc3NhZ2VzKHJhbmdlcywgaGFyZCkge1xuICAgIGlmICghdGhpcy5fYXR0YWNoZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJDYW5ub3QgZGVsZXRlIG1lc3NhZ2VzIGluIGluYWN0aXZlIHRvcGljXCIpKTtcbiAgICB9XG5cbiAgICAvLyBTb3J0IHJhbmdlcyBpbiBhY2NlbmRpbmcgb3JkZXIgYnkgbG93LCB0aGUgZGVzY2VuZGluZyBieSBoaS5cbiAgICByYW5nZXMuc29ydCgocjEsIHIyKSA9PiB7XG4gICAgICBpZiAocjEubG93IDwgcjIubG93KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHIxLmxvdyA9PSByMi5sb3cpIHtcbiAgICAgICAgcmV0dXJuICFyMi5oaSB8fCAocjEuaGkgPj0gcjIuaGkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgLy8gUmVtb3ZlIHBlbmRpbmcgbWVzc2FnZXMgZnJvbSByYW5nZXMgcG9zc2libHkgY2xpcHBpbmcgc29tZSByYW5nZXMuXG4gICAgbGV0IHRvc2VuZCA9IHJhbmdlcy5yZWR1Y2UoKG91dCwgcikgPT4ge1xuICAgICAgaWYgKHIubG93IDwgQ29uc3QuTE9DQUxfU0VRSUQpIHtcbiAgICAgICAgaWYgKCFyLmhpIHx8IHIuaGkgPCBDb25zdC5MT0NBTF9TRVFJRCkge1xuICAgICAgICAgIG91dC5wdXNoKHIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENsaXAgaGkgdG8gbWF4IGFsbG93ZWQgdmFsdWUuXG4gICAgICAgICAgb3V0LnB1c2goe1xuICAgICAgICAgICAgbG93OiByLmxvdyxcbiAgICAgICAgICAgIGhpOiB0aGlzLl9tYXhTZXEgKyAxXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfSwgW10pO1xuXG4gICAgLy8gU2VuZCB7ZGVsfSBtZXNzYWdlLCByZXR1cm4gcHJvbWlzZVxuICAgIGxldCByZXN1bHQ7XG4gICAgaWYgKHRvc2VuZC5sZW5ndGggPiAwKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl90aW5vZGUuZGVsTWVzc2FnZXModGhpcy5uYW1lLCB0b3NlbmQsIGhhcmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSBQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBkZWw6IDBcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFVwZGF0ZSBsb2NhbCBjYWNoZS5cbiAgICByZXR1cm4gcmVzdWx0LnRoZW4oKGN0cmwpID0+IHtcbiAgICAgIGlmIChjdHJsLnBhcmFtcy5kZWwgPiB0aGlzLl9tYXhEZWwpIHtcbiAgICAgICAgdGhpcy5fbWF4RGVsID0gY3RybC5wYXJhbXMuZGVsO1xuICAgICAgfVxuXG4gICAgICByYW5nZXMuZm9yRWFjaCgocikgPT4ge1xuICAgICAgICBpZiAoci5oaSkge1xuICAgICAgICAgIHRoaXMuZmx1c2hNZXNzYWdlUmFuZ2Uoci5sb3csIHIuaGkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZmx1c2hNZXNzYWdlKHIubG93KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX3VwZGF0ZURlbGV0ZWRSYW5nZXMoKTtcblxuICAgICAgaWYgKHRoaXMub25EYXRhKSB7XG4gICAgICAgIC8vIENhbGxpbmcgd2l0aCBubyBwYXJhbWV0ZXJzIHRvIGluZGljYXRlIHRoZSBtZXNzYWdlcyB3ZXJlIGRlbGV0ZWQuXG4gICAgICAgIHRoaXMub25EYXRhKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY3RybDtcbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICogRGVsZXRlIGFsbCBtZXNzYWdlcy4gSGFyZC1kZWxldGluZyBtZXNzYWdlcyByZXF1aXJlcyBPd25lciBwZXJtaXNzaW9uLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGhhcmREZWwgLSB0cnVlIGlmIG1lc3NhZ2VzIHNob3VsZCBiZSBoYXJkLWRlbGV0ZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRvIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIHNlcnZlciByZXNwb25kcyB0byByZXF1ZXN0LlxuICAgKi9cbiAgZGVsTWVzc2FnZXNBbGwoaGFyZERlbCkge1xuICAgIGlmICghdGhpcy5fbWF4U2VxIHx8IHRoaXMuX21heFNlcSA8PSAwKSB7XG4gICAgICAvLyBUaGVyZSBhcmUgbm8gbWVzc2FnZXMgdG8gZGVsZXRlLlxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5kZWxNZXNzYWdlcyhbe1xuICAgICAgbG93OiAxLFxuICAgICAgaGk6IHRoaXMuX21heFNlcSArIDEsXG4gICAgICBfYWxsOiB0cnVlXG4gICAgfV0sIGhhcmREZWwpO1xuICB9XG4gIC8qKlxuICAgKiBEZWxldGUgbXVsdGlwbGUgbWVzc2FnZXMgZGVmaW5lZCBieSB0aGVpciBJRHMuIEhhcmQtZGVsZXRpbmcgbWVzc2FnZXMgcmVxdWlyZXMgT3duZXIgcGVybWlzc2lvbi5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtUaW5vZGUuRGVsUmFuZ2VbXX0gbGlzdCAtIGxpc3Qgb2Ygc2VxIElEcyB0byBkZWxldGVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gaGFyZERlbCAtIHRydWUgaWYgbWVzc2FnZXMgc2hvdWxkIGJlIGhhcmQtZGVsZXRlZC5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgdG8gYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgc2VydmVyIHJlc3BvbmRzIHRvIHJlcXVlc3QuXG4gICAqL1xuICBkZWxNZXNzYWdlc0xpc3QobGlzdCwgaGFyZERlbCkge1xuICAgIC8vIFNvcnQgdGhlIGxpc3QgaW4gYXNjZW5kaW5nIG9yZGVyXG4gICAgbGlzdC5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgLy8gQ29udmVydCB0aGUgYXJyYXkgb2YgSURzIHRvIHJhbmdlcy5cbiAgICBsZXQgcmFuZ2VzID0gbGlzdC5yZWR1Y2UoKG91dCwgaWQpID0+IHtcbiAgICAgIGlmIChvdXQubGVuZ3RoID09IDApIHtcbiAgICAgICAgLy8gRmlyc3QgZWxlbWVudC5cbiAgICAgICAgb3V0LnB1c2goe1xuICAgICAgICAgIGxvdzogaWRcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgcHJldiA9IG91dFtvdXQubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICgoIXByZXYuaGkgJiYgKGlkICE9IHByZXYubG93ICsgMSkpIHx8IChpZCA+IHByZXYuaGkpKSB7XG4gICAgICAgICAgLy8gTmV3IHJhbmdlLlxuICAgICAgICAgIG91dC5wdXNoKHtcbiAgICAgICAgICAgIGxvdzogaWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBFeHBhbmQgZXhpc3RpbmcgcmFuZ2UuXG4gICAgICAgICAgcHJldi5oaSA9IHByZXYuaGkgPyBNYXRoLm1heChwcmV2LmhpLCBpZCArIDEpIDogaWQgKyAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH0sIFtdKTtcbiAgICAvLyBTZW5kIHtkZWx9IG1lc3NhZ2UsIHJldHVybiBwcm9taXNlXG4gICAgcmV0dXJuIHRoaXMuZGVsTWVzc2FnZXMocmFuZ2VzLCBoYXJkRGVsKTtcbiAgfVxuICAvKipcbiAgICogRGVsZXRlIHRvcGljLiBSZXF1aXJlcyBPd25lciBwZXJtaXNzaW9uLiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI2RlbFRvcGljfS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBoYXJkIC0gaGFkLWRlbGV0ZSB0b3BpYy5cbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgdG8gYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgc2VydmVyIHJlc3BvbmRzIHRvIHRoZSByZXF1ZXN0LlxuICAgKi9cbiAgZGVsVG9waWMoaGFyZCkge1xuICAgIGlmICh0aGlzLl9kZWxldGVkKSB7XG4gICAgICAvLyBUaGUgdG9waWMgaXMgYWxyZWFkeSBkZWxldGVkIGF0IHRoZSBzZXJ2ZXIsIGp1c3QgcmVtb3ZlIGZyb20gREIuXG4gICAgICB0aGlzLl9nb25lKCk7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fdGlub2RlLmRlbFRvcGljKHRoaXMubmFtZSwgaGFyZCkudGhlbigoY3RybCkgPT4ge1xuICAgICAgdGhpcy5fcmVzZXRTdWIoKTtcbiAgICAgIHRoaXMuX2dvbmUoKTtcbiAgICAgIHJldHVybiBjdHJsO1xuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBEZWxldGUgc3Vic2NyaXB0aW9uLiBSZXF1aXJlcyBTaGFyZSBwZXJtaXNzaW9uLiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI2RlbFN1YnNjcmlwdGlvbn0uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1c2VyIC0gSUQgb2YgdGhlIHVzZXIgdG8gcmVtb3ZlIHN1YnNjcmlwdGlvbiBmb3IuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRvIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIHNlcnZlciByZXNwb25kcyB0byByZXF1ZXN0LlxuICAgKi9cbiAgZGVsU3Vic2NyaXB0aW9uKHVzZXIpIHtcbiAgICBpZiAoIXRoaXMuX2F0dGFjaGVkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwiQ2Fubm90IGRlbGV0ZSBzdWJzY3JpcHRpb24gaW4gaW5hY3RpdmUgdG9waWNcIikpO1xuICAgIH1cbiAgICAvLyBTZW5kIHtkZWx9IG1lc3NhZ2UsIHJldHVybiBwcm9taXNlXG4gICAgcmV0dXJuIHRoaXMuX3Rpbm9kZS5kZWxTdWJzY3JpcHRpb24odGhpcy5uYW1lLCB1c2VyKS50aGVuKChjdHJsKSA9PiB7XG4gICAgICAvLyBSZW1vdmUgdGhlIG9iamVjdCBmcm9tIHRoZSBzdWJzY3JpcHRpb24gY2FjaGU7XG4gICAgICBkZWxldGUgdGhpcy5fdXNlcnNbdXNlcl07XG4gICAgICAvLyBOb3RpZnkgbGlzdGVuZXJzXG4gICAgICBpZiAodGhpcy5vblN1YnNVcGRhdGVkKSB7XG4gICAgICAgIHRoaXMub25TdWJzVXBkYXRlZChPYmplY3Qua2V5cyh0aGlzLl91c2VycykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN0cmw7XG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIFNlbmQgYSByZWFkL3JlY3Ygbm90aWZpY2F0aW9uLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gd2hhdCAtIHdoYXQgbm90aWZpY2F0aW9uIHRvIHNlbmQ6IDxjb2RlPnJlY3Y8L2NvZGU+LCA8Y29kZT5yZWFkPC9jb2RlPi5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcSAtIElEIG9yIHRoZSBtZXNzYWdlIHJlYWQgb3IgcmVjZWl2ZWQuXG4gICAqL1xuICBub3RlKHdoYXQsIHNlcSkge1xuICAgIGlmICghdGhpcy5fYXR0YWNoZWQpIHtcbiAgICAgIC8vIENhbm5vdCBzZW5kaW5nIHtub3RlfSBvbiBhbiBpbmFjdGl2ZSB0b3BpY1wiLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBsb2NhbCBjYWNoZSB3aXRoIHRoZSBuZXcgY291bnQuXG4gICAgY29uc3QgdXNlciA9IHRoaXMuX3VzZXJzW3RoaXMuX3Rpbm9kZS5nZXRDdXJyZW50VXNlcklEKCldO1xuICAgIGxldCB1cGRhdGUgPSBmYWxzZTtcbiAgICBpZiAodXNlcikge1xuICAgICAgLy8gU2VsZi1zdWJzY3JpcHRpb24gaXMgZm91bmQuXG4gICAgICBpZiAoIXVzZXJbd2hhdF0gfHwgdXNlclt3aGF0XSA8IHNlcSkge1xuICAgICAgICB1c2VyW3doYXRdID0gc2VxO1xuICAgICAgICB1cGRhdGUgPSB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTZWxmLXN1YnNjcmlwdGlvbiBpcyBub3QgZm91bmQuXG4gICAgICB1cGRhdGUgPSAodGhpc1t3aGF0XSB8IDApIDwgc2VxO1xuICAgIH1cblxuICAgIGlmICh1cGRhdGUpIHtcbiAgICAgIC8vIFNlbmQgbm90aWZpY2F0aW9uIHRvIHRoZSBzZXJ2ZXIuXG4gICAgICB0aGlzLl90aW5vZGUubm90ZSh0aGlzLm5hbWUsIHdoYXQsIHNlcSk7XG4gICAgICAvLyBVcGRhdGUgbG9jYWxseSBjYWNoZWQgY29udGFjdCB3aXRoIHRoZSBuZXcgY291bnQuXG4gICAgICB0aGlzLl91cGRhdGVSZWFkUmVjdih3aGF0LCBzZXEpO1xuXG4gICAgICBpZiAodGhpcy5hY3MgIT0gbnVsbCAmJiAhdGhpcy5hY3MuaXNNdXRlZCgpKSB7XG4gICAgICAgIGNvbnN0IG1lID0gdGhpcy5fdGlub2RlLmdldE1lVG9waWMoKTtcbiAgICAgICAgLy8gU2VudCBhIG5vdGlmaWNhdGlvbiB0byAnbWUnIGxpc3RlbmVycy5cbiAgICAgICAgbWUuX3JlZnJlc2hDb250YWN0KHdoYXQsIHRoaXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvKipcbiAgICogU2VuZCBhICdyZWN2JyByZWNlaXB0LiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI25vdGVSZWN2fS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcSAtIElEIG9mIHRoZSBtZXNzYWdlIHRvIGFrbm93bGVkZ2UuXG4gICAqL1xuICBub3RlUmVjdihzZXEpIHtcbiAgICB0aGlzLm5vdGUoJ3JlY3YnLCBzZXEpO1xuICB9XG4gIC8qKlxuICAgKiBTZW5kIGEgJ3JlYWQnIHJlY2VpcHQuIFdyYXBwZXIgZm9yIHtAbGluayBUaW5vZGUjbm90ZVJlYWR9LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gc2VxIC0gSUQgb2YgdGhlIG1lc3NhZ2UgdG8gYWtub3dsZWRnZSBvciAwL3VuZGVmaW5lZCB0byBhY2tub3dsZWRnZSB0aGUgbGF0ZXN0IG1lc3NhZ2VzLlxuICAgKi9cbiAgbm90ZVJlYWQoc2VxKSB7XG4gICAgc2VxID0gc2VxIHx8IHRoaXMuX21heFNlcTtcbiAgICBpZiAoc2VxID4gMCkge1xuICAgICAgdGhpcy5ub3RlKCdyZWFkJywgc2VxKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIFNlbmQgYSBrZXktcHJlc3Mgbm90aWZpY2F0aW9uLiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI25vdGVLZXlQcmVzc30uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqL1xuICBub3RlS2V5UHJlc3MoKSB7XG4gICAgaWYgKHRoaXMuX2F0dGFjaGVkKSB7XG4gICAgICB0aGlzLl90aW5vZGUubm90ZUtleVByZXNzKHRoaXMubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Rpbm9kZS5sb2dnZXIoXCJJTkZPOiBDYW5ub3Qgc2VuZCBub3RpZmljYXRpb24gaW4gaW5hY3RpdmUgdG9waWNcIik7XG4gICAgfVxuICB9XG4gIC8vIFVwZGF0ZSBjYWNoZWQgcmVhZC9yZWN2L3VucmVhZCBjb3VudHMuXG4gIF91cGRhdGVSZWFkUmVjdih3aGF0LCBzZXEsIHRzKSB7XG4gICAgbGV0IG9sZFZhbCwgZG9VcGRhdGUgPSBmYWxzZTtcblxuICAgIHNlcSA9IHNlcSB8IDA7XG4gICAgdGhpcy5zZXEgPSB0aGlzLnNlcSB8IDA7XG4gICAgdGhpcy5yZWFkID0gdGhpcy5yZWFkIHwgMDtcbiAgICB0aGlzLnJlY3YgPSB0aGlzLnJlY3YgfCAwO1xuICAgIHN3aXRjaCAod2hhdCkge1xuICAgICAgY2FzZSAncmVjdic6XG4gICAgICAgIG9sZFZhbCA9IHRoaXMucmVjdjtcbiAgICAgICAgdGhpcy5yZWN2ID0gTWF0aC5tYXgodGhpcy5yZWN2LCBzZXEpO1xuICAgICAgICBkb1VwZGF0ZSA9IChvbGRWYWwgIT0gdGhpcy5yZWN2KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdyZWFkJzpcbiAgICAgICAgb2xkVmFsID0gdGhpcy5yZWFkO1xuICAgICAgICB0aGlzLnJlYWQgPSBNYXRoLm1heCh0aGlzLnJlYWQsIHNlcSk7XG4gICAgICAgIGRvVXBkYXRlID0gKG9sZFZhbCAhPSB0aGlzLnJlYWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ21zZyc6XG4gICAgICAgIG9sZFZhbCA9IHRoaXMuc2VxO1xuICAgICAgICB0aGlzLnNlcSA9IE1hdGgubWF4KHRoaXMuc2VxLCBzZXEpO1xuICAgICAgICBpZiAoIXRoaXMudG91Y2hlZCB8fCB0aGlzLnRvdWNoZWQgPCB0cykge1xuICAgICAgICAgIHRoaXMudG91Y2hlZCA9IHRzO1xuICAgICAgICB9XG4gICAgICAgIGRvVXBkYXRlID0gKG9sZFZhbCAhPSB0aGlzLnNlcSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIFNhbml0eSBjaGVja3MuXG4gICAgaWYgKHRoaXMucmVjdiA8IHRoaXMucmVhZCkge1xuICAgICAgdGhpcy5yZWN2ID0gdGhpcy5yZWFkO1xuICAgICAgZG9VcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAodGhpcy5zZXEgPCB0aGlzLnJlY3YpIHtcbiAgICAgIHRoaXMuc2VxID0gdGhpcy5yZWN2O1xuICAgICAgaWYgKCF0aGlzLnRvdWNoZWQgfHwgdGhpcy50b3VjaGVkIDwgdHMpIHtcbiAgICAgICAgdGhpcy50b3VjaGVkID0gdHM7XG4gICAgICB9XG4gICAgICBkb1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMudW5yZWFkID0gdGhpcy5zZXEgLSB0aGlzLnJlYWQ7XG4gICAgcmV0dXJuIGRvVXBkYXRlO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgdXNlciBkZXNjcmlwdGlvbiBmcm9tIGdsb2JhbCBjYWNoZS4gVGhlIHVzZXIgZG9lcyBub3QgbmVlZCB0byBiZSBhXG4gICAqIHN1YnNjcmliZXIgb2YgdGhpcyB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVpZCAtIElEIG9mIHRoZSB1c2VyIHRvIGZldGNoLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHVzZXIgZGVzY3JpcHRpb24gb3IgdW5kZWZpbmVkLlxuICAgKi9cbiAgdXNlckRlc2ModWlkKSB7XG4gICAgLy8gVE9ETzogaGFuZGxlIGFzeW5jaHJvbm91cyByZXF1ZXN0c1xuICAgIGNvbnN0IHVzZXIgPSB0aGlzLl9jYWNoZUdldFVzZXIodWlkKTtcbiAgICBpZiAodXNlcikge1xuICAgICAgcmV0dXJuIHVzZXI7IC8vIFByb21pc2UucmVzb2x2ZSh1c2VyKVxuICAgIH1cbiAgfVxuICAvKipcbiAgICogR2V0IGRlc2NyaXB0aW9uIG9mIHRoZSBwMnAgcGVlciBmcm9tIHN1YnNjcmlwdGlvbiBjYWNoZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSBwZWVyJ3MgZGVzY3JpcHRpb24gb3IgdW5kZWZpbmVkLlxuICAgKi9cbiAgcDJwUGVlckRlc2MoKSB7XG4gICAgaWYgKCF0aGlzLmlzUDJQVHlwZSgpKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fdXNlcnNbdGhpcy5uYW1lXTtcbiAgfVxuICAvKipcbiAgICogSXRlcmF0ZSBvdmVyIGNhY2hlZCBzdWJzY3JpYmVycy4gSWYgY2FsbGJhY2sgaXMgdW5kZWZpbmVkLCB1c2UgdGhpcy5vbk1ldGFTdWIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGJhY2sgd2hpY2ggd2lsbCByZWNlaXZlIHN1YnNjcmliZXJzIG9uZSBieSBvbmUuXG4gICAqIEBwYXJhbSB7T2JqZWN0PX0gY29udGV4dCAtIFZhbHVlIG9mIGB0aGlzYCBpbnNpZGUgdGhlIGBjYWxsYmFja2AuXG4gICAqL1xuICBzdWJzY3JpYmVycyhjYWxsYmFjaywgY29udGV4dCkge1xuICAgIGNvbnN0IGNiID0gKGNhbGxiYWNrIHx8IHRoaXMub25NZXRhU3ViKTtcbiAgICBpZiAoY2IpIHtcbiAgICAgIGZvciAobGV0IGlkeCBpbiB0aGlzLl91c2Vycykge1xuICAgICAgICBjYi5jYWxsKGNvbnRleHQsIHRoaXMuX3VzZXJzW2lkeF0sIGlkeCwgdGhpcy5fdXNlcnMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvKipcbiAgICogR2V0IGEgY29weSBvZiBjYWNoZWQgdGFncy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybiB7QXJyYXkuPHN0cmluZz59IGEgY29weSBvZiB0YWdzXG4gICAqL1xuICB0YWdzKCkge1xuICAgIC8vIFJldHVybiBhIGNvcHkuXG4gICAgcmV0dXJuIHRoaXMuX3RhZ3Muc2xpY2UoMCk7XG4gIH1cbiAgLyoqXG4gICAqIEdldCBjYWNoZWQgc3Vic2NyaXB0aW9uIGZvciB0aGUgZ2l2ZW4gdXNlciBJRC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVpZCAtIGlkIG9mIHRoZSB1c2VyIHRvIHF1ZXJ5IGZvclxuICAgKiBAcmV0dXJuIHVzZXIgZGVzY3JpcHRpb24gb3IgdW5kZWZpbmVkLlxuICAgKi9cbiAgc3Vic2NyaWJlcih1aWQpIHtcbiAgICByZXR1cm4gdGhpcy5fdXNlcnNbdWlkXTtcbiAgfVxuICAvKipcbiAgICogSXRlcmF0ZSBvdmVyIGNhY2hlZCBtZXNzYWdlczogY2FsbCA8Y29kZT5jYWxsYmFjazwvY29kZT4gZm9yIGVhY2ggbWVzc2FnZSBpbiB0aGUgcmFuZ2UgW3NpbmRlSWR4LCBiZWZvcmVJZHgpLlxuICAgKiBJZiA8Y29kZT5jYWxsYmFjazwvY29kZT4gaXMgdW5kZWZpbmVkLCB1c2UgPGNvZGU+dGhpcy5vbkRhdGE8L2NvZGU+LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge1Rpbm9kZS5Gb3JFYWNoQ2FsbGJhY2tUeXBlfSBjYWxsYmFjayAtIENhbGxiYWNrIHdoaWNoIHdpbGwgcmVjZWl2ZSBtZXNzYWdlcyBvbmUgYnkgb25lLiBTZWUge0BsaW5rIFRpbm9kZS5DQnVmZmVyI2ZvckVhY2h9XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzaW5jZUlkIC0gT3B0aW9uYWwgc2VxSWQgdG8gc3RhcnQgaXRlcmF0aW5nIGZyb20gKGluY2x1c2l2ZSkuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiZWZvcmVJZCAtIE9wdGlvbmFsIHNlcUlkIHRvIHN0b3AgaXRlcmF0aW5nIGJlZm9yZSBpdCBpcyByZWFjaGVkIChleGNsdXNpdmUpLlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIFZhbHVlIG9mIGB0aGlzYCBpbnNpZGUgdGhlIGBjYWxsYmFja2AuXG4gICAqL1xuICBtZXNzYWdlcyhjYWxsYmFjaywgc2luY2VJZCwgYmVmb3JlSWQsIGNvbnRleHQpIHtcbiAgICBjb25zdCBjYiA9IChjYWxsYmFjayB8fCB0aGlzLm9uRGF0YSk7XG4gICAgaWYgKGNiKSB7XG4gICAgICBjb25zdCBzdGFydElkeCA9IHR5cGVvZiBzaW5jZUlkID09ICdudW1iZXInID8gdGhpcy5fbWVzc2FnZXMuZmluZCh7XG4gICAgICAgIHNlcTogc2luY2VJZFxuICAgICAgfSwgdHJ1ZSkgOiB1bmRlZmluZWQ7XG4gICAgICBjb25zdCBiZWZvcmVJZHggPSB0eXBlb2YgYmVmb3JlSWQgPT0gJ251bWJlcicgPyB0aGlzLl9tZXNzYWdlcy5maW5kKHtcbiAgICAgICAgc2VxOiBiZWZvcmVJZFxuICAgICAgfSwgdHJ1ZSkgOiB1bmRlZmluZWQ7XG4gICAgICBpZiAoc3RhcnRJZHggIT0gLTEgJiYgYmVmb3JlSWR4ICE9IC0xKSB7XG4gICAgICAgIHRoaXMuX21lc3NhZ2VzLmZvckVhY2goY2IsIHN0YXJ0SWR4LCBiZWZvcmVJZHgsIGNvbnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvKipcbiAgICogR2V0IHRoZSBtZXNzYWdlIGZyb20gY2FjaGUgYnkgPGNvZGU+c2VxPC9jb2RlPi5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcSAtIG1lc3NhZ2Ugc2VxSWQgdG8gc2VhcmNoIGZvci5cbiAgICogQHJldHVybnMge09iamVjdH0gdGhlIG1lc3NhZ2Ugd2l0aCB0aGUgZ2l2ZW4gPGNvZGU+c2VxPC9jb2RlPiBvciA8Y29kZT51bmRlZmluZWQ8L2NvZGU+LCBpZiBubyBzdWNoIG1lc3NhZ2UgaXMgZm91bmQuXG4gICAqL1xuICBmaW5kTWVzc2FnZShzZXEpIHtcbiAgICBjb25zdCBpZHggPSB0aGlzLl9tZXNzYWdlcy5maW5kKHtcbiAgICAgIHNlcTogc2VxXG4gICAgfSk7XG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXMuZ2V0QXQoaWR4KTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICAvKipcbiAgICogR2V0IHRoZSBtb3N0IHJlY2VudCBtZXNzYWdlIGZyb20gY2FjaGUuIFRoaXMgbWV0aG9kIGNvdW50cyBhbGwgbWVzc2FnZXMsIGluY2x1ZGluZyBkZWxldGVkIHJhbmdlcy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtib29sZW59IHNraXBEZWxldGVkIC0gaWYgdGhlIGxhc3QgbWVzc2FnZSBpcyBhIGRlbGV0ZWQgcmFuZ2UsIGdldCB0aGUgb25lIGJlZm9yZSBpdC5cbiAgICogQHJldHVybnMge09iamVjdH0gdGhlIG1vc3QgcmVjZW50IGNhY2hlZCBtZXNzYWdlIG9yIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4sIGlmIG5vIG1lc3NhZ2VzIGFyZSBjYWNoZWQuXG4gICAqL1xuICBsYXRlc3RNZXNzYWdlKHNraXBEZWxldGVkKSB7XG4gICAgY29uc3QgbXNnID0gdGhpcy5fbWVzc2FnZXMuZ2V0TGFzdCgpO1xuICAgIGlmICghc2tpcERlbGV0ZWQgfHwgIW1zZyB8fCBtc2cuX3N0YXR1cyAhPSBDb25zdC5NRVNTQUdFX1NUQVRVU19ERUxfUkFOR0UpIHtcbiAgICAgIHJldHVybiBtc2c7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9tZXNzYWdlcy5nZXRMYXN0KDEpO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgdGhlIG1heGltdW0gY2FjaGVkIHNlcSBJRC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn0gdGhlIGdyZWF0ZXN0IHNlcSBJRCBpbiBjYWNoZS5cbiAgICovXG4gIG1heE1zZ1NlcSgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4U2VxO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgdGhlIG1heGltdW0gZGVsZXRpb24gSUQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBncmVhdGVzdCBkZWxldGlvbiBJRC5cbiAgICovXG4gIG1heENsZWFySWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21heERlbDtcbiAgfVxuICAvKipcbiAgICogR2V0IHRoZSBudW1iZXIgb2YgbWVzc2FnZXMgaW4gdGhlIGNhY2hlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBjb3VudCBvZiBjYWNoZWQgbWVzc2FnZXMuXG4gICAqL1xuICBtZXNzYWdlQ291bnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzLmxlbmd0aCgpO1xuICB9XG4gIC8qKlxuICAgKiBJdGVyYXRlIG92ZXIgY2FjaGVkIHVuc2VudCBtZXNzYWdlcy4gV3JhcHMge0BsaW5rIFRpbm9kZS5Ub3BpYyNtZXNzYWdlc30uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGJhY2sgd2hpY2ggd2lsbCByZWNlaXZlIG1lc3NhZ2VzIG9uZSBieSBvbmUuIFNlZSB7QGxpbmsgVGlub2RlLkNCdWZmZXIjZm9yRWFjaH1cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSBWYWx1ZSBvZiA8Y29kZT50aGlzPC9jb2RlPiBpbnNpZGUgdGhlIDxjb2RlPmNhbGxiYWNrPC9jb2RlPi5cbiAgICovXG4gIHF1ZXVlZE1lc3NhZ2VzKGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGJhY2sgbXVzdCBiZSBwcm92aWRlZFwiKTtcbiAgICB9XG4gICAgdGhpcy5tZXNzYWdlcyhjYWxsYmFjaywgQ29uc3QuTE9DQUxfU0VRSUQsIHVuZGVmaW5lZCwgY29udGV4dCk7XG4gIH1cbiAgLyoqXG4gICAqIEdldCB0aGUgbnVtYmVyIG9mIHRvcGljIHN1YnNjcmliZXJzIHdobyBtYXJrZWQgdGhpcyBtZXNzYWdlIGFzIGVpdGhlciByZWN2IG9yIHJlYWRcbiAgICogQ3VycmVudCB1c2VyIGlzIGV4Y2x1ZGVkIGZyb20gdGhlIGNvdW50LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gd2hhdCAtIHdoYXQgYWN0aW9uIHRvIGNvbnNpZGVyOiByZWNlaXZlZCA8Y29kZT5cInJlY3ZcIjwvY29kZT4gb3IgcmVhZCA8Y29kZT5cInJlYWRcIjwvY29kZT4uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzZXEgLSBJRCBvciB0aGUgbWVzc2FnZSByZWFkIG9yIHJlY2VpdmVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIHN1YnNjcmliZXJzIHdobyBtYXJrZWQgdGhlIG1lc3NhZ2Ugd2l0aCB0aGUgZ2l2ZW4gSUQgYXMgcmVhZCBvciByZWNlaXZlZC5cbiAgICovXG4gIG1zZ1JlY2VpcHRDb3VudCh3aGF0LCBzZXEpIHtcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIGlmIChzZXEgPiAwKSB7XG4gICAgICBjb25zdCBtZSA9IHRoaXMuX3Rpbm9kZS5nZXRDdXJyZW50VXNlcklEKCk7XG4gICAgICBmb3IgKGxldCBpZHggaW4gdGhpcy5fdXNlcnMpIHtcbiAgICAgICAgY29uc3QgdXNlciA9IHRoaXMuX3VzZXJzW2lkeF07XG4gICAgICAgIGlmICh1c2VyLnVzZXIgIT09IG1lICYmIHVzZXJbd2hhdF0gPj0gc2VxKSB7XG4gICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY291bnQ7XG4gIH1cbiAgLyoqXG4gICAqIEdldCB0aGUgbnVtYmVyIG9mIHRvcGljIHN1YnNjcmliZXJzIHdobyBtYXJrZWQgdGhpcyBtZXNzYWdlIChhbmQgYWxsIG9sZGVyIG1lc3NhZ2VzKSBhcyByZWFkLlxuICAgKiBUaGUgY3VycmVudCB1c2VyIGlzIGV4Y2x1ZGVkIGZyb20gdGhlIGNvdW50LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gc2VxIC0gbWVzc2FnZSBpZCB0byBjaGVjay5cbiAgICogQHJldHVybnMge251bWJlcn0gbnVtYmVyIG9mIHN1YnNjcmliZXJzIHdobyBjbGFpbSB0byBoYXZlIHJlY2VpdmVkIHRoZSBtZXNzYWdlLlxuICAgKi9cbiAgbXNnUmVhZENvdW50KHNlcSkge1xuICAgIHJldHVybiB0aGlzLm1zZ1JlY2VpcHRDb3VudCgncmVhZCcsIHNlcSk7XG4gIH1cbiAgLyoqXG4gICAqIEdldCB0aGUgbnVtYmVyIG9mIHRvcGljIHN1YnNjcmliZXJzIHdobyBtYXJrZWQgdGhpcyBtZXNzYWdlIChhbmQgYWxsIG9sZGVyIG1lc3NhZ2VzKSBhcyByZWNlaXZlZC5cbiAgICogVGhlIGN1cnJlbnQgdXNlciBpcyBleGNsdWRlZCBmcm9tIHRoZSBjb3VudC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcSAtIE1lc3NhZ2UgaWQgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IE51bWJlciBvZiBzdWJzY3JpYmVycyB3aG8gY2xhaW0gdG8gaGF2ZSByZWNlaXZlZCB0aGUgbWVzc2FnZS5cbiAgICovXG4gIG1zZ1JlY3ZDb3VudChzZXEpIHtcbiAgICByZXR1cm4gdGhpcy5tc2dSZWNlaXB0Q291bnQoJ3JlY3YnLCBzZXEpO1xuICB9XG4gIC8qKlxuICAgKiBDaGVjayBpZiBjYWNoZWQgbWVzc2FnZSBJRHMgaW5kaWNhdGUgdGhhdCB0aGUgc2VydmVyIG1heSBoYXZlIG1vcmUgbWVzc2FnZXMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gbmV3ZXIgLSBpZiA8Y29kZT50cnVlPC9jb2RlPiwgY2hlY2sgZm9yIG5ld2VyIG1lc3NhZ2VzIG9ubHkuXG4gICAqL1xuICBtc2dIYXNNb3JlTWVzc2FnZXMobmV3ZXIpIHtcbiAgICByZXR1cm4gbmV3ZXIgPyB0aGlzLnNlcSA+IHRoaXMuX21heFNlcSA6XG4gICAgICAvLyBfbWluU2VxIGNvdWxkIGJlIG1vcmUgdGhhbiAxLCBidXQgZWFybGllciBtZXNzYWdlcyBjb3VsZCBoYXZlIGJlZW4gZGVsZXRlZC5cbiAgICAgICh0aGlzLl9taW5TZXEgPiAxICYmICF0aGlzLl9ub0VhcmxpZXJNc2dzKTtcbiAgfVxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIGdpdmVuIHNlcSBJZCBpcyBpZCBvZiB0aGUgbW9zdCByZWNlbnQgbWVzc2FnZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcUlkIGlkIG9mIHRoZSBtZXNzYWdlIHRvIGNoZWNrXG4gICAqL1xuICBpc05ld01lc3NhZ2Uoc2VxSWQpIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4U2VxIDw9IHNlcUlkO1xuICB9XG4gIC8qKlxuICAgKiBSZW1vdmUgb25lIG1lc3NhZ2UgZnJvbSBsb2NhbCBjYWNoZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcUlkIGlkIG9mIHRoZSBtZXNzYWdlIHRvIHJlbW92ZSBmcm9tIGNhY2hlLlxuICAgKiBAcmV0dXJucyB7TWVzc2FnZX0gcmVtb3ZlZCBtZXNzYWdlIG9yIHVuZGVmaW5lZCBpZiBzdWNoIG1lc3NhZ2Ugd2FzIG5vdCBmb3VuZC5cbiAgICovXG4gIGZsdXNoTWVzc2FnZShzZXFJZCkge1xuICAgIGNvbnN0IGlkeCA9IHRoaXMuX21lc3NhZ2VzLmZpbmQoe1xuICAgICAgc2VxOiBzZXFJZFxuICAgIH0pO1xuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgdGhpcy5fdGlub2RlLl9kYi5yZW1NZXNzYWdlcyh0aGlzLm5hbWUsIHNlcUlkKTtcbiAgICAgIHJldHVybiB0aGlzLl9tZXNzYWdlcy5kZWxBdChpZHgpO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIC8qKlxuICAgKiBVcGRhdGUgbWVzc2FnZSdzIHNlcUlkLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcHViIG1lc3NhZ2Ugb2JqZWN0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gbmV3U2VxSWQgbmV3IHNlcSBpZCBmb3IgcHViLlxuICAgKi9cbiAgc3dhcE1lc3NhZ2VJZChwdWIsIG5ld1NlcUlkKSB7XG4gICAgY29uc3QgaWR4ID0gdGhpcy5fbWVzc2FnZXMuZmluZChwdWIpO1xuICAgIGNvbnN0IG51bU1lc3NhZ2VzID0gdGhpcy5fbWVzc2FnZXMubGVuZ3RoKCk7XG4gICAgaWYgKDAgPD0gaWR4ICYmIGlkeCA8IG51bU1lc3NhZ2VzKSB7XG4gICAgICAvLyBSZW1vdmUgbWVzc2FnZSB3aXRoIHRoZSBvbGQgc2VxIElELlxuICAgICAgdGhpcy5fbWVzc2FnZXMuZGVsQXQoaWR4KTtcbiAgICAgIHRoaXMuX3Rpbm9kZS5fZGIucmVtTWVzc2FnZXModGhpcy5uYW1lLCBwdWIuc2VxKTtcbiAgICAgIC8vIEFkZCBtZXNzYWdlIHdpdGggdGhlIG5ldyBzZXEgSUQuXG4gICAgICBwdWIuc2VxID0gbmV3U2VxSWQ7XG4gICAgICB0aGlzLl9tZXNzYWdlcy5wdXQocHViKTtcbiAgICAgIHRoaXMuX3Rpbm9kZS5fZGIuYWRkTWVzc2FnZShwdWIpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogUmVtb3ZlIGEgcmFuZ2Ugb2YgbWVzc2FnZXMgZnJvbSB0aGUgbG9jYWwgY2FjaGUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBmcm9tSWQgc2VxIElEIG9mIHRoZSBmaXJzdCBtZXNzYWdlIHRvIHJlbW92ZSAoaW5jbHVzaXZlKS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHVudGlsSWQgc2VxSUQgb2YgdGhlIGxhc3QgbWVzc2FnZSB0byByZW1vdmUgKGV4Y2x1c2l2ZSkuXG4gICAqXG4gICAqIEByZXR1cm5zIHtNZXNzYWdlW119IGFycmF5IG9mIHJlbW92ZWQgbWVzc2FnZXMgKGNvdWxkIGJlIGVtcHR5KS5cbiAgICovXG4gIGZsdXNoTWVzc2FnZVJhbmdlKGZyb21JZCwgdW50aWxJZCkge1xuICAgIC8vIFJlbW92ZSByYW5nZSBmcm9tIHBlcnNpc3RlbnQgY2FjaGUuXG4gICAgdGhpcy5fdGlub2RlLl9kYi5yZW1NZXNzYWdlcyh0aGlzLm5hbWUsIGZyb21JZCwgdW50aWxJZCk7XG4gICAgLy8gc3RhcnQsIGVuZDogZmluZCBpbnNlcnRpb24gcG9pbnRzIChuZWFyZXN0ID09IHRydWUpLlxuICAgIGNvbnN0IHNpbmNlID0gdGhpcy5fbWVzc2FnZXMuZmluZCh7XG4gICAgICBzZXE6IGZyb21JZFxuICAgIH0sIHRydWUpO1xuICAgIHJldHVybiBzaW5jZSA+PSAwID8gdGhpcy5fbWVzc2FnZXMuZGVsUmFuZ2Uoc2luY2UsIHRoaXMuX21lc3NhZ2VzLmZpbmQoe1xuICAgICAgc2VxOiB1bnRpbElkXG4gICAgfSwgdHJ1ZSkpIDogW107XG4gIH1cbiAgLyoqXG4gICAqIEF0dGVtcHQgdG8gc3RvcCBtZXNzYWdlIGZyb20gYmVpbmcgc2VudC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcUlkIGlkIG9mIHRoZSBtZXNzYWdlIHRvIHN0b3Agc2VuZGluZyBhbmQgcmVtb3ZlIGZyb20gY2FjaGUuXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiBtZXNzYWdlIHdhcyBjYW5jZWxsZWQsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBjYW5jZWxTZW5kKHNlcUlkKSB7XG4gICAgY29uc3QgaWR4ID0gdGhpcy5fbWVzc2FnZXMuZmluZCh7XG4gICAgICBzZXE6IHNlcUlkXG4gICAgfSk7XG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBjb25zdCBtc2cgPSB0aGlzLl9tZXNzYWdlcy5nZXRBdChpZHgpO1xuICAgICAgY29uc3Qgc3RhdHVzID0gdGhpcy5tc2dTdGF0dXMobXNnKTtcbiAgICAgIGlmIChzdGF0dXMgPT0gQ29uc3QuTUVTU0FHRV9TVEFUVVNfUVVFVUVEIHx8IHN0YXR1cyA9PSBDb25zdC5NRVNTQUdFX1NUQVRVU19GQUlMRUQpIHtcbiAgICAgICAgdGhpcy5fdGlub2RlLl9kYi5yZW1NZXNzYWdlcyh0aGlzLm5hbWUsIHNlcUlkKTtcbiAgICAgICAgbXNnLl9jYW5jZWxsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9tZXNzYWdlcy5kZWxBdChpZHgpO1xuICAgICAgICBpZiAodGhpcy5vbkRhdGEpIHtcbiAgICAgICAgICAvLyBDYWxsaW5nIHdpdGggbm8gcGFyYW1ldGVycyB0byBpbmRpY2F0ZSB0aGUgbWVzc2FnZSB3YXMgZGVsZXRlZC5cbiAgICAgICAgICB0aGlzLm9uRGF0YSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLyoqXG4gICAqIEdldCB0eXBlIG9mIHRoZSB0b3BpYzogbWUsIHAycCwgZ3JwLCBmbmQuLi5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gT25lIG9mICdtZScsICdwMnAnLCAnZ3JwJywgJ2ZuZCcsICdzeXMnIG9yIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4uXG4gICAqL1xuICBnZXRUeXBlKCkge1xuICAgIHJldHVybiBUb3BpYy50b3BpY1R5cGUodGhpcy5uYW1lKTtcbiAgfVxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgdXNlcidzIGFjY2VzcyBtb2RlIG9mIHRoZSB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybnMge1Rpbm9kZS5BY2Nlc3NNb2RlfSAtIHVzZXIncyBhY2Nlc3MgbW9kZVxuICAgKi9cbiAgZ2V0QWNjZXNzTW9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5hY3M7XG4gIH1cbiAgLyoqXG4gICAqIFNldCBjdXJyZW50IHVzZXIncyBhY2Nlc3MgbW9kZSBvZiB0aGUgdG9waWMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7QWNjZXNzTW9kZSB8IE9iamVjdH0gYWNzIC0gYWNjZXNzIG1vZGUgdG8gc2V0LlxuICAgKi9cbiAgc2V0QWNjZXNzTW9kZShhY3MpIHtcbiAgICByZXR1cm4gdGhpcy5hY3MgPSBuZXcgQWNjZXNzTW9kZShhY3MpO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgdG9waWMncyBkZWZhdWx0IGFjY2VzcyBtb2RlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcmV0dXJucyB7VGlub2RlLkRlZkFjc30gLSBhY2Nlc3MgbW9kZSwgc3VjaCBhcyB7YXV0aDogYFJXUGAsIGFub246IGBOYH0uXG4gICAqL1xuICBnZXREZWZhdWx0QWNjZXNzKCkge1xuICAgIHJldHVybiB0aGlzLmRlZmFjcztcbiAgfVxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBuZXcgbWV0YSB7QGxpbmsgVGlub2RlLkdldFF1ZXJ5fSBidWlsZGVyLiBUaGUgcXVlcnkgaXMgYXR0Y2hlZCB0byB0aGUgY3VycmVudCB0b3BpYy5cbiAgICogSXQgd2lsbCBub3Qgd29yayBjb3JyZWN0bHkgaWYgdXNlZCB3aXRoIGEgZGlmZmVyZW50IHRvcGljLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcmV0dXJucyB7VGlub2RlLk1ldGFHZXRCdWlsZGVyfSBxdWVyeSBhdHRhY2hlZCB0byB0aGUgY3VycmVudCB0b3BpYy5cbiAgICovXG4gIHN0YXJ0TWV0YVF1ZXJ5KCkge1xuICAgIHJldHVybiBuZXcgTWV0YUdldEJ1aWxkZXIodGhpcyk7XG4gIH1cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRvcGljIGlzIGFyY2hpdmVkLCBpLmUuIHByaXZhdGUuYXJjaCA9PSB0cnVlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSA8Y29kZT50cnVlPC9jb2RlPiBpZiB0b3BpYyBpcyBhcmNoaXZlZCwgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIGlzQXJjaGl2ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJpdmF0ZSAmJiAhIXRoaXMucHJpdmF0ZS5hcmNoO1xuICB9XG4gIC8qKlxuICAgKiBDaGVjayBpZiB0b3BpYyBpcyBhICdtZScgdG9waWMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIDxjb2RlPnRydWU8L2NvZGU+IGlmIHRvcGljIGlzIGEgJ21lJyB0b3BpYywgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIGlzTWVUeXBlKCkge1xuICAgIHJldHVybiBUb3BpYy5pc01lVG9waWNOYW1lKHRoaXMubmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRvcGljIGlzIGEgY2hhbm5lbC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdG9waWMgaXMgYSBjaGFubmVsLCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICAgKi9cbiAgaXNDaGFubmVsVHlwZSgpIHtcbiAgICByZXR1cm4gVG9waWMuaXNDaGFubmVsVG9waWNOYW1lKHRoaXMubmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRvcGljIGlzIGEgZ3JvdXAgdG9waWMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIDxjb2RlPnRydWU8L2NvZGU+IGlmIHRvcGljIGlzIGEgZ3JvdXAsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBpc0dyb3VwVHlwZSgpIHtcbiAgICByZXR1cm4gVG9waWMuaXNHcm91cFRvcGljTmFtZSh0aGlzLm5hbWUpO1xuICB9XG4gIC8qKlxuICAgKiBDaGVjayBpZiB0b3BpYyBpcyBhIHAycCB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdG9waWMgaXMgYSBwMnAgdG9waWMsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBpc1AyUFR5cGUoKSB7XG4gICAgcmV0dXJuIFRvcGljLmlzUDJQVG9waWNOYW1lKHRoaXMubmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRvcGljIGlzIGEgY29tbXVuaWNhdGlvbiB0b3BpYywgaS5lLiBhIGdyb3VwIG9yIHAycCB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdG9waWMgaXMgYSBwMnAgb3IgZ3JvdXAgdG9waWMsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBpc0NvbW1UeXBlKCkge1xuICAgIHJldHVybiBUb3BpYy5pc0NvbW1Ub3BpY05hbWUodGhpcy5uYW1lKTtcbiAgfVxuICAvKipcbiAgICogR2V0IHN0YXR1cyAocXVldWVkLCBzZW50LCByZWNlaXZlZCBldGMpIG9mIGEgZ2l2ZW4gbWVzc2FnZSBpbiB0aGUgY29udGV4dFxuICAgKiBvZiB0aGlzIHRvcGljLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge01lc3NhZ2V9IG1zZyAtIG1lc3NhZ2UgdG8gY2hlY2sgZm9yIHN0YXR1cy5cbiAgICogQHBhcmFtIHtib29sZWFufSB1cGQgLSB1cGRhdGUgY2hhY2hlZCBtZXNzYWdlIHN0YXR1cy5cbiAgICpcbiAgICogQHJldHVybnMgbWVzc2FnZSBzdGF0dXMgY29uc3RhbnQuXG4gICAqL1xuICBtc2dTdGF0dXMobXNnLCB1cGQpIHtcbiAgICBsZXQgc3RhdHVzID0gQ29uc3QuTUVTU0FHRV9TVEFUVVNfTk9ORTtcbiAgICBpZiAodGhpcy5fdGlub2RlLmlzTWUobXNnLmZyb20pKSB7XG4gICAgICBpZiAobXNnLl9zZW5kaW5nKSB7XG4gICAgICAgIHN0YXR1cyA9IENvbnN0Lk1FU1NBR0VfU1RBVFVTX1NFTkRJTkc7XG4gICAgICB9IGVsc2UgaWYgKG1zZy5fZmFpbGVkIHx8IG1zZy5fY2FuY2VsbGVkKSB7XG4gICAgICAgIHN0YXR1cyA9IENvbnN0Lk1FU1NBR0VfU1RBVFVTX0ZBSUxFRDtcbiAgICAgIH0gZWxzZSBpZiAobXNnLnNlcSA+PSBDb25zdC5MT0NBTF9TRVFJRCkge1xuICAgICAgICBzdGF0dXMgPSBDb25zdC5NRVNTQUdFX1NUQVRVU19RVUVVRUQ7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubXNnUmVhZENvdW50KG1zZy5zZXEpID4gMCkge1xuICAgICAgICBzdGF0dXMgPSBDb25zdC5NRVNTQUdFX1NUQVRVU19SRUFEO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm1zZ1JlY3ZDb3VudChtc2cuc2VxKSA+IDApIHtcbiAgICAgICAgc3RhdHVzID0gQ29uc3QuTUVTU0FHRV9TVEFUVVNfUkVDRUlWRUQ7XG4gICAgICB9IGVsc2UgaWYgKG1zZy5zZXEgPiAwKSB7XG4gICAgICAgIHN0YXR1cyA9IENvbnN0Lk1FU1NBR0VfU1RBVFVTX1NFTlQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChtc2cuX3N0YXR1cyA9PSBDb25zdC5NRVNTQUdFX1NUQVRVU19ERUxfUkFOR0UpIHtcbiAgICAgIHN0YXR1cyA9PSBDb25zdC5NRVNTQUdFX1NUQVRVU19ERUxfUkFOR0U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXR1cyA9IENvbnN0Lk1FU1NBR0VfU1RBVFVTX1RPX01FO1xuICAgIH1cblxuICAgIGlmICh1cGQgJiYgbXNnLl9zdGF0dXMgIT0gc3RhdHVzKSB7XG4gICAgICBtc2cuX3N0YXR1cyA9IHN0YXR1cztcbiAgICAgIHRoaXMuX3Rpbm9kZS5fZGIudXBkTWVzc2FnZVN0YXR1cyh0aGlzLm5hbWUsIG1zZy5zZXEsIHN0YXR1cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXR1cztcbiAgfVxuICAvLyBQcm9jZXNzIGRhdGEgbWVzc2FnZVxuICBfcm91dGVEYXRhKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5jb250ZW50KSB7XG4gICAgICBpZiAoIXRoaXMudG91Y2hlZCB8fCB0aGlzLnRvdWNoZWQgPCBkYXRhLnRzKSB7XG4gICAgICAgIHRoaXMudG91Y2hlZCA9IGRhdGEudHM7XG4gICAgICAgIHRoaXMuX3Rpbm9kZS5fZGIudXBkVG9waWModGhpcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRhdGEuc2VxID4gdGhpcy5fbWF4U2VxKSB7XG4gICAgICB0aGlzLl9tYXhTZXEgPSBkYXRhLnNlcTtcbiAgICB9XG4gICAgaWYgKGRhdGEuc2VxIDwgdGhpcy5fbWluU2VxIHx8IHRoaXMuX21pblNlcSA9PSAwKSB7XG4gICAgICB0aGlzLl9taW5TZXEgPSBkYXRhLnNlcTtcbiAgICB9XG5cbiAgICBpZiAoIWRhdGEuX25vRm9yd2FyZGluZykge1xuICAgICAgdGhpcy5fbWVzc2FnZXMucHV0KGRhdGEpO1xuICAgICAgdGhpcy5fdGlub2RlLl9kYi5hZGRNZXNzYWdlKGRhdGEpO1xuICAgICAgdGhpcy5fdXBkYXRlRGVsZXRlZFJhbmdlcygpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9uRGF0YSkge1xuICAgICAgdGhpcy5vbkRhdGEoZGF0YSk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGxvY2FsbHkgY2FjaGVkIGNvbnRhY3Qgd2l0aCB0aGUgbmV3IG1lc3NhZ2UgY291bnQuXG4gICAgY29uc3Qgd2hhdCA9ICgoIXRoaXMuaXNDaGFubmVsVHlwZSgpICYmICFkYXRhLmZyb20pIHx8IHRoaXMuX3Rpbm9kZS5pc01lKGRhdGEuZnJvbSkpID8gJ3JlYWQnIDogJ21zZyc7XG4gICAgdGhpcy5fdXBkYXRlUmVhZFJlY3Yod2hhdCwgZGF0YS5zZXEsIGRhdGEudHMpO1xuICAgIC8vIE5vdGlmeSAnbWUnIGxpc3RlbmVycyBvZiB0aGUgY2hhbmdlLlxuICAgIHRoaXMuX3Rpbm9kZS5nZXRNZVRvcGljKCkuX3JlZnJlc2hDb250YWN0KHdoYXQsIHRoaXMpO1xuICB9XG4gIC8vIFByb2Nlc3MgbWV0YWRhdGEgbWVzc2FnZVxuICBfcm91dGVNZXRhKG1ldGEpIHtcbiAgICBpZiAobWV0YS5kZXNjKSB7XG4gICAgICB0aGlzLl9wcm9jZXNzTWV0YURlc2MobWV0YS5kZXNjKTtcbiAgICB9XG4gICAgaWYgKG1ldGEuc3ViICYmIG1ldGEuc3ViLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX3Byb2Nlc3NNZXRhU3ViKG1ldGEuc3ViKTtcbiAgICB9XG4gICAgaWYgKG1ldGEuZGVsKSB7XG4gICAgICB0aGlzLl9wcm9jZXNzRGVsTWVzc2FnZXMobWV0YS5kZWwuY2xlYXIsIG1ldGEuZGVsLmRlbHNlcSk7XG4gICAgfVxuICAgIGlmIChtZXRhLnRhZ3MpIHtcbiAgICAgIHRoaXMuX3Byb2Nlc3NNZXRhVGFncyhtZXRhLnRhZ3MpO1xuICAgIH1cbiAgICBpZiAobWV0YS5jcmVkKSB7XG4gICAgICB0aGlzLl9wcm9jZXNzTWV0YUNyZWRzKG1ldGEuY3JlZCk7XG4gICAgfVxuICAgIGlmICh0aGlzLm9uTWV0YSkge1xuICAgICAgdGhpcy5vbk1ldGEobWV0YSk7XG4gICAgfVxuICB9XG4gIC8vIFByb2Nlc3MgcHJlc2VuY2UgY2hhbmdlIG1lc3NhZ2VcbiAgX3JvdXRlUHJlcyhwcmVzKSB7XG4gICAgbGV0IHVzZXIsIHVpZDtcbiAgICBzd2l0Y2ggKHByZXMud2hhdCkge1xuICAgICAgY2FzZSAnZGVsJzpcbiAgICAgICAgLy8gRGVsZXRlIGNhY2hlZCBtZXNzYWdlcy5cbiAgICAgICAgdGhpcy5fcHJvY2Vzc0RlbE1lc3NhZ2VzKHByZXMuY2xlYXIsIHByZXMuZGVsc2VxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdvbic6XG4gICAgICBjYXNlICdvZmYnOlxuICAgICAgICAvLyBVcGRhdGUgb25saW5lIHN0YXR1cyBvZiBhIHN1YnNjcmlwdGlvbi5cbiAgICAgICAgdXNlciA9IHRoaXMuX3VzZXJzW3ByZXMuc3JjXTtcbiAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICB1c2VyLm9ubGluZSA9IHByZXMud2hhdCA9PSAnb24nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3Rpbm9kZS5sb2dnZXIoXCJXQVJOSU5HOiBQcmVzZW5jZSB1cGRhdGUgZm9yIGFuIHVua25vd24gdXNlclwiLCB0aGlzLm5hbWUsIHByZXMuc3JjKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Rlcm0nOlxuICAgICAgICAvLyBBdHRhY2htZW50IHRvIHRvcGljIGlzIHRlcm1pbmF0ZWQgcHJvYmFibHkgZHVlIHRvIGNsdXN0ZXIgcmVoYXNoaW5nLlxuICAgICAgICB0aGlzLl9yZXNldFN1YigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3VwZCc6XG4gICAgICAgIC8vIEEgdG9waWMgc3Vic2NyaWJlciBoYXMgdXBkYXRlZCBoaXMgZGVzY3JpcHRpb24uXG4gICAgICAgIC8vIElzc3VlIHtnZXQgc3VifSBvbmx5IGlmIHRoZSBjdXJyZW50IHVzZXIgaGFzIG5vIHAycCB0b3BpY3Mgd2l0aCB0aGUgdXBkYXRlZCB1c2VyIChwMnAgbmFtZSBpcyBub3QgaW4gY2FjaGUpLlxuICAgICAgICAvLyBPdGhlcndpc2UgJ21lJyB3aWxsIGlzc3VlIGEge2dldCBkZXNjfSByZXF1ZXN0LlxuICAgICAgICBpZiAocHJlcy5zcmMgJiYgIXRoaXMuX3Rpbm9kZS5pc1RvcGljQ2FjaGVkKHByZXMuc3JjKSkge1xuICAgICAgICAgIHRoaXMuZ2V0TWV0YSh0aGlzLnN0YXJ0TWV0YVF1ZXJ5KCkud2l0aExhdGVyT25lU3ViKHByZXMuc3JjKS5idWlsZCgpKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Fjcyc6XG4gICAgICAgIHVpZCA9IHByZXMuc3JjIHx8IHRoaXMuX3Rpbm9kZS5nZXRDdXJyZW50VXNlcklEKCk7XG4gICAgICAgIHVzZXIgPSB0aGlzLl91c2Vyc1t1aWRdO1xuICAgICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgICAvLyBVcGRhdGUgZm9yIGFuIHVua25vd24gdXNlcjogbm90aWZpY2F0aW9uIG9mIGEgbmV3IHN1YnNjcmlwdGlvbi5cbiAgICAgICAgICBjb25zdCBhY3MgPSBuZXcgQWNjZXNzTW9kZSgpLnVwZGF0ZUFsbChwcmVzLmRhY3MpO1xuICAgICAgICAgIGlmIChhY3MgJiYgYWNzLm1vZGUgIT0gQWNjZXNzTW9kZS5fTk9ORSkge1xuICAgICAgICAgICAgdXNlciA9IHRoaXMuX2NhY2hlR2V0VXNlcih1aWQpO1xuICAgICAgICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgICAgICAgIHVzZXIgPSB7XG4gICAgICAgICAgICAgICAgdXNlcjogdWlkLFxuICAgICAgICAgICAgICAgIGFjczogYWNzXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHRoaXMuZ2V0TWV0YSh0aGlzLnN0YXJ0TWV0YVF1ZXJ5KCkud2l0aE9uZVN1Yih1bmRlZmluZWQsIHVpZCkuYnVpbGQoKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB1c2VyLmFjcyA9IGFjcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZXIudXBkYXRlZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICB0aGlzLl9wcm9jZXNzTWV0YVN1YihbdXNlcl0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBLbm93biB1c2VyXG4gICAgICAgICAgdXNlci5hY3MudXBkYXRlQWxsKHByZXMuZGFjcyk7XG4gICAgICAgICAgLy8gVXBkYXRlIHVzZXIncyBhY2Nlc3MgbW9kZS5cbiAgICAgICAgICB0aGlzLl9wcm9jZXNzTWV0YVN1Yihbe1xuICAgICAgICAgICAgdXNlcjogdWlkLFxuICAgICAgICAgICAgdXBkYXRlZDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIGFjczogdXNlci5hY3NcbiAgICAgICAgICB9XSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLl90aW5vZGUubG9nZ2VyKFwiSU5GTzogSWdub3JlZCBwcmVzZW5jZSB1cGRhdGVcIiwgcHJlcy53aGF0KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vblByZXMpIHtcbiAgICAgIHRoaXMub25QcmVzKHByZXMpO1xuICAgIH1cbiAgfVxuICAvLyBQcm9jZXNzIHtpbmZvfSBtZXNzYWdlXG4gIF9yb3V0ZUluZm8oaW5mbykge1xuICAgIGlmIChpbmZvLndoYXQgIT09ICdrcCcpIHtcbiAgICAgIGNvbnN0IHVzZXIgPSB0aGlzLl91c2Vyc1tpbmZvLmZyb21dO1xuICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgdXNlcltpbmZvLndoYXRdID0gaW5mby5zZXE7XG4gICAgICAgIGlmICh1c2VyLnJlY3YgPCB1c2VyLnJlYWQpIHtcbiAgICAgICAgICB1c2VyLnJlY3YgPSB1c2VyLnJlYWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IG1zZyA9IHRoaXMubGF0ZXN0TWVzc2FnZSgpO1xuICAgICAgaWYgKG1zZykge1xuICAgICAgICB0aGlzLm1zZ1N0YXR1cyhtc2csIHRydWUpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGlzIGlzIGFuIHVwZGF0ZSBmcm9tIHRoZSBjdXJyZW50IHVzZXIsIHVwZGF0ZSB0aGUgY2FjaGUgd2l0aCB0aGUgbmV3IGNvdW50LlxuICAgICAgaWYgKHRoaXMuX3Rpbm9kZS5pc01lKGluZm8uZnJvbSkpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlUmVhZFJlY3YoaW5mby53aGF0LCBpbmZvLnNlcSk7XG4gICAgICB9XG5cbiAgICAgIC8vIE5vdGlmeSAnbWUnIGxpc3RlbmVyIG9mIHRoZSBzdGF0dXMgY2hhbmdlLlxuICAgICAgdGhpcy5fdGlub2RlLmdldE1lVG9waWMoKS5fcmVmcmVzaENvbnRhY3QoaW5mby53aGF0LCB0aGlzKTtcbiAgICB9XG4gICAgaWYgKHRoaXMub25JbmZvKSB7XG4gICAgICB0aGlzLm9uSW5mbyhpbmZvKTtcbiAgICB9XG4gIH1cbiAgLy8gQ2FsbGVkIGJ5IFRpbm9kZSB3aGVuIG1ldGEuZGVzYyBwYWNrZXQgaXMgcmVjZWl2ZWQuXG4gIC8vIENhbGxlZCBieSAnbWUnIHRvcGljIG9uIGNvbnRhY3QgdXBkYXRlIChkZXNjLl9ub0ZvcndhcmRpbmcgaXMgdHJ1ZSkuXG4gIF9wcm9jZXNzTWV0YURlc2MoZGVzYykge1xuICAgIGlmICh0aGlzLmlzUDJQVHlwZSgpKSB7XG4gICAgICAvLyBTeW50aGV0aWMgZGVzYyBtYXkgaW5jbHVkZSBkZWZhY3MgZm9yIHAycCB0b3BpY3Mgd2hpY2ggaXMgdXNlbGVzcy5cbiAgICAgIC8vIFJlbW92ZSBpdC5cbiAgICAgIGRlbGV0ZSBkZXNjLmRlZmFjcztcblxuICAgICAgLy8gVXBkYXRlIHRvIHAycCBkZXNjIGlzIHRoZSBzYW1lIGFzIHVzZXIgdXBkYXRlLiBVcGRhdGUgY2FjaGVkIHVzZXIuXG4gICAgICB0aGlzLl90aW5vZGUuX2RiLnVwZFVzZXIodGhpcy5uYW1lLCBkZXNjLnB1YmxpYyk7XG4gICAgfVxuXG4gICAgLy8gQ29weSBwYXJhbWV0ZXJzIGZyb20gZGVzYyBvYmplY3QgdG8gdGhpcyB0b3BpYy5cbiAgICBtZXJnZU9iaih0aGlzLCBkZXNjKTtcbiAgICAvLyBVcGRhdGUgcGVyc2lzdGVudCBjYWNoZS5cbiAgICB0aGlzLl90aW5vZGUuX2RiLnVwZFRvcGljKHRoaXMpO1xuXG4gICAgLy8gTm90aWZ5ICdtZScgbGlzdGVuZXIsIGlmIGF2YWlsYWJsZTpcbiAgICBpZiAodGhpcy5uYW1lICE9PSBDb25zdC5UT1BJQ19NRSAmJiAhZGVzYy5fbm9Gb3J3YXJkaW5nKSB7XG4gICAgICBjb25zdCBtZSA9IHRoaXMuX3Rpbm9kZS5nZXRNZVRvcGljKCk7XG4gICAgICBpZiAobWUub25NZXRhU3ViKSB7XG4gICAgICAgIG1lLm9uTWV0YVN1Yih0aGlzKTtcbiAgICAgIH1cbiAgICAgIGlmIChtZS5vblN1YnNVcGRhdGVkKSB7XG4gICAgICAgIG1lLm9uU3Vic1VwZGF0ZWQoW3RoaXMubmFtZV0sIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLm9uTWV0YURlc2MpIHtcbiAgICAgIHRoaXMub25NZXRhRGVzYyh0aGlzKTtcbiAgICB9XG4gIH1cbiAgLy8gQ2FsbGVkIGJ5IFRpbm9kZSB3aGVuIG1ldGEuc3ViIGlzIHJlY2l2ZWQgb3IgaW4gcmVzcG9uc2UgdG8gcmVjZWl2ZWRcbiAgLy8ge2N0cmx9IGFmdGVyIHNldE1ldGEtc3ViLlxuICBfcHJvY2Vzc01ldGFTdWIoc3Vicykge1xuICAgIGZvciAobGV0IGlkeCBpbiBzdWJzKSB7XG4gICAgICBjb25zdCBzdWIgPSBzdWJzW2lkeF07XG5cbiAgICAgIC8vIEZpbGwgZGVmYXVsdHMuXG4gICAgICBzdWIub25saW5lID0gISFzdWIub25saW5lO1xuICAgICAgLy8gVXBkYXRlIHRpbWVzdGFtcCBvZiB0aGUgbW9zdCByZWNlbnQgc3Vic2NyaXB0aW9uIHVwZGF0ZS5cbiAgICAgIHRoaXMuX2xhc3RTdWJzVXBkYXRlID0gbmV3IERhdGUoTWF0aC5tYXgodGhpcy5fbGFzdFN1YnNVcGRhdGUsIHN1Yi51cGRhdGVkKSk7XG5cbiAgICAgIGxldCB1c2VyID0gbnVsbDtcbiAgICAgIGlmICghc3ViLmRlbGV0ZWQpIHtcbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIGNoYW5nZSB0byB1c2VyJ3Mgb3duIHBlcm1pc3Npb25zLCB1cGRhdGUgdGhlbSBpbiB0b3BpYyB0b28uXG4gICAgICAgIC8vIERlc2Mgd2lsbCB1cGRhdGUgJ21lJyB0b3BpYy5cbiAgICAgICAgaWYgKHRoaXMuX3Rpbm9kZS5pc01lKHN1Yi51c2VyKSAmJiBzdWIuYWNzKSB7XG4gICAgICAgICAgdGhpcy5fcHJvY2Vzc01ldGFEZXNjKHtcbiAgICAgICAgICAgIHVwZGF0ZWQ6IHN1Yi51cGRhdGVkLFxuICAgICAgICAgICAgdG91Y2hlZDogc3ViLnRvdWNoZWQsXG4gICAgICAgICAgICBhY3M6IHN1Yi5hY3NcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB1c2VyID0gdGhpcy5fdXBkYXRlQ2FjaGVkVXNlcihzdWIudXNlciwgc3ViKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFN1YnNjcmlwdGlvbiBpcyBkZWxldGVkLCByZW1vdmUgaXQgZnJvbSB0b3BpYyAoYnV0IGxlYXZlIGluIFVzZXJzIGNhY2hlKVxuICAgICAgICBkZWxldGUgdGhpcy5fdXNlcnNbc3ViLnVzZXJdO1xuICAgICAgICB1c2VyID0gc3ViO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vbk1ldGFTdWIpIHtcbiAgICAgICAgdGhpcy5vbk1ldGFTdWIodXNlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub25TdWJzVXBkYXRlZCkge1xuICAgICAgdGhpcy5vblN1YnNVcGRhdGVkKE9iamVjdC5rZXlzKHRoaXMuX3VzZXJzKSk7XG4gICAgfVxuICB9XG4gIC8vIENhbGxlZCBieSBUaW5vZGUgd2hlbiBtZXRhLnRhZ3MgaXMgcmVjaXZlZC5cbiAgX3Byb2Nlc3NNZXRhVGFncyh0YWdzKSB7XG4gICAgaWYgKHRhZ3MubGVuZ3RoID09IDEgJiYgdGFnc1swXSA9PSBDb25zdC5ERUxfQ0hBUikge1xuICAgICAgdGFncyA9IFtdO1xuICAgIH1cbiAgICB0aGlzLl90YWdzID0gdGFncztcbiAgICBpZiAodGhpcy5vblRhZ3NVcGRhdGVkKSB7XG4gICAgICB0aGlzLm9uVGFnc1VwZGF0ZWQodGFncyk7XG4gICAgfVxuICB9XG4gIC8vIERvIG5vdGhpbmcgZm9yIHRvcGljcyBvdGhlciB0aGFuICdtZSdcbiAgX3Byb2Nlc3NNZXRhQ3JlZHMoY3JlZHMpIHt9XG4gIC8vIERlbGV0ZSBjYWNoZWQgbWVzc2FnZXMgYW5kIHVwZGF0ZSBjYWNoZWQgdHJhbnNhY3Rpb24gSURzXG4gIF9wcm9jZXNzRGVsTWVzc2FnZXMoY2xlYXIsIGRlbHNlcSkge1xuICAgIHRoaXMuX21heERlbCA9IE1hdGgubWF4KGNsZWFyLCB0aGlzLl9tYXhEZWwpO1xuICAgIHRoaXMuY2xlYXIgPSBNYXRoLm1heChjbGVhciwgdGhpcy5jbGVhcik7XG4gICAgY29uc3QgdG9waWMgPSB0aGlzO1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZGVsc2VxKSkge1xuICAgICAgZGVsc2VxLmZvckVhY2goZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICAgICAgaWYgKCFyYW5nZS5oaSkge1xuICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgdG9waWMuZmx1c2hNZXNzYWdlKHJhbmdlLmxvdyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IHJhbmdlLmxvdzsgaSA8IHJhbmdlLmhpOyBpKyspIHtcbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICB0b3BpYy5mbHVzaE1lc3NhZ2UoaSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoY291bnQgPiAwKSB7XG4gICAgICB0aGlzLl91cGRhdGVEZWxldGVkUmFuZ2VzKCk7XG5cbiAgICAgIGlmICh0aGlzLm9uRGF0YSkge1xuICAgICAgICB0aGlzLm9uRGF0YSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBUb3BpYyBpcyBpbmZvcm1lZCB0aGF0IHRoZSBlbnRpcmUgcmVzcG9uc2UgdG8ge2dldCB3aGF0PWRhdGF9IGhhcyBiZWVuIHJlY2VpdmVkLlxuICBfYWxsTWVzc2FnZXNSZWNlaXZlZChjb3VudCkge1xuICAgIHRoaXMuX3VwZGF0ZURlbGV0ZWRSYW5nZXMoKTtcblxuICAgIGlmICh0aGlzLm9uQWxsTWVzc2FnZXNSZWNlaXZlZCkge1xuICAgICAgdGhpcy5vbkFsbE1lc3NhZ2VzUmVjZWl2ZWQoY291bnQpO1xuICAgIH1cbiAgfVxuICAvLyBSZXNldCBzdWJzY3JpYmVkIHN0YXRlXG4gIF9yZXNldFN1YigpIHtcbiAgICB0aGlzLl9hdHRhY2hlZCA9IGZhbHNlO1xuICB9XG4gIC8vIFRoaXMgdG9waWMgaXMgZWl0aGVyIGRlbGV0ZWQgb3IgdW5zdWJzY3JpYmVkIGZyb20uXG4gIF9nb25lKCkge1xuICAgIHRoaXMuX21lc3NhZ2VzLnJlc2V0KCk7XG4gICAgdGhpcy5fdGlub2RlLl9kYi5yZW1NZXNzYWdlcyh0aGlzLm5hbWUpO1xuICAgIHRoaXMuX3VzZXJzID0ge307XG4gICAgdGhpcy5hY3MgPSBuZXcgQWNjZXNzTW9kZShudWxsKTtcbiAgICB0aGlzLnByaXZhdGUgPSBudWxsO1xuICAgIHRoaXMucHVibGljID0gbnVsbDtcbiAgICB0aGlzLnRydXN0ZWQgPSBudWxsO1xuICAgIHRoaXMuX21heFNlcSA9IDA7XG4gICAgdGhpcy5fbWluU2VxID0gMDtcbiAgICB0aGlzLl9hdHRhY2hlZCA9IGZhbHNlO1xuXG4gICAgY29uc3QgbWUgPSB0aGlzLl90aW5vZGUuZ2V0TWVUb3BpYygpO1xuICAgIGlmIChtZSkge1xuICAgICAgbWUuX3JvdXRlUHJlcyh7XG4gICAgICAgIF9ub0ZvcndhcmRpbmc6IHRydWUsXG4gICAgICAgIHdoYXQ6ICdnb25lJyxcbiAgICAgICAgdG9waWM6IENvbnN0LlRPUElDX01FLFxuICAgICAgICBzcmM6IHRoaXMubmFtZVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLm9uRGVsZXRlVG9waWMpIHtcbiAgICAgIHRoaXMub25EZWxldGVUb3BpYygpO1xuICAgIH1cbiAgfVxuICAvLyBVcGRhdGUgZ2xvYmFsIHVzZXIgY2FjaGUgYW5kIGxvY2FsIHN1YnNjcmliZXJzIGNhY2hlLlxuICAvLyBEb24ndCBjYWxsIHRoaXMgbWV0aG9kIGZvciBub24tc3Vic2NyaWJlcnMuXG4gIF91cGRhdGVDYWNoZWRVc2VyKHVpZCwgb2JqKSB7XG4gICAgLy8gRmV0Y2ggdXNlciBvYmplY3QgZnJvbSB0aGUgZ2xvYmFsIGNhY2hlLlxuICAgIC8vIFRoaXMgaXMgYSBjbG9uZSBvZiB0aGUgc3RvcmVkIG9iamVjdFxuICAgIGxldCBjYWNoZWQgPSB0aGlzLl9jYWNoZUdldFVzZXIodWlkKTtcbiAgICBjYWNoZWQgPSBtZXJnZU9iaihjYWNoZWQgfHwge30sIG9iaik7XG4gICAgLy8gU2F2ZSB0byBnbG9iYWwgY2FjaGVcbiAgICB0aGlzLl9jYWNoZVB1dFVzZXIodWlkLCBjYWNoZWQpO1xuICAgIC8vIFNhdmUgdG8gdGhlIGxpc3Qgb2YgdG9waWMgc3Vic3JpYmVycy5cbiAgICByZXR1cm4gbWVyZ2VUb0NhY2hlKHRoaXMuX3VzZXJzLCB1aWQsIGNhY2hlZCk7XG4gIH1cbiAgLy8gR2V0IGxvY2FsIHNlcUlkIGZvciBhIHF1ZXVlZCBtZXNzYWdlLlxuICBfZ2V0UXVldWVkU2VxSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3F1ZXVlZFNlcUlkKys7XG4gIH1cbiAgLy8gQ2FsY3VsYXRlIHJhbmdlcyBvZiBtaXNzaW5nIG1lc3NhZ2VzLlxuICBfdXBkYXRlRGVsZXRlZFJhbmdlcygpIHtcbiAgICBjb25zdCByYW5nZXMgPSBbXTtcblxuICAgIC8vIEdhcCBtYXJrZXIsIHBvc3NpYmx5IGVtcHR5LlxuICAgIGxldCBwcmV2ID0gbnVsbDtcblxuICAgIC8vIENoZWNrIGZvciBnYXAgaW4gdGhlIGJlZ2lubmluZywgYmVmb3JlIHRoZSBmaXJzdCBtZXNzYWdlLlxuICAgIGNvbnN0IGZpcnN0ID0gdGhpcy5fbWVzc2FnZXMuZ2V0QXQoMCk7XG4gICAgaWYgKGZpcnN0ICYmIHRoaXMuX21pblNlcSA+IDEgJiYgIXRoaXMuX25vRWFybGllck1zZ3MpIHtcbiAgICAgIC8vIFNvbWUgbWVzc2FnZXMgYXJlIG1pc3NpbmcgaW4gdGhlIGJlZ2lubmluZy5cbiAgICAgIGlmIChmaXJzdC5oaSkge1xuICAgICAgICAvLyBUaGUgZmlyc3QgbWVzc2FnZSBhbHJlYWR5IHJlcHJlc2VudHMgYSBnYXAuXG4gICAgICAgIGlmIChmaXJzdC5zZXEgPiAxKSB7XG4gICAgICAgICAgZmlyc3Quc2VxID0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlyc3QuaGkgPCB0aGlzLl9taW5TZXEgLSAxKSB7XG4gICAgICAgICAgZmlyc3QuaGkgPSB0aGlzLl9taW5TZXEgLSAxO1xuICAgICAgICB9XG4gICAgICAgIHByZXYgPSBmaXJzdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIENyZWF0ZSBuZXcgZ2FwLlxuICAgICAgICBwcmV2ID0ge1xuICAgICAgICAgIHNlcTogMSxcbiAgICAgICAgICBoaTogdGhpcy5fbWluU2VxIC0gMVxuICAgICAgICB9O1xuICAgICAgICByYW5nZXMucHVzaChwcmV2KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm8gZ2FwIGluIHRoZSBiZWdpbm5pbmcuXG4gICAgICBwcmV2ID0ge1xuICAgICAgICBzZXE6IDAsXG4gICAgICAgIGhpOiAwXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEZpbmQgbmV3IGdhcHMgaW4gdGhlIGxpc3Qgb2YgcmVjZWl2ZWQgbWVzc2FnZXMuIFRoZSBsaXN0IGNvbnRhaW5zIG1lc3NhZ2VzLXByb3BlciBhcyB3ZWxsXG4gICAgLy8gYXMgcGxhY2Vob2xkZXJzIGZvciBkZWxldGVkIHJhbmdlcy5cbiAgICAvLyBUaGUgbWVzc2FnZXMgYXJlIGl0ZXJhdGVkIGJ5IHNlcSBJRCBpbiBhc2NlbmRpbmcgb3JkZXIuXG4gICAgdGhpcy5fbWVzc2FnZXMuZmlsdGVyKChkYXRhKSA9PiB7XG4gICAgICAvLyBEbyBub3QgY3JlYXRlIGEgZ2FwIGJldHdlZW4gdGhlIGxhc3Qgc2VudCBtZXNzYWdlIGFuZCB0aGUgZmlyc3QgdW5zZW50IGFzIHdlbGwgYXMgYmV0d2VlbiB1bnNlbnQgbWVzc2FnZXMuXG4gICAgICBpZiAoZGF0YS5zZXEgPj0gQ29uc3QuTE9DQUxfU0VRSUQpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGZvciBhIGdhcCBiZXR3ZWVuIHRoZSBwcmV2aW91cyBtZXNzYWdlL21hcmtlciBhbmQgdGhpcyBtZXNzYWdlL21hcmtlci5cbiAgICAgIGlmIChkYXRhLnNlcSA9PSAocHJldi5oaSB8fCBwcmV2LnNlcSkgKyAxKSB7XG4gICAgICAgIC8vIE5vIGdhcCBiZXR3ZWVuIHRoaXMgbWVzc2FnZSBhbmQgdGhlIHByZXZpb3VzLlxuICAgICAgICBpZiAoZGF0YS5oaSAmJiBwcmV2LmhpKSB7XG4gICAgICAgICAgLy8gVHdvIGdhcCBtYXJrZXJzIGluIGEgcm93LiBFeHRlbmQgdGhlIHByZXZpb3VzIG9uZSwgZGlzY2FyZCB0aGUgY3VycmVudC5cbiAgICAgICAgICBwcmV2LmhpID0gZGF0YS5oaTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcHJldiA9IGRhdGE7XG5cbiAgICAgICAgLy8gS2VlcCBjdXJyZW50LlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gRm91bmQgYSBuZXcgZ2FwLlxuICAgICAgLy8gQ2hlY2sgaWYgdGhlIHByZXZpb3VzIGlzIGFsc28gYSBnYXAgbWFya2VyLlxuICAgICAgaWYgKHByZXYuaGkpIHtcbiAgICAgICAgLy8gQWx0ZXIgaXQgaW5zdGVhZCBvZiBjcmVhdGluZyBhIG5ldyBvbmUuXG4gICAgICAgIHByZXYuaGkgPSBkYXRhLmhpIHx8IGRhdGEuc2VxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gUHJldmlvdXMgaXMgbm90IGEgZ2FwIG1hcmtlci4gQ3JlYXRlIGEgbmV3IG9uZS5cbiAgICAgICAgcHJldiA9IHtcbiAgICAgICAgICBzZXE6IHByZXYuc2VxICsgMSxcbiAgICAgICAgICBoaTogZGF0YS5oaSB8fCBkYXRhLnNlcVxuICAgICAgICB9O1xuICAgICAgICByYW5nZXMucHVzaChwcmV2KTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgbWFya2VyLCByZW1vdmU7IGtlZXAgaWYgcmVndWxhciBtZXNzYWdlLlxuICAgICAgaWYgKCFkYXRhLmhpKSB7XG4gICAgICAgIC8vIEtlZXBpbmcgdGhlIGN1cnJlbnQgcmVndWxhciBtZXNzYWdlLCBzYXZlIGl0IGFzIHByZXZpb3VzLlxuICAgICAgICBwcmV2ID0gZGF0YTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIERpc2NhcmQgdGhlIGN1cnJlbnQgZ2FwIG1hcmtlcjogd2UgZWl0aGVyIGNyZWF0ZWQgYW4gZWFybGllciBnYXAsIG9yIGV4dGVuZGVkIHRoZSBwcmV2b3VzIG9uZS5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuICAgIC8vIENoZWNrIGZvciBtaXNzaW5nIG1lc3NhZ2VzIGF0IHRoZSBlbmQuXG4gICAgLy8gQWxsIG1lc3NhZ2VzIGNvdWxkIGJlIG1pc3Npbmcgb3IgaXQgY291bGQgYmUgYSBuZXcgdG9waWMgd2l0aCBubyBtZXNzYWdlcy5cbiAgICBjb25zdCBsYXN0ID0gdGhpcy5fbWVzc2FnZXMuZ2V0TGFzdCgpO1xuICAgIGNvbnN0IG1heFNlcSA9IE1hdGgubWF4KHRoaXMuc2VxLCB0aGlzLl9tYXhTZXEpIHx8IDA7XG4gICAgaWYgKChtYXhTZXEgPiAwICYmICFsYXN0KSB8fCAobGFzdCAmJiAoKGxhc3QuaGkgfHwgbGFzdC5zZXEpIDwgbWF4U2VxKSkpIHtcbiAgICAgIGlmIChsYXN0ICYmIGxhc3QuaGkpIHtcbiAgICAgICAgLy8gRXh0ZW5kIGV4aXN0aW5nIGdhcFxuICAgICAgICBsYXN0LmhpID0gbWF4U2VxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ3JlYXRlIG5ldyBnYXAuXG4gICAgICAgIHJhbmdlcy5wdXNoKHtcbiAgICAgICAgICBzZXE6IGxhc3QgPyBsYXN0LnNlcSArIDEgOiAxLFxuICAgICAgICAgIGhpOiBtYXhTZXFcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW5zZXJ0IG5ldyBnYXBzIGludG8gY2FjaGUuXG4gICAgcmFuZ2VzLmZvckVhY2goKGdhcCkgPT4ge1xuICAgICAgZ2FwLl9zdGF0dXMgPSBDb25zdC5NRVNTQUdFX1NUQVRVU19ERUxfUkFOR0U7XG4gICAgICB0aGlzLl9tZXNzYWdlcy5wdXQoZ2FwKTtcbiAgICB9KTtcbiAgfVxuICAvLyBMb2FkIG1vc3QgcmVjZW50IG1lc3NhZ2VzIGZyb20gcGVyc2lzdGVudCBjYWNoZS5cbiAgX2xvYWRNZXNzYWdlcyhkYiwgcGFyYW1zKSB7XG4gICAgY29uc3Qge1xuICAgICAgc2luY2UsXG4gICAgICBiZWZvcmUsXG4gICAgICBsaW1pdFxuICAgIH0gPSBwYXJhbXMgfHwge307XG4gICAgcmV0dXJuIGRiLnJlYWRNZXNzYWdlcyh0aGlzLm5hbWUsIHtcbiAgICAgICAgc2luY2U6IHNpbmNlLFxuICAgICAgICBiZWZvcmU6IGJlZm9yZSxcbiAgICAgICAgbGltaXQ6IGxpbWl0IHx8IENvbnN0LkRFRkFVTFRfTUVTU0FHRVNfUEFHRVxuICAgICAgfSlcbiAgICAgIC50aGVuKChtc2dzKSA9PiB7XG4gICAgICAgIG1zZ3MuZm9yRWFjaCgoZGF0YSkgPT4ge1xuICAgICAgICAgIGlmIChkYXRhLnNlcSA+IHRoaXMuX21heFNlcSkge1xuICAgICAgICAgICAgdGhpcy5fbWF4U2VxID0gZGF0YS5zZXE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChkYXRhLnNlcSA8IHRoaXMuX21pblNlcSB8fCB0aGlzLl9taW5TZXEgPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fbWluU2VxID0gZGF0YS5zZXE7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1dChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChtc2dzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB0aGlzLl91cGRhdGVEZWxldGVkUmFuZ2VzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1zZ3MubGVuZ3RoO1xuICAgICAgfSk7XG4gIH1cbiAgLy8gUHVzaCBvciB7cHJlc306IG1lc3NhZ2UgcmVjZWl2ZWQuXG4gIF91cGRhdGVSZWNlaXZlZChzZXEsIGFjdCkge1xuICAgIHRoaXMudG91Y2hlZCA9IG5ldyBEYXRlKCk7XG4gICAgdGhpcy5zZXEgPSBzZXEgfCAwO1xuICAgIC8vIENoZWNrIGlmIG1lc3NhZ2UgaXMgc2VudCBieSB0aGUgY3VycmVudCB1c2VyLiBJZiBzbyBpdCdzIGJlZW4gcmVhZCBhbHJlYWR5LlxuICAgIGlmICghYWN0IHx8IHRoaXMuX3Rpbm9kZS5pc01lKGFjdCkpIHtcbiAgICAgIHRoaXMucmVhZCA9IHRoaXMucmVhZCA/IE1hdGgubWF4KHRoaXMucmVhZCwgdGhpcy5zZXEpIDogdGhpcy5zZXE7XG4gICAgICB0aGlzLnJlY3YgPSB0aGlzLnJlY3YgPyBNYXRoLm1heCh0aGlzLnJlYWQsIHRoaXMucmVjdikgOiB0aGlzLnJlYWQ7XG4gICAgfVxuICAgIHRoaXMudW5yZWFkID0gdGhpcy5zZXEgLSAodGhpcy5yZWFkIHwgMCk7XG4gICAgdGhpcy5fdGlub2RlLl9kYi51cGRUb3BpYyh0aGlzKTtcbiAgfVxufVxuXG5cbi8qKlxuICogQGNsYXNzIFRvcGljTWUgLSBzcGVjaWFsIGNhc2Ugb2Yge0BsaW5rIFRpbm9kZS5Ub3BpY30gZm9yXG4gKiBtYW5hZ2luZyBkYXRhIG9mIHRoZSBjdXJyZW50IHVzZXIsIGluY2x1ZGluZyBjb250YWN0IGxpc3QuXG4gKiBAZXh0ZW5kcyBUaW5vZGUuVG9waWNcbiAqIEBtZW1iZXJvZiBUaW5vZGVcbiAqXG4gKiBAcGFyYW0ge1RvcGljTWUuQ2FsbGJhY2tzfSBjYWxsYmFja3MgLSBDYWxsYmFja3MgdG8gcmVjZWl2ZSB2YXJpb3VzIGV2ZW50cy5cbiAqL1xuLyoqXG4gKiBAY2xhc3MgVG9waWNNZSAtIHNwZWNpYWwgY2FzZSBvZiB7QGxpbmsgVGlub2RlLlRvcGljfSBmb3JcbiAqIG1hbmFnaW5nIGRhdGEgb2YgdGhlIGN1cnJlbnQgdXNlciwgaW5jbHVkaW5nIGNvbnRhY3QgbGlzdC5cbiAqIEBleHRlbmRzIFRpbm9kZS5Ub3BpY1xuICogQG1lbWJlcm9mIFRpbm9kZVxuICpcbiAqIEBwYXJhbSB7VG9waWNNZS5DYWxsYmFja3N9IGNhbGxiYWNrcyAtIENhbGxiYWNrcyB0byByZWNlaXZlIHZhcmlvdXMgZXZlbnRzLlxuICovXG5leHBvcnQgY2xhc3MgVG9waWNNZSBleHRlbmRzIFRvcGljIHtcbiAgb25Db250YWN0VXBkYXRlO1xuXG4gIGNvbnN0cnVjdG9yKGNhbGxiYWNrcykge1xuICAgIHN1cGVyKENvbnN0LlRPUElDX01FLCBjYWxsYmFja3MpO1xuXG4gICAgLy8gbWUtc3BlY2lmaWMgY2FsbGJhY2tzXG4gICAgaWYgKGNhbGxiYWNrcykge1xuICAgICAgdGhpcy5vbkNvbnRhY3RVcGRhdGUgPSBjYWxsYmFja3Mub25Db250YWN0VXBkYXRlO1xuICAgIH1cbiAgfVxuXG4gIC8vIE92ZXJyaWRlIHRoZSBvcmlnaW5hbCBUb3BpYy5fcHJvY2Vzc01ldGFEZXNjLlxuICBfcHJvY2Vzc01ldGFEZXNjKGRlc2MpIHtcbiAgICAvLyBDaGVjayBpZiBvbmxpbmUgY29udGFjdHMgbmVlZCB0byBiZSB0dXJuZWQgb2ZmIGJlY2F1c2UgUCBwZXJtaXNzaW9uIHdhcyByZW1vdmVkLlxuICAgIGNvbnN0IHR1cm5PZmYgPSAoZGVzYy5hY3MgJiYgIWRlc2MuYWNzLmlzUHJlc2VuY2VyKCkpICYmICh0aGlzLmFjcyAmJiB0aGlzLmFjcy5pc1ByZXNlbmNlcigpKTtcblxuICAgIC8vIENvcHkgcGFyYW1ldGVycyBmcm9tIGRlc2Mgb2JqZWN0IHRvIHRoaXMgdG9waWMuXG4gICAgbWVyZ2VPYmoodGhpcywgZGVzYyk7XG4gICAgdGhpcy5fdGlub2RlLl9kYi51cGRUb3BpYyh0aGlzKTtcbiAgICAvLyBVcGRhdGUgY3VycmVudCB1c2VyJ3MgcmVjb3JkIGluIHRoZSBnbG9iYWwgY2FjaGUuXG4gICAgdGhpcy5fdXBkYXRlQ2FjaGVkVXNlcih0aGlzLl90aW5vZGUuX215VUlELCBkZXNjKTtcblxuICAgIC8vICdQJyBwZXJtaXNzaW9uIHdhcyByZW1vdmVkLiBBbGwgdG9waWNzIGFyZSBvZmZsaW5lIG5vdy5cbiAgICBpZiAodHVybk9mZikge1xuICAgICAgdGhpcy5fdGlub2RlLm1hcFRvcGljcygoY29udCkgPT4ge1xuICAgICAgICBpZiAoY29udC5vbmxpbmUpIHtcbiAgICAgICAgICBjb250Lm9ubGluZSA9IGZhbHNlO1xuICAgICAgICAgIGNvbnQuc2VlbiA9IE9iamVjdC5hc3NpZ24oY29udC5zZWVuIHx8IHt9LCB7XG4gICAgICAgICAgICB3aGVuOiBuZXcgRGF0ZSgpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5fcmVmcmVzaENvbnRhY3QoJ29mZicsIGNvbnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vbk1ldGFEZXNjKSB7XG4gICAgICB0aGlzLm9uTWV0YURlc2ModGhpcyk7XG4gICAgfVxuICB9XG5cbiAgLy8gT3ZlcnJpZGUgdGhlIG9yaWdpbmFsIFRvcGljLl9wcm9jZXNzTWV0YVN1YlxuICBfcHJvY2Vzc01ldGFTdWIoc3Vicykge1xuICAgIGxldCB1cGRhdGVDb3VudCA9IDA7XG4gICAgc3Vicy5mb3JFYWNoKChzdWIpID0+IHtcbiAgICAgIGNvbnN0IHRvcGljTmFtZSA9IHN1Yi50b3BpYztcbiAgICAgIC8vIERvbid0IHNob3cgJ21lJyBhbmQgJ2ZuZCcgdG9waWNzIGluIHRoZSBsaXN0IG9mIGNvbnRhY3RzLlxuICAgICAgaWYgKHRvcGljTmFtZSA9PSBDb25zdC5UT1BJQ19GTkQgfHwgdG9waWNOYW1lID09IENvbnN0LlRPUElDX01FKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHN1Yi5vbmxpbmUgPSAhIXN1Yi5vbmxpbmU7XG5cbiAgICAgIGxldCBjb250ID0gbnVsbDtcbiAgICAgIGlmIChzdWIuZGVsZXRlZCkge1xuICAgICAgICBjb250ID0gc3ViO1xuICAgICAgICB0aGlzLl90aW5vZGUuY2FjaGVSZW1Ub3BpYyh0b3BpY05hbWUpO1xuICAgICAgICB0aGlzLl90aW5vZGUuX2RiLnJlbVRvcGljKHRvcGljTmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBFbnN1cmUgdGhlIHZhbHVlcyBhcmUgZGVmaW5lZCBhbmQgYXJlIGludGVnZXJzLlxuICAgICAgICBpZiAodHlwZW9mIHN1Yi5zZXEgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBzdWIuc2VxID0gc3ViLnNlcSB8IDA7XG4gICAgICAgICAgc3ViLnJlY3YgPSBzdWIucmVjdiB8IDA7XG4gICAgICAgICAgc3ViLnJlYWQgPSBzdWIucmVhZCB8IDA7XG4gICAgICAgICAgc3ViLnVucmVhZCA9IHN1Yi5zZXEgLSBzdWIucmVhZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRvcGljID0gdGhpcy5fdGlub2RlLmdldFRvcGljKHRvcGljTmFtZSk7XG4gICAgICAgIGNvbnQgPSBtZXJnZU9iaih0b3BpYywgc3ViKTtcbiAgICAgICAgdGhpcy5fdGlub2RlLl9kYi51cGRUb3BpYyhjb250KTtcblxuICAgICAgICBpZiAoVG9waWMuaXNQMlBUb3BpY05hbWUodG9waWNOYW1lKSkge1xuICAgICAgICAgIHRoaXMuX2NhY2hlUHV0VXNlcih0b3BpY05hbWUsIGNvbnQpO1xuICAgICAgICAgIHRoaXMuX3Rpbm9kZS5fZGIudXBkVXNlcih0b3BpY05hbWUsIGNvbnQucHVibGljKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBOb3RpZnkgdG9waWMgb2YgdGhlIHVwZGF0ZSBpZiBpdCdzIGFuIGV4dGVybmFsIHVwZGF0ZS5cbiAgICAgICAgaWYgKCFzdWIuX25vRm9yd2FyZGluZyAmJiB0b3BpYykge1xuICAgICAgICAgIHN1Yi5fbm9Gb3J3YXJkaW5nID0gdHJ1ZTtcbiAgICAgICAgICB0b3BpYy5fcHJvY2Vzc01ldGFEZXNjKHN1Yik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdXBkYXRlQ291bnQrKztcblxuICAgICAgaWYgKHRoaXMub25NZXRhU3ViKSB7XG4gICAgICAgIHRoaXMub25NZXRhU3ViKGNvbnQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMub25TdWJzVXBkYXRlZCAmJiB1cGRhdGVDb3VudCA+IDApIHtcbiAgICAgIGNvbnN0IGtleXMgPSBbXTtcbiAgICAgIHN1YnMuZm9yRWFjaCgocykgPT4ge1xuICAgICAgICBrZXlzLnB1c2gocy50b3BpYyk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMub25TdWJzVXBkYXRlZChrZXlzLCB1cGRhdGVDb3VudCk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2FsbGVkIGJ5IFRpbm9kZSB3aGVuIG1ldGEuc3ViIGlzIHJlY2l2ZWQuXG4gIF9wcm9jZXNzTWV0YUNyZWRzKGNyZWRzLCB1cGQpIHtcbiAgICBpZiAoY3JlZHMubGVuZ3RoID09IDEgJiYgY3JlZHNbMF0gPT0gQ29uc3QuREVMX0NIQVIpIHtcbiAgICAgIGNyZWRzID0gW107XG4gICAgfVxuICAgIGlmICh1cGQpIHtcbiAgICAgIGNyZWRzLmZvckVhY2goKGNyKSA9PiB7XG4gICAgICAgIGlmIChjci52YWwpIHtcbiAgICAgICAgICAvLyBBZGRpbmcgYSBjcmVkZW50aWFsLlxuICAgICAgICAgIGxldCBpZHggPSB0aGlzLl9jcmVkZW50aWFscy5maW5kSW5kZXgoKGVsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZWwubWV0aCA9PSBjci5tZXRoICYmIGVsLnZhbCA9PSBjci52YWw7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGlkeCA8IDApIHtcbiAgICAgICAgICAgIC8vIE5vdCBmb3VuZC5cbiAgICAgICAgICAgIGlmICghY3IuZG9uZSkge1xuICAgICAgICAgICAgICAvLyBVbmNvbmZpcm1lZCBjcmVkZW50aWFsIHJlcGxhY2VzIHByZXZpb3VzIHVuY29uZmlybWVkIGNyZWRlbnRpYWwgb2YgdGhlIHNhbWUgbWV0aG9kLlxuICAgICAgICAgICAgICBpZHggPSB0aGlzLl9jcmVkZW50aWFscy5maW5kSW5kZXgoKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsLm1ldGggPT0gY3IubWV0aCAmJiAhZWwuZG9uZTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBwcmV2aW91cyB1bmNvbmZpcm1lZCBjcmVkZW50aWFsLlxuICAgICAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9jcmVkZW50aWFscy5wdXNoKGNyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRm91bmQuIE1heWJlIGNoYW5nZSAnZG9uZScgc3RhdHVzLlxuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHNbaWR4XS5kb25lID0gY3IuZG9uZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY3IucmVzcCkge1xuICAgICAgICAgIC8vIEhhbmRsZSBjcmVkZW50aWFsIGNvbmZpcm1hdGlvbi5cbiAgICAgICAgICBjb25zdCBpZHggPSB0aGlzLl9jcmVkZW50aWFscy5maW5kSW5kZXgoKGVsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZWwubWV0aCA9PSBjci5tZXRoICYmICFlbC5kb25lO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHNbaWR4XS5kb25lID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jcmVkZW50aWFscyA9IGNyZWRzO1xuICAgIH1cbiAgICBpZiAodGhpcy5vbkNyZWRzVXBkYXRlZCkge1xuICAgICAgdGhpcy5vbkNyZWRzVXBkYXRlZCh0aGlzLl9jcmVkZW50aWFscyk7XG4gICAgfVxuICB9XG5cbiAgLy8gUHJvY2VzcyBwcmVzZW5jZSBjaGFuZ2UgbWVzc2FnZVxuICBfcm91dGVQcmVzKHByZXMpIHtcbiAgICBpZiAocHJlcy53aGF0ID09ICd0ZXJtJykge1xuICAgICAgLy8gVGhlICdtZScgdG9waWMgaXRzZWxmIGlzIGRldGFjaGVkLiBNYXJrIGFzIHVuc3Vic2NyaWJlZC5cbiAgICAgIHRoaXMuX3Jlc2V0U3ViKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHByZXMud2hhdCA9PSAndXBkJyAmJiBwcmVzLnNyYyA9PSBDb25zdC5UT1BJQ19NRSkge1xuICAgICAgLy8gVXBkYXRlIHRvIG1lJ3MgZGVzY3JpcHRpb24uIFJlcXVlc3QgdXBkYXRlZCB2YWx1ZS5cbiAgICAgIHRoaXMuZ2V0TWV0YSh0aGlzLnN0YXJ0TWV0YVF1ZXJ5KCkud2l0aERlc2MoKS5idWlsZCgpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ID0gdGhpcy5fdGlub2RlLmNhY2hlR2V0VG9waWMocHJlcy5zcmMpO1xuICAgIGlmIChjb250KSB7XG4gICAgICBzd2l0Y2ggKHByZXMud2hhdCkge1xuICAgICAgICBjYXNlICdvbic6IC8vIHRvcGljIGNhbWUgb25saW5lXG4gICAgICAgICAgY29udC5vbmxpbmUgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdvZmYnOiAvLyB0b3BpYyB3ZW50IG9mZmxpbmVcbiAgICAgICAgICBpZiAoY29udC5vbmxpbmUpIHtcbiAgICAgICAgICAgIGNvbnQub25saW5lID0gZmFsc2U7XG4gICAgICAgICAgICBjb250LnNlZW4gPSBPYmplY3QuYXNzaWduKGNvbnQuc2VlbiB8fCB7fSwge1xuICAgICAgICAgICAgICB3aGVuOiBuZXcgRGF0ZSgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21zZyc6IC8vIG5ldyBtZXNzYWdlIHJlY2VpdmVkXG4gICAgICAgICAgY29udC5fdXBkYXRlUmVjZWl2ZWQocHJlcy5zZXEsIHByZXMuYWN0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndXBkJzogLy8gZGVzYyB1cGRhdGVkXG4gICAgICAgICAgLy8gUmVxdWVzdCB1cGRhdGVkIHN1YnNjcmlwdGlvbi5cbiAgICAgICAgICB0aGlzLmdldE1ldGEodGhpcy5zdGFydE1ldGFRdWVyeSgpLndpdGhMYXRlck9uZVN1YihwcmVzLnNyYykuYnVpbGQoKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Fjcyc6IC8vIGFjY2VzcyBtb2RlIGNoYW5nZWRcbiAgICAgICAgICBpZiAoY29udC5hY3MpIHtcbiAgICAgICAgICAgIGNvbnQuYWNzLnVwZGF0ZUFsbChwcmVzLmRhY3MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250LmFjcyA9IG5ldyBBY2Nlc3NNb2RlKCkudXBkYXRlQWxsKHByZXMuZGFjcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnQudG91Y2hlZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3VhJzpcbiAgICAgICAgICAvLyB1c2VyIGFnZW50IGNoYW5nZWQuXG4gICAgICAgICAgY29udC5zZWVuID0ge1xuICAgICAgICAgICAgd2hlbjogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIHVhOiBwcmVzLnVhXG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmVjdic6XG4gICAgICAgICAgLy8gdXNlcidzIG90aGVyIHNlc3Npb24gbWFya2VkIHNvbWUgbWVzc2dlcyBhcyByZWNlaXZlZC5cbiAgICAgICAgICBwcmVzLnNlcSA9IHByZXMuc2VxIHwgMDtcbiAgICAgICAgICBjb250LnJlY3YgPSBjb250LnJlY3YgPyBNYXRoLm1heChjb250LnJlY3YsIHByZXMuc2VxKSA6IHByZXMuc2VxO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZWFkJzpcbiAgICAgICAgICAvLyB1c2VyJ3Mgb3RoZXIgc2Vzc2lvbiBtYXJrZWQgc29tZSBtZXNzYWdlcyBhcyByZWFkLlxuICAgICAgICAgIHByZXMuc2VxID0gcHJlcy5zZXEgfCAwO1xuICAgICAgICAgIGNvbnQucmVhZCA9IGNvbnQucmVhZCA/IE1hdGgubWF4KGNvbnQucmVhZCwgcHJlcy5zZXEpIDogcHJlcy5zZXE7XG4gICAgICAgICAgY29udC5yZWN2ID0gY29udC5yZWN2ID8gTWF0aC5tYXgoY29udC5yZWFkLCBjb250LnJlY3YpIDogY29udC5yZWN2O1xuICAgICAgICAgIGNvbnQudW5yZWFkID0gY29udC5zZXEgLSBjb250LnJlYWQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2dvbmUnOlxuICAgICAgICAgIC8vIHRvcGljIGRlbGV0ZWQgb3IgdW5zdWJzY3JpYmVkIGZyb20uXG4gICAgICAgICAgaWYgKCFjb250Ll9kZWxldGVkKSB7XG4gICAgICAgICAgICBjb250Ll9kZWxldGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnQuX2F0dGFjaGVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl90aW5vZGUuX2RiLm1hcmtUb3BpY0FzRGVsZXRlZChwcmVzLnNyYywgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZWwnOlxuICAgICAgICAgIC8vIFVwZGF0ZSB0b3BpYy5kZWwgdmFsdWUuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5fdGlub2RlLmxvZ2dlcihcIklORk86IFVuc3VwcG9ydGVkIHByZXNlbmNlIHVwZGF0ZSBpbiAnbWUnXCIsIHByZXMud2hhdCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3JlZnJlc2hDb250YWN0KHByZXMud2hhdCwgY29udCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwcmVzLndoYXQgPT0gJ2FjcycpIHtcbiAgICAgICAgLy8gTmV3IHN1YnNjcmlwdGlvbnMgYW5kIGRlbGV0ZWQvYmFubmVkIHN1YnNjcmlwdGlvbnMgaGF2ZSBmdWxsXG4gICAgICAgIC8vIGFjY2VzcyBtb2RlIChubyArIG9yIC0gaW4gdGhlIGRhY3Mgc3RyaW5nKS4gQ2hhbmdlcyB0byBrbm93biBzdWJzY3JpcHRpb25zIGFyZSBzZW50IGFzXG4gICAgICAgIC8vIGRlbHRhcywgYnV0IHRoZXkgc2hvdWxkIG5vdCBoYXBwZW4gaGVyZS5cbiAgICAgICAgY29uc3QgYWNzID0gbmV3IEFjY2Vzc01vZGUocHJlcy5kYWNzKTtcbiAgICAgICAgaWYgKCFhY3MgfHwgYWNzLm1vZGUgPT0gQWNjZXNzTW9kZS5fSU5WQUxJRCkge1xuICAgICAgICAgIHRoaXMuX3Rpbm9kZS5sb2dnZXIoXCJFUlJPUjogSW52YWxpZCBhY2Nlc3MgbW9kZSB1cGRhdGVcIiwgcHJlcy5zcmMsIHByZXMuZGFjcyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGFjcy5tb2RlID09IEFjY2Vzc01vZGUuX05PTkUpIHtcbiAgICAgICAgICB0aGlzLl90aW5vZGUubG9nZ2VyKFwiV0FSTklORzogUmVtb3Zpbmcgbm9uLWV4aXN0ZW50IHN1YnNjcmlwdGlvblwiLCBwcmVzLnNyYywgcHJlcy5kYWNzKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTmV3IHN1YnNjcmlwdGlvbi4gU2VuZCByZXF1ZXN0IGZvciB0aGUgZnVsbCBkZXNjcmlwdGlvbi5cbiAgICAgICAgICAvLyBVc2luZyAud2l0aE9uZVN1YiAobm90IC53aXRoTGF0ZXJPbmVTdWIpIHRvIG1ha2Ugc3VyZSBJZk1vZGlmaWVkU2luY2UgaXMgbm90IHNldC5cbiAgICAgICAgICB0aGlzLmdldE1ldGEodGhpcy5zdGFydE1ldGFRdWVyeSgpLndpdGhPbmVTdWIodW5kZWZpbmVkLCBwcmVzLnNyYykuYnVpbGQoKSk7XG4gICAgICAgICAgLy8gQ3JlYXRlIGEgZHVtbXkgZW50cnkgdG8gY2F0Y2ggb25saW5lIHN0YXR1cyB1cGRhdGUuXG4gICAgICAgICAgY29uc3QgZHVtbXkgPSB0aGlzLl90aW5vZGUuZ2V0VG9waWMocHJlcy5zcmMpO1xuICAgICAgICAgIGR1bW15LnRvcGljID0gcHJlcy5zcmM7XG4gICAgICAgICAgZHVtbXkub25saW5lID0gZmFsc2U7XG4gICAgICAgICAgZHVtbXkuYWNzID0gYWNzO1xuICAgICAgICAgIHRoaXMuX3Rpbm9kZS5fZGIudXBkVG9waWMoZHVtbXkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHByZXMud2hhdCA9PSAndGFncycpIHtcbiAgICAgICAgdGhpcy5nZXRNZXRhKHRoaXMuc3RhcnRNZXRhUXVlcnkoKS53aXRoVGFncygpLmJ1aWxkKCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLm9uUHJlcykge1xuICAgICAgdGhpcy5vblByZXMocHJlcyk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ29udGFjdCBpcyB1cGRhdGVkLCBleGVjdXRlIGNhbGxiYWNrcy5cbiAgX3JlZnJlc2hDb250YWN0KHdoYXQsIGNvbnQpIHtcbiAgICBpZiAodGhpcy5vbkNvbnRhY3RVcGRhdGUpIHtcbiAgICAgIHRoaXMub25Db250YWN0VXBkYXRlKHdoYXQsIGNvbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQdWJsaXNoaW5nIHRvIFRvcGljTWUgaXMgbm90IHN1cHBvcnRlZC4ge0BsaW5rIFRvcGljI3B1Ymxpc2h9IGlzIG92ZXJyaWRlbiBhbmQgdGhvd3MgYW4ge0Vycm9yfSBpZiBjYWxsZWQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWNNZSNcbiAgICogQHRocm93cyB7RXJyb3J9IEFsd2F5cyB0aHJvd3MgYW4gZXJyb3IuXG4gICAqL1xuICBwdWJsaXNoKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJQdWJsaXNoaW5nIHRvICdtZScgaXMgbm90IHN1cHBvcnRlZFwiKSk7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIHZhbGlkYXRpb24gY3JlZGVudGlhbC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpY01lI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWMgLSBOYW1lIG9mIHRoZSB0b3BpYyB0byBkZWxldGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXIgLSBVc2VyIElEIHRvIHJlbW92ZS5cbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCBvbiByZWNlaXZpbmcgc2VydmVyIHJlcGx5LlxuICAgKi9cbiAgZGVsQ3JlZGVudGlhbChtZXRob2QsIHZhbHVlKSB7XG4gICAgaWYgKCF0aGlzLl9hdHRhY2hlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIkNhbm5vdCBkZWxldGUgY3JlZGVudGlhbCBpbiBpbmFjdGl2ZSAnbWUnIHRvcGljXCIpKTtcbiAgICB9XG4gICAgLy8gU2VuZCB7ZGVsfSBtZXNzYWdlLCByZXR1cm4gcHJvbWlzZVxuICAgIHJldHVybiB0aGlzLl90aW5vZGUuZGVsQ3JlZGVudGlhbChtZXRob2QsIHZhbHVlKS50aGVuKChjdHJsKSA9PiB7XG4gICAgICAvLyBSZW1vdmUgZGVsZXRlZCBjcmVkZW50aWFsIGZyb20gdGhlIGNhY2hlLlxuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9jcmVkZW50aWFscy5maW5kSW5kZXgoKGVsKSA9PiB7XG4gICAgICAgIHJldHVybiBlbC5tZXRoID09IG1ldGhvZCAmJiBlbC52YWwgPT0gdmFsdWU7XG4gICAgICB9KTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgICAvLyBOb3RpZnkgbGlzdGVuZXJzXG4gICAgICBpZiAodGhpcy5vbkNyZWRzVXBkYXRlZCkge1xuICAgICAgICB0aGlzLm9uQ3JlZHNVcGRhdGVkKHRoaXMuX2NyZWRlbnRpYWxzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjdHJsO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBjYWxsYmFjayBjb250YWN0RmlsdGVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250YWN0IHRvIGNoZWNrIGZvciBpbmNsdXNpb24uXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiBjb250YWN0IHNob3VsZCBiZSBwcm9jZXNzZWQsIDxjb2RlPmZhbHNlPC9jb2RlPiB0byBleGNsdWRlIGl0LlxuICAgKi9cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb3ZlciBjYWNoZWQgY29udGFjdHMuXG4gICAqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljTWUjXG4gICAqIEBwYXJhbSB7VG9waWNNZS5Db250YWN0Q2FsbGJhY2t9IGNhbGxiYWNrIC0gQ2FsbGJhY2sgdG8gY2FsbCBmb3IgZWFjaCBjb250YWN0LlxuICAgKiBAcGFyYW0ge2NvbnRhY3RGaWx0ZXI9fSBmaWx0ZXIgLSBPcHRpb25hbGx5IGZpbHRlciBjb250YWN0czsgaW5jbHVkZSBhbGwgaWYgZmlsdGVyIGlzIGZhbHNlLWlzaCwgb3RoZXJ3aXNlXG4gICAqICAgICAgaW5jbHVkZSB0aG9zZSBmb3Igd2hpY2ggZmlsdGVyIHJldHVybnMgdHJ1ZS1pc2guXG4gICAqIEBwYXJhbSB7T2JqZWN0PX0gY29udGV4dCAtIENvbnRleHQgdG8gdXNlIGZvciBjYWxsaW5nIHRoZSBgY2FsbGJhY2tgLCBpLmUuIHRoZSB2YWx1ZSBvZiBgdGhpc2AgaW5zaWRlIHRoZSBjYWxsYmFjay5cbiAgICovXG4gIGNvbnRhY3RzKGNhbGxiYWNrLCBmaWx0ZXIsIGNvbnRleHQpIHtcbiAgICB0aGlzLl90aW5vZGUubWFwVG9waWNzKChjLCBpZHgpID0+IHtcbiAgICAgIGlmIChjLmlzQ29tbVR5cGUoKSAmJiAoIWZpbHRlciB8fCBmaWx0ZXIoYykpKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgYywgaWR4KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBjb250YWN0IGZyb20gY2FjaGUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWNNZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBjb250YWN0IHRvIGdldCwgZWl0aGVyIGEgVUlEIChmb3IgcDJwIHRvcGljcykgb3IgYSB0b3BpYyBuYW1lLlxuICAgKiBAcmV0dXJucyB7VGlub2RlLkNvbnRhY3R9IC0gQ29udGFjdCBvciBgdW5kZWZpbmVkYC5cbiAgICovXG4gIGdldENvbnRhY3QobmFtZSkge1xuICAgIHJldHVybiB0aGlzLl90aW5vZGUuY2FjaGVHZXRUb3BpYyhuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWNjZXNzIG1vZGUgb2YgYSBnaXZlbiBjb250YWN0IGZyb20gY2FjaGUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWNNZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBjb250YWN0IHRvIGdldCBhY2Nlc3MgbW9kZSBmb3IsIGVpdGhlciBhIFVJRCAoZm9yIHAycCB0b3BpY3MpXG4gICAqICAgICAgICBvciBhIHRvcGljIG5hbWU7IGlmIG1pc3NpbmcsIGFjY2VzcyBtb2RlIGZvciB0aGUgJ21lJyB0b3BpYyBpdHNlbGYuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gYWNjZXNzIG1vZGUsIHN1Y2ggYXMgYFJXUGAuXG4gICAqL1xuICBnZXRBY2Nlc3NNb2RlKG5hbWUpIHtcbiAgICBpZiAobmFtZSkge1xuICAgICAgY29uc3QgY29udCA9IHRoaXMuX3Rpbm9kZS5jYWNoZUdldFRvcGljKG5hbWUpO1xuICAgICAgcmV0dXJuIGNvbnQgPyBjb250LmFjcyA6IG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFjcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBjb250YWN0IGlzIGFyY2hpdmVkLCBpLmUuIGNvbnRhY3QucHJpdmF0ZS5hcmNoID09IHRydWUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWNNZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBjb250YWN0IHRvIGNoZWNrIGFyY2hpdmVkIHN0YXR1cywgZWl0aGVyIGEgVUlEIChmb3IgcDJwIHRvcGljcykgb3IgYSB0b3BpYyBuYW1lLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSB0cnVlIGlmIGNvbnRhY3QgaXMgYXJjaGl2ZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIGlzQXJjaGl2ZWQobmFtZSkge1xuICAgIGNvbnN0IGNvbnQgPSB0aGlzLl90aW5vZGUuY2FjaGVHZXRUb3BpYyhuYW1lKTtcbiAgICByZXR1cm4gY29udCAmJiBjb250LnByaXZhdGUgJiYgISFjb250LnByaXZhdGUuYXJjaDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiBUaW5vZGUuQ3JlZGVudGlhbFxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEB0eXBlIE9iamVjdFxuICAgKiBAcHJvcGVydHkge3N0cmluZ30gbWV0aCAtIHZhbGlkYXRpb24gbWV0aG9kIHN1Y2ggYXMgJ2VtYWlsJyBvciAndGVsJy5cbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IHZhbCAtIGNyZWRlbnRpYWwgdmFsdWUsIGkuZS4gJ2pkb2VAZXhhbXBsZS5jb20nIG9yICcrMTcwMjU1NTEyMzQnXG4gICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gZG9uZSAtIHRydWUgaWYgY3JlZGVudGlhbCBpcyB2YWxpZGF0ZWQuXG4gICAqL1xuICAvKipcbiAgICogR2V0IHRoZSB1c2VyJ3MgY3JlZGVudGlhbHM6IGVtYWlsLCBwaG9uZSwgZXRjLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljTWUjXG4gICAqXG4gICAqIEByZXR1cm5zIHtUaW5vZGUuQ3JlZGVudGlhbFtdfSAtIGFycmF5IG9mIGNyZWRlbnRpYWxzLlxuICAgKi9cbiAgZ2V0Q3JlZGVudGlhbHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NyZWRlbnRpYWxzO1xuICB9XG59XG5cbi8qKlxuICogQGNsYXNzIFRvcGljRm5kIC0gc3BlY2lhbCBjYXNlIG9mIHtAbGluayBUaW5vZGUuVG9waWN9IGZvciBzZWFyY2hpbmcgZm9yXG4gKiBjb250YWN0cyBhbmQgZ3JvdXAgdG9waWNzLlxuICogQGV4dGVuZHMgVGlub2RlLlRvcGljXG4gKiBAbWVtYmVyb2YgVGlub2RlXG4gKlxuICogQHBhcmFtIHtUb3BpY0ZuZC5DYWxsYmFja3N9IGNhbGxiYWNrcyAtIENhbGxiYWNrcyB0byByZWNlaXZlIHZhcmlvdXMgZXZlbnRzLlxuICovXG5leHBvcnQgY2xhc3MgVG9waWNGbmQgZXh0ZW5kcyBUb3BpYyB7XG4gIC8vIExpc3Qgb2YgdXNlcnMgYW5kIHRvcGljcyB1aWQgb3IgdG9waWNfbmFtZSAtPiBDb250YWN0IG9iamVjdClcbiAgX2NvbnRhY3RzID0ge307XG5cbiAgY29uc3RydWN0b3IoY2FsbGJhY2tzKSB7XG4gICAgc3VwZXIoQ29uc3QuVE9QSUNfRk5ELCBjYWxsYmFja3MpO1xuICB9XG5cbiAgLy8gT3ZlcnJpZGUgdGhlIG9yaWdpbmFsIFRvcGljLl9wcm9jZXNzTWV0YVN1YlxuICBfcHJvY2Vzc01ldGFTdWIoc3Vicykge1xuICAgIGxldCB1cGRhdGVDb3VudCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMuX2NvbnRhY3RzKS5sZW5ndGg7XG4gICAgLy8gUmVzZXQgY29udGFjdCBsaXN0LlxuICAgIHRoaXMuX2NvbnRhY3RzID0ge307XG4gICAgZm9yIChsZXQgaWR4IGluIHN1YnMpIHtcbiAgICAgIGxldCBzdWIgPSBzdWJzW2lkeF07XG4gICAgICBjb25zdCBpbmRleEJ5ID0gc3ViLnRvcGljID8gc3ViLnRvcGljIDogc3ViLnVzZXI7XG5cbiAgICAgIHN1YiA9IG1lcmdlVG9DYWNoZSh0aGlzLl9jb250YWN0cywgaW5kZXhCeSwgc3ViKTtcbiAgICAgIHVwZGF0ZUNvdW50Kys7XG5cbiAgICAgIGlmICh0aGlzLm9uTWV0YVN1Yikge1xuICAgICAgICB0aGlzLm9uTWV0YVN1YihzdWIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh1cGRhdGVDb3VudCA+IDAgJiYgdGhpcy5vblN1YnNVcGRhdGVkKSB7XG4gICAgICB0aGlzLm9uU3Vic1VwZGF0ZWQoT2JqZWN0LmtleXModGhpcy5fY29udGFjdHMpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHVibGlzaGluZyB0byBUb3BpY0ZuZCBpcyBub3Qgc3VwcG9ydGVkLiB7QGxpbmsgVG9waWMjcHVibGlzaH0gaXMgb3ZlcnJpZGVuIGFuZCB0aG93cyBhbiB7RXJyb3J9IGlmIGNhbGxlZC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpY0ZuZCNcbiAgICogQHRocm93cyB7RXJyb3J9IEFsd2F5cyB0aHJvd3MgYW4gZXJyb3IuXG4gICAqL1xuICBwdWJsaXNoKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJQdWJsaXNoaW5nIHRvICdmbmQnIGlzIG5vdCBzdXBwb3J0ZWRcIikpO1xuICB9XG5cbiAgLyoqXG4gICAqIHNldE1ldGEgdG8gVG9waWNGbmQgcmVzZXRzIGNvbnRhY3QgbGlzdCBpbiBhZGRpdGlvbiB0byBzZW5kaW5nIHRoZSBtZXNzYWdlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljRm5kI1xuICAgKiBAcGFyYW0ge1Rpbm9kZS5TZXRQYXJhbXN9IHBhcmFtcyBwYXJhbWV0ZXJzIHRvIHVwZGF0ZS5cbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgdG8gYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgc2VydmVyIHJlc3BvbmRzIHRvIHJlcXVlc3QuXG4gICAqL1xuICBzZXRNZXRhKHBhcmFtcykge1xuICAgIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoVG9waWNGbmQucHJvdG90eXBlKS5zZXRNZXRhLmNhbGwodGhpcywgcGFyYW1zKS50aGVuKCgpID0+IHtcbiAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLl9jb250YWN0cykubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLl9jb250YWN0cyA9IHt9O1xuICAgICAgICBpZiAodGhpcy5vblN1YnNVcGRhdGVkKSB7XG4gICAgICAgICAgdGhpcy5vblN1YnNVcGRhdGVkKFtdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb3ZlciBmb3VuZCBjb250YWN0cy4gSWYgY2FsbGJhY2sgaXMgdW5kZWZpbmVkLCB1c2Uge0BsaW5rIHRoaXMub25NZXRhU3VifS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWNGbmQjXG4gICAqIEBwYXJhbSB7VG9waWNGbmQuQ29udGFjdENhbGxiYWNrfSBjYWxsYmFjayAtIENhbGxiYWNrIHRvIGNhbGwgZm9yIGVhY2ggY29udGFjdC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSBDb250ZXh0IHRvIHVzZSBmb3IgY2FsbGluZyB0aGUgYGNhbGxiYWNrYCwgaS5lLiB0aGUgdmFsdWUgb2YgYHRoaXNgIGluc2lkZSB0aGUgY2FsbGJhY2suXG4gICAqL1xuICBjb250YWN0cyhjYWxsYmFjaywgY29udGV4dCkge1xuICAgIGNvbnN0IGNiID0gKGNhbGxiYWNrIHx8IHRoaXMub25NZXRhU3ViKTtcbiAgICBpZiAoY2IpIHtcbiAgICAgIGZvciAobGV0IGlkeCBpbiB0aGlzLl9jb250YWN0cykge1xuICAgICAgICBjYi5jYWxsKGNvbnRleHQsIHRoaXMuX2NvbnRhY3RzW2lkeF0sIGlkeCwgdGhpcy5fY29udGFjdHMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiLyoqXG4gKiBAZmlsZSBVdGlsaXRpZXMgdXNlZCBpbiBtdWx0aXBsZSBwbGFjZXMuXG4gKlxuICogQGNvcHlyaWdodCAyMDE1LTIwMjIgVGlub2RlIExMQy5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgQWNjZXNzTW9kZSBmcm9tICcuL2FjY2Vzcy1tb2RlLmpzJztcbmltcG9ydCBERUxfQ0hBUiBmcm9tICcuL2NvbmZpZy5qcyc7XG5cbi8vIEF0dGVtcHQgdG8gY29udmVydCBkYXRlIGFuZCBBY2Nlc3NNb2RlIHN0cmluZ3MgdG8gb2JqZWN0cy5cbmV4cG9ydCBmdW5jdGlvbiBqc29uUGFyc2VIZWxwZXIoa2V5LCB2YWwpIHtcbiAgLy8gVHJ5IHRvIGNvbnZlcnQgc3RyaW5nIHRpbWVzdGFtcHMgd2l0aCBvcHRpb25hbCBtaWxsaXNlY29uZHMgdG8gRGF0ZSxcbiAgLy8gZS5nLiAyMDE1LTA5LTAyVDAxOjQ1OjQzWy4xMjNdWlxuICBpZiAodHlwZW9mIHZhbCA9PSAnc3RyaW5nJyAmJiB2YWwubGVuZ3RoID49IDIwICYmIHZhbC5sZW5ndGggPD0gMjQgJiYgWyd0cycsICd0b3VjaGVkJywgJ3VwZGF0ZWQnLCAnY3JlYXRlZCcsICd3aGVuJywgJ2RlbGV0ZWQnLCAnZXhwaXJlcyddLmluY2x1ZGVzKGtleSkpIHtcblxuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWwpO1xuICAgIGlmICghaXNOYU4oZGF0ZSkpIHtcbiAgICAgIHJldHVybiBkYXRlO1xuICAgIH1cbiAgfSBlbHNlIGlmIChrZXkgPT09ICdhY3MnICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG5ldyBBY2Nlc3NNb2RlKHZhbCk7XG4gIH1cbiAgcmV0dXJuIHZhbDtcbn1cblxuLy8gQ2hlY2tzIGlmIFVSTCBpcyBhIHJlbGF0aXZlIHVybCwgaS5lLiBoYXMgbm8gJ3NjaGVtZTovLycsIGluY2x1ZGluZyB0aGUgY2FzZSBvZiBtaXNzaW5nIHNjaGVtZSAnLy8nLlxuLy8gVGhlIHNjaGVtZSBpcyBleHBlY3RlZCB0byBiZSBSRkMtY29tcGxpYW50LCBlLmcuIFthLXpdW2EtejAtOSsuLV0qXG4vLyBleGFtcGxlLmh0bWwgLSBva1xuLy8gaHR0cHM6ZXhhbXBsZS5jb20gLSBub3Qgb2suXG4vLyBodHRwOi9leGFtcGxlLmNvbSAtIG5vdCBvay5cbi8vICcg4oayIGh0dHBzOi8vZXhhbXBsZS5jb20nIC0gbm90IG9rLiAo4oayIG1lYW5zIGNhcnJpYWdlIHJldHVybilcbmV4cG9ydCBmdW5jdGlvbiBpc1VybFJlbGF0aXZlKHVybCkge1xuICByZXR1cm4gdXJsICYmICEvXlxccyooW2Etel1bYS16MC05Ky4tXSo6fFxcL1xcLykvaW0udGVzdCh1cmwpO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkRGF0ZShkKSB7XG4gIHJldHVybiAoZCBpbnN0YW5jZW9mIERhdGUpICYmICFpc05hTihkKSAmJiAoZC5nZXRUaW1lKCkgIT0gMCk7XG59XG5cbi8vIFJGQzMzMzkgZm9ybWF0ZXIgb2YgRGF0ZVxuZXhwb3J0IGZ1bmN0aW9uIHJmYzMzMzlEYXRlU3RyaW5nKGQpIHtcbiAgaWYgKCFpc1ZhbGlkRGF0ZShkKSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBjb25zdCBwYWQgPSBmdW5jdGlvbih2YWwsIHNwKSB7XG4gICAgc3AgPSBzcCB8fCAyO1xuICAgIHJldHVybiAnMCcucmVwZWF0KHNwIC0gKCcnICsgdmFsKS5sZW5ndGgpICsgdmFsO1xuICB9O1xuXG4gIGNvbnN0IG1pbGxpcyA9IGQuZ2V0VVRDTWlsbGlzZWNvbmRzKCk7XG4gIHJldHVybiBkLmdldFVUQ0Z1bGxZZWFyKCkgKyAnLScgKyBwYWQoZC5nZXRVVENNb250aCgpICsgMSkgKyAnLScgKyBwYWQoZC5nZXRVVENEYXRlKCkpICtcbiAgICAnVCcgKyBwYWQoZC5nZXRVVENIb3VycygpKSArICc6JyArIHBhZChkLmdldFVUQ01pbnV0ZXMoKSkgKyAnOicgKyBwYWQoZC5nZXRVVENTZWNvbmRzKCkpICtcbiAgICAobWlsbGlzID8gJy4nICsgcGFkKG1pbGxpcywgMykgOiAnJykgKyAnWic7XG59XG5cbi8vIFJlY3Vyc2l2ZWx5IG1lcmdlIHNyYydzIG93biBwcm9wZXJ0aWVzIHRvIGRzdC5cbi8vIElnbm9yZSBwcm9wZXJ0aWVzIHdoZXJlIGlnbm9yZVtwcm9wZXJ0eV0gaXMgdHJ1ZS5cbi8vIEFycmF5IGFuZCBEYXRlIG9iamVjdHMgYXJlIHNoYWxsb3ctY29waWVkLlxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlT2JqKGRzdCwgc3JjLCBpZ25vcmUpIHtcbiAgaWYgKHR5cGVvZiBzcmMgIT0gJ29iamVjdCcpIHtcbiAgICBpZiAoc3JjID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuICAgIGlmIChzcmMgPT09IERFTF9DSEFSKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gc3JjO1xuICB9XG4gIC8vIEpTIGlzIGNyYXp5OiB0eXBlb2YgbnVsbCBpcyAnb2JqZWN0Jy5cbiAgaWYgKHNyYyA9PT0gbnVsbCkge1xuICAgIHJldHVybiBzcmM7XG4gIH1cblxuICAvLyBIYW5kbGUgRGF0ZVxuICBpZiAoc3JjIGluc3RhbmNlb2YgRGF0ZSAmJiAhaXNOYU4oc3JjKSkge1xuICAgIHJldHVybiAoIWRzdCB8fCAhKGRzdCBpbnN0YW5jZW9mIERhdGUpIHx8IGlzTmFOKGRzdCkgfHwgZHN0IDwgc3JjKSA/IHNyYyA6IGRzdDtcbiAgfVxuXG4gIC8vIEFjY2VzcyBtb2RlXG4gIGlmIChzcmMgaW5zdGFuY2VvZiBBY2Nlc3NNb2RlKSB7XG4gICAgcmV0dXJuIG5ldyBBY2Nlc3NNb2RlKHNyYyk7XG4gIH1cblxuICAvLyBIYW5kbGUgQXJyYXlcbiAgaWYgKHNyYyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgcmV0dXJuIHNyYztcbiAgfVxuXG4gIGlmICghZHN0IHx8IGRzdCA9PT0gREVMX0NIQVIpIHtcbiAgICBkc3QgPSBzcmMuY29uc3RydWN0b3IoKTtcbiAgfVxuXG4gIGZvciAobGV0IHByb3AgaW4gc3JjKSB7XG4gICAgaWYgKHNyYy5oYXNPd25Qcm9wZXJ0eShwcm9wKSAmJiAoIWlnbm9yZSB8fCAhaWdub3JlW3Byb3BdKSAmJiAocHJvcCAhPSAnX25vRm9yd2FyZGluZycpKSB7XG4gICAgICBkc3RbcHJvcF0gPSBtZXJnZU9iaihkc3RbcHJvcF0sIHNyY1twcm9wXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBkc3Q7XG59XG5cbi8vIFVwZGF0ZSBvYmplY3Qgc3RvcmVkIGluIGEgY2FjaGUuIFJldHVybnMgdXBkYXRlZCB2YWx1ZS5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVRvQ2FjaGUoY2FjaGUsIGtleSwgbmV3dmFsLCBpZ25vcmUpIHtcbiAgY2FjaGVba2V5XSA9IG1lcmdlT2JqKGNhY2hlW2tleV0sIG5ld3ZhbCwgaWdub3JlKTtcbiAgcmV0dXJuIGNhY2hlW2tleV07XG59XG5cbi8vIFN0cmlwcyBhbGwgdmFsdWVzIGZyb20gYW4gb2JqZWN0IG9mIHRoZXkgZXZhbHVhdGUgdG8gZmFsc2Ugb3IgaWYgdGhlaXIgbmFtZSBzdGFydHMgd2l0aCAnXycuXG4vLyBVc2VkIG9uIGFsbCBvdXRnb2luZyBvYmplY3QgYmVmb3JlIHNlcmlhbGl6YXRpb24gdG8gc3RyaW5nLlxuZXhwb3J0IGZ1bmN0aW9uIHNpbXBsaWZ5KG9iaikge1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGlmIChrZXlbMF0gPT0gJ18nKSB7XG4gICAgICAvLyBTdHJpcCBmaWVsZHMgbGlrZSBcIm9iai5fa2V5XCIuXG4gICAgICBkZWxldGUgb2JqW2tleV07XG4gICAgfSBlbHNlIGlmICghb2JqW2tleV0pIHtcbiAgICAgIC8vIFN0cmlwIGZpZWxkcyB3aGljaCBldmFsdWF0ZSB0byBmYWxzZS5cbiAgICAgIGRlbGV0ZSBvYmpba2V5XTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob2JqW2tleV0pICYmIG9ialtrZXldLmxlbmd0aCA9PSAwKSB7XG4gICAgICAvLyBTdHJpcCBlbXB0eSBhcnJheXMuXG4gICAgICBkZWxldGUgb2JqW2tleV07XG4gICAgfSBlbHNlIGlmICghb2JqW2tleV0pIHtcbiAgICAgIC8vIFN0cmlwIGZpZWxkcyB3aGljaCBldmFsdWF0ZSB0byBmYWxzZS5cbiAgICAgIGRlbGV0ZSBvYmpba2V5XTtcbiAgICB9IGVsc2UgaWYgKG9ialtrZXldIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgLy8gU3RyaXAgaW52YWxpZCBvciB6ZXJvIGRhdGUuXG4gICAgICBpZiAoIWlzVmFsaWREYXRlKG9ialtrZXldKSkge1xuICAgICAgICBkZWxldGUgb2JqW2tleV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqW2tleV0gPT0gJ29iamVjdCcpIHtcbiAgICAgIHNpbXBsaWZ5KG9ialtrZXldKTtcbiAgICAgIC8vIFN0cmlwIGVtcHR5IG9iamVjdHMuXG4gICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqW2tleV0pLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGRlbGV0ZSBvYmpba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb2JqO1xufTtcblxuXG4vLyBUcmltIHdoaXRlc3BhY2UsIHN0cmlwIGVtcHR5IGFuZCBkdXBsaWNhdGUgZWxlbWVudHMgZWxlbWVudHMuXG4vLyBJZiB0aGUgcmVzdWx0IGlzIGFuIGVtcHR5IGFycmF5LCBhZGQgYSBzaW5nbGUgZWxlbWVudCBcIlxcdTI0MjFcIiAoVW5pY29kZSBEZWwgY2hhcmFjdGVyKS5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVBcnJheShhcnIpIHtcbiAgbGV0IG91dCA9IFtdO1xuICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgLy8gVHJpbSwgdGhyb3cgYXdheSB2ZXJ5IHNob3J0IGFuZCBlbXB0eSB0YWdzLlxuICAgIGZvciAobGV0IGkgPSAwLCBsID0gYXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgbGV0IHQgPSBhcnJbaV07XG4gICAgICBpZiAodCkge1xuICAgICAgICB0ID0gdC50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKHQubGVuZ3RoID4gMSkge1xuICAgICAgICAgIG91dC5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIG91dC5zb3J0KCkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0sIHBvcywgYXJ5KSB7XG4gICAgICByZXR1cm4gIXBvcyB8fCBpdGVtICE9IGFyeVtwb3MgLSAxXTtcbiAgICB9KTtcbiAgfVxuICBpZiAob3V0Lmxlbmd0aCA9PSAwKSB7XG4gICAgLy8gQWRkIHNpbmdsZSB0YWcgd2l0aCBhIFVuaWNvZGUgRGVsIGNoYXJhY3Rlciwgb3RoZXJ3aXNlIGFuIGFtcHR5IGFycmF5XG4gICAgLy8gaXMgYW1iaWd1b3MuIFRoZSBEZWwgdGFnIHdpbGwgYmUgc3RyaXBwZWQgYnkgdGhlIHNlcnZlci5cbiAgICBvdXQucHVzaChERUxfQ0hBUik7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcInZlcnNpb25cIjogXCIwLjE5LjAtYWxwaGExXCJ9XG4iXX0=
