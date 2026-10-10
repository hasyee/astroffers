/** Route of the details view: the id of the object (e.g. `/m27`, `/ngc884`) */
export const DETAILS_PATH = ':id';

/** Route of the star map of the object, in the place of its details */
export const MAP_PATH = ':id/map';

export const getDetailsPath = (id: string) => `/${id}`;

export const getMapPath = (id: string) => `/${id}/map`;
