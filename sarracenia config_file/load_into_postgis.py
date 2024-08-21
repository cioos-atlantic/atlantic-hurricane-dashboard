"""
SQL Queries to be run after ingestion of data to define point geometry objects 
based on lat/lon of data for use with Geoserver, helps Geoserver define 
bounding boxes and such

ALTER TABLE public.active_storms ADD COLUMN geom geometry(Point, 4326);
ALTER TABLE public.historical_storms ADD COLUMN geom geometry(Point, 4326);

UPDATE public.active_storms SET geom = ST_SetSRID(ST_MakePoint("LON", "LAT"), 4326);
UPDATE public.historical_storms SET geom = ST_SetSRID(ST_MakePoint("LON", "LAT"), 4326);
"""
import re
import os
from dotenv import load_dotenv
import pandas as pd
import psycopg2
from sqlalchemy import create_engine, text, exc, Engine
from pathlib import Path
import shapefile
import json
import logging

logger= logging.getLogger(__name__)
load_dotenv()

#pg_ibtracs_historical_table = os.getenv('PG_IBTRACS_HISTORICAL_TABLE')
#pg_ibtracs_active_table = os.getenv('PG_IBTRACS_ACTIVE_TABLE')
pg_eccc_table = os.getenv('PG_ECCC_ACTIVE_TABLE')

eccc_shp_path_src = Path(os.getenv('ECCC_SHP_SOURCE'))

eccc_pts_schema = Path(os.getenv('ECCC_PTS_SCHEMA'))
eccc_lin_schema = Path(os.getenv('ECCC_LIN_SCHEMA'))
eccc_rad_schema = Path(os.getenv('ECCC_RAD_SCHEMA'))
eccc_err_schema = Path(os.getenv('ECCC_ERR_SCHEMA'))

# Tells pandas to skip the 2nd line in the CSV file that specifies unit types 
# for the columns - this row doesn't need to be inserted into the postgis table
skip_rows = [1]

# Empty values in the CSV file are represented by an empty string, this value 
# isn't accounted for by default in pandas, so it needs to be specified here, 
# a dictionary of values is also possible if there are other values that 
# should be interpreted as null or n/a
na_values = ' '

# IBTRACS data types, derived from postgres table structure

# eccc_source_path = Path(os.getenv('ECCC_SHP_SOURCE'))
def pg_engine():
    """
    Create a PostGIS database engine using .env variables and return the engine object
    """
    pg_host = os.getenv('PG_HOST')
    pg_port = int(os.getenv('PG_PORT'))
    pg_user = os.getenv('PG_USER')
    pg_pass = os.getenv('PG_PASS')
    pg_db = os.getenv('PG_DB')

    engine = create_engine(f"postgresql+psycopg2://{pg_user}:{pg_pass}@{pg_host}:{pg_port}/{pg_db}")

    return engine

def shp_to_json(shp_file:Path):
    shp_file_obj = shapefile.Reader(shp_file.as_posix())

    json_data = shp_file_obj.__geo_interface__

    return(json_data)


def populate_eccc_table(source_df:pd.DataFrame, destination_table:str, pg_engine:Engine):
    # populate table
    logger.info("Populating Table...")
    source_df.to_sql(destination_table, pg_engine, chunksize=1000, method='multi', if_exists='append', index=False, schema='public')


def create_table_from_schema(pg_engine, table_name, schema_file, pg_schema='public'):
    """
    Create ECCC destination table if it does not exist
    """
    with pg_engine.begin() as pg_conn:
        logger.info(f"Creating Table {table_name} (if not exists)...")

        sql = f"SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = '{pg_schema}' AND tablename = '{table_name}');"
        result = pg_conn.execute(text(sql))
        table_exists = result.first()[0]

        if not table_exists:
            sql = Path(schema_file).read_text()
            pg_conn.execute(text(sql))

            logger.debug("Committing Transaction.")
            pg_conn.execute(text("COMMIT;"))


def build_eccc_points(json_data, df, pg_engine):
    # return properties of features collection to form an array of 
    # point data
    point_data = list(map(lambda feature: feature["properties"], json_data["features"]))[0]
    point_string = f"ST_MakePoint({point_data['LON']}, {point_data['LAT']})"

    # Use PostGIS to generate geometry string
    with pg_engine.connect() as pg_conn:
        sql = f"SELECT {point_string} as geom_string;"
        result = pg_conn.execute(text(sql))
        geo_string = result.first()[0]
        point_data["geom"] = geo_string

    temp_df = pd.DataFrame([point_data])
    
    return pd.concat([df, temp_df])


def build_eccc_lines(json_data, df, pg_engine, storm_date, storm_time):
    line_data = json_data["features"][0]["properties"]
    
    # Assemble timestamp to become part of table data
    line_data["TIMESTAMP"] = pd.to_datetime(f"{storm_date} {storm_time}", format="%Y%m%d %H%M%S", utc=True)
    
    line_coords = list(map(lambda coord: f"{coord[0]}, {coord[1]}", json_data["features"][0]["geometry"]["coordinates"]))

    # Translate list of coordinates (2d Array LON/LAT) into a query for PostGIS
    # to generate the geometry value for the dataframe
    line_string = "ST_Multi(ST_MakeLine(ARRAY[ST_MakePoint(" + "), ST_MakePoint(".join(line_coords) + ")]))"

    # Use PostGIS to generate geometry string
    with pg_engine.connect() as pg_conn:
        sql = f"SELECT {line_string} as geom_string;"
        result = pg_conn.execute(text(sql))
        geo_string = result.first()[0]
        line_data["geom"] = geo_string

    temp_df = pd.DataFrame([line_data])
    
    return pd.concat([df, temp_df])


def build_eccc_wind_radii(json_data, df, pg_engine):
    rad_data = list(map(lambda feature: feature["properties"], json_data["features"]))[0]
    poly_coords = list(map(lambda coord: f"{coord[0]}, {coord[1]}", json_data["features"][0]["geometry"]["coordinates"][0]))

    # Translate list of coordinates (2d Array LON/LAT) into a query for PostGIS
    # to generate the geometry value for the dataframe
    poly_string = "ST_Multi(ST_MakePolygon(ST_MakeLine(ARRAY[ST_MakePoint(" + "), ST_MakePoint(".join(poly_coords) + ")])))"

    # Use PostGIS to generate geometry string
    with pg_engine.connect() as pg_conn:
        sql = f"SELECT {poly_string} as geom_string;"
        result = pg_conn.execute(text(sql))
        geo_string = result.first()[0]
        rad_data["geom"] = geo_string


    temp_df = pd.DataFrame([rad_data])

    return pd.concat([df, temp_df])


def build_eccc_error_cone(json_data, df, pg_engine, storm_date, storm_time):
    err_data = json_data["features"][0]["properties"]
    
    # Assemble timestamp to become part of table data
    err_data["TIMESTAMP"] = pd.to_datetime(f"{storm_date} {storm_time}", format="%Y%m%d %H%M%S", utc=True)
    
    line_coords = list(map(lambda coord: f"{coord[0]}, {coord[1]}", json_data["features"][0]["geometry"]["coordinates"][0]))

    # Translate list of coordinates (2d Array LON/LAT) into a query for PostGIS
    # to generate the geometry value for the dataframe
    line_string = "ST_Multi(ST_MakePolygon(ST_MakeLine(ARRAY[ST_MakePoint(" + "), ST_MakePoint(".join(line_coords) + ")])))"

    # Use PostGIS to generate geometry string
    with pg_engine.connect() as pg_conn:
        sql = f"SELECT {line_string} as geom_string;"
        result = pg_conn.execute(text(sql))
        geo_string = result.first()[0]
        err_data["geom"] = geo_string

    temp_df = pd.DataFrame([err_data])
    
    return pd.concat([df, temp_df])


def process_eccc_shp(shp_file_path:str, pg_engine:Engine):
    """
    Processes an ECCC hurricane .shp file into PostGIS
    """
    return_df = pd.DataFrame()
    destination_table = ""
    target_schema = ""

    shp_file = Path(shp_file_path)

    filename_parser = re.compile(r'(?P<date>\d+)_(?P<time>\d+)Z_(?P<storm>\w+)\.(?P<type>\w+).*')

    (storm_date, storm_time, storm_name, data_type) = filename_parser.match(shp_file.name).groupdict().values()

    json_data = shp_to_json(shp_file=shp_file)

    if data_type == "pts":
        return_df = build_eccc_points(json_data, return_df, pg_engine)
        destination_table = 'eccc_storm_points'
        target_schema = eccc_pts_schema

    elif data_type == "lin":
        return_df = build_eccc_lines(json_data, return_df, pg_engine, storm_date, storm_time)
        destination_table = 'eccc_storm_lines'
        target_schema = eccc_lin_schema

    elif data_type == "rad":
        return_df = build_eccc_wind_radii(json_data, return_df, pg_engine)
        destination_table = 'eccc_storm_wind_radii'
        target_schema = eccc_rad_schema

    elif data_type == "err":
        return_df = build_eccc_error_cone(json_data, return_df, pg_engine, storm_date, storm_time)
        destination_table = 'eccc_storm_error_cones'
        target_schema = eccc_err_schema

    create_table_from_schema(pg_engine=pg_engine, table_name=destination_table, schema_file=target_schema)
    
    try: 
        populate_eccc_table(source_df=return_df, destination_table=destination_table, pg_engine=pg_engine)
    except exc.IntegrityError:
        logger.info(f"[Duplicate Detected]: {shp_file.name} already integrated. Ignoring.")


def process_eccc_shp_files(source_dir, pg_engine):
    """
    Iterates through a directory and all subdirectories looking for .shp files to process and integrate into PostGIS database
    """
    source_search_pattern = "**/*.shp"

    # Check and, if necessary, create ECCC tables

    for shp_file_path in Path(source_dir).glob(source_search_pattern):
        process_eccc_shp(shp_file_path, pg_engine)
