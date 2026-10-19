# Stage 1 - Shape of the application (ocean-storm-viewer)

## Layout
Two-part repo, not a workspace monorepo [confirmed: no root package.json / workspaces].
- `react/` - Next.js frontend + API routes (~13 top files, 82 in components, 13 pages, 3 lib, 107 static data files)
- `data_ingest/` - Python ETL feeding PostGIS/Geoserver (ERDDAP 10, IBTrACS 5, sarracenia 13, postgis_schemas 16, jupyter 14, sample_data 14)
- Root: `environment.yml`, README.md, FAQ.md, USERGUIDE.md

## Language, framework, runtime
- JS: Next.js ^15.2.4 (pages router), React 18.3, Node 20 in Docker [confirmed: react/package.json, react/Dockerfile]
- Python (conda env `storm-viewer` / `hurricane`) for ingest [confirmed: environment.yml, data_ingest/ERDDAP/storm_cacher.sh]
- UI: MUI 6, react-bootstrap, Leaflet (+draw, markercluster), Plotly, Chart.js, @antv/g2, SWR [confirmed]

## Entry points
- Next pages: `react/pages/index.js`, `about_page.js`, `404.js`, `_app.js` [confirmed]
- API routes (`react/pages/api/`): active_storms, filter_storms, historical_storms, query_stations, query_stations_historical, station_data, storm_name, storm_names, wfs_query (shared helper) [confirmed]
- Scripts: `npm run dev` (port 3500) / `start` (3600); Docker `CMD node server.js` on :3000 [confirmed]
- Ingest: `data_ingest/ERDDAP/cache_ERDDAP.py`, `load_station_cache.py`, `storm_cacher.sh`; `IBTrACS/integrate_ibtracs.py`, `load_into_postgis.py`; `sarracenia/file_watcher.py`, `load_into_postgis.py` [confirmed]

## Major modules (react/)
- `components/` map (map.js, default_map.js, mapReducer.js), storm layers (wind_radii, error_cone, line_of_travel, stormPoint), `storm_dashboard/`, `station_dashboard/`, `Dashboard/`, `historical_storm/`, `Storm_popup/`, `utils/` (station_data_init/format, unit_conversion)
- `lib/` storm_cat.js, storm_class.js, storm_utils.js
- `data/` static FAQ + sample ECCC forecasts (`data/forecasts/eccc/...`) [confirmed]

## Database technologies
- PostgreSQL + PostGIS, schemas in `data_ingest/postgis_schemas/*.sql` (eccc_*, erddap_cache*, ibtracs_*, active/historical storm) [confirmed]
- Frontend does NOT talk to the DB directly: API routes call Geoserver WFS via `fetch` in `pages/api/wfs_query.js` [confirmed]. `pg` is in package.json but no import found in react/ [confirmed by grep; likely unused dep].

## External integrations
- Geoserver WFS (env `NEXT_PUBLIC_GEOSERVER_BASE_URL`, `NEXT_PUBLIC_GEOSERVER_WORKSPACE`) [confirmed]
- ERDDAP servers (station data), IBTrACS (NOAA NCEI), ECCC via Sarracenia/Datamart (dd_hurricane.conf) [confirmed in data_ingest]
- Map tiles: ArcGIS, OpenStreetMap, OpenTopoMap [confirmed by URL grep]
- @usersnap/browser (feedback widget) [inferred from dep]

## Background processing / scheduled tasks
- No queue libs. Sarracenia subscription + watchdog `file_watcher.py` triggers `load_into_postgis.py` on new ECCC files [confirmed]
- ERDDAP caching run via `storm_cacher.sh` (`python cache_ERDDAP.py active`); scheduler itself not in repo, presumably external cron [unknown - no crontab/CI schedule found]
- IBTrACS "automatically fetched at regular intervals" (data_ingest/README.md) - mechanism not in repo [unknown]
- No `.github/` directory [confirmed]

## Authentication
None found in react/ (grep for auth/login empty) [confirmed]. Public read-only app.

## Configuration sources
- `react/.env.local` (BASE_URL, NEXT_PUBLIC_GEOSERVER_BASE_URL, NEXT_PUBLIC_GEOSERVER_WORKSPACE, REACT_EDITOR); `data_ingest/*/.env.template` for ingest [confirmed]
- `next.config.js`: `basePath: '/ocean-storm-viewer'`, `output: standalone` [confirmed]
- ERDDAP config JSONs/INI in `data_ingest/ERDDAP/config/` [confirmed]

## Tests
- Jest 30 + jsdom + Testing Library via next/jest (`react/jest.config.js`, `jest.setup.js`) [confirmed]
- Tests: `react/__tests__/api/query_stations.test.js`, `components/header_nav.test.js`, `mapReducer.test.js`, `utils/station_data_init.test.js`, `utils/unit_conversion.test.js` - all unit; no e2e [confirmed]
- Branch `add_test_framework`, these files are staged but uncommitted. Python has only `jupyter/test_script.py` [confirmed]

## Likely architectural boundaries
Browser (React/Leaflet) -> Next API routes (`pages/api`, thin handlers) -> `wfs_query.js` -> Geoserver WFS -> PostGIS <- Python ingest (ERDDAP, IBTrACS, ECCC). [inferred from the above]

## Surprising / notes
- `react/data/` holds 107 committed sample forecast files; `wfs_query.js` has commented-out static-JSON imports (legacy) [confirmed]
- `.next/` and `.swc/` exist locally; `fs`/`path` npm packages are listed as deps (unneeded shims) [confirmed]
- Dockerfile healthcheck hits `/health` but basePath is `/ocean-storm-viewer`; compose healthcheck uses that path. Possible mismatch [inferred]
- `data_ingest/sarracenia/*.sql` duplicates `postgis_schemas/eccc_*.sql` [inferred from filenames]
- Duplicated `.gitignore` paths (`jupyter/postgis_schemas/...`) look stale [inferred]

Checkpoint

- Uncertain / needs your input: what schedules the ERDDAP and IBTrACS jobs (probably external cron). Whether pg and the /health healthcheck are really unused or broken. I read no implementation details yet.
- Suggested focus for next stage: the entity to trace in Stage 2. The best candidates are (1) Storm (active, historical, ECCC, IBTrACS rows) and (2) - Station observation cache (ERDDAP). (3) The ECCC forecast layers (pts, lin, rad, err) and (4) client map state (mapReducer) are also options. In this repo the writes are mostly in data_ingest/.