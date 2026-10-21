import React, { useMemo } from "react";
import L from "leaflet";
import { flip_coords } from "@/lib/storm_utils";
import { Marker, Tooltip } from "react-leaflet";
import { mapActions } from "@/components/mapReducer";
import { basePath } from "@/next.config";

// Icons are created once. A new icon object on every render makes react-leaflet call
// marker.setIcon(), which rebuilds the marker's DOM element (visible flicker on every hover).
// Red = selected station, blue = all others.
// iconRetinaUrl must be set too: on HiDPI screens Leaflet uses iconRetinaUrl instead of iconUrl,
// and leaflet-defaulticon-compatibility fills any missing option from its CSS (the *blue* 2x image).
// Images: public/markers/ (from pointhi/leaflet-color-markers, BSD-2-Clause, see THIRD_PARTY_NOTICES.md).
const redIcon = new L.Icon.Default({
  iconUrl: `${basePath}/markers/marker-icon-red.png`,
  iconRetinaUrl: `${basePath}/markers/marker-icon-2x-red.png`,
})
const blueIcon = new L.Icon.Default()

/**
 *
 * @param {string} station_name Station name (key of the station data object)
 * @param {Object} station_values Station feature retrieved from WFS and processed. See readme for format
 * @param {boolean} isSelected Whether this station is the one open in the station dashboard
 * @returns StationMarker JavaScript snippet
 */
function StationMarker({ station_name, station_values, isSelected, dispatch }) {
  const display_name = station_values?.properties?.dataset_title
  const station = station_values?.properties?.station || ""

  // Stable position: a new [lat, lon] array on every render makes react-leaflet call setLatLng(),
  // and MarkerClusterGroup handles that "move" by removing and re-adding the marker.
  const coordinates = station_values?.geometry?.coordinates
  const position = useMemo(() => flip_coords(coordinates), [coordinates])

  const eventHandlers = useMemo(() => ({
    click: () => {
      dispatch(mapActions.selectStationAndOpenDashboard([station_name, station_values]));
    }
  }), [dispatch, station_name, station_values])

  return (
    <Marker
      position={position}
      icon={isSelected ? redIcon : blueIcon}
      eventHandlers={eventHandlers}
    >
      <Tooltip>
        <h4>{display_name}</h4>
        <h6>{station}</h6>
      </Tooltip>
    </Marker>
  )
}

// Only re-render when this marker's own props change (not on every storm hover).
export default React.memo(StationMarker)
