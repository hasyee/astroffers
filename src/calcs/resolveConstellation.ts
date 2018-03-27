import { constellations } from './data';

export const resolveConstellation = (cons: string): string => constellations[cons] || cons;
