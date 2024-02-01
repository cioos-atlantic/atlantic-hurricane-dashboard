-- Table: public.eccc_storm_wind_radii

-- DROP TABLE IF EXISTS public.eccc_storm_wind_radii;

CREATE TABLE IF NOT EXISTS public.eccc_storm_wind_radii
(
    gid serial,
    "STORMNAME" character varying(80) COLLATE pg_catalog."default" NOT NULL,
    "WINDFORCE" numeric NOT NULL,
    "TIMESTAMP" timestamp without time zone NOT NULL,
    "VALIDTIME" character varying(80) COLLATE pg_catalog."default" NOT NULL,
    geom geometry(MultiPolygon,4326),
    CONSTRAINT eccc_storm_wind_radii_pkey PRIMARY KEY (gid),
    CONSTRAINT eccc_storm_wind_radii_unique UNIQUE ("STORMNAME", "TIMESTAMP")
)

TABLESPACE pg_default;

COMMENT ON CONSTRAINT eccc_storm_wind_radii_unique ON public.eccc_storm_wind_radii
    IS 'Prevents duplicate records with the same storm name and timestamps';