# Stage 3 - Trace: Load ECCC forecast shapefile into PostGIS

Chain: 1.Sarracenia download -> 2.file_watcher.on_created -> 3.process_eccc_shp -> 4.shp_to_json -> 5.build_eccc_<type> -> 6.create_table_from_schema -> 7.populate_eccc_table -> 8.(later) Geoserver WFS -> Next API

## Part A
1. ECCC Datamart AMQP post `v02.post.trajectoires.hurricane.shapefile.#` (data_ingest/sarracenia/dd_hurricane.conf: broker amqps://dd.weather.gc.ca/, instances 2) - external Sarracenia daemon writes files into `/srv/data/hurricane_dashboard/sarracenia_config` [confirmed config; daemon not in repo]
   ASYNC BOUNDARY (AMQP -> filesystem -> inotify). Consumer = file_watcher.py watching env ECCC_SHP_SOURCE [inferred: the two paths must match; not enforced]
2. on_created(event) - sarracenia/file_watcher.py:23
3. process_eccc_shp(path, engine) - sarracenia/load_into_postgis.py:184
4. shp_to_json - :64 (pyshp `__geo_interface__`)
5. build_eccc_points :97 | build_eccc_lines :115 | build_eccc_wind_radii :139 | build_eccc_error_cone :160 (chosen by data_type pts/lin/rad/err)
6. create_table_from_schema - :78
7. populate_eccc_table - :72
8. Read side: Geoserver publishes tables over WFS; react/pages/api/wfs_query.js fetch_wfs_data [confirmed WFS usage; Geoserver layer config not in repo]

## Part B
1. Datamart post
   state change: new files (.shp/.dbf/.shx...) on disk. external call: AMQP broker. error: Sarracenia retries/expire 10m [inferred from conf]
2. on_created
   file: file_watcher.py:23. input: watchdog FileCreatedEvent. output: none.
   Acts only if ".shp" is a substring of src_path (substring, so `.shp.xml` also matches) [confirmed]. sleep(1) to wait for write completion - race with .dbf/.shx arriving later [inferred risk].
   Creates its own engine via lpg.pg_engine() per file, disposes after (not in finally).
   error: no try/except; any exception other than the one caught below propagates out of the handler into watchdog's dispatch thread [confirmed no handling; thread-death behavior inferred].
3. process_eccc_shp
   input: shp path. Filename must match `(\d+)_(\d+)Z_(\w+)\.(\w+).*` -> date, time, storm, type [confirmed]. A non-matching name raises AttributeError (match() returns None).
   Unknown type: destination_table stays "" and return_df empty -> create_table_from_schema/to_sql with empty table name fails [inferred].
   output: none. error: catches only exc.IntegrityError and logs "Duplicate Detected".
4. shp_to_json: reads the shapefile via pyshp; fails on missing sidecar files.
5. build_*: takes ONLY the first feature (`[0]`) [confirmed]. Lines/err set TIMESTAMP from filename date+time (UTC). Points/rad take TIMESTAMP from shapefile properties [inferred, no code sets it]. Builds a PostGIS expression by f-string from coordinates and runs `SELECT ST_Make...` via an engine.connect() to get a geometry value, put in the df `geom` column.
   external call: DB (read-only SELECT per file). state change: none in DB. in-memory DataFrame.
   Note: rad builds polygon from coordinates[0] (outer ring only) [confirmed]; geometry returned with SRID 0, column typed SRID 4326 - PostGIS assigns typmod SRID to SRID-0 input [inferred, matches production usage].
6. create_table_from_schema
   state change: runs the schema .sql file (CREATE TABLE IF NOT EXISTS ...) when pg_tables lacks the table; own transaction (engine.begin) plus an explicit COMMIT. Schema path from env ECCC_*_SCHEMA. error: raises.
7. populate_eccc_table
   state change: `df.to_sql(..., if_exists='append', method='multi')` into eccc_storm_{points,lines,wind_radii,error_cones}. Unique (STORMNAME, TIMESTAMP) on every table [confirmed: sarracenia/eccc_*_schema.sql]. Duplicate -> IntegrityError -> ignored (idempotent). Each file is its own transaction.
8. Downstream read: no cache invalidation; frontend reads whatever Geoserver serves.

### Side-effect summary (in order)
1. File written (Sarracenia) - outside DB
2. SELECT ST_Make* (no txn needed)
3. Possible CREATE TABLE (txn A)
4. INSERT row(s) (txn B, autocommit by pandas/SQLAlchemy)
Steps 3 and 4 are separate transactions.

### Failure matrix
| Failure | Effect |
|---|---|
| DB down at step 2 (SELECT) | exception escapes handler; file never loaded; no retry; later file creations still trigger [inferred] |
| Filename mismatch | AttributeError, file skipped, only the watchdog thread's error output shows it |
| Duplicate (STORMNAME, TIMESTAMP) | ignored, logged |
| INSERT fails other than IntegrityError | table may exist but row missing; no retry, no dead-letter |
| .shp seen before .dbf/.shx | pyshp error, file permanently skipped (on_created fires once) [inferred] |
| Watcher not running | files accumulate; no catch-up except manual process_eccc_shp_files(dir) (backfill) |

### Untraced / uncertain
- Sarracenia daemon, process supervision, and which dir receives files (host-specific).
- Geoserver layer definitions/styles; whether the 4 tables (pts/lin/rad/err) are separate layers.
- Where TIMESTAMP originates for pts/rad (shapefile attributes assumed).
- STOP_FILE env mechanism for shutdown (file_watcher.py main) - exists, out of scope.
- IBTrACS/load_into_postgis.py variant of the same path differs (DELETE-all before insert).
