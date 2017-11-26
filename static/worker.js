onmessage = ({ data: filter }) => {
  const getResult = require('../lib/calcs/getResult').default;
  postMessage(getResult(filter));
};
