const typeMap = require('../../data/types.json');

export default (types: string[]): string[] => types.map(t => typeMap[t]);
