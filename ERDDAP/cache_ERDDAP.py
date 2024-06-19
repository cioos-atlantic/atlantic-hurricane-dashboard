# Searches an ERDDAP Server based on a time range and then filters those 
# datasets by a list of standard names to find the appropriate variable names.

import requests
import httpx
from configparser import ConfigParser
import pandas as pd
from erddapy import ERDDAP
import logging
from logging.handlers import RotatingFileHandler
import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv
from sqlalchemy import create_engine, text
import sys
import argparse

log = logging.getLogger('caching.log')
handler = RotatingFileHandler('caching.log', maxBytes=2000, backupCount=10)
log.addHandler(handler)

config = ConfigParser()
config.read("../config.ini")

server = config.get("ERDDAP", "server")
standard_names = config.get("ERDDAP", "standard_names").splitlines()
e = ERDDAP(server=server)

# Find env file
load_dotenv(find_dotenv())

pg_host = os.getenv('PG_HOST')
pg_port = os.getenv('PG_PORT')
pg_user = os.getenv('PG_USER')
pg_pass = os.getenv('PG_PASS')
pg_db = os.getenv('PG_DB')
pg_erddap_cache_historical_table = os.getenv('ERDDAP_CACHE_HISTORICAL_TABLE')
erddap_cache_historical_schema = os.getenv('ERDDAP_CACHE_HISTORICAL_SCHEMA')
pg_erddap_cache_active_table = os.getenv('ERDDAP_CACHE_ACTIVE_TABLE')
erddap_cache_active_schema = os.getenv('ERDDAP_CACHE_ACTIVE_SCHEMA')

active_data_period = config.getint('erddap_cache', 'active_data_period')

engine = create_engine(f"postgresql+psycopg2://{pg_user}:{pg_pass}@{pg_host}:{pg_port}/{pg_db}")

table_dtypes = {
    "storm": 'string',
    "station": 'string',
    "min_time": 'datetime',
    "max_time": 'datetime',
    "min_lon": 'float',
    "max_lon": 'float',
    "station_data": 'string'
} 

#process_ibtracs(df = , destination_table=pg_ibtracs_active_table, pg_engine=engine, table_schema=erddap_cache_schema)
def cache_erddap_data(df, destination_table, pg_engine, table_schema, replace=False):
    # populate table
    print("Populating Table...")
    if_exists_action = 'append'
    # Active storm table cleared on new data
    if(replace):
        if_exists_action = 'replace'

    result = df.to_sql(destination_table, pg_engine, chunksize=1000, method='multi', 
                       if_exists=if_exists_action, index=False, schema='public')

    with pg_engine.begin() as pg_conn:        
        print(f"Adding geom column")
        sql = f"ALTER TABLE public.{destination_table} ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);"
        pg_conn.execute(text(sql))
        
        print("Updating Geometry...")
        sql = f'UPDATE public.{destination_table} SET geom = ST_SetSRID(ST_MakePoint("min_lon", "min_lat"), 4326);'
        pg_conn.execute(text(sql))

        print("Committing Transaction.")
        pg_conn.execute(text("COMMIT;"))
        print("Fin.")
    return

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

        print(f"Adding geom column")
        sql = f"ALTER TABLE {pg_schema}.{table_name} ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);"
        pg_conn.execute(text(sql))

        print("Committing Transaction.")
        pg_conn.execute(text("COMMIT;"))

# Extracts data from the erddap metadata Pandas dataframe, NC_GLOBAL and
# row type attribute are assumed as defaults for variable specific values
# you'll need to specify those features
def erddap_meta(metadata, attribute_name, row_type="attribute", var_name="NC_GLOBAL"):
    # Example: uuid = metadata[(metadata['Variable Name']=='NC_GLOBAL') & (metadata['Attribute Name']=='uuid')]['Value'].values[0]
    return_value = {"value": None, "type": None}

    try:
        return_value["value"] = metadata[(metadata["Variable Name"] == var_name) & (metadata["Attribute Name"] == attribute_name)]["Value"].values[0]
        return_value["type"] = metadata[(metadata["Variable Name"] == var_name) & (metadata["Attribute Name"] == attribute_name)]["Data Type"].values[0]

    except IndexError:
        message = (
            f"IndexError (Not found?) extracting ERDDAP Metadata: attribute: {attribute_name}, row_type: {row_type}, var_name: {var_name}"
        )
        print(message)
    return return_value
    
# For a given dataset find out if it has any variables of interest (via standard name)
def match_standard_names(dataset_id):
    dataset= {}
    #final_dataset_list[dataset_id]
    dataset_vars = e.get_var_by_attr(dataset_id, standard_name=lambda std_name: std_name in standard_names)
    
    if dataset_vars:
        # Fetch dataset metadata from ERDDAP based on dataset ID, assign to 
        # dictionary with variables of interest.

        metadata_url = e.get_download_url(
            dataset_id=f"{dataset_id}/index", response="csv", protocol="info"
        )

        metadata = pd.read_csv(filepath_or_buffer=metadata_url)
        
        dataset = {
            "vars" : ["time", "latitude", "longitude"] + dataset_vars,
            "meta" : metadata
        }
    else:
        print(dataset_id, "Doesn't have any matching variables.")
    return dataset

# Iterate through datasets and create a mapping between variable names and standard names
#for dataset_id in final_dataset_list.keys():
def standardize_column_names(dataset, dataset_id):
    # A dictionary to hold the variable name mappings
    replace_cols = {}

    for var in dataset["vars"]:
        metadata = dataset["meta"]

        standard_name = erddap_meta(metadata=metadata, attribute_name="standard_name", var_name=var)["value"]
        units = erddap_meta(metadata=metadata, attribute_name="units", var_name=var)["value"]
        long_name = erddap_meta(metadata=metadata, attribute_name="long_name", var_name=var)["value"]

        # Time columns usually have the unit of time in unix timestamp
        if units.find("seconds since") > -1:
            units = "UTC"

        # standard_name = metadata[(metadata["Variable Name"] == var) & (metadata["Attribute Name"] == "standard_name")]["Value"].values[0]
        replace_cols[var] = f"{standard_name}|{units}|{long_name}"
        log.info(var, " => ", standard_name)
    return replace_cols

# For active storms set id to ACTIVE
def cache_station_data(dataset, dataset_id, storm_id, min_time, max_time):
    # Once variable names have been 
    e.protocol = "tabledap"
    e.dataset_id = dataset_id
    e.variables = dataset["vars"]
    e.constraints = {
        "time>=": min_time,
        "time<": max_time
    }
    cached_entries = []

    try:
        df = e.to_pandas()
        
        # !!! Uncomment this block to move time to the dataframe index and remove the original column !!!
        #
        # df["time (UTC)"] = pd.to_datetime(df["time (UTC)"])
        # df.set_index(df['time (UTC)'], inplace=True)
        # df.drop("time (UTC)", axis="columns", inplace=True)
        # del replace_cols['time']

        # Remap columns to incorporate standard name, long name and units
        replace_cols = standardize_column_names(dataset, dataset_id)
        df.columns = map(lambda col: col + " (" + replace_cols[col] + ")", replace_cols.keys())

        max_lat= find_df_column_by_standard_name(df, "latitude").max().max()
        min_lat= find_df_column_by_standard_name(df, "latitude").min().min()
        max_lon= find_df_column_by_standard_name(df, "longitude").max().max()
        min_lon= find_df_column_by_standard_name(df, "longitude").min().min()

        # Finds the time column based on standard name and converts the type to be usable as datetime
        time_col = find_df_column_by_standard_name(df, "time").columns.values[0]
        df[time_col] = pd.to_datetime(df[time_col])
        date_range = pd.date_range(min_time, max_time, freq="12H")
        # Catch if part of the interval isn't in the range
        prev_interval = ""
        for interval in date_range:
            if(prev_interval):
                df_interval = df[(df[time_col] >= prev_interval.to_pydatetime()) & (df[time_col] < interval.to_pydatetime())]
                # Might be able to only do the conversion during the 
                # df_interval = df_interval[time_col].dt.strftime('%Y-%m-%dT%H:%M:%SZ')
                # Change the dataframe to JSON, can change the format or orientation 
                station_data = df_interval.to_json(orient="records")

                entry = {
                    "storm":storm_id,
                    "station":dataset_id,
                    "min_time":prev_interval,
                    "max_time":interval,
                    "min_lon":min_lon,
                    "max_lon":max_lon,
                    "min_lat":min_lat,
                    "max_lat":max_lat, 
                    "station_data":station_data
                }
                # Avoids caching empty json strings (2 for the brackets)
                if(len(station_data) > 2):
                    cached_entries.append(entry)
                # time in ISO format or set column to timestamp (UTC for timezone)
            prev_interval = interval
        print(dataset_id + " cached")
        return cached_entries
    except Exception as ex:
         print("HTTPStatusError", ex)
         log.info(f" - No data found for time range: {min_time} - {max_time}")
    return cached_entries

#Finds the column name in the dataframe given the standard name
# Header format is column name (standard name|units|long name)
def find_df_column_by_standard_name(df, standard_name):
    column = df.filter(regex='\(' + standard_name + '\|')#.columns.values[0]
    return column

def main():
    from datetime import datetime, timedelta, timezone
    import re
    def storm_format (arg_value, pattern=re.compile("[0-9]{4}_[a-z].*")):
        if not pattern.match(arg_value):
            raise argparse.ArgumentTypeError("invalid storm format")
        return arg_value

    def datetime_format (arg_value):
        try:
            datetime.strptime(arg_value, '%Y-%m-%dT%H:%M:%SZ')
        except (ValueError):
            raise argparse.ArgumentTypeError("invalid date format")
        return arg_value

    # Storm takes format of "YYYY_stormname"
    # Time takes format of "2023-02-15T12:56:07Z"

    ###Subparser, one active, one historical
    parser = argparse.ArgumentParser("Parses args")

    # Separate active and historical commands
    subparsers = parser.add_subparsers(dest='subcommand')
    subparsers.required = True  

    parser_historical = subparsers.add_parser("historical")
    parser_historical.add_argument("storm", help="The storm identifier, in the format of YYYY_stormname (lowercase). Example: 2022_fiona", type=storm_format)
    parser_historical.add_argument("min_time", help="The start time of data in the storm interval. Format: YYYY-mm-ddTHH:MM:SSZ", type=datetime_format)
    parser_historical.add_argument("max_time", help="The end time of data in the storm interval. Format: YYYY-mm-ddTHH:MM:SSZ", type=datetime_format)
    
    parser_active = subparsers.add_parser("active")
    
    args = parser.parse_args()

    if(args.subcommand == 'historical'):
        storm_id = args.storm
        min_time = datetime.strptime(args.min_time, '%Y-%m-%dT%H:%M:%SZ')
        max_time = datetime.strptime(args.max_time, '%Y-%m-%dT%H:%M:%SZ')
        if(min_time > max_time ):
            raise argparse.ArgumentTypeError("End time is before start time")
    else:
        storm_id = "ACTIVE"
        max_time = datetime.now(timezone.utc)
        # Round maxtime up to nearest 12 hour interval
        if(max_time.hour/12 >= 1):
            max_time = datetime.combine(max_time.date(), datetime.min.time()) + timedelta(days=1)
        else:
            max_time = datetime.combine(max_time.date(), datetime.min.time()) + timedelta(hours=12)
        min_time = max_time - timedelta(days=active_data_period)

    # Get datasets that have data within the times
    search_url = e.get_search_url(response="csv", min_time=datetime.strftime(min_time,'%Y-%m-%dT%H:%M:%SZ'), 
                                  max_time=datetime.strftime(max_time,'%Y-%m-%dT%H:%M:%SZ'))
    search = pd.read_csv(search_url)
    dataset_list = search["Dataset ID"].values  

    create_table_from_schema(pg_engine=engine, table_name=pg_erddap_cache_active_table, schema_file=erddap_cache_active_schema)
    # Store in shared list to reduce calls and avoid overwriting for active cache
    cached_data = []
    for dataset_id in dataset_list:
        # Interrogate each dataset for the list of variable names using the list 
        # of standard names above. If a dataset does not have any of those variables it
        # will be skipped
        dataset = match_standard_names(dataset_id)
        if (dataset):
            cached_data.extend(cache_station_data(dataset, dataset_id, storm_id, 
                                                min_time=datetime.strftime(min_time,'%Y-%m-%dT%H:%M:%SZ'), 
                                                max_time=datetime.strftime(max_time,'%Y-%m-%dT%H:%M:%SZ')))
    if(cached_data and storm_id =="ACTIVE"):
            print("Caching active storm...")
            cache_erddap_data(df=pd.DataFrame(cached_data),destination_table=pg_erddap_cache_active_table,
                                pg_engine=engine,table_schema=erddap_cache_active_schema,replace=True)
    elif(cached_data):
            print('Caching historical storm...')
            cache_erddap_data(df=pd.DataFrame(cached_data),destination_table=pg_erddap_cache_historical_table,
                                pg_engine=engine,table_schema=erddap_cache_historical_schema)

if __name__ == '__main__':
    main()