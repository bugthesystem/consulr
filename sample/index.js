'use strict';

const Consulr = require('../index');

/**
 * sample
 */
function main() {
  const c = new Consulr({
    prefix: "foo/",
    quiescencePeriodInMs: 3 * 1000 // 30 sec
  });

  c.on('update', newValue => {
    console.log(`New value : ${JSON.stringify(newValue)}`);
  });

  c.on('error', err => {
    console.log(`Error value : ${JSON.stringify(err)}`);
  });

  c.run();
}

main();
