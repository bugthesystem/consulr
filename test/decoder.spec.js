import test from 'ava';
import decode from '../lib/decode';

test('should decode basic', t => {
  let pairs = [{Key: "foo/bar", Value: "baz"}];

  let expected = {bar: "baz"};

  let actual = decode(pairs, 'foo/');

  t.deepEqual(actual, expected);
});

test('should decode nested', t => {
  let pairs = [
    {Key: "foo/bar", Value: "baz"},
    {Key: "foo/child/data", Value: "ghost"}
  ];

  let expected = {bar: "baz", child: {data: "ghost"}};

  let actual = decode(pairs, 'foo/');

  t.deepEqual(actual, expected);
});
