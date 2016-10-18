const decoder = (pairs, prefix) => {
  var raw = {};

  pairs.forEach(p => {
    var key = p.Key.startsWith(prefix) ? p.Key.replace(prefix, '') : p.Key;

    var tmpMap = raw;
    let children = key.split('/');

    if (children.length > 0) {
      key = children.pop();
      children.forEach(child => {
        if (!tmpMap[child]) {
          tmpMap[child] = {};
        }

        var subMap = tmpMap[child];
        if (typeof subMap !== 'object') {
          throw new Error(`child is both a data item and dir: ${child}`);
        }
        tmpMap = subMap;
      });
    }

    tmpMap[key] = p.Value;
  });

  return raw;
}
;

module.exports = decoder;
