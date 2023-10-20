# install psycopg2 module to support SQL Alchemy and postgresql

import re
import os
from dotenv import load_dotenv
import pandas as pd
import psycopg2
from sqlalchemy import create_engine, text
from pathlib import Path

load_dotenv()

pg_host = os.getenv('PG_HOST')
pg_port = int(os.getenv('PG_PORT'))
pg_user = os.getenv('PG_USER')
pg_pass = os.getenv('PG_PASS')
pg_db = os.getenv('PG_DB')

md5_test_file = os.getenv('MD5_TEST_FILE')

active_file = os.getenv('ACTIVE_FILE')
historical_file = os.getenv('HISTORICAL_FILE')

active_table = os.getenv('ACTIVE_TABLE')
historical_table = os.getenv('HISTORICAL_TABLE')

ibtracs_files = {}

# Parse md5 checksum test result file for paths and states of checksum results 
# for the associated files
with open(file=md5_test_file, mode='r') as md5_file:
    (file_path, checksum_result) = md5_file.readline().split(": ")

    if active_file in file_path:
        ibtracs_files["active"] = {
            "path":file_path,
            "table":active_table,
            "checksum":checksum_result
        }

    if historical_file in file_path:
        ibtracs_files["historical"] = {
            "path":file_path,
            "table":historical_table,
            "checksum":checksum_result
        }

# Tells pandas to skip the 2nd line in the CSV file that specifies unit types 
# for the columns - this row doesn't need to be inserted into the postgis table
skip_rows = [1]

# Empty values in the CSV file are represented by an empty string, this value 
# isn't accounted for by default in pandas, so it needs to be specified here, 
# a dictionary of values is also possible if there are other values that 
# should be interpreted as null or n/a
na_values = ' '

# IBTRACS data types, derived from postgres table structure
table_dtypes = {
    "SID": 'string', 
    "SEASON": 'Float32', 
    "NUMBER": 'Float32', 
    "BASIN": 'string', 
    "SUBBASIN": 'string', 
    "NAME": 'string', 
    "ISO_TIME": 'string', 
    "NATURE": 'string', 
    "LAT": 'Float32', 
    "LON": 'Float32', 
    "WMO_WIND": 'Float32', 
    "WMO_PRES": 'Float32', 
    "WMO_AGENCY": 'string', 
    "TRACK_TYPE": 'string', 
    "DIST2LAND": 'Float32', 
    "LANDFALL": 'Float32', 
    "IFLAG": 'string', 
    "USA_AGENCY": 'string', 
    "USA_ATCF_ID": 'string', 
    "USA_LAT": 'Float32', 
    "USA_LON": 'Float32', 
    "USA_RECORD": 'string', 
    "USA_STATUS": 'string', 
    "USA_WIND": 'Float32', 
    "USA_PRES": 'Float32', 
    "USA_SSHS": 'Float32', 
    "USA_R34_NE": 'Float32', 
    "USA_R34_SE": 'Float32', 
    "USA_R34_SW": 'Float32', 
    "USA_R34_NW": 'Float32', 
    "USA_R50_NE": 'Float32', 
    "USA_R50_SE": 'Float32', 
    "USA_R50_SW": 'Float32', 
    "USA_R50_NW": 'Float32', 
    "USA_R64_NE": 'Float32', 
    "USA_R64_SE": 'Float32', 
    "USA_R64_SW": 'Float32', 
    "USA_R64_NW": 'Float32', 
    "USA_POCI": 'Float32', 
    "USA_ROCI": 'Float32', 
    "USA_RMW": 'Float32', 
    "USA_EYE": 'Float32', 
    "TOKYO_LAT": 'Float32', 
    "TOKYO_LON": 'Float32', 
    "TOKYO_GRADE": 'Float32', 
    "TOKYO_WIND": 'Float32', 
    "TOKYO_PRES": 'Float32', 
    "TOKYO_R50_DIR": 'Float32', 
    "TOKYO_R50_LONG": 'Float32', 
    "TOKYO_R50_SHORT": 'Float32', 
    "TOKYO_R30_DIR": 'Float32', 
    "TOKYO_R30_LONG": 'Float32', 
    "TOKYO_R30_SHORT": 'Float32', 
    "TOKYO_LAND": 'Float32', 
    "CMA_LAT": 'Float32', 
    "CMA_LON": 'Float32', 
    "CMA_CAT": 'Float32', 
    "CMA_WIND": 'Float32', 
    "CMA_PRES": 'Float32', 
    "HKO_LAT": 'Float32', 
    "HKO_LON": 'Float32', 
    "HKO_CAT": 'string', 
    "HKO_WIND": 'Float32', 
    "HKO_PRES": 'Float32', 
    "NEWDELHI_LAT": 'Float32', 
    "NEWDELHI_LON": 'Float32', 
    "NEWDELHI_GRADE": 'string', 
    "NEWDELHI_WIND": 'Float32', 
    "NEWDELHI_PRES": 'Float32', 
    "NEWDELHI_CI": 'Float32', 
    "NEWDELHI_DP": 'Float32', 
    "NEWDELHI_POCI": 'Float32', 
    "REUNION_LAT": 'Float32', 
    "REUNION_LON": 'Float32', 
    "REUNION_TYPE": 'string', 
    "REUNION_WIND": 'Float32', 
    "REUNION_PRES": 'Float32', 
    "REUNION_TNUM": 'string', 
    "REUNION_CI": 'string', 
    "REUNION_RMW": 'Float32', 
    "REUNION_R34_NE": 'Float32', 
    "REUNION_R34_SE": 'Float32', 
    "REUNION_R34_SW": 'Float32', 
    "REUNION_R34_NW": 'Float32', 
    "REUNION_R50_NE": 'Float32', 
    "REUNION_R50_SE": 'Float32', 
    "REUNION_R50_SW": 'Float32', 
    "REUNION_R50_NW": 'Float32', 
    "REUNION_R64_NE": 'Float32', 
    "REUNION_R64_SE": 'Float32', 
    "REUNION_R64_SW": 'Float32', 
    "REUNION_R64_NW": 'Float32', 
    "BOM_LAT": 'Float32', 
    "BOM_LON": 'Float32', 
    "BOM_TYPE": 'string', 
    "BOM_WIND": 'Float32', 
    "BOM_PRES": 'Float32', 
    "BOM_TNUM": 'string', 
    "BOM_CI": 'string', 
    "BOM_RMW": 'Float32', 
    "BOM_R34_NE": 'Float32', 
    "BOM_R34_SE": 'Float32', 
    "BOM_R34_SW": 'Float32', 
    "BOM_R34_NW": 'Float32', 
    "BOM_R50_NE": 'Float32', 
    "BOM_R50_SE": 'Float32', 
    "BOM_R50_SW": 'Float32', 
    "BOM_R50_NW": 'Float32', 
    "BOM_R64_NE": 'Float32', 
    "BOM_R64_SE": 'Float32', 
    "BOM_R64_SW": 'Float32', 
    "BOM_R64_NW": 'Float32', 
    "BOM_ROCI": 'Float32', 
    "BOM_POCI": 'Float32', 
    "BOM_EYE": 'Float32', 
    "BOM_POS_METHOD": 'string', 
    "BOM_PRES_METHOD": 'string', 
    "NADI_LAT": 'Float32', 
    "NADI_LON": 'Float32', 
    "NADI_CAT": 'Float32', 
    "NADI_WIND": 'Float32', 
    "NADI_PRES": 'Float32', 
    "WELLINGTON_LAT": 'Float32', 
    "WELLINGTON_LON": 'Float32', 
    "WELLINGTON_WIND": 'Float32', 
    "WELLINGTON_PRES": 'Float32', 
    "DS824_LAT": 'Float32', 
    "DS824_LON": 'Float32', 
    "DS824_STAGE": 'string', 
    "DS824_WIND": 'Float32', 
    "DS824_PRES": 'Float32', 
    "TD9636_LAT": 'Float32', 
    "TD9636_LON": 'Float32', 
    "TD9636_STAGE": 'Float32', 
    "TD9636_WIND": 'Float32', 
    "TD9636_PRES": 'Float32', 
    "TD9635_LAT": 'Float32', 
    "TD9635_LON": 'Float32', 
    "TD9635_WIND": 'Float32', 
    "TD9635_PRES": 'Float32', 
    "TD9635_ROCI": 'Float32', 
    "NEUMANN_LAT": 'Float32', 
    "NEUMANN_LON": 'Float32', 
    "NEUMANN_CLASS": 'string', 
    "NEUMANN_WIND": 'Float32', 
    "NEUMANN_PRES": 'Float32', 
    "MLC_LAT": 'Float32', 
    "MLC_LON": 'Float32', 
    "MLC_CLASS": 'string', 
    "MLC_WIND": 'Float32', 
    "MLC_PRES": 'Float32', 
    "USA_GUST": 'Float32', 
    "BOM_GUST": 'Float32', 
    "BOM_GUST_PER": 'Float32', 
    "REUNION_GUST": 'Float32', 
    "REUNION_GUST_PER": 'Float32', 
    "USA_SEAHGT": 'Float32', 
    "USA_SEARAD_NE": 'Float32', 
    "USA_SEARAD_SE": 'Float32', 
    "USA_SEARAD_SW": 'Float32', 
    "USA_SEARAD_NW": 'Float32', 
    "STORM_SPEED": 'Float32', 
    "STORM_DIR": 'Float32'
}

engine = create_engine(f"postgresql+psycopg2://{pg_user}:{pg_pass}@{pg_host}:{pg_port}/{pg_db}")

def process_ibtracs(source_csv_file, destination_table, pg_engine):
    df = pd.read_csv(filepath_or_buffer=source_csv_file, header=0, skiprows=skip_rows, parse_dates=True, dtype=table_dtypes, na_values=na_values, keep_default_na=False)
    
    # truncate tables
    print("Clearing Existing Data...")
    sql = f"DELETE FROM {destination_table};"
    pg_conn.execute(text(sql))

    # populate table
    print("Populating Table...")
    df.to_sql(destination_table, pg_engine, chunksize=1000, method='multi', if_exists='append', index=False, schema='public')
    
    with pg_engine.begin() as pg_conn:
        print("Updating Geometry...")
        sql = f'UPDATE public.{destination_table} SET geom = ST_SetSRID(ST_MakePoint("LON", "LAT"), 4326);'
        pg_conn.execute(text(sql))

        print("Committing Transaction.")
        pg_conn.execute(text("COMMIT;"))
        print("Fin.")


for file in ibtracs_files.keys():
    print(f"Checking {ibtracs_files[file]['path']} with checksum result: {ibtracs_files[file]['checksum']}...")
    if file["checksum"] == "FAILED":
        print("Checksum Failed! processing new file...")
        process_ibtracs(source_csv_file=ibtracs_files[file]["path"], destination_table=ibtracs_files[file]["table"], pg_engine=engine)
        print("Finished Processing.")

print("End.")
