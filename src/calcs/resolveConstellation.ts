const constellationMap = require('../../data/constellations.json');

export const resolveConstellation = (cons: string): string => constellationMap[cons] || cons;
