import { MapContainer, TileLayer, LayersControl, FeatureGroup, LayerGroup, Marker, Popup, Polygon, PolygonProps, Polyline } from 'react-leaflet'
import { useMap, useMapEvent, useMapEvents } from 'react-leaflet/hooks'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import "leaflet-defaulticon-compatibility";

const defaultPosition = [46.9736, -54.69528]; // Mouth of Placentia Bay
const defaultZoom = 4

function remap_coord_array(coordinates) {
  return (coordinates.map(coord => { return (flip_coords(coord)) }));
}

function flip_coords(coordinates) {
  return ([coordinates[1], coordinates[0]]);
}

export default function Map({ children, storm_data }) {
  // console.log(storm_data.pts.features)
  // const points = forecasts[0].filter(storm => storm.file_type == "pts")
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
                    >
                      <Popup>
                        <p>Coordinate Type: {point.geometry.type}</p>
                        <p>Timestamp: {point.properties.TIMESTAMP}</p>
                        <p>Storm Name: {point.properties.STORMNAME}</p>
                        <p>Lat/Long: {point.properties.LAT} {point.properties.LON}</p>
                        <p>Max Windspeed: {point.properties.MAXWIND}</p>
                        <p>Pressure: {point.properties.MSLP}</p>
                      </Popup>
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
                  return(
                    <Polygon positions={remap_coord_array(radii.geometry.coordinates[0])}/>
                  );
                })
              }
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  )
}
