# Stage 2 - Every way a Storm is changed

Entity: Storm. There is no single Storm table; it is spread over 4 table families [confirmed: data_ingest/postgis_schemas/*.sql]:
- `ibtracs_active_storms`, `ibtracs_historical_storms` (point rows per SID/ISO_TIME)
- `ibtracs_active_storm_lines`, `ibtracs_historical_storm_lines` (derived LineString + buffer per SID)
- `eccc_storm_points / _lines / _wind_radii / _error_cones` (forecast shapefile layers)
- `erddap_cache`, `erddap_cache_active` (station data keyed by `storm`; derived)

The react app is READ-ONLY for storms: API routes only GET and call WFS via `fetch` (react/pages/api/wfs_query.js: fetch_wfs_data). No POST, no WFS-T, no localStorage [confirmed by grep]. `mapReducer.js` (client UI state) holds only view state (e.g. TOGGLE_DATE_SELECTION) and is not persistence.

## Create / Replace (IBTrACS points)
| Trigger | Entry | File | Function | Reaches persistence via | Conf |
|---|---|---|---|---|---|
| Manual/external schedule (CLI) | `python integrate_ibtracs.py` | data_ingest/IBTrACS/integrate_ibtracs.py | process_files -> process_ibtracs | TRUNCATE (own txn) then pandas `to_sql` append + `UPDATE ... ST_MakePoint` | confirmed |
| Manual script / notebook | `load_into_postgis.py` (jupytext-style cells, `process_data` flag) | data_ingest/IBTrACS/load_into_postgis.py | process_ibtracs (l.234) | DELETE FROM + `to_sql` + UPDATE geom | confirmed |
| Manual (older copy) | sarracenia/load_into_postgis.py header SQL | data_ingest/sarracenia/load_into_postgis.py:9-10 | (comment/SQL snippet; refers to `active_storms`/`historical_storms` names that are not in current schemas) | n/a | inferred stale |
| Manual notebook | load_into_postgis.ipynb | data_ingest/IBTrACS/ | cells | same as above | inferred |

## Modify / Derive
| Trigger | Entry | File | Function | Persistence | Conf |
|---|---|---|---|---|---|
| Same CLI run, after points | integrate_ibtracs.py `__main__` | integrate_ibtracs.py | generate_ibtracs_lines (l.308) | TRUNCATE lines table, INSERT ... ST_MakeLine GROUP BY SID HAVING COUNT>1 | confirmed |
| Active filter | filter_ibtracs / is_storm_older_than_cutoff | integrate_ibtracs.py:502,521 | drops non-NA basin and storms >7 days stale BEFORE insert (so "active" = filter at ingest, not a status flag) | confirmed |
| ECCC points/lines/rad/err | file watcher | see Create-ECCC below | | | |

## Create (ECCC forecast layers)
| Trigger | Entry | File | Function | Persistence | Conf |
|---|---|---|---|---|---|
| Filesystem event (Sarracenia drops .shp into `ECCC_SHP_SOURCE`) | `on_created` (watchdog, recursive) | data_ingest/sarracenia/file_watcher.py:23 | -> lpg.process_eccc_shp | create_table_from_schema (CREATE IF NOT EXISTS) then `to_sql` append; IntegrityError caught => duplicate ignored | confirmed |
| Manual bulk backfill | `process_eccc_shp_files(dir)` | sarracenia/load_into_postgis.py:228 | globs `**/*.shp` -> process_eccc_shp | same | confirmed |
| Manual bulk (IBTrACS dir copy) | process_eccc_shp_files | IBTrACS/load_into_postgis.py:394 | but `populate_eccc_table` first `DELETE FROM` the whole table (l.283) => full replace | confirmed |
| Sarracenia subscription -> filesystem | dd_hurricane.conf | data_ingest/sarracenia/ | (external Sarracenia daemon downloads; not Python in repo) | unknown beyond config |

Dispatch on data_type (pts/lin/rad/err) is by filename regex `(date)_(time)Z_(storm).(type)` in process_eccc_shp (sarracenia/load_into_postgis.py:184) - string-based dispatch.

## Persist-other (derived storm-keyed data)
| Trigger | Entry | File | Function | Persistence | Conf |
|---|---|---|---|---|---|
| CLI `cache_ERDDAP.py active` (via storm_cacher.sh) | argparse subcommands (active / historical --storm/--min/--max) | data_ingest/ERDDAP/cache_ERDDAP.py:428-490 | cache_erddap_data (l.69) | DELETE by storm (+ station source) then `to_sql` then UPDATE geom; raw SQL via f-strings | confirmed |
| CLI historical | get_historical_storm_list (l.363) READS ibtracs_historical_storms to pick storms, then caches | same | confirmed |
| load_station_cache.py | script | data_ingest/ERDDAP/load_station_cache.py | not read in detail | [unknown] |
| DDL | postgis_schemas/*.sql, `create_table_from_schema` | runs CREATE TABLE IF NOT EXISTS / grants | confirmed |

## Delete
| Trigger | Where | Notes |
|---|---|---|
| Implicit in each reload | TRUNCATE (integrate_ibtracs.py:328, 456), DELETE FROM (IBTrACS/load_into_postgis.py:251,283), cache DELETE (cache_ERDDAP.py:76) | No dedicated delete/cancel/approve path; no storm lifecycle states. "Active -> historical" is just two independent files/tables, not a transition. |
| file_watcher on_deleted/on_modified/on_moved | commented out | ECCC rows are never removed when files are removed [confirmed] |

## Approve / Cancel
None exist [confirmed: no such concept in code].

## Bypass paths
- Everything bypasses any service/validation layer: scripts talk SQL directly, no ORM, no app API for writes.
- SQL built with f-strings from env/CLI/server values (cache_ERDDAP.py:76-78, 91; integrate_ibtracs.py table names). storm_id is regex-validated on CLI only (`[0-9]{4}_[A-Z].*`, pattern not anchored). Not exposed to the web, so low risk but fragile [confirmed].
- Manual DB edits / Geoserver admin are possible but invisible in repo [unknown].

## Counts (entry points by trigger type)
- CLI/script: 6 (integrate_ibtracs, IBTrACS/load_into_postgis, sarracenia/load_into_postgis, cache_ERDDAP active, cache_ERDDAP historical, load_station_cache)
- Filesystem watcher: 1 (file_watcher.on_created)
- HTTP routes that write: 0
- Queue consumers / webhooks / cron in-repo: 0 (scheduling is external)
- Notebooks: IBTrACS/load_into_postgis.ipynb, jupyter/* (exploratory, some write? not checked) [unknown]

## Coverage gaps
- Scheduler (cron/systemd/Sarracenia daemon) not in repo.
- Jupyter notebooks not inspected for writes.
- Duplicate code: sarracenia/ and IBTrACS/ both have `load_into_postgis.py` with divergent semantics (append+IntegrityError vs DELETE-all) [confirmed].
- IBTrACS/load_into_postgis.py not read past grep (argparse absent; top-level cell script).
- Possible bug: in integrate_ibtracs.process_ibtracs, `del_result` from TRUNCATE is a Result object (truthy), but `pg_conn.commit()` inside `engine.begin()` context is unusual; failure after TRUNCATE leaves table empty because truncate and insert are in separate transactions [inferred - not tested].
- Geoserver/DB-level triggers, views, or SQL in `erddap_cache*.sql` not examined.
