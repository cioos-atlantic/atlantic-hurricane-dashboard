# Searches an ERDDAP Server based on a time range and then filters those 
# datasets by a list of standard names to find the appropriate variable names.

import requests
import httpx
from configparser import ConfigParser
import pandas as pd
from erddapy import ERDDAP
import logging
from logging.handlers import RotatingFileHandler

log = logging.getLogger('caching.log')
handler = RotatingFileHandler('caching.log', maxBytes=2000, backupCount=10)
log.addHandler(handler)

config = ConfigParser()
config.read("../config.ini")

server = config.get("ERDDAP", "server")
standard_names = config.get("ERDDAP", "standard_names").splitlines()
e = ERDDAP(server=server)

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
        log.warning(message)

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
        log.warning(dataset_id, "Doesn't have any matching variables.")
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

def cache_station_data(dataset, dataset_id, storm_id, min_time, max_time):
    # Once variable names have been 
    e.protocol = "tabledap"
    e.dataset_id = dataset_id
    e.variables = dataset["vars"]
    e.constraints = {
        "time>=": min_time,
        "time<=": max_time
    }

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
        time_col = find_df_column_by_standard_name(df, "time")
        df[time_col] = pd.to_datetime(df[time_col])
        date_range = pd.date_range(min_time, max_time, freq="12H")
        
        prev_interval = ""
        for interval in date_range:
            if(prev_interval):
                df_interval = df[(df[time_col] >= prev_interval.to_pydatetime()) & (df[time_col] < interval.to_pydatetime())]
                # Might be able to only do the conversion during the 
                df_interval[time_col] = df_interval[time_col].dt.strftime('%Y-%m-%dT%H:%M:%SZ') 

                # Change the dataframe to JSON, can change the format or orientation 
                station_data = df_interval.to_json(orient="records")

                cached_entry = {
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
            prev_interval = interval
        log.info(dataset_id + " cached")
        return 
    except Exception as ex:
    #except httpx.HTTPStatusError as ex:
         print("HTTPStatusError", ex)
         log.info(f" - No data found for time range: {min_time} - {max_time}")
    return

#Finds the column name in the dataframe given the standard name
# Header format is column name (standard name|units|long name)
def find_df_column_by_standard_name(df, standard_name):
    column_name = df.filter(regex='\(' + standard_name + '\|').columns.values[0]
    return column_name

def main():
    # Storm_id and time range to be used as input - hard coded for now to test functionality
    storm_id = "2022_fiona"
    # Date range for Hurricane FIONA (2022)
    min_time = "2022-09-20T0:00:00Z"
    max_time = "2022-09-30T0:00:00Z"

    search_url = e.get_search_url(response="csv", min_time=min_time, max_time=max_time)
    search = pd.read_csv(search_url)
    dataset_list = search["Dataset ID"].values

    for dataset_id in dataset_list:
        # Interrogate each dataset for the list of variable names using the list 
        # of standard names above. If a dataset does not have any of those variables it
        # will be skipped
        dataset = match_standard_names(dataset_id)
        if (dataset):
            cache_station_data(dataset, dataset_id, storm_id, min_time, max_time)

if __name__ == '__main__':
    main()