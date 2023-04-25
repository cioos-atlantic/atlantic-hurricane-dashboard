import { MapContainer, TileLayer, LayersControl, FeatureGroup, LayerGroup, Marker, Popup } from 'react-leaflet'
import { useMap, useMapEvent, useMapEvents } from 'react-leaflet/hooks'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import "leaflet-defaulticon-compatibility";

const defaultPosition = [46.9736, -54.69528]; // Mouth of Placentia Bay
const defaultZoom = 5

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
          <LayersControl.Overlay name="Points">
            <LayerGroup>

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
