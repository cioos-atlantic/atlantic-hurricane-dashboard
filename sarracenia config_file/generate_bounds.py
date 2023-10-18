# This script is used to generate the boundary coordinates for a storm to feed into an ERDDAP query
import shapefile as shp
import shapely
import numpy as np
import pandas as pd
#%matplotlib inline
import matplotlib.pyplot as plt
import seaborn as sns
# from osgeo import gdal

import os
os.environ['USE_PYGEOS'] = '0'

#shapely.geos_capi_version_string  
import geopandas as gpd
import fiona
import logging



logger= logging.getLogger(__name__)
sns.set(style="whitegrid", palette="pastel", color_codes=True) 
sns.mpl.rc("figure", figsize=(10,6))


def get_boundary (ecc_shp_path):

    logger.info("Getting Bounding Box Cordinates!")
    # Generating path directory for shapefiles
    shapefiles_dir = os.path.abspath(os.path.join('..', 'shapefiles'))

    # getting path to atlantic boundary and canadian hurricane response zone
    atl_bound_path = os.path.join(shapefiles_dir, 'atlantic_canada_boundary.shp')
    can_hurricane_bound= os.path.join(shapefiles_dir, 'hurricane_response_boundary.shp')
    

    
    # Loading files
    err1= gpd.read_file(ecc_shp_path)
    atlantic_data=gpd.read_file(atl_bound_path)
    can_hurricane=gpd.read_file(can_hurricane_bound)

    #getting boundary
    intersect_overlay_1= gpd.overlay(atlantic_data, err1, how='intersection')
    intersect_overlay= gpd.overlay(intersect_overlay_1, can_hurricane, how='intersection')
    intersect_overlay.bounds
    boundary= intersect_overlay.bounds
    (min_long, min_lat, max_long, max_lat)= boundary.values.tolist()[0]
    logger.debug ((min_long, min_lat, max_long, max_lat))
    logger.debug("Bounding Box Cordinates Successfully Calculated!")

    return  (min_long, min_lat, max_long, max_lat)






