import type { ArcMin, NgcObject } from '../calculator/calculator.types';
import { radToDeg } from '../calculator/calculator.units';
import objectTypesJson from './catalog.types.json';
import allTypesJson from './catalog.allTypes.json';
import constellationsJson from './catalog.constellations.json';

/** Object types that can be filtered on, by key */
export const objectTypes: Record<string, string> = objectTypesJson;

/** Display names of every object type, by key */
const allTypes: Record<string, string> = allTypesJson;

/** Display names of the constellations, by abbreviation */
export const constellations: Record<string, string> = constellationsJson;

export const resolveTypes = (types: string[]) => types.map(type => allTypes[type] ?? type);

export const resolveConstellation = (constellation: string) => constellations[constellation] ?? constellation;

export const getTitle = ({ ngc, messier, name }: NgcObject) =>
  [ngc ? `NGC ${ngc}` : null, messier ? `M ${messier}` : null, name || null].filter(term => term).join(' | ');

const MIN_FIELD_OF_VIEW: ArcMin = 6;
const MAX_FIELD_OF_VIEW: ArcMin = 180;

/** Field of view of the preview image: the object with some margin around it */
const getFieldOfView = (size?: [ArcMin, ArcMin]): ArcMin =>
  Math.min(MAX_FIELD_OF_VIEW, Math.max(MIN_FIELD_OF_VIEW, size ? Math.max(...size) * 1.5 : 0));

/** DSS2 color preview of the object from the hips2fits service of CDS (Strasbourg) */
export const getObjectImgSrc = ({ ra, de, size }: NgcObject, pixels = 300) => {
  const params = new URLSearchParams({
    hips: 'CDS/P/DSS2/color',
    width: String(pixels),
    height: String(pixels),
    fov: (getFieldOfView(size) / 60).toFixed(3),
    projection: 'TAN',
    coordsys: 'icrs',
    ra: radToDeg(ra).toFixed(5),
    dec: radToDeg(de).toFixed(5),
    format: 'jpg'
  });
  return `https://alasky.cds.unistra.fr/hips-image-services/hips2fits?${params}`;
};
