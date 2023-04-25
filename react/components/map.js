import { MapContainer, TileLayer, LayersControl, FeatureGroup, LayerGroup, Marker, Popup } from 'react-leaflet'
import { useMap, useMapEvent, useMapEvents } from 'react-leaflet/hooks'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import "leaflet-defaulticon-compatibility";

import fiona from '../data/forecasts/eccc/FIONA/index.json'

const defaultPosition = [46.9736, -54.69528]; // Mouth of Placentia Bay
const defaultZoom = 5

// function map_ready(){
//   fetch('/api/storm_list').then(res => {
//     res.json().then(data => ({
//       data: data,
//       status: res.status
//     })).then(final_res => {
//       let storm_list = document.getElementsByClassName("storm_list")
//       final_res.data.map(storm => {       
//         console.log(storm)
//       })
//     })
//   })
// }

// const fs = require('fs')

export default function Map (forecasts) {
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

        {/* <LayersControl position="topright">
          <LayersControl.Overlay checked name="ECCC Forecasts">
            <LayerGroup>

            </LayerGroup>
            <FeatureGroup>

            </FeatureGroup>
          </LayersControl.Overlay>
        </LayersControl> */}
      </MapContainer>
    </div>
  )
}

// export default Map
