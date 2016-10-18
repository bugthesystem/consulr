# consulr
[![Build Status](https://travis-ci.org/ziyasal/consulr.svg?branch=master)](https://travis-ci.org/ziyasal/consulr) [![Coverage Status](https://coveralls.io/repos/github/ziyasal/consulr/badge.svg?branch=master)](https://coveralls.io/github/ziyasal/consulr?branch=master)  

Decode Consul data into Nodejs and watch for updates

> Consul is a tool for service discovery, monitoring and configuration. https://www.consul.io/  

**Install npm package**
```sh
npm i consulr --save
```

**Preview**
```js
const Consulr = require('consulr');

function main() {
  const c = new Consulr({
    prefix: "foo/",
    quiescencePeriodInMs: 3 * 1000 // 3 sec
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
```

##Bugs
If you encounter a bug, performance issue, or malfunction, please add an [Issue](https://github.com/ziyasal/consulr/issues) with steps on how to reproduce the problem.

##License
Code and documentation are available according to the *MIT* License (see [LICENSE](https://github.com/ziyasal/consulr/blob/master/LICENSE)).
