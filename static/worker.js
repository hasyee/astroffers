onmessage = ({ data: { cid, filter } }) => {
  const getResult = require('../lib/utils/getResult').default;
  const result = getResult(filter);
  postMessage({ cid, result });
};
