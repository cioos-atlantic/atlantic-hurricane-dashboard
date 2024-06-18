-- ERDDAP CACHE HISTORICAL

CREATE INDEX "erddap_cache_min-max_time_idx"
    ON public.erddap_cache USING btree
    (min_time ASC NULLS LAST, max_time ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX "erddap_cache_storm_idx"
    ON public.erddap_cache USING btree
    (storm ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX "erddap_cache_station_idx"
    ON public.erddap_cache USING btree
    (station ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

-- ERDDAP CACHE ACTIVE

CREATE INDEX "erddap_cache_active_min-max_time_idx"
    ON public.erddap_cache_active USING btree
    (min_time ASC NULLS LAST, max_time ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX "erddap_cache_active_storm_idx"
    ON public.erddap_cache_active USING btree
    (storm ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX "erddap_cache_active_station_idx"
    ON public.erddap_cache_active USING btree
    (station ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;
