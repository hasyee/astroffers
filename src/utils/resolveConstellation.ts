const constellationMap = require('../../data/constellations.json');

export default (cons: string): string => constellationMap[cons] || cons;
