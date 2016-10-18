import test from 'ava';
import decode from '../lib/decode';

test('should decode basic', t => {
  let pairs = [{Key: "foo/bar", Value: "bazqqqqq"}];

  let expected = {bar: "bazqqqqq"};

  let actual = decode(pairs, 'foo/');

  t.deepEqual(actual, expected);
});

test('should decode nested', t => {
  let pairs = [
    {Key: "foo/bar", Value: "bazqqqqq"},
    {Key: "foo/child/data", Value: "UOOOOOO"}
  ];

  let expected = {bar: "bazqqqqq", child: {data: "UOOOOOO"}};

  let actual = decode(pairs, 'foo/');

  t.deepEqual(actual, expected);
});
