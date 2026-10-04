import type { Params, Query } from './router.types';

export type PathMatch = { params: Params; matchedSegment: string; remainder: string };

function splitSegments(path: string): string[] {
  return path.split('/').filter(segment => segment.length > 0);
}

/** Matches a pattern like `object/:ngc`, `deleted/:collection?` or `items/*` against a path (from tinc) */
export function matchPath(pattern: string, candidate: string): PathMatch | null {
  const patternSegments = splitSegments(pattern);
  const candidateSegments = splitSegments(candidate);
  const params: Params = {};

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i];

    if (patternSegment === '*') {
      return {
        params,
        matchedSegment: candidateSegments.slice(0, i).join('/'),
        remainder: candidateSegments.slice(i).join('/')
      };
    }

    const isParam = patternSegment.startsWith(':');
    const isOptional = isParam && patternSegment.endsWith('?');
    const candidateSegment = candidateSegments[i];

    if (candidateSegment === undefined) {
      if (isOptional) continue; // trailing optional param not provided - fine, just leave it unset
      return null;
    }

    if (isParam) {
      if (candidateSegment.length === 0) return null;
      params[patternSegment.slice(1, isOptional ? -1 : undefined)] = decodeURIComponent(candidateSegment);
    } else if (patternSegment !== candidateSegment) {
      return null;
    }
  }

  if (candidateSegments.length > patternSegments.length) return null;
  return { params, matchedSegment: candidateSegments.join('/'), remainder: '' };
}

export function joinPath(prefix: string, segment: string): string {
  const segments = [...splitSegments(prefix), ...splitSegments(segment)];
  return segments.length === 0 ? '/' : `/${segments.join('/')}`;
}

export function popSegments(pathname: string, count: number): string {
  const segments = splitSegments(pathname);
  const remaining = segments.slice(0, Math.max(0, segments.length - count));
  return remaining.length === 0 ? '/' : `/${remaining.join('/')}`;
}

export function parseQuery(search: string): Query {
  const query: Query = {};
  for (const [key, value] of new URLSearchParams(search)) query[key] = value;
  return query;
}

export function serializeQuery(query: Query): string {
  const entries = Object.entries(query);
  return entries.length === 0 ? '' : `?${new URLSearchParams(query).toString()}`;
}

export const isAbsoluteUrl = (url: string) => {
  const pattern = /^https?:\/\//i;
  return pattern.test(url);
};
