import type { Eq, Radians } from '../calculator/calculator.types';

const PI2 = 2 * Math.PI;

/**
 * A layer of the stars of the star map (by `scripts/starmap.mjs`, which describes its file): the sky cut into bands of
 * equal declination, each into tiles of equal right ascension, the stars by their tiles; J2000 positions
 */
export type StarLayer = {
  cellCounts: Uint32Array;
  /** The index of the first tile of each band */
  bandFirstTiles: number[];
  /** The index of the first star of each tile, band by band; the last one is the number of the stars */
  tileStarts: Uint32Array;
  ra: Float32Array;
  /** Of the declination, as the projection needs it */
  sinDe: Float32Array;
  cosDe: Float32Array;
  magnitude: Float32Array;
};

export const decodeStarLayer = (buffer: ArrayBuffer): StarLayer => {
  const [bandCount] = new Uint32Array(buffer, 0, 1);
  const cellCounts = new Uint32Array(buffer, 4, bandCount);
  const bandFirstTiles = Array.from(cellCounts).reduce<number[]>(
    (firsts, count) => [...firsts, firsts[firsts.length - 1] + count],
    [0]
  );
  const tileCount = bandFirstTiles[bandCount];
  const tileStarts = new Uint32Array(buffer, 4 * (1 + bandCount), tileCount + 1);
  const starCount = tileStarts[tileCount];
  const offset = 4 * (2 + bandCount + tileCount);
  const raPositions = new Uint16Array(buffer, offset, starCount);
  const dePositions = new Uint16Array(buffer, offset + 2 * starCount, starCount);
  const magnitudeCodes = new Uint8Array(buffer, offset + 4 * starCount, starCount);
  const ra = new Float32Array(starCount);
  const sinDe = new Float32Array(starCount);
  const cosDe = new Float32Array(starCount);
  const bandHeight = Math.PI / bandCount;
  cellCounts.forEach((cellCount, band) => {
    const cellWidth = PI2 / cellCount;
    for (let cell = 0; cell < cellCount; cell++) {
      const tile = bandFirstTiles[band] + cell;
      for (let index = tileStarts[tile]; index < tileStarts[tile + 1]; index++) {
        const de = -Math.PI / 2 + (band + dePositions[index] / 65535) * bandHeight;
        ra[index] = (cell + raPositions[index] / 65535) * cellWidth;
        sinDe[index] = Math.sin(de);
        cosDe[index] = Math.cos(de);
      }
    }
  });
  const magnitude = Float32Array.from(magnitudeCodes, code => code / 10 - 2);
  return { cellCounts, bandFirstTiles, tileStarts, ra, sinDe, cosDe, magnitude };
};

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => from + index);

/** The tiles of the layer touching a circle of the sky (around its center by the radius), or a few more */
export const getTilesAround = (layer: StarLayer, center: Eq, radius: Radians): number[] => {
  const bandCount = layer.cellCounts.length;
  const bandHeight = Math.PI / bandCount;
  const minDe = center.de - radius;
  const maxDe = center.de + radius;
  // the half-width of the circle in right ascension, all around it when it covers a pole
  const raRadius =
    maxDe >= Math.PI / 2 || minDe <= -Math.PI / 2 || Math.sin(radius) >= Math.cos(center.de)
      ? Math.PI
      : Math.asin(Math.sin(radius) / Math.cos(center.de));
  const firstBand = Math.max(0, Math.floor((minDe + Math.PI / 2) / bandHeight));
  const lastBand = Math.min(bandCount - 1, Math.floor((maxDe + Math.PI / 2) / bandHeight));
  return range(firstBand, lastBand).flatMap(band => {
    const cellCount = layer.cellCounts[band];
    const cellWidth = PI2 / cellCount;
    const firstCell = Math.floor((center.ra - raRadius) / cellWidth);
    const lastCell = Math.floor((center.ra + raRadius) / cellWidth);
    const cells = lastCell - firstCell + 1 >= cellCount ? range(0, cellCount - 1) : range(firstCell, lastCell);
    return cells.map(cell => layer.bandFirstTiles[band] + (((cell % cellCount) + cellCount) % cellCount));
  });
};
