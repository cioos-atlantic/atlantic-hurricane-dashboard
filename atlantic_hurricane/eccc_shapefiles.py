import bs4
import requests
import os
from urllib.parse import urlparse

FIONA_URL = "https://dd.weather.gc.ca/trajectoires/hurricane/shapefile/FIONA/"
SHAPE_DIR = os.path.abspath(os.path.join('..', 'data', 'fiona', 'eccc'))

def create_shape_dir():
    if not os.path.exists(SHAPE_DIR):
        os.makedirs(SHAPE_DIR)

def dl_all_shapefiles():
    create_shape_dir()
    r = requests.get(FIONA_URL)
    data = bs4.BeautifulSoup(r.text, "html.parser")
    for l in data.find_all("a"):
        r = requests.get(FIONA_URL + l["href"])
        u = urlparse(r.url)
        file_name = os.path.basename(u.path)
        if file_name:
            print(file_name)
            file_path = os.path.join(SHAPE_DIR, file_name)
            if not os.path.exists(file_path):
                open(file_path, 'wb').write(r.content)

def dl_shapefile(shapefile_name):
    create_shape_dir()
    r = requests.get(FIONA_URL)
    data = bs4.BeautifulSoup(r.text, "html.parser")
    links = data.find_all("a")
    shapefile_href_list = [l["href"] for l in links if l["href"] == shapefile_name]
    if len(shapefile_href_list) == 1:
        shapefile_href = shapefile_href_list[0]
        r = requests.get(FIONA_URL + shapefile_href)
        u = urlparse(r.url)
        file_name = os.path.basename(u.path)
        if file_name:
            file_path = os.path.join(SHAPE_DIR, file_name)
            if not os.path.exists(file_path):
                open(file_path, 'wb').write(r.content)
            return(file_path)
    return('')

