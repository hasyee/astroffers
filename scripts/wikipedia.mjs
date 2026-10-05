/**
 * Lists the NGC numbers having an article (or a redirect to one) on the English Wikipedia, about 60% of them: the
 * others are opened by its search, as a missing article would be an error page in the Wikipedia app, which takes over
 * the links of the articles.
 *
 * Usage: node scripts/wikipedia.mjs
 *
 * Output: src/external/external.wikipedia.json (the NGC numbers, ascending)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'src/external/external.wikipedia.json');
const catalog = JSON.parse(readFileSync(join(root, 'src/catalog/catalog.json'), 'utf8'));

/** The API takes 50 titles a request */
const BATCH = 50;
const HEADERS = { 'User-Agent': 'astroffers (https://github.com/hasyee/astroffers)' };

const toTitle = ngc => `NGC ${ngc}`;

const fetchExisting = async numbers => {
  const params = new URLSearchParams({
    action: 'query',
    titles: numbers.map(toTitle).join('|'),
    redirects: '1',
    format: 'json',
    formatversion: '2'
  });
  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { headers: HEADERS });
  if (!response.ok) throw new Error(`${response.status}`);
  const { query } = await response.json();
  const existing = new Set(query.pages.filter(page => !page.missing && !page.invalid).map(page => page.title));
  // a title resolves through its normalization and its redirect to the page
  const resolve = title => {
    const normalized = query.normalized?.find(entry => entry.from === title)?.to ?? title;
    return query.redirects?.find(entry => entry.from === normalized)?.to ?? normalized;
  };
  return numbers.filter(ngc => existing.has(resolve(toTitle(ngc)).split('#')[0]));
};

const numbers = [...new Set(catalog.map(object => object.ngc).filter(ngc => ngc !== undefined))].sort((a, b) => a - b);
const existing = [];
// one by one, as the API asks
for (let i = 0; i < numbers.length; i += BATCH) existing.push(...(await fetchExisting(numbers.slice(i, i + BATCH))));
writeFileSync(target, JSON.stringify(existing) + '\n');
console.log(`${existing.length} of ${numbers.length} NGC objects have an article, written to ${target}`);
