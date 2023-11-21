-- Table: public.eccc_storm_lines

-- DROP TABLE IF EXISTS public.eccc_storm_lines;

CREATE TABLE IF NOT EXISTS public.eccc_storm_lines
(
    gid serial,
    "TIMESTAMP" timestamp without time zone NOT NULL,
    "STORMNAME" character varying(80) COLLATE pg_catalog."default" NOT NULL,
    "STORMTYPE" integer NOT NULL,
    "BASIN" character varying(80) COLLATE pg_catalog."default" NOT NULL,
    geom geometry(MultiLineString,4326),
    CONSTRAINT eccc_storm_lines_pkey PRIMARY KEY (gid),
    CONSTRAINT eccc_storm_lines_unique UNIQUE ("STORMNAME", "TIMESTAMP")
)

TABLESPACE pg_default;

COMMENT ON CONSTRAINT eccc_storm_lines_unique ON public.eccc_storm_lines
    IS 'Prevents duplicate records with the same storm name and timestamps';