import station_data_format from "../utils/station_data_format";

import ibtracs_historical_storms_fiona from "./ibtracs_historical_storms_fiona.json";
import erddap_historical_cache_fiona from "./erddap_historical_cache_fiona.json"; 


export function tour_station_data() {
  console.log(erddap_historical_cache_fiona)
 const station_data = station_data_format(erddap_historical_cache_fiona['features'], "")
 console.log(station_data)
 return station_data
}

export function tour_storm_data() {
   console.log(ibtracs_historical_storms_fiona)
 const storm_data = {
  ib_data: ibtracs_historical_storms_fiona
};
 return storm_data
}