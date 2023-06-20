# Download csv (see if changes from previous version, if not skip rest)

# Intake csv as pandas

# See if changes?

import pandas as pd
from pathlib import Path
import os
import requests
from datetime import datetime
import pytz

# file in data/ibtracs

# TODO: Find out if the URL will be changed
# Can possibly just pattern match the NA section
url = "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.NA.list.v04r00.csv"
existing_data = True

f = open("data/last-modified.txt", "r")
if(f.read()==''):
    print("No existing data grab found")
    existing_data = False
else:
    x = requests.head(url)
    existing_date = datetime.strptime(f.read(), '%a, %d %b %Y %H:%M:%S %Z')
    incoming_date = datetime.strptime(x.headers['last-modified'], '%a, %d %b %Y %H:%M:%S %Z')
    x.close

columns = ['SID', 'SEASON', 'BASIN', 'SUBBASIN', 'NAME', 'ISO_TIME', 'NATURE', 'LAT', 'LON', 
'WMO_WIND', 'WMO_PRES', 'WMO_AGENCY', 'IFLAG']

if(existing_date < incoming_date):
    print("Newer data exists. Downloading")
    
    df = pd.read_csv(url, usecols=columns)
    df = pd.read_csv("data/ibtracs.NA.list.v04r00.csv", usecols = columns)
    df['ISO_TIME'] = pd.to_datetime(df['ISO_TIME'], format = '%Y-%m-%d %H:%M:%S', errors='coerce')
    new_data = df[df['ISO_TIME'] > existing_date]

    f = open("data/last-modified.txt", "w")
    f.write(x.headers['last-modified'])
    f.close()
else:
    print("Newest data already downloaded")