import test from 'ava';
import nock from 'nock';

import Consulr from '../index';

test('Consulr: #ctor should create instance', t => {
  let c = new Consulr({
    prefix: "foo/"
  });
  t.not(c, null);
});

test('#ctor should handle empty prefix', t => {
  t.throws(() => {
    return new Consulr({prefix: ""});
  }, "prefix can't be empty");
});

test('#ctor should append / to prefix', t => {
  let c = new Consulr({prefix: "bar"});

  t.is(c.config.prefix, "bar/");
});

test.cb('should emit `update` when detect changes', t => {
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

  var scope = nock('http://127.0.0.1:8500')
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

test.cb('Consulr: should emit `error` event on error', t => {
  var scope = nock('http://127.0.0.1:8500')
      .get('/v1/kv/bar%2F?recurse=true&index=0&wait=30m')
      .reply(500);

  let c = new Consulr({
    prefix: "bar/",
    quiescencePeriodInMs: 2 * 1000 // 2 sec
  });

  c.on('error', err => {
    c.close();
    t.is('consul: kv.get: internal server error', err.message);
    scope.done();
    t.end();
  });

  c.run();
});

test.after.always('cleanup', t => {
  nock.cleanAll();
  nock.restore();
});
