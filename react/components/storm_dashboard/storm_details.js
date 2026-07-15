import { parseISO, format } from 'date-fns';
import { fetch_value } from "@/lib/storm_utils";
import React from "react";
import StormType from '../Storm_popup/Storm_type';
import StormCategory from '../Storm_popup/storm_category';
import StormPressure from '../Storm_popup/storm_pressure';
import { getStormCategory } from './utils';



export function StormSummaryText({storm_point_hover}){
  if (Object.keys(storm_point_hover.properties).length == 0) {
          return (<></>);
      }

      const fallbackValue = "NO DATA";
  

      const TIMESTAMP = format(parseISO(fetch_value(storm_point_hover, ["TIMESTAMP", "ISO_TIME"])), 'PP pp X');
      
      const STORMTYPE = fetch_value(storm_point_hover, ["STORMTYPE", "NATURE"]) || fallbackValue;
      const STORMFORCE = fetch_value(storm_point_hover, ["STORMFORCE", "USA_SSHS"]) || "";
      const MAXWIND = fetch_value(storm_point_hover, ["MAXWIND", "WMO_WIND", "USA_WIND"]) || fallbackValue;
      const MINPRESS = fetch_value(storm_point_hover, ["MSLP", "WMO_PRES", "USA_PRES"]) || fallbackValue;
      const STORMSTATUS = storm_point_hover.properties.TCDVLP || fallbackValue;
      const STORMCAT = getStormCategory(storm_point_hover) || "";
  
  
  
      return (
          
          <div
          sx={{
              padding: 2,
              fontSize: { xs: '12px', sm: '12px', md: '16px', lg: '16px' }, // Adjust font size for different screen widths
              marginTop:  { xs: '35%', sm: '18%', md: '15%', lg: '11%' } , // Adjust margin-top for different screen widths
              
              bottom: {sm: '7%', md: '10%', lg: '10%'}
  
            }}>
             
                    {//<StormType STORMTYPE={STORMTYPE}/>
                    }
                  <div><strong>Storm Status:</strong> {STORMSTATUS}</div>
                  <StormCategory STORMCAT={STORMCAT} />
                  <div><strong>Timestamp:</strong> {TIMESTAMP}</div>
                  <div><strong>Lat/Long:</strong> {storm_point_hover.properties.LAT}&deg; N, {storm_point_hover.properties.LON}&deg; W</div>
                  <div><strong>Max Windspeed:</strong> {MAXWIND} knots ({(MAXWIND * 1.84).toFixed(2)} km/h)</div>
                  <StormPressure STORMPRESSURE={MINPRESS} />
                  {
                      storm_point_hover.properties.ERRCT &&
                      <p><strong>Error radius :</strong> {storm_point_hover.properties.ERRCT} nmi ({(storm_point_hover.properties.ERRCT * 1.852).toFixed(2)} km)</p>
                  }
              
  
          </div>
          
          
      )

  
}
