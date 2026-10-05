import type { CalcResult, NightResult } from '../calculator/calculator.types';

/** The night arrives before the list, so it may be newer than the night of the result */
export type ResultState = { night: NightResult | null; result: CalcResult | null; isCalculating: boolean };
