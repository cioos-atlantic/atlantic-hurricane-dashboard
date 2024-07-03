-- Table: public.erddap_cache_active

-- DROP TABLE IF EXISTS public.erddap_cache_active;

CREATE TABLE IF NOT EXISTS public.erddap_cache_active
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
    geom geometry(Point,4326),
    CONSTRAINT "PK_erddap_cache_active" PRIMARY KEY (station, min_time)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.erddap_cache_active
    OWNER to hurricane_dash;

COMMENT ON TABLE public.erddap_cache_active
    IS 'A table for caching recent station data stored on CIOOS Atlantic ERDDAP servers';
