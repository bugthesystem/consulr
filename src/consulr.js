const EventEmitter = require('events');

const consul = require('consul');
const backoff = require('backoff');
const merge = require('merge');
const C = require('./constants');
const decode = require('./decode');

class Consulr extends EventEmitter {
  constructor(settings) {
    super();

    this.settings = merge({
      address: C.DEFAULT_HOST,
      port: C.DEFAULT_PORT,
      quiescencePeriodInMs: C.DEFAULT_QUISCENCE_PERIOD_IN_MS,
      quiescenceTimeoutInMs: C.DEFAULT_QUISCENCE_TIMEOUT_IN_MS,
      failAfter: C.DEFAULT_BACKOFF_FAIL_AFTER,
      prefix: '',
      consulConfig: {}
    }, settings);

    if (!this.settings.prefix || this.settings.prefix === '') {
      throw new Error("prefix can't be empty");
    }

    if (this.settings.prefix[this.settings.prefix.length - 1] !== '/') {
      this.settings.prefix += '/';
    }
  }

  run() {
    this.consul = consul();

    this.exponentialBackoff = backoff.exponential({
      initialDelay: 100 * 10, // 1  seconds
      maxDelay: 10000 // 10 seconds
    });

    this.waitIndex = 0;

    this.exponentialBackoff.on('backoff', (number, delay) => {
      this.consul.kv.get({
        key: this.settings.prefix,
        recurse: true,
        index: this.waitIndex,
        wait: C.DEFAULT_WAIT_TIME_IN_MINUTE
      }, this._backoffHandler.bind(this));
    });
    this.exponentialBackoff.on('ready', (number, delay) => {
      //
      this.exponentialBackoff.backoff();
    });

    this.exponentialBackoff.on('fail', () => {
      console.log('fail');
      this.exponentialBackoff.backoff();
    });

    this.exponentialBackoff.backoff();
  }

  close() {
    this.removeAllListeners('update');
    this.exponentialBackoff.reset();
  }

  reschedule() {
    this.qscPeriodTimerId = setTimeout(() => {
      this.exponentialBackoff.backoff();
      clearTimeout(this.qscPeriodTimerId);
    }, this.settings.quiescencePeriodInMs);
  }

  watch(key, handler) {
    console.log(key);
  }

  _backoffHandler(err, result, res) {
    if (err) {
      this.emit('error', err);
      return this.exponentialBackoff.backoff();
    }
    let metadata = this.consul.parseQueryMeta(res);

    // if same, there is no changes
    if (metadata.LastIndex === this.waitIndex) {
      console.log('there is no changes');
      return;
    }

    //
    this.waitIndex = metadata.LastIndex;
    this.exponentialBackoff.reset();
    let decodeResult = decode(result, this.settings.prefix);
    this.emit('update', decodeResult);
    this.reschedule();
  }
}

module.exports = Consulr;
