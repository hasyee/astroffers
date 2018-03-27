import { objectTypes } from './data';

export const resolveTypes = (types: string[]): string[] => types.map(t => objectTypes[t]);
