export const flatten = <T>(array: T[][]) => array.reduce((prev, next) => [ ...prev, ...next ], []);
