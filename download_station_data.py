# Allow inputting a storm name and year to download instead of the whole list
storm_csv = "station-data/storm_list.csv"
storm_lowerLat= 40
storm_basin = 'north_atlantic'
storm_source = 'ibtracs'

# Stations to exclude
exclude= []

# Temporary hard-coded list, to be replaced with a more dynamic one in the future
focus_variables = "wind_spd_avg", "air_pressure_avg", "wave_ht_max"

import tropycal.tracks as tracks
import pandas as pd
from erddapy import ERDDAP
from datetime import timedelta
import pytz
from pathlib import Path
import argparse

# Get datasets matching time and location criteria, plus a buffer zone

parser = argparse.ArgumentParser(description='Arguments for collecting storm data')
parser.add_argument("--e", "--extend-dates", action='store', dest='date_ext', type=int, help="Number of days before and after the storm's listed range to get data from", default=0)
parser.add_argument("--n", "--new_data", action='store_true', dest='new_data', help="Only download new station data files")
parser.add_argument("--s", "--storm", action="store", dest="storm", type=str, help="Download data for single storm. Format as name-year", default=None)
args = parser.parse_args()
arg_date_extension = args.date_ext
arg_storm = args.storm
arg_new_data= args.new_data

e = ERDDAP(
    server="https://cioosatlantic.ca/erddap", 
    protocol="tabledap",
    response="csv"
)

e.dataset_id = "allDatasets"

e.variables = [
    "datasetID"
]

datasets_df = e.to_pandas().dropna()
datasets = set(datasets_df["datasetID"])

matching_datasets = {}
for dataset in datasets:
    info_url = e.get_info_url(dataset_id = dataset, response = "csv")
    dataset_info = pd.read_csv(info_url)

    variable_names = set(dataset_info["Variable Name"].unique())
    variable_intersect = list(set(focus_variables) & variable_names)
    if variable_intersect and dataset not in exclude:
         matching_datasets[dataset] = variable_intersect

basin = tracks.TrackDataset(basin=storm_basin, source=storm_source)

storm_dict= {}
if(arg_storm):
    storm_split= arg_storm.split("-")
    storm_dict[storm_split[0]] = int(storm_split[1])
else:
    all_storms_df = pd.read_csv(storm_csv)
    storm_dict = dict(zip(all_storms_df['storm'], all_storms_df['year']))

for storm_name in storm_dict:
    storm_year = storm_dict[storm_name]
    storm = basin.get_storm((storm_name,storm_year))

    output_directory = Path(f'./station-data/{storm_year}_{storm_name}')
    output_directory.mkdir(parents=True, exist_ok=True)

    storm = storm.sel(lat=[storm_lowerLat,None])
    storm_df = pd.DataFrame.from_dict(storm.to_dict())
        
    start_date = pytz.utc.localize(storm_df.min()['date'])
    end_date = pytz.utc.localize(storm_df.max()['date'])

    e = ERDDAP(
        server="https://cioosatlantic.ca/erddap", 
        protocol="tabledap",
        response="csv",
    )

    e.constraints = {
        "time<=": end_date + timedelta(days = arg_date_extension),
        "time>=": start_date- timedelta(days = arg_date_extension)
    }
        
    standard_vars = ["time", "longitude", "latitude"]

    for dataset in matching_datasets:
        print(dataset)
        if(arg_new_data and Path.exists(output_directory / dataset)):
            print('Data exists. Skipping')
            continue
        e.variables = standard_vars + matching_datasets[dataset]
        e.dataset_id = dataset
        try:
            buoy_data= e.to_pandas(
                        parse_dates=True,
                    ).dropna()
            buoy_data.to_csv(output_directory / dataset, mode='w')
        except:
            print("Data could not be found for that time")