export const degToHours = (deg: number): number => deg / 360 * 24;

export const degToHms = (deg: number): string => {
  const hoursWithDecimals = degToHours(deg < 0 ? 360 + deg : deg);
  const hours = Math.floor(hoursWithDecimals);
  const minsWithDecimals = (hoursWithDecimals - hours) * 60;
  const mins = Math.floor(minsWithDecimals);
  const secsWithDecimals = (minsWithDecimals - mins) * 60;
  const secs = Math.floor(secsWithDecimals);
  return `${hours}h ${mins}m ${secs}s`;
};
