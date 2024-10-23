// https://iconoir.com/ icon library that can be installed via npm
import React, { useState, useMemo, useEffect } from "react";
import { parseISO, format } from 'date-fns';
import { MapContainer, TileLayer, WMSTileLayer, LayersControl, FeatureGroup, LayerGroup, Marker, Popup, Polygon, Polyline } from 'react-leaflet'
import { useMap, useMapEvent, useMapEvents } from 'react-leaflet/hooks'
import { Icon, DivIcon, Point } from 'leaflet'
import Image from "next/image";
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import "leaflet-defaulticon-compatibility";

import station_names from "../data/station/names.json"

import HurricaneIcon from '../public/hurricane.svg'
import TropicalStormIcon from '../public/tropical-storm.svg'
import { useRouter } from 'next/router';
import {handleStormHoveredData} from './handle_storm_hovered_data'

const defaultPosition = [46.9736, -54.69528]; // Mouth of Placentia Bay
const defaultZoom = 4

const hurricane_categories = {
  "5":{
    "min":157,
    "max":null,
    "name": {"en": "Category 5", "fr": "catégorie 5"}
  },
  "4":{
    "min":113,
    "max":136,
    "name": {"en": "Category 4", "fr": "catégorie 4"}
  },
  "3":{
    "min":96,
    "max":112,
    "name": {"en": "Category 3", "fr": "catégorie 3"}
  },
  "2":{
    "min":83,
    "max":95,
    "name": {"en": "Category 2", "fr": "catégorie 2"}
  },
  "1":{
    "min":64,
    "max":82,
    "name": {"en": "Category 1", "fr": "catégorie 1"}
  },
  "TS":{
    "min":34,
    "max":63,
    "name": {"en": "Tropical Storm", "fr": "Tempête tropicale"}
  },
  "TD":{
    "min": 33,
    "max": null,
    "name": {"en": "Tropical Depression", "fr": "Dépression tropicale"}
  },
}

/**
 * Flips an array of coordinate arrays, simply flips the order of each 
 * element of the larger list of coordinates
 * @param {array} coordinates an array of coordinate arrays
 * @returns 
 */
function remap_coord_array(coordinates) {
  return (coordinates.map(coord => { return (flip_coords(coord)) }));
}

/**
 * Flips the order of a pair of coordinates from lat/lon to lon/lat and vice-
 * versa, Leaflet sometimes requires coordinates in a different order than 
 * other geospatial softwares.
 * 
 * @param {array} coordinates [lon,lat] or [lat,lon]
 * @returns {array}
 */
function flip_coords(coordinates) {
  return ([coordinates[1], coordinates[0]]);
}

/**
 * Because multiple sources are in play with different names for different 
 * values a list of candidates need to be supplied to be iterated through to 
 * return the one with an actual, usable value in it.
 * 
 * @param {object} point the storm point object
 * @param {array} property_list list of properties that may have the appropriate value
 */
function fetch_value(point, property_list){
  let return_value = null;
  
  property_list.every(value => {
    if (point.properties[value] !== undefined && point.properties[value] !== null){
      return_value = point.properties[value];
      return false;
    }

    return true;
  });

  return return_value;
}


const empty_point_obj = { properties: {}, geometry: {} }




// Have it as a dictionary with time as keys and values as values?
function Station_Variable(name, std_name,  value, units){
  this.name = name;
  this.standard_name = std_name;
  this.value = value;
  this.units = units;
}

function RecentStationData(data){
  const station_data = JSON.parse(data)
  const len = Object.keys(station_data).length
  let data_obj = {}
  let children = []
  // Will always be most recently added
  Object.keys(station_data[len-1]).forEach(element => {
    const value = station_data[len-1][element]
    if (element.includes('(time|')) {
      const datetime = new Date(value * 1).toLocaleString()
      data_obj['datetime'] = datetime
    }
    else{
        //WARNING: Ugly regex ahead
        //Name (standard_name | units | long_name)
        const standard_name = element.match("\\((.*?)\\|")[1];
        const units = element.match("\\|(.*?)\\|")[1];
        const long_name = element.match("[^\\|]*\\|[^\\|]*\\|(.*?)\\)")[1];
        data_obj[standard_name] = new Station_Variable(long_name, standard_name, value, units);
    }
  })

  //TODO: Clean up
  const attributes_of_interest = {
    'sea_surface_wave_significant_height':'Wave Height (Avg)',
    'sea_surface_wave_maximum_height':'Wave Height (Max)',
    'air_temperature':'Temperature (Air)',
    'sea_surface_temperature': 'Temperature (Sea Surface)',
    'air_pressure':'Air Pressure',
    'relative_humidity':'Humidity'
  }
  // Separate section for wind since the arrows need to be drawn
  if(data_obj['wind_from_direction']){
    const wind_direction = (180 + parseInt(data_obj['wind_from_direction'].value)) % 360
    children.push(<strong>Wind:  </strong>)
    children.push(<Image class="wind_arrow" alt={wind_direction} src="arrow.svg" height={20} width={20} 
      style={{ transform: 'rotate(' + (wind_direction) + 'deg)' }}></Image>)
  }
  if(data_obj['wind_speed']){
    children.push(<span>   {(parseFloat(data_obj['wind_speed'].value).toFixed(1))} {data_obj['wind_speed'].units}</span>)}
  Object.entries(attributes_of_interest).forEach(entry =>{
    const key = entry[0]
    const val = entry[1]
    if(data_obj[key] && data_obj[key].value){
        children.push(<p><strong>{val}:</strong> {(parseFloat(data_obj[key].value).toFixed(1))} {data_obj[key].units}</p>)}
  })
  let station_info = (
    <div className="station_pane">
      <p>{data_obj['datetime']}</p>
      {children}
    </div>
  )

  return station_info;
}

function PointDetails(point) {
  // ECCC and IBTRACS have multiple ways to define a storm type, some overlap and others are unique
  const [isVisible, setIsVisible] = useState(true);
  const [hoverTimer, setHoverTimer] = useState(null); // Timer state
  useEffect(() => {
    if (point !== empty_point_obj) {
      setIsVisible(true); // Show the info pane when point changes

      // Clear any existing timer
      if (hoverTimer) {
        clearTimeout(hoverTimer);
      }
      
      // Set a new timer for 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false); // Hide info pane after 10 seconds
      }, 10000);
      setHoverTimer(timer); // Store the timer ID
    }
    
    return () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer); // Cleanup timer on unmount or change
      }
    };
  }, [point]);

  if (point === empty_point_obj) {
    return null; // Don't render anything if point is empty
  }
  const storm_types = {
    "MX": "Mixture",
    "NR": "Not Reported",
    "SS": "Subtropical Storm",
    "ET": "Extratropical Storm",
    "DS": "Disturbance",
    "TD": "Tropical Depression",
    "TS": "Tropical Storm",
    "HU": "Hurricane",
    "HR": "Hurricane",
    "PT": "Post-Tropical Storm",
  };

  if (point == empty_point_obj) {
    return (<></>);
  }

  // ECCC and IBTRACS use different names for the same kinds of information.  Sometimes, within IBTRACS, several different fields may possibly contain the appropriate value
  // ECCC uses TIMESTAMP and IBTRACS uses ISO_TIME
  const TIMESTAMP = fetch_value(point, ["TIMESTAMP", "ISO_TIME"]);
  const STORMNAME = fetch_value(point, ["STORMNAME", "NAME"]);
  const STORMTYPE = fetch_value(point, ["STORMTYPE", "NATURE"]);
  const STORMFORCE = fetch_value(point, ["STORMFORCE", "USA_SSHS"]);
  const MAXWIND = fetch_value(point, ["MAXWIND", "WMO_WIND", "USA_WIND"]);
  const MINPRESS = fetch_value(point, ["MSLP", "WMO_PRES", "USA_PRES"]);


  return (isVisible &&(
    <div className="info_pane">
      <div>
        <h3>{STORMNAME}</h3>
        <p><strong>Storm Type:</strong> {storm_types[STORMTYPE]}</p>
        <p><strong>Storm Status:</strong> {point.properties.TCDVLP}</p>
        <p><strong>Storm Category:</strong> {STORMFORCE}</p>
        <p><strong>Timestamp:</strong> {format(parseISO(TIMESTAMP), 'PP pp X')}</p>
        <p><strong>Lat/Long:</strong> {point.properties.LAT}&deg; N, {point.properties.LON}&deg; W</p>
        <p><strong>Max Windspeed:</strong> {MAXWIND} knots ({(MAXWIND * 1.84).toFixed(2)} km/h)</p>
        <p><strong>Pressure:</strong> {MINPRESS}mb</p>
        {
          point.properties.ERRCT &&
          <p><strong>Error radius :</strong> {point.properties.ERRCT} nmi ({(point.properties.ERRCT * 1.852).toFixed(2)} km)</p>
        }
      </div>
    </div>
  ))
}

function parseHistoricalData(storm_data){
  //console.log(storm_data)
  let storm_features = {
    // create an empty object to store the storm_points
    pts:{features:[]},
    err:{features:[]},
    lin:{features:[]},
    rad:{features:[]},
  };
  

  let storm_details = {}
  let ib_storm_list = []
  //console.log("storm_data")
  //console.log(storm_data.ib_data.features)
  storm_data.ib_data.features.map(storm_point => {
    if (!ib_storm_list.includes(storm_point.properties.NAME)) {
      ib_storm_list.push(storm_point.properties.NAME)
      storm_details[storm_point.properties.NAME] = {
        source: "ibtracs", 
        year: storm_point.properties.SEASON, 
        data: []
      }
    }
    storm_details[storm_point.properties.NAME].data.push(storm_point)
});

  //console.log(storm_details)
  // Extract the storm key dynamically
  let stormName = Object.keys(storm_details)[0];

  // Extract the storm data using the key
  let storm_info = storm_details[stormName];

  for(let i in storm_info.data){
    
    switch(storm_info.data[i].geometry.type){
      case "Point":
        storm_features.pts.features.push(storm_info.data[i])
        break;
      // case "LineString":
      //   break;
      // case "Polygon":
      //   break;
    }
  }

  
  //console.log(storm_features);
  return storm_features;
};

export default function Map({ children, storm_data, station_data, source_type }) {
  // Add parameter for points
  // Points always there, even not in storm seasons

  const router = useRouter();
  //console.log(storm_data)
  const [hover_marker, setHoverMarker] = useState(empty_point_obj);
  function handleMouseOver(point) {
    handleStormHoveredData(point);
    setHoverMarker(point); // Set the hovered marker
  };


  //console.log(source_type)
  //console.log(storm_data)


  /*useEffect(() => { // not useful, implemented in the layout after handleHarvestHistoricalData
    // Check if stormData is an empty array

    if (source_type === "historical" && (storm_data?.ib_data?.features?.length === 0)) {
      console.log("Empty array, redirecting to 404...");
      // Redirect to the 404 page
      router.replace('/404'); 
      //TODO 
      // fix 404
    }
  }, [source_type, storm_data, router]);
    // Early return if we are redirecting
    if (source_type === "historical" && storm_data?.ib_data?.features?.length === 0) {
      return null; // Prevent further rendering
    }*/

  if (source_type === "historical"){
    storm_data = parseHistoricalData(storm_data)
    console.log(station_data)
    //console.log(station_data)

    
    
  }// end of historical if

  
  //console.log("Data");
  //console.log(Object.entries(station_data));
  //console.log(station_data);
  const hurricon = new Icon({
    iconUrl: HurricaneIcon.src,
    iconRetinaUrl: HurricaneIcon.src,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const tropstrmicon = new Icon({
    iconUrl: TropicalStormIcon.src,
    iconRetinaUrl: TropicalStormIcon.src,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  //let station_markers = [];
  //station_data.forEach((element, i) => station_markers[i] = Marker([element.geometry.coordinates[0], element.geometry.coordinates[1]]));

  // Define error cone object and populate it if the appropriate object is 
  // defined in storm_data, Leaflet requires the coordinates be flipped from 
  // the way it is encoded in the ECCC data.
  // 
  // Same for line track and storm radius polygons
  let err_cone = [];
  if (storm_data.err.features.length > 0) {
    err_cone = remap_coord_array(storm_data.err.features[0].geometry.coordinates[0]);
  }

  let line_track = [];
  if (storm_data.err.features.length > 0) {
    line_track = remap_coord_array(storm_data.lin.features[0].geometry.coordinates);
  }

  let storm_radius = [];
  if (storm_data.rad.features.length > 0) {
    storm_radius = remap_coord_array(storm_data.rad.features[0].geometry.coordinates);
  }

  // console.log("hurricane_icon: ", HurricaneIcon.src)
  // console.log("hurricon_div: ", hurricon_div)
  // console.log("hurricon: ", hurricon)

  return (
    <div className="map_container">
      <div className='inner_container'>
        {PointDetails(hover_marker)}
        <MapContainer
          center={defaultPosition}
          zoom={defaultZoom}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />

          <LayersControl position="topright">
            <LayersControl.Overlay checked name="ECCC Hurricane Response Zone">
              <LayerGroup>
                <WMSTileLayer
                  url="https://geo.weather.gc.ca/geomet"
                  layers='HURRICANE_RESPONSE_ZONE'
                  format='image/png'
                  transparent='true'
                  styles='HURRICANE_LINE_BLACK_DASHED'
                  attribution='<a href=&quot;https://www.canada.ca/en/environment-climate-change.html&quot;>ECCC</a>'
                  version='1.3.0'
                />
              </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Error Cone">
              <LayerGroup>
                {
                  err_cone.length > 0 &&
                  <Polygon positions={err_cone} />
                }
              </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Points">
              <LayerGroup>
                {
                  storm_data.pts.features.map(point => {
                    const position = flip_coords(point.geometry.coordinates);
                    return (
                      <Marker
                        key={point.properties.TIMESTAMP}
                        position={position}
                        eventHandlers={{
                          mouseover: (event) => handleMouseOver(point),
                          mouseout: () => {}, // No action on mouse out; handled by the timer
                        }}
                        icon={hurricon}
                      >
                      </Marker>
                    );
                  })
                }
              </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Stations">
              <LayerGroup>
                { 
                  Object.entries(station_data).map((element) => {
                    const data_link = "https://cioosatlantic.ca/erddap/tabledap/" + element[0] + ".html"
                    const data = RecentStationData(element[1].properties.station_data)
                    const station_name = element[1].properties.station
                    const display_name = (station_name in station_names) ? station_names[station_name]['display']:station_name
                    return (
                      <Marker 
                        key={element.station} 
                        position={flip_coords(element[1].geometry.coordinates)}
                        //eventHandlers={{click : )}}
                        >
                          <Popup> 
                            <h3>{display_name}</h3>
                            {data}
                            <a href={data_link} target="_blank">Full data</a>
                          </Popup>
                        </Marker>
                    )
                  })
                }
              </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Track Line">
              <LayerGroup>
                {
                  line_track.length > 0 &&
                  <Polyline positions={line_track} />
                }
              </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Storm Radius">
              <LayerGroup>
                {
                  storm_data.rad.features.length > 0 &&
                  storm_data.rad.features.map(radii => {

                    let fixed_coords = remap_coord_array(radii.geometry.coordinates[0]);
                    if (hover_marker.properties.TIMESTAMP != radii.properties.TIMESTAMP) {
                      fixed_coords = false;
                    }

                    const path_options = { className: 'eccc-rad-'.concat(radii.properties.WINDFORCE) };

                    return (
                      <Polygon
                        key={radii.properties.TIMESTAMP + radii.properties.WINDFORCE}
                        positions={fixed_coords}
                        pathOptions={path_options}

                      >
                        <Popup>
                          <h3>{radii.properties.STORMNAME}</h3>
                          <p>Wind force: {radii.properties.WINDFORCE}</p>
                          <p>Timestamp: {radii.properties.TIMESTAMP}</p>
                        </Popup>
                      </Polygon>
                    );
                  })
                }
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      </div>
    </div>
  )
}
