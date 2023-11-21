-- Table: public.eccc_storm_error_cones

-- DROP TABLE IF EXISTS public.eccc_storm_error_cones;

CREATE TABLE IF NOT EXISTS public.eccc_storm_error_cones
(
    gid serial,
    "STORMNAME" character varying(80) COLLATE pg_catalog."default" NOT NULL,
    "TIMESTAMP" timestamp without time zone NOT NULL,
    geom geometry(MultiPolygon,4326),
    CONSTRAINT eccc_storm_error_cones_pkey PRIMARY KEY (gid),
    CONSTRAINT eccc_storm_err_cones_unique UNIQUE ("STORMNAME", "TIMESTAMP")
)

TABLESPACE pg_default;

COMMENT ON CONSTRAINT eccc_storm_err_cones_unique ON public.eccc_storm_error_cones
    IS 'Prevents duplicate records with the same storm name and timestamps';