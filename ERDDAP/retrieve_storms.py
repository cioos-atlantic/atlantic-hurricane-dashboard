from configparser import ConfigParser
import pandas as pd
import logging
from logging.handlers import RotatingFileHandler
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import argparse

log = logging.getLogger('caching.log')
handler = RotatingFileHandler('caching.log', maxBytes=2000, backupCount=10)
log.addHandler(handler)

config = ConfigParser()
config.read("../config.ini")

load_dotenv()

pg_host = os.getenv('PG_HOST')
pg_port = os.getenv('PG_PORT')
pg_user = os.getenv('PG_USER')
pg_pass = os.getenv('PG_PASS')
pg_db = os.getenv('PG_DB')

active_storm_table = os.getenv('PG_IBTRACS_ACTIVE_TABLE')
historical_storm_table = os.getenv('PG_IBTRACS_HISTORICAL_TABLE')
storm_table = ""

#(get from input?)
engine = create_engine(f"postgresql+psycopg2://{pg_user}:{pg_pass}@{pg_host}:{pg_port}/{pg_db}")

basin = config.get("geographic", "basin")
subbasin = config.get("geographic", "subbasin")

# Have it to give a storm name then can grab the storm information based on that, don't try to grab every storm. 
# Store the storm id in the cache as well?

def get_table(pg_engine, table_name, pg_schema='public'):
    with pg_engine.begin() as pg_conn:
        sql = f"SELECT * FROM {pg_schema}.{table_name};"
        df = pd.read_sql(text(sql), pg_conn)
        return df

def main():

    def timeframe_format (arg_value):
        if not (arg_value == "active" or arg_value == "historical"):
            print(arg_value)
            raise argparse.ArgumentTypeError("Unrecognized table type. Please enter active or historical")
        return arg_value

    from datetime import datetime
    parser = argparse.ArgumentParser("Parses args")
    parser.add_argument("storm_table", help="Specify whether to cache active or historical storms", type=timeframe_format)
    args = parser.parse_args()

    if args.storm_table == "active":
        storm_table = active_storm_table
    elif args.storm_table == "historical":     
        storm_table = historical_storm_table

    df_storms = get_table(engine, storm_table)

    df_storms = df_storms.loc[df_storms['BASIN']==basin]
    df_storms = df_storms.sort_values(by=['SID', 'ISO_TIME'])
    # Send to cache
    df_storms['STORM'] = df_storms['SEASON'].astype(str) + '_' + df_storms['NAME']
    unique_storms = df_storms['STORM'].drop_duplicates()
    for storm in unique_storms:
        if(not storm.endswith("NOT_NAMED")):
            date_range = df_storms.loc[df_storms['STORM']==storm]["ISO_TIME"]
            min_time=date_range.iloc[0].strftime("%Y-%m-%dT%H:%M:%SZ")
            max_time=date_range.iloc[-1].strftime("%Y-%m-%dT%H:%M:%SZ")
            print(storm)
            print(min_time)
            print(max_time)
            #os.system(f"python cache_ERDDAP.py {storm} {min_time} {max_time}")
            # Print storm, min time, max time for use for caching

if __name__ == '__main__':
    main()