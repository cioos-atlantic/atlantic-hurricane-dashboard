CREATE TABLE IF NOT EXISTS "public"."eccc_storm_wind_radii" (gid serial,
"STORMNAME" VARCHAR(80) NOT NULL,
"WINDFORCE" NUMERIC NOT NULL,
"TIMESTAMP" VARCHAR(80) NOT NULL,
"VALIDTIME" VARCHAR(80) NOT NULL);
ALTER TABLE "public"."eccc_storm_wind_radii" ADD PRIMARY KEY (gid);
SELECT AddGeometryColumn('public','eccc_storm_wind_radii','geom','4326','MULTIPOLYGON',2);
