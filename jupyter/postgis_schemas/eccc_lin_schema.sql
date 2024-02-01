CREATE TABLE IF NOT EXISTS "public"."eccc_storm_lines" (gid serial,
"TIMESTAMP" TIMESTAMP NOT NULL,
"STORMNAME" VARCHAR(80) NOT NULL,
"STORMTYPE" INT4 NOT NULL,
"BASIN" VARCHAR(80) NOT NULL,
PRIMARY KEY(gid));
SELECT AddGeometryColumn('public','eccc_storm_lines','geom','4326','MULTILINESTRING',2);
