const merge = require('merge');
const C = require('./constants');

const prefixer = prefix => {
  if (!prefix || prefix === '') {
    throw new Error("prefix can't be empty");
  }

  if (prefix[prefix.length - 1] !== '/') {
    prefix += '/';
  }

  return prefix;
};

/**
 * Merge given config with defaults
 * @param {Object} config that provided by user
 * @return {Object} merged config
 */
const configure = config => {
  config.prefix = prefixer(config.prefix);

  return merge({
    address: C.DEFAULT_HOST,
    port: C.DEFAULT_PORT,
    quiescencePeriodInMs: C.DEFAULT_QUISCENCE_PERIOD_IN_MS,
    quiescenceTimeoutInMs: C.DEFAULT_QUISCENCE_TIMEOUT_IN_MS,
    failAfter: C.DEFAULT_BACKOFF_FAIL_AFTER,
    prefix: '',
    consulConfig: {},
    fireInternalEvents: false
  }, config);
};

module.exports = configure;
