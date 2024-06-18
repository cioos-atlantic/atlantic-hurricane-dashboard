-- ACTIVE INDEXES

CREATE INDEX IF NOT EXISTS ibtracs_active_storms_name_idx
    ON public.ibtracs_active_storms USING btree
    ("NAME" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS ibtracs_active_storms_season_idx
    ON public.ibtracs_active_storms USING btree
    ("SEASON" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS ibtracs_active_storms_iso_time_idx
    ON public.ibtracs_active_storms USING btree
    ("ISO_TIME" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS ibtracs_active_storms_basin_idx
    ON public.ibtracs_active_storms USING btree
    ("BASIN" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS ibtracs_active_storms_subbasin_idx
    ON public.ibtracs_active_storms USING btree
    ("SUBBASIN" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

-- HISTORICAL INDEXES

CREATE INDEX IF NOT EXISTS ibtracs_historical_storms_name_idx
    ON public.ibtracs_historical_storms USING btree
    ("NAME" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS ibtracs_historical_storms_season_idx
    ON public.ibtracs_historical_storms USING btree
    ("SEASON" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS ibtracs_historical_storms_iso_time_idx
    ON public.ibtracs_historical_storms USING btree
    ("ISO_TIME" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS ibtracs_historical_storms_basin_idx
    ON public.ibtracs_historical_storms USING btree
    ("BASIN" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS ibtracs_historical_storms_subbasin_idx
    ON public.ibtracs_historical_storms USING btree
    ("SUBBASIN" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

