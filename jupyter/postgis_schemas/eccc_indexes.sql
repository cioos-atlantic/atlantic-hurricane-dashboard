-- eccc_storm_error_cones
CREATE INDEX "eccc_storm_error_cones_timestamp_idx"
    ON public.eccc_storm_error_cones USING btree
    ("TIMESTAMP" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX "eccc_storm_error_cones_stormname_idx"
    ON public.eccc_storm_error_cones USING btree
    ("STORMNAME" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

-- eccc_storm_lines
CREATE INDEX "eccc_storm_lines_timestamp_idx"
    ON public.eccc_storm_lines USING btree
    ("TIMESTAMP" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX "eccc_storm_lines_stormname_idx"
    ON public.eccc_storm_lines USING btree
    ("STORMNAME" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

-- public.eccc_storm_points
CREATE INDEX "eccc_storm_points_timestamp_idx"
    ON public.eccc_storm_points USING btree
    ("TIMESTAMP" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX "eccc_storm_points_stormname_idx"
    ON public.eccc_storm_points USING btree
    ("STORMNAME" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

-- public.eccc_storm_wind_radii
CREATE INDEX "eccc_storm_wind_radii_timestamp_idx"
    ON public.eccc_storm_wind_radii USING btree
    ("TIMESTAMP" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX "eccc_storm_wind_radii_stormname_idx"
    ON public.eccc_storm_wind_radii USING btree
    ("STORMNAME" ASC NULLS LAST)
    WITH (deduplicate_items=True)
    TABLESPACE pg_default;
