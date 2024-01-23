Procedure
- Build a conda environment with environment.yaml file 
(Disclaimer: the environment.yaml file contains both conda and pip packages. If you 
want to run only pip packages, then search the conda site for the pip package 
equivalent. Also be careful while installing conda packages after installing pip
 packages, things tend to break when that happens. Anyways, Goodluck!

- Set up Sarracenia MetPX-Sr3 to pull new hurricane shapefiles from  http://dd.weather.gc.ca
using the dd_hurricane.conf. The GitHub page for this package is found at https://github.com/MetPX/sarracenia.
More on setting up sarracenia below 

- Confirm the pipeline works using a more frequently populated directory like
http://dd.weather.gc.ca/citypage_weather, except ofcourse it is storm season. 
Things should be easier to verify then

- Before running the file_watcher.py script, create a .env file with your Postgres
credentials using the .env.template file

- Use any Postgres data manaagement tool to visualize the database. PGAdmin is a
pretty good one. it can be downloaded or set up as a docker image. More details on 
using PGAdmin can be found at https://www.pgadmin.org/docs/pgadmin4/latest/index.html


- Run file_watcher.py



Sarracenia
Navigating sarracenia is much easier using a linux system. Documentation for
sarracenia is written with linux codes and will automatically generate the 
required paths with windows, things are a little more tricky when using windows

Windows generates the path C:\Users\ceboigbe\AppData\Local\MetPX
For the documentation sarracenia setup visit  https://metpx.github.io/sarracenia/Tutorials/1_CLI_introduction.html

The generate_bounds.py and load_into_postgis.py scripts have been added in the
file_watcher.py scripts as modules

file_watcher.py
This script is used to watch a specified directory for any changes especially
for noticing the addition of new files in a folder or subfolders.

generate_bounds.py
The generate_bounds.py generates spatial bounds that can be used to query ERDDAP
datasets to filter out stations or buoy not close to the predicted storm path.
Its compares the canadian hurricane resonse shapefile with a generated shapefile
of the atlantic region

load_into_postgis.py
This converts the new files to json files and loads them in a Postgres database
