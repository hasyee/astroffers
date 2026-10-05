import type { ArcMin, NgcObject } from '../calculator/calculator.types';
import { radToDeg } from '../calculator/calculator.units';
import objectTypesJson from './catalog.types.json';
import allTypesJson from './catalog.allTypes.json';
import constellationsJson from './catalog.constellations.json';
import solarTypesJson from '../solar/solar.types.json';

/** Object types that can be filtered on, by key: the ones of the catalog and of the Solar System (`solar/`) */
export const objectTypes: Record<string, string> = { ...objectTypesJson, ...solarTypesJson };

/** Display names of every object type, by key */
const allTypes: Record<string, string> = { ...allTypesJson, ...solarTypesJson };

/** Display names of the constellations, by abbreviation */
export const constellations: Record<string, string> = constellationsJson;

export const resolveTypes = (types: string[]) => types.map(type => allTypes[type] ?? type);

export const resolveConstellation = (constellation: string) => constellations[constellation] ?? constellation;

/** Catalog numbers of the object, e.g. `M 13 – NGC 6205` */
const getDesignations = ({ ngc, messier }: NgcObject) =>
  [messier ? `M ${messier}` : null, ngc ? `NGC ${ngc}` : null].filter(term => term).join(' – ');

/** The name of the object, or its catalog numbers when it has no name */
export const getTitle = (object: NgcObject) => object.name || getDesignations(object);

/** The catalog numbers below the name, or none when the title shows them already (an object without a name) */
export const getSubtitle = (object: NgcObject) => (object.name ? getDesignations(object) : null);

const MIN_FIELD_OF_VIEW: ArcMin = 6;
const MAX_FIELD_OF_VIEW: ArcMin = 180;

/** Field of view of the preview image: the object with some margin around it */
const getFieldOfView = (size?: [ArcMin, ArcMin]): ArcMin =>
  Math.min(MAX_FIELD_OF_VIEW, Math.max(MIN_FIELD_OF_VIEW, size ? Math.max(...size) * 1.5 : 0));

/**
 * DSS2 color preview of the object from the hips2fits service of CDS (Strasbourg), or the bundled photo of a body of
 * the Solar System
 */
export const getObjectImgSrc = ({ ra, de, size, photo }: NgcObject, pixels = 300) => {
  if (photo) return photo.src;
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
