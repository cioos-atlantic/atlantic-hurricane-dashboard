# %%
# Using the watchdog library with filehandler
# this script is combined with the generate_bound script to watch for new files 
# in the set directory and generate the boundary requirements for ERDDAP to query
import sys
import os
import time
import logging
from logging.handlers import RotatingFileHandler
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import generate_bounds as gb
import time
import load_into_postgis as lpg
from dotenv import load_dotenv

logging.basicConfig(
        handlers=[RotatingFileHandler('./file_watcher_log.log', maxBytes=100000, backupCount=10)],
        level=logging.DEBUG,
        format="[%(asctime)s] %(levelname)s [%(name)s.%(funcName)s:%(lineno)d] %(message)s",
        datefmt='%Y-%m-%dT%H:%M:%S')

logger= logging.getLogger(__name__)

load_dotenv() 

folder_path = os.getenv('ECCC_SHP_SOURCE')

def on_created(event):
    # This occurs when a new file has been added or created
    logger.info((
            "[{}] noticed: [{}] on: [{}] ".format(
                time.asctime(), event.event_type, event.src_path
            ))
        )
    # It searches for the error cone shape file and converts it to a raw string
    # It is then used to get the boundary points by passing the path to the ts module
    # Added a time sleep to give some time for all files to load
    sub_string = ".err.shp"
    
    if sub_string in event.src_path:
        logger.info("Shape File Detected!")
        time.sleep(10)
        file_path= r'{}'.format(event.src_path)  
        (min_long, min_lat, max_long, max_lat)= gb.get_boundary(ecc_shp_path=file_path)
        logger.info((min_long, min_lat, max_long, max_lat))
        return (min_long, min_lat, max_long, max_lat)
        

    time.sleep(60)
    logger.info("Uploading Data to PostGIS Database!")
    engine= lpg.pg_engine()

    lpg.process_eccc_shp_files(path, engine)

    

def on_deleted(event):
    logger.info(
            "[{}] noticed: [{}] on: [{}] ".format(
                time.asctime(), event.event_type, (event.src_path)
            )
        )
    logger.debug(event.src_path)

def on_modified(event):
    logger.info(
            "[{}] noticed: [{}] on: [{}] ".format(
                time.asctime(), event.event_type, event.src_path
            )
        )
    logger.debug(event.src_path)

def on_moved(event):
    logger.info(
            "[{}] noticed: [{}] on: [{}] ".format(
                time.asctime(), event.event_type, event.src_path
            )
        )
    logger.debug(event.src_path)

if __name__ == "__main__":
    
    
    event_handler = FileSystemEventHandler()
    #calling functions
    event_handler.on_created= on_created
    event_handler.on_deleted= on_deleted
    event_handler.on_modified= on_modified
    event_handler.on_moved= on_moved

    #set to watch the shapefiles directory
    #path = os.path.abspath(os.path.join('..', 'shapefiles')) # to be configured
    #path= r"/path/to/shapefiles/" # test path
    path= folder_path
    
    observer = Observer()
    observer.schedule(event_handler, path, recursive=True) # recursive means it is monitoring everything in the sub folders so it should be left at True
    observer.start()
    try:
        logger.info ("Now Monitoring")
        while True:
            time.sleep(30)
            
    except KeyboardInterrupt:
        observer.stop()
        logger.info("Monitoring Interrupted")
    observer.join()
    


