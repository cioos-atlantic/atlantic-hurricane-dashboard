// import * as geolib from 'geolib';
import { parseISO , format } from 'date-fns';
import {populateStormDetails, get_storm_basin, flip_coords, bounds_to_array} from '@/lib/storm_utils'
// import styles from './active_storm_list.module.css'

/**
 * Formats a set of geographic coordinates into a human-readable format.
 * sample output // Output: <28.21°N 80.61°W>
 */
function formatCoordinates(coordinates){
    const lat_dir = coordinates[1] > 0 ? "N" : "S";
    const lon_dir = coordinates[0] > 0 ? "E" : "W";

    return (
        <>{Math.abs(coordinates[1])}&deg;{lat_dir} {Math.abs(coordinates[0])}&deg;{lon_dir}</>
    );
}


/**
 * Flys the map to the bounding box of a storm's track.
 */
export function flyToPoint(storm_data, map, Leaflet){

    const first_point = flip_coords(storm_data.data[0].geometry.coordinates);
    const last_point = flip_coords(storm_data.data.splice(-1)[0].geometry.coordinates);

    const storm_bb = Leaflet.latLngBounds(first_point, last_point);
    map.flyToBounds(storm_bb);
}


/**
 * A React functional component that represents a single storm in the list.
 *
 * @returns {JSX.Element} - The JSX representation of the StormListItem component.
 */
export default function StormListItem({ storm_name, storm_data, setSelectedStorm, setStormPoints, is_selected, map, Leaflet, setSelectedStation }) {
    const date_time_format_min = "MMMM do, yyyy";
    const date_time_format_full = "MMM do, yyyy h:mm a X";
    const first_point = storm_data.data[0];
    const last_point = storm_data.data.slice(-1)[0];
    const first_report = format(parseISO(first_point.properties.ISO_TIME), date_time_format_min);
    const last_report = format(parseISO(last_point.properties.ISO_TIME), date_time_format_min)
    const first_report_full = format(parseISO(first_point.properties.ISO_TIME), date_time_format_full);
    const last_report_full = format(parseISO(last_point.properties.ISO_TIME), date_time_format_full)

    // const map = useMap();

    // map.flyToBounds()

    const selected = (is_selected) ? "selected_storm" : "";
    const storm_basin = get_storm_basin(last_point);
    return (
        <div 
            className={"storm_card " + selected }
            onClick={(e) => { 
                populateStormDetails(e, storm_data, setSelectedStorm, setStormPoints, setSelectedStation);
                flyToPoint(storm_data, map, Leaflet);
            }}
        >
            <h3>{storm_name}</h3>
            <div><strong>Current Position:</strong> {formatCoordinates(last_point.geometry.coordinates)}</div>
            <div><strong>Basin:</strong> {storm_basin.BASIN} {storm_basin.SUBBASIN}</div>
            <div><strong>First Report:</strong> <span title={first_report_full}>{first_report}</span></div>
            <div><strong>Last Report:</strong> <span title={last_report_full}>{last_report}</span></div>
        </div>
    );
}