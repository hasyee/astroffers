onmessage = ({ data: { filter, night } }) => {
  const filterObjects = require('./lib/calcs/filterObjects').default;
  const catalog = require('./data/ngc.json');
  const result = filterObjects(catalog, filter, night);
  postMessage(result);
};
