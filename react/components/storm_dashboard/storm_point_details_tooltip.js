import { parseISO, format } from 'date-fns';
import { fetch_value } from "@/lib/storm_utils";
import React from "react";
import { storm_type_info } from "@/lib/storm_class";
import { getStormCategory } from './utils';
import { storm_cat } from '@/lib/storm_cat';






/**
 * This function displays detailed information about a storm point on a map.
 * It takes in two parameters:
 * @param {Object} storm_point_hover - An object representing the storm point data.
 * @param {Function} onClose - A function to be called when the close button is clicked.
 * 
 * The function first checks if the storm point data is empty. If it is, it returns an empty JSX element.
 * Then, it extracts relevant information from the storm point data using the `fetch_value` function.
 * The extracted information includes the timestamp, storm name, storm type, storm force, maximum wind speed, and minimum pressure.
 * 
 * The function then renders the storm point details in a JSX format, including the extracted information and any additional details.
 */
export default function StormPointDetailsTooltip({ storm_point_hover }) {
    // If properties has no items, it's an empty storm_point_hover object and should return
    // immediately
    if (Object.keys(storm_point_hover.properties).length == 0) {
        return (<></>);
    }

    // ECCC and IBTRACS have multiple ways to define a storm type, some overlap and others are unique


    // ****************
    // Disabled this use of useMediaQuery because it was causing the following 
    // linting error:
    //      Error: React Hook "useMediaQuery" is called conditionally. React 
    //             Hooks must be called in the exact same order in every 
    //             component render.  react-hooks/rules-of-hooks
    // const isExtraSmall = useMediaQuery("(max-width:600px)");

    // ECCC and IBTRACS use different names for the same kinds of information.  Sometimes, within IBTRACS, several different fields may possibly contain the appropriate value
    // ECCC uses TIMESTAMP and IBTRACS uses ISO_TIME
    const fallbackValue = "NO DATA";
    const TIMESTAMP = format(parseISO(fetch_value(storm_point_hover, ["TIMESTAMP", "ISO_TIME"])), 'PP p');
    const STORMNAME = fetch_value(storm_point_hover, ["STORMNAME", "NAME"]) || fallbackValue;
    const STORMTYPE = fetch_value(storm_point_hover, ["STORMTYPE", "NATURE"]) || fallbackValue;
    const STORMFORCE = fetch_value(storm_point_hover, ["STORMFORCE", "USA_SSHS"]) || fallbackValue;
    const MAXWIND = fetch_value(storm_point_hover, ["MAXWIND", "WMO_WIND", "USA_WIND"]) || fallbackValue;
    const MINPRESS = fetch_value(storm_point_hover, ["MSLP", "WMO_PRES", "USA_PRES"]) || fallbackValue;
    const STORMCAT = getStormCategory(storm_point_hover) || "";



    return (

         <div >
            <div><strong>{STORMNAME}</strong></div>       
                <div><strong>Category:</strong> {storm_cat[STORMCAT]?.name?.en || STORMCAT}</div>
                 <div><strong>Max Windspeed:</strong> {MAXWIND} knots ({(MAXWIND * 1.84).toFixed(2)} km/h)</div>
                <div><strong>Timestamp:</strong> {TIMESTAMP}</div>
                <em>Click for more details</em>
                
                

                
            
        </div>
        
        
    )
}


