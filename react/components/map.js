import { MapContainer, TileLayer, LayersControl, FeatureGroup, LayerGroup, Marker, Popup } from 'react-leaflet'
import { useMap, useMapEvent, useMapEvents } from 'react-leaflet/hooks'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import "leaflet-defaulticon-compatibility";

const defaultPosition = [46.9736, -54.69528]; // Mouth of Placentia Bay
const defaultZoom = 4

export default function Map({ children, error_cone, points, track, storm_radius }) {
  // console.log(forecasts)
  // const points = forecasts[0].filter(storm => storm.file_type == "pts")
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
          <LayersControl.Overlay name="Error Cone">
            <LayerGroup>

            </LayerGroup>
          </LayersControl.Overlay>
          <LayersControl.Overlay checked name="Points">
            <LayerGroup>
              {
                points.map(point => {
                  console.log(point);
                  const position = [point.geometry.coordinates[1], point.geometry.coordinates[0]];
                  return(
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
          <LayersControl.Overlay name="Track Line">
            <LayerGroup>

            </LayerGroup>
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Storm Radius">
            <LayerGroup>

            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  )
}
