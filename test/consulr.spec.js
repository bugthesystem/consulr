import test from 'ava';

import Consulr from '../src/index';

test('Consulr: #ctor should create instance', t => {
  let c = new Consulr({
    prefix: "foo/bar"
  });
  t.not(c, null);
});

test.cb('Consulr: #update', t => {
  let c = new Consulr({
    prefix: "foo/",
    quiescencePeriodInMs: 1000 // 1 sec
  });

  c.on('update', newValue => {
    console.log('new value: ');
    console.log(newValue);
    c.close();
    t.pass();
    t.end();
  });

  c.run();
  // TODO: Send update request
});
