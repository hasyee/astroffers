import type { Photo } from '../calculator/calculator.types';

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

/**
 * Bundled photos of the bodies of the Solar System (`public/solar/`, 300px squares cropped and padded from the
 * images of their Wikipedia articles), with their credits and licenses; each links to its page on Wikimedia Commons
 */
export const photos: Record<string, Photo> = {
  mercury: {
    src: '/solar/mercury.jpg',
    credit: 'NASA/JHUAPL/Carnegie Institution of Washington · Public domain',
    page: commons('Mercury_in_true_color.jpg')
  },
  venus: {
    src: '/solar/venus.jpg',
    credit: 'NASA/JPL-Caltech · Public domain',
    page: commons('Venus_from_Mariner_10.jpg')
  },
  mars: {
    src: '/solar/mars.jpg',
    credit: 'Kevin M. Gill · CC BY 2.0',
    page: commons('Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png')
  },
  jupiter: {
    src: '/solar/jupiter.jpg',
    credit: 'NASA/STScI · Public domain',
    page: commons('Jupiter_OPAL_2024.png')
  },
  saturn: {
    src: '/solar/saturn.jpg',
    credit: 'NASA/JPL-Caltech/SSI, Gordan Ugarković · Public domain',
    page: commons('Saturn_global_view_from_Cassini,_rings_open_Better_Colour.png')
  },
  uranus: {
    src: '/solar/uranus.jpg',
    credit: 'NASA/Voyager 2, Ardenau4 · CC0',
    page: commons('Uranus_Voyager2_color_calibrated.png')
  },
  neptune: {
    src: '/solar/neptune.jpg',
    credit: 'NASA/Voyager 2, Ardenau4 · CC0',
    page: commons('Neptune_Voyager2_color_calibrated.png')
  },
  pluto: {
    src: '/solar/pluto.jpg',
    credit: 'NASA/JHUAPL/SwRI · Public domain',
    page: commons('Pluto_in_True_Color_-_High-Res.png')
  },
  ceres: {
    src: '/solar/ceres.jpg',
    credit: 'NASA/JPL-Caltech/UCLA/MPS/DLR/IDA, Justin Cowart · Public domain',
    page: commons('Ceres_-_RC3_-_Haulani_Crater_(22381131691)_(cropped).jpg')
  },
  eris: {
    src: '/solar/eris.jpg',
    credit: 'NASA/ESA/CSA JWST, de Souza Feliciano et al., M. Thévenot · CC BY-SA 4.0',
    page: commons('Eris_and_moon_Dysnomia_JWST_NIRCam.jpg')
  },
  makemake: {
    src: '/solar/makemake.jpg',
    credit: 'NASA, ESA, A. Parker, M. Buie (SwRI) · CC BY 4.0',
    page: commons('Makemake_and_its_moon.jpg')
  },
  haumea: {
    src: '/solar/haumea.jpg',
    credit: 'NASA/ESA Hubble, Renerpho · Public domain',
    page: commons('Haumea_Hubble.png')
  },
  vesta: {
    src: '/solar/vesta.jpg',
    credit: 'NASA/JPL/MPS/DLR/IDA, Björn Jónsson · Public domain',
    page: commons('Vesta_in_natural_color.jpg')
  },
  pallas: {
    src: '/solar/pallas.jpg',
    credit: 'ESO/Vernazza et al. · CC BY 4.0',
    page: commons('Potw1749a_Pallas_crop.png')
  },
  juno: {
    src: '/solar/juno.jpg',
    credit: 'ESO VLT/SPHERE, Vernazza et al. · CC BY-SA 4.0',
    page: commons('3_Juno_VLT_(2021).png')
  },
  iris: {
    src: '/solar/iris.jpg',
    credit: 'ESO/Vernazza et al. · CC BY 4.0',
    page: commons('Iris_asteroid_eso.jpg')
  },
  hebe: {
    src: '/solar/hebe.jpg',
    credit: 'ESO VLT/SPHERE · Public domain',
    page: commons('6hebe.png')
  },
  melpomene: {
    src: '/solar/melpomene.jpg',
    credit: 'ESO VLT/SPHERE, Vernazza et al. · CC BY-SA 4.0',
    page: commons('18_Melpomene_VLT_(2021),_deconvolved.pdf')
  },
  eunomia: {
    src: '/solar/eunomia.jpg',
    credit: 'ESO VLT/SPHERE, Vernazza et al. · CC BY-SA 4.0',
    page: commons('15_Eunomia_VLT_(2021),_deconvolved.pdf')
  },
  flora: {
    src: '/solar/flora.jpg',
    credit: 'ESO VLT/SPHERE, Vernazza et al. · CC BY 4.0',
    page: commons('8_Flora_VLT_(2021),_deconvolved.pdf')
  },
  metis: {
    src: '/solar/metis.jpg',
    credit: 'ESO VLT/SPHERE, Vernazza et al. · CC BY-SA 4.0',
    page: commons('9_Metis_VLT_(2021),_deconvolved.pdf')
  },
  hygiea: {
    src: '/solar/hygiea.jpg',
    credit: 'ESO/P. Vernazza et al./MISTRAL (ONERA/CNRS) · CC BY 4.0',
    page: commons('SPHERE_image_of_Hygiea.jpg')
  }
};
