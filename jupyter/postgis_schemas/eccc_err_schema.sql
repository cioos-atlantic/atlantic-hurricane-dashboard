CREATE TABLE IF NOT EXISTS "public"."eccc_storm_error_cones" (gid serial,
"STORMNAME" VARCHAR(80) NOT NULL);
ALTER TABLE "public"."eccc_storm_error_cones" ADD PRIMARY KEY (gid);
SELECT AddGeometryColumn('public','eccc_storm_error_cones','geom','4326','MULTIPOLYGON',2);
