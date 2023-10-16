-- Table: public.erddap_cache

-- DROP TABLE IF EXISTS public.erddap_cache;

CREATE TABLE IF NOT EXISTS public.erddap_cache
(
    storm character varying(50) COLLATE pg_catalog."default" NOT NULL,
    station character varying(100) COLLATE pg_catalog."default" NOT NULL,
    min_time timestamp with time zone NOT NULL,
    max_time timestamp with time zone NOT NULL,
    min_lon numeric NOT NULL,
    max_lon numeric NOT NULL,
    min_lat numeric NOT NULL,
    max_lat numeric NOT NULL,
    station_data text COLLATE pg_catalog."default" NOT NULL,
    geom geometry NOT NULL,
    CONSTRAINT "PK_erddap_cache" PRIMARY KEY (storm, station, min_time, max_time)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.erddap_cache
    OWNER to hurricane_dash;

COMMENT ON TABLE public.erddap_cache
    IS 'A table for caching storm data stored on CIOOS Atlantic ERDDAP servers';