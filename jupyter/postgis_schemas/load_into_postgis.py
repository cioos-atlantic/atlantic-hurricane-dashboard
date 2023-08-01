# %%
# install psycopg2 module to support SQL Alchemy and postgresql

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
from sqlalchemy import create_engine, text
from pathlib import Path
import shapefile
import json

load_dotenv()

pg_host = os.getenv('PG_HOST')
pg_port = int(os.getenv('PG_PORT'))
pg_user = os.getenv('PG_USER')
pg_pass = os.getenv('PG_PASS')
pg_db = os.getenv('PG_DB')

pg_ibtracs_historical_table = os.getenv('PG_IBTRACS_HISTORICAL_TABLE')
pg_ibtracs_active_table = os.getenv('PG_IBTRACS_ACTIVE_TABLE')
pg_eccc_table = os.getenv('PG_ECCC_ACTIVE_TABLE')

ibtracs_active_file = Path(os.getenv('ACTIVE_STORMS_CSV'))
ibtracs_historical_file = Path(os.getenv('HISTORICAL_STORMS_CSV'))

ibtracs_active_schema = Path(os.getenv('IBTRACS_ACTIVE_SCHEMA'))
ibtracs_historical_schema = Path(os.getenv('IBTRACS_HISTORICAL_SCHEMA'))

eccc_shp_path_src = Path(os.getenv('ECCC_SHP_SOURCE'))

eccc_pts_schema = Path(os.getenv('ECCC_PTS_SCHEMA'))
eccc_lin_schema = Path(os.getenv('ECCC_LIN_SCHEMA'))
eccc_rad_schema = Path(os.getenv('ECCC_RAD_SCHEMA'))
eccc_err_schema = Path(os.getenv('ECCC_ERR_SCHEMA'))

process_data = os.getenv('PROCESS_DATA').split(",")

# Tells pandas to skip the 2nd line in the CSV file that specifies unit types 
# for the columns - this row doesn't need to be inserted into the postgis table
skip_rows = [1]

# Empty values in the CSV file are represented by an empty string, this value 
# isn't accounted for by default in pandas, so it needs to be specified here, 
# a dictionary of values is also possible if there are other values that 
# should be interpreted as null or n/a
na_values = ' '

# IBTRACS data types, derived from postgres table structure
table_dtypes = {
    "SID": 'string', 
    "SEASON": 'Float32', 
    "NUMBER": 'Float32', 
    "BASIN": 'string', 
    "SUBBASIN": 'string', 
    "NAME": 'string', 
    "ISO_TIME": 'string', 
    "NATURE": 'string', 
    "LAT": 'Float32', 
    "LON": 'Float32', 
    "WMO_WIND": 'Float32', 
    "WMO_PRES": 'Float32', 
    "WMO_AGENCY": 'string', 
    "TRACK_TYPE": 'string', 
    "DIST2LAND": 'Float32', 
    "LANDFALL": 'Float32', 
    "IFLAG": 'string', 
    "USA_AGENCY": 'string', 
    "USA_ATCF_ID": 'string', 
    "USA_LAT": 'Float32', 
    "USA_LON": 'Float32', 
    "USA_RECORD": 'string', 
    "USA_STATUS": 'string', 
    "USA_WIND": 'Float32', 
    "USA_PRES": 'Float32', 
    "USA_SSHS": 'Float32', 
    "USA_R34_NE": 'Float32', 
    "USA_R34_SE": 'Float32', 
    "USA_R34_SW": 'Float32', 
    "USA_R34_NW": 'Float32', 
    "USA_R50_NE": 'Float32', 
    "USA_R50_SE": 'Float32', 
    "USA_R50_SW": 'Float32', 
    "USA_R50_NW": 'Float32', 
    "USA_R64_NE": 'Float32', 
    "USA_R64_SE": 'Float32', 
    "USA_R64_SW": 'Float32', 
    "USA_R64_NW": 'Float32', 
    "USA_POCI": 'Float32', 
    "USA_ROCI": 'Float32', 
    "USA_RMW": 'Float32', 
    "USA_EYE": 'Float32', 
    "TOKYO_LAT": 'Float32', 
    "TOKYO_LON": 'Float32', 
    "TOKYO_GRADE": 'Float32', 
    "TOKYO_WIND": 'Float32', 
    "TOKYO_PRES": 'Float32', 
    "TOKYO_R50_DIR": 'Float32', 
    "TOKYO_R50_LONG": 'Float32', 
    "TOKYO_R50_SHORT": 'Float32', 
    "TOKYO_R30_DIR": 'Float32', 
    "TOKYO_R30_LONG": 'Float32', 
    "TOKYO_R30_SHORT": 'Float32', 
    "TOKYO_LAND": 'Float32', 
    "CMA_LAT": 'Float32', 
    "CMA_LON": 'Float32', 
    "CMA_CAT": 'Float32', 
    "CMA_WIND": 'Float32', 
    "CMA_PRES": 'Float32', 
    "HKO_LAT": 'Float32', 
    "HKO_LON": 'Float32', 
    "HKO_CAT": 'string', 
    "HKO_WIND": 'Float32', 
    "HKO_PRES": 'Float32', 
    "NEWDELHI_LAT": 'Float32', 
    "NEWDELHI_LON": 'Float32', 
    "NEWDELHI_GRADE": 'string', 
    "NEWDELHI_WIND": 'Float32', 
    "NEWDELHI_PRES": 'Float32', 
    "NEWDELHI_CI": 'Float32', 
    "NEWDELHI_DP": 'Float32', 
    "NEWDELHI_POCI": 'Float32', 
    "REUNION_LAT": 'Float32', 
    "REUNION_LON": 'Float32', 
    "REUNION_TYPE": 'string', 
    "REUNION_WIND": 'Float32', 
    "REUNION_PRES": 'Float32', 
    "REUNION_TNUM": 'string', 
    "REUNION_CI": 'string', 
    "REUNION_RMW": 'Float32', 
    "REUNION_R34_NE": 'Float32', 
    "REUNION_R34_SE": 'Float32', 
    "REUNION_R34_SW": 'Float32', 
    "REUNION_R34_NW": 'Float32', 
    "REUNION_R50_NE": 'Float32', 
    "REUNION_R50_SE": 'Float32', 
    "REUNION_R50_SW": 'Float32', 
    "REUNION_R50_NW": 'Float32', 
    "REUNION_R64_NE": 'Float32', 
    "REUNION_R64_SE": 'Float32', 
    "REUNION_R64_SW": 'Float32', 
    "REUNION_R64_NW": 'Float32', 
    "BOM_LAT": 'Float32', 
    "BOM_LON": 'Float32', 
    "BOM_TYPE": 'string', 
    "BOM_WIND": 'Float32', 
    "BOM_PRES": 'Float32', 
    "BOM_TNUM": 'string', 
    "BOM_CI": 'string', 
    "BOM_RMW": 'Float32', 
    "BOM_R34_NE": 'Float32', 
    "BOM_R34_SE": 'Float32', 
    "BOM_R34_SW": 'Float32', 
    "BOM_R34_NW": 'Float32', 
    "BOM_R50_NE": 'Float32', 
    "BOM_R50_SE": 'Float32', 
    "BOM_R50_SW": 'Float32', 
    "BOM_R50_NW": 'Float32', 
    "BOM_R64_NE": 'Float32', 
    "BOM_R64_SE": 'Float32', 
    "BOM_R64_SW": 'Float32', 
    "BOM_R64_NW": 'Float32', 
    "BOM_ROCI": 'Float32', 
    "BOM_POCI": 'Float32', 
    "BOM_EYE": 'Float32', 
    "BOM_POS_METHOD": 'string', 
    "BOM_PRES_METHOD": 'string', 
    "NADI_LAT": 'Float32', 
    "NADI_LON": 'Float32', 
    "NADI_CAT": 'Float32', 
    "NADI_WIND": 'Float32', 
    "NADI_PRES": 'Float32', 
    "WELLINGTON_LAT": 'Float32', 
    "WELLINGTON_LON": 'Float32', 
    "WELLINGTON_WIND": 'Float32', 
    "WELLINGTON_PRES": 'Float32', 
    "DS824_LAT": 'Float32', 
    "DS824_LON": 'Float32', 
    "DS824_STAGE": 'string', 
    "DS824_WIND": 'Float32', 
    "DS824_PRES": 'Float32', 
    "TD9636_LAT": 'Float32', 
    "TD9636_LON": 'Float32', 
    "TD9636_STAGE": 'Float32', 
    "TD9636_WIND": 'Float32', 
    "TD9636_PRES": 'Float32', 
    "TD9635_LAT": 'Float32', 
    "TD9635_LON": 'Float32', 
    "TD9635_WIND": 'Float32', 
    "TD9635_PRES": 'Float32', 
    "TD9635_ROCI": 'Float32', 
    "NEUMANN_LAT": 'Float32', 
    "NEUMANN_LON": 'Float32', 
    "NEUMANN_CLASS": 'string', 
    "NEUMANN_WIND": 'Float32', 
    "NEUMANN_PRES": 'Float32', 
    "MLC_LAT": 'Float32', 
    "MLC_LON": 'Float32', 
    "MLC_CLASS": 'string', 
    "MLC_WIND": 'Float32', 
    "MLC_PRES": 'Float32', 
    "USA_GUST": 'Float32', 
    "BOM_GUST": 'Float32', 
    "BOM_GUST_PER": 'Float32', 
    "REUNION_GUST": 'Float32', 
    "REUNION_GUST_PER": 'Float32', 
    "USA_SEAHGT": 'Float32', 
    "USA_SEARAD_NE": 'Float32', 
    "USA_SEARAD_SE": 'Float32', 
    "USA_SEARAD_SW": 'Float32', 
    "USA_SEARAD_NW": 'Float32', 
    "STORM_SPEED": 'Float32', 
    "STORM_DIR": 'Float32'
}

# eccc_source_path = Path(os.getenv('ECCC_SHP_SOURCE'))

engine = create_engine(f"postgresql+psycopg2://{pg_user}:{pg_pass}@{pg_host}:{pg_port}/{pg_db}")

# %%
def process_ibtracs(source_csv_file, destination_table, pg_engine, table_schema):
    df = pd.read_csv(filepath_or_buffer=source_csv_file, header=0, skiprows=skip_rows, parse_dates=True, dtype=table_dtypes, na_values=na_values, keep_default_na=False)
    
    with pg_engine.begin() as pg_conn:
        # Create Tables (if not exist using schemas)
        # Generate shapes for IBTRACS?
        print("Creating Table (if not exists)...")
        sql = Path(table_schema).read_text()
        pg_conn.execute(text(sql))

        # add lat/long geometry points
        print("Adding Geometry Column...")
        sql = f'ALTER TABLE public.{destination_table} ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);'
        pg_conn.execute(text(sql))
        
        # truncate tables
        print("Clearing Existing Data...")
        sql = f"DELETE FROM {destination_table};"
        pg_conn.execute(text(sql))

        print("Committing Transaction.")
        pg_conn.execute(text("COMMIT;"))
    
    # populate table
    print("Populating Table...")
    df.to_sql(destination_table, pg_engine, chunksize=1000, method='multi', if_exists='append', index=False, schema='public')
    
    with pg_engine.begin() as pg_conn:
        print("Updating Geometry...")
        sql = f'UPDATE public.{destination_table} SET geom = ST_SetSRID(ST_MakePoint("LON", "LAT"), 4326);'
        pg_conn.execute(text(sql))

        print("Committing Transaction.")
        pg_conn.execute(text("COMMIT;"))
        print("Fin.")


# %%
def shp_to_json(shp_file:Path):
    shp_file_obj = shapefile.Reader(shp_file.as_posix())

    json_data = shp_file_obj.__geo_interface__

    return(json_data)

def populate_eccc_table(source_df, destination_table, pg_engine, table_schema):
    with pg_engine.begin() as pg_conn:
        # truncate tables
        print("Clearing Existing Data...")
        sql = f"DELETE FROM public.{destination_table};"
        pg_conn.execute(text(sql))

        print("Committing Transaction.")
        pg_conn.execute(text("COMMIT;"))

    # populate table
    print("Populating Table...")
    source_df.to_sql(destination_table, pg_engine, chunksize=1000, method='multi', if_exists='append', index=False, schema='public')

def create_table_from_schema(pg_engine, table_name, schema_file, pg_schema='public'):
    # Create ECCC Tables if not exist
    with pg_engine.begin() as pg_conn:
        print(f"Creating Table {table_name} (if not exists)...")

        sql = f"SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = '{pg_schema}' AND tablename = '{table_name}');"
        result = pg_conn.execute(text(sql))
        table_exists = result.first()[0]

        if not table_exists:
            sql = Path(schema_file).read_text()
            pg_conn.execute(text(sql))

        print("Committing Transaction.")
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

def process_eccc_shp_files(source_dir, pg_engine):
    source_search_pattern = "**/*.shp"
    filename_parser = re.compile(r'(?P<date>\d+)_(?P<time>\d+)Z_(?P<storm>\w+)\.(?P<type>\w+).*')

    points_df = pd.DataFrame()
    lines_df = pd.DataFrame()
    wind_radii_df = pd.DataFrame()
    error_cone_df = pd.DataFrame()

    # Check and, if necessary, create ECCC tables
    create_table_from_schema(pg_engine=pg_engine, table_name='eccc_storm_points', schema_file=eccc_pts_schema)
    create_table_from_schema(pg_engine=pg_engine, table_name='eccc_storm_lines', schema_file=eccc_lin_schema)
    create_table_from_schema(pg_engine=pg_engine, table_name='eccc_storm_wind_radii', schema_file=eccc_rad_schema)
    create_table_from_schema(pg_engine=pg_engine, table_name='eccc_storm_error_cones', schema_file=eccc_err_schema)

    for shp_file_path in Path(source_dir).glob(source_search_pattern):
        shp_file = Path(shp_file_path)

        (storm_date, storm_time, storm_name, data_type) = filename_parser.match(shp_file.name).groupdict().values()

        json_data = shp_to_json(shp_file=shp_file)

        if data_type == "pts":
            points_df = build_eccc_points(json_data, points_df, pg_engine)

        elif data_type == "lin":
            lines_df = build_eccc_lines(json_data, lines_df, pg_engine, storm_date, storm_time)

        elif data_type == "rad":
            wind_radii_df = build_eccc_wind_radii(json_data, wind_radii_df, pg_engine)

        elif data_type == "err":
            error_cone_df = build_eccc_error_cone(json_data, error_cone_df, pg_engine, storm_date, storm_time)

    populate_eccc_table(source_df=points_df, destination_table="eccc_storm_points", pg_engine=pg_engine, table_schema=eccc_pts_schema)
    populate_eccc_table(source_df=lines_df, destination_table="eccc_storm_lines", pg_engine=pg_engine, table_schema=eccc_lin_schema)
    populate_eccc_table(source_df=wind_radii_df, destination_table="eccc_storm_wind_radii", pg_engine=pg_engine, table_schema=eccc_rad_schema)
    populate_eccc_table(source_df=error_cone_df, destination_table="eccc_storm_error_cones", pg_engine=pg_engine, table_schema=eccc_err_schema)



# %%
if "IBTRACS" in process_data:
    print("Processing Active Storms...")
    process_ibtracs(source_csv_file=ibtracs_active_file, destination_table=pg_ibtracs_active_table, pg_engine=engine, table_schema=ibtracs_active_schema)

    print("Processing Historical Storms...")
    process_ibtracs(source_csv_file=ibtracs_historical_file, destination_table=pg_ibtracs_historical_table, pg_engine=engine, table_schema=ibtracs_historical_schema)
    
else:
    print("Skipping IBTRACS data...")


# %%
if "ECCC" in process_data:
    print("Processing ECCC shapefiles...")
    process_eccc_shp_files(eccc_shp_path_src, engine)
    
else:
    print("Skipping ECCC data...")

# %%
print("End.")


# %% [markdown]
# 


