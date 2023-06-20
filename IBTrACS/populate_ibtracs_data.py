# Download csv (see if changes from previous version, if not skip rest)

# Intake csv as pandas

# See if changes?

import pandas as pd
from pathlib import Path
import os
import requests
from datetime import datetime
import pytz

# TODO: Find out if the URL will be changed
# Store in config
url = "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.NA.list.v04r00.csv"
history_file = "last-modified.txt"

if(not os.path.isfile(history_file)):
    f= open(history_file, "x")
f = open(history_file, "r")
last_modified = f.read()
x = requests.head(url)
incoming_date = datetime.strptime(x.headers['last-modified'], '%a, %d %b %Y %H:%M:%S %Z')
if(last_modified):
    existing_date = datetime.strptime(last_modified, '%a, %d %b %Y %H:%M:%S %Z')
x.close

columns = ['SID', 'SEASON', 'BASIN', 'SUBBASIN', 'NAME', 'ISO_TIME', 'NATURE', 'LAT', 'LON', 
'WMO_WIND', 'WMO_PRES', 'WMO_AGENCY', 'IFLAG']

if(not last_modified or existing_date < incoming_date):
    df = pd.read_csv(url, usecols=columns)
    df['ISO_TIME'] = pd.to_datetime(df['ISO_TIME'], format = '%Y-%m-%d %H:%M:%S', errors='coerce')
    if(last_modified):
        df = df[df['ISO_TIME'] > existing_date]

    f = open(history_file, "w")
    f.write(x.headers['last-modified'])
    f.close()

    print("Import successful")
else:
    print("Newest data already downloaded")