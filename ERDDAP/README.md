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

Define the name of the ERDDAP Cache table in the .env
ERDDAP_CACHE_TABLE = erddap_cache

## Running

In progress

- Use rundeck to trigger every hour / every day
- Look through active_storms database and get data that's not already in the cache
- Separate function to search through historic storms
- Re-caching/clearing data beforehand
- Add buffer to start/end times to get surrounding data
- Start at 00:00 of the start date to standardize time ranges and avoid duplicate stations with slightly
  different time ranges

## Logging

The script will create log files in the ERDDAP folder with the name 'caching.log'
