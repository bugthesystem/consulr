import test from 'ava';
import nock from 'nock';

import Consulr from '../index';

test('Consulr: #ctor should create instance', t => {
  let c = new Consulr({
    prefix: "foo/"
  });
  t.not(c, null);
});


test('Consulr: #ctor should handle empty prefix', t => {
  t.throws(()=>{ new Consulr({ prefix: "" }); }, "prefix can't be empty");
});

test.cb('Consulr: #update', t => {
  let pairs = [
    {
      LockIndex: 0,
      Value: 666,
      Key: 'foo/bar',
      Flags: 0,
      CreateIndex: 531,
      ModifyIndex: 653
    }
  ];

  let expected = {bar: 666};

  var scope = nock('http://127.0.0.1:8500', {allowUnmocked: true})
      .defaultReplyHeaders({
        'x-consul-index': '666',
        'x-consul-lastcontact': '10',
        'x-consul-knownleader': 'true',
        'x-consul-translate-addresses': 'true'
      })
      .get('/v1/kv/foo%2F?recurse=true&index=0&wait=30m')
      .reply(200, pairs);

  let c = new Consulr({
    prefix: "foo/",
    quiescencePeriodInMs: 1000 // 1 sec
  });

  c.on('update', newValue => {
    c.close();
    t.deepEqual(newValue, expected);
    scope.done();
    t.end();
  });

  c.run();
});
