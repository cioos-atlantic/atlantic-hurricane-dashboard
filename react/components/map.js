// https://iconoir.com/ icon library that can be installed via npm
import React, { useState, useMemo } from "react";
import { parseISO, format } from 'date-fns';
import { MapContainer, TileLayer, WMSTileLayer, LayersControl, FeatureGroup, LayerGroup, Marker, Popup, Polygon, Polyline } from 'react-leaflet'
import { useMap, useMapEvent, useMapEvents } from 'react-leaflet/hooks'
import { Icon, DivIcon, Point } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import "leaflet-defaulticon-compatibility";

import HurricaneIcon from '../public/hurricane.svg'
import TropicalStormIcon from '../public/tropical-storm.svg'

const defaultPosition = [46.9736, -54.69528]; // Mouth of Placentia Bay
const defaultZoom = 4

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


const empty_point_obj = { properties: {}, geometry: {} }

function PointDetails(point) {
  const storm_types = [
    "Tropical Depression",
    "Tropical Storm",
    "Hurricane",
    "Post-Tropical",
  ];

  if (point == empty_point_obj) {
    return (<></>);
  }

  return (
    <div className="info_pane">
      <div>
        <h3>{point.properties.STORMNAME}</h3>
        <p><strong>Storm Type:</strong> {storm_types[point.properties.STORMTYPE]}</p>
        <p><strong>Storm Status:</strong> {point.properties.TCDVLP}</p>
        <p><strong>Storm Force:</strong> {point.properties.STORMFORCE}</p>
        <p><strong>Timestamp:</strong> {format(parseISO(point.properties.TIMESTAMP), 'PP pp X')}</p>
        <p><strong>Lat/Long:</strong> {point.properties.LAT}&deg; N, {point.properties.LON}&deg; W</p>
        <p><strong>Max Windspeed:</strong> {point.properties.MAXWIND} knots ({(point.properties.MAXWIND * 1.84).toFixed(2)} km/h)</p>
        <p><strong>Pressure:</strong> {point.properties.MSLP}mb</p>
        <p><strong>Error radius :</strong> {point.properties.ERRCT} nmi ({(point.properties.ERRCT * 1.852).toFixed(2)} km)</p>
      </div>
    </div>
  )
}

export default function Map({ children, storm_data, station_data }) {
  // Add parameter for points
  // Points always there, even not in storm seasons
  const [hover_marker, setHoverMarker] = useState(empty_point_obj);
  console.log("Data");
  console.log(storm_data);
  console.log(station_data);
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

  const examplestationdata = new Point(44.59, -63.52);

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
                    // console.log(point);
                    //const position = flip_coords(point.geometry.coordinates);
                    const position = [46.9736, -54.69528]
                    return (
                      <Marker
                        key={point.properties.TIMESTAMP}
                        position={position}
                        eventHandlers={{
                          mouseover: (event) => setHoverMarker(point),
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
                  <Marker key={"Test"} position={[46.9736, -54.69528]}></Marker>
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
