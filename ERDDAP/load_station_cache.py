# Test methods and functions for accessing the ERDDAP station data cache

from configparser import ConfigParser
import pandas as pd
import logging
from logging.handlers import RotatingFileHandler
import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv
from sqlalchemy import create_engine, text
import json

log = logging.getLogger('caching.log')
handler = RotatingFileHandler('caching.log', maxBytes=2000, backupCount=10)
log.addHandler(handler)

config = ConfigParser()
config.read("../config.ini")

standard_names = config.get("ERDDAP", "standard_names").splitlines()

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

# Access Postgres
# Get data
# Load most recent data point into view
#process_ibtracs(df = , destination_table=pg_ibtracs_active_table, pg_engine=engine, table_schema=erddap_cache_schema)
def get_postgres_data(source_table, pg_engine, table_schema=None):
    # populate table
    print("Getting table data...")
    with pg_engine.begin() as pg_conn:
        sql_text  = text(f'SELECT * FROM public.{source_table}')
        data = pd.read_sql_query(sql=sql_text, con=pg_conn, parse_dates=['min_time', 'max_time'])
        return data


def main():
    print('test')

    # Gets the rows with the most recent data
    df =  get_postgres_data(pg_erddap_cache_active_table, engine)
    stations = df['station'].unique()
    for station in stations:
        print(station)
        station_df = df.loc[df['station'] == station]
        station_data = json.loads(station_df.at[station_df.index[-1],'station_data'])
        print(station_data[len(station_data)-1])

              
    """
    max_time = df['max_time'].max()
    print(df.loc[df['max_time'] == max_time])
    """


if __name__ == '__main__':
    main()