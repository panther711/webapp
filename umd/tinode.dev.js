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

    poller.open('GET', url_, true);
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

      _classPrivateMethodGet(this, _log, _log2).call(this, "Connecting to:", url);

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

      _classPrivateMethodGet(this, _log, _log2).call(this, "Connecting to: ", url);

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWNjZXNzLW1vZGUuanMiLCJzcmMvY2J1ZmZlci5qcyIsInNyYy9jb25maWcuanMiLCJzcmMvY29ubmVjdGlvbi5qcyIsInNyYy9kYi5qcyIsInNyYy9kcmFmdHkuanMiLCJzcmMvbGFyZ2UtZmlsZS5qcyIsInNyYy9tZXRhLWJ1aWxkZXIuanMiLCJzcmMvdGlub2RlLmpzIiwic3JjL3RvcGljLmpzIiwic3JjL3V0aWxzLmpzIiwidmVyc2lvbi5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDS0E7Ozs7Ozs7Ozs7O0FBY2UsTUFBTSxVQUFOLENBQWlCO0FBQzlCLEVBQUEsV0FBVyxDQUFDLEdBQUQsRUFBTTtBQUNmLFFBQUksR0FBSixFQUFTO0FBQ1AsV0FBSyxLQUFMLEdBQWEsT0FBTyxHQUFHLENBQUMsS0FBWCxJQUFvQixRQUFwQixHQUErQixHQUFHLENBQUMsS0FBbkMsR0FBMkMsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsR0FBRyxDQUFDLEtBQXRCLENBQXhEO0FBQ0EsV0FBSyxJQUFMLEdBQVksT0FBTyxHQUFHLENBQUMsSUFBWCxJQUFtQixRQUFuQixHQUE4QixHQUFHLENBQUMsSUFBbEMsR0FBeUMsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsR0FBRyxDQUFDLElBQXRCLENBQXJEO0FBQ0EsV0FBSyxJQUFMLEdBQVksR0FBRyxDQUFDLElBQUosR0FBWSxPQUFPLEdBQUcsQ0FBQyxJQUFYLElBQW1CLFFBQW5CLEdBQThCLEdBQUcsQ0FBQyxJQUFsQyxHQUF5QyxVQUFVLENBQUMsTUFBWCxDQUFrQixHQUFHLENBQUMsSUFBdEIsQ0FBckQsR0FDVCxLQUFLLEtBQUwsR0FBYSxLQUFLLElBRHJCO0FBRUQ7QUFDRjs7QUFpQlksU0FBTixNQUFNLENBQUMsR0FBRCxFQUFNO0FBQ2pCLFFBQUksQ0FBQyxHQUFMLEVBQVU7QUFDUixhQUFPLElBQVA7QUFDRCxLQUZELE1BRU8sSUFBSSxPQUFPLEdBQVAsSUFBYyxRQUFsQixFQUE0QjtBQUNqQyxhQUFPLEdBQUcsR0FBRyxVQUFVLENBQUMsUUFBeEI7QUFDRCxLQUZNLE1BRUEsSUFBSSxHQUFHLEtBQUssR0FBUixJQUFlLEdBQUcsS0FBSyxHQUEzQixFQUFnQztBQUNyQyxhQUFPLFVBQVUsQ0FBQyxLQUFsQjtBQUNEOztBQUVELFVBQU0sT0FBTyxHQUFHO0FBQ2QsV0FBSyxVQUFVLENBQUMsS0FERjtBQUVkLFdBQUssVUFBVSxDQUFDLEtBRkY7QUFHZCxXQUFLLFVBQVUsQ0FBQyxNQUhGO0FBSWQsV0FBSyxVQUFVLENBQUMsS0FKRjtBQUtkLFdBQUssVUFBVSxDQUFDLFFBTEY7QUFNZCxXQUFLLFVBQVUsQ0FBQyxNQU5GO0FBT2QsV0FBSyxVQUFVLENBQUMsT0FQRjtBQVFkLFdBQUssVUFBVSxDQUFDO0FBUkYsS0FBaEI7QUFXQSxRQUFJLEVBQUUsR0FBRyxVQUFVLENBQUMsS0FBcEI7O0FBRUEsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBeEIsRUFBZ0MsQ0FBQyxFQUFqQyxFQUFxQztBQUNuQyxZQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQUosQ0FBVyxDQUFYLEVBQWMsV0FBZCxFQUFELENBQW5COztBQUNBLFVBQUksQ0FBQyxHQUFMLEVBQVU7QUFFUjtBQUNEOztBQUNELE1BQUEsRUFBRSxJQUFJLEdBQU47QUFDRDs7QUFDRCxXQUFPLEVBQVA7QUFDRDs7QUFVWSxTQUFOLE1BQU0sQ0FBQyxHQUFELEVBQU07QUFDakIsUUFBSSxHQUFHLEtBQUssSUFBUixJQUFnQixHQUFHLEtBQUssVUFBVSxDQUFDLFFBQXZDLEVBQWlEO0FBQy9DLGFBQU8sSUFBUDtBQUNELEtBRkQsTUFFTyxJQUFJLEdBQUcsS0FBSyxVQUFVLENBQUMsS0FBdkIsRUFBOEI7QUFDbkMsYUFBTyxHQUFQO0FBQ0Q7O0FBRUQsVUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsQ0FBaEI7QUFDQSxRQUFJLEdBQUcsR0FBRyxFQUFWOztBQUNBLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQTVCLEVBQW9DLENBQUMsRUFBckMsRUFBeUM7QUFDdkMsVUFBSSxDQUFDLEdBQUcsR0FBSSxLQUFLLENBQWIsS0FBb0IsQ0FBeEIsRUFBMkI7QUFDekIsUUFBQSxHQUFHLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFELENBQW5CO0FBQ0Q7QUFDRjs7QUFDRCxXQUFPLEdBQVA7QUFDRDs7QUFjWSxTQUFOLE1BQU0sQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXO0FBQ3RCLFFBQUksQ0FBQyxHQUFELElBQVEsT0FBTyxHQUFQLElBQWMsUUFBMUIsRUFBb0M7QUFDbEMsYUFBTyxHQUFQO0FBQ0Q7O0FBRUQsUUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQUosQ0FBVyxDQUFYLENBQWI7O0FBQ0EsUUFBSSxNQUFNLElBQUksR0FBVixJQUFpQixNQUFNLElBQUksR0FBL0IsRUFBb0M7QUFDbEMsVUFBSSxJQUFJLEdBQUcsR0FBWDtBQUVBLFlBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFKLENBQVUsUUFBVixDQUFkOztBQUdBLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFuQyxFQUFzQyxDQUFDLElBQUksQ0FBM0MsRUFBOEM7QUFDNUMsUUFBQSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUQsQ0FBZDtBQUNBLGNBQU0sRUFBRSxHQUFHLFVBQVUsQ0FBQyxNQUFYLENBQWtCLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBTCxDQUF2QixDQUFYOztBQUNBLFlBQUksRUFBRSxJQUFJLFVBQVUsQ0FBQyxRQUFyQixFQUErQjtBQUM3QixpQkFBTyxHQUFQO0FBQ0Q7O0FBQ0QsWUFBSSxFQUFFLElBQUksSUFBVixFQUFnQjtBQUNkO0FBQ0Q7O0FBQ0QsWUFBSSxNQUFNLEtBQUssR0FBZixFQUFvQjtBQUNsQixVQUFBLElBQUksSUFBSSxFQUFSO0FBQ0QsU0FGRCxNQUVPLElBQUksTUFBTSxLQUFLLEdBQWYsRUFBb0I7QUFDekIsVUFBQSxJQUFJLElBQUksQ0FBQyxFQUFUO0FBQ0Q7QUFDRjs7QUFDRCxNQUFBLEdBQUcsR0FBRyxJQUFOO0FBQ0QsS0F0QkQsTUFzQk87QUFFTCxZQUFNLElBQUksR0FBRyxVQUFVLENBQUMsTUFBWCxDQUFrQixHQUFsQixDQUFiOztBQUNBLFVBQUksSUFBSSxJQUFJLFVBQVUsQ0FBQyxRQUF2QixFQUFpQztBQUMvQixRQUFBLEdBQUcsR0FBRyxJQUFOO0FBQ0Q7QUFDRjs7QUFFRCxXQUFPLEdBQVA7QUFDRDs7QUFXVSxTQUFKLElBQUksQ0FBQyxFQUFELEVBQUssRUFBTCxFQUFTO0FBQ2xCLElBQUEsRUFBRSxHQUFHLFVBQVUsQ0FBQyxNQUFYLENBQWtCLEVBQWxCLENBQUw7QUFDQSxJQUFBLEVBQUUsR0FBRyxVQUFVLENBQUMsTUFBWCxDQUFrQixFQUFsQixDQUFMOztBQUVBLFFBQUksRUFBRSxJQUFJLFVBQVUsQ0FBQyxRQUFqQixJQUE2QixFQUFFLElBQUksVUFBVSxDQUFDLFFBQWxELEVBQTREO0FBQzFELGFBQU8sVUFBVSxDQUFDLFFBQWxCO0FBQ0Q7O0FBQ0QsV0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFiO0FBQ0Q7O0FBVUQsRUFBQSxRQUFRLEdBQUc7QUFDVCxXQUFPLGVBQWUsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsS0FBSyxJQUF2QixDQUFmLEdBQ0wsZUFESyxHQUNhLFVBQVUsQ0FBQyxNQUFYLENBQWtCLEtBQUssS0FBdkIsQ0FEYixHQUVMLGNBRkssR0FFWSxVQUFVLENBQUMsTUFBWCxDQUFrQixLQUFLLElBQXZCLENBRlosR0FFMkMsSUFGbEQ7QUFHRDs7QUFVRCxFQUFBLFVBQVUsR0FBRztBQUNYLFdBQU87QUFDTCxNQUFBLElBQUksRUFBRSxVQUFVLENBQUMsTUFBWCxDQUFrQixLQUFLLElBQXZCLENBREQ7QUFFTCxNQUFBLEtBQUssRUFBRSxVQUFVLENBQUMsTUFBWCxDQUFrQixLQUFLLEtBQXZCLENBRkY7QUFHTCxNQUFBLElBQUksRUFBRSxVQUFVLENBQUMsTUFBWCxDQUFrQixLQUFLLElBQXZCO0FBSEQsS0FBUDtBQUtEOztBQWNELEVBQUEsT0FBTyxDQUFDLENBQUQsRUFBSTtBQUNULFNBQUssSUFBTCxHQUFZLFVBQVUsQ0FBQyxNQUFYLENBQWtCLENBQWxCLENBQVo7QUFDQSxXQUFPLElBQVA7QUFDRDs7QUFjRCxFQUFBLFVBQVUsQ0FBQyxDQUFELEVBQUk7QUFDWixTQUFLLElBQUwsR0FBWSxVQUFVLENBQUMsTUFBWCxDQUFrQixLQUFLLElBQXZCLEVBQTZCLENBQTdCLENBQVo7QUFDQSxXQUFPLElBQVA7QUFDRDs7QUFhRCxFQUFBLE9BQU8sR0FBRztBQUNSLFdBQU8sVUFBVSxDQUFDLE1BQVgsQ0FBa0IsS0FBSyxJQUF2QixDQUFQO0FBQ0Q7O0FBY0QsRUFBQSxRQUFRLENBQUMsQ0FBRCxFQUFJO0FBQ1YsU0FBSyxLQUFMLEdBQWEsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsQ0FBbEIsQ0FBYjtBQUNBLFdBQU8sSUFBUDtBQUNEOztBQWNELEVBQUEsV0FBVyxDQUFDLENBQUQsRUFBSTtBQUNiLFNBQUssS0FBTCxHQUFhLFVBQVUsQ0FBQyxNQUFYLENBQWtCLEtBQUssS0FBdkIsRUFBOEIsQ0FBOUIsQ0FBYjtBQUNBLFdBQU8sSUFBUDtBQUNEOztBQWFELEVBQUEsUUFBUSxHQUFHO0FBQ1QsV0FBTyxVQUFVLENBQUMsTUFBWCxDQUFrQixLQUFLLEtBQXZCLENBQVA7QUFDRDs7QUFjRCxFQUFBLE9BQU8sQ0FBQyxDQUFELEVBQUk7QUFDVCxTQUFLLElBQUwsR0FBWSxVQUFVLENBQUMsTUFBWCxDQUFrQixDQUFsQixDQUFaO0FBQ0EsV0FBTyxJQUFQO0FBQ0Q7O0FBY0QsRUFBQSxVQUFVLENBQUMsQ0FBRCxFQUFJO0FBQ1osU0FBSyxJQUFMLEdBQVksVUFBVSxDQUFDLE1BQVgsQ0FBa0IsS0FBSyxJQUF2QixFQUE2QixDQUE3QixDQUFaO0FBQ0EsV0FBTyxJQUFQO0FBQ0Q7O0FBYUQsRUFBQSxPQUFPLEdBQUc7QUFDUixXQUFPLFVBQVUsQ0FBQyxNQUFYLENBQWtCLEtBQUssSUFBdkIsQ0FBUDtBQUNEOztBQWVELEVBQUEsVUFBVSxHQUFHO0FBQ1gsV0FBTyxVQUFVLENBQUMsTUFBWCxDQUFrQixLQUFLLElBQUwsR0FBWSxDQUFDLEtBQUssS0FBcEMsQ0FBUDtBQUNEOztBQWNELEVBQUEsWUFBWSxHQUFHO0FBQ2IsV0FBTyxVQUFVLENBQUMsTUFBWCxDQUFrQixLQUFLLEtBQUwsR0FBYSxDQUFDLEtBQUssSUFBckMsQ0FBUDtBQUNEOztBQWNELEVBQUEsU0FBUyxDQUFDLEdBQUQsRUFBTTtBQUNiLFFBQUksR0FBSixFQUFTO0FBQ1AsV0FBSyxXQUFMLENBQWlCLEdBQUcsQ0FBQyxLQUFyQjtBQUNBLFdBQUssVUFBTCxDQUFnQixHQUFHLENBQUMsSUFBcEI7QUFDQSxXQUFLLElBQUwsR0FBWSxLQUFLLEtBQUwsR0FBYSxLQUFLLElBQTlCO0FBQ0Q7O0FBQ0QsV0FBTyxJQUFQO0FBQ0Q7O0FBYUQsRUFBQSxPQUFPLENBQUMsSUFBRCxFQUFPO0FBQ1osd0NBQU8sVUFBUCxFQTVZaUIsVUE0WWpCLG1CQUFPLFVBQVAsRUFBNkIsSUFBN0IsRUFBbUMsSUFBbkMsRUFBeUMsVUFBVSxDQUFDLE1BQXBEO0FBQ0Q7O0FBYUQsRUFBQSxXQUFXLENBQUMsSUFBRCxFQUFPO0FBQ2hCLHdDQUFPLFVBQVAsRUEzWmlCLFVBMlpqQixtQkFBTyxVQUFQLEVBQTZCLElBQTdCLEVBQW1DLElBQW5DLEVBQXlDLFVBQVUsQ0FBQyxLQUFwRDtBQUNEOztBQWFELEVBQUEsT0FBTyxDQUFDLElBQUQsRUFBTztBQUNaLFdBQU8sQ0FBQyxLQUFLLFdBQUwsQ0FBaUIsSUFBakIsQ0FBUjtBQUNEOztBQWFELEVBQUEsUUFBUSxDQUFDLElBQUQsRUFBTztBQUNiLHdDQUFPLFVBQVAsRUF6YmlCLFVBeWJqQixtQkFBTyxVQUFQLEVBQTZCLElBQTdCLEVBQW1DLElBQW5DLEVBQXlDLFVBQVUsQ0FBQyxLQUFwRDtBQUNEOztBQWFELEVBQUEsUUFBUSxDQUFDLElBQUQsRUFBTztBQUNiLHdDQUFPLFVBQVAsRUF4Y2lCLFVBd2NqQixtQkFBTyxVQUFQLEVBQTZCLElBQTdCLEVBQW1DLElBQW5DLEVBQXlDLFVBQVUsQ0FBQyxLQUFwRDtBQUNEOztBQWFELEVBQUEsUUFBUSxDQUFDLElBQUQsRUFBTztBQUNiLHdDQUFPLFVBQVAsRUF2ZGlCLFVBdWRqQixtQkFBTyxVQUFQLEVBQTZCLElBQTdCLEVBQW1DLElBQW5DLEVBQXlDLFVBQVUsQ0FBQyxNQUFwRDtBQUNEOztBQWFELEVBQUEsVUFBVSxDQUFDLElBQUQsRUFBTztBQUNmLHdDQUFPLFVBQVAsRUF0ZWlCLFVBc2VqQixtQkFBTyxVQUFQLEVBQTZCLElBQTdCLEVBQW1DLElBQW5DLEVBQXlDLFVBQVUsQ0FBQyxRQUFwRDtBQUNEOztBQWFELEVBQUEsT0FBTyxDQUFDLElBQUQsRUFBTztBQUNaLFdBQU8sS0FBSyxPQUFMLENBQWEsSUFBYixLQUFzQixLQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBN0I7QUFDRDs7QUFhRCxFQUFBLFFBQVEsQ0FBQyxJQUFELEVBQU87QUFDYixXQUFPLEtBQUssT0FBTCxDQUFhLElBQWIsa0NBQXNCLFVBQXRCLEVBcGdCVSxVQW9nQlYsbUJBQXNCLFVBQXRCLEVBQTRDLElBQTVDLEVBQWtELElBQWxELEVBQXdELFVBQVUsQ0FBQyxNQUFuRSxDQUFQO0FBQ0Q7O0FBYUQsRUFBQSxTQUFTLENBQUMsSUFBRCxFQUFPO0FBQ2Qsd0NBQU8sVUFBUCxFQW5oQmlCLFVBbWhCakIsbUJBQU8sVUFBUCxFQUE2QixJQUE3QixFQUFtQyxJQUFuQyxFQUF5QyxVQUFVLENBQUMsT0FBcEQ7QUFDRDs7QUFwaEI2Qjs7OztvQkFVWixHLEVBQUssSSxFQUFNLEksRUFBTTtBQUNqQyxFQUFBLElBQUksR0FBRyxJQUFJLElBQUksTUFBZjs7QUFDQSxNQUFJLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsTUFBbEIsRUFBMEIsUUFBMUIsQ0FBbUMsSUFBbkMsQ0FBSixFQUE4QztBQUM1QyxXQUFRLENBQUMsR0FBRyxDQUFDLElBQUQsQ0FBSCxHQUFZLElBQWIsS0FBc0IsQ0FBOUI7QUFDRDs7QUFDRCxRQUFNLElBQUksS0FBSix5Q0FBMkMsSUFBM0MsT0FBTjtBQUNEOztBQXVnQkgsVUFBVSxDQUFDLEtBQVgsR0FBbUIsSUFBbkI7QUFDQSxVQUFVLENBQUMsS0FBWCxHQUFtQixJQUFuQjtBQUNBLFVBQVUsQ0FBQyxLQUFYLEdBQW1CLElBQW5CO0FBQ0EsVUFBVSxDQUFDLE1BQVgsR0FBb0IsSUFBcEI7QUFDQSxVQUFVLENBQUMsS0FBWCxHQUFtQixJQUFuQjtBQUNBLFVBQVUsQ0FBQyxRQUFYLEdBQXNCLElBQXRCO0FBQ0EsVUFBVSxDQUFDLE1BQVgsR0FBb0IsSUFBcEI7QUFDQSxVQUFVLENBQUMsT0FBWCxHQUFxQixJQUFyQjtBQUNBLFVBQVUsQ0FBQyxNQUFYLEdBQW9CLElBQXBCO0FBRUEsVUFBVSxDQUFDLFFBQVgsR0FBc0IsVUFBVSxDQUFDLEtBQVgsR0FBbUIsVUFBVSxDQUFDLEtBQTlCLEdBQXNDLFVBQVUsQ0FBQyxNQUFqRCxHQUEwRCxVQUFVLENBQUMsS0FBckUsR0FDcEIsVUFBVSxDQUFDLFFBRFMsR0FDRSxVQUFVLENBQUMsTUFEYixHQUNzQixVQUFVLENBQUMsT0FEakMsR0FDMkMsVUFBVSxDQUFDLE1BRDVFO0FBRUEsVUFBVSxDQUFDLFFBQVgsR0FBc0IsUUFBdEI7OztBQ2pqQkE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBY2UsTUFBTSxPQUFOLENBQWM7QUFLM0IsRUFBQSxXQUFXLENBQUMsUUFBRCxFQUFXLE9BQVgsRUFBb0I7QUFBQTs7QUFBQTs7QUFBQTtBQUFBO0FBQUEsYUFKakI7QUFJaUI7O0FBQUE7QUFBQTtBQUFBLGFBSHJCO0FBR3FCOztBQUFBLG9DQUZ0QixFQUVzQjs7QUFDN0IsNkNBQW1CLFFBQVEsS0FBSyxDQUFDLENBQUQsRUFBSSxDQUFKLEtBQVU7QUFDeEMsYUFBTyxDQUFDLEtBQUssQ0FBTixHQUFVLENBQVYsR0FBYyxDQUFDLEdBQUcsQ0FBSixHQUFRLENBQUMsQ0FBVCxHQUFhLENBQWxDO0FBQ0QsS0FGMEIsQ0FBM0I7O0FBR0EseUNBQWUsT0FBZjtBQUNEOztBQW9ERCxFQUFBLEtBQUssQ0FBQyxFQUFELEVBQUs7QUFDUixXQUFPLEtBQUssTUFBTCxDQUFZLEVBQVosQ0FBUDtBQUNEOztBQVNELEVBQUEsT0FBTyxDQUFDLEVBQUQsRUFBSztBQUNWLElBQUEsRUFBRSxJQUFJLENBQU47QUFDQSxXQUFPLEtBQUssTUFBTCxDQUFZLE1BQVosR0FBcUIsRUFBckIsR0FBMEIsS0FBSyxNQUFMLENBQVksS0FBSyxNQUFMLENBQVksTUFBWixHQUFxQixDQUFyQixHQUF5QixFQUFyQyxDQUExQixHQUFxRSxTQUE1RTtBQUNEOztBQVNELEVBQUEsR0FBRyxHQUFHO0FBQ0osUUFBSSxNQUFKOztBQUVBLFFBQUksU0FBUyxDQUFDLE1BQVYsSUFBb0IsQ0FBcEIsSUFBeUIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFTLENBQUMsQ0FBRCxDQUF2QixDQUE3QixFQUEwRDtBQUN4RCxNQUFBLE1BQU0sR0FBRyxTQUFTLENBQUMsQ0FBRCxDQUFsQjtBQUNELEtBRkQsTUFFTztBQUNMLE1BQUEsTUFBTSxHQUFHLFNBQVQ7QUFDRDs7QUFDRCxTQUFLLElBQUksR0FBVCxJQUFnQixNQUFoQixFQUF3QjtBQUN0Qiw2RUFBbUIsTUFBTSxDQUFDLEdBQUQsQ0FBekIsRUFBZ0MsS0FBSyxNQUFyQztBQUNEO0FBQ0Y7O0FBUUQsRUFBQSxLQUFLLENBQUMsRUFBRCxFQUFLO0FBQ1IsSUFBQSxFQUFFLElBQUksQ0FBTjtBQUNBLFFBQUksQ0FBQyxHQUFHLEtBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsRUFBbkIsRUFBdUIsQ0FBdkIsQ0FBUjs7QUFDQSxRQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBRixHQUFXLENBQXBCLEVBQXVCO0FBQ3JCLGFBQU8sQ0FBQyxDQUFDLENBQUQsQ0FBUjtBQUNEOztBQUNELFdBQU8sU0FBUDtBQUNEOztBQVVELEVBQUEsUUFBUSxDQUFDLEtBQUQsRUFBUSxNQUFSLEVBQWdCO0FBQ3RCLFdBQU8sS0FBSyxNQUFMLENBQVksTUFBWixDQUFtQixLQUFuQixFQUEwQixNQUFNLEdBQUcsS0FBbkMsQ0FBUDtBQUNEOztBQU9ELEVBQUEsTUFBTSxHQUFHO0FBQ1AsV0FBTyxLQUFLLE1BQUwsQ0FBWSxNQUFuQjtBQUNEOztBQU1ELEVBQUEsS0FBSyxHQUFHO0FBQ04sU0FBSyxNQUFMLEdBQWMsRUFBZDtBQUNEOztBQXFCRCxFQUFBLE9BQU8sQ0FBQyxRQUFELEVBQVcsUUFBWCxFQUFxQixTQUFyQixFQUFnQyxPQUFoQyxFQUF5QztBQUM5QyxJQUFBLFFBQVEsR0FBRyxRQUFRLEdBQUcsQ0FBdEI7QUFDQSxJQUFBLFNBQVMsR0FBRyxTQUFTLElBQUksS0FBSyxNQUFMLENBQVksTUFBckM7O0FBQ0EsU0FBSyxJQUFJLENBQUMsR0FBRyxRQUFiLEVBQXVCLENBQUMsR0FBRyxTQUEzQixFQUFzQyxDQUFDLEVBQXZDLEVBQTJDO0FBQ3pDLE1BQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxPQUFkLEVBQXVCLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBdkIsRUFDRyxDQUFDLEdBQUcsUUFBSixHQUFlLEtBQUssTUFBTCxDQUFZLENBQUMsR0FBRyxDQUFoQixDQUFmLEdBQW9DLFNBRHZDLEVBRUcsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFoQixHQUFvQixLQUFLLE1BQUwsQ0FBWSxDQUFDLEdBQUcsQ0FBaEIsQ0FBcEIsR0FBeUMsU0FGNUMsRUFFd0QsQ0FGeEQ7QUFHRDtBQUNGOztBQVVELEVBQUEsSUFBSSxDQUFDLElBQUQsRUFBTyxPQUFQLEVBQWdCO0FBQ2xCLFVBQU07QUFDSixNQUFBO0FBREksK0JBRUYsSUFGRSxvQ0FFRixJQUZFLEVBRWdCLElBRmhCLEVBRXNCLEtBQUssTUFGM0IsRUFFbUMsQ0FBQyxPQUZwQyxDQUFOOztBQUdBLFdBQU8sR0FBUDtBQUNEOztBQWtCRCxFQUFBLE1BQU0sQ0FBQyxRQUFELEVBQVcsT0FBWCxFQUFvQjtBQUN4QixRQUFJLEtBQUssR0FBRyxDQUFaOztBQUNBLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsS0FBSyxNQUFMLENBQVksTUFBaEMsRUFBd0MsQ0FBQyxFQUF6QyxFQUE2QztBQUMzQyxVQUFJLFFBQVEsQ0FBQyxJQUFULENBQWMsT0FBZCxFQUF1QixLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQXZCLEVBQXVDLENBQXZDLENBQUosRUFBK0M7QUFDN0MsYUFBSyxNQUFMLENBQVksS0FBWixJQUFxQixLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQXJCO0FBQ0EsUUFBQSxLQUFLO0FBQ047QUFDRjs7QUFFRCxTQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLEtBQW5CO0FBQ0Q7O0FBcE4wQjs7Ozt1QkFZZCxJLEVBQU0sRyxFQUFLLEssRUFBTztBQUM3QixNQUFJLEtBQUssR0FBRyxDQUFaO0FBQ0EsTUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQUosR0FBYSxDQUF2QjtBQUNBLE1BQUksS0FBSyxHQUFHLENBQVo7QUFDQSxNQUFJLElBQUksR0FBRyxDQUFYO0FBQ0EsTUFBSSxLQUFLLEdBQUcsS0FBWjs7QUFFQSxTQUFPLEtBQUssSUFBSSxHQUFoQixFQUFxQjtBQUNuQixJQUFBLEtBQUssR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFULElBQWdCLENBQWhCLEdBQW9CLENBQTVCO0FBQ0EsSUFBQSxJQUFJLHlCQUFHLElBQUgsb0JBQUcsSUFBSCxFQUFvQixHQUFHLENBQUMsS0FBRCxDQUF2QixFQUFnQyxJQUFoQyxDQUFKOztBQUNBLFFBQUksSUFBSSxHQUFHLENBQVgsRUFBYztBQUNaLE1BQUEsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFoQjtBQUNELEtBRkQsTUFFTyxJQUFJLElBQUksR0FBRyxDQUFYLEVBQWM7QUFDbkIsTUFBQSxHQUFHLEdBQUcsS0FBSyxHQUFHLENBQWQ7QUFDRCxLQUZNLE1BRUE7QUFDTCxNQUFBLEtBQUssR0FBRyxJQUFSO0FBQ0E7QUFDRDtBQUNGOztBQUNELE1BQUksS0FBSixFQUFXO0FBQ1QsV0FBTztBQUNMLE1BQUEsR0FBRyxFQUFFLEtBREE7QUFFTCxNQUFBLEtBQUssRUFBRTtBQUZGLEtBQVA7QUFJRDs7QUFDRCxNQUFJLEtBQUosRUFBVztBQUNULFdBQU87QUFDTCxNQUFBLEdBQUcsRUFBRSxDQUFDO0FBREQsS0FBUDtBQUdEOztBQUVELFNBQU87QUFDTCxJQUFBLEdBQUcsRUFBRSxJQUFJLEdBQUcsQ0FBUCxHQUFXLEtBQUssR0FBRyxDQUFuQixHQUF1QjtBQUR2QixHQUFQO0FBR0Q7O3dCQUdhLEksRUFBTSxHLEVBQUs7QUFDdkIsUUFBTSxLQUFLLDBCQUFHLElBQUgsb0NBQUcsSUFBSCxFQUFxQixJQUFyQixFQUEyQixHQUEzQixFQUFnQyxLQUFoQyxDQUFYOztBQUNBLFFBQU0sS0FBSyxHQUFJLEtBQUssQ0FBQyxLQUFOLDBCQUFlLElBQWYsVUFBRCxHQUFnQyxDQUFoQyxHQUFvQyxDQUFsRDtBQUNBLEVBQUEsR0FBRyxDQUFDLE1BQUosQ0FBVyxLQUFLLENBQUMsR0FBakIsRUFBc0IsS0FBdEIsRUFBNkIsSUFBN0I7QUFDQSxTQUFPLEdBQVA7QUFDRDs7O0FDcEVIOzs7Ozs7O0FBRUE7O0FBS08sTUFBTSxnQkFBZ0IsR0FBRyxHQUF6Qjs7QUFDQSxNQUFNLE9BQU8sR0FBRyxvQkFBbUIsTUFBbkM7O0FBQ0EsTUFBTSxPQUFPLEdBQUcsY0FBYyxPQUE5Qjs7QUFHQSxNQUFNLFNBQVMsR0FBRyxLQUFsQjs7QUFDQSxNQUFNLGNBQWMsR0FBRyxLQUF2Qjs7QUFDQSxNQUFNLFFBQVEsR0FBRyxJQUFqQjs7QUFDQSxNQUFNLFNBQVMsR0FBRyxLQUFsQjs7QUFDQSxNQUFNLFNBQVMsR0FBRyxLQUFsQjs7QUFDQSxNQUFNLFVBQVUsR0FBRyxLQUFuQjs7QUFDQSxNQUFNLFNBQVMsR0FBRyxNQUFsQjs7QUFDQSxNQUFNLFNBQVMsR0FBRyxLQUFsQjs7QUFDQSxNQUFNLFFBQVEsR0FBRyxLQUFqQjs7QUFHQSxNQUFNLFdBQVcsR0FBRyxTQUFwQjs7QUFHQSxNQUFNLG1CQUFtQixHQUFHLENBQTVCOztBQUNBLE1BQU0scUJBQXFCLEdBQUcsQ0FBOUI7O0FBQ0EsTUFBTSxzQkFBc0IsR0FBRyxDQUEvQjs7QUFDQSxNQUFNLHFCQUFxQixHQUFHLENBQTlCOztBQUNBLE1BQU0sbUJBQW1CLEdBQUcsQ0FBNUI7O0FBQ0EsTUFBTSx1QkFBdUIsR0FBRyxDQUFoQzs7QUFDQSxNQUFNLG1CQUFtQixHQUFHLENBQTVCOztBQUNBLE1BQU0sb0JBQW9CLEdBQUcsQ0FBN0I7O0FBQ0EsTUFBTSx3QkFBd0IsR0FBRyxDQUFqQzs7QUFHQSxNQUFNLHVCQUF1QixHQUFHLElBQWhDOztBQUVBLE1BQU0sc0JBQXNCLEdBQUcsSUFBL0I7O0FBR0EsTUFBTSxxQkFBcUIsR0FBRyxFQUE5Qjs7QUFHQSxNQUFNLFFBQVEsR0FBRyxRQUFqQjs7OztBQzdDUDs7Ozs7OztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsSUFBSSxpQkFBSjtBQUNBLElBQUksV0FBSjtBQUdBLE1BQU0sYUFBYSxHQUFHLEdBQXRCO0FBQ0EsTUFBTSxrQkFBa0IsR0FBRyxtQkFBM0I7QUFHQSxNQUFNLFlBQVksR0FBRyxHQUFyQjtBQUNBLE1BQU0saUJBQWlCLEdBQUcsd0JBQTFCO0FBR0EsTUFBTSxVQUFVLEdBQUcsSUFBbkI7QUFDQSxNQUFNLGNBQWMsR0FBRyxFQUF2QjtBQUNBLE1BQU0sWUFBWSxHQUFHLEdBQXJCOztBQUdBLFNBQVMsV0FBVCxDQUFxQixJQUFyQixFQUEyQixRQUEzQixFQUFxQyxPQUFyQyxFQUE4QyxNQUE5QyxFQUFzRDtBQUNwRCxNQUFJLEdBQUcsR0FBRyxJQUFWOztBQUVBLE1BQUksQ0FBQyxNQUFELEVBQVMsT0FBVCxFQUFrQixJQUFsQixFQUF3QixLQUF4QixFQUErQixRQUEvQixDQUF3QyxRQUF4QyxDQUFKLEVBQXVEO0FBQ3JELElBQUEsR0FBRyxhQUFNLFFBQU4sZ0JBQW9CLElBQXBCLENBQUg7O0FBQ0EsUUFBSSxHQUFHLENBQUMsTUFBSixDQUFXLEdBQUcsQ0FBQyxNQUFKLEdBQWEsQ0FBeEIsTUFBK0IsR0FBbkMsRUFBd0M7QUFDdEMsTUFBQSxHQUFHLElBQUksR0FBUDtBQUNEOztBQUNELElBQUEsR0FBRyxJQUFJLE1BQU0sT0FBTixHQUFnQixXQUF2Qjs7QUFDQSxRQUFJLENBQUMsTUFBRCxFQUFTLE9BQVQsRUFBa0IsUUFBbEIsQ0FBMkIsUUFBM0IsQ0FBSixFQUEwQztBQUd4QyxNQUFBLEdBQUcsSUFBSSxLQUFQO0FBQ0Q7O0FBQ0QsSUFBQSxHQUFHLElBQUksYUFBYSxNQUFwQjtBQUNEOztBQUVELFNBQU8sR0FBUDtBQUNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJjLE1BQU0sVUFBTixDQUFpQjtBQWtCOUIsRUFBQSxXQUFXLENBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsY0FBbkIsRUFBbUM7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTtBQUFBO0FBQUEsYUFqQmpDO0FBaUJpQzs7QUFBQTtBQUFBO0FBQUEsYUFoQjdCO0FBZ0I2Qjs7QUFBQTtBQUFBO0FBQUEsYUFmaEM7QUFlZ0M7O0FBQUE7QUFBQTtBQUFBLGFBWnBDO0FBWW9DOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLHVDQXdabEMsU0F4WmtDOztBQUFBLDBDQStaL0IsU0EvWitCOztBQUFBLG9DQXVhckMsU0F2YXFDOztBQUFBLHNEQXNibkIsU0F0Ym1COztBQUFBLG9DQW1jckMsU0FuY3FDOztBQUM1QyxTQUFLLElBQUwsR0FBWSxNQUFNLENBQUMsSUFBbkI7QUFDQSxTQUFLLE1BQUwsR0FBYyxNQUFNLENBQUMsTUFBckI7QUFDQSxTQUFLLE1BQUwsR0FBYyxNQUFNLENBQUMsTUFBckI7QUFFQSxTQUFLLE9BQUwsR0FBZSxRQUFmO0FBQ0EsU0FBSyxhQUFMLEdBQXFCLGNBQXJCOztBQUVBLFFBQUksTUFBTSxDQUFDLFNBQVAsS0FBcUIsSUFBekIsRUFBK0I7QUFFN0I7O0FBQ0EsV0FBSyxXQUFMLEdBQW1CLElBQW5CO0FBQ0QsS0FKRCxNQUlPLElBQUksTUFBTSxDQUFDLFNBQVAsS0FBcUIsSUFBekIsRUFBK0I7QUFHcEM7O0FBQ0EsV0FBSyxXQUFMLEdBQW1CLElBQW5CO0FBQ0Q7O0FBRUQsUUFBSSxDQUFDLEtBQUssV0FBVixFQUF1QjtBQUVyQiwyREFBVSxnR0FBVjs7QUFDQSxZQUFNLElBQUksS0FBSixDQUFVLGdHQUFWLENBQU47QUFDRDtBQUNGOztBQVN5QixTQUFuQixtQkFBbUIsQ0FBQyxVQUFELEVBQWEsV0FBYixFQUEwQjtBQUNsRCxJQUFBLGlCQUFpQixHQUFHLFVBQXBCO0FBQ0EsSUFBQSxXQUFXLEdBQUcsV0FBZDtBQUNEOztBQVVELEVBQUEsT0FBTyxDQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWU7QUFDcEIsV0FBTyxPQUFPLENBQUMsTUFBUixDQUFlLElBQWYsQ0FBUDtBQUNEOztBQVFELEVBQUEsU0FBUyxDQUFDLEtBQUQsRUFBUSxDQUFFOztBQU1uQixFQUFBLFVBQVUsR0FBRyxDQUFFOztBQVNmLEVBQUEsUUFBUSxDQUFDLEdBQUQsRUFBTSxDQUFFOztBQU9oQixFQUFBLFdBQVcsR0FBRztBQUNaLFdBQU8sS0FBUDtBQUNEOztBQU9ELEVBQUEsU0FBUyxHQUFHO0FBQ1YsV0FBTyxLQUFLLFdBQVo7QUFDRDs7QUFNRCxFQUFBLEtBQUssR0FBRztBQUNOLFNBQUssUUFBTCxDQUFjLEdBQWQ7QUFDRDs7QUFNRCxFQUFBLFlBQVksR0FBRztBQUNiO0FBQ0Q7O0FBM0g2Qjs7OztlQTZIekIsSSxFQUFlO0FBQ2xCLE1BQUksVUFBVSxDQUFDLE1BQWYsRUFBdUI7QUFBQSxzQ0FEWCxJQUNXO0FBRFgsTUFBQSxJQUNXO0FBQUE7O0FBQ3JCLElBQUEsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsSUFBbEIsRUFBd0IsR0FBRyxJQUEzQjtBQUNEO0FBQ0Y7OzJCQUdnQjtBQUVmLEVBQUEsWUFBWSx1QkFBQyxJQUFELGNBQVo7O0FBRUEsUUFBTSxPQUFPLEdBQUcsVUFBVSxJQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCx3QkFBWSxJQUFaLHNCQUFvQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTCxFQUF6RCxDQUFKLENBQTFCOztBQUVBLDhDQUF1QiwrQ0FBdUIsY0FBdkIseUJBQXdDLElBQXhDLG9CQUE4RCw4Q0FBc0IsQ0FBM0c7O0FBQ0EsTUFBSSxLQUFLLHdCQUFULEVBQW1DO0FBQ2pDLFNBQUssd0JBQUwsQ0FBOEIsT0FBOUI7QUFDRDs7QUFFRCwwQ0FBa0IsVUFBVSxDQUFDLE1BQU07QUFDakMsNEdBQWdDLElBQWhDLHdDQUFnRSxPQUFoRTs7QUFFQSxRQUFJLHVCQUFDLElBQUQsY0FBSixFQUF1QjtBQUNyQixZQUFNLElBQUksR0FBRyxLQUFLLE9BQUwsRUFBYjs7QUFDQSxVQUFJLEtBQUssd0JBQVQsRUFBbUM7QUFDakMsYUFBSyx3QkFBTCxDQUE4QixDQUE5QixFQUFpQyxJQUFqQztBQUNELE9BRkQsTUFFTztBQUVMLFFBQUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBRWhCLENBRkQ7QUFHRDtBQUNGLEtBVkQsTUFVTyxJQUFJLEtBQUssd0JBQVQsRUFBbUM7QUFDeEMsV0FBSyx3QkFBTCxDQUE4QixDQUFDLENBQS9CO0FBQ0Q7QUFDRixHQWhCMkIsRUFnQnpCLE9BaEJ5QixDQUE1QjtBQWlCRDs7c0JBR1c7QUFDVixFQUFBLFlBQVksdUJBQUMsSUFBRCxjQUFaOztBQUNBLDBDQUFrQixJQUFsQjtBQUNEOzt1QkFHWTtBQUNYLDhDQUFzQixDQUF0QjtBQUNEOztxQkFHVTtBQUNULFFBQU0sVUFBVSxHQUFHLENBQW5CO0FBQ0EsUUFBTSxVQUFVLEdBQUcsQ0FBbkI7QUFDQSxRQUFNLG9CQUFvQixHQUFHLENBQTdCO0FBQ0EsUUFBTSxXQUFXLEdBQUcsQ0FBcEI7QUFDQSxRQUFNLFFBQVEsR0FBRyxDQUFqQjtBQUdBLE1BQUksTUFBTSxHQUFHLElBQWI7QUFFQSxNQUFJLE9BQU8sR0FBRyxJQUFkO0FBQ0EsTUFBSSxPQUFPLEdBQUcsSUFBZDs7QUFFQSxNQUFJLFNBQVMsR0FBSSxJQUFELElBQVU7QUFDeEIsVUFBTSxNQUFNLEdBQUcsSUFBSSxXQUFKLEVBQWY7O0FBQ0EsSUFBQSxNQUFNLENBQUMsa0JBQVAsR0FBNkIsR0FBRCxJQUFTO0FBQ25DLFVBQUksTUFBTSxDQUFDLFVBQVAsSUFBcUIsUUFBckIsSUFBaUMsTUFBTSxDQUFDLE1BQVAsSUFBaUIsR0FBdEQsRUFBMkQ7QUFFekQsY0FBTSxJQUFJLEtBQUosNkJBQStCLE1BQU0sQ0FBQyxNQUF0QyxFQUFOO0FBQ0Q7QUFDRixLQUxEOztBQU9BLElBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxNQUFaLEVBQW9CLElBQXBCLEVBQTBCLElBQTFCO0FBQ0EsV0FBTyxNQUFQO0FBQ0QsR0FYRDs7QUFhQSxNQUFJLFNBQVMsR0FBRyxDQUFDLElBQUQsRUFBTyxPQUFQLEVBQWdCLE1BQWhCLEtBQTJCO0FBQ3pDLFFBQUksTUFBTSxHQUFHLElBQUksV0FBSixFQUFiO0FBQ0EsUUFBSSxnQkFBZ0IsR0FBRyxLQUF2Qjs7QUFFQSxJQUFBLE1BQU0sQ0FBQyxrQkFBUCxHQUE2QixHQUFELElBQVM7QUFDbkMsVUFBSSxNQUFNLENBQUMsVUFBUCxJQUFxQixRQUF6QixFQUFtQztBQUNqQyxZQUFJLE1BQU0sQ0FBQyxNQUFQLElBQWlCLEdBQXJCLEVBQTBCO0FBQ3hCLGNBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLFlBQWxCLEVBQWdDLHNCQUFoQyxDQUFWO0FBQ0EsVUFBQSxNQUFNLEdBQUcsSUFBSSxHQUFHLE9BQVAsR0FBaUIsR0FBRyxDQUFDLElBQUosQ0FBUyxNQUFULENBQWdCLEdBQTFDO0FBQ0EsVUFBQSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQUQsQ0FBbEI7QUFDQSxVQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWjs7QUFDQSxjQUFJLEtBQUssTUFBVCxFQUFpQjtBQUNmLGlCQUFLLE1BQUw7QUFDRDs7QUFFRCxjQUFJLE9BQUosRUFBYTtBQUNYLFlBQUEsZ0JBQWdCLEdBQUcsSUFBbkI7QUFDQSxZQUFBLE9BQU87QUFDUjs7QUFFRCxjQUFJLEtBQUssYUFBVCxFQUF3QjtBQUN0QjtBQUNEO0FBQ0YsU0FqQkQsTUFpQk8sSUFBSSxNQUFNLENBQUMsTUFBUCxHQUFnQixHQUFwQixFQUF5QjtBQUM5QixjQUFJLEtBQUssU0FBVCxFQUFvQjtBQUNsQixpQkFBSyxTQUFMLENBQWUsTUFBTSxDQUFDLFlBQXRCO0FBQ0Q7O0FBQ0QsVUFBQSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQUQsQ0FBbEI7QUFDQSxVQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWjtBQUNELFNBTk0sTUFNQTtBQUVMLGNBQUksTUFBTSxJQUFJLENBQUMsZ0JBQWYsRUFBaUM7QUFDL0IsWUFBQSxnQkFBZ0IsR0FBRyxJQUFuQjtBQUNBLFlBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFSLENBQU47QUFDRDs7QUFDRCxjQUFJLEtBQUssU0FBTCxJQUFrQixNQUFNLENBQUMsWUFBN0IsRUFBMkM7QUFDekMsaUJBQUssU0FBTCxDQUFlLE1BQU0sQ0FBQyxZQUF0QjtBQUNEOztBQUNELGNBQUksS0FBSyxZQUFULEVBQXVCO0FBQ3JCLGtCQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBUCxLQUFrQiwyQ0FBbUIsWUFBbkIsR0FBa0MsYUFBcEQsQ0FBYjtBQUNBLGtCQUFNLElBQUksR0FBRyxNQUFNLENBQUMsWUFBUCxLQUF3QiwyQ0FBbUIsaUJBQW5CLEdBQXVDLGtCQUEvRCxDQUFiO0FBQ0EsaUJBQUssWUFBTCxDQUFrQixJQUFJLEtBQUosQ0FBVSxJQUFJLEdBQUcsSUFBUCxHQUFjLElBQWQsR0FBcUIsR0FBL0IsQ0FBbEIsRUFBdUQsSUFBdkQ7QUFDRDs7QUFHRCxVQUFBLE1BQU0sR0FBRyxJQUFUOztBQUNBLGNBQUksdUJBQUMsSUFBRCxrQkFBcUIsS0FBSyxhQUE5QixFQUE2QztBQUMzQztBQUNEO0FBQ0Y7QUFDRjtBQUNGLEtBL0NEOztBQWdEQSxJQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBWixFQUFtQixJQUFuQixFQUF5QixJQUF6QjtBQUNBLFdBQU8sTUFBUDtBQUNELEdBdEREOztBQXdEQSxPQUFLLE9BQUwsR0FBZSxDQUFDLEtBQUQsRUFBUSxLQUFSLEtBQWtCO0FBQy9CLDZDQUFtQixLQUFuQjs7QUFFQSxRQUFJLE9BQUosRUFBYTtBQUNYLFVBQUksQ0FBQyxLQUFMLEVBQVk7QUFDVixlQUFPLE9BQU8sQ0FBQyxPQUFSLEVBQVA7QUFDRDs7QUFDRCxNQUFBLE9BQU8sQ0FBQyxrQkFBUixHQUE2QixTQUE3Qjs7QUFDQSxNQUFBLE9BQU8sQ0FBQyxLQUFSOztBQUNBLE1BQUEsT0FBTyxHQUFHLElBQVY7QUFDRDs7QUFFRCxRQUFJLEtBQUosRUFBVztBQUNULFdBQUssSUFBTCxHQUFZLEtBQVo7QUFDRDs7QUFFRCxXQUFPLElBQUksT0FBSixDQUFZLENBQUMsT0FBRCxFQUFVLE1BQVYsS0FBcUI7QUFDdEMsWUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEtBQUssSUFBTixFQUFZLEtBQUssTUFBTCxHQUFjLE9BQWQsR0FBd0IsTUFBcEMsRUFBNEMsS0FBSyxPQUFqRCxFQUEwRCxLQUFLLE1BQS9ELENBQXZCOztBQUNBLDJEQUFVLGdCQUFWLEVBQTRCLEdBQTVCOztBQUNBLE1BQUEsT0FBTyxHQUFHLFNBQVMsQ0FBQyxHQUFELEVBQU0sT0FBTixFQUFlLE1BQWYsQ0FBbkI7O0FBQ0EsTUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLElBQWI7QUFDRCxLQUxNLEVBS0osS0FMSSxDQUtHLEdBQUQsSUFBUztBQUNoQiwyREFBVSx1QkFBVixFQUFtQyxHQUFuQztBQUNELEtBUE0sQ0FBUDtBQVFELEdBeEJEOztBQTBCQSxPQUFLLFNBQUwsR0FBa0IsS0FBRCxJQUFXO0FBQzFCOztBQUNBLFNBQUssT0FBTCxDQUFhLElBQWIsRUFBbUIsS0FBbkI7QUFDRCxHQUhEOztBQUtBLE9BQUssVUFBTCxHQUFrQixNQUFNO0FBQ3RCLDZDQUFtQixJQUFuQjs7QUFDQTs7QUFFQSxRQUFJLE9BQUosRUFBYTtBQUNYLE1BQUEsT0FBTyxDQUFDLGtCQUFSLEdBQTZCLFNBQTdCOztBQUNBLE1BQUEsT0FBTyxDQUFDLEtBQVI7O0FBQ0EsTUFBQSxPQUFPLEdBQUcsSUFBVjtBQUNEOztBQUNELFFBQUksT0FBSixFQUFhO0FBQ1gsTUFBQSxPQUFPLENBQUMsa0JBQVIsR0FBNkIsU0FBN0I7O0FBQ0EsTUFBQSxPQUFPLENBQUMsS0FBUjs7QUFDQSxNQUFBLE9BQU8sR0FBRyxJQUFWO0FBQ0Q7O0FBRUQsUUFBSSxLQUFLLFlBQVQsRUFBdUI7QUFDckIsV0FBSyxZQUFMLENBQWtCLElBQUksS0FBSixDQUFVLGlCQUFpQixHQUFHLElBQXBCLEdBQTJCLFlBQTNCLEdBQTBDLEdBQXBELENBQWxCLEVBQTRFLFlBQTVFO0FBQ0Q7O0FBRUQsSUFBQSxNQUFNLEdBQUcsSUFBVDtBQUNELEdBcEJEOztBQXNCQSxPQUFLLFFBQUwsR0FBaUIsR0FBRCxJQUFTO0FBQ3ZCLElBQUEsT0FBTyxHQUFHLFNBQVMsQ0FBQyxNQUFELENBQW5COztBQUNBLFFBQUksT0FBTyxJQUFLLE9BQU8sQ0FBQyxVQUFSLElBQXNCLFVBQXRDLEVBQW1EO0FBQ2pELE1BQUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxHQUFiO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsWUFBTSxJQUFJLEtBQUosQ0FBVSwrQkFBVixDQUFOO0FBQ0Q7QUFDRixHQVBEOztBQVNBLE9BQUssV0FBTCxHQUFtQixNQUFNO0FBQ3ZCLFdBQVEsT0FBTyxJQUFJLElBQW5CO0FBQ0QsR0FGRDtBQUdEOztxQkFHVTtBQUNULE9BQUssT0FBTCxHQUFlLENBQUMsS0FBRCxFQUFRLEtBQVIsS0FBa0I7QUFDL0IsNkNBQW1CLEtBQW5COztBQUVBLDhCQUFJLElBQUosWUFBa0I7QUFDaEIsVUFBSSxDQUFDLEtBQUQsSUFBVSxxQ0FBYSxVQUFiLElBQTJCLHFDQUFhLElBQXRELEVBQTREO0FBQzFELGVBQU8sT0FBTyxDQUFDLE9BQVIsRUFBUDtBQUNEOztBQUNELDJDQUFhLEtBQWI7O0FBQ0EsMkNBQWUsSUFBZjtBQUNEOztBQUVELFFBQUksS0FBSixFQUFXO0FBQ1QsV0FBSyxJQUFMLEdBQVksS0FBWjtBQUNEOztBQUVELFdBQU8sSUFBSSxPQUFKLENBQVksQ0FBQyxPQUFELEVBQVUsTUFBVixLQUFxQjtBQUN0QyxZQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsS0FBSyxJQUFOLEVBQVksS0FBSyxNQUFMLEdBQWMsS0FBZCxHQUFzQixJQUFsQyxFQUF3QyxLQUFLLE9BQTdDLEVBQXNELEtBQUssTUFBM0QsQ0FBdkI7O0FBRUEsMkRBQVUsaUJBQVYsRUFBNkIsR0FBN0I7O0FBSUEsWUFBTSxJQUFJLEdBQUcsSUFBSSxpQkFBSixDQUFzQixHQUF0QixDQUFiOztBQUVBLE1BQUEsSUFBSSxDQUFDLE9BQUwsR0FBZ0IsR0FBRCxJQUFTO0FBQ3RCLFFBQUEsTUFBTSxDQUFDLEdBQUQsQ0FBTjtBQUNELE9BRkQ7O0FBSUEsTUFBQSxJQUFJLENBQUMsTUFBTCxHQUFlLEdBQUQsSUFBUztBQUNyQixZQUFJLEtBQUssYUFBVCxFQUF3QjtBQUN0QjtBQUNEOztBQUVELFlBQUksS0FBSyxNQUFULEVBQWlCO0FBQ2YsZUFBSyxNQUFMO0FBQ0Q7O0FBRUQsUUFBQSxPQUFPO0FBQ1IsT0FWRDs7QUFZQSxNQUFBLElBQUksQ0FBQyxPQUFMLEdBQWdCLEdBQUQsSUFBUztBQUN0Qiw2Q0FBZSxJQUFmOztBQUVBLFlBQUksS0FBSyxZQUFULEVBQXVCO0FBQ3JCLGdCQUFNLElBQUksR0FBRywyQ0FBbUIsWUFBbkIsR0FBa0MsYUFBL0M7QUFDQSxlQUFLLFlBQUwsQ0FBa0IsSUFBSSxLQUFKLENBQVUsMkNBQW1CLGlCQUFuQixHQUF1QyxrQkFBa0IsR0FDbkYsSUFEaUUsR0FDMUQsSUFEMEQsR0FDbkQsR0FERSxDQUFsQixFQUNzQixJQUR0QjtBQUVEOztBQUVELFlBQUksdUJBQUMsSUFBRCxrQkFBcUIsS0FBSyxhQUE5QixFQUE2QztBQUMzQztBQUNEO0FBQ0YsT0FaRDs7QUFjQSxNQUFBLElBQUksQ0FBQyxTQUFMLEdBQWtCLEdBQUQsSUFBUztBQUN4QixZQUFJLEtBQUssU0FBVCxFQUFvQjtBQUNsQixlQUFLLFNBQUwsQ0FBZSxHQUFHLENBQUMsSUFBbkI7QUFDRDtBQUNGLE9BSkQ7O0FBTUEsMkNBQWUsSUFBZjtBQUNELEtBOUNNLENBQVA7QUErQ0QsR0E5REQ7O0FBZ0VBLE9BQUssU0FBTCxHQUFrQixLQUFELElBQVc7QUFDMUI7O0FBQ0EsU0FBSyxPQUFMLENBQWEsSUFBYixFQUFtQixLQUFuQjtBQUNELEdBSEQ7O0FBS0EsT0FBSyxVQUFMLEdBQWtCLE1BQU07QUFDdEIsNkNBQW1CLElBQW5COztBQUNBOztBQUVBLFFBQUksdUJBQUMsSUFBRCxVQUFKLEVBQW1CO0FBQ2pCO0FBQ0Q7O0FBQ0QseUNBQWEsS0FBYjs7QUFDQSx5Q0FBZSxJQUFmO0FBQ0QsR0FURDs7QUFXQSxPQUFLLFFBQUwsR0FBaUIsR0FBRCxJQUFTO0FBQ3ZCLFFBQUksd0NBQWlCLHFDQUFhLFVBQWIsSUFBMkIscUNBQWEsSUFBN0QsRUFBb0U7QUFDbEUsMkNBQWEsSUFBYixDQUFrQixHQUFsQjtBQUNELEtBRkQsTUFFTztBQUNMLFlBQU0sSUFBSSxLQUFKLENBQVUsNEJBQVYsQ0FBTjtBQUNEO0FBQ0YsR0FORDs7QUFRQSxPQUFLLFdBQUwsR0FBbUIsTUFBTTtBQUN2QixXQUFRLHdDQUFpQixxQ0FBYSxVQUFiLElBQTJCLHFDQUFhLElBQWpFO0FBQ0QsR0FGRDtBQUdEOztBQXdESCxVQUFVLENBQUMsYUFBWCxHQUEyQixhQUEzQjtBQUNBLFVBQVUsQ0FBQyxrQkFBWCxHQUFnQyxrQkFBaEM7QUFDQSxVQUFVLENBQUMsWUFBWCxHQUEwQixZQUExQjtBQUNBLFVBQVUsQ0FBQyxpQkFBWCxHQUErQixpQkFBL0I7OztBQ3JoQkE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTUEsTUFBTSxVQUFVLEdBQUcsQ0FBbkI7QUFDQSxNQUFNLE9BQU8sR0FBRyxZQUFoQjtBQUVBLElBQUksV0FBSjs7Ozs7Ozs7QUFFZSxNQUFNLEVBQU4sQ0FBUztBQVN0QixFQUFBLFdBQVcsQ0FBQyxPQUFELEVBQVUsTUFBVixFQUFrQjtBQUFBOztBQUFBO0FBQUE7QUFBQSxhQVJsQixZQUFXLENBQUU7QUFRSzs7QUFBQTtBQUFBO0FBQUEsYUFQbkIsWUFBVyxDQUFFO0FBT007O0FBQUEsZ0NBSnhCLElBSXdCOztBQUFBLHNDQUZsQixLQUVrQjs7QUFDM0IsMENBQWdCLE9BQU8sMEJBQUksSUFBSixXQUF2Qjs7QUFDQSx5Q0FBZSxNQUFNLDBCQUFJLElBQUosVUFBckI7QUFDRDs7QUE4QkQsRUFBQSxZQUFZLEdBQUc7QUFDYixXQUFPLElBQUksT0FBSixDQUFZLENBQUMsT0FBRCxFQUFVLE1BQVYsS0FBcUI7QUFFdEMsWUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLElBQVosQ0FBaUIsT0FBakIsRUFBMEIsVUFBMUIsQ0FBWjs7QUFDQSxNQUFBLEdBQUcsQ0FBQyxTQUFKLEdBQWlCLEtBQUQsSUFBVztBQUN6QixhQUFLLEVBQUwsR0FBVSxLQUFLLENBQUMsTUFBTixDQUFhLE1BQXZCO0FBQ0EsYUFBSyxRQUFMLEdBQWdCLEtBQWhCO0FBQ0EsUUFBQSxPQUFPLENBQUMsS0FBSyxFQUFOLENBQVA7QUFDRCxPQUpEOztBQUtBLE1BQUEsR0FBRyxDQUFDLE9BQUosR0FBZSxLQUFELElBQVc7QUFDdkIsd0RBQWEsUUFBYixFQUF1QixzQkFBdkIsRUFBK0MsS0FBL0M7O0FBQ0EsUUFBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFkLENBQU47O0FBQ0EseURBQWMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUEzQjtBQUNELE9BSkQ7O0FBS0EsTUFBQSxHQUFHLENBQUMsZUFBSixHQUFzQixVQUFTLEtBQVQsRUFBZ0I7QUFDcEMsYUFBSyxFQUFMLEdBQVUsS0FBSyxDQUFDLE1BQU4sQ0FBYSxNQUF2Qjs7QUFFQSxhQUFLLEVBQUwsQ0FBUSxPQUFSLEdBQWtCLFVBQVMsS0FBVCxFQUFnQjtBQUNoQywwREFBYSxRQUFiLEVBQXVCLDBCQUF2QixFQUFtRCxLQUFuRDs7QUFDQSwyREFBYyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQTNCO0FBQ0QsU0FIRDs7QUFPQSxhQUFLLEVBQUwsQ0FBUSxpQkFBUixDQUEwQixPQUExQixFQUFtQztBQUNqQyxVQUFBLE9BQU8sRUFBRTtBQUR3QixTQUFuQztBQUtBLGFBQUssRUFBTCxDQUFRLGlCQUFSLENBQTBCLE1BQTFCLEVBQWtDO0FBQ2hDLFVBQUEsT0FBTyxFQUFFO0FBRHVCLFNBQWxDO0FBS0EsYUFBSyxFQUFMLENBQVEsaUJBQVIsQ0FBMEIsY0FBMUIsRUFBMEM7QUFDeEMsVUFBQSxPQUFPLEVBQUUsQ0FBQyxPQUFELEVBQVUsS0FBVjtBQUQrQixTQUExQztBQUtBLGFBQUssRUFBTCxDQUFRLGlCQUFSLENBQTBCLFNBQTFCLEVBQXFDO0FBQ25DLFVBQUEsT0FBTyxFQUFFLENBQUMsT0FBRCxFQUFVLEtBQVY7QUFEMEIsU0FBckM7QUFHRCxPQTVCRDtBQTZCRCxLQTFDTSxDQUFQO0FBMkNEOztBQUtELEVBQUEsY0FBYyxHQUFHO0FBRWYsUUFBSSxLQUFLLEVBQVQsRUFBYTtBQUNYLFdBQUssRUFBTCxDQUFRLEtBQVI7QUFDQSxXQUFLLEVBQUwsR0FBVSxJQUFWO0FBQ0Q7O0FBQ0QsV0FBTyxJQUFJLE9BQUosQ0FBWSxDQUFDLE9BQUQsRUFBVSxNQUFWLEtBQXFCO0FBQ3RDLFlBQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxjQUFaLENBQTJCLE9BQTNCLENBQVo7O0FBQ0EsTUFBQSxHQUFHLENBQUMsU0FBSixHQUFnQixVQUFTLEtBQVQsRUFBZ0I7QUFDOUIsWUFBSSxLQUFLLEVBQVQsRUFBYTtBQUNYLGVBQUssRUFBTCxDQUFRLEtBQVI7QUFDRDs7QUFDRCxjQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUosQ0FBVSxTQUFWLENBQVo7O0FBQ0Esd0RBQWEsUUFBYixFQUF1QixnQkFBdkIsRUFBeUMsR0FBekM7O0FBQ0EsUUFBQSxNQUFNLENBQUMsR0FBRCxDQUFOO0FBQ0QsT0FQRDs7QUFRQSxNQUFBLEdBQUcsQ0FBQyxTQUFKLEdBQWlCLEtBQUQsSUFBVztBQUN6QixhQUFLLEVBQUwsR0FBVSxJQUFWO0FBQ0EsYUFBSyxRQUFMLEdBQWdCLElBQWhCO0FBQ0EsUUFBQSxPQUFPLENBQUMsSUFBRCxDQUFQO0FBQ0QsT0FKRDs7QUFLQSxNQUFBLEdBQUcsQ0FBQyxPQUFKLEdBQWUsS0FBRCxJQUFXO0FBQ3ZCLHdEQUFhLFFBQWIsRUFBdUIsZ0JBQXZCLEVBQXlDLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBdEQ7O0FBQ0EsUUFBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFkLENBQU47QUFDRCxPQUhEO0FBSUQsS0FuQk0sQ0FBUDtBQW9CRDs7QUFPRCxFQUFBLE9BQU8sR0FBRztBQUNSLFdBQU8sQ0FBQyxDQUFDLEtBQUssRUFBZDtBQUNEOztBQVVELEVBQUEsUUFBUSxDQUFDLEtBQUQsRUFBUTtBQUNkLFFBQUksQ0FBQyxLQUFLLE9BQUwsRUFBTCxFQUFxQjtBQUNuQixhQUFPLEtBQUssUUFBTCxHQUNMLE9BQU8sQ0FBQyxPQUFSLEVBREssR0FFTCxPQUFPLENBQUMsTUFBUixDQUFlLElBQUksS0FBSixDQUFVLGlCQUFWLENBQWYsQ0FGRjtBQUdEOztBQUNELFdBQU8sSUFBSSxPQUFKLENBQVksQ0FBQyxPQUFELEVBQVUsTUFBVixLQUFxQjtBQUN0QyxZQUFNLEdBQUcsR0FBRyxLQUFLLEVBQUwsQ0FBUSxXQUFSLENBQW9CLENBQUMsT0FBRCxDQUFwQixFQUErQixXQUEvQixDQUFaOztBQUNBLE1BQUEsR0FBRyxDQUFDLFVBQUosR0FBa0IsS0FBRCxJQUFXO0FBQzFCLFFBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsTUFBZCxDQUFQO0FBQ0QsT0FGRDs7QUFHQSxNQUFBLEdBQUcsQ0FBQyxPQUFKLEdBQWUsS0FBRCxJQUFXO0FBQ3ZCLHdEQUFhLFFBQWIsRUFBdUIsVUFBdkIsRUFBbUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFoRDs7QUFDQSxRQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQWQsQ0FBTjtBQUNELE9BSEQ7O0FBSUEsWUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsT0FBaEIsRUFBeUIsR0FBekIsQ0FBNkIsS0FBSyxDQUFDLElBQW5DLENBQVo7O0FBQ0EsTUFBQSxHQUFHLENBQUMsU0FBSixHQUFpQixLQUFELElBQVc7QUFDekIsUUFBQSxHQUFHLENBQUMsV0FBSixDQUFnQixPQUFoQixFQUF5QixHQUF6Qiw4QkFBNkIsRUFBN0IsRUF6SmEsRUF5SmIsd0JBQTZCLEVBQTdCLEVBQWdELEdBQUcsQ0FBQyxNQUFwRCxFQUE0RCxLQUE1RDtBQUNBLFFBQUEsR0FBRyxDQUFDLE1BQUo7QUFDRCxPQUhEO0FBSUQsS0FkTSxDQUFQO0FBZUQ7O0FBU0QsRUFBQSxrQkFBa0IsQ0FBQyxJQUFELEVBQU8sT0FBUCxFQUFnQjtBQUNoQyxRQUFJLENBQUMsS0FBSyxPQUFMLEVBQUwsRUFBcUI7QUFDbkIsYUFBTyxLQUFLLFFBQUwsR0FDTCxPQUFPLENBQUMsT0FBUixFQURLLEdBRUwsT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFJLEtBQUosQ0FBVSxpQkFBVixDQUFmLENBRkY7QUFHRDs7QUFDRCxXQUFPLElBQUksT0FBSixDQUFZLENBQUMsT0FBRCxFQUFVLE1BQVYsS0FBcUI7QUFDdEMsWUFBTSxHQUFHLEdBQUcsS0FBSyxFQUFMLENBQVEsV0FBUixDQUFvQixDQUFDLE9BQUQsQ0FBcEIsRUFBK0IsV0FBL0IsQ0FBWjs7QUFDQSxNQUFBLEdBQUcsQ0FBQyxVQUFKLEdBQWtCLEtBQUQsSUFBVztBQUMxQixRQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLE1BQWQsQ0FBUDtBQUNELE9BRkQ7O0FBR0EsTUFBQSxHQUFHLENBQUMsT0FBSixHQUFlLEtBQUQsSUFBVztBQUN2Qix3REFBYSxRQUFiLEVBQXVCLG9CQUF2QixFQUE2QyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQTFEOztBQUNBLFFBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBZCxDQUFOO0FBQ0QsT0FIRDs7QUFJQSxZQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsV0FBSixDQUFnQixPQUFoQixFQUF5QixHQUF6QixDQUE2QixJQUE3QixDQUFaOztBQUNBLE1BQUEsR0FBRyxDQUFDLFNBQUosR0FBaUIsS0FBRCxJQUFXO0FBQ3pCLGNBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFOLENBQWEsTUFBM0I7O0FBQ0EsWUFBSSxLQUFLLENBQUMsUUFBTixJQUFrQixPQUF0QixFQUErQjtBQUM3QixVQUFBLEtBQUssQ0FBQyxRQUFOLEdBQWlCLElBQWpCO0FBQ0EsVUFBQSxHQUFHLENBQUMsV0FBSixDQUFnQixPQUFoQixFQUF5QixHQUF6QixDQUE2QixLQUE3QjtBQUNEOztBQUNELFFBQUEsR0FBRyxDQUFDLE1BQUo7QUFDRCxPQVBEO0FBUUQsS0FsQk0sQ0FBUDtBQW1CRDs7QUFRRCxFQUFBLFFBQVEsQ0FBQyxJQUFELEVBQU87QUFDYixRQUFJLENBQUMsS0FBSyxPQUFMLEVBQUwsRUFBcUI7QUFDbkIsYUFBTyxLQUFLLFFBQUwsR0FDTCxPQUFPLENBQUMsT0FBUixFQURLLEdBRUwsT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFJLEtBQUosQ0FBVSxpQkFBVixDQUFmLENBRkY7QUFHRDs7QUFDRCxXQUFPLElBQUksT0FBSixDQUFZLENBQUMsT0FBRCxFQUFVLE1BQVYsS0FBcUI7QUFDdEMsWUFBTSxHQUFHLEdBQUcsS0FBSyxFQUFMLENBQVEsV0FBUixDQUFvQixDQUFDLE9BQUQsRUFBVSxjQUFWLEVBQTBCLFNBQTFCLENBQXBCLEVBQTBELFdBQTFELENBQVo7O0FBQ0EsTUFBQSxHQUFHLENBQUMsVUFBSixHQUFrQixLQUFELElBQVc7QUFDMUIsUUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxNQUFkLENBQVA7QUFDRCxPQUZEOztBQUdBLE1BQUEsR0FBRyxDQUFDLE9BQUosR0FBZSxLQUFELElBQVc7QUFDdkIsd0RBQWEsUUFBYixFQUF1QixVQUF2QixFQUFtQyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQWhEOztBQUNBLFFBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBZCxDQUFOO0FBQ0QsT0FIRDs7QUFJQSxNQUFBLEdBQUcsQ0FBQyxXQUFKLENBQWdCLE9BQWhCLEVBQXlCLE1BQXpCLENBQWdDLFdBQVcsQ0FBQyxJQUFaLENBQWlCLElBQWpCLENBQWhDO0FBQ0EsTUFBQSxHQUFHLENBQUMsV0FBSixDQUFnQixjQUFoQixFQUFnQyxNQUFoQyxDQUF1QyxXQUFXLENBQUMsS0FBWixDQUFrQixDQUFDLElBQUQsRUFBTyxHQUFQLENBQWxCLEVBQStCLENBQUMsSUFBRCxFQUFPLEdBQVAsQ0FBL0IsQ0FBdkM7QUFDQSxNQUFBLEdBQUcsQ0FBQyxXQUFKLENBQWdCLFNBQWhCLEVBQTJCLE1BQTNCLENBQWtDLFdBQVcsQ0FBQyxLQUFaLENBQWtCLENBQUMsSUFBRCxFQUFPLENBQVAsQ0FBbEIsRUFBNkIsQ0FBQyxJQUFELEVBQU8sTUFBTSxDQUFDLGdCQUFkLENBQTdCLENBQWxDO0FBQ0EsTUFBQSxHQUFHLENBQUMsTUFBSjtBQUNELEtBYk0sQ0FBUDtBQWNEOztBQVNELEVBQUEsU0FBUyxDQUFDLFFBQUQsRUFBVyxPQUFYLEVBQW9CO0FBQzNCLGtDQUFPLElBQVAsa0NBQU8sSUFBUCxFQUF3QixPQUF4QixFQUFpQyxRQUFqQyxFQUEyQyxPQUEzQztBQUNEOztBQVFELEVBQUEsZ0JBQWdCLENBQUMsS0FBRCxFQUFRLEdBQVIsRUFBYTtBQUMzQixpQ0FBQSxFQUFFLEVBL09lLEVBK09mLG9CQUFGLE1BQUEsRUFBRSxFQUFtQixLQUFuQixFQUEwQixHQUExQixDQUFGO0FBQ0Q7O0FBVUQsRUFBQSxPQUFPLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVztBQUNoQixRQUFJLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLENBQW5CLElBQXdCLEdBQUcsS0FBSyxTQUFwQyxFQUErQztBQUU3QztBQUNEOztBQUNELFFBQUksQ0FBQyxLQUFLLE9BQUwsRUFBTCxFQUFxQjtBQUNuQixhQUFPLEtBQUssUUFBTCxHQUNMLE9BQU8sQ0FBQyxPQUFSLEVBREssR0FFTCxPQUFPLENBQUMsTUFBUixDQUFlLElBQUksS0FBSixDQUFVLGlCQUFWLENBQWYsQ0FGRjtBQUdEOztBQUNELFdBQU8sSUFBSSxPQUFKLENBQVksQ0FBQyxPQUFELEVBQVUsTUFBVixLQUFxQjtBQUN0QyxZQUFNLEdBQUcsR0FBRyxLQUFLLEVBQUwsQ0FBUSxXQUFSLENBQW9CLENBQUMsTUFBRCxDQUFwQixFQUE4QixXQUE5QixDQUFaOztBQUNBLE1BQUEsR0FBRyxDQUFDLFVBQUosR0FBa0IsS0FBRCxJQUFXO0FBQzFCLFFBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsTUFBZCxDQUFQO0FBQ0QsT0FGRDs7QUFHQSxNQUFBLEdBQUcsQ0FBQyxPQUFKLEdBQWUsS0FBRCxJQUFXO0FBQ3ZCLHdEQUFhLFFBQWIsRUFBdUIsU0FBdkIsRUFBa0MsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUEvQzs7QUFDQSxRQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQWQsQ0FBTjtBQUNELE9BSEQ7O0FBSUEsTUFBQSxHQUFHLENBQUMsV0FBSixDQUFnQixNQUFoQixFQUF3QixHQUF4QixDQUE0QjtBQUMxQixRQUFBLEdBQUcsRUFBRSxHQURxQjtBQUUxQixRQUFBLE1BQU0sRUFBRTtBQUZrQixPQUE1QjtBQUlBLE1BQUEsR0FBRyxDQUFDLE1BQUo7QUFDRCxLQWRNLENBQVA7QUFlRDs7QUFRRCxFQUFBLE9BQU8sQ0FBQyxHQUFELEVBQU07QUFDWCxRQUFJLENBQUMsS0FBSyxPQUFMLEVBQUwsRUFBcUI7QUFDbkIsYUFBTyxLQUFLLFFBQUwsR0FDTCxPQUFPLENBQUMsT0FBUixFQURLLEdBRUwsT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFJLEtBQUosQ0FBVSxpQkFBVixDQUFmLENBRkY7QUFHRDs7QUFDRCxXQUFPLElBQUksT0FBSixDQUFZLENBQUMsT0FBRCxFQUFVLE1BQVYsS0FBcUI7QUFDdEMsWUFBTSxHQUFHLEdBQUcsS0FBSyxFQUFMLENBQVEsV0FBUixDQUFvQixDQUFDLE1BQUQsQ0FBcEIsRUFBOEIsV0FBOUIsQ0FBWjs7QUFDQSxNQUFBLEdBQUcsQ0FBQyxVQUFKLEdBQWtCLEtBQUQsSUFBVztBQUMxQixRQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLE1BQWQsQ0FBUDtBQUNELE9BRkQ7O0FBR0EsTUFBQSxHQUFHLENBQUMsT0FBSixHQUFlLEtBQUQsSUFBVztBQUN2Qix3REFBYSxRQUFiLEVBQXVCLFNBQXZCLEVBQWtDLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBL0M7O0FBQ0EsUUFBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFkLENBQU47QUFDRCxPQUhEOztBQUlBLE1BQUEsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsTUFBaEIsRUFBd0IsTUFBeEIsQ0FBK0IsV0FBVyxDQUFDLElBQVosQ0FBaUIsR0FBakIsQ0FBL0I7QUFDQSxNQUFBLEdBQUcsQ0FBQyxNQUFKO0FBQ0QsS0FYTSxDQUFQO0FBWUQ7O0FBU0QsRUFBQSxRQUFRLENBQUMsUUFBRCxFQUFXLE9BQVgsRUFBb0I7QUFDMUIsa0NBQU8sSUFBUCxrQ0FBTyxJQUFQLEVBQXdCLE1BQXhCLEVBQWdDLFFBQWhDLEVBQTBDLE9BQTFDO0FBQ0Q7O0FBUUQsRUFBQSxPQUFPLENBQUMsR0FBRCxFQUFNO0FBQ1gsUUFBSSxDQUFDLEtBQUssT0FBTCxFQUFMLEVBQXFCO0FBQ25CLGFBQU8sS0FBSyxRQUFMLEdBQ0wsT0FBTyxDQUFDLE9BQVIsRUFESyxHQUVMLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBSSxLQUFKLENBQVUsaUJBQVYsQ0FBZixDQUZGO0FBR0Q7O0FBQ0QsV0FBTyxJQUFJLE9BQUosQ0FBWSxDQUFDLE9BQUQsRUFBVSxNQUFWLEtBQXFCO0FBQ3RDLFlBQU0sR0FBRyxHQUFHLEtBQUssRUFBTCxDQUFRLFdBQVIsQ0FBb0IsQ0FBQyxNQUFELENBQXBCLENBQVo7O0FBQ0EsTUFBQSxHQUFHLENBQUMsVUFBSixHQUFrQixLQUFELElBQVc7QUFDMUIsY0FBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLE1BQU4sQ0FBYSxNQUExQjtBQUNBLFFBQUEsT0FBTyxDQUFDO0FBQ04sVUFBQSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBREw7QUFFTixVQUFBLE1BQU0sRUFBRSxJQUFJLENBQUM7QUFGUCxTQUFELENBQVA7QUFJRCxPQU5EOztBQU9BLE1BQUEsR0FBRyxDQUFDLE9BQUosR0FBZSxLQUFELElBQVc7QUFDdkIsd0RBQWEsUUFBYixFQUF1QixTQUF2QixFQUFrQyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQS9DOztBQUNBLFFBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBZCxDQUFOO0FBQ0QsT0FIRDs7QUFJQSxNQUFBLEdBQUcsQ0FBQyxXQUFKLENBQWdCLE1BQWhCLEVBQXdCLEdBQXhCLENBQTRCLEdBQTVCO0FBQ0QsS0FkTSxDQUFQO0FBZUQ7O0FBV0QsRUFBQSxlQUFlLENBQUMsU0FBRCxFQUFZLEdBQVosRUFBaUIsR0FBakIsRUFBc0I7QUFDbkMsUUFBSSxDQUFDLEtBQUssT0FBTCxFQUFMLEVBQXFCO0FBQ25CLGFBQU8sS0FBSyxRQUFMLEdBQ0wsT0FBTyxDQUFDLE9BQVIsRUFESyxHQUVMLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBSSxLQUFKLENBQVUsaUJBQVYsQ0FBZixDQUZGO0FBR0Q7O0FBQ0QsV0FBTyxJQUFJLE9BQUosQ0FBWSxDQUFDLE9BQUQsRUFBVSxNQUFWLEtBQXFCO0FBQ3RDLFlBQU0sR0FBRyxHQUFHLEtBQUssRUFBTCxDQUFRLFdBQVIsQ0FBb0IsQ0FBQyxjQUFELENBQXBCLEVBQXNDLFdBQXRDLENBQVo7O0FBQ0EsTUFBQSxHQUFHLENBQUMsVUFBSixHQUFrQixLQUFELElBQVc7QUFDMUIsUUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxNQUFkLENBQVA7QUFDRCxPQUZEOztBQUdBLE1BQUEsR0FBRyxDQUFDLE9BQUosR0FBZSxLQUFELElBQVc7QUFDdkIsd0RBQWEsUUFBYixFQUF1QixpQkFBdkIsRUFBMEMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUF2RDs7QUFDQSxRQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQWQsQ0FBTjtBQUNELE9BSEQ7O0FBSUEsTUFBQSxHQUFHLENBQUMsV0FBSixDQUFnQixjQUFoQixFQUFnQyxHQUFoQyxDQUFvQyxDQUFDLFNBQUQsRUFBWSxHQUFaLENBQXBDLEVBQXNELFNBQXRELEdBQW1FLEtBQUQsSUFBVztBQUMzRSxRQUFBLEdBQUcsQ0FBQyxXQUFKLENBQWdCLGNBQWhCLEVBQWdDLEdBQWhDLDhCQUFvQyxFQUFwQyxFQWhYYSxFQWdYYiwrQkFBb0MsRUFBcEMsRUFBOEQsS0FBSyxDQUFDLE1BQU4sQ0FBYSxNQUEzRSxFQUFtRixTQUFuRixFQUE4RixHQUE5RixFQUFtRyxHQUFuRztBQUNBLFFBQUEsR0FBRyxDQUFDLE1BQUo7QUFDRCxPQUhEO0FBSUQsS0FiTSxDQUFQO0FBY0Q7O0FBVUQsRUFBQSxnQkFBZ0IsQ0FBQyxTQUFELEVBQVksUUFBWixFQUFzQixPQUF0QixFQUErQjtBQUM3QyxRQUFJLENBQUMsS0FBSyxPQUFMLEVBQUwsRUFBcUI7QUFDbkIsYUFBTyxLQUFLLFFBQUwsR0FDTCxPQUFPLENBQUMsT0FBUixDQUFnQixFQUFoQixDQURLLEdBRUwsT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFJLEtBQUosQ0FBVSxpQkFBVixDQUFmLENBRkY7QUFHRDs7QUFDRCxXQUFPLElBQUksT0FBSixDQUFZLENBQUMsT0FBRCxFQUFVLE1BQVYsS0FBcUI7QUFDdEMsWUFBTSxHQUFHLEdBQUcsS0FBSyxFQUFMLENBQVEsV0FBUixDQUFvQixDQUFDLGNBQUQsQ0FBcEIsQ0FBWjs7QUFDQSxNQUFBLEdBQUcsQ0FBQyxPQUFKLEdBQWUsS0FBRCxJQUFXO0FBQ3ZCLHdEQUFhLFFBQWIsRUFBdUIsa0JBQXZCLEVBQTJDLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBeEQ7O0FBQ0EsUUFBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFkLENBQU47QUFDRCxPQUhEOztBQUlBLE1BQUEsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsY0FBaEIsRUFBZ0MsTUFBaEMsQ0FBdUMsV0FBVyxDQUFDLEtBQVosQ0FBa0IsQ0FBQyxTQUFELEVBQVksR0FBWixDQUFsQixFQUFvQyxDQUFDLFNBQUQsRUFBWSxHQUFaLENBQXBDLENBQXZDLEVBQThGLFNBQTlGLEdBQTJHLEtBQUQsSUFBVztBQUNuSCxZQUFJLFFBQUosRUFBYztBQUNaLFVBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxNQUFiLENBQW9CLE9BQXBCLENBQTZCLEtBQUQsSUFBVztBQUNyQyxZQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsT0FBZCxFQUF1QixLQUF2QjtBQUNELFdBRkQ7QUFHRDs7QUFDRCxRQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLE1BQWQsQ0FBUDtBQUNELE9BUEQ7QUFRRCxLQWRNLENBQVA7QUFlRDs7QUFXRCxFQUFBLFVBQVUsQ0FBQyxHQUFELEVBQU07QUFDZCxRQUFJLENBQUMsS0FBSyxPQUFMLEVBQUwsRUFBcUI7QUFDbkIsYUFBTyxLQUFLLFFBQUwsR0FDTCxPQUFPLENBQUMsT0FBUixFQURLLEdBRUwsT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFJLEtBQUosQ0FBVSxpQkFBVixDQUFmLENBRkY7QUFHRDs7QUFDRCxXQUFPLElBQUksT0FBSixDQUFZLENBQUMsT0FBRCxFQUFVLE1BQVYsS0FBcUI7QUFDdEMsWUFBTSxHQUFHLEdBQUcsS0FBSyxFQUFMLENBQVEsV0FBUixDQUFvQixDQUFDLFNBQUQsQ0FBcEIsRUFBaUMsV0FBakMsQ0FBWjs7QUFDQSxNQUFBLEdBQUcsQ0FBQyxTQUFKLEdBQWlCLEtBQUQsSUFBVztBQUN6QixRQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLE1BQWQsQ0FBUDtBQUNELE9BRkQ7O0FBR0EsTUFBQSxHQUFHLENBQUMsT0FBSixHQUFlLEtBQUQsSUFBVztBQUN2Qix3REFBYSxRQUFiLEVBQXVCLFlBQXZCLEVBQXFDLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBbEQ7O0FBQ0EsUUFBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFkLENBQU47QUFDRCxPQUhEOztBQUlBLE1BQUEsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsU0FBaEIsRUFBMkIsR0FBM0IsOEJBQStCLEVBQS9CLEVBN2FlLEVBNmFmLDBCQUErQixFQUEvQixFQUFvRCxJQUFwRCxFQUEwRCxHQUExRDtBQUNBLE1BQUEsR0FBRyxDQUFDLE1BQUo7QUFDRCxLQVhNLENBQVA7QUFZRDs7QUFVRCxFQUFBLGdCQUFnQixDQUFDLFNBQUQsRUFBWSxHQUFaLEVBQWlCLE1BQWpCLEVBQXlCO0FBQ3ZDLFFBQUksQ0FBQyxLQUFLLE9BQUwsRUFBTCxFQUFxQjtBQUNuQixhQUFPLEtBQUssUUFBTCxHQUNMLE9BQU8sQ0FBQyxPQUFSLEVBREssR0FFTCxPQUFPLENBQUMsTUFBUixDQUFlLElBQUksS0FBSixDQUFVLGlCQUFWLENBQWYsQ0FGRjtBQUdEOztBQUNELFdBQU8sSUFBSSxPQUFKLENBQVksQ0FBQyxPQUFELEVBQVUsTUFBVixLQUFxQjtBQUN0QyxZQUFNLEdBQUcsR0FBRyxLQUFLLEVBQUwsQ0FBUSxXQUFSLENBQW9CLENBQUMsU0FBRCxDQUFwQixFQUFpQyxXQUFqQyxDQUFaOztBQUNBLE1BQUEsR0FBRyxDQUFDLFNBQUosR0FBaUIsS0FBRCxJQUFXO0FBQ3pCLFFBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsTUFBZCxDQUFQO0FBQ0QsT0FGRDs7QUFHQSxNQUFBLEdBQUcsQ0FBQyxPQUFKLEdBQWUsS0FBRCxJQUFXO0FBQ3ZCLHdEQUFhLFFBQWIsRUFBdUIsa0JBQXZCLEVBQTJDLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBeEQ7O0FBQ0EsUUFBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFkLENBQU47QUFDRCxPQUhEOztBQUlBLFlBQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxXQUFKLENBQWdCLFNBQWhCLEVBQTJCLEdBQTNCLENBQStCLFdBQVcsQ0FBQyxJQUFaLENBQWlCLENBQUMsU0FBRCxFQUFZLEdBQVosQ0FBakIsQ0FBL0IsQ0FBWjs7QUFDQSxNQUFBLEdBQUcsQ0FBQyxTQUFKLEdBQWlCLEtBQUQsSUFBVztBQUN6QixjQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBSixJQUFjLEtBQUssQ0FBQyxNQUFOLENBQWEsTUFBdkM7O0FBQ0EsWUFBSSxDQUFDLEdBQUQsSUFBUSxHQUFHLENBQUMsT0FBSixJQUFlLE1BQTNCLEVBQW1DO0FBQ2pDLFVBQUEsR0FBRyxDQUFDLE1BQUo7QUFDQTtBQUNEOztBQUNELFFBQUEsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsU0FBaEIsRUFBMkIsR0FBM0IsOEJBQStCLEVBQS9CLEVBaGRhLEVBZ2RiLDBCQUErQixFQUEvQixFQUFvRCxHQUFwRCxFQUF5RDtBQUN2RCxVQUFBLEtBQUssRUFBRSxTQURnRDtBQUV2RCxVQUFBLEdBQUcsRUFBRSxHQUZrRDtBQUd2RCxVQUFBLE9BQU8sRUFBRTtBQUg4QyxTQUF6RDtBQUtBLFFBQUEsR0FBRyxDQUFDLE1BQUo7QUFDRCxPQVpEO0FBYUQsS0F2Qk0sQ0FBUDtBQXdCRDs7QUFVRCxFQUFBLFdBQVcsQ0FBQyxTQUFELEVBQVksSUFBWixFQUFrQixFQUFsQixFQUFzQjtBQUMvQixRQUFJLENBQUMsS0FBSyxPQUFMLEVBQUwsRUFBcUI7QUFDbkIsYUFBTyxLQUFLLFFBQUwsR0FDTCxPQUFPLENBQUMsT0FBUixFQURLLEdBRUwsT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFJLEtBQUosQ0FBVSxpQkFBVixDQUFmLENBRkY7QUFHRDs7QUFDRCxXQUFPLElBQUksT0FBSixDQUFZLENBQUMsT0FBRCxFQUFVLE1BQVYsS0FBcUI7QUFDdEMsVUFBSSxDQUFDLElBQUQsSUFBUyxDQUFDLEVBQWQsRUFBa0I7QUFDaEIsUUFBQSxJQUFJLEdBQUcsQ0FBUDtBQUNBLFFBQUEsRUFBRSxHQUFHLE1BQU0sQ0FBQyxnQkFBWjtBQUNEOztBQUNELFlBQU0sS0FBSyxHQUFHLEVBQUUsR0FBRyxDQUFMLEdBQVMsV0FBVyxDQUFDLEtBQVosQ0FBa0IsQ0FBQyxTQUFELEVBQVksSUFBWixDQUFsQixFQUFxQyxDQUFDLFNBQUQsRUFBWSxFQUFaLENBQXJDLEVBQXNELEtBQXRELEVBQTZELElBQTdELENBQVQsR0FDWixXQUFXLENBQUMsSUFBWixDQUFpQixDQUFDLFNBQUQsRUFBWSxJQUFaLENBQWpCLENBREY7QUFFQSxZQUFNLEdBQUcsR0FBRyxLQUFLLEVBQUwsQ0FBUSxXQUFSLENBQW9CLENBQUMsU0FBRCxDQUFwQixFQUFpQyxXQUFqQyxDQUFaOztBQUNBLE1BQUEsR0FBRyxDQUFDLFNBQUosR0FBaUIsS0FBRCxJQUFXO0FBQ3pCLFFBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsTUFBZCxDQUFQO0FBQ0QsT0FGRDs7QUFHQSxNQUFBLEdBQUcsQ0FBQyxPQUFKLEdBQWUsS0FBRCxJQUFXO0FBQ3ZCLHdEQUFhLFFBQWIsRUFBdUIsYUFBdkIsRUFBc0MsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFuRDs7QUFDQSxRQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQWQsQ0FBTjtBQUNELE9BSEQ7O0FBSUEsTUFBQSxHQUFHLENBQUMsV0FBSixDQUFnQixTQUFoQixFQUEyQixNQUEzQixDQUFrQyxLQUFsQztBQUNBLE1BQUEsR0FBRyxDQUFDLE1BQUo7QUFDRCxLQWpCTSxDQUFQO0FBa0JEOztBQWFELEVBQUEsWUFBWSxDQUFDLFNBQUQsRUFBWSxLQUFaLEVBQW1CLFFBQW5CLEVBQTZCLE9BQTdCLEVBQXNDO0FBQ2hELFFBQUksQ0FBQyxLQUFLLE9BQUwsRUFBTCxFQUFxQjtBQUNuQixhQUFPLEtBQUssUUFBTCxHQUNMLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEVBQWhCLENBREssR0FFTCxPQUFPLENBQUMsTUFBUixDQUFlLElBQUksS0FBSixDQUFVLGlCQUFWLENBQWYsQ0FGRjtBQUdEOztBQUNELFdBQU8sSUFBSSxPQUFKLENBQVksQ0FBQyxPQUFELEVBQVUsTUFBVixLQUFxQjtBQUN0QyxNQUFBLEtBQUssR0FBRyxLQUFLLElBQUksRUFBakI7QUFDQSxZQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBTixHQUFjLENBQWQsR0FBa0IsS0FBSyxDQUFDLEtBQXhCLEdBQWdDLENBQTlDO0FBQ0EsWUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFmLEdBQW1CLEtBQUssQ0FBQyxNQUF6QixHQUFrQyxNQUFNLENBQUMsZ0JBQXhEO0FBQ0EsWUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQU4sR0FBYyxDQUE1QjtBQUVBLFlBQU0sTUFBTSxHQUFHLEVBQWY7QUFDQSxZQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsS0FBWixDQUFrQixDQUFDLFNBQUQsRUFBWSxLQUFaLENBQWxCLEVBQXNDLENBQUMsU0FBRCxFQUFZLE1BQVosQ0FBdEMsRUFBMkQsS0FBM0QsRUFBa0UsSUFBbEUsQ0FBZDtBQUNBLFlBQU0sR0FBRyxHQUFHLEtBQUssRUFBTCxDQUFRLFdBQVIsQ0FBb0IsQ0FBQyxTQUFELENBQXBCLENBQVo7O0FBQ0EsTUFBQSxHQUFHLENBQUMsT0FBSixHQUFlLEtBQUQsSUFBVztBQUN2Qix3REFBYSxRQUFiLEVBQXVCLGNBQXZCLEVBQXVDLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBcEQ7O0FBQ0EsUUFBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFkLENBQU47QUFDRCxPQUhEOztBQUtBLE1BQUEsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsU0FBaEIsRUFBMkIsVUFBM0IsQ0FBc0MsS0FBdEMsRUFBNkMsTUFBN0MsRUFBcUQsU0FBckQsR0FBa0UsS0FBRCxJQUFXO0FBQzFFLGNBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFOLENBQWEsTUFBNUI7O0FBQ0EsWUFBSSxNQUFKLEVBQVk7QUFDVixjQUFJLFFBQUosRUFBYztBQUNaLFlBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxPQUFkLEVBQXVCLE1BQU0sQ0FBQyxLQUE5QjtBQUNEOztBQUNELFVBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxNQUFNLENBQUMsS0FBbkI7O0FBQ0EsY0FBSSxLQUFLLElBQUksQ0FBVCxJQUFjLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLEtBQWxDLEVBQXlDO0FBQ3ZDLFlBQUEsTUFBTSxDQUFDLFFBQVA7QUFDRCxXQUZELE1BRU87QUFDTCxZQUFBLE9BQU8sQ0FBQyxNQUFELENBQVA7QUFDRDtBQUNGLFNBVkQsTUFVTztBQUNMLFVBQUEsT0FBTyxDQUFDLE1BQUQsQ0FBUDtBQUNEO0FBQ0YsT0FmRDtBQWdCRCxLQTlCTSxDQUFQO0FBK0JEOztBQWdGeUIsU0FBbkIsbUJBQW1CLENBQUMsV0FBRCxFQUFjO0FBQ3RDLElBQUEsV0FBVyxHQUFHLFdBQWQ7QUFDRDs7QUE5bkJxQjs7OztzQkFjVixNLEVBQVEsUSxFQUFVLE8sRUFBUztBQUNyQyxNQUFJLENBQUMsS0FBSyxFQUFWLEVBQWM7QUFDWixXQUFPLFFBQVEsR0FDYixPQUFPLENBQUMsT0FBUixDQUFnQixFQUFoQixDQURhLEdBRWIsT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFJLEtBQUosQ0FBVSxpQkFBVixDQUFmLENBRkY7QUFHRDs7QUFFRCxTQUFPLElBQUksT0FBSixDQUFZLENBQUMsT0FBRCxFQUFVLE1BQVYsS0FBcUI7QUFDdEMsVUFBTSxHQUFHLEdBQUcsS0FBSyxFQUFMLENBQVEsV0FBUixDQUFvQixDQUFDLE1BQUQsQ0FBcEIsQ0FBWjs7QUFDQSxJQUFBLEdBQUcsQ0FBQyxPQUFKLEdBQWUsS0FBRCxJQUFXO0FBQ3ZCLHNEQUFhLFFBQWIsRUFBdUIsWUFBdkIsRUFBcUMsTUFBckMsRUFBNkMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUExRDs7QUFDQSxNQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQWQsQ0FBTjtBQUNELEtBSEQ7O0FBSUEsSUFBQSxHQUFHLENBQUMsV0FBSixDQUFnQixNQUFoQixFQUF3QixNQUF4QixHQUFpQyxTQUFqQyxHQUE4QyxLQUFELElBQVc7QUFDdEQsVUFBSSxRQUFKLEVBQWM7QUFDWixRQUFBLEtBQUssQ0FBQyxNQUFOLENBQWEsTUFBYixDQUFvQixPQUFwQixDQUE2QixLQUFELElBQVc7QUFDckMsVUFBQSxRQUFRLENBQUMsSUFBVCxDQUFjLE9BQWQsRUFBdUIsS0FBdkI7QUFDRCxTQUZEO0FBR0Q7O0FBQ0QsTUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxNQUFkLENBQVA7QUFDRCxLQVBEO0FBUUQsR0FkTSxDQUFQO0FBZUQ7OzJCQWtoQndCLEssRUFBTyxHLEVBQUs7QUFDbkMsa0NBQUEsRUFBRSxFQXZqQmUsRUF1akJmLGdCQUFGLENBQWlCLE9BQWpCLENBQTBCLENBQUQsSUFBTztBQUM5QixRQUFJLEdBQUcsQ0FBQyxjQUFKLENBQW1CLENBQW5CLENBQUosRUFBMkI7QUFDekIsTUFBQSxLQUFLLENBQUMsQ0FBRCxDQUFMLEdBQVcsR0FBRyxDQUFDLENBQUQsQ0FBZDtBQUNEO0FBQ0YsR0FKRDs7QUFLQSxNQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBRyxDQUFDLElBQWxCLENBQUosRUFBNkI7QUFDM0IsSUFBQSxLQUFLLENBQUMsS0FBTixHQUFjLEdBQUcsQ0FBQyxJQUFsQjtBQUNEOztBQUNELE1BQUksR0FBRyxDQUFDLEdBQVIsRUFBYTtBQUNYLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsR0FBRyxDQUFDLEdBQXhCO0FBQ0Q7O0FBQ0QsRUFBQSxLQUFLLENBQUMsR0FBTixJQUFhLENBQWI7QUFDQSxFQUFBLEtBQUssQ0FBQyxJQUFOLElBQWMsQ0FBZDtBQUNBLEVBQUEsS0FBSyxDQUFDLE1BQU4sR0FBZSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBWSxLQUFLLENBQUMsR0FBTixHQUFZLEtBQUssQ0FBQyxJQUE5QixDQUFmO0FBQ0Q7O3lCQUdzQixHLEVBQUssRyxFQUFLO0FBQy9CLFFBQU0sR0FBRyxHQUFHLEdBQUcsSUFBSTtBQUNqQixJQUFBLElBQUksRUFBRSxHQUFHLENBQUM7QUFETyxHQUFuQjs7QUFHQSxrQ0FBQSxFQUFFLEVBNWtCZSxFQTRrQmYsZ0JBQUYsQ0FBaUIsT0FBakIsQ0FBMEIsQ0FBRCxJQUFPO0FBQzlCLFFBQUksR0FBRyxDQUFDLGNBQUosQ0FBbUIsQ0FBbkIsQ0FBSixFQUEyQjtBQUN6QixNQUFBLEdBQUcsQ0FBQyxDQUFELENBQUgsR0FBUyxHQUFHLENBQUMsQ0FBRCxDQUFaO0FBQ0Q7QUFDRixHQUpEOztBQUtBLE1BQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFHLENBQUMsS0FBbEIsQ0FBSixFQUE4QjtBQUM1QixJQUFBLEdBQUcsQ0FBQyxJQUFKLEdBQVcsR0FBRyxDQUFDLEtBQWY7QUFDRDs7QUFDRCxNQUFJLEdBQUcsQ0FBQyxHQUFSLEVBQWE7QUFDWCxJQUFBLEdBQUcsQ0FBQyxHQUFKLEdBQVUsR0FBRyxDQUFDLGFBQUosR0FBb0IsVUFBcEIsRUFBVjtBQUNEOztBQUNELFNBQU8sR0FBUDtBQUNEOztnQ0FFNkIsRyxFQUFLLFMsRUFBVyxHLEVBQUssRyxFQUFLO0FBQ3RELFFBQU0sTUFBTSxHQUFHLENBQUMsU0FBRCxFQUFZLE1BQVosRUFBb0IsTUFBcEIsRUFBNEIsTUFBNUIsRUFBb0MsT0FBcEMsRUFBNkMsVUFBN0MsRUFBeUQsV0FBekQsQ0FBZjtBQUNBLFFBQU0sR0FBRyxHQUFHLEdBQUcsSUFBSTtBQUNqQixJQUFBLEtBQUssRUFBRSxTQURVO0FBRWpCLElBQUEsR0FBRyxFQUFFO0FBRlksR0FBbkI7QUFLQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWdCLENBQUQsSUFBTztBQUNwQixRQUFJLEdBQUcsQ0FBQyxjQUFKLENBQW1CLENBQW5CLENBQUosRUFBMkI7QUFDekIsTUFBQSxHQUFHLENBQUMsQ0FBRCxDQUFILEdBQVMsR0FBRyxDQUFDLENBQUQsQ0FBWjtBQUNEO0FBQ0YsR0FKRDtBQU1BLFNBQU8sR0FBUDtBQUNEOzsyQkFFd0IsRyxFQUFLLEcsRUFBSztBQUVqQyxRQUFNLE1BQU0sR0FBRyxDQUFDLE9BQUQsRUFBVSxLQUFWLEVBQWlCLElBQWpCLEVBQXVCLFNBQXZCLEVBQWtDLE1BQWxDLEVBQTBDLE1BQTFDLEVBQWtELFNBQWxELENBQWY7QUFDQSxRQUFNLEdBQUcsR0FBRyxHQUFHLElBQUksRUFBbkI7QUFDQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWdCLENBQUQsSUFBTztBQUNwQixRQUFJLEdBQUcsQ0FBQyxjQUFKLENBQW1CLENBQW5CLENBQUosRUFBMkI7QUFDekIsTUFBQSxHQUFHLENBQUMsQ0FBRCxDQUFILEdBQVMsR0FBRyxDQUFDLENBQUQsQ0FBWjtBQUNEO0FBQ0YsR0FKRDtBQUtBLFNBQU8sR0FBUDtBQUNEOzs7O1NBbkVzQixDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLE1BQWxDLEVBQTBDLE1BQTFDLEVBQWtELEtBQWxELEVBQXlELE9BQXpELEVBQWtFLFFBQWxFLEVBQ3JCLE9BRHFCLEVBQ1osUUFEWSxFQUNGLFNBREUsRUFDUyxTQURULEVBQ29CLFNBRHBCLEVBQytCLFVBRC9COzs7O0FDamtCekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOztBQU1BLE1BQU0saUJBQWlCLEdBQUcsQ0FBMUI7QUFDQSxNQUFNLHVCQUF1QixHQUFHLENBQWhDO0FBQ0EsTUFBTSxxQkFBcUIsR0FBRyxFQUE5QjtBQUNBLE1BQU0sY0FBYyxHQUFHLGtCQUF2QjtBQUNBLE1BQU0sZ0JBQWdCLEdBQUcsZUFBekI7QUFDQSxNQUFNLGtCQUFrQixHQUFHLENBQUMsS0FBRCxFQUFRLFFBQVIsRUFBa0IsVUFBbEIsRUFBOEIsTUFBOUIsRUFBc0MsTUFBdEMsRUFBOEMsU0FBOUMsRUFBeUQsS0FBekQsRUFBZ0UsTUFBaEUsRUFBd0UsS0FBeEUsRUFBK0UsS0FBL0UsRUFBc0YsT0FBdEYsQ0FBM0I7QUFJQSxNQUFNLGFBQWEsR0FBRyxDQUVwQjtBQUNFLEVBQUEsSUFBSSxFQUFFLElBRFI7QUFFRSxFQUFBLEtBQUssRUFBRSx1QkFGVDtBQUdFLEVBQUEsR0FBRyxFQUFFO0FBSFAsQ0FGb0IsRUFRcEI7QUFDRSxFQUFBLElBQUksRUFBRSxJQURSO0FBRUUsRUFBQSxLQUFLLEVBQUUsbUJBRlQ7QUFHRSxFQUFBLEdBQUcsRUFBRTtBQUhQLENBUm9CLEVBY3BCO0FBQ0UsRUFBQSxJQUFJLEVBQUUsSUFEUjtBQUVFLEVBQUEsS0FBSyxFQUFFLHNCQUZUO0FBR0UsRUFBQSxHQUFHLEVBQUU7QUFIUCxDQWRvQixFQW9CcEI7QUFDRSxFQUFBLElBQUksRUFBRSxJQURSO0FBRUUsRUFBQSxLQUFLLEVBQUUsaUJBRlQ7QUFHRSxFQUFBLEdBQUcsRUFBRTtBQUhQLENBcEJvQixDQUF0QjtBQTRCQSxNQUFNLFVBQVUsR0FBRyxDQUFDLElBQUQsQ0FBbkI7QUFHQSxNQUFNLFlBQVksR0FBRyxDQUVuQjtBQUNFLEVBQUEsSUFBSSxFQUFFLElBRFI7QUFFRSxFQUFBLFFBQVEsRUFBRSxLQUZaO0FBR0UsRUFBQSxJQUFJLEVBQUUsVUFBUyxHQUFULEVBQWM7QUFFbEIsUUFBSSxDQUFDLGdCQUFnQixJQUFoQixDQUFxQixHQUFyQixDQUFMLEVBQWdDO0FBQzlCLE1BQUEsR0FBRyxHQUFHLFlBQVksR0FBbEI7QUFDRDs7QUFDRCxXQUFPO0FBQ0wsTUFBQSxHQUFHLEVBQUU7QUFEQSxLQUFQO0FBR0QsR0FYSDtBQVlFLEVBQUEsRUFBRSxFQUFFO0FBWk4sQ0FGbUIsRUFpQm5CO0FBQ0UsRUFBQSxJQUFJLEVBQUUsSUFEUjtBQUVFLEVBQUEsUUFBUSxFQUFFLEtBRlo7QUFHRSxFQUFBLElBQUksRUFBRSxVQUFTLEdBQVQsRUFBYztBQUNsQixXQUFPO0FBQ0wsTUFBQSxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUosQ0FBVSxDQUFWO0FBREEsS0FBUDtBQUdELEdBUEg7QUFRRSxFQUFBLEVBQUUsRUFBRTtBQVJOLENBakJtQixFQTRCbkI7QUFDRSxFQUFBLElBQUksRUFBRSxJQURSO0FBRUUsRUFBQSxRQUFRLEVBQUUsS0FGWjtBQUdFLEVBQUEsSUFBSSxFQUFFLFVBQVMsR0FBVCxFQUFjO0FBQ2xCLFdBQU87QUFDTCxNQUFBLEdBQUcsRUFBRSxHQUFHLENBQUMsS0FBSixDQUFVLENBQVY7QUFEQSxLQUFQO0FBR0QsR0FQSDtBQVFFLEVBQUEsRUFBRSxFQUFFO0FBUk4sQ0E1Qm1CLENBQXJCO0FBeUNBLE1BQU0sU0FBUyxHQUFHO0FBQ2hCLEVBQUEsRUFBRSxFQUFFO0FBQ0YsSUFBQSxJQUFJLEVBQUUsT0FESjtBQUVGLElBQUEsTUFBTSxFQUFFO0FBRk4sR0FEWTtBQUtoQixFQUFBLEVBQUUsRUFBRTtBQUNGLElBQUEsSUFBSSxFQUFFLFFBREo7QUFFRixJQUFBLE1BQU0sRUFBRTtBQUZOLEdBTFk7QUFTaEIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxJQURKO0FBRUYsSUFBQSxNQUFNLEVBQUU7QUFGTixHQVRZO0FBYWhCLEVBQUEsRUFBRSxFQUFFO0FBQ0YsSUFBQSxJQUFJLEVBQUUsSUFESjtBQUVGLElBQUEsTUFBTSxFQUFFO0FBRk4sR0FiWTtBQWlCaEIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxLQURKO0FBRUYsSUFBQSxNQUFNLEVBQUU7QUFGTixHQWpCWTtBQXFCaEIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxHQURKO0FBRUYsSUFBQSxNQUFNLEVBQUU7QUFGTixHQXJCWTtBQXlCaEIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxFQURKO0FBRUYsSUFBQSxNQUFNLEVBQUU7QUFGTixHQXpCWTtBQTZCaEIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxLQURKO0FBRUYsSUFBQSxNQUFNLEVBQUU7QUFGTixHQTdCWTtBQWlDaEIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxFQURKO0FBRUYsSUFBQSxNQUFNLEVBQUU7QUFGTixHQWpDWTtBQXFDaEIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxNQURKO0FBRUYsSUFBQSxNQUFNLEVBQUU7QUFGTixHQXJDWTtBQXlDaEIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxHQURKO0FBRUYsSUFBQSxNQUFNLEVBQUU7QUFGTixHQXpDWTtBQTZDaEIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxLQURKO0FBRUYsSUFBQSxNQUFNLEVBQUU7QUFGTixHQTdDWTtBQWlEaEIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxHQURKO0FBRUYsSUFBQSxNQUFNLEVBQUU7QUFGTixHQWpEWTtBQXFEaEIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxHQURKO0FBRUYsSUFBQSxNQUFNLEVBQUU7QUFGTixHQXJEWTtBQXlEaEIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxLQURKO0FBRUYsSUFBQSxNQUFNLEVBQUU7QUFGTixHQXpEWTtBQTZEaEIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxLQURKO0FBRUYsSUFBQSxNQUFNLEVBQUU7QUFGTixHQTdEWTtBQWlFaEIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxHQURKO0FBRUYsSUFBQSxNQUFNLEVBQUU7QUFGTjtBQWpFWSxDQUFsQjs7QUF3RUEsU0FBUyxpQkFBVCxDQUEyQixHQUEzQixFQUFnQyxXQUFoQyxFQUE2QyxNQUE3QyxFQUFxRDtBQUNuRCxNQUFJLENBQUMsR0FBTCxFQUFVO0FBQ1IsV0FBTyxJQUFQO0FBQ0Q7O0FBRUQsTUFBSTtBQUNGLFVBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFELENBQWhCO0FBQ0EsVUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQW5CO0FBQ0EsVUFBTSxHQUFHLEdBQUcsSUFBSSxXQUFKLENBQWdCLE1BQWhCLENBQVo7QUFDQSxVQUFNLEdBQUcsR0FBRyxJQUFJLFVBQUosQ0FBZSxHQUFmLENBQVo7O0FBQ0EsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxNQUFwQixFQUE0QixDQUFDLEVBQTdCLEVBQWlDO0FBQy9CLE1BQUEsR0FBRyxDQUFDLENBQUQsQ0FBSCxHQUFTLEdBQUcsQ0FBQyxVQUFKLENBQWUsQ0FBZixDQUFUO0FBQ0Q7O0FBRUQsV0FBTyxHQUFHLENBQUMsZUFBSixDQUFvQixJQUFJLElBQUosQ0FBUyxDQUFDLEdBQUQsQ0FBVCxFQUFnQjtBQUN6QyxNQUFBLElBQUksRUFBRTtBQURtQyxLQUFoQixDQUFwQixDQUFQO0FBR0QsR0FaRCxDQVlFLE9BQU8sR0FBUCxFQUFZO0FBQ1osUUFBSSxNQUFKLEVBQVk7QUFDVixNQUFBLE1BQU0sQ0FBQyxtQ0FBRCxFQUFzQyxHQUFHLENBQUMsT0FBMUMsQ0FBTjtBQUNEO0FBQ0Y7O0FBRUQsU0FBTyxJQUFQO0FBQ0Q7O0FBRUQsU0FBUyxlQUFULENBQXlCLEdBQXpCLEVBQThCLFdBQTlCLEVBQTJDO0FBQ3pDLE1BQUksQ0FBQyxHQUFMLEVBQVU7QUFDUixXQUFPLElBQVA7QUFDRDs7QUFDRCxFQUFBLFdBQVcsR0FBRyxXQUFXLElBQUksWUFBN0I7QUFDQSxTQUFPLFVBQVUsV0FBVixHQUF3QixVQUF4QixHQUFxQyxHQUE1QztBQUNEOztBQUdELE1BQU0sVUFBVSxHQUFHO0FBRWpCLEVBQUEsRUFBRSxFQUFFO0FBQ0YsSUFBQSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBRFQ7QUFFRixJQUFBLEtBQUssRUFBRSxDQUFDLElBQUk7QUFGVixHQUZhO0FBTWpCLEVBQUEsRUFBRSxFQUFFO0FBQ0YsSUFBQSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBRFQ7QUFFRixJQUFBLEtBQUssRUFBRSxDQUFDLElBQUk7QUFGVixHQU5hO0FBVWpCLEVBQUEsRUFBRSxFQUFFO0FBQ0YsSUFBQSxJQUFJLEVBQUUsQ0FBQyxJQUFJLE9BRFQ7QUFFRixJQUFBLEtBQUssRUFBRSxDQUFDLElBQUk7QUFGVixHQVZhO0FBY2pCLEVBQUEsRUFBRSxFQUFFO0FBQ0YsSUFBQSxJQUFJLEVBQUUsQ0FBQyxJQUFJLE1BRFQ7QUFFRixJQUFBLEtBQUssRUFBRSxDQUFDLElBQUk7QUFGVixHQWRhO0FBbUJqQixFQUFBLEVBQUUsRUFBRTtBQUNGLElBQUEsSUFBSSxFQUFFLENBQUMsSUFBSSxPQURUO0FBRUYsSUFBQSxLQUFLLEVBQUUsQ0FBQyxJQUFJO0FBRlYsR0FuQmE7QUF3QmpCLEVBQUEsRUFBRSxFQUFFO0FBQ0YsSUFBQSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBRFQ7QUFFRixJQUFBLEtBQUssRUFBRSxDQUFDLElBQUk7QUFGVixHQXhCYTtBQTZCakIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxDQUFDLElBQUksMkJBRFQ7QUFFRixJQUFBLEtBQUssRUFBRSxDQUFDLElBQUk7QUFGVixHQTdCYTtBQWtDakIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRyxJQUFELElBQVU7QUFDZCxhQUFPLGNBQWMsSUFBSSxDQUFDLEdBQW5CLEdBQXlCLElBQWhDO0FBQ0QsS0FIQztBQUlGLElBQUEsS0FBSyxFQUFFLENBQUMsSUFBSSxNQUpWO0FBS0YsSUFBQSxLQUFLLEVBQUcsSUFBRCxJQUFVO0FBQ2YsYUFBTyxJQUFJLEdBQUc7QUFDWixRQUFBLElBQUksRUFBRSxJQUFJLENBQUMsR0FEQztBQUVaLFFBQUEsTUFBTSxFQUFFO0FBRkksT0FBSCxHQUdQLElBSEo7QUFJRDtBQVZDLEdBbENhO0FBK0NqQixFQUFBLEVBQUUsRUFBRTtBQUNGLElBQUEsSUFBSSxFQUFHLElBQUQsSUFBVTtBQUNkLGFBQU8sZUFBZSxJQUFJLENBQUMsR0FBcEIsR0FBMEIsSUFBakM7QUFDRCxLQUhDO0FBSUYsSUFBQSxLQUFLLEVBQUUsQ0FBQyxJQUFJLE1BSlY7QUFLRixJQUFBLEtBQUssRUFBRyxJQUFELElBQVU7QUFDZixhQUFPLElBQUksR0FBRztBQUNaLFFBQUEsRUFBRSxFQUFFLElBQUksQ0FBQztBQURHLE9BQUgsR0FFUCxJQUZKO0FBR0Q7QUFUQyxHQS9DYTtBQTJEakIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRyxJQUFELElBQVU7QUFDZCxhQUFPLGVBQWUsSUFBSSxDQUFDLEdBQXBCLEdBQTBCLElBQWpDO0FBQ0QsS0FIQztBQUlGLElBQUEsS0FBSyxFQUFFLENBQUMsSUFBSSxNQUpWO0FBS0YsSUFBQSxLQUFLLEVBQUcsSUFBRCxJQUFVO0FBQ2YsYUFBTyxJQUFJLEdBQUc7QUFDWixRQUFBLEVBQUUsRUFBRSxJQUFJLENBQUM7QUFERyxPQUFILEdBRVAsSUFGSjtBQUdEO0FBVEMsR0EzRGE7QUF1RWpCLEVBQUEsRUFBRSxFQUFFO0FBQ0YsSUFBQSxJQUFJLEVBQUUsQ0FBQyxJQUFJLFVBRFQ7QUFFRixJQUFBLEtBQUssRUFBRSxDQUFDLElBQUksV0FGVjtBQUdGLElBQUEsS0FBSyxFQUFHLElBQUQsSUFBVTtBQUNmLGFBQU8sSUFBSSxHQUFHO0FBQ1osb0JBQVksSUFBSSxDQUFDLEdBREw7QUFFWixvQkFBWSxJQUFJLENBQUMsR0FGTDtBQUdaLHFCQUFhLElBQUksQ0FBQyxJQUhOO0FBSVosb0JBQVksSUFBSSxDQUFDO0FBSkwsT0FBSCxHQUtQLElBTEo7QUFNRDtBQVZDLEdBdkVhO0FBb0ZqQixFQUFBLEVBQUUsRUFBRTtBQUNGLElBQUEsSUFBSSxFQUFHLElBQUQsSUFBVTtBQUNkLFlBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFMLElBQVksaUJBQWlCLENBQUMsSUFBSSxDQUFDLEdBQU4sRUFBVyxJQUFJLENBQUMsSUFBaEIsRUFBc0IsTUFBTSxDQUFDLE1BQTdCLENBQXpDO0FBQ0EsYUFBTywwQkFBMEIsR0FBMUIsR0FBZ0MsSUFBdkM7QUFDRCxLQUpDO0FBS0YsSUFBQSxLQUFLLEVBQUUsQ0FBQyxJQUFJLFVBTFY7QUFNRixJQUFBLEtBQUssRUFBRyxJQUFELElBQVU7QUFDZixVQUFJLENBQUMsSUFBTCxFQUFXLE9BQU8sSUFBUDtBQUNYLGFBQU87QUFFTCxRQUFBLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBTCxJQUFZLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFOLEVBQVcsSUFBSSxDQUFDLElBQWhCLEVBQXNCLE1BQU0sQ0FBQyxNQUE3QixDQUY3QjtBQUdMLHdCQUFnQixJQUFJLENBQUMsR0FBTCxHQUFXLFVBQVgsR0FBd0IsTUFIbkM7QUFJTCx5QkFBaUIsSUFBSSxDQUFDLFFBSmpCO0FBS0wscUJBQWEsSUFBSSxDQUFDLElBTGI7QUFNTCxxQkFBYSxJQUFJLENBQUMsR0FBTCxHQUFhLElBQUksQ0FBQyxHQUFMLENBQVMsTUFBVCxHQUFrQixJQUFuQixHQUEyQixDQUF2QyxHQUE2QyxJQUFJLENBQUMsSUFBTCxHQUFZLENBTmpFO0FBT0wscUJBQWEsSUFBSSxDQUFDO0FBUGIsT0FBUDtBQVNEO0FBakJDLEdBcEZhO0FBd0dqQixFQUFBLEVBQUUsRUFBRTtBQUNGLElBQUEsSUFBSSxFQUFHLElBQUQsSUFBVTtBQUVkLFlBQU0sYUFBYSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsWUFBTixFQUFvQixJQUFJLENBQUMsSUFBekIsQ0FBckM7QUFDQSxZQUFNLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBTixFQUFXLElBQUksQ0FBQyxJQUFoQixFQUFzQixNQUFNLENBQUMsTUFBN0IsQ0FBcEM7QUFDQSxZQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBTCxJQUFZLFVBQWhDO0FBQ0EsYUFBTyxDQUFDLElBQUksQ0FBQyxJQUFMLEdBQVksY0FBYyxXQUFkLEdBQTRCLGNBQTVCLEdBQTZDLElBQUksQ0FBQyxJQUFsRCxHQUF5RCxJQUFyRSxHQUE0RSxFQUE3RSxJQUNMLFlBREssSUFDVyxhQUFhLElBQUksVUFENUIsSUFDMEMsR0FEMUMsSUFFSixJQUFJLENBQUMsS0FBTCxHQUFhLGFBQWEsSUFBSSxDQUFDLEtBQWxCLEdBQTBCLEdBQXZDLEdBQTZDLEVBRnpDLEtBR0osSUFBSSxDQUFDLE1BQUwsR0FBYyxjQUFjLElBQUksQ0FBQyxNQUFuQixHQUE0QixHQUExQyxHQUFnRCxFQUg1QyxJQUdrRCxnQkFIekQ7QUFJRCxLQVZDO0FBV0YsSUFBQSxLQUFLLEVBQUcsSUFBRCxJQUFVO0FBQ2YsYUFBUSxJQUFJLENBQUMsSUFBTCxHQUFZLE1BQVosR0FBcUIsRUFBN0I7QUFDRCxLQWJDO0FBY0YsSUFBQSxLQUFLLEVBQUcsSUFBRCxJQUFVO0FBQ2YsVUFBSSxDQUFDLElBQUwsRUFBVyxPQUFPLElBQVA7QUFDWCxhQUFPO0FBRUwsUUFBQSxHQUFHLEVBQUUsZUFBZSxDQUFDLElBQUksQ0FBQyxZQUFOLEVBQW9CLElBQUksQ0FBQyxJQUF6QixDQUFmLElBQ0gsSUFBSSxDQUFDLEdBREYsSUFDUyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBTixFQUFXLElBQUksQ0FBQyxJQUFoQixFQUFzQixNQUFNLENBQUMsTUFBN0IsQ0FIMUI7QUFJTCxRQUFBLEtBQUssRUFBRSxJQUFJLENBQUMsSUFKUDtBQUtMLFFBQUEsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUxMO0FBTUwsc0JBQWMsSUFBSSxDQUFDLEtBTmQ7QUFPTCx1QkFBZSxJQUFJLENBQUMsTUFQZjtBQVFMLHFCQUFhLElBQUksQ0FBQyxJQVJiO0FBU0wscUJBQWEsSUFBSSxDQUFDLEdBQUwsR0FBYSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQsR0FBa0IsSUFBbkIsR0FBMkIsQ0FBdkMsR0FBNkMsSUFBSSxDQUFDLElBQUwsR0FBWSxDQVRqRTtBQVVMLHFCQUFhLElBQUksQ0FBQztBQVZiLE9BQVA7QUFZRDtBQTVCQyxHQXhHYTtBQXVJakIsRUFBQSxFQUFFLEVBQUU7QUFDRixJQUFBLElBQUksRUFBRSxDQUFDLElBQUksT0FEVDtBQUVGLElBQUEsS0FBSyxFQUFFLENBQUMsSUFBSTtBQUZWLEdBdklhO0FBNElqQixFQUFBLEVBQUUsRUFBRTtBQUNGLElBQUEsSUFBSSxFQUFFLENBQUMsSUFBSSxPQURUO0FBRUYsSUFBQSxLQUFLLEVBQUUsQ0FBQyxJQUFJO0FBRlYsR0E1SWE7QUFpSmpCLEVBQUEsRUFBRSxFQUFFO0FBQ0YsSUFBQSxJQUFJLEVBQUUsQ0FBQyxJQUFJLE9BRFQ7QUFFRixJQUFBLEtBQUssRUFBRSxDQUFDLElBQUksUUFGVjtBQUdGLElBQUEsS0FBSyxFQUFHLElBQUQsSUFBVTtBQUNmLGFBQU8sSUFBSSxHQUFHLEVBQUgsR0FBUSxJQUFuQjtBQUNEO0FBTEM7QUFqSmEsQ0FBbkI7O0FBK0pBLE1BQU0sTUFBTSxHQUFHLFlBQVc7QUFDeEIsT0FBSyxHQUFMLEdBQVcsRUFBWDtBQUNBLE9BQUssR0FBTCxHQUFXLEVBQVg7QUFDQSxPQUFLLEdBQUwsR0FBVyxFQUFYO0FBQ0QsQ0FKRDs7QUFhQSxNQUFNLENBQUMsSUFBUCxHQUFjLFVBQVMsU0FBVCxFQUFvQjtBQUNoQyxNQUFJLE9BQU8sU0FBUCxJQUFvQixXQUF4QixFQUFxQztBQUNuQyxJQUFBLFNBQVMsR0FBRyxFQUFaO0FBQ0QsR0FGRCxNQUVPLElBQUksT0FBTyxTQUFQLElBQW9CLFFBQXhCLEVBQWtDO0FBQ3ZDLFdBQU8sSUFBUDtBQUNEOztBQUVELFNBQU87QUFDTCxJQUFBLEdBQUcsRUFBRTtBQURBLEdBQVA7QUFHRCxDQVZEOztBQW9CQSxNQUFNLENBQUMsS0FBUCxHQUFlLFVBQVMsT0FBVCxFQUFrQjtBQUUvQixNQUFJLE9BQU8sT0FBUCxJQUFrQixRQUF0QixFQUFnQztBQUM5QixXQUFPLElBQVA7QUFDRDs7QUFHRCxRQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBUixDQUFjLE9BQWQsQ0FBZDtBQUdBLFFBQU0sU0FBUyxHQUFHLEVBQWxCO0FBQ0EsUUFBTSxXQUFXLEdBQUcsRUFBcEI7QUFHQSxRQUFNLEdBQUcsR0FBRyxFQUFaO0FBQ0EsRUFBQSxLQUFLLENBQUMsT0FBTixDQUFlLElBQUQsSUFBVTtBQUN0QixRQUFJLEtBQUssR0FBRyxFQUFaO0FBQ0EsUUFBSSxRQUFKO0FBSUEsSUFBQSxhQUFhLENBQUMsT0FBZCxDQUF1QixHQUFELElBQVM7QUFFN0IsTUFBQSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFRLENBQUMsSUFBRCxFQUFPLEdBQUcsQ0FBQyxLQUFYLEVBQWtCLEdBQUcsQ0FBQyxHQUF0QixFQUEyQixHQUFHLENBQUMsSUFBL0IsQ0FBckIsQ0FBUjtBQUNELEtBSEQ7QUFLQSxRQUFJLEtBQUo7O0FBQ0EsUUFBSSxLQUFLLENBQUMsTUFBTixJQUFnQixDQUFwQixFQUF1QjtBQUNyQixNQUFBLEtBQUssR0FBRztBQUNOLFFBQUEsR0FBRyxFQUFFO0FBREMsT0FBUjtBQUdELEtBSkQsTUFJTztBQUVMLE1BQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFDLENBQUQsRUFBSSxDQUFKLEtBQVU7QUFDbkIsY0FBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUYsR0FBTyxDQUFDLENBQUMsRUFBdEI7QUFDQSxlQUFPLElBQUksSUFBSSxDQUFSLEdBQVksSUFBWixHQUFtQixDQUFDLENBQUMsR0FBRixHQUFRLENBQUMsQ0FBQyxHQUFwQztBQUNELE9BSEQ7QUFNQSxNQUFBLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBRCxDQUFsQjtBQUlBLFlBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFELEVBQU8sQ0FBUCxFQUFVLElBQUksQ0FBQyxNQUFmLEVBQXVCLEtBQXZCLENBQXZCO0FBRUEsWUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQUQsRUFBUyxDQUFULENBQXZCO0FBRUEsTUFBQSxLQUFLLEdBQUc7QUFDTixRQUFBLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FETjtBQUVOLFFBQUEsR0FBRyxFQUFFLE1BQU0sQ0FBQztBQUZOLE9BQVI7QUFJRDs7QUFHRCxJQUFBLFFBQVEsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQVAsQ0FBMUI7O0FBQ0EsUUFBSSxRQUFRLENBQUMsTUFBVCxHQUFrQixDQUF0QixFQUF5QjtBQUN2QixZQUFNLE1BQU0sR0FBRyxFQUFmOztBQUNBLFdBQUssSUFBSSxDQUFULElBQWMsUUFBZCxFQUF3QjtBQUV0QixjQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsQ0FBRCxDQUF2QjtBQUNBLFlBQUksS0FBSyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBUixDQUF2Qjs7QUFDQSxZQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1YsVUFBQSxLQUFLLEdBQUcsU0FBUyxDQUFDLE1BQWxCO0FBQ0EsVUFBQSxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQVIsQ0FBWCxHQUE2QixLQUE3QjtBQUNBLFVBQUEsU0FBUyxDQUFDLElBQVYsQ0FBZTtBQUNiLFlBQUEsRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQURFO0FBRWIsWUFBQSxJQUFJLEVBQUUsTUFBTSxDQUFDO0FBRkEsV0FBZjtBQUlEOztBQUNELFFBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWTtBQUNWLFVBQUEsRUFBRSxFQUFFLE1BQU0sQ0FBQyxNQUREO0FBRVYsVUFBQSxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBRkY7QUFHVixVQUFBLEdBQUcsRUFBRTtBQUhLLFNBQVo7QUFLRDs7QUFDRCxNQUFBLEtBQUssQ0FBQyxHQUFOLEdBQVksTUFBWjtBQUNEOztBQUVELElBQUEsR0FBRyxDQUFDLElBQUosQ0FBUyxLQUFUO0FBQ0QsR0FoRUQ7QUFrRUEsUUFBTSxNQUFNLEdBQUc7QUFDYixJQUFBLEdBQUcsRUFBRTtBQURRLEdBQWY7O0FBS0EsTUFBSSxHQUFHLENBQUMsTUFBSixHQUFhLENBQWpCLEVBQW9CO0FBQ2xCLElBQUEsTUFBTSxDQUFDLEdBQVAsR0FBYSxHQUFHLENBQUMsQ0FBRCxDQUFILENBQU8sR0FBcEI7QUFDQSxJQUFBLE1BQU0sQ0FBQyxHQUFQLEdBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBRCxDQUFILENBQU8sR0FBUCxJQUFjLEVBQWYsRUFBbUIsTUFBbkIsQ0FBMEIsR0FBRyxDQUFDLENBQUQsQ0FBSCxDQUFPLEdBQVAsSUFBYyxFQUF4QyxDQUFiOztBQUVBLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQXhCLEVBQWdDLENBQUMsRUFBakMsRUFBcUM7QUFDbkMsWUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUQsQ0FBakI7QUFDQSxZQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBUCxDQUFXLE1BQVgsR0FBb0IsQ0FBbkM7QUFFQSxNQUFBLE1BQU0sQ0FBQyxHQUFQLENBQVcsSUFBWCxDQUFnQjtBQUNkLFFBQUEsRUFBRSxFQUFFLElBRFU7QUFFZCxRQUFBLEdBQUcsRUFBRSxDQUZTO0FBR2QsUUFBQSxFQUFFLEVBQUUsTUFBTSxHQUFHO0FBSEMsT0FBaEI7QUFNQSxNQUFBLE1BQU0sQ0FBQyxHQUFQLElBQWMsTUFBTSxLQUFLLENBQUMsR0FBMUI7O0FBQ0EsVUFBSSxLQUFLLENBQUMsR0FBVixFQUFlO0FBQ2IsUUFBQSxNQUFNLENBQUMsR0FBUCxHQUFhLE1BQU0sQ0FBQyxHQUFQLENBQVcsTUFBWCxDQUFrQixLQUFLLENBQUMsR0FBTixDQUFVLEdBQVYsQ0FBZSxDQUFELElBQU87QUFDbEQsVUFBQSxDQUFDLENBQUMsRUFBRixJQUFRLE1BQVI7QUFDQSxpQkFBTyxDQUFQO0FBQ0QsU0FIOEIsQ0FBbEIsQ0FBYjtBQUlEOztBQUNELFVBQUksS0FBSyxDQUFDLEdBQVYsRUFBZTtBQUNiLFFBQUEsTUFBTSxDQUFDLEdBQVAsR0FBYSxNQUFNLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBa0IsS0FBSyxDQUFDLEdBQU4sQ0FBVSxHQUFWLENBQWUsQ0FBRCxJQUFPO0FBQ2xELFVBQUEsQ0FBQyxDQUFDLEVBQUYsSUFBUSxNQUFSO0FBQ0EsaUJBQU8sQ0FBUDtBQUNELFNBSDhCLENBQWxCLENBQWI7QUFJRDtBQUNGOztBQUVELFFBQUksTUFBTSxDQUFDLEdBQVAsQ0FBVyxNQUFYLElBQXFCLENBQXpCLEVBQTRCO0FBQzFCLGFBQU8sTUFBTSxDQUFDLEdBQWQ7QUFDRDs7QUFFRCxRQUFJLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLENBQXZCLEVBQTBCO0FBQ3hCLE1BQUEsTUFBTSxDQUFDLEdBQVAsR0FBYSxTQUFiO0FBQ0Q7QUFDRjs7QUFDRCxTQUFPLE1BQVA7QUFDRCxDQTVIRDs7QUFzSUEsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsVUFBUyxLQUFULEVBQWdCLE1BQWhCLEVBQXdCO0FBQ3RDLE1BQUksQ0FBQyxLQUFMLEVBQVk7QUFDVixXQUFPLE1BQVA7QUFDRDs7QUFDRCxNQUFJLENBQUMsTUFBTCxFQUFhO0FBQ1gsV0FBTyxLQUFQO0FBQ0Q7O0FBRUQsRUFBQSxLQUFLLENBQUMsR0FBTixHQUFZLEtBQUssQ0FBQyxHQUFOLElBQWEsRUFBekI7QUFDQSxRQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBTixDQUFVLE1BQXRCOztBQUVBLE1BQUksT0FBTyxNQUFQLElBQWlCLFFBQXJCLEVBQStCO0FBQzdCLElBQUEsS0FBSyxDQUFDLEdBQU4sSUFBYSxNQUFiO0FBQ0QsR0FGRCxNQUVPLElBQUksTUFBTSxDQUFDLEdBQVgsRUFBZ0I7QUFDckIsSUFBQSxLQUFLLENBQUMsR0FBTixJQUFhLE1BQU0sQ0FBQyxHQUFwQjtBQUNEOztBQUVELE1BQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxNQUFNLENBQUMsR0FBckIsQ0FBSixFQUErQjtBQUM3QixJQUFBLEtBQUssQ0FBQyxHQUFOLEdBQVksS0FBSyxDQUFDLEdBQU4sSUFBYSxFQUF6Qjs7QUFDQSxRQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsTUFBTSxDQUFDLEdBQXJCLENBQUosRUFBK0I7QUFDN0IsTUFBQSxLQUFLLENBQUMsR0FBTixHQUFZLEtBQUssQ0FBQyxHQUFOLElBQWEsRUFBekI7QUFDRDs7QUFDRCxJQUFBLE1BQU0sQ0FBQyxHQUFQLENBQVcsT0FBWCxDQUFtQixHQUFHLElBQUk7QUFDeEIsWUFBTSxHQUFHLEdBQUc7QUFDVixRQUFBLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFKLEdBQVMsQ0FBVixJQUFlLEdBRFQ7QUFFVixRQUFBLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBSixHQUFVO0FBRkwsT0FBWjs7QUFLQSxVQUFJLEdBQUcsQ0FBQyxFQUFKLElBQVUsQ0FBQyxDQUFmLEVBQWtCO0FBQ2hCLFFBQUEsR0FBRyxDQUFDLEVBQUosR0FBUyxDQUFDLENBQVY7QUFDQSxRQUFBLEdBQUcsQ0FBQyxHQUFKLEdBQVUsQ0FBVjtBQUNEOztBQUNELFVBQUksR0FBRyxDQUFDLEVBQVIsRUFBWTtBQUNWLFFBQUEsR0FBRyxDQUFDLEVBQUosR0FBUyxHQUFHLENBQUMsRUFBYjtBQUNELE9BRkQsTUFFTztBQUNMLFFBQUEsR0FBRyxDQUFDLEdBQUosR0FBVSxLQUFLLENBQUMsR0FBTixDQUFVLE1BQXBCO0FBQ0EsUUFBQSxLQUFLLENBQUMsR0FBTixDQUFVLElBQVYsQ0FBZSxNQUFNLENBQUMsR0FBUCxDQUFXLEdBQUcsQ0FBQyxHQUFKLElBQVcsQ0FBdEIsQ0FBZjtBQUNEOztBQUNELE1BQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWLENBQWUsR0FBZjtBQUNELEtBakJEO0FBa0JEOztBQUVELFNBQU8sS0FBUDtBQUNELENBM0NEOztBQXVFQSxNQUFNLENBQUMsV0FBUCxHQUFxQixVQUFTLE9BQVQsRUFBa0IsRUFBbEIsRUFBc0IsU0FBdEIsRUFBaUM7QUFDcEQsRUFBQSxPQUFPLEdBQUcsT0FBTyxJQUFJO0FBQ25CLElBQUEsR0FBRyxFQUFFO0FBRGMsR0FBckI7QUFHQSxFQUFBLE9BQU8sQ0FBQyxHQUFSLEdBQWMsT0FBTyxDQUFDLEdBQVIsSUFBZSxFQUE3QjtBQUNBLEVBQUEsT0FBTyxDQUFDLEdBQVIsR0FBYyxPQUFPLENBQUMsR0FBUixJQUFlLEVBQTdCO0FBRUEsRUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQVosQ0FBaUI7QUFDZixJQUFBLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FETTtBQUVmLElBQUEsR0FBRyxFQUFFLENBRlU7QUFHZixJQUFBLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBUixDQUFZO0FBSEYsR0FBakI7QUFNQSxRQUFNLEVBQUUsR0FBRztBQUNULElBQUEsRUFBRSxFQUFFLElBREs7QUFFVCxJQUFBLElBQUksRUFBRTtBQUNKLE1BQUEsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQURaO0FBRUosTUFBQSxHQUFHLEVBQUUsU0FBUyxDQUFDLE9BRlg7QUFHSixNQUFBLEtBQUssRUFBRSxTQUFTLENBQUMsS0FIYjtBQUlKLE1BQUEsTUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUpkO0FBS0osTUFBQSxJQUFJLEVBQUUsU0FBUyxDQUFDLFFBTFo7QUFNSixNQUFBLElBQUksRUFBRSxTQUFTLENBQUMsSUFBVixHQUFpQixDQU5uQjtBQU9KLE1BQUEsR0FBRyxFQUFFLFNBQVMsQ0FBQztBQVBYO0FBRkcsR0FBWDs7QUFhQSxNQUFJLFNBQVMsQ0FBQyxVQUFkLEVBQTBCO0FBQ3hCLElBQUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxZQUFSLEdBQXVCLFNBQVMsQ0FBQyxZQUFqQztBQUNBLElBQUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxXQUFSLEdBQXNCLElBQXRCO0FBQ0EsSUFBQSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixDQUNFLEdBQUcsSUFBSTtBQUNMLE1BQUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxHQUFSLEdBQWMsR0FBZDtBQUNBLE1BQUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxZQUFSLEdBQXVCLFNBQXZCO0FBQ0EsTUFBQSxFQUFFLENBQUMsSUFBSCxDQUFRLFdBQVIsR0FBc0IsU0FBdEI7QUFDRCxLQUxILEVBTUUsQ0FBQyxJQUFJO0FBRUgsTUFBQSxFQUFFLENBQUMsSUFBSCxDQUFRLFdBQVIsR0FBc0IsU0FBdEI7QUFDRCxLQVRIO0FBV0Q7O0FBRUQsRUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQVosQ0FBaUIsRUFBakI7QUFFQSxTQUFPLE9BQVA7QUFDRCxDQTdDRDs7QUF3RUEsTUFBTSxDQUFDLFdBQVAsR0FBcUIsVUFBUyxPQUFULEVBQWtCLEVBQWxCLEVBQXNCLFNBQXRCLEVBQWlDO0FBQ3BELEVBQUEsT0FBTyxHQUFHLE9BQU8sSUFBSTtBQUNuQixJQUFBLEdBQUcsRUFBRTtBQURjLEdBQXJCO0FBR0EsRUFBQSxPQUFPLENBQUMsR0FBUixHQUFjLE9BQU8sQ0FBQyxHQUFSLElBQWUsRUFBN0I7QUFDQSxFQUFBLE9BQU8sQ0FBQyxHQUFSLEdBQWMsT0FBTyxDQUFDLEdBQVIsSUFBZSxFQUE3QjtBQUVBLEVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxJQUFaLENBQWlCO0FBQ2YsSUFBQSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBRE07QUFFZixJQUFBLEdBQUcsRUFBRSxDQUZVO0FBR2YsSUFBQSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQVIsQ0FBWTtBQUhGLEdBQWpCO0FBTUEsUUFBTSxFQUFFLEdBQUc7QUFDVCxJQUFBLEVBQUUsRUFBRSxJQURLO0FBRVQsSUFBQSxJQUFJLEVBQUU7QUFDSixNQUFBLElBQUksRUFBRSxTQUFTLENBQUMsSUFEWjtBQUVKLE1BQUEsR0FBRyxFQUFFLFNBQVMsQ0FBQyxJQUZYO0FBR0osTUFBQSxRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVYsR0FBcUIsQ0FIM0I7QUFJSixNQUFBLE9BQU8sRUFBRSxTQUFTLENBQUMsT0FKZjtBQUtKLE1BQUEsSUFBSSxFQUFFLFNBQVMsQ0FBQyxRQUxaO0FBTUosTUFBQSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQVYsR0FBaUIsQ0FObkI7QUFPSixNQUFBLEdBQUcsRUFBRSxTQUFTLENBQUM7QUFQWDtBQUZHLEdBQVg7O0FBYUEsTUFBSSxTQUFTLENBQUMsVUFBZCxFQUEwQjtBQUN4QixJQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsV0FBUixHQUFzQixJQUF0QjtBQUNBLElBQUEsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsQ0FDRSxHQUFHLElBQUk7QUFDTCxNQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsR0FBUixHQUFjLEdBQWQ7QUFDQSxNQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsV0FBUixHQUFzQixTQUF0QjtBQUNELEtBSkgsRUFLRSxDQUFDLElBQUk7QUFFSCxNQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsV0FBUixHQUFzQixTQUF0QjtBQUNELEtBUkg7QUFVRDs7QUFFRCxFQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWixDQUFpQixFQUFqQjtBQUVBLFNBQU8sT0FBUDtBQUNELENBM0NEOztBQXNEQSxNQUFNLENBQUMsS0FBUCxHQUFlLFVBQVMsTUFBVCxFQUFpQixHQUFqQixFQUFzQixJQUF0QixFQUE0QjtBQUN6QyxRQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBUCxDQUFjLE1BQU0sQ0FBQyxlQUFQLENBQXVCLE1BQU0sQ0FBQyxPQUFQLENBQWUsTUFBZixFQUF1QixHQUF2QixDQUF2QixDQUFkLEVBQW1FLElBQW5FLENBQWQ7QUFHQSxFQUFBLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBVixDQUFlO0FBQ2IsSUFBQSxFQUFFLEVBQUUsQ0FEUztBQUViLElBQUEsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFGRjtBQUdiLElBQUEsRUFBRSxFQUFFO0FBSFMsR0FBZjtBQU1BLFNBQU8sS0FBUDtBQUNELENBWEQ7O0FBcUJBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFVBQVMsSUFBVCxFQUFlLEdBQWYsRUFBb0I7QUFDbkMsU0FBTztBQUNMLElBQUEsR0FBRyxFQUFFLElBQUksSUFBSSxFQURSO0FBRUwsSUFBQSxHQUFHLEVBQUUsQ0FBQztBQUNKLE1BQUEsRUFBRSxFQUFFLENBREE7QUFFSixNQUFBLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFULEVBQWEsTUFGZDtBQUdKLE1BQUEsR0FBRyxFQUFFO0FBSEQsS0FBRCxDQUZBO0FBT0wsSUFBQSxHQUFHLEVBQUUsQ0FBQztBQUNKLE1BQUEsRUFBRSxFQUFFLElBREE7QUFFSixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsR0FBRyxFQUFFO0FBREQ7QUFGRixLQUFEO0FBUEEsR0FBUDtBQWNELENBZkQ7O0FBeUJBLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLFVBQVMsT0FBVCxFQUFrQixRQUFsQixFQUE0QjtBQUM5QyxFQUFBLE9BQU8sR0FBRyxPQUFPLElBQUk7QUFDbkIsSUFBQSxHQUFHLEVBQUU7QUFEYyxHQUFyQjtBQUlBLEVBQUEsT0FBTyxDQUFDLEdBQVIsR0FBYyxPQUFPLENBQUMsR0FBUixJQUFlLEVBQTdCO0FBQ0EsRUFBQSxPQUFPLENBQUMsR0FBUixHQUFjLE9BQU8sQ0FBQyxHQUFSLElBQWUsRUFBN0I7QUFFQSxFQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWixDQUFpQjtBQUNmLElBQUEsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFERDtBQUVmLElBQUEsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFULENBQWEsTUFGSDtBQUdmLElBQUEsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFSLENBQVk7QUFIRixHQUFqQjtBQUtBLEVBQUEsT0FBTyxDQUFDLEdBQVIsSUFBZSxRQUFRLENBQUMsR0FBeEI7QUFFQSxRQUFNLEVBQUUsR0FBRztBQUNULElBQUEsRUFBRSxFQUFFLElBREs7QUFFVCxJQUFBLElBQUksRUFBRTtBQUNKLE1BQUEsR0FBRyxFQUFFLFFBQVEsQ0FBQztBQURWO0FBRkcsR0FBWDtBQU1BLEVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxJQUFaLENBQWlCLEVBQWpCO0FBRUEsU0FBTyxPQUFQO0FBQ0QsQ0F4QkQ7O0FBb0NBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLFVBQVMsT0FBVCxFQUFrQixTQUFsQixFQUE2QjtBQUNoRCxFQUFBLE9BQU8sR0FBRyxPQUFPLElBQUk7QUFDbkIsSUFBQSxHQUFHLEVBQUU7QUFEYyxHQUFyQjtBQUdBLEVBQUEsT0FBTyxDQUFDLEdBQVIsSUFBZSxHQUFmO0FBQ0EsU0FBTyxNQUFNLENBQUMsV0FBUCxDQUFtQixPQUFuQixFQUE0QixPQUFPLENBQUMsR0FBUixDQUFZLE1BQVosR0FBcUIsQ0FBakQsRUFBb0QsU0FBcEQsQ0FBUDtBQUNELENBTkQ7O0FBa0JBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLFVBQVMsT0FBVCxFQUFrQixTQUFsQixFQUE2QjtBQUNoRCxFQUFBLE9BQU8sR0FBRyxPQUFPLElBQUk7QUFDbkIsSUFBQSxHQUFHLEVBQUU7QUFEYyxHQUFyQjtBQUdBLEVBQUEsT0FBTyxDQUFDLEdBQVIsSUFBZSxHQUFmO0FBQ0EsU0FBTyxNQUFNLENBQUMsV0FBUCxDQUFtQixPQUFuQixFQUE0QixPQUFPLENBQUMsR0FBUixDQUFZLE1BQVosR0FBcUIsQ0FBakQsRUFBb0QsU0FBcEQsQ0FBUDtBQUNELENBTkQ7O0FBOEJBLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLFVBQVMsT0FBVCxFQUFrQixjQUFsQixFQUFrQztBQUNwRCxFQUFBLE9BQU8sR0FBRyxPQUFPLElBQUk7QUFDbkIsSUFBQSxHQUFHLEVBQUU7QUFEYyxHQUFyQjtBQUlBLEVBQUEsT0FBTyxDQUFDLEdBQVIsR0FBYyxPQUFPLENBQUMsR0FBUixJQUFlLEVBQTdCO0FBQ0EsRUFBQSxPQUFPLENBQUMsR0FBUixHQUFjLE9BQU8sQ0FBQyxHQUFSLElBQWUsRUFBN0I7QUFFQSxFQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWixDQUFpQjtBQUNmLElBQUEsRUFBRSxFQUFFLENBQUMsQ0FEVTtBQUVmLElBQUEsR0FBRyxFQUFFLENBRlU7QUFHZixJQUFBLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBUixDQUFZO0FBSEYsR0FBakI7QUFNQSxRQUFNLEVBQUUsR0FBRztBQUNULElBQUEsRUFBRSxFQUFFLElBREs7QUFFVCxJQUFBLElBQUksRUFBRTtBQUNKLE1BQUEsSUFBSSxFQUFFLGNBQWMsQ0FBQyxJQURqQjtBQUVKLE1BQUEsR0FBRyxFQUFFLGNBQWMsQ0FBQyxJQUZoQjtBQUdKLE1BQUEsSUFBSSxFQUFFLGNBQWMsQ0FBQyxRQUhqQjtBQUlKLE1BQUEsR0FBRyxFQUFFLGNBQWMsQ0FBQyxNQUpoQjtBQUtKLE1BQUEsSUFBSSxFQUFFLGNBQWMsQ0FBQyxJQUFmLEdBQXNCO0FBTHhCO0FBRkcsR0FBWDs7QUFVQSxNQUFJLGNBQWMsQ0FBQyxVQUFuQixFQUErQjtBQUM3QixJQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsV0FBUixHQUFzQixJQUF0QjtBQUNBLElBQUEsY0FBYyxDQUFDLFVBQWYsQ0FBMEIsSUFBMUIsQ0FDRyxHQUFELElBQVM7QUFDUCxNQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsR0FBUixHQUFjLEdBQWQ7QUFDQSxNQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsV0FBUixHQUFzQixTQUF0QjtBQUNELEtBSkgsRUFLRyxHQUFELElBQVM7QUFFUCxNQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsV0FBUixHQUFzQixTQUF0QjtBQUNELEtBUkg7QUFVRDs7QUFDRCxFQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWixDQUFpQixFQUFqQjtBQUVBLFNBQU8sT0FBUDtBQUNELENBeENEOztBQXNEQSxNQUFNLENBQUMsUUFBUCxHQUFrQixVQUFTLE9BQVQsRUFBa0IsS0FBbEIsRUFBeUIsRUFBekIsRUFBNkIsR0FBN0IsRUFBa0M7QUFDbEQsTUFBSSxPQUFPLE9BQVAsSUFBa0IsUUFBdEIsRUFBZ0M7QUFDOUIsSUFBQSxPQUFPLEdBQUc7QUFDUixNQUFBLEdBQUcsRUFBRTtBQURHLEtBQVY7QUFHRDs7QUFDRCxFQUFBLE9BQU8sQ0FBQyxHQUFSLEdBQWMsT0FBTyxDQUFDLEdBQVIsSUFBZSxFQUE3QjtBQUVBLEVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxJQUFaLENBQWlCO0FBQ2YsSUFBQSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBREs7QUFFZixJQUFBLEdBQUcsRUFBRSxHQUFHLElBQUksT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUZUO0FBR2YsSUFBQSxFQUFFLEVBQUU7QUFIVyxHQUFqQjtBQU1BLFNBQU8sT0FBUDtBQUNELENBZkQ7O0FBNEJBLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLFVBQVMsT0FBVCxFQUFrQixFQUFsQixFQUFzQixHQUF0QixFQUEyQjtBQUM3QyxTQUFPLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE9BQWhCLEVBQXlCLElBQXpCLEVBQStCLEVBQS9CLEVBQW1DLEdBQW5DLENBQVA7QUFDRCxDQUZEOztBQW1CQSxNQUFNLENBQUMsWUFBUCxHQUFzQixVQUFTLE9BQVQsRUFBa0IsRUFBbEIsRUFBc0IsR0FBdEIsRUFBMkIsSUFBM0IsRUFBaUMsVUFBakMsRUFBNkMsV0FBN0MsRUFBMEQsTUFBMUQsRUFBa0U7QUFDdEYsTUFBSSxPQUFPLE9BQVAsSUFBa0IsUUFBdEIsRUFBZ0M7QUFDOUIsSUFBQSxPQUFPLEdBQUc7QUFDUixNQUFBLEdBQUcsRUFBRTtBQURHLEtBQVY7QUFHRDs7QUFFRCxNQUFJLENBQUMsT0FBRCxJQUFZLENBQUMsT0FBTyxDQUFDLEdBQXJCLElBQTRCLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixHQUFxQixFQUFFLEdBQUcsR0FBMUQsRUFBK0Q7QUFDN0QsV0FBTyxJQUFQO0FBQ0Q7O0FBRUQsTUFBSSxHQUFHLElBQUksQ0FBUCxJQUFZLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxPQUFmLENBQXVCLFVBQXZCLEtBQXNDLENBQUMsQ0FBdkQsRUFBMEQ7QUFDeEQsV0FBTyxJQUFQO0FBQ0Q7O0FBRUQsTUFBSSxVQUFVLElBQUksS0FBZCxJQUF1QixDQUFDLE1BQTVCLEVBQW9DO0FBQ2xDLFdBQU8sSUFBUDtBQUNEOztBQUNELEVBQUEsTUFBTSxHQUFHLEtBQUssTUFBZDtBQUVBLEVBQUEsT0FBTyxDQUFDLEdBQVIsR0FBYyxPQUFPLENBQUMsR0FBUixJQUFlLEVBQTdCO0FBQ0EsRUFBQSxPQUFPLENBQUMsR0FBUixHQUFjLE9BQU8sQ0FBQyxHQUFSLElBQWUsRUFBN0I7QUFFQSxFQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWixDQUFpQjtBQUNmLElBQUEsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQURNO0FBRWYsSUFBQSxHQUFHLEVBQUUsR0FGVTtBQUdmLElBQUEsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFSLENBQVk7QUFIRixHQUFqQjtBQUtBLEVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxJQUFaLENBQWlCO0FBQ2YsSUFBQSxFQUFFLEVBQUUsSUFEVztBQUVmLElBQUEsSUFBSSxFQUFFO0FBQ0osTUFBQSxHQUFHLEVBQUUsVUFERDtBQUVKLE1BQUEsR0FBRyxFQUFFLFdBRkQ7QUFHSixNQUFBLEdBQUcsRUFBRSxNQUhEO0FBSUosTUFBQSxJQUFJLEVBQUU7QUFKRjtBQUZTLEdBQWpCO0FBVUEsU0FBTyxPQUFQO0FBQ0QsQ0F2Q0Q7O0FBdURBLE1BQU0sQ0FBQyxZQUFQLEdBQXNCLFVBQVMsT0FBVCxFQUFrQixLQUFsQixFQUF5QixJQUF6QixFQUErQixVQUEvQixFQUEyQyxXQUEzQyxFQUF3RCxNQUF4RCxFQUFnRTtBQUNwRixFQUFBLE9BQU8sR0FBRyxPQUFPLElBQUk7QUFDbkIsSUFBQSxHQUFHLEVBQUU7QUFEYyxHQUFyQjtBQUdBLFFBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBdkI7QUFDQSxFQUFBLE9BQU8sQ0FBQyxHQUFSLElBQWUsS0FBZjtBQUNBLFNBQU8sTUFBTSxDQUFDLFlBQVAsQ0FBb0IsT0FBcEIsRUFBNkIsRUFBN0IsRUFBaUMsS0FBSyxDQUFDLE1BQXZDLEVBQStDLElBQS9DLEVBQXFELFVBQXJELEVBQWlFLFdBQWpFLEVBQThFLE1BQTlFLENBQVA7QUFDRCxDQVBEOztBQW9CQSxNQUFNLENBQUMsVUFBUCxHQUFvQixVQUFTLE9BQVQsRUFBa0IsSUFBbEIsRUFBd0I7QUFDMUMsRUFBQSxPQUFPLEdBQUcsT0FBTyxJQUFJO0FBQ25CLElBQUEsR0FBRyxFQUFFO0FBRGMsR0FBckI7QUFHQSxFQUFBLE9BQU8sQ0FBQyxHQUFSLEdBQWMsT0FBTyxDQUFDLEdBQVIsSUFBZSxFQUE3QjtBQUNBLEVBQUEsT0FBTyxDQUFDLEdBQVIsR0FBYyxPQUFPLENBQUMsR0FBUixJQUFlLEVBQTdCO0FBRUEsRUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQVosQ0FBaUI7QUFDZixJQUFBLEVBQUUsRUFBRSxDQUFDLENBRFU7QUFFZixJQUFBLEdBQUcsRUFBRSxDQUZVO0FBR2YsSUFBQSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQVIsQ0FBWTtBQUhGLEdBQWpCO0FBTUEsRUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQVosQ0FBaUI7QUFDZixJQUFBLEVBQUUsRUFBRSxJQURXO0FBRWYsSUFBQSxJQUFJLEVBQUU7QUFDSixNQUFBLElBQUksRUFBRSxjQURGO0FBRUosTUFBQSxHQUFHLEVBQUU7QUFGRDtBQUZTLEdBQWpCO0FBUUEsU0FBTyxPQUFQO0FBQ0QsQ0F0QkQ7O0FBK0JBLE1BQU0sQ0FBQyxlQUFQLEdBQXlCLFVBQVMsT0FBVCxFQUFrQjtBQUN6QyxFQUFBLE9BQU8sR0FBRyxPQUFPLElBQUk7QUFDbkIsSUFBQSxHQUFHLEVBQUU7QUFEYyxHQUFyQjtBQUdBLEVBQUEsT0FBTyxDQUFDLEdBQVIsR0FBYyxPQUFPLENBQUMsR0FBUixJQUFlLEVBQTdCO0FBQ0EsRUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQVosQ0FBaUI7QUFDZixJQUFBLEVBQUUsRUFBRSxPQUFPLENBQUMsR0FBUixDQUFZLE1BREQ7QUFFZixJQUFBLEdBQUcsRUFBRSxDQUZVO0FBR2YsSUFBQSxFQUFFLEVBQUU7QUFIVyxHQUFqQjtBQUtBLEVBQUEsT0FBTyxDQUFDLEdBQVIsSUFBZSxHQUFmO0FBRUEsU0FBTyxPQUFQO0FBQ0QsQ0FiRDs7QUEwQkEsTUFBTSxDQUFDLGFBQVAsR0FBdUIsVUFBUyxHQUFULEVBQWM7QUFDbkMsTUFBSSxJQUFJLEdBQUcsWUFBWSxDQUFDLEdBQUQsQ0FBdkI7O0FBQ0EsUUFBTSxhQUFhLEdBQUcsVUFBUyxJQUFULEVBQWUsSUFBZixFQUFxQixNQUFyQixFQUE2QjtBQUNqRCxVQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMsSUFBRCxDQUF0QjtBQUNBLFFBQUksTUFBTSxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBUCxDQUFZLEVBQVosQ0FBSCxHQUFxQixFQUF4Qzs7QUFDQSxRQUFJLEdBQUosRUFBUztBQUNQLE1BQUEsTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFKLENBQVMsSUFBVCxJQUFpQixNQUFqQixHQUEwQixHQUFHLENBQUMsS0FBSixDQUFVLElBQVYsQ0FBbkM7QUFDRDs7QUFDRCxXQUFPLE1BQVA7QUFDRCxHQVBEOztBQVFBLFNBQU8sWUFBWSxDQUFDLElBQUQsRUFBTyxhQUFQLEVBQXNCLENBQXRCLENBQW5CO0FBQ0QsQ0FYRDs7QUF1Q0EsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsVUFBUyxRQUFULEVBQW1CLFNBQW5CLEVBQThCLE9BQTlCLEVBQXVDO0FBQ3JELFNBQU8sWUFBWSxDQUFDLFlBQVksQ0FBQyxRQUFELENBQWIsRUFBeUIsU0FBekIsRUFBb0MsQ0FBcEMsRUFBdUMsRUFBdkMsRUFBMkMsT0FBM0MsQ0FBbkI7QUFDRCxDQUZEOztBQWNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFVBQVMsUUFBVCxFQUFtQixLQUFuQixFQUEwQixLQUExQixFQUFpQztBQUNoRCxNQUFJLElBQUksR0FBRyxZQUFZLENBQUMsUUFBRCxDQUF2QjtBQUNBLEVBQUEsSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFELEVBQU8sS0FBUCxFQUFjLEdBQWQsQ0FBbEI7O0FBQ0EsTUFBSSxJQUFJLElBQUksS0FBWixFQUFtQjtBQUNqQixJQUFBLElBQUksR0FBRyxXQUFXLENBQUMsSUFBRCxDQUFsQjtBQUNEOztBQUNELFNBQU8sWUFBWSxDQUFDLEVBQUQsRUFBSyxJQUFMLEVBQVcsRUFBWCxDQUFuQjtBQUNELENBUEQ7O0FBaUJBLE1BQU0sQ0FBQyxnQkFBUCxHQUEwQixVQUFTLFFBQVQsRUFBbUI7QUFDM0MsTUFBSSxJQUFJLEdBQUcsWUFBWSxDQUFDLFFBQUQsQ0FBdkI7O0FBQ0EsUUFBTSxTQUFTLEdBQUcsVUFBUyxJQUFULEVBQWU7QUFDL0IsUUFBSSxJQUFJLENBQUMsSUFBTCxJQUFhLElBQWpCLEVBQXVCO0FBQ3JCLFVBQUksQ0FBQyxJQUFJLENBQUMsTUFBTixJQUFnQixDQUFDLElBQUksQ0FBQyxNQUFMLENBQVksSUFBakMsRUFBdUM7QUFDckMsZUFBTyxJQUFQO0FBQ0Q7QUFDRjs7QUFDRCxXQUFPLElBQVA7QUFDRCxHQVBEOztBQVNBLEVBQUEsSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFELEVBQU8sU0FBUCxDQUFsQjtBQUVBLEVBQUEsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFELENBQVo7QUFFQSxTQUFPLFlBQVksQ0FBQyxFQUFELEVBQUssSUFBTCxFQUFXLEVBQVgsQ0FBbkI7QUFDRCxDQWhCRDs7QUFnQ0EsTUFBTSxDQUFDLFlBQVAsR0FBc0IsVUFBUyxRQUFULEVBQW1CLEtBQW5CLEVBQTBCO0FBQzlDLFFBQU0sWUFBWSxHQUFHLFVBQVMsSUFBVCxFQUFlO0FBQ2xDLFFBQUksSUFBSSxDQUFDLElBQUwsSUFBYSxJQUFqQixFQUF1QjtBQUNyQixhQUFPLElBQVA7QUFDRCxLQUZELE1BRU8sSUFBSSxJQUFJLENBQUMsSUFBTCxJQUFhLElBQWpCLEVBQXVCO0FBQzVCLFVBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFOLElBQWdCLENBQUMsSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUE5QixLQUF1QyxDQUFDLElBQUksQ0FBQyxJQUFMLElBQWEsRUFBZCxFQUFrQixVQUFsQixDQUE2QixHQUE3QixDQUEzQyxFQUE4RTtBQUM1RSxRQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksR0FBWjtBQUNBLGVBQU8sSUFBSSxDQUFDLFFBQVo7QUFDQSxlQUFPLElBQUksQ0FBQyxJQUFaO0FBQ0Q7QUFDRixLQU5NLE1BTUEsSUFBSSxJQUFJLENBQUMsSUFBTCxJQUFhLElBQWpCLEVBQXVCO0FBQzVCLE1BQUEsSUFBSSxDQUFDLElBQUwsR0FBWSxHQUFaO0FBQ0EsYUFBTyxJQUFJLENBQUMsSUFBWjtBQUNBLGFBQU8sSUFBSSxDQUFDLFFBQVo7QUFDRDs7QUFDRCxXQUFPLElBQVA7QUFDRCxHQWZEOztBQWlCQSxNQUFJLElBQUksR0FBRyxZQUFZLENBQUMsUUFBRCxDQUF2Qjs7QUFDQSxNQUFJLENBQUMsSUFBTCxFQUFXO0FBQ1QsV0FBTyxRQUFQO0FBQ0Q7O0FBR0QsRUFBQSxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUQsRUFBTyxZQUFQLENBQWxCO0FBRUEsRUFBQSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsSUFBRCxFQUFPLHVCQUFQLENBQXZCO0FBRUEsRUFBQSxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUQsRUFBTyxLQUFQLEVBQWMsR0FBZCxDQUFsQjtBQUVBLEVBQUEsSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFELEVBQU8sSUFBSSxJQUFLLElBQUksQ0FBQyxJQUFMLElBQWEsSUFBYixHQUFvQixDQUFDLEtBQUQsQ0FBcEIsR0FBOEIsSUFBOUMsQ0FBbEI7QUFFQSxTQUFPLFlBQVksQ0FBQyxFQUFELEVBQUssSUFBTCxFQUFXLEVBQVgsQ0FBbkI7QUFDRCxDQWpDRDs7QUFzREEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsVUFBUyxRQUFULEVBQW1CLEtBQW5CLEVBQTBCLFVBQTFCLEVBQXNDO0FBQ3JELE1BQUksSUFBSSxHQUFHLFlBQVksQ0FBQyxRQUFELENBQXZCO0FBR0EsRUFBQSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsSUFBRCxFQUFPLHVCQUFQLENBQXZCOztBQUdBLFFBQU0sWUFBWSxHQUFHLFVBQVMsSUFBVCxFQUFlO0FBQ2xDLFFBQUksSUFBSSxDQUFDLElBQUwsSUFBYSxJQUFqQixFQUF1QjtBQUNyQixVQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTixJQUFnQixDQUFDLElBQUksQ0FBQyxNQUFMLENBQVksSUFBOUIsS0FBdUMsQ0FBQyxJQUFJLENBQUMsSUFBTCxJQUFhLEVBQWQsRUFBa0IsVUFBbEIsQ0FBNkIsR0FBN0IsQ0FBM0MsRUFBOEU7QUFDNUUsUUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLEdBQVo7QUFDQSxlQUFPLElBQUksQ0FBQyxRQUFaO0FBQ0Q7QUFDRixLQUxELE1BS08sSUFBSSxJQUFJLENBQUMsSUFBTCxJQUFhLElBQWpCLEVBQXVCO0FBQzVCLE1BQUEsSUFBSSxDQUFDLElBQUwsR0FBWSxHQUFaO0FBQ0EsYUFBTyxJQUFJLENBQUMsUUFBWjtBQUNELEtBSE0sTUFHQSxJQUFJLElBQUksQ0FBQyxJQUFMLElBQWEsSUFBakIsRUFBdUI7QUFDNUIsTUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLEdBQVo7QUFDQSxhQUFPLElBQUksQ0FBQyxRQUFaO0FBQ0EsYUFBTyxJQUFJLENBQUMsSUFBWjtBQUNEOztBQUNELFdBQU8sSUFBUDtBQUNELEdBZkQ7O0FBZ0JBLEVBQUEsSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFELEVBQU8sWUFBUCxDQUFsQjtBQUVBLEVBQUEsSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFELEVBQU8sS0FBUCxFQUFjLEdBQWQsQ0FBbEI7O0FBQ0EsTUFBSSxVQUFKLEVBQWdCO0FBRWQsSUFBQSxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUQsRUFBTyxJQUFJLElBQUssSUFBSSxDQUFDLElBQUwsSUFBYSxJQUFiLEdBQW9CLENBQUMsS0FBRCxDQUFwQixHQUE4QixJQUE5QyxDQUFsQjtBQUNELEdBSEQsTUFHTztBQUNMLElBQUEsSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFELENBQWxCO0FBQ0Q7O0FBR0QsU0FBTyxZQUFZLENBQUMsRUFBRCxFQUFLLElBQUwsRUFBVyxFQUFYLENBQW5CO0FBQ0QsQ0FuQ0Q7O0FBNkNBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLFVBQVMsT0FBVCxFQUFrQjtBQUNyQyxTQUFPLE9BQU8sT0FBUCxJQUFrQixRQUFsQixHQUE2QixPQUE3QixHQUF1QyxPQUFPLENBQUMsR0FBdEQ7QUFDRCxDQUZEOztBQVlBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLFVBQVMsT0FBVCxFQUFrQjtBQUNyQyxTQUFPLE9BQU8sT0FBUCxJQUFrQixRQUFsQixJQUE4QixFQUFFLE9BQU8sQ0FBQyxHQUFSLElBQWUsT0FBTyxDQUFDLEdBQXpCLENBQXJDO0FBQ0QsQ0FGRDs7QUFZQSxNQUFNLENBQUMsT0FBUCxHQUFpQixVQUFTLE9BQVQsRUFBa0I7QUFDakMsTUFBSSxDQUFDLE9BQUwsRUFBYztBQUNaLFdBQU8sS0FBUDtBQUNEOztBQUVELFFBQU07QUFDSixJQUFBLEdBREk7QUFFSixJQUFBLEdBRkk7QUFHSixJQUFBO0FBSEksTUFJRixPQUpKOztBQU1BLE1BQUksQ0FBQyxHQUFELElBQVEsR0FBRyxLQUFLLEVBQWhCLElBQXNCLENBQUMsR0FBdkIsSUFBOEIsQ0FBQyxHQUFuQyxFQUF3QztBQUN0QyxXQUFPLEtBQVA7QUFDRDs7QUFFRCxRQUFNLFFBQVEsR0FBRyxPQUFPLEdBQXhCOztBQUNBLE1BQUksUUFBUSxJQUFJLFFBQVosSUFBd0IsUUFBUSxJQUFJLFdBQXBDLElBQW1ELEdBQUcsS0FBSyxJQUEvRCxFQUFxRTtBQUNuRSxXQUFPLEtBQVA7QUFDRDs7QUFFRCxNQUFJLE9BQU8sR0FBUCxJQUFjLFdBQWQsSUFBNkIsQ0FBQyxLQUFLLENBQUMsT0FBTixDQUFjLEdBQWQsQ0FBOUIsSUFBb0QsR0FBRyxLQUFLLElBQWhFLEVBQXNFO0FBQ3BFLFdBQU8sS0FBUDtBQUNEOztBQUVELE1BQUksT0FBTyxHQUFQLElBQWMsV0FBZCxJQUE2QixDQUFDLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxDQUE5QixJQUFvRCxHQUFHLEtBQUssSUFBaEUsRUFBc0U7QUFDcEUsV0FBTyxLQUFQO0FBQ0Q7O0FBQ0QsU0FBTyxJQUFQO0FBQ0QsQ0E1QkQ7O0FBdUNBLE1BQU0sQ0FBQyxjQUFQLEdBQXdCLFVBQVMsT0FBVCxFQUFrQjtBQUN4QyxNQUFJLENBQUMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxPQUFPLENBQUMsR0FBdEIsQ0FBTCxFQUFpQztBQUMvQixXQUFPLEtBQVA7QUFDRDs7QUFDRCxPQUFLLElBQUksQ0FBVCxJQUFjLE9BQU8sQ0FBQyxHQUF0QixFQUEyQjtBQUN6QixVQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBUixDQUFZLENBQVosQ0FBWjs7QUFDQSxRQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBSixHQUFTLENBQXBCLEVBQXVCO0FBQ3JCLFlBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFSLENBQVksR0FBRyxDQUFDLEdBQUosR0FBVSxDQUF0QixDQUFaO0FBQ0EsYUFBTyxHQUFHLElBQUksR0FBRyxDQUFDLEVBQUosSUFBVSxJQUFqQixJQUF5QixHQUFHLENBQUMsSUFBcEM7QUFDRDtBQUNGOztBQUNELFNBQU8sS0FBUDtBQUNELENBWkQ7O0FBbUNBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLFVBQVMsT0FBVCxFQUFrQixRQUFsQixFQUE0QixPQUE1QixFQUFxQztBQUN4RCxNQUFJLENBQUMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxPQUFPLENBQUMsR0FBdEIsQ0FBTCxFQUFpQztBQUMvQjtBQUNEOztBQUNELE1BQUksQ0FBQyxHQUFHLENBQVI7QUFDQSxFQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWixDQUFvQixHQUFHLElBQUk7QUFDekIsUUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLEVBQUosR0FBUyxDQUFwQixFQUF1QjtBQUNyQixZQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBUixDQUFZLEdBQUcsQ0FBQyxHQUFKLEdBQVUsQ0FBdEIsQ0FBWjs7QUFDQSxVQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBSixJQUFVLElBQWpCLElBQXlCLEdBQUcsQ0FBQyxJQUFqQyxFQUF1QztBQUNyQyxRQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsT0FBZCxFQUF1QixHQUFHLENBQUMsSUFBM0IsRUFBaUMsQ0FBQyxFQUFsQyxFQUFzQyxJQUF0QztBQUNEO0FBQ0Y7QUFDRixHQVBEO0FBUUQsQ0FiRDs7QUF1QkEsTUFBTSxDQUFDLFdBQVAsR0FBcUIsVUFBUyxPQUFULEVBQWtCO0FBQ3JDLFNBQU8sT0FBTyxDQUFDLEdBQVIsSUFBZSxPQUFPLENBQUMsR0FBUixDQUFZLE1BQVosR0FBcUIsQ0FBM0M7QUFDRCxDQUZEOztBQWFBLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLFVBQVMsT0FBVCxFQUFrQixRQUFsQixFQUE0QixPQUE1QixFQUFxQztBQUNyRCxNQUFJLE9BQU8sQ0FBQyxHQUFSLElBQWUsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLEdBQXFCLENBQXhDLEVBQTJDO0FBQ3pDLFNBQUssSUFBSSxDQUFULElBQWMsT0FBTyxDQUFDLEdBQXRCLEVBQTJCO0FBQ3pCLFVBQUksT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaLENBQUosRUFBb0I7QUFDbEIsUUFBQSxRQUFRLENBQUMsSUFBVCxDQUFjLE9BQWQsRUFBdUIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaLEVBQWUsSUFBdEMsRUFBNEMsQ0FBNUMsRUFBK0MsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaLEVBQWUsRUFBOUQ7QUFDRDtBQUNGO0FBQ0Y7QUFDRixDQVJEOztBQWtCQSxNQUFNLENBQUMsZ0JBQVAsR0FBMEIsVUFBUyxPQUFULEVBQWtCO0FBQzFDLE1BQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFuQixJQUEwQixPQUFPLENBQUMsR0FBUixDQUFZLE1BQVosR0FBcUIsQ0FBbkQsRUFBc0Q7QUFDcEQsU0FBSyxJQUFJLENBQVQsSUFBYyxPQUFPLENBQUMsR0FBdEIsRUFBMkI7QUFDekIsWUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaLENBQVo7O0FBQ0EsVUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQWYsRUFBcUI7QUFDbkIsY0FBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFMLENBQXhCOztBQUNBLFlBQUksSUFBSixFQUFVO0FBQ1IsVUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLENBQVosRUFBZSxJQUFmLEdBQXNCLElBQXRCO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsaUJBQU8sT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaLEVBQWUsSUFBdEI7QUFDRDtBQUNGO0FBQ0Y7QUFDRjs7QUFDRCxTQUFPLE9BQVA7QUFDRCxDQWZEOztBQTBCQSxNQUFNLENBQUMsY0FBUCxHQUF3QixVQUFTLE9BQVQsRUFBa0I7QUFDeEMsTUFBSSxHQUFHLEdBQUcsSUFBVjs7QUFDQSxNQUFJLE9BQU8sQ0FBQyxJQUFSLElBQWdCLGNBQWhCLElBQWtDLE9BQU8sQ0FBQyxHQUE5QyxFQUFtRDtBQUNqRCxJQUFBLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsR0FBVCxFQUFjLE9BQU8sQ0FBQyxJQUF0QixFQUE0QixNQUFNLENBQUMsTUFBbkMsQ0FBdkI7QUFDRCxHQUZELE1BRU8sSUFBSSxPQUFPLE9BQU8sQ0FBQyxHQUFmLElBQXNCLFFBQTFCLEVBQW9DO0FBQ3pDLElBQUEsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFkO0FBQ0Q7O0FBQ0QsU0FBTyxHQUFQO0FBQ0QsQ0FSRDs7QUFrQkEsTUFBTSxDQUFDLFlBQVAsR0FBc0IsVUFBUyxPQUFULEVBQWtCO0FBQ3RDLFNBQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFqQjtBQUNELENBRkQ7O0FBY0EsTUFBTSxDQUFDLGFBQVAsR0FBdUIsVUFBUyxPQUFULEVBQWtCO0FBQ3ZDLFNBQU8sT0FBTyxDQUFDLEdBQVIsR0FBYyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsR0FBVCxFQUFjLE9BQU8sQ0FBQyxJQUF0QixFQUE0QixNQUFNLENBQUMsTUFBbkMsQ0FBL0IsR0FBNEUsSUFBbkY7QUFDRCxDQUZEOztBQVlBLE1BQU0sQ0FBQyxhQUFQLEdBQXVCLFVBQVMsT0FBVCxFQUFrQjtBQUd2QyxTQUFPLE9BQU8sQ0FBQyxJQUFSLEdBQWUsT0FBTyxDQUFDLElBQXZCLEdBQThCLE9BQU8sQ0FBQyxHQUFSLEdBQWUsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLEdBQXFCLElBQXRCLEdBQThCLENBQTVDLEdBQWdELENBQXJGO0FBQ0QsQ0FKRDs7QUFjQSxNQUFNLENBQUMsaUJBQVAsR0FBMkIsVUFBUyxPQUFULEVBQWtCO0FBQzNDLFNBQU8sT0FBTyxDQUFDLElBQVIsSUFBZ0IsWUFBdkI7QUFDRCxDQUZEOztBQWFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFVBQVMsS0FBVCxFQUFnQjtBQUMvQixTQUFPLEtBQUssR0FBSSxTQUFTLENBQUMsS0FBRCxDQUFULEdBQW1CLFNBQVMsQ0FBQyxLQUFELENBQVQsQ0FBaUIsSUFBcEMsR0FBMkMsT0FBL0MsR0FBMEQsU0FBdEU7QUFDRCxDQUZEOztBQWdCQSxNQUFNLENBQUMsU0FBUCxHQUFtQixVQUFTLEtBQVQsRUFBZ0IsSUFBaEIsRUFBc0I7QUFDdkMsTUFBSSxJQUFJLElBQUksVUFBVSxDQUFDLEtBQUQsQ0FBdEIsRUFBK0I7QUFDN0IsV0FBTyxVQUFVLENBQUMsS0FBRCxDQUFWLENBQWtCLEtBQWxCLENBQXdCLElBQXhCLENBQVA7QUFDRDs7QUFFRCxTQUFPLFNBQVA7QUFDRCxDQU5EOztBQWVBLE1BQU0sQ0FBQyxjQUFQLEdBQXdCLFlBQVc7QUFDakMsU0FBTyxnQkFBUDtBQUNELENBRkQ7O0FBY0EsU0FBUyxRQUFULENBQWtCLElBQWxCLEVBQXdCLEtBQXhCLEVBQStCLEdBQS9CLEVBQW9DLEtBQXBDLEVBQTJDO0FBQ3pDLFFBQU0sTUFBTSxHQUFHLEVBQWY7O0FBRUEsTUFBSSxLQUFLLENBQUMsTUFBTixJQUFnQixDQUFwQixFQUF1QjtBQUNyQixXQUFPLEVBQVA7QUFDRDs7QUFFRCxPQUFLLElBQUksQ0FBVCxJQUFjLEtBQWQsRUFBcUI7QUFFbkIsVUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUQsQ0FBbEI7O0FBR0EsUUFBSSxJQUFJLENBQUMsRUFBTCxHQUFVLEtBQWQsRUFBcUI7QUFDbkIsTUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZO0FBQ1YsUUFBQSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFYLEVBQWtCLElBQUksQ0FBQyxFQUF2QjtBQURLLE9BQVo7QUFHRDs7QUFHRCxVQUFNLEtBQUssR0FBRztBQUNaLE1BQUEsRUFBRSxFQUFFLElBQUksQ0FBQztBQURHLEtBQWQ7QUFHQSxVQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBRCxFQUFPLElBQUksQ0FBQyxFQUFMLEdBQVUsQ0FBakIsRUFBb0IsSUFBSSxDQUFDLEdBQXpCLEVBQThCLElBQUksQ0FBQyxRQUFuQyxDQUFyQjs7QUFDQSxRQUFJLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBbEIsRUFBcUI7QUFDbkIsTUFBQSxLQUFLLENBQUMsUUFBTixHQUFpQixJQUFqQjtBQUNELEtBRkQsTUFFTztBQUNMLE1BQUEsS0FBSyxDQUFDLEdBQU4sR0FBWSxJQUFJLENBQUMsR0FBakI7QUFDRDs7QUFDRCxJQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBWjtBQUNBLElBQUEsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBbkI7QUFDRDs7QUFHRCxNQUFJLEtBQUssR0FBRyxHQUFaLEVBQWlCO0FBQ2YsSUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZO0FBQ1YsTUFBQSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFYLEVBQWtCLEdBQWxCO0FBREssS0FBWjtBQUdEOztBQUVELFNBQU8sTUFBUDtBQUNEOztBQUlELFNBQVMsUUFBVCxDQUFrQixRQUFsQixFQUE0QixRQUE1QixFQUFzQyxNQUF0QyxFQUE4QyxJQUE5QyxFQUFvRDtBQUNsRCxRQUFNLE1BQU0sR0FBRyxFQUFmO0FBQ0EsTUFBSSxLQUFLLEdBQUcsQ0FBWjtBQUNBLE1BQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFULENBQWUsQ0FBZixDQUFYOztBQUVBLFNBQU8sSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFyQixFQUF3QjtBQU10QixVQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBZDs7QUFDQSxRQUFJLEtBQUssSUFBSSxJQUFiLEVBQW1CO0FBQ2pCO0FBQ0Q7O0FBSUQsUUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLE9BQUQsQ0FBTCxHQUFpQixLQUFLLENBQUMsQ0FBRCxDQUFMLENBQVMsV0FBVCxDQUFxQixLQUFLLENBQUMsQ0FBRCxDQUExQixDQUFwQztBQUVBLElBQUEsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsWUFBWSxHQUFHLENBQTFCLENBQVA7QUFFQSxJQUFBLFlBQVksSUFBSSxLQUFoQjtBQUVBLElBQUEsS0FBSyxHQUFHLFlBQVksR0FBRyxDQUF2QjtBQUdBLFVBQU0sR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBSCxHQUF1QixJQUF6Qzs7QUFDQSxRQUFJLEdBQUcsSUFBSSxJQUFYLEVBQWlCO0FBQ2Y7QUFDRDs7QUFDRCxRQUFJLFVBQVUsR0FBRyxHQUFHLENBQUMsT0FBRCxDQUFILEdBQWUsR0FBRyxDQUFDLENBQUQsQ0FBSCxDQUFPLE9BQVAsQ0FBZSxHQUFHLENBQUMsQ0FBRCxDQUFsQixDQUFoQztBQUVBLElBQUEsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsVUFBVSxHQUFHLENBQXhCLENBQVA7QUFFQSxJQUFBLFVBQVUsSUFBSSxLQUFkO0FBRUEsSUFBQSxLQUFLLEdBQUcsVUFBVSxHQUFHLENBQXJCO0FBRUEsSUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZO0FBQ1YsTUFBQSxHQUFHLEVBQUUsUUFBUSxDQUFDLEtBQVQsQ0FBZSxZQUFZLEdBQUcsQ0FBOUIsRUFBaUMsVUFBakMsQ0FESztBQUVWLE1BQUEsUUFBUSxFQUFFLEVBRkE7QUFHVixNQUFBLEVBQUUsRUFBRSxZQUhNO0FBSVYsTUFBQSxHQUFHLEVBQUUsVUFKSztBQUtWLE1BQUEsRUFBRSxFQUFFO0FBTE0sS0FBWjtBQU9EOztBQUVELFNBQU8sTUFBUDtBQUNEOztBQUlELFNBQVMsVUFBVCxDQUFvQixLQUFwQixFQUEyQjtBQUN6QixNQUFJLEtBQUssQ0FBQyxNQUFOLElBQWdCLENBQXBCLEVBQXVCO0FBQ3JCLFdBQU8sRUFBUDtBQUNEOztBQUVELFFBQU0sSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUQsQ0FBTixDQUFiO0FBQ0EsTUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUQsQ0FBaEI7O0FBQ0EsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBMUIsRUFBa0MsQ0FBQyxFQUFuQyxFQUF1QztBQUdyQyxRQUFJLEtBQUssQ0FBQyxDQUFELENBQUwsQ0FBUyxFQUFULEdBQWMsSUFBSSxDQUFDLEdBQXZCLEVBQTRCO0FBRTFCLE1BQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsQ0FBRCxDQUFmO0FBQ0EsTUFBQSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUQsQ0FBWjtBQUNELEtBSkQsTUFJTyxJQUFJLEtBQUssQ0FBQyxDQUFELENBQUwsQ0FBUyxHQUFULElBQWdCLElBQUksQ0FBQyxHQUF6QixFQUE4QjtBQUVuQyxNQUFBLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBZCxDQUFtQixLQUFLLENBQUMsQ0FBRCxDQUF4QjtBQUNEO0FBRUY7O0FBR0QsT0FBSyxJQUFJLENBQVQsSUFBYyxJQUFkLEVBQW9CO0FBQ2xCLElBQUEsSUFBSSxDQUFDLENBQUQsQ0FBSixDQUFRLFFBQVIsR0FBbUIsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFELENBQUosQ0FBUSxRQUFULENBQTdCO0FBQ0Q7O0FBRUQsU0FBTyxJQUFQO0FBQ0Q7O0FBR0QsU0FBUyxZQUFULENBQXNCLEdBQXRCLEVBQTJCO0FBQ3pCLE1BQUksQ0FBQyxHQUFMLEVBQVU7QUFDUixXQUFPLElBQVA7QUFDRDs7QUFFRCxFQUFBLEdBQUcsR0FBSSxPQUFPLEdBQVAsSUFBYyxRQUFmLEdBQTJCO0FBQy9CLElBQUEsR0FBRyxFQUFFO0FBRDBCLEdBQTNCLEdBRUYsR0FGSjtBQUdBLE1BQUk7QUFDRixJQUFBLEdBREU7QUFFRixJQUFBLEdBRkU7QUFHRixJQUFBO0FBSEUsTUFJQSxHQUpKO0FBTUEsRUFBQSxHQUFHLEdBQUcsR0FBRyxJQUFJLEVBQWI7O0FBQ0EsTUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxDQUFMLEVBQXlCO0FBQ3ZCLElBQUEsR0FBRyxHQUFHLEVBQU47QUFDRDs7QUFFRCxNQUFJLENBQUMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLENBQUQsSUFBdUIsR0FBRyxDQUFDLE1BQUosSUFBYyxDQUF6QyxFQUE0QztBQUMxQyxRQUFJLEdBQUcsQ0FBQyxNQUFKLElBQWMsQ0FBbEIsRUFBcUI7QUFDbkIsYUFBTztBQUNMLFFBQUEsSUFBSSxFQUFFO0FBREQsT0FBUDtBQUdEOztBQUdELElBQUEsR0FBRyxHQUFHLENBQUM7QUFDTCxNQUFBLEVBQUUsRUFBRSxDQURDO0FBRUwsTUFBQSxHQUFHLEVBQUUsQ0FGQTtBQUdMLE1BQUEsR0FBRyxFQUFFO0FBSEEsS0FBRCxDQUFOO0FBS0Q7O0FBR0QsUUFBTSxLQUFLLEdBQUcsRUFBZDtBQUNBLFFBQU0sV0FBVyxHQUFHLEVBQXBCO0FBQ0EsRUFBQSxHQUFHLENBQUMsT0FBSixDQUFhLElBQUQsSUFBVTtBQUNwQixRQUFJLENBQUMsSUFBRCxJQUFTLE9BQU8sSUFBUCxJQUFlLFFBQTVCLEVBQXNDO0FBQ3BDO0FBQ0Q7O0FBRUQsUUFBSSxDQUFDLENBQUMsV0FBRCxFQUFjLFFBQWQsRUFBd0IsUUFBeEIsQ0FBaUMsT0FBTyxJQUFJLENBQUMsRUFBN0MsQ0FBTCxFQUF1RDtBQUVyRDtBQUNEOztBQUNELFFBQUksQ0FBQyxDQUFDLFdBQUQsRUFBYyxRQUFkLEVBQXdCLFFBQXhCLENBQWlDLE9BQU8sSUFBSSxDQUFDLEdBQTdDLENBQUwsRUFBd0Q7QUFFdEQ7QUFDRDs7QUFDRCxRQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBTCxHQUFVLENBQW5CO0FBQ0EsUUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUwsR0FBVyxDQUFyQjs7QUFDQSxRQUFJLEdBQUcsR0FBRyxDQUFWLEVBQWE7QUFFWDtBQUNEOztBQUVELFFBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFMLElBQVksQ0FBdEI7O0FBQ0EsUUFBSSxHQUFHLENBQUMsTUFBSixHQUFhLENBQWIsS0FBbUIsT0FBTyxHQUFQLElBQWMsUUFBZCxJQUEwQixHQUFHLEdBQUcsQ0FBaEMsSUFBcUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFuRSxDQUFKLEVBQWdGO0FBRTlFO0FBQ0Q7O0FBRUQsUUFBSSxFQUFFLElBQUksQ0FBQyxDQUFYLEVBQWM7QUFFWixNQUFBLFdBQVcsQ0FBQyxJQUFaLENBQWlCO0FBQ2YsUUFBQSxLQUFLLEVBQUUsQ0FBQyxDQURPO0FBRWYsUUFBQSxHQUFHLEVBQUUsQ0FGVTtBQUdmLFFBQUEsR0FBRyxFQUFFO0FBSFUsT0FBakI7QUFLQTtBQUNELEtBUkQsTUFRTyxJQUFJLEVBQUUsR0FBRyxHQUFMLEdBQVcsR0FBRyxDQUFDLE1BQW5CLEVBQTJCO0FBRWhDO0FBQ0Q7O0FBRUQsUUFBSSxDQUFDLElBQUksQ0FBQyxFQUFWLEVBQWM7QUFDWixVQUFJLEdBQUcsQ0FBQyxNQUFKLEdBQWEsQ0FBYixJQUFtQixPQUFPLEdBQUcsQ0FBQyxHQUFELENBQVYsSUFBbUIsUUFBMUMsRUFBcUQ7QUFDbkQsUUFBQSxLQUFLLENBQUMsSUFBTixDQUFXO0FBQ1QsVUFBQSxLQUFLLEVBQUUsRUFERTtBQUVULFVBQUEsR0FBRyxFQUFFLEVBQUUsR0FBRyxHQUZEO0FBR1QsVUFBQSxHQUFHLEVBQUU7QUFISSxTQUFYO0FBS0Q7QUFDRixLQVJELE1BUU87QUFDTCxNQUFBLEtBQUssQ0FBQyxJQUFOLENBQVc7QUFDVCxRQUFBLElBQUksRUFBRSxJQUFJLENBQUMsRUFERjtBQUVULFFBQUEsS0FBSyxFQUFFLEVBRkU7QUFHVCxRQUFBLEdBQUcsRUFBRSxFQUFFLEdBQUc7QUFIRCxPQUFYO0FBS0Q7QUFDRixHQXRERDtBQXlEQSxFQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBQyxDQUFELEVBQUksQ0FBSixLQUFVO0FBQ25CLFFBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFGLEdBQVUsQ0FBQyxDQUFDLEtBQXZCOztBQUNBLFFBQUksSUFBSSxJQUFJLENBQVosRUFBZTtBQUNiLGFBQU8sSUFBUDtBQUNEOztBQUNELElBQUEsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFGLEdBQVEsQ0FBQyxDQUFDLEdBQWpCOztBQUNBLFFBQUksSUFBSSxJQUFJLENBQVosRUFBZTtBQUNiLGFBQU8sSUFBUDtBQUNEOztBQUNELFdBQU8sVUFBVSxDQUFDLE9BQVgsQ0FBbUIsQ0FBQyxDQUFDLElBQXJCLElBQTZCLFVBQVUsQ0FBQyxPQUFYLENBQW1CLENBQUMsQ0FBQyxJQUFyQixDQUFwQztBQUNELEdBVkQ7O0FBYUEsTUFBSSxXQUFXLENBQUMsTUFBWixHQUFxQixDQUF6QixFQUE0QjtBQUMxQixJQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBRyxXQUFkO0FBQ0Q7O0FBRUQsRUFBQSxLQUFLLENBQUMsT0FBTixDQUFlLElBQUQsSUFBVTtBQUN0QixRQUFJLEdBQUcsQ0FBQyxNQUFKLEdBQWEsQ0FBYixJQUFrQixDQUFDLElBQUksQ0FBQyxJQUF4QixJQUFnQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQU4sQ0FBbkMsSUFBaUQsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQU4sQ0FBVixJQUF3QixRQUE3RSxFQUF1RjtBQUNyRixNQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFOLENBQUgsQ0FBYyxFQUExQjtBQUNBLE1BQUEsSUFBSSxDQUFDLElBQUwsR0FBWSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQU4sQ0FBSCxDQUFjLElBQTFCO0FBQ0Q7O0FBR0QsUUFBSSxDQUFDLElBQUksQ0FBQyxJQUFWLEVBQWdCO0FBQ2QsTUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQVo7QUFDRDtBQUNGLEdBVkQ7QUFZQSxNQUFJLElBQUksR0FBRyxXQUFXLENBQUMsRUFBRCxFQUFLLEdBQUwsRUFBVSxDQUFWLEVBQWEsR0FBRyxDQUFDLE1BQWpCLEVBQXlCLEtBQXpCLENBQXRCOztBQUdBLFFBQU0sT0FBTyxHQUFHLFVBQVMsSUFBVCxFQUFlO0FBQzdCLFFBQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFJLENBQUMsUUFBbkIsS0FBZ0MsSUFBSSxDQUFDLFFBQUwsQ0FBYyxNQUFkLElBQXdCLENBQTVELEVBQStEO0FBRTdELFlBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFMLENBQWMsQ0FBZCxDQUFkOztBQUNBLFVBQUksQ0FBQyxJQUFJLENBQUMsSUFBVixFQUFnQjtBQUNkLGNBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFwQjtBQUNBLFFBQUEsSUFBSSxHQUFHLEtBQVA7QUFDQSxRQUFBLElBQUksQ0FBQyxNQUFMLEdBQWMsTUFBZDtBQUNELE9BSkQsTUFJTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQVAsSUFBZSxDQUFDLEtBQUssQ0FBQyxRQUExQixFQUFvQztBQUN6QyxRQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksS0FBSyxDQUFDLElBQWxCO0FBQ0EsZUFBTyxJQUFJLENBQUMsUUFBWjtBQUNEO0FBQ0Y7O0FBQ0QsV0FBTyxJQUFQO0FBQ0QsR0FkRDs7QUFlQSxFQUFBLElBQUksR0FBRyxXQUFXLENBQUMsSUFBRCxFQUFPLE9BQVAsQ0FBbEI7QUFFQSxTQUFPLElBQVA7QUFDRDs7QUFHRCxTQUFTLE9BQVQsQ0FBaUIsTUFBakIsRUFBeUIsQ0FBekIsRUFBNEI7QUFDMUIsTUFBSSxDQUFDLENBQUwsRUFBUTtBQUNOLFdBQU8sTUFBUDtBQUNEOztBQUVELE1BQUksQ0FBQyxNQUFNLENBQUMsUUFBWixFQUFzQjtBQUNwQixJQUFBLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLEVBQWxCO0FBQ0Q7O0FBR0QsTUFBSSxNQUFNLENBQUMsSUFBWCxFQUFpQjtBQUNmLElBQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsSUFBaEIsQ0FBcUI7QUFDbkIsTUFBQSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBRE07QUFFbkIsTUFBQSxNQUFNLEVBQUU7QUFGVyxLQUFyQjtBQUlBLFdBQU8sTUFBTSxDQUFDLElBQWQ7QUFDRDs7QUFFRCxFQUFBLENBQUMsQ0FBQyxNQUFGLEdBQVcsTUFBWDtBQUNBLEVBQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBckI7QUFFQSxTQUFPLE1BQVA7QUFDRDs7QUFHRCxTQUFTLFdBQVQsQ0FBcUIsTUFBckIsRUFBNkIsSUFBN0IsRUFBbUMsS0FBbkMsRUFBMEMsR0FBMUMsRUFBK0MsS0FBL0MsRUFBc0Q7QUFDcEQsTUFBSSxDQUFDLEtBQUQsSUFBVSxLQUFLLENBQUMsTUFBTixJQUFnQixDQUE5QixFQUFpQztBQUMvQixRQUFJLEtBQUssR0FBRyxHQUFaLEVBQWlCO0FBQ2YsTUFBQSxPQUFPLENBQUMsTUFBRCxFQUFTO0FBQ2QsUUFBQSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQUwsQ0FBZSxLQUFmLEVBQXNCLEdBQXRCO0FBRFEsT0FBVCxDQUFQO0FBR0Q7O0FBQ0QsV0FBTyxNQUFQO0FBQ0Q7O0FBR0QsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBMUIsRUFBa0MsQ0FBQyxFQUFuQyxFQUF1QztBQUNyQyxVQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBRCxDQUFsQjs7QUFDQSxRQUFJLElBQUksQ0FBQyxLQUFMLEdBQWEsQ0FBYixJQUFrQixJQUFJLENBQUMsSUFBTCxJQUFhLElBQW5DLEVBQXlDO0FBQ3ZDLE1BQUEsT0FBTyxDQUFDLE1BQUQsRUFBUztBQUNkLFFBQUEsSUFBSSxFQUFFLElBQUksQ0FBQyxJQURHO0FBRWQsUUFBQSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBRkc7QUFHZCxRQUFBLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FISTtBQUlkLFFBQUEsR0FBRyxFQUFFO0FBSlMsT0FBVCxDQUFQO0FBTUE7QUFDRDs7QUFHRCxRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBakIsRUFBd0I7QUFDdEIsTUFBQSxPQUFPLENBQUMsTUFBRCxFQUFTO0FBQ2QsUUFBQSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQUwsQ0FBZSxLQUFmLEVBQXNCLElBQUksQ0FBQyxLQUEzQjtBQURRLE9BQVQsQ0FBUDtBQUdBLE1BQUEsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFiO0FBQ0Q7O0FBR0QsVUFBTSxRQUFRLEdBQUcsRUFBakI7O0FBQ0EsV0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUExQixFQUE2QjtBQUMzQixZQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUwsQ0FBbkI7O0FBQ0EsVUFBSSxLQUFLLENBQUMsS0FBTixHQUFjLENBQWxCLEVBQXFCO0FBRW5CO0FBQ0QsT0FIRCxNQUdPLElBQUksS0FBSyxDQUFDLEtBQU4sR0FBYyxJQUFJLENBQUMsR0FBdkIsRUFBNEI7QUFDakMsWUFBSSxLQUFLLENBQUMsR0FBTixJQUFhLElBQUksQ0FBQyxHQUF0QixFQUEyQjtBQUN6QixnQkFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFQLENBQVQsSUFBdUIsRUFBbkM7O0FBQ0EsY0FBSSxLQUFLLENBQUMsS0FBTixHQUFjLEtBQUssQ0FBQyxHQUFwQixJQUEyQixHQUFHLENBQUMsTUFBbkMsRUFBMkM7QUFHekMsWUFBQSxRQUFRLENBQUMsSUFBVCxDQUFjLEtBQWQ7QUFDRDtBQUNGOztBQUNELFFBQUEsQ0FBQztBQUVGLE9BWE0sTUFXQTtBQUVMO0FBQ0Q7QUFDRjs7QUFFRCxJQUFBLE9BQU8sQ0FBQyxNQUFELEVBQVMsV0FBVyxDQUFDO0FBQzFCLE1BQUEsSUFBSSxFQUFFLElBQUksQ0FBQyxJQURlO0FBRTFCLE1BQUEsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUZlO0FBRzFCLE1BQUEsR0FBRyxFQUFFLElBQUksQ0FBQztBQUhnQixLQUFELEVBSXhCLElBSndCLEVBSWxCLEtBSmtCLEVBSVgsSUFBSSxDQUFDLEdBSk0sRUFJRCxRQUpDLENBQXBCLENBQVA7QUFLQSxJQUFBLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBYjtBQUNEOztBQUdELE1BQUksS0FBSyxHQUFHLEdBQVosRUFBaUI7QUFDZixJQUFBLE9BQU8sQ0FBQyxNQUFELEVBQVM7QUFDZCxNQUFBLElBQUksRUFBRSxJQUFJLENBQUMsU0FBTCxDQUFlLEtBQWYsRUFBc0IsR0FBdEI7QUFEUSxLQUFULENBQVA7QUFHRDs7QUFFRCxTQUFPLE1BQVA7QUFDRDs7QUFHRCxTQUFTLFlBQVQsQ0FBc0IsR0FBdEIsRUFBMkIsSUFBM0IsRUFBaUMsTUFBakMsRUFBeUM7QUFDdkMsTUFBSSxDQUFDLElBQUwsRUFBVztBQUNULFdBQU8sR0FBUDtBQUNEOztBQUVELEVBQUEsR0FBRyxDQUFDLEdBQUosR0FBVSxHQUFHLENBQUMsR0FBSixJQUFXLEVBQXJCO0FBR0EsUUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUosQ0FBUSxNQUF0Qjs7QUFFQSxNQUFJLElBQUksQ0FBQyxJQUFULEVBQWU7QUFDYixJQUFBLEdBQUcsQ0FBQyxHQUFKLElBQVcsSUFBSSxDQUFDLElBQWhCO0FBQ0QsR0FGRCxNQUVPLElBQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFJLENBQUMsUUFBbkIsQ0FBSixFQUFrQztBQUN2QyxJQUFBLElBQUksQ0FBQyxRQUFMLENBQWMsT0FBZCxDQUF1QixDQUFELElBQU87QUFDM0IsTUFBQSxZQUFZLENBQUMsR0FBRCxFQUFNLENBQU4sRUFBUyxNQUFULENBQVo7QUFDRCxLQUZEO0FBR0Q7O0FBRUQsTUFBSSxJQUFJLENBQUMsSUFBVCxFQUFlO0FBQ2IsVUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUosQ0FBUSxNQUFSLEdBQWlCLEtBQTdCO0FBQ0EsSUFBQSxHQUFHLENBQUMsR0FBSixHQUFVLEdBQUcsQ0FBQyxHQUFKLElBQVcsRUFBckI7O0FBQ0EsUUFBSSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUksQ0FBQyxJQUFMLElBQWEsRUFBekIsRUFBNkIsTUFBN0IsR0FBc0MsQ0FBMUMsRUFBNkM7QUFDM0MsTUFBQSxHQUFHLENBQUMsR0FBSixHQUFVLEdBQUcsQ0FBQyxHQUFKLElBQVcsRUFBckI7QUFDQSxZQUFNLE1BQU0sR0FBSSxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBTixDQUFiLElBQTJCLFdBQTVCLEdBQTJDLEdBQUcsQ0FBQyxHQUFKLENBQVEsTUFBbkQsR0FBNEQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFOLENBQWpGO0FBQ0EsTUFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQU4sQ0FBTixHQUFtQixNQUFuQjtBQUNBLE1BQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxNQUFSLElBQWtCO0FBQ2hCLFFBQUEsRUFBRSxFQUFFLElBQUksQ0FBQyxJQURPO0FBRWhCLFFBQUEsSUFBSSxFQUFFLElBQUksQ0FBQztBQUZLLE9BQWxCOztBQUlBLFVBQUksSUFBSSxDQUFDLEdBQVQsRUFBYztBQUVaLFFBQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLENBQWE7QUFDWCxVQUFBLEVBQUUsRUFBRSxDQUFDLENBRE07QUFFWCxVQUFBLEdBQUcsRUFBRSxDQUZNO0FBR1gsVUFBQSxHQUFHLEVBQUU7QUFITSxTQUFiO0FBS0QsT0FQRCxNQU9PO0FBQ0wsUUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsQ0FBYTtBQUNYLFVBQUEsRUFBRSxFQUFFLEtBRE87QUFFWCxVQUFBLEdBQUcsRUFBRSxHQUZNO0FBR1gsVUFBQSxHQUFHLEVBQUU7QUFITSxTQUFiO0FBS0Q7QUFDRixLQXRCRCxNQXNCTztBQUNMLE1BQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLENBQWE7QUFDWCxRQUFBLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFERTtBQUVYLFFBQUEsRUFBRSxFQUFFLEtBRk87QUFHWCxRQUFBLEdBQUcsRUFBRTtBQUhNLE9BQWI7QUFLRDtBQUNGOztBQUNELFNBQU8sR0FBUDtBQUNEOztBQUdELFNBQVMsV0FBVCxDQUFxQixHQUFyQixFQUEwQixXQUExQixFQUF1QyxPQUF2QyxFQUFnRDtBQUM5QyxNQUFJLENBQUMsR0FBTCxFQUFVO0FBQ1IsV0FBTyxJQUFQO0FBQ0Q7O0FBRUQsTUFBSSxHQUFHLEdBQUcsV0FBVyxDQUFDLElBQVosQ0FBaUIsT0FBakIsRUFBMEIsR0FBMUIsQ0FBVjs7QUFDQSxNQUFJLENBQUMsR0FBRCxJQUFRLENBQUMsR0FBRyxDQUFDLFFBQWpCLEVBQTJCO0FBQ3pCLFdBQU8sR0FBUDtBQUNEOztBQUVELFFBQU0sUUFBUSxHQUFHLEVBQWpCOztBQUNBLE9BQUssSUFBSSxDQUFULElBQWMsR0FBRyxDQUFDLFFBQWxCLEVBQTRCO0FBQzFCLFFBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxRQUFKLENBQWEsQ0FBYixDQUFSOztBQUNBLFFBQUksQ0FBSixFQUFPO0FBQ0wsTUFBQSxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUQsRUFBSSxXQUFKLEVBQWlCLE9BQWpCLENBQWY7O0FBQ0EsVUFBSSxDQUFKLEVBQU87QUFDTCxRQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsQ0FBZDtBQUNEO0FBQ0Y7QUFDRjs7QUFFRCxNQUFJLFFBQVEsQ0FBQyxNQUFULElBQW1CLENBQXZCLEVBQTBCO0FBQ3hCLElBQUEsR0FBRyxDQUFDLFFBQUosR0FBZSxJQUFmO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsSUFBQSxHQUFHLENBQUMsUUFBSixHQUFlLFFBQWY7QUFDRDs7QUFFRCxTQUFPLEdBQVA7QUFDRDs7QUFJRCxTQUFTLFlBQVQsQ0FBc0IsR0FBdEIsRUFBMkIsU0FBM0IsRUFBc0MsS0FBdEMsRUFBNkMsS0FBN0MsRUFBb0QsT0FBcEQsRUFBNkQ7QUFDM0QsTUFBSSxDQUFDLEdBQUwsRUFBVTtBQUNSLFdBQU8sSUFBUDtBQUNEOztBQUVELE1BQUksS0FBSyxJQUFJLEdBQUcsQ0FBQyxJQUFqQixFQUF1QjtBQUNyQixJQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBRyxDQUFDLElBQWY7QUFDRDs7QUFFRCxNQUFJLE1BQU0sR0FBRyxFQUFiOztBQUNBLE9BQUssSUFBSSxDQUFULElBQWMsR0FBRyxDQUFDLFFBQWxCLEVBQTRCO0FBQzFCLFVBQU0sQ0FBQyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsUUFBSixDQUFhLENBQWIsQ0FBRCxFQUFrQixTQUFsQixFQUE2QixDQUE3QixFQUFnQyxLQUFoQyxFQUF1QyxPQUF2QyxDQUF0Qjs7QUFDQSxRQUFJLENBQUosRUFBTztBQUNMLE1BQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFaO0FBQ0Q7QUFDRjs7QUFDRCxNQUFJLE1BQU0sQ0FBQyxNQUFQLElBQWlCLENBQXJCLEVBQXdCO0FBQ3RCLFFBQUksR0FBRyxDQUFDLElBQVIsRUFBYztBQUNaLE1BQUEsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUwsQ0FBVDtBQUNELEtBRkQsTUFFTztBQUNMLE1BQUEsTUFBTSxHQUFHLElBQVQ7QUFDRDtBQUNGOztBQUVELE1BQUksS0FBSyxJQUFJLEdBQUcsQ0FBQyxJQUFqQixFQUF1QjtBQUNyQixJQUFBLEtBQUssQ0FBQyxHQUFOO0FBQ0Q7O0FBRUQsU0FBTyxTQUFTLENBQUMsSUFBVixDQUFlLE9BQWYsRUFBd0IsR0FBRyxDQUFDLElBQTVCLEVBQWtDLEdBQUcsQ0FBQyxJQUF0QyxFQUE0QyxNQUE1QyxFQUFvRCxLQUFwRCxFQUEyRCxLQUEzRCxDQUFQO0FBQ0Q7O0FBR0QsU0FBUyxXQUFULENBQXFCLElBQXJCLEVBQTJCLEtBQTNCLEVBQWtDLElBQWxDLEVBQXdDO0FBQ3RDLE1BQUksQ0FBQyxJQUFMLEVBQVc7QUFDVCxXQUFPLElBQVA7QUFDRDs7QUFFRCxNQUFJLElBQUosRUFBVTtBQUNSLElBQUEsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFkO0FBQ0Q7O0FBRUQsUUFBTSxTQUFTLEdBQUcsVUFBUyxJQUFULEVBQWU7QUFDL0IsUUFBSSxLQUFLLElBQUksQ0FBQyxDQUFkLEVBQWlCO0FBRWYsYUFBTyxJQUFQO0FBQ0Q7O0FBRUQsUUFBSSxJQUFJLENBQUMsR0FBVCxFQUFjO0FBRVosYUFBTyxJQUFQO0FBQ0Q7O0FBQ0QsUUFBSSxLQUFLLElBQUksQ0FBYixFQUFnQjtBQUNkLE1BQUEsSUFBSSxDQUFDLElBQUwsR0FBWSxJQUFaO0FBQ0EsTUFBQSxLQUFLLEdBQUcsQ0FBQyxDQUFUO0FBQ0QsS0FIRCxNQUdPLElBQUksSUFBSSxDQUFDLElBQVQsRUFBZTtBQUNwQixZQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBTCxDQUFVLE1BQXRCOztBQUNBLFVBQUksR0FBRyxHQUFHLEtBQVYsRUFBaUI7QUFDZixRQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLENBQW9CLENBQXBCLEVBQXVCLEtBQXZCLElBQWdDLElBQTVDO0FBQ0EsUUFBQSxLQUFLLEdBQUcsQ0FBQyxDQUFUO0FBQ0QsT0FIRCxNQUdPO0FBQ0wsUUFBQSxLQUFLLElBQUksR0FBVDtBQUNEO0FBQ0Y7O0FBQ0QsV0FBTyxJQUFQO0FBQ0QsR0F2QkQ7O0FBeUJBLFNBQU8sV0FBVyxDQUFDLElBQUQsRUFBTyxTQUFQLENBQWxCO0FBQ0Q7O0FBR0QsU0FBUyxXQUFULENBQXFCLElBQXJCLEVBQTJCLEtBQTNCLEVBQWtDO0FBQ2hDLFFBQU0sU0FBUyxHQUFJLElBQUQsSUFBVTtBQUMxQixVQUFNLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQU4sRUFBWSxJQUFaLEVBQWtCLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBRCxDQUFSLEdBQWlCLElBQXhDLENBQXhCOztBQUNBLFFBQUksSUFBSixFQUFVO0FBQ1IsTUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQVo7QUFDRCxLQUZELE1BRU87QUFDTCxhQUFPLElBQUksQ0FBQyxJQUFaO0FBQ0Q7O0FBQ0QsV0FBTyxJQUFQO0FBQ0QsR0FSRDs7QUFTQSxTQUFPLFdBQVcsQ0FBQyxJQUFELEVBQU8sU0FBUCxDQUFsQjtBQUNEOztBQUdELFNBQVMsS0FBVCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsTUFBSSxJQUFJLENBQUMsSUFBTCxJQUFhLElBQWpCLEVBQXVCO0FBQ3JCLElBQUEsSUFBSSxHQUFHLElBQVA7QUFDRCxHQUZELE1BRU8sSUFBSSxJQUFJLENBQUMsSUFBVCxFQUFlO0FBQ3BCLFFBQUksQ0FBQyxJQUFJLENBQUMsSUFBVixFQUFnQjtBQUNkLE1BQUEsSUFBSSxDQUFDLElBQUwsR0FBWSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBWjs7QUFDQSxVQUFJLENBQUMsSUFBSSxDQUFDLElBQVYsRUFBZ0I7QUFDZCxRQUFBLElBQUksR0FBRyxJQUFQO0FBQ0Q7QUFDRjtBQUNGLEdBUE0sTUFPQSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQU4sSUFBYyxJQUFJLENBQUMsUUFBbkIsSUFBK0IsSUFBSSxDQUFDLFFBQUwsQ0FBYyxNQUFkLEdBQXVCLENBQTFELEVBQTZEO0FBQ2xFLFVBQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBTCxDQUFjLENBQWQsQ0FBRCxDQUFmOztBQUNBLFFBQUksQ0FBSixFQUFPO0FBQ0wsTUFBQSxJQUFJLENBQUMsUUFBTCxDQUFjLENBQWQsSUFBbUIsQ0FBbkI7QUFDRCxLQUZELE1BRU87QUFDTCxNQUFBLElBQUksQ0FBQyxRQUFMLENBQWMsS0FBZDs7QUFDQSxVQUFJLENBQUMsSUFBSSxDQUFDLElBQU4sSUFBYyxJQUFJLENBQUMsUUFBTCxDQUFjLE1BQWQsSUFBd0IsQ0FBMUMsRUFBNkM7QUFDM0MsUUFBQSxJQUFJLEdBQUcsSUFBUDtBQUNEO0FBQ0Y7QUFDRjs7QUFDRCxTQUFPLElBQVA7QUFDRDs7QUFHRCxTQUFTLGdCQUFULENBQTBCLElBQTFCLEVBQWdDLEtBQWhDLEVBQXVDO0FBQ3JDLE1BQUksQ0FBQyxJQUFMLEVBQVc7QUFDVCxXQUFPLElBQVA7QUFDRDs7QUFFRCxNQUFJLElBQUksQ0FBQyxHQUFULEVBQWM7QUFDWixJQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksR0FBWjtBQUNBLFdBQU8sSUFBSSxDQUFDLEdBQVo7QUFDQSxXQUFPLElBQUksQ0FBQyxRQUFaO0FBQ0QsR0FKRCxNQUlPLElBQUksSUFBSSxDQUFDLFFBQVQsRUFBbUI7QUFDeEIsVUFBTSxXQUFXLEdBQUcsRUFBcEI7QUFDQSxVQUFNLFFBQVEsR0FBRyxFQUFqQjs7QUFDQSxTQUFLLElBQUksQ0FBVCxJQUFjLElBQUksQ0FBQyxRQUFuQixFQUE2QjtBQUMzQixZQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBTCxDQUFjLENBQWQsQ0FBVjs7QUFDQSxVQUFJLENBQUMsQ0FBQyxHQUFOLEVBQVc7QUFDVCxZQUFJLFdBQVcsQ0FBQyxNQUFaLElBQXNCLEtBQTFCLEVBQWlDO0FBRS9CO0FBQ0Q7O0FBQ0QsWUFBSSxDQUFDLENBQUMsSUFBRixDQUFPLE1BQVAsS0FBa0IsY0FBdEIsRUFBc0M7QUFFcEM7QUFDRDs7QUFFRCxlQUFPLENBQUMsQ0FBQyxHQUFUO0FBQ0EsZUFBTyxDQUFDLENBQUMsUUFBVDtBQUNBLFFBQUEsQ0FBQyxDQUFDLElBQUYsR0FBUyxHQUFUO0FBQ0EsUUFBQSxXQUFXLENBQUMsSUFBWixDQUFpQixDQUFqQjtBQUNELE9BZEQsTUFjTztBQUNMLFFBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxDQUFkO0FBQ0Q7QUFDRjs7QUFDRCxJQUFBLElBQUksQ0FBQyxRQUFMLEdBQWdCLFFBQVEsQ0FBQyxNQUFULENBQWdCLFdBQWhCLENBQWhCO0FBQ0Q7O0FBQ0QsU0FBTyxJQUFQO0FBQ0Q7O0FBR0QsU0FBUyxlQUFULENBQXlCLElBQXpCLEVBQStCO0FBQzdCLE1BQUksS0FBSjtBQUNBLE1BQUksU0FBUyxHQUFHLEVBQWhCO0FBQ0EsRUFBQSxZQUFZLENBQUMsT0FBYixDQUFzQixNQUFELElBQVk7QUFDL0IsV0FBTyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsRUFBUCxDQUFVLElBQVYsQ0FBZSxJQUFmLENBQVQsTUFBbUMsSUFBMUMsRUFBZ0Q7QUFDOUMsTUFBQSxTQUFTLENBQUMsSUFBVixDQUFlO0FBQ2IsUUFBQSxNQUFNLEVBQUUsS0FBSyxDQUFDLE9BQUQsQ0FEQTtBQUViLFFBQUEsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFELENBQUwsQ0FBUyxNQUZEO0FBR2IsUUFBQSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUQsQ0FIQTtBQUliLFFBQUEsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBSyxDQUFDLENBQUQsQ0FBakIsQ0FKTztBQUtiLFFBQUEsSUFBSSxFQUFFLE1BQU0sQ0FBQztBQUxBLE9BQWY7QUFPRDtBQUNGLEdBVkQ7O0FBWUEsTUFBSSxTQUFTLENBQUMsTUFBVixJQUFvQixDQUF4QixFQUEyQjtBQUN6QixXQUFPLFNBQVA7QUFDRDs7QUFHRCxFQUFBLFNBQVMsQ0FBQyxJQUFWLENBQWUsQ0FBQyxDQUFELEVBQUksQ0FBSixLQUFVO0FBQ3ZCLFdBQU8sQ0FBQyxDQUFDLE1BQUYsR0FBVyxDQUFDLENBQUMsTUFBcEI7QUFDRCxHQUZEO0FBSUEsTUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFYO0FBQ0EsRUFBQSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQVYsQ0FBa0IsRUFBRCxJQUFRO0FBQ25DLFVBQU0sTUFBTSxHQUFJLEVBQUUsQ0FBQyxNQUFILEdBQVksR0FBNUI7QUFDQSxJQUFBLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBSCxHQUFZLEVBQUUsQ0FBQyxHQUFyQjtBQUNBLFdBQU8sTUFBUDtBQUNELEdBSlcsQ0FBWjtBQU1BLFNBQU8sU0FBUDtBQUNEOztBQUdELFNBQVMsUUFBVCxDQUFrQixNQUFsQixFQUEwQixPQUExQixFQUFtQztBQUNqQyxNQUFJLEtBQUssR0FBRyxFQUFaO0FBQ0EsTUFBSSxNQUFNLEdBQUcsRUFBYjs7QUFDQSxPQUFLLElBQUksQ0FBVCxJQUFjLE1BQWQsRUFBc0I7QUFDcEIsVUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUQsQ0FBcEI7O0FBQ0EsUUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFYLEVBQWdCO0FBQ2QsWUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFQLEVBQWlCLEtBQUssQ0FBQyxNQUFOLEdBQWUsT0FBaEMsQ0FBdkI7QUFDQSxNQUFBLEtBQUssQ0FBQyxHQUFOLEdBQVksTUFBTSxDQUFDLEdBQW5CO0FBQ0EsTUFBQSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQVAsQ0FBYyxNQUFNLENBQUMsR0FBckIsQ0FBVDtBQUNEOztBQUVELFFBQUksS0FBSyxDQUFDLEVBQVYsRUFBYztBQUNaLE1BQUEsTUFBTSxDQUFDLElBQVAsQ0FBWTtBQUNWLFFBQUEsRUFBRSxFQUFFLEtBQUssQ0FBQyxNQUFOLEdBQWUsT0FEVDtBQUVWLFFBQUEsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFGTDtBQUdWLFFBQUEsRUFBRSxFQUFFLEtBQUssQ0FBQztBQUhBLE9BQVo7QUFLRDs7QUFFRCxJQUFBLEtBQUssSUFBSSxLQUFLLENBQUMsR0FBZjtBQUNEOztBQUNELFNBQU87QUFDTCxJQUFBLEdBQUcsRUFBRSxLQURBO0FBRUwsSUFBQSxHQUFHLEVBQUU7QUFGQSxHQUFQO0FBSUQ7O0FBSUQsU0FBUyxXQUFULENBQXFCLElBQXJCLEVBQTJCLEtBQTNCLEVBQWtDLEtBQWxDLEVBQXlDO0FBQ3ZDLE1BQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxPQUFQLENBQWUsSUFBZixFQUFxQixNQUFyQixHQUE4QixDQUExQyxFQUE2QztBQUMzQyxJQUFBLEtBQUssR0FBRyxLQUFLLElBQUksRUFBakI7QUFDQSxVQUFNLEVBQUUsR0FBRyxFQUFYO0FBQ0EsSUFBQSxrQkFBa0IsQ0FBQyxPQUFuQixDQUE0QixHQUFELElBQVM7QUFDbEMsVUFBSSxJQUFJLENBQUMsR0FBRCxDQUFSLEVBQWU7QUFDYixZQUFJLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFOLENBQWUsR0FBZixDQUFWLEtBQ0QsT0FBTyxJQUFJLENBQUMsR0FBRCxDQUFYLElBQW9CLFFBQXBCLElBQWdDLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBSSxDQUFDLEdBQUQsQ0FBbEIsQ0FEL0IsS0FFRixJQUFJLENBQUMsR0FBRCxDQUFKLENBQVUsTUFBVixHQUFtQixxQkFGckIsRUFFNEM7QUFDMUM7QUFDRDs7QUFDRCxZQUFJLE9BQU8sSUFBSSxDQUFDLEdBQUQsQ0FBWCxJQUFvQixRQUF4QixFQUFrQztBQUNoQztBQUNEOztBQUNELFFBQUEsRUFBRSxDQUFDLEdBQUQsQ0FBRixHQUFVLElBQUksQ0FBQyxHQUFELENBQWQ7QUFDRDtBQUNGLEtBWkQ7O0FBY0EsUUFBSSxNQUFNLENBQUMsT0FBUCxDQUFlLEVBQWYsRUFBbUIsTUFBbkIsSUFBNkIsQ0FBakMsRUFBb0M7QUFDbEMsYUFBTyxFQUFQO0FBQ0Q7QUFDRjs7QUFDRCxTQUFPLElBQVA7QUFDRDs7QUFFRCxJQUFJLE9BQU8sTUFBUCxJQUFpQixXQUFyQixFQUFrQztBQUNoQyxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLE1BQWpCO0FBQ0Q7OztBQ2x4RUQ7Ozs7Ozs7QUFFQTs7QUFJQSxJQUFJLFdBQUo7O0FBVWUsTUFBTSxlQUFOLENBQXNCO0FBQ25DLEVBQUEsV0FBVyxDQUFDLE1BQUQsRUFBUyxPQUFULEVBQWtCO0FBQzNCLFNBQUssT0FBTCxHQUFlLE1BQWY7QUFDQSxTQUFLLFFBQUwsR0FBZ0IsT0FBaEI7QUFFQSxTQUFLLE9BQUwsR0FBZSxNQUFNLENBQUMsT0FBdEI7QUFDQSxTQUFLLFVBQUwsR0FBa0IsTUFBTSxDQUFDLFlBQVAsRUFBbEI7QUFDQSxTQUFLLE1BQUwsR0FBYyxNQUFNLENBQUMsZUFBUCxFQUFkO0FBQ0EsU0FBSyxHQUFMLEdBQVcsSUFBSSxXQUFKLEVBQVg7QUFHQSxTQUFLLFNBQUwsR0FBaUIsSUFBakI7QUFDQSxTQUFLLFFBQUwsR0FBZ0IsSUFBaEI7QUFHQSxTQUFLLFVBQUwsR0FBa0IsSUFBbEI7QUFDQSxTQUFLLFNBQUwsR0FBaUIsSUFBakI7QUFDQSxTQUFLLFNBQUwsR0FBaUIsSUFBakI7QUFDRDs7QUFnQkQsRUFBQSxpQkFBaUIsQ0FBQyxPQUFELEVBQVUsSUFBVixFQUFnQixTQUFoQixFQUEyQixVQUEzQixFQUF1QyxTQUF2QyxFQUFrRCxTQUFsRCxFQUE2RDtBQUM1RSxRQUFJLENBQUMsS0FBSyxVQUFWLEVBQXNCO0FBQ3BCLFlBQU0sSUFBSSxLQUFKLENBQVUseUJBQVYsQ0FBTjtBQUNEOztBQUNELFVBQU0sUUFBUSxHQUFHLElBQWpCO0FBRUEsUUFBSSxHQUFHLGVBQVEsS0FBSyxRQUFiLGFBQVA7O0FBQ0EsUUFBSSxPQUFKLEVBQWE7QUFDWCxVQUFJLElBQUksR0FBRyxPQUFYOztBQUNBLFVBQUksSUFBSSxDQUFDLFFBQUwsQ0FBYyxHQUFkLENBQUosRUFBd0I7QUFFdEIsUUFBQSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFYLEVBQWMsQ0FBQyxDQUFmLENBQVA7QUFDRDs7QUFDRCxVQUFJLElBQUksQ0FBQyxVQUFMLENBQWdCLFNBQWhCLEtBQThCLElBQUksQ0FBQyxVQUFMLENBQWdCLFVBQWhCLENBQWxDLEVBQStEO0FBQzdELFFBQUEsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFiO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsY0FBTSxJQUFJLEtBQUosNkJBQStCLE9BQS9CLE9BQU47QUFDRDtBQUNGOztBQUNELFNBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxNQUFkLEVBQXNCLEdBQXRCLEVBQTJCLElBQTNCO0FBQ0EsU0FBSyxHQUFMLENBQVMsZ0JBQVQsQ0FBMEIsaUJBQTFCLEVBQTZDLEtBQUssT0FBbEQ7QUFDQSxTQUFLLEdBQUwsQ0FBUyxnQkFBVCxDQUEwQixlQUExQixrQkFBb0QsS0FBSyxVQUFMLENBQWdCLEtBQXBFO0FBQ0EsVUFBTSxNQUFNLEdBQUcsSUFBSSxPQUFKLENBQVksQ0FBQyxPQUFELEVBQVUsTUFBVixLQUFxQjtBQUM5QyxXQUFLLFNBQUwsR0FBaUIsT0FBakI7QUFDQSxXQUFLLFFBQUwsR0FBZ0IsTUFBaEI7QUFDRCxLQUhjLENBQWY7QUFLQSxTQUFLLFVBQUwsR0FBa0IsVUFBbEI7QUFDQSxTQUFLLFNBQUwsR0FBaUIsU0FBakI7QUFDQSxTQUFLLFNBQUwsR0FBaUIsU0FBakI7O0FBRUEsU0FBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixVQUFoQixHQUE4QixDQUFELElBQU87QUFDbEMsVUFBSSxDQUFDLENBQUMsZ0JBQUYsSUFBc0IsUUFBUSxDQUFDLFVBQW5DLEVBQStDO0FBQzdDLFFBQUEsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsQ0FBQyxDQUFDLE1BQUYsR0FBVyxDQUFDLENBQUMsS0FBakM7QUFDRDtBQUNGLEtBSkQ7O0FBTUEsU0FBSyxHQUFMLENBQVMsTUFBVCxHQUFrQixZQUFXO0FBQzNCLFVBQUksR0FBSjs7QUFDQSxVQUFJO0FBQ0YsUUFBQSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFLLFFBQWhCLEVBQTBCLHNCQUExQixDQUFOO0FBQ0QsT0FGRCxDQUVFLE9BQU8sR0FBUCxFQUFZO0FBQ1osUUFBQSxRQUFRLENBQUMsT0FBVCxDQUFpQixNQUFqQixDQUF3QixtREFBeEIsRUFBNkUsS0FBSyxRQUFsRjs7QUFDQSxRQUFBLEdBQUcsR0FBRztBQUNKLFVBQUEsSUFBSSxFQUFFO0FBQ0osWUFBQSxJQUFJLEVBQUUsS0FBSyxNQURQO0FBRUosWUFBQSxJQUFJLEVBQUUsS0FBSztBQUZQO0FBREYsU0FBTjtBQU1EOztBQUVELFVBQUksS0FBSyxNQUFMLElBQWUsR0FBZixJQUFzQixLQUFLLE1BQUwsR0FBYyxHQUF4QyxFQUE2QztBQUMzQyxZQUFJLFFBQVEsQ0FBQyxTQUFiLEVBQXdCO0FBQ3RCLFVBQUEsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsR0FBRyxDQUFDLElBQUosQ0FBUyxNQUFULENBQWdCLEdBQW5DO0FBQ0Q7O0FBQ0QsWUFBSSxRQUFRLENBQUMsU0FBYixFQUF3QjtBQUN0QixVQUFBLFFBQVEsQ0FBQyxTQUFULENBQW1CLEdBQUcsQ0FBQyxJQUF2QjtBQUNEO0FBQ0YsT0FQRCxNQU9PLElBQUksS0FBSyxNQUFMLElBQWUsR0FBbkIsRUFBd0I7QUFDN0IsWUFBSSxRQUFRLENBQUMsUUFBYixFQUF1QjtBQUNyQixVQUFBLFFBQVEsQ0FBQyxRQUFULENBQWtCLElBQUksS0FBSixXQUFhLEdBQUcsQ0FBQyxJQUFKLENBQVMsSUFBdEIsZUFBK0IsR0FBRyxDQUFDLElBQUosQ0FBUyxJQUF4QyxPQUFsQjtBQUNEOztBQUNELFlBQUksUUFBUSxDQUFDLFNBQWIsRUFBd0I7QUFDdEIsVUFBQSxRQUFRLENBQUMsU0FBVCxDQUFtQixHQUFHLENBQUMsSUFBdkI7QUFDRDtBQUNGLE9BUE0sTUFPQTtBQUNMLFFBQUEsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsTUFBakIsQ0FBd0IsMENBQXhCLEVBQW9FLEtBQUssTUFBekUsRUFBaUYsS0FBSyxRQUF0RjtBQUNEO0FBQ0YsS0EvQkQ7O0FBaUNBLFNBQUssR0FBTCxDQUFTLE9BQVQsR0FBbUIsVUFBUyxDQUFULEVBQVk7QUFDN0IsVUFBSSxRQUFRLENBQUMsUUFBYixFQUF1QjtBQUNyQixRQUFBLFFBQVEsQ0FBQyxRQUFULENBQWtCLElBQUksS0FBSixDQUFVLFFBQVYsQ0FBbEI7QUFDRDs7QUFDRCxVQUFJLFFBQVEsQ0FBQyxTQUFiLEVBQXdCO0FBQ3RCLFFBQUEsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsSUFBbkI7QUFDRDtBQUNGLEtBUEQ7O0FBU0EsU0FBSyxHQUFMLENBQVMsT0FBVCxHQUFtQixVQUFTLENBQVQsRUFBWTtBQUM3QixVQUFJLFFBQVEsQ0FBQyxRQUFiLEVBQXVCO0FBQ3JCLFFBQUEsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsSUFBSSxLQUFKLENBQVUsMEJBQVYsQ0FBbEI7QUFDRDs7QUFDRCxVQUFJLFFBQVEsQ0FBQyxTQUFiLEVBQXdCO0FBQ3RCLFFBQUEsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsSUFBbkI7QUFDRDtBQUNGLEtBUEQ7O0FBU0EsUUFBSTtBQUNGLFlBQU0sSUFBSSxHQUFHLElBQUksUUFBSixFQUFiO0FBQ0EsTUFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVosRUFBb0IsSUFBcEI7QUFDQSxNQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBVCxFQUFlLEtBQUssTUFBcEI7O0FBQ0EsVUFBSSxTQUFKLEVBQWU7QUFDYixRQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxFQUFrQixTQUFsQjtBQUNEOztBQUNELFdBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxJQUFkO0FBQ0QsS0FSRCxDQVFFLE9BQU8sR0FBUCxFQUFZO0FBQ1osVUFBSSxLQUFLLFFBQVQsRUFBbUI7QUFDakIsYUFBSyxRQUFMLENBQWMsR0FBZDtBQUNEOztBQUNELFVBQUksS0FBSyxTQUFULEVBQW9CO0FBQ2xCLGFBQUssU0FBTCxDQUFlLElBQWY7QUFDRDtBQUNGOztBQUVELFdBQU8sTUFBUDtBQUNEOztBQWNELEVBQUEsTUFBTSxDQUFDLElBQUQsRUFBTyxTQUFQLEVBQWtCLFVBQWxCLEVBQThCLFNBQTlCLEVBQXlDLFNBQXpDLEVBQW9EO0FBQ3hELFVBQU0sT0FBTyxHQUFHLENBQUMsS0FBSyxPQUFMLENBQWEsT0FBYixHQUF1QixVQUF2QixHQUFvQyxTQUFyQyxJQUFrRCxLQUFLLE9BQUwsQ0FBYSxLQUEvRTtBQUNBLFdBQU8sS0FBSyxpQkFBTCxDQUF1QixPQUF2QixFQUFnQyxJQUFoQyxFQUFzQyxTQUF0QyxFQUFpRCxVQUFqRCxFQUE2RCxTQUE3RCxFQUF3RSxTQUF4RSxDQUFQO0FBQ0Q7O0FBV0QsRUFBQSxRQUFRLENBQUMsV0FBRCxFQUFjLFFBQWQsRUFBd0IsUUFBeEIsRUFBa0MsVUFBbEMsRUFBOEMsT0FBOUMsRUFBdUQ7QUFDN0QsUUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFQLENBQXFCLFdBQXJCLENBQUwsRUFBd0M7QUFFdEMsVUFBSSxPQUFKLEVBQWE7QUFDWCxRQUFBLE9BQU8sb0JBQWEsV0FBYixzQ0FBUDtBQUNEOztBQUNEO0FBQ0Q7O0FBQ0QsUUFBSSxDQUFDLEtBQUssVUFBVixFQUFzQjtBQUNwQixVQUFJLE9BQUosRUFBYTtBQUNYLFFBQUEsT0FBTyxDQUFDLHlCQUFELENBQVA7QUFDRDs7QUFDRDtBQUNEOztBQUNELFVBQU0sUUFBUSxHQUFHLElBQWpCO0FBRUEsU0FBSyxHQUFMLENBQVMsSUFBVCxDQUFjLEtBQWQsRUFBcUIsV0FBckIsRUFBa0MsSUFBbEM7QUFDQSxTQUFLLEdBQUwsQ0FBUyxnQkFBVCxDQUEwQixpQkFBMUIsRUFBNkMsS0FBSyxPQUFsRDtBQUNBLFNBQUssR0FBTCxDQUFTLGdCQUFULENBQTBCLGVBQTFCLEVBQTJDLFdBQVcsS0FBSyxVQUFMLENBQWdCLEtBQXRFO0FBQ0EsU0FBSyxHQUFMLENBQVMsWUFBVCxHQUF3QixNQUF4QjtBQUVBLFNBQUssVUFBTCxHQUFrQixVQUFsQjs7QUFDQSxTQUFLLEdBQUwsQ0FBUyxVQUFULEdBQXNCLFVBQVMsQ0FBVCxFQUFZO0FBQ2hDLFVBQUksUUFBUSxDQUFDLFVBQWIsRUFBeUI7QUFHdkIsUUFBQSxRQUFRLENBQUMsVUFBVCxDQUFvQixDQUFDLENBQUMsTUFBdEI7QUFDRDtBQUNGLEtBTkQ7O0FBUUEsVUFBTSxNQUFNLEdBQUcsSUFBSSxPQUFKLENBQVksQ0FBQyxPQUFELEVBQVUsTUFBVixLQUFxQjtBQUM5QyxXQUFLLFNBQUwsR0FBaUIsT0FBakI7QUFDQSxXQUFLLFFBQUwsR0FBZ0IsTUFBaEI7QUFDRCxLQUhjLENBQWY7O0FBT0EsU0FBSyxHQUFMLENBQVMsTUFBVCxHQUFrQixZQUFXO0FBQzNCLFVBQUksS0FBSyxNQUFMLElBQWUsR0FBbkIsRUFBd0I7QUFDdEIsY0FBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsR0FBdkIsQ0FBYjtBQUVBLFFBQUEsSUFBSSxDQUFDLElBQUwsR0FBWSxNQUFNLENBQUMsR0FBUCxDQUFXLGVBQVgsQ0FBMkIsSUFBSSxJQUFKLENBQVMsQ0FBQyxLQUFLLFFBQU4sQ0FBVCxFQUEwQjtBQUMvRCxVQUFBLElBQUksRUFBRTtBQUR5RCxTQUExQixDQUEzQixDQUFaO0FBR0EsUUFBQSxJQUFJLENBQUMsS0FBTCxDQUFXLE9BQVgsR0FBcUIsTUFBckI7QUFDQSxRQUFBLElBQUksQ0FBQyxZQUFMLENBQWtCLFVBQWxCLEVBQThCLFFBQTlCO0FBQ0EsUUFBQSxRQUFRLENBQUMsSUFBVCxDQUFjLFdBQWQsQ0FBMEIsSUFBMUI7QUFDQSxRQUFBLElBQUksQ0FBQyxLQUFMO0FBQ0EsUUFBQSxRQUFRLENBQUMsSUFBVCxDQUFjLFdBQWQsQ0FBMEIsSUFBMUI7QUFDQSxRQUFBLE1BQU0sQ0FBQyxHQUFQLENBQVcsZUFBWCxDQUEyQixJQUFJLENBQUMsSUFBaEM7O0FBQ0EsWUFBSSxRQUFRLENBQUMsU0FBYixFQUF3QjtBQUN0QixVQUFBLFFBQVEsQ0FBQyxTQUFUO0FBQ0Q7QUFDRixPQWZELE1BZU8sSUFBSSxLQUFLLE1BQUwsSUFBZSxHQUFmLElBQXNCLFFBQVEsQ0FBQyxRQUFuQyxFQUE2QztBQUlsRCxjQUFNLE1BQU0sR0FBRyxJQUFJLFVBQUosRUFBZjs7QUFDQSxRQUFBLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLFlBQVc7QUFDekIsY0FBSTtBQUNGLGtCQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQUssTUFBaEIsRUFBd0Isc0JBQXhCLENBQVo7QUFDQSxZQUFBLFFBQVEsQ0FBQyxRQUFULENBQWtCLElBQUksS0FBSixXQUFhLEdBQUcsQ0FBQyxJQUFKLENBQVMsSUFBdEIsZUFBK0IsR0FBRyxDQUFDLElBQUosQ0FBUyxJQUF4QyxPQUFsQjtBQUNELFdBSEQsQ0FHRSxPQUFPLEdBQVAsRUFBWTtBQUNaLFlBQUEsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsTUFBakIsQ0FBd0IsbURBQXhCLEVBQTZFLEtBQUssTUFBbEY7O0FBQ0EsWUFBQSxRQUFRLENBQUMsUUFBVCxDQUFrQixHQUFsQjtBQUNEO0FBQ0YsU0FSRDs7QUFTQSxRQUFBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQUssUUFBdkI7QUFDRDtBQUNGLEtBaENEOztBQWtDQSxTQUFLLEdBQUwsQ0FBUyxPQUFULEdBQW1CLFVBQVMsQ0FBVCxFQUFZO0FBQzdCLFVBQUksUUFBUSxDQUFDLFFBQWIsRUFBdUI7QUFDckIsUUFBQSxRQUFRLENBQUMsUUFBVCxDQUFrQixJQUFJLEtBQUosQ0FBVSxRQUFWLENBQWxCO0FBQ0Q7QUFDRixLQUpEOztBQU1BLFNBQUssR0FBTCxDQUFTLE9BQVQsR0FBbUIsWUFBVztBQUM1QixVQUFJLFFBQVEsQ0FBQyxRQUFiLEVBQXVCO0FBQ3JCLFFBQUEsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsSUFBbEI7QUFDRDtBQUNGLEtBSkQ7O0FBTUEsUUFBSTtBQUNGLFdBQUssR0FBTCxDQUFTLElBQVQ7QUFDRCxLQUZELENBRUUsT0FBTyxHQUFQLEVBQVk7QUFDWixVQUFJLEtBQUssUUFBVCxFQUFtQjtBQUNqQixhQUFLLFFBQUwsQ0FBYyxHQUFkO0FBQ0Q7QUFDRjs7QUFFRCxXQUFPLE1BQVA7QUFDRDs7QUFLRCxFQUFBLE1BQU0sR0FBRztBQUNQLFFBQUksS0FBSyxHQUFMLElBQVksS0FBSyxHQUFMLENBQVMsVUFBVCxHQUFzQixDQUF0QyxFQUF5QztBQUN2QyxXQUFLLEdBQUwsQ0FBUyxLQUFUO0FBQ0Q7QUFDRjs7QUFPRCxFQUFBLEtBQUssR0FBRztBQUNOLFdBQU8sS0FBSyxNQUFaO0FBQ0Q7O0FBT3dCLFNBQWxCLGtCQUFrQixDQUFDLFdBQUQsRUFBYztBQUNyQyxJQUFBLFdBQVcsR0FBRyxXQUFkO0FBQ0Q7O0FBL1JrQzs7Ozs7QUNoQnJDOzs7Ozs7Ozs7Ozs7Ozs7OztBQVVlLE1BQU0sY0FBTixDQUFxQjtBQUNsQyxFQUFBLFdBQVcsQ0FBQyxNQUFELEVBQVM7QUFBQTs7QUFBQTs7QUFDbEIsU0FBSyxLQUFMLEdBQWEsTUFBYjtBQUNBLFNBQUssSUFBTCxHQUFZLEVBQVo7QUFDRDs7QUF1QkQsRUFBQSxRQUFRLENBQUMsS0FBRCxFQUFRLE1BQVIsRUFBZ0IsS0FBaEIsRUFBdUI7QUFDN0IsU0FBSyxJQUFMLENBQVUsTUFBVixJQUFvQjtBQUNsQixNQUFBLEtBQUssRUFBRSxLQURXO0FBRWxCLE1BQUEsTUFBTSxFQUFFLE1BRlU7QUFHbEIsTUFBQSxLQUFLLEVBQUU7QUFIVyxLQUFwQjtBQUtBLFdBQU8sSUFBUDtBQUNEOztBQVNELEVBQUEsYUFBYSxDQUFDLEtBQUQsRUFBUTtBQUNuQixXQUFPLEtBQUssUUFBTCxDQUFjLEtBQUssS0FBTCxDQUFXLE9BQVgsR0FBcUIsQ0FBckIsR0FBeUIsS0FBSyxLQUFMLENBQVcsT0FBWCxHQUFxQixDQUE5QyxHQUFrRCxTQUFoRSxFQUEyRSxTQUEzRSxFQUFzRixLQUF0RixDQUFQO0FBQ0Q7O0FBU0QsRUFBQSxlQUFlLENBQUMsS0FBRCxFQUFRO0FBQ3JCLFdBQU8sS0FBSyxRQUFMLENBQWMsU0FBZCxFQUF5QixLQUFLLEtBQUwsQ0FBVyxPQUFYLEdBQXFCLENBQXJCLEdBQXlCLEtBQUssS0FBTCxDQUFXLE9BQXBDLEdBQThDLFNBQXZFLEVBQWtGLEtBQWxGLENBQVA7QUFDRDs7QUFTRCxFQUFBLFFBQVEsQ0FBQyxHQUFELEVBQU07QUFDWixTQUFLLElBQUwsQ0FBVSxNQUFWLElBQW9CO0FBQ2xCLE1BQUEsR0FBRyxFQUFFO0FBRGEsS0FBcEI7QUFHQSxXQUFPLElBQVA7QUFDRDs7QUFPRCxFQUFBLGFBQWEsR0FBRztBQUNkLFdBQU8sS0FBSyxRQUFMLHdCQUFjLElBQWQsc0NBQWMsSUFBZCxFQUFQO0FBQ0Q7O0FBV0QsRUFBQSxPQUFPLENBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxXQUFiLEVBQTBCO0FBQy9CLFVBQU0sSUFBSSxHQUFHO0FBQ1gsTUFBQSxHQUFHLEVBQUUsR0FETTtBQUVYLE1BQUEsS0FBSyxFQUFFO0FBRkksS0FBYjs7QUFJQSxRQUFJLEtBQUssS0FBTCxDQUFXLE9BQVgsTUFBd0IsSUFBNUIsRUFBa0M7QUFDaEMsTUFBQSxJQUFJLENBQUMsS0FBTCxHQUFhLFdBQWI7QUFDRCxLQUZELE1BRU87QUFDTCxNQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksV0FBWjtBQUNEOztBQUNELFNBQUssSUFBTCxDQUFVLEtBQVYsSUFBbUIsSUFBbkI7QUFDQSxXQUFPLElBQVA7QUFDRDs7QUFVRCxFQUFBLFVBQVUsQ0FBQyxHQUFELEVBQU0sV0FBTixFQUFtQjtBQUMzQixXQUFPLEtBQUssT0FBTCxDQUFhLEdBQWIsRUFBa0IsU0FBbEIsRUFBNkIsV0FBN0IsQ0FBUDtBQUNEOztBQVNELEVBQUEsZUFBZSxDQUFDLFdBQUQsRUFBYztBQUMzQixXQUFPLEtBQUssVUFBTCxDQUFnQixLQUFLLEtBQUwsQ0FBVyxlQUEzQixFQUE0QyxXQUE1QyxDQUFQO0FBQ0Q7O0FBU0QsRUFBQSxZQUFZLENBQUMsS0FBRCxFQUFRO0FBQ2xCLFdBQU8sS0FBSyxPQUFMLHdCQUFhLElBQWIsc0NBQWEsSUFBYixHQUFvQyxLQUFwQyxDQUFQO0FBQ0Q7O0FBT0QsRUFBQSxRQUFRLEdBQUc7QUFDVCxTQUFLLElBQUwsQ0FBVSxNQUFWLElBQW9CLElBQXBCO0FBQ0EsV0FBTyxJQUFQO0FBQ0Q7O0FBT0QsRUFBQSxRQUFRLEdBQUc7QUFDVCxRQUFJLEtBQUssS0FBTCxDQUFXLE9BQVgsTUFBd0IsSUFBNUIsRUFBa0M7QUFDaEMsV0FBSyxJQUFMLENBQVUsTUFBVixJQUFvQixJQUFwQjtBQUNELEtBRkQsTUFFTztBQUNMLFdBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsTUFBbkIsQ0FBMEIsd0RBQTFCLEVBQW9GLEtBQUssS0FBTCxDQUFXLE9BQVgsRUFBcEY7QUFDRDs7QUFDRCxXQUFPLElBQVA7QUFDRDs7QUFVRCxFQUFBLE9BQU8sQ0FBQyxLQUFELEVBQVEsS0FBUixFQUFlO0FBQ3BCLFFBQUksS0FBSyxJQUFJLEtBQWIsRUFBb0I7QUFDbEIsV0FBSyxJQUFMLENBQVUsS0FBVixJQUFtQjtBQUNqQixRQUFBLEtBQUssRUFBRSxLQURVO0FBRWpCLFFBQUEsS0FBSyxFQUFFO0FBRlUsT0FBbkI7QUFJRDs7QUFDRCxXQUFPLElBQVA7QUFDRDs7QUFTRCxFQUFBLFlBQVksQ0FBQyxLQUFELEVBQVE7QUFHbEIsV0FBTyxLQUFLLE9BQUwsQ0FBYSxLQUFLLEtBQUwsQ0FBVyxPQUFYLEdBQXFCLENBQXJCLEdBQXlCLEtBQUssS0FBTCxDQUFXLE9BQVgsR0FBcUIsQ0FBOUMsR0FBa0QsU0FBL0QsRUFBMEUsS0FBMUUsQ0FBUDtBQUNEOztBQVFELEVBQUEsT0FBTyxDQUFDLElBQUQsRUFBTztBQUNaLFdBQU8sS0FBSyxJQUFMLENBQVUsSUFBVixDQUFQO0FBQ0Q7O0FBUUQsRUFBQSxLQUFLLEdBQUc7QUFDTixVQUFNLElBQUksR0FBRyxFQUFiO0FBQ0EsUUFBSSxNQUFNLEdBQUcsRUFBYjtBQUNBLEtBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsTUFBaEIsRUFBd0IsTUFBeEIsRUFBZ0MsTUFBaEMsRUFBd0MsS0FBeEMsRUFBK0MsT0FBL0MsQ0FBd0QsR0FBRCxJQUFTO0FBQzlELFVBQUksS0FBSyxJQUFMLENBQVUsY0FBVixDQUF5QixHQUF6QixDQUFKLEVBQW1DO0FBQ2pDLFFBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWOztBQUNBLFlBQUksTUFBTSxDQUFDLG1CQUFQLENBQTJCLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBM0IsRUFBMkMsTUFBM0MsR0FBb0QsQ0FBeEQsRUFBMkQ7QUFDekQsVUFBQSxNQUFNLENBQUMsR0FBRCxDQUFOLEdBQWMsS0FBSyxJQUFMLENBQVUsR0FBVixDQUFkO0FBQ0Q7QUFDRjtBQUNGLEtBUEQ7O0FBUUEsUUFBSSxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWxCLEVBQXFCO0FBQ25CLE1BQUEsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsQ0FBZDtBQUNELEtBRkQsTUFFTztBQUNMLE1BQUEsTUFBTSxHQUFHLFNBQVQ7QUFDRDs7QUFDRCxXQUFPLE1BQVA7QUFDRDs7QUFsT2lDOzs7OzBCQU9qQjtBQUNmLFNBQU8sS0FBSyxLQUFMLENBQVcsT0FBbEI7QUFDRDs7MEJBR2dCO0FBQ2YsTUFBSSxLQUFLLEtBQUwsQ0FBVyxTQUFYLEVBQUosRUFBNEI7QUFDMUIsa0NBQU8sSUFBUCxzQ0FBTyxJQUFQO0FBQ0Q7O0FBQ0QsU0FBTyxLQUFLLEtBQUwsQ0FBVyxlQUFsQjtBQUNEOzs7O0FDaENIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUFNQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFNQTs7Ozs7Ozs7Ozs7Ozs7OztBQU9BLElBQUksaUJBQUo7O0FBQ0EsSUFBSSxPQUFPLFNBQVAsSUFBb0IsV0FBeEIsRUFBcUM7QUFDbkMsRUFBQSxpQkFBaUIsR0FBRyxTQUFwQjtBQUNEOztBQUVELElBQUksV0FBSjs7QUFDQSxJQUFJLE9BQU8sY0FBUCxJQUF5QixXQUE3QixFQUEwQztBQUN4QyxFQUFBLFdBQVcsR0FBRyxjQUFkO0FBQ0Q7O0FBRUQsSUFBSSxpQkFBSjs7QUFDQSxJQUFJLE9BQU8sU0FBUCxJQUFvQixXQUF4QixFQUFxQztBQUNuQyxFQUFBLGlCQUFpQixHQUFHLFNBQXBCO0FBQ0Q7O0FBT0Qsb0JBQW9COztBQUtwQixTQUFTLG9CQUFULEdBQWdDO0FBRTlCLFFBQU0sS0FBSyxHQUFHLG1FQUFkOztBQUVBLE1BQUksT0FBTyxJQUFQLElBQWUsV0FBbkIsRUFBZ0M7QUFDOUIsSUFBQSxNQUFNLENBQUMsSUFBUCxHQUFjLFlBQXFCO0FBQUEsVUFBWixLQUFZLHVFQUFKLEVBQUk7QUFDakMsVUFBSSxHQUFHLEdBQUcsS0FBVjtBQUNBLFVBQUksTUFBTSxHQUFHLEVBQWI7O0FBRUEsV0FBSyxJQUFJLEtBQUssR0FBRyxDQUFaLEVBQWUsUUFBZixFQUF5QixDQUFDLEdBQUcsQ0FBN0IsRUFBZ0MsR0FBRyxHQUFHLEtBQTNDLEVBQWtELEdBQUcsQ0FBQyxNQUFKLENBQVcsQ0FBQyxHQUFHLENBQWYsTUFBc0IsR0FBRyxHQUFHLEdBQU4sRUFBVyxDQUFDLEdBQUcsQ0FBckMsQ0FBbEQsRUFBMkYsTUFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFKLENBQVcsS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBSixHQUFRLENBQXJDLENBQXJHLEVBQThJO0FBRTVJLFFBQUEsUUFBUSxHQUFHLEdBQUcsQ0FBQyxVQUFKLENBQWUsQ0FBQyxJQUFJLElBQUksQ0FBeEIsQ0FBWDs7QUFFQSxZQUFJLFFBQVEsR0FBRyxJQUFmLEVBQXFCO0FBQ25CLGdCQUFNLElBQUksS0FBSixDQUFVLDBGQUFWLENBQU47QUFDRDs7QUFDRCxRQUFBLEtBQUssR0FBRyxLQUFLLElBQUksQ0FBVCxHQUFhLFFBQXJCO0FBQ0Q7O0FBRUQsYUFBTyxNQUFQO0FBQ0QsS0FmRDtBQWdCRDs7QUFFRCxNQUFJLE9BQU8sSUFBUCxJQUFlLFdBQW5CLEVBQWdDO0FBQzlCLElBQUEsTUFBTSxDQUFDLElBQVAsR0FBYyxZQUFxQjtBQUFBLFVBQVosS0FBWSx1RUFBSixFQUFJO0FBQ2pDLFVBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBZCxFQUFxQixFQUFyQixDQUFWO0FBQ0EsVUFBSSxNQUFNLEdBQUcsRUFBYjs7QUFFQSxVQUFJLEdBQUcsQ0FBQyxNQUFKLEdBQWEsQ0FBYixJQUFrQixDQUF0QixFQUF5QjtBQUN2QixjQUFNLElBQUksS0FBSixDQUFVLG1FQUFWLENBQU47QUFDRDs7QUFDRCxXQUFLLElBQUksRUFBRSxHQUFHLENBQVQsRUFBWSxFQUFFLEdBQUcsQ0FBakIsRUFBb0IsTUFBcEIsRUFBNEIsQ0FBQyxHQUFHLENBQXJDLEVBQXdDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBSixDQUFXLENBQUMsRUFBWixDQUFqRCxFQUVFLENBQUMsTUFBRCxLQUFZLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBTCxHQUFTLEVBQUUsR0FBRyxFQUFMLEdBQVUsTUFBbkIsR0FBNEIsTUFBakMsRUFDVixFQUFFLEtBQUssQ0FEVCxJQUNjLE1BQU0sSUFBSSxNQUFNLENBQUMsWUFBUCxDQUFvQixNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUQsR0FBSyxFQUFMLEdBQVUsQ0FBZixDQUE1QixDQUR4QixHQUN5RSxDQUgzRSxFQUlFO0FBQ0EsUUFBQSxNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxNQUFkLENBQVQ7QUFDRDs7QUFFRCxhQUFPLE1BQVA7QUFDRCxLQWhCRDtBQWlCRDs7QUFFRCxNQUFJLE9BQU8sTUFBUCxJQUFpQixXQUFyQixFQUFrQztBQUNoQyxJQUFBLE1BQU0sQ0FBQyxNQUFQLEdBQWdCO0FBQ2QsTUFBQSxTQUFTLEVBQUUsaUJBREc7QUFFZCxNQUFBLGNBQWMsRUFBRSxXQUZGO0FBR2QsTUFBQSxTQUFTLEVBQUUsaUJBSEc7QUFJZCxNQUFBLEdBQUcsRUFBRTtBQUNILFFBQUEsZUFBZSxFQUFFLFlBQVc7QUFDMUIsZ0JBQU0sSUFBSSxLQUFKLENBQVUsZ0VBQVYsQ0FBTjtBQUNEO0FBSEU7QUFKUyxLQUFoQjtBQVVEOztBQUVELHNCQUFXLG1CQUFYLENBQStCLGlCQUEvQixFQUFrRCxXQUFsRDs7QUFDQSxxQkFBZ0Isa0JBQWhCLENBQW1DLFdBQW5DOztBQUNBLGNBQVEsbUJBQVIsQ0FBNEIsaUJBQTVCO0FBQ0Q7O0FBR0QsU0FBUyxlQUFULEdBQTJCO0FBQ3pCLE1BQUksT0FBTyxNQUFQLElBQWlCLFFBQXJCLEVBQStCO0FBQzdCLFFBQUksTUFBTSxDQUFDLFdBQUQsQ0FBVixFQUF5QjtBQUN2QixhQUFPLElBQVA7QUFDRCxLQUZELE1BRU8sSUFBSSxNQUFNLENBQUMsZ0JBQUQsQ0FBVixFQUE4QjtBQUVuQyxhQUFPLElBQVA7QUFDRDtBQUNGOztBQUNELFNBQU8sSUFBUDtBQUNEOztBQUdELFNBQVMsZ0JBQVQsQ0FBMEIsR0FBMUIsRUFBK0I7QUFJN0IsU0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRCxDQUFsQixDQUF3QixPQUF4QixDQUFnQyxpQkFBaEMsRUFDVixTQUFTLFlBQVQsQ0FBc0IsS0FBdEIsRUFBNkIsRUFBN0IsRUFBaUM7QUFDL0IsV0FBTyxNQUFNLENBQUMsWUFBUCxDQUFvQixPQUFPLEVBQTNCLENBQVA7QUFDRCxHQUhTLENBQUQsQ0FBWDtBQUlEOztBQUdELFNBQVMsZUFBVCxDQUF5QixHQUF6QixFQUE4QixHQUE5QixFQUFtQztBQUNqQyxNQUFJLEdBQUcsWUFBWSxJQUFuQixFQUF5QjtBQUV2QixJQUFBLEdBQUcsR0FBRyw4QkFBa0IsR0FBbEIsQ0FBTjtBQUNELEdBSEQsTUFHTyxJQUFJLEdBQUcsWUFBWSxtQkFBbkIsRUFBK0I7QUFDcEMsSUFBQSxHQUFHLEdBQUcsR0FBRyxDQUFDLFVBQUosRUFBTjtBQUNELEdBRk0sTUFFQSxJQUFJLEdBQUcsS0FBSyxTQUFSLElBQXFCLEdBQUcsS0FBSyxJQUE3QixJQUFxQyxHQUFHLEtBQUssS0FBN0MsSUFDUixLQUFLLENBQUMsT0FBTixDQUFjLEdBQWQsS0FBc0IsR0FBRyxDQUFDLE1BQUosSUFBYyxDQUQ1QixJQUVQLE9BQU8sR0FBUCxJQUFjLFFBQWYsSUFBNkIsTUFBTSxDQUFDLElBQVAsQ0FBWSxHQUFaLEVBQWlCLE1BQWpCLElBQTJCLENBRnBELEVBRXlEO0FBRTlELFdBQU8sU0FBUDtBQUNEOztBQUVELFNBQU8sR0FBUDtBQUNEOztBQUFBOztBQUdELFNBQVMsZ0JBQVQsQ0FBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0M7QUFDbEMsTUFBSSxPQUFPLEdBQVAsSUFBYyxRQUFkLElBQTBCLEdBQUcsQ0FBQyxNQUFKLEdBQWEsR0FBM0MsRUFBZ0Q7QUFDOUMsV0FBTyxNQUFNLEdBQUcsQ0FBQyxNQUFWLEdBQW1CLFdBQW5CLEdBQWlDLEdBQUcsQ0FBQyxTQUFKLENBQWMsQ0FBZCxFQUFpQixFQUFqQixDQUFqQyxHQUF3RCxLQUF4RCxHQUFnRSxHQUFHLENBQUMsU0FBSixDQUFjLEdBQUcsQ0FBQyxNQUFKLEdBQWEsRUFBM0IsQ0FBaEUsR0FBaUcsR0FBeEc7QUFDRDs7QUFDRCxTQUFPLGVBQWUsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUF0QjtBQUNEOztBQUFBOztBQUdELFNBQVMsY0FBVCxDQUF3QixFQUF4QixFQUE0QixPQUE1QixFQUFxQztBQUNuQyxFQUFBLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBWDtBQUNBLE1BQUksV0FBVyxHQUFHLEVBQWxCOztBQUVBLE1BQUksZUFBZSxJQUFmLENBQW9CLE9BQXBCLENBQUosRUFBa0M7QUFDaEMsSUFBQSxXQUFXLEdBQUcsZUFBZDtBQUNEOztBQUNELE1BQUksTUFBSjtBQUVBLEVBQUEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFILENBQVcsc0JBQVgsRUFBbUMsRUFBbkMsQ0FBTDtBQUVBLE1BQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFILENBQVMsd0JBQVQsQ0FBUjs7QUFDQSxNQUFJLENBQUosRUFBTztBQUdMLFVBQU0sUUFBUSxHQUFHLENBQUMsS0FBRCxFQUFRLFFBQVIsRUFBa0IsUUFBbEIsRUFBNEIsUUFBNUIsRUFBc0MsU0FBdEMsQ0FBakI7QUFDQSxRQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBSCxDQUFVLENBQUMsQ0FBQyxLQUFGLEdBQVUsQ0FBQyxDQUFDLENBQUQsQ0FBRCxDQUFLLE1BQXpCLEVBQWlDLEtBQWpDLENBQXVDLEdBQXZDLENBQVY7QUFDQSxRQUFJLE1BQU0sR0FBRyxFQUFiO0FBQ0EsUUFBSSxPQUFKOztBQUVBLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQXhCLEVBQWdDLENBQUMsRUFBakMsRUFBcUM7QUFDbkMsVUFBSSxFQUFFLEdBQUcsd0JBQXdCLElBQXhCLENBQTZCLEdBQUcsQ0FBQyxDQUFELENBQWhDLENBQVQ7O0FBQ0EsVUFBSSxFQUFKLEVBQVE7QUFFTixRQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBQyxFQUFFLENBQUMsQ0FBRCxDQUFILEVBQVEsRUFBRSxDQUFDLENBQUQsQ0FBVixFQUFlLFFBQVEsQ0FBQyxTQUFULENBQW9CLENBQUQsSUFBTztBQUNuRCxpQkFBTyxFQUFFLENBQUMsQ0FBRCxDQUFGLENBQU0sV0FBTixHQUFvQixVQUFwQixDQUErQixDQUEvQixDQUFQO0FBQ0QsU0FGMEIsQ0FBZixDQUFaOztBQUdBLFlBQUksRUFBRSxDQUFDLENBQUQsQ0FBRixJQUFTLFNBQWIsRUFBd0I7QUFDdEIsVUFBQSxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUQsQ0FBWjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRCxJQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBQyxDQUFELEVBQUksQ0FBSixLQUFVO0FBQ3BCLGFBQU8sQ0FBQyxDQUFDLENBQUQsQ0FBRCxHQUFPLENBQUMsQ0FBQyxDQUFELENBQWY7QUFDRCxLQUZEOztBQUdBLFFBQUksTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBcEIsRUFBdUI7QUFFckIsVUFBSSxNQUFNLENBQUMsQ0FBRCxDQUFOLENBQVUsQ0FBVixFQUFhLFdBQWIsR0FBMkIsVUFBM0IsQ0FBc0MsS0FBdEMsQ0FBSixFQUFrRDtBQUNoRCxRQUFBLE1BQU0sQ0FBQyxDQUFELENBQU4sQ0FBVSxDQUFWLElBQWUsTUFBZjtBQUNELE9BRkQsTUFFTyxJQUFJLE1BQU0sQ0FBQyxDQUFELENBQU4sQ0FBVSxDQUFWLEtBQWdCLEtBQXBCLEVBQTJCO0FBQ2hDLFFBQUEsTUFBTSxDQUFDLENBQUQsQ0FBTixDQUFVLENBQVYsSUFBZSxPQUFmO0FBQ0QsT0FGTSxNQUVBLElBQUksTUFBTSxDQUFDLENBQUQsQ0FBTixDQUFVLENBQVYsS0FBZ0IsUUFBaEIsSUFBNEIsT0FBaEMsRUFBeUM7QUFDOUMsUUFBQSxNQUFNLENBQUMsQ0FBRCxDQUFOLENBQVUsQ0FBVixJQUFlLE9BQWY7QUFDRDs7QUFDRCxNQUFBLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBRCxDQUFOLENBQVUsQ0FBVixJQUFlLEdBQWYsR0FBcUIsTUFBTSxDQUFDLENBQUQsQ0FBTixDQUFVLENBQVYsQ0FBOUI7QUFDRCxLQVZELE1BVU87QUFFTCxNQUFBLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBRCxDQUFWO0FBQ0Q7QUFDRixHQXRDRCxNQXNDTyxJQUFJLFdBQVcsSUFBWCxDQUFnQixFQUFoQixDQUFKLEVBQXlCO0FBQzlCLElBQUEsQ0FBQyxHQUFHLHFCQUFxQixJQUFyQixDQUEwQixFQUExQixDQUFKOztBQUNBLFFBQUksQ0FBSixFQUFPO0FBQ0wsTUFBQSxNQUFNLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBRCxDQUF2QjtBQUNELEtBRkQsTUFFTztBQUNMLE1BQUEsTUFBTSxHQUFHLFdBQVQ7QUFDRDtBQUNGLEdBUE0sTUFPQTtBQUVMLElBQUEsQ0FBQyxHQUFHLHFCQUFxQixJQUFyQixDQUEwQixFQUExQixDQUFKOztBQUNBLFFBQUksQ0FBSixFQUFPO0FBQ0wsTUFBQSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUQsQ0FBRCxHQUFPLEdBQVAsR0FBYSxDQUFDLENBQUMsQ0FBRCxDQUF2QjtBQUNELEtBRkQsTUFFTztBQUNMLE1BQUEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFILENBQVMsR0FBVCxDQUFKO0FBQ0EsTUFBQSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUQsQ0FBVjtBQUNEO0FBQ0Y7O0FBR0QsRUFBQSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQVAsQ0FBYSxHQUFiLENBQUo7O0FBQ0EsTUFBSSxDQUFDLENBQUMsTUFBRixHQUFXLENBQWYsRUFBa0I7QUFDaEIsVUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUQsQ0FBRCxDQUFLLEtBQUwsQ0FBVyxHQUFYLENBQVY7QUFDQSxVQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBRCxDQUFELEdBQU8sTUFBTSxDQUFDLENBQUMsQ0FBRCxDQUFELENBQUssTUFBTCxDQUFZLENBQVosRUFBZSxDQUFmLENBQWIsR0FBaUMsRUFBL0M7QUFDQSxJQUFBLE1BQU0sYUFBTSxDQUFDLENBQUMsQ0FBRCxDQUFQLGNBQWMsQ0FBQyxDQUFDLENBQUQsQ0FBZixTQUFxQixLQUFyQixDQUFOO0FBQ0Q7O0FBQ0QsU0FBTyxXQUFXLEdBQUcsTUFBckI7QUFDRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlTSxNQUFNLE1BQU4sQ0FBYTtBQXFEbEIsRUFBQSxXQUFXLENBQUMsTUFBRCxFQUFTLFVBQVQsRUFBcUI7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQSxzQ0EzQ3JCLEVBMkNxQjs7QUFBQTs7QUFBQSxtQ0F4Q3hCLFdBd0N3Qjs7QUFBQSw0Q0F2Q2YsSUF1Q2U7O0FBQUEsNkNBcENkLEtBb0NjOztBQUFBLDhDQWxDYixLQWtDYTs7QUFBQSxvQ0FoQ3ZCLElBZ0N1Qjs7QUFBQSw0Q0E5QmYsS0E4QmU7O0FBQUEsb0NBNUJ2QixJQTRCdUI7O0FBQUEsd0NBMUJuQixJQTBCbUI7O0FBQUEsNENBeEJmLENBd0JlOztBQUFBLHdDQXRCbkIsSUFBSSxDQUFDLEtBQUwsQ0FBWSxJQUFJLENBQUMsTUFBTCxLQUFnQixNQUFqQixHQUEyQixNQUF0QyxDQXNCbUI7O0FBQUEseUNBcEJsQixJQW9Ca0I7O0FBQUEsMENBbEJqQixJQWtCaUI7O0FBQUEsOENBZmIsRUFlYTs7QUFBQSw2Q0FiZCxJQWFjOztBQUFBLHlDQVZsQixJQVVrQjs7QUFBQSxzQ0FQckIsS0FPcUI7O0FBQUEsaUNBTDFCLElBSzBCOztBQUFBLG9DQUZ2QixFQUV1Qjs7QUFBQSw2Q0FvdkRkLFNBcHZEYzs7QUFBQSx1Q0Ewd0RwQixTQTF3RG9COztBQUFBLDBDQWl4RGpCLFNBanhEaUI7O0FBQUEscUNBNnhEdEIsU0E3eERzQjs7QUFBQSwyQ0FveURoQixTQXB5RGdCOztBQUFBLDJDQTJ5RGhCLFNBM3lEZ0I7O0FBQUEsMkNBa3pEaEIsU0FsekRnQjs7QUFBQSx1Q0F5ekRwQixTQXp6RG9COztBQUFBLDBDQWcwRGpCLFNBaDBEaUI7O0FBQUEsNENBdTBEZixTQXYwRGU7O0FBQUEsc0RBODBETCxTQTkwREs7O0FBQzlCLFNBQUssS0FBTCxHQUFhLE1BQU0sQ0FBQyxJQUFwQjtBQUNBLFNBQUssT0FBTCxHQUFlLE1BQU0sQ0FBQyxNQUF0QjtBQUdBLFNBQUssUUFBTCxHQUFnQixNQUFNLENBQUMsT0FBUCxJQUFrQixXQUFsQztBQUdBLFNBQUssT0FBTCxHQUFlLE1BQU0sQ0FBQyxNQUF0QjtBQUdBLFNBQUssU0FBTCxHQUFpQixNQUFNLENBQUMsUUFBUCxJQUFtQixLQUFwQzs7QUFFQSxRQUFJLE9BQU8sU0FBUCxJQUFvQixXQUF4QixFQUFxQztBQUNuQyxXQUFLLFFBQUwsR0FBZ0IsY0FBYyxDQUFDLFNBQVMsQ0FBQyxTQUFYLEVBQXNCLFNBQVMsQ0FBQyxPQUFoQyxDQUE5QjtBQUNBLFdBQUssS0FBTCxHQUFhLFNBQVMsQ0FBQyxRQUF2QjtBQUVBLFdBQUssY0FBTCxHQUFzQixTQUFTLENBQUMsUUFBVixJQUFzQixPQUE1QztBQUNEOztBQUVELHdCQUFXLE1BQVgsR0FBb0IsVUFBQyxHQUFELEVBQWtCO0FBQUEsd0NBQVQsSUFBUztBQUFULFFBQUEsSUFBUztBQUFBOztBQUNwQyw2QkFBQSxLQUFJLG9CQUFKLE1BQUEsS0FBSSxFQUFTLEdBQVQsRUFBYyxJQUFkLENBQUo7QUFDRCxLQUZEOztBQUdBLG9CQUFPLE1BQVAsR0FBZ0IsVUFBQyxHQUFELEVBQWtCO0FBQUEseUNBQVQsSUFBUztBQUFULFFBQUEsSUFBUztBQUFBOztBQUNoQyw2QkFBQSxLQUFJLG9CQUFKLE1BQUEsS0FBSSxFQUFTLEdBQVQsRUFBYyxJQUFkLENBQUo7QUFDRCxLQUZEOztBQUtBLFFBQUksTUFBTSxDQUFDLFNBQVAsSUFBb0IsSUFBcEIsSUFBNEIsTUFBTSxDQUFDLFNBQVAsSUFBb0IsSUFBcEQsRUFBMEQ7QUFDeEQsTUFBQSxNQUFNLENBQUMsU0FBUCxHQUFtQixlQUFlLEVBQWxDO0FBQ0Q7O0FBQ0QsU0FBSyxXQUFMLEdBQW1CLElBQUksbUJBQUosQ0FBZSxNQUFmLEVBQXVCLEtBQUssQ0FBQyxnQkFBN0IsRUFBbUUsSUFBbkUsQ0FBbkI7O0FBQ0EsU0FBSyxXQUFMLENBQWlCLFNBQWpCLEdBQThCLElBQUQsSUFBVTtBQUVyQyxtRkFBc0IsSUFBdEI7QUFDRCxLQUhEOztBQUlBLFNBQUssV0FBTCxDQUFpQixNQUFqQixHQUEwQixNQUFNO0FBRTlCO0FBQ0QsS0FIRDs7QUFJQSxTQUFLLFdBQUwsQ0FBaUIsWUFBakIsR0FBZ0MsQ0FBQyxHQUFELEVBQU0sSUFBTixLQUFlO0FBQzdDLDZFQUFtQixHQUFuQixFQUF3QixJQUF4QjtBQUNELEtBRkQ7O0FBSUEsU0FBSyxXQUFMLENBQWlCLHdCQUFqQixHQUE0QyxDQUFDLE9BQUQsRUFBVSxPQUFWLEtBQXNCO0FBQ2hFLFVBQUksS0FBSyx3QkFBVCxFQUFtQztBQUNqQyxhQUFLLHdCQUFMLENBQThCLE9BQTlCLEVBQXVDLE9BQXZDO0FBQ0Q7QUFDRixLQUpEOztBQU1BLFNBQUssUUFBTCxHQUFnQixNQUFNLENBQUMsT0FBdkI7QUFFQSxTQUFLLEdBQUwsR0FBVyxJQUFJLFdBQUosQ0FBYSxHQUFELElBQVM7QUFDOUIsaUVBQWEsSUFBYixFQUFtQixHQUFuQjtBQUNELEtBRlUsRUFFUixLQUFLLE1BRkcsQ0FBWDs7QUFJQSxRQUFJLEtBQUssUUFBVCxFQUFtQjtBQUdqQixZQUFNLElBQUksR0FBRyxFQUFiOztBQUNBLFdBQUssR0FBTCxDQUFTLFlBQVQsR0FBd0IsSUFBeEIsQ0FBNkIsTUFBTTtBQUVqQyxlQUFPLEtBQUssR0FBTCxDQUFTLFNBQVQsQ0FBb0IsSUFBRCxJQUFVO0FBQ2xDLGNBQUksS0FBSywwQkFBRyxJQUFILDhCQUFHLElBQUgsRUFBa0IsT0FBbEIsRUFBMkIsSUFBSSxDQUFDLElBQWhDLENBQVQ7O0FBQ0EsY0FBSSxLQUFKLEVBQVc7QUFDVDtBQUNEOztBQUNELGNBQUksSUFBSSxDQUFDLElBQUwsSUFBYSxLQUFLLENBQUMsUUFBdkIsRUFBaUM7QUFDL0IsWUFBQSxLQUFLLEdBQUcsSUFBSSxjQUFKLEVBQVI7QUFDRCxXQUZELE1BRU8sSUFBSSxJQUFJLENBQUMsSUFBTCxJQUFhLEtBQUssQ0FBQyxTQUF2QixFQUFrQztBQUN2QyxZQUFBLEtBQUssR0FBRyxJQUFJLGVBQUosRUFBUjtBQUNELFdBRk0sTUFFQTtBQUNMLFlBQUEsS0FBSyxHQUFHLElBQUksWUFBSixDQUFVLElBQUksQ0FBQyxJQUFmLENBQVI7QUFDRDs7QUFDRCxlQUFLLEdBQUwsQ0FBUyxnQkFBVCxDQUEwQixLQUExQixFQUFpQyxJQUFqQzs7QUFDQSw2RkFBeUIsS0FBekI7O0FBQ0EsVUFBQSxLQUFLLENBQUMsYUFBTjs7QUFFQSxpQkFBTyxLQUFLLENBQUMsSUFBYjtBQUVBLFVBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsYUFBTixDQUFvQixLQUFLLEdBQXpCLENBQVY7QUFDRCxTQW5CTSxDQUFQO0FBb0JELE9BdEJELEVBc0JHLElBdEJILENBc0JRLE1BQU07QUFFWixlQUFPLEtBQUssR0FBTCxDQUFTLFFBQVQsQ0FBbUIsSUFBRCxJQUFVO0FBQ2pDLHlFQUFlLE1BQWYsRUFBdUIsSUFBSSxDQUFDLEdBQTVCLEVBQWlDLHFCQUFTLEVBQVQsRUFBYSxJQUFJLENBQUMsTUFBbEIsQ0FBakM7QUFDRCxTQUZNLENBQVA7QUFHRCxPQTNCRCxFQTJCRyxJQTNCSCxDQTJCUSxNQUFNO0FBRVosZUFBTyxPQUFPLENBQUMsR0FBUixDQUFZLElBQVosQ0FBUDtBQUNELE9BOUJELEVBOEJHLElBOUJILENBOEJRLE1BQU07QUFDWixZQUFJLFVBQUosRUFBZ0I7QUFDZCxVQUFBLFVBQVU7QUFDWDs7QUFDRCxtRUFBYSwrQkFBYjtBQUNELE9BbkNELEVBbUNHLEtBbkNILENBbUNVLEdBQUQsSUFBUztBQUNoQixZQUFJLFVBQUosRUFBZ0I7QUFDZCxVQUFBLFVBQVUsQ0FBQyxHQUFELENBQVY7QUFDRDs7QUFDRCxtRUFBYSx3Q0FBYixFQUF1RCxHQUF2RDtBQUNELE9BeENEO0FBeUNELEtBN0NELE1BNkNPO0FBQ0wsV0FBSyxHQUFMLENBQVMsY0FBVCxHQUEwQixJQUExQixDQUErQixNQUFNO0FBQ25DLFlBQUksVUFBSixFQUFnQjtBQUNkLFVBQUEsVUFBVTtBQUNYO0FBQ0YsT0FKRDtBQUtEO0FBQ0Y7O0FBc2RnQixTQUFWLFVBQVUsQ0FBQyxJQUFELEVBQU8sR0FBUCxFQUFZLE1BQVosRUFBb0IsSUFBcEIsRUFBMEI7QUFDekMsUUFBSSxPQUFPLElBQVAsSUFBZSxRQUFuQixFQUE2QjtBQUMzQixPQUFDO0FBQ0MsUUFBQSxHQUREO0FBRUMsUUFBQSxNQUZEO0FBR0MsUUFBQSxJQUhEO0FBSUMsUUFBQTtBQUpELFVBS0csSUFMSjtBQU1EOztBQUNELFFBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFaLENBQVIsRUFBMkI7QUFDekIsYUFBTyxDQUFDO0FBQ04sZ0JBQVEsSUFERjtBQUVOLGVBQU8sR0FGRDtBQUdOLGdCQUFRLElBSEY7QUFJTixrQkFBVTtBQUpKLE9BQUQsQ0FBUDtBQU1EOztBQUNELFdBQU8sSUFBUDtBQUNEOztBQVdlLFNBQVQsU0FBUyxDQUFDLElBQUQsRUFBTztBQUNyQixXQUFPLGFBQU0sU0FBTixDQUFnQixJQUFoQixDQUFQO0FBQ0Q7O0FBVW1CLFNBQWIsYUFBYSxDQUFDLElBQUQsRUFBTztBQUN6QixXQUFPLGFBQU0sYUFBTixDQUFvQixJQUFwQixDQUFQO0FBQ0Q7O0FBU3NCLFNBQWhCLGdCQUFnQixDQUFDLElBQUQsRUFBTztBQUM1QixXQUFPLGFBQU0sZ0JBQU4sQ0FBdUIsSUFBdkIsQ0FBUDtBQUNEOztBQVNvQixTQUFkLGNBQWMsQ0FBQyxJQUFELEVBQU87QUFDMUIsV0FBTyxhQUFNLGNBQU4sQ0FBcUIsSUFBckIsQ0FBUDtBQUNEOztBQVNxQixTQUFmLGVBQWUsQ0FBQyxJQUFELEVBQU87QUFDM0IsV0FBTyxhQUFNLGVBQU4sQ0FBc0IsSUFBdEIsQ0FBUDtBQUNEOztBQVN5QixTQUFuQixtQkFBbUIsQ0FBQyxJQUFELEVBQU87QUFDL0IsV0FBTyxhQUFNLG1CQUFOLENBQTBCLElBQTFCLENBQVA7QUFDRDs7QUFTd0IsU0FBbEIsa0JBQWtCLENBQUMsSUFBRCxFQUFPO0FBQzlCLFdBQU8sYUFBTSxrQkFBTixDQUF5QixJQUF6QixDQUFQO0FBQ0Q7O0FBUWdCLFNBQVYsVUFBVSxHQUFHO0FBQ2xCLFdBQU8sS0FBSyxDQUFDLE9BQWI7QUFDRDs7QUFReUIsU0FBbkIsbUJBQW1CLENBQUMsVUFBRCxFQUFhLFdBQWIsRUFBMEI7QUFDbEQsSUFBQSxpQkFBaUIsR0FBRyxVQUFwQjtBQUNBLElBQUEsV0FBVyxHQUFHLFdBQWQ7O0FBRUEsd0JBQVcsbUJBQVgsQ0FBK0IsaUJBQS9CLEVBQWtELFdBQWxEOztBQUNBLHVCQUFnQixrQkFBaEIsQ0FBbUMsV0FBbkM7QUFDRDs7QUFPeUIsU0FBbkIsbUJBQW1CLENBQUMsV0FBRCxFQUFjO0FBQ3RDLElBQUEsaUJBQWlCLEdBQUcsV0FBcEI7O0FBRUEsZ0JBQVEsbUJBQVIsQ0FBNEIsaUJBQTVCO0FBQ0Q7O0FBUWdCLFNBQVYsVUFBVSxHQUFHO0FBQ2xCLFdBQU8sS0FBSyxDQUFDLE9BQWI7QUFDRDs7QUFVaUIsU0FBWCxXQUFXLENBQUMsR0FBRCxFQUFNO0FBQ3RCLFdBQU8sR0FBRyxLQUFLLEtBQUssQ0FBQyxRQUFyQjtBQUNEOztBQWdCbUIsU0FBYixhQUFhLENBQUMsR0FBRCxFQUFNO0FBQ3hCLFdBQU8sQ0FBQyxrQ0FBa0MsSUFBbEMsQ0FBdUMsR0FBdkMsQ0FBUjtBQUNEOztBQUtELEVBQUEsZUFBZSxHQUFHO0FBQ2hCLFdBQVEsS0FBSyxVQUFMLElBQW1CLENBQXBCLEdBQXlCLEtBQUssS0FBSyxVQUFMLEVBQTlCLEdBQWtELFNBQXpEO0FBQ0Q7O0FBWUQsRUFBQSxPQUFPLENBQUMsS0FBRCxFQUFRO0FBQ2IsV0FBTyxLQUFLLFdBQUwsQ0FBaUIsT0FBakIsQ0FBeUIsS0FBekIsQ0FBUDtBQUNEOztBQVFELEVBQUEsU0FBUyxDQUFDLEtBQUQsRUFBUTtBQUNmLFNBQUssV0FBTCxDQUFpQixTQUFqQixDQUEyQixLQUEzQjtBQUNEOztBQU1ELEVBQUEsVUFBVSxHQUFHO0FBQ1gsU0FBSyxXQUFMLENBQWlCLFVBQWpCO0FBQ0Q7O0FBT0QsRUFBQSxZQUFZLEdBQUc7QUFDYixRQUFJLEtBQUssR0FBTCxDQUFTLE9BQVQsRUFBSixFQUF3QjtBQUN0QixhQUFPLEtBQUssR0FBTCxDQUFTLGNBQVQsRUFBUDtBQUNEOztBQUNELFdBQU8sT0FBTyxDQUFDLE9BQVIsRUFBUDtBQUNEOztBQU9ELEVBQUEsV0FBVyxHQUFHO0FBQ1osUUFBSSxDQUFDLEtBQUssR0FBTCxDQUFTLE9BQVQsRUFBTCxFQUF5QjtBQUN2QixhQUFPLEtBQUssR0FBTCxDQUFTLFlBQVQsRUFBUDtBQUNEOztBQUNELFdBQU8sT0FBTyxDQUFDLE9BQVIsRUFBUDtBQUNEOztBQU1ELEVBQUEsWUFBWSxHQUFHO0FBQ2IsU0FBSyxXQUFMLENBQWlCLEtBQWpCO0FBQ0Q7O0FBUUQsRUFBQSxXQUFXLEdBQUc7QUFDWixXQUFPLEtBQUssV0FBTCxDQUFpQixXQUFqQixFQUFQO0FBQ0Q7O0FBT0QsRUFBQSxlQUFlLEdBQUc7QUFDaEIsV0FBTyxLQUFLLGNBQVo7QUFDRDs7QUFVRCxFQUFBLFlBQVksQ0FBQyxHQUFELEVBQU07QUFDaEIsUUFBSSxPQUFPLEdBQVAsSUFBYyxRQUFsQixFQUE0QjtBQUMxQixhQUFPLEdBQVA7QUFDRDs7QUFFRCxRQUFJLE1BQU0sQ0FBQyxhQUFQLENBQXFCLEdBQXJCLENBQUosRUFBK0I7QUFFN0IsWUFBTSxJQUFJLEdBQUcsZ0JBQWI7QUFDQSxZQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUosQ0FBUSxHQUFSLEVBQWEsSUFBYixDQUFmOztBQUNBLFVBQUksS0FBSyxPQUFULEVBQWtCO0FBQ2hCLFFBQUEsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsTUFBcEIsQ0FBMkIsUUFBM0IsRUFBcUMsS0FBSyxPQUExQztBQUNEOztBQUNELFVBQUksS0FBSyxVQUFMLElBQW1CLEtBQUssVUFBTCxDQUFnQixLQUF2QyxFQUE4QztBQUM1QyxRQUFBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLE1BQXBCLENBQTJCLE1BQTNCLEVBQW1DLE9BQW5DO0FBQ0EsUUFBQSxNQUFNLENBQUMsWUFBUCxDQUFvQixNQUFwQixDQUEyQixRQUEzQixFQUFxQyxLQUFLLFVBQUwsQ0FBZ0IsS0FBckQ7QUFDRDs7QUFFRCxNQUFBLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUCxHQUFrQixTQUFsQixDQUE0QixJQUFJLENBQUMsTUFBTCxHQUFjLENBQTFDLENBQU47QUFDRDs7QUFDRCxXQUFPLEdBQVA7QUFDRDs7QUFrQ0QsRUFBQSxPQUFPLENBQUMsR0FBRCxFQUFNLE1BQU4sRUFBYyxNQUFkLEVBQXNCLEtBQXRCLEVBQTZCLE1BQTdCLEVBQXFDO0FBQzFDLFVBQU0sR0FBRywwQkFBRyxJQUFILGtDQUFHLElBQUgsRUFBb0IsS0FBcEIsQ0FBVDs7QUFDQSxJQUFBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixHQUFlLEdBQWY7QUFDQSxJQUFBLEdBQUcsQ0FBQyxHQUFKLENBQVEsTUFBUixHQUFpQixNQUFqQjtBQUNBLElBQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxNQUFSLEdBQWlCLE1BQWpCO0FBRUEsSUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLEtBQVIsR0FBZ0IsS0FBaEI7O0FBRUEsUUFBSSxNQUFKLEVBQVk7QUFDVixNQUFBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixDQUFhLE1BQWIsR0FBc0IsTUFBTSxDQUFDLE1BQTdCO0FBQ0EsTUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsQ0FBYSxNQUFiLEdBQXNCLE1BQU0sQ0FBQyxNQUE3QjtBQUNBLE1BQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLENBQWEsT0FBYixHQUF1QixNQUFNLENBQUMsT0FBOUI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixDQUFhLE9BQWIsR0FBdUIsTUFBTSxDQUFDLE9BQTlCO0FBRUEsTUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsR0FBZSxNQUFNLENBQUMsSUFBdEI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixHQUFlLE1BQU0sQ0FBQyxJQUF0QjtBQUVBLE1BQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxLQUFSLEdBQWdCLE1BQU0sQ0FBQyxLQUF2Qjs7QUFFQSxVQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsTUFBTSxDQUFDLFdBQXJCLEtBQXFDLE1BQU0sQ0FBQyxXQUFQLENBQW1CLE1BQW5CLEdBQTRCLENBQXJFLEVBQXdFO0FBQ3RFLFFBQUEsR0FBRyxDQUFDLEtBQUosR0FBWTtBQUNWLFVBQUEsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFQLENBQW1CLE1BQW5CLENBQTBCLEdBQUcsSUFBSSxNQUFNLENBQUMsYUFBUCxDQUFxQixHQUFyQixDQUFqQztBQURILFNBQVo7QUFHRDtBQUNGOztBQUVELGtDQUFPLElBQVAsc0JBQU8sSUFBUCxFQUFrQixHQUFsQixFQUF1QixHQUFHLENBQUMsR0FBSixDQUFRLEVBQS9CO0FBQ0Q7O0FBYUQsRUFBQSxhQUFhLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsS0FBakIsRUFBd0IsTUFBeEIsRUFBZ0M7QUFDM0MsUUFBSSxPQUFPLEdBQUcsS0FBSyxPQUFMLENBQWEsUUFBYixFQUF1QixNQUF2QixFQUErQixNQUEvQixFQUF1QyxLQUF2QyxFQUE4QyxNQUE5QyxDQUFkOztBQUNBLFFBQUksS0FBSixFQUFXO0FBQ1QsTUFBQSxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQVIsQ0FBYyxJQUFELElBQVU7QUFDL0Isc0NBQU8sSUFBUCw0Q0FBTyxJQUFQLEVBQTZCLElBQTdCO0FBQ0QsT0FGUyxDQUFWO0FBR0Q7O0FBQ0QsV0FBTyxPQUFQO0FBQ0Q7O0FBYUQsRUFBQSxrQkFBa0IsQ0FBQyxRQUFELEVBQVcsUUFBWCxFQUFxQixNQUFyQixFQUE2QjtBQUU3QyxJQUFBLFFBQVEsR0FBRyxRQUFRLElBQUksRUFBdkI7QUFDQSxJQUFBLFFBQVEsR0FBRyxRQUFRLElBQUksRUFBdkI7QUFDQSxXQUFPLEtBQUssYUFBTCxDQUFtQixPQUFuQixFQUNMLGdCQUFnQixDQUFDLFFBQVEsR0FBRyxHQUFYLEdBQWlCLFFBQWxCLENBRFgsRUFDd0MsSUFEeEMsRUFDOEMsTUFEOUMsQ0FBUDtBQUVEOztBQWFELEVBQUEsa0JBQWtCLENBQUMsR0FBRCxFQUFNLFFBQU4sRUFBZ0IsUUFBaEIsRUFBMEIsTUFBMUIsRUFBa0M7QUFFbEQsSUFBQSxRQUFRLEdBQUcsUUFBUSxJQUFJLEVBQXZCO0FBQ0EsSUFBQSxRQUFRLEdBQUcsUUFBUSxJQUFJLEVBQXZCO0FBQ0EsV0FBTyxLQUFLLE9BQUwsQ0FBYSxHQUFiLEVBQWtCLE9BQWxCLEVBQ0wsZ0JBQWdCLENBQUMsUUFBUSxHQUFHLEdBQVgsR0FBaUIsUUFBbEIsQ0FEWCxFQUN3QyxLQUR4QyxFQUMrQyxNQUQvQyxDQUFQO0FBRUQ7O0FBUUQsRUFBQSxLQUFLLEdBQUc7QUFDTixVQUFNLEdBQUcsMEJBQUcsSUFBSCxrQ0FBRyxJQUFILEVBQW9CLElBQXBCLENBQVQ7O0FBRUEsV0FBTyx1REFBVyxHQUFYLEVBQWdCLEdBQUcsQ0FBQyxFQUFKLENBQU8sRUFBdkIsRUFDSixJQURJLENBQ0UsSUFBRCxJQUFVO0FBRWQsV0FBSyxXQUFMLENBQWlCLFlBQWpCOztBQUlBLFVBQUksSUFBSSxDQUFDLE1BQVQsRUFBaUI7QUFDZixhQUFLLFdBQUwsR0FBbUIsSUFBSSxDQUFDLE1BQXhCO0FBQ0Q7O0FBRUQsVUFBSSxLQUFLLFNBQVQsRUFBb0I7QUFDbEIsYUFBSyxTQUFMO0FBQ0Q7O0FBRUQsYUFBTyxJQUFQO0FBQ0QsS0FoQkksRUFnQkYsS0FoQkUsQ0FnQkssR0FBRCxJQUFTO0FBQ2hCLFdBQUssV0FBTCxDQUFpQixTQUFqQixDQUEyQixJQUEzQjs7QUFFQSxVQUFJLEtBQUssWUFBVCxFQUF1QjtBQUNyQixhQUFLLFlBQUwsQ0FBa0IsR0FBbEI7QUFDRDtBQUNGLEtBdEJJLENBQVA7QUF1QkQ7O0FBWUQsRUFBQSxjQUFjLENBQUMsRUFBRCxFQUFLO0FBQ2pCLFFBQUksSUFBSSxHQUFHLEtBQVg7QUFFQSxJQUFBLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBWDs7QUFDQSxRQUFJLEVBQUUsSUFBSSxLQUFLLFlBQWYsRUFBNkI7QUFDM0IsV0FBSyxZQUFMLEdBQW9CLEVBQXBCOztBQUNBLFVBQUksS0FBSyxXQUFMLE1BQXNCLEtBQUssZUFBTCxFQUExQixFQUFrRDtBQUNoRCwrREFBVztBQUNULGdCQUFNO0FBQ0osbUJBQU8sRUFBRSxJQUFJLE1BQU0sQ0FBQztBQURoQjtBQURHLFNBQVg7O0FBS0EsUUFBQSxJQUFJLEdBQUcsSUFBUDtBQUNEO0FBQ0Y7O0FBQ0QsV0FBTyxJQUFQO0FBQ0Q7O0FBb0JELEVBQUEsS0FBSyxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLElBQWpCLEVBQXVCO0FBQzFCLFVBQU0sR0FBRywwQkFBRyxJQUFILGtDQUFHLElBQUgsRUFBb0IsT0FBcEIsQ0FBVDs7QUFDQSxJQUFBLEdBQUcsQ0FBQyxLQUFKLENBQVUsTUFBVixHQUFtQixNQUFuQjtBQUNBLElBQUEsR0FBRyxDQUFDLEtBQUosQ0FBVSxNQUFWLEdBQW1CLE1BQW5CO0FBQ0EsSUFBQSxHQUFHLENBQUMsS0FBSixDQUFVLElBQVYsR0FBaUIsSUFBakI7QUFFQSxXQUFPLHVEQUFXLEdBQVgsRUFBZ0IsR0FBRyxDQUFDLEtBQUosQ0FBVSxFQUExQixFQUNKLElBREksQ0FDRSxJQUFELElBQVU7QUFDZCxvQ0FBTyxJQUFQLDRDQUFPLElBQVAsRUFBNkIsSUFBN0I7QUFDRCxLQUhJLENBQVA7QUFJRDs7QUFZRCxFQUFBLFVBQVUsQ0FBQyxLQUFELEVBQVEsUUFBUixFQUFrQixJQUFsQixFQUF3QjtBQUNoQyxXQUFPLEtBQUssS0FBTCxDQUFXLE9BQVgsRUFBb0IsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLEdBQVIsR0FBYyxRQUFmLENBQXBDLEVBQThELElBQTlELEVBQ0osSUFESSxDQUNFLElBQUQsSUFBVTtBQUNkLFdBQUssTUFBTCxHQUFjLEtBQWQ7QUFDQSxhQUFPLElBQVA7QUFDRCxLQUpJLENBQVA7QUFLRDs7QUFXRCxFQUFBLFVBQVUsQ0FBQyxLQUFELEVBQVEsSUFBUixFQUFjO0FBQ3RCLFdBQU8sS0FBSyxLQUFMLENBQVcsT0FBWCxFQUFvQixLQUFwQixFQUEyQixJQUEzQixDQUFQO0FBQ0Q7O0FBWUQsRUFBQSxzQkFBc0IsQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixLQUFqQixFQUF3QjtBQUM1QyxXQUFPLEtBQUssS0FBTCxDQUFXLE9BQVgsRUFBb0IsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLEdBQVQsR0FBZSxNQUFmLEdBQXdCLEdBQXhCLEdBQThCLEtBQS9CLENBQXBDLENBQVA7QUFDRDs7QUFlRCxFQUFBLFlBQVksR0FBRztBQUNiLFFBQUksS0FBSyxVQUFMLElBQW9CLEtBQUssVUFBTCxDQUFnQixPQUFoQixDQUF3QixPQUF4QixLQUFvQyxJQUFJLENBQUMsR0FBTCxFQUE1RCxFQUF5RTtBQUN2RSxhQUFPLEtBQUssVUFBWjtBQUNELEtBRkQsTUFFTztBQUNMLFdBQUssVUFBTCxHQUFrQixJQUFsQjtBQUNEOztBQUNELFdBQU8sSUFBUDtBQUNEOztBQVFELEVBQUEsWUFBWSxDQUFDLEtBQUQsRUFBUTtBQUNsQixTQUFLLFVBQUwsR0FBa0IsS0FBbEI7QUFDRDs7QUE4Q0QsRUFBQSxTQUFTLENBQUMsU0FBRCxFQUFZLFNBQVosRUFBdUIsU0FBdkIsRUFBa0M7QUFDekMsVUFBTSxHQUFHLDBCQUFHLElBQUgsa0NBQUcsSUFBSCxFQUFvQixLQUFwQixFQUEyQixTQUEzQixDQUFUOztBQUNBLFFBQUksQ0FBQyxTQUFMLEVBQWdCO0FBQ2QsTUFBQSxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQWxCO0FBQ0Q7O0FBRUQsSUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLEdBQVIsR0FBYyxTQUFkOztBQUVBLFFBQUksU0FBSixFQUFlO0FBQ2IsVUFBSSxTQUFTLENBQUMsR0FBZCxFQUFtQjtBQUNqQixRQUFBLEdBQUcsQ0FBQyxHQUFKLENBQVEsR0FBUixDQUFZLEdBQVosR0FBa0IsU0FBUyxDQUFDLEdBQTVCO0FBQ0Q7O0FBRUQsVUFBSSxTQUFTLENBQUMsSUFBZCxFQUFvQjtBQUNsQixjQUFNLElBQUksR0FBRyxTQUFTLENBQUMsSUFBdkI7O0FBQ0EsWUFBSSxNQUFNLENBQUMsbUJBQVAsQ0FBMkIsU0FBM0IsQ0FBSixFQUEyQztBQUV6QyxVQUFBLEdBQUcsQ0FBQyxHQUFKLENBQVEsR0FBUixDQUFZLElBQVosR0FBbUIsSUFBbkI7QUFDRCxTQUhELE1BR08sSUFBSSxNQUFNLENBQUMsY0FBUCxDQUFzQixTQUF0QixLQUFvQyxJQUFJLENBQUMsTUFBN0MsRUFBcUQ7QUFFMUQsVUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLEdBQVIsQ0FBWSxJQUFaLEdBQW1CO0FBQ2pCLFlBQUEsTUFBTSxFQUFFLElBQUksQ0FBQztBQURJLFdBQW5CO0FBR0Q7QUFDRjs7QUFHRCxVQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBUyxDQUFDLFdBQXhCLEtBQXdDLFNBQVMsQ0FBQyxXQUFWLENBQXNCLE1BQXRCLEdBQStCLENBQTNFLEVBQThFO0FBQzVFLFFBQUEsR0FBRyxDQUFDLEtBQUosR0FBWTtBQUNWLFVBQUEsV0FBVyxFQUFFLFNBQVMsQ0FBQyxXQUFWLENBQXNCLE1BQXRCLENBQTZCLEdBQUcsSUFBSSxNQUFNLENBQUMsYUFBUCxDQUFxQixHQUFyQixDQUFwQztBQURILFNBQVo7QUFHRDs7QUFFRCxVQUFJLFNBQVMsQ0FBQyxJQUFkLEVBQW9CO0FBQ2xCLFFBQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxHQUFSLENBQVksSUFBWixHQUFtQixTQUFTLENBQUMsSUFBN0I7QUFDRDtBQUNGOztBQUNELGtDQUFPLElBQVAsc0JBQU8sSUFBUCxFQUFrQixHQUFsQixFQUF1QixHQUFHLENBQUMsR0FBSixDQUFRLEVBQS9CO0FBQ0Q7O0FBV0QsRUFBQSxLQUFLLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZTtBQUNsQixVQUFNLEdBQUcsMEJBQUcsSUFBSCxrQ0FBRyxJQUFILEVBQW9CLE9BQXBCLEVBQTZCLEtBQTdCLENBQVQ7O0FBQ0EsSUFBQSxHQUFHLENBQUMsS0FBSixDQUFVLEtBQVYsR0FBa0IsS0FBbEI7QUFFQSxrQ0FBTyxJQUFQLHNCQUFPLElBQVAsRUFBa0IsR0FBbEIsRUFBdUIsR0FBRyxDQUFDLEtBQUosQ0FBVSxFQUFqQztBQUNEOztBQVlELEVBQUEsYUFBYSxDQUFDLEtBQUQsRUFBUSxPQUFSLEVBQWlCLE1BQWpCLEVBQXlCO0FBQ3BDLFVBQU0sR0FBRywwQkFBRyxJQUFILGtDQUFHLElBQUgsRUFBb0IsS0FBcEIsRUFBMkIsS0FBM0IsQ0FBVDs7QUFFQSxRQUFJLEdBQUcsR0FBRyxPQUFPLE9BQVAsSUFBa0IsUUFBbEIsR0FBNkIsZ0JBQU8sS0FBUCxDQUFhLE9BQWIsQ0FBN0IsR0FBcUQsT0FBL0Q7O0FBQ0EsUUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBTyxXQUFQLENBQW1CLEdBQW5CLENBQVosRUFBcUM7QUFDbkMsTUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsR0FBZTtBQUNiLFFBQUEsSUFBSSxFQUFFLGdCQUFPLGNBQVA7QUFETyxPQUFmO0FBR0EsTUFBQSxPQUFPLEdBQUcsR0FBVjtBQUNEOztBQUNELElBQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxNQUFSLEdBQWlCLE1BQWpCO0FBQ0EsSUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLE9BQVIsR0FBa0IsT0FBbEI7QUFFQSxXQUFPLEdBQUcsQ0FBQyxHQUFYO0FBQ0Q7O0FBWUQsRUFBQSxPQUFPLENBQUMsS0FBRCxFQUFRLE9BQVIsRUFBaUIsTUFBakIsRUFBeUI7QUFDOUIsV0FBTyxLQUFLLGNBQUwsQ0FDTCxLQUFLLGFBQUwsQ0FBbUIsS0FBbkIsRUFBMEIsT0FBMUIsRUFBbUMsTUFBbkMsQ0FESyxDQUFQO0FBR0Q7O0FBV0QsRUFBQSxjQUFjLENBQUMsR0FBRCxFQUFNLFdBQU4sRUFBbUI7QUFFL0IsSUFBQSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEdBQWxCLENBQU47QUFDQSxJQUFBLEdBQUcsQ0FBQyxHQUFKLEdBQVUsU0FBVjtBQUNBLElBQUEsR0FBRyxDQUFDLElBQUosR0FBVyxTQUFYO0FBQ0EsSUFBQSxHQUFHLENBQUMsRUFBSixHQUFTLFNBQVQ7QUFDQSxVQUFNLEdBQUcsR0FBRztBQUNWLE1BQUEsR0FBRyxFQUFFO0FBREssS0FBWjs7QUFHQSxRQUFJLFdBQUosRUFBaUI7QUFDZixNQUFBLEdBQUcsQ0FBQyxLQUFKLEdBQVk7QUFDVixRQUFBLFdBQVcsRUFBRSxXQUFXLENBQUMsTUFBWixDQUFtQixHQUFHLElBQUksTUFBTSxDQUFDLGFBQVAsQ0FBcUIsR0FBckIsQ0FBMUI7QUFESCxPQUFaO0FBR0Q7O0FBQ0Qsa0NBQU8sSUFBUCxzQkFBTyxJQUFQLEVBQWtCLEdBQWxCLEVBQXVCLEdBQUcsQ0FBQyxFQUEzQjtBQUNEOztBQVdELEVBQUEsZUFBZSxDQUFDLElBQUQsRUFBTyxTQUFQLEVBQWtCLEdBQWxCLEVBQXVCLEdBQXZCLEVBQTRCO0FBQ3pDLFVBQU0sS0FBSywwQkFBRyxJQUFILDhCQUFHLElBQUgsRUFBa0IsT0FBbEIsRUFBMkIsU0FBM0IsQ0FBWDs7QUFDQSxRQUFJLEtBQUosRUFBVztBQUNULE1BQUEsS0FBSyxDQUFDLGVBQU4sQ0FBc0IsR0FBdEIsRUFBMkIsR0FBM0I7O0FBQ0EsV0FBSyxVQUFMLEdBQWtCLGVBQWxCLENBQWtDLEtBQWxDLEVBQXlDLEtBQXpDO0FBQ0Q7QUFDRjs7QUFxQ0QsRUFBQSxPQUFPLENBQUMsS0FBRCxFQUFRLE1BQVIsRUFBZ0I7QUFDckIsVUFBTSxHQUFHLDBCQUFHLElBQUgsa0NBQUcsSUFBSCxFQUFvQixLQUFwQixFQUEyQixLQUEzQixDQUFUOztBQUVBLElBQUEsR0FBRyxDQUFDLEdBQUosR0FBVSxxQkFBUyxHQUFHLENBQUMsR0FBYixFQUFrQixNQUFsQixDQUFWO0FBRUEsa0NBQU8sSUFBUCxzQkFBTyxJQUFQLEVBQWtCLEdBQWxCLEVBQXVCLEdBQUcsQ0FBQyxHQUFKLENBQVEsRUFBL0I7QUFDRDs7QUFVRCxFQUFBLE9BQU8sQ0FBQyxLQUFELEVBQVEsTUFBUixFQUFnQjtBQUNyQixVQUFNLEdBQUcsMEJBQUcsSUFBSCxrQ0FBRyxJQUFILEVBQW9CLEtBQXBCLEVBQTJCLEtBQTNCLENBQVQ7O0FBQ0EsVUFBTSxJQUFJLEdBQUcsRUFBYjs7QUFFQSxRQUFJLE1BQUosRUFBWTtBQUNWLE9BQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsTUFBaEIsRUFBd0IsTUFBeEIsRUFBZ0MsT0FBaEMsQ0FBd0MsVUFBUyxHQUFULEVBQWM7QUFDcEQsWUFBSSxNQUFNLENBQUMsY0FBUCxDQUFzQixHQUF0QixDQUFKLEVBQWdDO0FBQzlCLFVBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWO0FBQ0EsVUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLEdBQVIsSUFBZSxNQUFNLENBQUMsR0FBRCxDQUFyQjtBQUNEO0FBQ0YsT0FMRDs7QUFPQSxVQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsTUFBTSxDQUFDLFdBQXJCLEtBQXFDLE1BQU0sQ0FBQyxXQUFQLENBQW1CLE1BQW5CLEdBQTRCLENBQXJFLEVBQXdFO0FBQ3RFLFFBQUEsR0FBRyxDQUFDLEtBQUosR0FBWTtBQUNWLFVBQUEsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFQLENBQW1CLE1BQW5CLENBQTBCLEdBQUcsSUFBSSxNQUFNLENBQUMsYUFBUCxDQUFxQixHQUFyQixDQUFqQztBQURILFNBQVo7QUFHRDtBQUNGOztBQUVELFFBQUksSUFBSSxDQUFDLE1BQUwsSUFBZSxDQUFuQixFQUFzQjtBQUNwQixhQUFPLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBSSxLQUFKLENBQVUsMEJBQVYsQ0FBZixDQUFQO0FBQ0Q7O0FBRUQsa0NBQU8sSUFBUCxzQkFBTyxJQUFQLEVBQWtCLEdBQWxCLEVBQXVCLEdBQUcsQ0FBQyxHQUFKLENBQVEsRUFBL0I7QUFDRDs7QUFxQkQsRUFBQSxXQUFXLENBQUMsS0FBRCxFQUFRLE1BQVIsRUFBZ0IsSUFBaEIsRUFBc0I7QUFDL0IsVUFBTSxHQUFHLDBCQUFHLElBQUgsa0NBQUcsSUFBSCxFQUFvQixLQUFwQixFQUEyQixLQUEzQixDQUFUOztBQUVBLElBQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEdBQWUsS0FBZjtBQUNBLElBQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxNQUFSLEdBQWlCLE1BQWpCO0FBQ0EsSUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsR0FBZSxJQUFmO0FBRUEsa0NBQU8sSUFBUCxzQkFBTyxJQUFQLEVBQWtCLEdBQWxCLEVBQXVCLEdBQUcsQ0FBQyxHQUFKLENBQVEsRUFBL0I7QUFDRDs7QUFVRCxFQUFBLFFBQVEsQ0FBQyxTQUFELEVBQVksSUFBWixFQUFrQjtBQUN4QixVQUFNLEdBQUcsMEJBQUcsSUFBSCxrQ0FBRyxJQUFILEVBQW9CLEtBQXBCLEVBQTJCLFNBQTNCLENBQVQ7O0FBQ0EsSUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsR0FBZSxPQUFmO0FBQ0EsSUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsR0FBZSxJQUFmO0FBRUEsa0NBQU8sSUFBUCxzQkFBTyxJQUFQLEVBQWtCLEdBQWxCLEVBQXVCLEdBQUcsQ0FBQyxHQUFKLENBQVEsRUFBL0I7QUFDRDs7QUFVRCxFQUFBLGVBQWUsQ0FBQyxTQUFELEVBQVksSUFBWixFQUFrQjtBQUMvQixVQUFNLEdBQUcsMEJBQUcsSUFBSCxrQ0FBRyxJQUFILEVBQW9CLEtBQXBCLEVBQTJCLFNBQTNCLENBQVQ7O0FBQ0EsSUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsR0FBZSxLQUFmO0FBQ0EsSUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsR0FBZSxJQUFmO0FBRUEsa0NBQU8sSUFBUCxzQkFBTyxJQUFQLEVBQWtCLEdBQWxCLEVBQXVCLEdBQUcsQ0FBQyxHQUFKLENBQVEsRUFBL0I7QUFDRDs7QUFVRCxFQUFBLGFBQWEsQ0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQjtBQUMzQixVQUFNLEdBQUcsMEJBQUcsSUFBSCxrQ0FBRyxJQUFILEVBQW9CLEtBQXBCLEVBQTJCLEtBQUssQ0FBQyxRQUFqQyxDQUFUOztBQUNBLElBQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEdBQWUsTUFBZjtBQUNBLElBQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEdBQWU7QUFDYixNQUFBLElBQUksRUFBRSxNQURPO0FBRWIsTUFBQSxHQUFHLEVBQUU7QUFGUSxLQUFmO0FBS0Esa0NBQU8sSUFBUCxzQkFBTyxJQUFQLEVBQWtCLEdBQWxCLEVBQXVCLEdBQUcsQ0FBQyxHQUFKLENBQVEsRUFBL0I7QUFDRDs7QUFTRCxFQUFBLGNBQWMsQ0FBQyxJQUFELEVBQU87QUFDbkIsVUFBTSxHQUFHLDBCQUFHLElBQUgsa0NBQUcsSUFBSCxFQUFvQixLQUFwQixFQUEyQixJQUEzQixDQUFUOztBQUNBLElBQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEdBQWUsTUFBZjtBQUNBLElBQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEdBQWUsSUFBZjtBQUVBLFdBQU8sdURBQVcsR0FBWCxFQUFnQixHQUFHLENBQUMsR0FBSixDQUFRLEVBQXhCLEVBQTRCLElBQTVCLENBQWtDLElBQUQsSUFBVTtBQUNoRCxXQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0QsS0FGTSxDQUFQO0FBR0Q7O0FBVUQsRUFBQSxJQUFJLENBQUMsU0FBRCxFQUFZLElBQVosRUFBa0IsR0FBbEIsRUFBdUI7QUFDekIsUUFBSSxHQUFHLElBQUksQ0FBUCxJQUFZLEdBQUcsSUFBSSxLQUFLLENBQUMsV0FBN0IsRUFBMEM7QUFDeEMsWUFBTSxJQUFJLEtBQUosOEJBQWdDLEdBQWhDLEVBQU47QUFDRDs7QUFFRCxVQUFNLEdBQUcsMEJBQUcsSUFBSCxrQ0FBRyxJQUFILEVBQW9CLE1BQXBCLEVBQTRCLFNBQTVCLENBQVQ7O0FBQ0EsSUFBQSxHQUFHLENBQUMsSUFBSixDQUFTLElBQVQsR0FBZ0IsSUFBaEI7QUFDQSxJQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsR0FBVCxHQUFlLEdBQWY7O0FBQ0EsMkRBQVcsR0FBWDtBQUNEOztBQVNELEVBQUEsWUFBWSxDQUFDLFNBQUQsRUFBWTtBQUN0QixVQUFNLEdBQUcsMEJBQUcsSUFBSCxrQ0FBRyxJQUFILEVBQW9CLE1BQXBCLEVBQTRCLFNBQTVCLENBQVQ7O0FBQ0EsSUFBQSxHQUFHLENBQUMsSUFBSixDQUFTLElBQVQsR0FBZ0IsSUFBaEI7O0FBQ0EsMkRBQVcsR0FBWDtBQUNEOztBQVVELEVBQUEsUUFBUSxDQUFDLFNBQUQsRUFBWTtBQUNsQixRQUFJLEtBQUssMEJBQUcsSUFBSCw4QkFBRyxJQUFILEVBQWtCLE9BQWxCLEVBQTJCLFNBQTNCLENBQVQ7O0FBQ0EsUUFBSSxDQUFDLEtBQUQsSUFBVSxTQUFkLEVBQXlCO0FBQ3ZCLFVBQUksU0FBUyxJQUFJLEtBQUssQ0FBQyxRQUF2QixFQUFpQztBQUMvQixRQUFBLEtBQUssR0FBRyxJQUFJLGNBQUosRUFBUjtBQUNELE9BRkQsTUFFTyxJQUFJLFNBQVMsSUFBSSxLQUFLLENBQUMsU0FBdkIsRUFBa0M7QUFDdkMsUUFBQSxLQUFLLEdBQUcsSUFBSSxlQUFKLEVBQVI7QUFDRCxPQUZNLE1BRUE7QUFDTCxRQUFBLEtBQUssR0FBRyxJQUFJLFlBQUosQ0FBVSxTQUFWLENBQVI7QUFDRDs7QUFFRCx5RkFBeUIsS0FBekI7O0FBQ0EsTUFBQSxLQUFLLENBQUMsYUFBTjtBQUVEOztBQUNELFdBQU8sS0FBUDtBQUNEOztBQVNELEVBQUEsYUFBYSxDQUFDLFNBQUQsRUFBWTtBQUN2QixrQ0FBTyxJQUFQLDhCQUFPLElBQVAsRUFBc0IsT0FBdEIsRUFBK0IsU0FBL0I7QUFDRDs7QUFRRCxFQUFBLGFBQWEsQ0FBQyxTQUFELEVBQVk7QUFDdkIsbUVBQWUsT0FBZixFQUF3QixTQUF4QjtBQUNEOztBQVNELEVBQUEsU0FBUyxDQUFDLElBQUQsRUFBTyxPQUFQLEVBQWdCO0FBQ3ZCLG1FQUFlLE9BQWYsRUFBd0IsSUFBeEIsRUFBOEIsT0FBOUI7QUFDRDs7QUFTRCxFQUFBLGFBQWEsQ0FBQyxTQUFELEVBQVk7QUFDdkIsV0FBTyxDQUFDLHdCQUFDLElBQUQsOEJBQUMsSUFBRCxFQUFnQixPQUFoQixFQUF5QixTQUF6QixDQUFSO0FBQ0Q7O0FBU0QsRUFBQSxpQkFBaUIsQ0FBQyxNQUFELEVBQVM7QUFDeEIsV0FBTyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsY0FBVCxHQUEwQixLQUFLLENBQUMsU0FBdkMsSUFBb0QsS0FBSyxlQUFMLEVBQTNEO0FBQ0Q7O0FBUUQsRUFBQSxVQUFVLEdBQUc7QUFDWCxXQUFPLEtBQUssUUFBTCxDQUFjLEtBQUssQ0FBQyxRQUFwQixDQUFQO0FBQ0Q7O0FBUUQsRUFBQSxXQUFXLEdBQUc7QUFDWixXQUFPLEtBQUssUUFBTCxDQUFjLEtBQUssQ0FBQyxTQUFwQixDQUFQO0FBQ0Q7O0FBUUQsRUFBQSxrQkFBa0IsR0FBRztBQUNuQixXQUFPLElBQUksa0JBQUosQ0FBb0IsSUFBcEIsRUFBMEIsS0FBSyxDQUFDLGdCQUFoQyxDQUFQO0FBQ0Q7O0FBT0QsRUFBQSxnQkFBZ0IsR0FBRztBQUNqQixXQUFPLEtBQUssTUFBWjtBQUNEOztBQVFELEVBQUEsSUFBSSxDQUFDLEdBQUQsRUFBTTtBQUNSLFdBQU8sS0FBSyxNQUFMLEtBQWdCLEdBQXZCO0FBQ0Q7O0FBT0QsRUFBQSxlQUFlLEdBQUc7QUFDaEIsV0FBTyxLQUFLLE1BQVo7QUFDRDs7QUFPRCxFQUFBLGFBQWEsR0FBRztBQUNkLFdBQU8sS0FBSyxXQUFaO0FBQ0Q7O0FBU0QsRUFBQSxjQUFjLENBQUMsSUFBRCxFQUFPLFlBQVAsRUFBcUI7QUFDakMsV0FBTyxDQUFDLEtBQUssV0FBTCxHQUFtQixLQUFLLFdBQUwsQ0FBaUIsSUFBakIsQ0FBbkIsR0FBNEMsSUFBN0MsS0FBc0QsWUFBN0Q7QUFDRDs7QUFRRCxFQUFBLGFBQWEsQ0FBQyxPQUFELEVBQVUsZUFBVixFQUEyQjtBQUN0QyxTQUFLLGVBQUwsR0FBdUIsT0FBdkI7QUFDQSxTQUFLLGdCQUFMLEdBQXdCLE9BQU8sSUFBSSxlQUFuQztBQUNEOztBQVFELEVBQUEsZ0JBQWdCLENBQUMsRUFBRCxFQUFLO0FBQ25CLFFBQUksRUFBSixFQUFRO0FBQ04sV0FBSyxjQUFMLEdBQXNCLEVBQXRCO0FBQ0Q7QUFDRjs7QUFTRCxFQUFBLGFBQWEsQ0FBQyxJQUFELEVBQU87QUFDbEIsVUFBTSxLQUFLLDBCQUFHLElBQUgsOEJBQUcsSUFBSCxFQUFrQixPQUFsQixFQUEyQixJQUEzQixDQUFYOztBQUNBLFdBQU8sS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUF0QjtBQUNEOztBQVNELEVBQUEsa0JBQWtCLENBQUMsSUFBRCxFQUFPO0FBQ3ZCLFVBQU0sS0FBSywwQkFBRyxJQUFILDhCQUFHLElBQUgsRUFBa0IsT0FBbEIsRUFBMkIsSUFBM0IsQ0FBWDs7QUFDQSxXQUFPLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBVCxHQUFlLElBQTNCO0FBQ0Q7O0FBVUQsRUFBQSxPQUFPLENBQUMsTUFBRCxFQUFTO0FBQ2QsUUFBSSxNQUFKLEVBQVk7QUFDVixXQUFLLFVBQUwsR0FBa0IsSUFBSSxDQUFDLEtBQUwsQ0FBWSxJQUFJLENBQUMsTUFBTCxLQUFnQixRQUFqQixHQUE2QixRQUF4QyxDQUFsQjtBQUNELEtBRkQsTUFFTztBQUNMLFdBQUssVUFBTCxHQUFrQixDQUFsQjtBQUNEO0FBQ0Y7O0FBanlEaUI7Ozs7a0JBc0tWLEcsRUFBYztBQUNwQixNQUFJLEtBQUssZUFBVCxFQUEwQjtBQUN4QixVQUFNLENBQUMsR0FBRyxJQUFJLElBQUosRUFBVjtBQUNBLFVBQU0sVUFBVSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBRixFQUFQLEVBQXdCLEtBQXhCLENBQThCLENBQUMsQ0FBL0IsSUFBb0MsR0FBcEMsR0FDakIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxhQUFGLEVBQVAsRUFBMEIsS0FBMUIsQ0FBZ0MsQ0FBQyxDQUFqQyxDQURpQixHQUNxQixHQURyQixHQUVqQixDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQUYsRUFBUCxFQUEwQixLQUExQixDQUFnQyxDQUFDLENBQWpDLENBRmlCLEdBRXFCLEdBRnJCLEdBR2pCLENBQUMsT0FBTyxDQUFDLENBQUMsa0JBQUYsRUFBUixFQUFnQyxLQUFoQyxDQUFzQyxDQUFDLENBQXZDLENBSEY7O0FBRndCLHVDQURaLElBQ1k7QUFEWixNQUFBLElBQ1k7QUFBQTs7QUFPeEIsSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLE1BQU0sVUFBTixHQUFtQixHQUEvQixFQUFvQyxHQUFwQyxFQUF5QyxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsQ0FBekM7QUFDRDtBQUNGOzt1QkFHWSxFLEVBQUk7QUFDZixNQUFJLE9BQU8sR0FBRyxJQUFkOztBQUNBLE1BQUksRUFBSixFQUFRO0FBQ04sSUFBQSxPQUFPLEdBQUcsSUFBSSxPQUFKLENBQVksQ0FBQyxPQUFELEVBQVUsTUFBVixLQUFxQjtBQUV6QyxXQUFLLGdCQUFMLENBQXNCLEVBQXRCLElBQTRCO0FBQzFCLG1CQUFXLE9BRGU7QUFFMUIsa0JBQVUsTUFGZ0I7QUFHMUIsY0FBTSxJQUFJLElBQUo7QUFIb0IsT0FBNUI7QUFLRCxLQVBTLENBQVY7QUFRRDs7QUFDRCxTQUFPLE9BQVA7QUFDRDs7dUJBSVksRSxFQUFJLEksRUFBTSxJLEVBQU0sUyxFQUFXO0FBQ3RDLFFBQU0sU0FBUyxHQUFHLEtBQUssZ0JBQUwsQ0FBc0IsRUFBdEIsQ0FBbEI7O0FBQ0EsTUFBSSxTQUFKLEVBQWU7QUFDYixXQUFPLEtBQUssZ0JBQUwsQ0FBc0IsRUFBdEIsQ0FBUDs7QUFDQSxRQUFJLElBQUksSUFBSSxHQUFSLElBQWUsSUFBSSxHQUFHLEdBQTFCLEVBQStCO0FBQzdCLFVBQUksU0FBUyxDQUFDLE9BQWQsRUFBdUI7QUFDckIsUUFBQSxTQUFTLENBQUMsT0FBVixDQUFrQixJQUFsQjtBQUNEO0FBQ0YsS0FKRCxNQUlPLElBQUksU0FBUyxDQUFDLE1BQWQsRUFBc0I7QUFDM0IsTUFBQSxTQUFTLENBQUMsTUFBVixDQUFpQixJQUFJLEtBQUosV0FBYSxTQUFiLGVBQTJCLElBQTNCLE9BQWpCO0FBQ0Q7QUFDRjtBQUNGOztnQkFHSyxHLEVBQUssRSxFQUFJO0FBQ2IsTUFBSSxPQUFKOztBQUNBLE1BQUksRUFBSixFQUFRO0FBQ04sSUFBQSxPQUFPLDBCQUFHLElBQUgsb0NBQUcsSUFBSCxFQUFxQixFQUFyQixDQUFQO0FBQ0Q7O0FBQ0QsRUFBQSxHQUFHLEdBQUcscUJBQVMsR0FBVCxDQUFOO0FBQ0EsTUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQUwsQ0FBZSxHQUFmLENBQVY7O0FBQ0EsNkRBQWEsV0FBVyxLQUFLLGdCQUFMLEdBQXdCLElBQUksQ0FBQyxTQUFMLENBQWUsR0FBZixFQUFvQixnQkFBcEIsQ0FBeEIsR0FBZ0UsR0FBM0UsQ0FBYjs7QUFDQSxNQUFJO0FBQ0YsU0FBSyxXQUFMLENBQWlCLFFBQWpCLENBQTBCLEdBQTFCO0FBQ0QsR0FGRCxDQUVFLE9BQU8sR0FBUCxFQUFZO0FBRVosUUFBSSxFQUFKLEVBQVE7QUFDTiwyRUFBa0IsRUFBbEIsRUFBc0Isb0JBQVcsYUFBakMsRUFBZ0QsSUFBaEQsRUFBc0QsR0FBRyxDQUFDLE9BQTFEO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsWUFBTSxHQUFOO0FBQ0Q7QUFDRjs7QUFDRCxTQUFPLE9BQVA7QUFDRDs7MkJBR2dCLEksRUFBTTtBQUVyQixNQUFJLENBQUMsSUFBTCxFQUNFO0FBRUYsT0FBSyxjQUFMOztBQUdBLE1BQUksS0FBSyxZQUFULEVBQXVCO0FBQ3JCLFNBQUssWUFBTCxDQUFrQixJQUFsQjtBQUNEOztBQUVELE1BQUksSUFBSSxLQUFLLEdBQWIsRUFBa0I7QUFFaEIsUUFBSSxLQUFLLGNBQVQsRUFBeUI7QUFDdkIsV0FBSyxjQUFMO0FBQ0Q7O0FBRUQ7QUFDRDs7QUFFRCxNQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsRUFBaUIsc0JBQWpCLENBQVY7O0FBQ0EsTUFBSSxDQUFDLEdBQUwsRUFBVTtBQUNSLCtEQUFhLFNBQVMsSUFBdEI7O0FBQ0EsK0RBQWEsNkJBQWI7QUFDRCxHQUhELE1BR087QUFDTCwrREFBYSxVQUFVLEtBQUssZ0JBQUwsR0FBd0IsSUFBSSxDQUFDLFNBQUwsQ0FBZSxHQUFmLEVBQW9CLGdCQUFwQixDQUF4QixHQUFnRSxJQUExRSxDQUFiOztBQUdBLFFBQUksS0FBSyxTQUFULEVBQW9CO0FBQ2xCLFdBQUssU0FBTCxDQUFlLEdBQWY7QUFDRDs7QUFFRCxRQUFJLEdBQUcsQ0FBQyxJQUFSLEVBQWM7QUFFWixVQUFJLEtBQUssYUFBVCxFQUF3QjtBQUN0QixhQUFLLGFBQUwsQ0FBbUIsR0FBRyxDQUFDLElBQXZCO0FBQ0Q7O0FBR0QsVUFBSSxHQUFHLENBQUMsSUFBSixDQUFTLEVBQWIsRUFBaUI7QUFDZiw2RUFBa0IsR0FBRyxDQUFDLElBQUosQ0FBUyxFQUEzQixFQUErQixHQUFHLENBQUMsSUFBSixDQUFTLElBQXhDLEVBQThDLEdBQUcsQ0FBQyxJQUFsRCxFQUF3RCxHQUFHLENBQUMsSUFBSixDQUFTLElBQWpFO0FBQ0Q7O0FBQ0QsTUFBQSxVQUFVLENBQUMsTUFBTTtBQUNmLFlBQUksR0FBRyxDQUFDLElBQUosQ0FBUyxJQUFULElBQWlCLEdBQWpCLElBQXdCLEdBQUcsQ0FBQyxJQUFKLENBQVMsSUFBVCxJQUFpQixTQUE3QyxFQUF3RDtBQUV0RCxnQkFBTSxLQUFLLDBCQUFHLElBQUgsOEJBQUcsSUFBSCxFQUFrQixPQUFsQixFQUEyQixHQUFHLENBQUMsSUFBSixDQUFTLEtBQXBDLENBQVg7O0FBQ0EsY0FBSSxLQUFKLEVBQVc7QUFDVCxZQUFBLEtBQUssQ0FBQyxTQUFOOztBQUNBLGdCQUFJLEdBQUcsQ0FBQyxJQUFKLENBQVMsTUFBVCxJQUFtQixHQUFHLENBQUMsSUFBSixDQUFTLE1BQVQsQ0FBZ0IsS0FBdkMsRUFBOEM7QUFDNUMsY0FBQSxLQUFLLENBQUMsS0FBTjtBQUNEO0FBQ0Y7QUFDRixTQVRELE1BU08sSUFBSSxHQUFHLENBQUMsSUFBSixDQUFTLElBQVQsR0FBZ0IsR0FBaEIsSUFBdUIsR0FBRyxDQUFDLElBQUosQ0FBUyxNQUFwQyxFQUE0QztBQUNqRCxjQUFJLEdBQUcsQ0FBQyxJQUFKLENBQVMsTUFBVCxDQUFnQixJQUFoQixJQUF3QixNQUE1QixFQUFvQztBQUVsQyxrQkFBTSxLQUFLLDBCQUFHLElBQUgsOEJBQUcsSUFBSCxFQUFrQixPQUFsQixFQUEyQixHQUFHLENBQUMsSUFBSixDQUFTLEtBQXBDLENBQVg7O0FBQ0EsZ0JBQUksS0FBSixFQUFXO0FBQ1QsY0FBQSxLQUFLLENBQUMsb0JBQU4sQ0FBMkIsR0FBRyxDQUFDLElBQUosQ0FBUyxNQUFULENBQWdCLEtBQTNDO0FBQ0Q7QUFDRixXQU5ELE1BTU8sSUFBSSxHQUFHLENBQUMsSUFBSixDQUFTLE1BQVQsQ0FBZ0IsSUFBaEIsSUFBd0IsS0FBNUIsRUFBbUM7QUFFeEMsa0JBQU0sS0FBSywwQkFBRyxJQUFILDhCQUFHLElBQUgsRUFBa0IsT0FBbEIsRUFBMkIsR0FBRyxDQUFDLElBQUosQ0FBUyxLQUFwQyxDQUFYOztBQUNBLGdCQUFJLEtBQUosRUFBVztBQUVULGNBQUEsS0FBSyxDQUFDLGVBQU4sQ0FBc0IsRUFBdEI7QUFDRDtBQUNGO0FBQ0Y7QUFDRixPQTFCUyxFQTBCUCxDQTFCTyxDQUFWO0FBMkJELEtBckNELE1BcUNPO0FBQ0wsTUFBQSxVQUFVLENBQUMsTUFBTTtBQUNmLFlBQUksR0FBRyxDQUFDLElBQVIsRUFBYztBQUdaLGdCQUFNLEtBQUssMEJBQUcsSUFBSCw4QkFBRyxJQUFILEVBQWtCLE9BQWxCLEVBQTJCLEdBQUcsQ0FBQyxJQUFKLENBQVMsS0FBcEMsQ0FBWDs7QUFDQSxjQUFJLEtBQUosRUFBVztBQUNULFlBQUEsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsR0FBRyxDQUFDLElBQXJCO0FBQ0Q7O0FBRUQsY0FBSSxHQUFHLENBQUMsSUFBSixDQUFTLEVBQWIsRUFBaUI7QUFDZixpRkFBa0IsR0FBRyxDQUFDLElBQUosQ0FBUyxFQUEzQixFQUErQixHQUEvQixFQUFvQyxHQUFHLENBQUMsSUFBeEMsRUFBOEMsTUFBOUM7QUFDRDs7QUFHRCxjQUFJLEtBQUssYUFBVCxFQUF3QjtBQUN0QixpQkFBSyxhQUFMLENBQW1CLEdBQUcsQ0FBQyxJQUF2QjtBQUNEO0FBQ0YsU0FoQkQsTUFnQk8sSUFBSSxHQUFHLENBQUMsSUFBUixFQUFjO0FBR25CLGdCQUFNLEtBQUssMEJBQUcsSUFBSCw4QkFBRyxJQUFILEVBQWtCLE9BQWxCLEVBQTJCLEdBQUcsQ0FBQyxJQUFKLENBQVMsS0FBcEMsQ0FBWDs7QUFDQSxjQUFJLEtBQUosRUFBVztBQUNULFlBQUEsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsR0FBRyxDQUFDLElBQXJCO0FBQ0Q7O0FBR0QsY0FBSSxLQUFLLGFBQVQsRUFBd0I7QUFDdEIsaUJBQUssYUFBTCxDQUFtQixHQUFHLENBQUMsSUFBdkI7QUFDRDtBQUNGLFNBWk0sTUFZQSxJQUFJLEdBQUcsQ0FBQyxJQUFSLEVBQWM7QUFHbkIsZ0JBQU0sS0FBSywwQkFBRyxJQUFILDhCQUFHLElBQUgsRUFBa0IsT0FBbEIsRUFBMkIsR0FBRyxDQUFDLElBQUosQ0FBUyxLQUFwQyxDQUFYOztBQUNBLGNBQUksS0FBSixFQUFXO0FBQ1QsWUFBQSxLQUFLLENBQUMsVUFBTixDQUFpQixHQUFHLENBQUMsSUFBckI7QUFDRDs7QUFHRCxjQUFJLEtBQUssYUFBVCxFQUF3QjtBQUN0QixpQkFBSyxhQUFMLENBQW1CLEdBQUcsQ0FBQyxJQUF2QjtBQUNEO0FBQ0YsU0FaTSxNQVlBLElBQUksR0FBRyxDQUFDLElBQVIsRUFBYztBQUduQixnQkFBTSxLQUFLLDBCQUFHLElBQUgsOEJBQUcsSUFBSCxFQUFrQixPQUFsQixFQUEyQixHQUFHLENBQUMsSUFBSixDQUFTLEtBQXBDLENBQVg7O0FBQ0EsY0FBSSxLQUFKLEVBQVc7QUFDVCxZQUFBLEtBQUssQ0FBQyxVQUFOLENBQWlCLEdBQUcsQ0FBQyxJQUFyQjtBQUNEOztBQUdELGNBQUksS0FBSyxhQUFULEVBQXdCO0FBQ3RCLGlCQUFLLGFBQUwsQ0FBbUIsR0FBRyxDQUFDLElBQXZCO0FBQ0Q7QUFDRixTQVpNLE1BWUE7QUFDTCxxRUFBYSxpQ0FBYjtBQUNEO0FBQ0YsT0F4RFMsRUF3RFAsQ0F4RE8sQ0FBVjtBQXlERDtBQUNGO0FBQ0Y7OzRCQUdpQjtBQUNoQixNQUFJLENBQUMsS0FBSyxlQUFWLEVBQTJCO0FBRXpCLFNBQUssZUFBTCxHQUF1QixXQUFXLENBQUMsTUFBTTtBQUN2QyxZQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUosQ0FBVSxlQUFWLENBQVo7QUFDQSxZQUFNLE9BQU8sR0FBRyxJQUFJLElBQUosQ0FBUyxJQUFJLElBQUosR0FBVyxPQUFYLEtBQXVCLEtBQUssQ0FBQyx1QkFBdEMsQ0FBaEI7O0FBQ0EsV0FBSyxJQUFJLEVBQVQsSUFBZSxLQUFLLGdCQUFwQixFQUFzQztBQUNwQyxZQUFJLFNBQVMsR0FBRyxLQUFLLGdCQUFMLENBQXNCLEVBQXRCLENBQWhCOztBQUNBLFlBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxFQUFWLEdBQWUsT0FBaEMsRUFBeUM7QUFDdkMscUVBQWEsaUJBQWIsRUFBZ0MsRUFBaEM7O0FBQ0EsaUJBQU8sS0FBSyxnQkFBTCxDQUFzQixFQUF0QixDQUFQOztBQUNBLGNBQUksU0FBUyxDQUFDLE1BQWQsRUFBc0I7QUFDcEIsWUFBQSxTQUFTLENBQUMsTUFBVixDQUFpQixHQUFqQjtBQUNEO0FBQ0Y7QUFDRjtBQUNGLEtBYmlDLEVBYS9CLEtBQUssQ0FBQyxzQkFieUIsQ0FBbEM7QUFjRDs7QUFDRCxPQUFLLEtBQUw7QUFDRDs7d0JBRWEsRyxFQUFLLEksRUFBTTtBQUN2QixPQUFLLGNBQUwsR0FBc0IsQ0FBdEI7QUFDQSxPQUFLLFdBQUwsR0FBbUIsSUFBbkI7QUFDQSxPQUFLLGNBQUwsR0FBc0IsS0FBdEI7O0FBRUEsTUFBSSxLQUFLLGVBQVQsRUFBMEI7QUFDeEIsSUFBQSxhQUFhLENBQUMsS0FBSyxlQUFOLENBQWI7QUFDQSxTQUFLLGVBQUwsR0FBdUIsSUFBdkI7QUFDRDs7QUFHRCxpRUFBZSxPQUFmLEVBQXdCLENBQUMsS0FBRCxFQUFRLEdBQVIsS0FBZ0I7QUFDdEMsSUFBQSxLQUFLLENBQUMsU0FBTjtBQUNELEdBRkQ7O0FBS0EsT0FBSyxJQUFJLEdBQVQsSUFBZ0IsS0FBSyxnQkFBckIsRUFBdUM7QUFDckMsVUFBTSxTQUFTLEdBQUcsS0FBSyxnQkFBTCxDQUFzQixHQUF0QixDQUFsQjs7QUFDQSxRQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsTUFBM0IsRUFBbUM7QUFDakMsTUFBQSxTQUFTLENBQUMsTUFBVixDQUFpQixHQUFqQjtBQUNEO0FBQ0Y7O0FBQ0QsT0FBSyxnQkFBTCxHQUF3QixFQUF4Qjs7QUFFQSxNQUFJLEtBQUssWUFBVCxFQUF1QjtBQUNyQixTQUFLLFlBQUwsQ0FBa0IsR0FBbEI7QUFDRDtBQUNGOzswQkFHZTtBQUNkLFNBQU8sS0FBSyxRQUFMLEdBQWdCLElBQWhCLElBQXdCLEtBQUssUUFBTCxHQUFnQixLQUFLLFFBQUwsR0FBZ0IsSUFBaEMsR0FBdUMsRUFBL0QsSUFBcUUsS0FBSyxLQUExRSxHQUFrRixLQUFsRixHQUEwRixLQUFLLENBQUMsT0FBdkc7QUFDRDs7c0JBR1csSSxFQUFNLEssRUFBTztBQUN2QixVQUFRLElBQVI7QUFDRSxTQUFLLElBQUw7QUFDRSxhQUFPO0FBQ0wsY0FBTTtBQUNKLGdCQUFNLEtBQUssZUFBTCxFQURGO0FBRUosaUJBQU8sS0FBSyxDQUFDLE9BRlQ7QUFHSix1Q0FBTSxJQUFOLHNDQUFNLElBQU4sQ0FISTtBQUlKLGlCQUFPLEtBQUssWUFKUjtBQUtKLGtCQUFRLEtBQUssY0FMVDtBQU1KLG1CQUFTLEtBQUs7QUFOVjtBQURELE9BQVA7O0FBV0YsU0FBSyxLQUFMO0FBQ0UsYUFBTztBQUNMLGVBQU87QUFDTCxnQkFBTSxLQUFLLGVBQUwsRUFERDtBQUVMLGtCQUFRLElBRkg7QUFHTCxvQkFBVSxJQUhMO0FBSUwsb0JBQVUsSUFKTDtBQUtMLG1CQUFTLEtBTEo7QUFNTCxrQkFBUSxJQU5IO0FBT0wsa0JBQVEsRUFQSDtBQVFMLGtCQUFRO0FBUkg7QUFERixPQUFQOztBQWFGLFNBQUssT0FBTDtBQUNFLGFBQU87QUFDTCxpQkFBUztBQUNQLGdCQUFNLEtBQUssZUFBTCxFQURDO0FBRVAsb0JBQVUsSUFGSDtBQUdQLG9CQUFVO0FBSEg7QUFESixPQUFQOztBQVFGLFNBQUssS0FBTDtBQUNFLGFBQU87QUFDTCxlQUFPO0FBQ0wsZ0JBQU0sS0FBSyxlQUFMLEVBREQ7QUFFTCxtQkFBUyxLQUZKO0FBR0wsaUJBQU8sRUFIRjtBQUlMLGlCQUFPO0FBSkY7QUFERixPQUFQOztBQVNGLFNBQUssT0FBTDtBQUNFLGFBQU87QUFDTCxpQkFBUztBQUNQLGdCQUFNLEtBQUssZUFBTCxFQURDO0FBRVAsbUJBQVMsS0FGRjtBQUdQLG1CQUFTO0FBSEY7QUFESixPQUFQOztBQVFGLFNBQUssS0FBTDtBQUNFLGFBQU87QUFDTCxlQUFPO0FBQ0wsZ0JBQU0sS0FBSyxlQUFMLEVBREQ7QUFFTCxtQkFBUyxLQUZKO0FBR0wsb0JBQVUsS0FITDtBQUlMLGtCQUFRLElBSkg7QUFLTCxxQkFBVztBQUxOO0FBREYsT0FBUDs7QUFVRixTQUFLLEtBQUw7QUFDRSxhQUFPO0FBQ0wsZUFBTztBQUNMLGdCQUFNLEtBQUssZUFBTCxFQUREO0FBRUwsbUJBQVMsS0FGSjtBQUdMLGtCQUFRLElBSEg7QUFJTCxrQkFBUSxFQUpIO0FBS0wsaUJBQU8sRUFMRjtBQU1MLGtCQUFRO0FBTkg7QUFERixPQUFQOztBQVdGLFNBQUssS0FBTDtBQUNFLGFBQU87QUFDTCxlQUFPO0FBQ0wsZ0JBQU0sS0FBSyxlQUFMLEVBREQ7QUFFTCxtQkFBUyxLQUZKO0FBR0wsa0JBQVEsRUFISDtBQUlMLGlCQUFPLEVBSkY7QUFLTCxrQkFBUTtBQUxIO0FBREYsT0FBUDs7QUFVRixTQUFLLEtBQUw7QUFDRSxhQUFPO0FBQ0wsZUFBTztBQUNMLGdCQUFNLEtBQUssZUFBTCxFQUREO0FBRUwsbUJBQVMsS0FGSjtBQUdMLGtCQUFRLElBSEg7QUFJTCxvQkFBVSxJQUpMO0FBS0wsa0JBQVEsSUFMSDtBQU1MLGtCQUFRO0FBTkg7QUFERixPQUFQOztBQVdGLFNBQUssTUFBTDtBQUNFLGFBQU87QUFDTCxnQkFBUTtBQUVOLG1CQUFTLEtBRkg7QUFHTixrQkFBUSxJQUhGO0FBSU4saUJBQU87QUFKRDtBQURILE9BQVA7O0FBU0Y7QUFDRSxZQUFNLElBQUksS0FBSiwwQ0FBNEMsSUFBNUMsRUFBTjtBQWhISjtBQWtIRDs7b0JBR1MsSSxFQUFNLEksRUFBTSxHLEVBQUs7QUFDekIsT0FBSyxNQUFMLENBQVksSUFBSSxHQUFHLEdBQVAsR0FBYSxJQUF6QixJQUFpQyxHQUFqQztBQUNEOztvQkFDUyxJLEVBQU0sSSxFQUFNO0FBQ3BCLFNBQU8sS0FBSyxNQUFMLENBQVksSUFBSSxHQUFHLEdBQVAsR0FBYSxJQUF6QixDQUFQO0FBQ0Q7O29CQUNTLEksRUFBTSxJLEVBQU07QUFDcEIsU0FBTyxLQUFLLE1BQUwsQ0FBWSxJQUFJLEdBQUcsR0FBUCxHQUFhLElBQXpCLENBQVA7QUFDRDs7b0JBSVMsSSxFQUFNLEksRUFBTSxPLEVBQVM7QUFDN0IsUUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxHQUFWLEdBQWdCLFNBQWhDOztBQUNBLE9BQUssSUFBSSxHQUFULElBQWdCLEtBQUssTUFBckIsRUFBNkI7QUFDM0IsUUFBSSxDQUFDLEdBQUQsSUFBUSxHQUFHLENBQUMsT0FBSixDQUFZLEdBQVosS0FBb0IsQ0FBaEMsRUFBbUM7QUFDakMsVUFBSSxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsS0FBSyxNQUFMLENBQVksR0FBWixDQUFuQixFQUFxQyxHQUFyQyxDQUFKLEVBQStDO0FBQzdDO0FBQ0Q7QUFDRjtBQUNGO0FBQ0Y7OzhCQUltQixLLEVBQU87QUFDekIsRUFBQSxLQUFLLENBQUMsT0FBTixHQUFnQixJQUFoQjs7QUFFQSxFQUFBLEtBQUssQ0FBQyxhQUFOLEdBQXVCLEdBQUQsSUFBUztBQUM3QixVQUFNLEdBQUcsMEJBQUcsSUFBSCw4QkFBRyxJQUFILEVBQWtCLE1BQWxCLEVBQTBCLEdBQTFCLENBQVQ7O0FBQ0EsUUFBSSxHQUFKLEVBQVM7QUFDUCxhQUFPO0FBQ0wsUUFBQSxJQUFJLEVBQUUsR0FERDtBQUVMLFFBQUEsTUFBTSxFQUFFLHFCQUFTLEVBQVQsRUFBYSxHQUFiO0FBRkgsT0FBUDtBQUlEOztBQUNELFdBQU8sU0FBUDtBQUNELEdBVEQ7O0FBVUEsRUFBQSxLQUFLLENBQUMsYUFBTixHQUFzQixDQUFDLEdBQUQsRUFBTSxJQUFOLEtBQWU7QUFDbkMsbUVBQWUsTUFBZixFQUF1QixHQUF2QixFQUE0QixxQkFBUyxFQUFULEVBQWEsSUFBSSxDQUFDLE1BQWxCLENBQTVCO0FBQ0QsR0FGRDs7QUFHQSxFQUFBLEtBQUssQ0FBQyxhQUFOLEdBQXVCLEdBQUQsSUFBUztBQUM3QixtRUFBZSxNQUFmLEVBQXVCLEdBQXZCO0FBQ0QsR0FGRDs7QUFHQSxFQUFBLEtBQUssQ0FBQyxhQUFOLEdBQXNCLE1BQU07QUFDMUIsbUVBQWUsT0FBZixFQUF3QixLQUFLLENBQUMsSUFBOUIsRUFBb0MsS0FBcEM7QUFDRCxHQUZEOztBQUdBLEVBQUEsS0FBSyxDQUFDLGFBQU4sR0FBc0IsTUFBTTtBQUMxQixtRUFBZSxPQUFmLEVBQXdCLEtBQUssQ0FBQyxJQUE5QjtBQUNELEdBRkQ7QUFHRDs7MkJBR2dCLEksRUFBTTtBQUNyQixNQUFJLENBQUMsSUFBSSxDQUFDLE1BQU4sSUFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTCxDQUFZLElBQWpDLEVBQXVDO0FBQ3JDLFdBQU8sSUFBUDtBQUNEOztBQUdELE9BQUssTUFBTCxHQUFjLElBQUksQ0FBQyxNQUFMLENBQVksSUFBMUI7QUFDQSxPQUFLLGNBQUwsR0FBdUIsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFMLElBQWEsR0FBckIsSUFBNEIsSUFBSSxDQUFDLElBQUwsR0FBWSxHQUEvRDs7QUFDQSxNQUFJLElBQUksQ0FBQyxNQUFMLElBQWUsSUFBSSxDQUFDLE1BQUwsQ0FBWSxLQUEzQixJQUFvQyxJQUFJLENBQUMsTUFBTCxDQUFZLE9BQXBELEVBQTZEO0FBQzNELFNBQUssVUFBTCxHQUFrQjtBQUNoQixNQUFBLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTCxDQUFZLEtBREg7QUFFaEIsTUFBQSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQUwsQ0FBWTtBQUZMLEtBQWxCO0FBSUQsR0FMRCxNQUtPO0FBQ0wsU0FBSyxVQUFMLEdBQWtCLElBQWxCO0FBQ0Q7O0FBRUQsTUFBSSxLQUFLLE9BQVQsRUFBa0I7QUFDaEIsU0FBSyxPQUFMLENBQWEsSUFBSSxDQUFDLElBQWxCLEVBQXdCLElBQUksQ0FBQyxJQUE3QjtBQUNEOztBQUVELFNBQU8sSUFBUDtBQUNEOztBQTZ4Q0Y7QUFHRCxNQUFNLENBQUMsbUJBQVAsR0FBNkIsS0FBSyxDQUFDLG1CQUFuQztBQUNBLE1BQU0sQ0FBQyxxQkFBUCxHQUErQixLQUFLLENBQUMscUJBQXJDO0FBQ0EsTUFBTSxDQUFDLHNCQUFQLEdBQWdDLEtBQUssQ0FBQyxzQkFBdEM7QUFDQSxNQUFNLENBQUMscUJBQVAsR0FBK0IsS0FBSyxDQUFDLHFCQUFyQztBQUNBLE1BQU0sQ0FBQyxtQkFBUCxHQUE2QixLQUFLLENBQUMsbUJBQW5DO0FBQ0EsTUFBTSxDQUFDLHVCQUFQLEdBQWlDLEtBQUssQ0FBQyx1QkFBdkM7QUFDQSxNQUFNLENBQUMsbUJBQVAsR0FBNkIsS0FBSyxDQUFDLG1CQUFuQztBQUNBLE1BQU0sQ0FBQyxvQkFBUCxHQUE4QixLQUFLLENBQUMsb0JBQXBDO0FBQ0EsTUFBTSxDQUFDLHdCQUFQLEdBQWtDLEtBQUssQ0FBQyx3QkFBeEM7QUFHQSxNQUFNLENBQUMsUUFBUCxHQUFrQixLQUFLLENBQUMsUUFBeEI7QUFHQSxNQUFNLENBQUMsZ0JBQVAsR0FBMEIsZ0JBQTFCO0FBQ0EsTUFBTSxDQUFDLG9CQUFQLEdBQThCLG9CQUE5QjtBQUNBLE1BQU0sQ0FBQyxhQUFQLEdBQXVCLGFBQXZCO0FBQ0EsTUFBTSxDQUFDLG9CQUFQLEdBQThCLG1CQUE5Qjs7Ozs7QUMxckVBOzs7Ozs7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFNTyxNQUFNLEtBQU4sQ0FBWTtBQXNCakIsRUFBQSxXQUFXLENBQUMsSUFBRCxFQUFPLFNBQVAsRUFBa0I7QUFFM0IsU0FBSyxPQUFMLEdBQWUsSUFBZjtBQUlBLFNBQUssSUFBTCxHQUFZLElBQVo7QUFFQSxTQUFLLE9BQUwsR0FBZSxJQUFmO0FBRUEsU0FBSyxPQUFMLEdBQWUsSUFBZjtBQUVBLFNBQUssT0FBTCxHQUFlLElBQUksSUFBSixDQUFTLENBQVQsQ0FBZjtBQUVBLFNBQUssR0FBTCxHQUFXLElBQUksbUJBQUosQ0FBZSxJQUFmLENBQVg7QUFFQSxTQUFLLE9BQUwsR0FBZSxJQUFmO0FBRUEsU0FBSyxNQUFMLEdBQWMsSUFBZDtBQUVBLFNBQUssT0FBTCxHQUFlLElBQWY7QUFJQSxTQUFLLE1BQUwsR0FBYyxFQUFkO0FBR0EsU0FBSyxZQUFMLEdBQW9CLEtBQUssQ0FBQyxXQUExQjtBQUdBLFNBQUssT0FBTCxHQUFlLENBQWY7QUFFQSxTQUFLLE9BQUwsR0FBZSxDQUFmO0FBRUEsU0FBSyxjQUFMLEdBQXNCLEtBQXRCO0FBRUEsU0FBSyxPQUFMLEdBQWUsQ0FBZjtBQUVBLFNBQUssS0FBTCxHQUFhLEVBQWI7QUFFQSxTQUFLLFlBQUwsR0FBb0IsRUFBcEI7QUFFQSxTQUFLLFNBQUwsR0FBaUIsSUFBSSxnQkFBSixDQUFZLENBQUMsQ0FBRCxFQUFJLENBQUosS0FBVTtBQUNyQyxhQUFPLENBQUMsQ0FBQyxHQUFGLEdBQVEsQ0FBQyxDQUFDLEdBQWpCO0FBQ0QsS0FGZ0IsRUFFZCxJQUZjLENBQWpCO0FBSUEsU0FBSyxTQUFMLEdBQWlCLEtBQWpCO0FBRUEsU0FBSyxlQUFMLEdBQXVCLElBQUksSUFBSixDQUFTLENBQVQsQ0FBdkI7QUFFQSxTQUFLLElBQUwsR0FBWSxJQUFaO0FBRUEsU0FBSyxRQUFMLEdBQWdCLEtBQWhCOztBQUdBLFFBQUksU0FBSixFQUFlO0FBQ2IsV0FBSyxNQUFMLEdBQWMsU0FBUyxDQUFDLE1BQXhCO0FBQ0EsV0FBSyxNQUFMLEdBQWMsU0FBUyxDQUFDLE1BQXhCO0FBQ0EsV0FBSyxNQUFMLEdBQWMsU0FBUyxDQUFDLE1BQXhCO0FBQ0EsV0FBSyxNQUFMLEdBQWMsU0FBUyxDQUFDLE1BQXhCO0FBRUEsV0FBSyxVQUFMLEdBQWtCLFNBQVMsQ0FBQyxVQUE1QjtBQUVBLFdBQUssU0FBTCxHQUFpQixTQUFTLENBQUMsU0FBM0I7QUFFQSxXQUFLLGFBQUwsR0FBcUIsU0FBUyxDQUFDLGFBQS9CO0FBQ0EsV0FBSyxhQUFMLEdBQXFCLFNBQVMsQ0FBQyxhQUEvQjtBQUNBLFdBQUssY0FBTCxHQUFzQixTQUFTLENBQUMsY0FBaEM7QUFDQSxXQUFLLGFBQUwsR0FBcUIsU0FBUyxDQUFDLGFBQS9CO0FBQ0EsV0FBSyxxQkFBTCxHQUE2QixTQUFTLENBQUMscUJBQXZDO0FBQ0Q7QUFDRjs7QUFhZSxTQUFULFNBQVMsQ0FBQyxJQUFELEVBQU87QUFDckIsVUFBTSxLQUFLLEdBQUc7QUFDWixZQUFNLEtBQUssQ0FBQyxRQURBO0FBRVosYUFBTyxLQUFLLENBQUMsU0FGRDtBQUdaLGFBQU8sS0FBSyxDQUFDLFNBSEQ7QUFJWixhQUFPLEtBQUssQ0FBQyxTQUpEO0FBS1osYUFBTyxLQUFLLENBQUMsU0FMRDtBQU1aLGFBQU8sS0FBSyxDQUFDLFNBTkQ7QUFPWixhQUFPLEtBQUssQ0FBQyxTQVBEO0FBUVosYUFBTyxLQUFLLENBQUM7QUFSRCxLQUFkO0FBVUEsV0FBTyxLQUFLLENBQUUsT0FBTyxJQUFQLElBQWUsUUFBaEIsR0FBNEIsSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLEVBQWtCLENBQWxCLENBQTVCLEdBQW1ELEtBQXBELENBQVo7QUFDRDs7QUFVbUIsU0FBYixhQUFhLENBQUMsSUFBRCxFQUFPO0FBQ3pCLFdBQU8sS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsSUFBaEIsS0FBeUIsS0FBSyxDQUFDLFFBQXRDO0FBQ0Q7O0FBVXNCLFNBQWhCLGdCQUFnQixDQUFDLElBQUQsRUFBTztBQUM1QixXQUFPLEtBQUssQ0FBQyxTQUFOLENBQWdCLElBQWhCLEtBQXlCLEtBQUssQ0FBQyxTQUF0QztBQUNEOztBQVVvQixTQUFkLGNBQWMsQ0FBQyxJQUFELEVBQU87QUFDMUIsV0FBTyxLQUFLLENBQUMsU0FBTixDQUFnQixJQUFoQixLQUF5QixLQUFLLENBQUMsU0FBdEM7QUFDRDs7QUFVcUIsU0FBZixlQUFlLENBQUMsSUFBRCxFQUFPO0FBQzNCLFdBQU8sS0FBSyxDQUFDLGNBQU4sQ0FBcUIsSUFBckIsS0FBOEIsS0FBSyxDQUFDLGdCQUFOLENBQXVCLElBQXZCLENBQXJDO0FBQ0Q7O0FBVXlCLFNBQW5CLG1CQUFtQixDQUFDLElBQUQsRUFBTztBQUMvQixXQUFRLE9BQU8sSUFBUCxJQUFlLFFBQWhCLEtBQ0osSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLEVBQWtCLENBQWxCLEtBQXdCLEtBQUssQ0FBQyxTQUE5QixJQUEyQyxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWYsRUFBa0IsQ0FBbEIsS0FBd0IsS0FBSyxDQUFDLGNBRHJFLENBQVA7QUFFRDs7QUFVd0IsU0FBbEIsa0JBQWtCLENBQUMsSUFBRCxFQUFPO0FBQzlCLFdBQVEsT0FBTyxJQUFQLElBQWUsUUFBaEIsS0FDSixJQUFJLENBQUMsU0FBTCxDQUFlLENBQWYsRUFBa0IsQ0FBbEIsS0FBd0IsS0FBSyxDQUFDLFVBQTlCLElBQTRDLElBQUksQ0FBQyxTQUFMLENBQWUsQ0FBZixFQUFrQixDQUFsQixLQUF3QixLQUFLLENBQUMsY0FEdEUsQ0FBUDtBQUVEOztBQU9ELEVBQUEsWUFBWSxHQUFHO0FBQ2IsV0FBTyxLQUFLLFNBQVo7QUFDRDs7QUFVRCxFQUFBLFNBQVMsQ0FBQyxTQUFELEVBQVksU0FBWixFQUF1QjtBQUU5QixRQUFJLEtBQUssU0FBVCxFQUFvQjtBQUNsQixhQUFPLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLENBQVA7QUFDRDs7QUFHRCxRQUFJLEtBQUssUUFBVCxFQUFtQjtBQUNqQixhQUFPLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBSSxLQUFKLENBQVUsc0JBQVYsQ0FBZixDQUFQO0FBQ0Q7O0FBS0QsV0FBTyxLQUFLLE9BQUwsQ0FBYSxTQUFiLENBQXVCLEtBQUssSUFBTCxJQUFhLEtBQUssQ0FBQyxTQUExQyxFQUFxRCxTQUFyRCxFQUFnRSxTQUFoRSxFQUEyRSxJQUEzRSxDQUFpRixJQUFELElBQVU7QUFDL0YsVUFBSSxJQUFJLENBQUMsSUFBTCxJQUFhLEdBQWpCLEVBQXNCO0FBRXBCLGVBQU8sSUFBUDtBQUNEOztBQUVELFdBQUssU0FBTCxHQUFpQixJQUFqQjtBQUNBLFdBQUssUUFBTCxHQUFnQixLQUFoQjtBQUNBLFdBQUssR0FBTCxHQUFZLElBQUksQ0FBQyxNQUFMLElBQWUsSUFBSSxDQUFDLE1BQUwsQ0FBWSxHQUE1QixHQUFtQyxJQUFJLENBQUMsTUFBTCxDQUFZLEdBQS9DLEdBQXFELEtBQUssR0FBckU7O0FBR0EsVUFBSSxLQUFLLElBQVQsRUFBZTtBQUNiLGVBQU8sS0FBSyxJQUFaOztBQUVBLFlBQUksS0FBSyxJQUFMLElBQWEsSUFBSSxDQUFDLEtBQXRCLEVBQTZCO0FBRTNCLGVBQUssYUFBTDs7QUFDQSxlQUFLLElBQUwsR0FBWSxJQUFJLENBQUMsS0FBakI7QUFDRDs7QUFDRCxhQUFLLGFBQUw7O0FBRUEsYUFBSyxPQUFMLEdBQWUsSUFBSSxDQUFDLEVBQXBCO0FBQ0EsYUFBSyxPQUFMLEdBQWUsSUFBSSxDQUFDLEVBQXBCOztBQUVBLFlBQUksS0FBSyxJQUFMLElBQWEsS0FBSyxDQUFDLFFBQW5CLElBQStCLEtBQUssSUFBTCxJQUFhLEtBQUssQ0FBQyxTQUF0RCxFQUFpRTtBQUUvRCxnQkFBTSxFQUFFLEdBQUcsS0FBSyxPQUFMLENBQWEsVUFBYixFQUFYOztBQUNBLGNBQUksRUFBRSxDQUFDLFNBQVAsRUFBa0I7QUFDaEIsWUFBQSxFQUFFLENBQUMsU0FBSCxDQUFhLElBQWI7QUFDRDs7QUFDRCxjQUFJLEVBQUUsQ0FBQyxhQUFQLEVBQXNCO0FBQ3BCLFlBQUEsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsQ0FBQyxLQUFLLElBQU4sQ0FBakIsRUFBOEIsQ0FBOUI7QUFDRDtBQUNGOztBQUVELFlBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxJQUEzQixFQUFpQztBQUMvQixVQUFBLFNBQVMsQ0FBQyxJQUFWLENBQWUsYUFBZixHQUErQixJQUEvQjs7QUFDQSxlQUFLLGdCQUFMLENBQXNCLFNBQVMsQ0FBQyxJQUFoQztBQUNEO0FBQ0Y7O0FBQ0QsYUFBTyxJQUFQO0FBQ0QsS0F6Q00sQ0FBUDtBQTBDRDs7QUFZRCxFQUFBLGFBQWEsQ0FBQyxJQUFELEVBQU8sTUFBUCxFQUFlO0FBQzFCLFdBQU8sS0FBSyxPQUFMLENBQWEsYUFBYixDQUEyQixLQUFLLElBQWhDLEVBQXNDLElBQXRDLEVBQTRDLE1BQTVDLENBQVA7QUFDRDs7QUFTRCxFQUFBLE9BQU8sQ0FBQyxJQUFELEVBQU8sTUFBUCxFQUFlO0FBQ3BCLFdBQU8sS0FBSyxjQUFMLENBQW9CLEtBQUssYUFBTCxDQUFtQixJQUFuQixFQUF5QixNQUF6QixDQUFwQixDQUFQO0FBQ0Q7O0FBU0QsRUFBQSxjQUFjLENBQUMsR0FBRCxFQUFNO0FBQ2xCLFFBQUksQ0FBQyxLQUFLLFNBQVYsRUFBcUI7QUFDbkIsYUFBTyxPQUFPLENBQUMsTUFBUixDQUFlLElBQUksS0FBSixDQUFVLGtDQUFWLENBQWYsQ0FBUDtBQUNEOztBQUNELFFBQUksS0FBSyxRQUFULEVBQW1CO0FBQ2pCLGFBQU8sT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFJLEtBQUosQ0FBVSxtQ0FBVixDQUFmLENBQVA7QUFDRDs7QUFHRCxJQUFBLEdBQUcsQ0FBQyxRQUFKLEdBQWUsSUFBZjtBQUNBLElBQUEsR0FBRyxDQUFDLE9BQUosR0FBYyxLQUFkO0FBR0EsUUFBSSxXQUFXLEdBQUcsSUFBbEI7O0FBQ0EsUUFBSSxnQkFBTyxXQUFQLENBQW1CLEdBQUcsQ0FBQyxPQUF2QixDQUFKLEVBQXFDO0FBQ25DLE1BQUEsV0FBVyxHQUFHLEVBQWQ7O0FBQ0Esc0JBQU8sUUFBUCxDQUFnQixHQUFHLENBQUMsT0FBcEIsRUFBOEIsSUFBRCxJQUFVO0FBQ3JDLFlBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFqQixFQUFzQjtBQUNwQixVQUFBLFdBQVcsQ0FBQyxJQUFaLENBQWlCLElBQUksQ0FBQyxHQUF0QjtBQUNEO0FBQ0YsT0FKRDs7QUFLQSxVQUFJLFdBQVcsQ0FBQyxNQUFaLElBQXNCLENBQTFCLEVBQTZCO0FBQzNCLFFBQUEsV0FBVyxHQUFHLElBQWQ7QUFDRDtBQUNGOztBQUVELFdBQU8sS0FBSyxPQUFMLENBQWEsY0FBYixDQUE0QixHQUE1QixFQUFpQyxXQUFqQyxFQUE4QyxJQUE5QyxDQUFvRCxJQUFELElBQVU7QUFDbEUsTUFBQSxHQUFHLENBQUMsUUFBSixHQUFlLEtBQWY7QUFDQSxNQUFBLEdBQUcsQ0FBQyxFQUFKLEdBQVMsSUFBSSxDQUFDLEVBQWQ7QUFDQSxXQUFLLGFBQUwsQ0FBbUIsR0FBbkIsRUFBd0IsSUFBSSxDQUFDLE1BQUwsQ0FBWSxHQUFwQzs7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsR0FBaEI7O0FBQ0EsYUFBTyxJQUFQO0FBQ0QsS0FOTSxFQU1KLEtBTkksQ0FNRyxHQUFELElBQVM7QUFDaEIsV0FBSyxPQUFMLENBQWEsTUFBYixDQUFvQix5Q0FBcEIsRUFBK0QsR0FBL0Q7O0FBQ0EsTUFBQSxHQUFHLENBQUMsUUFBSixHQUFlLEtBQWY7QUFDQSxNQUFBLEdBQUcsQ0FBQyxPQUFKLEdBQWMsSUFBZDs7QUFDQSxVQUFJLEtBQUssTUFBVCxFQUFpQjtBQUNmLGFBQUssTUFBTDtBQUNEO0FBQ0YsS0FiTSxDQUFQO0FBY0Q7O0FBY0QsRUFBQSxZQUFZLENBQUMsR0FBRCxFQUFNLElBQU4sRUFBWTtBQUN0QixVQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBSixJQUFXLEtBQUssZUFBTCxFQUF2Qjs7QUFDQSxRQUFJLENBQUMsR0FBRyxDQUFDLGFBQVQsRUFBd0I7QUFHdEIsTUFBQSxHQUFHLENBQUMsYUFBSixHQUFvQixJQUFwQjtBQUNBLE1BQUEsR0FBRyxDQUFDLEdBQUosR0FBVSxHQUFWO0FBQ0EsTUFBQSxHQUFHLENBQUMsRUFBSixHQUFTLElBQUksSUFBSixFQUFUO0FBQ0EsTUFBQSxHQUFHLENBQUMsSUFBSixHQUFXLEtBQUssT0FBTCxDQUFhLGdCQUFiLEVBQVg7QUFHQSxNQUFBLEdBQUcsQ0FBQyxNQUFKLEdBQWEsSUFBYjs7QUFFQSxXQUFLLFNBQUwsQ0FBZSxHQUFmLENBQW1CLEdBQW5COztBQUNBLFdBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsVUFBakIsQ0FBNEIsR0FBNUI7O0FBRUEsVUFBSSxLQUFLLE1BQVQsRUFBaUI7QUFDZixhQUFLLE1BQUwsQ0FBWSxHQUFaO0FBQ0Q7QUFDRjs7QUFHRCxXQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxPQUFSLEVBQVQsRUFDSixJQURJLENBQ0MsQ0FBQyxJQUFJO0FBQ1QsVUFBSSxHQUFHLENBQUMsVUFBUixFQUFvQjtBQUNsQixlQUFPO0FBQ0wsVUFBQSxJQUFJLEVBQUUsR0FERDtBQUVMLFVBQUEsSUFBSSxFQUFFO0FBRkQsU0FBUDtBQUlEOztBQUNELGFBQU8sS0FBSyxjQUFMLENBQW9CLEdBQXBCLENBQVA7QUFDRCxLQVRJLEVBU0YsS0FURSxDQVNJLEdBQUcsSUFBSTtBQUNkLFdBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsaUNBQXBCLEVBQXVELEdBQXZEOztBQUNBLE1BQUEsR0FBRyxDQUFDLFFBQUosR0FBZSxLQUFmO0FBQ0EsTUFBQSxHQUFHLENBQUMsT0FBSixHQUFjLElBQWQ7O0FBR0EsVUFBSSxLQUFLLE1BQVQsRUFBaUI7QUFDZixhQUFLLE1BQUw7QUFDRDs7QUFFRCxZQUFNLEdBQU47QUFDRCxLQXBCSSxDQUFQO0FBcUJEOztBQVdELEVBQUEsS0FBSyxDQUFDLEtBQUQsRUFBUTtBQUVYLFFBQUksQ0FBQyxLQUFLLFNBQU4sSUFBbUIsQ0FBQyxLQUF4QixFQUErQjtBQUM3QixhQUFPLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBSSxLQUFKLENBQVUsNkJBQVYsQ0FBZixDQUFQO0FBQ0Q7O0FBR0QsV0FBTyxLQUFLLE9BQUwsQ0FBYSxLQUFiLENBQW1CLEtBQUssSUFBeEIsRUFBOEIsS0FBOUIsRUFBcUMsSUFBckMsQ0FBMkMsSUFBRCxJQUFVO0FBQ3pELFdBQUssU0FBTDs7QUFDQSxVQUFJLEtBQUosRUFBVztBQUNULGFBQUssS0FBTDtBQUNEOztBQUNELGFBQU8sSUFBUDtBQUNELEtBTk0sQ0FBUDtBQU9EOztBQVVELEVBQUEsT0FBTyxDQUFDLE1BQUQsRUFBUztBQUVkLFdBQU8sS0FBSyxPQUFMLENBQWEsT0FBYixDQUFxQixLQUFLLElBQTFCLEVBQWdDLE1BQWhDLENBQVA7QUFDRDs7QUFTRCxFQUFBLGVBQWUsQ0FBQyxLQUFELEVBQVEsT0FBUixFQUFpQjtBQUM5QixRQUFJLEtBQUssR0FBRyxPQUFPLEdBQ2pCLEtBQUssY0FBTCxHQUFzQixhQUF0QixDQUFvQyxLQUFwQyxDQURpQixHQUVqQixLQUFLLGNBQUwsR0FBc0IsZUFBdEIsQ0FBc0MsS0FBdEMsQ0FGRjtBQUtBLFdBQU8sS0FBSyxhQUFMLENBQW1CLEtBQUssT0FBTCxDQUFhLEdBQWhDLEVBQXFDLEtBQUssQ0FBQyxPQUFOLENBQWMsTUFBZCxDQUFyQyxFQUNKLElBREksQ0FDRSxLQUFELElBQVc7QUFDZixVQUFJLEtBQUssSUFBSSxLQUFiLEVBQW9CO0FBRWxCLGVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0I7QUFDckIsVUFBQSxLQUFLLEVBQUUsS0FBSyxJQURTO0FBRXJCLFVBQUEsSUFBSSxFQUFFLEdBRmU7QUFHckIsVUFBQSxNQUFNLEVBQUU7QUFDTixZQUFBLEtBQUssRUFBRTtBQUREO0FBSGEsU0FBaEIsQ0FBUDtBQU9EOztBQUdELE1BQUEsS0FBSyxJQUFJLEtBQVQ7QUFFQSxNQUFBLEtBQUssR0FBRyxPQUFPLEdBQUcsS0FBSyxjQUFMLEdBQXNCLGFBQXRCLENBQW9DLEtBQXBDLENBQUgsR0FDYixLQUFLLGNBQUwsR0FBc0IsZUFBdEIsQ0FBc0MsS0FBdEMsQ0FERjtBQUVBLFVBQUksT0FBTyxHQUFHLEtBQUssT0FBTCxDQUFhLEtBQUssQ0FBQyxLQUFOLEVBQWIsQ0FBZDs7QUFDQSxVQUFJLENBQUMsT0FBTCxFQUFjO0FBQ1osUUFBQSxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQVIsQ0FBYyxJQUFELElBQVU7QUFDL0IsY0FBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQWIsSUFBdUIsQ0FBQyxJQUFJLENBQUMsTUFBTCxDQUFZLEtBQXhDLEVBQStDO0FBQzdDLGlCQUFLLGNBQUwsR0FBc0IsSUFBdEI7QUFDRDtBQUNGLFNBSlMsQ0FBVjtBQUtEOztBQUNELGFBQU8sT0FBUDtBQUNELEtBM0JJLENBQVA7QUE0QkQ7O0FBUUQsRUFBQSxPQUFPLENBQUMsTUFBRCxFQUFTO0FBQ2QsUUFBSSxNQUFNLENBQUMsSUFBWCxFQUFpQjtBQUNmLE1BQUEsTUFBTSxDQUFDLElBQVAsR0FBYywyQkFBZSxNQUFNLENBQUMsSUFBdEIsQ0FBZDtBQUNEOztBQUVELFdBQU8sS0FBSyxPQUFMLENBQWEsT0FBYixDQUFxQixLQUFLLElBQTFCLEVBQWdDLE1BQWhDLEVBQ0osSUFESSxDQUNFLElBQUQsSUFBVTtBQUNkLFVBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFMLElBQWEsR0FBekIsRUFBOEI7QUFFNUIsZUFBTyxJQUFQO0FBQ0Q7O0FBRUQsVUFBSSxNQUFNLENBQUMsR0FBWCxFQUFnQjtBQUNkLFFBQUEsTUFBTSxDQUFDLEdBQVAsQ0FBVyxLQUFYLEdBQW1CLEtBQUssSUFBeEI7O0FBQ0EsWUFBSSxJQUFJLENBQUMsTUFBTCxJQUFlLElBQUksQ0FBQyxNQUFMLENBQVksR0FBL0IsRUFBb0M7QUFDbEMsVUFBQSxNQUFNLENBQUMsR0FBUCxDQUFXLEdBQVgsR0FBaUIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxHQUE3QjtBQUNBLFVBQUEsTUFBTSxDQUFDLEdBQVAsQ0FBVyxPQUFYLEdBQXFCLElBQUksQ0FBQyxFQUExQjtBQUNEOztBQUNELFlBQUksQ0FBQyxNQUFNLENBQUMsR0FBUCxDQUFXLElBQWhCLEVBQXNCO0FBR3BCLFVBQUEsTUFBTSxDQUFDLEdBQVAsQ0FBVyxJQUFYLEdBQWtCLEtBQUssT0FBTCxDQUFhLGdCQUFiLEVBQWxCOztBQUNBLGNBQUksQ0FBQyxNQUFNLENBQUMsSUFBWixFQUFrQjtBQUVoQixZQUFBLE1BQU0sQ0FBQyxJQUFQLEdBQWMsRUFBZDtBQUNEO0FBQ0Y7O0FBQ0QsUUFBQSxNQUFNLENBQUMsR0FBUCxDQUFXLGFBQVgsR0FBMkIsSUFBM0I7O0FBQ0EsYUFBSyxlQUFMLENBQXFCLENBQUMsTUFBTSxDQUFDLEdBQVIsQ0FBckI7QUFDRDs7QUFFRCxVQUFJLE1BQU0sQ0FBQyxJQUFYLEVBQWlCO0FBQ2YsWUFBSSxJQUFJLENBQUMsTUFBTCxJQUFlLElBQUksQ0FBQyxNQUFMLENBQVksR0FBL0IsRUFBb0M7QUFDbEMsVUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLEdBQVosR0FBa0IsSUFBSSxDQUFDLE1BQUwsQ0FBWSxHQUE5QjtBQUNBLFVBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEdBQXNCLElBQUksQ0FBQyxFQUEzQjtBQUNEOztBQUNELGFBQUssZ0JBQUwsQ0FBc0IsTUFBTSxDQUFDLElBQTdCO0FBQ0Q7O0FBRUQsVUFBSSxNQUFNLENBQUMsSUFBWCxFQUFpQjtBQUNmLGFBQUssZ0JBQUwsQ0FBc0IsTUFBTSxDQUFDLElBQTdCO0FBQ0Q7O0FBQ0QsVUFBSSxNQUFNLENBQUMsSUFBWCxFQUFpQjtBQUNmLGFBQUssaUJBQUwsQ0FBdUIsQ0FBQyxNQUFNLENBQUMsSUFBUixDQUF2QixFQUFzQyxJQUF0QztBQUNEOztBQUVELGFBQU8sSUFBUDtBQUNELEtBMUNJLENBQVA7QUEyQ0Q7O0FBU0QsRUFBQSxVQUFVLENBQUMsR0FBRCxFQUFNLE1BQU4sRUFBYztBQUN0QixVQUFNLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxVQUFMLENBQWdCLEdBQWhCLENBQUgsR0FBMEIsSUFBMUM7QUFDQSxVQUFNLEVBQUUsR0FBRyxJQUFJLEdBQ2IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxXQUFULENBQXFCLE1BQXJCLEVBQTZCLFFBQTdCLEVBRGEsR0FFYixLQUFLLGFBQUwsR0FBcUIsVUFBckIsQ0FBZ0MsTUFBaEMsRUFBd0MsT0FBeEMsRUFGRjtBQUlBLFdBQU8sS0FBSyxPQUFMLENBQWE7QUFDbEIsTUFBQSxHQUFHLEVBQUU7QUFDSCxRQUFBLElBQUksRUFBRSxHQURIO0FBRUgsUUFBQSxJQUFJLEVBQUU7QUFGSDtBQURhLEtBQWIsQ0FBUDtBQU1EOztBQVVELEVBQUEsTUFBTSxDQUFDLEdBQUQsRUFBTSxJQUFOLEVBQVk7QUFDaEIsV0FBTyxLQUFLLE9BQUwsQ0FBYTtBQUNsQixNQUFBLEdBQUcsRUFBRTtBQUNILFFBQUEsSUFBSSxFQUFFLEdBREg7QUFFSCxRQUFBLElBQUksRUFBRTtBQUZIO0FBRGEsS0FBYixDQUFQO0FBTUQ7O0FBU0QsRUFBQSxPQUFPLENBQUMsSUFBRCxFQUFPO0FBQ1osUUFBSSxLQUFLLE9BQUwsSUFBaUIsQ0FBQyxLQUFLLE9BQUwsQ0FBYSxJQUFkLElBQXNCLENBQUMsSUFBNUMsRUFBbUQ7QUFDakQsYUFBTyxPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQixDQUFQO0FBQ0Q7O0FBQ0QsV0FBTyxLQUFLLE9BQUwsQ0FBYTtBQUNsQixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsT0FBTyxFQUFFO0FBQ1AsVUFBQSxJQUFJLEVBQUUsSUFBSSxHQUFHLElBQUgsR0FBVSxLQUFLLENBQUM7QUFEbkI7QUFETDtBQURZLEtBQWIsQ0FBUDtBQU9EOztBQVVELEVBQUEsV0FBVyxDQUFDLE1BQUQsRUFBUyxJQUFULEVBQWU7QUFDeEIsUUFBSSxDQUFDLEtBQUssU0FBVixFQUFxQjtBQUNuQixhQUFPLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBSSxLQUFKLENBQVUsMENBQVYsQ0FBZixDQUFQO0FBQ0Q7O0FBR0QsSUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLENBQUMsRUFBRCxFQUFLLEVBQUwsS0FBWTtBQUN0QixVQUFJLEVBQUUsQ0FBQyxHQUFILEdBQVMsRUFBRSxDQUFDLEdBQWhCLEVBQXFCO0FBQ25CLGVBQU8sSUFBUDtBQUNEOztBQUNELFVBQUksRUFBRSxDQUFDLEdBQUgsSUFBVSxFQUFFLENBQUMsR0FBakIsRUFBc0I7QUFDcEIsZUFBTyxDQUFDLEVBQUUsQ0FBQyxFQUFKLElBQVcsRUFBRSxDQUFDLEVBQUgsSUFBUyxFQUFFLENBQUMsRUFBOUI7QUFDRDs7QUFDRCxhQUFPLEtBQVA7QUFDRCxLQVJEO0FBV0EsUUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQVAsQ0FBYyxDQUFDLEdBQUQsRUFBTSxDQUFOLEtBQVk7QUFDckMsVUFBSSxDQUFDLENBQUMsR0FBRixHQUFRLEtBQUssQ0FBQyxXQUFsQixFQUErQjtBQUM3QixZQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUgsSUFBUyxDQUFDLENBQUMsRUFBRixHQUFPLEtBQUssQ0FBQyxXQUExQixFQUF1QztBQUNyQyxVQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsQ0FBVDtBQUNELFNBRkQsTUFFTztBQUVMLFVBQUEsR0FBRyxDQUFDLElBQUosQ0FBUztBQUNQLFlBQUEsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQURBO0FBRVAsWUFBQSxFQUFFLEVBQUUsS0FBSyxPQUFMLEdBQWU7QUFGWixXQUFUO0FBSUQ7QUFDRjs7QUFDRCxhQUFPLEdBQVA7QUFDRCxLQWJZLEVBYVYsRUFiVSxDQUFiO0FBZ0JBLFFBQUksTUFBSjs7QUFDQSxRQUFJLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLENBQXBCLEVBQXVCO0FBQ3JCLE1BQUEsTUFBTSxHQUFHLEtBQUssT0FBTCxDQUFhLFdBQWIsQ0FBeUIsS0FBSyxJQUE5QixFQUFvQyxNQUFwQyxFQUE0QyxJQUE1QyxDQUFUO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsTUFBQSxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0I7QUFDdkIsUUFBQSxNQUFNLEVBQUU7QUFDTixVQUFBLEdBQUcsRUFBRTtBQURDO0FBRGUsT0FBaEIsQ0FBVDtBQUtEOztBQUVELFdBQU8sTUFBTSxDQUFDLElBQVAsQ0FBYSxJQUFELElBQVU7QUFDM0IsVUFBSSxJQUFJLENBQUMsTUFBTCxDQUFZLEdBQVosR0FBa0IsS0FBSyxPQUEzQixFQUFvQztBQUNsQyxhQUFLLE9BQUwsR0FBZSxJQUFJLENBQUMsTUFBTCxDQUFZLEdBQTNCO0FBQ0Q7O0FBRUQsTUFBQSxNQUFNLENBQUMsT0FBUCxDQUFnQixDQUFELElBQU87QUFDcEIsWUFBSSxDQUFDLENBQUMsRUFBTixFQUFVO0FBQ1IsZUFBSyxpQkFBTCxDQUF1QixDQUFDLENBQUMsR0FBekIsRUFBOEIsQ0FBQyxDQUFDLEVBQWhDO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsZUFBSyxZQUFMLENBQWtCLENBQUMsQ0FBQyxHQUFwQjtBQUNEO0FBQ0YsT0FORDs7QUFRQSxXQUFLLG9CQUFMOztBQUVBLFVBQUksS0FBSyxNQUFULEVBQWlCO0FBRWYsYUFBSyxNQUFMO0FBQ0Q7O0FBQ0QsYUFBTyxJQUFQO0FBQ0QsS0FwQk0sQ0FBUDtBQXFCRDs7QUFTRCxFQUFBLGNBQWMsQ0FBQyxPQUFELEVBQVU7QUFDdEIsUUFBSSxDQUFDLEtBQUssT0FBTixJQUFpQixLQUFLLE9BQUwsSUFBZ0IsQ0FBckMsRUFBd0M7QUFFdEMsYUFBTyxPQUFPLENBQUMsT0FBUixFQUFQO0FBQ0Q7O0FBQ0QsV0FBTyxLQUFLLFdBQUwsQ0FBaUIsQ0FBQztBQUN2QixNQUFBLEdBQUcsRUFBRSxDQURrQjtBQUV2QixNQUFBLEVBQUUsRUFBRSxLQUFLLE9BQUwsR0FBZSxDQUZJO0FBR3ZCLE1BQUEsSUFBSSxFQUFFO0FBSGlCLEtBQUQsQ0FBakIsRUFJSCxPQUpHLENBQVA7QUFLRDs7QUFVRCxFQUFBLGVBQWUsQ0FBQyxJQUFELEVBQU8sT0FBUCxFQUFnQjtBQUU3QixJQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQyxDQUFELEVBQUksQ0FBSixLQUFVLENBQUMsR0FBRyxDQUF4QjtBQUVBLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFMLENBQVksQ0FBQyxHQUFELEVBQU0sRUFBTixLQUFhO0FBQ3BDLFVBQUksR0FBRyxDQUFDLE1BQUosSUFBYyxDQUFsQixFQUFxQjtBQUVuQixRQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVM7QUFDUCxVQUFBLEdBQUcsRUFBRTtBQURFLFNBQVQ7QUFHRCxPQUxELE1BS087QUFDTCxZQUFJLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQUosR0FBYSxDQUFkLENBQWQ7O0FBQ0EsWUFBSyxDQUFDLElBQUksQ0FBQyxFQUFOLElBQWEsRUFBRSxJQUFJLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBL0IsSUFBdUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFyRCxFQUEwRDtBQUV4RCxVQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVM7QUFDUCxZQUFBLEdBQUcsRUFBRTtBQURFLFdBQVQ7QUFHRCxTQUxELE1BS087QUFFTCxVQUFBLElBQUksQ0FBQyxFQUFMLEdBQVUsSUFBSSxDQUFDLEVBQUwsR0FBVSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxFQUFkLEVBQWtCLEVBQUUsR0FBRyxDQUF2QixDQUFWLEdBQXNDLEVBQUUsR0FBRyxDQUFyRDtBQUNEO0FBQ0Y7O0FBQ0QsYUFBTyxHQUFQO0FBQ0QsS0FuQlksRUFtQlYsRUFuQlUsQ0FBYjtBQXFCQSxXQUFPLEtBQUssV0FBTCxDQUFpQixNQUFqQixFQUF5QixPQUF6QixDQUFQO0FBQ0Q7O0FBUUQsRUFBQSxRQUFRLENBQUMsSUFBRCxFQUFPO0FBQ2IsUUFBSSxLQUFLLFFBQVQsRUFBbUI7QUFFakIsV0FBSyxLQUFMOztBQUNBLGFBQU8sSUFBSSxPQUFPLENBQUMsT0FBWixDQUFvQixJQUFwQixDQUFQO0FBQ0Q7O0FBRUQsV0FBTyxLQUFLLE9BQUwsQ0FBYSxRQUFiLENBQXNCLEtBQUssSUFBM0IsRUFBaUMsSUFBakMsRUFBdUMsSUFBdkMsQ0FBNkMsSUFBRCxJQUFVO0FBQzNELFdBQUssU0FBTDs7QUFDQSxXQUFLLEtBQUw7O0FBQ0EsYUFBTyxJQUFQO0FBQ0QsS0FKTSxDQUFQO0FBS0Q7O0FBUUQsRUFBQSxlQUFlLENBQUMsSUFBRCxFQUFPO0FBQ3BCLFFBQUksQ0FBQyxLQUFLLFNBQVYsRUFBcUI7QUFDbkIsYUFBTyxPQUFPLENBQUMsTUFBUixDQUFlLElBQUksS0FBSixDQUFVLDhDQUFWLENBQWYsQ0FBUDtBQUNEOztBQUVELFdBQU8sS0FBSyxPQUFMLENBQWEsZUFBYixDQUE2QixLQUFLLElBQWxDLEVBQXdDLElBQXhDLEVBQThDLElBQTlDLENBQW9ELElBQUQsSUFBVTtBQUVsRSxhQUFPLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBUDs7QUFFQSxVQUFJLEtBQUssYUFBVCxFQUF3QjtBQUN0QixhQUFLLGFBQUwsQ0FBbUIsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFLLE1BQWpCLENBQW5CO0FBQ0Q7O0FBQ0QsYUFBTyxJQUFQO0FBQ0QsS0FSTSxDQUFQO0FBU0Q7O0FBUUQsRUFBQSxJQUFJLENBQUMsSUFBRCxFQUFPLEdBQVAsRUFBWTtBQUNkLFFBQUksQ0FBQyxLQUFLLFNBQVYsRUFBcUI7QUFFbkI7QUFDRDs7QUFHRCxVQUFNLElBQUksR0FBRyxLQUFLLE1BQUwsQ0FBWSxLQUFLLE9BQUwsQ0FBYSxnQkFBYixFQUFaLENBQWI7O0FBQ0EsUUFBSSxNQUFNLEdBQUcsS0FBYjs7QUFDQSxRQUFJLElBQUosRUFBVTtBQUVSLFVBQUksQ0FBQyxJQUFJLENBQUMsSUFBRCxDQUFMLElBQWUsSUFBSSxDQUFDLElBQUQsQ0FBSixHQUFhLEdBQWhDLEVBQXFDO0FBQ25DLFFBQUEsSUFBSSxDQUFDLElBQUQsQ0FBSixHQUFhLEdBQWI7QUFDQSxRQUFBLE1BQU0sR0FBRyxJQUFUO0FBQ0Q7QUFDRixLQU5ELE1BTU87QUFFTCxNQUFBLE1BQU0sR0FBRyxDQUFDLEtBQUssSUFBTCxJQUFhLENBQWQsSUFBbUIsR0FBNUI7QUFDRDs7QUFFRCxRQUFJLE1BQUosRUFBWTtBQUVWLFdBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsS0FBSyxJQUF2QixFQUE2QixJQUE3QixFQUFtQyxHQUFuQzs7QUFFQSxXQUFLLGVBQUwsQ0FBcUIsSUFBckIsRUFBMkIsR0FBM0I7O0FBRUEsVUFBSSxLQUFLLEdBQUwsSUFBWSxJQUFaLElBQW9CLENBQUMsS0FBSyxHQUFMLENBQVMsT0FBVCxFQUF6QixFQUE2QztBQUMzQyxjQUFNLEVBQUUsR0FBRyxLQUFLLE9BQUwsQ0FBYSxVQUFiLEVBQVg7O0FBRUEsUUFBQSxFQUFFLENBQUMsZUFBSCxDQUFtQixJQUFuQixFQUF5QixJQUF6QjtBQUNEO0FBQ0Y7QUFDRjs7QUFPRCxFQUFBLFFBQVEsQ0FBQyxHQUFELEVBQU07QUFDWixTQUFLLElBQUwsQ0FBVSxNQUFWLEVBQWtCLEdBQWxCO0FBQ0Q7O0FBT0QsRUFBQSxRQUFRLENBQUMsR0FBRCxFQUFNO0FBQ1osSUFBQSxHQUFHLEdBQUcsR0FBRyxJQUFJLEtBQUssT0FBbEI7O0FBQ0EsUUFBSSxHQUFHLEdBQUcsQ0FBVixFQUFhO0FBQ1gsV0FBSyxJQUFMLENBQVUsTUFBVixFQUFrQixHQUFsQjtBQUNEO0FBQ0Y7O0FBS0QsRUFBQSxZQUFZLEdBQUc7QUFDYixRQUFJLEtBQUssU0FBVCxFQUFvQjtBQUNsQixXQUFLLE9BQUwsQ0FBYSxZQUFiLENBQTBCLEtBQUssSUFBL0I7QUFDRCxLQUZELE1BRU87QUFDTCxXQUFLLE9BQUwsQ0FBYSxNQUFiLENBQW9CLGtEQUFwQjtBQUNEO0FBQ0Y7O0FBRUQsRUFBQSxlQUFlLENBQUMsSUFBRCxFQUFPLEdBQVAsRUFBWSxFQUFaLEVBQWdCO0FBQzdCLFFBQUksTUFBSjtBQUFBLFFBQVksUUFBUSxHQUFHLEtBQXZCO0FBRUEsSUFBQSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQVo7QUFDQSxTQUFLLEdBQUwsR0FBVyxLQUFLLEdBQUwsR0FBVyxDQUF0QjtBQUNBLFNBQUssSUFBTCxHQUFZLEtBQUssSUFBTCxHQUFZLENBQXhCO0FBQ0EsU0FBSyxJQUFMLEdBQVksS0FBSyxJQUFMLEdBQVksQ0FBeEI7O0FBQ0EsWUFBUSxJQUFSO0FBQ0UsV0FBSyxNQUFMO0FBQ0UsUUFBQSxNQUFNLEdBQUcsS0FBSyxJQUFkO0FBQ0EsYUFBSyxJQUFMLEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFLLElBQWQsRUFBb0IsR0FBcEIsQ0FBWjtBQUNBLFFBQUEsUUFBUSxHQUFJLE1BQU0sSUFBSSxLQUFLLElBQTNCO0FBQ0E7O0FBQ0YsV0FBSyxNQUFMO0FBQ0UsUUFBQSxNQUFNLEdBQUcsS0FBSyxJQUFkO0FBQ0EsYUFBSyxJQUFMLEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFLLElBQWQsRUFBb0IsR0FBcEIsQ0FBWjtBQUNBLFFBQUEsUUFBUSxHQUFJLE1BQU0sSUFBSSxLQUFLLElBQTNCO0FBQ0E7O0FBQ0YsV0FBSyxLQUFMO0FBQ0UsUUFBQSxNQUFNLEdBQUcsS0FBSyxHQUFkO0FBQ0EsYUFBSyxHQUFMLEdBQVcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFLLEdBQWQsRUFBbUIsR0FBbkIsQ0FBWDs7QUFDQSxZQUFJLENBQUMsS0FBSyxPQUFOLElBQWlCLEtBQUssT0FBTCxHQUFlLEVBQXBDLEVBQXdDO0FBQ3RDLGVBQUssT0FBTCxHQUFlLEVBQWY7QUFDRDs7QUFDRCxRQUFBLFFBQVEsR0FBSSxNQUFNLElBQUksS0FBSyxHQUEzQjtBQUNBO0FBbEJKOztBQXNCQSxRQUFJLEtBQUssSUFBTCxHQUFZLEtBQUssSUFBckIsRUFBMkI7QUFDekIsV0FBSyxJQUFMLEdBQVksS0FBSyxJQUFqQjtBQUNBLE1BQUEsUUFBUSxHQUFHLElBQVg7QUFDRDs7QUFDRCxRQUFJLEtBQUssR0FBTCxHQUFXLEtBQUssSUFBcEIsRUFBMEI7QUFDeEIsV0FBSyxHQUFMLEdBQVcsS0FBSyxJQUFoQjs7QUFDQSxVQUFJLENBQUMsS0FBSyxPQUFOLElBQWlCLEtBQUssT0FBTCxHQUFlLEVBQXBDLEVBQXdDO0FBQ3RDLGFBQUssT0FBTCxHQUFlLEVBQWY7QUFDRDs7QUFDRCxNQUFBLFFBQVEsR0FBRyxJQUFYO0FBQ0Q7O0FBQ0QsU0FBSyxNQUFMLEdBQWMsS0FBSyxHQUFMLEdBQVcsS0FBSyxJQUE5QjtBQUNBLFdBQU8sUUFBUDtBQUNEOztBQVNELEVBQUEsUUFBUSxDQUFDLEdBQUQsRUFBTTtBQUVaLFVBQU0sSUFBSSxHQUFHLEtBQUssYUFBTCxDQUFtQixHQUFuQixDQUFiOztBQUNBLFFBQUksSUFBSixFQUFVO0FBQ1IsYUFBTyxJQUFQO0FBQ0Q7QUFDRjs7QUFPRCxFQUFBLFdBQVcsR0FBRztBQUNaLFFBQUksQ0FBQyxLQUFLLFNBQUwsRUFBTCxFQUF1QjtBQUNyQixhQUFPLFNBQVA7QUFDRDs7QUFDRCxXQUFPLEtBQUssTUFBTCxDQUFZLEtBQUssSUFBakIsQ0FBUDtBQUNEOztBQVFELEVBQUEsV0FBVyxDQUFDLFFBQUQsRUFBVyxPQUFYLEVBQW9CO0FBQzdCLFVBQU0sRUFBRSxHQUFJLFFBQVEsSUFBSSxLQUFLLFNBQTdCOztBQUNBLFFBQUksRUFBSixFQUFRO0FBQ04sV0FBSyxJQUFJLEdBQVQsSUFBZ0IsS0FBSyxNQUFyQixFQUE2QjtBQUMzQixRQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsT0FBUixFQUFpQixLQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWpCLEVBQW1DLEdBQW5DLEVBQXdDLEtBQUssTUFBN0M7QUFDRDtBQUNGO0FBQ0Y7O0FBT0QsRUFBQSxJQUFJLEdBQUc7QUFFTCxXQUFPLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBaUIsQ0FBakIsQ0FBUDtBQUNEOztBQVFELEVBQUEsVUFBVSxDQUFDLEdBQUQsRUFBTTtBQUNkLFdBQU8sS0FBSyxNQUFMLENBQVksR0FBWixDQUFQO0FBQ0Q7O0FBV0QsRUFBQSxRQUFRLENBQUMsUUFBRCxFQUFXLE9BQVgsRUFBb0IsUUFBcEIsRUFBOEIsT0FBOUIsRUFBdUM7QUFDN0MsVUFBTSxFQUFFLEdBQUksUUFBUSxJQUFJLEtBQUssTUFBN0I7O0FBQ0EsUUFBSSxFQUFKLEVBQVE7QUFDTixZQUFNLFFBQVEsR0FBRyxPQUFPLE9BQVAsSUFBa0IsUUFBbEIsR0FBNkIsS0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQjtBQUNoRSxRQUFBLEdBQUcsRUFBRTtBQUQyRCxPQUFwQixFQUUzQyxJQUYyQyxDQUE3QixHQUVOLFNBRlg7QUFHQSxZQUFNLFNBQVMsR0FBRyxPQUFPLFFBQVAsSUFBbUIsUUFBbkIsR0FBOEIsS0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQjtBQUNsRSxRQUFBLEdBQUcsRUFBRTtBQUQ2RCxPQUFwQixFQUU3QyxJQUY2QyxDQUE5QixHQUVQLFNBRlg7O0FBR0EsVUFBSSxRQUFRLElBQUksQ0FBQyxDQUFiLElBQWtCLFNBQVMsSUFBSSxDQUFDLENBQXBDLEVBQXVDO0FBQ3JDLGFBQUssU0FBTCxDQUFlLE9BQWYsQ0FBdUIsRUFBdkIsRUFBMkIsUUFBM0IsRUFBcUMsU0FBckMsRUFBZ0QsT0FBaEQ7QUFDRDtBQUNGO0FBQ0Y7O0FBUUQsRUFBQSxXQUFXLENBQUMsR0FBRCxFQUFNO0FBQ2YsVUFBTSxHQUFHLEdBQUcsS0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQjtBQUM5QixNQUFBLEdBQUcsRUFBRTtBQUR5QixLQUFwQixDQUFaOztBQUdBLFFBQUksR0FBRyxJQUFJLENBQVgsRUFBYztBQUNaLGFBQU8sS0FBSyxTQUFMLENBQWUsS0FBZixDQUFxQixHQUFyQixDQUFQO0FBQ0Q7O0FBQ0QsV0FBTyxTQUFQO0FBQ0Q7O0FBUUQsRUFBQSxhQUFhLENBQUMsV0FBRCxFQUFjO0FBQ3pCLFVBQU0sR0FBRyxHQUFHLEtBQUssU0FBTCxDQUFlLE9BQWYsRUFBWjs7QUFDQSxRQUFJLENBQUMsV0FBRCxJQUFnQixDQUFDLEdBQWpCLElBQXdCLEdBQUcsQ0FBQyxPQUFKLElBQWUsS0FBSyxDQUFDLHdCQUFqRCxFQUEyRTtBQUN6RSxhQUFPLEdBQVA7QUFDRDs7QUFDRCxXQUFPLEtBQUssU0FBTCxDQUFlLE9BQWYsQ0FBdUIsQ0FBdkIsQ0FBUDtBQUNEOztBQU9ELEVBQUEsU0FBUyxHQUFHO0FBQ1YsV0FBTyxLQUFLLE9BQVo7QUFDRDs7QUFPRCxFQUFBLFVBQVUsR0FBRztBQUNYLFdBQU8sS0FBSyxPQUFaO0FBQ0Q7O0FBT0QsRUFBQSxZQUFZLEdBQUc7QUFDYixXQUFPLEtBQUssU0FBTCxDQUFlLE1BQWYsRUFBUDtBQUNEOztBQVFELEVBQUEsY0FBYyxDQUFDLFFBQUQsRUFBVyxPQUFYLEVBQW9CO0FBQ2hDLFFBQUksQ0FBQyxRQUFMLEVBQWU7QUFDYixZQUFNLElBQUksS0FBSixDQUFVLDJCQUFWLENBQU47QUFDRDs7QUFDRCxTQUFLLFFBQUwsQ0FBYyxRQUFkLEVBQXdCLEtBQUssQ0FBQyxXQUE5QixFQUEyQyxTQUEzQyxFQUFzRCxPQUF0RDtBQUNEOztBQVdELEVBQUEsZUFBZSxDQUFDLElBQUQsRUFBTyxHQUFQLEVBQVk7QUFDekIsUUFBSSxLQUFLLEdBQUcsQ0FBWjs7QUFDQSxRQUFJLEdBQUcsR0FBRyxDQUFWLEVBQWE7QUFDWCxZQUFNLEVBQUUsR0FBRyxLQUFLLE9BQUwsQ0FBYSxnQkFBYixFQUFYOztBQUNBLFdBQUssSUFBSSxHQUFULElBQWdCLEtBQUssTUFBckIsRUFBNkI7QUFDM0IsY0FBTSxJQUFJLEdBQUcsS0FBSyxNQUFMLENBQVksR0FBWixDQUFiOztBQUNBLFlBQUksSUFBSSxDQUFDLElBQUwsS0FBYyxFQUFkLElBQW9CLElBQUksQ0FBQyxJQUFELENBQUosSUFBYyxHQUF0QyxFQUEyQztBQUN6QyxVQUFBLEtBQUs7QUFDTjtBQUNGO0FBQ0Y7O0FBQ0QsV0FBTyxLQUFQO0FBQ0Q7O0FBU0QsRUFBQSxZQUFZLENBQUMsR0FBRCxFQUFNO0FBQ2hCLFdBQU8sS0FBSyxlQUFMLENBQXFCLE1BQXJCLEVBQTZCLEdBQTdCLENBQVA7QUFDRDs7QUFTRCxFQUFBLFlBQVksQ0FBQyxHQUFELEVBQU07QUFDaEIsV0FBTyxLQUFLLGVBQUwsQ0FBcUIsTUFBckIsRUFBNkIsR0FBN0IsQ0FBUDtBQUNEOztBQU9ELEVBQUEsa0JBQWtCLENBQUMsS0FBRCxFQUFRO0FBQ3hCLFdBQU8sS0FBSyxHQUFHLEtBQUssR0FBTCxHQUFXLEtBQUssT0FBbkIsR0FFVCxLQUFLLE9BQUwsR0FBZSxDQUFmLElBQW9CLENBQUMsS0FBSyxjQUY3QjtBQUdEOztBQU9ELEVBQUEsWUFBWSxDQUFDLEtBQUQsRUFBUTtBQUNsQixXQUFPLEtBQUssT0FBTCxJQUFnQixLQUF2QjtBQUNEOztBQVFELEVBQUEsWUFBWSxDQUFDLEtBQUQsRUFBUTtBQUNsQixVQUFNLEdBQUcsR0FBRyxLQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CO0FBQzlCLE1BQUEsR0FBRyxFQUFFO0FBRHlCLEtBQXBCLENBQVo7O0FBR0EsUUFBSSxHQUFHLElBQUksQ0FBWCxFQUFjO0FBQ1osV0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixXQUFqQixDQUE2QixLQUFLLElBQWxDLEVBQXdDLEtBQXhDOztBQUNBLGFBQU8sS0FBSyxTQUFMLENBQWUsS0FBZixDQUFxQixHQUFyQixDQUFQO0FBQ0Q7O0FBQ0QsV0FBTyxTQUFQO0FBQ0Q7O0FBUUQsRUFBQSxhQUFhLENBQUMsR0FBRCxFQUFNLFFBQU4sRUFBZ0I7QUFDM0IsVUFBTSxHQUFHLEdBQUcsS0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQixHQUFwQixDQUFaOztBQUNBLFVBQU0sV0FBVyxHQUFHLEtBQUssU0FBTCxDQUFlLE1BQWYsRUFBcEI7O0FBQ0EsUUFBSSxLQUFLLEdBQUwsSUFBWSxHQUFHLEdBQUcsV0FBdEIsRUFBbUM7QUFFakMsV0FBSyxTQUFMLENBQWUsS0FBZixDQUFxQixHQUFyQjs7QUFDQSxXQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLFdBQWpCLENBQTZCLEtBQUssSUFBbEMsRUFBd0MsR0FBRyxDQUFDLEdBQTVDOztBQUVBLE1BQUEsR0FBRyxDQUFDLEdBQUosR0FBVSxRQUFWOztBQUNBLFdBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsR0FBbkI7O0FBQ0EsV0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixVQUFqQixDQUE0QixHQUE1QjtBQUNEO0FBQ0Y7O0FBVUQsRUFBQSxpQkFBaUIsQ0FBQyxNQUFELEVBQVMsT0FBVCxFQUFrQjtBQUVqQyxTQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLFdBQWpCLENBQTZCLEtBQUssSUFBbEMsRUFBd0MsTUFBeEMsRUFBZ0QsT0FBaEQ7O0FBRUEsVUFBTSxLQUFLLEdBQUcsS0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQjtBQUNoQyxNQUFBLEdBQUcsRUFBRTtBQUQyQixLQUFwQixFQUVYLElBRlcsQ0FBZDs7QUFHQSxXQUFPLEtBQUssSUFBSSxDQUFULEdBQWEsS0FBSyxTQUFMLENBQWUsUUFBZixDQUF3QixLQUF4QixFQUErQixLQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CO0FBQ3JFLE1BQUEsR0FBRyxFQUFFO0FBRGdFLEtBQXBCLEVBRWhELElBRmdELENBQS9CLENBQWIsR0FFSyxFQUZaO0FBR0Q7O0FBU0QsRUFBQSxVQUFVLENBQUMsS0FBRCxFQUFRO0FBQ2hCLFVBQU0sR0FBRyxHQUFHLEtBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0I7QUFDOUIsTUFBQSxHQUFHLEVBQUU7QUFEeUIsS0FBcEIsQ0FBWjs7QUFHQSxRQUFJLEdBQUcsSUFBSSxDQUFYLEVBQWM7QUFDWixZQUFNLEdBQUcsR0FBRyxLQUFLLFNBQUwsQ0FBZSxLQUFmLENBQXFCLEdBQXJCLENBQVo7O0FBQ0EsWUFBTSxNQUFNLEdBQUcsS0FBSyxTQUFMLENBQWUsR0FBZixDQUFmOztBQUNBLFVBQUksTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBaEIsSUFBeUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBN0QsRUFBb0Y7QUFDbEYsYUFBSyxPQUFMLENBQWEsR0FBYixDQUFpQixXQUFqQixDQUE2QixLQUFLLElBQWxDLEVBQXdDLEtBQXhDOztBQUNBLFFBQUEsR0FBRyxDQUFDLFVBQUosR0FBaUIsSUFBakI7O0FBQ0EsYUFBSyxTQUFMLENBQWUsS0FBZixDQUFxQixHQUFyQjs7QUFDQSxZQUFJLEtBQUssTUFBVCxFQUFpQjtBQUVmLGVBQUssTUFBTDtBQUNEOztBQUNELGVBQU8sSUFBUDtBQUNEO0FBQ0Y7O0FBQ0QsV0FBTyxLQUFQO0FBQ0Q7O0FBT0QsRUFBQSxPQUFPLEdBQUc7QUFDUixXQUFPLEtBQUssQ0FBQyxTQUFOLENBQWdCLEtBQUssSUFBckIsQ0FBUDtBQUNEOztBQU9ELEVBQUEsYUFBYSxHQUFHO0FBQ2QsV0FBTyxLQUFLLEdBQVo7QUFDRDs7QUFPRCxFQUFBLGFBQWEsQ0FBQyxHQUFELEVBQU07QUFDakIsV0FBTyxLQUFLLEdBQUwsR0FBVyxJQUFJLG1CQUFKLENBQWUsR0FBZixDQUFsQjtBQUNEOztBQU9ELEVBQUEsZ0JBQWdCLEdBQUc7QUFDakIsV0FBTyxLQUFLLE1BQVo7QUFDRDs7QUFRRCxFQUFBLGNBQWMsR0FBRztBQUNmLFdBQU8sSUFBSSxvQkFBSixDQUFtQixJQUFuQixDQUFQO0FBQ0Q7O0FBT0QsRUFBQSxVQUFVLEdBQUc7QUFDWCxXQUFPLEtBQUssT0FBTCxJQUFnQixDQUFDLENBQUMsS0FBSyxPQUFMLENBQWEsSUFBdEM7QUFDRDs7QUFPRCxFQUFBLFFBQVEsR0FBRztBQUNULFdBQU8sS0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBSyxJQUF6QixDQUFQO0FBQ0Q7O0FBT0QsRUFBQSxhQUFhLEdBQUc7QUFDZCxXQUFPLEtBQUssQ0FBQyxrQkFBTixDQUF5QixLQUFLLElBQTlCLENBQVA7QUFDRDs7QUFPRCxFQUFBLFdBQVcsR0FBRztBQUNaLFdBQU8sS0FBSyxDQUFDLGdCQUFOLENBQXVCLEtBQUssSUFBNUIsQ0FBUDtBQUNEOztBQU9ELEVBQUEsU0FBUyxHQUFHO0FBQ1YsV0FBTyxLQUFLLENBQUMsY0FBTixDQUFxQixLQUFLLElBQTFCLENBQVA7QUFDRDs7QUFPRCxFQUFBLFVBQVUsR0FBRztBQUNYLFdBQU8sS0FBSyxDQUFDLGVBQU4sQ0FBc0IsS0FBSyxJQUEzQixDQUFQO0FBQ0Q7O0FBV0QsRUFBQSxTQUFTLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVztBQUNsQixRQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsbUJBQW5COztBQUNBLFFBQUksS0FBSyxPQUFMLENBQWEsSUFBYixDQUFrQixHQUFHLENBQUMsSUFBdEIsQ0FBSixFQUFpQztBQUMvQixVQUFJLEdBQUcsQ0FBQyxRQUFSLEVBQWtCO0FBQ2hCLFFBQUEsTUFBTSxHQUFHLEtBQUssQ0FBQyxzQkFBZjtBQUNELE9BRkQsTUFFTyxJQUFJLEdBQUcsQ0FBQyxPQUFKLElBQWUsR0FBRyxDQUFDLFVBQXZCLEVBQW1DO0FBQ3hDLFFBQUEsTUFBTSxHQUFHLEtBQUssQ0FBQyxxQkFBZjtBQUNELE9BRk0sTUFFQSxJQUFJLEdBQUcsQ0FBQyxHQUFKLElBQVcsS0FBSyxDQUFDLFdBQXJCLEVBQWtDO0FBQ3ZDLFFBQUEsTUFBTSxHQUFHLEtBQUssQ0FBQyxxQkFBZjtBQUNELE9BRk0sTUFFQSxJQUFJLEtBQUssWUFBTCxDQUFrQixHQUFHLENBQUMsR0FBdEIsSUFBNkIsQ0FBakMsRUFBb0M7QUFDekMsUUFBQSxNQUFNLEdBQUcsS0FBSyxDQUFDLG1CQUFmO0FBQ0QsT0FGTSxNQUVBLElBQUksS0FBSyxZQUFMLENBQWtCLEdBQUcsQ0FBQyxHQUF0QixJQUE2QixDQUFqQyxFQUFvQztBQUN6QyxRQUFBLE1BQU0sR0FBRyxLQUFLLENBQUMsdUJBQWY7QUFDRCxPQUZNLE1BRUEsSUFBSSxHQUFHLENBQUMsR0FBSixHQUFVLENBQWQsRUFBaUI7QUFDdEIsUUFBQSxNQUFNLEdBQUcsS0FBSyxDQUFDLG1CQUFmO0FBQ0Q7QUFDRixLQWRELE1BY08sSUFBSSxHQUFHLENBQUMsT0FBSixJQUFlLEtBQUssQ0FBQyx3QkFBekIsRUFBbUQ7QUFDeEQsTUFBQSxNQUFNLElBQUksS0FBSyxDQUFDLHdCQUFoQjtBQUNELEtBRk0sTUFFQTtBQUNMLE1BQUEsTUFBTSxHQUFHLEtBQUssQ0FBQyxvQkFBZjtBQUNEOztBQUVELFFBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFKLElBQWUsTUFBMUIsRUFBa0M7QUFDaEMsTUFBQSxHQUFHLENBQUMsT0FBSixHQUFjLE1BQWQ7O0FBQ0EsV0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixnQkFBakIsQ0FBa0MsS0FBSyxJQUF2QyxFQUE2QyxHQUFHLENBQUMsR0FBakQsRUFBc0QsTUFBdEQ7QUFDRDs7QUFFRCxXQUFPLE1BQVA7QUFDRDs7QUFFRCxFQUFBLFVBQVUsQ0FBQyxJQUFELEVBQU87QUFDZixRQUFJLElBQUksQ0FBQyxPQUFULEVBQWtCO0FBQ2hCLFVBQUksQ0FBQyxLQUFLLE9BQU4sSUFBaUIsS0FBSyxPQUFMLEdBQWUsSUFBSSxDQUFDLEVBQXpDLEVBQTZDO0FBQzNDLGFBQUssT0FBTCxHQUFlLElBQUksQ0FBQyxFQUFwQjs7QUFDQSxhQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLFFBQWpCLENBQTBCLElBQTFCO0FBQ0Q7QUFDRjs7QUFFRCxRQUFJLElBQUksQ0FBQyxHQUFMLEdBQVcsS0FBSyxPQUFwQixFQUE2QjtBQUMzQixXQUFLLE9BQUwsR0FBZSxJQUFJLENBQUMsR0FBcEI7QUFDRDs7QUFDRCxRQUFJLElBQUksQ0FBQyxHQUFMLEdBQVcsS0FBSyxPQUFoQixJQUEyQixLQUFLLE9BQUwsSUFBZ0IsQ0FBL0MsRUFBa0Q7QUFDaEQsV0FBSyxPQUFMLEdBQWUsSUFBSSxDQUFDLEdBQXBCO0FBQ0Q7O0FBRUQsUUFBSSxDQUFDLElBQUksQ0FBQyxhQUFWLEVBQXlCO0FBQ3ZCLFdBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsSUFBbkI7O0FBQ0EsV0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixVQUFqQixDQUE0QixJQUE1Qjs7QUFDQSxXQUFLLG9CQUFMO0FBQ0Q7O0FBRUQsUUFBSSxLQUFLLE1BQVQsRUFBaUI7QUFDZixXQUFLLE1BQUwsQ0FBWSxJQUFaO0FBQ0Q7O0FBR0QsVUFBTSxJQUFJLEdBQUssQ0FBQyxLQUFLLGFBQUwsRUFBRCxJQUF5QixDQUFDLElBQUksQ0FBQyxJQUFoQyxJQUF5QyxLQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLElBQUksQ0FBQyxJQUF2QixDQUExQyxHQUEwRSxNQUExRSxHQUFtRixLQUFoRzs7QUFDQSxTQUFLLGVBQUwsQ0FBcUIsSUFBckIsRUFBMkIsSUFBSSxDQUFDLEdBQWhDLEVBQXFDLElBQUksQ0FBQyxFQUExQzs7QUFFQSxTQUFLLE9BQUwsQ0FBYSxVQUFiLEdBQTBCLGVBQTFCLENBQTBDLElBQTFDLEVBQWdELElBQWhEO0FBQ0Q7O0FBRUQsRUFBQSxVQUFVLENBQUMsSUFBRCxFQUFPO0FBQ2YsUUFBSSxJQUFJLENBQUMsSUFBVCxFQUFlO0FBQ2IsV0FBSyxnQkFBTCxDQUFzQixJQUFJLENBQUMsSUFBM0I7QUFDRDs7QUFDRCxRQUFJLElBQUksQ0FBQyxHQUFMLElBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxNQUFULEdBQWtCLENBQWxDLEVBQXFDO0FBQ25DLFdBQUssZUFBTCxDQUFxQixJQUFJLENBQUMsR0FBMUI7QUFDRDs7QUFDRCxRQUFJLElBQUksQ0FBQyxHQUFULEVBQWM7QUFDWixXQUFLLG1CQUFMLENBQXlCLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBbEMsRUFBeUMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxNQUFsRDtBQUNEOztBQUNELFFBQUksSUFBSSxDQUFDLElBQVQsRUFBZTtBQUNiLFdBQUssZ0JBQUwsQ0FBc0IsSUFBSSxDQUFDLElBQTNCO0FBQ0Q7O0FBQ0QsUUFBSSxJQUFJLENBQUMsSUFBVCxFQUFlO0FBQ2IsV0FBSyxpQkFBTCxDQUF1QixJQUFJLENBQUMsSUFBNUI7QUFDRDs7QUFDRCxRQUFJLEtBQUssTUFBVCxFQUFpQjtBQUNmLFdBQUssTUFBTCxDQUFZLElBQVo7QUFDRDtBQUNGOztBQUVELEVBQUEsVUFBVSxDQUFDLElBQUQsRUFBTztBQUNmLFFBQUksSUFBSixFQUFVLEdBQVY7O0FBQ0EsWUFBUSxJQUFJLENBQUMsSUFBYjtBQUNFLFdBQUssS0FBTDtBQUVFLGFBQUssbUJBQUwsQ0FBeUIsSUFBSSxDQUFDLEtBQTlCLEVBQXFDLElBQUksQ0FBQyxNQUExQzs7QUFDQTs7QUFDRixXQUFLLElBQUw7QUFDQSxXQUFLLEtBQUw7QUFFRSxRQUFBLElBQUksR0FBRyxLQUFLLE1BQUwsQ0FBWSxJQUFJLENBQUMsR0FBakIsQ0FBUDs7QUFDQSxZQUFJLElBQUosRUFBVTtBQUNSLFVBQUEsSUFBSSxDQUFDLE1BQUwsR0FBYyxJQUFJLENBQUMsSUFBTCxJQUFhLElBQTNCO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsZUFBSyxPQUFMLENBQWEsTUFBYixDQUFvQiw4Q0FBcEIsRUFBb0UsS0FBSyxJQUF6RSxFQUErRSxJQUFJLENBQUMsR0FBcEY7QUFDRDs7QUFDRDs7QUFDRixXQUFLLE1BQUw7QUFFRSxhQUFLLFNBQUw7O0FBQ0E7O0FBQ0YsV0FBSyxLQUFMO0FBSUUsWUFBSSxJQUFJLENBQUMsR0FBTCxJQUFZLENBQUMsS0FBSyxPQUFMLENBQWEsYUFBYixDQUEyQixJQUFJLENBQUMsR0FBaEMsQ0FBakIsRUFBdUQ7QUFDckQsZUFBSyxPQUFMLENBQWEsS0FBSyxjQUFMLEdBQXNCLGVBQXRCLENBQXNDLElBQUksQ0FBQyxHQUEzQyxFQUFnRCxLQUFoRCxFQUFiO0FBQ0Q7O0FBQ0Q7O0FBQ0YsV0FBSyxLQUFMO0FBQ0UsUUFBQSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUwsSUFBWSxLQUFLLE9BQUwsQ0FBYSxnQkFBYixFQUFsQjtBQUNBLFFBQUEsSUFBSSxHQUFHLEtBQUssTUFBTCxDQUFZLEdBQVosQ0FBUDs7QUFDQSxZQUFJLENBQUMsSUFBTCxFQUFXO0FBRVQsZ0JBQU0sR0FBRyxHQUFHLElBQUksbUJBQUosR0FBaUIsU0FBakIsQ0FBMkIsSUFBSSxDQUFDLElBQWhDLENBQVo7O0FBQ0EsY0FBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUosSUFBWSxvQkFBVyxLQUFsQyxFQUF5QztBQUN2QyxZQUFBLElBQUksR0FBRyxLQUFLLGFBQUwsQ0FBbUIsR0FBbkIsQ0FBUDs7QUFDQSxnQkFBSSxDQUFDLElBQUwsRUFBVztBQUNULGNBQUEsSUFBSSxHQUFHO0FBQ0wsZ0JBQUEsSUFBSSxFQUFFLEdBREQ7QUFFTCxnQkFBQSxHQUFHLEVBQUU7QUFGQSxlQUFQO0FBSUEsbUJBQUssT0FBTCxDQUFhLEtBQUssY0FBTCxHQUFzQixVQUF0QixDQUFpQyxTQUFqQyxFQUE0QyxHQUE1QyxFQUFpRCxLQUFqRCxFQUFiO0FBQ0QsYUFORCxNQU1PO0FBQ0wsY0FBQSxJQUFJLENBQUMsR0FBTCxHQUFXLEdBQVg7QUFDRDs7QUFDRCxZQUFBLElBQUksQ0FBQyxPQUFMLEdBQWUsSUFBSSxJQUFKLEVBQWY7O0FBQ0EsaUJBQUssZUFBTCxDQUFxQixDQUFDLElBQUQsQ0FBckI7QUFDRDtBQUNGLFNBakJELE1BaUJPO0FBRUwsVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLFNBQVQsQ0FBbUIsSUFBSSxDQUFDLElBQXhCOztBQUVBLGVBQUssZUFBTCxDQUFxQixDQUFDO0FBQ3BCLFlBQUEsSUFBSSxFQUFFLEdBRGM7QUFFcEIsWUFBQSxPQUFPLEVBQUUsSUFBSSxJQUFKLEVBRlc7QUFHcEIsWUFBQSxHQUFHLEVBQUUsSUFBSSxDQUFDO0FBSFUsV0FBRCxDQUFyQjtBQUtEOztBQUNEOztBQUNGO0FBQ0UsYUFBSyxPQUFMLENBQWEsTUFBYixDQUFvQiwrQkFBcEIsRUFBcUQsSUFBSSxDQUFDLElBQTFEOztBQTNESjs7QUE4REEsUUFBSSxLQUFLLE1BQVQsRUFBaUI7QUFDZixXQUFLLE1BQUwsQ0FBWSxJQUFaO0FBQ0Q7QUFDRjs7QUFFRCxFQUFBLFVBQVUsQ0FBQyxJQUFELEVBQU87QUFDZixRQUFJLElBQUksQ0FBQyxJQUFMLEtBQWMsSUFBbEIsRUFBd0I7QUFDdEIsWUFBTSxJQUFJLEdBQUcsS0FBSyxNQUFMLENBQVksSUFBSSxDQUFDLElBQWpCLENBQWI7O0FBQ0EsVUFBSSxJQUFKLEVBQVU7QUFDUixRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBTixDQUFKLEdBQWtCLElBQUksQ0FBQyxHQUF2Qjs7QUFDQSxZQUFJLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBSSxDQUFDLElBQXJCLEVBQTJCO0FBQ3pCLFVBQUEsSUFBSSxDQUFDLElBQUwsR0FBWSxJQUFJLENBQUMsSUFBakI7QUFDRDtBQUNGOztBQUNELFlBQU0sR0FBRyxHQUFHLEtBQUssYUFBTCxFQUFaOztBQUNBLFVBQUksR0FBSixFQUFTO0FBQ1AsYUFBSyxTQUFMLENBQWUsR0FBZixFQUFvQixJQUFwQjtBQUNEOztBQUdELFVBQUksS0FBSyxPQUFMLENBQWEsSUFBYixDQUFrQixJQUFJLENBQUMsSUFBdkIsQ0FBSixFQUFrQztBQUNoQyxhQUFLLGVBQUwsQ0FBcUIsSUFBSSxDQUFDLElBQTFCLEVBQWdDLElBQUksQ0FBQyxHQUFyQztBQUNEOztBQUdELFdBQUssT0FBTCxDQUFhLFVBQWIsR0FBMEIsZUFBMUIsQ0FBMEMsSUFBSSxDQUFDLElBQS9DLEVBQXFELElBQXJEO0FBQ0Q7O0FBQ0QsUUFBSSxLQUFLLE1BQVQsRUFBaUI7QUFDZixXQUFLLE1BQUwsQ0FBWSxJQUFaO0FBQ0Q7QUFDRjs7QUFHRCxFQUFBLGdCQUFnQixDQUFDLElBQUQsRUFBTztBQUNyQixRQUFJLEtBQUssU0FBTCxFQUFKLEVBQXNCO0FBR3BCLGFBQU8sSUFBSSxDQUFDLE1BQVo7O0FBR0EsV0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixPQUFqQixDQUF5QixLQUFLLElBQTlCLEVBQW9DLElBQUksQ0FBQyxNQUF6QztBQUNEOztBQUdELHlCQUFTLElBQVQsRUFBZSxJQUFmOztBQUVBLFNBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsUUFBakIsQ0FBMEIsSUFBMUI7O0FBR0EsUUFBSSxLQUFLLElBQUwsS0FBYyxLQUFLLENBQUMsUUFBcEIsSUFBZ0MsQ0FBQyxJQUFJLENBQUMsYUFBMUMsRUFBeUQ7QUFDdkQsWUFBTSxFQUFFLEdBQUcsS0FBSyxPQUFMLENBQWEsVUFBYixFQUFYOztBQUNBLFVBQUksRUFBRSxDQUFDLFNBQVAsRUFBa0I7QUFDaEIsUUFBQSxFQUFFLENBQUMsU0FBSCxDQUFhLElBQWI7QUFDRDs7QUFDRCxVQUFJLEVBQUUsQ0FBQyxhQUFQLEVBQXNCO0FBQ3BCLFFBQUEsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsQ0FBQyxLQUFLLElBQU4sQ0FBakIsRUFBOEIsQ0FBOUI7QUFDRDtBQUNGOztBQUVELFFBQUksS0FBSyxVQUFULEVBQXFCO0FBQ25CLFdBQUssVUFBTCxDQUFnQixJQUFoQjtBQUNEO0FBQ0Y7O0FBR0QsRUFBQSxlQUFlLENBQUMsSUFBRCxFQUFPO0FBQ3BCLFNBQUssSUFBSSxHQUFULElBQWdCLElBQWhCLEVBQXNCO0FBQ3BCLFlBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFELENBQWhCO0FBR0EsTUFBQSxHQUFHLENBQUMsTUFBSixHQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBbkI7QUFFQSxXQUFLLGVBQUwsR0FBdUIsSUFBSSxJQUFKLENBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFLLGVBQWQsRUFBK0IsR0FBRyxDQUFDLE9BQW5DLENBQVQsQ0FBdkI7QUFFQSxVQUFJLElBQUksR0FBRyxJQUFYOztBQUNBLFVBQUksQ0FBQyxHQUFHLENBQUMsT0FBVCxFQUFrQjtBQUdoQixZQUFJLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsR0FBRyxDQUFDLElBQXRCLEtBQStCLEdBQUcsQ0FBQyxHQUF2QyxFQUE0QztBQUMxQyxlQUFLLGdCQUFMLENBQXNCO0FBQ3BCLFlBQUEsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQURPO0FBRXBCLFlBQUEsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUZPO0FBR3BCLFlBQUEsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUhXLFdBQXRCO0FBS0Q7O0FBQ0QsUUFBQSxJQUFJLEdBQUcsS0FBSyxpQkFBTCxDQUF1QixHQUFHLENBQUMsSUFBM0IsRUFBaUMsR0FBakMsQ0FBUDtBQUNELE9BWEQsTUFXTztBQUVMLGVBQU8sS0FBSyxNQUFMLENBQVksR0FBRyxDQUFDLElBQWhCLENBQVA7QUFDQSxRQUFBLElBQUksR0FBRyxHQUFQO0FBQ0Q7O0FBRUQsVUFBSSxLQUFLLFNBQVQsRUFBb0I7QUFDbEIsYUFBSyxTQUFMLENBQWUsSUFBZjtBQUNEO0FBQ0Y7O0FBRUQsUUFBSSxLQUFLLGFBQVQsRUFBd0I7QUFDdEIsV0FBSyxhQUFMLENBQW1CLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBSyxNQUFqQixDQUFuQjtBQUNEO0FBQ0Y7O0FBRUQsRUFBQSxnQkFBZ0IsQ0FBQyxJQUFELEVBQU87QUFDckIsUUFBSSxJQUFJLENBQUMsTUFBTCxJQUFlLENBQWYsSUFBb0IsSUFBSSxDQUFDLENBQUQsQ0FBSixJQUFXLEtBQUssQ0FBQyxRQUF6QyxFQUFtRDtBQUNqRCxNQUFBLElBQUksR0FBRyxFQUFQO0FBQ0Q7O0FBQ0QsU0FBSyxLQUFMLEdBQWEsSUFBYjs7QUFDQSxRQUFJLEtBQUssYUFBVCxFQUF3QjtBQUN0QixXQUFLLGFBQUwsQ0FBbUIsSUFBbkI7QUFDRDtBQUNGOztBQUVELEVBQUEsaUJBQWlCLENBQUMsS0FBRCxFQUFRLENBQUU7O0FBRTNCLEVBQUEsbUJBQW1CLENBQUMsS0FBRCxFQUFRLE1BQVIsRUFBZ0I7QUFDakMsU0FBSyxPQUFMLEdBQWUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULEVBQWdCLEtBQUssT0FBckIsQ0FBZjtBQUNBLFNBQUssS0FBTCxHQUFhLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxFQUFnQixLQUFLLEtBQXJCLENBQWI7QUFDQSxVQUFNLEtBQUssR0FBRyxJQUFkO0FBQ0EsUUFBSSxLQUFLLEdBQUcsQ0FBWjs7QUFDQSxRQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsTUFBZCxDQUFKLEVBQTJCO0FBQ3pCLE1BQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxVQUFTLEtBQVQsRUFBZ0I7QUFDN0IsWUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFYLEVBQWU7QUFDYixVQUFBLEtBQUs7QUFDTCxVQUFBLEtBQUssQ0FBQyxZQUFOLENBQW1CLEtBQUssQ0FBQyxHQUF6QjtBQUNELFNBSEQsTUFHTztBQUNMLGVBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQW5CLEVBQXdCLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBbEMsRUFBc0MsQ0FBQyxFQUF2QyxFQUEyQztBQUN6QyxZQUFBLEtBQUs7QUFDTCxZQUFBLEtBQUssQ0FBQyxZQUFOLENBQW1CLENBQW5CO0FBQ0Q7QUFDRjtBQUNGLE9BVkQ7QUFXRDs7QUFFRCxRQUFJLEtBQUssR0FBRyxDQUFaLEVBQWU7QUFDYixXQUFLLG9CQUFMOztBQUVBLFVBQUksS0FBSyxNQUFULEVBQWlCO0FBQ2YsYUFBSyxNQUFMO0FBQ0Q7QUFDRjtBQUNGOztBQUVELEVBQUEsb0JBQW9CLENBQUMsS0FBRCxFQUFRO0FBQzFCLFNBQUssb0JBQUw7O0FBRUEsUUFBSSxLQUFLLHFCQUFULEVBQWdDO0FBQzlCLFdBQUsscUJBQUwsQ0FBMkIsS0FBM0I7QUFDRDtBQUNGOztBQUVELEVBQUEsU0FBUyxHQUFHO0FBQ1YsU0FBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0Q7O0FBRUQsRUFBQSxLQUFLLEdBQUc7QUFDTixTQUFLLFNBQUwsQ0FBZSxLQUFmOztBQUNBLFNBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsV0FBakIsQ0FBNkIsS0FBSyxJQUFsQzs7QUFDQSxTQUFLLE1BQUwsR0FBYyxFQUFkO0FBQ0EsU0FBSyxHQUFMLEdBQVcsSUFBSSxtQkFBSixDQUFlLElBQWYsQ0FBWDtBQUNBLFNBQUssT0FBTCxHQUFlLElBQWY7QUFDQSxTQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0EsU0FBSyxPQUFMLEdBQWUsSUFBZjtBQUNBLFNBQUssT0FBTCxHQUFlLENBQWY7QUFDQSxTQUFLLE9BQUwsR0FBZSxDQUFmO0FBQ0EsU0FBSyxTQUFMLEdBQWlCLEtBQWpCOztBQUVBLFVBQU0sRUFBRSxHQUFHLEtBQUssT0FBTCxDQUFhLFVBQWIsRUFBWDs7QUFDQSxRQUFJLEVBQUosRUFBUTtBQUNOLE1BQUEsRUFBRSxDQUFDLFVBQUgsQ0FBYztBQUNaLFFBQUEsYUFBYSxFQUFFLElBREg7QUFFWixRQUFBLElBQUksRUFBRSxNQUZNO0FBR1osUUFBQSxLQUFLLEVBQUUsS0FBSyxDQUFDLFFBSEQ7QUFJWixRQUFBLEdBQUcsRUFBRSxLQUFLO0FBSkUsT0FBZDtBQU1EOztBQUNELFFBQUksS0FBSyxhQUFULEVBQXdCO0FBQ3RCLFdBQUssYUFBTDtBQUNEO0FBQ0Y7O0FBR0QsRUFBQSxpQkFBaUIsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXO0FBRzFCLFFBQUksTUFBTSxHQUFHLEtBQUssYUFBTCxDQUFtQixHQUFuQixDQUFiOztBQUNBLElBQUEsTUFBTSxHQUFHLHFCQUFTLE1BQU0sSUFBSSxFQUFuQixFQUF1QixHQUF2QixDQUFUOztBQUVBLFNBQUssYUFBTCxDQUFtQixHQUFuQixFQUF3QixNQUF4Qjs7QUFFQSxXQUFPLHlCQUFhLEtBQUssTUFBbEIsRUFBMEIsR0FBMUIsRUFBK0IsTUFBL0IsQ0FBUDtBQUNEOztBQUVELEVBQUEsZUFBZSxHQUFHO0FBQ2hCLFdBQU8sS0FBSyxZQUFMLEVBQVA7QUFDRDs7QUFFRCxFQUFBLG9CQUFvQixHQUFHO0FBQ3JCLFVBQU0sTUFBTSxHQUFHLEVBQWY7QUFHQSxRQUFJLElBQUksR0FBRyxJQUFYOztBQUdBLFVBQU0sS0FBSyxHQUFHLEtBQUssU0FBTCxDQUFlLEtBQWYsQ0FBcUIsQ0FBckIsQ0FBZDs7QUFDQSxRQUFJLEtBQUssSUFBSSxLQUFLLE9BQUwsR0FBZSxDQUF4QixJQUE2QixDQUFDLEtBQUssY0FBdkMsRUFBdUQ7QUFFckQsVUFBSSxLQUFLLENBQUMsRUFBVixFQUFjO0FBRVosWUFBSSxLQUFLLENBQUMsR0FBTixHQUFZLENBQWhCLEVBQW1CO0FBQ2pCLFVBQUEsS0FBSyxDQUFDLEdBQU4sR0FBWSxDQUFaO0FBQ0Q7O0FBQ0QsWUFBSSxLQUFLLENBQUMsRUFBTixHQUFXLEtBQUssT0FBTCxHQUFlLENBQTlCLEVBQWlDO0FBQy9CLFVBQUEsS0FBSyxDQUFDLEVBQU4sR0FBVyxLQUFLLE9BQUwsR0FBZSxDQUExQjtBQUNEOztBQUNELFFBQUEsSUFBSSxHQUFHLEtBQVA7QUFDRCxPQVRELE1BU087QUFFTCxRQUFBLElBQUksR0FBRztBQUNMLFVBQUEsR0FBRyxFQUFFLENBREE7QUFFTCxVQUFBLEVBQUUsRUFBRSxLQUFLLE9BQUwsR0FBZTtBQUZkLFNBQVA7QUFJQSxRQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWjtBQUNEO0FBQ0YsS0FuQkQsTUFtQk87QUFFTCxNQUFBLElBQUksR0FBRztBQUNMLFFBQUEsR0FBRyxFQUFFLENBREE7QUFFTCxRQUFBLEVBQUUsRUFBRTtBQUZDLE9BQVA7QUFJRDs7QUFLRCxTQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXVCLElBQUQsSUFBVTtBQUU5QixVQUFJLElBQUksQ0FBQyxHQUFMLElBQVksS0FBSyxDQUFDLFdBQXRCLEVBQW1DO0FBQ2pDLGVBQU8sSUFBUDtBQUNEOztBQUdELFVBQUksSUFBSSxDQUFDLEdBQUwsSUFBWSxDQUFDLElBQUksQ0FBQyxFQUFMLElBQVcsSUFBSSxDQUFDLEdBQWpCLElBQXdCLENBQXhDLEVBQTJDO0FBRXpDLFlBQUksSUFBSSxDQUFDLEVBQUwsSUFBVyxJQUFJLENBQUMsRUFBcEIsRUFBd0I7QUFFdEIsVUFBQSxJQUFJLENBQUMsRUFBTCxHQUFVLElBQUksQ0FBQyxFQUFmO0FBQ0EsaUJBQU8sS0FBUDtBQUNEOztBQUNELFFBQUEsSUFBSSxHQUFHLElBQVA7QUFHQSxlQUFPLElBQVA7QUFDRDs7QUFJRCxVQUFJLElBQUksQ0FBQyxFQUFULEVBQWE7QUFFWCxRQUFBLElBQUksQ0FBQyxFQUFMLEdBQVUsSUFBSSxDQUFDLEVBQUwsSUFBVyxJQUFJLENBQUMsR0FBMUI7QUFDRCxPQUhELE1BR087QUFFTCxRQUFBLElBQUksR0FBRztBQUNMLFVBQUEsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FEWDtBQUVMLFVBQUEsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFMLElBQVcsSUFBSSxDQUFDO0FBRmYsU0FBUDtBQUlBLFFBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaO0FBQ0Q7O0FBR0QsVUFBSSxDQUFDLElBQUksQ0FBQyxFQUFWLEVBQWM7QUFFWixRQUFBLElBQUksR0FBRyxJQUFQO0FBQ0EsZUFBTyxJQUFQO0FBQ0Q7O0FBR0QsYUFBTyxLQUFQO0FBQ0QsS0EzQ0Q7O0FBK0NBLFVBQU0sSUFBSSxHQUFHLEtBQUssU0FBTCxDQUFlLE9BQWYsRUFBYjs7QUFDQSxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQUssR0FBZCxFQUFtQixLQUFLLE9BQXhCLEtBQW9DLENBQW5EOztBQUNBLFFBQUssTUFBTSxHQUFHLENBQVQsSUFBYyxDQUFDLElBQWhCLElBQTBCLElBQUksSUFBSyxDQUFDLElBQUksQ0FBQyxFQUFMLElBQVcsSUFBSSxDQUFDLEdBQWpCLElBQXdCLE1BQS9ELEVBQXlFO0FBQ3ZFLFVBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFqQixFQUFxQjtBQUVuQixRQUFBLElBQUksQ0FBQyxFQUFMLEdBQVUsTUFBVjtBQUNELE9BSEQsTUFHTztBQUVMLFFBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWTtBQUNWLFVBQUEsR0FBRyxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsR0FBTCxHQUFXLENBQWQsR0FBa0IsQ0FEakI7QUFFVixVQUFBLEVBQUUsRUFBRTtBQUZNLFNBQVo7QUFJRDtBQUNGOztBQUdELElBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZ0IsR0FBRCxJQUFTO0FBQ3RCLE1BQUEsR0FBRyxDQUFDLE9BQUosR0FBYyxLQUFLLENBQUMsd0JBQXBCOztBQUNBLFdBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsR0FBbkI7QUFDRCxLQUhEO0FBSUQ7O0FBRUQsRUFBQSxhQUFhLENBQUMsRUFBRCxFQUFLLE1BQUwsRUFBYTtBQUN4QixVQUFNO0FBQ0osTUFBQSxLQURJO0FBRUosTUFBQSxNQUZJO0FBR0osTUFBQTtBQUhJLFFBSUYsTUFBTSxJQUFJLEVBSmQ7QUFLQSxXQUFPLEVBQUUsQ0FBQyxZQUFILENBQWdCLEtBQUssSUFBckIsRUFBMkI7QUFDOUIsTUFBQSxLQUFLLEVBQUUsS0FEdUI7QUFFOUIsTUFBQSxNQUFNLEVBQUUsTUFGc0I7QUFHOUIsTUFBQSxLQUFLLEVBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQztBQUhRLEtBQTNCLEVBS0osSUFMSSxDQUtFLElBQUQsSUFBVTtBQUNkLE1BQUEsSUFBSSxDQUFDLE9BQUwsQ0FBYyxJQUFELElBQVU7QUFDckIsWUFBSSxJQUFJLENBQUMsR0FBTCxHQUFXLEtBQUssT0FBcEIsRUFBNkI7QUFDM0IsZUFBSyxPQUFMLEdBQWUsSUFBSSxDQUFDLEdBQXBCO0FBQ0Q7O0FBQ0QsWUFBSSxJQUFJLENBQUMsR0FBTCxHQUFXLEtBQUssT0FBaEIsSUFBMkIsS0FBSyxPQUFMLElBQWdCLENBQS9DLEVBQWtEO0FBQ2hELGVBQUssT0FBTCxHQUFlLElBQUksQ0FBQyxHQUFwQjtBQUNEOztBQUNELGFBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsSUFBbkI7QUFDRCxPQVJEOztBQVNBLFVBQUksSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFsQixFQUFxQjtBQUNuQixhQUFLLG9CQUFMO0FBQ0Q7O0FBQ0QsYUFBTyxJQUFJLENBQUMsTUFBWjtBQUNELEtBbkJJLENBQVA7QUFvQkQ7O0FBRUQsRUFBQSxlQUFlLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVztBQUN4QixTQUFLLE9BQUwsR0FBZSxJQUFJLElBQUosRUFBZjtBQUNBLFNBQUssR0FBTCxHQUFXLEdBQUcsR0FBRyxDQUFqQjs7QUFFQSxRQUFJLENBQUMsR0FBRCxJQUFRLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsR0FBbEIsQ0FBWixFQUFvQztBQUNsQyxXQUFLLElBQUwsR0FBWSxLQUFLLElBQUwsR0FBWSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQUssSUFBZCxFQUFvQixLQUFLLEdBQXpCLENBQVosR0FBNEMsS0FBSyxHQUE3RDtBQUNBLFdBQUssSUFBTCxHQUFZLEtBQUssSUFBTCxHQUFZLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBSyxJQUFkLEVBQW9CLEtBQUssSUFBekIsQ0FBWixHQUE2QyxLQUFLLElBQTlEO0FBQ0Q7O0FBQ0QsU0FBSyxNQUFMLEdBQWMsS0FBSyxHQUFMLElBQVksS0FBSyxJQUFMLEdBQVksQ0FBeEIsQ0FBZDs7QUFDQSxTQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLFFBQWpCLENBQTBCLElBQTFCO0FBQ0Q7O0FBMXZEZ0I7Ozs7QUE4d0RaLE1BQU0sT0FBTixTQUFzQixLQUF0QixDQUE0QjtBQUdqQyxFQUFBLFdBQVcsQ0FBQyxTQUFELEVBQVk7QUFDckIsVUFBTSxLQUFLLENBQUMsUUFBWixFQUFzQixTQUF0Qjs7QUFEcUI7O0FBSXJCLFFBQUksU0FBSixFQUFlO0FBQ2IsV0FBSyxlQUFMLEdBQXVCLFNBQVMsQ0FBQyxlQUFqQztBQUNEO0FBQ0Y7O0FBR0QsRUFBQSxnQkFBZ0IsQ0FBQyxJQUFELEVBQU87QUFFckIsVUFBTSxPQUFPLEdBQUksSUFBSSxDQUFDLEdBQUwsSUFBWSxDQUFDLElBQUksQ0FBQyxHQUFMLENBQVMsV0FBVCxFQUFkLElBQTBDLEtBQUssR0FBTCxJQUFZLEtBQUssR0FBTCxDQUFTLFdBQVQsRUFBdEU7QUFHQSx5QkFBUyxJQUFULEVBQWUsSUFBZjs7QUFDQSxTQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLFFBQWpCLENBQTBCLElBQTFCOztBQUVBLFNBQUssaUJBQUwsQ0FBdUIsS0FBSyxPQUFMLENBQWEsTUFBcEMsRUFBNEMsSUFBNUM7O0FBR0EsUUFBSSxPQUFKLEVBQWE7QUFDWCxXQUFLLE9BQUwsQ0FBYSxTQUFiLENBQXdCLElBQUQsSUFBVTtBQUMvQixZQUFJLElBQUksQ0FBQyxNQUFULEVBQWlCO0FBQ2YsVUFBQSxJQUFJLENBQUMsTUFBTCxHQUFjLEtBQWQ7QUFDQSxVQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFJLENBQUMsSUFBTCxJQUFhLEVBQTNCLEVBQStCO0FBQ3pDLFlBQUEsSUFBSSxFQUFFLElBQUksSUFBSjtBQURtQyxXQUEvQixDQUFaOztBQUdBLGVBQUssZUFBTCxDQUFxQixLQUFyQixFQUE0QixJQUE1QjtBQUNEO0FBQ0YsT0FSRDtBQVNEOztBQUVELFFBQUksS0FBSyxVQUFULEVBQXFCO0FBQ25CLFdBQUssVUFBTCxDQUFnQixJQUFoQjtBQUNEO0FBQ0Y7O0FBR0QsRUFBQSxlQUFlLENBQUMsSUFBRCxFQUFPO0FBQ3BCLFFBQUksV0FBVyxHQUFHLENBQWxCO0FBQ0EsSUFBQSxJQUFJLENBQUMsT0FBTCxDQUFjLEdBQUQsSUFBUztBQUNwQixZQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsS0FBdEI7O0FBRUEsVUFBSSxTQUFTLElBQUksS0FBSyxDQUFDLFNBQW5CLElBQWdDLFNBQVMsSUFBSSxLQUFLLENBQUMsUUFBdkQsRUFBaUU7QUFDL0Q7QUFDRDs7QUFDRCxNQUFBLEdBQUcsQ0FBQyxNQUFKLEdBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFuQjtBQUVBLFVBQUksSUFBSSxHQUFHLElBQVg7O0FBQ0EsVUFBSSxHQUFHLENBQUMsT0FBUixFQUFpQjtBQUNmLFFBQUEsSUFBSSxHQUFHLEdBQVA7O0FBQ0EsYUFBSyxPQUFMLENBQWEsYUFBYixDQUEyQixTQUEzQjs7QUFDQSxhQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLFFBQWpCLENBQTBCLFNBQTFCO0FBQ0QsT0FKRCxNQUlPO0FBRUwsWUFBSSxPQUFPLEdBQUcsQ0FBQyxHQUFYLElBQWtCLFdBQXRCLEVBQW1DO0FBQ2pDLFVBQUEsR0FBRyxDQUFDLEdBQUosR0FBVSxHQUFHLENBQUMsR0FBSixHQUFVLENBQXBCO0FBQ0EsVUFBQSxHQUFHLENBQUMsSUFBSixHQUFXLEdBQUcsQ0FBQyxJQUFKLEdBQVcsQ0FBdEI7QUFDQSxVQUFBLEdBQUcsQ0FBQyxJQUFKLEdBQVcsR0FBRyxDQUFDLElBQUosR0FBVyxDQUF0QjtBQUNBLFVBQUEsR0FBRyxDQUFDLE1BQUosR0FBYSxHQUFHLENBQUMsR0FBSixHQUFVLEdBQUcsQ0FBQyxJQUEzQjtBQUNEOztBQUVELGNBQU0sS0FBSyxHQUFHLEtBQUssT0FBTCxDQUFhLFFBQWIsQ0FBc0IsU0FBdEIsQ0FBZDs7QUFDQSxRQUFBLElBQUksR0FBRyxxQkFBUyxLQUFULEVBQWdCLEdBQWhCLENBQVA7O0FBQ0EsYUFBSyxPQUFMLENBQWEsR0FBYixDQUFpQixRQUFqQixDQUEwQixJQUExQjs7QUFFQSxZQUFJLEtBQUssQ0FBQyxjQUFOLENBQXFCLFNBQXJCLENBQUosRUFBcUM7QUFDbkMsZUFBSyxhQUFMLENBQW1CLFNBQW5CLEVBQThCLElBQTlCOztBQUNBLGVBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsT0FBakIsQ0FBeUIsU0FBekIsRUFBb0MsSUFBSSxDQUFDLE1BQXpDO0FBQ0Q7O0FBRUQsWUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFMLElBQXNCLEtBQTFCLEVBQWlDO0FBQy9CLFVBQUEsR0FBRyxDQUFDLGFBQUosR0FBb0IsSUFBcEI7O0FBQ0EsVUFBQSxLQUFLLENBQUMsZ0JBQU4sQ0FBdUIsR0FBdkI7QUFDRDtBQUNGOztBQUVELE1BQUEsV0FBVzs7QUFFWCxVQUFJLEtBQUssU0FBVCxFQUFvQjtBQUNsQixhQUFLLFNBQUwsQ0FBZSxJQUFmO0FBQ0Q7QUFDRixLQTFDRDs7QUE0Q0EsUUFBSSxLQUFLLGFBQUwsSUFBc0IsV0FBVyxHQUFHLENBQXhDLEVBQTJDO0FBQ3pDLFlBQU0sSUFBSSxHQUFHLEVBQWI7QUFDQSxNQUFBLElBQUksQ0FBQyxPQUFMLENBQWMsQ0FBRCxJQUFPO0FBQ2xCLFFBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFDLENBQUMsS0FBWjtBQUNELE9BRkQ7QUFHQSxXQUFLLGFBQUwsQ0FBbUIsSUFBbkIsRUFBeUIsV0FBekI7QUFDRDtBQUNGOztBQUdELEVBQUEsaUJBQWlCLENBQUMsS0FBRCxFQUFRLEdBQVIsRUFBYTtBQUM1QixRQUFJLEtBQUssQ0FBQyxNQUFOLElBQWdCLENBQWhCLElBQXFCLEtBQUssQ0FBQyxDQUFELENBQUwsSUFBWSxLQUFLLENBQUMsUUFBM0MsRUFBcUQ7QUFDbkQsTUFBQSxLQUFLLEdBQUcsRUFBUjtBQUNEOztBQUNELFFBQUksR0FBSixFQUFTO0FBQ1AsTUFBQSxLQUFLLENBQUMsT0FBTixDQUFlLEVBQUQsSUFBUTtBQUNwQixZQUFJLEVBQUUsQ0FBQyxHQUFQLEVBQVk7QUFFVixjQUFJLEdBQUcsR0FBRyxLQUFLLFlBQUwsQ0FBa0IsU0FBbEIsQ0FBNkIsRUFBRCxJQUFRO0FBQzVDLG1CQUFPLEVBQUUsQ0FBQyxJQUFILElBQVcsRUFBRSxDQUFDLElBQWQsSUFBc0IsRUFBRSxDQUFDLEdBQUgsSUFBVSxFQUFFLENBQUMsR0FBMUM7QUFDRCxXQUZTLENBQVY7O0FBR0EsY0FBSSxHQUFHLEdBQUcsQ0FBVixFQUFhO0FBRVgsZ0JBQUksQ0FBQyxFQUFFLENBQUMsSUFBUixFQUFjO0FBRVosY0FBQSxHQUFHLEdBQUcsS0FBSyxZQUFMLENBQWtCLFNBQWxCLENBQTZCLEVBQUQsSUFBUTtBQUN4Qyx1QkFBTyxFQUFFLENBQUMsSUFBSCxJQUFXLEVBQUUsQ0FBQyxJQUFkLElBQXNCLENBQUMsRUFBRSxDQUFDLElBQWpDO0FBQ0QsZUFGSyxDQUFOOztBQUdBLGtCQUFJLEdBQUcsSUFBSSxDQUFYLEVBQWM7QUFFWixxQkFBSyxZQUFMLENBQWtCLE1BQWxCLENBQXlCLEdBQXpCLEVBQThCLENBQTlCO0FBQ0Q7QUFDRjs7QUFDRCxpQkFBSyxZQUFMLENBQWtCLElBQWxCLENBQXVCLEVBQXZCO0FBQ0QsV0FiRCxNQWFPO0FBRUwsaUJBQUssWUFBTCxDQUFrQixHQUFsQixFQUF1QixJQUF2QixHQUE4QixFQUFFLENBQUMsSUFBakM7QUFDRDtBQUNGLFNBdEJELE1Bc0JPLElBQUksRUFBRSxDQUFDLElBQVAsRUFBYTtBQUVsQixnQkFBTSxHQUFHLEdBQUcsS0FBSyxZQUFMLENBQWtCLFNBQWxCLENBQTZCLEVBQUQsSUFBUTtBQUM5QyxtQkFBTyxFQUFFLENBQUMsSUFBSCxJQUFXLEVBQUUsQ0FBQyxJQUFkLElBQXNCLENBQUMsRUFBRSxDQUFDLElBQWpDO0FBQ0QsV0FGVyxDQUFaOztBQUdBLGNBQUksR0FBRyxJQUFJLENBQVgsRUFBYztBQUNaLGlCQUFLLFlBQUwsQ0FBa0IsR0FBbEIsRUFBdUIsSUFBdkIsR0FBOEIsSUFBOUI7QUFDRDtBQUNGO0FBQ0YsT0FoQ0Q7QUFpQ0QsS0FsQ0QsTUFrQ087QUFDTCxXQUFLLFlBQUwsR0FBb0IsS0FBcEI7QUFDRDs7QUFDRCxRQUFJLEtBQUssY0FBVCxFQUF5QjtBQUN2QixXQUFLLGNBQUwsQ0FBb0IsS0FBSyxZQUF6QjtBQUNEO0FBQ0Y7O0FBR0QsRUFBQSxVQUFVLENBQUMsSUFBRCxFQUFPO0FBQ2YsUUFBSSxJQUFJLENBQUMsSUFBTCxJQUFhLE1BQWpCLEVBQXlCO0FBRXZCLFdBQUssU0FBTDs7QUFDQTtBQUNEOztBQUVELFFBQUksSUFBSSxDQUFDLElBQUwsSUFBYSxLQUFiLElBQXNCLElBQUksQ0FBQyxHQUFMLElBQVksS0FBSyxDQUFDLFFBQTVDLEVBQXNEO0FBRXBELFdBQUssT0FBTCxDQUFhLEtBQUssY0FBTCxHQUFzQixRQUF0QixHQUFpQyxLQUFqQyxFQUFiO0FBQ0E7QUFDRDs7QUFFRCxVQUFNLElBQUksR0FBRyxLQUFLLE9BQUwsQ0FBYSxhQUFiLENBQTJCLElBQUksQ0FBQyxHQUFoQyxDQUFiOztBQUNBLFFBQUksSUFBSixFQUFVO0FBQ1IsY0FBUSxJQUFJLENBQUMsSUFBYjtBQUNFLGFBQUssSUFBTDtBQUNFLFVBQUEsSUFBSSxDQUFDLE1BQUwsR0FBYyxJQUFkO0FBQ0E7O0FBQ0YsYUFBSyxLQUFMO0FBQ0UsY0FBSSxJQUFJLENBQUMsTUFBVCxFQUFpQjtBQUNmLFlBQUEsSUFBSSxDQUFDLE1BQUwsR0FBYyxLQUFkO0FBQ0EsWUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBSSxDQUFDLElBQUwsSUFBYSxFQUEzQixFQUErQjtBQUN6QyxjQUFBLElBQUksRUFBRSxJQUFJLElBQUo7QUFEbUMsYUFBL0IsQ0FBWjtBQUdEOztBQUNEOztBQUNGLGFBQUssS0FBTDtBQUNFLFVBQUEsSUFBSSxDQUFDLGVBQUwsQ0FBcUIsSUFBSSxDQUFDLEdBQTFCLEVBQStCLElBQUksQ0FBQyxHQUFwQzs7QUFDQTs7QUFDRixhQUFLLEtBQUw7QUFFRSxlQUFLLE9BQUwsQ0FBYSxLQUFLLGNBQUwsR0FBc0IsZUFBdEIsQ0FBc0MsSUFBSSxDQUFDLEdBQTNDLEVBQWdELEtBQWhELEVBQWI7QUFDQTs7QUFDRixhQUFLLEtBQUw7QUFDRSxjQUFJLElBQUksQ0FBQyxHQUFULEVBQWM7QUFDWixZQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsU0FBVCxDQUFtQixJQUFJLENBQUMsSUFBeEI7QUFDRCxXQUZELE1BRU87QUFDTCxZQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsSUFBSSxtQkFBSixHQUFpQixTQUFqQixDQUEyQixJQUFJLENBQUMsSUFBaEMsQ0FBWDtBQUNEOztBQUNELFVBQUEsSUFBSSxDQUFDLE9BQUwsR0FBZSxJQUFJLElBQUosRUFBZjtBQUNBOztBQUNGLGFBQUssSUFBTDtBQUVFLFVBQUEsSUFBSSxDQUFDLElBQUwsR0FBWTtBQUNWLFlBQUEsSUFBSSxFQUFFLElBQUksSUFBSixFQURJO0FBRVYsWUFBQSxFQUFFLEVBQUUsSUFBSSxDQUFDO0FBRkMsV0FBWjtBQUlBOztBQUNGLGFBQUssTUFBTDtBQUVFLFVBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLENBQUMsR0FBTCxHQUFXLENBQXRCO0FBQ0EsVUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFJLENBQUMsSUFBZCxFQUFvQixJQUFJLENBQUMsR0FBekIsQ0FBWixHQUE0QyxJQUFJLENBQUMsR0FBN0Q7QUFDQTs7QUFDRixhQUFLLE1BQUw7QUFFRSxVQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsSUFBSSxDQUFDLEdBQUwsR0FBVyxDQUF0QjtBQUNBLFVBQUEsSUFBSSxDQUFDLElBQUwsR0FBWSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBSSxDQUFDLElBQWQsRUFBb0IsSUFBSSxDQUFDLEdBQXpCLENBQVosR0FBNEMsSUFBSSxDQUFDLEdBQTdEO0FBQ0EsVUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFJLENBQUMsSUFBZCxFQUFvQixJQUFJLENBQUMsSUFBekIsQ0FBWixHQUE2QyxJQUFJLENBQUMsSUFBOUQ7QUFDQSxVQUFBLElBQUksQ0FBQyxNQUFMLEdBQWMsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLENBQUMsSUFBOUI7QUFDQTs7QUFDRixhQUFLLE1BQUw7QUFFRSxjQUFJLENBQUMsSUFBSSxDQUFDLFFBQVYsRUFBb0I7QUFDbEIsWUFBQSxJQUFJLENBQUMsUUFBTCxHQUFnQixJQUFoQjtBQUNBLFlBQUEsSUFBSSxDQUFDLFNBQUwsR0FBaUIsS0FBakI7O0FBQ0EsaUJBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsa0JBQWpCLENBQW9DLElBQUksQ0FBQyxHQUF6QyxFQUE4QyxJQUE5QztBQUNEOztBQUNEOztBQUNGLGFBQUssS0FBTDtBQUVFOztBQUNGO0FBQ0UsZUFBSyxPQUFMLENBQWEsTUFBYixDQUFvQiwyQ0FBcEIsRUFBaUUsSUFBSSxDQUFDLElBQXRFOztBQTFESjs7QUE2REEsV0FBSyxlQUFMLENBQXFCLElBQUksQ0FBQyxJQUExQixFQUFnQyxJQUFoQztBQUNELEtBL0RELE1BK0RPO0FBQ0wsVUFBSSxJQUFJLENBQUMsSUFBTCxJQUFhLEtBQWpCLEVBQXdCO0FBSXRCLGNBQU0sR0FBRyxHQUFHLElBQUksbUJBQUosQ0FBZSxJQUFJLENBQUMsSUFBcEIsQ0FBWjs7QUFDQSxZQUFJLENBQUMsR0FBRCxJQUFRLEdBQUcsQ0FBQyxJQUFKLElBQVksb0JBQVcsUUFBbkMsRUFBNkM7QUFDM0MsZUFBSyxPQUFMLENBQWEsTUFBYixDQUFvQixtQ0FBcEIsRUFBeUQsSUFBSSxDQUFDLEdBQTlELEVBQW1FLElBQUksQ0FBQyxJQUF4RTs7QUFDQTtBQUNELFNBSEQsTUFHTyxJQUFJLEdBQUcsQ0FBQyxJQUFKLElBQVksb0JBQVcsS0FBM0IsRUFBa0M7QUFDdkMsZUFBSyxPQUFMLENBQWEsTUFBYixDQUFvQiw2Q0FBcEIsRUFBbUUsSUFBSSxDQUFDLEdBQXhFLEVBQTZFLElBQUksQ0FBQyxJQUFsRjs7QUFDQTtBQUNELFNBSE0sTUFHQTtBQUdMLGVBQUssT0FBTCxDQUFhLEtBQUssY0FBTCxHQUFzQixVQUF0QixDQUFpQyxTQUFqQyxFQUE0QyxJQUFJLENBQUMsR0FBakQsRUFBc0QsS0FBdEQsRUFBYjs7QUFFQSxnQkFBTSxLQUFLLEdBQUcsS0FBSyxPQUFMLENBQWEsUUFBYixDQUFzQixJQUFJLENBQUMsR0FBM0IsQ0FBZDs7QUFDQSxVQUFBLEtBQUssQ0FBQyxLQUFOLEdBQWMsSUFBSSxDQUFDLEdBQW5CO0FBQ0EsVUFBQSxLQUFLLENBQUMsTUFBTixHQUFlLEtBQWY7QUFDQSxVQUFBLEtBQUssQ0FBQyxHQUFOLEdBQVksR0FBWjs7QUFDQSxlQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLFFBQWpCLENBQTBCLEtBQTFCO0FBQ0Q7QUFDRixPQXRCRCxNQXNCTyxJQUFJLElBQUksQ0FBQyxJQUFMLElBQWEsTUFBakIsRUFBeUI7QUFDOUIsYUFBSyxPQUFMLENBQWEsS0FBSyxjQUFMLEdBQXNCLFFBQXRCLEdBQWlDLEtBQWpDLEVBQWI7QUFDRDtBQUNGOztBQUVELFFBQUksS0FBSyxNQUFULEVBQWlCO0FBQ2YsV0FBSyxNQUFMLENBQVksSUFBWjtBQUNEO0FBQ0Y7O0FBR0QsRUFBQSxlQUFlLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBYTtBQUMxQixRQUFJLEtBQUssZUFBVCxFQUEwQjtBQUN4QixXQUFLLGVBQUwsQ0FBcUIsSUFBckIsRUFBMkIsSUFBM0I7QUFDRDtBQUNGOztBQU9ELEVBQUEsT0FBTyxHQUFHO0FBQ1IsV0FBTyxPQUFPLENBQUMsTUFBUixDQUFlLElBQUksS0FBSixDQUFVLHFDQUFWLENBQWYsQ0FBUDtBQUNEOztBQVVELEVBQUEsYUFBYSxDQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCO0FBQzNCLFFBQUksQ0FBQyxLQUFLLFNBQVYsRUFBcUI7QUFDbkIsYUFBTyxPQUFPLENBQUMsTUFBUixDQUFlLElBQUksS0FBSixDQUFVLGlEQUFWLENBQWYsQ0FBUDtBQUNEOztBQUVELFdBQU8sS0FBSyxPQUFMLENBQWEsYUFBYixDQUEyQixNQUEzQixFQUFtQyxLQUFuQyxFQUEwQyxJQUExQyxDQUFnRCxJQUFELElBQVU7QUFFOUQsWUFBTSxLQUFLLEdBQUcsS0FBSyxZQUFMLENBQWtCLFNBQWxCLENBQTZCLEVBQUQsSUFBUTtBQUNoRCxlQUFPLEVBQUUsQ0FBQyxJQUFILElBQVcsTUFBWCxJQUFxQixFQUFFLENBQUMsR0FBSCxJQUFVLEtBQXRDO0FBQ0QsT0FGYSxDQUFkOztBQUdBLFVBQUksS0FBSyxHQUFHLENBQUMsQ0FBYixFQUFnQjtBQUNkLGFBQUssWUFBTCxDQUFrQixNQUFsQixDQUF5QixLQUF6QixFQUFnQyxDQUFoQztBQUNEOztBQUVELFVBQUksS0FBSyxjQUFULEVBQXlCO0FBQ3ZCLGFBQUssY0FBTCxDQUFvQixLQUFLLFlBQXpCO0FBQ0Q7O0FBQ0QsYUFBTyxJQUFQO0FBQ0QsS0FiTSxDQUFQO0FBY0Q7O0FBaUJELEVBQUEsUUFBUSxDQUFDLFFBQUQsRUFBVyxNQUFYLEVBQW1CLE9BQW5CLEVBQTRCO0FBQ2xDLFNBQUssT0FBTCxDQUFhLFNBQWIsQ0FBdUIsQ0FBQyxDQUFELEVBQUksR0FBSixLQUFZO0FBQ2pDLFVBQUksQ0FBQyxDQUFDLFVBQUYsT0FBbUIsQ0FBQyxNQUFELElBQVcsTUFBTSxDQUFDLENBQUQsQ0FBcEMsQ0FBSixFQUE4QztBQUM1QyxRQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsT0FBZCxFQUF1QixDQUF2QixFQUEwQixHQUExQjtBQUNEO0FBQ0YsS0FKRDtBQUtEOztBQVNELEVBQUEsVUFBVSxDQUFDLElBQUQsRUFBTztBQUNmLFdBQU8sS0FBSyxPQUFMLENBQWEsYUFBYixDQUEyQixJQUEzQixDQUFQO0FBQ0Q7O0FBVUQsRUFBQSxhQUFhLENBQUMsSUFBRCxFQUFPO0FBQ2xCLFFBQUksSUFBSixFQUFVO0FBQ1IsWUFBTSxJQUFJLEdBQUcsS0FBSyxPQUFMLENBQWEsYUFBYixDQUEyQixJQUEzQixDQUFiOztBQUNBLGFBQU8sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFSLEdBQWMsSUFBekI7QUFDRDs7QUFDRCxXQUFPLEtBQUssR0FBWjtBQUNEOztBQVNELEVBQUEsVUFBVSxDQUFDLElBQUQsRUFBTztBQUNmLFVBQU0sSUFBSSxHQUFHLEtBQUssT0FBTCxDQUFhLGFBQWIsQ0FBMkIsSUFBM0IsQ0FBYjs7QUFDQSxXQUFPLElBQUksSUFBSSxJQUFJLENBQUMsT0FBYixJQUF3QixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUE5QztBQUNEOztBQWdCRCxFQUFBLGNBQWMsR0FBRztBQUNmLFdBQU8sS0FBSyxZQUFaO0FBQ0Q7O0FBMVhnQzs7OztBQXFZNUIsTUFBTSxRQUFOLFNBQXVCLEtBQXZCLENBQTZCO0FBSWxDLEVBQUEsV0FBVyxDQUFDLFNBQUQsRUFBWTtBQUNyQixVQUFNLEtBQUssQ0FBQyxTQUFaLEVBQXVCLFNBQXZCOztBQURxQix1Q0FGWCxFQUVXO0FBRXRCOztBQUdELEVBQUEsZUFBZSxDQUFDLElBQUQsRUFBTztBQUNwQixRQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsbUJBQVAsQ0FBMkIsS0FBSyxTQUFoQyxFQUEyQyxNQUE3RDtBQUVBLFNBQUssU0FBTCxHQUFpQixFQUFqQjs7QUFDQSxTQUFLLElBQUksR0FBVCxJQUFnQixJQUFoQixFQUFzQjtBQUNwQixVQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRCxDQUFkO0FBQ0EsWUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLEtBQUosR0FBWSxHQUFHLENBQUMsS0FBaEIsR0FBd0IsR0FBRyxDQUFDLElBQTVDO0FBRUEsTUFBQSxHQUFHLEdBQUcseUJBQWEsS0FBSyxTQUFsQixFQUE2QixPQUE3QixFQUFzQyxHQUF0QyxDQUFOO0FBQ0EsTUFBQSxXQUFXOztBQUVYLFVBQUksS0FBSyxTQUFULEVBQW9CO0FBQ2xCLGFBQUssU0FBTCxDQUFlLEdBQWY7QUFDRDtBQUNGOztBQUVELFFBQUksV0FBVyxHQUFHLENBQWQsSUFBbUIsS0FBSyxhQUE1QixFQUEyQztBQUN6QyxXQUFLLGFBQUwsQ0FBbUIsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFLLFNBQWpCLENBQW5CO0FBQ0Q7QUFDRjs7QUFPRCxFQUFBLE9BQU8sR0FBRztBQUNSLFdBQU8sT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFJLEtBQUosQ0FBVSxzQ0FBVixDQUFmLENBQVA7QUFDRDs7QUFRRCxFQUFBLE9BQU8sQ0FBQyxNQUFELEVBQVM7QUFDZCxXQUFPLE1BQU0sQ0FBQyxjQUFQLENBQXNCLFFBQVEsQ0FBQyxTQUEvQixFQUEwQyxPQUExQyxDQUFrRCxJQUFsRCxDQUF1RCxJQUF2RCxFQUE2RCxNQUE3RCxFQUFxRSxJQUFyRSxDQUEwRSxNQUFNO0FBQ3JGLFVBQUksTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFLLFNBQWpCLEVBQTRCLE1BQTVCLEdBQXFDLENBQXpDLEVBQTRDO0FBQzFDLGFBQUssU0FBTCxHQUFpQixFQUFqQjs7QUFDQSxZQUFJLEtBQUssYUFBVCxFQUF3QjtBQUN0QixlQUFLLGFBQUwsQ0FBbUIsRUFBbkI7QUFDRDtBQUNGO0FBQ0YsS0FQTSxDQUFQO0FBUUQ7O0FBU0QsRUFBQSxRQUFRLENBQUMsUUFBRCxFQUFXLE9BQVgsRUFBb0I7QUFDMUIsVUFBTSxFQUFFLEdBQUksUUFBUSxJQUFJLEtBQUssU0FBN0I7O0FBQ0EsUUFBSSxFQUFKLEVBQVE7QUFDTixXQUFLLElBQUksR0FBVCxJQUFnQixLQUFLLFNBQXJCLEVBQWdDO0FBQzlCLFFBQUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxPQUFSLEVBQWlCLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBakIsRUFBc0MsR0FBdEMsRUFBMkMsS0FBSyxTQUFoRDtBQUNEO0FBQ0Y7QUFDRjs7QUF0RWlDOzs7OztBQ2hxRXBDOzs7Ozs7Ozs7Ozs7O0FBRUE7O0FBQ0E7Ozs7QUFHTyxTQUFTLGVBQVQsQ0FBeUIsR0FBekIsRUFBOEIsR0FBOUIsRUFBbUM7QUFHeEMsTUFBSSxPQUFPLEdBQVAsSUFBYyxRQUFkLElBQTBCLEdBQUcsQ0FBQyxNQUFKLElBQWMsRUFBeEMsSUFBOEMsR0FBRyxDQUFDLE1BQUosSUFBYyxFQUE1RCxJQUFrRSxDQUFDLElBQUQsRUFBTyxTQUFQLEVBQWtCLFNBQWxCLEVBQTZCLFNBQTdCLEVBQXdDLE1BQXhDLEVBQWdELFNBQWhELEVBQTJELFNBQTNELEVBQXNFLFFBQXRFLENBQStFLEdBQS9FLENBQXRFLEVBQTJKO0FBRXpKLFVBQU0sSUFBSSxHQUFHLElBQUksSUFBSixDQUFTLEdBQVQsQ0FBYjs7QUFDQSxRQUFJLENBQUMsS0FBSyxDQUFDLElBQUQsQ0FBVixFQUFrQjtBQUNoQixhQUFPLElBQVA7QUFDRDtBQUNGLEdBTkQsTUFNTyxJQUFJLEdBQUcsS0FBSyxLQUFSLElBQWlCLE9BQU8sR0FBUCxLQUFlLFFBQXBDLEVBQThDO0FBQ25ELFdBQU8sSUFBSSxtQkFBSixDQUFlLEdBQWYsQ0FBUDtBQUNEOztBQUNELFNBQU8sR0FBUDtBQUNEOztBQVFNLFNBQVMsYUFBVCxDQUF1QixHQUF2QixFQUE0QjtBQUNqQyxTQUFPLEdBQUcsSUFBSSxDQUFDLGtDQUFrQyxJQUFsQyxDQUF1QyxHQUF2QyxDQUFmO0FBQ0Q7O0FBRUQsU0FBUyxXQUFULENBQXFCLENBQXJCLEVBQXdCO0FBQ3RCLFNBQVEsQ0FBQyxZQUFZLElBQWQsSUFBdUIsQ0FBQyxLQUFLLENBQUMsQ0FBRCxDQUE3QixJQUFxQyxDQUFDLENBQUMsT0FBRixNQUFlLENBQTNEO0FBQ0Q7O0FBR00sU0FBUyxpQkFBVCxDQUEyQixDQUEzQixFQUE4QjtBQUNuQyxNQUFJLENBQUMsV0FBVyxDQUFDLENBQUQsQ0FBaEIsRUFBcUI7QUFDbkIsV0FBTyxTQUFQO0FBQ0Q7O0FBRUQsUUFBTSxHQUFHLEdBQUcsVUFBUyxHQUFULEVBQWMsRUFBZCxFQUFrQjtBQUM1QixJQUFBLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBWDtBQUNBLFdBQU8sSUFBSSxNQUFKLENBQVcsRUFBRSxHQUFHLENBQUMsS0FBSyxHQUFOLEVBQVcsTUFBM0IsSUFBcUMsR0FBNUM7QUFDRCxHQUhEOztBQUtBLFFBQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxrQkFBRixFQUFmO0FBQ0EsU0FBTyxDQUFDLENBQUMsY0FBRixLQUFxQixHQUFyQixHQUEyQixHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQUYsS0FBa0IsQ0FBbkIsQ0FBOUIsR0FBc0QsR0FBdEQsR0FBNEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxVQUFGLEVBQUQsQ0FBL0QsR0FDTCxHQURLLEdBQ0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxXQUFGLEVBQUQsQ0FESixHQUN3QixHQUR4QixHQUM4QixHQUFHLENBQUMsQ0FBQyxDQUFDLGFBQUYsRUFBRCxDQURqQyxHQUN1RCxHQUR2RCxHQUM2RCxHQUFHLENBQUMsQ0FBQyxDQUFDLGFBQUYsRUFBRCxDQURoRSxJQUVKLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFELEVBQVMsQ0FBVCxDQUFaLEdBQTBCLEVBRjVCLElBRWtDLEdBRnpDO0FBR0Q7O0FBS00sU0FBUyxRQUFULENBQWtCLEdBQWxCLEVBQXVCLEdBQXZCLEVBQTRCLE1BQTVCLEVBQW9DO0FBQ3pDLE1BQUksT0FBTyxHQUFQLElBQWMsUUFBbEIsRUFBNEI7QUFDMUIsUUFBSSxHQUFHLEtBQUssU0FBWixFQUF1QjtBQUNyQixhQUFPLEdBQVA7QUFDRDs7QUFDRCxRQUFJLEdBQUcsS0FBSyxlQUFaLEVBQXNCO0FBQ3BCLGFBQU8sU0FBUDtBQUNEOztBQUNELFdBQU8sR0FBUDtBQUNEOztBQUVELE1BQUksR0FBRyxLQUFLLElBQVosRUFBa0I7QUFDaEIsV0FBTyxHQUFQO0FBQ0Q7O0FBR0QsTUFBSSxHQUFHLFlBQVksSUFBZixJQUF1QixDQUFDLEtBQUssQ0FBQyxHQUFELENBQWpDLEVBQXdDO0FBQ3RDLFdBQVEsQ0FBQyxHQUFELElBQVEsRUFBRSxHQUFHLFlBQVksSUFBakIsQ0FBUixJQUFrQyxLQUFLLENBQUMsR0FBRCxDQUF2QyxJQUFnRCxHQUFHLEdBQUcsR0FBdkQsR0FBOEQsR0FBOUQsR0FBb0UsR0FBM0U7QUFDRDs7QUFHRCxNQUFJLEdBQUcsWUFBWSxtQkFBbkIsRUFBK0I7QUFDN0IsV0FBTyxJQUFJLG1CQUFKLENBQWUsR0FBZixDQUFQO0FBQ0Q7O0FBR0QsTUFBSSxHQUFHLFlBQVksS0FBbkIsRUFBMEI7QUFDeEIsV0FBTyxHQUFQO0FBQ0Q7O0FBRUQsTUFBSSxDQUFDLEdBQUQsSUFBUSxHQUFHLEtBQUssZUFBcEIsRUFBOEI7QUFDNUIsSUFBQSxHQUFHLEdBQUcsR0FBRyxDQUFDLFdBQUosRUFBTjtBQUNEOztBQUVELE9BQUssSUFBSSxJQUFULElBQWlCLEdBQWpCLEVBQXNCO0FBQ3BCLFFBQUksR0FBRyxDQUFDLGNBQUosQ0FBbUIsSUFBbkIsTUFBNkIsQ0FBQyxNQUFELElBQVcsQ0FBQyxNQUFNLENBQUMsSUFBRCxDQUEvQyxLQUEyRCxJQUFJLElBQUksZUFBdkUsRUFBeUY7QUFDdkYsTUFBQSxHQUFHLENBQUMsSUFBRCxDQUFILEdBQVksUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFELENBQUosRUFBWSxHQUFHLENBQUMsSUFBRCxDQUFmLENBQXBCO0FBQ0Q7QUFDRjs7QUFDRCxTQUFPLEdBQVA7QUFDRDs7QUFHTSxTQUFTLFlBQVQsQ0FBc0IsS0FBdEIsRUFBNkIsR0FBN0IsRUFBa0MsTUFBbEMsRUFBMEMsTUFBMUMsRUFBa0Q7QUFDdkQsRUFBQSxLQUFLLENBQUMsR0FBRCxDQUFMLEdBQWEsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFELENBQU4sRUFBYSxNQUFiLEVBQXFCLE1BQXJCLENBQXJCO0FBQ0EsU0FBTyxLQUFLLENBQUMsR0FBRCxDQUFaO0FBQ0Q7O0FBSU0sU0FBUyxRQUFULENBQWtCLEdBQWxCLEVBQXVCO0FBQzVCLEVBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxHQUFaLEVBQWlCLE9BQWpCLENBQTBCLEdBQUQsSUFBUztBQUNoQyxRQUFJLEdBQUcsQ0FBQyxDQUFELENBQUgsSUFBVSxHQUFkLEVBQW1CO0FBRWpCLGFBQU8sR0FBRyxDQUFDLEdBQUQsQ0FBVjtBQUNELEtBSEQsTUFHTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUQsQ0FBUixFQUFlO0FBRXBCLGFBQU8sR0FBRyxDQUFDLEdBQUQsQ0FBVjtBQUNELEtBSE0sTUFHQSxJQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBRyxDQUFDLEdBQUQsQ0FBakIsS0FBMkIsR0FBRyxDQUFDLEdBQUQsQ0FBSCxDQUFTLE1BQVQsSUFBbUIsQ0FBbEQsRUFBcUQ7QUFFMUQsYUFBTyxHQUFHLENBQUMsR0FBRCxDQUFWO0FBQ0QsS0FITSxNQUdBLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRCxDQUFSLEVBQWU7QUFFcEIsYUFBTyxHQUFHLENBQUMsR0FBRCxDQUFWO0FBQ0QsS0FITSxNQUdBLElBQUksR0FBRyxDQUFDLEdBQUQsQ0FBSCxZQUFvQixJQUF4QixFQUE4QjtBQUVuQyxVQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFELENBQUosQ0FBaEIsRUFBNEI7QUFDMUIsZUFBTyxHQUFHLENBQUMsR0FBRCxDQUFWO0FBQ0Q7QUFDRixLQUxNLE1BS0EsSUFBSSxPQUFPLEdBQUcsQ0FBQyxHQUFELENBQVYsSUFBbUIsUUFBdkIsRUFBaUM7QUFDdEMsTUFBQSxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUQsQ0FBSixDQUFSOztBQUVBLFVBQUksTUFBTSxDQUFDLG1CQUFQLENBQTJCLEdBQUcsQ0FBQyxHQUFELENBQTlCLEVBQXFDLE1BQXJDLElBQStDLENBQW5ELEVBQXNEO0FBQ3BELGVBQU8sR0FBRyxDQUFDLEdBQUQsQ0FBVjtBQUNEO0FBQ0Y7QUFDRixHQXpCRDtBQTBCQSxTQUFPLEdBQVA7QUFDRDs7QUFBQTs7QUFLTSxTQUFTLGNBQVQsQ0FBd0IsR0FBeEIsRUFBNkI7QUFDbEMsTUFBSSxHQUFHLEdBQUcsRUFBVjs7QUFDQSxNQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxDQUFKLEVBQXdCO0FBRXRCLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBUixFQUFXLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBeEIsRUFBZ0MsQ0FBQyxHQUFHLENBQXBDLEVBQXVDLENBQUMsRUFBeEMsRUFBNEM7QUFDMUMsVUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUQsQ0FBWDs7QUFDQSxVQUFJLENBQUosRUFBTztBQUNMLFFBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFGLEdBQVMsV0FBVCxFQUFKOztBQUNBLFlBQUksQ0FBQyxDQUFDLE1BQUYsR0FBVyxDQUFmLEVBQWtCO0FBQ2hCLFVBQUEsR0FBRyxDQUFDLElBQUosQ0FBUyxDQUFUO0FBQ0Q7QUFDRjtBQUNGOztBQUNELElBQUEsR0FBRyxDQUFDLElBQUosR0FBVyxNQUFYLENBQWtCLFVBQVMsSUFBVCxFQUFlLEdBQWYsRUFBb0IsR0FBcEIsRUFBeUI7QUFDekMsYUFBTyxDQUFDLEdBQUQsSUFBUSxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFQLENBQTFCO0FBQ0QsS0FGRDtBQUdEOztBQUNELE1BQUksR0FBRyxDQUFDLE1BQUosSUFBYyxDQUFsQixFQUFxQjtBQUduQixJQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsZUFBVDtBQUNEOztBQUNELFNBQU8sR0FBUDtBQUNEOzs7QUN0S0Q7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogQGZpbGUgQWNjZXNzIGNvbnRyb2wgbW9kZWwuXG4gKlxuICogQGNvcHlyaWdodCAyMDE1LTIwMjIgVGlub2RlIExMQy5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyBOT1RFIFRPIERFVkVMT1BFUlM6XG4vLyBMb2NhbGl6YWJsZSBzdHJpbmdzIHNob3VsZCBiZSBkb3VibGUgcXVvdGVkIFwi0YHRgtGA0L7QutCwINC90LAg0LTRgNGD0LPQvtC8INGP0LfRi9C60LVcIixcbi8vIG5vbi1sb2NhbGl6YWJsZSBzdHJpbmdzIHNob3VsZCBiZSBzaW5nbGUgcXVvdGVkICdub24tbG9jYWxpemVkJy5cblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgZm9yIGhhbmRsaW5nIGFjY2VzcyBtb2RlLlxuICpcbiAqIEBjbGFzcyBBY2Nlc3NNb2RlXG4gKiBAbWVtYmVyb2YgVGlub2RlXG4gKlxuICogQHBhcmFtIHtBY2Nlc3NNb2RlfE9iamVjdD19IGFjcyAtIEFjY2Vzc01vZGUgdG8gY29weSBvciBhY2Nlc3MgbW9kZSBvYmplY3QgcmVjZWl2ZWQgZnJvbSB0aGUgc2VydmVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBY2Nlc3NNb2RlIHtcbiAgY29uc3RydWN0b3IoYWNzKSB7XG4gICAgaWYgKGFjcykge1xuICAgICAgdGhpcy5naXZlbiA9IHR5cGVvZiBhY3MuZ2l2ZW4gPT0gJ251bWJlcicgPyBhY3MuZ2l2ZW4gOiBBY2Nlc3NNb2RlLmRlY29kZShhY3MuZ2l2ZW4pO1xuICAgICAgdGhpcy53YW50ID0gdHlwZW9mIGFjcy53YW50ID09ICdudW1iZXInID8gYWNzLndhbnQgOiBBY2Nlc3NNb2RlLmRlY29kZShhY3Mud2FudCk7XG4gICAgICB0aGlzLm1vZGUgPSBhY3MubW9kZSA/ICh0eXBlb2YgYWNzLm1vZGUgPT0gJ251bWJlcicgPyBhY3MubW9kZSA6IEFjY2Vzc01vZGUuZGVjb2RlKGFjcy5tb2RlKSkgOlxuICAgICAgICAodGhpcy5naXZlbiAmIHRoaXMud2FudCk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljICNjaGVja0ZsYWcodmFsLCBzaWRlLCBmbGFnKSB7XG4gICAgc2lkZSA9IHNpZGUgfHwgJ21vZGUnO1xuICAgIGlmIChbJ2dpdmVuJywgJ3dhbnQnLCAnbW9kZSddLmluY2x1ZGVzKHNpZGUpKSB7XG4gICAgICByZXR1cm4gKCh2YWxbc2lkZV0gJiBmbGFnKSAhPSAwKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIEFjY2Vzc01vZGUgY29tcG9uZW50ICcke3NpZGV9J2ApO1xuICB9XG4gIC8qKlxuICAgKiBQYXJzZSBzdHJpbmcgaW50byBhbiBhY2Nlc3MgbW9kZSB2YWx1ZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBOdW1iZXJ9IG1vZGUgLSBlaXRoZXIgYSBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFjY2VzcyBtb2RlIHRvIHBhcnNlIG9yIGEgc2V0IG9mIGJpdHMgdG8gYXNzaWduLlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIEFjY2VzcyBtb2RlIGFzIGEgbnVtZXJpYyB2YWx1ZS5cbiAgICovXG4gIHN0YXRpYyBkZWNvZGUoc3RyKSB7XG4gICAgaWYgKCFzdHIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHN0ciA9PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIHN0ciAmIEFjY2Vzc01vZGUuX0JJVE1BU0s7XG4gICAgfSBlbHNlIGlmIChzdHIgPT09ICdOJyB8fCBzdHIgPT09ICduJykge1xuICAgICAgcmV0dXJuIEFjY2Vzc01vZGUuX05PTkU7XG4gICAgfVxuXG4gICAgY29uc3QgYml0bWFzayA9IHtcbiAgICAgICdKJzogQWNjZXNzTW9kZS5fSk9JTixcbiAgICAgICdSJzogQWNjZXNzTW9kZS5fUkVBRCxcbiAgICAgICdXJzogQWNjZXNzTW9kZS5fV1JJVEUsXG4gICAgICAnUCc6IEFjY2Vzc01vZGUuX1BSRVMsXG4gICAgICAnQSc6IEFjY2Vzc01vZGUuX0FQUFJPVkUsXG4gICAgICAnUyc6IEFjY2Vzc01vZGUuX1NIQVJFLFxuICAgICAgJ0QnOiBBY2Nlc3NNb2RlLl9ERUxFVEUsXG4gICAgICAnTyc6IEFjY2Vzc01vZGUuX09XTkVSXG4gICAgfTtcblxuICAgIGxldCBtMCA9IEFjY2Vzc01vZGUuX05PTkU7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgYml0ID0gYml0bWFza1tzdHIuY2hhckF0KGkpLnRvVXBwZXJDYXNlKCldO1xuICAgICAgaWYgKCFiaXQpIHtcbiAgICAgICAgLy8gVW5yZWNvZ25pemVkIGJpdCwgc2tpcC5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBtMCB8PSBiaXQ7XG4gICAgfVxuICAgIHJldHVybiBtMDtcbiAgfVxuICAvKipcbiAgICogQ29udmVydCBudW1lcmljIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhY2Nlc3MgbW9kZSBpbnRvIGEgc3RyaW5nLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsIC0gYWNjZXNzIG1vZGUgdmFsdWUgdG8gY29udmVydCB0byBhIHN0cmluZy5cbiAgICogQHJldHVybnMge3N0cmluZ30gLSBBY2Nlc3MgbW9kZSBhcyBhIHN0cmluZy5cbiAgICovXG4gIHN0YXRpYyBlbmNvZGUodmFsKSB7XG4gICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IEFjY2Vzc01vZGUuX0lOVkFMSUQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAodmFsID09PSBBY2Nlc3NNb2RlLl9OT05FKSB7XG4gICAgICByZXR1cm4gJ04nO1xuICAgIH1cblxuICAgIGNvbnN0IGJpdG1hc2sgPSBbJ0onLCAnUicsICdXJywgJ1AnLCAnQScsICdTJywgJ0QnLCAnTyddO1xuICAgIGxldCByZXMgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpdG1hc2subGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICgodmFsICYgKDEgPDwgaSkpICE9IDApIHtcbiAgICAgICAgcmVzID0gcmVzICsgYml0bWFza1tpXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICAvKipcbiAgICogVXBkYXRlIG51bWVyaWMgcmVwcmVzZW50YXRpb24gb2YgYWNjZXNzIG1vZGUgd2l0aCB0aGUgbmV3IHZhbHVlLiBUaGUgdmFsdWVcbiAgICogaXMgb25lIG9mIHRoZSBmb2xsb3dpbmc6XG4gICAqICAtIGEgc3RyaW5nIHN0YXJ0aW5nIHdpdGggPGNvZGU+JysnPC9jb2RlPiBvciA8Y29kZT4nLSc8L2NvZGU+IHRoZW4gdGhlIGJpdHMgdG8gYWRkIG9yIHJlbW92ZSwgZS5nLiA8Y29kZT4nK1ItVyc8L2NvZGU+IG9yIDxjb2RlPictUFMnPC9jb2RlPi5cbiAgICogIC0gYSBuZXcgdmFsdWUgb2YgYWNjZXNzIG1vZGVcbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbCAtIGFjY2VzcyBtb2RlIHZhbHVlIHRvIHVwZGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVwZCAtIHVwZGF0ZSB0byBhcHBseSB0byB2YWwuXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gdXBkYXRlZCBhY2Nlc3MgbW9kZS5cbiAgICovXG4gIHN0YXRpYyB1cGRhdGUodmFsLCB1cGQpIHtcbiAgICBpZiAoIXVwZCB8fCB0eXBlb2YgdXBkICE9ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cblxuICAgIGxldCBhY3Rpb24gPSB1cGQuY2hhckF0KDApO1xuICAgIGlmIChhY3Rpb24gPT0gJysnIHx8IGFjdGlvbiA9PSAnLScpIHtcbiAgICAgIGxldCB2YWwwID0gdmFsO1xuICAgICAgLy8gU3BsaXQgZGVsdGEtc3RyaW5nIGxpa2UgJytBQkMtREVGK1onIGludG8gYW4gYXJyYXkgb2YgcGFydHMgaW5jbHVkaW5nICsgYW5kIC0uXG4gICAgICBjb25zdCBwYXJ0cyA9IHVwZC5zcGxpdCgvKFstK10pLyk7XG4gICAgICAvLyBTdGFydGluZyBpdGVyYXRpb24gZnJvbSAxIGJlY2F1c2UgU3RyaW5nLnNwbGl0KCkgY3JlYXRlcyBhbiBhcnJheSB3aXRoIHRoZSBmaXJzdCBlbXB0eSBlbGVtZW50LlxuICAgICAgLy8gSXRlcmF0aW5nIGJ5IDIgYmVjYXVzZSB3ZSBwYXJzZSBwYWlycyArLy0gdGhlbiBkYXRhLlxuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpICs9IDIpIHtcbiAgICAgICAgYWN0aW9uID0gcGFydHNbaV07XG4gICAgICAgIGNvbnN0IG0wID0gQWNjZXNzTW9kZS5kZWNvZGUocGFydHNbaSArIDFdKTtcbiAgICAgICAgaWYgKG0wID09IEFjY2Vzc01vZGUuX0lOVkFMSUQpIHtcbiAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtMCA9PSBudWxsKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGlvbiA9PT0gJysnKSB7XG4gICAgICAgICAgdmFsMCB8PSBtMDtcbiAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICctJykge1xuICAgICAgICAgIHZhbDAgJj0gfm0wO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YWwgPSB2YWwwO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgc3RyaW5nIGlzIGFuIGV4cGxpY2l0IG5ldyB2YWx1ZSAnQUJDJyByYXRoZXIgdGhhbiBkZWx0YS5cbiAgICAgIGNvbnN0IHZhbDAgPSBBY2Nlc3NNb2RlLmRlY29kZSh1cGQpO1xuICAgICAgaWYgKHZhbDAgIT0gQWNjZXNzTW9kZS5fSU5WQUxJRCkge1xuICAgICAgICB2YWwgPSB2YWwwO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2YWw7XG4gIH1cbiAgLyoqXG4gICAqIEJpdHMgcHJlc2VudCBpbiBhMSBidXQgbWlzc2luZyBpbiBhMi5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyIHwgc3RyaW5nfSBhMSAtIGFjY2VzcyBtb2RlIHRvIHN1YnRyYWN0IGZyb20uXG4gICAqIEBwYXJhbSB7bnVtYmVyIHwgc3RyaW5nfSBhMiAtIGFjY2VzcyBtb2RlIHRvIHN1YnRyYWN0LlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBhY2Nlc3MgbW9kZSB3aXRoIGJpdHMgcHJlc2VudCBpbiA8Y29kZT5hMTwvY29kZT4gYnV0IG1pc3NpbmcgaW4gPGNvZGU+YTI8L2NvZGU+LlxuICAgKi9cbiAgc3RhdGljIGRpZmYoYTEsIGEyKSB7XG4gICAgYTEgPSBBY2Nlc3NNb2RlLmRlY29kZShhMSk7XG4gICAgYTIgPSBBY2Nlc3NNb2RlLmRlY29kZShhMik7XG5cbiAgICBpZiAoYTEgPT0gQWNjZXNzTW9kZS5fSU5WQUxJRCB8fCBhMiA9PSBBY2Nlc3NNb2RlLl9JTlZBTElEKSB7XG4gICAgICByZXR1cm4gQWNjZXNzTW9kZS5fSU5WQUxJRDtcbiAgICB9XG4gICAgcmV0dXJuIGExICYgfmEyO1xuICB9XG4gIC8qKlxuICAgKiBBY2Nlc3NNb2RlIGlzIGEgY2xhc3MgcmVwcmVzZW50aW5nIHRvcGljIGFjY2VzcyBtb2RlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBjbGFzcyBBY2Nlc3NNb2RlXG4gICAqL1xuICAvKipcbiAgICogQ3VzdG9tIGZvcm1hdHRlclxuICAgKi9cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICd7XCJtb2RlXCI6IFwiJyArIEFjY2Vzc01vZGUuZW5jb2RlKHRoaXMubW9kZSkgK1xuICAgICAgJ1wiLCBcImdpdmVuXCI6IFwiJyArIEFjY2Vzc01vZGUuZW5jb2RlKHRoaXMuZ2l2ZW4pICtcbiAgICAgICdcIiwgXCJ3YW50XCI6IFwiJyArIEFjY2Vzc01vZGUuZW5jb2RlKHRoaXMud2FudCkgKyAnXCJ9JztcbiAgfVxuICAvKipcbiAgICogQWNjZXNzTW9kZSBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyB0b3BpYyBhY2Nlc3MgbW9kZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAY2xhc3MgQWNjZXNzTW9kZVxuICAgKi9cbiAgLyoqXG4gICAqIENvbnZlcnRzIG51bWVyaWMgdmFsdWVzIHRvIHN0cmluZ3MuXG4gICAqL1xuICBqc29uSGVscGVyKCkge1xuICAgIHJldHVybiB7XG4gICAgICBtb2RlOiBBY2Nlc3NNb2RlLmVuY29kZSh0aGlzLm1vZGUpLFxuICAgICAgZ2l2ZW46IEFjY2Vzc01vZGUuZW5jb2RlKHRoaXMuZ2l2ZW4pLFxuICAgICAgd2FudDogQWNjZXNzTW9kZS5lbmNvZGUodGhpcy53YW50KVxuICAgIH07XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBBc3NpZ24gdmFsdWUgdG8gJ21vZGUnLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBOdW1iZXJ9IG0gLSBlaXRoZXIgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFjY2VzcyBtb2RlIG9yIGEgc2V0IG9mIGJpdHMuXG4gICAqIEByZXR1cm5zIHtBY2Nlc3NNb2RlfSAtIDxjb2RlPnRoaXM8L2NvZGU+IEFjY2Vzc01vZGUuXG4gICAqL1xuICBzZXRNb2RlKG0pIHtcbiAgICB0aGlzLm1vZGUgPSBBY2Nlc3NNb2RlLmRlY29kZShtKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogQWNjZXNzTW9kZSBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyB0b3BpYyBhY2Nlc3MgbW9kZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAY2xhc3MgQWNjZXNzTW9kZVxuICAgKi9cbiAgLyoqXG4gICAqIFVwZGF0ZSA8Y29kZT5tb2RlPC9jb2RlPiB2YWx1ZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1IC0gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjaGFuZ2VzIHRvIGFwcGx5IHRvIGFjY2VzcyBtb2RlLlxuICAgKiBAcmV0dXJucyB7QWNjZXNzTW9kZX0gLSA8Y29kZT50aGlzPC9jb2RlPiBBY2Nlc3NNb2RlLlxuICAgKi9cbiAgdXBkYXRlTW9kZSh1KSB7XG4gICAgdGhpcy5tb2RlID0gQWNjZXNzTW9kZS51cGRhdGUodGhpcy5tb2RlLCB1KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogQWNjZXNzTW9kZSBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyB0b3BpYyBhY2Nlc3MgbW9kZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAY2xhc3MgQWNjZXNzTW9kZVxuICAgKi9cbiAgLyoqXG4gICAqIEdldCA8Y29kZT5tb2RlPC9jb2RlPiB2YWx1ZSBhcyBhIHN0cmluZy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gPGNvZGU+bW9kZTwvY29kZT4gdmFsdWUuXG4gICAqL1xuICBnZXRNb2RlKCkge1xuICAgIHJldHVybiBBY2Nlc3NNb2RlLmVuY29kZSh0aGlzLm1vZGUpO1xuICB9XG4gIC8qKlxuICAgKiBBY2Nlc3NNb2RlIGlzIGEgY2xhc3MgcmVwcmVzZW50aW5nIHRvcGljIGFjY2VzcyBtb2RlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBjbGFzcyBBY2Nlc3NNb2RlXG4gICAqL1xuICAvKipcbiAgICogQXNzaWduIDxjb2RlPmdpdmVuPC9jb2RlPiAgdmFsdWUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQWNjZXNzTW9kZVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IE51bWJlcn0gZyAtIGVpdGhlciBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgYWNjZXNzIG1vZGUgb3IgYSBzZXQgb2YgYml0cy5cbiAgICogQHJldHVybnMge0FjY2Vzc01vZGV9IC0gPGNvZGU+dGhpczwvY29kZT4gQWNjZXNzTW9kZS5cbiAgICovXG4gIHNldEdpdmVuKGcpIHtcbiAgICB0aGlzLmdpdmVuID0gQWNjZXNzTW9kZS5kZWNvZGUoZyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBVcGRhdGUgJ2dpdmVuJyB2YWx1ZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1IC0gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjaGFuZ2VzIHRvIGFwcGx5IHRvIGFjY2VzcyBtb2RlLlxuICAgKiBAcmV0dXJucyB7QWNjZXNzTW9kZX0gLSA8Y29kZT50aGlzPC9jb2RlPiBBY2Nlc3NNb2RlLlxuICAgKi9cbiAgdXBkYXRlR2l2ZW4odSkge1xuICAgIHRoaXMuZ2l2ZW4gPSBBY2Nlc3NNb2RlLnVwZGF0ZSh0aGlzLmdpdmVuLCB1KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogQWNjZXNzTW9kZSBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyB0b3BpYyBhY2Nlc3MgbW9kZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAY2xhc3MgQWNjZXNzTW9kZVxuICAgKi9cbiAgLyoqXG4gICAqIEdldCAnZ2l2ZW4nIHZhbHVlIGFzIGEgc3RyaW5nLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gLSA8Yj5naXZlbjwvYj4gdmFsdWUuXG4gICAqL1xuICBnZXRHaXZlbigpIHtcbiAgICByZXR1cm4gQWNjZXNzTW9kZS5lbmNvZGUodGhpcy5naXZlbik7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBBc3NpZ24gJ3dhbnQnIHZhbHVlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBOdW1iZXJ9IHcgLSBlaXRoZXIgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFjY2VzcyBtb2RlIG9yIGEgc2V0IG9mIGJpdHMuXG4gICAqIEByZXR1cm5zIHtBY2Nlc3NNb2RlfSAtIDxjb2RlPnRoaXM8L2NvZGU+IEFjY2Vzc01vZGUuXG4gICAqL1xuICBzZXRXYW50KHcpIHtcbiAgICB0aGlzLndhbnQgPSBBY2Nlc3NNb2RlLmRlY29kZSh3KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogQWNjZXNzTW9kZSBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyB0b3BpYyBhY2Nlc3MgbW9kZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAY2xhc3MgQWNjZXNzTW9kZVxuICAgKi9cbiAgLyoqXG4gICAqIFVwZGF0ZSAnd2FudCcgdmFsdWUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQWNjZXNzTW9kZVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdSAtIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgY2hhbmdlcyB0byBhcHBseSB0byBhY2Nlc3MgbW9kZS5cbiAgICogQHJldHVybnMge0FjY2Vzc01vZGV9IC0gPGNvZGU+dGhpczwvY29kZT4gQWNjZXNzTW9kZS5cbiAgICovXG4gIHVwZGF0ZVdhbnQodSkge1xuICAgIHRoaXMud2FudCA9IEFjY2Vzc01vZGUudXBkYXRlKHRoaXMud2FudCwgdSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBHZXQgJ3dhbnQnIHZhbHVlIGFzIGEgc3RyaW5nLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gLSA8Yj53YW50PC9iPiB2YWx1ZS5cbiAgICovXG4gIGdldFdhbnQoKSB7XG4gICAgcmV0dXJuIEFjY2Vzc01vZGUuZW5jb2RlKHRoaXMud2FudCk7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBHZXQgcGVybWlzc2lvbnMgcHJlc2VudCBpbiAnd2FudCcgYnV0IG1pc3NpbmcgaW4gJ2dpdmVuJy5cbiAgICogSW52ZXJzZSBvZiB7QGxpbmsgVGlub2RlLkFjY2Vzc01vZGUjZ2V0RXhjZXNzaXZlfVxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gcGVybWlzc2lvbnMgcHJlc2VudCBpbiA8Yj53YW50PC9iPiBidXQgbWlzc2luZyBpbiA8Yj5naXZlbjwvYj4uXG4gICAqL1xuICBnZXRNaXNzaW5nKCkge1xuICAgIHJldHVybiBBY2Nlc3NNb2RlLmVuY29kZSh0aGlzLndhbnQgJiB+dGhpcy5naXZlbik7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBHZXQgcGVybWlzc2lvbnMgcHJlc2VudCBpbiAnZ2l2ZW4nIGJ1dCBtaXNzaW5nIGluICd3YW50Jy5cbiAgICogSW52ZXJzZSBvZiB7QGxpbmsgVGlub2RlLkFjY2Vzc01vZGUjZ2V0TWlzc2luZ31cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IHBlcm1pc3Npb25zIHByZXNlbnQgaW4gPGI+Z2l2ZW48L2I+IGJ1dCBtaXNzaW5nIGluIDxiPndhbnQ8L2I+LlxuICAgKi9cbiAgZ2V0RXhjZXNzaXZlKCkge1xuICAgIHJldHVybiBBY2Nlc3NNb2RlLmVuY29kZSh0aGlzLmdpdmVuICYgfnRoaXMud2FudCk7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBVcGRhdGUgJ3dhbnQnLCAnZ2l2ZScsIGFuZCAnbW9kZScgdmFsdWVzLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICpcbiAgICogQHBhcmFtIHtBY2Nlc3NNb2RlfSB2YWwgLSBuZXcgYWNjZXNzIG1vZGUgdmFsdWUuXG4gICAqIEByZXR1cm5zIHtBY2Nlc3NNb2RlfSAtIDxjb2RlPnRoaXM8L2NvZGU+IEFjY2Vzc01vZGUuXG4gICAqL1xuICB1cGRhdGVBbGwodmFsKSB7XG4gICAgaWYgKHZhbCkge1xuICAgICAgdGhpcy51cGRhdGVHaXZlbih2YWwuZ2l2ZW4pO1xuICAgICAgdGhpcy51cGRhdGVXYW50KHZhbC53YW50KTtcbiAgICAgIHRoaXMubW9kZSA9IHRoaXMuZ2l2ZW4gJiB0aGlzLndhbnQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8qKlxuICAgKiBBY2Nlc3NNb2RlIGlzIGEgY2xhc3MgcmVwcmVzZW50aW5nIHRvcGljIGFjY2VzcyBtb2RlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBjbGFzcyBBY2Nlc3NNb2RlXG4gICAqL1xuICAvKipcbiAgICogQ2hlY2sgaWYgT3duZXIgKE8pIGZsYWcgaXMgc2V0LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBzaWRlIC0gd2hpY2ggcGVybWlzc2lvbiB0byBjaGVjazogZ2l2ZW4sIHdhbnQsIG1vZGU7IGRlZmF1bHQ6IG1vZGUuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIDxjb2RlPnRydWU8L2NvZGU+IGlmIGZsYWcgaXMgc2V0LlxuICAgKi9cbiAgaXNPd25lcihzaWRlKSB7XG4gICAgcmV0dXJuIEFjY2Vzc01vZGUuI2NoZWNrRmxhZyh0aGlzLCBzaWRlLCBBY2Nlc3NNb2RlLl9PV05FUik7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBDaGVjayBpZiBQcmVzZW5jZSAoUCkgZmxhZyBpcyBzZXQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQWNjZXNzTW9kZVxuICAgKiBAcGFyYW0ge3N0cmluZz19IHNpZGUgLSB3aGljaCBwZXJtaXNzaW9uIHRvIGNoZWNrOiBnaXZlbiwgd2FudCwgbW9kZTsgZGVmYXVsdDogbW9kZS5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgZmxhZyBpcyBzZXQuXG4gICAqL1xuICBpc1ByZXNlbmNlcihzaWRlKSB7XG4gICAgcmV0dXJuIEFjY2Vzc01vZGUuI2NoZWNrRmxhZyh0aGlzLCBzaWRlLCBBY2Nlc3NNb2RlLl9QUkVTKTtcbiAgfVxuICAvKipcbiAgICogQWNjZXNzTW9kZSBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyB0b3BpYyBhY2Nlc3MgbW9kZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAY2xhc3MgQWNjZXNzTW9kZVxuICAgKi9cbiAgLyoqXG4gICAqIENoZWNrIGlmIFByZXNlbmNlIChQKSBmbGFnIGlzIE5PVCBzZXQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQWNjZXNzTW9kZVxuICAgKiBAcGFyYW0ge3N0cmluZz19IHNpZGUgLSB3aGljaCBwZXJtaXNzaW9uIHRvIGNoZWNrOiBnaXZlbiwgd2FudCwgbW9kZTsgZGVmYXVsdDogbW9kZS5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgZmxhZyBpcyBzZXQuXG4gICAqL1xuICBpc011dGVkKHNpZGUpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNQcmVzZW5jZXIoc2lkZSk7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBDaGVjayBpZiBKb2luIChKKSBmbGFnIGlzIHNldC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc2lkZSAtIHdoaWNoIHBlcm1pc3Npb24gdG8gY2hlY2s6IGdpdmVuLCB3YW50LCBtb2RlOyBkZWZhdWx0OiBtb2RlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSA8Y29kZT50cnVlPC9jb2RlPiBpZiBmbGFnIGlzIHNldC5cbiAgICovXG4gIGlzSm9pbmVyKHNpZGUpIHtcbiAgICByZXR1cm4gQWNjZXNzTW9kZS4jY2hlY2tGbGFnKHRoaXMsIHNpZGUsIEFjY2Vzc01vZGUuX0pPSU4pO1xuICB9XG4gIC8qKlxuICAgKiBBY2Nlc3NNb2RlIGlzIGEgY2xhc3MgcmVwcmVzZW50aW5nIHRvcGljIGFjY2VzcyBtb2RlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBjbGFzcyBBY2Nlc3NNb2RlXG4gICAqL1xuICAvKipcbiAgICogQ2hlY2sgaWYgUmVhZGVyIChSKSBmbGFnIGlzIHNldC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc2lkZSAtIHdoaWNoIHBlcm1pc3Npb24gdG8gY2hlY2s6IGdpdmVuLCB3YW50LCBtb2RlOyBkZWZhdWx0OiBtb2RlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSA8Y29kZT50cnVlPC9jb2RlPiBpZiBmbGFnIGlzIHNldC5cbiAgICovXG4gIGlzUmVhZGVyKHNpZGUpIHtcbiAgICByZXR1cm4gQWNjZXNzTW9kZS4jY2hlY2tGbGFnKHRoaXMsIHNpZGUsIEFjY2Vzc01vZGUuX1JFQUQpO1xuICB9XG4gIC8qKlxuICAgKiBBY2Nlc3NNb2RlIGlzIGEgY2xhc3MgcmVwcmVzZW50aW5nIHRvcGljIGFjY2VzcyBtb2RlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBjbGFzcyBBY2Nlc3NNb2RlXG4gICAqL1xuICAvKipcbiAgICogQ2hlY2sgaWYgV3JpdGVyIChXKSBmbGFnIGlzIHNldC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc2lkZSAtIHdoaWNoIHBlcm1pc3Npb24gdG8gY2hlY2s6IGdpdmVuLCB3YW50LCBtb2RlOyBkZWZhdWx0OiBtb2RlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSA8Y29kZT50cnVlPC9jb2RlPiBpZiBmbGFnIGlzIHNldC5cbiAgICovXG4gIGlzV3JpdGVyKHNpZGUpIHtcbiAgICByZXR1cm4gQWNjZXNzTW9kZS4jY2hlY2tGbGFnKHRoaXMsIHNpZGUsIEFjY2Vzc01vZGUuX1dSSVRFKTtcbiAgfVxuICAvKipcbiAgICogQWNjZXNzTW9kZSBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyB0b3BpYyBhY2Nlc3MgbW9kZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAY2xhc3MgQWNjZXNzTW9kZVxuICAgKi9cbiAgLyoqXG4gICAqIENoZWNrIGlmIEFwcHJvdmVyIChBKSBmbGFnIGlzIHNldC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc2lkZSAtIHdoaWNoIHBlcm1pc3Npb24gdG8gY2hlY2s6IGdpdmVuLCB3YW50LCBtb2RlOyBkZWZhdWx0OiBtb2RlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSA8Y29kZT50cnVlPC9jb2RlPiBpZiBmbGFnIGlzIHNldC5cbiAgICovXG4gIGlzQXBwcm92ZXIoc2lkZSkge1xuICAgIHJldHVybiBBY2Nlc3NNb2RlLiNjaGVja0ZsYWcodGhpcywgc2lkZSwgQWNjZXNzTW9kZS5fQVBQUk9WRSk7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBDaGVjayBpZiBlaXRoZXIgb25lIG9mIE93bmVyIChPKSBvciBBcHByb3ZlciAoQSkgZmxhZ3MgaXMgc2V0LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkFjY2Vzc01vZGVcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBzaWRlIC0gd2hpY2ggcGVybWlzc2lvbiB0byBjaGVjazogZ2l2ZW4sIHdhbnQsIG1vZGU7IGRlZmF1bHQ6IG1vZGUuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIDxjb2RlPnRydWU8L2NvZGU+IGlmIGZsYWcgaXMgc2V0LlxuICAgKi9cbiAgaXNBZG1pbihzaWRlKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNPd25lcihzaWRlKSB8fCB0aGlzLmlzQXBwcm92ZXIoc2lkZSk7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBDaGVjayBpZiBlaXRoZXIgb25lIG9mIE93bmVyIChPKSwgQXBwcm92ZXIgKEEpLCBvciBTaGFyZXIgKFMpIGZsYWdzIGlzIHNldC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc2lkZSAtIHdoaWNoIHBlcm1pc3Npb24gdG8gY2hlY2s6IGdpdmVuLCB3YW50LCBtb2RlOyBkZWZhdWx0OiBtb2RlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSA8Y29kZT50cnVlPC9jb2RlPiBpZiBmbGFnIGlzIHNldC5cbiAgICovXG4gIGlzU2hhcmVyKHNpZGUpIHtcbiAgICByZXR1cm4gdGhpcy5pc0FkbWluKHNpZGUpIHx8IEFjY2Vzc01vZGUuI2NoZWNrRmxhZyh0aGlzLCBzaWRlLCBBY2Nlc3NNb2RlLl9TSEFSRSk7XG4gIH1cbiAgLyoqXG4gICAqIEFjY2Vzc01vZGUgaXMgYSBjbGFzcyByZXByZXNlbnRpbmcgdG9waWMgYWNjZXNzIG1vZGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQGNsYXNzIEFjY2Vzc01vZGVcbiAgICovXG4gIC8qKlxuICAgKiBDaGVjayBpZiBEZWxldGVyIChEKSBmbGFnIGlzIHNldC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5BY2Nlc3NNb2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc2lkZSAtIHdoaWNoIHBlcm1pc3Npb24gdG8gY2hlY2s6IGdpdmVuLCB3YW50LCBtb2RlOyBkZWZhdWx0OiBtb2RlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSA8Y29kZT50cnVlPC9jb2RlPiBpZiBmbGFnIGlzIHNldC5cbiAgICovXG4gIGlzRGVsZXRlcihzaWRlKSB7XG4gICAgcmV0dXJuIEFjY2Vzc01vZGUuI2NoZWNrRmxhZyh0aGlzLCBzaWRlLCBBY2Nlc3NNb2RlLl9ERUxFVEUpO1xuICB9XG59XG5cbkFjY2Vzc01vZGUuX05PTkUgPSAweDAwO1xuQWNjZXNzTW9kZS5fSk9JTiA9IDB4MDE7XG5BY2Nlc3NNb2RlLl9SRUFEID0gMHgwMjtcbkFjY2Vzc01vZGUuX1dSSVRFID0gMHgwNDtcbkFjY2Vzc01vZGUuX1BSRVMgPSAweDA4O1xuQWNjZXNzTW9kZS5fQVBQUk9WRSA9IDB4MTA7XG5BY2Nlc3NNb2RlLl9TSEFSRSA9IDB4MjA7XG5BY2Nlc3NNb2RlLl9ERUxFVEUgPSAweDQwO1xuQWNjZXNzTW9kZS5fT1dORVIgPSAweDgwO1xuXG5BY2Nlc3NNb2RlLl9CSVRNQVNLID0gQWNjZXNzTW9kZS5fSk9JTiB8IEFjY2Vzc01vZGUuX1JFQUQgfCBBY2Nlc3NNb2RlLl9XUklURSB8IEFjY2Vzc01vZGUuX1BSRVMgfFxuICBBY2Nlc3NNb2RlLl9BUFBST1ZFIHwgQWNjZXNzTW9kZS5fU0hBUkUgfCBBY2Nlc3NNb2RlLl9ERUxFVEUgfCBBY2Nlc3NNb2RlLl9PV05FUjtcbkFjY2Vzc01vZGUuX0lOVkFMSUQgPSAweDEwMDAwMDtcbiIsIi8qKlxuICogQGZpbGUgSW4tbWVtb3J5IHNvcnRlZCBjYWNoZSBvZiBvYmplY3RzLlxuICpcbiAqIEBjb3B5cmlnaHQgMjAxNS0yMDIyIFRpbm9kZSBMTEMuXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBJbi1tZW1vcnkgc29ydGVkIGNhY2hlIG9mIG9iamVjdHMuXG4gKlxuICogQGNsYXNzIENCdWZmZXJcbiAqIEBtZW1iZXJvZiBUaW5vZGVcbiAqIEBwcm90ZWN0ZWRcbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb21wYXJlIGN1c3RvbSBjb21wYXJhdG9yIG9mIG9iamVjdHMuIFRha2VzIHR3byBwYXJhbWV0ZXJzIDxjb2RlPmE8L2NvZGU+IGFuZCA8Y29kZT5iPC9jb2RlPjtcbiAqICAgIHJldHVybnMgPGNvZGU+LTE8L2NvZGU+IGlmIDxjb2RlPmEgPCBiPC9jb2RlPiwgPGNvZGU+MDwvY29kZT4gaWYgPGNvZGU+YSA9PSBiPC9jb2RlPiwgPGNvZGU+MTwvY29kZT4gb3RoZXJ3aXNlLlxuICogQHBhcmFtIHtib29sZWFufSB1bmlxdWUgZW5mb3JjZSBlbGVtZW50IHVuaXF1ZW5lc3M6IHdoZW4gPGNvZGU+dHJ1ZTwvY29kZT4gcmVwbGFjZSBleGlzdGluZyBlbGVtZW50IHdpdGggYSBuZXdcbiAqICAgIG9uZSBvbiBjb25mbGljdDsgd2hlbiA8Y29kZT5mYWxzZTwvY29kZT4ga2VlcCBib3RoIGVsZW1lbnRzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDQnVmZmVyIHtcbiAgI2NvbXBhcmF0b3IgPSB1bmRlZmluZWQ7XG4gICN1bmlxdWUgPSBmYWxzZTtcbiAgYnVmZmVyID0gW107XG5cbiAgY29uc3RydWN0b3IoY29tcGFyZV8sIHVuaXF1ZV8pIHtcbiAgICB0aGlzLiNjb21wYXJhdG9yID0gY29tcGFyZV8gfHwgKChhLCBiKSA9PiB7XG4gICAgICByZXR1cm4gYSA9PT0gYiA/IDAgOiBhIDwgYiA/IC0xIDogMTtcbiAgICB9KTtcbiAgICB0aGlzLiN1bmlxdWUgPSB1bmlxdWVfO1xuICB9XG5cbiAgI2ZpbmROZWFyZXN0KGVsZW0sIGFyciwgZXhhY3QpIHtcbiAgICBsZXQgc3RhcnQgPSAwO1xuICAgIGxldCBlbmQgPSBhcnIubGVuZ3RoIC0gMTtcbiAgICBsZXQgcGl2b3QgPSAwO1xuICAgIGxldCBkaWZmID0gMDtcbiAgICBsZXQgZm91bmQgPSBmYWxzZTtcblxuICAgIHdoaWxlIChzdGFydCA8PSBlbmQpIHtcbiAgICAgIHBpdm90ID0gKHN0YXJ0ICsgZW5kKSAvIDIgfCAwO1xuICAgICAgZGlmZiA9IHRoaXMuI2NvbXBhcmF0b3IoYXJyW3Bpdm90XSwgZWxlbSk7XG4gICAgICBpZiAoZGlmZiA8IDApIHtcbiAgICAgICAgc3RhcnQgPSBwaXZvdCArIDE7XG4gICAgICB9IGVsc2UgaWYgKGRpZmYgPiAwKSB7XG4gICAgICAgIGVuZCA9IHBpdm90IC0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChmb3VuZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWR4OiBwaXZvdCxcbiAgICAgICAgZXhhY3Q6IHRydWVcbiAgICAgIH07XG4gICAgfVxuICAgIGlmIChleGFjdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWR4OiAtMVxuICAgICAgfTtcbiAgICB9XG4gICAgLy8gTm90IGV4YWN0IC0gaW5zZXJ0aW9uIHBvaW50XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkeDogZGlmZiA8IDAgPyBwaXZvdCArIDEgOiBwaXZvdFxuICAgIH07XG4gIH1cblxuICAvLyBJbnNlcnQgZWxlbWVudCBpbnRvIGEgc29ydGVkIGFycmF5LlxuICAjaW5zZXJ0U29ydGVkKGVsZW0sIGFycikge1xuICAgIGNvbnN0IGZvdW5kID0gdGhpcy4jZmluZE5lYXJlc3QoZWxlbSwgYXJyLCBmYWxzZSk7XG4gICAgY29uc3QgY291bnQgPSAoZm91bmQuZXhhY3QgJiYgdGhpcy4jdW5pcXVlKSA/IDEgOiAwO1xuICAgIGFyci5zcGxpY2UoZm91bmQuaWR4LCBjb3VudCwgZWxlbSk7XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYW4gZWxlbWVudCBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ0J1ZmZlciNcbiAgICogQHBhcmFtIHtudW1iZXJ9IGF0IC0gUG9zaXRpb24gdG8gZmV0Y2ggZnJvbS5cbiAgICogQHJldHVybnMge09iamVjdH0gRWxlbWVudCBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24gb3IgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPi5cbiAgICovXG4gIGdldEF0KGF0KSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyW2F0XTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZW5pZW5jZSBtZXRob2QgZm9yIGdldHRpbmcgdGhlIGVsZW1lbnQgZnJvbSB0aGUgZW5kIG9mIHRoZSBidWZmZXIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ0J1ZmZlciNcbiAgICogQHBhcmFtIHtudW1iZXJ9IGF0IC0gcG9zaXRpb24gdG8gZmV0Y2ggZnJvbSwgY291bnRpbmcgZnJvbSB0aGUgZW5kO1xuICAgKiAgICA8Y29kZT51bmRlZmluZWQ8L2NvZGU+IG9yIDxjb2RlPm51bGw8L2NvZGU+ICBtZWFuIFwibGFzdFwiLlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgbGFzdCBlbGVtZW50IGluIHRoZSBidWZmZXIgb3IgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPiBpZiBidWZmZXIgaXMgZW1wdHkuXG4gICAqL1xuICBnZXRMYXN0KGF0KSB7XG4gICAgYXQgfD0gMDtcbiAgICByZXR1cm4gdGhpcy5idWZmZXIubGVuZ3RoID4gYXQgPyB0aGlzLmJ1ZmZlclt0aGlzLmJ1ZmZlci5sZW5ndGggLSAxIC0gYXRdIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBuZXcgZWxlbWVudChzKSB0byB0aGUgYnVmZmVyLiBWYXJpYWRpYzogdGFrZXMgb25lIG9yIG1vcmUgYXJndW1lbnRzLiBJZiBhbiBhcnJheSBpcyBwYXNzZWQgYXMgYSBzaW5nbGVcbiAgICogYXJndW1lbnQsIGl0cyBlbGVtZW50cyBhcmUgaW5zZXJ0ZWQgaW5kaXZpZHVhbGx5LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqXG4gICAqIEBwYXJhbSB7Li4uT2JqZWN0fEFycmF5fSAtIE9uZSBvciBtb3JlIG9iamVjdHMgdG8gaW5zZXJ0LlxuICAgKi9cbiAgcHV0KCkge1xuICAgIGxldCBpbnNlcnQ7XG4gICAgLy8gaW5zcGVjdCBhcmd1bWVudHM6IGlmIGFycmF5LCBpbnNlcnQgaXRzIGVsZW1lbnRzLCBpZiBvbmUgb3IgbW9yZSBub24tYXJyYXkgYXJndW1lbnRzLCBpbnNlcnQgdGhlbSBvbmUgYnkgb25lXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSAmJiBBcnJheS5pc0FycmF5KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgIGluc2VydCA9IGFyZ3VtZW50c1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5zZXJ0ID0gYXJndW1lbnRzO1xuICAgIH1cbiAgICBmb3IgKGxldCBpZHggaW4gaW5zZXJ0KSB7XG4gICAgICB0aGlzLiNpbnNlcnRTb3J0ZWQoaW5zZXJ0W2lkeF0sIHRoaXMuYnVmZmVyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGVsZW1lbnQgYXQgdGhlIGdpdmVuIHBvc2l0aW9uLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhdCAtIFBvc2l0aW9uIHRvIGRlbGV0ZSBhdC5cbiAgICogQHJldHVybnMge09iamVjdH0gRWxlbWVudCBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24gb3IgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPi5cbiAgICovXG4gIGRlbEF0KGF0KSB7XG4gICAgYXQgfD0gMDtcbiAgICBsZXQgciA9IHRoaXMuYnVmZmVyLnNwbGljZShhdCwgMSk7XG4gICAgaWYgKHIgJiYgci5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gclswXTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgZWxlbWVudHMgYmV0d2VlbiB0d28gcG9zaXRpb25zLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzaW5jZSAtIFBvc2l0aW9uIHRvIGRlbGV0ZSBmcm9tIChpbmNsdXNpdmUpLlxuICAgKiBAcGFyYW0ge251bWJlcn0gYmVmb3JlIC0gUG9zaXRpb24gdG8gZGVsZXRlIHRvIChleGNsdXNpdmUpLlxuICAgKlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IGFycmF5IG9mIHJlbW92ZWQgZWxlbWVudHMgKGNvdWxkIGJlIHplcm8gbGVuZ3RoKS5cbiAgICovXG4gIGRlbFJhbmdlKHNpbmNlLCBiZWZvcmUpIHtcbiAgICByZXR1cm4gdGhpcy5idWZmZXIuc3BsaWNlKHNpbmNlLCBiZWZvcmUgLSBzaW5jZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgdGhlIGJ1ZmZlciBob2xkcy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5DQnVmZmVyI1xuICAgKiBAcmV0dXJuIHtudW1iZXJ9IE51bWJlciBvZiBlbGVtZW50cyBpbiB0aGUgYnVmZmVyLlxuICAgKi9cbiAgbGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdGhlIGJ1ZmZlciBkaXNjYXJkaW5nIGFsbCBlbGVtZW50c1xuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqL1xuICByZXNldCgpIHtcbiAgICB0aGlzLmJ1ZmZlciA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZvciBpdGVyYXRpbmcgY29udGVudHMgb2YgYnVmZmVyLiBTZWUge0BsaW5rIFRpbm9kZS5DQnVmZmVyI2ZvckVhY2h9LlxuICAgKiBAY2FsbGJhY2sgRm9yRWFjaENhbGxiYWNrVHlwZVxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0gQ3VycmVudCBlbGVtZW50IG9mIHRoZSBidWZmZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcmV2IC0gUHJldmlvdXMgZWxlbWVudCBvZiB0aGUgYnVmZmVyLlxuICAgKiBAcGFyYW0ge09iamVjdH0gbmV4dCAtIE5leHQgZWxlbWVudCBvZiB0aGUgYnVmZmVyLlxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBJbmRleCBvZiB0aGUgY3VycmVudCBlbGVtZW50LlxuICAgKi9cblxuICAvKipcbiAgICogQXBwbHkgZ2l2ZW4gPGNvZGU+Y2FsbGJhY2s8L2NvZGU+IHRvIGFsbCBlbGVtZW50cyBvZiB0aGUgYnVmZmVyLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqXG4gICAqIEBwYXJhbSB7VGlub2RlLkZvckVhY2hDYWxsYmFja1R5cGV9IGNhbGxiYWNrIC0gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBlbGVtZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRJZHggLSBPcHRpb25hbCBpbmRleCB0byBzdGFydCBpdGVyYXRpbmcgZnJvbSAoaW5jbHVzaXZlKS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGJlZm9yZUlkeCAtIE9wdGlvbmFsIGluZGV4IHRvIHN0b3AgaXRlcmF0aW5nIGJlZm9yZSAoZXhjbHVzaXZlKS5cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSBjYWxsaW5nIGNvbnRleHQgKGkuZS4gdmFsdWUgb2YgPGNvZGU+dGhpczwvY29kZT4gaW4gY2FsbGJhY2spXG4gICAqL1xuICBmb3JFYWNoKGNhbGxiYWNrLCBzdGFydElkeCwgYmVmb3JlSWR4LCBjb250ZXh0KSB7XG4gICAgc3RhcnRJZHggPSBzdGFydElkeCB8IDA7XG4gICAgYmVmb3JlSWR4ID0gYmVmb3JlSWR4IHx8IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gc3RhcnRJZHg7IGkgPCBiZWZvcmVJZHg7IGkrKykge1xuICAgICAgY2FsbGJhY2suY2FsbChjb250ZXh0LCB0aGlzLmJ1ZmZlcltpXSxcbiAgICAgICAgKGkgPiBzdGFydElkeCA/IHRoaXMuYnVmZmVyW2kgLSAxXSA6IHVuZGVmaW5lZCksXG4gICAgICAgIChpIDwgYmVmb3JlSWR4IC0gMSA/IHRoaXMuYnVmZmVyW2kgKyAxXSA6IHVuZGVmaW5lZCksIGkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGVsZW1lbnQgaW4gYnVmZmVyIHVzaW5nIGJ1ZmZlcidzIGNvbXBhcmlzb24gZnVuY3Rpb24uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ0J1ZmZlciNcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gLSBlbGVtZW50IHRvIGZpbmQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG5lYXJlc3QgLSB3aGVuIHRydWUgYW5kIGV4YWN0IG1hdGNoIGlzIG5vdCBmb3VuZCwgcmV0dXJuIHRoZSBuZWFyZXN0IGVsZW1lbnQgKGluc2VydGlvbiBwb2ludCkuXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IGluZGV4IG9mIHRoZSBlbGVtZW50IGluIHRoZSBidWZmZXIgb3IgLTEuXG4gICAqL1xuICBmaW5kKGVsZW0sIG5lYXJlc3QpIHtcbiAgICBjb25zdCB7XG4gICAgICBpZHhcbiAgICB9ID0gdGhpcy4jZmluZE5lYXJlc3QoZWxlbSwgdGhpcy5idWZmZXIsICFuZWFyZXN0KTtcbiAgICByZXR1cm4gaWR4O1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZvciBmaWx0ZXJpbmcgdGhlIGJ1ZmZlci4gU2VlIHtAbGluayBUaW5vZGUuQ0J1ZmZlciNmaWx0ZXJ9LlxuICAgKiBAY2FsbGJhY2sgRm9yRWFjaENhbGxiYWNrVHlwZVxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0gQ3VycmVudCBlbGVtZW50IG9mIHRoZSBidWZmZXIuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIEluZGV4IG9mIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gICAqIEByZXR1cm5zIHtib29sZW59IDxjb2RlPnRydWU8L2NvZGU+IHRvIGtlZXAgdGhlIGVsZW1lbnQsIDxjb2RlPmZhbHNlPC9jb2RlPiB0byByZW1vdmUuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIGVsZW1lbnRzIHRoYXQgZG8gbm90IHBhc3MgdGhlIHRlc3QgaW1wbGVtZW50ZWQgYnkgdGhlIHByb3ZpZGVkIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNCdWZmZXIjXG4gICAqXG4gICAqIEBwYXJhbSB7VGlub2RlLkZpbHRlckNhbGxiYWNrVHlwZX0gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IC0gY2FsbGluZyBjb250ZXh0IChpLmUuIHZhbHVlIG9mIDxjb2RlPnRoaXM8L2NvZGU+IGluIHRoZSBjYWxsYmFjaylcbiAgICovXG4gIGZpbHRlcihjYWxsYmFjaywgY29udGV4dCkge1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmJ1ZmZlci5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoY29udGV4dCwgdGhpcy5idWZmZXJbaV0sIGkpKSB7XG4gICAgICAgIHRoaXMuYnVmZmVyW2NvdW50XSA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICBjb3VudCsrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyLnNwbGljZShjb3VudCk7XG4gIH1cbn1cbiIsIi8qKlxuICogQGZpbGUgR2xvYmFsIGNvbnN0YW50cyBhbmQgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzLlxuICpcbiAqIEBjb3B5cmlnaHQgMjAxNS0yMDIyIFRpbm9kZSBMTENcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge1xuICB2ZXJzaW9uIGFzIHBhY2thZ2VfdmVyc2lvblxufSBmcm9tICcuLi92ZXJzaW9uLmpzb24nO1xuXG4vLyBHbG9iYWwgY29uc3RhbnRzXG5leHBvcnQgY29uc3QgUFJPVE9DT0xfVkVSU0lPTiA9ICcwJzsgLy8gTWFqb3IgY29tcG9uZW50IG9mIHRoZSB2ZXJzaW9uLCBlLmcuICcwJyBpbiAnMC4xNy4xJy5cbmV4cG9ydCBjb25zdCBWRVJTSU9OID0gcGFja2FnZV92ZXJzaW9uIHx8ICcwLjE4JztcbmV4cG9ydCBjb25zdCBMSUJSQVJZID0gJ3Rpbm9kZWpzLycgKyBWRVJTSU9OO1xuXG4vLyBUb3BpYyBuYW1lIHByZWZpeGVzLlxuZXhwb3J0IGNvbnN0IFRPUElDX05FVyA9ICduZXcnO1xuZXhwb3J0IGNvbnN0IFRPUElDX05FV19DSEFOID0gJ25jaCc7XG5leHBvcnQgY29uc3QgVE9QSUNfTUUgPSAnbWUnO1xuZXhwb3J0IGNvbnN0IFRPUElDX0ZORCA9ICdmbmQnO1xuZXhwb3J0IGNvbnN0IFRPUElDX1NZUyA9ICdzeXMnO1xuZXhwb3J0IGNvbnN0IFRPUElDX0NIQU4gPSAnY2huJztcbmV4cG9ydCBjb25zdCBUT1BJQ19HUlAgPSAnZ3JwOydcbmV4cG9ydCBjb25zdCBUT1BJQ19QMlAgPSAncDJwJztcbmV4cG9ydCBjb25zdCBVU0VSX05FVyA9ICduZXcnO1xuXG4vLyBTdGFydGluZyB2YWx1ZSBvZiBhIGxvY2FsbHktZ2VuZXJhdGVkIHNlcUlkIHVzZWQgZm9yIHBlbmRpbmcgbWVzc2FnZXMuXG5leHBvcnQgY29uc3QgTE9DQUxfU0VRSUQgPSAweEZGRkZGRkY7XG5cbi8vIFN0YXR1cyBjb2Rlcy5cbmV4cG9ydCBjb25zdCBNRVNTQUdFX1NUQVRVU19OT05FID0gMDsgLy8gU3RhdHVzIG5vdCBhc3NpZ25lZC5cbmV4cG9ydCBjb25zdCBNRVNTQUdFX1NUQVRVU19RVUVVRUQgPSAxOyAvLyBMb2NhbCBJRCBhc3NpZ25lZCwgaW4gcHJvZ3Jlc3MgdG8gYmUgc2VudC5cbmV4cG9ydCBjb25zdCBNRVNTQUdFX1NUQVRVU19TRU5ESU5HID0gMjsgLy8gVHJhbnNtaXNzaW9uIHN0YXJ0ZWQuXG5leHBvcnQgY29uc3QgTUVTU0FHRV9TVEFUVVNfRkFJTEVEID0gMzsgLy8gQXQgbGVhc3Qgb25lIGF0dGVtcHQgd2FzIG1hZGUgdG8gc2VuZCB0aGUgbWVzc2FnZS5cbmV4cG9ydCBjb25zdCBNRVNTQUdFX1NUQVRVU19TRU5UID0gNDsgLy8gRGVsaXZlcmVkIHRvIHRoZSBzZXJ2ZXIuXG5leHBvcnQgY29uc3QgTUVTU0FHRV9TVEFUVVNfUkVDRUlWRUQgPSA1OyAvLyBSZWNlaXZlZCBieSB0aGUgY2xpZW50LlxuZXhwb3J0IGNvbnN0IE1FU1NBR0VfU1RBVFVTX1JFQUQgPSA2OyAvLyBSZWFkIGJ5IHRoZSB1c2VyLlxuZXhwb3J0IGNvbnN0IE1FU1NBR0VfU1RBVFVTX1RPX01FID0gNzsgLy8gVGhlIG1lc3NhZ2UgaXMgcmVjZWl2ZWQgZnJvbSBhbm90aGVyIHVzZXIuXG5leHBvcnQgY29uc3QgTUVTU0FHRV9TVEFUVVNfREVMX1JBTkdFID0gODsgLy8gVGhlIG1lc3NhZ2UgcmVwcmVzZW50cyBhIGRlbGV0ZWQgcmFuZ2UuXG5cbi8vIFJlamVjdCB1bnJlc29sdmVkIGZ1dHVyZXMgYWZ0ZXIgdGhpcyBtYW55IG1pbGxpc2Vjb25kcy5cbmV4cG9ydCBjb25zdCBFWFBJUkVfUFJPTUlTRVNfVElNRU9VVCA9IDUwMDA7XG4vLyBQZXJpb2RpY2l0eSBvZiBnYXJiYWdlIGNvbGxlY3Rpb24gb2YgdW5yZXNvbHZlZCBmdXR1cmVzLlxuZXhwb3J0IGNvbnN0IEVYUElSRV9QUk9NSVNFU19QRVJJT0QgPSAxMDAwO1xuXG4vLyBEZWZhdWx0IG51bWJlciBvZiBtZXNzYWdlcyB0byBwdWxsIGludG8gbWVtb3J5IGZyb20gcGVyc2lzdGVudCBjYWNoZS5cbmV4cG9ydCBjb25zdCBERUZBVUxUX01FU1NBR0VTX1BBR0UgPSAyNDtcblxuLy8gVW5pY29kZSBERUwgY2hhcmFjdGVyIGluZGljYXRpbmcgZGF0YSB3YXMgZGVsZXRlZC5cbmV4cG9ydCBjb25zdCBERUxfQ0hBUiA9ICdcXHUyNDIxJztcbiIsIi8qKlxuICogQGZpbGUgQWJzdHJhY3Rpb24gbGF5ZXIgZm9yIHdlYnNvY2tldCBhbmQgbG9uZyBwb2xsaW5nIGNvbm5lY3Rpb25zLlxuICpcbiAqIEBjb3B5cmlnaHQgMjAxNS0yMDIyIFRpbm9kZSBMTEMuXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtcbiAganNvblBhcnNlSGVscGVyXG59IGZyb20gJy4vdXRpbHMuanMnO1xuXG5sZXQgV2ViU29ja2V0UHJvdmlkZXI7XG5sZXQgWEhSUHJvdmlkZXI7XG5cbi8vIEVycm9yIGNvZGUgdG8gcmV0dXJuIGluIGNhc2Ugb2YgYSBuZXR3b3JrIHByb2JsZW0uXG5jb25zdCBORVRXT1JLX0VSUk9SID0gNTAzO1xuY29uc3QgTkVUV09SS19FUlJPUl9URVhUID0gXCJDb25uZWN0aW9uIGZhaWxlZFwiO1xuXG4vLyBFcnJvciBjb2RlIHRvIHJldHVybiB3aGVuIHVzZXIgZGlzY29ubmVjdGVkIGZyb20gc2VydmVyLlxuY29uc3QgTkVUV09SS19VU0VSID0gNDE4O1xuY29uc3QgTkVUV09SS19VU0VSX1RFWFQgPSBcIkRpc2Nvbm5lY3RlZCBieSBjbGllbnRcIjtcblxuLy8gU2V0dGluZ3MgZm9yIGV4cG9uZW50aWFsIGJhY2tvZmZcbmNvbnN0IF9CT0ZGX0JBU0UgPSAyMDAwOyAvLyAyMDAwIG1pbGxpc2Vjb25kcywgbWluaW11bSBkZWxheSBiZXR3ZWVuIHJlY29ubmVjdHNcbmNvbnN0IF9CT0ZGX01BWF9JVEVSID0gMTA7IC8vIE1heGltdW0gZGVsYXkgYmV0d2VlbiByZWNvbm5lY3RzIDJeMTAgKiAyMDAwIH4gMzQgbWludXRlc1xuY29uc3QgX0JPRkZfSklUVEVSID0gMC4zOyAvLyBBZGQgcmFuZG9tIGRlbGF5XG5cbi8vIEhlbHBlciBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYW4gZW5kcG9pbnQgVVJMLlxuZnVuY3Rpb24gbWFrZUJhc2VVcmwoaG9zdCwgcHJvdG9jb2wsIHZlcnNpb24sIGFwaUtleSkge1xuICBsZXQgdXJsID0gbnVsbDtcblxuICBpZiAoWydodHRwJywgJ2h0dHBzJywgJ3dzJywgJ3dzcyddLmluY2x1ZGVzKHByb3RvY29sKSkge1xuICAgIHVybCA9IGAke3Byb3RvY29sfTovLyR7aG9zdH1gO1xuICAgIGlmICh1cmwuY2hhckF0KHVybC5sZW5ndGggLSAxKSAhPT0gJy8nKSB7XG4gICAgICB1cmwgKz0gJy8nO1xuICAgIH1cbiAgICB1cmwgKz0gJ3YnICsgdmVyc2lvbiArICcvY2hhbm5lbHMnO1xuICAgIGlmIChbJ2h0dHAnLCAnaHR0cHMnXS5pbmNsdWRlcyhwcm90b2NvbCkpIHtcbiAgICAgIC8vIExvbmcgcG9sbGluZyBlbmRwb2ludCBlbmRzIHdpdGggXCJscFwiLCBpLmUuXG4gICAgICAvLyAnL3YwL2NoYW5uZWxzL2xwJyB2cyBqdXN0ICcvdjAvY2hhbm5lbHMnIGZvciB3c1xuICAgICAgdXJsICs9ICcvbHAnO1xuICAgIH1cbiAgICB1cmwgKz0gJz9hcGlrZXk9JyArIGFwaUtleTtcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59XG5cbi8qKlxuICogQW4gYWJzdHJhY3Rpb24gZm9yIGEgd2Vic29ja2V0IG9yIGEgbG9uZyBwb2xsaW5nIGNvbm5lY3Rpb24uXG4gKlxuICogQGNsYXNzIENvbm5lY3Rpb25cbiAqIEBtZW1iZXJvZiBUaW5vZGVcblxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVycy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb25maWcuaG9zdCAtIEhvc3QgbmFtZSBhbmQgb3B0aW9uYWwgcG9ydCBudW1iZXIgdG8gY29ubmVjdCB0by5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb25maWcuYXBpS2V5IC0gQVBJIGtleSBnZW5lcmF0ZWQgYnkgPGNvZGU+a2V5Z2VuPC9jb2RlPi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb25maWcudHJhbnNwb3J0IC0gTmV0d29yayB0cmFuc3BvcnQgdG8gdXNlLCBlaXRoZXIgPGNvZGU+XCJ3c1wiPGNvZGU+Lzxjb2RlPlwid3NzXCI8L2NvZGU+IGZvciB3ZWJzb2NrZXQgb3JcbiAqICAgICAgPGNvZGU+bHA8L2NvZGU+IGZvciBsb25nIHBvbGxpbmcuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGNvbmZpZy5zZWN1cmUgLSBVc2UgU2VjdXJlIFdlYlNvY2tldCBpZiA8Y29kZT50cnVlPC9jb2RlPi5cbiAqIEBwYXJhbSB7c3RyaW5nfSB2ZXJzaW9uXyAtIE1ham9yIHZhbHVlIG9mIHRoZSBwcm90b2NvbCB2ZXJzaW9uLCBlLmcuICcwJyBpbiAnMC4xNy4xJy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYXV0b3JlY29ubmVjdF8gLSBJZiBjb25uZWN0aW9uIGlzIGxvc3QsIHRyeSB0byByZWNvbm5lY3QgYXV0b21hdGljYWxseS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29ubmVjdGlvbiB7XG4gICNib2ZmVGltZXIgPSBudWxsO1xuICAjYm9mZkl0ZXJhdGlvbiA9IDA7XG4gICNib2ZmQ2xvc2VkID0gZmFsc2U7IC8vIEluZGljYXRvciBpZiB0aGUgc29ja2V0IHdhcyBtYW51YWxseSBjbG9zZWQgLSBkb24ndCBhdXRvcmVjb25uZWN0IGlmIHRydWUuXG5cbiAgLy8gV2Vic29ja2V0LlxuICAjc29ja2V0ID0gbnVsbDtcblxuICBob3N0O1xuICBzZWN1cmU7XG4gIGFwaUtleTtcblxuICB2ZXJzaW9uO1xuICBhdXRvcmVjb25uZWN0O1xuXG4gIGluaXRpYWxpemVkO1xuXG4gIC8vIChjb25maWcuaG9zdCwgY29uZmlnLmFwaUtleSwgY29uZmlnLnRyYW5zcG9ydCwgY29uZmlnLnNlY3VyZSksIFBST1RPQ09MX1ZFUlNJT04sIHRydWVcbiAgY29uc3RydWN0b3IoY29uZmlnLCB2ZXJzaW9uXywgYXV0b3JlY29ubmVjdF8pIHtcbiAgICB0aGlzLmhvc3QgPSBjb25maWcuaG9zdDtcbiAgICB0aGlzLnNlY3VyZSA9IGNvbmZpZy5zZWN1cmU7XG4gICAgdGhpcy5hcGlLZXkgPSBjb25maWcuYXBpS2V5O1xuXG4gICAgdGhpcy52ZXJzaW9uID0gdmVyc2lvbl87XG4gICAgdGhpcy5hdXRvcmVjb25uZWN0ID0gYXV0b3JlY29ubmVjdF87XG5cbiAgICBpZiAoY29uZmlnLnRyYW5zcG9ydCA9PT0gJ2xwJykge1xuICAgICAgLy8gZXhwbGljaXQgcmVxdWVzdCB0byB1c2UgbG9uZyBwb2xsaW5nXG4gICAgICB0aGlzLiNpbml0X2xwKCk7XG4gICAgICB0aGlzLmluaXRpYWxpemVkID0gJ2xwJztcbiAgICB9IGVsc2UgaWYgKGNvbmZpZy50cmFuc3BvcnQgPT09ICd3cycpIHtcbiAgICAgIC8vIGV4cGxpY2l0IHJlcXVlc3QgdG8gdXNlIHdlYiBzb2NrZXRcbiAgICAgIC8vIGlmIHdlYnNvY2tldHMgYXJlIG5vdCBhdmFpbGFibGUsIGhvcnJpYmxlIHRoaW5ncyB3aWxsIGhhcHBlblxuICAgICAgdGhpcy4jaW5pdF93cygpO1xuICAgICAgdGhpcy5pbml0aWFsaXplZCA9ICd3cyc7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAvLyBJbnZhbGlkIG9yIHVuZGVmaW5lZCBuZXR3b3JrIHRyYW5zcG9ydC5cbiAgICAgIHRoaXMuI2xvZyhcIlVua25vd24gb3IgaW52YWxpZCBuZXR3b3JrIHRyYW5zcG9ydC4gUnVubmluZyB1bmRlciBOb2RlPyBDYWxsICdUaW5vZGUuc2V0TmV0d29ya1Byb3ZpZGVycygpJy5cIik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIG9yIGludmFsaWQgbmV0d29yayB0cmFuc3BvcnQuIFJ1bm5pbmcgdW5kZXIgTm9kZT8gQ2FsbCAnVGlub2RlLnNldE5ldHdvcmtQcm92aWRlcnMoKScuXCIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUbyB1c2UgQ29ubmVjdGlvbiBpbiBhIG5vbiBicm93c2VyIGNvbnRleHQsIHN1cHBseSBXZWJTb2NrZXQgYW5kIFhNTEh0dHBSZXF1ZXN0IHByb3ZpZGVycy5cbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyb2YgQ29ubmVjdGlvblxuICAgKiBAcGFyYW0gd3NQcm92aWRlciBXZWJTb2NrZXQgcHJvdmlkZXIsIGUuZy4gZm9yIG5vZGVKUyAsIDxjb2RlPnJlcXVpcmUoJ3dzJyk8L2NvZGU+LlxuICAgKiBAcGFyYW0geGhyUHJvdmlkZXIgWE1MSHR0cFJlcXVlc3QgcHJvdmlkZXIsIGUuZy4gZm9yIG5vZGUgPGNvZGU+cmVxdWlyZSgneGhyJyk8L2NvZGU+LlxuICAgKi9cbiAgc3RhdGljIHNldE5ldHdvcmtQcm92aWRlcnMod3NQcm92aWRlciwgeGhyUHJvdmlkZXIpIHtcbiAgICBXZWJTb2NrZXRQcm92aWRlciA9IHdzUHJvdmlkZXI7XG4gICAgWEhSUHJvdmlkZXIgPSB4aHJQcm92aWRlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWF0ZSBhIG5ldyBjb25uZWN0aW9uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ29ubmVjdGlvbiNcbiAgICogQHBhcmFtIHtzdHJpbmd9IGhvc3RfIEhvc3QgbmFtZSB0byBjb25uZWN0IHRvOyBpZiA8Y29kZT5udWxsPC9jb2RlPiB0aGUgb2xkIGhvc3QgbmFtZSB3aWxsIGJlIHVzZWQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2UgRm9yY2UgbmV3IGNvbm5lY3Rpb24gZXZlbiBpZiBvbmUgYWxyZWFkeSBleGlzdHMuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IFByb21pc2UgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgY29ubmVjdGlvbiBjYWxsIGNvbXBsZXRlcywgcmVzb2x1dGlvbiBpcyBjYWxsZWQgd2l0aG91dFxuICAgKiAgcGFyYW1ldGVycywgcmVqZWN0aW9uIHBhc3NlcyB0aGUge0Vycm9yfSBhcyBwYXJhbWV0ZXIuXG4gICAqL1xuICBjb25uZWN0KGhvc3RfLCBmb3JjZSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcnkgdG8gcmVzdG9yZSBhIG5ldHdvcmsgY29ubmVjdGlvbiwgYWxzbyByZXNldCBiYWNrb2ZmLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNvbm5lY3Rpb24jXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2UgLSByZWNvbm5lY3QgZXZlbiBpZiB0aGVyZSBpcyBhIGxpdmUgY29ubmVjdGlvbiBhbHJlYWR5LlxuICAgKi9cbiAgcmVjb25uZWN0KGZvcmNlKSB7fVxuXG4gIC8qKlxuICAgKiBUZXJtaW5hdGUgdGhlIG5ldHdvcmsgY29ubmVjdGlvblxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNvbm5lY3Rpb24jXG4gICAqL1xuICBkaXNjb25uZWN0KCkge31cblxuICAvKipcbiAgICogU2VuZCBhIHN0cmluZyB0byB0aGUgc2VydmVyLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNvbm5lY3Rpb24jXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtc2cgLSBTdHJpbmcgdG8gc2VuZC5cbiAgICogQHRocm93cyBUaHJvd3MgYW4gZXhjZXB0aW9uIGlmIHRoZSB1bmRlcmx5aW5nIGNvbm5lY3Rpb24gaXMgbm90IGxpdmUuXG4gICAqL1xuICBzZW5kVGV4dChtc2cpIHt9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGNvbm5lY3Rpb24gaXMgYWxpdmUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ29ubmVjdGlvbiNcbiAgICogQHJldHVybnMge2Jvb2xlYW59IDxjb2RlPnRydWU8L2NvZGU+IGlmIGNvbm5lY3Rpb24gaXMgbGl2ZSwgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5hbWUgb2YgdGhlIGN1cnJlbnQgbmV0d29yayB0cmFuc3BvcnQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ29ubmVjdGlvbiNcbiAgICogQHJldHVybnMge3N0cmluZ30gbmFtZSBvZiB0aGUgdHJhbnNwb3J0IHN1Y2ggYXMgPGNvZGU+XCJ3c1wiPC9jb2RlPiBvciA8Y29kZT5cImxwXCI8L2NvZGU+LlxuICAgKi9cbiAgdHJhbnNwb3J0KCkge1xuICAgIHJldHVybiB0aGlzLmluaXRpYWxpemVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgbmV0d29yayBwcm9iZSB0byBjaGVjayBpZiBjb25uZWN0aW9uIGlzIGluZGVlZCBsaXZlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkNvbm5lY3Rpb24jXG4gICAqL1xuICBwcm9iZSgpIHtcbiAgICB0aGlzLnNlbmRUZXh0KCcxJyk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgYXV0b3JlY29ubmVjdCBjb3VudGVyIHRvIHplcm8uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ29ubmVjdGlvbiNcbiAgICovXG4gIGJhY2tvZmZSZXNldCgpIHtcbiAgICB0aGlzLiNib2ZmUmVzZXQoKTtcbiAgfVxuXG4gICNsb2codGV4dCwgLi4uYXJncykge1xuICAgIGlmIChDb25uZWN0aW9uLmxvZ2dlcikge1xuICAgICAgQ29ubmVjdGlvbi5sb2dnZXIodGV4dCwgLi4uYXJncyk7XG4gICAgfVxuICB9XG5cbiAgLy8gQmFja29mZiBpbXBsZW1lbnRhdGlvbiAtIHJlY29ubmVjdCBhZnRlciBhIHRpbWVvdXQuXG4gICNib2ZmUmVjb25uZWN0KCkge1xuICAgIC8vIENsZWFyIHRpbWVyXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuI2JvZmZUaW1lcik7XG4gICAgLy8gQ2FsY3VsYXRlIHdoZW4gdG8gZmlyZSB0aGUgcmVjb25uZWN0IGF0dGVtcHRcbiAgICBjb25zdCB0aW1lb3V0ID0gX0JPRkZfQkFTRSAqIChNYXRoLnBvdygyLCB0aGlzLiNib2ZmSXRlcmF0aW9uKSAqICgxLjAgKyBfQk9GRl9KSVRURVIgKiBNYXRoLnJhbmRvbSgpKSk7XG4gICAgLy8gVXBkYXRlIGl0ZXJhdGlvbiBjb3VudGVyIGZvciBmdXR1cmUgdXNlXG4gICAgdGhpcy4jYm9mZkl0ZXJhdGlvbiA9ICh0aGlzLiNib2ZmSXRlcmF0aW9uID49IF9CT0ZGX01BWF9JVEVSID8gdGhpcy4jYm9mZkl0ZXJhdGlvbiA6IHRoaXMuI2JvZmZJdGVyYXRpb24gKyAxKTtcbiAgICBpZiAodGhpcy5vbkF1dG9yZWNvbm5lY3RJdGVyYXRpb24pIHtcbiAgICAgIHRoaXMub25BdXRvcmVjb25uZWN0SXRlcmF0aW9uKHRpbWVvdXQpO1xuICAgIH1cblxuICAgIHRoaXMuI2JvZmZUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy4jbG9nKGBSZWNvbm5lY3RpbmcsIGl0ZXI9JHt0aGlzLiNib2ZmSXRlcmF0aW9ufSwgdGltZW91dD0ke3RpbWVvdXR9YCk7XG4gICAgICAvLyBNYXliZSB0aGUgc29ja2V0IHdhcyBjbG9zZWQgd2hpbGUgd2Ugd2FpdGVkIGZvciB0aGUgdGltZXI/XG4gICAgICBpZiAoIXRoaXMuI2JvZmZDbG9zZWQpIHtcbiAgICAgICAgY29uc3QgcHJvbSA9IHRoaXMuY29ubmVjdCgpO1xuICAgICAgICBpZiAodGhpcy5vbkF1dG9yZWNvbm5lY3RJdGVyYXRpb24pIHtcbiAgICAgICAgICB0aGlzLm9uQXV0b3JlY29ubmVjdEl0ZXJhdGlvbigwLCBwcm9tKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBTdXBwcmVzcyBlcnJvciBpZiBpdCdzIG5vdCB1c2VkLlxuICAgICAgICAgIHByb20uY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgLyogZG8gbm90aGluZyAqL1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub25BdXRvcmVjb25uZWN0SXRlcmF0aW9uKSB7XG4gICAgICAgIHRoaXMub25BdXRvcmVjb25uZWN0SXRlcmF0aW9uKC0xKTtcbiAgICAgIH1cbiAgICB9LCB0aW1lb3V0KTtcbiAgfVxuXG4gIC8vIFRlcm1pbmF0ZSBhdXRvLXJlY29ubmVjdCBwcm9jZXNzLlxuICAjYm9mZlN0b3AoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuI2JvZmZUaW1lcik7XG4gICAgdGhpcy4jYm9mZlRpbWVyID0gbnVsbDtcbiAgfVxuXG4gIC8vIFJlc2V0IGF1dG8tcmVjb25uZWN0IGl0ZXJhdGlvbiBjb3VudGVyLlxuICAjYm9mZlJlc2V0KCkge1xuICAgIHRoaXMuI2JvZmZJdGVyYXRpb24gPSAwO1xuICB9XG5cbiAgLy8gSW5pdGlhbGl6YXRpb24gZm9yIGxvbmcgcG9sbGluZy5cbiAgI2luaXRfbHAoKSB7XG4gICAgY29uc3QgWERSX1VOU0VOVCA9IDA7IC8vIENsaWVudCBoYXMgYmVlbiBjcmVhdGVkLiBvcGVuKCkgbm90IGNhbGxlZCB5ZXQuXG4gICAgY29uc3QgWERSX09QRU5FRCA9IDE7IC8vIG9wZW4oKSBoYXMgYmVlbiBjYWxsZWQuXG4gICAgY29uc3QgWERSX0hFQURFUlNfUkVDRUlWRUQgPSAyOyAvLyBzZW5kKCkgaGFzIGJlZW4gY2FsbGVkLCBhbmQgaGVhZGVycyBhbmQgc3RhdHVzIGFyZSBhdmFpbGFibGUuXG4gICAgY29uc3QgWERSX0xPQURJTkcgPSAzOyAvLyBEb3dubG9hZGluZzsgcmVzcG9uc2VUZXh0IGhvbGRzIHBhcnRpYWwgZGF0YS5cbiAgICBjb25zdCBYRFJfRE9ORSA9IDQ7IC8vIFRoZSBvcGVyYXRpb24gaXMgY29tcGxldGUuXG5cbiAgICAvLyBGdWxseSBjb21wb3NlZCBlbmRwb2ludCBVUkwsIHdpdGggQVBJIGtleSAmIFNJRFxuICAgIGxldCBfbHBVUkwgPSBudWxsO1xuXG4gICAgbGV0IF9wb2xsZXIgPSBudWxsO1xuICAgIGxldCBfc2VuZGVyID0gbnVsbDtcblxuICAgIGxldCBscF9zZW5kZXIgPSAodXJsXykgPT4ge1xuICAgICAgY29uc3Qgc2VuZGVyID0gbmV3IFhIUlByb3ZpZGVyKCk7XG4gICAgICBzZW5kZXIub25yZWFkeXN0YXRlY2hhbmdlID0gKGV2dCkgPT4ge1xuICAgICAgICBpZiAoc2VuZGVyLnJlYWR5U3RhdGUgPT0gWERSX0RPTkUgJiYgc2VuZGVyLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICAvLyBTb21lIHNvcnQgb2YgZXJyb3IgcmVzcG9uc2VcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYExQIHNlbmRlciBmYWlsZWQsICR7c2VuZGVyLnN0YXR1c31gKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgc2VuZGVyLm9wZW4oJ1BPU1QnLCB1cmxfLCB0cnVlKTtcbiAgICAgIHJldHVybiBzZW5kZXI7XG4gICAgfVxuXG4gICAgbGV0IGxwX3BvbGxlciA9ICh1cmxfLCByZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBwb2xsZXIgPSBuZXcgWEhSUHJvdmlkZXIoKTtcbiAgICAgIGxldCBwcm9taXNlQ29tcGxldGVkID0gZmFsc2U7XG5cbiAgICAgIHBvbGxlci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoZXZ0KSA9PiB7XG4gICAgICAgIGlmIChwb2xsZXIucmVhZHlTdGF0ZSA9PSBYRFJfRE9ORSkge1xuICAgICAgICAgIGlmIChwb2xsZXIuc3RhdHVzID09IDIwMSkgeyAvLyAyMDEgPT0gSFRUUC5DcmVhdGVkLCBnZXQgU0lEXG4gICAgICAgICAgICBsZXQgcGt0ID0gSlNPTi5wYXJzZShwb2xsZXIucmVzcG9uc2VUZXh0LCBqc29uUGFyc2VIZWxwZXIpO1xuICAgICAgICAgICAgX2xwVVJMID0gdXJsXyArICcmc2lkPScgKyBwa3QuY3RybC5wYXJhbXMuc2lkO1xuICAgICAgICAgICAgcG9sbGVyID0gbHBfcG9sbGVyKF9scFVSTCk7XG4gICAgICAgICAgICBwb2xsZXIuc2VuZChudWxsKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9uT3Blbikge1xuICAgICAgICAgICAgICB0aGlzLm9uT3BlbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgICBwcm9taXNlQ29tcGxldGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5hdXRvcmVjb25uZWN0KSB7XG4gICAgICAgICAgICAgIHRoaXMuI2JvZmZTdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChwb2xsZXIuc3RhdHVzIDwgNDAwKSB7IC8vIDQwMCA9IEhUVFAuQmFkUmVxdWVzdFxuICAgICAgICAgICAgaWYgKHRoaXMub25NZXNzYWdlKSB7XG4gICAgICAgICAgICAgIHRoaXMub25NZXNzYWdlKHBvbGxlci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9sbGVyID0gbHBfcG9sbGVyKF9scFVSTCk7XG4gICAgICAgICAgICBwb2xsZXIuc2VuZChudWxsKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRG9uJ3QgdGhyb3cgYW4gZXJyb3IgaGVyZSwgZ3JhY2VmdWxseSBoYW5kbGUgc2VydmVyIGVycm9yc1xuICAgICAgICAgICAgaWYgKHJlamVjdCAmJiAhcHJvbWlzZUNvbXBsZXRlZCkge1xuICAgICAgICAgICAgICBwcm9taXNlQ29tcGxldGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmVqZWN0KHBvbGxlci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMub25NZXNzYWdlICYmIHBvbGxlci5yZXNwb25zZVRleHQpIHtcbiAgICAgICAgICAgICAgdGhpcy5vbk1lc3NhZ2UocG9sbGVyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5vbkRpc2Nvbm5lY3QpIHtcbiAgICAgICAgICAgICAgY29uc3QgY29kZSA9IHBvbGxlci5zdGF0dXMgfHwgKHRoaXMuI2JvZmZDbG9zZWQgPyBORVRXT1JLX1VTRVIgOiBORVRXT1JLX0VSUk9SKTtcbiAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IHBvbGxlci5yZXNwb25zZVRleHQgfHwgKHRoaXMuI2JvZmZDbG9zZWQgPyBORVRXT1JLX1VTRVJfVEVYVCA6IE5FVFdPUktfRVJST1JfVEVYVCk7XG4gICAgICAgICAgICAgIHRoaXMub25EaXNjb25uZWN0KG5ldyBFcnJvcih0ZXh0ICsgJyAoJyArIGNvZGUgKyAnKScpLCBjb2RlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUG9sbGluZyBoYXMgc3RvcHBlZC4gSW5kaWNhdGUgaXQgYnkgc2V0dGluZyBwb2xsZXIgdG8gbnVsbC5cbiAgICAgICAgICAgIHBvbGxlciA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIXRoaXMuI2JvZmZDbG9zZWQgJiYgdGhpcy5hdXRvcmVjb25uZWN0KSB7XG4gICAgICAgICAgICAgIHRoaXMuI2JvZmZSZWNvbm5lY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBwb2xsZXIub3BlbignR0VUJywgdXJsXywgdHJ1ZSk7XG4gICAgICByZXR1cm4gcG9sbGVyO1xuICAgIH1cblxuICAgIHRoaXMuY29ubmVjdCA9IChob3N0XywgZm9yY2UpID0+IHtcbiAgICAgIHRoaXMuI2JvZmZDbG9zZWQgPSBmYWxzZTtcblxuICAgICAgaWYgKF9wb2xsZXIpIHtcbiAgICAgICAgaWYgKCFmb3JjZSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBfcG9sbGVyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgX3BvbGxlci5hYm9ydCgpO1xuICAgICAgICBfcG9sbGVyID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKGhvc3RfKSB7XG4gICAgICAgIHRoaXMuaG9zdCA9IGhvc3RfO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBtYWtlQmFzZVVybCh0aGlzLmhvc3QsIHRoaXMuc2VjdXJlID8gJ2h0dHBzJyA6ICdodHRwJywgdGhpcy52ZXJzaW9uLCB0aGlzLmFwaUtleSk7XG4gICAgICAgIHRoaXMuI2xvZyhcIkNvbm5lY3RpbmcgdG86XCIsIHVybCk7XG4gICAgICAgIF9wb2xsZXIgPSBscF9wb2xsZXIodXJsLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICBfcG9sbGVyLnNlbmQobnVsbCk7XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHRoaXMuI2xvZyhcIkxQIGNvbm5lY3Rpb24gZmFpbGVkOlwiLCBlcnIpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMucmVjb25uZWN0ID0gKGZvcmNlKSA9PiB7XG4gICAgICB0aGlzLiNib2ZmU3RvcCgpO1xuICAgICAgdGhpcy5jb25uZWN0KG51bGwsIGZvcmNlKTtcbiAgICB9O1xuXG4gICAgdGhpcy5kaXNjb25uZWN0ID0gKCkgPT4ge1xuICAgICAgdGhpcy4jYm9mZkNsb3NlZCA9IHRydWU7XG4gICAgICB0aGlzLiNib2ZmU3RvcCgpO1xuXG4gICAgICBpZiAoX3NlbmRlcikge1xuICAgICAgICBfc2VuZGVyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgX3NlbmRlci5hYm9ydCgpO1xuICAgICAgICBfc2VuZGVyID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmIChfcG9sbGVyKSB7XG4gICAgICAgIF9wb2xsZXIub25yZWFkeXN0YXRlY2hhbmdlID0gdW5kZWZpbmVkO1xuICAgICAgICBfcG9sbGVyLmFib3J0KCk7XG4gICAgICAgIF9wb2xsZXIgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vbkRpc2Nvbm5lY3QpIHtcbiAgICAgICAgdGhpcy5vbkRpc2Nvbm5lY3QobmV3IEVycm9yKE5FVFdPUktfVVNFUl9URVhUICsgJyAoJyArIE5FVFdPUktfVVNFUiArICcpJyksIE5FVFdPUktfVVNFUik7XG4gICAgICB9XG4gICAgICAvLyBFbnN1cmUgaXQncyByZWNvbnN0cnVjdGVkXG4gICAgICBfbHBVUkwgPSBudWxsO1xuICAgIH07XG5cbiAgICB0aGlzLnNlbmRUZXh0ID0gKG1zZykgPT4ge1xuICAgICAgX3NlbmRlciA9IGxwX3NlbmRlcihfbHBVUkwpO1xuICAgICAgaWYgKF9zZW5kZXIgJiYgKF9zZW5kZXIucmVhZHlTdGF0ZSA9PSBYRFJfT1BFTkVEKSkgeyAvLyAxID09IE9QRU5FRFxuICAgICAgICBfc2VuZGVyLnNlbmQobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvbmcgcG9sbGVyIGZhaWxlZCB0byBjb25uZWN0XCIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmlzQ29ubmVjdGVkID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIChfcG9sbGVyICYmIHRydWUpO1xuICAgIH07XG4gIH1cblxuICAvLyBJbml0aWFsaXphdGlvbiBmb3IgV2Vic29ja2V0XG4gICNpbml0X3dzKCkge1xuICAgIHRoaXMuY29ubmVjdCA9IChob3N0XywgZm9yY2UpID0+IHtcbiAgICAgIHRoaXMuI2JvZmZDbG9zZWQgPSBmYWxzZTtcblxuICAgICAgaWYgKHRoaXMuI3NvY2tldCkge1xuICAgICAgICBpZiAoIWZvcmNlICYmIHRoaXMuI3NvY2tldC5yZWFkeVN0YXRlID09IHRoaXMuI3NvY2tldC5PUEVOKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuI3NvY2tldC5jbG9zZSgpO1xuICAgICAgICB0aGlzLiNzb2NrZXQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoaG9zdF8pIHtcbiAgICAgICAgdGhpcy5ob3N0ID0gaG9zdF87XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IG1ha2VCYXNlVXJsKHRoaXMuaG9zdCwgdGhpcy5zZWN1cmUgPyAnd3NzJyA6ICd3cycsIHRoaXMudmVyc2lvbiwgdGhpcy5hcGlLZXkpO1xuXG4gICAgICAgIHRoaXMuI2xvZyhcIkNvbm5lY3RpbmcgdG86IFwiLCB1cmwpO1xuXG4gICAgICAgIC8vIEl0IHRocm93cyB3aGVuIHRoZSBzZXJ2ZXIgaXMgbm90IGFjY2Vzc2libGUgYnV0IHRoZSBleGNlcHRpb24gY2Fubm90IGJlIGNhdWdodDpcbiAgICAgICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzEwMDI1OTIvamF2YXNjcmlwdC1kb2VzbnQtY2F0Y2gtZXJyb3ItaW4td2Vic29ja2V0LWluc3RhbnRpYXRpb24vMzEwMDMwNTdcbiAgICAgICAgY29uc3QgY29ubiA9IG5ldyBXZWJTb2NrZXRQcm92aWRlcih1cmwpO1xuXG4gICAgICAgIGNvbm4ub25lcnJvciA9IChlcnIpID0+IHtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25uLm9ub3BlbiA9IChldnQpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5hdXRvcmVjb25uZWN0KSB7XG4gICAgICAgICAgICB0aGlzLiNib2ZmU3RvcCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLm9uT3Blbikge1xuICAgICAgICAgICAgdGhpcy5vbk9wZW4oKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29ubi5vbmNsb3NlID0gKGV2dCkgPT4ge1xuICAgICAgICAgIHRoaXMuI3NvY2tldCA9IG51bGw7XG5cbiAgICAgICAgICBpZiAodGhpcy5vbkRpc2Nvbm5lY3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvZGUgPSB0aGlzLiNib2ZmQ2xvc2VkID8gTkVUV09SS19VU0VSIDogTkVUV09SS19FUlJPUjtcbiAgICAgICAgICAgIHRoaXMub25EaXNjb25uZWN0KG5ldyBFcnJvcih0aGlzLiNib2ZmQ2xvc2VkID8gTkVUV09SS19VU0VSX1RFWFQgOiBORVRXT1JLX0VSUk9SX1RFWFQgK1xuICAgICAgICAgICAgICAnICgnICsgY29kZSArICcpJyksIGNvZGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghdGhpcy4jYm9mZkNsb3NlZCAmJiB0aGlzLmF1dG9yZWNvbm5lY3QpIHtcbiAgICAgICAgICAgIHRoaXMuI2JvZmZSZWNvbm5lY3QoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29ubi5vbm1lc3NhZ2UgPSAoZXZ0KSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMub25NZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLm9uTWVzc2FnZShldnQuZGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuI3NvY2tldCA9IGNvbm47XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLnJlY29ubmVjdCA9IChmb3JjZSkgPT4ge1xuICAgICAgdGhpcy4jYm9mZlN0b3AoKTtcbiAgICAgIHRoaXMuY29ubmVjdChudWxsLCBmb3JjZSk7XG4gICAgfTtcblxuICAgIHRoaXMuZGlzY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIHRoaXMuI2JvZmZDbG9zZWQgPSB0cnVlO1xuICAgICAgdGhpcy4jYm9mZlN0b3AoKTtcblxuICAgICAgaWYgKCF0aGlzLiNzb2NrZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy4jc29ja2V0LmNsb3NlKCk7XG4gICAgICB0aGlzLiNzb2NrZXQgPSBudWxsO1xuICAgIH07XG5cbiAgICB0aGlzLnNlbmRUZXh0ID0gKG1zZykgPT4ge1xuICAgICAgaWYgKHRoaXMuI3NvY2tldCAmJiAodGhpcy4jc29ja2V0LnJlYWR5U3RhdGUgPT0gdGhpcy4jc29ja2V0Lk9QRU4pKSB7XG4gICAgICAgIHRoaXMuI3NvY2tldC5zZW5kKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXZWJzb2NrZXQgaXMgbm90IGNvbm5lY3RlZFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5pc0Nvbm5lY3RlZCA9ICgpID0+IHtcbiAgICAgIHJldHVybiAodGhpcy4jc29ja2V0ICYmICh0aGlzLiNzb2NrZXQucmVhZHlTdGF0ZSA9PSB0aGlzLiNzb2NrZXQuT1BFTikpO1xuICAgIH07XG4gIH1cblxuICAvLyBDYWxsYmFja3M6XG5cbiAgLyoqXG4gICAqIEEgY2FsbGJhY2sgdG8gcGFzcyBpbmNvbWluZyBtZXNzYWdlcyB0by4gU2VlIHtAbGluayBUaW5vZGUuQ29ubmVjdGlvbiNvbk1lc3NhZ2V9LlxuICAgKiBAY2FsbGJhY2sgVGlub2RlLkNvbm5lY3Rpb24uT25NZXNzYWdlXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ29ubmVjdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gcHJvY2Vzcy5cbiAgICovXG4gIG9uTWVzc2FnZSA9IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogQSBjYWxsYmFjayBmb3IgcmVwb3J0aW5nIGEgZHJvcHBlZCBjb25uZWN0aW9uLlxuICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ29ubmVjdGlvbiNcbiAgICovXG4gIG9uRGlzY29ubmVjdCA9IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogQSBjYWxsYmFjayBjYWxsZWQgd2hlbiB0aGUgY29ubmVjdGlvbiBpcyByZWFkeSB0byBiZSB1c2VkIGZvciBzZW5kaW5nLiBGb3Igd2Vic29ja2V0cyBpdCdzIHNvY2tldCBvcGVuLFxuICAgKiBmb3IgbG9uZyBwb2xsaW5nIGl0J3MgPGNvZGU+cmVhZHlTdGF0ZT0xPC9jb2RlPiAoT1BFTkVEKVxuICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ29ubmVjdGlvbiNcbiAgICovXG4gIG9uT3BlbiA9IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogQSBjYWxsYmFjayB0byBub3RpZnkgb2YgcmVjb25uZWN0aW9uIGF0dGVtcHRzLiBTZWUge0BsaW5rIFRpbm9kZS5Db25uZWN0aW9uI29uQXV0b3JlY29ubmVjdEl0ZXJhdGlvbn0uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ29ubmVjdGlvblxuICAgKiBAY2FsbGJhY2sgQXV0b3JlY29ubmVjdEl0ZXJhdGlvblR5cGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRpbWVvdXQgLSB0aW1lIHRpbGwgdGhlIG5leHQgcmVjb25uZWN0IGF0dGVtcHQgaW4gbWlsbGlzZWNvbmRzLiA8Y29kZT4tMTwvY29kZT4gbWVhbnMgcmVjb25uZWN0IHdhcyBza2lwcGVkLlxuICAgKiBAcGFyYW0ge1Byb21pc2V9IHByb21pc2UgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQgd2hlbiB0aGUgcmVjb25uZWN0IGF0dGVtcCBjb21wbGV0ZXMuXG4gICAqXG4gICAqL1xuICAvKipcbiAgICogQSBjYWxsYmFjayB0byBpbmZvcm0gd2hlbiB0aGUgbmV4dCBhdHRhbXB0IHRvIHJlY29ubmVjdCB3aWxsIGhhcHBlbiBhbmQgdG8gcmVjZWl2ZSBjb25uZWN0aW9uIHByb21pc2UuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ29ubmVjdGlvbiNcbiAgICogQHR5cGUge1Rpbm9kZS5Db25uZWN0aW9uLkF1dG9yZWNvbm5lY3RJdGVyYXRpb25UeXBlfVxuICAgKi9cbiAgb25BdXRvcmVjb25uZWN0SXRlcmF0aW9uID0gdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBBIGNhbGxiYWNrIHRvIGxvZyBldmVudHMgZnJvbSBDb25uZWN0aW9uLiBTZWUge0BsaW5rIFRpbm9kZS5Db25uZWN0aW9uI2xvZ2dlcn0uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuQ29ubmVjdGlvblxuICAgKiBAY2FsbGJhY2sgTG9nZ2VyQ2FsbGJhY2tUeXBlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIEV2ZW50IHRvIGxvZy5cbiAgICovXG4gIC8qKlxuICAgKiBBIGNhbGxiYWNrIHRvIHJlcG9ydCBsb2dnaW5nIGV2ZW50cy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Db25uZWN0aW9uI1xuICAgKiBAdHlwZSB7VGlub2RlLkNvbm5lY3Rpb24uTG9nZ2VyQ2FsbGJhY2tUeXBlfVxuICAgKi9cbiAgbG9nZ2VyID0gdW5kZWZpbmVkO1xufVxuXG5Db25uZWN0aW9uLk5FVFdPUktfRVJST1IgPSBORVRXT1JLX0VSUk9SO1xuQ29ubmVjdGlvbi5ORVRXT1JLX0VSUk9SX1RFWFQgPSBORVRXT1JLX0VSUk9SX1RFWFQ7XG5Db25uZWN0aW9uLk5FVFdPUktfVVNFUiA9IE5FVFdPUktfVVNFUjtcbkNvbm5lY3Rpb24uTkVUV09SS19VU0VSX1RFWFQgPSBORVRXT1JLX1VTRVJfVEVYVDtcbiIsIi8qKlxuICogQGZpbGUgSGVscGVyIG1ldGhvZHMgZm9yIGRlYWxpbmcgd2l0aCBJbmRleGVkREIgY2FjaGUgb2YgbWVzc2FnZXMsIHVzZXJzLCBhbmQgdG9waWNzLlxuICpcbiAqIEBjb3B5cmlnaHQgMjAxNS0yMDIyIFRpbm9kZSBMTEMuXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy8gTk9URSBUTyBERVZFTE9QRVJTOlxuLy8gTG9jYWxpemFibGUgc3RyaW5ncyBzaG91bGQgYmUgZG91YmxlIHF1b3RlZCBcItGB0YLRgNC+0LrQsCDQvdCwINC00YDRg9Cz0L7QvCDRj9C30YvQutC1XCIsXG4vLyBub24tbG9jYWxpemFibGUgc3RyaW5ncyBzaG91bGQgYmUgc2luZ2xlIHF1b3RlZCAnbm9uLWxvY2FsaXplZCcuXG5cbmNvbnN0IERCX1ZFUlNJT04gPSAxO1xuY29uc3QgREJfTkFNRSA9ICd0aW5vZGUtd2ViJztcblxubGV0IElEQlByb3ZpZGVyO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEQiB7XG4gICNvbkVycm9yID0gZnVuY3Rpb24oKSB7fTtcbiAgI2xvZ2dlciA9IGZ1bmN0aW9uKCkge307XG5cbiAgLy8gSW5zdGFuY2Ugb2YgSW5kZXhEQi5cbiAgZGIgPSBudWxsO1xuICAvLyBJbmRpY2F0b3IgdGhhdCB0aGUgY2FjaGUgaXMgZGlzYWJsZWQuXG4gIGRpc2FibGVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3Iob25FcnJvciwgbG9nZ2VyKSB7XG4gICAgdGhpcy4jb25FcnJvciA9IG9uRXJyb3IgfHwgdGhpcy4jb25FcnJvcjtcbiAgICB0aGlzLiNsb2dnZXIgPSBsb2dnZXIgfHwgdGhpcy4jbG9nZ2VyO1xuICB9XG5cbiAgI21hcE9iamVjdHMoc291cmNlLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgIGlmICghdGhpcy5kYikge1xuICAgICAgcmV0dXJuIGRpc2FibGVkID9cbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKFtdKSA6XG4gICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIm5vdCBpbml0aWFsaXplZFwiKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHRyeCA9IHRoaXMuZGIudHJhbnNhY3Rpb24oW3NvdXJjZV0pO1xuICAgICAgdHJ4Lm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy4jbG9nZ2VyKCdQQ2FjaGUnLCAnbWFwT2JqZWN0cycsIHNvdXJjZSwgZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgICAgcmVqZWN0KGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICB9O1xuICAgICAgdHJ4Lm9iamVjdFN0b3JlKHNvdXJjZSkuZ2V0QWxsKCkub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgIGV2ZW50LnRhcmdldC5yZXN1bHQuZm9yRWFjaCgodG9waWMpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgdG9waWMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlc29sdmUoZXZlbnQudGFyZ2V0LnJlc3VsdCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgcGVyc2lzdGVudCBjYWNoZTogb3BlbiBvciBjcmVhdGUvdXBncmFkZSBpZiBuZWVkZWQuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHRvIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIERCIGlzIGluaXRpYWxpemVkLlxuICAgKi9cbiAgaW5pdERhdGFiYXNlKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBPcGVuIHRoZSBkYXRhYmFzZSBhbmQgaW5pdGlhbGl6ZSBjYWxsYmFja3MuXG4gICAgICBjb25zdCByZXEgPSBJREJQcm92aWRlci5vcGVuKERCX05BTUUsIERCX1ZFUlNJT04pO1xuICAgICAgcmVxLm9uc3VjY2VzcyA9IChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLmRiID0gZXZlbnQudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICByZXNvbHZlKHRoaXMuZGIpO1xuICAgICAgfTtcbiAgICAgIHJlcS5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuI2xvZ2dlcignUENhY2hlJywgXCJmYWlsZWQgdG8gaW5pdGlhbGl6ZVwiLCBldmVudCk7XG4gICAgICAgIHJlamVjdChldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgICB0aGlzLiNvbkVycm9yKGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICB9O1xuICAgICAgcmVxLm9udXBncmFkZW5lZWRlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuZGIgPSBldmVudC50YXJnZXQucmVzdWx0O1xuXG4gICAgICAgIHRoaXMuZGIub25lcnJvciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgdGhpcy4jbG9nZ2VyKCdQQ2FjaGUnLCBcImZhaWxlZCB0byBjcmVhdGUgc3RvcmFnZVwiLCBldmVudCk7XG4gICAgICAgICAgdGhpcy4jb25FcnJvcihldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEluZGl2aWR1YWwgb2JqZWN0IHN0b3Jlcy5cbiAgICAgICAgLy8gT2JqZWN0IHN0b3JlICh0YWJsZSkgZm9yIHRvcGljcy4gVGhlIHByaW1hcnkga2V5IGlzIHRvcGljIG5hbWUuXG4gICAgICAgIHRoaXMuZGIuY3JlYXRlT2JqZWN0U3RvcmUoJ3RvcGljJywge1xuICAgICAgICAgIGtleVBhdGg6ICduYW1lJ1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBVc2VycyBvYmplY3Qgc3RvcmUuIFVJRCBpcyB0aGUgcHJpbWFyeSBrZXkuXG4gICAgICAgIHRoaXMuZGIuY3JlYXRlT2JqZWN0U3RvcmUoJ3VzZXInLCB7XG4gICAgICAgICAga2V5UGF0aDogJ3VpZCdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU3Vic2NyaXB0aW9ucyBvYmplY3Qgc3RvcmUgdG9waWMgPC0+IHVzZXIuIFRvcGljIG5hbWUgKyBVSUQgaXMgdGhlIHByaW1hcnkga2V5LlxuICAgICAgICB0aGlzLmRiLmNyZWF0ZU9iamVjdFN0b3JlKCdzdWJzY3JpcHRpb24nLCB7XG4gICAgICAgICAga2V5UGF0aDogWyd0b3BpYycsICd1aWQnXVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBNZXNzYWdlcyBvYmplY3Qgc3RvcmUuIFRoZSBwcmltYXJ5IGtleSBpcyB0b3BpYyBuYW1lICsgc2VxLlxuICAgICAgICB0aGlzLmRiLmNyZWF0ZU9iamVjdFN0b3JlKCdtZXNzYWdlJywge1xuICAgICAgICAgIGtleVBhdGg6IFsndG9waWMnLCAnc2VxJ11cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSBwZXJzaXN0ZW50IGNhY2hlLlxuICAgKi9cbiAgZGVsZXRlRGF0YWJhc2UoKSB7XG4gICAgLy8gQ2xvc2UgY29ubmVjdGlvbiwgb3RoZXJ3aXNlIG9wZXJhdGlvbnMgd2lsbCBmYWlsIHdpdGggJ29uYmxvY2tlZCcuXG4gICAgaWYgKHRoaXMuZGIpIHtcbiAgICAgIHRoaXMuZGIuY2xvc2UoKTtcbiAgICAgIHRoaXMuZGIgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcmVxID0gSURCUHJvdmlkZXIuZGVsZXRlRGF0YWJhc2UoREJfTkFNRSk7XG4gICAgICByZXEub25ibG9ja2VkID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuZGIpIHtcbiAgICAgICAgICB0aGlzLmRiLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKFwiYmxvY2tlZFwiKTtcbiAgICAgICAgdGhpcy4jbG9nZ2VyKCdQQ2FjaGUnLCAnZGVsZXRlRGF0YWJhc2UnLCBlcnIpO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH07XG4gICAgICByZXEub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuZGIgPSBudWxsO1xuICAgICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgICByZXEub25lcnJvciA9IChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLiNsb2dnZXIoJ1BDYWNoZScsICdkZWxldGVEYXRhYmFzZScsIGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICAgIHJlamVjdChldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBwZXJzaXN0ZW50IGNhY2hlIGlzIHJlYWR5IGZvciB1c2UuXG4gICAqIEBtZW1iZXJPZiBEQlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgY2FjaGUgaXMgcmVhZHksIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBpc1JlYWR5KCkge1xuICAgIHJldHVybiAhIXRoaXMuZGI7XG4gIH1cblxuICAvLyBUb3BpY3MuXG5cbiAgLyoqXG4gICAqIFNhdmUgdG8gY2FjaGUgb3IgdXBkYXRlIHRvcGljIGluIHBlcnNpc3RlbnQgY2FjaGUuXG4gICAqIEBtZW1iZXJPZiBEQlxuICAgKiBAcGFyYW0ge1RvcGljfSB0b3BpYyAtIHRvcGljIHRvIGJlIGFkZGVkIG9yIHVwZGF0ZWQuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHJlc29sdmVkL3JlamVjdGVkIG9uIG9wZXJhdGlvbiBjb21wbGV0aW9uLlxuICAgKi9cbiAgdXBkVG9waWModG9waWMpIHtcbiAgICBpZiAoIXRoaXMuaXNSZWFkeSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXNhYmxlZCA/XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpIDpcbiAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwibm90IGluaXRpYWxpemVkXCIpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHRyeCA9IHRoaXMuZGIudHJhbnNhY3Rpb24oWyd0b3BpYyddLCAncmVhZHdyaXRlJyk7XG4gICAgICB0cngub25jb21wbGV0ZSA9IChldmVudCkgPT4ge1xuICAgICAgICByZXNvbHZlKGV2ZW50LnRhcmdldC5yZXN1bHQpO1xuICAgICAgfTtcbiAgICAgIHRyeC5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuI2xvZ2dlcignUENhY2hlJywgJ3VwZFRvcGljJywgZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgICAgcmVqZWN0KGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICB9O1xuICAgICAgY29uc3QgcmVxID0gdHJ4Lm9iamVjdFN0b3JlKCd0b3BpYycpLmdldCh0b3BpYy5uYW1lKTtcbiAgICAgIHJlcS5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdHJ4Lm9iamVjdFN0b3JlKCd0b3BpYycpLnB1dChEQi4jc2VyaWFsaXplVG9waWMocmVxLnJlc3VsdCwgdG9waWMpKTtcbiAgICAgICAgdHJ4LmNvbW1pdCgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrIG9yIHVubWFyayB0b3BpYyBhcyBkZWxldGVkLlxuICAgKiBAbWVtYmVyT2YgREJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBuYW1lIG9mIHRoZSB0b3BpYyB0byBtYXJrIG9yIHVubWFyay5cbiAgICogQHBhcmFtIHtib29sZWFufSBkZWxldGVkIC0gZGVsZXRpb24gbWFyay5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZSByZXNvbHZlZC9yZWplY3RlZCBvbiBvcGVyYXRpb24gY29tcGxldGlvbi5cbiAgICovXG4gIG1hcmtUb3BpY0FzRGVsZXRlZChuYW1lLCBkZWxldGVkKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVhZHkoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgP1xuICAgICAgICBQcm9taXNlLnJlc29sdmUoKSA6XG4gICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIm5vdCBpbml0aWFsaXplZFwiKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cnggPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFsndG9waWMnXSwgJ3JlYWR3cml0ZScpO1xuICAgICAgdHJ4Lm9uY29tcGxldGUgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgcmVzb2x2ZShldmVudC50YXJnZXQucmVzdWx0KTtcbiAgICAgIH07XG4gICAgICB0cngub25lcnJvciA9IChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLiNsb2dnZXIoJ1BDYWNoZScsICdtYXJrVG9waWNBc0RlbGV0ZWQnLCBldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgICByZWplY3QoZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgIH07XG4gICAgICBjb25zdCByZXEgPSB0cngub2JqZWN0U3RvcmUoJ3RvcGljJykuZ2V0KG5hbWUpO1xuICAgICAgcmVxLm9uc3VjY2VzcyA9IChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCB0b3BpYyA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgIGlmICh0b3BpYy5fZGVsZXRlZCAhPSBkZWxldGVkKSB7XG4gICAgICAgICAgdG9waWMuX2RlbGV0ZWQgPSB0cnVlO1xuICAgICAgICAgIHRyeC5vYmplY3RTdG9yZSgndG9waWMnKS5wdXQodG9waWMpO1xuICAgICAgICB9XG4gICAgICAgIHRyeC5jb21taXQoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHRvcGljIGZyb20gcGVyc2lzdGVudCBjYWNoZS5cbiAgICogQG1lbWJlck9mIERCXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gbmFtZSBvZiB0aGUgdG9waWMgdG8gcmVtb3ZlIGZyb20gZGF0YWJhc2UuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHByb21pc2UgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gb3BlcmF0aW9uIGNvbXBsZXRpb24uXG4gICAqL1xuICByZW1Ub3BpYyhuYW1lKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVhZHkoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgP1xuICAgICAgICBQcm9taXNlLnJlc29sdmUoKSA6XG4gICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIm5vdCBpbml0aWFsaXplZFwiKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cnggPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFsndG9waWMnLCAnc3Vic2NyaXB0aW9uJywgJ21lc3NhZ2UnXSwgJ3JlYWR3cml0ZScpO1xuICAgICAgdHJ4Lm9uY29tcGxldGUgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgcmVzb2x2ZShldmVudC50YXJnZXQucmVzdWx0KTtcbiAgICAgIH07XG4gICAgICB0cngub25lcnJvciA9IChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLiNsb2dnZXIoJ1BDYWNoZScsICdyZW1Ub3BpYycsIGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICAgIHJlamVjdChldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIHRyeC5vYmplY3RTdG9yZSgndG9waWMnKS5kZWxldGUoSURCS2V5UmFuZ2Uub25seShuYW1lKSk7XG4gICAgICB0cngub2JqZWN0U3RvcmUoJ3N1YnNjcmlwdGlvbicpLmRlbGV0ZShJREJLZXlSYW5nZS5ib3VuZChbbmFtZSwgJy0nXSwgW25hbWUsICd+J10pKTtcbiAgICAgIHRyeC5vYmplY3RTdG9yZSgnbWVzc2FnZScpLmRlbGV0ZShJREJLZXlSYW5nZS5ib3VuZChbbmFtZSwgMF0sIFtuYW1lLCBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUl0pKTtcbiAgICAgIHRyeC5jb21taXQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIGEgY2FsbGJhY2sgZm9yIGVhY2ggc3RvcmVkIHRvcGljLlxuICAgKiBAbWVtYmVyT2YgREJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHRvcGljLlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIHRoZSB2YWx1ZSBvciA8Y29kZT50aGlzPC9jb2RlPiBpbnNpZGUgdGhlIGNhbGxiYWNrLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSBwcm9taXNlIHJlc29sdmVkL3JlamVjdGVkIG9uIG9wZXJhdGlvbiBjb21wbGV0aW9uLlxuICAgKi9cbiAgbWFwVG9waWNzKGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIHRoaXMuI21hcE9iamVjdHMoJ3RvcGljJywgY2FsbGJhY2ssIGNvbnRleHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvcHkgZGF0YSBmcm9tIHNlcmlhbGl6ZWQgb2JqZWN0IHRvIHRvcGljLlxuICAgKiBAbWVtYmVyT2YgREJcbiAgICogQHBhcmFtIHtUb3BpY30gdG9waWMgLSB0YXJnZXQgdG8gZGVzZXJpYWxpemUgdG8uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzcmMgLSBzZXJpYWxpemVkIGRhdGEgdG8gY29weSBmcm9tLlxuICAgKi9cbiAgZGVzZXJpYWxpemVUb3BpYyh0b3BpYywgc3JjKSB7XG4gICAgREIuI2Rlc2VyaWFsaXplVG9waWModG9waWMsIHNyYyk7XG4gIH1cblxuICAvLyBVc2Vycy5cbiAgLyoqXG4gICAqIEFkZCBvciB1cGRhdGUgdXNlciBvYmplY3QgaW4gdGhlIHBlcnNpc3RlbnQgY2FjaGUuXG4gICAqIEBtZW1iZXJPZiBEQlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdWlkIC0gSUQgb2YgdGhlIHVzZXIgdG8gc2F2ZSBvciB1cGRhdGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwdWIgLSB1c2VyJ3MgPGNvZGU+cHVibGljPC9jb2RlPiBpbmZvcm1hdGlvbi5cbiAgICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2UgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gb3BlcmF0aW9uIGNvbXBsZXRpb24uXG4gICAqL1xuICB1cGRVc2VyKHVpZCwgcHViKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyIHx8IHB1YiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBObyBwb2ludCBpbnVwZGF0aW5nIHVzZXIgd2l0aCBpbnZhbGlkIGRhdGEuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghdGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc2FibGVkID9cbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkgOlxuICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJub3QgaW5pdGlhbGl6ZWRcIikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdHJ4ID0gdGhpcy5kYi50cmFuc2FjdGlvbihbJ3VzZXInXSwgJ3JlYWR3cml0ZScpO1xuICAgICAgdHJ4Lm9uY29tcGxldGUgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgcmVzb2x2ZShldmVudC50YXJnZXQucmVzdWx0KTtcbiAgICAgIH07XG4gICAgICB0cngub25lcnJvciA9IChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLiNsb2dnZXIoJ1BDYWNoZScsICd1cGRVc2VyJywgZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgICAgcmVqZWN0KGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICB9O1xuICAgICAgdHJ4Lm9iamVjdFN0b3JlKCd1c2VyJykucHV0KHtcbiAgICAgICAgdWlkOiB1aWQsXG4gICAgICAgIHB1YmxpYzogcHViXG4gICAgICB9KTtcbiAgICAgIHRyeC5jb21taXQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdXNlciBmcm9tIHBlcnNpc3RlbnQgY2FjaGUuXG4gICAqIEBtZW1iZXJPZiBEQlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdWlkIC0gSUQgb2YgdGhlIHVzZXIgdG8gcmVtb3ZlIGZyb20gdGhlIGNhY2hlLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSBwcm9taXNlIHJlc29sdmVkL3JlamVjdGVkIG9uIG9wZXJhdGlvbiBjb21wbGV0aW9uLlxuICAgKi9cbiAgcmVtVXNlcih1aWQpIHtcbiAgICBpZiAoIXRoaXMuaXNSZWFkeSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXNhYmxlZCA/XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpIDpcbiAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwibm90IGluaXRpYWxpemVkXCIpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHRyeCA9IHRoaXMuZGIudHJhbnNhY3Rpb24oWyd1c2VyJ10sICdyZWFkd3JpdGUnKTtcbiAgICAgIHRyeC5vbmNvbXBsZXRlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHJlc29sdmUoZXZlbnQudGFyZ2V0LnJlc3VsdCk7XG4gICAgICB9O1xuICAgICAgdHJ4Lm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy4jbG9nZ2VyKCdQQ2FjaGUnLCAncmVtVXNlcicsIGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICAgIHJlamVjdChldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIHRyeC5vYmplY3RTdG9yZSgndXNlcicpLmRlbGV0ZShJREJLZXlSYW5nZS5vbmx5KHVpZCkpO1xuICAgICAgdHJ4LmNvbW1pdCgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGUgYSBjYWxsYmFjayBmb3IgZWFjaCBzdG9yZWQgdXNlci5cbiAgICogQG1lbWJlck9mIERCXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB0b3BpYy5cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSB0aGUgdmFsdWUgb3IgPGNvZGU+dGhpczwvY29kZT4gaW5zaWRlIHRoZSBjYWxsYmFjay5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZSByZXNvbHZlZC9yZWplY3RlZCBvbiBvcGVyYXRpb24gY29tcGxldGlvbi5cbiAgICovXG4gIG1hcFVzZXJzKGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIHRoaXMuI21hcE9iamVjdHMoJ3VzZXInLCBjYWxsYmFjaywgY29udGV4dCk7XG4gIH1cblxuICAvKipcbiAgICogUmVhZCBhIHNpbmdsZSB1c2VyIGZyb20gcGVyc2lzdGVudCBjYWNoZS5cbiAgICogQG1lbWJlck9mIERCXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1aWQgLSBJRCBvZiB0aGUgdXNlciB0byBmZXRjaCBmcm9tIGNhY2hlLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSBwcm9taXNlIHJlc29sdmVkL3JlamVjdGVkIG9uIG9wZXJhdGlvbiBjb21wbGV0aW9uLlxuICAgKi9cbiAgZ2V0VXNlcih1aWQpIHtcbiAgICBpZiAoIXRoaXMuaXNSZWFkeSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXNhYmxlZCA/XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpIDpcbiAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwibm90IGluaXRpYWxpemVkXCIpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHRyeCA9IHRoaXMuZGIudHJhbnNhY3Rpb24oWyd1c2VyJ10pO1xuICAgICAgdHJ4Lm9uY29tcGxldGUgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgdXNlciA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgIHVzZXI6IHVzZXIudWlkLFxuICAgICAgICAgIHB1YmxpYzogdXNlci5wdWJsaWNcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgdHJ4Lm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy4jbG9nZ2VyKCdQQ2FjaGUnLCAnZ2V0VXNlcicsIGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICAgIHJlamVjdChldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIHRyeC5vYmplY3RTdG9yZSgndXNlcicpLmdldCh1aWQpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gU3Vic2NyaXB0aW9ucy5cbiAgLyoqXG4gICAqIEFkZCBvciB1cGRhdGUgc3Vic2NyaXB0aW9uIGluIHBlcnNpc3RlbnQgY2FjaGUuXG4gICAqIEBtZW1iZXJPZiBEQlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWNOYW1lIC0gbmFtZSBvZiB0aGUgdG9waWMgd2hpY2ggb3ducyB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVpZCAtIElEIG9mIHRoZSBzdWJzY3JpYmVkIHVzZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdWIgLSBzdWJzY3JpcHRpb24gdG8gc2F2ZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZSByZXNvbHZlZC9yZWplY3RlZCBvbiBvcGVyYXRpb24gY29tcGxldGlvbi5cbiAgICovXG4gIHVwZFN1YnNjcmlwdGlvbih0b3BpY05hbWUsIHVpZCwgc3ViKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVhZHkoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgP1xuICAgICAgICBQcm9taXNlLnJlc29sdmUoKSA6XG4gICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIm5vdCBpbml0aWFsaXplZFwiKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cnggPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFsnc3Vic2NyaXB0aW9uJ10sICdyZWFkd3JpdGUnKTtcbiAgICAgIHRyeC5vbmNvbXBsZXRlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHJlc29sdmUoZXZlbnQudGFyZ2V0LnJlc3VsdCk7XG4gICAgICB9O1xuICAgICAgdHJ4Lm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy4jbG9nZ2VyKCdQQ2FjaGUnLCAndXBkU3Vic2NyaXB0aW9uJywgZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgICAgcmVqZWN0KGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICB9O1xuICAgICAgdHJ4Lm9iamVjdFN0b3JlKCdzdWJzY3JpcHRpb24nKS5nZXQoW3RvcGljTmFtZSwgdWlkXSkub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRyeC5vYmplY3RTdG9yZSgnc3Vic2NyaXB0aW9uJykucHV0KERCLiNzZXJpYWxpemVTdWJzY3JpcHRpb24oZXZlbnQudGFyZ2V0LnJlc3VsdCwgdG9waWNOYW1lLCB1aWQsIHN1YikpO1xuICAgICAgICB0cnguY29tbWl0KCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGUgYSBjYWxsYmFjayBmb3IgZWFjaCBjYWNoZWQgc3Vic2NyaXB0aW9uIGluIGEgZ2l2ZW4gdG9waWMuXG4gICAqIEBtZW1iZXJPZiBEQlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWNOYW1lIC0gbmFtZSBvZiB0aGUgdG9waWMgd2hpY2ggb3ducyB0aGUgc3Vic2NyaXB0aW9ucy5cbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHN1YnNjcmlwdGlvbi5cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSB0aGUgdmFsdWUgb3IgPGNvZGU+dGhpczwvY29kZT4gaW5zaWRlIHRoZSBjYWxsYmFjay5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZSByZXNvbHZlZC9yZWplY3RlZCBvbiBvcGVyYXRpb24gY29tcGxldGlvbi5cbiAgICovXG4gIG1hcFN1YnNjcmlwdGlvbnModG9waWNOYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgIGlmICghdGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc2FibGVkID9cbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKFtdKSA6XG4gICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIm5vdCBpbml0aWFsaXplZFwiKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cnggPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFsnc3Vic2NyaXB0aW9uJ10pO1xuICAgICAgdHJ4Lm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy4jbG9nZ2VyKCdQQ2FjaGUnLCAnbWFwU3Vic2NyaXB0aW9ucycsIGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICAgIHJlamVjdChldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIHRyeC5vYmplY3RTdG9yZSgnc3Vic2NyaXB0aW9uJykuZ2V0QWxsKElEQktleVJhbmdlLmJvdW5kKFt0b3BpY05hbWUsICctJ10sIFt0b3BpY05hbWUsICd+J10pKS5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgZXZlbnQudGFyZ2V0LnJlc3VsdC5mb3JFYWNoKCh0b3BpYykgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2suY2FsbChjb250ZXh0LCB0b3BpYyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzb2x2ZShldmVudC50YXJnZXQucmVzdWx0KTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvLyBNZXNzYWdlcy5cblxuICAvKipcbiAgICogU2F2ZSBtZXNzYWdlIHRvIHBlcnNpc3RlbnQgY2FjaGUuXG4gICAqIEBtZW1iZXJPZiBEQlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWNOYW1lIC0gbmFtZSBvZiB0aGUgdG9waWMgd2hpY2ggb3ducyB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG1zZyAtIG1lc3NhZ2UgdG8gc2F2ZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZSByZXNvbHZlZC9yZWplY3RlZCBvbiBvcGVyYXRpb24gY29tcGxldGlvbi5cbiAgICovXG4gIGFkZE1lc3NhZ2UobXNnKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVhZHkoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgP1xuICAgICAgICBQcm9taXNlLnJlc29sdmUoKSA6XG4gICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIm5vdCBpbml0aWFsaXplZFwiKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cnggPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFsnbWVzc2FnZSddLCAncmVhZHdyaXRlJyk7XG4gICAgICB0cngub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHJlc29sdmUoZXZlbnQudGFyZ2V0LnJlc3VsdCk7XG4gICAgICB9O1xuICAgICAgdHJ4Lm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy4jbG9nZ2VyKCdQQ2FjaGUnLCAnYWRkTWVzc2FnZScsIGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICAgIHJlamVjdChldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIHRyeC5vYmplY3RTdG9yZSgnbWVzc2FnZScpLmFkZChEQi4jc2VyaWFsaXplTWVzc2FnZShudWxsLCBtc2cpKTtcbiAgICAgIHRyeC5jb21taXQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgZGVsaXZlcnkgc3RhdHVzIG9mIGEgbWVzc2FnZSBzdG9yZWQgaW4gcGVyc2lzdGVudCBjYWNoZS5cbiAgICogQG1lbWJlck9mIERCXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b3BpY05hbWUgLSBuYW1lIG9mIHRoZSB0b3BpYyB3aGljaCBvd25zIHRoZSBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gc2VxIC0gSUQgb2YgdGhlIG1lc3NhZ2UgdG8gdXBkYXRlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdGF0dXMgLSBuZXcgZGVsaXZlcnkgc3RhdHVzIG9mIHRoZSBtZXNzYWdlLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSBwcm9taXNlIHJlc29sdmVkL3JlamVjdGVkIG9uIG9wZXJhdGlvbiBjb21wbGV0aW9uLlxuICAgKi9cbiAgdXBkTWVzc2FnZVN0YXR1cyh0b3BpY05hbWUsIHNlcSwgc3RhdHVzKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVhZHkoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgP1xuICAgICAgICBQcm9taXNlLnJlc29sdmUoKSA6XG4gICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIm5vdCBpbml0aWFsaXplZFwiKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cnggPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFsnbWVzc2FnZSddLCAncmVhZHdyaXRlJyk7XG4gICAgICB0cngub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHJlc29sdmUoZXZlbnQudGFyZ2V0LnJlc3VsdCk7XG4gICAgICB9O1xuICAgICAgdHJ4Lm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy4jbG9nZ2VyKCdQQ2FjaGUnLCAndXBkTWVzc2FnZVN0YXR1cycsIGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICAgIHJlamVjdChldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IHJlcSA9IHRyeC5vYmplY3RTdG9yZSgnbWVzc2FnZScpLmdldChJREJLZXlSYW5nZS5vbmx5KFt0b3BpY05hbWUsIHNlcV0pKTtcbiAgICAgIHJlcS5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3Qgc3JjID0gcmVxLnJlc3VsdCB8fCBldmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICBpZiAoIXNyYyB8fCBzcmMuX3N0YXR1cyA9PSBzdGF0dXMpIHtcbiAgICAgICAgICB0cnguY29tbWl0KCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeC5vYmplY3RTdG9yZSgnbWVzc2FnZScpLnB1dChEQi4jc2VyaWFsaXplTWVzc2FnZShzcmMsIHtcbiAgICAgICAgICB0b3BpYzogdG9waWNOYW1lLFxuICAgICAgICAgIHNlcTogc2VxLFxuICAgICAgICAgIF9zdGF0dXM6IHN0YXR1c1xuICAgICAgICB9KSk7XG4gICAgICAgIHRyeC5jb21taXQoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIG9uZSBvciBtb3JlIG1lc3NhZ2VzIGZyb20gcGVyc2lzdGVudCBjYWNoZS5cbiAgICogQG1lbWJlck9mIERCXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b3BpY05hbWUgLSBuYW1lIG9mIHRoZSB0b3BpYyB3aGljaCBvd25zIHRoZSBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gZnJvbSAtIGlkIG9mIHRoZSBtZXNzYWdlIHRvIHJlbW92ZSBvciBsb3dlciBib3VuZGFyeSB3aGVuIHJlbW92aW5nIHJhbmdlIChpbmNsdXNpdmUpLlxuICAgKiBAcGFyYW0ge251bWJlcj19IHRvIC0gdXBwZXIgYm91bmRhcnkgKGV4Y2x1c2l2ZSkgd2hlbiByZW1vdmluZyBhIHJhbmdlIG9mIG1lc3NhZ2VzLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSBwcm9taXNlIHJlc29sdmVkL3JlamVjdGVkIG9uIG9wZXJhdGlvbiBjb21wbGV0aW9uLlxuICAgKi9cbiAgcmVtTWVzc2FnZXModG9waWNOYW1lLCBmcm9tLCB0bykge1xuICAgIGlmICghdGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc2FibGVkID9cbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkgOlxuICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJub3QgaW5pdGlhbGl6ZWRcIikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKCFmcm9tICYmICF0bykge1xuICAgICAgICBmcm9tID0gMDtcbiAgICAgICAgdG8gPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJhbmdlID0gdG8gPiAwID8gSURCS2V5UmFuZ2UuYm91bmQoW3RvcGljTmFtZSwgZnJvbV0sIFt0b3BpY05hbWUsIHRvXSwgZmFsc2UsIHRydWUpIDpcbiAgICAgICAgSURCS2V5UmFuZ2Uub25seShbdG9waWNOYW1lLCBmcm9tXSk7XG4gICAgICBjb25zdCB0cnggPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFsnbWVzc2FnZSddLCAncmVhZHdyaXRlJyk7XG4gICAgICB0cngub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHJlc29sdmUoZXZlbnQudGFyZ2V0LnJlc3VsdCk7XG4gICAgICB9O1xuICAgICAgdHJ4Lm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy4jbG9nZ2VyKCdQQ2FjaGUnLCAncmVtTWVzc2FnZXMnLCBldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgICByZWplY3QoZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgIH07XG4gICAgICB0cngub2JqZWN0U3RvcmUoJ21lc3NhZ2UnKS5kZWxldGUocmFuZ2UpO1xuICAgICAgdHJ4LmNvbW1pdCgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIG1lc3NhZ2VzIGZyb20gcGVyc2lzdGVudCBzdG9yZS5cbiAgICogQG1lbWJlck9mIERCXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b3BpY05hbWUgLSBuYW1lIG9mIHRoZSB0b3BpYyB0byByZXRyaWV2ZSBtZXNzYWdlcyBmcm9tLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayB0byBjYWxsIGZvciBlYWNoIHJldHJpZXZlZCBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcXVlcnkgLSBwYXJhbWV0ZXJzIG9mIHRoZSBtZXNzYWdlIHJhbmdlIHRvIHJldHJpZXZlLlxuICAgKiBAcGFyYW0ge251bWJlcj19IHF1ZXJ5LnNpbmNlIC0gdGhlIGxlYXN0IG1lc3NhZ2UgSUQgdG8gcmV0cmlldmUgKGluY2x1c2l2ZSkuXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gcXVlcnkuYmVmb3JlIC0gdGhlIGdyZWF0ZXN0IG1lc3NhZ2UgSUQgdG8gcmV0cmlldmUgKGV4Y2x1c2l2ZSkuXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gcXVlcnkubGltaXQgLSB0aGUgbWF4aW11bSBudW1iZXIgb2YgbWVzc2FnZXMgdG8gcmV0cmlldmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHByb21pc2UgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gb3BlcmF0aW9uIGNvbXBsZXRpb24uXG4gICAqL1xuICByZWFkTWVzc2FnZXModG9waWNOYW1lLCBxdWVyeSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICBpZiAoIXRoaXMuaXNSZWFkeSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXNhYmxlZCA/XG4gICAgICAgIFByb21pc2UucmVzb2x2ZShbXSkgOlxuICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJub3QgaW5pdGlhbGl6ZWRcIikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcXVlcnkgPSBxdWVyeSB8fCB7fTtcbiAgICAgIGNvbnN0IHNpbmNlID0gcXVlcnkuc2luY2UgPiAwID8gcXVlcnkuc2luY2UgOiAwO1xuICAgICAgY29uc3QgYmVmb3JlID0gcXVlcnkuYmVmb3JlID4gMCA/IHF1ZXJ5LmJlZm9yZSA6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgICAgY29uc3QgbGltaXQgPSBxdWVyeS5saW1pdCB8IDA7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgICAgY29uc3QgcmFuZ2UgPSBJREJLZXlSYW5nZS5ib3VuZChbdG9waWNOYW1lLCBzaW5jZV0sIFt0b3BpY05hbWUsIGJlZm9yZV0sIGZhbHNlLCB0cnVlKTtcbiAgICAgIGNvbnN0IHRyeCA9IHRoaXMuZGIudHJhbnNhY3Rpb24oWydtZXNzYWdlJ10pO1xuICAgICAgdHJ4Lm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy4jbG9nZ2VyKCdQQ2FjaGUnLCAncmVhZE1lc3NhZ2VzJywgZXZlbnQudGFyZ2V0LmVycm9yKTtcbiAgICAgICAgcmVqZWN0KGV2ZW50LnRhcmdldC5lcnJvcik7XG4gICAgICB9O1xuICAgICAgLy8gSXRlcmF0ZSBpbiBkZXNjZW5kaW5nIG9yZGVyLlxuICAgICAgdHJ4Lm9iamVjdFN0b3JlKCdtZXNzYWdlJykub3BlbkN1cnNvcihyYW5nZSwgJ3ByZXYnKS5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgY3Vyc29yID0gZXZlbnQudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgaWYgKGN1cnNvcikge1xuICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2suY2FsbChjb250ZXh0LCBjdXJzb3IudmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXN1bHQucHVzaChjdXJzb3IudmFsdWUpO1xuICAgICAgICAgIGlmIChsaW1pdCA8PSAwIHx8IHJlc3VsdC5sZW5ndGggPCBsaW1pdCkge1xuICAgICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLy8gUHJpdmF0ZSBtZXRob2RzLlxuXG4gIC8vIFNlcmlhbGl6YWJsZSB0b3BpYyBmaWVsZHMuXG4gIHN0YXRpYyAjdG9waWNfZmllbGRzID0gWydjcmVhdGVkJywgJ3VwZGF0ZWQnLCAnZGVsZXRlZCcsICdyZWFkJywgJ3JlY3YnLCAnc2VxJywgJ2NsZWFyJywgJ2RlZmFjcycsXG4gICAgJ2NyZWRzJywgJ3B1YmxpYycsICd0cnVzdGVkJywgJ3ByaXZhdGUnLCAndG91Y2hlZCcsICdfZGVsZXRlZCdcbiAgXTtcblxuICAvLyBDb3B5IGRhdGEgZnJvbSBzcmMgdG8gVG9waWMgb2JqZWN0LlxuICBzdGF0aWMgI2Rlc2VyaWFsaXplVG9waWModG9waWMsIHNyYykge1xuICAgIERCLiN0b3BpY19maWVsZHMuZm9yRWFjaCgoZikgPT4ge1xuICAgICAgaWYgKHNyYy5oYXNPd25Qcm9wZXJ0eShmKSkge1xuICAgICAgICB0b3BpY1tmXSA9IHNyY1tmXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzcmMudGFncykpIHtcbiAgICAgIHRvcGljLl90YWdzID0gc3JjLnRhZ3M7XG4gICAgfVxuICAgIGlmIChzcmMuYWNzKSB7XG4gICAgICB0b3BpYy5zZXRBY2Nlc3NNb2RlKHNyYy5hY3MpO1xuICAgIH1cbiAgICB0b3BpYy5zZXEgfD0gMDtcbiAgICB0b3BpYy5yZWFkIHw9IDA7XG4gICAgdG9waWMudW5yZWFkID0gTWF0aC5tYXgoMCwgdG9waWMuc2VxIC0gdG9waWMucmVhZCk7XG4gIH1cblxuICAvLyBDb3B5IHZhbHVlcyBmcm9tICdzcmMnIHRvICdkc3QnLiBBbGxvY2F0ZSBkc3QgaWYgaXQncyBudWxsIG9yIHVuZGVmaW5lZC5cbiAgc3RhdGljICNzZXJpYWxpemVUb3BpYyhkc3QsIHNyYykge1xuICAgIGNvbnN0IHJlcyA9IGRzdCB8fCB7XG4gICAgICBuYW1lOiBzcmMubmFtZVxuICAgIH07XG4gICAgREIuI3RvcGljX2ZpZWxkcy5mb3JFYWNoKChmKSA9PiB7XG4gICAgICBpZiAoc3JjLmhhc093blByb3BlcnR5KGYpKSB7XG4gICAgICAgIHJlc1tmXSA9IHNyY1tmXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzcmMuX3RhZ3MpKSB7XG4gICAgICByZXMudGFncyA9IHNyYy5fdGFncztcbiAgICB9XG4gICAgaWYgKHNyYy5hY3MpIHtcbiAgICAgIHJlcy5hY3MgPSBzcmMuZ2V0QWNjZXNzTW9kZSgpLmpzb25IZWxwZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIHN0YXRpYyAjc2VyaWFsaXplU3Vic2NyaXB0aW9uKGRzdCwgdG9waWNOYW1lLCB1aWQsIHN1Yikge1xuICAgIGNvbnN0IGZpZWxkcyA9IFsndXBkYXRlZCcsICdtb2RlJywgJ3JlYWQnLCAncmVjdicsICdjbGVhcicsICdsYXN0U2VlbicsICd1c2VyQWdlbnQnXTtcbiAgICBjb25zdCByZXMgPSBkc3QgfHwge1xuICAgICAgdG9waWM6IHRvcGljTmFtZSxcbiAgICAgIHVpZDogdWlkXG4gICAgfTtcblxuICAgIGZpZWxkcy5mb3JFYWNoKChmKSA9PiB7XG4gICAgICBpZiAoc3ViLmhhc093blByb3BlcnR5KGYpKSB7XG4gICAgICAgIHJlc1tmXSA9IHN1YltmXTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBzdGF0aWMgI3NlcmlhbGl6ZU1lc3NhZ2UoZHN0LCBtc2cpIHtcbiAgICAvLyBTZXJpYWxpemFibGUgZmllbGRzLlxuICAgIGNvbnN0IGZpZWxkcyA9IFsndG9waWMnLCAnc2VxJywgJ3RzJywgJ19zdGF0dXMnLCAnZnJvbScsICdoZWFkJywgJ2NvbnRlbnQnXTtcbiAgICBjb25zdCByZXMgPSBkc3QgfHwge307XG4gICAgZmllbGRzLmZvckVhY2goKGYpID0+IHtcbiAgICAgIGlmIChtc2cuaGFzT3duUHJvcGVydHkoZikpIHtcbiAgICAgICAgcmVzW2ZdID0gbXNnW2ZdO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXM7XG4gIH1cblxuICAvKipcbiAgICogVG8gdXNlIERCIGluIGEgbm9uIGJyb3dzZXIgY29udGV4dCwgc3VwcGx5IGluZGV4ZWREQiBwcm92aWRlci5cbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyb2YgREJcbiAgICogQHBhcmFtIGlkYlByb3ZpZGVyIGluZGV4ZWREQiBwcm92aWRlciwgZS5nLiBmb3Igbm9kZSA8Y29kZT5yZXF1aXJlKCdmYWtlLWluZGV4ZWRkYicpPC9jb2RlPi5cbiAgICovXG4gIHN0YXRpYyBzZXREYXRhYmFzZVByb3ZpZGVyKGlkYlByb3ZpZGVyKSB7XG4gICAgSURCUHJvdmlkZXIgPSBpZGJQcm92aWRlcjtcbiAgfVxufVxuIiwiLyoqXG4gKiBAY29weXJpZ2h0IDIwMTUtMjAyMiBUaW5vZGUgTExDLlxuICogQHN1bW1hcnkgTWluaW1hbGx5IHJpY2ggdGV4dCByZXByZXNlbnRhdGlvbiBhbmQgZm9ybWF0dGluZyBmb3IgVGlub2RlLlxuICogQGxpY2Vuc2UgQXBhY2hlIDIuMFxuICpcbiAqIEBmaWxlIEJhc2ljIHBhcnNlciBhbmQgZm9ybWF0dGVyIGZvciB2ZXJ5IHNpbXBsZSB0ZXh0IG1hcmt1cC4gTW9zdGx5IHRhcmdldGVkIGF0XG4gKiBtb2JpbGUgdXNlIGNhc2VzIHNpbWlsYXIgdG8gVGVsZWdyYW0sIFdoYXRzQXBwLCBhbmQgRkIgTWVzc2VuZ2VyLlxuICpcbiAqIDxwPlN1cHBvcnRzIGNvbnZlcnNpb24gb2YgdXNlciBrZXlib2FyZCBpbnB1dCB0byBmb3JtYXR0ZWQgdGV4dDo8L3A+XG4gKiA8dWw+XG4gKiAgIDxsaT4qYWJjKiAmcmFycjsgPGI+YWJjPC9iPjwvbGk+XG4gKiAgIDxsaT5fYWJjXyAmcmFycjsgPGk+YWJjPC9pPjwvbGk+XG4gKiAgIDxsaT5+YWJjfiAmcmFycjsgPGRlbD5hYmM8L2RlbD48L2xpPlxuICogICA8bGk+YGFiY2AgJnJhcnI7IDx0dD5hYmM8L3R0PjwvbGk+XG4gKiA8L3VsPlxuICogQWxzbyBzdXBwb3J0cyBmb3JtcyBhbmQgYnV0dG9ucy5cbiAqXG4gKiBOZXN0ZWQgZm9ybWF0dGluZyBpcyBzdXBwb3J0ZWQsIGUuZy4gKmFiYyBfZGVmXyogLT4gPGI+YWJjIDxpPmRlZjwvaT48L2I+XG4gKiBVUkxzLCBAbWVudGlvbnMsIGFuZCAjaGFzaHRhZ3MgYXJlIGV4dHJhY3RlZCBhbmQgY29udmVydGVkIGludG8gbGlua3MuXG4gKiBGb3JtcyBhbmQgYnV0dG9ucyBjYW4gYmUgYWRkZWQgcHJvY2VkdXJhbGx5LlxuICogSlNPTiBkYXRhIHJlcHJlc2VudGF0aW9uIGlzIGluc3BpcmVkIGJ5IERyYWZ0LmpzIHJhdyBmb3JtYXR0aW5nLlxuICpcbiAqXG4gKiBAZXhhbXBsZVxuICogVGV4dDpcbiAqIDxwcmU+XG4gKiAgICAgdGhpcyBpcyAqYm9sZCosIGBjb2RlYCBhbmQgX2l0YWxpY18sIH5zdHJpa2V+XG4gKiAgICAgY29tYmluZWQgKmJvbGQgYW5kIF9pdGFsaWNfKlxuICogICAgIGFuIHVybDogaHR0cHM6Ly93d3cuZXhhbXBsZS5jb20vYWJjI2ZyYWdtZW50IGFuZCBhbm90aGVyIF93d3cudGlub2RlLmNvX1xuICogICAgIHRoaXMgaXMgYSBAbWVudGlvbiBhbmQgYSAjaGFzaHRhZyBpbiBhIHN0cmluZ1xuICogICAgIHNlY29uZCAjaGFzaHRhZ1xuICogPC9wcmU+XG4gKlxuICogIFNhbXBsZSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0ZXh0IGFib3ZlOlxuICogIHtcbiAqICAgICBcInR4dFwiOiBcInRoaXMgaXMgYm9sZCwgY29kZSBhbmQgaXRhbGljLCBzdHJpa2UgY29tYmluZWQgYm9sZCBhbmQgaXRhbGljIGFuIHVybDogaHR0cHM6Ly93d3cuZXhhbXBsZS5jb20vYWJjI2ZyYWdtZW50IFwiICtcbiAqICAgICAgICAgICAgIFwiYW5kIGFub3RoZXIgd3d3LnRpbm9kZS5jbyB0aGlzIGlzIGEgQG1lbnRpb24gYW5kIGEgI2hhc2h0YWcgaW4gYSBzdHJpbmcgc2Vjb25kICNoYXNodGFnXCIsXG4gKiAgICAgXCJmbXRcIjogW1xuICogICAgICAgICB7IFwiYXRcIjo4LCBcImxlblwiOjQsXCJ0cFwiOlwiU1RcIiB9LHsgXCJhdFwiOjE0LCBcImxlblwiOjQsIFwidHBcIjpcIkNPXCIgfSx7IFwiYXRcIjoyMywgXCJsZW5cIjo2LCBcInRwXCI6XCJFTVwifSxcbiAqICAgICAgICAgeyBcImF0XCI6MzEsIFwibGVuXCI6NiwgXCJ0cFwiOlwiRExcIiB9LHsgXCJ0cFwiOlwiQlJcIiwgXCJsZW5cIjoxLCBcImF0XCI6MzcgfSx7IFwiYXRcIjo1NiwgXCJsZW5cIjo2LCBcInRwXCI6XCJFTVwiIH0sXG4gKiAgICAgICAgIHsgXCJhdFwiOjQ3LCBcImxlblwiOjE1LCBcInRwXCI6XCJTVFwiIH0seyBcInRwXCI6XCJCUlwiLCBcImxlblwiOjEsIFwiYXRcIjo2MiB9LHsgXCJhdFwiOjEyMCwgXCJsZW5cIjoxMywgXCJ0cFwiOlwiRU1cIiB9LFxuICogICAgICAgICB7IFwiYXRcIjo3MSwgXCJsZW5cIjozNiwgXCJrZXlcIjowIH0seyBcImF0XCI6MTIwLCBcImxlblwiOjEzLCBcImtleVwiOjEgfSx7IFwidHBcIjpcIkJSXCIsIFwibGVuXCI6MSwgXCJhdFwiOjEzMyB9LFxuICogICAgICAgICB7IFwiYXRcIjoxNDQsIFwibGVuXCI6OCwgXCJrZXlcIjoyIH0seyBcImF0XCI6MTU5LCBcImxlblwiOjgsIFwia2V5XCI6MyB9LHsgXCJ0cFwiOlwiQlJcIiwgXCJsZW5cIjoxLCBcImF0XCI6MTc5IH0sXG4gKiAgICAgICAgIHsgXCJhdFwiOjE4NywgXCJsZW5cIjo4LCBcImtleVwiOjMgfSx7IFwidHBcIjpcIkJSXCIsIFwibGVuXCI6MSwgXCJhdFwiOjE5NSB9XG4gKiAgICAgXSxcbiAqICAgICBcImVudFwiOiBbXG4gKiAgICAgICAgIHsgXCJ0cFwiOlwiTE5cIiwgXCJkYXRhXCI6eyBcInVybFwiOlwiaHR0cHM6Ly93d3cuZXhhbXBsZS5jb20vYWJjI2ZyYWdtZW50XCIgfSB9LFxuICogICAgICAgICB7IFwidHBcIjpcIkxOXCIsIFwiZGF0YVwiOnsgXCJ1cmxcIjpcImh0dHA6Ly93d3cudGlub2RlLmNvXCIgfSB9LFxuICogICAgICAgICB7IFwidHBcIjpcIk1OXCIsIFwiZGF0YVwiOnsgXCJ2YWxcIjpcIm1lbnRpb25cIiB9IH0sXG4gKiAgICAgICAgIHsgXCJ0cFwiOlwiSFRcIiwgXCJkYXRhXCI6eyBcInZhbFwiOlwiaGFzaHRhZ1wiIH0gfVxuICogICAgIF1cbiAqICB9XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBOT1RFIFRPIERFVkVMT1BFUlM6XG4vLyBMb2NhbGl6YWJsZSBzdHJpbmdzIHNob3VsZCBiZSBkb3VibGUgcXVvdGVkIFwi0YHRgtGA0L7QutCwINC90LAg0LTRgNGD0LPQvtC8INGP0LfRi9C60LVcIixcbi8vIG5vbi1sb2NhbGl6YWJsZSBzdHJpbmdzIHNob3VsZCBiZSBzaW5nbGUgcXVvdGVkICdub24tbG9jYWxpemVkJy5cblxuY29uc3QgTUFYX0ZPUk1fRUxFTUVOVFMgPSA4O1xuY29uc3QgTUFYX1BSRVZJRVdfQVRUQUNITUVOVFMgPSAzO1xuY29uc3QgTUFYX1BSRVZJRVdfREFUQV9TSVpFID0gNjQ7XG5jb25zdCBKU09OX01JTUVfVFlQRSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbmNvbnN0IERSQUZUWV9NSU1FX1RZUEUgPSAndGV4dC94LWRyYWZ0eSc7XG5jb25zdCBBTExPV0VEX0VOVF9GSUVMRFMgPSBbJ2FjdCcsICdoZWlnaHQnLCAnZHVyYXRpb24nLCAnbWltZScsICduYW1lJywgJ3ByZXZpZXcnLCAncmVmJywgJ3NpemUnLCAndXJsJywgJ3ZhbCcsICd3aWR0aCddO1xuXG4vLyBSZWd1bGFyIGV4cHJlc3Npb25zIGZvciBwYXJzaW5nIGlubGluZSBmb3JtYXRzLiBKYXZhc2NyaXB0IGRvZXMgbm90IHN1cHBvcnQgbG9va2JlaGluZCxcbi8vIHNvIGl0J3MgYSBiaXQgbWVzc3kuXG5jb25zdCBJTkxJTkVfU1RZTEVTID0gW1xuICAvLyBTdHJvbmcgPSBib2xkLCAqYm9sZCB0ZXh0KlxuICB7XG4gICAgbmFtZTogJ1NUJyxcbiAgICBzdGFydDogLyg/Ol58W1xcV19dKShcXCopW15cXHMqXS8sXG4gICAgZW5kOiAvW15cXHMqXShcXCopKD89JHxbXFxXX10pL1xuICB9LFxuICAvLyBFbXBoZXNpemVkID0gaXRhbGljLCBfaXRhbGljIHRleHRfXG4gIHtcbiAgICBuYW1lOiAnRU0nLFxuICAgIHN0YXJ0OiAvKD86XnxcXFcpKF8pW15cXHNfXS8sXG4gICAgZW5kOiAvW15cXHNfXShfKSg/PSR8XFxXKS9cbiAgfSxcbiAgLy8gRGVsZXRlZCwgfnN0cmlrZSB0aGlzIHRob3VnaH5cbiAge1xuICAgIG5hbWU6ICdETCcsXG4gICAgc3RhcnQ6IC8oPzpefFtcXFdfXSkofilbXlxcc35dLyxcbiAgICBlbmQ6IC9bXlxcc35dKH4pKD89JHxbXFxXX10pL1xuICB9LFxuICAvLyBDb2RlIGJsb2NrIGB0aGlzIGlzIG1vbm9zcGFjZWBcbiAge1xuICAgIG5hbWU6ICdDTycsXG4gICAgc3RhcnQ6IC8oPzpefFxcVykoYClbXmBdLyxcbiAgICBlbmQ6IC9bXmBdKGApKD89JHxcXFcpL1xuICB9XG5dO1xuXG4vLyBSZWxhdGl2ZSB3ZWlnaHRzIG9mIGZvcm1hdHRpbmcgc3BhbnMuIEdyZWF0ZXIgaW5kZXggaW4gYXJyYXkgbWVhbnMgZ3JlYXRlciB3ZWlnaHQuXG5jb25zdCBGTVRfV0VJR0hUID0gWydRUSddO1xuXG4vLyBSZWdFeHBzIGZvciBlbnRpdHkgZXh0cmFjdGlvbiAoUkYgPSByZWZlcmVuY2UpXG5jb25zdCBFTlRJVFlfVFlQRVMgPSBbXG4gIC8vIFVSTHNcbiAge1xuICAgIG5hbWU6ICdMTicsXG4gICAgZGF0YU5hbWU6ICd1cmwnLFxuICAgIHBhY2s6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgLy8gQ2hlY2sgaWYgdGhlIHByb3RvY29sIGlzIHNwZWNpZmllZCwgaWYgbm90IHVzZSBodHRwXG4gICAgICBpZiAoIS9eW2Etel0rOlxcL1xcLy9pLnRlc3QodmFsKSkge1xuICAgICAgICB2YWwgPSAnaHR0cDovLycgKyB2YWw7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICB1cmw6IHZhbFxuICAgICAgfTtcbiAgICB9LFxuICAgIHJlOiAvKD86KD86aHR0cHM/fGZ0cCk6XFwvXFwvfHd3d1xcLnxmdHBcXC4pWy1BLVowLTkrJkAjXFwvJT1+X3wkPyE6LC5dKltBLVowLTkrJkAjXFwvJT1+X3wkXS9pZ1xuICB9LFxuICAvLyBNZW50aW9ucyBAdXNlciAobXVzdCBiZSAyIG9yIG1vcmUgY2hhcmFjdGVycylcbiAge1xuICAgIG5hbWU6ICdNTicsXG4gICAgZGF0YU5hbWU6ICd2YWwnLFxuICAgIHBhY2s6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsOiB2YWwuc2xpY2UoMSlcbiAgICAgIH07XG4gICAgfSxcbiAgICByZTogL1xcQkAoW1xccHtMfVxccHtOfV1bLl9cXHB7TH1cXHB7Tn1dKltcXHB7TH1cXHB7Tn1dKS91Z1xuICB9LFxuICAvLyBIYXNodGFncyAjaGFzaHRhZywgbGlrZSBtZXRpb24gMiBvciBtb3JlIGNoYXJhY3RlcnMuXG4gIHtcbiAgICBuYW1lOiAnSFQnLFxuICAgIGRhdGFOYW1lOiAndmFsJyxcbiAgICBwYWNrOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbDogdmFsLnNsaWNlKDEpXG4gICAgICB9O1xuICAgIH0sXG4gICAgcmU6IC9cXEIjKFtcXHB7TH1cXHB7Tn1dWy5fXFxwe0x9XFxwe059XSpbXFxwe0x9XFxwe059XSkvdWdcbiAgfVxuXTtcblxuLy8gSFRNTCB0YWcgbmFtZSBzdWdnZXN0aW9uc1xuY29uc3QgSFRNTF9UQUdTID0ge1xuICBBVToge1xuICAgIG5hbWU6ICdhdWRpbycsXG4gICAgaXNWb2lkOiBmYWxzZVxuICB9LFxuICBCTjoge1xuICAgIG5hbWU6ICdidXR0b24nLFxuICAgIGlzVm9pZDogZmFsc2VcbiAgfSxcbiAgQlI6IHtcbiAgICBuYW1lOiAnYnInLFxuICAgIGlzVm9pZDogdHJ1ZVxuICB9LFxuICBDTzoge1xuICAgIG5hbWU6ICd0dCcsXG4gICAgaXNWb2lkOiBmYWxzZVxuICB9LFxuICBETDoge1xuICAgIG5hbWU6ICdkZWwnLFxuICAgIGlzVm9pZDogZmFsc2VcbiAgfSxcbiAgRU06IHtcbiAgICBuYW1lOiAnaScsXG4gICAgaXNWb2lkOiBmYWxzZVxuICB9LFxuICBFWDoge1xuICAgIG5hbWU6ICcnLFxuICAgIGlzVm9pZDogdHJ1ZVxuICB9LFxuICBGTToge1xuICAgIG5hbWU6ICdkaXYnLFxuICAgIGlzVm9pZDogZmFsc2VcbiAgfSxcbiAgSEQ6IHtcbiAgICBuYW1lOiAnJyxcbiAgICBpc1ZvaWQ6IGZhbHNlXG4gIH0sXG4gIEhMOiB7XG4gICAgbmFtZTogJ3NwYW4nLFxuICAgIGlzVm9pZDogZmFsc2VcbiAgfSxcbiAgSFQ6IHtcbiAgICBuYW1lOiAnYScsXG4gICAgaXNWb2lkOiBmYWxzZVxuICB9LFxuICBJTToge1xuICAgIG5hbWU6ICdpbWcnLFxuICAgIGlzVm9pZDogZmFsc2VcbiAgfSxcbiAgTE46IHtcbiAgICBuYW1lOiAnYScsXG4gICAgaXNWb2lkOiBmYWxzZVxuICB9LFxuICBNTjoge1xuICAgIG5hbWU6ICdhJyxcbiAgICBpc1ZvaWQ6IGZhbHNlXG4gIH0sXG4gIFJXOiB7XG4gICAgbmFtZTogJ2RpdicsXG4gICAgaXNWb2lkOiBmYWxzZSxcbiAgfSxcbiAgUVE6IHtcbiAgICBuYW1lOiAnZGl2JyxcbiAgICBpc1ZvaWQ6IGZhbHNlXG4gIH0sXG4gIFNUOiB7XG4gICAgbmFtZTogJ2InLFxuICAgIGlzVm9pZDogZmFsc2VcbiAgfSxcbn07XG5cbi8vIENvbnZlcnQgYmFzZTY0LWVuY29kZWQgc3RyaW5nIGludG8gQmxvYi5cbmZ1bmN0aW9uIGJhc2U2NHRvT2JqZWN0VXJsKGI2NCwgY29udGVudFR5cGUsIGxvZ2dlcikge1xuICBpZiAoIWI2NCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBiaW4gPSBhdG9iKGI2NCk7XG4gICAgY29uc3QgbGVuZ3RoID0gYmluLmxlbmd0aDtcbiAgICBjb25zdCBidWYgPSBuZXcgQXJyYXlCdWZmZXIobGVuZ3RoKTtcbiAgICBjb25zdCBhcnIgPSBuZXcgVWludDhBcnJheShidWYpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGFycltpXSA9IGJpbi5jaGFyQ29kZUF0KGkpO1xuICAgIH1cblxuICAgIHJldHVybiBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFtidWZdLCB7XG4gICAgICB0eXBlOiBjb250ZW50VHlwZVxuICAgIH0pKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKGxvZ2dlcikge1xuICAgICAgbG9nZ2VyKFwiRHJhZnR5OiBmYWlsZWQgdG8gY29udmVydCBvYmplY3QuXCIsIGVyci5tZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gYmFzZTY0dG9EYXRhVXJsKGI2NCwgY29udGVudFR5cGUpIHtcbiAgaWYgKCFiNjQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb250ZW50VHlwZSA9IGNvbnRlbnRUeXBlIHx8ICdpbWFnZS9qcGVnJztcbiAgcmV0dXJuICdkYXRhOicgKyBjb250ZW50VHlwZSArICc7YmFzZTY0LCcgKyBiNjQ7XG59XG5cbi8vIEhlbHBlcnMgZm9yIGNvbnZlcnRpbmcgRHJhZnR5IHRvIEhUTUwuXG5jb25zdCBERUNPUkFUT1JTID0ge1xuICAvLyBWaXNpYWwgc3R5bGVzXG4gIFNUOiB7XG4gICAgb3BlbjogXyA9PiAnPGI+JyxcbiAgICBjbG9zZTogXyA9PiAnPC9iPidcbiAgfSxcbiAgRU06IHtcbiAgICBvcGVuOiBfID0+ICc8aT4nLFxuICAgIGNsb3NlOiBfID0+ICc8L2k+J1xuICB9LFxuICBETDoge1xuICAgIG9wZW46IF8gPT4gJzxkZWw+JyxcbiAgICBjbG9zZTogXyA9PiAnPC9kZWw+J1xuICB9LFxuICBDTzoge1xuICAgIG9wZW46IF8gPT4gJzx0dD4nLFxuICAgIGNsb3NlOiBfID0+ICc8L3R0PidcbiAgfSxcbiAgLy8gTGluZSBicmVha1xuICBCUjoge1xuICAgIG9wZW46IF8gPT4gJzxici8+JyxcbiAgICBjbG9zZTogXyA9PiAnJ1xuICB9LFxuICAvLyBIaWRkZW4gZWxlbWVudFxuICBIRDoge1xuICAgIG9wZW46IF8gPT4gJycsXG4gICAgY2xvc2U6IF8gPT4gJydcbiAgfSxcbiAgLy8gSGlnaGxpZ2h0ZWQgZWxlbWVudC5cbiAgSEw6IHtcbiAgICBvcGVuOiBfID0+ICc8c3BhbiBzdHlsZT1cImNvbG9yOnRlYWxcIj4nLFxuICAgIGNsb3NlOiBfID0+ICc8L3NwYW4+J1xuICB9LFxuICAvLyBMaW5rIChVUkwpXG4gIExOOiB7XG4gICAgb3BlbjogKGRhdGEpID0+IHtcbiAgICAgIHJldHVybiAnPGEgaHJlZj1cIicgKyBkYXRhLnVybCArICdcIj4nO1xuICAgIH0sXG4gICAgY2xvc2U6IF8gPT4gJzwvYT4nLFxuICAgIHByb3BzOiAoZGF0YSkgPT4ge1xuICAgICAgcmV0dXJuIGRhdGEgPyB7XG4gICAgICAgIGhyZWY6IGRhdGEudXJsLFxuICAgICAgICB0YXJnZXQ6ICdfYmxhbmsnXG4gICAgICB9IDogbnVsbDtcbiAgICB9LFxuICB9LFxuICAvLyBNZW50aW9uXG4gIE1OOiB7XG4gICAgb3BlbjogKGRhdGEpID0+IHtcbiAgICAgIHJldHVybiAnPGEgaHJlZj1cIiMnICsgZGF0YS52YWwgKyAnXCI+JztcbiAgICB9LFxuICAgIGNsb3NlOiBfID0+ICc8L2E+JyxcbiAgICBwcm9wczogKGRhdGEpID0+IHtcbiAgICAgIHJldHVybiBkYXRhID8ge1xuICAgICAgICBpZDogZGF0YS52YWxcbiAgICAgIH0gOiBudWxsO1xuICAgIH0sXG4gIH0sXG4gIC8vIEhhc2h0YWdcbiAgSFQ6IHtcbiAgICBvcGVuOiAoZGF0YSkgPT4ge1xuICAgICAgcmV0dXJuICc8YSBocmVmPVwiIycgKyBkYXRhLnZhbCArICdcIj4nO1xuICAgIH0sXG4gICAgY2xvc2U6IF8gPT4gJzwvYT4nLFxuICAgIHByb3BzOiAoZGF0YSkgPT4ge1xuICAgICAgcmV0dXJuIGRhdGEgPyB7XG4gICAgICAgIGlkOiBkYXRhLnZhbFxuICAgICAgfSA6IG51bGw7XG4gICAgfSxcbiAgfSxcbiAgLy8gQnV0dG9uXG4gIEJOOiB7XG4gICAgb3BlbjogXyA9PiAnPGJ1dHRvbj4nLFxuICAgIGNsb3NlOiBfID0+ICc8L2J1dHRvbj4nLFxuICAgIHByb3BzOiAoZGF0YSkgPT4ge1xuICAgICAgcmV0dXJuIGRhdGEgPyB7XG4gICAgICAgICdkYXRhLWFjdCc6IGRhdGEuYWN0LFxuICAgICAgICAnZGF0YS12YWwnOiBkYXRhLnZhbCxcbiAgICAgICAgJ2RhdGEtbmFtZSc6IGRhdGEubmFtZSxcbiAgICAgICAgJ2RhdGEtcmVmJzogZGF0YS5yZWZcbiAgICAgIH0gOiBudWxsO1xuICAgIH0sXG4gIH0sXG4gIC8vIEF1ZGlvIHJlY29yZGluZ1xuICBBVToge1xuICAgIG9wZW46IChkYXRhKSA9PiB7XG4gICAgICBjb25zdCB1cmwgPSBkYXRhLnJlZiB8fCBiYXNlNjR0b09iamVjdFVybChkYXRhLnZhbCwgZGF0YS5taW1lLCBEcmFmdHkubG9nZ2VyKTtcbiAgICAgIHJldHVybiAnPGF1ZGlvIGNvbnRyb2xzIHNyYz1cIicgKyB1cmwgKyAnXCI+JztcbiAgICB9LFxuICAgIGNsb3NlOiBfID0+ICc8L2F1ZGlvPicsXG4gICAgcHJvcHM6IChkYXRhKSA9PiB7XG4gICAgICBpZiAoIWRhdGEpIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLy8gRW1iZWRkZWQgZGF0YSBvciBleHRlcm5hbCBsaW5rLlxuICAgICAgICBzcmM6IGRhdGEucmVmIHx8IGJhc2U2NHRvT2JqZWN0VXJsKGRhdGEudmFsLCBkYXRhLm1pbWUsIERyYWZ0eS5sb2dnZXIpLFxuICAgICAgICAnZGF0YS1wcmVsb2FkJzogZGF0YS5yZWYgPyAnbWV0YWRhdGEnIDogJ2F1dG8nLFxuICAgICAgICAnZGF0YS1kdXJhdGlvbic6IGRhdGEuZHVyYXRpb24sXG4gICAgICAgICdkYXRhLW5hbWUnOiBkYXRhLm5hbWUsXG4gICAgICAgICdkYXRhLXNpemUnOiBkYXRhLnZhbCA/ICgoZGF0YS52YWwubGVuZ3RoICogMC43NSkgfCAwKSA6IChkYXRhLnNpemUgfCAwKSxcbiAgICAgICAgJ2RhdGEtbWltZSc6IGRhdGEubWltZSxcbiAgICAgIH07XG4gICAgfVxuICB9LFxuICAvLyBJbWFnZVxuICBJTToge1xuICAgIG9wZW46IChkYXRhKSA9PiB7XG4gICAgICAvLyBEb24ndCB1c2UgZGF0YS5yZWYgZm9yIHByZXZpZXc6IGl0J3MgYSBzZWN1cml0eSByaXNrLlxuICAgICAgY29uc3QgdG1wUHJldmlld1VybCA9IGJhc2U2NHRvRGF0YVVybChkYXRhLl90ZW1wUHJldmlldywgZGF0YS5taW1lKTtcbiAgICAgIGNvbnN0IHByZXZpZXdVcmwgPSBiYXNlNjR0b09iamVjdFVybChkYXRhLnZhbCwgZGF0YS5taW1lLCBEcmFmdHkubG9nZ2VyKTtcbiAgICAgIGNvbnN0IGRvd25sb2FkVXJsID0gZGF0YS5yZWYgfHwgcHJldmlld1VybDtcbiAgICAgIHJldHVybiAoZGF0YS5uYW1lID8gJzxhIGhyZWY9XCInICsgZG93bmxvYWRVcmwgKyAnXCIgZG93bmxvYWQ9XCInICsgZGF0YS5uYW1lICsgJ1wiPicgOiAnJykgK1xuICAgICAgICAnPGltZyBzcmM9XCInICsgKHRtcFByZXZpZXdVcmwgfHwgcHJldmlld1VybCkgKyAnXCInICtcbiAgICAgICAgKGRhdGEud2lkdGggPyAnIHdpZHRoPVwiJyArIGRhdGEud2lkdGggKyAnXCInIDogJycpICtcbiAgICAgICAgKGRhdGEuaGVpZ2h0ID8gJyBoZWlnaHQ9XCInICsgZGF0YS5oZWlnaHQgKyAnXCInIDogJycpICsgJyBib3JkZXI9XCIwXCIgLz4nO1xuICAgIH0sXG4gICAgY2xvc2U6IChkYXRhKSA9PiB7XG4gICAgICByZXR1cm4gKGRhdGEubmFtZSA/ICc8L2E+JyA6ICcnKTtcbiAgICB9LFxuICAgIHByb3BzOiAoZGF0YSkgPT4ge1xuICAgICAgaWYgKCFkYXRhKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC8vIFRlbXBvcmFyeSBwcmV2aWV3LCBvciBwZXJtYW5lbnQgcHJldmlldywgb3IgZXh0ZXJuYWwgbGluay5cbiAgICAgICAgc3JjOiBiYXNlNjR0b0RhdGFVcmwoZGF0YS5fdGVtcFByZXZpZXcsIGRhdGEubWltZSkgfHxcbiAgICAgICAgICBkYXRhLnJlZiB8fCBiYXNlNjR0b09iamVjdFVybChkYXRhLnZhbCwgZGF0YS5taW1lLCBEcmFmdHkubG9nZ2VyKSxcbiAgICAgICAgdGl0bGU6IGRhdGEubmFtZSxcbiAgICAgICAgYWx0OiBkYXRhLm5hbWUsXG4gICAgICAgICdkYXRhLXdpZHRoJzogZGF0YS53aWR0aCxcbiAgICAgICAgJ2RhdGEtaGVpZ2h0JzogZGF0YS5oZWlnaHQsXG4gICAgICAgICdkYXRhLW5hbWUnOiBkYXRhLm5hbWUsXG4gICAgICAgICdkYXRhLXNpemUnOiBkYXRhLnZhbCA/ICgoZGF0YS52YWwubGVuZ3RoICogMC43NSkgfCAwKSA6IChkYXRhLnNpemUgfCAwKSxcbiAgICAgICAgJ2RhdGEtbWltZSc6IGRhdGEubWltZSxcbiAgICAgIH07XG4gICAgfSxcbiAgfSxcbiAgLy8gRm9ybSAtIHN0cnVjdHVyZWQgbGF5b3V0IG9mIGVsZW1lbnRzLlxuICBGTToge1xuICAgIG9wZW46IF8gPT4gJzxkaXY+JyxcbiAgICBjbG9zZTogXyA9PiAnPC9kaXY+J1xuICB9LFxuICAvLyBSb3c6IGxvZ2ljIGdyb3VwaW5nIG9mIGVsZW1lbnRzXG4gIFJXOiB7XG4gICAgb3BlbjogXyA9PiAnPGRpdj4nLFxuICAgIGNsb3NlOiBfID0+ICc8L2Rpdj4nXG4gIH0sXG4gIC8vIFF1b3RlZCBibG9jay5cbiAgUVE6IHtcbiAgICBvcGVuOiBfID0+ICc8ZGl2PicsXG4gICAgY2xvc2U6IF8gPT4gJzwvZGl2PicsXG4gICAgcHJvcHM6IChkYXRhKSA9PiB7XG4gICAgICByZXR1cm4gZGF0YSA/IHt9IDogbnVsbDtcbiAgICB9LFxuICB9XG59O1xuXG4vKipcbiAqIFRoZSBtYWluIG9iamVjdCB3aGljaCBwZXJmb3JtcyBhbGwgdGhlIGZvcm1hdHRpbmcgYWN0aW9ucy5cbiAqIEBjbGFzcyBEcmFmdHlcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5jb25zdCBEcmFmdHkgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy50eHQgPSAnJztcbiAgdGhpcy5mbXQgPSBbXTtcbiAgdGhpcy5lbnQgPSBbXTtcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplIERyYWZ0eSBkb2N1bWVudCB0byBhIHBsYWluIHRleHQgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwbGFpblRleHQgLSBzdHJpbmcgdG8gdXNlIGFzIERyYWZ0eSBjb250ZW50LlxuICpcbiAqIEByZXR1cm5zIG5ldyBEcmFmdHkgZG9jdW1lbnQgb3IgbnVsbCBpcyBwbGFpblRleHQgaXMgbm90IGEgc3RyaW5nIG9yIHVuZGVmaW5lZC5cbiAqL1xuRHJhZnR5LmluaXQgPSBmdW5jdGlvbihwbGFpblRleHQpIHtcbiAgaWYgKHR5cGVvZiBwbGFpblRleHQgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBwbGFpblRleHQgPSAnJztcbiAgfSBlbHNlIGlmICh0eXBlb2YgcGxhaW5UZXh0ICE9ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHR4dDogcGxhaW5UZXh0XG4gIH07XG59XG5cbi8qKlxuICogUGFyc2UgcGxhaW4gdGV4dCBpbnRvIERyYWZ0eSBkb2N1bWVudC5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gY29udGVudCAtIHBsYWluLXRleHQgY29udGVudCB0byBwYXJzZS5cbiAqIEByZXR1cm4ge0RyYWZ0eX0gcGFyc2VkIGRvY3VtZW50IG9yIG51bGwgaWYgdGhlIHNvdXJjZSBpcyBub3QgcGxhaW4gdGV4dC5cbiAqL1xuRHJhZnR5LnBhcnNlID0gZnVuY3Rpb24oY29udGVudCkge1xuICAvLyBNYWtlIHN1cmUgd2UgYXJlIHBhcnNpbmcgc3RyaW5ncyBvbmx5LlxuICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFNwbGl0IHRleHQgaW50byBsaW5lcy4gSXQgbWFrZXMgZnVydGhlciBwcm9jZXNzaW5nIGVhc2llci5cbiAgY29uc3QgbGluZXMgPSBjb250ZW50LnNwbGl0KC9cXHI/XFxuLyk7XG5cbiAgLy8gSG9sZHMgZW50aXRpZXMgcmVmZXJlbmNlZCBmcm9tIHRleHRcbiAgY29uc3QgZW50aXR5TWFwID0gW107XG4gIGNvbnN0IGVudGl0eUluZGV4ID0ge307XG5cbiAgLy8gUHJvY2Vzc2luZyBsaW5lcyBvbmUgYnkgb25lLCBob2xkIGludGVybWVkaWF0ZSByZXN1bHQgaW4gYmx4LlxuICBjb25zdCBibHggPSBbXTtcbiAgbGluZXMuZm9yRWFjaCgobGluZSkgPT4ge1xuICAgIGxldCBzcGFucyA9IFtdO1xuICAgIGxldCBlbnRpdGllcztcblxuICAgIC8vIEZpbmQgZm9ybWF0dGVkIHNwYW5zIGluIHRoZSBzdHJpbmcuXG4gICAgLy8gVHJ5IHRvIG1hdGNoIGVhY2ggc3R5bGUuXG4gICAgSU5MSU5FX1NUWUxFUy5mb3JFYWNoKCh0YWcpID0+IHtcbiAgICAgIC8vIEVhY2ggc3R5bGUgY291bGQgYmUgbWF0Y2hlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgIHNwYW5zID0gc3BhbnMuY29uY2F0KHNwYW5uaWZ5KGxpbmUsIHRhZy5zdGFydCwgdGFnLmVuZCwgdGFnLm5hbWUpKTtcbiAgICB9KTtcblxuICAgIGxldCBibG9jaztcbiAgICBpZiAoc3BhbnMubGVuZ3RoID09IDApIHtcbiAgICAgIGJsb2NrID0ge1xuICAgICAgICB0eHQ6IGxpbmVcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNvcnQgc3BhbnMgYnkgc3R5bGUgb2NjdXJlbmNlIGVhcmx5IC0+IGxhdGUsIHRoZW4gYnkgbGVuZ3RoOiBmaXJzdCBsb25nIHRoZW4gc2hvcnQuXG4gICAgICBzcGFucy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpZmYgPSBhLmF0IC0gYi5hdDtcbiAgICAgICAgcmV0dXJuIGRpZmYgIT0gMCA/IGRpZmYgOiBiLmVuZCAtIGEuZW5kO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIENvbnZlcnQgYW4gYXJyYXkgb2YgcG9zc2libHkgb3ZlcmxhcHBpbmcgc3BhbnMgaW50byBhIHRyZWUuXG4gICAgICBzcGFucyA9IHRvU3BhblRyZWUoc3BhbnMpO1xuXG4gICAgICAvLyBCdWlsZCBhIHRyZWUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGVudGlyZSBzdHJpbmcsIG5vdFxuICAgICAgLy8ganVzdCB0aGUgZm9ybWF0dGVkIHBhcnRzLlxuICAgICAgY29uc3QgY2h1bmtzID0gY2h1bmtpZnkobGluZSwgMCwgbGluZS5sZW5ndGgsIHNwYW5zKTtcblxuICAgICAgY29uc3QgZHJhZnR5ID0gZHJhZnRpZnkoY2h1bmtzLCAwKTtcblxuICAgICAgYmxvY2sgPSB7XG4gICAgICAgIHR4dDogZHJhZnR5LnR4dCxcbiAgICAgICAgZm10OiBkcmFmdHkuZm10XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEV4dHJhY3QgZW50aXRpZXMgZnJvbSB0aGUgY2xlYW5lZCB1cCBzdHJpbmcuXG4gICAgZW50aXRpZXMgPSBleHRyYWN0RW50aXRpZXMoYmxvY2sudHh0KTtcbiAgICBpZiAoZW50aXRpZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgcmFuZ2VzID0gW107XG4gICAgICBmb3IgKGxldCBpIGluIGVudGl0aWVzKSB7XG4gICAgICAgIC8vIHtvZmZzZXQ6IG1hdGNoWydpbmRleCddLCB1bmlxdWU6IG1hdGNoWzBdLCBsZW46IG1hdGNoWzBdLmxlbmd0aCwgZGF0YTogZW50LnBhY2tlcigpLCB0eXBlOiBlbnQubmFtZX1cbiAgICAgICAgY29uc3QgZW50aXR5ID0gZW50aXRpZXNbaV07XG4gICAgICAgIGxldCBpbmRleCA9IGVudGl0eUluZGV4W2VudGl0eS51bmlxdWVdO1xuICAgICAgICBpZiAoIWluZGV4KSB7XG4gICAgICAgICAgaW5kZXggPSBlbnRpdHlNYXAubGVuZ3RoO1xuICAgICAgICAgIGVudGl0eUluZGV4W2VudGl0eS51bmlxdWVdID0gaW5kZXg7XG4gICAgICAgICAgZW50aXR5TWFwLnB1c2goe1xuICAgICAgICAgICAgdHA6IGVudGl0eS50eXBlLFxuICAgICAgICAgICAgZGF0YTogZW50aXR5LmRhdGFcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByYW5nZXMucHVzaCh7XG4gICAgICAgICAgYXQ6IGVudGl0eS5vZmZzZXQsXG4gICAgICAgICAgbGVuOiBlbnRpdHkubGVuLFxuICAgICAgICAgIGtleTogaW5kZXhcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBibG9jay5lbnQgPSByYW5nZXM7XG4gICAgfVxuXG4gICAgYmx4LnB1c2goYmxvY2spO1xuICB9KTtcblxuICBjb25zdCByZXN1bHQgPSB7XG4gICAgdHh0OiAnJ1xuICB9O1xuXG4gIC8vIE1lcmdlIGxpbmVzIGFuZCBzYXZlIGxpbmUgYnJlYWtzIGFzIEJSIGlubGluZSBmb3JtYXR0aW5nLlxuICBpZiAoYmx4Lmxlbmd0aCA+IDApIHtcbiAgICByZXN1bHQudHh0ID0gYmx4WzBdLnR4dDtcbiAgICByZXN1bHQuZm10ID0gKGJseFswXS5mbXQgfHwgW10pLmNvbmNhdChibHhbMF0uZW50IHx8IFtdKTtcblxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYmx4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBibG9jayA9IGJseFtpXTtcbiAgICAgIGNvbnN0IG9mZnNldCA9IHJlc3VsdC50eHQubGVuZ3RoICsgMTtcblxuICAgICAgcmVzdWx0LmZtdC5wdXNoKHtcbiAgICAgICAgdHA6ICdCUicsXG4gICAgICAgIGxlbjogMSxcbiAgICAgICAgYXQ6IG9mZnNldCAtIDFcbiAgICAgIH0pO1xuXG4gICAgICByZXN1bHQudHh0ICs9ICcgJyArIGJsb2NrLnR4dDtcbiAgICAgIGlmIChibG9jay5mbXQpIHtcbiAgICAgICAgcmVzdWx0LmZtdCA9IHJlc3VsdC5mbXQuY29uY2F0KGJsb2NrLmZtdC5tYXAoKHMpID0+IHtcbiAgICAgICAgICBzLmF0ICs9IG9mZnNldDtcbiAgICAgICAgICByZXR1cm4gcztcbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgICAgaWYgKGJsb2NrLmVudCkge1xuICAgICAgICByZXN1bHQuZm10ID0gcmVzdWx0LmZtdC5jb25jYXQoYmxvY2suZW50Lm1hcCgocykgPT4ge1xuICAgICAgICAgIHMuYXQgKz0gb2Zmc2V0O1xuICAgICAgICAgIHJldHVybiBzO1xuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlc3VsdC5mbXQubGVuZ3RoID09IDApIHtcbiAgICAgIGRlbGV0ZSByZXN1bHQuZm10O1xuICAgIH1cblxuICAgIGlmIChlbnRpdHlNYXAubGVuZ3RoID4gMCkge1xuICAgICAgcmVzdWx0LmVudCA9IGVudGl0eU1hcDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBBcHBlbmQgb25lIERyYWZ0eSBkb2N1bWVudCB0byBhbm90aGVyLlxuICpcbiAqIEBwYXJhbSB7RHJhZnR5fSBmaXJzdCAtIERyYWZ0eSBkb2N1bWVudCB0byBhcHBlbmQgdG8uXG4gKiBAcGFyYW0ge0RyYWZ0eXxzdHJpbmd9IHNlY29uZCAtIERyYWZ0eSBkb2N1bWVudCBvciBzdHJpbmcgYmVpbmcgYXBwZW5kZWQuXG4gKlxuICogQHJldHVybiB7RHJhZnR5fSBmaXJzdCBkb2N1bWVudCB3aXRoIHRoZSBzZWNvbmQgYXBwZW5kZWQgdG8gaXQuXG4gKi9cbkRyYWZ0eS5hcHBlbmQgPSBmdW5jdGlvbihmaXJzdCwgc2Vjb25kKSB7XG4gIGlmICghZmlyc3QpIHtcbiAgICByZXR1cm4gc2Vjb25kO1xuICB9XG4gIGlmICghc2Vjb25kKSB7XG4gICAgcmV0dXJuIGZpcnN0O1xuICB9XG5cbiAgZmlyc3QudHh0ID0gZmlyc3QudHh0IHx8ICcnO1xuICBjb25zdCBsZW4gPSBmaXJzdC50eHQubGVuZ3RoO1xuXG4gIGlmICh0eXBlb2Ygc2Vjb25kID09ICdzdHJpbmcnKSB7XG4gICAgZmlyc3QudHh0ICs9IHNlY29uZDtcbiAgfSBlbHNlIGlmIChzZWNvbmQudHh0KSB7XG4gICAgZmlyc3QudHh0ICs9IHNlY29uZC50eHQ7XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheShzZWNvbmQuZm10KSkge1xuICAgIGZpcnN0LmZtdCA9IGZpcnN0LmZtdCB8fCBbXTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzZWNvbmQuZW50KSkge1xuICAgICAgZmlyc3QuZW50ID0gZmlyc3QuZW50IHx8IFtdO1xuICAgIH1cbiAgICBzZWNvbmQuZm10LmZvckVhY2goc3JjID0+IHtcbiAgICAgIGNvbnN0IGZtdCA9IHtcbiAgICAgICAgYXQ6IChzcmMuYXQgfCAwKSArIGxlbixcbiAgICAgICAgbGVuOiBzcmMubGVuIHwgMFxuICAgICAgfTtcbiAgICAgIC8vIFNwZWNpYWwgY2FzZSBmb3IgdGhlIG91dHNpZGUgb2YgdGhlIG5vcm1hbCByZW5kZXJpbmcgZmxvdyBzdHlsZXMuXG4gICAgICBpZiAoc3JjLmF0ID09IC0xKSB7XG4gICAgICAgIGZtdC5hdCA9IC0xO1xuICAgICAgICBmbXQubGVuID0gMDtcbiAgICAgIH1cbiAgICAgIGlmIChzcmMudHApIHtcbiAgICAgICAgZm10LnRwID0gc3JjLnRwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm10LmtleSA9IGZpcnN0LmVudC5sZW5ndGg7XG4gICAgICAgIGZpcnN0LmVudC5wdXNoKHNlY29uZC5lbnRbc3JjLmtleSB8fCAwXSk7XG4gICAgICB9XG4gICAgICBmaXJzdC5mbXQucHVzaChmbXQpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGZpcnN0O1xufVxuXG4vKipcbiAqIEB0eXBlZGVmIERyYWZ0eS5JbWFnZURlc2NcbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEB0eXBlIE9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IG1pbWUgLSBtaW1lLXR5cGUgb2YgdGhlIGltYWdlLCBlLmcuIFwiaW1hZ2UvcG5nXCJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwcmV2aWV3IC0gYmFzZTY0LWVuY29kZWQgaW1hZ2UgY29udGVudCAob3IgcHJldmlldywgaWYgbGFyZ2UgaW1hZ2UgaXMgYXR0YWNoZWQpLiBDb3VsZCBiZSBudWxsL3VuZGVmaW5lZC5cbiAqIEBwYXJhbSB7aW50ZWdlcn0gd2lkdGggLSB3aWR0aCBvZiB0aGUgaW1hZ2VcbiAqIEBwYXJhbSB7aW50ZWdlcn0gaGVpZ2h0IC0gaGVpZ2h0IG9mIHRoZSBpbWFnZVxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lIC0gZmlsZSBuYW1lIHN1Z2dlc3Rpb24gZm9yIGRvd25sb2FkaW5nIHRoZSBpbWFnZS5cbiAqIEBwYXJhbSB7aW50ZWdlcn0gc2l6ZSAtIHNpemUgb2YgdGhlIGltYWdlIGluIGJ5dGVzLiBUcmVhdCBpcyBhcyBhbiB1bnRydXN0ZWQgaGludC5cbiAqIEBwYXJhbSB7c3RyaW5nfSByZWZ1cmwgLSByZWZlcmVuY2UgdG8gdGhlIGNvbnRlbnQuIENvdWxkIGJlIG51bGwvdW5kZWZpbmVkLlxuICogQHBhcmFtIHtzdHJpbmd9IF90ZW1wUHJldmlldyAtIGJhc2U2NC1lbmNvZGVkIGltYWdlIHByZXZpZXcgdXNlZCBkdXJpbmcgdXBsb2FkIHByb2Nlc3M7IG5vdCBzZXJpYWxpemFibGUuXG4gKiBAcGFyYW0ge1Byb21pc2V9IHVybFByb21pc2UgLSBQcm9taXNlIHdoaWNoIHJldHVybnMgY29udGVudCBVUkwgd2hlbiByZXNvbHZlZC5cbiAqL1xuXG4vKipcbiAqIEluc2VydCBpbmxpbmUgaW1hZ2UgaW50byBEcmFmdHkgZG9jdW1lbnQuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl9IGNvbnRlbnQgLSBkb2N1bWVudCB0byBhZGQgaW1hZ2UgdG8uXG4gKiBAcGFyYW0ge2ludGVnZXJ9IGF0IC0gaW5kZXggd2hlcmUgdGhlIG9iamVjdCBpcyBpbnNlcnRlZC4gVGhlIGxlbmd0aCBvZiB0aGUgaW1hZ2UgaXMgYWx3YXlzIDEuXG4gKiBAcGFyYW0ge0ltYWdlRGVzY30gaW1hZ2VEZXNjIC0gb2JqZWN0IHdpdGggaW1hZ2UgcGFyYW1lbmV0cyBhbmQgZGF0YS5cbiAqXG4gKiBAcmV0dXJuIHtEcmFmdHl9IHVwZGF0ZWQgZG9jdW1lbnQuXG4gKi9cbkRyYWZ0eS5pbnNlcnRJbWFnZSA9IGZ1bmN0aW9uKGNvbnRlbnQsIGF0LCBpbWFnZURlc2MpIHtcbiAgY29udGVudCA9IGNvbnRlbnQgfHwge1xuICAgIHR4dDogJyAnXG4gIH07XG4gIGNvbnRlbnQuZW50ID0gY29udGVudC5lbnQgfHwgW107XG4gIGNvbnRlbnQuZm10ID0gY29udGVudC5mbXQgfHwgW107XG5cbiAgY29udGVudC5mbXQucHVzaCh7XG4gICAgYXQ6IGF0IHwgMCxcbiAgICBsZW46IDEsXG4gICAga2V5OiBjb250ZW50LmVudC5sZW5ndGhcbiAgfSk7XG5cbiAgY29uc3QgZXggPSB7XG4gICAgdHA6ICdJTScsXG4gICAgZGF0YToge1xuICAgICAgbWltZTogaW1hZ2VEZXNjLm1pbWUsXG4gICAgICB2YWw6IGltYWdlRGVzYy5wcmV2aWV3LFxuICAgICAgd2lkdGg6IGltYWdlRGVzYy53aWR0aCxcbiAgICAgIGhlaWdodDogaW1hZ2VEZXNjLmhlaWdodCxcbiAgICAgIG5hbWU6IGltYWdlRGVzYy5maWxlbmFtZSxcbiAgICAgIHNpemU6IGltYWdlRGVzYy5zaXplIHwgMCxcbiAgICAgIHJlZjogaW1hZ2VEZXNjLnJlZnVybFxuICAgIH1cbiAgfTtcblxuICBpZiAoaW1hZ2VEZXNjLnVybFByb21pc2UpIHtcbiAgICBleC5kYXRhLl90ZW1wUHJldmlldyA9IGltYWdlRGVzYy5fdGVtcFByZXZpZXc7XG4gICAgZXguZGF0YS5fcHJvY2Vzc2luZyA9IHRydWU7XG4gICAgaW1hZ2VEZXNjLnVybFByb21pc2UudGhlbihcbiAgICAgIHVybCA9PiB7XG4gICAgICAgIGV4LmRhdGEucmVmID0gdXJsO1xuICAgICAgICBleC5kYXRhLl90ZW1wUHJldmlldyA9IHVuZGVmaW5lZDtcbiAgICAgICAgZXguZGF0YS5fcHJvY2Vzc2luZyA9IHVuZGVmaW5lZDtcbiAgICAgIH0sXG4gICAgICBfID0+IHtcbiAgICAgICAgLy8gQ2F0Y2ggdGhlIGVycm9yLCBvdGhlcndpc2UgaXQgd2lsbCBhcHBlYXIgaW4gdGhlIGNvbnNvbGUuXG4gICAgICAgIGV4LmRhdGEuX3Byb2Nlc3NpbmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIGNvbnRlbnQuZW50LnB1c2goZXgpO1xuXG4gIHJldHVybiBjb250ZW50O1xufVxuXG4vKipcbiAqIEB0eXBlZGVmIERyYWZ0eS5BdWRpb0Rlc2NcbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEB0eXBlIE9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IG1pbWUgLSBtaW1lLXR5cGUgb2YgdGhlIGF1ZGlvLCBlLmcuIFwiYXVkaW8vb2dnXCIuXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIGJhc2U2NC1lbmNvZGVkIGF1ZGlvIGNvbnRlbnQuIENvdWxkIGJlIG51bGwvdW5kZWZpbmVkLlxuICogQHBhcmFtIHtpbnRlZ2VyfSBkdXJhdGlvbiAtIGR1cmF0aW9uIG9mIHRoZSByZWNvcmQgaW4gbWlsbGlzZWNvbmRzLlxuICogQHBhcmFtIHtzdHJpbmd9IHByZXZpZXcgLSBiYXNlNjQgZW5jb2RlZCBzaG9ydCBhcnJheSBvZiBhbXBsaXR1ZGUgdmFsdWVzIDAuLjEwMC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZSAtIGZpbGUgbmFtZSBzdWdnZXN0aW9uIGZvciBkb3dubG9hZGluZyB0aGUgYXVkaW8uXG4gKiBAcGFyYW0ge2ludGVnZXJ9IHNpemUgLSBzaXplIG9mIHRoZSByZWNvcmRpbmcgaW4gYnl0ZXMuIFRyZWF0IGlzIGFzIGFuIHVudHJ1c3RlZCBoaW50LlxuICogQHBhcmFtIHtzdHJpbmd9IHJlZnVybCAtIHJlZmVyZW5jZSB0byB0aGUgY29udGVudC4gQ291bGQgYmUgbnVsbC91bmRlZmluZWQuXG4gKiBAcGFyYW0ge1Byb21pc2V9IHVybFByb21pc2UgLSBQcm9taXNlIHdoaWNoIHJldHVybnMgY29udGVudCBVUkwgd2hlbiByZXNvbHZlZC5cbiAqL1xuXG4vKipcbiAqIEluc2VydCBhdWRpbyByZWNvcmRpbmcgaW50byBEcmFmdHkgZG9jdW1lbnQuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl9IGNvbnRlbnQgLSBkb2N1bWVudCB0byBhZGQgYXVkaW8gcmVjb3JkIHRvLlxuICogQHBhcmFtIHtpbnRlZ2VyfSBhdCAtIGluZGV4IHdoZXJlIHRoZSBvYmplY3QgaXMgaW5zZXJ0ZWQuIFRoZSBsZW5ndGggb2YgdGhlIHJlY29yZCBpcyBhbHdheXMgMS5cbiAqIEBwYXJhbSB7QXVkaW9EZXNjfSBhdWRpb0Rlc2MgLSBvYmplY3Qgd2l0aCB0aGUgYXVkaW8gcGFyYW1lbmV0cyBhbmQgZGF0YS5cbiAqXG4gKiBAcmV0dXJuIHtEcmFmdHl9IHVwZGF0ZWQgZG9jdW1lbnQuXG4gKi9cbkRyYWZ0eS5pbnNlcnRBdWRpbyA9IGZ1bmN0aW9uKGNvbnRlbnQsIGF0LCBhdWRpb0Rlc2MpIHtcbiAgY29udGVudCA9IGNvbnRlbnQgfHwge1xuICAgIHR4dDogJyAnXG4gIH07XG4gIGNvbnRlbnQuZW50ID0gY29udGVudC5lbnQgfHwgW107XG4gIGNvbnRlbnQuZm10ID0gY29udGVudC5mbXQgfHwgW107XG5cbiAgY29udGVudC5mbXQucHVzaCh7XG4gICAgYXQ6IGF0IHwgMCxcbiAgICBsZW46IDEsXG4gICAga2V5OiBjb250ZW50LmVudC5sZW5ndGhcbiAgfSk7XG5cbiAgY29uc3QgZXggPSB7XG4gICAgdHA6ICdBVScsXG4gICAgZGF0YToge1xuICAgICAgbWltZTogYXVkaW9EZXNjLm1pbWUsXG4gICAgICB2YWw6IGF1ZGlvRGVzYy5kYXRhLFxuICAgICAgZHVyYXRpb246IGF1ZGlvRGVzYy5kdXJhdGlvbiB8IDAsXG4gICAgICBwcmV2aWV3OiBhdWRpb0Rlc2MucHJldmlldyxcbiAgICAgIG5hbWU6IGF1ZGlvRGVzYy5maWxlbmFtZSxcbiAgICAgIHNpemU6IGF1ZGlvRGVzYy5zaXplIHwgMCxcbiAgICAgIHJlZjogYXVkaW9EZXNjLnJlZnVybFxuICAgIH1cbiAgfTtcblxuICBpZiAoYXVkaW9EZXNjLnVybFByb21pc2UpIHtcbiAgICBleC5kYXRhLl9wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICBhdWRpb0Rlc2MudXJsUHJvbWlzZS50aGVuKFxuICAgICAgdXJsID0+IHtcbiAgICAgICAgZXguZGF0YS5yZWYgPSB1cmw7XG4gICAgICAgIGV4LmRhdGEuX3Byb2Nlc3NpbmcgPSB1bmRlZmluZWQ7XG4gICAgICB9LFxuICAgICAgXyA9PiB7XG4gICAgICAgIC8vIENhdGNoIHRoZSBlcnJvciwgb3RoZXJ3aXNlIGl0IHdpbGwgYXBwZWFyIGluIHRoZSBjb25zb2xlLlxuICAgICAgICBleC5kYXRhLl9wcm9jZXNzaW5nID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBjb250ZW50LmVudC5wdXNoKGV4KTtcblxuICByZXR1cm4gY29udGVudDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBxdW90ZSB0byBEcmFmdHkgZG9jdW1lbnQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlciAtIFF1b3RlIGhlYWRlciAodGl0bGUsIGV0Yy4pLlxuICogQHBhcmFtIHtzdHJpbmd9IHVpZCAtIFVJRCBvZiB0aGUgYXV0aG9yIHRvIG1lbnRpb24uXG4gKiBAcGFyYW0ge0RyYWZ0eX0gYm9keSAtIEJvZHkgb2YgdGhlIHF1b3RlZCBtZXNzYWdlLlxuICpcbiAqIEByZXR1cm5zIFJlcGx5IHF1b3RlIERyYWZ0eSBkb2Mgd2l0aCB0aGUgcXVvdGUgZm9ybWF0dGluZy5cbiAqL1xuRHJhZnR5LnF1b3RlID0gZnVuY3Rpb24oaGVhZGVyLCB1aWQsIGJvZHkpIHtcbiAgY29uc3QgcXVvdGUgPSBEcmFmdHkuYXBwZW5kKERyYWZ0eS5hcHBlbmRMaW5lQnJlYWsoRHJhZnR5Lm1lbnRpb24oaGVhZGVyLCB1aWQpKSwgYm9keSk7XG5cbiAgLy8gV3JhcCBpbnRvIGEgcXVvdGUuXG4gIHF1b3RlLmZtdC5wdXNoKHtcbiAgICBhdDogMCxcbiAgICBsZW46IHF1b3RlLnR4dC5sZW5ndGgsXG4gICAgdHA6ICdRUSdcbiAgfSk7XG5cbiAgcmV0dXJuIHF1b3RlO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIERyYWZ0eSBkb2N1bWVudCB3aXRoIGEgbWVudGlvbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIG1lbnRpb25lZCBuYW1lLlxuICogQHBhcmFtIHtzdHJpbmd9IHVpZCAtIG1lbnRpb25lZCB1c2VyIElELlxuICpcbiAqIEByZXR1cm5zIHtEcmFmdHl9IGRvY3VtZW50IHdpdGggdGhlIG1lbnRpb24uXG4gKi9cbkRyYWZ0eS5tZW50aW9uID0gZnVuY3Rpb24obmFtZSwgdWlkKSB7XG4gIHJldHVybiB7XG4gICAgdHh0OiBuYW1lIHx8ICcnLFxuICAgIGZtdDogW3tcbiAgICAgIGF0OiAwLFxuICAgICAgbGVuOiAobmFtZSB8fCAnJykubGVuZ3RoLFxuICAgICAga2V5OiAwXG4gICAgfV0sXG4gICAgZW50OiBbe1xuICAgICAgdHA6ICdNTicsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHZhbDogdWlkXG4gICAgICB9XG4gICAgfV1cbiAgfTtcbn1cblxuLyoqXG4gKiBBcHBlbmQgYSBsaW5rIHRvIGEgRHJhZnR5IGRvY3VtZW50LlxuICpcbiAqIEBwYXJhbSB7RHJhZnR5fSBjb250ZW50IC0gRHJhZnR5IGRvY3VtZW50IHRvIGFwcGVuZCBsaW5rIHRvLlxuICogQHBhcmFtIHtPYmplY3R9IGxpbmtEYXRhIC0gTGluayBpbmZvIGluIGZvcm1hdCA8Y29kZT57dHh0OiAnYW5rb3IgdGV4dCcsIHVybDogJ2h0dHA6Ly8uLi4nfTwvY29kZT4uXG4gKlxuICogQHJldHVybnMge0RyYWZ0eX0gdGhlIHNhbWUgZG9jdW1lbnQgYXMgPGNvZGU+Y29udGVudDwvY29kZT4uXG4gKi9cbkRyYWZ0eS5hcHBlbmRMaW5rID0gZnVuY3Rpb24oY29udGVudCwgbGlua0RhdGEpIHtcbiAgY29udGVudCA9IGNvbnRlbnQgfHwge1xuICAgIHR4dDogJydcbiAgfTtcblxuICBjb250ZW50LmVudCA9IGNvbnRlbnQuZW50IHx8IFtdO1xuICBjb250ZW50LmZtdCA9IGNvbnRlbnQuZm10IHx8IFtdO1xuXG4gIGNvbnRlbnQuZm10LnB1c2goe1xuICAgIGF0OiBjb250ZW50LnR4dC5sZW5ndGgsXG4gICAgbGVuOiBsaW5rRGF0YS50eHQubGVuZ3RoLFxuICAgIGtleTogY29udGVudC5lbnQubGVuZ3RoXG4gIH0pO1xuICBjb250ZW50LnR4dCArPSBsaW5rRGF0YS50eHQ7XG5cbiAgY29uc3QgZXggPSB7XG4gICAgdHA6ICdMTicsXG4gICAgZGF0YToge1xuICAgICAgdXJsOiBsaW5rRGF0YS51cmxcbiAgICB9XG4gIH1cbiAgY29udGVudC5lbnQucHVzaChleCk7XG5cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbi8qKlxuICogQXBwZW5kIGltYWdlIHRvIERyYWZ0eSBkb2N1bWVudC5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eX0gY29udGVudCAtIGRvY3VtZW50IHRvIGFkZCBpbWFnZSB0by5cbiAqIEBwYXJhbSB7SW1hZ2VEZXNjfSBpbWFnZURlc2MgLSBvYmplY3Qgd2l0aCBpbWFnZSBwYXJhbWVuZXRzLlxuICpcbiAqIEByZXR1cm4ge0RyYWZ0eX0gdXBkYXRlZCBkb2N1bWVudC5cbiAqL1xuRHJhZnR5LmFwcGVuZEltYWdlID0gZnVuY3Rpb24oY29udGVudCwgaW1hZ2VEZXNjKSB7XG4gIGNvbnRlbnQgPSBjb250ZW50IHx8IHtcbiAgICB0eHQ6ICcnXG4gIH07XG4gIGNvbnRlbnQudHh0ICs9ICcgJztcbiAgcmV0dXJuIERyYWZ0eS5pbnNlcnRJbWFnZShjb250ZW50LCBjb250ZW50LnR4dC5sZW5ndGggLSAxLCBpbWFnZURlc2MpO1xufVxuXG4vKipcbiAqIEFwcGVuZCBhdWRpbyByZWNvZHJpbmcgdG8gRHJhZnR5IGRvY3VtZW50LlxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7RHJhZnR5fSBjb250ZW50IC0gZG9jdW1lbnQgdG8gYWRkIHJlY29yZGluZyB0by5cbiAqIEBwYXJhbSB7QXVkaW9EZXNjfSBhdWRpb0Rlc2MgLSBvYmplY3Qgd2l0aCBhdWRpbyBkYXRhLlxuICpcbiAqIEByZXR1cm4ge0RyYWZ0eX0gdXBkYXRlZCBkb2N1bWVudC5cbiAqL1xuRHJhZnR5LmFwcGVuZEF1ZGlvID0gZnVuY3Rpb24oY29udGVudCwgYXVkaW9EZXNjKSB7XG4gIGNvbnRlbnQgPSBjb250ZW50IHx8IHtcbiAgICB0eHQ6ICcnXG4gIH07XG4gIGNvbnRlbnQudHh0ICs9ICcgJztcbiAgcmV0dXJuIERyYWZ0eS5pbnNlcnRBdWRpbyhjb250ZW50LCBjb250ZW50LnR4dC5sZW5ndGggLSAxLCBhdWRpb0Rlc2MpO1xufVxuXG4vKipcbiAqIEB0eXBlZGVmIERyYWZ0eS5BdHRhY2htZW50RGVzY1xuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHR5cGUgT2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gbWltZSAtIG1pbWUtdHlwZSBvZiB0aGUgYXR0YWNobWVudCwgZS5nLiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIGJhc2U2NC1lbmNvZGVkIGluLWJhbmQgY29udGVudCBvZiBzbWFsbCBhdHRhY2htZW50cy4gQ291bGQgYmUgbnVsbC91bmRlZmluZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZW5hbWUgLSBmaWxlIG5hbWUgc3VnZ2VzdGlvbiBmb3IgZG93bmxvYWRpbmcgdGhlIGF0dGFjaG1lbnQuXG4gKiBAcGFyYW0ge2ludGVnZXJ9IHNpemUgLSBzaXplIG9mIHRoZSBmaWxlIGluIGJ5dGVzLiBUcmVhdCBpcyBhcyBhbiB1bnRydXN0ZWQgaGludC5cbiAqIEBwYXJhbSB7c3RyaW5nfSByZWZ1cmwgLSByZWZlcmVuY2UgdG8gdGhlIG91dC1vZi1iYW5kIGNvbnRlbnQuIENvdWxkIGJlIG51bGwvdW5kZWZpbmVkLlxuICogQHBhcmFtIHtQcm9taXNlfSB1cmxQcm9taXNlIC0gUHJvbWlzZSB3aGljaCByZXR1cm5zIGNvbnRlbnQgVVJMIHdoZW4gcmVzb2x2ZWQuXG4gKi9cblxuLyoqXG4gKiBBdHRhY2ggZmlsZSB0byBEcmFmdHkgY29udGVudC4gRWl0aGVyIGFzIGEgYmxvYiBvciBhcyBhIHJlZmVyZW5jZS5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eX0gY29udGVudCAtIGRvY3VtZW50IHRvIGF0dGFjaCBmaWxlIHRvLlxuICogQHBhcmFtIHtBdHRhY2htZW50RGVzY30gb2JqZWN0IC0gY29udGFpbmluZyBhdHRhY2htZW50IGRlc2NyaXB0aW9uIGFuZCBkYXRhLlxuICpcbiAqIEByZXR1cm4ge0RyYWZ0eX0gdXBkYXRlZCBkb2N1bWVudC5cbiAqL1xuRHJhZnR5LmF0dGFjaEZpbGUgPSBmdW5jdGlvbihjb250ZW50LCBhdHRhY2htZW50RGVzYykge1xuICBjb250ZW50ID0gY29udGVudCB8fCB7XG4gICAgdHh0OiAnJ1xuICB9O1xuXG4gIGNvbnRlbnQuZW50ID0gY29udGVudC5lbnQgfHwgW107XG4gIGNvbnRlbnQuZm10ID0gY29udGVudC5mbXQgfHwgW107XG5cbiAgY29udGVudC5mbXQucHVzaCh7XG4gICAgYXQ6IC0xLFxuICAgIGxlbjogMCxcbiAgICBrZXk6IGNvbnRlbnQuZW50Lmxlbmd0aFxuICB9KTtcblxuICBjb25zdCBleCA9IHtcbiAgICB0cDogJ0VYJyxcbiAgICBkYXRhOiB7XG4gICAgICBtaW1lOiBhdHRhY2htZW50RGVzYy5taW1lLFxuICAgICAgdmFsOiBhdHRhY2htZW50RGVzYy5kYXRhLFxuICAgICAgbmFtZTogYXR0YWNobWVudERlc2MuZmlsZW5hbWUsXG4gICAgICByZWY6IGF0dGFjaG1lbnREZXNjLnJlZnVybCxcbiAgICAgIHNpemU6IGF0dGFjaG1lbnREZXNjLnNpemUgfCAwXG4gICAgfVxuICB9XG4gIGlmIChhdHRhY2htZW50RGVzYy51cmxQcm9taXNlKSB7XG4gICAgZXguZGF0YS5fcHJvY2Vzc2luZyA9IHRydWU7XG4gICAgYXR0YWNobWVudERlc2MudXJsUHJvbWlzZS50aGVuKFxuICAgICAgKHVybCkgPT4ge1xuICAgICAgICBleC5kYXRhLnJlZiA9IHVybDtcbiAgICAgICAgZXguZGF0YS5fcHJvY2Vzc2luZyA9IHVuZGVmaW5lZDtcbiAgICAgIH0sXG4gICAgICAoZXJyKSA9PiB7XG4gICAgICAgIC8qIGNhdGNoIHRoZSBlcnJvciwgb3RoZXJ3aXNlIGl0IHdpbGwgYXBwZWFyIGluIHRoZSBjb25zb2xlLiAqL1xuICAgICAgICBleC5kYXRhLl9wcm9jZXNzaW5nID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICk7XG4gIH1cbiAgY29udGVudC5lbnQucHVzaChleCk7XG5cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbi8qKlxuICogV3JhcHMgZHJhZnR5IGRvY3VtZW50IGludG8gYSBzaW1wbGUgZm9ybWF0dGluZyBzdHlsZS5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eXxzdHJpbmd9IGNvbnRlbnQgLSBkb2N1bWVudCBvciBzdHJpbmcgdG8gd3JhcCBpbnRvIGEgc3R5bGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gc3R5bGUgLSB0d28tbGV0dGVyIHN0eWxlIHRvIHdyYXAgaW50by5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhdCAtIGluZGV4IHdoZXJlIHRoZSBzdHlsZSBzdGFydHMsIGRlZmF1bHQgMC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsZW4gLSBsZW5ndGggb2YgdGhlIGZvcm0gY29udGVudCwgZGVmYXVsdCBhbGwgb2YgaXQuXG4gKlxuICogQHJldHVybiB7RHJhZnR5fSB1cGRhdGVkIGRvY3VtZW50LlxuICovXG5EcmFmdHkud3JhcEludG8gPSBmdW5jdGlvbihjb250ZW50LCBzdHlsZSwgYXQsIGxlbikge1xuICBpZiAodHlwZW9mIGNvbnRlbnQgPT0gJ3N0cmluZycpIHtcbiAgICBjb250ZW50ID0ge1xuICAgICAgdHh0OiBjb250ZW50XG4gICAgfTtcbiAgfVxuICBjb250ZW50LmZtdCA9IGNvbnRlbnQuZm10IHx8IFtdO1xuXG4gIGNvbnRlbnQuZm10LnB1c2goe1xuICAgIGF0OiBhdCB8fCAwLFxuICAgIGxlbjogbGVuIHx8IGNvbnRlbnQudHh0Lmxlbmd0aCxcbiAgICB0cDogc3R5bGUsXG4gIH0pO1xuXG4gIHJldHVybiBjb250ZW50O1xufVxuXG4vKipcbiAqIFdyYXBzIGNvbnRlbnQgaW50byBhbiBpbnRlcmFjdGl2ZSBmb3JtLlxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7RHJhZnR5fHN0cmluZ30gY29udGVudCAtIHRvIHdyYXAgaW50byBhIGZvcm0uXG4gKiBAcGFyYW0ge251bWJlcn0gYXQgLSBpbmRleCB3aGVyZSB0aGUgZm9ybXMgc3RhcnRzLlxuICogQHBhcmFtIHtudW1iZXJ9IGxlbiAtIGxlbmd0aCBvZiB0aGUgZm9ybSBjb250ZW50LlxuICpcbiAqIEByZXR1cm4ge0RyYWZ0eX0gdXBkYXRlZCBkb2N1bWVudC5cbiAqL1xuRHJhZnR5LndyYXBBc0Zvcm0gPSBmdW5jdGlvbihjb250ZW50LCBhdCwgbGVuKSB7XG4gIHJldHVybiBEcmFmdHkud3JhcEludG8oY29udGVudCwgJ0ZNJywgYXQsIGxlbik7XG59XG5cbi8qKlxuICogSW5zZXJ0IGNsaWNrYWJsZSBidXR0b24gaW50byBEcmFmdHkgZG9jdW1lbnQuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl8c3RyaW5nfSBjb250ZW50IC0gRHJhZnR5IGRvY3VtZW50IHRvIGluc2VydCBidXR0b24gdG8gb3IgYSBzdHJpbmcgdG8gYmUgdXNlZCBhcyBidXR0b24gdGV4dC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhdCAtIGxvY2F0aW9uIHdoZXJlIHRoZSBidXR0b24gaXMgaW5zZXJ0ZWQuXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuIC0gdGhlIGxlbmd0aCBvZiB0aGUgdGV4dCB0byBiZSB1c2VkIGFzIGJ1dHRvbiB0aXRsZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gdGhlIGJ1dHRvbi4gQ2xpZW50IHNob3VsZCByZXR1cm4gaXQgdG8gdGhlIHNlcnZlciB3aGVuIHRoZSBidXR0b24gaXMgY2xpY2tlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25UeXBlIC0gdGhlIHR5cGUgb2YgdGhlIGJ1dHRvbiwgb25lIG9mICd1cmwnIG9yICdwdWInLlxuICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvblZhbHVlIC0gdGhlIHZhbHVlIHRvIHJldHVybiBvbiBjbGljazpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWZVcmwgLSB0aGUgVVJMIHRvIGdvIHRvIHdoZW4gdGhlICd1cmwnIGJ1dHRvbiBpcyBjbGlja2VkLlxuICpcbiAqIEByZXR1cm4ge0RyYWZ0eX0gdXBkYXRlZCBkb2N1bWVudC5cbiAqL1xuRHJhZnR5Lmluc2VydEJ1dHRvbiA9IGZ1bmN0aW9uKGNvbnRlbnQsIGF0LCBsZW4sIG5hbWUsIGFjdGlvblR5cGUsIGFjdGlvblZhbHVlLCByZWZVcmwpIHtcbiAgaWYgKHR5cGVvZiBjb250ZW50ID09ICdzdHJpbmcnKSB7XG4gICAgY29udGVudCA9IHtcbiAgICAgIHR4dDogY29udGVudFxuICAgIH07XG4gIH1cblxuICBpZiAoIWNvbnRlbnQgfHwgIWNvbnRlbnQudHh0IHx8IGNvbnRlbnQudHh0Lmxlbmd0aCA8IGF0ICsgbGVuKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAobGVuIDw9IDAgfHwgWyd1cmwnLCAncHViJ10uaW5kZXhPZihhY3Rpb25UeXBlKSA9PSAtMSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIC8vIEVuc3VyZSByZWZVcmwgaXMgYSBzdHJpbmcuXG4gIGlmIChhY3Rpb25UeXBlID09ICd1cmwnICYmICFyZWZVcmwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZWZVcmwgPSAnJyArIHJlZlVybDtcblxuICBjb250ZW50LmVudCA9IGNvbnRlbnQuZW50IHx8IFtdO1xuICBjb250ZW50LmZtdCA9IGNvbnRlbnQuZm10IHx8IFtdO1xuXG4gIGNvbnRlbnQuZm10LnB1c2goe1xuICAgIGF0OiBhdCB8IDAsXG4gICAgbGVuOiBsZW4sXG4gICAga2V5OiBjb250ZW50LmVudC5sZW5ndGhcbiAgfSk7XG4gIGNvbnRlbnQuZW50LnB1c2goe1xuICAgIHRwOiAnQk4nLFxuICAgIGRhdGE6IHtcbiAgICAgIGFjdDogYWN0aW9uVHlwZSxcbiAgICAgIHZhbDogYWN0aW9uVmFsdWUsXG4gICAgICByZWY6IHJlZlVybCxcbiAgICAgIG5hbWU6IG5hbWVcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBjb250ZW50O1xufVxuXG4vKipcbiAqIEFwcGVuZCBjbGlja2FibGUgYnV0dG9uIHRvIERyYWZ0eSBkb2N1bWVudC5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eXxzdHJpbmd9IGNvbnRlbnQgLSBEcmFmdHkgZG9jdW1lbnQgdG8gaW5zZXJ0IGJ1dHRvbiB0byBvciBhIHN0cmluZyB0byBiZSB1c2VkIGFzIGJ1dHRvbiB0ZXh0LlxuICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIC0gdGhlIHRleHQgdG8gYmUgdXNlZCBhcyBidXR0b24gdGl0bGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIHRoZSBidXR0b24uIENsaWVudCBzaG91bGQgcmV0dXJuIGl0IHRvIHRoZSBzZXJ2ZXIgd2hlbiB0aGUgYnV0dG9uIGlzIGNsaWNrZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uVHlwZSAtIHRoZSB0eXBlIG9mIHRoZSBidXR0b24sIG9uZSBvZiAndXJsJyBvciAncHViJy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25WYWx1ZSAtIHRoZSB2YWx1ZSB0byByZXR1cm4gb24gY2xpY2s6XG4gKiBAcGFyYW0ge3N0cmluZ30gcmVmVXJsIC0gdGhlIFVSTCB0byBnbyB0byB3aGVuIHRoZSAndXJsJyBidXR0b24gaXMgY2xpY2tlZC5cbiAqXG4gKiBAcmV0dXJuIHtEcmFmdHl9IHVwZGF0ZWQgZG9jdW1lbnQuXG4gKi9cbkRyYWZ0eS5hcHBlbmRCdXR0b24gPSBmdW5jdGlvbihjb250ZW50LCB0aXRsZSwgbmFtZSwgYWN0aW9uVHlwZSwgYWN0aW9uVmFsdWUsIHJlZlVybCkge1xuICBjb250ZW50ID0gY29udGVudCB8fCB7XG4gICAgdHh0OiAnJ1xuICB9O1xuICBjb25zdCBhdCA9IGNvbnRlbnQudHh0Lmxlbmd0aDtcbiAgY29udGVudC50eHQgKz0gdGl0bGU7XG4gIHJldHVybiBEcmFmdHkuaW5zZXJ0QnV0dG9uKGNvbnRlbnQsIGF0LCB0aXRsZS5sZW5ndGgsIG5hbWUsIGFjdGlvblR5cGUsIGFjdGlvblZhbHVlLCByZWZVcmwpO1xufVxuXG4vKipcbiAqIEF0dGFjaCBhIGdlbmVyaWMgSlMgb2JqZWN0LiBUaGUgb2JqZWN0IGlzIGF0dGFjaGVkIGFzIGEganNvbiBzdHJpbmcuXG4gKiBJbnRlbmRlZCBmb3IgcmVwcmVzZW50aW5nIGEgZm9ybSByZXNwb25zZS5cbiAqXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl9IGNvbnRlbnQgLSBEcmFmdHkgZG9jdW1lbnQgdG8gYXR0YWNoIGZpbGUgdG8uXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIGRhdGEgdG8gY29udmVydCB0byBqc29uIHN0cmluZyBhbmQgYXR0YWNoLlxuICogQHJldHVybnMge0RyYWZ0eX0gdGhlIHNhbWUgZG9jdW1lbnQgYXMgPGNvZGU+Y29udGVudDwvY29kZT4uXG4gKi9cbkRyYWZ0eS5hdHRhY2hKU09OID0gZnVuY3Rpb24oY29udGVudCwgZGF0YSkge1xuICBjb250ZW50ID0gY29udGVudCB8fCB7XG4gICAgdHh0OiAnJ1xuICB9O1xuICBjb250ZW50LmVudCA9IGNvbnRlbnQuZW50IHx8IFtdO1xuICBjb250ZW50LmZtdCA9IGNvbnRlbnQuZm10IHx8IFtdO1xuXG4gIGNvbnRlbnQuZm10LnB1c2goe1xuICAgIGF0OiAtMSxcbiAgICBsZW46IDAsXG4gICAga2V5OiBjb250ZW50LmVudC5sZW5ndGhcbiAgfSk7XG5cbiAgY29udGVudC5lbnQucHVzaCh7XG4gICAgdHA6ICdFWCcsXG4gICAgZGF0YToge1xuICAgICAgbWltZTogSlNPTl9NSU1FX1RZUEUsXG4gICAgICB2YWw6IGRhdGFcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBjb250ZW50O1xufVxuLyoqXG4gKiBBcHBlbmQgbGluZSBicmVhayB0byBhIERyYWZ0eSBkb2N1bWVudC5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eX0gY29udGVudCAtIERyYWZ0eSBkb2N1bWVudCB0byBhcHBlbmQgbGluZWJyZWFrIHRvLlxuICogQHJldHVybnMge0RyYWZ0eX0gdGhlIHNhbWUgZG9jdW1lbnQgYXMgPGNvZGU+Y29udGVudDwvY29kZT4uXG4gKi9cbkRyYWZ0eS5hcHBlbmRMaW5lQnJlYWsgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIGNvbnRlbnQgPSBjb250ZW50IHx8IHtcbiAgICB0eHQ6ICcnXG4gIH07XG4gIGNvbnRlbnQuZm10ID0gY29udGVudC5mbXQgfHwgW107XG4gIGNvbnRlbnQuZm10LnB1c2goe1xuICAgIGF0OiBjb250ZW50LnR4dC5sZW5ndGgsXG4gICAgbGVuOiAxLFxuICAgIHRwOiAnQlInXG4gIH0pO1xuICBjb250ZW50LnR4dCArPSAnICc7XG5cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG4vKipcbiAqIEdpdmVuIERyYWZ0eSBkb2N1bWVudCwgY29udmVydCBpdCB0byBIVE1MLlxuICogTm8gYXR0ZW1wdCBpcyBtYWRlIHRvIHN0cmlwIHByZS1leGlzdGluZyBodG1sIG1hcmt1cC5cbiAqIFRoaXMgaXMgcG90ZW50aWFsbHkgdW5zYWZlIGJlY2F1c2UgPGNvZGU+Y29udGVudC50eHQ8L2NvZGU+IG1heSBjb250YWluIG1hbGljaW91cyBIVE1MXG4gKiBtYXJrdXAuXG4gKiBAbWVtYmVyb2YgVGlub2RlLkRyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7RHJhZnR5fSBkb2MgLSBkb2N1bWVudCB0byBjb252ZXJ0LlxuICpcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEhUTUwtcmVwcmVzZW50YXRpb24gb2YgY29udGVudC5cbiAqL1xuRHJhZnR5LlVOU0FGRV90b0hUTUwgPSBmdW5jdGlvbihkb2MpIHtcbiAgbGV0IHRyZWUgPSBkcmFmdHlUb1RyZWUoZG9jKTtcbiAgY29uc3QgaHRtbEZvcm1hdHRlciA9IGZ1bmN0aW9uKHR5cGUsIGRhdGEsIHZhbHVlcykge1xuICAgIGNvbnN0IHRhZyA9IERFQ09SQVRPUlNbdHlwZV07XG4gICAgbGV0IHJlc3VsdCA9IHZhbHVlcyA/IHZhbHVlcy5qb2luKCcnKSA6ICcnO1xuICAgIGlmICh0YWcpIHtcbiAgICAgIHJlc3VsdCA9IHRhZy5vcGVuKGRhdGEpICsgcmVzdWx0ICsgdGFnLmNsb3NlKGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICByZXR1cm4gdHJlZUJvdHRvbVVwKHRyZWUsIGh0bWxGb3JtYXR0ZXIsIDApO1xufVxuXG4vKipcbiAqIENhbGxiYWNrIGZvciBhcHBseWluZyBjdXN0b20gZm9ybWF0dGluZyB0byBhIERyYWZ0eSBkb2N1bWVudC5cbiAqIENhbGxlZCBvbmNlIGZvciBlYWNoIHN0eWxlIHNwYW4uXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQGNhbGxiYWNrIEZvcm1hdHRlclxuICogQHBhcmFtIHtzdHJpbmd9IHN0eWxlIC0gc3R5bGUgY29kZSBzdWNoIGFzIFwiU1RcIiBvciBcIklNXCIuXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIGVudGl0eSdzIGRhdGEuXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWVzIC0gcG9zc2libHkgc3R5bGVkIHN1YnNwYW5zIGNvbnRhaW5lZCBpbiB0aGlzIHN0eWxlIHNwYW4uXG4gKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBpbmRleCBvZiB0aGUgZWxlbWVudCBndWFyYW50ZWVkIHRvIGJlIHVuaXF1ZS5cbiAqL1xuXG4vKipcbiAqIENvbnZlcnQgRHJhZnR5IGRvY3VtZW50IHRvIGEgcmVwcmVzZW50YXRpb24gc3VpdGFibGUgZm9yIGRpc3BsYXkuXG4gKiBUaGUgPGNvZGU+Y29udGV4dDwvY29kZT4gbWF5IGV4cG9zZSBhIGZ1bmN0aW9uIDxjb2RlPmdldEZvcm1hdHRlcihzdHlsZSk8L2NvZGU+LiBJZiBpdCdzIGF2YWlsYWJsZVxuICogaXQgd2lsbCBjYWxsIGl0IHRvIG9idGFpbiBhIDxjb2RlPmZvcm1hdHRlcjwvY29kZT4gZm9yIGEgc3VidHJlZSBvZiBzdHlsZXMgdW5kZXIgdGhlIDxjb2RlPnN0eWxlPC9jb2RlPi5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eXxPYmplY3R9IGNvbnRlbnQgLSBEcmFmdHkgZG9jdW1lbnQgdG8gdHJhbnNmb3JtLlxuICogQHBhcmFtIHtGb3JtYXR0ZXJ9IGZvcm1hdHRlciAtIGNhbGxiYWNrIHdoaWNoIGZvcm1hdHMgaW5kaXZpZHVhbCBlbGVtZW50cy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IC0gY29udGV4dCBwcm92aWRlZCB0byBmb3JtYXR0ZXIgYXMgPGNvZGU+dGhpczwvY29kZT4uXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSB0cmFuc2Zvcm1lZCBvYmplY3RcbiAqL1xuRHJhZnR5LmZvcm1hdCA9IGZ1bmN0aW9uKG9yaWdpbmFsLCBmb3JtYXR0ZXIsIGNvbnRleHQpIHtcbiAgcmV0dXJuIHRyZWVCb3R0b21VcChkcmFmdHlUb1RyZWUob3JpZ2luYWwpLCBmb3JtYXR0ZXIsIDAsIFtdLCBjb250ZXh0KTtcbn1cblxuLyoqXG4gKiBTaG9ydGVuIERyYWZ0eSBkb2N1bWVudCBtYWtpbmcgdGhlIGRyYWZ0eSB0ZXh0IG5vIGxvbmdlciB0aGFuIHRoZSBsaW1pdC5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eXxzdHJpbmd9IG9yaWdpbmFsIC0gRHJhZnR5IG9iamVjdCB0byBzaG9ydGVuLlxuICogQHBhcmFtIHtudW1iZXJ9IGxpbWl0IC0gbGVuZ3RoIGluIGNoYXJhY3JldHMgdG8gc2hvcnRlbiB0by5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gbGlnaHQgLSByZW1vdmUgaGVhdnkgZGF0YSBmcm9tIGVudGl0aWVzLlxuICogQHJldHVybnMgbmV3IHNob3J0ZW5lZCBEcmFmdHkgb2JqZWN0IGxlYXZpbmcgdGhlIG9yaWdpbmFsIGludGFjdC5cbiAqL1xuRHJhZnR5LnNob3J0ZW4gPSBmdW5jdGlvbihvcmlnaW5hbCwgbGltaXQsIGxpZ2h0KSB7XG4gIGxldCB0cmVlID0gZHJhZnR5VG9UcmVlKG9yaWdpbmFsKTtcbiAgdHJlZSA9IHNob3J0ZW5UcmVlKHRyZWUsIGxpbWl0LCAn4oCmJyk7XG4gIGlmICh0cmVlICYmIGxpZ2h0KSB7XG4gICAgdHJlZSA9IGxpZ2h0RW50aXR5KHRyZWUpO1xuICB9XG4gIHJldHVybiB0cmVlVG9EcmFmdHkoe30sIHRyZWUsIFtdKTtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gRHJhZnR5IGRvYyBmb3IgZm9yd2FyZGluZzogc3RyaXAgbGVhZGluZyBAbWVudGlvbiBhbmQgYW55IGxlYWRpbmcgbGluZSBicmVha3Mgb3Igd2hpdGVzcGFjZS5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eXxzdHJpbmd9IG9yaWdpbmFsIC0gRHJhZnR5IG9iamVjdCB0byBzaG9ydGVuLlxuICogQHJldHVybnMgY29udmVydGVkIERyYWZ0eSBvYmplY3QgbGVhdmluZyB0aGUgb3JpZ2luYWwgaW50YWN0LlxuICovXG5EcmFmdHkuZm9yd2FyZGVkQ29udGVudCA9IGZ1bmN0aW9uKG9yaWdpbmFsKSB7XG4gIGxldCB0cmVlID0gZHJhZnR5VG9UcmVlKG9yaWdpbmFsKTtcbiAgY29uc3Qgcm1NZW50aW9uID0gZnVuY3Rpb24obm9kZSkge1xuICAgIGlmIChub2RlLnR5cGUgPT0gJ01OJykge1xuICAgICAgaWYgKCFub2RlLnBhcmVudCB8fCAhbm9kZS5wYXJlbnQudHlwZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbiAgLy8gU3RyaXAgbGVhZGluZyBtZW50aW9uLlxuICB0cmVlID0gdHJlZVRvcERvd24odHJlZSwgcm1NZW50aW9uKTtcbiAgLy8gUmVtb3ZlIGxlYWRpbmcgd2hpdGVzcGFjZS5cbiAgdHJlZSA9IGxUcmltKHRyZWUpO1xuICAvLyBDb252ZXJ0IGJhY2sgdG8gRHJhZnR5LlxuICByZXR1cm4gdHJlZVRvRHJhZnR5KHt9LCB0cmVlLCBbXSk7XG59XG5cbi8qKlxuICogUHJlcGFyZSBEcmFmdHkgZG9jIGZvciB3cmFwcGluZyBpbnRvIFFRIGFzIGEgcmVwbHk6XG4gKiAgLSBSZXBsYWNlIGZvcndhcmRpbmcgbWVudGlvbiB3aXRoIHN5bWJvbCAn4p6mJyBhbmQgcmVtb3ZlIGRhdGEgKFVJRCkuXG4gKiAgLSBSZW1vdmUgcXVvdGVkIHRleHQgY29tcGxldGVseS5cbiAqICAtIFJlcGxhY2UgbGluZSBicmVha3Mgd2l0aCBzcGFjZXMuXG4gKiAgLSBTdHJpcCBlbnRpdGllcyBvZiBoZWF2eSBjb250ZW50LlxuICogIC0gTW92ZSBhdHRhY2htZW50cyB0byB0aGUgZW5kIG9mIHRoZSBkb2N1bWVudC5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eXxzdHJpbmd9IG9yaWdpbmFsIC0gRHJhZnR5IG9iamVjdCB0byBzaG9ydGVuLlxuICogQHBhcmFtIHtudW1iZXJ9IGxpbWl0IC0gbGVuZ3RoIGluIGNoYXJhY3RlcnMgdG8gc2hvcnRlbiB0by5cbiAqIEByZXR1cm5zIGNvbnZlcnRlZCBEcmFmdHkgb2JqZWN0IGxlYXZpbmcgdGhlIG9yaWdpbmFsIGludGFjdC5cbiAqL1xuRHJhZnR5LnJlcGx5Q29udGVudCA9IGZ1bmN0aW9uKG9yaWdpbmFsLCBsaW1pdCkge1xuICBjb25zdCBjb252TU5uUVFuQlIgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgaWYgKG5vZGUudHlwZSA9PSAnUVEnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKG5vZGUudHlwZSA9PSAnTU4nKSB7XG4gICAgICBpZiAoKCFub2RlLnBhcmVudCB8fCAhbm9kZS5wYXJlbnQudHlwZSkgJiYgKG5vZGUudGV4dCB8fCAnJykuc3RhcnRzV2l0aCgn4p6mJykpIHtcbiAgICAgICAgbm9kZS50ZXh0ID0gJ+Kepic7XG4gICAgICAgIGRlbGV0ZSBub2RlLmNoaWxkcmVuO1xuICAgICAgICBkZWxldGUgbm9kZS5kYXRhO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobm9kZS50eXBlID09ICdCUicpIHtcbiAgICAgIG5vZGUudGV4dCA9ICcgJztcbiAgICAgIGRlbGV0ZSBub2RlLnR5cGU7XG4gICAgICBkZWxldGUgbm9kZS5jaGlsZHJlbjtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBsZXQgdHJlZSA9IGRyYWZ0eVRvVHJlZShvcmlnaW5hbCk7XG4gIGlmICghdHJlZSkge1xuICAgIHJldHVybiBvcmlnaW5hbDtcbiAgfVxuXG4gIC8vIFN0cmlwIGxlYWRpbmcgbWVudGlvbi5cbiAgdHJlZSA9IHRyZWVUb3BEb3duKHRyZWUsIGNvbnZNTm5RUW5CUik7XG4gIC8vIE1vdmUgYXR0YWNobWVudHMgdG8gdGhlIGVuZCBvZiB0aGUgZG9jLlxuICB0cmVlID0gYXR0YWNobWVudHNUb0VuZCh0cmVlLCBNQVhfUFJFVklFV19BVFRBQ0hNRU5UUyk7XG4gIC8vIFNob3J0ZW4gdGhlIGRvYy5cbiAgdHJlZSA9IHNob3J0ZW5UcmVlKHRyZWUsIGxpbWl0LCAn4oCmJyk7XG4gIC8vIFN0cmlwIGhlYXZ5IGVsZW1lbnRzIGV4Y2VwdCBJTS5kYXRhWyd2YWwnXSAoaGF2ZSB0byBrZWVwIHRoZW0gdG8gZ2VuZXJhdGUgcHJldmlld3MgbGF0ZXIpLlxuICB0cmVlID0gbGlnaHRFbnRpdHkodHJlZSwgbm9kZSA9PiAobm9kZS50eXBlID09ICdJTScgPyBbJ3ZhbCddIDogbnVsbCkpO1xuICAvLyBDb252ZXJ0IGJhY2sgdG8gRHJhZnR5LlxuICByZXR1cm4gdHJlZVRvRHJhZnR5KHt9LCB0cmVlLCBbXSk7XG59XG5cblxuLyoqXG4gKiBHZW5lcmF0ZSBkcmFmdHkgcHJldmlldzpcbiAqICAtIFNob3J0ZW4gdGhlIGRvY3VtZW50LlxuICogIC0gU3RyaXAgYWxsIGhlYXZ5IGVudGl0eSBkYXRhIGxlYXZpbmcganVzdCBpbmxpbmUgc3R5bGVzIGFuZCBlbnRpdHkgcmVmZXJlbmNlcy5cbiAqICAtIFJlcGxhY2UgbGluZSBicmVha3Mgd2l0aCBzcGFjZXMuXG4gKiAgLSBSZXBsYWNlIGNvbnRlbnQgb2YgUVEgd2l0aCBhIHNwYWNlLlxuICogIC0gUmVwbGFjZSBmb3J3YXJkaW5nIG1lbnRpb24gd2l0aCBzeW1ib2wgJ+KepicuXG4gKiBtb3ZlIGFsbCBhdHRhY2htZW50cyB0byB0aGUgZW5kIG9mIHRoZSBkb2N1bWVudCBhbmQgbWFrZSB0aGVtIHZpc2libGUuXG4gKiBUaGUgPGNvZGU+Y29udGV4dDwvY29kZT4gbWF5IGV4cG9zZSBhIGZ1bmN0aW9uIDxjb2RlPmdldEZvcm1hdHRlcihzdHlsZSk8L2NvZGU+LiBJZiBpdCdzIGF2YWlsYWJsZVxuICogaXQgd2lsbCBjYWxsIGl0IHRvIG9idGFpbiBhIDxjb2RlPmZvcm1hdHRlcjwvY29kZT4gZm9yIGEgc3VidHJlZSBvZiBzdHlsZXMgdW5kZXIgdGhlIDxjb2RlPnN0eWxlPC9jb2RlPi5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eXxzdHJpbmd9IG9yaWdpbmFsIC0gRHJhZnR5IG9iamVjdCB0byBzaG9ydGVuLlxuICogQHBhcmFtIHtudW1iZXJ9IGxpbWl0IC0gbGVuZ3RoIGluIGNoYXJhY3RlcnMgdG8gc2hvcnRlbiB0by5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yd2FyZGluZyAtIHRoaXMgYSBmb3J3YXJkaW5nIG1lc3NhZ2UgcHJldmlldy5cbiAqIEByZXR1cm5zIG5ldyBzaG9ydGVuZWQgRHJhZnR5IG9iamVjdCBsZWF2aW5nIHRoZSBvcmlnaW5hbCBpbnRhY3QuXG4gKi9cbkRyYWZ0eS5wcmV2aWV3ID0gZnVuY3Rpb24ob3JpZ2luYWwsIGxpbWl0LCBmb3J3YXJkaW5nKSB7XG4gIGxldCB0cmVlID0gZHJhZnR5VG9UcmVlKG9yaWdpbmFsKTtcblxuICAvLyBNb3ZlIGF0dGFjaG1lbnRzIHRvIHRoZSBlbmQuXG4gIHRyZWUgPSBhdHRhY2htZW50c1RvRW5kKHRyZWUsIE1BWF9QUkVWSUVXX0FUVEFDSE1FTlRTKTtcblxuICAvLyBDb252ZXJ0IGxlYWRpbmcgbWVudGlvbiB0byAn4p6mJyBhbmQgcmVwbGFjZSBRUSBhbmQgQlIgd2l0aCBhIHNwYWNlICcgJy5cbiAgY29uc3QgY29udk1OblFRbkJSID0gZnVuY3Rpb24obm9kZSkge1xuICAgIGlmIChub2RlLnR5cGUgPT0gJ01OJykge1xuICAgICAgaWYgKCghbm9kZS5wYXJlbnQgfHwgIW5vZGUucGFyZW50LnR5cGUpICYmIChub2RlLnRleHQgfHwgJycpLnN0YXJ0c1dpdGgoJ+KepicpKSB7XG4gICAgICAgIG5vZGUudGV4dCA9ICfinqYnO1xuICAgICAgICBkZWxldGUgbm9kZS5jaGlsZHJlbjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5vZGUudHlwZSA9PSAnUVEnKSB7XG4gICAgICBub2RlLnRleHQgPSAnICc7XG4gICAgICBkZWxldGUgbm9kZS5jaGlsZHJlbjtcbiAgICB9IGVsc2UgaWYgKG5vZGUudHlwZSA9PSAnQlInKSB7XG4gICAgICBub2RlLnRleHQgPSAnICc7XG4gICAgICBkZWxldGUgbm9kZS5jaGlsZHJlbjtcbiAgICAgIGRlbGV0ZSBub2RlLnR5cGU7XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xuICB9XG4gIHRyZWUgPSB0cmVlVG9wRG93bih0cmVlLCBjb252TU5uUVFuQlIpO1xuXG4gIHRyZWUgPSBzaG9ydGVuVHJlZSh0cmVlLCBsaW1pdCwgJ+KApicpO1xuICBpZiAoZm9yd2FyZGluZykge1xuICAgIC8vIEtlZXAgSU0gZGF0YSBmb3IgcHJldmlldy5cbiAgICB0cmVlID0gbGlnaHRFbnRpdHkodHJlZSwgbm9kZSA9PiAobm9kZS50eXBlID09ICdJTScgPyBbJ3ZhbCddIDogbnVsbCkpO1xuICB9IGVsc2Uge1xuICAgIHRyZWUgPSBsaWdodEVudGl0eSh0cmVlKTtcbiAgfVxuXG4gIC8vIENvbnZlcnQgYmFjayB0byBEcmFmdHkuXG4gIHJldHVybiB0cmVlVG9EcmFmdHkoe30sIHRyZWUsIFtdKTtcbn1cblxuLyoqXG4gKiBHaXZlbiBEcmFmdHkgZG9jdW1lbnQsIGNvbnZlcnQgaXQgdG8gcGxhaW4gdGV4dC5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eX0gY29udGVudCAtIGRvY3VtZW50IHRvIGNvbnZlcnQgdG8gcGxhaW4gdGV4dC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IHBsYWluLXRleHQgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRyYWZ0eSBkb2N1bWVudC5cbiAqL1xuRHJhZnR5LnRvUGxhaW5UZXh0ID0gZnVuY3Rpb24oY29udGVudCkge1xuICByZXR1cm4gdHlwZW9mIGNvbnRlbnQgPT0gJ3N0cmluZycgPyBjb250ZW50IDogY29udGVudC50eHQ7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIGRvY3VtZW50IGhhcyBubyBtYXJrdXAgYW5kIG5vIGVudGl0aWVzLlxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7RHJhZnR5fSBjb250ZW50IC0gY29udGVudCB0byBjaGVjayBmb3IgcHJlc2VuY2Ugb2YgbWFya3VwLlxuICogQHJldHVybnMgPGNvZGU+dHJ1ZTwvY29kZT4gaXMgY29udGVudCBpcyBwbGFpbiB0ZXh0LCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICovXG5EcmFmdHkuaXNQbGFpblRleHQgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHJldHVybiB0eXBlb2YgY29udGVudCA9PSAnc3RyaW5nJyB8fCAhKGNvbnRlbnQuZm10IHx8IGNvbnRlbnQuZW50KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIG9iamVjdCByZXByZXNldHMgaXMgYSB2YWxpZCBEcmFmdHkgZG9jdW1lbnQuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl9IGNvbnRlbnQgLSBjb250ZW50IHRvIGNoZWNrIGZvciB2YWxpZGl0eS5cbiAqIEByZXR1cm5zIDxjb2RlPnRydWU8L2NvZGU+IGlzIGNvbnRlbnQgaXMgdmFsaWQsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gKi9cbkRyYWZ0eS5pc1ZhbGlkID0gZnVuY3Rpb24oY29udGVudCkge1xuICBpZiAoIWNvbnRlbnQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCB7XG4gICAgdHh0LFxuICAgIGZtdCxcbiAgICBlbnRcbiAgfSA9IGNvbnRlbnQ7XG5cbiAgaWYgKCF0eHQgJiYgdHh0ICE9PSAnJyAmJiAhZm10ICYmICFlbnQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCB0eHRfdHlwZSA9IHR5cGVvZiB0eHQ7XG4gIGlmICh0eHRfdHlwZSAhPSAnc3RyaW5nJyAmJiB0eHRfdHlwZSAhPSAndW5kZWZpbmVkJyAmJiB0eHQgIT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIGZtdCAhPSAndW5kZWZpbmVkJyAmJiAhQXJyYXkuaXNBcnJheShmbXQpICYmIGZtdCAhPT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZW50ICE9ICd1bmRlZmluZWQnICYmICFBcnJheS5pc0FycmF5KGVudCkgJiYgZW50ICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBkcmFmdHkgZG9jdW1lbnQgaGFzIGF0dGFjaG1lbnRzOiBzdHlsZSBFWCBhbmQgb3V0c2lkZSBvZiBub3JtYWwgcmVuZGVyaW5nIGZsb3csXG4gKiBpLmUuIDxjb2RlPmF0ID0gLTE8L2NvZGU+LlxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7RHJhZnR5fSBjb250ZW50IC0gZG9jdW1lbnQgdG8gY2hlY2sgZm9yIGF0dGFjaG1lbnRzLlxuICogQHJldHVybnMgPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlcmUgYXJlIGF0dGFjaG1lbnRzLlxuICovXG5EcmFmdHkuaGFzQXR0YWNobWVudHMgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShjb250ZW50LmZtdCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yIChsZXQgaSBpbiBjb250ZW50LmZtdCkge1xuICAgIGNvbnN0IGZtdCA9IGNvbnRlbnQuZm10W2ldO1xuICAgIGlmIChmbXQgJiYgZm10LmF0IDwgMCkge1xuICAgICAgY29uc3QgZW50ID0gY29udGVudC5lbnRbZm10LmtleSB8IDBdO1xuICAgICAgcmV0dXJuIGVudCAmJiBlbnQudHAgPT0gJ0VYJyAmJiBlbnQuZGF0YTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENhbGxiYWNrIGZvciBhcHBseWluZyBjdXN0b20gZm9ybWF0dGluZy90cmFuc2Zvcm1hdGlvbiB0byBhIERyYWZ0eSBkb2N1bWVudC5cbiAqIENhbGxlZCBvbmNlIGZvciBlYWNoIGVudGl0eS5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAY2FsbGJhY2sgRW50aXR5Q2FsbGJhY2tcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIGVudGl0eSBkYXRhLlxuICogQHBhcmFtIHtzdHJpbmd9IGVudGl0eSB0eXBlLlxuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGVudGl0eSdzIGluZGV4IGluIGBjb250ZW50LmVudGAuXG4gKi9cblxuLyoqXG4gKiBFbnVtZXJhdGUgYXR0YWNobWVudHM6IHN0eWxlIEVYIGFuZCBvdXRzaWRlIG9mIG5vcm1hbCByZW5kZXJpbmcgZmxvdywgaS5lLiA8Y29kZT5hdCA9IC0xPC9jb2RlPi5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eX0gY29udGVudCAtIGRvY3VtZW50IHRvIHByb2Nlc3MgZm9yIGF0dGFjaG1lbnRzLlxuICogQHBhcmFtIHtFbnRpdHlDYWxsYmFja30gY2FsbGJhY2sgLSBjYWxsYmFjayB0byBjYWxsIGZvciBlYWNoIGF0dGFjaG1lbnQuXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIHZhbHVlIG9mIFwidGhpc1wiIGZvciBjYWxsYmFjay5cbiAqL1xuRHJhZnR5LmF0dGFjaG1lbnRzID0gZnVuY3Rpb24oY29udGVudCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGNvbnRlbnQuZm10KSkge1xuICAgIHJldHVybjtcbiAgfVxuICBsZXQgaSA9IDA7XG4gIGNvbnRlbnQuZm10LmZvckVhY2goZm10ID0+IHtcbiAgICBpZiAoZm10ICYmIGZtdC5hdCA8IDApIHtcbiAgICAgIGNvbnN0IGVudCA9IGNvbnRlbnQuZW50W2ZtdC5rZXkgfCAwXTtcbiAgICAgIGlmIChlbnQgJiYgZW50LnRwID09ICdFWCcgJiYgZW50LmRhdGEpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbChjb250ZXh0LCBlbnQuZGF0YSwgaSsrLCAnRVgnKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBkcmFmdHkgZG9jdW1lbnQgaGFzIGVudGl0aWVzLlxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7RHJhZnR5fSBjb250ZW50IC0gZG9jdW1lbnQgdG8gY2hlY2sgZm9yIGVudGl0aWVzLlxuICogQHJldHVybnMgPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlcmUgYXJlIGVudGl0aWVzLlxuICovXG5EcmFmdHkuaGFzRW50aXRpZXMgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHJldHVybiBjb250ZW50LmVudCAmJiBjb250ZW50LmVudC5sZW5ndGggPiAwO1xufVxuXG4vKipcbiAqIEVudW1lcmF0ZSBlbnRpdGllcy5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge0RyYWZ0eX0gY29udGVudCAtIGRvY3VtZW50IHdpdGggZW50aXRpZXMgdG8gZW51bWVyYXRlLlxuICogQHBhcmFtIHtFbnRpdHlDYWxsYmFja30gY2FsbGJhY2sgLSBjYWxsYmFjayB0byBjYWxsIGZvciBlYWNoIGVudGl0eS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IC0gdmFsdWUgb2YgXCJ0aGlzXCIgZm9yIGNhbGxiYWNrLlxuICovXG5EcmFmdHkuZW50aXRpZXMgPSBmdW5jdGlvbihjb250ZW50LCBjYWxsYmFjaywgY29udGV4dCkge1xuICBpZiAoY29udGVudC5lbnQgJiYgY29udGVudC5lbnQubGVuZ3RoID4gMCkge1xuICAgIGZvciAobGV0IGkgaW4gY29udGVudC5lbnQpIHtcbiAgICAgIGlmIChjb250ZW50LmVudFtpXSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKGNvbnRleHQsIGNvbnRlbnQuZW50W2ldLmRhdGEsIGksIGNvbnRlbnQuZW50W2ldLnRwKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmUgdW5yZWNvZ25pemVkIGZpZWxkcyBmcm9tIGVudGl0eSBkYXRhXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtEcmFmdHl9IGNvbnRlbnQgLSBkb2N1bWVudCB3aXRoIGVudGl0aWVzIHRvIGVudW1lcmF0ZS5cbiAqIEByZXR1cm5zIGNvbnRlbnQuXG4gKi9cbkRyYWZ0eS5zYW5pdGl6ZUVudGl0aWVzID0gZnVuY3Rpb24oY29udGVudCkge1xuICBpZiAoY29udGVudCAmJiBjb250ZW50LmVudCAmJiBjb250ZW50LmVudC5sZW5ndGggPiAwKSB7XG4gICAgZm9yIChsZXQgaSBpbiBjb250ZW50LmVudCkge1xuICAgICAgY29uc3QgZW50ID0gY29udGVudC5lbnRbaV07XG4gICAgICBpZiAoZW50ICYmIGVudC5kYXRhKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBjb3B5RW50RGF0YShlbnQuZGF0YSk7XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgY29udGVudC5lbnRbaV0uZGF0YSA9IGRhdGE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIGNvbnRlbnQuZW50W2ldLmRhdGE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbi8qKlxuICogR2l2ZW4gdGhlIGVudGl0eSwgZ2V0IFVSTCB3aGljaCBjYW4gYmUgdXNlZCBmb3IgZG93bmxvYWRpbmdcbiAqIGVudGl0eSBkYXRhLlxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbnREYXRhIC0gZW50aXR5LmRhdGEgdG8gZ2V0IHRoZSBVUmwgZnJvbS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFVSTCB0byBkb3dubG9hZCBlbnRpdHkgZGF0YSBvciA8Y29kZT5udWxsPC9jb2RlPi5cbiAqL1xuRHJhZnR5LmdldERvd25sb2FkVXJsID0gZnVuY3Rpb24oZW50RGF0YSkge1xuICBsZXQgdXJsID0gbnVsbDtcbiAgaWYgKGVudERhdGEubWltZSAhPSBKU09OX01JTUVfVFlQRSAmJiBlbnREYXRhLnZhbCkge1xuICAgIHVybCA9IGJhc2U2NHRvT2JqZWN0VXJsKGVudERhdGEudmFsLCBlbnREYXRhLm1pbWUsIERyYWZ0eS5sb2dnZXIpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBlbnREYXRhLnJlZiA9PSAnc3RyaW5nJykge1xuICAgIHVybCA9IGVudERhdGEucmVmO1xuICB9XG4gIHJldHVybiB1cmw7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIGVudGl0eSBkYXRhIGlzIG5vdCByZWFkeSBmb3Igc2VuZGluZywgc3VjaCBhcyBiZWluZyB1cGxvYWRlZCB0byB0aGUgc2VydmVyLlxuICogQG1lbWJlcm9mIERyYWZ0eVxuICogQHN0YXRpY1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbnRpdHkuZGF0YSB0byBnZXQgdGhlIFVSbCBmcm9tLlxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdXBsb2FkIGlzIGluIHByb2dyZXNzLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbkRyYWZ0eS5pc1Byb2Nlc3NpbmcgPSBmdW5jdGlvbihlbnREYXRhKSB7XG4gIHJldHVybiAhIWVudERhdGEuX3Byb2Nlc3Npbmc7XG59XG5cbi8qKlxuICogR2l2ZW4gdGhlIGVudGl0eSwgZ2V0IFVSTCB3aGljaCBjYW4gYmUgdXNlZCBmb3IgcHJldmlld2luZ1xuICogdGhlIGVudGl0eS5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZW50aXR5LmRhdGEgdG8gZ2V0IHRoZSBVUmwgZnJvbS5cbiAqXG4gKiBAcmV0dXJucyB7c3RyaW5nfSB1cmwgZm9yIHByZXZpZXdpbmcgb3IgbnVsbCBpZiBubyBzdWNoIHVybCBpcyBhdmFpbGFibGUuXG4gKi9cbkRyYWZ0eS5nZXRQcmV2aWV3VXJsID0gZnVuY3Rpb24oZW50RGF0YSkge1xuICByZXR1cm4gZW50RGF0YS52YWwgPyBiYXNlNjR0b09iamVjdFVybChlbnREYXRhLnZhbCwgZW50RGF0YS5taW1lLCBEcmFmdHkubG9nZ2VyKSA6IG51bGw7XG59XG5cbi8qKlxuICogR2V0IGFwcHJveGltYXRlIHNpemUgb2YgdGhlIGVudGl0eS5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZW50RGF0YSAtIGVudGl0eS5kYXRhIHRvIGdldCB0aGUgc2l6ZSBmb3IuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBzaXplIG9mIGVudGl0eSBkYXRhIGluIGJ5dGVzLlxuICovXG5EcmFmdHkuZ2V0RW50aXR5U2l6ZSA9IGZ1bmN0aW9uKGVudERhdGEpIHtcbiAgLy8gRWl0aGVyIHNpemUgaGludCBvciBsZW5ndGggb2YgdmFsdWUuIFRoZSB2YWx1ZSBpcyBiYXNlNjQgZW5jb2RlZCxcbiAgLy8gdGhlIGFjdHVhbCBvYmplY3Qgc2l6ZSBpcyBzbWFsbGVyIHRoYW4gdGhlIGVuY29kZWQgbGVuZ3RoLlxuICByZXR1cm4gZW50RGF0YS5zaXplID8gZW50RGF0YS5zaXplIDogZW50RGF0YS52YWwgPyAoZW50RGF0YS52YWwubGVuZ3RoICogMC43NSkgfCAwIDogMDtcbn1cblxuLyoqXG4gKiBHZXQgZW50aXR5IG1pbWUgdHlwZS5cbiAqIEBtZW1iZXJvZiBEcmFmdHlcbiAqIEBzdGF0aWNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZW50RGF0YSAtIGVudGl0eS5kYXRhIHRvIGdldCB0aGUgdHlwZSBmb3IuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBtaW1lIHR5cGUgb2YgZW50aXR5LlxuICovXG5EcmFmdHkuZ2V0RW50aXR5TWltZVR5cGUgPSBmdW5jdGlvbihlbnREYXRhKSB7XG4gIHJldHVybiBlbnREYXRhLm1pbWUgfHwgJ3RleHQvcGxhaW4nO1xufVxuXG4vKipcbiAqIEdldCBIVE1MIHRhZyBmb3IgYSBnaXZlbiB0d28tbGV0dGVyIHN0eWxlIG5hbWUuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0eWxlIC0gdHdvLWxldHRlciBzdHlsZSwgbGlrZSBTVCBvciBMTi5cbiAqXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBIVE1MIHRhZyBuYW1lIGlmIHN0eWxlIGlzIGZvdW5kLCAnX1VOS04nIGlmIG5vdCBmb3VuZCwge2NvZGU6IHVuZGVmaW5lZH0gaWYgc3R5bGUgaXMgZmFsc2lzaC5cbiAqL1xuRHJhZnR5LnRhZ05hbWUgPSBmdW5jdGlvbihzdHlsZSkge1xuICByZXR1cm4gc3R5bGUgPyAoSFRNTF9UQUdTW3N0eWxlXSA/IEhUTUxfVEFHU1tzdHlsZV0ubmFtZSA6ICdfVU5LTicpIDogdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEZvciBhIGdpdmVuIGRhdGEgYnVuZGxlIGdlbmVyYXRlIGFuIG9iamVjdCB3aXRoIEhUTUwgYXR0cmlidXRlcyxcbiAqIGZvciBpbnN0YW5jZSwgZ2l2ZW4ge3VybDogXCJodHRwOi8vd3d3LmV4YW1wbGUuY29tL1wifSByZXR1cm5cbiAqIHtocmVmOiBcImh0dHA6Ly93d3cuZXhhbXBsZS5jb20vXCJ9XG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0eWxlIC0gdHdvLWxldHRlciBzdHlsZSB0byBnZW5lcmF0ZSBhdHRyaWJ1dGVzIGZvci5cbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0gZGF0YSBidW5kbGUgdG8gY29udmVydCB0byBhdHRyaWJ1dGVzXG4gKlxuICogQHJldHVybnMge09iamVjdH0gb2JqZWN0IHdpdGggSFRNTCBhdHRyaWJ1dGVzLlxuICovXG5EcmFmdHkuYXR0clZhbHVlID0gZnVuY3Rpb24oc3R5bGUsIGRhdGEpIHtcbiAgaWYgKGRhdGEgJiYgREVDT1JBVE9SU1tzdHlsZV0pIHtcbiAgICByZXR1cm4gREVDT1JBVE9SU1tzdHlsZV0ucHJvcHMoZGF0YSk7XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIERyYWZ0eSBNSU1FIHR5cGUuXG4gKiBAbWVtYmVyb2YgRHJhZnR5XG4gKiBAc3RhdGljXG4gKlxuICogQHJldHVybnMge3N0cmluZ30gY29udGVudC1UeXBlIFwidGV4dC94LWRyYWZ0eVwiLlxuICovXG5EcmFmdHkuZ2V0Q29udGVudFR5cGUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIERSQUZUWV9NSU1FX1RZUEU7XG59XG5cbi8vID09PT09PT09PT09PT09PT09XG4vLyBVdGlsaXR5IG1ldGhvZHMuXG4vLyA9PT09PT09PT09PT09PT09PVxuXG4vLyBUYWtlIGEgc3RyaW5nIGFuZCBkZWZpbmVkIGVhcmxpZXIgc3R5bGUgc3BhbnMsIHJlLWNvbXBvc2UgdGhlbSBpbnRvIGEgdHJlZSB3aGVyZSBlYWNoIGxlYWYgaXNcbi8vIGEgc2FtZS1zdHlsZSAoaW5jbHVkaW5nIHVuc3R5bGVkKSBzdHJpbmcuIEkuZS4gJ2hlbGxvICpib2xkIF9pdGFsaWNfKiBhbmQgfm1vcmV+IHdvcmxkJyAtPlxuLy8gKCdoZWxsbyAnLCAoYjogJ2JvbGQgJywgKGk6ICdpdGFsaWMnKSksICcgYW5kICcsIChzOiAnbW9yZScpLCAnIHdvcmxkJyk7XG4vL1xuLy8gVGhpcyBpcyBuZWVkZWQgaW4gb3JkZXIgdG8gY2xlYXIgbWFya3VwLCBpLmUuICdoZWxsbyAqd29ybGQqJyAtPiAnaGVsbG8gd29ybGQnIGFuZCBjb252ZXJ0XG4vLyByYW5nZXMgZnJvbSBtYXJrdXAtZWQgb2Zmc2V0cyB0byBwbGFpbiB0ZXh0IG9mZnNldHMuXG5mdW5jdGlvbiBjaHVua2lmeShsaW5lLCBzdGFydCwgZW5kLCBzcGFucykge1xuICBjb25zdCBjaHVua3MgPSBbXTtcblxuICBpZiAoc3BhbnMubGVuZ3RoID09IDApIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBmb3IgKGxldCBpIGluIHNwYW5zKSB7XG4gICAgLy8gR2V0IHRoZSBuZXh0IGNodW5rIGZyb20gdGhlIHF1ZXVlXG4gICAgY29uc3Qgc3BhbiA9IHNwYW5zW2ldO1xuXG4gICAgLy8gR3JhYiB0aGUgaW5pdGlhbCB1bnN0eWxlZCBjaHVua1xuICAgIGlmIChzcGFuLmF0ID4gc3RhcnQpIHtcbiAgICAgIGNodW5rcy5wdXNoKHtcbiAgICAgICAgdHh0OiBsaW5lLnNsaWNlKHN0YXJ0LCBzcGFuLmF0KVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gR3JhYiB0aGUgc3R5bGVkIGNodW5rLiBJdCBtYXkgaW5jbHVkZSBzdWJjaHVua3MuXG4gICAgY29uc3QgY2h1bmsgPSB7XG4gICAgICB0cDogc3Bhbi50cFxuICAgIH07XG4gICAgY29uc3QgY2hsZCA9IGNodW5raWZ5KGxpbmUsIHNwYW4uYXQgKyAxLCBzcGFuLmVuZCwgc3Bhbi5jaGlsZHJlbik7XG4gICAgaWYgKGNobGQubGVuZ3RoID4gMCkge1xuICAgICAgY2h1bmsuY2hpbGRyZW4gPSBjaGxkO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaHVuay50eHQgPSBzcGFuLnR4dDtcbiAgICB9XG4gICAgY2h1bmtzLnB1c2goY2h1bmspO1xuICAgIHN0YXJ0ID0gc3Bhbi5lbmQgKyAxOyAvLyAnKzEnIGlzIHRvIHNraXAgdGhlIGZvcm1hdHRpbmcgY2hhcmFjdGVyXG4gIH1cblxuICAvLyBHcmFiIHRoZSByZW1haW5pbmcgdW5zdHlsZWQgY2h1bmssIGFmdGVyIHRoZSBsYXN0IHNwYW5cbiAgaWYgKHN0YXJ0IDwgZW5kKSB7XG4gICAgY2h1bmtzLnB1c2goe1xuICAgICAgdHh0OiBsaW5lLnNsaWNlKHN0YXJ0LCBlbmQpXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gY2h1bmtzO1xufVxuXG4vLyBEZXRlY3Qgc3RhcnRzIGFuZCBlbmRzIG9mIGZvcm1hdHRpbmcgc3BhbnMuIFVuZm9ybWF0dGVkIHNwYW5zIGFyZVxuLy8gaWdub3JlZCBhdCB0aGlzIHN0YWdlLlxuZnVuY3Rpb24gc3Bhbm5pZnkob3JpZ2luYWwsIHJlX3N0YXJ0LCByZV9lbmQsIHR5cGUpIHtcbiAgY29uc3QgcmVzdWx0ID0gW107XG4gIGxldCBpbmRleCA9IDA7XG4gIGxldCBsaW5lID0gb3JpZ2luYWwuc2xpY2UoMCk7IC8vIG1ha2UgYSBjb3B5O1xuXG4gIHdoaWxlIChsaW5lLmxlbmd0aCA+IDApIHtcbiAgICAvLyBtYXRjaFswXTsgLy8gbWF0Y2gsIGxpa2UgJyphYmMqJ1xuICAgIC8vIG1hdGNoWzFdOyAvLyBtYXRjaCBjYXB0dXJlZCBpbiBwYXJlbnRoZXNpcywgbGlrZSAnYWJjJ1xuICAgIC8vIG1hdGNoWydpbmRleCddOyAvLyBvZmZzZXQgd2hlcmUgdGhlIG1hdGNoIHN0YXJ0ZWQuXG5cbiAgICAvLyBGaW5kIHRoZSBvcGVuaW5nIHRva2VuLlxuICAgIGNvbnN0IHN0YXJ0ID0gcmVfc3RhcnQuZXhlYyhsaW5lKTtcbiAgICBpZiAoc3RhcnQgPT0gbnVsbCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gQmVjYXVzZSBqYXZhc2NyaXB0IFJlZ0V4cCBkb2VzIG5vdCBzdXBwb3J0IGxvb2tiZWhpbmQsIHRoZSBhY3R1YWwgb2Zmc2V0IG1heSBub3QgcG9pbnRcbiAgICAvLyBhdCB0aGUgbWFya3VwIGNoYXJhY3Rlci4gRmluZCBpdCBpbiB0aGUgbWF0Y2hlZCBzdHJpbmcuXG4gICAgbGV0IHN0YXJ0X29mZnNldCA9IHN0YXJ0WydpbmRleCddICsgc3RhcnRbMF0ubGFzdEluZGV4T2Yoc3RhcnRbMV0pO1xuICAgIC8vIENsaXAgdGhlIHByb2Nlc3NlZCBwYXJ0IG9mIHRoZSBzdHJpbmcuXG4gICAgbGluZSA9IGxpbmUuc2xpY2Uoc3RhcnRfb2Zmc2V0ICsgMSk7XG4gICAgLy8gc3RhcnRfb2Zmc2V0IGlzIGFuIG9mZnNldCB3aXRoaW4gdGhlIGNsaXBwZWQgc3RyaW5nLiBDb252ZXJ0IHRvIG9yaWdpbmFsIGluZGV4LlxuICAgIHN0YXJ0X29mZnNldCArPSBpbmRleDtcbiAgICAvLyBJbmRleCBub3cgcG9pbnQgdG8gdGhlIGJlZ2lubmluZyBvZiAnbGluZScgd2l0aGluIHRoZSAnb3JpZ2luYWwnIHN0cmluZy5cbiAgICBpbmRleCA9IHN0YXJ0X29mZnNldCArIDE7XG5cbiAgICAvLyBGaW5kIHRoZSBtYXRjaGluZyBjbG9zaW5nIHRva2VuLlxuICAgIGNvbnN0IGVuZCA9IHJlX2VuZCA/IHJlX2VuZC5leGVjKGxpbmUpIDogbnVsbDtcbiAgICBpZiAoZW5kID09IG51bGwpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBsZXQgZW5kX29mZnNldCA9IGVuZFsnaW5kZXgnXSArIGVuZFswXS5pbmRleE9mKGVuZFsxXSk7XG4gICAgLy8gQ2xpcCB0aGUgcHJvY2Vzc2VkIHBhcnQgb2YgdGhlIHN0cmluZy5cbiAgICBsaW5lID0gbGluZS5zbGljZShlbmRfb2Zmc2V0ICsgMSk7XG4gICAgLy8gVXBkYXRlIG9mZnNldHNcbiAgICBlbmRfb2Zmc2V0ICs9IGluZGV4O1xuICAgIC8vIEluZGV4IG5vdyBwb2ludHMgdG8gdGhlIGJlZ2lubmluZyBvZiAnbGluZScgd2l0aGluIHRoZSAnb3JpZ2luYWwnIHN0cmluZy5cbiAgICBpbmRleCA9IGVuZF9vZmZzZXQgKyAxO1xuXG4gICAgcmVzdWx0LnB1c2goe1xuICAgICAgdHh0OiBvcmlnaW5hbC5zbGljZShzdGFydF9vZmZzZXQgKyAxLCBlbmRfb2Zmc2V0KSxcbiAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgIGF0OiBzdGFydF9vZmZzZXQsXG4gICAgICBlbmQ6IGVuZF9vZmZzZXQsXG4gICAgICB0cDogdHlwZVxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gQ29udmVydCBsaW5lYXIgYXJyYXkgb3Igc3BhbnMgaW50byBhIHRyZWUgcmVwcmVzZW50YXRpb24uXG4vLyBLZWVwIHN0YW5kYWxvbmUgYW5kIG5lc3RlZCBzcGFucywgdGhyb3cgYXdheSBwYXJ0aWFsbHkgb3ZlcmxhcHBpbmcgc3BhbnMuXG5mdW5jdGlvbiB0b1NwYW5UcmVlKHNwYW5zKSB7XG4gIGlmIChzcGFucy5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGNvbnN0IHRyZWUgPSBbc3BhbnNbMF1dO1xuICBsZXQgbGFzdCA9IHNwYW5zWzBdO1xuICBmb3IgKGxldCBpID0gMTsgaSA8IHNwYW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gS2VlcCBzcGFucyB3aGljaCBzdGFydCBhZnRlciB0aGUgZW5kIG9mIHRoZSBwcmV2aW91cyBzcGFuIG9yIHRob3NlIHdoaWNoXG4gICAgLy8gYXJlIGNvbXBsZXRlIHdpdGhpbiB0aGUgcHJldmlvdXMgc3Bhbi5cbiAgICBpZiAoc3BhbnNbaV0uYXQgPiBsYXN0LmVuZCkge1xuICAgICAgLy8gU3BhbiBpcyBjb21wbGV0ZWx5IG91dHNpZGUgb2YgdGhlIHByZXZpb3VzIHNwYW4uXG4gICAgICB0cmVlLnB1c2goc3BhbnNbaV0pO1xuICAgICAgbGFzdCA9IHNwYW5zW2ldO1xuICAgIH0gZWxzZSBpZiAoc3BhbnNbaV0uZW5kIDw9IGxhc3QuZW5kKSB7XG4gICAgICAvLyBTcGFuIGlzIGZ1bGx5IGluc2lkZSBvZiB0aGUgcHJldmlvdXMgc3Bhbi4gUHVzaCB0byBzdWJub2RlLlxuICAgICAgbGFzdC5jaGlsZHJlbi5wdXNoKHNwYW5zW2ldKTtcbiAgICB9XG4gICAgLy8gU3BhbiBjb3VsZCBwYXJ0aWFsbHkgb3ZlcmxhcCwgaWdub3JpbmcgaXQgYXMgaW52YWxpZC5cbiAgfVxuXG4gIC8vIFJlY3Vyc2l2ZWx5IHJlYXJyYW5nZSB0aGUgc3Vibm9kZXMuXG4gIGZvciAobGV0IGkgaW4gdHJlZSkge1xuICAgIHRyZWVbaV0uY2hpbGRyZW4gPSB0b1NwYW5UcmVlKHRyZWVbaV0uY2hpbGRyZW4pO1xuICB9XG5cbiAgcmV0dXJuIHRyZWU7XG59XG5cbi8vIENvbnZlcnQgZHJhZnR5IGRvY3VtZW50IHRvIGEgdHJlZS5cbmZ1bmN0aW9uIGRyYWZ0eVRvVHJlZShkb2MpIHtcbiAgaWYgKCFkb2MpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGRvYyA9ICh0eXBlb2YgZG9jID09ICdzdHJpbmcnKSA/IHtcbiAgICB0eHQ6IGRvY1xuICB9IDogZG9jO1xuICBsZXQge1xuICAgIHR4dCxcbiAgICBmbXQsXG4gICAgZW50XG4gIH0gPSBkb2M7XG5cbiAgdHh0ID0gdHh0IHx8ICcnO1xuICBpZiAoIUFycmF5LmlzQXJyYXkoZW50KSkge1xuICAgIGVudCA9IFtdO1xuICB9XG5cbiAgaWYgKCFBcnJheS5pc0FycmF5KGZtdCkgfHwgZm10Lmxlbmd0aCA9PSAwKSB7XG4gICAgaWYgKGVudC5sZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGV4dDogdHh0XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2Ugd2hlbiBhbGwgdmFsdWVzIGluIGZtdCBhcmUgMCBhbmQgZm10IHRoZXJlZm9yZSBpcyBza2lwcGVkLlxuICAgIGZtdCA9IFt7XG4gICAgICBhdDogMCxcbiAgICAgIGxlbjogMCxcbiAgICAgIGtleTogMFxuICAgIH1dO1xuICB9XG5cbiAgLy8gU2FuaXRpemUgc3BhbnMuXG4gIGNvbnN0IHNwYW5zID0gW107XG4gIGNvbnN0IGF0dGFjaG1lbnRzID0gW107XG4gIGZtdC5mb3JFYWNoKChzcGFuKSA9PiB7XG4gICAgaWYgKCFzcGFuIHx8IHR5cGVvZiBzcGFuICE9ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFbJ3VuZGVmaW5lZCcsICdudW1iZXInXS5pbmNsdWRlcyh0eXBlb2Ygc3Bhbi5hdCkpIHtcbiAgICAgIC8vIFByZXNlbnQsIGJ1dCBub24tbnVtZXJpYyAnYXQnLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIVsndW5kZWZpbmVkJywgJ251bWJlciddLmluY2x1ZGVzKHR5cGVvZiBzcGFuLmxlbikpIHtcbiAgICAgIC8vIFByZXNlbnQsIGJ1dCBub24tbnVtZXJpYyAnbGVuJy5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGF0ID0gc3Bhbi5hdCB8IDA7XG4gICAgbGV0IGxlbiA9IHNwYW4ubGVuIHwgMDtcbiAgICBpZiAobGVuIDwgMCkge1xuICAgICAgLy8gSW52YWxpZCBzcGFuIGxlbmd0aC5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQga2V5ID0gc3Bhbi5rZXkgfHwgMDtcbiAgICBpZiAoZW50Lmxlbmd0aCA+IDAgJiYgKHR5cGVvZiBrZXkgIT0gJ251bWJlcicgfHwga2V5IDwgMCB8fCBrZXkgPj0gZW50Lmxlbmd0aCkpIHtcbiAgICAgIC8vIEludmFsaWQga2V5IHZhbHVlLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChhdCA8PSAtMSkge1xuICAgICAgLy8gQXR0YWNobWVudC4gU3RvcmUgYXR0YWNobWVudHMgc2VwYXJhdGVseS5cbiAgICAgIGF0dGFjaG1lbnRzLnB1c2goe1xuICAgICAgICBzdGFydDogLTEsXG4gICAgICAgIGVuZDogMCxcbiAgICAgICAga2V5OiBrZXlcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoYXQgKyBsZW4gPiB0eHQubGVuZ3RoKSB7XG4gICAgICAvLyBTcGFuIGlzIG91dCBvZiBib3VuZHMuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFzcGFuLnRwKSB7XG4gICAgICBpZiAoZW50Lmxlbmd0aCA+IDAgJiYgKHR5cGVvZiBlbnRba2V5XSA9PSAnb2JqZWN0JykpIHtcbiAgICAgICAgc3BhbnMucHVzaCh7XG4gICAgICAgICAgc3RhcnQ6IGF0LFxuICAgICAgICAgIGVuZDogYXQgKyBsZW4sXG4gICAgICAgICAga2V5OiBrZXlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHNwYW5zLnB1c2goe1xuICAgICAgICB0eXBlOiBzcGFuLnRwLFxuICAgICAgICBzdGFydDogYXQsXG4gICAgICAgIGVuZDogYXQgKyBsZW5cbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gU29ydCBzcGFucyBmaXJzdCBieSBzdGFydCBpbmRleCAoYXNjKSB0aGVuIGJ5IGxlbmd0aCAoZGVzYyksIHRoZW4gYnkgd2VpZ2h0LlxuICBzcGFucy5zb3J0KChhLCBiKSA9PiB7XG4gICAgbGV0IGRpZmYgPSBhLnN0YXJ0IC0gYi5zdGFydDtcbiAgICBpZiAoZGlmZiAhPSAwKSB7XG4gICAgICByZXR1cm4gZGlmZjtcbiAgICB9XG4gICAgZGlmZiA9IGIuZW5kIC0gYS5lbmQ7XG4gICAgaWYgKGRpZmYgIT0gMCkge1xuICAgICAgcmV0dXJuIGRpZmY7XG4gICAgfVxuICAgIHJldHVybiBGTVRfV0VJR0hULmluZGV4T2YoYi50eXBlKSAtIEZNVF9XRUlHSFQuaW5kZXhPZihhLnR5cGUpO1xuICB9KTtcblxuICAvLyBNb3ZlIGF0dGFjaG1lbnRzIHRvIHRoZSBlbmQgb2YgdGhlIGxpc3QuXG4gIGlmIChhdHRhY2htZW50cy5sZW5ndGggPiAwKSB7XG4gICAgc3BhbnMucHVzaCguLi5hdHRhY2htZW50cyk7XG4gIH1cblxuICBzcGFucy5mb3JFYWNoKChzcGFuKSA9PiB7XG4gICAgaWYgKGVudC5sZW5ndGggPiAwICYmICFzcGFuLnR5cGUgJiYgZW50W3NwYW4ua2V5XSAmJiB0eXBlb2YgZW50W3NwYW4ua2V5XSA9PSAnb2JqZWN0Jykge1xuICAgICAgc3Bhbi50eXBlID0gZW50W3NwYW4ua2V5XS50cDtcbiAgICAgIHNwYW4uZGF0YSA9IGVudFtzcGFuLmtleV0uZGF0YTtcbiAgICB9XG5cbiAgICAvLyBJcyB0eXBlIHN0aWxsIHVuZGVmaW5lZD8gSGlkZSB0aGUgaW52YWxpZCBlbGVtZW50IVxuICAgIGlmICghc3Bhbi50eXBlKSB7XG4gICAgICBzcGFuLnR5cGUgPSAnSEQnO1xuICAgIH1cbiAgfSk7XG5cbiAgbGV0IHRyZWUgPSBzcGFuc1RvVHJlZSh7fSwgdHh0LCAwLCB0eHQubGVuZ3RoLCBzcGFucyk7XG5cbiAgLy8gRmxhdHRlbiB0cmVlIG5vZGVzLlxuICBjb25zdCBmbGF0dGVuID0gZnVuY3Rpb24obm9kZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG5vZGUuY2hpbGRyZW4pICYmIG5vZGUuY2hpbGRyZW4ubGVuZ3RoID09IDEpIHtcbiAgICAgIC8vIFVud3JhcC5cbiAgICAgIGNvbnN0IGNoaWxkID0gbm9kZS5jaGlsZHJlblswXTtcbiAgICAgIGlmICghbm9kZS50eXBlKSB7XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50O1xuICAgICAgICBub2RlID0gY2hpbGQ7XG4gICAgICAgIG5vZGUucGFyZW50ID0gcGFyZW50O1xuICAgICAgfSBlbHNlIGlmICghY2hpbGQudHlwZSAmJiAhY2hpbGQuY2hpbGRyZW4pIHtcbiAgICAgICAgbm9kZS50ZXh0ID0gY2hpbGQudGV4dDtcbiAgICAgICAgZGVsZXRlIG5vZGUuY2hpbGRyZW47XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xuICB9XG4gIHRyZWUgPSB0cmVlVG9wRG93bih0cmVlLCBmbGF0dGVuKTtcblxuICByZXR1cm4gdHJlZTtcbn1cblxuLy8gQWRkIHRyZWUgbm9kZSB0byBhIHBhcmVudCB0cmVlLlxuZnVuY3Rpb24gYWRkTm9kZShwYXJlbnQsIG4pIHtcbiAgaWYgKCFuKSB7XG4gICAgcmV0dXJuIHBhcmVudDtcbiAgfVxuXG4gIGlmICghcGFyZW50LmNoaWxkcmVuKSB7XG4gICAgcGFyZW50LmNoaWxkcmVuID0gW107XG4gIH1cblxuICAvLyBJZiB0ZXh0IGlzIHByZXNlbnQsIG1vdmUgaXQgdG8gYSBzdWJub2RlLlxuICBpZiAocGFyZW50LnRleHQpIHtcbiAgICBwYXJlbnQuY2hpbGRyZW4ucHVzaCh7XG4gICAgICB0ZXh0OiBwYXJlbnQudGV4dCxcbiAgICAgIHBhcmVudDogcGFyZW50XG4gICAgfSk7XG4gICAgZGVsZXRlIHBhcmVudC50ZXh0O1xuICB9XG5cbiAgbi5wYXJlbnQgPSBwYXJlbnQ7XG4gIHBhcmVudC5jaGlsZHJlbi5wdXNoKG4pO1xuXG4gIHJldHVybiBwYXJlbnQ7XG59XG5cbi8vIFJldHVybnMgYSB0cmVlIG9mIG5vZGVzLlxuZnVuY3Rpb24gc3BhbnNUb1RyZWUocGFyZW50LCB0ZXh0LCBzdGFydCwgZW5kLCBzcGFucykge1xuICBpZiAoIXNwYW5zIHx8IHNwYW5zLmxlbmd0aCA9PSAwKSB7XG4gICAgaWYgKHN0YXJ0IDwgZW5kKSB7XG4gICAgICBhZGROb2RlKHBhcmVudCwge1xuICAgICAgICB0ZXh0OiB0ZXh0LnN1YnN0cmluZyhzdGFydCwgZW5kKVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBwYXJlbnQ7XG4gIH1cblxuICAvLyBQcm9jZXNzIHN1YnNwYW5zLlxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNwYW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgc3BhbiA9IHNwYW5zW2ldO1xuICAgIGlmIChzcGFuLnN0YXJ0IDwgMCAmJiBzcGFuLnR5cGUgPT0gJ0VYJykge1xuICAgICAgYWRkTm9kZShwYXJlbnQsIHtcbiAgICAgICAgdHlwZTogc3Bhbi50eXBlLFxuICAgICAgICBkYXRhOiBzcGFuLmRhdGEsXG4gICAgICAgIGtleTogc3Bhbi5rZXksXG4gICAgICAgIGF0dDogdHJ1ZVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBBZGQgdW4tc3R5bGVkIHJhbmdlIGJlZm9yZSB0aGUgc3R5bGVkIHNwYW4gc3RhcnRzLlxuICAgIGlmIChzdGFydCA8IHNwYW4uc3RhcnQpIHtcbiAgICAgIGFkZE5vZGUocGFyZW50LCB7XG4gICAgICAgIHRleHQ6IHRleHQuc3Vic3RyaW5nKHN0YXJ0LCBzcGFuLnN0YXJ0KVxuICAgICAgfSk7XG4gICAgICBzdGFydCA9IHNwYW4uc3RhcnQ7XG4gICAgfVxuXG4gICAgLy8gR2V0IGFsbCBzcGFucyB3aGljaCBhcmUgd2l0aGluIHRoZSBjdXJyZW50IHNwYW4uXG4gICAgY29uc3Qgc3Vic3BhbnMgPSBbXTtcbiAgICB3aGlsZSAoaSA8IHNwYW5zLmxlbmd0aCAtIDEpIHtcbiAgICAgIGNvbnN0IGlubmVyID0gc3BhbnNbaSArIDFdO1xuICAgICAgaWYgKGlubmVyLnN0YXJ0IDwgMCkge1xuICAgICAgICAvLyBBdHRhY2htZW50cyBhcmUgaW4gdGhlIGVuZC4gU3RvcC5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2UgaWYgKGlubmVyLnN0YXJ0IDwgc3Bhbi5lbmQpIHtcbiAgICAgICAgaWYgKGlubmVyLmVuZCA8PSBzcGFuLmVuZCkge1xuICAgICAgICAgIGNvbnN0IHRhZyA9IEhUTUxfVEFHU1tpbm5lci50cF0gfHwge307XG4gICAgICAgICAgaWYgKGlubmVyLnN0YXJ0IDwgaW5uZXIuZW5kIHx8IHRhZy5pc1ZvaWQpIHtcbiAgICAgICAgICAgIC8vIFZhbGlkIHN1YnNwYW46IGNvbXBsZXRlbHkgd2l0aGluIHRoZSBjdXJyZW50IHNwYW4gYW5kXG4gICAgICAgICAgICAvLyBlaXRoZXIgbm9uLXplcm8gbGVuZ3RoIG9yIHplcm8gbGVuZ3RoIGlzIGFjY2VwdGFibGUuXG4gICAgICAgICAgICBzdWJzcGFucy5wdXNoKGlubmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgICAgICAvLyBPdmVybGFwcGluZyBzdWJzcGFucyBhcmUgaWdub3JlZC5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFBhc3QgdGhlIGVuZCBvZiB0aGUgY3VycmVudCBzcGFuLiBTdG9wLlxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGROb2RlKHBhcmVudCwgc3BhbnNUb1RyZWUoe1xuICAgICAgdHlwZTogc3Bhbi50eXBlLFxuICAgICAgZGF0YTogc3Bhbi5kYXRhLFxuICAgICAga2V5OiBzcGFuLmtleVxuICAgIH0sIHRleHQsIHN0YXJ0LCBzcGFuLmVuZCwgc3Vic3BhbnMpKTtcbiAgICBzdGFydCA9IHNwYW4uZW5kO1xuICB9XG5cbiAgLy8gQWRkIHRoZSBsYXN0IHVuZm9ybWF0dGVkIHJhbmdlLlxuICBpZiAoc3RhcnQgPCBlbmQpIHtcbiAgICBhZGROb2RlKHBhcmVudCwge1xuICAgICAgdGV4dDogdGV4dC5zdWJzdHJpbmcoc3RhcnQsIGVuZClcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBwYXJlbnQ7XG59XG5cbi8vIEFwcGVuZCBhIHRyZWUgdG8gYSBEcmFmdHkgZG9jLlxuZnVuY3Rpb24gdHJlZVRvRHJhZnR5KGRvYywgdHJlZSwga2V5bWFwKSB7XG4gIGlmICghdHJlZSkge1xuICAgIHJldHVybiBkb2M7XG4gIH1cblxuICBkb2MudHh0ID0gZG9jLnR4dCB8fCAnJztcblxuICAvLyBDaGVja3BvaW50IHRvIG1lYXN1cmUgbGVuZ3RoIG9mIHRoZSBjdXJyZW50IHRyZWUgbm9kZS5cbiAgY29uc3Qgc3RhcnQgPSBkb2MudHh0Lmxlbmd0aDtcblxuICBpZiAodHJlZS50ZXh0KSB7XG4gICAgZG9jLnR4dCArPSB0cmVlLnRleHQ7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh0cmVlLmNoaWxkcmVuKSkge1xuICAgIHRyZWUuY2hpbGRyZW4uZm9yRWFjaCgoYykgPT4ge1xuICAgICAgdHJlZVRvRHJhZnR5KGRvYywgYywga2V5bWFwKTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmICh0cmVlLnR5cGUpIHtcbiAgICBjb25zdCBsZW4gPSBkb2MudHh0Lmxlbmd0aCAtIHN0YXJ0O1xuICAgIGRvYy5mbXQgPSBkb2MuZm10IHx8IFtdO1xuICAgIGlmIChPYmplY3Qua2V5cyh0cmVlLmRhdGEgfHwge30pLmxlbmd0aCA+IDApIHtcbiAgICAgIGRvYy5lbnQgPSBkb2MuZW50IHx8IFtdO1xuICAgICAgY29uc3QgbmV3S2V5ID0gKHR5cGVvZiBrZXltYXBbdHJlZS5rZXldID09ICd1bmRlZmluZWQnKSA/IGRvYy5lbnQubGVuZ3RoIDoga2V5bWFwW3RyZWUua2V5XTtcbiAgICAgIGtleW1hcFt0cmVlLmtleV0gPSBuZXdLZXk7XG4gICAgICBkb2MuZW50W25ld0tleV0gPSB7XG4gICAgICAgIHRwOiB0cmVlLnR5cGUsXG4gICAgICAgIGRhdGE6IHRyZWUuZGF0YVxuICAgICAgfTtcbiAgICAgIGlmICh0cmVlLmF0dCkge1xuICAgICAgICAvLyBBdHRhY2htZW50LlxuICAgICAgICBkb2MuZm10LnB1c2goe1xuICAgICAgICAgIGF0OiAtMSxcbiAgICAgICAgICBsZW46IDAsXG4gICAgICAgICAga2V5OiBuZXdLZXlcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb2MuZm10LnB1c2goe1xuICAgICAgICAgIGF0OiBzdGFydCxcbiAgICAgICAgICBsZW46IGxlbixcbiAgICAgICAgICBrZXk6IG5ld0tleVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZG9jLmZtdC5wdXNoKHtcbiAgICAgICAgdHA6IHRyZWUudHlwZSxcbiAgICAgICAgYXQ6IHN0YXJ0LFxuICAgICAgICBsZW46IGxlblxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBkb2M7XG59XG5cbi8vIFRyYXZlcnNlIHRoZSB0cmVlIHRvcCBkb3duIHRyYW5zZm9ybWluZyB0aGUgbm9kZXM6IGFwcGx5IHRyYW5zZm9ybWVyIHRvIGV2ZXJ5IHRyZWUgbm9kZS5cbmZ1bmN0aW9uIHRyZWVUb3BEb3duKHNyYywgdHJhbnNmb3JtZXIsIGNvbnRleHQpIHtcbiAgaWYgKCFzcmMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBkc3QgPSB0cmFuc2Zvcm1lci5jYWxsKGNvbnRleHQsIHNyYyk7XG4gIGlmICghZHN0IHx8ICFkc3QuY2hpbGRyZW4pIHtcbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgY29uc3QgY2hpbGRyZW4gPSBbXTtcbiAgZm9yIChsZXQgaSBpbiBkc3QuY2hpbGRyZW4pIHtcbiAgICBsZXQgbiA9IGRzdC5jaGlsZHJlbltpXTtcbiAgICBpZiAobikge1xuICAgICAgbiA9IHRyZWVUb3BEb3duKG4sIHRyYW5zZm9ybWVyLCBjb250ZXh0KTtcbiAgICAgIGlmIChuKSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2gobik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGNoaWxkcmVuLmxlbmd0aCA9PSAwKSB7XG4gICAgZHN0LmNoaWxkcmVuID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICBkc3QuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgfVxuXG4gIHJldHVybiBkc3Q7XG59XG5cbi8vIFRyYXZlcnNlIHRoZSB0cmVlIGJvdHRvbS11cDogYXBwbHkgZm9ybWF0dGVyIHRvIGV2ZXJ5IG5vZGUuXG4vLyBUaGUgZm9ybWF0dGVyIG11c3QgbWFpbnRhaW4gaXRzIHN0YXRlIHRocm91Z2ggY29udGV4dC5cbmZ1bmN0aW9uIHRyZWVCb3R0b21VcChzcmMsIGZvcm1hdHRlciwgaW5kZXgsIHN0YWNrLCBjb250ZXh0KSB7XG4gIGlmICghc3JjKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAoc3RhY2sgJiYgc3JjLnR5cGUpIHtcbiAgICBzdGFjay5wdXNoKHNyYy50eXBlKTtcbiAgfVxuXG4gIGxldCB2YWx1ZXMgPSBbXTtcbiAgZm9yIChsZXQgaSBpbiBzcmMuY2hpbGRyZW4pIHtcbiAgICBjb25zdCBuID0gdHJlZUJvdHRvbVVwKHNyYy5jaGlsZHJlbltpXSwgZm9ybWF0dGVyLCBpLCBzdGFjaywgY29udGV4dCk7XG4gICAgaWYgKG4pIHtcbiAgICAgIHZhbHVlcy5wdXNoKG4pO1xuICAgIH1cbiAgfVxuICBpZiAodmFsdWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgaWYgKHNyYy50ZXh0KSB7XG4gICAgICB2YWx1ZXMgPSBbc3JjLnRleHRdO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZXMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzdGFjayAmJiBzcmMudHlwZSkge1xuICAgIHN0YWNrLnBvcCgpO1xuICB9XG5cbiAgcmV0dXJuIGZvcm1hdHRlci5jYWxsKGNvbnRleHQsIHNyYy50eXBlLCBzcmMuZGF0YSwgdmFsdWVzLCBpbmRleCwgc3RhY2spO1xufVxuXG4vLyBDbGlwIHRyZWUgdG8gdGhlIHByb3ZpZGVkIGxpbWl0LlxuZnVuY3Rpb24gc2hvcnRlblRyZWUodHJlZSwgbGltaXQsIHRhaWwpIHtcbiAgaWYgKCF0cmVlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAodGFpbCkge1xuICAgIGxpbWl0IC09IHRhaWwubGVuZ3RoO1xuICB9XG5cbiAgY29uc3Qgc2hvcnRlbmVyID0gZnVuY3Rpb24obm9kZSkge1xuICAgIGlmIChsaW1pdCA8PSAtMSkge1xuICAgICAgLy8gTGltaXQgLTEgbWVhbnMgdGhlIGRvYyB3YXMgYWxyZWFkeSBjbGlwcGVkLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKG5vZGUuYXR0KSB7XG4gICAgICAvLyBBdHRhY2htZW50cyBhcmUgdW5jaGFuZ2VkLlxuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIGlmIChsaW1pdCA9PSAwKSB7XG4gICAgICBub2RlLnRleHQgPSB0YWlsO1xuICAgICAgbGltaXQgPSAtMTtcbiAgICB9IGVsc2UgaWYgKG5vZGUudGV4dCkge1xuICAgICAgY29uc3QgbGVuID0gbm9kZS50ZXh0Lmxlbmd0aDtcbiAgICAgIGlmIChsZW4gPiBsaW1pdCkge1xuICAgICAgICBub2RlLnRleHQgPSBub2RlLnRleHQuc3Vic3RyaW5nKDAsIGxpbWl0KSArIHRhaWw7XG4gICAgICAgIGxpbWl0ID0gLTE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaW1pdCAtPSBsZW47XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgcmV0dXJuIHRyZWVUb3BEb3duKHRyZWUsIHNob3J0ZW5lcik7XG59XG5cbi8vIFN0cmlwIGhlYXZ5IGVudGl0aWVzIGZyb20gYSB0cmVlLlxuZnVuY3Rpb24gbGlnaHRFbnRpdHkodHJlZSwgYWxsb3cpIHtcbiAgY29uc3QgbGlnaHRDb3B5ID0gKG5vZGUpID0+IHtcbiAgICBjb25zdCBkYXRhID0gY29weUVudERhdGEobm9kZS5kYXRhLCB0cnVlLCBhbGxvdyA/IGFsbG93KG5vZGUpIDogbnVsbCk7XG4gICAgaWYgKGRhdGEpIHtcbiAgICAgIG5vZGUuZGF0YSA9IGRhdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBub2RlLmRhdGE7XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xuICB9XG4gIHJldHVybiB0cmVlVG9wRG93bih0cmVlLCBsaWdodENvcHkpO1xufVxuXG4vLyBSZW1vdmUgc3BhY2VzIGFuZCBicmVha3Mgb24gdGhlIGxlZnQuXG5mdW5jdGlvbiBsVHJpbSh0cmVlKSB7XG4gIGlmICh0cmVlLnR5cGUgPT0gJ0JSJykge1xuICAgIHRyZWUgPSBudWxsO1xuICB9IGVsc2UgaWYgKHRyZWUudGV4dCkge1xuICAgIGlmICghdHJlZS50eXBlKSB7XG4gICAgICB0cmVlLnRleHQgPSB0cmVlLnRleHQudHJpbVN0YXJ0KCk7XG4gICAgICBpZiAoIXRyZWUudGV4dCkge1xuICAgICAgICB0cmVlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoIXRyZWUudHlwZSAmJiB0cmVlLmNoaWxkcmVuICYmIHRyZWUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGMgPSBsVHJpbSh0cmVlLmNoaWxkcmVuWzBdKTtcbiAgICBpZiAoYykge1xuICAgICAgdHJlZS5jaGlsZHJlblswXSA9IGM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyZWUuY2hpbGRyZW4uc2hpZnQoKTtcbiAgICAgIGlmICghdHJlZS50eXBlICYmIHRyZWUuY2hpbGRyZW4ubGVuZ3RoID09IDApIHtcbiAgICAgICAgdHJlZSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0cmVlO1xufVxuXG4vLyBNb3ZlIGF0dGFjaG1lbnRzIHRvIHRoZSBlbmQuIEF0dGFjaG1lbnRzIG11c3QgYmUgYXQgdGhlIHRvcCBsZXZlbCwgbm8gbmVlZCB0byB0cmF2ZXJzZSB0aGUgdHJlZS5cbmZ1bmN0aW9uIGF0dGFjaG1lbnRzVG9FbmQodHJlZSwgbGltaXQpIHtcbiAgaWYgKCF0cmVlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAodHJlZS5hdHQpIHtcbiAgICB0cmVlLnRleHQgPSAnICc7XG4gICAgZGVsZXRlIHRyZWUuYXR0O1xuICAgIGRlbGV0ZSB0cmVlLmNoaWxkcmVuO1xuICB9IGVsc2UgaWYgKHRyZWUuY2hpbGRyZW4pIHtcbiAgICBjb25zdCBhdHRhY2htZW50cyA9IFtdO1xuICAgIGNvbnN0IGNoaWxkcmVuID0gW107XG4gICAgZm9yIChsZXQgaSBpbiB0cmVlLmNoaWxkcmVuKSB7XG4gICAgICBjb25zdCBjID0gdHJlZS5jaGlsZHJlbltpXTtcbiAgICAgIGlmIChjLmF0dCkge1xuICAgICAgICBpZiAoYXR0YWNobWVudHMubGVuZ3RoID09IGxpbWl0KSB7XG4gICAgICAgICAgLy8gVG9vIG1hbnkgYXR0YWNobWVudHMgdG8gcHJldmlldztcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYy5kYXRhWydtaW1lJ10gPT0gSlNPTl9NSU1FX1RZUEUpIHtcbiAgICAgICAgICAvLyBKU09OIGF0dGFjaG1lbnRzIGFyZSBub3Qgc2hvd24gaW4gcHJldmlldy5cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlbGV0ZSBjLmF0dDtcbiAgICAgICAgZGVsZXRlIGMuY2hpbGRyZW47XG4gICAgICAgIGMudGV4dCA9ICcgJztcbiAgICAgICAgYXR0YWNobWVudHMucHVzaChjKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2goYyk7XG4gICAgICB9XG4gICAgfVxuICAgIHRyZWUuY2hpbGRyZW4gPSBjaGlsZHJlbi5jb25jYXQoYXR0YWNobWVudHMpO1xuICB9XG4gIHJldHVybiB0cmVlO1xufVxuXG4vLyBHZXQgYSBsaXN0IG9mIGVudGl0aWVzIGZyb20gYSB0ZXh0LlxuZnVuY3Rpb24gZXh0cmFjdEVudGl0aWVzKGxpbmUpIHtcbiAgbGV0IG1hdGNoO1xuICBsZXQgZXh0cmFjdGVkID0gW107XG4gIEVOVElUWV9UWVBFUy5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICB3aGlsZSAoKG1hdGNoID0gZW50aXR5LnJlLmV4ZWMobGluZSkpICE9PSBudWxsKSB7XG4gICAgICBleHRyYWN0ZWQucHVzaCh7XG4gICAgICAgIG9mZnNldDogbWF0Y2hbJ2luZGV4J10sXG4gICAgICAgIGxlbjogbWF0Y2hbMF0ubGVuZ3RoLFxuICAgICAgICB1bmlxdWU6IG1hdGNoWzBdLFxuICAgICAgICBkYXRhOiBlbnRpdHkucGFjayhtYXRjaFswXSksXG4gICAgICAgIHR5cGU6IGVudGl0eS5uYW1lXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChleHRyYWN0ZWQubGVuZ3RoID09IDApIHtcbiAgICByZXR1cm4gZXh0cmFjdGVkO1xuICB9XG5cbiAgLy8gUmVtb3ZlIGVudGl0aWVzIGRldGVjdGVkIGluc2lkZSBvdGhlciBlbnRpdGllcywgbGlrZSAjaGFzaHRhZyBpbiBhIFVSTC5cbiAgZXh0cmFjdGVkLnNvcnQoKGEsIGIpID0+IHtcbiAgICByZXR1cm4gYS5vZmZzZXQgLSBiLm9mZnNldDtcbiAgfSk7XG5cbiAgbGV0IGlkeCA9IC0xO1xuICBleHRyYWN0ZWQgPSBleHRyYWN0ZWQuZmlsdGVyKChlbCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IChlbC5vZmZzZXQgPiBpZHgpO1xuICAgIGlkeCA9IGVsLm9mZnNldCArIGVsLmxlbjtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9KTtcblxuICByZXR1cm4gZXh0cmFjdGVkO1xufVxuXG4vLyBDb252ZXJ0IHRoZSBjaHVua3MgaW50byBmb3JtYXQgc3VpdGFibGUgZm9yIHNlcmlhbGl6YXRpb24uXG5mdW5jdGlvbiBkcmFmdGlmeShjaHVua3MsIHN0YXJ0QXQpIHtcbiAgbGV0IHBsYWluID0gJyc7XG4gIGxldCByYW5nZXMgPSBbXTtcbiAgZm9yIChsZXQgaSBpbiBjaHVua3MpIHtcbiAgICBjb25zdCBjaHVuayA9IGNodW5rc1tpXTtcbiAgICBpZiAoIWNodW5rLnR4dCkge1xuICAgICAgY29uc3QgZHJhZnR5ID0gZHJhZnRpZnkoY2h1bmsuY2hpbGRyZW4sIHBsYWluLmxlbmd0aCArIHN0YXJ0QXQpO1xuICAgICAgY2h1bmsudHh0ID0gZHJhZnR5LnR4dDtcbiAgICAgIHJhbmdlcyA9IHJhbmdlcy5jb25jYXQoZHJhZnR5LmZtdCk7XG4gICAgfVxuXG4gICAgaWYgKGNodW5rLnRwKSB7XG4gICAgICByYW5nZXMucHVzaCh7XG4gICAgICAgIGF0OiBwbGFpbi5sZW5ndGggKyBzdGFydEF0LFxuICAgICAgICBsZW46IGNodW5rLnR4dC5sZW5ndGgsXG4gICAgICAgIHRwOiBjaHVuay50cFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcGxhaW4gKz0gY2h1bmsudHh0O1xuICB9XG4gIHJldHVybiB7XG4gICAgdHh0OiBwbGFpbixcbiAgICBmbXQ6IHJhbmdlc1xuICB9O1xufVxuXG4vLyBDcmVhdGUgYSBjb3B5IG9mIGVudGl0eSBkYXRhIHdpdGggKGxpZ2h0PWZhbHNlKSBvciB3aXRob3V0IChsaWdodD10cnVlKSB0aGUgbGFyZ2UgcGF5bG9hZC5cbi8vIFRoZSBhcnJheSAnYWxsb3cnIGNvbnRhaW5zIGEgbGlzdCBvZiBmaWVsZHMgZXhlbXB0IGZyb20gc3RyaXBwaW5nLlxuZnVuY3Rpb24gY29weUVudERhdGEoZGF0YSwgbGlnaHQsIGFsbG93KSB7XG4gIGlmIChkYXRhICYmIE9iamVjdC5lbnRyaWVzKGRhdGEpLmxlbmd0aCA+IDApIHtcbiAgICBhbGxvdyA9IGFsbG93IHx8IFtdO1xuICAgIGNvbnN0IGRjID0ge307XG4gICAgQUxMT1dFRF9FTlRfRklFTERTLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgaWYgKGRhdGFba2V5XSkge1xuICAgICAgICBpZiAobGlnaHQgJiYgIWFsbG93LmluY2x1ZGVzKGtleSkgJiZcbiAgICAgICAgICAodHlwZW9mIGRhdGFba2V5XSA9PSAnc3RyaW5nJyB8fCBBcnJheS5pc0FycmF5KGRhdGFba2V5XSkpICYmXG4gICAgICAgICAgZGF0YVtrZXldLmxlbmd0aCA+IE1BWF9QUkVWSUVXX0RBVEFfU0laRSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGRhdGFba2V5XSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkY1trZXldID0gZGF0YVtrZXldO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKE9iamVjdC5lbnRyaWVzKGRjKS5sZW5ndGggIT0gMCkge1xuICAgICAgcmV0dXJuIGRjO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBEcmFmdHk7XG59XG4iLCIvKipcbiAqIEBmaWxlIFV0aWxpdGllcyBmb3IgdXBsb2FkaW5nIGFuZCBkb3dubG9hZGluZyBmaWxlcy5cbiAqXG4gKiBAY29weXJpZ2h0IDIwMTUtMjAyMiBUaW5vZGUgTExDLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7XG4gIGpzb25QYXJzZUhlbHBlclxufSBmcm9tICcuL3V0aWxzLmpzJztcblxubGV0IFhIUlByb3ZpZGVyO1xuXG4vKipcbiAqIEBjbGFzcyBMYXJnZUZpbGVIZWxwZXIgLSB1dGlsaXRpZXMgZm9yIHVwbG9hZGluZyBhbmQgZG93bmxvYWRpbmcgZmlsZXMgb3V0IG9mIGJhbmQuXG4gKiBEb24ndCBpbnN0YW50aWF0ZSB0aGlzIGNsYXNzIGRpcmVjdGx5LiBVc2Uge1Rpbm9kZS5nZXRMYXJnZUZpbGVIZWxwZXJ9IGluc3RlYWQuXG4gKiBAbWVtYmVyb2YgVGlub2RlXG4gKlxuICogQHBhcmFtIHtUaW5vZGV9IHRpbm9kZSAtIHRoZSBtYWluIFRpbm9kZSBvYmplY3QuXG4gKiBAcGFyYW0ge3N0cmluZ30gdmVyc2lvbiAtIHByb3RvY29sIHZlcnNpb24sIGkuZS4gJzAnLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYXJnZUZpbGVIZWxwZXIge1xuICBjb25zdHJ1Y3Rvcih0aW5vZGUsIHZlcnNpb24pIHtcbiAgICB0aGlzLl90aW5vZGUgPSB0aW5vZGU7XG4gICAgdGhpcy5fdmVyc2lvbiA9IHZlcnNpb247XG5cbiAgICB0aGlzLl9hcGlLZXkgPSB0aW5vZGUuX2FwaUtleTtcbiAgICB0aGlzLl9hdXRoVG9rZW4gPSB0aW5vZGUuZ2V0QXV0aFRva2VuKCk7XG4gICAgdGhpcy5fcmVxSWQgPSB0aW5vZGUuZ2V0TmV4dFVuaXF1ZUlkKCk7XG4gICAgdGhpcy54aHIgPSBuZXcgWEhSUHJvdmlkZXIoKTtcblxuICAgIC8vIFByb21pc2VcbiAgICB0aGlzLnRvUmVzb2x2ZSA9IG51bGw7XG4gICAgdGhpcy50b1JlamVjdCA9IG51bGw7XG5cbiAgICAvLyBDYWxsYmFja3NcbiAgICB0aGlzLm9uUHJvZ3Jlc3MgPSBudWxsO1xuICAgIHRoaXMub25TdWNjZXNzID0gbnVsbDtcbiAgICB0aGlzLm9uRmFpbHVyZSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgdXBsb2FkaW5nIHRoZSBmaWxlIHRvIGEgbm9uLWRlZmF1bHQgZW5kcG9pbnQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuTGFyZ2VGaWxlSGVscGVyI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVybCBhbHRlcm5hdGl2ZSBiYXNlIFVSTCBvZiB1cGxvYWQgc2VydmVyLlxuICAgKiBAcGFyYW0ge0ZpbGV8QmxvYn0gZGF0YSB0byB1cGxvYWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhdmF0YXJGb3IgdG9waWMgbmFtZSBpZiB0aGUgdXBsb2FkIHJlcHJlc2VudHMgYW4gYXZhdGFyLlxuICAgKiBAcGFyYW0ge0NhbGxiYWNrfSBvblByb2dyZXNzIGNhbGxiYWNrLiBUYWtlcyBvbmUge2Zsb2F0fSBwYXJhbWV0ZXIgMC4uMVxuICAgKiBAcGFyYW0ge0NhbGxiYWNrfSBvblN1Y2Nlc3MgY2FsbGJhY2suIENhbGxlZCB3aGVuIHRoZSBmaWxlIGlzIHN1Y2Nlc3NmdWxseSB1cGxvYWRlZC5cbiAgICogQHBhcmFtIHtDYWxsYmFja30gb25GYWlsdXJlIGNhbGxiYWNrLiBDYWxsZWQgaW4gY2FzZSBvZiBhIGZhaWx1cmUuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHRoZSB1cGxvYWQgaXMgY29tcGxldGVkL2ZhaWxlZC5cbiAgICovXG4gIHVwbG9hZFdpdGhCYXNlVXJsKGJhc2VVcmwsIGRhdGEsIGF2YXRhckZvciwgb25Qcm9ncmVzcywgb25TdWNjZXNzLCBvbkZhaWx1cmUpIHtcbiAgICBpZiAoIXRoaXMuX2F1dGhUb2tlbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTXVzdCBhdXRoZW50aWNhdGUgZmlyc3RcIik7XG4gICAgfVxuICAgIGNvbnN0IGluc3RhbmNlID0gdGhpcztcblxuICAgIGxldCB1cmwgPSBgL3Yke3RoaXMuX3ZlcnNpb259L2ZpbGUvdS9gO1xuICAgIGlmIChiYXNlVXJsKSB7XG4gICAgICBsZXQgYmFzZSA9IGJhc2VVcmw7XG4gICAgICBpZiAoYmFzZS5lbmRzV2l0aCgnLycpKSB7XG4gICAgICAgIC8vIFJlbW92aW5nIHRyYWlsaW5nIHNsYXNoLlxuICAgICAgICBiYXNlID0gYmFzZS5zbGljZSgwLCAtMSk7XG4gICAgICB9XG4gICAgICBpZiAoYmFzZS5zdGFydHNXaXRoKCdodHRwOi8vJykgfHwgYmFzZS5zdGFydHNXaXRoKCdodHRwczovLycpKSB7XG4gICAgICAgIHVybCA9IGJhc2UgKyB1cmw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgYmFzZSBVUkwgJyR7YmFzZVVybH0nYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMueGhyLm9wZW4oJ1BPU1QnLCB1cmwsIHRydWUpO1xuICAgIHRoaXMueGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtVGlub2RlLUFQSUtleScsIHRoaXMuX2FwaUtleSk7XG4gICAgdGhpcy54aHIuc2V0UmVxdWVzdEhlYWRlcignWC1UaW5vZGUtQXV0aCcsIGBUb2tlbiAke3RoaXMuX2F1dGhUb2tlbi50b2tlbn1gKTtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnRvUmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICB0aGlzLnRvUmVqZWN0ID0gcmVqZWN0O1xuICAgIH0pO1xuXG4gICAgdGhpcy5vblByb2dyZXNzID0gb25Qcm9ncmVzcztcbiAgICB0aGlzLm9uU3VjY2VzcyA9IG9uU3VjY2VzcztcbiAgICB0aGlzLm9uRmFpbHVyZSA9IG9uRmFpbHVyZTtcblxuICAgIHRoaXMueGhyLnVwbG9hZC5vbnByb2dyZXNzID0gKGUpID0+IHtcbiAgICAgIGlmIChlLmxlbmd0aENvbXB1dGFibGUgJiYgaW5zdGFuY2Uub25Qcm9ncmVzcykge1xuICAgICAgICBpbnN0YW5jZS5vblByb2dyZXNzKGUubG9hZGVkIC8gZS50b3RhbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMueGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHBrdDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBrdCA9IEpTT04ucGFyc2UodGhpcy5yZXNwb25zZSwganNvblBhcnNlSGVscGVyKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBpbnN0YW5jZS5fdGlub2RlLmxvZ2dlcihcIkVSUk9SOiBJbnZhbGlkIHNlcnZlciByZXNwb25zZSBpbiBMYXJnZUZpbGVIZWxwZXJcIiwgdGhpcy5yZXNwb25zZSk7XG4gICAgICAgIHBrdCA9IHtcbiAgICAgICAgICBjdHJsOiB7XG4gICAgICAgICAgICBjb2RlOiB0aGlzLnN0YXR1cyxcbiAgICAgICAgICAgIHRleHQ6IHRoaXMuc3RhdHVzVGV4dFxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMCkge1xuICAgICAgICBpZiAoaW5zdGFuY2UudG9SZXNvbHZlKSB7XG4gICAgICAgICAgaW5zdGFuY2UudG9SZXNvbHZlKHBrdC5jdHJsLnBhcmFtcy51cmwpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnN0YW5jZS5vblN1Y2Nlc3MpIHtcbiAgICAgICAgICBpbnN0YW5jZS5vblN1Y2Nlc3MocGt0LmN0cmwpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdHVzID49IDQwMCkge1xuICAgICAgICBpZiAoaW5zdGFuY2UudG9SZWplY3QpIHtcbiAgICAgICAgICBpbnN0YW5jZS50b1JlamVjdChuZXcgRXJyb3IoYCR7cGt0LmN0cmwudGV4dH0gKCR7cGt0LmN0cmwuY29kZX0pYCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnN0YW5jZS5vbkZhaWx1cmUpIHtcbiAgICAgICAgICBpbnN0YW5jZS5vbkZhaWx1cmUocGt0LmN0cmwpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbnN0YW5jZS5fdGlub2RlLmxvZ2dlcihcIkVSUk9SOiBVbmV4cGVjdGVkIHNlcnZlciByZXNwb25zZSBzdGF0dXNcIiwgdGhpcy5zdGF0dXMsIHRoaXMucmVzcG9uc2UpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnhoci5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKGluc3RhbmNlLnRvUmVqZWN0KSB7XG4gICAgICAgIGluc3RhbmNlLnRvUmVqZWN0KG5ldyBFcnJvcihcImZhaWxlZFwiKSk7XG4gICAgICB9XG4gICAgICBpZiAoaW5zdGFuY2Uub25GYWlsdXJlKSB7XG4gICAgICAgIGluc3RhbmNlLm9uRmFpbHVyZShudWxsKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy54aHIub25hYm9ydCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChpbnN0YW5jZS50b1JlamVjdCkge1xuICAgICAgICBpbnN0YW5jZS50b1JlamVjdChuZXcgRXJyb3IoXCJ1cGxvYWQgY2FuY2VsbGVkIGJ5IHVzZXJcIikpO1xuICAgICAgfVxuICAgICAgaWYgKGluc3RhbmNlLm9uRmFpbHVyZSkge1xuICAgICAgICBpbnN0YW5jZS5vbkZhaWx1cmUobnVsbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBmb3JtID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICBmb3JtLmFwcGVuZCgnZmlsZScsIGRhdGEpO1xuICAgICAgZm9ybS5zZXQoJ2lkJywgdGhpcy5fcmVxSWQpO1xuICAgICAgaWYgKGF2YXRhckZvcikge1xuICAgICAgICBmb3JtLnNldCgndG9waWMnLCBhdmF0YXJGb3IpO1xuICAgICAgfVxuICAgICAgdGhpcy54aHIuc2VuZChmb3JtKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmICh0aGlzLnRvUmVqZWN0KSB7XG4gICAgICAgIHRoaXMudG9SZWplY3QoZXJyKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9uRmFpbHVyZSkge1xuICAgICAgICB0aGlzLm9uRmFpbHVyZShudWxsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIC8qKlxuICAgKiBTdGFydCB1cGxvYWRpbmcgdGhlIGZpbGUgdG8gZGVmYXVsdCBlbmRwb2ludC5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZS5MYXJnZUZpbGVIZWxwZXIjXG4gICAqXG4gICAqIEBwYXJhbSB7RmlsZXxCbG9ifSBkYXRhIHRvIHVwbG9hZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXZhdGFyRm9yIHRvcGljIG5hbWUgaWYgdGhlIHVwbG9hZCByZXByZXNlbnRzIGFuIGF2YXRhci5cbiAgICogQHBhcmFtIHtDYWxsYmFja30gb25Qcm9ncmVzcyBjYWxsYmFjay4gVGFrZXMgb25lIHtmbG9hdH0gcGFyYW1ldGVyIDAuLjFcbiAgICogQHBhcmFtIHtDYWxsYmFja30gb25TdWNjZXNzIGNhbGxiYWNrLiBDYWxsZWQgd2hlbiB0aGUgZmlsZSBpcyBzdWNjZXNzZnVsbHkgdXBsb2FkZWQuXG4gICAqIEBwYXJhbSB7Q2FsbGJhY2t9IG9uRmFpbHVyZSBjYWxsYmFjay4gQ2FsbGVkIGluIGNhc2Ugb2YgYSBmYWlsdXJlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgdXBsb2FkIGlzIGNvbXBsZXRlZC9mYWlsZWQuXG4gICAqL1xuICB1cGxvYWQoZGF0YSwgYXZhdGFyRm9yLCBvblByb2dyZXNzLCBvblN1Y2Nlc3MsIG9uRmFpbHVyZSkge1xuICAgIGNvbnN0IGJhc2VVcmwgPSAodGhpcy5fdGlub2RlLl9zZWN1cmUgPyAnaHR0cHM6Ly8nIDogJ2h0dHA6Ly8nKSArIHRoaXMuX3Rpbm9kZS5faG9zdDtcbiAgICByZXR1cm4gdGhpcy51cGxvYWRXaXRoQmFzZVVybChiYXNlVXJsLCBkYXRhLCBhdmF0YXJGb3IsIG9uUHJvZ3Jlc3MsIG9uU3VjY2Vzcywgb25GYWlsdXJlKTtcbiAgfVxuICAvKipcbiAgICogRG93bmxvYWQgdGhlIGZpbGUgZnJvbSBhIGdpdmVuIFVSTCB1c2luZyBHRVQgcmVxdWVzdC4gVGhpcyBtZXRob2Qgd29ya3Mgd2l0aCB0aGUgVGlub2RlIHNlcnZlciBvbmx5LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkxhcmdlRmlsZUhlbHBlciNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVXJsIC0gVVJMIHRvIGRvd25sb2FkIHRoZSBmaWxlIGZyb20uIE11c3QgYmUgcmVsYXRpdmUgdXJsLCBpLmUuIG11c3Qgbm90IGNvbnRhaW4gdGhlIGhvc3QuXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gZmlsZW5hbWUgLSBmaWxlIG5hbWUgdG8gdXNlIGZvciB0aGUgZG93bmxvYWRlZCBmaWxlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgZG93bmxvYWQgaXMgY29tcGxldGVkL2ZhaWxlZC5cbiAgICovXG4gIGRvd25sb2FkKHJlbGF0aXZlVXJsLCBmaWxlbmFtZSwgbWltZXR5cGUsIG9uUHJvZ3Jlc3MsIG9uRXJyb3IpIHtcbiAgICBpZiAoIVRpbm9kZS5pc1JlbGF0aXZlVVJMKHJlbGF0aXZlVXJsKSkge1xuICAgICAgLy8gQXMgYSBzZWN1cml0eSBtZWFzdXJlIHJlZnVzZSB0byBkb3dubG9hZCBmcm9tIGFuIGFic29sdXRlIFVSTC5cbiAgICAgIGlmIChvbkVycm9yKSB7XG4gICAgICAgIG9uRXJyb3IoYFRoZSBVUkwgJyR7cmVsYXRpdmVVcmx9JyBtdXN0IGJlIHJlbGF0aXZlLCBub3QgYWJzb2x1dGVgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9hdXRoVG9rZW4pIHtcbiAgICAgIGlmIChvbkVycm9yKSB7XG4gICAgICAgIG9uRXJyb3IoXCJNdXN0IGF1dGhlbnRpY2F0ZSBmaXJzdFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgaW5zdGFuY2UgPSB0aGlzO1xuICAgIC8vIEdldCBkYXRhIGFzIGJsb2IgKHN0b3JlZCBieSB0aGUgYnJvd3NlciBhcyBhIHRlbXBvcmFyeSBmaWxlKS5cbiAgICB0aGlzLnhoci5vcGVuKCdHRVQnLCByZWxhdGl2ZVVybCwgdHJ1ZSk7XG4gICAgdGhpcy54aHIuc2V0UmVxdWVzdEhlYWRlcignWC1UaW5vZGUtQVBJS2V5JywgdGhpcy5fYXBpS2V5KTtcbiAgICB0aGlzLnhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLVRpbm9kZS1BdXRoJywgJ1Rva2VuICcgKyB0aGlzLl9hdXRoVG9rZW4udG9rZW4pO1xuICAgIHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJztcblxuICAgIHRoaXMub25Qcm9ncmVzcyA9IG9uUHJvZ3Jlc3M7XG4gICAgdGhpcy54aHIub25wcm9ncmVzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChpbnN0YW5jZS5vblByb2dyZXNzKSB7XG4gICAgICAgIC8vIFBhc3NpbmcgZS5sb2FkZWQgaW5zdGVhZCBvZiBlLmxvYWRlZC9lLnRvdGFsIGJlY2F1c2UgZS50b3RhbFxuICAgICAgICAvLyBpcyBhbHdheXMgMCB3aXRoIGd6aXAgY29tcHJlc3Npb24gZW5hYmxlZCBieSB0aGUgc2VydmVyLlxuICAgICAgICBpbnN0YW5jZS5vblByb2dyZXNzKGUubG9hZGVkKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy50b1Jlc29sdmUgPSByZXNvbHZlO1xuICAgICAgdGhpcy50b1JlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcblxuICAgIC8vIFRoZSBibG9iIG5lZWRzIHRvIGJlIHNhdmVkIGFzIGZpbGUuIFRoZXJlIGlzIG5vIGtub3duIHdheSB0b1xuICAgIC8vIHNhdmUgdGhlIGJsb2IgYXMgZmlsZSBvdGhlciB0aGFuIHRvIGZha2UgYSBjbGljayBvbiBhbiA8YSBocmVmLi4uIGRvd25sb2FkPS4uLj4uXG4gICAgdGhpcy54aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIC8vIFVSTC5jcmVhdGVPYmplY3RVUkwgaXMgbm90IGF2YWlsYWJsZSBpbiBub24tYnJvd3NlciBlbnZpcm9ubWVudC4gVGhpcyBjYWxsIHdpbGwgZmFpbC5cbiAgICAgICAgbGluay5ocmVmID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW3RoaXMucmVzcG9uc2VdLCB7XG4gICAgICAgICAgdHlwZTogbWltZXR5cGVcbiAgICAgICAgfSkpO1xuICAgICAgICBsaW5rLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCdkb3dubG9hZCcsIGZpbGVuYW1lKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgbGluay5jbGljaygpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGxpbmspO1xuICAgICAgICB3aW5kb3cuVVJMLnJldm9rZU9iamVjdFVSTChsaW5rLmhyZWYpO1xuICAgICAgICBpZiAoaW5zdGFuY2UudG9SZXNvbHZlKSB7XG4gICAgICAgICAgaW5zdGFuY2UudG9SZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0dXMgPj0gNDAwICYmIGluc3RhbmNlLnRvUmVqZWN0KSB7XG4gICAgICAgIC8vIFRoZSB0aGlzLnJlc3BvbnNlVGV4dCBpcyB1bmRlZmluZWQsIG11c3QgdXNlIHRoaXMucmVzcG9uc2Ugd2hpY2ggaXMgYSBibG9iLlxuICAgICAgICAvLyBOZWVkIHRvIGNvbnZlcnQgdGhpcy5yZXNwb25zZSB0byBKU09OLiBUaGUgYmxvYiBjYW4gb25seSBiZSBhY2Nlc3NlZCBieSB0aGVcbiAgICAgICAgLy8gRmlsZVJlYWRlci5cbiAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwa3QgPSBKU09OLnBhcnNlKHRoaXMucmVzdWx0LCBqc29uUGFyc2VIZWxwZXIpO1xuICAgICAgICAgICAgaW5zdGFuY2UudG9SZWplY3QobmV3IEVycm9yKGAke3BrdC5jdHJsLnRleHR9ICgke3BrdC5jdHJsLmNvZGV9KWApKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGluc3RhbmNlLl90aW5vZGUubG9nZ2VyKFwiRVJST1I6IEludmFsaWQgc2VydmVyIHJlc3BvbnNlIGluIExhcmdlRmlsZUhlbHBlclwiLCB0aGlzLnJlc3VsdCk7XG4gICAgICAgICAgICBpbnN0YW5jZS50b1JlamVjdChlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmVhZGVyLnJlYWRBc1RleHQodGhpcy5yZXNwb25zZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMueGhyLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoaW5zdGFuY2UudG9SZWplY3QpIHtcbiAgICAgICAgaW5zdGFuY2UudG9SZWplY3QobmV3IEVycm9yKFwiZmFpbGVkXCIpKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy54aHIub25hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGluc3RhbmNlLnRvUmVqZWN0KSB7XG4gICAgICAgIGluc3RhbmNlLnRvUmVqZWN0KG51bGwpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy54aHIuc2VuZCgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKHRoaXMudG9SZWplY3QpIHtcbiAgICAgICAgdGhpcy50b1JlamVjdChlcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgLyoqXG4gICAqIFRyeSB0byBjYW5jZWwgYW4gb25nb2luZyB1cGxvYWQgb3IgZG93bmxvYWQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuTGFyZ2VGaWxlSGVscGVyI1xuICAgKi9cbiAgY2FuY2VsKCkge1xuICAgIGlmICh0aGlzLnhociAmJiB0aGlzLnhoci5yZWFkeVN0YXRlIDwgNCkge1xuICAgICAgdGhpcy54aHIuYWJvcnQoKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEdldCB1bmlxdWUgaWQgb2YgdGhpcyByZXF1ZXN0LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLkxhcmdlRmlsZUhlbHBlciNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gdW5pcXVlIGlkXG4gICAqL1xuICBnZXRJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVxSWQ7XG4gIH1cbiAgLyoqXG4gICAqIFRvIHVzZSBMYXJnZUZpbGVIZWxwZXIgaW4gYSBub24gYnJvd3NlciBjb250ZXh0LCBzdXBwbHkgWE1MSHR0cFJlcXVlc3QgcHJvdmlkZXIuXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlcm9mIExhcmdlRmlsZUhlbHBlclxuICAgKiBAcGFyYW0geGhyUHJvdmlkZXIgWE1MSHR0cFJlcXVlc3QgcHJvdmlkZXIsIGUuZy4gZm9yIG5vZGUgPGNvZGU+cmVxdWlyZSgneGhyJyk8L2NvZGU+LlxuICAgKi9cbiAgc3RhdGljIHNldE5ldHdvcmtQcm92aWRlcih4aHJQcm92aWRlcikge1xuICAgIFhIUlByb3ZpZGVyID0geGhyUHJvdmlkZXI7XG4gIH1cbn1cbiIsIi8qKlxuICogQGZpbGUgSGVscGVyIGNsYXNzIGZvciBjb25zdHJ1Y3Rpbmcge0BsaW5rIFRpbm9kZS5HZXRRdWVyeX0uXG4gKlxuICogQGNvcHlyaWdodCAyMDE1LTIwMjIgVGlub2RlIExMQy5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEhlbHBlciBjbGFzcyBmb3IgY29uc3RydWN0aW5nIHtAbGluayBUaW5vZGUuR2V0UXVlcnl9LlxuICpcbiAqIEBjbGFzcyBNZXRhR2V0QnVpbGRlclxuICogQG1lbWJlcm9mIFRpbm9kZVxuICpcbiAqIEBwYXJhbSB7VGlub2RlLlRvcGljfSBwYXJlbnQgdG9waWMgd2hpY2ggaW5zdGFudGlhdGVkIHRoaXMgYnVpbGRlci5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWV0YUdldEJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQpIHtcbiAgICB0aGlzLnRvcGljID0gcGFyZW50O1xuICAgIHRoaXMud2hhdCA9IHt9O1xuICB9XG5cbiAgLy8gR2V0IHRpbWVzdGFtcCBvZiB0aGUgbW9zdCByZWNlbnQgZGVzYyB1cGRhdGUuXG4gICNfZ2V0X2Rlc2NfaW1zKCkge1xuICAgIHJldHVybiB0aGlzLnRvcGljLnVwZGF0ZWQ7XG4gIH1cblxuICAvLyBHZXQgdGltZXN0YW1wIG9mIHRoZSBtb3N0IHJlY2VudCBzdWJzIHVwZGF0ZS5cbiAgI19nZXRfc3Vic19pbXMoKSB7XG4gICAgaWYgKHRoaXMudG9waWMuaXNQMlBUeXBlKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLiNfZ2V0X2Rlc2NfaW1zKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRvcGljLl9sYXN0U3Vic1VwZGF0ZTtcbiAgfVxuICAvKipcbiAgICogQWRkIHF1ZXJ5IHBhcmFtZXRlcnMgdG8gZmV0Y2ggbWVzc2FnZXMgd2l0aGluIGV4cGxpY2l0IGxpbWl0cy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5NZXRhR2V0QnVpbGRlciNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXI9fSBzaW5jZSAtIG1lc3NhZ2VzIG5ld2VyIHRoYW4gdGhpcyAoaW5jbHVzaXZlKTtcbiAgICogQHBhcmFtIHtudW1iZXI9fSBiZWZvcmUgLSBvbGRlciB0aGFuIHRoaXMgKGV4Y2x1c2l2ZSlcbiAgICogQHBhcmFtIHtudW1iZXI9fSBsaW1pdCAtIG51bWJlciBvZiBtZXNzYWdlcyB0byBmZXRjaFxuICAgKiBAcmV0dXJucyB7VGlub2RlLk1ldGFHZXRCdWlsZGVyfSA8Y29kZT50aGlzPC9jb2RlPiBvYmplY3QuXG4gICAqL1xuICB3aXRoRGF0YShzaW5jZSwgYmVmb3JlLCBsaW1pdCkge1xuICAgIHRoaXMud2hhdFsnZGF0YSddID0ge1xuICAgICAgc2luY2U6IHNpbmNlLFxuICAgICAgYmVmb3JlOiBiZWZvcmUsXG4gICAgICBsaW1pdDogbGltaXRcbiAgICB9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgcXVlcnkgcGFyYW1ldGVycyB0byBmZXRjaCBtZXNzYWdlcyBuZXdlciB0aGFuIHRoZSBsYXRlc3Qgc2F2ZWQgbWVzc2FnZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5NZXRhR2V0QnVpbGRlciNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXI9fSBsaW1pdCAtIG51bWJlciBvZiBtZXNzYWdlcyB0byBmZXRjaFxuICAgKlxuICAgKiBAcmV0dXJucyB7VGlub2RlLk1ldGFHZXRCdWlsZGVyfSA8Y29kZT50aGlzPC9jb2RlPiBvYmplY3QuXG4gICAqL1xuICB3aXRoTGF0ZXJEYXRhKGxpbWl0KSB7XG4gICAgcmV0dXJuIHRoaXMud2l0aERhdGEodGhpcy50b3BpYy5fbWF4U2VxID4gMCA/IHRoaXMudG9waWMuX21heFNlcSArIDEgOiB1bmRlZmluZWQsIHVuZGVmaW5lZCwgbGltaXQpO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgcXVlcnkgcGFyYW1ldGVycyB0byBmZXRjaCBtZXNzYWdlcyBvbGRlciB0aGFuIHRoZSBlYXJsaWVzdCBzYXZlZCBtZXNzYWdlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLk1ldGFHZXRCdWlsZGVyI1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcj19IGxpbWl0IC0gbWF4aW11bSBudW1iZXIgb2YgbWVzc2FnZXMgdG8gZmV0Y2guXG4gICAqXG4gICAqIEByZXR1cm5zIHtUaW5vZGUuTWV0YUdldEJ1aWxkZXJ9IDxjb2RlPnRoaXM8L2NvZGU+IG9iamVjdC5cbiAgICovXG4gIHdpdGhFYXJsaWVyRGF0YShsaW1pdCkge1xuICAgIHJldHVybiB0aGlzLndpdGhEYXRhKHVuZGVmaW5lZCwgdGhpcy50b3BpYy5fbWluU2VxID4gMCA/IHRoaXMudG9waWMuX21pblNlcSA6IHVuZGVmaW5lZCwgbGltaXQpO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgcXVlcnkgcGFyYW1ldGVycyB0byBmZXRjaCB0b3BpYyBkZXNjcmlwdGlvbiBpZiBpdCdzIG5ld2VyIHRoYW4gdGhlIGdpdmVuIHRpbWVzdGFtcC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5NZXRhR2V0QnVpbGRlciNcbiAgICpcbiAgICogQHBhcmFtIHtEYXRlPX0gaW1zIC0gZmV0Y2ggbWVzc2FnZXMgbmV3ZXIgdGhhbiB0aGlzIHRpbWVzdGFtcC5cbiAgICpcbiAgICogQHJldHVybnMge1Rpbm9kZS5NZXRhR2V0QnVpbGRlcn0gPGNvZGU+dGhpczwvY29kZT4gb2JqZWN0LlxuICAgKi9cbiAgd2l0aERlc2MoaW1zKSB7XG4gICAgdGhpcy53aGF0WydkZXNjJ10gPSB7XG4gICAgICBpbXM6IGltc1xuICAgIH07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBxdWVyeSBwYXJhbWV0ZXJzIHRvIGZldGNoIHRvcGljIGRlc2NyaXB0aW9uIGlmIGl0J3MgbmV3ZXIgdGhhbiB0aGUgbGFzdCB1cGRhdGUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuTWV0YUdldEJ1aWxkZXIjXG4gICAqXG4gICAqIEByZXR1cm5zIHtUaW5vZGUuTWV0YUdldEJ1aWxkZXJ9IDxjb2RlPnRoaXM8L2NvZGU+IG9iamVjdC5cbiAgICovXG4gIHdpdGhMYXRlckRlc2MoKSB7XG4gICAgcmV0dXJuIHRoaXMud2l0aERlc2ModGhpcy4jX2dldF9kZXNjX2ltcygpKTtcbiAgfVxuICAvKipcbiAgICogQWRkIHF1ZXJ5IHBhcmFtZXRlcnMgdG8gZmV0Y2ggc3Vic2NyaXB0aW9ucy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5NZXRhR2V0QnVpbGRlciNcbiAgICpcbiAgICogQHBhcmFtIHtEYXRlPX0gaW1zIC0gZmV0Y2ggc3Vic2NyaXB0aW9ucyBtb2RpZmllZCBtb3JlIHJlY2VudGx5IHRoYW4gdGhpcyB0aW1lc3RhbXBcbiAgICogQHBhcmFtIHtudW1iZXI9fSBsaW1pdCAtIG1heGltdW0gbnVtYmVyIG9mIHN1YnNjcmlwdGlvbnMgdG8gZmV0Y2guXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gdXNlck9yVG9waWMgLSB1c2VyIElEIG9yIHRvcGljIG5hbWUgdG8gZmV0Y2ggZm9yIGZldGNoaW5nIG9uZSBzdWJzY3JpcHRpb24uXG4gICAqXG4gICAqIEByZXR1cm5zIHtUaW5vZGUuTWV0YUdldEJ1aWxkZXJ9IDxjb2RlPnRoaXM8L2NvZGU+IG9iamVjdC5cbiAgICovXG4gIHdpdGhTdWIoaW1zLCBsaW1pdCwgdXNlck9yVG9waWMpIHtcbiAgICBjb25zdCBvcHRzID0ge1xuICAgICAgaW1zOiBpbXMsXG4gICAgICBsaW1pdDogbGltaXRcbiAgICB9O1xuICAgIGlmICh0aGlzLnRvcGljLmdldFR5cGUoKSA9PSAnbWUnKSB7XG4gICAgICBvcHRzLnRvcGljID0gdXNlck9yVG9waWM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdHMudXNlciA9IHVzZXJPclRvcGljO1xuICAgIH1cbiAgICB0aGlzLndoYXRbJ3N1YiddID0gb3B0cztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogQWRkIHF1ZXJ5IHBhcmFtZXRlcnMgdG8gZmV0Y2ggYSBzaW5nbGUgc3Vic2NyaXB0aW9uLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLk1ldGFHZXRCdWlsZGVyI1xuICAgKlxuICAgKiBAcGFyYW0ge0RhdGU9fSBpbXMgLSBmZXRjaCBzdWJzY3JpcHRpb25zIG1vZGlmaWVkIG1vcmUgcmVjZW50bHkgdGhhbiB0aGlzIHRpbWVzdGFtcFxuICAgKiBAcGFyYW0ge3N0cmluZz19IHVzZXJPclRvcGljIC0gdXNlciBJRCBvciB0b3BpYyBuYW1lIHRvIGZldGNoIGZvciBmZXRjaGluZyBvbmUgc3Vic2NyaXB0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VGlub2RlLk1ldGFHZXRCdWlsZGVyfSA8Y29kZT50aGlzPC9jb2RlPiBvYmplY3QuXG4gICAqL1xuICB3aXRoT25lU3ViKGltcywgdXNlck9yVG9waWMpIHtcbiAgICByZXR1cm4gdGhpcy53aXRoU3ViKGltcywgdW5kZWZpbmVkLCB1c2VyT3JUb3BpYyk7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBxdWVyeSBwYXJhbWV0ZXJzIHRvIGZldGNoIGEgc2luZ2xlIHN1YnNjcmlwdGlvbiBpZiBpdCdzIGJlZW4gdXBkYXRlZCBzaW5jZSB0aGUgbGFzdCB1cGRhdGUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuTWV0YUdldEJ1aWxkZXIjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gdXNlck9yVG9waWMgLSB1c2VyIElEIG9yIHRvcGljIG5hbWUgdG8gZmV0Y2ggZm9yIGZldGNoaW5nIG9uZSBzdWJzY3JpcHRpb24uXG4gICAqXG4gICAqIEByZXR1cm5zIHtUaW5vZGUuTWV0YUdldEJ1aWxkZXJ9IDxjb2RlPnRoaXM8L2NvZGU+IG9iamVjdC5cbiAgICovXG4gIHdpdGhMYXRlck9uZVN1Yih1c2VyT3JUb3BpYykge1xuICAgIHJldHVybiB0aGlzLndpdGhPbmVTdWIodGhpcy50b3BpYy5fbGFzdFN1YnNVcGRhdGUsIHVzZXJPclRvcGljKTtcbiAgfVxuICAvKipcbiAgICogQWRkIHF1ZXJ5IHBhcmFtZXRlcnMgdG8gZmV0Y2ggc3Vic2NyaXB0aW9ucyB1cGRhdGVkIHNpbmNlIHRoZSBsYXN0IHVwZGF0ZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5NZXRhR2V0QnVpbGRlciNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXI9fSBsaW1pdCAtIG1heGltdW0gbnVtYmVyIG9mIHN1YnNjcmlwdGlvbnMgdG8gZmV0Y2guXG4gICAqXG4gICAqIEByZXR1cm5zIHtUaW5vZGUuTWV0YUdldEJ1aWxkZXJ9IDxjb2RlPnRoaXM8L2NvZGU+IG9iamVjdC5cbiAgICovXG4gIHdpdGhMYXRlclN1YihsaW1pdCkge1xuICAgIHJldHVybiB0aGlzLndpdGhTdWIodGhpcy4jX2dldF9zdWJzX2ltcygpLCBsaW1pdCk7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBxdWVyeSBwYXJhbWV0ZXJzIHRvIGZldGNoIHRvcGljIHRhZ3MuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuTWV0YUdldEJ1aWxkZXIjXG4gICAqXG4gICAqIEByZXR1cm5zIHtUaW5vZGUuTWV0YUdldEJ1aWxkZXJ9IDxjb2RlPnRoaXM8L2NvZGU+IG9iamVjdC5cbiAgICovXG4gIHdpdGhUYWdzKCkge1xuICAgIHRoaXMud2hhdFsndGFncyddID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogQWRkIHF1ZXJ5IHBhcmFtZXRlcnMgdG8gZmV0Y2ggdXNlcidzIGNyZWRlbnRpYWxzLiA8Y29kZT4nbWUnPC9jb2RlPiB0b3BpYyBvbmx5LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLk1ldGFHZXRCdWlsZGVyI1xuICAgKlxuICAgKiBAcmV0dXJucyB7VGlub2RlLk1ldGFHZXRCdWlsZGVyfSA8Y29kZT50aGlzPC9jb2RlPiBvYmplY3QuXG4gICAqL1xuICB3aXRoQ3JlZCgpIHtcbiAgICBpZiAodGhpcy50b3BpYy5nZXRUeXBlKCkgPT0gJ21lJykge1xuICAgICAgdGhpcy53aGF0WydjcmVkJ10gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRvcGljLl90aW5vZGUubG9nZ2VyKFwiRVJST1I6IEludmFsaWQgdG9waWMgdHlwZSBmb3IgTWV0YUdldEJ1aWxkZXI6d2l0aENyZWRzXCIsIHRoaXMudG9waWMuZ2V0VHlwZSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBxdWVyeSBwYXJhbWV0ZXJzIHRvIGZldGNoIGRlbGV0ZWQgbWVzc2FnZXMgd2l0aGluIGV4cGxpY2l0IGxpbWl0cy4gQW55L2FsbCBwYXJhbWV0ZXJzIGNhbiBiZSBudWxsLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLk1ldGFHZXRCdWlsZGVyI1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcj19IHNpbmNlIC0gaWRzIG9mIG1lc3NhZ2VzIGRlbGV0ZWQgc2luY2UgdGhpcyAnZGVsJyBpZCAoaW5jbHVzaXZlKVxuICAgKiBAcGFyYW0ge251bWJlcj19IGxpbWl0IC0gbnVtYmVyIG9mIGRlbGV0ZWQgbWVzc2FnZSBpZHMgdG8gZmV0Y2hcbiAgICpcbiAgICogQHJldHVybnMge1Rpbm9kZS5NZXRhR2V0QnVpbGRlcn0gPGNvZGU+dGhpczwvY29kZT4gb2JqZWN0LlxuICAgKi9cbiAgd2l0aERlbChzaW5jZSwgbGltaXQpIHtcbiAgICBpZiAoc2luY2UgfHwgbGltaXQpIHtcbiAgICAgIHRoaXMud2hhdFsnZGVsJ10gPSB7XG4gICAgICAgIHNpbmNlOiBzaW5jZSxcbiAgICAgICAgbGltaXQ6IGxpbWl0XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogQWRkIHF1ZXJ5IHBhcmFtZXRlcnMgdG8gZmV0Y2ggbWVzc2FnZXMgZGVsZXRlZCBhZnRlciB0aGUgc2F2ZWQgPGNvZGU+J2RlbCc8L2NvZGU+IGlkLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLk1ldGFHZXRCdWlsZGVyI1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcj19IGxpbWl0IC0gbnVtYmVyIG9mIGRlbGV0ZWQgbWVzc2FnZSBpZHMgdG8gZmV0Y2hcbiAgICpcbiAgICogQHJldHVybnMge1Rpbm9kZS5NZXRhR2V0QnVpbGRlcn0gPGNvZGU+dGhpczwvY29kZT4gb2JqZWN0LlxuICAgKi9cbiAgd2l0aExhdGVyRGVsKGxpbWl0KSB7XG4gICAgLy8gU3BlY2lmeSAnc2luY2UnIG9ubHkgaWYgd2UgaGF2ZSBhbHJlYWR5IHJlY2VpdmVkIHNvbWUgbWVzc2FnZXMuIElmXG4gICAgLy8gd2UgaGF2ZSBubyBsb2NhbGx5IGNhY2hlZCBtZXNzYWdlcyB0aGVuIHdlIGRvbid0IGNhcmUgaWYgYW55IG1lc3NhZ2VzIHdlcmUgZGVsZXRlZC5cbiAgICByZXR1cm4gdGhpcy53aXRoRGVsKHRoaXMudG9waWMuX21heFNlcSA+IDAgPyB0aGlzLnRvcGljLl9tYXhEZWwgKyAxIDogdW5kZWZpbmVkLCBsaW1pdCk7XG4gIH1cblxuICAvKipcbiAgICogRXh0cmFjdCBzdWJxdWVyeTogZ2V0IGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIHNwZWNpZmllZCBzdWJxdWVyeS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5NZXRhR2V0QnVpbGRlciNcbiAgICogQHBhcmFtIHtzdHJpbmd9IHdoYXQgLSBzdWJxdWVyeSB0byByZXR1cm46IG9uZSBvZiAnZGF0YScsICdzdWInLCAnZGVzYycsICd0YWdzJywgJ2NyZWQnLCAnZGVsJy5cbiAgICogQHJldHVybnMge09iamVjdH0gcmVxdWVzdGVkIHN1YnF1ZXJ5IG9yIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4uXG4gICAqL1xuICBleHRyYWN0KHdoYXQpIHtcbiAgICByZXR1cm4gdGhpcy53aGF0W3doYXRdO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBwYXJhbWV0ZXJzLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLk1ldGFHZXRCdWlsZGVyI1xuICAgKlxuICAgKiBAcmV0dXJucyB7VGlub2RlLkdldFF1ZXJ5fSBHZXQgcXVlcnlcbiAgICovXG4gIGJ1aWxkKCkge1xuICAgIGNvbnN0IHdoYXQgPSBbXTtcbiAgICBsZXQgcGFyYW1zID0ge307XG4gICAgWydkYXRhJywgJ3N1YicsICdkZXNjJywgJ3RhZ3MnLCAnY3JlZCcsICdkZWwnXS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGlmICh0aGlzLndoYXQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICB3aGF0LnB1c2goa2V5KTtcbiAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMud2hhdFtrZXldKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcGFyYW1zW2tleV0gPSB0aGlzLndoYXRba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGlmICh3aGF0Lmxlbmd0aCA+IDApIHtcbiAgICAgIHBhcmFtcy53aGF0ID0gd2hhdC5qb2luKCcgJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmFtcyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtcztcbiAgfVxufVxuIiwiLyoqXG4gKiBAZmlsZSBTREsgdG8gY29ubmVjdCB0byBUaW5vZGUgY2hhdCBzZXJ2ZXIuXG4gKiBTZWUgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS90aW5vZGUvd2ViYXBwXCI+aHR0cHM6Ly9naXRodWIuY29tL3Rpbm9kZS93ZWJhcHA8L2E+IGZvciByZWFsLWxpZmUgdXNhZ2UuXG4gKlxuICogQGNvcHlyaWdodCAyMDE1LTIwMjIgVGlub2RlIExMQy5cbiAqIEBzdW1tYXJ5IEphdmFzY3JpcHQgYmluZGluZ3MgZm9yIFRpbm9kZS5cbiAqIEBsaWNlbnNlIEFwYWNoZSAyLjBcbiAqIEB2ZXJzaW9uIDAuMThcbiAqXG4gKiBAZXhhbXBsZVxuICogPGhlYWQ+XG4gKiA8c2NyaXB0IHNyYz1cIi4uLi90aW5vZGUuanNcIj48L3NjcmlwdD5cbiAqIDwvaGVhZD5cbiAqXG4gKiA8Ym9keT5cbiAqICAuLi5cbiAqIDxzY3JpcHQ+XG4gKiAgLy8gSW5zdGFudGlhdGUgdGlub2RlLlxuICogIGNvbnN0IHRpbm9kZSA9IG5ldyBUaW5vZGUoY29uZmlnLCAoKSA9PiB7XG4gKiAgICAvLyBDYWxsZWQgb24gaW5pdCBjb21wbGV0aW9uLlxuICogIH0pO1xuICogIHRpbm9kZS5lbmFibGVMb2dnaW5nKHRydWUpO1xuICogIHRpbm9kZS5vbkRpc2Nvbm5lY3QgPSAoZXJyKSA9PiB7XG4gKiAgICAvLyBIYW5kbGUgZGlzY29ubmVjdC5cbiAqICB9O1xuICogIC8vIENvbm5lY3QgdG8gdGhlIHNlcnZlci5cbiAqICB0aW5vZGUuY29ubmVjdCgnaHR0cHM6Ly9leGFtcGxlLmNvbS8nKS50aGVuKCgpID0+IHtcbiAqICAgIC8vIENvbm5lY3RlZC4gTG9naW4gbm93LlxuICogICAgcmV0dXJuIHRpbm9kZS5sb2dpbkJhc2ljKGxvZ2luLCBwYXNzd29yZCk7XG4gKiAgfSkudGhlbigoY3RybCkgPT4ge1xuICogICAgLy8gTG9nZ2VkIGluIGZpbmUsIGF0dGFjaCBjYWxsYmFja3MsIHN1YnNjcmliZSB0byAnbWUnLlxuICogICAgY29uc3QgbWUgPSB0aW5vZGUuZ2V0TWVUb3BpYygpO1xuICogICAgbWUub25NZXRhRGVzYyA9IGZ1bmN0aW9uKG1ldGEpIHsgLi4uIH07XG4gKiAgICAvLyBTdWJzY3JpYmUsIGZldGNoIHRvcGljIGRlc2NyaXB0aW9uIGFuZCB0aGUgbGlzdCBvZiBjb250YWN0cy5cbiAqICAgIG1lLnN1YnNjcmliZSh7Z2V0OiB7ZGVzYzoge30sIHN1Yjoge319fSk7XG4gKiAgfSkuY2F0Y2goKGVycikgPT4ge1xuICogICAgLy8gTG9naW4gb3Igc3Vic2NyaXB0aW9uIGZhaWxlZCwgZG8gc29tZXRoaW5nLlxuICogICAgLi4uXG4gKiAgfSk7XG4gKiAgLi4uXG4gKiA8L3NjcmlwdD5cbiAqIDwvYm9keT5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyBOT1RFIFRPIERFVkVMT1BFUlM6XG4vLyBMb2NhbGl6YWJsZSBzdHJpbmdzIHNob3VsZCBiZSBkb3VibGUgcXVvdGVkIFwi0YHRgtGA0L7QutCwINC90LAg0LTRgNGD0LPQvtC8INGP0LfRi9C60LVcIixcbi8vIG5vbi1sb2NhbGl6YWJsZSBzdHJpbmdzIHNob3VsZCBiZSBzaW5nbGUgcXVvdGVkICdub24tbG9jYWxpemVkJy5cblxuaW1wb3J0IEFjY2Vzc01vZGUgZnJvbSAnLi9hY2Nlc3MtbW9kZS5qcyc7XG5pbXBvcnQgKiBhcyBDb25zdCBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgQ29ubmVjdGlvbiBmcm9tICcuL2Nvbm5lY3Rpb24uanMnO1xuaW1wb3J0IERCQ2FjaGUgZnJvbSAnLi9kYi5qcyc7XG5pbXBvcnQgRHJhZnR5IGZyb20gJy4vZHJhZnR5LmpzJztcbmltcG9ydCBMYXJnZUZpbGVIZWxwZXIgZnJvbSAnLi9sYXJnZS1maWxlLmpzJztcbmltcG9ydCB7XG4gIFRvcGljLFxuICBUb3BpY01lLFxuICBUb3BpY0ZuZFxufSBmcm9tICcuL3RvcGljLmpzJztcblxuaW1wb3J0IHtcbiAganNvblBhcnNlSGVscGVyLFxuICBtZXJnZU9iaixcbiAgcmZjMzMzOURhdGVTdHJpbmcsXG4gIHNpbXBsaWZ5XG59IGZyb20gJy4vdXRpbHMuanMnO1xuXG5sZXQgV2ViU29ja2V0UHJvdmlkZXI7XG5pZiAodHlwZW9mIFdlYlNvY2tldCAhPSAndW5kZWZpbmVkJykge1xuICBXZWJTb2NrZXRQcm92aWRlciA9IFdlYlNvY2tldDtcbn1cblxubGV0IFhIUlByb3ZpZGVyO1xuaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPSAndW5kZWZpbmVkJykge1xuICBYSFJQcm92aWRlciA9IFhNTEh0dHBSZXF1ZXN0O1xufVxuXG5sZXQgSW5kZXhlZERCUHJvdmlkZXI7XG5pZiAodHlwZW9mIGluZGV4ZWREQiAhPSAndW5kZWZpbmVkJykge1xuICBJbmRleGVkREJQcm92aWRlciA9IGluZGV4ZWREQjtcbn1cblxuLy8gUmUtZXhwb3J0IERyYWZ0eS5cbmV4cG9ydCB7XG4gIERyYWZ0eVxufVxuXG5pbml0Rm9yTm9uQnJvd3NlckFwcCgpO1xuXG4vLyBVdGlsaXR5IGZ1bmN0aW9uc1xuXG4vLyBQb2x5ZmlsbCBmb3Igbm9uLWJyb3dzZXIgY29udGV4dCwgZS5nLiBOb2RlSnMuXG5mdW5jdGlvbiBpbml0Rm9yTm9uQnJvd3NlckFwcCgpIHtcbiAgLy8gVGlub2RlIHJlcXVpcmVtZW50IGluIG5hdGl2ZSBtb2RlIGJlY2F1c2UgcmVhY3QgbmF0aXZlIGRvZXNuJ3QgcHJvdmlkZSBCYXNlNjQgbWV0aG9kXG4gIGNvbnN0IGNoYXJzID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89JztcblxuICBpZiAodHlwZW9mIGJ0b2EgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBnbG9iYWwuYnRvYSA9IGZ1bmN0aW9uKGlucHV0ID0gJycpIHtcbiAgICAgIGxldCBzdHIgPSBpbnB1dDtcbiAgICAgIGxldCBvdXRwdXQgPSAnJztcblxuICAgICAgZm9yIChsZXQgYmxvY2sgPSAwLCBjaGFyQ29kZSwgaSA9IDAsIG1hcCA9IGNoYXJzOyBzdHIuY2hhckF0KGkgfCAwKSB8fCAobWFwID0gJz0nLCBpICUgMSk7IG91dHB1dCArPSBtYXAuY2hhckF0KDYzICYgYmxvY2sgPj4gOCAtIGkgJSAxICogOCkpIHtcblxuICAgICAgICBjaGFyQ29kZSA9IHN0ci5jaGFyQ29kZUF0KGkgKz0gMyAvIDQpO1xuXG4gICAgICAgIGlmIChjaGFyQ29kZSA+IDB4RkYpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCInYnRvYScgZmFpbGVkOiBUaGUgc3RyaW5nIHRvIGJlIGVuY29kZWQgY29udGFpbnMgY2hhcmFjdGVycyBvdXRzaWRlIG9mIHRoZSBMYXRpbjEgcmFuZ2UuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGJsb2NrID0gYmxvY2sgPDwgOCB8IGNoYXJDb2RlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH07XG4gIH1cblxuICBpZiAodHlwZW9mIGF0b2IgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBnbG9iYWwuYXRvYiA9IGZ1bmN0aW9uKGlucHV0ID0gJycpIHtcbiAgICAgIGxldCBzdHIgPSBpbnB1dC5yZXBsYWNlKC89KyQvLCAnJyk7XG4gICAgICBsZXQgb3V0cHV0ID0gJyc7XG5cbiAgICAgIGlmIChzdHIubGVuZ3RoICUgNCA9PSAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIidhdG9iJyBmYWlsZWQ6IFRoZSBzdHJpbmcgdG8gYmUgZGVjb2RlZCBpcyBub3QgY29ycmVjdGx5IGVuY29kZWQuXCIpO1xuICAgICAgfVxuICAgICAgZm9yIChsZXQgYmMgPSAwLCBicyA9IDAsIGJ1ZmZlciwgaSA9IDA7IGJ1ZmZlciA9IHN0ci5jaGFyQXQoaSsrKTtcblxuICAgICAgICB+YnVmZmVyICYmIChicyA9IGJjICUgNCA/IGJzICogNjQgKyBidWZmZXIgOiBidWZmZXIsXG4gICAgICAgICAgYmMrKyAlIDQpID8gb3V0cHV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoMjU1ICYgYnMgPj4gKC0yICogYmMgJiA2KSkgOiAwXG4gICAgICApIHtcbiAgICAgICAgYnVmZmVyID0gY2hhcnMuaW5kZXhPZihidWZmZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH07XG4gIH1cblxuICBpZiAodHlwZW9mIHdpbmRvdyA9PSAndW5kZWZpbmVkJykge1xuICAgIGdsb2JhbC53aW5kb3cgPSB7XG4gICAgICBXZWJTb2NrZXQ6IFdlYlNvY2tldFByb3ZpZGVyLFxuICAgICAgWE1MSHR0cFJlcXVlc3Q6IFhIUlByb3ZpZGVyLFxuICAgICAgaW5kZXhlZERCOiBJbmRleGVkREJQcm92aWRlcixcbiAgICAgIFVSTDoge1xuICAgICAgICBjcmVhdGVPYmplY3RVUkw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byB1c2UgVVJMLmNyZWF0ZU9iamVjdFVSTCBpbiBhIG5vbi1icm93c2VyIGFwcGxpY2F0aW9uXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgQ29ubmVjdGlvbi5zZXROZXR3b3JrUHJvdmlkZXJzKFdlYlNvY2tldFByb3ZpZGVyLCBYSFJQcm92aWRlcik7XG4gIExhcmdlRmlsZUhlbHBlci5zZXROZXR3b3JrUHJvdmlkZXIoWEhSUHJvdmlkZXIpO1xuICBEQkNhY2hlLnNldERhdGFiYXNlUHJvdmlkZXIoSW5kZXhlZERCUHJvdmlkZXIpO1xufVxuXG4vLyBEZXRlY3QgZmluZCBtb3N0IHVzZWZ1bCBuZXR3b3JrIHRyYW5zcG9ydC5cbmZ1bmN0aW9uIGRldGVjdFRyYW5zcG9ydCgpIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT0gJ29iamVjdCcpIHtcbiAgICBpZiAod2luZG93WydXZWJTb2NrZXQnXSkge1xuICAgICAgcmV0dXJuICd3cyc7XG4gICAgfSBlbHNlIGlmICh3aW5kb3dbJ1hNTEh0dHBSZXF1ZXN0J10pIHtcbiAgICAgIC8vIFRoZSBicm93c2VyIG9yIG5vZGUgaGFzIG5vIHdlYnNvY2tldHMsIHVzaW5nIGxvbmcgcG9sbGluZy5cbiAgICAgIHJldHVybiAnbHAnO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLy8gYnRvYSByZXBsYWNlbWVudC4gU3RvY2sgYnRvYSBmYWlscyBvbiBvbiBub24tTGF0aW4xIHN0cmluZ3MuXG5mdW5jdGlvbiBiNjRFbmNvZGVVbmljb2RlKHN0cikge1xuICAvLyBUaGUgZW5jb2RlVVJJQ29tcG9uZW50IHBlcmNlbnQtZW5jb2RlcyBVVEYtOCBzdHJpbmcsXG4gIC8vIHRoZW4gdGhlIHBlcmNlbnQgZW5jb2RpbmcgaXMgY29udmVydGVkIGludG8gcmF3IGJ5dGVzIHdoaWNoXG4gIC8vIGNhbiBiZSBmZWQgaW50byBidG9hLlxuICByZXR1cm4gYnRvYShlbmNvZGVVUklDb21wb25lbnQoc3RyKS5yZXBsYWNlKC8lKFswLTlBLUZdezJ9KS9nLFxuICAgIGZ1bmN0aW9uIHRvU29saWRCeXRlcyhtYXRjaCwgcDEpIHtcbiAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweCcgKyBwMSk7XG4gICAgfSkpO1xufVxuXG4vLyBKU09OIHN0cmluZ2lmeSBoZWxwZXIgLSBwcmUtcHJvY2Vzc29yIGZvciBKU09OLnN0cmluZ2lmeVxuZnVuY3Rpb24ganNvbkJ1aWxkSGVscGVyKGtleSwgdmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgLy8gQ29udmVydCBqYXZhc2NyaXB0IERhdGUgb2JqZWN0cyB0byByZmMzMzM5IHN0cmluZ3NcbiAgICB2YWwgPSByZmMzMzM5RGF0ZVN0cmluZyh2YWwpO1xuICB9IGVsc2UgaWYgKHZhbCBpbnN0YW5jZW9mIEFjY2Vzc01vZGUpIHtcbiAgICB2YWwgPSB2YWwuanNvbkhlbHBlcigpO1xuICB9IGVsc2UgaWYgKHZhbCA9PT0gdW5kZWZpbmVkIHx8IHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IGZhbHNlIHx8XG4gICAgKEFycmF5LmlzQXJyYXkodmFsKSAmJiB2YWwubGVuZ3RoID09IDApIHx8XG4gICAgKCh0eXBlb2YgdmFsID09ICdvYmplY3QnKSAmJiAoT2JqZWN0LmtleXModmFsKS5sZW5ndGggPT0gMCkpKSB7XG4gICAgLy8gc3RyaXAgb3V0IGVtcHR5IGVsZW1lbnRzIHdoaWxlIHNlcmlhbGl6aW5nIG9iamVjdHMgdG8gSlNPTlxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gdmFsO1xufTtcblxuLy8gVHJpbXMgdmVyeSBsb25nIHN0cmluZ3MgKGVuY29kZWQgaW1hZ2VzKSB0byBtYWtlIGxvZ2dlZCBwYWNrZXRzIG1vcmUgcmVhZGFibGUuXG5mdW5jdGlvbiBqc29uTG9nZ2VySGVscGVyKGtleSwgdmFsKSB7XG4gIGlmICh0eXBlb2YgdmFsID09ICdzdHJpbmcnICYmIHZhbC5sZW5ndGggPiAxMjgpIHtcbiAgICByZXR1cm4gJzwnICsgdmFsLmxlbmd0aCArICcsIGJ5dGVzOiAnICsgdmFsLnN1YnN0cmluZygwLCAxMikgKyAnLi4uJyArIHZhbC5zdWJzdHJpbmcodmFsLmxlbmd0aCAtIDEyKSArICc+JztcbiAgfVxuICByZXR1cm4ganNvbkJ1aWxkSGVscGVyKGtleSwgdmFsKTtcbn07XG5cbi8vIFBhcnNlIGJyb3dzZXIgdXNlciBhZ2VudCB0byBleHRyYWN0IGJyb3dzZXIgbmFtZSBhbmQgdmVyc2lvbi5cbmZ1bmN0aW9uIGdldEJyb3dzZXJJbmZvKHVhLCBwcm9kdWN0KSB7XG4gIHVhID0gdWEgfHwgJyc7XG4gIGxldCByZWFjdG5hdGl2ZSA9ICcnO1xuICAvLyBDaGVjayBpZiB0aGlzIGlzIGEgUmVhY3ROYXRpdmUgYXBwLlxuICBpZiAoL3JlYWN0bmF0aXZlL2kudGVzdChwcm9kdWN0KSkge1xuICAgIHJlYWN0bmF0aXZlID0gJ1JlYWN0TmF0aXZlOyAnO1xuICB9XG4gIGxldCByZXN1bHQ7XG4gIC8vIFJlbW92ZSB1c2VsZXNzIHN0cmluZy5cbiAgdWEgPSB1YS5yZXBsYWNlKCcgKEtIVE1MLCBsaWtlIEdlY2tvKScsICcnKTtcbiAgLy8gVGVzdCBmb3IgV2ViS2l0LWJhc2VkIGJyb3dzZXIuXG4gIGxldCBtID0gdWEubWF0Y2goLyhBcHBsZVdlYktpdFxcL1suXFxkXSspL2kpO1xuICBpZiAobSkge1xuICAgIC8vIExpc3Qgb2YgY29tbW9uIHN0cmluZ3MsIGZyb20gbW9yZSB1c2VmdWwgdG8gbGVzcyB1c2VmdWwuXG4gICAgLy8gQWxsIHVua25vd24gc3RyaW5ncyBnZXQgdGhlIGhpZ2hlc3QgKC0xKSBwcmlvcml0eS5cbiAgICBjb25zdCBwcmlvcml0eSA9IFsnZWRnJywgJ2Nocm9tZScsICdzYWZhcmknLCAnbW9iaWxlJywgJ3ZlcnNpb24nXTtcbiAgICBsZXQgdG1wID0gdWEuc3Vic3RyKG0uaW5kZXggKyBtWzBdLmxlbmd0aCkuc3BsaXQoJyAnKTtcbiAgICBsZXQgdG9rZW5zID0gW107XG4gICAgbGV0IHZlcnNpb247IC8vIDEuMCBpbiBWZXJzaW9uLzEuMCBvciB1bmRlZmluZWQ7XG4gICAgLy8gU3BsaXQgc3RyaW5nIGxpa2UgJ05hbWUvMC4wLjAnIGludG8gWydOYW1lJywgJzAuMC4wJywgM10gd2hlcmUgdGhlIGxhc3QgZWxlbWVudCBpcyB0aGUgcHJpb3JpdHkuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0bXAubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBtMiA9IC8oW1xcdy5dKylbXFwvXShbXFwuXFxkXSspLy5leGVjKHRtcFtpXSk7XG4gICAgICBpZiAobTIpIHtcbiAgICAgICAgLy8gVW5rbm93biB2YWx1ZXMgYXJlIGhpZ2hlc3QgcHJpb3JpdHkgKC0xKS5cbiAgICAgICAgdG9rZW5zLnB1c2goW20yWzFdLCBtMlsyXSwgcHJpb3JpdHkuZmluZEluZGV4KChlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG0yWzFdLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aChlKTtcbiAgICAgICAgfSldKTtcbiAgICAgICAgaWYgKG0yWzFdID09ICdWZXJzaW9uJykge1xuICAgICAgICAgIHZlcnNpb24gPSBtMlsyXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBTb3J0IGJ5IHByaW9yaXR5OiBtb3JlIGludGVyZXN0aW5nIGlzIGVhcmxpZXIgdGhhbiBsZXNzIGludGVyZXN0aW5nLlxuICAgIHRva2Vucy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICByZXR1cm4gYVsyXSAtIGJbMl07XG4gICAgfSk7XG4gICAgaWYgKHRva2Vucy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBSZXR1cm4gdGhlIGxlYXN0IGNvbW1vbiBicm93c2VyIHN0cmluZyBhbmQgdmVyc2lvbi5cbiAgICAgIGlmICh0b2tlbnNbMF1bMF0udG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKCdlZGcnKSkge1xuICAgICAgICB0b2tlbnNbMF1bMF0gPSAnRWRnZSc7XG4gICAgICB9IGVsc2UgaWYgKHRva2Vuc1swXVswXSA9PSAnT1BSJykge1xuICAgICAgICB0b2tlbnNbMF1bMF0gPSAnT3BlcmEnO1xuICAgICAgfSBlbHNlIGlmICh0b2tlbnNbMF1bMF0gPT0gJ1NhZmFyaScgJiYgdmVyc2lvbikge1xuICAgICAgICB0b2tlbnNbMF1bMV0gPSB2ZXJzaW9uO1xuICAgICAgfVxuICAgICAgcmVzdWx0ID0gdG9rZW5zWzBdWzBdICsgJy8nICsgdG9rZW5zWzBdWzFdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBGYWlsZWQgdG8gSUQgdGhlIGJyb3dzZXIuIFJldHVybiB0aGUgd2Via2l0IHZlcnNpb24uXG4gICAgICByZXN1bHQgPSBtWzFdO1xuICAgIH1cbiAgfSBlbHNlIGlmICgvZmlyZWZveC9pLnRlc3QodWEpKSB7XG4gICAgbSA9IC9GaXJlZm94XFwvKFsuXFxkXSspL2cuZXhlYyh1YSk7XG4gICAgaWYgKG0pIHtcbiAgICAgIHJlc3VsdCA9ICdGaXJlZm94LycgKyBtWzFdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSAnRmlyZWZveC8/JztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gTmVpdGhlciBBcHBsZVdlYktpdCBub3IgRmlyZWZveC4gVHJ5IHRoZSBsYXN0IHJlc29ydC5cbiAgICBtID0gLyhbXFx3Ll0rKVxcLyhbLlxcZF0rKS8uZXhlYyh1YSk7XG4gICAgaWYgKG0pIHtcbiAgICAgIHJlc3VsdCA9IG1bMV0gKyAnLycgKyBtWzJdO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdWEuc3BsaXQoJyAnKTtcbiAgICAgIHJlc3VsdCA9IG1bMF07XG4gICAgfVxuICB9XG5cbiAgLy8gU2hvcnRlbiB0aGUgdmVyc2lvbiB0byBvbmUgZG90ICdhLmJiLmNjYy5kIC0+IGEuYmInIGF0IG1vc3QuXG4gIG0gPSByZXN1bHQuc3BsaXQoJy8nKTtcbiAgaWYgKG0ubGVuZ3RoID4gMSkge1xuICAgIGNvbnN0IHYgPSBtWzFdLnNwbGl0KCcuJyk7XG4gICAgY29uc3QgbWlub3IgPSB2WzFdID8gJy4nICsgdlsxXS5zdWJzdHIoMCwgMikgOiAnJztcbiAgICByZXN1bHQgPSBgJHttWzBdfS8ke3ZbMF19JHttaW5vcn1gO1xuICB9XG4gIHJldHVybiByZWFjdG5hdGl2ZSArIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBAY2xhc3MgVGlub2RlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVycy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb25maWcuYXBwTmFtZSAtIE5hbWUgb2YgdGhlIGNhbGxpbmcgYXBwbGljYXRpb24gdG8gYmUgcmVwb3J0ZWQgaW4gdGhlIFVzZXIgQWdlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ30gY29uZmlnLmhvc3QgLSBIb3N0IG5hbWUgYW5kIG9wdGlvbmFsIHBvcnQgbnVtYmVyIHRvIGNvbm5lY3QgdG8uXG4gKiBAcGFyYW0ge3N0cmluZ30gY29uZmlnLmFwaUtleSAtIEFQSSBrZXkgZ2VuZXJhdGVkIGJ5IDxjb2RlPmtleWdlbjwvY29kZT4uXG4gKiBAcGFyYW0ge3N0cmluZ30gY29uZmlnLnRyYW5zcG9ydCAtIFNlZSB7QGxpbmsgVGlub2RlLkNvbm5lY3Rpb24jdHJhbnNwb3J0fS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gY29uZmlnLnNlY3VyZSAtIFVzZSBTZWN1cmUgV2ViU29ja2V0IGlmIDxjb2RlPnRydWU8L2NvZGU+LlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbmZpZy5wbGF0Zm9ybSAtIE9wdGlvbmFsIHBsYXRmb3JtIGlkZW50aWZpZXIsIG9uZSBvZiA8Y29kZT5cImlvc1wiPC9jb2RlPiwgPGNvZGU+XCJ3ZWJcIjwvY29kZT4sIDxjb2RlPlwiYW5kcm9pZFwiPC9jb2RlPi5cbiAqIEBwYXJhbSB7Ym9vbGVufSBjb25maWcucGVyc2lzdCAtIFVzZSBJbmRleGVkREIgcGVyc2lzdGVudCBzdG9yYWdlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gb25Db21wbGV0ZSAtIGNhbGxiYWNrIHRvIGNhbGwgd2hlbiBpbml0aWFsaXphdGlvbiBpcyBjb21wbGV0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBUaW5vZGUge1xuICBfaG9zdDtcbiAgX3NlY3VyZTtcblxuICBfYXBwTmFtZTtcblxuICAvLyBBUEkgS2V5LlxuICBfYXBpS2V5O1xuXG4gIC8vIE5hbWUgYW5kIHZlcnNpb24gb2YgdGhlIGJyb3dzZXIuXG4gIF9icm93c2VyID0gJyc7XG4gIF9wbGF0Zm9ybTtcbiAgLy8gSGFyZHdhcmVcbiAgX2h3b3MgPSAndW5kZWZpbmVkJztcbiAgX2h1bWFuTGFuZ3VhZ2UgPSAneHgnO1xuXG4gIC8vIExvZ2dpbmcgdG8gY29uc29sZSBlbmFibGVkXG4gIF9sb2dnaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAvLyBXaGVuIGxvZ2dpbmcsIHRyaXAgbG9uZyBzdHJpbmdzIChiYXNlNjQtZW5jb2RlZCBpbWFnZXMpIGZvciByZWFkYWJpbGl0eVxuICBfdHJpbUxvbmdTdHJpbmdzID0gZmFsc2U7XG4gIC8vIFVJRCBvZiB0aGUgY3VycmVudGx5IGF1dGhlbnRpY2F0ZWQgdXNlci5cbiAgX215VUlEID0gbnVsbDtcbiAgLy8gU3RhdHVzIG9mIGNvbm5lY3Rpb246IGF1dGhlbnRpY2F0ZWQgb3Igbm90LlxuICBfYXV0aGVudGljYXRlZCA9IGZhbHNlO1xuICAvLyBMb2dpbiB1c2VkIGluIHRoZSBsYXN0IHN1Y2Nlc3NmdWwgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgX2xvZ2luID0gbnVsbDtcbiAgLy8gVG9rZW4gd2hpY2ggY2FuIGJlIHVzZWQgZm9yIGxvZ2luIGluc3RlYWQgb2YgbG9naW4vcGFzc3dvcmQuXG4gIF9hdXRoVG9rZW4gPSBudWxsO1xuICAvLyBDb3VudGVyIG9mIHJlY2VpdmVkIHBhY2tldHNcbiAgX2luUGFja2V0Q291bnQgPSAwO1xuICAvLyBDb3VudGVyIGZvciBnZW5lcmF0aW5nIHVuaXF1ZSBtZXNzYWdlIElEc1xuICBfbWVzc2FnZUlkID0gTWF0aC5mbG9vcigoTWF0aC5yYW5kb20oKSAqIDB4RkZGRikgKyAweEZGRkYpO1xuICAvLyBJbmZvcm1hdGlvbiBhYm91dCB0aGUgc2VydmVyLCBpZiBjb25uZWN0ZWRcbiAgX3NlcnZlckluZm8gPSBudWxsO1xuICAvLyBQdXNoIG5vdGlmaWNhdGlvbiB0b2tlbi4gQ2FsbGVkIGRldmljZVRva2VuIGZvciBjb25zaXN0ZW5jeSB3aXRoIHRoZSBBbmRyb2lkIFNESy5cbiAgX2RldmljZVRva2VuID0gbnVsbDtcblxuICAvLyBDYWNoZSBvZiBwZW5kaW5nIHByb21pc2VzIGJ5IG1lc3NhZ2UgaWQuXG4gIF9wZW5kaW5nUHJvbWlzZXMgPSB7fTtcbiAgLy8gVGhlIFRpbWVvdXQgb2JqZWN0IHJldHVybmVkIGJ5IHRoZSByZWplY3QgZXhwaXJlZCBwcm9taXNlcyBzZXRJbnRlcnZhbC5cbiAgX2V4cGlyZVByb21pc2VzID0gbnVsbDtcblxuICAvLyBXZWJzb2NrZXQgb3IgbG9uZyBwb2xsaW5nIGNvbm5lY3Rpb24uXG4gIF9jb25uZWN0aW9uID0gbnVsbDtcblxuICAvLyBVc2UgaW5kZXhEQiBmb3IgY2FjaGluZyB0b3BpY3MgYW5kIG1lc3NhZ2VzLlxuICBfcGVyc2lzdCA9IGZhbHNlO1xuICAvLyBJbmRleGVkREIgd3JhcHBlciBvYmplY3QuXG4gIF9kYiA9IG51bGw7XG5cbiAgLy8gVGlub2RlJ3MgY2FjaGUgb2Ygb2JqZWN0c1xuICBfY2FjaGUgPSB7fTtcblxuICBjb25zdHJ1Y3Rvcihjb25maWcsIG9uQ29tcGxldGUpIHtcbiAgICB0aGlzLl9ob3N0ID0gY29uZmlnLmhvc3Q7XG4gICAgdGhpcy5fc2VjdXJlID0gY29uZmlnLnNlY3VyZTtcblxuICAgIC8vIENsaWVudC1wcm92aWRlZCBhcHBsaWNhdGlvbiBuYW1lLCBmb3JtYXQgPE5hbWU+Lzx2ZXJzaW9uIG51bWJlcj5cbiAgICB0aGlzLl9hcHBOYW1lID0gY29uZmlnLmFwcE5hbWUgfHwgXCJVbmRlZmluZWRcIjtcblxuICAgIC8vIEFQSSBLZXkuXG4gICAgdGhpcy5fYXBpS2V5ID0gY29uZmlnLmFwaUtleTtcblxuICAgIC8vIE5hbWUgYW5kIHZlcnNpb24gb2YgdGhlIGJyb3dzZXIuXG4gICAgdGhpcy5fcGxhdGZvcm0gPSBjb25maWcucGxhdGZvcm0gfHwgJ3dlYic7XG4gICAgLy8gVW5kZXJseWluZyBPUy5cbiAgICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5fYnJvd3NlciA9IGdldEJyb3dzZXJJbmZvKG5hdmlnYXRvci51c2VyQWdlbnQsIG5hdmlnYXRvci5wcm9kdWN0KTtcbiAgICAgIHRoaXMuX2h3b3MgPSBuYXZpZ2F0b3IucGxhdGZvcm07XG4gICAgICAvLyBUaGlzIGlzIHRoZSBkZWZhdWx0IGxhbmd1YWdlLiBJdCBjb3VsZCBiZSBjaGFuZ2VkIGJ5IGNsaWVudC5cbiAgICAgIHRoaXMuX2h1bWFuTGFuZ3VhZ2UgPSBuYXZpZ2F0b3IubGFuZ3VhZ2UgfHwgJ2VuLVVTJztcbiAgICB9XG5cbiAgICBDb25uZWN0aW9uLmxvZ2dlciA9IChzdHIsIC4uLmFyZ3MpID0+IHtcbiAgICAgIHRoaXMuI2xvZ2dlcihzdHIsIGFyZ3MpO1xuICAgIH07XG4gICAgRHJhZnR5LmxvZ2dlciA9IChzdHIsIC4uLmFyZ3MpID0+IHtcbiAgICAgIHRoaXMuI2xvZ2dlcihzdHIsIGFyZ3MpO1xuICAgIH07XG5cbiAgICAvLyBXZWJTb2NrZXQgb3IgbG9uZyBwb2xsaW5nIG5ldHdvcmsgY29ubmVjdGlvbi5cbiAgICBpZiAoY29uZmlnLnRyYW5zcG9ydCAhPSAnbHAnICYmIGNvbmZpZy50cmFuc3BvcnQgIT0gJ3dzJykge1xuICAgICAgY29uZmlnLnRyYW5zcG9ydCA9IGRldGVjdFRyYW5zcG9ydCgpO1xuICAgIH1cbiAgICB0aGlzLl9jb25uZWN0aW9uID0gbmV3IENvbm5lY3Rpb24oY29uZmlnLCBDb25zdC5QUk9UT0NPTF9WRVJTSU9OLCAvKiBhdXRvcmVjb25uZWN0ICovIHRydWUpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24ub25NZXNzYWdlID0gKGRhdGEpID0+IHtcbiAgICAgIC8vIENhbGwgdGhlIG1haW4gbWVzc2FnZSBkaXNwYXRjaGVyLlxuICAgICAgdGhpcy4jZGlzcGF0Y2hNZXNzYWdlKGRhdGEpO1xuICAgIH1cbiAgICB0aGlzLl9jb25uZWN0aW9uLm9uT3BlbiA9ICgpID0+IHtcbiAgICAgIC8vIFJlYWR5IHRvIHN0YXJ0IHNlbmRpbmcuXG4gICAgICB0aGlzLiNjb25uZWN0aW9uT3BlbigpO1xuICAgIH1cbiAgICB0aGlzLl9jb25uZWN0aW9uLm9uRGlzY29ubmVjdCA9IChlcnIsIGNvZGUpID0+IHtcbiAgICAgIHRoaXMuI2Rpc2Nvbm5lY3RlZChlcnIsIGNvZGUpO1xuICAgIH1cbiAgICAvLyBXcmFwcGVyIGZvciB0aGUgcmVjb25uZWN0IGl0ZXJhdG9yIGNhbGxiYWNrLlxuICAgIHRoaXMuX2Nvbm5lY3Rpb24ub25BdXRvcmVjb25uZWN0SXRlcmF0aW9uID0gKHRpbWVvdXQsIHByb21pc2UpID0+IHtcbiAgICAgIGlmICh0aGlzLm9uQXV0b3JlY29ubmVjdEl0ZXJhdGlvbikge1xuICAgICAgICB0aGlzLm9uQXV0b3JlY29ubmVjdEl0ZXJhdGlvbih0aW1lb3V0LCBwcm9taXNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9wZXJzaXN0ID0gY29uZmlnLnBlcnNpc3Q7XG4gICAgLy8gSW5pdGlhbGl6ZSBvYmplY3QgcmVnYXJkbGVzcy4gSXQgc2ltcGxpZmllcyB0aGUgY29kZS5cbiAgICB0aGlzLl9kYiA9IG5ldyBEQkNhY2hlKChlcnIpID0+IHtcbiAgICAgIHRoaXMuI2xvZ2dlcignREInLCBlcnIpO1xuICAgIH0sIHRoaXMubG9nZ2VyKTtcblxuICAgIGlmICh0aGlzLl9wZXJzaXN0KSB7XG4gICAgICAvLyBDcmVhdGUgdGhlIHBlcnNpc3RlbnQgY2FjaGUuXG4gICAgICAvLyBTdG9yZSBwcm9taXNlcyB0byBiZSByZXNvbHZlZCB3aGVuIG1lc3NhZ2VzIGxvYWQgaW50byBtZW1vcnkuXG4gICAgICBjb25zdCBwcm9tID0gW107XG4gICAgICB0aGlzLl9kYi5pbml0RGF0YWJhc2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gRmlyc3QgbG9hZCB0b3BpY3MgaW50byBtZW1vcnkuXG4gICAgICAgIHJldHVybiB0aGlzLl9kYi5tYXBUb3BpY3MoKGRhdGEpID0+IHtcbiAgICAgICAgICBsZXQgdG9waWMgPSB0aGlzLiNjYWNoZUdldCgndG9waWMnLCBkYXRhLm5hbWUpO1xuICAgICAgICAgIGlmICh0b3BpYykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZGF0YS5uYW1lID09IENvbnN0LlRPUElDX01FKSB7XG4gICAgICAgICAgICB0b3BpYyA9IG5ldyBUb3BpY01lKCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChkYXRhLm5hbWUgPT0gQ29uc3QuVE9QSUNfRk5EKSB7XG4gICAgICAgICAgICB0b3BpYyA9IG5ldyBUb3BpY0ZuZCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b3BpYyA9IG5ldyBUb3BpYyhkYXRhLm5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9kYi5kZXNlcmlhbGl6ZVRvcGljKHRvcGljLCBkYXRhKTtcbiAgICAgICAgICB0aGlzLiNhdHRhY2hDYWNoZVRvVG9waWModG9waWMpO1xuICAgICAgICAgIHRvcGljLl9jYWNoZVB1dFNlbGYoKTtcbiAgICAgICAgICAvLyBUb3BpYyBsb2FkZWQgZnJvbSBEQiBpcyBub3QgbmV3LlxuICAgICAgICAgIGRlbGV0ZSB0b3BpYy5fbmV3O1xuICAgICAgICAgIC8vIFJlcXVlc3QgdG8gbG9hZCBtZXNzYWdlcyBhbmQgc2F2ZSB0aGUgcHJvbWlzZS5cbiAgICAgICAgICBwcm9tLnB1c2godG9waWMuX2xvYWRNZXNzYWdlcyh0aGlzLl9kYikpO1xuICAgICAgICB9KTtcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAvLyBUaGVuIGxvYWQgdXNlcnMuXG4gICAgICAgIHJldHVybiB0aGlzLl9kYi5tYXBVc2VycygoZGF0YSkgPT4ge1xuICAgICAgICAgIHRoaXMuI2NhY2hlUHV0KCd1c2VyJywgZGF0YS51aWQsIG1lcmdlT2JqKHt9LCBkYXRhLnB1YmxpYykpO1xuICAgICAgICB9KTtcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAvLyBOb3cgd2FpdCBmb3IgYWxsIG1lc3NhZ2VzIHRvIGZpbmlzaCBsb2FkaW5nLlxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbSk7XG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKG9uQ29tcGxldGUpIHtcbiAgICAgICAgICBvbkNvbXBsZXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4jbG9nZ2VyKFwiUGVyc2lzdGVudCBjYWNoZSBpbml0aWFsaXplZC5cIik7XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGlmIChvbkNvbXBsZXRlKSB7XG4gICAgICAgICAgb25Db21wbGV0ZShlcnIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuI2xvZ2dlcihcIkZhaWxlZCB0byBpbml0aWFsaXplIHBlcnNpc3RlbnQgY2FjaGU6XCIsIGVycik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGIuZGVsZXRlRGF0YWJhc2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKG9uQ29tcGxldGUpIHtcbiAgICAgICAgICBvbkNvbXBsZXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFByaXZhdGUgbWV0aG9kcy5cblxuICAvLyBDb25zb2xlIGxvZ2dlci4gQmFiZWwgc29tZWhvdyBmYWlscyB0byBwYXJzZSAnLi4ucmVzdCcgcGFyYW1ldGVyLlxuICAjbG9nZ2VyKHN0ciwgLi4uYXJncykge1xuICAgIGlmICh0aGlzLl9sb2dnaW5nRW5hYmxlZCkge1xuICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKCk7XG4gICAgICBjb25zdCBkYXRlU3RyaW5nID0gKCcwJyArIGQuZ2V0VVRDSG91cnMoKSkuc2xpY2UoLTIpICsgJzonICtcbiAgICAgICAgKCcwJyArIGQuZ2V0VVRDTWludXRlcygpKS5zbGljZSgtMikgKyAnOicgK1xuICAgICAgICAoJzAnICsgZC5nZXRVVENTZWNvbmRzKCkpLnNsaWNlKC0yKSArICcuJyArXG4gICAgICAgICgnMDAnICsgZC5nZXRVVENNaWxsaXNlY29uZHMoKSkuc2xpY2UoLTMpO1xuXG4gICAgICBjb25zb2xlLmxvZygnWycgKyBkYXRlU3RyaW5nICsgJ10nLCBzdHIsIGFyZ3Muam9pbignICcpKTtcbiAgICB9XG4gIH1cblxuICAvLyBHZW5lcmF0b3Igb2YgZGVmYXVsdCBwcm9taXNlcyBmb3Igc2VudCBwYWNrZXRzLlxuICAjbWFrZVByb21pc2UoaWQpIHtcbiAgICBsZXQgcHJvbWlzZSA9IG51bGw7XG4gICAgaWYgKGlkKSB7XG4gICAgICBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAvLyBTdG9yZWQgY2FsbGJhY2tzIHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIHJlc3BvbnNlIHBhY2tldCB3aXRoIHRoaXMgSWQgYXJyaXZlc1xuICAgICAgICB0aGlzLl9wZW5kaW5nUHJvbWlzZXNbaWRdID0ge1xuICAgICAgICAgICdyZXNvbHZlJzogcmVzb2x2ZSxcbiAgICAgICAgICAncmVqZWN0JzogcmVqZWN0LFxuICAgICAgICAgICd0cyc6IG5ldyBEYXRlKClcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfTtcblxuICAvLyBSZXNvbHZlIG9yIHJlamVjdCBhIHBlbmRpbmcgcHJvbWlzZS5cbiAgLy8gVW5yZXNvbHZlZCBwcm9taXNlcyBhcmUgc3RvcmVkIGluIF9wZW5kaW5nUHJvbWlzZXMuXG4gICNleGVjUHJvbWlzZShpZCwgY29kZSwgb25PSywgZXJyb3JUZXh0KSB7XG4gICAgY29uc3QgY2FsbGJhY2tzID0gdGhpcy5fcGVuZGluZ1Byb21pc2VzW2lkXTtcbiAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICBkZWxldGUgdGhpcy5fcGVuZGluZ1Byb21pc2VzW2lkXTtcbiAgICAgIGlmIChjb2RlID49IDIwMCAmJiBjb2RlIDwgNDAwKSB7XG4gICAgICAgIGlmIChjYWxsYmFja3MucmVzb2x2ZSkge1xuICAgICAgICAgIGNhbGxiYWNrcy5yZXNvbHZlKG9uT0spO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGNhbGxiYWNrcy5yZWplY3QpIHtcbiAgICAgICAgY2FsbGJhY2tzLnJlamVjdChuZXcgRXJyb3IoYCR7ZXJyb3JUZXh0fSAoJHtjb2RlfSlgKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gU2VuZCBhIHBhY2tldC4gSWYgcGFja2V0IGlkIGlzIHByb3ZpZGVkIHJldHVybiBhIHByb21pc2UuXG4gICNzZW5kKHBrdCwgaWQpIHtcbiAgICBsZXQgcHJvbWlzZTtcbiAgICBpZiAoaWQpIHtcbiAgICAgIHByb21pc2UgPSB0aGlzLiNtYWtlUHJvbWlzZShpZCk7XG4gICAgfVxuICAgIHBrdCA9IHNpbXBsaWZ5KHBrdCk7XG4gICAgbGV0IG1zZyA9IEpTT04uc3RyaW5naWZ5KHBrdCk7XG4gICAgdGhpcy4jbG9nZ2VyKFwib3V0OiBcIiArICh0aGlzLl90cmltTG9uZ1N0cmluZ3MgPyBKU09OLnN0cmluZ2lmeShwa3QsIGpzb25Mb2dnZXJIZWxwZXIpIDogbXNnKSk7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uc2VuZFRleHQobXNnKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIElmIHNlbmRUZXh0IHRocm93cywgd3JhcCB0aGUgZXJyb3IgaW4gYSBwcm9taXNlIG9yIHJldGhyb3cuXG4gICAgICBpZiAoaWQpIHtcbiAgICAgICAgdGhpcy4jZXhlY1Byb21pc2UoaWQsIENvbm5lY3Rpb24uTkVUV09SS19FUlJPUiwgbnVsbCwgZXJyLm1lc3NhZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIC8vIFRoZSBtYWluIG1lc3NhZ2UgZGlzcGF0Y2hlci5cbiAgI2Rpc3BhdGNoTWVzc2FnZShkYXRhKSB7XG4gICAgLy8gU2tpcCBlbXB0eSByZXNwb25zZS4gVGhpcyBoYXBwZW5zIHdoZW4gTFAgdGltZXMgb3V0LlxuICAgIGlmICghZGF0YSlcbiAgICAgIHJldHVybjtcblxuICAgIHRoaXMuX2luUGFja2V0Q291bnQrKztcblxuICAgIC8vIFNlbmQgcmF3IG1lc3NhZ2UgdG8gbGlzdGVuZXJcbiAgICBpZiAodGhpcy5vblJhd01lc3NhZ2UpIHtcbiAgICAgIHRoaXMub25SYXdNZXNzYWdlKGRhdGEpO1xuICAgIH1cblxuICAgIGlmIChkYXRhID09PSAnMCcpIHtcbiAgICAgIC8vIFNlcnZlciByZXNwb25zZSB0byBhIG5ldHdvcmsgcHJvYmUuXG4gICAgICBpZiAodGhpcy5vbk5ldHdvcmtQcm9iZSkge1xuICAgICAgICB0aGlzLm9uTmV0d29ya1Byb2JlKCk7XG4gICAgICB9XG4gICAgICAvLyBObyBwcm9jZXNzaW5nIGlzIG5lY2Vzc2FyeS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcGt0ID0gSlNPTi5wYXJzZShkYXRhLCBqc29uUGFyc2VIZWxwZXIpO1xuICAgIGlmICghcGt0KSB7XG4gICAgICB0aGlzLiNsb2dnZXIoXCJpbjogXCIgKyBkYXRhKTtcbiAgICAgIHRoaXMuI2xvZ2dlcihcIkVSUk9SOiBmYWlsZWQgdG8gcGFyc2UgZGF0YVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4jbG9nZ2VyKFwiaW46IFwiICsgKHRoaXMuX3RyaW1Mb25nU3RyaW5ncyA/IEpTT04uc3RyaW5naWZ5KHBrdCwganNvbkxvZ2dlckhlbHBlcikgOiBkYXRhKSk7XG5cbiAgICAgIC8vIFNlbmQgY29tcGxldGUgcGFja2V0IHRvIGxpc3RlbmVyXG4gICAgICBpZiAodGhpcy5vbk1lc3NhZ2UpIHtcbiAgICAgICAgdGhpcy5vbk1lc3NhZ2UocGt0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBrdC5jdHJsKSB7XG4gICAgICAgIC8vIEhhbmRsaW5nIHtjdHJsfSBtZXNzYWdlXG4gICAgICAgIGlmICh0aGlzLm9uQ3RybE1lc3NhZ2UpIHtcbiAgICAgICAgICB0aGlzLm9uQ3RybE1lc3NhZ2UocGt0LmN0cmwpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSBvciByZWplY3QgYSBwZW5kaW5nIHByb21pc2UsIGlmIGFueVxuICAgICAgICBpZiAocGt0LmN0cmwuaWQpIHtcbiAgICAgICAgICB0aGlzLiNleGVjUHJvbWlzZShwa3QuY3RybC5pZCwgcGt0LmN0cmwuY29kZSwgcGt0LmN0cmwsIHBrdC5jdHJsLnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGlmIChwa3QuY3RybC5jb2RlID09IDIwNSAmJiBwa3QuY3RybC50ZXh0ID09ICdldmljdGVkJykge1xuICAgICAgICAgICAgLy8gVXNlciBldmljdGVkIGZyb20gdG9waWMuXG4gICAgICAgICAgICBjb25zdCB0b3BpYyA9IHRoaXMuI2NhY2hlR2V0KCd0b3BpYycsIHBrdC5jdHJsLnRvcGljKTtcbiAgICAgICAgICAgIGlmICh0b3BpYykge1xuICAgICAgICAgICAgICB0b3BpYy5fcmVzZXRTdWIoKTtcbiAgICAgICAgICAgICAgaWYgKHBrdC5jdHJsLnBhcmFtcyAmJiBwa3QuY3RybC5wYXJhbXMudW5zdWIpIHtcbiAgICAgICAgICAgICAgICB0b3BpYy5fZ29uZSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChwa3QuY3RybC5jb2RlIDwgMzAwICYmIHBrdC5jdHJsLnBhcmFtcykge1xuICAgICAgICAgICAgaWYgKHBrdC5jdHJsLnBhcmFtcy53aGF0ID09ICdkYXRhJykge1xuICAgICAgICAgICAgICAvLyBjb2RlPTIwOCwgYWxsIG1lc3NhZ2VzIHJlY2VpdmVkOiBcInBhcmFtc1wiOntcImNvdW50XCI6MTEsXCJ3aGF0XCI6XCJkYXRhXCJ9LFxuICAgICAgICAgICAgICBjb25zdCB0b3BpYyA9IHRoaXMuI2NhY2hlR2V0KCd0b3BpYycsIHBrdC5jdHJsLnRvcGljKTtcbiAgICAgICAgICAgICAgaWYgKHRvcGljKSB7XG4gICAgICAgICAgICAgICAgdG9waWMuX2FsbE1lc3NhZ2VzUmVjZWl2ZWQocGt0LmN0cmwucGFyYW1zLmNvdW50KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChwa3QuY3RybC5wYXJhbXMud2hhdCA9PSAnc3ViJykge1xuICAgICAgICAgICAgICAvLyBjb2RlPTIwNCwgdGhlIHRvcGljIGhhcyBubyAocmVmcmVzaGVkKSBzdWJzY3JpcHRpb25zLlxuICAgICAgICAgICAgICBjb25zdCB0b3BpYyA9IHRoaXMuI2NhY2hlR2V0KCd0b3BpYycsIHBrdC5jdHJsLnRvcGljKTtcbiAgICAgICAgICAgICAgaWYgKHRvcGljKSB7XG4gICAgICAgICAgICAgICAgLy8gVHJpZ2dlciB0b3BpYy5vblN1YnNVcGRhdGVkLlxuICAgICAgICAgICAgICAgIHRvcGljLl9wcm9jZXNzTWV0YVN1YihbXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sIDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgaWYgKHBrdC5tZXRhKSB7XG4gICAgICAgICAgICAvLyBIYW5kbGluZyBhIHttZXRhfSBtZXNzYWdlLlxuICAgICAgICAgICAgLy8gUHJlZmVycmVkIEFQSTogUm91dGUgbWV0YSB0byB0b3BpYywgaWYgb25lIGlzIHJlZ2lzdGVyZWRcbiAgICAgICAgICAgIGNvbnN0IHRvcGljID0gdGhpcy4jY2FjaGVHZXQoJ3RvcGljJywgcGt0Lm1ldGEudG9waWMpO1xuICAgICAgICAgICAgaWYgKHRvcGljKSB7XG4gICAgICAgICAgICAgIHRvcGljLl9yb3V0ZU1ldGEocGt0Lm1ldGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocGt0Lm1ldGEuaWQpIHtcbiAgICAgICAgICAgICAgdGhpcy4jZXhlY1Byb21pc2UocGt0Lm1ldGEuaWQsIDIwMCwgcGt0Lm1ldGEsICdNRVRBJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNlY29uZGFyeSBBUEk6IGNhbGxiYWNrXG4gICAgICAgICAgICBpZiAodGhpcy5vbk1ldGFNZXNzYWdlKSB7XG4gICAgICAgICAgICAgIHRoaXMub25NZXRhTWVzc2FnZShwa3QubWV0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChwa3QuZGF0YSkge1xuICAgICAgICAgICAgLy8gSGFuZGxpbmcge2RhdGF9IG1lc3NhZ2VcbiAgICAgICAgICAgIC8vIFByZWZlcnJlZCBBUEk6IFJvdXRlIGRhdGEgdG8gdG9waWMsIGlmIG9uZSBpcyByZWdpc3RlcmVkXG4gICAgICAgICAgICBjb25zdCB0b3BpYyA9IHRoaXMuI2NhY2hlR2V0KCd0b3BpYycsIHBrdC5kYXRhLnRvcGljKTtcbiAgICAgICAgICAgIGlmICh0b3BpYykge1xuICAgICAgICAgICAgICB0b3BpYy5fcm91dGVEYXRhKHBrdC5kYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2Vjb25kYXJ5IEFQSTogQ2FsbCBjYWxsYmFja1xuICAgICAgICAgICAgaWYgKHRoaXMub25EYXRhTWVzc2FnZSkge1xuICAgICAgICAgICAgICB0aGlzLm9uRGF0YU1lc3NhZ2UocGt0LmRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAocGt0LnByZXMpIHtcbiAgICAgICAgICAgIC8vIEhhbmRsaW5nIHtwcmVzfSBtZXNzYWdlXG4gICAgICAgICAgICAvLyBQcmVmZXJyZWQgQVBJOiBSb3V0ZSBwcmVzZW5jZSB0byB0b3BpYywgaWYgb25lIGlzIHJlZ2lzdGVyZWRcbiAgICAgICAgICAgIGNvbnN0IHRvcGljID0gdGhpcy4jY2FjaGVHZXQoJ3RvcGljJywgcGt0LnByZXMudG9waWMpO1xuICAgICAgICAgICAgaWYgKHRvcGljKSB7XG4gICAgICAgICAgICAgIHRvcGljLl9yb3V0ZVByZXMocGt0LnByZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZWNvbmRhcnkgQVBJIC0gY2FsbGJhY2tcbiAgICAgICAgICAgIGlmICh0aGlzLm9uUHJlc01lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgdGhpcy5vblByZXNNZXNzYWdlKHBrdC5wcmVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHBrdC5pbmZvKSB7XG4gICAgICAgICAgICAvLyB7aW5mb30gbWVzc2FnZSAtIHJlYWQvcmVjZWl2ZWQgbm90aWZpY2F0aW9ucyBhbmQga2V5IHByZXNzZXNcbiAgICAgICAgICAgIC8vIFByZWZlcnJlZCBBUEk6IFJvdXRlIHtpbmZvfX0gdG8gdG9waWMsIGlmIG9uZSBpcyByZWdpc3RlcmVkXG4gICAgICAgICAgICBjb25zdCB0b3BpYyA9IHRoaXMuI2NhY2hlR2V0KCd0b3BpYycsIHBrdC5pbmZvLnRvcGljKTtcbiAgICAgICAgICAgIGlmICh0b3BpYykge1xuICAgICAgICAgICAgICB0b3BpYy5fcm91dGVJbmZvKHBrdC5pbmZvKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2Vjb25kYXJ5IEFQSSAtIGNhbGxiYWNrXG4gICAgICAgICAgICBpZiAodGhpcy5vbkluZm9NZXNzYWdlKSB7XG4gICAgICAgICAgICAgIHRoaXMub25JbmZvTWVzc2FnZShwa3QuaW5mbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuI2xvZ2dlcihcIkVSUk9SOiBVbmtub3duIHBhY2tldCByZWNlaXZlZC5cIik7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAwKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBDb25uZWN0aW9uIG9wZW4sIHJlYWR5IHRvIHN0YXJ0IHNlbmRpbmcuXG4gICNjb25uZWN0aW9uT3BlbigpIHtcbiAgICBpZiAoIXRoaXMuX2V4cGlyZVByb21pc2VzKSB7XG4gICAgICAvLyBSZWplY3QgcHJvbWlzZXMgd2hpY2ggaGF2ZSBub3QgYmVlbiByZXNvbHZlZCBmb3IgdG9vIGxvbmcuXG4gICAgICB0aGlzLl9leHBpcmVQcm9taXNlcyA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKFwiVGltZW91dCAoNTA0KVwiKTtcbiAgICAgICAgY29uc3QgZXhwaXJlcyA9IG5ldyBEYXRlKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gQ29uc3QuRVhQSVJFX1BST01JU0VTX1RJTUVPVVQpO1xuICAgICAgICBmb3IgKGxldCBpZCBpbiB0aGlzLl9wZW5kaW5nUHJvbWlzZXMpIHtcbiAgICAgICAgICBsZXQgY2FsbGJhY2tzID0gdGhpcy5fcGVuZGluZ1Byb21pc2VzW2lkXTtcbiAgICAgICAgICBpZiAoY2FsbGJhY2tzICYmIGNhbGxiYWNrcy50cyA8IGV4cGlyZXMpIHtcbiAgICAgICAgICAgIHRoaXMuI2xvZ2dlcihcIlByb21pc2UgZXhwaXJlZFwiLCBpZCk7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fcGVuZGluZ1Byb21pc2VzW2lkXTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFja3MucmVqZWN0KSB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrcy5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIENvbnN0LkVYUElSRV9QUk9NSVNFU19QRVJJT0QpO1xuICAgIH1cbiAgICB0aGlzLmhlbGxvKCk7XG4gIH1cblxuICAjZGlzY29ubmVjdGVkKGVyciwgY29kZSkge1xuICAgIHRoaXMuX2luUGFja2V0Q291bnQgPSAwO1xuICAgIHRoaXMuX3NlcnZlckluZm8gPSBudWxsO1xuICAgIHRoaXMuX2F1dGhlbnRpY2F0ZWQgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLl9leHBpcmVQcm9taXNlcykge1xuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLl9leHBpcmVQcm9taXNlcyk7XG4gICAgICB0aGlzLl9leHBpcmVQcm9taXNlcyA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gTWFyayBhbGwgdG9waWNzIGFzIHVuc3Vic2NyaWJlZFxuICAgIHRoaXMuI2NhY2hlTWFwKCd0b3BpYycsICh0b3BpYywga2V5KSA9PiB7XG4gICAgICB0b3BpYy5fcmVzZXRTdWIoKTtcbiAgICB9KTtcblxuICAgIC8vIFJlamVjdCBhbGwgcGVuZGluZyBwcm9taXNlc1xuICAgIGZvciAobGV0IGtleSBpbiB0aGlzLl9wZW5kaW5nUHJvbWlzZXMpIHtcbiAgICAgIGNvbnN0IGNhbGxiYWNrcyA9IHRoaXMuX3BlbmRpbmdQcm9taXNlc1trZXldO1xuICAgICAgaWYgKGNhbGxiYWNrcyAmJiBjYWxsYmFja3MucmVqZWN0KSB7XG4gICAgICAgIGNhbGxiYWNrcy5yZWplY3QoZXJyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fcGVuZGluZ1Byb21pc2VzID0ge307XG5cbiAgICBpZiAodGhpcy5vbkRpc2Nvbm5lY3QpIHtcbiAgICAgIHRoaXMub25EaXNjb25uZWN0KGVycik7XG4gICAgfVxuICB9XG5cbiAgLy8gR2V0IFVzZXIgQWdlbnQgc3RyaW5nXG4gICNnZXRVc2VyQWdlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FwcE5hbWUgKyAnICgnICsgKHRoaXMuX2Jyb3dzZXIgPyB0aGlzLl9icm93c2VyICsgJzsgJyA6ICcnKSArIHRoaXMuX2h3b3MgKyAnKTsgJyArIENvbnN0LkxJQlJBUlk7XG4gIH1cblxuICAvLyBHZW5lcmF0b3Igb2YgcGFja2V0cyBzdHVic1xuICAjaW5pdFBhY2tldCh0eXBlLCB0b3BpYykge1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnaGknOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICdoaSc6IHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMuZ2V0TmV4dFVuaXF1ZUlkKCksXG4gICAgICAgICAgICAndmVyJzogQ29uc3QuVkVSU0lPTixcbiAgICAgICAgICAgICd1YSc6IHRoaXMuI2dldFVzZXJBZ2VudCgpLFxuICAgICAgICAgICAgJ2Rldic6IHRoaXMuX2RldmljZVRva2VuLFxuICAgICAgICAgICAgJ2xhbmcnOiB0aGlzLl9odW1hbkxhbmd1YWdlLFxuICAgICAgICAgICAgJ3BsYXRmJzogdGhpcy5fcGxhdGZvcm1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgIGNhc2UgJ2FjYyc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgJ2FjYyc6IHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMuZ2V0TmV4dFVuaXF1ZUlkKCksXG4gICAgICAgICAgICAndXNlcic6IG51bGwsXG4gICAgICAgICAgICAnc2NoZW1lJzogbnVsbCxcbiAgICAgICAgICAgICdzZWNyZXQnOiBudWxsLFxuICAgICAgICAgICAgJ2xvZ2luJzogZmFsc2UsXG4gICAgICAgICAgICAndGFncyc6IG51bGwsXG4gICAgICAgICAgICAnZGVzYyc6IHt9LFxuICAgICAgICAgICAgJ2NyZWQnOiB7fVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgY2FzZSAnbG9naW4nOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICdsb2dpbic6IHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMuZ2V0TmV4dFVuaXF1ZUlkKCksXG4gICAgICAgICAgICAnc2NoZW1lJzogbnVsbCxcbiAgICAgICAgICAgICdzZWNyZXQnOiBudWxsXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICBjYXNlICdzdWInOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICdzdWInOiB7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLmdldE5leHRVbmlxdWVJZCgpLFxuICAgICAgICAgICAgJ3RvcGljJzogdG9waWMsXG4gICAgICAgICAgICAnc2V0Jzoge30sXG4gICAgICAgICAgICAnZ2V0Jzoge31cbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgIGNhc2UgJ2xlYXZlJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAnbGVhdmUnOiB7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLmdldE5leHRVbmlxdWVJZCgpLFxuICAgICAgICAgICAgJ3RvcGljJzogdG9waWMsXG4gICAgICAgICAgICAndW5zdWInOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgY2FzZSAncHViJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAncHViJzoge1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5nZXROZXh0VW5pcXVlSWQoKSxcbiAgICAgICAgICAgICd0b3BpYyc6IHRvcGljLFxuICAgICAgICAgICAgJ25vZWNobyc6IGZhbHNlLFxuICAgICAgICAgICAgJ2hlYWQnOiBudWxsLFxuICAgICAgICAgICAgJ2NvbnRlbnQnOiB7fVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgY2FzZSAnZ2V0JzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAnZ2V0Jzoge1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5nZXROZXh0VW5pcXVlSWQoKSxcbiAgICAgICAgICAgICd0b3BpYyc6IHRvcGljLFxuICAgICAgICAgICAgJ3doYXQnOiBudWxsLFxuICAgICAgICAgICAgJ2Rlc2MnOiB7fSxcbiAgICAgICAgICAgICdzdWInOiB7fSxcbiAgICAgICAgICAgICdkYXRhJzoge31cbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgIGNhc2UgJ3NldCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgJ3NldCc6IHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMuZ2V0TmV4dFVuaXF1ZUlkKCksXG4gICAgICAgICAgICAndG9waWMnOiB0b3BpYyxcbiAgICAgICAgICAgICdkZXNjJzoge30sXG4gICAgICAgICAgICAnc3ViJzoge30sXG4gICAgICAgICAgICAndGFncyc6IFtdXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICBjYXNlICdkZWwnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICdkZWwnOiB7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLmdldE5leHRVbmlxdWVJZCgpLFxuICAgICAgICAgICAgJ3RvcGljJzogdG9waWMsXG4gICAgICAgICAgICAnd2hhdCc6IG51bGwsXG4gICAgICAgICAgICAnZGVsc2VxJzogbnVsbCxcbiAgICAgICAgICAgICd1c2VyJzogbnVsbCxcbiAgICAgICAgICAgICdoYXJkJzogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgIGNhc2UgJ25vdGUnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICdub3RlJzoge1xuICAgICAgICAgICAgLy8gbm8gaWQgYnkgZGVzaWduXG4gICAgICAgICAgICAndG9waWMnOiB0b3BpYyxcbiAgICAgICAgICAgICd3aGF0JzogbnVsbCxcbiAgICAgICAgICAgICdzZXEnOiB1bmRlZmluZWQgLy8gdGhlIHNlcnZlci1zaWRlIG1lc3NhZ2UgaWQgYWtub3dsZWRnZWQgYXMgcmVjZWl2ZWQgb3IgcmVhZFxuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHBhY2tldCB0eXBlIHJlcXVlc3RlZDogJHt0eXBlfWApO1xuICAgIH1cbiAgfVxuXG4gIC8vIENhY2hlIG1hbmFnZW1lbnRcbiAgI2NhY2hlUHV0KHR5cGUsIG5hbWUsIG9iaikge1xuICAgIHRoaXMuX2NhY2hlW3R5cGUgKyAnOicgKyBuYW1lXSA9IG9iajtcbiAgfVxuICAjY2FjaGVHZXQodHlwZSwgbmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9jYWNoZVt0eXBlICsgJzonICsgbmFtZV07XG4gIH1cbiAgI2NhY2hlRGVsKHR5cGUsIG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FjaGVbdHlwZSArICc6JyArIG5hbWVdO1xuICB9XG5cbiAgLy8gRW51bWVyYXRlIGFsbCBpdGVtcyBpbiBjYWNoZSwgY2FsbCBmdW5jIGZvciBlYWNoIGl0ZW0uXG4gIC8vIEVudW1lcmF0aW9uIHN0b3BzIGlmIGZ1bmMgcmV0dXJucyB0cnVlLlxuICAjY2FjaGVNYXAodHlwZSwgZnVuYywgY29udGV4dCkge1xuICAgIGNvbnN0IGtleSA9IHR5cGUgPyB0eXBlICsgJzonIDogdW5kZWZpbmVkO1xuICAgIGZvciAobGV0IGlkeCBpbiB0aGlzLl9jYWNoZSkge1xuICAgICAgaWYgKCFrZXkgfHwgaWR4LmluZGV4T2Yoa2V5KSA9PSAwKSB7XG4gICAgICAgIGlmIChmdW5jLmNhbGwoY29udGV4dCwgdGhpcy5fY2FjaGVbaWR4XSwgaWR4KSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gTWFrZSBsaW1pdGVkIGNhY2hlIG1hbmFnZW1lbnQgYXZhaWxhYmxlIHRvIHRvcGljLlxuICAvLyBDYWNoaW5nIHVzZXIucHVibGljIG9ubHkuIEV2ZXJ5dGhpbmcgZWxzZSBpcyBwZXItdG9waWMuXG4gICNhdHRhY2hDYWNoZVRvVG9waWModG9waWMpIHtcbiAgICB0b3BpYy5fdGlub2RlID0gdGhpcztcblxuICAgIHRvcGljLl9jYWNoZUdldFVzZXIgPSAodWlkKSA9PiB7XG4gICAgICBjb25zdCBwdWIgPSB0aGlzLiNjYWNoZUdldCgndXNlcicsIHVpZCk7XG4gICAgICBpZiAocHViKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdXNlcjogdWlkLFxuICAgICAgICAgIHB1YmxpYzogbWVyZ2VPYmooe30sIHB1YilcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICB0b3BpYy5fY2FjaGVQdXRVc2VyID0gKHVpZCwgdXNlcikgPT4ge1xuICAgICAgdGhpcy4jY2FjaGVQdXQoJ3VzZXInLCB1aWQsIG1lcmdlT2JqKHt9LCB1c2VyLnB1YmxpYykpO1xuICAgIH07XG4gICAgdG9waWMuX2NhY2hlRGVsVXNlciA9ICh1aWQpID0+IHtcbiAgICAgIHRoaXMuI2NhY2hlRGVsKCd1c2VyJywgdWlkKTtcbiAgICB9O1xuICAgIHRvcGljLl9jYWNoZVB1dFNlbGYgPSAoKSA9PiB7XG4gICAgICB0aGlzLiNjYWNoZVB1dCgndG9waWMnLCB0b3BpYy5uYW1lLCB0b3BpYyk7XG4gICAgfTtcbiAgICB0b3BpYy5fY2FjaGVEZWxTZWxmID0gKCkgPT4ge1xuICAgICAgdGhpcy4jY2FjaGVEZWwoJ3RvcGljJywgdG9waWMubmFtZSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE9uIHN1Y2Nlc3NmdWwgbG9naW4gc2F2ZSBzZXJ2ZXItcHJvdmlkZWQgZGF0YS5cbiAgI2xvZ2luU3VjY2Vzc2Z1bChjdHJsKSB7XG4gICAgaWYgKCFjdHJsLnBhcmFtcyB8fCAhY3RybC5wYXJhbXMudXNlcikge1xuICAgICAgcmV0dXJuIGN0cmw7XG4gICAgfVxuICAgIC8vIFRoaXMgaXMgYSByZXNwb25zZSB0byBhIHN1Y2Nlc3NmdWwgbG9naW4sXG4gICAgLy8gZXh0cmFjdCBVSUQgYW5kIHNlY3VyaXR5IHRva2VuLCBzYXZlIGl0IGluIFRpbm9kZSBtb2R1bGVcbiAgICB0aGlzLl9teVVJRCA9IGN0cmwucGFyYW1zLnVzZXI7XG4gICAgdGhpcy5fYXV0aGVudGljYXRlZCA9IChjdHJsICYmIGN0cmwuY29kZSA+PSAyMDAgJiYgY3RybC5jb2RlIDwgMzAwKTtcbiAgICBpZiAoY3RybC5wYXJhbXMgJiYgY3RybC5wYXJhbXMudG9rZW4gJiYgY3RybC5wYXJhbXMuZXhwaXJlcykge1xuICAgICAgdGhpcy5fYXV0aFRva2VuID0ge1xuICAgICAgICB0b2tlbjogY3RybC5wYXJhbXMudG9rZW4sXG4gICAgICAgIGV4cGlyZXM6IGN0cmwucGFyYW1zLmV4cGlyZXNcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2F1dGhUb2tlbiA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub25Mb2dpbikge1xuICAgICAgdGhpcy5vbkxvZ2luKGN0cmwuY29kZSwgY3RybC50ZXh0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3RybDtcbiAgfVxuXG4gIC8vIFN0YXRpYyBtZXRob2RzLlxuICAvKipcbiAgICogSGVscGVyIG1ldGhvZCB0byBwYWNrYWdlIGFjY291bnQgY3JlZGVudGlhbC5cbiAgICpcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAc3RhdGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgQ3JlZGVudGlhbH0gbWV0aCAtIHZhbGlkYXRpb24gbWV0aG9kIG9yIG9iamVjdCB3aXRoIHZhbGlkYXRpb24gZGF0YS5cbiAgICogQHBhcmFtIHtzdHJpbmc9fSB2YWwgLSB2YWxpZGF0aW9uIHZhbHVlIChlLmcuIGVtYWlsIG9yIHBob25lIG51bWJlcikuXG4gICAqIEBwYXJhbSB7T2JqZWN0PX0gcGFyYW1zIC0gdmFsaWRhdGlvbiBwYXJhbWV0ZXJzLlxuICAgKiBAcGFyYW0ge3N0cmluZz19IHJlc3AgLSB2YWxpZGF0aW9uIHJlc3BvbnNlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7QXJyYXkuPENyZWRlbnRpYWw+fSBhcnJheSB3aXRoIGEgc2luZ2xlIGNyZWRlbnRpYWwgb3IgPGNvZGU+bnVsbDwvY29kZT4gaWYgbm8gdmFsaWQgY3JlZGVudGlhbHMgd2VyZSBnaXZlbi5cbiAgICovXG4gIHN0YXRpYyBjcmVkZW50aWFsKG1ldGgsIHZhbCwgcGFyYW1zLCByZXNwKSB7XG4gICAgaWYgKHR5cGVvZiBtZXRoID09ICdvYmplY3QnKSB7XG4gICAgICAoe1xuICAgICAgICB2YWwsXG4gICAgICAgIHBhcmFtcyxcbiAgICAgICAgcmVzcCxcbiAgICAgICAgbWV0aFxuICAgICAgfSA9IG1ldGgpO1xuICAgIH1cbiAgICBpZiAobWV0aCAmJiAodmFsIHx8IHJlc3ApKSB7XG4gICAgICByZXR1cm4gW3tcbiAgICAgICAgJ21ldGgnOiBtZXRoLFxuICAgICAgICAndmFsJzogdmFsLFxuICAgICAgICAncmVzcCc6IHJlc3AsXG4gICAgICAgICdwYXJhbXMnOiBwYXJhbXNcbiAgICAgIH1dO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgdG9waWMgdHlwZSBmcm9tIHRvcGljJ3MgbmFtZTogZ3JwLCBwMnAsIG1lLCBmbmQsIHN5cy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAc3RhdGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiB0aGUgdG9waWMgdG8gdGVzdC5cbiAgICogQHJldHVybnMge3N0cmluZ30gT25lIG9mIDxjb2RlPlwibWVcIjwvY29kZT4sIDxjb2RlPlwiZm5kXCI8L2NvZGU+LCA8Y29kZT5cInN5c1wiPC9jb2RlPiwgPGNvZGU+XCJncnBcIjwvY29kZT4sXG4gICAqICAgIDxjb2RlPlwicDJwXCI8L2NvZGU+IG9yIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4uXG4gICAqL1xuICBzdGF0aWMgdG9waWNUeXBlKG5hbWUpIHtcbiAgICByZXR1cm4gVG9waWMudG9waWNUeXBlKG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBnaXZlbiB0b3BpYyBuYW1lIGlzIGEgbmFtZSBvZiBhICdtZScgdG9waWMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIHRlc3QuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiB0aGUgbmFtZSBpcyBhIG5hbWUgb2YgYSAnbWUnIHRvcGljLCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICAgKi9cbiAgc3RhdGljIGlzTWVUb3BpY05hbWUobmFtZSkge1xuICAgIHJldHVybiBUb3BpYy5pc01lVG9waWNOYW1lKG5hbWUpO1xuICB9XG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgZ2l2ZW4gdG9waWMgbmFtZSBpcyBhIG5hbWUgb2YgYSBncm91cCB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAc3RhdGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiB0aGUgdG9waWMgdG8gdGVzdC5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IDxjb2RlPnRydWU8L2NvZGU+IGlmIHRoZSBuYW1lIGlzIGEgbmFtZSBvZiBhIGdyb3VwIHRvcGljLCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICAgKi9cbiAgc3RhdGljIGlzR3JvdXBUb3BpY05hbWUobmFtZSkge1xuICAgIHJldHVybiBUb3BpYy5pc0dyb3VwVG9waWNOYW1lKG5hbWUpO1xuICB9XG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgZ2l2ZW4gdG9waWMgbmFtZSBpcyBhIG5hbWUgb2YgYSBwMnAgdG9waWMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIHRlc3QuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiB0aGUgbmFtZSBpcyBhIG5hbWUgb2YgYSBwMnAgdG9waWMsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBzdGF0aWMgaXNQMlBUb3BpY05hbWUobmFtZSkge1xuICAgIHJldHVybiBUb3BpYy5pc1AyUFRvcGljTmFtZShuYW1lKTtcbiAgfVxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIGdpdmVuIHRvcGljIG5hbWUgaXMgYSBuYW1lIG9mIGEgY29tbXVuaWNhdGlvbiB0b3BpYywgaS5lLiBQMlAgb3IgZ3JvdXAuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIHRlc3QuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiB0aGUgbmFtZSBpcyBhIG5hbWUgb2YgYSBwMnAgb3IgZ3JvdXAgdG9waWMsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBzdGF0aWMgaXNDb21tVG9waWNOYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gVG9waWMuaXNDb21tVG9waWNOYW1lKG5hbWUpO1xuICB9XG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgdG9waWMgbmFtZSBpcyBhIG5hbWUgb2YgYSBuZXcgdG9waWMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIHRvcGljIG5hbWUgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiB0aGUgbmFtZSBpcyBhIG5hbWUgb2YgYSBuZXcgdG9waWMsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBzdGF0aWMgaXNOZXdHcm91cFRvcGljTmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIFRvcGljLmlzTmV3R3JvdXBUb3BpY05hbWUobmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSB0b3BpYyBuYW1lIGlzIGEgbmFtZSBvZiBhIGNoYW5uZWwuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIHRvcGljIG5hbWUgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiB0aGUgbmFtZSBpcyBhIG5hbWUgb2YgYSBjaGFubmVsLCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICAgKi9cbiAgc3RhdGljIGlzQ2hhbm5lbFRvcGljTmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIFRvcGljLmlzQ2hhbm5lbFRvcGljTmFtZShuYW1lKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJuIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IHZlcnNpb24gb2YgdGhpcyBUaW5vZGUgY2xpZW50IGxpYnJhcnkuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBzZW1hbnRpYyB2ZXJzaW9uIG9mIHRoZSBsaWJyYXJ5LCBlLmcuIDxjb2RlPlwiMC4xNS41LXJjMVwiPC9jb2RlPi5cbiAgICovXG4gIHN0YXRpYyBnZXRWZXJzaW9uKCkge1xuICAgIHJldHVybiBDb25zdC5WRVJTSU9OO1xuICB9XG4gIC8qKlxuICAgKiBUbyB1c2UgVGlub2RlIGluIGEgbm9uIGJyb3dzZXIgY29udGV4dCwgc3VwcGx5IFdlYlNvY2tldCBhbmQgWE1MSHR0cFJlcXVlc3QgcHJvdmlkZXJzLlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHBhcmFtIHdzUHJvdmlkZXIgPGNvZGU+V2ViU29ja2V0PC9jb2RlPiBwcm92aWRlciwgZS5nLiBmb3Igbm9kZUpTICwgPGNvZGU+cmVxdWlyZSgnd3MnKTwvY29kZT4uXG4gICAqIEBwYXJhbSB4aHJQcm92aWRlciA8Y29kZT5YTUxIdHRwUmVxdWVzdDwvY29kZT4gcHJvdmlkZXIsIGUuZy4gZm9yIG5vZGUgPGNvZGU+cmVxdWlyZSgneGhyJyk8L2NvZGU+LlxuICAgKi9cbiAgc3RhdGljIHNldE5ldHdvcmtQcm92aWRlcnMod3NQcm92aWRlciwgeGhyUHJvdmlkZXIpIHtcbiAgICBXZWJTb2NrZXRQcm92aWRlciA9IHdzUHJvdmlkZXI7XG4gICAgWEhSUHJvdmlkZXIgPSB4aHJQcm92aWRlcjtcblxuICAgIENvbm5lY3Rpb24uc2V0TmV0d29ya1Byb3ZpZGVycyhXZWJTb2NrZXRQcm92aWRlciwgWEhSUHJvdmlkZXIpO1xuICAgIExhcmdlRmlsZUhlbHBlci5zZXROZXR3b3JrUHJvdmlkZXIoWEhSUHJvdmlkZXIpO1xuICB9XG4gIC8qKlxuICAgKiBUbyB1c2UgVGlub2RlIGluIGEgbm9uIGJyb3dzZXIgY29udGV4dCwgc3VwcGx5IDxjb2RlPmluZGV4ZWREQjwvY29kZT4gcHJvdmlkZXIuXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAcGFyYW0gaWRiUHJvdmlkZXIgPGNvZGU+aW5kZXhlZERCPC9jb2RlPiBwcm92aWRlciwgZS5nLiBmb3Igbm9kZUpTICwgPGNvZGU+cmVxdWlyZSgnZmFrZS1pbmRleGVkZGInKTwvY29kZT4uXG4gICAqL1xuICBzdGF0aWMgc2V0RGF0YWJhc2VQcm92aWRlcihpZGJQcm92aWRlcikge1xuICAgIEluZGV4ZWREQlByb3ZpZGVyID0gaWRiUHJvdmlkZXI7XG5cbiAgICBEQkNhY2hlLnNldERhdGFiYXNlUHJvdmlkZXIoSW5kZXhlZERCUHJvdmlkZXIpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm4gaW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgbmFtZSBhbmQgdmVyc2lvbiBvZiB0aGlzIFRpbm9kZSBsaWJyYXJ5LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gdGhlIG5hbWUgb2YgdGhlIGxpYnJhcnkgYW5kIGl0J3MgdmVyc2lvbi5cbiAgICovXG4gIHN0YXRpYyBnZXRMaWJyYXJ5KCkge1xuICAgIHJldHVybiBDb25zdC5MSUJSQVJZO1xuICB9XG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgZ2l2ZW4gc3RyaW5nIHJlcHJlc2VudHMgPGNvZGU+TlVMTDwvY29kZT4gdmFsdWUgYXMgZGVmaW5lZCBieSBUaW5vZGUgKDxjb2RlPidcXHUyNDIxJzwvY29kZT4pLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0ciAtIHN0cmluZyB0byBjaGVjayBmb3IgPGNvZGU+TlVMTDwvY29kZT4gdmFsdWUuXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiBzdHJpbmcgcmVwcmVzZW50cyA8Y29kZT5OVUxMPC9jb2RlPiB2YWx1ZSwgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIHN0YXRpYyBpc051bGxWYWx1ZShzdHIpIHtcbiAgICByZXR1cm4gc3RyID09PSBDb25zdC5ERUxfQ0hBUjtcbiAgfVxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIGdpdmVuIFVSTCBzdHJpbmcgaXMgYSByZWxhdGl2ZSBVUkwuXG4gICAqIENoZWNrIGZvciBjYXNlcyBsaWtlOlxuICAgKiAgPGNvZGU+J2h0dHA6Ly9leGFtcGxlLmNvbSc8L2NvZGU+XG4gICAqICA8Y29kZT4nIGh0dHA6Ly9leGFtcGxlLmNvbSc8L2NvZGU+XG4gICAqICA8Y29kZT4nLy9leGFtcGxlLmNvbS8nPC9jb2RlPlxuICAgKiAgPGNvZGU+J2h0dHA6ZXhhbXBsZS5jb20nPC9jb2RlPlxuICAgKiAgPGNvZGU+J2h0dHA6L2V4YW1wbGUuY29tJzwvY29kZT5cbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAc3RhdGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSBVUkwgc3RyaW5nIHRvIGNoZWNrLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlIFVSTCBpcyByZWxhdGl2ZSwgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIHN0YXRpYyBpc1JlbGF0aXZlVVJMKHVybCkge1xuICAgIHJldHVybiAhL15cXHMqKFthLXpdW2EtejAtOSsuLV0qOnxcXC9cXC8pL2ltLnRlc3QodXJsKTtcbiAgfVxuXG4gIC8vIEluc3RhbmNlIG1ldGhvZHMuXG5cbiAgLy8gR2VuZXJhdGVzIHVuaXF1ZSBtZXNzYWdlIElEc1xuICBnZXROZXh0VW5pcXVlSWQoKSB7XG4gICAgcmV0dXJuICh0aGlzLl9tZXNzYWdlSWQgIT0gMCkgPyAnJyArIHRoaXMuX21lc3NhZ2VJZCsrIDogdW5kZWZpbmVkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb25uZWN0IHRvIHRoZSBzZXJ2ZXIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBob3N0XyAtIG5hbWUgb2YgdGhlIGhvc3QgdG8gY29ubmVjdCB0by5cbiAgICpcbiAgICogQHJldHVybiB7UHJvbWlzZX0gUHJvbWlzZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHRoZSBjb25uZWN0aW9uIGNhbGwgY29tcGxldGVzOlxuICAgKiAgICA8Y29kZT5yZXNvbHZlKCk8L2NvZGU+IGlzIGNhbGxlZCB3aXRob3V0IHBhcmFtZXRlcnMsIDxjb2RlPnJlamVjdCgpPC9jb2RlPiByZWNlaXZlcyB0aGVcbiAgICogICAgPGNvZGU+RXJyb3I8L2NvZGU+IGFzIGEgc2luZ2xlIHBhcmFtZXRlci5cbiAgICovXG4gIGNvbm5lY3QoaG9zdF8pIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGlvbi5jb25uZWN0KGhvc3RfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0IHRvIHJlY29ubmVjdCB0byB0aGUgc2VydmVyIGltbWVkaWF0ZWx5LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZm9yY2UgLSByZWNvbm5lY3QgZXZlbiBpZiB0aGVyZSBpcyBhIGNvbm5lY3Rpb24gYWxyZWFkeS5cbiAgICovXG4gIHJlY29ubmVjdChmb3JjZSkge1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24ucmVjb25uZWN0KGZvcmNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0IGZyb20gdGhlIHNlcnZlci5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICovXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgdGhpcy5fY29ubmVjdGlvbi5kaXNjb25uZWN0KCk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgcGVyc2lzdGVudCBjYWNoZTogcmVtb3ZlIEluZGV4ZWREQi5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICogQHJldHVybiB7UHJvbWlzZX0gUHJvbWlzZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHRoZSBvcGVyYXRpb24gaXMgY29tcGxldGVkLlxuICAgKi9cbiAgY2xlYXJTdG9yYWdlKCkge1xuICAgIGlmICh0aGlzLl9kYi5pc1JlYWR5KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kYi5kZWxldGVEYXRhYmFzZSgpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBwZXJzaXN0ZW50IGNhY2hlOiBjcmVhdGUgSW5kZXhlZERCIGNhY2hlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKiBAcmV0dXJuIHtQcm9taXNlfSBQcm9taXNlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIG9wZXJhdGlvbiBpcyBjb21wbGV0ZWQuXG4gICAqL1xuICBpbml0U3RvcmFnZSgpIHtcbiAgICBpZiAoIXRoaXMuX2RiLmlzUmVhZHkoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2RiLmluaXREYXRhYmFzZSgpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBhIG5ldHdvcmsgcHJvYmUgbWVzc2FnZSB0byBtYWtlIHN1cmUgdGhlIGNvbm5lY3Rpb24gaXMgYWxpdmUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqL1xuICBuZXR3b3JrUHJvYmUoKSB7XG4gICAgdGhpcy5fY29ubmVjdGlvbi5wcm9iZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciBsaXZlIGNvbm5lY3Rpb24gdG8gc2VydmVyLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlcmUgaXMgYSBsaXZlIGNvbm5lY3Rpb24sIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGlvbi5pc0Nvbm5lY3RlZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGNvbm5lY3Rpb24gaXMgYXV0aGVudGljYXRlZCAobGFzdCBsb2dpbiB3YXMgc3VjY2Vzc2Z1bCkuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiBhdXRoZW50aWNhdGVkLCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICAgKi9cbiAgaXNBdXRoZW50aWNhdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9hdXRoZW50aWNhdGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBBUEkga2V5IGFuZCBhdXRoIHRva2VuIHRvIHRoZSByZWxhdGl2ZSBVUkwgbWFraW5nIGl0IHVzYWJsZSBmb3IgZ2V0dGluZyBkYXRhXG4gICAqIGZyb20gdGhlIHNlcnZlciBpbiBhIHNpbXBsZSA8Y29kZT5IVFRQIEdFVDwvY29kZT4gcmVxdWVzdC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IFVSTCAtIFVSTCB0byB3cmFwLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBVUkwgd2l0aCBhcHBlbmRlZCBBUEkga2V5IGFuZCB0b2tlbiwgaWYgdmFsaWQgdG9rZW4gaXMgcHJlc2VudC5cbiAgICovXG4gIGF1dGhvcml6ZVVSTCh1cmwpIHtcbiAgICBpZiAodHlwZW9mIHVybCAhPSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG5cbiAgICBpZiAoVGlub2RlLmlzUmVsYXRpdmVVUkwodXJsKSkge1xuICAgICAgLy8gRmFrZSBiYXNlIHRvIG1ha2UgdGhlIHJlbGF0aXZlIFVSTCBwYXJzZWFibGUuXG4gICAgICBjb25zdCBiYXNlID0gJ3NjaGVtZTovL2hvc3QvJztcbiAgICAgIGNvbnN0IHBhcnNlZCA9IG5ldyBVUkwodXJsLCBiYXNlKTtcbiAgICAgIGlmICh0aGlzLl9hcGlLZXkpIHtcbiAgICAgICAgcGFyc2VkLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ2FwaWtleScsIHRoaXMuX2FwaUtleSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fYXV0aFRva2VuICYmIHRoaXMuX2F1dGhUb2tlbi50b2tlbikge1xuICAgICAgICBwYXJzZWQuc2VhcmNoUGFyYW1zLmFwcGVuZCgnYXV0aCcsICd0b2tlbicpO1xuICAgICAgICBwYXJzZWQuc2VhcmNoUGFyYW1zLmFwcGVuZCgnc2VjcmV0JywgdGhpcy5fYXV0aFRva2VuLnRva2VuKTtcbiAgICAgIH1cbiAgICAgIC8vIENvbnZlcnQgYmFjayB0byBzdHJpbmcgYW5kIHN0cmlwIGZha2UgYmFzZSBVUkwgZXhjZXB0IGZvciB0aGUgcm9vdCBzbGFzaC5cbiAgICAgIHVybCA9IHBhcnNlZC50b1N0cmluZygpLnN1YnN0cmluZyhiYXNlLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIEFjY291bnRQYXJhbXNcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAcHJvcGVydHkge1Rpbm9kZS5EZWZBY3M9fSBkZWZhY3MgLSBEZWZhdWx0IGFjY2VzcyBwYXJhbWV0ZXJzIGZvciB1c2VyJ3MgPGNvZGU+bWU8L2NvZGU+IHRvcGljLlxuICAgKiBAcHJvcGVydHkge09iamVjdD19IHB1YmxpYyAtIFB1YmxpYyBhcHBsaWNhdGlvbi1kZWZpbmVkIGRhdGEgZXhwb3NlZCBvbiA8Y29kZT5tZTwvY29kZT4gdG9waWMuXG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0PX0gcHJpdmF0ZSAtIFByaXZhdGUgYXBwbGljYXRpb24tZGVmaW5lZCBkYXRhIGFjY2Vzc2libGUgb24gPGNvZGU+bWU8L2NvZGU+IHRvcGljLlxuICAgKiBAcHJvcGVydHkge09iamVjdD19IHRydXN0ZWQgLSBUcnVzdGVkIHVzZXIgZGF0YSB3aGljaCBjYW4gYmUgc2V0IGJ5IGEgcm9vdCB1c2VyIG9ubHkuXG4gICAqIEBwcm9wZXJ0eSB7QXJyYXkuPHN0cmluZz59IHRhZ3MgLSBhcnJheSBvZiBzdHJpbmcgdGFncyBmb3IgdXNlciBkaXNjb3ZlcnkuXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nPX0gdG9rZW4gLSBhdXRoZW50aWNhdGlvbiB0b2tlbiB0byB1c2UuXG4gICAqIEBwcm9wZXJ0eSB7QXJyYXkuPHN0cmluZz49fSBhdHRhY2htZW50cyAtIEFycmF5IG9mIHJlZmVyZW5jZXMgdG8gb3V0IG9mIGJhbmQgYXR0YWNobWVudHMgdXNlZCBpbiBhY2NvdW50IGRlc2NyaXB0aW9uLlxuICAgKi9cbiAgLyoqXG4gICAqIEB0eXBlZGVmIERlZkFjc1xuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nPX0gYXV0aCAtIEFjY2VzcyBtb2RlIGZvciA8Y29kZT5tZTwvY29kZT4gZm9yIGF1dGhlbnRpY2F0ZWQgdXNlcnMuXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nPX0gYW5vbiAtIEFjY2VzcyBtb2RlIGZvciA8Y29kZT5tZTwvY29kZT4gZm9yIGFub255bW91cyB1c2Vycy5cbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBvciB1cGRhdGUgYW4gYWNjb3VudC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVpZCAtIFVzZXIgaWQgdG8gdXBkYXRlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzY2hlbWUgLSBBdXRoZW50aWNhdGlvbiBzY2hlbWU7IDxjb2RlPlwiYmFzaWNcIjwvY29kZT4gYW5kIDxjb2RlPlwiYW5vbnltb3VzXCI8L2NvZGU+IGFyZSB0aGUgY3VycmVudGx5IHN1cHBvcnRlZCBzY2hlbWVzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2VjcmV0IC0gQXV0aGVudGljYXRpb24gc2VjcmV0LCBhc3N1bWVkIHRvIGJlIGFscmVhZHkgYmFzZTY0IGVuY29kZWQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGxvZ2luIC0gVXNlIG5ldyBhY2NvdW50IHRvIGF1dGhlbnRpY2F0ZSBjdXJyZW50IHNlc3Npb25cbiAgICogQHBhcmFtIHtUaW5vZGUuQWNjb3VudFBhcmFtcz19IHBhcmFtcyAtIFVzZXIgZGF0YSB0byBwYXNzIHRvIHRoZSBzZXJ2ZXIuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiBzZXJ2ZXIgcmVwbHkgaXMgcmVjZWl2ZWQuXG4gICAqL1xuICBhY2NvdW50KHVpZCwgc2NoZW1lLCBzZWNyZXQsIGxvZ2luLCBwYXJhbXMpIHtcbiAgICBjb25zdCBwa3QgPSB0aGlzLiNpbml0UGFja2V0KCdhY2MnKTtcbiAgICBwa3QuYWNjLnVzZXIgPSB1aWQ7XG4gICAgcGt0LmFjYy5zY2hlbWUgPSBzY2hlbWU7XG4gICAgcGt0LmFjYy5zZWNyZXQgPSBzZWNyZXQ7XG4gICAgLy8gTG9nIGluIHRvIHRoZSBuZXcgYWNjb3VudCB1c2luZyBzZWxlY3RlZCBzY2hlbWVcbiAgICBwa3QuYWNjLmxvZ2luID0gbG9naW47XG5cbiAgICBpZiAocGFyYW1zKSB7XG4gICAgICBwa3QuYWNjLmRlc2MuZGVmYWNzID0gcGFyYW1zLmRlZmFjcztcbiAgICAgIHBrdC5hY2MuZGVzYy5wdWJsaWMgPSBwYXJhbXMucHVibGljO1xuICAgICAgcGt0LmFjYy5kZXNjLnByaXZhdGUgPSBwYXJhbXMucHJpdmF0ZTtcbiAgICAgIHBrdC5hY2MuZGVzYy50cnVzdGVkID0gcGFyYW1zLnRydXN0ZWQ7XG5cbiAgICAgIHBrdC5hY2MudGFncyA9IHBhcmFtcy50YWdzO1xuICAgICAgcGt0LmFjYy5jcmVkID0gcGFyYW1zLmNyZWQ7XG5cbiAgICAgIHBrdC5hY2MudG9rZW4gPSBwYXJhbXMudG9rZW47XG5cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHBhcmFtcy5hdHRhY2htZW50cykgJiYgcGFyYW1zLmF0dGFjaG1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcGt0LmV4dHJhID0ge1xuICAgICAgICAgIGF0dGFjaG1lbnRzOiBwYXJhbXMuYXR0YWNobWVudHMuZmlsdGVyKHJlZiA9PiBUaW5vZGUuaXNSZWxhdGl2ZVVSTChyZWYpKVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLiNzZW5kKHBrdCwgcGt0LmFjYy5pZCk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IHVzZXIuIFdyYXBwZXIgZm9yIHtAbGluayBUaW5vZGUjYWNjb3VudH0uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzY2hlbWUgLSBBdXRoZW50aWNhdGlvbiBzY2hlbWU7IDxjb2RlPlwiYmFzaWNcIjwvY29kZT4gaXMgdGhlIG9ubHkgY3VycmVudGx5IHN1cHBvcnRlZCBzY2hlbWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZWNyZXQgLSBBdXRoZW50aWNhdGlvbi5cbiAgICogQHBhcmFtIHtib29sZWFuPX0gbG9naW4gLSBVc2UgbmV3IGFjY291bnQgdG8gYXV0aGVudGljYXRlIGN1cnJlbnQgc2Vzc2lvblxuICAgKiBAcGFyYW0ge1Rpbm9kZS5BY2NvdW50UGFyYW1zPX0gcGFyYW1zIC0gVXNlciBkYXRhIHRvIHBhc3MgdG8gdGhlIHNlcnZlci5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHNlcnZlciByZXBseSBpcyByZWNlaXZlZC5cbiAgICovXG4gIGNyZWF0ZUFjY291bnQoc2NoZW1lLCBzZWNyZXQsIGxvZ2luLCBwYXJhbXMpIHtcbiAgICBsZXQgcHJvbWlzZSA9IHRoaXMuYWNjb3VudChVU0VSX05FVywgc2NoZW1lLCBzZWNyZXQsIGxvZ2luLCBwYXJhbXMpO1xuICAgIGlmIChsb2dpbikge1xuICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbigoY3RybCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy4jbG9naW5TdWNjZXNzZnVsKGN0cmwpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSB1c2VyIHdpdGggPGNvZGU+J2Jhc2ljJzwvY29kZT4gYXV0aGVudGljYXRpb24gc2NoZW1lIGFuZCBpbW1lZGlhdGVseVxuICAgKiB1c2UgaXQgZm9yIGF1dGhlbnRpY2F0aW9uLiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI2FjY291bnR9LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXNlcm5hbWUgLSBMb2dpbiB0byB1c2UgZm9yIHRoZSBuZXcgYWNjb3VudC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIC0gVXNlcidzIHBhc3N3b3JkLlxuICAgKiBAcGFyYW0ge1Rpbm9kZS5BY2NvdW50UGFyYW1zPX0gcGFyYW1zIC0gVXNlciBkYXRhIHRvIHBhc3MgdG8gdGhlIHNlcnZlci5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHNlcnZlciByZXBseSBpcyByZWNlaXZlZC5cbiAgICovXG4gIGNyZWF0ZUFjY291bnRCYXNpYyh1c2VybmFtZSwgcGFzc3dvcmQsIHBhcmFtcykge1xuICAgIC8vIE1ha2Ugc3VyZSB3ZSBhcmUgbm90IHVzaW5nICdudWxsJyBvciAndW5kZWZpbmVkJztcbiAgICB1c2VybmFtZSA9IHVzZXJuYW1lIHx8ICcnO1xuICAgIHBhc3N3b3JkID0gcGFzc3dvcmQgfHwgJyc7XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlQWNjb3VudCgnYmFzaWMnLFxuICAgICAgYjY0RW5jb2RlVW5pY29kZSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKSwgdHJ1ZSwgcGFyYW1zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdXNlcidzIGNyZWRlbnRpYWxzIGZvciA8Y29kZT4nYmFzaWMnPC9jb2RlPiBhdXRoZW50aWNhdGlvbiBzY2hlbWUuIFdyYXBwZXIgZm9yIHtAbGluayBUaW5vZGUjYWNjb3VudH0uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1aWQgLSBVc2VyIElEIHRvIHVwZGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXJuYW1lIC0gTG9naW4gdG8gdXNlIGZvciB0aGUgbmV3IGFjY291bnQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAtIFVzZXIncyBwYXNzd29yZC5cbiAgICogQHBhcmFtIHtUaW5vZGUuQWNjb3VudFBhcmFtcz19IHBhcmFtcyAtIGRhdGEgdG8gcGFzcyB0byB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gc2VydmVyIHJlcGx5IGlzIHJlY2VpdmVkLlxuICAgKi9cbiAgdXBkYXRlQWNjb3VudEJhc2ljKHVpZCwgdXNlcm5hbWUsIHBhc3N3b3JkLCBwYXJhbXMpIHtcbiAgICAvLyBNYWtlIHN1cmUgd2UgYXJlIG5vdCB1c2luZyAnbnVsbCcgb3IgJ3VuZGVmaW5lZCc7XG4gICAgdXNlcm5hbWUgPSB1c2VybmFtZSB8fCAnJztcbiAgICBwYXNzd29yZCA9IHBhc3N3b3JkIHx8ICcnO1xuICAgIHJldHVybiB0aGlzLmFjY291bnQodWlkLCAnYmFzaWMnLFxuICAgICAgYjY0RW5jb2RlVW5pY29kZSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKSwgZmFsc2UsIHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBoYW5kc2hha2UgdG8gdGhlIHNlcnZlci5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHNlcnZlciByZXBseSBpcyByZWNlaXZlZC5cbiAgICovXG4gIGhlbGxvKCkge1xuICAgIGNvbnN0IHBrdCA9IHRoaXMuI2luaXRQYWNrZXQoJ2hpJyk7XG5cbiAgICByZXR1cm4gdGhpcy4jc2VuZChwa3QsIHBrdC5oaS5pZClcbiAgICAgIC50aGVuKChjdHJsKSA9PiB7XG4gICAgICAgIC8vIFJlc2V0IGJhY2tvZmYgY291bnRlciBvbiBzdWNjZXNzZnVsIGNvbm5lY3Rpb24uXG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uYmFja29mZlJlc2V0KCk7XG5cbiAgICAgICAgLy8gU2VydmVyIHJlc3BvbnNlIGNvbnRhaW5zIHNlcnZlciBwcm90b2NvbCB2ZXJzaW9uLCBidWlsZCwgY29uc3RyYWludHMsXG4gICAgICAgIC8vIHNlc3Npb24gSUQgZm9yIGxvbmcgcG9sbGluZy4gU2F2ZSB0aGVtLlxuICAgICAgICBpZiAoY3RybC5wYXJhbXMpIHtcbiAgICAgICAgICB0aGlzLl9zZXJ2ZXJJbmZvID0gY3RybC5wYXJhbXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vbkNvbm5lY3QpIHtcbiAgICAgICAgICB0aGlzLm9uQ29ubmVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGN0cmw7XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24ucmVjb25uZWN0KHRydWUpO1xuXG4gICAgICAgIGlmICh0aGlzLm9uRGlzY29ubmVjdCkge1xuICAgICAgICAgIHRoaXMub25EaXNjb25uZWN0KGVycik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBvciByZWZyZXNoIHRoZSBwdXNoIG5vdGlmaWNhdGlvbnMvZGV2aWNlIHRva2VuLiBJZiB0aGUgY2xpZW50IGlzIGNvbm5lY3RlZCxcbiAgICogdGhlIGRldmljZVRva2VuIGNhbiBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkdCAtIHRva2VuIG9idGFpbmVkIGZyb20gdGhlIHByb3ZpZGVyIG9yIDxjb2RlPmZhbHNlPC9jb2RlPixcbiAgICogICAgPGNvZGU+bnVsbDwvY29kZT4gb3IgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPiB0byBjbGVhciB0aGUgdG9rZW4uXG4gICAqXG4gICAqIEByZXR1cm5zIDxjb2RlPnRydWU8L2NvZGU+IGlmIGF0dGVtcHQgd2FzIG1hZGUgdG8gc2VuZCB0aGUgdXBkYXRlIHRvIHRoZSBzZXJ2ZXIuXG4gICAqL1xuICBzZXREZXZpY2VUb2tlbihkdCkge1xuICAgIGxldCBzZW50ID0gZmFsc2U7XG4gICAgLy8gQ29udmVydCBhbnkgZmFsc2lzaCB2YWx1ZSB0byBudWxsLlxuICAgIGR0ID0gZHQgfHwgbnVsbDtcbiAgICBpZiAoZHQgIT0gdGhpcy5fZGV2aWNlVG9rZW4pIHtcbiAgICAgIHRoaXMuX2RldmljZVRva2VuID0gZHQ7XG4gICAgICBpZiAodGhpcy5pc0Nvbm5lY3RlZCgpICYmIHRoaXMuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgdGhpcy4jc2VuZCh7XG4gICAgICAgICAgJ2hpJzoge1xuICAgICAgICAgICAgJ2Rldic6IGR0IHx8IFRpbm9kZS5ERUxfQ0hBUlxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHNlbnQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2VudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiBDcmVkZW50aWFsXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBtZXRoIC0gdmFsaWRhdGlvbiBtZXRob2QuXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YWwgLSB2YWx1ZSB0byB2YWxpZGF0ZSAoZS5nLiBlbWFpbCBvciBwaG9uZSBudW1iZXIpLlxuICAgKiBAcHJvcGVydHkge3N0cmluZ30gcmVzcCAtIHZhbGlkYXRpb24gcmVzcG9uc2UuXG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBwYXJhbXMgLSB2YWxpZGF0aW9uIHBhcmFtZXRlcnMuXG4gICAqL1xuICAvKipcbiAgICogQXV0aGVudGljYXRlIGN1cnJlbnQgc2Vzc2lvbi5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNjaGVtZSAtIEF1dGhlbnRpY2F0aW9uIHNjaGVtZTsgPGNvZGU+XCJiYXNpY1wiPC9jb2RlPiBpcyB0aGUgb25seSBjdXJyZW50bHkgc3VwcG9ydGVkIHNjaGVtZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHNlY3JldCAtIEF1dGhlbnRpY2F0aW9uIHNlY3JldCwgYXNzdW1lZCB0byBiZSBhbHJlYWR5IGJhc2U2NCBlbmNvZGVkLlxuICAgKiBAcGFyYW0ge0NyZWRlbnRpYWw9fSBjcmVkIC0gY3JlZGVudGlhbCBjb25maXJtYXRpb24sIGlmIHJlcXVpcmVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gc2VydmVyIHJlcGx5IGlzIHJlY2VpdmVkLlxuICAgKi9cbiAgbG9naW4oc2NoZW1lLCBzZWNyZXQsIGNyZWQpIHtcbiAgICBjb25zdCBwa3QgPSB0aGlzLiNpbml0UGFja2V0KCdsb2dpbicpO1xuICAgIHBrdC5sb2dpbi5zY2hlbWUgPSBzY2hlbWU7XG4gICAgcGt0LmxvZ2luLnNlY3JldCA9IHNlY3JldDtcbiAgICBwa3QubG9naW4uY3JlZCA9IGNyZWQ7XG5cbiAgICByZXR1cm4gdGhpcy4jc2VuZChwa3QsIHBrdC5sb2dpbi5pZClcbiAgICAgIC50aGVuKChjdHJsKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLiNsb2dpblN1Y2Nlc3NmdWwoY3RybCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI2xvZ2lufSB3aXRoIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1bmFtZSAtIFVzZXIgbmFtZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAtIFBhc3N3b3JkLlxuICAgKiBAcGFyYW0ge0NyZWRlbnRpYWw9fSBjcmVkIC0gY3JlZGVudGlhbCBjb25maXJtYXRpb24sIGlmIHJlcXVpcmVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkL3JlamVjdGVkIG9uIHJlY2VpdmluZyBzZXJ2ZXIgcmVwbHkuXG4gICAqL1xuICBsb2dpbkJhc2ljKHVuYW1lLCBwYXNzd29yZCwgY3JlZCkge1xuICAgIHJldHVybiB0aGlzLmxvZ2luKCdiYXNpYycsIGI2NEVuY29kZVVuaWNvZGUodW5hbWUgKyAnOicgKyBwYXNzd29yZCksIGNyZWQpXG4gICAgICAudGhlbigoY3RybCkgPT4ge1xuICAgICAgICB0aGlzLl9sb2dpbiA9IHVuYW1lO1xuICAgICAgICByZXR1cm4gY3RybDtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFdyYXBwZXIgZm9yIHtAbGluayBUaW5vZGUjbG9naW59IHdpdGggdG9rZW4gYXV0aGVudGljYXRpb25cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRva2VuIC0gVG9rZW4gcmVjZWl2ZWQgaW4gcmVzcG9uc2UgdG8gZWFybGllciBsb2dpbi5cbiAgICogQHBhcmFtIHtDcmVkZW50aWFsPX0gY3JlZCAtIGNyZWRlbnRpYWwgY29uZmlybWF0aW9uLCBpZiByZXF1aXJlZC5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCBvbiByZWNlaXZpbmcgc2VydmVyIHJlcGx5LlxuICAgKi9cbiAgbG9naW5Ub2tlbih0b2tlbiwgY3JlZCkge1xuICAgIHJldHVybiB0aGlzLmxvZ2luKCd0b2tlbicsIHRva2VuLCBjcmVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGEgcmVxdWVzdCBmb3IgcmVzZXR0aW5nIGFuIGF1dGhlbnRpY2F0aW9uIHNlY3JldC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNjaGVtZSAtIGF1dGhlbnRpY2F0aW9uIHNjaGVtZSB0byByZXNldC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZCAtIG1ldGhvZCB0byB1c2UgZm9yIHJlc2V0dGluZyB0aGUgc2VjcmV0LCBzdWNoIGFzIFwiZW1haWxcIiBvciBcInRlbFwiLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSB2YWx1ZSBvZiB0aGUgY3JlZGVudGlhbCB0byB1c2UsIGEgc3BlY2lmaWMgZW1haWwgYWRkcmVzcyBvciBhIHBob25lIG51bWJlci5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCBvbiByZWNlaXZpbmcgdGhlIHNlcnZlciByZXBseS5cbiAgICovXG4gIHJlcXVlc3RSZXNldEF1dGhTZWNyZXQoc2NoZW1lLCBtZXRob2QsIHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMubG9naW4oJ3Jlc2V0JywgYjY0RW5jb2RlVW5pY29kZShzY2hlbWUgKyAnOicgKyBtZXRob2QgKyAnOicgKyB2YWx1ZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIEF1dGhUb2tlblxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0b2tlbiAtIFRva2VuIHZhbHVlLlxuICAgKiBAcHJvcGVydHkge0RhdGV9IGV4cGlyZXMgLSBUb2tlbiBleHBpcmF0aW9uIHRpbWUuXG4gICAqL1xuICAvKipcbiAgICogR2V0IHN0b3JlZCBhdXRoZW50aWNhdGlvbiB0b2tlbi5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHJldHVybnMge1Rpbm9kZS5BdXRoVG9rZW59IGF1dGhlbnRpY2F0aW9uIHRva2VuLlxuICAgKi9cbiAgZ2V0QXV0aFRva2VuKCkge1xuICAgIGlmICh0aGlzLl9hdXRoVG9rZW4gJiYgKHRoaXMuX2F1dGhUb2tlbi5leHBpcmVzLmdldFRpbWUoKSA+IERhdGUubm93KCkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYXV0aFRva2VuO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hdXRoVG9rZW4gPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWNhdGlvbiBtYXkgcHJvdmlkZSBhIHNhdmVkIGF1dGhlbnRpY2F0aW9uIHRva2VuLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge1Rpbm9kZS5BdXRoVG9rZW59IHRva2VuIC0gYXV0aGVudGljYXRpb24gdG9rZW4uXG4gICAqL1xuICBzZXRBdXRoVG9rZW4odG9rZW4pIHtcbiAgICB0aGlzLl9hdXRoVG9rZW4gPSB0b2tlbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiBTZXRQYXJhbXNcbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAcHJvcGVydHkge1Rpbm9kZS5TZXREZXNjPX0gZGVzYyAtIFRvcGljIGluaXRpYWxpemF0aW9uIHBhcmFtZXRlcnMgd2hlbiBjcmVhdGluZyBhIG5ldyB0b3BpYyBvciBhIG5ldyBzdWJzY3JpcHRpb24uXG4gICAqIEBwcm9wZXJ0eSB7VGlub2RlLlNldFN1Yj19IHN1YiAtIFN1YnNjcmlwdGlvbiBpbml0aWFsaXphdGlvbiBwYXJhbWV0ZXJzLlxuICAgKiBAcHJvcGVydHkge0FycmF5LjxzdHJpbmc+PX0gYXR0YWNobWVudHMgLSBVUkxzIG9mIG91dCBvZiBiYW5kIGF0dGFjaG1lbnRzIHVzZWQgaW4gcGFyYW1ldGVycy5cbiAgICovXG4gIC8qKlxuICAgKiBAdHlwZWRlZiBTZXREZXNjXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHByb3BlcnR5IHtUaW5vZGUuRGVmQWNzPX0gZGVmYWNzIC0gRGVmYXVsdCBhY2Nlc3MgbW9kZS5cbiAgICogQHByb3BlcnR5IHtPYmplY3Q9fSBwdWJsaWMgLSBGcmVlLWZvcm0gdG9waWMgZGVzY3JpcHRpb24sIHB1YmxpY2FsbHkgYWNjZXNzaWJsZS5cbiAgICogQHByb3BlcnR5IHtPYmplY3Q9fSBwcml2YXRlIC0gRnJlZS1mb3JtIHRvcGljIGRlc2NyaXB0aW9uIGFjY2Vzc2libGUgb25seSB0byB0aGUgb3duZXIuXG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0PX0gdHJ1c3RlZCAtIFRydXN0ZWQgdXNlciBkYXRhIHdoaWNoIGNhbiBiZSBzZXQgYnkgYSByb290IHVzZXIgb25seS5cbiAgICovXG4gIC8qKlxuICAgKiBAdHlwZWRlZiBTZXRTdWJcbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAcHJvcGVydHkge3N0cmluZz19IHVzZXIgLSBVSUQgb2YgdGhlIHVzZXIgYWZmZWN0ZWQgYnkgdGhlIHJlcXVlc3QuIERlZmF1bHQgKGVtcHR5KSAtIGN1cnJlbnQgdXNlci5cbiAgICogQHByb3BlcnR5IHtzdHJpbmc9fSBtb2RlIC0gVXNlciBhY2Nlc3MgbW9kZSwgZWl0aGVyIHJlcXVlc3RlZCBvciBhc3NpZ25lZCBkZXBlbmRlbnQgb24gY29udGV4dC5cbiAgICovXG4gIC8qKlxuICAgKiBQYXJhbWV0ZXJzIHBhc3NlZCB0byB7QGxpbmsgVGlub2RlI3N1YnNjcmliZX0uXG4gICAqXG4gICAqIEB0eXBlZGVmIFN1YnNjcmlwdGlvblBhcmFtc1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEBwcm9wZXJ0eSB7VGlub2RlLlNldFBhcmFtcz19IHNldCAtIFBhcmFtZXRlcnMgdXNlZCB0byBpbml0aWFsaXplIHRvcGljXG4gICAqIEBwcm9wZXJ0eSB7VGlub2RlLkdldFF1ZXJ5PX0gZ2V0IC0gUXVlcnkgZm9yIGZldGNoaW5nIGRhdGEgZnJvbSB0b3BpYy5cbiAgICovXG5cbiAgLyoqXG4gICAqIFNlbmQgYSB0b3BpYyBzdWJzY3JpcHRpb24gcmVxdWVzdC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRvcGljIC0gTmFtZSBvZiB0aGUgdG9waWMgdG8gc3Vic2NyaWJlIHRvLlxuICAgKiBAcGFyYW0ge1Rpbm9kZS5HZXRRdWVyeT19IGdldFBhcmFtcyAtIE9wdGlvbmFsIHN1YnNjcmlwdGlvbiBtZXRhZGF0YSBxdWVyeVxuICAgKiBAcGFyYW0ge1Rpbm9kZS5TZXRQYXJhbXM9fSBzZXRQYXJhbXMgLSBPcHRpb25hbCBpbml0aWFsaXphdGlvbiBwYXJhbWV0ZXJzXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gcmVjZWl2aW5nIHNlcnZlciByZXBseS5cbiAgICovXG4gIHN1YnNjcmliZSh0b3BpY05hbWUsIGdldFBhcmFtcywgc2V0UGFyYW1zKSB7XG4gICAgY29uc3QgcGt0ID0gdGhpcy4jaW5pdFBhY2tldCgnc3ViJywgdG9waWNOYW1lKVxuICAgIGlmICghdG9waWNOYW1lKSB7XG4gICAgICB0b3BpY05hbWUgPSBDb25zdC5UT1BJQ19ORVc7XG4gICAgfVxuXG4gICAgcGt0LnN1Yi5nZXQgPSBnZXRQYXJhbXM7XG5cbiAgICBpZiAoc2V0UGFyYW1zKSB7XG4gICAgICBpZiAoc2V0UGFyYW1zLnN1Yikge1xuICAgICAgICBwa3Quc3ViLnNldC5zdWIgPSBzZXRQYXJhbXMuc3ViO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2V0UGFyYW1zLmRlc2MpIHtcbiAgICAgICAgY29uc3QgZGVzYyA9IHNldFBhcmFtcy5kZXNjO1xuICAgICAgICBpZiAoVGlub2RlLmlzTmV3R3JvdXBUb3BpY05hbWUodG9waWNOYW1lKSkge1xuICAgICAgICAgIC8vIEZ1bGwgc2V0LmRlc2MgcGFyYW1zIGFyZSB1c2VkIGZvciBuZXcgdG9waWNzIG9ubHlcbiAgICAgICAgICBwa3Quc3ViLnNldC5kZXNjID0gZGVzYztcbiAgICAgICAgfSBlbHNlIGlmIChUaW5vZGUuaXNQMlBUb3BpY05hbWUodG9waWNOYW1lKSAmJiBkZXNjLmRlZmFjcykge1xuICAgICAgICAgIC8vIFVzZSBvcHRpb25hbCBkZWZhdWx0IHBlcm1pc3Npb25zIG9ubHkuXG4gICAgICAgICAgcGt0LnN1Yi5zZXQuZGVzYyA9IHtcbiAgICAgICAgICAgIGRlZmFjczogZGVzYy5kZWZhY3NcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNlZSBpZiBleHRlcm5hbCBvYmplY3RzIHdlcmUgdXNlZCBpbiB0b3BpYyBkZXNjcmlwdGlvbi5cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHNldFBhcmFtcy5hdHRhY2htZW50cykgJiYgc2V0UGFyYW1zLmF0dGFjaG1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcGt0LmV4dHJhID0ge1xuICAgICAgICAgIGF0dGFjaG1lbnRzOiBzZXRQYXJhbXMuYXR0YWNobWVudHMuZmlsdGVyKHJlZiA9PiBUaW5vZGUuaXNSZWxhdGl2ZVVSTChyZWYpKVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBpZiAoc2V0UGFyYW1zLnRhZ3MpIHtcbiAgICAgICAgcGt0LnN1Yi5zZXQudGFncyA9IHNldFBhcmFtcy50YWdzO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy4jc2VuZChwa3QsIHBrdC5zdWIuaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGFjaCBhbmQgb3B0aW9uYWxseSB1bnN1YnNjcmliZSBmcm9tIHRoZSB0b3BpY1xuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWMgLSBUb3BpYyB0byBkZXRhY2ggZnJvbS5cbiAgICogQHBhcmFtIHtib29sZWFufSB1bnN1YiAtIElmIDxjb2RlPnRydWU8L2NvZGU+LCBkZXRhY2ggYW5kIHVuc3Vic2NyaWJlLCBvdGhlcndpc2UganVzdCBkZXRhY2guXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gcmVjZWl2aW5nIHNlcnZlciByZXBseS5cbiAgICovXG4gIGxlYXZlKHRvcGljLCB1bnN1Yikge1xuICAgIGNvbnN0IHBrdCA9IHRoaXMuI2luaXRQYWNrZXQoJ2xlYXZlJywgdG9waWMpO1xuICAgIHBrdC5sZWF2ZS51bnN1YiA9IHVuc3ViO1xuXG4gICAgcmV0dXJuIHRoaXMuI3NlbmQocGt0LCBwa3QubGVhdmUuaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBtZXNzYWdlIGRyYWZ0IHdpdGhvdXQgc2VuZGluZyBpdCB0byB0aGUgc2VydmVyLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWMgLSBOYW1lIG9mIHRoZSB0b3BpYyB0byBwdWJsaXNoIHRvLlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGVudCAtIFBheWxvYWQgdG8gcHVibGlzaC5cbiAgICogQHBhcmFtIHtib29sZWFuPX0gbm9FY2hvIC0gSWYgPGNvZGU+dHJ1ZTwvY29kZT4sIHRlbGwgdGhlIHNlcnZlciBub3QgdG8gZWNobyB0aGUgbWVzc2FnZSB0byB0aGUgb3JpZ2luYWwgc2Vzc2lvbi5cbiAgICpcbiAgICogQHJldHVybnMge09iamVjdH0gbmV3IG1lc3NhZ2Ugd2hpY2ggY2FuIGJlIHNlbnQgdG8gdGhlIHNlcnZlciBvciBvdGhlcndpc2UgdXNlZC5cbiAgICovXG4gIGNyZWF0ZU1lc3NhZ2UodG9waWMsIGNvbnRlbnQsIG5vRWNobykge1xuICAgIGNvbnN0IHBrdCA9IHRoaXMuI2luaXRQYWNrZXQoJ3B1YicsIHRvcGljKTtcblxuICAgIGxldCBkZnQgPSB0eXBlb2YgY29udGVudCA9PSAnc3RyaW5nJyA/IERyYWZ0eS5wYXJzZShjb250ZW50KSA6IGNvbnRlbnQ7XG4gICAgaWYgKGRmdCAmJiAhRHJhZnR5LmlzUGxhaW5UZXh0KGRmdCkpIHtcbiAgICAgIHBrdC5wdWIuaGVhZCA9IHtcbiAgICAgICAgbWltZTogRHJhZnR5LmdldENvbnRlbnRUeXBlKClcbiAgICAgIH07XG4gICAgICBjb250ZW50ID0gZGZ0O1xuICAgIH1cbiAgICBwa3QucHViLm5vZWNobyA9IG5vRWNobztcbiAgICBwa3QucHViLmNvbnRlbnQgPSBjb250ZW50O1xuXG4gICAgcmV0dXJuIHBrdC5wdWI7XG4gIH1cblxuICAvKipcbiAgICogUHVibGlzaCB7ZGF0YX0gbWVzc2FnZSB0byB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRvcGljIC0gTmFtZSBvZiB0aGUgdG9waWMgdG8gcHVibGlzaCB0by5cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRlbnQgLSBQYXlsb2FkIHRvIHB1Ymxpc2guXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG5vRWNobyAtIElmIDxjb2RlPnRydWU8L2NvZGU+LCB0ZWxsIHRoZSBzZXJ2ZXIgbm90IHRvIGVjaG8gdGhlIG1lc3NhZ2UgdG8gdGhlIG9yaWdpbmFsIHNlc3Npb24uXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gcmVjZWl2aW5nIHNlcnZlciByZXBseS5cbiAgICovXG4gIHB1Ymxpc2godG9waWMsIGNvbnRlbnQsIG5vRWNobykge1xuICAgIHJldHVybiB0aGlzLnB1Ymxpc2hNZXNzYWdlKFxuICAgICAgdGhpcy5jcmVhdGVNZXNzYWdlKHRvcGljLCBjb250ZW50LCBub0VjaG8pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdWJsaXNoIG1lc3NhZ2UgdG8gdG9waWMuIFRoZSBtZXNzYWdlIHNob3VsZCBiZSBjcmVhdGVkIGJ5IHtAbGluayBUaW5vZGUjY3JlYXRlTWVzc2FnZX0uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwdWIgLSBNZXNzYWdlIHRvIHB1Ymxpc2guXG4gICAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz49fSBhdHRhY2htZW50cyAtIGFycmF5IG9mIFVSTHMgd2l0aCBhdHRhY2htZW50cy5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCBvbiByZWNlaXZpbmcgc2VydmVyIHJlcGx5LlxuICAgKi9cbiAgcHVibGlzaE1lc3NhZ2UocHViLCBhdHRhY2htZW50cykge1xuICAgIC8vIE1ha2UgYSBzaGFsbG93IGNvcHkuIE5lZWRlZCBpbiBvcmRlciB0byBjbGVhciBsb2NhbGx5LWFzc2lnbmVkIHRlbXAgdmFsdWVzO1xuICAgIHB1YiA9IE9iamVjdC5hc3NpZ24oe30sIHB1Yik7XG4gICAgcHViLnNlcSA9IHVuZGVmaW5lZDtcbiAgICBwdWIuZnJvbSA9IHVuZGVmaW5lZDtcbiAgICBwdWIudHMgPSB1bmRlZmluZWQ7XG4gICAgY29uc3QgbXNnID0ge1xuICAgICAgcHViOiBwdWIsXG4gICAgfTtcbiAgICBpZiAoYXR0YWNobWVudHMpIHtcbiAgICAgIG1zZy5leHRyYSA9IHtcbiAgICAgICAgYXR0YWNobWVudHM6IGF0dGFjaG1lbnRzLmZpbHRlcihyZWYgPT4gVGlub2RlLmlzUmVsYXRpdmVVUkwocmVmKSlcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLiNzZW5kKG1zZywgcHViLmlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdXQgb2YgYmFuZCBub3RpZmljYXRpb246IG5vdGlmeSB0b3BpYyB0aGF0IGFuIGV4dGVybmFsIChwdXNoKSBub3RpZmljYXRpb24gd2FzIHJlY2l2ZWQgYnkgdGhlIGNsaWVudC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHdoYXQgLSBub3RpZmljYXRpb24gdHlwZSwgJ21zZycgb3IgJ3JlYWQnLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWNOYW1lIC0gbmFtZSBvZiB0aGUgdXBkYXRlZCB0b3BpYy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcSAtIHNlcSBJRCBvZiB0aGUgYWZmZWN0ZWQgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtzdHJpbmc9fSBhY3QgLSBVSUQgb2YgdGhlIHNlbmRlcjsgZGVmYXVsdCBpcyBjdXJyZW50LlxuICAgKi9cbiAgb29iTm90aWZpY2F0aW9uKHdoYXQsIHRvcGljTmFtZSwgc2VxLCBhY3QpIHtcbiAgICBjb25zdCB0b3BpYyA9IHRoaXMuI2NhY2hlR2V0KCd0b3BpYycsIHRvcGljTmFtZSk7XG4gICAgaWYgKHRvcGljKSB7XG4gICAgICB0b3BpYy5fdXBkYXRlUmVjZWl2ZWQoc2VxLCBhY3QpO1xuICAgICAgdGhpcy5nZXRNZVRvcGljKCkuX3JlZnJlc2hDb250YWN0KCdtc2cnLCB0b3BpYyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIEdldFF1ZXJ5XG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHByb3BlcnR5IHtUaW5vZGUuR2V0T3B0c1R5cGU9fSBkZXNjIC0gSWYgcHJvdmlkZWQgKGV2ZW4gaWYgZW1wdHkpLCBmZXRjaCB0b3BpYyBkZXNjcmlwdGlvbi5cbiAgICogQHByb3BlcnR5IHtUaW5vZGUuR2V0T3B0c1R5cGU9fSBzdWIgLSBJZiBwcm92aWRlZCAoZXZlbiBpZiBlbXB0eSksIGZldGNoIHRvcGljIHN1YnNjcmlwdGlvbnMuXG4gICAqIEBwcm9wZXJ0eSB7VGlub2RlLkdldERhdGFUeXBlPX0gZGF0YSAtIElmIHByb3ZpZGVkIChldmVuIGlmIGVtcHR5KSwgZ2V0IG1lc3NhZ2VzLlxuICAgKi9cblxuICAvKipcbiAgICogQHR5cGVkZWYgR2V0T3B0c1R5cGVcbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKiBAcHJvcGVydHkge0RhdGU9fSBpbXMgLSBcIklmIG1vZGlmaWVkIHNpbmNlXCIsIGZldGNoIGRhdGEgb25seSBpdCB3YXMgd2FzIG1vZGlmaWVkIHNpbmNlIHN0YXRlZCBkYXRlLlxuICAgKiBAcHJvcGVydHkge251bWJlcj19IGxpbWl0IC0gTWF4aW11bSBudW1iZXIgb2YgcmVzdWx0cyB0byByZXR1cm4uIElnbm9yZWQgd2hlbiBxdWVyeWluZyB0b3BpYyBkZXNjcmlwdGlvbi5cbiAgICovXG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIEdldERhdGFUeXBlXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHByb3BlcnR5IHtudW1iZXI9fSBzaW5jZSAtIExvYWQgbWVzc2FnZXMgd2l0aCBzZXEgaWQgZXF1YWwgb3IgZ3JlYXRlciB0aGFuIHRoaXMgdmFsdWUuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyPX0gYmVmb3JlIC0gTG9hZCBtZXNzYWdlcyB3aXRoIHNlcSBpZCBsb3dlciB0aGFuIHRoaXMgbnVtYmVyLlxuICAgKiBAcHJvcGVydHkge251bWJlcj19IGxpbWl0IC0gTWF4aW11bSBudW1iZXIgb2YgcmVzdWx0cyB0byByZXR1cm4uXG4gICAqL1xuXG4gIC8qKlxuICAgKiBSZXF1ZXN0IHRvcGljIG1ldGFkYXRhXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b3BpYyAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIHF1ZXJ5LlxuICAgKiBAcGFyYW0ge1Rpbm9kZS5HZXRRdWVyeX0gcGFyYW1zIC0gUGFyYW1ldGVycyBvZiB0aGUgcXVlcnkuIFVzZSB7QGxpbmsgVGlub2RlLk1ldGFHZXRCdWlsZGVyfSB0byBnZW5lcmF0ZS5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCBvbiByZWNlaXZpbmcgc2VydmVyIHJlcGx5LlxuICAgKi9cbiAgZ2V0TWV0YSh0b3BpYywgcGFyYW1zKSB7XG4gICAgY29uc3QgcGt0ID0gdGhpcy4jaW5pdFBhY2tldCgnZ2V0JywgdG9waWMpO1xuXG4gICAgcGt0LmdldCA9IG1lcmdlT2JqKHBrdC5nZXQsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gdGhpcy4jc2VuZChwa3QsIHBrdC5nZXQuaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0b3BpYydzIG1ldGFkYXRhOiBkZXNjcmlwdGlvbiwgc3Vic2NyaWJ0aW9ucy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRvcGljIC0gVG9waWMgdG8gdXBkYXRlLlxuICAgKiBAcGFyYW0ge1Rpbm9kZS5TZXRQYXJhbXN9IHBhcmFtcyAtIHRvcGljIG1ldGFkYXRhIHRvIHVwZGF0ZS5cbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCBvbiByZWNlaXZpbmcgc2VydmVyIHJlcGx5LlxuICAgKi9cbiAgc2V0TWV0YSh0b3BpYywgcGFyYW1zKSB7XG4gICAgY29uc3QgcGt0ID0gdGhpcy4jaW5pdFBhY2tldCgnc2V0JywgdG9waWMpO1xuICAgIGNvbnN0IHdoYXQgPSBbXTtcblxuICAgIGlmIChwYXJhbXMpIHtcbiAgICAgIFsnZGVzYycsICdzdWInLCAndGFncycsICdjcmVkJ10uZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgaWYgKHBhcmFtcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgd2hhdC5wdXNoKGtleSk7XG4gICAgICAgICAgcGt0LnNldFtrZXldID0gcGFyYW1zW2tleV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXJhbXMuYXR0YWNobWVudHMpICYmIHBhcmFtcy5hdHRhY2htZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHBrdC5leHRyYSA9IHtcbiAgICAgICAgICBhdHRhY2htZW50czogcGFyYW1zLmF0dGFjaG1lbnRzLmZpbHRlcihyZWYgPT4gVGlub2RlLmlzUmVsYXRpdmVVUkwocmVmKSlcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAod2hhdC5sZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIkludmFsaWQge3NldH0gcGFyYW1ldGVyc1wiKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuI3NlbmQocGt0LCBwa3Quc2V0LmlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSYW5nZSBvZiBtZXNzYWdlIElEcyB0byBkZWxldGUuXG4gICAqXG4gICAqIEB0eXBlZGVmIERlbFJhbmdlXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IGxvdyAtIGxvdyBlbmQgb2YgdGhlIHJhbmdlLCBpbmNsdXNpdmUgKGNsb3NlZCkuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyPX0gaGkgLSBoaWdoIGVuZCBvZiB0aGUgcmFuZ2UsIGV4Y2x1c2l2ZSAob3BlbikuXG4gICAqL1xuICAvKipcbiAgICogRGVsZXRlIHNvbWUgb3IgYWxsIG1lc3NhZ2VzIGluIGEgdG9waWMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b3BpYyAtIFRvcGljIG5hbWUgdG8gZGVsZXRlIG1lc3NhZ2VzIGZyb20uXG4gICAqIEBwYXJhbSB7VGlub2RlLkRlbFJhbmdlW119IGxpc3QgLSBSYW5nZXMgb2YgbWVzc2FnZSBJRHMgdG8gZGVsZXRlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBoYXJkIC0gSGFyZCBvciBzb2Z0IGRlbGV0ZVxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkL3JlamVjdGVkIG9uIHJlY2VpdmluZyBzZXJ2ZXIgcmVwbHkuXG4gICAqL1xuICBkZWxNZXNzYWdlcyh0b3BpYywgcmFuZ2VzLCBoYXJkKSB7XG4gICAgY29uc3QgcGt0ID0gdGhpcy4jaW5pdFBhY2tldCgnZGVsJywgdG9waWMpO1xuXG4gICAgcGt0LmRlbC53aGF0ID0gJ21zZyc7XG4gICAgcGt0LmRlbC5kZWxzZXEgPSByYW5nZXM7XG4gICAgcGt0LmRlbC5oYXJkID0gaGFyZDtcblxuICAgIHJldHVybiB0aGlzLiNzZW5kKHBrdCwgcGt0LmRlbC5pZCk7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIHRoZSB0b3BpYyBhbGx0b2dldGhlci4gUmVxdWlyZXMgT3duZXIgcGVybWlzc2lvbi5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRvcGljTmFtZSAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIGRlbGV0ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGhhcmQgLSBoYXJkLWRlbGV0ZSB0b3BpYy5cbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCBvbiByZWNlaXZpbmcgc2VydmVyIHJlcGx5LlxuICAgKi9cbiAgZGVsVG9waWModG9waWNOYW1lLCBoYXJkKSB7XG4gICAgY29uc3QgcGt0ID0gdGhpcy4jaW5pdFBhY2tldCgnZGVsJywgdG9waWNOYW1lKTtcbiAgICBwa3QuZGVsLndoYXQgPSAndG9waWMnO1xuICAgIHBrdC5kZWwuaGFyZCA9IGhhcmQ7XG5cbiAgICByZXR1cm4gdGhpcy4jc2VuZChwa3QsIHBrdC5kZWwuaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSBzdWJzY3JpcHRpb24uIFJlcXVpcmVzIFNoYXJlIHBlcm1pc3Npb24uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b3BpY05hbWUgLSBOYW1lIG9mIHRoZSB0b3BpYyB0byBkZWxldGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXIgLSBVc2VyIElEIHRvIHJlbW92ZS5cbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCBvbiByZWNlaXZpbmcgc2VydmVyIHJlcGx5LlxuICAgKi9cbiAgZGVsU3Vic2NyaXB0aW9uKHRvcGljTmFtZSwgdXNlcikge1xuICAgIGNvbnN0IHBrdCA9IHRoaXMuI2luaXRQYWNrZXQoJ2RlbCcsIHRvcGljTmFtZSk7XG4gICAgcGt0LmRlbC53aGF0ID0gJ3N1Yic7XG4gICAgcGt0LmRlbC51c2VyID0gdXNlcjtcblxuICAgIHJldHVybiB0aGlzLiNzZW5kKHBrdCwgcGt0LmRlbC5pZCk7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIGNyZWRlbnRpYWwuIEFsd2F5cyBzZW50IG9uIDxjb2RlPidtZSc8L2NvZGU+IHRvcGljLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kIC0gdmFsaWRhdGlvbiBtZXRob2Qgc3VjaCBhcyA8Y29kZT4nZW1haWwnPC9jb2RlPiBvciA8Y29kZT4ndGVsJzwvY29kZT4uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIHZhbGlkYXRpb24gdmFsdWUsIGkuZS4gPGNvZGU+J2FsaWNlQGV4YW1wbGUuY29tJzwvY29kZT4uXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgb24gcmVjZWl2aW5nIHNlcnZlciByZXBseS5cbiAgICovXG4gIGRlbENyZWRlbnRpYWwobWV0aG9kLCB2YWx1ZSkge1xuICAgIGNvbnN0IHBrdCA9IHRoaXMuI2luaXRQYWNrZXQoJ2RlbCcsIENvbnN0LlRPUElDX01FKTtcbiAgICBwa3QuZGVsLndoYXQgPSAnY3JlZCc7XG4gICAgcGt0LmRlbC5jcmVkID0ge1xuICAgICAgbWV0aDogbWV0aG9kLFxuICAgICAgdmFsOiB2YWx1ZVxuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcy4jc2VuZChwa3QsIHBrdC5kZWwuaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVlc3QgdG8gZGVsZXRlIGFjY291bnQgb2YgdGhlIGN1cnJlbnQgdXNlci5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBoYXJkIC0gaGFyZC1kZWxldGUgdXNlci5cbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCBvbiByZWNlaXZpbmcgc2VydmVyIHJlcGx5LlxuICAgKi9cbiAgZGVsQ3VycmVudFVzZXIoaGFyZCkge1xuICAgIGNvbnN0IHBrdCA9IHRoaXMuI2luaXRQYWNrZXQoJ2RlbCcsIG51bGwpO1xuICAgIHBrdC5kZWwud2hhdCA9ICd1c2VyJztcbiAgICBwa3QuZGVsLmhhcmQgPSBoYXJkO1xuXG4gICAgcmV0dXJuIHRoaXMuI3NlbmQocGt0LCBwa3QuZGVsLmlkKS50aGVuKChjdHJsKSA9PiB7XG4gICAgICB0aGlzLl9teVVJRCA9IG51bGw7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTm90aWZ5IHNlcnZlciB0aGF0IGEgbWVzc2FnZSBvciBtZXNzYWdlcyB3ZXJlIHJlYWQgb3IgcmVjZWl2ZWQuIERvZXMgTk9UIHJldHVybiBwcm9taXNlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWNOYW1lIC0gTmFtZSBvZiB0aGUgdG9waWMgd2hlcmUgdGhlIG1lc2FnZSBpcyBiZWluZyBha25vd2xlZGdlZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHdoYXQgLSBBY3Rpb24gYmVpbmcgYWtub3dsZWRnZWQsIGVpdGhlciA8Y29kZT5cInJlYWRcIjwvY29kZT4gb3IgPGNvZGU+XCJyZWN2XCI8L2NvZGU+LlxuICAgKiBAcGFyYW0ge251bWJlcn0gc2VxIC0gTWF4aW11bSBpZCBvZiB0aGUgbWVzc2FnZSBiZWluZyBhY2tub3dsZWRnZWQuXG4gICAqL1xuICBub3RlKHRvcGljTmFtZSwgd2hhdCwgc2VxKSB7XG4gICAgaWYgKHNlcSA8PSAwIHx8IHNlcSA+PSBDb25zdC5MT0NBTF9TRVFJRCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIG1lc3NhZ2UgaWQgJHtzZXF9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgcGt0ID0gdGhpcy4jaW5pdFBhY2tldCgnbm90ZScsIHRvcGljTmFtZSk7XG4gICAgcGt0Lm5vdGUud2hhdCA9IHdoYXQ7XG4gICAgcGt0Lm5vdGUuc2VxID0gc2VxO1xuICAgIHRoaXMuI3NlbmQocGt0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCcm9hZGNhc3QgYSBrZXktcHJlc3Mgbm90aWZpY2F0aW9uIHRvIHRvcGljIHN1YnNjcmliZXJzLiBVc2VkIHRvIHNob3dcbiAgICogdHlwaW5nIG5vdGlmaWNhdGlvbnMgXCJ1c2VyIFggaXMgdHlwaW5nLi4uXCIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b3BpY05hbWUgLSBOYW1lIG9mIHRoZSB0b3BpYyB0byBicm9hZGNhc3QgdG8uXG4gICAqL1xuICBub3RlS2V5UHJlc3ModG9waWNOYW1lKSB7XG4gICAgY29uc3QgcGt0ID0gdGhpcy4jaW5pdFBhY2tldCgnbm90ZScsIHRvcGljTmFtZSk7XG4gICAgcGt0Lm5vdGUud2hhdCA9ICdrcCc7XG4gICAgdGhpcy4jc2VuZChwa3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIG5hbWVkIHRvcGljLCBlaXRoZXIgcHVsbCBpdCBmcm9tIGNhY2hlIG9yIGNyZWF0ZSBhIG5ldyBpbnN0YW5jZS5cbiAgICogVGhlcmUgaXMgYSBzaW5nbGUgaW5zdGFuY2Ugb2YgdG9waWMgZm9yIGVhY2ggbmFtZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRvcGljTmFtZSAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIGdldC5cbiAgICogQHJldHVybnMge1Rpbm9kZS5Ub3BpY30gUmVxdWVzdGVkIG9yIG5ld2x5IGNyZWF0ZWQgdG9waWMgb3IgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPiBpZiB0b3BpYyBuYW1lIGlzIGludmFsaWQuXG4gICAqL1xuICBnZXRUb3BpYyh0b3BpY05hbWUpIHtcbiAgICBsZXQgdG9waWMgPSB0aGlzLiNjYWNoZUdldCgndG9waWMnLCB0b3BpY05hbWUpO1xuICAgIGlmICghdG9waWMgJiYgdG9waWNOYW1lKSB7XG4gICAgICBpZiAodG9waWNOYW1lID09IENvbnN0LlRPUElDX01FKSB7XG4gICAgICAgIHRvcGljID0gbmV3IFRvcGljTWUoKTtcbiAgICAgIH0gZWxzZSBpZiAodG9waWNOYW1lID09IENvbnN0LlRPUElDX0ZORCkge1xuICAgICAgICB0b3BpYyA9IG5ldyBUb3BpY0ZuZCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9waWMgPSBuZXcgVG9waWModG9waWNOYW1lKTtcbiAgICAgIH1cbiAgICAgIC8vIENhY2hlIG1hbmFnZW1lbnQuXG4gICAgICB0aGlzLiNhdHRhY2hDYWNoZVRvVG9waWModG9waWMpO1xuICAgICAgdG9waWMuX2NhY2hlUHV0U2VsZigpO1xuICAgICAgLy8gRG9uJ3Qgc2F2ZSB0byBEQiBoZXJlOiBhIHJlY29yZCB3aWxsIGJlIGFkZGVkIHdoZW4gdGhlIHRvcGljIGlzIHN1YnNjcmliZWQuXG4gICAgfVxuICAgIHJldHVybiB0b3BpYztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBuYW1lZCB0b3BpYyBmcm9tIGNhY2hlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWNOYW1lIC0gTmFtZSBvZiB0aGUgdG9waWMgdG8gZ2V0LlxuICAgKiBAcmV0dXJucyB7VGlub2RlLlRvcGljfSBSZXF1ZXN0ZWQgdG9waWMgb3IgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPiBpZiB0b3BpYyBpcyBub3QgZm91bmQgaW4gY2FjaGUuXG4gICAqL1xuICBjYWNoZUdldFRvcGljKHRvcGljTmFtZSkge1xuICAgIHJldHVybiB0aGlzLiNjYWNoZUdldCgndG9waWMnLCB0b3BpY05hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBuYW1lZCB0b3BpYyBmcm9tIGNhY2hlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWNOYW1lIC0gTmFtZSBvZiB0aGUgdG9waWMgdG8gcmVtb3ZlIGZyb20gY2FjaGUuXG4gICAqL1xuICBjYWNoZVJlbVRvcGljKHRvcGljTmFtZSkge1xuICAgIHRoaXMuI2NhY2hlRGVsKCd0b3BpYycsIHRvcGljTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZSBvdmVyIGNhY2hlZCB0b3BpY3MuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgLSBjYWxsYmFjayB0byBjYWxsIGZvciBlYWNoIHRvcGljLlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtICd0aGlzJyBpbnNpZGUgdGhlICdmdW5jJy5cbiAgICovXG4gIG1hcFRvcGljcyhmdW5jLCBjb250ZXh0KSB7XG4gICAgdGhpcy4jY2FjaGVNYXAoJ3RvcGljJywgZnVuYywgY29udGV4dCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgbmFtZWQgdG9waWMgaXMgYWxyZWFkeSBwcmVzZW50IGluIGNhY2hlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWNOYW1lIC0gTmFtZSBvZiB0aGUgdG9waWMgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRvcGljIGlzIGZvdW5kIGluIGNhY2hlLCBmYWxzZSBvdGhlcndpc2UuXG4gICAqL1xuICBpc1RvcGljQ2FjaGVkKHRvcGljTmFtZSkge1xuICAgIHJldHVybiAhIXRoaXMuI2NhY2hlR2V0KCd0b3BpYycsIHRvcGljTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgdW5pcXVlIG5hbWUgbGlrZSA8Y29kZT4nbmV3MTIzNDU2JzwvY29kZT4gc3VpdGFibGUgZm9yIGNyZWF0aW5nIGEgbmV3IGdyb3VwIHRvcGljLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQ2hhbiAtIGlmIHRoZSB0b3BpYyBpcyBjaGFubmVsLWVuYWJsZWQuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IG5hbWUgd2hpY2ggY2FuIGJlIHVzZWQgZm9yIGNyZWF0aW5nIGEgbmV3IGdyb3VwIHRvcGljLlxuICAgKi9cbiAgbmV3R3JvdXBUb3BpY05hbWUoaXNDaGFuKSB7XG4gICAgcmV0dXJuIChpc0NoYW4gPyBDb25zdC5UT1BJQ19ORVdfQ0hBTiA6IENvbnN0LlRPUElDX05FVykgKyB0aGlzLmdldE5leHRVbmlxdWVJZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlIDxjb2RlPidtZSc8L2NvZGU+IHRvcGljIG9yIGdldCBpdCBmcm9tIGNhY2hlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcmV0dXJucyB7VGlub2RlLlRvcGljTWV9IEluc3RhbmNlIG9mIDxjb2RlPidtZSc8L2NvZGU+IHRvcGljLlxuICAgKi9cbiAgZ2V0TWVUb3BpYygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRUb3BpYyhDb25zdC5UT1BJQ19NRSk7XG4gIH1cblxuICAvKipcbiAgICogSW5zdGFudGlhdGUgPGNvZGU+J2ZuZCc8L2NvZGU+IChmaW5kKSB0b3BpYyBvciBnZXQgaXQgZnJvbSBjYWNoZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHJldHVybnMge1Rpbm9kZS5Ub3BpY30gSW5zdGFuY2Ugb2YgPGNvZGU+J2ZuZCc8L2NvZGU+IHRvcGljLlxuICAgKi9cbiAgZ2V0Rm5kVG9waWMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VG9waWMoQ29uc3QuVE9QSUNfRk5EKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcge0BsaW5rIExhcmdlRmlsZUhlbHBlcn0gaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHJldHVybnMge1Rpbm9kZS5MYXJnZUZpbGVIZWxwZXJ9IGluc3RhbmNlIG9mIGEge0BsaW5rIFRpbm9kZS5MYXJnZUZpbGVIZWxwZXJ9LlxuICAgKi9cbiAgZ2V0TGFyZ2VGaWxlSGVscGVyKCkge1xuICAgIHJldHVybiBuZXcgTGFyZ2VGaWxlSGVscGVyKHRoaXMsIENvbnN0LlBST1RPQ09MX1ZFUlNJT04pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgVUlEIG9mIHRoZSB0aGUgY3VycmVudCBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFVJRCBvZiB0aGUgY3VycmVudCB1c2VyIG9yIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gaWYgdGhlIHNlc3Npb24gaXMgbm90IHlldCBhdXRoZW50aWNhdGVkIG9yIGlmIHRoZXJlIGlzIG5vIHNlc3Npb24uXG4gICAqL1xuICBnZXRDdXJyZW50VXNlcklEKCkge1xuICAgIHJldHVybiB0aGlzLl9teVVJRDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgZ2l2ZW4gdXNlciBJRCBpcyBlcXVhbCB0byB0aGUgY3VycmVudCB1c2VyJ3MgVUlELlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKiBAcGFyYW0ge3N0cmluZ30gdWlkIC0gVUlEIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgZ2l2ZW4gVUlEIGJlbG9uZ3MgdG8gdGhlIGN1cnJlbnQgbG9nZ2VkIGluIHVzZXIuXG4gICAqL1xuICBpc01lKHVpZCkge1xuICAgIHJldHVybiB0aGlzLl9teVVJRCA9PT0gdWlkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBsb2dpbiB1c2VkIGZvciBsYXN0IHN1Y2Nlc3NmdWwgYXV0aGVudGljYXRpb24uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IGxvZ2luIGxhc3QgdXNlZCBzdWNjZXNzZnVsbHkgb3IgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPi5cbiAgICovXG4gIGdldEN1cnJlbnRMb2dpbigpIHtcbiAgICByZXR1cm4gdGhpcy5fbG9naW47XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGluZm9ybWF0aW9uIGFib3V0IHRoZSBzZXJ2ZXI6IHByb3RvY29sIHZlcnNpb24gYW5kIGJ1aWxkIHRpbWVzdGFtcC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICogQHJldHVybnMge09iamVjdH0gYnVpbGQgYW5kIHZlcnNpb24gb2YgdGhlIHNlcnZlciBvciA8Y29kZT5udWxsPC9jb2RlPiBpZiB0aGVyZSBpcyBubyBjb25uZWN0aW9uIG9yIGlmIHRoZSBmaXJzdCBzZXJ2ZXIgcmVzcG9uc2UgaGFzIG5vdCBiZWVuIHJlY2VpdmVkIHlldC5cbiAgICovXG4gIGdldFNlcnZlckluZm8oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZlckluZm87XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHNlcnZlci1wcm92aWRlZCBjb25maWd1cmF0aW9uIHZhbHVlIChsb25nIGludGVnZXIpLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBvZiB0aGUgdmFsdWUgdG8gcmV0dXJuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0VmFsdWUgdG8gcmV0dXJuIGluIGNhc2Ugc2VydmVyIGxpbWl0IGlzIG5vdCBzZXQgb3Igbm90IGZvdW5kLlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBuYW1lZCB2YWx1ZS5cbiAgICovXG4gIGdldFNlcnZlckxpbWl0KG5hbWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgIHJldHVybiAodGhpcy5fc2VydmVySW5mbyA/IHRoaXMuX3NlcnZlckluZm9bbmFtZV0gOiBudWxsKSB8fCBkZWZhdWx0VmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlIGNvbnNvbGUgbG9nZ2luZy4gTG9nZ2luZyBpcyBvZmYgYnkgZGVmYXVsdC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICogQHBhcmFtIHtib29sZWFufSBlbmFibGVkIC0gU2V0IHRvIDxjb2RlPnRydWU8L2NvZGU+IHRvIGVuYWJsZSBsb2dnaW5nIHRvIGNvbnNvbGUuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdHJpbUxvbmdTdHJpbmdzIC0gU2V0IHRvIDxjb2RlPnRydWU8L2NvZGU+IHRvIHRyaW0gbG9uZyBzdHJpbmdzLlxuICAgKi9cbiAgZW5hYmxlTG9nZ2luZyhlbmFibGVkLCB0cmltTG9uZ1N0cmluZ3MpIHtcbiAgICB0aGlzLl9sb2dnaW5nRW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgdGhpcy5fdHJpbUxvbmdTdHJpbmdzID0gZW5hYmxlZCAmJiB0cmltTG9uZ1N0cmluZ3M7XG4gIH1cblxuICAvKipcbiAgICogU2V0IFVJIGxhbmd1YWdlIHRvIHJlcG9ydCB0byB0aGUgc2VydmVyLiBNdXN0IGJlIGNhbGxlZCBiZWZvcmUgPGNvZGU+J2hpJzwvY29kZT4gaXMgc2VudCwgb3RoZXJ3aXNlIGl0IHdpbGwgbm90IGJlIHVzZWQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBobCAtIGh1bWFuIChVSSkgbGFuZ3VhZ2UsIGxpa2UgPGNvZGU+XCJlbl9VU1wiPC9jb2RlPiBvciA8Y29kZT5cInpoLUhhbnNcIjwvY29kZT4uXG4gICAqL1xuICBzZXRIdW1hbkxhbmd1YWdlKGhsKSB7XG4gICAgaWYgKGhsKSB7XG4gICAgICB0aGlzLl9odW1hbkxhbmd1YWdlID0gaGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGdpdmVuIHRvcGljIGlzIG9ubGluZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgb2YgdGhlIHRvcGljIHRvIHRlc3QuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRvcGljIGlzIG9ubGluZSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgaXNUb3BpY09ubGluZShuYW1lKSB7XG4gICAgY29uc3QgdG9waWMgPSB0aGlzLiNjYWNoZUdldCgndG9waWMnLCBuYW1lKTtcbiAgICByZXR1cm4gdG9waWMgJiYgdG9waWMub25saW5lO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhY2Nlc3MgbW9kZSBmb3IgdGhlIGdpdmVuIGNvbnRhY3QuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG9mIHRoZSB0b3BpYyB0byBxdWVyeS5cbiAgICogQHJldHVybnMge0FjY2Vzc01vZGV9IGFjY2VzcyBtb2RlIGlmIHRvcGljIGlzIGZvdW5kLCBudWxsIG90aGVyd2lzZS5cbiAgICovXG4gIGdldFRvcGljQWNjZXNzTW9kZShuYW1lKSB7XG4gICAgY29uc3QgdG9waWMgPSB0aGlzLiNjYWNoZUdldCgndG9waWMnLCBuYW1lKTtcbiAgICByZXR1cm4gdG9waWMgPyB0b3BpYy5hY3MgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEluY2x1ZGUgbWVzc2FnZSBJRCBpbnRvIGFsbCBzdWJzZXF1ZXN0IG1lc3NhZ2VzIHRvIHNlcnZlciBpbnN0cnVjdGluIGl0IHRvIHNlbmQgYWtub3dsZWRnZW1lbnMuXG4gICAqIFJlcXVpcmVkIGZvciBwcm9taXNlcyB0byBmdW5jdGlvbi4gRGVmYXVsdCBpcyA8Y29kZT5cIm9uXCI8L2NvZGU+LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN0YXR1cyAtIFR1cm4gYWtub3dsZWRnZW1lbnMgb24gb3Igb2ZmLlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgd2FudEFrbihzdGF0dXMpIHtcbiAgICBpZiAoc3RhdHVzKSB7XG4gICAgICB0aGlzLl9tZXNzYWdlSWQgPSBNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogMHhGRkZGRkYpICsgMHhGRkZGRkYpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tZXNzYWdlSWQgPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8vIENhbGxiYWNrczpcbiAgLyoqXG4gICAqIENhbGxiYWNrIHRvIHJlcG9ydCB3aGVuIHRoZSB3ZWJzb2NrZXQgaXMgb3BlbmVkLiBUaGUgY2FsbGJhY2sgaGFzIG5vIHBhcmFtZXRlcnMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEB0eXBlIHtUaW5vZGUub25XZWJzb2NrZXRPcGVufVxuICAgKi9cbiAgb25XZWJzb2NrZXRPcGVuID0gdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiBUaW5vZGUuU2VydmVyUGFyYW1zXG4gICAqIEBtZW1iZXJvZiBUaW5vZGVcbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IHZlciAtIFNlcnZlciB2ZXJzaW9uXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBidWlsZCAtIFNlcnZlciBidWlsZFxuICAgKiBAcHJvcGVydHkge3N0cmluZz19IHNpZCAtIFNlc3Npb24gSUQsIGxvbmcgcG9sbGluZyBjb25uZWN0aW9ucyBvbmx5LlxuICAgKi9cblxuICAvKipcbiAgICogQGNhbGxiYWNrIFRpbm9kZS5vbkNvbm5lY3RcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvZGUgLSBSZXN1bHQgY29kZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRleHQgZXB4cGxhaW5pbmcgdGhlIGNvbXBsZXRpb24sIGkuZSBcIk9LXCIgb3IgYW4gZXJyb3IgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtUaW5vZGUuU2VydmVyUGFyYW1zfSBwYXJhbXMgLSBQYXJhbWV0ZXJzIHJldHVybmVkIGJ5IHRoZSBzZXJ2ZXIuXG4gICAqL1xuICAvKipcbiAgICogQ2FsbGJhY2sgdG8gcmVwb3J0IHdoZW4gY29ubmVjdGlvbiB3aXRoIFRpbm9kZSBzZXJ2ZXIgaXMgZXN0YWJsaXNoZWQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEB0eXBlIHtUaW5vZGUub25Db25uZWN0fVxuICAgKi9cbiAgb25Db25uZWN0ID0gdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBDYWxsYmFjayB0byByZXBvcnQgd2hlbiBjb25uZWN0aW9uIGlzIGxvc3QuIFRoZSBjYWxsYmFjayBoYXMgbm8gcGFyYW1ldGVycy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICogQHR5cGUge1Rpbm9kZS5vbkRpc2Nvbm5lY3R9XG4gICAqL1xuICBvbkRpc2Nvbm5lY3QgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEBjYWxsYmFjayBUaW5vZGUub25Mb2dpblxuICAgKiBAcGFyYW0ge251bWJlcn0gY29kZSAtIE5VbWVyaWMgY29tcGxldGlvbiBjb2RlLCBzYW1lIGFzIEhUVFAgc3RhdHVzIGNvZGVzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIEV4cGxhbmF0aW9uIG9mIHRoZSBjb21wbGV0aW9uIGNvZGUuXG4gICAqL1xuICAvKipcbiAgICogQ2FsbGJhY2sgdG8gcmVwb3J0IGxvZ2luIGNvbXBsZXRpb24uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEB0eXBlIHtUaW5vZGUub25Mb2dpbn1cbiAgICovXG4gIG9uTG9naW4gPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRvIHJlY2VpdmUgPGNvZGU+e2N0cmx9PC9jb2RlPiAoY29udHJvbCkgbWVzc2FnZXMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEB0eXBlIHtUaW5vZGUub25DdHJsTWVzc2FnZX1cbiAgICovXG4gIG9uQ3RybE1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRvIHJlY2lldmUgPGNvZGU+e2RhdGF9PC9jb2RlPiAoY29udGVudCkgbWVzc2FnZXMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEB0eXBlIHtUaW5vZGUub25EYXRhTWVzc2FnZX1cbiAgICovXG4gIG9uRGF0YU1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRvIHJlY2VpdmUgPGNvZGU+e3ByZXN9PC9jb2RlPiAocHJlc2VuY2UpIG1lc3NhZ2VzLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKiBAdHlwZSB7VGlub2RlLm9uUHJlc01lc3NhZ2V9XG4gICAqL1xuICBvblByZXNNZXNzYWdlID0gdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBDYWxsYmFjayB0byByZWNlaXZlIGFsbCBtZXNzYWdlcyBhcyBvYmplY3RzLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKiBAdHlwZSB7VGlub2RlLm9uTWVzc2FnZX1cbiAgICovXG4gIG9uTWVzc2FnZSA9IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogQ2FsbGJhY2sgdG8gcmVjZWl2ZSBhbGwgbWVzc2FnZXMgYXMgdW5wYXJzZWQgdGV4dC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZSNcbiAgICogQHR5cGUge1Rpbm9kZS5vblJhd01lc3NhZ2V9XG4gICAqL1xuICBvblJhd01lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRvIHJlY2VpdmUgc2VydmVyIHJlc3BvbnNlcyB0byBuZXR3b3JrIHByb2Jlcy4gU2VlIHtAbGluayBUaW5vZGUjbmV0d29ya1Byb2JlfVxuICAgKiBAbWVtYmVyb2YgVGlub2RlI1xuICAgKiBAdHlwZSB7VGlub2RlLm9uTmV0d29ya1Byb2JlfVxuICAgKi9cbiAgb25OZXR3b3JrUHJvYmUgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRvIGJlIG5vdGlmaWVkIHdoZW4gZXhwb25lbnRpYWwgYmFja29mZiBpcyBpdGVyYXRpbmcuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUjXG4gICAqIEB0eXBlIHtUaW5vZGUub25BdXRvcmVjb25uZWN0SXRlcmF0aW9ufVxuICAgKi9cbiAgb25BdXRvcmVjb25uZWN0SXRlcmF0aW9uID0gdW5kZWZpbmVkO1xufTtcblxuLy8gRXhwb3J0ZWQgY29uc3RhbnRzXG5UaW5vZGUuTUVTU0FHRV9TVEFUVVNfTk9ORSA9IENvbnN0Lk1FU1NBR0VfU1RBVFVTX05PTkU7XG5UaW5vZGUuTUVTU0FHRV9TVEFUVVNfUVVFVUVEID0gQ29uc3QuTUVTU0FHRV9TVEFUVVNfUVVFVUVEO1xuVGlub2RlLk1FU1NBR0VfU1RBVFVTX1NFTkRJTkcgPSBDb25zdC5NRVNTQUdFX1NUQVRVU19TRU5ESU5HO1xuVGlub2RlLk1FU1NBR0VfU1RBVFVTX0ZBSUxFRCA9IENvbnN0Lk1FU1NBR0VfU1RBVFVTX0ZBSUxFRDtcblRpbm9kZS5NRVNTQUdFX1NUQVRVU19TRU5UID0gQ29uc3QuTUVTU0FHRV9TVEFUVVNfU0VOVDtcblRpbm9kZS5NRVNTQUdFX1NUQVRVU19SRUNFSVZFRCA9IENvbnN0Lk1FU1NBR0VfU1RBVFVTX1JFQ0VJVkVEO1xuVGlub2RlLk1FU1NBR0VfU1RBVFVTX1JFQUQgPSBDb25zdC5NRVNTQUdFX1NUQVRVU19SRUFEO1xuVGlub2RlLk1FU1NBR0VfU1RBVFVTX1RPX01FID0gQ29uc3QuTUVTU0FHRV9TVEFUVVNfVE9fTUU7XG5UaW5vZGUuTUVTU0FHRV9TVEFUVVNfREVMX1JBTkdFID0gQ29uc3QuTUVTU0FHRV9TVEFUVVNfREVMX1JBTkdFO1xuXG4vLyBVbmljb2RlIFtkZWxdIHN5bWJvbC5cblRpbm9kZS5ERUxfQ0hBUiA9IENvbnN0LkRFTF9DSEFSO1xuXG4vLyBOYW1lcyBvZiBrZXlzIHRvIHNlcnZlci1wcm92aWRlZCBjb25maWd1cmF0aW9uIGxpbWl0cy5cblRpbm9kZS5NQVhfTUVTU0FHRV9TSVpFID0gJ21heE1lc3NhZ2VTaXplJztcblRpbm9kZS5NQVhfU1VCU0NSSUJFUl9DT1VOVCA9ICdtYXhTdWJzY3JpYmVyQ291bnQnO1xuVGlub2RlLk1BWF9UQUdfQ09VTlQgPSAnbWF4VGFnQ291bnQnO1xuVGlub2RlLk1BWF9GSUxFX1VQTE9BRF9TSVpFID0gJ21heEZpbGVVcGxvYWRTaXplJztcbiIsIi8qKlxuICogQGZpbGUgVG9waWMgbWFuYWdlbWVudC5cbiAqXG4gKiBAY29weXJpZ2h0IDIwMTUtMjAyMiBUaW5vZGUgTExDLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBBY2Nlc3NNb2RlIGZyb20gJy4vYWNjZXNzLW1vZGUuanMnO1xuaW1wb3J0IENCdWZmZXIgZnJvbSAnLi9jYnVmZmVyLmpzJztcbmltcG9ydCAqIGFzIENvbnN0IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCBEcmFmdHkgZnJvbSAnLi9kcmFmdHkuanMnO1xuaW1wb3J0IE1ldGFHZXRCdWlsZGVyIGZyb20gJy4vbWV0YS1idWlsZGVyLmpzJztcbmltcG9ydCB7XG4gIG1lcmdlT2JqLFxuICBtZXJnZVRvQ2FjaGUsXG4gIG5vcm1hbGl6ZUFycmF5XG59IGZyb20gJy4vdXRpbHMuanMnO1xuXG5leHBvcnQgY2xhc3MgVG9waWMge1xuICAvKipcbiAgICogQGNhbGxiYWNrIFRpbm9kZS5Ub3BpYy5vbkRhdGFcbiAgICogQHBhcmFtIHtEYXRhfSBkYXRhIC0gRGF0YSBwYWNrZXRcbiAgICovXG4gIC8qKlxuICAgKiBUb3BpYyBpcyBhIGNsYXNzIHJlcHJlc2VudGluZyBhIGxvZ2ljYWwgY29tbXVuaWNhdGlvbiBjaGFubmVsLlxuICAgKiBAY2xhc3MgVG9waWNcbiAgICogQG1lbWJlcm9mIFRpbm9kZVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIGNyZWF0ZS5cbiAgICogQHBhcmFtIHtPYmplY3Q9fSBjYWxsYmFja3MgLSBPYmplY3Qgd2l0aCB2YXJpb3VzIGV2ZW50IGNhbGxiYWNrcy5cbiAgICogQHBhcmFtIHtUaW5vZGUuVG9waWMub25EYXRhfSBjYWxsYmFja3Mub25EYXRhIC0gQ2FsbGJhY2sgd2hpY2ggcmVjZWl2ZXMgYSA8Y29kZT57ZGF0YX08L2NvZGU+IG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7Y2FsbGJhY2t9IGNhbGxiYWNrcy5vbk1ldGEgLSBDYWxsYmFjayB3aGljaCByZWNlaXZlcyBhIDxjb2RlPnttZXRhfTwvY29kZT4gbWVzc2FnZS5cbiAgICogQHBhcmFtIHtjYWxsYmFja30gY2FsbGJhY2tzLm9uUHJlcyAtIENhbGxiYWNrIHdoaWNoIHJlY2VpdmVzIGEgPGNvZGU+e3ByZXN9PC9jb2RlPiBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge2NhbGxiYWNrfSBjYWxsYmFja3Mub25JbmZvIC0gQ2FsbGJhY2sgd2hpY2ggcmVjZWl2ZXMgYW4gPGNvZGU+e2luZm99PC9jb2RlPiBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge2NhbGxiYWNrfSBjYWxsYmFja3Mub25NZXRhRGVzYyAtIENhbGxiYWNrIHdoaWNoIHJlY2VpdmVzIGNoYW5nZXMgdG8gdG9waWMgZGVzY3Rpb3B0aW9uIHtAbGluayBkZXNjfS5cbiAgICogQHBhcmFtIHtjYWxsYmFja30gY2FsbGJhY2tzLm9uTWV0YVN1YiAtIENhbGxlZCBmb3IgYSBzaW5nbGUgc3Vic2NyaXB0aW9uIHJlY29yZCBjaGFuZ2UuXG4gICAqIEBwYXJhbSB7Y2FsbGJhY2t9IGNhbGxiYWNrcy5vblN1YnNVcGRhdGVkIC0gQ2FsbGVkIGFmdGVyIGEgYmF0Y2ggb2Ygc3Vic2NyaXB0aW9uIGNoYW5nZXMgaGF2ZSBiZWVuIHJlY2lldmVkIGFuZCBjYWNoZWQuXG4gICAqIEBwYXJhbSB7Y2FsbGJhY2t9IGNhbGxiYWNrcy5vbkRlbGV0ZVRvcGljIC0gQ2FsbGVkIGFmdGVyIHRoZSB0b3BpYyBpcyBkZWxldGVkLlxuICAgKiBAcGFyYW0ge2NhbGxiYWNrfSBjYWxsYmFjbHMub25BbGxNZXNzYWdlc1JlY2VpdmVkIC0gQ2FsbGVkIHdoZW4gYWxsIHJlcXVlc3RlZCA8Y29kZT57ZGF0YX08L2NvZGU+IG1lc3NhZ2VzIGhhdmUgYmVlbiByZWNpdmVkLlxuICAgKi9cbiAgY29uc3RydWN0b3IobmFtZSwgY2FsbGJhY2tzKSB7XG4gICAgLy8gUGFyZW50IFRpbm9kZSBvYmplY3QuXG4gICAgdGhpcy5fdGlub2RlID0gbnVsbDtcblxuICAgIC8vIFNlcnZlci1wcm92aWRlZCBkYXRhLCBsb2NhbGx5IGltbXV0YWJsZS5cbiAgICAvLyB0b3BpYyBuYW1lXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAvLyBUaW1lc3RhbXAgd2hlbiB0aGUgdG9waWMgd2FzIGNyZWF0ZWQuXG4gICAgdGhpcy5jcmVhdGVkID0gbnVsbDtcbiAgICAvLyBUaW1lc3RhbXAgd2hlbiB0aGUgdG9waWMgd2FzIGxhc3QgdXBkYXRlZC5cbiAgICB0aGlzLnVwZGF0ZWQgPSBudWxsO1xuICAgIC8vIFRpbWVzdGFtcCBvZiB0aGUgbGFzdCBtZXNzYWdlc1xuICAgIHRoaXMudG91Y2hlZCA9IG5ldyBEYXRlKDApO1xuICAgIC8vIEFjY2VzcyBtb2RlLCBzZWUgQWNjZXNzTW9kZVxuICAgIHRoaXMuYWNzID0gbmV3IEFjY2Vzc01vZGUobnVsbCk7XG4gICAgLy8gUGVyLXRvcGljIHByaXZhdGUgZGF0YSAoYWNjZXNzaWJsZSBieSBjdXJyZW50IHVzZXIgb25seSkuXG4gICAgdGhpcy5wcml2YXRlID0gbnVsbDtcbiAgICAvLyBQZXItdG9waWMgcHVibGljIGRhdGEgKGFjY2Vzc2libGUgYnkgYWxsIHVzZXJzKS5cbiAgICB0aGlzLnB1YmxpYyA9IG51bGw7XG4gICAgLy8gUGVyLXRvcGljIHN5c3RlbS1wcm92aWRlZCBkYXRhIChhY2Nlc3NpYmxlIGJ5IGFsbCB1c2VycykuXG4gICAgdGhpcy50cnVzdGVkID0gbnVsbDtcblxuICAgIC8vIExvY2FsbHkgY2FjaGVkIGRhdGFcbiAgICAvLyBTdWJzY3JpYmVkIHVzZXJzLCBmb3IgdHJhY2tpbmcgcmVhZC9yZWN2L21zZyBub3RpZmljYXRpb25zLlxuICAgIHRoaXMuX3VzZXJzID0ge307XG5cbiAgICAvLyBDdXJyZW50IHZhbHVlIG9mIGxvY2FsbHkgaXNzdWVkIHNlcUlkLCB1c2VkIGZvciBwZW5kaW5nIG1lc3NhZ2VzLlxuICAgIHRoaXMuX3F1ZXVlZFNlcUlkID0gQ29uc3QuTE9DQUxfU0VRSUQ7XG5cbiAgICAvLyBUaGUgbWF4aW11bSBrbm93biB7ZGF0YS5zZXF9IHZhbHVlLlxuICAgIHRoaXMuX21heFNlcSA9IDA7XG4gICAgLy8gVGhlIG1pbmltdW0ga25vd24ge2RhdGEuc2VxfSB2YWx1ZS5cbiAgICB0aGlzLl9taW5TZXEgPSAwO1xuICAgIC8vIEluZGljYXRvciB0aGF0IHRoZSBsYXN0IHJlcXVlc3QgZm9yIGVhcmxpZXIgbWVzc2FnZXMgcmV0dXJuZWQgMC5cbiAgICB0aGlzLl9ub0VhcmxpZXJNc2dzID0gZmFsc2U7XG4gICAgLy8gVGhlIG1heGltdW0ga25vd24gZGVsZXRpb24gSUQuXG4gICAgdGhpcy5fbWF4RGVsID0gMDtcbiAgICAvLyBVc2VyIGRpc2NvdmVyeSB0YWdzXG4gICAgdGhpcy5fdGFncyA9IFtdO1xuICAgIC8vIENyZWRlbnRpYWxzIHN1Y2ggYXMgZW1haWwgb3IgcGhvbmUgbnVtYmVyLlxuICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gW107XG4gICAgLy8gTWVzc2FnZSBjYWNoZSwgc29ydGVkIGJ5IG1lc3NhZ2Ugc2VxIHZhbHVlcywgZnJvbSBvbGQgdG8gbmV3LlxuICAgIHRoaXMuX21lc3NhZ2VzID0gbmV3IENCdWZmZXIoKGEsIGIpID0+IHtcbiAgICAgIHJldHVybiBhLnNlcSAtIGIuc2VxO1xuICAgIH0sIHRydWUpO1xuICAgIC8vIEJvb2xlYW4sIHRydWUgaWYgdGhlIHRvcGljIGlzIGN1cnJlbnRseSBsaXZlXG4gICAgdGhpcy5fYXR0YWNoZWQgPSBmYWxzZTtcbiAgICAvLyBUaW1lc3RhcCBvZiB0aGUgbW9zdCByZWNlbnRseSB1cGRhdGVkIHN1YnNjcmlwdGlvbi5cbiAgICB0aGlzLl9sYXN0U3Vic1VwZGF0ZSA9IG5ldyBEYXRlKDApO1xuICAgIC8vIFRvcGljIGNyZWF0ZWQgYnV0IG5vdCB5ZXQgc3luY2VkIHdpdGggdGhlIHNlcnZlci4gVXNlZCBvbmx5IGR1cmluZyBpbml0aWFsaXphdGlvbi5cbiAgICB0aGlzLl9uZXcgPSB0cnVlO1xuICAgIC8vIFRoZSB0b3BpYyBpcyBkZWxldGVkIGF0IHRoZSBzZXJ2ZXIsIHRoaXMgaXMgYSBsb2NhbCBjb3B5LlxuICAgIHRoaXMuX2RlbGV0ZWQgPSBmYWxzZTtcblxuICAgIC8vIENhbGxiYWNrc1xuICAgIGlmIChjYWxsYmFja3MpIHtcbiAgICAgIHRoaXMub25EYXRhID0gY2FsbGJhY2tzLm9uRGF0YTtcbiAgICAgIHRoaXMub25NZXRhID0gY2FsbGJhY2tzLm9uTWV0YTtcbiAgICAgIHRoaXMub25QcmVzID0gY2FsbGJhY2tzLm9uUHJlcztcbiAgICAgIHRoaXMub25JbmZvID0gY2FsbGJhY2tzLm9uSW5mbztcbiAgICAgIC8vIEEgc2luZ2xlIGRlc2MgdXBkYXRlO1xuICAgICAgdGhpcy5vbk1ldGFEZXNjID0gY2FsbGJhY2tzLm9uTWV0YURlc2M7XG4gICAgICAvLyBBIHNpbmdsZSBzdWJzY3JpcHRpb24gcmVjb3JkO1xuICAgICAgdGhpcy5vbk1ldGFTdWIgPSBjYWxsYmFja3Mub25NZXRhU3ViO1xuICAgICAgLy8gQWxsIHN1YnNjcmlwdGlvbiByZWNvcmRzIHJlY2VpdmVkO1xuICAgICAgdGhpcy5vblN1YnNVcGRhdGVkID0gY2FsbGJhY2tzLm9uU3Vic1VwZGF0ZWQ7XG4gICAgICB0aGlzLm9uVGFnc1VwZGF0ZWQgPSBjYWxsYmFja3Mub25UYWdzVXBkYXRlZDtcbiAgICAgIHRoaXMub25DcmVkc1VwZGF0ZWQgPSBjYWxsYmFja3Mub25DcmVkc1VwZGF0ZWQ7XG4gICAgICB0aGlzLm9uRGVsZXRlVG9waWMgPSBjYWxsYmFja3Mub25EZWxldGVUb3BpYztcbiAgICAgIHRoaXMub25BbGxNZXNzYWdlc1JlY2VpdmVkID0gY2FsbGJhY2tzLm9uQWxsTWVzc2FnZXNSZWNlaXZlZDtcbiAgICB9XG4gIH1cblxuICAvLyBTdGF0aWMgbWV0aG9kcy5cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIHRvcGljIHR5cGUgZnJvbSB0b3BpYydzIG5hbWU6IGdycCwgcDJwLCBtZSwgZm5kLCBzeXMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSB0b3BpYyB0byB0ZXN0LlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBPbmUgb2YgPGNvZGU+XCJtZVwiPC9jb2RlPiwgPGNvZGU+XCJmbmRcIjwvY29kZT4sIDxjb2RlPlwic3lzXCI8L2NvZGU+LCA8Y29kZT5cImdycFwiPC9jb2RlPixcbiAgICogICAgPGNvZGU+XCJwMnBcIjwvY29kZT4gb3IgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPi5cbiAgICovXG4gIHN0YXRpYyB0b3BpY1R5cGUobmFtZSkge1xuICAgIGNvbnN0IHR5cGVzID0ge1xuICAgICAgJ21lJzogQ29uc3QuVE9QSUNfTUUsXG4gICAgICAnZm5kJzogQ29uc3QuVE9QSUNfRk5ELFxuICAgICAgJ2dycCc6IENvbnN0LlRPUElDX0dSUCxcbiAgICAgICduZXcnOiBDb25zdC5UT1BJQ19HUlAsXG4gICAgICAnbmNoJzogQ29uc3QuVE9QSUNfR1JQLFxuICAgICAgJ2Nobic6IENvbnN0LlRPUElDX0dSUCxcbiAgICAgICd1c3InOiBDb25zdC5UT1BJQ19QMlAsXG4gICAgICAnc3lzJzogQ29uc3QuVE9QSUNfU1lTXG4gICAgfTtcbiAgICByZXR1cm4gdHlwZXNbKHR5cGVvZiBuYW1lID09ICdzdHJpbmcnKSA/IG5hbWUuc3Vic3RyaW5nKDAsIDMpIDogJ3h4eCddO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBnaXZlbiB0b3BpYyBuYW1lIGlzIGEgbmFtZSBvZiBhICdtZScgdG9waWMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSB0b3BpYyB0byB0ZXN0LlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlIG5hbWUgaXMgYSBuYW1lIG9mIGEgJ21lJyB0b3BpYywgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIHN0YXRpYyBpc01lVG9waWNOYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gVG9waWMudG9waWNUeXBlKG5hbWUpID09IENvbnN0LlRPUElDX01FO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBnaXZlbiB0b3BpYyBuYW1lIGlzIGEgbmFtZSBvZiBhIGdyb3VwIHRvcGljLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKiBAc3RhdGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiB0aGUgdG9waWMgdG8gdGVzdC5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IDxjb2RlPnRydWU8L2NvZGU+IGlmIHRoZSBuYW1lIGlzIGEgbmFtZSBvZiBhIGdyb3VwIHRvcGljLCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICAgKi9cbiAgc3RhdGljIGlzR3JvdXBUb3BpY05hbWUobmFtZSkge1xuICAgIHJldHVybiBUb3BpYy50b3BpY1R5cGUobmFtZSkgPT0gQ29uc3QuVE9QSUNfR1JQO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBnaXZlbiB0b3BpYyBuYW1lIGlzIGEgbmFtZSBvZiBhIHAycCB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHRvcGljIHRvIHRlc3QuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiB0aGUgbmFtZSBpcyBhIG5hbWUgb2YgYSBwMnAgdG9waWMsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBzdGF0aWMgaXNQMlBUb3BpY05hbWUobmFtZSkge1xuICAgIHJldHVybiBUb3BpYy50b3BpY1R5cGUobmFtZSkgPT0gQ29uc3QuVE9QSUNfUDJQO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBnaXZlbiB0b3BpYyBuYW1lIGlzIGEgbmFtZSBvZiBhIGNvbW11bmljYXRpb24gdG9waWMsIGkuZS4gUDJQIG9yIGdyb3VwLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKiBAc3RhdGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiB0aGUgdG9waWMgdG8gdGVzdC5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IDxjb2RlPnRydWU8L2NvZGU+IGlmIHRoZSBuYW1lIGlzIGEgbmFtZSBvZiBhIHAycCBvciBncm91cCB0b3BpYywgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIHN0YXRpYyBpc0NvbW1Ub3BpY05hbWUobmFtZSkge1xuICAgIHJldHVybiBUb3BpYy5pc1AyUFRvcGljTmFtZShuYW1lKSB8fCBUb3BpYy5pc0dyb3VwVG9waWNOYW1lKG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSB0b3BpYyBuYW1lIGlzIGEgbmFtZSBvZiBhIG5ldyB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICogQHN0YXRpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIHRvcGljIG5hbWUgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiB0aGUgbmFtZSBpcyBhIG5hbWUgb2YgYSBuZXcgdG9waWMsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBzdGF0aWMgaXNOZXdHcm91cFRvcGljTmFtZShuYW1lKSB7XG4gICAgcmV0dXJuICh0eXBlb2YgbmFtZSA9PSAnc3RyaW5nJykgJiZcbiAgICAgIChuYW1lLnN1YnN0cmluZygwLCAzKSA9PSBDb25zdC5UT1BJQ19ORVcgfHwgbmFtZS5zdWJzdHJpbmcoMCwgMykgPT0gQ29uc3QuVE9QSUNfTkVXX0NIQU4pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSB0b3BpYyBuYW1lIGlzIGEgbmFtZSBvZiBhIGNoYW5uZWwuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqIEBzdGF0aWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSB0b3BpYyBuYW1lIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlIG5hbWUgaXMgYSBuYW1lIG9mIGEgY2hhbm5lbCwgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIHN0YXRpYyBpc0NoYW5uZWxUb3BpY05hbWUobmFtZSkge1xuICAgIHJldHVybiAodHlwZW9mIG5hbWUgPT0gJ3N0cmluZycpICYmXG4gICAgICAobmFtZS5zdWJzdHJpbmcoMCwgMykgPT0gQ29uc3QuVE9QSUNfQ0hBTiB8fCBuYW1lLnN1YnN0cmluZygwLCAzKSA9PSBDb25zdC5UT1BJQ19ORVdfQ0hBTik7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIHRvcGljIGlzIHN1YnNjcmliZWQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlzIHRvcGljIGlzIGF0dGFjaGVkL3N1YnNjcmliZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIGlzU3Vic2NyaWJlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXR0YWNoZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCB0b3BpYyB0byBzdWJzY3JpYmUuIFdyYXBwZXIgZm9yIHtAbGluayBUaW5vZGUjc3Vic2NyaWJlfS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtUaW5vZGUuR2V0UXVlcnk9fSBnZXRQYXJhbXMgLSBnZXQgcXVlcnkgcGFyYW1ldGVycy5cbiAgICogQHBhcmFtIHtUaW5vZGUuU2V0UGFyYW1zPX0gc2V0UGFyYW1zIC0gc2V0IHBhcmFtZXRlcnMuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRvIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIHNlcnZlciByZXNwb25kcyB0byB0aGUgcmVxdWVzdC5cbiAgICovXG4gIHN1YnNjcmliZShnZXRQYXJhbXMsIHNldFBhcmFtcykge1xuICAgIC8vIElmIHRoZSB0b3BpYyBpcyBhbHJlYWR5IHN1YnNjcmliZWQsIHJldHVybiByZXNvbHZlZCBwcm9taXNlXG4gICAgaWYgKHRoaXMuX2F0dGFjaGVkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSB0b3BpYyBpcyBkZWxldGVkLCByZWplY3Qgc3Vic2NyaXB0aW9uIHJlcXVlc3RzLlxuICAgIGlmICh0aGlzLl9kZWxldGVkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwiQ29udmVyc2F0aW9uIGRlbGV0ZWRcIikpO1xuICAgIH1cblxuICAgIC8vIFNlbmQgc3Vic2NyaWJlIG1lc3NhZ2UsIGhhbmRsZSBhc3luYyByZXNwb25zZS5cbiAgICAvLyBJZiB0b3BpYyBuYW1lIGlzIGV4cGxpY2l0bHkgcHJvdmlkZWQsIHVzZSBpdC4gSWYgbm8gbmFtZSwgdGhlbiBpdCdzIGEgbmV3IGdyb3VwIHRvcGljLFxuICAgIC8vIHVzZSBcIm5ld1wiLlxuICAgIHJldHVybiB0aGlzLl90aW5vZGUuc3Vic2NyaWJlKHRoaXMubmFtZSB8fCBDb25zdC5UT1BJQ19ORVcsIGdldFBhcmFtcywgc2V0UGFyYW1zKS50aGVuKChjdHJsKSA9PiB7XG4gICAgICBpZiAoY3RybC5jb2RlID49IDMwMCkge1xuICAgICAgICAvLyBEbyBub3RoaW5nIGlmIHN1YnNjcmlwdGlvbiBzdGF0dXMgaGFzIG5vdCBjaGFuZ2VkLlxuICAgICAgICByZXR1cm4gY3RybDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fYXR0YWNoZWQgPSB0cnVlO1xuICAgICAgdGhpcy5fZGVsZXRlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5hY3MgPSAoY3RybC5wYXJhbXMgJiYgY3RybC5wYXJhbXMuYWNzKSA/IGN0cmwucGFyYW1zLmFjcyA6IHRoaXMuYWNzO1xuXG4gICAgICAvLyBTZXQgdG9waWMgbmFtZSBmb3IgbmV3IHRvcGljcyBhbmQgYWRkIGl0IHRvIGNhY2hlLlxuICAgICAgaWYgKHRoaXMuX25ldykge1xuICAgICAgICBkZWxldGUgdGhpcy5fbmV3O1xuXG4gICAgICAgIGlmICh0aGlzLm5hbWUgIT0gY3RybC50b3BpYykge1xuICAgICAgICAgIC8vIE5hbWUgbWF5IGNoYW5nZSBuZXcxMjM0NTYgLT4gZ3JwQWJDZEVmLiBSZW1vdmUgZnJvbSBjYWNoZSB1bmRlciB0aGUgb2xkIG5hbWUuXG4gICAgICAgICAgdGhpcy5fY2FjaGVEZWxTZWxmKCk7XG4gICAgICAgICAgdGhpcy5uYW1lID0gY3RybC50b3BpYztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jYWNoZVB1dFNlbGYoKTtcblxuICAgICAgICB0aGlzLmNyZWF0ZWQgPSBjdHJsLnRzO1xuICAgICAgICB0aGlzLnVwZGF0ZWQgPSBjdHJsLnRzO1xuXG4gICAgICAgIGlmICh0aGlzLm5hbWUgIT0gQ29uc3QuVE9QSUNfTUUgJiYgdGhpcy5uYW1lICE9IENvbnN0LlRPUElDX0ZORCkge1xuICAgICAgICAgIC8vIEFkZCB0aGUgbmV3IHRvcGljIHRvIHRoZSBsaXN0IG9mIGNvbnRhY3RzIG1haW50YWluZWQgYnkgdGhlICdtZScgdG9waWMuXG4gICAgICAgICAgY29uc3QgbWUgPSB0aGlzLl90aW5vZGUuZ2V0TWVUb3BpYygpO1xuICAgICAgICAgIGlmIChtZS5vbk1ldGFTdWIpIHtcbiAgICAgICAgICAgIG1lLm9uTWV0YVN1Yih0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG1lLm9uU3Vic1VwZGF0ZWQpIHtcbiAgICAgICAgICAgIG1lLm9uU3Vic1VwZGF0ZWQoW3RoaXMubmFtZV0sIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXRQYXJhbXMgJiYgc2V0UGFyYW1zLmRlc2MpIHtcbiAgICAgICAgICBzZXRQYXJhbXMuZGVzYy5fbm9Gb3J3YXJkaW5nID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLl9wcm9jZXNzTWV0YURlc2Moc2V0UGFyYW1zLmRlc2MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY3RybDtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBkcmFmdCBvZiBhIG1lc3NhZ2Ugd2l0aG91dCBzZW5kaW5nIGl0IHRvIHRoZSBzZXJ2ZXIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgT2JqZWN0fSBkYXRhIC0gQ29udGVudCB0byB3cmFwIGluIGEgZHJhZnQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG5vRWNobyAtIElmIDxjb2RlPnRydWU8L2NvZGU+IHNlcnZlciB3aWxsIG5vdCBlY2hvIG1lc3NhZ2UgYmFjayB0byBvcmlnaW5hdGluZ1xuICAgKiBzZXNzaW9uLiBPdGhlcndpc2UgdGhlIHNlcnZlciB3aWxsIHNlbmQgYSBjb3B5IG9mIHRoZSBtZXNzYWdlIHRvIHNlbmRlci5cbiAgICpcbiAgICogQHJldHVybnMge09iamVjdH0gbWVzc2FnZSBkcmFmdC5cbiAgICovXG4gIGNyZWF0ZU1lc3NhZ2UoZGF0YSwgbm9FY2hvKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Rpbm9kZS5jcmVhdGVNZXNzYWdlKHRoaXMubmFtZSwgZGF0YSwgbm9FY2hvKTtcbiAgfVxuICAvKipcbiAgICogSW1tZWRpYXRlbHkgcHVibGlzaCBkYXRhIHRvIHRvcGljLiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI3B1Ymxpc2h9LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IE9iamVjdH0gZGF0YSAtIERhdGEgdG8gcHVibGlzaCwgZWl0aGVyIHBsYWluIHN0cmluZyBvciBhIERyYWZ0eSBvYmplY3QuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG5vRWNobyAtIElmIDxjb2RlPnRydWU8L2NvZGU+IHNlcnZlciB3aWxsIG5vdCBlY2hvIG1lc3NhZ2UgYmFjayB0byBvcmlnaW5hdGluZ1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB0byBiZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHRoZSBzZXJ2ZXIgcmVzcG9uZHMgdG8gdGhlIHJlcXVlc3QuXG4gICAqL1xuICBwdWJsaXNoKGRhdGEsIG5vRWNobykge1xuICAgIHJldHVybiB0aGlzLnB1Ymxpc2hNZXNzYWdlKHRoaXMuY3JlYXRlTWVzc2FnZShkYXRhLCBub0VjaG8pKTtcbiAgfVxuICAvKipcbiAgICogUHVibGlzaCBtZXNzYWdlIGNyZWF0ZWQgYnkge0BsaW5rIFRpbm9kZS5Ub3BpYyNjcmVhdGVNZXNzYWdlfS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHB1YiAtIHtkYXRhfSBvYmplY3QgdG8gcHVibGlzaC4gTXVzdCBiZSBjcmVhdGVkIGJ5IHtAbGluayBUaW5vZGUuVG9waWMjY3JlYXRlTWVzc2FnZX1cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgdG8gYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgc2VydmVyIHJlc3BvbmRzIHRvIHRoZSByZXF1ZXN0LlxuICAgKi9cbiAgcHVibGlzaE1lc3NhZ2UocHViKSB7XG4gICAgaWYgKCF0aGlzLl9hdHRhY2hlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIkNhbm5vdCBwdWJsaXNoIG9uIGluYWN0aXZlIHRvcGljXCIpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3NlbmRpbmcpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJUaGUgbWVzc2FnZSBpcyBhbHJlYWR5IGJlaW5nIHNlbnRcIikpO1xuICAgIH1cblxuICAgIC8vIFNlbmQgZGF0YS5cbiAgICBwdWIuX3NlbmRpbmcgPSB0cnVlO1xuICAgIHB1Yi5fZmFpbGVkID0gZmFsc2U7XG5cbiAgICAvLyBFeHRyYWN0IHJlZmVyZWNlcyB0byBhdHRhY2htZW50cyBhbmQgb3V0IG9mIGJhbmQgaW1hZ2UgcmVjb3Jkcy5cbiAgICBsZXQgYXR0YWNobWVudHMgPSBudWxsO1xuICAgIGlmIChEcmFmdHkuaGFzRW50aXRpZXMocHViLmNvbnRlbnQpKSB7XG4gICAgICBhdHRhY2htZW50cyA9IFtdO1xuICAgICAgRHJhZnR5LmVudGl0aWVzKHB1Yi5jb250ZW50LCAoZGF0YSkgPT4ge1xuICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLnJlZikge1xuICAgICAgICAgIGF0dGFjaG1lbnRzLnB1c2goZGF0YS5yZWYpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChhdHRhY2htZW50cy5sZW5ndGggPT0gMCkge1xuICAgICAgICBhdHRhY2htZW50cyA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3Rpbm9kZS5wdWJsaXNoTWVzc2FnZShwdWIsIGF0dGFjaG1lbnRzKS50aGVuKChjdHJsKSA9PiB7XG4gICAgICBwdWIuX3NlbmRpbmcgPSBmYWxzZTtcbiAgICAgIHB1Yi50cyA9IGN0cmwudHM7XG4gICAgICB0aGlzLnN3YXBNZXNzYWdlSWQocHViLCBjdHJsLnBhcmFtcy5zZXEpO1xuICAgICAgdGhpcy5fcm91dGVEYXRhKHB1Yik7XG4gICAgICByZXR1cm4gY3RybDtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICB0aGlzLl90aW5vZGUubG9nZ2VyKFwiV0FSTklORzogTWVzc2FnZSByZWplY3RlZCBieSB0aGUgc2VydmVyXCIsIGVycik7XG4gICAgICBwdWIuX3NlbmRpbmcgPSBmYWxzZTtcbiAgICAgIHB1Yi5fZmFpbGVkID0gdHJ1ZTtcbiAgICAgIGlmICh0aGlzLm9uRGF0YSkge1xuICAgICAgICB0aGlzLm9uRGF0YSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgbWVzc2FnZSB0byBsb2NhbCBtZXNzYWdlIGNhY2hlLCBzZW5kIHRvIHRoZSBzZXJ2ZXIgd2hlbiB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZC5cbiAgICogSWYgcHJvbWlzZSBpcyBudWxsIG9yIHVuZGVmaW5lZCwgdGhlIG1lc3NhZ2Ugd2lsbCBiZSBzZW50IGltbWVkaWF0ZWx5LlxuICAgKiBUaGUgbWVzc2FnZSBpcyBzZW50IHdoZW4gdGhlXG4gICAqIFRoZSBtZXNzYWdlIHNob3VsZCBiZSBjcmVhdGVkIGJ5IHtAbGluayBUaW5vZGUuVG9waWMjY3JlYXRlTWVzc2FnZX0uXG4gICAqIFRoaXMgaXMgcHJvYmFibHkgbm90IHRoZSBmaW5hbCBBUEkuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwdWIgLSBNZXNzYWdlIHRvIHVzZSBhcyBhIGRyYWZ0LlxuICAgKiBAcGFyYW0ge1Byb21pc2V9IHByb20gLSBNZXNzYWdlIHdpbGwgYmUgc2VudCB3aGVuIHRoaXMgcHJvbWlzZSBpcyByZXNvbHZlZCwgZGlzY2FyZGVkIGlmIHJlamVjdGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gZGVyaXZlZCBwcm9taXNlLlxuICAgKi9cbiAgcHVibGlzaERyYWZ0KHB1YiwgcHJvbSkge1xuICAgIGNvbnN0IHNlcSA9IHB1Yi5zZXEgfHwgdGhpcy5fZ2V0UXVldWVkU2VxSWQoKTtcbiAgICBpZiAoIXB1Yi5fbm9Gb3J3YXJkaW5nKSB7XG4gICAgICAvLyBUaGUgJ3NlcScsICd0cycsIGFuZCAnZnJvbScgYXJlIGFkZGVkIHRvIG1pbWljIHtkYXRhfS4gVGhleSBhcmUgcmVtb3ZlZCBsYXRlclxuICAgICAgLy8gYmVmb3JlIHRoZSBtZXNzYWdlIGlzIHNlbnQuXG4gICAgICBwdWIuX25vRm9yd2FyZGluZyA9IHRydWU7XG4gICAgICBwdWIuc2VxID0gc2VxO1xuICAgICAgcHViLnRzID0gbmV3IERhdGUoKTtcbiAgICAgIHB1Yi5mcm9tID0gdGhpcy5fdGlub2RlLmdldEN1cnJlbnRVc2VySUQoKTtcblxuICAgICAgLy8gRG9uJ3QgbmVlZCBhbiBlY2hvIG1lc3NhZ2UgYmVjYXVzZSB0aGUgbWVzc2FnZSBpcyBhZGRlZCB0byBsb2NhbCBjYWNoZSByaWdodCBhd2F5LlxuICAgICAgcHViLm5vZWNobyA9IHRydWU7XG4gICAgICAvLyBBZGQgdG8gY2FjaGUuXG4gICAgICB0aGlzLl9tZXNzYWdlcy5wdXQocHViKTtcbiAgICAgIHRoaXMuX3Rpbm9kZS5fZGIuYWRkTWVzc2FnZShwdWIpO1xuXG4gICAgICBpZiAodGhpcy5vbkRhdGEpIHtcbiAgICAgICAgdGhpcy5vbkRhdGEocHViKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gSWYgcHJvbWlzZSBpcyBwcm92aWRlZCwgc2VuZCB0aGUgcXVldWVkIG1lc3NhZ2Ugd2hlbiBpdCdzIHJlc29sdmVkLlxuICAgIC8vIElmIG5vIHByb21pc2UgaXMgcHJvdmlkZWQsIGNyZWF0ZSBhIHJlc29sdmVkIG9uZSBhbmQgc2VuZCBpbW1lZGlhdGVseS5cbiAgICByZXR1cm4gKHByb20gfHwgUHJvbWlzZS5yZXNvbHZlKCkpXG4gICAgICAudGhlbihfID0+IHtcbiAgICAgICAgaWYgKHB1Yi5fY2FuY2VsbGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvZGU6IDMwMCxcbiAgICAgICAgICAgIHRleHQ6IFwiY2FuY2VsbGVkXCJcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hNZXNzYWdlKHB1Yik7XG4gICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICB0aGlzLl90aW5vZGUubG9nZ2VyKFwiV0FSTklORzogTWVzc2FnZSBkcmFmdCByZWplY3RlZFwiLCBlcnIpO1xuICAgICAgICBwdWIuX3NlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgcHViLl9mYWlsZWQgPSB0cnVlO1xuICAgICAgICAvL3RoaXMuX21lc3NhZ2VzLmRlbEF0KHRoaXMuX21lc3NhZ2VzLmZpbmQocHViKSk7XG4gICAgICAgIC8vdGhpcy5fdGlub2RlLl9kYi5yZW1NZXNzYWdlcyh0aGlzLm5hbWUsIHB1Yi5zZXEpO1xuICAgICAgICBpZiAodGhpcy5vbkRhdGEpIHtcbiAgICAgICAgICB0aGlzLm9uRGF0YSgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJldGhyb3cgdG8gbGV0IGNhbGxlciBrbm93IHRoYXQgdGhlIG9wZXJhdGlvbiBmYWlsZWQuXG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIExlYXZlIHRoZSB0b3BpYywgb3B0aW9uYWxseSB1bnNpYnNjcmliZS4gTGVhdmluZyB0aGUgdG9waWMgbWVhbnMgdGhlIHRvcGljIHdpbGwgc3RvcFxuICAgKiByZWNlaXZpbmcgdXBkYXRlcyBmcm9tIHRoZSBzZXJ2ZXIuIFVuc3Vic2NyaWJpbmcgd2lsbCB0ZXJtaW5hdGUgdXNlcidzIHJlbGF0aW9uc2hpcCB3aXRoIHRoZSB0b3BpYy5cbiAgICogV3JhcHBlciBmb3Ige0BsaW5rIFRpbm9kZSNsZWF2ZX0uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc3ViIC0gSWYgdHJ1ZSwgdW5zdWJzY3JpYmUsIG90aGVyd2lzZSBqdXN0IGxlYXZlLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB0byBiZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHRoZSBzZXJ2ZXIgcmVzcG9uZHMgdG8gdGhlIHJlcXVlc3QuXG4gICAqL1xuICBsZWF2ZSh1bnN1Yikge1xuICAgIC8vIEl0J3MgcG9zc2libGUgdG8gdW5zdWJzY3JpYmUgKHVuc3ViPT10cnVlKSBmcm9tIGluYWN0aXZlIHRvcGljLlxuICAgIGlmICghdGhpcy5fYXR0YWNoZWQgJiYgIXVuc3ViKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwiQ2Fubm90IGxlYXZlIGluYWN0aXZlIHRvcGljXCIpKTtcbiAgICB9XG5cbiAgICAvLyBTZW5kIGEgJ2xlYXZlJyBtZXNzYWdlLCBoYW5kbGUgYXN5bmMgcmVzcG9uc2VcbiAgICByZXR1cm4gdGhpcy5fdGlub2RlLmxlYXZlKHRoaXMubmFtZSwgdW5zdWIpLnRoZW4oKGN0cmwpID0+IHtcbiAgICAgIHRoaXMuX3Jlc2V0U3ViKCk7XG4gICAgICBpZiAodW5zdWIpIHtcbiAgICAgICAgdGhpcy5fZ29uZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN0cmw7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCB0b3BpYyBtZXRhZGF0YSBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7VGlub2RlLkdldFF1ZXJ5fSByZXF1ZXN0IHBhcmFtZXRlcnNcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgdG8gYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgc2VydmVyIHJlc3BvbmRzIHRvIHJlcXVlc3QuXG4gICAqL1xuICBnZXRNZXRhKHBhcmFtcykge1xuICAgIC8vIFNlbmQge2dldH0gbWVzc2FnZSwgcmV0dXJuIHByb21pc2UuXG4gICAgcmV0dXJuIHRoaXMuX3Rpbm9kZS5nZXRNZXRhKHRoaXMubmFtZSwgcGFyYW1zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0IG1vcmUgbWVzc2FnZXMgZnJvbSB0aGUgc2VydmVyXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdCBudW1iZXIgb2YgbWVzc2FnZXMgdG8gZ2V0LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZvcndhcmQgaWYgdHJ1ZSwgcmVxdWVzdCBuZXdlciBtZXNzYWdlcy5cbiAgICovXG4gIGdldE1lc3NhZ2VzUGFnZShsaW1pdCwgZm9yd2FyZCkge1xuICAgIGxldCBxdWVyeSA9IGZvcndhcmQgP1xuICAgICAgdGhpcy5zdGFydE1ldGFRdWVyeSgpLndpdGhMYXRlckRhdGEobGltaXQpIDpcbiAgICAgIHRoaXMuc3RhcnRNZXRhUXVlcnkoKS53aXRoRWFybGllckRhdGEobGltaXQpO1xuXG4gICAgLy8gRmlyc3QgdHJ5IGZldGNoaW5nIGZyb20gREIsIHRoZW4gZnJvbSB0aGUgc2VydmVyLlxuICAgIHJldHVybiB0aGlzLl9sb2FkTWVzc2FnZXModGhpcy5fdGlub2RlLl9kYiwgcXVlcnkuZXh0cmFjdCgnZGF0YScpKVxuICAgICAgLnRoZW4oKGNvdW50KSA9PiB7XG4gICAgICAgIGlmIChjb3VudCA9PSBsaW1pdCkge1xuICAgICAgICAgIC8vIEdvdCBlbm91Z2ggbWVzc2FnZXMgZnJvbSBsb2NhbCBjYWNoZS5cbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgICAgIHRvcGljOiB0aGlzLm5hbWUsXG4gICAgICAgICAgICBjb2RlOiAyMDAsXG4gICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgY291bnQ6IGNvdW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWR1Y2UgdGhlIGNvdW50IG9mIHJlcXVlc3RlZCBtZXNzYWdlcy5cbiAgICAgICAgbGltaXQgLT0gY291bnQ7XG4gICAgICAgIC8vIFVwZGF0ZSBxdWVyeSB3aXRoIG5ldyB2YWx1ZXMgbG9hZGVkIGZyb20gREIuXG4gICAgICAgIHF1ZXJ5ID0gZm9yd2FyZCA/IHRoaXMuc3RhcnRNZXRhUXVlcnkoKS53aXRoTGF0ZXJEYXRhKGxpbWl0KSA6XG4gICAgICAgICAgdGhpcy5zdGFydE1ldGFRdWVyeSgpLndpdGhFYXJsaWVyRGF0YShsaW1pdCk7XG4gICAgICAgIGxldCBwcm9taXNlID0gdGhpcy5nZXRNZXRhKHF1ZXJ5LmJ1aWxkKCkpO1xuICAgICAgICBpZiAoIWZvcndhcmQpIHtcbiAgICAgICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKChjdHJsKSA9PiB7XG4gICAgICAgICAgICBpZiAoY3RybCAmJiBjdHJsLnBhcmFtcyAmJiAhY3RybC5wYXJhbXMuY291bnQpIHtcbiAgICAgICAgICAgICAgdGhpcy5fbm9FYXJsaWVyTXNncyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICB9KTtcbiAgfVxuICAvKipcbiAgICogVXBkYXRlIHRvcGljIG1ldGFkYXRhLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge1Rpbm9kZS5TZXRQYXJhbXN9IHBhcmFtcyBwYXJhbWV0ZXJzIHRvIHVwZGF0ZS5cbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgdG8gYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgc2VydmVyIHJlc3BvbmRzIHRvIHJlcXVlc3QuXG4gICAqL1xuICBzZXRNZXRhKHBhcmFtcykge1xuICAgIGlmIChwYXJhbXMudGFncykge1xuICAgICAgcGFyYW1zLnRhZ3MgPSBub3JtYWxpemVBcnJheShwYXJhbXMudGFncyk7XG4gICAgfVxuICAgIC8vIFNlbmQgU2V0IG1lc3NhZ2UsIGhhbmRsZSBhc3luYyByZXNwb25zZS5cbiAgICByZXR1cm4gdGhpcy5fdGlub2RlLnNldE1ldGEodGhpcy5uYW1lLCBwYXJhbXMpXG4gICAgICAudGhlbigoY3RybCkgPT4ge1xuICAgICAgICBpZiAoY3RybCAmJiBjdHJsLmNvZGUgPj0gMzAwKSB7XG4gICAgICAgICAgLy8gTm90IG1vZGlmaWVkXG4gICAgICAgICAgcmV0dXJuIGN0cmw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLnN1Yikge1xuICAgICAgICAgIHBhcmFtcy5zdWIudG9waWMgPSB0aGlzLm5hbWU7XG4gICAgICAgICAgaWYgKGN0cmwucGFyYW1zICYmIGN0cmwucGFyYW1zLmFjcykge1xuICAgICAgICAgICAgcGFyYW1zLnN1Yi5hY3MgPSBjdHJsLnBhcmFtcy5hY3M7XG4gICAgICAgICAgICBwYXJhbXMuc3ViLnVwZGF0ZWQgPSBjdHJsLnRzO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXBhcmFtcy5zdWIudXNlcikge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBhIHN1YnNjcmlwdGlvbiB1cGRhdGUgb2YgdGhlIGN1cnJlbnQgdXNlci5cbiAgICAgICAgICAgIC8vIEFzc2lnbiB1c2VyIElEIG90aGVyd2lzZSB0aGUgdXBkYXRlIHdpbGwgYmUgaWdub3JlZCBieSBfcHJvY2Vzc01ldGFTdWIuXG4gICAgICAgICAgICBwYXJhbXMuc3ViLnVzZXIgPSB0aGlzLl90aW5vZGUuZ2V0Q3VycmVudFVzZXJJRCgpO1xuICAgICAgICAgICAgaWYgKCFwYXJhbXMuZGVzYykge1xuICAgICAgICAgICAgICAvLyBGb3JjZSB1cGRhdGUgdG8gdG9waWMncyBhc2MuXG4gICAgICAgICAgICAgIHBhcmFtcy5kZXNjID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhcmFtcy5zdWIuX25vRm9yd2FyZGluZyA9IHRydWU7XG4gICAgICAgICAgdGhpcy5fcHJvY2Vzc01ldGFTdWIoW3BhcmFtcy5zdWJdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMuZGVzYykge1xuICAgICAgICAgIGlmIChjdHJsLnBhcmFtcyAmJiBjdHJsLnBhcmFtcy5hY3MpIHtcbiAgICAgICAgICAgIHBhcmFtcy5kZXNjLmFjcyA9IGN0cmwucGFyYW1zLmFjcztcbiAgICAgICAgICAgIHBhcmFtcy5kZXNjLnVwZGF0ZWQgPSBjdHJsLnRzO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9wcm9jZXNzTWV0YURlc2MocGFyYW1zLmRlc2MpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy50YWdzKSB7XG4gICAgICAgICAgdGhpcy5fcHJvY2Vzc01ldGFUYWdzKHBhcmFtcy50YWdzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyYW1zLmNyZWQpIHtcbiAgICAgICAgICB0aGlzLl9wcm9jZXNzTWV0YUNyZWRzKFtwYXJhbXMuY3JlZF0sIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGN0cmw7XG4gICAgICB9KTtcbiAgfVxuICAvKipcbiAgICogVXBkYXRlIGFjY2VzcyBtb2RlIG9mIHRoZSBjdXJyZW50IHVzZXIgb3Igb2YgYW5vdGhlciB0b3BpYyBzdWJzcmliZXIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1aWQgLSBVSUQgb2YgdGhlIHVzZXIgdG8gdXBkYXRlIG9yIG51bGwgdG8gdXBkYXRlIGN1cnJlbnQgdXNlci5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVwZGF0ZSAtIHRoZSB1cGRhdGUgdmFsdWUsIGZ1bGwgb3IgZGVsdGEuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRvIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIHNlcnZlciByZXNwb25kcyB0byByZXF1ZXN0LlxuICAgKi9cbiAgdXBkYXRlTW9kZSh1aWQsIHVwZGF0ZSkge1xuICAgIGNvbnN0IHVzZXIgPSB1aWQgPyB0aGlzLnN1YnNjcmliZXIodWlkKSA6IG51bGw7XG4gICAgY29uc3QgYW0gPSB1c2VyID9cbiAgICAgIHVzZXIuYWNzLnVwZGF0ZUdpdmVuKHVwZGF0ZSkuZ2V0R2l2ZW4oKSA6XG4gICAgICB0aGlzLmdldEFjY2Vzc01vZGUoKS51cGRhdGVXYW50KHVwZGF0ZSkuZ2V0V2FudCgpO1xuXG4gICAgcmV0dXJuIHRoaXMuc2V0TWV0YSh7XG4gICAgICBzdWI6IHtcbiAgICAgICAgdXNlcjogdWlkLFxuICAgICAgICBtb2RlOiBhbVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBDcmVhdGUgbmV3IHRvcGljIHN1YnNjcmlwdGlvbi4gV3JhcHBlciBmb3Ige0BsaW5rIFRpbm9kZSNzZXRNZXRhfS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVpZCAtIElEIG9mIHRoZSB1c2VyIHRvIGludml0ZVxuICAgKiBAcGFyYW0ge3N0cmluZz19IG1vZGUgLSBBY2Nlc3MgbW9kZS4gPGNvZGU+bnVsbDwvY29kZT4gbWVhbnMgdG8gdXNlIGRlZmF1bHQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRvIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIHNlcnZlciByZXNwb25kcyB0byByZXF1ZXN0LlxuICAgKi9cbiAgaW52aXRlKHVpZCwgbW9kZSkge1xuICAgIHJldHVybiB0aGlzLnNldE1ldGEoe1xuICAgICAgc3ViOiB7XG4gICAgICAgIHVzZXI6IHVpZCxcbiAgICAgICAgbW9kZTogbW9kZVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBBcmNoaXZlIG9yIHVuLWFyY2hpdmUgdGhlIHRvcGljLiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI3NldE1ldGF9LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFyY2ggLSB0cnVlIHRvIGFyY2hpdmUgdGhlIHRvcGljLCBmYWxzZSBvdGhlcndpc2UuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRvIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIHNlcnZlciByZXNwb25kcyB0byByZXF1ZXN0LlxuICAgKi9cbiAgYXJjaGl2ZShhcmNoKSB7XG4gICAgaWYgKHRoaXMucHJpdmF0ZSAmJiAoIXRoaXMucHJpdmF0ZS5hcmNoID09ICFhcmNoKSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhcmNoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2V0TWV0YSh7XG4gICAgICBkZXNjOiB7XG4gICAgICAgIHByaXZhdGU6IHtcbiAgICAgICAgICBhcmNoOiBhcmNoID8gdHJ1ZSA6IENvbnN0LkRFTF9DSEFSXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICogRGVsZXRlIG1lc3NhZ2VzLiBIYXJkLWRlbGV0aW5nIG1lc3NhZ2VzIHJlcXVpcmVzIE93bmVyIHBlcm1pc3Npb24uXG4gICAqIFdyYXBwZXIgZm9yIHtAbGluayBUaW5vZGUjZGVsTWVzc2FnZXN9LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge1Rpbm9kZS5EZWxSYW5nZVtdfSByYW5nZXMgLSBSYW5nZXMgb2YgbWVzc2FnZSBJRHMgdG8gZGVsZXRlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBoYXJkIC0gSGFyZCBvciBzb2Z0IGRlbGV0ZVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB0byBiZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHRoZSBzZXJ2ZXIgcmVzcG9uZHMgdG8gcmVxdWVzdC5cbiAgICovXG4gIGRlbE1lc3NhZ2VzKHJhbmdlcywgaGFyZCkge1xuICAgIGlmICghdGhpcy5fYXR0YWNoZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJDYW5ub3QgZGVsZXRlIG1lc3NhZ2VzIGluIGluYWN0aXZlIHRvcGljXCIpKTtcbiAgICB9XG5cbiAgICAvLyBTb3J0IHJhbmdlcyBpbiBhY2NlbmRpbmcgb3JkZXIgYnkgbG93LCB0aGUgZGVzY2VuZGluZyBieSBoaS5cbiAgICByYW5nZXMuc29ydCgocjEsIHIyKSA9PiB7XG4gICAgICBpZiAocjEubG93IDwgcjIubG93KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHIxLmxvdyA9PSByMi5sb3cpIHtcbiAgICAgICAgcmV0dXJuICFyMi5oaSB8fCAocjEuaGkgPj0gcjIuaGkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgLy8gUmVtb3ZlIHBlbmRpbmcgbWVzc2FnZXMgZnJvbSByYW5nZXMgcG9zc2libHkgY2xpcHBpbmcgc29tZSByYW5nZXMuXG4gICAgbGV0IHRvc2VuZCA9IHJhbmdlcy5yZWR1Y2UoKG91dCwgcikgPT4ge1xuICAgICAgaWYgKHIubG93IDwgQ29uc3QuTE9DQUxfU0VRSUQpIHtcbiAgICAgICAgaWYgKCFyLmhpIHx8IHIuaGkgPCBDb25zdC5MT0NBTF9TRVFJRCkge1xuICAgICAgICAgIG91dC5wdXNoKHIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENsaXAgaGkgdG8gbWF4IGFsbG93ZWQgdmFsdWUuXG4gICAgICAgICAgb3V0LnB1c2goe1xuICAgICAgICAgICAgbG93OiByLmxvdyxcbiAgICAgICAgICAgIGhpOiB0aGlzLl9tYXhTZXEgKyAxXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfSwgW10pO1xuXG4gICAgLy8gU2VuZCB7ZGVsfSBtZXNzYWdlLCByZXR1cm4gcHJvbWlzZVxuICAgIGxldCByZXN1bHQ7XG4gICAgaWYgKHRvc2VuZC5sZW5ndGggPiAwKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl90aW5vZGUuZGVsTWVzc2FnZXModGhpcy5uYW1lLCB0b3NlbmQsIGhhcmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSBQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBkZWw6IDBcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFVwZGF0ZSBsb2NhbCBjYWNoZS5cbiAgICByZXR1cm4gcmVzdWx0LnRoZW4oKGN0cmwpID0+IHtcbiAgICAgIGlmIChjdHJsLnBhcmFtcy5kZWwgPiB0aGlzLl9tYXhEZWwpIHtcbiAgICAgICAgdGhpcy5fbWF4RGVsID0gY3RybC5wYXJhbXMuZGVsO1xuICAgICAgfVxuXG4gICAgICByYW5nZXMuZm9yRWFjaCgocikgPT4ge1xuICAgICAgICBpZiAoci5oaSkge1xuICAgICAgICAgIHRoaXMuZmx1c2hNZXNzYWdlUmFuZ2Uoci5sb3csIHIuaGkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZmx1c2hNZXNzYWdlKHIubG93KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX3VwZGF0ZURlbGV0ZWRSYW5nZXMoKTtcblxuICAgICAgaWYgKHRoaXMub25EYXRhKSB7XG4gICAgICAgIC8vIENhbGxpbmcgd2l0aCBubyBwYXJhbWV0ZXJzIHRvIGluZGljYXRlIHRoZSBtZXNzYWdlcyB3ZXJlIGRlbGV0ZWQuXG4gICAgICAgIHRoaXMub25EYXRhKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY3RybDtcbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICogRGVsZXRlIGFsbCBtZXNzYWdlcy4gSGFyZC1kZWxldGluZyBtZXNzYWdlcyByZXF1aXJlcyBPd25lciBwZXJtaXNzaW9uLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGhhcmREZWwgLSB0cnVlIGlmIG1lc3NhZ2VzIHNob3VsZCBiZSBoYXJkLWRlbGV0ZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRvIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIHNlcnZlciByZXNwb25kcyB0byByZXF1ZXN0LlxuICAgKi9cbiAgZGVsTWVzc2FnZXNBbGwoaGFyZERlbCkge1xuICAgIGlmICghdGhpcy5fbWF4U2VxIHx8IHRoaXMuX21heFNlcSA8PSAwKSB7XG4gICAgICAvLyBUaGVyZSBhcmUgbm8gbWVzc2FnZXMgdG8gZGVsZXRlLlxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5kZWxNZXNzYWdlcyhbe1xuICAgICAgbG93OiAxLFxuICAgICAgaGk6IHRoaXMuX21heFNlcSArIDEsXG4gICAgICBfYWxsOiB0cnVlXG4gICAgfV0sIGhhcmREZWwpO1xuICB9XG4gIC8qKlxuICAgKiBEZWxldGUgbXVsdGlwbGUgbWVzc2FnZXMgZGVmaW5lZCBieSB0aGVpciBJRHMuIEhhcmQtZGVsZXRpbmcgbWVzc2FnZXMgcmVxdWlyZXMgT3duZXIgcGVybWlzc2lvbi5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtUaW5vZGUuRGVsUmFuZ2VbXX0gbGlzdCAtIGxpc3Qgb2Ygc2VxIElEcyB0byBkZWxldGVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gaGFyZERlbCAtIHRydWUgaWYgbWVzc2FnZXMgc2hvdWxkIGJlIGhhcmQtZGVsZXRlZC5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgdG8gYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgc2VydmVyIHJlc3BvbmRzIHRvIHJlcXVlc3QuXG4gICAqL1xuICBkZWxNZXNzYWdlc0xpc3QobGlzdCwgaGFyZERlbCkge1xuICAgIC8vIFNvcnQgdGhlIGxpc3QgaW4gYXNjZW5kaW5nIG9yZGVyXG4gICAgbGlzdC5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgLy8gQ29udmVydCB0aGUgYXJyYXkgb2YgSURzIHRvIHJhbmdlcy5cbiAgICBsZXQgcmFuZ2VzID0gbGlzdC5yZWR1Y2UoKG91dCwgaWQpID0+IHtcbiAgICAgIGlmIChvdXQubGVuZ3RoID09IDApIHtcbiAgICAgICAgLy8gRmlyc3QgZWxlbWVudC5cbiAgICAgICAgb3V0LnB1c2goe1xuICAgICAgICAgIGxvdzogaWRcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgcHJldiA9IG91dFtvdXQubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICgoIXByZXYuaGkgJiYgKGlkICE9IHByZXYubG93ICsgMSkpIHx8IChpZCA+IHByZXYuaGkpKSB7XG4gICAgICAgICAgLy8gTmV3IHJhbmdlLlxuICAgICAgICAgIG91dC5wdXNoKHtcbiAgICAgICAgICAgIGxvdzogaWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBFeHBhbmQgZXhpc3RpbmcgcmFuZ2UuXG4gICAgICAgICAgcHJldi5oaSA9IHByZXYuaGkgPyBNYXRoLm1heChwcmV2LmhpLCBpZCArIDEpIDogaWQgKyAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH0sIFtdKTtcbiAgICAvLyBTZW5kIHtkZWx9IG1lc3NhZ2UsIHJldHVybiBwcm9taXNlXG4gICAgcmV0dXJuIHRoaXMuZGVsTWVzc2FnZXMocmFuZ2VzLCBoYXJkRGVsKTtcbiAgfVxuICAvKipcbiAgICogRGVsZXRlIHRvcGljLiBSZXF1aXJlcyBPd25lciBwZXJtaXNzaW9uLiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI2RlbFRvcGljfS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBoYXJkIC0gaGFkLWRlbGV0ZSB0b3BpYy5cbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgdG8gYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgc2VydmVyIHJlc3BvbmRzIHRvIHRoZSByZXF1ZXN0LlxuICAgKi9cbiAgZGVsVG9waWMoaGFyZCkge1xuICAgIGlmICh0aGlzLl9kZWxldGVkKSB7XG4gICAgICAvLyBUaGUgdG9waWMgaXMgYWxyZWFkeSBkZWxldGVkIGF0IHRoZSBzZXJ2ZXIsIGp1c3QgcmVtb3ZlIGZyb20gREIuXG4gICAgICB0aGlzLl9nb25lKCk7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fdGlub2RlLmRlbFRvcGljKHRoaXMubmFtZSwgaGFyZCkudGhlbigoY3RybCkgPT4ge1xuICAgICAgdGhpcy5fcmVzZXRTdWIoKTtcbiAgICAgIHRoaXMuX2dvbmUoKTtcbiAgICAgIHJldHVybiBjdHJsO1xuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBEZWxldGUgc3Vic2NyaXB0aW9uLiBSZXF1aXJlcyBTaGFyZSBwZXJtaXNzaW9uLiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI2RlbFN1YnNjcmlwdGlvbn0uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1c2VyIC0gSUQgb2YgdGhlIHVzZXIgdG8gcmVtb3ZlIHN1YnNjcmlwdGlvbiBmb3IuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRvIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIHNlcnZlciByZXNwb25kcyB0byByZXF1ZXN0LlxuICAgKi9cbiAgZGVsU3Vic2NyaXB0aW9uKHVzZXIpIHtcbiAgICBpZiAoIXRoaXMuX2F0dGFjaGVkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwiQ2Fubm90IGRlbGV0ZSBzdWJzY3JpcHRpb24gaW4gaW5hY3RpdmUgdG9waWNcIikpO1xuICAgIH1cbiAgICAvLyBTZW5kIHtkZWx9IG1lc3NhZ2UsIHJldHVybiBwcm9taXNlXG4gICAgcmV0dXJuIHRoaXMuX3Rpbm9kZS5kZWxTdWJzY3JpcHRpb24odGhpcy5uYW1lLCB1c2VyKS50aGVuKChjdHJsKSA9PiB7XG4gICAgICAvLyBSZW1vdmUgdGhlIG9iamVjdCBmcm9tIHRoZSBzdWJzY3JpcHRpb24gY2FjaGU7XG4gICAgICBkZWxldGUgdGhpcy5fdXNlcnNbdXNlcl07XG4gICAgICAvLyBOb3RpZnkgbGlzdGVuZXJzXG4gICAgICBpZiAodGhpcy5vblN1YnNVcGRhdGVkKSB7XG4gICAgICAgIHRoaXMub25TdWJzVXBkYXRlZChPYmplY3Qua2V5cyh0aGlzLl91c2VycykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN0cmw7XG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIFNlbmQgYSByZWFkL3JlY3Ygbm90aWZpY2F0aW9uLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gd2hhdCAtIHdoYXQgbm90aWZpY2F0aW9uIHRvIHNlbmQ6IDxjb2RlPnJlY3Y8L2NvZGU+LCA8Y29kZT5yZWFkPC9jb2RlPi5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcSAtIElEIG9yIHRoZSBtZXNzYWdlIHJlYWQgb3IgcmVjZWl2ZWQuXG4gICAqL1xuICBub3RlKHdoYXQsIHNlcSkge1xuICAgIGlmICghdGhpcy5fYXR0YWNoZWQpIHtcbiAgICAgIC8vIENhbm5vdCBzZW5kaW5nIHtub3RlfSBvbiBhbiBpbmFjdGl2ZSB0b3BpY1wiLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBsb2NhbCBjYWNoZSB3aXRoIHRoZSBuZXcgY291bnQuXG4gICAgY29uc3QgdXNlciA9IHRoaXMuX3VzZXJzW3RoaXMuX3Rpbm9kZS5nZXRDdXJyZW50VXNlcklEKCldO1xuICAgIGxldCB1cGRhdGUgPSBmYWxzZTtcbiAgICBpZiAodXNlcikge1xuICAgICAgLy8gU2VsZi1zdWJzY3JpcHRpb24gaXMgZm91bmQuXG4gICAgICBpZiAoIXVzZXJbd2hhdF0gfHwgdXNlclt3aGF0XSA8IHNlcSkge1xuICAgICAgICB1c2VyW3doYXRdID0gc2VxO1xuICAgICAgICB1cGRhdGUgPSB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTZWxmLXN1YnNjcmlwdGlvbiBpcyBub3QgZm91bmQuXG4gICAgICB1cGRhdGUgPSAodGhpc1t3aGF0XSB8IDApIDwgc2VxO1xuICAgIH1cblxuICAgIGlmICh1cGRhdGUpIHtcbiAgICAgIC8vIFNlbmQgbm90aWZpY2F0aW9uIHRvIHRoZSBzZXJ2ZXIuXG4gICAgICB0aGlzLl90aW5vZGUubm90ZSh0aGlzLm5hbWUsIHdoYXQsIHNlcSk7XG4gICAgICAvLyBVcGRhdGUgbG9jYWxseSBjYWNoZWQgY29udGFjdCB3aXRoIHRoZSBuZXcgY291bnQuXG4gICAgICB0aGlzLl91cGRhdGVSZWFkUmVjdih3aGF0LCBzZXEpO1xuXG4gICAgICBpZiAodGhpcy5hY3MgIT0gbnVsbCAmJiAhdGhpcy5hY3MuaXNNdXRlZCgpKSB7XG4gICAgICAgIGNvbnN0IG1lID0gdGhpcy5fdGlub2RlLmdldE1lVG9waWMoKTtcbiAgICAgICAgLy8gU2VudCBhIG5vdGlmaWNhdGlvbiB0byAnbWUnIGxpc3RlbmVycy5cbiAgICAgICAgbWUuX3JlZnJlc2hDb250YWN0KHdoYXQsIHRoaXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvKipcbiAgICogU2VuZCBhICdyZWN2JyByZWNlaXB0LiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI25vdGVSZWN2fS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcSAtIElEIG9mIHRoZSBtZXNzYWdlIHRvIGFrbm93bGVkZ2UuXG4gICAqL1xuICBub3RlUmVjdihzZXEpIHtcbiAgICB0aGlzLm5vdGUoJ3JlY3YnLCBzZXEpO1xuICB9XG4gIC8qKlxuICAgKiBTZW5kIGEgJ3JlYWQnIHJlY2VpcHQuIFdyYXBwZXIgZm9yIHtAbGluayBUaW5vZGUjbm90ZVJlYWR9LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gc2VxIC0gSUQgb2YgdGhlIG1lc3NhZ2UgdG8gYWtub3dsZWRnZSBvciAwL3VuZGVmaW5lZCB0byBhY2tub3dsZWRnZSB0aGUgbGF0ZXN0IG1lc3NhZ2VzLlxuICAgKi9cbiAgbm90ZVJlYWQoc2VxKSB7XG4gICAgc2VxID0gc2VxIHx8IHRoaXMuX21heFNlcTtcbiAgICBpZiAoc2VxID4gMCkge1xuICAgICAgdGhpcy5ub3RlKCdyZWFkJywgc2VxKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIFNlbmQgYSBrZXktcHJlc3Mgbm90aWZpY2F0aW9uLiBXcmFwcGVyIGZvciB7QGxpbmsgVGlub2RlI25vdGVLZXlQcmVzc30uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqL1xuICBub3RlS2V5UHJlc3MoKSB7XG4gICAgaWYgKHRoaXMuX2F0dGFjaGVkKSB7XG4gICAgICB0aGlzLl90aW5vZGUubm90ZUtleVByZXNzKHRoaXMubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Rpbm9kZS5sb2dnZXIoXCJJTkZPOiBDYW5ub3Qgc2VuZCBub3RpZmljYXRpb24gaW4gaW5hY3RpdmUgdG9waWNcIik7XG4gICAgfVxuICB9XG4gIC8vIFVwZGF0ZSBjYWNoZWQgcmVhZC9yZWN2L3VucmVhZCBjb3VudHMuXG4gIF91cGRhdGVSZWFkUmVjdih3aGF0LCBzZXEsIHRzKSB7XG4gICAgbGV0IG9sZFZhbCwgZG9VcGRhdGUgPSBmYWxzZTtcblxuICAgIHNlcSA9IHNlcSB8IDA7XG4gICAgdGhpcy5zZXEgPSB0aGlzLnNlcSB8IDA7XG4gICAgdGhpcy5yZWFkID0gdGhpcy5yZWFkIHwgMDtcbiAgICB0aGlzLnJlY3YgPSB0aGlzLnJlY3YgfCAwO1xuICAgIHN3aXRjaCAod2hhdCkge1xuICAgICAgY2FzZSAncmVjdic6XG4gICAgICAgIG9sZFZhbCA9IHRoaXMucmVjdjtcbiAgICAgICAgdGhpcy5yZWN2ID0gTWF0aC5tYXgodGhpcy5yZWN2LCBzZXEpO1xuICAgICAgICBkb1VwZGF0ZSA9IChvbGRWYWwgIT0gdGhpcy5yZWN2KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdyZWFkJzpcbiAgICAgICAgb2xkVmFsID0gdGhpcy5yZWFkO1xuICAgICAgICB0aGlzLnJlYWQgPSBNYXRoLm1heCh0aGlzLnJlYWQsIHNlcSk7XG4gICAgICAgIGRvVXBkYXRlID0gKG9sZFZhbCAhPSB0aGlzLnJlYWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ21zZyc6XG4gICAgICAgIG9sZFZhbCA9IHRoaXMuc2VxO1xuICAgICAgICB0aGlzLnNlcSA9IE1hdGgubWF4KHRoaXMuc2VxLCBzZXEpO1xuICAgICAgICBpZiAoIXRoaXMudG91Y2hlZCB8fCB0aGlzLnRvdWNoZWQgPCB0cykge1xuICAgICAgICAgIHRoaXMudG91Y2hlZCA9IHRzO1xuICAgICAgICB9XG4gICAgICAgIGRvVXBkYXRlID0gKG9sZFZhbCAhPSB0aGlzLnNlcSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIFNhbml0eSBjaGVja3MuXG4gICAgaWYgKHRoaXMucmVjdiA8IHRoaXMucmVhZCkge1xuICAgICAgdGhpcy5yZWN2ID0gdGhpcy5yZWFkO1xuICAgICAgZG9VcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAodGhpcy5zZXEgPCB0aGlzLnJlY3YpIHtcbiAgICAgIHRoaXMuc2VxID0gdGhpcy5yZWN2O1xuICAgICAgaWYgKCF0aGlzLnRvdWNoZWQgfHwgdGhpcy50b3VjaGVkIDwgdHMpIHtcbiAgICAgICAgdGhpcy50b3VjaGVkID0gdHM7XG4gICAgICB9XG4gICAgICBkb1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMudW5yZWFkID0gdGhpcy5zZXEgLSB0aGlzLnJlYWQ7XG4gICAgcmV0dXJuIGRvVXBkYXRlO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgdXNlciBkZXNjcmlwdGlvbiBmcm9tIGdsb2JhbCBjYWNoZS4gVGhlIHVzZXIgZG9lcyBub3QgbmVlZCB0byBiZSBhXG4gICAqIHN1YnNjcmliZXIgb2YgdGhpcyB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVpZCAtIElEIG9mIHRoZSB1c2VyIHRvIGZldGNoLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHVzZXIgZGVzY3JpcHRpb24gb3IgdW5kZWZpbmVkLlxuICAgKi9cbiAgdXNlckRlc2ModWlkKSB7XG4gICAgLy8gVE9ETzogaGFuZGxlIGFzeW5jaHJvbm91cyByZXF1ZXN0c1xuICAgIGNvbnN0IHVzZXIgPSB0aGlzLl9jYWNoZUdldFVzZXIodWlkKTtcbiAgICBpZiAodXNlcikge1xuICAgICAgcmV0dXJuIHVzZXI7IC8vIFByb21pc2UucmVzb2x2ZSh1c2VyKVxuICAgIH1cbiAgfVxuICAvKipcbiAgICogR2V0IGRlc2NyaXB0aW9uIG9mIHRoZSBwMnAgcGVlciBmcm9tIHN1YnNjcmlwdGlvbiBjYWNoZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSBwZWVyJ3MgZGVzY3JpcHRpb24gb3IgdW5kZWZpbmVkLlxuICAgKi9cbiAgcDJwUGVlckRlc2MoKSB7XG4gICAgaWYgKCF0aGlzLmlzUDJQVHlwZSgpKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fdXNlcnNbdGhpcy5uYW1lXTtcbiAgfVxuICAvKipcbiAgICogSXRlcmF0ZSBvdmVyIGNhY2hlZCBzdWJzY3JpYmVycy4gSWYgY2FsbGJhY2sgaXMgdW5kZWZpbmVkLCB1c2UgdGhpcy5vbk1ldGFTdWIuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGJhY2sgd2hpY2ggd2lsbCByZWNlaXZlIHN1YnNjcmliZXJzIG9uZSBieSBvbmUuXG4gICAqIEBwYXJhbSB7T2JqZWN0PX0gY29udGV4dCAtIFZhbHVlIG9mIGB0aGlzYCBpbnNpZGUgdGhlIGBjYWxsYmFja2AuXG4gICAqL1xuICBzdWJzY3JpYmVycyhjYWxsYmFjaywgY29udGV4dCkge1xuICAgIGNvbnN0IGNiID0gKGNhbGxiYWNrIHx8IHRoaXMub25NZXRhU3ViKTtcbiAgICBpZiAoY2IpIHtcbiAgICAgIGZvciAobGV0IGlkeCBpbiB0aGlzLl91c2Vycykge1xuICAgICAgICBjYi5jYWxsKGNvbnRleHQsIHRoaXMuX3VzZXJzW2lkeF0sIGlkeCwgdGhpcy5fdXNlcnMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvKipcbiAgICogR2V0IGEgY29weSBvZiBjYWNoZWQgdGFncy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybiB7QXJyYXkuPHN0cmluZz59IGEgY29weSBvZiB0YWdzXG4gICAqL1xuICB0YWdzKCkge1xuICAgIC8vIFJldHVybiBhIGNvcHkuXG4gICAgcmV0dXJuIHRoaXMuX3RhZ3Muc2xpY2UoMCk7XG4gIH1cbiAgLyoqXG4gICAqIEdldCBjYWNoZWQgc3Vic2NyaXB0aW9uIGZvciB0aGUgZ2l2ZW4gdXNlciBJRC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVpZCAtIGlkIG9mIHRoZSB1c2VyIHRvIHF1ZXJ5IGZvclxuICAgKiBAcmV0dXJuIHVzZXIgZGVzY3JpcHRpb24gb3IgdW5kZWZpbmVkLlxuICAgKi9cbiAgc3Vic2NyaWJlcih1aWQpIHtcbiAgICByZXR1cm4gdGhpcy5fdXNlcnNbdWlkXTtcbiAgfVxuICAvKipcbiAgICogSXRlcmF0ZSBvdmVyIGNhY2hlZCBtZXNzYWdlczogY2FsbCA8Y29kZT5jYWxsYmFjazwvY29kZT4gZm9yIGVhY2ggbWVzc2FnZSBpbiB0aGUgcmFuZ2UgW3NpbmRlSWR4LCBiZWZvcmVJZHgpLlxuICAgKiBJZiA8Y29kZT5jYWxsYmFjazwvY29kZT4gaXMgdW5kZWZpbmVkLCB1c2UgPGNvZGU+dGhpcy5vbkRhdGE8L2NvZGU+LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge1Rpbm9kZS5Gb3JFYWNoQ2FsbGJhY2tUeXBlfSBjYWxsYmFjayAtIENhbGxiYWNrIHdoaWNoIHdpbGwgcmVjZWl2ZSBtZXNzYWdlcyBvbmUgYnkgb25lLiBTZWUge0BsaW5rIFRpbm9kZS5DQnVmZmVyI2ZvckVhY2h9XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzaW5jZUlkIC0gT3B0aW9uYWwgc2VxSWQgdG8gc3RhcnQgaXRlcmF0aW5nIGZyb20gKGluY2x1c2l2ZSkuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiZWZvcmVJZCAtIE9wdGlvbmFsIHNlcUlkIHRvIHN0b3AgaXRlcmF0aW5nIGJlZm9yZSBpdCBpcyByZWFjaGVkIChleGNsdXNpdmUpLlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIFZhbHVlIG9mIGB0aGlzYCBpbnNpZGUgdGhlIGBjYWxsYmFja2AuXG4gICAqL1xuICBtZXNzYWdlcyhjYWxsYmFjaywgc2luY2VJZCwgYmVmb3JlSWQsIGNvbnRleHQpIHtcbiAgICBjb25zdCBjYiA9IChjYWxsYmFjayB8fCB0aGlzLm9uRGF0YSk7XG4gICAgaWYgKGNiKSB7XG4gICAgICBjb25zdCBzdGFydElkeCA9IHR5cGVvZiBzaW5jZUlkID09ICdudW1iZXInID8gdGhpcy5fbWVzc2FnZXMuZmluZCh7XG4gICAgICAgIHNlcTogc2luY2VJZFxuICAgICAgfSwgdHJ1ZSkgOiB1bmRlZmluZWQ7XG4gICAgICBjb25zdCBiZWZvcmVJZHggPSB0eXBlb2YgYmVmb3JlSWQgPT0gJ251bWJlcicgPyB0aGlzLl9tZXNzYWdlcy5maW5kKHtcbiAgICAgICAgc2VxOiBiZWZvcmVJZFxuICAgICAgfSwgdHJ1ZSkgOiB1bmRlZmluZWQ7XG4gICAgICBpZiAoc3RhcnRJZHggIT0gLTEgJiYgYmVmb3JlSWR4ICE9IC0xKSB7XG4gICAgICAgIHRoaXMuX21lc3NhZ2VzLmZvckVhY2goY2IsIHN0YXJ0SWR4LCBiZWZvcmVJZHgsIGNvbnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvKipcbiAgICogR2V0IHRoZSBtZXNzYWdlIGZyb20gY2FjaGUgYnkgPGNvZGU+c2VxPC9jb2RlPi5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcSAtIG1lc3NhZ2Ugc2VxSWQgdG8gc2VhcmNoIGZvci5cbiAgICogQHJldHVybnMge09iamVjdH0gdGhlIG1lc3NhZ2Ugd2l0aCB0aGUgZ2l2ZW4gPGNvZGU+c2VxPC9jb2RlPiBvciA8Y29kZT51bmRlZmluZWQ8L2NvZGU+LCBpZiBubyBzdWNoIG1lc3NhZ2UgaXMgZm91bmQuXG4gICAqL1xuICBmaW5kTWVzc2FnZShzZXEpIHtcbiAgICBjb25zdCBpZHggPSB0aGlzLl9tZXNzYWdlcy5maW5kKHtcbiAgICAgIHNlcTogc2VxXG4gICAgfSk7XG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXMuZ2V0QXQoaWR4KTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICAvKipcbiAgICogR2V0IHRoZSBtb3N0IHJlY2VudCBtZXNzYWdlIGZyb20gY2FjaGUuIFRoaXMgbWV0aG9kIGNvdW50cyBhbGwgbWVzc2FnZXMsIGluY2x1ZGluZyBkZWxldGVkIHJhbmdlcy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtib29sZW59IHNraXBEZWxldGVkIC0gaWYgdGhlIGxhc3QgbWVzc2FnZSBpcyBhIGRlbGV0ZWQgcmFuZ2UsIGdldCB0aGUgb25lIGJlZm9yZSBpdC5cbiAgICogQHJldHVybnMge09iamVjdH0gdGhlIG1vc3QgcmVjZW50IGNhY2hlZCBtZXNzYWdlIG9yIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4sIGlmIG5vIG1lc3NhZ2VzIGFyZSBjYWNoZWQuXG4gICAqL1xuICBsYXRlc3RNZXNzYWdlKHNraXBEZWxldGVkKSB7XG4gICAgY29uc3QgbXNnID0gdGhpcy5fbWVzc2FnZXMuZ2V0TGFzdCgpO1xuICAgIGlmICghc2tpcERlbGV0ZWQgfHwgIW1zZyB8fCBtc2cuX3N0YXR1cyAhPSBDb25zdC5NRVNTQUdFX1NUQVRVU19ERUxfUkFOR0UpIHtcbiAgICAgIHJldHVybiBtc2c7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9tZXNzYWdlcy5nZXRMYXN0KDEpO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgdGhlIG1heGltdW0gY2FjaGVkIHNlcSBJRC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn0gdGhlIGdyZWF0ZXN0IHNlcSBJRCBpbiBjYWNoZS5cbiAgICovXG4gIG1heE1zZ1NlcSgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4U2VxO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgdGhlIG1heGltdW0gZGVsZXRpb24gSUQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBncmVhdGVzdCBkZWxldGlvbiBJRC5cbiAgICovXG4gIG1heENsZWFySWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21heERlbDtcbiAgfVxuICAvKipcbiAgICogR2V0IHRoZSBudW1iZXIgb2YgbWVzc2FnZXMgaW4gdGhlIGNhY2hlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBjb3VudCBvZiBjYWNoZWQgbWVzc2FnZXMuXG4gICAqL1xuICBtZXNzYWdlQ291bnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzLmxlbmd0aCgpO1xuICB9XG4gIC8qKlxuICAgKiBJdGVyYXRlIG92ZXIgY2FjaGVkIHVuc2VudCBtZXNzYWdlcy4gV3JhcHMge0BsaW5rIFRpbm9kZS5Ub3BpYyNtZXNzYWdlc30uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGJhY2sgd2hpY2ggd2lsbCByZWNlaXZlIG1lc3NhZ2VzIG9uZSBieSBvbmUuIFNlZSB7QGxpbmsgVGlub2RlLkNCdWZmZXIjZm9yRWFjaH1cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSBWYWx1ZSBvZiA8Y29kZT50aGlzPC9jb2RlPiBpbnNpZGUgdGhlIDxjb2RlPmNhbGxiYWNrPC9jb2RlPi5cbiAgICovXG4gIHF1ZXVlZE1lc3NhZ2VzKGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGJhY2sgbXVzdCBiZSBwcm92aWRlZFwiKTtcbiAgICB9XG4gICAgdGhpcy5tZXNzYWdlcyhjYWxsYmFjaywgQ29uc3QuTE9DQUxfU0VRSUQsIHVuZGVmaW5lZCwgY29udGV4dCk7XG4gIH1cbiAgLyoqXG4gICAqIEdldCB0aGUgbnVtYmVyIG9mIHRvcGljIHN1YnNjcmliZXJzIHdobyBtYXJrZWQgdGhpcyBtZXNzYWdlIGFzIGVpdGhlciByZWN2IG9yIHJlYWRcbiAgICogQ3VycmVudCB1c2VyIGlzIGV4Y2x1ZGVkIGZyb20gdGhlIGNvdW50LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gd2hhdCAtIHdoYXQgYWN0aW9uIHRvIGNvbnNpZGVyOiByZWNlaXZlZCA8Y29kZT5cInJlY3ZcIjwvY29kZT4gb3IgcmVhZCA8Y29kZT5cInJlYWRcIjwvY29kZT4uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzZXEgLSBJRCBvciB0aGUgbWVzc2FnZSByZWFkIG9yIHJlY2VpdmVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIHN1YnNjcmliZXJzIHdobyBtYXJrZWQgdGhlIG1lc3NhZ2Ugd2l0aCB0aGUgZ2l2ZW4gSUQgYXMgcmVhZCBvciByZWNlaXZlZC5cbiAgICovXG4gIG1zZ1JlY2VpcHRDb3VudCh3aGF0LCBzZXEpIHtcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIGlmIChzZXEgPiAwKSB7XG4gICAgICBjb25zdCBtZSA9IHRoaXMuX3Rpbm9kZS5nZXRDdXJyZW50VXNlcklEKCk7XG4gICAgICBmb3IgKGxldCBpZHggaW4gdGhpcy5fdXNlcnMpIHtcbiAgICAgICAgY29uc3QgdXNlciA9IHRoaXMuX3VzZXJzW2lkeF07XG4gICAgICAgIGlmICh1c2VyLnVzZXIgIT09IG1lICYmIHVzZXJbd2hhdF0gPj0gc2VxKSB7XG4gICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY291bnQ7XG4gIH1cbiAgLyoqXG4gICAqIEdldCB0aGUgbnVtYmVyIG9mIHRvcGljIHN1YnNjcmliZXJzIHdobyBtYXJrZWQgdGhpcyBtZXNzYWdlIChhbmQgYWxsIG9sZGVyIG1lc3NhZ2VzKSBhcyByZWFkLlxuICAgKiBUaGUgY3VycmVudCB1c2VyIGlzIGV4Y2x1ZGVkIGZyb20gdGhlIGNvdW50LlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gc2VxIC0gbWVzc2FnZSBpZCB0byBjaGVjay5cbiAgICogQHJldHVybnMge251bWJlcn0gbnVtYmVyIG9mIHN1YnNjcmliZXJzIHdobyBjbGFpbSB0byBoYXZlIHJlY2VpdmVkIHRoZSBtZXNzYWdlLlxuICAgKi9cbiAgbXNnUmVhZENvdW50KHNlcSkge1xuICAgIHJldHVybiB0aGlzLm1zZ1JlY2VpcHRDb3VudCgncmVhZCcsIHNlcSk7XG4gIH1cbiAgLyoqXG4gICAqIEdldCB0aGUgbnVtYmVyIG9mIHRvcGljIHN1YnNjcmliZXJzIHdobyBtYXJrZWQgdGhpcyBtZXNzYWdlIChhbmQgYWxsIG9sZGVyIG1lc3NhZ2VzKSBhcyByZWNlaXZlZC5cbiAgICogVGhlIGN1cnJlbnQgdXNlciBpcyBleGNsdWRlZCBmcm9tIHRoZSBjb3VudC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcSAtIE1lc3NhZ2UgaWQgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IE51bWJlciBvZiBzdWJzY3JpYmVycyB3aG8gY2xhaW0gdG8gaGF2ZSByZWNlaXZlZCB0aGUgbWVzc2FnZS5cbiAgICovXG4gIG1zZ1JlY3ZDb3VudChzZXEpIHtcbiAgICByZXR1cm4gdGhpcy5tc2dSZWNlaXB0Q291bnQoJ3JlY3YnLCBzZXEpO1xuICB9XG4gIC8qKlxuICAgKiBDaGVjayBpZiBjYWNoZWQgbWVzc2FnZSBJRHMgaW5kaWNhdGUgdGhhdCB0aGUgc2VydmVyIG1heSBoYXZlIG1vcmUgbWVzc2FnZXMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gbmV3ZXIgLSBpZiA8Y29kZT50cnVlPC9jb2RlPiwgY2hlY2sgZm9yIG5ld2VyIG1lc3NhZ2VzIG9ubHkuXG4gICAqL1xuICBtc2dIYXNNb3JlTWVzc2FnZXMobmV3ZXIpIHtcbiAgICByZXR1cm4gbmV3ZXIgPyB0aGlzLnNlcSA+IHRoaXMuX21heFNlcSA6XG4gICAgICAvLyBfbWluU2VxIGNvdWxkIGJlIG1vcmUgdGhhbiAxLCBidXQgZWFybGllciBtZXNzYWdlcyBjb3VsZCBoYXZlIGJlZW4gZGVsZXRlZC5cbiAgICAgICh0aGlzLl9taW5TZXEgPiAxICYmICF0aGlzLl9ub0VhcmxpZXJNc2dzKTtcbiAgfVxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIGdpdmVuIHNlcSBJZCBpcyBpZCBvZiB0aGUgbW9zdCByZWNlbnQgbWVzc2FnZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcUlkIGlkIG9mIHRoZSBtZXNzYWdlIHRvIGNoZWNrXG4gICAqL1xuICBpc05ld01lc3NhZ2Uoc2VxSWQpIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4U2VxIDw9IHNlcUlkO1xuICB9XG4gIC8qKlxuICAgKiBSZW1vdmUgb25lIG1lc3NhZ2UgZnJvbSBsb2NhbCBjYWNoZS5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcUlkIGlkIG9mIHRoZSBtZXNzYWdlIHRvIHJlbW92ZSBmcm9tIGNhY2hlLlxuICAgKiBAcmV0dXJucyB7TWVzc2FnZX0gcmVtb3ZlZCBtZXNzYWdlIG9yIHVuZGVmaW5lZCBpZiBzdWNoIG1lc3NhZ2Ugd2FzIG5vdCBmb3VuZC5cbiAgICovXG4gIGZsdXNoTWVzc2FnZShzZXFJZCkge1xuICAgIGNvbnN0IGlkeCA9IHRoaXMuX21lc3NhZ2VzLmZpbmQoe1xuICAgICAgc2VxOiBzZXFJZFxuICAgIH0pO1xuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgdGhpcy5fdGlub2RlLl9kYi5yZW1NZXNzYWdlcyh0aGlzLm5hbWUsIHNlcUlkKTtcbiAgICAgIHJldHVybiB0aGlzLl9tZXNzYWdlcy5kZWxBdChpZHgpO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIC8qKlxuICAgKiBVcGRhdGUgbWVzc2FnZSdzIHNlcUlkLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcHViIG1lc3NhZ2Ugb2JqZWN0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gbmV3U2VxSWQgbmV3IHNlcSBpZCBmb3IgcHViLlxuICAgKi9cbiAgc3dhcE1lc3NhZ2VJZChwdWIsIG5ld1NlcUlkKSB7XG4gICAgY29uc3QgaWR4ID0gdGhpcy5fbWVzc2FnZXMuZmluZChwdWIpO1xuICAgIGNvbnN0IG51bU1lc3NhZ2VzID0gdGhpcy5fbWVzc2FnZXMubGVuZ3RoKCk7XG4gICAgaWYgKDAgPD0gaWR4ICYmIGlkeCA8IG51bU1lc3NhZ2VzKSB7XG4gICAgICAvLyBSZW1vdmUgbWVzc2FnZSB3aXRoIHRoZSBvbGQgc2VxIElELlxuICAgICAgdGhpcy5fbWVzc2FnZXMuZGVsQXQoaWR4KTtcbiAgICAgIHRoaXMuX3Rpbm9kZS5fZGIucmVtTWVzc2FnZXModGhpcy5uYW1lLCBwdWIuc2VxKTtcbiAgICAgIC8vIEFkZCBtZXNzYWdlIHdpdGggdGhlIG5ldyBzZXEgSUQuXG4gICAgICBwdWIuc2VxID0gbmV3U2VxSWQ7XG4gICAgICB0aGlzLl9tZXNzYWdlcy5wdXQocHViKTtcbiAgICAgIHRoaXMuX3Rpbm9kZS5fZGIuYWRkTWVzc2FnZShwdWIpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogUmVtb3ZlIGEgcmFuZ2Ugb2YgbWVzc2FnZXMgZnJvbSB0aGUgbG9jYWwgY2FjaGUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBmcm9tSWQgc2VxIElEIG9mIHRoZSBmaXJzdCBtZXNzYWdlIHRvIHJlbW92ZSAoaW5jbHVzaXZlKS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHVudGlsSWQgc2VxSUQgb2YgdGhlIGxhc3QgbWVzc2FnZSB0byByZW1vdmUgKGV4Y2x1c2l2ZSkuXG4gICAqXG4gICAqIEByZXR1cm5zIHtNZXNzYWdlW119IGFycmF5IG9mIHJlbW92ZWQgbWVzc2FnZXMgKGNvdWxkIGJlIGVtcHR5KS5cbiAgICovXG4gIGZsdXNoTWVzc2FnZVJhbmdlKGZyb21JZCwgdW50aWxJZCkge1xuICAgIC8vIFJlbW92ZSByYW5nZSBmcm9tIHBlcnNpc3RlbnQgY2FjaGUuXG4gICAgdGhpcy5fdGlub2RlLl9kYi5yZW1NZXNzYWdlcyh0aGlzLm5hbWUsIGZyb21JZCwgdW50aWxJZCk7XG4gICAgLy8gc3RhcnQsIGVuZDogZmluZCBpbnNlcnRpb24gcG9pbnRzIChuZWFyZXN0ID09IHRydWUpLlxuICAgIGNvbnN0IHNpbmNlID0gdGhpcy5fbWVzc2FnZXMuZmluZCh7XG4gICAgICBzZXE6IGZyb21JZFxuICAgIH0sIHRydWUpO1xuICAgIHJldHVybiBzaW5jZSA+PSAwID8gdGhpcy5fbWVzc2FnZXMuZGVsUmFuZ2Uoc2luY2UsIHRoaXMuX21lc3NhZ2VzLmZpbmQoe1xuICAgICAgc2VxOiB1bnRpbElkXG4gICAgfSwgdHJ1ZSkpIDogW107XG4gIH1cbiAgLyoqXG4gICAqIEF0dGVtcHQgdG8gc3RvcCBtZXNzYWdlIGZyb20gYmVpbmcgc2VudC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcUlkIGlkIG9mIHRoZSBtZXNzYWdlIHRvIHN0b3Agc2VuZGluZyBhbmQgcmVtb3ZlIGZyb20gY2FjaGUuXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiBtZXNzYWdlIHdhcyBjYW5jZWxsZWQsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBjYW5jZWxTZW5kKHNlcUlkKSB7XG4gICAgY29uc3QgaWR4ID0gdGhpcy5fbWVzc2FnZXMuZmluZCh7XG4gICAgICBzZXE6IHNlcUlkXG4gICAgfSk7XG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBjb25zdCBtc2cgPSB0aGlzLl9tZXNzYWdlcy5nZXRBdChpZHgpO1xuICAgICAgY29uc3Qgc3RhdHVzID0gdGhpcy5tc2dTdGF0dXMobXNnKTtcbiAgICAgIGlmIChzdGF0dXMgPT0gQ29uc3QuTUVTU0FHRV9TVEFUVVNfUVVFVUVEIHx8IHN0YXR1cyA9PSBDb25zdC5NRVNTQUdFX1NUQVRVU19GQUlMRUQpIHtcbiAgICAgICAgdGhpcy5fdGlub2RlLl9kYi5yZW1NZXNzYWdlcyh0aGlzLm5hbWUsIHNlcUlkKTtcbiAgICAgICAgbXNnLl9jYW5jZWxsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9tZXNzYWdlcy5kZWxBdChpZHgpO1xuICAgICAgICBpZiAodGhpcy5vbkRhdGEpIHtcbiAgICAgICAgICAvLyBDYWxsaW5nIHdpdGggbm8gcGFyYW1ldGVycyB0byBpbmRpY2F0ZSB0aGUgbWVzc2FnZSB3YXMgZGVsZXRlZC5cbiAgICAgICAgICB0aGlzLm9uRGF0YSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLyoqXG4gICAqIEdldCB0eXBlIG9mIHRoZSB0b3BpYzogbWUsIHAycCwgZ3JwLCBmbmQuLi5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gT25lIG9mICdtZScsICdwMnAnLCAnZ3JwJywgJ2ZuZCcsICdzeXMnIG9yIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4uXG4gICAqL1xuICBnZXRUeXBlKCkge1xuICAgIHJldHVybiBUb3BpYy50b3BpY1R5cGUodGhpcy5uYW1lKTtcbiAgfVxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgdXNlcidzIGFjY2VzcyBtb2RlIG9mIHRoZSB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybnMge1Rpbm9kZS5BY2Nlc3NNb2RlfSAtIHVzZXIncyBhY2Nlc3MgbW9kZVxuICAgKi9cbiAgZ2V0QWNjZXNzTW9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5hY3M7XG4gIH1cbiAgLyoqXG4gICAqIFNldCBjdXJyZW50IHVzZXIncyBhY2Nlc3MgbW9kZSBvZiB0aGUgdG9waWMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEBwYXJhbSB7QWNjZXNzTW9kZSB8IE9iamVjdH0gYWNzIC0gYWNjZXNzIG1vZGUgdG8gc2V0LlxuICAgKi9cbiAgc2V0QWNjZXNzTW9kZShhY3MpIHtcbiAgICByZXR1cm4gdGhpcy5hY3MgPSBuZXcgQWNjZXNzTW9kZShhY3MpO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgdG9waWMncyBkZWZhdWx0IGFjY2VzcyBtb2RlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcmV0dXJucyB7VGlub2RlLkRlZkFjc30gLSBhY2Nlc3MgbW9kZSwgc3VjaCBhcyB7YXV0aDogYFJXUGAsIGFub246IGBOYH0uXG4gICAqL1xuICBnZXREZWZhdWx0QWNjZXNzKCkge1xuICAgIHJldHVybiB0aGlzLmRlZmFjcztcbiAgfVxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBuZXcgbWV0YSB7QGxpbmsgVGlub2RlLkdldFF1ZXJ5fSBidWlsZGVyLiBUaGUgcXVlcnkgaXMgYXR0Y2hlZCB0byB0aGUgY3VycmVudCB0b3BpYy5cbiAgICogSXQgd2lsbCBub3Qgd29yayBjb3JyZWN0bHkgaWYgdXNlZCB3aXRoIGEgZGlmZmVyZW50IHRvcGljLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcmV0dXJucyB7VGlub2RlLk1ldGFHZXRCdWlsZGVyfSBxdWVyeSBhdHRhY2hlZCB0byB0aGUgY3VycmVudCB0b3BpYy5cbiAgICovXG4gIHN0YXJ0TWV0YVF1ZXJ5KCkge1xuICAgIHJldHVybiBuZXcgTWV0YUdldEJ1aWxkZXIodGhpcyk7XG4gIH1cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRvcGljIGlzIGFyY2hpdmVkLCBpLmUuIHByaXZhdGUuYXJjaCA9PSB0cnVlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSA8Y29kZT50cnVlPC9jb2RlPiBpZiB0b3BpYyBpcyBhcmNoaXZlZCwgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIGlzQXJjaGl2ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJpdmF0ZSAmJiAhIXRoaXMucHJpdmF0ZS5hcmNoO1xuICB9XG4gIC8qKlxuICAgKiBDaGVjayBpZiB0b3BpYyBpcyBhICdtZScgdG9waWMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIDxjb2RlPnRydWU8L2NvZGU+IGlmIHRvcGljIGlzIGEgJ21lJyB0b3BpYywgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIGlzTWVUeXBlKCkge1xuICAgIHJldHVybiBUb3BpYy5pc01lVG9waWNOYW1lKHRoaXMubmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRvcGljIGlzIGEgY2hhbm5lbC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdG9waWMgaXMgYSBjaGFubmVsLCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICAgKi9cbiAgaXNDaGFubmVsVHlwZSgpIHtcbiAgICByZXR1cm4gVG9waWMuaXNDaGFubmVsVG9waWNOYW1lKHRoaXMubmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRvcGljIGlzIGEgZ3JvdXAgdG9waWMuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWMjXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIDxjb2RlPnRydWU8L2NvZGU+IGlmIHRvcGljIGlzIGEgZ3JvdXAsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBpc0dyb3VwVHlwZSgpIHtcbiAgICByZXR1cm4gVG9waWMuaXNHcm91cFRvcGljTmFtZSh0aGlzLm5hbWUpO1xuICB9XG4gIC8qKlxuICAgKiBDaGVjayBpZiB0b3BpYyBpcyBhIHAycCB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdG9waWMgaXMgYSBwMnAgdG9waWMsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBpc1AyUFR5cGUoKSB7XG4gICAgcmV0dXJuIFRvcGljLmlzUDJQVG9waWNOYW1lKHRoaXMubmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRvcGljIGlzIGEgY29tbXVuaWNhdGlvbiB0b3BpYywgaS5lLiBhIGdyb3VwIG9yIHAycCB0b3BpYy5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpYyNcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdG9waWMgaXMgYSBwMnAgb3IgZ3JvdXAgdG9waWMsIDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG4gICAqL1xuICBpc0NvbW1UeXBlKCkge1xuICAgIHJldHVybiBUb3BpYy5pc0NvbW1Ub3BpY05hbWUodGhpcy5uYW1lKTtcbiAgfVxuICAvKipcbiAgICogR2V0IHN0YXR1cyAocXVldWVkLCBzZW50LCByZWNlaXZlZCBldGMpIG9mIGEgZ2l2ZW4gbWVzc2FnZSBpbiB0aGUgY29udGV4dFxuICAgKiBvZiB0aGlzIHRvcGljLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljI1xuICAgKlxuICAgKiBAcGFyYW0ge01lc3NhZ2V9IG1zZyAtIG1lc3NhZ2UgdG8gY2hlY2sgZm9yIHN0YXR1cy5cbiAgICogQHBhcmFtIHtib29sZWFufSB1cGQgLSB1cGRhdGUgY2hhY2hlZCBtZXNzYWdlIHN0YXR1cy5cbiAgICpcbiAgICogQHJldHVybnMgbWVzc2FnZSBzdGF0dXMgY29uc3RhbnQuXG4gICAqL1xuICBtc2dTdGF0dXMobXNnLCB1cGQpIHtcbiAgICBsZXQgc3RhdHVzID0gQ29uc3QuTUVTU0FHRV9TVEFUVVNfTk9ORTtcbiAgICBpZiAodGhpcy5fdGlub2RlLmlzTWUobXNnLmZyb20pKSB7XG4gICAgICBpZiAobXNnLl9zZW5kaW5nKSB7XG4gICAgICAgIHN0YXR1cyA9IENvbnN0Lk1FU1NBR0VfU1RBVFVTX1NFTkRJTkc7XG4gICAgICB9IGVsc2UgaWYgKG1zZy5fZmFpbGVkIHx8IG1zZy5fY2FuY2VsbGVkKSB7XG4gICAgICAgIHN0YXR1cyA9IENvbnN0Lk1FU1NBR0VfU1RBVFVTX0ZBSUxFRDtcbiAgICAgIH0gZWxzZSBpZiAobXNnLnNlcSA+PSBDb25zdC5MT0NBTF9TRVFJRCkge1xuICAgICAgICBzdGF0dXMgPSBDb25zdC5NRVNTQUdFX1NUQVRVU19RVUVVRUQ7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubXNnUmVhZENvdW50KG1zZy5zZXEpID4gMCkge1xuICAgICAgICBzdGF0dXMgPSBDb25zdC5NRVNTQUdFX1NUQVRVU19SRUFEO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm1zZ1JlY3ZDb3VudChtc2cuc2VxKSA+IDApIHtcbiAgICAgICAgc3RhdHVzID0gQ29uc3QuTUVTU0FHRV9TVEFUVVNfUkVDRUlWRUQ7XG4gICAgICB9IGVsc2UgaWYgKG1zZy5zZXEgPiAwKSB7XG4gICAgICAgIHN0YXR1cyA9IENvbnN0Lk1FU1NBR0VfU1RBVFVTX1NFTlQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChtc2cuX3N0YXR1cyA9PSBDb25zdC5NRVNTQUdFX1NUQVRVU19ERUxfUkFOR0UpIHtcbiAgICAgIHN0YXR1cyA9PSBDb25zdC5NRVNTQUdFX1NUQVRVU19ERUxfUkFOR0U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXR1cyA9IENvbnN0Lk1FU1NBR0VfU1RBVFVTX1RPX01FO1xuICAgIH1cblxuICAgIGlmICh1cGQgJiYgbXNnLl9zdGF0dXMgIT0gc3RhdHVzKSB7XG4gICAgICBtc2cuX3N0YXR1cyA9IHN0YXR1cztcbiAgICAgIHRoaXMuX3Rpbm9kZS5fZGIudXBkTWVzc2FnZVN0YXR1cyh0aGlzLm5hbWUsIG1zZy5zZXEsIHN0YXR1cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXR1cztcbiAgfVxuICAvLyBQcm9jZXNzIGRhdGEgbWVzc2FnZVxuICBfcm91dGVEYXRhKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5jb250ZW50KSB7XG4gICAgICBpZiAoIXRoaXMudG91Y2hlZCB8fCB0aGlzLnRvdWNoZWQgPCBkYXRhLnRzKSB7XG4gICAgICAgIHRoaXMudG91Y2hlZCA9IGRhdGEudHM7XG4gICAgICAgIHRoaXMuX3Rpbm9kZS5fZGIudXBkVG9waWModGhpcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRhdGEuc2VxID4gdGhpcy5fbWF4U2VxKSB7XG4gICAgICB0aGlzLl9tYXhTZXEgPSBkYXRhLnNlcTtcbiAgICB9XG4gICAgaWYgKGRhdGEuc2VxIDwgdGhpcy5fbWluU2VxIHx8IHRoaXMuX21pblNlcSA9PSAwKSB7XG4gICAgICB0aGlzLl9taW5TZXEgPSBkYXRhLnNlcTtcbiAgICB9XG5cbiAgICBpZiAoIWRhdGEuX25vRm9yd2FyZGluZykge1xuICAgICAgdGhpcy5fbWVzc2FnZXMucHV0KGRhdGEpO1xuICAgICAgdGhpcy5fdGlub2RlLl9kYi5hZGRNZXNzYWdlKGRhdGEpO1xuICAgICAgdGhpcy5fdXBkYXRlRGVsZXRlZFJhbmdlcygpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9uRGF0YSkge1xuICAgICAgdGhpcy5vbkRhdGEoZGF0YSk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGxvY2FsbHkgY2FjaGVkIGNvbnRhY3Qgd2l0aCB0aGUgbmV3IG1lc3NhZ2UgY291bnQuXG4gICAgY29uc3Qgd2hhdCA9ICgoIXRoaXMuaXNDaGFubmVsVHlwZSgpICYmICFkYXRhLmZyb20pIHx8IHRoaXMuX3Rpbm9kZS5pc01lKGRhdGEuZnJvbSkpID8gJ3JlYWQnIDogJ21zZyc7XG4gICAgdGhpcy5fdXBkYXRlUmVhZFJlY3Yod2hhdCwgZGF0YS5zZXEsIGRhdGEudHMpO1xuICAgIC8vIE5vdGlmeSAnbWUnIGxpc3RlbmVycyBvZiB0aGUgY2hhbmdlLlxuICAgIHRoaXMuX3Rpbm9kZS5nZXRNZVRvcGljKCkuX3JlZnJlc2hDb250YWN0KHdoYXQsIHRoaXMpO1xuICB9XG4gIC8vIFByb2Nlc3MgbWV0YWRhdGEgbWVzc2FnZVxuICBfcm91dGVNZXRhKG1ldGEpIHtcbiAgICBpZiAobWV0YS5kZXNjKSB7XG4gICAgICB0aGlzLl9wcm9jZXNzTWV0YURlc2MobWV0YS5kZXNjKTtcbiAgICB9XG4gICAgaWYgKG1ldGEuc3ViICYmIG1ldGEuc3ViLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX3Byb2Nlc3NNZXRhU3ViKG1ldGEuc3ViKTtcbiAgICB9XG4gICAgaWYgKG1ldGEuZGVsKSB7XG4gICAgICB0aGlzLl9wcm9jZXNzRGVsTWVzc2FnZXMobWV0YS5kZWwuY2xlYXIsIG1ldGEuZGVsLmRlbHNlcSk7XG4gICAgfVxuICAgIGlmIChtZXRhLnRhZ3MpIHtcbiAgICAgIHRoaXMuX3Byb2Nlc3NNZXRhVGFncyhtZXRhLnRhZ3MpO1xuICAgIH1cbiAgICBpZiAobWV0YS5jcmVkKSB7XG4gICAgICB0aGlzLl9wcm9jZXNzTWV0YUNyZWRzKG1ldGEuY3JlZCk7XG4gICAgfVxuICAgIGlmICh0aGlzLm9uTWV0YSkge1xuICAgICAgdGhpcy5vbk1ldGEobWV0YSk7XG4gICAgfVxuICB9XG4gIC8vIFByb2Nlc3MgcHJlc2VuY2UgY2hhbmdlIG1lc3NhZ2VcbiAgX3JvdXRlUHJlcyhwcmVzKSB7XG4gICAgbGV0IHVzZXIsIHVpZDtcbiAgICBzd2l0Y2ggKHByZXMud2hhdCkge1xuICAgICAgY2FzZSAnZGVsJzpcbiAgICAgICAgLy8gRGVsZXRlIGNhY2hlZCBtZXNzYWdlcy5cbiAgICAgICAgdGhpcy5fcHJvY2Vzc0RlbE1lc3NhZ2VzKHByZXMuY2xlYXIsIHByZXMuZGVsc2VxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdvbic6XG4gICAgICBjYXNlICdvZmYnOlxuICAgICAgICAvLyBVcGRhdGUgb25saW5lIHN0YXR1cyBvZiBhIHN1YnNjcmlwdGlvbi5cbiAgICAgICAgdXNlciA9IHRoaXMuX3VzZXJzW3ByZXMuc3JjXTtcbiAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICB1c2VyLm9ubGluZSA9IHByZXMud2hhdCA9PSAnb24nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3Rpbm9kZS5sb2dnZXIoXCJXQVJOSU5HOiBQcmVzZW5jZSB1cGRhdGUgZm9yIGFuIHVua25vd24gdXNlclwiLCB0aGlzLm5hbWUsIHByZXMuc3JjKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Rlcm0nOlxuICAgICAgICAvLyBBdHRhY2htZW50IHRvIHRvcGljIGlzIHRlcm1pbmF0ZWQgcHJvYmFibHkgZHVlIHRvIGNsdXN0ZXIgcmVoYXNoaW5nLlxuICAgICAgICB0aGlzLl9yZXNldFN1YigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3VwZCc6XG4gICAgICAgIC8vIEEgdG9waWMgc3Vic2NyaWJlciBoYXMgdXBkYXRlZCBoaXMgZGVzY3JpcHRpb24uXG4gICAgICAgIC8vIElzc3VlIHtnZXQgc3VifSBvbmx5IGlmIHRoZSBjdXJyZW50IHVzZXIgaGFzIG5vIHAycCB0b3BpY3Mgd2l0aCB0aGUgdXBkYXRlZCB1c2VyIChwMnAgbmFtZSBpcyBub3QgaW4gY2FjaGUpLlxuICAgICAgICAvLyBPdGhlcndpc2UgJ21lJyB3aWxsIGlzc3VlIGEge2dldCBkZXNjfSByZXF1ZXN0LlxuICAgICAgICBpZiAocHJlcy5zcmMgJiYgIXRoaXMuX3Rpbm9kZS5pc1RvcGljQ2FjaGVkKHByZXMuc3JjKSkge1xuICAgICAgICAgIHRoaXMuZ2V0TWV0YSh0aGlzLnN0YXJ0TWV0YVF1ZXJ5KCkud2l0aExhdGVyT25lU3ViKHByZXMuc3JjKS5idWlsZCgpKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Fjcyc6XG4gICAgICAgIHVpZCA9IHByZXMuc3JjIHx8IHRoaXMuX3Rpbm9kZS5nZXRDdXJyZW50VXNlcklEKCk7XG4gICAgICAgIHVzZXIgPSB0aGlzLl91c2Vyc1t1aWRdO1xuICAgICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgICAvLyBVcGRhdGUgZm9yIGFuIHVua25vd24gdXNlcjogbm90aWZpY2F0aW9uIG9mIGEgbmV3IHN1YnNjcmlwdGlvbi5cbiAgICAgICAgICBjb25zdCBhY3MgPSBuZXcgQWNjZXNzTW9kZSgpLnVwZGF0ZUFsbChwcmVzLmRhY3MpO1xuICAgICAgICAgIGlmIChhY3MgJiYgYWNzLm1vZGUgIT0gQWNjZXNzTW9kZS5fTk9ORSkge1xuICAgICAgICAgICAgdXNlciA9IHRoaXMuX2NhY2hlR2V0VXNlcih1aWQpO1xuICAgICAgICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgICAgICAgIHVzZXIgPSB7XG4gICAgICAgICAgICAgICAgdXNlcjogdWlkLFxuICAgICAgICAgICAgICAgIGFjczogYWNzXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHRoaXMuZ2V0TWV0YSh0aGlzLnN0YXJ0TWV0YVF1ZXJ5KCkud2l0aE9uZVN1Yih1bmRlZmluZWQsIHVpZCkuYnVpbGQoKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB1c2VyLmFjcyA9IGFjcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZXIudXBkYXRlZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICB0aGlzLl9wcm9jZXNzTWV0YVN1YihbdXNlcl0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBLbm93biB1c2VyXG4gICAgICAgICAgdXNlci5hY3MudXBkYXRlQWxsKHByZXMuZGFjcyk7XG4gICAgICAgICAgLy8gVXBkYXRlIHVzZXIncyBhY2Nlc3MgbW9kZS5cbiAgICAgICAgICB0aGlzLl9wcm9jZXNzTWV0YVN1Yihbe1xuICAgICAgICAgICAgdXNlcjogdWlkLFxuICAgICAgICAgICAgdXBkYXRlZDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIGFjczogdXNlci5hY3NcbiAgICAgICAgICB9XSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLl90aW5vZGUubG9nZ2VyKFwiSU5GTzogSWdub3JlZCBwcmVzZW5jZSB1cGRhdGVcIiwgcHJlcy53aGF0KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vblByZXMpIHtcbiAgICAgIHRoaXMub25QcmVzKHByZXMpO1xuICAgIH1cbiAgfVxuICAvLyBQcm9jZXNzIHtpbmZvfSBtZXNzYWdlXG4gIF9yb3V0ZUluZm8oaW5mbykge1xuICAgIGlmIChpbmZvLndoYXQgIT09ICdrcCcpIHtcbiAgICAgIGNvbnN0IHVzZXIgPSB0aGlzLl91c2Vyc1tpbmZvLmZyb21dO1xuICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgdXNlcltpbmZvLndoYXRdID0gaW5mby5zZXE7XG4gICAgICAgIGlmICh1c2VyLnJlY3YgPCB1c2VyLnJlYWQpIHtcbiAgICAgICAgICB1c2VyLnJlY3YgPSB1c2VyLnJlYWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IG1zZyA9IHRoaXMubGF0ZXN0TWVzc2FnZSgpO1xuICAgICAgaWYgKG1zZykge1xuICAgICAgICB0aGlzLm1zZ1N0YXR1cyhtc2csIHRydWUpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGlzIGlzIGFuIHVwZGF0ZSBmcm9tIHRoZSBjdXJyZW50IHVzZXIsIHVwZGF0ZSB0aGUgY2FjaGUgd2l0aCB0aGUgbmV3IGNvdW50LlxuICAgICAgaWYgKHRoaXMuX3Rpbm9kZS5pc01lKGluZm8uZnJvbSkpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlUmVhZFJlY3YoaW5mby53aGF0LCBpbmZvLnNlcSk7XG4gICAgICB9XG5cbiAgICAgIC8vIE5vdGlmeSAnbWUnIGxpc3RlbmVyIG9mIHRoZSBzdGF0dXMgY2hhbmdlLlxuICAgICAgdGhpcy5fdGlub2RlLmdldE1lVG9waWMoKS5fcmVmcmVzaENvbnRhY3QoaW5mby53aGF0LCB0aGlzKTtcbiAgICB9XG4gICAgaWYgKHRoaXMub25JbmZvKSB7XG4gICAgICB0aGlzLm9uSW5mbyhpbmZvKTtcbiAgICB9XG4gIH1cbiAgLy8gQ2FsbGVkIGJ5IFRpbm9kZSB3aGVuIG1ldGEuZGVzYyBwYWNrZXQgaXMgcmVjZWl2ZWQuXG4gIC8vIENhbGxlZCBieSAnbWUnIHRvcGljIG9uIGNvbnRhY3QgdXBkYXRlIChkZXNjLl9ub0ZvcndhcmRpbmcgaXMgdHJ1ZSkuXG4gIF9wcm9jZXNzTWV0YURlc2MoZGVzYykge1xuICAgIGlmICh0aGlzLmlzUDJQVHlwZSgpKSB7XG4gICAgICAvLyBTeW50aGV0aWMgZGVzYyBtYXkgaW5jbHVkZSBkZWZhY3MgZm9yIHAycCB0b3BpY3Mgd2hpY2ggaXMgdXNlbGVzcy5cbiAgICAgIC8vIFJlbW92ZSBpdC5cbiAgICAgIGRlbGV0ZSBkZXNjLmRlZmFjcztcblxuICAgICAgLy8gVXBkYXRlIHRvIHAycCBkZXNjIGlzIHRoZSBzYW1lIGFzIHVzZXIgdXBkYXRlLiBVcGRhdGUgY2FjaGVkIHVzZXIuXG4gICAgICB0aGlzLl90aW5vZGUuX2RiLnVwZFVzZXIodGhpcy5uYW1lLCBkZXNjLnB1YmxpYyk7XG4gICAgfVxuXG4gICAgLy8gQ29weSBwYXJhbWV0ZXJzIGZyb20gZGVzYyBvYmplY3QgdG8gdGhpcyB0b3BpYy5cbiAgICBtZXJnZU9iaih0aGlzLCBkZXNjKTtcbiAgICAvLyBVcGRhdGUgcGVyc2lzdGVudCBjYWNoZS5cbiAgICB0aGlzLl90aW5vZGUuX2RiLnVwZFRvcGljKHRoaXMpO1xuXG4gICAgLy8gTm90aWZ5ICdtZScgbGlzdGVuZXIsIGlmIGF2YWlsYWJsZTpcbiAgICBpZiAodGhpcy5uYW1lICE9PSBDb25zdC5UT1BJQ19NRSAmJiAhZGVzYy5fbm9Gb3J3YXJkaW5nKSB7XG4gICAgICBjb25zdCBtZSA9IHRoaXMuX3Rpbm9kZS5nZXRNZVRvcGljKCk7XG4gICAgICBpZiAobWUub25NZXRhU3ViKSB7XG4gICAgICAgIG1lLm9uTWV0YVN1Yih0aGlzKTtcbiAgICAgIH1cbiAgICAgIGlmIChtZS5vblN1YnNVcGRhdGVkKSB7XG4gICAgICAgIG1lLm9uU3Vic1VwZGF0ZWQoW3RoaXMubmFtZV0sIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLm9uTWV0YURlc2MpIHtcbiAgICAgIHRoaXMub25NZXRhRGVzYyh0aGlzKTtcbiAgICB9XG4gIH1cbiAgLy8gQ2FsbGVkIGJ5IFRpbm9kZSB3aGVuIG1ldGEuc3ViIGlzIHJlY2l2ZWQgb3IgaW4gcmVzcG9uc2UgdG8gcmVjZWl2ZWRcbiAgLy8ge2N0cmx9IGFmdGVyIHNldE1ldGEtc3ViLlxuICBfcHJvY2Vzc01ldGFTdWIoc3Vicykge1xuICAgIGZvciAobGV0IGlkeCBpbiBzdWJzKSB7XG4gICAgICBjb25zdCBzdWIgPSBzdWJzW2lkeF07XG5cbiAgICAgIC8vIEZpbGwgZGVmYXVsdHMuXG4gICAgICBzdWIub25saW5lID0gISFzdWIub25saW5lO1xuICAgICAgLy8gVXBkYXRlIHRpbWVzdGFtcCBvZiB0aGUgbW9zdCByZWNlbnQgc3Vic2NyaXB0aW9uIHVwZGF0ZS5cbiAgICAgIHRoaXMuX2xhc3RTdWJzVXBkYXRlID0gbmV3IERhdGUoTWF0aC5tYXgodGhpcy5fbGFzdFN1YnNVcGRhdGUsIHN1Yi51cGRhdGVkKSk7XG5cbiAgICAgIGxldCB1c2VyID0gbnVsbDtcbiAgICAgIGlmICghc3ViLmRlbGV0ZWQpIHtcbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIGNoYW5nZSB0byB1c2VyJ3Mgb3duIHBlcm1pc3Npb25zLCB1cGRhdGUgdGhlbSBpbiB0b3BpYyB0b28uXG4gICAgICAgIC8vIERlc2Mgd2lsbCB1cGRhdGUgJ21lJyB0b3BpYy5cbiAgICAgICAgaWYgKHRoaXMuX3Rpbm9kZS5pc01lKHN1Yi51c2VyKSAmJiBzdWIuYWNzKSB7XG4gICAgICAgICAgdGhpcy5fcHJvY2Vzc01ldGFEZXNjKHtcbiAgICAgICAgICAgIHVwZGF0ZWQ6IHN1Yi51cGRhdGVkLFxuICAgICAgICAgICAgdG91Y2hlZDogc3ViLnRvdWNoZWQsXG4gICAgICAgICAgICBhY3M6IHN1Yi5hY3NcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB1c2VyID0gdGhpcy5fdXBkYXRlQ2FjaGVkVXNlcihzdWIudXNlciwgc3ViKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFN1YnNjcmlwdGlvbiBpcyBkZWxldGVkLCByZW1vdmUgaXQgZnJvbSB0b3BpYyAoYnV0IGxlYXZlIGluIFVzZXJzIGNhY2hlKVxuICAgICAgICBkZWxldGUgdGhpcy5fdXNlcnNbc3ViLnVzZXJdO1xuICAgICAgICB1c2VyID0gc3ViO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vbk1ldGFTdWIpIHtcbiAgICAgICAgdGhpcy5vbk1ldGFTdWIodXNlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub25TdWJzVXBkYXRlZCkge1xuICAgICAgdGhpcy5vblN1YnNVcGRhdGVkKE9iamVjdC5rZXlzKHRoaXMuX3VzZXJzKSk7XG4gICAgfVxuICB9XG4gIC8vIENhbGxlZCBieSBUaW5vZGUgd2hlbiBtZXRhLnRhZ3MgaXMgcmVjaXZlZC5cbiAgX3Byb2Nlc3NNZXRhVGFncyh0YWdzKSB7XG4gICAgaWYgKHRhZ3MubGVuZ3RoID09IDEgJiYgdGFnc1swXSA9PSBDb25zdC5ERUxfQ0hBUikge1xuICAgICAgdGFncyA9IFtdO1xuICAgIH1cbiAgICB0aGlzLl90YWdzID0gdGFncztcbiAgICBpZiAodGhpcy5vblRhZ3NVcGRhdGVkKSB7XG4gICAgICB0aGlzLm9uVGFnc1VwZGF0ZWQodGFncyk7XG4gICAgfVxuICB9XG4gIC8vIERvIG5vdGhpbmcgZm9yIHRvcGljcyBvdGhlciB0aGFuICdtZSdcbiAgX3Byb2Nlc3NNZXRhQ3JlZHMoY3JlZHMpIHt9XG4gIC8vIERlbGV0ZSBjYWNoZWQgbWVzc2FnZXMgYW5kIHVwZGF0ZSBjYWNoZWQgdHJhbnNhY3Rpb24gSURzXG4gIF9wcm9jZXNzRGVsTWVzc2FnZXMoY2xlYXIsIGRlbHNlcSkge1xuICAgIHRoaXMuX21heERlbCA9IE1hdGgubWF4KGNsZWFyLCB0aGlzLl9tYXhEZWwpO1xuICAgIHRoaXMuY2xlYXIgPSBNYXRoLm1heChjbGVhciwgdGhpcy5jbGVhcik7XG4gICAgY29uc3QgdG9waWMgPSB0aGlzO1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZGVsc2VxKSkge1xuICAgICAgZGVsc2VxLmZvckVhY2goZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICAgICAgaWYgKCFyYW5nZS5oaSkge1xuICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgdG9waWMuZmx1c2hNZXNzYWdlKHJhbmdlLmxvdyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IHJhbmdlLmxvdzsgaSA8IHJhbmdlLmhpOyBpKyspIHtcbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICB0b3BpYy5mbHVzaE1lc3NhZ2UoaSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoY291bnQgPiAwKSB7XG4gICAgICB0aGlzLl91cGRhdGVEZWxldGVkUmFuZ2VzKCk7XG5cbiAgICAgIGlmICh0aGlzLm9uRGF0YSkge1xuICAgICAgICB0aGlzLm9uRGF0YSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBUb3BpYyBpcyBpbmZvcm1lZCB0aGF0IHRoZSBlbnRpcmUgcmVzcG9uc2UgdG8ge2dldCB3aGF0PWRhdGF9IGhhcyBiZWVuIHJlY2VpdmVkLlxuICBfYWxsTWVzc2FnZXNSZWNlaXZlZChjb3VudCkge1xuICAgIHRoaXMuX3VwZGF0ZURlbGV0ZWRSYW5nZXMoKTtcblxuICAgIGlmICh0aGlzLm9uQWxsTWVzc2FnZXNSZWNlaXZlZCkge1xuICAgICAgdGhpcy5vbkFsbE1lc3NhZ2VzUmVjZWl2ZWQoY291bnQpO1xuICAgIH1cbiAgfVxuICAvLyBSZXNldCBzdWJzY3JpYmVkIHN0YXRlXG4gIF9yZXNldFN1YigpIHtcbiAgICB0aGlzLl9hdHRhY2hlZCA9IGZhbHNlO1xuICB9XG4gIC8vIFRoaXMgdG9waWMgaXMgZWl0aGVyIGRlbGV0ZWQgb3IgdW5zdWJzY3JpYmVkIGZyb20uXG4gIF9nb25lKCkge1xuICAgIHRoaXMuX21lc3NhZ2VzLnJlc2V0KCk7XG4gICAgdGhpcy5fdGlub2RlLl9kYi5yZW1NZXNzYWdlcyh0aGlzLm5hbWUpO1xuICAgIHRoaXMuX3VzZXJzID0ge307XG4gICAgdGhpcy5hY3MgPSBuZXcgQWNjZXNzTW9kZShudWxsKTtcbiAgICB0aGlzLnByaXZhdGUgPSBudWxsO1xuICAgIHRoaXMucHVibGljID0gbnVsbDtcbiAgICB0aGlzLnRydXN0ZWQgPSBudWxsO1xuICAgIHRoaXMuX21heFNlcSA9IDA7XG4gICAgdGhpcy5fbWluU2VxID0gMDtcbiAgICB0aGlzLl9hdHRhY2hlZCA9IGZhbHNlO1xuXG4gICAgY29uc3QgbWUgPSB0aGlzLl90aW5vZGUuZ2V0TWVUb3BpYygpO1xuICAgIGlmIChtZSkge1xuICAgICAgbWUuX3JvdXRlUHJlcyh7XG4gICAgICAgIF9ub0ZvcndhcmRpbmc6IHRydWUsXG4gICAgICAgIHdoYXQ6ICdnb25lJyxcbiAgICAgICAgdG9waWM6IENvbnN0LlRPUElDX01FLFxuICAgICAgICBzcmM6IHRoaXMubmFtZVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLm9uRGVsZXRlVG9waWMpIHtcbiAgICAgIHRoaXMub25EZWxldGVUb3BpYygpO1xuICAgIH1cbiAgfVxuICAvLyBVcGRhdGUgZ2xvYmFsIHVzZXIgY2FjaGUgYW5kIGxvY2FsIHN1YnNjcmliZXJzIGNhY2hlLlxuICAvLyBEb24ndCBjYWxsIHRoaXMgbWV0aG9kIGZvciBub24tc3Vic2NyaWJlcnMuXG4gIF91cGRhdGVDYWNoZWRVc2VyKHVpZCwgb2JqKSB7XG4gICAgLy8gRmV0Y2ggdXNlciBvYmplY3QgZnJvbSB0aGUgZ2xvYmFsIGNhY2hlLlxuICAgIC8vIFRoaXMgaXMgYSBjbG9uZSBvZiB0aGUgc3RvcmVkIG9iamVjdFxuICAgIGxldCBjYWNoZWQgPSB0aGlzLl9jYWNoZUdldFVzZXIodWlkKTtcbiAgICBjYWNoZWQgPSBtZXJnZU9iaihjYWNoZWQgfHwge30sIG9iaik7XG4gICAgLy8gU2F2ZSB0byBnbG9iYWwgY2FjaGVcbiAgICB0aGlzLl9jYWNoZVB1dFVzZXIodWlkLCBjYWNoZWQpO1xuICAgIC8vIFNhdmUgdG8gdGhlIGxpc3Qgb2YgdG9waWMgc3Vic3JpYmVycy5cbiAgICByZXR1cm4gbWVyZ2VUb0NhY2hlKHRoaXMuX3VzZXJzLCB1aWQsIGNhY2hlZCk7XG4gIH1cbiAgLy8gR2V0IGxvY2FsIHNlcUlkIGZvciBhIHF1ZXVlZCBtZXNzYWdlLlxuICBfZ2V0UXVldWVkU2VxSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3F1ZXVlZFNlcUlkKys7XG4gIH1cbiAgLy8gQ2FsY3VsYXRlIHJhbmdlcyBvZiBtaXNzaW5nIG1lc3NhZ2VzLlxuICBfdXBkYXRlRGVsZXRlZFJhbmdlcygpIHtcbiAgICBjb25zdCByYW5nZXMgPSBbXTtcblxuICAgIC8vIEdhcCBtYXJrZXIsIHBvc3NpYmx5IGVtcHR5LlxuICAgIGxldCBwcmV2ID0gbnVsbDtcblxuICAgIC8vIENoZWNrIGZvciBnYXAgaW4gdGhlIGJlZ2lubmluZywgYmVmb3JlIHRoZSBmaXJzdCBtZXNzYWdlLlxuICAgIGNvbnN0IGZpcnN0ID0gdGhpcy5fbWVzc2FnZXMuZ2V0QXQoMCk7XG4gICAgaWYgKGZpcnN0ICYmIHRoaXMuX21pblNlcSA+IDEgJiYgIXRoaXMuX25vRWFybGllck1zZ3MpIHtcbiAgICAgIC8vIFNvbWUgbWVzc2FnZXMgYXJlIG1pc3NpbmcgaW4gdGhlIGJlZ2lubmluZy5cbiAgICAgIGlmIChmaXJzdC5oaSkge1xuICAgICAgICAvLyBUaGUgZmlyc3QgbWVzc2FnZSBhbHJlYWR5IHJlcHJlc2VudHMgYSBnYXAuXG4gICAgICAgIGlmIChmaXJzdC5zZXEgPiAxKSB7XG4gICAgICAgICAgZmlyc3Quc2VxID0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlyc3QuaGkgPCB0aGlzLl9taW5TZXEgLSAxKSB7XG4gICAgICAgICAgZmlyc3QuaGkgPSB0aGlzLl9taW5TZXEgLSAxO1xuICAgICAgICB9XG4gICAgICAgIHByZXYgPSBmaXJzdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIENyZWF0ZSBuZXcgZ2FwLlxuICAgICAgICBwcmV2ID0ge1xuICAgICAgICAgIHNlcTogMSxcbiAgICAgICAgICBoaTogdGhpcy5fbWluU2VxIC0gMVxuICAgICAgICB9O1xuICAgICAgICByYW5nZXMucHVzaChwcmV2KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm8gZ2FwIGluIHRoZSBiZWdpbm5pbmcuXG4gICAgICBwcmV2ID0ge1xuICAgICAgICBzZXE6IDAsXG4gICAgICAgIGhpOiAwXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEZpbmQgbmV3IGdhcHMgaW4gdGhlIGxpc3Qgb2YgcmVjZWl2ZWQgbWVzc2FnZXMuIFRoZSBsaXN0IGNvbnRhaW5zIG1lc3NhZ2VzLXByb3BlciBhcyB3ZWxsXG4gICAgLy8gYXMgcGxhY2Vob2xkZXJzIGZvciBkZWxldGVkIHJhbmdlcy5cbiAgICAvLyBUaGUgbWVzc2FnZXMgYXJlIGl0ZXJhdGVkIGJ5IHNlcSBJRCBpbiBhc2NlbmRpbmcgb3JkZXIuXG4gICAgdGhpcy5fbWVzc2FnZXMuZmlsdGVyKChkYXRhKSA9PiB7XG4gICAgICAvLyBEbyBub3QgY3JlYXRlIGEgZ2FwIGJldHdlZW4gdGhlIGxhc3Qgc2VudCBtZXNzYWdlIGFuZCB0aGUgZmlyc3QgdW5zZW50IGFzIHdlbGwgYXMgYmV0d2VlbiB1bnNlbnQgbWVzc2FnZXMuXG4gICAgICBpZiAoZGF0YS5zZXEgPj0gQ29uc3QuTE9DQUxfU0VRSUQpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGZvciBhIGdhcCBiZXR3ZWVuIHRoZSBwcmV2aW91cyBtZXNzYWdlL21hcmtlciBhbmQgdGhpcyBtZXNzYWdlL21hcmtlci5cbiAgICAgIGlmIChkYXRhLnNlcSA9PSAocHJldi5oaSB8fCBwcmV2LnNlcSkgKyAxKSB7XG4gICAgICAgIC8vIE5vIGdhcCBiZXR3ZWVuIHRoaXMgbWVzc2FnZSBhbmQgdGhlIHByZXZpb3VzLlxuICAgICAgICBpZiAoZGF0YS5oaSAmJiBwcmV2LmhpKSB7XG4gICAgICAgICAgLy8gVHdvIGdhcCBtYXJrZXJzIGluIGEgcm93LiBFeHRlbmQgdGhlIHByZXZpb3VzIG9uZSwgZGlzY2FyZCB0aGUgY3VycmVudC5cbiAgICAgICAgICBwcmV2LmhpID0gZGF0YS5oaTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcHJldiA9IGRhdGE7XG5cbiAgICAgICAgLy8gS2VlcCBjdXJyZW50LlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gRm91bmQgYSBuZXcgZ2FwLlxuICAgICAgLy8gQ2hlY2sgaWYgdGhlIHByZXZpb3VzIGlzIGFsc28gYSBnYXAgbWFya2VyLlxuICAgICAgaWYgKHByZXYuaGkpIHtcbiAgICAgICAgLy8gQWx0ZXIgaXQgaW5zdGVhZCBvZiBjcmVhdGluZyBhIG5ldyBvbmUuXG4gICAgICAgIHByZXYuaGkgPSBkYXRhLmhpIHx8IGRhdGEuc2VxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gUHJldmlvdXMgaXMgbm90IGEgZ2FwIG1hcmtlci4gQ3JlYXRlIGEgbmV3IG9uZS5cbiAgICAgICAgcHJldiA9IHtcbiAgICAgICAgICBzZXE6IHByZXYuc2VxICsgMSxcbiAgICAgICAgICBoaTogZGF0YS5oaSB8fCBkYXRhLnNlcVxuICAgICAgICB9O1xuICAgICAgICByYW5nZXMucHVzaChwcmV2KTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgbWFya2VyLCByZW1vdmU7IGtlZXAgaWYgcmVndWxhciBtZXNzYWdlLlxuICAgICAgaWYgKCFkYXRhLmhpKSB7XG4gICAgICAgIC8vIEtlZXBpbmcgdGhlIGN1cnJlbnQgcmVndWxhciBtZXNzYWdlLCBzYXZlIGl0IGFzIHByZXZpb3VzLlxuICAgICAgICBwcmV2ID0gZGF0YTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIERpc2NhcmQgdGhlIGN1cnJlbnQgZ2FwIG1hcmtlcjogd2UgZWl0aGVyIGNyZWF0ZWQgYW4gZWFybGllciBnYXAsIG9yIGV4dGVuZGVkIHRoZSBwcmV2b3VzIG9uZS5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuICAgIC8vIENoZWNrIGZvciBtaXNzaW5nIG1lc3NhZ2VzIGF0IHRoZSBlbmQuXG4gICAgLy8gQWxsIG1lc3NhZ2VzIGNvdWxkIGJlIG1pc3Npbmcgb3IgaXQgY291bGQgYmUgYSBuZXcgdG9waWMgd2l0aCBubyBtZXNzYWdlcy5cbiAgICBjb25zdCBsYXN0ID0gdGhpcy5fbWVzc2FnZXMuZ2V0TGFzdCgpO1xuICAgIGNvbnN0IG1heFNlcSA9IE1hdGgubWF4KHRoaXMuc2VxLCB0aGlzLl9tYXhTZXEpIHx8IDA7XG4gICAgaWYgKChtYXhTZXEgPiAwICYmICFsYXN0KSB8fCAobGFzdCAmJiAoKGxhc3QuaGkgfHwgbGFzdC5zZXEpIDwgbWF4U2VxKSkpIHtcbiAgICAgIGlmIChsYXN0ICYmIGxhc3QuaGkpIHtcbiAgICAgICAgLy8gRXh0ZW5kIGV4aXN0aW5nIGdhcFxuICAgICAgICBsYXN0LmhpID0gbWF4U2VxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ3JlYXRlIG5ldyBnYXAuXG4gICAgICAgIHJhbmdlcy5wdXNoKHtcbiAgICAgICAgICBzZXE6IGxhc3QgPyBsYXN0LnNlcSArIDEgOiAxLFxuICAgICAgICAgIGhpOiBtYXhTZXFcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW5zZXJ0IG5ldyBnYXBzIGludG8gY2FjaGUuXG4gICAgcmFuZ2VzLmZvckVhY2goKGdhcCkgPT4ge1xuICAgICAgZ2FwLl9zdGF0dXMgPSBDb25zdC5NRVNTQUdFX1NUQVRVU19ERUxfUkFOR0U7XG4gICAgICB0aGlzLl9tZXNzYWdlcy5wdXQoZ2FwKTtcbiAgICB9KTtcbiAgfVxuICAvLyBMb2FkIG1vc3QgcmVjZW50IG1lc3NhZ2VzIGZyb20gcGVyc2lzdGVudCBjYWNoZS5cbiAgX2xvYWRNZXNzYWdlcyhkYiwgcGFyYW1zKSB7XG4gICAgY29uc3Qge1xuICAgICAgc2luY2UsXG4gICAgICBiZWZvcmUsXG4gICAgICBsaW1pdFxuICAgIH0gPSBwYXJhbXMgfHwge307XG4gICAgcmV0dXJuIGRiLnJlYWRNZXNzYWdlcyh0aGlzLm5hbWUsIHtcbiAgICAgICAgc2luY2U6IHNpbmNlLFxuICAgICAgICBiZWZvcmU6IGJlZm9yZSxcbiAgICAgICAgbGltaXQ6IGxpbWl0IHx8IENvbnN0LkRFRkFVTFRfTUVTU0FHRVNfUEFHRVxuICAgICAgfSlcbiAgICAgIC50aGVuKChtc2dzKSA9PiB7XG4gICAgICAgIG1zZ3MuZm9yRWFjaCgoZGF0YSkgPT4ge1xuICAgICAgICAgIGlmIChkYXRhLnNlcSA+IHRoaXMuX21heFNlcSkge1xuICAgICAgICAgICAgdGhpcy5fbWF4U2VxID0gZGF0YS5zZXE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChkYXRhLnNlcSA8IHRoaXMuX21pblNlcSB8fCB0aGlzLl9taW5TZXEgPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fbWluU2VxID0gZGF0YS5zZXE7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1dChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChtc2dzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB0aGlzLl91cGRhdGVEZWxldGVkUmFuZ2VzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1zZ3MubGVuZ3RoO1xuICAgICAgfSk7XG4gIH1cbiAgLy8gUHVzaCBvciB7cHJlc306IG1lc3NhZ2UgcmVjZWl2ZWQuXG4gIF91cGRhdGVSZWNlaXZlZChzZXEsIGFjdCkge1xuICAgIHRoaXMudG91Y2hlZCA9IG5ldyBEYXRlKCk7XG4gICAgdGhpcy5zZXEgPSBzZXEgfCAwO1xuICAgIC8vIENoZWNrIGlmIG1lc3NhZ2UgaXMgc2VudCBieSB0aGUgY3VycmVudCB1c2VyLiBJZiBzbyBpdCdzIGJlZW4gcmVhZCBhbHJlYWR5LlxuICAgIGlmICghYWN0IHx8IHRoaXMuX3Rpbm9kZS5pc01lKGFjdCkpIHtcbiAgICAgIHRoaXMucmVhZCA9IHRoaXMucmVhZCA/IE1hdGgubWF4KHRoaXMucmVhZCwgdGhpcy5zZXEpIDogdGhpcy5zZXE7XG4gICAgICB0aGlzLnJlY3YgPSB0aGlzLnJlY3YgPyBNYXRoLm1heCh0aGlzLnJlYWQsIHRoaXMucmVjdikgOiB0aGlzLnJlYWQ7XG4gICAgfVxuICAgIHRoaXMudW5yZWFkID0gdGhpcy5zZXEgLSAodGhpcy5yZWFkIHwgMCk7XG4gICAgdGhpcy5fdGlub2RlLl9kYi51cGRUb3BpYyh0aGlzKTtcbiAgfVxufVxuXG5cbi8qKlxuICogQGNsYXNzIFRvcGljTWUgLSBzcGVjaWFsIGNhc2Ugb2Yge0BsaW5rIFRpbm9kZS5Ub3BpY30gZm9yXG4gKiBtYW5hZ2luZyBkYXRhIG9mIHRoZSBjdXJyZW50IHVzZXIsIGluY2x1ZGluZyBjb250YWN0IGxpc3QuXG4gKiBAZXh0ZW5kcyBUaW5vZGUuVG9waWNcbiAqIEBtZW1iZXJvZiBUaW5vZGVcbiAqXG4gKiBAcGFyYW0ge1RvcGljTWUuQ2FsbGJhY2tzfSBjYWxsYmFja3MgLSBDYWxsYmFja3MgdG8gcmVjZWl2ZSB2YXJpb3VzIGV2ZW50cy5cbiAqL1xuLyoqXG4gKiBAY2xhc3MgVG9waWNNZSAtIHNwZWNpYWwgY2FzZSBvZiB7QGxpbmsgVGlub2RlLlRvcGljfSBmb3JcbiAqIG1hbmFnaW5nIGRhdGEgb2YgdGhlIGN1cnJlbnQgdXNlciwgaW5jbHVkaW5nIGNvbnRhY3QgbGlzdC5cbiAqIEBleHRlbmRzIFRpbm9kZS5Ub3BpY1xuICogQG1lbWJlcm9mIFRpbm9kZVxuICpcbiAqIEBwYXJhbSB7VG9waWNNZS5DYWxsYmFja3N9IGNhbGxiYWNrcyAtIENhbGxiYWNrcyB0byByZWNlaXZlIHZhcmlvdXMgZXZlbnRzLlxuICovXG5leHBvcnQgY2xhc3MgVG9waWNNZSBleHRlbmRzIFRvcGljIHtcbiAgb25Db250YWN0VXBkYXRlO1xuXG4gIGNvbnN0cnVjdG9yKGNhbGxiYWNrcykge1xuICAgIHN1cGVyKENvbnN0LlRPUElDX01FLCBjYWxsYmFja3MpO1xuXG4gICAgLy8gbWUtc3BlY2lmaWMgY2FsbGJhY2tzXG4gICAgaWYgKGNhbGxiYWNrcykge1xuICAgICAgdGhpcy5vbkNvbnRhY3RVcGRhdGUgPSBjYWxsYmFja3Mub25Db250YWN0VXBkYXRlO1xuICAgIH1cbiAgfVxuXG4gIC8vIE92ZXJyaWRlIHRoZSBvcmlnaW5hbCBUb3BpYy5fcHJvY2Vzc01ldGFEZXNjLlxuICBfcHJvY2Vzc01ldGFEZXNjKGRlc2MpIHtcbiAgICAvLyBDaGVjayBpZiBvbmxpbmUgY29udGFjdHMgbmVlZCB0byBiZSB0dXJuZWQgb2ZmIGJlY2F1c2UgUCBwZXJtaXNzaW9uIHdhcyByZW1vdmVkLlxuICAgIGNvbnN0IHR1cm5PZmYgPSAoZGVzYy5hY3MgJiYgIWRlc2MuYWNzLmlzUHJlc2VuY2VyKCkpICYmICh0aGlzLmFjcyAmJiB0aGlzLmFjcy5pc1ByZXNlbmNlcigpKTtcblxuICAgIC8vIENvcHkgcGFyYW1ldGVycyBmcm9tIGRlc2Mgb2JqZWN0IHRvIHRoaXMgdG9waWMuXG4gICAgbWVyZ2VPYmoodGhpcywgZGVzYyk7XG4gICAgdGhpcy5fdGlub2RlLl9kYi51cGRUb3BpYyh0aGlzKTtcbiAgICAvLyBVcGRhdGUgY3VycmVudCB1c2VyJ3MgcmVjb3JkIGluIHRoZSBnbG9iYWwgY2FjaGUuXG4gICAgdGhpcy5fdXBkYXRlQ2FjaGVkVXNlcih0aGlzLl90aW5vZGUuX215VUlELCBkZXNjKTtcblxuICAgIC8vICdQJyBwZXJtaXNzaW9uIHdhcyByZW1vdmVkLiBBbGwgdG9waWNzIGFyZSBvZmZsaW5lIG5vdy5cbiAgICBpZiAodHVybk9mZikge1xuICAgICAgdGhpcy5fdGlub2RlLm1hcFRvcGljcygoY29udCkgPT4ge1xuICAgICAgICBpZiAoY29udC5vbmxpbmUpIHtcbiAgICAgICAgICBjb250Lm9ubGluZSA9IGZhbHNlO1xuICAgICAgICAgIGNvbnQuc2VlbiA9IE9iamVjdC5hc3NpZ24oY29udC5zZWVuIHx8IHt9LCB7XG4gICAgICAgICAgICB3aGVuOiBuZXcgRGF0ZSgpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5fcmVmcmVzaENvbnRhY3QoJ29mZicsIGNvbnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vbk1ldGFEZXNjKSB7XG4gICAgICB0aGlzLm9uTWV0YURlc2ModGhpcyk7XG4gICAgfVxuICB9XG5cbiAgLy8gT3ZlcnJpZGUgdGhlIG9yaWdpbmFsIFRvcGljLl9wcm9jZXNzTWV0YVN1YlxuICBfcHJvY2Vzc01ldGFTdWIoc3Vicykge1xuICAgIGxldCB1cGRhdGVDb3VudCA9IDA7XG4gICAgc3Vicy5mb3JFYWNoKChzdWIpID0+IHtcbiAgICAgIGNvbnN0IHRvcGljTmFtZSA9IHN1Yi50b3BpYztcbiAgICAgIC8vIERvbid0IHNob3cgJ21lJyBhbmQgJ2ZuZCcgdG9waWNzIGluIHRoZSBsaXN0IG9mIGNvbnRhY3RzLlxuICAgICAgaWYgKHRvcGljTmFtZSA9PSBDb25zdC5UT1BJQ19GTkQgfHwgdG9waWNOYW1lID09IENvbnN0LlRPUElDX01FKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHN1Yi5vbmxpbmUgPSAhIXN1Yi5vbmxpbmU7XG5cbiAgICAgIGxldCBjb250ID0gbnVsbDtcbiAgICAgIGlmIChzdWIuZGVsZXRlZCkge1xuICAgICAgICBjb250ID0gc3ViO1xuICAgICAgICB0aGlzLl90aW5vZGUuY2FjaGVSZW1Ub3BpYyh0b3BpY05hbWUpO1xuICAgICAgICB0aGlzLl90aW5vZGUuX2RiLnJlbVRvcGljKHRvcGljTmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBFbnN1cmUgdGhlIHZhbHVlcyBhcmUgZGVmaW5lZCBhbmQgYXJlIGludGVnZXJzLlxuICAgICAgICBpZiAodHlwZW9mIHN1Yi5zZXEgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBzdWIuc2VxID0gc3ViLnNlcSB8IDA7XG4gICAgICAgICAgc3ViLnJlY3YgPSBzdWIucmVjdiB8IDA7XG4gICAgICAgICAgc3ViLnJlYWQgPSBzdWIucmVhZCB8IDA7XG4gICAgICAgICAgc3ViLnVucmVhZCA9IHN1Yi5zZXEgLSBzdWIucmVhZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRvcGljID0gdGhpcy5fdGlub2RlLmdldFRvcGljKHRvcGljTmFtZSk7XG4gICAgICAgIGNvbnQgPSBtZXJnZU9iaih0b3BpYywgc3ViKTtcbiAgICAgICAgdGhpcy5fdGlub2RlLl9kYi51cGRUb3BpYyhjb250KTtcblxuICAgICAgICBpZiAoVG9waWMuaXNQMlBUb3BpY05hbWUodG9waWNOYW1lKSkge1xuICAgICAgICAgIHRoaXMuX2NhY2hlUHV0VXNlcih0b3BpY05hbWUsIGNvbnQpO1xuICAgICAgICAgIHRoaXMuX3Rpbm9kZS5fZGIudXBkVXNlcih0b3BpY05hbWUsIGNvbnQucHVibGljKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBOb3RpZnkgdG9waWMgb2YgdGhlIHVwZGF0ZSBpZiBpdCdzIGFuIGV4dGVybmFsIHVwZGF0ZS5cbiAgICAgICAgaWYgKCFzdWIuX25vRm9yd2FyZGluZyAmJiB0b3BpYykge1xuICAgICAgICAgIHN1Yi5fbm9Gb3J3YXJkaW5nID0gdHJ1ZTtcbiAgICAgICAgICB0b3BpYy5fcHJvY2Vzc01ldGFEZXNjKHN1Yik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdXBkYXRlQ291bnQrKztcblxuICAgICAgaWYgKHRoaXMub25NZXRhU3ViKSB7XG4gICAgICAgIHRoaXMub25NZXRhU3ViKGNvbnQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMub25TdWJzVXBkYXRlZCAmJiB1cGRhdGVDb3VudCA+IDApIHtcbiAgICAgIGNvbnN0IGtleXMgPSBbXTtcbiAgICAgIHN1YnMuZm9yRWFjaCgocykgPT4ge1xuICAgICAgICBrZXlzLnB1c2gocy50b3BpYyk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMub25TdWJzVXBkYXRlZChrZXlzLCB1cGRhdGVDb3VudCk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2FsbGVkIGJ5IFRpbm9kZSB3aGVuIG1ldGEuc3ViIGlzIHJlY2l2ZWQuXG4gIF9wcm9jZXNzTWV0YUNyZWRzKGNyZWRzLCB1cGQpIHtcbiAgICBpZiAoY3JlZHMubGVuZ3RoID09IDEgJiYgY3JlZHNbMF0gPT0gQ29uc3QuREVMX0NIQVIpIHtcbiAgICAgIGNyZWRzID0gW107XG4gICAgfVxuICAgIGlmICh1cGQpIHtcbiAgICAgIGNyZWRzLmZvckVhY2goKGNyKSA9PiB7XG4gICAgICAgIGlmIChjci52YWwpIHtcbiAgICAgICAgICAvLyBBZGRpbmcgYSBjcmVkZW50aWFsLlxuICAgICAgICAgIGxldCBpZHggPSB0aGlzLl9jcmVkZW50aWFscy5maW5kSW5kZXgoKGVsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZWwubWV0aCA9PSBjci5tZXRoICYmIGVsLnZhbCA9PSBjci52YWw7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGlkeCA8IDApIHtcbiAgICAgICAgICAgIC8vIE5vdCBmb3VuZC5cbiAgICAgICAgICAgIGlmICghY3IuZG9uZSkge1xuICAgICAgICAgICAgICAvLyBVbmNvbmZpcm1lZCBjcmVkZW50aWFsIHJlcGxhY2VzIHByZXZpb3VzIHVuY29uZmlybWVkIGNyZWRlbnRpYWwgb2YgdGhlIHNhbWUgbWV0aG9kLlxuICAgICAgICAgICAgICBpZHggPSB0aGlzLl9jcmVkZW50aWFscy5maW5kSW5kZXgoKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsLm1ldGggPT0gY3IubWV0aCAmJiAhZWwuZG9uZTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBwcmV2aW91cyB1bmNvbmZpcm1lZCBjcmVkZW50aWFsLlxuICAgICAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9jcmVkZW50aWFscy5wdXNoKGNyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRm91bmQuIE1heWJlIGNoYW5nZSAnZG9uZScgc3RhdHVzLlxuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHNbaWR4XS5kb25lID0gY3IuZG9uZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY3IucmVzcCkge1xuICAgICAgICAgIC8vIEhhbmRsZSBjcmVkZW50aWFsIGNvbmZpcm1hdGlvbi5cbiAgICAgICAgICBjb25zdCBpZHggPSB0aGlzLl9jcmVkZW50aWFscy5maW5kSW5kZXgoKGVsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZWwubWV0aCA9PSBjci5tZXRoICYmICFlbC5kb25lO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHNbaWR4XS5kb25lID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jcmVkZW50aWFscyA9IGNyZWRzO1xuICAgIH1cbiAgICBpZiAodGhpcy5vbkNyZWRzVXBkYXRlZCkge1xuICAgICAgdGhpcy5vbkNyZWRzVXBkYXRlZCh0aGlzLl9jcmVkZW50aWFscyk7XG4gICAgfVxuICB9XG5cbiAgLy8gUHJvY2VzcyBwcmVzZW5jZSBjaGFuZ2UgbWVzc2FnZVxuICBfcm91dGVQcmVzKHByZXMpIHtcbiAgICBpZiAocHJlcy53aGF0ID09ICd0ZXJtJykge1xuICAgICAgLy8gVGhlICdtZScgdG9waWMgaXRzZWxmIGlzIGRldGFjaGVkLiBNYXJrIGFzIHVuc3Vic2NyaWJlZC5cbiAgICAgIHRoaXMuX3Jlc2V0U3ViKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHByZXMud2hhdCA9PSAndXBkJyAmJiBwcmVzLnNyYyA9PSBDb25zdC5UT1BJQ19NRSkge1xuICAgICAgLy8gVXBkYXRlIHRvIG1lJ3MgZGVzY3JpcHRpb24uIFJlcXVlc3QgdXBkYXRlZCB2YWx1ZS5cbiAgICAgIHRoaXMuZ2V0TWV0YSh0aGlzLnN0YXJ0TWV0YVF1ZXJ5KCkud2l0aERlc2MoKS5idWlsZCgpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ID0gdGhpcy5fdGlub2RlLmNhY2hlR2V0VG9waWMocHJlcy5zcmMpO1xuICAgIGlmIChjb250KSB7XG4gICAgICBzd2l0Y2ggKHByZXMud2hhdCkge1xuICAgICAgICBjYXNlICdvbic6IC8vIHRvcGljIGNhbWUgb25saW5lXG4gICAgICAgICAgY29udC5vbmxpbmUgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdvZmYnOiAvLyB0b3BpYyB3ZW50IG9mZmxpbmVcbiAgICAgICAgICBpZiAoY29udC5vbmxpbmUpIHtcbiAgICAgICAgICAgIGNvbnQub25saW5lID0gZmFsc2U7XG4gICAgICAgICAgICBjb250LnNlZW4gPSBPYmplY3QuYXNzaWduKGNvbnQuc2VlbiB8fCB7fSwge1xuICAgICAgICAgICAgICB3aGVuOiBuZXcgRGF0ZSgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21zZyc6IC8vIG5ldyBtZXNzYWdlIHJlY2VpdmVkXG4gICAgICAgICAgY29udC5fdXBkYXRlUmVjZWl2ZWQocHJlcy5zZXEsIHByZXMuYWN0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndXBkJzogLy8gZGVzYyB1cGRhdGVkXG4gICAgICAgICAgLy8gUmVxdWVzdCB1cGRhdGVkIHN1YnNjcmlwdGlvbi5cbiAgICAgICAgICB0aGlzLmdldE1ldGEodGhpcy5zdGFydE1ldGFRdWVyeSgpLndpdGhMYXRlck9uZVN1YihwcmVzLnNyYykuYnVpbGQoKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Fjcyc6IC8vIGFjY2VzcyBtb2RlIGNoYW5nZWRcbiAgICAgICAgICBpZiAoY29udC5hY3MpIHtcbiAgICAgICAgICAgIGNvbnQuYWNzLnVwZGF0ZUFsbChwcmVzLmRhY3MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250LmFjcyA9IG5ldyBBY2Nlc3NNb2RlKCkudXBkYXRlQWxsKHByZXMuZGFjcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnQudG91Y2hlZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3VhJzpcbiAgICAgICAgICAvLyB1c2VyIGFnZW50IGNoYW5nZWQuXG4gICAgICAgICAgY29udC5zZWVuID0ge1xuICAgICAgICAgICAgd2hlbjogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIHVhOiBwcmVzLnVhXG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmVjdic6XG4gICAgICAgICAgLy8gdXNlcidzIG90aGVyIHNlc3Npb24gbWFya2VkIHNvbWUgbWVzc2dlcyBhcyByZWNlaXZlZC5cbiAgICAgICAgICBwcmVzLnNlcSA9IHByZXMuc2VxIHwgMDtcbiAgICAgICAgICBjb250LnJlY3YgPSBjb250LnJlY3YgPyBNYXRoLm1heChjb250LnJlY3YsIHByZXMuc2VxKSA6IHByZXMuc2VxO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZWFkJzpcbiAgICAgICAgICAvLyB1c2VyJ3Mgb3RoZXIgc2Vzc2lvbiBtYXJrZWQgc29tZSBtZXNzYWdlcyBhcyByZWFkLlxuICAgICAgICAgIHByZXMuc2VxID0gcHJlcy5zZXEgfCAwO1xuICAgICAgICAgIGNvbnQucmVhZCA9IGNvbnQucmVhZCA/IE1hdGgubWF4KGNvbnQucmVhZCwgcHJlcy5zZXEpIDogcHJlcy5zZXE7XG4gICAgICAgICAgY29udC5yZWN2ID0gY29udC5yZWN2ID8gTWF0aC5tYXgoY29udC5yZWFkLCBjb250LnJlY3YpIDogY29udC5yZWN2O1xuICAgICAgICAgIGNvbnQudW5yZWFkID0gY29udC5zZXEgLSBjb250LnJlYWQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2dvbmUnOlxuICAgICAgICAgIC8vIHRvcGljIGRlbGV0ZWQgb3IgdW5zdWJzY3JpYmVkIGZyb20uXG4gICAgICAgICAgaWYgKCFjb250Ll9kZWxldGVkKSB7XG4gICAgICAgICAgICBjb250Ll9kZWxldGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnQuX2F0dGFjaGVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl90aW5vZGUuX2RiLm1hcmtUb3BpY0FzRGVsZXRlZChwcmVzLnNyYywgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZWwnOlxuICAgICAgICAgIC8vIFVwZGF0ZSB0b3BpYy5kZWwgdmFsdWUuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5fdGlub2RlLmxvZ2dlcihcIklORk86IFVuc3VwcG9ydGVkIHByZXNlbmNlIHVwZGF0ZSBpbiAnbWUnXCIsIHByZXMud2hhdCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3JlZnJlc2hDb250YWN0KHByZXMud2hhdCwgY29udCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwcmVzLndoYXQgPT0gJ2FjcycpIHtcbiAgICAgICAgLy8gTmV3IHN1YnNjcmlwdGlvbnMgYW5kIGRlbGV0ZWQvYmFubmVkIHN1YnNjcmlwdGlvbnMgaGF2ZSBmdWxsXG4gICAgICAgIC8vIGFjY2VzcyBtb2RlIChubyArIG9yIC0gaW4gdGhlIGRhY3Mgc3RyaW5nKS4gQ2hhbmdlcyB0byBrbm93biBzdWJzY3JpcHRpb25zIGFyZSBzZW50IGFzXG4gICAgICAgIC8vIGRlbHRhcywgYnV0IHRoZXkgc2hvdWxkIG5vdCBoYXBwZW4gaGVyZS5cbiAgICAgICAgY29uc3QgYWNzID0gbmV3IEFjY2Vzc01vZGUocHJlcy5kYWNzKTtcbiAgICAgICAgaWYgKCFhY3MgfHwgYWNzLm1vZGUgPT0gQWNjZXNzTW9kZS5fSU5WQUxJRCkge1xuICAgICAgICAgIHRoaXMuX3Rpbm9kZS5sb2dnZXIoXCJFUlJPUjogSW52YWxpZCBhY2Nlc3MgbW9kZSB1cGRhdGVcIiwgcHJlcy5zcmMsIHByZXMuZGFjcyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGFjcy5tb2RlID09IEFjY2Vzc01vZGUuX05PTkUpIHtcbiAgICAgICAgICB0aGlzLl90aW5vZGUubG9nZ2VyKFwiV0FSTklORzogUmVtb3Zpbmcgbm9uLWV4aXN0ZW50IHN1YnNjcmlwdGlvblwiLCBwcmVzLnNyYywgcHJlcy5kYWNzKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTmV3IHN1YnNjcmlwdGlvbi4gU2VuZCByZXF1ZXN0IGZvciB0aGUgZnVsbCBkZXNjcmlwdGlvbi5cbiAgICAgICAgICAvLyBVc2luZyAud2l0aE9uZVN1YiAobm90IC53aXRoTGF0ZXJPbmVTdWIpIHRvIG1ha2Ugc3VyZSBJZk1vZGlmaWVkU2luY2UgaXMgbm90IHNldC5cbiAgICAgICAgICB0aGlzLmdldE1ldGEodGhpcy5zdGFydE1ldGFRdWVyeSgpLndpdGhPbmVTdWIodW5kZWZpbmVkLCBwcmVzLnNyYykuYnVpbGQoKSk7XG4gICAgICAgICAgLy8gQ3JlYXRlIGEgZHVtbXkgZW50cnkgdG8gY2F0Y2ggb25saW5lIHN0YXR1cyB1cGRhdGUuXG4gICAgICAgICAgY29uc3QgZHVtbXkgPSB0aGlzLl90aW5vZGUuZ2V0VG9waWMocHJlcy5zcmMpO1xuICAgICAgICAgIGR1bW15LnRvcGljID0gcHJlcy5zcmM7XG4gICAgICAgICAgZHVtbXkub25saW5lID0gZmFsc2U7XG4gICAgICAgICAgZHVtbXkuYWNzID0gYWNzO1xuICAgICAgICAgIHRoaXMuX3Rpbm9kZS5fZGIudXBkVG9waWMoZHVtbXkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHByZXMud2hhdCA9PSAndGFncycpIHtcbiAgICAgICAgdGhpcy5nZXRNZXRhKHRoaXMuc3RhcnRNZXRhUXVlcnkoKS53aXRoVGFncygpLmJ1aWxkKCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLm9uUHJlcykge1xuICAgICAgdGhpcy5vblByZXMocHJlcyk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ29udGFjdCBpcyB1cGRhdGVkLCBleGVjdXRlIGNhbGxiYWNrcy5cbiAgX3JlZnJlc2hDb250YWN0KHdoYXQsIGNvbnQpIHtcbiAgICBpZiAodGhpcy5vbkNvbnRhY3RVcGRhdGUpIHtcbiAgICAgIHRoaXMub25Db250YWN0VXBkYXRlKHdoYXQsIGNvbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQdWJsaXNoaW5nIHRvIFRvcGljTWUgaXMgbm90IHN1cHBvcnRlZC4ge0BsaW5rIFRvcGljI3B1Ymxpc2h9IGlzIG92ZXJyaWRlbiBhbmQgdGhvd3MgYW4ge0Vycm9yfSBpZiBjYWxsZWQuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWNNZSNcbiAgICogQHRocm93cyB7RXJyb3J9IEFsd2F5cyB0aHJvd3MgYW4gZXJyb3IuXG4gICAqL1xuICBwdWJsaXNoKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJQdWJsaXNoaW5nIHRvICdtZScgaXMgbm90IHN1cHBvcnRlZFwiKSk7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIHZhbGlkYXRpb24gY3JlZGVudGlhbC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpY01lI1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdG9waWMgLSBOYW1lIG9mIHRoZSB0b3BpYyB0byBkZWxldGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXIgLSBVc2VyIElEIHRvIHJlbW92ZS5cbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCBvbiByZWNlaXZpbmcgc2VydmVyIHJlcGx5LlxuICAgKi9cbiAgZGVsQ3JlZGVudGlhbChtZXRob2QsIHZhbHVlKSB7XG4gICAgaWYgKCF0aGlzLl9hdHRhY2hlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIkNhbm5vdCBkZWxldGUgY3JlZGVudGlhbCBpbiBpbmFjdGl2ZSAnbWUnIHRvcGljXCIpKTtcbiAgICB9XG4gICAgLy8gU2VuZCB7ZGVsfSBtZXNzYWdlLCByZXR1cm4gcHJvbWlzZVxuICAgIHJldHVybiB0aGlzLl90aW5vZGUuZGVsQ3JlZGVudGlhbChtZXRob2QsIHZhbHVlKS50aGVuKChjdHJsKSA9PiB7XG4gICAgICAvLyBSZW1vdmUgZGVsZXRlZCBjcmVkZW50aWFsIGZyb20gdGhlIGNhY2hlLlxuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9jcmVkZW50aWFscy5maW5kSW5kZXgoKGVsKSA9PiB7XG4gICAgICAgIHJldHVybiBlbC5tZXRoID09IG1ldGhvZCAmJiBlbC52YWwgPT0gdmFsdWU7XG4gICAgICB9KTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgICAvLyBOb3RpZnkgbGlzdGVuZXJzXG4gICAgICBpZiAodGhpcy5vbkNyZWRzVXBkYXRlZCkge1xuICAgICAgICB0aGlzLm9uQ3JlZHNVcGRhdGVkKHRoaXMuX2NyZWRlbnRpYWxzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjdHJsO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBjYWxsYmFjayBjb250YWN0RmlsdGVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250YWN0IHRvIGNoZWNrIGZvciBpbmNsdXNpb24uXG4gICAqIEByZXR1cm5zIHtib29sZWFufSA8Y29kZT50cnVlPC9jb2RlPiBpZiBjb250YWN0IHNob3VsZCBiZSBwcm9jZXNzZWQsIDxjb2RlPmZhbHNlPC9jb2RlPiB0byBleGNsdWRlIGl0LlxuICAgKi9cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb3ZlciBjYWNoZWQgY29udGFjdHMuXG4gICAqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljTWUjXG4gICAqIEBwYXJhbSB7VG9waWNNZS5Db250YWN0Q2FsbGJhY2t9IGNhbGxiYWNrIC0gQ2FsbGJhY2sgdG8gY2FsbCBmb3IgZWFjaCBjb250YWN0LlxuICAgKiBAcGFyYW0ge2NvbnRhY3RGaWx0ZXI9fSBmaWx0ZXIgLSBPcHRpb25hbGx5IGZpbHRlciBjb250YWN0czsgaW5jbHVkZSBhbGwgaWYgZmlsdGVyIGlzIGZhbHNlLWlzaCwgb3RoZXJ3aXNlXG4gICAqICAgICAgaW5jbHVkZSB0aG9zZSBmb3Igd2hpY2ggZmlsdGVyIHJldHVybnMgdHJ1ZS1pc2guXG4gICAqIEBwYXJhbSB7T2JqZWN0PX0gY29udGV4dCAtIENvbnRleHQgdG8gdXNlIGZvciBjYWxsaW5nIHRoZSBgY2FsbGJhY2tgLCBpLmUuIHRoZSB2YWx1ZSBvZiBgdGhpc2AgaW5zaWRlIHRoZSBjYWxsYmFjay5cbiAgICovXG4gIGNvbnRhY3RzKGNhbGxiYWNrLCBmaWx0ZXIsIGNvbnRleHQpIHtcbiAgICB0aGlzLl90aW5vZGUubWFwVG9waWNzKChjLCBpZHgpID0+IHtcbiAgICAgIGlmIChjLmlzQ29tbVR5cGUoKSAmJiAoIWZpbHRlciB8fCBmaWx0ZXIoYykpKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgYywgaWR4KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBjb250YWN0IGZyb20gY2FjaGUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWNNZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBjb250YWN0IHRvIGdldCwgZWl0aGVyIGEgVUlEIChmb3IgcDJwIHRvcGljcykgb3IgYSB0b3BpYyBuYW1lLlxuICAgKiBAcmV0dXJucyB7VGlub2RlLkNvbnRhY3R9IC0gQ29udGFjdCBvciBgdW5kZWZpbmVkYC5cbiAgICovXG4gIGdldENvbnRhY3QobmFtZSkge1xuICAgIHJldHVybiB0aGlzLl90aW5vZGUuY2FjaGVHZXRUb3BpYyhuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWNjZXNzIG1vZGUgb2YgYSBnaXZlbiBjb250YWN0IGZyb20gY2FjaGUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWNNZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBjb250YWN0IHRvIGdldCBhY2Nlc3MgbW9kZSBmb3IsIGVpdGhlciBhIFVJRCAoZm9yIHAycCB0b3BpY3MpXG4gICAqICAgICAgICBvciBhIHRvcGljIG5hbWU7IGlmIG1pc3NpbmcsIGFjY2VzcyBtb2RlIGZvciB0aGUgJ21lJyB0b3BpYyBpdHNlbGYuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gYWNjZXNzIG1vZGUsIHN1Y2ggYXMgYFJXUGAuXG4gICAqL1xuICBnZXRBY2Nlc3NNb2RlKG5hbWUpIHtcbiAgICBpZiAobmFtZSkge1xuICAgICAgY29uc3QgY29udCA9IHRoaXMuX3Rpbm9kZS5jYWNoZUdldFRvcGljKG5hbWUpO1xuICAgICAgcmV0dXJuIGNvbnQgPyBjb250LmFjcyA6IG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFjcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBjb250YWN0IGlzIGFyY2hpdmVkLCBpLmUuIGNvbnRhY3QucHJpdmF0ZS5hcmNoID09IHRydWUuXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWNNZSNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBjb250YWN0IHRvIGNoZWNrIGFyY2hpdmVkIHN0YXR1cywgZWl0aGVyIGEgVUlEIChmb3IgcDJwIHRvcGljcykgb3IgYSB0b3BpYyBuYW1lLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSB0cnVlIGlmIGNvbnRhY3QgaXMgYXJjaGl2ZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIGlzQXJjaGl2ZWQobmFtZSkge1xuICAgIGNvbnN0IGNvbnQgPSB0aGlzLl90aW5vZGUuY2FjaGVHZXRUb3BpYyhuYW1lKTtcbiAgICByZXR1cm4gY29udCAmJiBjb250LnByaXZhdGUgJiYgISFjb250LnByaXZhdGUuYXJjaDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiBUaW5vZGUuQ3JlZGVudGlhbFxuICAgKiBAbWVtYmVyb2YgVGlub2RlXG4gICAqIEB0eXBlIE9iamVjdFxuICAgKiBAcHJvcGVydHkge3N0cmluZ30gbWV0aCAtIHZhbGlkYXRpb24gbWV0aG9kIHN1Y2ggYXMgJ2VtYWlsJyBvciAndGVsJy5cbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IHZhbCAtIGNyZWRlbnRpYWwgdmFsdWUsIGkuZS4gJ2pkb2VAZXhhbXBsZS5jb20nIG9yICcrMTcwMjU1NTEyMzQnXG4gICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gZG9uZSAtIHRydWUgaWYgY3JlZGVudGlhbCBpcyB2YWxpZGF0ZWQuXG4gICAqL1xuICAvKipcbiAgICogR2V0IHRoZSB1c2VyJ3MgY3JlZGVudGlhbHM6IGVtYWlsLCBwaG9uZSwgZXRjLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljTWUjXG4gICAqXG4gICAqIEByZXR1cm5zIHtUaW5vZGUuQ3JlZGVudGlhbFtdfSAtIGFycmF5IG9mIGNyZWRlbnRpYWxzLlxuICAgKi9cbiAgZ2V0Q3JlZGVudGlhbHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NyZWRlbnRpYWxzO1xuICB9XG59XG5cbi8qKlxuICogQGNsYXNzIFRvcGljRm5kIC0gc3BlY2lhbCBjYXNlIG9mIHtAbGluayBUaW5vZGUuVG9waWN9IGZvciBzZWFyY2hpbmcgZm9yXG4gKiBjb250YWN0cyBhbmQgZ3JvdXAgdG9waWNzLlxuICogQGV4dGVuZHMgVGlub2RlLlRvcGljXG4gKiBAbWVtYmVyb2YgVGlub2RlXG4gKlxuICogQHBhcmFtIHtUb3BpY0ZuZC5DYWxsYmFja3N9IGNhbGxiYWNrcyAtIENhbGxiYWNrcyB0byByZWNlaXZlIHZhcmlvdXMgZXZlbnRzLlxuICovXG5leHBvcnQgY2xhc3MgVG9waWNGbmQgZXh0ZW5kcyBUb3BpYyB7XG4gIC8vIExpc3Qgb2YgdXNlcnMgYW5kIHRvcGljcyB1aWQgb3IgdG9waWNfbmFtZSAtPiBDb250YWN0IG9iamVjdClcbiAgX2NvbnRhY3RzID0ge307XG5cbiAgY29uc3RydWN0b3IoY2FsbGJhY2tzKSB7XG4gICAgc3VwZXIoQ29uc3QuVE9QSUNfRk5ELCBjYWxsYmFja3MpO1xuICB9XG5cbiAgLy8gT3ZlcnJpZGUgdGhlIG9yaWdpbmFsIFRvcGljLl9wcm9jZXNzTWV0YVN1YlxuICBfcHJvY2Vzc01ldGFTdWIoc3Vicykge1xuICAgIGxldCB1cGRhdGVDb3VudCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMuX2NvbnRhY3RzKS5sZW5ndGg7XG4gICAgLy8gUmVzZXQgY29udGFjdCBsaXN0LlxuICAgIHRoaXMuX2NvbnRhY3RzID0ge307XG4gICAgZm9yIChsZXQgaWR4IGluIHN1YnMpIHtcbiAgICAgIGxldCBzdWIgPSBzdWJzW2lkeF07XG4gICAgICBjb25zdCBpbmRleEJ5ID0gc3ViLnRvcGljID8gc3ViLnRvcGljIDogc3ViLnVzZXI7XG5cbiAgICAgIHN1YiA9IG1lcmdlVG9DYWNoZSh0aGlzLl9jb250YWN0cywgaW5kZXhCeSwgc3ViKTtcbiAgICAgIHVwZGF0ZUNvdW50Kys7XG5cbiAgICAgIGlmICh0aGlzLm9uTWV0YVN1Yikge1xuICAgICAgICB0aGlzLm9uTWV0YVN1YihzdWIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh1cGRhdGVDb3VudCA+IDAgJiYgdGhpcy5vblN1YnNVcGRhdGVkKSB7XG4gICAgICB0aGlzLm9uU3Vic1VwZGF0ZWQoT2JqZWN0LmtleXModGhpcy5fY29udGFjdHMpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHVibGlzaGluZyB0byBUb3BpY0ZuZCBpcyBub3Qgc3VwcG9ydGVkLiB7QGxpbmsgVG9waWMjcHVibGlzaH0gaXMgb3ZlcnJpZGVuIGFuZCB0aG93cyBhbiB7RXJyb3J9IGlmIGNhbGxlZC5cbiAgICogQG1lbWJlcm9mIFRpbm9kZS5Ub3BpY0ZuZCNcbiAgICogQHRocm93cyB7RXJyb3J9IEFsd2F5cyB0aHJvd3MgYW4gZXJyb3IuXG4gICAqL1xuICBwdWJsaXNoKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJQdWJsaXNoaW5nIHRvICdmbmQnIGlzIG5vdCBzdXBwb3J0ZWRcIikpO1xuICB9XG5cbiAgLyoqXG4gICAqIHNldE1ldGEgdG8gVG9waWNGbmQgcmVzZXRzIGNvbnRhY3QgbGlzdCBpbiBhZGRpdGlvbiB0byBzZW5kaW5nIHRoZSBtZXNzYWdlLlxuICAgKiBAbWVtYmVyb2YgVGlub2RlLlRvcGljRm5kI1xuICAgKiBAcGFyYW0ge1Rpbm9kZS5TZXRQYXJhbXN9IHBhcmFtcyBwYXJhbWV0ZXJzIHRvIHVwZGF0ZS5cbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgdG8gYmUgcmVzb2x2ZWQvcmVqZWN0ZWQgd2hlbiB0aGUgc2VydmVyIHJlc3BvbmRzIHRvIHJlcXVlc3QuXG4gICAqL1xuICBzZXRNZXRhKHBhcmFtcykge1xuICAgIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoVG9waWNGbmQucHJvdG90eXBlKS5zZXRNZXRhLmNhbGwodGhpcywgcGFyYW1zKS50aGVuKCgpID0+IHtcbiAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLl9jb250YWN0cykubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLl9jb250YWN0cyA9IHt9O1xuICAgICAgICBpZiAodGhpcy5vblN1YnNVcGRhdGVkKSB7XG4gICAgICAgICAgdGhpcy5vblN1YnNVcGRhdGVkKFtdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb3ZlciBmb3VuZCBjb250YWN0cy4gSWYgY2FsbGJhY2sgaXMgdW5kZWZpbmVkLCB1c2Uge0BsaW5rIHRoaXMub25NZXRhU3VifS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBtZW1iZXJvZiBUaW5vZGUuVG9waWNGbmQjXG4gICAqIEBwYXJhbSB7VG9waWNGbmQuQ29udGFjdENhbGxiYWNrfSBjYWxsYmFjayAtIENhbGxiYWNrIHRvIGNhbGwgZm9yIGVhY2ggY29udGFjdC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSBDb250ZXh0IHRvIHVzZSBmb3IgY2FsbGluZyB0aGUgYGNhbGxiYWNrYCwgaS5lLiB0aGUgdmFsdWUgb2YgYHRoaXNgIGluc2lkZSB0aGUgY2FsbGJhY2suXG4gICAqL1xuICBjb250YWN0cyhjYWxsYmFjaywgY29udGV4dCkge1xuICAgIGNvbnN0IGNiID0gKGNhbGxiYWNrIHx8IHRoaXMub25NZXRhU3ViKTtcbiAgICBpZiAoY2IpIHtcbiAgICAgIGZvciAobGV0IGlkeCBpbiB0aGlzLl9jb250YWN0cykge1xuICAgICAgICBjYi5jYWxsKGNvbnRleHQsIHRoaXMuX2NvbnRhY3RzW2lkeF0sIGlkeCwgdGhpcy5fY29udGFjdHMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiLyoqXG4gKiBAZmlsZSBVdGlsaXRpZXMgdXNlZCBpbiBtdWx0aXBsZSBwbGFjZXMuXG4gKlxuICogQGNvcHlyaWdodCAyMDE1LTIwMjIgVGlub2RlIExMQy5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgQWNjZXNzTW9kZSBmcm9tICcuL2FjY2Vzcy1tb2RlLmpzJztcbmltcG9ydCBERUxfQ0hBUiBmcm9tICcuL2NvbmZpZy5qcyc7XG5cbi8vIEF0dGVtcHQgdG8gY29udmVydCBkYXRlIGFuZCBBY2Nlc3NNb2RlIHN0cmluZ3MgdG8gb2JqZWN0cy5cbmV4cG9ydCBmdW5jdGlvbiBqc29uUGFyc2VIZWxwZXIoa2V5LCB2YWwpIHtcbiAgLy8gVHJ5IHRvIGNvbnZlcnQgc3RyaW5nIHRpbWVzdGFtcHMgd2l0aCBvcHRpb25hbCBtaWxsaXNlY29uZHMgdG8gRGF0ZSxcbiAgLy8gZS5nLiAyMDE1LTA5LTAyVDAxOjQ1OjQzWy4xMjNdWlxuICBpZiAodHlwZW9mIHZhbCA9PSAnc3RyaW5nJyAmJiB2YWwubGVuZ3RoID49IDIwICYmIHZhbC5sZW5ndGggPD0gMjQgJiYgWyd0cycsICd0b3VjaGVkJywgJ3VwZGF0ZWQnLCAnY3JlYXRlZCcsICd3aGVuJywgJ2RlbGV0ZWQnLCAnZXhwaXJlcyddLmluY2x1ZGVzKGtleSkpIHtcblxuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWwpO1xuICAgIGlmICghaXNOYU4oZGF0ZSkpIHtcbiAgICAgIHJldHVybiBkYXRlO1xuICAgIH1cbiAgfSBlbHNlIGlmIChrZXkgPT09ICdhY3MnICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG5ldyBBY2Nlc3NNb2RlKHZhbCk7XG4gIH1cbiAgcmV0dXJuIHZhbDtcbn1cblxuLy8gQ2hlY2tzIGlmIFVSTCBpcyBhIHJlbGF0aXZlIHVybCwgaS5lLiBoYXMgbm8gJ3NjaGVtZTovLycsIGluY2x1ZGluZyB0aGUgY2FzZSBvZiBtaXNzaW5nIHNjaGVtZSAnLy8nLlxuLy8gVGhlIHNjaGVtZSBpcyBleHBlY3RlZCB0byBiZSBSRkMtY29tcGxpYW50LCBlLmcuIFthLXpdW2EtejAtOSsuLV0qXG4vLyBleGFtcGxlLmh0bWwgLSBva1xuLy8gaHR0cHM6ZXhhbXBsZS5jb20gLSBub3Qgb2suXG4vLyBodHRwOi9leGFtcGxlLmNvbSAtIG5vdCBvay5cbi8vICcg4oayIGh0dHBzOi8vZXhhbXBsZS5jb20nIC0gbm90IG9rLiAo4oayIG1lYW5zIGNhcnJpYWdlIHJldHVybilcbmV4cG9ydCBmdW5jdGlvbiBpc1VybFJlbGF0aXZlKHVybCkge1xuICByZXR1cm4gdXJsICYmICEvXlxccyooW2Etel1bYS16MC05Ky4tXSo6fFxcL1xcLykvaW0udGVzdCh1cmwpO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkRGF0ZShkKSB7XG4gIHJldHVybiAoZCBpbnN0YW5jZW9mIERhdGUpICYmICFpc05hTihkKSAmJiAoZC5nZXRUaW1lKCkgIT0gMCk7XG59XG5cbi8vIFJGQzMzMzkgZm9ybWF0ZXIgb2YgRGF0ZVxuZXhwb3J0IGZ1bmN0aW9uIHJmYzMzMzlEYXRlU3RyaW5nKGQpIHtcbiAgaWYgKCFpc1ZhbGlkRGF0ZShkKSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBjb25zdCBwYWQgPSBmdW5jdGlvbih2YWwsIHNwKSB7XG4gICAgc3AgPSBzcCB8fCAyO1xuICAgIHJldHVybiAnMCcucmVwZWF0KHNwIC0gKCcnICsgdmFsKS5sZW5ndGgpICsgdmFsO1xuICB9O1xuXG4gIGNvbnN0IG1pbGxpcyA9IGQuZ2V0VVRDTWlsbGlzZWNvbmRzKCk7XG4gIHJldHVybiBkLmdldFVUQ0Z1bGxZZWFyKCkgKyAnLScgKyBwYWQoZC5nZXRVVENNb250aCgpICsgMSkgKyAnLScgKyBwYWQoZC5nZXRVVENEYXRlKCkpICtcbiAgICAnVCcgKyBwYWQoZC5nZXRVVENIb3VycygpKSArICc6JyArIHBhZChkLmdldFVUQ01pbnV0ZXMoKSkgKyAnOicgKyBwYWQoZC5nZXRVVENTZWNvbmRzKCkpICtcbiAgICAobWlsbGlzID8gJy4nICsgcGFkKG1pbGxpcywgMykgOiAnJykgKyAnWic7XG59XG5cbi8vIFJlY3Vyc2l2ZWx5IG1lcmdlIHNyYydzIG93biBwcm9wZXJ0aWVzIHRvIGRzdC5cbi8vIElnbm9yZSBwcm9wZXJ0aWVzIHdoZXJlIGlnbm9yZVtwcm9wZXJ0eV0gaXMgdHJ1ZS5cbi8vIEFycmF5IGFuZCBEYXRlIG9iamVjdHMgYXJlIHNoYWxsb3ctY29waWVkLlxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlT2JqKGRzdCwgc3JjLCBpZ25vcmUpIHtcbiAgaWYgKHR5cGVvZiBzcmMgIT0gJ29iamVjdCcpIHtcbiAgICBpZiAoc3JjID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuICAgIGlmIChzcmMgPT09IERFTF9DSEFSKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gc3JjO1xuICB9XG4gIC8vIEpTIGlzIGNyYXp5OiB0eXBlb2YgbnVsbCBpcyAnb2JqZWN0Jy5cbiAgaWYgKHNyYyA9PT0gbnVsbCkge1xuICAgIHJldHVybiBzcmM7XG4gIH1cblxuICAvLyBIYW5kbGUgRGF0ZVxuICBpZiAoc3JjIGluc3RhbmNlb2YgRGF0ZSAmJiAhaXNOYU4oc3JjKSkge1xuICAgIHJldHVybiAoIWRzdCB8fCAhKGRzdCBpbnN0YW5jZW9mIERhdGUpIHx8IGlzTmFOKGRzdCkgfHwgZHN0IDwgc3JjKSA/IHNyYyA6IGRzdDtcbiAgfVxuXG4gIC8vIEFjY2VzcyBtb2RlXG4gIGlmIChzcmMgaW5zdGFuY2VvZiBBY2Nlc3NNb2RlKSB7XG4gICAgcmV0dXJuIG5ldyBBY2Nlc3NNb2RlKHNyYyk7XG4gIH1cblxuICAvLyBIYW5kbGUgQXJyYXlcbiAgaWYgKHNyYyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgcmV0dXJuIHNyYztcbiAgfVxuXG4gIGlmICghZHN0IHx8IGRzdCA9PT0gREVMX0NIQVIpIHtcbiAgICBkc3QgPSBzcmMuY29uc3RydWN0b3IoKTtcbiAgfVxuXG4gIGZvciAobGV0IHByb3AgaW4gc3JjKSB7XG4gICAgaWYgKHNyYy5oYXNPd25Qcm9wZXJ0eShwcm9wKSAmJiAoIWlnbm9yZSB8fCAhaWdub3JlW3Byb3BdKSAmJiAocHJvcCAhPSAnX25vRm9yd2FyZGluZycpKSB7XG4gICAgICBkc3RbcHJvcF0gPSBtZXJnZU9iaihkc3RbcHJvcF0sIHNyY1twcm9wXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBkc3Q7XG59XG5cbi8vIFVwZGF0ZSBvYmplY3Qgc3RvcmVkIGluIGEgY2FjaGUuIFJldHVybnMgdXBkYXRlZCB2YWx1ZS5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVRvQ2FjaGUoY2FjaGUsIGtleSwgbmV3dmFsLCBpZ25vcmUpIHtcbiAgY2FjaGVba2V5XSA9IG1lcmdlT2JqKGNhY2hlW2tleV0sIG5ld3ZhbCwgaWdub3JlKTtcbiAgcmV0dXJuIGNhY2hlW2tleV07XG59XG5cbi8vIFN0cmlwcyBhbGwgdmFsdWVzIGZyb20gYW4gb2JqZWN0IG9mIHRoZXkgZXZhbHVhdGUgdG8gZmFsc2Ugb3IgaWYgdGhlaXIgbmFtZSBzdGFydHMgd2l0aCAnXycuXG4vLyBVc2VkIG9uIGFsbCBvdXRnb2luZyBvYmplY3QgYmVmb3JlIHNlcmlhbGl6YXRpb24gdG8gc3RyaW5nLlxuZXhwb3J0IGZ1bmN0aW9uIHNpbXBsaWZ5KG9iaikge1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGlmIChrZXlbMF0gPT0gJ18nKSB7XG4gICAgICAvLyBTdHJpcCBmaWVsZHMgbGlrZSBcIm9iai5fa2V5XCIuXG4gICAgICBkZWxldGUgb2JqW2tleV07XG4gICAgfSBlbHNlIGlmICghb2JqW2tleV0pIHtcbiAgICAgIC8vIFN0cmlwIGZpZWxkcyB3aGljaCBldmFsdWF0ZSB0byBmYWxzZS5cbiAgICAgIGRlbGV0ZSBvYmpba2V5XTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob2JqW2tleV0pICYmIG9ialtrZXldLmxlbmd0aCA9PSAwKSB7XG4gICAgICAvLyBTdHJpcCBlbXB0eSBhcnJheXMuXG4gICAgICBkZWxldGUgb2JqW2tleV07XG4gICAgfSBlbHNlIGlmICghb2JqW2tleV0pIHtcbiAgICAgIC8vIFN0cmlwIGZpZWxkcyB3aGljaCBldmFsdWF0ZSB0byBmYWxzZS5cbiAgICAgIGRlbGV0ZSBvYmpba2V5XTtcbiAgICB9IGVsc2UgaWYgKG9ialtrZXldIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgLy8gU3RyaXAgaW52YWxpZCBvciB6ZXJvIGRhdGUuXG4gICAgICBpZiAoIWlzVmFsaWREYXRlKG9ialtrZXldKSkge1xuICAgICAgICBkZWxldGUgb2JqW2tleV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqW2tleV0gPT0gJ29iamVjdCcpIHtcbiAgICAgIHNpbXBsaWZ5KG9ialtrZXldKTtcbiAgICAgIC8vIFN0cmlwIGVtcHR5IG9iamVjdHMuXG4gICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqW2tleV0pLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGRlbGV0ZSBvYmpba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb2JqO1xufTtcblxuXG4vLyBUcmltIHdoaXRlc3BhY2UsIHN0cmlwIGVtcHR5IGFuZCBkdXBsaWNhdGUgZWxlbWVudHMgZWxlbWVudHMuXG4vLyBJZiB0aGUgcmVzdWx0IGlzIGFuIGVtcHR5IGFycmF5LCBhZGQgYSBzaW5nbGUgZWxlbWVudCBcIlxcdTI0MjFcIiAoVW5pY29kZSBEZWwgY2hhcmFjdGVyKS5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVBcnJheShhcnIpIHtcbiAgbGV0IG91dCA9IFtdO1xuICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgLy8gVHJpbSwgdGhyb3cgYXdheSB2ZXJ5IHNob3J0IGFuZCBlbXB0eSB0YWdzLlxuICAgIGZvciAobGV0IGkgPSAwLCBsID0gYXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgbGV0IHQgPSBhcnJbaV07XG4gICAgICBpZiAodCkge1xuICAgICAgICB0ID0gdC50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKHQubGVuZ3RoID4gMSkge1xuICAgICAgICAgIG91dC5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIG91dC5zb3J0KCkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0sIHBvcywgYXJ5KSB7XG4gICAgICByZXR1cm4gIXBvcyB8fCBpdGVtICE9IGFyeVtwb3MgLSAxXTtcbiAgICB9KTtcbiAgfVxuICBpZiAob3V0Lmxlbmd0aCA9PSAwKSB7XG4gICAgLy8gQWRkIHNpbmdsZSB0YWcgd2l0aCBhIFVuaWNvZGUgRGVsIGNoYXJhY3Rlciwgb3RoZXJ3aXNlIGFuIGFtcHR5IGFycmF5XG4gICAgLy8gaXMgYW1iaWd1b3MuIFRoZSBEZWwgdGFnIHdpbGwgYmUgc3RyaXBwZWQgYnkgdGhlIHNlcnZlci5cbiAgICBvdXQucHVzaChERUxfQ0hBUik7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcInZlcnNpb25cIjogXCIwLjE5LjAtYWxwaGExXCJ9XG4iXX0=
