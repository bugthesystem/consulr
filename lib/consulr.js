const EventEmitter = require('events');

const consul = require('consul');
const backoff = require('backoff');
const C = require('./constants');
const decode = require('./decode');
const configure = require('./configure');

/**
 * Class that extends EventEmitter and watches consul and fires events when detect changes
 */
class Consulr extends EventEmitter {
  constructor(config) {
    super();
    this.config = configure(config);

    this.waitIndex = 0;
    this.consulQuery = {
      key: this.config.prefix,
      recurse: true,
      index: this.waitIndex,
      wait: C.DEFAULT_WAIT_TIME_IN_MINUTE
    };
  }

  /**
   * Start to watch for updates
   */
  run() {
    this.consul = consul();

    this.expBackoff = backoff.exponential({
      initialDelay: 100 * 10, // 1  seconds
      maxDelay: 10000 // 10 seconds
    });

    this.expBackoff.on('backoff', this._backoffHandler.bind(this));
    ['ready', 'fail'].map(evt => this.expBackoff.on(evt, this._backoff.bind(this)));
    this._backoff();
  }

  close() {
    this.removeAllListeners('update');
    this._reset();
  }

  _backoffHandler() {
    this.consul.kv.get(this.consulQuery, (err, result, res) => {
      if (err) {
        return this._handleError(err);
      }

      let metadata = this.consul.parseQueryMeta(res);
        // if same, there is no changes
      let lastIndex = parseInt(metadata.LastIndex);
      if (lastIndex === this.waitIndex) {
        if (this.config.fireInternalEvents === true) {
            // I know dude, this is a bit hacky (:
          this.emit('int:nochange');
        }
        return;
      }

      this.waitIndex = lastIndex;
      this._reset();
      let decodeResult = decode(result, this.config.prefix);
      this.emit('update', decodeResult);
      this._reschedule();
    });
  }

  _reschedule() {
    this.qscPeriodTimerId = setTimeout(() => {
      this._backoff();
      clearTimeout(this.qscPeriodTimerId);
    }, this.config.quiescencePeriodInMs);
  }

  _backoff() {
    this.expBackoff.backoff();
  }

  _reset() {
    this.expBackoff.reset();
  }

  _handleError(err) {
    this.emit('error', err);
  }
}

module.exports = Consulr;
