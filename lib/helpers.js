const merge = require('merge');
const C = require('./constants');

/**
 * Merge given config with defaults
 * @param {Object} config that provided by user
 * @return {Object} merged config
 */
const configMerge = config => {
  return merge({
    address: C.DEFAULT_HOST,
    port: C.DEFAULT_PORT,
    quiescencePeriodInMs: C.DEFAULT_QUISCENCE_PERIOD_IN_MS,
    quiescenceTimeoutInMs: C.DEFAULT_QUISCENCE_TIMEOUT_IN_MS,
    failAfter: C.DEFAULT_BACKOFF_FAIL_AFTER,
    prefix: '',
    consulConfig: {}
  }, config);
};

module.exports.configMerge = configMerge;
