onmessage = ({ data: filter }) => {
  const getResult = require('../lib/utils/getResult').default;
  postMessage(getResult(filter));
};
