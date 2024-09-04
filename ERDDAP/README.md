# ERDDAP Caching

## Background

Script requires the storm name and year, as well as the time range to cache (start and end time)

Caches station data from ERDDAP into Postgres (The ERDDAP server is defined in config.ini file)
The script only gets station data for fields matching the standard names defined in the config.ini file
If a station does not have any data for those fields in the storm's time frame, it is skipped

The following fields are written to the database:
storm, station, min_time, max_time, min_lon, max_lon, min_lat, max_lat
There is also has a field for the station data taken from ERDDAP. The data in the station_data field
are any fields matching the listed standard names for that time range stored as a json string
The combination of storm, station, min_time, and max_time acts as the primary key

The data is chunked into 12 hour intervals to limit the size of the station data field

## Setup

### ERDDAP

Define the ERDDAP server to connect to in the config.ini file in the 'server' field under 'ERDDAP'

The standard_names list in the config.ini file defines the fields the script will grab data from
to store in the station_data field

### Postgres

Define the following in the .env file in the jupyter/postgis_schemas
PG_HOST: Location of Postgres host (default is localhost)
PG_PORT: Port to connect through (default is 32767)
PG_USER: Postgres user to connect to the database with
PG_PASS: Password of postgres user
PG_DB: Database name in postgres

Define the location of the schema for the ERDDAP Cache table in the .env
ERDDAP_CACHE_SCHEMA = ./erddap_cache_schema.sql

Define the name of the ERDDAP Cache tables in the .env and the location of the schemas
Default names:
ERDDAP_CACHE_HISTORICAL_TABLE = erddap_cache_historical
ERDDAP_CACHE_ACTIVE_TABLE = erddap_cache_active

Default locations:
ERDDAP_CACHE_HISTORICAL_SCHEMA = ../jupyter/postgis_schemas/erddap_cache_schema.sql
ERDDAP_CACHE_ACTIVE_SCHEMA = ../jupyter/postgis_schemas/erddap_cache_active_schema.sql

## Running

To run the ERDDAP cache make sure the conda environment is set

> conda activate hurricane

Active storm data

> python cache_ERDDAP.py active

Running the ERDDAP cache for active data will clear existing data in the cache

Historical storm data

> python cache_ERDDAP.py historical 2022_fiona


## Logging

The script will create log files in the ERDDAP folder with the name 'caching.log'
