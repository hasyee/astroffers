const typeMap = require('../../data/types.json');

export const resolveTypes = (types: string[]): string[] => types.map(t => typeMap[t]);
