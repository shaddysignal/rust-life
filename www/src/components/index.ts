import _ from 'lodash';

const req = require.context('.', true, /[^/]+\/[^/]+\/index\.tsx?$/);

const keyToInt = (key: string) => {
  if (/\/(inputs)\//g.test(key)) return -100;
  return -_.countBy(key, (e: string) => e === '/').true
}

_.sortBy(req.keys(), keyToInt).forEach((key: string) => {
  const componentName = key.replace(/^.+\/([^/]+)\/index\.tsx?/, '$1');

  console.log(componentName);
  module.exports[componentName] = req(key).default;
});