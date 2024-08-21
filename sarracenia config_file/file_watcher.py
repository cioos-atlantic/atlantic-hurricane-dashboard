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
import time
import load_into_postgis as lpg
from dotenv import load_dotenv

logging.basicConfig(
        handlers=[RotatingFileHandler('./file_watcher.log', maxBytes=1_000_000, backupCount=10)],
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
    sub_string = ".shp"
    
    if sub_string in event.src_path:
        logger.info(f"Shape File Detected! {event.src_path} Waiting for writing to complete...")
        source_path = os.path.dirname(event.src_path)

        logger.debug(f"Source path is: {source_path}")
        time.sleep(1)

        logger.info("Uploading Data to PostGIS Database!")
        engine = lpg.pg_engine()

        lpg.process_eccc_shp_files(source_path, engine)
        
        engine.dispose()

        logger.info("Finished processing file.")


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
    event_handler.on_created = on_created
    event_handler.on_deleted = on_deleted
    event_handler.on_modified = on_modified
    event_handler.on_moved = on_moved

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

            if os.path.exists(os.getenv('STOP_FILE')):
                logger.info("STOP FILE detected, ")
                break
            
    except KeyboardInterrupt:
        observer.stop()
        logger.info("Monitoring Interrupted")
    observer.join()
    


