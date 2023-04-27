// https://iconoir.com/ icon library that can be installed via npm
import React, { useState, useMemo } from "react";
import { parseISO, format } from 'date-fns';
import { MapContainer, TileLayer, WMSTileLayer, LayersControl, FeatureGroup, LayerGroup, Marker, Popup, Polygon, PolygonProps, Polyline } from 'react-leaflet'
import { useMap, useMapEvent, useMapEvents } from 'react-leaflet/hooks'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import "leaflet-defaulticon-compatibility";

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


const empty_point_obj = {properties:{}, geometry:{}}

function PointDetails(point){
  
  if(point == empty_point_obj){
    return (<></>);
  }

  return (
    <div>
      <h3>{point.properties.STORMNAME}</h3>
      <p>Coordinate Type: {point.geometry.type}</p>
      <p>Timestamp: {format(parseISO(point.properties.TIMESTAMP), 'PP pp X')}</p>
      <p>Lat/Long: {point.properties.LAT} {point.properties.LON}</p>
      <p>Max Windspeed: {point.properties.MAXWIND}</p>
      <p>Pressure: {point.properties.MSLP}</p>
    </div>
  )
}

export default function Map({ children, storm_data }) {
  const [hover_marker, setHoverMarker] = useState(empty_point_obj);

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

  return (
    <div className="map_container">
      <div className='inner_container'>
        <div className="info_pane">
          { PointDetails(hover_marker) }
        </div>
        <MapContainer
          center={defaultPosition}
          zoom={defaultZoom}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />

          <WMSTileLayer
            url="https://geo.weather.gc.ca/geomet"
            layers='HURRICANE_RESPONSE_ZONE'
            format='image/png'
            transparent='true'
            styles='HURRICANE_LINE_BLACK_DASHED'
            attribution='<a href=&quot;https://www.canada.ca/en/environment-climate-change.html&quot;>ECCC</a>'
            version='1.3.0'
          />

          <LayersControl position="topright">
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
                    console.log(point);
                    const position = flip_coords(point.geometry.coordinates);
                    return (
                      <Marker
                        key={point.properties.TIMESTAMP}
                        position={position}
                        eventHandlers={{
                          mouseover: (event) => setHoverMarker(point),
                        }}
                      >
                      </Marker>
                    );
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
                    if(hover_marker.properties.TIMESTAMP != radii.properties.TIMESTAMP){
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
