CREATE TABLE IF NOT EXISTS "public"."eccc_storm_lines" (gid serial,
"STORMNAME" VARCHAR(80) NOT NULL,
"STORMTYPE" INT4 NOT NULL,
"BASIN" VARCHAR(80) NOT NULL);
ALTER TABLE "public"."eccc_storm_lines" ADD PRIMARY KEY (gid);
SELECT AddGeometryColumn('public','eccc_storm_lines','geom','4326','MULTILINESTRING',2);
