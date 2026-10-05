# Astroffers

Take offers to watch at given nights by the NGC 2000 catalog.

Astroffers lists the objects of the NGC 2000 catalog that are visible on a chosen night at a given location, along
with their visibility interval, best visibility and altitude, filtered by magnitude or surface brightness, object
type and constellation. It is an installable, offline-capable PWA.

Live: https://astroffers.hasyee.com (also https://astroffers.onrender.com)

It is the successor of the [Electron desktop app](https://github.com/hasyee/astroffers-electron) and the
[React Native mobile app](https://github.com/hasyee/astroffers-app); the calculations come from
[astroffers-core](https://github.com/hasyee/astroffers-core).

## Development

```
npm install
npm run dev       # dev server
npm run build     # type check and production build into dist/
npm run preview   # serve the production build
npm run lint      # oxlint
```

Node version: see `.nvmrc`.

## Structure

Vite, React 19, TypeScript, MUI 9 (dark theme), Highcharts, sass. Source files are grouped by domain
(`src/<domain>/<domain>.<role>.ts(x)`); the state of the main view (date, location, sorting, search, filter) lives in the
URL query, so it can be shared, and is persisted to `localStorage` where needed (location, filter, sorting, search);
the rest is in small context-selector based state providers (`src/provider/`).

- `calculator/`: astronomical calculations (night, Moon, visibility of the objects), run in a web worker
- `catalog/`: the compact NGC catalog and its type/constellation names
- `filter/`, `location/`, `date/`: the inputs of the calculation; `sidebar/` frames the filter with its reset button
  and the About and Help
- `calendar/`: the nights of a month, the date picker of the app
- `result/`: runs the calculation whenever an input changes (the night at once, the list debounced for typed fields)
- `summary/`, `list/`, `details/`: the views of the result

The layout is responsive: the desktop layout (summary, table) starts at 800px, with the filter panel beside it from
1110px and the filter in a drawer below that; under 800px the mobile layout (filter drawer, cards) is used.

### Catalog

`src/catalog/catalog.json` is generated from the original astroffers-core data by

```
node scripts/catalog.mjs [path/to/astroffers-core/data]
```

It keeps the J2000 coordinates in radians and the size in arc minutes, and omits the missing values (4 MB → 1 MB).

### Preview images

The DSS2 color previews of the objects come from the [hips2fits](https://alasky.cds.unistra.fr/hips-image-services/hips2fits)
service of CDS (Strasbourg), with a field of view fitted to the size of the object.

## Deployment

[render.yaml](render.yaml) defines the `astroffers` static site on Render. Every build writes the deployed commit to
`/version`; open clients poll it and offer a reload when a new version is deployed.

## Known limitations

Times are displayed in the time zone of the device, so for a far away location the night is still shown in the
local time of the device.

## License

MIT
