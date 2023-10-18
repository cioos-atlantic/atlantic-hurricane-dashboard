-- Table: public.eccc_storm_points

-- DROP TABLE IF EXISTS public.eccc_storm_points;

CREATE TABLE IF NOT EXISTS public.eccc_storm_points
(
    gid serial,
    "STORMNAME" character varying(80) COLLATE pg_catalog."default" NOT NULL,
    "STORMTYPE" integer NOT NULL,
    "BASIN" character varying(80) COLLATE pg_catalog."default" NOT NULL,
    "ADVDATE" character varying(80) COLLATE pg_catalog."default" NOT NULL,
    "STORMFORCE" integer NOT NULL,
    "LAT" numeric NOT NULL,
    "LON" numeric NOT NULL,
    "TIMESTAMP" timestamp without time zone NOT NULL,
    "VALIDTIME" character varying(80) COLLATE pg_catalog."default",
    "TAU" integer NOT NULL,
    "MAXWIND" integer NOT NULL,
    "MSLP" numeric NOT NULL,
    "TCDVLP" character varying(80) COLLATE pg_catalog."default" NOT NULL,
    "DATELBL" character varying(80) COLLATE pg_catalog."default" NOT NULL,
    "TIMEZONE" character varying(80) COLLATE pg_catalog."default" NOT NULL,
    "ERRCT" numeric NOT NULL,
    "R34NE" integer NOT NULL,
    "R34SE" integer NOT NULL,
    "R34SW" integer NOT NULL,
    "R34NW" integer NOT NULL,
    "R48NE" integer NOT NULL,
    "R48SE" integer NOT NULL,
    "R48SW" integer NOT NULL,
    "R48NW" integer NOT NULL,
    "R64NE" integer NOT NULL,
    "R64SE" integer NOT NULL,
    "R64SW" integer NOT NULL,
    "R64NW" integer NOT NULL,
    geom geometry(Point,4326),
    CONSTRAINT eccc_storm_points_pkey PRIMARY KEY (gid),
    CONSTRAINT eccc_storm_points_unique UNIQUE ("STORMNAME", "TIMESTAMP")
)

TABLESPACE pg_default;

COMMENT ON CONSTRAINT eccc_storm_points_unique ON public.eccc_storm_points
    IS 'Prevents duplicate records with the same storm name and timestamps';