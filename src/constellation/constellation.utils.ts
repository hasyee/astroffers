import lines from './constellation.lines.json';

/**
 * The lines of each constellation by its abbreviation (`scripts/starmap.mjs`): polylines, flat lists of the J2000
 * coordinates of their stars (`ra, de, ra, de, …`, radians)
 */
export const CONSTELLATION_LINES: Record<string, number[][]> = lines;
