const typeMap = require('../../data/types.json');

export default (type: string): string[] => type.split('+').map(t => typeMap[t]);
