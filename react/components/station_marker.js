import React, { useState, useMemo } from "react";
import { flip_coords } from "@/lib/storm_utils";
import { Marker, Tooltip, Popup, Icon } from "react-leaflet";
import { getDisplayName } from "./utils/station_data_format_util";

/**
 * 
 * @param {[Object]} station_data Station Data object after being retrieved from WFS and processed. 
 * First element is station name, second element is a dictionary of station data. See readme for format
 * @param {Date} time Time of the station data to retrieve. Defaults to most recent data if not provided
 * @returns StationMarker JavaScript snippet
 */
export default function StationMarker({station_data, time = new Date(), selected_station, dispatch}) {
  // Turns selected marker red, others return as blue
  function getMarkerIcon(selected_station, station_name) {
    try {
      if (station_name === selected_station[0]) {
        return redIcon
      }
      else {
        return blueIcon
      }
    } catch (error) {
      return blueIcon
    }
  }

  //Check if selected var contains any of the following
  //wind_speed, temperature, sea_surface_wave, air_pressure

  const station_name = station_data[0]
  const station_values = station_data[1]
  // Change to call from ERDDAP
  const display_name = station_values?.properties?.dataset_title
  const station = station_values?.properties?.station || ""

  // Data for station doesn't exist at the provided time
  const redIcon = new L.Icon.Default({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/refs/heads/master/img/marker-icon-2x-red.png'
  })

  const blueIcon = new L.Icon.Default()

  return (
    <Marker
      key={station_name}
      position={flip_coords(station_values?.geometry?.coordinates)}
      icon={getMarkerIcon(selected_station, station_name)}
      eventHandlers={{
        click: (e) => {
          dispatch({
            type: 'SET_SELECTED_STATION_AND_OPEN_DASHBOARD',
            payload: station_data,
          });
          
        }
      }}
    >
      <Tooltip>
        <h4>{display_name}</h4>
        <h6>{station}</h6>
      </Tooltip>
    </Marker>
  )
}