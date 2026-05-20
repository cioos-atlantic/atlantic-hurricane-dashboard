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
import json
import numpy as np
from datetime import datetime, timedelta, timezone
import re
import time

log = logging.getLogger('logs/caching.log')
log.setLevel(logging.INFO)

log_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")

file_handler = RotatingFileHandler('logs/caching.log', maxBytes=2_000_000, backupCount=10)
file_handler.setFormatter(log_formatter)
log.addHandler(file_handler)

# Allows logging calls to print out to sys.stderr as well the log file
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(log_formatter)
log.addHandler(stream_handler)

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
pg_ibtracs_historical_table = os.getenv('PG_IBTRACS_HISTORICAL_TABLE')

docker_user = {'docker'}

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

unit_overrides = json.load(open("./config/unit_mapping.json"))
variable_limits = json.load(open("./config/variable_limits.json"))

#process_ibtracs(df = , destination_table=pg_ibtracs_active_table, pg_engine=engine, table_schema=erddap_cache_schema)
def cache_erddap_data(storm_id, server, df, destination_table, pg_engine, table_schema, replace=False):
    # populate table
    log.info("Populating Table...")

    station_table = "erddap_stations"
    with pg_engine.begin() as pg_conn: 
        if(storm_id):
            sql = f"DELETE FROM public.{destination_table} WHERE storm = '{storm_id}' AND station_id IN (SELECT station_id FROM public.{station_table} WHERE source_url='{server}');"
        else:
            #Clear old storm data
            sql = f"DELETE FROM public.{destination_table} WHERE station IN (SELECT station FROM public.{station_table} WHERE source='{server}');"
        pg_conn.execute(text(sql))

    df.drop_duplicates(subset=['station', 'min_time'], inplace=True)
    log.info("Writing to table...")
    result = df.to_sql(destination_table, pg_engine, chunksize=1000, method='multi', 
                       if_exists='append', index=False, schema='public')
    log.info(f"{result} rows written" )

    with pg_engine.begin() as pg_conn: 
        
        log.info("Updating Geometry...")
        sql = f"""UPDATE public.{destination_table} SET geom = ST_SetSRID(ST_MakePoint("min_lon", "min_lat"), 4326) WHERE storm = '{storm_id}';"""
        pg_conn.execute(text(sql))
        
        # This may not work and permissions may need to be added manually depending on who owns the table
        sql = f"GRANT ALL ON public.{destination_table} TO docker;"
        sql = f"GRANT SELECT ON public.{destination_table} TO hurricane_dash_geoserver;"
        pg_conn.execute(text(sql))

        log.info("Committing Transaction.")
        pg_conn.execute(text("COMMIT;"))
        log.info("Cached " + storm_id)
    return

def find_station_info(server, dataset, station, metadata, destination_table, pg_engine, add_if_not_exists=True):
    # populate table
    
    institution = erddap_meta(metadata=metadata, attribute_name="institution")["value"].replace("'", "''")
    institution_link = erddap_meta(metadata=metadata, attribute_name="infoUrl")["value"].replace("'", "''")
    dataset_title = erddap_meta(metadata=metadata, attribute_name="title")["value"].replace("'", "''")
    station_id = None

    with pg_engine.begin() as pg_conn: 
        sql = f"SELECT station_id FROM public.{destination_table} WHERE source_url = '{server}' AND dataset = '{dataset}' AND station = '{station}';"
        station_id = pg_conn.execute(text(sql)).fetchone()
        print(station_id)
        if not station_id and add_if_not_exists:
            log.info("Populating station table...")
            sql = f"INSERT INTO public.{destination_table} (source_url, dataset, station, institution, institution_link, dataset_title)"
            sql+= f" VALUES ('{server}', '{dataset}', '{station}', '{institution}', '{institution_link}', '{dataset_title}') RETURNING (station_id)"
            station_id = pg_conn.execute(text(sql)).fetchone()
            
    return station_id[0]

def create_table_from_schema(pg_engine, table_name, schema_file, pg_schema='public'):
    # Create ECCC Tables if not exist
    with pg_engine.begin() as pg_conn:

        sql = f"SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = '{pg_schema}' AND tablename = '{table_name}');"
        result = pg_conn.execute(text(sql))
        table_exists = result.first()[0]

        if not table_exists:
            sql = Path(schema_file).read_text()
            pg_conn.execute(text(sql))

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
        log.error(message)
    return return_value
    
# For a given dataset find out if it has any variables of interest (via standard name)
def match_standard_names(e, dataset_id, standard_names):
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
        station_id_var = ""
        if(metadata.loc[(metadata['Attribute Name'] == 'cdm_data_type')]['Value'].iloc[0] == 'TimeSeries'):
            station_id_var = metadata.loc[(metadata['Attribute Name'] == 'cf_role') & (metadata['Value'] == 'timeseries_id')]['Variable Name'].iloc[0]
        dataset = {
            "vars" :  [station_id_var, "time", "latitude", "longitude"] + dataset_vars,
            "meta" : metadata
        }
        log.info(f"Caching {dataset_id}")
    else:
        log.info(f"{dataset_id} doesn't have any matching variables.")
    return dataset

# Iterate through datasets and create a mapping between variable names and standard names
#for dataset_id in final_dataset_list.keys():
def standardize_column_names(dataset, dataset_id):
    def unit_override(unit):
        if(unit in unit_overrides):
            return unit_overrides[unit]
        else:
            return unit
    # A dictionary to hold the variable name mappings
    replace_cols = {}
    if(dataset['vars'][0]!= 'time'):
        replace_cols['identifier'] = f"identifier||{dataset['vars'][0]}"
        dataset['vars'].pop(0)
    metadata = dataset["meta"]
    for var in dataset["vars"]:
        standard_name = erddap_meta(metadata=metadata, attribute_name="standard_name", var_name=var)["value"]
        units = unit_override(erddap_meta(metadata=metadata, attribute_name="units", var_name=var)["value"])
        long_name = erddap_meta(metadata=metadata, attribute_name="long_name", var_name=var)["value"]
 
        # Time columns usually have the unit of time in unix timestamp
        if units.find("seconds since") > -1:
            units = "UTC"

        # standard_name = metadata[(metadata["Variable Name"] == var) & (metadata["Attribute Name"] == "standard_name")]["Value"].values[0]
        replace_cols[var] = f"{standard_name}|{units}|{long_name}"

        #log.info(f"{var} => {standard_name} | {units} | {long_name}")
    return replace_cols

# For active storms set id to ACTIVE
def cache_station_data(e, server, dataset, dataset_id, storm_id, min_time, max_time, bbox, time_buffer=0):
    # Once variable names have been 
    e.protocol = "tabledap"
    e.dataset_id = dataset_id

    if not dataset['vars'][0]:
        dataset['vars'].pop(0)
    e.variables = dataset["vars"]

    metadata = dataset['meta']

    e.constraints = {
        "time>=": min_time,
        "time<": max_time,
        "latitude<=": bbox['max_lat'],
        "latitude>=": bbox['min_lat'],
        "longitude<=": bbox['max_lon'],
        "longitude>=": bbox['min_lon']
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

        # Filter out erroneous values
        df = filter_value_limits(df)

        # Split up stations
        id_col = find_df_column_by_standard_name(df, "identifier")
        substations = []
        id_col_name = ''
        if id_col.empty:
            substations.append("n/a")
        else:
            id_col_name = id_col.columns[0]
            for substation in id_col[id_col_name].unique():
                substations.append(substation)

        # Need to iterate different station IDs into separate items
        # TODO: Messy implementation, probably could use a pass at cleaning up when time to refactor
        multiple_substations = False
        if len(substations) > 1:
            multiple_substations = True

        for substation in substations:
            # If substation is n/a
            # if substation is a value, make sure that cached entries match
            # Only one substation, don't care about editing original
            station_df = df
            # Going to be dropping columns so want to deep copy for now

            station_id= find_station_info(server, dataset_id, substation,metadata,'erddap_stations', engine, True)
            
            if multiple_substations:
                station_df = df[df[id_col_name]==substation].copy()

            drop_cols = []
            for col in station_df.columns:
                if len(station_df[col].value_counts()) == 0:
                    drop_cols.append(col)

            if (id_col_name):
                drop_cols.append(id_col_name)
            
            # Drop variables that were marked as empty
            for col in drop_cols:
                station_df = station_df.drop(col, axis=1)

            station_info = get_station_data(station_df, dataset_id, storm_id, min_time, max_time, station_id)
            cached_entries.extend(station_info)
            time.sleep(time_buffer)
    except Exception as ex:
        log.error("HTTPStatusError", ex)
        log.error(f" - No data found for time range: {min_time} - {max_time}")
    return cached_entries

def get_station_data(station_df, dataset_id, storm_id, min_time, max_time, station_id):
    # If all variables of interest were dropped, skip caching
    cached_entries = []

    if len(station_df.columns) < 4:
        return cached_entries

    max_lat= find_df_column_by_standard_name(station_df, "latitude").max().max()
    min_lat= find_df_column_by_standard_name(station_df, "latitude").min().min()
    max_lon= find_df_column_by_standard_name(station_df, "longitude").max().max()
    min_lon= find_df_column_by_standard_name(station_df, "longitude").min().min()

    # Finds the time column based on standard name and converts the type to be usable as datetime
    time_col = find_df_column_by_standard_name(station_df, "time").columns.values[0]
    station_df[time_col] = pd.to_datetime(station_df[time_col])

    # TODO Redo this now that a substation may not be represented in the full time scale?
    date_range = pd.date_range(min_time, max_time, freq="12H")
    # Catch if part of the interval isn't in the range
    prev_interval = ""
    for interval in date_range:
        if(prev_interval):
            df_interval = station_df[(station_df[time_col] >= prev_interval.to_pydatetime()) & (station_df[time_col] < interval.to_pydatetime())]
            # Might be able to only do the conversion during the 
            # df_interval = df_interval[time_col].dt.strftime('%Y-%m-%dT%H:%M:%SZ')
            # Change the dataframe to JSON, can change the format or orientation 

            # Experimental average binning per hour
            #times = pd.to_datetime(df_interval[time_col])
            df_interval = df_interval.groupby(pd.Grouper(key=time_col, axis=0, freq="h")).mean(numeric_only=True)
            station_data = df_interval.reset_index().to_json(orient="records")

            entry = {
                "storm":storm_id,
                "station":station_id,
                "min_time":prev_interval,
                "max_time":interval,
                "min_lon":min_lon,
                "max_lon":max_lon,
                "min_lat":min_lat,
                "max_lat":max_lat, 
                "station_data":station_data,
                "station_id":station_id
            }
            # Avoids caching empty json strings (2 for the brackets)
            if(len(station_data) > 2):
                cached_entries.append(entry)
            # time in ISO format or set column to timestamp (UTC for timezone)
        prev_interval = interval
    return cached_entries

#Finds the column name in the dataframe given the standard name
# Header format is column name (standard name|units|long name)
def find_df_column_by_standard_name(df, standard_name):
    column = df.filter(regex='\(' + standard_name + '\|')#.columns.values[0]
    return column

# Returns the standard name of a formatted column
def get_standard_name_from_column_name(col_name):
    # Match within brackets, first instance e.g. (wind_speed|m/s|Wind speed) catches 'wind_speed'
    standard_name = re.search("(?<=\().+?(?=\|)", col_name).group(0)
    return standard_name

def get_historical_storm_list(storm=None, min_year= None, max_year=None):
    # Conect to IBTracs storm table
    # Filter post-2000 storms
    # Put in pandas database, group by storm name and season
    # Set storm ID to YYYY_storm name
    # Set min and max time to whatever the storm is + / - 2 days
    df = get_postgres_data(source_table=pg_ibtracs_historical_table, pg_engine=engine)
    df = df.groupby(['SEASON','NAME'], as_index=False).agg({'ISO_TIME':[np.min, np.max]})
    df = df.loc[(df['NAME'] != "UNNAMED")]
    if(min_year):
        df = df.loc[(df['SEASON'] >= min_year)]
    if(max_year):
        df = df.loc[(df['SEASON'] <= max_year)]
    if(storm):
        df = df.loc[(df['NAME'] == storm.split("_")[1].upper())]
        df = df.loc[(df['SEASON'] == int(storm.split("_")[0]))]
    return df

def get_postgres_data(source_table, pg_engine, table_schema=None):
    # populate table
    log.info(f"Getting table data from {source_table}...")

    with pg_engine.begin() as pg_conn:
        sql_text  = text(f'SELECT * FROM public.{source_table} WHERE "SEASON" > 2000')
        data = pd.read_sql_query(sql=sql_text, con=pg_conn, parse_dates=['ISO_TIME'])
        return data

# Function for leaving out extreme values from being entered into the OSV
# As storm values will be different than regular readings, this is more for the
# really incorrect readings i.e. wind speed of -10000 km/h, temp at 0K, etc.
def filter_value_limits(station_data):
    for col in station_data.columns.values.tolist():
        standard_name = get_standard_name_from_column_name(col)
        if standard_name in variable_limits:
            upper_limit = variable_limits[standard_name]['upper']
            lower_limit = variable_limits[standard_name]['lower']
            
            out_of_range_series = station_data.loc[(station_data[col] > upper_limit) | (station_data[col] < lower_limit), col]
            if not out_of_range_series.empty:
                log.warning(f"Out of range values detected for {col}!  Replacing with NaN...")
                log.warning(f" - Lower Limit: {lower_limit},  Upper Limit: {upper_limit}:")
                log.warning("Offending Values:")
                log.warning(out_of_range_series)

            station_data.loc[(station_data[col] > upper_limit) | (station_data[col] < lower_limit), col] = np.nan

    return station_data
    
# Returns ERDDAP datasets active within a range of time that match important variables 
# min_time and max_time are datetime objects   
def get_erddap_datasets(e, min_time, max_time, bbox):
    min_time = datetime.strftime(min_time,'%Y-%m-%dT%H:%M:%SZ')
    max_time = datetime.strftime(max_time,'%Y-%m-%dT%H:%M:%SZ')
    search_url = e.get_search_url(response="csv", min_time=min_time, max_time=max_time, 
                                    max_lat=bbox['max_lat'], min_lat=bbox['min_lat'],
                                    max_lon=bbox['max_lon'], min_lon=bbox['min_lon'])
    search = pd.read_csv(search_url)
    dataset_list = search["Dataset ID"].values 
    return dataset_list

# Checks the server the data originated from to only clear 
def check_data_source(data):
    return

def main():
    def storm_format (arg_value, pattern=re.compile("[0-9]{4}_[A-Z].*")):
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
    parser_historical.add_argument("--storm", help="The storm identifier, in the format of YYYY_stormname (lowercase). Example: 2022_FIONA", nargs='?', type=storm_format)
    parser_historical.add_argument("--min", help="The start time of data in the storm interval. Format: YYYY", nargs='?', type=int)
    parser_historical.add_argument("--max", help="The end time of data in the storm interval. Format: YYYY", nargs='?', type=int)
    parser_historical.add_argument("--dry", help="Dry run. Will grab from ERDDAP but not commit the data to the database", action="store_true")
    parser_historical.add_argument("--config", help="Specify the config file to use. Default: CIOOS Atlantic ERDDAP", nargs='?')

    parser_active = subparsers.add_parser("active")
    parser_active.add_argument("--config", help="Specify the config file to use. Default: CIOOS Atlantic ERDDAP", nargs='?')
    
    args = parser.parse_args()

    config_name = "config.ini"
    if args.config:
        config_name = args.config

    config = ConfigParser()
    config.read("./config/" + config_name)
    server = config.get("ERDDAP", "server")
    e = ERDDAP(server=server)

    ignore_stations = config.get("ERDDAP", "ignore_stations").splitlines()
    standard_names = config.get("ERDDAP", "standard_names").splitlines()
    time_buffer = config.getint("ERDDAP", "time_buffer")

    bbox = {
        'max_lat':config.getint("ERDDAP", "max_lat"),
        'min_lat':config.getint("ERDDAP", "min_lat"),
        'max_lon':config.getint("ERDDAP", "max_lon"),
        'min_lon':config.getint("ERDDAP", "min_lon")
    }

    if(args.subcommand == 'historical'):
        arg_storm = args.storm
        arg_year_min = args.min
        arg_year_max = args.max
        arg_dry = args.dry
        #min_time = datetime.strptime(args.min_time, '%Y-%m-%dT%H:%M:%SZ')
        #max_time = datetime.strptime(args.max_time, '%Y-%m-%dT%H:%M:%SZ')

        storms = get_historical_storm_list(arg_storm, arg_year_min, arg_year_max)
        """
        if(min_time > max_time ):
            raise argparse.ArgumentTypeError("End time is before start time")
        """
        #create_table_from_schema(pg_engine=engine, table_name=pg_erddap_cache_historical_table, schema_file=erddap_cache_historical_schema)
        post_storm_period = config.getint('erddap_cache', 'post_storm_period')
        for i, storm in storms.iterrows():
            log.info(storm)
            storm_id = str(storm['SEASON'].values[0]) + "_" + storm['NAME'].values[0]
            min_time = storm['ISO_TIME']['min']
            max_time = storm['ISO_TIME']['max']
            if(post_storm_period>0):
                max_time += timedelta(days=post_storm_period)
            dataset_list = get_erddap_datasets(e, min_time, max_time, bbox)
            cached_data = []
            # Store in shared list to reduce calls and avoid overwriting for active cache
            for dataset_id in dataset_list:
                # Interrogate each dataset for the list of variable names using the list 
                # of standard names above. If a dataset does not have any of those variables it
                # will be skipped
                dataset = match_standard_names(e, dataset_id, standard_names)
                if (dataset and dataset_id not in ignore_stations):
                    cached_data.extend(cache_station_data(e, server, dataset, dataset_id, storm_id, 
                                                        min_time=datetime.strftime(min_time,'%Y-%m-%dT%H:%M:%SZ'), 
                                                        max_time=datetime.strftime(max_time,'%Y-%m-%dT%H:%M:%SZ'), 
                                                        bbox=bbox, time_buffer=time_buffer))
            if(cached_data and not arg_dry):
                    log.info('Caching historical storm...')
                    cache_erddap_data(storm_id = storm_id, server=server, df=pd.DataFrame(cached_data),destination_table=pg_erddap_cache_historical_table,
                                        pg_engine=engine,table_schema=erddap_cache_historical_schema)
            elif(arg_dry):
                log.info("Dry run")
    # ACTIVE
    else:
        storm_id = "ACTIVE"
        max_time = datetime.now(timezone.utc)
        active_data_period = config.getint('erddap_cache', 'active_data_period')
        # Round maxtime up to nearest 12 hour interval
        if(max_time.hour/12 >= 1):
            max_time = datetime.combine(max_time.date(), datetime.min.time()) + timedelta(days=1)
        else:
            max_time = datetime.combine(max_time.date(), datetime.min.time()) + timedelta(hours=12)
        min_time = max_time - timedelta(days=active_data_period)
        
        # Can focus on a specific dataset - adding to config skips the dataset search
        dataset_list = []
        if('dataset' in config['ERDDAP']):
            dataset_list =  [config.get("ERDDAP", "dataset")]
        else:
            dataset_list = get_erddap_datasets(e, min_time, max_time, bbox)
        create_table_from_schema(pg_engine=engine, table_name=pg_erddap_cache_active_table, schema_file=erddap_cache_active_schema)
        # Store in shared list to reduce calls and avoid overwriting for active cache
        cached_data = []
        for dataset_id in dataset_list:
            # Interrogate each dataset for the list of variable names using the list 
            # of standard names above. If a dataset does not have any of those variables it
            # will be skipped
            dataset = match_standard_names(e, dataset_id, standard_names)
            if (dataset and dataset_id not in ignore_stations):
                cached_data.extend(cache_station_data(e, server, dataset, dataset_id, storm_id, 
                                                    min_time=datetime.strftime(min_time,'%Y-%m-%dT%H:%M:%SZ'), 
                                                    max_time=datetime.strftime(max_time,'%Y-%m-%dT%H:%M:%SZ'), 
                                                    bbox=bbox, time_buffer=time_buffer))
        if(cached_data):
                log.info("Caching active storm...")
                cache_erddap_data(storm_id=storm_id, server=server, df=pd.DataFrame(cached_data),destination_table=pg_erddap_cache_active_table,
                                    pg_engine=engine,table_schema=erddap_cache_active_schema,replace=True)

    
    # Get datasets that have data within the times


if __name__ == '__main__':
    main()