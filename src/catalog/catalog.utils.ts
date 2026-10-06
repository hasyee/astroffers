import type { NgcObject } from '../calculator/calculator.types';
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

/** The images of the objects: the `images/` of the `astroffers` bucket on S3, served by CloudFront */
const IMAGES_URL = 'https://images.astroffers.hasyee.com/images';

/**
 * The preview of the object, 300px, the same for the details, the cards and the table, to share the cached image: a
 * DSS2 image rendered by `scripts/previews.mjs`, or the photo of a body of the Solar System
 */
export const getObjectImgSrc = ({ id }: NgcObject) => `${IMAGES_URL}/${id}.preview.jpg`;
